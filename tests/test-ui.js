// Прогон интерфейса ЗЕРНО в jsdom: сборка панелей и реальные взаимодействия.
const fs = require('fs');
const { ROOT, appCode, shell: pageShell } = require('./load-app.js');
const { JSDOM, VirtualConsole } = require('jsdom');

const code = appCode();
const shell = pageShell();

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', err => errors.push('jsdomError: ' + err.message));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));
vc.on('warn', () => {});

const dom = new JSDOM(shell, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, url: 'file:///D:/x/index.html' });
const win = dom.window;

// ---- заглушки canvas (jsdom не рисует) ----
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
if (!win.ImageData) {
  win.ImageData = class { constructor(w, h) { this.width = w; this.height = h; this.data = new win.Uint8ClampedArray(w * h * 4); } };
}
if (!win.URL.createObjectURL) { win.URL.createObjectURL = () => 'blob:stub'; win.URL.revokeObjectURL = () => {}; }
win.addEventListener('error', ev => errors.push('window.error: ' + (ev.error ? ev.error.stack : ev.message)));
win.addEventListener('unhandledrejection', ev => errors.push('unhandledrejection: ' + (ev.reason && ev.reason.message)));

// jsdom не считает раскладку — подставим ненулевые размеры сцены
Object.defineProperty(win.HTMLElement.prototype, 'clientWidth', { get() { return 900; }, configurable: true });
Object.defineProperty(win.HTMLElement.prototype, 'clientHeight', { get() { return 600; }, configurable: true });

// strict-eval не выносит объявления в глобальную область — пробрасываем нужное явно
try { win.eval(code + ';window.__api={importFiles:importFiles};'); } catch (err) { errors.push('eval: ' + err.stack); }

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
function setRange(el, v) { el.value = String(v); ev(el, 'input'); }
function setSelect(el, v) { el.value = v; ev(el, 'change'); }
function setText(el, v) { el.value = v; ev(el, 'change'); }

