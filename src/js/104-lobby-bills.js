/* ============================== LOBBY & BILLS ============================== */
/* Lobi ve yasa teklifleri (Finans → Devlet ve regülasyon): 400. günden sonra 8–12 ayda bir meclise bir teklif gelir ve 120 gün sonra oylanır.
   Geçme olasılığı = taban + lobi dengesi. Rakipler çıkarlarına göre her ay lobi yapar (nakitleriyle orantılı). Sen destekleyip karşı çıkabilir
   (küçük/büyük lobi), kamuoyu kampanyası yapabilirsin (halkın sevdiği tarafta marka +, karşı tarafta −). Çok lobi harcaması oylamada
   skandal riski taşır (marka −2). Geçen yasa ya kalıcıdır (vergi) ya da 3 yıl sürer. Mevcut sistemlere bağlanır: vergi oranı, dijital hizmet
   vergisi ve ABD gümrüğü (REGL), araştırma maliyeti, Türkiye fabrikalarında işçilik, kategori çekiciliği ve aylık uyum maliyeti. */
const LOB_DAYS=120,LOB_DUR=3*365,LOB_K=4e6;
/* rakiplerin aylık lobisi: nakitlerinin binde 0,6'sı × (0,5 + saldırganlık). Binde 1,5 iken aynı koşu içindeki lobi muhasebesinde
   oyuncunun lobisi parasının ancak %29'unu geri getiriyordu: rakip havuzu oyuncunun harcamasını eritiyordu. */
const LOB_RV=0.0006;
/* öneri eşiği: beklenen kazanç ≥ 2,5 × harcama. Aynı koşu içindeki muhasebede tahmin gerçekleşenden ~1,7 kat iyimser çıktı (1,5 eşiğinde oran 0,83) */
const LOB_EVK=2.5;
const LOB_B={
  taxcut:{n:(LANG_EN?"Tax cut for tech companies":'Teknoloji şirketlerine vergi indirimi'),d:(LANG_EN?"Corporate tax drops 3 points (permanent).":'Kurumlar vergisi 3 puan düşer (kalıcı).'),p0:0.42,pop:-1,me:()=>1,rv:()=>1,apply(){G.gov.tax=clamp(G.gov.tax-0.03,0.1,0.3);}},
  taxup:{n:(LANG_EN?"Surtax on big tech companies":'Büyük teknoloji şirketlerine ek vergi'),d:(LANG_EN?"Corporate tax rises 3 points (permanent).":'Kurumlar vergisi 3 puan artar (kalıcı).'),p0:0.45,pop:1,me:()=>-1,rv:c=>compVal(c)>2e9*infl()?-1:0,apply(){G.gov.tax=clamp(G.gov.tax+0.03,0.1,0.3);}},
  dst:{n:(LANG_EN?"European digital services tax":'Avrupa dijital hizmet vergisi'),d:(LANG_EN?"3% of your software revenue in Europe is taken as tax every month (3 years).":"Avrupa'daki yazılım gelirinin %3'ü her ay vergi olarak kesilir (3 yıl)."),p0:0.5,pop:1,me:()=>G.regions.eu&&G.regions.eu.in&&myActive().some(p=>SW_CATS.includes(p.cat))?-1:0,rv:c=>c.focus.some(f=>SW_CATS.includes(f))?-1:0,ok:()=>!regOn('dst'),apply(){G.gov.regs.dst={until:G.day+LOB_DUR};}},
  tariff:{n:(LANG_EN?"US hardware tariff":'ABD donanım gümrüğü'),d:(LANG_EN?"A tariff of 10% of unit cost on hardware sold in North America; exempt if you have a factory in Mexico (3 years).":"Kuzey Amerika'da satılan donanıma birim maliyetin %10'u kadar gümrük; Meksika'da fabrikan varsa muafsın (3 yıl)."),p0:0.45,pop:0,me:()=>G.regions.na&&G.regions.na.in&&myActive().some(isHW)&&!G.factories.some(f=>f.region==='meksika')?-1:0,rv:c=>c.focus.some(f=>HW.includes(f))?-1:0,ok:()=>!regOn('tariff'),apply(){G.gov.regs.tariff={until:G.day+LOB_DUR};}},
  rnd:{n:(LANG_EN?"R&D tax credit":'Ar-Ge vergi kredisi'),d:(LANG_EN?"Research cost drops 20% (3 years).":'Araştırma maliyeti %20 düşer (3 yıl).'),p0:0.5,pop:1,me:()=>1,rv:()=>1,fx:1},
  local:{n:(LANG_EN?"Domestic production incentive":'Yerli üretim teşviki'),d:(LANG_EN?"Labor cost at factories in Türkiye drops 15% (3 years).":"Türkiye'deki fabrikalarda işçilik maliyeti %15 düşer (3 yıl)."),p0:0.5,pop:1,me:()=>G.factories.some(f=>f.region==='turkiye')?1:0,rv:c=>(c.reg||[]).includes('tr')&&c.focus.some(f=>HW.includes(f))?1:0,fx:1},
  privacy:{n:(LANG_EN?"Strict data privacy law":'Sıkı veri gizliliği yasası'),d:(LANG_EN?"Software products lose 4% appeal; companies with data policy trust of 70 or more gain 3% (3 years).":'Yazılım ürünlerinin çekiciliği %4 düşer; veri politikası güveni 70 ve üstü olan şirketlerde %3 artar (3 yıl).'),p0:0.5,pop:1,me:()=>!myActive().some(p=>SW_CATS.includes(p.cat))?0:G.dp&&G.dp.trust>=70?1:-1,rv:c=>c.focus.some(f=>SW_CATS.includes(f))?-1:0,fx:1},
  ai:{n:(LANG_EN?"AI regulation":'Yapay zekâ düzenlemesi'),d:(LANG_EN?"AI services lose 5% appeal; 1% of AI revenue becomes a monthly compliance cost (3 years).":"Yapay zekâ hizmetlerinin çekiciliği %5 düşer; yapay zekâ cirosunun %1'i her ay uyum maliyeti olur (3 yıl)."),p0:0.48,pop:1,me:()=>myActive('ai').length?-1:0,rv:c=>c.focus.includes('ai')?-1:0,fx:1}};
