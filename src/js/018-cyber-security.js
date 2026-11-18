/* ============================== CYBER SECURITY ============================== */
const newCyber=()=>({bounty:false,backup:false,ins:false,pentest:0,down:0,downKind:'',ddos:0,hidden:null,log:[],wave:0});
const CY_TOOLS={backup:{n:(LANG_EN?"Backup system":'Yedekleme sistemi'),cost:()=>15000*infl()*(1+(G.racks||0)/10),d:(LANG_EN?"After a ransomware attack, systems are back in 3 days.":'Fidye yazılımı saldırısında sistemler 3 günde geri gelir.')},
  bounty:{n:(LANG_EN?"Bug bounty program":'Hata ödül programı (bug bounty)'),cost:()=>30000*infl(),d:(LANG_EN?"Ethical hackers report vulnerabilities to you: security +6.":'Etik hackerlar açıkları sana bildirir: güvenlik +6.')},
  ins:{n:(LANG_EN?"Cyber insurance":'Siber sigorta'),cost:()=>20000*infl()*(1+G.emps.length/40),d:(LANG_EN?"Covers 70% of ransoms, fines and stolen funds.":'Fidye, ceza ve çalınan paranın %70\'ini karşılar.')}};
const cyberDown=()=>!!(G.cyber&&G.cyber.down>G.day);
const cyToolCost=()=>G.cyber?Object.keys(CY_TOOLS).reduce((a,k)=>a+(G.cyber[k]?CY_TOOLS[k].cost():0),0):0;
function secCover(){return G.emps.filter(e=>e.role==='sec'&&!e.leave).reduce((a,e)=>a+e.skill*effMult(e),0);}
function attackSurface(){const users=myActive().filter(p=>SW_CATS.includes(p.cat)).reduce((a,p)=>a+p.units,0);return 2+G.emps.length/12+Math.sqrt(users/1e5)*1.5+myActive().length*0.5+Math.sqrt((G.racks||0)+dcRacks())*0.5;}
function secScore(){if(!G.cyber)return 0;const cov=secCover(),sur=attackSurface();let v=15+60*(1-Math.exp(-cov/(sur*2.2)));
  if(has('sec1'))v+=8;if(has('sec2'))v+=10;if(G.cyber.bounty)v+=6;if(G.cyber.pentest>G.day)v+=12;return clamp(v,0,100);}
