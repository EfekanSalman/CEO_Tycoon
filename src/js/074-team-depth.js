/* ============================== TEAM DEPTH ============================== */
/* Uzmanlık (ürün nitelikleriyle bağlantılı), açık mentorluk, maaş pazarlığı, kariyer hedefleri, kilit çalışan ve takım kimyası.
   Hepsi yeni alanlarla çalışır (e.spec, e.mentor, e.goal, e.ret, e.raiseAt); eski kayıtlar ve bot etkilenmez. */
const SPEC_OF={soft:['perf','ux','feat','sec','rel'],design:['ux','design'],hw:['perf','design','eff','dur','cost','heat']};
const SPEC_CD=180,RET_DAYS=730,MENTEE_MAX=2;
const specOk=e=>!!SPEC_OF[e.role]&&!e.intern&&((e.level||0)>=1||e.founder);
const prFocus=pr=>pr&&pr.d&&pr.d.focus?pr.d.focus:null;
function specMult(e,pr){if(!e.spec)return 1;const f=prFocus(pr);if(!f||f[e.spec]==null)return 1;const v=f[e.spec];return v>=3?1+0.05*(v-2):v<=1?0.97:1;}
// mentorluk
const TD={key:'',mn:{},key2:''};
const TDK={d:-1,n:-1,c:-1,s:''};
function tdKey(){const c=G.careerVer||0;if(TDK.d!==G.day||TDK.n!==G.emps.length||TDK.c!==c){TDK.d=G.day;TDK.n=G.emps.length;TDK.c=c;TDK.s=G.day+'|'+G.emps.length+'|'+c;}return TDK.s;}
function menteesOf(m){const k=tdKey();if(TD.key!==k){TD.key=k;TD.mn={};for(const e of G.emps)if(e.mentor){(TD.mn[e.mentor]=TD.mn[e.mentor]||[]).push(e);}}return TD.mn[m.id]||[];}
/* çalışan kimlik dizini: dizi, uzunluk ya da gün değişince yeniden kurulur (find ile aynı ilk eşleşme) */
const EMI={a:null,n:-1,m:null,d:-1};
const empById=id=>{if(EMI.d!==G.day){EMI.d=G.day;EMI.a=null;}return idIndex(EMI,G.emps).get(id);};
function mentorOf(e){if(!e||!e.mentor)return null;const m=empById(e.mentor);return m&&!m.leave&&m.role===e.role?m:null;}
const canMentor=m=>!m.intern&&((m.level||0)>=2||m.mgr||(m.founder&&m.skill>=7));
const mentorCands=e=>(e.level||0)>=2||e.founder||e.intern?[]:G.emps.filter(m=>m!==e&&m.role===e.role&&canMentor(m)&&(menteesOf(m).length<MENTEE_MAX||e.mentor===m.id));
// takım kimyası
const CHEM={key:'',m:{}};
function chemOf(pr){const k=tdKey();if(CHEM.key!==k){CHEM.key=k;CHEM.m={};}if(CHEM.m[pr.id])return CHEM.m[pr.id];
  const T=G.emps.filter(e=>e.proj===pr.id&&!e.leave),why=[];let v=0;
  if(T.length>=2){const n=t=>T.filter(e=>hasT(e,t)).length,tox=T.filter(isToxic).length;
    if(n('helper')){const x=Math.min(0.04,0.02*n('helper'));v+=x;why.push([(LANG_EN?"Helpful team members":'Yardımsever ekip üyeleri'),x]);}
    if(n('leader')){v+=0.03;why.push([(LANG_EN?"Has a natural leader":'Lider ruhlu biri var'),0.03]);}
    if(n('social')>=2){v+=0.02;why.push([(LANG_EN?"Social and close-knit":'Sosyal ve kaynaşmış'),0.02]);}
    if(T.some(e=>(e.level||0)>=2||e.founder)&&T.some(e=>!(e.level||0)&&!e.founder)){v+=0.02;why.push([(LANG_EN?"Senior–junior mix":'Kıdemli ve genç karışımı'),0.02]);}
    if(T.some(e=>mentorOf(e)&&T.includes(mentorOf(e)))){v+=0.02;why.push([(LANG_EN?"Mentor and mentee on the same project":'Mentor ve öğrencisi aynı projede'),0.02]);}
    if(tox){const x=-Math.min(0.08,0.04*tox);v+=x;why.push([(LANG_EN?"A troublemaker on the team":'Kavgacı bir ekip üyesi'),x]);}
    if(n('fast')&&n('lazy')){v-=0.02;why.push([(LANG_EN?"Friction between hard worker and slacker":'Çalışkan ile tembel arasında sürtüşme'),-0.02]);}
    if(n('perf')&&n('careless')){v-=0.02;why.push([(LANG_EN?"Perfectionist and sloppy don't get along":'Mükemmeliyetçi ile dağınık anlaşamıyor'),-0.02]);}
    if(T.length>10){const x=-Math.min(0.05,0.01*(T.length-10));v+=x;why.push([(LANG_EN?"Crowded team, hard to coordinate":'Kalabalık ekip, koordinasyon zor'),x]);}}
  return CHEM.m[pr.id]={v:clamp(v,-0.1,0.1),why,n:T.length};}
