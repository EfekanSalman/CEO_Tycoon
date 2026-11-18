/* ============================== CRISIS DESK ============================== */
/* Kriz masası: büyük operasyonel krizler (veri sızıntısı, ürün güvenliği, genel grev, küresel kesinti) üç turda yönetilir:
   İlk 24 saat → Soruşturma → Kapanış. Beş paydaşın (müşteriler, basın, regülatör, yatırımcılar, çalışanlar) güveni 0–100 izlenir;
   her seçenek onları farklı yönlere iter (seçeneklerde yön okları görünür, tam sayılar görünmez). Turlar arasında 5 gün geçer.
   Bir tura 10 gün içinde karar verilmezse sessiz kalmış sayılırsın (pasif seçenek). Yalan söylemek (inkâr) bir sonraki turda ortaya çıkabilir.
   Sonuç: marka (basın), etkilenen ürünlerde 90 gün satış çarpanı (müşteriler), ceza (regülatör), hisse havası ya da kurul güveni
   (yatırımcılar), moral (çalışanlar). Ortalama güvene göre A–F notu. 540. günden sonra, iki kriz arasında en az 720 gün, ayda ~%2,5. */
const CD_K=['m','b','r','i','e'],CD_N={m:(LANG_EN?"Customers":'Müşteriler'),b:(LANG_EN?"Press":'Basın'),r:(LANG_EN?"Regulator":'Regülatör'),i:(LANG_EN?"Investors":'Yatırımcılar'),e:(LANG_EN?"Employees":'Çalışanlar')};
const CD_RN=[(LANG_EN?"First 24 hours":'İlk 24 saat'),(LANG_EN?"Investigation":'Soruşturma'),(LANG_EN?"Closing":'Kapanış')];
const cdRev=()=>Math.max(2e5*infl(),monthlyEst().rev);
const cdPay=()=>G.emps.reduce((a,e)=>a+e.salary,0);
const CD_T={
  breach:{n:(LANG_EN?"Major data breach":'Büyük veri sızıntısı'),w:3,ok:()=>myActive().some(p=>SW_CATS.includes(p.cat)&&p.units>50000),risk:()=>G.cyber&&G.cyber.backup?1:1.6,
    mk(){const p=myActive().filter(p=>SW_CATS.includes(p.cat)).sort((a,b)=>b.units-a.units)[0];return {pid:p.id,b:(LANG_EN?`${num(Math.round(p.units*rnd(0.2,0.6)))} records with ${p.name} users' emails, passwords and payment details went up for sale on a hacker forum.`:`${p.name} kullanıcılarının e-posta, şifre ve ödeme bilgilerini içeren ${num(Math.round(p.units*rnd(0.2,0.6)))} kayıt bir korsan forumunda satışa çıktı.`),start:{m:40,b:35,r:45,i:55,e:60}};},
    r:[[{t:(LANG_EN?"Disclose publicly at once, warn users":'Hemen kamuya açıkla, kullanıcıları uyar'),d:{m:12,b:10,r:12,i:-6,e:4}},{t:(LANG_EN?"Investigate internally first, then disclose":'Önce iç soruşturma yap, sonra açıkla'),d:{m:-4,b:-6,r:-4,i:4}},{t:(LANG_EN?"Say the leak is unconfirmed":'Sızıntı doğrulanmadı de'),d:{m:-10,b:-12,r:-14,i:6},lie:1,pas:1}],
       [{t:(LANG_EN?"Identity protection and compensation for everyone affected":'Etkilenen herkese kimlik koruma ve telafi'),c:()=>cdRev()*0.6,d:{m:15,b:6,r:6,i:-8}},{t:(LANG_EN?"Independent security audit and a transparent report":'Bağımsız güvenlik denetimi ve şeffaf rapor'),c:()=>2e6*infl(),d:{m:5,b:10,r:12,i:-3}},{t:(LANG_EN?"Quietly grow the security team":'Güvenlik ekibini sessizce büyüt'),c:()=>5e5*infl(),d:{m:-3,b:-5,r:2,i:3,e:2},pas:1}],
       [{t:(LANG_EN?"Apologize publicly, take responsibility":'Kamuoyundan özür dile, sorumluluğu üstlen'),d:{m:8,b:10,r:4,i:-4,e:6}},{t:(LANG_EN?"Fire the head of security":'Güvenlik şefini görevden al'),d:{m:3,b:4,r:2,i:6,e:-10}},{t:(LANG_EN?"Close the matter, focus on the product":'Konuyu kapat, ürüne odaklan'),d:{m:-4,b:-6,r:-6,i:4,e:2},pas:1}]]},
  safety:{n:(LANG_EN?"Product safety crisis":'Ürün güvenliği krizi'),w:3,ok:()=>myActive().some(p=>HWDEV(p)&&p.sr>200),risk:()=>1+Math.max(0,myActive().filter(HWDEV).reduce((a,p)=>Math.max(a,defectRate(p.plan.site,p.cat)),0)-0.02)*20,
    mk(){const p=myActive().filter(p=>HWDEV(p)&&p.sr>200).sort((a,b)=>b.sr-a.sr)[0];return {pid:p.id,b:(LANG_EN?`Reports are spreading that ${p.name} devices overheat and some have injured users. A consumer association demands that sales be halted.`:`${p.name} cihazlarının aşırı ısındığı ve bazılarının kullanıcıları yaraladığı haberleri yayılıyor. Bir tüketici derneği satışların durdurulmasını istiyor.`),start:{m:38,b:30,r:40,i:50,e:60}};},
    r:[[{t:(LANG_EN?"Halt sales, start a voluntary recall":'Satışı durdur, gönüllü geri çağırma başlat'),c:c=>{const p=prod(c.pid);return p?Math.max(2e5,p.sr*p.price*0.3):1e6;},d:{m:14,b:12,r:15,i:-12}},{t:(LANG_EN?"Limit charging with a software update":'Yazılım güncellemesiyle şarjı sınırla'),c:()=>2e5*infl(),d:{m:2,b:2,r:2,i:2}},{t:(LANG_EN?"Blame user error":'Kullanıcı hatası olduğunu açıkla'),d:{m:-14,b:-12,r:-10,i:5},lie:1,pas:1}],
       [{t:(LANG_EN?"Share all data with the regulator":'Tüm verileri regülatörle paylaş'),d:{r:15,b:5,i:-4}},{t:(LANG_EN?"Commission an independent lab test":'Bağımsız laboratuvar testi yaptır'),c:()=>1e6*infl(),d:{r:8,b:8,m:4}},{t:(LANG_EN?"Defend with the legal team":'Hukuk ekibiyle savun'),c:()=>5e5*infl(),d:{r:-8,i:4,b:-3},pas:1}],
       [{t:(LANG_EN?"Free device replacement for every customer":'Bütün müşterilere ücretsiz cihaz değişimi'),c:c=>{const p=prod(c.pid);return p?Math.max(5e5,p.sr*p.price*0.8):3e6;},d:{m:15,b:8,i:-10,r:4}},{t:(LANG_EN?"Hand out discount coupons":'İndirim kuponu ver'),c:()=>cdRev()*0.2,d:{m:5,i:-2}},{t:(LANG_EN?"Fix it in the next model, wait":'Bir sonraki modelde düzelt, bekle'),d:{m:-6,b:-4,r:-3},pas:1}]]},
  strike:{n:(LANG_EN?"General strike at the factories":'Fabrikalarda genel grev'),w:2,ok:()=>G.factories.length>0&&G.emps.length>=20,risk:()=>(G.union&&G.union.st==='union'?1.8:1)*(G.emps.length&&G.emps.reduce((a,e)=>a+e.morale,0)/G.emps.length<55?1.6:1),
    mk(){return {b:(LANG_EN?`Factory workers and engineers walked out over pay and working conditions. Production is grinding to a halt and the strike is growing.`:`Fabrika işçileri ve mühendisler ücretler ve çalışma koşulları için iş bıraktı. Üretim durma noktasında, grev büyüyor.`),start:{m:55,b:45,r:55,i:45,e:30}};},
    r:[[{t:(LANG_EN?"Sit down with the representatives right away":'Temsilcilerle hemen masaya otur'),d:{e:15,b:8,i:-4}},{t:(LANG_EN?"Bring in temporary workers":'Geçici işçi getir'),c:()=>cdPay()*0.5,d:{e:-15,b:-10,i:6,r:-6}},{t:(LANG_EN?"Wait, the strike will fizzle out":'Bekle, grev kendiliğinden biter'),d:{e:-5,i:-6,m:-4},pas:1}],
       [{t:(LANG_EN?"8% raise and benefits":'%8 zam ve yan haklar'),c:()=>cdPay()*0.08*12,d:{e:18,i:-8,b:4}},{t:(LANG_EN?"One-time bonus":'Tek seferlik ikramiye'),c:()=>cdPay(),d:{e:8,i:-3}},{t:(LANG_EN?"Threaten to move production abroad":'Üretimi başka ülkeye taşıma tehdidi'),d:{e:-15,b:-12,r:-5,i:5},pas:1}],
       [{t:(LANG_EN?"Put an employee representative on the board":'Çalışan temsilcisini yönetime al'),d:{e:12,i:-3,b:8}},{t:(LANG_EN?"Sign the deal, turn the page":'Anlaşmayı imzala, sayfayı kapat'),d:{e:4,i:2}},{t:(LANG_EN?"Fire the strike leaders":'Grevin liderlerini işten çıkar'),d:{e:-20,b:-14,r:-10,i:4},pas:1}]]},
  outage:{n:(LANG_EN?"Global service outage":'Küresel hizmet kesintisi'),w:2,ok:()=>myActive().some(p=>['saas','os','ai'].includes(p.cat)&&p.units>20000),risk:()=>(G.dcs||[]).length>1?0.8:1.3,
    mk(){const p=myActive().filter(p=>['saas','os','ai'].includes(p.cat)).sort((a,b)=>b.units-a.units)[0];return {pid:p.id,b:(LANG_EN?`${p.name} has been down for ${rint(9,30)} hours. Business customers say they are losing money, and you're a laughing stock on social media.`:`${p.name} ${rint(9,30)} saattir çalışmıyor. Şirket müşterileri iş kaybettiklerini söylüyor, sosyal medyada alay konusu oldun.`),start:{m:35,b:40,r:60,i:50,e:55}};},
    r:[[{t:(LANG_EN?"Status page and hourly updates":'Durum sayfası ve saat başı güncelleme'),d:{m:10,b:8}},{t:(LANG_EN?"Blame the cloud provider":'Bulut sağlayıcısını suçla'),d:{m:-2,b:-6,r:-4,i:4},lie:1},{t:(LANG_EN?"Fix it quietly":'Sessizce düzelt'),d:{m:-8,b:-8},pas:1}],
       [{t:(LANG_EN?"Compensate with a free month of service":'Bir ay ücretsiz hizmetle telafi'),c:()=>cdRev()*0.5,d:{m:15,i:-8,b:4}},{t:(LANG_EN?"Publish a detailed technical report":'Ayrıntılı teknik rapor yayımla'),d:{m:5,b:10,r:4}},{t:(LANG_EN?"No compensation, an apology is enough":'Telafi yok, özür yeterli'),d:{m:-6,b:-2},pas:1}],
       [{t:(LANG_EN?"Pledge to invest in a backup data center":'Yedek veri merkezi yatırımı sözü'),c:()=>3e6*infl(),d:{m:6,i:4,r:6}},{t:(LANG_EN?"Grow the infrastructure team":'Altyapı ekibini büyüt'),c:()=>1e6*infl(),d:{e:6,m:3}},{t:(LANG_EN?"Close the matter":'Konuyu kapat'),d:{m:-3},pas:1}]]}};
