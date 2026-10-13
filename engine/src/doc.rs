//! Модель документа и строгий разбор JSON.
//!
//! Правило то же, что в интерфейсе (app/ui/js/doc.js): никаких молчаливых
//! умолчаний. Отсутствующее поле, лишнее поле, неверный тип или значение вне
//! диапазона — ошибка с точным адресом. Ошибка — не текст, а `Msg`: ключ
//! `doc.*` и аргументы (`field` — полный адрес поля без корня: `""` для самого
//! документа, `tile`, `channels[0].noise.shape.gamma`). Порядок проверок,
//! ключи и аргументы совпадают с JS дословно: одна и та же ошибка выглядит
//! одинаково, где бы её ни нашли.

use crate::msg::Msg;
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
    /// Имя типа в документе (`"perlin"` …) — им же ошибки называют тип.
    pub fn key(self) -> &'static str {
        Self::TABLE.iter().find(|(_, t)| *t == self).map(|(n, _)| *n).expect("каждый тип шума есть в NoiseType::TABLE")
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

type R<T> = Result<T, Msg>;

/// Тип значения словом JSON — аргумент `got` ошибок.
fn js_type(v: &Value) -> &'static str {
    match v {
        Value::Null => "null",
        Value::Bool(_) => "boolean",
        Value::Number(_) => "number",
        Value::String(_) => "string",
        Value::Array(_) => "array",
        Value::Object(_) => "object",
    }
}

/// Адрес вложенного поля. Корень — пустая строка, поэтому ключи верхнего
/// уровня адресуются просто по имени: `tile`, а не `.tile`.
fn join(path: &str, key: &str) -> String {
    if path.is_empty() { key.to_string() } else { format!("{path}.{key}") }
}

fn v_obj<'a>(v: &'a Value, path: &str) -> R<&'a Map<String, Value>> {
    match v {
        Value::Object(o) => Ok(o),
        _ => Err(Msg::new("doc.notObject").arg("field", path).arg("got", js_type(v))),
    }
}

fn v_has<'a>(o: &'a Map<String, Value>, path: &str, key: &str) -> R<&'a Value> {
    o.get(key).ok_or_else(|| Msg::new("doc.missing").arg("field", join(path, key)))
}

fn v_num(o: &Map<String, Value>, path: &str, key: &str, min: f64, max: f64) -> R<f64> {
    let v = v_has(o, path, key)?;
    let n = match v {
        Value::Number(n) => n.as_f64(),
        _ => None,
    }
    .filter(|n| n.is_finite())
    .ok_or_else(|| Msg::new("doc.notNumber").arg("field", join(path, key)).arg("got", js_type(v)))?;
    if n < min || n > max {
        return Err(Msg::new("doc.range").arg("field", join(path, key)).arg("value", n).arg("min", min).arg("max", max));
    }
    Ok(n)
}

fn v_int(o: &Map<String, Value>, path: &str, key: &str, min: f64, max: f64) -> R<i64> {
    let n = v_num(o, path, key, min, max)?;
    if n.floor() != n {
        return Err(Msg::new("doc.notInt").arg("field", join(path, key)).arg("value", n));
    }
    Ok(n as i64)
}

fn v_bool(o: &Map<String, Value>, path: &str, key: &str) -> R<bool> {
    match v_has(o, path, key)? {
        Value::Bool(b) => Ok(*b),
        v => Err(Msg::new("doc.notBool").arg("field", join(path, key)).arg("got", js_type(v))),
    }
}

fn v_str<'a>(o: &'a Map<String, Value>, path: &str, key: &str) -> R<&'a str> {
    match v_has(o, path, key)? {
        Value::String(s) => Ok(s),
        v => Err(Msg::new("doc.notString").arg("field", join(path, key)).arg("got", js_type(v))),
    }
}

