//! Пакетный рендер с кэшем шумовых полей.
//!
//! Пачка задач (главная плитка + миниатюры каналов) считается за один вызов.
//! Ответ — один буфер: `"ZRN1" | u32 число задач | (u32 ширина, u32 высота) × N
//! | пиксели RGBA подряд`, все числа little-endian.

use crate::color::SrLut;
use crate::composite::{build_stop_lut, composite_band};
use crate::doc::{self, Doc, Noise, NoiseType, WorleyMode};
use crate::msg::Msg;
use crate::noise::{build_field, Field, FieldError, MIN_CELL_PX};
use rayon::prelude::*;
use serde_json::Value;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};

pub const MAX_JOBS: usize = 256;
pub const MAX_SIDE: i64 = 4096;
pub const MAX_TOTAL_PX: usize = 64 * 1024 * 1024;

pub struct Job {
    pub doc: Doc,
    pub w: usize,
    pub h: usize,
}

// ============================ кэш полей ============================

/// Ключ — параметры шума без «формы» и цвета плюс размер плитки. Поэтому правка
/// цвета, контраста или режима наложения шум не пересчитывает. Числа с
/// плавающей точкой сравниваются побитно: ключ точный, коллизий нет.
#[derive(Clone, PartialEq, Eq, Hash)]
struct FieldKey {
    kind: NoiseType,
    size_x: u64,
    size_y: u64,
    seed: i32,
    octaves: u32,
    gain: u64,
    lacunarity: u32,
    ridged: bool,
    warp_amount: u64,
    warp_size: u64,
    worley_mode: WorleyMode,
    worley_jitter: u64,
    grain_hp: u32,
    w: usize,
    h: usize,
}

impl FieldKey {
    fn new(n: &Noise, w: usize, h: usize) -> FieldKey {
        FieldKey {
            kind: n.kind,
            size_x: n.size_x.to_bits(),
            size_y: n.size_y.to_bits(),
            seed: n.seed,
            octaves: n.octaves,
            gain: n.gain.to_bits(),
            lacunarity: n.lacunarity,
            ridged: n.ridged,
            warp_amount: n.warp_amount.to_bits(),
            warp_size: n.warp_size.to_bits(),
            worley_mode: n.worley_mode,
            worley_jitter: n.worley_jitter.to_bits(),
            grain_hp: n.grain_hp,
            w,
            h,
        }
    }
}

struct Entry {
    field: Arc<Field>,
    stamp: u64,
}

#[derive(Clone, Copy, Debug, Default)]
pub struct CacheStats {
    pub entries: usize,
    pub bytes: usize,
    pub hits: u64,
    pub misses: u64,
}

struct FieldCache {
    map: HashMap<FieldKey, Entry>,
    bytes: usize,
    limit: usize,
    clock: u64,
    hits: u64,
    misses: u64,
}

impl FieldCache {
    fn get(&mut self, key: &FieldKey) -> Option<Arc<Field>> {
        self.clock += 1;
        match self.map.get_mut(key) {
            Some(e) => {
                self.hits += 1;
                e.stamp = self.clock;
                Some(e.field.clone())
            }
            None => {
                self.misses += 1;
                None
            }
        }
    }

    /// Если другой поток успел положить то же поле раньше — отдаём его.
    fn put(&mut self, key: FieldKey, f: Field) -> Arc<Field> {
        if let Some(e) = self.map.get(&key) {
            return e.field.clone();
        }
        self.clock += 1;
        self.bytes += f.data.len() * size_of::<f32>();
        let field = Arc::new(f);
        self.map.insert(key, Entry { field: field.clone(), stamp: self.clock });
        self.evict();
        field
    }

