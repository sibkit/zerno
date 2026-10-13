"use strict";
/* ЗЕРНО · модель документа: заводские значения, строгая проверка, сериализация.
   Проверка без умолчаний: любое отсутствующее или лишнее поле — исключение с адресом. */


const FORMAT='zerno-noise-tile';
const DOC_VERSION=1;

let uidCounter=0;
function uid(){ return 'ch'+(++uidCounter)+'-'+Math.random().toString(36).slice(2,7); }

/* Заводские значения нового канала. Применяются ТОЛЬКО при явном создании
   канала пользователем, никогда — для «починки» импортируемых данных. */
function factoryNoise(type){
  if(!(type in NOISE_TYPES)) throw new Error('factoryNoise: неизвестный тип "'+type+'"');
  return {
    type:type,
    sizeX:type==='grain'?2:64, sizeY:type==='grain'?2:64,
    seed:(Math.random()*2147483647)|0,
    octaves:type==='worley'?2:4, gain:0.5, lacunarity:2, ridged:false,
    warpAmount:0, warpSize:128,
    worleyMode:'f1', worleyJitter:1,
    grainHp:type==='grain'?3:3,
    shape:{contrast:0,bias:0,gamma:1,invert:false,normalize:true}
  };
}
/** name — имя канала на языке интерфейса; doc.js о языках не знает. */
function factoryChannel(type,name){
  if(typeof name!=='string') throw new Error('factoryChannel: имя канала не передано');
  return {
    id:uid(), name:name, enabled:true,
    blend:'normal', opacity:1,
    noise:factoryNoise(type),
    low :{h:250,s:0.10,l:0.10,a:0.00},
    high:{h:250,s:0.10,l:0.90,a:0.10}
  };
}

/* ---------- строгая проверка (никаких молчаливых умолчаний) ----------
   Ошибка — ZErr: ключ и параметры те же, что у движка (engine/src/doc.rs),
   порядок проверок тот же. field — полный путь поля без корня ("" — сам
   документ, "channels[0].noise"); текст собирает i18n.js при показе. */

function jp(path,key){ return path?path+'.'+key:key; }
function jsType(v){ return v===null?'null':Array.isArray(v)?'array':typeof v; }
/* Число в параметре ошибки — так же, как его пишет движок (Display у f64 в
   Rust): кратчайшие цифры без экспоненты. String() дал бы 1e-7 и 1e+21,
   Rust — 0.0000001 и 1000000000000000000000. */
function numArg(v){
  const s=String(v);
  if(s.indexOf('e')<0) return s;
  const m=/^(-?)(\d)(?:\.(\d+))?e([+-]\d+)$/.exec(s);
  if(!m) throw new Error('numArg: неожиданная запись числа "'+s+'"');
  const digits=m[2]+(m[3]||''), e=Number(m[4]);
  return e>0 ? m[1]+digits+'0'.repeat(e-digits.length+1) : m[1]+'0.'+'0'.repeat(-e-1)+digits;
}

function vObj(v,path){
  if(v===null||typeof v!=='object'||Array.isArray(v)) throw new ZErr('doc.notObject',{field:path,got:jsType(v)});
  return v;
}
function vHas(o,path,key){
  if(!Object.prototype.hasOwnProperty.call(o,key)) throw new ZErr('doc.missing',{field:jp(path,key)});
}
function vNum(o,path,key,min,max){
  vHas(o,path,key);
  const v=o[key];
  if(typeof v!=='number'||!isFinite(v)) throw new ZErr('doc.notNumber',{field:jp(path,key),got:jsType(v)});
  if(v<min||v>max) throw new ZErr('doc.range',{field:jp(path,key),value:numArg(v),min:numArg(min),max:numArg(max)});
  return v;
}
function vInt(o,path,key,min,max){
  const v=vNum(o,path,key,min,max);
  if(!Number.isInteger(v)) throw new ZErr('doc.notInt',{field:jp(path,key),value:numArg(v)});
  return v;
}
function vBool(o,path,key){
  vHas(o,path,key);
  if(typeof o[key]!=='boolean') throw new ZErr('doc.notBool',{field:jp(path,key),got:jsType(o[key])});
  return o[key];
}
function vStr(o,path,key){
  vHas(o,path,key);
  if(typeof o[key]!=='string') throw new ZErr('doc.notString',{field:jp(path,key),got:jsType(o[key])});
  return o[key];
}
function vEnum(o,path,key,allowed){
  const v=vStr(o,path,key);
  if(allowed.indexOf(v)<0) throw new ZErr('doc.badEnum',{field:jp(path,key),value:v,allowed:allowed.join(', ')});
  return v;
}
function vKeys(o,path,allowed){
  for(const k of Object.keys(o)){
    if(allowed.indexOf(k)<0) throw new ZErr('doc.unknownField',{field:jp(path,k),allowed:allowed.join(', ')});
  }
}

