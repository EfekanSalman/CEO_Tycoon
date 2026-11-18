/* ============================== SURVEYS, UNION & STRIKES ============================== */
const SURV_D={pay:(LANG_EN?"Pay":'Maaş'),load:(LANG_EN?"Workload":'İş yükü'),mgmt:(LANG_EN?"Management":'Yönetim'),env:(LANG_EN?"Workplace":'Çalışma ortamı'),grow:(LANG_EN?"Growth":'Gelişim'),belong:(LANG_EN?"Belonging":'Aidiyet')};
const SURV_FIX={pay:(LANG_EN?"Bring pay up to market level or give raises.":'Maaşları piyasa seviyesine çek ya da zam yap.'),load:(LANG_EN?"Ease the pace and send tired employees on leave.":'Tempoyu düşür, yorgun çalışanları izne gönder.'),mgmt:(LANG_EN?"Assign managers to large teams (promotion).":'Kalabalık ekiplere yönetici ata (terfi).'),env:(LANG_EN?"Add perks, expand the office or build rooms.":'Yan haklar ekle, ofisi büyüt ya da odalar kur.'),grow:(LANG_EN?"Fund training, send people to courses, promote.":'Eğitim bütçesi ver, kursa gönder, terfi et.'),belong:(LANG_EN?"Avoid layoffs, grant stock options, share successes.":'İşten çıkarmadan kaçın, hisse opsiyonu ver, başarıları paylaş.')};
const SURV_Q={pay:[(LANG_EN?"\"I could do the same job elsewhere for more money.\"":'"Aynı işi başka yerde daha fazla parayla yapabilirim."'),(LANG_EN?"\"Nobody ever brings up raises.\"":'"Zam konusu hiç açılmıyor."')],load:[(LANG_EN?"\"We work weekends too. We're burned out.\"":'"Hafta sonları da çalışıyoruz, tükendik."'),(LANG_EN?"\"This pace isn't sustainable.\"":'"Bu tempo sürdürülebilir değil."')],mgmt:[(LANG_EN?"\"We don't know who to ask about what.\"":'"Kime ne soracağımızı bilmiyoruz."'),(LANG_EN?"\"The team is too big; nobody listens to us.\"":'"Ekip çok kalabalık, kimse bizi dinlemiyor."')],env:[(LANG_EN?"\"The office is crowded and noisy.\"":'"Ofis kalabalık ve gürültülü."'),(LANG_EN?"\"Other companies have better perks than ours.\"":'"Başka şirketlerin yan hakları bizimkinden iyi."')],grow:[(LANG_EN?"\"I'm not learning anything new here.\"":'"Burada yeni bir şey öğrenemiyorum."'),(LANG_EN?"\"My career path is unclear.\"":'"Kariyer yolum belirsiz."')],belong:[(LANG_EN?"\"Every morning I come in wondering who'll be let go.\"":'"Her sabah kimin çıkarılacağını merak ederek geliyorum."'),(LANG_EN?"\"It feels like we have no share in the company's success.\"":'"Şirketin başarısında payımız yok gibi."')]};
const UNION_MIN=25;
const workers=()=>G.emps.filter(e=>!e.founder&&!e.intern);
const strikeOn=()=>!!(G.union&&G.union.strike);
const survCost=()=>Math.max(5000,G.emps.length*60)*infl();
const newUnion=()=>({press:0,st:'none',next:null,strike:null,deals:0,calm:0});
function moodAdd(n,v,days,mem){(G.mood=G.mood||[]).push({n,v,until:G.day+days,mem:!!mem});G.mood=G.mood.filter(x=>x.until>G.day).slice(-8);}
function survCalc(){
  const es=workers();if(!es.length)return null;
  const avg=f=>es.reduce((a,e)=>a+f(e),0)/es.length,mgrs=G.emps.filter(e=>e.mgr).length;
  const nPerk=Object.keys(PERKS).filter(k=>G.perks[k]).length,rooms=(G.furn||[]).filter(f=>FURN[f.t]&&FURN[f.t].room).length,crowd=G.emps.length/Math.max(1,officeCap());
  return {
    pay:clamp(avg(e=>50+(e.salary/marketSal(e)-1)*250),0,100),
    load:clamp(avg(e=>e.energy)+(G.pace==='relax'?10:G.pace==='crunch'?-25:0)+(G.perks.flex?5:0),0,100),
    mgmt:clamp(45+35*Math.min(1,mgrs*8/es.length)+(es.length<10?15:0)-Math.min(15,G.layoff||0)*0.5,0,100),
    env:clamp(35+nPerk*7+Math.min(15,rooms*3)+G.office*4-(crowd>0.9?15:0),0,100),
    grow:clamp(35+(G.perks.learn?15:0)+avg(e=>(e.level||0)*7)+Math.min(15,Object.keys(G.unis||{}).length*5)+avg(e=>e.train&&e.train.until>G.day?20:0),0,100),
    belong:clamp(avg(e=>e.morale)*0.7+(G.perks.stock?12:0)+Math.min(10,G.momentum||0)-Math.min(25,(G.layoff||0)*1.2)+(G.union&&G.union.st==='union'?5:0),0,100)};
}
const survScore=r=>r?Object.values(r).reduce((a,b)=>a+b,0)/6:0;
function raiseAll(p){for(const e of workers())e.salary=Math.round(e.salary*(1+p)/100)*100;}
function memProb(e){return clamp(0.3+(60-e.morale)/100+(G.union?G.union.press:0)/200,0.1,0.9);}
function unionMonthly(){
  const U=G.union,es=workers();
  if(G.surv&&G.surv.plan&&G.day>=G.surv.plan.until){const pl=G.surv.plan,r=survCalc(),cur=r?r[pl.k]:0;G.surv.plan=null;
    if(cur>=pl.base+10){moodAdd((LANG_EN?"Survey promise kept":'Anket sözü tutuldu'),5,180);U.press=Math.max(0,U.press-10);(G.flags=G.flags||{}).listen=true;news((LANG_EN?`You kept your survey promise: ${SURV_D[pl.k].toLocaleLowerCase(LOC)} score ${Math.round(pl.base)} → ${Math.round(cur)}. The team appreciated it.`:`Ankette verdiğin söz tutuldu: ${SURV_D[pl.k].toLocaleLowerCase(LOC)} puanı ${Math.round(pl.base)} → ${Math.round(cur)}. Ekip bunu takdir etti.`),'good',true);}
    else{moodAdd((LANG_EN?"Survey promise broken":'Anket sözü tutulmadı'),-6,180);U.press=Math.min(100,U.press+10);news((LANG_EN?`You broke your survey promise on ${SURV_D[pl.k].toLocaleLowerCase(LOC)} (${Math.round(pl.base)} → ${Math.round(cur)}). The team is disappointed.`:`Ankette ${SURV_D[pl.k].toLocaleLowerCase(LOC)} konusunda verdiğin söz tutulmadı (${Math.round(pl.base)} → ${Math.round(cur)}). Ekip hayal kırıklığında.`),'bad',true);}}
  if(es.length<UNION_MIN&&U.st==='none'){U.press*=0.9;return;}
  /* sendika varken tüm çalışanlar çıkarılırsa anket hesaplanamaz (v166 düzeltmesi: oyun burada çöküyordu) */
  const r=survCalc();if(!r||!es.length){U.press*=0.9;return;}const avgM=es.reduce((a,e)=>a+e.morale,0)/es.length;
  const delta=(55-avgM)*0.12+(48-r.pay)*0.08+(G.pace==='crunch'?3:0)+Math.min(5,(G.layoff||0)*0.3)+(es.length>100?1.5:es.length>50?0.8:0.3);
  U.press=clamp(U.press*0.9+delta*1.2,0,100);
  if(U.st==='union'){for(const e of es)if(e.um==null)e.um=Math.random()<memProb(e);
    if(!U.strike&&U.next!=null&&G.day>=U.next&&!G.pending){const d=Math.round(clamp(3+U.press/20+(G.hist.length&&G.hist[G.hist.length-1].profit>0?2:0)+rnd(-1,1),3,15));triggerChoice('bargain',{raise:d});}}
  else if(U.st==='none'&&U.press>=50&&Math.random()<0.4&&!G.pending){U.st='drive';triggerChoice('unionDrive',{sig:Math.round(clamp(0.35+U.press/200,0.35,0.85)*100)});}
}
function startStrike(d){sfx('alarm');const U=G.union;U.strike={start:G.day,raise:d,med:0};U.deals=0;
  const n=workers().filter(e=>e.um).length;tl('bad',(LANG_EN?`Strike: ${n} employees walked out`:`Grev başladı: ${n} çalışan iş bıraktı`));
  news((LANG_EN?`STRIKE! ${n} union employees walked out. Demand: a ${d}% raise. Development, research and factories have slowed down.`:`GREV! Sendika üyesi ${n} çalışan iş bıraktı. Talep: %${d} zam. Geliştirme, araştırma ve fabrikalar yavaşladı.`),'bad',true);}
