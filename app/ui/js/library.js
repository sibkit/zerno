"use strict";
/* ЗЕРНО · библиотека пресетов: папка на диске, которую читает приложение.
   Зависит от doc.js, engine.js, render.js, history.js.
   Папку выбирает пользователь; пока не выбрал — так и написано. */

const lib={dir:null,items:[]};   /* items: {name, path, doc} */

function libStatus(txt,isErr){
  const e=$('libStatus');
  e.textContent=txt;
  e.className='lib-status'+(isErr?' err':'');
}

/** Разбор файлов тем же строгим валидатором, что и при открытии. */
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

function samePath(a,b){
  return !!a&&!!b&&a.replace(/\//g,'\\').toLowerCase()===b.replace(/\//g,'\\').toLowerCase();
}

function applyLibrary(st){
  lib.dir=st.dir;
  $('libReveal').disabled=!st.dir;
  $('libReload').disabled=!st.dir;
  if(!st.dir){
    lib.items=[];
    renderLib();
    libStatus('Папка библиотеки не выбрана. Нажмите «Папка…» — подойдёт любая, '+
              'например presets/ из папки проекта.');
    return;
  }
  const res=parsePresetFiles(st.files);
  const sep=/\\/.test(st.dir)?'\\':'/';
  lib.items=res.items.map(it=>({name:it.name,doc:it.doc,path:st.dir.replace(/[\\/]$/,'')+sep+it.name}));
  renderLib();
  const errors=st.errors.concat(res.errors);
  let msg=st.dir+'\nпресетов: '+lib.items.length;
  if(res.skipped.length) msg+=', не ЗЕРНО: '+res.skipped.length+' ('+res.skipped.join(', ')+')';
  if(errors.length) msg+='\nОшибки ('+errors.length+'):\n· '+errors.join('\n· ');
  libStatus(msg,errors.length>0);
}

async function reloadLibrary(){
  applyLibrary(await call('library_state'));
}

/** Подсветка пресета, с которым связан документ. Миниатюры не перерисовываются. */
function markCurrentPreset(){
  const f=boundFile();
  const cards=$('libGrid').children;
  for(let i=0;i<cards.length;i++)
    cards[i].classList.toggle('cur',samePath(lib.items[i]&&lib.items[i].path,f));
}

async function renderLib(){
  const g=$('libGrid');
  g.innerHTML='';
  $('libCount').textContent=lib.items.length;
  const canvases=[], jobs=[];
  for(const it of lib.items){
    const card=el('div','pre');
    const cv=document.createElement('canvas');
    cv.width=248; cv.height=152;   /* ровно 2× к CSS-размеру: без искажения пропорций */
    card.appendChild(cv);
    const nm=el('div','pre-n',it.doc.name);
    card.appendChild(nm);
    const rm=el('div','rm','✕');
    rm.addEventListener('click',e=>{ e.stopPropagation(); guard(()=>removePreset(it)); });
    card.appendChild(rm);
    card.addEventListener('click',()=>{
      try{
        openDocument(cloneDoc(it.doc),it.path,true);
        toast('Открыт: '+it.name+'  ·  Ctrl+Z вернёт прежний документ');
      }catch(err){ toast('Не удалось открыть '+it.name+': '+err.message,true); }
    });
    g.appendChild(card);
    const [tw,th]=thumbDims(it.doc.tile.width,it.doc.tile.height,76);
    canvases.push(cv);
    jobs.push({doc:scaledDoc(it.doc,tw,th),width:tw,height:th});
  }
  markCurrentPreset();
  if(!jobs.length) return;
  let res;
  try{
    res=await renderTiles(jobs);
  }catch(err){
    for(const cv of canvases){
      const ctx=cv.getContext('2d');
      ctx.fillStyle='#2a1010'; ctx.fillRect(0,0,cv.width,cv.height);
      ctx.fillStyle='#ff6b5e'; ctx.font='18px monospace';
      ctx.fillText('ошибка',14,58);
    }
    toast('Миниатюры библиотеки: '+err.message,true);
    return;
  }
  for(let i=0;i<canvases.length;i++) tileInto(canvases[i],res[i]);
}

async function removePreset(it){
  const ok=await tauri().dialog.ask('Удалить файл «'+it.name+'» из папки библиотеки?\nДействие необратимо.',
    {title:'ЗЕРНО — удаление пресета',kind:'warning',okLabel:'Удалить',cancelLabel:'Отмена'});
  if(!ok) return;
  await call('library_delete',{name:it.name});
  toast('Файл удалён: '+it.name);
  await reloadLibrary();
}

function initLib(){
  $('libDir').addEventListener('click',()=>guard(async()=>{
    const st=await call('library_choose');
    if(st) applyLibrary(st);
  }));
  $('libReveal').addEventListener('click',()=>guard(()=>call('library_reveal')));
  $('libReload').addEventListener('click',()=>guard(reloadLibrary));
}
