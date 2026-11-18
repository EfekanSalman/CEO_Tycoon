/* ============================== CURRENCIES ============================== */
const CUR={tr:{n:(LANG_EN?"Turkish lira":'Türk lirası'),k:'TRY',sig:0.045,crash:0.02,hi:1.25,cr:[0.18,0.3],prem:0.012},eu:{n:(LANG_EN?"Euro":'Euro'),k:'EUR',sig:0.02,crash:0.003,cr:[0.08,0.12],prem:0.002},
  asia:{n:(LANG_EN?"Asian currencies":'Asya para birimleri'),k:(LANG_EN?"Asian basket":'Asya sepeti'),sig:0.02,crash:0.004,cr:[0.12,0.18],prem:0.003},latam:{n:(LANG_EN?"Latin American currencies":'Latin Amerika para birimleri'),k:(LANG_EN?"Latin basket":'Latin sepeti'),sig:0.04,crash:0.015,hi:1.3,cr:[0.15,0.25],prem:0.008}};
const CUR_ORDER=['tr','eu','asia','latam'];
const REG_CUR={turkiye:'tr',avrupa:'eu',cin:'asia',tayvan:'asia',kore:'asia',japonya:'asia',vietnam:'asia',meksika:'latam'};
const newFx=()=>({d:{tr:1,eu:1,asia:1,latam:1},h:{},hist:[],mr:0,mc:0,lr:0,lc:0});
const fxDev=c=>G.fx&&G.fx.d[c]!=null?G.fx.d[c]:1;
function fxEff(c){const F=G.fx;if(!F)return 1;const H=F.h[c],d=fxDev(c);return H&&H.until>G.day?H.r*H.lock+(1-H.r)*d:d;}
const fxRevM=r=>r==='na'||!CUR[r]?1:Math.pow(fxEff(r),0.7);
const fxCostR=region=>{const c=REG_CUR[region];return c?Math.pow(fxDev(c),0.6):1;};
const fxSal=()=>Math.pow(fxDev('tr'),0.5);
function fxNominal(c){const d=fxDev(c);return c==='tr'?2.9*Math.pow(1.14,years())/d:c==='eu'?1.09*d:100*d;}
const fxLabel=c=>c==='tr'?`USD/TRY ${fx(fxNominal(c),2)}`:c==='eu'?`EUR/USD ${fx(fxNominal(c),3)}`:`${CUR[c].k} ${fx(fxNominal(c),1)}`;
function fxShockAll(f,why){const F=G.fx;if(!F)return;for(const c of CUR_ORDER)F.d[c]=clamp(F.d[c]*f,0.4,1.6);if(why)news(why,'bad');}
function fxMonthly(){
  const F=G.fx;if(!F)return;
  for(const c of CUR_ORDER){const C=CUR[c],old=F.d[c],z=(Math.random()+Math.random()+Math.random()-1.5)*2;
    let d=old*Math.exp(C.sig*z)+(1-old)*0.06;
    if(Math.random()<C.crash*(G.mods&&G.mods.ev?G.mods.ev/0.42:1)){const k=rnd(C.cr[0],C.cr[1]),up=c==='eu'&&Math.random()<0.4;d=up?d*(1+k):d*(1-k);const H=F.h[c],hedged=H&&H.until>G.day&&H.r>=0.5;if(hedged&&!up)(G.flags=G.flags||{}).hedged=true;
      const ex=c==='tr'||(c==='eu'&&G.regions.eu.in)||(c==='asia'&&(G.regions.asia.in||Object.values(G.sup||{}).some(id=>SUPD[id]&&REG_CUR[SUPD[id].region]==='asia')))||(c==='latam'&&G.regions.latam.in);
      news((LANG_EN?`${C.n} ${up?"surged":"crashed"}: ${up?'+':'−'}${Math.round(k*100)}%.${hedged&&!up?" Your currency hedge is protecting your revenue.":''}`:`${C.n} ${up?'sert değer kazandı':'çöktü'}: ${up?'+':'−'}%${Math.round(k*100)}.${hedged&&!up?' Kur korumanın sayesinde gelirin korunuyor.':''}`),up?'good':'bad',ex);if(ex)tl(up?'val':'bad',`${C.n} ${up?(LANG_EN?"rose":'yükseldi'):(LANG_EN?"crashed":'çöktü')}`);}
    F.d[c]=clamp(d,0.4,C.hi||1.4);}
  for(const c in F.h)if(F.h[c].until<=G.day){news((LANG_EN?`Your currency hedge for ${CUR[c].n} has expired.`:`${CUR[c].n} için kur koruman sona erdi.`),'');delete F.h[c];}
  F.lr=F.mr;F.lc=F.mc;F.mr=0;F.mc=0;
  F.hist.push({d:G.day,v:Object.fromEntries(CUR_ORDER.map(c=>[c,Math.round(F.d[c]*1000)/1000]))});if(F.hist.length>240)F.hist.shift();
  G.latFx=clamp(Math.pow(F.d.latam,0.6),0.5,1.3);
}
function fxExpo(c){const r=c;const rev=(G.rl||{})[r]||0;
  const sal=c==='tr'?G.emps.reduce((a,e)=>a+e.salary,0):0;
  const sup=Object.keys(CCATS).reduce((a,cc)=>{const sp=SUPD[G.sup[cc]];return a+(sp&&!sp.own&&REG_CUR[sp.region]===c?catMonthSpend(cc,sp.price):0);},0);
  const fac=G.factories.filter(f=>REG_CUR[f.region]===c).reduce((a,f)=>a+facUpkeep(f),0);
  return {rev,cost:sal+sup+fac,sal,sup,fac};}
