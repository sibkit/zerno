//! Файлы: настройки, библиотека пресетов, открытие, сохранение, экспорт.
//!
//! Правила те же, что у движка: ничего не подставляется молча. Папка
//! библиотеки не имеет значения по умолчанию — пока пользователь её не выбрал,
//! интерфейс так и пишет. Сохраняемый пресет проходит строгую проверку до записи.
//!
//! Ошибки — `Msg` (ключ + аргументы), переводит их интерфейс. Пути идут в
//! аргумент `path` как есть, текст ошибки ОС — в `os` дословно. Подписи
//! системных диалогов (заголовок, имя фильтра) тоже приходят из интерфейса на
//! текущем языке: своих текстов у Rust нет.

use serde::Serialize;
use serde_json::Value;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tauri::ipc::{InvokeBody, Request};
use tauri::{State, WebviewWindow};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;
use zerno_engine::msg::Msg;
use zerno_engine::render::{parse_jobs, Engine};

use crate::blocking;
use crate::err::AppErr;

/// Пресет больше этого — точно не наш файл; читать его целиком незачем.
const MAX_PRESET_BYTES: u64 = 4 * 1024 * 1024;

// ============================ настройки ============================

/// Настройки в `%APPDATA%\<identifier>\settings.json`: `{"libraryDir": "…" | null}`.
pub struct Settings {
    path: PathBuf,
    lock: Mutex<()>,
}

impl Settings {
    pub fn new(path: PathBuf) -> Settings {
        Settings { path, lock: Mutex::new(()) }
    }

    /// Папка библиотеки. Нет файла настроек — папку ещё не выбирали (`None`).
    /// Файл есть, но испорчен — ошибка, а не тихий сброс.
    fn library_dir(&self) -> Result<Option<PathBuf>, Msg> {
        let _g = self.lock.lock().map_err(|_| Msg::new("settings.locked"))?;
        let path = self.path.display();
        let text = match std::fs::read_to_string(&self.path) {
            Ok(t) => t,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(None),
            Err(e) => return Err(Msg::new("settings.read").arg("path", path).arg("os", e)),
        };
        let v: Value =
            serde_json::from_str(&text).map_err(|e| Msg::new("settings.json").arg("path", &path).arg("detail", e))?;
        let o = v.as_object().ok_or_else(|| Msg::new("settings.notObject").arg("path", &path))?;
        for k in o.keys() {
            if k != "libraryDir" {
                return Err(Msg::new("settings.unknownField").arg("path", path).arg("field", k).arg("allowed", "libraryDir"));
            }
        }
        match o.get("libraryDir") {
            None => Err(Msg::new("settings.missing").arg("path", path).arg("field", "libraryDir")),
            Some(Value::Null) => Ok(None),
            Some(Value::String(s)) => Ok(Some(PathBuf::from(s))),
            // Допустимы только строка и null.
            Some(_) => Err(Msg::new("settings.badType").arg("path", path).arg("field", "libraryDir")),
        }
    }

    fn set_library_dir(&self, dir: &Path) -> Result<(), Msg> {
        let _g = self.lock.lock().map_err(|_| Msg::new("settings.locked"))?;
        let s = dir.to_str().ok_or_else(|| Msg::new("path.notUnicode").arg("path", dir.display()))?;
        let text = serde_json::to_string_pretty(&serde_json::json!({ "libraryDir": s }))
            .map_err(|e| Msg::internal(format!("настройки не сериализуются: {e}")))?;
        if let Some(parent) = self.path.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|e| Msg::new("settings.mkdir").arg("path", parent.display()).arg("os", e))?;
        }
        write_atomic(&self.path, text.as_bytes())
    }
}

/// Запись через временный файл и переименование: на диске всегда либо старое
/// содержимое, либо новое, но не половина.
fn write_atomic(path: &Path, data: &[u8]) -> Result<(), Msg> {
    let mut tmp = path.as_os_str().to_owned();
    tmp.push(".zerno-tmp");
    let tmp = PathBuf::from(tmp);
    std::fs::write(&tmp, data).map_err(|e| Msg::new("io.write").arg("path", tmp.display()).arg("os", e))?;
    std::fs::rename(&tmp, path).map_err(|e| {
        let m = Msg::new("io.replace").arg("path", path.display()).arg("os", e);
        // Не удалился и временный файл — об этом тоже надо сказать: он остался на диске.
        match std::fs::remove_file(&tmp) {
            Ok(()) => m,
            Err(c) => m.arg("tmp", tmp.display()).arg("cleanup", c),
        }
    })
}