const cdOn=()=>!!(G&&G.cd);
const cdWait=()=>!!(G&&G.cd&&G.cd.wait);
function cdStart(k){const T=CD_T[k],x=T.mk();G.cd={k,round:0,mt:{...x.start},pid:x.pid||null,b:x.b,d:G.day,wait:true,rd:G.day,log:[],lie:false,cost:0};G.cdLast=G.day;
  news((LANG_EN?`Crisis: ${T.n}. The crisis desk has convened; the first decision is due within 10 days.`:`Kriz: ${T.n}. Kriz masası toplandı; ilk karar 10 gün içinde verilmeli.`),'bad',true);tl('bad',T.n);cdOpen();}
function cdOpen(){if(!cdWait())return;if(G.simple){cdPick(1);return;}if(G.speed){G.prevSpeed=G.speed;G.speed=0;}openModal('cdesk');}
/* kriz yalnızca belli bir ölçeğe ulaşmış ve nakit sıkıntısı çekmeyen şirketlere çıkar (karşılaştırmalı bot ölçümünde, zorlanan şirketlere
   çıkan krizler kriz senaryosunda iflasları 1/40'tan 8/40'a çıkarıyordu) */
const cdEligible=()=>!cashTight()&&valuation()>=20e6*infl()&&G.hist.length>=3&&G.hist.slice(-3).reduce((a,h)=>a+h.profit,0)>0;
function cdMonthly(){if(sgOff('cd')||G.cd||G.day<540||G.day-(G.cdLast||-999)<720||(G.tut&&G.tut.on)||G.over||!cdEligible())return;
  const L=Object.keys(CD_T).filter(k=>{try{return CD_T[k].ok();}catch(e){return false;}});if(!L.length)return;
  const ws=L.map(k=>CD_T[k].w*CD_T[k].risk()),tot=ws.reduce((a,b)=>a+b,0);if(Math.random()>=0.025*Math.min(2,tot/L.length))return;
  let r=Math.random()*tot,k=L[0];for(let i=0;i<L.length;i++){r-=ws[i];if(r<=0){k=L[i];break;}}cdStart(k);}
