/* ============================== TALENT WARS ============================== */
const newTw=()=>({offers:[],stars:[],log:[],lost:0,won:0,optPool:0});
const twMarket=e=>salaryFor(e.skill)*(1+0.12*(e.level||0))*macWage();
function twHeat(){const ph=macPh();return clamp((ph==='boom'||ph==='stim'?1.5:ph==='rec'||ph==='shock'?0.55:ph==='rcv'?0.8:1)*(1+Math.min(0.15,years()*0.015)),0.4,2.2);}
const twHeatN=h=>h>1.4?[(LANG_EN?"Angry":'Kızgın'),'st-bad']:h>1.05?[(LANG_EN?"Lively":'Hareketli'),'st-warn']:h<0.75?[(LANG_EN?"Calm":'Sakin'),'st-ok']:[(LANG_EN?"Normal":'Normal'),'st-mute'];
function twVest(e){const o=e.opt;if(!o)return 0;const t=G.day-o.start;return t<365?0:clamp(t/(4*365),0,1);}
const twUnvested=e=>e.opt?e.opt.g*(1-twVest(e))*valuation():0;
function twRisk(e){if(e.founder||e.intern)return 0;const pay=e.salary/Math.max(1,twMarket(e)),unv=twUnvested(e);
  return clamp(0.22+(60-e.morale)/100+(1-pay)*0.8+(e.skill-6)*0.05+(twHeat()-1)*0.15-Math.min(0.3,unv/Math.max(1,e.salary*24))-(e.nc?0.1:0)-Math.min(0.1,(G.day-(e.hiredAt||0))/3650)+(55-(G.cult==null?80:G.cult))/400,0.02,0.95)*(ceoSk('l2')?0.7:1)*keyRisk(e);}
const twLog=t=>{const T=G.tw;T.log.unshift({d:G.day,t});if(T.log.length>14)T.log.pop();};
function twOffer(c,e,mult){const T=G.tw;if(!c||!e||T.offers.some(o=>o.eid===e.id))return;
  const o={id:nid(),eid:e.id,cid:c.id,sal:Math.round(e.salary*(mult||rnd(1.25,1.6))/100)*100,due:G.day+rint(7,12)};T.offers.push(o);
  news((LANG_EN?`${c.name} offered ${e.name} (${ROLES[e.role].n}, skill ${fx(e.skill,1)}) ${money(o.sal)}/mo. They'll decide within ${o.due-G.day} days.`:`${c.name}, ${e.name} (${ROLES[e.role].n}, yetenek ${fx(e.skill,1)}) için ${money(o.sal)}/ay teklif etti. ${o.due-G.day} gün içinde karar verecek.`),'bad',e.skill>=7);}
function twLeave(e,c,why){
  const T=G.tw;e.lw='poach';G.emps=G.emps.filter(x=>x!==e);T.lost++;
  if(e.opt){const back=e.opt.g*(1-twVest(e));G.equity=Math.min(0.999,G.equity+back);}
  if(c&&!e.nc){c.tech=clamp(c.tech+0.006*(e.skill-5),0.7,1.45);
    const peers=e.skill>=7?G.emps.filter(x=>x.role===e.role&&!x.founder&&!x.nc&&x.morale<50&&Math.random()<0.15).slice(0,2):[];
    for(const p of peers){p.lw='poach';G.emps=G.emps.filter(x=>x!==p);T.lost++;}
    news((LANG_EN?`${e.name}${why||''} moved to ${c.name}${peers.length?` and took ${peers.map(p=>p.name).join(', ')} along`:''}.`:`${e.name}${why||''} ${c.name} şirketine geçti${peers.length?` ve ${peers.map(p=>p.name).join(', ')} ile birlikte gitti`:''}.`),'bad',true);twLog(`${e.name}${peers.length?` (+${peers.length})`:''} → ${c.name}`);}
  else{news((LANG_EN?`${e.name} moved to ${c?c.name+", a rival":'rakibe'}${e.nc?"; a non-compete bars them from working for a year":''}.`:`${e.name} ${c?c.name+' şirketine':'rakibe'} geçti${e.nc?'; rekabet yasağı yüzünden bir yıl çalışamayacak':''}.`),'bad',true);twLog(`${e.name} → ${c?c.name:'rakip'}${e.nc?(LANG_EN?" (non-compete)":' (rekabet yasağı)'):''}`);}
  for(const o of G.emps)o.morale=clamp(o.morale-(e.skill>=7?3:1),0,100);
}
function twStarGen(){const T=G.tw,live=liveComps().filter(c=>c.emp>=40);T.stars=T.stars.filter(s2=>s2.exp>G.day&&comp(s2.cid)&&!comp(s2.cid).dead);
  while(T.stars.length<4&&live.length){const c=pick(live),sk=Math.round(rnd(7,9.6)*10)/10,role=pick(['soft','soft','design','hw','res','mkt','ops']),lv=levelFor(sk);
    T.stars.push({id:nid(),name:pick(FIRST)+' '+pick(LAST),role,skill:sk,level:lv,cid:c.id,ask:Math.round(salaryFor(sk)*(1+0.12*lv)*macWage()*rnd(1.3,1.7)/100)*100,nc:Math.random()<0.35,exp:G.day+rint(40,70)});}}
