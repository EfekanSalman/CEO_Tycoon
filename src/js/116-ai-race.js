/* ============================== AI RACE ============================== */
const newLab=()=>({nodes:0,rent:0,data:0,ds:0,safe:0.1,run:null,models:[],best:null,api:false,board:[],apiRev:0,n:0,hist:[]});
const LAB_SC={s:{n:(LANG_EN?"Small":'Küçük'),days:30},m:{n:(LANG_EN?"Medium":'Orta'),days:60},l:{n:(LANG_EN?"Large":'Büyük'),days:90},f:{n:(LANG_EN?"Frontier":'Öncü'),days:150}};
const LAB_SAFE=[0,0.1,0.2];
const labFrontier=()=>49+7.2*years();
const labOwnChip=()=>has('ai')&&G.products.some(p=>p.owner==='P'&&p.cat==='cpu'&&p.active);
const labNodePF=()=>Math.pow(1.4,years())*(labOwnChip()?1.5:1);
const labNodePx=()=>300000*infl()*(labOwnChip()?0.7:1);
const labNodeUp=()=>6000*infl()*energyMult()*((G.dcs||[]).some(d=>G.day>=d.ready)?0.7:1);
const labRentPx=()=>15000*infl();
const labNodes=()=>G.lab?G.lab.nodes+G.lab.rent:0;
const labDayPF=()=>labNodes()*labNodePF()*(1-(G.lab?G.lab.safe:0));
function labDataScore(){const users=myActive().filter(p=>!HW.includes(p.cat)).reduce((a,p)=>a+(p.units||0),0)+(G.ibase||0)/5+(G.base||0)/10;return clamp(Math.round(15*Math.log10(1+users*dpData()/1000)+(G.lab?G.lab.ds:0)*10),0,100);}
const labTalent=()=>Math.min(12,G.emps.filter(e=>e.role==='res'&&!e.leave).reduce((a,e)=>a+e.skill,0)/8);
function labEst(pfd){return 12*Math.log10(Math.max(1,pfd))+labDataScore()*0.15+labTalent()+(has('llm')?8:0)+(has('ml')?3:0);}
const labScPfd=k=>labDayPF()*LAB_SC[k].days;
function labAppeal(){const B=G.lab&&G.lab.best;if(!B)return 0.95;return clamp(1+(B.c-labFrontier())/60,0.95,1.35);}
function labApiMkt(){return years()<3?0:3e5*infl()*Math.pow(1.8,years()-3+1)*0.55;}
function labShare(){const L=G.lab,B=L&&L.best;if(!B||!L.api)return 0;const F=labFrontier();const w=m=>Math.exp((m.c-F)/6)*(m.open?0.5:1);
  const riv=L.board.filter(m=>m.o!=='P');const byLab={};for(const m of riv)if(!byLab[m.o]||byLab[m.o].c<m.c)byLab[m.o]=m;
  const tot=Object.values(byLab).reduce((a,m)=>a+w(m),0)+w(B)+1;return w(B)/tot;}
function labRank(){const L=G.lab;if(!L||!L.best)return null;const top=L.board.slice().sort((a,b)=>b.c-a.c);return top.findIndex(m=>m===L.best||m.id===L.best.id)+1;}
function labDaily(){const L=G.lab;if(!L||!L.run)return;const R=L.run;R.done+=labDayPF();spend(labNodes()*300*infl()/30,'infra');
  if(R.done>=R.target)labFinish();}
