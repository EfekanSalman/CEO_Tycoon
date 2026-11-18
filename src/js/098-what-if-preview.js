/* ============================== WHAT-IF PREVIEW ============================== */
/* "Ne olur?" önizlemesi: şirketin bir kopyası alınır, karar kopyada uygulanır ve oyunun kendi simülasyonu N gün oynatılır.
   Her seçenek aynı rastgele tohumla oynatılır (sistemlerin kendi üreteçleri de kopyayla aynı başlar), böylece fark kararın kendisinden gelir.
   Kopya çalışırken gerçek oyuna hiçbir şey sızmaz: kayıt, depolama, bildirim, ses, pencere, zamanlayıcı ve ağ çağrıları geçici olarak susturulur;
   UI ve PREF geri yüklenir, sürüm sayaçlı önbellekler tazelenir. Hesap 10 günlük parçalarla arka planda ilerler; pencere kapanınca durur. */
const WI_STUB=['showToast','openModal','closeModal','renderModal','render','renderTop','sfx','tkPush','saveSoon','save','slotSave','clSave','clAuto','careerRecord','prefSave'];
const WI_CH=10,WI_HS=[30,60,90];
const WI={on:false};
function wiSeeded(seed){let t=seed>>>0;return function(){t=t+0x6D2B79F5>>>0;let r=Math.imul(t^t>>>15,1|t);r^=r+Math.imul(r^r>>>7,61|r);return ((r^r>>>14)>>>0)/4294967296;};}
function wiEnter(g){const S={f:{},G:G,rnd:Math.random,st:window.setTimeout,si:window.setInterval,ric:window.requestIdleCallback,raf:window.requestAnimationFrame,ls:Storage.prototype.setItem,lr:Storage.prototype.removeItem,fe:window.fetch,ui:Object.assign({},UI),pref:JSON.stringify(PREF)};
  const nop=()=>{};for(const n of WI_STUB)if(typeof window[n]==='function'){S.f[n]=window[n];window[n]=nop;}
  window.setTimeout=()=>0;window.setInterval=()=>0;window.requestIdleCallback=()=>0;window.requestAnimationFrame=()=>0;Storage.prototype.setItem=nop;Storage.prototype.removeItem=nop;window.fetch=()=>Promise.reject(new Error('whatif'));
  WI.on=true;UI.quiet=true;G=g;return S;}
function wiExit(S){for(const n in S.f)window[n]=S.f[n];window.setTimeout=S.st;window.setInterval=S.si;window.requestIdleCallback=S.ric;window.requestAnimationFrame=S.raf;
  Storage.prototype.setItem=S.ls;Storage.prototype.removeItem=S.lr;window.fetch=S.fe;G=S.G;Math.random=S.rnd;
  for(const k of Object.keys(UI))if(!(k in S.ui))delete UI[k];Object.assign(UI,S.ui);
  try{const p=JSON.parse(S.pref);for(const k of Object.keys(PREF))if(!(k in p))delete PREF[k];Object.assign(PREF,p);}catch(e){}
  DESKV++;SHV++;BSY.v=-1;WI.on=false;wiFlush();}
/* önbellekleri tazele: kopyanın değerleri gerçek oyuna karışmasın */
function wiFlush(){try{CTM.clear();FTS.clear();for(const k in RCV)delete RCV[k];for(const k in SCV)delete SCV[k];RVSC.k='';SPW.k='';ESK.d=-1;TDK.d=-1;RFC.d=-1;CMPI.a=null;PRDI.a=null;}catch(e){}}
function wiClone(g){try{return structuredClone(g);}catch(e){return JSON.parse(JSON.stringify(g));}}
/* seçeneği (kopyada ya da gerçekte) uygula */
function wiApply(v,real){if(!v||v.k==='base')return;
  if(v.k==='px'){const p=prod(v.pid);if(p)p.price=v.v;return;}
  if(v.k==='site'){const p=prod(v.pid);if(p&&p.plan)p.plan.site=v.v;return;}
  if(v.k==='act'){if(real)act(v.a,v.ds);else act0(v.a,v.ds);return;}
  if(v.k==='ev'){if(real){act('evpick',{i:String(v.i)});return;}const P=G.pending,ev=P&&EVD[P.id];if(P&&P.ib&&G.inbox)G.inbox=G.inbox.filter(x=>x.key!==P.ib);if(ev)ev.pick(P.d,v.i);G.pending=null;}}
