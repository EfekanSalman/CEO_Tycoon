/* ============================== DATA CENTERS ============================== */
const dcRacks=()=>(G.dcs||[]).reduce((a,d)=>a+d.racks,0);
const dcOn=d=>G.day>=d.ready&&!(d.down>G.day);
const dcCapOf=d=>dcOn(d)?d.racks*rackCap()*1.25:0;
const dcCapTotal=()=>(G.dcs||[]).reduce((a,d)=>a+dcCapOf(d),0);
const dcIn=r=>(G.dcs||[]).some(d=>d.region===r&&G.day>=d.ready);
const dcRackCost=()=>rackCost()*0.7;
const dcEnergy=d=>d.green?0.75:energyMult();
const dcUpkeep=d=>(DC_LVL[d.lvl].up*DC_REG[d.region]*infl()+d.racks*rackUpkeep()*0.55)*dcEnergy(d);
const dcUpkeepAll=()=>(G.dcs||[]).reduce((a,d)=>a+dcUpkeep(d),0);
const dcBuildCost=(r,l=1)=>DC_LVL[l].cost*DC_REG[r]*infl();
const dcGreenCost=d=>4e6*d.lvl*DC_REG[d.region]*infl();
const rentPrice=()=>0.9*Math.pow(0.94,years())*infl();
const rentDemand=()=>5e5*Math.pow(1.3,years());
function rentShare(){const n=new Set((G.dcs||[]).filter(d=>G.day>=d.ready).map(d=>d.region)).size,sec=G.cyber?secScore():50;
  return Math.min(0.6,0.25*Math.pow(1/(G.dcPm||1),3)*(0.6+0.4*Math.min(1,sec/60))*(0.7+0.15*n));}
const dcOffered=()=>(G.dcs||[]).reduce((a,d)=>a+dcCapOf(d)*(d.rent||0),0);
function dcDaily(){
  if(!G.dcs||!G.dcs.length){G.dcRented=0;G.dcRev=0;return;}
  for(const d of G.dcs)if(d.ready===G.day){news((LANG_EN?`${REGS[d.region].n} data center is open! Add racks to start using the capacity.`:`${REGS[d.region].n} veri merkezi açıldı! Raf ekleyip kapasiteyi kullanmaya başlayabilirsin.`),'good',true);tl('factory',(LANG_EN?`${REGS[d.region].n} data center opened`:`${REGS[d.region].n} veri merkezi açıldı`));}
  spend(dcUpkeepAll()/30,'infra');
  const rented=Math.min(dcOffered(),rentDemand()*rentShare());G.dcRented=rented;
  const rev=rented*rentPrice()*(G.dcPm||1)/30;if(rev>0){G.cash+=rev;G.month.rev+=rev;}G.dcRev=rev*30;
}
function dcMonthly(){
  for(const d of G.dcs||[]){if(G.day<d.ready)continue;
    if(Math.random()<DC_LVL[d.lvl].out*(has('cloud')?0.7:1)){d.down=G.day+rint(2,5);
      for(const p of myActive())if((p.cat==='saas'||p.cat==='ai')&&p.sat!=null)p.sat=Math.max(0,p.sat-6);
      news((LANG_EN?`Outage at the ${REGS[d.region].n} data center! Capacity there is offline for ${d.down-G.day} days, and tenants were affected.`:`${REGS[d.region].n} veri merkezinde kesinti! ${d.down-G.day} gün boyunca oradaki kapasite devre dışı, kiracılar da etkilendi.`),'bad',true);}}
}

