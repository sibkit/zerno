"use strict";
/* ЗЕРНО · движок: нативный сервер zerno.exe либо расчёт в браузере.
   Ничего не подменяет молча — выбранный путь виден в строке состояния. */

/*
   Считать может либо zerno.exe (нативно, в несколько потоков, с кэшем полей),
   либо этот же алгоритм на JS прямо в браузере. Второй путь нужен, когда
   страницу открыли файлом (file://) без сервера. Какой движок работает
   сейчас — написано в строке состояния, молча ничего не подменяется.
*/
const engineInfo={mode:'js',threads:0,version:'',reason:'страница открыта без сервера'};

async function detectEngine(){
  if(!/^https?:$/.test(location.protocol)){
    engineInfo.mode='js';
    engineInfo.reason='протокол '+location.protocol+' — сервер недоступен';
    return;
  }
  try{
    const r=await fetch('api/health',{cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const j=await r.json();
    if(j.engine!=='zig') throw new Error('неизвестный движок «'+j.engine+'»');
    engineInfo.mode='zig';
    engineInfo.threads=j.threads;
    engineInfo.version=j.version;
    engineInfo.zig=j.zig;
    engineInfo.reason='';
  }catch(e){
    engineInfo.mode='js';
    engineInfo.reason=e.message;
  }
}

function parseRenderResponse(buf){
  if(buf.length<8||buf[0]!==0x5a||buf[1]!==0x52||buf[2]!==0x4e||buf[3]!==0x31)
    throw new Error('сервер вернул ответ неизвестного формата');
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
    if(off+n>buf.length) throw new Error('ответ сервера обрезан');
    out.push({w:w,h:h,data:new Uint8ClampedArray(buf.buffer,buf.byteOffset+off,n)});
    off+=n;
  }
  return out;
}

/** Пачка задач рендера. Одна за раз — один запрос к серверу. */
async function renderTiles(jobs){
  if(!jobs.length) return [];
  if(engineInfo.mode==='zig'){
    const r=await fetch('api/render',{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({jobs:jobs.map(j=>({width:j.width,height:j.height,doc:j.doc}))})
    });
    if(!r.ok){
      let msg='HTTP '+r.status;
      try{ msg=(await r.json()).error||msg; }catch(_){}
      throw new Error(msg);
    }
    return parseRenderResponse(new Uint8Array(await r.arrayBuffer()));
  }
  return jobs.map(j=>{
    const d=j.doc.format?j.doc:serializeDoc(j.doc);
    const acc=composeDoc(d,j.width,j.height);
    const img=accToImageData(acc,j.width,j.height,d.render.dither);
    return {w:j.width,h:j.height,data:img.data};
  });
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

