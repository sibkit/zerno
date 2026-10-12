//! Поля шума: периодические решётки, октавы, искажение домена, Ворлей, зерно.
//!
//! Главный инвариант — точная стыковка: каждое поле строится на решётке, у
//! которой число ячеек на плитку целое. Координата выборки `x = X · cells / W`
//! при `X = W` равна ровно `cells`, то есть периоду решётки, поэтому левый
//! край тождественно равен правому, верхний — нижнему.
//!
//! Арифметика дословно повторяет эталон (tests/reference/*.js): значения
//! хранятся в `f32`, промежуточные вычисления в `f64`, порядок операций тот же.

use crate::doc::{Noise, NoiseType, WorleyMode};
use rayon::prelude::*;
use std::sync::OnceLock;

/// Ячейка решётки мельче 2 px вырождается: у Перлина при ровно 1 px значение
/// в узлах тождественно ноль. Это предел и для базы, и для октав.
pub const MIN_CELL_PX: usize = 2;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FieldError {
    /// Размер пятна меньше MIN_CELL_PX у типа, которому нужна решётка.
    DegenerateCell,
    OutOfMemory,
}

pub struct Field {
    pub data: Vec<f32>,
    pub min: f64,
    pub max: f64,
    /// Канонический диапазон типа — используется при выключенной нормализации.
    pub cmin: f64,
    pub cmax: f64,
    pub octaves_used: u32,
}

// ============================ хэш и решётки ============================

#[inline]
pub fn hash2i(x: i32, y: i32, seed: i32) -> u32 {
    let mut h = (x as u32).wrapping_mul(0x27d4eb2d) ^ (y as u32).wrapping_mul(0x165667b1) ^ (seed as u32).wrapping_mul(0x9e3779b1);
    h ^= h >> 15;
    h = h.wrapping_mul(0x85ebca6b);
    h ^= h >> 13;
    h = h.wrapping_mul(0xc2b2ae35);
    h ^= h >> 16;
    h
}

const GRAD_N: usize = 256;

struct GradTables {
    cos: [f32; GRAD_N],
    sin: [f32; GRAD_N],
}

fn grad_tables() -> &'static GradTables {
    static T: OnceLock<GradTables> = OnceLock::new();
    T.get_or_init(|| {
        let mut t = GradTables { cos: [0.0; GRAD_N], sin: [0.0; GRAD_N] };
        for i in 0..GRAD_N {
            let a = i as f64 * 2.0 * std::f64::consts::PI / GRAD_N as f64;
            t.cos[i] = a.cos() as f32;
            t.sin[i] = a.sin() as f32;
        }
        t
    })
}

#[inline]
fn fade(t: f64) -> f64 {
    t * t * t * (t * (t * 6.0 - 15.0) + 10.0)
}

/// Буфер без молчаливого падения процесса: нехватка памяти — обычная ошибка.
fn alloc_f32(n: usize) -> Result<Vec<f32>, FieldError> {
    let mut v = Vec::new();
    v.try_reserve_exact(n).map_err(|_| FieldError::OutOfMemory)?;
    v.resize(n, 0.0);
    Ok(v)
}

struct LatticeGrad {
    gx: Vec<f32>,
    gy: Vec<f32>,
    px: usize,
    py: usize,
}

fn lattice_grad(px: usize, py: usize, seed: i32) -> Result<LatticeGrad, FieldError> {
    let t = grad_tables();
    let mut gx = alloc_f32(px * py)?;
    let mut gy = alloc_f32(px * py)?;
    for j in 0..py {
        let r = j * px;
        for i in 0..px {
            let h = hash2i(i as i32, j as i32, seed) as usize & (GRAD_N - 1);
            gx[r + i] = t.cos[h];
            gy[r + i] = t.sin[h];
        }
    }
    Ok(LatticeGrad { gx, gy, px, py })
}

struct LatticeVal {
    v: Vec<f32>,
    px: usize,
    py: usize,
}

