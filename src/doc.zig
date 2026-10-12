//! Модель документа и строгий разбор JSON.
//! Правило то же, что в клиенте: никаких молчаливых умолчаний. Отсутствующее
//! поле, лишнее поле, неверный тип или значение вне диапазона — ошибка
//! с точным адресом.

const std = @import("std");
const json = std.json;
const Allocator = std.mem.Allocator;

pub const FORMAT = "zerno-noise-tile";
pub const VERSION: i64 = 1;

pub const Color = struct { h: f64, s: f64, l: f64, a: f64 };

pub const Shape = struct {
    contrast: f64,
    bias: f64,
    gamma: f64,
    invert: bool,
    normalize: bool,
};

pub const NoiseType = enum {
    perlin,
    value,
    worley,
    grain,

    pub fn hasOctaves(t: NoiseType) bool {
        return t != .grain;
    }
    pub fn hasRidged(t: NoiseType) bool {
        return t == .perlin or t == .value;
    }
    pub fn hasWarp(t: NoiseType) bool {
        return t != .grain;
    }
    pub fn label(t: NoiseType) []const u8 {
        return switch (t) {
            .perlin => "Перлин — облака",
            .value => "Value — мягкий",
            .worley => "Ворлей — пятна",
            .grain => "Зерно — плёнка",
        };
    }
};

pub const WorleyMode = enum { f1, f2, f2f1 };

pub const Noise = struct {
    type: NoiseType,
    size_x: f64,
    size_y: f64,
    seed: i32,
    octaves: u32,
    gain: f64,
    lacunarity: u32,
    ridged: bool,
    warp_amount: f64,
    warp_size: f64,
    worley_mode: WorleyMode,
    worley_jitter: f64,
    grain_hp: u32,
    shape: Shape,
};

pub const Blend = enum {
    normal,
    multiply,
    screen,
    overlay,
    hard_light,
    soft_light,
    add,
    subtract,
    darken,
    lighten,
    difference,

    pub fn fromJson(s: []const u8) ?Blend {
        const table = [_]struct { []const u8, Blend }{
            .{ "normal", .normal },       .{ "multiply", .multiply },
            .{ "screen", .screen },       .{ "overlay", .overlay },
            .{ "hard-light", .hard_light }, .{ "soft-light", .soft_light },
            .{ "add", .add },             .{ "subtract", .subtract },
            .{ "darken", .darken },       .{ "lighten", .lighten },
            .{ "difference", .difference },
        };
        for (table) |e| if (std.mem.eql(u8, e[0], s)) return e[1];
        return null;
    }
    pub const names = "normal, multiply, screen, overlay, hard-light, soft-light, add, subtract, darken, lighten, difference";
};

pub const Channel = struct {
    name: []const u8,
    enabled: bool,
    blend: Blend,
    opacity: f64,
    noise: Noise,
    low: Color,
    high: Color,
};

pub const StopMix = enum { oklab, srgb_linear };
pub const DitherMode = enum { tpdf, ordered, off };

pub const Doc = struct {
    name: []const u8,
    tile_w: u32,
    tile_h: u32,
    stop_mix: StopMix,
    dither_mode: DitherMode,
    dither_amount: f64,
    webp_quality: f64,
    background: Color,
    channels: []Channel,
};

/// Накопитель сообщения об ошибке.
pub const Diag = struct {
    gpa: Allocator,
    message: []const u8 = "",

    pub fn fail(d: *Diag, comptime fmt: []const u8, args: anytype) error{Invalid} {
        d.message = std.fmt.allocPrint(d.gpa, fmt, args) catch "не удалось построить сообщение об ошибке";
        return error.Invalid;
    }
};

pub const ParseError = error{Invalid} || Allocator.Error;

fn typeName(v: json.Value) []const u8 {
    return switch (v) {
        .null => "null",
        .bool => "boolean",
        .integer, .float, .number_string => "number",
        .string => "string",
        .array => "массив",
        .object => "object",
    };
}

