"use strict";
/* ЗЕРНО · файлы: открыть, сохранить, сохранить как, экспорт PNG/WEBP, CSS в буфер,
   файлы, брошенные на окно. Зависит от engine.js, history.js, library.js.
   Диалоги и запись на диск — на стороне приложения (app/src/files.rs). */

/** Имя файла из имени пресета: только запрещённые Windows символы → «_».
    Пустое имя остаётся пустым — поле в диалоге просто будет пустым. */
function safeName(s){
  const forbidden='\\/:*?"<>|';
  let v='';
  for(const ch of String(s)){
    const c=ch.codePointAt(0);
    v+=(c<32||c===127||forbidden.indexOf(ch)>=0)?'_':ch;
  }
  return v.replace(/\s+/g,' ').replace(/[. ]+$/,'').trim();
}

function guard(fn){ Promise.resolve().then(fn).catch(e=>toast(e.message,true)); }

function docText(){ return JSON.stringify(serializeDoc(doc),null,2)+'\n'; }

function inLibrary(path){
  return !!lib.dir&&!!path&&path.replace(/\//g,'\\').toLowerCase().startsWith(lib.dir.replace(/\//g,'\\').replace(/\\?$/,'\\').toLowerCase());
}

async function afterSave(path){
  markSaved(path);
  toast(tr('file.saved',{path:path}));
  if(inLibrary(path)) await reloadLibrary();
}

/** Ctrl+S: в связанный файл; если связи нет — как «Сохранить как…». */
async function saveDoc(){
  const f=boundFile();
  if(!f) return saveDocAs();
  await call('doc_save',{path:f,text:docText()});
  await afterSave(f);
}

async function saveDocAs(){
  const path=await call('doc_save_as',{text:docText(),suggested:safeName(doc.name),title:tr('dlg.save'),filter:tr('dlg.filter')});
  if(path) await afterSave(path);
}

function loadOpened(o){
  const res=parsePresetFiles([{name:o.name,text:o.text}]);
  if(res.skipped.length) throw new ZErr('doc.notPreset',{name:o.name,format:FORMAT});
  if(res.errors.length) throw res.errors[0];
  openDocument(res.items[0].doc,o.path,true);
  toast(tr('doc.opened',{name:o.path}));
}

async function openFile(){
  const o=await call('doc_open',{title:tr('dlg.open'),filter:tr('dlg.filter')});
  if(o) loadOpened(o);
}

async function exportPng(){
  const r=await call('export_png',{
    request:{jobs:[{width:doc.tile.width,height:doc.tile.height,doc:serializeDoc(doc)}]},
    suggested:safeName(doc.name),
    title:tr('dlg.exportPng')
  });
  if(r) toast(tr('export.saved',{fmt:'PNG',path:r.path,kb:(r.bytes/1024).toFixed(1)}));
}

/** Один тайл текущего документа в canvas. */
async function renderCurrent(){
  const [t]=await renderTiles([{doc:serializeDoc(doc),width:doc.tile.width,height:doc.tile.height}]);
  return tileToCanvas(t);
}

/* WebP кодирует движок WebView2 (Chromium): качество 1.00 — без потерь. */
async function exportWebp(){
  const cv=await renderCurrent();
  const blob=await new Promise(res=>cv.toBlob(res,'image/webp',doc.render.webpQuality));
  if(!blob||blob.type!=='image/webp')
    throw new ZErr('export.webpFail',{got:blob?blob.type:'null'});
  const bytes=new Uint8Array(await blob.arrayBuffer());
  const r=await call('export_bytes',bytes,{headers:{'x-ext':'webp','x-name':encodeURIComponent(safeName(doc.name)),'x-title':encodeURIComponent(tr('dlg.exportWebp'))}});
  if(r) toast(tr('export.saved',{fmt:'WEBP',path:r.path,kb:(r.bytes/1024).toFixed(1)}));
}

async function copyCss(){
  const cv=await renderCurrent();
  const url=cv.toDataURL('image/png');
  const css='/* '+tr('css.comment',{name:doc.name,w:doc.tile.width,h:doc.tile.height})+' */\n'+
    'background-color:'+okhslToCss(doc.background)+';\n'+
    'background-image:url("'+url+'");\n'+
    'background-repeat:repeat;\n'+
    'background-size:'+doc.tile.width+'px '+doc.tile.height+'px;';
  await navigator.clipboard.writeText(css);
  toast(tr('css.copied',{kb:(css.length/1024).toFixed(1)}));
}

/** Файлы, брошенные на окно: открывается первый *.json, о прочих — сообщение. */
function initDrop(){
  const stage=$('stage');
  tauri().webview.getCurrentWebview().onDragDropEvent(e=>{
    const p=e.payload;
    if(p.type==='enter'||p.type==='over'){ stage.classList.add('drop'); return; }
    stage.classList.remove('drop');
    if(p.type!=='drop') return;
    const json=p.paths.filter(x=>/\.json$/i.test(x));
    const other=p.paths.filter(x=>!/\.json$/i.test(x));
    if(other.length) toast(tr('drop.skipped',{list:other.join(', ')}),true);
    if(json.length>1) toast(tr('drop.many',{n:json.length,first:json[0]}),true);
    if(json.length) guard(async()=>loadOpened(await call('doc_read',{path:json[0]})));
  }).catch(e=>toast(tr('drop.unavailable',{err:toErr(e).message}),true));
}

function initExport(){
  $('btnOpen').addEventListener('click',()=>guard(openFile));
  $('btnSave').addEventListener('click',()=>guard(saveDoc));
  $('btnSaveAs').addEventListener('click',()=>guard(saveDocAs));
  $('btnPng').addEventListener('click',()=>guard(exportPng));
  $('btnWebp').addEventListener('click',()=>guard(exportWebp));
  $('btnCss').addEventListener('click',()=>guard(copyCss));
  $('docName').addEventListener('input',()=>{ doc.name=$('docName').value; noteChange(); });
  initDrop();
}
