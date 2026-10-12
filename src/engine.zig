//! Движок шума: периодические решётки, композит, дизеринг.
//! Дословный порт клиентского движка — картинки обязаны совпадать.

const std = @import("std");
const doc = @import("doc.zig");
const color = @import("color.zig");
const Allocator = std.mem.Allocator;

// ============================ хэш и решётки ============================

pub fn hash2i(x: i32, y: i32, seed: i32) u32 {
    const xu: u32 = @bitCast(x);
    const yu: u32 = @bitCast(y);
    const su: u32 = @bitCast(seed);
    var h: u32 = (xu *% 0x27d4eb2d) ^ (yu *% 0x165667b1) ^ (su *% 0x9e3779b1);
    h ^= h >> 15;
    h = h *% 0x85ebca6b;
    h ^= h >> 13;
    h = h *% 0xc2b2ae35;
    h ^= h >> 16;
    return h;
}

const GRAD_N: usize = 256;

const GradTables = struct {
    cos: [GRAD_N]f32,
    sin: [GRAD_N]f32,
};

const grad_tables: GradTables = blk: {
    @setEvalBranchQuota(100000);
    var t: GradTables = undefined;
    for (0..GRAD_N) |i| {
        const a = @as(f64, @floatFromInt(i)) * 2.0 * std.math.pi / @as(f64, GRAD_N);
        t.cos[i] = @floatCast(@cos(a));
        t.sin[i] = @floatCast(@sin(a));
    }
    break :blk t;
};

