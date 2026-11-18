/* ============================== RIVAL CEOS ============================== */
const PERS={
  viz:{n:(LANG_EN?"Visionary":'Vizyoner'),c:'st-ok',d:(LANG_EN?"Thinks big, praises innovation, rarely picks fights. Open to joint R&D.":'Büyük düşünür, yeniliği över, kavgaya pek girmez. Ortak Ar-Ge\'ye açıktır.'),dinner:10,feud:0.5,part:1.3,grudge:1,aggr:0,
    jab:[(LANG_EN?"\"They build today; we build tomorrow.\"":'"Onlar bugünü yapıyor, biz yarını."'),(LANG_EN?"\"I respect our rivals, but their imagination is limited.\"":'"Rakiplerimize saygım var ama hayal güçleri sınırlı."')],praise:(LANG_EN?"\"Theirs is the boldest product I've seen this year.\"":'"Bu yıl gördüğüm en cesur ürün onlarınki."')},
  kav:{n:(LANG_EN?"Combative":'Kavgacı'),c:'st-bad',d:(LANG_EN?"Loves sparring in the press, starts price wars, holds grudges easily. Dinner invites rarely work.":'Basında atışmayı sever, fiyat savaşı açar, kolay kin tutar. Yemek davetleri pek işe yaramaz.'),dinner:3,feud:2.2,part:0.4,grudge:1.4,aggr:0.15,
    jab:[(LANG_EN?"\"Their products are toys; serious customers choose us.\"":'"Ürünleri oyuncak; ciddi müşteri bizi seçer."'),(LANG_EN?"\"Garage amateurs. In a year, nobody will remember them.\"":'"Garajdan çıkmış amatörler. Bir yıl sonra kimse hatırlamayacak."'),(LANG_EN?"\"A copy-paste company.\"":'"Kopyala-yapıştır şirketi."')],praise:(LANG_EN?"\"Not bad. But we're better.\"":'"Fena değiller. Ama biz daha iyiyiz."')},
  muh:{n:(LANG_EN?"Conservative":'Muhafazakâr'),c:'st-mute',d:(LANG_EN?"Cautious, slow to trust, but slow to forgive too. Likes corporate partnerships.":'Temkinli, yavaş güvenir ama kini de uzun sürer. Kurumsal ortaklıkları sever.'),dinner:6,feud:0.8,part:0.9,grudge:2,aggr:-0.05,
    jab:[(LANG_EN?"\"This industry takes patience; some people don't know that.\"":'"Sektörde sabır gerekir; bazıları bunu bilmiyor."'),(LANG_EN?"\"Those who rise fast fall fast.\"":'"Hızlı büyüyen hızlı düşer."')],praise:(LANG_EN?"\"They take their work seriously, and I appreciate that.\"":'"İşlerini ciddiye alıyorlar, takdir ediyorum."')},
  dip:{n:(LANG_EN?"Diplomat":'Diplomat'),c:'st-ok',d:(LANG_EN?"Conciliatory, offers partnerships, forgives quickly. Avoids fights.":'Uzlaşmacı, ortaklık teklif eder, çabuk affeder. Kavgaya girmez.'),dinner:15,feud:0.3,part:1.6,grudge:0.6,aggr:-0.1,
    jab:[(LANG_EN?"\"The industry would be better if everyone minded their own business.\"":'"Herkes kendi işine baksa sektör daha güzel olur."')],praise:(LANG_EN?"\"We'd love to work with them; they're growing the ecosystem.\"":'"Onlarla birlikte çalışmak isteriz; ekosistemi büyütüyorlar."')},
  fir:{n:(LANG_EN?"Opportunist":'Fırsatçı'),c:'st-warn',d:(LANG_EN?"Partners up if it pays; otherwise poaches your staff and copies your products.":'Kazançlıysa ortak olur, değilse çalışanlarını ayartır ve ürünlerini kopyalar.'),dinner:8,feud:1,part:1,grudge:1,aggr:0.1,poach:1.6,
    jab:[(LANG_EN?"\"We already do their good ideas better.\"":'"İyi fikirlerini zaten biz daha iyi yapıyoruz."'),(LANG_EN?"\"Their employees keep applying to us.\"":'"Çalışanları bize başvurmaya devam ediyor."')],praise:(LANG_EN?"\"They do good work. Maybe someday we'll build something together.\"":'"İyi iş çıkarıyorlar. Belki bir gün birlikte bir şeyler yaparız."')},
  giz:{n:(LANG_EN?"Mysterious":'Gizemli'),c:'st-mute',d:(LANG_EN?"Rarely seen in public; unpredictable.":'Ortaya pek çıkmaz, ne yapacağı belli olmaz.'),dinner:7,feud:0.7,part:0.8,grudge:1,aggr:0,
    jab:[(LANG_EN?"\"…\" (Even a one-word post stirred up the industry.)":'"…" (Tek kelimelik bir paylaşım bile sektörü karıştırdı.)')],praise:(LANG_EN?"\"Interesting.\" (Short, but the whole industry talked about it.)":'"İlginç." (Kısa ama sektörde çok konuşuldu.)')},
};
const PERS_K=Object.keys(PERS);
function newCeo(c){const p=pick(PERS_K);return {name:pick(FIRST)+' '+pick(LAST),age:rint(34,62),p,since:G?G.day:0,din:-999,jab:-999};}
function ceoOf(c){if(!c.ceo){c.ceo=newCeo(c);c.aggr=clamp((c.aggr||0.4)+PERS[c.ceo.p].aggr,0.05,0.95);}return c.ceo;}
const relLbl=r=>r>=80?[(LANG_EN?"Ally":'Müttefik'),'st-ok']:r>=30?[(LANG_EN?"Friendly":'Dostane'),'st-ok']:r<=-80?[(LANG_EN?"Archenemy":'Ezeli düşman'),'st-bad']:r<=-30?[(LANG_EN?"Enemy":'Düşman'),'st-bad']:r<0?[(LANG_EN?"Cold":'Soğuk'),'st-warn']:[(LANG_EN?"Neutral":'Nötr'),'st-mute'];
const ceoAdd=(c,d)=>{c.rel=clamp(relOf(c)+d,-100,100);};
const ceoPact=c=>(G.ceoP||[]).some(p=>p.cid===c.id&&p.k==='peace'&&p.until>G.day);
const ceoRD=()=>(G.ceoP||[]).some(p=>p.k==='rd'&&p.until>G.day&&comp(p.cid)&&!comp(p.cid).dead);
function ceoMktR(r){return (G.ceoP||[]).some(p=>p.k==='mkt'&&p.until>G.day&&comp(p.cid)&&(comp(p.cid).reg||['tr']).includes(r))?1.03:1;}
const ceoShare=c=>c.focus.reduce((a,f)=>a+myActive(f).reduce((x,p)=>x+p.share,0),0);
const PART={rd:{n:(LANG_EN?"Joint R&D":'Ortak Ar-Ge'),d:(LANG_EN?"For 6 months your research is 15% faster; their tech gets a bit stronger too.":'6 ay boyunca araştırman %15 hızlanır; onların teknolojisi de biraz güçlenir.'),m:6,cost:250000},
  mkt:{n:(LANG_EN?"Co-marketing":'Ortak pazarlama'),d:(LANG_EN?"For 6 months your brand grows every month, and your products are 3% more appealing in their regions.":'6 ay boyunca markan her ay büyür, onların olduğu bölgelerde ürünlerin %3 daha çekici.'),m:6,cost:150000},
  peace:{n:(LANG_EN?"Non-aggression pact":'Saldırmazlık paktı'),d:(LANG_EN?"For 12 months they won't start price wars, copy your products or poach your staff.":'12 ay boyunca fiyat savaşı açmaz, ürünlerini kopyalamaz ve çalışanlarını ayartmaz.'),m:12,cost:100000}};
