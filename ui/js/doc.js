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
function factoryChannel(type){
  return {
    id:uid(), name:NOISE_TYPES[type].label.split(' ')[0], enabled:true,
    blend:'normal', opacity:1,
    noise:factoryNoise(type),
    low :{h:250,s:0.10,l:0.10,a:0.00},
    high:{h:250,s:0.10,l:0.90,a:0.10}
  };
}

/* ---------- строгая проверка (никаких молчаливых умолчаний) ---------- */

function vObj(v,path){
  if(v===null||typeof v!=='object'||Array.isArray(v)) throw new Error(path+': ожидается объект, получено '+jsType(v));
  return v;
}
function jsType(v){ return v===null?'null':Array.isArray(v)?'массив':typeof v; }
function vHas(o,path,key){
  if(!Object.prototype.hasOwnProperty.call(o,key)) throw new Error(path+'.'+key+': поле отсутствует (обязательное)');
}
function vNum(o,path,key,min,max){
  vHas(o,path,key);
  const v=o[key];
  if(typeof v!=='number'||!isFinite(v)) throw new Error(path+'.'+key+': ожидается число, получено '+jsType(v));
  if(v<min||v>max) throw new Error(path+'.'+key+': значение '+v+' вне диапазона ['+min+'; '+max+']');
  return v;
}
function vInt(o,path,key,min,max){
  const v=vNum(o,path,key,min,max);
  if(!Number.isInteger(v)) throw new Error(path+'.'+key+': ожидается целое число, получено '+v);
  return v;
}
function vBool(o,path,key){
  vHas(o,path,key);
  if(typeof o[key]!=='boolean') throw new Error(path+'.'+key+': ожидается true/false, получено '+jsType(o[key]));
  return o[key];
}
function vStr(o,path,key){
  vHas(o,path,key);
  if(typeof o[key]!=='string') throw new Error(path+'.'+key+': ожидается строка, получено '+jsType(o[key]));
  return o[key];
}
function vEnum(o,path,key,allowed){
  const v=vStr(o,path,key);
  if(!(v in allowed)) throw new Error(path+'.'+key+': недопустимое значение "'+v+'". Допустимо: '+Object.keys(allowed).join(', '));
  return v;
}
function vKeys(o,path,allowed){
  for(const k of Object.keys(o)){
    if(allowed.indexOf(k)<0) throw new Error(path+'.'+k+': неизвестное поле. Допустимы: '+allowed.join(', '));
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
  const sp=path+'.shape';
  vHas(o,path,'shape');
  const s=vObj(o.shape,sp);
  vKeys(s,sp,['contrast','bias','gamma','invert','normalize']);
  return {
    type:vEnum(o,path,'type',NOISE_TYPES),
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
    noise:vNoise(o.noise,path+'.noise'),
    low:vColor(o.low,path+'.low'),
    high:vColor(o.high,path+'.high')
  };
}

/** Разбор и проверка документа. Бросает исключение с точным адресом ошибки. */
function validateDoc(raw,src){
  const where=src?' [файл: '+src+']':'';
  let o;
  try{ o=vObj(raw,'документ'); }
  catch(e){ throw new Error(e.message+where); }
  try{
    vKeys(o,'документ',['format','version','name','tile','render','background','channels']);
    const fmt=vStr(o,'документ','format');
    if(fmt!==FORMAT) throw new Error('документ.format: ожидается "'+FORMAT+'", получено "'+fmt+'"');
    const ver=vInt(o,'документ','version',1,1000);
    if(ver!==DOC_VERSION) throw new Error('документ.version: файл версии '+ver+', поддерживается только '+DOC_VERSION);

    vHas(o,'документ','tile');
    const t=vObj(o.tile,'документ.tile');
    vKeys(t,'документ.tile',['width','height']);

    vHas(o,'документ','render');
    const r=vObj(o.render,'документ.render');
    vKeys(r,'документ.render',['stopMix','dither','webpQuality']);
    vHas(r,'документ.render','dither');
    const dz=vObj(r.dither,'документ.render.dither');
    vKeys(dz,'документ.render.dither',['mode','amount']);

    vHas(o,'документ','background');
    vHas(o,'документ','channels');
    if(!Array.isArray(o.channels)) throw new Error('документ.channels: ожидается массив, получено '+jsType(o.channels));

    const doc={
      format:FORMAT, version:DOC_VERSION,
      name:vStr(o,'документ','name'),
      tile:{width:vInt(t,'документ.tile','width',TILE_MIN,TILE_MAX),height:vInt(t,'документ.tile','height',TILE_MIN,TILE_MAX)},
      render:{
        stopMix:vEnum(r,'документ.render','stopMix',STOP_MIX),
        dither:{mode:vEnum(dz,'документ.render.dither','mode',DITHER_MODES),
                amount:vNum(dz,'документ.render.dither','amount',0,4)},
        webpQuality:vNum(r,'документ.render','webpQuality',0,1)
      },
      background:vColor(o.background,'документ.background'),
      channels:o.channels.map((c,i)=>vChannel(c,'документ.channels['+i+']'))
    };
    const seen=new Set();
    for(const c of doc.channels){ if(seen.has(c.id)) c.id=uid(); seen.add(c.id); }
    return doc;
  }catch(e){ throw new Error(e.message+where); }
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

