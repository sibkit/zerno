// Сверка движков: JS в браузере и Zig на сервере обязаны давать одну картинку.
// Плюс замер скорости.
const fs = require('fs');
const { ROOT, coreCode } = require('./load-app.js');

const BASE = 'http://127.0.0.1:8787';
const DIR = ROOT;

class ImageData { constructor(w, h) { this.width = w; this.height = h; this.data = new Uint8ClampedArray(w * h * 4); } }
const JS = new Function('ImageData', coreCode() + '\nreturn {composeDoc,accToImageData,validateDoc};')(ImageData);

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
  return out;
}

async function renderZig(jobs) {
  const r = await fetch(BASE + '/api/render', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jobs })
  });
  if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + (await r.text()));
  return parseResponse(new Uint8Array(await r.arrayBuffer()));
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

(async () => {
  const files = fs.readdirSync(DIR + '/noises').filter(f => f !== 'index.json').sort();
  const docs = files.map(f => ({ name: f, doc: JSON.parse(fs.readFileSync(DIR + '/noises/' + f, 'utf8')) }));

  console.log('\n[1] Совпадение пиксель в пиксель (все 10 пресетов, полный размер)');
  let worstMax = 0, worstMean = 0, worstName = '';
  for (const { name, doc } of docs) {
    const w = doc.tile.width, h = doc.tile.height;
    const [zig] = await renderZig([{ width: w, height: h, doc }]);
    const js = renderJs(doc, w, h);
    const c = compare(zig.px, js);
    if (c.max > worstMax) { worstMax = c.max; worstName = name; }
    if (c.mean > worstMean) worstMean = c.mean;
    ok('совпадает: ' + name.padEnd(24), c.max <= 2 && c.pct < 0.5,
       'макс Δ=' + c.max + ', средн Δ=' + c.mean.toFixed(4) + ', >1 LSB: ' + c.pct.toFixed(3) + '%');
  }
  console.log('    худший случай: ' + worstName + ', макс Δ=' + worstMax + ', средн Δ=' + worstMean.toFixed(5));

  console.log('\n[2] Совпадение при выключенном дизеринге (чистая математика)');
  for (const { name, doc } of docs.slice(0, 4)) {
    const d2 = JSON.parse(JSON.stringify(doc));
    d2.render.dither = { mode: 'off', amount: 0 };
    const w = d2.tile.width, h = d2.tile.height;
    const [zig] = await renderZig([{ width: w, height: h, doc: d2 }]);
    const js = renderJs(d2, w, h);
    const c = compare(zig.px, js);
    ok('без дизера: ' + name.padEnd(24), c.max <= 1,
       'макс Δ=' + c.max + ', отличается пикселей: ' + c.pct.toFixed(4) + '%');
  }

  console.log('\n[3] Байеровский дизеринг');
  {
    const d2 = JSON.parse(JSON.stringify(docs[0].doc));
    d2.render.dither = { mode: 'ordered', amount: 1 };
    const [zig] = await renderZig([{ width: 256, height: 256, doc: d2 }]);
    const js = renderJs(d2, 256, 256);
    const c = compare(zig.px, js);
    ok('ordered совпадает', c.max <= 1, 'макс Δ=' + c.max);
  }

  console.log('\n[4] Ошибки валидации приходят с адресом поля');
  {
    const bad = JSON.parse(JSON.stringify(docs[0].doc));
    delete bad.channels[0].noise.shape.gamma;
    const r = await fetch(BASE + '/api/render', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jobs: [{ width: 64, height: 64, doc: bad }] })
    });
    const j = await r.json();
    ok('400 с точным адресом', r.status === 400 && /shape\.gamma/.test(j.error), r.status + ' ' + j.error);

    const deg = JSON.parse(JSON.stringify(docs[0].doc));
    deg.channels[0].noise.sizeX = 1;
    deg.channels[0].noise.sizeY = 1;
    const r2 = await fetch(BASE + '/api/render', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jobs: [{ width: 64, height: 64, doc: deg }] })
    });
    const j2 = await r2.json();
    ok('вырожденная решётка объяснена', r2.status === 400 && /вырожда/.test(j2.error), j2.error.slice(0, 80));
  }

  console.log('\n[5] Пакетный запрос');
  {
    const jobs = docs.map(d => ({ width: 72, height: 72, doc: d.doc }));
    jobs.unshift({ width: 512, height: 512, doc: docs[0].doc });
    const res = await renderZig(jobs);
    ok('вернулось задач: ' + res.length, res.length === jobs.length);
    ok('размеры совпали', res[0].w === 512 && res[1].w === 72);
    ok('пиксели заполнены', res.every(r => r.px.some(v => v !== 0)));
  }

  console.log('\n[6] Скорость (512×512, пресет «тёмный холст», 3 канала)');
  {
    const doc = docs[0].doc;
    const jobs = [{ width: 512, height: 512, doc }];

    // JS
    const t0 = Date.now();
    let n = 0;
    while (Date.now() - t0 < 1500) { renderJs(doc, 512, 512); n++; }
    const jsMs = (Date.now() - t0) / n;

    // Zig холодный кэш: меняем сид, чтобы каждый раз считалось заново
    let zc = 0;
    const t1 = Date.now();
    while (Date.now() - t1 < 1500) {
      const d2 = JSON.parse(JSON.stringify(doc));
      for (const ch of d2.channels) ch.noise.seed = (ch.noise.seed + zc + 1) | 0;
      await renderZig([{ width: 512, height: 512, doc: d2 }]);
      zc++;
    }
    const zigColdMs = (Date.now() - t1) / zc;

    // Zig с кэшем полей (правка только цвета)
    let wc = 0;
    const t2 = Date.now();
    while (Date.now() - t2 < 1500) {
      const d2 = JSON.parse(JSON.stringify(doc));
      d2.background.h = (d2.background.h + wc) % 360;
      await renderZig([{ width: 512, height: 512, doc: d2 }]);
      wc++;
    }
    const zigWarmMs = (Date.now() - t2) / wc;

    console.log('    JS в браузере        ' + jsMs.toFixed(1).padStart(7) + ' мс');
    console.log('    Zig, шум заново      ' + zigColdMs.toFixed(1).padStart(7) + ' мс   ускорение ×' + (jsMs / zigColdMs).toFixed(1));
    console.log('    Zig, правка цвета    ' + zigWarmMs.toFixed(1).padStart(7) + ' мс   ускорение ×' + (jsMs / zigWarmMs).toFixed(1));
    ok('правка цвета укладывается в кадр (< 16 мс)', zigWarmMs < 16, zigWarmMs.toFixed(1) + ' мс');
    ok('пересчёт шума укладывается в 25 мс', zigColdMs < 25, zigColdMs.toFixed(1) + ' мс');
  }

  console.log('\n[7] Скорость на большой плитке 1024×1024');
  {
    const doc = JSON.parse(JSON.stringify(docs[0].doc));
    const t0 = Date.now();
    let n = 0;
    while (Date.now() - t0 < 2000 && n < 5) { renderJs(doc, 1024, 1024); n++; }
    const jsMs = (Date.now() - t0) / n;
    let zc = 0;
    const t1 = Date.now();
    while (Date.now() - t1 < 2000) {
      const d2 = JSON.parse(JSON.stringify(doc));
      for (const ch of d2.channels) ch.noise.seed = (ch.noise.seed + zc + 1000) | 0;
      await renderZig([{ width: 1024, height: 1024, doc: d2 }]);
      zc++;
    }
    const zigMs = (Date.now() - t1) / zc;
    console.log('    JS  ' + jsMs.toFixed(0).padStart(6) + ' мс     Zig ' + zigMs.toFixed(1).padStart(6) + ' мс     ускорение ×' + (jsMs / zigMs).toFixed(1));
    ok('1024² в Zig быстрее 120 мс', zigMs < 120, zigMs.toFixed(1) + ' мс');
    ok('на 1024² Zig минимум втрое быстрее JS', jsMs / zigMs > 3, '×' + (jsMs / zigMs).toFixed(1));
  }

  const hs = await (await fetch(BASE + '/api/health')).json();
  console.log('\nкэш полей: ' + hs.cacheEntries + ' записей, ' + (hs.cacheBytes / 1048576).toFixed(1) +
              ' МБ, попаданий ' + hs.cacheHits + ' / промахов ' + hs.cacheMisses + ', рендеров ' + hs.renders);

  console.log('\n' + (fails ? '✗ ПРОВАЛОВ: ' + fails + ' из ' + checks : '✓ все ' + checks + ' проверок пройдены'));
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('ОШИБКА: ' + e.stack); process.exit(1); });
