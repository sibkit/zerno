// Тот же интерфейс, но против живого zerno.exe: проверяем путь ZIG целиком.
const fs = require('fs');
const { ROOT, appCode, shell: pageShell } = require('./load-app.js');
const { JSDOM, VirtualConsole } = require('jsdom');

const BASE = 'http://127.0.0.1:8787/';
const DIR = ROOT;
const code = appCode();
const shell = pageShell();

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', err => errors.push('jsdomError: ' + err.message));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));
vc.on('warn', () => {});

const dom = new JSDOM(shell, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, url: BASE });
const win = dom.window;

const proto = win.HTMLCanvasElement.prototype;
proto.getContext = function () {
  const self = this;
  return {
    canvas: self, fillStyle: '#000', font: '', strokeStyle: '#000',
    putImageData() {}, drawImage() {}, fillRect() {}, clearRect() {}, fillText() {},
    createPattern() { return { __pattern: true }; }
  };
};
proto.toBlob = function (cb, type) { cb(new win.Blob(['x'], { type: type || 'image/png' })); };
proto.toDataURL = function (type) { return 'data:' + (type || 'image/png') + ';base64,AAAA'; };
win.ImageData = class {
  constructor(a, b, c) {
    if (typeof a === 'number') { this.width = a; this.height = b; this.data = new Uint8ClampedArray(a * b * 4); }
    else { this.data = a; this.width = b; this.height = c; }
  }
};
if (!win.URL.createObjectURL) { win.URL.createObjectURL = () => 'blob:stub'; win.URL.revokeObjectURL = () => {}; }
// настоящий сетевой fetch с разрешением относительных путей
win.fetch = (u, o) => globalThis.fetch(new URL(String(u && u.url ? u.url : u), BASE), o);
win.addEventListener('error', ev => errors.push('window.error: ' + (ev.error ? ev.error.stack : ev.message)));
win.addEventListener('unhandledrejection', ev => errors.push('unhandledrejection: ' + (ev.reason && ev.reason.message)));
Object.defineProperty(win.HTMLElement.prototype, 'clientWidth', { get() { return 900; }, configurable: true });
Object.defineProperty(win.HTMLElement.prototype, 'clientHeight', { get() { return 600; }, configurable: true });

try { win.eval(code + ';window.__api={renderTiles:renderTiles,engineInfo:engineInfo,serializeDoc:serializeDoc,getDoc:function(){return doc;}};'); }
catch (err) { errors.push('eval: ' + err.stack); }

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
function drain(label, ignore) {
  checks++;
  if (ignore) for (let i = errors.length - 1; i >= 0; i--) if (ignore.test(errors[i])) errors.splice(i, 1);
  if (errors.length) { fails++; console.log('  ✗ ' + label + ' → ' + errors.join('\n     ').slice(0, 1200)); errors.length = 0; }
  else console.log('  ✓ ' + label);
}
function ev(el, t) { el.dispatchEvent(new win.Event(t, { bubbles: true })); }

