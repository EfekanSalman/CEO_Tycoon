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
  console.log('kilometre taşları:',JSON.stringify(r));
  ok(r.silent,'silent first');ok(r.queuedWhilePaused,'queued while paused');ok(r.shown,'card shown');ok(r.once,'only once');
  console.log('ERRS',errs.length,JSON.stringify(errs.slice(0,3)));if(fail||errs.length)process.exitCode=1;await b.close();})();