function threatLevel(){return clamp((0.015+0.0025*attackSurface()+G.brand/2000)*(G.cyber.wave>G.day?2:1),0,0.25);}
function cyLog(t,ok){G.cyber.log.unshift({d:G.day,t,ok});if(G.cyber.log.length>8)G.cyber.log.pop();}
function insured(x){return G.cyber.ins?x*0.3:x;}
function cyberMonthly(){
  const cy=G.cyber;if(!cy)return;
  const tc=cyToolCost();if(tc)spend(tc,'infra');
  if(cy.hidden){if(G.day>cy.hidden.until)cy.hidden=null;else if(Math.random()<0.15){const h=cy.hidden;cy.hidden=null;G.brand=clamp(G.brand-h.brand*2.5,0,100);
    for(const p of myActive())if(SW_CATS.includes(p.cat)&&p.sat!=null)p.sat=Math.max(0,p.sat-25);const f=insured(h.fine*2);if(f)spend(f,'other');
    news((LANG_EN?`Journalists uncovered the data leak you covered up! Huge scandal: brand −${fx(h.brand*2.5,0)}${f?`, ${money(f)} fine`:''}.`:`Gizlediğin veri sızıntısı gazeteciler tarafından ortaya çıkarıldı! Skandal büyük: marka −${fx(h.brand*2.5,0)}${f?`, ${money(f)} ceza`:''}.`),'bad',true);cyLog((LANG_EN?"Hidden leak exposed":'Gizlenen sızıntı ortaya çıktı'),false);}}
  if(G.day>200&&Math.random()<0.03&&!(cy.wave>G.day)){cy.wave=G.day+90;news((LANG_EN?"Cyber threat wave: a hacker group is targeting tech companies. Attack risk is doubled for the next 3 months.":'Siber tehdit dalgası: bir hacker grubu teknoloji şirketlerini hedef alıyor. Önümüzdeki 3 ay saldırı riski iki katı.'),'bad',true);}
  for(const c of liveComps())if(Math.random()<0.012){c.brand=clamp(c.brand-4,3,90);news((LANG_EN?`${c.name} was hit by a cyberattack; user data was leaked.`:`${c.name} siber saldırıya uğradı; kullanıcı verileri sızdı.`),'mkt');}
  if(G.day<120||Math.random()>threatLevel()*(qDay()?1.35:1)*(wPol()==='remote'&&!has('sec1')?1.25:wPol()==='hybrid'&&!has('sec1')?1.1:1))return;
  const sc=secScore(),kinds=[['phish',3],['spy',2]];
  if(myActive().some(p=>SW_CATS.includes(p.cat)))kinds.push(['breach',3]);
  if(myActive('saas').length)kinds.push(['ddos',2]);
  if(G.emps.length>=5)kinds.push(['ransom',2]);
  let t=kinds.reduce((a,k)=>a+k[1],0)*Math.random(),kind=kinds.find(k=>(t-=k[1])<0)[0];
  if((kind==='ransom'||kind==='breach')&&G.pending)kind='phish';
  const KN={phish:'oltalama',spy:(LANG_EN?"industrial espionage":'endüstriyel casusluk'),breach:(LANG_EN?"data exfiltration":'veri sızdırma'),ddos:(LANG_EN?"DDoS":'DDoS'),ransom:(LANG_EN?"ransomware":'fidye yazılımı')};
  if(Math.random()<sc/100*(has('sec2')?1:0.85)){news((LANG_EN?`Your security team blocked a ${KN[kind]} attack.`:`Güvenlik ekibin bir ${KN[kind]} saldırısını engelledi.`),'good');cyLog((LANG_EN?`${KN[kind]} attack blocked`:`${KN[kind]} saldırısı engellendi`),true);for(const e of G.emps)if(e.role==='sec')e.xp=(e.xp||0)+10;return;}
  if(kind==='phish'){const amt=Math.round(Math.min(Math.max(0,G.cash)*0.02,300000*infl()));if(amt>0){spend(insured(amt),'other');news((LANG_EN?`Phishing attack: an employee paid a fake invoice and ${money(amt)} was stolen${cy.ins?" (insurance covered 70%)":''}.`:`Oltalama saldırısı: bir çalışan sahte faturaya ödeme yaptı, ${money(amt)} çalındı${cy.ins?' (sigorta %70\'ini karşıladı)':''}.`),'bad',true);cyLog((LANG_EN?`Phishing: ${money(amt)} stolen`:`Oltalama: ${money(amt)} çalındı`),false);}}
  else if(kind==='spy'){const c=pick(liveComps().filter(c=>c.focus.some(f=>myActive(f).length))||liveComps());const cc=c||pick(liveComps());if(cc){cc.tech=clamp(cc.tech+0.04,0.7,1.45);news((LANG_EN?`Industrial espionage: ${cc.name} got hold of your technical documents. The rival's engineering level went up.`:`Endüstriyel casusluk: ${cc.name} teknik belgelerini ele geçirdi. Rakibin mühendislik seviyesi yükseldi.`),'bad',true);cyLog((LANG_EN?`Espionage: ${cc.name} stole documents`:`Casusluk: ${cc.name} belgeleri çaldı`),false);}}
  else if(kind==='ddos'){cy.ddos=G.day+rint(3,7);for(const p of myActive('saas'))p.sat=Math.max(0,(p.sat||70)-10);news((LANG_EN?`DDoS attack! Your web services will be largely unreachable for ${cy.ddos-G.day} days.`:`DDoS saldırısı! Web servislerin ${cy.ddos-G.day} gün boyunca büyük ölçüde erişilemez.`),'bad',true);cyLog((LANG_EN?"DDoS: web services down":'DDoS: web servisleri çöktü'),false);}
  else if(kind==='ransom')triggerChoice('ransom',{amt:Math.round(Math.max(100000*infl(),valuation()*0.01)),days:rint(12,22)});
  else{const eu=G.regions&&G.regions.eu.in?Math.round((G.rl&&G.rl.eu||0)*2):0;triggerChoice('breach',{rec:Math.round(dpBreachM()*myActive().filter(p=>SW_CATS.includes(p.cat)).reduce((a,p)=>a+p.units,0)*rnd(0.2,0.6)),brand:Math.round(rnd(3,7)),fine:eu});}
}
const RANSOM={id:'ransom',w:0,choice:true,cond:()=>false,
  view:d=>({t:(LANG_EN?"Ransomware attack":'Fidye yazılımı saldırısı'),b:(LANG_EN?`Your servers and computers have been encrypted. The attackers are demanding ${money(d.amt)} in crypto. Development and research will stop completely until systems are restored.`:`Sunucuların ve bilgisayarların şifrelendi. Saldırganlar ${money(d.amt)} kripto para istiyor. Sistemler geri gelene kadar geliştirme ve araştırma tamamen duracak.`),
    o:[{t:(LANG_EN?`Pay the ransom (${money(d.amt)})`:`Fidyeyi öde (${money(d.amt)})`),d:(LANG_EN?`The key has a 75% chance of working; if it does, you're back in 2 days.${G.cyber.ins?" Insurance covers 70%.":''}`:`Anahtarın çalışma ihtimali %75; çalışırsa 2 günde dönersin.${G.cyber.ins?' Sigorta %70\'ini karşılar.':''}`)},
      {t:G.cyber.backup?(LANG_EN?"Restore from backup":'Yedekten geri yükle'):(LANG_EN?"Rebuild systems from scratch":'Sistemleri sıfırdan kur'),d:G.cyber.backup?(LANG_EN?"You have a backup system: back in 3 days, no ransom.":'Yedekleme sistemin var: 3 günde geri dönersin, fidye yok.'):(LANG_EN?`No backup: work stops for ${d.days} days.`:`Yedeğin yok: ${d.days} gün iş durur.`)}]}),
  pick(d,i){const cy=G.cyber;let days;
    if(i===0){spend(insured(d.amt),'other');days=Math.random()<0.75?2:d.days;news(days===2?(LANG_EN?"Ransom paid; systems were back up in 2 days.":'Fidye ödendi, sistemler 2 günde açıldı.'):(LANG_EN?"Ransom paid, but the attackers' key didn't work! Systems are being rebuilt from scratch.":'Fidye ödendi ama saldırganların anahtarı çalışmadı! Sistemler sıfırdan kuruluyor.'),days===2?'mkt':'bad',true);}
    else{days=cy.backup?3:d.days;news(cy.backup?(LANG_EN?"Restoring from backups; systems will be back within 3 days.":'Yedeklerden geri yükleme başladı; 3 gün içinde sistemler açılacak.'):(LANG_EN?`Rebuilding systems from scratch: development and research halted for ${days} days.`:`Sistemler sıfırdan kuruluyor: ${days} gün geliştirme ve araştırma durdu.`),'bad',true);}
    cy.down=G.day+days;cy.downKind=(LANG_EN?"Ransomware":'Fidye yazılımı');tl('bad',(LANG_EN?`Ransomware attack: ${days}-day outage`:`Fidye yazılımı saldırısı: ${days} gün kesinti`));cyLog((LANG_EN?`Ransomware: ${days}-day outage`:`Fidye yazılımı: ${days} gün kesinti`),false);for(const e of G.emps)if(!e.leave)e.morale=Math.max(0,e.morale-4);}};
