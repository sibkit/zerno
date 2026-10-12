//! Системная полоса заголовка в цветах приложения (Windows 11, DWM).
//!
//! Полосу рисует Windows, а не WebView, поэтому CSS до неё не достаёт; цвета
//! задаются атрибутами окна DWM. Значения — те же, что в ui/css/tokens.css
//! (`--bg`, `--ink`, `--line`); совпадение сверяет tests/test-ui.js.
//! Windows 10 этих атрибутов не знает — тогда ошибка доходит до интерфейса
//! сообщением (см. `titlebar_error`), полоса остаётся системной.

/// Фон полосы — `--bg`.
pub const CAPTION: &str = "#120d0a";
/// Текст заголовка — `--ink`.
pub const TEXT: &str = "#f1e6d6";
/// Рамка окна — `--line`.
pub const BORDER: &str = "#382a21";

/// `#rrggbb` → COLORREF (0x00BBGGRR).
fn colorref(hex: &str) -> Result<u32, String> {
    let h = hex.strip_prefix('#').filter(|h| h.len() == 6 && h.bytes().all(|b| b.is_ascii_hexdigit()));
    let Some(h) = h else { return Err(format!("цвет заголовка «{hex}» — не #rrggbb")) };
    let v = u32::from_str_radix(h, 16).map_err(|e| format!("цвет заголовка «{hex}»: {e}"))?;
    let (r, g, b) = (v >> 16, (v >> 8) & 0xff, v & 0xff);
    Ok(b << 16 | g << 8 | r)
}

#[cfg(windows)]
pub fn apply(w: &tauri::WebviewWindow) -> Result<(), String> {
    use windows_sys::Win32::Graphics::Dwm::{
        DwmSetWindowAttribute, DWMWA_BORDER_COLOR, DWMWA_CAPTION_COLOR, DWMWA_TEXT_COLOR,
    };
    let hwnd = w.hwnd().map_err(|e| format!("нет HWND главного окна: {e}"))?.0;
    for (attr, what, hex) in [
        (DWMWA_CAPTION_COLOR, "фон", CAPTION),
        (DWMWA_TEXT_COLOR, "текст", TEXT),
        (DWMWA_BORDER_COLOR, "рамка", BORDER),
    ] {
        let c = colorref(hex)?;
        // SAFETY: hwnd — живое окно, принадлежащее этому процессу; указатель на
        // c и размер 4 байта соответствуют COLORREF, которого ждёт атрибут.
        let hr = unsafe { DwmSetWindowAttribute(hwnd as _, attr as u32, (&c as *const u32).cast(), 4) };
        if hr < 0 {
            return Err(format!(
                "Windows не приняла цвет заголовка ({what}): HRESULT 0x{:08X}. \
                 Своя окраска полосы заголовка есть только в Windows 11.",
                hr as u32
            ));
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::colorref;

    #[test]
    fn colorref_is_bgr() {
        assert_eq!(colorref("#120d0a").unwrap(), 0x000a0d12);
        assert_eq!(colorref("#F1E6D6").unwrap(), 0x00d6e6f1);
        assert!(colorref("120d0a").is_err());
        assert!(colorref("#12345").is_err());
        assert!(colorref("#12345g").is_err());
    }
}
