/* ============================== EVENTS ============================== */
const EVENTS=[
  {id:'chip',w:3,cond:()=>G.day>240&&!(G.pxEvt.wafer&&G.pxEvt.wafer.until>G.day),run(){const d=rint(120,210);G.pxEvt.wafer={m:1.6,until:G.day+d};G.pxEvt.memory={m:1.35,until:G.day+d};G.pxEvt.gpu={m:1.4,until:G.day+d};
    news((LANG_EN?`Global chip crisis! Silicon wafer prices up 60%, memory prices up 35%. It will last about ${Math.round(d/30)} months.`:`Küresel çip krizi! Silikon levha fiyatları %60, bellek fiyatları %35 artıyor. Yaklaşık ${Math.round(d/30)} ay sürecek.`),'bad',true);}},
  {id:'glut',w:2,run(){G.pxEvt.screen={m:0.75,until:G.day+180};news((LANG_EN?"Display panel glut: panel prices 25% lower for 6 months.":'Ekran paneli arz fazlası: panel fiyatları 6 ay boyunca %25 düşük.'),'good',true);}},
  {id:'memdrop',w:2,run(){G.pxEvt.memory={m:0.8,until:G.day+150};news((LANG_EN?"Memory makers are drowning in inventory: RAM and SSD prices fell 20%.":'Bellek üreticileri stokta boğuluyor: RAM ve SSD fiyatları %20 düştü.'),'good',true);}},
  {id:'battery',w:1,run(){G.pxEvt.battery={m:1.4,until:G.day+150};news((LANG_EN?"Lithium prices soared: battery cells 40% pricier for 5 months.":'Lityum fiyatları fırladı: batarya hücreleri 5 ay boyunca %40 pahalı.'),'bad',true);}},
  {id:'quake',w:2,run(){const r=pick(['tayvan','japonya','turkiye','kore']);const d=rint(20,45);G.disrupt[r]={until:G.day+d,why:(LANG_EN?"Earthquake":'Deprem')};
    news((LANG_EN?`Major earthquake in ${REGIONS[r]}. Suppliers and factories in the region will be down for about ${d} days.`:`${REGIONS[r]}'da büyük deprem. Bölgedeki tedarikçiler ve fabrikalar yaklaşık ${d} gün duracak.`),'bad',true);}},
  {id:'strike',w:2,run(){const d=rint(15,30);G.disrupt.cin={until:G.day+d,why:(LANG_EN?"Port strike":'Liman grevi')};news((LANG_EN?`Strike at Chinese ports: shipments from China and contract assembly halted for ${d} days.`:`Çin limanlarında grev: Çin'den gelen sevkiyatlar ve fason montaj ${d} gün duruyor.`),'bad',true);}},
  {id:'typhoon',w:1,run(){const r=pick(['vietnam','meksika']);const d=rint(10,25);G.disrupt[r]={until:G.day+d,why:r==='vietnam'?(LANG_EN?"Typhoon":'Tayfun'):(LANG_EN?"Hurricane":'Kasırga')};news((LANG_EN?`${REGIONS[r]} was hit by a ${r==='vietnam'?'tayfun':"hurricane"}: facilities in the region are closed for ${d} days.`:`${REGIONS[r]}'yı ${r==='vietnam'?'tayfun':'kasırga'} vurdu: bölgedeki tesisler ${d} gün kapalı.`),'bad',true);}},
  {id:'tariff',w:1,cond:()=>!(G.tariffs.cin&&G.tariffs.cin.until>G.day),run(){G.tariffs.cin={rate:0.2,until:G.day+365};news((LANG_EN?"Trade war: 20% tariff on Chinese-made parts for 1 year.":'Ticaret savaşı: Çin menşeli parçalara 1 yıl boyunca %20 gümrük vergisi.'),'bad',true);}},
  {id:'incentive',w:1,run(){G.incentive={region:'turkiye',pct:0.3,until:G.day+180};news((LANG_EN?"Incentive package: 30% government support for factories built in Turkey for 6 months.":"Teşvik paketi: 6 ay boyunca Türkiye'de kurulan fabrikalara %30 devlet desteği."),'good',true);}},
  {id:'energy',w:1,run(){G.energy={m:1.4,until:G.day+150};news((LANG_EN?"Energy crisis: production and factory operating costs up 40% for 5 months.":'Enerji krizi: üretim ve fabrika işletme giderleri 5 ay boyunca %40 artıyor.'),'bad',true);}},
  {id:'supdown',w:2,run(){const s=pick(SUPPLIERS);G.supDown[s.id]=G.day+rint(45,90);
    news((LANG_EN?`Fire at ${s.n} (${CCATS[s.cat].n}) facility; no deliveries for at least ${Math.round((G.supDown[s.id]-G.day)/30)} months. You can switch suppliers under Product → Purchasing.`:`${s.n} (${CCATS[s.cat].n}) tesisinde yangın çıktı, en az ${Math.round((G.supDown[s.id]-G.day)/30)} ay teslimat yok. Ürün → Satın alma bölümünden başka tedarikçiye geçebilirsin.`),'bad',true);}},
  {id:'viral',w:2,cond:()=>myActive('app').length>0,run(){const p=pick(myActive('app'));p.hype={m:1.8,until:G.day+45};G.brand=clamp(G.brand+2,0,100);news((LANG_EN?`${p.name} went viral on social media! User numbers are soaring.`:`${p.name} sosyal medyada viral oldu! Kullanıcı sayısı fırlıyor.`),'good',true);}},
  {id:'scandal',w:1,cond:()=>liveComps().some(c=>c.brand>40),run(){const c=pick(liveComps().filter(c=>c.brand>40));c.brand=clamp(c.brand-12,3,90);news((LANG_EN?`${c.name} was rocked by a data scandal and its brand value crashed. A chance to grab market share.`:`${c.name} veri skandalıyla sarsıldı, marka değeri çakıldı. Pazar payı kapma fırsatı.`),'mkt',true);}},
  {id:'award',w:1,cond:()=>myActive().some(p=>p.score/S(p.cat)>=1.1),run(){const p=myActive().filter(p=>p.score/S(p.cat)>=1.1).sort((a,b)=>b.score/S(b.cat)-a.score/S(a.cat))[0];
    p.hype={m:1.3,until:G.day+60};G.brand=clamp(G.brand+3,0,100);news((LANG_EN?`${p.name} won the "Tech Product of the Year" award!`:`${p.name} "Yılın Teknoloji Ürünü" ödülünü kazandı!`),'good',true);}},
  {id:'fair',w:1,run(){G.cands=[];for(let i=0;i<6;i++)G.cands.push(genCand(2));news((LANG_EN?"University career fair: the candidate pool is very strong this month. Check Team → Team & candidates.":'Üniversite kariyer fuarı: bu ay aday havuzu çok güçlü. Ekip → Ekip ve adaylar bölümüne göz at.'),'good',true);}},
  {id:'leak',w:2,choice:true,cond:()=>myActive('saas').length>0,
    make:()=>({cost:Math.round(50000+myActive('saas').reduce((a,p)=>a+p.units*p.price,0)*0.5)}),
    view:d=>({t:(LANG_EN?"Security vulnerability":'Güvenlik açığı'),b:(LANG_EN?"A serious security vulnerability was found in your web service. No one has noticed yet.":'Web servisinde ciddi bir güvenlik açığı bulundu. Henüz kimse fark etmedi.'),
      o:[{t:(LANG_EN?`Fix it and disclose publicly (${money(d.cost)})`:`Kapat ve kamuoyuna duyur (${money(d.cost)})`),d:(LANG_EN?"The brand takes a small hit; the risk is fully gone.":'Marka biraz zarar görür, risk tamamen biter.')},{t:(LANG_EN?"Patch quietly":'Sessizce yamala'),d:(LANG_EN?"45% chance it leaks to the press: brand -8 and 3 months of subscriber losses.":'%45 ihtimalle basına sızar: marka -8 ve 3 ay abone kaybı.')}]}),
    pick(d,i){if(i===0){spend(d.cost,'other');G.brand=clamp(G.brand-1,0,100);news((LANG_EN?"Vulnerability fixed and disclosed. Users appreciated the transparency.":'Güvenlik açığı kapatıldı ve duyuruldu. Kullanıcılar şeffaflığı takdir etti.'),'good');}
      else if(Math.random()<0.45){G.brand=clamp(G.brand-8,0,100);for(const p of myActive('saas'))p.hype={m:0.6,until:G.day+90};news((LANG_EN?"The hidden vulnerability leaked to the press! Subscribers are fleeing.":'Gizlenen güvenlik açığı basına sızdı! Aboneler kaçıyor.'),'bad',true);}
      else news((LANG_EN?"The hole was quietly patched; no one noticed.":'Açık sessizce kapatıldı, kimse fark etmedi.'),'good');}},
  {id:'patent',w:0,choice:true,cond:()=>myActive().some(p=>HW.includes(p.cat))&&liveComps().some(c=>c.cash>20e6),
    make:()=>{const p=pick(myActive().filter(p=>HW.includes(p.cat)));const c=pick(liveComps().filter(c=>c.cash>20e6));
      return {pid:p.id,cid:c.id,y:Math.round(Math.max(200000,(p.sr||p.units)*p.price*1.5))};},
    view:d=>{const p=prod(d.pid),c=comp(d.cid);return {t:(LANG_EN?"Patent lawsuit":'Patent davası'),b:(LANG_EN?`${c?c.name:"A rival"} filed a patent infringement suit over ${p?p.name:"your product"}.`:`${c?c.name:'Bir rakip'}, ${p?p.name:'ürünün'} için patent ihlali davası açtı.`),
      o:[{t:(LANG_EN?`Settle (${money(d.y)})`:`Uzlaş (${money(d.y)})`),d:(LANG_EN?"Pay the license fee and close the matter.":'Lisans ücretini öde, konu kapansın.')},{t:(LANG_EN?"Go to court ($100K in legal fees)":'Mahkemeye git ($100K avukat)'),d:(LANG_EN?`50% chance to win (brand +2); if you lose, ${money(d.y*2.5)} in damages.`:`%50 kazanırsın (marka +2), kaybedersen ${money(d.y*2.5)} tazminat.`)}]};},
    pick(d,i){if(i===0){spend(d.y,'other');news((LANG_EN?"Patent lawsuit settled.":'Patent davasında uzlaşıldı.'));}
      else{spend(100000,'other');if(Math.random()<0.5){G.brand=clamp(G.brand+2,0,100);news((LANG_EN?"You won the patent lawsuit! The court ruled your products are original.":'Patent davasını kazandın! Mahkeme ürünlerinin özgün olduğuna karar verdi.'),'good',true);}
        else{spend(d.y*2.5,'other');news((LANG_EN?`Patent lawsuit lost: ${money(d.y*2.5)} in damages paid.`:`Patent davası kaybedildi: ${money(d.y*2.5)} tazminat ödendi.`),'bad',true);}}}},
  {id:'poach',w:0,choice:true,cond:()=>false,
    make:()=>{const e=G.emps.filter(e=>!e.founder&&e.skill>=6).sort((a,b)=>b.skill-a.skill)[0];return {eid:e.id,rival:pick(liveComps()).name};},
    view:d=>{const e=G.emps.find(x=>x.id===d.eid);return {t:(LANG_EN?"Poaching offer":'Transfer teklifi'),b:(LANG_EN?`${d.rival} made a job offer to ${e?e.name:"your best employee"} (${e?ROLES[e.role].n+", skill "+fx(e.skill,1):''}).`:`${d.rival}, ${e?e.name:'en iyi çalışanına'} (${e?ROLES[e.role].n+', yetenek '+fx(e.skill,1):''}) iş teklif etti.`),
      o:[{t:(LANG_EN?`Give a raise (+30%, ${e?money(e.salary*0.3):''}/mo)`:`Zam yap (+%30, ${e?money(e.salary*0.3):''}/ay)`),d:(LANG_EN?"The employee stays.":'Çalışan kalır.')},{t:(LANG_EN?"Let them go":'Gitmesine izin ver'),d:(LANG_EN?"Payroll drops, but you lose the talent.":'Maaş yükü azalır, yeteneği kaybedersin.')}]};},
    pick(d,i){const e=G.emps.find(x=>x.id===d.eid);if(!e)return;if(i===0){e.salary=Math.round(e.salary*1.3/100)*100;e.morale=Math.min(100,e.morale+10);news((LANG_EN?`${e.name} accepted the raise and stayed.`:`${e.name} zammı kabul etti ve kaldı.`));}
      else{e.lw='poach';G.emps=G.emps.filter(x=>x!==e);news((LANG_EN?`${e.name} left for ${d.rival}.`:`${e.name}, ${d.rival} şirketine geçti.`),'bad');}}},
  {id:'offer',w:1,choice:true,cond:()=>G.day>180&&valuation()>1e6,
    make:()=>{const v=valuation(),amt=Math.round(v*rnd(0.08,0.15));return {amt,pct:Math.min(0.3,amt/v*rnd(1.15,1.4))};},
    view:d=>({t:(LANG_EN?"Investment offer":'Yatırım teklifi'),b:(LANG_EN?`A venture capital fund wants ${pct(d.pct)} of your company for ${money(d.amt)}. That's below your valuation.`:`Bir girişim sermayesi fonu ${money(d.amt)} karşılığında şirketin ${pct(d.pct)}'ini istiyor. Bu, değerlemenin altında bir fiyat.`),
      o:[{t:(LANG_EN?`Accept (+${money(d.amt)})`:`Kabul et (+${money(d.amt)})`),d:(LANG_EN?`Your stake ${pct(G.equity)} → ${pct(G.equity*(1-d.pct))}`:`Hissen ${pct(G.equity)} → ${pct(G.equity*(1-d.pct))}`)},{t:(LANG_EN?"Decline":'Reddet'),d:(LANG_EN?"Keep your shares.":'Hisseni koru.')}]}),
    pick(d,i){if(i===0){G.cash+=d.amt;G.equity*=(1-d.pct);news((LANG_EN?`VC investment received: ${money(d.amt)}.`:`Fon yatırımı alındı: ${money(d.amt)}.`),'good');}}},
  {id:'recall',w:2,choice:true,cond:()=>false,
    make:()=>{const p=pick(myActive('phone').filter(p=>p.sr>100));return {pid:p.id,cost:Math.round(p.sr*2*p.price*0.12+50000)};},
    view:d=>{const p=prod(d.pid);return {t:(LANG_EN?"Battery problem":'Batarya sorunu'),b:(LANG_EN?`Battery swelling complaints are rising for ${p?p.name:"Your phone"}.`:`${p?p.name:'Telefonun'} için batarya şişmesi şikayetleri artıyor.`),
      o:[{t:(LANG_EN?`Recall (${money(d.cost)})`:`Geri çağır (${money(d.cost)})`),d:(LANG_EN?"Expensive, but trust is preserved (brand -1).":'Pahalı ama güven korunur (marka -1).')},{t:(LANG_EN?"Handle it with a software update":'Yazılım güncellemesiyle idare et'),d:(LANG_EN?"40% chance of scandal: brand -10, sales drop for 4 months.":'%40 ihtimalle skandal: marka -10, satışlar 4 ay düşer.')}]};},
    pick(d,i){const p=prod(d.pid);if(i===0){spend(d.cost,'other');G.brand=clamp(G.brand-1,0,100);news((LANG_EN?"Phones recalled; customers are satisfied.":'Telefonlar geri çağrıldı, müşteriler memnun.'));}
      else if(Math.random()<0.4){G.brand=clamp(G.brand-10,0,100);if(p)p.hype={m:0.5,until:G.day+120};news((LANG_EN?"The battery scandal blew up! Sales crashed.":'Batarya skandalı büyüdü! Satışlar çakıldı.'),'bad',true);}
      else news((LANG_EN?"The update fixed the problem.":'Güncelleme sorunu çözdü.'),'good');}},
];
const EVD=Object.fromEntries(EVENTS.map(e=>[e.id,e]));
function rollEvent(){
  if(G.pending||(G.inbox&&G.inbox.length>=5)||G.day<120||Math.random()>(G.mods&&G.mods.ev||0.42))return;
  const pool=EVENTS.filter(e=>!e.cond||e.cond());
  let t=pool.reduce((a,e)=>a+e.w,0)*Math.random();
  const ev=pool.find(e=>(t-=e.w)<0);if(!ev)return;
  if(ev.choice){triggerChoice(ev.id,ev.make());}
  else ev.run();
}



