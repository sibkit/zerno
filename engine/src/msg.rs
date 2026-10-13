//! Сообщение для пользователя: ключ и именованные аргументы, без готовой прозы.
//!
//! Текст на нужном языке собирает интерфейс по ключу из своего словаря; Rust
//! отдаёт только факты (адрес поля, значение, текст ошибки ОС). Аргументы —
//! строки в порядке добавления: так же они уходят в JSON.

use serde_json::{Map, Value};
use std::fmt;

#[derive(Clone, Debug, PartialEq)]
pub struct Msg {
    pub key: &'static str,
    pub args: Vec<(&'static str, String)>,
}

impl Msg {
    pub fn new(key: &'static str) -> Msg {
        Msg { key, args: Vec::new() }
    }

    /// Добавляет аргумент. Повтор имени — ошибка вызывающего кода: в JSON одно
    /// из значений молча пропало бы.
    pub fn arg(mut self, name: &'static str, v: impl fmt::Display) -> Msg {
        assert!(
            !self.args.iter().any(|(n, _)| *n == name),
            "сообщение {}: аргумент {name} задан дважды",
            self.key
        );
        self.args.push((name, v.to_string()));
        self
    }

    pub fn get(&self, name: &str) -> Option<&str> {
        self.args.iter().find(|(n, _)| *n == name).map(|(_, v)| v.as_str())
    }

    /// `{"key":"…","args":{"имя":"значение",…}}` — `args` есть всегда, даже пустой.
    pub fn to_json(&self) -> Value {
        let args: Map<String, Value> = self.args.iter().map(|(n, v)| (n.to_string(), Value::from(v.as_str()))).collect();
        let mut o = Map::new();
        o.insert("key".into(), Value::from(self.key));
        o.insert("args".into(), Value::Object(args));
        Value::Object(o)
    }

    /// Ошибка уровня программиста, которую пользователь вызвать не может
    /// (испорченный запрос от нашего же интерфейса и т. п.). Не переводится:
    /// текст как есть уходит в аргумент `text`.
    pub fn internal(text: impl Into<String>) -> Msg {
        Msg { key: "internal", args: vec![("text", text.into())] }
    }
}

/// Компактный JSON — для stderr командной строки и вывода упавших тестов.
impl fmt::Display for Msg {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_json())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn json_keeps_insertion_order_and_always_has_args() {
        assert_eq!(Msg::new("render.tooLarge").to_string(), r#"{"key":"render.tooLarge","args":{}}"#);
        let m = Msg::new("doc.range").arg("field", "tile.width").arg("value", 9.5).arg("min", 8);
        assert_eq!(m.to_string(), r#"{"key":"doc.range","args":{"field":"tile.width","value":"9.5","min":"8"}}"#);
        assert_eq!(m.get("value"), Some("9.5"));
        assert_eq!(m.get("max"), None);
        assert_eq!(Msg::internal("x").get("text"), Some("x"));
    }

    #[test]
    #[should_panic(expected = "задан дважды")]
    fn duplicate_arg_panics() {
        let _ = Msg::new("k").arg("a", 1).arg("a", 2);
    }
}
