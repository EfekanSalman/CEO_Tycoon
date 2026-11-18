/* ============================== SUSTAINABILITY (ESG) ============================== */
const newEsg=()=>({score:50,off:0,cert:-1,rec:false,h:[],gw:-999,taxOn:false,lastTax:0});
const ESG_HW={phone:0.04,pc:0.16,wear:0.01,console:0.12,cpu:0.02,xr:0.05,robo:1.2,iot:0.008,qc:40};
const ESG_OFF=[0,0.25,0.5,1];
const ESG_TAX_DAY=1826; /* 2020-01-01 */
const ESG_OFF_W=0.6; /* dengeleme kredilerinin puana ve vergiye sayılan payı */
const ESG_SRC=[['office',(LANG_EN?"Office":'Ofis')],['srv',(LANG_EN?"Office servers":'Ofis sunucuları')],['dc',(LANG_EN?"Data centers":'Veri merkezleri')],['fac',(LANG_EN?"Factories":'Fabrikalar')],['plant',(LANG_EN?"Component plants":'Bileşen tesisleri')],['hw',(LANG_EN?"Manufactured devices":'Üretilen cihazlar')],['ship',(LANG_EN?"Parts shipping":'Parça nakliyesi')]];
const esgCertOk=()=>!!G.esg&&G.esg.cert===G.office;
const esgCertCost=()=>150000*(G.office+1)*(G.floors||1)*infl();
const esgGreenFac=f=>Math.round(f.cost*0.15);
const esgGreenPlant=c=>Math.round(PLANTS[c].cost*0.15*plantLvl(c)*infl()||PLANTS[c].cost*0.15*infl());
const esgOffPx=()=>15*Math.pow(1.05,years())*infl();
const esgTaxPx=()=>G.day<ESG_TAX_DAY?0:(40+10*(years()-5))*infl();
function esgShip(){const cs=Object.keys(CCATS).filter(c=>catUse(c)>0);if(!cs.length)return 0;
  return cs.filter(c=>{const sp=SUPD[G.sup[c]];return sp&&!sp.own&&sp.region!=='turkiye';}).length/cs.length;}
