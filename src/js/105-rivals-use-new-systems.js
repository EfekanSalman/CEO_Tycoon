/* ============================== RIVALS USE NEW SYSTEMS ============================== */
/* Rakipler de yeni sistemleri kullanır (Pazar → Rakip CEO'lar → Rakiplerin hamleleri):
   - Söküm: senin önde olduğun bir kategorideki en iyi ürününü satın alıp söker (temiz oda ya da doğrudan kopya). Bitince o kategoride
     18 ay yeni ürünleri güçlenir (%3–8, senden ne kadar gerideyse o kadar çok) ve en iyi ürünü hemen yarısı kadar iyileşir.
     Doğrudan kopyada dava açabilirsin: kopya kanıtı kazanma ihtimaline +25 puan ekler; kazanırsan rakibin söküm kazanımı da silinir.
   - Kriz: büyük rakipler de veri sızıntısı, ürün güvenliği, grev, kesinti yaşar. Kriz masasını dürüst ya da inkârla yönetir
     (saldırganlık arttıkça inkâr olasılığı artar; inkâr çoğu zaman ortaya çıkar). Etkilenen ürünleri 90 gün daha az çekici olur,
     marka ve nakit kaybeder. O kategorilerde ürünün varsa fırsat kararı gelir: karşılaştırmalı kampanya, geçiş indirimi ya da sessiz kalmak.
   - Karşı lobi: bir yasa teklifinde lobi yaptığında, çıkarı ters yönde olan rakipler harcamana karşılık verir.
   - Mezun girişimleri: Seri A ya da B'deki umut vadeden bir mezun girişimini rakip satın almak isteyebilir; 45 gün içinde sen satın alır
     ya da %25 pay sahibi olursan engellersin. Rakip alırsa payın %30 primle ödenir, rakibin o kategorisi güçlenir.
   Her biri sgOff anahtarıyla kapatılabilir (rtd, rcd, rlob, rsp) ki bot ölçümünde etkisi ayrı ölçülebilsin. */
const RVN_CL_CAP=0.35,RVN_TD_P=0.12,RVN_TD_COOL=540,RVN_CP=0.25,RVN_CR_P=0.006,RVN_CR_COOL=720,RVN_BID_P=0.03,RVN_BID_DAYS=45,RVN_VETO=0.25;
const newRvn=()=>({td:[],log:[],cool:{},pc:{}});
/* rakip CEO'nun kişiliği hamlelerini belirler: söküm sıklığı (td), doğrudan kopya (cp), krizde inkâr (lie), mezun teklifi (bid), karşı lobi (cl).
   Kavgacı ve Fırsatçı daha sık söker, kopyalar ve inkâr eder; Diplomat ve Vizyoner temiz oda seçer ve krizi açık yönetir. */
const RVN_P={viz:{td:0.8,cp:0.4,lie:0.4,bid:1.2,cl:0.8},kav:{td:1.3,cp:1.7,lie:1.6,bid:1,cl:1.5},muh:{td:0.7,cp:0.5,lie:0.8,bid:0.8,cl:1},
  dip:{td:0.6,cp:0.2,lie:0.3,bid:0.9,cl:0.6},fir:{td:1.6,cp:1.5,lie:1.2,bid:1.5,cl:1},giz:{td:1,cp:1,lie:1,bid:1,cl:1}};
const rvnP=c=>RVN_P[c&&c.ceo&&c.ceo.p]||RVN_P.giz;
const rvnCeoTxt=c=>c&&c.ceo&&PERS[c.ceo.p]?PERS[c.ceo.p].n:'';
const rvnOf=()=>G.rvn||(G.rvn=newRvn());
const rvnLog=(t,k,cid)=>{const N=rvnOf();N.log.unshift({d:G.day,t,k,cid});if(N.log.length>12)N.log.pop();};
/* rakibin söküm kazanımı: aiLaunch'ta puan çarpanı */
function rvnTdB(c,cat){const k=c&&c.tdk&&c.tdk[cat];if(!k)return 0;if(G.day>k.until){delete c.tdk[cat];return 0;}return k.b;}
/* rakip krizi: rivApp'te çekicilik çarpanı */
function rvnCrM(c,cat){const X=c&&c.crs;if(!X||G.day>=X.until)return 1;return X.cats.includes(cat)?X.m:1;}
const rvnBest=(o,cat)=>G.products.filter(q=>q.active&&q.owner===o&&q.cat===cat).sort((a,b)=>b.score-a.score)[0]||null;

/* ---- söküm ---- */
function rvnTdMonthly(){const N=rvnOf();for(const j of N.td.slice())if(G.day>=j.end)rvnTdFinish(j);
  if(sgOff('rtd')||G.day<540||N.td.length>=2||Math.random()>=RVN_TD_P)return;const I=infl(),opts=[];
  for(const c of liveComps()){if((c.cash||0)<3e6*I||N.td.some(j=>j.cid===c.id)||ceoPact(c))continue;
    for(const cat of c.focus){const p=rvnBest('P',cat);if(!p)continue;const mv=p.score/S(cat),q=rvnBest(c.id,cat),rv=q?q.score/S(cat):0;
      if(mv-rv<0.05||G.day<(N.cool[c.id+'|'+cat]||0)||G.day<((N.pc||{})[p.id]||0)||N.td.some(j=>j.pid===p.id))continue;opts.push({c,cat,p,gap:mv-rv,w:(mv-rv)*(0.5+(c.aggr||0.5))*(0.3+Math.sqrt(p.share||0))*rvnP(c).td});}}
  if(!opts.length)return;let r=Math.random()*opts.reduce((a,o)=>a+o.w,0),o=opts[0];for(const x of opts){r-=x.w;if(r<=0){o=x;break;}}
  const {c,cat,p}=o,ap=Math.random()<clamp((c.aggr||0.5)*0.7*rvnP(c).cp,0.03,0.95)?'direct':'clean',A=TDN_AP[ap];c.cash-=tdnCost(p,ap);
  N.td.push({cid:c.id,cat,pid:p.id,pn:p.name,ap,s:G.day,end:G.day+A.days,gap:o.gap});N.cool[c.id+'|'+cat]=G.day+RVN_TD_COOL;(N.pc=N.pc||{})[p.id]=G.day+365;
  rvnLog((LANG_EN?`${c.name} started tearing down ${p.name} (${A.n.toLocaleLowerCase(LOC)})`:`${c.name}, ${p.name} ürününü sökmeye başladı (${A.n.toLocaleLowerCase(LOC)})`),'td',c.id);apRival((LANG_EN?`${c.name} started tearing down ${p.name}.`:`${c.name}, ${p.name} ürününü sökmeye başladı.`),'market:ceo');
  news((LANG_EN?`${c.name} bought ${p.name} to tear it down (${A.n.toLocaleLowerCase(LOC)}, ${A.days} days). When the teardown is done, its ${CATS[cat].n.toLocaleLowerCase(LOC)} products will get stronger.`:`${c.name}, ${p.name} ürününü sökmek için satın aldı (${A.n.toLocaleLowerCase(LOC)}, ${A.days} gün). Söküm bitince ${CATS[cat].n.toLocaleLowerCase(LOC)} ürünleri güçlenecek.`),'bad',true);}
