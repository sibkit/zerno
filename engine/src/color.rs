//! Цвет: Oklab / OKHSL по Björn Ottosson.
//! Порт один-в-один с эталонного JS-движка, чтобы картинки совпадали.

use std::f64::consts::PI;

pub fn srgb_transfer(a: f64) -> f64 {
    if a <= 0.0031308 { 12.92 * a } else { 1.055 * a.powf(1.0 / 2.4) - 0.055 }
}

pub fn srgb_transfer_inv(a: f64) -> f64 {
    if a <= 0.04045 { a / 12.92 } else { ((a + 0.055) / 1.055).powf(2.4) }
}

pub type Rgb = [f64; 3];

pub fn oklab_to_linear_srgb(l_in: f64, a: f64, b: f64) -> Rgb {
    let l_ = l_in + 0.3963377774 * a + 0.2158037573 * b;
    let m_ = l_in - 0.1055613458 * a - 0.0638541728 * b;
    let s_ = l_in - 0.0894841775 * a - 1.2914855480 * b;
    let l = l_ * l_ * l_;
    let m = m_ * m_ * m_;
    let s = s_ * s_ * s_;
    [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ]
}

pub fn linear_srgb_to_oklab(r: f64, g: f64, b: f64) -> Rgb {
    let l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    let m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    let s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
    let l_ = l.cbrt();
    let m_ = m.cbrt();
    let s_ = s.cbrt();
    [
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
    ]
}

fn compute_max_saturation(a: f64, b: f64) -> f64 {
    let (k0, k1, k2, k3, k4, wl, wm, ws) = if -1.88170328 * a - 0.80936493 * b > 1.0 {
        (1.19086277, 1.76576728, 0.59662641, 0.75515197, 0.56771245, 4.0767416621, -3.3077115913, 0.2309699292)
    } else if 1.81444104 * a - 1.19445276 * b > 1.0 {
        (0.73956515, -0.45954404, 0.08285427, 0.12541070, 0.14503204, -1.2684380046, 2.6097574011, -0.3413193965)
    } else {
        (1.35733652, -0.00915799, -1.15130210, -0.50559606, 0.00692167, -0.0041960863, -0.7034186147, 1.7076147010)
    };

    let s_est = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b;
    let kl = 0.3963377774 * a + 0.2158037573 * b;
    let km = -0.1055613458 * a - 0.0638541728 * b;
    let ks = -0.0894841775 * a - 1.2914855480 * b;

    let l_ = 1.0 + s_est * kl;
    let m_ = 1.0 + s_est * km;
    let s_ = 1.0 + s_est * ks;
    let l = l_ * l_ * l_;
    let m = m_ * m_ * m_;
    let s = s_ * s_ * s_;
    let ld = 3.0 * kl * l_ * l_;
    let md = 3.0 * km * m_ * m_;
    let sd = 3.0 * ks * s_ * s_;
    let ld2 = 6.0 * kl * kl * l_;
    let md2 = 6.0 * km * km * m_;
    let sd2 = 6.0 * ks * ks * s_;
    let f = wl * l + wm * m + ws * s;
    let f1 = wl * ld + wm * md + ws * sd;
    let f2 = wl * ld2 + wm * md2 + ws * sd2;
    s_est - f * f1 / (f1 * f1 - 0.5 * f * f2)
}

type Cusp = [f64; 2];

fn find_cusp(a: f64, b: f64) -> Cusp {
    let s = compute_max_saturation(a, b);
    let rgb = oklab_to_linear_srgb(1.0, s * a, s * b);
    let mx = rgb[0].max(rgb[1].max(rgb[2]));
    let l = (1.0 / mx).cbrt();
    [l, l * s]
}

