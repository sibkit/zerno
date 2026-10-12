"use strict";
/* ЗЕРНО · состояние документа и панели левой колонки.
   Зависит от model.js, doc.js, ui-kit.js, history.js. */


let doc=null;
const cardState={};      /* id -> {open} */
const cardRefs={};       /* id -> {thumb,meta,warn,card} */

function minSizeFor(type){ return type==='grain'?0.5:MIN_CELL_PX; }
function scaleNoiseInPlace(n,kx,ky){
  const k=Math.min(kx,ky), ms=minSizeFor(n.type);
  n.sizeX=Math.max(ms,n.sizeX*kx);
  n.sizeY=Math.max(ms,n.sizeY*ky);
  n.warpSize=Math.max(1,n.warpSize*k);
  n.warpAmount=n.warpAmount*k;
  n.grainHp=Math.max(0,Math.round(n.grainHp*k));
}
/** Уменьшенная копия документа: миниатюра выглядит как та же текстура. */
function scaledDoc(d,tw,th){
  const c=rawClone(d);
  const kx=tw/d.tile.width, ky=th/d.tile.height;
  c.tile={width:tw,height:th};
  for(const ch of c.channels) scaleNoiseInPlace(ch.noise,kx,ky);
  return c;
}
function soloDoc(d,id){
  const c=rawClone(d);
  c.channels=c.channels.filter(x=>x.id===id);
  for(const x of c.channels) x.enabled=true;
  return c;
}

/* ---------------------- левая колонка ---------------------- */

function buildLeft(){
  const root=$('colLeft');
  root.innerHTML='';
  for(const k in cardRefs) delete cardRefs[k];
  buildTileSection(root);
  buildBgSection(root);
  buildChannelsSection(root);
  buildOutSection(root);
}

const TILE_PRESETS=[64,128,192,256,384,512,768,1024];

function buildTileSection(root){
  const s=makeSection(root,'tile','Плитка');
  const chips=el('div','chips');
  for(const p of TILE_PRESETS){
    const c=el('div','chip',p+'²');
    c.dataset.side=p;
    if(doc.tile.width===p&&doc.tile.height===p) c.classList.add('on');
    c.addEventListener('click',()=>{ doc.tile.width=p; doc.tile.height=p; buildLeft(); changed(); });
    chips.appendChild(c);
  }
  s.body.appendChild(chips);
  /* Ползунок не пересобирает колонку: раньше пересборка уничтожала сам
     ползунок, и перетаскивание обрывалось после первого шага. */
  const upd=()=>{
    for(const c of chips.children) c.classList.toggle('on',+c.dataset.side===doc.tile.width&&+c.dataset.side===doc.tile.height);
    s.count.textContent=doc.tile.width+'×'+doc.tile.height;
    changed();
  };
  makeRow(s.body,{label:'Ширина',min:TILE_MIN,max:TILE_MAX,step:1,hint:HINTS.tileSide,get:()=>doc.tile.width,set:v=>doc.tile.width=v,onInput:upd});
  makeRow(s.body,{label:'Высота',min:TILE_MIN,max:TILE_MAX,step:1,hint:HINTS.tileSide,get:()=>doc.tile.height,set:v=>doc.tile.height=v,onInput:upd});
  s.body.appendChild(el('div','hint',
    'Стыковка точная при любом размере: решётка шума кратна плитке по построению.'));
  s.count.textContent=doc.tile.width+'×'+doc.tile.height;
}

function buildBgSection(root){
  const s=makeSection(root,'bg','Фон плитки');
  makeColorEditor(s.body,'background','фон',doc.background,()=>{
    s.count.textContent=okhslToHex(doc.background);
    changed();
  });
  s.body.appendChild(el('div','hint','A < 1 даёт прозрачный фон в PNG/WebP.'));
  s.count.textContent=okhslToHex(doc.background);
}