function labFinish(){const L=G.lab,R=L.run;L.run=null;L.n++;const F=labFrontier();
  const c=Math.round((labEst(R.done)+rnd(-3,3))*10)/10,name=`${G.name.split(' ')[0]}-${L.n}${R.k==='f'?(LANG_EN?" Ultra":' Ultra'):R.k==='l'?(LANG_EN?" Pro":' Pro'):''}`;
  const m={id:nid(),n:name,o:'P',c,d:G.day,k:R.k,open:false};L.models.unshift(m);if(L.models.length>10)L.models.pop();
  if(!L.best||c>L.best.c){L.best=m;}L.board.push(m);L.board.sort((a,b)=>b.c-a.c);L.board=L.board.slice(0,14);
  const rk=labRank();news((LANG_EN?`${name} model trained: capability score ${fx(c,1)} (frontier level ${fx(F,0)}). ${rk===1?"The world's most capable model!":rk?`Ranked #${rk}.`:''}`:`${name} modeli eğitildi: yetenek puanı ${fx(c,1)} (öncü seviye ${fx(F,0)}). ${rk===1?'Dünyanın en yetenekli modeli!':rk?`Sıralamada ${rk}.`:''}`),c>=F?'good':'',true);
  tl(c>=F?'star':'prod',(LANG_EN?`${name}: capability ${fx(c,0)}${rk===1?" · world #1":''}`:`${name}: yetenek ${fx(c,0)}${rk===1?' · dünya birincisi':''}`));if(rk===1){G.brand=clamp(G.brand+3,0,100);(G.flags=G.flags||{}).frontier=true;}
  if(c>=F-3){const pIn=[0.2,0.07,0.02][LAB_SAFE.indexOf(L.safe)]||0.2;
    if(Math.random()<pIn){if(myActive('ai').some(p=>p.units>10000)&&!G.pending&&typeof prStart==='function')prStart('ai',{heat:15});else{G.brand=clamp(G.brand-3,0,100);news((LANG_EN?`${name} showed unforeseen dangerous behavior during testing; the backlash grew when the news leaked.`:`${name} test sırasında öngörülmeyen tehlikeli davranışlar gösterdi; haber sızınca tepki büyüdü.`),'bad',true);}}
    if(G.day>=365*8&&L.safe<0.1){const f=Math.max(250000*infl(),monthlyEst().rev*0.5);spend(f,'other');news((LANG_EN?`AI Act: a frontier model was trained without a safety evaluation. ${money(f)} administrative fine.`:`Yapay zekâ yasası: öncü model güvenlik değerlendirmesi olmadan eğitildi. ${money(f)} idari para cezası.`),'bad',true);}}
}
function labMonthly(){
  const L=G.lab;if(!L)return;
  if(L.nodes)spend(L.nodes*labNodeUp(),'infra');if(L.rent)spend(L.rent*labRentPx(),'infra');
  const F=labFrontier();
  for(const c of liveComps()){if(!(c.focus.includes('ai')||c.emp>800))continue;if(Math.random()>0.07*(c.focus.includes('ai')?1.5:0.7))continue;
    c.labN=(c.labN||0)+1;const cap=Math.round((F+rnd(-10,2)+(c.tech-1)*15)*10)/10;const m={id:nid(),n:`${c.pfx}-${c.labN}`,o:c.id,c:cap,d:G.day};L.board.push(m);
    if(cap>(L.best?L.best.c:0)&&cap>=F-1&&(c.emp>300||c.focus.includes('ai')))news((LANG_EN?`${c.name} unveiled its new model: ${m.n} (capability ${fx(cap,0)}).`:`${c.name} yeni modelini tanıttı: ${m.n} (yetenek ${fx(cap,0)}).`),'mkt',true);}
  L.board.sort((a,b)=>b.c-a.c);L.board=L.board.filter((m,i)=>i<14||m===L.best);
  const sh=labShare(),rev=labApiMkt()*sh;L.apiRev=rev;if(rev>0){const net=rev*0.65;G.cash+=net;G.month.rev+=rev;G.month.infra+=rev*0.35;}
  if(labRank()===1)G.brand=clamp(G.brand+0.3,0,100);
  L.hist.push({d:G.day,f:Math.round(F*10)/10,b:L.best?L.best.c:null});if(L.hist.length>180)L.hist.shift();
}
function vLab(){
  const L=G.lab;if(!has('ml'))return (LANG_EN?`<section class="panel"><div class="ph"><h2>AI lab${helpBtn('ailab')}</h2></div><div class="pb small muted">To train your own AI models, first complete the <b>Machine Learning</b> research.</div></section>`:`<section class="panel"><div class="ph"><h2>Yapay zekâ laboratuvarı${helpBtn('ailab')}</h2></div><div class="pb small muted">Kendi yapay zekâ modellerini eğitmek için önce <b>Makine Öğrenmesi</b> araştırmasını tamamla.</div></section>`);
  const F=labFrontier(),B=L.best,rk=labRank(),ds=labDataScore(),np=labNodePx(),dayPF=labDayPF();
  const sc=Object.entries(LAB_SC).map(([k,S2])=>{const pfd=labScPfd(k),est=labEst(pfd),cost=labNodes()*300*infl()*S2.days/30;
    return (LANG_EN?`<div class="proj col" style="gap:6px"><div class="row between"><b>${S2.n} training</b><span class="small muted">~${S2.days} days</span></div>
      <div class="kv small"><span>Compute</span><b>${num(pfd)} PF-days</b><span>Est. capability</span><b class="${est>=F?'pos':''}">${fx(est-3,0)}–${fx(est+3,0)}</b><span>Extra energy</span><b>${money(cost)}</b></div>
      <button class="btn sm ${k==='f'?'primary':''}" data-act="labtrain" data-k="${k}" ${L.run||!labNodes()||G.cash<cost?'disabled':''}>${L.run?"Training in progress":!labNodes()?"No compute":"Start training"}</button></div>`:`<div class="proj col" style="gap:6px"><div class="row between"><b>${S2.n} eğitim</b><span class="small muted">~${S2.days} gün</span></div>
      <div class="kv small"><span>İşlem</span><b>${num(pfd)} PF-gün</b><span>Tahmini yetenek</span><b class="${est>=F?'pos':''}">${fx(est-3,0)}–${fx(est+3,0)}</b><span>Ek enerji</span><b>${money(cost)}</b></div>
      <button class="btn sm ${k==='f'?'primary':''}" data-act="labtrain" data-k="${k}" ${L.run||!labNodes()||G.cash<cost?'disabled':''}>${L.run?'Eğitim sürüyor':!labNodes()?'İşlem gücü yok':'Eğitimi başlat'}</button></div>`);}).join('');
  const cntL={},shown=L.board.filter(m=>{cntL[m.o]=(cntL[m.o]||0)+1;return cntL[m.o]<=2;}).slice(0,10);
  const board=shown.map((m,i)=>`<tr${m.o==='P'?(LANG_EN?" style=\"background:var(--soft)\"":' style="background:var(--soft)"'):''}><td class="num">${i+1}</td><td><b>${esc(m.n)}</b>${m.open?(LANG_EN?" <span class=\"chip st-ok\">open weights</span>":' <span class="chip st-ok">açık ağırlık</span>'):''}</td><td>${m.o==='P'?(LANG_EN?"<b>You</b>":'<b>Sen</b>'):esc((comp(m.o)||{name:'?'}).name)}</td><td class="r num ${m.c>=F?'pos':''}">${fx(m.c,1)}</td><td class="num small muted">${fmtDate(m.d)}</td></tr>`).join('');
  const i0=L.hist.findIndex(x=>x.b!=null),hh=i0<0?[]:L.hist.slice(Math.max(0,i0-1)).map(x=>({...x,b:x.b==null?L.hist[i0].b:x.b}));
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>AI lab${helpBtn('ailab')}</h2><span class="sub">Frontier level ${fx(F,0)}</span></div>
    <div class="kpis"><div class="kpi"><span>Your best model</span><b class="${B&&B.c>=F?'pos':''}">${B?esc(B.n)+' · '+fx(B.c,0):'—'}</b></div><div class="kpi"><span>Rank</span><b>${rk?rk+'.':'—'}</b></div>
      <div class="kpi"><span>Effect on AI products</span><b class="${labAppeal()>1?'pos':labAppeal()<1?'neg':''}">${labAppeal()>=1?'+':'−'}${pct(Math.abs(labAppeal()-1),0)}</b></div><div class="kpi"><span>API revenue</span><b class="${L.apiRev?'pos':''}">${money(L.apiRev)}/mo</b></div></div>
    <div class="pb small muted">Model capability depends on the compute used in training (logarithmic), your data, your researchers and large language model research. Rival labs also release stronger models every year; the frontier level rises about 7 points a year. Your own model strengthens your AI products, earns revenue via API and grows your brand if you're #1.</div></section>
  ${L.run?`<section class="panel"><div class="ph"><h2>Training in progress · ${LAB_SC[L.run.k].n}</h2><span class="sub">${pct(Math.min(1,L.run.done/L.run.target),0)} · ~${dayPF?Math.ceil((L.run.target-L.run.done)/dayPF):'∞'} days left</span></div><div class="pb"><div class="bar"><i style="width:${Math.min(100,L.run.done/L.run.target*100)}%;background:var(--accent)"></i></div></div></section>`:''}
  <div class="grid"><section class="panel"><div class="ph"><h2>Compute</h2><span class="sub">${labNodes()} nodes · ${num(dayPF)} PF/day</span></div><div class="pb col" style="gap:8px">
    <div class="kv small"><span>Owned</span><b>${L.nodes} nodes · upkeep ${money(L.nodes*labNodeUp())}/mo</b><span>Rented</span><b>${L.rent} nodes · ${money(L.rent*labRentPx())}/mo</b><span>Power per node</span><b>${fx(labNodePF(),1)} PF${labOwnChip()?" · your own chip ×1.5":''}</b><span>Allocated to safety research</span><b>${Math.round(L.safe*100)}%</b></div>
    <div class="row" style="gap:4px;flex-wrap:wrap"><button class="btn sm primary" data-act="labbuy" data-n="10" ${G.cash<np*10?'disabled':''}>Buy 10 nodes · ${money(np*10)}</button><button class="btn sm" data-act="labbuy" data-n="50" ${G.cash<np*50?'disabled':''}>50 nodes · ${money(np*50)}</button><button class="btn sm" data-act="labrent" data-n="10">Rent 10 · ${money(labRentPx()*10)}/mo</button><button class="btn sm ghost" data-act="labrent" data-n="-10" ${L.rent<10?'disabled':''}>Rent fewer</button><button class="btn sm ghost" data-act="labsell" ${L.nodes<10||L.run?'disabled':''}>Sell 10 nodes</button></div>
    <div class="row small" style="gap:4px;flex-wrap:wrap;align-items:center"><span>Safety research:</span>${LAB_SAFE.map(v=>`<button class="btn sm ${L.safe===v?'primary':'ghost'}" data-act="labsafe" data-v="${v}">${v*100}%</button>`).join('')}</div>
    <p class="small muted">If your own AI accelerator chip is on the market, nodes are 30% cheaper and 50% more powerful; with your own data center, upkeep is 30% cheaper. Safety research slows training but lowers the risk of accidents and fines for frontier models (from 2023 the law requires at least 10%).</p></div></section>
  <section class="panel"><div class="ph"><h2>Data</h2><span class="sub">Score ${ds}/100</span></div><div class="pb col" style="gap:8px">
    <div class="bar"><i style="width:${ds}%;background:var(--ok)"></i></div>
    <p class="small muted">Your software products' users and your smart home and operating system installed base generate data. You can buy extra data with dataset licenses (up to 3).</p>
    <div><button class="btn sm" data-act="labds" ${L.ds>=3||G.cash<2e6*infl()?'disabled':''}>License a dataset · ${money(2e6*infl())} (${L.ds}/3)</button></div></div></section></div>
  <section class="panel"><div class="ph"><h2>Train a model</h2></div><div class="pb"><div class="grid3" style="grid-template-columns:repeat(auto-fill,minmax(min(200px,100%),1fr))">${sc}</div></div></section>
  ${B?`<section class="panel"><div class="ph"><h2>Use your model</h2></div><div class="pb"><div class="grid3">
    <div class="proj col" style="gap:6px"><b>API sales</b><div class="small muted">Sell your model to developers via API. Your market share depends on your model's capability relative to rivals; inference costs 35% of revenue.</div>
      <div class="small">Market ${money(labApiMkt())}/mo · your share ${Math.round(labShare()*100)}%</div><button class="btn sm ${L.api?'ghost':'primary'}" data-act="labapi">${L.api?"Close API":"Open API"}</button></div>
    <div class="proj col" style="gap:6px"><b>Open-weight release</b><div class="small muted">Open your best model to everyone: your developer community grows, brand +2; but your API share is halved and rivals learn from it.</div>
      <button class="btn sm" data-act="labopen" ${B.open?'disabled':''}>${B.open?"Open weights":"Release weights"}</button></div>
  </div></div></section>`:''}
  <section class="panel"><div class="ph"><h2>Frontier models</h2></div>${board?`<div class="tw"><table><thead><tr><th>#</th><th>Model</th><th>Lab</th><th class="r">Capability</th><th>Date</th></tr></thead><tbody>${board}</tbody></table></div>`:"<div class=\"pb small muted\">No models released yet.</div>"}</section>
  ${hh.length>=2?`<section class="panel"><div class="ph"><h2>The race</h2></div><div class="pb">${lineChart('labrace',hh.map(x=>fmtMonth(x.d)),[{n:"Frontier level",c:'var(--muted)',v:hh.map(x=>x.f)},{n:"Your best model",c:'var(--accent)',v:hh.map(x=>x.b)}],{label:"AI race",h:170,fmt:v=>fx(v,0)})}</div></section>`:''}`:`<section class="panel"><div class="ph"><h2>Yapay zekâ laboratuvarı${helpBtn('ailab')}</h2><span class="sub">Öncü seviye ${fx(F,0)}</span></div>
    <div class="kpis"><div class="kpi"><span>En iyi modelin</span><b class="${B&&B.c>=F?'pos':''}">${B?esc(B.n)+' · '+fx(B.c,0):'—'}</b></div><div class="kpi"><span>Sıralama</span><b>${rk?rk+'.':'—'}</b></div>
      <div class="kpi"><span>Yapay zekâ ürünlerine etkisi</span><b class="${labAppeal()>1?'pos':labAppeal()<1?'neg':''}">${labAppeal()>=1?'+':'−'}${pct(Math.abs(labAppeal()-1),0)}</b></div><div class="kpi"><span>API geliri</span><b class="${L.apiRev?'pos':''}">${money(L.apiRev)}/ay</b></div></div>
    <div class="pb small muted">Model yeteneği eğitimde kullanılan işlem gücüne (logaritmik), verine, araştırmacılarına ve büyük dil modelleri araştırmasına bağlıdır. Rakip laboratuvarlar da her yıl daha güçlü modeller çıkarır; öncü seviye yılda yaklaşık 7 puan yükselir. Kendi modelin yapay zekâ ürünlerini güçlendirir, API ile gelir getirir ve birinci olursan markanı büyütür.</div></section>
  ${L.run?`<section class="panel"><div class="ph"><h2>Süren eğitim · ${LAB_SC[L.run.k].n}</h2><span class="sub">${pct(Math.min(1,L.run.done/L.run.target),0)} · kalan ~${dayPF?Math.ceil((L.run.target-L.run.done)/dayPF):'∞'} gün</span></div><div class="pb"><div class="bar"><i style="width:${Math.min(100,L.run.done/L.run.target*100)}%;background:var(--accent)"></i></div></div></section>`:''}
  <div class="grid"><section class="panel"><div class="ph"><h2>İşlem gücü</h2><span class="sub">${labNodes()} düğüm · ${num(dayPF)} PF/gün</span></div><div class="pb col" style="gap:8px">
    <div class="kv small"><span>Sahip olunan</span><b>${L.nodes} düğüm · bakım ${money(L.nodes*labNodeUp())}/ay</b><span>Kiralanan</span><b>${L.rent} düğüm · ${money(L.rent*labRentPx())}/ay</b><span>Düğüm başı güç</span><b>${fx(labNodePF(),1)} PF${labOwnChip()?' · kendi çipin ×1,5':''}</b><span>Güvenlik araştırmasına ayrılan</span><b>%${Math.round(L.safe*100)}</b></div>
    <div class="row" style="gap:4px;flex-wrap:wrap"><button class="btn sm primary" data-act="labbuy" data-n="10" ${G.cash<np*10?'disabled':''}>10 düğüm al · ${money(np*10)}</button><button class="btn sm" data-act="labbuy" data-n="50" ${G.cash<np*50?'disabled':''}>50 düğüm · ${money(np*50)}</button><button class="btn sm" data-act="labrent" data-n="10">10 kirala · ${money(labRentPx()*10)}/ay</button><button class="btn sm ghost" data-act="labrent" data-n="-10" ${L.rent<10?'disabled':''}>Kiralamayı azalt</button><button class="btn sm ghost" data-act="labsell" ${L.nodes<10||L.run?'disabled':''}>10 düğüm sat</button></div>
    <div class="row small" style="gap:4px;flex-wrap:wrap;align-items:center"><span>Güvenlik araştırması:</span>${LAB_SAFE.map(v=>`<button class="btn sm ${L.safe===v?'primary':'ghost'}" data-act="labsafe" data-v="${v}">%${v*100}</button>`).join('')}</div>
    <p class="small muted">Kendi yapay zekâ hızlandırıcı çipin piyasadaysa düğümler %30 ucuz ve %50 güçlü; veri merkezin varsa bakım %30 ucuz. Güvenlik araştırması eğitimi yavaşlatır ama öncü modellerde kaza ve ceza riskini düşürür (2023'ten sonra yasa en az %10 ister).</p></div></section>
  <section class="panel"><div class="ph"><h2>Veri</h2><span class="sub">Puan ${ds}/100</span></div><div class="pb col" style="gap:8px">
    <div class="bar"><i style="width:${ds}%;background:var(--ok)"></i></div>
    <p class="small muted">Yazılım ürünlerinin kullanıcıları, akıllı ev ve işletim sistemi kurulu tabanın veri üretir. Veri seti lisansı ile ek veri satın alabilirsin (en fazla 3).</p>
    <div><button class="btn sm" data-act="labds" ${L.ds>=3||G.cash<2e6*infl()?'disabled':''}>Veri seti lisansla · ${money(2e6*infl())} (${L.ds}/3)</button></div></div></section></div>
  <section class="panel"><div class="ph"><h2>Model eğit</h2></div><div class="pb"><div class="grid3" style="grid-template-columns:repeat(auto-fill,minmax(min(200px,100%),1fr))">${sc}</div></div></section>
  ${B?`<section class="panel"><div class="ph"><h2>Modelini kullan</h2></div><div class="pb"><div class="grid3">
    <div class="proj col" style="gap:6px"><b>API satışı</b><div class="small muted">Modelini geliştiricilere API ile sat. Pazar payın modelinin rakiplere göre yeteneğine bağlı; gelirin %35'i çıkarım maliyeti.</div>
      <div class="small">Pazar ${money(labApiMkt())}/ay · payın %${Math.round(labShare()*100)}</div><button class="btn sm ${L.api?'ghost':'primary'}" data-act="labapi">${L.api?'API\'yi kapat':'API\'yi aç'}</button></div>
    <div class="proj col" style="gap:6px"><b>Açık ağırlık yayını</b><div class="small muted">En iyi modelini herkese aç: geliştirici topluluğun büyür, marka +2; ama API payın yarıya iner ve rakipler bundan öğrenir.</div>
      <button class="btn sm" data-act="labopen" ${B.open?'disabled':''}>${B.open?'Açık ağırlıklı':'Ağırlıkları yayımla'}</button></div>
  </div></div></section>`:''}
  <section class="panel"><div class="ph"><h2>Öncü modeller</h2></div>${board?`<div class="tw"><table><thead><tr><th>#</th><th>Model</th><th>Laboratuvar</th><th class="r">Yetenek</th><th>Tarih</th></tr></thead><tbody>${board}</tbody></table></div>`:'<div class="pb small muted">Henüz yayımlanmış model yok.</div>'}</section>
  ${hh.length>=2?`<section class="panel"><div class="ph"><h2>Yarış</h2></div><div class="pb">${lineChart('labrace',hh.map(x=>fmtMonth(x.d)),[{n:'Öncü seviye',c:'var(--muted)',v:hh.map(x=>x.f)},{n:'En iyi modelin',c:'var(--accent)',v:hh.map(x=>x.b)}],{label:'Yapay zekâ yarışı',h:170,fmt:v=>fx(v,0)})}</div></section>`:''}`);
}