function teamMult(e,pr){return specMult(e,pr)*(1+chemOf(pr).v)*(1-0.03*menteesOf(e).length);}
function chemTag(pr){const c=chemOf(pr);if(c.n<2||!c.why.length)return '';const p=Math.round(c.v*100);
  return (LANG_EN?` · <span class="${p>0?'pos':p<0?'neg':'muted'}" title="${esc(c.why.map(([t,x])=>`${t} ${x>0?'+':'−'}${pctN(Math.abs(Math.round(x*100)))}`).join(' · '))}">chemistry ${p>0?'+':p<0?'−':''}${pctN(Math.abs(p))}</span>`:` · <span class="${p>0?'pos':p<0?'neg':'muted'}" title="${esc(c.why.map(([t,x])=>`${t} ${x>0?'+':'−'}${pctN(Math.abs(Math.round(x*100)))}`).join(' · '))}">uyum ${p>0?'+':p<0?'−':''}${pctN(Math.abs(p))}</span>`);}
// uzmanlar ürünün güçlü yanlarını basına daha iyi anlatır: odak ≥3 olan nitelikte payı yüksekse alt puan artar
function specCredit(pr,e,add){if(e.spec)(pr.spx=pr.spx||{})[e.spec]=(pr.spx[e.spec]||0)+add;}
function specFinish(pr,p){const f=prFocus(pr);if(!f||!pr.spx||!pr.pts)return;const B={};let s=0;
  for(const a of faSet(p.cat)){if((f[a]||0)<3||!pr.spx[a])continue;const b=Math.round(0.6*Math.min(1,pr.spx[a]/pr.pts/0.3)*10)/10;if(b>0){B[a]=b;s+=b;}}
  if(s){p.specB=B;p.review=clamp(Math.round((p.review+s/faSet(p.cat).length)*10)/10,1,10);}}
// kilit çalışan
/* rol özeti (kişi sayısı, toplam yetenek, yetenek listesi) anahtar başına bir kez; eskiden her çalışan için tüm kadro taranıyordu */
const KP={key:'',m:{},r:{}};
function keyP(e){if(!e||e.founder||e.intern||e.leave)return false;const k=tdKey();if(KP.key!==k){KP.key=k;KP.m={};KP.r={};}
  if(KP.m[e.id]!=null)return KP.m[e.id];let R=KP.r[e.role];
  if(!R){const L=G.emps.filter(o=>o.role===e.role&&!o.leave);R=KP.r[e.role]={n:L.length,tot:L.reduce((a,o)=>a+o.skill,0),sk:L.map(o=>o.skill)};}
  let above=0;for(const s of R.sk)if(s>e.skill&&++above>=2)break;
  return KP.m[e.id]=(e.skill>=8.5&&above<2)||(R.n>=3&&e.skill/Math.max(1,R.tot)>=0.35&&e.skill>=6);}
