// Проверка ядра ЗЕРНО без браузера: цвет, периодичность, композит, валидация.
const { coreCode, appCode } = require('./load-app.js');

const code = coreCode();

class ImageData {
  constructor(w, h) { this.width = w; this.height = h; this.data = new Uint8ClampedArray(w * h * 4); }
}
const fn = new Function('ImageData', code + '\nreturn {' + [
  'srgbToOkhsl','okhslToOklab','okhslToHex','hexToOkhsl','okhslToLinear','oklabToLinearSrgb',
  'linearSrgbToOklab','srgbTransfer','srgbTransferInv','lin2srgb',
  'latticeGrad','latticeVal','perlinSample','valueSample','worleyPoints','worleySample',
  'buildField','composeDoc','accToImageData','validateDoc','serializeDoc','NOISE_TYPES',
  'buildStopLut','shapeValue','hash2i','maxOctavesFor','FORMAT','DOC_VERSION','blendCh','BLEND_ID'
].join(',') + '};');
const M = fn(ImageData);

let fails = 0, checks = 0;
function ok(name, cond, extra) {
  checks++;
  if (!cond) { fails++; console.log('  ✗ ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else console.log('  ✓ ' + name + (extra !== undefined ? '  (' + extra + ')' : ''));
}
function throws(name, f, needle) {
  checks++;
  try { f(); fails++; console.log('  ✗ ' + name + ' → исключение не брошено'); }
  catch (err) {
    if (needle && err.message.indexOf(needle) < 0) { fails++; console.log('  ✗ ' + name + ' → "' + err.message + '" не содержит "' + needle + '"'); }
    else console.log('  ✓ ' + name + '  (' + err.message.slice(0, 72) + ')');
  }
}

// ---------------------------------------------------------------- 1. цвет
console.log('\n[1] OKHSL / Oklab');
{
  const hexes = ['#000000','#FFFFFF','#808080','#FF0000','#00FF00','#0000FF','#E8C547','#1B3A5C','#7F3FBF','#0E1014'];
  let maxErr = 0;
  for (const h of hexes) {
    const c = M.hexToOkhsl(h);
    const back = M.okhslToHex({ h: c.h, s: c.s, l: c.l });
    const a = parseInt(h.slice(1), 16), b = parseInt(back.slice(1), 16);
    maxErr = Math.max(maxErr,
      Math.abs(((a >> 16) & 255) - ((b >> 16) & 255)),
      Math.abs(((a >> 8) & 255) - ((b >> 8) & 255)),
      Math.abs((a & 255) - (b & 255)));
  }
  ok('hex → OKHSL → hex, ошибка ≤ 1 LSB', maxErr <= 1, 'max Δ = ' + maxErr);

  const g = M.okhslToOklab(123, 0, 0.5);
  ok('s=0 даёт нейтраль (a=b=0)', Math.abs(g[1]) < 1e-12 && Math.abs(g[2]) < 1e-12);

  let inGamut = true, worst = 0;
  for (let i = 0; i < 4000; i++) {
    const rgb = M.oklabToLinearSrgb(...M.okhslToOklab(Math.random() * 360, Math.random(), Math.random()));
    for (const v of rgb) { worst = Math.max(worst, Math.max(-v, v - 1)); if (v < -0.002 || v > 1.002) inGamut = false; }
  }
  ok('OKHSL всегда в гамуте sRGB', inGamut, 'макс. выход = ' + worst.toExponential(2));

  let lutErr = 0;
  for (let i = 0; i < 20000; i++) { const v = Math.random(); lutErr = Math.max(lutErr, Math.abs(M.lin2srgb(v) - M.srgbTransfer(v))); }
  ok('LUT линейный→sRGB точнее 0.02 LSB', lutErr * 255 < 0.02, (lutErr * 255).toExponential(2) + ' LSB');
}

// ------------------------------------------------------ 2. периодичность
console.log('\n[2] Периодичность семплеров (допуск — ошибка округления float)');
{
  const px = 7, py = 5;
  const L = M.latticeGrad(px, py, 12345);
  let worst = 0;
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * px, y = Math.random() * py;
    const v = M.perlinSample(L, x, y);
    worst = Math.max(worst,
      Math.abs(v - M.perlinSample(L, x + px, y)),
      Math.abs(v - M.perlinSample(L, x, y + py)),
      Math.abs(v - M.perlinSample(L, x - px, y + 2 * py)));
  }
  ok('perlinSample периодичен', worst < 1e-6, 'макс. отклонение ' + worst.toExponential(2));

  const V = M.latticeVal(px, py, 999);
  worst = 0;
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * px, y = Math.random() * py;
    const v = M.valueSample(V, x, y);
    worst = Math.max(worst, Math.abs(v - M.valueSample(V, x + px, y)), Math.abs(v - M.valueSample(V, x, y + py)));
  }
  ok('valueSample периодичен', worst < 1e-6, 'макс. отклонение ' + worst.toExponential(2));

  const P = M.worleyPoints(6, 4, 555, 1);
  worst = 0;
  for (const mode of ['f1', 'f2', 'f2f1']) {
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 6, y = Math.random() * 4;
      const a = M.worleySample(P, x, y, mode);
      worst = Math.max(worst, Math.abs(a - M.worleySample(P, x + 6, y, mode)), Math.abs(a - M.worleySample(P, x, y + 4, mode)));
    }
  }
  ok('worleySample периодичен по обеим осям', worst < 1e-6, 'макс. отклонение ' + worst.toExponential(2));
  throws('worleySample: неизвестный режим бросает', () => M.worleySample(P, 1, 1, 'f9'), 'неизвестный режим');
}

