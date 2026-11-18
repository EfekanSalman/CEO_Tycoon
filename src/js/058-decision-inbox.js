/* ============================== DECISION INBOX ============================== */
/* Varsayılanlar (süresi dolan kararda ve Basit modda seçilen): tuzak taramasında (her seçenek aynı başlangıçtan kopyada 365 gün, 40 koşu)
   varsayılanı açıkça kötü çıkan kararlar düzeltildi: veri sızıntısında açıklamak (+47M nakit), kritik hatada acil yama (+6M), sana açılan patent
   davasında uzlaşmak (+7M), rekabet soruşturmasında gönüllü taahhüt (+0,8M), CEO atışmasında esprili cevap (+0,3M). Ölçüt nakit ve değerleme olduğu için
   pay sulanması (yatırım teklifi), moral (zam isteği) ya da kontrol (aktivist) gibi boyutları olan kararların varsayılanına dokunulmadı. */
const IB_CFG={ransom:{u:1},coup:{u:1},htoatk:{u:1},buyout:{days:14,def:2},board:{days:10,def:2},leak:{days:10,def:1},patent:{days:14,def:1},poach:{days:7,def:1},offer:{days:14,def:1},
  suitIn:{days:14,def:0},settle:{days:14,def:1},antitrust:{days:21,def:1},breach:{days:7,def:0},unionDrive:{days:14,def:0},bargain:{days:14,def:1},cofdis:{days:10,def:1},cofeq:{days:14,def:2},
  cofleave:{days:7,def:1},ceofeud:{days:7,def:1},ceopart:{days:14,def:-1},activist:{days:14,def:0},pricewar:{days:10,def:2},raid:{days:7,def:2},clash:{days:10,def:2},crit:{days:7,def:0},
  annrep:{days:30,def:0},rvcopy:{days:14,def:3},rvcrisis:{days:10,def:2},nemev:{days:14,def:2},qcrec:{days:21,def:1},mrgev:{days:30,def:2},cvev:{days:14,def:1},recall:{days:14,def:0}};
const ibCfg=id=>IB_CFG[id]||{days:10,def:-1};
const ibOn=()=>PREF.decide!=='all';
function ibView(it){try{return EVD[it.id].view(it.d);}catch(e){return null;}}
/* varsayılan seçenek: tahmini olan kararlarda (optEst) en iyi tahmin, yoksa ayarlı varsayılan */
const optEst=(id,d)=>{try{return typeof rvnOptEst==='function'?rvnOptEst(id,d):null;}catch(e){return null;}};
function evDefI(id,d,n){const est=optEst(id,d);if(est&&typeof rvnBestOpt==='function'){const b=rvnBestOpt(est,typeof RVN_ABS!=='undefined'&&RVN_ABS.has(id));if(b>=0&&b<n)return b;}const c=ibCfg(id);return c.def<0||c.def>=n?n-1:c.def;}
function ibDefI(it){const v=ibView(it),n=v?v.o.length:1;return evDefI(it.id,it.d,n);}
const ibBm=()=>!!(G&&G.bm&&G.bm.cur&&!G.bm.cur.res&&boardOn());
const ibCount=()=>G?(G.inbox||[]).length+(ibBm()?1:0)+(G.pending&&!G.pending.ib?1:0):0;
function ibAdd(id,d){if(!G.inbox)G.inbox=[];if(G.inbox.some(x=>x.id===id))return;const c=ibCfg(id);let days=c.days||10;if(id==='mrgev'&&G.mrg&&G.mrg.cur)days=Math.max(3,G.mrg.cur.at-G.day-1);
  G.ibN=(G.ibN||0)+1;const it={key:G.ibN,id,d,at:G.day,until:G.day+days};G.inbox.push(it);const v=ibView(it);tkPush({t:(LANG_EN?`Decision pending: ${v?v.t:"new decision"} (${days} days)`:`Karar bekliyor: ${v?v.t:'yeni karar'} (${days} gün)`),k:'dec'});sfx('bad');}
function triggerChoice(id,d,now){if(G&&G.simple&&SIMPLE_EV.includes(id)&&!ibCfg(id).u&&simpleAutoDecide(id,d))return;if(G&&ibOn()&&!now&&!ibCfg(id).u){ibAdd(id,d);return;}G.pending={id,d};G.prevSpeed=G.speed||G.prevSpeed||1;G.speed=0;openModal('event');}
function ibOpen(key){const it=(G.inbox||[]).find(x=>x.key===key);if(!it||G.pending)return;if(!ibView(it)){G.inbox=G.inbox.filter(x=>x!==it);return;}G.pending={id:it.id,d:it.d,ib:it.key};G.prevSpeed=G.speed||G.prevSpeed||1;G.speed=0;openModal('event');}
function ibDaily(){if(!G.inbox||!G.inbox.length)return;for(const it of G.inbox.slice()){if(G.pending&&G.pending.ib===it.key)continue;const E=EVD[it.id];if(!E){G.inbox=G.inbox.filter(x=>x!==it);continue;}
  if(G.day>=it.until){G.inbox=G.inbox.filter(x=>x!==it);const v=ibView(it),i=ibDefI(it);try{E.pick(it.d,i);}catch(e){}news((LANG_EN?`Decision expired: ${v?v.t:'karar'} → ${v&&v.o[i]?v.o[i].t:"default option"}.`:`Süresi dolan karar: ${v?v.t:'karar'} → ${v&&v.o[i]?v.o[i].t:'varsayılan seçenek'}.`),'',true);}}}