const retOn=e=>!!(e.ret&&e.ret.until>G.day);
const retCost=e=>Math.round(e.salary*4/1000)*1000;
const keyRisk=e=>retOn(e)?0.3:keyP(e)?1.2:1;
// kariyer hedefleri
const GOALS={
  lead:{n:(LANG_EN?"Being a manager":'Yönetici olmak'),ok:e=>!!e.mgr||(e.level||0)>=3,can:e=>(e.level||0)>=1&&!e.mgr},
  mentor:{n:(LANG_EN?"Mentor someone":'Birine mentorluk etmek'),ok:e=>menteesOf(e).length>0,can:e=>canMentor(e)},
  learn:{n:(LANG_EN?"Get training":'Eğitim almak'),ok:e=>(e.trainN||0)>(e.goal.t0||0),can:()=>true},
  spec:{n:(LANG_EN?"Specialize in a field":'Bir alanda uzmanlaşmak'),ok:e=>!!e.spec,can:e=>!!SPEC_OF[e.role]&&!e.spec},
  cat:{n:'',ok:e=>{const pr=G.projects.find(p=>p.id===e.proj);return !!pr&&pr.cat===e.goal.c;},can:e=>!!SPEC_OF[e.role]},
  hit:{n:(LANG_EN?"Ship an acclaimed product":'Övgü alan bir ürün çıkarmak'),ok:e=>G.products.some(p=>p.owner==='P'&&p.launch>=e.goal.at&&(p.review||0)>=8),can:e=>!!SPEC_OF[e.role]||e.role==='mkt'},
  pay:{n:(LANG_EN?"Above-market salary":'Piyasanın üstünde maaş'),ok:e=>e.salary>=marketSal(e)*1.05,can:()=>true}};
const goalName=g=>g.k==='cat'?(LANG_EN?`Work on a ${CATS[g.c]?CATS[g.c].n:g.c} project`:`${CATS[g.c]?CATS[g.c].n:g.c} projesinde çalışmak`):GOALS[g.k].n;
function goalPick(e){const w=[];const add=(k,n)=>{if(GOALS[k].can(e))for(let i=0;i<n;i++)w.push(k);};
  add('lead',hasT(e,'ambit')?4:1);add('mentor',hasT(e,'helper')||hasT(e,'leader')?3:1);add('learn',hasT(e,'learner')?4:1);add('spec',hasT(e,'perf')?3:1);
  add('pay',hasT(e,'merc')?5:1);add('hit',hasT(e,'creative')?3:1);
  const cats=[...new Set([...myActive().map(p=>p.cat),...G.projects.map(p=>p.cat),...CAT_ORDER.filter(c=>catUnlocked(c)&&!CATS[c].ref)])].filter(c=>CATS[c]);
  if(cats.length&&SPEC_OF[e.role])add('cat',2);if(!w.length)return null;const k=pick(w);const g={k,at:G.day};if(k==='cat')g.c=pick(cats);if(k==='learn')g.t0=e.trainN||0;return g;}
function cgState(e){const g=e.goal;if(!g)return null;if(g.ok)return G.day-g.ok<365?'done':'old';return G.day-g.at>365?'late':'open';}
function teamDrivers(e,d){if(e.founder)return;
  if(mentorOf(e))d.push([(LANG_EN?`Mentor: ${mentorOf(e).name}`:`Mentoru: ${mentorOf(e).name}`),3]);
  if(menteesOf(e).length)d.push([(LANG_EN?"Mentoring someone":'Mentorluk yapıyor'),2]);
  const s=cgState(e);if(s==='done')d.push([(LANG_EN?"Reached career goal":'Kariyer hedefine ulaştı'),4]);else if(s==='late')d.push([(LANG_EN?"Career goal neglected":'Kariyer hedefi ihmal ediliyor'),-3]);
  if(retOn(e))d.push([(LANG_EN?"Retention bonus":'Tutma primi'),4]);}
