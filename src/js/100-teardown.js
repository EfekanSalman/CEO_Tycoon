/* ============================== TEARDOWN ============================== */
/* Rakip ürün sökümü (Ar-Ge → Ürün sökümü): rakibin piyasadaki ürünü satın alınır ve laboratuvarda sökülür.
   Rapor: gerçek güncellik, birim maliyet ve marj, tasarım odağı, en güçlü ve en zayıf yönü, en çok sevdiği kitle.
   Kazanım: o kategoride 18 ay boyunca yeni ürün ve büyük güncellemelerde puan bonusu (rakip senden ne kadar öndeyse o kadar büyük, %3–8)
   ve kategoriyle ilgili en fazla üç araştırmada araştırma puanı indirimi.
   Yol: temiz oda (45 gün, ×1,5 maliyet, kazanımın %60'ı, yasal risk yok) ya da doğrudan kopya (25 gün, tam kazanım; rakip iki yıl içinde,
   o kategoride sökümden sonra çıkardığın ürünler için patent davası açabilir — mevcut dava sistemi). Aynı anda en fazla 2 söküm. */
const TDN_AP={clean:{n:(LANG_EN?"Clean room":'Temiz oda'),days:45,k:1.5,gain:0.75,rel:-2,rd:0.15},direct:{n:(LANG_EN?"Direct copy":'Doğrudan kopya'),days:25,k:1,gain:1,rel:-8,rd:0.25}};
const TDN_MAX=2,TDN_KNOW=540,TDN_TAINT=730;
/* kazanım: rakip senden ne kadar öndeyse o kadar büyük (%4–10), yöntemin payıyla çarpılır */
const tdnGain=(gap,ap)=>Math.round(TDN_AP[ap].gain*clamp(0.04+0.5*Math.max(0,gap),0.04,0.1)*1000)/1000;
const newTdn=()=>({jobs:[],reps:[],kn:{},rd:{},taint:[],done:{},nid:0});
const tdnOf=()=>G.tdn||(G.tdn=newTdn());
const tdnUnits=p=>isHW(p)?10:12;
function tdnCost(p,ap){const unit=Math.max(p.price||0,p.cat==='app'?CATS.app.arpu||1:1),buy=unit*tdnUnits(p),lab=Math.max(60e3,(CATS[p.cat].ref||300)*120)*infl()*(1+years()*0.1);return Math.round((buy+lab)*TDN_AP[ap].k);}
const tdnMyV=cat=>myActive(cat).reduce((a,p)=>Math.max(a,p.score/S(cat)),0);
/* puan bonusu (spec içinde): süresi dolmamış bilgi */
function tdnBoost(cat){const T=G&&G.tdn;if(!T||!T.kn[cat])return 0;const k=T.kn[cat];if(G.day>k.until){delete T.kn[cat];return 0;}return k.b;}
/* araştırma indirimi (resRP içinde) */
const tdnResDisc=id=>(G&&G.tdn&&G.tdn.rd[id])||0;
function tdnBlock(p,ap){const T=tdnOf();if(!p||!p.active||p.owner==='P')return (LANG_EN?"This product is no longer on the market.":'Bu ürün artık piyasada değil.');if(!TDN_AP[ap])return '?';
  if(T.jobs.length>=TDN_MAX)return (LANG_EN?`At most ${TDN_MAX} teardowns can run at once.`:`Aynı anda en fazla ${TDN_MAX} söküm yürütülebilir.`);if(T.done[p.id]||T.jobs.some(j=>j.pid===p.id))return (LANG_EN?"You already tore this product down.":'Bu ürünü zaten söktün.');
  const R=REQ_ROLES[p.cat]||[];if(!G.emps.some(e=>R.includes(e.role)&&!e.leave))return (LANG_EN?"You have no engineer working in this category.":'Bu kategoride çalışacak bir mühendisin yok.');
  if(G.cash<tdnCost(p,ap))return (LANG_EN?"Not enough cash.":'Yeterli nakit yok.');return '';}
function tdnStart(pid,ap){const p=prod(pid),w=tdnBlock(p,ap);if(w){showToast(w,'bad');return false;}const T=tdnOf(),A=TDN_AP[ap],c=tdnCost(p,ap);
  spend(c,'other');T.jobs.push({id:'t'+(++T.nid),pid:p.id,cid:p.owner,cat:p.cat,name:p.name,ap,s:G.day,end:G.day+A.days,cost:c});
  news((LANG_EN?`${p.name} was taken to the lab for teardown (${A.n.toLocaleLowerCase(LOC)}, ${A.days} days).`:`${p.name} sökülmek üzere laboratuvara alındı (${A.n.toLocaleLowerCase(LOC)}, ${A.days} gün).`),'');return true;}