fn lattice_val(px: usize, py: usize, seed: i32) -> Result<LatticeVal, FieldError> {
    let mut v = alloc_f32(px * py)?;
    for j in 0..py {
        let r = j * px;
        for i in 0..px {
            let h = hash2i(i as i32, j as i32, seed);
            v[r + i] = ((h >> 8) as f64 / 16777216.0 * 2.0 - 1.0) as f32;
        }
    }
    Ok(LatticeVal { v, px, py })
}

/// Приведение к периоду без деления в типичном случае: без искажения домена
/// координата всегда лежит внутри [0, p), и деление не нужно вовсе.
#[inline]
fn wrap_i(m: i64, p: i64) -> i64 {
    if m >= 0 && m < p {
        return m;
    }
    let r = m % p;
    if r < 0 { r + p } else { r }
}

struct Wrapped {
    lo: usize,
    hi: usize,
    f: f64,
}

#[inline]
fn wrap_idx(v: f64, p: usize) -> Wrapped {
    let fl = v.floor();
    let lo = wrap_i(fl as i64, p as i64) as usize;
    let hi = if lo + 1 == p { 0 } else { lo + 1 };
    Wrapped { lo, hi, f: v - fl }
}

#[inline]
fn perlin_sample(l: &LatticeGrad, x: f64, y: f64) -> f64 {
    let wx = wrap_idx(x, l.px);
    let wy = wrap_idx(y, l.py);
    let u = fade(wx.f);
    let v = fade(wy.f);
    let r0 = wy.lo * l.px;
    let r1 = wy.hi * l.px;
    let (fx, fy) = (wx.f, wy.f);
    let n00 = l.gx[r0 + wx.lo] as f64 * fx + l.gy[r0 + wx.lo] as f64 * fy;
    let n10 = l.gx[r0 + wx.hi] as f64 * (fx - 1.0) + l.gy[r0 + wx.hi] as f64 * fy;
    let n01 = l.gx[r1 + wx.lo] as f64 * fx + l.gy[r1 + wx.lo] as f64 * (fy - 1.0);
    let n11 = l.gx[r1 + wx.hi] as f64 * (fx - 1.0) + l.gy[r1 + wx.hi] as f64 * (fy - 1.0);
    let a = n00 + u * (n10 - n00);
    let b = n01 + u * (n11 - n01);
    a + v * (b - a)
}

#[inline]
fn value_sample(l: &LatticeVal, x: f64, y: f64) -> f64 {
    let wx = wrap_idx(x, l.px);
    let wy = wrap_idx(y, l.py);
    let u = fade(wx.f);
    let v = fade(wy.f);
    let r0 = wy.lo * l.px;
    let r1 = wy.hi * l.px;
    let a = l.v[r0 + wx.lo] as f64 + u * (l.v[r0 + wx.hi] as f64 - l.v[r0 + wx.lo] as f64);
    let b = l.v[r1 + wx.lo] as f64 + u * (l.v[r1 + wx.hi] as f64 - l.v[r1 + wx.lo] as f64);
    a + v * (b - a)
}

struct WorleyPts {
    px: Vec<f32>,
    py: Vec<f32>,
    cx: usize,
    cy: usize,
}

fn worley_points(cx: usize, cy: usize, seed: i32, jitter: f64) -> Result<WorleyPts, FieldError> {
    let mut px = alloc_f32(cx * cy)?;
    let mut py = alloc_f32(cx * cy)?;
    let seed2 = seed ^ 0x9e3779b9u32 as i32;
    for j in 0..cy {
        let r = j * cx;
        for i in 0..cx {
            let h1 = hash2i(i as i32, j as i32, seed);
            let h2 = hash2i(i as i32, j as i32, seed2);
            px[r + i] = (i as f64 + 0.5 + jitter * ((h1 >> 8) as f64 / 16777216.0 - 0.5)) as f32;
            py[r + i] = (j as f64 + 0.5 + jitter * ((h2 >> 8) as f64 / 16777216.0 - 0.5)) as f32;
        }
    }
    Ok(WorleyPts { px, py, cx, cy })
}

