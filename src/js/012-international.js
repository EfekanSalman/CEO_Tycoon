/* ============================== INTERNATIONAL ============================== */
const regFees=()=>REG_ORDER.reduce((a,r)=>a+(G.regions[r].in?REGS[r].month:0),0)*infl();
const regCampCost=r=>Math.max(30000,600000*REGS[r].w)*infl()*(ceoSk('m4')?0.7:1);
function regMonthly(){
  const mk=G.emps.filter(e=>e.role==='mkt'&&!e.leave).reduce((a,e)=>a+e.skill,0);
  for(const r of REG_ORDER){const st=G.regions[r];
    if(st.in)st.aw=clamp(st.aw+(0.04+Math.min(0.06,mk*0.002)+(brOf(r)?Math.min(0.08,0.012*brOf(r).staff.mkt):0))*(1-st.aw),0,1);
    else st.aw=clamp(st.aw*0.97+0.003,0,1);
  }
  G.rl=G.rm||{};G.rm={};G.dutyL=G.dutyM||0;G.dutyM=0;
  const eu=G.rmEuSw||0;G.rmEuSw=0;
  if(G.regions.eu.in&&!has('gdpr')&&eu>20000&&Math.random()<0.12*dpRisk()){
    const fine=eu*2;spend(fine,'other');G.brand=clamp(G.brand-1,0,100);G.regions.eu.aw=clamp(G.regions.eu.aw-0.05,0,1);
    news((LANG_EN?`The European data protection authority fined you ${money(fine)}. Data Protection Compliance research removes this risk.`:`Avrupa veri koruma otoritesi sana ${money(fine)} ceza kesti. Veri Koruma Uyumu araştırması bu riski kaldırır.`),'bad',true);
  }
}
function regionCards(){
  const cats=CAT_ORDER.filter(c=>myActive(c).length);
  const myU=r=>myActive().reduce((a,p)=>a+(p.ru?p.ru[r]||0:0),0);
  const totD=r=>(cats.length?cats:CAT_ORDER).reduce((a,c)=>a+regDemand(c,r),0);
  const allD=REG_ORDER.reduce((a,r)=>a+totD(r),0)||1;
  const bar=(LANG_EN?`<div class="share" role="img" aria-label="Demand by region">${REG_ORDER.map(r=>`<i style="width:${totD(r)/allD*100}%;background:${REG_HUE[r]};opacity:${G.regions[r].in?1:0.35}" title="${REGS[r].n} ${pct(totD(r)/allD,0)}"></i>`).join('')}</div>
    <div class="legend">${REG_ORDER.map(r=>`<span><i class="dot" style="background:${REG_HUE[r]};opacity:${G.regions[r].in?1:0.35}"></i>${G.regions[r].in?'<b>'+REGS[r].n+'</b>':REGS[r].n} ${pct(totD(r)/allD,0)}</span>`).join('')}</div>`:`<div class="share" role="img" aria-label="Bölgelere göre talep">${REG_ORDER.map(r=>`<i style="width:${totD(r)/allD*100}%;background:${REG_HUE[r]};opacity:${G.regions[r].in?1:0.35}" title="${REGS[r].n} ${pct(totD(r)/allD,0)}"></i>`).join('')}</div>
    <div class="legend">${REG_ORDER.map(r=>`<span><i class="dot" style="background:${REG_HUE[r]};opacity:${G.regions[r].in?1:0.35}"></i>${G.regions[r].in?'<b>'+REGS[r].n+'</b>':REGS[r].n} ${pct(totD(r)/allD,0)}</span>`).join('')}</div>`);
  const rl=G.rl||{},rm=G.rm||{};
  const cards=REG_ORDER.map(r=>{const R=REGS[r],st=G.regions[r],cost=R.entry*infl(),cc=regCampCost(r);
    const share=myU(r)/Math.max(1,(cats.length?cats:CAT_ORDER).reduce((a,c)=>a+regDemand(c,r),0));
    const rivals=liveComps().filter(c=>(c.reg||['tr']).includes(r)).length;
    const brandLow=R.minBrand&&G.brand<R.minBrand;
    const rule=r==='eu'?(has('gdpr')?(LANG_EN?"<span class=\"pos\">Data protection compliant</span>":'<span class="pos">Veri koruma uyumu tamam</span>'):(LANG_EN?"<span class=\"neg\">No data protection compliance: software appeal 40% lower, fine risk</span>":'<span class="neg">Veri koruma uyumu yok: yazılım çekiciliği %40 düşük, ceza riski</span>'))
      :r==='asia'?(asiaDuty()?(LANG_EN?"<span class=\"neg\">No factory in region: 15% tariff on hardware</span>":'<span class="neg">Bölgede fabrikan yok: donanıma %15 gümrük</span>'):(LANG_EN?"<span class=\"pos\">Factory in region: no tariff</span>":'<span class="pos">Bölgede fabrikan var: gümrük yok</span>'))
      :r==='na'?(brandLow?(LANG_EN?`<span class="neg">Brand ${fx(G.brand,0)}/20: retailers not interested yet</span>`:`<span class="neg">Marka ${fx(G.brand,0)}/20: perakendeciler henüz ilgilenmiyor</span>`):(LANG_EN?"<span class=\"pos\">Brand threshold reached</span>":'<span class="pos">Marka eşiği aşıldı</span>'))
      :r==='latam'?(LANG_EN?`Currency ${fxDev('latam')>=1?"strong":"weak"} (${fxDev('latam')>=1?'+':'−'}${pct(Math.abs(fxDev('latam')-1),0)}): demand ×${fx(G.latFx||1,2)}`:`Kur ${fxDev('latam')>=1?'güçlü':'zayıf'} (${fxDev('latam')>=1?'+':'−'}${pct(Math.abs(fxDev('latam')-1),0)}): talep ×${fx(G.latFx||1,2)}`):(LANG_EN?"Home market: no fees, full awareness":'Ev pazarı: kira yok, bilinirlik tam');
    const btn=R.home?'':st.in
      ?(LANG_EN?`<div class="row"><button class="btn sm" data-act="regcamp" data-r="${r}" ${G.day-st.camp<30||G.cash<cc?'disabled':''} title="Awareness +15 points">${G.day-st.camp<30?"Campaign running":"Regional campaign "+money(cc)}</button><button class="btn sm ghost" data-act="regout" data-r="${r}">Exit</button></div>`:`<div class="row"><button class="btn sm" data-act="regcamp" data-r="${r}" ${G.day-st.camp<30||G.cash<cc?'disabled':''} title="Bilinirlik +15 puan">${G.day-st.camp<30?'Kampanya sürüyor':'Bölge kampanyası '+money(cc)}</button><button class="btn sm ghost" data-act="regout" data-r="${r}">Çekil</button></div>`)
      :`<button class="btn sm primary" data-act="regin" data-r="${r}" ${G.cash<cost||brandLow?'disabled':''}>${brandLow?(LANG_EN?"Brand too weak":'Marka yetersiz'):(LANG_EN?"Enter market ":'Pazara gir ')+money(cost)}</button>`;
    return (LANG_EN?`<div class="proj" style="border-left:4px solid ${REG_HUE[r]}"><div class="row between"><b>${R.n}</b>${st.in?"<span class=\"chip st-ok\">Active</span>":"<span class=\"chip st-mute\">Not entered</span>"}</div>
      <div class="small muted">${R.d}</div>
      <div class="kv"><span>Demand share</span><b>${pct(totD(r)/allD,0)}</b><span>Your share</span><b>${pct(share,1)}</b><span>Last month's revenue</span><b>${money(rl[r]||0)}</b><span>This month</span><b>${money(rm[r]||0)}</b><span>Price tolerance</span><b>${fx(R.px,2)}×</b><span>Rivals</span><b>${rivals} companies</b>${st.in&&R.month?`<span>Monthly operating</span><b class="neg">${money(R.month*infl())}</b>`:''}</div>
      <div class="row between small"><span>Awareness</span><span class="num">${Math.round(st.aw*100)}</span></div><div class="bar"><i style="width:${st.aw*100}%;background:${REG_HUE[r]}"></i></div>
      <div class="small">${rule}</div>${btn}
      ${BR[r]&&st.in?(brOf(r)?`<div class="row between small" style="border-top:1px solid var(--line);padding-top:8px"><span><b>${BR[r].city} branch</b> · ${BR_LVL[brOf(r).lvl].n} · ${brStaff(brOf(r))} staff</span><button class="btn sm" data-act="branch" data-r="${r}">Go to branch</button></div>`
        :`<div class="row between small" style="border-top:1px solid var(--line);padding-top:8px"><span>No branch</span><button class="btn sm" data-act="bropen" data-r="${r}" ${G.cash<brOpenCost(r)?'disabled':''}>Open ${BR[r].city} branch ${money(brOpenCost(r))}</button></div>`):''}</div>`:`<div class="proj" style="border-left:4px solid ${REG_HUE[r]}"><div class="row between"><b>${R.n}</b>${st.in?'<span class="chip st-ok">Faaliyette</span>':'<span class="chip st-mute">Girilmedi</span>'}</div>
      <div class="small muted">${R.d}</div>
      <div class="kv"><span>Talep payı</span><b>${pct(totD(r)/allD,0)}</b><span>Senin payın</span><b>${pct(share,1)}</b><span>Geçen ay gelir</span><b>${money(rl[r]||0)}</b><span>Bu ay</span><b>${money(rm[r]||0)}</b><span>Fiyat toleransı</span><b>${fx(R.px,2)}×</b><span>Rakip</span><b>${rivals} şirket</b>${st.in&&R.month?`<span>Aylık işletme</span><b class="neg">${money(R.month*infl())}</b>`:''}</div>
      <div class="row between small"><span>Bilinirlik</span><span class="num">${Math.round(st.aw*100)}</span></div><div class="bar"><i style="width:${st.aw*100}%;background:${REG_HUE[r]}"></i></div>
      <div class="small">${rule}</div>${btn}
      ${BR[r]&&st.in?(brOf(r)?`<div class="row between small" style="border-top:1px solid var(--line);padding-top:8px"><span><b>${BR[r].city} şubesi</b> · ${BR_LVL[brOf(r).lvl].n} · ${brStaff(brOf(r))} kişi</span><button class="btn sm" data-act="branch" data-r="${r}">Şubeye git</button></div>`
        :`<div class="row between small" style="border-top:1px solid var(--line);padding-top:8px"><span>Şube yok</span><button class="btn sm" data-act="bropen" data-r="${r}" ${G.cash<brOpenCost(r)?'disabled':''}>${BR[r].city} şubesi aç ${money(brOpenCost(r))}</button></div>`):''}</div>`);}).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Regions${helpBtn('region')}</h2><span class="sub">Active in ${REG_ORDER.filter(r=>G.regions[r].in).length}/5 markets · monthly regional costs ${money(regFees())}</span></div>
    <div class="pb col">${bar}
    <p class="small muted">In regions you haven't entered, software sells online at 25% lower appeal; hardware sells only through importers, at 70% lower appeal. In regions you've entered, awareness grows every month and your brand has full effect. In regions with high price tolerance, the same price looks more affordable.</p>
    <div class="grid3">${cards}</div></div></section>`:`<section class="panel"><div class="ph"><h2>Bölgeler${helpBtn('region')}</h2><span class="sub">${REG_ORDER.filter(r=>G.regions[r].in).length}/5 pazarda faaliyettesin · aylık bölge gideri ${money(regFees())}</span></div>
    <div class="pb col">${bar}
    <p class="small muted">Girmediğin bölgelerde yazılım internetten %25 düşük çekicilikle satılır; donanım yalnızca ithalatçılar üzerinden, %70 düşük çekicilikle satılır. Girdiğin bölgede bilinirlik her ay artar ve markan orada tam etki eder. Fiyat toleransı yüksek bölgelerde aynı fiyat daha uygun görünür.</p>
    <div class="grid3">${cards}</div></div></section>`);
}

