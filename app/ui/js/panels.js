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
  const s=makeSection(root,'tile','Плитка','tile');
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
  makeRow(s.body,{label:'Ширина',min:TILE_MIN,max:TILE_MAX,step:1,get:()=>doc.tile.width,set:v=>doc.tile.width=v,onInput:upd});
  makeRow(s.body,{label:'Высота',min:TILE_MIN,max:TILE_MAX,step:1,get:()=>doc.tile.height,set:v=>doc.tile.height=v,onInput:upd});
  s.count.textContent=doc.tile.width+'×'+doc.tile.height;
}

function buildBgSection(root){
  const s=makeSection(root,'bg','Фон плитки','bg');
  makeColorEditor(s.body,'background','фон',doc.background,()=>{
    s.count.textContent=okhslToHex(doc.background);
    changed();
  });
  s.count.textContent=okhslToHex(doc.background);
}

function buildChannelsSection(root){
  const s=makeSection(root,'chans','Шумовые каналы','chans');
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
  eye.addEventListener('click',()=>{
    ch.enabled=!ch.enabled;
    eye.textContent=ch.enabled?'●':'○';
    eye.classList.toggle('on',ch.enabled);
    card.classList.toggle('off',!ch.enabled);
    changed();
  });
  const up=el('button','ibtn','↑');
  up.addEventListener('click',()=>moveChannel(ch,-1));
  const dn=el('button','ibtn','↓');
  dn.addEventListener('click',()=>moveChannel(ch,1));
  const cp=el('button','ibtn','⧉');
  cp.addEventListener('click',()=>{
    const c=JSON.parse(JSON.stringify(ch));
    c.id=uid(); c.name=ch.name+' копия'; c.noise.seed=(Math.random()*2147483647)|0;
    cardState[c.id]={open:true};
    doc.channels.splice(doc.channels.indexOf(ch)+1,0,c);
    buildLeft(); changed();
  });
  const del=el('button','ibtn del','✕');
  del.addEventListener('click',()=>{
    doc.channels.splice(doc.channels.indexOf(ch),1);
    delete cardState[ch.id]; delete cardRefs[ch.id];
    buildLeft(); changed();
  });
  acts.append(eye,up,dn,cp,del);
  head.append(cv,t,acts,el('span','card-chev'));

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

  subHead(body,'Шум','noise');
  makeSelect(body,'Тип',mapLabels(NOISE_TYPES),()=>n.type,v=>{
    n.type=v;
    if(v==='grain'&&n.sizeX>16){ n.sizeX=2; n.sizeY=2; }
    if(v!=='grain'&&n.sizeX<8){ n.sizeX=64; n.sizeY=64; }
  },rebuild);

  cardRefs[ch.id].sizeRows=[sizeRow(body,n,'x',upd),sizeRow(body,n,'y',upd)];
  const link=el('div','chips');
  const lb=el('div','chip','связать X=Y');
  lb.addEventListener('click',()=>{ n.sizeY=n.sizeX; rebuild(); });
  link.appendChild(lb);
  body.appendChild(link);

  seedRow(body,n,upd);

  if(info.octaves){
    makeRow(body,{label:'Октавы',min:1,max:10,step:1,get:()=>n.octaves,set:v=>n.octaves=v,onInput:upd});
    makeRow(body,{label:'Затухание',min:0,max:1,step:0.01,get:()=>n.gain,set:v=>n.gain=v,onInput:upd});
    makeRow(body,{label:'Лакунарн.',min:2,max:4,step:1,get:()=>n.lacunarity,set:v=>n.lacunarity=v,onInput:upd});
  }
  if(info.ridged) makeCheck(body,'Гребни (ridged)',()=>n.ridged,v=>n.ridged=v,upd);

  if(n.type==='worley'){
    makeSelect(body,'Режим',WORLEY_MODES,()=>n.worleyMode,v=>n.worleyMode=v,upd);
    makeRow(body,{label:'Разброс',min:0,max:1,step:0.01,get:()=>n.worleyJitter,set:v=>n.worleyJitter=v,onInput:upd});
  }
  if(n.type==='grain'){
    makeRow(body,{label:'ВЧ-фильтр',min:0,max:64,step:1,get:()=>n.grainHp,set:v=>n.grainHp=v,onInput:upd});
  }
  if(info.warp){
    makeRow(body,{label:'Искажение',min:0,max:400,step:1,get:()=>n.warpAmount,set:v=>n.warpAmount=v,onInput:upd});
    if(n.warpAmount>0)
      makeRow(body,{label:'Масштаб иск.',min:2,max:2048,step:1,get:()=>n.warpSize,set:v=>n.warpSize=v,onInput:upd});
  }

  subHead(body,'Форма','shape');
  const sh=n.shape;
  makeRow(body,{label:'Контраст',min:-1,max:1,step:0.01,get:()=>sh.contrast,set:v=>sh.contrast=v,onInput:upd});
  makeRow(body,{label:'Смещение',min:-0.5,max:0.5,step:0.005,get:()=>sh.bias,set:v=>sh.bias=v,onInput:upd});
  makeRow(body,{label:'Гамма',min:0.1,max:8,step:0.01,get:()=>sh.gamma,set:v=>sh.gamma=v,onInput:upd});
  makeCheck(body,'Инверсия',()=>sh.invert,v=>sh.invert=v,upd);
  makeCheck(body,'Нормализация диапазона',()=>sh.normalize,v=>sh.normalize=v,upd);

  subHead(body,'Цвет','color');
  buildStops(body,ch,()=>{ updateRamp(ch); upd(); });

  subHead(body,'Слой','layer');
  makeSelect(body,'Смешив.',BLEND_MODES,()=>ch.blend,v=>ch.blend=v,upd);
  makeRow(body,{label:'Непрозр.',min:0,max:1,step:0.005,get:()=>ch.opacity,set:v=>ch.opacity=v,onInput:upd});
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
    note:()=>{ const c=cellsFor(n.type,n[key],D()); return c+' '+plural(c,'ячейка','ячейки','ячеек'); }
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
  const mk=(k,txt)=>{
    const b=el('button','stop stop-'+k);
    const sw=el('span','ok-sw'), i=document.createElement('i');
    sw.appendChild(i);
    b.append(sw,el('span','stop-t',txt));
    b.addEventListener('click',()=>{ st.stop=st.stop===k?null:k; paint(); showEditor(); });
    return {b,i};
  };
  const lo=mk('low','слабый'), hi=mk('high','сильный');
  const ramp=el('div','stops-ramp');
  const swap=el('button','ibtn','⇄');
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
  b.style.width='100%'; b.style.justifyContent='center';
  b.addEventListener('click',()=>{
    n.seed=(Math.random()*2147483647)|0;
    inp.value=String(n.seed); onInput();
  });
  r.append(inp,b);
  parent.appendChild(r);
}

function buildOutSection(root){
  const s=makeSection(root,'out','Вывод','out');
  const upd=()=>changed();
  makeSelect(s.body,'Смешив.',STOP_MIX,()=>doc.render.stopMix,v=>doc.render.stopMix=v,()=>{ buildLeft(); changed(); });
  subHead(s.body,'Дизеринг',null);
  makeSelect(s.body,'Режим',DITHER_MODES,()=>doc.render.dither.mode,v=>doc.render.dither.mode=v,()=>{ buildLeft(); changed(); });
  if(doc.render.dither.mode!=='off')
    makeRow(s.body,{label:'Сила, LSB',min:0,max:4,step:0.05,get:()=>doc.render.dither.amount,set:v=>doc.render.dither.amount=v,onInput:upd});
  subHead(s.body,'WebP',null);
  makeRow(s.body,{label:'Качество',min:0,max:1,step:0.01,get:()=>doc.render.webpQuality,set:v=>doc.render.webpQuality=v});
}