fn asNumber(v: json.Value) ?f64 {
    return switch (v) {
        .integer => |i| @floatFromInt(i),
        .float => |f| f,
        .number_string => |s| std.fmt.parseFloat(f64, s) catch null,
        else => null,
    };
}

fn vObj(v: json.Value, path: []const u8, d: *Diag) ParseError!json.ObjectMap {
    return switch (v) {
        .object => |o| o,
        else => d.fail("{s}: ожидается объект, получено {s}", .{ path, typeName(v) }),
    };
}

fn vHas(o: json.ObjectMap, path: []const u8, key: []const u8, d: *Diag) ParseError!json.Value {
    return o.get(key) orelse d.fail("{s}.{s}: поле отсутствует (обязательное)", .{ path, key });
}

fn vNum(o: json.ObjectMap, path: []const u8, key: []const u8, lo: f64, hi: f64, d: *Diag) ParseError!f64 {
    const v = try vHas(o, path, key, d);
    const n = asNumber(v) orelse
        return d.fail("{s}.{s}: ожидается число, получено {s}", .{ path, key, typeName(v) });
    if (!std.math.isFinite(n) or n < lo or n > hi)
        return d.fail("{s}.{s}: значение {d} вне диапазона [{d}; {d}]", .{ path, key, n, lo, hi });
    return n;
}

fn vInt(o: json.ObjectMap, path: []const u8, key: []const u8, lo: f64, hi: f64, d: *Diag) ParseError!i64 {
    const n = try vNum(o, path, key, lo, hi, d);
    if (@floor(n) != n)
        return d.fail("{s}.{s}: ожидается целое число, получено {d}", .{ path, key, n });
    return @intFromFloat(n);
}

fn vBool(o: json.ObjectMap, path: []const u8, key: []const u8, d: *Diag) ParseError!bool {
    const v = try vHas(o, path, key, d);
    return switch (v) {
        .bool => |b| b,
        else => d.fail("{s}.{s}: ожидается true/false, получено {s}", .{ path, key, typeName(v) }),
    };
}

fn vStr(o: json.ObjectMap, path: []const u8, key: []const u8, d: *Diag) ParseError![]const u8 {
    const v = try vHas(o, path, key, d);
    return switch (v) {
        .string => |s| s,
        else => d.fail("{s}.{s}: ожидается строка, получено {s}", .{ path, key, typeName(v) }),
    };
}

fn vKeys(o: json.ObjectMap, path: []const u8, allowed: []const []const u8, d: *Diag) ParseError!void {
    for (o.keys()) |k| {
        var found = false;
        for (allowed) |a| {
            if (std.mem.eql(u8, a, k)) {
                found = true;
                break;
            }
        }
        if (!found) {
            var list: std.ArrayList(u8) = .empty;
            defer list.deinit(d.gpa);
            for (allowed, 0..) |a, i| {
                if (i != 0) list.appendSlice(d.gpa, ", ") catch {};
                list.appendSlice(d.gpa, a) catch {};
            }
            return d.fail("{s}.{s}: неизвестное поле. Допустимы: {s}", .{ path, k, list.items });
        }
    }
}

fn vEnum(
    comptime T: type,
    o: json.ObjectMap,
    path: []const u8,
    key: []const u8,
    comptime allowed: []const u8,
    d: *Diag,
    map: *const fn ([]const u8) ?T,
) ParseError!T {
    const s = try vStr(o, path, key, d);
    return map(s) orelse
        d.fail("{s}.{s}: недопустимое значение \"{s}\". Допустимо: {s}", .{ path, key, s, allowed });
}

