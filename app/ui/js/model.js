"use strict";
/* ЗЕРНО · словари модели документа и правило решётки.
   Общие для интерфейса и эталонного движка (tests/reference). Ни от чего не зависит.
   Порядок значений — порядок в списках интерфейса. */

/* Подписи — в словарях (noise.<тип>, blend.<режим> и т. д.), здесь только
   допустимые значения и свойства типов. */
const NOISE_TYPES={
  perlin:{octaves:true,  ridged:true,  warp:true },
  value: {octaves:true,  ridged:true,  warp:true },
  worley:{octaves:true,  ridged:false, warp:true },
  grain: {octaves:false, ridged:false, warp:false}
};
const NOISE_TYPE_KEYS=Object.keys(NOISE_TYPES);

const WORLEY_MODES=['f1','f2','f2f1'];

const BLEND_MODES=['normal','multiply','screen','overlay','hard-light','soft-light','add',
  'subtract','darken','lighten','difference'];

const STOP_MIX=['oklab','srgb-linear'];

const DITHER_MODES=['tpdf','ordered','off'];

/* Ячейка решётки мельче 2 px вырождается: у Перлина при ровно 1 px значение
   в узлах тождественно ноль. Поэтому это предел и для октав, и для базы. */
const MIN_CELL_PX=2;

/* Пределы стороны плитки — те же, что проверяет движок (engine/src/doc.rs). */
const TILE_MIN=8, TILE_MAX=4096;

/** Число ячеек базовой октавы. Сверху ограничено физикой: ячейка ≥ 2 px. */
function baseCells(n,W,H){
  const lim=d=>Math.max(1,Math.floor(d/MIN_CELL_PX));
  return [
    Math.max(1,Math.min(lim(W),Math.round(W/n.sizeX))),
    Math.max(1,Math.min(lim(H),Math.round(H/n.sizeY)))
  ];
}

/** Наибольшее число ячеек на сторону D: у решётки ячейка не меньше MIN_CELL_PX,
    у зерна — не меньше пикселя. То же правило, что у движка (base_cells, build_grain). */
function maxCellsFor(type,D){ return type==='grain'?D:Math.max(1,Math.floor(D/MIN_CELL_PX)); }

/** Сколько ячеек ляжет на сторону D при размере пятна s. Картинка зависит только
    от этого числа: размер меняет её ступенями, а не плавно. */
function cellsFor(type,s,D){ return Math.max(1,Math.min(maxCellsFor(type,D),Math.round(D/s))); }

function maxOctavesFor(n,W,H){
  const [cx,cy]=baseCells(n,W,H);
  let o=1;
  while(o<12 && cx*Math.pow(n.lacunarity,o)*MIN_CELL_PX<=W
             && cy*Math.pow(n.lacunarity,o)*MIN_CELL_PX<=H) o++;
  return o;
}