fn v_enum<T: Copy>(o: &Map<String, Value>, path: &str, key: &str, table: &[(&str, T)]) -> R<T> {
    let s = v_str(o, path, key)?;
    match table.iter().find(|(n, _)| *n == s) {
        Some((_, t)) => Ok(*t),
        None => {
            let allowed: Vec<&str> = table.iter().map(|(n, _)| *n).collect();
            Err(Msg::new("doc.badEnum").arg("field", join(path, key)).arg("value", s).arg("allowed", allowed.join(", ")))
        }
    }
}

fn v_keys(o: &Map<String, Value>, path: &str, allowed: &[&str]) -> R<()> {
    for k in o.keys() {
        if !allowed.contains(&k.as_str()) {
            return Err(Msg::new("doc.unknownField").arg("field", join(path, k)).arg("allowed", allowed.join(", ")));
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
    let sp = join(path, "shape");
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
        noise: v_noise(noise, &join(path, "noise"))?,
        low: v_color(low, &join(path, "low"))?,
        high: v_color(high, &join(path, "high"))?,
    })
}

/// Разбор уже распарсенного JSON. Ошибка — с точным адресом поля.
pub fn parse(raw: &Value) -> R<Doc> {
    // Корень — пустой адрес (см. join).
    const D: &str = "";
    let o = v_obj(raw, D)?;
    v_keys(o, D, &["format", "version", "name", "tile", "render", "background", "channels"])?;
    let fmt = v_str(o, D, "format")?;
    if fmt != FORMAT {
        return Err(Msg::new("doc.format").arg("field", "format").arg("want", FORMAT).arg("got", fmt));
    }
    let ver = v_int(o, D, "version", 1.0, 1000.0)?;
    if ver != VERSION {
        return Err(Msg::new("doc.version").arg("field", "version").arg("got", ver).arg("supported", VERSION));
    }

    let t = v_obj(v_has(o, D, "tile")?, "tile")?;
    v_keys(t, "tile", &["width", "height"])?;

    let r = v_obj(v_has(o, D, "render")?, "render")?;
    v_keys(r, "render", &["stopMix", "dither", "webpQuality"])?;
    let dz = v_obj(v_has(r, "render", "dither")?, "render.dither")?;
    v_keys(dz, "render.dither", &["mode", "amount"])?;

    let background = v_has(o, D, "background")?;
    let channels = match v_has(o, D, "channels")? {
        Value::Array(a) => a,
        v => return Err(Msg::new("doc.notArray").arg("field", "channels").arg("got", js_type(v))),
    };

    Ok(Doc {
        name: v_str(o, D, "name")?.to_string(),
        tile_w: v_int(t, "tile", "width", 8.0, 4096.0)? as u32,
        tile_h: v_int(t, "tile", "height", 8.0, 4096.0)? as u32,
        stop_mix: v_enum(r, "render", "stopMix", StopMix::TABLE)?,
        dither_mode: v_enum(dz, "render.dither", "mode", DitherMode::TABLE)?,
        dither_amount: v_num(dz, "render.dither", "amount", 0.0, 4.0)?,
        webp_quality: v_num(r, "render", "webpQuality", 0.0, 1.0)?,
        background: v_color(background, "background")?,
        channels: channels
            .iter()
            .enumerate()
            .map(|(i, c)| v_channel(c, &format!("channels[{i}]")))
            .collect::<R<Vec<_>>>()?,
    })
}