/* ürün ölçüleri: aylık gelir hızı ve aylık satış (donanım) ya da kullanıcı (yazılım) */
const wiPRev=p=>isHW(p)?(p.sr||0)*p.price:(p.units||0)*revPerUser(p);
const wiPUnits=p=>isHW(p)?(p.sr||0):(p.units||0);
function wiStart(o){const job={...o,G0:G,H:o.H||60,i:0,d:0,res:[],g:null,acc:null,c0:G.cash,v0:valuation(),t0:performance.now(),seed:(G.day*2654435761+(G.nextId||1))>>>0,day0:G.day};
  UI.wi=job;setTimeout(()=>wiTick(job),0);return job;}
function wiTick(job){if(UI.wi!==job||!G)return;const ST=window.setTimeout;
  if(G!==job.G0||!UI.modal||(UI.modal.kind!=='whatif'&&UI.modal.kind!=='event')){UI.wi=null;return;}
  const v=job.vs[job.i];if(!v){job.done=true;job.ms=performance.now()-job.t0;wiRefresh();return;}
  // yeni seçenek: kopyala, uygula
  if(!job.g){job.g=wiClone(G);job.acc={rev:0,u:0,n:0};job.d=0;job.rs=null;}
  const S=wiEnter(job.g);let err=null;
  try{if(job.rs)Math.random=job.rs;else{job.rs=wiSeeded(job.seed);Math.random=job.rs;wiApply(v,false);}
    const p=job.pid?prod(job.pid):null;
    for(let k=0;k<WI_CH&&job.d<job.H;k++,job.d++){step();G.pending=null;if(p){job.acc.rev+=wiPRev(p);job.acc.u+=wiPUnits(p);job.acc.n++;}if(G.over)break;}
    job.rs=Math.random;
    if(job.d>=job.H||G.over){const g=G;job.res[job.i]={cash:g.cash,val:valuation(),brand:g.brand,over:!!g.over,
      rev:p&&job.acc.n?job.acc.rev/job.acc.n:null,u:p&&job.acc.n?job.acc.u/job.acc.n:null,sh:p?(p.share||0):null};job.i++;job.g=null;}}
  catch(e){err=e;}finally{wiExit(S);}
  if(err){job.res[job.i]={err:String(err&&err.message||err)};job.i++;job.g=null;}
  wiRefresh();ST(()=>wiTick(job),0);}
function wiRefresh(){if(UI.modal&&(UI.modal.kind==='whatif'||UI.modal.kind==='event')){UI.force=true;renderModal();}}
/* ---- seçenek listeleri ---- */
function wiPriceVs(p){const vs=[];const lock=p.priceLock>G.day;
  if(!(p.cat==='app'&&pmOf(p)!=='paid'))for(const m of [0.8,0.9,1,1.1,1.2]){if(lock&&m>1)continue;const v=m===1?p.price:roundP(p.cat,p.price*m);vs.push(m===1?{k:'base',n:money(p.price),ref:1}:{k:'px',pid:p.id,v,n:(LANG_EN?`${money(v)} (${m<1?'−':'+'}${Math.round(Math.abs(m-1)*100)}%)`:`${money(v)} (${m<1?'−':'+'}%${Math.round(Math.abs(m-1)*100)})`)});}
  else vs.push({k:'base',n:(LANG_EN?"Current state":'Şimdiki durum'),ref:1});
  if(p.active&&!(p.camp>G.day)&&G.cash>=CATS[p.cat].camp*infl()*mdDisc())vs.push({k:'act',a:'camp',ds:{id:String(p.id)},n:(LANG_EN?`30-day ad campaign (${money(CATS[p.cat].camp*infl()*mdDisc())})`:`30 günlük reklam (${money(CATS[p.cat].camp*infl()*mdDisc())})`)});
  return vs;}
function wiSiteVs(p){const vs=[];b2bSites();const opts=[...Object.keys(SITES).filter(s=>siteOK(s,p.cat,p.spec)),...G.factories.filter(f=>siteOK(f.id,p.cat,p.spec)).map(f=>f.id)];
  for(const s of opts)vs.push(s===p.plan.site?{k:'base',n:siteName(s),ref:1}:{k:'site',pid:p.id,v:s,n:siteName(s)});
  vs.sort((a,b)=>(b.ref?1:0)-(a.ref?1:0));return vs;}
function wiOpen(ds){const k=ds.k,H=+ds.h||(UI.wi&&UI.wi.H)||60;let o=null;
  if(k==='px'||k==='site'){const p=prod(+ds.id);if(!p)return;o={k,pid:p.id,t:p.name,sub:k==='px'?(LANG_EN?"Price and advertising":'Fiyat ve reklam'):(LANG_EN?"Production site":'Üretim yeri'),vs:k==='px'?wiPriceVs(p):wiSiteVs(p)};}
  else if(k==='b2b'){o={k,t:ds.t||(LANG_EN?"Wholesale offer":'Toptan ticaret teklifi'),sub:(LANG_EN?"Offer":'Teklif'),vs:[{k:'base',n:(LANG_EN?"Decline":'Reddet'),ref:1},{k:'act',a:ds.a,ds:{id:ds.id},n:(LANG_EN?"Accept":'Kabul et')}]};}
  if(!o||o.vs.length<2){showToast((LANG_EN?"There are no options to compare for this decision.":'Bu karar için karşılaştırılacak seçenek yok.'),'bad');return;}
  o.H=H;openModal('whatif');wiStart(o);}
