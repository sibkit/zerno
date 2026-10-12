"use strict";
/* ЗЕРНО · цикл рендера, миниатюры каналов и сцена просмотра.
   Зависит от engine.js и panels.js. */


let renderTimer=null, previewUrl=null;

function setState(kind,txt){
  $('dot').className='dot'+(kind?' '+kind:'');
  $('stState').textContent=txt;
}
function scheduleRender(){
  setState('busy','рендер');
  clearTimeout(renderTimer);
  renderTimer=setTimeout(runRender,45);
}

function thumbDims(W,H,maxPx){
  const k=maxPx/Math.max(W,H);
  return [Math.max(6,Math.round(W*k)),Math.max(6,Math.round(H*k))];
}

let renderSeq=0;

/**
 * Один заход рендера: главная плитка и миниатюры всех каналов уходят
 * ОДНИМ пакетом. На сервере они считаются параллельно.
 */
async function runRender(){
  const my=++renderSeq;
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
    if(my!==renderSeq) return;
    setState('err','ошибка');
    toast('Ошибка рендера: '+e.message,true);
    return;
  }
  if(my!==renderSeq) return;   /* пришёл устаревший ответ — выбрасываем */

  tileToCanvas(res[0]).toBlob(b=>{
    if(!b){ setState('err','ошибка'); toast('canvas.toBlob вернул null при подготовке превью.',true); return; }
    const url=URL.createObjectURL(b);
    $('field').style.backgroundImage='url("'+url+'")';
    if(previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl=url;
    applyStage();
  },'image/png');

  for(let i=0;i<ids.length;i++){
    const r=cardRefs[ids[i]];
    if(r&&res[i+1]) tileInto(r.thumb,res[i+1]);
  }
  try{ updateCardMeta(); }
  catch(e){ toast('Ошибка подписей каналов: '+e.message,true); }

  $('stMs').textContent=(performance.now()-t0).toFixed(0)+' мс';
  $('stTile').textContent=doc.tile.width+'×'+doc.tile.height+' px';
  $('stCh').textContent=doc.channels.filter(c=>c.enabled).length+' / '+doc.channels.length;
  setState('','готов');
}

function updateCardMeta(){
  const W=doc.tile.width, H=doc.tile.height;
  for(const ch of doc.channels){
    const r=cardRefs[ch.id];
    if(!r) continue;
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

function applyStage(){
  const W=doc.tile.width, H=doc.tile.height;
  const z=Math.pow(2,parseFloat($('zoom').value));
  const tw=Math.max(1,Math.round(W*z)), th=Math.max(1,Math.round(H*z));
  const view=$('stageView');
  const avW=Math.max(tw,view.clientWidth-72), avH=Math.max(th,view.clientHeight-72);
  const cols=Math.max(1,Math.ceil(avW/tw)), rows=Math.max(1,Math.ceil(avH/th));
  const f=$('field');
  f.style.width=(cols*tw)+'px';
  f.style.height=(rows*th)+'px';
  f.style.backgroundSize=tw+'px '+th+'px';
  const pos=stage.shift?Math.round(tw/2)+'px '+Math.round(th/2)+'px':'0 0';
  f.style.backgroundPosition=pos;
  f.classList.toggle('smooth',stage.smooth||z<1);
  const g=$('fieldGrid');
  g.classList.toggle('on',stage.grid);
  g.style.backgroundPosition=pos;
  g.style.backgroundImage=
    'repeating-linear-gradient(90deg,rgba(232,197,71,.55) 0 1px,transparent 1px '+tw+'px),'+
    'repeating-linear-gradient(180deg,rgba(232,197,71,.55) 0 1px,transparent 1px '+th+'px)';
  $('zval').textContent=Math.round(z*100)+'%';
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
  $('zoom').addEventListener('input',applyStage);
  $('zreset').addEventListener('click',()=>{ $('zoom').value=0; applyStage(); });
  const tog=(id,key)=>$(id).addEventListener('click',()=>{
    stage[key]=!stage[key];
    $(id).classList.toggle('on',stage[key]);
    applyStage();
  });
  tog('tGrid','grid'); tog('tShift','shift'); tog('tSmooth','smooth');
  $('tLib').classList.add('on');
  $('tLib').addEventListener('click',()=>{
    const hidden=$('grid').classList.toggle('no-right');
    $('tLib').classList.toggle('on',!hidden);
    requestAnimationFrame(applyStage);
  });
  window.addEventListener('resize',applyStage);
}

