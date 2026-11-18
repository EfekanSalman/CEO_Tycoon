/* ============================== TRAINING & INTERNSHIPS ============================== */
const COURSES={
  online:{n:(LANG_EN?"Online course":'Online kurs'),cost:2000,days:14,gain:0.3,xp:20,off:false,d:(LANG_EN?"Learns on the job: works at 50% efficiency for 14 days.":'Çalışırken öğrenir: 14 gün boyunca %50 verimle çalışır.')},
  cert:{n:(LANG_EN?"Certification program":'Sertifika programı'),cost:9000,days:20,gain:0.7,xp:60,off:true,d:(LANG_EN?"Away from work for 20 days; gains permanent skill.":'20 gün işten uzak kalır, kalıcı yetenek kazanır.')},
  conf:{n:(LANG_EN?"Industry conference":'Sektör konferansı'),cost:15000,days:5,gain:0.2,xp:20,off:true,mor:10,d:(LANG_EN?"5 days; morale +10. Marketers also give brand +0.5.":'5 gün; moral +10. Pazarlamacıysa marka +0,5.')},
  lead:{n:(LANG_EN?"Leadership training":'Liderlik eğitimi'),cost:20000,days:12,gain:0.2,xp:120,off:true,req:e=>(e.level||0)>=2,d:(LANG_EN?"Senior and above. Promotion XP +120; as a manager, team bonus is 25% stronger.":'Kıdemli ve üstü için. Terfi deneyimi +120; yönetici olunca ekip bonusu %25 daha güçlü.')},
};
const UNIS=[
  {id:'abu',n:(LANG_EN?"Anatolia University of Science":'Anadolu Bilim Üniversitesi'),roles:['soft','res','design'],tier:1,cost:20000,year:10000},
  {id:'etu',n:(LANG_EN?"Aegean University of Design and Technology":'Ege Tasarım ve Teknoloji Üniversitesi'),roles:['design','mkt','soft'],tier:1,cost:25000,year:12000},
  {id:'mtu',n:(LANG_EN?"Marmara Technical University":'Marmara Teknik Üniversitesi'),roles:['soft','hw','sec'],tier:2,cost:60000,year:30000},
  {id:'ate',n:(LANG_EN?"Ankara Institute of Technology":'Ankara Teknoloji Enstitüsü'),roles:['hw','res','sec'],tier:3,cost:150000,year:60000,minBrand:20},
];
const UNID=Object.fromEntries(UNIS.map(u=>[u.id,u]));
const courseGain=(e,k)=>COURSES[k].gain*clamp(1.3-e.skill/10,0.3,1);
function sendTrain(e,k){
  const C=COURSES[k];if(!e||!C||e.leave||e.train&&e.train.until>G.day||e.founder&&k==='lead')return false;
  if(C.req&&!C.req(e)){showToast((LANG_EN?"Must be at least Senior for this training.":'Bu eğitim için en az Kıdemli olmalı.'),'bad');return false;}
  const cost=C.cost*infl();if(G.cash<cost){showToast((LANG_EN?"Not enough cash for training.":'Eğitim için yeterli nakit yok.'),'bad');return false;}
  spend(cost,'other');
  if(C.off){e.leave={type:'train',until:G.day+C.days,k};if(e.proj&&typeof e.proj!=='string'){}}
  else e.train={k,until:G.day+C.days};
  news((LANG_EN?`${e.name} started ${C.n.toLocaleLowerCase(LOC)} (${C.days} days).`:`${e.name} için ${C.n.toLocaleLowerCase(LOC)} başladı (${C.days} gün).`));return true;
}
function finishTrain(e,k){
  const C=COURSES[k];if(!C)return;const before=e.skill,g=courseGain(e,k);
  e.skill=Math.min(10,Math.round((e.skill+g)*100)/100);e.xp=(e.xp||0)+C.xp;e.trainN=(e.trainN||0)+1;e.morale=Math.min(100,e.morale+5+(C.mor||0));
  if(k==='lead')e.leadT=true;if(k==='conf'&&e.role==='mkt')G.brand=clamp(G.brand+0.5,0,100);
  G.careerVer=(G.careerVer||0)+1;
  news((LANG_EN?`${e.name} is back from training (${C.n}): skill ${fx(before,1)} → ${fx(e.skill,1)}.`:`${e.name} eğitimden döndü (${C.n}): yetenek ${fx(before,1)} → ${fx(e.skill,1)}.`),'good');
}
function trainDaily(){for(const e of G.emps)if(e.train&&G.day>=e.train.until){const k=e.train.k;e.train=null;finishTrain(e,k);}
  for(const e of [...G.emps])if(e.intern&&G.day>=e.intern.until){G.emps=G.emps.filter(x=>x!==e);news((LANG_EN?`Intern ${e.name} finished the internship and left${e.skill>=4?` (skill ${fx(e.skill,1)}, could have been hired)`:''}.`:`Stajyer ${e.name} stajını bitirdi ve ayrıldı${e.skill>=4?` (yetenek ${fx(e.skill,1)}, kadroya alınabilirdi)`:''}.`),e.skill>=4?'bad':'mkt',e.skill>=4);if(UI.selEmp===e.id)UI.selEmp=null;}}
