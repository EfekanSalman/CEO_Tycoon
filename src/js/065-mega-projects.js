/* ============================== MEGA PROJECTS ============================== */
const MEGA=[
  {id:'edu',n:(LANG_EN?"Education foundation":'Eğitim vakfı'),cost:40e6,mo:6,d:(LANG_EN?"Scholarships and labs for universities: sustainability +8, brand +3, candidate quality +0.4.":'Üniversitelere burs ve laboratuvar: sürdürülebilirlik +8, marka +3, aday kalitesi +0,4.')},
  {id:'campus',n:(LANG_EN?"Tech campus":'Teknoloji kampüsü'),cost:150e6,mo:24,d:(LANG_EN?"Your own campus: morale +5 for all employees, candidate quality +0.5, sustainability +3.":'Kendi kampüsün: tüm çalışanlarda moral +5, aday kalitesi +0,5, sürdürülebilirlik +3.')},
  {id:'hpc',n:(LANG_EN?"AI supercomputer":'Yapay zekâ süper bilgisayarı'),cost:300e6,mo:30,d:(LANG_EN?"Research speed +25%, AI product appeal +10%.":'Araştırma hızı +%25, yapay zekâ ürünlerinde çekicilik +%10.'),req:()=>has('ml'),rq:(LANG_EN?"Machine learning research":'Makine öğrenmesi araştırması')},
  {id:'dist',n:(LANG_EN?"Global distribution network":'Küresel dağıtım ağı'),cost:250e6,mo:24,d:(LANG_EN?"Your own logistics: appeal +6% for all hardware products.":'Kendi lojistiğin: tüm donanım ürünlerinde çekicilik +%6.'),req:()=>G.products.some(p=>p.owner==='P'&&HW.includes(p.cat)),rq:(LANG_EN?"A hardware product":'Bir donanım ürünü')},
  {id:'city',n:(LANG_EN?"Smart city":'Akıllı şehir'),cost:400e6,mo:36,d:(LANG_EN?"Joint project with municipalities: once complete, it earns 1.2% of its cost every month for 10 years, brand +4.":'Belediyelerle ortak proje: tamamlanınca 10 yıl boyunca her ay maliyetin %1,2\'si kadar gelir, marka +4.')},
  {id:'moon',n:(LANG_EN?"Crewed space mission":'İnsanlı uzay görevi'),cost:1.2e9,mo:60,d:(LANG_EN?"Make history: brand +12, awareness +10 in all regions, fame.":'Tarihe geç: marka +12, tüm bölgelerde bilinirlik +10, şöhret.'),req:()=>has('sat1'),rq:(LANG_EN?"Satellite technology research":'Uydu teknolojisi araştırması')}];
const MEGAD=Object.fromEntries(MEGA.map(m=>[m.id,m])),MEGA_MAX=2,MEGA_VAL=50e6;
const newMega=()=>({act:[],done:{},log:[]});
const megaOn=id=>!!(typeof G!=='undefined'&&G&&G.mega&&G.mega.done[id]!=null);
const megaUnl=()=>!!G.mega&&(G.mega.act.length>0||Object.keys(G.mega.done).length>0||valuation()>=MEGA_VAL);
const megaCand=()=>(megaOn('edu')?0.4:0)+(megaOn('campus')?0.5:0);
const megaApp=p=>(p.cat==='ai'&&megaOn('hpc')?1.1:1)*(HW.includes(p.cat)&&megaOn('dist')?1.06:1);
const megaInst=a=>a.cost/a.mo;
function megaLog(t,k=''){const M=G.mega;M.log.unshift({d:G.day,t,k});if(M.log.length>15)M.log.pop();}
function megaCan(m){const M=G.mega;if(!M)return (LANG_EN?"No":'Yok');if(M.done[m.id]!=null||M.act.some(a=>a.id===m.id))return (LANG_EN?"Already owned":'Zaten var');if(!megaUnl())return (LANG_EN?`Company value must reach ${money(MEGA_VAL)}`:`Şirket değerin ${money(MEGA_VAL)} olmalı`);if(m.req&&!m.req())return (LANG_EN?`Requires: ${m.rq}`:`Gerekli: ${m.rq}`);
  if(M.act.length>=MEGA_MAX)return (LANG_EN?`Up to ${MEGA_MAX} megaprojects can run at once`:`Aynı anda en fazla ${MEGA_MAX} büyük proje yürütülebilir`);const inst=m.cost*infl()/m.mo;if(G.cash<inst*3)return (LANG_EN?`At least ${money(inst*3)} cash needed for the first installments`:`İlk taksitler için en az ${money(inst*3)} nakit gerekli`);return '';}
