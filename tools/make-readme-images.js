// Картинки для README: node tools/make-readme-images.js
// Нужен собранный zerno-render (cargo build -p zerno-engine --release).
// Пишет в docs/images/:
//   preset-<имя файла>.png — каждый пресет из presets/ одной плиткой в родном размере;
//   seamless.png           — плитка «дюн», повторённая 3 × 1: стыков не видно.
// Прозрачные пиксели (пресет-накладка) кладутся на BACKDROP — иначе на странице
// GitHub под ними окажется её собственный фон, разный в светлой и тёмной теме.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'target', 'release', 'zerno-render.exe');
if (!fs.existsSync(CLI)) throw new Error('нет ' + CLI + ' — соберите: cargo build -p zerno-engine --release');

const BACKDROP = [128, 128, 128];          // нейтральный серый: на нём видно и светлое, и тёмное зерно
const SEAMLESS_PRESET = '08-dyuny.json';
const SEAMLESS_REPEAT = 3;

/** Рендер одного документа: { w, h, px: RGBA }. */
function render(doc) {
  const { width, height } = doc.tile;
  const out = execFileSync(CLI, {
    input: JSON.stringify({ jobs: [{ width, height, doc }] }),
    maxBuffer: 16 + width * height * 4,     // ZRN1: заголовок одной задачи + RGBA
  });
  if (out.toString('latin1', 0, 4) !== 'ZRN1') throw new Error('zerno-render вернул не ZRN1');
  if (out.readUInt32LE(4) !== 1) throw new Error('zerno-render вернул ' + out.readUInt32LE(4) + ' задач вместо 1');
  const w = out.readUInt32LE(8), h = out.readUInt32LE(12);
  const px = out.subarray(16);
  if (px.length !== w * h * 4) throw new Error(`размер пикселей ${px.length} не равен ${w}×${h}×4`);
  return { w, h, px };
}

/** Непрозрачная копия: альфа сводится на BACKDROP. */
function flatten({ w, h, px }) {
  const rgb = Buffer.alloc(w * h * 3);
  for (let i = 0, j = 0; i < px.length; i += 4, j += 3) {
    const a = px[i + 3] / 255;
    for (let c = 0; c < 3; c++) rgb[j + c] = Math.round(px[i + c] * a + BACKDROP[c] * (1 - a));
  }
  return { w, h, rgb };
}

function repeatX({ w, h, rgb }, n) {
  const W = w * n, out = Buffer.alloc(W * h * 3);
  for (let y = 0; y < h; y++) for (let k = 0; k < n; k++)
    rgb.copy(out, (y * W + k * w) * 3, y * w * 3, (y + 1) * w * 3);
  return { w: W, h, rgb: out };
}

function png({ w, h, rgb }) {
  const stride = w * 3 + 1, raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) rgb.copy(raw, y * stride + 1, y * w * 3, (y + 1) * w * 3);
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'latin1'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const presetsDir = path.join(ROOT, 'presets');
const outDir = path.join(ROOT, 'docs', 'images');
fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(presetsDir).filter(f => f.endsWith('.json')).sort();
if (!files.includes(SEAMLESS_PRESET)) throw new Error('нет пресета ' + SEAMLESS_PRESET + ' для seamless.png');
for (const f of files) {
  const doc = JSON.parse(fs.readFileSync(path.join(presetsDir, f), 'utf8'));
  const img = flatten(render(doc));
  const name = 'preset-' + f.replace(/\.json$/, '') + '.png';
  fs.writeFileSync(path.join(outDir, name), png(img));
  console.log(`${name}: ${img.w}×${img.h} — ${doc.name}`);
  if (f === SEAMLESS_PRESET) {
    fs.writeFileSync(path.join(outDir, 'seamless.png'), png(repeatX(img, SEAMLESS_REPEAT)));
    console.log(`seamless.png: ${img.w * SEAMLESS_REPEAT}×${img.h} — ${doc.name} × ${SEAMLESS_REPEAT}`);
  }
}