function buildChannelsSection(root){
  const s=makeSection(root,'chans','Шумовые каналы');
  const list=el('div','chans');
  s.body.appendChild(list);
  for(const ch of doc.channels) list.appendChild(buildCard(ch));
  const add=el('div','chips');
  add.style.marginTop='9px';
  for(const t of Object.keys(NOISE_TYPES)){
    const c=el('div','chip chip-add','+ '+NOISE_TYPES[t].label);
    const th=el('span','chip-thumb');
    th.dataset.type=t;
    if(typeThumbs[t]) th.style.backgroundImage='url("'+typeThumbs[t]+'")';
    c.prepend(th);
    c.dataset.hint='Добавить канал: '+NOISE_TYPES[t].label+'.';
    c.addEventListener('click',()=>{
      const ch=factoryChannel(t);
      cardState[ch.id]={open:true};
      doc.channels.push(ch);
      buildLeft(); changed();
    });
    add.appendChild(c);
  }
  s.body.appendChild(add);
  s.count.textContent=doc.channels.length;
}

/* Миниатюры типов шума для кнопок «+ канал»: тип → data-URL. */
const typeThumbs={};
const TYPE_THUMB_PX=36;   /* вдвое больше CSS-размера — чётко на HiDPI */

/** Один раз при запуске: каждый тип с контрастными серыми цветами. */
async function makeTypeThumbs(){
  const types=Object.keys(NOISE_TYPES);
  const jobs=types.map(t=>{
    const noise=factoryNoise(t);
    noise.seed=7;   /* постоянный узор: превью типа не должно меняться от запуска к запуску */
    const d=validateDoc({
      format:FORMAT,version:DOC_VERSION,name:'тип '+t,
      tile:{width:256,height:256},
      render:{stopMix:'oklab',dither:{mode:'off',amount:0},webpQuality:1},
      background:{h:0,s:0,l:0.12,a:1},
      channels:[{id:'t',name:t,enabled:true,blend:'normal',opacity:1,noise:noise,
        low:{h:250,s:0.05,l:0.18,a:1},high:{h:250,s:0.05,l:0.86,a:1}}]
    },'миниатюра типа '+t);
    return {doc:scaledDoc(d,TYPE_THUMB_PX,TYPE_THUMB_PX),width:TYPE_THUMB_PX,height:TYPE_THUMB_PX};
  });
  const res=await renderTiles(jobs);
  types.forEach((t,i)=>{ typeThumbs[t]=tileToCanvas(res[i]).toDataURL('image/png'); });
  for(const th of document.querySelectorAll('.chip-thumb[data-type]'))
    th.style.backgroundImage='url("'+typeThumbs[th.dataset.type]+'")';
}

function moveChannel(ch,dir){
  const i=doc.channels.indexOf(ch);
  const j=i+dir;
  if(j<0||j>=doc.channels.length) return;
  doc.channels.splice(i,1);
  doc.channels.splice(j,0,ch);
  buildLeft(); changed();
}