/* tur bekliyor: 10 gün içinde karar yoksa pasif seçenek; tur arası 5 gün */
function cdDaily(){const C=G.cd;if(!C)return;
  if(C.wait&&G.day-C.rd>=10){const R=CD_T[C.k].r[C.round],i=R.findIndex(o=>o.pas);cdPick(i<0?R.length-1:i,true);return;}
  if(!C.wait&&G.day>=C.next){C.wait=true;C.rd=G.day;
    if(C.lie&&C.round===1&&Math.random()<0.6){C.revealed=true;C.mt.b=clamp(C.mt.b-12,0,100);C.mt.r=clamp(C.mt.r-12,0,100);C.mt.m=clamp(C.mt.m-6,0,100);C.log.push({t:(LANG_EN?"A journalist published internal messages: the first statement turned out to be untrue.":'Bir gazeteci iç yazışmaları yayımladı: ilk açıklamanın doğru olmadığı ortaya çıktı.'),d:{b:-12,r:-12,m:-6}});}
    news((LANG_EN?`Crisis desk: ${CD_RN[C.round].toLocaleLowerCase(LOC)} stage, a decision is needed.`:`Kriz masası: ${CD_RN[C.round].toLocaleLowerCase(LOC)} aşaması, karar bekleniyor.`),'bad');cdOpen();}}