function runToCheck(){if(G.runTo!=null&&G.day>=G.runTo){G.runTo=null;G.prevSpeed=G.speed||G.prevSpeed;G.speed=0;showToast((LANG_EN?"Month end: game paused.":'Ay sonu: oyun duraklatıldı.'));}}
function vInbox(){const L=(G.inbox||[]).slice().sort((a,b)=>a.until-b.until),bm=ibBm()?G.bm.cur:null,n=L.length+(bm?1:0);
  const card=(t,sub,body,btn,frac,urgent)=>`<div class="ib-card${urgent?' urgent':''}"><div class="col" style="gap:3px;min-width:0"><b>${esc(t)}</b><span class="small muted">${sub}</span>${body?`<span class="small">${esc(body)}</span>`:''}</div>${btn}<div class="ib-bar" aria-hidden="true"><i style="width:${Math.round(clamp(frac,0,1)*100)}%"></i></div></div>`;
  const cards=[];
  if(G.pending&&!G.pending.ib){let t=(LANG_EN?"A decision":'Bir karar');try{t=EVD[G.pending.id].view(G.pending.d).t;}catch(e){}cards.push(card(t,(LANG_EN?"Urgent · the game is waiting on this decision":'Acil · oyun bu kararı bekliyor'),'',(LANG_EN?"<button class=\"btn sm primary\" data-act=\"evopen\">Decide</button>":'<button class="btn sm primary" data-act="evopen">Karar ver</button>'),1,true));}
  if(bm){const left=Math.max(0,bm.d+14-G.day);cards.push(card((LANG_EN?"Board meeting":'Yönetim kurulu toplantısı'),(LANG_EN?`${bm.items.length} agenda items · ${left} days left · if time runs out: you're marked absent, board confidence −6`:`${bm.items.length} gündem maddesi · ${left} gün kaldı · süre dolarsa: katılmamış sayılırsın, kurul güveni −6`),'',(LANG_EN?"<button class=\"btn sm primary\" data-act=\"bmopen\">Join meeting</button>":'<button class="btn sm primary" data-act="bmopen">Toplantıya katıl</button>'),(G.day-bm.d)/14,left<=3));}
  for(const it of L){const v=ibView(it);if(!v)continue;const left=Math.max(0,it.until-G.day),i=ibDefI(it),tot=Math.max(1,it.until-it.at);
    cards.push(card(v.t,(LANG_EN?`${left} days left · if time runs out: ${v.o[i]?v.o[i].t:"default"}`:`${left} gün kaldı · süre dolarsa: ${v.o[i]?v.o[i].t:'varsayılan'}`),v.b&&v.b.length>170?v.b.slice(0,168)+'…':v.b,(LANG_EN?`<button class="btn sm primary" data-act="ibopen" data-k="${it.key}">Decide</button>`:`<button class="btn sm primary" data-act="ibopen" data-k="${it.key}">Karar ver</button>`),(G.day-it.at)/tot,left<=2));}
  return (LANG_EN?`<div class="eyebrow">Decision inbox</div><h2>${n?`${n} decisions pending`:"No pending decisions"}</h2>
    <p class="small muted">${ibOn()?"The game keeps running. Only urgent events (ransomware, takeovers, board coups) pause it. When a decision expires, the listed default option applies.":"\"Pause on every decision\" is on in settings: decisions open as soon as they arrive."}</p>
    <div class="col" style="gap:8px">${cards.join('')||"<div class=\"small muted\">Nothing needs your decision right now.</div>"}</div>
    <div class="row between" style="margin-top:12px;gap:8px;flex-wrap:wrap"><button class="btn sm ghost" data-act="decide">${ibOn()?"Pause on every decision":"Pause only on urgent decisions"}</button><button class="btn primary" data-act="close">Close</button></div>`:`<div class="eyebrow">Karar kutusu</div><h2>${n?`${n} karar bekliyor`:'Bekleyen karar yok'}</h2>
    <p class="small muted">${ibOn()?'Oyun akmaya devam ediyor. Yalnızca acil olaylar (fidye, devralma, kurul darbesi) oyunu durdurur. Süresi dolan kararda yazılı varsayılan seçenek uygulanır.':'Ayarlarda "her kararda dur" seçili: kararlar geldiği anda açılır.'}</p>
    <div class="col" style="gap:8px">${cards.join('')||'<div class="small muted">Şu an senden karar bekleyen bir şey yok.</div>'}</div>
    <div class="row between" style="margin-top:12px;gap:8px;flex-wrap:wrap"><button class="btn sm ghost" data-act="decide">${ibOn()?'Her kararda durmak istiyorum':'Yalnızca acil kararlarda dur'}</button><button class="btn primary" data-act="close">Kapat</button></div>`);}

