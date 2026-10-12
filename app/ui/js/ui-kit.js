"use strict";
/* ЗЕРНО · кирпичики интерфейса: узлы, всплывашка, строка-поле, список, флажок,
   редактор цвета (OKHSL/OKLCH), складной раздел. Зависит от color.js и doc.js (round4). */


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

/** Числовое поле: перетаскивание по горизонтали меняет значение.
    pos/val — перевод в шкалу ползунка и обратно (у логарифмической шкалы
    перетаскивание тоже идёт по ней), span — ширина шкалы. */
function attachScrub(input,get,pos,val,span,commit){
  let dragging=false,startX=0,startP=0,moved=false;
  input.addEventListener('pointerdown',e=>{
    if(document.activeElement===input) return;
    dragging=true; moved=false; startX=e.clientX; startP=pos(get());
    try{ input.setPointerCapture(e.pointerId); }catch(_){}
    e.preventDefault();
  });
  input.addEventListener('pointermove',e=>{
    if(!dragging) return;
    const dx=e.clientX-startX;
    if(Math.abs(dx)>2) moved=true;
    let k=span()/320;
    if(e.shiftKey) k*=0.15;
    if(e.ctrlKey||e.metaKey) k*=4;
    commit(val(startP+dx*k));
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
 * o: {label,min,max,step,get,set,onInput,track,decimals,snapInt,
 *     log,snap,note}
 *   min/max — числа или функции (границы, зависящие от плитки);
 *   log     — ползунок в логарифмической шкале (для размеров);
 *   snap    — v → ближайшее допустимое значение (ступени);
 *   note    — () → короткая строка под подписью.
 */
function makeRow(parent,o){
  const r=el('div','row');
  const lab=el('label',null,o.label);
  const noteEl=o.note?el('small','row-note'):null;
  if(noteEl) lab.appendChild(noteEl);
  const rng=document.createElement('input');
  rng.type='range';
  const num=document.createElement('input');
  num.type='text'; num.className='num'; num.inputMode='decimal'; num.spellcheck=false;
  r.append(lab,rng,num);
  parent.appendChild(r);
  const dec=o.decimals!==undefined?o.decimals:decimalsFor(o.step);
  const snapInt=o.snapInt!==undefined?o.snapInt:(o.step>=1);
  const lo=()=>typeof o.min==='function'?o.min():o.min;
  const hi=()=>typeof o.max==='function'?o.max():o.max;
  const pos=v=>o.log?Math.log2(v):v;
  const val=p=>o.log?Math.pow(2,p):p;
  if(o.log){
    if(!(lo()>0)) throw new Error('makeRow «'+o.label+'»: логарифмической шкале нужен min > 0');
    rng.step='any';
  }else rng.step=o.step;
  function show(){
    const v=o.get();
    rng.min=pos(lo()); rng.max=pos(hi());
    rng.value=pos(v);
    /* поле, в котором сейчас печатают, не трогаем */
    if(document.activeElement!==num) num.value=fmt(v,dec);
    if(noteEl) noteEl.textContent=o.note();
    if(o.track) rng.style.setProperty('--trk',o.track());
  }
  function commit(v){
    if(!isFinite(v)) return;
    if(snapInt) v=Math.round(v);
    v=Math.max(lo(),Math.min(hi(),v));
    if(o.snap) v=o.snap(v);
    o.set(v); show();
    if(o.onInput) o.onInput();
  }
  rng.addEventListener('input',()=>commit(val(parseFloat(rng.value))));
  num.addEventListener('change',()=>{
    const v=parseFloat(num.value.replace(',','.'));
    if(!isFinite(v)){ num.classList.add('bad'); return; }
    num.classList.remove('bad'); commit(v);
  });
  num.addEventListener('blur',()=>{ num.classList.remove('bad'); show(); });
  attachScrub(num,o.get,pos,val,()=>pos(hi())-pos(lo()),commit);
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
  return {refresh:()=>{inp.checked=get();},el:l};
}

/** Заголовок подгруппы; topic — раздел справки для значка «?» или null. */
function subHead(parent,txt,topic){
  if(topic===undefined) throw new Error('subHead «'+txt+'»: раздел справки не указан (строка или null)');
  const h=el('div','sub-h',txt);
  if(topic!==null) h.appendChild(helpBtn(topic));
  parent.appendChild(h);
}

/* ---------------------- редактор цвета: OKHSL или OKLCH ---------------------- */

function gradStops(mk,n){
  const out=[];
  for(let i=0;i<n;i++) out.push(mk(i/(n-1)));
  return 'linear-gradient(90deg,'+out.join(',')+')';
}

/* Режим общий для всех редакторов и запоминается. Пока его не меняли —
   OKHSL: родное пространство документа, так редактор работал всегда. */
const COLOR_MODES={okhsl:'HSL',oklch:'LCH'};
const OKLCH_C_MAX=0.33;   /* верх шкалы C: самая насыщенная точка гамута sRGB ≈ 0.322 */
let colorMode=(function(){
  const v=localStorage.getItem('zerno.colorMode');
  if(v===null) return 'okhsl';
  if(!(v in COLOR_MODES)){
    setTimeout(()=>toast('Сохранённый режим цвета «'+v+'» неизвестен — выбран HSL.',true),0);
    return 'okhsl';
  }
  return v;
})();
function setColorMode(m){
  if(!(m in COLOR_MODES)) throw new Error('setColorMode: неизвестный режим "'+m+'"');
  if(m===colorMode) return;
  colorMode=m;
  localStorage.setItem('zerno.colorMode',m);
  document.dispatchEvent(new Event('zerno:colormode'));
}

/* Какие редакторы раскрыты: ключ → true. Переживает пересборку колонки. */
const okOpen={};

/**
 * Редактор цвета c={h,s,l,a} (OKHSL, правится на месте).
 * key — постоянный ключ для памяти «раскрыт/свёрнут».
 */
function makeColorEditor(parent,key,title,c,onChange){
  const box=el('div','ok'+(okOpen[key]?' open':''));
  const head=el('div','ok-h');
  const sw=el('div','ok-sw');
  const swi=document.createElement('i');
  sw.appendChild(swi);
  const hex=document.createElement('input');
  hex.className='ok-hex'; hex.spellcheck=false;
  const mode=el('div','ok-mode');
  for(const m of Object.keys(COLOR_MODES)){
    const b=el('button',m===colorMode?'on':null,COLOR_MODES[m]);
    b.addEventListener('click',e=>{ e.stopPropagation(); setColorMode(m); });
    mode.appendChild(b);
  }
  head.append(sw,el('div','ok-title',title),hex,mode,el('span','ok-chev'));
  head.addEventListener('click',e=>{
    if(e.target.closest('input,button')) return;
    okOpen[key]=!okOpen[key];
    box.classList.toggle('open',!!okOpen[key]);
  });
  const body=el('div','ok-b');
  box.append(head,body);
  parent.appendChild(box);

  const rows=[];
  const push=o=>rows.push(makeRow(body,o));
  let note=null;

  if(colorMode==='okhsl'){
    const upd=()=>{ refresh(); onChange(); };
    push({label:'H',min:0,max:360,step:0.5,get:()=>c.h,set:v=>c.h=v,onInput:upd,
          track:()=>gradStops(t=>okhslToCss({h:t*360,s:Math.max(c.s,0.35),l:c.l<0.15?0.5:c.l},1),13)});
    push({label:'S',min:0,max:1,step:0.005,get:()=>c.s,set:v=>c.s=v,onInput:upd,
          track:()=>gradStops(t=>okhslToCss({h:c.h,s:t,l:c.l<0.08?0.5:c.l},1),7)});
    push({label:'L',min:0,max:1,step:0.005,get:()=>c.l,set:v=>c.l=v,onInput:upd,
          track:()=>gradStops(t=>okhslToCss({h:c.h,s:c.s,l:t},1),9)});
  }else{
    /* lch.want — хрома, которую попросил пользователь. Если при новых L или H
       она не помещается в гамут, C снижается до границы, и это видно в подписи;
       вернёшь L/H обратно — хрома вернётся к заказанной. */
    const lch=okhslToOklch(c);
    lch.want=lch.C;
    note=el('div','ok-note');
    const apply=()=>{
      const cmax=maxChroma(lch.L,lch.H);
      lch.C=Math.min(lch.want,cmax);
      const v=oklchToOkhsl(lch.L,lch.C,lch.H);
      c.h=v.h; c.s=v.s; c.l=v.l;
      if(lch.want>cmax+1e-6){
        note.textContent='C снижена до границы гамута sRGB: '+fmt(lch.C,3)+' (задано '+fmt(lch.want,3)+').';
        note.style.display='';
      }else note.style.display='none';
      refresh(); onChange();
    };
    const css=(L,C,H)=>okhslToCss(oklchToOkhsl(L,Math.min(C,maxChroma(L,H)),H),1);
    push({label:'L',min:0,max:1,step:0.001,get:()=>lch.L,set:v=>lch.L=v,onInput:apply,
          track:()=>gradStops(t=>css(t,lch.want,lch.H),11)});
    push({label:'C',min:0,max:OKLCH_C_MAX,step:0.001,get:()=>lch.C,set:v=>lch.want=v,onInput:apply,
          track:()=>{
            const cmax=maxChroma(lch.L,lch.H);
            /* за границей гамута шкала тёмная: туда хрома не пойдёт */
            return gradStops(t=>t*OKLCH_C_MAX<=cmax?css(lch.L,t*OKLCH_C_MAX,lch.H):'#121418',17);
          }});
    push({label:'H',min:0,max:360,step:0.5,get:()=>lch.H,set:v=>lch.H=v,onInput:apply,
          track:()=>gradStops(t=>css(lch.L,Math.max(lch.want,0.08),t*360),13)});
    hex.addEventListener('change',()=>{ const q=okhslToOklch(c); lch.L=q.L; lch.C=q.C; lch.want=q.C; lch.H=q.H; refresh(); });
  }
  push({label:'A',min:0,max:1,step:0.005,get:()=>c.a,set:v=>c.a=v,onInput:()=>{ refresh(); onChange(); },
        track:()=>gradStops(t=>okhslToCss(c,t),5)});
  if(note){ note.style.display='none'; body.appendChild(note); }

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
  },true);
  refresh();
  return {refresh};
}

/* ---------------------- разделы левой колонки ---------------------- */

const secOpen={tile:true,bg:true,chans:true,out:false};

/** Складной раздел; topic — раздел справки для значка «?». */
function makeSection(parent,key,title,topic){
  const sec=el('div','sec'+(secOpen[key]?'':' closed'));
  const h=el('div','sec-h');
  h.append(el('span','tick'),el('span',null,title),helpBtn(topic));
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

