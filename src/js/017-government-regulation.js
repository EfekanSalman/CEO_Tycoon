/* ============================== GOVERNMENT & REGULATION ============================== */
const newGov=()=>({tax:0.15,inc:{},regs:{},atWatch:{},at:[],ban:null,banLic:null,lastTax:0,lastReb:0,lastDst:0});
const INC={
  rnd:{n:(LANG_EN?"R&D Center certificate":'Ar-Ge Merkezi belgesi'),reqT:(LANG_EN?"At least 5 researchers":'En az 5 araştırmacı'),req:()=>G.emps.filter(e=>e.role==='res').length>=5,fx:(LANG_EN?"Research cost −25%, corporate tax −5 points":'Araştırma maliyeti −%25, kurumlar vergisi −5 puan')},
  fab:{n:(LANG_EN?"Investment incentive certificate":'Yatırım teşvik belgesi'),reqT:(LANG_EN?"A factory in Turkey":"Türkiye'de bir fabrika"),req:()=>G.factories.some(f=>f.region==='turkiye'),fx:(LANG_EN?"Factory maintenance costs −25%":'Fabrika bakım giderleri −%25')},
  jobs:{n:(LANG_EN?"Employment incentive":'İstihdam teşviki'),reqT:(LANG_EN?"At least 40 employees":'En az 40 çalışan'),req:()=>G.emps.length>=40,fx:(LANG_EN?"Payroll costs −4%":'Maaş giderleri −%4')},
  exp:{n:(LANG_EN?"Export support":'İhracat desteği'),reqT:(LANG_EN?"Active in at least 2 foreign markets with 60% of revenue from abroad":"En az 2 yabancı pazarda faaliyet ve gelirin %60'ı yurt dışından"),req:()=>{const rl=G.rl||{},t=REG_ORDER.reduce((a,r)=>a+(rl[r]||0),0);return REG_ORDER.filter(r=>r!=='tr'&&G.regions[r].in).length>=2&&t>0&&(t-(rl.tr||0))/t>=0.6;},fx:(LANG_EN?"Monthly support equal to 2% of foreign revenue":"Yurt dışı gelirin %2'si kadar aylık destek")},
};
const REGL={
  dst:{n:(LANG_EN?"European digital services tax":'Avrupa dijital hizmet vergisi'),d:(LANG_EN?"3% of your software revenue in Europe is withheld as tax every month.":"Avrupa'daki yazılım gelirinin %3'ü her ay vergi olarak kesilir.")},
  loc:{n:(LANG_EN?"Data localization law":'Veri yerelleştirme yasası'),d:r=>(LANG_EN?`In ${REGS[r].n}, user data must stay in the region: without a branch or data center there, your software's appeal drops 30%.`:`${REGS[r].n}'da kullanıcı verisi bölgede tutulmalı: orada şuben ya da veri merkezin yoksa yazılımlarının çekiciliği %30 düşer.`)},
  tariff:{n:(LANG_EN?"US hardware tariff":'ABD donanım gümrüğü'),d:(LANG_EN?"Hardware sold in North America faces a tariff of 10% of unit cost. A factory in Mexico makes you exempt.":"Kuzey Amerika'da satılan donanıma birim maliyetin %10'u kadar gümrük. Meksika'da fabrikan varsa muafsın.")},
};
const incOk=k=>!!(G.gov&&G.gov.inc[k]&&G.gov.inc[k].st==='ok');
const regOn=k=>!!(G.gov&&G.gov.regs[k]&&G.gov.regs[k].until>G.day);
const banOn=()=>!!(G.gov&&G.gov.ban&&G.gov.ban.until>G.day);
const taxRate=()=>G.gov?clamp(G.gov.tax-(incOk('rnd')?0.05:0),0.05,0.4):0;
function govPreClose(){
  const g=G.gov,m=G.month;if(!g)return;g.lastReb=0;g.lastDst=0;
  if(incOk('exp')){const rm=G.rm||{},tot=REG_ORDER.reduce((a,r)=>a+(rm[r]||0),0),reb=(tot-(rm.tr||0))*0.02;if(reb>0){G.cash+=reb;m.rev+=reb;g.lastReb=reb;}}
  if(regOn('dst')){const t=(G.rmEuSw||0)*0.03;if(t>0){spend(t,'other');g.lastDst=t;}}
  const opex=m.supply+m.prod+m.salary+m.rent+m.infra+m.fact+m.interest+m.other,pre=m.rev-opex;
  if(pre<0)g.lossCF=(g.lossCF||0)-pre;
  let base=Math.max(0,pre);const off=Math.min(base,g.lossCF||0);base-=off;g.lossCF=(g.lossCF||0)-off;
  const tax=base*taxRate()*(m.rev<500000*infl()?0.5:1);g.lastTax=tax;if(tax>0)spend(tax,'other');
}
function govMonthly(){
  const g=G.gov;if(!g)return;
  for(const k in g.inc){const st=g.inc[k];
    if(st.st==='pend'&&G.day>=st.due){if(INC[k].req()){st.st='ok';news((LANG_EN?`Government incentive approved: ${INC[k].n}. ${INC[k].fx}.`:`Devlet teşviki onaylandı: ${INC[k].n}. ${INC[k].fx}.`),'good',true);}else{delete g.inc[k];news((LANG_EN?`Your ${INC[k].n} application was rejected: you no longer meet the requirement (${INC[k].reqT}).`:`${INC[k].n} başvurun reddedildi: şartı artık karşılamıyorsun (${INC[k].reqT}).`),'bad');}}
    else if(st.st==='ok'&&!INC[k].req()){delete g.inc[k];news((LANG_EN?`${INC[k].n} canceled: requirement no longer met (${INC[k].reqT}).`:`${INC[k].n} iptal edildi: şart artık sağlanmıyor (${INC[k].reqT}).`),'bad',true);}}
  if(g.banLic&&!g.banLic.ok&&G.day>=g.banLic.due){if(Math.random()<0.6){g.banLic.ok=true;news((LANG_EN?"Export license approved! You can sell your advanced processors in the banned region again.":'İhracat lisansı onaylandı! İleri işlemcilerini yasaklı bölgeye yeniden satabilirsin.'),'good',true);}else{g.banLic=null;news((LANG_EN?"Your export license application was rejected. You can reapply.":'İhracat lisansı başvurun reddedildi. Tekrar başvurabilirsin.'),'bad',true);}}
  if(g.ban&&g.ban.until<=G.day){news((LANG_EN?`Chip export ban on ${REGS[g.ban.r].n} lifted.`:`${REGS[g.ban.r].n}'ya çip ihracat yasağı kalktı.`),'good',true);g.ban=null;g.banLic=null;}
  for(const k in g.regs)if(g.regs[k].until<=G.day){news((LANG_EN?`Regulation expired: ${REGL[k].n}.`:`Düzenleme sona erdi: ${REGL[k].n}.`),'good');delete g.regs[k];}
  /* antitrust */
  for(const a of [...g.at]){if(a.mode==='court')spend(60000*infl(),'other');if(G.day>=a.end)resolveAT(a);}
  for(const cat of CAT_ORDER){const sh=myActive(cat).reduce((a,p)=>a+p.share,0);g.atWatch[cat]=sh>=0.45?(g.atWatch[cat]||0)+1:0;
    if(g.atWatch[cat]>=3&&!g.at.some(x=>x.cat===cat)&&G.day>=(g.atCool||0)&&!G.pending){g.atCool=G.day+365;triggerChoice('antitrust',{cat,sh});break;}}
  for(const c of liveComps())for(const cat of c.focus){const sh=G.products.filter(p=>p.active&&p.owner===c.id&&p.cat===cat).reduce((a,p)=>a+p.share,0);
    if(sh>=0.6&&Math.random()<0.02){const fine=Math.max(0,c.cash)*0.05;c.cash-=fine;for(const p of G.products)if(p.active&&p.owner===c.id&&p.cat===cat)p.hype={m:0.85,until:G.day+120};news((LANG_EN?`The Competition Authority fined ${c.name} ${money(fine)} for its dominant position in the ${CATS[cat].n.toLocaleLowerCase(LOC)} market.`:`Rekabet Kurumu, ${c.name}'a ${CATS[cat].n.toLocaleLowerCase(LOC)} pazarındaki hakim durumu nedeniyle ${money(fine)} ceza verdi.`),'mkt',true);}}
  /* policy changes */
  if(G.day>365&&Math.random()<0.05){
    const pool=['taxUp','taxDown'];if(!regOn('dst'))pool.push('dst');if(!regOn('loc'))pool.push('loc');if(!regOn('tariff'))pool.push('tariff');if(!banOn()&&G.day>730)pool.push('ban','ban');
    const k=pick(pool),dur=rint(12,30)*30;
    if(k==='taxUp'||k==='taxDown'){const old=g.tax;g.tax=clamp(g.tax+(k==='taxUp'?1:-1)*pick([0.02,0.03,0.05]),0.1,0.3);if(g.tax!==old)news((LANG_EN?`New tax rule: corporate tax ${g.tax>old?"rose":"fell"} from ${Math.round(old*100)}% to ${Math.round(g.tax*100)}%.`:`Yeni vergi düzenlemesi: kurumlar vergisi %${Math.round(old*100)}'den %${Math.round(g.tax*100)}'e ${g.tax>old?'yükseldi':'düştü'}.`),g.tax>old?'bad':'good',true);}
    else if(k==='ban'){const r=pick(['asia','na']);g.ban={r,until:G.day+rint(6,12)*30,node:'14'};g.banLic=null;for(const c of liveComps())c.banOk=Math.random()<0.5;
      news((LANG_EN?`Chip wars: exports of 14nm and more advanced processors to ${REGS[r].n} are banned! You can apply for an export license (Finance → Government & regulation).`:`Çip savaşları: ${REGS[r].n}'ya 14nm ve daha ileri işlemcilerin ihracatı yasaklandı! İhracat lisansı başvurusu yapabilirsin (Finans → Devlet ve regülasyon).`),'bad',true);}
    else{g.regs[k]={until:G.day+dur};if(k==='loc')g.regs.loc.r=pick(['eu','asia','latam']);
      news((LANG_EN?`New regulation: ${REGL[k].n}. ${typeof REGL[k].d==='function'?REGL[k].d(g.regs.loc.r):REGL[k].d}`:`Yeni düzenleme: ${REGL[k].n}. ${typeof REGL[k].d==='function'?REGL[k].d(g.regs.loc.r):REGL[k].d}`),'bad',true);}
  }
}
function resolveAT(a){
  const g=G.gov;g.at=g.at.filter(x=>x!==a);const rev=catRev('P',a.cat)*12;
  const lock=()=>{for(const p of G.products)if(p.owner==='P'&&p.cat===a.cat&&p.active)p.priceLock=G.day+365;};
  tl('law',(LANG_EN?`Competition investigation concluded (${CATS[a.cat].n})`:`Rekabet soruşturması sonuçlandı (${CATS[a.cat].n})`));
  if(a.mode==='coop'){const fine=Math.max(rev*0.05,250000*infl());spend(fine,'other');lock();news((LANG_EN?`Competition investigation concluded: ${money(fine)} administrative fine and a 12-month price-hike ban on your ${CATS[a.cat].n.toLocaleLowerCase(LOC)} products.`:`Rekabet soruşturması sonuçlandı: ${money(fine)} idari para cezası ve ${CATS[a.cat].n.toLocaleLowerCase(LOC)} ürünlerine 12 ay zam yasağı.`),'bad',true);}
  else if(Math.random()<0.45){G.brand=clamp(G.brand+1,0,100);news((LANG_EN?`The court cleared you in the competition case! Your share of the ${CATS[a.cat].n} market was found legitimate.`:`Mahkeme rekabet davasında seni akladı! ${CATS[a.cat].n} pazarındaki payın meşru bulundu.`),'good',true);}
  else{const fine=Math.max(rev*0.1,500000*infl());spend(fine,'other');lock();G.brand=clamp(G.brand-3,0,100);news((LANG_EN?`You lost the competition case: ${money(fine)} fine, a 12-month price-hike ban and reputation damage.`:`Rekabet davasını kaybettin: ${money(fine)} ceza, 12 ay zam yasağı ve itibar kaybı.`),'bad',true);}
}
const ANTITRUST={id:'antitrust',w:0,choice:true,cond:()=>false,
  view:d=>{const rev=catRev('P',d.cat)*12;return {t:(LANG_EN?"Competition investigation":'Rekabet soruşturması'),b:(LANG_EN?`The Competition Authority is examining whether you abused a dominant position with your ${Math.round(d.sh*100)}% share of the ${CATS[d.cat].n.toLocaleLowerCase(LOC)} market. Your annual revenue in this market is ~${money(rev)}.`:`Rekabet Kurumu, ${CATS[d.cat].n.toLocaleLowerCase(LOC)} pazarındaki %${Math.round(d.sh*100)} payın nedeniyle hakim durumunu kötüye kullanıp kullanmadığını inceliyor. Yıllık bu pazardaki ciron ~${money(rev)}.`),
    o:[{t:(LANG_EN?"Cooperate":'İşbirliği yap'),d:(LANG_EN?`Takes 6 months. ~${money(Math.max(rev*0.05,250000*infl()))} fine and a 12-month price-hike ban.`:`6 ay sürer. ~${money(Math.max(rev*0.05,250000*infl()))} ceza ve 12 ay zam yasağı.`)},
      {t:(LANG_EN?"Offer voluntary commitments":'Gönüllü taahhüt ver'),d:(LANG_EN?"Cut your prices 10% now and don't raise them for 12 months. No fine; the investigation closes.":'Fiyatlarını hemen %10 indir ve 12 ay zam yapma. Ceza yok, soruşturma kapanır.')},
      {t:(LANG_EN?`Defend in court (${money(60000*infl())}/mo)`:`Mahkemede savun (${money(60000*infl())}/ay)`),d:(LANG_EN?`Takes 6–9 months. 45% chance you're cleared; if you lose, ~${money(Math.max(rev*0.1,500000*infl()))} fine, a price-hike ban and brand −3.`:`6–9 ay sürer. %45 aklanırsın; kaybedersen ~${money(Math.max(rev*0.1,500000*infl()))} ceza, zam yasağı ve marka −3.`)}]};},
  pick(d,i){const g=G.gov;
    if(i===1){for(const p of G.products)if(p.owner==='P'&&p.cat===d.cat&&p.active&&p.cat!=='app'){p.price=roundP(p.cat,p.price*0.9);p.priceLock=G.day+365;}news((LANG_EN?`Commitments given to the Competition Authority: ${CATS[d.cat].n.toLocaleLowerCase(LOC)} prices cut 10%, investigation closed.`:`Rekabet Kurumu'na taahhüt verildi: ${CATS[d.cat].n.toLocaleLowerCase(LOC)} fiyatları %10 indirildi, soruşturma kapandı.`),'mkt',true);}
    else{g.at.push({cat:d.cat,mode:i===0?'coop':'court',end:G.day+(i===0?180:rint(180,270))});news((LANG_EN?`Competition investigation started (${i===0?"cooperation":'mahkeme'}).`:`Rekabet soruşturması başladı (${i===0?'işbirliği':'mahkeme'}).`),'mkt',true);}}};
