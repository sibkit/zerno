// Иконка приложения — кофейное зерно: node tools/make-icon.js
// Нужен собранный zerno-render (cargo build -p zerno-engine --release).
// Пишет app/icons/icon.png (256²) и app/icons/icon.ico (256, 64, 48, 32, 16 — PNG внутри ICO).
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'target', 'release', 'zerno-render.exe');
if (!fs.existsSync(CLI)) throw new Error('нет ' + CLI + ' — соберите: cargo build -p zerno-engine --release');

// Кофейное зерно на прозрачном фоне: форма и свет — аналитически (эллипсоид с
// S-образной бороздкой), фактура поверхности — перлин-шум самого движка.
// Каждый пиксель — среднее 4×4 подвыборок: ровная кромка без лесенки.
const BASE = JSON.parse(fs.readFileSync(path.join(ROOT, 'presets', '01-tyomny-kholst.json'), 'utf8'));

/** Фактура: значения 0…1, среднее ≈ 0.5. */
function texture(side) {
  const doc = {
    format: BASE.format, version: BASE.version, name: 'icon-texture',
    tile: { width: side, height: side },
    render: { stopMix: 'srgb-linear', dither: { mode: 'off', amount: 0 }, webpQuality: 1 },
    background: { h: 0, s: 0, l: 0.5, a: 1 },
    channels: [{ id: 't', name: 't', enabled: true, blend: 'normal', opacity: 1,
      noise: { type: 'perlin', sizeX: Math.max(2, side / 10), sizeY: Math.max(2, side / 10), seed: 31, octaves: 3,
               gain: 0.5, lacunarity: 2, ridged: false, warpAmount: 0, warpSize: 128, worleyMode: 'f1',
               worleyJitter: 1, grainHp: 0, shape: { contrast: 0, bias: 0, gamma: 1, invert: false, normalize: true } },
      low: { h: 0, s: 0, l: 0, a: 1 }, high: { h: 0, s: 0, l: 1, a: 1 } }]
  };
  const out = execFileSync(CLI, { input: JSON.stringify({ jobs: [{ width: side, height: side, doc }] }) });
  if (out.toString('latin1', 0, 4) !== 'ZRN1') throw new Error('zerno-render вернул не ZRN1');
  const px = out.subarray(16), t = new Float32Array(side * side);
  for (let i = 0; i < t.length; i++) t[i] = px[i * 4] / 255;
  return t;
}

const ANG = -38 * Math.PI / 180;           // наклон длинной оси
const A = 0.86, B = 0.62;                 // полуоси в долях половины стороны
const LIGHT = (() => { const v = [-0.45, -0.7, 0.75], n = Math.hypot(...v); return v.map(c => c / n); })();
const ROAST = [[44, 25, 15], [104, 60, 36], [170, 110, 72]];   // тень · середина · блик
const GROOVE = [30, 15, 8];

const lerp = (a, b, t) => a + (b - a) * t;
const mix3 = (c, d, t) => [lerp(c[0], d[0], t), lerp(c[1], d[1], t), lerp(c[2], d[2], t)];
const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

/** Точка в координатах зерна (длинная ось — x). */
function local(X, Y) {
  const c = Math.cos(ANG), s = Math.sin(ANG);
  return [X * c + Y * s, -X * s + Y * c];
}
/** Бороздка: расстояние до S-образной осевой и её полуширина (не тоньше пикселя).
    За концами бороздки (|x| ≥ 0.9·A) её нет — null, а не нулевая ширина. */
function groove(x, y, side) {
  const t = 1 - (x / (0.9 * A)) ** 2;
  if (t <= 0) return null;
  const yc = 0.13 * B * Math.sin(Math.PI * x / A);
  return [Math.abs(y - yc), Math.max(0.07 * B, 1.1 * 2 / side) * Math.sqrt(t)];
}
/** Высота поверхности: эллипсоид, проседающий к бороздке — две «половинки». */
function height(X, Y, side) {
  const [x, y] = local(X, Y);
  const q = (x / A) ** 2 + (y / B) ** 2;
  if (q >= 1) return 0;
  const gr = groove(x, y, side);
  const dip = gr ? 0.32 * Math.exp(-((gr[0] / (0.3 * B)) ** 2)) : 0;
  return Math.sqrt(1 - q) * (1 - dip);
}

