/* ============================== COMPONENTS ============================== */
/* Projeler puan yerine bileşen tarifleriyle ilerler. Her rolün ekibi ortak bir havuza çalışır; havuz bir bileşenin maliyetine
   ulaşınca bileşen teslim edilir. Tarifteki maliyetlerin toplamı eski puan ihtiyacına eşittir, bu yüzden süreler değişmez.
   Boştaki geliştiriciler depoya üretir; projeler eksik bileşenleri depodan otomatik alır. pr.prog yine gerçeğin kaynağıdır. */
const COMP={
  ui:{n:(LANG_EN?"Interface code":'Arayüz kodu'),s:(LANG_EN?"UI":'UI'),r:'soft',b:10},be:{n:(LANG_EN?"Backend service":'Arka uç servisi'),s:'API',r:'soft',b:14},db:{n:(LANG_EN?"Database":'Veritabanı'),s:'DB',r:'soft',b:12},
  net:{n:(LANG_EN?"Network layer":'Ağ katmanı'),s:(LANG_EN?"NET":'NET'),r:'soft',b:16},krn:{n:(LANG_EN?"System kernel":'Sistem çekirdeği'),s:'KRN',r:'soft',b:20},ml:{n:(LANG_EN?"AI model":'Yapay zekâ modeli'),s:'ML',r:'soft',b:24},
  fw:{n:(LANG_EN?"Firmware":'Gömülü yazılım'),s:'FW',r:'soft',b:16},
  gfx:{n:(LANG_EN?"Graphics set":'Grafik seti'),s:'GFX',r:'design',b:8},flow:{n:(LANG_EN?"User flow":'Kullanıcı akışı'),s:'UX',r:'design',b:12},ind:{n:(LANG_EN?"Industrial design":'Endüstriyel tasarım'),s:'ID',r:'design',b:16},
  pcb:{n:(LANG_EN?"Circuit board":'Devre kartı'),s:'PCB',r:'hw',b:18},mech:{n:(LANG_EN?"Mechanical housing":'Mekanik gövde'),s:'MEC',r:'hw',b:14},sens:{n:(LANG_EN?"Sensor module":'Sensör modülü'),s:'SNS',r:'hw',b:16},die:{n:(LANG_EN?"Chip layout":'Çip yerleşimi'),s:'DIE',r:'hw',b:28}};
const SWD={gfx:2,flow:2},HWD={ind:2,gfx:1,flow:1};
const CAT_COMP={app:{soft:{ui:3,be:2,db:1,net:1},design:SWD},saas:{soft:{ui:2,be:3,db:2,net:2},design:SWD},os:{soft:{krn:3,ui:2,be:1,net:1,fw:1},design:SWD},
  ai:{soft:{ml:4,be:2,db:1,ui:1},design:SWD},car:{soft:{ml:3,fw:2,be:1,ui:1},design:SWD},cpu:{hw:{die:4,pcb:1},soft:{fw:2,krn:1}},
  qc:{hw:{die:3,pcb:2,mech:1},soft:{krn:2,ml:1},design:{ind:1}},phone:{hw:{pcb:2,mech:2,sens:2},design:HWD,soft:{fw:2,ui:2}},
  wear:{hw:{pcb:2,sens:3,mech:1},design:HWD,soft:{fw:2,ui:1}},xr:{hw:{sens:3,pcb:2,mech:1},design:HWD,soft:{fw:2,ui:1,ml:1}},
  pc:{hw:{pcb:3,mech:2},design:HWD,soft:{fw:2,ui:1}},console:{hw:{pcb:3,mech:2},design:HWD,soft:{fw:1,ui:2,krn:1}},
  iot:{hw:{pcb:2,sens:2,mech:1},design:HWD,soft:{fw:2,net:2}},robo:{hw:{mech:3,sens:2,pcb:2},design:HWD,soft:{ml:2,fw:2}}};
