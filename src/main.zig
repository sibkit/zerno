//! ЗЕРНО — сервер расчёта шумовых плиток.
//!
//! Отдаёт статику приложения и считает плитки нативно, пачками, в несколько
//! потоков, с кэшем шумовых полей (правка цвета не пересчитывает шум).

const std = @import("std");
const Io = std.Io;
const net = std.Io.net;
const http = std.http;
const json = std.json;
const Allocator = std.mem.Allocator;

const doc_mod = @import("doc.zig");
const engine = @import("engine.zig");
const color = @import("color.zig");

pub const VERSION = "1.0.0";

const log = std.log.scoped(.zerno);

// ============================ кэш шумовых полей ============================

const CacheEntry = struct {
    key: u64,
    data: []f32,
    min: f64,
    max: f64,
    cmin: f64,
    cmax: f64,
    refs: std.atomic.Value(u32),
    stamp: u64,

    fn field(e: *const CacheEntry) engine.Field {
        return .{
            .data = e.data,
            .min = e.min,
            .max = e.max,
            .cmin = e.cmin,
            .cmax = e.cmax,
            .octaves_used = 0,
        };
    }
};

const FieldCache = struct {
    gpa: Allocator,
    mutex: Io.Mutex = .init,
    map: std.AutoHashMapUnmanaged(u64, *CacheEntry) = .empty,
    bytes: usize = 0,
    clock: u64 = 0,
    limit_bytes: usize,
    hits: u64 = 0,
    misses: u64 = 0,

    fn get(c: *FieldCache, io: Io, key: u64) ?*CacheEntry {
        c.mutex.lockUncancelable(io);
        defer c.mutex.unlock(io);
        const e = c.map.get(key) orelse {
            c.misses += 1;
            return null;
        };
        c.hits += 1;
        c.clock += 1;
        e.stamp = c.clock;
        _ = e.refs.fetchAdd(1, .acq_rel);
        return e;
    }

    /// Забирает владение `data`. Возвращает запись с уже взятой ссылкой.
    fn put(c: *FieldCache, io: Io, key: u64, f: engine.Field) !*CacheEntry {
        c.mutex.lockUncancelable(io);
        defer c.mutex.unlock(io);

        if (c.map.get(key)) |old| {
            // Кто-то успел раньше — наш экземпляр лишний.
            c.gpa.free(f.data);
            _ = old.refs.fetchAdd(1, .acq_rel);
            return old;
        }
        const e = try c.gpa.create(CacheEntry);
        c.clock += 1;
        e.* = .{
            .key = key,
            .data = f.data,
            .min = f.min,
            .max = f.max,
            .cmin = f.cmin,
            .cmax = f.cmax,
            .refs = .init(1),
            .stamp = c.clock,
        };
        try c.map.put(c.gpa, key, e);
        c.bytes += f.data.len * @sizeOf(f32);
        c.evictLocked();
        return e;
    }

    fn release(c: *FieldCache, e: *CacheEntry) void {
        _ = c;
        _ = e.refs.fetchSub(1, .acq_rel);
    }

    /// Вытесняет самые давние записи, которыми никто не пользуется.
    fn evictLocked(c: *FieldCache) void {
        while (c.bytes > c.limit_bytes) {
            var oldest: ?*CacheEntry = null;
            var it = c.map.iterator();
            while (it.next()) |kv| {
                const e = kv.value_ptr.*;
                if (e.refs.load(.acquire) != 0) continue;
                if (oldest == null or e.stamp < oldest.?.stamp) oldest = e;
            }
            const victim = oldest orelse return; // всё занято — подождём следующего раза
            _ = c.map.remove(victim.key);
            c.bytes -= victim.data.len * @sizeOf(f32);
            c.gpa.free(victim.data);
            c.gpa.destroy(victim);
        }
    }
};

fn noiseKey(n: doc_mod.Noise, w: usize, h: usize) u64 {
    var hh = std.hash.Wyhash.init(0x2e5f_0a1d);
    hh.update(std.mem.asBytes(&@as(u8, @intFromEnum(n.type))));
    hh.update(std.mem.asBytes(&n.size_x));
    hh.update(std.mem.asBytes(&n.size_y));
    hh.update(std.mem.asBytes(&n.seed));
    hh.update(std.mem.asBytes(&n.octaves));
    hh.update(std.mem.asBytes(&n.gain));
    hh.update(std.mem.asBytes(&n.lacunarity));
    hh.update(std.mem.asBytes(&@as(u8, @intFromBool(n.ridged))));
    hh.update(std.mem.asBytes(&n.warp_amount));
    hh.update(std.mem.asBytes(&n.warp_size));
    hh.update(std.mem.asBytes(&@as(u8, @intFromEnum(n.worley_mode))));
    hh.update(std.mem.asBytes(&n.worley_jitter));
    hh.update(std.mem.asBytes(&n.grain_hp));
    hh.update(std.mem.asBytes(&w));
    hh.update(std.mem.asBytes(&h));
    return hh.final();
}

