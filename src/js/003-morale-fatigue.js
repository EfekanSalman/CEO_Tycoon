/* ============================== MORALE & FATIGUE ============================== */
const PACE={relax:{n:(LANG_EN?"Relaxed":'Rahat'),out:0.85,drain:0.5,mor:6,d:(LANG_EN?"Output −15%, no fatigue buildup, morale +6":'Üretim −%15, yorgunluk birikmez, moral +6')},
  normal:{n:(LANG_EN?"Normal":'Normal'),out:1,drain:0.8,mor:0,d:(LANG_EN?"Balanced pace, slow fatigue over the long run":'Dengeli tempo, uzun vadede yavaş yorgunluk')},
  crunch:{n:(LANG_EN?"Intense":'Yoğun'),out:1.3,drain:2.0,mor:-15,d:(LANG_EN?"Output +30% but fast burnout, morale −15":'Üretim +%30 ama hızlı tükenme, moral −15')}};
const PERKS={
  food:{n:(LANG_EN?"Free meals":'Ücretsiz yemek'),d:(LANG_EN?"Morale +6":'Moral +6'),cost:300,mor:6},
  gym:{n:(LANG_EN?"Gym and lounge":'Spor ve dinlenme alanı'),d:(LANG_EN?"Energy recovery +60%, morale +3":'Enerji yenilenmesi +%60, moral +3'),cost:150,mor:3},
  flex:{n:(LANG_EN?"Flexible work":'Esnek çalışma'),d:(LANG_EN?"Morale +7, fatigue −15%, output −5%":'Moral +7, yorgunluk −%15, üretim −%5'),cost:0,mor:7},
  health:{n:(LANG_EN?"Private health insurance":'Özel sağlık sigortası'),d:(LANG_EN?"Illness risk −60%, morale +3":'Hastalık riski −%60, moral +3'),cost:250,mor:3},
  learn:{n:(LANG_EN?"Training budget":'Eğitim bütçesi'),d:(LANG_EN?"Monthly skill growth +30%, morale +2":'Aylık yetenek gelişimi +%30, moral +2'),cost:250,mor:2},
  stock:{n:(LANG_EN?"Stock options":'Hisse opsiyonu'),d:(LANG_EN?"Permanent morale +8, 2% of equity, irreversible":'Kalıcı moral +8, hisse payının %2\'si, geri alınamaz'),cost:0,mor:8,once:true},
};
const DEV_ROLES=['soft','design','hw'];
function newWell(){return {morale:Math.round(rnd(68,82)),energy:Math.round(rnd(88,100)),leave:null};}
function perkCost(){let c=0;for(const k in PERKS)if(G.perks[k])c+=PERKS[k].cost;return c*G.emps.length*infl()+wStipend();}
function energyF(e){return e.energy>=50?1:0.4+e.energy/50*0.6;}
function moraleF(e){return 0.8+e.morale/250;}
function deptRoomBonus(e){
  if(!G.furn||!G.furn.length)return 0;const fl=empFloor(e);
  if(DRB.key===''||DRB.d!==G.day||DRB.e!==G.emps.length||DRB.f!==G.furnVer||DRB.g!==G||DRB.dv!==DESKV){DRB.key='k';DRB.d=G.day;DRB.e=G.emps.length;DRB.f=G.furnVer;DRB.g=G;DRB.dv=DESKV;DRB.n={};DRB.rm={};}
  const nk=e.role+fl;if(DRB.rm[nk]==null)DRB.rm[nk]=G.furn.some(f=>f.t==='r_'+e.role&&(f.fl||0)===fl);if(!DRB.rm[nk])return 0;
  if(DRB.n[nk]==null)DRB.n[nk]=G.emps.filter(o=>o.role===e.role&&empFloor(o)===fl&&!o.leave).length;
  return (e.role==='res'?0.15:0.10)*Math.min(1,8/Math.max(1,DRB.n[nk]));
}
const DRB={key:'',n:{},rm:{}};
function effMult(e){if(e.um&&strikeOn())return 0;if(e.train&&e.train.until>G.day)return effMult0(e)*0.5;return effMult0(e);}
function effMult0(e){const lv=e.mgr?0.5:(1+0.05*(e.level||0))*deptInfo(e.role).mult;return PACE[G.pace].out*(G.perks.flex?0.95:1)*energyF(e)*moraleF(e)*lv*(1+deptRoomBonus(e))*traitOut(e)*cvOut(e);}
/* Bütün çalışanlar için aynı olan moral nedenleri. Günlük moral turunda (step0) bir kez hesaplanır ve MCTX'te tutulur;
   tur dışında (arayüz) her çağrıda yeniden hesaplanır. */
