/* ============================== SCENARIO EDITOR ============================== */
const MYSCN_KEY='silikon-garaj-myscn';
const SED_SW=['app','saas','os','ai','car'];
const SED_YRS=[0,3,5,7,10,15];
const SED_EV=[[0.25,(LANG_EN?"Rare":'Seyrek')],[0.42,(LANG_EN?"Normal":'Normal')],[0.6,(LANG_EN?"Frequent":'Sık')]];
const SED_RIV={weak:(LANG_EN?"Weak":'Zayıf'),normal:(LANG_EN?"Normal":'Normal'),strong:(LANG_EN?"Strong":'Güçlü'),brutal:(LANG_EN?"Ruthless":'Acımasız')};
const GOAL_ED={
  val:{n:(LANG_EN?"Company valuation":'Şirket değerlemesi'),a:'m',def:100,mk:g=>SCN_GOALS.val(g.t*1e6)},
  rev:{n:(LANG_EN?"Monthly revenue":'Aylık gelir'),a:'m',def:5,mk:g=>SCN_GOALS.rev(g.t*1e6)},
  profit:{n:(LANG_EN?"Monthly profit":'Aylık kâr'),a:'m',def:1,mk:g=>SCN_GOALS.profit(g.t*1e6)},
  pub:{n:(LANG_EN?"Go public":'Halka arz ol'),a:'',mk:()=>SCN_GOALS.pub()},
  streak:{n:(LANG_EN?"Consecutive profitable months":'Üst üste kâr eden ay'),a:'n',def:12,mk:g=>SCN_GOALS.streak(g.t)},
  regions:{n:(LANG_EN?"Operating in all 5 regions":'5 bölgenin hepsinde faaliyet'),a:'',mk:()=>SCN_GOALS.regions()},
  regRev:{n:(LANG_EN?"Monthly revenue from each region":'Her bölgeden aylık gelir'),a:'m',def:1,mk:g=>SCN_GOALS.regRev(g.t*1e6)},
  eco:{n:(LANG_EN?"5 ecosystem links":'5 ekosistem bağlantısı'),a:'',mk:()=>SCN_GOALS.eco()},
  base:{n:(LANG_EN?"Installed base on your own OS":'Kendi OS\'unla kurulu taban'),a:'n',def:1000000,mk:g=>SCN_GOALS.base(g.t)},
  catShare:{n:(LANG_EN?"Market share in a category":'Kategoride pazar payı'),a:'cat',def:30,mk:g=>SCN_GOALS.catShare(g.c,g.t/100)},
  fab:{n:(LANG_EN?"Your own chip fab in production":'Kendi çip fabrikan üretimde'),a:'',mk:()=>SCN_GOALS.fab()},
  debt:{n:(LANG_EN?"Pay off starting debt":'Başlangıç borcunu kapat'),a:'',mk:(g,d)=>SCN_GOALS.debt(d.debt)},
  tech:{n:(LANG_EN?"Complete research":'Araştırmayı tamamla'),a:'res',def:0,mk:g=>SCN_GOALS.tech(g.r)},
  brand:{n:(LANG_EN?"Brand strength":'Marka gücü'),a:'n',def:70,mk:g=>SCN_GOALS.brand(g.t)},
  emps:{n:(LANG_EN?"Headcount":'Çalışan sayısı'),a:'n',def:200,mk:g=>SCN_GOALS.emps(g.t)},
  aw:{n:(LANG_EN?"Tech awards won":'Teknoloji ödülü sayısı'),a:'n',def:3,mk:g=>SCN_GOALS.aw(g.t)},
  esg:{n:(LANG_EN?"Sustainability score":'Sürdürülebilirlik puanı'),a:'n',def:75,mk:g=>SCN_GOALS.esg(g.t)},
  shops:{n:(LANG_EN?"Open stores":'Açık mağaza sayısı'),a:'n',def:10,mk:g=>SCN_GOALS.shops(g.t)},
  aiw:{n:(LANG_EN?"AI agents":'Yapay zekâ ajanı sayısı'),a:'n',def:20,mk:g=>SCN_GOALS.aiw(g.t)},
  bun:{n:(LANG_EN?"Subscription bundle subscribers":'Abonelik paketi abonesi'),a:'n',def:50000,mk:g=>SCN_GOALS.bun(g.t)},
  fairAw:{n:(LANG_EN?"Trade show awards won":'Fuar ödülü sayısı'),a:'n',def:2,mk:g=>SCN_GOALS.fairAw(g.t)},
  trust:{n:(LANG_EN?"User trust (at year end)":'Kullanıcı güveni (yıl sonunda)'),a:'n',def:75,mk:g=>SCN_GOALS.trust(g.t)},
  sats:{n:(LANG_EN?"Satellites in orbit":'Yörüngedeki uydu sayısı'),a:'n',def:200,mk:g=>SCN_GOALS.sats(g.t)},
  quests:{n:(LANG_EN?"Quests completed":'Tamamlanan görev sayısı'),a:'n',def:5,mk:g=>SCN_GOALS.quests(g.t)},
  bmWin:{n:(LANG_EN?"Board votes won":'Kurulda kazanılan oylama'),a:'n',def:5,mk:g=>SCN_GOALS.bmWin(g.t)},
};
const sedStr=(v,n)=>String(v==null?'':v).replace(/[<>]/g,'').trim().slice(0,n);
const sedNum=(v,lo,hi,d)=>{v=+v;return isFinite(v)?clamp(v,lo,hi):d;};
function sedDefault(){return {v:1,id:Date.now().toString(36),n:(LANG_EN?"My scenario":'Benim senaryom'),d:'',nm:(LANG_EN?"New Venture":'Yeni Girişim'),intro:'',diff:2,yrs:5,cash:500000,debt:0,eq:1,brand:5,office:1,racks:0,mor:65,
  team:Object.fromEntries(Object.keys(ROLES).map(r=>[r,[r==='soft'||r==='design'?2:0,5]])),res:['fw'],prods:[],regs:[],px:1,dem:1,ev:0.42,riv:'normal',goals:[{k:'val',t:50}]};}