function buildCard(ch){
  const card=el('div','card');
  const st=cardState[ch.id]||(cardState[ch.id]={open:false});
  if(st.open) card.classList.add('open');
  if(!ch.enabled) card.classList.add('off');

  const head=el('div','card-h');
  const cv=document.createElement('canvas');
  cv.className='thumb'; cv.width=76; cv.height=76;
  const t=el('div','card-t');
  const nm=document.createElement('input');
  nm.className='card-name'; nm.value=ch.name; nm.spellcheck=false;
  nm.addEventListener('input',()=>{ ch.name=nm.value; noteChange(); });
  const meta=el('div','card-meta');
  const rampEl=el('div','card-ramp');
  t.append(nm,meta,rampEl);

  const acts=el('div','card-a');
  const eye=el('button','ibtn'+(ch.enabled?' on':''),ch.enabled?'●':'○');
  eye.title='Включить / выключить канал';
  eye.addEventListener('click',()=>{
    ch.enabled=!ch.enabled;
    eye.textContent=ch.enabled?'●':'○';
    eye.classList.toggle('on',ch.enabled);
    card.classList.toggle('off',!ch.enabled);
    changed();
  });
  const up=el('button','ibtn','↑'); up.title='Выше';
  up.addEventListener('click',()=>moveChannel(ch,-1));
  const dn=el('button','ibtn','↓'); dn.title='Ниже';
  dn.addEventListener('click',()=>moveChannel(ch,1));
  const cp=el('button','ibtn','⧉'); cp.title='Дублировать';
  cp.addEventListener('click',()=>{
    const c=JSON.parse(JSON.stringify(ch));
    c.id=uid(); c.name=ch.name+' копия'; c.noise.seed=(Math.random()*2147483647)|0;
    cardState[c.id]={open:true};
    doc.channels.splice(doc.channels.indexOf(ch)+1,0,c);
    buildLeft(); changed();
  });
  const del=el('button','ibtn del','✕'); del.title='Удалить';
  del.addEventListener('click',()=>{
    doc.channels.splice(doc.channels.indexOf(ch),1);
    delete cardState[ch.id]; delete cardRefs[ch.id];
    buildLeft(); changed();
  });
  acts.append(eye,up,dn,cp,del);
  head.append(cv,t,acts,el('span','card-chev'));
  head.dataset.hint='Клик по карточке — развернуть или свернуть параметры канала. Имя редактируется прямо в заголовке.';

  head.addEventListener('click',e=>{
    if(e.target.closest('input,button')) return;
    st.open=!st.open;
    card.classList.toggle('open',st.open);
  });

  const body=el('div','card-b');
  const warn=el('div','warn');
  warn.style.display='none';
  card.append(head,body);
  cardRefs[ch.id]={thumb:cv,meta:meta,warn:warn,card:card,ramp:rampEl};
  updateRamp(ch);
  fillCardBody(ch,body,warn);
  return card;
}

function fillCardBody(ch,body,warn){
  body.innerHTML='';
  body.appendChild(warn);
  const n=ch.noise;
  const info=NOISE_TYPES[n.type];
  const upd=()=>changed();
  const rebuild=()=>{ fillCardBody(ch,body,warn); changed(); };

  subHead(body,'Шум');
  hint(makeSelect(body,'Тип',mapLabels(NOISE_TYPES),()=>n.type,v=>{
    n.type=v;
    if(v==='grain'&&n.sizeX>16){ n.sizeX=2; n.sizeY=2; }
    if(v!=='grain'&&n.sizeX<8){ n.sizeX=64; n.sizeY=64; }
  },rebuild),HINTS.type);

  cardRefs[ch.id].sizeRows=[sizeRow(body,n,'x',upd),sizeRow(body,n,'y',upd)];
  const link=el('div','chips');
  const lb=el('div','chip','связать X=Y');
  lb.dataset.hint='Сделать размер по Y таким же, как по X.';
  lb.addEventListener('click',()=>{ n.sizeY=n.sizeX; rebuild(); });
  link.appendChild(lb);
  body.appendChild(link);

  seedRow(body,n,upd);

  if(info.octaves){
    makeRow(body,{label:'Октавы',min:1,max:10,step:1,get:()=>n.octaves,set:v=>n.octaves=v,onInput:upd,hint:HINTS.octaves});
    makeRow(body,{label:'Затухание',min:0,max:1,step:0.01,get:()=>n.gain,set:v=>n.gain=v,onInput:upd,hint:HINTS.gain});
    makeRow(body,{label:'Лакунарн.',min:2,max:4,step:1,get:()=>n.lacunarity,set:v=>n.lacunarity=v,onInput:upd,hint:HINTS.lacunarity});
  }
  if(info.ridged) hint(makeCheck(body,'Гребни (ridged)',()=>n.ridged,v=>n.ridged=v,upd).el,HINTS.ridged);

  if(n.type==='worley'){
    hint(makeSelect(body,'Режим',WORLEY_MODES,()=>n.worleyMode,v=>n.worleyMode=v,upd),HINTS.worleyMode);
    makeRow(body,{label:'Разброс',min:0,max:1,step:0.01,get:()=>n.worleyJitter,set:v=>n.worleyJitter=v,onInput:upd,hint:HINTS.jitter});
  }
  if(n.type==='grain'){
    makeRow(body,{label:'ВЧ-фильтр',min:0,max:64,step:1,get:()=>n.grainHp,set:v=>n.grainHp=v,onInput:upd,hint:HINTS.grainHp});
    body.appendChild(el('div','hint','0 — белый шум. >0 — «синее» зерно: убирает низкие частоты, из-за которых повтор плитки становится заметен.'));
  }
  if(info.warp){
    makeRow(body,{label:'Искажение',min:0,max:400,step:1,get:()=>n.warpAmount,set:v=>n.warpAmount=v,onInput:upd,hint:HINTS.warp});
    if(n.warpAmount>0)
      makeRow(body,{label:'Масштаб иск.',min:2,max:2048,step:1,get:()=>n.warpSize,set:v=>n.warpSize=v,onInput:upd,hint:HINTS.warpSize});
  }

  subHead(body,'Форма');
  const sh=n.shape;
  makeRow(body,{label:'Контраст',min:-1,max:1,step:0.01,get:()=>sh.contrast,set:v=>sh.contrast=v,onInput:upd,hint:HINTS.contrast});
  makeRow(body,{label:'Смещение',min:-0.5,max:0.5,step:0.005,get:()=>sh.bias,set:v=>sh.bias=v,onInput:upd,hint:HINTS.bias});
  makeRow(body,{label:'Гамма',min:0.1,max:8,step:0.01,get:()=>sh.gamma,set:v=>sh.gamma=v,onInput:upd,hint:HINTS.gamma});
  hint(makeCheck(body,'Инверсия',()=>sh.invert,v=>sh.invert=v,upd).el,HINTS.invert);
  hint(makeCheck(body,'Нормализация диапазона',()=>sh.normalize,v=>sh.normalize=v,upd).el,HINTS.normalize);

  subHead(body,'Цвет');
  buildStops(body,ch,()=>{ updateRamp(ch); upd(); });

  subHead(body,'Слой');
  hint(makeSelect(body,'Смешив.',BLEND_MODES,()=>ch.blend,v=>ch.blend=v,upd),HINTS.blend);
  makeRow(body,{label:'Непрозр.',min:0,max:1,step:0.005,get:()=>ch.opacity,set:v=>ch.opacity=v,onInput:upd,hint:HINTS.opacity});
}

