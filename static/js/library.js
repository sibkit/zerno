"use strict";
/* ЗЕРНО · библиотека пресетов: сервер, File System Access, обзор папки, index.json.
   Зависит от doc.js, engine.js, render.js. */


const lib={source:'none',dir:null,dirName:'',items:[],currentName:null};

function libStatus(txt,cls){
  const e=$('libStatus');
  e.textContent=txt;
  e.className='lib-status'+(cls?' '+cls:'');
}

function parsePresetFiles(files){
  const items=[],errors=[],skipped=[];
  for(const f of files){
    let raw;
    try{ raw=JSON.parse(f.text); }
    catch(e){ errors.push(f.name+': не разбирается как JSON — '+e.message); continue; }
    if(raw===null||typeof raw!=='object'||raw.format!==FORMAT){ skipped.push(f.name); continue; }
    try{ items.push({name:f.name,doc:validateDoc(raw,f.name)}); }
    catch(e){ errors.push(e.message); }
  }
  return {items,errors,skipped};
}

function applyScan(res,srcLabel){
  lib.items=res.items;
  renderLib();
  let msg=srcLabel+': пресетов '+res.items.length;
  if(res.skipped.length) msg+=', пропущено не-ЗЕРНО '+res.skipped.length;
  if(res.errors.length){
    msg+='\nОшибки ('+res.errors.length+'):\n· '+res.errors.join('\n· ');
    libStatus(msg,'err');
  }else{
    libStatus(msg,'ok');
  }
}

async function renderLib(){
  const g=$('libGrid');
  g.innerHTML='';
  $('libCount').textContent=lib.items.length;
  const canvases=[], jobs=[], sizes=[];
  for(const it of lib.items){
    const card=el('div','pre');
    if(it.name===lib.currentName) card.classList.add('cur');
    const cv=document.createElement('canvas');
    cv.width=244; cv.height=148;   /* ровно 2× к CSS-размеру: без искажения пропорций */
    card.appendChild(cv);
    card.appendChild(el('div','pre-n',it.doc.name+'  ·  '+it.name));
    const rm=el('div','rm','✕');
    rm.title=lib.source==='fs'?'Удалить файл из папки':'Убрать из списка';
    rm.addEventListener('click',async e=>{
      e.stopPropagation();
      await removePreset(it);
    });
    card.appendChild(rm);
    card.addEventListener('click',()=>{
      try{
        loadDoc(cloneDoc(it.doc),it.name);
        toast('Загружено: '+it.name);
      }catch(err){ toast('Не удалось загрузить '+it.name+': '+err.message,true); }
    });
    g.appendChild(card);
    const [tw,th]=thumbDims(it.doc.tile.width,it.doc.tile.height,72);
    canvases.push(cv);
    sizes.push([tw,th]);
    jobs.push({doc:scaledDoc(it.doc,tw,th),width:tw,height:th});
  }
  if(!jobs.length) return;
  let res;
  try{
    res=await renderTiles(jobs);
  }catch(err){
    for(const cv of canvases){
      const ctx=cv.getContext('2d');
      ctx.fillStyle='#2a1010'; ctx.fillRect(0,0,cv.width,cv.height);
      ctx.fillStyle='#ff5f52'; ctx.font='18px monospace';
      ctx.fillText('ошибка',14,58);
    }
    toast('Миниатюры библиотеки: '+err.message,true);
    return;
  }
  for(let i=0;i<canvases.length;i++) if(res[i]) tileInto(canvases[i],res[i]);
}

async function removePreset(it){
  if(lib.source==='server'){
    if(!confirm('Удалить файл «'+it.name+'» из папки noises/?\nДействие необратимо.')) return;
    try{ await deleteFromServer(it.name); }
    catch(e){ toast('Не удалось удалить: '+e.message,true); }
    return;
  }
  if(lib.source==='fs'&&lib.dir){
    if(!confirm('Удалить файл «'+it.name+'» из папки «'+lib.dirName+'»?\nДействие необратимо.')) return;
    try{
      await lib.dir.removeEntry(it.name);
      toast('Файл удалён: '+it.name);
      await scanDirHandle();
    }catch(e){ toast('Не удалось удалить: '+e.message,true); }
  }else{
    lib.items=lib.items.filter(x=>x!==it);
    renderLib();
  }
}

