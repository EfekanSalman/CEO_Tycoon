/* ============================== TENDERS ============================== */
const TND_T=[
  {k:'gov',cat:'saas',b:(LANG_EN?"Ministry of Digital Transformation":'Dijital Dönüşüm Bakanlığı'),t:(LANG_EN?"E-government document platform":'E-devlet belge platformu'),req:'gdpr'},
  {k:'gov',cat:'pc',b:(LANG_EN?"Ministry of National Education":'Milli Eğitim Bakanlığı'),t:(LANG_EN?"Laptops for schools":'Okullar için dizüstü bilgisayar')},
  {k:'gov',cat:'phone',b:(LANG_EN?"Defense Procurement Agency":'Savunma Tedarik Ajansı'),t:(LANG_EN?"Secure enterprise phone":'Güvenli kurumsal telefon'),req:'sec1'},
  {k:'gov',cat:'ai',b:(LANG_EN?"Metropolitan Municipality":'Büyükşehir Belediyesi'),t:(LANG_EN?"Smart city AI assistant":'Akıllı şehir yapay zekâ asistanı')},
  {k:'gov',cat:'saas',b:(LANG_EN?"Ministry of Health":'Sağlık Bakanlığı'),t:(LANG_EN?"Hospital information system":'Hastane bilgi sistemi'),req:'sec1'},
  {k:'gov',cat:'car',b:(LANG_EN?"Ministry of Transport":'Ulaştırma Bakanlığı'),t:(LANG_EN?"Electric bus fleet software":'Elektrikli otobüs filosu yazılımı')},
  {k:'gov',cat:'xr',b:(LANG_EN?"Armed Forces Training Command":'Silahlı Kuvvetler Eğitim Komutanlığı'),t:(LANG_EN?"Virtual reality training simulator":'Sanal gerçeklik eğitim simülatörü')},
  {k:'corp',cat:'ai',b:(LANG_EN?"Anadolu Bank":'Anadolu Bankası'),t:(LANG_EN?"Call center AI":'Çağrı merkezi yapay zekâsı')},
  {k:'corp',cat:'pc',b:(LANG_EN?"Yildiz Holding":'Yıldız Holding'),t:(LANG_EN?"Employee laptop fleet":'Çalışan dizüstü bilgisayar filosu')},
  {k:'corp',cat:'saas',b:(LANG_EN?"Pazar Stores":'Pazar Zinciri'),t:(LANG_EN?"Store management cloud":'Mağaza yönetim bulutu')},
  {k:'corp',cat:'wear',b:(LANG_EN?"Swift Logistics":'Hızlı Lojistik'),t:(LANG_EN?"Smart wristband for warehouse workers":'Depo çalışanları için akıllı bileklik')},
  {k:'corp',cat:'phone',b:(LANG_EN?"Turkcom Mobile":'Turkcom Operatör'),t:(LANG_EN?"Carrier-exclusive smartphone":'Operatöre özel akıllı telefon')},
  {k:'corp',cat:'robo',b:(LANG_EN?"Aegean Warehousing":'Ege Depoculuk'),t:(LANG_EN?"Warehouse automation robots":'Depo otomasyon robotları')},
  {k:'gov',cat:'qc',b:(LANG_EN?"Science and Technology Agency":'Bilim ve Teknoloji Kurumu'),t:(LANG_EN?"National quantum computing center":'Ulusal kuantum hesaplama merkezi'),req:'qc2'},
  {k:'gov',cat:'iot',b:(LANG_EN?"Metropolitan Municipality":'Büyükşehir Belediyesi'),t:(LANG_EN?"Smart streetlight and sensor network":'Akıllı sokak lambası ve sensör ağı'),req:'sec1'},
  {k:'corp',cat:'iot',b:(LANG_EN?"Konut Construction Inc.":'Konut Yapı A.Ş.'),t:(LANG_EN?"Smart home package for new housing estates":'Yeni sitelere akıllı ev paketi')},
  {k:'corp',cat:'app',b:(LANG_EN?"Airline Inc.":'Havayolu A.Ş.'),t:(LANG_EN?"Passenger mobile app":'Yolcu mobil uygulaması')},
  {k:'corp',cat:'os',b:(LANG_EN?"Home Appliances Group":'Beyaz Eşya Grubu'),t:(LANG_EN?"Smart device operating system license":'Akıllı cihaz işletim sistemi lisansı')},
];
const newTnd=()=>({open:[],ctr:[],log:[],rep:50,ban:0});
const tndHW=c=>HW.includes(c);
function tndMake(){
  const pool=TND_T.filter(T=>G.products.some(p=>p.active&&p.cat===T.cat)&&!(G.tnd.open.concat(G.tnd.ctr)).some(x=>x.t===T.t));if(!pool.length)return;
  const T=pick(pool),months=pick([6,12,12,18,24]),hw=tndHW(T.cat),ref=CATS[T.cat].ref||1;
  const scale=clamp(0.02+G.brand/2500,0.02,0.06);
  let o={id:nid(),k:T.k,cat:T.cat,b:T.b,t:T.t,req:T.req||null,months,due:G.day+rint(25,45),vreq:Math.round(rnd(0.85,1.05)*100)/100,riv:[]};
  if(hw){o.units=Math.max(50,Math.round(demand(T.cat)*scale*rnd(0.6,1.4)/10)*10);o.unitPx=Math.round(ref*Math.pow(1.03,years())*rnd(0.95,1.2));o.monthly=o.units*o.unitPx;}
  else{o.seats=Math.max(500,Math.round(demand(T.cat)*scale*rnd(0.5,1.2)/100)*100);o.seatPx=T.cat==='app'?0.5:Math.round(ref*rnd(0.9,1.3)*100)/100;o.monthly=o.seats*o.seatPx;if(T.cat==='os')o.monthly=Math.max(o.monthly,40000*infl());}
  o.value=o.monthly*months;
  const rivals=liveComps().filter(c=>G.products.some(p=>p.active&&p.owner===c.id&&p.cat===T.cat)).sort(()=>Math.random()-0.5).slice(0,rint(1,3));
  o.riv=rivals.map(c=>c.id);
  G.tnd.open.push(o);if(o.value>2e6*infl()||G.tnd.open.length===1)news((LANG_EN?`New tender: ${o.b} is taking bids for "${o.t}" (${money(o.value)}, ${months} months). Deadline ${fmtDate(o.due)}.`:`Yeni ihale: ${o.b}, "${o.t}" için teklif topluyor (${money(o.value)}, ${months} ay). Son gün ${fmtDate(o.due)}.`),'',true);
}
const tndProds=o=>myActive(o.cat).filter(p=>!tndHW(o.cat)||p.spec);
const tndPrepC=o=>Math.max(5000,o.value*0.01);
function tndScore(o,v,px,brand,rep,prep,local){return 0.45*Math.min(1.5,v/o.vreq)+0.35/px+0.1*brand/100+0.1*rep/100+(prep?0.06:0)+(local?0.05:0);}
function tndMyScore(o,b){const p=prod(b.pid);if(!p)return 0;return tndScore(o,p.score/S(p.cat),b.px,G.brand,G.tnd.rep,b.prep,o.k==='gov')*biTnd();}
function tndRivScore(o,cid){const c=comp(cid);if(!c)return 0;const ps=G.products.filter(p=>p.active&&p.owner===cid&&p.cat===o.cat);const v=ps.reduce((a,p)=>Math.max(a,p.score/S(p.cat)),0.8);return tndScore(o,v,rnd(0.88,1.08),c.brand,45+relOf(c)*0,Math.random()<0.4,false);}
function tndWinP(o,b){if(!b||!b.pid)return 0;const me=tndMyScore(o,b);if(me<0.5)return 0.02;let p=1;
  for(const cid of o.riv){const c=comp(cid);if(!c)continue;const ps=G.products.filter(q=>q.active&&q.owner===cid&&q.cat===o.cat);const v=ps.reduce((a,q)=>Math.max(a,q.score/S(q.cat)),0.8);
    const r=tndScore(o,v,0.98,c.brand,45,false,false)+0.024;p*=1/(1+Math.exp(-(me-r)/0.035));}
  return clamp(p,0.02,0.97);}
