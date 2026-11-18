/* ============================== LATE-GAME GOALS ============================== */
/* Büyük hedefler: 10. yılda ya da şirket değeri bugünün fiyatlarıyla 5 milyar doları geçince açılır. Dört hedef, her biri bronz/gümüş/altın.
   Tekel: bir kategoride %60+ payı 12 ay üst üste tut (kategori sayısı). Sektör lideri: ürün cirosu ve değerle aynı anda en büyük ol (üst üste ay).
   Holding: aynı anda faal iş kolu sayısı. Dünya devi: enflasyondan arındırılmış şirket değeri. Kademeler en iyi sonuçla kalıcıdır;
   her kademe marka ve CEO deneyimi verir, toplamı miras puanıdır (en fazla 12). Takip ay sonunda yapılır. */
const LG_Y=10,LG_V=5e9,LG_MONO=0.6,LG_MONO_M=12;
const LG_TIER=['',(LANG_EN?"Bronze":'Bronz'),(LANG_EN?"Silver":'Gümüş'),(LANG_EN?"Gold":'Altın')];
const LG=[
  {id:'mono',n:(LANG_EN?"Monopoly":'Tekel'),d:(LANG_EN?`Hold 60% or more of a category's market for 12 months in a row. The Competition Authority investigates shares above 45%; you'll need to survive the investigations.`:`Bir kategoride pazarın %60'ını ya da fazlasını 12 ay üst üste elinde tut. Rekabet Kurumu %45'i aşan payları soruşturur; soruşturmaları atlatman gerekir.`),t:[1,3,5],u:'kategori'},
  {id:'lead',n:(LANG_EN?"Industry leader":'Sektör lideri'),d:(LANG_EN?"Be ahead of all your rivals in product revenue and company value at the same time, and keep it up month after month.":'Ürün cirosunda ve şirket değerinde aynı anda bütün rakiplerinin önünde ol ve bunu üst üste koru.'),t:[12,36,60],u:'ay'},
  {id:'hold',n:(LANG_EN?"Holding company":'Holding'),d:(LANG_EN?"Be active in many business lines at once: software, hardware, manufacturing, retail, media, real estate, mining, stakes, acquired companies, data centers, space.":'Aynı anda birçok iş kolunda faal ol: yazılım, donanım, üretim, perakende, medya, gayrimenkul, madencilik, iştirakler, satın alınan şirketler, veri merkezi, uzay.'),t:[5,7,9],u:(LANG_EN?"business lines":'iş kolu')},
  {id:'val',n:(LANG_EN?"Global giant":'Dünya devi'),d:(LANG_EN?"Grow your company value. Targets are set at today's prices and rise with inflation.":'Şirket değerini büyüt. Hedefler bugünün fiyatlarıyla verilir ve enflasyonla birlikte artar.'),t:[10e9,50e9,250e9],u:'$'}];
const LGD=Object.fromEntries(LG.map(g=>[g.id,g]));
const newLg=()=>({un:null,ms:{},md:{},ls:0,lb:0,hb:0,vb:0,tr:{}});
const lgOf=()=>G.lg||(G.lg=newLg());
const lgOn=()=>!!(G&&G.lg&&G.lg.un!=null);
const lgUnlockNow=()=>years()>=LG_Y||valuation()/infl()>=LG_V;
const lgPts=()=>G&&G.lg?LG.reduce((a,g)=>a+(G.lg.tr[g.id]||0),0):0;
/* iş kolları */
const LG_LINES=[
  ['sw',(LANG_EN?"Software":'Yazılım'),()=>myActive().filter(p=>!isHW(p)).length>=2,(LANG_EN?"2 software products":'2 yazılım ürünü')],
  ['hw',(LANG_EN?"Hardware":'Donanım'),()=>myActive().filter(p=>isHW(p)).length>=2,(LANG_EN?"2 hardware products":'2 donanım ürünü')],
  ['fac',(LANG_EN?"Manufacturing":'Üretim'),()=>G.factories.length>=2,(LANG_EN?"2 factories":'2 fabrika')],
  ['ret',(LANG_EN?"Retail":'Perakende'),()=>!!G.shops&&G.shops.list.length>=5,(LANG_EN?"5 stores":'5 mağaza')],
  ['md',(LANG_EN?"Media":'Medya'),()=>mdOn(),(LANG_EN?"media company":'medya şirketi')],
  ['re',(LANG_EN?"Real estate":'Gayrimenkul'),()=>!!G.cm&&G.cm.re.length>=2,(LANG_EN?"2 buildings":'2 bina')],
  ['raw',(LANG_EN?"Mining":'Madencilik'),()=>!!G.raw&&Object.keys(G.raw.mine||{}).some(m=>mineLvl(m)>0),(LANG_EN?"1 mine":'1 maden')],
  ['inv',(LANG_EN?"Stakes":'İştirakler'),()=>!!G.pf&&Object.keys(G.pf.h).some(id=>G.pf.h[id]>=0.2&&comp(id)&&!comp(id).dead),(LANG_EN?"20% of a rival":'bir rakipte %20 hisse')],
  ['acq',(LANG_EN?"Acquired companies":'Satın alınan şirketler'),()=>(G.acqs||[]).length>0,(LANG_EN?"1 acquisition":'1 satın alma')],
  ['dc',(LANG_EN?"Data center":'Veri merkezi'),()=>(G.dcs||[]).length>0,(LANG_EN?"1 data center":'1 veri merkezi')],
  ['sp',(LANG_EN?"Space":'Uzay'),()=>spAlive()>0,(LANG_EN?"satellites in orbit":'yörüngede uydu')]];
