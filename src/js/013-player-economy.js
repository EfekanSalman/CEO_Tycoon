/* ============================== PLAYER ECONOMY ============================== */
function invValue(){let v=0;for(const k in G.stock)v+=G.stock[k].v;for(const p of G.products)if(p.owner==='P'&&p.fgv)v+=p.fgv;return v;}
function facUpkeep(f){return fxCostR(f.region)*FTYPES[f.type].upkeep*(1+0.25*(f.lines-1))*(f.green?1.05:energyMult())*(incOk('fab')&&f.region==='turkiye'?0.75:1)*(ceoSk('o1')?0.9:1)*facUpk(f);}
function monthlyEst(){
  let rev=0,cost=0;
  for(const p of G.products){
    if(!p.active||p.owner!=='P')continue;
    if(isHW(p)){rev+=p.sr*p.price;cost+=p.sr*estUC(p.cat,p.spec,p.plan.site);}
    else{rev+=p.units*revPerUser(p);cost+=p.units*p.unitCost*(HW.includes(p.cat)?pxMult(p.cat):1);}
  }
  {const rl=G.rl||{},t=REG_ORDER.reduce((a,r)=>a+(rl[r]||0),0);if(t>0&&G.fx)rev*=REG_ORDER.reduce((a,r)=>a+(rl[r]||0)*fxRevM(r),0)/t;}
  const salary=(G.emps.reduce((a,e)=>a+e.salary,0)*(incOk('jobs')?0.96:1)*(ceoSk('l4')?0.97:1)+perkCost())*fxSal()+(G.branches?brCostAll():0)+divCostAll()+xCost(),rent=officeRent()+(G.regions?regFees():0),infra=G.racks*rackUpkeep()+cyToolCost()+dcUpkeepAll()+pmOverhead()+(G.dev?ossCost():0)+esgCost();
  const fact=G.factories.reduce((a,f)=>a+facUpkeep(f),0)+plantsUpkeep(),interest=G.debt*loanRate();
  rev+=(G.storeRev||0)+(G.gameRev||0)+(G.iotRev||0)+(G.plantRev||0)+(G.dcRev||0)+(G.dev&&G.dev.apiRev||0);
  const mkt=mktBudget(),pre=rev-cost-salary-rent-infra-fact-interest-mkt,tax=Math.max(0,pre-(G.gov&&G.gov.lossCF||0))*taxRate()*(rev<500000*infl()?0.5:1)+carbonTax();
  return {rev,cost,salary,rent,infra,fact,interest,mkt,tax,profit:pre-tax};
}
function valuation(){
  const h=G.hist.slice(-3);const avg=h.length?h.reduce((a,x)=>a+x.profit-((x.m&&x.m.pas)||0),0)/h.length:0;
  const m=monthlyEst();
  return Math.max(0,Math.max(0,G.cash)-G.debt+(Math.max(0,avg,m.profit)*12*6+G.brand*30000)*macPE()+invValue()*0.8+G.factories.reduce((a,f)=>a+f.cost*0.5,0)+vcValue()*0.8+(pfValue()+reValue())*0.9+mdValue()+(typeof spnValue==='function'?spnValue()*0.8:0)+50000);
}
const roundMult=()=>(1+Math.min(0.3,(G.fame||0)/100))*esgRound()*cofRound()*arRound()*(ceoSk('f2')?1.08:1);
function loanLimit(){return Math.max(250000,valuation()*0.3*(G.mac?MPH[G.mac.ph].loan:1));}
function teamAvg(roles){const es=G.emps.filter(e=>roles.includes(e.role));return es.length?es.reduce((a,e)=>a+e.skill,0)/es.length:0;}
const REQ_ROLES={app:['soft','design'],saas:['soft','design'],os:['soft','design'],cpu:['hw','soft'],phone:['hw','design','soft'],pc:['hw','design','soft'],wear:['hw','design','soft'],console:['hw','design','soft'],ai:['soft','design'],xr:['hw','design','soft'],car:['soft','design'],robo:['hw','soft','design'],iot:['hw','soft','design'],qc:['hw','soft','design']};
const SUBP=cat=>cat==='saas'||cat==='os'||cat==='ai'||cat==='car';

