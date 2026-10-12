// Генерация библиотеки пресетов noises/*.json с проверкой валидатором и швом.
const fs = require('fs');
const path = require('path');
const { ROOT, coreCode } = require('./load-app.js');

const OUT = ROOT + '/noises';
const code = coreCode();
class ImageData { constructor(w, h) { this.width = w; this.height = h; this.data = new Uint8ClampedArray(w * h * 4); } }
const M = new Function('ImageData', code + '\nreturn {validateDoc,serializeDoc,composeDoc,accToImageData,FORMAT,DOC_VERSION};')(ImageData);

// ---- сокращения ----
const c = (h, s, l, a) => ({ h, s, l, a });
function nz(o) {
  const sh = Object.assign({ contrast: 0, bias: 0, gamma: 1, invert: false, normalize: true }, o.shape || {});
  const n = Object.assign({
    type: 'perlin', sizeX: 64, sizeY: 64, seed: 1, octaves: 3, gain: 0.5, lacunarity: 2,
    ridged: false, warpAmount: 0, warpSize: 128, worleyMode: 'f1', worleyJitter: 1, grainHp: 3
  }, o);
  n.shape = sh;
  return n;
}
let cid = 0;
const ch = (name, noise, low, high, blend, opacity) => ({
  id: 'c' + (++cid), name, enabled: true, blend: blend || 'normal',
  opacity: opacity === undefined ? 1 : opacity, noise, low, high
});
const doc = (name, w, h, bg, channels, dither) => ({
  format: M.FORMAT, version: M.DOC_VERSION, name,
  tile: { width: w, height: h },
  render: { stopMix: 'oklab', dither: dither || { mode: 'tpdf', amount: 1 }, webpQuality: 1 },
  background: bg, channels
});

const grain = (seed, hp, alpha, hue, contrast, opacity) => ch('Зерно',
  nz({ type: 'grain', sizeX: 1, sizeY: 1, seed, grainHp: hp, shape: { contrast: contrast === undefined ? 0.3 : contrast } }),
  c(hue || 0, 0.04, 0, alpha), c(hue || 0, 0.04, 1, alpha), 'normal', opacity === undefined ? 1 : opacity);

