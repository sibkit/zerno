//! Цвет: Oklab / OKHSL по Björn Ottosson.
//! Порт один-в-один с клиентского движка, чтобы картинки совпадали.

const std = @import("std");
const math = std.math;

pub fn srgbTransfer(a: f64) f64 {
    return if (a <= 0.0031308) 12.92 * a else 1.055 * math.pow(f64, a, 1.0 / 2.4) - 0.055;
}

pub fn srgbTransferInv(a: f64) f64 {
    return if (a <= 0.04045) a / 12.92 else math.pow(f64, (a + 0.055) / 1.055, 2.4);
}

pub const Rgb = [3]f64;

pub fn oklabToLinearSrgb(L: f64, a: f64, b: f64) Rgb {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;
    return .{
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    };
}

pub fn linearSrgbToOklab(r: f64, g: f64, b: f64) Rgb {
    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
    const l_ = math.cbrt(l);
    const m_ = math.cbrt(m);
    const s_ = math.cbrt(s);
    return .{
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
    };
}

fn computeMaxSaturation(a: f64, b: f64) f64 {
    var k0: f64 = undefined;
    var k1: f64 = undefined;
    var k2: f64 = undefined;
    var k3: f64 = undefined;
    var k4: f64 = undefined;
    var wl: f64 = undefined;
    var wm: f64 = undefined;
    var ws: f64 = undefined;

    if (-1.88170328 * a - 0.80936493 * b > 1) {
        k0 = 1.19086277;
        k1 = 1.76576728;
        k2 = 0.59662641;
        k3 = 0.75515197;
        k4 = 0.56771245;
        wl = 4.0767416621;
        wm = -3.3077115913;
        ws = 0.2309699292;
    } else if (1.81444104 * a - 1.19445276 * b > 1) {
        k0 = 0.73956515;
        k1 = -0.45954404;
        k2 = 0.08285427;
        k3 = 0.12541070;
        k4 = 0.14503204;
        wl = -1.2684380046;
        wm = 2.6097574011;
        ws = -0.3413193965;
    } else {
        k0 = 1.35733652;
        k1 = -0.00915799;
        k2 = -1.15130210;
        k3 = -0.50559606;
        k4 = 0.00692167;
        wl = -0.0041960863;
        wm = -0.7034186147;
        ws = 1.7076147010;
    }

    const S = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b;
    const kl = 0.3963377774 * a + 0.2158037573 * b;
    const km = -0.1055613458 * a - 0.0638541728 * b;
    const ks = -0.0894841775 * a - 1.2914855480 * b;

    const l_ = 1 + S * kl;
    const m_ = 1 + S * km;
    const s_ = 1 + S * ks;
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;
    const ld = 3 * kl * l_ * l_;
    const md = 3 * km * m_ * m_;
    const sd = 3 * ks * s_ * s_;
    const ld2 = 6 * kl * kl * l_;
    const md2 = 6 * km * km * m_;
    const sd2 = 6 * ks * ks * s_;
    const f = wl * l + wm * m + ws * s;
    const f1 = wl * ld + wm * md + ws * sd;
    const f2 = wl * ld2 + wm * md2 + ws * sd2;
    return S - f * f1 / (f1 * f1 - 0.5 * f * f2);
}

const Cusp = [2]f64;

fn findCusp(a: f64, b: f64) Cusp {
    const S = computeMaxSaturation(a, b);
    const rgb = oklabToLinearSrgb(1, S * a, S * b);
    const mx = @max(rgb[0], @max(rgb[1], rgb[2]));
    const L = math.cbrt(1.0 / mx);
    return .{ L, L * S };
}

