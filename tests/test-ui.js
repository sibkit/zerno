// Прогон интерфейса ЗЕРНО в jsdom: сборка панелей и реальные взаимодействия.
//
// Приложения здесь нет — window.__TAURI__ подменён заглушкой: команда render
// считается эталонным движком на JS (tests/reference), файлы и диалоги
// записываются в журнал вызовов и отвечают заранее заданным.
const fs = require('fs');
const { ROOT, appCode, coreCode, shell: pageShell } = require('./load-app.js');
const { JSDOM, VirtualConsole } = require('jsdom');

class NodeImageData { constructor(w, h) { this.width = w; this.height = h; this.data = new Uint8ClampedArray(w * h * 4); } }
const REF = new Function('ImageData', coreCode() + '\nreturn {composeDoc,accToImageData,validateDoc};')(NodeImageData);

const PRESETS = fs.readdirSync(ROOT + '/presets').filter(f => /\.json$/i.test(f)).sort()
  .map(n => ({ name: n, text: fs.readFileSync(ROOT + '/presets/' + n, 'utf8') }));
const LIB_DIR = 'D:\\lib';

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', err => errors.push('jsdomError: ' + err.message));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));
vc.on('warn', () => {});

const dom = new JSDOM(pageShell(), { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, url: 'http://localhost/' });
const win = dom.window;

// ---- заглушки canvas (jsdom не рисует) ----
const proto = win.HTMLCanvasElement.prototype;
proto.getContext = function () {
  const self = this;
  return {
    canvas: self, fillStyle: '#000', font: '', strokeStyle: '#000',
    putImageData() {}, drawImage() {}, fillRect() {}, clearRect() {}, fillText() {}, strokeRect() {},
    setTransform() {}, save() {}, restore() {}, beginPath() {}, rect() {}, clip() {},
    moveTo() {}, lineTo() {}, stroke() {},
    createPattern() { return { __pattern: true, setTransform() {} }; }
  };
};
proto.toBlob = function (cb, type) { cb(new win.Blob(['x'], { type: type || 'image/png' })); };
proto.toDataURL = function (type) { return 'data:' + (type || 'image/png') + ';base64,AAAA'; };
if (!win.ImageData) {
  win.ImageData = class { constructor(data, w, h) { this.data = data; this.width = w; this.height = h; } };
}
// сцене нужны DOMMatrix и ResizeObserver, jsdom их не знает
win.DOMMatrix = class { constructor(a) { this.m = a; } };
win.ResizeObserver = class { constructor(cb) { this.cb = cb; } observe() {} };
// jsdom не грузит CSS: токены оформления (их читает cssToken) — прямо из tokens.css
{
  const css = fs.readFileSync(ROOT + '/app/ui/css/tokens.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const root = css.slice(css.indexOf(':root{') + 6, css.lastIndexOf('}'));
  for (const m of root.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g))
    win.document.documentElement.style.setProperty(m[1], m[2].trim());
}
if (!win.URL.createObjectURL) { win.URL.createObjectURL = () => 'blob:stub'; win.URL.revokeObjectURL = () => {}; }
let clip = null;
Object.defineProperty(win.navigator, 'clipboard', { value: { writeText: async t => { clip = t; } }, configurable: true });
win.addEventListener('error', ev => errors.push('window.error: ' + (ev.error ? ev.error.stack : ev.message)));
win.addEventListener('unhandledrejection', ev => errors.push('unhandledrejection: ' + (ev.reason && ev.reason.message)));

// jsdom не считает раскладку — подставим ненулевые размеры сцены
Object.defineProperty(win.HTMLElement.prototype, 'clientWidth', { get() { return 900; }, configurable: true });
Object.defineProperty(win.HTMLElement.prototype, 'clientHeight', { get() { return 600; }, configurable: true });

// ---- заглушка приложения ----
const calls = [];          // журнал: {cmd, args, opts}
const answers = {};        // cmd → значение, которое вернёт следующий вызов (одноразово)
let libState = { dir: null, files: [], errors: [] };
let dropHandler = null;

function zrn1(jobs) {
  const tiles = jobs.map(j => {
    const d = REF.validateDoc(j.doc, 'запрос');
    return { w: j.width, h: j.height, px: REF.accToImageData(REF.composeDoc(d, j.width, j.height), j.width, j.height, d.render.dither).data };
  });
  const size = 8 + 8 * tiles.length + tiles.reduce((s, t) => s + t.px.length, 0);
  const buf = new win.ArrayBuffer(size);
  const dv = new DataView(buf), u8 = new Uint8Array(buf);
  u8.set([0x5a, 0x52, 0x4e, 0x31]);
  dv.setUint32(4, tiles.length, true);
  let off = 8;
  for (const t of tiles) { dv.setUint32(off, t.w, true); dv.setUint32(off + 4, t.h, true); off += 8; }
  for (const t of tiles) { u8.set(t.px, off); off += t.px.length; }
  return buf;
}

