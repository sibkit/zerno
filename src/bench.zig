//! Замер чистого счёта, без HTTP и без потоков: показывает, куда уходит время.
//! Запуск: zig build bench

const std = @import("std");
const doc = @import("doc.zig");
const engine = @import("engine.zig");
const color = @import("color.zig");

const CLK: std.Io.Clock = .awake;

fn elapsed(io: std.Io, t0: std.Io.Timestamp) u64 {
    return @intCast(t0.durationTo(CLK.now(io)).toNanoseconds());
}

fn n(t: doc.NoiseType) doc.Noise {
    return .{
        .type = t,
        .size_x = 186,
        .size_y = 186,
        .seed = 1337,
        .octaves = 4,
        .gain = 0.52,
        .lacunarity = 2,
        .ridged = false,
        .warp_amount = 0,
        .warp_size = 240,
        .worley_mode = .f1,
        .worley_jitter = 1,
        .grain_hp = 3,
        .shape = .{ .contrast = 0, .bias = 0, .gamma = 1, .invert = false, .normalize = true },
    };
}

fn bench(io: std.Io, gpa: std.mem.Allocator, name: []const u8, nz: doc.Noise, w: usize, h: usize, reps: usize) !void {
    var best: u64 = std.math.maxInt(u64);
    var r: usize = 0;
    while (r < reps) : (r += 1) {
        const t0 = CLK.now(io);
        const f = try engine.buildField(gpa, nz, w, h);
        const el = elapsed(io, t0);
        gpa.free(f.data);
        if (el < best) best = el;
    }
    const ms = @as(f64, @floatFromInt(best)) / 1e6;
    const px = @as(f64, @floatFromInt(w * h));
    std.debug.print("  {s: <34} {d: >8.2} мс   {d: >6.1} нс/px\n", .{ name, ms, @as(f64, @floatFromInt(best)) / px });
}