function scnSan(d){d=d&&typeof d==='object'?d:{};const o=sedDefault();
  o.id=String(d.id||o.id).replace(/[^a-z0-9]/gi,'').slice(0,14)||o.id;o.n=sedStr(d.n,40)||(LANG_EN?"Untitled scenario":'Adsız senaryo');o.d=sedStr(d.d,300);o.nm=sedStr(d.nm,28)||(LANG_EN?"New Venture":'Yeni Girişim');o.intro=sedStr(d.intro,300);
  o.diff=Math.round(sedNum(d.diff,1,4,2));o.yrs=SED_YRS.includes(+d.yrs)?+d.yrs:5;
  o.cash=Math.round(sedNum(d.cash,0,1e9,500000));o.debt=Math.round(sedNum(d.debt,0,5e8,0));o.eq=sedNum(d.eq,0.2,1,1);o.brand=sedNum(d.brand,0,80,5);
  o.office=Math.round(sedNum(d.office,0,OFFICES.length-1,1));o.racks=Math.round(sedNum(d.racks,0,200,0));o.mor=sedNum(d.mor,20,95,65);
  o.team={};for(const r of Object.keys(ROLES)){const t=d.team&&Array.isArray(d.team[r])?d.team[r]:[0,5];o.team[r]=[Math.round(sedNum(t[0],0,60,0)),Math.round(sedNum(t[1],1,9,5)*10)/10];}
  o.res=[...new Set((Array.isArray(d.res)?d.res:[]).filter(x=>RESD[x]))];
  o.prods=(Array.isArray(d.prods)?d.prods:[]).filter(p=>p&&SED_SW.includes(p.cat)).slice(0,5).map(p=>({cat:p.cat,v:sedNum(p.v,0.5,1.3,1),name:sedStr(p.name,28)}));
  o.regs=(Array.isArray(d.regs)?d.regs:[]).filter(r=>REGS[r]&&r!=='tr');
  o.px=sedNum(d.px,0.6,1.6,1);o.dem=sedNum(d.dem,0.5,1.5,1);o.ev=SED_EV.some(x=>x[0]===+d.ev)?+d.ev:0.42;o.riv=SED_RIV[d.riv]?d.riv:'normal';
  o.goals=(Array.isArray(d.goals)?d.goals:[]).filter(g=>g&&GOAL_ED[g.k]).slice(0,6).map(g=>{const E=GOAL_ED[g.k],x={k:g.k};
    if(E.a==='m'||E.a==='n'||E.a==='cat')x.t=sedNum(g.t,E.a==='cat'?1:0.01,E.a==='cat'?100:1e10,E.def);if(E.a==='cat')x.c=CATS[g.c]?g.c:'cpu';if(E.a==='res')x.r=RESD[g.r]?g.r:'n14';return x;});
  return o;}
function resClosure(ids){const out=new Set();const add=id=>{if(out.has(id)||!RESD[id])return;out.add(id);for(const p of RESD[id].pre||[])add(p);};ids.forEach(add);return [...out];}
const sedTeamN=d=>Object.values(d.team).reduce((a,t)=>a+t[0],0);
function sedErrs(d){const e=[],cap=OFFICES[d.office].cap*OFFICES[d.office].maxF;
  if(sedTeamN(d)+1>cap)e.push((LANG_EN?`${OFFICES[d.office].n} holds at most ${cap} people; the team has ${sedTeamN(d)+1}.`:`${OFFICES[d.office].n} en fazla ${cap} kişi alır; ekip ${sedTeamN(d)+1} kişi.`));
  if(d.yrs&&!d.goals.length)e.push((LANG_EN?"Add at least one goal to a timed scenario, or set the duration to \"Untimed\".":'Süreli senaryoya en az bir hedef ekle ya da süreyi "Süresiz" yap.'));
  if(d.goals.some(g=>g.k==='debt')&&!d.debt)e.push((LANG_EN?"Enter a starting debt for the \"Pay off debt\" goal.":'"Borcu kapat" hedefi için başlangıç borcu gir.'));
  if(!sedTeamN(d)&&!d.prods.length&&d.cash<20000)e.push((LANG_EN?"No team, no products and no cash: the scenario can't be played.":'Ne ekip, ne ürün, ne de nakit var; senaryo oynanamaz.'));
  return e;}