function spec(d,avg){
  const cat=d.cat,k=1+years()*0.08,sf=0.85+avg*0.03;
  const sw=(has('fw')?1.1:1)*(has('ml')?1.1:1);
  const r={cat,req:{},score:0,uc:0,fair:0,err:null,spec:null,site:null};
  if(cat==='app'){r.req={soft:400*k,design:200*k};r.score=S(cat)*(0.5+avg*0.08)*sw;}
  else if(cat==='saas'){r.req={soft:900*k,design:300*k};r.score=S(cat)*(0.5+avg*0.08)*sw;r.uc=1;}
  else if(cat==='os'){r.req={soft:3500*k,design:900*k};r.score=S(cat)*(0.5+avg*0.08)*sw;}
  else if(cat==='car'){r.req={soft:3000*k,design:500*k};r.score=S(cat)*(0.5+avg*0.08)*sw*(has('adas')?1.15:1)*(has('sec1')?1.03:1);}
  else if(cat==='ai'){r.req={soft:2500*k,design:400*k};r.score=S(cat)*(0.5+avg*0.08)*sw*(has('llm')?1.15:1)*(myActive('app').length||myActive('saas').length?1.08:1);r.uc=aiUC();}
  else if(cat==='cpu'){
    const ni=Math.max(0,nodeIdx(d.node)),n=NODES[ni];
    const cores=Math.min(d.cores,n.cores),clk=Math.min(d.clock,n.clk);
    r.req={hw:(900+cores*150+clk*250+ni*500)*k,soft:200*k};
    r.score=9*Math.sqrt(cores)*clk*n.mult*sf*(has('ai')?1.2:1);
    r.spec={node:n.id,cores,clk};
  }else{
    const cpu=prod(d.cpu),os=prod(d.os);
    if(!cpu||!alive(cpu.owner))r.err=(LANG_EN?"Pick a processor":'Bir işlemci seç');
    else if(!NO_OS.includes(cat)&&(!os||!alive(os.owner)))r.err=(LANG_EN?"Pick an operating system":'Bir işletim sistemi seç');
    r.req=cat==='phone'?{hw:1800*k,design:700*k,soft:500*k}:cat==='wear'?{hw:900*k,design:600*k,soft:300*k}:cat==='console'?{hw:1600*k,design:500*k,soft:900*k}:cat==='xr'?{hw:1500*k,design:700*k,soft:800*k}:cat==='robo'?{hw:4500*k,design:900*k,soft:3500*k}:cat==='iot'?{hw:600*k,design:300*k,soft:400*k}:cat==='qc'?{hw:6000*k,design:600*k,soft:4000*k}:{hw:1200*k,design:300*k,soft:200*k};
    if(!r.err){
      if(cat==='phone'){const a=PARTS.screen[d.screen],b=PARTS.camera[d.camera],c=PARTS.battery[d.battery];
        r.score=(cpu.score*0.5+os.score*0.25+a.s+b.s+c.s)*sf;r.spec={cpu:cpu.id,os:os.id,screen:d.screen,camera:d.camera,battery:d.battery};}
      else if(cat==='wear'){const a=PARTS.sensor[d.sensor]||PARTS.sensor[0],b=PARTS.wbat[d.wbat]||PARTS.wbat[0];
        r.score=(cpu.score*0.2+os.score*0.2+a.s+b.s)*sf;r.spec={cpu:cpu.id,os:os.id,sensor:PARTS.sensor[d.sensor]?d.sensor:0,wbat:PARTS.wbat[d.wbat]?d.wbat:0};}
      else if(cat==='xr'){const a=PARTS.optic[d.optic]||PARTS.optic[0],b=PARTS.battery[d.battery]||PARTS.battery[0];
        r.score=(cpu.score*0.4+os.score*0.2+a.s+b.s)*sf;r.spec={cpu:cpu.id,os:os.id,optic:PARTS.optic[d.optic]?d.optic:0,battery:PARTS.battery[d.battery]?d.battery:0};}
      else if(cat==='qc'){const a=PARTS.qubit[d.qubit]||PARTS.qubit[0],b=PARTS.cryo[d.cryo]||PARTS.cryo[0];
        r.score=(cpu.score*0.1+a.s+b.s)*sf*(has('ai')?1.05:1);r.spec={cpu:cpu.id,qubit:PARTS.qubit[d.qubit]?d.qubit:0,cryo:PARTS.cryo[d.cryo]?d.cryo:0};}
      else if(cat==='iot'){const a=PARTS.sensor[d.sensor]||PARTS.sensor[0],b=PARTS.radio[d.radio]||PARTS.radio[0];
        r.score=(cpu.score*0.15+a.s+b.s+20)*sf;r.spec={cpu:cpu.id,sensor:PARTS.sensor[d.sensor]?d.sensor:0,radio:PARTS.radio[d.radio]?d.radio:0};}
      else if(cat==='robo'){const a=PARTS.actuator[d.actuator]||PARTS.actuator[0],b=PARTS.rsense[d.rsense]||PARTS.rsense[0];
        r.score=(cpu.score*0.4+a.s+b.s)*sf*(has('llm')?1.08:1);r.spec={cpu:cpu.id,actuator:PARTS.actuator[d.actuator]?d.actuator:0,rsense:PARTS.rsense[d.rsense]?d.rsense:0};}
      else if(cat==='console'){const a=PARTS.gpu[d.gpu]||PARTS.gpu[0],b=PARTS.ram[d.ram],c=PARTS.storage[d.storage];
        r.score=(cpu.score*0.6+a.s+b.s*0.5+c.s*0.5)*sf;r.spec={cpu:cpu.id,gpu:PARTS.gpu[d.gpu]?d.gpu:0,ram:d.ram,storage:d.storage};}
      else{const a=PARTS.ram[d.ram],b=PARTS.storage[d.storage];
        r.score=(cpu.score*0.8+os.score*0.25+a.s+b.s)*sf;r.spec={cpu:cpu.id,os:os.id,ram:d.ram,storage:d.storage};}
    }
  }
  const F=d.focus?faFx(cat,d.focus):null;if(F){r.score*=F.sc;for(const t in r.req)r.req[t]*=F.req;r.fx=F;}
  if(r.spec){r.site=defaultSite(cat,r.spec);r.uc=estUC(cat,r.spec,r.site);}
  if(F&&F.uc!==1){if(r.spec){r.spec.ucx=Math.round(r.uc*(F.uc-1)*100)/100;r.uc+=r.spec.ucx;}else r.uc*=F.uc;}
  if(Array.isArray(d.feats))ftSpec(r,d);
  {const tb=typeof tdnBoost==='function'?tdnBoost(cat):0;if(tb){r.score*=1+tb;r.td=tb;}}
  for(const t in r.req)r.req[t]=Math.round(r.req[t]);
  r.v=r.score/S(cat);
  const ref=CATS[cat].ref;
  r.fair=cat==='app'?CATS.app.arpu:Math.max(r.uc*1.15,ref*Math.pow(r.v,1.2));
  r.fair=SUBP(cat)?Math.round(r.fair*100)/100:Math.round(r.fair);
  return r;
}
const projFrac=pr=>{let a=0,b=0;for(const t in pr.req){a+=pr.prog[t];b+=pr.req[t];}return b?a/b:1;};
function projDone(pr){return Object.keys(pr.req).every(t=>pr.prog[t]>=pr.req[t]);}
const REVIEW_Q=[[9,(LANG_EN?"\"A product of the year contender.\"":'"Yılın ürünü adayı."')],[8,(LANG_EN?"\"Good enough to push its rivals.\"":'"Rakiplerini zorlayacak kadar iyi."')],[6.5,(LANG_EN?"\"Solid but ordinary.\"":'"Sağlam ama sıradan."')],[5,(LANG_EN?"\"Mediocre for the price.\"":'"Fiyatına göre vasat."')],[0,(LANG_EN?"\"Stay away.\"":'"Uzak durun."')]];
function toolCost(d){
  if(d.cat==='cpu'){const n=nodeOf(d.node)||NODES[0];return 5e5*n.cm*n.cm*infl();}
  return ({phone:4e5,pc:2.5e5,wear:1.5e5,console:3e5,xr:3.5e5,robo:2e6,iot:1e5,qc:8e6}[d.cat]||0)*infl();
}
const UPD={refac:{n:(LANG_EN?"Debt cleanup":'Borç temizliği'),f:0.3,d:(LANG_EN?"Cleans up the code: tech debt down 60%, bugs cut in half. Score stays the same.":'Kodu düzenler: teknik borç %60, hatalar yarı yarıya azalır. Puan değişmez.')},rewrite:{n:(LANG_EN?"Rewrite":'Yeniden yazım'),f:0.6,d:(LANG_EN?"Rewrites the product from scratch on a clean foundation: debt and bugs reset to zero, and the software score moves up to today's tech. Takes a long time.":'Ürünü temiz bir altyapıyla baştan yazar: borç ve hatalar sıfırlanır, yazılımda puan bugünkü teknolojiye taşınır. Uzun sürer.')},minor:{n:(LANG_EN?"Minor update":'Küçük güncelleme'),f:0.25,d:(LANG_EN?"Fixes bugs and nudges the score up. The press doesn't re-review it.":'Hataları giderir, puanı biraz artırır. Basın yeniden değerlendirmez.')},
  major:{n:(LANG_EN?"Major update":'Büyük güncelleme'),f:0.55,d:(LANG_EN?"Brings the product up to today's tech. Hardware switches to the best processor and parts. The press re-reviews it.":'Ürünü bugünün teknolojisine taşır. Donanımda en iyi işlemci ve parçalara geçilir. Basın yeniden değerlendirir.')}};