#[inline]
fn worley_sample(p: &WorleyPts, x: f64, y: f64, mode: WorleyMode) -> f64 {
    let ci = x.floor() as i64;
    let cj = y.floor() as i64;
    let (cxi, cyi) = (p.cx as i64, p.cy as i64);
    let mut d1 = 1e30;
    let mut d2 = 1e30;
    for dj in -1..=1i64 {
        let jj = cj + dj;
        let jw = wrap_i(jj, cyi);
        let off_j = (jj - jw) as f64;
        let r = jw as usize * p.cx;
        for di in -1..=1i64 {
            let ii = ci + di;
            let iw = wrap_i(ii, cxi);
            let idx = r + iw as usize;
            let dx = p.px[idx] as f64 + (ii - iw) as f64 - x;
            let dy = p.py[idx] as f64 + off_j - y;
            let d = dx * dx + dy * dy;
            if d < d1 {
                d2 = d1;
                d1 = d;
            } else if d < d2 {
                d2 = d;
            }
        }
    }
    match mode {
        WorleyMode::F1 => d1.sqrt(),
        WorleyMode::F2 => d2.sqrt(),
        WorleyMode::F2F1 => d2.sqrt() - d1.sqrt(),
    }
}

// ============================ параллельные полосы ============================

/// Минимум строк на поток: мельче дробить дороже, чем считать.
const MIN_ROWS: usize = 24;

fn rows_per_lane(h: usize) -> usize {
    let lanes = rayon::current_num_threads().min((h / MIN_ROWS).max(1));
    h.div_ceil(lanes.max(1))
}

/// Обрабатывает буфер `w×h` полосами строк параллельно: `f(y0, полоса)`.
fn par_rows<T: Send>(buf: &mut [T], w: usize, h: usize, f: impl Fn(usize, &mut [T]) + Sync + Send) {
    let per = rows_per_lane(h);
    if per >= h {
        f(0, buf);
        return;
    }
    buf.par_chunks_mut(per * w).enumerate().for_each(|(i, c)| f(i * per, c));
}

// ============================ размытие для ВЧ-фильтра ============================

/// Круговое (заворачивающееся) размытие «коробкой» по строкам — сохраняет стыковку.
fn blur_h_rows(src: &[f32], dst: &mut [f32], w: usize, y0: usize, r: usize) {
    let win = (2 * r + 1) as f64;
    let (wi, ri) = (w as i64, r as i64);
    for (yy, drow) in dst.chunks_mut(w).enumerate() {
        let o = (y0 + yy) * w;
        let mut sum = 0.0f64;
        for k in -ri..=ri {
            sum += src[o + wrap_i(k, wi) as usize] as f64;
        }
        for x in 0..w {
            drow[x] = (sum / win) as f32;
            let xi = x as i64;
            let a = wrap_i(xi - ri, wi) as usize;
            let b = wrap_i(xi + ri + 1, wi) as usize;
            sum += src[o + b] as f64 - src[o + a] as f64;
        }
    }
}

/// То же по столбцам. Полоса строк [y0, y0+n) считает свои суммы по всем
/// столбцам сразу, поэтому полосы независимы и пишут только в свою память.
fn blur_v_rows(src: &[f32], dst: &mut [f32], w: usize, h: usize, y0: usize, r: usize, sum: &mut [f64]) {
    let win = (2 * r + 1) as f64;
    let (hi, ri) = (h as i64, r as i64);
    sum.fill(0.0);
    for k in -ri..=ri {
        let row = wrap_i(y0 as i64 + k, hi) as usize * w;
        for x in 0..w {
            sum[x] += src[row + x] as f64;
        }
    }
    for (yy, drow) in dst.chunks_mut(w).enumerate() {
        let y = (y0 + yy) as i64;
        for x in 0..w {
            drow[x] = (sum[x] / win) as f32;
        }
        let a = wrap_i(y - ri, hi) as usize * w;
        let b = wrap_i(y + ri + 1, hi) as usize * w;
        for x in 0..w {
            sum[x] += src[b + x] as f64 - src[a + x] as f64;
        }
    }
}

