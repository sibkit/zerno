//! Ошибка команды для интерфейса.
//!
//! Внутри — `Msg` движка (ключ + аргументы); интерфейс получает его как
//! `{"key":…,"args":{…}}` и сам переводит на язык пользователя. Отдельный тип
//! нужен только потому, что сериализацию для `Msg` в движке не заводим: у
//! движка нет serde, а JSON-вид у сообщения один — `Msg::to_json`.

use serde::{Serialize, Serializer};
use zerno_engine::msg::Msg;

#[derive(Clone, Debug)]
pub struct AppErr(pub Msg);

impl From<Msg> for AppErr {
    fn from(m: Msg) -> AppErr {
        AppErr(m)
    }
}

impl Serialize for AppErr {
    fn serialize<S: Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        self.0.to_json().serialize(s)
    }
}