/* -------------------------------------------------------------------------
   Метрика шва. Для каждой пары соседних столбцов (включая пару «последний ↔
   первый», то есть сам стык плиток) берём средний модуль разности. Если поле
   бесшовно, разность на стыке ничем не выделяется среди внутренних. Сравнение
   именно с распределением, а не со средним: у блочного шума большинство
   внутренних пар нулевые, и среднее дало бы ложную тревогу.
   ------------------------------------------------------------------------- */
function stat(d) {
  const n = d.length, wrap = d[n - 1];
  const inner = Array.from(d.slice(0, n - 1)).sort((a, b) => a - b);
  const p95 = inner[Math.floor(0.95 * (inner.length - 1))];
  const max = inner[inner.length - 1];
  return { wrap, p95, max, ratio: p95 > 1e-12 ? wrap / p95 : (wrap > 1e-9 ? Infinity : 0) };
}
function seam(field, W, H) {
  const dx = new Float64Array(W), dy = new Float64Array(H);
  for (let x = 0; x < W; x++) {
    const xn = (x + 1) % W; let a = 0;
    for (let y = 0; y < H; y++) a += Math.abs(field[y * W + xn] - field[y * W + x]);
    dx[x] = a / H;
  }
  for (let y = 0; y < H; y++) {
    const yn = (y + 1) % H; let a = 0;
    for (let x = 0; x < W; x++) a += Math.abs(field[yn * W + x] - field[y * W + x]);
    dy[y] = a / W;
  }
  return { x: stat(dx), y: stat(dy) };
}
function fmtSeam(r) {
  return 'X ' + r.x.ratio.toFixed(2) + '× p95, Y ' + r.y.ratio.toFixed(2) + '× p95';
}

