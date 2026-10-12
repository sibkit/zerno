// Прогон всех наборов проверок. Запуск: node tests/run-all.js
//
// Нужно: jsdom (npm install в корне проекта) и собранный движок
// (cargo build --release -p zerno-engine) — без них прогон падает с объяснением,
// а не пропускает наборы молча. Тесты на Rust: cargo test -p zerno-engine.
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const HERE = __dirname;
const ROOT = path.resolve(HERE, '..');
const EXE = path.join(ROOT, 'target', 'release', 'zerno-render' + (process.platform === 'win32' ? '.exe' : ''));

const missing = [];
if (!fs.existsSync(path.join(ROOT, 'node_modules', 'jsdom'))) missing.push('jsdom:  npm install  (в корне проекта)');
if (!fs.existsSync(EXE)) missing.push('движок: cargo build --release -p zerno-engine  (нет ' + EXE + ')');
if (missing.length) {
  console.log('Не хватает для прогона:\n  ' + missing.join('\n  '));
  process.exit(1);
}

const suites = [
  ['эталон JS        ', 'test-engine.js'],
  ['пресеты          ', '../tools/make-presets.js'],
  ['паритет Rust / JS', 'test-parity.js'],
  ['интерфейс        ', 'test-ui.js'],
];

let bad = 0;
for (const [name, file] of suites) {
  let out;
  let okRun = true;
  try {
    out = execFileSync(process.execPath, [path.join(HERE, file)], { encoding: 'utf8' });
  } catch (err) {
    out = (err.stdout || '') + (err.stderr || '');
    okRun = false;
  }
  const last = out.trim().split('\n').filter(Boolean).pop() || '(нет вывода)';
  console.log((okRun ? '  ok ' : '  ✗  ') + name + '  ' + last);
  if (!okRun) { bad++; console.log(out.split('\n').filter(l => l.includes('✗') || l.includes('ОШИБКА')).map(l => '        ' + l).join('\n')); }
}

console.log('');
if (bad) { console.log('ПРОВАЛЕНО наборов: ' + bad); process.exit(1); }
console.log('Все наборы пройдены');