function tndMonthly(){
  const T=G.tnd;if(!T)return;
  if(G.day>180&&T.open.length<4&&Math.random()<0.4+Math.min(0.3,G.brand/200))tndMake();
  for(const o of T.open.slice()){if(G.day<o.due)continue;T.open=T.open.filter(x=>x!==o);
    const b=o.bid;if(!b){continue;}const p=prod(b.pid);
    if(!p||!p.active||(o.req&&!has(o.req))){T.log.unshift({d:G.day,t:o.t,r:(LANG_EN?"Disqualified":'Elendi')});news(`${o.b} ihalesinden elendin: ${!p||!p.active?(LANG_EN?"the product you bid is no longer on the market":'teklif ettiğin ürün artık piyasada değil'):(LANG_EN?"required certification missing":'gerekli sertifika yok')}.`,'bad');continue;}
    const me=tndMyScore(o,b)+(Math.random()-0.5)*0.12;let best=null,bs=-1;for(const cid of o.riv){const sc=tndRivScore(o,cid)+(Math.random()-0.5)*0.12;if(sc>bs){bs=sc;best=cid;}}
    if(me>bs&&me>=0.5){const ctr={...o,pid:b.pid,px:b.px,pay:o.monthly*b.px,start:G.day,end:G.day+o.months*30,del:0,need:0,strikes:0,late:0};T.ctr.push(ctr);
      T.log.unshift({d:G.day,t:o.t,r:(LANG_EN?"Won":'Kazanıldı'),v:ctr.pay*o.months});sfx('cash');news((LANG_EN?`You won the tender! ${o.months}-month "${o.t}" contract with ${o.b}: ${money(ctr.pay)} per month.`:`İhaleyi kazandın! ${o.b} ile ${o.months} aylık "${o.t}" sözleşmesi: ayda ${money(ctr.pay)}.`),'good',true);tl('money',(LANG_EN?`Tender: ${o.t} (${money(ctr.pay*o.months)})`:`İhale: ${o.t} (${money(ctr.pay*o.months)})`));(G.flags=G.flags||{}).tender=true;}
    else{const c=comp(best);T.log.unshift({d:G.day,t:o.t,r:(LANG_EN?`Lost${c?' · '+c.name:''}`:`Kaybedildi${c?' · '+c.name:''}`)});if(c){c.cash+=o.monthly*o.months*0.2;}news((LANG_EN?`${c?c.name:"a rival"} won the "${o.t}" tender.`:`"${o.t}" ihalesini ${c?c.name:'bir rakip'} kazandı.`),'bad',true);}
    if(T.log.length>12)T.log.pop();}
  for(const c of T.ctr.slice()){const p=prod(c.pid);let ok=true,fee=0;
    if(tndHW(c.cat)){const need=c.units*c.px/c.px;c.need+=need;const have=p&&p.fg?Math.min(p.fg,need):0;if(have>0){const avg=p.fgv/p.fg;p.fg-=have;p.fgv-=avg*have;}c.del+=have;
      if(have<need*0.95){ok=false;fee=c.pay*0.05*(1-have/need)*4;c.late++;}}
    else{if(!p||!p.active||(p.bugs||0)>60||p.score/S(p.cat)<c.vreq*0.8){ok=false;fee=c.pay*0.1;c.strikes++;}}
    const payNow=c.pay*(tndHW(c.cat)&&p&&c.need?Math.min(1,c.del/c.need):1);
    G.cash+=payNow;G.month.rev+=payNow;if(fee>0)spend(fee,'other');
    if(!ok)news((LANG_EN?`${c.b} contract: ${tndHW(c.cat)?"deliveries fell short":"service level not met"}. ${money(fee)} penalty.`:`${c.b} sözleşmesinde ${tndHW(c.cat)?'teslimat eksik kaldı':'hizmet seviyesi tutturulamadı'}: ${money(fee)} ceza.`),'bad',true);
    if(c.strikes>=3||(tndHW(c.cat)&&c.late>=3&&c.del<c.need*0.7)){T.ctr=T.ctr.filter(x=>x!==c);const f=c.pay*c.months*0.15;spend(f,'other');G.brand=clamp(G.brand-3,0,100);T.rep=clamp(T.rep-20,0,100);if(c.k==='gov')T.ban=G.day+730;
      T.log.unshift({d:G.day,t:c.t,r:(LANG_EN?"Terminated":'Feshedildi')});news((LANG_EN?`${c.b} terminated the contract and demanded ${money(f)} in damages.${c.k==='gov'?" You're barred from public tenders for two years.":''}`:`${c.b} sözleşmeyi feshetti ve ${money(f)} tazminat istedi.${c.k==='gov'?' İki yıl kamu ihalelerine giremezsin.':''}`),'bad',true);tl('bad',(LANG_EN?`${c.t} contract terminated`:`${c.t} sözleşmesi feshedildi`));continue;}
    if(G.day>=c.end){T.ctr=T.ctr.filter(x=>x!==c);const good=tndHW(c.cat)?c.del>=c.need*0.95:c.strikes===0;T.rep=clamp(T.rep+(good?12:4),0,100);if(good)G.brand=clamp(G.brand+1,0,100);
      T.log.unshift({d:G.day,t:c.t,r:good?(LANG_EN?"Completed successfully":'Başarıyla tamamlandı'):(LANG_EN?"Completed":'Tamamlandı')});news((LANG_EN?`${c.b} contract ${good?"successfully ":''}completed. Tender reputation: ${Math.round(T.rep)}.`:`${c.b} sözleşmesi ${good?'başarıyla ':''}tamamlandı. İhale itibarın ${Math.round(T.rep)}.`),'good');}}
}
const ctrDem=pid=>G.tnd?G.tnd.ctr.filter(c=>c.pid===pid&&tndHW(c.cat)).reduce((a,c)=>a+c.units/30,0):0;
function vTenders(){
  const T=G.tnd,ban=T.ban>G.day,mon=T.ctr.reduce((a,c)=>a+c.pay,0);
  const open=T.open.map(o=>{const ps=tndProds(o),b=o.bid||(UI.tb&&UI.tb[o.id])||{pid:ps[0]?ps[0].id:null,px:1,prep:false},locked=!!o.bid,blocked=o.k==='gov'&&ban,reqOk=!o.req||has(o.req),wp=b.pid?tndWinP(o,b):0;
    return (LANG_EN?`<div class="proj col" style="gap:6px${o.bid?";border-color:var(--ok)":''}"><div class="row between"><b>${esc(o.t)}</b><span class="chip ${o.k==='gov'?'st-warn':'st-mute'}">${o.k==='gov'?"Public":"Private"}</span></div>
      <div class="small muted">${esc(o.b)} · ${CATS[o.cat].n} · ${o.months} months · deadline ${fmtDate(o.due)} (${Math.max(0,o.due-G.day)} days)</div>
      <div class="kv small"><span>Contract</span><b>${money(o.value)}</b><span>${o.units?"Delivery":"Scope"}</span><b>${o.units?num(o.units)+" units/mo":num(o.seats)+" users"}</b><span>Min. freshness</span><b>${Math.round(o.vreq*100)}%</b><span>Rival bids</span><b>${o.riv.length}</b>${o.req?`<span>Requirement</span><b class="${reqOk?'pos':'neg'}">${RESD[o.req].n}</b>`:''}</div>
      ${blocked?"<div class=\"small neg\">You're banned from public tenders.</div>":!ps.length?`<div class="small muted">You have no products in this category.</div>`:locked?`<div class="small"><span class="chip st-ok">Bid submitted</span> ${esc((prod(b.pid)||{}).name||'')} · price ${Math.round(b.px*100)}%${b.prep?" · thorough preparation":''} · win chance ~${Math.round(wp*100)}%</div>`:`
      <div class="row small" style="gap:4px;flex-wrap:wrap">${ps.map(p=>`<button class="btn sm ${b.pid===p.id?'primary':'ghost'}" data-act="tbset" data-id="${o.id}" data-k="pid" data-v="${p.id}">${esc(p.name)} · ${Math.round(p.score/S(p.cat)*100)}%</button>`).join('')}</div>
      <div class="row small" style="gap:4px;flex-wrap:wrap"><span>Price:</span>${[0.85,0.95,1,1.1].map(x=>`<button class="btn sm ${b.px===x?'primary':'ghost'}" data-act="tbset" data-id="${o.id}" data-k="px" data-v="${x}">${Math.round(x*100)}%</button>`).join('')}
        <button class="btn sm ${b.prep?'primary':'ghost'}" data-act="tbset" data-id="${o.id}" data-k="prep" data-v="${b.prep?0:1}">Thorough preparation · ${money(tndPrepC(o))}</button></div>
      <div class="row between small"><span>Est. win chance <b>${Math.round(wp*100)}%</b> · ${money(o.monthly*b.px)}/mo</span><button class="btn sm primary" data-act="tbid" data-id="${o.id}" ${!b.pid||!reqOk||G.cash<(b.prep?tndPrepC(o):0)+5000?'disabled':''}>Submit bid</button></div>`}</div>`:`<div class="proj col" style="gap:6px${o.bid?';border-color:var(--ok)':''}"><div class="row between"><b>${esc(o.t)}</b><span class="chip ${o.k==='gov'?'st-warn':'st-mute'}">${o.k==='gov'?'Kamu':'Özel'}</span></div>
      <div class="small muted">${esc(o.b)} · ${CATS[o.cat].n} · ${o.months} ay · son gün ${fmtDate(o.due)} (${Math.max(0,o.due-G.day)} gün)</div>
      <div class="kv small"><span>Sözleşme</span><b>${money(o.value)}</b><span>${o.units?'Teslimat':'Kapsam'}</span><b>${o.units?num(o.units)+' adet/ay':num(o.seats)+' kullanıcı'}</b><span>Asgari güncellik</span><b>%${Math.round(o.vreq*100)}</b><span>Rakip teklif</span><b>${o.riv.length}</b>${o.req?`<span>Şart</span><b class="${reqOk?'pos':'neg'}">${RESD[o.req].n}</b>`:''}</div>
      ${blocked?'<div class="small neg">Kamu ihalelerinden men edildin.</div>':!ps.length?`<div class="small muted">Bu kategoride ürünün yok.</div>`:locked?`<div class="small"><span class="chip st-ok">Teklif verildi</span> ${esc((prod(b.pid)||{}).name||'')} · fiyat %${Math.round(b.px*100)}${b.prep?' · kapsamlı hazırlık':''} · kazanma ihtimali ~%${Math.round(wp*100)}</div>`:`
      <div class="row small" style="gap:4px;flex-wrap:wrap">${ps.map(p=>`<button class="btn sm ${b.pid===p.id?'primary':'ghost'}" data-act="tbset" data-id="${o.id}" data-k="pid" data-v="${p.id}">${esc(p.name)} · %${Math.round(p.score/S(p.cat)*100)}</button>`).join('')}</div>
      <div class="row small" style="gap:4px;flex-wrap:wrap"><span>Fiyat:</span>${[0.85,0.95,1,1.1].map(x=>`<button class="btn sm ${b.px===x?'primary':'ghost'}" data-act="tbset" data-id="${o.id}" data-k="px" data-v="${x}">%${Math.round(x*100)}</button>`).join('')}
        <button class="btn sm ${b.prep?'primary':'ghost'}" data-act="tbset" data-id="${o.id}" data-k="prep" data-v="${b.prep?0:1}">Kapsamlı hazırlık · ${money(tndPrepC(o))}</button></div>
      <div class="row between small"><span>Tahmini kazanma ihtimali <b>%${Math.round(wp*100)}</b> · aylık ${money(o.monthly*b.px)}</span><button class="btn sm primary" data-act="tbid" data-id="${o.id}" ${!b.pid||!reqOk||G.cash<(b.prep?tndPrepC(o):0)+5000?'disabled':''}>Teklif ver</button></div>`}</div>`);}).join('');
  const ctr=T.ctr.map(c=>{const p=prod(c.pid),left=Math.max(0,Math.ceil((c.end-G.day)/30)),hw=tndHW(c.cat);
    return (LANG_EN?`<div class="proj col" style="gap:6px"><div class="row between"><b>${esc(c.t)}</b><span class="chip ${c.strikes||c.late?'st-warn':'st-ok'}">${left} months left</span></div>
      <div class="small muted">${esc(c.b)} · ${p?esc(p.name):"no product"} · ${money(c.pay)}/mo</div>
      ${hw?`<div class="small">Delivered ${num(c.del)} / ${num(c.need)} · ${num(c.units)} units/mo${p&&p.fg<c.units?` · <span class="warn">inventory ${num(p.fg)}</span>`:''}</div><div class="bar"><i style="width:${c.need?Math.min(100,c.del/c.need*100):100}%;background:${c.need&&c.del<c.need*0.95?'var(--warn)':'var(--ok)'}"></i></div>`
        :`<div class="small">Service level: bugs ≤60, freshness ≥${Math.round(c.vreq*80)}% · ${p?`currently ${p.bugs||0} bugs, ${Math.round(p.score/S(p.cat)*100)}%`:''} · violations ${c.strikes}/3</div>`}</div>`:`<div class="proj col" style="gap:6px"><div class="row between"><b>${esc(c.t)}</b><span class="chip ${c.strikes||c.late?'st-warn':'st-ok'}">${left} ay kaldı</span></div>
      <div class="small muted">${esc(c.b)} · ${p?esc(p.name):'ürün yok'} · ayda ${money(c.pay)}</div>
      ${hw?`<div class="small">Teslim edilen ${num(c.del)} / ${num(c.need)} · aylık ${num(c.units)} adet${p&&p.fg<c.units?` · <span class="warn">stok ${num(p.fg)}</span>`:''}</div><div class="bar"><i style="width:${c.need?Math.min(100,c.del/c.need*100):100}%;background:${c.need&&c.del<c.need*0.95?'var(--warn)':'var(--ok)'}"></i></div>`
        :`<div class="small">Hizmet seviyesi: hata ≤60, güncellik ≥%${Math.round(c.vreq*80)} · ${p?`şu an ${p.bugs||0} hata, %${Math.round(p.score/S(p.cat)*100)}`:''} · ihlal ${c.strikes}/3</div>`}</div>`);}).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Tenders${helpBtn('tender')}</h2><span class="sub">Tender reputation ${Math.round(T.rep)}${ban?` · <span class="neg">banned from public tenders until ${fmtDate(T.ban)}</span>`:''}</span></div>
    <div class="kpis"><div class="kpi"><span>Open tenders</span><b>${T.open.length}</b></div><div class="kpi"><span>Active contracts</span><b>${T.ctr.length}</b></div><div class="kpi"><span>Monthly contract revenue</span><b class="${mon?'pos':''}">${money(mon)}</b></div><div class="kpi"><span>Reputation</span><b>${Math.round(T.rep)}</b></div></div>
    <div class="pb small muted">Governments and large companies put out tenders for products or services in a specific category. Your bid is scored on quality (45%), price (35%), your brand and your tender reputation; being a local company is an advantage in public tenders. If you win, you get fixed monthly revenue but also take on obligations: monthly deliveries for hardware (added to the production plan as demand), a service level for software. Missed deliveries and violations bring penalties; repeat them and the contract is terminated, and you may be banned from public tenders.</div></section>
  <section class="panel"><div class="ph"><h2>Open tenders</h2></div><div class="pb">${open?`<div class="grid">${open}</div>`:"<div class=\"small muted\">No open tenders right now. Tenders come more often as your brand grows.</div>"}</div></section>
  ${ctr?`<section class="panel"><div class="ph"><h2>Active contracts</h2></div><div class="pb"><div class="grid3">${ctr}</div></div></section>`:''}
  ${T.log.length?`<section class="panel"><div class="ph"><h2>Tender history</h2></div><div class="pb small col" style="gap:4px">${T.log.map(l=>`<div><span class="muted num">${fmtDate(l.d)}</span> · ${esc(l.t)} · <b class="${/Kazanıldı|başarıyla|Won|successfully/.test(l.r)?'pos':/Kaybedildi|Feshedildi|Elendi/.test(l.r)?'neg':''}">${esc(l.r)}</b>${l.v?` · ${money(l.v)}`:''}</div>`).join('')}</div></section>`:''}`:`<section class="panel"><div class="ph"><h2>İhaleler${helpBtn('tender')}</h2><span class="sub">İhale itibarı ${Math.round(T.rep)}${ban?` · <span class="neg">kamu ihalelerinden ${fmtDate(T.ban)}'e kadar men</span>`:''}</span></div>
    <div class="kpis"><div class="kpi"><span>Açık ihale</span><b>${T.open.length}</b></div><div class="kpi"><span>Aktif sözleşme</span><b>${T.ctr.length}</b></div><div class="kpi"><span>Aylık sözleşme geliri</span><b class="${mon?'pos':''}">${money(mon)}</b></div><div class="kpi"><span>İtibar</span><b>${Math.round(T.rep)}</b></div></div>
    <div class="pb small muted">Devletler ve büyük şirketler belirli bir kategoride ürün ya da hizmet için ihaleye çıkar. Teklifin kaliteye (%45), fiyata (%35), markana ve ihale itibarına göre puanlanır; kamu ihalelerinde yerli olman avantajdır. Kazanırsan aylık sabit gelir alırsın ama yükümlülük de taşırsın: donanımda her ay teslimat (talebe göre üretim planına eklenir), yazılımda hizmet seviyesi. Eksik teslimat ve ihlaller ceza getirir; tekrarlarsa sözleşme feshedilir ve kamu ihalelerinden men edilebilirsin.</div></section>
  <section class="panel"><div class="ph"><h2>Açık ihaleler</h2></div><div class="pb">${open?`<div class="grid">${open}</div>`:'<div class="small muted">Şu an açık ihale yok. İhaleler markan büyüdükçe daha sık gelir.</div>'}</div></section>
  ${ctr?`<section class="panel"><div class="ph"><h2>Aktif sözleşmeler</h2></div><div class="pb"><div class="grid3">${ctr}</div></div></section>`:''}
  ${T.log.length?`<section class="panel"><div class="ph"><h2>İhale geçmişi</h2></div><div class="pb small col" style="gap:4px">${T.log.map(l=>`<div><span class="muted num">${fmtDate(l.d)}</span> · ${esc(l.t)} · <b class="${/Kazanıldı|başarıyla/.test(l.r)?'pos':/Kaybedildi|Feshedildi|Elendi/.test(l.r)?'neg':''}">${esc(l.r)}</b>${l.v?` · ${money(l.v)}`:''}</div>`).join('')}</div></section>`:''}`);
}