const ROLE_COMP={soft:{ui:2,be:2},design:SWD,hw:{pcb:2,mech:1}};
const FA_COMP={perf:['be','net','die','pcb','krn','ml'],ux:['ui','flow'],feat:['be','ui','ml'],sec:['net','db','krn'],design:['gfx','ind','mech'],eff:['pcb','fw'],dur:['mech'],cost:['pcb'],heat:['die','mech'],rel:['db','be','fw']};
const compK=()=>1+years()*0.08;
const compW=(cat,t)=>({...((CAT_COMP[cat]||{})[t]||ROLE_COMP[t]||{})});
function recipeFor(cat,req,focus,k,feats){const out={};k=k||compK();
  const tot=Object.values(req).reduce((a,b)=>a+(b>0?b:0),0),E=Array.isArray(feats)?ftEff(cat,feats):null,FP=E&&E.w?ftPts(cat,feats,tot/(1+E.w)):{};
  for(const t in req){const R=req[t];if(!(R>0))continue;const W=compW(cat,t);
    const fp=FP[t]||{},fraw=Object.values(fp).reduce((a,b)=>a+b,0),fsum=Math.min(R*0.8,fraw),fsc=fraw?fsum/fraw:0,Rb=R-fsum;
    if(focus)for(const a in focus){const L=FA_COMP[a];if(L)for(const c of L)if(W[c])W[c]*=1+0.15*(focus[a]-2);}
    const cs=Object.keys(W).filter(c=>W[c]>0),sw=cs.reduce((s,c)=>s+W[c],0),minC=Math.min(...cs.map(c=>COMP[c].b*k));
    if(R<minC*1.5){const c=cs.sort((a,b)=>W[b]-W[a])[0];out[t]=[{c,n:1,got:0,cost:R}];continue;}
    const L=cs.map(c=>({c,n:Math.max(1,Math.round(Rb*W[c]/sw/(COMP[c].b*k))),got:0,cost:COMP[c].b*k}));
    for(const c in fp){const n=Math.max(1,Math.round(fp[c]*fsc/(COMP[c].b*k))),x=L.find(y=>y.c===c);if(x)x.n+=n;else L.push({c,n,got:0,cost:COMP[c].b*k});}
    const tw=L.reduce((s,x)=>s+x.n*x.cost,0);for(const x of L)x.cost=x.cost*R/tw;out[t]=L;}
  return out;}
function compOf(pr){
  if(!pr.cr){pr.cr=recipeFor(pr.cat,pr.req,prFocus(pr),0,pr.d&&pr.d.feats);pr.cw={};for(const t in pr.cr)compSync(pr,t);}
  else for(const t in pr.req)if(!pr.cr[t]&&pr.req[t]>0){Object.assign(pr.cr,recipeFor(pr.cat,{[t]:pr.req[t]},prFocus(pr)));compSync(pr,t);}
  return pr.cr;}
const compNeed=L=>{let b=null,bv=0;for(const x of L){const v=(x.n-x.got)/x.n;if(v>bv+1e-9){b=x;bv=v;}}return b;};
const compDoneR=L=>L.every(x=>x.got>=x.n);
// puan dışarıdan arttıysa (etkinlik, parlak fikir) karşılığını bileşen olarak say
function compSync(pr,t){const L=pr.cr&&pr.cr[t];if(!L)return;let sur=(pr.prog[t]||0)-L.reduce((s,x)=>s+x.got*x.cost,0);
  while(sur>1e-6){const x=compNeed(L);if(!x||x.cost>sur+1e-6)break;x.got++;sur-=x.cost;}
  if(compDoneR(L))pr.prog[t]=pr.req[t];}