console.log('\n[3] Бесшовность построенных полей (192×128; стык не должен выделяться)');
function baseNoise(over) {
  return Object.assign({
    type: 'perlin', sizeX: 37, sizeY: 29, seed: 4242, octaves: 4, gain: 0.5, lacunarity: 2,
    ridged: false, warpAmount: 0, warpSize: 57, worleyMode: 'f1', worleyJitter: 1, grainHp: 3,
    shape: { contrast: 0, bias: 0, gamma: 1, invert: false, normalize: true }
  }, over);
}
const CASES = [
  ['perlin 4 окт',            baseNoise({})],
  ['perlin + гребни',         baseNoise({ ridged: true })],
  ['perlin + искажение',      baseNoise({ warpAmount: 25, warpSize: 40 })],
  ['perlin искажение 120px',  baseNoise({ warpAmount: 120, warpSize: 64 })],
  ['perlin лакунарность 3',   baseNoise({ lacunarity: 3, octaves: 3 })],
  ['value 3 окт',             baseNoise({ type: 'value', octaves: 3 })],
  ['worley f1',               baseNoise({ type: 'worley', octaves: 1, sizeX: 24, sizeY: 24 })],
  ['worley f2−f1 + искаж.',   baseNoise({ type: 'worley', worleyMode: 'f2f1', octaves: 2, sizeX: 24, sizeY: 24, warpAmount: 12, warpSize: 48 })],
  ['worley f2 разброс 0.3',   baseNoise({ type: 'worley', worleyMode: 'f2', sizeX: 18, sizeY: 18, worleyJitter: 0.3, octaves: 1 })],
  ['grain белый',             baseNoise({ type: 'grain', sizeX: 1, sizeY: 1, grainHp: 0 })],
  ['grain синий (ВЧ 4)',      baseNoise({ type: 'grain', sizeX: 1, sizeY: 1, grainHp: 4 })],
  ['grain блоками 6px',       baseNoise({ type: 'grain', sizeX: 6, sizeY: 6, grainHp: 0 })],
  ['grain ВЧ 20 (радиус>ячейки)', baseNoise({ type: 'grain', sizeX: 3, sizeY: 3, grainHp: 20 })],
  ['несоизмеримый размер 50', baseNoise({ sizeX: 50, sizeY: 50 })],
  ['пятно крупнее плитки',    baseNoise({ sizeX: 400, sizeY: 400, octaves: 5 })],
];
{
  const W = 192, H = 128;
  for (const [name, n] of CASES) {
    const r = seam(M.buildField(n, W, H).data, W, H);
    ok('стык: ' + name, r.x.ratio <= 2 && r.y.ratio <= 2, fmtSeam(r));
  }
}

console.log('\n[4] Контроль: заведомо непериодическое поле должно провалиться');
{
  const W = 192, H = 128, W2 = W + 13;
  for (const [name, n] of [['perlin', baseNoise({})], ['value', baseNoise({ type: 'value' })], ['worley', baseNoise({ type: 'worley', sizeX: 24, sizeY: 24, octaves: 1 })]]) {
    const F = M.buildField(n, W2, H).data;          // поле шире плитки…
    const crop = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) crop[y * W + x] = F[y * W2 + x];
    const r = seam(crop, W, H);                     // …обрезанное не по периоду
    ok('обрезка ломает стык по X, но не по Y — ' + name, r.x.ratio > 3 && r.y.ratio <= 2, fmtSeam(r));
  }
}

// -------------------------------------------------- 5. композит документа
console.log('\n[5] Композит и вывод');
const raw = {
  format: M.FORMAT, version: M.DOC_VERSION, name: 'тест',
  tile: { width: 96, height: 96 },
  render: { stopMix: 'oklab', dither: { mode: 'tpdf', amount: 1 }, webpQuality: 1 },
  background: { h: 258, s: 0.07, l: 0.145, a: 1 },
  channels: [
    { id: 'a', name: 'a', enabled: true, blend: 'normal', opacity: 1,
      noise: baseNoise({ sizeX: 40, sizeY: 40 }),
      low: { h: 266, s: 0.24, l: 0.04, a: 0.34 }, high: { h: 198, s: 0.3, l: 0.6, a: 0.13 } },
    { id: 'b', name: 'b', enabled: true, blend: 'soft-light', opacity: 0.7,
      noise: baseNoise({ type: 'worley', sizeX: 20, sizeY: 20, octaves: 2 }),
      low: { h: 38, s: 0.35, l: 0.3, a: 0 }, high: { h: 38, s: 0.45, l: 0.72, a: 0.3 } },
    { id: 'c', name: 'c', enabled: true, blend: 'normal', opacity: 1,
      noise: baseNoise({ type: 'grain', sizeX: 1, sizeY: 1, grainHp: 4 }),
      low: { h: 258, s: 0.05, l: 0, a: 0.075 }, high: { h: 258, s: 0.05, l: 1, a: 0.075 } }
  ]
};
{
  const doc = M.validateDoc(raw, 'тест');
  const W = 96, H = 96;
  const acc = M.composeDoc(doc, W, H);
  let bad = 0;
  for (let i = 0; i < acc.length; i++) if (!isFinite(acc[i]) || acc[i] < -1e-6 || acc[i] > 1 + 1e-6) bad++;
  ok('аккумулятор в [0,1] и без NaN', bad === 0, bad + ' плохих значений');

  for (const [ci, cn] of [[0, 'R'], [1, 'G'], [2, 'B']]) {
    const chan = new Float32Array(W * H);
    for (let p = 0; p < W * H; p++) chan[p] = acc[p * 4 + ci];
    const r = seam(chan, W, H);
    ok('итоговое изображение бесшовно, канал ' + cn, r.x.ratio <= 2 && r.y.ratio <= 2, fmtSeam(r));
  }

  const img = M.accToImageData(acc, W, H, doc.render.dither);
  ok('ImageData заполнен', img.data.length === W * H * 4 && img.data.some(v => v > 0));
  let opaque = true;
  for (let p = 3; p < img.data.length; p += 4) if (img.data[p] !== 255) opaque = false;
  ok('непрозрачный фон → альфа 255 всюду', opaque);

  const accT = M.composeDoc(M.validateDoc(Object.assign({}, raw, { background: { h: 258, s: 0.07, l: 0.145, a: 0.25 } })), W, H);
  let partial = false;
  for (let p = 3; p < accT.length; p += 4) if (accT[p] < 0.999) partial = true;
  ok('полупрозрачный фон сохраняет альфу < 1', partial);

  // дизеринг обязан разбивать полосы: считаем число уникальных уровней на плавном градиенте
  const flat = new Float32Array(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const q = (y * W + x) * 4, v = 0.20 + 0.0006 * x;
    flat[q] = flat[q + 1] = flat[q + 2] = v; flat[q + 3] = 1;
  }
  const noD = M.accToImageData(flat, W, H, { mode: 'off', amount: 0 });
  const wiD = M.accToImageData(flat, W, H, { mode: 'tpdf', amount: 1 });
  const uniq = d => { const s = new Set(); for (let p = 0; p < d.length; p += 4) s.add(d[p]); return s.size; };
  ok('дизеринг увеличивает число уровней (борьба с бэндингом)', uniq(wiD.data) > uniq(noD.data),
     'без дизера ' + uniq(noD.data) + ' уровней, с дизером ' + uniq(wiD.data));
  throws('неизвестный режим дизеринга бросает', () => M.accToImageData(flat, W, H, { mode: 'x', amount: 1 }), 'дизеринга');
}

