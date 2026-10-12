//! Файлы: настройки, библиотека пресетов, открытие, сохранение, экспорт.
//!
//! Правила те же, что у движка: ничего не подставляется молча. Папка
//! библиотеки не имеет значения по умолчанию — пока пользователь её не выбрал,
//! интерфейс так и пишет. Сохраняемый пресет проходит строгую проверку до записи.

use serde::Serialize;
use serde_json::Value;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tauri::ipc::{InvokeBody, Request};
use tauri::{State, WebviewWindow};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;
use zerno_engine::render::{parse_jobs, Engine};

use crate::blocking;

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
    fn library_dir(&self) -> Result<Option<PathBuf>, String> {
        let _g = self.lock.lock().map_err(|_| "настройки заблокированы упавшим потоком".to_string())?;
        let text = match std::fs::read_to_string(&self.path) {
            Ok(t) => t,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(None),
            Err(e) => return Err(format!("не читается {}: {e}", self.path.display())),
        };
        let where_ = self.path.display();
        let v: Value = serde_json::from_str(&text).map_err(|e| format!("{where_}: не разбирается как JSON — {e}"))?;
        let o = v.as_object().ok_or_else(|| format!("{where_}: ожидается объект"))?;
        for k in o.keys() {
            if k != "libraryDir" {
                return Err(format!("{where_}: неизвестное поле «{k}». Допустимо: libraryDir"));
            }
        }
        match o.get("libraryDir") {
            None => Err(format!("{where_}.libraryDir: поле отсутствует (обязательное)")),
            Some(Value::Null) => Ok(None),
            Some(Value::String(s)) => Ok(Some(PathBuf::from(s))),
            Some(_) => Err(format!("{where_}.libraryDir: ожидается строка или null")),
        }
    }

    fn set_library_dir(&self, dir: &Path) -> Result<(), String> {
        let _g = self.lock.lock().map_err(|_| "настройки заблокированы упавшим потоком".to_string())?;
        let s = dir.to_str().ok_or_else(|| format!("путь не в Юникоде: {}", dir.display()))?;
        let text = serde_json::to_string_pretty(&serde_json::json!({ "libraryDir": s }))
            .map_err(|e| format!("настройки не сериализуются: {e}"))?;
        if let Some(parent) = self.path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| format!("не создаётся {}: {e}", parent.display()))?;
        }
        write_atomic(&self.path, text.as_bytes())
    }
}

/// Запись через временный файл и переименование: на диске всегда либо старое
/// содержимое, либо новое, но не половина.
fn write_atomic(path: &Path, data: &[u8]) -> Result<(), String> {
    let mut tmp = path.as_os_str().to_owned();
    tmp.push(".zerno-tmp");
    let tmp = PathBuf::from(tmp);
    std::fs::write(&tmp, data).map_err(|e| format!("не записывается {}: {e}", tmp.display()))?;
    std::fs::rename(&tmp, path).map_err(|e| {
        let cleanup = std::fs::remove_file(&tmp).err().map(|c| format!("; временный файл {} не удалён: {c}", tmp.display()));
        format!("не удалось заменить {}: {e}{}", path.display(), cleanup.unwrap_or_default())
    })
}

fn path_string(p: &Path) -> Result<String, String> {
    p.to_str().map(str::to_string).ok_or_else(|| format!("путь не в Юникоде: {}", p.display()))
}

// ============================ библиотека ============================

#[derive(Serialize)]
pub struct PresetFile {
    name: String,
    text: String,
}

/// Содержимое папки. Разбор и проверку пресетов делает интерфейс — тем же
/// валидатором, что и при импорте, с теми же текстами ошибок.
#[derive(Serialize)]
pub struct LibraryState {
    dir: Option<String>,
    files: Vec<PresetFile>,
    errors: Vec<String>,
}

fn scan(dir: &Path) -> Result<LibraryState, String> {
    let mut st = LibraryState { dir: Some(path_string(dir)?), files: Vec::new(), errors: Vec::new() };
    let rd = match std::fs::read_dir(dir) {
        Ok(rd) => rd,
        Err(e) => {
            st.errors.push(format!("папка {} недоступна: {e}", dir.display()));
            return Ok(st);
        }
    };
    let mut names = Vec::new();
    for entry in rd {
        let entry = entry.map_err(|e| format!("обход папки {} прерван: {e}", dir.display()))?;
        let name = entry.file_name();
        let Some(name) = name.to_str() else {
            st.errors.push(format!("имя файла не в Юникоде: {}", entry.path().display()));
            continue;
        };
        if !name.to_lowercase().ends_with(".json") {
            continue;
        }
        let ft = entry.file_type().map_err(|e| format!("{name}: тип не определяется — {e}"))?;
        if ft.is_file() {
            names.push(name.to_string());
        }
    }
    names.sort();
    for name in names {
        match read_preset(&dir.join(&name)) {
            Ok(text) => st.files.push(PresetFile { name, text }),
            Err(e) => st.errors.push(e),
        }
    }
    Ok(st)
}

