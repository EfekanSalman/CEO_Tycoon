/* ============================== MACRO ECONOMY ============================== */
const MPH={
  exp:{n:(LANG_EN?"Expansion":'Büyüme'),c:'st-ok',dur:[24,42],dem:1.03,pe:1.05,rate:[0.025,0.04],idx:0.01,wage:1,spawn:1,loan:1,
    tip:(LANG_EN?"Demand is solid and credit is reasonable. A good time to grow, but don't pile on debt late in the cycle.":'Talep sağlam, krediler makul. Büyümek için iyi zaman; ama döngünün sonuna doğru borcu şişirme.')},
  boom:{n:(LANG_EN?"Overheating":'Aşırı ısınma'),c:'st-warn',dur:[8,16],dem:1.06,pe:1.6,rate:[0.05,0.065],idx:0.025,wage:1.1,spawn:1.6,loan:1.2,
    tip:(LANG_EN?"Valuations are inflating. The best moment for a funding round or IPO; cut debt and build cash. The bubble could burst.":'Değerlemeler şişiyor. Yatırım turu ya da halka arz için en iyi an; borcu azalt, nakit biriktir. Balon patlayabilir.')},
  rec:{n:(LANG_EN?"Recession":'Resesyon'),c:'st-bad',dur:[8,14],dem:0.85,pe:0.65,rate:[0.005,0.01],idx:-0.01,wage:0.92,spawn:0.4,loan:0.7,
    tip:(LANG_EN?"Demand has dropped and rivals are struggling. A chance to grab cheap talent and cheap acquisitions; protect your cash.":'Talep düştü, rakipler zorlanıyor. Ucuz yetenek ve ucuz şirket satın almak için fırsat; nakdini koru.')},
  rcv:{n:(LANG_EN?"Recovery":'Toparlanma'),c:'st-mute',dur:[8,14],dem:0.97,pe:0.95,rate:[0.01,0.02],idx:0.015,wage:0.97,spawn:0.9,loan:0.9,
    tip:(LANG_EN?"The economy is improving and rates are low. Early investors get the biggest share of the next expansion.":'Ekonomi düzeliyor, faizler düşük. Erken yatırım yapanlar bir sonraki büyümeden en çok payı alır.')},
  shock:{n:(LANG_EN?"Global shock":'Küresel şok'),c:'st-bad',dur:[4,4],dem:0.75,pe:0.75,rate:[0.0025,0.0025],idx:-0.02,wage:0.95,spawn:0.3,loan:0.8,sw:1.25,
    tip:(LANG_EN?"Global pandemic: hardware demand and supply chains collapsed, but remote work set off a boom in software demand.":'Küresel salgın: donanım talebi ve tedarik zinciri çöktü, ama uzaktan çalışma yazılıma talep patlaması getirdi.')},
  stim:{n:(LANG_EN?"Stimulus wave":'Teşvik dalgası'),c:'st-warn',dur:[12,16],dem:1.08,pe:1.5,rate:[0.0025,0.005],idx:0.03,wage:1.12,spawn:1.8,loan:1.2,sw:1.15,
    tip:(LANG_EN?"Central banks are printing money: stocks are soaring and money is pouring into startups. Rates will rise fast someday.":'Merkez bankaları para basıyor: borsa uçuyor, girişimlere para yağıyor. Faizler bir gün hızla yükselecek.')},
};
const MAC_SENS={app:0.3,saas:0.5,os:0.6,ai:0.4,car:1,cpu:0.8,phone:1,pc:1,wear:1.1,console:1,xr:1.2,robo:1.3,iot:0.9,qc:0.6};
const newMac=(day=0)=>({ph:'exp',left:rint(18,36),rate:0.005,idx:100,pe:1,dem:1,sw:1,h:[],log:[{ph:'exp',d:day}],shock:day<365*4?rint(Math.round(365*4.5),Math.round(365*6.5)):day+rint(365,1095),shockDone:false,prob:0});
const macPh=()=>G.mac?G.mac.ph:'exp';
const loanRate=()=>((G.mac?G.mac.rate:0.03)+0.12-(ceoSk('f1')?0.01:0))/12;
function macDem(cat){const M=G.mac;if(!M)return 1;const sw=SW_CATS.includes(cat);return Math.max(0.5,1+(M.dem-1)*(MAC_SENS[cat]==null?1:MAC_SENS[cat])*(sw&&M.sw>1?0.3:1))*(sw?M.sw:1);}
const macPE=()=>G.mac?G.mac.pe:1;
const macWage=()=>G.mac?MPH[G.mac.ph].wage:1;
function macGo(ph){const M=G.mac,P0=MPH[ph];if(ph==='rec'||ph==='shock')fxShockAll(rnd(0.9,0.95),(LANG_EN?"Investors are fleeing to the dollar as a safe haven: emerging-market currencies have weakened.":'Yatırımcılar güvenli liman olarak dolara kaçıyor: gelişmekte olan para birimleri değer kaybetti.'));M.ph=ph;M.left=rint(P0.dur[0],P0.dur[1]);M.tgt=rnd(P0.rate[0],P0.rate[1]);M.log.push({ph,d:G.day});if(M.log.length>30)M.log.shift();
  const msg={exp:(LANG_EN?"The economy has entered an expansion: consumer confidence is rising.":'Ekonomi büyüme dönemine girdi: tüketici güveni yükseliyor.'),boom:(LANG_EN?"The economy is overheating: stocks keep hitting record after record and startup valuations are inflating.":'Ekonomi aşırı ısınıyor: borsa rekor üstüne rekor kırıyor, girişim değerlemeleri şişiyor.'),
    rec:(LANG_EN?"Recession! Demand is shrinking, investors are cautious and valuations are falling.":'Resesyon! Talep daralıyor, yatırımcılar temkinli, değerlemeler düşüyor.'),rcv:(LANG_EN?"The economy is recovering: the worst is behind us.":'Ekonomi toparlanıyor: en kötüsü geride kaldı.'),
    shock:(LANG_EN?"Global pandemic! Factories closed, ports stopped, people stayed home. Hardware demand collapsed and software demand exploded.":'Küresel salgın! Fabrikalar kapandı, limanlar durdu, insanlar evde. Donanım talebi çöktü, yazılıma talep patladı.'),
    stim:(LANG_EN?"Central banks cut rates to zero and are pumping money into markets: a stimulus wave has begun.":'Merkez bankaları faizi sıfırladı ve piyasaya para pompalıyor: teşvik dalgası başladı.')}[ph];
  news(msg,ph==='rec'||ph==='shock'?'bad':ph==='boom'||ph==='exp'||ph==='stim'?'good':'',true);tl(ph==='rec'||ph==='shock'?'bad':'val',(LANG_EN?`Economy: ${P0.n}`:`Ekonomi: ${P0.n}`));}
