//! Форма значения, цветовая таблица канала, режимы наложения, композит в
//! линейном свете и вывод в 8 бит с дизерингом.

use crate::color::{self, SrLut};
use crate::doc::{Blend, Channel, DitherMode, Doc, Shape, StopMix};
use crate::noise::{hash2i, Field};

pub fn shape_value(t_in: f64, sh: &Shape) -> f64 {
    let mut t = if sh.invert { 1.0 - t_in } else { t_in };
    let c = sh.contrast;
    let slope = if c >= 0.0 { 1.0 / (1.0 - c * 0.985) } else { 1.0 + c };
    t = (t - 0.5) * slope + 0.5 + sh.bias;
    t = t.clamp(0.0, 1.0);
    if sh.gamma != 1.0 {
        t = t.powf(sh.gamma);
    }
    t.clamp(0.0, 1.0)
}

/// Цвет канала свёрнут в таблицу, куда уже заложена «форма»: на пиксель —
/// одно обращение к таблице, а правка формы не требует пересчёта шума.
pub const LUT_N: usize = 2048;

pub fn build_stop_lut(ch: &Channel, mix: StopMix) -> Vec<f32> {
    let a = color::okhsl_to_oklab(ch.low.h, ch.low.s, ch.low.l);
    let b = color::okhsl_to_oklab(ch.high.h, ch.high.s, ch.high.l);
    let al = color::okhsl_to_linear(ch.low.h, ch.low.s, ch.low.l);
    let bl = color::okhsl_to_linear(ch.high.h, ch.high.s, ch.high.l);
    let sh = &ch.noise.shape;
    let mut lut = vec![0.0f32; LUT_N * 4];
    for i in 0..LUT_N {
        let t = shape_value(i as f64 / (LUT_N - 1) as f64, sh);
        let rgb = match mix {
            StopMix::Oklab => {
                color::oklab_to_linear_srgb(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t)
            }
            StopMix::SrgbLinear => [
                al[0] + (bl[0] - al[0]) * t,
                al[1] + (bl[1] - al[1]) * t,
                al[2] + (bl[2] - al[2]) * t,
            ],
        };
        let k = i * 4;
        lut[k] = color::clamp01(rgb[0]) as f32;
        lut[k + 1] = color::clamp01(rgb[1]) as f32;
        lut[k + 2] = color::clamp01(rgb[2]) as f32;
        lut[k + 3] = color::clamp01(ch.low.a + (ch.high.a - ch.low.a) * t) as f32;
    }
    lut
}

#[inline]
fn blend_ch(mode: Blend, d: f64, s: f64) -> f64 {
    match mode {
        Blend::Normal => s,
        Blend::Multiply => d * s,
        Blend::Screen => d + s - d * s,
        Blend::Overlay => {
            if d <= 0.5 { 2.0 * d * s } else { 1.0 - 2.0 * (1.0 - d) * (1.0 - s) }
        }
        Blend::HardLight => {
            if s <= 0.5 { 2.0 * s * d } else { 1.0 - 2.0 * (1.0 - s) * (1.0 - d) }
        }
        Blend::SoftLight => {
            if s <= 0.5 {
                d - (1.0 - 2.0 * s) * d * (1.0 - d)
            } else {
                let g = if d <= 0.25 { ((16.0 * d - 12.0) * d + 4.0) * d } else { d.sqrt() };
                d + (2.0 * s - 1.0) * (g - d)
            }
        }
        Blend::Add => (d + s).min(1.0),
        Blend::Subtract => (d - s).max(0.0),
        Blend::Darken => d.min(s),
        Blend::Lighten => d.max(s),
        Blend::Difference => (d - s).abs(),
    }
}

const DITHER_SALT: [i32; 4] = [0x1a2b3c4d, 0x51ed2701, 0x2545f491, 0x9e3779b1u32 as i32];

const BAYER_BASE: [u8; 64] = [
    0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54,
    22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29,
    53, 21,
];

#[inline]
fn bayer8(i: usize) -> f64 {
    ((BAYER_BASE[i] as f32 + 0.5) / 64.0 - 0.5) as f64
}

/// Позиционный TPDF: значение зависит только от координат пикселя, поэтому
/// картинка не зависит от того, как работа поделена между потоками.
#[inline]
fn dither_tpdf(x: usize, y: usize, comp: usize, amt: f64) -> f64 {
    let h = hash2i(x as i32, y as i32, DITHER_SALT[comp]);
    let r1 = (h >> 16) as f64 / 65536.0;
    let r2 = (h & 0xffff) as f64 / 65536.0;
    (r1 + r2 - 1.0) * amt
}