// ============================ построение поля ============================

fn round_usize(v: f64) -> usize {
    if v <= 0.0 { 0 } else { v.round() as usize }
}

/// Число ячеек базовой октавы. Сверху ограничено физикой: ячейка ≥ 2 px.
pub fn base_cells(n: &Noise, w: usize, h: usize) -> [usize; 2] {
    let lim_w = (w / MIN_CELL_PX).max(1);
    let lim_h = (h / MIN_CELL_PX).max(1);
    [
        lim_w.min(round_usize(w as f64 / n.size_x)).max(1),
        lim_h.min(round_usize(h as f64 / n.size_y)).max(1),
    ]
}

pub fn max_octaves_for(n: &Noise, w: usize, h: usize) -> u32 {
    let [cx, cy] = base_cells(n, w, h);
    let mut o: u32 = 1;
    while o < 12 {
        let f = (n.lacunarity as f64).powi(o as i32);
        let cw = cx as f64 * f * MIN_CELL_PX as f64;
        let ch = cy as f64 * f * MIN_CELL_PX as f64;
        if cw > w as f64 || ch > h as f64 {
            break;
        }
        o += 1;
    }
    o
}

/// Нормировка и поиск диапазона одним параллельным проходом.
fn finish(mut out: Vec<f32>, w: usize, h: usize, inv: f64, cmin: f64, cmax: f64, octaves_used: u32) -> Field {
    let per = rows_per_lane(h);
    let fold = |c: &mut [f32]| {
        let (mut mn, mut mx) = (f64::INFINITY, f64::NEG_INFINITY);
        for v in c.iter_mut() {
            if inv != 1.0 {
                *v = (*v as f64 * inv) as f32;
            }
            let d = *v as f64;
            if d < mn {
                mn = d;
            }
            if d > mx {
                mx = d;
            }
        }
        (mn, mx)
    };
    let (min, max) = out
        .par_chunks_mut(per * w)
        .map(fold)
        .reduce(|| (f64::INFINITY, f64::NEG_INFINITY), |a, b| (a.0.min(b.0), a.1.max(b.1)));
    Field { data: out, min, max, cmin, cmax, octaves_used }
}

fn build_grain(n: &Noise, w: usize, h: usize) -> Result<Field, FieldError> {
    let mut out = alloc_f32(w * h)?;
    let bx = w.min(round_usize(w as f64 / n.size_x).max(1));
    let by = h.min(round_usize(h as f64 / n.size_y).max(1));
    let seed = n.seed;
    par_rows(&mut out, w, h, |y0, band| {
        for (yy, row) in band.chunks_mut(w).enumerate() {
            let j = ((y0 + yy) * by) / h;
            for (x, v) in row.iter_mut().enumerate() {
                let i = (x * bx) / w;
                *v = ((hash2i(i as i32, j as i32, seed) >> 8) as f64 / 16777216.0) as f32;
            }
        }
    });

    if n.grain_hp > 0 {
        let r = n.grain_hp as usize;
        let mut t1 = alloc_f32(w * h)?;
        let mut t2 = alloc_f32(w * h)?;
        par_rows(&mut t1, w, h, |y0, band| blur_h_rows(&out, band, w, y0, r));
        par_rows(&mut t2, w, h, |y0, band| {
            let mut sum = vec![0.0f64; w];
            blur_v_rows(&t1, band, w, h, y0, r, &mut sum);
        });
        let per = rows_per_lane(h);
        out.par_chunks_mut(per * w).zip(t2.par_chunks(per * w)).for_each(|(o, b)| {
            for (v, bl) in o.iter_mut().zip(b) {
                *v = (*v as f64 - *bl as f64 + 0.5) as f32;
            }
        });
    }
    Ok(finish(out, w, h, 1.0, 0.0, 1.0, 1))
}