// ============================ параллельный запуск ============================

fn parallelFor(io: Io, n: usize, ctx: anytype, comptime f: anytype) void {
    if (n == 0) return;
    const Ctx = @TypeOf(ctx);
    const R = struct {
        fn one(c: Ctx, i: usize) void {
            f(c, i);
        }
    };
    if (n == 1) {
        R.one(ctx, 0);
        return;
    }
    var group: Io.Group = .init;
    var i: usize = 1;
    while (i < n) : (i += 1) {
        group.concurrent(io, R.one, .{ ctx, i }) catch R.one(ctx, i);
    }
    R.one(ctx, 0);
    group.@"await"(io) catch {};
}

// ============================ приложение ============================

const App = struct {
    io: Io,
    gpa: Allocator,
    root: Io.Dir,
    root_path: []const u8,
    sr: color.SrLut,
    cache: FieldCache,
    threads: usize,
    rendered: std.atomic.Value(u64) = .init(0),
};

const Miss = struct { job: usize, ch: usize, key: u64 };

const Job = struct {
    d: doc_mod.Doc,
    w: usize,
    h: usize,
    fields: []?engine.Field,
    entries: []?*CacheEntry,
    luts: []const [engine.LUT_N * 4]f32,
    out: []u8,
};

const BandCtx = struct {
    app: *App,
    jobs: []Job,
    bands: []const Band,
};

const Band = struct { job: usize, y0: usize, y1: usize };

fn compositeOne(c: *BandCtx, i: usize) void {
    const b = c.bands[i];
    const j = &c.jobs[b.job];
    engine.compositeBand(j.d, j.fields, j.luts, &c.app.sr, j.out, j.w, b.y0, b.y1);
}

// ============================ HTTP ============================

fn respondError(req: *http.Server.Request, status: http.Status, arena: Allocator, msg: []const u8) !void {
    const body = try std.fmt.allocPrint(arena, "{{\"error\":{f}}}", .{jsonString(msg)});
    try req.respond(body, .{
        .status = status,
        .extra_headers = &.{
            .{ .name = "content-type", .value = "application/json; charset=utf-8" },
            .{ .name = "cache-control", .value = "no-store" },
        },
    });
}

/// Обёртка для форматирования строки как литерала JSON.
const JsonString = struct {
    s: []const u8,
    pub fn format(self: JsonString, w: *std.Io.Writer) std.Io.Writer.Error!void {
        try w.writeByte('"');
        for (self.s) |ch| switch (ch) {
            '"' => try w.writeAll("\\\""),
            '\\' => try w.writeAll("\\\\"),
            '\n' => try w.writeAll("\\n"),
            '\r' => try w.writeAll("\\r"),
            '\t' => try w.writeAll("\\t"),
            else => {
                if (ch < 0x20) {
                    try w.print("\\u{x:0>4}", .{ch});
                } else {
                    try w.writeByte(ch);
                }
            },
        };
        try w.writeByte('"');
    }
};
fn jsonString(s: []const u8) JsonString {
    return .{ .s = s };
}