function rvnTdFinish(j){const N=rvnOf();N.td=N.td.filter(x=>x!==j);const c=comp(j.cid);if(!c||c.dead)return;const A=TDN_AP[j.ap];
  const b=Math.round(A.gain*clamp(0.03+0.5*j.gap,0.03,0.08)*1000)/1000;c.tdk=c.tdk||{};c.tdk[j.cat]={b:Math.max(b,rvnTdB(c,j.cat)),until:G.day+TDN_KNOW,cp:j.ap==='direct'?1:0};
  const q=rvnBest(c.id,j.cat);if(q){q.score*=1+b*0.5;q.updAt=G.day;}
  rlogAdd(c,(LANG_EN?`Finished the teardown of ${j.pn} (${CATS[j.cat].n} products score +${tdnF(b*100)}%)`:`${j.pn} sökümünü tamamladı (${CATS[j.cat].n} ürünlerinde puan +%${tdnF(b*100)})`));rvnLog((LANG_EN?`${c.name} finished tearing down ${j.pn}: ${CATS[j.cat].n} +${tdnF(b*100)}%`:`${c.name}, ${j.pn} sökümünü bitirdi: ${CATS[j.cat].n} +%${tdnF(b*100)}`),'td',c.id);
  if(j.ap==='direct'&&!G.cases.some(k=>k.cid===c.id)&&!crossWith(c.id))triggerChoice('rvcopy',{cid:c.id,cat:j.cat,pn:j.pn,lic:Math.round(Math.max(3e5*infl(),catRev(c.id,j.cat)*rnd(0.4,0.7)))});
  else news((LANG_EN?`${c.name} finished tearing down ${j.pn}: its ${CATS[j.cat].n.toLocaleLowerCase(LOC)} products will be stronger for 18 months.`:`${c.name}, ${j.pn} sökümünü bitirdi: ${CATS[j.cat].n.toLocaleLowerCase(LOC)} ürünleri 18 ay boyunca daha güçlü olacak.`),'bad');}
const rvnCaseP=(cat,c,firm)=>clamp(plainChance(cat,c,firm)+RVN_CP,0.08,0.92);
const RVCOPY={id:'rvcopy',w:0,choice:true,cond:()=>false,
  view:d=>{const c=comp(d.cid),n=c?c.name:(LANG_EN?"A rival":'Bir rakip'),pn=rvnCeoTxt(c);return {t:(LANG_EN?"Your product was copied":'Ürünün kopyalandı'),b:(LANG_EN?`${n}${pn?` (${pn} CEO)`:''} tore down ${d.pn} as a direct copy; it will carry the design and solutions into its own ${CATS[d.cat].n.toLocaleLowerCase(LOC)} products. Since you have evidence of copying, a lawsuit starts from a strong position. If you win, you get damages and the rival loses its teardown gain.`:`${n}${pn?` (${pn} CEO)`:''}, ${d.pn} ürününü doğrudan kopyalayarak söktü; tasarımını ve çözümlerini kendi ${CATS[d.cat].n.toLocaleLowerCase(LOC)} ürünlerine aktaracak. Kopya kanıtı elinde olduğu için dava açarsan güçlü başlarsın. Kazanırsan tazminat alırsın ve rakibin söküm kazanımı silinir.`),
    o:[{t:(LANG_EN?`Sue with a standard law firm (${money(LAW.std.cost*infl())}/mo)`:`Standart büroyla dava aç (${money(LAW.std.cost*infl())}/ay)`),d:(LANG_EN?`Chance of winning ~${c?Math.round(rvnCaseP(d.cat,c,'std')*100):50}%.`:`Kazanma ihtimali ~%${c?Math.round(rvnCaseP(d.cat,c,'std')*100):50}.`)},
      {t:(LANG_EN?`Sue with a top law firm (${money(LAW.top.cost*infl())}/mo)`:`Prestijli büroyla dava aç (${money(LAW.top.cost*infl())}/ay)`),d:(LANG_EN?`Chance of winning ~${c?Math.round(rvnCaseP(d.cat,c,'top')*100):60}%.`:`Kazanma ihtimali ~%${c?Math.round(rvnCaseP(d.cat,c,'top')*100):60}.`)},
      {t:(LANG_EN?"Demand a license fee":'Lisans ücreti iste'),d:(LANG_EN?`If they accept, ${money(rvnLic(d))} comes in right away and you don't sue (chance they accept ~${c?Math.round(rvnLicP(c)*100):50}%).`:`Kabul ederlerse ${money(rvnLic(d))} hemen gelir ve dava açmazsın (kabul ihtimali ~%${c?Math.round(rvnLicP(c)*100):50}).`)},
      {t:(LANG_EN?"Ignore it":'Görmezden gel'),d:(LANG_EN?"No cost; the rival keeps its gain.":'Masraf yok; rakip kazanımını korur.')}]};},
  pick(d,i){const c=comp(d.cid);if(!c||c.dead)return;
    if(i===0||i===1){const f=i===1?'top':'std';openCase(c.id,d.cat,'pl',f);c.rel=clamp(relOf(c)+15,-100,100);const k=G.cases[G.cases.length-1];if(k)k.cp=1;news((LANG_EN?`You filed a copying lawsuit against ${c.name} (${LAW[f].n}).`:`${c.name} aleyhine kopya davası açtın (${LAW[f].n}).`),'mkt',true);return;}
    if(i===2){if(Math.random()<rvnLicP(c)){const a=rvnLic(d);G.cash+=a;G.month.rev+=a;c.cash-=a;c.rel=clamp(relOf(c)-5,-100,100);news((LANG_EN?`${c.name} accepted the license fee: ${money(a)} collected.`:`${c.name} lisans ücretini kabul etti: ${money(a)} tahsil edildi.`),'good',true);}
      else{c.rel=clamp(relOf(c)-8,-100,100);news((LANG_EN?`${c.name} refused to pay a license fee.`:`${c.name} lisans ücreti ödemeyi reddetti.`),'bad');}return;}
    news((LANG_EN?`You closed the copying matter with ${c.name}.`:`${c.name} ile kopya konusunu kapattın.`));}};
