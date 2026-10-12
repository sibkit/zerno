# Остаток работы (Rust+Tauri, ЗЕРНО)
Сделано: engine/ (порт 1:1, тесты, паритет: бит-в-бит с Zig, ≤1 LSB с JS), app/ (команды
render, engine_info, library_state/choose/reveal/delete, doc_open/read/save/save_as,
export_png, export_bytes[webp, raw body + заголовки x-ext/x-name]), иконка, шрифты в ui/fonts,
ui/css/fonts.css, model.js (словари), CSS: tokens/base/layout/buttons переписаны.
Осталось:
1. CSS: topbar, sections, fields (ползунок крупнее, подписи sans 12px без капса), color-editor
   (свёрнутый: образец·заголовок·HEX·HSL|LCH·шеврон), channels (полоса градиента низ→верх),
   stage, library, status, toast.
2. index.html: fonts.css, верхняя панель [↶][↷] имя●файл [Открыть][Сохранить][Сохранить как…] | [CSS][WEBP][PNG];
   библиотека: [Папка…][↗ проводник][↻], статус-путь; скрипты: color, model, doc, ui-kit, history,
   panels, engine, render, library, transfer, keys, boot.
3. JS: engine.js → invoke('render',{request:{jobs}}) (ArrayBuffer ZRN1); render.js — «один в полёте +
   dirty» вместо debounce 45мс; Ctrl+колесо масштаб; panels.js — ползунок ширины не пересобирает
   колонку (баг), сид без |0-обрезки (ошибка при вне [-2^31;2^31-1]), полоса градиента;
   ui-kit.js — цвет OKHSL/OKLCH (режим глобальный, localStorage), C ≤ границы гамута с видимой
   подсказкой «C ограничен гамутом sRGB»; история (Ctrl+Z/Ctrl+Y, снимки serializeDoc, 300мс
   коалесценция, лимит 200), автосохранение doc в localStorage (+ путь привязанного файла);
   library.js — один источник (Rust), клик по пресету не перерисовывает миниатюры (только .cur),
   удаление через __TAURI__.dialog.ask; transfer.js — open/save/saveAs/PNG(Rust)/WEBP(canvas→
   export_bytes)/CSS(clipboard), drag-drop через getCurrentWebview().onDragDropEvent → doc_read;
   safeName без умолчания 'noise' (пусто → пусто); keys.js — Ctrl+S/Shift+S/O/E/Z/Y.
   boot.js — зерно хрома через invoke render; showEngine «RUST · N пот.».
4. Тесты: tests/load-app.js (ui/index.html, coreCode = ui/js/color,model + tests/reference/* + ui/js/doc);
   test-parity.js → target/release/zerno-render.exe; test-ui.js → мок __TAURI__ (invoke на эталоне);
   удалить test-ui-zig.js; run-all.js; make-presets.js пути.
5. Удалить Zig: src/, build.zig, build.zig.zon, start.cmd, zig-out/, .zig-cache/, noises/index.json.
6. README.md, how_it_made.md переписать; cargo build --release; прогнать всё; коммит.
7. Отчёт: unsafe-вопрос (warp-путь 1 поток на ~15% медленнее Zig), identifier com.sibkit.zerno,
   toolchain 1.99 через rust-toolchain.toml, x86-64-v2.