function cdPick(i,auto){const C=G.cd;if(!C||!C.wait)return;const R=CD_T[C.k].r[C.round];let o=R[+i];if(!o)return;
  const cost=x=>x.c?Math.round(x.c(C)):0;
  // parası yetmeyen seçenek uygulanmaz: oyuncu için arayüzde zaten kapalıdır; otomatik seçimde en ucuz seçeneğe düşülür (nakit eksiye itilmesin)
  if(cost(o)>Math.max(0,G.cash)){if(!auto){showToast((LANG_EN?"Not enough cash for this option.":'Bu seçenek için yeterli nakit yok.'),'bad');return;}o=R.slice().sort((a,b)=>cost(a)-cost(b))[0];}
  const c=cost(o);if(c>0){spend(c,'other');C.cost+=c;}
  for(const k in o.d)C.mt[k]=clamp(C.mt[k]+o.d[k],0,100);if(o.lie)C.lie=true;
  C.log.push({t:(auto?(LANG_EN?"No decision, stayed silent: ":'Karar verilmedi, sessiz kalındı: '):'')+o.t,d:o.d,c});C.wait=false;C.round++;
  if(C.round>=3){cdEnd();return;}C.next=G.day+5;if(UI.modal&&UI.modal.kind==='cdesk')closeModal();if(!auto&&G.prevSpeed&&!G.over&&!G.pending)G.speed=G.prevSpeed;}