fn find_gamut_intersection(a: f64, b: f64, l1: f64, c1: f64, l0: f64, cusp: Cusp) -> f64 {
    if (l1 - l0) * cusp[1] - (cusp[0] - l0) * c1 <= 0.0 {
        return cusp[1] * l0 / (c1 * cusp[0] + cusp[1] * (l0 - l1));
    }
    let mut t = cusp[1] * (l0 - 1.0) / (c1 * (cusp[0] - 1.0) + cusp[1] * (l0 - l1));
    let dl = l1 - l0;
    let dc = c1;
    let kl = 0.3963377774 * a + 0.2158037573 * b;
    let km = -0.1055613458 * a - 0.0638541728 * b;
    let ks = -0.0894841775 * a - 1.2914855480 * b;
    let ldt = dl + dc * kl;
    let mdt = dl + dc * km;
    let sdt = dl + dc * ks;

    let ll = l0 * (1.0 - t) + t * l1;
    let cc = t * c1;
    let l_ = ll + cc * kl;
    let m_ = ll + cc * km;
    let s_ = ll + cc * ks;
    let l = l_ * l_ * l_;
    let m = m_ * m_ * m_;
    let s = s_ * s_ * s_;
    let ld = 3.0 * ldt * l_ * l_;
    let md = 3.0 * mdt * m_ * m_;
    let sd = 3.0 * sdt * s_ * s_;
    let ld2 = 6.0 * ldt * ldt * l_;
    let md2 = 6.0 * mdt * mdt * m_;
    let sd2 = 6.0 * sdt * sdt * s_;

    let r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s - 1.0;
    let r1 = 4.0767416621 * ld - 3.3077115913 * md + 0.2309699292 * sd;
    let r2 = 4.0767416621 * ld2 - 3.3077115913 * md2 + 0.2309699292 * sd2;
    let ur = r1 / (r1 * r1 - 0.5 * r * r2);
    let mut tr = -r * ur;

    let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s - 1.0;
    let g1 = -1.2684380046 * ld + 2.6097574011 * md - 0.3413193965 * sd;
    let g2 = -1.2684380046 * ld2 + 2.6097574011 * md2 - 0.3413193965 * sd2;
    let ug = g1 / (g1 * g1 - 0.5 * g * g2);
    let mut tg = -g * ug;

    let bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s - 1.0;
    let b1 = -0.0041960863 * ld - 0.7034186147 * md + 1.7076147010 * sd;
    let b2 = -0.0041960863 * ld2 - 0.7034186147 * md2 + 1.7076147010 * sd2;
    let ub = b1 / (b1 * b1 - 0.5 * bb * b2);
    let mut tb = -bb * ub;

    const HUGE: f64 = 1e30;
    if ur < 0.0 {
        tr = HUGE;
    }
    if ug < 0.0 {
        tg = HUGE;
    }
    if ub < 0.0 {
        tb = HUGE;
    }
    t += tr.min(tg.min(tb));
    t
}

const TOE_K1: f64 = 0.206;
const TOE_K2: f64 = 0.03;
const TOE_K3: f64 = (1.0 + TOE_K1) / (1.0 + TOE_K2);

pub fn toe(x: f64) -> f64 {
    let u = TOE_K3 * x - TOE_K1;
    0.5 * (u + (u * u + 4.0 * TOE_K2 * TOE_K3 * x).sqrt())
}

pub fn toe_inv(x: f64) -> f64 {
    (x * x + TOE_K1 * x) / (TOE_K3 * (x + TOE_K2))
}

fn get_st_mid(a: f64, b: f64) -> [f64; 2] {
    let s = 0.11516993
        + 1.0
            / (7.44778970
                + 4.15901240 * b
                + a * (-2.19557347
                    + 1.75198401 * b
                    + a * (-2.13704948 - 10.02301043 * b + a * (-4.24894561 + 5.38770819 * b + 4.69891013 * a))));
    let t = 0.11239642
        + 1.0
            / (1.61320320 - 0.68124379 * b
                + a * (0.40370612
                    + 0.90148123 * b
                    + a * (-0.27087943 + 0.61223990 * b + a * (0.00299215 - 0.45399568 * b - 0.14661872 * a))));
    [s, t]
}

fn get_cs(l: f64, a: f64, b: f64) -> [f64; 3] {
    let cusp = find_cusp(a, b);
    let c_max = find_gamut_intersection(a, b, l, 1.0, l, cusp);
    let st_max = [cusp[1] / cusp[0], cusp[1] / (1.0 - cusp[0])];
    let k = c_max / (l * st_max[0]).min((1.0 - l) * st_max[1]);
    let st_mid = get_st_mid(a, b);
    let ca = l * st_mid[0];
    let cb = (1.0 - l) * st_mid[1];
    let c_mid = 0.9 * k * (1.0 / (1.0 / (ca * ca * ca * ca) + 1.0 / (cb * cb * cb * cb))).sqrt().sqrt();
    let ca0 = l * 0.4;
    let cb0 = (1.0 - l) * 0.8;
    let c_0 = (1.0 / (1.0 / (ca0 * ca0) + 1.0 / (cb0 * cb0))).sqrt();
    [c_0, c_mid, c_max]
}

