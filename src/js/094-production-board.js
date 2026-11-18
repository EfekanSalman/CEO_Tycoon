/* ============================== PRODUCTION BOARD ============================== */
/* Startup Company tarzı üretim panosu (Geliştirme sayfası). Geliştiricileri sürükleyip bir projeye, bir bileşen istasyonuna
   (depoya o bileşeni üretir) ya da Otomatik alanına bırakırsın; depodaki bileşenleri sürükleyip bir projeye verirsin.
   Telefonda: önce karta, sonra hedefe dokun. Otomatik dağıtım kapalıysa projeler depodan kendiliğinden bileşen almaz.
   Varsayılanlar (istasyonsuz çalışan, otomatik dağıtım açık) eski davranışla aynıdır. */
const BD_ROLE={soft:(LANG_EN?"Software":'Yazılım'),design:(LANG_EN?"Design":'Tasarım'),hw:(LANG_EN?"Hardware":'Donanım')},BD_MAX=14;
/* istasyon: e.mk bileşenine ayrılmış ilerleme D.mk[k]; maliyete ulaşınca depoya bir adet */
function bdMake(e,add){const D=depOf(),k=e.mk;if(!COMP[k]||COMP[k].r!==e.role)return false;D.mk=D.mk||{};D.mk[k]=(D.mk[k]||0)+add;const cost=COMP[k].b*compK();
  for(let i=0;i<20&&D.mk[k]>=cost;i++){if(invTot()>=depotCap()){D.mk[k]=Math.min(D.mk[k],cost);break;}D.mk[k]-=cost;D.inv[k]=(D.inv[k]||0)+1;D.made++;compPop(e,k);}
  return true;}
const bdGive=()=>depOf().give!==false;
/* bir projeye depodan bileşen ver (ihtiyacı kadar) */
function bdGiveTo(pr,k){const D=depOf(),have=D.inv[k]||0;if(!have)return 0;const L=compOf(pr)[COMP[k].r];if(!L)return 0;const x=L.find(y=>y.c===k&&y.got<y.n);if(!x)return 0;
  const t=COMP[k].r,room=Math.floor(compLeft(pr,t)/x.cost+1e-6),n=Math.min(have,x.n-x.got,room);if(n<=0)return 0;
  x.got+=n;D.inv[k]=have-n;if(!D.inv[k])delete D.inv[k];pr.prog[t]=Math.min(pr.req[t],(pr.prog[t]||0)+n*x.cost);if(compDoneR(L))pr.prog[t]=pr.req[t];D.used+=n;return n;}
/* sürükle-bırak ya da iki dokunuş: kaynak 'e:ID' (çalışan) ya da 'k:KEY' (depodaki bileşen); hedef 'p:ID', 'c:KEY', 'auto:ROLE' */
function bdDrop(src,dst){if(!src||!dst)return false;const [st,sv]=src.split(':'),[dt,dv]=dst.split(':');
  if(st==='e'){const e=G.emps.find(x=>x.id===+sv);if(!e||!DEV_ROLES.includes(e.role))return false;
    if(dt==='p'){const pr=G.projects.find(p=>p.id===+dv);if(!pr||!pr.req[e.role]){showToast((LANG_EN?`This project has no ${BD_ROLE[e.role].toLocaleLowerCase(LOC)} work.`:`Bu projede ${BD_ROLE[e.role].toLocaleLowerCase(LOC)} işi yok.`),'bad');return false;}e.proj=pr.id;e.mk=null;}
    else if(dt==='c'){if(!COMP[dv]||COMP[dv].r!==e.role){showToast((LANG_EN?"This employee cannot produce that component.":'Bu çalışan o bileşeni üretemez.'),'bad');return false;}e.proj=null;e.mk=dv;}
    else if(dt==='auto'){e.proj=null;e.mk=null;}else return false;
    return true;}
  if(st==='k'&&dt==='p'){const pr=G.projects.find(p=>p.id===+dv);if(!pr)return false;const n=bdGiveTo(pr,sv);if(!n){showToast((LANG_EN?"This project doesn't need that component or has no room for it.":'Bu proje o bileşene ihtiyaç duymuyor ya da yeri yok.'),'bad');return false;}
    showToast((LANG_EN?`${pr.name}: ${n} × ${COMP[sv].n.toLocaleLowerCase(LOC)} given.`:`${pr.name}: ${n} ${COMP[sv].n.toLocaleLowerCase(LOC)} verildi.`));return true;}
  return false;}
function bdAct(a,ds){
  if(a==='bdgive'){const D=depOf();D.give=!bdGive();return;}
  if(a==='bdsel'){UI.bdSel=UI.bdSel===ds.k?null:ds.k;return;}
  if(a==='bddrop'){if(UI.bdSel){bdDrop(UI.bdSel,ds.k);UI.bdSel=null;}return;}}
