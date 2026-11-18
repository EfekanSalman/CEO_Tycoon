/* ============================== TECH AWARDS ============================== */
const newAw=()=>({y:null,noms:null,camp:false,hist:[],won:[]});
const AW_T={poty:(LANG_EN?"Product of the Year":'Yılın Ürünü'),cat:(LANG_EN?"Best of the Year":'Yılın En İyi'),startup:(LANG_EN?"Startup of the Year":'Yılın Girişimi'),employer:(LANG_EN?"Employer of the Year":'Yılın İşvereni'),green:(LANG_EN?"Green Tech Award":'Yeşil Teknoloji Ödülü'),innov:(LANG_EN?"Innovation of the Year":'Yılın İnovasyonu')};
const AW_FX={poty:(LANG_EN?"Brand +4, product 25% more appealing for 3 months, team morale +5":'Marka +4, ürün 3 ay boyunca %25 daha çekici, ekip morali +5'),cat:(LANG_EN?"Brand +1.5, product 12% more appealing for 2 months":'Marka +1,5, ürün 2 ay boyunca %12 daha çekici'),startup:(LANG_EN?"Brand +3":'Marka +3'),employer:(LANG_EN?"Whole team morale +5, more talented candidates for a year":'Bütün ekibin morali +5, bir yıl boyunca daha yetenekli adaylar'),green:(LANG_EN?"Brand +2, sustainability score +3":'Marka +2, sürdürülebilirlik puanı +3'),innov:(LANG_EN?"Brand +2, momentum +5":'Marka +2, ivme +5')};
const awTitle=a=>a.k==='cat'?`${AW_T.cat} ${CATS[a.cat].n}`:AW_T[a.k];
const awYear=()=>dateOf(G.day).getFullYear();
function awProdM(p){const v=p.score/S(p.cat);let m=v*(1+0.3*Math.min(1,p.share||0));if(p.owner==='P'&&p.review)m*=0.9+(p.review-6)*0.03;return m;}
const awProdN=p=>({id:p.id,o:p.owner,n:p.name,sub:ownerName(p.owner),m:awProdM(p)});
function awCompSc(c,k,lo,hi){const key='aw_'+k;if(c[key]==null)c[key]=rnd(lo,hi);c[key]=clamp(c[key]+rnd(-4,4),20,95);return c[key];}
function awNominate(){
  const A=G.aw,live=liveComps(),act=G.products.filter(p=>p.active&&(p.owner==='P'||comp(p.owner)&&!comp(p.owner).dead)),list=[];
  const top=(arr,n)=>arr.filter(x=>isFinite(x.m)&&x.m>0).sort((a,b)=>b.m-a.m).slice(0,n);
  const fresh=act.filter(p=>G.day-(p.updAt||p.launch)<=365);
  const poty=top(fresh.map(awProdN),5);if(poty.length>=3)list.push({k:'poty',noms:poty});
  for(const cat of CAT_ORDER){const ps=act.filter(p=>p.cat===cat);if(ps.length<3)continue;list.push({k:'cat',cat,noms:top(ps.map(awProdN),4)});}
  const young=live.filter(c=>!COMP_SEED.some(x=>x.name===c.name)&&G.day-(c.born||0)<5*365).map(c=>({id:c.id,o:c.id,n:c.name,sub:'',m:compVal(c)/1e6}));
  if(G.day<5*365)young.push({id:'P',o:'P',n:G.name,sub:'',m:valuation()/1e6});
  {const t=top(young,4);if(t.length>=3)list.push({k:'startup',noms:t});}
  const es=G.emps.filter(e=>!e.leave),mor=es.length?es.reduce((a,e)=>a+e.morale,0)/es.length:0;
  const emp=live.filter(c=>c.emp>=100).map(c=>({id:c.id,o:c.id,n:c.name,sub:'',m:awCompSc(c,'emp',50,85)}));
  if(es.length>=20)emp.push({id:'P',o:'P',n:G.name,sub:'',m:mor+(G.flags&&G.flags.listen?5:0)-(strikeOn()?30:0)+(G.perks?Object.values(G.perks).filter(Boolean).length*1.5:0)});
  {const t=top(emp,4);if(t.length>=3)list.push({k:'employer',noms:t});}
  const gr=live.filter(c=>c.emp>=60).map(c=>({id:c.id,o:c.id,n:c.name,sub:'',m:awCompSc(c,'esg',35,75)}));
  if(G.esg&&G.emps.length>=10)gr.push({id:'P',o:'P',n:G.name,sub:'',m:G.esg.score});
  {const t=top(gr,4);if(t.length>=3)list.push({k:'green',noms:t});}
  const rc=Object.values(G.res.done).filter(d=>d!=null&&d>0&&G.day-d<=365).length,pf=(G.pats||[]).filter(p=>p.grant!=null&&G.day-p.grant<=365).length;
  const inn=live.filter(c=>c.emp>=40).map(c=>({id:c.id,o:c.id,n:c.name,sub:'',m:Math.max(1,(c.tech-0.85)*120+rnd(0,10))}));
  if(rc>0)inn.push({id:'P',o:'P',n:G.name,sub:'',m:rc*6+pf*4+(G.dev?G.dev.oss.length*2:0)});
  {const t=top(inn,4);if(t.length>=3)list.push({k:'innov',noms:t});}
  A.y=awYear();A.noms=list;A.camp=false;
  const mine=list.filter(a=>a.noms.some(x=>x.o==='P'));
  if(mine.length)news((LANG_EN?`Tech award nominees announced: you have ${mine.length} nominations (${mine.map(awTitle).join(', ')}). The ceremony is on December 10.`:`Teknoloji ödülleri adayları açıklandı: ${mine.length} adaylığın var (${mine.map(awTitle).join(', ')}). Tören 10 Aralık'ta.`),'good',true);
  else news((LANG_EN?"Tech award nominees announced. You weren't nominated this year.":'Teknoloji ödülleri adayları açıklandı. Bu yıl aday gösterilmedin.'),'mkt');
}
const awMine=()=>G.aw&&G.aw.noms?G.aw.noms.filter(a=>a.noms.some(x=>x.o==='P')):[];
const awCampCost=()=>100000*infl()*(1+awMine().length*0.5);
function awHype(p,m,d){if(!p)return;const h=p.hype&&p.hype.until>G.day?p.hype:null;p.hype={m:Math.max(m,h?h.m:1),until:Math.max(G.day+d,h?h.until:0)};}
function awCeremony(){
  const A=G.aw;if(!A.noms)return;const res=[];let mineN=0,wonN=0;
  for(const a of A.noms){const mx=Math.max(...a.noms.map(x=>x.m));
    const w=a.noms.map(x=>Math.pow(x.m/mx,8)*(x.o==='P'&&A.camp?1.6:1)),tot=w.reduce((s2,x)=>s2+x,0);let r=Math.random()*tot,win=a.noms[0];
    for(let i=0;i<a.noms.length;i++){r-=w[i];if(r<=0){win=a.noms[i];break;}}
    const me=a.noms.some(x=>x.o==='P');if(me)mineN++;
    res.push({k:a.k,cat:a.cat,t:awTitle(a),win:{n:win.n,sub:win.sub,o:win.o,me:win.o==='P'},noms:a.noms.map(x=>({n:x.n,sub:x.sub,me:x.o==='P'}))});
    if(win.o==='P'){wonN++;A.won.push({y:A.y,t:awTitle(a),n:win.n,k:a.k});
      const p=a.k==='poty'||a.k==='cat'?prod(win.id):null;
      if(a.k==='poty'){G.brand=clamp(G.brand+4,0,100);awHype(p,1.25,90);for(const e of G.emps)e.morale=clamp(e.morale+5,0,100);G.momentum+=5;tl('star',(LANG_EN?`${A.y} Product of the Year: ${win.n}`:`${A.y} Yılın Ürünü: ${win.n}`));}
      else if(a.k==='cat'){G.brand=clamp(G.brand+1.5,0,100);awHype(p,1.12,60);tl('star',`${A.y} ${awTitle(a)}: ${win.n}`);}
      else if(a.k==='startup'){G.brand=clamp(G.brand+3,0,100);tl('star',(LANG_EN?`${A.y} Startup of the Year`:`${A.y} Yılın Girişimi`));}
      else if(a.k==='employer'){for(const e of G.emps)e.morale=clamp(e.morale+5,0,100);G.brand=clamp(G.brand+1,0,100);A.empUntil=G.day+365;tl('star',(LANG_EN?`${A.y} Employer of the Year`:`${A.y} Yılın İşvereni`));}
      else if(a.k==='green'){G.brand=clamp(G.brand+2,0,100);if(G.esg)G.esg.score=clamp(G.esg.score+3,0,100);tl('star',(LANG_EN?`${A.y} Green Tech Award`:`${A.y} Yeşil Teknoloji Ödülü`));}
      else if(a.k==='innov'){G.brand=clamp(G.brand+2,0,100);G.momentum+=5;tl('star',(LANG_EN?`${A.y} Innovation of the Year`:`${A.y} Yılın İnovasyonu`));}
    }else{const c=comp(win.o);if(c)c.brand=clamp(c.brand+(a.k==='poty'?4:2),3,90);if(a.k==='poty'||a.k==='cat')awHype(prod(win.id),a.k==='poty'?1.2:1.1,60);}
  }
  A.hist.unshift({y:A.y,res,camp:A.camp});if(A.hist.length>12)A.hist.pop();A.noms=null;A.camp=false;
  if(wonN)ceoXP(40*wonN,(LANG_EN?`${wonN} tech awards`:`${wonN} teknoloji ödülü`));
  if(mineN){if(wonN)sfx('launch');news(wonN?(LANG_EN?`Tech awards: you won ${wonN} awards! ${A.won.filter(w=>w.y===A.y).map(w=>w.t).join(', ')}.`:`Teknoloji ödülleri: ${wonN} ödül kazandın! ${A.won.filter(w=>w.y===A.y).map(w=>w.t).join(', ')}.`):(LANG_EN?`Tech awards: you had ${mineN} nominations but won nothing this year.`:`Teknoloji ödülleri: ${mineN} adaylığın vardı ama bu yıl ödül çıkmadı.`),wonN?'good':'bad',true);
    G.prevSpeed=G.speed||1;G.speed=0;UI.awY=A.y;openModal('awards');}
  else{const p=res.find(r=>r.k==='poty');news((LANG_EN?`Tech awards handed out.${p?` Product of the year: ${p.win.n} (${p.win.sub}).`:''}`:`Teknoloji ödülleri dağıtıldı.${p?` Yılın ürünü: ${p.win.n} (${p.win.sub}).`:''}`),'mkt');}
}
function awDaily(){if(!G.aw)return;const d=dateOf(G.day),mo=d.getMonth(),dd=d.getDate();
  if(mo===10&&dd===15)awNominate();else if(mo===11&&dd===10&&G.aw.noms&&G.aw.y===awYear())awCeremony();}
