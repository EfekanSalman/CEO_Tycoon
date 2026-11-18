/* ============================== SUPPLY CHAIN ============================== */
function keyInfo(k){
  const [t,a]=k.split(':');
  if(t==='wafer')return {cat:'wafer',n:(LANG_EN?`Silicon wafer ${a}nm`:`Silikon levha ${a}nm`),base:WAFER[a]};
  if(t==='chassis'){const c=CHASSIS[a]||CHASSIS.pc;return {cat:'chassis',n:c[0],base:c[1]};}
  if(t==='xcpu'){const p=prod(+a);return {cat:'xcpu',n:p?p.name:'?',base:p?(p.owner==='P'?p.unitCost:p.price*(1-buyDisc(p.owner))):0,ext:p};}
  const part=PARTS[t][+a];
  return {cat:PART_CC[t]||t,n:`${PART_N[t]} ${part.n}`,base:part.c};
}
function supOf(k){
  const ki=keyInfo(k);
  if(ki.cat==='xcpu'){const o=ki.ext?ki.ext.owner:null;
    return {id:'x',n:o?(o==='P'?(LANG_EN?"Acquired production":'Devralınan üretim'):ownerName(o)):'?',region:'tayvan',price:1,lead:10,rel:0.95,dead:!o||!alive(o),ext:true};}
  return SUPD[G.sup[ki.cat]];
}
function unitPrice(k){
  const ki=keyInfo(k);
  if(ki.cat==='xcpu')return ki.base;
  const s=supOf(k);
  return ki.base*s.price*G.px[ki.cat]*rawOwnR(ki.cat)*(1+tariff(s.region)*(ceoSk('o3')?0.5:1))*(ceoSk('f3')&&!s.own?0.96:1)*Math.pow(0.985,years())*(s.own?1:fxCostR(s.region));
}
const leadDays=s=>Math.max(3,Math.round(s.lead*(1-leadRed())));
function supBlocked(s){return s.ext?s.dead:(regionDown(s.region)||supDown(s.id));}

