/* ============================== VISUAL PAGES: AR-GE / PAZAR / FİNANS (v178) ============================== */
const RES_IC='<svg viewBox="0 0 26 26"><path d="M10 3h6M11 3v7l-6 10a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-6-10V3"/><path d="M8 16h10"/></svg>';
const resCat=r=>(PAT_CAT[r.id]||[])[0]||null;
const resCC=r=>{const c=resCat(r);return c?deskCC(c):'var(--pt-res)';};
const resIcon=r=>{const c=resCat(r);return `<span class="rc-ic" aria-hidden="true">${c&&CAT_ICON[c]?CAT_ICON[c]:RES_IC}</span>`;};
/* bu araştırmanın açtığı (önkoşulu olduğu) araştırmalar */
const resUnlocks=r=>RES.filter(x=>(x.pre||[]).includes(r.id));
function resMeta(r,rp,done,act){const u=resUnlocks(r),days=!done&&!act&&rp>0?Math.ceil(resRP(r)/rp):null;
  return (days!=null?`<div class="small rc-days">${LANG_EN?'≈':'≈'} ${num(days)} ${LANG_EN?'days with your team':'gün (mevcut ekiple)'}</div>`:'')+(u.length?`<div class="rc-un"><span class="small muted">${LANG_EN?'Unlocks':'Açar'}:</span>${u.slice(0,4).map(x=>`<span class="rc-chip">${esc(x.n)}</span>`).join('')}${u.length>4?`<span class="small muted">+${u.length-4}</span>`:''}</div>`:'');}
/* şu anki araştırma: büyük halka, kalan süre, ne açtığı */
function resHero(actR,a,rp){
  if(!actR)return rp?`<div class="res-now idle small">${LANG_EN?'<b>Research is idle.</b> Your researchers are generating points that go unused; start a technology below.':'<b>Araştırma boşta.</b> Araştırmacıların puan üretiyor ama kullanılmıyor; aşağıdan bir teknoloji başlat.'}</div>`:`<div class="res-now idle small">${LANG_EN?'Hire a researcher in the Team section to do research.':'Araştırma yapmak için Ekip bölümünden bir araştırmacı işe al.'}</div>`;
  const f=a.p/actRP(),left=rp?Math.ceil((actRP()-a.p)/rp):null,u=resUnlocks(actR),cc=resCC(actR);
  const long=left!=null&&left>720;
  return `<div class="rhero" style="--cc:${cc}">${deskRing(f,cc,96,Math.round(f*100)+'%')}<div class="rh-b"><span class="small muted">${LANG_EN?'Now researching':'Şu an araştırılıyor'}</span><b class="rh-n">${resIcon(actR)}${esc(actR.n)}</b><span class="small">${esc(actR.d)}</span>
    <div class="rh-f"><span class="chip ${long?'st-warn':'r-res'}">${left==null?(LANG_EN?'No researchers':'Araştırmacı yok'):'≈ '+num(left)+(LANG_EN?' days':' gün')}</span>${long?`<span class="small warn">${LANG_EN?'Very slow: hire more researchers or pick something cheaper.':'Çok yavaş: araştırmacı al ya da daha ucuz bir şey seç.'}</span>`:''}</div>
    ${u.length?`<div class="rc-un"><span class="small muted">${LANG_EN?'Then unlocks':'Bitince açılır'}:</span>${u.slice(0,5).map(x=>`<span class="rc-chip">${esc(x.n)}</span>`).join('')}</div>`:''}</div></div>`;}
