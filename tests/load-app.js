// Сборка исходников для проверок вне приложения.
//
// Интерфейс — app/ui/index.html и app/ui/js/*.js; порядок модулей берём из самого
// index.html, чтобы проверки видели ровно то же, что WebView.
// Эталонный движок на JS (tests/reference) в приложение не входит: им тесты
// сверяют движок на Rust и подменяют его в проверках интерфейса.
const fs = require('fs');

const ROOT = require('path').resolve(__dirname, '..').split(String.fromCharCode(92)).join('/');
const UI = ROOT + '/app/ui';
const INDEX = UI + '/index.html';
const REFERENCE = ['lattice.js', 'field.js', 'shape.js', 'composite.js', 'dither.js']
  .map(f => ROOT + '/tests/reference/' + f);

/** Пути модулей (относительно app/ui/) в порядке подключения из index.html. */
function scriptSrcs() {
  const html = fs.readFileSync(INDEX, 'utf8');
  const out = [];
  const re = /<script\s+src="([^"]+)"><\/script>/g;
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  if (!out.length) throw new Error('в index.html нет ни одного <script src=…>: сборка кода невозможна');
  if (/<script>/.test(html)) throw new Error('в index.html появился встроенный <script>: проверки его не увидят');
  return out;
}

function readFiles(files) {
  return files.map(file => {
    if (!fs.existsSync(file)) throw new Error('нет файла: ' + file);
    return '/* ---- ' + file.slice(ROOT.length + 1) + ' ---- */\n' + fs.readFileSync(file, 'utf8');
  }).join('\n');
}

function uiFiles() {
  return scriptSrcs().map(src => {
    const file = UI + '/' + src;
    if (!fs.existsSync(file)) throw new Error('index.html подключает ' + src + ', но файла нет: ' + file);
    return file;
  });
}

/** Код интерфейса, в порядке подключения. */
function appCode() { return readFiles(uiFiles()); }

/** Код интерфейса до doc.js включительно — без DOM. */
function modelFiles() {
  const files = uiFiles();
  const i = files.findIndex(f => /\/doc\.js$/.test(f));
  if (i < 0) throw new Error('среди подключённых скриптов нет doc.js — где кончается модель, неизвестно');
  return files.slice(0, i + 1);
}

/**
 * Эталонный движок: модель интерфейса (color, model, doc) + tests/reference.
 * Эталон зависит от color.js и model.js, а doc.js — ни от чего из эталона,
 * поэтому эталон вставляется перед doc.js.
 */
function coreCode() {
  const m = modelFiles();
  return readFiles(m.slice(0, -1).concat(REFERENCE, m.slice(-1)));
}

/** Только эталон — для подмешивания к appCode() в проверках интерфейса. */
function referenceCode() { return readFiles(REFERENCE); }

/** Разметка без тегов <script src>: их подставляет тест сам через eval. */
function shell() {
  return fs.readFileSync(INDEX, 'utf8')
    .replace(/[ \t]*<script\s+src="[^"]+"><\/script>\n?/g, '');
}

module.exports = { ROOT, UI, INDEX, scriptSrcs, appCode, coreCode, referenceCode, shell };
