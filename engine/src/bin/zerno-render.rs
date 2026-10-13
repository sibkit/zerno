//! Рендер пачки задач из командной строки — для сверки с эталонным JS-движком.
//!
//!   zerno-render < запрос.json > ответ.zrn
//!
//! Вход: `{"jobs":[{"width","height","doc"}]}`. Выход: буфер ZRN1 (см. render.rs).
//! Ошибка — сообщение `Msg` компактным JSON (`{"key":…,"args":{…}}`) в stderr
//! и код возврата 1.

use std::io::{Read, Write};
use std::process::ExitCode;
use zerno_engine::msg::Msg;
use zerno_engine::render::{parse_jobs, Engine};

fn run() -> Result<Vec<u8>, Msg> {
    let mut text = String::new();
    std::io::stdin().read_to_string(&mut text).map_err(|e| Msg::internal(format!("не удалось прочитать stdin: {e}")))?;
    let v: serde_json::Value = serde_json::from_str(&text)
        .map_err(|e| Msg::internal(format!("тело запроса не разбирается как JSON: {e}")))?;
    let jobs = parse_jobs(&v)?;
    // Кэш не нужен: процесс живёт ровно один запрос.
    Engine::new(0).render(&jobs)
}

fn main() -> ExitCode {
    let res = run().and_then(|buf| {
        std::io::stdout()
            .lock()
            .write_all(&buf)
            .map_err(|e| Msg::internal(format!("не удалось записать ответ: {e}")))
    });
    match res {
        Ok(()) => ExitCode::SUCCESS,
        Err(m) => {
            eprintln!("{m}");
            ExitCode::FAILURE
        }
    }
}