function cdGrade(avg){return avg>=62?'A':avg>=55?'B':avg>=48?'C':avg>=40?'D':'F';}
function cdEnd(){const C=G.cd,T=CD_T[C.k],M=C.mt,avg=CD_K.reduce((a,k)=>a+M[k],0)/5,gr=cdGrade(avg),I=infl();const out=[];
  const db=clamp((M.b-50)/10,-5,5);G.brand=clamp(G.brand+db,0,100);out.push((LANG_EN?`brand ${db>=0?'+':''}${fx(db,1)}`:`marka ${db>=0?'+':''}${fx(db,1)}`));
  const hm=clamp(0.82+0.24*M.m/100,0.82,1.05),aff=C.k==='strike'?myActive().filter(isHW):C.k==='safety'?[prod(C.pid)].filter(Boolean):myActive().filter(p=>SW_CATS.includes(p.cat));
  for(const p of aff)p.hype={m:hm,until:G.day+90};out.push((LANG_EN?`sales ×${fx(hm,2)} (90 days)`:`satış ×${fx(hm,2)} (90 gün)`));
  if(M.r<35){const f=Math.round(Math.max(1e6*I,cdRev()*1.5)*(35-M.r)/35);spend(f,'other');out.push((LANG_EN?`fine ${money(f)}`:`ceza ${money(f)}`));}
  if(G.pub){G.pub.sent*=0.85+0.18*M.i/100;out.push((LANG_EN?"share mood ":'hisse havası ')+(M.i>=50?(LANG_EN?"positive":'olumlu'):(LANG_EN?"negative":'olumsuz')));}else if(G.life){const dc=(M.i-50)/5;G.life.conf=clamp(G.life.conf+dc,0,100);out.push((LANG_EN?`board confidence ${dc>=0?'+':''}${fx(dc,0)}`:`kurul güveni ${dc>=0?'+':''}${fx(dc,0)}`));}
  const dm=(M.e-50)/10;for(const e of G.emps)e.morale=clamp(e.morale+dm,0,100);out.push((LANG_EN?`morale ${dm>=0?'+':''}${fx(dm,1)}`:`moral ${dm>=0?'+':''}${fx(dm,1)}`));
  (G.cdLog=G.cdLog||[]).unshift({k:C.k,d:C.d,end:G.day,gr,avg:Math.round(avg),mt:{...M},cost:C.cost,out});if(G.cdLog.length>6)G.cdLog.pop();
  G.cd=null;tl(gr<='B'?'star':'bad',(LANG_EN?`${T.n}: crisis grade ${gr}`:`${T.n}: kriz notu ${gr}`));
  news((LANG_EN?`Crisis closed: ${T.n}. Grade ${gr} (average trust ${Math.round(avg)}): ${out.join(', ')}.`:`Kriz kapandı: ${T.n}. Not ${gr} (ortalama güven ${Math.round(avg)}): ${out.join(', ')}.`),gr<='C'?'good':'bad',true);
  UI.cdRes=G.cdLog[0];if(UI.modal&&UI.modal.kind==='cdesk')renderModal();}
function cdAct(a,ds){if(a==='cdpick'){const keep=UI.modal&&UI.modal.kind==='cdesk';cdPick(+ds.i);if(!G.cd&&keep){UI.force=true;renderModal();}}
  else if(a==='cdopen'){if(G.cd&&G.cd.wait)cdOpen();}
  else if(a==='cdclose'){UI.cdRes=null;closeModal();if(G.prevSpeed&&!G.over&&!G.pending&&!cdWait())G.speed=G.prevSpeed;}}