async function invoke(cmd, args, opts) {
  calls.push({ cmd, args, opts });
  if (cmd in answers) { const v = answers[cmd]; delete answers[cmd]; if (v instanceof Error) throw v.message; return v; }
  switch (cmd) {
    case 'engine_info': return { version: '2.0.0', threads: 4, cacheEntries: 0, cacheBytes: 0, cacheHits: 0, cacheMisses: 0, renders: 0 };
    case 'render':
      try { return zrn1(args.request.jobs); } catch (e) { throw e.message; }   // Tauri отдаёт ошибку строкой
    case 'library_state': return libState;
    case 'library_reveal': return null;
    case 'doc_save': return null;
    default: throw 'заглушка: команда «' + cmd + '» не ожидалась в этом шаге';
  }
}
win.__TAURI__ = {
  core: { invoke },
  dialog: { ask: async () => true },
  webview: { getCurrentWebview: () => ({ onDragDropEvent: async cb => { dropHandler = cb; return () => {}; } }) }
};

try { win.eval(appCode() + ';window.__api={get doc(){return doc;},serializeDoc:serializeDoc,helpBtn:helpBtn};'); } catch (err) { errors.push('eval: ' + err.stack); }

const D = win.document;
const $ = id => D.getElementById(id);
const wait = ms => new Promise(r => setTimeout(r, ms));
// Ждём не время, а готовность: под нагрузкой рендер может занять дольше паузы.
async function settle(max) {
  const t0 = Date.now();
  while (Date.now() - t0 < (max || 8000)) {
    const st = $('stState').textContent;
    if (st === 'готов' || st === 'ошибка') return;
    await wait(10);
  }
}
async function step(ms) { await wait(ms); await settle(); }