/* lisans ücreti karar oluşurken bir kez belirlenir (d.lic); eskiden pencere her çizildiğinde rastgele yeniden hesaplanıyordu */
const rvnLic=d=>d.lic||Math.round(Math.max(3e5*infl(),catRev(d.cid,d.cat)*0.55));
const rvnLicP=c=>clamp(0.55-0.3*(c.aggr||0.5)+relOf(c)/250,0.1,0.8);

/* ---- kriz ---- */
const RVN_CR={breach:{n:(LANG_EN?"Major data breach":'Büyük veri sızıntısı'),cats:c=>c.focus.filter(f=>SW_CATS.includes(f))},
  safety:{n:(LANG_EN?"Product safety crisis":'Ürün güvenliği krizi'),cats:c=>c.focus.filter(f=>HW.includes(f))},
  strike:{n:(LANG_EN?"General strike":'Genel grev'),min:150,cats:c=>c.focus.filter(f=>HW.includes(f))},
  outage:{n:(LANG_EN?"Global service outage":'Küresel hizmet kesintisi'),cats:c=>c.focus.filter(f=>['saas','os','ai'].includes(f))}};
function rvnCrMonthly(){
  for(const c of liveComps()){const X=c.crs;if(!X||X.rev||!X.lie||G.day<X.revAt)continue;X.rev=true;
    if(Math.random()<0.6){c.brand=clamp(c.brand-4,3,90);X.m=Math.round(X.m*0.9*100)/100;X.until=Math.max(X.until,G.day+60);rlogAdd(c,(LANG_EN?`${RVN_CR[X.k].n}: its first statement turned out to be false`:`${RVN_CR[X.k].n}: ilk açıklamasının doğru olmadığı ortaya çıktı`));
      rvnLog((LANG_EN?`${c.name}: its statement during the crisis turned out to be a lie`:`${c.name}: krizdeki açıklamasının yalan olduğu ortaya çıktı`),'cr',c.id);news((LANG_EN?`${c.name}: its first statement about the ${RVN_CR[X.k].n.toLocaleLowerCase(LOC)} turned out to be false. Brand −4, sales falling further.`:`${c.name}: ${RVN_CR[X.k].n.toLocaleLowerCase(LOC)} hakkındaki ilk açıklamasının doğru olmadığı ortaya çıktı. Marka −4, satışları daha da düşüyor.`),'mkt',true);}}
  if(sgOff('rcd')||G.day<365)return;
  for(const c of liveComps()){if((c.emp||0)<60||G.day-(c.crLast||-999)<RVN_CR_COOL||Math.random()>=RVN_CR_P)continue;
    const L=Object.keys(RVN_CR).filter(k=>RVN_CR[k].cats(c).length&&(c.emp||0)>=(RVN_CR[k].min||0));if(!L.length)continue;rvnCrStart(c,pick(L));break;}}
function rvnCrStart(c,k){const T=RVN_CR[k],cats=T.cats(c),lie=Math.random()<clamp((c.aggr||0.5)*0.7*rvnP(c).lie,0.03,0.95),I=infl();
  const fine=Math.round(Math.min(Math.max(0,c.cash)*0.08,Math.max(5e5*I,compVal(c)*rnd(0.002,0.008))));
  c.cash-=fine;c.brand=clamp(c.brand-(lie?rnd(0.5,1.5):rnd(1.5,3)),3,90);c.crLast=G.day;
  c.crs={k,cats,until:G.day+90,m:lie?0.88:0.92,lie,revAt:G.day+rint(20,40),rev:false,d:G.day};
  rlogAdd(c,(LANG_EN?`${T.n}: crisis desk ${lie?"denied everything":"took responsibility"}`:`${T.n}: kriz masası ${lie?'inkâr etti':'sorumluluğu üstlendi'}`));rvnLog(`${c.name}: ${T.n.toLocaleLowerCase(LOC)} (${lie?(LANG_EN?"denial":'inkâr'):(LANG_EN?"handled openly":'açık yönetim')})`,'cr',c.id);
  const mine=cats.filter(cat=>myActive(cat).length);if(mine.length)apRival((LANG_EN?`${c.name} in crisis: ${T.n.toLocaleLowerCase(LOC)}. Its customers in your market are wavering.`:`${c.name} krizde: ${T.n.toLocaleLowerCase(LOC)}. Pazarındaki müşterileri kararsız.`),'market:ceo');
  news((LANG_EN?`${c.name} in crisis: ${T.n.toLocaleLowerCase(LOC)}. The company ${lie?"denies the claims":"apologized and opened an investigation"}; sales of its ${cats.map(x=>CATS[x].n).join(', ')} products will drop for 90 days.`:`${c.name} krizde: ${T.n.toLocaleLowerCase(LOC)}. Şirket ${lie?'iddiaları reddediyor':'özür diledi ve soruşturma başlattı'}; ${cats.map(x=>CATS[x].n).join(', ')} ürünlerinin satışları 90 gün düşecek.`),'mkt',true);
  if(mine.length)triggerChoice('rvcrisis',{cid:c.id,k,cats:mine});}
/* kriz fırsatı maliyetleri etkilenen ürünlerin aylık cirosuyla ölçeklenir. Eskiden şirketin toplam cirosunun %12'siydi ve kampanya yalnızca süren
   kampanyaları uzatıyordu: aynı koşu içindeki seçenek muhasebesinde kampanya −10M, indirim −4M getirdi, sessiz kalmak 146 kararın 133'ünde en iyisiydi. */
