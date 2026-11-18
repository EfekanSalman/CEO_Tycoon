/* ============================== MARKETING ============================== */
const newMkt=()=>({b:{},focus:'all',m:0,last:0,ver:0});
const mktTeam=()=>1+Math.min(0.5,empSkill('mkt')*0.008);
const mktBudget=()=>G.mkt?CH_ORDER.reduce((a,c)=>a+(G.mkt.b[c]||0),0):0;
const mktRevBase=()=>{const h=G.hist.slice(-3);return h.length?h.reduce((a,x)=>a+x.rev,0)/h.length:0;};
const chScale=ch=>CHANNELS[ch].scale*infl()+CHANNELS[ch].rw*mktRevBase();
function chReach(ch){const B=(G.mkt&&G.mkt.b[ch])||0;return B>0?1-Math.exp(-B/chScale(ch)):0;}
function chTerm(ch,cat,s){const C=CHANNELS[ch],f=G.mkt.focus,fm=f==='all'?1:f===s?1.5:0.6;return 0.4*chReach(ch)*(C.seg[s]||0)*(C.cat[cat]||0)*fm;}
const MK={key:'',m:{}};
function mktMult(cat,s){
  if(!G.mkt||!mktBudget())return 1;
  const k=G.day+'|'+G.mkt.ver;if(MK.key!==k){MK.key=k;MK.m={};MK.t=mktTeam();}
  const kk=cat+s;if(MK.m[kk]==null){let t=0;for(const ch of CH_ORDER)t+=chTerm(ch,cat,s);t*=MK.t;MK.m[kk]=1+0.8*(1-Math.exp(-t/0.8));}
  return MK.m[kk];
}
function mktDaily(){
  const B=mktBudget();if(!B)return;
  if(G.cash<0){G.mkt.b={};G.mkt.ver++;news((LANG_EN?"Cash went negative: all marketing budgets have been paused.":'Nakit eksiye düştü: bütün pazarlama bütçeleri durduruldu.'),'bad',true);return;}
  spend(B/30,'other');G.mkt.m+=B/30;
}
function mktMonthly(){
  const M=G.mkt;M.last=M.m;M.m=0;if(!mktBudget())return;const t=mktTeam();
  G.brand=clamp(G.brand+(1.2*chReach('tv')+0.3*chReach('social'))*t,0,100);
  const ev=chReach('events');if(ev>0)for(const r of REG_ORDER){const st=G.regions[r];if(st.in)st.aw=clamp(st.aw+0.02*ev*t,0,1);}
  const inf=chReach('influencer'),dev=myActive().filter(p=>DEVICE.includes(p.cat)||p.cat==='app');
  if(inf>0&&dev.length){const x=Math.random();
    if(x<0.035*inf){G.brand=clamp(G.brand-3,0,100);for(const p of dev)p.hype={m:0.85,until:G.day+30};news((LANG_EN?"An influencer you signed got caught in a scandal! Your brand took a hit, and device sales are down for a month.":'Anlaştığın bir fenomen skandala karıştı! Markan zarar gördü, cihaz satışların bir ay düşük.'),'bad',true);}
    else if(x<0.035*inf+0.06*inf){const p=pick(dev);p.hype={m:1.3,until:G.day+30};news((LANG_EN?`Influencer video went viral: ${p.name} is much more appealing for a month.`:`Fenomen videosu viral oldu: ${p.name} bir ay boyunca çok daha çekici.`),'good',true);}}
}
function mktAttr(){
  const out={};for(const ch of CH_ORDER)out[ch]=0;if(!G.mkt||!mktBudget())return out;
  for(const p of myActive()){if(!p.su)continue;const hw=isHW(p);
    const gp=p.cat==='app'?revPerUser(p):revPerUser(p)-(hw?(p.fg>1?p.fgv/p.fg:p.unitCost):p.unitCost);if(gp<=0)continue;
    const sc=hw&&p.units>0?clamp(p.sr/p.units,0,1):1;
    for(const s of SEGS){const m=mktMult(p.cat,s);if(m<=1.0001)continue;const extra=(p.su[s]||0)*sc*(1-1/m)*gp;
      const terms=CH_ORDER.map(ch=>chTerm(ch,p.cat,s)),tt=terms.reduce((a,b)=>a+b,0);
      CH_ORDER.forEach((ch,i)=>{if(tt)out[ch]+=extra*terms[i]/tt;});}}
  return out;
}