function genIntern(u){
  const tier=u?u.tier:0,c=genCand(),role=u?pick(u.roles):pick(['soft','design','hw','mkt','sup']);
  const sk=Math.round(clamp(rnd(1.5,3)+tier*0.5,1,6)*10)/10,pot=Math.round(clamp(rnd(4.5,6.5)+tier*1.1,4,9.5)*10)/10;
  Object.assign(c,{role,skill:sk,level:0,xp:rint(0,30),salary:Math.round(salaryFor(sk)*0.35/100)*100,internC:{uni:u?u.n:(LANG_EN?"General application":'Genel başvuru'),pot,exp:G.day+45}});
  return c;
}
function internSeason(){
  const m=dateOf(G.day).getMonth();if(m!==1&&m!==5)return;
  const list=[];for(let i=0;i<2;i++)list.push(genIntern(null));
  for(const id in G.unis||{}){const u=UNID[id];for(let i=0;i<2+u.tier;i++)list.push(genIntern(u));}
  G.internCands=list;
  news((LANG_EN?`${m===5?"Summer":"Winter"} internship season: ${list.length} intern candidates applied. Pick them in Team → Training & internships.`:`${m===5?'Yaz':'Kış'} stajı dönemi: ${list.length} stajyer adayı başvurdu. Ekip → Eğitim ve staj bölümünden seçebilirsin.`),'good',true);
}
function uniMonthly(){for(const id in G.unis||{}){const u=UNID[id];spend(u.year*infl()/12,'other');}
  G.internCands=(G.internCands||[]).filter(c=>c.internC.exp>G.day);internSeason();}
