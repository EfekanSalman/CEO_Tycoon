/* ============================== VERTICAL INTEGRATION ============================== */
const plantOf=c=>G.plants&&G.plants[c];
const plantReady=c=>{const p=plantOf(c);return !!p&&G.day>=p.ready;};
const plantLvl=c=>{const p=plantOf(c);return p?p.lvl-(p.up>G.day?1:0):0;};
const plantCap=c=>plantReady(c)&&!regionDown('turkiye')?PLANTS[c].cap*plantLvl(c):0;
const plantUpkeep=c=>{const p=plantOf(c);return p?PLANTS[c].upkeep*(1+0.6*(p.lvl-1))*infl()*(p.green?1.05:energyMult())*(incOk('fab')?0.75:1):0;};
const plantsUpkeep=()=>Object.keys(G.plants||{}).reduce((a,c)=>a+plantUpkeep(c),0);
const PU={key:'',u:{}};
function catUse(c){const k=G.day+'|'+Object.keys(G.use||{}).length;if(PU.key!==k){PU.key=k;PU.u={};for(const x in G.use||{})if(G.use[x]>0){const cc=keyInfo(x).cat;PU.u[cc]=(PU.u[cc]||0)+G.use[x];}}return PU.u[c]||0;}
function ownBlend(c,cap){const u=catUse(c);return u<=cap||u<=0?OWN_PX:(OWN_PX*cap+SPOT_PX*(u-cap))/u;}
function ownPx(c){const px=(G&&G.px&&G.px[c])||1;return ownBlend(c,plantCap(c))*(0.5+0.5*px)/px;}
function catMonthSpend(c,mult){let t=0;for(const k in G.use||{}){if(!(G.use[k]>0))continue;const ki=keyInfo(k);if(ki.cat!==c)continue;t+=G.use[k]*30*ki.base*G.px[c]*Math.pow(0.985,years())*mult;}return t;}
function plantSaving(c,lvl){const cur=SUPD[G.sup[c]];if(!cur)return 0;const curM=cur.own?SUPD[SUPPLIERS.find(s=>s.cat===c).id].price*(1+tariff(SUPPLIERS.find(s=>s.cat===c).region)):cur.price*(1+tariff(cur.region));
  const px=G.px[c]||1,ownM=ownBlend(c,PLANTS[c].cap*lvl)*(0.5+0.5*px)/px;return catMonthSpend(c,curM)-catMonthSpend(c,ownM);}
function plantDaily(){
  if(!G.plants)return;let up=0,sell=0;
  for(const c in G.plants){const p=G.plants[c];up+=plantUpkeep(c);
    if(p.ready===G.day){G.sup[c]='own_'+c;news((LANG_EN?`${PLANTS[c].n} started production! ${CCATS[c].n} now comes from your own facility.`:`${PLANTS[c].n} üretime başladı! ${CCATS[c].n} artık kendi tesisinden geliyor.`),'good',true);tl('factory',(LANG_EN?`${PLANTS[c].n} opened`:`${PLANTS[c].n} açıldı`));}
    sell+=plantSellOf(c)/30;}
  spend(up/30,'fact');
  if(sell>0){G.cash+=sell;G.month.rev+=sell;}G.plantRev=sell*30;
}