// ------------------------------------------------------------------ пресеты
const PRESETS = [

['01-tyomny-kholst.json', doc('основа · тёмный холст', 512, 512, c(258, 0.07, 0.145, 1), [
  ch('Облака', nz({ sizeX: 186, sizeY: 186, seed: 1337, octaves: 4, gain: 0.52, warpAmount: 38, warpSize: 240, shape: { contrast: 0.1 } }),
     c(266, 0.24, 0.04, 0.34), c(198, 0.30, 0.60, 0.13)),
  ch('Пятна', nz({ type: 'worley', sizeX: 78, sizeY: 78, seed: 20260828, octaves: 2, gain: 0.45, warpAmount: 14, warpSize: 160, shape: { contrast: 0.2, gamma: 1.1, invert: true } }),
     c(38, 0.35, 0.30, 0), c(38, 0.45, 0.72, 0.30), 'soft-light', 0.7),
  grain(777, 4, 0.075, 258, 0.35)
])],

['02-bumaga-teplaya.json', doc('бумага · тёплая', 512, 512, c(78, 0.13, 0.925, 1), [
  ch('Разводы', nz({ sizeX: 168, sizeY: 168, seed: 5150, octaves: 4, gain: 0.55, warpAmount: 34, warpSize: 210, shape: { contrast: 0.12 } }),
     c(42, 0.38, 0.52, 0.12), c(80, 0.14, 1, 0)),
  ch('Волокна', nz({ type: 'value', sizeX: 3, sizeY: 46, seed: 8102, octaves: 2, gain: 0.5, shape: { contrast: 0.25 } }),
     c(52, 0.22, 0.42, 0.055), c(60, 0.10, 1, 0), 'multiply', 0.85),
  grain(31337, 3, 0.05, 48, 0.3)
])],

['03-beton.json', doc('бетон · шлифованный', 512, 512, c(252, 0.018, 0.715, 1), [
  ch('Разнотон', nz({ sizeX: 224, sizeY: 224, seed: 606, octaves: 4, gain: 0.55, warpAmount: 62, warpSize: 260 }),
     c(252, 0.03, 0.28, 0.15), c(252, 0.02, 0.97, 0.09)),
  ch('Поры', nz({ type: 'worley', sizeX: 26, sizeY: 26, seed: 4004, octaves: 2, gain: 0.4, shape: { contrast: 0.5, gamma: 2.2, invert: true } }),
     c(252, 0.03, 0.22, 0), c(252, 0.02, 0.18, 0.30), 'multiply', 0.8),
  grain(9091, 2, 0.06, 252, 0.35)
])],

['04-plenka-400.json', doc('плёнка 400 · накладка', 256, 256, c(0, 0, 0.5, 0), [
  ch('Зерно мелкое', nz({ type: 'grain', sizeX: 1, sizeY: 1, seed: 400, grainHp: 3, shape: { contrast: 0.42 } }),
     c(0, 0, 0, 0.095), c(0, 0, 1, 0.095)),
  ch('Зерно крупное', nz({ type: 'grain', sizeX: 3, sizeY: 3, seed: 401, grainHp: 7, shape: { contrast: 0.3 } }),
     c(0, 0, 0, 0.055), c(0, 0, 1, 0.055), 'normal', 0.7)
])],

['05-shelk.json', doc('шёлк · переливы', 512, 512, c(332, 0.17, 0.215, 1), [
  ch('Блик', nz({ sizeX: 300, sizeY: 300, seed: 21, octaves: 3, gain: 0.5, warpAmount: 80, warpSize: 300 }),
     c(300, 0.30, 0.10, 0.20), c(22, 0.55, 0.78, 0.16)),
  ch('Уток', nz({ type: 'value', sizeX: 2.5, sizeY: 96, seed: 77, octaves: 2, gain: 0.45, shape: { contrast: 0.3 } }),
     c(332, 0.22, 0.06, 0.16), c(332, 0.26, 0.62, 0.12)),
  ch('Основа', nz({ type: 'value', sizeX: 96, sizeY: 2.5, seed: 78, octaves: 2, gain: 0.45, shape: { contrast: 0.3 } }),
     c(332, 0.22, 0.06, 0.10), c(332, 0.26, 0.62, 0.08)),
  grain(512, 3, 0.04, 332, 0.3)
])],

['06-zvyozdnoe-pole.json', doc('звёздное поле', 512, 512, c(258, 0.26, 0.075, 1), [
  ch('Пыль', nz({ sizeX: 236, sizeY: 236, seed: 9, octaves: 4, gain: 0.55, warpAmount: 46, warpSize: 260 }),
     c(268, 0.42, 0.16, 0.34), c(212, 0.42, 0.46, 0.20)),
  ch('Звёзды', nz({ type: 'worley', sizeX: 22, sizeY: 22, seed: 1101, octaves: 1, shape: { contrast: 0.86, gamma: 3.4, invert: true } }),
     c(52, 0.10, 1, 0), c(52, 0.14, 1, 0.95), 'screen'),
  ch('Звёзды мелкие', nz({ type: 'worley', sizeX: 9, sizeY: 9, seed: 1102, octaves: 1, shape: { contrast: 0.92, gamma: 4, invert: true } }),
     c(210, 0.12, 1, 0), c(210, 0.16, 1, 0.7), 'screen', 0.6),
  grain(4, 2, 0.04, 258, 0.3)
])],

['07-karbon.json', doc('карбон · плетение', 256, 256, c(252, 0.03, 0.115, 1), [
  ch('Плетение', nz({ type: 'worley', sizeX: 19, sizeY: 19, seed: 300, octaves: 1, worleyMode: 'f2f1', worleyJitter: 0.12, shape: { gamma: 0.62, contrast: 0.15 } }),
     c(252, 0.05, 0.045, 0.6), c(252, 0.07, 0.46, 0.12)),
  ch('Блик', nz({ sizeX: 190, sizeY: 190, seed: 301, octaves: 2, gain: 0.5, warpAmount: 30, warpSize: 190 }),
     c(200, 0.30, 0.80, 0), c(200, 0.32, 0.86, 0.10), 'screen'),
  grain(302, 2, 0.05, 252, 0.3)
])],

['08-dyuny.json', doc('дюны · песок', 512, 512, c(66, 0.29, 0.605, 1), [
  ch('Гребни', nz({ sizeX: 152, sizeY: 152, seed: 55, octaves: 4, gain: 0.46, ridged: true, warpAmount: 72, warpSize: 260, shape: { contrast: 0.18 } }),
     c(38, 0.42, 0.33, 0.32), c(80, 0.30, 0.97, 0.22)),
  ch('Рябь', nz({ sizeX: 36, sizeY: 36, seed: 56, octaves: 3, gain: 0.5, ridged: true, warpAmount: 12, warpSize: 90 }),
     c(38, 0.40, 0.35, 0.18), c(80, 0.28, 0.95, 0.14), 'soft-light', 0.55),
  grain(57, 3, 0.05, 60, 0.3)
])],

['09-tuman.json', doc('туман · светлый фон', 512, 512, c(232, 0.022, 0.965, 1), [
  ch('Дымка', nz({ sizeX: 300, sizeY: 300, seed: 12, octaves: 3, gain: 0.55, warpAmount: 54, warpSize: 300 }),
     c(232, 0.12, 0.52, 0.055), c(232, 0.05, 1, 0)),
  grain(13, 4, 0.028, 232, 0.25)
])],

['10-stalnaya-setka.json', doc('стальная сетка', 384, 384, c(220, 0.035, 0.28, 1), [
  ch('Сетка', nz({ type: 'worley', sizeX: 15, sizeY: 15, seed: 700, octaves: 1, worleyMode: 'f2f1', worleyJitter: 0, shape: { gamma: 0.5, contrast: 0.35, invert: true } }),
     c(220, 0.05, 0.14, 0.55), c(220, 0.08, 0.62, 0.16)),
  ch('Потёртости', nz({ sizeX: 128, sizeY: 128, seed: 701, octaves: 4, gain: 0.55, warpAmount: 40, warpSize: 160 }),
     c(28, 0.30, 0.30, 0.20), c(200, 0.10, 0.85, 0.10), 'overlay', 0.7),
  grain(702, 2, 0.055, 220, 0.35)
])]

];