function sedWarns(d){const w=[];if(d.prods.some(p=>p.cat==='saas'||p.cat==='ai')&&d.racks<2)w.push((LANG_EN?"Web services and AI services need servers; add a few racks.":'Web servisi ve yapay zekâ hizmeti sunucu ister; birkaç raf ekle.'));
  if(d.prods.length&&!d.team.soft[0])w.push((LANG_EN?"You have no developers to update the products.":'Ürünleri güncelleyecek yazılımcın yok.'));
  if(d.eq<0.5)w.push((LANG_EN?"Your stake is under 50%: the board could remove you.":'Hissen %50\'nin altında: yönetim kurulu seni görevden alabilir.'));
  const gk=new Set(d.goals.map(g=>g.k)),rs=new Set(resClosure(d.res));
  if(gk.has('aiw')&&!rs.has('ml'))w.push((LANG_EN?"The AI agent goal requires Machine Learning research first; pick the duration accordingly.":'Yapay zekâ ajanı hedefi için önce Makine öğrenmesi araştırılmalı; süreyi buna göre seç.'));
  if(gk.has('sats')&&!rs.has('sat1'))w.push((LANG_EN?"The satellite goal requires satellite research; pick a long duration or give the research as already done.":'Uydu hedefi için uydu araştırması gerekiyor; uzun bir süre seç ya da araştırmayı hazır ver.'));
  if(gk.has('bun')&&d.prods.filter(p=>['saas','ai','app'].includes(p.cat)).length<2)w.push((LANG_EN?"A subscription bundle needs at least two subscription software products.":'Abonelik paketi en az iki abonelikli yazılım ürünü ister.'));
  if(gk.has('bmWin'))w.push((LANG_EN?"The board meets after a funding round that sets one up.":'Yönetim kurulu, kurul kuran bir yatırım turundan sonra toplanır.'));
  return w;}
function myScns(){try{const a=JSON.parse(localStorage.getItem(MYSCN_KEY)||'[]');return Array.isArray(a)?a.map(scnSan):[];}catch(e){return [];}}
function myScnsSet(a){try{localStorage.setItem(MYSCN_KEY,JSON.stringify(a.slice(0,30)));return true;}catch(e){return false;}}
function scnCode(d){try{return (LANG_EN?"SG1.":'SG1.')+btoa(unescape(encodeURIComponent(JSON.stringify(d))));}catch(e){return '';}}
function scnDecode(t){try{t=String(t||'').trim();if(!t.startsWith('SG1.'))return null;return scnSan(JSON.parse(decodeURIComponent(escape(atob(t.slice(4))))));}catch(e){return null;}}
function scnFromDef(d){d=scnSan(d);const id='u_'+d.id,tn=sedTeamN(d)+1;
  const S0={id,custom:true,n:d.n,diff:d.diff,yrs:d.yrs||0,d:d.d||(LANG_EN?"A scenario of your own design.":'Kendi tasarladığın senaryo.'),intro:d.intro||'',
    start:(LANG_EN?`${money(d.cash)} cash${d.debt?', '+money(d.debt)+" debt":''}, ${tn} people, ${OFFICES[d.office].n.toLocaleLowerCase(LOC)}${d.prods.length?', '+d.prods.length+" products":''}`:`${money(d.cash)} nakit${d.debt?', '+money(d.debt)+' borç':''}, ${tn} kişi, ${OFFICES[d.office].n.toLocaleLowerCase(LOC)}${d.prods.length?', '+d.prods.length+' ürün':''}`),
    goals:d.yrs&&d.goals.length?()=>d.goals.map(g=>GOAL_ED[g.k].mk(g,d)):null,
    setup(){G.scnDef=d;G.name=d.nm;G.cash=d.cash;G.debt=d.debt;G.equity=d.eq;G.brand=d.brand;G.office=d.office;G.racks=d.racks;
      G.floors=clamp(Math.ceil(tn/OFFICES[d.office].cap),1,OFFICES[d.office].maxF);
      for(const r of resClosure([...d.res,...d.prods.map(p=>CAT_RES[p.cat]).filter(Boolean),...d.goals.filter(g=>g.k==='debt').map(()=>null).filter(Boolean)]))G.res.done[r]=0;
      if(G.emps[0])G.emps[0].morale=d.mor;
      for(const r of Object.keys(d.team)){const [n,sk]=d.team[r];for(let i=0;i<n;i++)scnHire(r,clamp(sk+rnd(-0.8,0.8),1,10),{morale:clamp(Math.round(d.mor+rnd(-8,8)),0,100)});}
      d.prods.forEach((p,i)=>scnSW(p.cat,p.v,p.name||`${d.nm.split(' ')[0]} ${{app:(LANG_EN?"App":'Uygulama'),saas:(LANG_EN?"Service":'Servis'),os:'OS',ai:(LANG_EN?"Assistant":'Asistan'),car:(LANG_EN?"Drive":'Sürüş')}[p.cat]}${d.prods.slice(0,i).filter(q=>q.cat===p.cat).length?' '+(d.prods.slice(0,i).filter(q=>q.cat===p.cat).length+1):''}`,rint(60,400),{review:clamp(Math.round((4+p.v*3)*10)/10,3,9),price:p.cat==='saas'||p.cat==='ai'||p.cat==='os'||p.cat==='car'?Math.round(CATS[p.cat].ref*Math.pow(p.v,1.2)*100)/100:undefined}));
      for(const r of d.regs)if(G.regions[r]){G.regions[r].in=true;G.regions[r].aw=Math.max(G.regions[r].aw,0.15);}
      G.mods={px:d.px,dem:d.dem,ev:d.ev,aggr:d.riv==='brutal'?0.3:d.riv==='strong'?0.1:0};for(const c in G.px)G.px[c]=d.px;
      const RV={weak:[0.5,0.92,-0.15],normal:[1,1,0],strong:[2,1.06,0.1],brutal:[3,1.12,0.3]}[d.riv];
      for(const c of G.comps){c.cash*=RV[0];c.tech=clamp(c.tech*RV[1],0.7,1.45);c.aggr=clamp(c.aggr+RV[2],0.05,0.95);}
      if(d.eq<0.999&&!G.rounds.seed)G.rounds.seed={d:0,amt:0};}};
  SCN[id]=S0;return S0;}