/* Пояснения к параметрам — показываются в строке подсказок внизу окна. */
const HINTS={
  type:'Перлин — облака, Value — мягкие пятна, Ворлей — пятна и ячейки вокруг случайных точек, Зерно — плёночное зерно.',
  size:'Размер пятна, px. На плитку ложится целое число ячеек — иначе был бы шов, поэтому размер меняется ступенями. Под подписью — сколько ячеек сейчас.',
  grainSize:'Размер зерна, px. На плитку ложится целое число зёрен, поэтому размер меняется ступенями.',
  seed:'Номер варианта случайного узора: тот же номер — тот же узор. ⟳ — новый случайный.',
  octaves:'Сколько слоёв всё более мелких деталей наложено друг на друга. Больше — богаче мелочь.',
  gain:'Во сколько раз каждая следующая октава слабее предыдущей (gain).',
  lacunarity:'Во сколько раз каждая следующая октава мельче предыдущей (lacunarity).',
  ridged:'Гребни: вместо облаков — складки и хребты (шум отражается от середины).',
  worleyMode:'F1 — пятна вокруг точек, F2 — расстояние до второй точки, F2−F1 — границы ячеек: трещины, сетка.',
  jitter:'Насколько точки сдвинуты от центров ячеек: 0 — ровная сетка, 1 — полный беспорядок.',
  grainHp:'Фильтр высоких частот, радиус в px: убирает крупные пятна из зерна, повтор плитки становится незаметнее.',
  warp:'Искажение: узор сдвигается другим, крупным шумом — линии становятся текучими, «мраморными». Сила сдвига, px.',
  warpSize:'Размер волн искажения, px.',
  contrast:'Контраст: растягивает (>0) или сжимает (<0) разброс значений вокруг середины.',
  bias:'Смещение: сдвигает весь узор к цвету слабого или сильного шума.',
  gamma:'Гамма: больше 1 — больше цвета слабого шума, меньше 1 — больше цвета сильного.',
  invert:'Инверсия: слабые и сильные места меняются местами.',
  normalize:'Нормализация: фактический разброс шума растягивается на всю шкалу цветов.',
  blend:'Как канал ложится на то, что под ним. Каналы накладываются сверху вниз по списку.',
  opacity:'Непрозрачность канала целиком.',
  stopLow:'Цвет там, где шум слабый (значение 0). Клик — правка цвета.',
  stopHigh:'Цвет там, где шум сильный (значение 1). Клик — правка цвета.',
  stopRamp:'Как цвет меняется от слабого шума к сильному.',
  stopSwap:'Поменять цвета местами.',
  tileSide:'Сторона плитки, px. Стыковка точная при любом размере.',
  stopMix:'В каком пространстве смешиваются два цвета канала: OKLab — ровно на глаз, линейный sRGB — как свет физически.',
  dither:'Дизеринг убирает полосы на плавных переходах при переводе в 8 бит.',
  ditherAmount:'Сила дизеринга, в единицах младшего бита.',
  webpQuality:'Качество WEBP: 1.00 — без потерь.'
};