function endStrike(win){const U=G.union,st=U.strike;if(!st)return;U.strike=null;const days=G.day-st.start;
  if(win){moodAdd((LANG_EN?"Strike won":'Grevde kazanım'),5,120,true);U.press=Math.max(0,U.press-25);tl('emp',(LANG_EN?`The strike ended after ${days} days with a win for the union`:`Grev ${days} gün sonra sendikanın kazanımıyla bitti`));}
  else{moodAdd((LANG_EN?"Strike lost":'Grev kaybedildi'),-8,120,true);U.press=Math.min(100,U.press+10);tl('emp',(LANG_EN?`The strike ended after ${days} days with no result`:`Grev ${days} gün sonra sonuçsuz bitti`));}
  U.next=G.day+365;}
function unionDaily(){const U=G.union;if(!U||!U.strike)return;const st=U.strike,days=G.day-st.start;
  G.brand=clamp(G.brand-0.03,0,100);
  if(days>0&&days%15===0)news((LANG_EN?`Strike day ${days}. The press is covering the tents outside the company.`:`Grev ${days}. gününde. Basın şirketin önündeki çadırları haber yapıyor.`),'bad');
  if(Math.random()<Math.min(0.03,days*0.0006)){endStrike(false);news((LANG_EN?`The strike fund ran out: after ${days} days, the union voted to return to work with no gains. Employees are resentful.`:`Grev fonu tükendi: sendika ${days} gün sonra hiçbir kazanım olmadan işe dönme kararı aldı. Çalışanlar küskün.`),'bad',true);}}