function twStarP(s2,m,opt){const c=comp(s2.cid);if(!c)return 0;return clamp(0.2+(G.brand-c.brand)/150+Math.min(0.15,(G.momentum||0)/80)+(m-1)*1.3+(opt?0.15:0)+(c.profit<0?0.15:0)-c.aggr*0.1+(prestige?prestige()/400:0),0.05,0.95);}
function twMonthly(){
  const T=G.tw;if(!T||G.day<200)return;
  twStarGen();
  const live=liveComps().filter(c=>c.cash>2e6*infl());if(!live.length)return;
  const n=(0.2+G.emps.length/160)*twHeat();let k=Math.floor(n)+(Math.random()<n%1?1:0);const RK=new Map();
  while(k-->0&&T.offers.length<3){
    const cand=G.emps.filter(e=>!e.founder&&!e.intern&&!e.leave&&e.skill>=5.5&&!T.offers.some(o=>o.eid===e.id));if(!cand.length)break;
    const w=cand.map(e=>{let v=RK.get(e);if(v===undefined){v=twRisk(e);RK.set(e,v);}return Math.pow(e.skill,2)*(0.2+v);});let r=Math.random()*w.reduce((a,b)=>a+b,0),e=cand[0];for(let i=0;i<cand.length;i++){r-=w[i];if(r<=0){e=cand[i];break;}}
    const lv=live.filter(c=>!ceoPact(c)),wc=lv.map(c=>c.aggr*Math.sqrt(Math.max(1,c.cash))*(1-clamp(relOf(c),-60,80)/100)*(c.ceo&&PERS[c.ceo.p].poach||1));if(!lv.length)break;let rr=Math.random()*wc.reduce((a,b)=>a+b,0),c=lv[0];for(let i=0;i<lv.length;i++){rr-=wc[i];if(rr<=0){c=lv[i];break;}}twOffer(c,e);}
}
function twDaily(){const T=G.tw;if(!T)return;
  for(const o of T.offers.slice()){const e=G.emps.find(x=>x.id===o.eid),c=comp(o.cid);if(!e||!c||c.dead){T.offers=T.offers.filter(x=>x!==o);continue;}
    if(G.day<o.due)continue;T.offers=T.offers.filter(x=>x!==o);
    const att=clamp((o.sal/e.salary-1)*2,0.2,1.2);
    if(Math.random()<twRisk(e)*att)twLeave(e,c);else{news((LANG_EN?`${e.name} turned down ${c.name}'s offer and stayed.`:`${e.name}, ${c.name} teklifini reddetti ve kaldı.`),'good');e.morale=clamp(e.morale+2,0,100);}}}