fn findGamutIntersection(a: f64, b: f64, L1: f64, C1: f64, L0: f64, cusp: Cusp) f64 {
    if ((L1 - L0) * cusp[1] - (cusp[0] - L0) * C1 <= 0) {
        return cusp[1] * L0 / (C1 * cusp[0] + cusp[1] * (L0 - L1));
    }
    var t = cusp[1] * (L0 - 1) / (C1 * (cusp[0] - 1) + cusp[1] * (L0 - L1));
    const dL = L1 - L0;
    const dC = C1;
    const kl = 0.3963377774 * a + 0.2158037573 * b;
    const km = -0.1055613458 * a - 0.0638541728 * b;
    const ks = -0.0894841775 * a - 1.2914855480 * b;
    const ldt = dL + dC * kl;
    const mdt = dL + dC * km;
    const sdt = dL + dC * ks;

    const L = L0 * (1 - t) + t * L1;
    const C = t * C1;
    const l_ = L + C * kl;
    const m_ = L + C * km;
    const s_ = L + C * ks;
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;
    const ld = 3 * ldt * l_ * l_;
    const md = 3 * mdt * m_ * m_;
    const sd = 3 * sdt * s_ * s_;
    const ld2 = 6 * ldt * ldt * l_;
    const md2 = 6 * mdt * mdt * m_;
    const sd2 = 6 * sdt * sdt * s_;

    const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s - 1;
    const r1 = 4.0767416621 * ld - 3.3077115913 * md + 0.2309699292 * sd;
    const r2 = 4.0767416621 * ld2 - 3.3077115913 * md2 + 0.2309699292 * sd2;
    const ur = r1 / (r1 * r1 - 0.5 * r * r2);
    var tr = -r * ur;

    const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s - 1;
    const g1 = -1.2684380046 * ld + 2.6097574011 * md - 0.3413193965 * sd;
    const g2 = -1.2684380046 * ld2 + 2.6097574011 * md2 - 0.3413193965 * sd2;
    const ug = g1 / (g1 * g1 - 0.5 * g * g2);
    var tg = -g * ug;

    const bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s - 1;
    const b1 = -0.0041960863 * ld - 0.7034186147 * md + 1.7076147010 * sd;
    const b2 = -0.0041960863 * ld2 - 0.7034186147 * md2 + 1.7076147010 * sd2;
    const ub = b1 / (b1 * b1 - 0.5 * bb * b2);
    var tb = -bb * ub;

    const huge = 1e30;
    if (ur < 0) tr = huge;
    if (ug < 0) tg = huge;
    if (ub < 0) tb = huge;
    t += @min(tr, @min(tg, tb));
    return t;
}

const TOE_K1: f64 = 0.206;
const TOE_K2: f64 = 0.03;
const TOE_K3: f64 = (1 + TOE_K1) / (1 + TOE_K2);

pub fn toe(x: f64) f64 {
    const u = TOE_K3 * x - TOE_K1;
    return 0.5 * (u + @sqrt(u * u + 4 * TOE_K2 * TOE_K3 * x));
}

pub fn toeInv(x: f64) f64 {
    return (x * x + TOE_K1 * x) / (TOE_K3 * (x + TOE_K2));
}

fn getStMid(a: f64, b: f64) [2]f64 {
    const S = 0.11516993 + 1.0 / (7.44778970 + 4.15901240 * b +
        a * (-2.19557347 + 1.75198401 * b +
            a * (-2.13704948 - 10.02301043 * b +
                a * (-4.24894561 + 5.38770819 * b + 4.69891013 * a))));
    const T = 0.11239642 + 1.0 / (1.61320320 - 0.68124379 * b +
        a * (0.40370612 + 0.90148123 * b +
            a * (-0.27087943 + 0.61223990 * b +
                a * (0.00299215 - 0.45399568 * b - 0.14661872 * a))));
    return .{ S, T };
}

fn getCs(L: f64, a: f64, b: f64) [3]f64 {
    const cusp = findCusp(a, b);
    const c_max = findGamutIntersection(a, b, L, 1, L, cusp);
    const st_max = [2]f64{ cusp[1] / cusp[0], cusp[1] / (1 - cusp[0]) };
    const k = c_max / @min(L * st_max[0], (1 - L) * st_max[1]);
    const st_mid = getStMid(a, b);
    const ca = L * st_mid[0];
    const cb = (1 - L) * st_mid[1];
    const c_mid = 0.9 * k * @sqrt(@sqrt(1.0 / (1.0 / (ca * ca * ca * ca) + 1.0 / (cb * cb * cb * cb))));
    const ca0 = L * 0.4;
    const cb0 = (1 - L) * 0.8;
    const c_0 = @sqrt(1.0 / (1.0 / (ca0 * ca0) + 1.0 / (cb0 * cb0)));
    return .{ c_0, c_mid, c_max };
}