let fails = 0, checks = 0;
function ok(name, cond, extra) {
  checks++;
  if (!cond) { fails++; console.log('  ✗ ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else console.log('  ✓ ' + name + (extra !== undefined ? '  (' + extra + ')' : ''));
}
function drainErrors(label, ignore) {
  checks++;
  if (ignore) for (let i = errors.length - 1; i >= 0; i--) if (ignore.test(errors[i])) errors.splice(i, 1);
  if (errors.length) { fails++; console.log('  ✗ ' + label + ' → ' + errors.length + ' ошибок:\n     ' + errors.join('\n     ').slice(0, 1400)); errors.length = 0; }
  else console.log('  ✓ ' + label);
}
function ev(el, type) { el.dispatchEvent(new win.Event(type, { bubbles: true })); }
function key(code, k, mods) {
  D.body.dispatchEvent(new win.KeyboardEvent('keydown', Object.assign({ code, key: k, bubbles: true, cancelable: true, ctrlKey: true }, mods || {})));
}
function setRange(el, v) { el.value = String(v); ev(el, 'input'); }
function setSelect(el, v) { el.value = v; ev(el, 'change'); }
function setText(el, v) { el.value = v; ev(el, 'change'); }
const cards = () => $('colLeft').querySelectorAll('.card');
const api = () => win.__api;
const lastCall = cmd => calls.filter(c => c.cmd === cmd).pop();

(async () => {
  await step(200);

  console.log('\n[A] Стартовая сборка');
  drainErrors('загрузка без ошибок');
  ok('заголовок документа заполнен', $('docName').value.length > 0, $('docName').value);
  ok('в левой колонке 4 раздела', $('colLeft').querySelectorAll('.sec').length === 4);
  ok('карточек каналов 3', cards().length === 3);
  ok('статус «готов»', $('stState').textContent === 'готов', $('stState').textContent);
  ok('размер плитки в статусе', $('stTile').textContent === '512×512 px', $('stTile').textContent);
  ok('время рендера показано', /\d+ мс/.test($('stMs').textContent), $('stMs').textContent);
  {
    const conf = JSON.parse(fs.readFileSync(ROOT + '/app/tauri.conf.json', 'utf8')).app.windows[0].backgroundColor;
    const bg = D.documentElement.style.getPropertyValue('--bg');
    ok('заливка окна до загрузки WebView2 = подложка --bg', conf.toLowerCase() === bg.toLowerCase(), conf + ' / ' + bg);
  }
  ok('сцена нарисована из плитки движка', $('field').dataset.tile === '512×512', $('field').dataset.tile);
  ok('фоновое зерно интерфейса построено', D.documentElement.style.getPropertyValue('--grain').indexOf('url(') === 0);
  ok('движок — Rust, число потоков', $('stEngine').textContent === 'RUST · 4 пот.', $('stEngine').textContent);
  ok('документ не связан с файлом', $('fileName').textContent === 'не сохранён в файл', $('fileName').textContent);
  ok('отменять пока нечего', $('btnUndo').disabled && $('btnRedo').disabled);
  ok('библиотека без папки объясняет, что делать', /не выбрана/.test($('libStatus').textContent), $('libStatus').textContent.slice(0, 50));

  console.log('\n[B] Плитка: фишки и ползунок');
  {
    Array.from($('colLeft').querySelectorAll('.sec .chip')).find(c => c.textContent === '256²').click();
    await step(150);
    ok('плитка стала 256×256', $('stTile').textContent === '256×256 px', $('stTile').textContent);
    const on = $('colLeft').querySelector('.sec .chip.on');
    ok('фишка 256² подсвечена', on && on.textContent === '256²');
    const wRange = $('colLeft').querySelector('.sec .row input[type=range]');
    setRange(wRange, 300); await step(120);
    ok('ползунок ширины не пересобрал колонку (перетаскивание не оборвётся)', wRange.isConnected);
    ok('плитка 300×256', $('stTile').textContent === '300×256 px', $('stTile').textContent);
    ok('фишка погашена', !$('colLeft').querySelector('.sec .chip.on'));
    setRange(wRange, 256); await step(120);
    ok('фишка 256² снова подсвечена', !!$('colLeft').querySelector('.sec .chip.on'));
    drainErrors('плитка без ошибок');
  }

  console.log('\n[C] Добавление канала каждого типа');
  for (const label of ['+ Перлин — облака', '+ Value — мягкий', '+ Ворлей — пятна', '+ Зерно — плёнка']) {
    const btn = Array.from($('colLeft').querySelectorAll('.chip')).find(c => c.textContent === label);
    ok('кнопка «' + label + '» найдена', !!btn);
    if (btn) { btn.click(); await step(120); }
  }
  drainErrors('добавление 4 каналов без ошибок');
  ok('каналов стало 7', cards().length === 7, cards().length + ' шт');
  ok('счётчик каналов в статусе', $('stCh').textContent === '7 / 7', $('stCh').textContent);

  console.log('\n[D] Перебор всех типов шума в одной карточке');
  for (const t of ['value', 'worley', 'grain', 'perlin']) {
    setSelect(cards()[0].querySelector('select'), t);
    await step(120);
    ok('тип переключён на ' + t, cards()[0].querySelector('select').value === t);
  }
  drainErrors('перебор типов без ошибок');

  console.log('\n[E] Режимы смешивания и искажение домена');
  {
    const sels = () => cards()[0].querySelectorAll('select');
    const modes = Array.from(sels()[sels().length - 1].options).map(o => o.value);
    ok('в списке 11 режимов', modes.length === 11, modes.length + ' шт');
    for (const m of modes) { setSelect(sels()[sels().length - 1], m); await step(40); }
    drainErrors('все режимы смешивания отрисованы');
    const warpRow = Array.from(cards()[0].querySelectorAll('.row'))
      .find(r => r.querySelector('label') && r.querySelector('label').textContent === 'Искажение');
    ok('строка «Искажение» есть', !!warpRow);
    if (warpRow) { setRange(warpRow.querySelector('input[type=range]'), 60); await step(150); }
    drainErrors('искажение домена без ошибок');
  }

  console.log('\n[F] Цвет: градиент с ручками, HSL, HEX');
  {
    const stops = () => cards()[0].querySelectorAll('.stop');
    ok('у канала две ручки цвета и полоса градиента', stops().length === 2 && !!cards()[0].querySelector('.stops-ramp'));
    ok('пока ручка не выбрана, редактора нет', cards()[0].querySelectorAll('.stops-ed .ok').length === 0);
    stops()[1].click();
    let oks = cards()[0].querySelectorAll('.stops-ed .ok');
    ok('клик по ручке «сильный» открыл её редактор', oks.length === 1 && oks[0].classList.contains('open') &&
       stops()[1].classList.contains('on'), oks.length);
    const labels = Array.from(oks[0].querySelectorAll('.row label')).map(l => l.textContent).join('');
    ok('режим HSL: ползунки H S L A', labels === 'HSLA', labels);
    const hue = oks[0].querySelectorAll('input[type=range]')[0];
    setRange(hue, 200); await step(120);
    ok('ползунок H применился', Math.abs(api().doc.channels[0].high.h - 200) < 1, api().doc.channels[0].high.h);
    ok('шкала ползунка получила градиент', /linear-gradient/.test(hue.style.getPropertyValue('--trk')));
    ok('градиент канала обновился', /linear-gradient/.test(cards()[0].querySelector('.stops-ramp').style.getPropertyValue('--ramp')));
    const hex = oks[0].querySelector('.ok-hex');
    setText(hex, '#E8C547'); await step(120);
    ok('HEX применён и нормализован', /^#E8C5[34][0-9A-F]$/.test(hex.value), hex.value);
    setText(hex, 'мусор'); await step(60);
    ok('плохой HEX отвергнут и поле восстановлено', /^#[0-9A-F]{6}$/.test(hex.value), hex.value);
    ok('показан тост об ошибке', $('toast').classList.contains('err') && /HEX/.test($('toast').textContent));
    const lowBefore = JSON.stringify(api().doc.channels[0].low), highBefore = JSON.stringify(api().doc.channels[0].high);
    cards()[0].querySelector('.stops .ibtn').click(); await step(80);
    ok('⇄ меняет цвета местами', JSON.stringify(api().doc.channels[0].low) === highBefore &&
       JSON.stringify(api().doc.channels[0].high) === lowBefore);
    cards()[0].querySelector('.stops .ibtn').click(); await step(80);
    stops()[0].click();
    ok('клик по другой ручке переключает редактор', stops()[0].classList.contains('on') && !stops()[1].classList.contains('on') &&
       /слабый/.test(cards()[0].querySelector('.stops-ed .ok-title').textContent));
    stops()[0].click();
    ok('повторный клик прячет редактор', cards()[0].querySelectorAll('.stops-ed .ok').length === 0);
    stops()[1].click();
    drainErrors('правка цвета без ошибок', /Некорректный HEX/);
  }

  console.log('\n[F2] Цвет: OKLCH');
  {
    const ed = () => cards()[0].querySelector('.stops-ed .ok');
    const before = JSON.stringify(api().serializeDoc(api().doc).channels[0].high);
    ed().querySelectorAll('.ok-mode button')[1].click();
    await step(80);
    const box = ed();
    ok('после пересборки выбранная ручка и редактор остались', !!box && box.classList.contains('open'));
    const labels = Array.from(box.querySelectorAll('.row label')).map(l => l.textContent).join('');
    ok('режим LCH: ползунки L C H A', labels === 'LCHA', labels);
    ok('переключение режима цвет не меняет', JSON.stringify(api().serializeDoc(api().doc).channels[0].high) === before);
    ok('режим запомнен', win.localStorage.getItem('zerno.colorMode') === 'oklch');
    const [L, C] = box.querySelectorAll('input[type=range]');
    setRange(L, 0.5); setRange(C, 0.33); await step(100);
    const note = box.querySelector('.ok-note');
    ok('хрома за гамутом снижена и это подписано', note.style.display !== 'none' && /гамута/.test(note.textContent), note.textContent);
    const hsl = api().doc.channels[0].high;
    ok('цвет остался в OKHSL внутри гамута', hsl.s <= 1 + 1e-9 && hsl.s >= 0.99, hsl.s);
    setRange(C, 0.02); await step(100);
    ok('в гамуте подпись скрыта', note.style.display === 'none');
    box.querySelectorAll('.ok-mode button')[0].click(); await step(80);
    drainErrors('OKLCH без ошибок');
  }

  console.log('\n[F3] Размер пятна по ступеням');
  {
    const row = Array.from(cards()[0].querySelectorAll('.row')).find(r => /^(Пятно|Зерно) X/.test(r.querySelector('label').textContent));
    ok('строка размера найдена', !!row);
    const t = api().doc.channels[0].noise.type, W = api().doc.tile.width;
    const rng = row.querySelector('input[type=range]'), num = row.querySelector('.num');
    setRange(rng, Math.log2(W / 3.4)); await step(100);
    const c = Math.round(W / api().doc.channels[0].noise.sizeX);
    ok('размер встал ровно на ступень «сторона / целое»', Math.abs(api().doc.channels[0].noise.sizeX * c - W) < 1e-9,
       api().doc.channels[0].noise.sizeX + ' × ' + c);
    ok('под подписью — число ячеек', new RegExp('^' + c + ' ячe?').test(row.querySelector('.row-note').textContent) ||
       row.querySelector('.row-note').textContent.indexOf(String(c)) === 0, row.querySelector('.row-note').textContent);
    setText(num, '1000000'); await step(100);
    ok('слишком большой размер — одна ячейка на плитку', api().doc.channels[0].noise.sizeX === W, api().doc.channels[0].noise.sizeX);
    ok('тип не сменился', api().doc.channels[0].noise.type === t);
    drainErrors('размер по ступеням без ошибок');
  }

  console.log('\n[G] Числовое поле и сид');
  {
    const num = cards()[0].querySelector('.num');
    setText(num, '999999'); await step(100);
    ok('значение выше максимума обрезано', parseFloat(num.value) <= 1024, num.value);
    const gainNum = Array.from(cards()[0].querySelectorAll('.row')).find(r => r.querySelector('label').textContent === 'Затухание').querySelector('.num');
    setText(gainNum, '0,25'); await step(100);
    ok('запятая как разделитель принята', Math.abs(api().doc.channels[0].noise.gain - 0.25) < 1e-9, gainNum.value);
    const seedRow = Array.from(cards()[0].querySelectorAll('.row')).find(r => r.querySelector('label') && r.querySelector('label').textContent === 'Сид');
    const seed = seedRow && seedRow.querySelector('input');
    ok('поле сида найдено', !!seed);
    if (seed) {
      const was = api().doc.channels[0].noise.seed;
      seed.value = '99999999999'; ev(seed, 'input'); ev(seed, 'change'); await step(80);
      ok('сид за пределами int32 не завёрнут молча', api().doc.channels[0].noise.seed === was &&
         $('toast').classList.contains('err'), $('toast').textContent.slice(0, 70));
      ev(seed, 'blur');
      ok('поле сида восстановлено', seed.value === String(was), seed.value);
    }
    drainErrors('числовые поля без ошибок', /Сид — целое/);
  }

  console.log('\n[H] Видимость, порядок, дублирование, удаление');
  {
    const eye = cards()[0].querySelector('.ibtn');
    eye.click(); await step(100);
    ok('канал выключен', cards()[0].classList.contains('off') && $('stCh').textContent === '6 / 7', $('stCh').textContent);
    eye.click(); await step(100);
    ok('канал включён обратно', $('stCh').textContent === '7 / 7');
    const nameBefore = cards()[0].querySelector('.card-name').value;
    cards()[0].querySelectorAll('.ibtn')[2].click(); await step(100);
    ok('канал переехал вниз', cards()[1].querySelector('.card-name').value === nameBefore);
    cards()[1].querySelectorAll('.ibtn')[3].click(); await step(120);
    ok('канал продублирован', cards().length === 8 && /копия/.test(cards()[2].querySelector('.card-name').value));
    cards()[2].querySelectorAll('.ibtn')[4].click(); await step(120);
    ok('канал удалён', cards().length === 7);
    drainErrors('операции с каналами без ошибок');
  }

  console.log('\n[I] Отмена и повтор');
  {
    await wait(400);                         // правки выше слились в шаг истории
    ok('кнопка отмены активна', !$('btnUndo').disabled);
    ok('документ помечен изменённым', $('nameWrap').classList.contains('dirty'));
    const n = cards().length;
    Array.from($('colLeft').querySelectorAll('.chip')).find(c => c.textContent === '+ Зерно — плёнка').click();
    await step(80);
    ok('канал добавлен', cards().length === n + 1);
    key('KeyZ', 'z'); await step(120);
    ok('Ctrl+Z убрал канал', cards().length === n, cards().length);
    ok('повтор доступен', !$('btnRedo').disabled);
    key('KeyY', 'y'); await step(120);
    ok('Ctrl+Y вернул канал', cards().length === n + 1, cards().length);
    key('KeyZ', 'z', { shiftKey: true }); await step(80);
    ok('Ctrl+Shift+Z без истории повтора ничего не ломает', cards().length === n + 1);
    $('btnUndo').click(); await step(120);
    ok('кнопка ↶ тоже отменяет', cards().length === n);
    const name = cards()[0].querySelector('.card-name');
    name.focus();
    key('KeyZ', 'z');
    ok('Ctrl+Z в текстовом поле остаётся полю', cards().length === n);
    name.blur();
    drainErrors('история без ошибок');
  }

  console.log('\n[J] Раздел «Вывод»');
  {
    const outSec = $('colLeft').querySelectorAll('.sec')[3];
    outSec.querySelector('.sec-h').click();
    const sels = outSec.querySelectorAll('select');
    ok('в разделе два списка', sels.length === 2, sels.length + ' шт');
    setSelect(sels[0], 'srgb-linear'); await step(150);
    for (const m of ['ordered', 'off', 'tpdf']) {
      setSelect($('colLeft').querySelectorAll('.sec')[3].querySelectorAll('select')[1], m); await step(120);
    }
    drainErrors('режимы дизеринга без ошибок');
    ok('статус снова «готов»', $('stState').textContent === 'готов', $('stState').textContent);
  }

  console.log('\n[K] Сцена: масштаб, клавиши, границы, сдвиг');
  {
    setRange($('zoom'), 2); await step(60);
    ok('масштаб 400%', $('zval').textContent === '400%', $('zval').textContent);
    ok('сцена перерисована в масштабе 4×', $('field').dataset.scale === '4', $('field').dataset.scale);
    key('Digit0', '0'); await step(40);
    ok('Ctrl+0 — 100%', $('zval').textContent === '100%', $('zval').textContent);
    $('stageView').dispatchEvent(new win.WheelEvent('wheel', { deltaY: -100, ctrlKey: true, bubbles: true, cancelable: true }));
    await step(40);
    ok('Ctrl+колесо увеличивает', $('zval').textContent !== '100%', $('zval').textContent);
    $('zreset').click(); await step(40);
    $('tGrid').click(); await step(30);
    ok('сетка границ включена', $('tGrid').classList.contains('on'));
    const [ox0, oy0] = $('field').dataset.origin.split(',').map(Number);
    $('tShift').click(); await step(30);
    const [ox1, oy1] = $('field').dataset.origin.split(',').map(Number);
    ok('сдвиг на половину плитки', ox0 - ox1 === 128 && oy0 - oy1 === 128, ox0 + ',' + oy0 + ' → ' + ox1 + ',' + oy1);
    $('surr').querySelectorAll('.sw-btn')[4].click();
    ok('цвет обрамления сменился', $('stageView').style.background === 'rgb(201, 204, 208)', $('stageView').style.background);
    $('tLib').click(); await step(30);
    ok('библиотека скрыта', $('grid').classList.contains('no-right'));
    $('tLib').click(); await step(30);
    ok('библиотека возвращена', !$('grid').classList.contains('no-right'));
    drainErrors('управление сценой без ошибок');
  }

  console.log('\n[L] Библиотека: выбор папки, ошибки, открытие, удаление');
  {
    libState = { dir: LIB_DIR, files: PRESETS.concat([
      { name: 'bad.json', text: '{"format":"zerno-noise-tile","version":1}' },
      { name: 'x.json', text: 'не json' },
      { name: 'other.json', text: '{"a":1}' }]), errors: ['secret.json: отказано в доступе'] };
    answers.library_choose = libState;
    $('libDir').click(); await step(500);
    ok('в библиотеке все пресеты', $('libGrid').querySelectorAll('.pre').length === PRESETS.length,
       $('libGrid').querySelectorAll('.pre').length + ' из ' + PRESETS.length);
    ok('счётчик библиотеки', $('libCount').textContent === String(PRESETS.length), $('libCount').textContent);
    const st = $('libStatus').textContent;
    ok('статус: папка и число пресетов', st.indexOf(LIB_DIR) === 0 && st.indexOf('пресетов: ' + PRESETS.length) > 0, st.split('\n')[1]);
    ok('статус: чужие файлы названы', /не ЗЕРНО: 1 \(other\.json\)/.test(st));
    ok('статус: ошибки чтения и разбора перечислены', /Ошибки \(3\)/.test(st) && /bad\.json/.test(st) &&
       /не разбирается как JSON/.test(st) && /отказано в доступе/.test(st) && $('libStatus').classList.contains('err'));

    const pre = $('libGrid').querySelectorAll('.pre')[4];
    const label = pre.querySelector('.pre-n').textContent;
    pre.click(); await step(300);
    ok('клик по пресету открыл его', $('docName').value === label, $('docName').value + ' ≠ ' + label);
    ok('документ связан с файлом пресета', $('fileName').textContent === PRESETS[4].name, $('fileName').textContent);
    ok('открытый пресет подсвечен', pre.classList.contains('cur'));
    ok('открытый пресет не изменён', !$('nameWrap').classList.contains('dirty'));
    key('KeyZ', 'z'); await step(200);
    ok('Ctrl+Z вернул прежний документ', $('docName').value !== label && $('fileName').textContent === 'не сохранён в файл');
    key('KeyY', 'y'); await step(200);
    ok('Ctrl+Y снова открыл пресет', $('docName').value === label);

    const renders = calls.filter(c => c.cmd === 'render').length;
    $('libGrid').querySelectorAll('.pre')[2].click(); await step(200);
    const thumbs = calls.filter(c => c.cmd === 'render').slice(renders).filter(c => c.args.request.jobs.length === PRESETS.length);
    ok('клик по пресету не перерисовывает миниатюры библиотеки', thumbs.length === 0, thumbs.length);

    answers.library_delete = null;
    answers.library_state = { dir: LIB_DIR, files: PRESETS.slice(1), errors: [] };
    $('libGrid').querySelectorAll('.pre')[0].querySelector('.rm').click(); await step(300);
    ok('удаление спрашивает и удаляет нужный файл', lastCall('library_delete').args.name === PRESETS[0].name);
    ok('после удаления библиотека перечитана', $('libGrid').querySelectorAll('.pre').length === PRESETS.length - 1);
    libState = { dir: LIB_DIR, files: PRESETS, errors: [] };
    $('libReload').click(); await step(300);
    ok('«↻» перечитывает папку', $('libGrid').querySelectorAll('.pre').length === PRESETS.length);
    drainErrors('библиотека без ошибок');
  }

  console.log('\n[M] Файлы: сохранить, сохранить как, открыть, бросить на окно');
  {
    // документ связан с пресетом из библиотеки — Ctrl+S пишет прямо в него
    setRange(cards()[0].querySelectorAll('input[type=range]')[0], 50); await step(150);
    ok('после правки документ изменён', $('nameWrap').classList.contains('dirty'));
    key('KeyS', 's'); await step(200);
    const sv = lastCall('doc_save');
    ok('Ctrl+S пишет в связанный файл', sv && sv.args.path === LIB_DIR + '\\' + PRESETS[2].name, sv && sv.args.path);
    ok('записан строгий JSON документа', sv && JSON.parse(sv.args.text).format === 'zerno-noise-tile' && /\n$/.test(sv.args.text));
    ok('после записи документ не изменён', !$('nameWrap').classList.contains('dirty'));

    $('docName').value = 'новый: имя/тест*'; ev($('docName'), 'input');
    answers.doc_save_as = 'D:\\out\\new.json';
    key('KeyS', 's', { shiftKey: true }); await step(200);
    const sa = lastCall('doc_save_as');
    ok('«Сохранить как» предлагает имя без запрещённых символов', sa && sa.args.suggested === 'новый_ имя_тест_', sa && sa.args.suggested);
    ok('документ привязан к новому файлу', $('fileName').textContent === 'new.json', $('fileName').textContent);

    $('docName').value = ''; ev($('docName'), 'input');
    answers.doc_save_as = null;
    $('btnSaveAs').click(); await step(150);
    ok('пустое имя не подменяется заглушкой', lastCall('doc_save_as').args.suggested === '', lastCall('doc_save_as').args.suggested);
    ok('отмена диалога ничего не меняет', $('fileName').textContent === 'new.json');

    answers.doc_open = { path: 'D:\\x\\b.json', name: 'b.json', text: PRESETS[1].text };
    key('KeyO', 'o'); await step(300);
    ok('Ctrl+O открыл файл', $('fileName').textContent === 'b.json', $('fileName').textContent);
    answers.doc_open = { path: 'D:\\x\\c.json', name: 'c.json', text: '{"format":"zerno-noise-tile","version":1}' };
    $('btnOpen').click(); await step(200);
    ok('битый файл даёт тост с адресом поля', $('toast').classList.contains('err') && /документ\.\w+: поле отсутствует/.test($('toast').textContent),
       $('toast').textContent.slice(0, 80));
    ok('после ошибки открыт прежний документ', $('fileName').textContent === 'b.json');

    answers.doc_read = { path: 'D:\\x\\d.json', name: 'd.json', text: PRESETS[3].text };
    dropHandler({ payload: { type: 'over', position: { x: 1, y: 1 } } });
    ok('при перетаскивании сцена подсвечена', $('stage').classList.contains('drop'));
    dropHandler({ payload: { type: 'drop', paths: ['D:\\x\\d.json', 'D:\\x\\pic.png'], position: { x: 1, y: 1 } } });
    await step(300);
    ok('подсветка снята', !$('stage').classList.contains('drop'));
    ok('брошенный файл открыт', $('fileName').textContent === 'd.json' && lastCall('doc_read').args.path === 'D:\\x\\d.json');
    drainErrors('файлы без ошибок', /c\.json\]|pic\.png/);
  }

  console.log('\n[N] Экспорт');
  {
    answers.export_png = { path: 'D:\\out\\t.png', bytes: 2048 };
    key('KeyE', 'e'); await step(200);
    const ep = lastCall('export_png');
    ok('Ctrl+E — PNG считает Rust по документу', ep && ep.args.request.jobs[0].doc.format === 'zerno-noise-tile' &&
       ep.args.request.jobs[0].width === api().doc.tile.width);
    ok('о записи PNG сказано', /PNG сохранён/.test($('toast').textContent), $('toast').textContent);
    answers.export_bytes = { path: 'D:\\out\\t.webp', bytes: 1024 };
    $('btnWebp').click(); await step(250);
    const ew = lastCall('export_bytes');
    ok('WEBP уходит сырыми байтами с расширением', ew && ew.args instanceof win.Uint8Array && ew.opts.headers['x-ext'] === 'webp');
    $('btnCss').click(); await step(250);
    ok('CSS в буфере обмена', clip && /background-image:url\("data:image\/png/.test(clip) && /background-size:/.test(clip));
    drainErrors('экспорт без ошибок');
  }

  console.log('\n[O] Ошибка движка видна, а не проглочена');
  {
    answers.render = new Error('нехватка памяти: тест');
    setRange(cards()[0].querySelectorAll('input[type=range]')[0], 60); await step(250);
    ok('статус «ошибка»', $('stState').textContent === 'ошибка', $('stState').textContent);
    ok('текст ошибки в тосте', /нехватка памяти: тест/.test($('toast').textContent), $('toast').textContent.slice(0, 60));
    setRange(cards()[0].querySelectorAll('input[type=range]')[0], 61); await step(250);
    ok('следующая правка снова рисует', $('stState').textContent === 'готов', $('stState').textContent);
    errors.length = 0;
  }

  console.log('\n[P] Крайний случай: плитка 8×8');
  {
    const nums = $('colLeft').querySelectorAll('.sec')[0].querySelectorAll('.num');
    setText(nums[0], '8'); await step(200);
    setText(nums[1], '8'); await step(200);
    ok('плитка 8×8 отрисована', $('stTile').textContent === '8×8 px', $('stTile').textContent);
    drainErrors('крошечная плитка без ошибок');
  }

  console.log('\n[R] Справка, мышь, миниатюры типов');
  {
    const shown = () => Array.from($('helpBody').children).filter(a => !a.hidden).map(a => a.dataset.topic);
    const navOn = () => Array.from($('helpNav').querySelectorAll('button.on')).map(b => b.dataset.topic);
    ok('подсказок нет: ни title, ни data-hint, ни строки подсказок',
       D.querySelectorAll('[title],[data-hint]').length === 0 && !$('stHint'),
       Array.from(D.querySelectorAll('[title],[data-hint]')).map(e => e.tagName + '#' + e.id + '.' + e.className).join(' '));
    const topics = Array.from($('helpBody').children).map(a => a.dataset.topic);
    ok('оглавление построено по разделам', $('helpNav').children.length === topics.length && topics.length >= 10, topics.join(','));

    D.body.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'F1', code: 'F1', bubbles: true, cancelable: true }));
    ok('F1 открывает справку на «Начало»', !$('help').hidden && shown().join() === 'start' && navOn().join() === 'start', shown().join());
    D.body.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }));
    ok('Esc закрывает', $('help').hidden);
    $('btnHelp').click();
    ok('кнопка «?» сверху открывает «Начало»', !$('help').hidden && shown().join() === 'start');
    $('helpBody').querySelector('article[data-topic="start"] a[data-go="color"]').click();
    ok('ссылка внутри справки переходит в раздел', shown().join() === 'color' && navOn().join() === 'color', shown().join());
    $('helpNav').querySelector('button[data-topic="keys"]').click();
    ok('оглавление переключает раздел', shown().join() === 'keys');
    $('help').click();
    ok('клик мимо окна закрывает', $('help').hidden);

    /* значки групп: в разделах колонки и в подгруппах карточки */
    const secHelp = Array.from($('colLeft').querySelectorAll('.sec-h .help-i')).map(b => b.dataset.help);
    ok('у каждого раздела колонки — значок справки', secHelp.join() === 'tile,bg,chans,out', secHelp.join());
    const subHelp = Array.from(cards()[0].querySelectorAll('.sub-h .help-i')).map(b => b.dataset.help);
    ok('у подгрупп карточки — свои разделы', subHelp.join() === 'noise,shape,color,layer', subHelp.join());
    const tileSec = $('colLeft').querySelector('.sec');
    const wasClosed = tileSec.classList.contains('closed');
    tileSec.querySelector('.sec-h .help-i').click();
    ok('значок раздела открывает его справку и не сворачивает раздел',
       !$('help').hidden && shown().join() === 'tile' && tileSec.classList.contains('closed') === wasClosed);
    $('helpClose').click();
    ok('✕ закрывает', $('help').hidden);
    cards()[0].querySelector('.sub-h .help-i[data-help="color"]').click();
    ok('значок «Цвет» в карточке открывает «Цвет»', shown().join() === 'color');
    $('helpClose').click();
    D.querySelector('.stage-bar .help-i').click();
    ok('значок на панели сцены открывает «Сцена»', shown().join() === 'stage');
    $('helpClose').click();
    D.querySelector('.lib-t .help-i').click();
    ok('значок библиотеки открывает «Библиотека»', shown().join() === 'lib');
    $('helpClose').click();
    let threw = false;
    try { api().helpBtn('нет-такого'); } catch (e) { threw = /нет раздела/.test(e.message); }
    ok('значок на несуществующий раздел — исключение', threw);

    $('stageView').dispatchEvent(new win.WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true }));
    ok('колесо без Ctrl увеличивает', $('zval').textContent !== '100%', $('zval').textContent);
    $('stageView').dispatchEvent(new win.MouseEvent('dblclick', { bubbles: true }));
    ok('двойной клик — 1:1', $('zval').textContent === '100%', $('zval').textContent);

    const thumbs = Array.from($('colLeft').querySelectorAll('.chip-thumb'));
    ok('у кнопок «+ канал» есть миниатюры типов', thumbs.length === 4 && thumbs.every(t => /url\("data:image\/png/.test(t.style.backgroundImage)),
       thumbs.map(t => t.style.backgroundImage.slice(0, 20)).join(' | '));
    ok('у заголовка карточки есть стрелка', !!cards()[0].querySelector('.card-h .card-chev'));
    drainErrors('справка и мышь без ошибок');
  }

  console.log('\n[Q] Сессия переживает перезапуск');
  {
    win.dispatchEvent(new win.Event('beforeunload'));
    const s = JSON.parse(win.localStorage.getItem('zerno.session'));
    ok('сессия записана', s && typeof s.doc === 'string' && s.file === 'D:\\x\\d.json', s && s.file);
  }

  console.log('\n' + (fails ? '✗ ПРОВАЛОВ: ' + fails + ' из ' + checks : '✓ все ' + checks + ' проверок интерфейса пройдены'));
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('ОШИБКА: ' + e.stack); process.exit(1); });
