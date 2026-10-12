"use strict";
/* ЗЕРНО · кирпичики интерфейса: узлы, всплывашка, строка-поле, список, флажок,
   редактор цвета, складной раздел. Зависит от color.js. */


const $=id=>document.getElementById(id);
function el(tag,cls,txt){
  const e=document.createElement(tag);
  if(cls) e.className=cls;
  if(txt!==undefined) e.textContent=txt;
  return e;
}
function decimalsFor(step){
  if(step>=1) return 0;
  const s=String(step);
  const i=s.indexOf('.');
  return i<0?0:Math.min(4,s.length-i-1);
}
function fmt(v,d){ return d===0?String(Math.round(v)):v.toFixed(d); }

let toastTimer=null;
function toast(msg,isErr){
  const t=$('toast');
  t.textContent=msg;
  t.classList.toggle('err',!!isErr);
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('on'),isErr?7000:2600);
  if(isErr) console.error(msg);
}

/** Числовое поле: перетаскивание по горизонтали меняет значение. */
function attachScrub(input,o,commit){
  let dragging=false,startX=0,startV=0,moved=false;
  input.addEventListener('pointerdown',e=>{
    if(document.activeElement===input) return;
    dragging=true; moved=false; startX=e.clientX; startV=o.get();
    try{ input.setPointerCapture(e.pointerId); }catch(_){}
    e.preventDefault();
  });
  input.addEventListener('pointermove',e=>{
    if(!dragging) return;
    const dx=e.clientX-startX;
    if(Math.abs(dx)>2) moved=true;
    let k=(o.max-o.min)/320;
    if(e.shiftKey) k*=0.15;
    if(e.ctrlKey||e.metaKey) k*=4;
    commit(startV+dx*k);
  });
  const end=e=>{
    if(!dragging) return;
    dragging=false;
    try{ input.releasePointerCapture(e.pointerId); }catch(_){}
    if(!moved){ input.focus(); input.select(); }
  };
  input.addEventListener('pointerup',end);
  input.addEventListener('pointercancel',end);
}

/**
 * Строка «подпись — слайдер — число».
 * o: {label,min,max,step,get,set,onInput,track,decimals,snapInt}
 */
function makeRow(parent,o){
  const r=el('div','row');
  const lab=el('label',null,o.label);
  const rng=document.createElement('input');
  rng.type='range'; rng.min=o.min; rng.max=o.max; rng.step=o.step;
  const num=document.createElement('input');
  num.type='text'; num.className='num'; num.inputMode='decimal'; num.spellcheck=false;
  r.append(lab,rng,num);
  parent.appendChild(r);
  const dec=o.decimals!==undefined?o.decimals:decimalsFor(o.step);
  const snap=o.snapInt!==undefined?o.snapInt:(o.step>=1);
  function show(){
    const v=o.get();
    rng.value=v; num.value=fmt(v,dec);
    if(o.track) rng.style.setProperty('--trk',o.track());
  }
  function commit(v){
    if(!isFinite(v)) return;
    if(snap) v=Math.round(v);
    v=Math.max(o.min,Math.min(o.max,v));
    o.set(v); show();
    if(o.onInput) o.onInput();
  }
  rng.addEventListener('input',()=>commit(parseFloat(rng.value)));
  num.addEventListener('change',()=>{
    const v=parseFloat(num.value.replace(',','.'));
    if(!isFinite(v)){ num.classList.add('bad'); return; }
    num.classList.remove('bad'); commit(v);
  });
  num.addEventListener('blur',()=>{ num.classList.remove('bad'); show(); });
  attachScrub(num,o,commit);
  show();
  return {refresh:show,row:r};
}

