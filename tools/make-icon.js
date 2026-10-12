// Иконка приложения рисуется самим движком: node tools/make-icon.js
// Нужен собранный zerno-render (cargo build -p zerno-engine --release).
// Пишет app/icons/icon.png (256²) и app/icons/icon.ico (256, 64, 48, 32, 16 — PNG внутри ICO).
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'target', 'release', 'zerno-render.exe');
if (!fs.existsSync(CLI)) throw new Error('нет ' + CLI + ' — соберите: cargo build -p zerno-engine --release');

const PRESET = path.join(ROOT, 'presets', '05-shelk.json');
const doc = JSON.parse(fs.readFileSync(PRESET, 'utf8'));

function render(side) {
  const d = JSON.parse(JSON.stringify(doc));
  const k = side / Math.max(d.tile.width, d.tile.height);
  d.tile = { width: side, height: side };
  for (const ch of d.channels) {
    const n = ch.noise;
    const min = n.type === 'grain' ? 0.5 : 2;
    n.sizeX = Math.max(min, n.sizeX * k); n.sizeY = Math.max(min, n.sizeY * k);
    n.warpSize = Math.max(1, n.warpSize * k); n.warpAmount *= k;
    n.grainHp = Math.round(n.grainHp * k);
  }
  const out = execFileSync(CLI, { input: JSON.stringify({ jobs: [{ width: side, height: side, doc: d }] }) });
  if (out.toString('latin1', 0, 4) !== 'ZRN1') throw new Error('zerno-render вернул не ZRN1');
  return out.subarray(16);
}

/** Скруглённый квадрат: альфа вне углов — 0, на кромке сглажена. */
function roundMask(px, side) {
  const r = side * 0.2;
  for (let y = 0; y < side; y++) for (let x = 0; x < side; x++) {
    const cx = Math.min(Math.max(x + 0.5, r), side - r), cy = Math.min(Math.max(y + 0.5, r), side - r);
    const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
    const a = Math.max(0, Math.min(1, r - d + 0.5));
    px[(y * side + x) * 4 + 3] = Math.round(px[(y * side + x) * 4 + 3] * a);
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
const pngs = sizes.map(s => png(roundMask(Buffer.from(render(s)), s), s));
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