const compPool=(pr,t)=>(pr.cw=pr.cw||{})[t]||(pr.cw[t]={c:null,p:0});
const compLeft=(pr,t)=>Math.max(0,pr.req[t]-(pr.prog[t]||0)-compPool(pr,t).p);
function compWork(pr,t,e,add){const L=compOf(pr)[t];if(!L){pr.prog[t]=Math.min(pr.req[t],pr.prog[t]+add);return;}const w=compPool(pr,t);w.p+=add;
  for(let i=0;i<50;i++){let x=w.c&&L.find(y=>y.c===w.c&&y.got<y.n);if(!x)x=compNeed(L);if(!x){depAdd(t,w.p);w.p=0;w.c=null;break;}
    w.c=x.c;if(w.p<x.cost-1e-6)break;w.p-=x.cost;x.got++;pr.prog[t]=Math.min(pr.req[t],(pr.prog[t]||0)+x.cost);w.c=null;compPop(e,x.c);}
  if(compDoneR(L)){pr.prog[t]=pr.req[t];if(w.p>1e-6){depAdd(t,w.p);w.p=0;}}}
// depo
const newDep=()=>({auto:true,pick:{soft:'auto',design:'auto',hw:'auto'},w:{soft:{c:null,p:0},design:{c:null,p:0},hw:{c:null,p:0}},inv:{},used:0,made:0});
const depOf=()=>G.dep||(G.dep=newDep());
const depotCap=()=>40+40*(G.office||0)+20*Math.max(0,(G.floors||1)-1);
const invTot=()=>Object.values(depOf().inv).reduce((a,b)=>a+b,0);
const depActive=e=>(!!(G.dep?G.dep.auto:true)||!!e.mk)&&!e.proj&&!e.leave&&DEV_ROLES.includes(e.role)&&invTot()<depotCap();
function depPick(t){const D=depOf(),p=D.pick[t];if(p&&p!=='auto'&&COMP[p]&&COMP[p].r===t)return p;
  const cats=new Set([...myActive().map(x=>x.cat),...G.projects.map(x=>x.cat)]);if(!cats.size)cats.add(t==='hw'?'phone':'app');
  const W={};for(const c of cats){const w=compW(c,t);for(const k in w)W[k]=(W[k]||0)+w[k];}
  for(const pr of G.projects){const L=pr.cr&&pr.cr[t];if(L)for(const x of L)if(x.got<x.n)W[x.c]=(W[x.c]||0)+3;}
  for(const k of (G.fl&&G.fl.act)||[])for(const c in k.need)if(COMP[c].r===t&&k.got[c]<k.need[c])W[c]=(W[c]||0)+6;
  let b=null,bv=-1;for(const c in W){const v=W[c]/(1+(D.inv[c]||0));if(v>bv){b=c;bv=v;}}return b||Object.keys(ROLE_COMP[t])[0];}
function depAdd(t,pts){if(!(pts>0))return;const w=depOf().w[t];if(w)w.p+=pts*0.5;}
function depotWork(e,add){if(!depActive(e))return false;if(e.mk&&COMP[e.mk]&&COMP[e.mk].r===e.role)return bdMake(e,add);const D=depOf(),t=e.role,w=D.w[t],k=compK();w.p+=add;
  for(let i=0;i<20;i++){const c=w.c||(w.c=depPick(t)),cost=COMP[c].b*k;if(w.p<cost)break;if(invTot()>=depotCap()){w.p=Math.min(w.p,cost);break;}
    w.p-=cost;D.inv[c]=(D.inv[c]||0)+1;D.made++;w.c=null;compPop(e,c);}
  return true;}
// projeler eksik bileşenleri depodan alır
function compStock(pr){const D=depOf();let took=0;
  for(const t in pr.cr){const L=pr.cr[t];for(const x of L){const have=D.inv[x.c]||0;if(!have||x.got>=x.n)continue;
      const room=Math.floor(compLeft(pr,t)/x.cost+1e-6),k=Math.min(have,x.n-x.got,room);if(k<=0)continue;
      x.got+=k;D.inv[x.c]=have-k;if(!D.inv[x.c])delete D.inv[x.c];pr.prog[t]=Math.min(pr.req[t],(pr.prog[t]||0)+k*x.cost);took+=k;}
    if(compDoneR(L))pr.prog[t]=pr.req[t];}
  if(took){D.used+=took;const first=!pr.fromInv;pr.fromInv=(pr.fromInv||0)+took;if(first&&took>=3)news((LANG_EN?`${pr.name}: used ${took} components from the depot.`:`${pr.name}: depodan ${took} bileşen kullanıldı.`),'');}}
