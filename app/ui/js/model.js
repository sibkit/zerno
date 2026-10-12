"use strict";
/* ЗЕРНО · словари модели документа и правило решётки.
   Общие для интерфейса и эталонного движка (tests/reference). Ни от чего не зависит.
   Ключи словарей — допустимые значения в файле, порядок ключей — порядок в списках. */

const NOISE_TYPES={
  perlin:{label:'Перлин — облака',  octaves:true,  ridged:true,  warp:true },
  value: {label:'Value — мягкий',   octaves:true,  ridged:true,  warp:true },
  worley:{label:'Ворлей — пятна',   octaves:true,  ridged:false, warp:true },
  grain: {label:'Зерно — плёнка',   octaves:false, ridged:false, warp:false}
};

const WORLEY_MODES={f1:'F1 — пятна',f2:'F2 — вторая точка',f2f1:'F2−F1 — ячейки/трещины'};

const BLEND_MODES={
  normal:'Обычный', multiply:'Умножение', screen:'Экран', overlay:'Перекрытие',
  'hard-light':'Жёсткий свет','soft-light':'Мягкий свет', add:'Сложение',
  subtract:'Вычитание', darken:'Замена тёмным', lighten:'Замена светлым', difference:'Разница'
};

const STOP_MIX={oklab:'OKLab (перцептивно)','srgb-linear':'Линейный sRGB (физично)'};

const DITHER_MODES={tpdf:'TPDF (шумовой)',ordered:'Байер 8×8',off:'Выключен'};

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
