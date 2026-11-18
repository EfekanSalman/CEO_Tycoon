/* ============================== AUTO-PAUSE ============================== */
/* Otomatik duraklatma: oyun akarken seçili kurallardan biri gerçekleşince oyun durur ve nedeni haber şeridinde görünür (Git / Devam).
   "Olaya kadar" düğmesi en yüksek hızda oynatır; açık kurallardan biri ya da herhangi bir önemli haber gelince durur (en çok 180 gün).
   Kurallar oyuncu tercihidir (PREF.ap), bütün şirketlerde geçerlidir. Durum değişimleri kenar olarak izlenir: bir sorun başladığında bir kez durur,
   düzelip yeniden başlarsa yine durur. Kopya simülasyonda (Ne olur?), botta ve yöneticilerin otomatik işlerinde çalışmaz. */
const AP_RULES=[
  ['bad',(LANG_EN?"Important bad news":'Kötü önemli haber'),(LANG_EN?`Red notifications such as a crisis, lawsuit, loss or a harsh rival move.`:`Kriz, dava, kayıp, sert rakip hamlesi gibi kırmızı bildirimler.`),true],
  ['cash',(LANG_EN?"Cash running low":'Nakit azaldı'),(LANG_EN?"When cash falls below 3 months of fixed costs.":'Nakit 3 aylık sabit giderin altına indiğinde.'),true],
  ['cap',(LANG_EN?"Manufacturing shortage":'Üretim sıkıntısı'),(LANG_EN?"When a hardware product starts running short of capacity or parts.":'Bir donanım ürününde kapasite ya da parça yetmemeye başladığında.'),true],
  ['launch',(LANG_EN?"New product launched":'Yeni ürün çıktı'),(LANG_EN?"When one of your products launches.":'Bir ürünün piyasaya çıktığında.'),true],
  ['rival',(LANG_EN?"Rival move":'Rakip hamlesi'),(LANG_EN?"When a rival starts tearing down your product, bids for an alumni startup or goes into crisis in your market.":'Bir rakip ürününü sökmeye başladığında, mezun girişimine teklif verdiğinde ya da senin pazarında krize girdiğinde.'),true],
  ['good',(LANG_EN?"Important good news":'İyi önemli haber'),(LANG_EN?"Green notifications such as an award, a record, research or a grand goal.":'Ödül, rekor, araştırma ya da büyük hedef gibi yeşil bildirimler.'),false],
  ['idle',(LANG_EN?"Idle team":'Boşta kalan ekip'),(LANG_EN?"When employees are left idle or researchers are waiting.":'Boşta çalışan kaldığında ya da araştırmacılar beklerken.'),false],
  ['offer',(LANG_EN?"New offer":'Yeni teklif'),(LANG_EN?"When a new quest offer or a new wholesale offer arrives.":'Yeni görev teklifi ya da toptan pazarda yeni teklif geldiğinde.'),false],
  ['month',(LANG_EN?"Month end":'Ay sonu'),(LANG_EN?"At every month close.":'Her ay kapanışında.'),false]];
const AP_MAX=180;
const AP={g:null,cash:false,cap:false,idle:false,n:0,offers:''};
const apPref=()=>PREF.ap||{};
const apOn=k=>{const P=apPref();if(P.off)return false;if(k in P)return !!P[k];const r=AP_RULES.find(x=>x[0]===k);return !!(r&&r[3]);};
const apSkip=()=>!G||G.over||(typeof WI!=='undefined'&&WI.on)||UI.quiet||!!(G.tut&&G.tut.on);
function apPause(why,go){if(apSkip())return;if(!G.speed&&!UI.apRun)return;
  G.prevSpeed=G.speed||G.prevSpeed||1;G.speed=0;G.runTo=null;UI.apRun=null;UI.apWhy={t:why,go:go||null,d:G.day};UI.force=true;try{sfx('click');}catch(e){}}
