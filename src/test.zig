//! Тесты движка: бесшовность, диапазоны, строгость разбора.

const std = @import("std");
const color = @import("color.zig");
const doc = @import("doc.zig");
const engine = @import("engine.zig");

test {
    std.testing.refAllDecls(@This());
    _ = color;
    _ = doc;
    _ = engine;
}

fn baseNoise(t: doc.NoiseType) doc.Noise {
    return .{
        .type = t,
        .size_x = 37,
        .size_y = 29,
        .seed = 4242,
        .octaves = 4,
        .gain = 0.5,
        .lacunarity = 2,
        .ridged = false,
        .warp_amount = 0,
        .warp_size = 57,
        .worley_mode = .f1,
        .worley_jitter = 1,
        .grain_hp = 3,
        .shape = .{ .contrast = 0, .bias = 0, .gamma = 1, .invert = false, .normalize = true },
    };
}

/// Отношение разности на стыке к 95-му процентилю внутренних разностей.
/// Для бесшовного поля стык ничем не выделяется, отношение около единицы.
fn seamRatio(gpa: std.mem.Allocator, data: []const f32, w: usize, h: usize) ![2]f64 {
    const dx = try gpa.alloc(f64, w);
    defer gpa.free(dx);
    const dy = try gpa.alloc(f64, h);
    defer gpa.free(dy);

    for (0..w) |x| {
        const xn = (x + 1) % w;
        var a: f64 = 0;
        for (0..h) |y| a += @abs(@as(f64, data[y * w + xn]) - @as(f64, data[y * w + x]));
        dx[x] = a / @as(f64, @floatFromInt(h));
    }
    for (0..h) |y| {
        const yn = (y + 1) % h;
        var a: f64 = 0;
        for (0..w) |x| a += @abs(@as(f64, data[yn * w + x]) - @as(f64, data[y * w + x]));
        dy[y] = a / @as(f64, @floatFromInt(w));
    }
    return .{ try ratio(gpa, dx), try ratio(gpa, dy) };
}

fn ratio(gpa: std.mem.Allocator, d: []const f64) !f64 {
    const wrap = d[d.len - 1];
    const inner = try gpa.dupe(f64, d[0 .. d.len - 1]);
    defer gpa.free(inner);
    std.mem.sort(f64, inner, {}, std.sort.asc(f64));
    const p95 = inner[@intFromFloat(0.95 * @as(f64, @floatFromInt(inner.len - 1)))];
    if (p95 <= 1e-12) return if (wrap > 1e-9) std.math.inf(f64) else 0;
    return wrap / p95;
}

test "поля всех типов бесшовны" {
    const gpa = std.testing.allocator;
    const w: usize = 192;
    const h: usize = 128;

    var cases: [10]doc.Noise = undefined;
    cases[0] = baseNoise(.perlin);
    cases[1] = baseNoise(.perlin);
    cases[1].ridged = true;
    cases[2] = baseNoise(.perlin);
    cases[2].warp_amount = 25;
    cases[2].warp_size = 40;
    cases[3] = baseNoise(.perlin);
    cases[3].lacunarity = 3;
    cases[3].octaves = 3;
    cases[4] = baseNoise(.value);
    cases[5] = baseNoise(.worley);
    cases[5].size_x = 24;
    cases[5].size_y = 24;
    cases[5].octaves = 1;
    cases[6] = baseNoise(.worley);
    cases[6].worley_mode = .f2f1;
    cases[6].size_x = 24;
    cases[6].size_y = 24;
    cases[6].octaves = 2;
    cases[6].warp_amount = 12;
    cases[6].warp_size = 48;
    cases[7] = baseNoise(.grain);
    cases[7].size_x = 1;
    cases[7].size_y = 1;
    cases[7].grain_hp = 0;
    cases[8] = baseNoise(.grain);
    cases[8].size_x = 1;
    cases[8].size_y = 1;
    cases[8].grain_hp = 4;
    cases[9] = baseNoise(.grain);
    cases[9].size_x = 6;
    cases[9].size_y = 6;
    cases[9].grain_hp = 0;

    for (cases, 0..) |n, i| {
        const f = try engine.buildField(gpa, n, w, h);
        defer gpa.free(f.data);
        const r = try seamRatio(gpa, f.data, w, h);
        if (r[0] > 2 or r[1] > 2) {
            std.debug.print("случай {d}: стык X={d:.3} Y={d:.3}\n", .{ i, r[0], r[1] });
            return error.SeamDetected;
        }
    }
}

