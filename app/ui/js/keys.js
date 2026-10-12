"use strict";
/* ЗЕРНО · горячие клавиши. Зависит от history.js, transfer.js, render.js.

   Ctrl+Z / Ctrl+Y (Ctrl+Shift+Z) — отмена / повтор правок документа
   Ctrl+S / Ctrl+Shift+S         — сохранить / сохранить как…
   Ctrl+O                         — открыть пресет
   Ctrl+E                         — экспорт PNG
   Ctrl+= / Ctrl+- / Ctrl+0       — масштаб сцены (и Ctrl+колесо над плиткой)

   В текстовых полях (имя пресета, имя канала, HEX) Ctrl+Z/Y остаются
   родными для поля; числовые поля .num правят документ — там отмена общая. */

function textEditing(t){
  return t&&(t.tagName==='TEXTAREA'||(t.tagName==='INPUT'&&t.type==='text'&&!t.classList.contains('num')));
}

function initKeys(){
  document.addEventListener('keydown',e=>{
    if(!(e.ctrlKey||e.metaKey)||e.altKey) return;
    const k=e.key.toLowerCase(), code=e.code;
    let act=null;
    if(code==='KeyZ'&&!e.shiftKey) act=textEditing(e.target)?null:undo;
    else if(code==='KeyY'||(code==='KeyZ'&&e.shiftKey)) act=textEditing(e.target)?null:redo;
    else if(code==='KeyS') act=e.shiftKey?saveDocAs:saveDoc;
    else if(code==='KeyO') act=openFile;
    else if(code==='KeyE') act=exportPng;
    else if(k==='='||k==='+'||code==='NumpadAdd') act=()=>zoomBy(0.25);
    else if(k==='-'||code==='NumpadSubtract') act=()=>zoomBy(-0.25);
    else if(code==='Digit0'||code==='Numpad0') act=zoomReset;
    if(!act) return;
    e.preventDefault();
    /* правка в числовом поле ещё не применена, пока поле в фокусе — применяем */
    if(document.activeElement&&document.activeElement.classList.contains('num')) document.activeElement.blur();
    guard(act);
  });
}
