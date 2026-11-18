/* ============================== PRICING MODELS ============================== */
const PM={
  app:{ads:{n:(LANG_EN?"Free with ads":'Reklamlı ücretsiz'),d:(LANG_EN?"Everyone uses it free; revenue comes from ads.":'Herkes ücretsiz kullanır; gelir reklamlardan gelir.')},
    freemium:{n:(LANG_EN?"Freemium":'Freemium'),d:(LANG_EN?"The free tier shows fewer ads; some users upgrade to premium. Discerning users pay far more often.":'Ücretsiz sürüm daha az reklam gösterir; kullanıcıların bir kısmı premium üyeliğe geçer. Seçici kullanıcılar çok daha sık öder.')},
    paid:{n:(LANG_EN?"Paid subscription":'Ücretli abonelik'),d:(LANG_EN?"A fully paid app: far fewer users, but they all pay. You set the price in the product table.":'Uygulama tamamen ücretli: çok daha az ama ödeyen kullanıcı. Fiyatı ürün tablosundan belirlersin.')}},
  sub:{flat:{n:(LANG_EN?"Single plan":'Tek paket'),d:(LANG_EN?"Same price for everyone.":'Herkese aynı fiyat.')},
    tiers:{n:(LANG_EN?"Tiered":'Katmanlı'),d:(LANG_EN?"Basic (60% of price), Pro (price) and Enterprise (2×) plans; each audience picks the plan that suits it. Enterprise sales team has a monthly cost.":'Temel (fiyatın %60\'ı), Pro (fiyat) ve Kurumsal (2 katı) paketler; her kitle kendine uygun paketi seçer. Kurumsal satış ekibi aylık gider ister.')},
    freemium:{n:(LANG_EN?"Freemium":'Freemium'),d:(LANG_EN?"A free plan draws far more users and builds network effects over time; but only some pay, and free users still use servers.":'Ücretsiz paket çok daha fazla kullanıcı çeker ve zamanla ağ etkisi yaratır; ama yalnızca bir kısmı öder ve ücretsizler de sunucu kullanır.')}}};
const pmKind=p=>p.cat==='app'?'app':(p.cat==='saas'||p.cat==='ai')?'sub':null;
const pmOf=p=>p.owner==='P'&&p.pm?p.pm:(p.cat==='app'?'ads':'flat');
const TIER={eco:0.6,main:1,pro:2},TIER_COST=15000;
const CONV_APP={eco:0.006,main:0.02,pro:0.06},CONV_SUB={eco:0.1,main:0.35,pro:0.6},NET_MAX=0.5;
const FREE_BOOST={eco:3,main:1.8,pro:1.2},PAID_APP_PEN={eco:0.015,main:0.04,pro:0.15},PAID_APP_REF=3;
function convRate(p,s){const v=p.score/S(p.cat),q=clamp(0.6+0.5*v,0.6,1.3)*(p.sat!=null?clamp(0.6+p.sat/150,0.6,1.25):1);
  if(p.cat==='app')return CONV_APP[s]*q*Math.pow(4.99/Math.max(0.99,p.prem||4.99),1.2);
  return Math.min(0.85,CONV_SUB[s]*q*clamp(CATS[p.cat].ref*Math.pow(v,1.2)/Math.max(p.price,0.01),0.3,1.5));}
function payers(p){if(pmOf(p)!=='freemium'||!p.su)return p.units||0;return SEGS.reduce((a,s)=>a+(p.su[s]||0)*convRate(p,s),0);}
function revPerUser(p){return revPerUser0(p)*dpRev(p)*bunRev(p);}
function revPerUser0(p){const m=pmOf(p),u=p.units||0;
  if(p.owner!=='P'||!pmKind(p)||!p.su||u<=0||m==='ads'||m==='flat'||m==='paid')return p.price;
  if(m==='tiers')return SEGS.reduce((a,s)=>a+(p.su[s]||0)*p.price*TIER[s],0)/u;
  if(p.cat==='app')return CATS.app.arpu*0.6+SEGS.reduce((a,s)=>a+(p.su[s]||0)*convRate(p,s)*(p.prem||4.99),0)/u;
  return SEGS.reduce((a,s)=>{const c=convRate(p,s);return a+(p.su[s]||0)*(c+(1-c)*0.03)*p.price;},0)/u;}
