/* ============================== OFFICE LIFE: ITEM REQUESTS ============================== */
/* Çalışanlar kişiliklerine göre kendi katlarına somut bir eşya ister. Eşya o kata konunca istek karşılanır (moral artar);
   süre dolarsa bir süre moral cezası kalır. "Satın al ve yerleştir" eşyayı çalışanın yakınındaki boş bir yere koyar. */
const WANT_W={plant:{_:2,calm:2,creative:1},tree:{_:1,calm:2},water:{_:2,fast:1},espresso:{_:2,fast:3,ambit:1},shelf:{_:1,learner:3,perf:1},board:{_:1,perf:2,creative:2,leader:1},
  art:{creative:3},couch:{_:1,social:2,lazy:3},foos:{social:3},tv:{social:2,lazy:2},aqua:{calm:3,creative:1},pod:{fast:2,lazy:2}};
const WANT_DAYS=60,WANT_MEM=120,WANT_CAP=[2000,9000,16000,25000,25000];
const wantHas=(t,fl)=>G.furn.some(f=>f.t===t&&(f.fl||0)===fl);
function wantPick(e){const fl=empFloor(e),cap=WANT_CAP[G.office]||25000,L=[];
  for(const t in WANT_W){const F=FURN[t];if(!F||F.cost*1>cap||wantHas(t,fl))continue;let w=WANT_W[t]._||0;for(const k of e.tr||[])w+=WANT_W[t][k]||0;for(let i=0;i<w;i++)L.push(t);}
  return L.length?pick(L):null;}
const wantN=()=>G.emps.filter(e=>e.want).length;
function wantMonthly(){if(G.wpol==='remote')return;const cap=Math.max(2,Math.ceil(G.emps.length/6));
  for(const e of G.emps){if(wantN()>=cap)break;if(e.founder||e.intern||e.want||e.leave||G.day-(e.wantAt||e.hiredAt||0)<120)continue;
    if(Math.random()<(hasT(e,'social')?0.12:0.08)){const t=wantPick(e);if(!t)continue;e.want={t,at:G.day,until:G.day+WANT_DAYS};e.wantAt=G.day;
      news((LANG_EN?`${e.name} wants a ${FURN[t].n.toLocaleLowerCase(LOC)} on their floor (${WANT_DAYS} days).`:`${e.name} katına bir ${FURN[t].n.toLocaleLowerCase(LOC)} istiyor (${WANT_DAYS} gün).`),'');}}}
function wantDaily(){for(const e of G.emps){const w=e.want;if(!w)continue;
  if(wantHas(w.t,empFloor(e))){e.want=null;e.wOk=G.day;e.wantAt=G.day;e.morale=clamp(e.morale+8,0,100);news((LANG_EN?`${e.name} is delighted with the new ${FURN[w.t].n.toLocaleLowerCase(LOC)}.`:`${e.name} yeni ${FURN[w.t].n.toLocaleLowerCase(LOC)} için çok mutlu.`),'good');}
  else if(G.day>=w.until){e.want=null;e.wNo=G.day;e.wantAt=G.day;news((LANG_EN?`${e.name} is disappointed the ${FURN[w.t].n.toLocaleLowerCase(LOC)} they asked for never came.`:`${e.name} istediği ${FURN[w.t].n.toLocaleLowerCase(LOC)} gelmeyince hayal kırıklığına uğradı.`),'bad');}}}
function wantDrivers(e,d){if(e.want)d.push([(LANG_EN?`Wants a ${FURN[e.want.t].n}`:`${FURN[e.want.t].n} istiyor`),-1]);
  const ok=e.wOk!=null?e.wOk:-1e9,no=e.wNo!=null?e.wNo:-1e9;
  if(no>=ok&&G.day-no<WANT_MEM)d.push([(LANG_EN?"Request ignored":'İsteği karşılanmadı'),-4]);else if(ok>no&&G.day-ok<WANT_MEM)d.push([(LANG_EN?"Request fulfilled":'İsteği karşılandı'),3]);}