fn handleRender(app: *App, req: *http.Server.Request, arena: Allocator, body: []const u8) !void {
    const io = app.io;
    var diag: doc_mod.Diag = .{ .gpa = arena };

    const root_v = json.parseFromSliceLeaky(json.Value, arena, body, .{}) catch |err| {
        return respondError(req, .bad_request, arena, try std.fmt.allocPrint(arena, "тело запроса не разбирается как JSON: {t}", .{err}));
    };
    const root_o = switch (root_v) {
        .object => |o| o,
        else => return respondError(req, .bad_request, arena, "ожидается объект {\"jobs\":[...]}"),
    };
    const jobs_v = root_o.get("jobs") orelse
        return respondError(req, .bad_request, arena, "запрос.jobs: поле отсутствует (обязательное)");
    const jobs_arr = switch (jobs_v) {
        .array => |a| a,
        else => return respondError(req, .bad_request, arena, "запрос.jobs: ожидается массив"),
    };
    if (jobs_arr.items.len == 0)
        return respondError(req, .bad_request, arena, "запрос.jobs: пустой список");
    if (jobs_arr.items.len > 256)
        return respondError(req, .bad_request, arena, "запрос.jobs: больше 256 задач за раз не принимается");

    const jobs = try arena.alloc(Job, jobs_arr.items.len);
    var total_px: usize = 0;

    for (jobs_arr.items, 0..) |jv, i| {
        const jo = switch (jv) {
            .object => |o| o,
            else => return respondError(req, .bad_request, arena, try std.fmt.allocPrint(arena, "запрос.jobs[{d}]: ожидается объект", .{i})),
        };
        const path = try std.fmt.allocPrint(arena, "запрос.jobs[{d}]", .{i});
        const w_v = jo.get("width") orelse return respondError(req, .bad_request, arena, try std.fmt.allocPrint(arena, "{s}.width: поле отсутствует", .{path}));
        const h_v = jo.get("height") orelse return respondError(req, .bad_request, arena, try std.fmt.allocPrint(arena, "{s}.height: поле отсутствует", .{path}));
        const wi = switch (w_v) {
            .integer => |n| n,
            else => return respondError(req, .bad_request, arena, try std.fmt.allocPrint(arena, "{s}.width: ожидается целое число", .{path})),
        };
        const hi = switch (h_v) {
            .integer => |n| n,
            else => return respondError(req, .bad_request, arena, try std.fmt.allocPrint(arena, "{s}.height: ожидается целое число", .{path})),
        };
        if (wi < 1 or wi > 4096 or hi < 1 or hi > 4096)
            return respondError(req, .bad_request, arena, try std.fmt.allocPrint(arena, "{s}: размер {d}×{d} вне диапазона [1; 4096]", .{ path, wi, hi }));

        const dv = jo.get("doc") orelse return respondError(req, .bad_request, arena, try std.fmt.allocPrint(arena, "{s}.doc: поле отсутствует", .{path}));
        const d = doc_mod.parse(dv, &diag) catch {
            return respondError(req, .bad_request, arena, try std.fmt.allocPrint(arena, "{s}.doc: {s}", .{ path, diag.message }));
        };

        jobs[i] = .{
            .d = d,
            .w = @intCast(wi),
            .h = @intCast(hi),
            .fields = try arena.alloc(?engine.Field, d.channels.len),
            .entries = try arena.alloc(?*CacheEntry, d.channels.len),
            .luts = try engine.buildLuts(arena, d),
            .out = &.{},
        };
        @memset(jobs[i].fields, null);
        @memset(jobs[i].entries, null);
        total_px += jobs[i].w * jobs[i].h;
    }

    if (total_px > 64 * 1024 * 1024)
        return respondError(req, .bad_request, arena, "суммарная площадь задач слишком велика");

    // ---- этап 1: поля. Кэш трогаем только из этого потока. ----
    var misses: std.ArrayList(Miss) = .empty;
    defer misses.deinit(arena);

    for (jobs, 0..) |*j, ji| {
        for (j.d.channels, 0..) |ch, ci| {
            if (!ch.enabled) continue;
            const key = noiseKey(ch.noise, j.w, j.h);
            if (app.cache.get(io, key)) |e| {
                j.entries[ci] = e;
                j.fields[ci] = e.field();
            } else {
                try misses.append(arena, .{ .job = ji, .ch = ci, .key = key });
            }
        }
    }

    defer for (jobs) |j| {
        for (j.entries) |maybe| if (maybe) |e| app.cache.release(e);
    };

    if (misses.items.len > 0) {
        const results = try arena.alloc(engine.FieldError!engine.Field, misses.items.len);
        // Поля строим по одному, но каждое — всеми ядрами по полосам строк.
        // Так и одна большая плитка, и пачка мелких загружают процессор целиком,
        // и при этом нет вложенных групп задач.
        const par: engine.Par = .{ .io = io, .lanes = app.threads };
        for (misses.items, 0..) |m, i| {
            const j = &jobs[m.job];
            results[i] = engine.buildFieldPar(app.gpa, j.d.channels[m.ch].noise, j.w, j.h, par);
        }

        for (misses.items, 0..) |m, i| {
            const f = results[i] catch |err| {
                for (results[0..i]) |prev| {
                    if (prev) |pf| app.gpa.free(pf.data) else |_| {}
                }
                const j = jobs[m.job];
                const n = j.d.channels[m.ch].noise;
                const msg = switch (err) {
                    error.DegenerateCell => try std.fmt.allocPrint(
                        arena,
                        "Канал «{s}», тип «{s}»: размер пятна {d}×{d} px меньше {d} px — на такой решётке шум вырождается. Увеличьте размер пятна или возьмите тип «Зерно», он рассчитан на 1 px.",
                        .{ j.d.channels[m.ch].name, n.type.label(), n.size_x, n.size_y, engine.MIN_CELL_PX },
                    ),
                    error.OutOfMemory => "не хватило памяти на построение поля шума",
                };
                return respondError(req, .bad_request, arena, msg);
            };
            const e = try app.cache.put(io, m.key, f);
            jobs[m.job].entries[m.ch] = e;
            jobs[m.job].fields[m.ch] = e.field();
        }
    }

    // ---- сборка буфера ответа ----
    const header_len = 4 + 4 + jobs.len * 8;
    var payload_len: usize = 0;
    for (jobs) |j| payload_len += j.w * j.h * 4;
    const buf = try arena.alloc(u8, header_len + payload_len);
    @memcpy(buf[0..4], "ZRN1");
    std.mem.writeInt(u32, buf[4..8], @intCast(jobs.len), .little);
    var off: usize = 8;
    for (jobs) |j| {
        std.mem.writeInt(u32, buf[off..][0..4], @intCast(j.w), .little);
        std.mem.writeInt(u32, buf[off + 4 ..][0..4], @intCast(j.h), .little);
        off += 8;
    }
    for (jobs) |*j| {
        const n = j.w * j.h * 4;
        j.out = buf[off .. off + n];
        off += n;
    }

    // ---- этап 2: композит по полосам, всё независимо по пикселям ----
    var bands: std.ArrayList(Band) = .empty;
    defer bands.deinit(arena);
    const want_tasks = @max(app.threads * 2, 4);
    for (jobs, 0..) |j, ji| {
        const rows_per = @max(@as(usize, 16), (j.h + want_tasks - 1) / want_tasks);
        var y: usize = 0;
        while (y < j.h) : (y += rows_per) {
            try bands.append(arena, .{ .job = ji, .y0 = y, .y1 = @min(j.h, y + rows_per) });
        }
    }
    var bctx: BandCtx = .{ .app = app, .jobs = jobs, .bands = bands.items };
    parallelFor(io, bands.items.len, &bctx, compositeOne);

    _ = app.rendered.fetchAdd(1, .monotonic);

    try req.respond(buf, .{
        .extra_headers = &.{
            .{ .name = "content-type", .value = "application/octet-stream" },
            .{ .name = "cache-control", .value = "no-store" },
        },
    });
}