function sedSet(path,val){const d=UI.sed;if(!d)return;const p=path.split('.');
  if(p[0]==='sed'){const k=p[1];d[k]=['cash','debt','eq','brand','office','racks','mor','diff','yrs','px','dem','ev'].includes(k)?+val:val;if(k==='eq')d.eq=+val/100;}
  else if(p[0]==='sedt'){const t=d.team[p[1]];if(t)t[p[2]==='n'?0:1]=+val;}
  else if(p[0]==='sedg'){const g=d.goals[+p[1]];if(!g)return;if(p[2]==='k'){const E=GOAL_ED[val];if(!E)return;d.goals[+p[1]]={k:val,t:E.def,c:'cpu',r:'n14'};}else g[p[2]]=p[2]==='t'?+val:val;}
  else if(p[0]==='sedp'){const q=d.prods[+p[1]];if(!q)return;q[p[2]]=p[2]==='v'?+val/100:val;}
}
function vScnEd(){
  const d=UI.sed;if(!d)return (LANG_EN?"<section class=\"panel\"><div class=\"pb\">Editor is off. <button class=\"btn sm\" data-act=\"sedback\">Back to scenarios</button></div></section>":'<section class="panel"><div class="pb">Editör kapalı. <button class="btn sm" data-act="sedback">Senaryolara dön</button></div></section>');
  const errs=sedErrs(d),warns=sedWarns(d),tn=sedTeamN(d)+1,cap=OFFICES[d.office].cap*OFFICES[d.office].maxF;
  const sel=(path,opts,cur,num)=>`<select data-bind="${path}"${num?' data-num="1"':''}>${opts.map(([v,n])=>`<option value="${v}" ${String(v)===String(cur)?'selected':''}>${esc(n)}</option>`).join('')}</select>`;
  const numIn=(path,v,lo,hi,st,lbl,id)=>`<label class="f" for="${id}">${lbl}<input type="number" id="${id}" data-bind="${path}" data-num="1" min="${lo}" max="${hi}" step="${st}" value="${v}"></label>`;
  const team=Object.keys(ROLES).map(r=>(LANG_EN?`<div class="row" style="gap:8px;align-items:center"><span style="min-width:120px">${ROLES[r].n}</span>
    <input type="number" aria-label="${ROLES[r].n} count" data-bind="sedt.${r}.n" data-num="1" min="0" max="60" step="1" value="${d.team[r][0]}" style="width:70px">
    <label class="row small" style="gap:6px">skill <input type="range" aria-label="${ROLES[r].n} skill" data-bind="sedt.${r}.s" data-num="1" min="1" max="9" step="0.5" value="${d.team[r][1]}" style="width:110px"> <b class="num">${fx(d.team[r][1],1)}</b></label></div>`:`<div class="row" style="gap:8px;align-items:center"><span style="min-width:120px">${ROLES[r].n}</span>
    <input type="number" aria-label="${ROLES[r].n} sayısı" data-bind="sedt.${r}.n" data-num="1" min="0" max="60" step="1" value="${d.team[r][0]}" style="width:70px">
    <label class="row small" style="gap:6px">beceri <input type="range" aria-label="${ROLES[r].n} becerisi" data-bind="sedt.${r}.s" data-num="1" min="1" max="9" step="0.5" value="${d.team[r][1]}" style="width:110px"> <b class="num">${fx(d.team[r][1],1)}</b></label></div>`)).join('');
  const groups=[...new Set(RES.map(r=>r.g))];const inc=new Set(resClosure([...d.res,...d.prods.map(p=>CAT_RES[p.cat]).filter(Boolean)]));
  const res=groups.map(g=>`<div class="col" style="gap:4px"><b class="small">${g}</b><div class="row" style="gap:4px;flex-wrap:wrap">${RES.filter(r=>r.g===g).map(r=>`<button class="btn sm ${d.res.includes(r.id)?'primary':inc.has(r.id)?'':'ghost'}" aria-pressed="${d.res.includes(r.id)}" data-act="sedres" data-rid="${r.id}" title="${esc(r.d)}">${esc(r.n)}${!d.res.includes(r.id)&&inc.has(r.id)?' ✓':''}</button>`).join('')}</div></div>`).join('');
  const prods=d.prods.map((p,i)=>(LANG_EN?`<div class="row" style="gap:8px;flex-wrap:wrap;align-items:flex-end">
    <label class="f">Category${sel(`sedp.${i}.cat`,SED_SW.map(c=>[c,CATS[c].n]),p.cat)}</label>
    <label class="f" for="sp${i}n">Name (blank = automatic)<input type="text" id="sp${i}n" data-bind="sedp.${i}.name" value="${esc(p.name||'')}" maxlength="28"></label>
    <label class="f" for="sp${i}v"><span class="lbl">Freshness: <b class="num">${Math.round(p.v*100)}%</b></span><input type="range" id="sp${i}v" data-bind="sedp.${i}.v" data-num="1" min="50" max="130" step="5" value="${Math.round(p.v*100)}"></label>
    <button class="btn sm ghost" data-act="sedpdel" data-i="${i}" aria-label="Remove product">Remove</button></div>`:`<div class="row" style="gap:8px;flex-wrap:wrap;align-items:flex-end">
    <label class="f">Kategori${sel(`sedp.${i}.cat`,SED_SW.map(c=>[c,CATS[c].n]),p.cat)}</label>
    <label class="f" for="sp${i}n">Ad (boş = otomatik)<input type="text" id="sp${i}n" data-bind="sedp.${i}.name" value="${esc(p.name||'')}" maxlength="28"></label>
    <label class="f" for="sp${i}v"><span class="lbl">Güncellik: <b class="num">%${Math.round(p.v*100)}</b></span><input type="range" id="sp${i}v" data-bind="sedp.${i}.v" data-num="1" min="50" max="130" step="5" value="${Math.round(p.v*100)}"></label>
    <button class="btn sm ghost" data-act="sedpdel" data-i="${i}" aria-label="Ürünü kaldır">Kaldır</button></div>`)).join('');
  const goals=d.goals.map((g,i)=>{const E=GOAL_ED[g.k];return (LANG_EN?`<div class="row" style="gap:8px;flex-wrap:wrap;align-items:flex-end">
    <label class="f">Goal${sel(`sedg.${i}.k`,Object.entries(GOAL_ED).map(([k,x])=>[k,x.n]),g.k)}</label>
    ${E.a==='m'?numIn(`sedg.${i}.t`,g.t,0.01,1e6,'any',"Million $",'sg'+i):E.a==='n'?numIn(`sedg.${i}.t`,g.t,1,1e9,1,"Value",'sg'+i):E.a==='cat'?`<label class="f">Category${sel(`sedg.${i}.c`,CAT_ORDER.map(c=>[c,CATS[c].n]),g.c)}</label>${numIn(`sedg.${i}.t`,g.t,1,100,1,"Share %",'sg'+i)}`:E.a==='res'?`<label class="f">Research${sel(`sedg.${i}.r`,RES.map(r=>[r.id,r.n]),g.r)}</label>`:''}
    <span class="small muted" style="padding-bottom:8px">${esc(E.mk(g,d).n)}</span>
    <button class="btn sm ghost" data-act="sedgdel" data-i="${i}">Remove</button></div>`:`<div class="row" style="gap:8px;flex-wrap:wrap;align-items:flex-end">
    <label class="f">Hedef${sel(`sedg.${i}.k`,Object.entries(GOAL_ED).map(([k,x])=>[k,x.n]),g.k)}</label>
    ${E.a==='m'?numIn(`sedg.${i}.t`,g.t,0.01,1e6,'any','Milyon $','sg'+i):E.a==='n'?numIn(`sedg.${i}.t`,g.t,1,1e9,1,'Değer','sg'+i):E.a==='cat'?`<label class="f">Kategori${sel(`sedg.${i}.c`,CAT_ORDER.map(c=>[c,CATS[c].n]),g.c)}</label>${numIn(`sedg.${i}.t`,g.t,1,100,1,'Pay %','sg'+i)}`:E.a==='res'?`<label class="f">Araştırma${sel(`sedg.${i}.r`,RES.map(r=>[r.id,r.n]),g.r)}</label>`:''}
    <span class="small muted" style="padding-bottom:8px">${esc(E.mk(g,d).n)}</span>
    <button class="btn sm ghost" data-act="sedgdel" data-i="${i}">Kaldır</button></div>`);}).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Scenario editor${helpBtn('scned')}</h2><span class="sub">Game paused</span></div>
    <div class="pb col" style="gap:12px">
      <div class="grid3">
        <label class="f" for="sedn">Scenario name<input type="text" id="sedn" data-bind="sed.n" value="${esc(d.n)}" maxlength="40"></label>
        <label class="f" for="sednm">Company name<input type="text" id="sednm" data-bind="sed.nm" value="${esc(d.nm)}" maxlength="28"></label>
        <label class="f">Duration${sel('sed.yrs',SED_YRS.map(y=>[y,y?y+" years":"Untimed (no goals)"]),d.yrs,1)}</label>
        <label class="f">Difficulty label${sel('sed.diff',[1,2,3,4].map(i=>[i,DIFF[i][0]]),d.diff,1)}</label></div>
      <label class="f" for="sedd">Description<textarea id="sedd" data-bind="sed.d" rows="2" maxlength="300">${esc(d.d)}</textarea></label>
      <label class="f" for="sedi">Opening message (optional)<textarea id="sedi" data-bind="sed.intro" rows="2" maxlength="300">${esc(d.intro)}</textarea></label>
    </div></section>
  <section class="panel"><div class="ph"><h2>Starting point</h2><span class="sub">${money(d.cash)} cash${d.debt?' · '+money(d.debt)+" debt":''}</span></div><div class="pb"><div class="grid3">
    ${numIn('sed.cash',d.cash,0,1e9,50000,"Cash ($)",'sedc')}${numIn('sed.debt',d.debt,0,5e8,50000,"Bank debt ($)",'sedb')}
    <label class="f" for="sede"><span class="lbl">Your stake: <b class="num">${Math.round(d.eq*100)}%</b></span><input type="range" id="sede" data-bind="sed.eq" data-num="1" min="20" max="100" step="5" value="${Math.round(d.eq*100)}"></label>
    <label class="f" for="sedbr"><span class="lbl">Brand: <b class="num">${Math.round(d.brand)}</b></span><input type="range" id="sedbr" data-bind="sed.brand" data-num="1" min="0" max="80" step="1" value="${Math.round(d.brand)}"></label>
    <label class="f">Office${sel('sed.office',OFFICES.map((o,i)=>[i,`${o.n} · up to ${o.cap*o.maxF} people`]),d.office,1)}</label>
    ${numIn('sed.racks',d.racks,0,200,1,"Server racks",'sedr')}</div></div></section>
  <section class="panel"><div class="ph"><h2>Team</h2><span class="sub">${tn}/${cap} people (incl. founder)</span></div><div class="pb col" style="gap:8px">${team}
    <label class="f" for="sedm" style="max-width:320px"><span class="lbl">Starting morale: <b class="num">${Math.round(d.mor)}</b></span><input type="range" id="sedm" data-bind="sed.mor" data-num="1" min="20" max="95" step="1" value="${Math.round(d.mor)}"></label></div></section>
  <section class="panel"><div class="ph"><h2>Completed research</h2><span class="sub">✓ added automatically as a prerequisite or for a product</span></div><div class="pb col" style="gap:10px">${res}</div></section>
  <section class="panel"><div class="ph"><h2>Starting products</h2><span class="sub">${d.prods.length}/5 software products</span></div><div class="pb col" style="gap:10px">${prods||"<div class=\"small muted\">The company starts with no products.</div>"}
    ${d.prods.length<5?"<div><button class=\"btn sm\" data-act=\"sedpadd\">Add product</button></div>":''}</div></section>
  <section class="panel"><div class="ph"><h2>Market & economy</h2></div><div class="pb col" style="gap:10px">
    <div class="row" style="gap:6px;flex-wrap:wrap"><span class="small">Regions entered:</span>${REG_ORDER.filter(r=>r!=='tr').map(r=>`<button class="btn sm ${d.regs.includes(r)?'primary':'ghost'}" aria-pressed="${d.regs.includes(r)}" data-act="sedreg" data-r="${r}">${REGS[r].n}</button>`).join('')}</div>
    <div class="grid3">
      <label class="f" for="sedpx"><span class="lbl">Parts prices: <b class="num">×${fx(d.px,2)}</b></span><input type="range" id="sedpx" data-bind="sed.px" data-num="1" min="0.6" max="1.6" step="0.05" value="${d.px}"></label>
      <label class="f" for="seddm"><span class="lbl">Demand: <b class="num">×${fx(d.dem,2)}</b></span><input type="range" id="seddm" data-bind="sed.dem" data-num="1" min="0.5" max="1.5" step="0.05" value="${d.dem}"></label>
      <label class="f">Event frequency${sel('sed.ev',SED_EV,d.ev,1)}</label>
      <label class="f">Rivals${sel('sed.riv',Object.entries(SED_RIV),d.riv)}</label></div></div></section>
  <section class="panel"><div class="ph"><h2>Goals</h2><span class="sub">${d.yrs?`${d.goals.length}/6 · within ${d.yrs} years, all at once`:"Goals aren't tracked in an untimed scenario"}</span></div><div class="pb col" style="gap:10px">${goals||"<div class=\"small muted\">No goals.</div>"}
    ${d.goals.length<6?"<div><button class=\"btn sm\" data-act=\"sedgadd\">Add goal</button></div>":''}</div></section>
  <section class="panel"><div class="pb col" style="gap:10px">
    ${errs.map(e=>`<div class="small neg">${esc(e)}</div>`).join('')}${warns.map(e=>`<div class="small warn">${esc(e)}</div>`).join('')}
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn primary" data-act="sedplay" ${errs.length?'disabled':''}>Save and play</button><button class="btn" data-act="sedsave" ${errs.length?'disabled':''}>Save</button><button class="btn" data-act="sedcode" ${errs.length?'disabled':''}>Share code</button><button class="btn ghost" data-act="sedback">Back to scenarios</button></div>
    ${UI.sedCode?`<label class="f" for="sedcode">Share code · your friend can open it with "Import code"<textarea id="sedcode" rows="3" readonly onclick="this.select()">${esc(UI.sedCode)}</textarea></label>`:''}
  </div></section>`:`<section class="panel"><div class="ph"><h2>Senaryo editörü${helpBtn('scned')}</h2><span class="sub">Oyun duraklatıldı</span></div>
    <div class="pb col" style="gap:12px">
      <div class="grid3">
        <label class="f" for="sedn">Senaryo adı<input type="text" id="sedn" data-bind="sed.n" value="${esc(d.n)}" maxlength="40"></label>
        <label class="f" for="sednm">Şirket adı<input type="text" id="sednm" data-bind="sed.nm" value="${esc(d.nm)}" maxlength="28"></label>
        <label class="f">Süre${sel('sed.yrs',SED_YRS.map(y=>[y,y?y+' yıl':'Süresiz (hedefsiz)']),d.yrs,1)}</label>
        <label class="f">Zorluk etiketi${sel('sed.diff',[1,2,3,4].map(i=>[i,DIFF[i][0]]),d.diff,1)}</label></div>
      <label class="f" for="sedd">Açıklama<textarea id="sedd" data-bind="sed.d" rows="2" maxlength="300">${esc(d.d)}</textarea></label>
      <label class="f" for="sedi">Açılış mesajı (isteğe bağlı)<textarea id="sedi" data-bind="sed.intro" rows="2" maxlength="300">${esc(d.intro)}</textarea></label>
    </div></section>
  <section class="panel"><div class="ph"><h2>Başlangıç</h2><span class="sub">${money(d.cash)} nakit${d.debt?' · '+money(d.debt)+' borç':''}</span></div><div class="pb"><div class="grid3">
    ${numIn('sed.cash',d.cash,0,1e9,50000,'Nakit ($)','sedc')}${numIn('sed.debt',d.debt,0,5e8,50000,'Banka borcu ($)','sedb')}
    <label class="f" for="sede"><span class="lbl">Hisse payın: <b class="num">%${Math.round(d.eq*100)}</b></span><input type="range" id="sede" data-bind="sed.eq" data-num="1" min="20" max="100" step="5" value="${Math.round(d.eq*100)}"></label>
    <label class="f" for="sedbr"><span class="lbl">Marka: <b class="num">${Math.round(d.brand)}</b></span><input type="range" id="sedbr" data-bind="sed.brand" data-num="1" min="0" max="80" step="1" value="${Math.round(d.brand)}"></label>
    <label class="f">Ofis${sel('sed.office',OFFICES.map((o,i)=>[i,`${o.n} · en fazla ${o.cap*o.maxF} kişi`]),d.office,1)}</label>
    ${numIn('sed.racks',d.racks,0,200,1,'Sunucu rafı','sedr')}</div></div></section>
  <section class="panel"><div class="ph"><h2>Ekip</h2><span class="sub">${tn}/${cap} kişi (kurucu dahil)</span></div><div class="pb col" style="gap:8px">${team}
    <label class="f" for="sedm" style="max-width:320px"><span class="lbl">Başlangıç morali: <b class="num">${Math.round(d.mor)}</b></span><input type="range" id="sedm" data-bind="sed.mor" data-num="1" min="20" max="95" step="1" value="${Math.round(d.mor)}"></label></div></section>
  <section class="panel"><div class="ph"><h2>Tamamlanmış araştırmalar</h2><span class="sub">✓ ön koşul ya da ürün için otomatik eklenir</span></div><div class="pb col" style="gap:10px">${res}</div></section>
  <section class="panel"><div class="ph"><h2>Hazır ürünler</h2><span class="sub">${d.prods.length}/5 yazılım ürünü</span></div><div class="pb col" style="gap:10px">${prods||'<div class="small muted">Şirket ürünsüz başlar.</div>'}
    ${d.prods.length<5?'<div><button class="btn sm" data-act="sedpadd">Ürün ekle</button></div>':''}</div></section>
  <section class="panel"><div class="ph"><h2>Pazar ve ekonomi</h2></div><div class="pb col" style="gap:10px">
    <div class="row" style="gap:6px;flex-wrap:wrap"><span class="small">Girilmiş bölgeler:</span>${REG_ORDER.filter(r=>r!=='tr').map(r=>`<button class="btn sm ${d.regs.includes(r)?'primary':'ghost'}" aria-pressed="${d.regs.includes(r)}" data-act="sedreg" data-r="${r}">${REGS[r].n}</button>`).join('')}</div>
    <div class="grid3">
      <label class="f" for="sedpx"><span class="lbl">Parça fiyatları: <b class="num">×${fx(d.px,2)}</b></span><input type="range" id="sedpx" data-bind="sed.px" data-num="1" min="0.6" max="1.6" step="0.05" value="${d.px}"></label>
      <label class="f" for="seddm"><span class="lbl">Talep: <b class="num">×${fx(d.dem,2)}</b></span><input type="range" id="seddm" data-bind="sed.dem" data-num="1" min="0.5" max="1.5" step="0.05" value="${d.dem}"></label>
      <label class="f">Olay sıklığı${sel('sed.ev',SED_EV,d.ev,1)}</label>
      <label class="f">Rakipler${sel('sed.riv',Object.entries(SED_RIV),d.riv)}</label></div></div></section>
  <section class="panel"><div class="ph"><h2>Hedefler</h2><span class="sub">${d.yrs?`${d.goals.length}/6 · ${d.yrs} yıl içinde, hepsi aynı anda`:'Süresiz senaryoda hedef takip edilmez'}</span></div><div class="pb col" style="gap:10px">${goals||'<div class="small muted">Hedef yok.</div>'}
    ${d.goals.length<6?'<div><button class="btn sm" data-act="sedgadd">Hedef ekle</button></div>':''}</div></section>
  <section class="panel"><div class="pb col" style="gap:10px">
    ${errs.map(e=>`<div class="small neg">${esc(e)}</div>`).join('')}${warns.map(e=>`<div class="small warn">${esc(e)}</div>`).join('')}
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn primary" data-act="sedplay" ${errs.length?'disabled':''}>Kaydet ve oyna</button><button class="btn" data-act="sedsave" ${errs.length?'disabled':''}>Kaydet</button><button class="btn" data-act="sedcode" ${errs.length?'disabled':''}>Paylaşım kodu</button><button class="btn ghost" data-act="sedback">Senaryolara dön</button></div>
    ${UI.sedCode?`<label class="f" for="sedcode">Paylaşım kodu · arkadaşın bunu "Kodla içe aktar" ile açabilir<textarea id="sedcode" rows="3" readonly onclick="this.select()">${esc(UI.sedCode)}</textarea></label>`:''}
  </div></section>`);
}
function vMyScn(){
  const L=myScns(),best=scnBest();
  const cards=L.map((d,i)=>{const S0=scnFromDef(d),b=best[S0.id],df=DIFF[d.diff];
    return (LANG_EN?`<div class="scn"><div class="row between"><h3>${esc(d.n)}</h3><span class="chip ${df[1]}">${df[0]}</span></div>${d.d?`<div class="small">${esc(d.d)}</div>`:''}
      <div class="small muted"><b>Setup:</b> ${esc(S0.start)}${d.yrs?` · <b>Length:</b> ${d.yrs} years`:''}</div>
      ${d.yrs&&d.goals.length?`<ul class="small">${S0.goals().map(g=>`<li>${esc(g.n)}</li>`).join('')}</ul>`:''}
      ${b?`<div class="small">Best: ${starHtml(b.stars)} ${fmtLeft(b.days)}</div>`:''}
      <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm primary" data-act="scnstart" data-s="${S0.id}">Start</button><button class="btn sm" data-act="sededit" data-i="${i}">Edit</button>${LB.st==='on'?(galShared(d.id)?`<button class="btn sm ghost" data-act="galunshare" data-k="${esc(d.id)}">Remove from gallery</button>`:`<button class="btn sm" data-act="galshare" data-i="${i}">Share to gallery</button>`):''}${UI.scnDel===i?`<button class="btn sm danger" data-act="scndelok" data-i="${i}">Confirm delete</button>`:`<button class="btn sm ghost" data-act="scndel" data-i="${i}">Delete</button>`}</div></div>`:`<div class="scn"><div class="row between"><h3>${esc(d.n)}</h3><span class="chip ${df[1]}">${df[0]}</span></div>${d.d?`<div class="small">${esc(d.d)}</div>`:''}
      <div class="small muted"><b>Başlangıç:</b> ${esc(S0.start)}${d.yrs?` · <b>Süre:</b> ${d.yrs} yıl`:''}</div>
      ${d.yrs&&d.goals.length?`<ul class="small">${S0.goals().map(g=>`<li>${esc(g.n)}</li>`).join('')}</ul>`:''}
      ${b?`<div class="small">En iyi: ${starHtml(b.stars)} ${fmtLeft(b.days)}</div>`:''}
      <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm primary" data-act="scnstart" data-s="${S0.id}">Başla</button><button class="btn sm" data-act="sededit" data-i="${i}">Düzenle</button>${LB.st==='on'?(galShared(d.id)?`<button class="btn sm ghost" data-act="galunshare" data-k="${esc(d.id)}">Galeriden kaldır</button>`:`<button class="btn sm" data-act="galshare" data-i="${i}">Galeride paylaş</button>`):''}${UI.scnDel===i?`<button class="btn sm danger" data-act="scndelok" data-i="${i}">Silmeyi onayla</button>`:`<button class="btn sm ghost" data-act="scndel" data-i="${i}">Sil</button>`}</div></div>`);}).join('');
  return cards?(LANG_EN?`<h3 style="margin:8px 0 0">My scenarios</h3><div class="scn-grid">${cards}</div>`:`<h3 style="margin:8px 0 0">Senaryolarım</h3><div class="scn-grid">${cards}</div>`):'';
}
function vSedCard(){const n=myScns().length;
  return (LANG_EN?`<div class="scn"><div class="row between"><h3>Scenario editor</h3><span class="chip st-mute">New</span></div>
    <div class="small">Design your own scenario: starting cash and debt, team, completed research and products, economy, rival strength, duration and goals.</div>
    <div class="small muted">Send it to friends with a share code, or open theirs.${n?` Your ${n} saved scenarios are below.`:''}</div>
    <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm primary" data-act="sednew">Create new scenario</button><button class="btn sm" data-act="scnimp">Import code</button></div></div>`:`<div class="scn"><div class="row between"><h3>Senaryo editörü</h3><span class="chip st-mute">Yeni</span></div>
    <div class="small">Kendi senaryonu tasarla: başlangıç nakdi ve borç, ekip, hazır araştırmalar ve ürünler, ekonomi, rakiplerin gücü, süre ve hedefler.</div>
    <div class="small muted">Paylaşım koduyla arkadaşlarına gönder ya da onların senaryosunu aç.${n?` Kayıtlı ${n} senaryon aşağıda.`:''}</div>
    <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm primary" data-act="sednew">Yeni senaryo oluştur</button><button class="btn sm" data-act="scnimp">Kodla içe aktar</button></div></div>`);}

