/* ============================== NEXT MOVE ============================== */
function nmRes(){return RES.filter(r=>!has(r.id)&&(r.pre||[]).every(has)&&resEarly(r)<=1.01&&resCostOf(r)<=G.cash*0.5).sort((a,b)=>resRP(a)-resRP(b))[0]||null;}
const nmEvCost=()=>400*G.emps.length*infl();
const nmEvOk=()=>G.day-G.teamEventAt>=60&&G.cash>nmEvCost()*3&&G.emps.length>2;
function nmQuick(x){
  if(x.k==='dec')return x.qa;
  const ev=()=>nmEvOk()?{act:'teamevent',lab:(LANG_EN?`Team event ${money(nmEvCost())}`:`Takım etkinliği ${money(nmEvCost())}`)}:null;
  if(x.k==='adv'){const id=x.id;
    if(id==='res'){const r=nmRes();return r?{act:'research',rid:r.id,lab:(LANG_EN?`Start: ${r.n}`:`Başlat: ${r.n}`)}:null;}
    if(id==='idle'&&G.projects.length)return {act:'nmassign',lab:(LANG_EN?"Assign to projects":'Projelere ata')};
    if(id==='bm')return {act:'bmopen',lab:(LANG_EN?"Join meeting":'Toplantıya katıl')};
    if(id==='ar')return {act:'arpub',lab:(LANG_EN?"Prepare report":'Raporu hazırla')};
    if(id==='rack'&&G.cash>rackCost()*2)return {act:'rack',lab:(LANG_EN?`Add rack ${money(rackCost())}`:`Raf ekle ${money(rackCost())}`)};
    if(id==='mor')return ev();
    return null;}
  if(x.q==='promo'){const n=G.emps.filter(e=>e.readySince!=null&&canPromote(e).ok).length;return n?{act:'nmpromo',lab:(LANG_EN?`Promote (${n})`:`Terfi et (${n})`)}:null;}
  if(x.q==='quit')return ev();
  if(x.q==='rest'){const n=G.emps.filter(e=>!e.leave&&!e.founder&&e.energy<30).length;return n?{act:'nmrest',lab:(LANG_EN?`Send on leave (${n})`:`İzne gönder (${n})`)}:null;}
  return null;}
function nmItems(){const out=[];const ic=ibCount();
  if(ic)out.push({k:'dec',sev:'bad',score:200,t:(LANG_EN?`${ic} decisions pending`:`${ic} karar bekliyor`),d:G.pending&&!G.pending.ib?(LANG_EN?"An urgent decision paused the game.":'Acil bir karar oyunu durdurdu.'):(LANG_EN?"Decide before time runs out; otherwise the default option applies.":'Süresi dolmadan karar ver; dolarsa varsayılan seçenek uygulanır.'),qa:G.pending&&!G.pending.ib?{act:'evopen',lab:(LANG_EN?"Decide":'Karar ver')}:{act:'ibbox',lab:(LANG_EN?"Review decisions":'Kararlara bak')}});
  for(const a of alerts()){const i=a.t.indexOf('. ');out.push({k:'al',sev:a.s,score:a.s==='bad'?92:a.s==='warn'?62:28,t:i>0&&i<a.t.length-2?a.t.slice(0,i):a.t.replace(/\.$/,''),d:i>0&&i<a.t.length-2?a.t.slice(i+2):'',go:a.tab||null,q:a.q});}
  if(G.adv&&!G.adv.off)for(const t of advTips())if(!out.some(o=>o.k==='al'&&o.go&&o.go===t.go&&o.score>=t.score))out.push({k:'adv',sev:t.score>=80?'bad':t.score>=60?'warn':'info',score:t.score,t:t.t,d:t.d,go:t.go,btn:t.btn,id:t.id,cat:t.cat});
  out.sort((a,b)=>b.score-a.score);const seen=new Set(),top=[],rest=[];
  for(const x of out){const key=x.go||x.t;if(top.length<3&&!seen.has(key)&&x.score>=40){seen.add(key);top.push(x);}else rest.push(x);}
  return {top,rest};}
function vNextMove(){const {top,rest}=nmItems(),V=G.adv,adv=V&&!V.off,A=adv?ADV[V.who]||ADV.ayla:null;
  const lead=top.find(x=>x.k==='adv'),say=adv?(top.length?(lead?A.say[lead.cat]:(LANG_EN?"Let's look at these first.":'Önce şunlara bakalım.')):A.hi):'';
  const btns=x=>{const q=nmQuick(x);return `${q?`<button class="btn sm primary" data-act="${q.act}"${q.rid?` data-rid="${q.rid}"`:''}>${esc(q.lab)}</button>`:''}${x.go?`<button class="btn sm ${q?'ghost':''}" data-act="tab" data-tab="${x.go}">${q?(LANG_EN?"Go":'Git'):esc(x.btn||leafName(x.go))+' →'}</button>`:''}`;};
  const row=x=>`<div class="nm-row s-${x.sev}"><span class="nm-ic" aria-hidden="true">${x.sev==='bad'?'!':x.sev==='warn'?'•':'i'}</span><div class="nm-tx"><b>${esc(x.t)}</b>${x.d?`<span class="small muted">${esc(x.d)}</span>`:''}</div><div class="nm-act">${btns(x)}</div></div>`;
  return (LANG_EN?`<section class="panel nm-panel"><div class="ph"><div class="row" style="gap:12px;flex-wrap:nowrap;min-width:0">${adv?advAvatar(V.who,40):''}<div style="min-width:0"><h2>Next move</h2><span class="sub">${adv?`${esc(A.n.split(' ')[0])}: ${esc(say)}`:"By priority"}</span></div></div><span class="row" style="gap:6px">${aiOn()?"<button class=\"btn sm\" data-act=\"ask\">Ask Ayla</button>":''}${adv?"<button class=\"btn sm ghost\" data-act=\"advopen\">Advisor</button>":''}</span></div>
    <div class="pb nm-list">${top.length?top.map(row).join(''):"<div class=\"small muted\">Nothing urgent right now. You can speed up the game or start a new product.</div>"}</div>
    ${rest.length?`<details class="dmore nm-more"><summary>${rest.length} more tasks</summary><div class="nm-list">${rest.slice(0,12).map(row).join('')}</div></details>`:''}</section>`:`<section class="panel nm-panel"><div class="ph"><div class="row" style="gap:12px;flex-wrap:nowrap;min-width:0">${adv?advAvatar(V.who,40):''}<div style="min-width:0"><h2>Sıradaki hamle</h2><span class="sub">${adv?`${esc(A.n.split(' ')[0])}: ${esc(say)}`:'Önem sırasına göre'}</span></div></div><span class="row" style="gap:6px">${aiOn()?'<button class="btn sm" data-act="ask">Ayla\'ya sor</button>':''}${adv?'<button class="btn sm ghost" data-act="advopen">Danışman</button>':''}</span></div>
    <div class="pb nm-list">${top.length?top.map(row).join(''):'<div class="small muted">Şu an acil bir iş yok. Oyunu hızlandırabilir ya da yeni bir ürüne başlayabilirsin.</div>'}</div>
    ${rest.length?`<details class="dmore nm-more"><summary>${rest.length} iş daha</summary><div class="nm-list">${rest.slice(0,12).map(row).join('')}</div></details>`:''}</section>`);}