function compDaily(){for(const pr of G.projects){compOf(pr);for(const t in pr.cr)compSync(pr,t);if(G.dep&&invTot()&&bdGive())compStock(pr);}}
function compRefund(pr){if(!pr.cr)return 0;const D=depOf();let n=0;for(const t in pr.cr)for(const x of pr.cr[t]){const k=Math.min(x.got,Math.max(0,depotCap()-invTot()));if(k>0){D.inv[x.c]=(D.inv[x.c]||0)+k;n+=k;}}return n;}
// ofiste teslim edilen bileşen rozeti
function compPop(e,c){if(typeof UI==='undefined'||!e||UI.tab!=='office'||typeof document==='undefined'||document.hidden)return;const q=UI.cq||(UI.cq=[]);q.push({id:e.id,c,at:performance.now()});if(q.length>40)q.shift();}
function compPopTake(id){const q=UI.cq;if(!q||!q.length)return null;const now=performance.now();UI.cq=q.filter(x=>now-x.at<4000);const i=UI.cq.findIndex(x=>x.id===id);return i<0?null:UI.cq.splice(i,1)[0].c;}
// UI
function compRows(pr,compact){const R=compOf(pr);
  return Object.keys(pr.req).map(t=>{const L=R[t]||[],n=L.reduce((a,x)=>a+x.n,0),g=L.reduce((a,x)=>a+x.got,0),w=pr.cw&&pr.cw[t],f=clamp(((pr.prog[t]||0)+(w?w.p:0))/pr.req[t],0,1);
    const chips=compact?'':`<div class="cmp-l">${L.map(x=>`<span class="cmp${x.got>=x.n?' done':''}" title="${esc(COMP[x.c].n)}"><b class="r-${t}">${COMP[x.c].s}</b>${esc(COMP[x.c].n)} <span class="num">${x.got}/${x.n}</span></span>`).join('')}</div>`;
    return (LANG_EN?`<div class="preq"><span class="r-${t}">${PT_NAME[t]}</span><div class="bar ${t}"><i style="width:${(f*100).toFixed(1)}%"></i></div><span class="num small">${g}/${n} components</span></div>${chips}`:`<div class="preq"><span class="r-${t}">${PT_NAME[t]}</span><div class="bar ${t}"><i style="width:${(f*100).toFixed(1)}%"></i></div><span class="num small">${g}/${n} bileşen</span></div>${chips}`);}).join('');}
function compPreview(d){let E;try{E=devEst(d);}catch(e){return '';}if(!E||E.err||!E.r||!E.r.req)return '';const R=recipeFor(d.cat,E.r.req,d.focus,0,d.feats),D=depOf();
  const rows=Object.keys(R).map(t=>`<div class="small"><b class="r-${t}">${PT_NAME[t]}:</b> ${R[t].map(x=>`${x.n} ${esc(COMP[x.c].n)}${D.inv[x.c]?(LANG_EN?` <span class="pos">(${D.inv[x.c]} in the depot)</span>`:` <span class="pos">(depoda ${D.inv[x.c]} hazır)</span>`):''}`).join(' · ')}</div>`).join('');
  return (LANG_EN?`<div class="cmp-pv"><b>Components needed</b>${rows}<div class="small muted">The design focus changes the recipe: the attributes you emphasize need more of their components.</div></div>`:`<div class="cmp-pv"><b>Gerekecek bileşenler</b>${rows}<div class="small muted">Tasarım odağı tarifi değiştirir: öne çıkardığın niteliğin bileşenlerinden daha çok gerekir.</div></div>`);}