function lgLines(){return LG_LINES.map(([k,n,f,h])=>{let ok=false;try{ok=!!f();}catch(e){}return {k,n,ok,h};});}
/* ürün cirosu (aylık): sahibine göre tek geçişte */
function lgRevs(){const r={};for(const p of G.products){if(!p.active)continue;const v=(p.owner==='P'&&isHW(p)?(p.sr||0):(p.units||0))*p.price;if(v>0)r[p.owner]=(r[p.owner]||0)+v;}return r;}
function lgLeadNow(){const R=lgRevs(),me=R.P||0,v=valuation();let top=null;
  for(const c of liveComps()){const cv=compVal(c),cr=R[c.id]||0;if(!top||cr+cv/100>top.r+top.v/100)top={n:c.name,r:cr,v:cv};
    if(cr>=me||cv>=v)return {ok:false,me,v,top:{n:c.name,r:cr,v:cv}};}
  return {ok:me>0,me,v,top};}
function lgCatSh(cat){return myActive(cat).reduce((a,p)=>a+(p.share||0),0);}
/* hedefin kademe ölçüsü (en iyi sonuç) */
function lgMeasure(id){const L=lgOf();
  if(id==='mono')return Object.keys(L.md).length;
  if(id==='lead')return L.lb;
  if(id==='hold')return L.hb;
  return L.vb;}
const lgTierOf=id=>{const g=LGD[id],m=lgMeasure(id);let t=0;for(let i=0;i<3;i++)if(m>=g.t[i])t=i+1;return t;};
function lgReward(g,t){G.brand=clamp(G.brand+t,0,100);ceoXP(100*t,(LANG_EN?"Grand goal":'Büyük hedef'));
  tl('star',(LANG_EN?`${g.n}: ${LG_TIER[t]} tier`:`${g.n}: ${LG_TIER[t]} kademe`));news((LANG_EN?`Grand goal: ${g.n} reached the ${LG_TIER[t].toLocaleLowerCase(LOC)} tier! Brand +${t}.`:`Büyük hedef: ${g.n}, ${LG_TIER[t].toLocaleLowerCase(LOC)} kademeye ulaştı! Marka +${t}.`),'good',true);
}
function lgMonthly(){if(!G||G.over||sgOff('lg'))return;const L=lgOf();focusTip();
  if(L.un==null){if(!lgUnlockNow())return;L.un=G.day;tl('star',(LANG_EN?"Grand goals unlocked":'Büyük hedefler açıldı'));
    news((LANG_EN?"Grand goals unlocked: monopoly, industry leadership, holding company and global giant. Track the bronze, silver and gold tiers on the Quests page.":'Büyük hedefler açıldı: tekel, sektör liderliği, holding ve dünya devi. Görevler sayfasında bronz, gümüş ve altın kademeleri izleyebilirsin.'),'good',true);return;}
  for(const cat of CAT_ORDER){const sh=lgCatSh(cat);L.ms[cat]=sh>=LG_MONO?(L.ms[cat]||0)+1:0;if(!L.ms[cat])delete L.ms[cat];
    if(L.ms[cat]>=LG_MONO_M&&L.md[cat]==null){L.md[cat]=G.day;news((LANG_EN?`Monopoly: your share of the ${CATS[cat].n} market has been above 60% for 12 months.`:`Tekel: ${CATS[cat].n} pazarındaki payın 12 aydır %60'ın üstünde.`),'good',true);}}
  const ld=lgLeadNow();L.ls=ld.ok?L.ls+1:0;L.lb=Math.max(L.lb,L.ls);
  L.hb=Math.max(L.hb,lgLines().filter(x=>x.ok).length);
  L.vb=Math.max(L.vb,Math.round(valuation()/infl()));
  for(const g of LG){const t=lgTierOf(g.id),o=L.tr[g.id]||0;if(t>o){L.tr[g.id]=t;for(let i=o+1;i<=t;i++)lgReward(g,i);}}}