let MCTX=null;
function moraleShared(){const S={nf:[],all:[],ev:[],mood:[],moodUm:[],um:[],pace:null,campus:null,depOk:null,room:{}};
  if(ceoSk('l1'))S.nf.push([(LANG_EN?"Inspiring CEO":'İlham veren CEO'),3]);
  if(PACE[G.pace].mor)S.pace=[(LANG_EN?`${PACE[G.pace].n} work pace`:`${PACE[G.pace].n} çalışma temposu`),PACE[G.pace].mor];
  for(const k in PERKS)if(G.perks[k])S.all.push([PERKS[k].n,PERKS[k].mor]);
  if(G.office)S.all.push([(LANG_EN?`Office: ${OFFICES[G.office].n}`:`Ofis: ${OFFICES[G.office].n}`),G.office*2]);
  if(G.momentum>=1)S.all.push([(LANG_EN?"Successful product launches":'Başarılı ürün çıkışları'),Math.round(Math.min(10,G.momentum))]);
  if(G.layoff>=1)S.all.push([(LANG_EN?"Recent layoffs":'Yakın zamandaki işten çıkarmalar'),-Math.round(Math.min(15,G.layoff))]);
  if(G.cash<0)S.all.push([(LANG_EN?"Company is short on cash":'Şirket nakit sıkıntısında'),-10]);
  if(G.day<G.teamEventUntil)S.ev.push([(LANG_EN?"Team event":'Takım etkinliği'),8]);
  for(const x of (G.mood||[]))if(x.until>G.day)(x.mem?S.moodUm:S.mood).push([x.n,x.v]);
  if(G.union&&G.union.st==='union')S.um.push([(LANG_EN?"Union protection":'Sendika güvencesi'),3]);
  if(strikeOn())S.um.push([(LANG_EN?"On strike":'Grevde'),-8]);
  if(megaOn('campus'))S.campus=[(LANG_EN?"Company campus":'Şirket kampüsü'),5];
  return S;}
