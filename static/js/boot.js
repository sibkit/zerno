"use strict";
/* ЗЕРНО · встроенный пресет, зерно на хроме панелей и запуск.
   Загружается последним: собирает панели, определяет движок, запускает рендер. */


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

function makeChromeGrain(){
  const g=validateDoc({
    format:FORMAT,version:DOC_VERSION,name:'ui',
    tile:{width:128,height:128},
    render:{stopMix:'srgb-linear',dither:{mode:'off',amount:0},webpQuality:1},
    background:{h:0,s:0,l:0.5,a:1},
    channels:[{id:'g',name:'g',enabled:true,blend:'normal',opacity:1,
      noise:{type:'grain',sizeX:1,sizeY:1,seed:4242,octaves:1,gain:0.5,lacunarity:2,ridged:false,
             warpAmount:0,warpSize:128,worleyMode:'f1',worleyJitter:1,grainHp:2,
             shape:{contrast:0,bias:0,gamma:1,invert:false,normalize:true}},
      low:{h:0,s:0,l:0.44,a:1},high:{h:0,s:0,l:0.56,a:1}}]
  },'ui-grain');
  const url=renderToCanvas(g).toDataURL('image/png');
  document.documentElement.style.setProperty('--grain','url("'+url+'")');
}

async function initLibrarySource(){
  if(engineInfo.mode==='zig'){
    try{
      await loadLibraryFromServer();
      return;
    }catch(e){ libStatus('Сервер не отдал библиотеку: '+e.message,'err'); }
  }
  try{
    if(await restoreDir()) return;
  }catch(e){ libStatus('Не удалось восстановить папку: '+e.message,'err'); }
  try{
    if(await tryHttpIndex()) return;
  }catch(e){ libStatus('./noises/: '+e.message,'err'); }
  libStatus('Папка не подключена. «Папка» — Chrome/Edge, с сохранением обратно. '+
            '«Обзор…» — любой браузер, только чтение. По http:// список берётся из ./noises/index.json.');
}

function showEngine(){
  const e=$('stEngine');
  if(engineInfo.mode==='zig'){
    e.textContent='ZIG · '+engineInfo.threads+' пот.';
    e.style.color='var(--ok)';
    e.title='zerno.exe '+engineInfo.version+' (Zig '+engineInfo.zig+'), потоков: '+engineInfo.threads;
  }else{
    e.textContent='JS · браузер';
    e.style.color='var(--acc)';
    e.title='Считает браузер: '+engineInfo.reason+
      '. Для нативной скорости запустите zerno.exe и откройте http://127.0.0.1:8787/';
  }
}

async function boot(){
  try{
    doc=validateDoc(defaultDocRaw(),'встроенный пресет');
  }catch(e){
    document.body.innerHTML='<pre style="padding:40px;color:#ff5f52;font:14px monospace">'+
      'Встроенный пресет не прошёл проверку:\n'+e.message+'</pre>';
    return;
  }
  $('docName').value=doc.name;
  buildLeft();
  initStage();
  initLib();
  initExport();
  $('stageView').style.background=SURROUND[1];
  try{ makeChromeGrain(); }
  catch(e){ console.warn('Фоновое зерно интерфейса не построено:',e); }

  await detectEngine();
  showEngine();
  scheduleRender();
  initLibrarySource();
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
else boot();