function twGrant(e,g){const o=e.opt;if(o){o.g+=g;o.start=Math.min(o.start,G.day);}else e.opt={g,start:G.day};G.equity=Math.max(0.01,G.equity*(1-g));G.tw.optPool=(G.tw.optPool||0)+g;e.morale=clamp(e.morale+5,0,100);}
function vTalent(){
  const T=G.tw,h=twHeat(),hn=twHeatN(h),emps=G.emps.filter(e=>!e.founder&&!e.intern);
  const risky=emps.map(e=>({e,r:twRisk(e)})).sort((a,b)=>b.r*b.e.skill-a.r*a.e.skill).slice(0,8);
  const offs=T.offers.map(o=>{const e=G.emps.find(x=>x.id===o.eid),c=comp(o.cid);if(!e||!c)return '';const r=twRisk(e),att=clamp((o.sal/e.salary-1)*2,0.2,1.2);
    return (LANG_EN?`<div class="proj col" style="gap:6px;border-color:var(--bad)"><div class="row between"><b>${esc(e.name)}</b><span class="chip st-bad">${Math.max(0,o.due-G.day)} days</span></div>
      <div class="small">${ROLES[e.role].n} · skill ${fx(e.skill,1)} · salary ${money(e.salary)}</div>
      <div class="small"><b>${esc(c.name)}</b> is offering ${money(o.sal)}/mo (+${pct(o.sal/e.salary-1,0)}). If you do nothing, the chance they leave is <b class="${r*att>0.4?'neg':''}">${Math.round(r*att*100)}%</b>.</div>
      <div class="row" style="gap:4px;flex-wrap:wrap"><button class="btn sm primary" data-act="twmatch" data-id="${o.id}" data-k="1">Match · ${money(o.sal-e.salary)}/mo</button><button class="btn sm" data-act="twmatch" data-id="${o.id}" data-k="1.1">Match +10%</button>
        <button class="btn sm" data-act="twopt" data-id="${o.id}">Grant options · 0.25%</button><button class="btn sm ghost" data-act="twlet" data-id="${o.id}">Let them go</button></div></div>`:`<div class="proj col" style="gap:6px;border-color:var(--bad)"><div class="row between"><b>${esc(e.name)}</b><span class="chip st-bad">${Math.max(0,o.due-G.day)} gün</span></div>
      <div class="small">${ROLES[e.role].n} · yetenek ${fx(e.skill,1)} · maaşı ${money(e.salary)}</div>
      <div class="small"><b>${esc(c.name)}</b> ${money(o.sal)}/ay teklif ediyor (+${pct(o.sal/e.salary-1,0)}). Hiçbir şey yapmazsan gitme ihtimali <b class="${r*att>0.4?'neg':''}">%${Math.round(r*att*100)}</b>.</div>
      <div class="row" style="gap:4px;flex-wrap:wrap"><button class="btn sm primary" data-act="twmatch" data-id="${o.id}" data-k="1">Eşleştir · ${money(o.sal-e.salary)}/ay</button><button class="btn sm" data-act="twmatch" data-id="${o.id}" data-k="1.1">Eşleştir +%10</button>
        <button class="btn sm" data-act="twopt" data-id="${o.id}">Opsiyon ver · %0,25</button><button class="btn sm ghost" data-act="twlet" data-id="${o.id}">Gitsin</button></div></div>`);}).join('');
  const rows=risky.map(({e,r})=>{const pay=e.salary/Math.max(1,twMarket(e)),vf=twVest(e);
    return (LANG_EN?`<tr><td><b>${esc(e.name)}</b><div class="small muted">${ROLES[e.role].n} · ${fx(e.skill,1)}</div></td><td><div class="bar" style="width:80px"><i style="width:${r*100}%;background:${r>0.5?'var(--bad)':r>0.3?'var(--warn)':'var(--ok)'}"></i></div><span class="small num">${Math.round(r*100)}%</span></td>
      <td class="r num ${pay<0.9?'neg':pay>1.1?'pos':''}">${Math.round(pay*100)}%</td><td class="small">${e.opt?`${fx(e.opt.g*100,2)}% · ${pct(vf,0)} vested`:'—'}</td><td class="small">${e.nc?"Yes":'—'}</td>
      <td class="r"><div class="row" style="gap:4px;justify-content:flex-end;flex-wrap:wrap"><button class="btn sm" data-act="twraise" data-eid="${e.id}">Raise 15%</button><button class="btn sm" data-act="twgrant" data-eid="${e.id}">Options 0.1%</button>${e.nc?'':`<button class="btn sm ghost" data-act="twnc" data-eid="${e.id}">Non-compete · ${money(e.salary*2)}</button>`}</div></td></tr>`:`<tr><td><b>${esc(e.name)}</b><div class="small muted">${ROLES[e.role].n} · ${fx(e.skill,1)}</div></td><td><div class="bar" style="width:80px"><i style="width:${r*100}%;background:${r>0.5?'var(--bad)':r>0.3?'var(--warn)':'var(--ok)'}"></i></div><span class="small num">%${Math.round(r*100)}</span></td>
      <td class="r num ${pay<0.9?'neg':pay>1.1?'pos':''}">%${Math.round(pay*100)}</td><td class="small">${e.opt?`%${fx(e.opt.g*100,2)} · ${pct(vf,0)} hak edildi`:'—'}</td><td class="small">${e.nc?'Var':'—'}</td>
      <td class="r"><div class="row" style="gap:4px;justify-content:flex-end;flex-wrap:wrap"><button class="btn sm" data-act="twraise" data-eid="${e.id}">Zam %15</button><button class="btn sm" data-act="twgrant" data-eid="${e.id}">Opsiyon %0,1</button>${e.nc?'':`<button class="btn sm ghost" data-act="twnc" data-eid="${e.id}">Rekabet yasağı · ${money(e.salary*2)}</button>`}</div></td></tr>`);}).join('');
  const stars=T.stars.map(s2=>{const c=comp(s2.cid);if(!c)return '';const full=G.emps.length>=officeCap();
    return (LANG_EN?`<div class="proj col" style="gap:6px"><div class="row between"><b>${esc(s2.name)}</b><span class="chip st-mute">${esc(c.name)}</span></div>
      <div class="small">${ROLES[s2.role].n} · skill <b>${fx(s2.skill,1)}</b> · asking ${money(s2.ask)}/mo${s2.nc?" · <span class=\"warn\">has a non-compete</span>":''}</div>
      <div class="row" style="gap:4px;flex-wrap:wrap">${[[1,false],[1.2,false],[1.2,true]].map(([m,o])=>`<button class="btn sm ${m>1?'primary':''}" data-act="twstar" data-id="${s2.id}" data-m="${m}" data-o="${o?1:0}" ${full?'disabled':''}>${money(s2.ask*m)}${o?" + options":''} · ${Math.round(twStarP(s2,m,o)*100)}%</button>`).join('')}</div>
      <div class="small muted">${full?"No room in your office.":`Available until ${fmtDate(s2.exp)}.`}</div></div>`:`<div class="proj col" style="gap:6px"><div class="row between"><b>${esc(s2.name)}</b><span class="chip st-mute">${esc(c.name)}</span></div>
      <div class="small">${ROLES[s2.role].n} · yetenek <b>${fx(s2.skill,1)}</b> · istediği ${money(s2.ask)}/ay${s2.nc?' · <span class="warn">rekabet yasağı var</span>':''}</div>
      <div class="row" style="gap:4px;flex-wrap:wrap">${[[1,false],[1.2,false],[1.2,true]].map(([m,o])=>`<button class="btn sm ${m>1?'primary':''}" data-act="twstar" data-id="${s2.id}" data-m="${m}" data-o="${o?1:0}" ${full?'disabled':''}>${money(s2.ask*m)}${o?' + opsiyon':''} · %${Math.round(twStarP(s2,m,o)*100)}</button>`).join('')}</div>
      <div class="small muted">${full?'Ofisinde yer yok.':`${fmtDate(s2.exp)}'e kadar ulaşılabilir.`}</div></div>`);}).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Talent wars${helpBtn('talent')}</h2><span class="chip ${hn[1]}">Talent market: ${hn[0]}</span></div>
    <div class="kpis"><div class="kpi"><span>Incoming offers</span><b class="${T.offers.length?'neg':''}">${T.offers.length}</b></div><div class="kpi"><span>High-risk employees</span><b>${emps.filter(e=>twRisk(e)>0.45).length}</b></div><div class="kpi"><span>Lost / won</span><b>${T.lost} / ${T.won}</b></div><div class="kpi"><span>Options granted</span><b>${fx((T.optPool||0)*100,2)}%</b></div></div>
    <div class="pb small muted">Rivals make offers to your best people. Flight risk depends on morale, salary vs. market, skill, seniority, unvested options and non-competes. The talent market heats up or cools down with the economic cycle. Someone leaving without a non-compete strengthens the rival's tech and may take low-morale teammates along.</div></section>
  ${offs?`<section class="panel"><div class="ph"><h2>Incoming offers</h2></div><div class="pb"><div class="grid">${offs}</div></div></section>`:''}
  <section class="panel"><div class="ph"><h2>Employees most likely to leave</h2></div>${rows?`<div class="tw"><table><thead><tr><th>Employee</th><th>Risk</th><th class="r">Salary / market</th><th>Options</th><th>Non-compete</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:"<div class=\"pb small muted\">No team yet.</div>"}
    <div class="pb small muted">Stock options vest over 4 years (none in the first year); the unvested portion acts as "golden handcuffs" and comes out of your stake. A non-compete is signed for a bonus worth two months' salary and lowers flight risk.</div></section>
  <section class="panel"><div class="ph"><h2>Star hunting</h2><span class="sub">Talent at rivals · refreshed monthly</span></div><div class="pb">${stars?`<div class="grid3">${stars}</div>`:"<div class=\"small muted\">No stars available right now.</div>"}
    <p class="small muted" style="margin-top:10px">Acceptance depends on your brand, momentum, how generous your offer is and the rival's situation. Hire a star with a non-compete and their former company may sue. A successful transfer weakens the rival's tech and hurts your relationship.</p></div></section>
  ${T.log.length?`<section class="panel"><div class="ph"><h2>Transfer history</h2></div><div class="pb small col" style="gap:4px">${T.log.map(l=>`<div><span class="muted num">${fmtDate(l.d)}</span> · ${esc(l.t)}</div>`).join('')}</div></section>`:''}`:`<section class="panel"><div class="ph"><h2>Yetenek savaşları${helpBtn('talent')}</h2><span class="chip ${hn[1]}">Yetenek piyasası: ${hn[0]}</span></div>
    <div class="kpis"><div class="kpi"><span>Gelen teklif</span><b class="${T.offers.length?'neg':''}">${T.offers.length}</b></div><div class="kpi"><span>Yüksek riskli çalışan</span><b>${emps.filter(e=>twRisk(e)>0.45).length}</b></div><div class="kpi"><span>Kaybedilen / kazanılan</span><b>${T.lost} / ${T.won}</b></div><div class="kpi"><span>Dağıtılan opsiyon</span><b>%${fx((T.optPool||0)*100,2)}</b></div></div>
    <div class="pb small muted">Rakipler en iyi çalışanlarına teklif yapar. Kaçma riski moral, piyasaya göre maaş, yetenek, kıdem, hak edilmemiş opsiyonlar ve rekabet yasağına bağlıdır. Yetenek piyasası ekonominin dönemine göre ısınır ya da soğur. Rekabet yasağı olmayan biri giderken rakibin teknolojisini güçlendirir ve morali düşük takım arkadaşlarını da götürebilir.</div></section>
  ${offs?`<section class="panel"><div class="ph"><h2>Gelen teklifler</h2></div><div class="pb"><div class="grid">${offs}</div></div></section>`:''}
  <section class="panel"><div class="ph"><h2>Kaçma riski en yüksek çalışanlar</h2></div>${rows?`<div class="tw"><table><thead><tr><th>Çalışan</th><th>Risk</th><th class="r">Maaş / piyasa</th><th>Opsiyon</th><th>Rekabet yasağı</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="pb small muted">Henüz ekip yok.</div>'}
    <div class="pb small muted">Hisse opsiyonları 4 yılda hak edilir (ilk yıl hiç); hak edilmemiş kısım "altın kelepçe" gibi çalışanı tutar ve senin payından çıkar. Rekabet yasağı iki aylık maaş tutarında bir imza ikramiyesiyle imzalatılır ve kaçma riskini düşürür.</div></section>
  <section class="panel"><div class="ph"><h2>Yıldız avı</h2><span class="sub">Rakiplerdeki yetenekler · her ay yenilenir</span></div><div class="pb">${stars?`<div class="grid3">${stars}</div>`:'<div class="small muted">Şu an ulaşılabilir yıldız yok.</div>'}
    <p class="small muted" style="margin-top:10px">Kabul ihtimali markana, ivmene, teklifinin cömertliğine ve rakibin durumuna bağlıdır. Rekabet yasağı olan bir yıldızı alırsan eski şirketi dava açabilir. Başarılı transfer rakibin teknolojisini zayıflatır, ilişkini bozar.</p></div></section>
  ${T.log.length?`<section class="panel"><div class="ph"><h2>Transfer geçmişi</h2></div><div class="pb small col" style="gap:4px">${T.log.map(l=>`<div><span class="muted num">${fmtDate(l.d)}</span> · ${esc(l.t)}</div>`).join('')}</div></section>`:''}`);
}

