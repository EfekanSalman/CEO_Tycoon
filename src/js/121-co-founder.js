/* ============================== CO-FOUNDER ============================== */
const COF_T={tech:{n:(LANG_EN?"Technical co-founder":'Teknik kurucu ortak'),ti:'CTO',role:'soft',fx:(LANG_EN?"All project scores +5%, research +10%":'Bütün projelerin puanı +%5, araştırma +%10')},
  biz:{n:(LANG_EN?"Business development co-founder":'İş geliştirme kurucu ortağı'),ti:'CBO',role:'mkt',fx:(LANG_EN?"Funding rounds +10%, brand grows a little each month":'Yatırım turları +%10, marka her ay biraz büyür')},
  design:{n:(LANG_EN?"Product & design co-founder":'Ürün ve tasarım kurucu ortağı'),ti:'CPO',role:'design',fx:(LANG_EN?"All project scores +3%, press score +0.4":'Bütün projelerin puanı +%3, basın puanı +0,4')}};
const COF_TR={perf:{n:(LANG_EN?"Perfectionist":'Mükemmeliyetçi'),d:(LANG_EN?"Dislikes overtime and products with low press scores.":'Fazla mesaiden ve düşük basın puanlı ürünlerden hoşlanmaz.')},hust:{n:(LANG_EN?"Ambitious":'Hırslı'),d:(LANG_EN?"Wants fast growth and funding rounds; gets bored by stagnation.":'Hızlı büyüme ve yatırım turu ister; durgunluktan sıkılır.')},
  caut:{n:(LANG_EN?"Cautious":'Temkinli'),d:(LANG_EN?"Uneasy about debt, losses and shrinking cash.":'Borçtan, zarardan ve nakdin azalmasından rahatsız olur.')},vis:{n:(LANG_EN?"Dreamer":'Hayalperest'),d:(LANG_EN?"Values research and new markets; gets bored if research stalls.":'Araştırmaya ve yeni pazarlara önem verir; araştırma durursa sıkılır.')}};
function cofCands(){return ['tech','biz','design'].map(t=>{const sk=Math.round(rnd(6.8,8.6)*10)/10;return {t,name:pick(FIRST)+' '+pick(LAST),skill:sk,eq:Math.round(clamp(0.12+(sk-6.8)*0.08+rnd(-0.03,0.05),0.1,0.35)*100)/100,tr:pick(Object.keys(COF_TR))};});}
const cofOn=()=>!!(G.cof&&G.cof.st==='on'&&G.emps.some(e=>e.cof));
const cofQ=()=>cofOn()?(G.cof.t==='tech'?1.05:G.cof.t==='design'?1.03:1):1;
const cofRes=()=>cofOn()&&G.cof.t==='tech'?1.1:1;
const cofRound=()=>cofOn()&&G.cof.t==='biz'?1.1:1;
function cofVest(){const C=G.cof;if(!C)return 0;const t=G.day-C.start;return t<365?0:clamp(t/(4*365),0,1);}
const cofLog=t=>{const C=G.cof;(C.log=C.log||[]).unshift({d:G.day,t});if(C.log.length>8)C.log.pop();};
function cofJoin(c,mid){const T=COF_T[c.t];const e=scnHire(T.role,c.skill,{});Object.assign(e,{name:c.name,founder:true,cof:true,salary:Math.round(salaryFor(c.skill)*0.5/100)*100,morale:80,hiredAt:G.day});
  G.cof={...c,st:'on',start:G.day,mood:70,eq0:c.eq,last:G.day+90,meet:-999,log:[]};G.equity=Math.max(0.05,G.equity-c.eq);
  news((LANG_EN?`${c.name} became your co-founder (${T.ti}, ${Math.round(c.eq*100)}% equity).`:`${c.name} kurucu ortağın oldu (${T.ti}, %${Math.round(c.eq*100)} hisse).`),'good',true);tl('emp',(LANG_EN?`${c.name} became co-founder`:`${c.name} kurucu ortak oldu`));cofLog((LANG_EN?"Partnership formed":'Ortaklık kuruldu'));}