/* turda önbelleğe alınabilen çalışan başı aramalar */
const mDepOk=S=>{if(!S)return null;if(S.depOk==null)S.depOk=!!(G.dep?G.dep.auto:true)&&invTot()<depotCap();return S.depOk;};
function mRoom(S,e){const fl=empFloor(e),k=e.role+'|'+fl;if(S&&S.room[k]!=null)return S.room[k];const v=!!(G.furn&&G.furn.some(f=>f.t==='r_'+e.role&&(f.fl||0)===fl));if(S)S.room[k]=v;return v;}
function moraleDrivers(e){const S=MCTX||moraleShared();
  const d=[];if(!e.founder)for(const x of S.nf)d.push(x);
  if(e.founder){d.push([(LANG_EN?"Own company":'Kendi şirketin'),20]);if(G.life){const b=G.life.bal;if(b<40)d.push([(LANG_EN?"Neglecting personal life":'Özel hayat ihmal ediliyor'),-Math.round((40-b)/3)]);else if(b>70)d.push([(LANG_EN?"A balanced life":'Dengeli bir hayat'),4]);}}
  else{const r=e.salary/marketSal(e),v=Math.round(clamp((r-1)*120*(hasT(e,'merc')?1.6:1),-40,30));
    if(Math.abs(v)>=1)d.push([r<1?(LANG_EN?`Salary ${Math.round((1-r)*100)}% below market`:`Maaşı piyasanın %${Math.round((1-r)*100)} altında`):(LANG_EN?`Salary ${Math.round((r-1)*100)}% above market`:`Maaşı piyasanın %${Math.round((r-1)*100)} üstünde`),v]);}
  {const fm=Math.round(furnFx(empFloor(e)).mor*(hasT(e,'social')?1.5:1));if(fm>=1)d.push([(LANG_EN?"Office furniture":'Ofis mobilyaları'),fm]);}
  if(e.mgr)d.push([(LANG_EN?"Being a manager":'Yönetici olmak'),6]);
  if(e.acqFrom&&e.acqFrom.until>G.day){d.push([(LANG_EN?`${e.acqFrom.name} culture (${CULT[e.acqFrom.c].n})`:`${e.acqFrom.name} kültürü (${CULT[e.acqFrom.c].n})`),cultureFit(e.acqFrom.c)]);if(e.acqFrom.bonus)d.push([(LANG_EN?"Retention bonus":'Tutma primi'),8]);}
  if(mRoom(MCTX,e))d.push([FURN['r_'+e.role].n,2]);
  {const wait=hasT(e,'ambit')?20:45;if(e.readySince!=null&&G.day-e.readySince>wait)d.push([(LANG_EN?"Awaiting promotion":'Terfi bekliyor'),-Math.round(Math.min(hasT(e,'ambit')?20:15,(5+(G.day-e.readySince-wait)/10)*(hasT(e,'ambit')?1.5:1)))]);}
  if(e.tr&&G.emps.length>1){const tt=teamTraits(e);if(tt.toxic>0)d.push([(LANG_EN?"A combative teammate":'Kavgacı bir ekip arkadaşı'),-5*Math.min(2,tt.toxic)]);if(tt.leader>0)d.push([(LANG_EN?"An inspiring teammate":'İlham veren bir ekip arkadaşı'),3]);if(tt.helper>0)d.push([(LANG_EN?"Helpful teammates":'Yardımsever ekip arkadaşları'),2]);}
  if(!e.founder&&!e.mgr){const di=deptInfo(e.role);if(di.m)d.push([di.m.morale<35?(LANG_EN?"Manager is unhappy":'Yöneticisi mutsuz'):(LANG_EN?"Has a good manager":'İyi bir yöneticisi var'),di.m.morale<35?-4:4]);else if(di.n>6)d.push([(LANG_EN?"Large team, no manager":'Kalabalık ekip, yönetici yok'),-4]);}
  if(e.energy<40)d.push([(LANG_EN?"Fatigue":'Yorgunluk'),-Math.round((40-e.energy)*0.5)]);
  if(S.pace&&!(S.pace[1]<0&&hasT(e,'calm')))d.push(S.pace);
  for(const x of S.all)d.push(x);
  if(DEV_ROLES.includes(e.role)&&!e.proj&&!e.leave){const da=MCTX?(mDepOk(MCTX)||(!!e.mk&&invTot()<depotCap()))&&!e.proj&&!e.leave&&DEV_ROLES.includes(e.role):depActive(e);d.push(da?[(LANG_EN?"Producing for the depot, waiting for a project":'Depoya üretiyor, proje bekliyor'),-2]:[(LANG_EN?"Idle and bored":'Boşta, sıkılıyor'),-5]);}
  for(const x of S.ev)d.push(x);
  if(!e.founder){for(const x of S.mood)d.push(x);if(e.um)for(const x of S.moodUm)d.push(x);}
  if(e.um)for(const x of S.um)d.push(x);
  cvDrivers(e,d);teamDrivers(e,d);wantDrivers(e,d);
  if(!e.founder&&S.campus)d.push(S.campus);
  return d;
}
function moraleTarget(e){const d=moraleDrivers(e);let s=60;for(let i=0;i<d.length;i++)s+=d[i][1];return clamp(s,0,100);}
function wellbeing(e){
  if(e.leave){
    e.energy=Math.min(100,e.energy+(e.leave.type==='vac'?12:8)+(e.founder&&G.life&&(G.life.own.villa||G.life.own.yali)?3:0));
    if(G.day>=e.leave.until){if(e.leave.type==='train'){const k=e.leave.k;e.leave=null;finishTrain(e,k);}else{news(`${e.name} ${e.leave.type==='vac'?(LANG_EN?"is back from vacation, looking rested":'tatilden döndü, dinlenmiş görünüyor'):(LANG_EN?"is back at work":'işe döndü')}.`);e.leave=null;}}
  }else{
    const busy=DEV_ROLES.includes(e.role)?!!e.proj:e.role==='res'?!!G.res.active:e.role==='sup'?(G.supStat?G.supStat.in>0.5:false):true;
    if(inMeeting(e)){}
    else if(busy)e.energy+=0.6+(G.perks.gym?0.35:0)+furnFx(empFloor(e)).en-PACE[G.pace].drain*(G.perks.flex?0.85:1)*traitDrain(e)*(1-0.25*cvK('denge'));
    else e.energy+=5;
    e.energy=clamp(e.energy,0,100);
    if(e.energy<=0.5){e.leave={type:'burn',until:G.day+14};e.morale=Math.max(0,e.morale-12);news((LANG_EN?`${e.name} burned out and took 14 days of leave.`:`${e.name} tükenmişlik yaşadı ve 14 gün izne çıktı.`),'bad',true);}
    else if(e.energy<20&&Math.random()<(G.perks.health?0.004:0.01)){e.leave={type:'sick',until:G.day+rint(4,9)};news((LANG_EN?`${e.name} is sick and out for ${e.leave.until-G.day} days.`:`${e.name} hastalandı, ${e.leave.until-G.day} gün yok.`),'bad');}
  }
  e.morale=clamp(e.morale+(moraleTargetDaily(e)-e.morale)*0.025,0,100);
}
/* günlük moral turu için hedef: her çalışanın hedefi 3 günde bir (kimliğe göre dağıtılarak) yeniden hesaplanır, aradaki günlerde
   önbellekten okunur. Moral hedefe günde yalnızca %2,5 yaklaştığı için en fazla 2 günlük eski hedef dinamiği fark edilir biçimde
   değiştirmez; 16 yıllık kayıtta günün yaklaşık %10'unu kazandırır. Önbellek kayda girmez (yüklemede ilk gün hesaplanır). */
