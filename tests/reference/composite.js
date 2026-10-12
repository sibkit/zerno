"use strict";
/* ЗЕРНО · ЭТАЛОН ДЛЯ ТЕСТОВ: в приложение не входит, считает движок на Rust (engine/).
   режимы наложения и композит документа в линейном свете.
   Зависит от field.js, shape.js и ui/js/color.js. */


const BLEND_ID={normal:0,multiply:1,screen:2,overlay:3,'hard-light':4,'soft-light':5,
  add:6,subtract:7,darken:8,lighten:9,difference:10};

function blendCh(id,d,s){
  switch(id){
    case 1: return d*s;
    case 2: return d+s-d*s;
    case 3: return d<=0.5?2*d*s:1-2*(1-d)*(1-s);
    case 4: return s<=0.5?2*s*d:1-2*(1-s)*(1-d);
    case 5: {
      if(s<=0.5) return d-(1-2*s)*d*(1-d);
      const g=d<=0.25?((16*d-12)*d+4)*d:Math.sqrt(d);
      return d+(2*s-1)*(g-d);
    }
    case 6: { const v=d+s; return v>1?1:v; }
    case 7: { const v=d-s; return v<0?0:v; }
    case 8: return d<s?d:s;
    case 9: return d>s?d:s;
    case 10: { const v=d-s; return v<0?-v:v; }
    default: throw new Error('blendCh: неизвестный идентификатор режима '+id);
  }
}

/** Композит по формуле W3C в линейном свете, непремультиплицированный аккумулятор. */
function compositeChannel(acc,fld,lut,lo,scale,opacity,blend,N){
  const bid=BLEND_ID[blend];
  if(bid===undefined) throw new Error('Неизвестный режим смешивания: "'+blend+'"');
  const top=LUT_N-1;
  for(let p=0,q=0;p<N;p++,q+=4){
    let i=(fld[p]-lo)*scale;
    i=i<0?0:i>top?top:i|0;
    const k=i<<2;
    const sa=lut[k+3]*opacity;
    if(sa<=0) continue;
    const sr=lut[k], sg=lut[k+1], sb=lut[k+2];
    const dr=acc[q], dg=acc[q+1], db=acc[q+2], da=acc[q+3];
    const ao=sa+da*(1-sa);
    if(ao<=0){ acc[q]=0; acc[q+1]=0; acc[q+2]=0; acc[q+3]=0; continue; }
    let R=sr,G=sg,B=sb;
    if(bid!==0){ R=blendCh(bid,dr,sr); G=blendCh(bid,dg,sg); B=blendCh(bid,db,sb); }
    const w1=(1-da)*sa, w2=da*sa, w3=(1-sa)*da, io=1/ao;
    acc[q]  =(w1*sr+w2*R+w3*dr)*io;
    acc[q+1]=(w1*sg+w2*G+w3*dg)*io;
    acc[q+2]=(w1*sb+w2*B+w3*db)*io;
    acc[q+3]=ao;
  }
}

/** Аккумулятор линейного RGBA для документа. */
function composeDoc(doc,W,H){
  const N=W*H;
  const acc=new Float32Array(N*4);
  const bg=okhslToLinear(doc.background);
  const ba=doc.background.a;
  for(let p=0,q=0;p<N;p++,q+=4){ acc[q]=bg[0]; acc[q+1]=bg[1]; acc[q+2]=bg[2]; acc[q+3]=ba; }
  for(const ch of doc.channels){
    if(!ch.enabled) continue;
    const F=getField(ch.noise,W,H);
    const lut=buildStopLut(ch,doc.render.stopMix);
    const lo=ch.noise.shape.normalize?F.min:F.cmin;
    const hi=ch.noise.shape.normalize?F.max:F.cmax;
    const scale=hi>lo?(LUT_N-1)/(hi-lo):0;
    compositeChannel(acc,F.data,lut,lo,scale,ch.opacity,ch.blend,N);
  }
  return acc;
}