fn handleHealth(app: *App, req: *http.Server.Request, arena: Allocator) !void {
    const body = try std.fmt.allocPrint(arena,
        \\{{"engine":"zig","version":{f},"zig":{f},"threads":{d},"root":{f},"cacheEntries":{d},"cacheBytes":{d},"cacheHits":{d},"cacheMisses":{d},"renders":{d}}}
    , .{
        jsonString(VERSION),
        jsonString(@import("builtin").zig_version_string),
        app.threads,
        jsonString(app.root_path),
        app.cache.map.count(),
        app.cache.bytes,
        app.cache.hits,
        app.cache.misses,
        app.rendered.load(.monotonic),
    });
    try req.respond(body, .{
        .extra_headers = &.{
            .{ .name = "content-type", .value = "application/json; charset=utf-8" },
            .{ .name = "cache-control", .value = "no-store" },
        },
    });
}

fn isPresetName(name: []const u8) bool {
    if (name.len == 0 or name.len > 128) return false;
    if (!std.mem.endsWith(u8, name, ".json")) return false;
    for (name) |c| {
        const okc = (c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or
            (c >= '0' and c <= '9') or c == '.' or c == '_' or c == '-';
        if (!okc) return false;
    }
    if (std.mem.indexOf(u8, name, "..") != null) return false;
    return true;
}

/// Перечисляет пресеты ЗЕРНО в noises/, отсортированные по имени.
fn listPresetNames(app: *App, arena: Allocator, dir: Io.Dir) ![]const []const u8 {
    var names: std.ArrayList([]const u8) = .empty;
    var it = dir.iterate();
    while (try it.next(app.io)) |entry| {
        if (entry.kind != .file) continue;
        if (!std.mem.endsWith(u8, entry.name, ".json")) continue;
        if (std.mem.eql(u8, entry.name, "index.json")) continue;
        const text = dir.readFileAlloc(app.io, entry.name, arena, .limited(4 * 1024 * 1024)) catch continue;
        const v = json.parseFromSliceLeaky(json.Value, arena, text, .{}) catch continue;
        const ours = switch (v) {
            .object => |o| blk: {
                const f = o.get("format") orelse break :blk false;
                break :blk switch (f) {
                    .string => |sv| std.mem.eql(u8, sv, doc_mod.FORMAT),
                    else => false,
                };
            },
            else => false,
        };
        if (!ours) continue;
        try names.append(arena, try arena.dupe(u8, entry.name));
    }
    std.mem.sort([]const u8, names.items, {}, struct {
        fn lt(_: void, a: []const u8, b: []const u8) bool {
            return std.mem.order(u8, a, b) == .lt;
        }
    }.lt);
    return names.items;
}

/// Держит noises/index.json в согласии с содержимым папки. Он нужен только
/// когда страницу отдаёт обычный статический сервер, без zerno.exe, — но
/// оставлять его протухшим после сохранения нельзя.
fn rewriteIndexJson(app: *App, arena: Allocator, dir: Io.Dir) void {
    const names = listPresetNames(app, arena, dir) catch |err| {
        // Лучше оставить прежний index.json, чем записать пустой.
        log.warn("noises/index.json не обновлён: обход папки не удался ({t})", .{err});
        return;
    };
    if (names.len == 0) {
        log.warn("noises/index.json не обновлён: в папке не нашлось ни одного пресета", .{});
        return;
    }
    var w: std.Io.Writer.Allocating = .init(arena);
    const out = &w.writer;
    out.writeAll("{\n  \"files\": [\n") catch return;
    for (names, 0..) |nm, i| {
        out.print("    {f}{s}\n", .{ jsonString(nm), if (i + 1 < names.len) "," else "" }) catch return;
    }
    out.writeAll("  ]\n}\n") catch return;
    dir.writeFile(app.io, .{ .sub_path = "index.json", .data = w.written() }) catch |err| {
        log.warn("не удалось обновить noises/index.json: {t}", .{err});
    };
}

fn handleLibraryList(app: *App, req: *http.Server.Request, arena: Allocator) !void {
    const io = app.io;
    var alloc_w: std.Io.Writer.Allocating = .init(arena);
    const w = &alloc_w.writer;

    var names: std.ArrayList([]const u8) = .empty;
    defer names.deinit(arena);

    var dir = app.root.openDir(io, "noises", .{ .iterate = true }) catch |err| {
        return respondError(req, .ok, arena, try std.fmt.allocPrint(arena, "папка noises/ недоступна: {t}", .{err}));
    };
    defer dir.close(io);

    var it = dir.iterate();
    while (it.next(io) catch null) |entry| {
        if (entry.kind != .file) continue;
        if (!std.mem.endsWith(u8, entry.name, ".json")) continue;
        try names.append(arena, try arena.dupe(u8, entry.name));
    }
    std.mem.sort([]const u8, names.items, {}, struct {
        fn lt(_: void, a: []const u8, b: []const u8) bool {
            return std.mem.order(u8, a, b) == .lt;
        }
    }.lt);

    try w.writeAll("{\"files\":[");
    var first = true;
    var errors: std.ArrayList([]const u8) = .empty;
    defer errors.deinit(arena);
    var skipped: usize = 0;

    for (names.items) |name| {
        const text = dir.readFileAlloc(io, name, arena, .limited(4 * 1024 * 1024)) catch |err| {
            try errors.append(arena, try std.fmt.allocPrint(arena, "{s}: не читается ({t})", .{ name, err }));
            continue;
        };
        var diag: doc_mod.Diag = .{ .gpa = arena };
        const v = json.parseFromSliceLeaky(json.Value, arena, text, .{}) catch |err| {
            try errors.append(arena, try std.fmt.allocPrint(arena, "{s}: не разбирается как JSON — {t}", .{ name, err }));
            continue;
        };
        const is_ours = switch (v) {
            .object => |o| blk: {
                const f = o.get("format") orelse break :blk false;
                break :blk switch (f) {
                    .string => |s| std.mem.eql(u8, s, doc_mod.FORMAT),
                    else => false,
                };
            },
            else => false,
        };
        if (!is_ours) {
            skipped += 1;
            continue;
        }
        _ = doc_mod.parse(v, &diag) catch {
            try errors.append(arena, try std.fmt.allocPrint(arena, "{s}", .{diag.message}));
            continue;
        };
        if (!first) try w.writeAll(",");
        first = false;
        try w.print("{{\"name\":{f},\"doc\":{s}}}", .{ jsonString(name), text });
    }

    try w.print("],\"skipped\":{d},\"errors\":[", .{skipped});
    for (errors.items, 0..) |e, i| {
        if (i != 0) try w.writeAll(",");
        try w.print("{f}", .{jsonString(e)});
    }
    try w.writeAll("]}");

    try req.respond(alloc_w.written(), .{
        .extra_headers = &.{
            .{ .name = "content-type", .value = "application/json; charset=utf-8" },
            .{ .name = "cache-control", .value = "no-store" },
        },
    });
}

fn queryParam(target: []const u8, key: []const u8, buf: []u8) ?[]const u8 {
    const q = std.mem.indexOfScalar(u8, target, '?') orelse return null;
    var it = std.mem.splitScalar(u8, target[q + 1 ..], '&');
    while (it.next()) |pair| {
        const eq = std.mem.indexOfScalar(u8, pair, '=') orelse continue;
        if (!std.mem.eql(u8, pair[0..eq], key)) continue;
        const raw = pair[eq + 1 ..];
        var n: usize = 0;
        var i: usize = 0;
        while (i < raw.len and n < buf.len) {
            if (raw[i] == '%' and i + 2 < raw.len) {
                const hi = std.fmt.charToDigit(raw[i + 1], 16) catch return null;
                const lo = std.fmt.charToDigit(raw[i + 2], 16) catch return null;
                buf[n] = @intCast(hi * 16 + lo);
                i += 3;
            } else if (raw[i] == '+') {
                buf[n] = ' ';
                i += 1;
            } else {
                buf[n] = raw[i];
                i += 1;
            }
            n += 1;
        }
        return buf[0..n];
    }
    return null;
}

fn handleLibrarySave(app: *App, req: *http.Server.Request, arena: Allocator, body: []const u8) !void {
    const io = app.io;
    var namebuf: [256]u8 = undefined;
    const name = queryParam(req.head.target, "name", &namebuf) orelse
        return respondError(req, .bad_request, arena, "не задан параметр name");
    if (!isPresetName(name))
        return respondError(req, .bad_request, arena, try std.fmt.allocPrint(arena, "недопустимое имя файла «{s}»: разрешены латиница, цифры, точка, дефис, подчёркивание и расширение .json", .{name}));

    var diag: doc_mod.Diag = .{ .gpa = arena };
    _ = doc_mod.parseText(arena, body, &diag) catch
        return respondError(req, .bad_request, arena, diag.message);

    var dir = app.root.openDir(io, "noises", .{ .iterate = true }) catch |err| switch (err) {
        error.FileNotFound => blk: {
            app.root.createDirPath(io, "noises") catch {};
            break :blk app.root.openDir(io, "noises", .{ .iterate = true }) catch
                return respondError(req, .internal_server_error, arena, "не удалось создать папку noises/");
        },
        else => return respondError(req, .internal_server_error, arena, try std.fmt.allocPrint(arena, "папка noises/ недоступна: {t}", .{err})),
    };
    defer dir.close(io);

    dir.writeFile(io, .{ .sub_path = name, .data = body }) catch |err|
        return respondError(req, .internal_server_error, arena, try std.fmt.allocPrint(arena, "не удалось записать {s}: {t}", .{ name, err }));

    rewriteIndexJson(app, arena, dir);
    log.info("сохранён пресет noises/{s} ({d} байт)", .{ name, body.len });
    const msg = try std.fmt.allocPrint(arena, "{{\"saved\":{f}}}", .{jsonString(name)});
    try req.respond(msg, .{ .extra_headers = &.{
        .{ .name = "content-type", .value = "application/json; charset=utf-8" },
    } });
}

fn handleLibraryDelete(app: *App, req: *http.Server.Request, arena: Allocator) !void {
    const io = app.io;
    var namebuf: [256]u8 = undefined;
    const name = queryParam(req.head.target, "name", &namebuf) orelse
        return respondError(req, .bad_request, arena, "не задан параметр name");
    if (!isPresetName(name))
        return respondError(req, .bad_request, arena, "недопустимое имя файла");

    var dir = app.root.openDir(io, "noises", .{ .iterate = true }) catch
        return respondError(req, .internal_server_error, arena, "папка noises/ недоступна");
    defer dir.close(io);
    dir.deleteFile(io, name) catch |err|
        return respondError(req, .not_found, arena, try std.fmt.allocPrint(arena, "не удалось удалить {s}: {t}", .{ name, err }));

    rewriteIndexJson(app, arena, dir);
    log.info("удалён пресет noises/{s}", .{name});
    const msg = try std.fmt.allocPrint(arena, "{{\"deleted\":{f}}}", .{jsonString(name)});
    try req.respond(msg, .{ .extra_headers = &.{
        .{ .name = "content-type", .value = "application/json; charset=utf-8" },
    } });
}

fn contentType(path: []const u8) []const u8 {
    const table = [_]struct { []const u8, []const u8 }{
        .{ ".html", "text/html; charset=utf-8" },
        .{ ".js", "text/javascript; charset=utf-8" },
        .{ ".css", "text/css; charset=utf-8" },
        .{ ".json", "application/json; charset=utf-8" },
        .{ ".png", "image/png" },
        .{ ".webp", "image/webp" },
        .{ ".svg", "image/svg+xml" },
        .{ ".ico", "image/x-icon" },
        .{ ".md", "text/markdown; charset=utf-8" },
        .{ ".txt", "text/plain; charset=utf-8" },
    };
    for (table) |e| if (std.mem.endsWith(u8, path, e[0])) return e[1];
    return "application/octet-stream";
}

fn safeRelPath(target: []const u8, buf: []u8) ?[]const u8 {
    const q = std.mem.indexOfScalar(u8, target, '?');
    var p = if (q) |i| target[0..i] else target;
    if (p.len == 0 or p[0] != '/') return null;
    p = p[1..];
    if (p.len == 0) p = "index.html";
    if (p.len > buf.len) return null;
    if (std.mem.indexOf(u8, p, "..") != null) return null;
    for (p) |c| {
        const okc = (c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or
            (c >= '0' and c <= '9') or c == '.' or c == '_' or c == '-' or c == '/';
        if (!okc) return null;
    }
    @memcpy(buf[0..p.len], p);
    return buf[0..p.len];
}

fn handleStatic(app: *App, req: *http.Server.Request, arena: Allocator) !void {
    var pbuf: [512]u8 = undefined;
    const rel = safeRelPath(req.head.target, &pbuf) orelse
        return respondError(req, .bad_request, arena, "недопустимый путь");

    const data = app.root.readFileAlloc(app.io, rel, arena, .limited(64 * 1024 * 1024)) catch |err| switch (err) {
        error.FileNotFound => return respondError(req, .not_found, arena, try std.fmt.allocPrint(arena, "файл не найден: {s}", .{rel})),
        else => return respondError(req, .internal_server_error, arena, try std.fmt.allocPrint(arena, "ошибка чтения {s}: {t}", .{ rel, err })),
    };
    try req.respond(data, .{
        .extra_headers = &.{
            .{ .name = "content-type", .value = contentType(rel) },
            .{ .name = "cache-control", .value = "no-store" },
        },
    });
}

fn readBody(req: *http.Server.Request, arena: Allocator) ![]u8 {
    var buf: [16 * 1024]u8 = undefined;
    const r = try req.readerExpectContinue(&buf);
    return r.allocRemaining(arena, .limited(32 * 1024 * 1024));
}

fn serveRequest(app: *App, req: *http.Server.Request, arena: Allocator) !void {
    const target = req.head.target;
    const path = if (std.mem.indexOfScalar(u8, target, '?')) |i| target[0..i] else target;

    if (std.mem.eql(u8, path, "/api/health")) return handleHealth(app, req, arena);

    if (std.mem.eql(u8, path, "/api/render")) {
        if (req.head.method != .POST) return respondError(req, .method_not_allowed, arena, "ожидается POST");
        const body = try readBody(req, arena);
        return handleRender(app, req, arena, body);
    }

    if (std.mem.eql(u8, path, "/api/library")) {
        return switch (req.head.method) {
            .GET => handleLibraryList(app, req, arena),
            .PUT, .POST => handleLibrarySave(app, req, arena, try readBody(req, arena)),
            .DELETE => handleLibraryDelete(app, req, arena),
            else => respondError(req, .method_not_allowed, arena, "поддерживаются GET, PUT, DELETE"),
        };
    }

    if (std.mem.startsWith(u8, path, "/api/"))
        return respondError(req, .not_found, arena, "неизвестный метод API");

    return handleStatic(app, req, arena);
}

fn serveConnection(app: *App, stream: net.Stream) void {
    const io = app.io;
    defer {
        var copy = stream;
        copy.close(io);
    }
    var recv_buf: [8192]u8 = undefined;
    var send_buf: [64 * 1024]u8 = undefined;
    var cr = stream.reader(io, &recv_buf);
    var cw = stream.writer(io, &send_buf);
    var server: http.Server = .init(&cr.interface, &cw.interface);

    while (true) {
        var req = server.receiveHead() catch |err| switch (err) {
            error.HttpConnectionClosing => return,
            else => {
                log.debug("приём заголовка: {t}", .{err});
                return;
            },
        };
        var arena_state = std.heap.ArenaAllocator.init(app.gpa);
        defer arena_state.deinit();
        serveRequest(app, &req, arena_state.allocator()) catch |err| {
            log.err("запрос «{s}»: {t}", .{ req.head.target, err });
            return;
        };
    }
}

// ============================ старт ============================

fn findRoot(io: Io, gpa: Allocator, explicit: ?[]const u8, argv0: ?[]const u8) !struct { dir: Io.Dir, path: []const u8 } {
    if (explicit) |p| {
        var d = try Io.Dir.cwd().openDir(io, p, .{});
        errdefer d.close(io);
        d.access(io, "index.html", .{}) catch {
            d.close(io);
            log.err("в папке «{s}» нет index.html", .{p});
            return error.RootNotFound;
        };
        return .{ .dir = d, .path = try gpa.dupe(u8, p) };
    }

    const candidates = [_][]const u8{ ".", "..", "../..", "../../.." };
    for (candidates) |c| {
        var d = Io.Dir.cwd().openDir(io, c, .{}) catch continue;
        if (d.access(io, "index.html", .{})) |_| {
            return .{ .dir = d, .path = try gpa.dupe(u8, c) };
        } else |_| {
            d.close(io);
        }
    }

    if (argv0) |exe| {
        var dirname = std.fs.path.dirname(exe);
        var level: usize = 0;
        while (level < 4) : (level += 1) {
            const dn = dirname orelse break;
            var d = Io.Dir.cwd().openDir(io, dn, .{}) catch break;
            if (d.access(io, "index.html", .{})) |_| {
                return .{ .dir = d, .path = try gpa.dupe(u8, dn) };
            } else |_| {
                d.close(io);
            }
            dirname = std.fs.path.dirname(dn);
        }
    }
    return error.RootNotFound;
}

pub fn main(init: std.process.Init) !void {
    const io = init.io;
    const gpa = init.gpa;
    const arena = init.arena.allocator();

    const args = try init.minimal.args.toSlice(arena);
    var port: u16 = 8787;
    var explicit_root: ?[]const u8 = null;
    var cache_mb: usize = 256;

    var i: usize = 1;
    while (i < args.len) : (i += 1) {
        const a = args[i];
        if (std.mem.eql(u8, a, "--port") and i + 1 < args.len) {
            i += 1;
            port = std.fmt.parseInt(u16, args[i], 10) catch {
                log.err("--port: «{s}» не число", .{args[i]});
                return error.BadArgs;
            };
        } else if (std.mem.eql(u8, a, "--root") and i + 1 < args.len) {
            i += 1;
            explicit_root = args[i];
        } else if (std.mem.eql(u8, a, "--cache-mb") and i + 1 < args.len) {
            i += 1;
            cache_mb = std.fmt.parseInt(usize, args[i], 10) catch {
                log.err("--cache-mb: «{s}» не число", .{args[i]});
                return error.BadArgs;
            };
        } else if (std.mem.eql(u8, a, "--help") or std.mem.eql(u8, a, "-h")) {
            std.debug.print(
                \\ЗЕРНО — сервер расчёта шумовых плиток
                \\
                \\  --port N        порт (по умолчанию 8787)
                \\  --root DIR      папка приложения (где лежит index.html)
                \\  --cache-mb N    предел кэша шумовых полей, МБ (по умолчанию 256)
                \\
            , .{});
            return;
        } else {
            log.err("неизвестный аргумент «{s}», см. --help", .{a});
            return error.BadArgs;
        }
    }

    const found = findRoot(io, gpa, explicit_root, if (args.len > 0) args[0] else null) catch {
        log.err("не найдена папка приложения с index.html. Запустите из папки проекта или укажите --root DIR", .{});
        return error.RootNotFound;
    };

    const threads = std.Thread.getCpuCount() catch 4;

    var app: App = .{
        .io = io,
        .gpa = gpa,
        .root = found.dir,
        .root_path = found.path,
        .sr = .init(),
        .cache = .{ .gpa = gpa, .limit_bytes = cache_mb * 1024 * 1024 },
        .threads = threads,
    };

    var addr = try net.IpAddress.parse("127.0.0.1", port);
    var server = addr.listen(io, .{ .reuse_address = true }) catch |err| {
        log.err("не удалось занять порт {d}: {t}", .{ port, err });
        return err;
    };
    defer server.deinit(io);

    std.debug.print(
        \\
        \\  ЗЕРНО · сервер расчёта шумовых плиток
        \\  ─────────────────────────────────────────────
        \\  адрес     http://127.0.0.1:{d}/
        \\  папка     {s}
        \\  потоков   {d}
        \\  кэш полей {d} МБ
        \\
        \\  Откройте адрес в браузере. Ctrl+C — остановить.
        \\
        \\
    , .{ port, found.path, threads, cache_mb });

    var group: Io.Group = .init;
    defer group.cancel(io);
    while (true) {
        const stream = server.accept(io) catch |err| {
            log.err("accept: {t}", .{err});
            continue;
        };
        group.concurrent(io, serveConnection, .{ &app, stream }) catch {
            serveConnection(&app, stream);
        };
    }
}
