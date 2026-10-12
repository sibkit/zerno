//! Замер рендера на пресетах из presets/: cargo run -p zerno-engine --release --example bench
//!
//! «Правка цвета» — поля уже в кэше, считается только композит.
//! «Пересчёт шума» — кэш пуст, поля строятся заново.

use std::time::Instant;
use zerno_engine::render::{parse_jobs, Engine};

fn best_ms(reps: usize, mut f: impl FnMut()) -> f64 {
    (0..reps)
        .map(|_| {
            let t = Instant::now();
            f();
            t.elapsed().as_secs_f64() * 1e3
        })
        .fold(f64::INFINITY, f64::min)
}

fn main() {
    let root = concat!(env!("CARGO_MANIFEST_DIR"), "/../presets/");
    let preset = std::env::args().nth(1).unwrap_or_else(|| "01-tyomny-kholst.json".to_string());
    let text = std::fs::read_to_string(format!("{root}{preset}")).expect("пресет не читается");
    let doc: serde_json::Value = serde_json::from_str(&text).expect("пресет не разбирается");
    println!("пресет {preset}, потоков {}", rayon::current_num_threads());
    for side in [512, 1024, 2048] {
        let jobs = parse_jobs(&serde_json::json!({"jobs":[{"width":side,"height":side,"doc":doc}]})).unwrap();
        let warm = Engine::new(1 << 30);
        warm.render(&jobs).unwrap();
        let color = best_ms(15, || drop(warm.render(&jobs).unwrap()));
        let noise = best_ms(8, || drop(Engine::new(1 << 30).render(&jobs).unwrap()));
        println!("  {side:>4}²   правка цвета {color:>7.1} мс   пересчёт шума {noise:>7.1} мс");
    }
}