const fxPrem=(c,h,m)=>((G.rl||{})[c]||0)*h*m*CUR[c].prem;
function vFx(){
  const F=G.fx,h=F.hist;
  const rows=CUR_ORDER.map(c=>{const d=fxDev(c),e=fxExpo(c),H=F.h[c]&&F.h[c].until>G.day?F.h[c]:null,old=h.length>12?h[h.length-13].v[c]:h.length?h[0].v[c]:1,ch=d/old-1;
    const reg=c==='asia'?'asia':c,rin=c==='tr'||G.regions[reg]&&G.regions[reg].in;
    return (LANG_EN?`<div class="proj col" style="gap:6px"><div class="row between"><b>${CUR[c].n}</b><span class="num small">${fxLabel(c)}</span></div>
      <div class="kv"><span>Value</span><b class="${d<0.95?'neg':d>1.05?'pos':''}">${d>=1?'+':'−'}${pct(Math.abs(d-1),0)} <small class="muted">vs. normal</small></b><span>12 months</span><b class="${ch>=0?'pos':'neg'}">${ch>=0?'+':'−'}${pct(Math.abs(ch),0)}</b>
        <span>Monthly revenue</span><b>${money(e.rev)}</b><span>Monthly costs</span><b>${money(e.cost)}</b></div>
      <div class="small muted">${e.rev>e.cost*1.2?"Revenue exceeds costs: you lose if the currency falls.":e.cost>e.rev*1.2?"Costs exceed revenue: you gain if the currency falls (natural hedge).":"Revenue and costs are balanced: low currency risk."}</div>
      ${H?`<div class="small"><span class="chip st-ok">${H.r*100}% hedged</span> locked at ${H.lock>=1?'+':'−'}${pct(Math.abs(H.lock-1),0)} · ${Math.ceil((H.until-G.day)/30)} months left</div>`
        :rin&&e.rev>0?`<div class="row" style="gap:4px;flex-wrap:wrap">${[[0.5,6],[1,6],[1,12]].map(([r,m])=>`<button class="btn sm" data-act="fxh" data-c="${c}" data-r="${r}" data-m="${m}" ${G.cash<fxPrem(c,r,m)?'disabled':''}>${r*100}% · ${m} mo · ${money(fxPrem(c,r,m))}</button>`).join('')}</div>`:`<div class="small muted">${rin?"You have no revenue in this currency.":"You don't sell in this region."}</div>`}</div>`:`<div class="proj col" style="gap:6px"><div class="row between"><b>${CUR[c].n}</b><span class="num small">${fxLabel(c)}</span></div>
      <div class="kv"><span>Değer</span><b class="${d<0.95?'neg':d>1.05?'pos':''}">${d>=1?'+':'−'}${pct(Math.abs(d-1),0)} <small class="muted">normale göre</small></b><span>12 ay</span><b class="${ch>=0?'pos':'neg'}">${ch>=0?'+':'−'}${pct(Math.abs(ch),0)}</b>
        <span>Aylık gelir</span><b>${money(e.rev)}</b><span>Aylık gider</span><b>${money(e.cost)}</b></div>
      <div class="small muted">${e.rev>e.cost*1.2?'Gelirin giderinden fazla: kur düşerse kaybedersin.':e.cost>e.rev*1.2?'Giderin gelirinden fazla: kur düşerse kazanırsın (doğal koruma).':'Gelir ve gider dengeli: kur riskin düşük.'}</div>
      ${H?`<div class="small"><span class="chip st-ok">%${H.r*100} korumalı</span> kilit ${H.lock>=1?'+':'−'}${pct(Math.abs(H.lock-1),0)} · ${Math.ceil((H.until-G.day)/30)} ay kaldı</div>`
        :rin&&e.rev>0?`<div class="row" style="gap:4px;flex-wrap:wrap">${[[0.5,6],[1,6],[1,12]].map(([r,m])=>`<button class="btn sm" data-act="fxh" data-c="${c}" data-r="${r}" data-m="${m}" ${G.cash<fxPrem(c,r,m)?'disabled':''}>%${r*100} · ${m} ay · ${money(fxPrem(c,r,m))}</button>`).join('')}</div>`:`<div class="small muted">${rin?'Bu para biriminde gelirin yok.':'Bu bölgede satış yapmıyorsun.'}</div>`}</div>`);}).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Exchange rates${helpBtn('fx')}</h2><span class="sub">Your company reports in dollars</span></div>
    <div class="kpis"><div class="kpi"><span>Last month's FX impact · revenue</span><b class="${F.lr>=0?'pos':'neg'}">${F.lr>=0?'+':'−'}${money(Math.abs(F.lr))}</b></div><div class="kpi"><span>Last month's FX impact · costs</span><b class="${F.lc<=0?'pos':'neg'}">${F.lc<=0?'−':'+'}${money(Math.abs(F.lc))}</b></div>
      <div class="kpi"><span>Payroll cost</span><b class="${fxSal()<1?'pos':fxSal()>1?'neg':''}">×${fx(fxSal(),2)}</b></div><div class="kpi"><span>Active hedges</span><b>${Object.values(F.h).filter(x=>x.until>G.day).length}</b></div></div>
    <div class="pb small muted">Revenue from regions is earned in local currency: if the currency falls, your dollar revenue shrinks. Salaries in Turkey and supplier and factory costs in the regions also move with exchange rates; when the Turkish lira weakens, your payroll gets lighter in dollar terms. A currency hedge (forward) locks part of your revenue at today's rate; its cost depends on currency volatility.</div></section>
  <section class="panel"><div class="ph"><h2>Currency index</h2><span class="sub">100 = normal value</span></div><div class="pb">${lineChart('fxdev',h.map(x=>fmtMonth(x.d)),CUR_ORDER.map((c,i)=>({n:CUR[c].n,c:{tr:'var(--pt-design)',eu:'var(--ch1)',asia:'var(--pt-res)',latam:'var(--pt-mkt)'}[c],v:h.map(x=>x.v[c]*100)})),{label:"Currency indices",h:180,fmt:v=>fx(v,0),empty:"Rates are plotted at month end."})}</div></section>
  <section class="panel"><div class="ph"><h2>Currencies & hedging</h2></div><div class="pb"><div class="grid">${rows}</div></div></section>`:`<section class="panel"><div class="ph"><h2>Döviz kurları${helpBtn('fx')}</h2><span class="sub">Şirketin dolarla raporlar</span></div>
    <div class="kpis"><div class="kpi"><span>Geçen ay kur etkisi · gelir</span><b class="${F.lr>=0?'pos':'neg'}">${F.lr>=0?'+':'−'}${money(Math.abs(F.lr))}</b></div><div class="kpi"><span>Geçen ay kur etkisi · gider</span><b class="${F.lc<=0?'pos':'neg'}">${F.lc<=0?'−':'+'}${money(Math.abs(F.lc))}</b></div>
      <div class="kpi"><span>Maaş maliyeti</span><b class="${fxSal()<1?'pos':fxSal()>1?'neg':''}">×${fx(fxSal(),2)}</b></div><div class="kpi"><span>Aktif koruma</span><b>${Object.values(F.h).filter(x=>x.until>G.day).length}</b></div></div>
    <div class="pb small muted">Bölgelerden gelen gelir yerel parayla kazanılır: kur düşerse dolar gelirin azalır. Türkiye'deki maaşlar ve bölgelerdeki tedarikçi ve fabrika giderleri de kurla değişir; Türk lirası değer kaybettiğinde dolar bazında maaş yükün hafifler. Kur koruması (forward) gelirinin bir kısmını bugünkü kurdan kilitler; bedeli kur oynaklığına göre değişir.</div></section>
  <section class="panel"><div class="ph"><h2>Kur endeksi</h2><span class="sub">100 = normal değer</span></div><div class="pb">${lineChart('fxdev',h.map(x=>fmtMonth(x.d)),CUR_ORDER.map((c,i)=>({n:CUR[c].n,c:{tr:'var(--pt-design)',eu:'var(--ch1)',asia:'var(--pt-res)',latam:'var(--pt-mkt)'}[c],v:h.map(x=>x.v[c]*100)})),{label:'Kur endeksleri',h:180,fmt:v=>fx(v,0),empty:'Kurlar ay sonlarında çizilir.'})}</div></section>
  <section class="panel"><div class="ph"><h2>Para birimleri ve koruma</h2></div><div class="pb"><div class="grid">${rows}</div></div></section>`);
}