fn path_string(p: &Path) -> Result<String, Msg> {
    p.to_str().map(str::to_string).ok_or_else(|| Msg::new("path.notUnicode").arg("path", p.display()))
}

/// Подпись системного диалога задаёт интерфейс. Пустая — его ошибка, а не
/// повод показать окно без заголовка или фильтр без имени.
fn need_label(what: &str, v: &str) -> Result<(), Msg> {
    if v.is_empty() {
        return Err(Msg::internal(format!("{what}: пустая подпись диалога (её задаёт интерфейс)")));
    }
    Ok(())
}

fn picked_path(p: tauri_plugin_dialog::FilePath) -> Result<PathBuf, Msg> {
    p.into_path().map_err(|e| Msg::new("dialog.badPath").arg("detail", e))
}

// ============================ библиотека ============================

#[derive(Serialize)]
pub struct PresetFile {
    name: String,
    text: String,
}

/// Содержимое папки. Разбор и проверку пресетов делает интерфейс — тем же
/// валидатором, что и при импорте, с теми же сообщениями. `errors` — сообщения
/// `{"key","args"}` о том, что прочитать не удалось.
#[derive(Serialize)]
pub struct LibraryState {
    dir: Option<String>,
    files: Vec<PresetFile>,
    errors: Vec<AppErr>,
}

fn scan(dir: &Path) -> Result<LibraryState, Msg> {
    let mut st = LibraryState { dir: Some(path_string(dir)?), files: Vec::new(), errors: Vec::new() };
    let rd = match std::fs::read_dir(dir) {
        Ok(rd) => rd,
        Err(e) => {
            st.errors.push(AppErr(Msg::new("lib.dirUnavailable").arg("path", dir.display()).arg("os", e)));
            return Ok(st);
        }
    };
    let mut names = Vec::new();
    for entry in rd {
        let entry = entry.map_err(|e| Msg::new("lib.walk").arg("path", dir.display()).arg("os", e))?;
        let name = entry.file_name();
        let Some(name) = name.to_str() else {
            st.errors.push(AppErr(Msg::new("lib.nameNotUnicode").arg("path", entry.path().display())));
            continue;
        };
        if !name.to_lowercase().ends_with(".json") {
            continue;
        }
        let ft = entry.file_type().map_err(|e| Msg::new("lib.fileType").arg("name", name).arg("os", e))?;
        if ft.is_file() {
            names.push(name.to_string());
        }
    }
    names.sort();
    for name in names {
        match read_preset(&dir.join(&name)) {
            Ok(text) => st.files.push(PresetFile { name, text }),
            Err(e) => st.errors.push(AppErr(e)),
        }
    }
    Ok(st)
}

fn read_preset(path: &Path) -> Result<String, Msg> {
    let read_err = |e: std::io::Error| Msg::new("file.read").arg("path", path.display()).arg("os", e);
    let len = std::fs::metadata(path).map_err(read_err)?.len();
    if len > MAX_PRESET_BYTES {
        return Err(Msg::new("file.tooLarge").arg("path", path.display()).arg("bytes", len).arg("max", MAX_PRESET_BYTES));
    }
    std::fs::read_to_string(path).map_err(read_err)
}

#[tauri::command]
pub async fn library_state(settings: State<'_, Arc<Settings>>) -> Result<LibraryState, AppErr> {
    let s = settings.inner().clone();
    blocking(move || match s.library_dir()? {
        None => Ok(LibraryState { dir: None, files: Vec::new(), errors: Vec::new() }),
        Some(d) => scan(&d),
    })
    .await
}

/// Выбор папки библиотеки. `None` — пользователь передумал.
#[tauri::command]
pub async fn library_choose(
    window: WebviewWindow,
    settings: State<'_, Arc<Settings>>,
    title: String,
) -> Result<Option<LibraryState>, AppErr> {
    need_label("library_choose: title", &title)?;
    let s = settings.inner().clone();
    blocking(move || {
        let mut dlg = window.dialog().file().set_parent(&window).set_title(title);
        if let Some(d) = s.library_dir()? {
            dlg = dlg.set_directory(d);
        }
        let Some(picked) = dlg.blocking_pick_folder() else { return Ok(None) };
        let dir = picked_path(picked)?;
        s.set_library_dir(&dir)?;
        scan(&dir).map(Some)
    })
    .await
}

#[tauri::command]
pub async fn library_reveal(window: WebviewWindow, settings: State<'_, Arc<Settings>>) -> Result<(), AppErr> {
    let dir = settings.library_dir()?.ok_or_else(|| Msg::new("lib.notChosen"))?;
    window
        .opener()
        .open_path(path_string(&dir)?, None::<&str>)
        .map_err(|e| Msg::new("lib.reveal").arg("path", dir.display()).arg("os", e))?;
    Ok(())
}

