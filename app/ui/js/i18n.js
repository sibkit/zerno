"use strict";
/* ЗЕРНО · языки интерфейса. Ни от чего не зависит; подключается первым,
   за ним — словари app/ui/i18n/<код>.js, каждый вызывает addLang().

   Словарь: {name, strings, help}. strings — ключ → строка с подстановками
   {имя} или, для счётных слов, объект форм Intl.PluralRules ({one, few, many,
   other…} — какие формы нужны, решает язык). help — HTML справки: статьи
   <article data-topic data-title>. Нет ключа, формы или подстановки —
   исключение, а не русский текст или пустая строка вместо перевода.

   Ошибки, которые видит пользователь, — ZErr {key, args}: так их порождают и
   doc.js, и Rust (engine/src/msg.rs). Текст собирается при показе, на языке,
   выбранном в этот момент. */

/* Порядок — порядок в переключателе. */
const LANG_ORDER=['ru','en','de','fr','es','pt-BR','uk','zh-CN','ja','ko'];
const LANGS={};
const LANG_KEY='zerno.lang';

let lang=null, pluralRules=null;

function addLang(code,d){
  if(LANG_ORDER.indexOf(code)<0) throw new Error('addLang: язык '+code+' не перечислен в LANG_ORDER');
  if(code in LANGS) throw new Error('addLang: словарь '+code+' подключён дважды');
  if(!d||typeof d.name!=='string'||!d.strings||typeof d.help!=='string')
    throw new Error('addLang '+code+': ожидается {name, strings, help}');
  LANGS[code]=d;
}

function setLang(code){
  if(!(code in LANGS)) throw new Error('setLang: нет словаря "'+code+'"');
  lang=code;
  pluralRules=new Intl.PluralRules(code);
  if(typeof document!=='undefined') document.documentElement.lang=code;
}

/** Язык при запуске: выбранный раньше, иначе язык системы, иначе английский
    (так согласовано). Неизвестный сохранённый код — сообщение, а не тишина. */
function pickLang(){
  const saved=localStorage.getItem(LANG_KEY);
  if(saved!==null){
    if(saved in LANGS) return {code:saved,bad:null};
    return {code:systemLang(),bad:saved};
  }
  return {code:systemLang(),bad:null};
}
function systemLang(){
  const want=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];
  for(const w of want){
    if(!w) continue;
    const exact=LANG_ORDER.find(c=>c.toLowerCase()===w.toLowerCase());
    if(exact) return exact;
    const base=w.split('-')[0].toLowerCase();
    const near=LANG_ORDER.find(c=>c.split('-')[0].toLowerCase()===base);
    if(near) return near;
  }
  return 'en';
}

function fill(s,args,key){
  return s.replace(/\{(\w+)\}/g,(m,name)=>{
    if(!args||!(name in args)) throw new Error('перевод «'+key+'» ('+lang+'): не передана подстановка {'+name+'}');
    return String(args[name]);
  });
}
function entry(key){
  if(!lang) throw new Error('tr("'+key+'"): язык интерфейса ещё не выбран');
  const s=LANGS[lang].strings[key];
  if(s===undefined) throw new Error('нет перевода «'+key+'» для '+lang);
  return s;
}

/** Строка интерфейса. */
function tr(key,args){
  const s=entry(key);
  if(typeof s!=='string') throw new Error('перевод «'+key+'» ('+lang+') — счётная форма: нужен trn()');
  return fill(s,args,key);
}

/** Строка со счётным словом: форма выбирается по n, n доступно как {n}. */
function trn(key,n,args){
  const s=entry(key);
  if(typeof s!=='object') throw new Error('перевод «'+key+'» ('+lang+') — не счётная форма');
  const form=pluralRules.select(n);
  if(typeof s[form]!=='string') throw new Error('перевод «'+key+'» ('+lang+'): нет формы «'+form+'» для '+n);
  return fill(s[form],Object.assign({n:n},args),key);
}