async function openDirPicker(){
  if(!window.showDirectoryPicker)
    throw new Error('File System Access API недоступен в этом браузере. Нажмите «Обзор…» — это работает везде, но без записи в папку.');
  const h=await window.showDirectoryPicker({mode:'readwrite',id:'zerno-noises'});
  lib.dir=h; lib.source='fs'; lib.dirName=h.name;
  try{ await idbSet('dir',h); }catch(_){}
  await scanDirHandle();
}

async function scanDirHandle(){
  if(!lib.dir) throw new Error('Папка не подключена.');
  const files=[];
  for await(const [name,handle] of lib.dir.entries()){
    if(handle.kind!=='file') continue;
    if(!/\.json$/i.test(name)) continue;
    const f=await handle.getFile();
    files.push({name,text:await f.text()});
  }
  files.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
  applyScan(parsePresetFiles(files),'Папка «'+lib.dirName+'»');
}

async function pickDirInput(files){
  const out=[];
  for(const f of files){
    if(!/\.json$/i.test(f.name)) continue;
    out.push({name:f.name,text:await f.text()});
  }
  out.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
  lib.source='input'; lib.dir=null;
  if(!out.length){
    lib.items=[]; renderLib();
    libStatus('В выбранной папке нет файлов *.json.','err');
    return;
  }
  applyScan(parsePresetFiles(out),'Выбранная папка');
}

/** Библиотека через zerno.exe: сервер сам читает папку noises/ и пишет в неё. */
async function loadLibraryFromServer(){
  const r=await fetch('api/library',{cache:'no-store'});
  if(!r.ok) throw new Error('HTTP '+r.status);
  const j=await r.json();
  if(j.error) throw new Error(j.error);
  lib.source='server';
  lib.dir=null;
  lib.dirName='noises/';
  const res={items:[],errors:j.errors||[],skipped:new Array(j.skipped||0)};
  for(const f of j.files){
    try{ res.items.push({name:f.name,doc:validateDoc(f.doc,f.name)}); }
    catch(e){ res.errors.push(e.message); }
  }
  applyScan(res,'Папка noises/ (сервер)');
}

async function saveToServer(){
  const fn=safeName(doc.name).replace(/[^0-9A-Za-z._-]/g,'_')+'.json';
  const r=await fetch('api/library?name='+encodeURIComponent(fn),{
    method:'PUT',
    headers:{'content-type':'application/json'},
    body:JSON.stringify(serializeDoc(doc),null,2)
  });
  const j=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j.error||('HTTP '+r.status));
  lib.currentName=fn;
  toast('Сохранено в noises/'+fn);
  await loadLibraryFromServer();
}

async function deleteFromServer(name){
  const r=await fetch('api/library?name='+encodeURIComponent(name),{method:'DELETE'});
  const j=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j.error||('HTTP '+r.status));
  toast('Файл удалён: '+name);
  await loadLibraryFromServer();
}

async function tryHttpIndex(){
  if(!/^https?:$/.test(location.protocol)) return false;
  const base='./noises/';
  let list;
  try{
    const r=await fetch(base+'index.json',{cache:'no-cache'});
    if(!r.ok) return false;
    const j=await r.json();
    if(Array.isArray(j)) list=j;
    else if(j&&Array.isArray(j.files)) list=j.files;
    else throw new Error('noises/index.json: ожидается массив имён или {"files":[...]}.');
  }catch(e){
    if(e instanceof SyntaxError||/index\.json/.test(e.message)){ libStatus(e.message,'err'); return true; }
    return false;
  }
  const files=[];
  const errors=[];
  for(const nm of list){
    if(typeof nm!=='string'){ errors.push('index.json: элемент списка не строка — '+JSON.stringify(nm)); continue; }
    try{
      const r=await fetch(base+nm,{cache:'no-cache'});
      if(!r.ok) throw new Error('HTTP '+r.status);
      files.push({name:nm,text:await r.text()});
    }catch(e){ errors.push(nm+': '+e.message); }
  }
  lib.source='http'; lib.dir=null;
  const res=parsePresetFiles(files);
  res.errors=errors.concat(res.errors);
  applyScan(res,'./noises/ (index.json)');
  return true;
}