(async () => {
  await step(150);

  console.log('\n[A] Стартовая сборка');
  drainErrors('загрузка без ошибок');
  ok('заголовок документа заполнен', $('docName').value.length > 0, $('docName').value);
  const secs = $('colLeft').querySelectorAll('.sec');
  ok('в левой колонке 4 раздела', secs.length === 4, secs.length + ' шт');
  ok('карточек каналов 3', $('colLeft').querySelectorAll('.card').length === 3);
  ok('статус «готов»', $('stState').textContent === 'готов', $('stState').textContent);
  ok('размер плитки в статусе', $('stTile').textContent === '512×512 px', $('stTile').textContent);
  ok('время рендера показано', /\d+ мс/.test($('stMs').textContent), $('stMs').textContent);
  ok('превью получило фоновую картинку', /url\(/.test($('field').style.backgroundImage));
  ok('фоновое зерно интерфейса построено',
    D.documentElement.style.getPropertyValue('--grain').indexOf('url(') === 0);
  ok('движок помечен как браузерный', /JS/.test($('stEngine').textContent), $('stEngine').textContent);
  ok('слайдеров в панели много', $('colLeft').querySelectorAll('input[type=range]').length > 20,
     $('colLeft').querySelectorAll('input[type=range]').length + ' шт');

  console.log('\n[B] Смена размера плитки');
  const chips = $('colLeft').querySelectorAll('.sec .chip');
  const c256 = Array.from(chips).find(c => c.textContent === '256²');
  c256.click();
  await step(150);
  drainErrors('переключение на 256² без ошибок');
  ok('плитка стала 256×256', $('stTile').textContent === '256×256 px', $('stTile').textContent);
  const onChip = $('colLeft').querySelector('.sec .chip.on');
  ok('чип 256² подсвечен', onChip && onChip.textContent === '256²', onChip && onChip.textContent);

  console.log('\n[C] Добавление канала каждого типа');
  for (const label of ['+ Перлин — облака', '+ Value — мягкий', '+ Ворлей — пятна', '+ Зерно — плёнка']) {
    const btn = Array.from($('colLeft').querySelectorAll('.chip')).find(c => c.textContent === label);
    ok('кнопка «' + label + '» найдена', !!btn);
    if (btn) { btn.click(); await step(120); }
  }
  drainErrors('добавление 4 каналов без ошибок');
  ok('каналов стало 7', $('colLeft').querySelectorAll('.card').length === 7,
     $('colLeft').querySelectorAll('.card').length + ' шт');
  ok('счётчик каналов в статусе', $('stCh').textContent === '7 / 7', $('stCh').textContent);

  console.log('\n[D] Перебор всех типов шума в одной карточке');
  {
    const card = $('colLeft').querySelectorAll('.card')[0];
    card.classList.add('open');
    const typeSel = card.querySelector('select');
    for (const t of ['value', 'worley', 'grain', 'perlin']) {
      setSelect(card.querySelector('select'), t);
      await step(120);
      const cur = $('colLeft').querySelectorAll('.card')[0].querySelector('select').value;
      ok('тип переключён на ' + t, cur === t, cur);
    }
    drainErrors('перебор типов без ошибок');
  }

  console.log('\n[E] Все режимы смешивания и искажение домена');
  {
    const card = $('colLeft').querySelectorAll('.card')[0];
    const sels = card.querySelectorAll('select');
    const blendSel = sels[sels.length - 1];
    const modes = Array.from(blendSel.options).map(o => o.value);
    ok('в списке 11 режимов', modes.length === 11, modes.length + ' шт');
    for (const m of modes) { setSelect(card.querySelectorAll('select')[card.querySelectorAll('select').length - 1], m); await step(60); }
    drainErrors('все режимы смешивания отрисованы');

    // включаем искажение домена — появляется дополнительная строка «Масштаб иск.»
    const c2 = $('colLeft').querySelectorAll('.card')[0];
    const rows = Array.from(c2.querySelectorAll('.row'));
    const warpRow = rows.find(r => r.querySelector('label') && r.querySelector('label').textContent === 'Искажение');
    ok('строка «Искажение» есть', !!warpRow);
    if (warpRow) { setRange(warpRow.querySelector('input[type=range]'), 60); await step(150); }
    drainErrors('искажение домена без ошибок');
  }

  console.log('\n[F] Правка цвета: слайдеры и HEX');
  {
    const card = $('colLeft').querySelectorAll('.card')[0];
    const oks = card.querySelectorAll('.ok');
    ok('в карточке два редактора цвета', oks.length === 2, oks.length + ' шт');
    const hue = oks[1].querySelectorAll('input[type=range]')[0];
    setRange(hue, 200); await step(120);
    ok('слайдер H применился', Math.abs(parseFloat(hue.value) - 200) < 1, hue.value);
    ok('трек слайдера получил градиент', /linear-gradient/.test(hue.style.getPropertyValue('--trk')));
    const hex = oks[1].querySelector('.ok-hex');
    setText(hex, '#E8C547'); await step(120);
    ok('HEX применён и нормализован', /^#E8C5[34][0-9A-F]$/.test(hex.value), hex.value);
    setText(hex, 'мусор'); await step(60);
    ok('плохой HEX отвергнут и поле восстановлено', /^#[0-9A-F]{6}$/.test(hex.value), hex.value);
    ok('показан тост об ошибке', $('toast').classList.contains('on') && /HEX/.test($('toast').textContent),
       $('toast').textContent.slice(0, 60));
    drainErrors('правка цвета без ошибок', /Некорректный HEX/);
  }

  console.log('\n[G] Числовое поле: ввод, границы, скраб');
  {
    const card = $('colLeft').querySelectorAll('.card')[0];
    const num = card.querySelector('.num');
    setText(num, '999999'); await step(120);
    ok('значение выше максимума обрезано', parseFloat(num.value) <= 1024, num.value);
    setText(num, '-50'); await step(120);
    ok('значение ниже минимума обрезано', parseFloat(num.value) >= 2, num.value);
    setText(num, '12,5'); await step(120);
    ok('запятая как разделитель принята', Math.abs(parseFloat(num.value) - 12.5) < 0.01, num.value);
    const before = num.value;
    num.dispatchEvent(new win.Event('pointerdown'));
    num.dispatchEvent(new win.Event('pointermove'));
    num.dispatchEvent(new win.Event('pointerup'));
    await step(80);
    ok('скраб без координат не портит значение (защита от NaN)', num.value === before, num.value + ' было ' + before);
    drainErrors('числовые поля без ошибок');
  }

  console.log('\n[H] Видимость, порядок, дублирование, удаление');
  {
    let cards = $('colLeft').querySelectorAll('.card');
    const eye = cards[0].querySelector('.ibtn');
    eye.click(); await step(120);
    ok('канал выключен', $('colLeft').querySelectorAll('.card')[0].classList.contains('off'));
    ok('счётчик активных обновился', $('stCh').textContent === '6 / 7', $('stCh').textContent);
    eye.click(); await step(120);
    ok('канал включён обратно', $('stCh').textContent === '7 / 7', $('stCh').textContent);

    const nameBefore = cards[0].querySelector('.card-name').value;
    cards[0].querySelectorAll('.ibtn')[2].click(); await step(120);   // ↓ вниз
    ok('канал переехал вниз',
       $('colLeft').querySelectorAll('.card')[1].querySelector('.card-name').value === nameBefore,
       $('colLeft').querySelectorAll('.card')[1].querySelector('.card-name').value);

    $('colLeft').querySelectorAll('.card')[1].querySelectorAll('.ibtn')[3].click(); await step(150); // дублировать
    ok('канал продублирован', $('colLeft').querySelectorAll('.card').length === 8,
       $('colLeft').querySelectorAll('.card').length + ' шт');
    ok('копия помечена в имени',
       /копия/.test($('colLeft').querySelectorAll('.card')[2].querySelector('.card-name').value));

    $('colLeft').querySelectorAll('.card')[2].querySelectorAll('.ibtn')[4].click(); await step(150); // удалить
    ok('канал удалён', $('colLeft').querySelectorAll('.card').length === 7);
    drainErrors('операции с каналами без ошибок');
  }

  console.log('\n[I] Раздел «Вывод»');
  {
    const outSec = $('colLeft').querySelectorAll('.sec')[3];
    outSec.querySelector('.sec-h').click();
    const sels = outSec.querySelectorAll('select');
    ok('в разделе два селекта', sels.length === 2, sels.length + ' шт');
    setSelect(sels[0], 'srgb-linear'); await step(150);
    ok('пространство смешивания переключено', true);
    for (const m of ['ordered', 'off', 'tpdf']) {
      const sel = $('colLeft').querySelectorAll('.sec')[3].querySelectorAll('select')[1];
      setSelect(sel, m); await step(150);
    }
    drainErrors('режимы дизеринга без ошибок');
    ok('статус снова «готов»', $('stState').textContent === 'готов', $('stState').textContent);
  }

  console.log('\n[J] Сцена: масштаб, границы, сдвиг, панель библиотеки');
  {
    setRange($('zoom'), 2); await step(60);
    ok('масштаб 400%', $('zval').textContent === '400%', $('zval').textContent);
    ok('размер фона превью пересчитан', $('field').style.backgroundSize === '1024px 1024px', $('field').style.backgroundSize);
    $('zreset').click(); await step(60);
    ok('сброс на 100%', $('zval').textContent === '100%', $('zval').textContent);
    $('tGrid').click(); await step(30);
    ok('сетка границ включена', $('fieldGrid').classList.contains('on'));
    ok('сетка нарисована по размеру плитки', /256px/.test($('fieldGrid').style.backgroundImage));
    $('tShift').click(); await step(30);
    ok('сдвиг на половину плитки', $('field').style.backgroundPosition === '128px 128px', $('field').style.backgroundPosition);
    $('surr').querySelectorAll('.sw-btn')[4].click();
    ok('цвет обрамления сменился', $('stageView').style.background === 'rgb(201, 204, 208)', $('stageView').style.background);
    $('tLib').click(); await step(30);
    ok('библиотека скрыта', $('grid').classList.contains('no-right'));
    $('tLib').click(); await step(30);
    ok('библиотека возвращена', !$('grid').classList.contains('no-right'));
    drainErrors('управление сценой без ошибок');
  }

  console.log('\n[K] Импорт JSON и библиотека');
  {
    const files = fs.readdirSync(ROOT + '/noises').filter(f => f !== 'index.json');
    const fake = files.map(n => {
      const body = fs.readFileSync(ROOT + '/noises/' + n, 'utf8');
      return { name: n, text: async () => body };
    });
    await win.__api.importFiles(fake);
    await step(400);
    drainErrors('импорт ' + files.length + ' пресетов без ошибок');
    ok('в библиотеке появились все пресеты', $('libGrid').querySelectorAll('.pre').length === files.length,
       $('libGrid').querySelectorAll('.pre').length + ' из ' + files.length);
    ok('счётчик библиотеки', $('libCount').textContent === String(files.length), $('libCount').textContent);
    ok('загружен первый пресет', $('docName').value.length > 0, $('docName').value);
    ok('статус библиотеки зелёный', $('libStatus').classList.contains('ok'), $('libStatus').textContent.slice(0, 60));

    // клик по превью загружает пресет
    const pre = $('libGrid').querySelectorAll('.pre')[4];
    const label = pre.querySelector('.pre-n').textContent.split('  ·  ')[0];
    pre.click(); await step(300);
    ok('клик по пресету загрузил его', $('docName').value === label, $('docName').value + ' ≠ ' + label);
    drainErrors('загрузка пресета из библиотеки без ошибок', /документ\.|не разбирается/);

    // битый JSON должен дать понятную ошибку, а не молчание
    await win.__api.importFiles([{ name: 'bad.json', text: async () => '{"format":"zerno-noise-tile","version":1}' }]);
    await step(200);
    errors.length = 0;
    ok('битый пресет даёт тост с адресом поля и именем файла',
       /документ\.\w+: поле отсутствует/.test($('toast').textContent) &&
       /bad\.json/.test($('toast').textContent) && $('toast').classList.contains('err'),
       $('toast').textContent.slice(0, 90));
    errors.length = 0;
    await win.__api.importFiles([{ name: 'x.json', text: async () => 'не json' }]);
    await step(200);
    ok('не-JSON даёт понятный тост', /не разбирается как JSON/.test($('toast').textContent),
       $('toast').textContent.slice(0, 70));
    errors.length = 0;
  }

  console.log('\n[L] Экспорт');
  {
    let dl = null;
    const origCreate = D.createElement.bind(D);
    D.createElement = function (tag) {
      const el = origCreate(tag);
      if (tag === 'a') { el.click = function () { dl = el.download; }; }
      return el;
    };
    $('btnPng').click(); await step(250);
    ok('PNG выгружен с именем', /\.png$/.test(dl || ''), dl);
    dl = null;
    $('btnWebp').click(); await step(250);
    ok('WebP выгружен с именем', /\.webp$/.test(dl || ''), dl);
    dl = null;
    $('btnJson').click(); await step(250);
    ok('JSON выгружен с именем', /\.json$/.test(dl || ''), dl);
    D.createElement = origCreate;
    drainErrors('экспорт без ошибок');
  }

  console.log('\n[M] Библиотека без подключённой папки');
  {
    $('libSave').click(); await step(150);
    ok('сохранение без папки объясняет причину',
       /папк/i.test($('libStatus').textContent) && $('libStatus').classList.contains('err'),
       $('libStatus').textContent.slice(0, 70));
    $('libDir').click(); await step(150);
    ok('кнопка «Папка» сообщает об отсутствии API',
       /File System Access/.test($('libStatus').textContent), $('libStatus').textContent.slice(0, 70));
    errors.length = 0;
  }

  console.log('\n[N] Крайний случай: плитка 8×8 и обратно');
  {
    const secBody = $('colLeft').querySelectorAll('.sec')[0].querySelector('.sec-b');
    const wnum = secBody.querySelectorAll('.num')[0];
    setText(wnum, '8'); await step(250);
    const hnum = $('colLeft').querySelectorAll('.sec')[0].querySelector('.sec-b').querySelectorAll('.num')[1];
    setText(hnum, '8'); await step(250);
    ok('плитка 8×8 отрисована', $('stTile').textContent === '8×8 px', $('stTile').textContent);
    ok('статус без ошибки', $('stState').textContent === 'готов', $('stState').textContent);
    drainErrors('крошечная плитка без ошибок');
  }

  console.log('\n' + (fails ? '✗ ПРОВАЛОВ: ' + fails + ' из ' + checks : '✓ все ' + checks + ' проверок интерфейса пройдены'));
  process.exit(fails ? 1 : 0);
})();
