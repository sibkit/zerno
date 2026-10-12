//! Чистое построение полей по типам, нс/пиксель: cargo run -p zerno-engine --release --example fields
//! Тот же набор, что был в bench.zig, — для сравнения цифр между версиями.

use std::time::Instant;
use zerno_engine::doc::{Noise, NoiseType, Shape, WorleyMode};
use zerno_engine::noise::build_field;

fn n(kind: NoiseType) -> Noise {
    Noise {
        kind, size_x: 186.0, size_y: 186.0, seed: 1337, octaves: 4, gain: 0.52, lacunarity: 2, ridged: false,
        warp_amount: 0.0, warp_size: 240.0, worley_mode: WorleyMode::F1, worley_jitter: 1.0, grain_hp: 3,
        shape: Shape { contrast: 0.0, bias: 0.0, gamma: 1.0, invert: false, normalize: true },
    }
}

fn bench(name: &str, nz: Noise, w: usize, h: usize) {
    let best = (0..5)
        .map(|_| {
            let t = Instant::now();
            drop(build_field(&nz, w, h).unwrap());
            t.elapsed().as_nanos() as f64
        })
        .fold(f64::INFINITY, f64::min);
    println!("  {name:<32} {:>8.2} мс  {:>6.1} нс/px", best / 1e6, best / (w * h) as f64);
}

fn main() {
    let threads: usize = std::env::args().nth(1).map(|s| s.parse().expect("число потоков")).unwrap_or(1);
    let pool = rayon::ThreadPoolBuilder::new().num_threads(threads).build().unwrap();
    pool.install(|| {
        println!("Поля 512×512, лучшее из 5, потоков {threads}:");
        let (w, h) = (512, 512);
        bench("perlin 1 октава", Noise { octaves: 1, ..n(NoiseType::Perlin) }, w, h);
        bench("perlin 4 октавы", n(NoiseType::Perlin), w, h);
        bench("perlin 4 октавы + искажение", Noise { warp_amount: 38.0, ..n(NoiseType::Perlin) }, w, h);
        bench("value 4 октавы", n(NoiseType::Value), w, h);
        let wo = Noise { size_x: 78.0, size_y: 78.0, octaves: 2, gain: 0.45, ..n(NoiseType::Worley) };
        bench("worley 2 октавы", wo, w, h);
        bench("worley 2 октавы + искажение", Noise { warp_amount: 14.0, warp_size: 160.0, ..wo }, w, h);
        let g = Noise { size_x: 1.0, size_y: 1.0, ..n(NoiseType::Grain) };
        bench("grain белый", Noise { grain_hp: 0, ..g }, w, h);
        bench("grain + ВЧ-фильтр 4", Noise { grain_hp: 4, ..g }, w, h);
    });
}
