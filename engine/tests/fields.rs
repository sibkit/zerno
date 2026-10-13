//! Свойства полей: бесшовность, вырожденные решётки, предел октав, кэш.

use zerno_engine::doc::{Noise, NoiseType, Shape, WorleyMode};
use zerno_engine::msg::Msg;
use zerno_engine::noise::{build_field, max_octaves_for, FieldError};
use zerno_engine::render::{parse_jobs, Engine};

fn base(kind: NoiseType) -> Noise {
    Noise {
        kind,
        size_x: 37.0,
        size_y: 29.0,
        seed: 4242,
        octaves: 4,
        gain: 0.5,
        lacunarity: 2,
        ridged: false,
        warp_amount: 0.0,
        warp_size: 57.0,
        worley_mode: WorleyMode::F1,
        worley_jitter: 1.0,
        grain_hp: 3,
        shape: Shape { contrast: 0.0, bias: 0.0, gamma: 1.0, invert: false, normalize: true },
    }
}

/// Отношение разности на стыке к 95-му процентилю внутренних разностей.
/// Для бесшовного поля стык ничем не выделяется — отношение около единицы.
/// Сравнение с процентилем, а не со средним: у блочного шума большинство
/// внутренних пар нулевые, и среднее дало бы ложную тревогу.
fn seam_ratio(data: &[f32], w: usize, h: usize) -> [f64; 2] {
    let dx: Vec<f64> = (0..w)
        .map(|x| (0..h).map(|y| (data[y * w + (x + 1) % w] as f64 - data[y * w + x] as f64).abs()).sum::<f64>() / h as f64)
        .collect();
    let dy: Vec<f64> = (0..h)
        .map(|y| (0..w).map(|x| (data[((y + 1) % h) * w + x] as f64 - data[y * w + x] as f64).abs()).sum::<f64>() / w as f64)
        .collect();
    [ratio(&dx), ratio(&dy)]
}

fn ratio(d: &[f64]) -> f64 {
    let wrap = d[d.len() - 1];
    let mut inner = d[..d.len() - 1].to_vec();
    inner.sort_by(f64::total_cmp);
    let p95 = inner[(0.95 * (inner.len() - 1) as f64) as usize];
    if p95 <= 1e-12 {
        return if wrap > 1e-9 { f64::INFINITY } else { 0.0 };
    }
    wrap / p95
}

#[test]
fn all_field_types_are_seamless() {
    let (w, h) = (192, 128);
    let mut cases = Vec::new();
    cases.push(base(NoiseType::Perlin));
    cases.push(Noise { ridged: true, ..base(NoiseType::Perlin) });
    cases.push(Noise { warp_amount: 25.0, warp_size: 40.0, ..base(NoiseType::Perlin) });
    cases.push(Noise { lacunarity: 3, octaves: 3, ..base(NoiseType::Perlin) });
    cases.push(base(NoiseType::Value));
    cases.push(Noise { size_x: 24.0, size_y: 24.0, octaves: 1, ..base(NoiseType::Worley) });
    cases.push(Noise {
        worley_mode: WorleyMode::F2F1,
        size_x: 24.0,
        size_y: 24.0,
        octaves: 2,
        warp_amount: 12.0,
        warp_size: 48.0,
        ..base(NoiseType::Worley)
    });
    cases.push(Noise { size_x: 1.0, size_y: 1.0, grain_hp: 0, ..base(NoiseType::Grain) });
    cases.push(Noise { size_x: 1.0, size_y: 1.0, grain_hp: 4, ..base(NoiseType::Grain) });
    cases.push(Noise { size_x: 6.0, size_y: 6.0, grain_hp: 0, ..base(NoiseType::Grain) });

    for (i, n) in cases.iter().enumerate() {
        let f = build_field(n, w, h).unwrap();
        let r = seam_ratio(&f.data, w, h);
        assert!(r[0] <= 2.0 && r[1] <= 2.0, "случай {i}: стык X={:.3} Y={:.3}", r[0], r[1]);
    }
}

#[test]
fn control_crop_off_period_breaks_the_seam() {
    // Без контроля метрика ничего не стоит: заведомо непериодическое поле
    // обязано её провалить.
    let (w, h) = (192, 128);
    let w2 = w + 13;
    let f = build_field(&base(NoiseType::Perlin), w2, h).unwrap();
    let crop: Vec<f32> = (0..h).flat_map(|y| f.data[y * w2..y * w2 + w].to_vec()).collect();
    let r = seam_ratio(&crop, w, h);
    assert!(r[0] > 3.0, "обрезка не по периоду не замечена: {:.3}", r[0]);
    assert!(r[1] <= 2.0);
}

#[test]
fn degenerate_cell_is_rejected_but_1px_grain_is_fine() {
    let n = Noise { size_x: 1.0, size_y: 1.0, ..base(NoiseType::Perlin) };
    assert_eq!(build_field(&n, 64, 64).err(), Some(FieldError::DegenerateCell));
    let g = Noise { size_x: 1.0, size_y: 1.0, grain_hp: 0, ..base(NoiseType::Grain) };
    assert!(build_field(&g, 64, 64).unwrap().max > 0.9);
}