/* ---- sürükleme (fare ve dokunmatik, pointer olaylarıyla) ---- */
const BDG={s:null,g:null,x:0,y:0,moved:false,skip:0};
if(typeof document!=='undefined'){
  document.addEventListener('pointerdown',ev=>{const el=ev.target.closest&&ev.target.closest('[data-drag]');if(!el||ev.button>0)return;BDG.s=el.dataset.drag;BDG.x=ev.clientX;BDG.y=ev.clientY;BDG.moved=false;BDG.el=el;});
  document.addEventListener('pointermove',ev=>{if(!BDG.s)return;if(!BDG.moved){if(Math.hypot(ev.clientX-BDG.x,ev.clientY-BDG.y)<6)return;BDG.moved=true;UI.dragging=true;
      const g=BDG.el.cloneNode(true);g.classList.add('bd-ghost');document.body.appendChild(g);BDG.g=g;document.body.classList.add('bd-dragging');}
    BDG.g.style.left=(ev.clientX+8)+'px';BDG.g.style.top=(ev.clientY+8)+'px';
    /* kenara yaklaşınca sayfayı kaydır (telefonda uzak hedefler için) */
    const H=window.innerHeight;if(ev.clientY<70)window.scrollBy(0,-14);else if(ev.clientY>H-90)window.scrollBy(0,14);
    for(const z of document.querySelectorAll('.bd-over'))z.classList.remove('bd-over');const t=document.elementFromPoint(ev.clientX,ev.clientY);const z=t&&t.closest('[data-drop]');if(z)z.classList.add('bd-over');ev.preventDefault();});
  const end=ev=>{if(!BDG.s)return;const src=BDG.s,moved=BDG.moved;BDG.s=null;if(BDG.g){BDG.g.remove();BDG.g=null;}document.body.classList.remove('bd-dragging');for(const z of document.querySelectorAll('.bd-over'))z.classList.remove('bd-over');
    if(!moved)return;UI.dragging=false;BDG.skip=Date.now();const t=ev&&ev.type==='pointerup'?document.elementFromPoint(ev.clientX,ev.clientY):null,z=t&&t.closest('[data-drop]');
    if(z&&typeof G!=='undefined'&&G){bdDrop(src,z.dataset.drop);UI.bdSel=null;}UI.force=true;try{render();}catch(e){}};
  document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);
  // sürüklemeden hemen sonra gelen tıklamayı yut (iki dokunuş seçimi tetiklenmesin)
  document.addEventListener('click',ev=>{if(Date.now()-BDG.skip<350&&ev.target.closest&&ev.target.closest('[data-drag],[data-drop]')){ev.stopPropagation();ev.preventDefault();}},true);}