const rvnAffRev=cats=>G.products.filter(p=>p.active&&p.owner==='P'&&cats.includes(p.cat)).reduce((a,p)=>a+wiPRev(p),0);
const rvnCampCost=cats=>Math.round(Math.max(1e5*infl(),rvnAffRev(cats||[])*0.05)/1000)*1000;
const rvnDiscCost=cats=>Math.round(Math.max(5e4*infl(),rvnAffRev(cats||[])*0.02)/1000)*1000;
const RVCRISIS={id:'rvcrisis',w:0,choice:true,cond:()=>false,
  view:d=>{const c=comp(d.cid),n=c?c.name:(LANG_EN?"A rival":'Bir rakip'),T=RVN_CR[d.k]||{n:(LANG_EN?"Crisis":'Kriz')},cs=d.cats.map(x=>CATS[x].n).join(', ');return {t:(LANG_EN?`Rival in crisis: ${n}`:`Rakipte kriz: ${n}`),b:(LANG_EN?`${n} is going through a ${T.n.toLocaleLowerCase(LOC)}. Its customers in the ${cs} market are wavering; this could be an opportunity for you.`:`${n} ${T.n.toLocaleLowerCase(LOC)} yaşıyor. ${cs} pazarında müşterileri kararsız; bu, senin için bir fırsat olabilir.`),
    o:[{t:(LANG_EN?`Comparative ad campaign (${money(rvnCampCost(d.cats))})`:`Karşılaştırmalı kampanya (${money(rvnCampCost(d.cats))})`),d:(LANG_EN?`Appeal of your ${cs} products +20% for 30 days (on top of running campaigns). Ads that target a rival's crisis can backfire (25% chance of brand −1).`:`${cs} ürünlerinin çekiciliği 30 gün +%20 (süren kampanyaların üstüne). Rakibin krizini hedef alan reklam tepki de çekebilir (%25 ihtimalle marka −1).`)},
      {t:(LANG_EN?`Switching discount (${money(rvnDiscCost(d.cats))})`:`Geçiş indirimi (${money(rvnDiscCost(d.cats))})`),d:(LANG_EN?`Appeal of your ${cs} products +8% for 60 days; you quietly open the door to the rival's customers.`:`${cs} ürünlerinin çekiciliği 60 gün +%8; rakibin müşterilerine sessizce kapı açarsın.`)},
      {t:(LANG_EN?"Stay quiet":'Sessiz kal'),d:(LANG_EN?"No cost. Not exploiting a crisis earns respect in the industry: brand +0.3.":'Masraf yok. Krizden fırsat çıkarmamak sektörde saygı görür: marka +0,3.')}]};},
  pick(d,i){const c=comp(d.cid),ps=G.products.filter(p=>p.active&&p.owner==='P'&&d.cats.includes(p.cat));
    if(i===0){const a=rvnCampCost(d.cats);if(G.cash<a){news((LANG_EN?"Not enough cash for the campaign; the opportunity was missed.":'Kampanya için yeterli nakit yoktu; fırsat kaçtı.'),'bad');return;}spend(a,'other');for(const p of ps)awHype(p,1.2,30);
      const bk=Math.random()<0.25;if(bk)G.brand=clamp(G.brand-1,0,100);if(c)c.rel=clamp(relOf(c)-10,-100,100);news((LANG_EN?`Comparative campaign started (${ps.length} products, 30 days).${bk?" Exploiting the rival's crisis drew a backlash: brand −1.":''}`:`Karşılaştırmalı kampanya başladı (${ps.length} ürün, 30 gün).${bk?' Rakibin krizini kullanmak tepki çekti: marka −1.':''}`),bk?'bad':'good',true);return;}
    if(i===1){const a=rvnDiscCost(d.cats);if(G.cash<a){news((LANG_EN?"Not enough cash for the switching discount.":'Geçiş indirimi için yeterli nakit yoktu.'),'bad');return;}spend(a,'other');for(const p of ps)awHype(p,1.08,60);news((LANG_EN?`Switching discount started: appeal of ${ps.length} products +8% for 60 days.`:`Geçiş indirimi başladı: ${ps.length} ürünün çekiciliği 60 gün +%8.`),'good');return;}
    G.brand=clamp(G.brand+0.3,0,100);if(c)c.rel=clamp(relOf(c)+3,-100,100);}};

/* ---- karşı lobi (lobMonthly içinde, rakip lobisinden sonra) ---- */
function rvnCounterLobby(B){if(sgOff('rlob')||!B||!B.mySide)return;const d=(B.mine||0)-(B.mSeen||0);B.mSeen=B.mine||0;if(d<=0)return;const T=LOB_B[B.k],who=[];
  // toplam karşılık, yeni harcamanın en çok %35'i (rakip başına ayrı hesap birikince oyuncunun lobisini boşa çıkarıyordu)
  const opp=liveComps().filter(c=>T.rv(c)===-B.mySide),want=opp.map(c=>Math.min(Math.max(0,c.cash)*0.004,d*0.4*(c.aggr||0.5)*rvnP(c).cl)),tw=want.reduce((a,b)=>a+b,0),k=tw>d*RVN_CL_CAP?d*RVN_CL_CAP/tw:1;
  for(let i=0;i<opp.length;i++){const c=opp[i],s=-B.mySide,amt=want[i]*k;if(amt<=0)continue;
    c.cash-=amt;if(s>0)B.for+=amt;else B.against+=amt;B.rv[c.id]=(B.rv[c.id]||0)+s*amt;B.cl=(B.cl||0)+amt;who.push(c.name);}
  if(who.length){rvnLog((LANG_EN?`${T.n}: ${who.slice(0,3).join(', ')} counter-lobbied`:`${T.n}: ${who.slice(0,3).join(', ')} karşı lobi yaptı`),'lob');if(!B.clN){B.clN=1;news((LANG_EN?`${T.n}: ${who.slice(0,2).join(" and ")}${who.length>2?` and ${who.length-2} more rivals`:''} answered your lobbying with a counter-lobby.`:`${T.n}: lobi harcamana ${who.slice(0,2).join(' ve ')}${who.length>2?` ile ${who.length-2} rakip daha`:''} karşı lobiyle yanıt verdi.`),'mkt',true);}}}