/* ---------------- ошибки: ключ + параметры ---------------- */

class ZErr extends Error{
  constructor(key,args){
    super();
    this.key=key;
    this.args=args||{};
  }
  /* Текст — на языке, выбранном в момент показа. До выбора языка (в первые
     миллисекунды запуска) — сырой ключ с пометкой, а не выдуманный текст. */
  get message(){
    if(!lang) return '[язык не выбран] '+this.key+' '+JSON.stringify(this.args);
    return msgText(this);
  }
}

/** Сообщение от Rust ({key, args}) — в ZErr; всё прочее — Error с текстом как есть. */
function toErr(e){
  if(e instanceof Error) return e;
  if(e&&typeof e==='object'&&typeof e.key==='string'&&e.args&&typeof e.args==='object') return new ZErr(e.key,e.args);
  return new Error(String(e));
}

/* Параметры, которые в тексте показываются не как есть. */
function msgArgs(m){
  const a=Object.assign({},m.args);
  if(m.key.startsWith('doc.')&&m.key!=='doc.json'){
    if(typeof a.field!=='string') throw new Error('сообщение '+m.key+': нет параметра field');
    a.field=tr('doc.root')+(a.field?'.'+a.field:'');
  }
  if(m.key==='render.degenerate') a.type=tr('noise.'+a.type);
  if(m.key==='titlebar.unsupported') a.part=tr('titlebar.part.'+a.part);
  return a;
}

function msgText(m){
  const a=msgArgs(m);
  let s=tr('msg.'+m.key,a);
  if(m.key==='io.replace'&&'cleanup' in a) s+=tr('msg.io.replace.cleanup',a);
  if(typeof a.file==='string') s+=' '+tr('msg.inFile',{file:a.file});
  return s;
}

/** Проверка словарей: те же ключи, те же формы и подстановки, что у эталона
    (русского), те же разделы справки. Зовут проверки (tests/test-ui.js). */
function checkLangs(){
  const ref=LANGS.ru, out=[];
  const subs=s=>(s.match(/\{\w+\}/g)||[]).sort().join(',');
  const topics=h=>(h.match(/data-topic="[^"]+"/g)||[]).join(',');
  const gos=h=>(h.match(/data-go="[^"]+"/g)||[]).sort().join(',');
  for(const code of LANG_ORDER){
    const d=LANGS[code];
    if(!d){ out.push(code+': словарь не подключён'); continue; }
    const pr=new Intl.PluralRules(code);
    const forms=pr.resolvedOptions().pluralCategories;
    for(const k of Object.keys(ref.strings)){
      const r=ref.strings[k], v=d.strings[k];
      if(v===undefined){ out.push(code+': нет ключа '+k); continue; }
      if(typeof r!==typeof v){ out.push(code+': '+k+' — другой вид (строка / счётная форма)'); continue; }
      if(typeof v==='string'){
        if(subs(v)!==subs(r)) out.push(code+': '+k+' — подстановки '+subs(v)+' вместо '+subs(r));
      }else{
        for(const f of forms) if(typeof v[f]!=='string') out.push(code+': '+k+' — нет формы '+f);
        for(const f of Object.keys(v)){
          if(forms.indexOf(f)<0) out.push(code+': '+k+' — лишняя форма '+f);
          else if(subs(v[f]).replace('{n}','')!==subs(r.other||r.many).replace('{n}',''))
            out.push(code+': '+k+'.'+f+' — подстановки не совпадают с эталоном');
        }
      }
    }
    for(const k of Object.keys(d.strings)) if(!(k in ref.strings)) out.push(code+': лишний ключ '+k);
    if(topics(d.help)!==topics(ref.help)) out.push(code+': разделы справки не совпадают с эталоном');
    if(gos(d.help)!==gos(ref.help)) out.push(code+': ссылки справки (data-go) не совпадают с эталоном');
  }
  return out;
}