const newLob=()=>({cur:null,next:400,act:{},log:[],spent:0});
const lobOf=()=>G.lob||(G.lob=newLob());
const lobOn=k=>!!(G&&G.lob&&G.lob.act[k]&&G.lob.act[k]>G.day);
/* sistem kancaları */
const lobRes=()=>lobOn('rnd')?0.8:1;
const lobLab=f=>f&&f.region==='turkiye'&&lobOn('local')?0.85:1;
function lobAppeal(p){let m=1;if(SW_CATS.includes(p.cat)&&lobOn('privacy'))m*=p.owner==='P'&&G.dp&&G.dp.trust>=70?1.03:0.96;if(p.cat==='ai'&&lobOn('ai'))m*=0.95;return m;}
/* oylamaya kadar rakiplerin yapacağı lobinin tahmini (lobMonthly ile aynı formül, bugünkü nakitle) */
function lobProj(B){const T=LOB_B[B.k],mo=Math.max(0,Math.ceil((B.vote-G.day)/30));let f=B.for,a=B.against;
  for(const c of liveComps()){const s=T.rv(c);if(!s)continue;const x=Math.max(0,c.cash)*LOB_RV*(0.5+(c.aggr||0.5))*mo;if(s>0)f+=x;else a+=x;}return {...B,for:f,against:a};}
function lobProb(B){const s=B.for-B.against,tot=B.for+B.against+LOB_K*infl();return clamp(LOB_B[B.k].p0+0.6*s/tot,0.05,0.95);}
function lobStart(){const L=Object.keys(LOB_B).filter(k=>!lobOn(k)&&(!LOB_B[k].ok||LOB_B[k].ok())&&!(G.lob.log[0]&&G.lob.log[0].k===k));if(!L.length)return;const k=pick(L);
  G.lob.cur={k,d:G.day,vote:G.day+LOB_DAYS,for:0,against:0,mine:0,mySide:0,camp:0,rv:{}};
  news((LANG_EN?`A bill reached parliament: ${LOB_B[k].n}. The vote is in ${LOB_DAYS} days. You can lobby in Finance → Government and regulation.`:`Meclise yasa teklifi geldi: ${LOB_B[k].n}. Oylama ${LOB_DAYS} gün sonra. Finans → Devlet ve regülasyon bölümünden lobi yapabilirsin.`),'mkt',true);}