const UNION_DRIVE={id:'unionDrive',w:0,choice:true,cond:()=>false,
  view:d=>({t:(LANG_EN?"Employees are unionizing":'Çalışanlar sendika kuruyor'),b:(LANG_EN?`About ${d.sig}% of your employees signed union cards. Representatives want collective bargaining on pay, work pace and job security.`:`Çalışanlarının yaklaşık %${d.sig}'i sendika üyelik formu imzaladı. Temsilciler maaşlar, çalışma temposu ve iş güvencesi için toplu sözleşme masası istiyor.`),
    o:[{t:(LANG_EN?"Recognize the union and negotiate":'Sendikayı tanı, masaya otur'),d:(LANG_EN?"The union is formed. Members' morale rises, but you'll bargain a contract every year; if no deal is reached, there may be a strike.":'Sendika kurulur. Üyelerin morali artar ama her yıl toplu sözleşme pazarlığı yapılır; anlaşamazsan grev olabilir.')},
      {t:(LANG_EN?"Meet their demands up front (6% raise for all)":'Taleplerini önceden karşıla (herkese %6 zam)'),d:(LANG_EN?`Monthly payroll rises by about ${money(workers().reduce((a,e)=>a+e.salary,0)*0.06)}. Pressure to organize drops sharply.`:`Aylık maaş yükü yaklaşık ${money(workers().reduce((a,e)=>a+e.salary,0)*0.06)} artar. Örgütlenme baskısı büyük ölçüde azalır.`)},
      {t:(LANG_EN?`Run a counter-campaign (${money(150000*infl()+G.emps.length*2000)})`:`Karşı kampanya yürüt (${money(150000*infl()+G.emps.length*2000)})`),d:(LANG_EN?"You hire a consulting firm. 55% chance the drive falls apart, but the team won't forget; if it fails, the union forms anyway and the story leaks to the press.":'Danışmanlık firması tutarsın. %55 ihtimalle örgütlenme dağılır ama ekip bunu unutmaz; başarısız olursa sendika yine kurulur ve haber basına sızar.')}]}),
  pick(d,i){const U=G.union;
    if(i===0){U.st='union';U.next=G.day+60;for(const e of workers())e.um=Math.random()<memProb(e);moodAdd((LANG_EN?"Union recognized":'Sendika tanındı'),3,120,true);tl('emp',(LANG_EN?"Union formed":'Sendika kuruldu'));news((LANG_EN?"You recognized the union. First contract negotiation in 2 months.":'Sendikayı tanıdın. İlk toplu sözleşme görüşmesi 2 ay sonra.'),'mkt',true);}
    else if(i===1){raiseAll(0.06);U.st='none';U.press=Math.max(0,U.press-35);moodAdd((LANG_EN?"Surprise raise":'Beklenmedik zam'),6,120);news((LANG_EN?"You gave everyone a 6% raise. The union drive is shelved for now.":'Herkese %6 zam yaptın. Sendika girişimi şimdilik rafa kalktı.'),'good',true);}
    else{spend(150000*infl()+G.emps.length*2000,'other');
      if(Math.random()<0.55){U.st='none';U.press=Math.max(0,U.press-20);moodAdd((LANG_EN?"Anti-union campaign":'Sendika karşıtı kampanya'),-6,180);G.brand=clamp(G.brand-1,0,100);news((LANG_EN?"The counter-campaign worked: the union drive collapsed. But there's a chill in the hallways.":'Karşı kampanya işe yaradı: sendika girişimi dağıldı. Ama koridorlarda soğuk bir hava var.'),'mkt',true);}
      else{U.st='union';U.next=G.day+45;U.press=Math.min(100,U.press+15);for(const e of workers())e.um=Math.random()<memProb(e)+0.1;G.brand=clamp(G.brand-3,0,100);moodAdd((LANG_EN?"Anti-union campaign":'Sendika karşıtı kampanya'),-8,180);tl('emp',(LANG_EN?"Union formed despite counter-campaign":'Sendika, karşı kampanyaya rağmen kuruldu'));news((LANG_EN?"The counter-campaign leaked to the press and backfired! The union formed anyway and your brand took a hit.":'Karşı kampanya basına sızdı ve ters tepti! Sendika yine de kuruldu, markan zarar gördü.'),'bad',true);}}}};
