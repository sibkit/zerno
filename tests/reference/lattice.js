"use strict";
/* ЗЕРНО · хэш и периодические решётки шума.
   Ни от чего не зависит. Решётки строятся по модулю числа ячеек — отсюда бесшовность. */


function hash2i(x,y,seed){
  let h=Math.imul(x|0,0x27d4eb2d)^Math.imul(y|0,0x165667b1)^Math.imul(seed|0,0x9e3779b1);
  h^=h>>>15; h=Math.imul(h,0x85ebca6b);
  h^=h>>>13; h=Math.imul(h,0xc2b2ae35);
  h^=h>>>16;
  return h>>>0;
}

const GRAD_N=256;
const GCOS=new Float32Array(GRAD_N), GSIN=new Float32Array(GRAD_N);
for(let i=0;i<GRAD_N;i++){ const a=i*2*Math.PI/GRAD_N; GCOS[i]=Math.cos(a); GSIN[i]=Math.sin(a); }

function fade(t){ return t*t*t*(t*(t*6-15)+10); }

/** Периодическая решётка градиентов px×py. */
function latticeGrad(px,py,seed){
  const gx=new Float32Array(px*py), gy=new Float32Array(px*py);
  for(let j=0;j<py;j++){
    const r=j*px;
    for(let i=0;i<px;i++){
      const h=hash2i(i,j,seed)&(GRAD_N-1);
      gx[r+i]=GCOS[h]; gy[r+i]=GSIN[h];
    }
  }
  return {gx,gy,px,py};
}
/** Периодическая решётка скаляров px×py в [-1,1). */
function latticeVal(px,py,seed){
  const v=new Float32Array(px*py);
  for(let j=0;j<py;j++){
    const r=j*px;
    for(let i=0;i<px;i++) v[r+i]=(hash2i(i,j,seed)>>>8)/16777216*2-1;
  }
  return {v,px,py};
}

function perlinSample(L,x,y){
  const px=L.px, py=L.py, gx=L.gx, gy=L.gy;
  const x0=Math.floor(x), y0=Math.floor(y);
  const fx=x-x0, fy=y-y0;
  const u=fade(fx), v=fade(fy);
  let i0=x0%px; if(i0<0) i0+=px;
  let j0=y0%py; if(j0<0) j0+=py;
  let i1=i0+1; if(i1===px) i1=0;
  let j1=j0+1; if(j1===py) j1=0;
  const r0=j0*px, r1=j1*px;
  const n00=gx[r0+i0]*fx     + gy[r0+i0]*fy;
  const n10=gx[r0+i1]*(fx-1) + gy[r0+i1]*fy;
  const n01=gx[r1+i0]*fx     + gy[r1+i0]*(fy-1);
  const n11=gx[r1+i1]*(fx-1) + gy[r1+i1]*(fy-1);
  const a=n00+u*(n10-n00), b=n01+u*(n11-n01);
  return a+v*(b-a);
}

function valueSample(L,x,y){
  const px=L.px, py=L.py, val=L.v;
  const x0=Math.floor(x), y0=Math.floor(y);
  const u=fade(x-x0), v=fade(y-y0);
  let i0=x0%px; if(i0<0) i0+=px;
  let j0=y0%py; if(j0<0) j0+=py;
  let i1=i0+1; if(i1===px) i1=0;
  let j1=j0+1; if(j1===py) j1=0;
  const r0=j0*px, r1=j1*px;
  const a=val[r0+i0]+u*(val[r0+i1]-val[r0+i0]);
  const b=val[r1+i0]+u*(val[r1+i1]-val[r1+i0]);
  return a+v*(b-a);
}

/** Периодические точки Ворлея: cx×cy ячеек, по точке в ячейке. */
function worleyPoints(cx,cy,seed,jitter){
  const px=new Float32Array(cx*cy), py=new Float32Array(cx*cy);
  for(let j=0;j<cy;j++){
    const r=j*cx;
    for(let i=0;i<cx;i++){
      const h1=hash2i(i,j,seed), h2=hash2i(i,j,seed^0x9e3779b9);
      px[r+i]=i+0.5+jitter*(((h1>>>8)/16777216)-0.5);
      py[r+i]=j+0.5+jitter*(((h2>>>8)/16777216)-0.5);
    }
  }
  return {px,py,cx,cy};
}


function worleySample(P,x,y,mode){
  const cx=P.cx, cy=P.cy, ppx=P.px, ppy=P.py;
  const ci=Math.floor(x), cj=Math.floor(y);
  let d1=1e30, d2=1e30;
  for(let dj=-1;dj<=1;dj++){
    const jj=cj+dj;
    let jw=jj%cy; if(jw<0) jw+=cy;
    const offJ=jj-jw, r=jw*cx;
    for(let di=-1;di<=1;di++){
      const ii=ci+di;
      let iw=ii%cx; if(iw<0) iw+=cx;
      const dx=ppx[r+iw]+(ii-iw)-x;
      const dy=ppy[r+iw]+offJ-y;
      const d=dx*dx+dy*dy;
      if(d<d1){ d2=d1; d1=d; } else if(d<d2){ d2=d; }
    }
  }
  switch(mode){
    case 'f1':   return Math.sqrt(d1);
    case 'f2':   return Math.sqrt(d2);
    case 'f2f1': return Math.sqrt(d2)-Math.sqrt(d1);
    default: throw new Error('worleySample: неизвестный режим "'+mode+'"');
  }
}

/* Круговое (заворачивающееся) размытие «коробкой» — сохраняет бесшовность. */
function boxBlurWrapH(src,dst,W,H,r){
  const win=2*r+1;
  for(let y=0;y<H;y++){
    const o=y*W;
    let sum=0;
    for(let k=-r;k<=r;k++){ let i=k%W; if(i<0) i+=W; sum+=src[o+i]; }
    for(let x=0;x<W;x++){
      dst[o+x]=sum/win;
      let a=(x-r)%W; if(a<0) a+=W;
      let b=(x+r+1)%W; if(b<0) b+=W;
      sum+=src[o+b]-src[o+a];
    }
  }
}
function boxBlurWrapV(src,dst,W,H,r){
  const win=2*r+1;
  for(let x=0;x<W;x++){
    let sum=0;
    for(let k=-r;k<=r;k++){ let j=k%H; if(j<0) j+=H; sum+=src[j*W+x]; }
    for(let y=0;y<H;y++){
      dst[y*W+x]=sum/win;
      let a=(y-r)%H; if(a<0) a+=H;
      let b=(y+r+1)%H; if(b<0) b+=H;
      sum+=src[b*W+x]-src[a*W+x];
    }
  }
}