/// Разбор текста JSON.
pub fn parse_text(text: &str) -> R<Doc> {
    let v: Value = serde_json::from_str(text).map_err(|e| Msg::new("doc.json").arg("detail", e))?;
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

    /// Ключ и аргументы ошибки — то, что сверяет интерфейс.
    fn err(r: R<Doc>) -> (&'static str, Vec<(&'static str, String)>) {
        let m = r.unwrap_err();
        (m.key, m.args)
    }

    fn a(pairs: &[(&'static str, &str)]) -> Vec<(&'static str, String)> {
        pairs.iter().map(|(k, v)| (*k, v.to_string())).collect()
    }

    #[test]
    fn errors_name_the_exact_field() {
        assert_eq!(err(parse_text(r#"{"format":"zerno-noise-tile","version":1}"#)), ("doc.missing", a(&[("field", "tile")])));
        assert_eq!(
            err(parse_text(
                r#"{"format":"other","version":1,"name":"x","tile":{"width":8,"height":8},"render":{},"background":{},"channels":[]}"#
            )),
            ("doc.format", a(&[("field", "format"), ("want", "zerno-noise-tile"), ("got", "other")]))
        );
        assert_eq!(
            err(parse_text(
                r#"{"format":"zerno-noise-tile","version":2,"name":"x","tile":{"width":8,"height":8},"render":{},"background":{},"channels":[]}"#
            )),
            ("doc.version", a(&[("field", "version"), ("got", "2"), ("supported", "1")]))
        );
        // Корень — пустой адрес; массив называется "array".
        assert_eq!(err(parse_text("[]")), ("doc.notObject", a(&[("field", ""), ("got", "array")])));
        assert_eq!(err(parse_text("{")).0, "doc.json");

        let mut v: Value = serde_json::from_str(GOOD).unwrap();
        v["channels"][0]["noise"]["shape"]["gamma"] = Value::from(9);
        assert_eq!(
            err(parse(&v)),
            ("doc.range", a(&[("field", "channels[0].noise.shape.gamma"), ("value", "9"), ("min", "0.1"), ("max", "8")]))
        );
        v["channels"][0]["noise"]["shape"]["gamma"] = Value::from(1);
        v["channels"][0]["noise"]["seed"] = Value::from(1.5);
        assert_eq!(err(parse(&v)), ("doc.notInt", a(&[("field", "channels[0].noise.seed"), ("value", "1.5")])));
        v["channels"][0]["noise"]["seed"] = Value::from(1);
        v["channels"][0]["blend"] = Value::from("x");
        let allowed = "normal, multiply, screen, overlay, hard-light, soft-light, add, subtract, darken, lighten, difference";
        assert_eq!(
            err(parse(&v)),
            ("doc.badEnum", a(&[("field", "channels[0].blend"), ("value", "x"), ("allowed", allowed)]))
        );
        v["channels"][0]["blend"] = Value::from("normal");
        v["channels"][0]["zzz"] = Value::from(1);
        assert_eq!(
            err(parse(&v)),
            ("doc.unknownField", a(&[("field", "channels[0].zzz"), ("allowed", "id, name, enabled, blend, opacity, noise, low, high")]))
        );

        let mut v: Value = serde_json::from_str(GOOD).unwrap();
        v["channels"] = Value::from("x");
        assert_eq!(err(parse(&v)), ("doc.notArray", a(&[("field", "channels"), ("got", "string")])));
        let mut v: Value = serde_json::from_str(GOOD).unwrap();
        v["render"]["dither"]["amount"] = Value::Null;
        assert_eq!(err(parse(&v)), ("doc.notNumber", a(&[("field", "render.dither.amount"), ("got", "null")])));
        let mut v: Value = serde_json::from_str(GOOD).unwrap();
        v["tile"] = Value::from(true);
        assert_eq!(err(parse(&v)), ("doc.notObject", a(&[("field", "tile"), ("got", "boolean")])));
        let mut v: Value = serde_json::from_str(GOOD).unwrap();
        v["channels"][0]["enabled"] = Value::from(1);
        assert_eq!(err(parse(&v)), ("doc.notBool", a(&[("field", "channels[0].enabled"), ("got", "number")])));
        v["channels"][0]["enabled"] = Value::from(true);
        v["channels"][0]["id"] = Value::from(vec![1]);
        assert_eq!(err(parse(&v)), ("doc.notString", a(&[("field", "channels[0].id"), ("got", "array")])));
    }
}