/* ---- görünüm ---- */
function vProdBoard(){const devs=G.emps.filter(e=>DEV_ROLES.includes(e.role)&&!e.leave);if(!devs.length)return '';const D=depOf(),sel=UI.bdSel||'';
  const chip=e=>{const k='e:'+e.id;return (LANG_EN?`<button class="bd-e r-${e.role}${sel===k?' on':''}" data-drag="${k}" data-act="bdsel" data-k="${k}" aria-pressed="${sel===k}" title="${esc(e.name)} · ${ROLES[e.role].n} · skill ${fx(e.skill,1)}">${esc(e.name.split(' ').map(w=>w[0]).join('').slice(0,2))}<small>${fx(e.skill,0)}</small></button>`:`<button class="bd-e r-${e.role}${sel===k?' on':''}" data-drag="${k}" data-act="bdsel" data-k="${k}" aria-pressed="${sel===k}" title="${esc(e.name)} · ${ROLES[e.role].n} · yetenek ${fx(e.skill,1)}">${esc(e.name.split(' ').map(w=>w[0]).join('').slice(0,2))}<small>${fx(e.skill,0)}</small></button>`);};
  const chips=L=>L.slice(0,BD_MAX).map(chip).join('')+(L.length>BD_MAX?`<span class="small muted">+${L.length-BD_MAX}</span>`:'');
  const zone=(k,title,body,extra='')=>`<div class="bd-z${sel?' bd-tgt':''}" data-drop="${k}" data-act="bddrop" data-k="${k}">${title}<div class="bd-es">${body}</div>${extra}</div>`;
  const roles=DEV_ROLES.filter(t=>devs.some(e=>e.role===t)).map(t=>{const R=devs.filter(e=>e.role===t);
    const prs=G.projects.filter(p=>p.req[t]).map(p=>{const L=compOf(p)[t]||[],pct=Math.round(Math.min(1,(p.prog[t]||0)/p.req[t])*100);
      const need=L.filter(x=>x.got<x.n).map(x=>`<span class="cmp sm${D.inv[x.c]?' has':''}"><b class="r-${t}">${COMP[x.c].s}</b>${x.got}/${x.n}</span>`).join('');
      return zone('p:'+p.id,(LANG_EN?`<div class="row between small"><b>${esc(p.name)}</b><span class="num">${pct}%</span></div>`:`<div class="row between small"><b>${esc(p.name)}</b><span class="num">%${pct}</span></div>`),chips(R.filter(e=>e.proj===p.id)),need?`<div class="cmp-l">${need}</div>`:'');}).join('');
    const sts=Object.keys(COMP).filter(k=>COMP[k].r===t).map(k=>{const W=R.filter(e=>!e.proj&&e.mk===k),cost=COMP[k].b*compK(),p=Math.min(1,((D.mk&&D.mk[k])||0)/cost);
      return zone('c:'+k,(LANG_EN?`<div class="row between small"><span><b class="r-${t}">${COMP[k].s}</b> ${esc(COMP[k].n)}</span><span class="num">in depot ${D.inv[k]||0}</span></div>${W.length?`<div class="bar bd-p"><i style="width:${(p*100).toFixed(0)}%"></i></div>`:''}`:`<div class="row between small"><span><b class="r-${t}">${COMP[k].s}</b> ${esc(COMP[k].n)}</span><span class="num">depoda ${D.inv[k]||0}</span></div>${W.length?`<div class="bar bd-p"><i style="width:${(p*100).toFixed(0)}%"></i></div>`:''}`),chips(W));}).join('');
    const auto=R.filter(e=>!e.proj&&(!e.mk||COMP[e.mk].r!==t)),other=R.filter(e=>typeof e.proj==='string');
    return (LANG_EN?`<div class="bd-r"><b>${BD_ROLE[t]} · ${R.length} people</b>
      <div class="bd-g"><div class="col" style="gap:6px"><span class="small muted">Projects</span>${prs||"<span class=\"small muted\">No project needs this role.</span>"}</div>
      <div class="col" style="gap:6px"><span class="small muted">Component stations (produce for the depot)</span><div class="bd-st">${sts}</div></div></div>
      ${zone('auto:'+t,`<span class="small muted">Auto: idle developers produce the component the depot needs most${other.length?` · ${other.length} on maintenance`:''}</span>`,chips(auto))}</div>`:`<div class="bd-r"><b>${BD_ROLE[t]} · ${R.length} kişi</b>
      <div class="bd-g"><div class="col" style="gap:6px"><span class="small muted">Projeler</span>${prs||'<span class="small muted">Bu rolün işi olan proje yok.</span>'}</div>
      <div class="col" style="gap:6px"><span class="small muted">Bileşen istasyonları (depoya üretir)</span><div class="bd-st">${sts}</div></div></div>
      ${zone('auto:'+t,`<span class="small muted">Otomatik: boşta olanlar depoya en çok gereken bileşeni üretir${other.length?` · ${other.length} kişi bakımda`:''}</span>`,chips(auto))}</div>`);}).join('');
  const inv=Object.keys(COMP).filter(k=>D.inv[k]).map(k=>{const s='k:'+k;return `<button class="cmp bd-k${sel===s?' on':''}" data-drag="${s}" data-act="bdsel" data-k="${s}" aria-pressed="${sel===s}"><b class="r-${COMP[k].r}">${COMP[k].s}</b>${esc(COMP[k].n)} <span class="num">${D.inv[k]}</span></button>`;}).join('');
  return (LANG_EN?`<section class="panel bd"><div class="ph"><h2>Production board${helpBtn('pboard')}</h2><span class="sub">drag and drop · or tap a card, then a target</span></div><div class="pb col" style="gap:12px">
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm ${bdGive()?'primary':''}" data-act="bdgive" aria-pressed="${bdGive()}">Auto distribution: ${LANG_EN?(bdGive()?'on':'off'):bdGive()?"open":"off"}</button><span class="small muted">${bdGive()?"Projects take missing components from the depot automatically.":"You drag depot components onto projects yourself."}</span></div>
    <div class="col" style="gap:6px"><span class="small"><b>Depot</b> · ${invTot()}/${depotCap()}</span><div class="cmp-l">${inv||"<span class=\"small muted\">The depot is empty.</span>"}</div></div>
    ${roles}${sel?"<div class=\"small\">Selected: now tap a target (project, station or Auto).</div>":''}</div></section>`:`<section class="panel bd"><div class="ph"><h2>Üretim panosu${helpBtn('pboard')}</h2><span class="sub">sürükle bırak · ya da önce karta, sonra hedefe dokun</span></div><div class="pb col" style="gap:12px">
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm ${bdGive()?'primary':''}" data-act="bdgive" aria-pressed="${bdGive()}">Otomatik dağıtım: ${LANG_EN?(bdGive()?'on':'off'):bdGive()?'açık':'kapalı'}</button><span class="small muted">${bdGive()?'Projeler eksik bileşenleri depodan kendiliğinden alır.':'Depodaki bileşenleri projelere sen sürükleyip verirsin.'}</span></div>
    <div class="col" style="gap:6px"><span class="small"><b>Depo</b> · ${invTot()}/${depotCap()}</span><div class="cmp-l">${inv||'<span class="small muted">Depo boş.</span>'}</div></div>
    ${roles}${sel?'<div class="small">Seçildi: şimdi bir hedefe dokun (proje, istasyon ya da Otomatik).</div>':''}</div></section>`);}
