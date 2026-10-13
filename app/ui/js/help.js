"use strict";
/* ЗЕРНО · справка: одно окно, разделы — <article data-topic data-title> из
   словаря языка (i18n/<код>.js, поле help). Значок «?» у группы открывает её раздел, F1 и «?» в верхней
   панели — «Начало». Зависит от i18n.js и ui-kit.js (el, $). */

function helpArticle(topic){
  const a=$('helpBody').querySelector(':scope>article[data-topic="'+topic+'"]');
  if(!a) throw new Error('Справка: нет раздела «'+topic+'»');
  return a;
}

function openHelp(topic){
  const a=helpArticle(topic);
  for(const x of $('helpBody').children) x.hidden=x!==a;
  for(const b of $('helpNav').children) b.classList.toggle('on',b.dataset.topic===topic);
  $('help').hidden=false;
  $('helpBody').scrollTop=0;
}
function closeHelp(){ $('help').hidden=true; }

/** Значок «?» группы. Раздел проверяется сразу; клик не сворачивает группу. */
function helpBtn(topic){
  helpArticle(topic);
  const b=el('button','help-i','?');
  b.dataset.help=topic;
  b.addEventListener('click',e=>{ e.stopPropagation(); openHelp(topic); });
  return b;
}

/** Статьи и оглавление — из словаря текущего языка; зовётся и при смене языка. */
function renderHelp(){
  const body=$('helpBody'), nav=$('helpNav');
  body.innerHTML=LANGS[lang].help;
  nav.innerHTML='';
  for(const a of body.children){
    if(a.tagName!=='ARTICLE'||!a.dataset.topic||!a.dataset.title)
      throw new Error('Справка ('+lang+'): допустимы только <article data-topic data-title>');
    const b=el('button',null,a.dataset.title);
    b.dataset.topic=a.dataset.topic;
    b.addEventListener('click',()=>openHelp(a.dataset.topic));
    nav.appendChild(b);
  }
  /* ссылки между разделами проверяются сразу, чтобы битая ссылка не всплыла
     только по клику */
  for(const g of body.querySelectorAll('[data-go]')) helpArticle(g.dataset.go);
  for(const b of document.querySelectorAll('button[data-help]')) helpArticle(b.dataset.help);
  $('help').hidden=true;
}

function initHelp(){
  renderHelp();
  $('helpBody').addEventListener('click',e=>{
    const g=e.target.closest('[data-go]');
    if(g) openHelp(g.dataset.go);
  });
  for(const b of document.querySelectorAll('button[data-help]'))
    b.addEventListener('click',e=>{ e.stopPropagation(); openHelp(b.dataset.help); });
  $('helpClose').addEventListener('click',closeHelp);
  $('help').addEventListener('click',e=>{ if(e.target===$('help')) closeHelp(); });
  document.addEventListener('keydown',e=>{
    if(e.key==='F1'){ e.preventDefault(); if($('help').hidden) openHelp('start'); else closeHelp(); return; }
    if(e.key==='Escape'&&!$('help').hidden){ e.preventDefault(); closeHelp(); }
  });
}
