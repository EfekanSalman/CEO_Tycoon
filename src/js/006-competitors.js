/* ============================== COMPETITORS ============================== */
function devCost(cat,c){const base={app:60000,saas:200000,os:2e6,cpu:4e6,phone:3e6,pc:1.5e6,wear:1.2e6,console:3e6,ai:1.5e6,xr:2.5e6,car:2e6,robo:8e6,iot:1e6,qc:3e7}[cat];return base*Math.pow(1.08,years())*(1+c.emp/3000);}
function aiName(c,cat){
  const g=c.gen[cat];
  if(cat==='cpu')return `${c.pfx}-${g}${rint(1,9)}0`;
  if(cat==='os')return `${c.pfx}OS ${g}`;
  if(!c.series[cat])c.series[cat]=pick(SERIES[cat]);
  if(cat==='app'||cat==='saas'||cat==='ai'||cat==='car')return `${c.pfx} ${c.series[cat]}${g>1?' '+g:''}`;
  return `${c.pfx} ${c.series[cat]} ${g}`;
}
function aiLaunch(c,cat,free=false,launchDay=G.day){
  const ST=STRATS[c.strat||'denge'];
  const s=S(cat,launchDay)*c.tech*rnd(0.88,1.15)*ST.sc*(1+rvnTdB(c,cat));
  const v=s/S(cat,launchDay),ref=CATS[cat].ref;
  let price,uc;
  if(cat==='app'){price=CATS.app.arpu;uc=0;}
  else{
    const base=ref*Math.pow(v,1.2)*rnd(0.85,1.2);
    uc=(cat==='saas'?base*0.2:cat==='ai'?base*0.4:cat==='car'?base*0.1:cat==='os'?0:cat==='console'?base*rnd(0.6,0.75):base*rnd(0.45,0.62))*ST.uc;
    price=base*ST.px/ST.sc;price=SUBP(cat)?Math.round(price*100)/100:Math.round(price);
  }
  c.gen[cat]=(c.gen[cat]||0)+1;
  const p={id:nid(),owner:c.id,cat,name:aiName(c,cat),score:s,price,unitCost:uc,launch:launchDay,active:true,units:0,share:0,total:0,camp:0,focus:rivFocus(c.strat||'denge',cat)};
  G.products.push(p);
  const mine=G.products.filter(q=>q.active&&q.owner===c.id&&q.cat===cat).sort((a,b)=>a.launch-b.launch);
  while(mine.length>2)mine.shift().active=false;
  if(!free){c.cash-=devCost(cat,c);
    if(['phone','cpu','os','pc','console','ai','xr','car','robo','iot','qc'].includes(cat)||c.emp>200)news((LANG_EN?`${c.name} released a new ${CATS[cat].n.toLocaleLowerCase(LOC)}: ${p.name}`:`${c.name} yeni ${CATS[cat].n.toLocaleLowerCase(LOC)} çıkardı: ${p.name}`),'mkt');}
}
const STRATS={
  fiyat:{n:(LANG_EN?"Price cutter":'Fiyat kırıcı'),d:(LANG_EN?"Targets budget buyers with cheap products and doesn't shy away from price wars.":'Ucuz ürünlerle fiyat odaklı kitleyi hedefler, fiyat savaşından kaçmaz.'),px:0.82,sc:0.94,uc:0.9},
  denge:{n:(LANG_EN?"Balanced":'Dengeli'),d:(LANG_EN?"Sells to the mainstream at market prices.":'Ana akım kitleye piyasa fiyatından satar.'),px:1,sc:1,uc:1},
  premium:{n:(LANG_EN?"Premium":'Premium'),d:(LANG_EN?"Targets discerning buyers with pricey but superior products; never cuts prices.":'Pahalı ama üstün ürünlerle seçici kitleyi hedefler, fiyat kırmaz.'),px:1.28,sc:1.08,uc:1.12},
  takip:{n:(LANG_EN?"Fast follower":'Hızlı takipçi'),d:(LANG_EN?"Copies successful products the moment it sees them, a bit cheaper.":'Başarılı ürünleri görür görmez benzerini biraz daha ucuza çıkarır.'),px:0.93,sc:0.98,uc:1},
};
function pickStrat(c){const r=Math.random();if(c.brand>55)return r<0.6?'premium':'denge';if(c.cash<3e6)return r<0.5?'fiyat':'takip';return pick(['fiyat','denge','denge','premium','takip']);}
const stratChip=c=>{const S2=STRATS[c.strat||'denge'];return `<span class="chip st-mute" title="${esc(S2.d)}">${S2.n}</span>`;};
function rlogAdd(c,t){(G.rlog=G.rlog||[]).unshift({d:G.day,c:c.id,t});if(G.rlog.length>30)G.rlog.pop();}
function makeComp(seed,id){
  const o=makeComp0(seed,id);o.strat=seed.strat||pickStrat(o);if(typeof newCeo==='function')ceoOf(o);return o;
}
function makeComp0(seed,id){
  return {id,aggr:seed.aggr!=null?seed.aggr:Math.min(0.95,rnd(0.2,0.85)+(G&&G.mods&&G.mods.aggr||0)),name:seed.name,pfx:seed.pfx,focus:seed.focus,cash:seed.cash,emp:seed.emp,brand:seed.brand,tech:seed.tech,hue:seed.hue,pats:null,reg:seed.reg?[...seed.reg]:['tr',...REG_ORDER.slice(1).filter(()=>Math.random()<0.35)],gen:{},series:{},mRev:0,profit:0,neg:0,dead:false,born:G?G.day:0};
}
function compVal(c){return Math.max(0,c.cash)+(Math.max(0,c.profit)*12*5+c.brand*80000+c.emp*15000)*macPE();}
function compStatus(c){
  if(c.dead)return[(LANG_EN?"Closed":'Kapandı'),'st-mute'];
  if(c.neg>=1)return[(LANG_EN?"Sinking":'Batıyor'),'st-bad'];
  if(c.profit<0)return[(LANG_EN?"Losing money":'Zarar ediyor'),'st-warn'];
  return[(LANG_EN?"Growing":'Büyüyor'),'st-ok'];
}
function killComp(c,fate,by){
  if(c.emp>150||!String(c.id).match(/^c\d+$/)||c.brand>30)tl('rival',`${c.name}: ${fate}`);
  c.dead=true;c.fate=fate;c.deathDay=G.day;c.by=by;
  const prods=G.products.filter(p=>p.owner===c.id&&p.active);
  if(by){for(const p of prods)p.owner=by;}else{for(const p of prods)p.active=false;}
  if(!by)for(const p of G.products){
    if(!isHW(p)||!p.active||p.cat==='cpu')continue;
    const cpu=prod(p.spec.cpu);
    if(cpu&&cpu.owner===c.id){const left=stockOf('xcpu:'+cpu.id)+inTransit('xcpu:'+cpu.id);
      news((LANG_EN?`Your processor supplier for ${p.name}, ${c.name}, went bankrupt. You have ${num(left)} processors left; production stops when they run out. Develop a new model.`:`${p.name} için işlemci tedarikçin ${c.name} battı. Elde ${num(left)} işlemci var; bitince üretim durur. Yeni model geliştir.`),'bad',true);}
  }
}
function spawnStartup(){
  const used=new Set(G.comps.map(c=>c.name));
  const pool=STARTUPS.filter(s=>!used.has(s[0]));
  if(!pool.length)return;
  const [name,pfx,hue]=pick(pool);
  const r=Math.random();let focus,cash;
  if(r<0.6){focus=[pick(years()>4?['app','saas','app','ai','ai']:['app','saas','app'])];cash=rnd(0.5e6,3e6)*(focus[0]==='ai'?2.5:1);}
  else if(r<0.85){focus=[pick(['cpu','phone','wear'])];cash=rnd(15e6,45e6)*(focus[0]==='wear'?0.3:1);}
  else{focus=[pick(['pc','os','console'])];cash=rnd(8e6,25e6);}
  cash*=infl();
  const c=makeComp({name,pfx,focus,cash,emp:Math.max(8,Math.round(cash/90000)),brand:rnd(5,15),tech:rnd(0.88,1.25)*(G.mods&&G.mods.tech||1),hue},'c'+nid());
  G.comps.push(c);
  news((LANG_EN?`New rival: ${name} founded (${focus.map(f=>CATS[f].n).join(', ')}), raised ${money(cash)}.`:`Yeni rakip: ${name} kuruldu (${focus.map(f=>CATS[f].n).join(', ')}), ${money(cash)} yatırım aldı.`),'mkt',true);
  for(const f of focus)if(c.cash>devCost(f,c))aiLaunch(c,f);
}
function aiMonth(){
  const live=liveComps();
  for(const c of live){
    const cost=c.emp*4000*infl();
    c.cash-=cost;c.profit=c.mRev-cost;c.lRev=c.mRev;c.mRev=0;
    if(c.profit>0)c.emp=Math.round(c.emp*(1+rnd(0.01,0.05)))+1;
    else c.emp=Math.max(5,Math.round(c.emp*(1-rnd(0.02,0.07))));
    c.tech=clamp(c.tech+(c.profit>0?0.003:-0.002)+rnd(-0.012,0.012),0.7,1.45);
    const sh=G.products.filter(p=>p.active&&p.owner===c.id).reduce((a,p)=>a+p.share,0);
    c.brand=clamp(c.brand+(sh*3-0.4)*rnd(0.5,1.5),3,90);
    for(const cat of c.focus){
      const mine=G.products.filter(p=>p.active&&p.owner===c.id&&p.cat===cat);
      const best=mine.reduce((a,p)=>Math.max(a,p.score/S(cat)),0);
      if((!mine.length||best<rnd(0.82,0.95))&&c.cash>devCost(cat,c)*1.3)aiLaunch(c,cat);
      for(const p of mine)if(p.score/S(cat)<0.5)p.active=false;
    }
    if(c.cash>40e6*infl()&&c.focus.length<3&&Math.random()<0.02){
      const nf=CAT_ORDER.filter(x=>!c.focus.includes(x)).map(x=>[x,catPool(x)*rnd(0.6,1.4)]).sort((a,b)=>b[1]-a[1])[0][0];c.focus=[...c.focus,nf];rlogAdd(c,(LANG_EN?`Decided to enter the ${CATS[nf].n} market`:`${CATS[nf].n} pazarına girmeye karar verdi`));
      news((LANG_EN?`${c.name} is entering the ${CATS[nf].n.toLocaleLowerCase(LOC)} market.`:`${c.name} ${CATS[nf].n.toLocaleLowerCase(LOC)} pazarına giriyor.`),'mkt',true);
    }
    rivOps(c);
    if(c.profit>0&&c.cash>20e6*infl()&&Math.random()<0.03){const nr=REG_ORDER.filter(r=>!(c.reg||[]).includes(r));
      if(nr.length){const r=pick(nr);c.reg=[...(c.reg||['tr']),r];c.cash-=REGS[r].entry*infl();news((LANG_EN?`${c.name} expanded into ${REGS[r].n}.`:`${c.name} ${REGS[r].n} pazarına açıldı.`),'mkt',G.regions&&G.regions[r].in);}}
    c.neg=c.cash<0?c.neg+1:0;
  }
  for(const c of live){
    if(c.neg<3)continue;
    const buyer=G.comps.filter(b=>!b.dead&&b!==c&&b.cash>compVal(c)*1.5+5e6&&b.profit>0).sort((a,b)=>b.cash-a.cash)[0];
    if(buyer&&Math.random()<0.45){
      buyer.cash-=compVal(c);buyer.brand=clamp(buyer.brand+c.brand*0.1,3,90);
      buyer.focus=[...new Set([...buyer.focus,...c.focus])];buyer.reg=[...new Set([...(buyer.reg||['tr']),...(c.reg||[])])];initPats(buyer);initPats(c);for(const k in c.pats)buyer.pats[k]=(buyer.pats[k]||0)+c.pats[k];
      killComp(c,(LANG_EN?`Acquired by ${buyer.name}`:`${buyer.name} satın aldı`),buyer.id);
      news((LANG_EN?`${buyer.name} acquired the struggling ${c.name}.`:`${buyer.name}, zor durumdaki ${c.name} şirketini satın aldı.`),'bad',true);
    }else{
      killComp(c,(LANG_EN?"Went bankrupt":'İflas etti'),null);
      news((LANG_EN?`${c.name} went bankrupt! Its products were pulled from the market.`:`${c.name} iflas etti! Ürünleri piyasadan çekildi.`),'bad',true);
    }
  }
  const n=liveComps().length;
  if(Math.random()<(n<7?0.12:0.06)*(G.mac?MPH[G.mac.ph].spawn:1)&&n<14)spawnStartup();
  mrgMonthly();
  aiSmart();
  rivalMoves();
}
/* pazarın çekiciliği: ciro havuzu × lider olmayanlara kalan pay / kalabalık */
function catPool(cat){const ps=G.products.filter(p=>p.active&&p.cat===cat);const top=ps.reduce((a,p)=>Math.max(a,p.share),0);
  return demand(cat)*(CATS[cat].ref||CATS.app.arpu)*(1-0.7*top)/(1+ps.length*0.25);}