/// Предрасчёт по столбцам: floor, дробная часть и fade от `x` не зависят от строки.
struct Cols {
    lo: Vec<u32>,
    hi: Vec<u32>,
    f: Vec<f64>,
    u: Vec<f64>,
}

impl Cols {
    fn new(w: usize, sx: f64, px: usize) -> Cols {
        let mut c = Cols { lo: Vec::with_capacity(w), hi: Vec::with_capacity(w), f: Vec::with_capacity(w), u: Vec::with_capacity(w) };
        let pxi = px as i64;
        for x in 0..w {
            let xf = x as f64 * sx;
            let fl = xf.floor();
            let fr = xf - fl;
            let lo = wrap_i(fl as i64, pxi);
            c.f.push(fr);
            c.u.push(fade(fr));
            c.lo.push(lo as u32);
            c.hi.push(if lo + 1 == pxi { 0 } else { (lo + 1) as u32 });
        }
        c
    }
}

/// Поле искажения домена (warp): смещения по X и по Y.
struct Warp {
    bx: Vec<f32>,
    by: Vec<f32>,
}

fn build_warp(n: &Noise, w: usize, h: usize) -> Result<Warp, FieldError> {
    let wcx = round_usize(w as f64 / n.warp_size).max(1);
    let wcy = round_usize(h as f64 / n.warp_size).max(1);
    let lx = lattice_grad(wcx, wcy, n.seed ^ 0x51ed270b)?;
    let ly = lattice_grad(wcx, wcy, n.seed ^ 0x2545f491)?;
    let mut bx = alloc_f32(w * h)?;
    let mut by = alloc_f32(w * h)?;
    let sx = wcx as f64 / w as f64;
    let sy = wcy as f64 / h as f64;
    let per = rows_per_lane(h);
    bx.par_chunks_mut(per * w).zip(by.par_chunks_mut(per * w)).enumerate().for_each(|(i, (cx, cy))| {
        let y0 = i * per;
        for (yy, (rx, ry)) in cx.chunks_mut(w).zip(cy.chunks_mut(w)).enumerate() {
            let yv = (y0 + yy) as f64 * sy;
            for x in 0..w {
                let xv = x as f64 * sx;
                rx[x] = (perlin_sample(&lx, xv, yv) * 1.4142136) as f32;
                ry[x] = (perlin_sample(&ly, xv, yv) * 1.4142136) as f32;
            }
        }
    });
    Ok(Warp { bx, by })
}

/// Накопление октавы: первая пишет значение, остальные прибавляют.
#[inline(always)]
fn put<const FIRST: bool>(dst: &mut f32, amp: f64, v: f64) {
    *dst = if FIRST { (amp * v) as f32 } else { (*dst as f64 + amp * v) as f32 };
}

#[inline(always)]
fn ridge<const RIDGED: bool>(v: f64) -> f64 {
    if RIDGED {
        let r = 1.0 - v.abs();
        r * 2.0 - 1.0
    } else {
        v
    }
}

#[inline(always)]
fn put_rt(dst: &mut f32, first: bool, amp: f64, v: f64) {
    if first { put::<true>(dst, amp, v) } else { put::<false>(dst, amp, v) }
}

/// Вызов строки с ветвлениями «первая октава» и «гребни», вынесенными в
/// константы: иначе обе проверки стоят в каждом пикселе горячего цикла.
macro_rules! rows_dispatch {
    ($f:ident, $first:expr, $ridged:expr, $($a:expr),*) => {
        match ($first, $ridged) {
            (true, true) => $f::<true, true>($($a),*),
            (true, false) => $f::<true, false>($($a),*),
            (false, true) => $f::<false, true>($($a),*),
            (false, false) => $f::<false, false>($($a),*),
        }
    };
}

/// Параметры строки с искажением домена.
struct WarpRow<'a> {
    bx: &'a [f32],
    by: &'a [f32],
    sx: f64,
    yf: f64,
    wax: f64,
    way: f64,
    amp: f64,
}