function makeSelect(parent,label,map,get,set,onInput){
  const r=el('div','row wide');
  r.appendChild(el('label',null,label));
  const s=document.createElement('select');
  for(const k of Object.keys(map)){
    const op=document.createElement('option');
    op.value=k; op.textContent=map[k];
    s.appendChild(op);
  }
  s.value=get();
  s.addEventListener('change',()=>{ set(s.value); if(onInput) onInput(); });
  r.appendChild(s);
  parent.appendChild(r);
  return s;
}

function makeCheck(parent,label,get,set,onInput){
  const l=el('label','chk');
  const inp=document.createElement('input');
  inp.type='checkbox'; inp.checked=get();
  const box=el('span','box');
  l.append(inp,box,el('span',null,label));
  inp.addEventListener('change',()=>{ set(inp.checked); if(onInput) onInput(); });
  parent.appendChild(l);
  return {refresh:()=>{inp.checked=get();}};
}

function subHead(parent,txt){ parent.appendChild(el('div','sub-h',txt)); }

/* ---------------------- редактор цвета OKHSL ---------------------- */

function gradStops(mk,n){
  const out=[];
  for(let i=0;i<n;i++) out.push(mk(i/(n-1)));
  return 'linear-gradient(90deg,'+out.join(',')+')';
}

function makeColorEditor(parent,title,c,onChange){
  const box=el('div','ok');
  const head=el('div','ok-h');
  const sw=el('div','ok-sw');
  const swi=document.createElement('i');
  sw.appendChild(swi);
  const hex=document.createElement('input');
  hex.className='ok-hex'; hex.spellcheck=false;
  head.append(sw,el('div','ok-title',title),hex);
  const body=el('div','ok-b');
  box.append(head,body);
  parent.appendChild(box);

  const rows=[];
  const push=o=>rows.push(makeRow(body,o));
  const upd=()=>{ refresh(); onChange(); };

  push({label:'H',min:0,max:360,step:0.5,get:()=>c.h,set:v=>c.h=v,onInput:upd,
        track:()=>gradStops(t=>okhslToCss({h:t*360,s:Math.max(c.s,0.35),l:c.l<0.15?0.5:c.l},1),13)});
  push({label:'S',min:0,max:1,step:0.005,get:()=>c.s,set:v=>c.s=v,onInput:upd,
        track:()=>gradStops(t=>okhslToCss({h:c.h,s:t,l:c.l<0.08?0.5:c.l},1),7)});
  push({label:'L',min:0,max:1,step:0.005,get:()=>c.l,set:v=>c.l=v,onInput:upd,
        track:()=>gradStops(t=>okhslToCss({h:c.h,s:c.s,l:t},1),9)});
  push({label:'A',min:0,max:1,step:0.005,get:()=>c.a,set:v=>c.a=v,onInput:upd,
        track:()=>gradStops(t=>okhslToCss(c,t),5)});

  function refresh(){
    swi.style.background=okhslToCss(c);
    if(document.activeElement!==hex) hex.value=okhslToHex(c);
    for(const r of rows) r.refresh();
  }
  hex.addEventListener('change',()=>{
    try{
      const v=hexToOkhsl(hex.value);
      c.h=round4(v.h); c.s=round4(v.s); c.l=round4(v.l);
      refresh(); onChange();
    }catch(e){ toast(e.message,true); hex.value=okhslToHex(c); }
  });
  refresh();
  return {refresh};
}

/* ---------------------- разделы левой колонки ---------------------- */

const secOpen={tile:true,bg:true,chans:true,out:false};

function makeSection(parent,key,title){
  const sec=el('div','sec'+(secOpen[key]?'':' closed'));
  const h=el('div','sec-h');
  h.append(el('span','tick'),el('span',null,title));
  const cnt=el('span','cnt');
  h.appendChild(cnt);
  const b=el('div','sec-b');
  sec.append(h,b);
  parent.appendChild(sec);
  h.addEventListener('click',()=>{
    sec.classList.toggle('closed');
    secOpen[key]=!sec.classList.contains('closed');
  });
  return {sec,body:b,count:cnt};
}