const BARGAIN={id:'bargain',w:0,choice:true,cond:()=>false,
  view:d=>{const pay=workers().reduce((a,e)=>a+e.salary,0),ch=clamp(0.75-G.union.press/150,0.15,0.8);
    return {t:(LANG_EN?"Contract negotiation":'Toplu sözleşme pazarlığı'),b:(LANG_EN?`The union wants a ${d.raise}% raise this year. That adds about ${money(pay*d.raise/100)} to monthly payroll. Union members: ${workers().filter(e=>e.um).length}.`:`Sendika bu yıl için %${d.raise} zam istiyor. Bu, aylık maaş yükünü yaklaşık ${money(pay*d.raise/100)} artırır. Sendika üyesi çalışan sayısı: ${workers().filter(e=>e.um).length}.`),
    o:[{t:(LANG_EN?`Accept (${d.raise}% raise)`:`Kabul et (%${d.raise} zam)`),d:(LANG_EN?"The contract is signed: a year of peace.":'Sözleşme imzalanır, bir yıl huzur olur.')},
      {t:(LANG_EN?`Counteroffer (${Math.ceil(d.raise/2)}%)`:`Karşı teklif ver (%${Math.ceil(d.raise/2)})`),d:(LANG_EN?`About a ${Math.round(ch*100)}% chance the union accepts. If they refuse, a strike begins.`:`Sendikanın kabul etme ihtimali yaklaşık %${Math.round(ch*100)}. Reddederse grev başlar.`)},
      {t:(LANG_EN?"Decline":'Reddet'),d:(LANG_EN?"A strike will most likely begin. If the union backs down, the team will be resentful.":'Büyük ihtimalle grev başlar. Sendika geri adım atarsa ekip küser.')}]};},
  pick(d,i){const U=G.union;
    if(i===0){raiseAll(d.raise/100);U.next=G.day+365;U.deals++;U.press=Math.max(0,U.press-25);moodAdd((LANG_EN?"Contract signed":'Toplu sözleşme imzalandı'),4,180,true);news((LANG_EN?`Contract signed: ${d.raise}% raise.`:`Toplu sözleşme imzalandı: %${d.raise} zam.`),'good',true);}
    else if(i===1){const ch=clamp(0.75-U.press/150,0.15,0.8);
      if(Math.random()<ch){raiseAll(Math.ceil(d.raise/2)/100);U.next=G.day+365;U.deals++;U.press=Math.max(0,U.press-10);news((LANG_EN?`The union accepted your counteroffer: ${Math.ceil(d.raise/2)}% raise.`:`Sendika karşı teklifini kabul etti: %${Math.ceil(d.raise/2)} zam.`),'good',true);}
      else startStrike(d.raise);}
    else{if(Math.random()<0.85)startStrike(d.raise);else{U.next=G.day+365;U.press=Math.min(100,U.press+20);moodAdd((LANG_EN?"Demands rejected":'Talepler reddedildi'),-6,180,true);news((LANG_EN?"The union failed to call a strike; demands were rejected. Members are angry.":'Sendika grev kararı alamadı, talepler reddedildi. Üyeler öfkeli.'),'bad',true);}}}};
