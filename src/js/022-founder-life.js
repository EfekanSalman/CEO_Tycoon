/* ============================== FOUNDER LIFE ============================== */
const newLife=()=>({sal:0,bal:65,conf:60,own:{},art:0,angel:[],last:{},coupAt:-999,lockSal:0,valH:[]});
const FSAL=[0,10000,30000,100000];
const ASSETS={
  apt:{n:(LANG_EN?"City apartment":'Şehir dairesi'),cost:300000,pr:2,bal:1,d:(LANG_EN?"Work-life balance +1/mo":'Yaşam dengesi +1/ay')},
  villa:{n:(LANG_EN?"Villa with garden":'Bahçeli villa'),cost:2e6,pr:6,bal:2,pre:'apt',d:(LANG_EN?"Work-life balance +2/mo, faster energy recovery":'Yaşam dengesi +2/ay, enerji toparlanması hızlanır')},
  yali:{n:(LANG_EN?"Bosphorus mansion":'Boğaz yalısı'),cost:15e6,pr:20,bal:3,pre:'villa',d:(LANG_EN?"Work-life balance +3/mo, major prestige":'Yaşam dengesi +3/ay, büyük prestij')},
  car:{n:(LANG_EN?"Sports car":'Spor araba'),cost:250000,pr:5,d:(LANG_EN?"Prestige +5":'Prestij +5')},
  yacht:{n:(LANG_EN?"Yacht":'Yat'),cost:8e6,pr:15,risk:true,d:(LANG_EN?"Prestige +15. Paparazzi risk while the company is losing money.":'Prestij +15. Şirket zarardayken paparazzi riski.')},
  jet:{n:(LANG_EN?"Private jet":'Özel jet'),cost:25e6,pr:10,d:(LANG_EN?"Deal acceptance chance +5%, awareness +5 in new regions":'Anlaşma kabul ihtimali +%5, yeni bölgede bilinirlik +5')},
};
const fdr=()=>G.emps.find(e=>e.founder);
const lifeOn=()=>!!G.life;
function prestige(){if(!G.life)return 0;let p=Object.keys(G.life.own).reduce((a,k)=>a+ASSETS[k].pr,0)+Math.min(15,G.life.art/1e6*2);return Math.round(p+Math.min(20,Math.log10(1+(G.wealth||0)/1e5)*4));}
const boardOn=()=>G.equity<0.999;
const founderSafe=()=>G.equity>=0.5;
function lifeMonthly(){
  const L=G.life;if(!L)return;const f=fdr();
  /* founder salary */
  const sal=FSAL[L.sal]*infl();if(sal>0){spend(sal,'salary');G.wealth=(G.wealth||0)+sal;}
  /* art appreciates */
  if(L.art>0)L.art*=Math.exp(rnd(-0.02,0.03));
  /* angel investments */
  for(const a of [...L.angel])if(G.day>=a.until){L.angel=L.angel.filter(x=>x!==a);const r=Math.random(),m=r<0.55?0:r<0.75?1:r<0.9?3:10;const back=a.amt*m;G.wealth=(G.wealth||0)+back;
    news(m===0?(LANG_EN?`Your angel investment ${a.n} went under; ${money(a.amt)} lost.`:`Melek yatırımın ${a.n} battı; ${money(a.amt)} gitti.`):m===10?(LANG_EN?`Jackpot! Your angel investment ${a.n} was acquired: ${money(a.amt)} → ${money(back)}.`:`Büyük vurgun! Melek yatırımın ${a.n} satın alındı: ${money(a.amt)} → ${money(back)}.`):(LANG_EN?`Your angel investment ${a.n} paid out: ${money(a.amt)} → ${money(back)}.`:`Melek yatırımın ${a.n} sonuçlandı: ${money(a.amt)} → ${money(back)}.`),m>=3?'good':m===0?'bad':'mkt',m!==1);}
  /* life balance */
  let bal=L.bal;bal+=(60-bal)*0.05;
  for(const k in L.own)bal+=ASSETS[k].bal||0;
  if(G.pace==='crunch')bal-=6;if(f&&f.energy<40)bal-=4;if(f&&f.proj&&typeof f.proj!=='string')bal-=1;
  if(L.last.vac)bal+=10;L.last.vac=false;
  L.bal=clamp(bal,0,100);
  if(f&&L.bal<25&&!f.leave&&Math.random()<0.2){f.leave={type:'sick',until:G.day+21};L.bal+=15;news((LANG_EN?"As founder you neglected your health: the doctor ordered 3 weeks of complete rest. The company will manage without you.":'Kurucu olarak sağlığını ihmal ettin: doktor 3 hafta tam istirahat verdi. Şirket sensiz idare edecek.'),'bad',true);}
  /* prestige effects */
  const pr=prestige();if(pr>10)G.brand=clamp(G.brand+pr/200,0,100);
  /* yacht scandal */
  const mp=G.hist.length?G.hist[G.hist.length-1].profit:0;
  if(L.own.yacht&&mp<0&&Math.random()<0.12){G.brand=clamp(G.brand-2,0,100);L.conf-=10;news((LANG_EN?"Paparazzi photos: the founder vacationing on a yacht while the company loses money! Investors are furious.":'Paparazzi fotoğrafları: şirket zarar ederken kurucu yatında tatilde! Yatırımcılar öfkeli.'),'bad',true);}
  if(pr>25&&Math.random()<0.05){G.brand=clamp(G.brand+1,0,100);news((LANG_EN?`A business magazine put you on its cover: "The visionary founder of ${G.name}". Brand +1.`:`Bir iş dergisi seni kapağına taşıdı: "${G.name}'in vizyoner kurucusu". Marka +1.`),'good',true);}
  /* board confidence */
  L.valH.push(valuation());if(L.valH.length>7)L.valH.shift();
  if(boardOn()){
    let c=L.conf;c+=(55-c)*0.04;
    const h=G.hist.slice(-3),avg=h.length?h.reduce((a,x)=>a+x.profit,0)/h.length:0;c+=avg>0?1.5:-2;
    if(L.valH.length>=7){const g=L.valH[6]/Math.max(1,L.valH[0]);c+=g>1.1?3:g<0.85?-4:0;}
    if(L.sal===3)c-=avg>0?1:3;else if(L.sal===2&&avg<0)c-=1;
    if(G.pub&&G.pub.miss)c-=2*G.pub.miss;
    L.conf=clamp(c,0,100);
    if(L.conf<15&&!G.pending&&G.day-L.coupAt>180){L.coupAt=G.day;if(founderSafe()){news((LANG_EN?`The board wanted to remove you, but with a ${Math.round(G.equity*100)}% stake you're in control. Confidence is still very low, though.`:`Yönetim kurulu seni görevden almak istedi ama %${Math.round(G.equity*100)} hisseyle kontrol sende. Güven yine de çok düşük.`),'bad',true);}else triggerChoice('coup',{});}
  }
}
function lifeVacNote(e){if(e&&e.founder&&G.life)G.life.last.vac=true;}
const COUP={id:'coup',w:0,choice:true,cond:()=>false,
  view:()=>{const ch=coupChance();return {t:(LANG_EN?"Board coup":'Yönetim kurulu darbesi'),b:(LANG_EN?`Board confidence has hit rock bottom (${Math.round(G.life.conf)}/100). The board called an emergency meeting to remove you as CEO. Your stake: ${Math.round(G.equity*100)}%.`:`Yönetim kurulu güveni dibe vurdu (${Math.round(G.life.conf)}/100). Kurul, seni CEO'luktan almak için olağanüstü toplantıya çağırdı. Hisse payın %${Math.round(G.equity*100)}.`),
    o:[{t:(LANG_EN?`Win over shareholders (${money(500000*infl())})`:`Hissedarları ikna et (${money(500000*infl())})`),d:(LANG_EN?`Proxy fight: ~${Math.round(ch*100)}% chance to win. If you lose, you're fired and the game ends.`:`Vekâlet savaşı: kazanma ihtimali ~%${Math.round(ch*100)}. Kaybedersen kovulursun ve oyun biter.`)},
      {t:(LANG_EN?"Make concessions":'Taviz ver'),d:(LANG_EN?"Your salary drops to zero and can't be raised for 12 months; half your perks go. Confidence +30.":'Maaşını sıfırla ve 12 ay artıramazsın, yan hakların yarısı kalkar. Güven +30.')},
      {t:(LANG_EN?"Resign":'İstifa et'),d:(LANG_EN?`You leave the company and keep your shares (~${money(valuation()*G.equity)}). The game ends.`:`Şirketten ayrılırsın; hisselerin sende kalır (~${money(valuation()*G.equity)}). Oyun biter.`)}]};},
  pick(d,i){const L=G.life;
    if(i===0){spend(500000*infl(),'other');if(Math.random()<coupChance()){L.conf=45;tl('law',(LANG_EN?"You survived the board coup":'Yönetim kurulu darbesini atlattın'));news((LANG_EN?"You won the proxy fight! Shareholders backed you; your seat is secure.":'Vekâlet savaşını kazandın! Hissedarlar seni destekledi; koltuğun sağlam.'),'good',true);}else fireFounder((LANG_EN?"You lost the board vote.":'Yönetim kurulu oylamasını kaybettin.'));}
    else if(i===1){L.sal=0;L.lockSal=G.day+365;let n=0;for(const k in G.perks)if(G.perks[k]&&k!=='stock'&&n++%2===0)G.perks[k]=false;L.conf=clamp(L.conf+30,0,100);news((LANG_EN?"You made concessions to the board: your salary is zero and some perks are gone. Your seat is safe for now.":'Kurula taviz verdin: maaşın sıfırlandı, bazı yan haklar kalktı. Koltuğun şimdilik güvende.'),'mkt',true);}
    else fireFounder((LANG_EN?"You resigned of your own accord.":'Kendi isteğinle istifa ettin.'),true);}};
