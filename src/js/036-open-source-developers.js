/* ============================== OPEN SOURCE & DEVELOPERS ============================== */
const OSS_G=[(LANG_EN?"Software":'Yazılım'),(LANG_EN?"Infrastructure":'Altyapı'),(LANG_EN?"Security":'Güvenlik'),(LANG_EN?"Operations":'Operasyon')];
const newDev=()=>({devs:0,oss:[],api:null,conf:-999,rel:0,apiRev:0});
const DEVREL=[0,25000,75000,200000];
const ossOk=r=>OSS_G.includes(r.g)&&has(r.id)&&!(G.dev.oss||[]).some(o=>o.rid===r.id);
const ossImp=rid=>{const r=RESD[rid];return clamp(Math.log10(r.cost/10000),0.5,3);};
const devRP=()=>G.dev?Math.sqrt(G.dev.devs)/25:0;
const devBug=()=>G.dev?1/(1+G.dev.devs/50000):1;
const devSW=()=>G.dev?1+Math.min(0.1,G.dev.devs/100000)*(G.dev.api&&G.day>=G.dev.api.ready?1:0.5):1;
const apiOn=()=>!!(G.dev&&G.dev.api&&G.day>=G.dev.api.ready&&myActive().some(p=>p.cat==='saas'||p.cat==='ai'||p.cat==='os'));
const ossCost=()=>(G.dev.oss.length*8000+DEVREL[G.dev.rel||0])*infl();
const confCost=()=>Math.round((400000+G.dev.devs*4)*infl()/1000)*1000;
function devDaily(){const D=G.dev;if(!D)return;const c=ossCost();if(c>0)spend(c/30,'other');
  if(apiOn()){const r=D.devs*0.3*15*infl()/30;G.cash+=r;G.month.rev+=r;D.apiRev=r*30;}else D.apiRev=0;}