function vColor(raw,path){
  const o=vObj(raw,path);
  vKeys(o,path,['h','s','l','a']);
  return {h:vNum(o,path,'h',0,360),s:vNum(o,path,'s',0,1),l:vNum(o,path,'l',0,1),a:vNum(o,path,'a',0,1)};
}

const NOISE_KEYS=['type','sizeX','sizeY','seed','octaves','gain','lacunarity','ridged',
  'warpAmount','warpSize','worleyMode','worleyJitter','grainHp','shape'];

function vNoise(raw,path){
  const o=vObj(raw,path);
  vKeys(o,path,NOISE_KEYS);
  const sp=jp(path,'shape');
  vHas(o,path,'shape');
  const s=vObj(o.shape,sp);
  vKeys(s,sp,['contrast','bias','gamma','invert','normalize']);
  return {
    type:vEnum(o,path,'type',NOISE_TYPE_KEYS),
    sizeX:vNum(o,path,'sizeX',0.5,8192),
    sizeY:vNum(o,path,'sizeY',0.5,8192),
    seed:vInt(o,path,'seed',-2147483648,2147483647),
    octaves:vInt(o,path,'octaves',1,12),
    gain:vNum(o,path,'gain',0,1),
    lacunarity:vInt(o,path,'lacunarity',2,4),
    ridged:vBool(o,path,'ridged'),
    warpAmount:vNum(o,path,'warpAmount',0,2000),
    warpSize:vNum(o,path,'warpSize',1,8192),
    worleyMode:vEnum(o,path,'worleyMode',WORLEY_MODES),
    worleyJitter:vNum(o,path,'worleyJitter',0,1),
    grainHp:vInt(o,path,'grainHp',0,64),
    shape:{
      contrast:vNum(s,sp,'contrast',-1,1),
      bias:vNum(s,sp,'bias',-0.5,0.5),
      gamma:vNum(s,sp,'gamma',0.1,8),
      invert:vBool(s,sp,'invert'),
      normalize:vBool(s,sp,'normalize')
    }
  };
}

function vChannel(raw,path){
  const o=vObj(raw,path);
  vKeys(o,path,['id','name','enabled','blend','opacity','noise','low','high']);
  vHas(o,path,'noise'); vHas(o,path,'low'); vHas(o,path,'high');
  return {
    id:vStr(o,path,'id')||uid(),
    name:vStr(o,path,'name'),
    enabled:vBool(o,path,'enabled'),
    blend:vEnum(o,path,'blend',BLEND_MODES),
    opacity:vNum(o,path,'opacity',0,1),
    noise:vNoise(o.noise,jp(path,'noise')),
    low:vColor(o.low,jp(path,'low')),
    high:vColor(o.high,jp(path,'high'))
  };
}

/** Разбор и проверка документа. Бросает ZErr с точным адресом ошибки;
    src — откуда документ (имя файла или описание), попадает в args.file. */