// ------------------------------------------------------- 6. режимы смешив.
console.log('\n[6] Режимы смешивания');
{
  let bad = 0;
  for (const k of Object.keys(M.BLEND_ID)) {
    const id = M.BLEND_ID[k];
    if (id === 0) continue;
    for (let i = 0; i <= 20; i++) for (let j = 0; j <= 20; j++) {
      const v = M.blendCh(id, i / 20, j / 20);
      if (!isFinite(v) || v < -1e-9 || v > 1 + 1e-9) bad++;
    }
  }
  ok('все режимы дают результат в [0,1]', bad === 0, bad + ' нарушений');
  throws('неизвестный id режима бросает', () => M.blendCh(99, 0.5, 0.5), 'неизвестный идентификатор');
}

// ------------------------------------------------------------ 7. валидация
console.log('\n[7] Строгая валидация (никаких молчаливых умолчаний)');
{
  const clone = () => JSON.parse(JSON.stringify(raw));
  throws('нет поля tile.height', () => { const d = clone(); delete d.tile.height; M.validateDoc(d); }, 'поле отсутствует');
  throws('нет shape.gamma', () => { const d = clone(); delete d.channels[0].noise.shape.gamma; M.validateDoc(d); }, 'shape.gamma');
  throws('лишнее поле', () => { const d = clone(); d.channels[0].noise.wat = 1; M.validateDoc(d); }, 'неизвестное поле');
  throws('значение вне диапазона', () => { const d = clone(); d.background.h = 400; M.validateDoc(d); }, 'вне диапазона');
  throws('не тот тип', () => { const d = clone(); d.channels[0].enabled = 'да'; M.validateDoc(d); }, 'true/false');
  throws('неизвестный тип шума', () => { const d = clone(); d.channels[0].noise.type = 'simplex'; M.validateDoc(d); }, 'недопустимое значение');
  throws('неизвестный режим смешивания', () => { const d = clone(); d.channels[0].blend = 'burn'; M.validateDoc(d); }, 'недопустимое значение');
  throws('чужой format', () => { const d = clone(); d.format = 'other'; M.validateDoc(d); }, 'format');
  throws('другая версия', () => { const d = clone(); d.version = 2; M.validateDoc(d); }, 'версии 2');
  throws('дробные октавы', () => { const d = clone(); d.channels[0].noise.octaves = 2.5; M.validateDoc(d); }, 'целое');
  throws('channels не массив', () => { const d = clone(); d.channels = {}; M.validateDoc(d); }, 'массив');
  throws('имя файла попадает в сообщение', () => { const d = clone(); delete d.name; M.validateDoc(d, 'x.json'); }, 'x.json');
  ok('корректный документ проходит', !!M.validateDoc(clone()));

  const d1 = M.validateDoc(clone());
  const d2 = M.validateDoc(M.serializeDoc(d1));
  ok('serialize → validate стабильно', JSON.stringify(M.serializeDoc(d1)) === JSON.stringify(M.serializeDoc(d2)));
}

