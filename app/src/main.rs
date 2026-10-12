//! ЗЕРНО — настольное приложение (Tauri 2).
//!
//! Интерфейс — ui/ (обычный HTML/CSS/JS без сборки). Считает движок
//! zerno-engine; интерфейс зовёт его командой `render` и получает сырой RGBA
//! одним двоичным буфером, без перекодирования в JSON. Файлы (библиотека,
//! открытие, сохранение, экспорт) читает и пишет только Rust.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod files;
mod titlebar;

use serde::Serialize;
use serde_json::Value;
use std::sync::Arc;
use tauri::ipc::Response;
use tauri::{Manager, State};
use zerno_engine::render::{parse_jobs, Engine};

/// Предел кэша шумовых полей. Тот же, что был у сервера по умолчанию:
/// хватает на несколько десятков полей 1024² — правка цвета не пересчитывает шум.
const FIELD_CACHE_BYTES: usize = 256 * 1024 * 1024;

type Eng<'a> = State<'a, Arc<Engine>>;

/// Тяжёлую работу — с главного потока долой, иначе окно замирает.
async fn blocking<T: Send + 'static>(f: impl FnOnce() -> Result<T, String> + Send + 'static) -> Result<T, String> {
    tauri::async_runtime::spawn_blocking(f).await.map_err(|e| format!("рабочий поток упал: {e}"))?
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct EngineInfo {
    version: &'static str,
    threads: usize,
    cache_entries: usize,
    cache_bytes: usize,
    cache_hits: u64,
    cache_misses: u64,
    renders: u64,
}

/// Ошибка окраски полосы заголовка (None — применилась). Интерфейс показывает
/// её сообщением: молча оставить системную полосу было бы скрытым сбоем.
struct TitleBarStatus(Option<String>);

#[tauri::command]
fn titlebar_error(status: State<'_, TitleBarStatus>) -> Option<String> {
    status.0.clone()
}

#[tauri::command]
fn engine_info(engine: Eng<'_>) -> EngineInfo {
    let s = engine.cache_stats();
    EngineInfo {
        version: env!("CARGO_PKG_VERSION"),
        threads: engine.threads(),
        cache_entries: s.entries,
        cache_bytes: s.bytes,
        cache_hits: s.hits,
        cache_misses: s.misses,
        renders: engine.renders(),
    }
}

/// `{"jobs":[{"width","height","doc"}]}` → буфер ZRN1 (см. engine/src/render.rs).
#[tauri::command]
async fn render(engine: Eng<'_>, request: Value) -> Result<Response, String> {
    let e = engine.inner().clone();
    let buf = blocking(move || e.render(&parse_jobs(&request)?)).await?;
    Ok(Response::new(buf))
}

fn main() {
    let result = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(Arc::new(Engine::new(FIELD_CACHE_BYTES)));
            let cfg = app.path().app_config_dir().map_err(|e| format!("не найдена папка настроек: {e}"))?;
            app.manage(Arc::new(files::Settings::new(cfg.join("settings.json"))));
            let win = app.get_webview_window("main").ok_or("нет окна main из tauri.conf.json")?;
            #[cfg(windows)]
            let tb = titlebar::apply(&win).err();
            #[cfg(not(windows))]
            let tb = Some(format!("полоса заголовка окна «{}» красится только в Windows 11", win.label()));
            app.manage(TitleBarStatus(tb));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            engine_info,
            titlebar_error,
            render,
            files::library_state,
            files::library_choose,
            files::library_reveal,
            files::library_delete,
            files::doc_open,
            files::doc_read,
            files::doc_save,
            files::doc_save_as,
            files::export_png,
            files::export_bytes,
        ])
        .run(tauri::generate_context!());
    if let Err(e) = result {
        // Окна ещё/уже нет — сообщить можно только так.
        eprintln!("ЗЕРНО не запустилось: {e}");
        std::process::exit(1);
    }
}