const OK_MID: f64 = 0.8;
const OK_MID_INV: f64 = 1.25;

/// OKHSL (h 0..360, s 0..1, l 0..1) → Oklab [L, a, b].
pub fn okhslToOklab(h: f64, s: f64, l: f64) Rgb {
    if (l >= 1) return .{ 1, 0, 0 };
    if (l <= 0) return .{ 0, 0, 0 };
    const hr = h / 360.0 * 2.0 * math.pi;
    const a_ = @cos(hr);
    const b_ = @sin(hr);
    const L = toeInv(l);
    if (s <= 0) return .{ L, 0, 0 };
    const cs = getCs(L, a_, b_);
    const c_0 = cs[0];
    const c_mid = cs[1];
    const c_max = cs[2];
    var C: f64 = undefined;
    if (s < OK_MID) {
        const t = OK_MID_INV * s;
        const k1 = OK_MID * c_0;
        const k2 = 1 - k1 / c_mid;
        C = t * k1 / (1 - k2 * t);
    } else {
        const t = (s - OK_MID) / (1 - OK_MID);
        const k0 = c_mid;
        const k1 = (1 - OK_MID) * c_mid * c_mid * OK_MID_INV * OK_MID_INV / c_0;
        const k2 = 1 - k1 / (c_max - c_mid);
        C = k0 + t * k1 / (1 - k2 * t);
    }
    return .{ L, C * a_, C * b_ };
}

pub fn clamp01(v: f64) f64 {
    return if (v < 0) 0 else if (v > 1) 1 else v;
}

/// OKHSL → линейный sRGB (по построению уже внутри гамута).
pub fn okhslToLinear(h: f64, s: f64, l: f64) Rgb {
    const lab = okhslToOklab(h, s, l);
    const rgb = oklabToLinearSrgb(lab[0], lab[1], lab[2]);
    return .{ clamp01(rgb[0]), clamp01(rgb[1]), clamp01(rgb[2]) };
}

/// Таблица линейный → sRGB, как в клиенте: 16385 точек с линейной интерполяцией.
pub const SR_N: usize = 16385;

pub const SrLut = struct {
    v: [SR_N]f32,

    pub fn init() SrLut {
        @setEvalBranchQuota(200000);
        var t: SrLut = undefined;
        for (&t.v, 0..) |*e, i| {
            e.* = @floatCast(srgbTransfer(@as(f64, @floatFromInt(i)) / @as(f64, SR_N - 1)));
        }
        return t;
    }

    pub fn map(t: *const SrLut, a: f64) f64 {
        if (a <= 0) return 0;
        if (a >= 1) return 1;
        const f = a * @as(f64, SR_N - 1);
        const i: usize = @intFromFloat(f);
        const frac = f - @as(f64, @floatFromInt(i));
        const v0: f64 = t.v[i];
        const v1: f64 = t.v[i + 1];
        return v0 + (v1 - v0) * frac;
    }
};

test "OKHSL остаётся в гамуте sRGB" {
    var prng = std.Random.DefaultPrng.init(1);
    const rnd = prng.random();
    var i: usize = 0;
    while (i < 3000) : (i += 1) {
        const h = rnd.float(f64) * 360;
        const s = rnd.float(f64);
        const l = rnd.float(f64);
        const lab = okhslToOklab(h, s, l);
        const rgb = oklabToLinearSrgb(lab[0], lab[1], lab[2]);
        for (rgb) |v| {
            try std.testing.expect(v > -0.002 and v < 1.002);
        }
    }
}

test "toe обратима" {
    var x: f64 = 0;
    while (x <= 1.0) : (x += 0.01) {
        try std.testing.expectApproxEqAbs(x, toe(toeInv(x)), 1e-12);
    }
}
