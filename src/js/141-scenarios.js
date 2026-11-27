/* ============================== SCENARIOS ============================== */
function scnHire(role,skill,o={}){const c=genCand();const lv=levelFor(skill);Object.assign(c,{role,skill,level:lv,xp:XP_REQ[lv]+rint(0,60),salary:Math.round(salaryFor(skill)*(1+0.12*lv)*(o.pay||1)/100)*100,hiredAt:0,rev:true},o.morale!=null?{morale:o.morale}:{});G.emps.push(c);return c;}
function scnRes(...ids){for(const id of ids)G.res.done[id]=0;}
function scnSW(cat,v,name,ago,o={}){
  const price=cat==='app'?CATS.app.arpu:Math.round(CATS[cat].ref*Math.pow(v,1.2)*100)/100;
  const p={id:nid(),owner:'P',cat,name,score:S(cat,-ago)*v,price:o.price||price,unitCost:cat==='saas'?1:0,launch:-ago,active:true,units:0,share:0,total:0,camp:0,h:[],review:o.review||6.5,bugMult:1,bugs:o.bugs||2,tix:0,sat:o.sat||70,bugAcc:0};
  G.products.push(p);return p;}
const fmtLeft=d=>{d=Math.max(0,d);const y=Math.floor(d/365),m=Math.floor(d%365/30);return y?(LANG_EN?`${y} yr ${m} mo`:`${y} yıl ${m} ay`):(LANG_EN?`${m} mo ${Math.floor(d%30)} d`:`${m} ay ${Math.floor(d%30)} gün`);};
const profitStreak=()=>{let n=0;for(let i=G.hist.length-1;i>=0&&G.hist[i].profit>0;i--)n++;return n;};
const lastRegRev=r=>(G.rl||{})[r]||0;
const scnDur=y=>y%1?(LANG_EN?`${Math.round(y*12)} months`:`${Math.round(y*12)} ay`):(LANG_EN?`${y} years`:`${y} yıl`);
const SCN_GOALS={
  val:t=>({n:(LANG_EN?`Company valuation ${money(t)}`:`Şirket değerlemesi ${money(t)}`),v:()=>valuation(),t,fmt:'money'}),
  pub:()=>({n:(LANG_EN?"Go public":'Halka arz ol'),v:()=>G.pub?1:0,t:1,fmt:'bool'}),
  cpuShare:t=>({n:(LANG_EN?`${t*100}% processor market share`:`İşlemci pazarında %${t*100} pay`),hold:true,v:()=>myActive('cpu').reduce((a,p)=>a+p.share,0),t,fmt:'pct'}),
  fab:()=>({n:(LANG_EN?"Your own chip fab in production":'Kendi çip fabrikan üretimde'),v:()=>G.factories.some(f=>f.type==='fab'&&G.day>=f.ready)?1:0,t:1,fmt:'bool'}),
  debt:from=>({n:(LANG_EN?"Pay off the bank debt":'Bankaya olan borcu kapat'),v:()=>G.debt,t:0,from,fmt:'debt'}),
  streak:t=>({n:(LANG_EN?`Turn a profit ${t} months in a row`:`Üst üste ${t} ay kâr et`),v:profitStreak,t,fmt:'n'}),
  regions:()=>({n:(LANG_EN?"Operate in all 5 regions":'5 bölgenin hepsinde faaliyette ol'),v:()=>REG_ORDER.filter(r=>G.regions[r].in).length,t:5,fmt:'n'}),
  regRev:t=>({n:(LANG_EN?`At least ${money(t)} monthly revenue from every region`:`Her bölgeden ayda en az ${money(t)} gelir`),v:()=>Math.min(...REG_ORDER.map(lastRegRev)),t,fmt:'money'}),
  eco:()=>({n:(LANG_EN?"All 5 ecosystem links active":'Ekosistemin 5 bağlantısının hepsi aktif'),v:()=>ecoLinks().n,t:5,fmt:'n'}),
  base:t=>({n:(LANG_EN?`Installed base of ${num(t)} devices on your own OS`:`Kendi OS'unla ${num(t)} cihazlık kurulu taban`),v:()=>G.base||0,t,fmt:'num'}),
  tech:id=>({n:(LANG_EN?`Complete research: ${RESD[id].n}`:`${RESD[id].n} araştırmasını tamamla`),v:()=>has(id)?1:0,t:1,fmt:'bool'}),
  profit:t=>({n:(LANG_EN?`Monthly profit ${money(t)}`:`Aylık kâr ${money(t)}`),v:()=>{const h=G.hist[G.hist.length-1];return h?h.profit:0;},t,fmt:'money'}),
  brand:t=>({n:(LANG_EN?`Brand strength ${t}`:`Marka gücü ${t}`),v:()=>G.brand,t,fmt:'n'}),
  emps:t=>({n:(LANG_EN?`${num(t)} employees`:`${num(t)} çalışan`),v:()=>G.emps.length,t,fmt:'n'}),
  aw:t=>({n:(LANG_EN?`${t} tech awards`:`${t} teknoloji ödülü`),v:()=>G.aw?G.aw.won.length:0,t,fmt:'n'}),
  esg:t=>({n:(LANG_EN?`Sustainability score ${t}`:`Sürdürülebilirlik puanı ${t}`),v:()=>G.esg?G.esg.score:0,t,fmt:'n'}),
  catShare:(cat,t)=>({n:(LANG_EN?`${Math.round(t*100)}% share of the ${CATS[cat].n} market`:`${CATS[cat].n} pazarında %${Math.round(t*100)} pay`),hold:true,v:()=>myActive(cat).reduce((a,p)=>a+p.share,0),t,fmt:'pct'}),
  rev:t=>({n:(LANG_EN?`Monthly revenue ${money(t)}`:`Aylık gelir ${money(t)}`),v:()=>{const h=G.hist[G.hist.length-1];return h?h.rev:0;},t,fmt:'money'}),
  shops:t=>({n:(LANG_EN?`${t} open stores`:`${t} açık mağaza`),v:()=>G.shops?G.shops.list.filter(x=>G.day>=x.ready).length:0,t,fmt:'n'}),
  aiw:t=>({n:(LANG_EN?`${t} AI agents`:`${t} yapay zekâ ajanı`),v:()=>G.aiw?aiwTot():0,t,fmt:'n'}),
  bun:t=>({n:(LANG_EN?`${num(t)} subscription bundle subscribers`:`Abonelik paketinde ${num(t)} abone`),v:()=>G.bun&&G.bun.on?G.bun.subs:0,t,fmt:'num'}),
  fairAw:t=>({n:(LANG_EN?`${t} "Best of show" awards`:`${t} "Fuarın en iyisi" ödülü`),v:()=>G.fair?G.fair.won:0,t,fmt:'n'}),
  trust:t=>({n:(LANG_EN?`User trust ${t}`:`Kullanıcı güveni ${t}`),hold:true,v:()=>G.dp?G.dp.trust:0,t,fmt:'n'}),
  sats:t=>({n:(LANG_EN?`${num(t)} satellites in orbit`:`Yörüngede ${num(t)} uydu`),v:()=>spAlive(),t,fmt:'num'}),
  quests:t=>({n:(LANG_EN?`Complete ${t} quests`:`${t} görev tamamla`),v:()=>G.quest?G.quest.done:0,t,fmt:'n'}),
  bmWin:t=>({n:(LANG_EN?`Win ${t} board votes`:`Kurulda ${t} oylama kazan`),v:()=>G.bm?G.bm.won:0,t,fmt:'n'}),
};
const SCN={
  free:{id:'free',n:(LANG_EN?"Free Play":'Serbest Oyun'),diff:0,d:(LANG_EN?"No goals, no time limit. Start in the garage and grow however you like.":'Hedef yok, süre yok. Garajdan başla ve istediğin gibi büyü.'),start:(LANG_EN?"$150K, founder, garage":'$150K, kurucu, garaj')},
  garage:{id:'garage',ver:4,n:(LANG_EN?"From Garage to the Top":'Garajdan Zirveye'),diff:1,yrs:10,d:(LANG_EN?"Classic start, clear goal: from a garage to a $4 billion public company.":'Klasik başlangıç, net hedef: bir garajdan 4 milyar dolarlık halka açık şirkete.'),start:(LANG_EN?"$150K, founder, garage":'$150K, kurucu, garaj'),
    goals:()=>[SCN_GOALS.val(4e9),SCN_GOALS.pub()]},
  rescue:{id:'rescue',ver:3,n:(LANG_EN?"Rescue Operation":'Kurtarma Operasyonu'),diff:3,yrs:2.25,d:(LANG_EN?"The board put you in charge of a company on the brink of collapse. Products are dated, the team is demoralized, salaries are bloated and the bank is at the door.":'Yönetim kurulu seni batmak üzere olan bir şirketin başına getirdi. Ürünler eski, ekip moralsiz, maaşlar şişkin, banka kapıda.'),start:(LANG_EN?"$600K cash, $1.5M debt, a demoralized 11-person team, 2 outdated products":'$600K nakit, $1,5M borç, 11 kişilik moralsiz ekip, eskimiş 2 ürün'),
    intro:(LANG_EN?"You're the new CEO of Mira Software. There's $600K in the till and $1.5M owed to the bank. The products are outdated and the team is demoralized. First stop the bleeding, then take the company to a $150M valuation.":'Mira Yazılım\'ın yeni CEO\'susun. Kasada $600K var, bankaya $1,5M borç var. Ürünler eskidi ve ekip moralsiz. Önce kanamayı durdur, sonra şirketi $150M değerlemeye taşı.'),
    goals:()=>[SCN_GOALS.debt(1.5e6),SCN_GOALS.streak(9),SCN_GOALS.val(1.5e8)],
    setup(){G.life.conf=80;G.name=(LANG_EN?"Mira Software":'Mira Yazılım');G.cash=600000;G.debt=1.5e6;G.brand=22;G.office=1;G.racks=4;G.equity=0.4;
      G.emps[0].skill=6.5;scnRes('fw');
      for(const [r,sk] of [['soft',5.5],['soft',4.8],['soft',4.2],['soft',3.5],['design',5],['design',3.8],['mkt',4],['mkt',3.2],['sup',3.5],['ops',4.5]])scnHire(r,sk,{pay:1.2,morale:rint(36,52)});
      scnSW('app',0.66,(LANG_EN?"Mira Notes":'Mira Not'),520,{bugs:14,sat:48,review:6});scnSW('saas',0.85,(LANG_EN?"Mira Cloud":'Mira Bulut'),400,{bugs:10,sat:55,review:6.5,price:14});}},
  chip:{id:'chip',ver:4,n:(LANG_EN?"Chip Wars":'Çip Savaşları'),diff:2,yrs:6,d:(LANG_EN?"Investors want a homegrown processor maker. Silika Semiconductor is ready to crush you.":'Yatırımcılar bir yerli işlemci üreticisi istiyor. Silika Yarıiletken seni ezmek için hazır.'),start:(LANG_EN?"$8M cash, a 10-person chip team, a chip design lab and the 22nm process ready":'$8M nakit, 10 kişilik çip ekibi, çip tasarım laboratuvarı ve 22nm süreci hazır'),
    intro:(LANG_EN?"Your chip startup is up and running: $8M in seed funding, an experienced hardware team and a ready-made chip design lab. Silika Semiconductor is an aggressive rival; take 30% of the market, build your own fab, reach the 14nm process and take the company to a $2 billion valuation. The government covers half the cost of a chip fab you build in Turkey.":'Çip girişimin kuruldu: $8M tohum yatırım, deneyimli bir donanım ekibi ve hazır bir çip tasarım laboratuvarı. Silika Yarıiletken saldırgan bir rakip; pazarın %30\'unu al, kendi fabrikanı kur, 14nm sürecine ulaş ve şirketi 2 milyar dolar değerlemeye taşı. Devlet, Türkiye\'de kuracağın çip fabrikasının yarısını karşılıyor.'),
    goals:()=>[SCN_GOALS.cpuShare(0.3),SCN_GOALS.fab(),SCN_GOALS.tech('n14'),SCN_GOALS.val(2e9)],
    setup(){G.mods=Object.assign(G.mods||{},{fabInc:0.5});G.name=(LANG_EN?"Anka Semiconductor":'Anka Yarıiletken');G.cash=8e6;G.equity=0.8;G.office=1;G.brand=8;G.emps[0].role='hw';G.emps[0].skill=6.5;scnRes('fw','chip','n22');G.rounds.seed={d:0,amt:8e6};
      for(const [r,sk] of [['hw',6],['hw',5.5],['hw',5],['hw',4.5],['soft',5],['soft',4],['res',5.5],['res',5],['res',4.5]])scnHire(r,sk);
      const sx=G.comps.find(c=>c.name===(LANG_EN?"Silika Semiconductor":'Silika Yarıiletken'));if(sx){sx.aggr=0.95;sx.tech=1.2;sx.cash*=1.5;}}},
  global:{id:'global',ver:3,n:(LANG_EN?"Global Leap":'Küresel Sıçrama'),diff:2,yrs:5,d:(LANG_EN?"You're a successful software company in Turkey. Now it's the world's turn: enter every region and make real sales in all of them.":'Türkiye\'de başarılı bir yazılım şirketisin. Sıra dünyada: her bölgeye gir ve hepsinde gerçekten satış yap.'),start:(LANG_EN?"$12M cash, a 16-person team, a live app and web service":'$12M nakit, 16 kişilik ekip, çalışan uygulama ve web servisi'),
    intro:(LANG_EN?"You're Turkey's most beloved software company, but the world doesn't know you. Enter all five regions and earn serious revenue from each.":'Türkiye\'nin en sevilen yazılım şirketisin ama dünya seni tanımıyor. Beş bölgeye de gir ve her birinden ciddi gelir elde et.'),
    goals:()=>[SCN_GOALS.regions(),SCN_GOALS.regRev(2.5e6),SCN_GOALS.val(2.5e9)],
    setup(){G.name=(LANG_EN?"Pusula Tech":'Pusula Teknoloji');G.cash=12e6;G.equity=0.7;G.office=2;G.brand=24;G.racks=6;scnRes('fw','cloud');G.rounds.seed={d:0,amt:1e6};G.rounds.a={d:0,amt:8e6};
      for(const [r,sk] of [['soft',6.5],['soft',6],['soft',5.5],['soft',5],['soft',4.5],['design',6],['design',5],['design',4.5],['mkt',6],['mkt',5],['res',5],['res',4.5],['sup',5],['sup',4],['ops',5]])scnHire(r,sk);
      scnSW('app',1.0,(LANG_EN?"Pusula":'Pusula'),90,{sat:78,review:7.5});scnSW('saas',0.95,(LANG_EN?"Pusula Pro":'Pusula Pro'),150,{sat:74,review:7});}},
  eco:{id:'eco',ver:3,n:(LANG_EN?"Ecosystem Master":'Ekosistem Ustası'),diff:2,yrs:7,d:(LANG_EN?"Your own processor, your own operating system, your own devices and app store. All connected.":'Kendi işlemcin, kendi işletim sistemin, kendi cihazların ve uygulama mağazan. Hepsi birbirine bağlı.'),start:(LANG_EN?"$6M cash, a 10-person team, operating system and mobile hardware research done":'$6M nakit, 10 kişilik ekip, işletim sistemi ve mobil donanım araştırması hazır'),
    intro:(LANG_EN?"Your goal is a closed ecosystem: everything from chip to store is yours. Build all five ecosystem links and reach 850K devices on your own OS.":'Hedefin kapalı bir ekosistem: çipten mağazaya her şey senin. Beş ekosistem bağlantısını kur ve kendi OS\'unla 850 bin cihaza ulaş.'),
    goals:()=>[SCN_GOALS.eco(),SCN_GOALS.base(8.5e5)],
    setup(){G.name=(LANG_EN?"Halka Tech":'Halka Teknoloji');G.cash=6e6;G.equity=0.8;G.office=1;G.brand=10;scnRes('fw','os','mobile');G.rounds.seed={d:0,amt:6e6};
      for(const [r,sk] of [['soft',6],['soft',5],['soft',4.5],['design',5.5],['design',4.5],['hw',6],['hw',5],['res',5],['mkt',4.5]])scnHire(r,sk);}},
  /* v171: 5 → 6 yıl (ver 4). Bot ölçümünde zor ekonomi büyümeyi 1–2 yıl geciktiriyor: 50 koşunun hiçbiri 5 yılda $1,25 milyara ulaşmadı, 6 yılda %18'i, 7 yılda %50'si ulaştı. */
  crisis:{id:'crisis',ver:4,n:(LANG_EN?"Crisis Years":'Kriz Yılları'),diff:4,yrs:6,d:(LANG_EN?"Parts cost 25% more, demand is 15% lower, rivals are aggressive and crises hit more often. Can you make it out of the garage?":'Parça fiyatları %25 pahalı, talep %15 düşük, rakipler saldırgan ve kriz olayları daha sık. Garajdan çıkabilecek misin?'),start:(LANG_EN?"$150K, founder, garage; tough economy":'$150K, kurucu, garaj; zor ekonomi'),
    intro:(LANG_EN?"The economy is stagnant: parts are expensive, customers cautious, rivals ruthless. Stay afloat and reach a $1.25 billion valuation within six years.":'Ekonomi durgun: parçalar pahalı, müşteriler temkinli, rakipler acımasız. Ayakta kal ve altı yıl içinde $1,25 milyar değerlemeye ulaş.'),
    goals:()=>[SCN_GOALS.val(1.25e9)],
    setup(){G.mods={px:1.25,dem:0.85,ev:0.55,aggr:0.2};G.mac.ph='rec';G.mac.left=10;G.mac.log=[{ph:'rec',d:0}];G.mac.dem=0.9;G.mac.pe=0.8;for(const c in G.px)G.px[c]=1.25;for(const c of G.comps)c.aggr=Math.min(0.95,c.aggr+0.25);}},
};
const scnKey=id=>SCN[id]&&SCN[id].ver?id+'@'+SCN[id].ver:id;
const SCN_ORDER=['free','garage','rescue','chip','global','eco','crisis'];
const DIFF=[[(LANG_EN?"Free":'Serbest'),'st-mute'],[(LANG_EN?"Easy":'Kolay'),'st-ok'],[(LANG_EN?"Medium":'Orta'),'st-mute'],[(LANG_EN?"Hard":'Zor'),'st-warn'],[(LANG_EN?"Very hard":'Çok zor'),'st-bad']];
const SCN_KEY='silikon-garaj-scn';
function scnBest(){try{return JSON.parse(localStorage.getItem(SCN_KEY)||'{}')||{};}catch(e){return {};}}
function scnGoals(){const sc=G.scn&&SCN[G.scn.id];return sc&&sc.goals?sc.goals():[];}
function goalState(g,i){const v=g.v();let ok,p;
  if(g.fmt==='debt'){ok=v<=0;p=clamp(1-v/g.from,0,1);}else{ok=v>=g.t;p=clamp(v/g.t,0,1);}
  const sc=G.scn,got=sc&&sc.got&&i!=null&&sc.got[i]!=null;
  if(!ok&&got&&!g.hold)return {ok:true,p:1,show:(LANG_EN?`Reached · ${fmtDate(sc.got[i])}`:`Ulaşıldı · ${fmtDate(sc.got[i])}`),latched:true};
  const show=g.fmt==='money'||g.fmt==='debt'?money(v):g.fmt==='pct'?pct(v,1):g.fmt==='bool'?(v?(LANG_EN?"Done":'Tamam'):(LANG_EN?"Not yet":'Henüz değil')):g.fmt==='num'?num(v):`${Math.floor(v)}/${g.t}`;
  return {ok,p,show};}