/** Пояснение для строки подсказок — на строку поля или флажок целиком. */
function hint(node,text){
  if(!text) throw new Error('hint: пустое пояснение');
  const host=node.classList.contains('row')||node.classList.contains('chk')?node:node.closest('.row');
  if(!host) throw new Error('hint: элемент не в строке поля');
  host.dataset.hint=text;
  return node;
}

function plural(n,one,few,many){
  const a=n%10, b=n%100;
  if(a===1&&b!==11) return one;
  if(a>=2&&a<=4&&(b<12||b>14)) return few;
  return many;
}

/**
 * Размер по оси: ползунок в логарифмической шкале ходит только по допустимым
 * значениям «сторона / целое число ячеек» — ровно по тем, что различает движок.
 */
function sizeRow(body,n,axis,upd){
  const key=axis==='x'?'sizeX':'sizeY';
  const D=()=>axis==='x'?doc.tile.width:doc.tile.height;
  const grain=n.type==='grain';
  return makeRow(body,{
    label:(grain?'Зерно ':'Пятно ')+axis.toUpperCase(),
    step:0.1,decimals:1,log:true,
    min:()=>D()/maxCellsFor(n.type,D()), max:()=>D(),
    snap:v=>D()/cellsFor(n.type,v,D()),
    get:()=>n[key], set:v=>{ n[key]=v; }, onInput:upd,
    note:()=>{ const c=cellsFor(n.type,n[key],D()); return c+' '+plural(c,'ячейка','ячейки','ячеек'); },
    hint:grain?HINTS.grainSize:HINTS.size
  });
}

/**
 * Цвета канала — полоса градиента с двумя ручками: слева цвет слабого шума,
 * справа сильного. Клик по ручке открывает её редактор, повторный — прячет.
 */
function buildStops(body,ch,onChange){
  const st=cardState[ch.id];
  const bar=el('div','stops');
  const ed=el('div','stops-ed');
  const mk=(k,txt,h)=>{
    const b=el('button','stop stop-'+k);
    const sw=el('span','ok-sw'), i=document.createElement('i');
    sw.appendChild(i);
    b.append(sw,el('span','stop-t',txt));
    b.dataset.hint=h;
    b.addEventListener('click',()=>{ st.stop=st.stop===k?null:k; paint(); showEditor(); });
    return {b,i};
  };
  const lo=mk('low','слабый',HINTS.stopLow), hi=mk('high','сильный',HINTS.stopHigh);
  const ramp=el('div','stops-ramp');
  ramp.dataset.hint=HINTS.stopRamp;
  const swap=el('button','ibtn','⇄');
  swap.dataset.hint=HINTS.stopSwap;
  swap.addEventListener('click',()=>{
    const a=ch.low; ch.low=ch.high; ch.high=a;
    paint(); showEditor(); onChange();
  });
  bar.append(lo.b,ramp,hi.b,swap);
  body.append(bar,ed);

  function paint(){
    lo.i.style.background=okhslToCss(ch.low);
    hi.i.style.background=okhslToCss(ch.high);
    ramp.style.setProperty('--ramp',rampCss(ch));
    lo.b.classList.toggle('on',st.stop==='low');
    hi.b.classList.toggle('on',st.stop==='high');
  }
  function showEditor(){
    ed.innerHTML='';
    if(!st.stop) return;
    const key=ch.id+':'+st.stop;
    okOpen[key]=true;
    makeColorEditor(ed,key,st.stop==='low'?'слабый шум · 0':'сильный шум · 1',ch[st.stop],()=>{ paint(); onChange(); });
  }
  paint(); showEditor();
}