/* ---- Pazar: değer ligi (sen + rakipler, yatay çubuklar) ---- */
function marketLeague(){const live=liveComps(),me={id:'P',name:G.name,v:valuation()};
  const L=[me,...live.map(c=>({id:c.id,name:c.name,v:compVal(c)}))].sort((a,b)=>b.v-a.v),mx=Math.max(1,L[0].v),myR=L.findIndex(x=>x.id==='P')+1;
  const show=L.slice(0,10);if(myR>10)show.push(me);
  return `<section class="panel"><div class="ph"><h2>${LANG_EN?'Value league':'Değer ligi'}</h2><span class="sub">${LANG_EN?`You are #${myR} of ${L.length}`:`${L.length} şirket içinde ${myR}. sıradasın`}</span></div><div class="pb"><div class="mleague">${show.map(x=>{const rank=L.indexOf(x)+1,me2=x.id==='P';
    return `<div class="ml-row${me2?' me':''}"><span class="ml-r num">${rank}</span><span class="ml-n">${me2?`<b>${esc(x.name)}</b> <span class="chip st-ok">${LANG_EN?'you':'sen'}</span>`:esc(x.name)}</span><span class="ml-bar"><i style="width:${Math.max(1.5,x.v/mx*100).toFixed(1)}%;background:${ownerColor(x.id)}"></i></span><span class="ml-v num">${money(x.v)}</span></div>`;}).join('')}</div></div></section>`;}
/* kategoride oyuncunun sırası */
function mkMyRank(cat){const by={};for(const p of G.products)if(p.active&&p.cat===cat)by[p.owner]=(by[p.owner]||0)+p.share;const L=Object.entries(by).sort((a,b)=>b[1]-a[1]);const i=L.findIndex(x=>x[0]==='P');return i<0?null:{r:i+1,n:L.length};}
/* ---- Finans: son ayın para akışı (şelale) ve 12 aylık gelir/gider/kâr eğilimi ---- */
function finFlow(){const h=G.hist[G.hist.length-1];if(!h||!h.m)return `<section class="panel"><div class="ph"><h2>${LANG_EN?'Where the money goes':'Para nereye gidiyor'}</h2></div><div class="empty">${LANG_EN?'The chart appears after the first month closes.':'Grafik ilk ay kapanınca çizilecek.'}</div></section>`;
  const m=h.m,T=LANG_EN;const steps=[
    {k:'rev',n:T?'Revenue':'Gelir',v:m.rev||0,c:'var(--ok)',add:true},
    {k:'supply',n:T?'Parts':'Parça',v:m.supply||0,c:'var(--pt-hw)'},
    {k:'prod',n:T?'Production':'Üretim',v:m.prod||0,c:'var(--pt-ops)'},
    {k:'salary',n:T?'Salaries':'Maaş',v:m.salary||0,c:'var(--pt-soft)'},
    {k:'place',n:T?'Rent & infra':'Kira ve altyapı',v:(m.rent||0)+(m.infra||0)+(m.fact||0),c:'var(--pt-sup)'},
    {k:'interest',n:T?'Interest':'Faiz',v:m.interest||0,c:'var(--warn)'},
    {k:'other',n:T?'Other':'Diğer',v:(m.other||0)+(m.pas||0),c:'var(--pt-sec)'}].filter(s=>s.add||s.v>0.5);
  const profit=h.profit,top=Math.max(m.rev||0,h.cost||0,1);let run=0;
  const cols=steps.map(s=>{let y0,y1;if(s.add){y0=0;y1=s.v;run=s.v;}else{y1=run;y0=run-s.v;run=y0;}const lo=Math.min(y0,y1),hi=Math.max(y0,y1);
    return `<div class="wf-col" title="${esc(s.n)}: ${s.add?'':'−'}${money(s.v)}"><div class="wf-plot"><i style="bottom:${Math.max(0,lo)/top*100}%;height:${Math.max(0.6,(hi-Math.max(0,lo))/top*100)}%;background:${s.c}"></i></div><span class="wf-v num">${s.add?'':'−'}${money(s.v)}</span><span class="wf-n">${esc(s.n)}</span></div>`;}).join('');
  const pc=profit>=0?'var(--accent)':'var(--bad)';
  const pcol=`<div class="wf-col wf-total" title="${T?'Profit':'Kâr'}: ${money(profit)}"><div class="wf-plot"><i style="bottom:0;height:${Math.max(0.6,Math.abs(profit)/top*100)}%;background:${pc}"></i></div><span class="wf-v num ${profit<0?'neg':'pos'}">${money(profit)}</span><span class="wf-n"><b>${T?'Profit':'Kâr'}</b></span></div>`;
  const H=G.hist.slice(-12),mx=Math.max(1,...H.map(x=>Math.max(x.rev,x.cost)));
  const trend=H.map(x=>`<div class="tr-col" title="${fmtMonth(x.d)} · ${T?'revenue':'gelir'} ${money(x.rev)} · ${T?'expenses':'gider'} ${money(x.cost)} · ${T?'profit':'kâr'} ${money(x.profit)}"><div class="tr-plot"><i class="tr-r" style="height:${x.rev/mx*100}%"></i><i class="tr-c" style="height:${x.cost/mx*100}%"></i></div><span class="tr-p ${x.profit<0?'neg':'pos'}">${x.profit<0?'▼':'▲'}</span><span class="tr-l">${fmtMonth(x.d).split(' ')[0]}</span></div>`).join('');
  const cash=profit-(m.capex||0);
  return `<section class="panel"><div class="ph"><h2>${T?'Where the money goes':'Para nereye gidiyor'}</h2><span class="sub">${fmtMonth(h.d)} · ${T?'margin':'marj'} ${m.rev>0?`%${Math.round(profit/m.rev*100)}`:'—'}${m.capex?` · ${T?'investment':'yatırım'} ${money(m.capex)} · ${T?'net cash flow':'net nakit akışı'} <b class="${cash<0?'neg':'pos'}">${money(cash)}</b>`:''}</span></div>
    <div class="pb fin-vis"><div class="wf" role="img" aria-label="${T?'Last month: revenue, expenses by type and profit':'Geçen ay: gelir, türüne göre giderler ve kâr'}">${cols}${pcol}</div>
    <div class="trend"><div class="small muted" style="margin-bottom:6px"><i class="dot" style="background:var(--ok)"></i> ${T?'revenue':'gelir'} &nbsp;<i class="dot" style="background:var(--bad)"></i> ${T?'expenses':'gider'} &nbsp;${T?'last 12 months':'son 12 ay'}</div><div class="tr-wrap">${trend}</div></div></div></section>`;}