function esgHwUnits(){return G.products.filter(p=>p.owner==='P'&&HW.includes(p.cat)).reduce((a,p)=>a+(p.made||0),0);}
function esgSrc(){
  const cert=esgCertOk(),rec=G.esg&&G.esg.rec?0.75:1,o={};
  o.office=G.emps.length*0.5*(cert?0.4:1);
  o.srv=(G.racks||0)*1.2*(cert?0.6:1);
  o.dc=(G.dcs||[]).filter(d=>G.day>=d.ready).reduce((a,d)=>a+d.racks*1.0*(d.green?0.1:1)+DC_LVL[d.lvl].up/20000*(d.green?0.1:1),0);
  o.fac=G.factories.filter(f=>G.day>=f.ready).reduce((a,f)=>a+(f.type==='fab'?400:40)*f.lines*(f.green?0.3:1),0);
  o.plant=Object.keys(G.plants||{}).filter(plantReady).reduce((a,c)=>a+60*plantLvl(c)*(G.plants[c].green?0.3:1),0);
  let hw=0,u=0;for(const p of G.products)if(p.owner==='P'&&HW.includes(p.cat)&&p.made>0){hw+=p.made*(ESG_HW[p.cat]||0.05);u+=p.made;}
  o.hw=hw*rec;o.ship=u*0.006*esgShip();
  for(const k in o)if(!isFinite(o[k]))o[k]=0;
  return o;
}
function esgCalc(){
  const o=esgSrc(),gross=Object.values(o).reduce((a,b)=>a+b,0),E0=G.esg||newEsg(),off=gross*(E0.off||0),net=gross-off,eff=gross-off*ESG_OFF_W;
  const rev=G.hist.length?Math.max(0,G.hist[G.hist.length-1].rev):0,revM=Math.max(0.25,rev/1e6/infl()),int=eff/revM;
  const E=60*Math.exp(-int/300),eReal=60*Math.exp(-gross/revM/300);
  const es=G.emps,mor=es.length?es.reduce((a,e)=>a+e.morale,0)/es.length:60;
  const sMor=15*clamp(mor,0,100)/100,sStr=strikeOn()?0:5,sLis=G.flags&&G.flags.listen?5:0,S=sMor+sStr+sLis;
  const gAt=G.gov&&G.gov.at.length?5:0,gCy=G.cyber&&G.cyber.log.some(l=>!l.ok&&G.day-l.d<180)?5:0,gBd=G.life&&boardOn()&&G.life.conf<40?5:0,gGw=G.day-(E0.gw||-999)<180?3:0;
  const Gv=Math.max(0,15-gAt-gCy-gBd-gGw);
  return {o,gross,off,net,eff,rev,int,E,eReal,S,Gv,sMor,sStr,sLis,gAt,gCy,gBd,gGw,mor,score:clamp(E+S+Gv+(G.rf&&G.rf.on?3:0)+(megaOn('edu')?8:0)+(megaOn('campus')?3:0),0,100)};
}
const esgScore=()=>G.esg?G.esg.score:50;
function esgRating(s){return s>=85?'AAA':s>=75?'AA':s>=65?'A':s>=55?'BBB':s>=45?'BB':s>=35?'B':'CCC';}
const esgRamp=()=>clamp((years()-3)/4,0,1);
function esgApp(r){if(r!=='eu'&&r!=='na'||!G.esg)return 1;return 1+esgRamp()*0.12*(G.era&&G.era.carbon?1.6:1)*(esgScore()-50)/100;}
const esgRound=()=>G.esg?1+0.2*(esgScore()-50)/100:1;
const esgHire=()=>G.esg&&esgScore()>70?0.3*(esgScore()-70)/30:0;
function esgEuShare(){if(!G.regions||!G.regions.eu||!G.regions.eu.in)return 0;const t=REG_ORDER.reduce((a,r)=>a+lastRegRev(r),0);return t>0?lastRegRev('eu')/t:0;}
function esgCost(){if(!G.esg)return 0;const g=Object.values(esgSrc()).reduce((a,b)=>a+b,0);return g*G.esg.off*esgOffPx()+(G.esg.rec?esgHwUnits()*0.6*infl():0);}
function carbonTax(){if(!G.esg||G.day<ESG_TAX_DAY)return 0;const g=Object.values(esgSrc()).reduce((a,b)=>a+b,0),eff=g*(1-G.esg.off*ESG_OFF_W);return Math.max(0,eff)*esgEuShare()*esgTaxPx();}
function esgMonthly(){
  const E=G.esg;if(!E)return;
  const c=esgCalc();
  E.score=Math.round((E.score*0.5+c.score*0.5)*10)/10;
  E.h.push({d:G.day,s:E.score,n:Math.round(c.net)});if(E.h.length>48)E.h.shift();
  const cost=esgCost();if(cost>0)spend(cost,'infra');
  const tx=carbonTax();E.lastTax=tx;if(tx>0)spend(tx,'other');
  if(!E.taxOn&&G.day>=ESG_TAX_DAY){E.taxOn=true;news((LANG_EN?`The EU carbon tax is now in effect: ${money(esgTaxPx())} per ton. The carbon share of your European sales is now taxed.`:`Avrupa Birliği karbon vergisi yürürlüğe girdi: ton başına ${money(esgTaxPx())}. Avrupa satışlarının karbon payı artık vergilendiriliyor.`),'bad',true);tl('law',(LANG_EN?"EU carbon tax begins":'AB karbon vergisi başladı'));}
  if(E.rec&&esgHwUnits()>1000)G.brand=clamp(G.brand+0.1,0,100);
  if(E.off>=0.5&&c.eReal<20&&c.gross>500&&Math.random()<0.03){E.gw=G.day;G.brand=clamp(G.brand-2,0,100);news((LANG_EN?`An investigative journalist ran a "greenwashing" story: ${G.name} buys carbon credits instead of cutting emissions. The brand took a hit.`:`Bir araştırmacı gazeteci "yeşil aklama" haberi yaptı: ${G.name} emisyonunu azaltmak yerine karbon kredisi satın alıyor. Marka zarar gördü.`),'bad',true);}
}
function vEsg(){
  const E=G.esg,c=esgCalc(),sc=E.score,rt=esgRating(sc),tone=sc>=65?'pos':sc<40?'neg':'';
  const tx=carbonTax(),eu=esgEuShare(),app=esgApp('eu')-1,rd=esgRound()-1,hb=esgHire();
  const src=ESG_SRC.map(([k,n])=>[k,n,c.o[k]]).filter(x=>x[2]>0.05).sort((a,b)=>b[2]-a[2]),mx=Math.max(1,...src.map(x=>x[2]));
  const bars=src.length?src.map(([k,n,v])=>`<div class="col" style="gap:4px"><div class="row between small"><span>${n}</span><span class="num">${num(v)} t · ${pct(v/Math.max(1,c.gross),0)}</span></div><div class="bar"><i style="width:${(100*v/mx).toFixed(1)}%;background:var(--accent)"></i></div></div>`).join(''):(LANG_EN?"<div class=\"small muted\">You don't have any significant emissions yet.</div>":'<div class="small muted">Henüz kayda değer bir emisyonun yok.</div>');
  const part=(n,v,m,why)=>`<div class="col" style="gap:4px"><div class="row between small"><b>${n}</b><span class="num">${fx(v,1)} / ${m}</span></div><div class="bar"><i style="width:${(100*v/m).toFixed(1)}%;background:var(--ok)"></i></div><div class="small muted">${why}</div></div>`;
  const gWhy=[c.gAt?(LANG_EN?"antitrust probe −5":'tekel soruşturması −5'):'',c.gCy?(LANG_EN?"cyberattack in last 6 months −5":'son 6 ayda siber saldırı −5'):'',c.gBd?(LANG_EN?"tense board relations −5":'kurulla gergin ilişki −5'):'',c.gGw?(LANG_EN?"greenwashing story −3":'yeşil aklama haberi −3'):''].filter(Boolean).join(', ')||(LANG_EN?"No issues.":'Sorun yok.');
  const spark=E.h.length>=2?shareSpark(E.h.map(x=>x.s),'var(--ok)',100,(LANG_EN?"Sustainability score trend":'Sürdürülebilirlik puanı eğilimi')):(LANG_EN?"<div class=\"small muted\">Score history builds up at the end of each month.</div>":'<div class="small muted">Puan geçmişi ay sonlarında birikir.</div>');
  const facs=G.factories.filter(f=>!f.green).map(f=>{const k=esgGreenFac(f);return `<div class="row between small" style="gap:8px"><span>${esc(f.name)}</span><button class="btn sm" data-act="esggreen" data-fid="${f.id}" ${G.cash<k?'disabled':''}>${money(k)}</button></div>`;});
  const pls=Object.keys(G.plants||{}).filter(c2=>!G.plants[c2].green).map(c2=>{const k=esgGreenPlant(c2);return `<div class="row between small" style="gap:8px"><span>${PLANTS[c2].n}</span><button class="btn sm" data-act="esggreen" data-pc="${c2}" ${G.cash<k?'disabled':''}>${money(k)}</button></div>`;});
  const greenN=G.factories.filter(f=>f.green).length+Object.values(G.plants||{}).filter(p=>p.green).length,dcG=(G.dcs||[]).filter(d=>d.green).length;
  const offPx=esgOffPx(),hwU=esgHwUnits();
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Sustainability${helpBtn('esg')}</h2><span class="sub">Rating ${rt}</span></div>
    <div class="kpis"><div class="kpi"><span>Score</span><b class="${tone}">${Math.round(sc)} · ${rt}</b></div><div class="kpi"><span>Gross emissions</span><b>${num(c.gross)} t/mo</b></div><div class="kpi"><span>Net emissions</span><b class="${c.net<=0.5&&c.gross>0?'pos':''}">${num(c.net)} t/mo</b></div><div class="kpi"><span>Intensity</span><b>${num(c.int)} t / $1M revenue</b></div></div>
    <div class="pb col" style="gap:10px"><div class="small muted">The score updates monthly and closes half the gap to its new level every two months. This month's indicators point to a score of ${Math.round(c.score)}.</div>${spark}</div></section>
  <section class="panel"><div class="ph"><h2>Score effects</h2></div><div class="kpis">
    <div class="kpi"><span>EU carbon tax</span><b class="${tx>0?'neg':''}">${G.day<ESG_TAX_DAY?fmtDate(ESG_TAX_DAY)+" start":money(tx)+'/ay'}</b></div>
    <div class="kpi"><span>Europe and N. America demand</span><b class="${app>0.001?'pos':app<-0.001?'neg':''}">${app>=0?'+':''}${pct(app,1)}</b></div>
    <div class="kpi"><span>Funding rounds</span><b class="${rd>0.001?'pos':rd<-0.001?'neg':''}">${rd>=0?'+':''}${pct(rd,0)}</b></div>
    <div class="kpi"><span>Candidate quality</span><b class="${hb>0?'pos':''}">${hb>0?'+'+fx(hb,2):'—'}</b></div></div>
    <div class="pb small muted">The carbon tax is charged at ${money(esgTaxPx()||(40*infl()))} per ton on the share of your emissions matching Europe's share of your revenue (${pct(eu,0)}). The eco-conscious customer effect ramps up to full strength over four years starting in 2018; a score of 50 is neutral.</div></section>
  <section class="panel"><div class="ph"><h2>Emission sources</h2><span class="sub">tons CO₂e / mo</span></div><div class="pb col" style="gap:10px">${bars}</div></section>
  <section class="panel"><div class="ph"><h2>Score components</h2></div><div class="pb"><div class="grid3">
    ${part("Environmental",c.E,60,`Emissions intensity relative to revenue. Only ${ESG_OFF_W*100}% of offset credits count.`)}
    ${part("Social",c.S,25,`Morale ${Math.round(c.mor)} → ${fx(c.sMor,1)}; ${c.sStr?"no strike +5":"strike ongoing"}; ${c.sLis?"survey promise kept +5":"survey promise broken"}.`)}
    ${part("Governance",c.Gv,15,gWhy)}</div></div></section>
  <section class="panel"><div class="ph"><h2>Reduction and offsets</h2></div><div class="pb"><div class="grid3">
    <div class="proj col" style="gap:6px"><b>Green building certification</b><div class="small muted">Cuts office emissions by 60% and office server emissions by 40%. Must be renewed if you move offices.</div>
      ${esgCertOk()?"<div><span class=\"chip st-ok\">Certified</span></div>":`<button class="btn sm primary" data-act="esgcert" ${G.cash<esgCertCost()?'disabled':''}>Get · ${money(esgCertCost())}</button>`}</div>
    <div class="proj col" style="gap:6px"><b>Device recycling program</b><div class="small muted">Collect old devices and recover materials: device emissions drop 25%, and your brand grows a bit stronger each month. ${money(0.6*infl())} per device manufactured.</div>
      <div class="row between small"><span>${hwU>0?`This month ≈ ${money(hwU*0.6*infl())}`:"You don't manufacture any devices yet."}</span><button class="btn sm ${E.rec?'':'primary'}" data-act="esgrec">${E.rec?"Turn off":"Start"}</button></div></div>
    <div class="proj col" style="gap:6px"><b>Carbon offsets</b><div class="small muted">Buy credits from forest and clean energy projects. ${money(offPx)} per ton; the price rises every year.</div>
      <div class="row" style="gap:4px;flex-wrap:wrap">${ESG_OFF.map(v=>`<button class="btn sm ${E.off===v?'primary':'ghost'}" data-act="esgoff" data-v="${v}">${v?pctN(v*100):"No"}</button>`).join('')}</div>
      <div class="small">${E.off?`Monthly ≈ ${money(c.gross*E.off*offPx)}`:''}</div></div>
    <div class="proj col" style="gap:6px"><b>Green energy</b><div class="small muted">Renewable energy at factories and plants: emissions drop 70%, energy crises don't affect you, and maintenance costs rise 5%.${dcG||G.dcs&&G.dcs.length?` You can switch data centers to green energy under Product → Data centers (${dcG}/${G.dcs.length}).`:''}</div>
      ${facs.length||pls.length?`<div class="col" style="gap:6px">${facs.join('')}${pls.join('')}</div>`:`<div class="small">${greenN?`<span class="chip st-ok">${greenN} facilities on green energy</span>`:"You don't have any factories or component plants yet."}</div>`}</div>
  </div></div></section>`:`<section class="panel"><div class="ph"><h2>Sürdürülebilirlik${helpBtn('esg')}</h2><span class="sub">Derecelendirme ${rt}</span></div>
    <div class="kpis"><div class="kpi"><span>Puan</span><b class="${tone}">${Math.round(sc)} · ${rt}</b></div><div class="kpi"><span>Brüt emisyon</span><b>${num(c.gross)} t/ay</b></div><div class="kpi"><span>Net emisyon</span><b class="${c.net<=0.5&&c.gross>0?'pos':''}">${num(c.net)} t/ay</b></div><div class="kpi"><span>Yoğunluk</span><b>${num(c.int)} t / $1M gelir</b></div></div>
    <div class="pb col" style="gap:10px"><div class="small muted">Puan ayda bir güncellenir ve iki ayda bir yarı yarıya yeni duruma yaklaşır. Bu ayın göstergeleri ${Math.round(c.score)} puana işaret ediyor.</div>${spark}</div></section>
  <section class="panel"><div class="ph"><h2>Puanın etkileri</h2></div><div class="kpis">
    <div class="kpi"><span>AB karbon vergisi</span><b class="${tx>0?'neg':''}">${G.day<ESG_TAX_DAY?fmtDate(ESG_TAX_DAY)+"'de başlar":money(tx)+'/ay'}</b></div>
    <div class="kpi"><span>Avrupa ve K. Amerika talebi</span><b class="${app>0.001?'pos':app<-0.001?'neg':''}">${app>=0?'+':''}${pct(app,1)}</b></div>
    <div class="kpi"><span>Yatırım turları</span><b class="${rd>0.001?'pos':rd<-0.001?'neg':''}">${rd>=0?'+':''}${pct(rd,0)}</b></div>
    <div class="kpi"><span>Aday kalitesi</span><b class="${hb>0?'pos':''}">${hb>0?'+'+fx(hb,2):'—'}</b></div></div>
    <div class="pb small muted">Karbon vergisi, Avrupa gelirinin payı kadar (${pct(eu,0)}) emisyonuna ton başına ${money(esgTaxPx()||(40*infl()))} üzerinden uygulanır. Çevreye duyarlı müşteri etkisi 2018'den itibaren dört yılda tam güce ulaşır; 50 puan nötrdür.</div></section>
  <section class="panel"><div class="ph"><h2>Emisyon kaynakları</h2><span class="sub">ton CO₂e / ay</span></div><div class="pb col" style="gap:10px">${bars}</div></section>
  <section class="panel"><div class="ph"><h2>Puan bileşenleri</h2></div><div class="pb"><div class="grid3">
    ${part('Çevre',c.E,60,`Gelire göre emisyon yoğunluğu. Dengeleme kredilerinin yalnızca %${ESG_OFF_W*100}'ı sayılır.`)}
    ${part('Sosyal',c.S,25,`Moral ${Math.round(c.mor)} → ${fx(c.sMor,1)}; ${c.sStr?'grev yok +5':'grev sürüyor'}; ${c.sLis?'anket sözü tutuldu +5':'anket sözü tutmadın'}.`)}
    ${part('Yönetişim',c.Gv,15,gWhy)}</div></div></section>
  <section class="panel"><div class="ph"><h2>Azaltma ve dengeleme</h2></div><div class="pb"><div class="grid3">
    <div class="proj col" style="gap:6px"><b>Yeşil bina sertifikası</b><div class="small muted">Ofis emisyonu %60, ofis sunucularınınki %40 azalır. Ofis değiştirirsen yeniden alınır.</div>
      ${esgCertOk()?'<div><span class="chip st-ok">Sertifikalı</span></div>':`<button class="btn sm primary" data-act="esgcert" ${G.cash<esgCertCost()?'disabled':''}>Al · ${money(esgCertCost())}</button>`}</div>
    <div class="proj col" style="gap:6px"><b>Cihaz geri dönüşüm programı</b><div class="small muted">Eski cihazları topla, malzemeyi geri kazan: cihaz emisyonu %25 azalır, marka her ay biraz güçlenir. Üretilen cihaz başına ${money(0.6*infl())}.</div>
      <div class="row between small"><span>${hwU>0?`Bu ay ≈ ${money(hwU*0.6*infl())}`:'Henüz cihaz üretmiyorsun.'}</span><button class="btn sm ${E.rec?'':'primary'}" data-act="esgrec">${E.rec?'Kapat':'Başlat'}</button></div></div>
    <div class="proj col" style="gap:6px"><b>Karbon dengeleme</b><div class="small muted">Orman ve temiz enerji projelerinden kredi al. Ton başı ${money(offPx)}; fiyat her yıl artar.</div>
      <div class="row" style="gap:4px;flex-wrap:wrap">${ESG_OFF.map(v=>`<button class="btn sm ${E.off===v?'primary':'ghost'}" data-act="esgoff" data-v="${v}">${v?pctN(v*100):'Yok'}</button>`).join('')}</div>
      <div class="small">${E.off?`Aylık ≈ ${money(c.gross*E.off*offPx)}`:''}</div></div>
    <div class="proj col" style="gap:6px"><b>Yeşil enerji</b><div class="small muted">Fabrika ve tesislerde yenilenebilir enerji: emisyon %70 azalır, enerji krizlerinden etkilenmezsin, bakım %5 artar.${dcG||G.dcs&&G.dcs.length?` Veri merkezlerini Ürün → Veri merkezleri bölümünden yeşile çevirebilirsin (${dcG}/${G.dcs.length}).`:''}</div>
      ${facs.length||pls.length?`<div class="col" style="gap:6px">${facs.join('')}${pls.join('')}</div>`:`<div class="small">${greenN?`<span class="chip st-ok">${greenN} tesis yeşil enerjide</span>`:'Henüz fabrikan ya da bileşen tesisin yok.'}</div>`}</div>
  </div></div></section>`);
}