const MTC=new WeakMap();
function moraleTargetDaily(e){const c=MTC.get(e);if(c&&c.g===G&&G.day-c.d<3&&(G.day+(e.id|0))%3!==0)return c.v;const v=moraleTarget(e);MTC.set(e,{v,d:G.day,g:G});return v;}
function moraleState(v){return v>=70?[(LANG_EN?"Happy":'Mutlu'),'st-ok','var(--ok)']:v>=45?[(LANG_EN?"Normal":'Normal'),'st-mute','var(--pt-soft)']:v>=30?[(LANG_EN?"Unhappy":'Mutsuz'),'st-warn','var(--warn)']:[(LANG_EN?"Resignation risk":'İstifa riski'),'st-bad','var(--bad)'];}
function energyState(v){return v>=60?[(LANG_EN?"Fresh":'Dinç'),'st-ok','var(--ok)']:v>=35?[(LANG_EN?"Tired":'Yorgun'),'st-warn','var(--warn)']:[(LANG_EN?"Burned out":'Tükenmiş'),'st-bad','var(--bad)'];}
const LEAVE_N={vac:(LANG_EN?"On vacation":'Tatilde'),sick:(LANG_EN?"Sick":'Hasta'),burn:(LANG_EN?"Burnout leave":'Tükenmişlik izni'),train:(LANG_EN?"In training":'Eğitimde')};
function meter(v,st){return `<div class="skill" title="${Math.round(v)}/100"><div class="bar"><i style="width:${v}%;background:${st[2]}"></i></div><span class="num small">${Math.round(v)}</span></div>`;}
function migrate(g){
  g.emps=empUncols(g.emps);g.cands=empUncols(g.cands);
  for(const n of g.news||[])if(n&&n.c==='diger'){delete n.c;n.c=newsCat(n);}
  for(const e of g.emps){if(!e.tr){e.tr=e.founder?['leader']:pickTraits();e.rev=true;e.hiredAt=e.hiredAt||0;}if(e.morale==null)Object.assign(e,newWell());if(e.level==null){e.level=e.founder?0:levelFor(e.skill);e.xp=XP_REQ[e.level];}}
  if(g.autoRes==null)g.autoRes=false;
  for(const c of g.comps||[]){if(c.aggr==null)c.aggr=0.2+Math.random()*0.65;if(!c.strat)c.strat=pickStrat(c);}if(!g.rlog)g.rlog=[];if(!g.union)g.union=newUnion();if(!g.execs)g.execs={};if(!g.vc)g.vc=newVC();if(!g.dev)g.dev=newDev();if(!g.esg)g.esg=newEsg();if(!g.aw)g.aw=newAw();if(!g.ar)g.ar=newAr();if(!g.bi)g.bi=newBi();if(!g.soc)g.soc=newSoc();if(!g.sb)g.sb=newSb();if(!g.cs)g.cs=newCs();if(!g.space)g.space=newSpace();if(!g.adv)g.adv=newAdv();if(!g.quest)g.quest=newQuest();if(!g.bm)g.bm=newBm();if(!g.hto)g.hto=newHto();if(!g.aiw)g.aiw=newAiw();if(!g.dp)g.dp=newDp();if(!g.shops)g.shops=newShops();if(!g.bun)g.bun=newBun();if(!g.fair)g.fair=newFair();if(!g.era)g.era=newEra(g.day||0);if(!g.qc)g.qc=newQc();if(!g.rf)g.rf=newRf();if(!g.mrg)g.mrg=newMrg();if(!g.pitch)g.pitch=newPitch();if(!g.inbox)g.inbox=[];if(!g.cv)g.cv=newCv();if(!g.mega)g.mega=newMega();if(!g.nem)g.nem=newNem();if(!g.prc)g.prc=newPrc();if(!g.mac)g.mac=newMac(g.day||0);if(!g.fx)g.fx=newFx();if(!g.tw)g.tw=newTw();if(!g.ceoP)g.ceoP=[];if(!g.tnd)g.tnd=newTnd();if(!g.lab)g.lab=newLab();if(!g.ipl)g.ipl=newIpl();if(g.scnDef&&g.scn&&String(g.scn.id).startsWith('u_')){try{scnFromDef(g.scnDef);}catch(e){}}if(!g.xlog)g.xlog=[];if(!g.mood)g.mood=[];
  if(!isFinite(g.brand))g.brand=10;if(!isFinite(g.momentum))g.momentum=0;if(!isFinite(g.cash))g.cash=0;for(const k in g.month||{})if(!isFinite(g.month[k]))g.month[k]=0;
  if(!g.mkt)g.mkt=newMkt();if(!g.plants)g.plants={};if(!g.dcs)g.dcs=[];if(!g.dcPm)g.dcPm=1;
  for(const p of g.products||[]){delete p._a;delete p._b;}
  if(g.base==null)g.base=0;if(g.cbase==null)g.cbase=0;if(g.px&&g.px.gpu==null){g.px.gpu=1;g.pxh.gpu=[];g.sup.gpu='s13';}if(g.px&&g.px.motor==null){g.px.motor=1;g.pxh.motor=[];g.sup.motor='s15';}
  if(g.comps&&!g.newCats){g.newCats=1;const _G=G;G=g;try{for(const sd of COMP_SEED.filter(x=>NEW_CAT_SEEDS.includes(x.name))){if(g.comps.some(c=>c.name===sd.name))continue;
    const c=makeComp({...sd,cash:sd.cash*infl()},'c'+nid());c.born=g.day;g.comps.push(c);for(const f of c.focus){aiLaunch(c,f,true,g.day-rint(30,200));}}}finally{G=_G;}}
  if(g.base==null)g.base=0;if(g.wealth==null)g.wealth=0;if(g.careerVer==null)g.careerVer=0;
  if((OFFICES[g.office].maxF||1)>1&&g.furn){for(const f of [...g.furn]){const F=FURN[f.t];const [w,d]=f.r?[F.d,F.w]:[F.w,F.d];if(f.x===0&&f.y<=3&&f.y+d>1){g.furn=g.furn.filter(x=>x!==f);g.furnInv=g.furnInv||{};g.furnInv[f.t]=(g.furnInv[f.t]||0)+1;g.furnVer=(g.furnVer||0)+1;}}}
  if(g.rounds&&g.rounds.ipo&&!g.pub){const mc=Math.max(1e7,g.cash*5);g.pub={shares:1e8,price:mc/1e8,sent:1,hist:[mc/1e8],q:[],qProfit:0,qMonths:0,exp:null,miss:0,start:g.day};}
  if(g.floors==null){const o=OFFICES[g.office];g.floors=Math.min(o.maxF,Math.max(1,Math.ceil(g.emps.length/o.cap)));}
  g.furn=g.furn||[];g.furnInv=g.furnInv||{};g.furnVer=g.furnVer||0;if(g.meeting===undefined)g.meeting=null;if(g.allAt==null)g.allAt=-999;
  g.pace=g.pace||'normal';g.perks=g.perks||{};g.momentum=g.momentum||0;g.layoff=g.layoff||0;
  g.deals=g.deals||[];g.offers=g.offers||[];g.branches=g.branches||{};g.pats=g.pats||[];g.patPend=g.patPend||[];g.patFiled=g.patFiled||{};g.cases=g.cases||[];g.cross=g.cross||{};g.gov=g.gov||newGov();g.cyber=g.cyber||newCyber();g.unis=g.unis||{};g.acqs=g.acqs||[];g.life=g.life||newLife();g.tut=g.tut||{on:false,step:99,seen:{}};g.ach=g.ach||{};g.flags=g.flags||{};g.diff=g.diff||{...DIFFS.normal};g.stats=g.stats||[];g.tl=g.tl||[];g.ms=g.ms||{};g.internCands=g.internCands||[];
  if(!g.scn)g.scn={id:'free',end:null,won:null,fail:null};if(!g.mods)g.mods={};
  if(!g.regions){g.regions=newRegions();g.latFx=1;g.rm={};g.rl={};}
  for(const c of g.comps||[])if(!c.reg){const sd=COMP_SEED.find(x=>x.name===c.name);c.reg=sd&&sd.reg?[...sd.reg]:['tr',...REG_ORDER.slice(1).filter(()=>Math.random()<0.35)];}
  if(g.teamEventUntil==null)g.teamEventUntil=-1;if(g.teamEventAt==null)g.teamEventAt=-999;
  return g;
}