inline fn fade(t: f64) f64 {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

const LatticeGrad = struct {
    gx: []f32,
    gy: []f32,
    px: usize,
    py: usize,
};

fn latticeGrad(gpa: Allocator, px: usize, py: usize, seed: i32) !LatticeGrad {
    const gx = try gpa.alloc(f32, px * py);
    errdefer gpa.free(gx);
    const gy = try gpa.alloc(f32, px * py);
    for (0..py) |j| {
        const r = j * px;
        for (0..px) |i| {
            const h = hash2i(@intCast(i), @intCast(j), seed) & (GRAD_N - 1);
            gx[r + i] = grad_tables.cos[h];
            gy[r + i] = grad_tables.sin[h];
        }
    }
    return .{ .gx = gx, .gy = gy, .px = px, .py = py };
}

const LatticeVal = struct {
    v: []f32,
    px: usize,
    py: usize,
};

fn latticeVal(gpa: Allocator, px: usize, py: usize, seed: i32) !LatticeVal {
    const v = try gpa.alloc(f32, px * py);
    for (0..py) |j| {
        const r = j * px;
        for (0..px) |i| {
            const h = hash2i(@intCast(i), @intCast(j), seed);
            v[r + i] = @floatCast(@as(f64, @floatFromInt(h >> 8)) / 16777216.0 * 2.0 - 1.0);
        }
    }
    return .{ .v = v, .px = px, .py = py };
}

/// Приведение к периоду без деления в типичном случае: без искажения домена
/// координата всегда лежит внутри [0, p), и деление не нужно вовсе.
inline fn wrapI(m_in: i64, p: i64) i64 {
    if (m_in >= 0 and m_in < p) return m_in;
    var m = @rem(m_in, p);
    if (m < 0) m += p;
    return m;
}

inline fn wrapIdx(v: f64, p: usize) struct { lo: usize, hi: usize, f: f64 } {
    const fl = @floor(v);
    const f = v - fl;
    const lo: usize = @intCast(wrapI(@intFromFloat(fl), @intCast(p)));
    var hi = lo + 1;
    if (hi == p) hi = 0;
    return .{ .lo = lo, .hi = hi, .f = f };
}

fn perlinSample(L: LatticeGrad, x: f64, y: f64) f64 {
    const wx = wrapIdx(x, L.px);
    const wy = wrapIdx(y, L.py);
    const u = fade(wx.f);
    const v = fade(wy.f);
    const r0 = wy.lo * L.px;
    const r1 = wy.hi * L.px;
    const fx = wx.f;
    const fy = wy.f;
    const n00 = @as(f64, L.gx[r0 + wx.lo]) * fx + @as(f64, L.gy[r0 + wx.lo]) * fy;
    const n10 = @as(f64, L.gx[r0 + wx.hi]) * (fx - 1) + @as(f64, L.gy[r0 + wx.hi]) * fy;
    const n01 = @as(f64, L.gx[r1 + wx.lo]) * fx + @as(f64, L.gy[r1 + wx.lo]) * (fy - 1);
    const n11 = @as(f64, L.gx[r1 + wx.hi]) * (fx - 1) + @as(f64, L.gy[r1 + wx.hi]) * (fy - 1);
    const a = n00 + u * (n10 - n00);
    const b = n01 + u * (n11 - n01);
    return a + v * (b - a);
}

fn valueSample(L: LatticeVal, x: f64, y: f64) f64 {
    const wx = wrapIdx(x, L.px);
    const wy = wrapIdx(y, L.py);
    const u = fade(wx.f);
    const v = fade(wy.f);
    const r0 = wy.lo * L.px;
    const r1 = wy.hi * L.px;
    const a = @as(f64, L.v[r0 + wx.lo]) + u * (@as(f64, L.v[r0 + wx.hi]) - @as(f64, L.v[r0 + wx.lo]));
    const b = @as(f64, L.v[r1 + wx.lo]) + u * (@as(f64, L.v[r1 + wx.hi]) - @as(f64, L.v[r1 + wx.lo]));
    return a + v * (b - a);
}

const WorleyPts = struct {
    px: []f32,
    py: []f32,
    cx: usize,
    cy: usize,
};

fn worleyPoints(gpa: Allocator, cx: usize, cy: usize, seed: i32, jitter: f64) !WorleyPts {
    const px = try gpa.alloc(f32, cx * cy);
    errdefer gpa.free(px);
    const py = try gpa.alloc(f32, cx * cy);
    for (0..cy) |j| {
        const r = j * cx;
        for (0..cx) |i| {
            const h1 = hash2i(@intCast(i), @intCast(j), seed);
            const h2 = hash2i(@intCast(i), @intCast(j), seed ^ @as(i32, @bitCast(@as(u32, 0x9e3779b9))));
            const fi: f64 = @floatFromInt(i);
            const fj: f64 = @floatFromInt(j);
            px[r + i] = @floatCast(fi + 0.5 + jitter * (@as(f64, @floatFromInt(h1 >> 8)) / 16777216.0 - 0.5));
            py[r + i] = @floatCast(fj + 0.5 + jitter * (@as(f64, @floatFromInt(h2 >> 8)) / 16777216.0 - 0.5));
        }
    }
    return .{ .px = px, .py = py, .cx = cx, .cy = cy };
}

fn worleySample(P: WorleyPts, x: f64, y: f64, mode: doc.WorleyMode) f64 {
    const ci: i64 = @intFromFloat(@floor(x));
    const cj: i64 = @intFromFloat(@floor(y));
    const cxi: i64 = @intCast(P.cx);
    const cyi: i64 = @intCast(P.cy);
    var d1: f64 = 1e30;
    var d2: f64 = 1e30;
    var dj: i64 = -1;
    while (dj <= 1) : (dj += 1) {
        const jj = cj + dj;
        const jw = wrapI(jj, cyi);
        const off_j: f64 = @floatFromInt(jj - jw);
        const r: usize = @as(usize, @intCast(jw)) * P.cx;
        var di: i64 = -1;
        while (di <= 1) : (di += 1) {
            const ii = ci + di;
            const iw = wrapI(ii, cxi);
            const idx = r + @as(usize, @intCast(iw));
            const dx = @as(f64, P.px[idx]) + @as(f64, @floatFromInt(ii - iw)) - x;
            const dy = @as(f64, P.py[idx]) + off_j - y;
            const d = dx * dx + dy * dy;
            if (d < d1) {
                d2 = d1;
                d1 = d;
            } else if (d < d2) {
                d2 = d;
            }
        }
    }
    return switch (mode) {
        .f1 => @sqrt(d1),
        .f2 => @sqrt(d2),
        .f2f1 => @sqrt(d2) - @sqrt(d1),
    };
}

fn boxBlurWrapHRange(src: []const f32, dst: []f32, w: usize, y0: usize, y1: usize, r: usize) void {
    const win: f64 = @floatFromInt(2 * r + 1);
    const wi: i64 = @intCast(w);
    var y = y0;
    while (y < y1) : (y += 1) {
        const o = y * w;
        var sum: f64 = 0;
        var k: i64 = -@as(i64, @intCast(r));
        while (k <= @as(i64, @intCast(r))) : (k += 1) {
            sum += src[o + @as(usize, @intCast(wrapI(k, wi)))];
        }
        for (0..w) |x| {
            dst[o + x] = @floatCast(sum / win);
            const xi: i64 = @intCast(x);
            const a = wrapI(xi - @as(i64, @intCast(r)), wi);
            const b = wrapI(xi + @as(i64, @intCast(r)) + 1, wi);
            sum += @as(f64, src[o + @as(usize, @intCast(b))]) - @as(f64, src[o + @as(usize, @intCast(a))]);
        }
    }
}

fn boxBlurWrapVRange(src: []const f32, dst: []f32, w: usize, h: usize, x0: usize, x1: usize, r: usize) void {
    const win: f64 = @floatFromInt(2 * r + 1);
    const hi: i64 = @intCast(h);
    var x = x0;
    while (x < x1) : (x += 1) {
        var sum: f64 = 0;
        var k: i64 = -@as(i64, @intCast(r));
        while (k <= @as(i64, @intCast(r))) : (k += 1) {
            sum += src[@as(usize, @intCast(wrapI(k, hi))) * w + x];
        }
        for (0..h) |y| {
            dst[y * w + x] = @floatCast(sum / win);
            const yi: i64 = @intCast(y);
            const a = wrapI(yi - @as(i64, @intCast(r)), hi);
            const b = wrapI(yi + @as(i64, @intCast(r)) + 1, hi);
            sum += @as(f64, src[@as(usize, @intCast(b)) * w + x]) - @as(f64, src[@as(usize, @intCast(a)) * w + x]);
        }
    }
}

// ============================ построение поля ============================

pub const MIN_CELL_PX: usize = 2;

pub fn baseCells(n: doc.Noise, w: usize, h: usize) [2]usize {
    const lim_w = @max(1, w / MIN_CELL_PX);
    const lim_h = @max(1, h / MIN_CELL_PX);
    const cx = @max(1, @min(lim_w, roundUsize(@as(f64, @floatFromInt(w)) / n.size_x)));
    const cy = @max(1, @min(lim_h, roundUsize(@as(f64, @floatFromInt(h)) / n.size_y)));
    return .{ cx, cy };
}

fn roundUsize(v: f64) usize {
    if (v <= 0) return 0;
    return @intFromFloat(@round(v));
}

pub fn maxOctavesFor(n: doc.Noise, w: usize, h: usize) u32 {
    const c = baseCells(n, w, h);
    var o: u32 = 1;
    while (o < 12) : (o += 1) {
        const f = std.math.pow(f64, @floatFromInt(n.lacunarity), @floatFromInt(o));
        const cw = @as(f64, @floatFromInt(c[0])) * f * @as(f64, MIN_CELL_PX);
        const ch = @as(f64, @floatFromInt(c[1])) * f * @as(f64, MIN_CELL_PX);
        if (cw > @as(f64, @floatFromInt(w)) or ch > @as(f64, @floatFromInt(h))) break;
    }
    return o;
}

pub const Field = struct {
    data: []f32,
    min: f64,
    max: f64,
    cmin: f64,
    cmax: f64,
    octaves_used: u32,
};

pub const FieldError = error{DegenerateCell} || Allocator.Error;

/// Разбивка построчной работы по потокам. Без `io` считаем в один поток.
pub const Par = struct {
    io: ?std.Io = null,
    lanes: usize = 1,

    /// Минимум строк на поток: мельче дробить дороже, чем считать.
    const MIN_ROWS: usize = 24;

    pub fn rowsPublic(par: Par, h: usize, ctx: anytype, comptime f: anytype) void {
        return rows(par, h, ctx, f);
    }

    fn rows(par: Par, h: usize, ctx: anytype, comptime f: anytype) void {
        const io = par.io orelse return f(ctx, 0, h);
        const lanes = @min(par.lanes, @max(1, h / MIN_ROWS));
        if (lanes <= 1) return f(ctx, 0, h);
        const per = (h + lanes - 1) / lanes;
        const Ctx = @TypeOf(ctx);
        const R = struct {
            fn one(c: Ctx, a: usize, b: usize) void {
                f(c, a, b);
            }
        };
        var g: std.Io.Group = .init;
        var y: usize = per;
        while (y < h) : (y += per) {
            const y1 = @min(h, y + per);
            g.concurrent(io, R.one, .{ ctx, y, y1 }) catch R.one(ctx, y, y1);
        }
        f(ctx, 0, @min(h, per));
        g.@"await"(io) catch {};
    }
};

/// Предрасчёт по столбцам: `@floor`, дробная часть и fade не зависят от строки.
const Cols = struct {
    lo: []u32,
    hi: []u32,
    f: []f64,
    u: []f64,

    fn alloc(gpa: Allocator, w: usize) !Cols {
        return .{
            .lo = try gpa.alloc(u32, w),
            .hi = try gpa.alloc(u32, w),
            .f = try gpa.alloc(f64, w),
            .u = try gpa.alloc(f64, w),
        };
    }
    fn free(c: Cols, gpa: Allocator) void {
        gpa.free(c.lo);
        gpa.free(c.hi);
        gpa.free(c.f);
        gpa.free(c.u);
    }
    fn fill(c: Cols, w: usize, sx: f64, px: usize) void {
        const pxi: i64 = @intCast(px);
        for (0..w) |x| {
            const xf = @as(f64, @floatFromInt(x)) * sx;
            const fl = @floor(xf);
            const fr = xf - fl;
            c.f[x] = fr;
            c.u[x] = fade(fr);
            const lo = wrapI(@intFromFloat(fl), pxi);
            c.lo[x] = @intCast(lo);
            c.hi[x] = @intCast(if (lo + 1 == pxi) 0 else lo + 1);
        }
    }
};

const WarpCtx = struct {
    bx: []f32,
    by: []f32,
    lx: LatticeGrad,
    ly: LatticeGrad,
    sx: f64,
    sy: f64,
    w: usize,
};

fn warpRows(c: *const WarpCtx, y0: usize, y1: usize) void {
    var y = y0;
    while (y < y1) : (y += 1) {
        const yy = @as(f64, @floatFromInt(y)) * c.sy;
        const r = y * c.w;
        for (0..c.w) |x| {
            const xx = @as(f64, @floatFromInt(x)) * c.sx;
            c.bx[r + x] = @floatCast(perlinSample(c.lx, xx, yy) * 1.4142136);
            c.by[r + x] = @floatCast(perlinSample(c.ly, xx, yy) * 1.4142136);
        }
    }
}

const GradCtx = struct {
    out: []f32,
    lg: LatticeGrad,
    lv: LatticeVal,
    use_perlin: bool,
    k: f64,
    ridged: bool,
    amp: f64,
    sx: f64,
    sy: f64,
    w: usize,
    cols: Cols,
    first: bool,
    wxf: ?[]const f32,
    wyf: ?[]const f32,
    wax: f64,
    way: f64,
};

fn gradRows(c: *const GradCtx, y0: usize, y1: usize) void {
    const px = if (c.use_perlin) c.lg.px else c.lv.px;
    const py = if (c.use_perlin) c.lg.py else c.lv.py;
    const pyi: i64 = @intCast(py);
    var y = y0;
    while (y < y1) : (y += 1) {
        const r = y * c.w;
        const yf = @as(f64, @floatFromInt(y)) * c.sy;

        if (c.wxf) |bxb| {
            // С искажением домена координата произвольна — общий путь.
            const byb = c.wyf.?;
            for (0..c.w) |x| {
                const p = r + x;
                const xx = @as(f64, @floatFromInt(x)) * c.sx + @as(f64, bxb[p]) * c.wax;
                const yy = yf + @as(f64, byb[p]) * c.way;
                var v = (if (c.use_perlin) perlinSample(c.lg, xx, yy) else valueSample(c.lv, xx, yy)) * c.k;
                if (c.ridged) {
                    v = 1 - @abs(v);
                    v = v * 2 - 1;
                }
                c.out[p] = if (c.first) @floatCast(c.amp * v) else @floatCast(@as(f64, c.out[p]) + c.amp * v);
            }
            continue;
        }

        const fl = @floor(yf);
        const fy = yf - fl;
        const vv = fade(fy);
        const jlo = wrapI(@intFromFloat(fl), pyi);
        const jhi: i64 = if (jlo + 1 == pyi) 0 else jlo + 1;
        const r0 = @as(usize, @intCast(jlo)) * px;
        const r1 = @as(usize, @intCast(jhi)) * px;

        if (c.use_perlin) {
            const gx = c.lg.gx;
            const gy = c.lg.gy;
            for (0..c.w) |x| {
                const ia = c.cols.lo[x];
                const ib = c.cols.hi[x];
                const fx = c.cols.f[x];
                const u = c.cols.u[x];
                const a00 = r0 + ia;
                const a10 = r0 + ib;
                const a01 = r1 + ia;
                const a11 = r1 + ib;
                const n00 = @as(f64, gx[a00]) * fx + @as(f64, gy[a00]) * fy;
                const n10 = @as(f64, gx[a10]) * (fx - 1) + @as(f64, gy[a10]) * fy;
                const n01 = @as(f64, gx[a01]) * fx + @as(f64, gy[a01]) * (fy - 1);
                const n11 = @as(f64, gx[a11]) * (fx - 1) + @as(f64, gy[a11]) * (fy - 1);
                const aa = n00 + u * (n10 - n00);
                const bb = n01 + u * (n11 - n01);
                var v = (aa + vv * (bb - aa)) * c.k;
                if (c.ridged) {
                    v = 1 - @abs(v);
                    v = v * 2 - 1;
                }
                c.out[r + x] = if (c.first) @floatCast(c.amp * v) else @floatCast(@as(f64, c.out[r + x]) + c.amp * v);
            }
        } else {
            const val = c.lv.v;
            for (0..c.w) |x| {
                const ia = c.cols.lo[x];
                const ib = c.cols.hi[x];
                const u = c.cols.u[x];
                const aa = @as(f64, val[r0 + ia]) + u * (@as(f64, val[r0 + ib]) - @as(f64, val[r0 + ia]));
                const bb = @as(f64, val[r1 + ia]) + u * (@as(f64, val[r1 + ib]) - @as(f64, val[r1 + ia]));
                var v = (aa + vv * (bb - aa)) * c.k;
                if (c.ridged) {
                    v = 1 - @abs(v);
                    v = v * 2 - 1;
                }
                c.out[r + x] = if (c.first) @floatCast(c.amp * v) else @floatCast(@as(f64, c.out[r + x]) + c.amp * v);
            }
        }
    }
}

const WorleyCtx = struct {
    out: []f32,
    P: WorleyPts,
    mode: doc.WorleyMode,
    amp: f64,
    first: bool,
    sx: f64,
    sy: f64,
    w: usize,
    wxf: ?[]const f32,
    wyf: ?[]const f32,
    wax: f64,
    way: f64,
};

fn worleyRows(c: *const WorleyCtx, y0: usize, y1: usize) void {
    var y = y0;
    while (y < y1) : (y += 1) {
        const r = y * c.w;
        const yf = @as(f64, @floatFromInt(y)) * c.sy;
        for (0..c.w) |x| {
            const p = r + x;
            var xx = @as(f64, @floatFromInt(x)) * c.sx;
            var yy = yf;
            if (c.wxf) |bxb| {
                xx += @as(f64, bxb[p]) * c.wax;
                yy += @as(f64, c.wyf.?[p]) * c.way;
            }
            c.out[p] = if (c.first) @floatCast(c.amp * worleySample(c.P, xx, yy, c.mode)) else @floatCast(@as(f64, c.out[p]) + c.amp * worleySample(c.P, xx, yy, c.mode));
        }
    }
}

const GrainCtx = struct {
    out: []f32,
    w: usize,
    h: usize,
    bx: usize,
    by: usize,
    seed: i32,
};

fn grainRows(c: *const GrainCtx, y0: usize, y1: usize) void {
    var y = y0;
    while (y < y1) : (y += 1) {
        const j: usize = (y * c.by) / c.h;
        const r = y * c.w;
        for (0..c.w) |x| {
            const i: usize = (x * c.bx) / c.w;
            const hv = hash2i(@intCast(i), @intCast(j), c.seed);
            c.out[r + x] = @floatCast(@as(f64, @floatFromInt(hv >> 8)) / 16777216.0);
        }
    }
}

const BlurHCtx = struct { src: []const f32, dst: []f32, w: usize, r: usize };
fn blurHRows(c: *const BlurHCtx, y0: usize, y1: usize) void {
    boxBlurWrapHRange(c.src, c.dst, c.w, y0, y1, c.r);
}
const BlurVCtx = struct { src: []const f32, dst: []f32, w: usize, h: usize, r: usize };
fn blurVCols(c: *const BlurVCtx, x0: usize, x1: usize) void {
    boxBlurWrapVRange(c.src, c.dst, c.w, c.h, x0, x1, c.r);
}
const CombineCtx = struct { out: []f32, blur: []const f32, w: usize };
fn combineRows(c: *const CombineCtx, y0: usize, y1: usize) void {
    var p = y0 * c.w;
    const end = y1 * c.w;
    while (p < end) : (p += 1) c.out[p] = @floatCast(@as(f64, c.out[p]) - @as(f64, c.blur[p]) + 0.5);
}

pub fn buildField(gpa: Allocator, n: doc.Noise, w: usize, h: usize) FieldError!Field {
    return buildFieldPar(gpa, n, w, h, .{});
}

const NormCtx = struct {
    out: []f32,
    inv: f64,
    w: usize,
    mins: []f64,
    maxs: []f64,
};

/// Нормировка и поиск диапазона одним проходом, по полосам строк.
fn normRows(c: *const NormCtx, y0: usize, y1: usize) void {
    var mn: f64 = std.math.inf(f64);
    var mx: f64 = -std.math.inf(f64);
    var p = y0 * c.w;
    const end = y1 * c.w;
    if (c.inv == 1.0) {
        while (p < end) : (p += 1) {
            const d: f64 = c.out[p];
            if (d < mn) mn = d;
            if (d > mx) mx = d;
        }
    } else {
        while (p < end) : (p += 1) {
            const f: f32 = @floatCast(@as(f64, c.out[p]) * c.inv);
            c.out[p] = f;
            const d: f64 = f;
            if (d < mn) mn = d;
            if (d > mx) mx = d;
        }
    }
    c.mins[y0] = mn;
    c.maxs[y0] = mx;
}

fn finishPar(gpa: Allocator, par: Par, out: []f32, w: usize, h: usize, inv: f64, cmin: f64, cmax: f64, oct: u32) !Field {
    const mins = try gpa.alloc(f64, h);
    defer gpa.free(mins);
    const maxs = try gpa.alloc(f64, h);
    defer gpa.free(maxs);
    @memset(mins, std.math.inf(f64));
    @memset(maxs, -std.math.inf(f64));
    const c: NormCtx = .{ .out = out, .inv = inv, .w = w, .mins = mins, .maxs = maxs };
    par.rows(h, &c, normRows);
    var mn: f64 = std.math.inf(f64);
    var mx: f64 = -std.math.inf(f64);
    for (mins) |v| {
        if (v < mn) mn = v;
    }
    for (maxs) |v| {
        if (v > mx) mx = v;
    }
    return .{ .data = out, .min = mn, .max = mx, .cmin = cmin, .cmax = cmax, .octaves_used = oct };
}

pub fn buildFieldPar(gpa: Allocator, n: doc.Noise, w: usize, h: usize, par: Par) FieldError!Field {
    const N = w * h;
    const out = try gpa.alloc(f32, N);
    errdefer gpa.free(out);
    // Обнулять не нужно: первая октава пишет значение, а не накапливает.

    if (n.type == .grain) {
        const gc: GrainCtx = .{
            .out = out,
            .w = w,
            .h = h,
            .bx = @min(w, @max(1, roundUsize(@as(f64, @floatFromInt(w)) / n.size_x))),
            .by = @min(h, @max(1, roundUsize(@as(f64, @floatFromInt(h)) / n.size_y))),
            .seed = n.seed,
        };
        par.rows(h, &gc, grainRows);

        if (n.grain_hp > 0) {
            const r: usize = @max(1, n.grain_hp);
            const t1 = try gpa.alloc(f32, N);
            defer gpa.free(t1);
            const t2 = try gpa.alloc(f32, N);
            defer gpa.free(t2);
            const bh: BlurHCtx = .{ .src = out, .dst = t1, .w = w, .r = r };
            par.rows(h, &bh, blurHRows);
            const bv: BlurVCtx = .{ .src = t1, .dst = t2, .w = w, .h = h, .r = r };
            par.rows(w, &bv, blurVCols); // здесь «строки» — это столбцы
            const cc: CombineCtx = .{ .out = out, .blur = t2, .w = w };
            par.rows(h, &cc, combineRows);
        }
        return finishPar(gpa, par, out, w, h, 1.0, 0, 1, 1);
    }

    if (n.size_x < @as(f64, MIN_CELL_PX) or n.size_y < @as(f64, MIN_CELL_PX))
        return error.DegenerateCell;

    const c0 = baseCells(n, w, h);
    const cx0 = c0[0];
    const cy0 = c0[1];
    const octaves: u32 = if (n.type.hasOctaves()) @min(n.octaves, maxOctavesFor(n, w, h)) else 1;

    var wx_f: ?[]f32 = null;
    var wy_f: ?[]f32 = null;
    defer if (wx_f) |b| gpa.free(b);
    defer if (wy_f) |b| gpa.free(b);

    if (n.warp_amount > 0) {
        const wcx = @max(1, roundUsize(@as(f64, @floatFromInt(w)) / n.warp_size));
        const wcy = @max(1, roundUsize(@as(f64, @floatFromInt(h)) / n.warp_size));
        const lx = try latticeGrad(gpa, wcx, wcy, n.seed ^ @as(i32, @bitCast(@as(u32, 0x51ed270b))));
        defer gpa.free(lx.gx);
        defer gpa.free(lx.gy);
        const ly = try latticeGrad(gpa, wcx, wcy, n.seed ^ @as(i32, @bitCast(@as(u32, 0x2545f491))));
        defer gpa.free(ly.gx);
        defer gpa.free(ly.gy);
        const bx = try gpa.alloc(f32, N);
        errdefer gpa.free(bx);
        const by = try gpa.alloc(f32, N);
        wx_f = bx;
        wy_f = by;
        const wc: WarpCtx = .{
            .bx = bx,
            .by = by,
            .lx = lx,
            .ly = ly,
            .sx = @as(f64, @floatFromInt(wcx)) / @as(f64, @floatFromInt(w)),
            .sy = @as(f64, @floatFromInt(wcy)) / @as(f64, @floatFromInt(h)),
            .w = w,
        };
        par.rows(h, &wc, warpRows);
    }

    const cols = try Cols.alloc(gpa, w);
    defer cols.free(gpa);

    var amp: f64 = 1;
    var norm: f64 = 0;
    var o: u32 = 0;
    while (o < octaves) : (o += 1) {
        const f = @round(std.math.pow(f64, @floatFromInt(n.lacunarity), @floatFromInt(o)));
        const fi: usize = @intFromFloat(f);
        const px = cx0 * fi;
        const py = cy0 * fi;
        const sx = @as(f64, @floatFromInt(px)) / @as(f64, @floatFromInt(w));
        const sy = @as(f64, @floatFromInt(py)) / @as(f64, @floatFromInt(h));
        const ridged = n.ridged and n.type.hasRidged();
        const seed_o: i32 = n.seed +% @as(i32, @intCast(o)) *% 7919;

        switch (n.type) {
            .perlin, .value => {
                const use_perlin = n.type == .perlin;
                var lg: LatticeGrad = undefined;
                var lv: LatticeVal = undefined;
                if (use_perlin) {
                    lg = try latticeGrad(gpa, px, py, seed_o);
                } else {
                    lv = try latticeVal(gpa, px, py, seed_o);
                }
                defer if (use_perlin) {
                    gpa.free(lg.gx);
                    gpa.free(lg.gy);
                } else gpa.free(lv.v);

                if (wx_f == null) cols.fill(w, sx, px);

                const gc: GradCtx = .{
                    .out = out,
                    .lg = if (use_perlin) lg else .{ .gx = &.{}, .gy = &.{}, .px = px, .py = py },
                    .lv = if (use_perlin) .{ .v = &.{}, .px = px, .py = py } else lv,
                    .use_perlin = use_perlin,
                    .k = if (use_perlin) 1.4142136 else 1.0,
                    .ridged = ridged,
                    .amp = amp,
                    .sx = sx,
                    .sy = sy,
                    .w = w,
                    .cols = cols,
                    .first = o == 0,
                    .wxf = wx_f,
                    .wyf = wy_f,
                    .wax = n.warp_amount * sx,
                    .way = n.warp_amount * sy,
                };
                par.rows(h, &gc, gradRows);
            },
            .worley => {
                const P = try worleyPoints(gpa, px, py, seed_o, n.worley_jitter);
                defer gpa.free(P.px);
                defer gpa.free(P.py);
                const wc: WorleyCtx = .{
                    .out = out,
                    .P = P,
                    .mode = n.worley_mode,
                    .amp = amp,
                    .first = o == 0,
                    .sx = sx,
                    .sy = sy,
                    .w = w,
                    .wxf = wx_f,
                    .wyf = wy_f,
                    .wax = n.warp_amount * sx,
                    .way = n.warp_amount * sy,
                };
                par.rows(h, &wc, worleyRows);
            },
            .grain => unreachable,
        }
        norm += amp;
        amp *= n.gain;
    }

    const signed = n.type == .perlin or n.type == .value;
    return finishPar(gpa, par, out, w, h, 1.0 / norm, if (signed) -1 else 0, 1, octaves);
}

fn finish(out: []f32, cmin: f64, cmax: f64, octaves_used: u32) Field {
    var mn: f64 = std.math.inf(f64);
    var mx: f64 = -std.math.inf(f64);
    for (out) |v| {
        const d: f64 = v;
        if (d < mn) mn = d;
        if (d > mx) mx = d;
    }
    return .{ .data = out, .min = mn, .max = mx, .cmin = cmin, .cmax = cmax, .octaves_used = octaves_used };
}

// ============================ форма и таблица цвета ============================

pub fn shapeValue(t_in: f64, sh: doc.Shape) f64 {
    var t = t_in;
    if (sh.invert) t = 1 - t;
    const c = sh.contrast;
    const slope = if (c >= 0) 1.0 / (1.0 - c * 0.985) else 1.0 + c;
    t = (t - 0.5) * slope + 0.5 + sh.bias;
    t = if (t < 0) 0 else if (t > 1) 1 else t;
    if (sh.gamma != 1) t = std.math.pow(f64, t, sh.gamma);
    return if (t < 0) 0 else if (t > 1) 1 else t;
}

pub const LUT_N: usize = 2048;

fn buildStopLut(lut: *[LUT_N * 4]f32, ch: doc.Channel, mix: doc.StopMix) void {
    const A = color.okhslToOklab(ch.low.h, ch.low.s, ch.low.l);
    const B = color.okhslToOklab(ch.high.h, ch.high.s, ch.high.l);
    const Al = color.okhslToLinear(ch.low.h, ch.low.s, ch.low.l);
    const Bl = color.okhslToLinear(ch.high.h, ch.high.s, ch.high.l);
    const sh = ch.noise.shape;
    for (0..LUT_N) |i| {
        const t = shapeValue(@as(f64, @floatFromInt(i)) / @as(f64, LUT_N - 1), sh);
        var r: f64 = undefined;
        var g: f64 = undefined;
        var b: f64 = undefined;
        switch (mix) {
            .oklab => {
                const rgb = color.oklabToLinearSrgb(
                    A[0] + (B[0] - A[0]) * t,
                    A[1] + (B[1] - A[1]) * t,
                    A[2] + (B[2] - A[2]) * t,
                );
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];
            },
            .srgb_linear => {
                r = Al[0] + (Bl[0] - Al[0]) * t;
                g = Al[1] + (Bl[1] - Al[1]) * t;
                b = Al[2] + (Bl[2] - Al[2]) * t;
            },
        }
        const k = i * 4;
        lut[k] = @floatCast(color.clamp01(r));
        lut[k + 1] = @floatCast(color.clamp01(g));
        lut[k + 2] = @floatCast(color.clamp01(b));
        lut[k + 3] = @floatCast(color.clamp01(ch.low.a + (ch.high.a - ch.low.a) * t));
    }
}