function wiEvent(H){const P=G.pending,ev=P&&EVD[P.id];if(!ev)return;let v;try{v=ev.view(P.d);}catch(e){return;}
  wiStart({k:'ev',key:P.id+'|'+G.day,t:v.t,H:H||60,vs:v.o.map((o,i)=>({k:'ev',i,n:o.t}))});UI.force=true;renderModal();}
function wiAct(a,ds){
  if(a==='wiopen')return wiOpen(ds);
  if(a==='wih'){const J=UI.wi;if(!J)return;const H=+ds.h;if(J.k==='ev')return wiEvent(H);const o={k:J.k,pid:J.pid,t:J.t,sub:J.sub,vs:J.vs,H};wiStart(o);return;}
  if(a==='wiev')return wiEvent(+ds.h||60);
  if(a==='wiapply'){const J=UI.wi;if(!J)return;const v=J.vs[+ds.i];if(!v)return;UI.wi=null;
    if(v.k==='px'){const p=prod(v.pid);if(p&&p.priceLock>G.day&&v.v>p.price){showToast((LANG_EN?"You can't raise prices because of the Competition Authority ruling.":'Rekabet Kurumu kararı nedeniyle zam yapamazsın.'),'bad');return;}}
    if(v.k!=='ev')closeModal();wiApply(v,true);if(v.k==='px'||v.k==='site')showToast((LANG_EN?`${J.t}: ${v.n} applied.`:`${J.t}: ${v.n} uygulandı.`));return;}
  if(a==='wiclose'){UI.wi=null;closeModal();}}
/* ---- görünüm ---- */
const wiSgn=x=>(x>=0?'+':'−')+money(Math.abs(x));
function wiTable(J){const R=J.res,hasP=J.pid!=null,P=hasP?prod(J.pid):null;
  const ok=R.filter(r=>r&&!r.err),all=ok.length===J.vs.length,best=all?R.indexOf(ok.reduce((a,b)=>b.cash>a.cash?b:a)):-1;
  // karşılaştırma noktası: şimdiki durum; yoksa (olay seçenekleri) en çok nakit bırakan seçenek
  let ri=J.vs.findIndex(v=>v.ref);if(ri<0)ri=best;const ref=ri>=0?R[ri]:null;
  const m=(l,v,c='')=>`<span><small>${l}</small><b class="num ${c}">${v}</b></span>`,dif=(x,lab)=>m(lab,wiSgn(x),Math.abs(x)<0.5?'':x>0?'pos':'neg');
  const rows=J.vs.map((v,i)=>{const r=R[i];const head=`<div class="wi-n"><b>${esc(v.n)}</b>${i===best?(LANG_EN?" <span class=\"chip st-ok\">most cash</span>":' <span class="chip st-ok">en çok nakit</span>'):''}${r&&r.over?(LANG_EN?" <span class=\"chip st-bad\">bankrupt</span>":' <span class="chip st-bad">iflas</span>'):''}${v.ref&&(J.k==='px'||J.k==='site')?(LANG_EN?" <span class=\"chip st-mute\">current</span>":' <span class="chip st-mute">şimdiki</span>'):''}</div>`;
    if(!r)return `<div class="wi-r${i===J.i?' run':''}">${head}<div class="wi-m small muted">${i===J.i?(LANG_EN?`calculating… ${J.d}/${J.H} days`:`hesaplanıyor… ${J.d}/${J.H} gün`):(LANG_EN?"queued":'sırada')}</div></div>`;
    if(r.err)return (LANG_EN?`<div class="wi-r">${head}<div class="wi-m small neg">could not calculate</div></div>`:`<div class="wi-r">${head}<div class="wi-m small neg">hesaplanamadı</div></div>`);
    const ms=[];if(hasP){ms.push(m(P&&!isHW(P)?(LANG_EN?"Users":'Kullanıcı'):(LANG_EN?"Sales/mo":'Satış/ay'),(r.u||0)<10?fx(r.u||0,1):num(Math.round(r.u))),m((LANG_EN?"Product revenue/mo":'Ürün geliri/ay'),money(r.rev||0)),m((LANG_EN?"Market share":'Pazar payı'),pct(r.sh||0,1)));}
    if(ref&&!ref.err&&i!==ri){ms.push(dif(r.cash-ref.cash,(LANG_EN?`Cash difference (${J.H} d)`:`Nakit farkı (${J.H} g)`)),dif(r.val-ref.val,(LANG_EN?"Value difference":'Değer farkı')));}
    else ms.push(m((LANG_EN?`Cash (${J.H} d)`:`Nakit (${J.H} g)`),money(r.cash)),m((LANG_EN?"Company value":'Şirket değeri'),money(r.val)));
    return `<div class="wi-r${i===best?' best':''}">${head}<div class="wi-m">${ms.join('')}</div>${J.k!=='ev'&&!v.ref?(LANG_EN?`<button class="btn sm" data-act="wiapply" data-i="${i}">Apply</button>`:`<button class="btn sm" data-act="wiapply" data-i="${i}">Uygula</button>`):''}</div>`;}).join('');
  return `<div class="wi-l">${rows}</div>`;}