function macNext(){const M=G.mac;
  if(M.ph==='exp')macGo(Math.random()<0.6?'boom':'rec');
  else if(M.ph==='boom'){macGo('rec');M.idx*=0.72;news((LANG_EN?"The bubble burst! The stock market crashed within days.":'Balon patladı! Borsa birkaç gün içinde çöktü.'),'bad',true);}
  else if(M.ph==='rec')macGo('rcv');
  else if(M.ph==='rcv')macGo('exp');
  else if(M.ph==='shock')macGo('stim');
  else if(M.ph==='stim'){macGo('boom');M.left=rint(6,10);M.tgt=rnd(0.045,0.06);news((LANG_EN?"Inflation is up: central banks are starting to raise rates. The stimulus era is over.":'Enflasyon yükseldi: merkez bankaları faiz artırımına başlıyor. Teşvik dönemi bitti.'),'bad',true);}}
function macMonthly(){
  const M=G.mac;if(!M)return;
  if(!M.shockDone&&G.day>=M.shock&&M.ph!=='shock'){M.shockDone=true;macGo('shock');M.idx*=0.7;
    G.disrupt.cin={until:G.day+60,why:(LANG_EN?"Pandemic":'Salgın')};G.pxEvt.wafer={m:1.35,until:G.day+300};G.pxEvt.memory={m:1.3,until:G.day+300};G.pxEvt.gpu={m:1.4,until:G.day+300};}
  else if(--M.left<=0)macNext();
  const P0=MPH[M.ph];
  M.dem+=(P0.dem-M.dem)*(M.ph==='shock'?0.6:0.25);M.pe+=(P0.pe-M.pe)*0.2;M.sw+=((P0.sw||1)-M.sw)*0.35;
  M.idx=Math.max(10,M.idx*Math.exp(P0.idx+rnd(-0.03,0.03)+(M.pe-1)*0.004));
  if(M.tgt==null)M.tgt=rnd(P0.rate[0],P0.rate[1]);
  if(Math.abs(M.tgt-M.rate)>0.001&&Math.random()<(M.ph==='shock'?1:0.6)){const old=M.rate,st=M.ph==='shock'?Math.abs(M.tgt-M.rate):Math.abs(M.tgt-M.rate)>0.015?0.005:0.0025;
    M.rate=Math.round((M.rate+Math.sign(M.tgt-M.rate)*Math.min(st,Math.abs(M.tgt-M.rate)))*10000)/10000;
    news((LANG_EN?`The central bank ${M.rate>old?"raised":"cut"} its rate from ${fx(old*100,2)}% to ${fx(M.rate*100,2)}%. Your loan rate is now ${fx(loanRate()*100,2)}% per month.`:`Merkez bankası faizi %${fx(old*100,2)}'den %${fx(M.rate*100,2)}'e ${M.rate>old?'yükseltti':'indirdi'}. Kredi faizin aylık %${fx(loanRate()*100,2)} oldu.`),M.rate>old?'bad':'good');}
  const pr={exp:M.left<10?0.35:0.1,boom:0.75,rec:1,rcv:0.05,shock:1,stim:0.6}[M.ph];M.prob=clamp(pr+rnd(-0.1,0.1),0,1);
  M.h.push({d:G.day,i:Math.round(M.idx*10)/10,r:M.rate,ph:M.ph});if(M.h.length>240)M.h.shift();
}
function vMacro(){
  const M=G.mac,P0=MPH[M.ph],h=M.h,y1=h.length>12?h[h.length-13].i:h.length?h[0].i:M.idx,ch=M.idx/y1-1;
  const strip=M.log.length?(LANG_EN?`<div style="display:flex;align-items:stretch;gap:1px;height:10px;border-radius:2px;overflow:hidden" role="img" aria-label="Cycle history">${M.log.map((l,i)=>{const end=i<M.log.length-1?M.log[i+1].d:G.day,w=Math.max(0,end-l.d);return `<span title="${MPH[l.ph].n} · ${fmtDate(l.d)}" style="flex:${w||0.01} 0 0;background:var(--${l.ph==='rec'||l.ph==='shock'?'bad':l.ph==='boom'||l.ph==='stim'?'warn':l.ph==='exp'?'ok':'line'})"></span>`;}).join('')}</div>
    <div class="row small muted" style="gap:12px;flex-wrap:wrap"><span><b style="color:var(--ok)">■</b> Expansion</span><span><b style="color:var(--warn)">■</b> Overheating, stimulus</span><span><b style="color:var(--bad)">■</b> Recession, shock</span><span><b style="color:var(--line)">■</b> Recovery</span></div>`:`<div style="display:flex;align-items:stretch;gap:1px;height:10px;border-radius:2px;overflow:hidden" role="img" aria-label="Dönem geçmişi">${M.log.map((l,i)=>{const end=i<M.log.length-1?M.log[i+1].d:G.day,w=Math.max(0,end-l.d);return `<span title="${MPH[l.ph].n} · ${fmtDate(l.d)}" style="flex:${w||0.01} 0 0;background:var(--${l.ph==='rec'||l.ph==='shock'?'bad':l.ph==='boom'||l.ph==='stim'?'warn':l.ph==='exp'?'ok':'line'})"></span>`;}).join('')}</div>
    <div class="row small muted" style="gap:12px;flex-wrap:wrap"><span><b style="color:var(--ok)">■</b> Büyüme</span><span><b style="color:var(--warn)">■</b> Aşırı ısınma, teşvik</span><span><b style="color:var(--bad)">■</b> Resesyon, şok</span><span><b style="color:var(--line)">■</b> Toparlanma</span></div>`):'';
  const cats=CAT_ORDER.filter(c=>myActive(c).length||catUnlocked(c)).map(c=>{const m=macDem(c)-1;return `<tr><td>${CATS[c].n}</td><td class="r num ${m>0.005?'pos':m<-0.005?'neg':''}">${m>=0?'+':'−'}${pct(Math.abs(m),0)}</td></tr>`;}).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Economy${helpBtn('macro')}</h2><span class="chip ${P0.c}">${P0.n}</span></div>
    <div class="kpis"><div class="kpi"><span>Policy rate</span><b>${fx(M.rate*100,2)}%</b></div><div class="kpi"><span>Your loan rate</span><b>${fx(loanRate()*100,2)}%/mo</b></div>
      <div class="kpi"><span>Stock index</span><b>${fx(M.idx,0)}<small class="${ch>=0?'pos':'neg'}" style="display:block;font-size:12px;font-weight:600">${ch>=0?'+':'−'}${pct(Math.abs(ch),0)} / yr</small></b></div><div class="kpi"><span>Valuation multiple</span><b class="${M.pe>1.02?'pos':M.pe<0.98?'neg':''}">×${fx(M.pe,2)}</b></div></div>
    <div class="pb col" style="gap:10px"><div class="small"><b>${P0.n}.</b> ${P0.tip}</div>
      <div class="small muted">Analysts' odds of a recession in the next 12 months: <b>${Math.round(M.prob*20)*5}%</b>${M.ph==='rec'||M.ph==='shock'?" (we're already in one)":''}. Forecasts aren't always right.</div></div></section>
  <div class="grid"><section class="panel"><div class="ph"><h2>Stock index</h2></div><div class="pb col" style="gap:8px">${lineChart('macidx',h.map(x=>fmtMonth(x.d)),[{n:"Index",c:'var(--ch1)',v:h.map(x=>x.i),area:true}],{label:"Stock index",h:170,fmt:v=>fx(v,0),empty:"The index is plotted at month end."})}${strip}</div></section>
  <section class="panel"><div class="ph"><h2>Policy rate</h2></div><div class="pb">${lineChart('macrate',h.map(x=>fmtMonth(x.d)),[{n:"Interest",c:'var(--ch2)',v:h.map(x=>x.r*100)}],{label:"Policy rate",h:170,fmt:v=>pctN(fx(v,1)),minMax:1,empty:"The rate is plotted at month end."})}</div></section></div>
  <div class="grid"><section class="panel"><div class="ph"><h2>Demand impact by category</h2></div><div class="tw"><table><tbody>${cats}</tbody></table></div></section>
  <section class="panel"><div class="ph"><h2>Economy's impact on your company</h2></div><div class="pb"><div class="kv">
    <span>Credit limit</span><b>×${fx(MPH[M.ph].loan,1)}</b><span>New-hire salaries</span><b>×${fx(macWage(),2)}</b>
    <span>Valuations & company prices</span><b>×${fx(M.pe,2)}</b><span>New startup formation rate</span><b>×${fx(MPH[M.ph].spawn,1)}</b>
    <span>Your monthly interest cost</span><b>${money(G.debt*loanRate())}</b></div>
    <p class="small muted">The valuation multiple affects funding rounds, IPO price, share price and the purchase price of rival companies. In a recession, candidates are cheaper and more skilled.</p></div></section></div>`:`<section class="panel"><div class="ph"><h2>Ekonomi${helpBtn('macro')}</h2><span class="chip ${P0.c}">${P0.n}</span></div>
    <div class="kpis"><div class="kpi"><span>Politika faizi</span><b>%${fx(M.rate*100,2)}</b></div><div class="kpi"><span>Kredi faizin</span><b>aylık %${fx(loanRate()*100,2)}</b></div>
      <div class="kpi"><span>Borsa endeksi</span><b>${fx(M.idx,0)}<small class="${ch>=0?'pos':'neg'}" style="display:block;font-size:12px;font-weight:600">${ch>=0?'+':'−'}${pct(Math.abs(ch),0)} / yıl</small></b></div><div class="kpi"><span>Değerleme çarpanı</span><b class="${M.pe>1.02?'pos':M.pe<0.98?'neg':''}">×${fx(M.pe,2)}</b></div></div>
    <div class="pb col" style="gap:10px"><div class="small"><b>${P0.n}.</b> ${P0.tip}</div>
      <div class="small muted">Analistlere göre önümüzdeki 12 ayda resesyon ihtimali: <b>%${Math.round(M.prob*20)*5}</b>${M.ph==='rec'||M.ph==='shock'?' (zaten içindeyiz)':''}. Tahminler her zaman tutmaz.</div></div></section>
  <div class="grid"><section class="panel"><div class="ph"><h2>Borsa endeksi</h2></div><div class="pb col" style="gap:8px">${lineChart('macidx',h.map(x=>fmtMonth(x.d)),[{n:'Endeks',c:'var(--ch1)',v:h.map(x=>x.i),area:true}],{label:'Borsa endeksi',h:170,fmt:v=>fx(v,0),empty:'Endeks ay sonlarında çizilir.'})}${strip}</div></section>
  <section class="panel"><div class="ph"><h2>Politika faizi</h2></div><div class="pb">${lineChart('macrate',h.map(x=>fmtMonth(x.d)),[{n:'Faiz',c:'var(--ch2)',v:h.map(x=>x.r*100)}],{label:'Politika faizi',h:170,fmt:v=>pctN(fx(v,1)),minMax:1,empty:'Faiz ay sonlarında çizilir.'})}</div></section></div>
  <div class="grid"><section class="panel"><div class="ph"><h2>Kategorilere göre talep etkisi</h2></div><div class="tw"><table><tbody>${cats}</tbody></table></div></section>
  <section class="panel"><div class="ph"><h2>Ekonominin şirketine etkisi</h2></div><div class="pb"><div class="kv">
    <span>Kredi limiti</span><b>×${fx(MPH[M.ph].loan,1)}</b><span>Yeni işe alım maaşları</span><b>×${fx(macWage(),2)}</b>
    <span>Değerleme ve şirket fiyatları</span><b>×${fx(M.pe,2)}</b><span>Yeni girişim kurulma hızı</span><b>×${fx(MPH[M.ph].spawn,1)}</b>
    <span>Aylık faiz giderin</span><b>${money(G.debt*loanRate())}</b></div>
    <p class="small muted">Değerleme çarpanı yatırım turlarını, halka arz fiyatını, hisse fiyatını ve rakip şirketlerin satın alma fiyatını etkiler. Resesyonda adaylar daha ucuz ve daha yeteneklidir.</p></div></section></div>`);
}