/* ---- görünüm ---- */
function lgFmt(g,v){const u=LANG_EN&&g.u==='kategori'?(v===1?'category':'categories'):LANG_EN&&g.u==='ay'?(v===1?'month':'months'):g.u;return g.u==='$'?money(v*infl()):`${num(Math.round(v))} ${u}`;}
function lgProg(g){const L=lgOf(),t=L.tr[g.id]||0,nx=g.t[Math.min(2,t)];
  if(g.id==='mono'){const best=Object.keys(L.ms).sort((a,b)=>L.ms[b]-L.ms[a])[0];
    return {cur:Object.keys(L.md).length,nx,p:t>=3?1:Math.min(1,(Object.keys(L.md).length+(best?L.ms[best]/LG_MONO_M:0))/nx),
      sub:best&&L.md[best]==null?(LANG_EN?`${CATS[best].n}: above 60% for ${L.ms[best]}/${LG_MONO_M} months`:`${CATS[best].n}: ${L.ms[best]}/${LG_MONO_M} ay %60 üstünde`):Object.keys(L.md).length?(LANG_EN?`Markets you monopolize: ${Object.keys(L.md).map(c=>CATS[c].n).join(', ')}`:`Tekel olduğun pazarlar: ${Object.keys(L.md).map(c=>CATS[c].n).join(', ')}`):(LANG_EN?`No market with a 60% share yet`:`Henüz %60 payı olan pazar yok`)};}
  if(g.id==='lead'){const ld=lgLeadNow();return {cur:L.ls,nx,p:t>=3?1:Math.min(1,L.ls/nx),
      sub:ld.ok?(LANG_EN?`You're the industry's biggest company right now · best streak ${L.lb} months`:`Şu an sektörün en büyüğüsün · en iyi seri ${L.lb} ay`):ld.top?(LANG_EN?`Ahead of you: ${ld.top.n} (revenue ${money(ld.top.r)}/mo, value ${money(ld.top.v)})`:`Önünde: ${ld.top.n} (ciro ${money(ld.top.r)}/ay, değer ${money(ld.top.v)})`):(LANG_EN?"No rivals":'Rakip yok')};}
  if(g.id==='hold'){const ls=lgLines(),n=ls.filter(x=>x.ok).length;return {cur:n,nx,p:t>=3?1:Math.min(1,n/nx),lines:ls,sub:(LANG_EN?`${n} business lines now · best ${L.hb}`:`Şu an ${n} iş kolu · en iyi ${L.hb}`)};}
  const v=valuation()/infl();return {cur:v,nx,p:t>=3?1:Math.min(1,v/nx),sub:(LANG_EN?`Now ${money(valuation())} · target ${money(nx*infl())}`:`Şu an ${money(valuation())} · hedef ${money(nx*infl())}`)};}