EVENTS.push(ANTITRUST);EVD.antitrust=ANTITRUST;
function vGov(){
  const g=G.gov;if(!g)return '';
  const shares=CAT_ORDER.filter(c=>myActive(c).length).map(cat=>{const sh=myActive(cat).reduce((a,p)=>a+p.share,0),w=g.atWatch[cat]||0;
    return (LANG_EN?`<div class="col" style="gap:4px"><div class="row between small"><b>${CATS[cat].n}</b><span class="${sh>=0.45?'neg':sh>=0.35?'warn':'muted'}">${Math.round(sh*100)}%${w?` · ${w}/3 months over threshold`:''}</span></div>
      <div class="bar" style="position:relative"><i style="width:${Math.min(100,sh*100)}%;background:${sh>=0.45?'var(--bad)':sh>=0.35?'var(--warn)':'var(--ok)'}"></i><span style="position:absolute;left:45%;top:-3px;bottom:-3px;width:2px;background:var(--ink)"></span></div></div>`:`<div class="col" style="gap:4px"><div class="row between small"><b>${CATS[cat].n}</b><span class="${sh>=0.45?'neg':sh>=0.35?'warn':'muted'}">%${Math.round(sh*100)}${w?` · ${w}/3 ay eşikte`:''}</span></div>
      <div class="bar" style="position:relative"><i style="width:${Math.min(100,sh*100)}%;background:${sh>=0.45?'var(--bad)':sh>=0.35?'var(--warn)':'var(--ok)'}"></i><span style="position:absolute;left:45%;top:-3px;bottom:-3px;width:2px;background:var(--ink)"></span></div></div>`);}).join('');
  const incs=Object.entries(INC).map(([k,x])=>{const st=g.inc[k],ok=x.req();
    return (LANG_EN?`<div class="proj"><div class="row between"><b>${x.n}</b>${st?`<span class="chip ${st.st==='ok'?'st-ok':'st-warn'}">${st.st==='ok'?"Active":"Under review"}</span>`:''}</div>
      <div class="small">${x.fx}</div><div class="small ${ok?'pos':'muted'}">Requirement: ${x.reqT} ${ok?'✓':''}</div>
      ${st?(st.st==='pend'?`<div class="small muted">Decision ${fmtDate(st.due)}</div>`:''):`<button class="btn sm ${ok?'primary':''}" data-act="incapply" data-k="${k}" ${ok?'':'disabled'}>Apply</button>`}</div>`:`<div class="proj"><div class="row between"><b>${x.n}</b>${st?`<span class="chip ${st.st==='ok'?'st-ok':'st-warn'}">${st.st==='ok'?'Aktif':'İnceleniyor'}</span>`:''}</div>
      <div class="small">${x.fx}</div><div class="small ${ok?'pos':'muted'}">Şart: ${x.reqT} ${ok?'✓':''}</div>
      ${st?(st.st==='pend'?`<div class="small muted">Karar ${fmtDate(st.due)}</div>`:''):`<button class="btn sm ${ok?'primary':''}" data-act="incapply" data-k="${k}" ${ok?'':'disabled'}>Başvur</button>`}</div>`);}).join('');
  const regs=[];
  if(banOn()){const b=g.ban,lic=g.banLic;regs.push((LANG_EN?`<li><span class="chip st-bad">Export ban</span><span>Sales of 14nm and more advanced processors to ${REGS[b.r].n} are banned (until ${fmtDate(b.until)}). ${lic?(lic.ok?"<b class=\"pos\">You have a license; you're exempt.</b>":`Your license application is under review (${fmtDate(lic.due)}).`):''}</span>${lic?'':`<button class="btn sm" data-act="banlic">Apply for license ${money(250000*infl())}</button>`}</li>`:`<li><span class="chip st-bad">İhracat yasağı</span><span>${REGS[b.r].n}'ya 14nm ve ileri işlemci satışı yasak (${fmtDate(b.until)}'e kadar). ${lic?(lic.ok?'<b class="pos">Lisansın var, muafsın.</b>':`Lisans başvurun inceleniyor (${fmtDate(lic.due)}).`):''}</span>${lic?'':`<button class="btn sm" data-act="banlic">Lisans başvurusu ${money(250000*infl())}</button>`}</li>`));}
  for(const k in g.regs)if(regOn(k))regs.push((LANG_EN?`<li><span class="chip st-warn">${REGL[k].n}</span><span>${typeof REGL[k].d==='function'?REGL[k].d(g.regs[k].r):REGL[k].d} Until ${fmtDate(g.regs[k].until)}.</span></li>`:`<li><span class="chip st-warn">${REGL[k].n}</span><span>${typeof REGL[k].d==='function'?REGL[k].d(g.regs[k].r):REGL[k].d} ${fmtDate(g.regs[k].until)}'e kadar.</span></li>`));
  for(const a of g.at)regs.push((LANG_EN?`<li><span class="chip st-bad">Competition investigation</span><span>${CATS[a.cat].n} · ${a.mode==='coop'?"cooperation":'mahkeme'} · decision ${fmtDate(a.end)}</span></li>`:`<li><span class="chip st-bad">Rekabet soruşturması</span><span>${CATS[a.cat].n} · ${a.mode==='coop'?'işbirliği':'mahkeme'} · karar ${fmtDate(a.end)}</span></li>`));
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Government & regulation</h2><span class="sub">corporate tax ${Math.round(taxRate()*100)}%</span></div>
    <div class="kpis" style="border-top:0"><div class="kpi"><span>Tax rate</span><b>${Math.round(taxRate()*100)}%</b></div><div class="kpi"><span>Last month's tax</span><b class="${g.lastTax>0?'neg':''}">${money(g.lastTax||0)}</b></div><div class="kpi"><span>Digital services tax</span><b>${money(g.lastDst||0)}</b></div><div class="kpi"><span>Export support</span><b class="pos">${money(g.lastReb||0)}</b></div></div>
    <div class="pb col">
      <div class="small"><b>Regulations in effect</b></div>${regs.length?`<ul class="alerts">${regs.join('')}</ul>`:"<div class=\"small muted\">No special regulations currently affect you.</div>"}
      <div class="small"><b>Competition Authority radar</b> <span class="muted">· an investigation opens if your share of a market exceeds 45% for 3 months in a row</span></div>
      ${shares?`<div class="grid3">${shares}</div>`:"<div class=\"small muted\">You have no products on the market.</div>"}
      <div class="small"><b>Incentives</b> <span class="muted">· apply if you meet the requirement; a decision comes in 90 days; the incentive is canceled if you stop meeting it</span></div>
      <div class="grid">${incs}</div></div></section>`:`<section class="panel"><div class="ph"><h2>Devlet ve regülasyon</h2><span class="sub">kurumlar vergisi %${Math.round(taxRate()*100)}</span></div>
    <div class="kpis" style="border-top:0"><div class="kpi"><span>Vergi oranı</span><b>%${Math.round(taxRate()*100)}</b></div><div class="kpi"><span>Geçen ay vergi</span><b class="${g.lastTax>0?'neg':''}">${money(g.lastTax||0)}</b></div><div class="kpi"><span>Dijital hizmet vergisi</span><b>${money(g.lastDst||0)}</b></div><div class="kpi"><span>İhracat desteği</span><b class="pos">${money(g.lastReb||0)}</b></div></div>
    <div class="pb col">
      <div class="small"><b>Yürürlükteki düzenlemeler</b></div>${regs.length?`<ul class="alerts">${regs.join('')}</ul>`:'<div class="small muted">Şu an seni etkileyen özel bir düzenleme yok.</div>'}
      <div class="small"><b>Rekabet Kurumu radarı</b> <span class="muted">· bir pazarda payın 3 ay üst üste %45'i aşarsa soruşturma açılır</span></div>
      ${shares?`<div class="grid3">${shares}</div>`:'<div class="small muted">Piyasada ürünün yok.</div>'}
      <div class="small"><b>Teşvikler</b> <span class="muted">· şartı sağlıyorsan başvur, 90 günde karar çıkar; şart bozulursa teşvik iptal olur</span></div>
      <div class="grid">${incs}</div></div></section>`);
}


