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
  makeRow(s.body,{label:'Ширина',min:TILE_MIN,max:TILE_MAX,step:1,get:()=>doc.tile.width,set:v=>doc.tile.width=v,onInput:upd});
  makeRow(s.body,{label:'Высота',min:TILE_MIN,max:TILE_MAX,step:1,get:()=>doc.tile.height,set:v=>doc.tile.height=v,onInput:upd});
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
    const c=el('div','chip','+ '+NOISE_TYPES[t].label);
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
  head.append(cv,t,acts);

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
  makeSelect(body,'Тип',mapLabels(NOISE_TYPES),()=>n.type,v=>{
    n.type=v;
    if(v==='grain'&&n.sizeX>16){ n.sizeX=2; n.sizeY=2; }
    if(v!=='grain'&&n.sizeX<8){ n.sizeX=64; n.sizeY=64; }
  },rebuild);

  const ms=minSizeFor(n.type);
  makeRow(body,{label:n.type==='grain'?'Зерно X':'Пятно X',min:ms,max:1024,step:0.5,
    get:()=>n.sizeX,set:v=>n.sizeX=v,onInput:upd});
  makeRow(body,{label:n.type==='grain'?'Зерно Y':'Пятно Y',min:ms,max:1024,step:0.5,
    get:()=>n.sizeY,set:v=>n.sizeY=v,onInput:upd});
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
    body.appendChild(el('div','hint','0 — белый шум. >0 — «синее» зерно: убирает низкие частоты, из-за которых повтор плитки становится заметен.'));
  }
  if(info.warp){
    makeRow(body,{label:'Искажение',min:0,max:400,step:1,get:()=>n.warpAmount,set:v=>n.warpAmount=v,onInput:upd});
    if(n.warpAmount>0)
      makeRow(body,{label:'Масштаб иск.',min:2,max:2048,step:1,get:()=>n.warpSize,set:v=>n.warpSize=v,onInput:upd});
  }

  subHead(body,'Форма');
  const sh=n.shape;
  makeRow(body,{label:'Контраст',min:-1,max:1,step:0.01,get:()=>sh.contrast,set:v=>sh.contrast=v,onInput:upd});
  makeRow(body,{label:'Смещение',min:-0.5,max:0.5,step:0.005,get:()=>sh.bias,set:v=>sh.bias=v,onInput:upd});
  makeRow(body,{label:'Гамма',min:0.1,max:8,step:0.01,get:()=>sh.gamma,set:v=>sh.gamma=v,onInput:upd});
  makeCheck(body,'Инверсия',()=>sh.invert,v=>sh.invert=v,upd);
  makeCheck(body,'Нормализация диапазона',()=>sh.normalize,v=>sh.normalize=v,upd);

  subHead(body,'Цвет');
  const ramp=()=>{ updateRamp(ch); upd(); };
  makeColorEditor(body,ch.id+':low','низ · шум 0',ch.low,ramp);
  makeColorEditor(body,ch.id+':high','верх · шум 1',ch.high,ramp);
  const sw=el('div','chips');
  const swb=el('div','chip','поменять низ ⇄ верх');
  swb.addEventListener('click',()=>{
    const a=ch.low; ch.low=ch.high; ch.high=a;
    rebuild();
  });
  sw.appendChild(swb);
  body.appendChild(sw);

  subHead(body,'Слой');
  makeSelect(body,'Смешив.',BLEND_MODES,()=>ch.blend,v=>ch.blend=v,upd);
  makeRow(body,{label:'Непрозр.',min:0,max:1,step:0.005,get:()=>ch.opacity,set:v=>ch.opacity=v,onInput:upd});
}

/** Полоса «низ → верх» в шапке карточки, в том же пространстве смешивания. */
function updateRamp(ch){
  const r=cardRefs[ch.id];
  if(!r) return;
  const space=doc.render.stopMix==='oklab'?'oklab':'srgb-linear';
  r.ramp.style.setProperty('--ramp','linear-gradient(in '+space+' 90deg,'+okhslToCss(ch.low)+','+okhslToCss(ch.high)+')');
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
  makeSelect(s.body,'Смешив.',STOP_MIX,()=>doc.render.stopMix,v=>doc.render.stopMix=v,()=>{ buildLeft(); changed(); });
  s.body.appendChild(el('div','hint','Интерполяция низ→верх. Режимы наложения слоёв всегда считаются в линейном свете.'));
  subHead(s.body,'Дизеринг');
  makeSelect(s.body,'Режим',DITHER_MODES,()=>doc.render.dither.mode,v=>doc.render.dither.mode=v,()=>{ buildLeft(); changed(); });
  if(doc.render.dither.mode!=='off')
    makeRow(s.body,{label:'Сила, LSB',min:0,max:4,step:0.05,get:()=>doc.render.dither.amount,set:v=>doc.render.dither.amount=v,onInput:upd});
  s.body.appendChild(el('div','hint','Убирает полосы (бэндинг) на плавных градиентах при переводе в 8 бит.'));
  subHead(s.body,'WebP');
  makeRow(s.body,{label:'Качество',min:0,max:1,step:0.01,get:()=>doc.render.webpQuality,set:v=>doc.render.webpQuality=v});
  s.body.appendChild(el('div','hint','1.00 — Chromium кодирует WebP без потерь.'));
}

