/* ============================== GAME LOOP ============================== */
const newMonth=()=>({rev:0,supply:0,prod:0,salary:0,rent:0,infra:0,fact:0,interest:0,other:0,capex:0,pas:0});
/* pas: yatırım gelirleri (kira, temettü, medya neti); değerlemede faaliyet kârından ayrılır, varlıkların kendisi piyasa değeriyle sayılır */
const addPas=x=>{G.month.pas=(G.month.pas||0)+x;};
function newGame(sid='free'){
  G={v:2,name:(LANG_EN?"Garage Labs":'Garaj Labs'),day:0,cash:150000,brand:3,equity:1,speed:0,office:0,racks:0,
    emps:[],cands:[],projects:[],products:[],res:{done:{},active:null},comps:[],news:[],hist:[],ar:newAr(),bi:newBi(),soc:newSoc(),sb:newSb(),cs:newCs(),space:newSpace(),adv:newAdv(),quest:newQuest(),bm:newBm(),hto:newHto(),aiw:newAiw(),dp:newDp(),shops:newShops(),bun:newBun(),fair:newFair(),era:newEra(0),qc:newQc(),rf:newRf(),mrg:newMrg(),pitch:newPitch(),cv:newCv(),mega:newMega(),nem:newNem(),inbox:[],
    month:newMonth(),rounds:{},neg:0,over:false,nextId:1,capLoad:0,capFull:false,
    px:{wafer:1,screen:1,camera:1,battery:1,memory:1,gpu:1,motor:1,chassis:1},pxEvt:{},pxh:{wafer:[],screen:[],camera:[],battery:[],memory:[],gpu:[],motor:[],chassis:[]},
    sup:{wafer:'s10',screen:'s1',camera:'s3',battery:'s5',memory:'s7',gpu:'s13',motor:'s15',chassis:'s11'},cbase:0,gameRev:0,
    stock:{},orders:[],autoOrder:true,compDays:30,fgDays:20,factories:[],disrupt:{},supDown:{},tariffs:{},incentive:null,energy:null,
    debt:0,pending:null,prevSpeed:1,use:{},siteUse:{},cashBlocked:-99};
  Object.assign(G,{ipl:newIpl(),lab:newLab(),tnd:newTnd(),wpol:'office',cult:80,wpolAt:-999,wShockMsg:false,ideas:[],tools:{},sideT:0,hack:null,hackLast:-999,ideaLog:[],cof:null,ceoP:[],tw:newTw(),fx:newFx(),mac:newMac(0),prc:newPrc(),aw:newAw(),esg:newEsg(),dev:newDev(),vc:newVC(),execs:{},xc:null,xlog:[],union:newUnion(),surv:null,mood:[],rlog:[],plants:{},dcs:[],dcPm:1,dcRented:0,mkt:newMkt(),stats:[],tl:[],ms:{},tut:{on:false,step:0,seen:{}},ach:{},flags:{},diff:{...DIFFS.normal},life:newLife(),acqs:[],unis:{},internCands:[],cyber:newCyber(),gov:newGov(),pats:[],patPend:[],patFiled:{},cases:[],cross:{},branches:{},deals:[],offers:[],floors:1,furn:[],furnInv:{},furnVer:0,meeting:null,allAt:-999,pace:'normal',perks:{},momentum:0,layoff:0,teamEventUntil:-1,teamEventAt:-999});
  G.emps.push({id:nid(),name:(LANG_EN?"You (Founder)":'Sen (Kurucu)'),role:'soft',skill:6,salary:0,proj:null,founder:true,morale:85,energy:100,leave:null,level:0,xp:0,tr:['leader'],rev:true,hiredAt:0});
  G.autoRes=false;G.careerVer=0;
  for(let i=0;i<6;i++)G.cands.push(genCand());
  G.regions=newRegions();G.latFx=1;G.rm={};G.rl={};
  COMP_SEED.forEach((s,i)=>{const c=makeComp(s,'c'+i);G.comps.push(c);
    for(const f of c.focus)aiLaunch(c,f,true,-rint(30,300));
    for(const f of c.focus)if(Math.random()<0.5)aiLaunch(c,f,true,-rint(0,120));
  });
  news((LANG_EN?"Day one in the garage. You have $150K and a computer. Hire a designer and start your first mobile app.":'Garajda ilk gün. Elinde $150K ve bir bilgisayar var. Bir tasarımcı işe al ve ilk mobil uygulamanı başlat.'),'good');
  G.tl=[{d:0,k:'office',t:(LANG_EN?"Company founded":'Şirket kuruldu')}];
  G.mods={};const sc=SCN[sid]||SCN.free;G.scn={id:sc.id,end:sc.yrs?sc.yrs*365:null,won:null,fail:null};
  if(sc.setup){G.news=[];sc.setup();}
  if(sc.intro)news(sc.intro,'good',true);
  market();
  UI.draft=null;UI.tab='office';UI.selEmp=null;
}
function step(){if(chalOn()){rngSeed('d'+G.day);try{step0();}finally{rngFree();}chalCheck();}else if(crnOn()){const R=Math.random;try{step0();}finally{Math.random=R;}}else step0();}
function step0(){
  if(G.over||G.pending)return;
  const pm=dateOf(G.day).getMonth();
  G.day++;EMPV++;crn('d');
  if(G.meeting&&G.day>=G.meeting.until)endMeeting();
  let rp=0,mk=0;const cdn=cyberDown();flDaily();crn('cmp');compDaily();crn('emp');
  const PJ=new Map();for(const p of G.projects)if(!PJ.has(p.id))PJ.set(p.id,p);
  for(const e of G.emps){
    if(e.leave||inMeeting(e))continue;
    if(hackOn()&&HACK_ROLES.includes(e.role))continue;
    if(cdn&&e.role!=='sec'&&e.role!=='mkt')continue;
    const em=effMult(e)*wProd(e);
    if(e.role==='res'){rp+=e.skill*em;continue;}
    if(e.role==='mkt'){mk+=e.skill*em;continue;}
    if(!e.proj){if(DEV_ROLES.includes(e.role))depotWork(e,e.skill*em*0.8);continue;}
    if(typeof e.proj==='string')continue;
    const pr=PJ.get(e.proj);
    if(!pr){e.proj=null;continue;}
    const t=e.role;
    if(!pr.req[t]||pr.prog[t]>=pr.req[t]){e.proj=null;pr.rel=pr.rel||{};if(!pr.rel[t]&&!projDone(pr)){pr.rel[t]=1;news((LANG_EN?`${pr.name}: the ${PT_NAME[t]?PT_NAME[t].toLocaleLowerCase(LOC):t} part is done; that team can move on to other work.`:`${pr.name}: ${PT_NAME[t]?PT_NAME[t].toLocaleLowerCase(LOC):t} kısmı bitti; bu ekip başka işe geçebilir.`),'');}continue;}
    if(pr.req[t]&&pr.prog[t]<pr.req[t]){const add=Math.min(e.skill*em*projMult(pr)*teamMult(e,pr)*(pr.upd&&(pr.upd.kind==='refac'||pr.upd.kind==='rewrite')?1:1-(G.tdPol||0))*(1-(G.sideT||0))*(hasTool('devx')?1.05:1)*aiwM(t),compLeft(pr,t));compWork(pr,t,e,add);aiwQ(pr,e,add,t);specCredit(pr,e,add);pr.sk+=e.skill*(0.9+0.1*energyF(e))*add;pr.pts+=add;pr.qt=(pr.qt||0)+add*traitQ(e);pr.bq=(pr.bq||0)+add*traitBug(e);
      if(hasT(e,'creative')&&Math.random()<0.004){const ex=Math.min(e.skill*8,compLeft(pr,t));if(ex>0){compWork(pr,t,e,ex);pr.pts+=ex;pr.sk+=e.skill*ex;pr.qt+=ex*traitQ(e);news((LANG_EN?`${e.name} had a brilliant idea: ${pr.name} sped up.`:`${e.name} parlak bir fikir buldu: ${pr.name} hızlandı.`),'good');}}}
  }
  for(const pr of [...G.projects])if(projDone(pr))finishProject(pr);
  if(!cyberDown())rp+=brRP()+divRP()+devRP()+aiwRP();
  if(G.res.active){
    G.res.active.p+=rp*(ceoSk('v3')?1.1:1)*(ceoRD()?1.15:1)*cofRes()*(hasTool('resx')?1.08:1)*(myActive('qc').length?1.1:1)*bmRes()*(1+0.12*cvK('yenilik'))*(megaOn('hpc')?1.25:1);const r=RESD[G.res.active.id];
    if(G.res.active.p>=actRP()){sfx('res');G.res.done[r.id]=G.day;G.res.active=null;ceoXP(12+Math.min(40,resRP(r)/150),(LANG_EN?`Research: ${r.n}`:`Araştırma: ${r.n}`));for(const e of G.emps)if(e.role==='res'&&!e.leave)e.xp=(e.xp||0)+15;news((LANG_EN?`Research complete: ${r.n}. ${r.d}.`:`Araştırma tamamlandı: ${r.n}. ${r.d}.`),'good',true);}
  }
  if(!cyberDown())mk+=aiwMK();
  G.brand=clamp(G.brand+mk*0.003*(1-G.brand/100),0,100);if(G.brand>50)G.brand-=(G.brand-50)*0.0012;
  for(const c in G.px){const ev=G.pxEvt[c];const tg=(ev&&ev.until>G.day?ev.m:1)*(G.mods&&G.mods.px||1)*rawFx(c);G.px[c]=clamp(G.px[c]*Math.exp(rnd(-0.01,0.01))+(tg-G.px[c])*0.025,0.5,2.5);}
  for(const f of G.factories)if(f.ready===G.day)news((LANG_EN?`${f.name} is ready for production! Route your products to this facility in Product → Manufacturing.`:`${f.name} üretime hazır! Ürün → Üretim bölümünden ürünlerini bu tesise yönlendir.`),'good',true);
  deliveries();
  crn('prd');production();b2bDaily();b2bBuyDaily();
  crn('mkt');market();crn('sys');
  ecoDaily();stockDaily();supportDaily();dealsDaily();launchDaily();trainDaily();mktDaily();plantDaily();dcDaily();unionDaily();pmDaily();devDaily();awDaily();arDaily();stDaily();socDaily();spDaily();advDaily();questDaily();bmDaily();htoDaily();shopDaily();fairDaily();eraDaily();ibDaily();runToCheck();apDaily();tdnDaily();spnDaily();cdDaily();pruneDaily();navDaily();prDaily();twDaily();labDaily();if(G.day%7===3)execTick();
  if(G.day%4===0)autoOrder();
  crn('wb');EMPV++;MCTX=moraleShared();try{for(const e of G.emps)wellbeing(e);}finally{MCTX=null;}EMPV++;
  crn('car');careerDaily();
  G.momentum*=0.985;G.layoff*=0.97;
  const sal0=(G.emps.reduce((a,e)=>a+e.salary,0)*(incOk('jobs')?0.96:1)*(ceoSk('l4')?0.97:1)+perkCost())/30,sal=sal0*fxSal();if(G.fx)G.fx.mc+=sal-sal0;
  spend(sal+brCostAll()/30+xCost()/30,'salary');spend((officeRent()+regFees())/30,'rent');spend(G.racks*rackUpkeep()/30,'infra');
  spend(G.factories.reduce((a,f)=>a+facUpkeep(f),0)/30,'fact');
  if(dateOf(G.day).getMonth()!==pm){crn('me');monthEnd();}
}
function monthEnd(){
  if(!isFinite(G.brand))G.brand=10;if(!isFinite(G.momentum))G.momentum=0;
  const store=invValue()*0.01;spend(store,'other');
  if(G.debt>0)spend(G.debt*loanRate(),'interest');
  govPreClose();
  const m=G.month,opex=m.supply+m.prod+m.salary+m.rent+m.infra+m.fact+m.interest+m.other,profit=m.rev-opex;
  stockMonthly(profit);
  {const R=x=>typeof x==='number'?Math.round(x):x,mm={};for(const k in m)mm[k]=R(m[k]);G.hist.push({d:G.day,rev:R(m.rev),cost:R(opex),supply:R(m.supply+m.prod),salary:R(m.salary),profit:R(profit),capex:R(m.capex),cash:R(G.cash),debt:R(G.debt),m:mm});}try{feelMonth(m.rev,profit);}catch(e){}
  if(G.hist.length>240)G.hist.shift();
  G.month=newMonth();
  for(const c in G.px){G.pxh[c].push(G.px[c]);if(G.pxh[c].length>36)G.pxh[c].shift();}
  for(const p of G.products)if(p.owner==='P'){(p.h=p.h||[]).push(p.mSold||0);if(p.h.length>24)p.h.shift();p.mSold=0;}
  const sh=myActive().filter(p=>!sbIndep(p)).reduce((a,p)=>a+p.share*(isHW(p)&&p.units>1?clamp(p.sr/p.units,0,1):1),0);
  G.brand=clamp(G.brand*0.99+Math.sqrt(Math.min(sh,1.5))*0.9,0,100);
  {const ms=myActive().filter(p=>p.sat!=null&&!sbIndep(p));if(ms.length){const av=ms.reduce((a,p)=>a+p.sat,0)/ms.length;G.brand=clamp(G.brand+(av-60)/80,0,100);}}
  for(const e of G.emps)if(!e.leave&&(e.proj||['res','mkt','ops'].includes(e.role)))e.skill=Math.min(10,Math.round((e.skill+(e.morale>=80?0.08:e.energy<35?0.02:0.05)*(1+furnFx(empFloor(e)).skill)*mentor(e)*(hasT(e,'learner')?1.6:1)*(G.perks.learn?1.3:1))*100)/100);
  for(const e of G.emps)if(e.intern&&!e.leave)e.skill=Math.min(e.intern.pot,Math.round((e.skill+0.4*(G.perks.learn?1.3:1))*100)/100);
  for(const e of [...G.emps]){
    const qt=hasT(e,'loyal')?15:30;if(e.founder||e.morale>=qt)continue;
    if(Math.random()<(qt-e.morale)/80*(1-0.3*cvK('denge'))){e.lw='quit';G.emps=G.emps.filter(x=>x!==e);(G.qlog=G.qlog||[]).push(G.day);if(G.qlog.length>30)G.qlog.shift();news((LANG_EN?`${e.name} resigned. Their morale had been very low for a long time.`:`${e.name} istifa etti. Morali uzun süredir çok düşüktü.`),'bad',true);for(const o of G.emps)o.morale=Math.max(0,o.morale-2);}
  }
  G.cands=G.cands.filter(c=>c.hh&&c.hhUntil>G.day);for(let i=0;i<6;i++)G.cands.push(genCand());
  regMonthly();dealsMonthly();patMonthly();govMonthly();cyberMonthly();uniMonthly();acqMonthly();lifeMonthly();mktMonthly();dcMonthly();unionMonthly();lbMonthly();xMonthly();pmMonthly();macMonthly();fxMonthly();twMonthly();ceoMonthly();cofMonthly();tdMonthly();ideasMonthly();wMonthly();tndMonthly();labMonthly();qcMonthly();iplMonthly();arMonthly();biMonthly();socMonthly();sbMonthly();spMonthly();aiwMonthly();dpMonthly();shopMonthly();bunMonthly();fairMonthly();rclMonthly();rfMonthly();pitchMonthly();cvMonthly();megaMonthly();nemMonthly();clAuto();simpleMonthly();diagMonthly();teamMonthly();ftMonthly();wantMonthly();ctMonthly();rawMonthly();b2bMonthly();pfMonthly();reMonthly();mdMonthly();rvsMonthly();dsMonthly();lgMonthly();apMonthly();tdnMonthly();rvnMonthly();spnMonthly();cmpMonthly();cdMonthly();lobMonthly();if(ceoSk('f4')){if(G.life)G.life.conf=clamp(G.life.conf+0.3,0,100);if(G.pub)G.pub.sent*=1.004;}if(G.hist.length&&G.hist[G.hist.length-1].profit>0)ceoXP(5,(LANG_EN?"A profitable month":'Kârlı bir ay'));shMonthly();vcMonthly();devMonthly();esgMonthly();newCatsMonthly();prMonthly();
  {const nm=dateOf(G.day).getMonth(),SN={0:(LANG_EN?"Post-holiday slump: phone and computer demand is falling.":'Yılbaşı sonrası durgunluk başladı: telefon ve bilgisayar talebi düşüyor.'),7:(LANG_EN?"Back-to-school season: computer demand is rising.":'Okula dönüş sezonu: bilgisayar talebi yükseliyor.'),10:(LANG_EN?"Black Friday month: hardware demand is surging.":'Black Friday ayı: donanım talebi hızla artıyor.'),11:(LANG_EN?"Holiday shopping season: phone demand is at its peak.":'Yılbaşı alışveriş sezonu: telefon talebi zirvede.')};if(SN[nm])news(SN[nm],'mkt',true);}
  if(chalOn())rngSeed('ai'+G.day);else crn('ai');aiMonth();
  if(G.capFull)news((LANG_EN?`Servers are full: ${num(G.capLoad)} units needed, capacity ${num(capacity())}. Add racks in Company → Offices & servers.`:`Sunucular dolu: ${num(G.capLoad)} birim gerekiyor, kapasite ${num(capacity())}. Şirket → Taşınma ve sunucular bölümünden raf ekle.`),'bad');
  if(G.cash<0){
    G.neg++;
    if(G.neg>=3){G.over=true;G.speed=0;careerRecord('bankrupt');news((LANG_EN?"The company went bankrupt.":'Şirket iflas etti.'),'bad');openModal('over');}
    else news((LANG_EN?`Cash has gone negative! If you don't recover within ${3-G.neg} months, the company goes bankrupt. Take a loan, raise investment or let staff go.`:`Nakit eksiye düştü! ${3-G.neg} ay içinde toparlanmazsan şirket iflas eder. Kredi çek, yatırım al veya çalışan çıkar.`),'bad',true);
  }else{if(G.neg>0)(G.flags=G.flags||{}).recovered=true;G.neg=0;}
  if(!G.over){if(chalOn())rngSeed('ev'+G.day);else crn('ev');rollEvent();}
  if(!G.pending)scnCheck();
  if(!G.pending)storyCheck();
  achCheck();
  statsSnap();
  if(dateOf(G.day).getMonth()===0)pruneSoon();
  saveSoon();
}

