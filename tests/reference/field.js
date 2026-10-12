"use strict";
/* ЗЕРНО · ЭТАЛОН ДЛЯ ТЕСТОВ: в приложение не входит, считает движок на Rust (engine/).
   построение поля шума: октавы, искажение домена, кэш полей.
   Зависит от lattice.js и app/ui/js/model.js.

   Гарантия стыковки: любое поле шума строится на решётке, у которой число
   ячеек на плитку — ЦЕЛОЕ. Координата выборки x = X * cells / W при X = W
   даёт ровно `cells`, то есть ровно период решётки. Значит левый край
   плитки тождественно равен правому, верхний — нижнему, без «швов». */





function fieldKey(n,W,H){
  return [W,H,n.type,n.sizeX,n.sizeY,n.seed,n.octaves,n.gain,n.lacunarity,
          n.ridged?1:0,n.warpAmount,n.warpSize,n.worleyMode,n.worleyJitter,n.grainHp].join('|');
}

/**
 * Строит поле шума размером W×H. Возвращает
 * {data, min, max, cmin, cmax, octavesUsed} — cmin/cmax это канонический
 * диапазон типа (используется, когда нормализация выключена).
 */
function buildField(n,W,H){
  if(!(n.type in NOISE_TYPES)) throw new Error('buildField: неизвестный тип шума "'+n.type+'"');
  const N=W*H;
  const out=new Float32Array(N);

  if(n.type==='grain'){
    const bx=Math.min(W,Math.max(1,Math.round(W/n.sizeX)));
    const by=Math.min(H,Math.max(1,Math.round(H/n.sizeY)));
    for(let Y=0;Y<H;Y++){
      const j=(Y*by/H)|0, r=Y*W;
      for(let X=0;X<W;X++) out[r+X]=(hash2i((X*bx/W)|0,j,n.seed)>>>8)/16777216;
    }
    if(n.grainHp>0){
      const r=Math.max(1,Math.round(n.grainHp));
      const t1=new Float32Array(N), t2=new Float32Array(N);
      boxBlurWrapH(out,t1,W,H,r);
      boxBlurWrapV(t1,t2,W,H,r);
      for(let p=0;p<N;p++) out[p]=out[p]-t2[p]+0.5;
    }
    return finishField(out,N,0,1,1);
  }

  if(n.sizeX<MIN_CELL_PX||n.sizeY<MIN_CELL_PX)
    throw new Error('Тип «'+NOISE_TYPES[n.type].label+'»: размер пятна '+n.sizeX+'×'+n.sizeY+
      ' px меньше '+MIN_CELL_PX+' px — на такой решётке шум вырождается. '+
      'Увеличьте размер пятна или возьмите тип «Зерно», он рассчитан на 1 px.');
  const [cx0,cy0]=baseCells(n,W,H);
  const octaves=NOISE_TYPES[n.type].octaves ? Math.min(n.octaves,maxOctavesFor(n,W,H)) : 1;

  /* Поле искажения домена. Оно тоже W/H-периодично, поэтому composition
     остаётся точно бесшовной. */
  let wxF=null, wyF=null;
  if(n.warpAmount>0){
    const wcx=Math.max(1,Math.round(W/n.warpSize));
    const wcy=Math.max(1,Math.round(H/n.warpSize));
    const Lx=latticeGrad(wcx,wcy,(n.seed^0x51ed270b)|0);
    const Ly=latticeGrad(wcx,wcy,(n.seed^0x2545f491)|0);
    wxF=new Float32Array(N); wyF=new Float32Array(N);
    const sx=wcx/W, sy=wcy/H;
    for(let Y=0;Y<H;Y++){
      const y=Y*sy, r=Y*W;
      for(let X=0;X<W;X++){
        const x=X*sx;
        wxF[r+X]=perlinSample(Lx,x,y)*1.4142136;
        wyF[r+X]=perlinSample(Ly,x,y)*1.4142136;
      }
    }
  }

  let amp=1, norm=0;
  for(let o=0;o<octaves;o++){
    const f=Math.round(Math.pow(n.lacunarity,o));
    const px=cx0*f, py=cy0*f;
    const sx=px/W, sy=py/H;
    const wax=n.warpAmount*sx, way=n.warpAmount*sy;
    const ridged=n.ridged&&NOISE_TYPES[n.type].ridged;

    if(n.type==='perlin'||n.type==='value'){
      const L=n.type==='perlin'
        ? latticeGrad(px,py,(n.seed+o*7919)|0)
        : latticeVal(px,py,(n.seed+o*7919)|0);
      const smp=n.type==='perlin'?perlinSample:valueSample;
      const k=n.type==='perlin'?1.4142136:1;
      for(let Y=0;Y<H;Y++){
        const y0=Y*sy, r=Y*W;
        for(let X=0;X<W;X++){
          const p=r+X;
          const x=wxF?X*sx+wxF[p]*wax:X*sx;
          const y=wxF?y0+wyF[p]*way:y0;
          let v=smp(L,x,y)*k;
          if(ridged){ v=1-Math.abs(v); v=v*2-1; }
          out[p]+=amp*v;
        }
      }
    }else if(n.type==='worley'){
      const P=worleyPoints(px,py,(n.seed+o*7919)|0,n.worleyJitter);
      const mode=n.worleyMode;
      for(let Y=0;Y<H;Y++){
        const y0=Y*sy, r=Y*W;
        for(let X=0;X<W;X++){
          const p=r+X;
          const x=wxF?X*sx+wxF[p]*wax:X*sx;
          const y=wxF?y0+wyF[p]*way:y0;
          out[p]+=amp*worleySample(P,x,y,mode);
        }
      }
    }else{
      throw new Error('buildField: неизвестный тип шума "'+n.type+'"');
    }
    norm+=amp;
    amp*=n.gain;
  }

  const inv=1/norm;
  for(let p=0;p<N;p++) out[p]*=inv;

  const signed=(n.type==='perlin'||n.type==='value');
  return finishField(out,N,signed?-1:0,1,octaves);
}

function finishField(out,N,cmin,cmax,octavesUsed){
  let mn=Infinity, mx=-Infinity;
  for(let p=0;p<N;p++){ const v=out[p]; if(v<mn) mn=v; if(v>mx) mx=v; }
  return {data:out,min:mn,max:mx,cmin:cmin,cmax:cmax,octavesUsed:octavesUsed};
}

/* Кэш полей: правка цвета/формы не пересчитывает шум. */
const fieldCache=new Map();
const FIELD_CACHE_MAX=28;
function getField(n,W,H){
  const key=fieldKey(n,W,H);
  const hit=fieldCache.get(key);
  if(hit){ fieldCache.delete(key); fieldCache.set(key,hit); return hit; }
  const f=buildField(n,W,H);
  fieldCache.set(key,f);
  while(fieldCache.size>FIELD_CACHE_MAX) fieldCache.delete(fieldCache.keys().next().value);
  return f;
}

