//! ЗЕРНО — движок бесшовного шума.
//!
//! Дословный порт эталонного движка на JS (tests/reference/): картинки обязаны
//! совпадать попиксельно с точностью до 1 LSB — это проверяет
//! tests/test-parity.js через `zerno-render`.

pub mod color;
pub mod composite;
pub mod doc;
pub mod msg;
pub mod noise;
pub mod render;

/// Чтение без проверки границ — только в горячих циклах.
///
/// Вызывающий доказывает `i < s.len()` (обоснование — в комментарии SAFETY у
/// вызова). Инварианты, на которых держатся доказательства, проверяются
/// обычным `assert!` один раз на строку, а в отладочной сборке и в тестах
/// каждое чтение ещё и сверяется здесь.
#[inline(always)]
pub(crate) unsafe fn at<T: Copy>(s: &[T], i: usize) -> T {
    debug_assert!(i < s.len(), "индекс {i} вне [0; {})", s.len());
    // SAFETY: по контракту функции i < s.len().
    unsafe { *s.get_unchecked(i) }
}