const verStr=p=>p.ver?`${Math.floor(p.ver)}.${Math.round((p.ver%1)*10)}`:'1.0';
const bestPart=(k,cur)=>{let b=cur||0;PARTS[k].forEach((x,i)=>{if((!x.r||has(x.r))&&i>b)b=i;});return b;};
function updDraft(p,kind){
  const d={cat:p.cat,name:p.name,price:p.price,assign:true};if(p.focus)d.focus={...p.focus};if(Array.isArray(p.feats))d.feats=[...p.feats];
  if(!p.spec)return d;
  if(p.cat==='cpu'){const nodes=NODES.filter(n=>has(n.r)),n=kind==='major'?nodes[nodes.length-1]||nodeOf(p.spec.node):nodeOf(p.spec.node);
    return {...d,node:n.id,cores:kind==='major'?Math.min(n.cores,Math.max(p.spec.cores,Math.ceil(p.spec.cores*1.5))):p.spec.cores,clock:kind==='major'?Math.min(n.clk,p.spec.clk+0.4):p.spec.clk};}
  Object.assign(d,p.spec);
  if(kind==='major'){
    const cpus=G.products.filter(q=>q.cat==='cpu'&&q.active&&alive(q.owner)).sort((a,b)=>b.score-a.score);
    const own=cpus.find(q=>q.owner==='P'&&q.spec);const best=own&&cpus[0]&&own.score>=cpus[0].score*0.9?own:cpus[0];if(best)d.cpu=best.id;
    if(!NO_OS.includes(p.cat)){const os=prod(d.os);if(!os||!alive(os.owner)||!os.active){const oss=G.products.filter(q=>q.cat==='os'&&q.active&&alive(q.owner)).sort((a,b)=>(b.owner==='P')-(a.owner==='P')||b.score-a.score);if(oss[0])d.os=oss[0].id;}}
    for(const k of ['screen','camera','battery','ram','storage','sensor','wbat','gpu','optic','rsense','actuator','radio','qubit','cryo'])if(d[k]!=null)d[k]=bestPart(k,d[k]);
  }
  return d;
}
function updPlan(p,kind,add){
  if(kind==='refac'||kind==='rewrite'){const d=updDraft(p,'minor'),avg=teamAvg(REQ_ROLES[p.cat])||3,r=spec(d,avg),base=Object.values(r.req).reduce((a,b)=>a+b,0)||1000;
    const req=kind==='refac'?{soft:Math.max(1,Math.round(base*0.22*(0.5+tdOf(p)/100)))}:{soft:Math.max(1,Math.round(base*0.55)),design:Math.max(1,Math.round(base*0.15))};
    const sw=!HW.includes(p.cat);return {d,r,req,after:kind==='rewrite'&&sw?Math.max(p.score,r.score*0.9):p.score,tool:0,err:null};}
  const d=updDraft(p,kind);if(add&&add.length)d.feats=[...new Set([...(d.feats||[]),...add])];const avg=teamAvg(REQ_ROLES[p.cat])||3,r=spec(d,avg),U=UPD[kind],gain=add&&add.length?ftGain(p.cat,p.feats,d.feats):1;
  const req={};for(const t in r.req)req[t]=Math.max(1,Math.round(r.req[t]*U.f*tdUpd(p)*(kind==='minor'&&HW.includes(p.cat)&&t!=='soft'?0.4:1)));
  const fresh=p.spec||!HW.includes(p.cat)?r.score:p.score;
  const n=p.updN||0,after=kind==='minor'?Math.max(p.score*Math.max(1.02,1.06-0.01*n),fresh*0.85)*gain:Math.max(p.score*1.1,fresh*0.97);
  const tool=kind==='major'&&p.spec&&HW.includes(p.cat)?toolCost(d)*0.3:0;
  return {d,r,req,after,tool,err:p.spec&&kind==='major'?r.err:null};
}
function updBlock(p){if(!p||p.owner!=='P'||!(p.active||p.waitLaunch))return (LANG_EN?"Product isn't on the market.":'Ürün piyasada değil.');if(G.projects.some(x=>x.upd&&x.upd.pid===p.id))return (LANG_EN?"An update is already in progress for this product.":'Bu ürün için zaten bir güncelleme sürüyor.');return '';}
function finishUpdate(pr){
  G.projects=G.projects.filter(x=>x!==pr);
  const team=G.emps.filter(e=>e.proj===pr.id);for(const e of team){e.proj=null;e.xp=(e.xp||0)+15;}
  const p=prod(pr.upd.pid),kind=pr.upd.kind;
  if(!p||!(p.active||p.waitLaunch)){news((LANG_EN?`${pr.name} is done, but the product is no longer on the market.`:`${pr.name} tamamlandı ama ürün artık piyasada değil.`),'bad');return;}
  const avg=pr.pts?pr.sk/pr.pts:3,q=pr.pts&&pr.qt?pr.qt/pr.pts:1;
  if(kind==='refac'||kind==='rewrite'){const old=p.score,pl=updPlan(p,kind);
    if(kind==='refac'){p.debt=Math.round(tdOf(p)*0.4);p.bugs=Math.round((p.bugs||0)*0.5);if(p.sat!=null)p.sat=clamp(p.sat+3,0,95);news((LANG_EN?`Debt cleanup for ${p.name} complete: tech debt ${Math.round(p.debt)}.`:`${p.name} için borç temizliği tamamlandı: teknik borç ${Math.round(p.debt)}.`),'good');}
    else{p.debt=0;p.bugs=0;p.score=pl.after;if(p.sat!=null)p.sat=clamp(p.sat+6,0,95);p.ver=Math.floor(p.ver||1)+1;p.updN=0;p.updAt=G.day;news((LANG_EN?`${p.name} was rewritten (${verStr(p)}): tech debt reset${p.score>old*1.01?`, score ${Math.round(old)} → ${Math.round(p.score)}`:''}.`:`${p.name} baştan yazıldı (${verStr(p)}): teknik borç sıfırlandı${p.score>old*1.01?`, puan ${Math.round(old)} → ${Math.round(p.score)}`:''}.`),'good',true);tl('prod',(LANG_EN?`${p.name} rewritten`:`${p.name} yeniden yazıldı`));}
    return;}
  const pl=updPlan(p,kind),old=p.score,b0=p.bugs||0,f0=p.feats,fAdd=pr.d&&Array.isArray(pr.d.feats)?pr.d.feats.filter(k=>!(f0||[]).includes(k)):[];
  if(fAdd.length)p.feats=[...pr.d.feats];
  let fresh=p.score;
  if(kind==='major'){const r=spec(pr.d,avg);if(!r.err){fresh=r.score;if(p.spec&&r.spec){p.spec=r.spec;p.unitCost=r.uc;if(p.plan&&!siteOK(p.plan.site,p.cat,p.spec))p.plan.site=defaultSite(p.cat,p.spec);}}}
  else fresh=p.spec||!HW.includes(p.cat)?spec(updDraft(p,'minor'),avg).score:p.score;
  const n=p.updN||0;
  p.score=(kind==='minor'?Math.max(old*Math.max(1.02,1.06-0.01*n),fresh*0.85)*(fAdd.length?ftGain(p.cat,f0,p.feats):1):Math.max(old*1.1,fresh*0.97))*clamp(q,0.9,1.1);
  p.bugs=Math.round((p.bugs||0)*(kind==='minor'?0.5:0.3));if(p.sat!=null)p.sat=clamp(p.sat+(kind==='minor'?5:8),0,95);p.debt=kind==='minor'?clamp(tdOf(p)+6,0,100):Math.round(tdOf(p)*0.7);
  const v0=p.ver||1;p.ver=kind==='minor'?Math.round((v0+0.1)*10)/10:Math.floor(v0)+1;p.updN=kind==='minor'?n+1:0;p.updAt=G.day;
  {const nf=pr.d&&pr.d.focus,notes=nf?faDiffNotes(p.cat,faOf(p),nf):[];if(nf&&p.focus!==nf)p.focus={...nf};vlogAdd(p,[...notes,...fAdd.map(k=>FT[k]?(LANG_EN?`${FT[k].n} added`:`${FT[k].n} eklendi`):''),(LANG_EN?`freshness ${pct(old/S(p.cat),0)} → ${pct(p.score/S(p.cat),0)}`:`güncellik ${pct(old/S(p.cat),0)} → ${pct(p.score/S(p.cat),0)}`),b0>(p.bugs||0)?(LANG_EN?`${b0-(p.bugs||0)} bugs fixed`:`${b0-(p.bugs||0)} hata düzeltildi`):'']);}
  if(kind==='major'){const v=p.score/S(p.cat),fairP=CATS[p.cat].ref?CATS[p.cat].ref*Math.pow(v,1.2)/Math.max(p.price,0.01):1;
    const rv=clamp(Math.round((5.5+(v-1)*10+(fairP-1)*3+rnd(-0.7,0.7))*10)/10,1,10);p.review=Math.round(((p.review||rv)*0.3+rv*0.7)*10)/10;
    p.hype={m:p.review>=8?1.3:p.review>=6.5?1.15:1,until:G.day+45};brAdd(p,(p.review-6)*0.25);
    news((LANG_EN?`${p.name} ${verStr(p)} released! Score ${Math.round(old)} → ${Math.round(p.score)}. The press gave the new version ${fx(p.review,1)}/10.`:`${p.name} ${verStr(p)} yayınlandı! Puan ${Math.round(old)} → ${Math.round(p.score)}. Basın yeni sürüme ${fx(p.review,1)}/10 verdi.`),p.review>=6.5?'good':'bad',true);
    if(p.review>=8.5)tl('star',(LANG_EN?`${p.name} ${verStr(p)} got ${fx(p.review,1)} from the press`:`${p.name} ${verStr(p)} basından ${fx(p.review,1)} aldı`));rivalReact(p);}
  else{p.hype={m:1.08,until:G.day+30};news((LANG_EN?`${p.name} ${verStr(p)} update released: score ${Math.round(old)} → ${Math.round(p.score)}, fewer bugs.`:`${p.name} ${verStr(p)} güncellemesi yayınlandı: puan ${Math.round(old)} → ${Math.round(p.score)}, hatalar azaldı.`),'good');}
}
function finishProject(pr){
  if(pr.upd)return finishUpdate(pr);
  if(pr.idea)return finishIdea(pr);
  if(pr.beta&&!pr.betaDone){if(!pr.betaUntil){const B=BETA[pr.beta];pr.betaUntil=G.day+B.days;pr.betaTeam=G.emps.filter(e=>e.proj===pr.id).map(e=>e.id);for(const e of G.emps)if(e.proj===pr.id)e.proj=null;news((LANG_EN?`${pr.name} development finished; ${B.n.toLocaleLowerCase(LOC)} started (${B.days} days).`:`${pr.name} geliştirmesi bitti; ${B.n.toLocaleLowerCase(LOC)} başladı (${B.days} gün).`));if(pr.beta==='open'&&pr.ev)pr.ev.leaked=true;else if(pr.ev&&Math.random()<0.1){pr.ev.leaked=true;news((LANG_EN?`Closed beta footage of ${pr.name} leaked online.`:`${pr.name} kapalı beta görüntüleri internete sızdı.`),'bad');}}
    if(G.day<pr.betaUntil)return;pr.betaDone=true;}
  const avg=pr.pts?pr.sk/pr.pts:3;
  const r=spec(pr.d,avg);
  G.projects=G.projects.filter(x=>x!==pr);
  pr.team=pr.betaTeam||G.emps.filter(e=>e.proj===pr.id).map(e=>e.id);
  for(const e of G.emps)if(pr.team.includes(e.id))e.xp=(e.xp||0)+25;
  for(const e of G.emps)if(e.proj===pr.id)e.proj=null;
  const price=pr.cat==='app'?CATS.app.arpu:(pr.d.price>0?pr.d.price:r.fair);
  const vcT=G.vc&&G.vc.tech[pr.cat]||1;if(vcT>1){delete G.vc.tech[pr.cat];}
  const ft=pr.cat==='robo'?Math.round(rnd(0.8,1.25)*100)/100:pr.cat==='qc'?Math.round(rnd(0.7,1.35)*100)/100:1;
  const p={id:nid(),owner:'P',cat:pr.cat,name:pr.name,score:cofQ()*ft*r.score*vcT*(pr.qBonus||1)*(pr.pts&&pr.qt?pr.qt/pr.pts:1)*(G.furn.some(f=>f.t==='r_design')?1.02:1)*(HW.includes(pr.cat)&&G.furn.some(f=>f.t==='r_hw')?1.03:1),price,unitCost:r.uc,launch:G.day,active:!r.err,units:0,share:0,total:0,camp:0,h:[]};
  if(r.spec){Object.assign(p,{spec:r.spec,plan:{site:r.site,mode:'auto',rate:0},fg:0,fgv:0,sr:0,lost:0,made:0,short:[]});}
  if(pr.d&&pr.d.sb&&sbById(+pr.d.sb))p.sb=+pr.d.sb;
  if(r.err){p.active=false;p.review=null;G.products.push(p);news((LANG_EN?`${p.name} is done, but the supplier is gone, so it couldn't launch.`:`${p.name} tamamlandı ama tedarikçi artık yok, piyasaya çıkamadı.`),'bad',true);return;}
  if(ft!==1){p.field=ft;news(ft>=1.1?(LANG_EN?`${p.name} beat expectations in field tests: score ${Math.round((ft-1)*100)}% higher.`:`${p.name} saha testlerinde beklentileri aştı: puanı %${Math.round((ft-1)*100)} yüksek.`):ft<0.95?(LANG_EN?`${p.name} struggled in field tests: score ended up ${Math.round((1-ft)*100)}% lower.`:`${p.name} saha testlerinde zorlandı: puanı %${Math.round((1-ft)*100)} düşük kaldı.`):(LANG_EN?`${p.name} passed field tests as expected.`:`${p.name} saha testlerini beklendiği gibi geçti.`),ft>=1?'good':'bad',true);}
  const v=r.v*(pr.qBonus||1),fairP=CATS[p.cat].ref?CATS[p.cat].ref*Math.pow(v,1.2)/price:1;
  p.review=clamp(Math.round((5.5+(v-1)*10+(fairP-1)*3+rnd(-0.7,0.7)+(cofOn()&&G.cof.t==='design'?0.4:0)+biRev()+(ceoSk('v1')?0.2:0))*10)/10,1,10);
  if(pr.d&&pr.d.focus){p.focus={...pr.d.focus};p.review=clamp(Math.round((p.review+faFx(p.cat,p.focus).rv)*10)/10,1,10);specFinish(pr,p);}
  if(pr.d&&Array.isArray(pr.d.feats)){p.feats=[...pr.d.feats];const fe=ftEff(p.cat,p.feats);if(fe.rv)p.review=clamp(Math.round((p.review+fe.rv)*10)/10,1,10);}
  if(p.review>=8)p.hype={m:1.35,until:G.day+60};else if(p.review<5)p.hype={m:0.75,until:G.day+60};
  brAdd(p,(p.review-6)*0.4);ceoXP(20+Math.max(0,(p.review||6)-5)*5,(LANG_EN?`New product: ${p.name}`:`Yeni ürün: ${p.name}`));
  if(p.review>=8&&G.patPend)filePatent(null,(LANG_EN?`${p.name} design`:`${p.name} tasarımı`),[p.cat],1,true);
  G.momentum+=p.review>=8?6:p.review>=6.5?3:p.review<5?-2:1;G.momentum=Math.max(0,G.momentum);
  for(const e of G.emps)if(e.proj===pr.id||pr.team&&pr.team.includes(e.id))e.morale=clamp(e.morale+(p.review>=6.5?5:-3),0,100);
  if(p.spec&&p.plan)p.flaw=qcFlaw(p,pr);
  if(pr.ap==='fast'&&G.cv&&G.cv.vals.includes('kalite'))cvHit(-5,(LANG_EN?`${p.name} was rushed out despite its quality`:`Kalite değerine rağmen ${p.name} aceleyle çıktı`));else if(pr.ap==='fast'&&G.cv&&G.cv.vals.includes('hiz'))cvHit(2,(LANG_EN?`${p.name} rushed to market`:`${p.name} hızla piyasaya çıktı`));
  p.debt=clamp((TD_AP[pr.ap]||TD_AP.bal).debt+(G.pace==='crunch'?10:0)+rnd(-4,4),0,100);if(pr.ap==='solid')p.bugMult=(p.bugMult||1)*0.85;
  p.bugMult=(pr.pts&&pr.bq?pr.bq/pr.pts:1)*(pr.ap==='fast'?1.2:pr.ap==='solid'?0.85:1)*(ceoSk('o2')?0.85:1)*(1+0.1*cvK('hiz')-0.2*cvK('kalite'));p.bugs=Math.max(0,Math.round((1.15-r.v)*8*p.bugMult));if(p.focus){const F=faFx(p.cat,p.focus);p.bugs=Math.round(p.bugs*F.risk);p.bugMult*=F.risk;if(p.flaw!=null)p.flaw=Math.round(p.flaw*F.risk*100)/100;}p.tix=0;p.sat=clamp(55+(p.review||6)*3.5,40,92);p.bugAcc=0;
  if(pr.beta&&pr.betaDone){const op=pr.beta==='open',bf=p.bugs;p.bugs=Math.round(p.bugs*(op?0.7:0.5));const dr=op?(p.review>=7?0.2:-0.3):0.3;p.review=clamp(Math.round((p.review+dr)*10)/10,1,10);p.sat=clamp(p.sat+(op?1:3),40,95);
    if(op)p.hype={m:(p.hype&&p.hype.until>G.day?p.hype.m:1)*1.12,until:G.day+45};news((LANG_EN?`${p.name} ${BETA[pr.beta].n.toLocaleLowerCase(LOC)} report: ${bf-p.bugs} bugs caught, press score ${dr>=0?'+':'−'}${fx(Math.abs(dr),1)}.${op?" Beta users are talking about the product.":''}`:`${p.name} ${BETA[pr.beta].n.toLocaleLowerCase(LOC)} raporu: ${bf-p.bugs} hata yakalandı, basın puanı ${dr>=0?'+':'−'}${fx(Math.abs(dr),1)}.${op?' Beta kullanıcıları ürünü konuşuyor.':''}`),dr>=0?'good':'bad');(G.flags=G.flags||{}).beta=(G.flags.beta||0)+1;}
  const ev=pr.ev;
  if(ev&&!r.err&&ev.day!=null&&ev.day>G.day){p.active=false;p.waitLaunch={...ev};p.revHype=p.hype;p.hype=null;p.preDem=estUnits(p.cat,p.score,p.price)/30;}
  G.products.push(p);vlogAdd(p,[(LANG_EN?"First release":'İlk sürüm'),(LANG_EN?`press ${fx(p.review,1)}/10`:`basın ${fx(p.review,1)}/10`),p.bugs?(LANG_EN?`${p.bugs} known bugs`:`${p.bugs} bilinen hata`):'']);
  if(r.err){news((LANG_EN?`${p.name} is done, but the supplier is gone, so it couldn't launch.`:`${p.name} tamamlandı ama tedarikçi artık yok, piyasaya çıkamadı.`),'bad',true);return;}
  const q=REVIEW_Q.find(x=>p.review>=x[0])[1];
  if(pr.fromIdea){p.fromIdea=pr.fromIdea;if((pr.qBonus||1)>=1.4){(G.flags=G.flags||{}).gem=true;news((LANG_EN?`Surprise! ${p.name}, born from the ${pr.fromIdea} idea, far exceeded expectations.`:`Sürpriz! ${pr.fromIdea} fikrinden doğan ${p.name} beklenenin çok üstünde çıktı.`),'good',true);tl('star',(LANG_EN?`${p.name}: a surprise hit born from ${pr.fromIdea}`:`${p.name}: ${pr.fromIdea}'tan doğan sürpriz başarı`));}}
  {const first=!G.products.some(x=>x!==p&&x.owner==='P'&&x.cat===p.cat&&!x.acqId);if(first)tl('prod',(LANG_EN?`First ${CATS[p.cat].n.toLocaleLowerCase(LOC)}: ${p.name} (press ${fx(p.review,1)})`:`İlk ${CATS[p.cat].n.toLocaleLowerCase(LOC)}: ${p.name} (basın ${fx(p.review,1)})`));else if(p.review>=8.5)tl('star',(LANG_EN?`${p.name} got ${fx(p.review,1)} from the press`:`${p.name} basından ${fx(p.review,1)} aldı`));}
  if(p.waitLaunch){news((LANG_EN?`${p.name} is done. Press preview ${fx(p.review,1)}/10: ${q} The product is waiting for the ${LTIER[ev.t].n.toLocaleLowerCase(LOC)} on ${fmtDate(ev.day)}${p.spec?"; inventory is already being produced":''}.`:`${p.name} tamamlandı. Basın ön incelemesi ${fx(p.review,1)}/10: ${q} Ürün ${fmtDate(ev.day)} tarihindeki ${LTIER[ev.t].n.toLocaleLowerCase(LOC)} için bekliyor${p.spec?'; stok şimdiden üretiliyor':''}.`),p.review>=6.5?'good':'bad',true);return;}
  if(ev)doLaunch(p,ev);
  rivalReact(p);sfx('launch');
  news((LANG_EN?`${p.name} is on the market! Press score ${fx(p.review,1)}/10: ${q}${p.spec?" Production starts at the "+siteName(p.plan.site)+" facility.":''}`:`${p.name} piyasaya çıktı! Basın puanı ${fx(p.review,1)}/10: ${q}${p.spec?' Üretim '+siteName(p.plan.site)+' tesisinde başlıyor.':''}`),p.review>=6.5?'good':'bad',true);aiAutoPress(p);
  try{launchMoment(p);}catch(e){}
}

