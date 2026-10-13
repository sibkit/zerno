"use strict";
/* ЗЕРНО · отмена/повтор, привязка к файлу, несохранённые изменения, автосохранение.
   Зависит от doc.js и ui-kit.js; вызывает buildLeft/scheduleRender/markCurrentPreset
   (panels.js, render.js, library.js) — только во время работы, не при загрузке.

   Шаг истории — {s, file}: s — JSON serializeDoc (ровно то, что пишется в
   файл), file — путь файла, с которым связан документ. Путь хранится в каждом
   шаге: иначе после отмены старое содержимое ушло бы по Ctrl+S в файл,
   открытый позже, и затёрло бы его. */

const HISTORY_MAX=200;
/* Правки чаще этого сливаются в один шаг — перетаскивание ползунка не
   превращается в сотню шагов отмены. */
const HISTORY_IDLE_MS=350;
const AUTOSAVE_MS=600;
const SESSION_KEY='zerno.session';

const hist={undo:[],redo:[],cur:null,timer:null};
/* путь → снимок, совпадающий с содержимым файла на диске */
const savedSnap=Object.create(null);
let autosaveTimer=null;

function snapshot(){ return JSON.stringify(serializeDoc(doc)); }
function boundFile(){ return hist.cur?hist.cur.file:null; }

/** Пользователь изменил документ: шаг истории + перерисовка. */
function changed(){
  noteChange();
  scheduleRender();
}

function noteChange(){
  clearTimeout(hist.timer);
  hist.timer=setTimeout(commitHistory,HISTORY_IDLE_MS);
  updateDirty();
  autosaveSoon();
}

function commitHistory(){
  clearTimeout(hist.timer); hist.timer=null;
  const s=snapshot();
  if(s===hist.cur.s) return;
  hist.undo.push(hist.cur);
  if(hist.undo.length>HISTORY_MAX) hist.undo.shift();
  hist.redo=[];
  hist.cur={s:s,file:hist.cur.file};
  updateHistoryUi();
}

function undo(){
  commitHistory();
  if(!hist.undo.length) return;
  hist.redo.push(hist.cur);
  hist.cur=hist.undo.pop();
  restoreCurrent(false);
}
function redo(){
  commitHistory();
  if(!hist.redo.length) return;
  hist.undo.push(hist.cur);
  hist.cur=hist.redo.pop();
  restoreCurrent(false);
}

function restoreCurrent(newDoc){
  doc=validateDoc(JSON.parse(hist.cur.s),tr('src.history'));
  if(newDoc) for(const k of Object.keys(cardState)) delete cardState[k];
  $('docName').value=doc.name;
  buildLeft();
  scheduleRender();
  updateHistoryUi();
  updateDirty();
  markCurrentPreset();
  autosaveSoon();
}

/**
 * Новый документ в редакторе (открыт файл, выбран пресет, восстановлена сессия).
 * Это тоже шаг истории: Ctrl+Z вернёт прежний документ вместе с его файлом.
 * file — путь, с которым документ теперь связан, или null; fromDisk — содержимое
 * только что прочитано из этого файла (иначе, как при восстановлении сессии,
 * совпадение с диском уже записано в savedSnap или его нет).
 */
function openDocument(d,file,fromDisk){
  if(hist.cur) commitHistory();
  const prev=hist.cur;
  doc=d;
  const s=snapshot();
  if(file&&fromDisk) savedSnap[file]=s;
  hist.cur={s:s,file:file};
  if(prev){
    hist.undo.push(prev);
    if(hist.undo.length>HISTORY_MAX) hist.undo.shift();
    hist.redo=[];
  }
  restoreCurrent(true);
}

/** Документ записан в файл path: теперь он связан с этим файлом. */
function markSaved(path){
  commitHistory();
  hist.cur.file=path;
  savedSnap[path]=hist.cur.s;
  updateDirty();
  markCurrentPreset();
  autosaveSoon();
}

function updateHistoryUi(){
  $('btnUndo').disabled=!hist.undo.length;
  $('btnRedo').disabled=!hist.redo.length;
}

function isDirty(){
  const f=boundFile();
  return !f||savedSnap[f]!==snapshot();
}

function updateDirty(){
  const f=boundFile();
  $('nameWrap').classList.toggle('dirty',isDirty());
  const fn=$('fileName');
  /* Поле обрезается слева (direction: rtl): метки LRM не дают цифрам и
     дефису в начале имени уехать в конец («08-dyuny.json» → «dyuny.json-08»). */
  fn.textContent=f?'\u200E'+f.replace(/^.*[\\/]/,'')+'\u200E':tr('file.unsaved');
  fn.classList.toggle('path',!!f);
}

/* ---------------- автосохранение сессии ---------------- */

function autosaveSoon(){
  clearTimeout(autosaveTimer);
  autosaveTimer=setTimeout(autosaveNow,AUTOSAVE_MS);
}
function autosaveNow(){
  clearTimeout(autosaveTimer);
  const f=boundFile();
  const data={doc:snapshot(),file:f,saved:f&&savedSnap[f]!==undefined?savedSnap[f]:null};
  try{ localStorage.setItem(SESSION_KEY,JSON.stringify(data)); }
  catch(e){ toast(tr('session.autosaveFail',{err:e.message}),true); }
}

/** Прошлая сессия: {doc, file, saved} либо null, если её нет. Ошибка — исключение. */
function readSession(){
  const raw=localStorage.getItem(SESSION_KEY);
  if(raw===null) return null;
  const o=JSON.parse(raw);
  if(!o||typeof o.doc!=='string') throw new Error('запись сессии повреждена');
  const d=validateDoc(JSON.parse(o.doc),tr('src.session'));
  if(o.file!==null&&typeof o.file!=='string') throw new Error('запись сессии: file не строка');
  if(o.file&&typeof o.saved==='string') savedSnap[o.file]=o.saved;
  return {doc:d,file:o.file};
}

function initHistory(){
  $('btnUndo').addEventListener('click',()=>guard(undo));
  $('btnRedo').addEventListener('click',()=>guard(redo));
  window.addEventListener('beforeunload',autosaveNow);
}