function bean(side) {
  const tex = texture(side);
  const amp = side >= 48 ? 0.22 : side >= 32 ? 0.1 : 0;   // на 16–24 px фактура только шумит
  const px = Buffer.alloc(side * side * 4);
  const SS = 4, e = 0.5 / side;
  for (let py = 0; py < side; py++) for (let pxi = 0; pxi < side; pxi++) {
    let cov = 0, r = 0, g = 0, b = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const X = ((pxi + (sx + 0.5) / SS) / side) * 2 - 1, Y = ((py + (sy + 0.5) / SS) / side) * 2 - 1;
      const [x, y] = local(X, Y);
      const q = (x / A) ** 2 + (y / B) ** 2;
      if (q >= 1) continue;
      const hx = (height(X + e, Y, side) - height(X - e, Y, side)) / (2 * e);
      const hy = (height(X, Y + e, side) - height(X, Y - e, side)) / (2 * e);
      const nn = Math.hypot(hx * 0.35, hy * 0.35, 1);
      const lam = Math.max(0, (-hx * 0.35 * LIGHT[0] - hy * 0.35 * LIGHT[1] + LIGHT[2]) / nn);
      const sh = Math.min(1, 0.12 + 0.95 * lam * lam);
      let c = sh < 0.55 ? mix3(ROAST[0], ROAST[1], sh / 0.55) : mix3(ROAST[1], ROAST[2], (sh - 0.55) / 0.45);
      const spec = Math.pow(lam, 24) * 0.3;
      c = mix3(c, [255, 226, 196], spec);
      const gr = groove(x, y, side);
      if (gr) c = mix3(c, GROOVE, 0.92 * smooth(gr[1], gr[1] * 0.3, gr[0]));
      const k = (1 - 0.3 * smooth(0.75, 1, q)) * (1 + amp * (tex[py * side + pxi] - 0.5) * 2);
      cov++; r += c[0] * k; g += c[1] * k; b += c[2] * k;
    }
    const i = (py * side + pxi) * 4;
    if (cov) { px[i] = Math.round(Math.min(255, r / cov)); px[i + 1] = Math.round(Math.min(255, g / cov)); px[i + 2] = Math.round(Math.min(255, b / cov)); }
    px[i + 3] = Math.round(255 * cov / (SS * SS));
  }
  return px;
}

function png(px, side) {
  const raw = Buffer.alloc((side * 4 + 1) * side);
  for (let y = 0; y < side; y++) {
    raw[y * (side * 4 + 1)] = 0;
    px.copy ? px.copy(raw, y * (side * 4 + 1) + 1, y * side * 4, (y + 1) * side * 4)
            : raw.set(px.subarray(y * side * 4, (y + 1) * side * 4), y * (side * 4 + 1) + 1);
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'latin1'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(side, 0); ihdr.writeUInt32BE(side, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const sizes = [256, 64, 48, 32, 16];
const pngs = sizes.map(s => png(bean(s), s));
const dir = path.join(ROOT, 'app', 'icons');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'icon.png'), pngs[0]);

const head = Buffer.alloc(6); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
let off = 6 + 16 * sizes.length;
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e[0] = s === 256 ? 0 : s; e[1] = s === 256 ? 0 : s; e[2] = 0; e[3] = 0;
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(pngs[i].length, 8); e.writeUInt32LE(off, 12);
  off += pngs[i].length;
  return e;
});
fs.writeFileSync(path.join(dir, 'icon.ico'), Buffer.concat([head, ...entries, ...pngs]));
console.log('иконка: ' + sizes.join(', ') + ' px → app/icons/icon.ico, icon.png');
