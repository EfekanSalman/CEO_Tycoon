/* ============================== PR CRISES & PRESS ============================== */
const newPrc=()=>({cr:[],log:[],ag:0,last:-999,lastConf:-999,lies:[],prom:[]});
const PR_AG=[{n:(LANG_EN?"No":'Yok'),c:0},{n:(LANG_EN?"Boutique agency":'Butik ajans'),c:60000},{n:(LANG_EN?"Global agency":'Küresel ajans'),c:180000}];
const prAgCost=()=>PR_AG[G.prc?G.prc.ag:0].c*infl();
const prPick=(arr)=>arr[Math.floor(Math.random()*arr.length)];
const HWDEV=p=>isHW(p)&&p.cat!=='cpu';
const PR_TYPES={
  battery:{w:3,ok:()=>myActive().some(p=>HWDEV(p)&&p.sr>200),fault:0.6,
    mk(){const p=prPick(myActive().filter(p=>HWDEV(p)&&p.sr>200));return {pid:p.id,n:(LANG_EN?`${p.name} fire claims`:`${p.name} alev aldı iddiası`),b:(LANG_EN?`Videos showing ${p.name} devices overheating and catching fire while charging are spreading on social media.`:`Sosyal medyada ${p.name} cihazlarının şarj olurken ısınıp alev aldığını gösteren videolar yayılıyor.`)};},
    comp:{n:(LANG_EN?"Free replacement program":'Ücretsiz değişim programı'),d:(LANG_EN?"Replace affected devices free of charge.":'Etkilenen cihazları ücretsiz değiştir.'),cost:c=>{const p=prod(c.pid);return p?Math.max(50000,p.sr*p.price*0.25):200000;}}},
  privacy:{w:3,ok:()=>myActive().some(p=>!HW.includes(p.cat)&&p.units>50000),fault:0.5,
    mk(){const p=prPick(myActive().filter(p=>!HW.includes(p.cat)&&p.units>50000));const br=G.cyber&&G.cyber.log.some(l=>!l.ok&&G.day-l.d<120);return {pid:p.id,n:(LANG_EN?`${p.name} user data scandal`:`${p.name} kullanıcı verisi skandalı`),b:(LANG_EN?`A news site claims ${p.name} user data was processed without consent.${br?" A recent cyberattack lends weight to the claims.":''}`:`Bir haber sitesi ${p.name} kullanıcılarının verilerinin izinsiz işlendiğini iddia ediyor.${br?' Yakın zamandaki siber saldırı iddiaları güçlendiriyor.':''}`),fault:br?0.85:null};},
    comp:{n:(LANG_EN?"Compensate users":'Kullanıcılara telafi'),d:(LANG_EN?"One month of free service for affected users plus an independent audit.":'Etkilenen kullanıcılara bir ay ücretsiz hizmet ve bağımsız denetim.'),cost:c=>{const p=prod(c.pid);return p?Math.max(50000,p.units*revPerUser(p)*0.6):150000;}}},
  labor:{w:2,ok:()=>G.emps.length>=15&&(strikeOn()||G.emps.reduce((a,e)=>a+e.morale,0)/G.emps.length<52),fault:0.7,
    mk(){return {n:(LANG_EN?"Employee exposé":'Çalışanlardan ifşa'),b:(LANG_EN?`Former and current employees published a letter describing a culture of overtime and pressure at ${G.name}.`:`Eski ve şimdiki çalışanlar ${G.name}'daki fazla mesai ve baskı kültürünü anlatan bir mektup yayımladı.`)};},
    comp:{n:(LANG_EN?"Workplace reform":'Çalışma koşulları reformu'),d:(LANG_EN?"Independent review, overtime cap and bonuses. Team morale rises too.":'Bağımsız inceleme, fazla mesai sınırı ve ikramiye. Ekip morali de yükselir.'),cost:()=>G.emps.reduce((a,e)=>a+e.salary,0)*0.4}},
  supply:{w:2,ok:()=>Object.values(G.sup||{}).some(id=>{const sp=SUPD[id];return sp&&!sp.own&&(sp.region==='cin'||sp.region==='vietnam');})&&myActive().some(HWDEV),fault:0.4,
    mk(){const sp=SUPPLIERS.filter(x=>G.sup[x.cat]===x.id&&(x.region==='cin'||x.region==='vietnam'));const x=prPick(sp)||{n:(LANG_EN?"a supplier":'bir tedarikçi')};return {n:(LANG_EN?`Labor rights claims at a supplier`:`Tedarikçide işçi hakları iddiası`),b:(LANG_EN?`A human rights group documented harsh working conditions at the factories of your parts supplier ${x.n}.`:`Bir insan hakları örgütü, parça tedarikçin ${x.n} fabrikalarında ağır çalışma koşulları olduğunu belgeledi.`)};},
    comp:{n:(LANG_EN?"Supply chain audit":'Tedarik zinciri denetimi'),d:(LANG_EN?"Independent audit program across all suppliers.":'Bütün tedarikçilerde bağımsız denetim programı.'),cost:()=>500000*infl()}},
  ceo:{w:2,ok:()=>G.brand>15,fault:0.5,
    mk(){return {n:(LANG_EN?"CEO interview sparks backlash":'CEO\'nun röportajı tepki çekti'),b:(LANG_EN?`Your remark "${prPick(["If you don't work weekends, you're not an entrepreneur","Our rivals' customers are a bit naive","Privacy is an overrated concept","If our prices are too high, don't buy"])}" on a podcast was taken out of context and went viral.`:`Bir podcast'te söylediğin "${prPick(['Hafta sonu çalışmayan girişimci değildir','Rakiplerimizin müşterileri biraz saf','Gizlilik abartılan bir kavram','Fiyatlarımız pahalıysa almasınlar'])}" sözleri bağlamından koparılarak yayıldı.`)};},
    comp:{n:(LANG_EN?"Donation & volunteering program":'Bağış ve gönüllülük programı'),d:(LANG_EN?"A donation to a relevant nonprofit and company-wide volunteering.":'İlgili bir sivil topluma bağış ve şirket çapında gönüllülük.'),cost:()=>200000*infl()}},
  ai:{w:3,ok:()=>myActive('ai').some(p=>p.units>10000),fault:0.8,
    mk(){const p=prPick(myActive('ai').filter(p=>p.units>10000));return {pid:p.id,n:(LANG_EN?`${p.name} gave inappropriate answers`:`${p.name} uygunsuz yanıtlar verdi`),b:(LANG_EN?`Users are sharing screenshots of the ${p.name} assistant giving dangerous and biased answers.`:`Kullanıcılar ${p.name} asistanının tehlikeli ve taraflı yanıtlar verdiği ekran görüntülerini paylaşıyor.`)};},
    comp:{n:(LANG_EN?"Fix the model and compensate subscribers":'Modeli düzelt ve abonelere telafi'),d:(LANG_EN?"Grow the safety team and give subscribers a month of free service.":'Güvenlik ekibini büyüt, abonelere bir ay ücretsiz hizmet ver.'),cost:c=>{const p=prod(c.pid);return p?Math.max(50000,p.units*p.price*0.5):150000;}}},
  obsol:{w:1,ok:()=>myActive().some(p=>HWDEV(p)&&(p.updN||0)>=2),fault:0.3,
    mk(){const p=prPick(myActive().filter(p=>HWDEV(p)&&(p.updN||0)>=2));return {pid:p.id,n:(LANG_EN?`Planned obsolescence claims about ${p.name}`:`${p.name} için planlı eskitme iddiası`),b:(LANG_EN?`A tech channel claims ${p.name} updates deliberately slow down older devices.`:`Bir teknoloji kanalı, ${p.name} güncellemelerinin eski cihazları kasıtlı olarak yavaşlattığını iddia ediyor.`)};},
    comp:{n:(LANG_EN?"Free battery replacement":'Ücretsiz batarya değişimi'),d:(LANG_EN?"Free battery and performance update for owners of older devices.":'Eski cihaz sahiplerine ücretsiz batarya ve performans güncellemesi.'),cost:c=>{const p=prod(c.pid);return p?Math.max(50000,p.sr*p.price*0.12):150000;}}},
  iotbot:{w:3,ok:()=>myActive('iot').some(p=>p.sr>500)&&!has('sec1'),fault:0.9,
    mk(){const p=prPick(myActive('iot').filter(p=>p.sr>500));return {pid:p.id,n:(LANG_EN?`${p.name} devices turned into a botnet`:`${p.name} cihazları botnete dönüştü`),b:(LANG_EN?`Hackers hijacked vulnerable ${p.name} devices and used them in a major cyberattack. Users are worried about their home security.`:`Hackerlar güvenlik açığı olan ${p.name} cihazlarını ele geçirip büyük bir siber saldırıda kullandı. Kullanıcılar evlerinin güvenliğinden endişeli.`)};},
    comp:{n:(LANG_EN?"Free security update and audit":'Ücretsiz güvenlik güncellemesi ve denetim'),d:(LANG_EN?"Emergency software update for all devices and an independent security audit.":'Bütün cihazlara acil yazılım güncellemesi, bağımsız güvenlik denetimi.'),cost:c=>{const p=prod(c.pid);return p?Math.max(80000,p.sr*p.price*0.15):150000;}}},
  lie:{w:0,ok:()=>false,fault:1,mk(){return {n:(LANG_EN?"Your lie came out":'Yalanın ortaya çıktı'),b:(LANG_EN?"Journalists documented that what you told the press wasn't true.":'Gazeteciler basına söylediklerinin doğru olmadığını belgeledi.')};},
    comp:{n:(LANG_EN?"Public apology and compensation":'Kamuoyundan açık özür ve telafi'),d:(LANG_EN?"Full-page apology ads and compensation for those affected.":'Tam sayfa ilanlarla özür, etkilenenlere telafi.'),cost:()=>400000*infl()}},
  promise:{w:0,ok:()=>false,fault:1,mk(){return {n:(LANG_EN?"Broken promise":'Tutulmayan söz'),b:(LANG_EN?"The promise you made at the press conference wasn't kept; journalists are pointing it out.":'Basın toplantısında verdiğin söz tutulmadı; gazeteciler bunu hatırlatıyor.')};},
    comp:{n:(LANG_EN?"Apology and compensation":'Özür ve telafi'),d:(LANG_EN?"A public apology for the delay and a small gesture for customers.":'Gecikme için açık özür ve müşterilere küçük bir jest.'),cost:()=>150000*infl()}},
};
function prStart(t,extra){
  const T=PR_TYPES[t],x=T.mk(),P=G.prc;
  const heat=clamp((rnd(30,55)+G.brand/5+(extra&&extra.heat||0))*(ceoSk('l3')?0.85:1),15,95);
  const c={id:nid(),t,n:x.n,b:x.b,pid:x.pid||null,d:G.day,heat,peak:heat,fault:Math.random()<(x.fault!=null?x.fault:T.fault),known:false,inv:0,resp:{},b0:G.brand,...(extra&&extra.f||{})};
  if(t==='lie'||t==='promise'){c.fault=true;c.known=true;c.b=extra&&extra.b||c.b;}
  P.cr.push(c);P.last=G.day;
  G.brand=clamp(G.brand-heat/22,0,100);if(G.life&&boardOn())G.life.conf=clamp(G.life.conf-heat/18,0,100);
  news((LANG_EN?`Crisis: ${c.n}. ${c.b}`:`Kriz: ${c.n}. ${c.b}`),'bad',true);tl('bad',c.n);sfx('alarm');
  if(!G.over&&!UI.modal){G.prevSpeed=G.speed||1;G.speed=0;UI.prc=c.id;openModal('crisis');}
  return c;
}
const prAct=()=>G.prc?G.prc.cr.filter(c=>!c.end):[];
function prMult(p){let m=1;for(const c of prAct()){m*=c.pid===p.id?1-c.heat/250:1-c.heat/700;}return Math.max(0.5,m);}
const prResp=c=>Object.keys(c.resp).length>0;
function prCool(c,k,dh){c.heat=clamp(c.heat+dh*(dh<0?1+0.25*G.prc.ag:1),0,100);c.peak=Math.max(c.peak,c.heat);c.resp[k]=G.day;}
function prLie(c,sev,why){G.prc.lies.push({d:G.day,due:G.day+rint(30,150),sev,why});}
function prDaily(){
  const P=G.prc;if(!P)return;
  for(const c of P.cr){if(c.end)continue;const age=G.day-c.d;
    if(age<=14&&!prResp(c))c.heat=Math.min(100,c.heat+1.2*(1-0.25*P.ag));
    c.heat*=0.97;c.peak=Math.max(c.peak,c.heat);
    G.brand=clamp(G.brand-c.heat/1600,0,100);
    if(c.t==='labor')for(const e of G.emps)e.morale=Math.max(0,e.morale-c.heat/1500);
    if(c.inv&&G.day>=c.inv&&!c.known){c.known=true;news((LANG_EN?`Internal investigation complete: ${c.n} — ${c.fault?"the claims are largely true; the company was at fault.":"the claims are largely unfounded."}`:`İç soruşturma tamamlandı: ${c.n} — ${c.fault?'iddialar büyük ölçüde doğru, şirket hatalı.':'iddialar büyük ölçüde asılsız.'}`),c.fault?'bad':'good',true);}
    if(c.heat<4&&!P.prom.some(x=>x.cid===c.id)){c.end=G.day;P.log.unshift({n:c.n,t:c.t,d:c.d,end:G.day,peak:Math.round(c.peak),brand:Math.round((c.b0-G.brand)*10)/10,resp:Object.keys(c.resp),fault:c.fault,known:c.known});if(P.log.length>20)P.log.pop();news((LANG_EN?`${c.n} is no longer in the news.`:`${c.n} gündemden düştü.`),'good');}}
  P.cr=P.cr.filter(c=>!c.end||G.day-c.end<1);
  for(const l of P.lies.filter(l=>G.day>=l.due)){P.lies=P.lies.filter(x=>x!==l);if(Math.random()<0.55)prStart('lie',{heat:15*l.sev,b:(LANG_EN?`Journalists documented that your statement that ${l.why} was false.`:`Gazeteciler ${l.why} yönündeki açıklamanın doğru olmadığını belgeledi.`)});}
  for(const pr of P.prom.filter(x=>G.day>=x.due||PROM[x.k].done(x))){P.prom=P.prom.filter(x=>x!==pr);
    if(PROM[pr.k].done(pr)){news((LANG_EN?`You kept your promise to the press: ${pr.txt}.`:`Basına verdiğin sözü tuttun: ${pr.txt}.`),'good');G.brand=clamp(G.brand+1,0,100);}
    else prStart('promise',{heat:-8,b:(LANG_EN?`At the press conference you said "${pr.txt}"; the promise wasn't kept.`:`Basın toplantısında "${pr.txt}" demiştin; söz tutulmadı.`)});}
}
const PROM={
  comp:{done:x=>{const c=G.prc.cr.find(y=>y.id===x.cid);return !!(c&&c.resp.comp);}},
  launch:{done:x=>G.products.some(p=>p.owner==='P'&&p.launch>x.d&&!p.acqId)},
  green:{done:()=>!!G.esg&&(G.esg.off>=0.5||G.esg.score>=60)},
  nolay:{done:x=>G.day>=x.due&&!((G.layoff||0)>x.l+1.5)},
};
function prMonthly(){
  const P=G.prc;if(!P)return;
  if(P.ag)spend(prAgCost(),'other');
  for(const pr of P.prom)if(pr.k==='nolay'&&(G.layoff||0)>pr.l+1.5){P.prom=P.prom.filter(x=>x!==pr);prStart('lie',{heat:15,b:(LANG_EN?"You said \"There will be no layoffs,\" but you've made new layoffs.":'"İşten çıkarma olmayacak" demiştin ama yeni çıkarmalar yaptın.')});break;}
  if(prAct().length>=2||G.day-P.last<75||G.day<200||G.over)return;
  const vis=clamp(G.brand/40,0.3,2)*(1-0.2*P.ag)*(G.mods&&G.mods.ev?G.mods.ev/0.42:1);
  if(Math.random()>0.045*vis)return;
  const ok=Object.entries(PR_TYPES).filter(([k,T])=>T.w&&T.ok()&&!prAct().some(c=>c.t===k));if(!ok.length)return;
  let r=Math.random()*ok.reduce((a,[,T])=>a+T.w,0);for(const [k,T] of ok){r-=T.w;if(r<=0){prStart(k);return;}}
}
/* ---- press conference ---- */
const PQ_CRISIS=[
  c=>({q:(LANG_EN?`What do you have to say about "${c.n}"? Are the claims true?`:`"${c.n}" hakkında ne söyleyeceksiniz? İddialar doğru mu?`),o:[
    {t:(LANG_EN?"We made a mistake, and we take responsibility.":'Hata yaptık, sorumluluğu alıyoruz.'),fx:{h:c.fault?-14:-5,b:c.fault?0.5:-0.5},r:c.fault?(LANG_EN?"Journalists appreciated your honesty.":'Gazeteciler dürüstlüğünü takdir etti.'):(LANG_EN?"An unnecessary apology: some read it as an admission of guilt.":'Gereksiz bir özür: bazıları bunu suç itirafı gibi yorumladı.')},
    {t:(LANG_EN?"The claims are completely unfounded.":'İddialar tamamen asılsız.'),fx:{h:c.fault?-12:-16,lie:c.fault?2:0},r:c.fault?(LANG_EN?"The room went quiet. They're convinced, for now.":'Salon sessizleşti. Şimdilik ikna oldular.'):(LANG_EN?"Your evidence convinced the room.":'Elindeki kanıtlar salonu ikna etti.'),lieWhy:(LANG_EN?"the claims were unfounded":'iddiaların asılsız olduğu')},
    {t:(LANG_EN?"An internal investigation is underway; we'll share the results.":'İç soruşturma sürüyor, sonuçları paylaşacağız.'),fx:{h:-6},r:(LANG_EN?"A cautious answer; not very newsworthy.":'Temkinli bir cevap; haber değeri düşük.')}]}),
  c=>({q:(LANG_EN?"What will you do for affected customers and employees?":'Etkilenen müşteriler ve çalışanlar için ne yapacaksınız?'),o:[
    {t:(LANG_EN?"We'll compensate everyone affected within 30 days.":'Etkilenen herkese telafi edeceğiz, 30 gün içinde.'),fx:{h:-12,prom:'comp'},r:(LANG_EN?"A concrete promise. Journalists noted the timeline.":'Somut bir söz. Gazeteciler takvimi not aldı.')},
    {t:(LANG_EN?"We're reviewing our processes from the ground up.":'Süreçlerimizi baştan gözden geçiriyoruz.'),fx:{h:-6},r:(LANG_EN?"Seen as reasonable but vague.":'Makul ama belirsiz bulundu.')},
    {t:(LANG_EN?"There's nothing we need to do.":'Yapmamız gereken bir şey yok.'),fx:{h:c.fault?10:-2,b:c.fault?-1:0},r:c.fault?(LANG_EN?"Seen as arrogant; it made the headlines.":'Kibirli bulundu; manşetlere taşındı.'):(LANG_EN?"A firm stance; the crisis didn't grow.":'Kararlı bir duruş; kriz büyümedi.')}]}),
  c=>({q:(LANG_EN?"Who in management is responsible for this? Will you resign?":'Yönetim olarak bundan kim sorumlu? İstifa edecek misiniz?'),o:[
    {t:(LANG_EN?"I trust this team; we'll fix it together.":'Bu ekibe güveniyorum, birlikte düzelteceğiz.'),fx:{h:-4,mor:3},r:(LANG_EN?"The team saw you stand behind them.":'Ekip arkasında durduğunu gördü.')},
    {t:(LANG_EN?"Those responsible will be held accountable.":'Sorumlular hesap verecek.'),fx:{h:-8,mor:-4},r:(LANG_EN?"Tough but clear. Employees are uneasy.":'Sert ama net. Çalışanlar tedirgin.')},
    {t:(LANG_EN?"I don't take that question seriously.":'Bu soruyu ciddiye almıyorum.'),fx:{gamble:true},r:''}]}),
];
function pqFree(){
  const m=monthlyEst(),qs=[];
  if(m.profit<0)qs.push({q:(LANG_EN?"Your company is losing money. Are you running out of cash?":'Şirketiniz zarar ediyor. Nakitiniz tükeniyor mu?'),o:[
    {t:(LANG_EN?"We're investing in growth, and our plan is clear.":'Büyümeye yatırım yapıyoruz, planımız net.'),fx:{conf:3,b:0.3},r:(LANG_EN?"Investors loved that answer.":'Yatırımcılar bu cevabı sevdi.')},
    {t:(LANG_EN?"It's a tough period, but we're taking action.":'Zor bir dönem ama önlem alıyoruz.'),fx:{conf:2,mor:-2},r:(LANG_EN?"Seen as honest; some unease on the team.":'Dürüst bulundu; ekipte biraz tedirginlik.')},
    {t:(LANG_EN?"Nonsense. We'll report record profits this quarter.":'Saçmalık, bu çeyrek rekor kâr açıklayacağız.'),fx:{conf:5,lie:m.profit<-200000*infl()?2:1},r:(LANG_EN?"A bold claim. Journalists will be watching the numbers.":'Cesur bir iddia. Gazeteciler rakamları takip edecek.'),lieWhy:(LANG_EN?"upcoming record profits":'rekor kâr açıklanacağı')}]});
  if(G.projects.some(p=>!p.upd))qs.push({q:(LANG_EN?"When is your next product coming out?":'Sıradaki ürününüz ne zaman çıkıyor?'),o:[
    {t:(LANG_EN?"It'll be on the market within three months.":'Üç ay içinde piyasada olacak.'),fx:{hype:1.06,prom:'launch'},r:(LANG_EN?"It built excitement; the timeline was noted.":'Heyecan yarattı; takvim not alındı.')},
    {t:(LANG_EN?"When it's ready. It'll be a surprise.":'Hazır olduğunda. Sürpriz olacak.'),fx:{b:0.3},r:(LANG_EN?"It sparked curiosity.":'Merak uyandırdı.')},
    {t:(LANG_EN?"It'll crush our rivals.":'Rakiplerimizi ezecek.'),fx:{b:1,aggr:0.05},r:(LANG_EN?"It made headlines; rivals read it too.":'Manşet oldu; rakipler de okudu.')}]});
  const riv=liveComps().filter(c=>c.focus.some(f=>myActive(f).length)).sort((a,b)=>b.brand-a.brand)[0];
  if(riv)qs.push({q:(LANG_EN?`${riv.name} is putting pressure on you in the market. Are you worried?`:`${riv.name} pazarda sizi zorluyor. Endişeli misiniz?`),o:[
    {t:(LANG_EN?"Competition makes everyone better.":'Rekabet herkesi daha iyi yapıyor.'),fx:{b:0.5},r:(LANG_EN?"A mature answer.":'Olgun bir cevap.')},
    {t:(LANG_EN?"They're copying us.":'Onlar bizi kopyalıyor.'),fx:{gamble:true},r:''},
    {t:(LANG_EN?"You'll see the difference next year.":'Önümüzdeki yıl farkı göreceksiniz.'),fx:{mom:3,b:0.3},r:(LANG_EN?"The team loved that confidence.":'Ekip bu özgüveni sevdi.')}]});
  if((G.layoff||0)>2)qs.push({q:(LANG_EN?"Will there be more layoffs?":'Yeni işten çıkarmalar olacak mı?'),o:[
    {t:(LANG_EN?"If necessary, yes; we have to protect the company.":'Gerekirse evet; şirketi korumak zorundayız.'),fx:{conf:3,mor:-5},r:(LANG_EN?"Investors are happy; employees aren't.":'Yatırımcılar memnun, çalışanlar değil.')},
    {t:(LANG_EN?"No, that chapter is closed.":'Hayır, bu dönem kapandı.'),fx:{mor:5,prom:'nolay'},r:(LANG_EN?"Employees are relieved. Journalists noted your promise.":'Çalışanlar rahatladı. Gazeteciler sözünü not aldı.')},
    {t:(LANG_EN?"We don't comment on speculation.":'Spekülasyonlara yorum yapmıyoruz.'),fx:{mor:-1},r:(LANG_EN?"Seen as evasive.":'Kaçamak bulundu.')}]});
  if(G.esg&&G.esg.score<50&&years()>3)qs.push({q:(LANG_EN?"Your carbon emissions are above the industry average. What's your plan?":'Karbon salımınız sektör ortalamasının üstünde. Planınız ne?'),o:[
    {t:(LANG_EN?"We'll offset half our emissions within six months.":'Altı ay içinde emisyonumuzun yarısını dengeleyeceğiz.'),fx:{b:0.8,prom:'green'},r:(LANG_EN?"An ambitious promise; environmentalists will be watching.":'İddialı bir söz; çevreciler izleyecek.')},
    {t:(LANG_EN?"We're working on it.":'Üzerinde çalışıyoruz.'),fx:{},r:(LANG_EN?"Not newsworthy.":'Haber değeri yok.')},
    {t:(LANG_EN?"Our priority is the product, not the climate.":'Önceliğimiz ürün, iklim değil.'),fx:{b:-1.5,conf:1},r:(LANG_EN?"The European press reacted.":'Avrupa basını tepki gösterdi.')}]});
  if(G.union&&G.union.press>40)qs.push({q:(LANG_EN?"Your employees are unionizing. Are you against it?":'Çalışanlarınız sendikalaşıyor. Karşı mısınız?'),o:[
    {t:(LANG_EN?"We respect our employees' decision.":'Çalışanlarımızın kararına saygı duyarız.'),fx:{mor:4,b:0.5,conf:-2},r:(LANG_EN?"A measured message.":'Ilımlı bir mesaj.')},
    {t:(LANG_EN?"We don't need a union; our door is open.":'Sendikaya ihtiyacımız yok, kapımız açık.'),fx:{mor:-3,conf:2},r:(LANG_EN?"The union will use this in its campaign.":'Sendika bunu kampanyasında kullanacak.')},
    {t:(LANG_EN?"No comment.":'Yorum yok.'),fx:{},r:(LANG_EN?"Journalists weren't satisfied.":'Gazeteciler tatmin olmadı.')}]});
  if(myActive('ai').length)qs.push({q:(LANG_EN?"Will your AI take people's jobs?":'Yapay zekânız insanların işini elinden alacak mı?'),o:[
    {t:(LANG_EN?"We build tools that empower people.":'İnsanları güçlendiren araçlar yapıyoruz.'),fx:{b:0.5},r:(LANG_EN?"A reassuring answer.":'Güven veren bir cevap.')},
    {t:(LANG_EN?"Yes, and it's inevitable.":'Evet, ve bu kaçınılmaz.'),fx:{gamble:true},r:''},
    {t:(LANG_EN?"Ask the regulators that question.":'Bu soruyu düzenleyicilere sorun.'),fx:{b:-0.3},r:(LANG_EN?"Seen as evasive.":'Kaçamak bulundu.')}]});
  qs.push({id:'five',q:(LANG_EN?"Where do you see your company in five years?":'Beş yıl sonra şirketinizi nerede görüyorsunuz?'),o:[
    {t:(LANG_EN?"As the world's most valuable tech company.":'Dünyanın en değerli teknoloji şirketi olarak.'),fx:{b:0.8,conf:2,mom:2},r:(LANG_EN?"A big vision; it made headlines.":'Büyük vizyon; manşet oldu.')},
    {t:(LANG_EN?"Playing a bigger part in our customers' lives.":'Müşterilerimizin hayatında daha fazla yer kaplayarak.'),fx:{b:0.5},r:(LANG_EN?"A warm answer.":'Sıcak bir cevap.')},
    {t:(LANG_EN?"Nobody can know that.":'Bunu kimse bilemez.'),fx:{},r:(LANG_EN?"Realistic but boring.":'Gerçekçi ama sıkıcı.')}]});
  for(let i=qs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[qs[i],qs[j]]=[qs[j],qs[i]];}
  const last=qs.findIndex(q=>q.id==='five');if(last>=0&&qs.length>3)qs.splice(last,1);
  return qs.slice(0,3);
}
const prConfCost=()=>50000*infl();
function prConfStart(cid){
  const c=cid?G.prc.cr.find(x=>x.id===cid):null;
  const qs=c?PQ_CRISIS.map(f=>f(c)):pqFree();
  spend(prConfCost(),'other');G.prc.lastConf=G.day;if(c)c.resp.conf=G.day;
  UI.ps={cid:c?c.id:null,qs,i:0,log:[],h:0,b:0};if(G.speed){G.prevSpeed=G.speed;G.speed=0;}openModal('presser');
}
function prAnswer(i){
  const S2=UI.ps;if(!S2)return;const q=S2.qs[S2.i],o=q&&q.o[i];if(!o)return;const f={...o.fx};let r=o.r;
  const c=S2.cid?G.prc.cr.find(x=>x.id===S2.cid):null;
  if(f.gamble){if(Math.random()<0.4){f.h=-12;f.b=1;r=(LANG_EN?"Your answer went viral; people loved your confidence.":'Cevabın viral oldu; insanlar özgüvenini sevdi.');}else{f.h=12;f.b=-1.5;r=(LANG_EN?"Seen as arrogant; the video is being shared everywhere.":'Kibirli bulundu; video her yerde paylaşılıyor.');}if(!c)f.h=0;}
  const mk=G.emps.filter(e=>e.role==='mkt'&&!e.leave).reduce((a,e)=>a+e.skill,0),sk=1+Math.min(0.3,mk/150);
  if(c&&f.h){const dh=f.h<0?f.h*sk:f.h;prCool(c,'conf',dh);S2.h+=dh;}
  if(f.b){const db=f.b>0?f.b*sk:f.b;G.brand=clamp(G.brand+db,0,100);S2.b+=db;}
  if(f.conf&&G.life&&boardOn())G.life.conf=clamp(G.life.conf+f.conf,0,100);
  if(f.mor)for(const e of G.emps)e.morale=clamp(e.morale+f.mor,0,100);
  if(f.mom)G.momentum=(G.momentum||0)+f.mom;
  if(f.aggr)for(const x of liveComps())x.aggr=Math.min(0.95,x.aggr+f.aggr);
  if(f.hype)for(const p of myActive())awHype(p,f.hype,30);
  if(f.lie)prLie(c,f.lie,o.lieWhy||(LANG_EN?"your statement":'açıklamanın'));
  if(f.prom){const P=G.prc,txt=f.prom==='comp'?(LANG_EN?"compensation for those affected within 30 days":'etkilenenlere 30 gün içinde telafi'):f.prom==='launch'?(LANG_EN?"a new product within three months":'üç ay içinde yeni ürün'):f.prom==='green'?(LANG_EN?"offsetting half of emissions in six months":'altı ayda emisyonun yarısını dengelemek'):(LANG_EN?"no new layoffs":'yeni işten çıkarma olmayacağı');
    P.prom.push({k:f.prom,d:G.day,due:G.day+(f.prom==='comp'?30:f.prom==='launch'?90:f.prom==='green'?180:180),cid:c?c.id:null,l:G.layoff||0,txt});}
  S2.log.push({q:q.q,a:o.t,r,tone:(f.h||0)<0||(f.b||0)>0?'good':(f.h||0)>0||(f.b||0)<0?'bad':''});S2.i++;
  if(S2.i>=S2.qs.length&&!c&&S2.b>=1)for(const p of myActive())awHype(p,1.05,30);
}
function vPR(){
  const P=G.prc,act=prAct(),cc=prConfCost(),cd=60-(G.day-P.lastConf);
  const cards=act.map(c=>{const T=PR_TYPES[c.t],comp=T.comp,cost=comp?comp.cost(c):0,p=c.pid?prod(c.pid):null;
    return (LANG_EN?`<div class="proj col" style="gap:8px;border-color:var(--bad)"><div class="row between"><b>${esc(c.n)}</b><span class="chip ${c.heat>50?'st-bad':c.heat>25?'st-warn':'st-mute'}">Heat ${Math.round(c.heat)}</span></div>
      <div class="bar"><i style="width:${c.heat}%;background:${c.heat>50?'var(--bad)':'var(--warn)'}"></i></div>
      <div class="small">${esc(c.b)}</div>
      <div class="small muted">Day ${G.day-c.d} · ${p?`${esc(p.name)} ${Math.round(c.heat/2.5)}% less appealing, other products`:"All products"} ${Math.round(c.heat/7)}% less appealing. ${c.known?(c.fault?"<b class=\"neg\">Investigation: the company was at fault.</b>":"<b class=\"pos\">Investigation: the allegations are unfounded.</b>"):c.inv?`The internal investigation concludes in ${Math.max(0,c.inv-G.day)} days.`:"You don't know the truth yet."}</div>
      <div class="row" style="gap:6px;flex-wrap:wrap">
        ${c.known||c.inv?'':`<button class="btn sm" data-act="prinv" data-id="${c.id}" ${G.cash<30000*infl()?'disabled':''}>Internal investigation · ${money(30000*infl())} · 7 days</button>`}
        ${c.resp.st?'':`<button class="btn sm" data-act="prst" data-id="${c.id}" data-k="sorry">Issue an apology</button><button class="btn sm" data-act="prst" data-id="${c.id}" data-k="deny">Deny it</button>`}
        ${c.resp.conf?'':`<button class="btn sm primary" data-act="prconf" data-id="${c.id}" ${G.cash<cc?'disabled':''}>Press conference · ${money(cc)}</button>`}
        ${c.resp.comp||!comp?'':`<button class="btn sm" data-act="prcomp" data-id="${c.id}" ${G.cash<cost?'disabled':''} title="${esc(comp.d)}">${esc(comp.n)} · ${money(cost)}</button>`}
        ${c.resp.fire||G.emps.filter(e=>!e.founder).length<10?'':`<button class="btn sm" data-act="prfire" data-id="${c.id}">Dismiss an executive</button>`}
      </div>${Object.keys(c.resp).length?`<div class="small muted">Your responses: ${Object.keys(c.resp).map(k=>({st:"statement",conf:"press conference",comp:'telafi',fire:"dismissal",inv:"investigation"}[k]||k)).join(', ')}</div>`:''}</div>`:`<div class="proj col" style="gap:8px;border-color:var(--bad)"><div class="row between"><b>${esc(c.n)}</b><span class="chip ${c.heat>50?'st-bad':c.heat>25?'st-warn':'st-mute'}">Gündem ${Math.round(c.heat)}</span></div>
      <div class="bar"><i style="width:${c.heat}%;background:${c.heat>50?'var(--bad)':'var(--warn)'}"></i></div>
      <div class="small">${esc(c.b)}</div>
      <div class="small muted">${G.day-c.d}. gün · ${p?`${esc(p.name)} %${Math.round(c.heat/2.5)} daha az çekici, diğer ürünlerin`:'Bütün ürünlerin'} %${Math.round(c.heat/7)} daha az çekici. ${c.known?(c.fault?'<b class="neg">Soruşturma: şirket hatalı.</b>':'<b class="pos">Soruşturma: iddialar asılsız.</b>'):c.inv?`İç soruşturma ${Math.max(0,c.inv-G.day)} gün sonra sonuçlanacak.`:'Gerçeği henüz bilmiyorsun.'}</div>
      <div class="row" style="gap:6px;flex-wrap:wrap">
        ${c.known||c.inv?'':`<button class="btn sm" data-act="prinv" data-id="${c.id}" ${G.cash<30000*infl()?'disabled':''}>İç soruşturma · ${money(30000*infl())} · 7 gün</button>`}
        ${c.resp.st?'':`<button class="btn sm" data-act="prst" data-id="${c.id}" data-k="sorry">Özür açıklaması</button><button class="btn sm" data-act="prst" data-id="${c.id}" data-k="deny">Yalanla</button>`}
        ${c.resp.conf?'':`<button class="btn sm primary" data-act="prconf" data-id="${c.id}" ${G.cash<cc?'disabled':''}>Basın toplantısı · ${money(cc)}</button>`}
        ${c.resp.comp||!comp?'':`<button class="btn sm" data-act="prcomp" data-id="${c.id}" ${G.cash<cost?'disabled':''} title="${esc(comp.d)}">${esc(comp.n)} · ${money(cost)}</button>`}
        ${c.resp.fire||G.emps.filter(e=>!e.founder).length<10?'':`<button class="btn sm" data-act="prfire" data-id="${c.id}">Bir yöneticiyi görevden al</button>`}
      </div>${Object.keys(c.resp).length?`<div class="small muted">Yaptıkların: ${Object.keys(c.resp).map(k=>({st:'açıklama',conf:'basın toplantısı',comp:'telafi',fire:'görevden alma',inv:'soruşturma'}[k]||k)).join(', ')}</div>`:''}</div>`);}).join('');
  const proms=P.prom.map(x=>(LANG_EN?`<li>${esc(x.txt)} <span class="muted">· ${Math.max(0,x.due-G.day)} days left</span></li>`:`<li>${esc(x.txt)} <span class="muted">· ${Math.max(0,x.due-G.day)} gün kaldı</span></li>`)).join('');
  const log=P.log.slice(0,8).map(l=>(LANG_EN?`<tr><td>${esc(l.n)}</td><td class="num">${fmtDate(l.d)}</td><td class="r num">${l.end-l.d} days</td><td class="r num">${l.peak}</td><td class="r num ${l.brand>0?'neg':''}">${l.brand>0?'−'+fx(l.brand,1):'—'}</td><td class="small">${l.resp.map(k=>({st:"statement",conf:"press conf.",comp:'telafi',fire:"dismissal",inv:"investigation"}[k]||k)).join(', ')||"stayed silent"}</td></tr>`:`<tr><td>${esc(l.n)}</td><td class="num">${fmtDate(l.d)}</td><td class="r num">${l.end-l.d} gün</td><td class="r num">${l.peak}</td><td class="r num ${l.brand>0?'neg':''}">${l.brand>0?'−'+fx(l.brand,1):'—'}</td><td class="small">${l.resp.map(k=>({st:'açıklama',conf:'basın t.',comp:'telafi',fire:'görevden alma',inv:'soruşturma'}[k]||k)).join(', ')||'sessiz kaldın'}</td></tr>`)).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Public relations${helpBtn('pr')}</h2><span class="sub">${act.length?act.length+" active crises":"All quiet"}</span></div>
    <div class="kpis"><div class="kpi"><span>Active crises</span><b class="${act.length?'neg':''}">${act.length}</b></div><div class="kpi"><span>Pending promises</span><b>${P.prom.length}</b></div><div class="kpi"><span>Crises weathered</span><b>${P.log.length}</b></div><div class="kpi"><span>PR agency</span><b>${PR_AG[P.ag].n}</b></div></div>
    <div class="pb small muted">The bigger your brand, the more eyes are on you. Crises grow for the first two weeks, then slowly fade; while they last, your brand erodes and your products sell less. An internal investigation reveals the truth: if you deny it while at fault, journalists may expose you months later.</div></section>
  ${act.length?`<section class="panel"><div class="ph"><h2>Active crises</h2></div><div class="pb"><div class="grid">${cards}</div></div></section>`:''}
  <section class="panel"><div class="ph"><h2>Press and agency</h2></div><div class="pb"><div class="grid3">
    <div class="proj col" style="gap:6px"><b>Press conference</b><div class="small muted">Answer three questions from journalists. If it goes well, your brand gets stronger and your products stay more appealing for a month. Promises you make are tracked.</div>
      <button class="btn sm primary" data-act="prconf" ${cd>0||G.cash<cc?'disabled':''}>${cd>0?`In ${cd} days`:"Host · "+money(cc)}</button></div>
    <div class="proj col" style="gap:6px"><b>PR agency</b><div class="small muted">Lowers the chance of crises, slows their growth in the first weeks, and boosts the effect of your responses.</div>
      <div class="row" style="gap:4px;flex-wrap:wrap">${PR_AG.map((a,i)=>`<button class="btn sm ${P.ag===i?'primary':'ghost'}" data-act="prag" data-i="${i}">${a.n}${a.c?' · '+money(a.c*infl())+'/ay':''}</button>`).join('')}</div></div>
    <div class="proj col" style="gap:6px"><b>Your promises</b>${proms?`<ul class="small" style="margin:0;padding-left:18px">${proms}</ul>`:"<div class=\"small muted\">You have no promises being tracked.</div>"}</div>
  </div></div></section>
  ${log?`<section class="panel"><div class="ph"><h2>Past crises</h2></div><div class="tw"><table><thead><tr><th>Crisis</th><th>Started</th><th class="r">Duration</th><th class="r">Peak</th><th class="r">Brand</th><th>Your response</th></tr></thead><tbody>${log}</tbody></table></div></section>`:''}`:`<section class="panel"><div class="ph"><h2>Halkla ilişkiler${helpBtn('pr')}</h2><span class="sub">${act.length?act.length+' aktif kriz':'Gündem sakin'}</span></div>
    <div class="kpis"><div class="kpi"><span>Aktif kriz</span><b class="${act.length?'neg':''}">${act.length}</b></div><div class="kpi"><span>Bekleyen söz</span><b>${P.prom.length}</b></div><div class="kpi"><span>Atlatılan kriz</span><b>${P.log.length}</b></div><div class="kpi"><span>Halkla ilişkiler ajansı</span><b>${PR_AG[P.ag].n}</b></div></div>
    <div class="pb small muted">Markan büyüdükçe gözler üzerinde olur. Krizler ilk iki hafta büyür, sonra yavaşça söner; sürdükçe markan erir ve ürünlerin daha az satar. İç soruşturma gerçeği gösterir: hatalıyken yalanlarsan gazeteciler aylar sonra ortaya çıkarabilir.</div></section>
  ${act.length?`<section class="panel"><div class="ph"><h2>Aktif krizler</h2></div><div class="pb"><div class="grid">${cards}</div></div></section>`:''}
  <section class="panel"><div class="ph"><h2>Basın ve ajans</h2></div><div class="pb"><div class="grid3">
    <div class="proj col" style="gap:6px"><b>Basın toplantısı</b><div class="small muted">Gazetecilerin üç sorusunu yanıtla. İyi geçerse marka güçlenir, ürünlerin bir ay daha çekici olur. Verdiğin sözler takip edilir.</div>
      <button class="btn sm primary" data-act="prconf" ${cd>0||G.cash<cc?'disabled':''}>${cd>0?`${cd} gün sonra`:'Düzenle · '+money(cc)}</button></div>
    <div class="proj col" style="gap:6px"><b>Halkla ilişkiler ajansı</b><div class="small muted">Kriz ihtimalini azaltır, krizlerin ilk haftalardaki büyümesini yavaşlatır ve yanıtlarının etkisini artırır.</div>
      <div class="row" style="gap:4px;flex-wrap:wrap">${PR_AG.map((a,i)=>`<button class="btn sm ${P.ag===i?'primary':'ghost'}" data-act="prag" data-i="${i}">${a.n}${a.c?' · '+money(a.c*infl())+'/ay':''}</button>`).join('')}</div></div>
    <div class="proj col" style="gap:6px"><b>Verdiğin sözler</b>${proms?`<ul class="small" style="margin:0;padding-left:18px">${proms}</ul>`:'<div class="small muted">Takip edilen bir sözün yok.</div>'}</div>
  </div></div></section>
  ${log?`<section class="panel"><div class="ph"><h2>Geçmiş krizler</h2></div><div class="tw"><table><thead><tr><th>Kriz</th><th>Başlangıç</th><th class="r">Süre</th><th class="r">En yüksek</th><th class="r">Marka</th><th>Yanıtın</th></tr></thead><tbody>${log}</tbody></table></div></section>`:''}`);
}

