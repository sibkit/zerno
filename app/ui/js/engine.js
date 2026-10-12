"use strict";
/* ЗЕРНО · связь с движком на Rust (команды Tauri).
   Других путей нет: без window.__TAURI__ интерфейс не запускается и говорит
   об этом прямо (см. boot.js), а не считает молча чем-то другим. */

function tauri(){
  if(!window.__TAURI__||!window.__TAURI__.core)
    throw new Error('Нет связи с приложением (window.__TAURI__): интерфейс открыт не в ЗЕРНО.');
  return window.__TAURI__;
}

/** Команда приложения. Ошибка Rust приходит строкой — превращаем в Error. */
async function call(cmd,args,opts){
  try{ return await tauri().core.invoke(cmd,args,opts); }
  catch(e){ throw e instanceof Error?e:new Error(String(e)); }
}

/** Ответ рендера — ZRN1: "ZRN1" | u32 N | (u32 w, u32 h)×N | RGBA подряд. */
function parseRenderResponse(buf){
  if(buf.length<8||buf[0]!==0x5a||buf[1]!==0x52||buf[2]!==0x4e||buf[3]!==0x31)
    throw new Error('движок вернул ответ неизвестного формата');
  const dv=new DataView(buf.buffer,buf.byteOffset,buf.byteLength);
  const count=dv.getUint32(4,true);
  const sizes=[];
  let off=8;
  for(let i=0;i<count;i++){
    sizes.push([dv.getUint32(off,true),dv.getUint32(off+4,true)]);
    off+=8;
  }
  const out=[];
  for(const [w,h] of sizes){
    const n=w*h*4;
    if(off+n>buf.length) throw new Error('ответ движка обрезан');
    out.push({w:w,h:h,data:new Uint8ClampedArray(buf.buffer,buf.byteOffset+off,n)});
    off+=n;
  }
  if(off!==buf.length) throw new Error('в ответе движка лишние '+(buf.length-off)+' байт');
  return out;
}

/** Пачка задач рендера [{doc,width,height}] — один вызов, считается параллельно. */
async function renderTiles(jobs){
  if(!jobs.length) return [];
  const req={jobs:jobs.map(j=>({width:j.width,height:j.height,doc:j.doc.format?j.doc:serializeDoc(j.doc)}))};
  const buf=await call('render',{request:req});
  if(!(buf instanceof ArrayBuffer)) throw new Error('движок вернул не двоичный буфер');
  return parseRenderResponse(new Uint8Array(buf));
}

function tileToCanvas(tile){
  const c=document.createElement('canvas');
  c.width=tile.w; c.height=tile.h;
  c.getContext('2d').putImageData(new ImageData(tile.data,tile.w,tile.h),0,0);
  return c;
}
function tileInto(cv,tile){
  const src=tileToCanvas(tile);
  const ctx=cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.fillStyle=ctx.createPattern(src,'repeat');
  ctx.fillRect(0,0,cv.width,cv.height);
}
