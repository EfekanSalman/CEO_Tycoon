/* ============================== CORPORATE VENTURE FUND ============================== */
const VC_STAGE={seed:{n:(LANG_EN?"Seed":'Tohum'),ask:[0.5e6,2e6],pre:[3e6,8e6],fail:0.02},a:{n:(LANG_EN?"Series A":'Seri A'),ask:[3e6,10e6],pre:[15e6,40e6],fail:0.012},b:{n:(LANG_EN?"Series B":'Seri B'),ask:[10e6,30e6],pre:[60e6,150e6],fail:0.007}};
const VC_P1=[(LANG_EN?"Nova":'Nova'),(LANG_EN?"Quantum":'Kuantum'),(LANG_EN?"Pixel":'Pixel'),(LANG_EN?"Route":'Rota'),(LANG_EN?"Mavi":'Mavi'),(LANG_EN?"Orbit":'Yörünge'),(LANG_EN?"Ada":'Ada'),(LANG_EN?"Fener":'Fener'),(LANG_EN?"Sycamore":'Çınar'),(LANG_EN?"Tulip":'Lale'),(LANG_EN?"Kıvılcım":'Kıvılcım'),(LANG_EN?"Dalga":'Dalga'),(LANG_EN?"Summit":'Zirve'),(LANG_EN?"Current":'Akıntı'),(LANG_EN?"Pusula":'Pusula'),(LANG_EN?"Atlas":'Atlas'),(LANG_EN?"Gull":'Martı'),(LANG_EN?"North":'Kuzey')];
const VC_P2=[(LANG_EN?"Labs":'Labs'),'AI',(LANG_EN?"Tech":'Tek'),(LANG_EN?"Soft":'Soft'),(LANG_EN?"Robotics":'Robotik'),(LANG_EN?"Bulut":'Bulut'),(LANG_EN?"Mobile":'Mobil'),(LANG_EN?"Data":'Veri'),(LANG_EN?"System":'Sistem'),(LANG_EN?"Gaming":'Oyun'),(LANG_EN?"Health":'Sağlık'),(LANG_EN?"Pay":'Ödeme')];
const VC_MIN_VAL=1e7;
const newVC=()=>({pitch:[],port:[],log:[],inv:0,real:0,tech:{}});
const vcValue=()=>G.vc?G.vc.port.reduce((a,h)=>a+h.val*h.stake,0):0;
function vcLog(t,k=''){G.vc.log.unshift({d:G.day,t,k});if(G.vc.log.length>30)G.vc.log.pop();}
function vcSignal(q,noise){return clamp(Math.round(5+2.2*Math.log(q)+rnd(-noise,noise)),1,10);}
function vcPitch(){const st=pick(valuation()>8e7?['seed','a','a','b']:valuation()>3e7?['seed','seed','a']:['seed']),S2=VC_STAGE[st];
  const q=Math.exp(rnd(-1.1,0.7)*(Math.random()<0.15?1.4:1)),cat=pick(CAT_ORDER),I=infl();
  return {id:nid(),name:pick(VC_P1)+' '+pick(VC_P2),cat,st,ask:Math.round(rnd(...S2.ask)*I/1e4)*1e4,pre:Math.round(rnd(...S2.pre)*I/1e4)*1e4,q,team:vcSignal(q,2),dd:false,until:G.day+60};}