const wiHBtns=J=>(LANG_EN?`<div class="row" style="gap:6px;flex-wrap:wrap" role="group" aria-label="Duration">${WI_HS.map(h=>`<button class="btn sm ${J.H===h?'primary':''}" data-act="wih" data-h="${h}" aria-pressed="${J.H===h}">${h} days</button>`).join('')}</div>`:`<div class="row" style="gap:6px;flex-wrap:wrap" role="group" aria-label="Süre">${WI_HS.map(h=>`<button class="btn sm ${J.H===h?'primary':''}" data-act="wih" data-h="${h}" aria-pressed="${J.H===h}">${h} gün</button>`).join('')}</div>`);
const WI_NOTE=(LANG_EN?"Estimate: a copy of your company is played for the chosen period; random events are kept the same for every option, so the difference comes from the decision itself. Other events may happen in reality; this shows one possible future.":'Tahmin: şirketinin bir kopyası seçilen süre kadar oynatılır; her seçenekte rastgele olaylar aynı tutulur, fark kararın kendisinden gelir. Gerçekte başka olaylar yaşanabilir; tek bir olası geleceği gösterir.');
function vWhatIf(){const J=UI.wi;if(!J)return (LANG_EN?"<p class=\"small muted\">No preview.</p>":'<p class="small muted">Önizleme yok.</p>');
  return (LANG_EN?`<div class="eyebrow">What if? · ${esc(J.sub||'')}</div><h2>${esc(J.t)}</h2>${wiHBtns(J)}${wiTable(J)}
    <p class="small muted">${WI_NOTE} Differences are relative to ${J.vs.findIndex(v=>v.ref)>=0?"the current state":"the option that leaves the most cash"}.${J.done?` Took ${fx(J.ms/1000,1)} s.`:''}</p>
    <div class="row"><button class="btn" data-act="wiclose">Close</button></div>`:`<div class="eyebrow">Ne olur? · ${esc(J.sub||'')}</div><h2>${esc(J.t)}</h2>${wiHBtns(J)}${wiTable(J)}
    <p class="small muted">${WI_NOTE} Farklar ${J.vs.findIndex(v=>v.ref)>=0?'şimdiki duruma':'en çok nakit bırakan seçeneğe'} göredir.${J.done?` Hesap ${fx(J.ms/1000,1)} sn sürdü.`:''}</p>
    <div class="row"><button class="btn" data-act="wiclose">Kapat</button></div>`);}
/* olay penceresinde: seçeneklerin altına sonuç */
function wiEvBlock(){const P=G.pending;if(!P)return '';const J=UI.wi,key=P.id+'|'+G.day;
  if(!J||J.k!=='ev'||J.key!==key)return (LANG_EN?`<div class="row" style="gap:6px"><button class="btn sm ghost" data-act="wiev" data-h="60">What if? Preview the options for 60 days</button></div>`:`<div class="row" style="gap:6px"><button class="btn sm ghost" data-act="wiev" data-h="60">Ne olur? Seçenekleri 60 gün önizle</button></div>`);
  return (LANG_EN?`<div class="col wi-ev" style="gap:6px"><div class="row between" style="gap:6px;flex-wrap:wrap"><b class="small">What if? · after ${J.H} days</b>${wiHBtns(J)}</div>${wiTable(J)}<p class="small muted">${WI_NOTE}</p></div>`:`<div class="col wi-ev" style="gap:6px"><div class="row between" style="gap:6px;flex-wrap:wrap"><b class="small">Ne olur? · ${J.H} gün sonra</b>${wiHBtns(J)}</div>${wiTable(J)}<p class="small muted">${WI_NOTE}</p></div>`);}
