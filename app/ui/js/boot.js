"use strict";
/* ЗЕРНО · встроенный пресет и запуск.
   Загружается последним: восстанавливает сессию, собирает панели, запускает рендер. */


function defaultDocRaw(){
  return {
    format:FORMAT, version:DOC_VERSION, name:tr('preset.default'),
    tile:{width:512,height:512},
    render:{stopMix:'oklab',dither:{mode:'tpdf',amount:1},webpQuality:1},
    background:{h:258,s:0.07,l:0.145,a:1},
    channels:[
      {id:'clouds',name:tr('preset.default.clouds'),enabled:true,blend:'normal',opacity:1,
       noise:{type:'perlin',sizeX:186,sizeY:186,seed:1337,octaves:4,gain:0.52,lacunarity:2,ridged:false,
              warpAmount:38,warpSize:240,worleyMode:'f1',worleyJitter:1,grainHp:3,
              shape:{contrast:0.1,bias:0,gamma:1,invert:false,normalize:true}},
       low:{h:266,s:0.24,l:0.04,a:0.34}, high:{h:198,s:0.30,l:0.60,a:0.13}},
      {id:'cells',name:tr('preset.default.cells'),enabled:true,blend:'soft-light',opacity:0.7,
       noise:{type:'worley',sizeX:78,sizeY:78,seed:20260828,octaves:2,gain:0.45,lacunarity:2,ridged:false,
              warpAmount:14,warpSize:160,worleyMode:'f1',worleyJitter:1,grainHp:3,
              shape:{contrast:0.2,bias:0,gamma:1.1,invert:true,normalize:true}},
       low:{h:38,s:0.35,l:0.30,a:0}, high:{h:38,s:0.45,l:0.72,a:0.3}},
      {id:'grain',name:tr('preset.default.grain'),enabled:true,blend:'normal',opacity:1,
       noise:{type:'grain',sizeX:1,sizeY:1,seed:777,octaves:1,gain:0.5,lacunarity:2,ridged:false,
              warpAmount:0,warpSize:128,worleyMode:'f1',worleyJitter:1,grainHp:4,
              shape:{contrast:0.35,bias:0,gamma:1,invert:false,normalize:true}},
       low:{h:258,s:0.05,l:0,a:0.075}, high:{h:258,s:0.05,l:1,a:0.075}}
    ]
  };
}

let engineThreads=null;
async function showEngine(){
  const i=await call('engine_info');
  engineThreads=i.threads;
  showEngineText();
}
function showEngineText(){
  if(engineThreads===null) return;
  const e=$('stEngine');
  e.textContent=tr('st.engineVal',{n:engineThreads});
  e.style.color='var(--ok)';
}

/* ---------------- язык ---------------- */

/** Надписи разметки: data-i18n — текст, data-i18n-ph — подсказка в пустом поле. */
function applyStaticText(){
  for(const e of document.querySelectorAll('[data-i18n]')) e.textContent=tr(e.dataset.i18n);
  for(const e of document.querySelectorAll('[data-i18n-ph]')) e.placeholder=tr(e.dataset.i18nPh);
  /* в логотипе выделена четвёртая буква: ЗЕР·Н·О, ZER·N·O */
  const b=tr('app.brand'), m=$('brandMark');
  m.textContent=b.slice(0,3);
  m.appendChild(el('b',null,b.slice(3,4)));
  m.appendChild(document.createTextNode(b.slice(4)));
  document.title=tr('app.title');
  tauri().window.getCurrentWindow().setTitle(tr('app.title'))
    .catch(e=>toast(tr('lang.titleFail',{err:toErr(e).message}),true));
}

function initLangSelect(){
  const s=$('lang');
  for(const code of LANG_ORDER){
    const o=document.createElement('option');
    o.value=code; o.textContent=LANGS[code].name;
    s.appendChild(o);
  }
  s.value=lang;
  s.addEventListener('change',()=>guard(()=>switchLang(s.value)));
}

/** Смена языка на ходу: всё, где есть текст, собирается заново. Документ,
    имена каналов и пресетов — данные пользователя, они не переводятся. */
function switchLang(code){
  setLang(code);
  localStorage.setItem(LANG_KEY,code);
  applyStaticText();
  renderHelp();
  buildLeft();
  updateDirty();
  updateLibStatus();
  showEngineText();
  scheduleRender();
}

function fatal(msg){
  document.body.innerHTML='';
  const pre=document.createElement('pre');
  pre.style.cssText='padding:40px;color:#ff6b5e;font:14px/1.5 monospace;white-space:pre-wrap';
  pre.textContent=msg;
  document.body.appendChild(pre);
}

async function boot(){
  const picked=pickLang();
  setLang(picked.code);
  try{ tauri(); }
  catch(e){ fatal(e.message+'\n'+tr('boot.runExe')); return; }
  let start;
  try{ start=validateDoc(defaultDocRaw(),tr('src.default')); }
  catch(e){ fatal(tr('boot.badDefault',{err:e.message})); return; }

  applyStaticText();
  initLangSelect();
  if(picked.bad!==null) toast(tr('lang.badSaved',{code:picked.bad}),true);
  initColorMode();

  initHistory();
  initStage();
  initLib();
  initExport();
  initKeys();
  initHelp();
  document.addEventListener('zerno:colormode',()=>buildLeft());
  $('stageView').style.background=surroundColor(1);

  let session=null;
  try{ session=readSession(); }
  catch(e){ toast(tr('session.restoreFail',{err:e.message}),true); }
  if(session) openDocument(session.doc,session.file,false);
  else openDocument(start,null,false);

  showEngine().catch(e=>toast(tr('engine.infoFail',{err:e.message}),true));
  call('titlebar_error').then(e=>{ if(e!==null) toast(toErr(e).message,true); })
    .catch(e=>toast(tr('titlebar.fail',{err:e.message}),true));
  makeTypeThumbs().catch(e=>toast(tr('thumbs.typeFail',{err:e.message}),true));
  reloadLibrary().catch(e=>libStatus(tr('lib.fail',{err:e.message}),true));
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
else boot();
