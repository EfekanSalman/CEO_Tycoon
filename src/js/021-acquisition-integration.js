/* ============================== ACQUISITION INTEGRATION ============================== */
const CULT={
  comp:{n:(LANG_EN?"Competitive":'Rekabetçi'),d:(LANG_EN?"Loves a fast pace; gets bored when it's relaxed.":'Yoğun tempoyu sever, rahat tempoda sıkılır.')},
  chill:{n:(LANG_EN?"Relaxed":'Rahat'),d:(LANG_EN?"Loves a relaxed pace and flexibility; hates crunch.":'Rahat tempo ve esnek çalışmayı sever, yoğun tempodan nefret eder.')},
  eng:{n:(LANG_EN?"Engineering":'Mühendislik'),d:(LANG_EN?"Loves a training budget and an R&D-focused environment.":'Eğitim bütçesi ve Ar-Ge odaklı ortamı sever.')},
  corp:{n:(LANG_EN?"Enterprise":'Kurumsal'),d:(LANG_EN?"Expects perks like meals and health insurance.":'Yemek ve sağlık sigortası gibi yan hakları bekler.')},
};
function cultureOf(c){return c.emp>800?'corp':c.aggr>0.65?'comp':c.aggr<0.4?'chill':'eng';}
function cultureFit(k){
  if(k==='comp')return G.pace==='crunch'?6:G.pace==='relax'?-6:1;
  if(k==='chill')return (G.pace==='relax'?5:G.pace==='crunch'?-8:0)+(G.perks.flex?3:0);
  if(k==='eng')return (G.perks.learn?6:-2)+(G.furn&&G.furn.some(f=>f.t==='r_res')?2:0);
  return (G.perks.food?3:-3)+(G.perks.health?3:-3);
}
function startAcq(c,prodIds){
  const id=nid(),nk=clamp(Math.round(Math.sqrt(c.emp)/3),3,10),keys=[];
  for(let i=0;i<nk;i++){const k=genCand();const sk=clamp(Math.round((4+(c.tech-1)*10+c.brand/30+rnd(0,3))*10)/10,3,9.6),lv=levelFor(sk);
    Object.assign(k,{role:rivalRole(c,Math.random()),skill:sk,level:lv,xp:XP_REQ[lv]+rint(0,80),salary:Math.round(salaryFor(sk)*(1+0.12*lv)*1.1/100)*100});keys.push(k);}
  const a={id,name:c.name,pfx:c.pfx,tech:c.tech,culture:cultureOf(c),day:G.day,deadline:G.day+60,keys,rem:Math.max(0,c.emp-nk),mode:null,div:0,refresh:{}};
  for(const pid of prodIds){const p=prod(pid);if(p)p.acqId=id;}
  G.acqs.push(a);
  for(const e of G.emps)if(!e.founder)e.morale=Math.max(0,e.morale-3);
  news((LANG_EN?`The ${c.name} team is waiting on you: ${nk} key employees and a ${num(a.rem)}-person workforce. Decide within 60 days in Team → Acquired teams.`:`${c.name} ekibi seni bekliyor: ${nk} kilit çalışan ve ${num(a.rem)} kişilik iş gücü. 60 gün içinde Ekip → Devralınan ekipler bölümünden kararını ver.`),'mkt',true);
}
const acqSev=a=>a.rem*6000*infl();
const divCost=a=>a.div*2500*infl();
const divCostAll=()=>(G.acqs||[]).reduce((s,a)=>s+(a.mode==='div'?divCost(a):0),0);
const divRP=()=>(G.acqs||[]).reduce((s,a)=>s+(a.mode==='div'?a.div*0.08*a.tech:0),0);
function nextName(n){const m=n.match(/^(.*?)(\d+)$/);return m?m[1]+(+m[2]+1):n+' 2';}
function acqMonthly(){
  for(const a of [...(G.acqs||[])]){
    if(a.mode==='div'&&a.div>0){spend(divCost(a),'salary');
      const mineA=G.products.filter(p=>p.active&&p.owner==='P'&&p.acqId===a.id),cats=[...new Set(mineA.map(p=>p.cat))];
      for(const cat of cats){const grp=mineA.filter(p=>p.cat===cat).sort((x,y)=>y.score-x.score),p=grp[0];
        if(p.score/S(p.cat)<0.85&&G.day-(a.refresh[p.cat]||a.day)>150){a.refresh[p.cat]=G.day;for(const o of grp.slice(1))o.active=false;
          const v=a.tech*rnd(0.95,1.1),ref=CATS[p.cat].ref;
          const np={...p,id:nid(),name:(()=>{let n=nextName(p.name);while(G.products.some(q=>q.name===n))n=nextName(n);return n;})(),score:S(p.cat)*v,launch:G.day,units:0,share:0,total:0,camp:0,h:[],ru:{},hype:null,inj:0,priceLock:0,review:clamp(Math.round((5.5+(v-1)*10+rnd(-0.5,0.5))*10)/10,1,10),bugs:2,tix:0,sat:72};
          if(ref>0)np.price=roundP(p.cat,ref*Math.pow(v,1.2));
          p.active=false;G.products.push(np);news((LANG_EN?`The ${a.name} division released ${np.name} (the old version was retired).`:`${a.name} bölümün ${np.name} sürümünü çıkardı (eski sürüm emekliye ayrıldı).`),'good');}}}
    if(a.mode===null&&G.day>=a.deadline){
      const left=a.keys.length;a.keys=[];
      if(a.rem>0){const sev=acqSev(a);spend(sev,'other');G.layoff+=Math.min(25,a.rem/40);news((LANG_EN?`No decision was made on ${a.name}, so ${num(a.rem)} people were laid off with severance (${money(sev)})${left?` and ${left} key employees moved to other companies`:''}.`:`${a.name} için karar verilmediğinden ${num(a.rem)} kişi tazminatla (${money(sev)}) çıkarıldı${left?` ve ${left} kilit çalışan başka şirketlere geçti`:''}.`),'bad',true);a.rem=0;}
      a.mode='cut';
    }
    if(a.keys.length&&G.day>=a.deadline){news((LANG_EN?`${a.keys.length} key employees from ${a.name} got tired of waiting and left.`:`${a.name} kilit çalışanlarından ${a.keys.length} kişi beklemekten sıkılıp ayrıldı.`),'bad');a.keys=[];}
    const integ=G.emps.filter(e=>e.acqFrom&&e.acqFrom.id===a.id&&e.acqFrom.until>G.day);
    if(integ.length&&Math.random()<0.2){const x=pick(integ),y=pick(G.emps.filter(e=>!e.acqFrom&&e.role===x.role&&!e.founder))||null;
      if(y){x.morale=Math.max(0,x.morale-6);y.morale=Math.max(0,y.morale-6);news((LANG_EN?`"That's not how we did it back in the day" tension between ${x.name} (formerly ${a.name}) and ${y.name}. Both lost morale.`:`${x.name} (eski ${a.name}) ile ${y.name} arasında "bizim zamanımızda böyle yapılmazdı" gerginliği. İkisinin de morali düştü.`),'bad');}}
    if(a.mode!==null&&!a.keys.length&&a.div===0&&!integ.length&&G.day>a.day+200)G.acqs=G.acqs.filter(x=>x!==a);
  }
}
function vAcq(){
  if(!G.acqs||!G.acqs.length)return '';
  return G.acqs.map(a=>{const C=CULT[a.culture],fit=cultureFit(a.culture),integ=G.emps.filter(e=>e.acqFrom&&e.acqFrom.id===a.id);
    const keys=a.keys.map(k=>{const bonus=k.salary*3;return (LANG_EN?`<div class="proj"><div class="row between"><b>${esc(k.name)}</b><span class="chip r-${k.role}">${ROLES[k.role].n}</span></div>
      <div class="small muted">${LEVELS[k.level||0]} · skill ${fx(k.skill,1)} · ${money(k.salary)}/mo</div>
      <div class="row">${traitChips(k)}</div>
      <div class="row"><button class="btn sm primary" data-act="acqkeep" data-a="${a.id}" data-id="${k.id}" ${G.emps.length>=officeCap()?'disabled':''}>Keep on staff</button><button class="btn sm" data-act="acqkeep" data-a="${a.id}" data-id="${k.id}" data-b="1" ${G.emps.length>=officeCap()||G.cash<bonus?'disabled':''} title="Retention bonus of 3 salaries: morale +15, loyalty">Keep with bonus ${money(bonus)}</button><button class="btn sm ghost" data-act="acqdrop" data-a="${a.id}" data-id="${k.id}">Let go</button></div></div>`:`<div class="proj"><div class="row between"><b>${esc(k.name)}</b><span class="chip r-${k.role}">${ROLES[k.role].n}</span></div>
      <div class="small muted">${LEVELS[k.level||0]} · yetenek ${fx(k.skill,1)} · ${money(k.salary)}/ay</div>
      <div class="row">${traitChips(k)}</div>
      <div class="row"><button class="btn sm primary" data-act="acqkeep" data-a="${a.id}" data-id="${k.id}" ${G.emps.length>=officeCap()?'disabled':''}>Kadroya al</button><button class="btn sm" data-act="acqkeep" data-a="${a.id}" data-id="${k.id}" data-b="1" ${G.emps.length>=officeCap()||G.cash<bonus?'disabled':''} title="3 maaş tutma primi: moral +15, sadakat">Primle al ${money(bonus)}</button><button class="btn sm ghost" data-act="acqdrop" data-a="${a.id}" data-id="${k.id}">Bırak</button></div></div>`);}).join('');
    const rem=a.mode===null&&a.rem>0?(LANG_EN?`<div class="row between" style="border-top:1px solid var(--line);padding-top:8px"><span>Remaining workforce: <b>${num(a.rem)} people</b></span><span class="row">
        <button class="btn sm" data-act="acqdiv" data-a="${a.id}">Keep as a division (${money(a.rem*2500*infl())}/mo)</button>
        <button class="btn sm danger" data-act="acqcut" data-a="${a.id}" ${G.cash<acqSev(a)?'disabled':''}>Lay off (${money(acqSev(a))} severance)</button></span></div>
        <p class="small muted">As a division, this team refreshes acquired products with new versions as they age and adds ~${fx(a.rem*0.08*a.tech,1)} RP/day to research. Mass layoffs shake your team's morale and hurt the brand.</p>`:`<div class="row between" style="border-top:1px solid var(--line);padding-top:8px"><span>Kalan iş gücü: <b>${num(a.rem)} kişi</b></span><span class="row">
        <button class="btn sm" data-act="acqdiv" data-a="${a.id}">Bölüm olarak tut (${money(a.rem*2500*infl())}/ay)</button>
        <button class="btn sm danger" data-act="acqcut" data-a="${a.id}" ${G.cash<acqSev(a)?'disabled':''}>Çıkar (${money(acqSev(a))} tazminat)</button></span></div>
        <p class="small muted">Bölüm olarak tutarsan bu ekip devralınan ürünleri eskidikçe yeni sürümle yeniler ve araştırmaya günde ~${fx(a.rem*0.08*a.tech,1)} AP katar. Toplu çıkarma ekibinin moralini sarsar ve markaya zarar verir.</p>`):'';
    const div=a.mode==='div'&&a.div>0?(LANG_EN?`<div class="row between" style="border-top:1px solid var(--line);padding-top:8px"><span><b>${esc(a.name)} division</b> · ${num(a.div)} people · ${money(divCost(a))}/mo · ${fx(a.div*0.08*a.tech,1)} RP/day · manages ${G.products.filter(p=>p.active&&p.owner==='P'&&p.acqId===a.id).length} products</span><button class="btn sm ghost" data-act="acqdivend" data-a="${a.id}">Close division (${money(a.div*6000*infl())})</button></div>`:`<div class="row between" style="border-top:1px solid var(--line);padding-top:8px"><span><b>${esc(a.name)} bölümü</b> · ${num(a.div)} kişi · ${money(divCost(a))}/ay · ${fx(a.div*0.08*a.tech,1)} AP/gün · ${G.products.filter(p=>p.active&&p.owner==='P'&&p.acqId===a.id).length} ürünü yönetiyor</span><button class="btn sm ghost" data-act="acqdivend" data-a="${a.id}">Bölümü kapat (${money(a.div*6000*infl())})</button></div>`):'';
    return (LANG_EN?`<section class="panel"><div class="ph"><h2>Acquired team: ${esc(a.name)}</h2><span class="sub">${fmtDate(a.day)} · culture <b>${C.n}</b>${a.mode===null?` · ${Math.max(0,a.deadline-G.day)} days to decide`:''}</span></div><div class="pb col">
      <div class="small">Culture: ${C.d} Fit with your current setup: <b class="${fit>0?'pos':fit<0?'neg':''}">${fit>0?'+':''}${fit} morale</b>${integ.length?` · ${integ.length} people integrating`:''}</div>
      ${keys?`<div class="small"><b>Key employees</b> <span class="muted">· those you keep carry their old company culture for 6 months</span></div><div class="grid3">${keys}</div>`:''}
      ${rem}${div}
    </div></section>`:`<section class="panel"><div class="ph"><h2>Devralınan ekip: ${esc(a.name)}</h2><span class="sub">${fmtDate(a.day)} · kültür <b>${C.n}</b>${a.mode===null?` · karar için ${Math.max(0,a.deadline-G.day)} gün`:''}</span></div><div class="pb col">
      <div class="small">Kültür: ${C.d} Şu anki düzeninle uyum: <b class="${fit>0?'pos':fit<0?'neg':''}">${fit>0?'+':''}${fit} moral</b>${integ.length?` · ${integ.length} kişi entegre oluyor`:''}</div>
      ${keys?`<div class="small"><b>Kilit çalışanlar</b> <span class="muted">· kadroya alınanlar 6 ay boyunca eski şirket kültürünü taşır</span></div><div class="grid3">${keys}</div>`:''}
      ${rem}${div}
    </div></section>`);}).join('');
}