// ============================ смешивание ============================

fn blendCh(mode: doc.Blend, d: f64, s: f64) f64 {
    return switch (mode) {
        .normal => s,
        .multiply => d * s,
        .screen => d + s - d * s,
        .overlay => if (d <= 0.5) 2 * d * s else 1 - 2 * (1 - d) * (1 - s),
        .hard_light => if (s <= 0.5) 2 * s * d else 1 - 2 * (1 - s) * (1 - d),
        .soft_light => blk: {
            if (s <= 0.5) break :blk d - (1 - 2 * s) * d * (1 - d);
            const g = if (d <= 0.25) ((16 * d - 12) * d + 4) * d else @sqrt(d);
            break :blk d + (2 * s - 1) * (g - d);
        },
        .add => @min(1.0, d + s),
        .subtract => @max(0.0, d - s),
        .darken => @min(d, s),
        .lighten => @max(d, s),
        .difference => @abs(d - s),
    };
}

// ============================ дизеринг ============================

const DITHER_SALT = [4]i32{
    @bitCast(@as(u32, 0x1a2b3c4d)),
    @bitCast(@as(u32, 0x51ed2701)),
    @bitCast(@as(u32, 0x2545f491)),
    @bitCast(@as(u32, 0x9e3779b1)),
};

const bayer8: [64]f32 = blk: {
    const base = [64]u8{
        0,  32, 8,  40, 2,  34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
        12, 44, 4,  36, 14, 46, 6,  38, 60, 28, 52, 20, 62, 30, 54, 22,
        3,  35, 11, 43, 1,  33, 9,  41, 51, 19, 59, 27, 49, 17, 57, 25,
        15, 47, 7,  39, 13, 45, 5,  37, 63, 31, 55, 23, 61, 29, 53, 21,
    };
    var m: [64]f32 = undefined;
    for (base, 0..) |b, i| m[i] = (@as(f32, @floatFromInt(b)) + 0.5) / 64.0 - 0.5;
    break :blk m;
};