// maaş pazarlığı
function teamMonthly(){
  for(const e of G.emps){if(e.founder||e.intern)continue;
    if(e.mentor&&!mentorOf(e))e.mentor=null;
    if(e.mentor&&(e.level||0)>=2){e.mentor=null;news((LANG_EN?`${e.name} no longer needs a mentor.`:`${e.name} artık mentora ihtiyaç duymuyor.`),'good');}
    if(!e.goal&&G.day-(e.hiredAt||0)>=60)e.goal=goalPick(e);
    else if(e.goal){const g=e.goal,s=cgState(e);
      if(s==='old'||(!g.ok&&G.day-g.at>540))e.goal=goalPick(e);
      else if(!g.ok&&GOALS[g.k]&&GOALS[g.k].ok(e)){g.ok=G.day;e.morale=clamp(e.morale+8,0,100);e.xp=(e.xp||0)+20;news((LANG_EN?`${e.name} reached a career goal: ${goalName(g)}.`:`${e.name} kariyer hedefine ulaştı: ${goalName(g)}.`),'good');}
      else if(!g.ok&&GOALS[g.k]&&!GOALS[g.k].can(e)&&g.k!=='cat'&&g.k!=='hit'&&g.k!=='learn'&&g.k!=='pay')e.goal=goalPick(e);}}
  if(G.rrq)return;
  const L=G.emps.filter(e=>!e.founder&&!e.intern&&!e.leave&&e.salary<marketSal(e)*0.88&&e.morale<70&&G.day-(e.raiseAt||e.hiredAt||0)>240);
  for(const e of L){if(Math.random()>=0.25)continue;e.raiseAt=G.day;
    G.rrq={id:e.id,ask:Math.max(e.salary+100,Math.round(marketSal(e)*rnd(0.97,1.05)/100)*100)};break;}
}
// talep ay sonu zincirinin ortasında açılmasın diye ertesi gün sorulur (bekleyen karar diğer aylık sistemleri durdurur)
function teamDaily(){if(!G.rrq||G.pending||G.over)return;const q=G.rrq;G.rrq=null;if(G.emps.some(e=>e.id===q.id))triggerChoice('raisereq',q);}
const RAISEREQ={id:'raisereq',w:0,choice:true,cond:()=>false,
  view:d=>{const e=G.emps.find(x=>x.id===d.id);if(!e)return {t:(LANG_EN?"Raise request":'Zam talebi'),b:(LANG_EN?"The employee is no longer with the company.":'Çalışan artık şirkette değil.'),o:[{t:(LANG_EN?"Done":'Tamam'),d:''}]};
    const mid=Math.round((e.salary+d.ask)/2/100)*100,ch=Math.round(clamp(0.6+(hasT(e,'loyal')?0.2:0)-(hasT(e,'merc')?0.2:0),0.2,0.9)*100);
    return {t:(LANG_EN?`${e.name} wants a raise`:`${e.name} zam istiyor`),b:(LANG_EN?`${e.name} (${ROLES[e.role].n}, skill ${fx(e.skill,1)}) says their salary has fallen behind the market. They make ${money(e.salary)}/mo now and want ${money(d.ask)}/mo (market ${money(marketSal(e))}).${keyP(e)?" One of the key people on their team.":''}`:`${e.name} (${ROLES[e.role].n}, yetenek ${fx(e.skill,1)}) maaşının piyasanın gerisinde kaldığını söylüyor. Şu an ${money(e.salary)}/ay alıyor, ${money(d.ask)}/ay istiyor (piyasa ${money(marketSal(e))}).${keyP(e)?' Ekibinin kilit isimlerinden biri.':''}`),
      o:[{t:(LANG_EN?`Accept (${money(d.ask)}/mo)`:`Kabul et (${money(d.ask)}/ay)`),d:(LANG_EN?"Morale +12.":'Moral +12.')},{t:(LANG_EN?`Counter-offer (${money(mid)}/mo)`:`Karşı teklif ver (${money(mid)}/ay)`),d:(LANG_EN?`${ch}% chance they accept; if not, morale −8.`:`Kabul etme ihtimali %${ch}; reddederse moral −8.`)},{t:(LANG_EN?"Decline":'Reddet'),d:(LANG_EN?`Morale −15${hasT(e,'merc')||keyP(e)?"; 30% chance they leave for a rival":''}.`:`Moral −15${hasT(e,'merc')||keyP(e)?'; rakibe geçme ihtimali %30':''}.`)}]};},
  pick(d,i){const e=G.emps.find(x=>x.id===d.id);if(!e)return;
    if(i===0){e.salary=d.ask;e.morale=clamp(e.morale+12,0,100);news((LANG_EN?`${e.name} got the raise: ${money(e.salary)}/mo.`:`${e.name} zammı aldı: ${money(e.salary)}/ay.`),'good');}
    else if(i===1){const mid=Math.round((e.salary+d.ask)/2/100)*100,ch=clamp(0.6+(hasT(e,'loyal')?0.2:0)-(hasT(e,'merc')?0.2:0),0.2,0.9);
      if(Math.random()<ch){e.salary=mid;e.morale=clamp(e.morale+4,0,100);news((LANG_EN?`${e.name} accepted the counter-offer: ${money(mid)}/mo.`:`${e.name} karşı teklifi kabul etti: ${money(mid)}/ay.`),'');}
      else{e.morale=clamp(e.morale-8,0,100);news((LANG_EN?`${e.name} didn't like the counter-offer.`:`${e.name} karşı teklifi beğenmedi.`),'bad');}}
    else{e.morale=clamp(e.morale-15,0,100);
      if((hasT(e,'merc')||keyP(e))&&Math.random()<0.3){const c=liveComps().length?pick(liveComps()):null;twLeave(e,c,(LANG_EN?", denied a raise,":' zam alamayınca'));}
      else news((LANG_EN?`${e.name}'s raise request was turned down; they're disappointed.`:`${e.name} zam talebi reddedildi; hayal kırıklığına uğradı.`),'bad');}
    G.careerVer=(G.careerVer||0)+1;}};
