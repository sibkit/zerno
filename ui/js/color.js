"use strict";
/* ЗЕРНО · цвет: Oklab и OKHSL (Björn Ottosson).
   Ни от чего не зависит. Даёт перевод OKHSL↔sRGB, HEX и таблицу гаммы. */

/* Реализация по Björn Ottosson (bottosson.github.io/posts/oklab). */

function srgbTransfer(a){ return a<=0.0031308 ? 12.92*a : 1.055*Math.pow(a,1/2.4)-0.055; }
function srgbTransferInv(a){ return a<=0.04045 ? a/12.92 : Math.pow((a+0.055)/1.055,2.4); }

function oklabToLinearSrgb(L,a,b){
  const l_=L+0.3963377774*a+0.2158037573*b;
  const m_=L-0.1055613458*a-0.0638541728*b;
  const s_=L-0.0894841775*a-1.2914855480*b;
  const l=l_*l_*l_, m=m_*m_*m_, s=s_*s_*s_;
  return [
    +4.0767416621*l-3.3077115913*m+0.2309699292*s,
    -1.2684380046*l+2.6097574011*m-0.3413193965*s,
    -0.0041960863*l-0.7034186147*m+1.7076147010*s
  ];
}
function linearSrgbToOklab(r,g,b){
  const l=0.4122214708*r+0.5363325363*g+0.0514459929*b;
  const m=0.2119034982*r+0.6806995451*g+0.1073969566*b;
  const s=0.0883024619*r+0.2817188376*g+0.6299787005*b;
  const l_=Math.cbrt(l), m_=Math.cbrt(m), s_=Math.cbrt(s);
  return [
    0.2104542553*l_+0.7936177850*m_-0.0040720468*s_,
    1.9779984951*l_-2.4285922050*m_+0.4505937099*s_,
    0.0259040371*l_+0.7827717662*m_-0.8086757660*s_
  ];
}

function computeMaxSaturation(a,b){
  let k0,k1,k2,k3,k4,wl,wm,ws;
  if(-1.88170328*a-0.80936493*b>1){
    k0=1.19086277;k1=1.76576728;k2=0.59662641;k3=0.75515197;k4=0.56771245;
    wl=4.0767416621;wm=-3.3077115913;ws=0.2309699292;
  }else if(1.81444104*a-1.19445276*b>1){
    k0=0.73956515;k1=-0.45954404;k2=0.08285427;k3=0.12541070;k4=0.14503204;
    wl=-1.2684380046;wm=2.6097574011;ws=-0.3413193965;
  }else{
    k0=1.35733652;k1=-0.00915799;k2=-1.15130210;k3=-0.50559606;k4=0.00692167;
    wl=-0.0041960863;wm=-0.7034186147;ws=1.7076147010;
  }
  let S=k0+k1*a+k2*b+k3*a*a+k4*a*b;
  const kl=0.3963377774*a+0.2158037573*b;
  const km=-0.1055613458*a-0.0638541728*b;
  const ks=-0.0894841775*a-1.2914855480*b;
  const l_=1+S*kl, m_=1+S*km, s_=1+S*ks;
  const l=l_*l_*l_, m=m_*m_*m_, s=s_*s_*s_;
  const ld=3*kl*l_*l_, md=3*km*m_*m_, sd=3*ks*s_*s_;
  const ld2=6*kl*kl*l_, md2=6*km*km*m_, sd2=6*ks*ks*s_;
  const f=wl*l+wm*m+ws*s;
  const f1=wl*ld+wm*md+ws*sd;
  const f2=wl*ld2+wm*md2+ws*sd2;
  return S-f*f1/(f1*f1-0.5*f*f2);
}

function findCusp(a,b){
  const S=computeMaxSaturation(a,b);
  const rgb=oklabToLinearSrgb(1,S*a,S*b);
  const L=Math.cbrt(1/Math.max(rgb[0],rgb[1],rgb[2]));
  return [L,L*S];
}

