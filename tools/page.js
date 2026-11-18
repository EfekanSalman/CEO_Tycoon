// Ortak sayfa yükleyici (testler ve bot için): oyunu çevrimdışı açar (morphdom yerel kopyadan, yazı tipi istekleri kesilir).
// const {open}=require('../tools/page'); const {b,pg,errs}=await open({html,lang:'tr'|'en',w,h,dark,seed});
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const R=path.join(__dirname,'..');
async function open(o={}){
  const html=fs.readFileSync(o.html||path.join(R,'index.html'),'utf8');
  const b=o.browser||await chromium.launch();
  const pg=await b.newPage({locale:o.lang==='en'?'en-US':'tr-TR',viewport:{width:o.w||1280,height:o.h||800},colorScheme:o.dark?'dark':'light'});
  const errs=[];pg.on('pageerror',e=>errs.push(String(e.message||e)));
  if(o.lang)await pg.addInitScript(l=>{try{localStorage.setItem('silikon-garaj-lang',l);}catch(e){}},o.lang);
  if(o.seed)await pg.addInitScript(sd=>{let t=sd>>>0;Math.random=function(){t+=0x6D2B79F5;let r=Math.imul(t^t>>>15,1|t);r^=r+Math.imul(r^r>>>7,61|r);return ((r^r>>>14)>>>0)/4294967296;};},o.seed*7919);
  await pg.route('**/morphdom-umd.min.js',r=>r.fulfill({body:fs.readFileSync(path.join(R,'test','vendor','morphdom-umd.min.js'),'utf8'),contentType:'application/javascript'}));
  await pg.route('**/fonts.googleapis.com/**',r=>r.abort());await pg.route('**/fonts.gstatic.com/**',r=>r.abort());
  await pg.route('http://x/',r=>r.fulfill({body:'<!doctype html><html><head><meta charset="utf-8"></head><body>'+html+'</body></html>',contentType:'text/html'}));
  await pg.goto('http://x/');await pg.waitForTimeout(400);
  return {b,pg,errs};}
/* yeni oyun: senaryoyu başlat, öğreticiyi ve kararları kapat */
const startScn=(pg,sid)=>pg.evaluate(s=>{UI.tutPref=false;PREF.decide='all';PREF.tipsOff=true;closeModal();act('scnstart',{s});closeModal();if(G.tut)G.tut.on=false;G.speed=0;return {day:G.day,name:G.name};},sid);
module.exports={open,startScn,R};
