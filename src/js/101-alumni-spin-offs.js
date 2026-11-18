/* ============================== ALUMNI SPIN-OFFS ============================== */
/* Ayrılan önemli çalışanlar (yetenek 7+, kıdemli ya da yönetici) kendi girişimini kurabilir (Ekip → Mezunlar).
   Ayrılış her gün çalışan listesi karşılaştırılarak yakalanır; neden (istifa, rakibe geçiş, işten çıkarılma, küçülme) ayrılış noktalarında
   e.lw ile işaretlenir. Olasılık yeteneğe, nedene ve kişiliğe bağlıdır (hırslı, lider, yaratıcı artırır; sadık azaltır).
   Girişim tohum → Seri A → Seri B aşamalarından geçer, batabilir; Seri B'den sonra pazara rakip olarak girer (kurucusu CEO'su, sana bakışı
   ayrılış biçimine göre). Sen: yatırım yaparsın (rakip olunca pay portföyüne geçer), satın alırsın (kurucu ve ekibi geri gelir, o kategoride
   12 ay puan bonusu) ya da batınca kurucuyu geri çağırırsın. Seri A'yı geçen her mezun girişimi aday kalitesini artırır (mezun ağı). */
const SPN_ST={seed:{n:(LANG_EN?"Seed":'Tohum'),next:'a',mo:[9,15],x:[2.5,4],fail:0.03},a:{n:(LANG_EN?"Series A":'Seri A'),next:'b',mo:[10,18],x:[2.2,3.5],fail:0.016},b:{n:(LANG_EN?"Series B":'Seri B'),next:'scale',mo:[10,16],x:[1.8,2.8],fail:0.01}};
const SPN_MAX=4,SPN_GAP=150,SPN_INV=0.15,SPN_CAP=0.45;
const SPN_WHY={quit:(LANG_EN?"Quit":'İstifa etti'),poach:(LANG_EN?"Poached by a rival":'Rakibe geçti'),fire:(LANG_EN?"Fired":'İşten çıkarıldı'),layoff:(LANG_EN?"Laid off in cutbacks":'Küçülmede çıkarıldı')};
const SPN_REL={quit:-15,poach:-5,fire:-45,layoff:-35};
const newSpn=()=>({list:[],left:[],last:-999,nid:0});
const spnOf=()=>G.spn||(G.spn=newSpn());
const spnLive=s=>!!SPN_ST[s.st];
const spnValue=()=>G&&G.spn?G.spn.list.reduce((a,s)=>a+(spnLive(s)?s.val*s.stake:0),0):0;
/* mezun ağı: Seri A'yı geçmiş (ya da pazara girmiş, satın alınmış) her girişim aday kalitesine +0,08 (en çok +0,4) */
const spnCand=()=>G&&G.spn?Math.min(0.4,0.08*G.spn.list.filter(s=>s.st==='a'||s.st==='b'||s.st==='rival'||s.st==='acq').length):0;
const spnRelTxt=r=>r>=10?(LANG_EN?"Friendly":'Dostça'):r>=-10?(LANG_EN?"Distant":'Mesafeli'):r>=-35?(LANG_EN?"Resentful":'Kırgın'):(LANG_EN?"Hostile":'Düşmanca');
/* ayrılışları yakala: dünkü çalışan listesiyle karşılaştır */
const SPN_SNAP={g:null,m:null};
function spnDaily(){if(!G)return;const E=G.emps,a=SPN_SNAP.a;
  if(SPN_SNAP.g===G&&a&&a.length===E.length){let same=true;for(let i=0;i<E.length;i++)if(a[i]!==E[i]){same=false;break;}if(same)return;}
  const m=new Map();for(const e of E)m.set(e.id,e);
  if(SPN_SNAP.g!==G){SPN_SNAP.g=G;SPN_SNAP.m=m;SPN_SNAP.a=E.slice();return;}const prev=SPN_SNAP.m;SPN_SNAP.m=m;SPN_SNAP.a=E.slice();
  for(const [id,e] of prev)if(!m.has(id))spnLeft(e);}