function tdnFinish(j){const T=tdnOf(),p=prod(j.pid),c=comp(j.cid),A=TDN_AP[j.ap],cat=j.cat;T.jobs=T.jobs.filter(x=>x!==j);T.done[j.pid]=G.day;
  if(!p){news((LANG_EN?`${j.name} teardown could not finish: the product is gone from the records.`:`${j.name} sökümü tamamlanamadı: ürün kayıtlardan kalktı.`),'bad');return;}
  const v=p.score/S(cat),me=tdnMyV(cat),f={...faOf(p)},fx=faFx(cat,f),set=faSet(cat);
  const strong=set.slice().sort((a,b)=>(f[b]||0)-(f[a]||0))[0],weak=set.slice().sort((a,b)=>(f[a]||0)-(f[b]||0))[0];
  const seg=Object.entries(fx.seg).sort((a,b)=>b[1]-a[1])[0][0],uc=p.unitCost||0,mg=p.price>0?(p.price-uc)/p.price:0;
  const b=tdnGain(v-me,j.ap);
  const k=T.kn[cat];T.kn[cat]={b:Math.max(b,k&&G.day<=k.until?k.b:0),until:G.day+TDN_KNOW,src:p.name};
  // ilgili araştırmalar: bu kategoriye patent/teknoloji katkısı olan, henüz yapılmamış en fazla 3 araştırma (önkoşulu hazır olanlar önce)
  const rs=RES.filter(r=>!has(r.id)&&(PAT_CAT[r.id]||[]).includes(cat)&&!(G.res.active&&G.res.active.id===r.id)).sort((a,b)=>((b.pre||[]).every(has)?1:0)-((a.pre||[]).every(has)?1:0)||a.rp-b.rp).slice(0,3);
  for(const r of rs)T.rd[r.id]=Math.max(T.rd[r.id]||0,A.rd);
  if(j.ap==='direct')T.taint.push({cid:j.cid,cat,d:G.day,until:G.day+TDN_TAINT});
  if(c)c.rel=clamp(relOf(c)+A.rel,-100,100);
  T.reps.unshift({id:j.id,pid:p.id,name:p.name,cid:j.cid,cat,ap:j.ap,d:G.day,v,me,uc,price:p.price,mg,f,strong,weak,seg,b,rs:rs.map(r=>r.id)});if(T.reps.length>8)T.reps.pop();
  // piyasadaki ürünlerin de hemen aynı oranda iyileşir, ürün başına bir kez (tekrarlanan sökümler puanı şişirmesin).
  // Bot ölçümünde kazanç yalnızca sonraki ürünlere işlerken söküm zarar ettiriyordu.
  const now=myActive(cat).filter(q=>!q.tdnB);for(const q of now){q.score*=1+b;q.tdnB=G.day;}
  news((LANG_EN?`${p.name} teardown complete: ${CATS[cat].n} products score +${tdnF(b*100)}% for 18 months${now.length?`, your ${now.length} products on the market +${tdnF(b*100)}% right away`:''}${rs.length?`, discount on ${rs.length} research items`:''}.`:`${p.name} sökümü tamamlandı: ${CATS[cat].n} ürünlerinde 18 ay puan +%${tdnF(b*100)}${now.length?`, piyasadaki ${now.length} ürün hemen +%${tdnF(b*100)}`:''}${rs.length?`, ${rs.length} araştırmada indirim`:''}.`),'good',true);}
const tdnF=x=>fx(x,1);
function tdnDaily(){const T=G.tdn;if(!T||!T.jobs.length)return;for(const j of T.jobs.slice())if(G.day>=j.end)tdnFinish(j);}
/* kopya davasının talebi (v171): aylık kategori cirosunun 3–5 katı (en az 500K), ama nakdinin en çok %30'u (en az 300K). Normal patent davasından
   (%20) ağır çünkü kopya kanıtı var; eskiden tavansızdı ve v166'da normal davalara konan sınır burada yoktu, genç şirketi tek davada batırabiliyordu. */