fn mapNoiseType(s: []const u8) ?NoiseType {
    inline for (@typeInfo(NoiseType).@"enum".fields) |f| {
        if (std.mem.eql(u8, f.name, s)) return @field(NoiseType, f.name);
    }
    return null;
}
fn mapWorley(s: []const u8) ?WorleyMode {
    inline for (@typeInfo(WorleyMode).@"enum".fields) |f| {
        if (std.mem.eql(u8, f.name, s)) return @field(WorleyMode, f.name);
    }
    return null;
}
fn mapStopMix(s: []const u8) ?StopMix {
    if (std.mem.eql(u8, s, "oklab")) return .oklab;
    if (std.mem.eql(u8, s, "srgb-linear")) return .srgb_linear;
    return null;
}
fn mapDither(s: []const u8) ?DitherMode {
    inline for (@typeInfo(DitherMode).@"enum".fields) |f| {
        if (std.mem.eql(u8, f.name, s)) return @field(DitherMode, f.name);
    }
    return null;
}

fn parseColor(v: json.Value, path: []const u8, d: *Diag) ParseError!Color {
    const o = try vObj(v, path, d);
    try vKeys(o, path, &.{ "h", "s", "l", "a" }, d);
    return .{
        .h = try vNum(o, path, "h", 0, 360, d),
        .s = try vNum(o, path, "s", 0, 1, d),
        .l = try vNum(o, path, "l", 0, 1, d),
        .a = try vNum(o, path, "a", 0, 1, d),
    };
}

const NOISE_KEYS = [_][]const u8{
    "type",       "sizeX",      "sizeY",        "seed",  "octaves",
    "gain",       "lacunarity", "ridged",       "warpAmount", "warpSize",
    "worleyMode", "worleyJitter", "grainHp",    "shape",
};

fn parseNoise(v: json.Value, path: []const u8, d: *Diag) ParseError!Noise {
    const o = try vObj(v, path, d);
    try vKeys(o, path, &NOISE_KEYS, d);

    const shape_path = try std.fmt.allocPrint(d.gpa, "{s}.shape", .{path});
    const sv = try vHas(o, path, "shape", d);
    const s = try vObj(sv, shape_path, d);
    try vKeys(s, shape_path, &.{ "contrast", "bias", "gamma", "invert", "normalize" }, d);

    return .{
        .type = try vEnum(NoiseType, o, path, "type", "perlin, value, worley, grain", d, mapNoiseType),
        .size_x = try vNum(o, path, "sizeX", 0.5, 8192, d),
        .size_y = try vNum(o, path, "sizeY", 0.5, 8192, d),
        .seed = @intCast(try vInt(o, path, "seed", -2147483648, 2147483647, d)),
        .octaves = @intCast(try vInt(o, path, "octaves", 1, 12, d)),
        .gain = try vNum(o, path, "gain", 0, 1, d),
        .lacunarity = @intCast(try vInt(o, path, "lacunarity", 2, 4, d)),
        .ridged = try vBool(o, path, "ridged", d),
        .warp_amount = try vNum(o, path, "warpAmount", 0, 2000, d),
        .warp_size = try vNum(o, path, "warpSize", 1, 8192, d),
        .worley_mode = try vEnum(WorleyMode, o, path, "worleyMode", "f1, f2, f2f1", d, mapWorley),
        .worley_jitter = try vNum(o, path, "worleyJitter", 0, 1, d),
        .grain_hp = @intCast(try vInt(o, path, "grainHp", 0, 64, d)),
        .shape = .{
            .contrast = try vNum(s, shape_path, "contrast", -1, 1, d),
            .bias = try vNum(s, shape_path, "bias", -0.5, 0.5, d),
            .gamma = try vNum(s, shape_path, "gamma", 0.1, 8, d),
            .invert = try vBool(s, shape_path, "invert", d),
            .normalize = try vBool(s, shape_path, "normalize", d),
        },
    };
}