// -------------------------------------------------------------- проверки
function stat(d) {
  const n = d.length, wrap = d[n - 1];
  const inner = Array.from(d.slice(0, n - 1)).sort((a, b) => a - b);
  const p95 = inner[Math.floor(0.95 * (inner.length - 1))];
  return p95 > 1e-12 ? wrap / p95 : (wrap > 1e-9 ? Infinity : 0);
}
function seamRatio(acc, W, H, off) {
  const dx = new Float64Array(W), dy = new Float64Array(H);
  for (let x = 0; x < W; x++) { const xn = (x + 1) % W; let a = 0;
    for (let y = 0; y < H; y++) a += Math.abs(acc[(y * W + xn) * 4 + off] - acc[(y * W + x) * 4 + off]);
    dx[x] = a / H; }
  for (let y = 0; y < H; y++) { const yn = (y + 1) % H; let a = 0;
    for (let x = 0; x < W; x++) a += Math.abs(acc[(yn * W + x) * 4 + off] - acc[(y * W + x) * 4 + off]);
    dy[y] = a / W; }
  return [stat(dx), stat(dy)];
}

fs.mkdirSync(OUT, { recursive: true });
let bad = 0;
const names = [];
for (const [file, raw] of PRESETS) {
  let d;
  try { d = M.validateDoc(raw, file); }
  catch (err) { console.log('✗ ' + file + ' — ' + err.message); bad++; continue; }
  const W = d.tile.width, H = d.tile.height;
  const acc = M.composeDoc(d, W, H);
  const img = M.accToImageData(acc, W, H, d.render.dither);
  let mn = 255, mx = 0, aMin = 255;
  for (let p = 0; p < img.data.length; p += 4) {
    for (let k = 0; k < 3; k++) { const v = img.data[p + k]; if (v < mn) mn = v; if (v > mx) mx = v; }
    if (img.data[p + 3] < aMin) aMin = img.data[p + 3];
  }
  const [sx, sy] = seamRatio(acc, W, H, 1);
  const flat = mx - mn < 6;
  const seamOk = sx <= 2 && sy <= 2;
  if (flat || !seamOk) bad++;
  console.log((flat || !seamOk ? '✗ ' : '✓ ') + file.padEnd(26) +
    W + '×' + H + '  размах ' + String(mx - mn).padStart(3) +
    '  альфа min ' + String(aMin).padStart(3) +
    '  шов ' + sx.toFixed(2) + '/' + sy.toFixed(2) +
    (flat ? '  ПЛОСКО' : '') + (!seamOk ? '  ШОВ!' : ''));
  fs.writeFileSync(path.join(OUT, file), JSON.stringify(M.serializeDoc(d), null, 2) + '\n', 'utf8');
  names.push(file);
}

console.log('\nзаписано пресетов: ' + names.length);
console.log(bad ? '✗ проблемных пресетов: ' + bad : '✓ все пресеты валидны, бесшовны и не вырождены');
process.exit(bad ? 1 : 0);