function spnLeft(e){if(sgOff('spn')||!e||e.intern||e.founder||e.cof||e.spnT)return;if(!(e.skill>=7||(e.level||0)>=2||e.mgr))return;
  const S=spnOf(),why=SPN_WHY[e.lw]?e.lw:'quit';S.left.unshift({d:G.day,name:e.name,role:e.role,skill:e.skill,why});if(S.left.length>12)S.left.pop();
  if(S.list.filter(spnLive).length>=SPN_MAX||G.day-S.last<SPN_GAP)return;
  let p=e.skill>=9?0.35:e.skill>=8?0.22:0.12;p*={quit:1.2,poach:0.4,fire:1,layoff:1.3}[why];const tr=e.tr||[];
  if(tr.includes('ambit'))p*=1.5;if(tr.includes('leader'))p*=1.3;if(tr.includes('creative'))p*=1.2;if(tr.includes('loyal'))p*=0.5;
  if(Math.random()<p)spnFound(e,why);}
/* kategori: çalıştığı projenin kategorisi; yoksa rolüne uyan, senin de olduğun bir kategori */
function spnCat(e){const pr=e.proj&&G.projects.find(x=>x.id===e.proj);if(pr&&CATS[pr.cat])return pr.cat;
  const mine=[...new Set(myActive().map(p=>p.cat))].filter(c=>(REQ_ROLES[c]||[]).includes(e.role));if(mine.length)return pick(mine);
  const RC={res:['ai','qc','cpu'],ops:['iot','saas'],sec:['saas','ai'],mkt:['app','saas'],sup:['saas','app']}[e.role];
  const L=CAT_ORDER.filter(c=>catUnlocked(c)&&(RC?RC.includes(c):(REQ_ROLES[c]||[]).includes(e.role)));return L.length?pick(L):pick(['app','saas']);}
function spnFound(e,why){const S=spnOf(),cat=spnCat(e),sur=e.name.split(' ').slice(-1)[0],name=`${sur} ${pick(VC_P2)}`;
  const q=clamp(0.6+(e.skill-6)*0.18+rnd(-0.2,0.25),0.4,1.6),rel=SPN_REL[why]+(why==='quit'&&e.morale<30?-15:0);
  let taken=null;if(why==='quit'&&Math.random()<0.3){taken=G.emps.find(o=>o.role===e.role&&!o.founder&&!o.cof&&!o.intern&&o.morale<55);
    if(taken){taken.spnT=1;taken.lw='quit';G.emps=G.emps.filter(x=>x!==taken);}}
  const s={id:'s'+(++S.nid),name,fn:e.name,role:e.role,skill:e.skill,cat,why,d:G.day,st:'seed',nx:G.day+30*rint(...SPN_ST.seed.mo),q,val:Math.round(3e6*infl()*q*rnd(0.8,1.3)),rel,stake:0,cost:0,team:taken?1:0};
  S.list.unshift(s);S.last=G.day;if(S.list.length>14){const i=S.list.map(spnLive).lastIndexOf(false);if(i>=0)S.list.splice(i,1);}
  tl('rival',(LANG_EN?`${e.name} founded ${name}`:`${e.name}, ${name} girişimini kurdu`));
  news((LANG_EN?`After leaving, ${e.name} founded their own startup: ${name} (${CATS[cat].n}).${taken?` A colleague went with them: ${taken.name}.`:''} Team → Alumni.`:`${e.name} ayrıldıktan sonra kendi girişimini kurdu: ${name} (${CATS[cat].n}).${taken?` Bir ekip arkadaşı da onunla gitti: ${taken.name}.`:''} Ekip → Mezunlar.`),'',true);return s;}
/* aylık: büyüme, yatırım turları, batma, pazara giriş */
function spnMonthly(){const S=G.spn;if(!S)return;
  for(const s of S.list){if(!spnLive(s))continue;const T=SPN_ST[s.st];
    if(Math.random()<T.fail*(s.q<1?1.6-s.q:0.6)){spnDie(s);continue;}
    s.val=Math.round(s.val*Math.exp(0.02*Math.log(s.q)+0.004+rnd(-0.05,0.06)));
    if(G.day>=s.nx){if(T.next==='scale'){spnScale(s);continue;}
      s.st=T.next;s.val=Math.round(s.val*rnd(...T.x));s.nx=G.day+30*rint(...SPN_ST[s.st].mo);if(s.stake)s.stake=Math.round(s.stake*0.85*1000)/1000;
      news((LANG_EN?`Alumni startup ${s.name} raised its ${SPN_ST[s.st].n} round (at a ${money(s.val)} valuation).`:`Mezun girişimi ${s.name} ${SPN_ST[s.st].n} yatırımı aldı (${money(s.val)} değerle).`),'mkt');}}
  rvnSpnMonthly();}