function cofLeave(how){const C=G.cof;if(!C||C.st!=='on')return;const vf=cofVest(),e=G.emps.find(x=>x.cof);if(e)G.emps=G.emps.filter(x=>x!==e);
  G.equity=Math.min(0.999,G.equity+C.eq*(1-vf));C.st='left';C.left=G.day;C.kept=how==='buy'?0:C.eq*vf;if(how==='buy')G.equity=Math.min(0.999,G.equity+C.eq*vf);
  for(const o of G.emps)o.morale=clamp(o.morale-5,0,100);G.brand=clamp(G.brand-1,0,100);cofLog(how==='buy'?(LANG_EN?"Shares bought back, left":'Hisseleri geri alındı, ayrıldı'):(LANG_EN?"Left with shares":'Hisseleriyle ayrıldı'));
  tl('bad',(LANG_EN?`${C.name} left the company`:`${C.name} şirketten ayrıldı`));
  if(how!=='buy'&&Math.random()<0.5&&myActive().length){const cat=myActive().slice().sort((a,b)=>b.share-a.share)[0].cat,sur=C.name.split(' ').slice(-1)[0];
    const c=makeComp({name:`${sur} Labs`,pfx:sur,focus:[cat],cash:5e6*infl(),emp:30,brand:10,tech:1.15,hue:rint(0,359),reg:['tr']},'c'+nid());c.born=G.day;c.rel=-40;c.ceo={name:C.name,age:rint(30,50),p:pick(['kav','fir']),since:G.day,din:-999,jab:-999};G.comps.push(c);aiLaunch(c,cat,true);
    news((LANG_EN?`Right after leaving, ${C.name} founded a rival company: ${c.name} (${CATS[cat].n}).`:`${C.name} ayrılır ayrılmaz rakip bir şirket kurdu: ${c.name} (${CATS[cat].n}).`),'bad',true);tl('rival',(LANG_EN?`${C.name} founded ${c.name}`:`${C.name}, ${c.name}'ı kurdu`));}}