const potStars=p=>p>=8?'★★★':p>=6.5?'★★':'★';
function vTraining(){
  G.unis=G.unis||{};G.internCands=G.internCands||[];
  const tr=UI.tr||(UI.tr={eid:'',k:'cert'});
  const avail=G.emps.filter(e=>!e.leave&&!(e.train&&e.train.until>G.day)&&!e.intern);
  const sel=G.emps.find(e=>e.id===+tr.eid)||avail[0];const C=COURSES[tr.k];
  const ongoing=G.emps.filter(e=>e.leave&&e.leave.type==='train'||e.train&&e.train.until>G.day).map(e=>{const k=e.leave&&e.leave.type==='train'?e.leave.k:e.train.k,u=e.leave&&e.leave.type==='train'?e.leave.until:e.train.until;return (LANG_EN?`<li><span class="chip r-${e.role}">${esc(e.name)}</span><span>${COURSES[k].n} · ${u-G.day} days left</span></li>`:`<li><span class="chip r-${e.role}">${esc(e.name)}</span><span>${COURSES[k].n} · ${u-G.day} gün kaldı</span></li>`);}).join('');
  const interns=G.emps.filter(e=>e.intern).map(e=>(LANG_EN?`<tr><td><b>${esc(e.name)}</b><div class="small muted">${esc(e.intern.uni)}</div></td><td><span class="chip r-${e.role}">${ROLES[e.role].n}</span></td><td class="r num">${fx(e.skill,1)}</td><td><span class="stars">${potStars(e.intern.pot)}</span></td><td class="r num ${e.intern.until-G.day<15?'warn':''}">${e.intern.until-G.day} days</td><td class="r"><button class="btn sm primary" data-act="internhire" data-id="${e.id}">Hire full-time ${money(salaryFor(e.skill))}/mo</button></td></tr>`:`<tr><td><b>${esc(e.name)}</b><div class="small muted">${esc(e.intern.uni)}</div></td><td><span class="chip r-${e.role}">${ROLES[e.role].n}</span></td><td class="r num">${fx(e.skill,1)}</td><td><span class="stars">${potStars(e.intern.pot)}</span></td><td class="r num ${e.intern.until-G.day<15?'warn':''}">${e.intern.until-G.day} gün</td><td class="r"><button class="btn sm primary" data-act="internhire" data-id="${e.id}">Kadroya al ${money(salaryFor(e.skill))}/ay</button></td></tr>`)).join('');
  const cands=G.internCands.map(c=>(LANG_EN?`<div class="proj"><div class="row between"><b>${esc(c.name)}</b><span class="chip r-${c.role}">${ROLES[c.role].n}</span></div>
    <div class="small muted">${esc(c.internC.uni)}</div><div class="row between small"><span>Skill ${fx(c.skill,1)} · potential <span class="stars">${potStars(c.internC.pot)}</span></span><span>${money(c.salary)}/mo</span></div>
    <button class="btn sm" data-act="internpick" data-id="${c.id}" ${G.emps.length>=officeCap()?'disabled':''}>Take as intern (90 days)</button></div>`:`<div class="proj"><div class="row between"><b>${esc(c.name)}</b><span class="chip r-${c.role}">${ROLES[c.role].n}</span></div>
    <div class="small muted">${esc(c.internC.uni)}</div><div class="row between small"><span>Yetenek ${fx(c.skill,1)} · potansiyel <span class="stars">${potStars(c.internC.pot)}</span></span><span>${money(c.salary)}/ay</span></div>
    <button class="btn sm" data-act="internpick" data-id="${c.id}" ${G.emps.length>=officeCap()?'disabled':''}>Stajyer al (90 gün)</button></div>`)).join('');
  const unis=UNIS.map(u=>{const on=G.unis[u.id],lock=u.minBrand&&G.brand<u.minBrand;
    return (LANG_EN?`<div class="proj"><div class="row between"><b>${u.n}</b>${on?"<span class=\"chip st-ok\">Partner</span>":''}</div>
      <div class="small muted">Fields: ${u.roles.map(r=>ROLES[r].n).join(', ')} · ${2+u.tier} interns per season · potential ${potStars(5.5+u.tier*1.1)}</div>
      <div class="row between small"><span>${on?`${money(u.year*infl())}/year`:`Setup ${money(u.cost*infl())} + ${money(u.year*infl())}/year`}</span>${on?`<button class="btn sm ghost" data-act="uniend" data-u="${u.id}">End</button>`:`<button class="btn sm ${lock?'':'primary'}" data-act="unisign" data-u="${u.id}" ${lock||G.cash<u.cost*infl()?'disabled':''}>${lock?`Requires brand ${u.minBrand}+`:"Partner up"}</button>`}</div></div>`:`<div class="proj"><div class="row between"><b>${u.n}</b>${on?'<span class="chip st-ok">Ortak</span>':''}</div>
      <div class="small muted">Alanlar: ${u.roles.map(r=>ROLES[r].n).join(', ')} · dönem başına ${2+u.tier} stajyer · potansiyel ${potStars(5.5+u.tier*1.1)}</div>
      <div class="row between small"><span>${on?`Yıllık ${money(u.year*infl())}`:`Açılış ${money(u.cost*infl())} + yıllık ${money(u.year*infl())}`}</span>${on?`<button class="btn sm ghost" data-act="uniend" data-u="${u.id}">Bitir</button>`:`<button class="btn sm ${lock?'':'primary'}" data-act="unisign" data-u="${u.id}" ${lock||G.cash<u.cost*infl()?'disabled':''}>${lock?`Marka ${u.minBrand}+ gerekli`:'Ortaklık kur'}</button>`}</div></div>`);}).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Training</h2><span class="sub">${G.perks.learn?"Training budget active (+30% growth)":"The \"Training budget\" perk speeds up growth for the whole team"}</span></div><div class="pb col">
    <div class="form">
      <label class="f" for="tr-e">Employee<select id="tr-e" data-bind="tr.eid">${avail.map(e=>`<option value="${e.id}" ${sel&&sel.id===e.id?'selected':''}>${esc(e.name)} · ${ROLES[e.role].n} · ${fx(e.skill,1)}</option>`).join('')||"<option>No eligible employees</option>"}</select></label>
      <label class="f" for="tr-k">Training<select id="tr-k" data-bind="tr.k">${Object.entries(COURSES).map(([k,x])=>`<option value="${k}" ${tr.k===k?'selected':''}>${x.n} · ${money(x.cost*infl())} · ${x.days} days</option>`).join('')}</select></label>
    </div>
    ${sel?`<div class="row between"><span class="small">${C.d} ${sel?`Expected gain: skill +${fx(courseGain(sel,tr.k),2)}${C.req&&!C.req(sel)?" <span class=\"neg\">(Must be Senior)</span>":''}`:''}</span><button class="btn sm primary" data-act="trainsend" ${G.cash<C.cost*infl()||C.req&&!C.req(sel)?'disabled':''}>Send to training</button></div>`:''}
    ${ongoing?`<ul class="alerts">${ongoing}</ul>`:''}
  </div></section>
  <section class="panel"><div class="ph"><h2>Internship program</h2><span class="sub">New intern candidates arrive in February and June · interns learn fast and earn little</span></div><div class="pb col">
    <div class="grid">${unis}</div>
    ${cands?`<div class="small"><b>Intern candidates</b> <span class="muted">· choose within 45 days</span></div><div class="grid3">${cands}</div>`:''}
    ${interns?`<div class="tw"><table><thead><tr><th>Intern</th><th>Role</th><th class="r">Skill</th><th>Potential</th><th class="r">Left</th><th></th></tr></thead><tbody>${interns}</tbody></table></div>`:"<div class=\"small muted\">You have no interns right now.</div>"}
    <p class="small muted">Interns work for 90 days and grow quickly toward their potential each month. Hire them before the internship ends and they'll be very loyal; otherwise they leave.</p>
  </div></section>`:`<section class="panel"><div class="ph"><h2>Eğitim</h2><span class="sub">${G.perks.learn?'Eğitim bütçesi aktif (+%30 gelişim)':'Yan haklardan "Eğitim bütçesi" tüm ekibin gelişimini hızlandırır'}</span></div><div class="pb col">
    <div class="form">
      <label class="f" for="tr-e">Çalışan<select id="tr-e" data-bind="tr.eid">${avail.map(e=>`<option value="${e.id}" ${sel&&sel.id===e.id?'selected':''}>${esc(e.name)} · ${ROLES[e.role].n} · ${fx(e.skill,1)}</option>`).join('')||'<option>Uygun çalışan yok</option>'}</select></label>
      <label class="f" for="tr-k">Eğitim<select id="tr-k" data-bind="tr.k">${Object.entries(COURSES).map(([k,x])=>`<option value="${k}" ${tr.k===k?'selected':''}>${x.n} · ${money(x.cost*infl())} · ${x.days} gün</option>`).join('')}</select></label>
    </div>
    ${sel?`<div class="row between"><span class="small">${C.d} ${sel?`Tahmini kazanç: yetenek +${fx(courseGain(sel,tr.k),2)}${C.req&&!C.req(sel)?' <span class="neg">(Kıdemli olmalı)</span>':''}`:''}</span><button class="btn sm primary" data-act="trainsend" ${G.cash<C.cost*infl()||C.req&&!C.req(sel)?'disabled':''}>Eğitime gönder</button></div>`:''}
    ${ongoing?`<ul class="alerts">${ongoing}</ul>`:''}
  </div></section>
  <section class="panel"><div class="ph"><h2>Staj programı</h2><span class="sub">Şubat ve Haziran'da yeni stajyer adayları gelir · stajyerler hızlı öğrenir, maaşları düşüktür</span></div><div class="pb col">
    <div class="grid">${unis}</div>
    ${cands?`<div class="small"><b>Stajyer adayları</b> <span class="muted">· 45 gün içinde seç</span></div><div class="grid3">${cands}</div>`:''}
    ${interns?`<div class="tw"><table><thead><tr><th>Stajyer</th><th>Rol</th><th class="r">Yetenek</th><th>Potansiyel</th><th class="r">Kalan</th><th></th></tr></thead><tbody>${interns}</tbody></table></div>`:'<div class="small muted">Şu an stajyerin yok.</div>'}
    <p class="small muted">Stajyerler 90 gün çalışır, her ay potansiyellerine doğru hızla gelişir. Staj bitmeden kadroya alırsan sadakatleri yüksek olur; almazsan ayrılırlar.</p>
  </div></section>`);
}