function spnDie(s){s.st='dead';s.end=G.day;const lost=s.cost;
  // kurucu iş arıyor: adaylar listesine düşer
  const k=genCand();Object.assign(k,{name:s.fn,role:s.role,skill:Math.min(10,Math.round((s.skill+0.2)*10)/10),alum:s.id});k.level=levelFor(k.skill);k.xp=XP_REQ[k.level]+rint(0,60);k.salary=Math.round(salaryFor(k.skill)*(1+0.12*k.level)*macWage()/100)*100;
  G.cands=(G.cands||[]).filter(x=>x.alum!==s.id);G.cands.unshift(k);s.kid=k.id;
  news((LANG_EN?`Alumni startup ${s.name} shut down.${lost?` Your investment (${money(lost)}) was wiped out.`:''} Its founder ${s.fn} is looking for a job and is among your candidates.`:`Mezun girişimi ${s.name} kapandı.${lost?` Yatırımın (${money(lost)}) sıfırlandı.`:''} Kurucusu ${s.fn} iş arıyor; adaylar listesinde.`),lost?'bad':'');}
function spnScale(s){const I=infl();
  const c=makeComp({name:s.name,pfx:s.name.split(' ')[0],focus:[s.cat],cash:s.val*0.35,emp:clamp(Math.round(s.val/(1e6*I)*4),30,400),brand:rnd(8,18),tech:clamp(0.95+(s.skill-7)*0.06+(s.q-1)*0.1,0.9,1.3),hue:rint(0,359),reg:['tr']},'c'+nid());
  c.born=G.day;c.rel=s.rel;c.alum=s.id;c.ceo={name:s.fn,age:rint(28,45),p:pick(['kav','fir']),since:G.day,din:-999,jab:-999};G.comps.push(c);aiLaunch(c,s.cat,true);
  s.st='rival';s.cid=c.id;s.end=G.day;
  if(s.stake>0){const P=pfOf();P.h[c.id]=Math.round(Math.min(0.99,(P.h[c.id]||0)+s.stake)*100)/100;P.cost[c.id]=(P.cost[c.id]||0)+s.cost;}
  tl('rival',(LANG_EN?`${s.name} entered the market`:`${s.name} pazara girdi`));
  news((LANG_EN?`${s.name}, founded by your former employee ${s.fn}, is now your rival in the ${CATS[s.cat].n.toLocaleLowerCase(LOC)} market.${s.stake?` Your stake (${Math.round(s.stake*100)}%) moved to your share portfolio.`:''}`:`Eski çalışanın ${s.fn} tarafından kurulan ${s.name} artık ${CATS[s.cat].n.toLocaleLowerCase(LOC)} pazarında rakibin.${s.stake?` Payın (%${Math.round(s.stake*100)}) hisse portföyüne geçti.`:''}`),s.rel<0&&!s.stake?'bad':'mkt',true);}
/* ---- oyuncu eylemleri ---- */
const spnInvCost=s=>Math.round(s.val*SPN_INV);
const spnBuyCost=s=>Math.round(s.val*(1.35+(s.rel<0?-s.rel/100:0))*(1-s.stake));
function spnBlock(s,a){if(!s||!spnLive(s))return (LANG_EN?"This startup is no longer independent.":'Bu girişim artık bağımsız değil.');
  if(a==='inv'){if(s.rel<-30)return (LANG_EN?`${s.fn} doesn't want to work with you.`:`${s.fn} seninle çalışmak istemiyor.`);if(s.stake>=SPN_CAP-1e-9)return (LANG_EN?`Your stake can be at most ${Math.round(SPN_CAP*100)}%.`:`Payın en fazla %${Math.round(SPN_CAP*100)} olabilir.`);if(G.cash<spnInvCost(s))return (LANG_EN?"Not enough cash.":'Yeterli nakit yok.');}
  if(a==='buy'){if(s.rel<-60)return (LANG_EN?`${s.fn} won't sell you the company.`:`${s.fn} şirketini sana satmaz.`);if(G.cash<spnBuyCost(s))return (LANG_EN?"Not enough cash.":'Yeterli nakit yok.');if(G.emps.length>=officeCap())return (LANG_EN?"No room in the office.":'Ofiste yer yok.');}
  return '';}