/* ---- görünüm ---- */
const cdArrow=v=>v>=10?'↑↑':v>0?'↑':v<=-10?'↓↓':v<0?'↓':'';
function cdMeters(M){return `<div class="cd-m">${CD_K.map(k=>`<div class="cd-mr"><span class="small">${CD_N[k]}</span><span class="cd-bar"><i class="${M[k]<40?'bad':M[k]>=60?'ok':''}" style="width:${M[k]}%"></i></span><b class="num small">${Math.round(M[k])}</b></div>`).join('')}</div>`;}
function vCdesk(){const R=UI.cdRes;
  if(R&&!G.cd){const T=CD_T[R.k];return (LANG_EN?`<div class="eyebrow">Crisis desk · outcome</div><h2>${esc(T.n)} · grade ${R.gr}</h2>${cdMeters(R.mt)}<p class="small">Average trust ${R.avg}. ${esc(R.out.join(', '))}. Total cost of the crisis ${money(R.cost)}.</p><div class="row"><button class="btn primary" data-act="cdclose">Close</button></div>`:`<div class="eyebrow">Kriz masası · sonuç</div><h2>${esc(T.n)} · not ${R.gr}</h2>${cdMeters(R.mt)}<p class="small">Ortalama güven ${R.avg}. ${esc(R.out.join(', '))}. Krizin toplam maliyeti ${money(R.cost)}.</p><div class="row"><button class="btn primary" data-act="cdclose">Kapat</button></div>`);}
  const C=G.cd;if(!C)return (LANG_EN?"<p class=\"small muted\">No crisis right now.</p>":'<p class="small muted">Şu an kriz yok.</p>');const T=CD_T[C.k],R2=T.r[C.round]||[];
  const log=C.log.length?`<div class="col" style="gap:3px">${C.log.map(x=>`<div class="small"><span class="muted">•</span> ${esc(x.t)} <span class="muted">${Object.entries(x.d||{}).filter(([,v])=>v).map(([k,v])=>`${CD_N[k]} ${v>0?'+':''}${v}`).join(' · ')}</span></div>`).join('')}</div>`:'';
  return (LANG_EN?`<div class="eyebrow">Crisis desk · Round ${C.round+1}/3 · ${CD_RN[C.round]}</div><h2>${esc(T.n)}</h2><p>${esc(C.b)}</p>
    ${cdMeters(C.mt)}${log}
    ${C.wait?`<div class="col">${R2.map((o,i)=>{const c=o.c?Math.round(o.c(C)):0;return `<button class="opt" data-act="cdpick" data-i="${i}" ${c>G.cash?'disabled':''}><b>${esc(o.t)}${c?` · ${money(c)}`:''}</b><span class="cd-h">${CD_K.filter(k=>o.d[k]).map(k=>`<span class="${o.d[k]>0?'pos':'neg'}">${CD_N[k]} ${cdArrow(o.d[k])}</span>`).join(' ')}</span></button>`;}).join('')}</div>
      <div class="row between" style="gap:8px;flex-wrap:wrap"><span class="small muted">If you don't decide within ${10-(G.day-C.rd)} days, you're considered to have stayed silent.</span><button class="btn sm ghost" data-act="cdclose">Decide later</button></div>`
      :`<p class="small muted">Next stage in ${C.next-G.day} days.</p><div class="row"><button class="btn" data-act="cdclose">Close</button></div>`}`:`<div class="eyebrow">Kriz masası · Tur ${C.round+1}/3 · ${CD_RN[C.round]}</div><h2>${esc(T.n)}</h2><p>${esc(C.b)}</p>
    ${cdMeters(C.mt)}${log}
    ${C.wait?`<div class="col">${R2.map((o,i)=>{const c=o.c?Math.round(o.c(C)):0;return `<button class="opt" data-act="cdpick" data-i="${i}" ${c>G.cash?'disabled':''}><b>${esc(o.t)}${c?` · ${money(c)}`:''}</b><span class="cd-h">${CD_K.filter(k=>o.d[k]).map(k=>`<span class="${o.d[k]>0?'pos':'neg'}">${CD_N[k]} ${cdArrow(o.d[k])}</span>`).join(' ')}</span></button>`;}).join('')}</div>
      <div class="row between" style="gap:8px;flex-wrap:wrap"><span class="small muted">${10-(G.day-C.rd)} gün içinde karar vermezsen sessiz kalmış sayılırsın.</span><button class="btn sm ghost" data-act="cdclose">Sonra karar ver</button></div>`
      :`<p class="small muted">Sıradaki aşama ${C.next-G.day} gün sonra.</p><div class="row"><button class="btn" data-act="cdclose">Kapat</button></div>`}`);}
const cdBtn=()=>cdWait()?(LANG_EN?`<button class="tk-dec cd-btn" data-act="cdopen" aria-label="Crisis desk awaiting a decision">Crisis desk</button>`:`<button class="tk-dec cd-btn" data-act="cdopen" aria-label="Kriz masası karar bekliyor">Kriz masası</button>`):'';