fn read_preset(path: &Path) -> Result<String, String> {
    let len = std::fs::metadata(path).map_err(|e| format!("{}: не читается — {e}", path.display()))?.len();
    if len > MAX_PRESET_BYTES {
        return Err(format!("{}: {len} байт — больше {MAX_PRESET_BYTES}, это не пресет", path.display()));
    }
    std::fs::read_to_string(path).map_err(|e| format!("{}: не читается — {e}", path.display()))
}

#[tauri::command]
pub async fn library_state(settings: State<'_, Arc<Settings>>) -> Result<LibraryState, String> {
    let s = settings.inner().clone();
    blocking(move || match s.library_dir()? {
        None => Ok(LibraryState { dir: None, files: Vec::new(), errors: Vec::new() }),
        Some(d) => scan(&d),
    })
    .await
}

/// Выбор папки библиотеки. `None` — пользователь передумал.
#[tauri::command]
pub async fn library_choose(window: WebviewWindow, settings: State<'_, Arc<Settings>>) -> Result<Option<LibraryState>, String> {
    let s = settings.inner().clone();
    blocking(move || {
        let mut dlg = window.dialog().file().set_parent(&window).set_title("Папка библиотеки пресетов");
        if let Some(d) = s.library_dir()? {
            dlg = dlg.set_directory(d);
        }
        let Some(picked) = dlg.blocking_pick_folder() else { return Ok(None) };
        let dir = picked.into_path().map_err(|e| format!("выбранный путь не разбирается: {e}"))?;
        s.set_library_dir(&dir)?;
        scan(&dir).map(Some)
    })
    .await
}

#[tauri::command]
pub async fn library_reveal(window: WebviewWindow, settings: State<'_, Arc<Settings>>) -> Result<(), String> {
    let dir = settings.library_dir()?.ok_or("Папка библиотеки ещё не выбрана.")?;
    window
        .opener()
        .open_path(path_string(&dir)?, None::<&str>)
        .map_err(|e| format!("не удалось открыть {}: {e}", dir.display()))
}

/// Удаление пресета из папки библиотеки. Подтверждение спрашивает интерфейс.
#[tauri::command]
pub async fn library_delete(settings: State<'_, Arc<Settings>>, name: String) -> Result<(), String> {
    let dir = settings.library_dir()?.ok_or("Папка библиотеки ещё не выбрана.")?;
    let plain = Path::new(&name).file_name().map(|n| n == name.as_str()).unwrap_or(false);
    if !plain || !name.to_lowercase().ends_with(".json") {
        return Err(format!("«{name}» — не имя файла пресета в папке библиотеки"));
    }
    let p = dir.join(&name);
    std::fs::remove_file(&p).map_err(|e| format!("не удалось удалить {}: {e}", p.display()))
}

// ============================ документ ============================

#[derive(Serialize)]
pub struct OpenedDoc {
    path: String,
    name: String,
    text: String,
}

fn open_doc(path: &Path) -> Result<OpenedDoc, String> {
    let name = path.file_name().and_then(|n| n.to_str()).ok_or_else(|| format!("нет имени файла: {}", path.display()))?;
    Ok(OpenedDoc { path: path_string(path)?, name: name.to_string(), text: read_preset(path)? })
}

/// Перед записью пресет проходит ту же строгую проверку, что при чтении:
/// записать файл, который потом не откроется, нельзя.
fn checked_doc(text: &str) -> Result<(), String> {
    zerno_engine::doc::parse_text(text).map(|_| ())
}

#[tauri::command]
pub async fn doc_open(window: WebviewWindow, settings: State<'_, Arc<Settings>>) -> Result<Option<OpenedDoc>, String> {
    let s = settings.inner().clone();
    blocking(move || {
        let mut dlg = window.dialog().file().set_parent(&window).set_title("Открыть пресет").add_filter("Пресет ЗЕРНО", &["json"]);
        if let Some(d) = s.library_dir()? {
            dlg = dlg.set_directory(d);
        }
        let Some(picked) = dlg.blocking_pick_file() else { return Ok(None) };
        open_doc(&picked.into_path().map_err(|e| format!("выбранный путь не разбирается: {e}"))?).map(Some)
    })
    .await
}

