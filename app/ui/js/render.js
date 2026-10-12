"use strict";
/* ЗЕРНО · цикл рендера, миниатюры каналов и сцена просмотра.
   Зависит от engine.js и panels.js. */


/* Последняя готовая плитка — canvas с пикселями движка. Сцена рисуется из
   неё синхронно: без PNG и без смены картинки фона, поэтому при
   перетаскивании ползунка ничего не мигает. */
const preview={tile:null};

function setState(kind,txt){
  $('dot').className='dot'+(kind?' '+kind:'');
  $('stState').textContent=txt;
}

/* «Один рендер в полёте + флаг устаревания» вместо паузы-debounce: пока
   движок считает, правки только помечают картинку устаревшей, а по
   готовности сразу уходит следующий рендер с последним состоянием.
   Превью живёт во время перетаскивания ползунка и не копит очередь. */
const pump={busy:false,dirty:false};
function scheduleRender(){
  pump.dirty=true;
  setState('busy','рендер');
  if(!pump.busy) runPump();
}
async function runPump(){
  pump.busy=true;
  try{
    while(pump.dirty){
      pump.dirty=false;
      await runRender();
    }
  }finally{ pump.busy=false; }
}

/* Миниатюра — тоже документ, и движок проверяет её как плитку: меньше
   TILE_MIN по стороне не бывает. У очень вытянутых плиток (8×4096) узкая
   сторона миниатюры поэтому чуть шире пропорции. */
function thumbDims(W,H,maxPx){
  const k=maxPx/Math.max(W,H);
  return [Math.max(TILE_MIN,Math.round(W*k)),Math.max(TILE_MIN,Math.round(H*k))];
}

/**
 * Один заход рендера: главная плитка и миниатюры всех каналов уходят
 * ОДНИМ пакетом. На сервере они считаются параллельно.
 */
async function runRender(){
  const t0=performance.now();
  const W=doc.tile.width, H=doc.tile.height;
  const [tw,th]=thumbDims(W,H,38);

  let jobs, ids;
  try{
    jobs=[{doc:serializeDoc(doc),width:W,height:H}];
    ids=[];
    for(const ch of doc.channels){
      jobs.push({doc:scaledDoc(soloDoc(doc,ch.id),tw,th),width:tw,height:th});
      ids.push(ch.id);
    }
  }catch(e){
    setState('err','ошибка');
    toast('Ошибка подготовки задания: '+e.message,true);
    return;
  }

  let res;
  try{
    res=await renderTiles(jobs);
  }catch(e){
    setState('err','ошибка');
    toast('Ошибка рендера: '+e.message,true);
    return;
  }

  putPreview(res[0]);

  for(let i=0;i<ids.length;i++){
    const r=cardRefs[ids[i]];
    if(r&&res[i+1]) tileInto(r.thumb,res[i+1]);
  }
  try{ updateCardMeta(); }
  catch(e){ toast('Ошибка подписей каналов: '+e.message,true); }

  $('stMs').textContent=(performance.now()-t0).toFixed(0)+' мс';
  $('stTile').textContent=doc.tile.width+'×'+doc.tile.height+' px';
  $('stCh').textContent=doc.channels.filter(c=>c.enabled).length+' / '+doc.channels.length;
  if(!pump.dirty) setState('','готов');
}

function updateCardMeta(){
  const W=doc.tile.width, H=doc.tile.height;
  for(const ch of doc.channels){
    const r=cardRefs[ch.id];
    if(!r) continue;
    /* число ячеек зависит и от размера плитки — подписи обновляются здесь */
    if(r.sizeRows) for(const row of r.sizeRows) row.refresh();
    const n=ch.noise, info=NOISE_TYPES[n.type];
    const cap=info.octaves?maxOctavesFor(n,W,H):1;
    const used=info.octaves?Math.min(n.octaves,cap):1;
    r.meta.textContent=n.type+' · '+fmt(n.sizeX,1)+'×'+fmt(n.sizeY,1)+' px'+
      (info.octaves?' · '+used+' окт':'')+
      ' · '+BLEND_MODES[ch.blend].toLowerCase()+' '+Math.round(ch.opacity*100)+'%';
    if(info.octaves&&n.octaves>cap){
      r.warn.style.display='';
      r.warn.textContent='Октавы ограничены до '+cap+': на плитке '+W+'×'+H+
        ' ячейка следующей октавы была бы мельче пикселя.';
    }else{
      r.warn.style.display='none';
    }
  }
}

const stage={grid:false,shift:false,smooth:false};
const SURROUND=['#000000','#0e1014','#3a3f46','#808080','#c9ccd0','#ffffff'];

function putPreview(t){
  let c=preview.tile;
  if(!c||c.width!==t.w||c.height!==t.h){
    c=document.createElement('canvas');
    c.width=t.w; c.height=t.h;
    preview.tile=c;
  }
  c.getContext('2d').putImageData(new ImageData(t.data,t.w,t.h),0,0);
  drawStage();
}

function zoomFactor(){ return Math.pow(2,parseFloat($('zoom').value)); }

/* Отступ от края сцены, CSS px: в нём виден цвет обрамления. */
const STAGE_PAD=24;

function cssToken(name){
  const v=getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if(!v) throw new Error('В tokens.css нет переменной '+name);
  return v;
}

/**
 * Сцена: плитки замощают область с отступом STAGE_PAD, одна плитка — ровно
 * посередине и отмечена уголками («Сдвиг ½» уводит в центр её угол, то есть
 * стык). Масштаб и сдвиг — преобразованием узора, без пересборки DOM.
 */