function validateDoc(raw,src){
  try{ return validateDocRaw(raw); }
  catch(e){
    if(src&&e instanceof ZErr) e.args.file=src;
    throw e;
  }
}
function validateDocRaw(raw){
  const o=vObj(raw,'');
  vKeys(o,'',['format','version','name','tile','render','background','channels']);
  const fmt=vStr(o,'','format');
  if(fmt!==FORMAT) throw new ZErr('doc.format',{field:'format',want:FORMAT,got:fmt});
  const ver=vInt(o,'','version',1,1000);
  if(ver!==DOC_VERSION) throw new ZErr('doc.version',{field:'version',got:String(ver),supported:String(DOC_VERSION)});

  vHas(o,'','tile');
  const t=vObj(o.tile,'tile');
  vKeys(t,'tile',['width','height']);

  vHas(o,'','render');
  const r=vObj(o.render,'render');
  vKeys(r,'render',['stopMix','dither','webpQuality']);
  vHas(r,'render','dither');
  const dz=vObj(r.dither,'render.dither');
  vKeys(dz,'render.dither',['mode','amount']);

  vHas(o,'','background');
  vHas(o,'','channels');
  if(!Array.isArray(o.channels)) throw new ZErr('doc.notArray',{field:'channels',got:jsType(o.channels)});

  const doc={
    format:FORMAT, version:DOC_VERSION,
    name:vStr(o,'','name'),
    tile:{width:vInt(t,'tile','width',TILE_MIN,TILE_MAX),height:vInt(t,'tile','height',TILE_MIN,TILE_MAX)},
    render:{
      stopMix:vEnum(r,'render','stopMix',STOP_MIX),
      dither:{mode:vEnum(dz,'render.dither','mode',DITHER_MODES),
              amount:vNum(dz,'render.dither','amount',0,4)},
      webpQuality:vNum(r,'render','webpQuality',0,1)
    },
    background:vColor(o.background,'background'),
    channels:o.channels.map((c,i)=>vChannel(c,'channels['+i+']'))
  };
  const seen=new Set();
  for(const c of doc.channels){ if(seen.has(c.id)) c.id=uid(); seen.add(c.id); }
  return doc;
}

function serializeDoc(doc){
  return {
    format:FORMAT, version:DOC_VERSION, name:doc.name,
    tile:{width:doc.tile.width,height:doc.tile.height},
    render:{stopMix:doc.render.stopMix,
            dither:{mode:doc.render.dither.mode,amount:round4(doc.render.dither.amount)},
            webpQuality:round4(doc.render.webpQuality)},
    background:serColor(doc.background),
    channels:doc.channels.map(c=>({
      id:c.id, name:c.name, enabled:c.enabled, blend:c.blend, opacity:round4(c.opacity),
      noise:{
        type:c.noise.type, sizeX:round4(c.noise.sizeX), sizeY:round4(c.noise.sizeY),
        seed:c.noise.seed, octaves:c.noise.octaves, gain:round4(c.noise.gain),
        lacunarity:c.noise.lacunarity, ridged:c.noise.ridged,
        warpAmount:round4(c.noise.warpAmount), warpSize:round4(c.noise.warpSize),
        worleyMode:c.noise.worleyMode, worleyJitter:round4(c.noise.worleyJitter),
        grainHp:c.noise.grainHp,
        shape:{contrast:round4(c.noise.shape.contrast),bias:round4(c.noise.shape.bias),
               gamma:round4(c.noise.shape.gamma),invert:c.noise.shape.invert,
               normalize:c.noise.shape.normalize}
      },
      low:serColor(c.low), high:serColor(c.high)
    }))
  };
}
function serColor(c){ return {h:round4(c.h),s:round4(c.s),l:round4(c.l),a:round4(c.a)}; }
function round4(v){ return Math.round(v*10000)/10000; }
function cloneDoc(doc){ return validateDoc(serializeDoc(doc),null); }
function rawClone(doc){ return JSON.parse(JSON.stringify(serializeDoc(doc))); }