EVENTS.push(RAISEREQ);EVD.raisereq=RAISEREQ;IB_CFG.raisereq={days:10,def:1};SIMPLE_EV.push('raisereq');
// UI: çalışan kartındaki Kariyer bölümü
function vEmpCareer(e){if(e.founder&&!canMentor(e))return '';const rows=[];
  if(SPEC_OF[e.role]){
    if(!specOk(e))rows.push((LANG_EN?`<div><b>Specialization</b> <span class="muted">Chosen once they become senior (level 1).</span></div>`:`<div><b>Uzmanlık</b> <span class="muted">Kıdemli olunca (1. kademe) seçilir.</span></div>`));
    else{const cd=e.specAt!=null&&G.day-e.specAt<SPEC_CD;
      rows.push((LANG_EN?`<div><b>Specialization</b> ${e.spec?`<span class="chip st-ok">${esc(FA[e.spec].n)}</span>`:"<span class=\"muted\">not chosen</span>"}<div class="small muted">If the project emphasizes this attribute (focus 3–4), output rises 5–10% and it lifts the press sub-score; if it is de-prioritized (0–1), output drops 3%.${cd?` Wait ${SPEC_CD-(G.day-e.specAt)} days to change it.`:''}</div>
        <div class="row td-specs">${SPEC_OF[e.role].map(a=>`<button class="btn sm ${e.spec===a?'primary':''}" data-act="setspec" data-id="${e.id}" data-a="${a}" ${cd&&e.spec!==a?'disabled':''} aria-pressed="${e.spec===a}">${esc(FA[a].n)}</button>`).join('')}</div></div>`:`<div><b>Uzmanlık</b> ${e.spec?`<span class="chip st-ok">${esc(FA[e.spec].n)}</span>`:'<span class="muted">seçilmedi</span>'}<div class="small muted">Projede bu nitelik öne çıkarılmışsa (odak 3–4) üretimi %5–10 artar, basın alt puanına katkı verir; geri plandaysa (0–1) %3 düşer.${cd?` Değiştirmek için ${SPEC_CD-(G.day-e.specAt)} gün bekle.`:''}</div>
        <div class="row td-specs">${SPEC_OF[e.role].map(a=>`<button class="btn sm ${e.spec===a?'primary':''}" data-act="setspec" data-id="${e.id}" data-a="${a}" ${cd&&e.spec!==a?'disabled':''} aria-pressed="${e.spec===a}">${esc(FA[a].n)}</button>`).join('')}</div></div>`));}}
  if(!e.founder&&!e.intern&&(e.level||0)<2){const m=mentorOf(e),C=mentorCands(e);
    rows.push((LANG_EN?`<div><b>Mentor</b> ${m?`${esc(m.name)} <button class="btn sm ghost" data-act="setmentor" data-id="${e.id}" data-m="0">End</button>`:C.length?"<span class=\"muted\">none</span>":"<span class=\"muted\">No level 2 employee or manager in the same role.</span>"}
      <div class="small muted">A mentored employee gains 50% more experience and improves skill faster; the mentor produces 3% less per mentee.</div>
      ${!m&&C.length?`<div class="row td-specs">${C.slice(0,4).map(o=>`<button class="btn sm" data-act="setmentor" data-id="${e.id}" data-m="${o.id}">${esc(o.name)} <span class="muted num">${fx(o.skill,1)} · ${menteesOf(o).length}/${MENTEE_MAX}</span></button>`).join('')}</div>`:''}</div>`:`<div><b>Mentor</b> ${m?`${esc(m.name)} <button class="btn sm ghost" data-act="setmentor" data-id="${e.id}" data-m="0">Bırak</button>`:C.length?'<span class="muted">yok</span>':'<span class="muted">Aynı rolde 2. kademe ya da yönetici biri yok.</span>'}
      <div class="small muted">Mentorlu çalışanın deneyimi %50, yetenek gelişimi daha hızlı artar; mentor kişi başı %3 daha az üretir.</div>
      ${!m&&C.length?`<div class="row td-specs">${C.slice(0,4).map(o=>`<button class="btn sm" data-act="setmentor" data-id="${e.id}" data-m="${o.id}">${esc(o.name)} <span class="muted num">${fx(o.skill,1)} · ${menteesOf(o).length}/${MENTEE_MAX}</span></button>`).join('')}</div>`:''}</div>`));}
  if(canMentor(e)&&menteesOf(e).length)rows.push((LANG_EN?`<div><b>Mentoring</b> ${menteesOf(e).map(o=>esc(o.name)).join(', ')} <span class="muted">(${menteesOf(e).length}/${MENTEE_MAX})</span></div>`:`<div><b>Mentorluk ettiği</b> ${menteesOf(e).map(o=>esc(o.name)).join(', ')} <span class="muted">(${menteesOf(e).length}/${MENTEE_MAX})</span></div>`));
  if(!e.founder&&!e.intern){const g=e.goal,s=cgState(e);
    rows.push((LANG_EN?`<div><b>Career goal</b> ${g?`${esc(goalName(g))} · <span class="${s==='done'?'pos':s==='late'?'neg':'muted'}">${s==='done'?"reached":s==='late'?`waiting ${Math.floor((G.day-g.at)/30)} months`:"open"}</span>`:`<span class="muted">revealed in ${Math.max(0,60-(G.day-(e.hiredAt||0)))} days</span>`}</div>`:`<div><b>Kariyer hedefi</b> ${g?`${esc(goalName(g))} · <span class="${s==='done'?'pos':s==='late'?'neg':'muted'}">${s==='done'?'ulaştı':s==='late'?`${Math.floor((G.day-g.at)/30)} aydır bekliyor`:'açık'}</span>`:`<span class="muted">${Math.max(0,60-(G.day-(e.hiredAt||0)))} gün içinde belli olacak</span>`}</div>`));}
  if(keyP(e)||retOn(e))rows.push((LANG_EN?`<div><b>Key employee</b> <span class="chip st-warn">Key</span> ${retOn(e)?`<span class="small muted">Retention bonus valid until ${fmtDate(e.ret.until)}; rival offers are 70% less effective on them.</span>`:`<span class="small muted">One of the strongest people on their team; rivals target them more often.</span> <button class="btn sm" data-act="retain" data-id="${e.id}" ${G.cash<retCost(e)?'disabled':''}>Give retention bonus (${money(retCost(e))})</button>`}</div>`:`<div><b>Kilit çalışan</b> <span class="chip st-warn">Kilit</span> ${retOn(e)?`<span class="small muted">Tutma primi ${fmtDate(e.ret.until)} tarihine kadar geçerli; rakip teklifleri ona %70 daha az işler.</span>`:`<span class="small muted">Ekibinin en güçlü isimlerinden; rakipler ona daha sık teklif yapar.</span> <button class="btn sm" data-act="retain" data-id="${e.id}" ${G.cash<retCost(e)?'disabled':''}>Tutma primi ver (${money(retCost(e))})</button>`}</div>`));
  return rows.length?(LANG_EN?`<details class="small drv td" open><summary><b>Career</b></summary><div class="col" style="gap:8px">${rows.join('')}</div></details>`:`<details class="small drv td" open><summary><b>Kariyer</b></summary><div class="col" style="gap:8px">${rows.join('')}</div></details>`):'';}
