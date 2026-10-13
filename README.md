<div align="center">

<img src="app/icons/icon.png" width="112" alt="ZERNO icon — a coffee bean">

# ZERNO

**Seamless noise tiles for backgrounds — grain, paper, concrete, film, silk.**<br>
A small, fast desktop app: design a texture with live preview, export a tile that repeats with no visible seam.

[![Release](https://img.shields.io/github/v/release/sibkit/zerno?color=d97757&label=download)](https://github.com/sibkit/zerno/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-c2b8a3)](LICENSE)
![Windows 10/11](https://img.shields.io/badge/Windows-10%20%7C%2011-3a3a37)
![Rust + Tauri 2](https://img.shields.io/badge/Rust%20%2B%20Tauri%202-3a3a37)

**English** · [Русский](README.ru.md)

<img src="docs/images/screenshot.png" alt="ZERNO main window: tile parameters on the left, live tiled preview in the center, preset library on the right">

</div>

## What it is for

Flat color looks cheap; a photo texture is heavy and repeats with an obvious seam.
**ZERNO** (Russian *зерно* — "grain", as in film grain or a coffee bean) builds the
middle ground: a subtle procedural noise texture as a small tile — 64 to 4096 px —
that you put under `background-repeat` on a website, in an app UI, a slide deck or
a game menu.

The tile is seamless **by construction**, not by blurring the edges: every noise
field is built on a lattice with a whole number of cells per tile, so the right edge
is mathematically identical to the left one and the bottom to the top.

<p align="center">
  <img src="docs/images/seamless.png" alt="Three copies of the same 512×512 tile side by side — no seams visible">
  <br><sub>Three copies of one 512 × 512 tile side by side. Try to find the joins.</sub>
</p>

## Features

* **Four noise types** — Perlin (clouds), Value (softer), Worley (cells, cracks, mesh:
  F1 / F2 / F2−F1) and Grain (film grain; with a high-pass filter it turns into
  *blue noise* that hides tile repetition).
* **Layered channels** — stack any number of noise channels over a background color.
  Each has octaves, gain, lacunarity, ridges, domain warp, contrast / bias / gamma,
  a two-color gradient with alpha and one of 11 blend modes.
* **Perceptual color** — colors are edited in OKHSL or OKLCH, gradients mix in Oklab,
  blending happens in linear light. No muddy midtones, no out-of-gamut surprises.
* **No banding** — TPDF or Bayer dithering when converting to 8 bit; pure black and
  opaque alpha stay pure.
* **Live preview while dragging** — the tile re-renders on every slider move;
  the scene shows it tiled, with optional tile borders and a half-tile shift that
  puts the join right in the middle of the screen.
* **Fast** — multithreaded Rust engine with a noise-field cache: a color tweak on a
  1024² tile takes ~8 ms, a full noise recompute ~40 ms.
* **Export** — PNG (with alpha, for overlays), WEBP (lossless at quality 1.00) or a
  ready-to-paste CSS block with the tile as a data URI.
* **Presets are plain JSON** — any folder of `*.json` becomes a library; strict
  validation reports exactly which field is wrong instead of silently guessing.
* Undo / redo, session restore, built-in help for every parameter.

**10 interface languages** — English, Русский, Deutsch, Français, Español, Português (Brasil),
Українська, 简体中文, 日本語, 한국어. The app follows your system language and can be switched
on the fly; the built-in help is translated too.

## Gallery

The presets that ship with the app, each shown as a single tile:

<table>
  <tr>
    <td align="center"><img src="docs/images/preset-01-tyomny-kholst.png" width="250" alt="Dark canvas"><br><sub>dark canvas</sub></td>
    <td align="center"><img src="docs/images/preset-02-bumaga-teplaya.png" width="250" alt="Warm paper"><br><sub>warm paper</sub></td>
    <td align="center"><img src="docs/images/preset-03-beton.png" width="250" alt="Polished concrete"><br><sub>polished concrete</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/images/preset-04-plenka-400.png" width="250" alt="Film 400 grain overlay"><br><sub>film 400 · transparent overlay</sub></td>
    <td align="center"><img src="docs/images/preset-05-shelk.png" width="250" alt="Silk"><br><sub>silk</sub></td>
    <td align="center"><img src="docs/images/preset-06-zvyozdnoe-pole.png" width="250" alt="Star field"><br><sub>star field</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/images/preset-07-karbon.png" width="250" alt="Carbon weave"><br><sub>carbon weave</sub></td>
    <td align="center"><img src="docs/images/preset-08-dyuny.png" width="250" alt="Sand dunes"><br><sub>sand dunes</sub></td>
    <td align="center"><img src="docs/images/preset-10-stalnaya-setka.png" width="250" alt="Steel mesh"><br><sub>steel mesh</sub></td>
  </tr>
</table>

## Download

Grab the latest build from **[Releases](https://github.com/sibkit/zerno/releases/latest)**:

* `ZERNO-<version>-windows-x64.zip` — the app plus the preset library and licenses;
* `zerno.exe` — just the app, a single portable file, no installer.

**Requirements:** Windows 11 or 10, 64-bit, a CPU with SSE4.2 (anything from the last
~15 years) and the WebView2 runtime — it is already part of Windows 11 and of every
up-to-date Windows 10. On Windows 10 the title bar keeps the system colors, and the
app says so.

The exe is not code-signed, so SmartScreen may warn on first launch:
*More info → Run anyway*.

## Quick start

1. Run `zerno.exe`. It opens in your system language (switch it at the top right) with the "dark canvas" preset.
2. In the right panel press **Folder…** and pick the `presets` folder from
   the zip — or any folder where you want to keep your own presets.
3. Click a preset, then tweak the channels on the left. Every group has a **?** button
   that explains each slider.
4. Export with **PNG**, **WEBP** or **CSS** at the top right.

| keys | action |
|---|---|
| `Ctrl+S` / `Ctrl+Shift+S` | save / save as… |
| `Ctrl+O` | open a preset (or drop a `*.json` on the window) |
| `Ctrl+E` | export PNG |
| `Ctrl+Z` / `Ctrl+Y` | undo / redo |
| mouse wheel over the scene, `Ctrl+=` / `Ctrl+-` | zoom |
| double-click the scene, `Ctrl+0` | zoom 1:1 |
| drag a number field | change the value; `Shift` — finer, `Ctrl` — faster |
| `F1` | help |

## Performance

"Dark canvas" preset, 3 channels, AMD Ryzen 7 5800H (16 threads):

| tile | color edit | noise recompute |
|---|---|---|
| 512² | 2.0 ms | 10.8 ms |
| 1024² | 7.7 ms | 40 ms |
| 2048² | 33 ms | 154 ms |

A color, shape or blend edit doesn't touch the noise at all (field cache up to 256 MB);
the main tile and the channel thumbnails render in one parallel batch; pixels go to the
UI as a raw binary buffer, without JSON or base64.

## Building from source

You need Rust — the exact toolchain is pinned in `rust-toolchain.toml` and installs
itself. Node and tauri-cli are **not** needed: the UI is plain HTML/CSS/JS from
`app/ui/`, embedded into the exe at build time.

```sh
cargo run --release -p zerno          # build and run
cargo build --release -p zerno        # → target/release/zerno.exe
```

Tests:

```sh
cargo test -p zerno-engine             # engine: seams, cache, errors
cargo build --release -p zerno-engine  # CLI renderer for the parity check
npm install                            # jsdom for UI tests
node tests/run-all.js                  # JS reference, presets, Rust/JS parity, UI
```

The Rust engine is a port of a JavaScript reference implementation (`tests/reference`).
Both render every preset and the results are compared pixel by pixel: the maximum
difference is 1 LSB.

## Project layout

```
engine/      zerno-engine crate: noise, compositing, color, document parsing — no Tauri
app/         zerno crate: Tauri 2 shell; app/ui — the interface (HTML/CSS/JS, no bundler)
presets/     bundled presets
tests/       Node tests; tests/reference — the JS reference engine
tools/       generators: presets, icon, README images
docs/        how_it_made.md — design decisions, pitfalls, measurements (in Russian)
```

The full document format, color model and list of limits are described in the
[Russian README](README.ru.md); design notes are in [docs/how_it_made.md](docs/how_it_made.md).

## License

[MIT](LICENSE) © 2026 sibkit.

Bundled fonts — IBM Plex Sans, IBM Plex Mono and Unbounded — are under the
[SIL Open Font License 1.1](app/ui/fonts/OFL.txt).
