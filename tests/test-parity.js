// Сверка движков: эталон на JS (tests/reference) и движок на Rust обязаны давать
// одну картинку. Rust вызывается через zerno-render (stdin JSON → stdout ZRN1) —
// тот же код, что считает в приложении. Плюс грубый замер скорости.
const fs = require('fs');
const { spawnSync } = require('child_process');
const { ROOT, coreCode } = require('./load-app.js');

const EXE = ROOT + '/target/release/zerno-render' + (process.platform === 'win32' ? '.exe' : '');
if (!fs.existsSync(EXE)) {
  console.log('ОШИБКА: нет ' + EXE + '\nСоберите движок: cargo build --release -p zerno-engine');
  process.exit(1);
}

class ImageData { constructor(w, h) { this.width = w; this.height = h; this.data = new Uint8ClampedArray(w * h * 4); } }
const JS = new Function('ImageData', coreCode() + '\nreturn {composeDoc,accToImageData,validateDoc,ZErr};')(ImageData);

let fails = 0, checks = 0;
function ok(name, cond, extra) {
  checks++;
  if (!cond) { fails++; console.log('  ✗ ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else console.log('  ✓ ' + name + (extra !== undefined ? '  (' + extra + ')' : ''));
}

function parseResponse(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (String.fromCharCode(buf[0], buf[1], buf[2], buf[3]) !== 'ZRN1') throw new Error('плохая сигнатура');
  const count = dv.getUint32(4, true);
  const sizes = [];
  let off = 8;
  for (let i = 0; i < count; i++) { sizes.push([dv.getUint32(off, true), dv.getUint32(off + 4, true)]); off += 8; }
  const out = [];
  for (const [w, h] of sizes) { out.push({ w, h, px: buf.subarray(off, off + w * h * 4) }); off += w * h * 4; }
  if (off !== buf.length) throw new Error('в ответе лишние ' + (buf.length - off) + ' байт');
  return out;
}

/** Rust: {ok:true, tiles} либо {ok:false, error} — текст ошибки из stderr. */
function runRust(jobs) {
  const r = spawnSync(EXE, [], { input: JSON.stringify({ jobs }), maxBuffer: 1 << 30 });
  if (r.error) throw r.error;
  if (r.status === 0) return { ok: true, tiles: parseResponse(new Uint8Array(r.stdout)) };
  if (r.status === 1) return { ok: false, error: r.stderr.toString('utf8').trim() };
  throw new Error('zerno-render завершился с кодом ' + r.status + ': ' + r.stderr.toString('utf8'));
}
function renderRust(jobs) {
  const r = runRust(jobs);
  if (!r.ok) throw new Error('zerno-render: ' + r.error);
  return r.tiles;
}

function renderJs(doc, w, h) {
  const d = JS.validateDoc(doc, null);
  const acc = JS.composeDoc(d, w, h);
  return JS.accToImageData(acc, w, h, d.render.dither).data;
}

function compare(a, b) {
  let max = 0, sum = 0, over1 = 0;
  for (let i = 0; i < a.length; i++) {
    const d = Math.abs(a[i] - b[i]);
    if (d > max) max = d;
    if (d > 1) over1++;
    sum += d;
  }
  return { max, mean: sum / a.length, over1, pct: (over1 / a.length * 100) };
}

const files = fs.readdirSync(ROOT + '/presets').filter(f => /\.json$/i.test(f)).sort();
const docs = files.map(f => ({ name: f, doc: JSON.parse(fs.readFileSync(ROOT + '/presets/' + f, 'utf8')) }));
ok('в presets/ есть пресеты', docs.length > 0, docs.length);

console.log('\n[1] Совпадение пиксель в пиксель (все пресеты, полный размер)');
let worstMax = 0, worstMean = 0, worstName = '';
for (const { name, doc } of docs) {
  const w = doc.tile.width, h = doc.tile.height;
  const [rs] = renderRust([{ width: w, height: h, doc }]);
  const c = compare(rs.px, renderJs(doc, w, h));
  if (c.max > worstMax) { worstMax = c.max; worstName = name; }
  if (c.mean > worstMean) worstMean = c.mean;
  ok('совпадает: ' + name.padEnd(24), c.max <= 2 && c.pct < 0.5,
     'макс Δ=' + c.max + ', средн Δ=' + c.mean.toFixed(4) + ', >1 LSB: ' + c.pct.toFixed(3) + '%');
}
console.log('    худший случай: ' + worstName + ', макс Δ=' + worstMax + ', средн Δ=' + worstMean.toFixed(5));

console.log('\n[2] Совпадение при выключенном дизеринге (чистая математика)');
for (const { name, doc } of docs) {
  const d2 = JSON.parse(JSON.stringify(doc));
  d2.render.dither = { mode: 'off', amount: 0 };
  const w = d2.tile.width, h = d2.tile.height;
  const [rs] = renderRust([{ width: w, height: h, doc: d2 }]);
  const c = compare(rs.px, renderJs(d2, w, h));
  ok('без дизера: ' + name.padEnd(24), c.max <= 1,
     'макс Δ=' + c.max + ', отличается пикселей: ' + c.pct.toFixed(4) + '%');
}

console.log('\n[3] Байеровский дизеринг');
{
  const d2 = JSON.parse(JSON.stringify(docs[0].doc));
  d2.render.dither = { mode: 'ordered', amount: 1 };
  const [rs] = renderRust([{ width: 256, height: 256, doc: d2 }]);
  const c = compare(rs.px, renderJs(d2, 256, 256));
  ok('ordered совпадает', c.max <= 1, 'макс Δ=' + c.max);
}

console.log('\n[4] Ошибки: Rust и эталон дают один ключ и одни параметры');
/* Текст собирает интерфейс по {key, args}, поэтому паритет ошибок — это
   совпадение ключа и всех параметров, а не похожая проза. */
{
  /** Ошибка Rust из stderr: ровно один JSON {key, args}. */
  function rustErr(doc) {
    const r = runRust([{ width: 64, height: 64, doc }]);
    if (r.ok) return null;
    let m;
    try { m = JSON.parse(r.error); }
    catch (e) { throw new Error('stderr zerno-render — не JSON: ' + r.error); }
    if (typeof m.key !== 'string' || !m.args || typeof m.args !== 'object' || Object.keys(m).length !== 2)
      throw new Error('stderr zerno-render — не {key, args}: ' + r.error);
    return m;
  }
  /** Ошибка эталона: проверка документа и композит, как делает рендер. */
  function jsErr(doc) {
    try { JS.composeDoc(JS.validateDoc(doc, null), 64, 64); return null; }
    catch (e) {
      if (!(e instanceof JS.ZErr)) throw new Error('эталон бросил не ZErr: ' + e.message);
      return { key: e.key, args: e.args };
    }
  }
  const norm = o => JSON.stringify(Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {}));
  const mutate = f => { const d = JSON.parse(JSON.stringify(docs[0].doc)); f(d); return d; };

  const CASES = [
    ['doc.missing',      'нет shape.gamma',            d => { delete d.channels[0].noise.shape.gamma; }],
    ['doc.missing',      'нет tile.height',            d => { delete d.tile.height; }],
    ['doc.missing',      'нет name',                   d => { delete d.name; }],
    ['doc.unknownField', 'лишнее поле шума',           d => { d.channels[0].noise.wat = 1; }],
    ['doc.unknownField', 'лишнее поле в render',       d => { d.render.extra = true; }],
    ['doc.unknownField', 'лишнее поле в корне',        d => { d.extra = 1; }],
    ['doc.range',        'оттенок 400',                d => { d.background.h = 400; }],
    ['doc.range',        'непрозрачность 1.5',         d => { d.channels[0].opacity = 1.5; }],
    ['doc.range',        'сид за пределом int32',      d => { d.channels[0].noise.seed = 2147483648; }],
    ['doc.range',        'плитка 5 px',                d => { d.tile.width = 5; }],
    ['doc.range',        'крошечное пятно 1e-7',       d => { d.channels[0].noise.sizeX = 1e-7; }],
    ['doc.range',        'огромное искажение 1e21',    d => { d.channels[0].noise.warpAmount = 1e21; }],
    ['doc.range',        'искажение −1.25e-9',         d => { d.channels[0].noise.warpAmount = -1.25e-9; }],
    ['doc.range',        'пятно 1.2345e22',            d => { d.channels[0].noise.sizeY = 1.2345e22; }],
    ['doc.notInt',       'октавы 1.0000001',           d => { d.channels[0].noise.octaves = 1.0000001; }],
    ['doc.notInt',       'дробные октавы',             d => { d.channels[0].noise.octaves = 2.5; }],
    ['doc.notInt',       'дробная ширина плитки',      d => { d.tile.width = 9.5; }],
    ['doc.notNumber',    'gain строкой',               d => { d.channels[0].noise.gain = '0.5'; }],
    ['doc.notNumber',    'gain = null',                d => { d.channels[0].noise.gain = null; }],
    ['doc.notBool',      'enabled строкой',            d => { d.channels[0].enabled = 'да'; }],
    ['doc.notString',    'id числом',                  d => { d.channels[0].id = 1; }],
    ['doc.badEnum',      'тип шума simplex',           d => { d.channels[0].noise.type = 'simplex'; }],
    ['doc.badEnum',      'режим смешивания burn',      d => { d.channels[0].blend = 'burn'; }],
    ['doc.badEnum',      'режим Ворлея f3',            d => { d.channels[0].noise.worleyMode = 'f3'; }],
    ['doc.badEnum',      'смешивание цветов hsv',      d => { d.render.stopMix = 'hsv'; }],
    ['doc.badEnum',      'режим дизеринга x',          d => { d.render.dither.mode = 'x'; }],
    ['doc.format',       'чужой format',               d => { d.format = 'other'; }],
    ['doc.version',      'версия 2',                   d => { d.version = 2; }],
    ['doc.notArray',     'channels — объект',          d => { d.channels = {}; }],
    ['doc.notObject',    'канал — число',              d => { d.channels.push(5); }],
    ['doc.notObject',    'цвет — массив',              d => { d.channels[0].low = []; }],
    ['doc.notObject',    'shape — null',               d => { d.channels[0].noise.shape = null; }],
  ];
  for (const [key, name, f] of CASES) {
    const doc = mutate(f);
    const r = rustErr(doc), j = jsErr(doc);
    const same = r !== null && j !== null && r.key === key && j.key === key && norm(r.args) === norm(j.args);
    ok(key.padEnd(17) + name, same,
       same ? JSON.stringify(r.args).slice(0, 70) : 'Rust ' + JSON.stringify(r) + ' / JS ' + JSON.stringify(j));
  }

  // Вырожденная решётка: эталон не знает имени канала (channel пуст), Rust
  // подставляет его сам; остальные параметры — те же.
  const deg = mutate(d => { d.channels[0].noise.sizeX = 1; d.channels[0].noise.sizeY = 1; });
  const r = rustErr(deg), j = jsErr(deg);
  const rest = o => { const c = Object.assign({}, o); delete c.channel; return norm(c); };
  ok('render.degenerate  ключ и параметры совпали',
     r !== null && j !== null && r.key === 'render.degenerate' && j.key === 'render.degenerate' &&
     rest(r.args) === rest(j.args) && 'channel' in j.args && j.args.channel === '',
     'Rust ' + JSON.stringify(r) + ' / JS ' + JSON.stringify(j));
  ok('render.degenerate  Rust назвал канал', r !== null && r.args.channel === deg.channels[0].name,
     r === null ? 'отрендерено' : r.args.channel);
}

console.log('\n[5] Пакетный запрос');
{
  const jobs = docs.map(d => ({ width: 72, height: 72, doc: d.doc }));
  jobs.unshift({ width: 512, height: 512, doc: docs[0].doc });
  const res = renderRust(jobs);
  ok('вернулось задач: ' + res.length, res.length === jobs.length);
  ok('размеры совпали', res[0].w === 512 && res[1].w === 72);
  ok('пиксели заполнены', res.every(r => r.px.some(v => v !== 0)));
}

console.log('\n[6] Скорость на плитке 1024×1024 (Rust — вместе с запуском процесса, без кэша полей)');
{
  const doc = docs[0].doc;
  const t0 = Date.now();
  let n = 0;
  while (Date.now() - t0 < 2000 && n < 5) { renderJs(doc, 1024, 1024); n++; }
  const jsMs = (Date.now() - t0) / n;
  let rc = 0;
  const t1 = Date.now();
  while (Date.now() - t1 < 2000) { renderRust([{ width: 1024, height: 1024, doc }]); rc++; }
  const rsMs = (Date.now() - t1) / rc;
  console.log('    JS  ' + jsMs.toFixed(0).padStart(6) + ' мс     Rust ' + rsMs.toFixed(1).padStart(6) +
              ' мс     ускорение ×' + (jsMs / rsMs).toFixed(1));
  ok('1024² в Rust быстрее 150 мс', rsMs < 150, rsMs.toFixed(1) + ' мс');
  ok('на 1024² Rust минимум втрое быстрее JS', jsMs / rsMs > 3, '×' + (jsMs / rsMs).toFixed(1));
}

console.log('\n' + (fails ? '✗ ПРОВАЛОВ: ' + fails + ' из ' + checks : '✓ все ' + checks + ' проверок пройдены'));
process.exit(fails ? 1 : 0);