const OK_MID: f64 = 0.8;
const OK_MID_INV: f64 = 1.25;

/// OKHSL (h 0..360, s 0..1, l 0..1) → Oklab [L, a, b].
pub fn okhsl_to_oklab(h: f64, s: f64, l: f64) -> Rgb {
    if l >= 1.0 {
        return [1.0, 0.0, 0.0];
    }
    if l <= 0.0 {
        return [0.0, 0.0, 0.0];
    }
    let hr = h / 360.0 * 2.0 * PI;
    let a_ = hr.cos();
    let b_ = hr.sin();
    let ll = toe_inv(l);
    if s <= 0.0 {
        return [ll, 0.0, 0.0];
    }
    let [c_0, c_mid, c_max] = get_cs(ll, a_, b_);
    let c = if s < OK_MID {
        let t = OK_MID_INV * s;
        let k1 = OK_MID * c_0;
        let k2 = 1.0 - k1 / c_mid;
        t * k1 / (1.0 - k2 * t)
    } else {
        let t = (s - OK_MID) / (1.0 - OK_MID);
        let k0 = c_mid;
        let k1 = (1.0 - OK_MID) * c_mid * c_mid * OK_MID_INV * OK_MID_INV / c_0;
        let k2 = 1.0 - k1 / (c_max - c_mid);
        k0 + t * k1 / (1.0 - k2 * t)
    };
    [ll, c * a_, c * b_]
}

pub fn clamp01(v: f64) -> f64 {
    if v < 0.0 {
        0.0
    } else if v > 1.0 {
        1.0
    } else {
        v
    }
}

/// OKHSL → линейный sRGB (по построению уже внутри гамута).
pub fn okhsl_to_linear(h: f64, s: f64, l: f64) -> Rgb {
    let lab = okhsl_to_oklab(h, s, l);
    let rgb = oklab_to_linear_srgb(lab[0], lab[1], lab[2]);
    [clamp01(rgb[0]), clamp01(rgb[1]), clamp01(rgb[2])]
}

/// Таблица линейный → sRGB, как в эталоне: 16385 точек с линейной интерполяцией.
/// Убирает `powf` из горячего цикла, ошибка < 0.001 LSB.
pub const SR_N: usize = 16385;

pub struct SrLut {
    v: Box<[f32]>,
}

impl SrLut {
    pub fn new() -> SrLut {
        let v: Vec<f32> = (0..SR_N).map(|i| srgb_transfer(i as f64 / (SR_N - 1) as f64) as f32).collect();
        SrLut { v: v.into_boxed_slice() }
    }

    #[inline]
    pub fn map(&self, a: f64) -> f64 {
        if a <= 0.0 {
            return 0.0;
        }
        if a >= 1.0 {
            return 1.0;
        }
        let f = a * (SR_N - 1) as f64;
        let i = f as usize;
        let frac = f - i as f64;
        let v0 = self.v[i] as f64;
        let v1 = self.v[i + 1] as f64;
        v0 + (v1 - v0) * frac
    }
}

impl Default for SrLut {
    fn default() -> Self {
        SrLut::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn okhsl_stays_in_srgb_gamut() {
        // Детерминированный перебор вместо ГСЧ: зависимости ради теста не нужны.
        let mut seed: u32 = 1;
        let mut rnd = || {
            seed = seed.wrapping_mul(1664525).wrapping_add(1013904223);
            (seed >> 8) as f64 / 16777216.0
        };
        for _ in 0..4000 {
            let (h, s, l) = (rnd() * 360.0, rnd(), rnd());
            let lab = okhsl_to_oklab(h, s, l);
            for v in oklab_to_linear_srgb(lab[0], lab[1], lab[2]) {
                assert!(v > -0.002 && v < 1.002, "выход из гамута: h={h} s={s} l={l} → {v}");
            }
        }
    }

    #[test]
    fn toe_is_invertible() {
        let mut x = 0.0;
        while x <= 1.0 {
            assert!((toe(toe_inv(x)) - x).abs() < 1e-12);
            x += 0.01;
        }
    }
}
