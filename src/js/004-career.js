/* ============================== CAREER ============================== */
const LEVELS=[(LANG_EN?"Junior":'Junior'),(LANG_EN?"Specialist":'Uzman'),(LANG_EN?"Senior":'Kıdemli'),(LANG_EN?"Manager":'Yönetici')];
const MGR_TITLE={soft:(LANG_EN?"Software Manager":'Yazılım Müdürü'),design:(LANG_EN?"Design Director":'Tasarım Direktörü'),hw:(LANG_EN?"Hardware Manager":'Donanım Müdürü'),res:(LANG_EN?"R&D Director":'Ar-Ge Direktörü'),mkt:(LANG_EN?"Marketing Manager":'Pazarlama Müdürü'),ops:(LANG_EN?"Operations Manager":'Operasyon Müdürü'),sup:(LANG_EN?"Customer Service Manager":'Müşteri Hizmetleri Müdürü'),sec:(LANG_EN?"Information Security Director":'Bilgi Güvenliği Direktörü')};
const XP_REQ=[0,120,360,720],SKILL_REQ=[0,4,6,7];
const levelTitle=e=>e.intern?(LANG_EN?"Intern":'Stajyer'):e.founder?(LANG_EN?"Founder":'Kurucu'):e.mgr?MGR_TITLE[e.role]:LEVELS[e.level||0];
const marketSal=e=>e.intern?salaryFor(e.skill)*0.35:salaryFor(e.skill)*(1+0.12*(e.level||0));
const levelFor=skill=>skill>=7?2:skill>=4.5?1:0;
const mgrOf=role=>G.emps.find(e=>e.mgr&&e.role===role);
function canPromoteOk(e,MG){if(e.founder||e.intern)return false;const L=e.level||0;if(L>=3)return false;const nx=L+1;if((e.xp||0)<XP_REQ[nx]||e.skill<SKILL_REQ[nx])return false;return !(nx===3&&(MG?MG[e.role]:mgrOf(e.role)));}
function canPromote(e){
  if(e.founder)return {ok:false,why:(LANG_EN?"Founder":'Kurucu')};
  if(e.intern)return {ok:false,why:(LANG_EN?"Intern: hire full-time first":'Stajyer: önce kadroya al')};
  const L=e.level||0;if(L>=3)return {ok:false,why:(LANG_EN?"Top level":'En üst kademe')};
  const nx=L+1;
  if((e.xp||0)<XP_REQ[nx])return {ok:false,why:(LANG_EN?`XP ${Math.floor(e.xp||0)}/${XP_REQ[nx]}`:`Deneyim ${Math.floor(e.xp||0)}/${XP_REQ[nx]}`)};
  if(e.skill<SKILL_REQ[nx])return {ok:false,why:(LANG_EN?`${LEVELS[nx]} requires skill ${SKILL_REQ[nx]}`:`${LEVELS[nx]} için yetenek ${SKILL_REQ[nx]} gerekli`)};
  if(nx===3){const m=mgrOf(e.role);if(m)return {ok:false,why:(LANG_EN?`The department already has a manager (${m.name})`:`Departmanın yöneticisi var (${m.name})`),slot:true};}
  return {ok:true,why:(LANG_EN?`Ready to become ${nx===3?MGR_TITLE[e.role]:LEVELS[nx]}`:`${nx===3?MGR_TITLE[e.role]:LEVELS[nx]} olmaya hazır`)};
}
function promote(e){
  const c=canPromote(e);if(!c.ok){showToast(c.why,'bad');return;}
  e.level=(e.level||0)+1;if(e.level===3)e.mgr=true;
  e.salary=Math.round(Math.max(e.salary*1.15,marketSal(e))/100)*100;e.morale=Math.min(100,e.morale+15);e.readySince=null;G.careerVer=(G.careerVer||0)+1;
  news(e.mgr?(LANG_EN?`${e.name} is now ${MGR_TITLE[e.role]}! They'll run the department (${money(e.salary)}/mo).`:`${e.name} artık ${MGR_TITLE[e.role]}! Departmanını yönetecek (${money(e.salary)}/ay).`):(LANG_EN?`${e.name} was promoted: ${LEVELS[e.level]} ${ROLES[e.role].n} (${money(e.salary)}/mo).`:`${e.name} terfi etti: ${LEVELS[e.level]} ${ROLES[e.role].n} (${money(e.salary)}/ay).`),'good',true);
  if(e.mgr)for(const o of G.emps)if(o.role===e.role&&o!==e)o.morale=Math.min(100,o.morale+3);
}
function demote(e){if(!e||!e.mgr)return;e.mgr=false;e.level=2;e.morale=Math.max(0,e.morale-20);e.readySince=null;G.careerVer=(G.careerVer||0)+1;news((LANG_EN?`${e.name} was removed as manager and is very upset.`:`${e.name} yöneticilikten alındı. Bu onu çok üzdü.`),'bad');}
const DEPT_CACHE={key:'',d:{},dd:-1,n:-1,c:-1,g:null};
function deptInfo(role){
  const D=DEPT_CACHE;if(D.key===''||D.dd!==G.day||D.n!==G.emps.length||D.c!==(G.careerVer||0)||D.g!==G){D.key='k';D.dd=G.day;D.n=G.emps.length;D.c=G.careerVer||0;D.g=G;D.d={};}
  if(DEPT_CACHE.d[role])return DEPT_CACHE.d[role];
  const m=G.emps.find(e=>e.mgr&&e.role===role&&!e.leave);
  const n=G.emps.filter(e=>e.role===role&&!e.mgr&&!e.leave).length;
  const limit=m?12:6,pen=Math.min(0.3,Math.max(0,n-limit)*0.02),bonus=m?0.015*m.skill*(m.morale<35?0.3:1)*(hasT(m,'leader')?1.5:1)*(m.leadT?1.25:1):0;
  return DEPT_CACHE.d[role]={m,n,limit,pen,bonus,mult:(1+bonus)*(1-pen)};
}
const mentor=e=>mentorOf(e)?1.6:(e.level||0)<2&&G.emps.some(o=>o!==e&&o.role===e.role&&(o.level||0)>=2&&!o.leave)?1.3:1;
function autoManage(){
  for(const r of DEV_ROLES){if(!deptInfo(r).m)continue;
    for(const e of G.emps){if(e.role!==r||e.mgr||e.proj||e.leave||inMeeting(e))continue;
      const pr=G.projects.filter(p=>p.req[r]&&p.prog[r]<p.req[r]).sort((a,b)=>(b.req[r]-b.prog[r])-(a.req[r]-a.prog[r]))[0];
      if(pr)e.proj=pr.id;}}
  const rm=deptInfo('res').m;
  if(rm&&G.autoRes&&!G.res.active){const r=RES.filter(x=>!has(x.id)&&(x.pre||[]).every(has)).sort((a,b)=>a.cost-b.cost)[0];
    if(r&&G.cash>resCostOf(r)*3&&resEarly(r)<1.5){spend(resCostOf(r),'other');G.res.active={id:r.id,p:0,rp:resRP(r)};news((LANG_EN?`${rm.name} started new research: ${r.n}.`:`${rm.name} yeni araştırmayı başlattı: ${r.n}.`));}}
}
function careerDaily(){
  const MG={};for(const o of G.emps)if(o.mgr&&!MG[o.role])MG[o.role]=o;
  for(const e of G.emps){
    if(!e.leave&&!inMeeting(e)&&isWorking(e))e.xp=(e.xp||0)+traitXP(e);
    if(!e.rev&&e.tr&&e.tr.length>1&&G.day-(e.hiredAt||0)>=45){e.rev=true;const t=TRAITS[e.tr[1]];news((LANG_EN?`You learned something new about ${e.name}: ${t.n}. ${t.d}.`:`${e.name} hakkında yeni bir şey öğrendin: ${t.n}. ${t.d}.`),t.k==='neg'?'bad':'good',true);}
    const ok=canPromoteOk(e,MG);
    if(ok&&e.readySince==null){e.readySince=G.day;news((LANG_EN?`${e.name} is ready for promotion: ${(e.level||0)+1===3?MGR_TITLE[e.role]:LEVELS[(e.level||0)+1]}. You can promote them under Team → Team & candidates.`:`${e.name} terfiye hazır: ${(e.level||0)+1===3?MGR_TITLE[e.role]:LEVELS[(e.level||0)+1]}. Ekip → Ekip ve adaylar bölümünden terfi ettirebilirsin.`),'good',true);}
    else if(!ok)e.readySince=null;
  }
  if(G.day%3===0)autoManage();
  teamDaily();wantDaily();
}
function xpBar(e){
  if(e.founder||e.mgr||(e.level||0)>=3)return '';
  const nx=(e.level||0)+1,req=XP_REQ[nx],v=Math.min(1,(e.xp||0)/req);
  return (LANG_EN?`<div class="skill" title="XP ${Math.floor(e.xp||0)}/${req} · skill ${SKILL_REQ[nx]} required"><div class="bar"><i style="width:${v*100}%;background:var(--pt-res)"></i></div><span class="num small">${Math.floor(e.xp||0)}/${req}</span></div>`:`<div class="skill" title="Deneyim ${Math.floor(e.xp||0)}/${req} · yetenek ${SKILL_REQ[nx]} gerekli"><div class="bar"><i style="width:${v*100}%;background:var(--pt-res)"></i></div><span class="num small">${Math.floor(e.xp||0)}/${req}</span></div>`);
}

