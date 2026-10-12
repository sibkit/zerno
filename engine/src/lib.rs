//! ЗЕРНО — движок бесшовного шума.
//!
//! Дословный порт эталонного движка на JS (tests/reference/): картинки обязаны
//! совпадать попиксельно с точностью до 1 LSB — это проверяет
//! tests/test-parity.js через `zerno-render`.

pub mod color;
pub mod composite;
pub mod doc;
pub mod noise;
pub mod render;