function megaDone(a){const m=MEGAD[a.id],M=G.mega;M.done[a.id]=G.day;tl('star',(LANG_EN?`${m.n} completed`:`${m.n} tamamlandı`));news((LANG_EN?`${G.name} completed its ${m.n.toLocaleLowerCase(LOC)} project!`:`${G.name}, ${m.n.toLocaleLowerCase(LOC)} projesini tamamladı!`),'good',true);megaLog((LANG_EN?`${m.n} completed.`:`${m.n} tamamlandı.`),'good');
  (G.flags=G.flags||{}).mega=(G.flags.mega||0)+1;if(typeof ceoXP==='function')ceoXP(60,m.n);
  if(a.id==='edu')G.brand=clamp(G.brand+3,0,100);
  if(a.id==='city'){M.city=a.cost;G.brand=clamp(G.brand+4,0,100);}
  if(a.id==='moon'){G.brand=clamp(G.brand+12,0,100);for(const r of REG_ORDER)if(G.regions[r])G.regions[r].aw=clamp(G.regions[r].aw+0.1,0,1);G.fame=(G.fame||0)+10;}}
function megaMonthly(){const M=G.mega;if(!M)return;
  for(const a of M.act.slice()){const inst=megaInst(a),m=MEGAD[a.id];
    if(G.cash<inst*1.5){if(!a.stall)megaLog((LANG_EN?`${m.n}: payments paused for lack of cash; the project is on hold.`:`${m.n}: nakit yetmediği için ödeme durdu; proje bekliyor.`),'bad');a.stall=(a.stall||0)+1;continue;}
    if(a.stall){a.stall=0;megaLog((LANG_EN?`${m.n} is moving again.`:`${m.n} yeniden ilerliyor.`));}
    spend(inst,'other');a.paid+=inst;a.m++;
    if(a.m===Math.ceil(a.mo/2)&&a.mo>=12)news((LANG_EN?`${m.n} is halfway done.`:`${m.n} projesi yarı yolda.`));
    if(a.m>=a.mo){M.act=M.act.filter(x=>x!==a);megaDone(a);}}
  if(M.city&&M.done.city!=null&&G.day-M.done.city<3650){const inc=M.city*0.012;G.cash+=inc;G.month.rev+=inc;}}
