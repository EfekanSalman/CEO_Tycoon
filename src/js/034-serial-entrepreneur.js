/* ============================== SERIAL ENTREPRENEUR ============================== */
const CAREER_KEY='silikon-garaj-career';
function careerGet(){try{const c=JSON.parse(localStorage.getItem(CAREER_KEY)||'null');if(c&&Array.isArray(c.runs))return c;}catch(e){}return {runs:[],wealth:0,alumni:[]};}
function careerSet(c){try{localStorage.setItem(CAREER_KEY,JSON.stringify(c));}catch(e){}}
const HOW_N={sold:(LANG_EN?"Sold":'Satıldı'),voluntary:(LANG_EN?"Sold (your decision)":'Satıldı (kendi kararınla)'),fired:(LANG_EN?"You were removed":'Görevden alındın'),resigned:(LANG_EN?"You resigned":'İstifa ettin'),bankrupt:(LANG_EN?"Went bankrupt":'İflas etti')};
function careerFame(c){return Math.min(30,Math.round(c.runs.reduce((a,r)=>a+(r.exit>=1e7?Math.log10(r.exit/1e6+1)*5:0)+(r.how==='sold'||r.how==='voluntary'?3:0)-(r.how==='bankrupt'?2:0),0)));}
function careerRecord(how){
  if(!G||G.careerDone)return;G.careerDone=1;const C=careerGet();
  const offer=G.exited?G.exited.offer:0,stake=(how==='fired'||how==='resigned')?offer*G.equity:0;
  const exit=how==='bankrupt'?0:offer*G.equity;
  C.wealth=Math.max(0,(G.wealth||0)+stake);
  C.runs.push({co:G.name,days:G.day,how,exit,val:how==='bankrupt'?0:offer,ts:Date.now(),scn:G.scn?G.scn.id:'free'});if(C.runs.length>30)C.runs.shift();
  C.alumni=G.emps.filter(e=>!e.founder&&!e.intern).sort((a,b)=>b.skill-a.skill).slice(0,3).map(e=>({name:e.name,role:e.role,skill:Math.min(8,e.skill),level:Math.min(2,e.level||0),tr:(e.tr||[]).filter(t=>t!=='toxic')}));
  careerSet(C);tl('star',`${G.name}: ${HOW_N[how]}`);
}
function serialStart(){
  const C=careerGet();if(!C.runs.length)return;const fame=careerFame(C),inv=Math.round(C.wealth*(UI.serInv||0));
  newGame('free');applyDiff(curDiff());
  G.cash+=inv;G.wealth=C.wealth-inv;G.fame=fame;G.brand=clamp(G.brand+Math.min(15,fame*0.5),0,100);G.serial={n:C.runs.length+1,inv};
  if(UI.serAlum!==false)for(const a of C.alumni||[]){if(G.emps.length>=officeCap())break;const e=genCand();
    Object.assign(e,{name:a.name,role:a.role,skill:a.skill,level:a.level,tr:[...new Set([...(a.tr||[]),'loyal'])].slice(0,3),hiredAt:0,morale:88});e.salary=Math.round(marketSal(e)/100)*100;e.xp=XP_REQ[e.level];G.emps.push(e);}
  G.cands=[];for(let i=0;i<6;i++)G.cands.push(genCand());
  G.tut={on:false,step:0,seen:{}};G.news=[];market();
  tl('office',(LANG_EN?`Company #${G.serial.n} founded (serial entrepreneur)`:`${G.serial.n}. şirket kuruldu (seri girişimci)`));
  news((LANG_EN?`As a serial entrepreneur, you founded company #${G.serial.n}.${inv?` You invested ${money(inv)} of your own wealth.`:''} Your fame is ${fame}: your brand and candidate quality start higher.`:`Seri girişimci olarak ${G.serial.n}. şirketini kurdun.${inv?` Kendi servetinden ${money(inv)} yatırdın.`:''} Ünün ${fame}: markan ve aday kalitesi daha yüksek başlıyor.`),'good',true);
}
const VOL_MIN_DAYS=730,VOL_MIN_VAL=5e6;
const volOffer=()=>Math.round(valuation()*1.05);
function vSerialCard(){const C=careerGet();if(!C.runs.length)return '';const fame=careerFame(C),inv=UI.serInv||0,al=C.alumni||[];
  return (LANG_EN?`<div class="scn" style="border-color:var(--ok);border-width:2px"><div class="row between"><h3>Serial entrepreneur</h3><span class="chip st-ok">Company #${C.runs.length+1}</span></div>
    <div class="small">Personal wealth <b>${money(C.wealth)}</b> · fame <b>${fame}</b>/30 · ${C.runs.length} past companies</div>
    <div class="small muted">Fame boosts your brand (+${Math.min(15,Math.round(fame*0.5))}), candidate quality and funding rounds (+${Math.min(30,fame)}%).</div>
    <div class="row small" style="gap:4px;flex-wrap:wrap">Invest from your wealth: ${[0,0.25,0.5,0.75].map(v=>`<button class="btn sm ${inv===v?'primary':'ghost'}" data-act="serinv" data-v="${v}">${v?pct(v,0)+' · '+money(C.wealth*v):"None"}</button>`).join('')}</div>
    ${al.length?`<label class="row small" style="gap:6px"><button class="btn sm ${UI.serAlum!==false?'primary':'ghost'}" data-act="seralum" aria-pressed="${UI.serAlum!==false}">${UI.serAlum!==false?"Bring them":"Leave them"}</button>From your old team: ${al.map(a=>`${esc(a.name)} (${ROLES[a.role].n}, ${fx(a.skill,1)})`).join(', ')}</label>`:''}
    <button class="btn sm primary" data-act="serialstart">Start as a serial entrepreneur</button></div>`:`<div class="scn" style="border-color:var(--ok);border-width:2px"><div class="row between"><h3>Seri girişimci</h3><span class="chip st-ok">${C.runs.length+1}. şirket</span></div>
    <div class="small">Kişisel servetin <b>${money(C.wealth)}</b> · ün <b>${fame}</b>/30 · ${C.runs.length} şirket geçmişi</div>
    <div class="small muted">Ün markanı (+${Math.min(15,Math.round(fame*0.5))}), aday kalitesini ve yatırımcı turlarını (+%${Math.min(30,fame)}) artırır.</div>
    <div class="row small" style="gap:4px;flex-wrap:wrap">Servetinden yatır: ${[0,0.25,0.5,0.75].map(v=>`<button class="btn sm ${inv===v?'primary':'ghost'}" data-act="serinv" data-v="${v}">${v?pct(v,0)+' · '+money(C.wealth*v):'Hiç'}</button>`).join('')}</div>
    ${al.length?`<label class="row small" style="gap:6px"><button class="btn sm ${UI.serAlum!==false?'primary':'ghost'}" data-act="seralum" aria-pressed="${UI.serAlum!==false}">${UI.serAlum!==false?'Gelsin':'Gelmesin'}</button>Eski ekipten: ${al.map(a=>`${esc(a.name)} (${ROLES[a.role].n}, ${fx(a.skill,1)})`).join(', ')}</label>`:''}
    <button class="btn sm primary" data-act="serialstart">Seri girişimci olarak başla</button></div>`);}