function findGamutIntersection(a,b,L1,C1,L0,cusp){
  let t;
  if((L1-L0)*cusp[1]-(cusp[0]-L0)*C1<=0){
    t=cusp[1]*L0/(C1*cusp[0]+cusp[1]*(L0-L1));
  }else{
    t=cusp[1]*(L0-1)/(C1*(cusp[0]-1)+cusp[1]*(L0-L1));
    const dL=L1-L0, dC=C1;
    const kl=0.3963377774*a+0.2158037573*b;
    const km=-0.1055613458*a-0.0638541728*b;
    const ks=-0.0894841775*a-1.2914855480*b;
    const ldt=dL+dC*kl, mdt=dL+dC*km, sdt=dL+dC*ks;
    const L=L0*(1-t)+t*L1, C=t*C1;
    const l_=L+C*kl, m_=L+C*km, s_=L+C*ks;
    const l=l_*l_*l_, m=m_*m_*m_, s=s_*s_*s_;
    const ld=3*ldt*l_*l_, md=3*mdt*m_*m_, sd=3*sdt*s_*s_;
    const ld2=6*ldt*ldt*l_, md2=6*mdt*mdt*m_, sd2=6*sdt*sdt*s_;
    const r =4.0767416621*l -3.3077115913*m +0.2309699292*s -1;
    const r1=4.0767416621*ld-3.3077115913*md+0.2309699292*sd;
    const r2=4.0767416621*ld2-3.3077115913*md2+0.2309699292*sd2;
    const ur=r1/(r1*r1-0.5*r*r2); let tr=-r*ur;
    const g =-1.2684380046*l +2.6097574011*m -0.3413193965*s -1;
    const g1=-1.2684380046*ld+2.6097574011*md-0.3413193965*sd;
    const g2=-1.2684380046*ld2+2.6097574011*md2-0.3413193965*sd2;
    const ug=g1/(g1*g1-0.5*g*g2); let tg=-g*ug;
    const bb =-0.0041960863*l -0.7034186147*m +1.7076147010*s -1;
    const b1=-0.0041960863*ld-0.7034186147*md+1.7076147010*sd;
    const b2=-0.0041960863*ld2-0.7034186147*md2+1.7076147010*sd2;
    const ub=b1/(b1*b1-0.5*bb*b2); let tb=-bb*ub;
    tr=ur>=0?tr:1e30; tg=ug>=0?tg:1e30; tb=ub>=0?tb:1e30;
    t+=Math.min(tr,Math.min(tg,tb));
  }
  return t;
}

const TOE_K1=0.206, TOE_K2=0.03, TOE_K3=(1+TOE_K1)/(1+TOE_K2);
function toe(x){ return 0.5*(TOE_K3*x-TOE_K1+Math.sqrt((TOE_K3*x-TOE_K1)*(TOE_K3*x-TOE_K1)+4*TOE_K2*TOE_K3*x)); }
function toeInv(x){ return (x*x+TOE_K1*x)/(TOE_K3*(x+TOE_K2)); }
function toST(cusp){ return [cusp[1]/cusp[0], cusp[1]/(1-cusp[0])]; }

function getSTMid(a,b){
  const S=0.11516993+1/(7.44778970+4.15901240*b
    +a*(-2.19557347+1.75198401*b
    +a*(-2.13704948-10.02301043*b
    +a*(-4.24894561+5.38770819*b+4.69891013*a))));
  const T=0.11239642+1/(1.61320320-0.68124379*b
    +a*(0.40370612+0.90148123*b
    +a*(-0.27087943+0.61223990*b
    +a*(0.00299215-0.45399568*b-0.14661872*a))));
  return [S,T];
}

function getCs(L,a,b){
  const cusp=findCusp(a,b);
  const Cmax=findGamutIntersection(a,b,L,1,L,cusp);
  const STmax=toST(cusp);
  const k=Cmax/Math.min(L*STmax[0],(1-L)*STmax[1]);
  const STmid=getSTMid(a,b);
  const ca=L*STmid[0], cb=(1-L)*STmid[1];
  const Cmid=0.9*k*Math.sqrt(Math.sqrt(1/(1/(ca*ca*ca*ca)+1/(cb*cb*cb*cb))));
  const ca0=L*0.4, cb0=(1-L)*0.8;
  const C0=Math.sqrt(1/(1/(ca0*ca0)+1/(cb0*cb0)));
  return [C0,Cmid,Cmax];
}

const OK_MID=0.8, OK_MID_INV=1.25;