pub fn main(init: std.process.Init) !void {
    const gpa = init.gpa;
    const io = init.io;
    const W = 512;
    const H = 512;

    std.debug.print("\nПоля {d}×{d}, лучшее из 5 прогонов, один поток:\n", .{ W, H });

    var a = n(.perlin);
    try bench(io, gpa, "perlin 1 октава", blk: {
        var x = a;
        x.octaves = 1;
        break :blk x;
    }, W, H, 5);
    try bench(io, gpa, "perlin 4 октавы", a, W, H, 5);
    a.warp_amount = 38;
    try bench(io, gpa, "perlin 4 октавы + искажение", a, W, H, 5);

    var v = n(.value);
    v.octaves = 4;
    try bench(io, gpa, "value 4 октавы", v, W, H, 5);

    var wo = n(.worley);
    wo.size_x = 78;
    wo.size_y = 78;
    wo.octaves = 2;
    try bench(io, gpa, "worley 2 октавы", wo, W, H, 5);
    wo.warp_amount = 14;
    wo.warp_size = 160;
    try bench(io, gpa, "worley 2 октавы + искажение", wo, W, H, 5);

    var g = n(.grain);
    g.size_x = 1;
    g.size_y = 1;
    g.grain_hp = 0;
    try bench(io, gpa, "grain белый", g, W, H, 5);
    g.grain_hp = 4;
    try bench(io, gpa, "grain + ВЧ-фильтр 4", g, W, H, 5);

    // Композит и вывод целиком
    const preset =
        \\{"format":"zerno-noise-tile","version":1,"name":"b","tile":{"width":512,"height":512},
        \\ "render":{"stopMix":"oklab","dither":{"mode":"tpdf","amount":1},"webpQuality":1},
        \\ "background":{"h":258,"s":0.07,"l":0.145,"a":1},
        \\ "channels":[
        \\ {"id":"a","name":"Облака","enabled":true,"blend":"normal","opacity":1,
        \\  "noise":{"type":"perlin","sizeX":186,"sizeY":186,"seed":1337,"octaves":4,"gain":0.52,"lacunarity":2,
        \\   "ridged":false,"warpAmount":38,"warpSize":240,"worleyMode":"f1","worleyJitter":1,"grainHp":3,
        \\   "shape":{"contrast":0.1,"bias":0,"gamma":1,"invert":false,"normalize":true}},
        \\  "low":{"h":266,"s":0.24,"l":0.04,"a":0.34},"high":{"h":198,"s":0.3,"l":0.6,"a":0.13}},
        \\ {"id":"b","name":"Пятна","enabled":true,"blend":"soft-light","opacity":0.7,
        \\  "noise":{"type":"worley","sizeX":78,"sizeY":78,"seed":20260828,"octaves":2,"gain":0.45,"lacunarity":2,
        \\   "ridged":false,"warpAmount":14,"warpSize":160,"worleyMode":"f1","worleyJitter":1,"grainHp":3,
        \\   "shape":{"contrast":0.2,"bias":0,"gamma":1.1,"invert":true,"normalize":true}},
        \\  "low":{"h":38,"s":0.35,"l":0.3,"a":0},"high":{"h":38,"s":0.45,"l":0.72,"a":0.3}},
        \\ {"id":"c","name":"Зерно","enabled":true,"blend":"normal","opacity":1,
        \\  "noise":{"type":"grain","sizeX":1,"sizeY":1,"seed":777,"octaves":1,"gain":0.5,"lacunarity":2,
        \\   "ridged":false,"warpAmount":0,"warpSize":128,"worleyMode":"f1","worleyJitter":1,"grainHp":4,
        \\   "shape":{"contrast":0.35,"bias":0,"gamma":1,"invert":false,"normalize":true}},
        \\  "low":{"h":258,"s":0.05,"l":0,"a":0.075},"high":{"h":258,"s":0.05,"l":1,"a":0.075}}]}
    ;
    var arena = std.heap.ArenaAllocator.init(gpa);
    defer arena.deinit();
    var diag: doc.Diag = .{ .gpa = arena.allocator() };
    const d = try doc.parseText(arena.allocator(), preset, &diag);

    const sr: color.SrLut = .init();
    const fields = try gpa.alloc(?engine.Field, d.channels.len);
    defer gpa.free(fields);

    const tf0 = CLK.now(io);
    for (d.channels, 0..) |ch, i| fields[i] = try engine.buildField(gpa, ch.noise, W, H);
    const ms_fields = @as(f64, @floatFromInt(elapsed(io, tf0))) / 1e6;
    defer for (fields) |f| gpa.free(f.?.data);

    const tl0 = CLK.now(io);
    const luts = try engine.buildLuts(arena.allocator(), d);
    const ms_lut = @as(f64, @floatFromInt(elapsed(io, tl0))) / 1e6;

    const out = try gpa.alloc(u8, W * H * 4);
    defer gpa.free(out);

    var best: u64 = std.math.maxInt(u64);
    var r: usize = 0;
    while (r < 5) : (r += 1) {
        const t0 = CLK.now(io);
        engine.compositeBand(d, fields, luts, &sr, out, W, 0, H);
        const el = elapsed(io, t0);
        if (el < best) best = el;
    }
    std.debug.print("\nПресет «тёмный холст» {d}×{d}, один поток:\n", .{ W, H });
    std.debug.print("  {s: <34} {d: >8.2} мс\n", .{ "все 3 поля (сумма)", ms_fields });
    std.debug.print("  {s: <34} {d: >8.2} мс\n", .{ "цветовые таблицы", ms_lut });
    std.debug.print("  {s: <34} {d: >8.2} мс   {d: >6.1} нс/px\n", .{
        "композит + дизеринг + вывод",
        @as(f64, @floatFromInt(best)) / 1e6,
        @as(f64, @floatFromInt(best)) / @as(f64, @floatFromInt(W * H)),
    });
    std.debug.print("  {s: <34} {d: >8.2} мс\n", .{ "итого одним потоком", ms_fields + ms_lut + @as(f64, @floatFromInt(best)) / 1e6 });

    // сколько стоит дизеринг
    var d2 = d;
    d2.dither_mode = .off;
    var bnd: u64 = std.math.maxInt(u64);
    var rr: usize = 0;
    while (rr < 5) : (rr += 1) {
        const t0 = CLK.now(io);
        engine.compositeBand(d2, fields, luts, &sr, out, W, 0, H);
        const el = elapsed(io, t0);
        if (el < bnd) bnd = el;
    }
    std.debug.print("  {s: <34} {d: >8.2} мс   {d: >6.1} нс/px\n", .{
        "то же без дизеринга",
        @as(f64, @floatFromInt(bnd)) / 1e6,
        @as(f64, @floatFromInt(bnd)) / @as(f64, @floatFromInt(W * H)),
    });

    // --- масштабирование по потокам ---
    const cpu = std.Thread.getCpuCount() catch 4;
    std.debug.print("\nПостроение поля perlin 4 окт, 1024×1024, ядер {d}:\n", .{cpu});
    var nz = n(.perlin);
    nz.octaves = 4;
    var one_ms: f64 = 1;
    for ([_]usize{ 1, 2, 4, 8, 16 }) |lanes| {
        var bl: u64 = std.math.maxInt(u64);
        var q: usize = 0;
        while (q < 5) : (q += 1) {
            const t0 = CLK.now(io);
            const f = try engine.buildFieldPar(gpa, nz, 1024, 1024, .{ .io = io, .lanes = lanes });
            const el = elapsed(io, t0);
            gpa.free(f.data);
            if (el < bl) bl = el;
        }
        const msl = @as(f64, @floatFromInt(bl)) / 1e6;
        if (lanes == 1) one_ms = msl;
        std.debug.print("  потоков {d: >2}   {d: >7.2} мс   ускорение ×{d:.2}\n", .{ lanes, msl, one_ms / msl });
    }
    // --- накладные расходы планировщика ---
    const Spin = struct {
        acc: [64]u64 = @splat(0),
        fn work(c: *@This(), lo: usize, hi: usize) void {
            var s: u64 = 0;
            var i: usize = lo;
            while (i < hi) : (i += 1) s +%= i *% 2654435761;
            c.acc[lo % 64] +%= s;
        }
    };
    var sp: Spin = .{};
    std.debug.print("Накладные расходы Io.Group (задачи почти пустые):\n", .{});
    for ([_]usize{ 1, 4, 16, 32, 64 }) |tasks| {
        var bl: u64 = std.math.maxInt(u64);
        var q: usize = 0;
        while (q < 20) : (q += 1) {
            const t0 = CLK.now(io);
            const p: engine.Par = .{ .io = io, .lanes = tasks };
            p.rowsPublic(tasks * 24, &sp, Spin.work);
            const el = elapsed(io, t0);
            if (el < bl) bl = el;
        }
        std.debug.print("  задач {d: >3}   {d: >8.3} мс   {d: >7.1} мкс на задачу\n", .{
            tasks,
            @as(f64, @floatFromInt(bl)) / 1e6,
            @as(f64, @floatFromInt(bl)) / 1e3 / @as(f64, @floatFromInt(tasks)),
        });
    }
    std.debug.print("\n", .{});
}