/// Удаление пресета из папки библиотеки. Подтверждение спрашивает интерфейс.
#[tauri::command]
pub async fn library_delete(settings: State<'_, Arc<Settings>>, name: String) -> Result<(), AppErr> {
    let dir = settings.library_dir()?.ok_or_else(|| Msg::new("lib.notChosen"))?;
    let plain = Path::new(&name).file_name().map(|n| n == name.as_str()).unwrap_or(false);
    if !plain || !name.to_lowercase().ends_with(".json") {
        return Err(Msg::new("lib.badName").arg("name", name).into());
    }
    let p = dir.join(&name);
    std::fs::remove_file(&p).map_err(|e| Msg::new("lib.delete").arg("path", p.display()).arg("os", e))?;
    Ok(())
}

// ============================ документ ============================

#[derive(Serialize)]
pub struct OpenedDoc {
    path: String,
    name: String,
    text: String,
}

fn open_doc(path: &Path) -> Result<OpenedDoc, Msg> {
    let name =
        path.file_name().and_then(|n| n.to_str()).ok_or_else(|| Msg::new("file.noName").arg("path", path.display()))?;
    Ok(OpenedDoc { path: path_string(path)?, name: name.to_string(), text: read_preset(path)? })
}

/// Перед записью пресет проходит ту же строгую проверку, что при чтении:
/// записать файл, который потом не откроется, нельзя. Ошибка — `doc.*` как есть.
fn checked_doc(text: &str) -> Result<(), Msg> {
    zerno_engine::doc::parse_text(text).map(|_| ())
}

/// `title` — заголовок диалога, `filter` — имя фильтра «*.json»; оба на языке интерфейса.
#[tauri::command]
pub async fn doc_open(
    window: WebviewWindow,
    settings: State<'_, Arc<Settings>>,
    title: String,
    filter: String,
) -> Result<Option<OpenedDoc>, AppErr> {
    need_label("doc_open: title", &title)?;
    need_label("doc_open: filter", &filter)?;
    let s = settings.inner().clone();
    blocking(move || {
        let mut dlg = window.dialog().file().set_parent(&window).set_title(title).add_filter(filter, &["json"]);
        if let Some(d) = s.library_dir()? {
            dlg = dlg.set_directory(d);
        }
        let Some(picked) = dlg.blocking_pick_file() else { return Ok(None) };
        open_doc(&picked_path(picked)?).map(Some)
    })
    .await
}

/// Чтение по пути — для файлов, брошенных на окно.
#[tauri::command]
pub async fn doc_read(path: String) -> Result<OpenedDoc, AppErr> {
    blocking(move || open_doc(Path::new(&path))).await
}

/// Сохранение в файл, с которым связан документ (открыт из него или уже сохранён в него).
#[tauri::command]
pub async fn doc_save(path: String, text: String) -> Result<(), AppErr> {
    blocking(move || {
        checked_doc(&text)?;
        write_atomic(Path::new(&path), text.as_bytes())
    })
    .await
}

/// «Сохранить как…»: системный диалог сам спрашивает о перезаписи. `None` — отмена.
#[tauri::command]
pub async fn doc_save_as(
    window: WebviewWindow,
    settings: State<'_, Arc<Settings>>,
    text: String,
    suggested: String,
    title: String,
    filter: String,
) -> Result<Option<String>, AppErr> {
    let s = settings.inner().clone();
    blocking(move || {
        checked_doc(&text)?;
        let dir = s.library_dir()?;
        let Some(path) = ask_save_path(&window, &title, &filter, "json", &suggested, dir)? else {
            return Ok(None);
        };
        write_atomic(&path, text.as_bytes())?;
        path_string(&path).map(Some)
    })
    .await
}

fn ask_save_path(
    window: &WebviewWindow,
    title: &str,
    filter: &str,
    ext: &str,
    suggested: &str,
    dir: Option<PathBuf>,
) -> Result<Option<PathBuf>, Msg> {
    need_label("диалог сохранения: title", title)?;
    need_label("диалог сохранения: filter", filter)?;
    let mut dlg = window.dialog().file().set_parent(window).set_title(title).add_filter(filter, &[ext]);
    // Пустое имя не заменяется выдуманным: поле в диалоге просто остаётся пустым.
    if !suggested.is_empty() {
        dlg = dlg.set_file_name(format!("{suggested}.{ext}"));
    }
    if let Some(d) = dir {
        dlg = dlg.set_directory(d);
    }
    match dlg.blocking_save_file() {
        None => Ok(None),
        Some(p) => picked_path(p).map(Some),
    }
}