const TDN_SUIT_CAP=0.3,tdnClaim=cat=>Math.round(Math.min(Math.max(5e5*infl(),catRev('P',cat)*rnd(3,5)),Math.max(3e5*infl(),Math.max(0,G.cash)*TDN_SUIT_CAP)));
/* doğrudan kopyanın riski: rakip, sökümden sonra o kategoride çıkardığın ürünler için dava açabilir (ayda %3,5; bir kez) */
function tdnMonthly(){const T=G.tdn;if(!T||!T.taint.length)return;T.taint=T.taint.filter(t=>G.day<t.until);
  for(const t of T.taint.slice()){const c=comp(t.cid);if(!c||c.dead){T.taint=T.taint.filter(x=>x!==t);continue;}
    if(G.pending||G.cases.some(k=>k.cid===t.cid))continue;const used=myActive(t.cat).some(p=>(p.launch||0)>=t.d||(p.updAt||0)>=t.d);
    if(used&&Math.random()<0.035){T.taint=T.taint.filter(x=>x!==t);triggerChoice('suitIn',{cid:t.cid,cat:t.cat,claim:tdnClaim(t.cat)});}}}
function tdnAct(a,ds){if(a==='tdnstart')tdnStart(+ds.id,ds.k);else if(a==='tdncat')UI.tdnCat=ds.k||null;}
/* ---- görünüm ---- */
function tdnRivalList(){const mine=new Set(myActive().map(p=>p.cat));return G.products.filter(p=>p.active&&p.owner!=='P'&&alive(p.owner)&&CATS[p.cat]);}
function vTdnReport(R){const c=comp(R.cid),cat=R.cat,set=faSet(cat),SEGN={eco:(LANG_EN?"price-focused":'fiyat odaklı'),main:(LANG_EN?"mainstream":'ana akım'),pro:(LANG_EN?"discerning":'seçici')};
  const bars=set.map(a=>`<div class="td-fa"><span class="small">${esc(faName(cat,a))}</span><span class="td-b"><i style="width:${(R.f[a]||0)/4*100}%"></i></span><span class="num small">${R.f[a]||0}/4</span></div>`).join('');
  return (LANG_EN?`<div class="td-rep"><div class="row between" style="gap:6px;flex-wrap:wrap"><b>${esc(R.name)}</b><span class="small muted">${esc(c?c.name:'?')} · ${CATS[cat].n} · ${fmtDate(R.d)} · ${TDN_AP[R.ap].n}</span></div>
    <div class="td-k"><span><small>Freshness</small><b class="num">${pct(R.v,0)}</b><small class="muted">yours ${R.me?pct(R.me,0):'—'}</small></span><span><small>Unit cost</small><b class="num">${R.uc?money(R.uc):'—'}</b></span><span><small>Price · margin</small><b class="num">${money(R.price)} · ${pct(R.mg,0)}</b></span><span><small>Score bonus</small><b class="num pos">+${tdnF(R.b*100)}%</b><small class="muted">18 mo</small></span></div>
    <div class="td-fas">${bars}</div>
    <div class="small">Strongest side <b>${esc(faName(cat,R.strong))}</b>, weakest side <b>${esc(faName(cat,R.weak))}</b>; it appeals most to the ${SEGN[R.seg]} crowd. A product focused on ${esc(faName(cat,R.weak))} can win the customers this one misses.</div>
    ${R.rs&&R.rs.length?`<div class="small muted">Research discount: ${R.rs.map(id=>RESD[id]?esc(RESD[id].n):id).join(', ')} (−${Math.round(TDN_AP[R.ap].rd*100)}% research points)</div>`:''}</div>`:`<div class="td-rep"><div class="row between" style="gap:6px;flex-wrap:wrap"><b>${esc(R.name)}</b><span class="small muted">${esc(c?c.name:'?')} · ${CATS[cat].n} · ${fmtDate(R.d)} · ${TDN_AP[R.ap].n}</span></div>
    <div class="td-k"><span><small>Güncellik</small><b class="num">${pct(R.v,0)}</b><small class="muted">seninki ${R.me?pct(R.me,0):'—'}</small></span><span><small>Birim maliyet</small><b class="num">${R.uc?money(R.uc):'—'}</b></span><span><small>Fiyat · marj</small><b class="num">${money(R.price)} · ${pct(R.mg,0)}</b></span><span><small>Puan bonusu</small><b class="num pos">+%${tdnF(R.b*100)}</b><small class="muted">18 ay</small></span></div>
    <div class="td-fas">${bars}</div>
    <div class="small">En güçlü yönü <b>${esc(faName(cat,R.strong))}</b>, en zayıf yönü <b>${esc(faName(cat,R.weak))}</b>; en çok ${SEGN[R.seg]} kitleye hitap ediyor. ${esc(faName(cat,R.weak))} odaklı bir ürün, bu ürünün kaçırdığı müşterileri çekebilir.</div>
    ${R.rs&&R.rs.length?`<div class="small muted">Araştırma indirimi: ${R.rs.map(id=>RESD[id]?esc(RESD[id].n):id).join(', ')} (−%${Math.round(TDN_AP[R.ap].rd*100)} araştırma puanı)</div>`:''}</div>`);}
