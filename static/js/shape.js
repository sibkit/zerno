"use strict";
/* ЗЕРНО · форма значения и цветовая таблица канала.
   Зависит от color.js. */


function shapeValue(t,sh){
  if(sh.invert) t=1-t;
  const c=sh.contrast;
  const slope=c>=0?1/(1-c*0.985):1+c;
  t=(t-0.5)*slope+0.5+sh.bias;
  t=t<0?0:t>1?1:t;
  if(sh.gamma!==1) t=Math.pow(t,sh.gamma);
  return t<0?0:t>1?1:t;
}

const LUT_N=2048;
const STOP_MIX={oklab:'OKLab (перцептивно)','srgb-linear':'Линейный sRGB (физично)'};

/** Таблица цвета канала: индекс = нормированное значение шума. */
function buildStopLut(ch,mixSpace){
  if(!(mixSpace in STOP_MIX)) throw new Error('Неизвестное пространство смешивания: "'+mixSpace+'"');
  const lut=new Float32Array(LUT_N*4);
  const A=okhslToOklab(ch.low.h,ch.low.s,ch.low.l);
  const B=okhslToOklab(ch.high.h,ch.high.s,ch.high.l);
  const Al=okhslToLinear(ch.low), Bl=okhslToLinear(ch.high);
  const sh=ch.noise.shape;
  for(let i=0;i<LUT_N;i++){
    const t=shapeValue(i/(LUT_N-1),sh);
    let r,g,b;
    if(mixSpace==='oklab'){
      const rgb=oklabToLinearSrgb(A[0]+(B[0]-A[0])*t, A[1]+(B[1]-A[1])*t, A[2]+(B[2]-A[2])*t);
      r=rgb[0]; g=rgb[1]; b=rgb[2];
    }else{
      r=Al[0]+(Bl[0]-Al[0])*t; g=Al[1]+(Bl[1]-Al[1])*t; b=Al[2]+(Bl[2]-Al[2])*t;
    }
    const k=i<<2;
    lut[k]=clamp01(r); lut[k+1]=clamp01(g); lut[k+2]=clamp01(b);
    lut[k+3]=clamp01(ch.low.a+(ch.high.a-ch.low.a)*t);
  }
  return lut;
}

