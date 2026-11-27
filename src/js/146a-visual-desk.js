/* ============================== VISUAL CEO DESK (v174) ==============================
   CEO masasının görsel üst bölümü: solda canlı izometrik ofis (Ofis sayfasındaki çizimin aynısı), sağda şirket kimliği,
   şirket aşaması, senaryo hedefinin yıldız çizelgesi ve dört büyük gösterge. Ürünler tablo satırı yerine simgeli kartlar.
   Eskiden ilk ekran bir başlık ve metin listesiydi; ofis ve harita gibi görseller alt sekmelere gömülüydü. */
const DESK_CC={app:'var(--pt-design)',saas:'var(--pt-soft)',os:'var(--pt-res)',cpu:'var(--pt-hw)',phone:'var(--accent)',pc:'var(--pt-mkt)',wear:'var(--pt-ops)',console:'var(--pt-sup)',ai:'var(--pt-sec)',xr:'var(--ch1)',car:'var(--ch2)',robo:'var(--warn)',iot:'var(--ok)',qc:'var(--pt-res)'};
const deskCC=c=>DESK_CC[c]||'var(--ch1)';
/* halka gösterge: v 0..1, renk, çap */
function deskRing(v,col,d=44,label=''){const r=(d-6)/2,C=2*Math.PI*r,f=Math.max(0,Math.min(1,v));
  return `<svg class="dring" width="${d}" height="${d}" viewBox="0 0 ${d} ${d}" aria-hidden="true"><circle cx="${d/2}" cy="${d/2}" r="${r}" fill="none" stroke="var(--soft)" stroke-width="5"/><circle cx="${d/2}" cy="${d/2}" r="${r}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(C*f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 ${d/2} ${d/2})"/>${label?`<text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle" class="dring-t">${label}</text>`:''}</svg>`;}
/* ürünün aylık brüt kârı (Ürünler tablosundaki hesapla aynı) */
function deskProdMp(p){const hw=isHW(p);const uc=hw?(p.fg>1?p.fgv/p.fg:estUC(p.cat,p.spec,p.plan.site)):p.unitCost;const sales=hw?p.sr:p.units;return sales*((hw?p.price:revPerUser(p))-uc);}
/* şirket aşaması: garaj → küçük ofis → kat → plaza → kampüs; sonraki aşamaya çalışan kapasitesiyle ilerleme */
function deskStage(){const i=G.office||0,o=OFFICES[i],nx=OFFICES[i+1];return {i,n:o.n,max:OFFICES.length,next:nx?nx.n:null};}
/* senaryo zaman çizelgesi: 3★ / 2★ / 1★ bölgeleri ve bugünün işareti */
function deskStarTrack(){const sc=G.scn;if(!sc||!sc.end)return '';const used=Math.min(1,Math.min(G.day,sc.end)/sc.end);
  const z=(a,b,c,lab)=>`<div class="dst-z" style="left:${a*100}%;width:${(b-a)*100}%;background:${c}"><span>${lab}</span></div>`;
  return `<div class="dst" role="img" aria-label="${LANG_EN?`Scenario time used: ${Math.round(used*100)}%`:`Senaryo süresinin %${Math.round(used*100)}'i geçti`}">${z(0,0.5,'color-mix(in srgb,var(--ok) 22%,transparent)','★★★')}${z(0.5,0.75,'color-mix(in srgb,var(--warn) 22%,transparent)','★★')}${z(0.75,1,'color-mix(in srgb,var(--bad) 18%,transparent)','★')}<i class="dst-now" style="left:${used*100}%"></i></div>`;}
function deskGoals(){const sc=G.scn;if(!sc||!sc.end)return '';const S0=SCN[sc.id];
  const gl=scnGoals().map((g,i)=>{const st=goalState(g,i);const v=st.ok?1:Math.max(0,Math.min(1,st.p||0));
    return `<div class="dgoal ${st.ok?'ok':''}">${deskRing(st.ok?1:v,st.ok?'var(--ok)':'var(--accent)',40,st.ok?'✓':Math.round(v*100)+'')}<div style="min-width:0"><div class="dgoal-n">${esc(g.n)}</div><div class="small muted num">${st.show}</div></div></div>`;}).join('');
  return `<div class="dh-goal"><div class="row between"><b>${LANG_EN?'Goal':'Hedef'} · ${esc(S0.n)}</b><span class="small">${scnStatus()}</span></div><div class="dgoals">${gl}</div>${sc.won==null&&sc.fail==null?deskStarTrack():''}</div>`;}
function deskHero(kp,intro){const st=deskStage(),es=G.emps;
  const logo=G.bi&&G.bi.lg?biSVG(G.bi.lg,G.name,48,false,G.name+(LANG_EN?' logo':' logosu')):'';
  const start=!G.speed&&!G.over&&!G.pending?`<button class="btn primary" data-act="start">▶ ${LANG_EN?'Start game':'Oyunu başlat'}</button>`:'';
  const pips=Array.from({length:st.max},(_,k)=>`<i class="${k<=st.i?'on':''}"></i>`).join('');
  return `<section class="panel dhero">
    <div class="dh-scene">
      <div class="dh-badge"><span class="dh-pips" aria-hidden="true">${pips}</span><b>${esc(st.n)}</b><span class="muted">${es.length}/${officeCap()} ${LANG_EN?'people':'kişi'}${st.next?` · ${LANG_EN?'next':'sonraki'}: ${esc(st.next)}`:''}</span></div>
      <div class="ofwrap dh-of"><canvas id="officeCanvas" role="img" aria-label="${LANG_EN?'Your office: employees working at their desks':'Ofisin: çalışanlar masalarında çalışıyor'}"></canvas></div>
      <button class="btn sm dh-go" data-act="tab" data-tab="office">${LANG_EN?'Go to office':'Ofise git'} →</button>
    </div>
    <div class="dh-side">
      <div class="row" style="gap:12px;align-items:center;flex-wrap:nowrap;min-width:0">${logo}<div style="min-width:0"><div class="eyebrow">${fmtDate(G.day)}</div><h1>${esc(G.name)}</h1>${G.bi&&G.bi.slo?`<div class="small muted">“${esc(G.bi.slo)}”</div>`:''}</div></div>
      ${intro}${start?`<div>${start}</div>`:''}
      ${deskGoals()}
      <div class="dkpis dh-kpis">${kp}</div>
    </div></section>`;}
function deskProdCards(mine){if(!mine.length)return '';
  return `<div class="dpcards">${mine.slice().sort((a,b)=>b.share-a.share).slice(0,6).map(p=>{const v=p.score/S(p.cat),mp=deskProdMp(p),fc=v<0.7?'var(--bad)':v<0.85?'var(--warn)':'var(--ok)';
    return `<div class="dpc" style="--cc:${deskCC(p.cat)}"><div class="dpc-ic" aria-hidden="true">${CAT_ICON[p.cat]||''}</div><div class="dpc-b"><b class="dpc-n">${esc(p.name)}</b><span class="small muted">${CATS[p.cat].n}</span>
      <div class="dpc-m"><span title="${LANG_EN?'Market share':'Pazar payı'}"><b class="num">${pct(p.share,1)}</b> ${LANG_EN?'share':'pay'}</span><span class="num ${mp<0?'neg':'pos'}">${mp<0?'':'+'}${money(mp)}${LANG_EN?'/mo':'/ay'}</span></div></div>
      <div class="dpc-r" title="${LANG_EN?'Freshness':'Güncellik'} ${pct(v,0)}">${deskRing(Math.min(1,v),fc,46,Math.round(Math.min(1.5,v)*100)+'')}</div></div>`;}).join('')}</div>`;}
/* ---- çalışan avatarı (v176): ofisteki karakterle aynı renkler (gömlek = rol, ten ve saç = kimlik numarası);
   saç biçimi ve gözlük kimlikten, ağız moralden (mutlu / normal / mutsuz), yorgunken göz kapakları düşük. ---- */
const ROLE_CV={soft:'--pt-soft',design:'--pt-design',hw:'--pt-hw',res:'--pt-res',mkt:'--pt-mkt',ops:'--pt-ops',sup:'--pt-sup',sec:'--pt-sec'};
const roleCC=r=>`var(${ROLE_CV[r]||'--ch1'})`;
function empAvatar(e,d=44){const id=Math.abs(+e.id||0),skin=SKINS[id%SKINS.length],hair=HAIRS[(id*7)%HAIRS.length],st=id%4,gl=id%5===2,cc=roleCC(e.role);
  const mo=e.morale==null?70:e.morale,tired=(e.energy==null?80:e.energy)<35;
  const mouth=mo>=65?'M19 31q5 4 10 0':mo>=40?'M19.5 31.5h9':'M19 33q5-4 10 0';
  const hairP=st===0?'M14 21c0-7 4-11 10-11s10 4 10 11c-2-3-5-5-10-5s-8 2-10 5z':st===1?'M13 23c0-9 5-13 11-13s11 4 11 13v8c-1-3-1-6-2-9-3 0-8-2-10-5-2 3-5 5-8 5-1 3-1 6-2 9z':st===2?'M14 21c0-7 4-11 10-11s10 4 10 11c-2-3-5-5-10-5s-8 2-10 5zM20 9a4 4 0 1 1 8 0 4 4 0 1 1-8 0z':'M15 19c1-5 4-8 9-8s8 3 9 8c-3-2-6-2-9-2s-6 0-9 2z';
  const eyes=tired?'<path d="M18.5 24.5h3M26.5 24.5h3" stroke="#2B211C" stroke-width="1.6" stroke-linecap="round"/>':'<circle cx="20" cy="24.5" r="1.5" fill="#2B211C"/><circle cx="28" cy="24.5" r="1.5" fill="#2B211C"/>';
  return `<svg class="eav" viewBox="0 0 48 48" width="${d}" height="${d}" aria-hidden="true"><circle cx="24" cy="24" r="24" fill="color-mix(in srgb,${cc} 18%,var(--panel))"/><clipPath id="eavc${id}"><circle cx="24" cy="24" r="24"/></clipPath><g clip-path="url(#eavc${id})"><path d="M8 50c1-10 7-15 16-15s15 5 16 15z" fill="${cc}"/><path d="M20 35l4 5 4-5" fill="none" stroke="#fff" stroke-width="1.4" opacity=".7"/></g><circle cx="24" cy="24" r="10.5" fill="${skin}"/><path d="${hairP}" fill="${hair}"/>${eyes}${gl?'<g fill="none" stroke="#1C1C1C" stroke-width="1.3"><circle cx="20" cy="24.5" r="3.2"/><circle cx="28" cy="24.5" r="3.2"/><path d="M23.2 24.5h1.6"/></g>':''}<path d="${mouth}" fill="none" stroke="#7A2E22" stroke-width="1.6" stroke-linecap="round"/>${e.founder?'<circle cx="39" cy="9" r="7" fill="var(--warn)" stroke="var(--panel)" stroke-width="2"/><path d="M39 5.2l1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4z" fill="#fff"/>':''}</svg>`;}