/* ---- mezun girişimine rakip teklifi (spnMonthly sonunda) ---- */
function rvnSpnMonthly(){const S=G.spn;if(!S)return;
  for(const s of S.list){if(!spnLive(s))continue;
    if(s.bid){const c=comp(s.bid.cid);if(!c||c.dead){s.bid=null;continue;}if(G.day<s.bid.at)continue;const b=s.bid;s.bid=null;
      if(s.stake>=RVN_VETO-1e-9){news((LANG_EN?`${c.name} could not buy ${s.name}: your ${Math.round(s.stake*100)}% stake blocked the bid.`:`${c.name}, ${s.name} girişimini satın alamadı: %${Math.round(s.stake*100)} payınla teklifi engelledin.`),'good',true);rvnLog((LANG_EN?`${c.name} was blocked in its bid for ${s.name}`:`${c.name}, ${s.name} teklifinde engellendi`),'spn',c.id);continue;}
      const price=Math.round(s.val*1.3);if(c.cash<price)continue;c.cash-=price;const pay=Math.round(price*s.stake);if(pay>0){G.cash+=pay;G.month.rev+=pay;}
      s.st='rvacq';s.cid=c.id;s.end=G.day;c.tech=clamp(c.tech+0.01,0.7,1.45);c.tdk=c.tdk||{};c.tdk[s.cat]={b:Math.max(0.04,rvnTdB(c,s.cat)),until:G.day+365};
      if(!c.focus.includes(s.cat))c.focus=[...c.focus,s.cat];rlogAdd(c,(LANG_EN?`Bought alumni startup ${s.name}`:`Mezun girişimi ${s.name} satın alındı`));rvnLog((LANG_EN?`${c.name} bought ${s.name}`:`${c.name}, ${s.name} girişimini satın aldı`),'spn',c.id);tl('rival',(LANG_EN?`${c.name} bought ${s.name}`:`${c.name}, ${s.name} girişimini satın aldı`));
      news((LANG_EN?`${c.name} paid ${money(price)} to buy ${s.name}, the startup founded by your former employee ${s.fn}. Its ${CATS[s.cat].n} products will be stronger for 12 months.${pay?` Your stake's share, ${money(pay)}, was paid into your account.`:''}`:`${c.name}, eski çalışanın ${s.fn} tarafından kurulan ${s.name} girişimini ${money(price)} ödeyerek satın aldı. ${CATS[s.cat].n} ürünleri 12 ay güçlenecek.${pay?` Payının karşılığı ${money(pay)} hesabına geçti.`:''}`),'bad',true);continue;}
    if(sgOff('rsp')||(s.st!=='a'&&s.st!=='b')||s.q<0.9||s.bidN)continue;
    const L=liveComps().filter(c=>c.focus.includes(s.cat)&&c.cash>s.val*2.5&&!c.alum);if(!L.length)continue;const c=L.sort((a,b)=>b.cash-a.cash)[0];if(Math.random()>=RVN_BID_P*rvnP(c).bid)continue;
    s.bid={cid:c.id,at:G.day+RVN_BID_DAYS};s.bidN=1;rvnLog((LANG_EN?`${c.name} made a bid for ${s.name}`:`${c.name}, ${s.name} girişimine teklif verdi`),'spn',c.id);apRival((LANG_EN?`${c.name} bid for your alumni startup ${s.name} (${RVN_BID_DAYS} days).`:`${c.name}, mezun girişimin ${s.name} için teklif verdi (${RVN_BID_DAYS} gün).`),'team:mezun');
    news((LANG_EN?`${c.name} made an offer to buy your alumni startup ${s.name}. Within ${RVN_BID_DAYS} days you can buy it yourself or block the bid by holding a ${Math.round(RVN_VETO*100)}% stake (Team → Alumni).`:`${c.name}, mezun girişimin ${s.name} için satın alma teklifi verdi. ${RVN_BID_DAYS} gün içinde sen satın alabilir ya da %${Math.round(RVN_VETO*100)} pay sahibi olarak teklifi engelleyebilirsin (Ekip → Mezunlar).`),'bad',true);}}

function rvnMonthly(){if(!G||G.over)return;rvnTdMonthly();rvnCrMonthly();}
EVENTS.push(RVCOPY,RVCRISIS);EVD.rvcopy=RVCOPY;EVD.rvcrisis=RVCRISIS;

/* ---- görünüm ---- */
function vRivalMoves(){const N=rvnOf(),td=N.td.filter(j=>comp(j.cid)),cr=liveComps().filter(c=>c.crs&&G.day<c.crs.until),tk=[];
  for(const c of liveComps())for(const cat in c.tdk||{}){const b=rvnTdB(c,cat);if(b)tk.push([c,cat,c.tdk[cat]]);}
  const bids=(G.spn?G.spn.list:[]).filter(s=>s.bid&&spnLive(s)&&comp(s.bid.cid));
  const row=(a,b)=>`<div class="rvn-r"><span>${a}</span><span class="small muted">${b}</span></div>`;
  const parts=[];
  if(td.length)parts.push((LANG_EN?`<div class="col" style="gap:4px"><b class="small">Teardowns in progress</b>${td.map(j=>{const c=comp(j.cid),pn=rvnCeoTxt(c);return row(`<b>${esc(c.name)}</b> · ${esc(j.pn)}`,`${TDN_AP[j.ap].n} · ${j.end-G.day} days${pn?` · ${pn} CEO`:''}`);}).join('')}</div>`:`<div class="col" style="gap:4px"><b class="small">Söküm yapılıyor</b>${td.map(j=>{const c=comp(j.cid),pn=rvnCeoTxt(c);return row(`<b>${esc(c.name)}</b> · ${esc(j.pn)}`,`${TDN_AP[j.ap].n} · ${j.end-G.day} gün${pn?` · ${pn} CEO`:''}`);}).join('')}</div>`));
  if(tk.length)parts.push((LANG_EN?`<div class="col" style="gap:4px"><b class="small">Rivals with teardown gains</b>${tk.map(([c,cat,k])=>row(`<b>${esc(c.name)}</b> · ${CATS[cat].n} +${tdnF(k.b*100)}%`,`until ${fmtDate(k.until)}${k.cp?" · copy":''}`)).join('')}</div>`:`<div class="col" style="gap:4px"><b class="small">Söküm kazanımı olan rakipler</b>${tk.map(([c,cat,k])=>row(`<b>${esc(c.name)}</b> · ${CATS[cat].n} +%${tdnF(k.b*100)}`,`${fmtDate(k.until)} tarihine kadar${k.cp?' · kopya':''}`)).join('')}</div>`));
  if(cr.length)parts.push((LANG_EN?`<div class="col" style="gap:4px"><b class="small">Rivals in crisis</b>${cr.map(c=>row(`<b>${esc(c.name)}</b> · ${esc(RVN_CR[c.crs.k].n)}${c.crs.lie?" · denial":''}`,`${c.crs.cats.map(x=>CATS[x].n).join(', ')} sales −${Math.round((1-c.crs.m)*100)}% · ${c.crs.until-G.day} days`)).join('')}</div>`:`<div class="col" style="gap:4px"><b class="small">Krizdeki rakipler</b>${cr.map(c=>row(`<b>${esc(c.name)}</b> · ${esc(RVN_CR[c.crs.k].n)}${c.crs.lie?' · inkâr':''}`,`${c.crs.cats.map(x=>CATS[x].n).join(', ')} satışları −%${Math.round((1-c.crs.m)*100)} · ${c.crs.until-G.day} gün`)).join('')}</div>`));
  if(bids.length)parts.push((LANG_EN?`<div class="col" style="gap:4px"><b class="small">Bids for alumni startups</b>${bids.map(s=>row(`<b>${esc(comp(s.bid.cid).name)}</b> → ${esc(s.name)}`,`${Math.max(0,s.bid.at-G.day)} days · <button class="linkb" data-act="tab" data-tab="team:mezun">Alumni</button>`)).join('')}</div>`:`<div class="col" style="gap:4px"><b class="small">Mezun girişimlerine teklifler</b>${bids.map(s=>row(`<b>${esc(comp(s.bid.cid).name)}</b> → ${esc(s.name)}`,`${Math.max(0,s.bid.at-G.day)} gün · <button class="linkb" data-act="tab" data-tab="team:mezun">Mezunlar</button>`)).join('')}</div>`));
  const log=N.log.slice(0,6).map(x=>`<li class="small"><span class="muted">${fmtDate(x.d)}</span> ${esc(x.t)}</li>`).join('');
  return (LANG_EN?`<section class="panel rvn"><div class="ph"><h2>Rival moves${helpBtn('rvn')}</h2><span class="sub">teardowns, crises, lobbying and alumni startups</span></div><div class="pb col" style="gap:10px">
    <p class="small muted" style="margin:0">Rivals also tear down products where you lead, go through crises, answer your lobbying and eye your alumni startups. You can sue over a copied product, run a campaign for the customers of a rival in crisis, and block a bid for an alumni startup by buying it or taking a stake.</p>
    ${parts.join('')||"<div class=\"small muted\">No rival moves under way right now.</div>"}
    ${log?`<div class="col" style="gap:2px"><b class="small">Recent moves</b><ul class="rvn-log">${log}</ul></div>`:''}</div></section>`:`<section class="panel rvn"><div class="ph"><h2>Rakiplerin hamleleri${helpBtn('rvn')}</h2><span class="sub">söküm, kriz, lobi ve mezun girişimleri</span></div><div class="pb col" style="gap:10px">
    <p class="small muted" style="margin:0">Rakipler de senin önde olduğun ürünleri söker, krizler yaşar, lobine karşılık verir ve mezun girişimlerine göz diker. Kopyalanan ürünün için dava açabilir, kriz yaşayan rakibin müşterilerine kampanya yapabilir, mezun girişimine gelen teklifi satın alarak ya da pay alarak engelleyebilirsin.</p>
    ${parts.join('')||'<div class="small muted">Şu an süren bir rakip hamlesi yok.</div>'}
    ${log?`<div class="col" style="gap:2px"><b class="small">Son hamleler</b><ul class="rvn-log">${log}</ul></div>`:''}</div></section>`);}

/* ---- öneriler (Durum ve Sıradaki hamle; bot ölçümünde zarar ettirmeyen kurallar) ---- */
/* mezun teklifini engellemek için gereken yatırım: payı %25'e çıkaran yatırım turlarının toplamı */
function rvnVetoCost(s){let st=s.stake,c=0,n=0;const u=spnInvCost(s);while(st<RVN_VETO-1e-9&&n++<6){st=Math.min(SPN_CAP,st+SPN_INV/(1+SPN_INV));c+=u;}return st>=RVN_VETO-1e-9?c:null;}
/* söküm önerisi: payının anlamlı olduğu (≥%10) ve rakibin belirgin önde olduğu (≥8 puan) kategori; temiz oda maliyeti nakdin %5'inden az.
   Robotik önerilmez: aynı koşu içindeki söküm muhasebesinde parasının yalnızca 0,6 katını geri getirdi (ortalama 4,9 kat). */
const TDN_NOADV=['robo'];
function rvnTdPick(){const T=G.tdn;if(T&&T.jobs.length>=TDN_MAX)return null;let best=null;
  for(const cat of [...new Set(myActive().map(p=>p.cat))]){if(TDN_NOADV.includes(cat)||T&&T.kn[cat]&&G.day<=T.kn[cat].until)continue;if(myActive(cat).reduce((a,p)=>a+p.share,0)<0.1)continue;const my=tdnMyV(cat);
    const rv=G.products.filter(p=>p.active&&p.owner!=='P'&&p.cat===cat&&!(T&&T.done[p.id]!=null)&&alive(p.owner)).sort((a,b)=>b.score-a.score)[0];if(!rv)continue;const gap=rv.score/S(cat)-my;if(gap<0.08)continue;
    const cost=tdnCost(rv,'clean');if(cost>G.cash*0.05||tdnBlock(rv,'clean'))continue;if(!best||gap>best.gap)best={cat,rv,gap,cost,b:tdnGain(gap,'clean'),n:myActive(cat).filter(q=>!q.tdnB).length};}
  return best;}
/* lobi önerisi: teklif seni etkiliyor, henüz taraf olmadın, sonuç belirsiz (%15–90) ve beklenen kazanç (olasılık değişimi × teklifin değeri)
   küçük lobinin LOB_EVK (2,5) katından fazla; lobi nakdin %5'inden az */
function rvnLobPick(){const B=G.lob&&G.lob.cur;if(!B||B.mySide)return null;const T=LOB_B[B.k],me=T.me(),a=lobAmt('s');if(!me||a>G.cash*0.05)return null;
  // oylamadaki durum: rakiplerin oylamaya kadar yapacağı lobi ve senin harcamana gelecek karşı lobi (en kötü durum: tavan) hesaba katılır
  const P0=lobProj(B),pr=lobProb(P0);if(pr<=0.15||pr>=0.9)return null;const cl=sgOff('rlob')?0:a*RVN_CL_CAP;
  const B2={...P0,for:P0.for+(me>0?a:cl),against:P0.against+(me<0?a:cl)},d=Math.abs(lobProb(B2)-pr),v=lobValue(B.k),ev=d*v;if(ev<a*LOB_EVK)return null;return {T,me,pr,a,d,v,ev,left:B.vote-G.day};}
function rvnAdvice(add){if(!G||G.day<365)return;
  if(G.spn)for(const s of G.spn.list){if(!s.bid||!spnLive(s))continue;const c=comp(s.bid.cid);if(!c)continue;const v=rvnVetoCost(s),days=Math.max(0,s.bid.at-G.day);
    add(days<=15?'bad':'warn',(LANG_EN?`${c.name} bid for your alumni startup ${s.name} (${days} days). ${v!=null&&s.stake<RVN_VETO?`Raising your stake to ${Math.round(RVN_VETO*100)}% (${money(v)}) blocks the bid`:"You can block the bid by buying it"}; if the rival buys it, its ${CATS[s.cat].n.toLocaleLowerCase(LOC)} products get stronger for 12 months.`:`${c.name}, mezun girişimin ${s.name} için teklif verdi (${days} gün). ${v!=null&&s.stake<RVN_VETO?`Payını %${Math.round(RVN_VETO*100)}'e çıkarmak (${money(v)}) teklifi engeller`:'Satın alarak teklifi engelleyebilirsin'}; rakip alırsa ${CATS[s.cat].n.toLocaleLowerCase(LOC)} ürünleri 12 ay güçlenir.`),'team:mezun');break;}
  {const N=G.rvn;const j=N&&N.td.find(x=>comp(x.cid));if(j)add('info',(LANG_EN?`${comp(j.cid).name} is tearing down ${j.pn} (${Math.max(0,j.end-G.day)} days). When it's done, its ${CATS[j.cat].n.toLocaleLowerCase(LOC)} products get stronger: consider a new version to stay ahead.`:`${comp(j.cid).name}, ${j.pn} ürününü söküyor (${Math.max(0,j.end-G.day)} gün). Bitince ${CATS[j.cat].n.toLocaleLowerCase(LOC)} ürünleri güçlenecek: yeni sürümle önde kalmayı düşün.`),'market:ceo');}
  {const L=rvnLobPick();if(L)add('info',(LANG_EN?`The "${L.T.n}" bill in parliament is ${L.me>0?"positive":"negative"} for you (~${money(L.v)} impact over 3 years) and the outcome is uncertain (chance of passing ${Math.round(L.pr*100)}%, ${L.left} days). A small lobbying effort (${money(L.a)}) ${L.me>0?"raises":"lowers"} the chance by ~${Math.max(1,Math.round(L.d*100))} points: expected gain ~${money(L.ev)}.`:`Meclisteki "${L.T.n}" teklifi senin için ${L.me>0?'olumlu':'olumsuz'} (3 yılda ~${money(L.v)} etkisi) ve sonuç belirsiz (geçme olasılığı %${Math.round(L.pr*100)}, ${L.left} gün). Küçük bir lobi (${money(L.a)}) olasılığı ~${Math.max(1,Math.round(L.d*100))} puan ${L.me>0?'artırır':'düşürür'}: beklenen kazanç ~${money(L.ev)}.`),'fin:devlet');}
  {const P=rvnTdPick();if(P)add('info',(LANG_EN?`${comp(P.rv.owner)?comp(P.rv.owner).name:"A rival"} is ${Math.round(P.gap*100)} points ahead of you in the ${CATS[P.cat].n.toLocaleLowerCase(LOC)} market. Tearing down ${P.rv.name} in a clean room (${money(P.cost)}) gives ${P.n?`your ${P.n} products on the market right away and `:''}your new versions for 18 months +${tdnF(P.b*100)}%.`:`${comp(P.rv.owner)?comp(P.rv.owner).name:'Bir rakip'} ${CATS[P.cat].n.toLocaleLowerCase(LOC)} pazarında senden ${Math.round(P.gap*100)} puan önde. ${P.rv.name} ürününü temiz odada sökmek (${money(P.cost)}) ${P.n?`piyasadaki ${P.n} ürününe hemen ve `:''}18 ay yeni sürümlerine +%${tdnF(P.b*100)} kazandırır.`),'res:sokum');}}

/* ---- seçeneklerin tahmini net etkisi (karar penceresinde; bot ölçümü bunu aynı koşu içinde kopya simülasyonla doğrular) ---- */
/* yan etkisiz pazar hesabı: ürünün aylık talebi, geçici bir değişiklik (puan, kampanya, ilgi) uygulanmış hâliyle; oyunun pazar formülü */
function mktUnitsWith(p,mut){const k={score:p.score,camp:p.camp,hype:p.hype};try{if(mut)mut(p);const ps=G.products.filter(q=>q.active&&q.cat===p.cat),i=ps.indexOf(p);if(i<0)return 0;
  const BP=ps.map(appealBaseP),SF=ps.map(q=>{const o={};for(const s of SEGS)o[s]=appealSegF(q,s);return o;}),dm=demand(p.cat);let u=0;
  for(const r of REG_ORDER){const RD=regDemand(p.cat,r,dm),bs=ps.map((q,j)=>appealBaseR(q,r,BP[j]));for(const sg of SEGS){let sum=0,a=0;for(let j=0;j<ps.length;j++){const x=appealSegR(ps[j],bs[j],sg,SF[j][sg]);sum+=x;if(j===i)a=x;}u+=RD*segW(p.cat,sg)*a/(sum+0.4);}}
  return u;}finally{p.score=k.score;p.camp=k.camp;p.hype=k.hype;}}
const unitMarg=p=>Math.max(0,isHW(p)?p.price-(p.unitCost||0):revPerUser(p)-(p.unitCost||0)*(HW.includes(p.cat)?pxMult(p.cat):1));
/* ek talebin satışa dönüşme oranı: donanımda stok/kapasite doluluğu, web servisi ve yapay zekâda sunucu kapasitesi */
const sellFill=p=>isHW(p)?((p.sr||0)+(p.lost||0)>0?(p.sr||0)/((p.sr||0)+(p.lost||0)):1):(p.cat==='saas'||p.cat==='ai')&&G.capFull&&G.capLoad?Math.min(1,capacity()/G.capLoad):1;
/* birden çok ürünü geçici değiştiren durum (ör. rakibe satış yasağı) altında senin ürünlerinin ek kârı */
function extraProfitAll(ps,apply,months){const base=ps.map(p=>mktUnitsWith(p,null)),undo=apply();let s=0;try{ps.forEach((p,i)=>{s+=(mktUnitsWith(p,null)-base[i])*unitMarg(p)*sellFill(p)*months;});}finally{undo();}return s;}
const extraProfit=(ps,mut,months)=>ps.reduce((a,p)=>a+(mktUnitsWith(p,mut)-mktUnitsWith(p,null))*unitMarg(p)*sellFill(p)*months,0);
const RVN_SUIT_MO=6;
/* 1 marka puanının yaklaşık bir yıllık değeri: bütün ürünlerin çekiciliği üzerinden (marka günde ~%0,12 sönerek 50'ye döner; bir yılda ortalama ~0,8 puan kalır) */
const RVN_BV={d:-1,g:null,v:0};
function rvnBrandVal(){if(RVN_BV.d===G.day&&RVN_BV.g===G)return RVN_BV.v;const v=extraProfitAll(myActive(),()=>{G.brand+=1;return ()=>{G.brand-=1;};},12*0.8);RVN_BV.d=G.day;RVN_BV.g=G;RVN_BV.v=v;return v;}
/* seçenek başına tahmini net etki (yaklaşık bir yıllık nakit; varsayılan seçenek 0) */
function rvnOptEst(id,d){
  if(id==='rvcrisis'){const ps=G.products.filter(p=>p.active&&p.owner==='P'&&d.cats.includes(p.cat)),hy=m=>q=>{q.hype={m:Math.max(m,q.hype&&q.hype.until>G.day?q.hype.m:1),until:G.day+60};};
    // sessiz kalmak marka +0,3 getirir (varsayılan seçenek, 0); kampanyada %25 ihtimalle marka −1
    const bv=rvnBrandVal();return [extraProfit(ps,hy(1.2),1)-rvnCampCost(d.cats)-(0.3+0.25)*bv,extraProfit(ps,hy(1.08),2)-rvnDiscCost(d.cats)-0.3*bv,0];}
  if(id==='rvcopy'){const c=comp(d.cid);if(!c)return null;const I=infl(),cap=Math.max(0,c.cash)*0.2,dmg=Math.max(Math.min(cap,catRev(c.id,d.cat)*2.25),Math.min(cap,5e5*I));
    // kazanılırsa rakibin o kategorideki ürünlerine 90 gün satış yasağı (çekicilik ×0,55): senin ürünlerine geçen pazar payı
    const mine=G.products.filter(p=>p.active&&p.owner==='P'&&p.cat===d.cat),inj=extraProfitAll(mine,()=>{const R=G.products.filter(q=>q.active&&q.owner===c.id&&q.cat===d.cat),s=R.map(q=>q.inj);for(const q of R)q.inj=G.day+90;return ()=>R.forEach((q,i)=>q.inj=s[i]);},3);
    // kazanınca marka +1, kaybedince −1
    const bv=rvnBrandVal(),suit=f=>{const p=rvnCaseP(d.cat,c,f),fee=LAW[f].cost*I;return p*(dmg+inj+bv)-(1-p)*(fee*3+bv)-fee*RVN_SUIT_MO;};
    return [suit('std'),suit('top'),rvnLicP(c)*rvnLic(d),0];}
  if(id==='suitIn'){const c=comp(d.cid);if(!c)return null;const I=infl(),bv=rvnBrandVal(),mine=G.products.filter(p=>p.active&&p.owner==='P'&&p.cat===d.cat);
    // kaybedersen: talebin tamamı, ürünlerine 60 gün satış kısıtlaması, marka −DEF_BRAND; kazanırsan masraf iadesi ve marka +1. Bütün seçenekler maliyetli (mutlak değer)
    const inj=extraProfitAll(mine,()=>{const s=mine.map(q=>q.inj);for(const q of mine)q.inj=G.day+60;return ()=>mine.forEach((q,i)=>{q.inj=s[i];});},2),back=LAW.std.cost*I*2;
    const def=f=>{const pL=defLose(d.cat,c,f),fee=LAW[f].cost*I*RVN_SUIT_MO;return -fee+pL*(-d.claim+inj-DEF_BRAND*bv)+(1-pL)*(back+bv);};
    return [-d.claim*0.5,def('std'),def('top'),(1-crossChance(d.cat,c))*def('std')];}
  return null;}
const rvnEstTxt=x=>(LANG_EN?` Estimated net effect (about 1 year): ${x>=0?'+':'−'}${money(Math.abs(x))}.`:` Tahmini net etki (yaklaşık 1 yıl): ${x>=0?'+':'−'}${money(Math.abs(x))}.`);
/* en iyi tahmin: varsayılana göre kazandıran en iyi seçenek; abs ile (bütün seçenekleri maliyetli kararlar) en az kaybettiren */
const rvnBestOpt=(est,abs)=>{let b=-1,bv=abs?-Infinity:0;(est||[]).forEach((x,i)=>{if(x!=null&&x>bv){bv=x;b=i;}});return b;};
const RVN_ABS=new Set(['suitIn']);
for(const E of [RVCOPY,RVCRISIS,EVD.suitIn]){const v0=E.view;E.view=d=>{const v=v0(d);try{const est=rvnOptEst(E.id,d),b=rvnBestOpt(est,RVN_ABS.has(E.id));if(est)v.o.forEach((o,i)=>{if(est[i]!=null)o.d=(o.d||'')+rvnEstTxt(est[i])+(i===b?(LANG_EN?" Best estimate.":' En iyi tahmin.'):'');});}catch(e){}return v;};}