function aiSmart(){
  for(const c of liveComps()){
    const st=c.strat||'denge',ST=STRATS[st];
    for(const p of G.products.filter(p=>p.active&&p.owner===c.id)){
      const age=G.day-p.launch,v=p.score/S(p.cat);
      if(age>150&&v<1.0&&c.profit>0&&G.day-(p.updAt||p.launch)>150&&Math.random()<0.08*c.tech&&c.cash>devCost(p.cat,c)*0.2){
        p.score*=rnd(1.02,1.05);p.updAt=G.day;p.ver=Math.round(((p.ver||1)+0.1)*10)/10;c.cash-=devCost(p.cat,c)*0.15;
        if(myActive(p.cat).length&&p.share>0.05)rlogAdd(c,(LANG_EN?`Released the ${verStr(p)} update for ${p.name}`:`${p.name} için ${verStr(p)} güncellemesini yayınladı`));}
      if(!CATS[p.cat].ref||p.priceLockC>G.day)continue;
      const prev=p.pshare!=null?p.pshare:p.share;p.pshare=p.share;
      const fair=CATS[p.cat].ref*Math.pow(v,1.2)*ST.px,floor=p.unitCost*1.05;
      const mine=myActive(p.cat).filter(q=>Math.abs(q.score/p.score-1)<0.15&&q.price<p.price*0.9).sort((a,b)=>a.price-b.price)[0];
      if(mine&&st!=='premium'&&Math.random()<0.3+0.4*c.aggr){const np=roundP(p.cat,Math.max(floor,mine.price*rnd(0.97,1.02)));
        if(np<p.price){p.price=np;p.priceLockC=G.day+60;rlogAdd(c,(LANG_EN?`Cut ${p.name} to ${money(np)} in response to your ${mine.name}`:`${p.name} fiyatını ${money(np)} yaparak senin ${mine.name} ürününe karşılık verdi`));}}
      else if(p.share<prev*0.8&&p.price>fair*0.95&&st!=='premium')p.price=roundP(p.cat,Math.max(floor,p.price*0.95));
      else if(p.share>prev*1.15&&p.share>0.15&&p.price<fair*1.15)p.price=roundP(p.cat,p.price*1.03);
    }
    if(c.focus.length>1){c.weak=c.weak||{};
      for(const cat of [...c.focus]){const ps=G.products.filter(p=>p.active&&p.owner===c.id&&p.cat===cat),sh=ps.reduce((a,p)=>a+p.share,0);
        c.weak[cat]=sh<0.03?(c.weak[cat]||0)+1:0;
        if(c.weak[cat]>=8&&c.focus.length>1){c.focus=c.focus.filter(x=>x!==cat);for(const p of ps)p.active=false;delete c.weak[cat];rlogAdd(c,(LANG_EN?`Exited the ${CATS[cat].n} market`:`${CATS[cat].n} pazarından çekildi`));news((LANG_EN?`${c.name} exited the ${CATS[cat].n.toLocaleLowerCase(LOC)} market after failing to gain a foothold.`:`${c.name}, tutunamadığı ${CATS[cat].n.toLocaleLowerCase(LOC)} pazarından çekildi.`),'mkt');}}}
    if(st==='takip'&&!c.follow&&c.cash>5e6*infl()){
      const hit=myActive().filter(p=>(p.review||0)>=8&&p.share>0.12&&G.day-p.launch<180&&(SW_CATS.includes(p.cat)||c.emp>150)).sort((a,b)=>b.share-a.share)[0];
      if(hit){c.follow={cat:hit.cat,pid:hit.id,day:G.day+rint(60,120)};rlogAdd(c,(LANG_EN?`Started studying ${hit.name} closely`:`${hit.name} ürününü yakından incelemeye başladı`));}}
    if(c.follow&&G.day>=c.follow.day){const f=c.follow,p=prod(f.pid);c.follow=null;
      if(p&&p.active&&c.cash>devCost(f.cat,c)){if(!c.focus.includes(f.cat))c.focus=[...c.focus,f.cat];aiLaunch(c,f.cat);const np=G.products[G.products.length-1];
        np.score=Math.max(np.score,p.score*rnd(0.96,1.03));if(CATS[f.cat].ref)np.price=roundP(f.cat,p.price*rnd(0.88,0.95));
        rlogAdd(c,(LANG_EN?`Launched ${np.name} to rival ${p.name}`:`${p.name} ürününe rakip olarak ${np.name} ürününü çıkardı`));news((LANG_EN?`${c.name} saw the success of ${p.name} and entered the market with a similar product (${np.name}).`:`${c.name}, ${p.name} ürününün başarısını görüp benzer bir ürünle (${np.name}) pazara girdi.`),'bad',true);}}
  }
}
/* oyuncu lansman yaptığında aynı pazardaki rakipler karşı kampanya başlatabilir */
function rivalReact(p){let told=false;
  for(const c of liveComps()){const theirs=G.products.filter(q=>q.active&&q.owner===c.id&&q.cat===p.cat).sort((a,b)=>b.share-a.share)[0];if(!theirs)continue;
    const cost=CATS[p.cat].camp*infl()*1.5;if(c.cash<cost*3||Math.random()>c.aggr*0.6)continue;
    theirs.camp=G.day+30;c.cash-=cost;rlogAdd(c,(LANG_EN?`Launched an ad campaign for ${theirs.name} against the ${p.name} launch`:`${p.name} lansmanına karşı ${theirs.name} için reklam kampanyası başlattı`));
    if(!told){told=true;news((LANG_EN?`${c.name} launched a heavy ad campaign for ${theirs.name} against the ${p.name} launch.`:`${c.name}, ${p.name} lansmanına karşı ${theirs.name} için yoğun reklam kampanyası başlattı.`),'mkt',true);}}
}