const isSubP=p=>p.owner==='P'&&(p.cat==='saas'||p.cat==='ai'||(p.cat==='app'&&pmOf(p)!=='ads'));
function churnOf(p){return churnOf0(p)*bunChurn(p);}
function churnOf0(p){const v=p.score/S(p.cat),m=pmOf(p);return clamp(0.015+(70-(p.sat!=null?p.sat:70))/700+Math.max(0,0.95-v)*0.12+(m==='freemium'?0.01:0)-(m==='tiers'?0.004:0),0.005,0.3);}
const pmOverhead=()=>myActive().filter(p=>pmOf(p)==='tiers').length*TIER_COST*infl();
function pmDaily(){const o=pmOverhead();if(o>0)spend(o/30,'other');}
function pmMonthly(){for(const p of myActive())if(pmOf(p)==='freemium'&&p.cat!=='app')p.net=Math.min(NET_MAX,(p.net||0)+0.03);}

/* segmentten bağımsız kısım bir kez hesaplanır, segment başına yalnızca kalite/fiyat/marka duyarlılığı değişir */
/* Çekicilik iki parçada hesaplanır: ürünün bölgeden bağımsız çarpanları (appealBaseP, appealSegF) günde ürün başına bir kez,
   bölgeye bağlı olanlar (appealBaseR, appealSegR) her bölge için. Sonuç eski tek parça hesapla aynıdır. */