function devMonthly(){const D=G.dev;if(!D)return;const bf=1+G.brand/50;
  for(const o of D.oss){const imp=ossImp(o.rid),cap=imp*25000*(1+(D.rel||0)*0.25);o.stars+=Math.max(0,imp*900*bf*(1+(D.rel||0)*0.4)*(1-o.stars/cap));}
  const target=D.oss.reduce((a,o)=>a+o.stars*0.06,0)*(1+(D.rel||0)*0.3)+(apiOn()?2000*bf:0)+(D.rel||0)*400*bf;
  D.devs=Math.max(0,D.devs+(target-D.devs)*0.12);
  if(D.devs>100)G.brand=clamp(G.brand+Math.min(0.5,D.devs/40000),0,100);
  if(D.api&&D.api.ready===G.day)news((LANG_EN?"Your API platform is live! Developers have started building apps on top of your products.":'API platformun açıldı! Geliştiriciler ürünlerinin üzerine uygulama kurmaya başladı.'),'good',true);
}
function vDev2(){
  const D=G.dev,elig=RES.filter(ossOk);
  const proj=D.oss.map(o=>{const r=RESD[o.rid];return (LANG_EN?`<div class="proj col" style="gap:4px"><div class="row between"><b>${r.n}</b><span class="chip st-ok">Open source</span></div><div class="small muted">Since ${fmtDate(o.since)} · ★ ${num(o.stars)}</div></div>`:`<div class="proj col" style="gap:4px"><div class="row between"><b>${r.n}</b><span class="chip st-ok">Açık kaynak</span></div><div class="small muted">${fmtDate(o.since)}'den beri · ★ ${num(o.stars)}</div></div>`);}).join('');
  const el=elig.map(r=>{const cats=PAT_CAT[r.id]||[],pat=G.pats.some(p=>p.src===r.id||p.n===r.n)||G.patPend.some(p=>p.src===r.id);
    return (LANG_EN?`<div class="proj col" style="gap:6px"><b>${r.n}</b><div class="small muted">${r.g} · impact ${'●'.repeat(Math.round(ossImp(r.id)))}</div>
      <div class="small">${cats.length?`Rivals' ${cats.map(c=>CATS[c].n.toLocaleLowerCase(LOC)).join(', ')} tech gets a bit stronger.`:"No direct effect on rivals."}${pat?" <b class=\"neg\">You will lose the patent on this technology.</b>":''}</div>
      <div class="small muted">Upkeep: ${money(8000*infl())}/mo</div><div><button class="btn sm" data-act="ossopen" data-rid="${r.id}">Open-source it</button></div></div>`:`<div class="proj col" style="gap:6px"><b>${r.n}</b><div class="small muted">${r.g} · önem ${'●'.repeat(Math.round(ossImp(r.id)))}</div>
      <div class="small">${cats.length?`Rakiplerin ${cats.map(c=>CATS[c].n.toLocaleLowerCase(LOC)).join(', ')} teknolojisi biraz güçlenir.`:'Rakiplere doğrudan etkisi yok.'}${pat?' <b class="neg">Bu teknolojinin patentini kaybedersin.</b>':''}</div>
      <div class="small muted">Bakım: ${money(8000*infl())}/ay</div><div><button class="btn sm" data-act="ossopen" data-rid="${r.id}">Açık kaynak yap</button></div></div>`);}).join('');
  const cf=confCost(),canConf=G.day-D.conf>=365;
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Developer community${helpBtn('oss')}</h2><span class="sub">Monthly community cost ${money(ossCost())}</span></div>
    <div class="kpis"><div class="kpi"><span>Developers</span><b>${num(D.devs)}</b></div><div class="kpi"><span>Research contribution</span><b>${fx(devRP(),1)} RP/day</b></div><div class="kpi"><span>API revenue</span><b class="${D.apiRev?'pos':''}">${money(D.apiRev||0)}/mo</b></div><div class="kpi"><span>Software appeal</span><b>+${pct(devSW()-1,1)}</b></div></div>
    <div class="pb small muted">As your community grows, it contributes to your research, reduces bugs in your software products (${pct(1-devBug(),0)} fewer bugs), brings in more talented candidates, and grows your brand.</div></section>
  <section class="panel"><div class="ph"><h2>Open-source projects</h2><span class="sub">${D.oss.length} projects</span></div>
    <div class="pb col" style="gap:12px">${proj?`<div class="grid3">${proj}</div>`:''}
    ${el?`<div class="small"><b>Technologies you can open-source</b> <span class="muted">· completed software, infrastructure, security, and operations research</span></div><div class="grid3">${el}</div>`:`<div class="small muted">${proj?"No other technologies to open-source.":"As you complete software, infrastructure, security, or operations research, you can open-source it here."}</div>`}</div></section>
  <section class="panel"><div class="ph"><h2>Platform and events</h2></div><div class="pb"><div class="grid3">
    <div class="proj col" style="gap:6px"><b>API platform</b><div class="small muted">Developers build apps on top of your web service, AI service, or operating system: revenue per developer and appeal for your software products.</div>
      ${D.api?(G.day<D.api.ready?`<span class="chip st-warn">Setting up · ${D.api.ready-G.day} days</span>`:`<span class="chip st-ok">Live</span>${apiOn()?'':" <span class=\"small warn\">To earn revenue you need a web service, AI service, or OS on the market.</span>"}`)
        :`<button class="btn sm primary" data-act="apibuild" ${G.cash<1e6*infl()||!has('fw')?'disabled':''}>Build · ${money(1e6*infl())} · 90 days</button>${has('fw')?'':"<div class=\"small warn\">Requires Modern Software Framework research.</div>"}`}</div>
    <div class="proj col" style="gap:6px"><b>Developer conference</b><div class="small muted">Once a year: community grows 15%, brand +2, your software products are more appealing for 45 days, and the candidate pool refreshes with talented developers.</div>
      <button class="btn sm primary" data-act="devconf" ${!canConf||G.cash<cf?'disabled':''}>${canConf?"Host · "+money(cf):"Next conference in "+(365-(G.day-D.conf))+" days"}</button></div>
    <div class="proj col" style="gap:6px"><b>Developer relations</b><div class="small muted">Docs, sample code, community managers: the community grows faster.</div>
      <div class="row" style="gap:4px;flex-wrap:wrap">${DEVREL.map((v,i)=>`<button class="btn sm ${(D.rel||0)===i?'primary':'ghost'}" data-act="devrel" data-i="${i}">${v?money(v*infl())+'/ay':"No"}</button>`).join('')}</div></div>
  </div></div></section>`:`<section class="panel"><div class="ph"><h2>Geliştirici topluluğu${helpBtn('oss')}</h2><span class="sub">Aylık topluluk gideri ${money(ossCost())}</span></div>
    <div class="kpis"><div class="kpi"><span>Geliştirici</span><b>${num(D.devs)}</b></div><div class="kpi"><span>Araştırma katkısı</span><b>${fx(devRP(),1)} AP/gün</b></div><div class="kpi"><span>API geliri</span><b class="${D.apiRev?'pos':''}">${money(D.apiRev||0)}/ay</b></div><div class="kpi"><span>Yazılım çekiciliği</span><b>+${pct(devSW()-1,1)}</b></div></div>
    <div class="pb small muted">Topluluğun büyüdükçe araştırmana katkı verir, yazılım ürünlerindeki hataları azaltır (${pct(1-devBug(),0)} daha az hata), daha yetenekli adaylar getirir ve markanı büyütür.</div></section>
  <section class="panel"><div class="ph"><h2>Açık kaynak projeler</h2><span class="sub">${D.oss.length} proje</span></div>
    <div class="pb col" style="gap:12px">${proj?`<div class="grid3">${proj}</div>`:''}
    ${el?`<div class="small"><b>Açık kaynak yapılabilecek teknolojiler</b> <span class="muted">· tamamladığın yazılım, altyapı, güvenlik ve operasyon araştırmaları</span></div><div class="grid3">${el}</div>`:`<div class="small muted">${proj?'Açık kaynak yapılabilecek başka teknoloji yok.':'Yazılım, altyapı, güvenlik ya da operasyon araştırması tamamladıkça burada açık kaynak yapabilirsin.'}</div>`}</div></section>
  <section class="panel"><div class="ph"><h2>Platform ve etkinlikler</h2></div><div class="pb"><div class="grid3">
    <div class="proj col" style="gap:6px"><b>API platformu</b><div class="small muted">Geliştiriciler web servisin, yapay zekâ hizmetin ya da işletim sisteminin üzerine uygulama kurar: geliştirici başına gelir ve yazılım ürünlerine çekicilik.</div>
      ${D.api?(G.day<D.api.ready?`<span class="chip st-warn">Kuruluyor · ${D.api.ready-G.day} gün</span>`:`<span class="chip st-ok">Açık</span>${apiOn()?'':' <span class="small warn">Gelir için piyasada web servisi, yapay zekâ hizmeti ya da OS olmalı.</span>'}`)
        :`<button class="btn sm primary" data-act="apibuild" ${G.cash<1e6*infl()||!has('fw')?'disabled':''}>Kur · ${money(1e6*infl())} · 90 gün</button>${has('fw')?'':'<div class="small warn">Modern Yazılım Çatısı araştırması gerekir.</div>'}`}</div>
    <div class="proj col" style="gap:6px"><b>Geliştirici konferansı</b><div class="small muted">Yılda bir: topluluk %15 büyür, marka +2, yazılım ürünlerin 45 gün daha çekici olur ve aday listesi yetenekli geliştiricilerle yenilenir.</div>
      <button class="btn sm primary" data-act="devconf" ${!canConf||G.cash<cf?'disabled':''}>${canConf?'Düzenle · '+money(cf):'Sonraki konferans '+(365-(G.day-D.conf))+' gün sonra'}</button></div>
    <div class="proj col" style="gap:6px"><b>Geliştirici ilişkileri</b><div class="small muted">Belgeler, örnek kodlar, topluluk yöneticileri: topluluk daha hızlı büyür.</div>
      <div class="row" style="gap:4px;flex-wrap:wrap">${DEVREL.map((v,i)=>`<button class="btn sm ${(D.rel||0)===i?'primary':'ghost'}" data-act="devrel" data-i="${i}">${v?money(v*infl())+'/ay':'Yok'}</button>`).join('')}</div></div>
  </div></div></section>`);
}