function ceoPartP(c,k){const P0=PERS[ceoOf(c).p];return clamp(0.25+relOf(c)/120+(P0.part-1)*0.3+(k==='peace'&&ceoShare(c)>0.2?-0.15:0),0.03,0.95);}
function ceoStartPart(c,k){const P0=PART[k];(G.ceoP=G.ceoP||[]).push({cid:c.id,k,until:G.day+P0.m*30});ceoAdd(c,8);if(k==='rd')c.tech=clamp(c.tech+0.01,0.7,1.45);
  news((LANG_EN?`Started ${P0.n.toLocaleLowerCase(LOC)} with ${c.name} (${P0.m} months).`:`${c.name} ile ${P0.n.toLocaleLowerCase(LOC)} başladı (${P0.m} ay).`),'good',true);tl('acq',(LANG_EN?`${c.name}, ${P0.n.toLocaleLowerCase(LOC)}`:`${c.name} ile ${P0.n.toLocaleLowerCase(LOC)}`));}
const CEO_EVS=[
  {id:'ceofeud',w:0,choice:true,cond:()=>false,
    view:d=>{const c=comp(d.cid),o=c?ceoOf(c):null;return {t:(LANG_EN?"Press spat":'Basında atışma'),b:(LANG_EN?`${o?o.name:"A CEO"} (${c?c.name:''}, ${o?PERS[o.p].n.toLocaleLowerCase(LOC):''}) took aim at you in an interview: ${d.q} Social media is waiting for your response.`:`${o?o.name:'Bir CEO'} (${c?c.name:''}, ${o?PERS[o.p].n.toLocaleLowerCase(LOC):''}) bir röportajda seni hedef aldı: ${d.q} Sosyal medya cevabını bekliyor.`),
      o:[{t:(LANG_EN?"Hit back hard":'Sert cevap ver'),d:(LANG_EN?"50/50: either your reply goes viral and your brand gains, or you look combative. The relationship gets much worse.":'Yarı yarıya: ya cevabın viral olur ve marka kazanırsın ya da kavgacı görünürsün. İlişki iyice bozulur.')},
        {t:(LANG_EN?"Reply with humor":'Esprili bir cevap ver'),d:(LANG_EN?"Usually works and helps your brand; the relationship sours a little.":'Çoğu zaman işe yarar ve markana iyi gelir; ilişki biraz bozulur.')},
        {t:(LANG_EN?"Ignore it":'Görmezden gel'),d:(LANG_EN?"Your brand takes a small hit, but the spat dies down.":'Marka biraz zarar görür ama kavga söner.')},
        {t:(LANG_EN?"Offer a private meeting":'Özel görüşme teklif et'),d:o&&o.p==='kav'?(LANG_EN?"A combative CEO may see this as weakness.":'Kavgacı bir CEO bunu zayıflık olarak görebilir.'):(LANG_EN?"A good chance to mend the relationship.":'İlişkiyi düzeltmek için iyi bir fırsat.')}]};},
    pick(d,i){const c=comp(d.cid);if(!c)return;const o=ceoOf(c);
      if(i===0){if(Math.random()<0.5){G.brand=clamp(G.brand+2,0,100);c.brand=clamp(c.brand-2,3,90);news((LANG_EN?`Your reply went viral! ${o.name} has gone quiet.`:`Cevabın viral oldu! ${o.name} sessizliğe gömüldü.`),'good',true);}else{G.brand=clamp(G.brand-2,0,100);news((LANG_EN?"Your harsh reply came across as arrogant; you got backlash on social media.":'Sert cevabın kibirli bulundu; sosyal medyada tepki aldın.'),'bad',true);}ceoAdd(c,-15);o.feud=(o.feud||0)+1;}
      else if(i===1){if(Math.random()<0.65){G.brand=clamp(G.brand+1.5,0,100);news((LANG_EN?"Your witty reply was a hit.":'Esprili cevabın çok sevildi.'),'good');}else news((LANG_EN?"The joke fell flat, but no harm done.":'Espri tutmadı ama zararı da olmadı.'));ceoAdd(c,-5);}
      else if(i===2){G.brand=clamp(G.brand-0.5,0,100);o.feud=Math.max(0,(o.feud||0)-1);news((LANG_EN?"You didn't respond to the spat; it was forgotten in a few days.":'Atışmaya cevap vermedin; konu birkaç günde unutuldu.'));}
      else{if(o.p==='kav'&&Math.random()<0.6){G.brand=clamp(G.brand-1,0,100);news((LANG_EN?`${o.name} mocked your meeting offer.`:`${o.name} görüşme teklifini alaya aldı.`),'bad',true);ceoAdd(c,-3);}else{ceoAdd(c,o.p==='dip'?20:12);o.feud=0;news((LANG_EN?`You met with ${o.name}; the ice thawed a bit.`:`${o.name} ile görüştün; buzlar biraz eridi.`),'good');}}}},
  {id:'ceopart',w:0,choice:true,cond:()=>false,
    view:d=>{const c=comp(d.cid),o=c?ceoOf(c):null;return {t:(LANG_EN?"Partnership offer":'Ortaklık teklifi'),b:(LANG_EN?`${o?o.name:"A CEO"} (${c?c.name:''}) wants to work with you and offers three options.`:`${o?o.name:'Bir CEO'} (${c?c.name:''}) seninle birlikte çalışmak istiyor ve üç seçenek sunuyor.`),
      o:[...Object.entries(PART).map(([k,P0])=>({t:`${P0.n} (${money(P0.cost*infl())})`,d:P0.d})),{t:(LANG_EN?"Thank them, but not now":'Teşekkür et, şimdilik hayır'),d:(LANG_EN?"The relationship cools a little.":'İlişki biraz soğur.')}]};},
    pick(d,i){const c=comp(d.cid);if(!c)return;const ks=Object.keys(PART);if(i<3){const k=ks[i],cost=PART[k].cost*infl();if(G.cash<cost){news((LANG_EN?"Not enough cash for the partnership.":'Ortaklık için yeterli nakit yoktu.'),'bad');ceoAdd(c,-3);return;}spend(cost,'other');ceoStartPart(c,k);}else ceoAdd(c,-4);}},
];
for(const e of CEO_EVS)EVD[e.id]=e;
function ceoMonthly(){
  const live=liveComps();if(!live.length)return;
  for(const c of live){const o=ceoOf(c);const r=relOf(c);if(r)c.rel=r*(r<0?1-0.02/PERS[o.p].grudge:0.98);
    if(Math.random()<0.004*(1+(G.day-o.since)/3650)){const old=o,n=newCeo(c);c.ceo=n;c.rel=Math.round(relOf(c)*0.3);c.aggr=clamp(c.aggr-PERS[old.p].aggr+PERS[n.p].aggr,0.05,0.95);
      if(c.emp>100||ceoShare(c)>0.05)news((LANG_EN?`Leadership change at ${c.name}: ${old.name} is out, the new CEO is ${n.name} (${PERS[n.p].n.toLocaleLowerCase(LOC)}).`:`${c.name}'da yönetim değişikliği: ${old.name} ayrıldı, yeni CEO ${n.name} (${PERS[n.p].n.toLocaleLowerCase(LOC)}).`),'mkt',true);}
    if(Math.random()<0.006){c.brand=clamp(c.brand-5,3,90);if(c.emp>100||ceoShare(c)>0.05)news((LANG_EN?`${c.name} CEO ${o.name} was caught up in a scandal; the company's brand took a hit.`:`${c.name} CEO'su ${o.name} skandala karıştı; şirketin markası zarar gördü.`),'mkt',true);}}
  G.ceoP=(G.ceoP||[]).filter(p=>{if(p.until>G.day&&comp(p.cid)&&!comp(p.cid).dead)return true;if(comp(p.cid))news((LANG_EN?`Your ${PART[p.k].n.toLocaleLowerCase(LOC)} with ${comp(p.cid).name} has ended.`:`${comp(p.cid).name} ile ${PART[p.k].n.toLocaleLowerCase(LOC)} sona erdi.`));return false;});
  if((G.ceoP||[]).some(p=>p.k==='mkt'))G.brand=clamp(G.brand+0.25,0,100);
  if(G.pending||G.over||G.day<150||G.day<(G.ceoCool||0)||!myActive().length)return;
  const rel=live.filter(c=>ceoShare(c)>0.01||c.focus.some(f=>myActive(f).length));if(!rel.length)return;
  const feud=rel.map(c=>{const o=ceoOf(c);return [c,PERS[o.p].feud*(1+(o.feud||0)*0.3)*(1+Math.max(0,-relOf(c))/50)*(0.5+ceoShare(c)*3)*(ceoPact(c)?0.1:1)];});
  const part=rel.filter(c=>(relOf(c)>=15||PERS[ceoOf(c).p].part>=1.3&&relOf(c)>=-5)&&!ceoPact(c)&&!(G.ceoP||[]).some(p=>p.cid===c.id)).map(c=>[c,PERS[ceoOf(c).p].part*Math.max(0.3,relOf(c)/50)]);
  const tot=feud.reduce((a,x)=>a+x[1],0)*0.05+part.reduce((a,x)=>a+x[1],0)*0.15;
  if(Math.random()>Math.min(0.3,tot))return;
  const all=[...feud.map(x=>['f',...x,x[1]*0.05]),...part.map(x=>['p',...x,x[1]*0.15])];let r=Math.random()*all.reduce((a,x)=>a+x[3],0);
  for(const x of all){r-=x[3];if(r<=0){const c=x[1],o=ceoOf(c);G.ceoCool=G.day+60;
    if(x[0]==='f'){triggerChoice('ceofeud',{cid:c.id,q:pick(PERS[o.p].jab)});}
    else if(Math.random()<0.25){G.brand=clamp(G.brand+0.5,0,100);news((LANG_EN?`${o.name} (${c.name}) praised you: ${PERS[o.p].praise}`:`${o.name} (${c.name}) seni övdü: ${PERS[o.p].praise}`),'good',true);ceoAdd(c,3);}
    else triggerChoice('ceopart',{cid:c.id});
    return;}}
}
function vCeos(){
  const live=liveComps().slice().sort((a,b)=>ceoShare(b)-ceoShare(a)||b.emp-a.emp);
  const pacts=(G.ceoP||[]).filter(p=>p.until>G.day&&comp(p.cid));
  const card=c=>{const o=ceoOf(c),P0=PERS[o.p],r=relOf(c),[ln,lc]=relLbl(r),dc=20000*infl(),din=G.day-o.din<90,jab=G.day-o.jab<60,mine=pacts.filter(p=>p.cid===c.id);
    return (LANG_EN?`<div class="proj col" style="gap:6px"><div class="row" style="gap:10px;align-items:center"><span aria-hidden="true" style="width:38px;height:38px;border-radius:50%;flex:none;display:grid;place-items:center;font-weight:700;color:#fff;background:hsl(${c.hue||200} 45% 42%)">${esc(o.name.split(' ').map(x=>x[0]).join(''))}</span>
      <div class="col" style="gap:0;min-width:0"><b>${esc(o.name)}</b><span class="small muted">${esc(c.name)} · age ${o.age} · since ${fmtDate(o.since).split(' ').slice(-1)[0]}</span></div></div>
      <div class="row" style="gap:6px;flex-wrap:wrap"><span class="chip ${P0.c}">${P0.n}</span><span class="chip ${lc}">${ln} ${r>0?'+':''}${Math.round(r)}</span>${mine.map(p=>`<span class="chip st-ok">${PART[p.k].n} · ${Math.ceil((p.until-G.day)/30)} mo</span>`).join('')}</div>
      <div class="bar" style="position:relative"><i style="position:absolute;left:${r<0?50+r/2:50}%;width:${Math.abs(r)/2}%;background:${r<0?'var(--bad)':'var(--ok)'}"></i><span style="position:absolute;left:50%;top:-2px;bottom:-2px;width:1px;background:var(--ink)"></span></div>
      <div class="small muted">${P0.d}</div>
      <div class="row" style="gap:4px;flex-wrap:wrap"><button class="btn sm" data-act="ceodin" data-id="${c.id}" ${din||G.cash<dc?'disabled':''}>${din?"Dinner "+(90-(G.day-o.din))+" days":"Invite to dinner · "+money(dc)}</button>
        <button class="btn sm ghost" data-act="ceojab" data-id="${c.id}" ${jab?'disabled':''}>Jab in the press</button>
        ${r>=15&&!mine.length?`<button class="btn sm primary" data-act="ceopro" data-id="${c.id}">Propose partnership</button>`:''}
        ${r<=-30?`<button class="btn sm" data-act="ceopeace" data-id="${c.id}" ${G.cash<100000*infl()?'disabled':''}>Peace offer · ${money(100000*infl())}</button>`:''}</div></div>`:`<div class="proj col" style="gap:6px"><div class="row" style="gap:10px;align-items:center"><span aria-hidden="true" style="width:38px;height:38px;border-radius:50%;flex:none;display:grid;place-items:center;font-weight:700;color:#fff;background:hsl(${c.hue||200} 45% 42%)">${esc(o.name.split(' ').map(x=>x[0]).join(''))}</span>
      <div class="col" style="gap:0;min-width:0"><b>${esc(o.name)}</b><span class="small muted">${esc(c.name)} · ${o.age} yaş · ${fmtDate(o.since).split(' ').slice(-1)[0]}'den beri</span></div></div>
      <div class="row" style="gap:6px;flex-wrap:wrap"><span class="chip ${P0.c}">${P0.n}</span><span class="chip ${lc}">${ln} ${r>0?'+':''}${Math.round(r)}</span>${mine.map(p=>`<span class="chip st-ok">${PART[p.k].n} · ${Math.ceil((p.until-G.day)/30)} ay</span>`).join('')}</div>
      <div class="bar" style="position:relative"><i style="position:absolute;left:${r<0?50+r/2:50}%;width:${Math.abs(r)/2}%;background:${r<0?'var(--bad)':'var(--ok)'}"></i><span style="position:absolute;left:50%;top:-2px;bottom:-2px;width:1px;background:var(--ink)"></span></div>
      <div class="small muted">${P0.d}</div>
      <div class="row" style="gap:4px;flex-wrap:wrap"><button class="btn sm" data-act="ceodin" data-id="${c.id}" ${din||G.cash<dc?'disabled':''}>${din?'Yemek '+(90-(G.day-o.din))+' gün sonra':'Yemeğe davet · '+money(dc)}</button>
        <button class="btn sm ghost" data-act="ceojab" data-id="${c.id}" ${jab?'disabled':''}>Basında iğnele</button>
        ${r>=15&&!mine.length?`<button class="btn sm primary" data-act="ceopro" data-id="${c.id}">Ortaklık öner</button>`:''}
        ${r<=-30?`<button class="btn sm" data-act="ceopeace" data-id="${c.id}" ${G.cash<100000*infl()?'disabled':''}>Barış teklifi · ${money(100000*infl())}</button>`:''}</div></div>`);};
  const top=live.slice(0,9),rest=live.slice(9);
  const fr=live.filter(c=>relOf(c)>=30).length,en=live.filter(c=>relOf(c)<=-30).length;
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Rival CEOs${helpBtn('ceo')}</h2><span class="sub">${live.length} companies</span></div>
    <div class="kpis"><div class="kpi"><span>Friends</span><b class="pos">${fr}</b></div><div class="kpi"><span>Enemies</span><b class="${en?'neg':''}">${en}</b></div><div class="kpi"><span>Active partnerships</span><b>${pacts.length}</b></div><div class="kpi"><span>Joint R&D</span><b>${ceoRD()?"+15% research":'—'}</b></div></div>
    <div class="pb small muted">Every rival has a CEO with a personality. Relationships range from −100 to +100 and drift back to neutral over time (slower for grudge-holders). Enemies start price wars, poach your staff, sue you and attack you in the press. Friends propose partnerships and attack you less. Poaching their stars, suing them and jabbing them in the press hurt the relationship.</div></section>
  ${UI.ceoPro?(()=>{const c=comp(UI.ceoPro);if(!c)return '';return `<section class="panel"><div class="ph"><h2>Partnership with ${esc(ceoOf(c).name)}</h2><button class="btn sm ghost" data-act="ceopro" data-id="">Close</button></div><div class="pb"><div class="grid3">${Object.entries(PART).map(([k,P0])=>`<div class="proj col" style="gap:6px"><b>${P0.n}</b><div class="small muted">${P0.d}</div><button class="btn sm primary" data-act="ceopart" data-id="${c.id}" data-k="${k}" ${G.cash<P0.cost*infl()?'disabled':''}>Propose · ${money(P0.cost*infl())} · ${Math.round(ceoPartP(c,k)*100)}% acceptance</button></div>`).join('')}</div></div></section>`;})():''}
  <section class="panel"><div class="ph"><h2>Your rivals in the market</h2></div><div class="pb"><div class="grid3">${top.map(card).join('')}</div></div></section>
  ${rest.length?`<section class="panel"><div class="ph"><h2>Other companies</h2></div><div class="pb"><div class="grid3">${rest.map(card).join('')}</div></div></section>`:''}`:`<section class="panel"><div class="ph"><h2>Rakip CEO'lar${helpBtn('ceo')}</h2><span class="sub">${live.length} şirket</span></div>
    <div class="kpis"><div class="kpi"><span>Dost</span><b class="pos">${fr}</b></div><div class="kpi"><span>Düşman</span><b class="${en?'neg':''}">${en}</b></div><div class="kpi"><span>Aktif ortaklık</span><b>${pacts.length}</b></div><div class="kpi"><span>Ortak Ar-Ge</span><b>${ceoRD()?'+%15 araştırma':'—'}</b></div></div>
    <div class="pb small muted">Her rakibin kişiliği olan bir CEO'su var. İlişki −100 ile +100 arasında; zamanla nötre döner (kinciler daha yavaş). Düşmanlar fiyat savaşı açar, çalışanlarını ayartır, dava açar ve basında sana saldırır. Dostlar ortaklık önerir ve sana daha az saldırır. Yıldızlarını transfer etmek, dava açmak ve basında iğnelemek ilişkiyi bozar.</div></section>
  ${UI.ceoPro?(()=>{const c=comp(UI.ceoPro);if(!c)return '';return `<section class="panel"><div class="ph"><h2>${esc(ceoOf(c).name)} ile ortaklık</h2><button class="btn sm ghost" data-act="ceopro" data-id="">Kapat</button></div><div class="pb"><div class="grid3">${Object.entries(PART).map(([k,P0])=>`<div class="proj col" style="gap:6px"><b>${P0.n}</b><div class="small muted">${P0.d}</div><button class="btn sm primary" data-act="ceopart" data-id="${c.id}" data-k="${k}" ${G.cash<P0.cost*infl()?'disabled':''}>Öner · ${money(P0.cost*infl())} · kabul %${Math.round(ceoPartP(c,k)*100)}</button></div>`).join('')}</div></div></section>`;})():''}
  <section class="panel"><div class="ph"><h2>Pazardaki rakiplerin</h2></div><div class="pb"><div class="grid3">${top.map(card).join('')}</div></div></section>
  ${rest.length?`<section class="panel"><div class="ph"><h2>Diğer şirketler</h2></div><div class="pb"><div class="grid3">${rest.map(card).join('')}</div></div></section>`:''}`);
}

