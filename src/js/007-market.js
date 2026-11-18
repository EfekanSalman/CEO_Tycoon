/* ============================== MARKET ============================== */
function srvOk(){return has('srv')&&G.products.some(p=>p.owner==='P'&&p.cat==='cpu'&&p.active);}
function rackCap(){return 2000*(has('cloud')?2:1)*(srvOk()?1.5:1);}
function capacity(){return G.racks*rackCap()+dcCapTotal()-(G.dcRented||0);}
function rackCost(){return (srvOk()?15000:25000)*infl();}
function rackUpkeep(){return srvOk()?1400:2000;}
function pxMult(cat){const x=G.px;
  if(cat==='cpu')return x.wafer;if(cat==='phone')return (x.screen+x.camera+x.battery+x.chassis)/4;if(cat==='pc')return (x.memory+x.chassis)/2;
  if(cat==='wear')return (x.camera+x.battery+x.chassis)/3;if(cat==='xr')return (x.screen+x.battery+x.chassis)/3;if(cat==='iot')return (x.camera*2+x.chassis)/3;if(cat==='qc')return (x.wafer*2+x.chassis)/3;if(cat==='robo')return ((x.motor||1)*2+x.camera+x.chassis)/4;if(cat==='console')return ((x.gpu||1)+x.memory+x.chassis)/3;return 1;}
const AI_LOAD=4;
function aiUC(){const own=has('ai')&&G.products.some(p=>p.owner==='P'&&p.cat==='cpu'&&p.active);return 6*Math.pow(0.86,years())*(own?0.6:1)*(srvOk()?0.85:1)*energyMult();}
const gameRoyalty=()=>1.5*infl()*(has('rt')?1.2:1);
const present=(o,r)=>o==='P'?!!(G.regions&&G.regions[r].in):!!((comp(o)||{}).reg||['tr']).includes(r);
function regMult(p,r){
  const sw=!HW.includes(p.cat);let m=1;
  if(!present(p.owner,r))m*=sw?0.75:0.3;
  if(sw&&r==='eu'&&p.owner==='P'&&!has('gdpr'))m*=0.6;
  const gv=G.gov;
  if(gv){if(p.cat==='cpu'&&gv.ban&&gv.ban.until>G.day&&gv.ban.r===r){if(p.owner==='P'){if(p.spec&&nodeIdx(p.spec.node)>=nodeIdx(gv.ban.node)&&!(gv.banLic&&gv.banLic.ok))m=0;}else{const c=comp(p.owner);if(c&&!c.banOk)m*=0.15;}}
    if(p.owner==='P'&&sw&&gv.regs.loc&&gv.regs.loc.until>G.day&&gv.regs.loc.r===r&&!brOf(r)&&!dcIn(r))m*=0.7;}
  return m;
}
function regDemand(cat,r,dm){const R=REGS[r];return (dm!=null?dm:demand(cat))*R.w*Math.pow(1+R.g,years())*(r==='latam'?(G.latFx||1):1)*eraReg(r);}