function lobMonthly(){if(sgOff('lob'))return;const Lb=lobOf();if(Lb.cur==null&&G.day>=Lb.next&&!(G.tut&&G.tut.on))lobStart();const B=Lb.cur;
  if(Lb.act.ai&&lobOn('ai')){const c=catRev('P','ai')*0.01*30/30;if(c>0)spend(c,'other');}
  if(!B)return;const T=LOB_B[B.k];
  // rakipler çıkarlarına göre lobi yapar
  for(const c of liveComps()){const s=T.rv(c);if(!s)continue;const amt=Math.max(0,c.cash)*LOB_RV*(0.5+(c.aggr||0.5));if(amt<=0)continue;c.cash-=amt;if(s>0)B.for+=amt;else B.against+=amt;B.rv[c.id]=(B.rv[c.id]||0)+s*amt;}
  rvnCounterLobby(B);
  if(G.day>=B.vote)lobVote();}
function lobVote(){const Lb=lobOf(),B=Lb.cur,T=LOB_B[B.k],pr=lobProb(B),pass=Math.random()<pr;Lb.cur=null;Lb.next=G.day+rint(240,360);
  if(pass){if(T.apply)T.apply();if(T.fx||T.apply&&B.k!=='taxcut'&&B.k!=='taxup')Lb.act[B.k]=G.day+LOB_DUR;}
  let sc=false;if(B.mine>0){const ch=0.3*Math.min(1,Math.pow(B.mine/lobScThr(),2))*(G.esg&&G.esg.s<40?1.5:1);if(Math.random()<ch){sc=true;G.brand=clamp(G.brand-2,0,100);}}
  const won=B.mySide?(B.mySide>0)===pass:null;
  Lb.log.unshift({k:B.k,d:G.day,pass,p:Math.round(pr*100),mine:B.mine,side:B.mySide,sc});if(Lb.log.length>8)Lb.log.pop();
  tl(pass?'law':'law',`${T.n}: ${pass?(LANG_EN?"passed":'kabul edildi'):'reddedildi'}`);
  news((LANG_EN?`Parliament vote: ${T.n} ${pass?"passed":'reddedildi'} (chance of passing ${Math.round(pr*100)}%).${won===true?" Your lobbying worked.":won===false?" Your lobbying fell short.":''}${sc?" The press exposed your lobbying spending: brand −2.":''}`:`Meclis oylaması: ${T.n} ${pass?'kabul edildi':'reddedildi'} (geçme olasılığı %${Math.round(pr*100)}).${won===true?' Lobin işe yaradı.':won===false?' Lobin yetmedi.':''}${sc?' Basın lobi harcamalarını ortaya çıkardı: marka −2.':''}`),won===false||sc?'bad':won?'good':'mkt',true);}
/* lobi tutarı şirketin büyüklüğüyle ölçeklenir: küçük = max(0,5 milyon, değerin %0,02'si), büyük = 4 katı */
const lobAmt=n=>Math.round(Math.max(0.5e6*infl(),valuation()*0.0002)*(n==='l'?4:1));
const lobScThr=()=>Math.max(25e6*infl(),valuation()*0.002);
/* teklifin senin için yaklaşık değeri: 3 yıllık etki (mutlak; yönü LOB_B[k].me verir). Öneri ve bot bunu kullanır:
   lobi ancak olasılık değişimi × değer, harcamanın 2,5 katını geçiyorsa önerilir (bot ölçümünde değere bakmayan lobi zarar ettiriyordu). */
function lobValue(k){const m=monthlyEst(),swR=SW_CATS.reduce((a,c)=>a+catRev('P',c),0),hwR=HW.reduce((a,c)=>a+catRev('P',c),0),tot=Math.max(1,swR+hwR),M=36;
  switch(k){case 'taxcut':case 'taxup':return 0.03*Math.max(0,m.profit)*M;
    case 'dst':return 0.03*lastRegRev('eu')*(swR/tot)*M;
    case 'tariff':return 0.1*0.5*lastRegRev('na')*(hwR/tot)*M;
    case 'rnd':return 0.2*G.emps.filter(e=>e.role==='res').reduce((a,e)=>a+e.salary,0)*M;
    case 'local':return G.factories.some(f=>f.region==='turkiye')?0.15*0.1*hwR*M:0;
    case 'privacy':return 0.04*0.5*swR*M;
    case 'ai':return 0.035*catRev('P','ai')*M;}
  return 0;}