/// План канала: всё, что не зависит от пикселя, считается один раз.
struct Plan<'a> {
    data: &'a [f32],
    lut: &'a [f32],
    lo: f64,
    scale: f64,
    opacity: f64,
    blend: Blend,
}

/// Композит и вывод полосы строк, начиная с `y0`; `out` — RGBA этой полосы.
/// `fields[i]` — поле канала `i`, `None` у выключенного канала.
pub fn composite_band(
    d: &Doc,
    fields: &[Option<&Field>],
    luts: &[Vec<f32>],
    sr: &SrLut,
    out: &mut [u8],
    w: usize,
    y0: usize,
) {
    assert_eq!(fields.len(), d.channels.len(), "полей должно быть ровно по числу каналов");
    assert_eq!(luts.len(), d.channels.len(), "таблиц цвета должно быть ровно по числу каналов");
    let top = (LUT_N - 1) as f64;
    let plans: Vec<Plan> = d
        .channels
        .iter()
        .zip(fields)
        .zip(luts)
        .filter_map(|((ch, f), lut)| {
            let f = (*f)?;
            let (lo, hi) = if ch.noise.shape.normalize { (f.min, f.max) } else { (f.cmin, f.cmax) };
            Some(Plan {
                data: &f.data,
                lut,
                lo,
                scale: if hi > lo { top / (hi - lo) } else { 0.0 },
                opacity: ch.opacity,
                blend: ch.blend,
            })
        })
        .collect();

    let bg = color::okhsl_to_linear(d.background.h, d.background.s, d.background.l);
    let ba = d.background.a;
    let amt = if d.dither_mode == DitherMode::Off { 0.0 } else { d.dither_amount };

    for (yy, row) in out.chunks_mut(w * 4).enumerate() {
        let y = y0 + yy;
        for x in 0..w {
            let p = y * w + x;
            let (mut ar, mut ag, mut ab, mut aa) = (bg[0], bg[1], bg[2], ba);

            for pl in &plans {
                let fidx = ((pl.data[p] as f64 - pl.lo) * pl.scale).clamp(0.0, top);
                let k = fidx as usize * 4;
                let sa = pl.lut[k + 3] as f64 * pl.opacity;
                if sa <= 0.0 {
                    continue;
                }
                let (s_r, s_g, s_b) = (pl.lut[k] as f64, pl.lut[k + 1] as f64, pl.lut[k + 2] as f64);
                let da = aa;
                let ao = sa + da * (1.0 - sa);
                if ao <= 0.0 {
                    (ar, ag, ab, aa) = (0.0, 0.0, 0.0, 0.0);
                    continue;
                }
                let (mut rr, mut gg, mut bb) = (s_r, s_g, s_b);
                if pl.blend != Blend::Normal {
                    rr = blend_ch(pl.blend, ar, s_r);
                    gg = blend_ch(pl.blend, ag, s_g);
                    bb = blend_ch(pl.blend, ab, s_b);
                }
                let w1 = (1.0 - da) * sa;
                let w2 = da * sa;
                let w3 = (1.0 - sa) * da;
                let inv = 1.0 / ao;
                ar = (w1 * s_r + w2 * rr + w3 * ar) * inv;
                ag = (w1 * s_g + w2 * gg + w3 * ag) * inv;
                ab = (w1 * s_b + w2 * bb + w3 * ab) * inv;
                aa = ao;
            }

            let bayer = if d.dither_mode == DitherMode::Ordered { bayer8((y & 7) * 8 + (x & 7)) * amt } else { 0.0 };
            let vals = [sr.map(ar) * 255.0, sr.map(ag) * 255.0, sr.map(ab) * 255.0, aa * 255.0];
            let q = x * 4;
            for (comp, &v0) in vals.iter().enumerate() {
                let mut v = v0;
                // Дизерим только там, где квантование действительно даёт ошибку:
                // точный уровень (альфа 255, чистый чёрный) шумом только испортится.
                if amt != 0.0 && (v - v.round()).abs() > 1e-4 {
                    v += match d.dither_mode {
                        DitherMode::Tpdf => dither_tpdf(x, y, comp, amt),
                        DitherMode::Ordered => bayer,
                        DitherMode::Off => unreachable!("при выключенном дизеринге amt = 0"),
                    };
                }
                row[q + comp] = if v < 0.0 {
                    0
                } else if v > 255.0 {
                    255
                } else {
                    (v + 0.5) as u8
                };
            }
        }
    }
}