// ============================ экспорт ============================

#[derive(Serialize)]
pub struct Exported {
    path: String,
    bytes: usize,
}

/// PNG считает и кодирует Rust: плитка не гоняется через canvas туда-обратно.
/// `request` — та же пачка, что у `render`, ровно из одной задачи. `title` —
/// заголовок диалога на языке интерфейса; фильтр — просто «PNG».
#[tauri::command]
pub async fn export_png(
    window: WebviewWindow,
    engine: State<'_, Arc<Engine>>,
    request: Value,
    suggested: String,
    title: String,
) -> Result<Option<Exported>, AppErr> {
    let e = engine.inner().clone();
    blocking(move || {
        let jobs = parse_jobs(&request)?;
        if jobs.len() != 1 {
            return Err(Msg::internal(format!("экспорт PNG: ожидается ровно одна задача, получено {}", jobs.len())));
        }
        let Some(path) = ask_save_path(&window, &title, "PNG", "png", &suggested, None)? else {
            return Ok(None);
        };
        let buf = e.render(&jobs)?;
        let (w, h) = (jobs[0].w as u32, jobs[0].h as u32);
        let png = encode_png(&buf[16..], w, h)?;
        write_atomic(&path, &png)?;
        Ok(Some(Exported { path: path_string(&path)?, bytes: png.len() }))
    })
    .await
}

fn encode_png(rgba: &[u8], w: u32, h: u32) -> Result<Vec<u8>, Msg> {
    let mut out = Vec::new();
    let mut enc = png::Encoder::new(&mut out, w, h);
    enc.set_color(png::ColorType::Rgba);
    enc.set_depth(png::BitDepth::Eight);
    enc.set_compression(png::Compression::Balanced);
    let mut wr = enc.write_header().map_err(|e| Msg::internal(format!("PNG: заголовок — {e}")))?;
    wr.write_image_data(rgba).map_err(|e| Msg::internal(format!("PNG: данные — {e}")))?;
    wr.finish().map_err(|e| Msg::internal(format!("PNG: завершение — {e}")))?;
    Ok(out)
}

/// Готовые байты (WebP кодирует движок WebView2) — в файл через диалог.
/// Тело запроса — сырые байты; заголовки `x-ext`, `x-name` (имя файла) и
/// `x-title` (заголовок диалога на языке интерфейса), оба в %-кодировке.
#[tauri::command]
pub async fn export_bytes(window: WebviewWindow, request: Request<'_>) -> Result<Option<Exported>, AppErr> {
    let InvokeBody::Raw(data) = request.body() else {
        return Err(Msg::internal("export_bytes: ожидается двоичное тело запроса").into());
    };
    let header = |k: &str| -> Result<String, Msg> {
        let v = request.headers().get(k).ok_or_else(|| Msg::internal(format!("export_bytes: нет заголовка {k}")))?;
        v.to_str().map(str::to_string).map_err(|_| Msg::internal(format!("export_bytes: заголовок {k} не ASCII")))
    };
    let ext = header("x-ext")?;
    let filter = match ext.as_str() {
        "webp" => "WebP",
        other => return Err(Msg::internal(format!("export_bytes: неподдерживаемое расширение «{other}»")).into()),
    };
    let name = percent_decode(&header("x-name")?)?;
    let title = percent_decode(&header("x-title")?)?;
    let data = data.clone();
    blocking(move || {
        let Some(path) = ask_save_path(&window, &title, filter, &ext, &name, None)? else {
            return Ok(None);
        };
        write_atomic(&path, &data)?;
        Ok(Some(Exported { path: path_string(&path)?, bytes: data.len() }))
    })
    .await
}

/// Обратное к `encodeURIComponent`.
fn percent_decode(s: &str) -> Result<String, Msg> {
    let b = s.as_bytes();
    let mut out = Vec::with_capacity(b.len());
    let mut i = 0;
    while i < b.len() {
        if b[i] == b'%' {
            let hex = s.get(i + 1..i + 3).ok_or_else(|| Msg::internal(format!("обрезанная %-последовательность в «{s}»")))?;
            out.push(u8::from_str_radix(hex, 16).map_err(|_| Msg::internal(format!("неверная %-последовательность «%{hex}»")))?);
            i += 3;
        } else {
            out.push(b[i]);
            i += 1;
        }
    }
    String::from_utf8(out).map_err(|_| Msg::internal(format!("«{s}» после декодирования — не UTF-8")))
}