function spnAct(a,ds){const S=spnOf(),s=S.list.find(x=>x.id===ds.id);
  if(a==='spninv'){const w=spnBlock(s,'inv');if(w){showToast(w,'bad');return;}const c=spnInvCost(s);spend(c,'capex');s.stake=Math.min(SPN_CAP,Math.round((s.stake+SPN_INV/(1+SPN_INV))*1000)/1000);s.cost+=c;s.rel=Math.min(60,s.rel+5);
    news((LANG_EN?`You invested ${money(c)} in ${s.name}; your stake is ${fx(s.stake*100,1)}%.`:`${s.name} girişimine ${money(c)} yatırım yaptın; payın %${fx(s.stake*100,1)}.`),'');return;}
  if(a==='spnbuy'){const w=spnBlock(s,'buy');if(w){showToast(w,'bad');return;}const c=spnBuyCost(s),n=Math.max(0,Math.min(officeCap()-G.emps.length-1,s.st==='seed'?2:4));spend(c,'capex');s.st='acq';s.end=G.day;s.cost+=c;
    const f=genCand();Object.assign(f,{name:s.fn,role:s.role,skill:Math.min(10,Math.round((s.skill+0.4)*10)/10),hiredAt:G.day,morale:72});f.level=levelFor(f.skill);f.xp=XP_REQ[f.level]+rint(0,60);f.salary=Math.round(salaryFor(f.skill)*(1+0.12*f.level)*macWage()*1.2/100)*100;G.emps.push(f);
    const R=REQ_ROLES[s.cat]||['soft'];let m=0;for(let i=0;i<n;i++){const k=genCand();Object.assign(k,{role:R[i%R.length],skill:clamp(Math.round(rnd(5,8)*10)/10,1,10),hiredAt:G.day});k.level=levelFor(k.skill);k.xp=XP_REQ[k.level];k.salary=Math.round(salaryFor(k.skill)*(1+0.12*k.level)*macWage()/100)*100;G.emps.push(k);m++;}
    const T=tdnOf(),kn=T.kn[s.cat];T.kn[s.cat]={b:Math.max(0.04,kn&&G.day<=kn.until?kn.b:0),until:Math.max(G.day+365,kn?kn.until:0),src:s.name};
    tl('star',(LANG_EN?`${s.name} acquired`:`${s.name} satın alındı`));news((LANG_EN?`${s.name} acquired (${money(c)}): ${s.fn} and a team of ${m} came back; ${CATS[s.cat].n} products score +4% for 12 months.`:`${s.name} satın alındı (${money(c)}): ${s.fn} ve ${m} kişilik ekibi geri döndü; ${CATS[s.cat].n} ürünlerinde 12 ay puan +%4.`),'good',true);return;}
  if(a==='spnback'){if(!s||s.st!=='dead')return;const k=(G.cands||[]).find(x=>x.alum===s.id);if(!k){showToast((LANG_EN?`${s.fn} is no longer looking for a job.`:`${s.fn} artık iş aramıyor.`),'bad');return;}
    if(s.rel<-40){showToast((LANG_EN?`${s.fn} doesn't want to come back.`:`${s.fn} geri dönmek istemiyor.`),'bad');return;}if(G.emps.length>=officeCap()){showToast((LANG_EN?"No room in the office.":'Ofiste yer yok.'),'bad');return;}
    G.cands=G.cands.filter(x=>x!==k);k.hiredAt=G.day;k.morale=70;G.emps.push(k);s.st='back';news((LANG_EN?`${s.fn} is back at the company.`:`${s.fn} şirkete geri döndü.`),'good');}}
