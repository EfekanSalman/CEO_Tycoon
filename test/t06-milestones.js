// Kilometre taşları (v175): eski kayıtta ulaşılmış olanlar sessizce işaretlenir; yeni ulaşılan bir kez kart olarak çıkar;
// aynı taş ikinci kez çıkmaz; oyun duraklatılmışken kart kuyrukta bekler.
const {open,startScn}=require('../tools/page');
(async()=>{let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m);}};const {b,pg,errs}=await open({seed:3});
  await startScn(pg,'garage');
  const r=await pg.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));
    delete G.ms;G.emps=G.emps.slice(0,1);msCheck();const silent=!document.getElementById('mscard')&&!!G.ms;   // ilk kontrol: sessiz
    G.speed=0;const n0=G.emps.length;while(G.emps.length<10)G.emps.push({...G.emps[0],id:nid(),founder:false});msCheck();
    const queuedWhilePaused=!document.getElementById('mscard')&&(UI.msQ||[]).some(m=>m.id==='emp10');
    G.speed=1;msShow();await W(50);const el=document.getElementById('mscard');const shown=!!el&&/10/.test(el.textContent);
    if(el)el.remove();UI.msQ=[];msCheck();const once=!(UI.msQ||[]).length;G.speed=0;
    return {silent,queuedWhilePaused,shown,once,txt:el&&el.textContent};});
  // ürün sayfası (v175): kart görünümü varsayılan; Tablo düğmesi eski tabloya döner, tercih saklanır
  const pv=await pg.evaluate(()=>{G.products.push({id:nid(),owner:'P',cat:'app',name:'T',score:S('app'),price:5,unitCost:0,launch:G.day,active:true,units:100,share:0.1,total:0,camp:0,h:[]});
    UI.tab='prod';(UI.sub=UI.sub||{}).prod='urunler';delete PREF.prodView;render();const q=()=>document.querySelector('table.ptab');const c0=q()&&q().classList.contains('pcards');
    act('prodview',{v:'table'});render();const t1=q()&&!q().classList.contains('pcards')&&PREF.prodView==='table';act('prodview',{v:'cards'});render();const c2=q()&&q().classList.contains('pcards');
    const card=document.querySelector('table.ptab.pcards tr');const cs=card&&getComputedStyle(card).display;return {c0,t1,c2,cs};});
  console.log('ürün görünümü:',JSON.stringify(pv));ok(pv.c0&&pv.t1&&pv.c2&&pv.cs==='grid','product view toggle');
  // ekip sayfası (v176): kart görünümünde her çalışanın avatarı var; Tablo düğmesi eski tabloya döner
  const tv=await pg.evaluate(()=>{UI.tab='team';delete PREF.teamView;render();const q=()=>document.querySelector('table.ttab');const c0=q()&&q().classList.contains('tcards');
    const av=document.querySelectorAll('table.ttab.tcards .tc-av svg.eav').length,n=G.emps.length;act('teamview',{v:'table'});render();const t1=q()&&!q().classList.contains('tcards');act('teamview',{v:'cards'});render();
    return {c0,av,n,t1};});
  console.log('ekip görünümü:',JSON.stringify(tv));ok(tv.c0&&tv.t1&&tv.av>=1,'team view toggle');
  // lansman anı (v177): kart, puan halkası, iki yayın alıntısı ve rakip karşılaştırması; tıklayınca kapanır
  const lm=await pg.evaluate(()=>{G.speed=1;UI.modal=null;const p=G.products.find(x=>x.owner==='P');p.review=8.4;launchMoment(p);const el=document.getElementById('lmom');
    const r={card:!!el,q:el?el.querySelectorAll('.lm-q').length:0,gauge:!!(el&&el.querySelector('.lm-arc')),facts:el?el.querySelector('.lm-facts').textContent:''};if(el)el.click();r.closed=!document.getElementById('lmom');G.speed=0;return r;});
  console.log('lansman anı:',JSON.stringify(lm));ok(lm.card&&lm.q===2&&lm.gauge&&lm.closed&&lm.facts.length>10,'launch moment');
  // Ar-Ge / Pazar / Finans görselleri (v178): araştırma halkası, değer ligi (oyuncu dahil), para akışı şelalesi
  const vp=await pg.evaluate(()=>{for(let i=0;i<40;i++){step();G.pending=null;}const q=s=>document.querySelector(s);
    UI.tab='res';render();const res=!!q('.rcard .rc-ic')&&(!!q('.rhero')||!!q('.res-now.idle'));
    UI.tab='market';(UI.sub=UI.sub||{}).market=null;render();const lg=document.querySelectorAll('.mleague .ml-row').length,me=!!q('.ml-row.me'),mkc=document.querySelectorAll('.mkc').length;
    UI.tab='fin';(UI.sub=UI.sub||{}).fin=null;render();const wf=document.querySelectorAll('.wf .wf-col').length;return {res,lg,me,mkc,wf};});
  console.log('sayfa görselleri:',JSON.stringify(vp));ok(vp.res&&vp.lg>=3&&vp.me&&vp.mkc>=1&&vp.wf>=3,'visual pages');
  console.log('kilometre taşları:',JSON.stringify(r));
  ok(r.silent,'silent first');ok(r.queuedWhilePaused,'queued while paused');ok(r.shown,'card shown');ok(r.once,'only once');
  console.log('ERRS',errs.length,JSON.stringify(errs.slice(0,3)));if(fail||errs.length)process.exitCode=1;await b.close();})();
