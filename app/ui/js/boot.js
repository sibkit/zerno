"use strict";
/* ЗЕРНО · встроенный пресет и запуск.
   Загружается последним: восстанавливает сессию, собирает панели, запускает рендер. */


function defaultDocRaw(){
  return {
    format:FORMAT, version:DOC_VERSION, name:'основа · тёмный холст',
    tile:{width:512,height:512},
    render:{stopMix:'oklab',dither:{mode:'tpdf',amount:1},webpQuality:1},
    background:{h:258,s:0.07,l:0.145,a:1},
    channels:[
      {id:'clouds',name:'Облака',enabled:true,blend:'normal',opacity:1,
       noise:{type:'perlin',sizeX:186,sizeY:186,seed:1337,octaves:4,gain:0.52,lacunarity:2,ridged:false,
              warpAmount:38,warpSize:240,worleyMode:'f1',worleyJitter:1,grainHp:3,
              shape:{contrast:0.1,bias:0,gamma:1,invert:false,normalize:true}},
       low:{h:266,s:0.24,l:0.04,a:0.34}, high:{h:198,s:0.30,l:0.60,a:0.13}},
      {id:'cells',name:'Пятна',enabled:true,blend:'soft-light',opacity:0.7,
       noise:{type:'worley',sizeX:78,sizeY:78,seed:20260828,octaves:2,gain:0.45,lacunarity:2,ridged:false,
              warpAmount:14,warpSize:160,worleyMode:'f1',worleyJitter:1,grainHp:3,
              shape:{contrast:0.2,bias:0,gamma:1.1,invert:true,normalize:true}},
       low:{h:38,s:0.35,l:0.30,a:0}, high:{h:38,s:0.45,l:0.72,a:0.3}},
      {id:'grain',name:'Зерно',enabled:true,blend:'normal',opacity:1,
       noise:{type:'grain',sizeX:1,sizeY:1,seed:777,octaves:1,gain:0.5,lacunarity:2,ridged:false,
              warpAmount:0,warpSize:128,worleyMode:'f1',worleyJitter:1,grainHp:4,
              shape:{contrast:0.35,bias:0,gamma:1,invert:false,normalize:true}},
       low:{h:258,s:0.05,l:0,a:0.075}, high:{h:258,s:0.05,l:1,a:0.075}}
    ]
  };
}

async function showEngine(){
  const i=await call('engine_info');
  const e=$('stEngine');
  e.textContent='RUST · '+i.threads+' пот.';
  e.style.color='var(--ok)';
}

function fatal(msg){
  document.body.innerHTML='';
  const pre=document.createElement('pre');
  pre.style.cssText='padding:40px;color:#ff6b5e;font:14px/1.5 monospace;white-space:pre-wrap';
  pre.textContent=msg;
  document.body.appendChild(pre);
}

async function boot(){
  try{ tauri(); }
  catch(e){ fatal(e.message+'\nЗапустите приложение zerno.exe.'); return; }
  let start;
  try{ start=validateDoc(defaultDocRaw(),'встроенный пресет'); }
  catch(e){ fatal('Встроенный пресет не прошёл проверку:\n'+e.message); return; }

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
  catch(e){ toast('Прошлая сессия не восстановлена: '+e.message+'\nОткрыт встроенный пресет.',true); }
  if(session) openDocument(session.doc,session.file,false);
  else openDocument(start,null,false);

  showEngine().catch(e=>toast('Сведения о движке: '+e.message,true));
  call('titlebar_error').then(e=>{ if(e!==null) toast(e,true); })
    .catch(e=>toast('Цвет полосы заголовка: '+e.message,true));
  makeTypeThumbs().catch(e=>toast('Миниатюры типов шума не построены: '+e.message,true));
  reloadLibrary().catch(e=>libStatus('Библиотека: '+e.message,true));
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
else boot();
