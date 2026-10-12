//! Модель документа и строгий разбор JSON.
//!
//! Правило то же, что в интерфейсе (ui/js/doc.js): никаких молчаливых
//! умолчаний. Отсутствующее поле, лишнее поле, неверный тип или значение вне
//! диапазона — ошибка с точным адресом. Порядок проверок и тексты сообщений
//! совпадают с JS дословно: одна и та же ошибка выглядит одинаково, где бы её
//! ни нашли.

use serde_json::{Map, Value};

pub const FORMAT: &str = "zerno-noise-tile";
pub const VERSION: i64 = 1;

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Color {
    pub h: f64,
    pub s: f64,
    pub l: f64,
    pub a: f64,
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Shape {
    pub contrast: f64,
    pub bias: f64,
    pub gamma: f64,
    pub invert: bool,
    pub normalize: bool,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum NoiseType {
    Perlin,
    Value,
    Worley,
    Grain,
}

impl NoiseType {
    pub const TABLE: &[(&str, NoiseType)] = &[
        ("perlin", NoiseType::Perlin),
        ("value", NoiseType::Value),
        ("worley", NoiseType::Worley),
        ("grain", NoiseType::Grain),
    ];
    pub fn has_octaves(self) -> bool {
        self != NoiseType::Grain
    }
    pub fn has_ridged(self) -> bool {
        matches!(self, NoiseType::Perlin | NoiseType::Value)
    }
    pub fn label(self) -> &'static str {
        match self {
            NoiseType::Perlin => "Перлин — облака",
            NoiseType::Value => "Value — мягкий",
            NoiseType::Worley => "Ворлей — пятна",
            NoiseType::Grain => "Зерно — плёнка",
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum WorleyMode {
    F1,
    F2,
    F2F1,
}

impl WorleyMode {
    pub const TABLE: &[(&str, WorleyMode)] = &[("f1", WorleyMode::F1), ("f2", WorleyMode::F2), ("f2f1", WorleyMode::F2F1)];
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Noise {
    pub kind: NoiseType,
    pub size_x: f64,
    pub size_y: f64,
    pub seed: i32,
    pub octaves: u32,
    pub gain: f64,
    pub lacunarity: u32,
    pub ridged: bool,
    pub warp_amount: f64,
    pub warp_size: f64,
    pub worley_mode: WorleyMode,
    pub worley_jitter: f64,
    pub grain_hp: u32,
    pub shape: Shape,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Blend {
    Normal,
    Multiply,
    Screen,
    Overlay,
    HardLight,
    SoftLight,
    Add,
    Subtract,
    Darken,
    Lighten,
    Difference,
}

impl Blend {
    pub const TABLE: &[(&str, Blend)] = &[
        ("normal", Blend::Normal),
        ("multiply", Blend::Multiply),
        ("screen", Blend::Screen),
        ("overlay", Blend::Overlay),
        ("hard-light", Blend::HardLight),
        ("soft-light", Blend::SoftLight),
        ("add", Blend::Add),
        ("subtract", Blend::Subtract),
        ("darken", Blend::Darken),
        ("lighten", Blend::Lighten),
        ("difference", Blend::Difference),
    ];
}

#[derive(Clone, Debug, PartialEq)]
pub struct Channel {
    pub name: String,
    pub enabled: bool,
    pub blend: Blend,
    pub opacity: f64,
    pub noise: Noise,
    pub low: Color,
    pub high: Color,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum StopMix {
    Oklab,
    SrgbLinear,
}

impl StopMix {
    pub const TABLE: &[(&str, StopMix)] = &[("oklab", StopMix::Oklab), ("srgb-linear", StopMix::SrgbLinear)];
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum DitherMode {
    Tpdf,
    Ordered,
    Off,
}

impl DitherMode {
    pub const TABLE: &[(&str, DitherMode)] =
        &[("tpdf", DitherMode::Tpdf), ("ordered", DitherMode::Ordered), ("off", DitherMode::Off)];
}

#[derive(Clone, Debug, PartialEq)]
pub struct Doc {
    pub name: String,
    pub tile_w: u32,
    pub tile_h: u32,
    pub stop_mix: StopMix,
    pub dither_mode: DitherMode,
    pub dither_amount: f64,
    pub webp_quality: f64,
    pub background: Color,
    pub channels: Vec<Channel>,
}

// ============================ проверки ============================

type R<T> = Result<T, String>;

fn js_type(v: &Value) -> &'static str {
    match v {
        Value::Null => "null",
        Value::Bool(_) => "boolean",
        Value::Number(_) => "number",
        Value::String(_) => "string",
        Value::Array(_) => "массив",
        Value::Object(_) => "object",
    }
}

fn v_obj<'a>(v: &'a Value, path: &str) -> R<&'a Map<String, Value>> {
    match v {
        Value::Object(o) => Ok(o),
        _ => Err(format!("{path}: ожидается объект, получено {}", js_type(v))),
    }
}

fn v_has<'a>(o: &'a Map<String, Value>, path: &str, key: &str) -> R<&'a Value> {
    o.get(key).ok_or_else(|| format!("{path}.{key}: поле отсутствует (обязательное)"))
}

fn v_num(o: &Map<String, Value>, path: &str, key: &str, min: f64, max: f64) -> R<f64> {
    let v = v_has(o, path, key)?;
    let n = match v {
        Value::Number(n) => n.as_f64(),
        _ => None,
    }
    .filter(|n| n.is_finite())
    .ok_or_else(|| format!("{path}.{key}: ожидается число, получено {}", js_type(v)))?;
    if n < min || n > max {
        return Err(format!("{path}.{key}: значение {n} вне диапазона [{min}; {max}]"));
    }
    Ok(n)
}

fn v_int(o: &Map<String, Value>, path: &str, key: &str, min: f64, max: f64) -> R<i64> {
    let n = v_num(o, path, key, min, max)?;
    if n.floor() != n {
        return Err(format!("{path}.{key}: ожидается целое число, получено {n}"));
    }
    Ok(n as i64)
}

fn v_bool(o: &Map<String, Value>, path: &str, key: &str) -> R<bool> {
    match v_has(o, path, key)? {
        Value::Bool(b) => Ok(*b),
        v => Err(format!("{path}.{key}: ожидается true/false, получено {}", js_type(v))),
    }
}

fn v_str<'a>(o: &'a Map<String, Value>, path: &str, key: &str) -> R<&'a str> {
    match v_has(o, path, key)? {
        Value::String(s) => Ok(s),
        v => Err(format!("{path}.{key}: ожидается строка, получено {}", js_type(v))),
    }
}

fn v_enum<T: Copy>(o: &Map<String, Value>, path: &str, key: &str, table: &[(&str, T)]) -> R<T> {
    let s = v_str(o, path, key)?;
    match table.iter().find(|(n, _)| *n == s) {
        Some((_, t)) => Ok(*t),
        None => {
            let allowed: Vec<&str> = table.iter().map(|(n, _)| *n).collect();
            Err(format!("{path}.{key}: недопустимое значение \"{s}\". Допустимо: {}", allowed.join(", ")))
        }
    }
}

fn v_keys(o: &Map<String, Value>, path: &str, allowed: &[&str]) -> R<()> {
    for k in o.keys() {
        if !allowed.contains(&k.as_str()) {
            return Err(format!("{path}.{k}: неизвестное поле. Допустимы: {}", allowed.join(", ")));
        }
    }
    Ok(())
}

fn v_color(raw: &Value, path: &str) -> R<Color> {
    let o = v_obj(raw, path)?;
    v_keys(o, path, &["h", "s", "l", "a"])?;
    Ok(Color {
        h: v_num(o, path, "h", 0.0, 360.0)?,
        s: v_num(o, path, "s", 0.0, 1.0)?,
        l: v_num(o, path, "l", 0.0, 1.0)?,
        a: v_num(o, path, "a", 0.0, 1.0)?,
    })
}

const NOISE_KEYS: &[&str] = &[
    "type",
    "sizeX",
    "sizeY",
    "seed",
    "octaves",
    "gain",
    "lacunarity",
    "ridged",
    "warpAmount",
    "warpSize",
    "worleyMode",
    "worleyJitter",
    "grainHp",
    "shape",
];

fn v_noise(raw: &Value, path: &str) -> R<Noise> {
    let o = v_obj(raw, path)?;
    v_keys(o, path, NOISE_KEYS)?;
    let sp = format!("{path}.shape");
    let s = v_obj(v_has(o, path, "shape")?, &sp)?;
    v_keys(s, &sp, &["contrast", "bias", "gamma", "invert", "normalize"])?;
    Ok(Noise {
        kind: v_enum(o, path, "type", NoiseType::TABLE)?,
        size_x: v_num(o, path, "sizeX", 0.5, 8192.0)?,
        size_y: v_num(o, path, "sizeY", 0.5, 8192.0)?,
        seed: v_int(o, path, "seed", -2147483648.0, 2147483647.0)? as i32,
        octaves: v_int(o, path, "octaves", 1.0, 12.0)? as u32,
        gain: v_num(o, path, "gain", 0.0, 1.0)?,
        lacunarity: v_int(o, path, "lacunarity", 2.0, 4.0)? as u32,
        ridged: v_bool(o, path, "ridged")?,
        warp_amount: v_num(o, path, "warpAmount", 0.0, 2000.0)?,
        warp_size: v_num(o, path, "warpSize", 1.0, 8192.0)?,
        worley_mode: v_enum(o, path, "worleyMode", WorleyMode::TABLE)?,
        worley_jitter: v_num(o, path, "worleyJitter", 0.0, 1.0)?,
        grain_hp: v_int(o, path, "grainHp", 0.0, 64.0)? as u32,
        shape: Shape {
            contrast: v_num(s, &sp, "contrast", -1.0, 1.0)?,
            bias: v_num(s, &sp, "bias", -0.5, 0.5)?,
            gamma: v_num(s, &sp, "gamma", 0.1, 8.0)?,
            invert: v_bool(s, &sp, "invert")?,
            normalize: v_bool(s, &sp, "normalize")?,
        },
    })
}

fn v_channel(raw: &Value, path: &str) -> R<Channel> {
    let o = v_obj(raw, path)?;
    v_keys(o, path, &["id", "name", "enabled", "blend", "opacity", "noise", "low", "high"])?;
    let noise = v_has(o, path, "noise")?;
    let low = v_has(o, path, "low")?;
    let high = v_has(o, path, "high")?;
    // id нужен только интерфейсу (ключ карточки), но тип проверяется всё равно.
    v_str(o, path, "id")?;
    Ok(Channel {
        name: v_str(o, path, "name")?.to_string(),
        enabled: v_bool(o, path, "enabled")?,
        blend: v_enum(o, path, "blend", Blend::TABLE)?,
        opacity: v_num(o, path, "opacity", 0.0, 1.0)?,
        noise: v_noise(noise, &format!("{path}.noise"))?,
        low: v_color(low, &format!("{path}.low"))?,
        high: v_color(high, &format!("{path}.high"))?,
    })
}

/// Разбор уже распарсенного JSON. Бросает ошибку с точным адресом поля.
pub fn parse(raw: &Value) -> R<Doc> {
    const D: &str = "документ";
    let o = v_obj(raw, D)?;
    v_keys(o, D, &["format", "version", "name", "tile", "render", "background", "channels"])?;
    let fmt = v_str(o, D, "format")?;
    if fmt != FORMAT {
        return Err(format!("документ.format: ожидается \"{FORMAT}\", получено \"{fmt}\""));
    }
    let ver = v_int(o, D, "version", 1.0, 1000.0)?;
    if ver != VERSION {
        return Err(format!("документ.version: файл версии {ver}, поддерживается только {VERSION}"));
    }

    let t = v_obj(v_has(o, D, "tile")?, "документ.tile")?;
    v_keys(t, "документ.tile", &["width", "height"])?;

    let r = v_obj(v_has(o, D, "render")?, "документ.render")?;
    v_keys(r, "документ.render", &["stopMix", "dither", "webpQuality"])?;
    let dz = v_obj(v_has(r, "документ.render", "dither")?, "документ.render.dither")?;
    v_keys(dz, "документ.render.dither", &["mode", "amount"])?;

    let background = v_has(o, D, "background")?;
    let channels = match v_has(o, D, "channels")? {
        Value::Array(a) => a,
        v => return Err(format!("документ.channels: ожидается массив, получено {}", js_type(v))),
    };

    Ok(Doc {
        name: v_str(o, D, "name")?.to_string(),
        tile_w: v_int(t, "документ.tile", "width", 8.0, 4096.0)? as u32,
        tile_h: v_int(t, "документ.tile", "height", 8.0, 4096.0)? as u32,
        stop_mix: v_enum(r, "документ.render", "stopMix", StopMix::TABLE)?,
        dither_mode: v_enum(dz, "документ.render.dither", "mode", DitherMode::TABLE)?,
        dither_amount: v_num(dz, "документ.render.dither", "amount", 0.0, 4.0)?,
        webp_quality: v_num(r, "документ.render", "webpQuality", 0.0, 1.0)?,
        background: v_color(background, "документ.background")?,
        channels: channels
            .iter()
            .enumerate()
            .map(|(i, c)| v_channel(c, &format!("документ.channels[{i}]")))
            .collect::<R<Vec<_>>>()?,
    })
}

/// Разбор текста JSON.
pub fn parse_text(text: &str) -> R<Doc> {
    let v: Value = serde_json::from_str(text).map_err(|e| format!("не разбирается как JSON: {e}"))?;
    parse(&v)
}

#[cfg(test)]
mod tests {
    use super::*;

    const GOOD: &str = r#"{"format":"zerno-noise-tile","version":1,"name":"t",
      "tile":{"width":64,"height":64},
      "render":{"stopMix":"oklab","dither":{"mode":"tpdf","amount":1},"webpQuality":1},
      "background":{"h":10,"s":0.1,"l":0.2,"a":1},
      "channels":[{"id":"a","name":"a","enabled":true,"blend":"soft-light","opacity":1,
        "noise":{"type":"perlin","sizeX":32,"sizeY":32,"seed":1,"octaves":2,"gain":0.5,
          "lacunarity":2,"ridged":false,"warpAmount":0,"warpSize":64,"worleyMode":"f1",
          "worleyJitter":1,"grainHp":3,
          "shape":{"contrast":0,"bias":0,"gamma":1,"invert":false,"normalize":true}},
        "low":{"h":0,"s":0,"l":0,"a":0},"high":{"h":0,"s":0,"l":1,"a":1}}]}"#;

    #[test]
    fn good_document_parses() {
        let d = parse_text(GOOD).unwrap();
        assert_eq!(d.tile_w, 64);
        assert_eq!(d.channels[0].blend, Blend::SoftLight);
    }

    #[test]
    fn errors_name_the_exact_field() {
        let cases: &[(&str, &str)] = &[
            (r#"{"format":"zerno-noise-tile","version":1}"#, "документ.tile: поле отсутствует (обязательное)"),
            (
                r#"{"format":"other","version":1,"name":"x","tile":{"width":8,"height":8},"render":{},"background":{},"channels":[]}"#,
                "документ.format: ожидается \"zerno-noise-tile\", получено \"other\"",
            ),
            (
                r#"{"format":"zerno-noise-tile","version":2,"name":"x","tile":{"width":8,"height":8},"render":{},"background":{},"channels":[]}"#,
                "документ.version: файл версии 2, поддерживается только 1",
            ),
        ];
        for (text, want) in cases {
            assert_eq!(parse_text(text).unwrap_err(), *want);
        }
        let mut v: Value = serde_json::from_str(GOOD).unwrap();
        v["channels"][0]["noise"]["shape"]["gamma"] = Value::from(9);
        assert_eq!(
            parse(&v).unwrap_err(),
            "документ.channels[0].noise.shape.gamma: значение 9 вне диапазона [0.1; 8]"
        );
        v["channels"][0]["noise"]["shape"]["gamma"] = Value::from(1);
        v["channels"][0]["zzz"] = Value::from(1);
        assert!(parse(&v).unwrap_err().starts_with("документ.channels[0].zzz: неизвестное поле. Допустимы: id, name"));
    }
}