fn parseChannel(v: json.Value, path: []const u8, d: *Diag) ParseError!Channel {
    const o = try vObj(v, path, d);
    try vKeys(o, path, &.{ "id", "name", "enabled", "blend", "opacity", "noise", "low", "high" }, d);
    _ = try vStr(o, path, "id", d);
    const blend_str = try vStr(o, path, "blend", d);
    const blend = Blend.fromJson(blend_str) orelse
        return d.fail("{s}.blend: недопустимое значение \"{s}\". Допустимо: {s}", .{ path, blend_str, Blend.names });

    const noise_path = try std.fmt.allocPrint(d.gpa, "{s}.noise", .{path});
    const low_path = try std.fmt.allocPrint(d.gpa, "{s}.low", .{path});
    const high_path = try std.fmt.allocPrint(d.gpa, "{s}.high", .{path});

    return .{
        .name = try vStr(o, path, "name", d),
        .enabled = try vBool(o, path, "enabled", d),
        .blend = blend,
        .opacity = try vNum(o, path, "opacity", 0, 1, d),
        .noise = try parseNoise(try vHas(o, path, "noise", d), noise_path, d),
        .low = try parseColor(try vHas(o, path, "low", d), low_path, d),
        .high = try parseColor(try vHas(o, path, "high", d), high_path, d),
    };
}

/// Разбирает уже распарсенное JSON-значение в документ.
pub fn parse(v: json.Value, d: *Diag) ParseError!Doc {
    const root = "документ";
    const o = try vObj(v, root, d);
    try vKeys(o, root, &.{ "format", "version", "name", "tile", "render", "background", "channels" }, d);

    const fmt_s = try vStr(o, root, "format", d);
    if (!std.mem.eql(u8, fmt_s, FORMAT))
        return d.fail("документ.format: ожидается \"{s}\", получено \"{s}\"", .{ FORMAT, fmt_s });
    const ver = try vInt(o, root, "version", 1, 1000, d);
    if (ver != VERSION)
        return d.fail("документ.version: файл версии {d}, поддерживается только {d}", .{ ver, VERSION });

    const tile = try vObj(try vHas(o, root, "tile", d), "документ.tile", d);
    try vKeys(tile, "документ.tile", &.{ "width", "height" }, d);

    const render = try vObj(try vHas(o, root, "render", d), "документ.render", d);
    try vKeys(render, "документ.render", &.{ "stopMix", "dither", "webpQuality" }, d);
    const dith = try vObj(try vHas(render, "документ.render", "dither", d), "документ.render.dither", d);
    try vKeys(dith, "документ.render.dither", &.{ "mode", "amount" }, d);

    const chans_v = try vHas(o, root, "channels", d);
    const chans = switch (chans_v) {
        .array => |a| a,
        else => return d.fail("документ.channels: ожидается массив, получено {s}", .{typeName(chans_v)}),
    };

    const list = try d.gpa.alloc(Channel, chans.items.len);
    for (chans.items, 0..) |c, i| {
        const p = try std.fmt.allocPrint(d.gpa, "документ.channels[{d}]", .{i});
        list[i] = try parseChannel(c, p, d);
    }

    return .{
        .name = try vStr(o, root, "name", d),
        .tile_w = @intCast(try vInt(tile, "документ.tile", "width", 8, 4096, d)),
        .tile_h = @intCast(try vInt(tile, "документ.tile", "height", 8, 4096, d)),
        .stop_mix = try vEnum(StopMix, render, "документ.render", "stopMix", "oklab, srgb-linear", d, mapStopMix),
        .dither_mode = try vEnum(DitherMode, dith, "документ.render.dither", "mode", "tpdf, ordered, off", d, mapDither),
        .dither_amount = try vNum(dith, "документ.render.dither", "amount", 0, 4, d),
        .webp_quality = try vNum(render, "документ.render", "webpQuality", 0, 1, d),
        .background = try parseColor(try vHas(o, root, "background", d), "документ.background", d),
        .channels = list,
    };
}

/// Разбирает текст JSON. Память берётся из `gpa` (ожидается арена).
pub fn parseText(gpa: Allocator, text: []const u8, d: *Diag) ParseError!Doc {
    const v = json.parseFromSliceLeaky(json.Value, gpa, text, .{}) catch |err| {
        return d.fail("не разбирается как JSON: {t}", .{err});
    };
    return parse(v, d);
}