function vTeardown(){const T=tdnOf(),L=tdnRivalList(),cats=[...new Set(L.map(p=>p.cat))].sort((a,b)=>CAT_ORDER.indexOf(a)-CAT_ORDER.indexOf(b)),mine=new Set(myActive().map(p=>p.cat));
  const rp=rvnTdPick();let cf=UI.tdnCat;if(!cf||!cats.includes(cf))cf=(rp&&cats.includes(rp.cat)?rp.cat:null)||cats.find(c=>mine.has(c))||cats[0]||null;
  const rows=L.filter(p=>p.cat===cf).sort((a,b)=>b.score-a.score).slice(0,10).map(p=>{const c=comp(p.owner),dn=T.done[p.id]!=null||T.jobs.some(j=>j.pid===p.id);
    const btn=ap=>{const w=tdnBlock(p,ap);return (LANG_EN?`<button class="btn sm${ap==='direct'?'':' ghost'}" data-act="tdnstart" data-id="${p.id}" data-k="${ap}" ${w?`disabled title="${esc(w)}"`:''}>${TDN_AP[ap].n} · ${money(tdnCost(p,ap))} · ${TDN_AP[ap].days} days</button>`:`<button class="btn sm${ap==='direct'?'':' ghost'}" data-act="tdnstart" data-id="${p.id}" data-k="${ap}" ${w?`disabled title="${esc(w)}"`:''}>${TDN_AP[ap].n} · ${money(tdnCost(p,ap))} · ${TDN_AP[ap].days} gün</button>`);};
    return (LANG_EN?`<div class="td-row"><div><b>${esc(p.name)}</b>${rp&&rp.rv===p&&!dn?" <span class=\"chip st-ok\">Recommended</span>":''}<div class="small muted">${esc(c?c.name:'?')} · freshness ${pct(p.score/S(p.cat),0)} · ${money(p.price)}</div></div><div class="row td-btns">${dn?"<span class=\"chip st-mute\">Torn down</span>":btn('clean')+btn('direct')}</div></div>`:`<div class="td-row"><div><b>${esc(p.name)}</b>${rp&&rp.rv===p&&!dn?' <span class="chip st-ok">Önerilen</span>':''}<div class="small muted">${esc(c?c.name:'?')} · güncellik ${pct(p.score/S(p.cat),0)} · ${money(p.price)}</div></div><div class="row td-btns">${dn?'<span class="chip st-mute">Söküldü</span>':btn('clean')+btn('direct')}</div></div>`);}).join('');
  const jobs=T.jobs.length?`<div class="col" style="gap:6px">${T.jobs.map(j=>{const pr=clamp((G.day-j.s)/Math.max(1,j.end-j.s),0,1);return (LANG_EN?`<div class="td-job"><div class="row between small"><span><b>${esc(j.name)}</b> · ${TDN_AP[j.ap].n}</span><span class="num">${j.end-G.day} days</span></div><div class="bar"><i style="width:${(pr*100).toFixed(0)}%"></i></div></div>`:`<div class="td-job"><div class="row between small"><span><b>${esc(j.name)}</b> · ${TDN_AP[j.ap].n}</span><span class="num">${j.end-G.day} gün</span></div><div class="bar"><i style="width:${(pr*100).toFixed(0)}%"></i></div></div>`);}).join('')}</div>`:'';
  const kn=Object.entries(T.kn).filter(([,k])=>G.day<=k.until),rd=Object.entries(T.rd).filter(([id])=>!has(id)&&RESD[id]);
  const know=kn.length||rd.length?(LANG_EN?`<div class="col" style="gap:4px"><b class="small">Knowledge you hold</b><div class="row" style="gap:6px;flex-wrap:wrap">${kn.map(([cat,k])=>`<span class="chip st-ok" title="${esc(k.src)}">${CATS[cat].n}: score +${tdnF(k.b*100)}% · until ${fmtDate(k.until)}</span>`).join('')}${rd.map(([id,v])=>`<span class="chip st-mute">${esc(RESD[id].n)}: −${Math.round(v*100)}% RP</span>`).join('')}</div></div>`:`<div class="col" style="gap:4px"><b class="small">Elindeki bilgi</b><div class="row" style="gap:6px;flex-wrap:wrap">${kn.map(([cat,k])=>`<span class="chip st-ok" title="${esc(k.src)}">${CATS[cat].n}: puan +%${tdnF(k.b*100)} · ${fmtDate(k.until)} tarihine kadar</span>`).join('')}${rd.map(([id,v])=>`<span class="chip st-mute">${esc(RESD[id].n)}: −%${Math.round(v*100)} AP</span>`).join('')}</div></div>`):'';
  const risk=T.taint.filter(t=>G.day<t.until).length;
  return (LANG_EN?`<section class="panel td"><div class="ph"><h2>Rival product teardown${helpBtn('td')}</h2><span class="sub">at most ${TDN_MAX} teardowns at once${risk?` · ${risk} direct copies carry lawsuit risk`:''}</span></div><div class="pb col" style="gap:12px">
    <p class="small muted" style="margin:0">You buy a rival's product and take it apart in the lab: you learn its real freshness, unit cost, margin and design focus. For 18 months, new products and major updates in that category score higher (the further the rival is ahead of you, the more, 4–10%), your products already on the market improve right away by the same amount (once per product), and related research gets cheaper. A clean room is slow and expensive but carries no legal risk; a direct copy is fast, but within two years the rival may sue over products you launch in that category.</p>
    ${jobs}${know}
    ${cats.length?`<div class="row" style="gap:6px;flex-wrap:wrap" role="group" aria-label="Category">${cats.map(c=>`<button class="btn sm ${c===cf?'primary':''}" data-act="tdncat" data-k="${c}" aria-pressed="${c===cf}"${mine.has(c)?" title=\"You have a product in this category\"":''}>${CATS[c].n}${mine.has(c)?' ✓':''}</button>`).join('')}</div><div class="col td-list">${rows}</div>`:"<div class=\"small muted\">No rival products on the market to tear down.</div>"}
    ${T.reps.length?`<div class="col" style="gap:8px"><b>Teardown reports</b>${T.reps.map(vTdnReport).join('')}</div>`:''}</div></section>`:`<section class="panel td"><div class="ph"><h2>Rakip ürün sökümü${helpBtn('td')}</h2><span class="sub">aynı anda en fazla ${TDN_MAX} söküm${risk?` · ${risk} doğrudan kopya dava riski taşıyor`:''}</span></div><div class="pb col" style="gap:12px">
    <p class="small muted" style="margin:0">Rakibin ürününü satın alıp laboratuvarda sökersin: gerçek güncelliğini, birim maliyetini, marjını ve tasarım odağını öğrenirsin. O kategoride 18 ay boyunca yeni ürün ve büyük güncellemelerin puanı artar (rakip senden ne kadar öndeyse o kadar çok, %4–10), piyasadaki ürünlerin hemen aynı oranda iyileşir (ürün başına bir kez) ve ilgili araştırmalar ucuzlar. Temiz oda yavaş ve pahalıdır ama yasal risk taşımaz; doğrudan kopya hızlıdır, ama rakip iki yıl içinde o kategoride çıkardığın ürünler için patent davası açabilir.</p>
    ${jobs}${know}
    ${cats.length?`<div class="row" style="gap:6px;flex-wrap:wrap" role="group" aria-label="Kategori">${cats.map(c=>`<button class="btn sm ${c===cf?'primary':''}" data-act="tdncat" data-k="${c}" aria-pressed="${c===cf}"${mine.has(c)?' title="Bu kategoride ürünün var"':''}>${CATS[c].n}${mine.has(c)?' ✓':''}</button>`).join('')}</div><div class="col td-list">${rows}</div>`:'<div class="small muted">Piyasada sökülecek rakip ürün yok.</div>'}
    ${T.reps.length?`<div class="col" style="gap:8px"><b>Söküm raporları</b>${T.reps.map(vTdnReport).join('')}</div>`:''}</div></section>`);}