#[inline(always)]
fn warp_perlin_row<const FIRST: bool, const RIDGED: bool>(row: &mut [f32], l: &LatticeGrad, a: &WarpRow) {
    for (x, d) in row.iter_mut().enumerate() {
        let xx = x as f64 * a.sx + a.bx[x] as f64 * a.wax;
        let yv = a.yf + a.by[x] as f64 * a.way;
        put::<FIRST>(d, a.amp, ridge::<RIDGED>(perlin_sample(l, xx, yv) * 1.4142136));
    }
}

#[inline(always)]
fn warp_value_row<const FIRST: bool, const RIDGED: bool>(row: &mut [f32], l: &LatticeVal, a: &WarpRow) {
    for (x, d) in row.iter_mut().enumerate() {
        let xx = x as f64 * a.sx + a.bx[x] as f64 * a.wax;
        let yv = a.yf + a.by[x] as f64 * a.way;
        put::<FIRST>(d, a.amp, ridge::<RIDGED>(value_sample(l, xx, yv)));
    }
}

/// Строка Перлина без искажения домена: floor, дробь и fade по `x` взяты из `cols`.
#[allow(clippy::too_many_arguments)]
#[inline(always)]
fn perlin_row<const FIRST: bool, const RIDGED: bool>(
    row: &mut [f32], l: &LatticeGrad, cols: &Cols, r0: usize, r1: usize, fy: f64, vv: f64, amp: f64,
) {
    let (gx, gy) = (&l.gx[..], &l.gy[..]);
    for (x, d) in row.iter_mut().enumerate() {
        let (ia, ib) = (cols.lo[x] as usize, cols.hi[x] as usize);
        let (fx, u) = (cols.f[x], cols.u[x]);
        let n00 = gx[r0 + ia] as f64 * fx + gy[r0 + ia] as f64 * fy;
        let n10 = gx[r0 + ib] as f64 * (fx - 1.0) + gy[r0 + ib] as f64 * fy;
        let n01 = gx[r1 + ia] as f64 * fx + gy[r1 + ia] as f64 * (fy - 1.0);
        let n11 = gx[r1 + ib] as f64 * (fx - 1.0) + gy[r1 + ib] as f64 * (fy - 1.0);
        let aa = n00 + u * (n10 - n00);
        let bb = n01 + u * (n11 - n01);
        put::<FIRST>(d, amp, ridge::<RIDGED>((aa + vv * (bb - aa)) * 1.4142136));
    }
}

/// Строка Value без искажения домена.
#[allow(clippy::too_many_arguments)]
#[inline(always)]
fn value_row<const FIRST: bool, const RIDGED: bool>(
    row: &mut [f32], l: &LatticeVal, cols: &Cols, r0: usize, r1: usize, _fy: f64, vv: f64, amp: f64,
) {
    let val = &l.v[..];
    for (x, d) in row.iter_mut().enumerate() {
        let (ia, ib) = (cols.lo[x] as usize, cols.hi[x] as usize);
        let u = cols.u[x];
        let aa = val[r0 + ia] as f64 + u * (val[r0 + ib] as f64 - val[r0 + ia] as f64);
        let bb = val[r1 + ia] as f64 + u * (val[r1 + ib] as f64 - val[r1 + ia] as f64);
        // Множитель у Value равен 1 — умножение на него точное, его можно не делать.
        put::<FIRST>(d, amp, ridge::<RIDGED>(aa + vv * (bb - aa)));
    }
}