function vCareer(){const C=careerGet();if(!C.runs.length&&!G.serial)return '';
  const rows=C.runs.slice().reverse().map(r=>(LANG_EN?`<tr><td><b>${esc(r.co)}</b></td><td class="r num">${Math.floor(r.days/365)} yr ${Math.floor((r.days%365)/30)} mo</td><td>${HOW_N[r.how]||r.how}</td><td class="r num">${r.val?money(r.val):'—'}</td><td class="r num">${r.exit?money(r.exit):'—'}</td></tr>`:`<tr><td><b>${esc(r.co)}</b></td><td class="r num">${Math.floor(r.days/365)} yıl ${Math.floor((r.days%365)/30)} ay</td><td>${HOW_N[r.how]||r.how}</td><td class="r num">${r.val?money(r.val):'—'}</td><td class="r num">${r.exit?money(r.exit):'—'}</td></tr>`)).join('');
  const ok=G.day>=VOL_MIN_DAYS&&valuation()>=VOL_MIN_VAL&&!G.over;
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Career${helpBtn('serial')}</h2><span class="sub">${G.serial?`This is your company #${G.serial.n}`:"Your first company"} · fame ${careerFame(C)}/30</span></div>
    ${rows?`<div class="tw"><table><thead><tr><th>Company</th><th class="r">Duration</th><th>Outcome</th><th class="r">Company value</th><th class="r">Your take</th></tr></thead><tbody>${rows}</tbody></table></div>`:''}
    <div class="pb col"><div class="row between"><span class="small">You can sell the company to a private equity fund and exit: the offer is 105% of valuation (${money(volOffer())}), and your share comes to ${money(volOffer()*G.equity)}.${ok?'':` <span class="muted">Requires at least 2 years and a ${money(VOL_MIN_VAL)} valuation.</span>`}</span><button class="btn sm" data-act="exitask" ${ok?'':'disabled'}>Sell and exit</button></div>
    <p class="small muted">When the company is sold, you are fired, or it goes under, it is added to your career. In your next game you can start as a serial entrepreneur with your wealth, your fame, and your three best employees.</p></div></section>`:`<section class="panel"><div class="ph"><h2>Kariyer${helpBtn('serial')}</h2><span class="sub">${G.serial?`Bu, ${G.serial.n}. şirketin`:'İlk şirketin'} · ün ${careerFame(C)}/30</span></div>
    ${rows?`<div class="tw"><table><thead><tr><th>Şirket</th><th class="r">Süre</th><th>Sonuç</th><th class="r">Şirket değeri</th><th class="r">Sana kalan</th></tr></thead><tbody>${rows}</tbody></table></div>`:''}
    <div class="pb col"><div class="row between"><span class="small">Şirketi bir özel sermaye fonuna satıp çıkabilirsin: teklif değerlemenin %105'i (${money(volOffer())}), hisse payına düşen ${money(volOffer()*G.equity)}.${ok?'':` <span class="muted">En az 2 yıl ve ${money(VOL_MIN_VAL)} değerleme gerekir.</span>`}</span><button class="btn sm" data-act="exitask" ${ok?'':'disabled'}>Şirketi sat ve çık</button></div>
    <p class="small muted">Şirket satıldığında, görevden alındığında ya da battığında kariyerine yazılır. Sonraki oyunda servetin, ünün ve en iyi üç çalışanınla seri girişimci olarak başlayabilirsin.</p></div></section>`);}