const awHire=()=>G.aw&&G.aw.empUntil>G.day?0.3:0;
function awResHTML(h,mineOnly){
  return h.res.filter(r=>!mineOnly||r.noms.some(x=>x.me)).map(r=>(LANG_EN?`<div class="proj col" style="gap:6px"><div class="row between"><b>${esc(r.t)}</b>${r.win.me?"<span class=\"chip st-ok\">🏆 You won</span>":r.noms.some(x=>x.me)?"<span class=\"chip st-mute\">Nominee</span>":''}</div>
    <div class="small"><b class="${r.win.me?'pos':''}">${esc(r.win.n)}</b>${r.win.sub&&r.win.sub!==r.win.n?` <span class="muted">· ${esc(r.win.sub)}</span>`:''}</div>
    <div class="small muted">Nominees: ${r.noms.map(x=>x.me?`<b>${esc(x.n)}</b>`:esc(x.n)).join(', ')}</div></div>`:`<div class="proj col" style="gap:6px"><div class="row between"><b>${esc(r.t)}</b>${r.win.me?'<span class="chip st-ok">🏆 Kazandın</span>':r.noms.some(x=>x.me)?'<span class="chip st-mute">Aday</span>':''}</div>
    <div class="small"><b class="${r.win.me?'pos':''}">${esc(r.win.n)}</b>${r.win.sub&&r.win.sub!==r.win.n?` <span class="muted">· ${esc(r.win.sub)}</span>`:''}</div>
    <div class="small muted">Adaylar: ${r.noms.map(x=>x.me?`<b>${esc(x.n)}</b>`:esc(x.n)).join(', ')}</div></div>`)).join('');
}
function vAwards(){
  const A=G.aw,mine=awMine(),cost=awCampCost(),y=awYear();
  const pend=A.noms&&A.y===y;
  const cer=new Date(y,11,10),days=Math.max(0,Math.round((cer-dateOf(G.day))/864e5));
  const nomCards=pend?A.noms.map(a=>{const me=a.noms.some(x=>x.o==='P');return `<div class="proj col" style="gap:6px${me?(LANG_EN?";border-color:var(--accent)":';border-color:var(--accent)'):''}"><div class="row between"><b>${esc(awTitle(a))}</b>${me?(LANG_EN?"<span class=\"chip st-warn\">Nominated</span>":'<span class="chip st-warn">Adaysın</span>'):''}</div>
    <ol class="small" style="margin:0;padding-left:18px">${a.noms.map(x=>`<li>${x.o==='P'?`<b>${esc(x.n)}</b>`:esc(x.n)}${x.sub&&x.sub!==x.n?` <span class="muted">· ${esc(x.sub)}</span>`:''}</li>`).join('')}</ol></div>`;}).join(''):'';
  const byY={};for(const w of A.won)(byY[w.y]=byY[w.y]||[]).push(w);
  const cab=Object.keys(byY).sort((a,b)=>b-a).map(yy=>`<div class="col" style="gap:4px"><b class="small">${yy}</b>${byY[yy].map(w=>`<div class="small" style="display:grid;grid-template-columns:auto 1fr;gap:8px"><span aria-hidden="true">🏆</span><span>${esc(w.t)}${w.k==='poty'||w.k==='cat'?` <span class="muted">· ${esc(w.n)}</span>`:''}</span></div>`).join('')}</div>`).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Tech awards${helpBtn('awards')}</h2><span class="sub">${A.won.length} awards</span></div>
    <div class="kpis"><div class="kpi"><span>Total awards</span><b>${A.won.length}</b></div><div class="kpi"><span>Product of the year</span><b>${A.won.filter(w=>w.k==='poty').length}</b></div><div class="kpi"><span>Nominations this year</span><b>${pend?mine.length:'—'}</b></div><div class="kpi"><span>Next ceremony</span><b>${pend?days+" days":"Dec 10 "+y}</b></div></div>
    <div class="pb small muted">Nominees are announced every November 15, and awards are handed out on December 10. Products are nominated based on freshness, market share, and press score; companies based on valuation, team morale, sustainability score, and that year's research.</div></section>
  ${pend?`<section class="panel"><div class="ph"><h2>${y} nominees</h2><span class="sub">Ceremony in ${days} days</span></div><div class="pb col" style="gap:12px">
    ${mine.length?`<div class="row between" style="gap:12px;flex-wrap:wrap"><div class="small">${A.camp?"<b class=\"pos\">Your awards campaign is running.</b> Jury events, a press tour, and ads: better odds of winning in your categories.":`Run an awards campaign so the jury notices you more and your odds of winning go up.`}</div>${A.camp?'':`<button class="btn sm primary" data-act="awcamp" ${G.cash<cost?'disabled':''}>Run campaign · ${money(cost)}</button>`}</div>`:"<div class=\"small muted\">You weren't nominated this year.</div>"}
    <div class="grid3">${nomCards}</div></div></section>`:''}
  <section class="panel"><div class="ph"><h2>${biMini(20)}Trophy cabinet</h2></div><div class="pb">${cab?`<div class="grid3">${cab}</div>`:"<div class=\"small muted\">No awards yet. The first ones come with a great product or a fast-growing company.</div>"}</div></section>
  ${A.hist.length?`<section class="panel"><div class="ph"><h2>${A.hist[0].y} ceremony</h2></div><div class="pb"><div class="grid3">${awResHTML(A.hist[0],false)}</div></div></section>`:''}`:`<section class="panel"><div class="ph"><h2>Teknoloji ödülleri${helpBtn('awards')}</h2><span class="sub">${A.won.length} ödül</span></div>
    <div class="kpis"><div class="kpi"><span>Toplam ödül</span><b>${A.won.length}</b></div><div class="kpi"><span>Yılın ürünü</span><b>${A.won.filter(w=>w.k==='poty').length}</b></div><div class="kpi"><span>Bu yılki adaylık</span><b>${pend?mine.length:'—'}</b></div><div class="kpi"><span>Sonraki tören</span><b>${pend?days+' gün':'10 Ara '+y}</b></div></div>
    <div class="pb small muted">Adaylar her yıl 15 Kasım'da açıklanır, ödüller 10 Aralık'ta verilir. Ürünler güncelliklerine, pazar paylarına ve basın puanlarına göre; şirketler değerlemeye, ekip moraline, sürdürülebilirlik puanına ve o yılki araştırmalarına göre aday gösterilir.</div></section>
  ${pend?`<section class="panel"><div class="ph"><h2>${y} adayları</h2><span class="sub">Tören ${days} gün sonra</span></div><div class="pb col" style="gap:12px">
    ${mine.length?`<div class="row between" style="gap:12px;flex-wrap:wrap"><div class="small">${A.camp?'<b class="pos">Ödül kampanyan sürüyor.</b> Jüri üyeleriyle tanıtım etkinlikleri, basın turu ve reklamlar: adaylıklarında kazanma şansın daha yüksek.':`Ödül kampanyası yürütürsen jüri seni daha çok görür ve kazanma şansın artar.`}</div>${A.camp?'':`<button class="btn sm primary" data-act="awcamp" ${G.cash<cost?'disabled':''}>Kampanya yürüt · ${money(cost)}</button>`}</div>`:'<div class="small muted">Bu yıl aday gösterilmedin.</div>'}
    <div class="grid3">${nomCards}</div></div></section>`:''}
  <section class="panel"><div class="ph"><h2>${biMini(20)}Ödül dolabı</h2></div><div class="pb">${cab?`<div class="grid3">${cab}</div>`:'<div class="small muted">Henüz ödülün yok. İlk ödüller iyi bir ürünle ya da hızla büyüyen bir şirketle gelir.</div>'}</div></section>
  ${A.hist.length?`<section class="panel"><div class="ph"><h2>${A.hist[0].y} töreni</h2></div><div class="pb"><div class="grid3">${awResHTML(A.hist[0],false)}</div></div></section>`:''}`);
}