test "контроль: обрезка не по периоду ломает стык" {
    const gpa = std.testing.allocator;
    const w: usize = 192;
    const h: usize = 128;
    const w2 = w + 13;
    const f = try engine.buildField(gpa, baseNoise(.perlin), w2, h);
    defer gpa.free(f.data);
    const crop = try gpa.alloc(f32, w * h);
    defer gpa.free(crop);
    for (0..h) |y| for (0..w) |x| {
        crop[y * w + x] = f.data[y * w2 + x];
    };
    const r = try seamRatio(gpa, crop, w, h);
    try std.testing.expect(r[0] > 3);
    try std.testing.expect(r[1] <= 2);
}

test "вырожденная ячейка отвергается, зерно 1 px допустимо" {
    const gpa = std.testing.allocator;
    var n = baseNoise(.perlin);
    n.size_x = 1;
    n.size_y = 1;
    try std.testing.expectError(error.DegenerateCell, engine.buildField(gpa, n, 64, 64));

    var g = baseNoise(.grain);
    g.size_x = 1;
    g.size_y = 1;
    g.grain_hp = 0;
    const f = try engine.buildField(gpa, g, 64, 64);
    defer gpa.free(f.data);
    try std.testing.expect(f.max > 0.9);
}

test "нечётные и крошечные плитки" {
    const gpa = std.testing.allocator;
    const sizes = [_][2]usize{ .{ 513, 385 }, .{ 29, 38 }, .{ 8, 8 }, .{ 255, 255 } };
    for (sizes) |s| {
        for ([_]doc.NoiseType{ .perlin, .value, .worley }) |t| {
            var n = baseNoise(t);
            n.size_x = 2;
            n.size_y = 2;
            n.octaves = 3;
            const f = try engine.buildField(gpa, n, s[0], s[1]);
            defer gpa.free(f.data);
            const r = try seamRatio(gpa, f.data, s[0], s[1]);
            try std.testing.expect(r[0] <= 2 and r[1] <= 2);
        }
    }
}

test "ограничение октав" {
    var n = baseNoise(.perlin);
    n.size_x = 64;
    n.size_y = 64;
    n.octaves = 10;
    try std.testing.expectEqual(@as(u32, 6), engine.maxOctavesFor(n, 256, 256));
    const gpa = std.testing.allocator;
    const f = try engine.buildField(gpa, n, 256, 256);
    defer gpa.free(f.data);
    try std.testing.expectEqual(@as(u32, 6), f.octaves_used);
}

test "строгий разбор документа" {
    const gpa = std.testing.allocator;
    var arena = std.heap.ArenaAllocator.init(gpa);
    defer arena.deinit();
    const a = arena.allocator();

    const good =
        \\{"format":"zerno-noise-tile","version":1,"name":"t",
        \\ "tile":{"width":64,"height":64},
        \\ "render":{"stopMix":"oklab","dither":{"mode":"tpdf","amount":1},"webpQuality":1},
        \\ "background":{"h":10,"s":0.1,"l":0.2,"a":1},
        \\ "channels":[{"id":"a","name":"a","enabled":true,"blend":"soft-light","opacity":1,
        \\   "noise":{"type":"perlin","sizeX":32,"sizeY":32,"seed":1,"octaves":2,"gain":0.5,
        \\     "lacunarity":2,"ridged":false,"warpAmount":0,"warpSize":64,"worleyMode":"f1",
        \\     "worleyJitter":1,"grainHp":3,
        \\     "shape":{"contrast":0,"bias":0,"gamma":1,"invert":false,"normalize":true}},
        \\   "low":{"h":0,"s":0,"l":0,"a":0},"high":{"h":0,"s":0,"l":1,"a":1}}]}
    ;
    var d1: doc.Diag = .{ .gpa = a };
    const parsed = try doc.parseText(a, good, &d1);
    try std.testing.expectEqual(@as(u32, 64), parsed.tile_w);
    try std.testing.expectEqual(doc.Blend.soft_light, parsed.channels[0].blend);

    const bad_cases = [_]struct { []const u8, []const u8 }{
        .{ \\{"format":"zerno-noise-tile","version":1}
        , "поле отсутствует" },
        .{ \\{"format":"other","version":1,"name":"x","tile":{"width":8,"height":8},"render":{},"background":{},"channels":[]}
        , "format" },
        .{ \\{"format":"zerno-noise-tile","version":2,"name":"x","tile":{"width":8,"height":8},"render":{},"background":{},"channels":[]}
        , "версии 2" },
    };
    for (bad_cases) |c| {
        var d2: doc.Diag = .{ .gpa = a };
        try std.testing.expectError(error.Invalid, doc.parseText(a, c[0], &d2));
        if (std.mem.indexOf(u8, d2.message, c[1]) == null) {
            std.debug.print("ожидалась подстрока «{s}», получено «{s}»\n", .{ c[1], d2.message });
            return error.WrongMessage;
        }
    }
}