#[test]
fn odd_and_tiny_tiles_stay_seamless() {
    for (w, h) in [(513, 385), (29, 38), (8, 8), (255, 255)] {
        for kind in [NoiseType::Perlin, NoiseType::Value, NoiseType::Worley] {
            let n = Noise { size_x: 2.0, size_y: 2.0, octaves: 3, ..base(kind) };
            let f = build_field(&n, w, h).unwrap();
            let r = seam_ratio(&f.data, w, h);
            assert!(r[0] <= 2.0 && r[1] <= 2.0, "{kind:?} {w}×{h}: X={:.3} Y={:.3}", r[0], r[1]);
        }
    }
}

#[test]
fn octaves_are_capped_by_pixel_size() {
    let n = Noise { size_x: 64.0, size_y: 64.0, octaves: 10, ..base(NoiseType::Perlin) };
    assert_eq!(max_octaves_for(&n, 256, 256), 6);
    assert_eq!(build_field(&n, 256, 256).unwrap().octaves_used, 6);
}

fn doc_json(channels: usize) -> serde_json::Value {
    let ch = |i: usize| {
        serde_json::json!({"id":format!("c{i}"),"name":format!("к{i}"),"enabled":true,"blend":"screen","opacity":0.5,
          "noise":{"type":"perlin","sizeX":16,"sizeY":16,"seed":i,"octaves":2,"gain":0.5,"lacunarity":2,"ridged":false,
            "warpAmount":0,"warpSize":64,"worleyMode":"f1","worleyJitter":1,"grainHp":3,
            "shape":{"contrast":0,"bias":0,"gamma":1,"invert":false,"normalize":true}},
          "low":{"h":0,"s":0,"l":0,"a":0},"high":{"h":30,"s":0.5,"l":0.8,"a":1}})
    };
    serde_json::json!({"format":"zerno-noise-tile","version":1,"name":"t","tile":{"width":32,"height":32},
      "render":{"stopMix":"oklab","dither":{"mode":"off","amount":0},"webpQuality":1},
      "background":{"h":0,"s":0,"l":0,"a":1},"channels":(0..channels).map(ch).collect::<Vec<_>>()})
}

#[test]
fn every_channel_is_composited_even_beyond_64() {
    // Прежний движок молча отбрасывал каналы после 64-го.
    let render = |n: usize| {
        let jobs = parse_jobs(&serde_json::json!({"jobs":[{"width":32,"height":32,"doc":doc_json(n)}]})).unwrap();
        Engine::new(0).render(&jobs).unwrap()
    };
    assert_ne!(render(64), render(65), "65-й канал не повлиял на картинку");
}

#[test]
fn cache_reuses_fields_and_respects_the_limit() {
    let e = Engine::new(1 << 30);
    let jobs = parse_jobs(&serde_json::json!({"jobs":[{"width":32,"height":32,"doc":doc_json(3)}]})).unwrap();
    let a = e.render(&jobs).unwrap();
    let b = e.render(&jobs).unwrap();
    assert_eq!(a, b);
    let s = e.cache_stats();
    assert_eq!((s.entries, s.misses, s.hits), (3, 3, 3));

    // Предел 0 байт: поля, которые держит идущий рендер, не вытесняются, а
    // освободившиеся уходят при следующей вставке.
    let z = Engine::new(0);
    z.render(&jobs).unwrap();
    assert_eq!(z.cache_stats().entries, 3);
    let other = parse_jobs(&serde_json::json!({"jobs":[{"width":16,"height":16,"doc":doc_json(3)}]})).unwrap();
    z.render(&other).unwrap();
    assert_eq!(z.cache_stats().entries, 3, "поля первого рендера должны были уйти");
}

#[test]
fn render_request_errors_name_the_field() {
    let err = |v: serde_json::Value| parse_jobs(&v).err().unwrap();
    // Форма запроса — дело нашего интерфейса: такие ошибки внутренние.
    assert_eq!(err(serde_json::json!({})), Msg::internal("запрос.jobs: поле отсутствует (обязательное)"));
    assert_eq!(err(serde_json::json!({"jobs":[]})), Msg::internal("запрос.jobs: пустой список"));
    assert_eq!(
        err(serde_json::json!({"jobs":[{"width":0,"height":8,"doc":doc_json(1)}]})),
        Msg::internal("запрос.jobs[0]: размер 0×8 вне диапазона [1; 4096]")
    );
    // Ошибка документа задачи — та же, что дал бы doc::parse, без приставок.
    let mut d = doc_json(1);
    d["channels"][0]["opacity"] = serde_json::json!(2);
    assert_eq!(
        err(serde_json::json!({"jobs":[{"width":8,"height":8,"doc":d}]})),
        Msg::new("doc.range").arg("field", "channels[0].opacity").arg("value", 2).arg("min", 0).arg("max", 1)
    );
    let big = serde_json::json!({"width":4096,"height":4096,"doc":doc_json(1)});
    assert_eq!(
        err(serde_json::json!({"jobs":[big.clone(), big.clone(), big.clone(), big.clone(), big]})),
        Msg::new("render.tooLarge")
    );

    let mut d = doc_json(1);
    d["channels"][0]["noise"]["sizeX"] = serde_json::json!(1);
    let jobs = parse_jobs(&serde_json::json!({"jobs":[{"width":32,"height":32,"doc":d}]})).unwrap();
    let e = Engine::new(0).render(&jobs).err().unwrap();
    assert_eq!(
        e,
        Msg::new("render.degenerate").arg("channel", "к0").arg("type", "perlin").arg("w", 1).arg("h", 16).arg("min", 2)
    );
}