// ------------------------------------------------------ 8. ограничение октав
console.log('\n[8] Ограничение октав');
{
  const n = baseNoise({ sizeX: 64, sizeY: 64, octaves: 10 });
  const cap = M.maxOctavesFor(n, 256, 256);
  ok('на плитке 256 и пятне 64 доступно 6 октав (нижняя ячейка 2 px)', cap === 6, 'cap=' + cap);
  ok('buildField применил ограничение', M.buildField(n, 256, 256).octavesUsed === 6);
  ok('последняя октава не вырождена (ячейка 2 px, поле не константа)',
    (() => { const F = M.buildField(baseNoise({ sizeX: 64, sizeY: 64, octaves: 6 }), 256, 256); return F.max - F.min > 0.1; })());
  throws('неизвестный тип шума в buildField бросает',
    () => M.buildField(baseNoise({ type: 'simplex' }), 32, 32), 'неизвестный тип шума');
  throws('вырожденная ячейка (<2 px) бросает',
    () => M.buildField(baseNoise({ sizeX: 1, sizeY: 1 }), 64, 64), 'вырождается');
  ok('grain с зерном 1 px допустим', M.buildField(baseNoise({ type: 'grain', sizeX: 1, sizeY: 1, grainHp: 0 }), 64, 64).max > 0.9);

  // граничные размеры: нечётные стороны, минимальное пятно, крошечные плитки миниатюр
  const odd = [[513, 385], [29, 38], [8, 8], [1024, 7], [255, 255]];
  let oddFail = null;
  for (const [W, H] of odd) {
    for (const t of ['perlin', 'value', 'worley']) {
      try {
        const F = M.buildField(baseNoise({ type: t, sizeX: 2, sizeY: 2, octaves: 3 }), W, H);
        const r = seam(F.data, W, H);
        if (r.x.ratio > 2 || r.y.ratio > 2) oddFail = t + ' ' + W + '×' + H + ' шов ' + fmtSeam(r);
      } catch (err) { oddFail = t + ' ' + W + '×' + H + ': ' + err.message; }
    }
  }
  ok('минимальное пятно 2 px на нечётных/крошечных плитках работает и бесшовно', oddFail === null, oddFail || 'проверено ' + odd.length + ' размеров × 3 типа');
}

// --------------------------------------------------------- 9. встроенный пресет
console.log('\n[9] Встроенный пресет и производительность');
{
  const dm = appCode().match(/function defaultDocRaw\(\)\{[\s\S]*?\n\}/);
  ok('defaultDocRaw найден в файле', !!dm);
  if (dm) {
    const def = new Function('FORMAT', 'DOC_VERSION', dm[0] + '; return defaultDocRaw();')(M.FORMAT, M.DOC_VERSION);
    let d = null;
    try { d = M.validateDoc(def, 'встроенный'); ok('встроенный пресет проходит валидацию', true); }
    catch (err) { ok('встроенный пресет проходит валидацию', false, err.message); }
    if (d) {
      const t = Date.now();
      const acc = M.composeDoc(d, 512, 512);
      M.accToImageData(acc, 512, 512, d.render.dither);
      const ms = Date.now() - t;
      ok('рендер 512×512 быстрее 2 с', ms < 2000, ms + ' мс (без кэша полей)');
      const chan = new Float32Array(512 * 512);
      for (let p = 0; p < 512 * 512; p++) chan[p] = acc[p * 4 + 1];
      const r = seam(chan, 512, 512);
      ok('встроенный пресет бесшовен', r.x.ratio <= 2 && r.y.ratio <= 2, fmtSeam(r));
    }
  }
}

console.log('\n' + (fails ? '✗ ПРОВАЛОВ: ' + fails + ' из ' + checks : '✓ все ' + checks + ' проверок пройдены'));
process.exit(fails ? 1 : 0);