    /// Вытесняет самые давние записи, которыми никто не пользуется. Ссылки на
    /// поля выдаются только под этой же блокировкой, поэтому счётчик ссылок,
    /// равный единице, точно означает «держит только кэш».
    fn evict(&mut self) {
        while self.bytes > self.limit {
            let victim = self
                .map
                .iter()
                .filter(|(_, e)| Arc::strong_count(&e.field) == 1)
                .min_by_key(|(_, e)| e.stamp)
                .map(|(k, _)| k.clone());
            // Всё занято идущими рендерами — освободится к следующему разу.
            let Some(k) = victim else { return };
            let e = self.map.remove(&k).expect("ключ только что найден в этой же таблице");
            self.bytes -= e.field.data.len() * size_of::<f32>();
        }
    }
}

// ============================ движок ============================

pub struct Engine {
    cache: Mutex<FieldCache>,
    sr: SrLut,
    renders: AtomicU64,
}

impl Engine {
    pub fn new(cache_limit_bytes: usize) -> Engine {
        Engine {
            cache: Mutex::new(FieldCache {
                map: HashMap::new(),
                bytes: 0,
                limit: cache_limit_bytes,
                clock: 0,
                hits: 0,
                misses: 0,
            }),
            sr: SrLut::new(),
            renders: AtomicU64::new(0),
        }
    }

    pub fn threads(&self) -> usize {
        rayon::current_num_threads()
    }

    pub fn renders(&self) -> u64 {
        self.renders.load(Ordering::Relaxed)
    }

    pub fn cache_stats(&self) -> CacheStats {
        let c = self.lock_cache();
        CacheStats { entries: c.map.len(), bytes: c.bytes, hits: c.hits, misses: c.misses }
    }

    fn lock_cache(&self) -> std::sync::MutexGuard<'_, FieldCache> {
        // Отравление значит, что поток упал посреди правки кэша: продолжать
        // с полуобновлённой таблицей нельзя.
        self.cache.lock().expect("кэш полей отравлен паникой в другом потоке")
    }

    fn field(&self, n: &Noise, w: usize, h: usize, channel: &str) -> Result<Arc<Field>, Msg> {
        let key = FieldKey::new(n, w, h);
        if let Some(f) = self.lock_cache().get(&key) {
            return Ok(f);
        }
        // Строим без блокировки: поле считается всеми ядрами, другие запросы
        // тем временем могут брать готовые поля из кэша.
        let f = build_field(n, w, h).map_err(|e| match e {
            // Тип — ключом документа (`perlin` …): название на нужном языке
            // подставит интерфейс.
            FieldError::DegenerateCell => Msg::new("render.degenerate")
                .arg("channel", channel)
                .arg("type", n.kind.key())
                .arg("w", n.size_x)
                .arg("h", n.size_y)
                .arg("min", MIN_CELL_PX),
            FieldError::OutOfMemory => Msg::new("render.fieldOom").arg("channel", channel).arg("w", w).arg("h", h),
        })?;
        Ok(self.lock_cache().put(key, f))
    }

    /// Считает пачку задач и возвращает буфер в формате ZRN1.
    pub fn render(&self, jobs: &[Job]) -> Result<Vec<u8>, Msg> {
        // ---- этап 1: поля. Каждое строится всеми ядрами по полосам строк,
        // поэтому и одна большая плитка, и пачка мелких загружают процессор.
        let mut fields: Vec<Vec<Option<Arc<Field>>>> = Vec::with_capacity(jobs.len());
        let mut luts: Vec<Vec<Vec<f32>>> = Vec::with_capacity(jobs.len());
        for j in jobs {
            let mut fs = Vec::with_capacity(j.doc.channels.len());
            for ch in &j.doc.channels {
                fs.push(if ch.enabled { Some(self.field(&ch.noise, j.w, j.h, &ch.name)?) } else { None });
            }
            fields.push(fs);
            luts.push(j.doc.channels.iter().map(|ch| build_stop_lut(ch, j.doc.stop_mix)).collect());
        }

        // ---- буфер ответа ----
        let header = 8 + jobs.len() * 8;
        let payload: usize = jobs.iter().map(|j| j.w * j.h * 4).sum();
        let mut buf = Vec::new();
        buf.try_reserve_exact(header + payload).map_err(|_| Msg::new("render.bufferOom"))?;
        buf.extend_from_slice(b"ZRN1");
        buf.extend_from_slice(&(jobs.len() as u32).to_le_bytes());
        for j in jobs {
            buf.extend_from_slice(&(j.w as u32).to_le_bytes());
            buf.extend_from_slice(&(j.h as u32).to_le_bytes());
        }
        buf.resize(header + payload, 0);

        // ---- этап 2: композит. Плоский список (задача × полоса строк):
        // по пикселям всё независимо, полосы считаются в любом порядке.
        let want = (rayon::current_num_threads() * 2).max(4);
        let mut bands: Vec<(usize, usize, &mut [u8])> = Vec::new();
        let mut rest = &mut buf[header..];
        for (ji, j) in jobs.iter().enumerate() {
            let (mine, tail) = rest.split_at_mut(j.w * j.h * 4);
            rest = tail;
            let rows = j.h.div_ceil(want).max(16);
            for (bi, band) in mine.chunks_mut(rows * j.w * 4).enumerate() {
                bands.push((ji, bi * rows, band));
            }
        }
        bands.into_par_iter().for_each(|(ji, y0, band)| {
            let j = &jobs[ji];
            let fs: Vec<Option<&Field>> = fields[ji].iter().map(|f| f.as_deref()).collect();
            composite_band(&j.doc, &fs, &luts[ji], &self.sr, band, j.w, y0);
        });

        self.renders.fetch_add(1, Ordering::Relaxed);
        Ok(buf)
    }
}