async function saveToFolder(){
  if(lib.source==='server') return saveToServer();
  if(lib.source!=='fs'||!lib.dir)
    throw new Error('Нет подключённой папки с правом записи. Нажмите «Папка» (Chrome/Edge).');
  const fn=safeName(doc.name)+'.json';
  const perm=await lib.dir.queryPermission({mode:'readwrite'});
  if(perm!=='granted'){
    const req=await lib.dir.requestPermission({mode:'readwrite'});
    if(req!=='granted') throw new Error('Нет разрешения на запись в папку.');
  }
  const h=await lib.dir.getFileHandle(fn,{create:true});
  const w=await h.createWritable();
  await w.write(JSON.stringify(serializeDoc(doc),null,2));
  await w.close();
  lib.currentName=fn;
  toast('Сохранено в папку: '+fn);
  await scanDirHandle();
}

/* ---- IndexedDB: запоминаем выбранную папку между сессиями ---- */
function idbOpen(){
  return new Promise((res,rej)=>{
    const r=indexedDB.open('zerno',1);
    r.onupgradeneeded=()=>r.result.createObjectStore('kv');
    r.onsuccess=()=>res(r.result);
    r.onerror=()=>rej(r.error);
  });
}
async function idbSet(k,v){
  const db=await idbOpen();
  return new Promise((res,rej)=>{
    const t=db.transaction('kv','readwrite');
    t.objectStore('kv').put(v,k);
    t.oncomplete=()=>res(); t.onerror=()=>rej(t.error);
  });
}
async function idbGet(k){
  const db=await idbOpen();
  return new Promise((res,rej)=>{
    const t=db.transaction('kv','readonly');
    const q=t.objectStore('kv').get(k);
    q.onsuccess=()=>res(q.result); q.onerror=()=>rej(q.error);
  });
}

async function restoreDir(){
  let h=null;
  try{ h=await idbGet('dir'); }catch(_){ return false; }
  if(!h||!h.queryPermission) return false;
  const p=await h.queryPermission({mode:'readwrite'});
  if(p!=='granted'){
    libStatus('Папка «'+h.name+'» была подключена ранее. Нажмите «Папка», чтобы восстановить доступ.');
    return true;
  }
  lib.dir=h; lib.source='fs'; lib.dirName=h.name;
  await scanDirHandle();
  return true;
}

function initLib(){
  $('libDir').addEventListener('click',async()=>{
    try{ await openDirPicker(); }
    catch(e){ if(e.name!=='AbortError') libStatus(e.message,'err'); }
  });
  $('libPick').addEventListener('click',()=>$('fileDir').click());
  $('fileDir').addEventListener('change',async e=>{
    try{ await pickDirInput(Array.from(e.target.files)); }
    catch(err){ libStatus(err.message,'err'); }
    e.target.value='';
  });
  $('libSave').addEventListener('click',async()=>{
    try{ await saveToFolder(); }
    catch(e){ toast(e.message,true); libStatus(e.message,'err'); }
  });
  $('libReload').addEventListener('click',async()=>{
    try{
      if(lib.source==='server') await loadLibraryFromServer();
      else if(lib.source==='fs') await scanDirHandle();
      else if(lib.source==='http') await tryHttpIndex();
      else libStatus('Нечего обновлять: источник не подключён.','err');
    }catch(e){ libStatus(e.message,'err'); }
  });
}