const starsFor=(used,total)=>used<=total*0.5?3:used<=total*0.75?2:1;
const starHtml=n=>(LANG_EN?`<span class="stars" aria-label="${n} stars">${[1,2,3].map(i=>i<=n?'★':'<span class="off">★</span>').join('')}</span>`:`<span class="stars" aria-label="${n} yıldız">${[1,2,3].map(i=>i<=n?'★':'<span class="off">★</span>').join('')}</span>`);
function scnCheck(){
  const sc=G.scn;if(!sc||!sc.end||sc.won!=null||sc.fail!=null||G.over)return;
  const gs=scnGoals();if(!gs.length)return;sc.got=sc.got||{};
  gs.forEach((g,i)=>{if(sc.got[i]==null&&goalState(g,i).ok){sc.got[i]=G.day;if(gs.length>1)news((LANG_EN?`Scenario goal complete: ${g.n}.`:`Senaryo hedefi tamamlandı: ${g.n}.`),'good',true);}});
  if(gs.every((g,i)=>goalState(g,i).ok)){
    sc.won=G.day;sc.stars=starsFor(G.day,sc.end);sfx('ach');lbScn(sc);
    const b=scnBest(),o=b[scnKey(sc.id)];if(!o||sc.stars>o.stars||(sc.stars===o.stars&&G.day<o.days)){b[scnKey(sc.id)]={stars:sc.stars,days:G.day,diff:G.diff?G.diff.n:(LANG_EN?"Normal":'Normal')};try{localStorage.setItem(SCN_KEY,JSON.stringify(b));}catch(e){}}
    tl('star',(LANG_EN?`Scenario complete: ${SCN[sc.id].n} (${sc.stars} stars)`:`Senaryo tamamlandı: ${SCN[sc.id].n} (${sc.stars} yıldız)`));news((LANG_EN?`Scenario complete: ${SCN[sc.id].n}! ${sc.stars} stars.`:`Senaryo tamamlandı: ${SCN[sc.id].n}! ${sc.stars} yıldız.`),'good',true);G.prevSpeed=G.speed||1;G.speed=0;openModal('scnend');
  }else if(G.day>=sc.end){sc.fail=G.day;news((LANG_EN?`Scenario time is up: ${SCN[sc.id].n}. You can keep playing in free play.`:`Senaryo süresi doldu: ${SCN[sc.id].n}. Serbest oyunda devam edebilirsin.`),'bad',true);G.prevSpeed=G.speed||1;G.speed=0;openModal('scnend');}
}
function scnGoalList(){return scnGoals().map((g,i)=>{const st=goalState(g,i);return `<div class="goal ${st.ok?'ok':''}"><span class="ck">${st.ok?'✓':''}</span><span>${esc(g.n)}${g.hold?(LANG_EN?" <span class=\"small muted\">(at the same time as the other goals)</span>":' <span class="small muted">(diğer hedeflerle aynı anda)</span>'):''}</span><b class="num small">${st.show}</b><div class="bar"><i style="width:${st.p*100}%;background:${st.ok?'var(--ok)':'var(--accent)'}"></i></div></div>`;}).join('');}
function scnStatus(){const sc=G.scn;if(!sc)return '';return sc.won!=null?(LANG_EN?`Completed ${starHtml(sc.stars)}`:`Tamamlandı ${starHtml(sc.stars)}`):sc.fail!=null?(LANG_EN?"<span class=\"neg\">Time's up, free play</span>":'<span class="neg">Süre doldu, serbest oyun</span>'):(LANG_EN?`Time left <b>${fmtLeft(sc.end-G.day)}</b>`:`Kalan süre <b>${fmtLeft(sc.end-G.day)}</b>`);}
function scnStrip(){
  {const ss=storyStrip();if(ss)return ss;}
  if(chalOn()){const C=G.chal,left=C.end-G.day;return (LANG_EN?`<div class="scn-strip"><b>${isDuel(C.id)?"Friend challenge "+esc(C.id.slice(2)):"Weekly challenge "+esc(C.id)}</b><span>${Math.floor(left/365)} yr ${Math.floor((left%365)/30)} mo left</span><span>Valuation <b class="num">${money(valuation())}</b></span>${dsGhost()}<button class="btn sm ghost" data-act="tab" data-tab="stats:lider">Leaderboard</button></div>`:`<div class="scn-strip"><b>${isDuel(C.id)?'Arkadaş meydan okuması '+esc(C.id.slice(2)):'Haftanın meydan okuması '+esc(C.id)}</b><span>Kalan ${Math.floor(left/365)} yıl ${Math.floor((left%365)/30)} ay</span><span>Değerleme <b class="num">${money(valuation())}</b></span>${dsGhost()}<button class="btn sm ghost" data-act="tab" data-tab="stats:lider">Tablo</button></div>`);}
  return '';
}
function vScnPanel(){
  const sc=G.scn;if(!sc||!sc.end)return '';const S0=SCN[sc.id];
  const used=Math.min(G.day,sc.end)/sc.end;
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Scenario: ${esc(S0.n)}</h2><span class="sub">${scnStatus()}</span></div><div class="pb col">
    <div class="small muted">${esc(S0.d)}</div>${scnGoalList()}
    <div class="row between small"><span>Time</span><span class="muted">3 stars before ${fmtDate(sc.end*0.5)}, 2 stars before ${fmtDate(sc.end*0.75)} · last day ${fmtDate(sc.end)}</span></div>
    <div class="bar"><i style="width:${used*100}%;background:${used>0.75?'var(--bad)':used>0.5?'var(--warn)':'var(--ok)'}"></i></div></div></section>`:`<section class="panel"><div class="ph"><h2>Senaryo: ${esc(S0.n)}</h2><span class="sub">${scnStatus()}</span></div><div class="pb col">
    <div class="small muted">${esc(S0.d)}</div>${scnGoalList()}
    <div class="row between small"><span>Süre</span><span class="muted">3 yıldız için ${fmtDate(sc.end*0.5)}, 2 yıldız için ${fmtDate(sc.end*0.75)} öncesi · son gün ${fmtDate(sc.end)}</span></div>
    <div class="bar"><i style="width:${used*100}%;background:${used>0.75?'var(--bad)':used>0.5?'var(--warn)':'var(--ok)'}"></i></div></div></section>`);
}
function vScnPicker(first){
  const best=scnBest();
  const cards=SCN_ORDER.map(id=>{const sc=SCN[id],df=DIFF[sc.diff],b=best[scnKey(id)];
    const goals=sc.goals?sc.goals().map(g=>`<li>${esc(g.n)}</li>`).join(''):(LANG_EN?"<li>No goals</li>":'<li>Hedef yok</li>');
    return (LANG_EN?`<div class="scn"><div class="row between"><h3>${esc(sc.n)}</h3><span class="chip ${df[1]}">${df[0]}</span></div>
      <div class="small">${esc(sc.d)}</div>
      <div class="small muted"><b>Setup:</b> ${esc(sc.start)}${sc.yrs?` · <b>Duration:</b> ${scnDur(sc.yrs)}`:''}</div>
      <ul class="small">${goals}</ul>
      ${b?`<div class="small">Best: ${starHtml(b.stars)} ${fmtLeft(b.days)}${b.diff&&b.diff!=='Normal'?` · ${esc(b.diff)}`:''}</div>`:''}
      <button class="btn sm ${id==='free'?'':'primary'}" data-act="scnstart" data-s="${id}">Start</button></div>`:`<div class="scn"><div class="row between"><h3>${esc(sc.n)}</h3><span class="chip ${df[1]}">${df[0]}</span></div>
      <div class="small">${esc(sc.d)}</div>
      <div class="small muted"><b>Başlangıç:</b> ${esc(sc.start)}${sc.yrs?` · <b>Süre:</b> ${scnDur(sc.yrs)}`:''}</div>
      <ul class="small">${goals}</ul>
      ${b?`<div class="small">En iyi: ${starHtml(b.stars)} ${fmtLeft(b.days)}${b.diff&&b.diff!=='Normal'?` · ${esc(b.diff)}`:''}</div>`:''}
      <button class="btn sm ${id==='free'?'':'primary'}" data-act="scnstart" data-s="${id}">Başla</button></div>`);}).join('');
  return (LANG_EN?`<div class="row between" style="gap:8px;flex-wrap:wrap"><div class="eyebrow">New game</div>${vLangPick()}</div><h2>Choose a scenario</h2>
    ${vDiffPick()}
    ${first?"<p class=\"small muted\">Free play has no goals. In scenarios, you start from a set position and try to reach goals within a time limit. Finish faster to earn more stars.</p>":"<p class=\"small neg\">Starting a new scenario will delete your current company.</p>"}
    ${vCloudStart()}<div class="scn-grid">${vStoryCardPick()}${vSerialCard()}${vChalCard()}${vDuelCard()}${vSedCard()}${cards}</div>
    ${vMyScn()}
    ${vGallery()}
    <div class="row"><button class="btn" data-act="scncancel">${first?"Continue in free play":"Cancel"}</button></div>`:`<div class="row between" style="gap:8px;flex-wrap:wrap"><div class="eyebrow">Yeni oyun</div>${vLangPick()}</div><h2>Senaryo seç</h2>
    ${vDiffPick()}
    ${first?'<p class="small muted">Serbest oyunda hedef yoktur. Senaryolarda belirli bir başlangıçla, süre sınırı içinde hedeflere ulaşmaya çalışırsın. Hızlı bitirirsen daha çok yıldız alırsın.</p>':'<p class="small neg">Yeni bir senaryo başlatırsan mevcut şirketin silinir.</p>'}
    ${vCloudStart()}<div class="scn-grid">${vStoryCardPick()}${vSerialCard()}${vChalCard()}${vDuelCard()}${vSedCard()}${cards}</div>
    ${vMyScn()}
    ${vGallery()}
    <div class="row"><button class="btn" data-act="scncancel">${first?'Serbest oyunla devam':'Vazgeç'}</button></div>`);
}