// ============================ разбор пачки ============================

/// `{"jobs":[{"width","height","doc"}]}` → задачи.
///
/// Форму запроса собирает наш же интерфейс, поэтому её нарушения — ошибки
/// программиста (`Msg::internal`). Ошибка документа задачи уходит как есть,
/// со своим ключом `doc.*` и адресом поля внутри документа.
pub fn parse_jobs(root: &Value) -> Result<Vec<Job>, Msg> {
    let o = root.as_object().ok_or_else(|| Msg::internal("ожидается объект {\"jobs\":[...]}"))?;
    let arr = match o.get("jobs") {
        None => return Err(Msg::internal("запрос.jobs: поле отсутствует (обязательное)")),
        Some(Value::Array(a)) => a,
        Some(_) => return Err(Msg::internal("запрос.jobs: ожидается массив")),
    };
    if arr.is_empty() {
        return Err(Msg::internal("запрос.jobs: пустой список"));
    }
    if arr.len() > MAX_JOBS {
        return Err(Msg::internal(format!("запрос.jobs: больше {MAX_JOBS} задач за раз не принимается")));
    }
    let mut jobs = Vec::with_capacity(arr.len());
    let mut total = 0usize;
    for (i, jv) in arr.iter().enumerate() {
        let path = format!("запрос.jobs[{i}]");
        let jo = jv.as_object().ok_or_else(|| Msg::internal(format!("{path}: ожидается объект")))?;
        let side = |key: &str| -> Result<i64, Msg> {
            match jo.get(key) {
                None => Err(Msg::internal(format!("{path}.{key}: поле отсутствует"))),
                Some(v) => v.as_i64().ok_or_else(|| Msg::internal(format!("{path}.{key}: ожидается целое число"))),
            }
        };
        let (w, h) = (side("width")?, side("height")?);
        if !(1..=MAX_SIDE).contains(&w) || !(1..=MAX_SIDE).contains(&h) {
            return Err(Msg::internal(format!("{path}: размер {w}×{h} вне диапазона [1; {MAX_SIDE}]")));
        }
        let dv = jo.get("doc").ok_or_else(|| Msg::internal(format!("{path}.doc: поле отсутствует")))?;
        let d = doc::parse(dv)?;
        total += (w * h) as usize;
        jobs.push(Job { doc: d, w: w as usize, h: h as usize });
    }
    if total > MAX_TOTAL_PX {
        return Err(Msg::new("render.tooLarge"));
    }
    Ok(jobs)
}
