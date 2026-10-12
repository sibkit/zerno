// Прогон всех наборов проверок. Запуск: node tests/run-all.js
//
// Наборы 3–5 требуют работающий сервер на 127.0.0.1:8787 (кроме test-ui.js,
// который специально проверяет запасной путь на JS без сервера).
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const HERE = __dirname;
const suites = [
  ['ядро JS       ', 'test-engine.js', false],
  ['пресеты       ', 'make-presets.js', false],
  ['UI, путь JS   ', 'test-ui.js', true],
  ['паритет Zig/JS', 'test-parity.js', false, true],
  ['UI, путь Zig  ', 'test-ui-zig.js', true, true],
];

let serverUp = false;
try {
  execFileSync(process.execPath, ['-e', "fetch('http://127.0.0.1:8787/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"], { stdio: 'ignore' });
  serverUp = true;
} catch (_) {}

if (!fs.existsSync(path.join(HERE, 'node_modules'))) {
  console.log('Для наборов с интерфейсом нужен jsdom:  cd tests && npm install\n');
}

console.log('Сервер на 127.0.0.1:8787: ' + (serverUp ? 'есть' : 'НЕ ЗАПУЩЕН — наборы с Zig будут пропущены'));
console.log('');

let bad = 0, skipped = 0;
for (const [name, file, needsJsdom, needsServer] of suites) {
  if (needsServer && !serverUp) { console.log('  …  ' + name + '  пропущен: нет сервера'); skipped++; continue; }
  if (needsJsdom && !fs.existsSync(path.join(HERE, 'node_modules', 'jsdom'))) {
    console.log('  …  ' + name + '  пропущен: нет jsdom'); skipped++; continue;
  }
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
  if (!okRun) { bad++; console.log(out.split('\n').filter(l => l.includes('✗')).map(l => '        ' + l).join('\n')); }
}

console.log('');
if (bad) { console.log('ПРОВАЛЕНО наборов: ' + bad); process.exit(1); }
console.log('Все наборы пройдены' + (skipped ? ' (пропущено: ' + skipped + ')' : ''));