function appealBase(p,r){return appealBaseR(p,r,appealBaseP(p));}
/* bölgeye bağlı, üründen bağımsız çarpanlar: pazar turunda bölge başına bir kez hesaplanır */
const appealRX=r=>({br:brAppeal(r),esg:esgApp(r),ceo:ceoMktR(r),dc:dcIn(r)});
function appealBaseR(p,r,P,RX){
  const b=P.me?P.bo*(0.4+0.6*(G.regions?G.regions[r].aw:1)):P.bo*(present(p.owner,r)?1:0.4);
  let m=P.m0;if(P.me){const X=RX||appealRX(r);m*=X.br*shopApp(p,r)*X.esg*X.ceo*(P.sw&&X.dc?1.05:1);}
  m*=regMult(p,r);
  const rv=!P.me&&G.rvs&&G.rvs.st.length&&HW.includes(p.cat)?rvsApp(p.owner,r):1;
  return {v:P.v,ratio:P.rf>0?P.rf*REGS[r].px*P.v12/Math.max(p.price,0.01):0,b,m,r,rv};
}
function appealBaseP(p){
  const v=p.score/S(p.cat),ref=CATS[p.cat].ref,me=p.owner==='P',sw=SW_CATS.includes(p.cat);
  let m=1;
  if(me){const E=ecoLinks();m*=E.bonus*prMult(p)*vcBoost(p.cat)*(sw?devSW():1);if(p.cat==='wear'&&E.links[5].ok)m*=1.25;if(p.cat==='ai'&&E.links[6].ok)m*=1.2;if(p.cat==='ai')m*=labAppeal();m*=iplStdM(p);if(p.cat==='xr'&&E.links[7].ok)m*=1.2;if(p.cat==='car'&&E.links[8].ok)m*=1.2;m*=spEco(p.cat);if(p.cat==='robo'&&E.links[11].ok)m*=1.25;if(p.cat==='iot'&&E.links[9].ok)m*=1.2;if(p.cat==='iot'&&has('matter'))m*=1.08;if(p.cat==='qc'&&E.links[10].ok)m*=1.2;if(p.sat!=null)m*=0.75+0.5*p.sat/100;}
  if(p.owner==='P')m*=megaApp(p);
  if(p.camp>G.day)m*=(p.owner==='P'&&G.furn&&G.furn.some(f=>f.t==='r_mkt')?1.8:1.6)*(p.owner==='P'&&ceoSk('m2')?1.08:1)*(p.owner==='P'?1+0.1*cvK('kazan'):1);
  if(p.hype&&p.hype.until>G.day)m*=p.hype.m;
  m*=lobAppeal(p);
  if(p.inj&&p.inj>G.day)m*=0.55;
  if(p.owner!=='P')m*=rivApp(p);
  if(p.owner!=='P'&&DEV_CATS.includes(p.cat)&&G.deals&&G.deals.some(d=>d.type==='cpuSell'&&d.cid===p.owner))m*=1.08;
  const rf=p.owner==='P'&&p.cat==='app'&&pmOf(p)==='paid'?PAID_APP_REF:ref;
  if(isSubP(p))m*=clamp(1.06-churnOf(p)*2,0.6,1.05);
  return {v,v12:Math.pow(v,1.2),rf,m0:m,me,sw,bo:me?sbBrand(p):brandOf(p.owner)};
}
function appealSeg(p,B,s){return appealSegR(p,B,s,appealSegF(p,s));}
/* segmentte bölgeden bağımsız çarpan */
function appealSegF(p,s){
  const SG=SEG[s],pm=p.owner==='P'?pmOf(p):null;let f=Math.pow(p.score/S(p.cat),SG.q);
  if(pm==='freemium')f*=(p.cat==='app'?1:FREE_BOOST[s])*(1+(p.net||0));
  if(pm==='paid')f*=PAID_APP_PEN[s];
  if(p.focus)f*=faSeg(p,s);if(p.feats)f*=ftSeg(p,s);
  if(p.owner==='P'){f*=mdApp()*mktMult(p.cat,s)*sbAppeal(p,s)*bmApp()*(SW_CATS.includes(p.cat)?dpApp():1)*bunApp(p)*spoApp(p,s)*rfApp(p,s);
    if(s==='pro'){if(p.sat!=null&&SW_CATS.includes(p.cat))f*=clamp(p.sat/70,0.5,1.3);else if(p.review!=null)f*=clamp(p.review/7,0.6,1.35);}}
  return f;
}
/* bölgeye bağlı kısım; f = appealSegF(p,s) */
function appealSegR(p,B,s,f){
  const SG=SEG[s],pm=p.owner==='P'?pmOf(p):null;let a=f*B.m;
  if(pm!=='freemium'&&B.ratio)a*=clamp(Math.pow(B.ratio*SG.px/(pm==='tiers'?TIER[s]:1),SG.p)*SG.n,0.01,4);
  a*=(1-0.5*SG.bw)+SG.bw*B.b/100;
  if(B.rv!=null)a*=B.rv;else if(p.owner!=='P'&&B.r&&G.rvs&&G.rvs.st.length&&HW.includes(p.cat))a*=rvsApp(p.owner,B.r);
  if(p.owner==='P'&&B.r)a*=cityM(p,B.r,s);
  return a;
}
function appeal(p,r='tr',s='main'){return appealSeg(p,appealBase(p,r),s);}
function estSeg(cat,score,price){
  const o={eco:0,main:0,pro:0},ps=G.products.filter(p=>p.active&&p.cat===cat);
  const me={cat,score,price,owner:'P',camp:0};
  for(const r of REG_ORDER){const mb=appealBase(me,r),bs=ps.map(p=>appealBase(p,r));for(const s of SEGS){
    const a=appealSeg(me,mb,s);
    const sum=ps.reduce((t,p,i)=>t+appealSeg(p,bs[i],s),0);
    o[s]+=regDemand(cat,r)*segW(cat,s)*a/(sum+a+0.4);
  }}
  return o;
}
function estUnits(cat,score,price){const o=estSeg(cat,score,price);return o.eco+o.main+o.pro;}
function asiaDuty(){return !G.factories.some(f=>G.day>=f.ready&&(f.region==='vietnam'||f.region==='tayvan'));}
function regAdd(r,rev,sw){const fm=fxRevM(r);if(fm!==1){const a=rev*(fm-1);G.cash+=a;G.month.rev+=a;if(G.fx)G.fx.mr+=a;rev*=fm;}const m=G.rm||(G.rm={});m[r]=(m[r]||0)+rev;if(sw&&r==='eu')G.rmEuSw=(G.rmEuSw||0)+rev;}
function market(){
  const byCat={},RXS={};for(const p of G.products)if(p.active)(byCat[p.cat]||(byCat[p.cat]=[])).push(p);
  for(const cat of CAT_ORDER){
    const ps=byCat[cat]||[];
    for(const p of ps){p.ru={};p.su={eco:0,main:0,pro:0};p.units=0;}
    const BP=ps.map(appealBaseP),SF=ps.map(p=>{const o={};for(const s of SEGS)o[s]=appealSegF(p,s);return o;});
    let Dt=0;const dm=demand(cat);
    for(const r of REG_ORDER){
      const RD=regDemand(cat,r,dm);Dt+=RD;for(const p of ps)p.ru[r]=0;
      const RX=RXS[r]||(RXS[r]=appealRX(r)),bs=ps.map((p,i)=>appealBaseR(p,r,BP[i],RX)),as=new Array(ps.length);
      for(const s of SEGS){
        let sum=0;for(let i=0;i<ps.length;i++){as[i]=appealSegR(ps[i],bs[i],s,SF[i][s]);sum+=as[i];}
        const D=RD*segW(cat,s);
        for(let i=0;i<ps.length;i++){const p=ps[i],u=D*as[i]/(sum+0.4);p.ru[r]+=u;p.su[s]+=u;p.units+=u;}
      }
    }
    for(const p of ps)p.share=Dt?p.units/Dt:0;
  }
  const sp=myActive().filter(p=>p.cat==='saas'||p.cat==='ai');
  const tot=sp.reduce((a,p)=>a+p.units*(p.cat==='ai'?AI_LOAD:1),0),cap=capacity();
  G.capLoad=tot;G.capFull=tot>cap;
  if(tot>cap){const f=tot?cap/tot:0;for(const p of sp){p.units*=f;p.share*=f;for(const r in p.ru)p.ru[r]*=f;for(const k in p.su)p.su[k]*=f;}}
  {const uc=aiUC();for(const p of sp)if(p.cat==='ai')p.unitCost=uc;}
  if(G.cyber&&G.cyber.ddos>G.day)for(const p of sp){p.units*=0.2;p.share*=0.2;for(const r in p.ru)p.ru[r]*=0.2;for(const k in p.su)p.su[k]*=0.2;}
  const duty=asiaDuty(),naTar=regOn('tariff')&&!G.factories.some(f=>G.day>=f.ready&&f.region==='meksika');
  for(const p of G.products){
    if(!p.active)continue;
    if(isHW(p)){
      const want=p.units/30,sold=Math.min(p.fg,want);
      const avg=p.fg>0?p.fgv/p.fg:0;p.fg-=sold;p.fgv-=avg*sold;if(p.fg<1e-6){p.fg=0;p.fgv=0;}
      const rev=sold*p.price;G.cash+=rev;G.month.rev+=rev;
      if(p.units>0)for(const r of REG_ORDER){const fr=p.ru[r]/p.units;regAdd(r,rev*fr,false);
        if(r==='asia'&&duty&&fr>0){const d=sold*fr*avg*0.15;spend(d,'supply');G.dutyM=(G.dutyM||0)+d;}
        if(r==='na'&&naTar&&fr>0){const d=sold*fr*avg*0.10;spend(d,'supply');G.dutyM=(G.dutyM||0)+d;}}
      const os=p.spec.os!=null?prod(p.spec.os):null;
      if(os&&os.owner!=='P'&&alive(os.owner)){const fee=sold*os.price;spend(fee,'supply');const c=comp(os.owner);c.cash+=fee;c.mRev+=fee;}
      if(p.cat!=='cpu'){const o2=prod(p.spec.os);if(o2&&o2.owner==='P')G.base=(G.base||0)+sold;}
      if(p.cat==='console')G.cbase=(G.cbase||0)+sold;
      if(p.cat==='iot')G.ibase=(G.ibase||0)+sold;
      p.sr=p.sr*0.9+sold*30*0.1;p.lost=p.lost*0.9+(want-sold)*30*0.1;p.mSold=(p.mSold||0)+sold;p.total+=sold;
      continue;
    }
    const uc=p.unitCost*(HW.includes(p.cat)?pxMult(p.cat):1);
    const rev=p.units*revPerUser(p)/30,cost=p.units*uc/30;
    p.total+=p.units/30;
    if(p.owner==='P'){G.cash+=rev-cost;G.month.rev+=rev;G.month.supply+=cost;p.mSold=(p.mSold||0)+p.units/30;
      const sw=!HW.includes(p.cat);if(p.units>0)for(const r of REG_ORDER)regAdd(r,rev*p.ru[r]/p.units,sw);}
    else{const c=comp(p.owner);c.cash+=rev-cost;c.mRev+=rev-cost;}
  }
}