function cpuDies(sp){return 600/Math.pow(sp.cores,0.9)*Math.pow(nodeOf(sp.node).mult,0.6);}
function nodeYield(node,foundry){
  const n=nodeOf(node),rd=G.res.done[n.r];const age=rd!=null?(G.day-rd)/365:0;
  return clamp(0.55+0.07*age+(foundry?0.05:0)+(has('yield')?0.08:0),0.5,0.94);
}
const goodDies=(sp,site)=>cpuDies(sp)*nodeYield(sp.node,site==='foundry');
function siteName(site){if(typeof site==='string'&&site.startsWith('rvl-'))b2bSites();if(SITES[site])return SITES[site].n;const f=fac(site);return f?f.name:'?';}
function siteRegion(site){if(typeof site==='string'&&site.startsWith('rvl-'))b2bSites();if(SITES[site])return SITES[site].region;const f=fac(site);return f?f.region:'turkiye';}
function siteOK(site,cat,spec){
  if(typeof site==='string'&&site.startsWith('rvl-'))b2bSites();
  if(SITES[site])return SITES[site].makes.includes(cat);
  const f=fac(site);if(!f||!FTYPES[f.type].makes.includes(cat))return false;
  if(cat==='cpu'&&spec&&nodeIdx(spec.node)>f.node)return false;
  return true;
}
function siteCap(site){
  if(regionDown(siteRegion(site)))return 0;
  if(SITES[site])return SITES[site].cap;
  const f=fac(site);if(!f||G.day<f.ready||G.day<(f.busy||0))return 0;
  return facLineEff(f)*FTYPES[f.type].line*(1+0.2*f.auto)*(strikeOn()?0.4:1);
}
function defaultSite(cat,spec){
  const own=G.factories.filter(f=>siteOK(f.id,cat,spec)).sort((a,b)=>b.lines-a.lines)[0];
  return own?own.id:(cat==='cpu'?'foundry':'fason');
}
function defectRate(site,cat){
  if(cat==='cpu')return 0;
  if(site==='fason')return 0.03;
  if(typeof site==='string'&&site.startsWith('rvl-')){const k=b2bMcOf(site);return k?k.df:0.03;}
  const f=fac(site);
  return Math.max(0.005,0.04-0.01*(f?f.auto:0)-(has('qc')?0.015:0)-opsDefect()-facQc(f));
}
function loadPerUnit(cat,spec,site){return cat==='cpu'?1/goodDies(spec,site):1;}
const WEAR_CPU=0.3;
function bomOf(cat,spec,site){
  const b=[];
  if(cat==='cpu'){if(site!=='foundry')b.push({k:'wafer:'+spec.node,q:1/goodDies(spec,site)});return b;}
  const cpu=prod(spec.cpu);
  const cq=cat==='wear'?WEAR_CPU:cat==='iot'?0.15:cat==='qc'?4:1;
  if(cpu&&cpu.owner==='P'&&cpu.spec)b.push({own:cpu.id,q:cq});else b.push({k:'xcpu:'+spec.cpu,q:cq});
  if(cat==='phone')b.push({k:'screen:'+spec.screen,q:1},{k:'camera:'+spec.camera,q:1},{k:'battery:'+spec.battery,q:1},{k:'chassis:phone',q:1});
  else if(cat==='wear')b.push({k:'sensor:'+spec.sensor,q:1},{k:'wbat:'+spec.wbat,q:1},{k:'chassis:wear',q:1});
  else if(cat==='xr')b.push({k:'optic:'+spec.optic,q:1},{k:'battery:'+spec.battery,q:1},{k:'chassis:xr',q:1});
  else if(cat==='qc')b.push({k:'qubit:'+spec.qubit,q:1},{k:'cryo:'+spec.cryo,q:1},{k:'chassis:qc',q:1});
  else if(cat==='iot')b.push({k:'sensor:'+spec.sensor,q:1},{k:'radio:'+spec.radio,q:1},{k:'chassis:iot',q:1});
  else if(cat==='robo')b.push({k:'actuator:'+spec.actuator,q:1},{k:'rsense:'+spec.rsense,q:1},{k:'battery:2',q:6},{k:'chassis:robo',q:1});
  else if(cat==='console')b.push({k:'gpu:'+spec.gpu,q:1},{k:'ram:'+spec.ram,q:1},{k:'storage:'+spec.storage,q:1},{k:'chassis:console',q:1});
  else b.push({k:'ram:'+spec.ram,q:1},{k:'storage:'+spec.storage,q:1},{k:'chassis:pc',q:1});
  return b;
}
const FASON_LAB={phone:45,pc:80,wear:15,console:60,xr:50,robo:450,iot:8,qc:200000};
function laborPerUnit(cat,spec,site){const b=laborPerUnit0(cat,spec,site);return spec&&spec.ucx?Math.max(b*0.2,b+spec.ucx):b;}
function laborPerUnit0(cat,spec,site){
  if(cat==='cpu'){
    const n=nodeOf(spec.node),gd=goodDies(spec,site);let perWafer;
    if(site==='foundry')perWafer=(WAFER[spec.node]+400*n.cm)*2.1*G.px.wafer;
    else{const f=fac(site);perWafer=400*n.cm*FREG[f.region].labor*(1-0.15*f.auto)*energyMult()*facTrain(f)*lobLab(f);}
    return perWafer/gd+6+spec.clk*2;
  }
  if(site==='fason')return (FASON_LAB[cat]||60)*energyMult();
  if(typeof site==='string'&&site.startsWith('rvl-')){const k=b2bMcOf(site);return k?b2bMcFee(k,cat):(FASON_LAB[cat]||60)*energyMult();}
  const f=fac(site);return ({phone:20,pc:30,wear:8,console:25,xr:22,robo:200,iot:4,qc:120000}[cat]||25)*FREG[f.region].labor*(1-0.2*f.auto)*energyMult()*facTrain(f)*lobLab(f);
}
function estUC(cat,spec,site,depth=0){
  let c=laborPerUnit(cat,spec,site);
  for(const b of bomOf(cat,spec,site)){
    if(b.own){const cp=prod(b.own);c+=cp.fg>1?cp.fgv/cp.fg:(depth<2?estUC('cpu',cp.spec,cp.plan.site,depth+1):0);}
    else c+=unitPrice(b.k)*b.q;
  }
  c/=(1-defectRate(site,cat));
  if(cat!=='cpu'){const os=prod(spec.os);if(os&&os.owner!=='P'&&alive(os.owner))c+=os.price;}
  return c;
}
function stockOf(k){return G.stock[k]?G.stock[k].q:0;}
function inTransit(k){return G.orders.filter(o=>o.k===k).reduce((a,o)=>a+o.q,0);}
function fixedMonthly(){return G.emps.reduce((a,e)=>a+e.salary,0)+officeRent()+G.factories.reduce((a,f)=>a+facUpkeep(f),0)+(G.regions?regFees():0)+(G.debt||0)*loanRate();}
const cashTight=()=>G.cash<fixedMonthly()*3;
function launchPartsCost(){const use=planUse();let c=0;for(const k in use){const s=supOf(k);if(!s||s.dead)continue;const need=use[k]*(G.compDays+leadDays(s))-stockOf(k)-inTransit(k);if(need>0)c+=need*unitPrice(k);}return c;}
function placeOrder(k,q,manual){
  const s=supOf(k);if(!s||s.dead)return false;
  const price=unitPrice(k);
  let cost=q*price;
  const reserve=manual?0:fixedMonthly()*1.5;
  const avail=Math.max(0,G.cash-reserve);
  if(cost>avail){
    q=Math.floor(avail*(manual?1:0.5)/price);cost=q*price;
    const u=(G.use&&G.use[k])||0;
    if(q<=0||(!manual&&q<u*5)){G.cashBlocked=G.day;if(manual)showToast((LANG_EN?"Not enough cash for the order.":'Sipariş için yeterli nakit yok.'),'bad');return false;}
    G.cashBlocked=G.day;
  }
  spend(cost,'supply');
  if(s.ext){const p=keyInfo(k).ext;if(p.owner!=='P'){const c=comp(p.owner);c.cash+=cost;c.mRev+=cost;const bd=(G.deals||[]).find(x=>x.type==='cpuBuy'&&x.cid===p.owner);if(bd){bd.mDel+=q;bd.total+=q*p.price*bd.price;}}}
  let eta=G.day+leadDays(s),late=false;
  if(Math.random()>s.rel){eta+=rint(5,20);late=true;}
  G.orders.push({id:nid(),k,q,sup:s.ext?'x':s.id,eta,late,cost,placed:G.day});
  return true;
}
function deliveries(){
  for(const o of [...G.orders]){
    if(o.eta>G.day)continue;
    const s=o.sup==='x'?null:SUPD[o.sup];
    if(s&&(regionDown(s.region)||supDown(s.id))){
      o.eta=Math.max(G.day+1,G.disrupt[s.region]&&G.disrupt[s.region].until||0,G.supDown[s.id]||0);
      if(!o.held){o.held=true;o.late=true;}
      continue;
    }
    const st=G.stock[o.k]||(G.stock[o.k]={q:0,v:0});st.q+=o.q;st.v+=o.cost;
    G.orders=G.orders.filter(x=>x!==o);
  }
}
function planUse(){
  const use={};
  for(const p of G.products)if(isHW(p)&&(p.active||p.waitLaunch))
    for(const b of bomOf(p.cat,p.spec,p.plan.site))if(b.k)use[b.k]=(use[b.k]||0)+(p.dem!=null?p.dem:p.units/30)*b.q;
  for(const pr of G.projects){
    if(!HW.includes(pr.cat)||projFrac(pr)<0.7||pr.upd)continue;
    const r=spec(pr.d,3);if(r.err)continue;
    const d=estUnits(pr.cat,r.score,pr.d.price>0?pr.d.price:r.fair)/30;
    for(const b of bomOf(pr.cat,r.spec,r.site))if(b.k)use[b.k]=(use[b.k]||0)+d*b.q;
  }
  return use;
}
function autoOrder(){
  const use=planUse();G.use=use;
  if(!G.autoOrder)return;
  const tight=cashTight();if(tight&&Object.keys(use).some(k=>use[k]>0))G.supTight=G.day;
  let budget=Math.max(0,G.cash-fixedMonthly()*1.5)*0.6;
  const L=[];for(const k in use){if(use[k]<=0)continue;const s=supOf(k);if(!s||s.dead)continue;
    const target=use[k]*((tight?10:G.compDays)+leadDays(s)),need=target-stockOf(k)-inTransit(k);
    if(need>use[k]*7)L.push({k,need,u:use[k],cover:(stockOf(k)+inTransit(k))/use[k]});}
  L.sort((a,b)=>a.cover-b.cover);
  for(const o of L){let q=Math.ceil(o.need);const pr=unitPrice(o.k);if(q*pr>budget){q=Math.floor(budget/pr);if(q<o.u*5){G.cashBlocked=G.day;continue;}}
    if(placeOrder(o.k,q))budget-=q*pr;}
}
function production(){
  b2bSites();
  const ps=G.products.filter(p=>isHW(p)&&(p.active||p.waitLaunch)).sort((a,b)=>(a.cat==='cpu'?0:1)-(b.cat==='cpu'?0:1));
  const internal={};
  for(const p of ps)if(p.cat!=='cpu'){
    const cp=prod(p.spec.cpu);if(!cp||cp.owner!=='P'||!cp.spec)continue;
    let lim=Infinity;for(const b of bomOf(p.cat,p.spec,p.plan.site))if(b.k)lim=Math.min(lim,stockOf(b.k)/b.q);
    const base=p.planRate!=null?p.planRate:p.units/30;
    internal[cp.id]=(internal[cp.id]||0)+Math.min(lim,base*1.1)*(p.cat==='wear'?WEAR_CPU:p.cat==='iot'?0.15:p.cat==='qc'?4:1);
  }
  for(const d of G.deals||[])if(d.type==='cpuSell')internal[d.pid]=(internal[d.pid]||0)+d.q/30;
  for(const p of ps){
    p.dem=(p.waitLaunch?p.preDem||0:p.units/30)+(internal[p.id]||0)+ctrDem(p.id);
    p.want=p.plan.mode==='auto'?Math.max(0,p.dem+(p.dem*G.fgDays-p.fg)/7):Math.max(0,p.plan.rate||0);
  }
  const bySite={};for(const p of ps)(bySite[p.plan.site]=bySite[p.plan.site]||[]).push(p);
  G.siteUse={};
  for(const site in bySite){
    const list=bySite[site],cap=siteCap(site);
    const load=list.reduce((a,p)=>a+p.want*loadPerUnit(p.cat,p.spec,site),0);
    const sc=load>0?Math.min(1,cap/load):0;
    for(const p of list){p.planRate=p.want*sc;p.capShort=sc<0.98&&p.want>0.5;}
    G.siteUse[site]={cap,load,used:0};
  }
  let budget=Math.max(0,G.cash-fixedMonthly()*0.5);
  for(const p of ps){
    const site=p.plan.site,bom=bomOf(p.cat,p.spec,site);
    let can=p.planRate;p.short=[];
    for(const b of bom){
      const have=b.own?(prod(b.own)?prod(b.own).fg:0):stockOf(b.k);
      if(have/b.q<p.planRate-1e-6)p.short.push(b.own?'own:'+b.own:b.k);
      can=Math.min(can,have/b.q);
    }
    can=Math.max(0,can);
    const lpu=laborPerUnit(p.cat,p.spec,site);
    if(can*lpu>budget){can=budget/lpu;p.noCash=true;}else p.noCash=false;
    budget-=can*lpu;
    let good=0;
    if(can>1e-6){
      let val=0;
      for(const b of bom){
        const q=can*b.q;
        const s=b.own?prod(b.own):null;
        if(s){const avg=s.fg>0?s.fgv/s.fg:0;s.fg-=q;s.fgv-=avg*q;val+=avg*q;if(s.fg<1e-6){s.fg=0;s.fgv=0;}}
        else{const st=G.stock[b.k];const avg=st.v/st.q;st.q-=q;st.v-=avg*q;val+=avg*q;if(st.q<1e-6){st.q=0;st.v=0;}}
      }
      const lab=lpu*can;spend(lab,'prod');
      good=can*(1-defectRate(site,p.cat));
      p.fg+=good;p.fgv+=val+lab;
      G.siteUse[site].used+=can*loadPerUnit(p.cat,p.spec,site);
    }
    p.made=p.made*0.9+good*30*0.1;
  }
}