function teamAct(a,id,ds){const e=G.emps.find(x=>x.id===id);if(!e)return;
  if(a==='setspec'){if(e.spec===ds.a||!specOk(e)||!SPEC_OF[e.role].includes(ds.a)||(e.specAt!=null&&G.day-e.specAt<SPEC_CD))return;e.spec=ds.a;e.specAt=G.day;news((LANG_EN?`${e.name} started specializing in ${FA[ds.a].n.toLocaleLowerCase(LOC)}.`:`${e.name} ${FA[ds.a].n.toLocaleLowerCase(LOC)} alanında uzmanlaşmaya başladı.`),'');}
  else if(a==='setmentor'){const mid=+ds.m;if(!mid){if(e.mentor){e.mentor=null;news((LANG_EN?`Mentoring ended for ${e.name}.`:`${e.name} için mentorluk bitti.`),'');}}
    else{const m=G.emps.find(x=>x.id===mid);if(!m||!mentorCands(e).includes(m))return;e.mentor=m.id;e.morale=clamp(e.morale+3,0,100);news((LANG_EN?`${m.name} started mentoring ${e.name}.`:`${m.name}, ${e.name} için mentorluk yapmaya başladı.`),'good');}}
  else if(a==='retain'){if(retOn(e)||!keyP(e))return;const c=retCost(e);if(G.cash<c)return;spend(c,'salary');e.ret={until:G.day+RET_DAYS};e.morale=clamp(e.morale+10,0,100);news((LANG_EN?`Two-year retention bonus given to ${e.name} (${money(c)}).`:`${e.name} için iki yıllık tutma primi verildi (${money(c)}).`),'good');}
  G.careerVer=(G.careerVer||0)+1;}