/* haberler: kötü/iyi önemli haber kuralı; "olaya kadar" modunda her önemli haber durdurur */
/* aynı türden haber (kategori + renk) için 30 gün bekleme: örneğin art arda gelen transfer teklifleri oyunu her seferinde durdurmasın */
const AP_CD=30;
function apNews(n){if(apSkip()||!n||!n.imp)return;const run=!!UI.apRun;
  if(!((n.k==='bad'&&apOn('bad'))||(n.k==='good'&&apOn('good'))||run))return;
  const key=(n.c||newsCat(n))+'|'+n.k,cd=AP.cd||(AP.cd={});if(!run&&cd[key]!=null&&G.day-cd[key]<AP_CD&&AP.g===G)return;
  if(!G.speed&&!UI.apRun)return;cd[key]=G.day;apPause(n.t,n.go||navFind(n.t));}
const apOffers=()=>{const q=G.quest&&G.quest.offer?'q'+(G.quest.offer.id||G.quest.offer.nid||'x'):'',B=G.b2b;if(!B)return q;return q+'|'+[...(B.mo||[]),...(B.so||[]),...(B.fo||[]),...(B.ro||[])].map(o=>o.id).join(',');};
/* her gün: durum kuralları (kenar tetiklemeli) ve "olaya kadar" sınırı */
function apDaily(){if(!G)return;if(UI.apWhy&&G.speed)UI.apWhy=null;
  const mine=G.products.filter(p=>p.owner==='P').length,cash=cashTight()&&G.day>60,cap=myActive().some(p=>isHW(p)&&(p.capShort||(p.short&&p.short.length))),
    idl=G.emps.some(e=>idle(e))||(!G.res.active&&G.emps.some(e=>e.role==='res'&&!e.leave)),of=apOffers();
  if(AP.g!==G){Object.assign(AP,{g:G,cash,cap,idle:idl,n:mine,offers:of,cd:{}});return;}
  const was={...AP};Object.assign(AP,{cash,cap,idle:idl,n:mine,offers:of});
  if(apSkip())return;
  if(cash&&!was.cash&&apOn('cash'))return apPause((LANG_EN?`Cash fell below 3 months of fixed costs (${money(G.cash)}).`:`Nakit 3 aylık sabit giderin altına indi (${money(G.cash)}).`),'fin:genel');
  if(cap&&!was.cap&&apOn('cap')){const p=myActive().find(p=>isHW(p)&&(p.capShort||(p.short&&p.short.length)));return apPause((LANG_EN?`${p?p.name+': ':''}production is short of capacity or parts.`:`${p?p.name+': ':''}üretimde kapasite ya da parça yetmiyor.`),'mfg');}
  if(mine>was.n&&apOn('launch')){const p=G.products.filter(p=>p.owner==='P').sort((a,b)=>(b.launch||0)-(a.launch||0))[0];return apPause((LANG_EN?`${p?p.name:"New products"} launched.`:`${p?p.name:'Yeni ürün'} piyasaya çıktı.`),'prod');}
  if(idl&&!was.idle&&apOn('idle'))return apPause((LANG_EN?"You have idle employees.":'Boşta kalan çalışanların var.'),'team:ekip');
  if(of!==was.offers&&of.length>was.offers.length&&apOn('offer'))return apPause((LANG_EN?"A new offer arrived.":'Yeni bir teklif geldi.'),G.quest&&G.quest.offer&&!was.offers.startsWith('q')?'quest':'market:toptan');
  if(UI.apRun&&G.day-UI.apRun.d0>=AP_MAX)return apPause((LANG_EN?`Nothing important happened for ${AP_MAX} days.`:`${AP_MAX} gün boyunca önemli bir gelişme olmadı.`),null);}