const lgMedal=t=>`<span class="lg-m t${t}" aria-label="${t?LG_TIER[t]:(LANG_EN?"No tier":'Kademe yok')}">${[1,2,3].map(i=>`<i class="${i<=t?'on':''}"></i>`).join('')}</span>`;
function lgCard(g){const L=lgOf(),t=L.tr[g.id]||0,P=lgProg(g);
  return (LANG_EN?`<div class="lg-c${t>=3?' gold':''}"><div class="row between"><b>${g.n}</b>${lgMedal(t)}</div><div class="small muted">${g.d}</div>
    <div class="row between small"><span>${t>=3?"Gold tier complete":`Next: ${LG_TIER[t+1]} · ${lgFmt(g,P.nx)}`}</span><span class="num">${Math.round(P.p*100)}%</span></div><div class="bar"><i style="width:${(P.p*100).toFixed(0)}%"></i></div>
    <div class="small">${esc(P.sub)}</div>
    ${P.lines?`<div class="lg-ls">${P.lines.map(x=>`<span class="chip ${x.ok?'st-ok':'st-mute'}" title="${esc(x.h)}">${x.ok?'✓ ':''}${x.n}</span>`).join('')}</div>`:''}
    <div class="small muted">Tiers: ${g.t.map((x,i)=>`${LG_TIER[i+1]} ${lgFmt(g,x)}`).join(' · ')}</div></div>`:`<div class="lg-c${t>=3?' gold':''}"><div class="row between"><b>${g.n}</b>${lgMedal(t)}</div><div class="small muted">${g.d}</div>
    <div class="row between small"><span>${t>=3?'Altın kademe tamam':`Sıradaki: ${LG_TIER[t+1]} · ${lgFmt(g,P.nx)}`}</span><span class="num">%${Math.round(P.p*100)}</span></div><div class="bar"><i style="width:${(P.p*100).toFixed(0)}%"></i></div>
    <div class="small">${esc(P.sub)}</div>
    ${P.lines?`<div class="lg-ls">${P.lines.map(x=>`<span class="chip ${x.ok?'st-ok':'st-mute'}" title="${esc(x.h)}">${x.ok?'✓ ':''}${x.n}</span>`).join('')}</div>`:''}
    <div class="small muted">Kademeler: ${g.t.map((x,i)=>`${LG_TIER[i+1]} ${lgFmt(g,x)}`).join(' · ')}</div></div>`);}
function vLateGoals(){const L=lgOf();
  if(L.un==null)return (LANG_EN?`<section class="panel"><div class="ph"><h2>Grand goals${helpBtn('lgoals')}</h2><span class="sub">locked for now</span></div><div class="pb small muted">Unlock in year 10, or when your company value passes ${money(LG_V*infl())} at today's prices: ${LG.map(g=>g.n).join(', ')}. Each has a bronze, silver and gold tier.</div></section>`:`<section class="panel"><div class="ph"><h2>Büyük hedefler${helpBtn('lgoals')}</h2><span class="sub">henüz kilitli</span></div><div class="pb small muted">10. yılda ya da şirket değerin bugünün fiyatlarıyla ${money(LG_V*infl())} değerini geçince açılır: ${LG.map(g=>g.n).join(', ')}. Her birinin bronz, gümüş ve altın kademesi var.</div></section>`);
  return (LANG_EN?`<section class="panel lg"><div class="ph"><h2>Grand goals${helpBtn('lgoals')}</h2><span class="sub">Legacy score ${lgPts()}/12 · updated at month end</span></div><div class="pb"><div class="lg-g">${LG.map(lgCard).join('')}</div></div></section>`:`<section class="panel lg"><div class="ph"><h2>Büyük hedefler${helpBtn('lgoals')}</h2><span class="sub">Miras puanı ${lgPts()}/12 · ay sonunda güncellenir</span></div><div class="pb"><div class="lg-g">${LG.map(lgCard).join('')}</div></div></section>`);}
/* CEO masası için kısa şerit */
function lgStrip(){if(!lgOn())return '';const L=lgOf();
  return (LANG_EN?`<section class="panel lg-s"><div class="pb row between" style="gap:10px;flex-wrap:wrap"><span class="row" style="gap:10px;flex-wrap:wrap"><b>Grand goals</b><span class="small muted">Legacy ${lgPts()}/12</span>
    ${LG.map(g=>{const t=L.tr[g.id]||0,P=lgProg(g);return `<span class="lg-pill small">${g.n} ${lgMedal(t)}<span class="num muted">${LANG_EN?Math.round(P.p*100)+'%':'%'+Math.round(P.p*100)}</span></span>`;}).join('')}</span>
    <button class="btn sm ghost" data-act="tab" data-tab="quest">Details</button></div></section>`:`<section class="panel lg-s"><div class="pb row between" style="gap:10px;flex-wrap:wrap"><span class="row" style="gap:10px;flex-wrap:wrap"><b>Büyük hedefler</b><span class="small muted">Miras ${lgPts()}/12</span>
    ${LG.map(g=>{const t=L.tr[g.id]||0,P=lgProg(g);return `<span class="lg-pill small">${g.n} ${lgMedal(t)}<span class="num muted">${LANG_EN?Math.round(P.p*100)+'%':'%'+Math.round(P.p*100)}</span></span>`;}).join('')}</span>
    <button class="btn sm ghost" data-act="tab" data-tab="quest">Ayrıntılar</button></div></section>`);}