(async () => {
  await step(1200);

  console.log('\n[A] Движок определился как серверный');
  drain('загрузка без ошибок');
  ok('режим ZIG', win.__api.engineInfo.mode === 'zig', win.__api.engineInfo.mode + ' / ' + win.__api.engineInfo.reason);
  ok('в статусе показан ZIG', /ZIG/.test($('stEngine').textContent), $('stEngine').textContent);
  ok('потоки известны', win.__api.engineInfo.threads > 0, win.__api.engineInfo.threads);
  ok('превью получено', /url\(/.test($('field').style.backgroundImage));
  ok('статус «готов»', $('stState').textContent === 'готов', $('stState').textContent);

  console.log('\n[B] Библиотека приходит с сервера');
  ok('пресеты показаны', $('libGrid').querySelectorAll('.pre').length === 10,
     $('libGrid').querySelectorAll('.pre').length + ' шт');
  ok('статус библиотеки зелёный', $('libStatus').classList.contains('ok'), $('libStatus').textContent.slice(0, 60));
  ok('источник — сервер', /сервер/.test($('libStatus').textContent), $('libStatus').textContent.slice(0, 50));
  drain('библиотека без ошибок');

  console.log('\n[C] Правка параметров идёт через сервер');
  {
    const card = $('colLeft').querySelectorAll('.card')[0];
    card.classList.add('open');
    const rng = card.querySelector('input[type=range]');
    const before = $('stMs').textContent;
    rng.value = '120'; ev(rng, 'input');
    await step(500);
    ok('рендер отработал', $('stState').textContent === 'готов', $('stState').textContent);
    ok('время рендера обновилось', /\d+ мс/.test($('stMs').textContent), before + ' → ' + $('stMs').textContent);
    const ms = parseInt($('stMs').textContent, 10);
    ok('одна правка укладывается в 60 мс (сеть + счёт)', ms < 60, ms + ' мс');
    drain('правка без ошибок');
  }

  console.log('\n[D] Пакет: главная плитка + миниатюры одним запросом');
  {
    const d = win.__api.serializeDoc(win.__api.getDoc());
    const jobs = [{ doc: d, width: 512, height: 512 }];
    for (let i = 0; i < 6; i++) jobs.push({ doc: d, width: 38, height: 38 });
    const t0 = Date.now();
    const res = await win.__api.renderTiles(jobs);
    const ms = Date.now() - t0;
    ok('вернулось ' + res.length + ' тайлов', res.length === jobs.length);
    ok('первый 512×512', res[0].w === 512 && res[0].h === 512);
    ok('данные не пустые', res[0].data.some(v => v !== 0));
    ok('пакет из 7 задач быстрее 60 мс', ms < 60, ms + ' мс');
  }

  console.log('\n[E] Ошибка документа доходит до пользователя');
  {
    const bad = win.__api.serializeDoc(win.__api.getDoc());
    delete bad.channels[0].noise.shape.gamma;
    let msg = null;
    try { await win.__api.renderTiles([{ doc: bad, width: 64, height: 64 }]); }
    catch (err) { msg = err.message; }
    ok('сервер объяснил, какого поля нет', msg && /shape\.gamma/.test(msg), msg);
  }

  console.log('\n[F] Сохранение и удаление пресета на сервере');
  {
    const nameInput = $('docName');
    nameInput.value = 'zzz-proba-udalit';
    ev(nameInput, 'input');
    $('libSave').click();
    await step(900);
    const saved = fs.existsSync(DIR + '/noises/zzz-proba-udalit.json');
    ok('файл появился в noises/', saved);
    ok('в библиотеке стало 11', $('libGrid').querySelectorAll('.pre').length === 11,
       $('libGrid').querySelectorAll('.pre').length + ' шт');

    const idxAfterSave = JSON.parse(fs.readFileSync(DIR + '/noises/index.json', 'utf8'));
    ok('index.json пополнился', idxAfterSave.files.includes('zzz-proba-udalit.json'),
       idxAfterSave.files.length + ' записей');

    if (saved) {
      const r = await globalThis.fetch(BASE + 'api/library?name=zzz-proba-udalit.json', { method: 'DELETE' });
      ok('удаление через API вернуло 200', r.status === 200, r.status);
      ok('файл удалён с диска', !fs.existsSync(DIR + '/noises/zzz-proba-udalit.json'));
      const idx = JSON.parse(fs.readFileSync(DIR + '/noises/index.json', 'utf8'));
      ok('index.json очистился от удалённого', !idx.files.includes('zzz-proba-udalit.json'));
      ok('index.json перечисляет все 10 пресетов', idx.files.length === 10, idx.files.length + ' записей');
      ok('index.json не содержит сам себя', !idx.files.includes('index.json'));
    }
    drain('сохранение/удаление без ошибок');
  }

  console.log('\n[G] Большая плитка 1024 через сервер');
  {
    const d = win.__api.serializeDoc(win.__api.getDoc());
    const t0 = Date.now();
    const res = await win.__api.renderTiles([{ doc: d, width: 1024, height: 1024 }]);
    const ms = Date.now() - t0;
    ok('1024×1024 получено', res[0].w === 1024 && res[0].data.length === 1024 * 1024 * 4);
    ok('уложилось в 120 мс', ms < 120, ms + ' мс');
  }

  console.log('\n' + (fails ? '✗ ПРОВАЛОВ: ' + fails + ' из ' + checks : '✓ все ' + checks + ' проверок пройдены'));
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('ОШИБКА: ' + e.stack); process.exit(1); });