/* rakip hamlesi: haberden önce çağrılır ki Git düğmesi doğru bölüme gitsin */
function apRival(t,go){if(apOn('rival')&&!apSkip())apPause(t,go);}
function apMonthly(){if(apOn('month')&&!apSkip())apPause((LANG_EN?`Month closed: ${fmtMonth(G.day)}.`:`Ay kapandı: ${fmtMonth(G.day)}.`),'fin:genel');}
function apAct(a,ds){
  if(a==='apgo'){UI.apWhy=null;if(!G.over&&!G.pending)G.speed=G.prevSpeed||1;return;}
  if(a==='apx'){UI.apWhy=null;return;}
  if(a==='runev'){if(G.over)return;if(UI.apRun){UI.apRun=null;G.speed=G.prevSpeed||1;return;}UI.apWhy=null;G.runTo=null;G.prevSpeed=G.speed||G.prevSpeed||1;UI.apRun={d0:G.day};G.speed=3;return;}
  if(a==='apoff'){const P=PREF.ap||(PREF.ap={});P.off=!P.off;prefSave();return;}
  if(a==='aprule'){const k=ds.k;if(!AP_RULES.some(r=>r[0]===k))return;const P=PREF.ap||(PREF.ap={});P[k]=!apOn(k);prefSave();}}
/* haber şeridi: otomatik duraklatma nedeni */
function vApNote(){const W=UI.apWhy;if(!W||!G||G.speed)return '';
  return (LANG_EN?`<div class="ap-note" role="status"><span class="tk-chip c-dec">Paused</span><span class="ap-t">${esc(W.t)}</span>${W.go?`<button class="btn sm ghost" data-act="tab" data-tab="${W.go}">Go</button>`:''}<button class="btn sm primary" data-act="apgo">Resume</button><button class="btn sm ghost ap-x" data-act="apx" aria-label="Close">✕</button></div>`:`<div class="ap-note" role="status"><span class="tk-chip c-dec">Duraklatıldı</span><span class="ap-t">${esc(W.t)}</span>${W.go?`<button class="btn sm ghost" data-act="tab" data-tab="${W.go}">Git</button>`:''}<button class="btn sm primary" data-act="apgo">Devam</button><button class="btn sm ghost ap-x" data-act="apx" aria-label="Kapat">✕</button></div>`);}
function vApPrefs(){const P=apPref(),off=!!P.off;
  return (LANG_EN?`<div class="col" style="gap:6px"><div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ${off?'':'primary'}" data-act="apoff" aria-pressed="${!off}">Auto-pause: ${LANG_EN?(off?'off':'on'):off?"off":"open"}</button><span class="small muted">While the game runs, it pauses when one of the situations you chose happens, and the reason appears in the news strip. The ⏩ Until next event button plays at top speed and stops at the first important development.</span></div>
    ${off?'':`<div class="ap-g">${AP_RULES.map(([k,n,d])=>{const on=apOn(k);return `<label class="ap-r"><input type="checkbox" data-act="aprule" data-k="${k}" ${on?'checked':''}> <span><b>${n}</b><span class="small muted">${d}</span></span></label>`;}).join('')}</div>`}</div>`:`<div class="col" style="gap:6px"><div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ${off?'':'primary'}" data-act="apoff" aria-pressed="${!off}">Otomatik duraklatma: ${LANG_EN?(off?'off':'on'):off?'kapalı':'açık'}</button><span class="small muted">Oyun akarken seçtiğin durumlardan biri olunca oyun durur ve nedeni haber şeridinde görünür. ⏩ Olaya kadar düğmesi en yüksek hızda oynatıp ilk önemli gelişmede durur.</span></div>
    ${off?'':`<div class="ap-g">${AP_RULES.map(([k,n,d])=>{const on=apOn(k);return `<label class="ap-r"><input type="checkbox" data-act="aprule" data-k="${k}" ${on?'checked':''}> <span><b>${n}</b><span class="small muted">${d}</span></span></label>`;}).join('')}</div>`}</div>`);}
