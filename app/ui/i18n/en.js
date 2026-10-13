"use strict";
/* ЗЕРНО · словарь: English. Ключи — как в i18n/ru.js (эталон); проверка — checkLangs(). */
addLang("en",{
  name:"English",
  strings:{
    "app.brand":"ZERNO",
    "app.title":"ZERNO — seamless noise generator",
    "app.sub":"seamless noise",
    "doc.namePh":"preset name",
    "bar.open":"Open",
    "bar.save":"Save",
    "bar.saveAs":"As…",
    "stage.zoom":"zoom",
    "stage.surround":"backdrop",
    "stage.grid":"Edges",
    "stage.shift":"Offset ½",
    "stage.smooth":"Smooth",
    "stage.lib":"Library",
    "st.tile":"tile",
    "st.channels":"channels",
    "st.render":"render",
    "st.engine":"engine",
    "st.seam":"tiling:",
    "st.seamExact":"seamless",
    "st.ready":"ready",
    "st.busy":"rendering",
    "st.error":"error",
    "st.engineVal":"RUST · {n} threads",
    "unit.ms":"{v} ms",
    "help.title":"Help",
    "sec.tile":"Tile",
    "sec.bg":"Background",
    "sec.chans":"Noise channels",
    "sec.out":"Output",
    "tile.width":"Width",
    "tile.height":"Height",
    "bg.color":"background",
    "sub.noise":"Noise",
    "sub.shape":"Shape",
    "sub.color":"Color",
    "sub.layer":"Layer",
    "sub.dither":"Dithering",
    "sub.webp":"WebP",
    "noise.perlin":"Perlin — clouds",
    "noise.value":"Value — soft",
    "noise.worley":"Worley — spots",
    "noise.grain":"Grain — film",
    "noise.perlin.short":"Perlin",
    "noise.value.short":"Value",
    "noise.worley.short":"Worley",
    "noise.grain.short":"Grain",
    "noise.type":"Type",
    "noise.spotSize":"Size {axis}",
    "noise.grainSize":"Grain {axis}",
    "noise.cells":{"one":"{n} cell","other":"{n} cells"},
    "noise.linkXY":"link X=Y",
    "noise.seed":"Seed",
    "noise.seedBad":"Seed must be an integer from −2147483648 to 2147483647; got “{value}”.",
    "noise.octaves":"Octaves",
    "noise.gain":"Gain",
    "noise.lacunarity":"Lacunarity",
    "noise.ridged":"Ridged",
    "noise.worleyMode":"Mode",
    "noise.jitter":"Jitter",
    "noise.grainHp":"High-pass",
    "noise.warp":"Warp",
    "noise.warpSize":"Warp scale",
    "worley.f1":"F1 — spots",
    "worley.f2":"F2 — second nearest",
    "worley.f2f1":"F2−F1 — cells/cracks",
    "shape.contrast":"Contrast",
    "shape.bias":"Bias",
    "shape.gamma":"Gamma",
    "shape.invert":"Invert",
    "shape.normalize":"Normalize range",
    "stops.low":"low",
    "stops.high":"high",
    "stops.lowTitle":"low noise · 0",
    "stops.highTitle":"high noise · 1",
    "layer.blend":"Blend",
    "layer.opacity":"Opacity",
    "blend.normal":"Normal",
    "blend.multiply":"Multiply",
    "blend.screen":"Screen",
    "blend.overlay":"Overlay",
    "blend.hard-light":"Hard light",
    "blend.soft-light":"Soft light",
    "blend.add":"Add",
    "blend.subtract":"Subtract",
    "blend.darken":"Darken",
    "blend.lighten":"Lighten",
    "blend.difference":"Difference",
    "out.stopMix":"Mix",
    "out.ditherMode":"Mode",
    "out.ditherAmount":"Amount, LSB",
    "out.webpQuality":"Quality",
    "stopMix.oklab":"OKLab (perceptual)",
    "stopMix.srgb-linear":"Linear sRGB (physical)",
    "dither.tpdf":"TPDF (noise)",
    "dither.ordered":"Bayer 8×8",
    "dither.off":"Off",
    "color.badMode":"Saved color mode “{mode}” is unknown; switched to HSL.",
    "color.clipped":"C reduced to the sRGB gamut boundary: {c} (requested {want}).",
    "chan.copySuffix":" copy",
    "meta.octaves":"{n} oct",
    "warn.octaves":"Octaves capped at {cap}: on a {w}×{h} tile, the next octave’s cells would be smaller than a pixel.",
    "render.prepFail":"Failed to prepare the render job: {err}",
    "render.fail":"Render error: {err}",
    "render.metaFail":"Failed to build channel summaries: {err}",
    "file.unsaved":"not saved to a file",
    "file.saved":"Saved: {path}",
    "session.autosaveFail":"Autosave failed: {err}",
    "session.restoreFail":"Couldn’t restore the previous session: {err}\nThe built-in preset has been opened instead.",
    "src.history":"edit history",
    "src.session":"previous session",
    "src.default":"built-in preset",
    "src.typeThumb":"thumbnail for type {type}",
    "lib.title":"Library",
    "lib.dir":"Folder…",
    "lib.noDir":"No library folder selected. Click “Folder…” — any folder will do, e.g. presets/ in the app folder.",
    "lib.presets":{"one":"{n} preset","other":"{n} presets"},
    "lib.skipped":", not ZERNO: {n} ({list})",
    "lib.errors":"Errors ({n}):",
    "lib.thumbError":"error",
    "lib.thumbFail":"Library thumbnails: {err}",
    "lib.delAsk":"Delete “{name}” from the library folder?\nThis can’t be undone.",
    "lib.delTitle":"ZERNO — Delete preset",
    "lib.delOk":"Delete",
    "lib.delCancel":"Cancel",
    "lib.deleted":"File deleted: {name}",
    "lib.fail":"Library: {err}",
    "doc.opened":"Opened: {name}  ·  Ctrl+Z restores the previous document",
    "doc.openFail":"Couldn’t open {name}: {err}",
    "doc.root":"document",
    "dlg.libDir":"Preset library folder",
    "dlg.open":"Open preset",
    "dlg.save":"Save preset",
    "dlg.filter":"ZERNO preset",
    "dlg.exportPng":"Export PNG",
    "dlg.exportWebp":"Export WebP",
    "export.saved":"{fmt} saved: {path}  ·  {kb} KB",
    "css.comment":"{name} — {w}×{h} tile",
    "css.copied":"CSS copied to the clipboard ({kb} KB including the data-URI).",
    "drop.skipped":"Skipped (expected *.json): {list}",
    "drop.many":"Presets dropped: {n}. Opened the first one: {first}",
    "drop.unavailable":"File drag-and-drop is unavailable: {err}",
    "preset.default":"basic · dark canvas",
    "preset.default.clouds":"Clouds",
    "preset.default.cells":"Spots",
    "preset.default.grain":"Grain",
    "boot.runExe":"Please launch the app with zerno.exe.",
    "boot.badDefault":"The built-in preset failed validation:\n{err}",
    "engine.infoFail":"Engine info: {err}",
    "titlebar.fail":"Title bar color: {err}",
    "titlebar.part.caption":"background",
    "titlebar.part.text":"text",
    "titlebar.part.border":"border",
    "thumbs.typeFail":"Couldn’t build noise type thumbnails: {err}",
    "lang.badSaved":"Saved language “{code}” is unknown; using the system language.",
    "lang.titleFail":"Couldn’t update the window title: {err}",
    "msg.inFile":"[file: {file}]",
    "msg.internal":"Internal error: {text}",
    "msg.doc.notObject":"{field}: expected an object, got {got}",
    "msg.doc.missing":"{field}: required field is missing",
    "msg.doc.notNumber":"{field}: expected a number, got {got}",
    "msg.doc.range":"{field}: value {value} is out of range [{min}; {max}]",
    "msg.doc.notInt":"{field}: expected an integer, got {value}",
    "msg.doc.notBool":"{field}: expected true/false, got {got}",
    "msg.doc.notString":"{field}: expected a string, got {got}",
    "msg.doc.badEnum":"{field}: invalid value \"{value}\". Allowed: {allowed}",
    "msg.doc.unknownField":"{field}: unknown field. Allowed: {allowed}",
    "msg.doc.format":"{field}: expected \"{want}\", got \"{got}\"",
    "msg.doc.version":"{field}: file version {got}; only version {supported} is supported",
    "msg.doc.notArray":"{field}: expected an array, got {got}",
    "msg.doc.json":"not valid JSON: {detail}",
    "msg.doc.notPreset":"“{name}” is not a ZERNO preset (no \"format\": \"{format}\").",
    "msg.color.badHex":"Invalid HEX: \"{hex}\". Expected #RGB or #RRGGBB.",
    "msg.export.webpFail":"WebView couldn’t encode WebP (got: {got}). Save as PNG instead.",
    "msg.lib.badJson":"{name}: not valid JSON — {detail}",
    "msg.render.degenerate":"Channel “{channel}”, type “{type}”: cell size {w}×{h} px is below {min} px — the noise degenerates on such a fine lattice. Increase the size or switch to the “Grain” type, which is designed for 1 px.",
    "msg.render.fieldOom":"Channel “{channel}”: out of memory for the {w}×{h} noise field",
    "msg.render.bufferOom":"Out of memory for the response buffer",
    "msg.render.tooLarge":"Total job area is too large",
    "msg.worker.crashed":"Worker thread crashed: {detail}",
    "msg.settings.read":"Can’t read {path}: {os}",
    "msg.settings.json":"{path}: not valid JSON — {detail}",
    "msg.settings.notObject":"{path}: expected an object",
    "msg.settings.unknownField":"{path}: unknown field “{field}”. Allowed: {allowed}",
    "msg.settings.missing":"{path}.{field}: required field is missing",
    "msg.settings.badType":"{path}.{field}: expected a string or null",
    "msg.settings.locked":"Settings are locked by a crashed thread",
    "msg.settings.mkdir":"Can’t create {path}: {os}",
    "msg.io.write":"Can’t write {path}: {os}",
    "msg.io.replace":"Couldn’t replace {path}: {os}",
    "msg.io.replace.cleanup":"; temporary file {tmp} was not deleted: {cleanup}",
    "msg.path.notUnicode":"Path is not valid Unicode: {path}",
    "msg.lib.dirUnavailable":"Folder {path} is unavailable: {os}",
    "msg.lib.walk":"Scanning folder {path} was interrupted: {os}",
    "msg.lib.nameNotUnicode":"File name is not valid Unicode: {path}",
    "msg.lib.fileType":"{name}: can’t determine the file type — {os}",
    "msg.file.read":"{path}: can’t read — {os}",
    "msg.file.tooLarge":"{path}: {bytes} bytes — over {max}, so it’s not a preset",
    "msg.lib.notChosen":"No library folder has been selected yet.",
    "msg.lib.badName":"“{name}” is not a preset file name in the library folder",
    "msg.lib.delete":"Couldn’t delete {path}: {os}",
    "msg.lib.reveal":"Couldn’t open {path}: {os}",
    "msg.file.noName":"No file name: {path}",
    "msg.dialog.badPath":"Can’t parse the selected path: {detail}",
    "msg.titlebar.unsupported":"Windows rejected the title bar color ({part}): HRESULT {hresult}. Custom title bar colors are only supported in Windows 11.",
    "msg.titlebar.notWindows":"Title bar coloring is only supported in Windows 11."
  },
  help:`
        <article data-topic="start" data-title="Getting started">
          <h2>How a tile is built</h2>
          <p>A tile is an image that repeats without visible seams. It is made of a
            <b>background</b> and a stack of <b>noise channels</b>: each channel is a noise
            pattern, colored with two colors and layered over whatever lies beneath it.</p>
          <h3>Workflow</h3>
          <ol>
            <li>Set the tile size — <a data-go="tile">Tile</a>.</li>
            <li>Pick the color under the pattern — <a data-go="bg">Background</a>.</li>
            <li>Add channels with the “+ …” buttons below the list and tune them in the channel card:
              <a data-go="noise">Noise</a>, <a data-go="shape">Shape</a>,
              <a data-go="color">Color</a>, <a data-go="layer">Layer</a>.</li>
            <li>Check the seams — <a data-go="stage">Stage</a>.</li>
            <li>Save and export — <a data-go="files">Files and export</a>.</li>
          </ol>
          <h3>Sliders and numbers</h3>
          <p>Set a value with the slider, type it into the field on the right (period and comma
            both work as the decimal separator; press Enter to apply), or drag the mouse across
            the field itself: hold Shift for finer steps, Ctrl for faster ones. Out-of-range
            numbers are clamped to the nearest limit.</p>
          <p>Every edit shows up on the stage right away. Undo with Ctrl+Z; all shortcuts are listed in
            <a data-go="keys">Shortcuts</a>.</p>
          <p>The <span class="help-i demo">?</span> icon next to a group opens its help section.</p>
        </article>

        <article data-topic="tile" data-title="Tile">
          <h2>Tile</h2>
          <p>Size in pixels, from 8 to 4096 on each side. The 64²…1024² buttons set a
            square; “Width” and “Height” set each side separately.</p>
          <p><b>Tiling is seamless at any size</b>, odd sizes included. The noise pattern
            is built on a lattice that fits a whole number of cells along each side of the
            tile, so the left edge continues the right one and the top edge continues the bottom.</p>
          <p>Cell sizes in channels are set in pixels. When you change the tile size, the
            cell count is recalculated, and the “N cells” labels in the cards update automatically.</p>
          <p>Larger tiles take longer to render: the last frame time is shown in the status
            bar at the bottom (“render … ms”).</p>
        </article>

        <article data-topic="bg" data-title="Background">
          <h2>Tile background</h2>
          <p>A solid color beneath all channels. Its HEX value is shown on the right of the
            section header. The editor is the same as for channel colors: HSL and LCH modes,
            a HEX field, and alpha — see <a data-go="color">Color</a> for what the values mean.</p>
          <p><b>A</b> (alpha) below 1 makes the background semi-transparent: PNG and WebP
            exports will keep the transparency, so the tile can be laid over another
            background. On the stage, the backdrop color shows through transparent areas
            (<a data-go="stage">Stage</a>).</p>
        </article>

        <article data-topic="chans" data-title="Channels">
          <h2>Noise channels</h2>
          <p>A channel is a single pattern layer. <b>The first channel in the list sits directly on the background</b>,
            each next one goes on top of the previous ones, and the last one is the topmost. How a
            channel combines with the layers below — see <a data-go="layer">Layer</a>.</p>
          <h3>Channel card</h3>
          <dl>
            <dt>thumbnail</dt><dd>the channel on its own, without the background or other channels;</dd>
            <dt>name</dt><dd>edit it right in the header;</dd>
            <dt>summary</dt><dd>type · cell size · octave count · blend mode and opacity;</dd>
            <dt>strip</dt><dd>the channel’s color gradient;</dd>
            <dt>● / ○</dt><dd>turn the channel on / off (a disabled channel isn’t drawn but stays in the document);</dd>
            <dt>↑ ↓</dt><dd>move up / down in the list;</dd>
            <dt>⧉</dt><dd>duplicate the channel with a new random seed;</dd>
            <dt>✕</dt><dd>delete the channel (Ctrl+Z brings it back);</dd>
            <dt>›</dt><dd>click the card to expand or collapse its settings.</dd>
          </dl>
          <p>If the card shows an “Octaves capped” warning, some octaves don’t fit: the next
            octave’s cells would be smaller than 2 pixels (<a data-go="noise">Noise</a>).</p>
          <h3>New channel</h3>
          <p>The “+ …” buttons below the list add a channel of the chosen type to the end of the
            list, i.e. on top of the others. Each button shows a thumbnail of its pattern type.</p>
        </article>

        <article data-topic="noise" data-title="Noise">
          <h2>Noise — which pattern</h2>
          <dl>
            <dt>Type</dt><dd>
              <b>Perlin</b> — clouds, smooth winding blotches;
              <b>Value</b> — softer than Perlin, less “veiny”;
              <b>Worley</b> — spots and cells around random points;
              <b>Grain</b> — independent dots, like film grain.</dd>
            <dt>Size X, Y</dt><dd>The size of one pattern cell in pixels, horizontally and
              vertically. It changes <b>in steps</b>: a whole number of cells must fit along
              each side of the tile, or there would be a seam, so the size is always “side / integer”.
              On a 256 tile, 128 (2 cells) is followed directly by 85.3 (3 cells). The label
              below shows the current cell count. The smallest size is 2 px, the largest is the
              whole side (a single cell).</dd>
            <dt>Grain X, Y</dt><dd>For the “Grain” type — the size of a single grain, from 1 px; also in steps.</dd>
            <dt>link X=Y</dt><dd>makes the Y size equal to the X size.</dd>
            <dt>Seed</dt><dd>The variant number of the random pattern: the same seed gives the same
              pattern, a different one gives a different pattern with the same properties. An integer; ⟳ picks a new random one.</dd>
            <dt>Octaves</dt><dd>1–10. How many layers of ever finer pattern are summed together:
              1 gives smooth blotches, more adds richer fine detail. Octaves finer than 2 px
              are dropped, and the card shows a warning about it.</dd>
            <dt>Gain</dt><dd>0–1. How much weaker each octave is than the previous one:
              0.5 means half as strong; closer to 0, fine detail is barely visible; closer to 1,
              fine detail is as strong as the large blotches.</dd>
            <dt>Lacunarity</dt><dd>2–4, integer. How many times finer each octave is than the
              previous one. It’s an integer so that the octaves tile seamlessly too.</dd>
            <dt>Ridged</dt><dd>Perlin and Value: folds and ridges instead of clouds.</dd>
            <dt>Mode</dt><dd>Worley. <b>F1</b> — distance to the nearest point: round spots;
              <b>F2</b> — to the second nearest: larger and more angular;
              <b>F2−F1</b> — the difference: thin cell borders, cracks, a mesh.</dd>
            <dt>Jitter</dt><dd>Worley, 0–1. How far the points are shifted from the cell centers:
              0 is a regular grid, 1 is complete disorder.</dd>
            <dt>High-pass</dt><dd>Grain, 0–64 px. 0 is white noise. Above 0, a blurred copy of the
              grain with this radius is subtracted from it: this removes the large blotches that
              make tile repetition stand out (“blue” grain).</dd>
            <dt>Warp</dt><dd>0–400 px. The pattern is displaced by a second, large-scale noise, so
              lines become fluid and “marbled”. The value is the displacement strength, roughly in
              pixels; 0 means no warp.</dd>
            <dt>Warp scale</dt><dd>2–2048 px. The size of the warp waves: small values give fine ripples,
              large ones give smooth bends. Shown when Warp is above 0.</dd>
          </dl>
        </article>

        <article data-topic="shape" data-title="Shape">
          <h2>Shape — how a noise value becomes a color</h2>
          <p>At every point, noise is a number from 0 (low) to 1 (high). The point’s color is
            taken from the channel gradient at that position (<a data-go="color">Color</a>). Shape
            transforms the number before coloring, in this order: invert → contrast → bias → gamma.</p>
          <dl>
            <dt>Contrast</dt><dd>−1…1. 0 means no change. Above 0, values spread away from the
              middle: blotches get sharper, and at 1 you get nearly two pure colors with no transition.
              Below 0, values squeeze toward the middle: at −1 the whole tile is one mid-tone
              color, and around −0.9 the pattern is already barely visible.</dd>
            <dt>Bias</dt><dd>−0.5…0.5. Added to every value: above 0 brings in more of the high-noise
              color, below 0 more of the low-noise one.</dd>
            <dt>Gamma</dt><dd>0.1–8; 1 means no change. Above 1, the low-noise color dominates and
              high areas shrink into sparse spots; below 1, the opposite.</dd>
            <dt>Invert</dt><dd>swaps low and high areas.</dd>
            <dt>Normalize</dt><dd>Without it, the gradient is mapped to the theoretical range of the
              noise, but the actual range is usually narrower — especially with many octaves — so the
              colors of the end handles are never reached. With it, the noise’s actual spread on this
              tile is stretched across the whole gradient.</dd>
          </dl>
        </article>

        <article data-topic="color" data-title="Color">
          <h2>Channel color</h2>
          <p>A gradient bar with two handles: <b>low</b> is the color where the noise is 0,
            <b>high</b> is the color where it’s 1, with a smooth transition in between. Alpha
            transitions from one handle to the other as well.</p>
          <ul>
            <li>click a handle to open its editor, click again to hide it;</li>
            <li>⇄ swaps the two colors;</li>
            <li>the color space the two colors are mixed in is set in <a data-go="out">Output</a>.</li>
          </ul>
          <h3>Color editor</h3>
          <p>The swatch shows the current color; the field holds its HEX (#RRGGBB — you can type your own).
            The <b>HSL / LCH</b> switch offers two ways to edit the same color; the choice is shared
            by all editors and remembered. The scale under each slider shows what the color would
            become if you moved only that slider — which is why the scales redraw when the
            other sliders change.</p>
          <h3>LCH (OKLCH)</h3>
          <dl>
            <dt>L</dt><dd>0–1, perceived lightness: 0 is black, 1 is white. Colors of any hue with the
              same L look equally light. L = 0.5 is roughly gray #636363,
              not “half the screen brightness”.</dd>
            <dt>C</dt><dd>0–0.33, chroma — how far the color is from a gray of the same L.
              An absolute measure: 0 is gray, 0.03–0.05 is a faint tint, around 0.1 is
              noticeable, 0.15–0.25 is vivid, around 0.32 is the limit of an sRGB screen.</dd>
            <dt>H</dt><dd>0–360°, hue. Reference points: red ≈ 29, yellow ≈ 110, green ≈ 142,
              cyan ≈ 195, blue ≈ 264, magenta ≈ 328.</dd>
          </dl>
          <p><b>The dark tail on the C scale</b> is chroma that the screen can’t display at the
            current L and H. The boundary shifts: yellow can be saturated only when light,
            blue only when dark, and near-black and near-white have no saturation at all.
            If the requested C doesn’t fit, it’s reduced to the boundary, the slider moves back,
            and a note appears below the sliders. Restore L or H, and the requested C comes back too.</p>
          <h3>HSL (OKHSL)</h3>
          <dl>
            <dt>H</dt><dd>0–360°, hue, the same angle as in LCH.</dd>
            <dt>S</dt><dd>0–1, saturation <b>relative to the maximum possible</b> at this L and H:
              1 is as saturated as it gets. Nothing is ever clipped, but the same S on
              different hues gives colors that look different in vividness.</dd>
            <dt>L</dt><dd>0–1, lightness: 0 is black, 1 is white.</dd>
          </dl>
          <p>LCH is handy when colors need to look equally saturated; HSL, when you want to
            turn the knobs freely without limits. Either way, the file stores colors in OKHSL.</p>
          <h3>A</h3>
          <p>0–1, color opacity: 0 is transparent, 1 is opaque.</p>
        </article>

        <article data-topic="layer" data-title="Layer">
          <h2>Layer — how a channel combines with the ones below</h2>
          <dl>
            <dt>Blend</dt><dd>The blend mode over everything beneath the channel (the background and the
              channels above it in the list). Computed in linear light using the W3C formulas.
              <ul>
                <li><b>Normal</b> — the channel covers what’s below, as far as its opacity allows;</li>
                <li><b>Multiply</b> — darkens: white leaves the layers below unchanged, black gives black;</li>
                <li><b>Screen</b> — lightens: black leaves the layers below unchanged;</li>
                <li><b>Overlay</b> — boosts the contrast of the layers below: darks get darker, lights get lighter;</li>
                <li><b>Hard light</b> — the same, but driven by the channel: its dark areas darken, its light areas lighten;</li>
                <li><b>Soft light</b> — a gentler version of Hard light;</li>
                <li><b>Add</b> — brightness values are added together; lightens strongly;</li>
                <li><b>Subtract</b> — the channel is subtracted from the layers below; darkens;</li>
                <li><b>Darken / Lighten</b> — for each component, the smaller / larger
                  of the two is kept;</li>
                <li><b>Difference</b> — the absolute difference: identical colors give black.</li>
              </ul></dd>
            <dt>Opacity</dt><dd>0–1, opacity of the whole channel, applied on top of its colors’ alpha.
              0 makes the channel invisible, 1 applies it at full strength.</dd>
          </dl>
        </article>

        <article data-topic="out" data-title="Output">
          <h2>Output — global render settings</h2>
          <dl>
            <dt>Mix</dt><dd>The color space used for the transition between the two colors of
              each channel. <b>OKLab</b> — visually even, with no muddy or dark midpoints.
              <b>Linear sRGB</b> — how light physically mixes; the middle of the transition
              looks lighter than in OKLab. It doesn’t affect layer blend modes:
              those are always computed in linear light.</dd>
            <dt>Dithering</dt><dd>Removes the banding on smooth gradients that
              appears when converting to 8 bits per channel. <b>TPDF</b> — unobtrusive noise,
              <b>Bayer 8×8</b> — a regular pattern, <b>Off</b> — no dithering. Pure
              black and fully opaque alpha stay clean.</dd>
            <dt>Amount, LSB</dt><dd>0–4, dithering strength in least significant bits: 1 is one step out of
              the channel’s 256 values.</dd>
            <dt>Quality</dt><dd>0–1, WEBP export only: 1.00 is lossless; lower values give a
              smaller file but with compression artifacts.</dd>
          </dl>
        </article>

        <article data-topic="stage" data-title="Stage">
          <h2>Stage — checking the seams by eye</h2>
          <p>The whole stage is filled with repeated tiles. One tile in the middle is marked
            with corner brackets.</p>
          <dl>
            <dt>zoom</dt><dd>25–800 %. Use the slider, the mouse wheel over the stage, or Ctrl+= / Ctrl+−;
              “1:1”, a double-click on the stage, or Ctrl+0 resets it to 100 %.</dd>
            <dt>backdrop</dt><dd>the color of the frame around the tiled area; it also shows through
              transparent areas of the tile. Helps you judge how the tile looks on dark and light surroundings.</dd>
            <dt>Edges</dt><dd>a thin grid along the tile edges.</dd>
            <dt>Offset ½</dt><dd>shifts the layout by half a tile: the stage center now shows the corner
              where four tiles meet — if there were a seam, this is where you’d see it.</dd>
            <dt>Smooth</dt><dd>pixel smoothing when zoomed in; without it, you see crisp
              pixels.</dd>
            <dt>Library</dt><dd>show / hide the right-hand column (<a data-go="lib">Library</a>).</dd>
          </dl>
          <p>The status bar at the bottom shows readiness, tile size, how many channels are enabled,
            the last frame time, and how many threads the engine is using.</p>
        </article>

        <article data-topic="lib" data-title="Library">
          <h2>Preset library</h2>
          <p>The library is any folder containing <code>*.json</code> files. The
            <code>presets/</code> folder from the app folder works too.</p>
          <dl>
            <dt>Folder…</dt><dd>choose a folder; the choice is remembered.</dd>
            <dt>↗</dt><dd>open the folder in File Explorer.</dd>
            <dt>↻</dt><dd>rescan the folder (if files were changed outside the app).</dd>
            <dt>thumbnail</dt><dd>click to open the preset and link the document to its file:
              “Save” then writes straight to it.</dd>
            <dt>✕ on a thumbnail</dt><dd>delete the file from the folder, after confirmation.</dd>
          </dl>
          <p>Files with errors don’t vanish silently: a list with the reasons appears under the header,
            and unrelated <code>*.json</code> files are listed separately.</p>
        </article>

        <article data-topic="files" data-title="Files and export">
          <h2>Files and export</h2>
          <p>The top bar shows the preset name (you can edit it), next to it the name of the file
            the document is linked to, and a dot if there are unsaved changes.</p>
          <dl>
            <dt>Open</dt><dd>open a <code>*.json</code> preset; you can also just drop the
              file onto the window. Ctrl+Z after opening restores the previous document.</dd>
            <dt>Save</dt><dd>write to the linked file; if there’s no file yet, asks where to save.</dd>
            <dt>As…</dt><dd>save to a new file.</dd>
            <dt>CSS</dt><dd>copy a CSS block to the clipboard: the tile as a data-URI plus
              <code>background-repeat</code>.</dd>
            <dt>WEBP</dt><dd>export to WebP; quality is set in <a data-go="out">Output</a>.</dd>
            <dt>PNG</dt><dd>export to PNG, lossless, with alpha.</dd>
          </dl>
          <p>The session is saved automatically: after a restart, the same document is open.</p>
        </article>

        <article data-topic="keys" data-title="Shortcuts">
          <h2>Keyboard and mouse</h2>
          <table>
            <tr><td>Ctrl+Z</td><td>undo</td></tr>
            <tr><td>Ctrl+Y, Ctrl+Shift+Z</td><td>redo</td></tr>
            <tr><td>Ctrl+S</td><td>save</td></tr>
            <tr><td>Ctrl+Shift+S</td><td>save as…</td></tr>
            <tr><td>Ctrl+O</td><td>open a preset (or drop a *.json onto the window)</td></tr>
            <tr><td>Ctrl+E</td><td>export PNG</td></tr>
            <tr><td>Ctrl+= / Ctrl+−</td><td>zoom the stage</td></tr>
            <tr><td>Ctrl+0</td><td>zoom 1:1</td></tr>
            <tr><td>wheel over the stage</td><td>zoom</td></tr>
            <tr><td>double-click on the stage</td><td>zoom 1:1</td></tr>
            <tr><td>drag across a number field</td><td>change the value; Shift — finer, Ctrl — faster</td></tr>
            <tr><td>F1</td><td>help</td></tr>
            <tr><td>Esc</td><td>close help</td></tr>
          </table>
        </article>
`
});
