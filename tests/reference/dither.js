"use strict";
/* ЗЕРНО · дизеринг и вывод: аккумулятор → ImageData → canvas.
   Зависит от color.js и composite.js. */


const BAYER8=(function(){
  const m=new Float32Array(64);
  const base=[0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,
              60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,
              15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21];
  for(let i=0;i<64;i++) m[i]=(base[i]+0.5)/64-0.5;
  return m;
})();


/* Позиционный TPDF: значение зависит только от координат пикселя, поэтому
   не зависит от порядка обхода. Так серверный движок на Zig, считающий
   плитку в несколько потоков, даёт ровно ту же картинку. */
const DITHER_SALT=[0x1a2b3c4d|0,0x51ed2701|0,0x2545f491|0,0x9e3779b1|0];
function ditherTpdf(x,y,comp,amt){
  const h=hash2i(x,y,DITHER_SALT[comp]);
  return (((h>>>16)/65536)+((h&0xffff)/65536)-1)*amt;
}

/** Линейный RGBA-аккумулятор → ImageData (sRGB 8 бит) с дизерингом. */
function accToImageData(acc,W,H,dither){
  const N=W*H;
  const img=new ImageData(W,H);
  const d=img.data;
  const mode=dither.mode;
  if(!(mode in DITHER_MODES)) throw new Error('Неизвестный режим дизеринга: "'+mode+'"');
  const amt=mode==='off'?0:dither.amount;
  for(let Y=0;Y<H;Y++){
    const by=(Y&7)<<3;
    for(let X=0;X<W;X++){
      const p=Y*W+X, q=p<<2;
      let e0,e1,e2,e3;
      if(amt===0){ e0=e1=e2=e3=0; }
      else if(mode==='ordered'){ e0=e1=e2=e3=BAYER8[by+(X&7)]*amt; }
      else { e0=ditherTpdf(X,Y,0,amt); e1=ditherTpdf(X,Y,1,amt);
             e2=ditherTpdf(X,Y,2,amt); e3=ditherTpdf(X,Y,3,amt); }
      /* Дизерим только там, где квантование действительно даёт ошибку.
         Значение, точно ложащееся на 8-битный уровень (например альфа=1
         или чистый чёрный), шумом только испортится крапом. */
      let v;
      v=lin2srgb(acc[q])*255;   if(Math.abs(v-Math.round(v))>1e-4) v+=e0;
      d[q]  =v<0?0:v>255?255:(v+0.5)|0;
      v=lin2srgb(acc[q+1])*255; if(Math.abs(v-Math.round(v))>1e-4) v+=e1;
      d[q+1]=v<0?0:v>255?255:(v+0.5)|0;
      v=lin2srgb(acc[q+2])*255; if(Math.abs(v-Math.round(v))>1e-4) v+=e2;
      d[q+2]=v<0?0:v>255?255:(v+0.5)|0;
      v=acc[q+3]*255;           if(Math.abs(v-Math.round(v))>1e-4) v+=e3;
      d[q+3]=v<0?0:v>255?255:(v+0.5)|0;
    }
  }
  return img;
}

/** Полный рендер документа в новый canvas. */
function renderToCanvas(doc,W,H){
  const w=W||doc.tile.width, h=H||doc.tile.height;
  const acc=composeDoc(doc,w,h);
  const img=accToImageData(acc,w,h,doc.render.dither);
  const c=document.createElement('canvas');
  c.width=w; c.height=h;
  c.getContext('2d',{willReadFrequently:false}).putImageData(img,0,0);
  return c;
}