/// Позиционный TPDF: не зависит от порядка обхода, поэтому безопасен
/// при распараллеливании и идентичен клиентскому движку.
inline fn ditherTpdf(x: usize, y: usize, comp: usize, amt: f64) f64 {
    const h = hash2i(@intCast(x), @intCast(y), DITHER_SALT[comp]);
    const r1 = @as(f64, @floatFromInt(h >> 16)) / 65536.0;
    const r2 = @as(f64, @floatFromInt(h & 0xffff)) / 65536.0;
    return (r1 + r2 - 1.0) * amt;
}

// ============================ рендер ============================

pub const RenderError = FieldError;

pub const ChannelFields = struct {
    /// Поле для каждого включённого канала, в том же порядке, что в документе.
    /// null — канал выключен.
    items: []?Field,
};

/// Композит и вывод для полосы строк [y0, y1). Каналы обходятся последовательно,
/// но по пикселям всё независимо, поэтому полосы можно считать параллельно.
/// План канала: всё, что не зависит от пикселя, считается один раз.
const Plan = struct {
    data: [*]const f32,
    lut: [*]const f32,
    lo: f64,
    scale: f64,
    opacity: f64,
    blend: doc.Blend,
};

pub const MAX_PLANS = 64;

pub fn compositeBand(
    d: doc.Doc,
    fields: []const ?Field,
    luts: []const [LUT_N * 4]f32,
    sr: *const color.SrLut,
    out: []u8,
    w: usize,
    y0: usize,
    y1: usize,
) void {
    var plan_buf: [MAX_PLANS]Plan = undefined;
    var np: usize = 0;
    for (d.channels, 0..) |ch, ci| {
        if (np == MAX_PLANS) break;
        const fo = fields[ci] orelse continue;
        const lo = if (ch.noise.shape.normalize) fo.min else fo.cmin;
        const hi = if (ch.noise.shape.normalize) fo.max else fo.cmax;
        plan_buf[np] = .{
            .data = fo.data.ptr,
            .lut = @ptrCast(&luts[ci]),
            .lo = lo,
            .scale = if (hi > lo) @as(f64, LUT_N - 1) / (hi - lo) else 0,
            .opacity = ch.opacity,
            .blend = ch.blend,
        };
        np += 1;
    }
    const plans = plan_buf[0..np];

    const bg = color.okhslToLinear(d.background.h, d.background.s, d.background.l);
    const ba = d.background.a;
    const amt: f64 = if (d.dither_mode == .off) 0 else d.dither_amount;
    const top: f64 = @floatFromInt(LUT_N - 1);

    var y = y0;
    while (y < y1) : (y += 1) {
        const row = y * w;
        var x: usize = 0;
        while (x < w) : (x += 1) {
            const p = row + x;
            var ar = bg[0];
            var ag = bg[1];
            var ab = bg[2];
            var aa = ba;

            for (plans) |pl| {
                var fidx = (@as(f64, pl.data[p]) - pl.lo) * pl.scale;
                if (fidx < 0) fidx = 0 else if (fidx > top) fidx = top;
                const k: usize = @as(usize, @intFromFloat(fidx)) * 4;

                const sa = @as(f64, pl.lut[k + 3]) * pl.opacity;
                if (sa <= 0) continue;
                const s_r: f64 = pl.lut[k];
                const s_g: f64 = pl.lut[k + 1];
                const s_b: f64 = pl.lut[k + 2];
                const da = aa;
                const ao = sa + da * (1 - sa);
                if (ao <= 0) {
                    ar = 0;
                    ag = 0;
                    ab = 0;
                    aa = 0;
                    continue;
                }
                var R = s_r;
                var G = s_g;
                var B = s_b;
                if (pl.blend != .normal) {
                    R = blendCh(pl.blend, ar, s_r);
                    G = blendCh(pl.blend, ag, s_g);
                    B = blendCh(pl.blend, ab, s_b);
                }
                const w1 = (1 - da) * sa;
                const w2 = da * sa;
                const w3 = (1 - sa) * da;
                const inv = 1.0 / ao;
                ar = (w1 * s_r + w2 * R + w3 * ar) * inv;
                ag = (w1 * s_g + w2 * G + w3 * ag) * inv;
                ab = (w1 * s_b + w2 * B + w3 * ab) * inv;
                aa = ao;
            }

            const q = p * 4;
            const bayer: f64 = if (d.dither_mode == .ordered)
                @as(f64, bayer8[(y & 7) * 8 + (x & 7)]) * amt
            else
                0;
            const vals = [4]f64{ sr.map(ar) * 255.0, sr.map(ag) * 255.0, sr.map(ab) * 255.0, aa * 255.0 };
            inline for (0..4) |comp| {
                var v = vals[comp];
                if (amt != 0 and @abs(v - @round(v)) > 1e-4) {
                    v += if (d.dither_mode == .tpdf) ditherTpdf(x, y, comp, amt) else bayer;
                }
                out[q + comp] = if (v < 0) 0 else if (v > 255) 255 else @intFromFloat(v + 0.5);
            }
        }
    }
}

pub fn buildLuts(gpa: Allocator, d: doc.Doc) ![]const [LUT_N * 4]f32 {
    const luts = try gpa.alloc([LUT_N * 4]f32, d.channels.len);
    for (d.channels, 0..) |ch, i| buildStopLut(&luts[i], ch, d.stop_mix);
    return luts;
}