/// Чтение по пути — для файлов, брошенных на окно.
#[tauri::command]
pub async fn doc_read(path: String) -> Result<OpenedDoc, String> {
    blocking(move || open_doc(Path::new(&path))).await
}

/// Сохранение в файл, с которым связан документ (открыт из него или уже сохранён в него).
#[tauri::command]
pub async fn doc_save(path: String, text: String) -> Result<(), String> {
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
) -> Result<Option<String>, String> {
    let s = settings.inner().clone();
    blocking(move || {
        checked_doc(&text)?;
        let dir = s.library_dir()?;
        let Some(path) = ask_save_path(&window, "Сохранить пресет", "Пресет ЗЕРНО", "json", &suggested, dir)? else {
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
) -> Result<Option<PathBuf>, String> {
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
        Some(p) => p.into_path().map(Some).map_err(|e| format!("выбранный путь не разбирается: {e}")),
    }
}

// ============================ экспорт ============================

#[derive(Serialize)]
pub struct Exported {
    path: String,
    bytes: usize,
}

/// PNG считает и кодирует Rust: плитка не гоняется через canvas туда-обратно.
/// `request` — та же пачка, что у `render`, ровно из одной задачи.
#[tauri::command]
pub async fn export_png(
    window: WebviewWindow,
    engine: State<'_, Arc<Engine>>,
    request: Value,
    suggested: String,
) -> Result<Option<Exported>, String> {
    let e = engine.inner().clone();
    blocking(move || {
        let jobs = parse_jobs(&request)?;
        if jobs.len() != 1 {
            return Err(format!("экспорт PNG: ожидается ровно одна задача, получено {}", jobs.len()));
        }
        let Some(path) = ask_save_path(&window, "Экспорт PNG", "PNG", "png", &suggested, None)? else {
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

fn encode_png(rgba: &[u8], w: u32, h: u32) -> Result<Vec<u8>, String> {
    let mut out = Vec::new();
    let mut enc = png::Encoder::new(&mut out, w, h);
    enc.set_color(png::ColorType::Rgba);
    enc.set_depth(png::BitDepth::Eight);
    enc.set_compression(png::Compression::Balanced);
    let mut wr = enc.write_header().map_err(|e| format!("PNG: заголовок — {e}"))?;
    wr.write_image_data(rgba).map_err(|e| format!("PNG: данные — {e}"))?;
    wr.finish().map_err(|e| format!("PNG: завершение — {e}"))?;
    Ok(out)
}

/// Готовые байты (WebP кодирует движок WebView2) — в файл через диалог.
/// Тело запроса — сырые байты; заголовки `x-ext` и `x-name` (имя в %-кодировке).
#[tauri::command]
pub async fn export_bytes(window: WebviewWindow, request: Request<'_>) -> Result<Option<Exported>, String> {
    let InvokeBody::Raw(data) = request.body() else {
        return Err("export_bytes: ожидается двоичное тело запроса".into());
    };
    let header = |k: &str| -> Result<String, String> {
        let v = request.headers().get(k).ok_or_else(|| format!("export_bytes: нет заголовка {k}"))?;
        v.to_str().map(str::to_string).map_err(|_| format!("export_bytes: заголовок {k} не ASCII"))
    };
    let ext = header("x-ext")?;
    let filter = match ext.as_str() {
        "webp" => "WebP",
        other => return Err(format!("export_bytes: неподдерживаемое расширение «{other}»")),
    };
    let name = percent_decode(&header("x-name")?)?;
    let data = data.clone();
    blocking(move || {
        let Some(path) = ask_save_path(&window, &format!("Экспорт {filter}"), filter, &ext, &name, None)? else {
            return Ok(None);
        };
        write_atomic(&path, &data)?;
        Ok(Some(Exported { path: path_string(&path)?, bytes: data.len() }))
    })
    .await
}

/// Обратное к `encodeURIComponent`.
fn percent_decode(s: &str) -> Result<String, String> {
    let b = s.as_bytes();
    let mut out = Vec::with_capacity(b.len());
    let mut i = 0;
    while i < b.len() {
        if b[i] == b'%' {
            let hex = s.get(i + 1..i + 3).ok_or_else(|| format!("обрезанная %-последовательность в «{s}»"))?;
            out.push(u8::from_str_radix(hex, 16).map_err(|_| format!("неверная %-последовательность «%{hex}»"))?);
            i += 3;
        } else {
            out.push(b[i]);
            i += 1;
        }
    }
    String::from_utf8(out).map_err(|_| format!("«{s}» после декодирования — не UTF-8"))
}
