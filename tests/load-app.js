// Сборка исходников страницы для проверок вне браузера.
//
// Раньше весь код жил одним <script> внутри index.html и тесты вырезали его
// подстрокой. Теперь модули лежат в static/js/*.js, а index.html только их
// перечисляет. Порядок берём из самого index.html — если файл забыли
// подключить или подключили лишний, проверки увидят ровно то же, что браузер.
const fs = require('fs');

const ROOT = require('path').resolve(__dirname, '..').split(String.fromCharCode(92)).join('/');
const INDEX = ROOT + '/index.html';

/** Пути к модулям в порядке подключения, как они записаны в index.html. */
function scriptSrcs() {
  const html = fs.readFileSync(INDEX, 'utf8');
  const out = [];
  const re = /<script\s+src="([^"]+)"><\/script>/g;
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  if (!out.length) throw new Error('в index.html нет ни одного <script src=…>: сборка кода невозможна');
  if (/<script>/.test(html)) throw new Error('в index.html снова появился встроенный <script>: проверки его не увидят');
  return out;
}

function readAll(srcs) {
  return srcs.map(src => {
    const file = ROOT + '/' + src;
    if (!fs.existsSync(file)) throw new Error('index.html подключает ' + src + ', но файла нет: ' + file);
    return '/* ---- ' + src + ' ---- */\n' + fs.readFileSync(file, 'utf8');
  }).join('\n');
}

/** Весь код страницы одной строкой, в порядке подключения. */
function appCode() { return readAll(scriptSrcs()); }

/**
 * Только движок — от цвета до модели документа, без единой строчки интерфейса.
 * Граница проходит по doc.js: он последний модуль, которому не нужен DOM.
 */
function coreCode() {
  const srcs = scriptSrcs();
  const i = srcs.findIndex(s => /\/doc\.js$/.test(s));
  if (i < 0) throw new Error('среди подключённых скриптов нет doc.js — где проходит граница движка, неизвестно');
  return readAll(srcs.slice(0, i + 1));
}

/** Разметка без тегов <script src>: их подставляет тест сам через eval. */
function shell() {
  return fs.readFileSync(INDEX, 'utf8')
    .replace(/[ \t]*<script\s+src="[^"]+"><\/script>\n?/g, '');
}

module.exports = { ROOT, INDEX, scriptSrcs, appCode, coreCode, shell };