function vDepot(){if(!G.emps.some(e=>DEV_ROLES.includes(e.role))&&!invTot())return '';const D=depOf(),cap=depotCap(),tot=invTot(),inv=Object.keys(COMP).filter(c=>D.inv[c]);
  const roles=DEV_ROLES.filter(t=>G.emps.some(e=>e.role===t)),wk=G.emps.filter(depActive).length;
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Component depot</h2><span class="sub">${tot}/${cap} · ${wk} producing for the depot</span></div><div class="pb col" style="gap:10px">
    <p class="small muted" style="margin:0">Developers, designers and hardware engineers without a project produce components for the depot. A new project takes the components it needs from the depot right away and finishes that much sooner. Capacity grows with your office; components from cancelled projects go back to the depot.</p>
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm ${D.auto?'primary':''}" data-act="depauto" aria-pressed="${!!D.auto}">${D.auto?"Idle staff produce for the depot":"Idle staff don't produce for the depot"}</button><span class="small muted">${D.made} produced so far, ${D.used} used.</span></div>
    <div class="preq"><span class="small">Fill</span><div class="bar"><i style="width:${Math.min(100,tot/cap*100).toFixed(1)}%"></i></div><span class="num small ${tot>=cap?'warn':''}">${tot}/${cap}${tot>=cap?" · full":''}</span></div>
    <div class="cmp-l">${inv.length?inv.map(c=>`<span class="cmp"><b class="r-${COMP[c].r}">${COMP[c].s}</b>${esc(COMP[c].n)} <span class="num">${D.inv[c]}</span></span>`).join(''):"<span class=\"small muted\">The depot is empty.</span>"}</div>
    ${roles.length?`<div class="row" style="gap:10px;flex-wrap:wrap">${roles.map(t=>`<label class="f" for="dep-${t}">${ROLES[t].n} output<select id="dep-${t}" data-deppick="${t}"><option value="auto" ${D.pick[t]==='auto'?'selected':''}>Automatic (most needed)</option>${Object.keys(COMP).filter(c=>COMP[c].r===t).map(c=>`<option value="${c}" ${D.pick[t]===c?'selected':''}>${esc(COMP[c].n)}</option>`).join('')}</select></label>`).join('')}</div>`:''}
  </div></section>`:`<section class="panel"><div class="ph"><h2>Bileşen deposu</h2><span class="sub">${tot}/${cap} · ${wk} kişi depoya üretiyor</span></div><div class="pb col" style="gap:10px">
    <p class="small muted" style="margin:0">Projesi olmayan yazılımcı, tasarımcı ve donanım mühendisleri depoya bileşen üretir. Yeni bir proje ihtiyaç duyduğu bileşenleri depodan hemen alır ve o kadar erken biter. Kapasite ofisle büyür; iptal edilen projelerin bileşenleri depoya döner.</p>
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm ${D.auto?'primary':''}" data-act="depauto" aria-pressed="${!!D.auto}">${D.auto?'Boştakiler depoya üretiyor':'Boştakiler depoya üretmiyor'}</button><span class="small muted">Şimdiye kadar ${D.made} üretildi, ${D.used} kullanıldı.</span></div>
    <div class="preq"><span class="small">Doluluk</span><div class="bar"><i style="width:${Math.min(100,tot/cap*100).toFixed(1)}%"></i></div><span class="num small ${tot>=cap?'warn':''}">${tot}/${cap}${tot>=cap?' · dolu':''}</span></div>
    <div class="cmp-l">${inv.length?inv.map(c=>`<span class="cmp"><b class="r-${COMP[c].r}">${COMP[c].s}</b>${esc(COMP[c].n)} <span class="num">${D.inv[c]}</span></span>`).join(''):'<span class="small muted">Depo boş.</span>'}</div>
    ${roles.length?`<div class="row" style="gap:10px;flex-wrap:wrap">${roles.map(t=>`<label class="f" for="dep-${t}">${ROLES[t].n} üretimi<select id="dep-${t}" data-deppick="${t}"><option value="auto" ${D.pick[t]==='auto'?'selected':''}>Otomatik (en çok gereken)</option>${Object.keys(COMP).filter(c=>COMP[c].r===t).map(c=>`<option value="${c}" ${D.pick[t]===c?'selected':''}>${esc(COMP[c].n)}</option>`).join('')}</select></label>`).join('')}</div>`:''}
  </div></section>`);}