/** OKHSL (h∈[0,360), s∈[0,1], l∈[0,1]) → Oklab [L,a,b]. */
function okhslToOklab(h,s,l){
  if(l>=1) return [1,0,0];
  if(l<=0) return [0,0,0];
  const hr=h/360*2*Math.PI;
  const a_=Math.cos(hr), b_=Math.sin(hr);
  const L=toeInv(l);
  if(s<=0) return [L,0,0];
  const [C0,Cmid,Cmax]=getCs(L,a_,b_);
  let C;
  if(s<OK_MID){
    const t=OK_MID_INV*s;
    const k1=OK_MID*C0;
    const k2=1-k1/Cmid;
    C=t*k1/(1-k2*t);
  }else{
    const t=(s-OK_MID)/(1-OK_MID);
    const k0=Cmid;
    const k1=(1-OK_MID)*Cmid*Cmid*OK_MID_INV*OK_MID_INV/C0;
    const k2=1-k1/(Cmax-Cmid);
    C=k0+t*k1/(1-k2*t);
  }
  return [L,C*a_,C*b_];
}

/** sRGB 0..255 → OKHSL {h,s,l}. */
function srgbToOkhsl(r,g,b){
  const lab=linearSrgbToOklab(srgbTransferInv(r/255),srgbTransferInv(g/255),srgbTransferInv(b/255));
  const L=lab[0];
  const C=Math.sqrt(lab[1]*lab[1]+lab[2]*lab[2]);
  const l=toe(L);
  if(C<1e-7||L<=0||L>=1) return {h:0,s:0,l:Math.max(0,Math.min(1,l))};
  const a_=lab[1]/C, b_=lab[2]/C;
  let h=0.5+0.5*Math.atan2(-lab[2],-lab[1])/Math.PI;
  const [C0,Cmid,Cmax]=getCs(L,a_,b_);
  let s;
  if(C<Cmid){
    const k1=OK_MID*C0;
    const k2=1-k1/Cmid;
    s=(C/(k1+k2*C))*OK_MID;
  }else{
    const k0=Cmid;
    const k1=(1-OK_MID)*Cmid*Cmid*OK_MID_INV*OK_MID_INV/C0;
    const k2=1-k1/(Cmax-Cmid);
    s=OK_MID+(1-OK_MID)*((C-k0)/(k1+k2*(C-k0)));
  }
  return {h:h*360, s:Math.max(0,Math.min(1,s)), l:Math.max(0,Math.min(1,l))};
}

const clamp01=v=>v<0?0:v>1?1:v;

/** OKHSL → линейный sRGB [r,g,b] (0..1, уже в гамуте по построению). */
function okhslToLinear(c){
  const [L,a,b]=okhslToOklab(c.h,c.s,c.l);
  const rgb=oklabToLinearSrgb(L,a,b);
  return [clamp01(rgb[0]),clamp01(rgb[1]),clamp01(rgb[2])];
}
function okhslToBytes(c){
  const lin=okhslToLinear(c);
  return [Math.round(srgbTransfer(lin[0])*255),Math.round(srgbTransfer(lin[1])*255),Math.round(srgbTransfer(lin[2])*255)];
}
function okhslToCss(c,alpha){
  const [r,g,b]=okhslToBytes(c);
  const a=alpha===undefined?(c.a===undefined?1:c.a):alpha;
  return 'rgba('+r+','+g+','+b+','+(Math.round(a*1000)/1000)+')';
}
function okhslToHex(c){
  const [r,g,b]=okhslToBytes(c);
  return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
}
function hexToOkhsl(hex){
  const m=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if(!m) throw new Error('Некорректный HEX: "'+hex+'". Ожидается #RGB или #RRGGBB.');
  let s=m[1];
  if(s.length===3) s=s[0]+s[0]+s[1]+s[1]+s[2]+s[2];
  return srgbToOkhsl(parseInt(s.slice(0,2),16),parseInt(s.slice(2,4),16),parseInt(s.slice(4,6),16));
}

/* Таблица линейный → sRGB, чтобы убрать Math.pow из горячего цикла. */
const SR_N=16385;
const SRLUT=new Float32Array(SR_N);
for(let i=0;i<SR_N;i++) SRLUT[i]=srgbTransfer(i/(SR_N-1));
function lin2srgb(a){
  if(a<=0) return 0;
  if(a>=1) return 1;
  const f=a*(SR_N-1), i=f|0, t=f-i;
  const v0=SRLUT[i], v1=SRLUT[i+1];
  return v0+(v1-v0)*t;
}