pub fn build_field(n: &Noise, w: usize, h: usize) -> Result<Field, FieldError> {
    if n.kind == NoiseType::Grain {
        return build_grain(n, w, h);
    }
    if n.size_x < MIN_CELL_PX as f64 || n.size_y < MIN_CELL_PX as f64 {
        return Err(FieldError::DegenerateCell);
    }

    let [cx0, cy0] = base_cells(n, w, h);
    let octaves = if n.kind.has_octaves() { n.octaves.min(max_octaves_for(n, w, h)) } else { 1 };
    let warp = if n.warp_amount > 0.0 { Some(build_warp(n, w, h)?) } else { None };
    let ridged = n.ridged && n.kind.has_ridged();

    let mut out = alloc_f32(w * h)?;
    let mut amp = 1.0f64;
    let mut norm = 0.0f64;

    for o in 0..octaves {
        let f = (n.lacunarity as f64).powi(o as i32).round() as usize;
        let (px, py) = (cx0 * f, cy0 * f);
        let sx = px as f64 / w as f64;
        let sy = py as f64 / h as f64;
        let (wax, way) = (n.warp_amount * sx, n.warp_amount * sy);
        let seed_o = n.seed.wrapping_add((o as i32).wrapping_mul(7919));
        let first = o == 0;

        match n.kind {
            NoiseType::Perlin | NoiseType::Value => {
                let perlin = n.kind == NoiseType::Perlin;
                let lg = if perlin { Some(lattice_grad(px, py, seed_o)?) } else { None };
                let lv = if perlin { None } else { Some(lattice_val(px, py, seed_o)?) };
                if let Some(wp) = &warp {
                    // С искажением домена координата произвольна — общий путь.
                    par_rows(&mut out, w, h, |y0, band| {
                        for (yy, row) in band.chunks_mut(w).enumerate() {
                            let y = y0 + yy;
                            let (bx, by) = (&wp.bx[y * w..(y + 1) * w], &wp.by[y * w..(y + 1) * w]);
                            let a = WarpRow { bx, by, sx, yf: y as f64 * sy, wax, way, amp };
                            match (&lg, &lv) {
                                (Some(l), _) => rows_dispatch!(warp_perlin_row, first, ridged, row, l, &a),
                                (_, Some(l)) => rows_dispatch!(warp_value_row, first, ridged, row, l, &a),
                                _ => unreachable!("решётка построена выше для обоих типов"),
                            }
                        }
                    });
                } else {
                    let cols = Cols::new(w, sx, px);
                    let pyi = py as i64;
                    par_rows(&mut out, w, h, |y0, band| {
                        for (yy, row) in band.chunks_mut(w).enumerate() {
                            let yf = (y0 + yy) as f64 * sy;
                            let fl = yf.floor();
                            let fy = yf - fl;
                            let vv = fade(fy);
                            let jlo = wrap_i(fl as i64, pyi);
                            let jhi = if jlo + 1 == pyi { 0 } else { jlo + 1 };
                            let r0 = jlo as usize * px;
                            let r1 = jhi as usize * px;
                            match (&lg, &lv) {
                                (Some(l), _) => rows_dispatch!(perlin_row, first, ridged, row, l, &cols, r0, r1, fy, vv, amp),
                                (_, Some(l)) => rows_dispatch!(value_row, first, ridged, row, l, &cols, r0, r1, fy, vv, amp),
                                _ => unreachable!("решётка построена выше для обоих типов"),
                            }
                        }
                    });
                }
            }
            NoiseType::Worley => {
                let pts = worley_points(px, py, seed_o, n.worley_jitter)?;
                let mode = n.worley_mode;
                par_rows(&mut out, w, h, |y0, band| {
                    for (yy, row) in band.chunks_mut(w).enumerate() {
                        let y = y0 + yy;
                        let yf = y as f64 * sy;
                        let r = y * w;
                        for (x, d) in row.iter_mut().enumerate() {
                            let (mut xx, mut yv) = (x as f64 * sx, yf);
                            if let Some(wp) = &warp {
                                xx += wp.bx[r + x] as f64 * wax;
                                yv += wp.by[r + x] as f64 * way;
                            }
                            put_rt(d, first, amp, worley_sample(&pts, xx, yv, mode));
                        }
                    }
                });
            }
            NoiseType::Grain => unreachable!("зерно обработано в начале функции"),
        }
        norm += amp;
        amp *= n.gain;
    }

    let signed = matches!(n.kind, NoiseType::Perlin | NoiseType::Value);
    Ok(finish(out, w, h, 1.0 / norm, if signed { -1.0 } else { 0.0 }, 1.0, octaves))
}