/** Полоса «низ → верх» в шапке карточки, в том же пространстве смешивания. */
function rampCss(ch){
  const space=doc.render.stopMix==='oklab'?'oklab':'srgb-linear';
  return 'linear-gradient(in '+space+' 90deg,'+okhslToCss(ch.low)+','+okhslToCss(ch.high)+')';
}
function updateRamp(ch){
  const r=cardRefs[ch.id];
  if(!r) return;
  r.ramp.style.setProperty('--ramp',rampCss(ch));
}

function mapLabels(types){
  const m={};
  for(const k of Object.keys(types)) m[k]=types[k].label;
  return m;
}

function seedRow(parent,n,onInput){
  const r=el('div','row');
  r.appendChild(el('label',null,'Сид'));
  r.dataset.hint=HINTS.seed;
  const inp=document.createElement('input');
  inp.type='text'; inp.className='num'; inp.spellcheck=false;
  inp.style.textAlign='left'; inp.style.cursor='text';
  inp.value=String(n.seed);
  inp.addEventListener('change',()=>{
    const t=inp.value.trim();
    const v=Number(t);
    /* Только целое в диапазоне int32: раньше 3000000000 молча превращалось
       в отрицательное число через |0. */
    if(!/^-?\d+$/.test(t)||v<-2147483648||v>2147483647){
      inp.classList.add('bad');
      toast('Сид — целое число от −2147483648 до 2147483647, получено «'+t+'».',true);
      return;
    }
    inp.classList.remove('bad');
    n.seed=v; onInput();
  });
  inp.addEventListener('blur',()=>{ inp.classList.remove('bad'); inp.value=String(n.seed); });
  const b=el('button','btn sm','⟳');
  b.title='Новый случайный сид';
  b.style.width='100%'; b.style.justifyContent='center';
  b.addEventListener('click',()=>{
    n.seed=(Math.random()*2147483647)|0;
    inp.value=String(n.seed); onInput();
  });
  r.append(inp,b);
  parent.appendChild(r);
}

function buildOutSection(root){
  const s=makeSection(root,'out','Вывод');
  const upd=()=>changed();
  hint(makeSelect(s.body,'Смешив.',STOP_MIX,()=>doc.render.stopMix,v=>doc.render.stopMix=v,()=>{ buildLeft(); changed(); }),HINTS.stopMix);
  s.body.appendChild(el('div','hint','Переход от цвета слабого шума к цвету сильного. Режимы наложения слоёв всегда считаются в линейном свете.'));
  subHead(s.body,'Дизеринг');
  hint(makeSelect(s.body,'Режим',DITHER_MODES,()=>doc.render.dither.mode,v=>doc.render.dither.mode=v,()=>{ buildLeft(); changed(); }),HINTS.dither);
  if(doc.render.dither.mode!=='off')
    makeRow(s.body,{label:'Сила, LSB',min:0,max:4,step:0.05,get:()=>doc.render.dither.amount,set:v=>doc.render.dither.amount=v,onInput:upd,hint:HINTS.ditherAmount});
  s.body.appendChild(el('div','hint','Убирает полосы (бэндинг) на плавных градиентах при переводе в 8 бит.'));
  subHead(s.body,'WebP');
  makeRow(s.body,{label:'Качество',min:0,max:1,step:0.01,get:()=>doc.render.webpQuality,set:v=>doc.render.webpQuality=v,hint:HINTS.webpQuality});
  s.body.appendChild(el('div','hint','1.00 — Chromium кодирует WebP без потерь.'));
}