function vMega(){const M=G.mega;
  const act=M.act.map(a=>{const m=MEGAD[a.id],f=a.m/a.mo;return (LANG_EN?`<div class="proj col" style="gap:6px"><div class="row between"><b>${m.n}</b><span class="chip ${a.stall?'st-bad':'st-ok'}">${a.stall?"Awaiting payment":`${a.m}/${a.mo} mo`}</span></div>
    <div class="bar" role="img" aria-label="Progress ${Math.round(f*100)} percent"><i style="width:${Math.round(f*100)}%;background:var(--ch1)"></i></div>
    <div class="small muted">Monthly installment ${money(megaInst(a))} · paid ${money(a.paid)} / ${money(a.cost)} · est. finish ${fmtDate(G.day+(a.mo-a.m)*30)}</div><div class="small">${m.d}</div>
    <div><button class="btn sm ghost" data-act="megacancel" data-k="${a.id}">Cancel · ${money(a.paid*0.3)} refunded</button></div></div>`:`<div class="proj col" style="gap:6px"><div class="row between"><b>${m.n}</b><span class="chip ${a.stall?'st-bad':'st-ok'}">${a.stall?'Ödeme bekliyor':`${a.m}/${a.mo} ay`}</span></div>
    <div class="bar" role="img" aria-label="İlerleme yüzde ${Math.round(f*100)}"><i style="width:${Math.round(f*100)}%;background:var(--ch1)"></i></div>
    <div class="small muted">Aylık taksit ${money(megaInst(a))} · ödenen ${money(a.paid)} / ${money(a.cost)} · tahmini bitiş ${fmtDate(G.day+(a.mo-a.m)*30)}</div><div class="small">${m.d}</div>
    <div><button class="btn sm ghost" data-act="megacancel" data-k="${a.id}">İptal et · ${money(a.paid*0.3)} geri gelir</button></div></div>`);}).join('');
  const list=MEGA.filter(m=>M.done[m.id]==null&&!M.act.some(a=>a.id===m.id)).map(m=>{const why=megaCan(m),c=m.cost*infl();
    return (LANG_EN?`<div class="proj col" style="gap:6px"><div class="row between" style="gap:8px"><b>${m.n}</b><span class="small muted num">${money(c)} · ${m.mo} mo</span></div><div class="small">${m.d}</div>
    <div class="row between" style="gap:8px"><span class="small muted">Monthly ${money(c/m.mo)}</span><button class="btn sm primary" data-act="megago" data-k="${m.id}" ${why?'disabled':''}>Start</button></div>${why?`<div class="small warn">${esc(why)}</div>`:''}</div>`:`<div class="proj col" style="gap:6px"><div class="row between" style="gap:8px"><b>${m.n}</b><span class="small muted num">${money(c)} · ${m.mo} ay</span></div><div class="small">${m.d}</div>
    <div class="row between" style="gap:8px"><span class="small muted">Aylık ${money(c/m.mo)}</span><button class="btn sm primary" data-act="megago" data-k="${m.id}" ${why?'disabled':''}>Başlat</button></div>${why?`<div class="small warn">${esc(why)}</div>`:''}</div>`);}).join('');
  const done=MEGA.filter(m=>M.done[m.id]!=null).map(m=>`<li><span class="small muted num" style="min-width:86px">${fmtDate(M.done[m.id])}</span><span><b>${m.n}</b> · ${m.d}</span></li>`).join('');
  const lg=M.log.slice(0,8).map(l=>`<li><span class="small muted num" style="min-width:86px">${fmtDate(l.d)}</span><span class="${l.k==='bad'?'neg':l.k==='good'?'pos':''}">${esc(l.t)}</span></li>`).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Megaprojects${helpBtn('mega')}</h2><span class="sub">${M.act.length}/${MEGA_MAX} active · ${Object.keys(M.done).length}/${MEGA.length} completed</span></div>
    <div class="pb col"><p class="small muted">Turn surplus cash into a lasting advantage. The cost is paid in monthly installments; in any month your cash can't cover one and a half installments, the project waits, and nothing paid is lost.</p>${act?`<div class="grid">${act}</div>`:"<div class=\"small muted\">No megaprojects in progress.</div>"}</div></section>
  <section class="panel"><div class="ph"><h2>Available projects</h2></div><div class="pb">${list?`<div class="grid">${list}</div>`:"<div class=\"empty\">All completed or in progress.</div>"}</div></section>
  ${done?`<section class="panel"><div class="ph"><h2>Completed</h2></div><ul class="alerts">${done}</ul></section>`:''}
  ${lg?`<section class="panel"><div class="ph"><h2>Project log</h2></div><ul class="alerts">${lg}</ul></section>`:''}`:`<section class="panel"><div class="ph"><h2>Büyük projeler${helpBtn('mega')}</h2><span class="sub">${M.act.length}/${MEGA_MAX} aktif · ${Object.keys(M.done).length}/${MEGA.length} tamamlandı</span></div>
    <div class="pb col"><p class="small muted">Biriken nakdi kalıcı avantaja çevir. Bedel aylık taksitlerle ödenir; nakdin bir buçuk taksiti karşılamadığı ay proje bekler, ödenen kaybolmaz.</p>${act?`<div class="grid">${act}</div>`:'<div class="small muted">Şu an süren büyük proje yok.</div>'}</div></section>
  <section class="panel"><div class="ph"><h2>Başlatılabilecek projeler</h2></div><div class="pb">${list?`<div class="grid">${list}</div>`:'<div class="empty">Hepsi tamamlandı ya da sürüyor.</div>'}</div></section>
  ${done?`<section class="panel"><div class="ph"><h2>Tamamlananlar</h2></div><ul class="alerts">${done}</ul></section>`:''}
  ${lg?`<section class="panel"><div class="ph"><h2>Proje günlüğü</h2></div><ul class="alerts">${lg}</ul></section>`:''}`);}