const BREACH={id:'breach',w:0,choice:true,cond:()=>false,
  view:d=>({t:(LANG_EN?"Data leak":'Veri sızıntısı'),b:(LANG_EN?`Your security team found that data for about ${num(d.rec)} users was leaked.${d.fine?` Potential fine under European data protection rules: ~${money(d.fine)}.`:''}`:`Güvenlik ekibin, yaklaşık ${num(d.rec)} kullanıcının verisinin sızdırıldığını tespit etti.${d.fine?` Avrupa veri koruma kurallarına göre ceza riski ~${money(d.fine)}.`:''}`),
    o:[{t:(LANG_EN?"Disclose it publicly now":'Hemen kamuoyuna açıkla'),d:(LANG_EN?`Brand −${d.brand}, software satisfaction −15${d.fine?`, fine ~${money(d.fine*0.5)}`:''}. Transparency limits the damage.`:`Marka −${d.brand}, yazılım memnuniyeti −15${d.fine?`, ceza ~${money(d.fine*0.5)}`:''}. Şeffaflık hasarı sınırlar.`)},
      {t:(LANG_EN?"Stay quiet":'Sessiz kal'),d:(LANG_EN?`No cost for now. But it's likely to come out within a year; if it does, brand −${Math.round(d.brand*2.5)}, satisfaction −25${d.fine?`, fine ~${money(d.fine*2)}`:''}.`:`Şimdilik bedel yok. Ama bir yıl içinde ortaya çıkma ihtimali yüksek; çıkarsa marka −${Math.round(d.brand*2.5)}, memnuniyet −25${d.fine?`, ceza ~${money(d.fine*2)}`:''}.`)}]}),
  pick(d,i){const cy=G.cyber;if(G.dp)G.dp.trust=clamp(G.dp.trust-(i===0?10:4),0,100);
    if(i===0){G.brand=clamp(G.brand-d.brand,0,100);for(const p of myActive())if(SW_CATS.includes(p.cat)&&p.sat!=null)p.sat=Math.max(0,p.sat-15);const f=insured(d.fine*0.5);if(f)spend(f,'other');
      news((LANG_EN?`The data leak was disclosed publicly. Users are uneasy, but your honesty was appreciated.${f?` Fine: ${money(f)}.`:''}`:`Veri sızıntısı kamuoyuna açıklandı. Kullanıcılar tedirgin ama dürüstlüğün takdir edildi.${f?` Ceza: ${money(f)}.`:''}`),'bad',true);cyLog((LANG_EN?"Data leak (disclosed)":'Veri sızıntısı (açıklandı)'),false);}
    else{cy.hidden={brand:d.brand,fine:d.fine,until:G.day+365};news((LANG_EN?"You decided to stay quiet about the data leak.":'Veri sızıntısı hakkında sessiz kalmaya karar verdin.'),'bad');cyLog((LANG_EN?"Data leak (covered up)":'Veri sızıntısı (gizlendi)'),false);}}};
EVENTS.push(RANSOM,BREACH);EVD.ransom=RANSOM;EVD.breach=BREACH;