const COF_TOP={
  perf:{q:(LANG_EN?"\"Our products have too many bugs. Let's pause new features for a while and focus on quality.\"":'"Ürünlerimizde çok hata var. Yeni özellikleri bir süre bırakıp kaliteye odaklanalım."'),a:(LANG_EN?"Bugs in all products are halved and satisfaction rises; momentum dips slightly.":'Bütün ürünlerdeki hatalar yarıya iner, memnuniyet artar; ivme biraz düşer.'),run(f){for(const p of myActive()){if(p.bugs!=null)p.bugs=Math.round(p.bugs*(1-0.5*f));if(p.sat!=null)p.sat=Math.min(95,p.sat+5*f);}G.momentum=Math.max(0,(G.momentum||0)-3*f);}},
  hust:{q:(LANG_EN?"\"We're too slow. Let's grow aggressively with a big promo campaign.\"":'"Çok yavaşız. Büyük bir tanıtım kampanyasıyla agresif büyüyelim."'),a:(LANG_EN?"4% of your cash is spent, brand +3.":'Nakdinin %4\'ü harcanır, marka +3.'),run(f){const k=G.cash*0.04*f;spend(k,'other');G.brand=clamp(G.brand+3*f,0,100);}},
  caut:{q:(LANG_EN?"\"We're taking too much risk. Let's cut perks and pay off part of the debt.\"":'"Fazla risk alıyoruz. Yan hakları kaldıralım, borcun bir kısmını kapatalım."'),a:(LANG_EN?"Perks are cut and up to 30% of cash goes to paying debt; team morale drops.":'Yan haklar kalkar, nakdin %30\'una kadar borç ödenir; ekip morali düşer.'),run(f){if(f>=1)for(const k in G.perks)if(k!=='stock')G.perks[k]=false;const r=Math.min(G.debt,G.cash*0.3*f);G.debt-=r;G.cash-=r;for(const e of G.emps)e.morale=clamp(e.morale-4*f,0,100);}},
  vis:{q:(LANG_EN?"\"We're not investing in the future. Let's put more resources into research.\"":'"Geleceğe yatırım yapmıyoruz. Araştırmaya daha çok kaynak ayıralım."'),a:(LANG_EN?"Ongoing research advances 25% (otherwise brand +1); 3% of cash is spent.":'Süren araştırma %25 ilerler (yoksa marka +1); nakdin %3\'ü harcanır.'),run(f){spend(G.cash*0.03*f,'other');if(G.res.active)G.res.active.p+=actRP()*0.25*f;else G.brand=clamp(G.brand+f,0,100);}},
};
const COF_EVS=[
  {id:'cofdis',w:0,choice:true,cond:()=>false,
    view:d=>{const C=G.cof,T=COF_TOP[C.tr];return {t:(LANG_EN?"Disagreement with co-founder":'Kurucu ortakla anlaşmazlık'),b:(LANG_EN?`${C.name} (${COF_TR[C.tr].n.toLocaleLowerCase(LOC)}) spoke firmly in the meeting: ${T.q}`:`${C.name} (${COF_TR[C.tr].n.toLocaleLowerCase(LOC)}) toplantıda kararlı konuştu: ${T.q}`),
      o:[{t:(LANG_EN?"You're right, let's do it":'Haklısın, öyle yapalım'),d:(LANG_EN?`${T.a} Your co-founder will be pleased.`:`${T.a} Ortağın memnun olur.`)},{t:(LANG_EN?"Let's find a middle ground":'Orta yolu bulalım'),d:(LANG_EN?"Half the effect applies; your co-founder calms down a bit.":'Etkinin yarısı uygulanır; ortağın biraz yatışır.')},{t:(LANG_EN?"Try to persuade":'İkna etmeye çalış'),d:(LANG_EN?`If you succeed, nothing changes and the relationship is unharmed; if you fail, your co-founder is hurt (~${Math.round(cofPersP()*100)}% chance).`:`Başarırsan hiçbir şey değişmez ve ilişki zarar görmez; başaramazsan ortağın kırılır (şansın ~%${Math.round(cofPersP()*100)}).`)},{t:(LANG_EN?"No, my decision is final":'Hayır, kararım net'),d:(LANG_EN?"Your co-founder is hurt.":'Ortağın kırılır.')}]};},
    pick(d,i){const C=G.cof;if(!C||C.st!=='on')return;const T=COF_TOP[C.tr];
      if(i===0){T.run(1);C.mood=clamp(C.mood+15,0,100);cofLog((LANG_EN?"Proposal accepted":'Önerisi kabul edildi'));}
      else if(i===1){T.run(0.5);C.mood=clamp(C.mood+5,0,100);cofLog((LANG_EN?"Middle ground found":'Orta yol bulundu'));}
      else if(i===2){if(Math.random()<cofPersP()){C.mood=clamp(C.mood-2,0,100);news((LANG_EN?`You persuaded ${C.name}.`:`${C.name}'ı ikna ettin.`),'good');cofLog((LANG_EN?"Persuaded":'İkna edildi'));}else{C.mood=clamp(C.mood-18,0,100);news((LANG_EN?`${C.name} wasn't convinced and feels hurt.`:`${C.name} ikna olmadı ve kırıldı.`),'bad');cofLog((LANG_EN?"Couldn't persuade":'İkna edilemedi'));}}
      else{C.mood=clamp(C.mood-15,0,100);cofLog((LANG_EN?"Proposal rejected":'Önerisi reddedildi'));}}},
  {id:'cofeq',w:0,choice:true,cond:()=>false,
    view:()=>{const C=G.cof;return {t:(LANG_EN?"Co-founder wants more equity":'Kurucu ortak daha fazla hisse istiyor'),b:(LANG_EN?`${C.name} feels their stake (${fx(C.eq*100,1)}%) doesn't reflect their effort and wants 3% of yours.`:`${C.name}, şirketteki payının (%${fx(C.eq*100,1)}) emeğini karşılamadığını düşünüyor ve senin payından %3 istiyor.`),
      o:[{t:(LANG_EN?"Give 3% equity":'%3 hisse ver'),d:(LANG_EN?`Your stake ${pct(G.equity)} → ${pct(Math.max(0.05,G.equity-0.03))}. Your co-founder will be very pleased.`:`Payın ${pct(G.equity)} → ${pct(Math.max(0.05,G.equity-0.03))}. Ortağın çok memnun olur.`)},{t:(LANG_EN?"Raise their salary 50%":'Maaşını %50 artır'),d:(LANG_EN?"Partially calms them.":'Kısmen yatıştırır.')},{t:(LANG_EN?"Decline":'Reddet'),d:(LANG_EN?"Your co-founder is hurt.":'Ortağın kırılır.')}]};},
    pick(d,i){const C=G.cof;if(!C||C.st!=='on')return;const e=G.emps.find(x=>x.cof);
      if(i===0){G.equity=Math.max(0.05,G.equity-0.03);C.eq+=0.03;C.mood=clamp(C.mood+25,0,100);cofLog((LANG_EN?"Received 3% more equity":'%3 ek hisse aldı'));}
      else if(i===1){if(e)e.salary=Math.round(e.salary*1.5/100)*100;C.mood=clamp(C.mood+10,0,100);cofLog((LANG_EN?"Salary raised":'Maaşı artırıldı'));}
      else{C.mood=clamp(C.mood-15,0,100);cofLog((LANG_EN?"Equity request rejected":'Hisse talebi reddedildi'));}}},
  {id:'cofleave',w:0,choice:true,cond:()=>false,
    view:d=>{const C=G.cof,vf=cofVest(),buy=C.eq*vf*valuation()*0.7;return {t:d.forced?(LANG_EN?"End partnership":'Ortaklığı bitir'):(LANG_EN?"Co-founder wants to leave":'Kurucu ortak ayrılmak istiyor'),b:(LANG_EN?`${d.forced?`You're about to part ways with ${C.name}.`:`${C.name} is no longer happy at the company and wants to leave.`} They have vested ${Math.round(vf*100)}% of their shares (${fx(C.eq*vf*100,1)}% of the company); the unvested portion returns to you.`:`${d.forced?`${C.name} ile yollarını ayırmak üzeresin.`:`${C.name} artık bu şirkette mutlu değil ve ayrılmak istiyor.`} Hisselerinin %${Math.round(vf*100)}'ini hak etti (şirketin %${fx(C.eq*vf*100,1)}'i); hak edilmemiş kısım sana döner.`),
      o:[{t:(LANG_EN?`Buy back their vested shares (${money(buy)})`:`Hak ettiği hisseleri geri al (${money(buy)})`),d:(LANG_EN?"The partnership ends cleanly; your stake grows.":'Ortaklık temiz biter; payın büyür.')},{t:(LANG_EN?"Let them leave with their shares":'Hisseleriyle gitmesine izin ver'),d:(LANG_EN?"You pay nothing, but there's a 50/50 chance they found a rival company.":'Para ödemezsin ama yarı yarıya rakip bir şirket kurar.')},...(d.forced?[{t:(LANG_EN?"Cancel":'Vazgeç'),d:(LANG_EN?"The partnership continues, but your co-founder heard about it and is hurt.":'Ortaklık sürer ama ortağın bunu duydu ve kırıldı.')}]:[{t:(LANG_EN?"One last offer: 5% equity and a new role":'Son bir teklif: %5 hisse ve yeni rol'),d:(LANG_EN?"60% chance they stay.":'%60 ihtimalle kalır.')}])]};},
    pick(d,i){const C=G.cof;if(!C||C.st!=='on')return;const vf=cofVest(),buy=C.eq*vf*valuation()*0.7;
      if(i===0){if(G.cash<buy){news((LANG_EN?"Not enough cash to buy back the shares; they left with their shares.":'Hisseleri geri almaya nakdin yetmedi; hisseleriyle ayrıldı.'),'bad',true);cofLeave('keep');}else{spend(buy,'other');news((LANG_EN?`${C.name}'s shares were bought back for ${money(buy)}; the partnership has ended.`:`${C.name}'ın hisseleri ${money(buy)} karşılığında geri alındı; ortaklık sona erdi.`),'',true);cofLeave('buy');}}
      else if(i===1){news((LANG_EN?`${C.name} left the company with their shares.`:`${C.name} hisseleriyle şirketten ayrıldı.`),'bad',true);cofLeave('keep');}
      else if(d.forced){C.mood=clamp(C.mood-20,0,100);cofLog((LANG_EN?"Attempt to end partnership":'Ortaklığı bitirme girişimi'));}
      else if(Math.random()<0.6){G.equity=Math.max(0.05,G.equity-0.05);C.eq+=0.05;C.mood=45;news((LANG_EN?`${C.name} accepted the last offer and stayed.`:`${C.name} son teklifi kabul etti ve kaldı.`),'good',true);cofLog((LANG_EN?"Stayed after last offer":'Son teklifle kaldı'));}
      else{news((LANG_EN?`${C.name} rejected the last offer too and left with their shares.`:`${C.name} son teklifi de reddetti ve hisseleriyle ayrıldı.`),'bad',true);cofLeave('keep');}}},
];
for(const e of COF_EVS)EVD[e.id]=e;
function cofPersP(){const C=G.cof;return clamp(0.3+(C.mood-50)/150+(G.momentum||0)/100+((G.hist.slice(-1)[0]||{}).profit>0?0.1:0),0.1,0.85);}
function cofMonthly(){
  const C=G.cof;if(!C||C.st!=='on')return;if(!G.emps.some(e=>e.cof)){C.st='left';C.left=G.day;C.kept=C.eq*cofVest();return;}
  const h=G.hist,last=h[h.length-1],v6=G.stats&&G.stats.length>6?G.stats[G.stats.length-7].v:null;let d=(60-C.mood)*0.05+0.3;
  if(last)d+=last.profit>0?0.8:-1;
  if(C.tr==='perf'){if(G.pace==='crunch')d-=3;if(G.products.some(p=>p.owner==='P'&&p.launch>G.day-60&&p.review!=null&&p.review<6))d-=3;}
  if(C.tr==='hust'&&v6&&valuation()<v6*1.1)d-=2;
  if(C.tr==='caut'){if(G.debt>0)d-=2;if(last&&last.profit<0&&G.cash<-last.profit*4)d-=3;}
  if(C.tr==='vis')d+=G.res.active?0.5:-2;
  if(C.eq<C.eq0*0.5)d-=1;
  C.mood=clamp(C.mood+d,0,100);const e=G.emps.find(x=>x.cof);if(e)e.morale=clamp(e.morale*0.5+C.mood*0.5,0,100);
  if(C.t==='biz')G.brand=clamp(G.brand+0.1,0,100);
  if(G.pending||G.over)return;
  if(C.mood<15){triggerChoice('cofleave',{});return;}
  if(G.day>=C.last&&Math.random()<0.13){C.last=G.day+120;
    if((C.mood<40||(valuation()>5e7&&C.eq<0.1))&&Math.random()<0.4)triggerChoice('cofeq',{});else triggerChoice('cofdis',{});}
}
function vCof(){
  const C=G.cof;
  if(!C||C.st!=='on'){return (LANG_EN?`<section class="panel"><div class="ph"><h2>Co-founder${helpBtn('cof')}</h2></div><div class="pb col" style="gap:8px">
    ${C?`<div class="small">${esc(C.name)} left on ${fmtDate(C.left)}${C.kept?`; they still own ${fx(C.kept*100,1)}% of the company`:''}.</div>`:"<div class=\"small muted\">You founded the company alone.</div>"}
    ${!C&&G.day<365?`<div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm primary" data-act="cofopen">Find a co-founder</button><span class="small muted">You can still find a co-founder during your first year.</span></div>`:''}</div></section>`:`<section class="panel"><div class="ph"><h2>Kurucu ortak${helpBtn('cof')}</h2></div><div class="pb col" style="gap:8px">
    ${C?`<div class="small">${esc(C.name)} ${fmtDate(C.left)}'de ayrıldı${C.kept?`; şirketin %${fx(C.kept*100,1)}'i hâlâ onda`:''}.</div>`:'<div class="small muted">Şirketi tek başına kurdun.</div>'}
    ${!C&&G.day<365?`<div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm primary" data-act="cofopen">Kurucu ortak ara</button><span class="small muted">İlk yıl içinde hâlâ bir kurucu ortak bulabilirsin.</span></div>`:''}</div></section>`);}
  const T=COF_T[C.t],vf=cofVest(),e=G.emps.find(x=>x.cof),ml=C.mood>=70?[(LANG_EN?"Very happy":'Çok memnun'),'pos']:C.mood>=45?[(LANG_EN?"Happy":'Memnun'),'']:C.mood>=25?[(LANG_EN?"Restless":'Huzursuz'),'warn']:[(LANG_EN?"About to leave":'Ayrılmanın eşiğinde'),'neg'],mc=G.day-C.meet<60;
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Co-founder${helpBtn('cof')}</h2><span class="sub">${T.ti} · since ${fmtDate(C.start)}</span></div>
    <div class="pb col" style="gap:10px"><div class="row" style="gap:12px;align-items:center"><span aria-hidden="true" style="width:46px;height:46px;border-radius:50%;flex:none;display:grid;place-items:center;font-weight:700;color:#fff;background:var(--accent)">${esc(C.name.split(' ').map(x=>x[0]).join(''))}</span>
      <div class="col" style="gap:2px"><b>${esc(C.name)}</b><span class="small muted">${T.n} · skill ${fx(e?e.skill:C.skill,1)}</span><span class="row" style="gap:6px"><span class="chip st-mute">${COF_TR[C.tr].n}</span></span></div></div>
      <div class="kv"><span>Equity</span><b>${fx(C.eq*100,1)}%</b><span>Vested</span><b>${Math.round(vf*100)}% ${vf<1?`<small class="muted">· fully vested ${fmtDate(C.start+4*365)}</small>`:''}</b><span>Satisfaction</span><b class="${ml[1]}">${ml[0]} · ${Math.round(C.mood)}</b><span>Contribution</span><b class="small">${T.fx}</b></div>
      <div class="bar"><i style="width:${C.mood}%;background:${C.mood>=45?'var(--ok)':C.mood>=25?'var(--warn)':'var(--bad)'}"></i></div>
      <div class="small muted">${COF_TR[C.tr].d} Satisfaction depends on company profit and how well your decisions match their priorities. When happy, they back you on the board with their shares; if very unhappy, they want to leave. Shares vest over 4 years (none in the first year).</div>
      ${C.log&&C.log.length?`<div class="small">${C.log.slice(0,5).map(l=>`<span class="muted num">${fmtDate(l.d)}</span> · ${esc(l.t)}`).join('<br>')}</div>`:''}
      <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm" data-act="cofmeet" ${mc?'disabled':''}>${mc?`Meeting in ${60-(G.day-C.meet)} days`:"One-on-one meeting"}</button><button class="btn sm" data-act="cofgive" ${G.equity<0.1?'disabled':''}>Give 2% equity</button><button class="btn sm ghost" data-act="cofend">End partnership</button></div></div></section>`:`<section class="panel"><div class="ph"><h2>Kurucu ortak${helpBtn('cof')}</h2><span class="sub">${T.ti} · ${fmtDate(C.start)}'den beri</span></div>
    <div class="pb col" style="gap:10px"><div class="row" style="gap:12px;align-items:center"><span aria-hidden="true" style="width:46px;height:46px;border-radius:50%;flex:none;display:grid;place-items:center;font-weight:700;color:#fff;background:var(--accent)">${esc(C.name.split(' ').map(x=>x[0]).join(''))}</span>
      <div class="col" style="gap:2px"><b>${esc(C.name)}</b><span class="small muted">${T.n} · yetenek ${fx(e?e.skill:C.skill,1)}</span><span class="row" style="gap:6px"><span class="chip st-mute">${COF_TR[C.tr].n}</span></span></div></div>
      <div class="kv"><span>Hissesi</span><b>%${fx(C.eq*100,1)}</b><span>Hak edilen</span><b>%${Math.round(vf*100)} ${vf<1?`<small class="muted">· tamamı ${fmtDate(C.start+4*365)}</small>`:''}</b><span>Memnuniyet</span><b class="${ml[1]}">${ml[0]} · ${Math.round(C.mood)}</b><span>Katkısı</span><b class="small">${T.fx}</b></div>
      <div class="bar"><i style="width:${C.mood}%;background:${C.mood>=45?'var(--ok)':C.mood>=25?'var(--warn)':'var(--bad)'}"></i></div>
      <div class="small muted">${COF_TR[C.tr].d} Memnuniyet şirketin kârına ve kararlarının onun önceliklerine uymasına göre değişir. Memnunsa hisseleriyle yönetim kurulunda yanında durur; çok mutsuz olursa ayrılmak ister. Hisseleri 4 yılda hak edilir (ilk yıl hiç).</div>
      ${C.log&&C.log.length?`<div class="small">${C.log.slice(0,5).map(l=>`<span class="muted num">${fmtDate(l.d)}</span> · ${esc(l.t)}`).join('<br>')}</div>`:''}
      <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm" data-act="cofmeet" ${mc?'disabled':''}>${mc?`Görüşme ${60-(G.day-C.meet)} gün sonra`:'Bire bir görüşme'}</button><button class="btn sm" data-act="cofgive" ${G.equity<0.1?'disabled':''}>%2 hisse ver</button><button class="btn sm ghost" data-act="cofend">Ortaklığı bitir</button></div></div></section>`);
}

