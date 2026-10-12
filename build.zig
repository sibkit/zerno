const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    // Это инструмент, а не библиотека: по умолчанию собираем быстрый бинарник.
    // Переопределяется как обычно: -Doptimize=Debug и т.д.
    const optimize = b.option(
        std.builtin.OptimizeMode,
        "optimize",
        "Режим оптимизации (по умолчанию ReleaseFast)",
    ) orelse .ReleaseFast;

    const exe = b.addExecutable(.{
        .name = "zerno",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/main.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });
    b.installArtifact(exe);

    const run_cmd = b.addRunArtifact(exe);
    run_cmd.step.dependOn(b.getInstallStep());
    run_cmd.setCwd(b.path("."));
    if (b.args) |args| run_cmd.addArgs(args);
    b.step("run", "Собрать и запустить сервер").dependOn(&run_cmd.step);

    const bench = b.addExecutable(.{
        .name = "bench",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/bench.zig"),
            .target = target,
            .optimize = .ReleaseFast,
        }),
    });
    b.step("bench", "Замер чистого счёта").dependOn(&b.addRunArtifact(bench).step);

    const tests = b.addTest(.{
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/test.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });
    b.step("test", "Прогнать тесты движка").dependOn(&b.addRunArtifact(tests).step);
}
