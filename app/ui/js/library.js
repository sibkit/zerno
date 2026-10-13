"use strict";
/* ЗЕРНО · библиотека пресетов: папка на диске, которую читает приложение.
   Зависит от doc.js, engine.js, render.js, history.js.
   Папку выбирает пользователь; пока не выбрал — так и написано. */

/* items: {name, path, doc}; state — последний ответ library_state, problems —
   ошибки разбора и пропущенные файлы: подпись под заголовком собирается из них
   заново при смене языка, без перечитывания папки. */
const lib={dir:null,items:[],state:null,problems:null};

function libStatus(txt,isErr){
  const e=$('libStatus');
  e.textContent=txt;
  e.className='lib-status'+(isErr?' err':'');
}

/** Разбор файлов тем же строгим валидатором, что и при открытии.
    errors — ошибки как объекты (ZErr): текст собирается при показе. */
function parsePresetFiles(files){
  const items=[],errors=[],skipped=[];
  for(const f of files){
    let raw;
    try{ raw=JSON.parse(f.text); }
    catch(e){ errors.push(new ZErr('lib.badJson',{name:f.name,detail:e.message})); continue; }
    if(raw===null||typeof raw!=='object'||raw.format!==FORMAT){ skipped.push(f.name); continue; }
    try{ items.push({name:f.name,doc:validateDoc(raw,f.name)}); }
    catch(e){ errors.push(e); }
  }
  return {items,errors,skipped};
}

function samePath(a,b){
  return !!a&&!!b&&a.replace(/\//g,'\\').toLowerCase()===b.replace(/\//g,'\\').toLowerCase();
}

function applyLibrary(st){
  lib.state=st;
  lib.dir=st.dir;
  $('libReveal').disabled=!st.dir;
  $('libReload').disabled=!st.dir;
  if(!st.dir){
    lib.items=[];
    lib.problems=null;
    renderLib();
    updateLibStatus();
    return;
  }
  const res=parsePresetFiles(st.files);
  const sep=/\\/.test(st.dir)?'\\':'/';
  lib.items=res.items.map(it=>({name:it.name,doc:it.doc,path:st.dir.replace(/[\\/]$/,'')+sep+it.name}));
  lib.problems={errors:st.errors.map(toErr).concat(res.errors),skipped:res.skipped};
  renderLib();
  updateLibStatus();
}

/** Подпись под заголовком библиотеки — на текущем языке. */
function updateLibStatus(){
  if(!lib.dir){ libStatus(tr('lib.noDir')); return; }
  const p=lib.problems;
  let msg=lib.dir+'\n'+trn('lib.presets',lib.items.length);
  if(p.skipped.length) msg+=tr('lib.skipped',{n:p.skipped.length,list:p.skipped.join(', ')});
  if(p.errors.length) msg+='\n'+tr('lib.errors',{n:p.errors.length})+'\n· '+p.errors.map(e=>e.message).join('\n· ');
  libStatus(msg,p.errors.length>0);
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
        toast(tr('doc.opened',{name:it.name}));
      }catch(err){ toast(tr('doc.openFail',{name:it.name,err:err.message}),true); }
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
      ctx.fillStyle=cssToken('--danger-bg'); ctx.fillRect(0,0,cv.width,cv.height);
      ctx.fillStyle=cssToken('--danger'); ctx.font='18px monospace';
      ctx.fillText(tr('lib.thumbError'),14,58);
    }
    toast(tr('lib.thumbFail',{err:err.message}),true);
    return;
  }
  for(let i=0;i<canvases.length;i++) tileInto(canvases[i],res[i]);
}

async function removePreset(it){
  const ok=await tauri().dialog.ask(tr('lib.delAsk',{name:it.name}),
    {title:tr('lib.delTitle'),kind:'warning',okLabel:tr('lib.delOk'),cancelLabel:tr('lib.delCancel')});
  if(!ok) return;
  await call('library_delete',{name:it.name});
  toast(tr('lib.deleted',{name:it.name}));
  await reloadLibrary();
}

function initLib(){
  $('libDir').addEventListener('click',()=>guard(async()=>{
    const st=await call('library_choose',{title:tr('dlg.libDir')});
    if(st) applyLibrary(st);
  }));
  $('libReveal').addEventListener('click',()=>guard(()=>call('library_reveal')));
  $('libReload').addEventListener('click',()=>guard(reloadLibrary));
}
