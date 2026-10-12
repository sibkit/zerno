"use strict";
/* ЗЕРНО · экспорт и импорт: PNG, WEBP, JSON, CSS в буфер.
   Зависит от engine.js и doc.js. */


function safeName(s){
  const forbidden='\\/:*?"<>|';
  let v='';
  for(const ch of String(s||'')){
    const c=ch.codePointAt(0);
    v+=(c<32||c===127||forbidden.indexOf(ch)>=0)?'_':ch;
  }
  v=v.replace(/\s+/g,' ').replace(/[. ]+$/,'').trim();
  return v||'noise';
}
function download(blob,filename){
  const a=document.createElement('a');
  const u=URL.createObjectURL(blob);
  a.href=u; a.download=filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),8000);
}
function guard(fn){ Promise.resolve().then(fn).catch(e=>toast(e.message,true)); }

function webpSupported(){
  const c=document.createElement('canvas');
  c.width=c.height=1;
  return c.toDataURL('image/webp').indexOf('data:image/webp')===0;
}

/** Один тайл текущего документа через активный движок. */
async function renderCurrent(){
  const [t]=await renderTiles([{doc:serializeDoc(doc),width:doc.tile.width,height:doc.tile.height}]);
  return tileToCanvas(t);
}

async function exportImage(type,ext,quality){
  if(type==='image/webp'&&!webpSupported())
    throw new Error('Этот браузер не умеет кодировать WebP через canvas. Сохраните PNG.');
  const cv=await renderCurrent();
  const blob=await new Promise((res,rej)=>cv.toBlob(
    b=>b?res(b):rej(new Error('Не удалось закодировать изображение как '+type+'.')),type,quality));
  const fn=safeName(doc.name)+'.'+ext;
  download(blob,fn);
  toast('Сохранено: '+fn+'  ·  '+(blob.size/1024).toFixed(1)+' КБ');
}

function exportJson(){
  const txt=JSON.stringify(serializeDoc(doc),null,2);
  const fn=safeName(doc.name)+'.json';
  download(new Blob([txt],{type:'application/json'}),fn);
  toast('Сохранено: '+fn);
}

async function copyText(txt){
  if(navigator.clipboard&&window.isSecureContext){
    try{ await navigator.clipboard.writeText(txt); return; }catch(_){}
  }
  const ta=document.createElement('textarea');
  ta.value=txt;
  ta.style.cssText='position:fixed;left:-9999px;top:0';
  document.body.appendChild(ta);
  ta.select();
  let ok=false;
  try{ ok=document.execCommand('copy'); }catch(_){ ok=false; }
  ta.remove();
  if(!ok) throw new Error('Браузер не дал доступ к буферу обмена.');
}

async function copyCss(){
  const cv=await renderCurrent();
  const url=cv.toDataURL('image/png');
  const css='/* '+doc.name+' — плитка '+doc.tile.width+'×'+doc.tile.height+' */\n'+
    'background-color:'+okhslToCss(doc.background)+';\n'+
    'background-image:url("'+url+'");\n'+
    'background-repeat:repeat;\n'+
    'background-size:'+doc.tile.width+'px '+doc.tile.height+'px;';
  await copyText(css);
  toast('CSS скопирован в буфер ('+(css.length/1024).toFixed(1)+' КБ вместе с data-URI).');
}

function loadDoc(d,srcName){
  doc=d;
  $('docName').value=doc.name;
  for(const k of Object.keys(cardState)) delete cardState[k];
  lib.currentName=srcName||null;
  buildLeft();
  renderLib();
  scheduleRender();
}

async function importFiles(fileList){
  const files=[];
  for(const f of fileList){
    if(!/\.json$/i.test(f.name)){ toast('Пропущен «'+f.name+'»: ожидается *.json',true); continue; }
    files.push({name:f.name,text:await f.text()});
  }
  if(!files.length) return;
  const res=parsePresetFiles(files);
  if(res.errors.length) toast('Ошибки импорта:\n· '+res.errors.join('\n· '),true);
  if(res.skipped.length) toast('Не формат ЗЕРНО: '+res.skipped.join(', '),true);
  if(!res.items.length) return;
  const byName=new Map(lib.items.map(i=>[i.name,i]));
  for(const it of res.items) byName.set(it.name,it);
  lib.items=Array.from(byName.values());
  if(lib.source==='none') lib.source='input';
  loadDoc(cloneDoc(res.items[0].doc),res.items[0].name);
  libStatus('Импортировано файлов: '+res.items.length+'. Всего в списке: '+lib.items.length+'.','ok');
  toast('Загружено: '+res.items[0].name);
}

function initExport(){
  $('btnPng').addEventListener('click',()=>guard(()=>exportImage('image/png','png',undefined)));
  $('btnWebp').addEventListener('click',()=>guard(()=>exportImage('image/webp','webp',doc.render.webpQuality)));
  $('btnJson').addEventListener('click',()=>guard(exportJson));
  $('btnCss').addEventListener('click',()=>guard(copyCss));
  $('btnImport').addEventListener('click',()=>$('fileJson').click());
  $('fileJson').addEventListener('change',e=>{
    const fs=Array.from(e.target.files);
    e.target.value='';
    guard(()=>importFiles(fs));
  });
  $('docName').addEventListener('input',()=>{ doc.name=$('docName').value; });

  document.addEventListener('dragover',e=>{ e.preventDefault(); });
  document.addEventListener('drop',e=>{
    e.preventDefault();
    const fs=Array.from(e.dataTransfer.files||[]);
    if(fs.length) guard(()=>importFiles(fs));
  });
}