/* ---- görünüm ---- */
function vSpinoffs(){const S=spnOf(),L=S.list;const st=s=>SPN_ST[s.st]?SPN_ST[s.st].n:s.st==='rvacq'?(LANG_EN?"Bought by a rival":'Rakip satın aldı'):s.st==='rival'?(LANG_EN?"Rival on the market":'Pazarda rakip'):s.st==='acq'?(LANG_EN?"Acquired":'Satın alındı'):s.st==='back'?(LANG_EN?"Founder came back":'Kurucu geri döndü'):(LANG_EN?"Closed":'Kapandı');
  const cc=s=>s.st==='rival'||s.st==='rvacq'?'st-bad':s.st==='acq'||s.st==='back'?'st-ok':s.st==='dead'?'st-mute':'st-warn';
  const card=s=>{const live=spnLive(s),wi=spnBlock(s,'inv'),wb=spnBlock(s,'buy'),k=s.st==='dead'&&(G.cands||[]).find(x=>x.alum===s.id);
    return (LANG_EN?`<div class="spn-c"><div class="row between" style="gap:6px;flex-wrap:wrap"><b>${esc(s.name)}</b><span class="chip ${cc(s)}">${st(s)}</span></div>
      <div class="small muted">${esc(s.fn)} · ${ROLES[s.role]?ROLES[s.role].n:''} · skill ${fx(s.skill,1)} · ${SPN_WHY[s.why]||''} · ${fmtDate(s.d)}</div>
      <div class="spn-k"><span><small>Category</small><b>${CATS[s.cat].n}</b></span>${live?`<span><small>Value</small><b class="num">${money(s.val)}</b></span>`:''}<span><small>How they see you</small><b>${spnRelTxt(s.rel)}</b></span>${s.stake&&live?`<span><small>Your stake</small><b class="num">${fx(s.stake*100,1)}%</b></span>`:''}${live?`<span><small>Next round</small><b class="num">${Math.max(0,Math.round((s.nx-G.day)/30))} mo</b></span>`:''}</div>
      ${live?`<div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm" data-act="spninv" data-id="${s.id}" ${wi?`disabled title="${esc(wi)}"`:''}>Invest · ${money(spnInvCost(s))}</button><button class="btn sm ${s.rel<0?'ghost':''}" data-act="spnbuy" data-id="${s.id}" ${wb?`disabled title="${esc(wb)}"`:''}>Acquire · ${money(spnBuyCost(s))}</button>${wi&&wb?`<span class="small muted">${esc(wi===wb?wi:wb)}</span>`:''}</div>`:''}
      ${k?`<div class="row" style="gap:6px"><button class="btn sm primary" data-act="spnback" data-id="${s.id}">Bring back ${esc(s.fn)}</button><span class="small muted">salary ${money(k.salary)}/mo</span></div>`:''}
      ${s.bid&&live&&comp(s.bid.cid)?`<div class="small neg"><b>${esc(comp(s.bid.cid).name)}</b> wants to buy this startup: within ${Math.max(0,s.bid.at-G.day)} days, buy it yourself or raise your stake to ${Math.round(RVN_VETO*100)}% to block the bid.</div>`:''}
      ${s.st==='rvacq'&&comp(s.cid)?`<div class="small muted">Bought by ${esc(comp(s.cid).name)}; its ${CATS[s.cat].n} products are stronger for 12 months.</div>`:''}
      ${s.st==='rival'&&comp(s.cid)?`<div class="small muted">Among your rivals: ${esc(comp(s.cid).name)} · CEO ${esc(s.fn)}${pfStake(s.cid)?` · your stake ${Math.round(pfStake(s.cid)*100)}% (share portfolio)`:''}</div>`:''}</div>`:`<div class="spn-c"><div class="row between" style="gap:6px;flex-wrap:wrap"><b>${esc(s.name)}</b><span class="chip ${cc(s)}">${st(s)}</span></div>
      <div class="small muted">${esc(s.fn)} · ${ROLES[s.role]?ROLES[s.role].n:''} · yetenek ${fx(s.skill,1)} · ${SPN_WHY[s.why]||''} · ${fmtDate(s.d)}</div>
      <div class="spn-k"><span><small>Kategori</small><b>${CATS[s.cat].n}</b></span>${live?`<span><small>Değer</small><b class="num">${money(s.val)}</b></span>`:''}<span><small>Sana bakışı</small><b>${spnRelTxt(s.rel)}</b></span>${s.stake&&live?`<span><small>Payın</small><b class="num">%${fx(s.stake*100,1)}</b></span>`:''}${live?`<span><small>Sıradaki tur</small><b class="num">${Math.max(0,Math.round((s.nx-G.day)/30))} ay</b></span>`:''}</div>
      ${live?`<div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm" data-act="spninv" data-id="${s.id}" ${wi?`disabled title="${esc(wi)}"`:''}>Yatırım yap · ${money(spnInvCost(s))}</button><button class="btn sm ${s.rel<0?'ghost':''}" data-act="spnbuy" data-id="${s.id}" ${wb?`disabled title="${esc(wb)}"`:''}>Satın al · ${money(spnBuyCost(s))}</button>${wi&&wb?`<span class="small muted">${esc(wi===wb?wi:wb)}</span>`:''}</div>`:''}
      ${k?`<div class="row" style="gap:6px"><button class="btn sm primary" data-act="spnback" data-id="${s.id}">${esc(s.fn)} geri çağır</button><span class="small muted">maaş ${money(k.salary)}/ay</span></div>`:''}
      ${s.bid&&live&&comp(s.bid.cid)?`<div class="small neg"><b>${esc(comp(s.bid.cid).name)}</b> bu girişimi satın almak istiyor: ${Math.max(0,s.bid.at-G.day)} gün içinde satın al ya da payını %${Math.round(RVN_VETO*100)}'e çıkararak engelle.</div>`:''}
      ${s.st==='rvacq'&&comp(s.cid)?`<div class="small muted">${esc(comp(s.cid).name)} satın aldı; ${CATS[s.cat].n} ürünleri 12 ay güçlü.</div>`:''}
      ${s.st==='rival'&&comp(s.cid)?`<div class="small muted">Rakiplerin arasında: ${esc(comp(s.cid).name)} · CEO ${esc(s.fn)}${pfStake(s.cid)?` · payın %${Math.round(pfStake(s.cid)*100)} (hisse portföyü)`:''}</div>`:''}</div>`);};
  const left=S.left.length?(LANG_EN?`<div class="tw"><table><thead><tr><th>Left</th><th>Role</th><th class="r">Skill</th><th>Reason</th><th class="r">Date</th></tr></thead><tbody>${S.left.slice(0,8).map(x=>`<tr><td>${esc(x.name)}</td><td>${ROLES[x.role]?ROLES[x.role].n:''}</td><td class="r num">${fx(x.skill,1)}</td><td>${SPN_WHY[x.why]||''}</td><td class="r num">${fmtDate(x.d)}</td></tr>`).join('')}</tbody></table></div>`:`<div class="tw"><table><thead><tr><th>Ayrılan</th><th>Rol</th><th class="r">Yetenek</th><th>Neden</th><th class="r">Tarih</th></tr></thead><tbody>${S.left.slice(0,8).map(x=>`<tr><td>${esc(x.name)}</td><td>${ROLES[x.role]?ROLES[x.role].n:''}</td><td class="r num">${fx(x.skill,1)}</td><td>${SPN_WHY[x.why]||''}</td><td class="r num">${fmtDate(x.d)}</td></tr>`).join('')}</tbody></table></div>`):(LANG_EN?"<div class=\"small muted\">No key employee has left yet.</div>":'<div class="small muted">Henüz önemli bir çalışan ayrılmadı.</div>');
  const net=spnCand();
  return (LANG_EN?`<section class="panel spn"><div class="ph"><h2>Alumni and their startups${helpBtn('spn')}</h2><span class="sub">${L.filter(spnLive).length} active startups${net?` · alumni network candidate quality +${fx(net,2)}`:''}</span></div><div class="pb col" style="gap:12px">
    <p class="small muted" style="margin:0">Talented employees who leave (skill 7+, senior or manager) may found their own startup; ambitious and leader types more often, loyal ones less often. Startups go through seed, Series A and Series B rounds; they may fail or, after Series B, enter the market as a rival. You can invest, acquire them to bring the founder and team back, or bring the founder back if the startup fails. How they left shapes how they see you: people you fired are resentful. Every alumni startup that passes Series A raises your candidate quality.</p>
    ${L.length?`<div class="spn-g">${L.map(card).join('')}</div>`:"<div class=\"small muted\">No alumni startups yet.</div>"}
    <div class="col" style="gap:6px"><b class="small">Key employees who left recently</b>${left}</div></div></section>`:`<section class="panel spn"><div class="ph"><h2>Mezunlar ve girişimleri${helpBtn('spn')}</h2><span class="sub">${L.filter(spnLive).length} aktif girişim${net?` · mezun ağı aday kalitesi +${fx(net,2)}`:''}</span></div><div class="pb col" style="gap:12px">
    <p class="small muted" style="margin:0">Ayrılan yetenekli çalışanlar (yetenek 7+, kıdemli ya da yönetici) kendi girişimini kurabilir; hırslı ve lider olanlar daha sık, sadık olanlar daha seyrek. Girişimler tohum, Seri A ve Seri B turlarından geçer; batabilir ya da Seri B'den sonra pazara rakip olarak girer. Yatırım yapabilir, satın alıp kurucuyu ve ekibini geri getirebilir ya da batınca kurucuyu geri çağırabilirsin. Nasıl ayrıldığı sana bakışını belirler: işten çıkarılanlar kırgındır. Seri A'yı geçen her mezun girişimi aday kaliteni artırır.</p>
    ${L.length?`<div class="spn-g">${L.map(card).join('')}</div>`:'<div class="small muted">Henüz mezun girişimi yok.</div>'}
    <div class="col" style="gap:6px"><b class="small">Son ayrılan önemli çalışanlar</b>${left}</div></div></section>`);}