EVENTS.push(COUP);EVD.coup=COUP;
function coupChance(){return clamp(G.equity*1.3+(cofOn()&&G.cof.mood>=50?G.cof.eq*1.3:cofOn()&&G.cof.mood<25?-0.1:0)+G.life.conf/200+prestige()/200,0.05,0.95);}
function fireFounder(why,resigned){G.wealth=(G.wealth||0);G.exited={by:(LANG_EN?"Board":'Yönetim kurulu'),offer:valuation(),day:G.day,fired:true,why,resigned:!!resigned};G.over=true;careerRecord(resigned?'resigned':'fired');G.speed=0;news((LANG_EN?`${why} ${G.name} is no longer under your leadership.`:`${why} ${G.name} artık senin yönetiminde değil.`),'bad',true);setTimeout(()=>openModal('exit'),0);}
function vFounder(){
  const L=G.life;if(!L)return '';const f=fdr(),pr=prestige(),stake=valuation()*G.equity;
  const own=Object.entries(ASSETS).map(([k,a])=>{const has_=L.own[k],lock=a.pre&&!L.own[a.pre];const c=a.cost*infl();
    return (LANG_EN?`<div class="proj"><div class="row between"><b>${a.n}</b>${has_?"<span class=\"chip st-ok\">Owned</span>":''}</div><div class="small muted">${a.d}</div>
      <div class="row between small"><span>${money(c)} · prestige +${a.pr}</span>${has_?`<button class="btn sm ghost" data-act="lifesell" data-k="${k}">Sell (${money(c*0.7)})</button>`:`<button class="btn sm" data-act="lifebuy" data-k="${k}" ${lock||(G.wealth||0)<c?'disabled':''}>${lock?"Requires "+ASSETS[a.pre].n:"Buy"}</button>`}</div></div>`:`<div class="proj"><div class="row between"><b>${a.n}</b>${has_?'<span class="chip st-ok">Sende</span>':''}</div><div class="small muted">${a.d}</div>
      <div class="row between small"><span>${money(c)} · prestij +${a.pr}</span>${has_?`<button class="btn sm ghost" data-act="lifesell" data-k="${k}">Sat (${money(c*0.7)})</button>`:`<button class="btn sm" data-act="lifebuy" data-k="${k}" ${lock||(G.wealth||0)<c?'disabled':''}>${lock?'Önce '+ASSETS[a.pre].n:'Satın al'}</button>`}</div></div>`);}).join('');
  const salBtns=FSAL.map((v,i)=>`<button class="btn sm ${L.sal===i?'primary':''}" data-act="lifesal" data-i="${i}" ${L.lockSal>G.day&&i>0?'disabled':''}>${v?money(v*infl())+'/ay':(LANG_EN?"No salary":'Maaş alma')}</button>`).join('');
  const angels=L.angel.map(a=>(LANG_EN?`<li><span class="chip st-mute">Angel</span><span>${esc(a.n)} · ${money(a.amt)} · outcome ${fmtDate(a.until)}</span></li>`:`<li><span class="chip st-mute">Melek</span><span>${esc(a.n)} · ${money(a.amt)} · sonuç ${fmtDate(a.until)}</span></li>`)).join('');
  const bc=L.conf,bcol=bc>=55?'var(--ok)':bc>=30?'var(--warn)':'var(--bad)';
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Founder</h2><span class="sub">${f?esc(f.name):''} · prestige ${pr}</span></div>
    <div class="kpis" style="border-top:0"><div class="kpi"><span>Personal wealth</span><b class="pos">${money(G.wealth||0)}</b></div><div class="kpi"><span>Your stake value</span><b>${money(stake)}</b></div><div class="kpi"><span>Prestige</span><b>${pr}</b></div><div class="kpi"><span>Work-life balance</span><b class="${L.bal<30?'neg':L.bal<50?'warn':'pos'}">${Math.round(L.bal)}</b></div><div class="kpi"><span>Board confidence</span><b style="color:${boardOn()?bcol:'var(--muted)'}">${boardOn()?Math.round(bc):'—'}</b></div></div>
    <div class="pb col">
      <div class="row between"><span class="small"><b>Your salary</b> <span class="muted">· moves from the company to your personal wealth; a high salary bothers the board${L.lockSal>G.day?` · locked until ${fmtDate(L.lockSal)}`:''}</span></span><span class="row">${salBtns}</span></div>
      ${boardOn()?`<div class="col" style="gap:4px"><div class="row between small"><b>Board confidence</b><span class="muted">${founderSafe()?`With a ${Math.round(G.equity*100)}% stake you're in control; they can't remove you`:`Your stake is under 50%: if confidence drops below 15, there will be a vote to remove you`}</span></div><div class="bar"><i style="width:${bc}%;background:${bcol}"></i></div>
        <div class="small muted">Profit, valuation growth and market expectations raise confidence; a high salary while losing money and scandals lower it. Donations help restore it.</div></div>`:"<div class=\"small muted\">You have no investors; there's no board pressure yet.</div>"}
      <div class="small"><b>Work-life balance</b> <span class="muted">· a fast pace and the founder working on projects lower it; vacation (give yourself leave in Team → Team & candidates) and a nice home raise it. Below 25 there's a risk of health problems.</span></div>
      <div class="small"><b>Lifestyle</b> <span class="muted">· bought with your personal wealth; prestige boosts the brand and candidate quality</span></div>
      <div class="grid3">${own}</div>
      <div class="row between"><span class="small"><b>Art collection:</b> ${money(L.art)} <span class="muted">· value fluctuates, can be sold</span></span><span class="row"><button class="btn sm" data-act="lifeart" data-a="1" ${(G.wealth||0)<1e6?'disabled':''}>Buy $1M of art</button><button class="btn sm ghost" data-act="lifeart" data-a="-1" ${L.art<1?'disabled':''}>Sell collection</button></span></div>
      <div class="row between"><span class="small"><b>Angel investing</b> <span class="muted">· invest your wealth in startups; resolves in 1–3 years, most fail but one can return 10x</span></span><span class="row">${[250000,1e6,5e6].map(a=>`<button class="btn sm" data-act="lifeangel" data-a="${a}" ${(G.wealth||0)<a?'disabled':''}>${money(a)}</button>`).join('')}</span></div>
      ${angels?`<ul class="alerts">${angels}</ul>`:''}
      <div class="row between"><span class="small"><b>Donations</b> <span class="muted">· donating to your foundation boosts the brand and board confidence</span></span><span class="row">${[100000,1e6,10e6].map(a=>`<button class="btn sm" data-act="lifegive" data-a="${a}" ${(G.wealth||0)<a?'disabled':''}>${money(a)}</button>`).join('')}</span></div>
    </div></section>`:`<section class="panel"><div class="ph"><h2>Kurucu</h2><span class="sub">${f?esc(f.name):''} · prestij ${pr}</span></div>
    <div class="kpis" style="border-top:0"><div class="kpi"><span>Kişisel servet</span><b class="pos">${money(G.wealth||0)}</b></div><div class="kpi"><span>Hisse değerin</span><b>${money(stake)}</b></div><div class="kpi"><span>Prestij</span><b>${pr}</b></div><div class="kpi"><span>Yaşam dengesi</span><b class="${L.bal<30?'neg':L.bal<50?'warn':'pos'}">${Math.round(L.bal)}</b></div><div class="kpi"><span>Kurul güveni</span><b style="color:${boardOn()?bcol:'var(--muted)'}">${boardOn()?Math.round(bc):'—'}</b></div></div>
    <div class="pb col">
      <div class="row between"><span class="small"><b>Kendi maaşın</b> <span class="muted">· şirketten kişisel servetine aktarılır; yüksek maaş kurulu rahatsız eder${L.lockSal>G.day?` · ${fmtDate(L.lockSal)}'e kadar kilitli`:''}</span></span><span class="row">${salBtns}</span></div>
      ${boardOn()?`<div class="col" style="gap:4px"><div class="row between small"><b>Yönetim kurulu güveni</b><span class="muted">${founderSafe()?`%${Math.round(G.equity*100)} hisseyle kontrol sende; seni görevden alamazlar`:`Hissen %50'nin altında: güven 15'in altına düşerse görevden alınma oylaması olur`}</span></div><div class="bar"><i style="width:${bc}%;background:${bcol}"></i></div>
        <div class="small muted">Kâr, değerleme artışı ve borsa beklentileri güveni artırır; zararda yüksek maaş ve skandallar düşürür. Bağış yapmak güveni toparlar.</div></div>`:'<div class="small muted">Yatırımcın yok; yönetim kurulu baskısı başlamadı.</div>'}
      <div class="small"><b>Yaşam dengesi</b> <span class="muted">· yoğun tempo ve kurucunun projede çalışması dengeyi düşürür; tatil (Ekip → Ekip ve adaylar bölümünde kendine izin ver) ve iyi bir ev yükseltir. 25'in altında sağlık sorunu riski var.</span></div>
      <div class="small"><b>Yaşam tarzı</b> <span class="muted">· kişisel servetinle alınır; prestij markayı ve aday kalitesini artırır</span></div>
      <div class="grid3">${own}</div>
      <div class="row between"><span class="small"><b>Sanat koleksiyonu:</b> ${money(L.art)} <span class="muted">· değeri dalgalanır, satılabilir</span></span><span class="row"><button class="btn sm" data-act="lifeart" data-a="1" ${(G.wealth||0)<1e6?'disabled':''}>$1M sanat al</button><button class="btn sm ghost" data-act="lifeart" data-a="-1" ${L.art<1?'disabled':''}>Koleksiyonu sat</button></span></div>
      <div class="row between"><span class="small"><b>Melek yatırım</b> <span class="muted">· girişimlere servetinden yatırım; 1–3 yılda sonuçlanır, çoğu batar ama biri 10 kat getirebilir</span></span><span class="row">${[250000,1e6,5e6].map(a=>`<button class="btn sm" data-act="lifeangel" data-a="${a}" ${(G.wealth||0)<a?'disabled':''}>${money(a)}</button>`).join('')}</span></div>
      ${angels?`<ul class="alerts">${angels}</ul>`:''}
      <div class="row between"><span class="small"><b>Bağış</b> <span class="muted">· vakfına bağış markayı ve kurul güvenini artırır</span></span><span class="row">${[100000,1e6,10e6].map(a=>`<button class="btn sm" data-act="lifegive" data-a="${a}" ${(G.wealth||0)<a?'disabled':''}>${money(a)}</button>`).join('')}</span></div>
    </div></section>`);
}