function vcBoost(cat){if(!G.vc)return 1;let b=0;for(const h of G.vc.port)if(h.cat===cat&&h.stake>=0.2)b+=0.03;return 1+Math.min(0.09,b);}
function vcMonthly(){
  if(!G.vc)return;const V=G.vc;
  V.pitch=V.pitch.filter(x=>x.until>G.day);
  if(valuation()>=VC_MIN_VAL){const n=rint(1,3);for(let i=0;i<n&&V.pitch.length<6;i++)V.pitch.push(vcPitch());}
  for(const h of [...V.port]){const age=(G.day-h.since)/30,S2=VC_STAGE[h.st];
    if(h.pend&&h.pend.until<=G.day){h.stake*=0.83;vcLog((LANG_EN?`${h.name} closed a new round; since you didn't invest more, your stake is now ${fx(h.stake*100,1)}%.`:`${h.name} yeni turu kapattı; ek yatırım yapmadığın için payın %${fx(h.stake*100,1)} oldu.`));h.pend=null;}
    const failP=S2.fail*(h.q<1?1.6-h.q:0.5);
    if(Math.random()<failP){V.port=V.port.filter(x=>x!==h);vcLog((LANG_EN?`${h.name} went under. Your ${money(h.cost)} investment is wiped out.`:`${h.name} battı. ${money(h.cost)} yatırım sıfırlandı.`),'bad');news((LANG_EN?`Portfolio company ${h.name} went under.`:`Portföy şirketin ${h.name} battı.`),'bad');continue;}
    h.val*=Math.exp(0.028*Math.log(h.q)+0.002+(CATS[h.cat].dg||0.1)*0.02+rnd(-0.1,0.1));
    if(age>=18&&Math.random()<0.012*h.q){const buyer=pick(liveComps()),price=h.val*rnd(0.9,1.3),cash=price*h.stake;G.cash+=cash;V.real+=cash-h.cost;V.port=V.port.filter(x=>x!==h);
      const mult=cash/Math.max(1,h.cost);if(mult>=10)(G.flags=G.flags||{}).vc10=true;
      vcLog((LANG_EN?`${h.name} was acquired by ${buyer?buyer.name:"a tech giant"} for ${money(price)}. Your share: ${money(cash)} (×${fx(mult,1)}).`:`${h.name}, ${buyer?buyer.name:'bir dev'} tarafından ${money(price)} karşılığında satın alındı. Payına ${money(cash)} düştü (×${fx(mult,1)}).`),mult>=1?'good':'bad');news((LANG_EN?`Portfolio exit: ${h.name} was sold, you made ${money(cash)} (×${fx(mult,1)}).`:`Portföy çıkışı: ${h.name} satıldı, ${money(cash)} kazandın (×${fx(mult,1)}).`),mult>=1?'good':'bad',mult>=3);continue;}
    if(!h.pend&&age-(h.lastR||0)>=12&&Math.random()<0.05){const up=rnd(1.1,1.5)*(h.q>=1?1:0.75);h.val*=up;h.lastR=age;const raise=h.val*0.2;
      h.pend={cost:Math.round(raise*h.stake),until:G.day+30};vcLog((LANG_EN?`${h.name} is raising a new round ${up>=1?"at a valuation ×"+fx(up,2)+" higher":"at a lower valuation"}. Pay ${money(h.pend.cost)} within 30 days to keep your stake.`:`${h.name} ${up>=1?'değerini ×'+fx(up,2)+' artırarak':'düşük değerlemeyle'} yeni tur topluyor. 30 gün içinde ${money(h.pend.cost)} ile payını koruyabilirsin.`),up>=1.2?'good':'');}
  }
}
function vcAcqPrice(h){return Math.round((1-h.stake)*h.val*1.25);}
function vVC(){
  const V=G.vc,ok=valuation()>=VC_MIN_VAL,pv=vcValue();
  const pitches=V.pitch.filter(x=>x.until>G.day).map(x=>{const post=x.pre+x.ask,stake=x.ask/post,ddFee=Math.round(Math.max(20000,x.ask*0.01)*1)/1,fit=myActive(x.cat).length>0;
    return (LANG_EN?`<div class="proj col" style="gap:6px"><div class="row between"><b>${esc(x.name)}</b><span class="chip st-mute">${VC_STAGE[x.st].n}</span></div>
      <div class="small muted">${CATS[x.cat].n} · decide within ${x.until-G.day} days</div>
      <div class="kv"><span>Asking</span><b>${money(x.ask)}</b><span>Pre-money value</span><b>${money(x.pre)}</b><span>Your stake</span><b>${pct(stake,1)}</b>
        <span>Team</span><b>${x.dd?`<span class="pos">${x.team}/10</span> <small class="muted">incelendi</small>`:`~${x.team}/10 <small class="muted">estimated</small>`}</b><span>Market growth</span><b>${Math.round((CATS[x.cat].dg||0.1)*100)}%/yr</b><span>Strategic fit</span><b class="${fit?'pos':'muted'}">${fit?"Yes":"No"}</b></div>
      <div class="row" style="gap:6px">${x.dd?'':`<button class="btn sm" data-act="vcdd" data-id="${x.id}" ${G.cash<ddFee?'disabled':''}>Vet ${money(ddFee)}</button>`}<button class="btn sm primary" data-act="vcinv" data-id="${x.id}" ${G.cash<x.ask*1.5?'disabled':''}>Invest</button><button class="btn sm ghost" data-act="vcpass" data-id="${x.id}">Pass</button></div></div>`:`<div class="proj col" style="gap:6px"><div class="row between"><b>${esc(x.name)}</b><span class="chip st-mute">${VC_STAGE[x.st].n}</span></div>
      <div class="small muted">${CATS[x.cat].n} · ${x.until-G.day} gün içinde karar</div>
      <div class="kv"><span>İstenen</span><b>${money(x.ask)}</b><span>Yatırım öncesi değer</span><b>${money(x.pre)}</b><span>Alacağın pay</span><b>${pct(stake,1)}</b>
        <span>Ekip</span><b>${x.dd?`<span class="pos">${x.team}/10</span> <small class="muted">incelendi</small>`:`~${x.team}/10 <small class="muted">tahmini</small>`}</b><span>Pazar büyümesi</span><b>%${Math.round((CATS[x.cat].dg||0.1)*100)}/yıl</b><span>Stratejik uyum</span><b class="${fit?'pos':'muted'}">${fit?'Var':'Yok'}</b></div>
      <div class="row" style="gap:6px">${x.dd?'':`<button class="btn sm" data-act="vcdd" data-id="${x.id}" ${G.cash<ddFee?'disabled':''}>İncele ${money(ddFee)}</button>`}<button class="btn sm primary" data-act="vcinv" data-id="${x.id}" ${G.cash<x.ask*1.5?'disabled':''}>Yatırım yap</button><button class="btn sm ghost" data-act="vcpass" data-id="${x.id}">Geç</button></div></div>`);}).join('');
  const rows=V.port.map(h=>{const v=h.val*h.stake,mult=v/Math.max(1,h.cost),strat=h.stake>=0.2&&myActive(h.cat).length;
    return (LANG_EN?`<tr><td><b>${esc(h.name)}</b><div class="small muted">${CATS[h.cat].n} · ${VC_STAGE[h.st].n} · ${fmtDate(h.since)}</div></td><td class="r num">${pct(h.stake,1)}</td><td class="r num">${money(h.cost)}</td><td class="r num">${money(v)}</td>
      <td class="r num ${mult>=1?'pos':'neg'}">×${fx(mult,2)}</td><td>${strat?"<span class=\"chip st-ok\">Strategic</span>":''}</td>
      <td class="r"><span class="row" style="gap:4px;justify-content:flex-end;flex-wrap:wrap">${h.pend?`<button class="btn sm primary" data-act="vcfollow" data-id="${h.id}" ${G.cash<h.pend.cost?'disabled':''}>Keep stake ${money(h.pend.cost)}</button>`:''}
        ${h.stake>=0.15?`<button class="btn sm" data-act="vcbuy" data-id="${h.id}" ${G.cash<vcAcqPrice(h)?'disabled':''}>Buy it all ${money(vcAcqPrice(h))}</button>`:''}<button class="btn sm ghost" data-act="vcsell" data-id="${h.id}">Sell stake ${money(v*0.8)}</button></span></td></tr>`:`<tr><td><b>${esc(h.name)}</b><div class="small muted">${CATS[h.cat].n} · ${VC_STAGE[h.st].n} · ${fmtDate(h.since)}</div></td><td class="r num">${pct(h.stake,1)}</td><td class="r num">${money(h.cost)}</td><td class="r num">${money(v)}</td>
      <td class="r num ${mult>=1?'pos':'neg'}">×${fx(mult,2)}</td><td>${strat?'<span class="chip st-ok">Stratejik</span>':''}</td>
      <td class="r"><span class="row" style="gap:4px;justify-content:flex-end;flex-wrap:wrap">${h.pend?`<button class="btn sm primary" data-act="vcfollow" data-id="${h.id}" ${G.cash<h.pend.cost?'disabled':''}>Payını koru ${money(h.pend.cost)}</button>`:''}
        ${h.stake>=0.15?`<button class="btn sm" data-act="vcbuy" data-id="${h.id}" ${G.cash<vcAcqPrice(h)?'disabled':''}>Tamamını al ${money(vcAcqPrice(h))}</button>`:''}<button class="btn sm ghost" data-act="vcsell" data-id="${h.id}">Payını sat ${money(v*0.8)}</button></span></td></tr>`);}).join('');
  const lg=V.log.slice(0,12).map(l=>`<li class="${l.k}"><time>${fmtDate(l.d)}</time><span>${esc(l.t)}</span></li>`).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Corporate venture fund${helpBtn('vc')}</h2><span class="sub">${V.port.length} companies</span></div>
    <div class="kpis"><div class="kpi"><span>Portfolio value</span><b>${money(pv)}</b></div><div class="kpi"><span>Total invested</span><b>${money(V.inv)}</b></div><div class="kpi"><span>Realized gains</span><b class="${V.real>=0?'pos':'neg'}">${money(V.real)}</b></div></div>
    <div class="pb small muted">Invest in startups for a minority stake. Most fail or stall; a few pay off big. Team scores are estimates; pay the vetting fee to get the real number. A 20%+ stake in a startup in your own category adds +3% appeal to your products (up to +9%). With a 15%+ stake you can buy the whole company and take over its team and technology. 80% of portfolio value counts toward your company valuation.</div></section>
  <section class="panel"><div class="ph"><h2>Incoming pitches</h2><span class="sub">Refreshed monthly</span></div>${ok?(pitches?`<div class="pb"><div class="grid3">${pitches}</div></div>`:"<div class=\"empty\">No pitches right now; new ones arrive next month.</div>"):`<div class="empty">Startups will start pitching you once your valuation passes ${money(VC_MIN_VAL)}.</div>`}</section>
  ${rows?`<section class="panel"><div class="ph"><h2>Portfolio</h2></div><div class="tw"><table><thead><tr><th>Company</th><th class="r">Stake</th><th class="r">Invested</th><th class="r">Value</th><th class="r">Multiple</th><th></th><th></th></tr></thead><tbody>${rows}</tbody></table></div></section>`:''}
  ${lg?`<section class="panel"><div class="ph"><h2>Fund news</h2></div><ul class="news">${lg}</ul></section>`:''}`:`<section class="panel"><div class="ph"><h2>Kurumsal girişim fonu${helpBtn('vc')}</h2><span class="sub">${V.port.length} şirket</span></div>
    <div class="kpis"><div class="kpi"><span>Portföy değeri</span><b>${money(pv)}</b></div><div class="kpi"><span>Toplam yatırım</span><b>${money(V.inv)}</b></div><div class="kpi"><span>Gerçekleşen kazanç</span><b class="${V.real>=0?'pos':'neg'}">${money(V.real)}</b></div></div>
    <div class="pb small muted">Girişimlere azınlık hissesiyle yatırım yap. Çoğu batar ya da yerinde sayar, birkaçı büyük kazandırır. Ekip puanı tahminidir; inceleme ücretini ödersen netleşir. Kendi kategorindeki girişimlerde %20+ payın ürünlerine +%3 çekicilik katar (en fazla +%9). %15+ paylı şirketin tamamını alıp ekibini ve teknolojisini devralabilirsin. Portföy değerinin %80'i şirket değerlemene eklenir.</div></section>
  <section class="panel"><div class="ph"><h2>Gelen teklifler</h2><span class="sub">Her ay yenilenir</span></div>${ok?(pitches?`<div class="pb"><div class="grid3">${pitches}</div></div>`:'<div class="empty">Şu an teklif yok; gelecek ay yenileri gelir.</div>'):`<div class="empty">Girişimler, değerlemen ${money(VC_MIN_VAL)}'u geçince sana teklif getirmeye başlar.</div>`}</section>
  ${rows?`<section class="panel"><div class="ph"><h2>Portföy</h2></div><div class="tw"><table><thead><tr><th>Şirket</th><th class="r">Pay</th><th class="r">Yatırım</th><th class="r">Değer</th><th class="r">Çarpan</th><th></th><th></th></tr></thead><tbody>${rows}</tbody></table></div></section>`:''}
  ${lg?`<section class="panel"><div class="ph"><h2>Fon haberleri</h2></div><ul class="news">${lg}</ul></section>`:''}`);
}