function lobAct(a,ds){const Lb=lobOf(),B=Lb.cur;if(!B)return;const T=LOB_B[B.k];
  if(a==='lobpay'){const side=ds.k==='for'?1:-1,amt=lobAmt(ds.n==='l'?'l':'s');if(G.cash<amt){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');return;}
    if(B.mySide&&B.mySide!==side){showToast((LANG_EN?"You already back the other side of this bill.":'Bu teklifte zaten diğer tarafı destekliyorsun.'),'bad');return;}
    spend(amt,'other');B.mine+=amt;B.mySide=side;Lb.spent+=amt;if(side>0)B.for+=amt;else B.against+=amt;return;}
  if(a==='lobcamp'){const side=ds.k==='for'?1:-1;if(B.mySide&&B.mySide!==side){showToast((LANG_EN?"You already back the other side of this bill.":'Bu teklifte zaten diğer tarafı destekliyorsun.'),'bad');return;}if(B.camp){showToast((LANG_EN?"You already ran a public campaign for this bill.":'Bu teklif için zaten kamuoyu kampanyası yaptın.'),'bad');return;}
    const amt=lobAmt('s')*2;if(G.cash<amt){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');return;}spend(amt,'other');B.camp=side;B.mySide=side;
    const pw=amt*(T.pop===side?2.5:T.pop===-side?0.6:1.5);if(side>0)B.for+=pw;else B.against+=pw;const db=T.pop===side?1:T.pop===-side?-1:0;G.brand=clamp(G.brand+db,0,100);
    news((LANG_EN?`Public campaign started for ${T.n} (${side>0?'destek':"against"}).${db?` Brand ${db>0?'+':'−'}1.`:''}`:`${T.n} için kamuoyu kampanyası başladı (${side>0?'destek':'karşı'}).${db?` Marka ${db>0?'+':'−'}1.`:''}`),'');}}
/* ---- görünüm ---- */
function vLobby(){const Lb=lobOf(),B=Lb.cur;const actL=Object.keys(Lb.act).filter(k=>lobOn(k));
  let cur='';if(B){const T=LOB_B[B.k],me=T.me(),pr=lobProb(B),I=infl();
    const rvs=Object.entries(B.rv).filter(([id])=>comp(id)).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,5).map(([id,v])=>`<span class="chip ${v>0?'st-ok':'st-bad'}">${esc(comp(id).name)} ${v>0?'destekliyor':(LANG_EN?"against":'karşı')}</span>`).join('');
    const side=B.mySide,bt=(k,n)=>`<button class="btn sm${k==='for'?'':' ghost'}" data-act="lobpay" data-k="${k}" data-n="${n}" ${side&&side!==(k==='for'?1:-1)?'disabled':''}>${k==='for'?(LANG_EN?"Support":'Destekle'):(LANG_EN?"Oppose":'Karşı çık')} · ${money(lobAmt(n))}</button>`;
    cur=(LANG_EN?`<div class="lob-c"><div class="row between" style="gap:6px;flex-wrap:wrap"><b>${esc(T.n)}</b><span class="chip ${me>0?'st-ok':me<0?'st-bad':'st-mute'}">For you: ${me>0?"positive":me<0?"negative":"neutral"}</span></div>
      <div class="small">${esc(T.d)}</div><div class="small muted">Public: ${T.pop>0?'destekliyor':T.pop<0?"against":"undecided"} · vote in ${B.vote-G.day} days · lobbying: for ${money(B.for)}, against ${money(B.against)}${B.mine?` · your spending ${money(B.mine)}`:''}</div>
      <div class="row between small"><span>Chance of passing</span><b class="num">${Math.round(pr*100)}%</b></div><div class="bar"><i style="width:${Math.round(pr*100)}%"></i></div>
      ${rvs?`<div class="row" style="gap:6px;flex-wrap:wrap">${rvs}</div>`:''}
      <div class="row" style="gap:6px;flex-wrap:wrap">${bt('for','s')}${bt('for','l')}${bt('against','s')}${bt('against','l')}</div>
      <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ghost" data-act="lobcamp" data-k="for" ${B.camp||(side&&side<0)?'disabled':''}>Public campaign: for · ${money(lobAmt('s')*2)}</button><button class="btn sm ghost" data-act="lobcamp" data-k="against" ${B.camp||(side&&side>0)?'disabled':''}>Public campaign: against · ${money(lobAmt('s')*2)}</button></div>
      <div class="small muted">A public campaign works better on the side the public supports and raises your brand; against the public, your brand drops. Heavy lobbying may turn into a scandal at the vote.</div></div>`:`<div class="lob-c"><div class="row between" style="gap:6px;flex-wrap:wrap"><b>${esc(T.n)}</b><span class="chip ${me>0?'st-ok':me<0?'st-bad':'st-mute'}">Senin için ${me>0?'olumlu':me<0?'olumsuz':'nötr'}</span></div>
      <div class="small">${esc(T.d)}</div><div class="small muted">Halk ${T.pop>0?'destekliyor':T.pop<0?'karşı':'kararsız'} · oylama ${B.vote-G.day} gün sonra · lobi: destek ${money(B.for)}, karşı ${money(B.against)}${B.mine?` · senin harcaman ${money(B.mine)}`:''}</div>
      <div class="row between small"><span>Geçme olasılığı</span><b class="num">%${Math.round(pr*100)}</b></div><div class="bar"><i style="width:${Math.round(pr*100)}%"></i></div>
      ${rvs?`<div class="row" style="gap:6px;flex-wrap:wrap">${rvs}</div>`:''}
      <div class="row" style="gap:6px;flex-wrap:wrap">${bt('for','s')}${bt('for','l')}${bt('against','s')}${bt('against','l')}</div>
      <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ghost" data-act="lobcamp" data-k="for" ${B.camp||(side&&side<0)?'disabled':''}>Kamuoyu kampanyası: destek · ${money(lobAmt('s')*2)}</button><button class="btn sm ghost" data-act="lobcamp" data-k="against" ${B.camp||(side&&side>0)?'disabled':''}>Kamuoyu kampanyası: karşı · ${money(lobAmt('s')*2)}</button></div>
      <div class="small muted">Kamuoyu kampanyası halkın desteklediği tarafta daha etkilidir ve markayı artırır; halka karşı yapılırsa markan düşer. Çok lobi harcaması oylamada skandala dönüşebilir.</div></div>`);}
  else cur=(LANG_EN?`<div class="small muted">No bill relevant to you in parliament right now.${G.day<Lb.next?` Next bill in about ${Math.max(1,Math.round((Lb.next-G.day)/30))} months.`:''}</div>`:`<div class="small muted">Şu an mecliste seni ilgilendiren bir teklif yok.${G.day<Lb.next?` Sıradaki teklif yaklaşık ${Math.max(1,Math.round((Lb.next-G.day)/30))} ay sonra.`:''}</div>`);
  const act=actL.length?(LANG_EN?`<div class="col" style="gap:4px"><b class="small">Laws in force</b>${actL.map(k=>`<div class="small">${esc(LOB_B[k].n)} · until ${fmtDate(Lb.act[k])}</div>`).join('')}</div>`:`<div class="col" style="gap:4px"><b class="small">Yürürlükteki yasalar</b>${actL.map(k=>`<div class="small">${esc(LOB_B[k].n)} · ${fmtDate(Lb.act[k])} tarihine kadar</div>`).join('')}</div>`):'';
  const log=Lb.log.length?(LANG_EN?`<div class="col" style="gap:3px"><b class="small">Past votes</b>${Lb.log.map(x=>`<div class="small"><span class="muted num">${fmtDate(x.d)}</span> ${esc(LOB_B[x.k].n)}: <b class="${x.pass?'pos':'neg'}">${x.pass?'kabul':'ret'}</b> (${x.p}%)${x.mine?` · your lobbying ${money(x.mine)} (${x.side>0?'destek':"against"})`:''}${x.sc?" · scandal":''}</div>`).join('')}</div>`:`<div class="col" style="gap:3px"><b class="small">Geçmiş oylamalar</b>${Lb.log.map(x=>`<div class="small"><span class="muted num">${fmtDate(x.d)}</span> ${esc(LOB_B[x.k].n)}: <b class="${x.pass?'pos':'neg'}">${x.pass?'kabul':'ret'}</b> (%${x.p})${x.mine?` · lobin ${money(x.mine)} (${x.side>0?'destek':'karşı'})`:''}${x.sc?' · skandal':''}</div>`).join('')}</div>`):'';
  return (LANG_EN?`<section class="panel lob"><div class="ph"><h2>Lobbying and bills${helpBtn('lobby')}</h2><span class="sub">${Lb.spent?`your total lobbying spend ${money(Lb.spent)}`:"bills in parliament"}</span></div><div class="pb col" style="gap:12px">${cur}${act}${log}</div></section>`:`<section class="panel lob"><div class="ph"><h2>Lobi ve yasa teklifleri${helpBtn('lobby')}</h2><span class="sub">${Lb.spent?`toplam lobi harcaman ${money(Lb.spent)}`:'meclisteki teklifler'}</span></div><div class="pb col" style="gap:12px">${cur}${act}${log}</div></section>`);}