EVENTS.push(UNION_DRIVE,BARGAIN);EVD.unionDrive=UNION_DRIVE;EVD.bargain=BARGAIN;
function vCyber(){
  const cy=G.cyber;if(!cy)return '';
  const sc=secScore(),th=threatLevel(),sur=attackSurface(),secs=G.emps.filter(e=>e.role==='sec');
  const block=sc/100*(has('sec2')?1:0.85),yearly=(1-Math.pow(1-th*(1-block),12));
  const col=sc>=65?'var(--ok)':sc>=40?'var(--warn)':'var(--bad)';
  const tools=Object.entries(CY_TOOLS).map(([k,x])=>(LANG_EN?`<div class="proj"><div class="row between"><b>${x.n}</b>${cy[k]?"<span class=\"chip st-ok\">Active</span>":''}</div><div class="small muted">${x.d}</div>
    <div class="row between small"><span>${money(x.cost())}/mo</span><button class="btn sm ${cy[k]?'ghost':'primary'}" data-act="cytool" data-k="${k}">${cy[k]?"Turn off":"Start"}</button></div></div>`:`<div class="proj"><div class="row between"><b>${x.n}</b>${cy[k]?'<span class="chip st-ok">Aktif</span>':''}</div><div class="small muted">${x.d}</div>
    <div class="row between small"><span>${money(x.cost())}/ay</span><button class="btn sm ${cy[k]?'ghost':'primary'}" data-act="cytool" data-k="${k}">${cy[k]?'Kapat':'Başlat'}</button></div></div>`)).join('');
  const ptc=80000*infl()*(1+G.emps.length/40);
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Cybersecurity</h2><span class="sub">${secs.length} security specialists${cyberDown()?` · <span class="neg">${cy.downKind}: ${cy.down-G.day}-day outage</span>`:''}${cy.ddos>G.day?` · <span class="neg">DDoS ongoing</span>`:''}</span></div>
    <div class="kpis" style="border-top:0"><div class="kpi"><span>Security level</span><b style="color:${col}">${Math.round(sc)}/100</b></div><div class="kpi"><span>Attack surface</span><b>${fx(sur,1)}</b></div><div class="kpi"><span>Monthly attack chance</span><b>${Math.round(th*100)}%${cy.wave>G.day?' <small class="neg">dalga</small>':''}</b></div><div class="kpi"><span>Block chance</span><b>${Math.round(block*100)}%</b></div><div class="kpi"><span>Yearly breach risk</span><b class="${yearly>0.4?'neg':yearly>0.2?'warn':'pos'}">${Math.round(yearly*100)}%</b></div></div>
    <div class="pb col">
      <div class="bar"><i style="width:${sc}%;background:${col}"></i></div>
      <p class="small muted">As your company grows (employees, users, products and servers), your attack surface widens and you become a bigger target. Security specialists, Zero Trust and AI Threat Detection research, a bug bounty program and penetration tests raise your level. Attack types: phishing, industrial espionage, data exfiltration, DDoS and ransomware.</p>
      <div class="grid3">${tools}</div>
      <div class="row between"><span class="small">${cy.pentest>G.day?`Pentest in effect until ${fmtDate(cy.pentest)} (+12)`:"Penetration test: an outside team attacks your systems to find vulnerabilities (+12 for 180 days)."}</span><button class="btn sm" data-act="pentest" ${cy.pentest>G.day||G.cash<ptc?'disabled':''}>Order a pentest ${money(ptc)}</button></div>
      ${cy.log.length?`<div class="small"><b>Recent incidents</b></div><ul class="alerts">${cy.log.map(l=>`<li><span class="chip ${l.ok?'st-ok':'st-bad'}">${l.ok?"Blocked":"Attack"}</span><span>${esc(l.t)}</span><span class="small muted">${fmtDate(l.d)}</span></li>`).join('')}</ul>`:''}
      <div class="row"><button class="btn sm" data-act="tab" data-tab="team">Hire a security specialist</button></div>
    </div></section>`:`<section class="panel"><div class="ph"><h2>Siber güvenlik</h2><span class="sub">${secs.length} güvenlik uzmanı${cyberDown()?` · <span class="neg">${cy.downKind}: ${cy.down-G.day} gün kesinti</span>`:''}${cy.ddos>G.day?` · <span class="neg">DDoS sürüyor</span>`:''}</span></div>
    <div class="kpis" style="border-top:0"><div class="kpi"><span>Güvenlik seviyesi</span><b style="color:${col}">${Math.round(sc)}/100</b></div><div class="kpi"><span>Saldırı yüzeyi</span><b>${fx(sur,1)}</b></div><div class="kpi"><span>Aylık saldırı ihtimali</span><b>%${Math.round(th*100)}${cy.wave>G.day?' <small class="neg">dalga</small>':''}</b></div><div class="kpi"><span>Engelleme ihtimali</span><b>%${Math.round(block*100)}</b></div><div class="kpi"><span>Yılda başarılı saldırı riski</span><b class="${yearly>0.4?'neg':yearly>0.2?'warn':'pos'}">%${Math.round(yearly*100)}</b></div></div>
    <div class="pb col">
      <div class="bar"><i style="width:${sc}%;background:${col}"></i></div>
      <p class="small muted">Şirket büyüdükçe (çalışan, kullanıcı, ürün ve sunucu) saldırı yüzeyi genişler ve daha çok hedef olursun. Güvenlik uzmanları, Sıfır Güven ve Yapay Zeka Tehdit Tespiti araştırmaları, hata ödül programı ve sızma testi seviyeni yükseltir. Saldırı türleri: oltalama, endüstriyel casusluk, veri sızdırma, DDoS ve fidye yazılımı.</p>
      <div class="grid3">${tools}</div>
      <div class="row between"><span class="small">${cy.pentest>G.day?`Sızma testi etkisi ${fmtDate(cy.pentest)}'e kadar (+12)`:'Sızma testi: dışarıdan bir ekip sistemlerine saldırıp açıkları bulur (180 gün +12).'}</span><button class="btn sm" data-act="pentest" ${cy.pentest>G.day||G.cash<ptc?'disabled':''}>Sızma testi yaptır ${money(ptc)}</button></div>
      ${cy.log.length?`<div class="small"><b>Son olaylar</b></div><ul class="alerts">${cy.log.map(l=>`<li><span class="chip ${l.ok?'st-ok':'st-bad'}">${l.ok?'Engellendi':'Saldırı'}</span><span>${esc(l.t)}</span><span class="small muted">${fmtDate(l.d)}</span></li>`).join('')}</ul>`:''}
      <div class="row"><button class="btn sm" data-act="tab" data-tab="team">Güvenlik uzmanı işe al</button></div>
    </div></section>`);
}