function drawStage(){
  const z=zoomFactor();
  $('zval').textContent=Math.round(z*100)+'%';
  const cv=$('field'), view=$('stageView');
  const dpr=window.devicePixelRatio||1;
  const cw=Math.max(1,Math.round(view.clientWidth*dpr)), ch=Math.max(1,Math.round(view.clientHeight*dpr));
  if(cv.width!==cw||cv.height!==ch){ cv.width=cw; cv.height=ch; }
  const ctx=cv.getContext('2d');
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,cw,ch);
  const t=preview.tile;
  if(!t) return;

  const pad=Math.round(STAGE_PAD*dpr);
  const ax=pad, ay=pad, aw=Math.max(0,cw-2*pad), ah=Math.max(0,ch-2*pad);
  const k=z*dpr, tw=t.width*k, th=t.height*k;
  let ox=Math.round(ax+(aw-tw)/2), oy=Math.round(ay+(ah-th)/2);
  if(stage.shift){ ox-=Math.round(tw/2); oy-=Math.round(th/2); }

  ctx.imageSmoothingEnabled=stage.smooth||z<1;
  const pat=ctx.createPattern(t,'repeat');
  pat.setTransform(new DOMMatrix([k,0,0,k,ox,oy]));
  ctx.fillStyle=pat;
  ctx.fillRect(ax,ay,aw,ah);

  ctx.save();
  ctx.beginPath(); ctx.rect(ax,ay,aw,ah); ctx.clip();
  const acc=cssToken('--acc');
  if(stage.grid){
    ctx.strokeStyle=acc; ctx.globalAlpha=0.55; ctx.lineWidth=1;
    ctx.beginPath();
    for(let x=ax+((ox-ax)%tw+tw)%tw; x<ax+aw; x+=tw){ const X=Math.round(x)+0.5; ctx.moveTo(X,ay); ctx.lineTo(X,ay+ah); }
    for(let y=ay+((oy-ay)%th+th)%th; y<ay+ah; y+=th){ const Y=Math.round(y)+0.5; ctx.moveTo(ax,Y); ctx.lineTo(ax+aw,Y); }
    ctx.stroke();
    ctx.globalAlpha=1;
  }
  /* уголки центральной плитки */
  const L=Math.round(10*dpr), x0=ox+0.5, y0=oy+0.5, x1=Math.round(ox+tw)-0.5, y1=Math.round(oy+th)-0.5;
  ctx.strokeStyle=acc; ctx.lineWidth=Math.max(1,Math.round(dpr));
  ctx.beginPath();
  ctx.moveTo(x0,y0+L); ctx.lineTo(x0,y0); ctx.lineTo(x0+L,y0);
  ctx.moveTo(x1-L,y0); ctx.lineTo(x1,y0); ctx.lineTo(x1,y0+L);
  ctx.moveTo(x0,y1-L); ctx.lineTo(x0,y1); ctx.lineTo(x0+L,y1);
  ctx.moveTo(x1-L,y1); ctx.lineTo(x1,y1); ctx.lineTo(x1,y1-L);
  ctx.stroke();
  ctx.restore();

  /* рамка области */
  ctx.strokeStyle='rgba(255,255,255,.08)'; ctx.lineWidth=1;
  ctx.strokeRect(ax-0.5,ay-0.5,aw+1,ah+1);

  /* для проверок: что именно нарисовано */
  cv.dataset.tile=t.width+'×'+t.height;
  cv.dataset.scale=String(k);
  cv.dataset.origin=ox+','+oy;
}

function initStage(){
  const surr=$('surr');
  SURROUND.forEach((c,i)=>{
    const b=el('button','sw-btn'+(i===1?' on':''));
    b.style.background=c;
    b.addEventListener('click',()=>{
      $('stageView').style.background=c;
      surr.querySelectorAll('.sw-btn').forEach(x=>x.classList.remove('on'));
      b.classList.add('on');
    });
    surr.appendChild(b);
  });
  $('zoom').addEventListener('input',drawStage);
  $('zreset').addEventListener('click',zoomReset);
  const tog=(id,key)=>$(id).addEventListener('click',()=>{
    stage[key]=!stage[key];
    $(id).classList.toggle('on',stage[key]);
    drawStage();
  });
  tog('tGrid','grid'); tog('tShift','shift'); tog('tSmooth','smooth');
  $('tLib').classList.add('on');
  $('tLib').addEventListener('click',()=>{
    const hidden=$('grid').classList.toggle('no-right');
    $('tLib').classList.toggle('on',!hidden);
  });
  /* размер сцены меняется и окном, и скрытием библиотеки */
  new ResizeObserver(drawStage).observe($('stageView'));
  /* Колесо над сценой — масштаб, шаг ⅛ октавы: прокручивать сцене нечего,
     плитки замощают её целиком. Двойной клик — 1:1. */
  $('stageView').addEventListener('wheel',e=>{
    e.preventDefault();
    zoomBy(e.deltaY<0?0.125:-0.125);
  },{passive:false});
  $('stageView').addEventListener('dblclick',zoomReset);
}

function zoomBy(d){
  const z=$('zoom');
  z.value=Math.max(+z.min,Math.min(+z.max,parseFloat(z.value)+d));
  drawStage();
}
function zoomReset(){ $('zoom').value=0; drawStage(); }