// isteğin eşyasını çalışanın katında, ona en yakın boş yere yerleştir
function wantPlace(e){const w=e.want;if(!w)return false;const t=w.t,F=FURN[t],fl=empFloor(e),f0=UI.floor,r0=UI.rot;
  if(!(G.furnInv[t]>0)&&G.cash<F.cost*infl()){showToast((LANG_EN?"Not enough cash for this item.":'Bu eşya için yeterli nakit yok.'),'bad');return false;}
  UI.floor=fl;UI.rot=0;const n=navGrid(fl),c=OV.chars&&OV.chars.get(e.id),cx=c&&c.fl===fl?c.x:n.W/2,cy=c&&c.fl===fl?c.y:n.H/2,S=[];
  for(let y=0;y<n.H;y++)for(let x=0;x<n.W;x++)S.push([x,y,(x-cx)*(x-cx)+(y-cy)*(y-cy)]);S.sort((a,b)=>a[2]-b[2]);
  let ok=false;for(const [x,y] of S){if(placeCheck(t,x,y,0).ok){placeFurn(t,x,y);ok=true;break;}}
  UI.floor=f0;UI.rot=r0;if(!ok)showToast((LANG_EN?"No free space on this floor for the item. Make room in Edit mode.":'Bu katta eşya için boş yer yok. Düzenle modunda yer aç.'),'bad');else wantDaily();return ok;}
// UI
function vWantLine(e){const w=e.want;if(!w)return '';const F=FURN[w.t],inv=G.furnInv[w.t]>0;
  return (LANG_EN?`<div class="want"><b>Request:</b> ${esc(F.n)} <span class="small muted">· ${F.fx} · ${w.until-G.day} days left</span> <button class="btn sm primary" data-act="wantbuy" data-id="${e.id}">${inv?"Place from storage":`Buy and place (${money(F.cost*infl())})`}</button></div>`:`<div class="want"><b>İstek:</b> ${esc(F.n)} <span class="small muted">· ${F.fx} · ${w.until-G.day} gün kaldı</span> <button class="btn sm primary" data-act="wantbuy" data-id="${e.id}">${inv?'Depodan yerleştir':`Satın al ve yerleştir (${money(F.cost*infl())})`}</button></div>`);}
function vWants(){const L=G.emps.filter(e=>e.want).sort((a,b)=>a.want.until-b.want.until);if(!L.length)return '';
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Employee requests</h2><span class="sub">${L.length} waiting</span></div><div class="pb col" style="gap:8px">
    <p class="small muted" style="margin:0">A fulfilled request lifts morale; an ignored one lowers it for a while. The item has to go on the employee's floor.</p>
    ${L.slice(0,6).map(e=>`<div class="want-r"><button class="linkb" data-act="selemp" data-id="${e.id}">${esc(e.name)}</button> <span class="small muted">${hasElev()?floorName(empFloor(e))+' · ':''}${esc(FURN[e.want.t].n)} · ${e.want.until-G.day} days</span><button class="btn sm" data-act="wantbuy" data-id="${e.id}">${G.furnInv[e.want.t]>0?"Place":money(FURN[e.want.t].cost*infl())}</button></div>`).join('')}
  </div></section>`:`<section class="panel"><div class="ph"><h2>Çalışan istekleri</h2><span class="sub">${L.length} bekliyor</span></div><div class="pb col" style="gap:8px">
    <p class="small muted" style="margin:0">Karşılanan istek morali yükseltir, görmezden gelinen istek bir süre düşürür. Eşya çalışanın katına konmalı.</p>
    ${L.slice(0,6).map(e=>`<div class="want-r"><button class="linkb" data-act="selemp" data-id="${e.id}">${esc(e.name)}</button> <span class="small muted">${hasElev()?floorName(empFloor(e))+' · ':''}${esc(FURN[e.want.t].n)} · ${e.want.until-G.day} gün</span><button class="btn sm" data-act="wantbuy" data-id="${e.id}">${G.furnInv[e.want.t]>0?'Yerleştir':money(FURN[e.want.t].cost*infl())}</button></div>`).join('')}
  </div></section>`);}
