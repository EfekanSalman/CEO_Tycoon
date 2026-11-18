/* ============================== WORK POLICY ============================== */
const WPOL={office:{n:(LANG_EN?"In office":'Ofiste'),ic:'⌂',cap:1,rent:1,stip:0,cult:80,hire:0,d:(LANG_EN?"Everyone in the office every day. Strong team cohesion; hardware and design teams are productive. Office capacity is limited.":'Herkes her gün ofiste. Takım bağı güçlü, donanım ve tasarım ekipleri verimli. Ofis kapasitesi sınırlı.')},
  hybrid:{n:(LANG_EN?"Hybrid":'Hibrit'),ic:'⇄',cap:1.6,rent:0.9,stip:150,cult:62,hire:0.15,d:(LANG_EN?"Three office days a week. With shared desks the office holds 1.6× the people; most employees' preference.":'Haftada üç gün ofis. Paylaşımlı masalarla ofis 1,6 kat kişi alır; çoğu çalışanın tercihi.')},
  remote:{n:(LANG_EN?"Fully remote":'Tamamen uzaktan'),ic:'◎',cap:4,rent:0.6,stip:300,cult:35,hire:0.4,d:(LANG_EN?"Everyone works from anywhere. Rent drops and a global talent pool opens up; but team cohesion weakens, the hardware team struggles and cyber risk rises.":'Herkes her yerden çalışır. Kira düşer, dünya çapında yetenek havuzu açılır; ama takım bağı zayıflar, donanım ekibi zorlanır, siber risk artar.')}};
const WP_ORDER=['office','hybrid','remote'];
const WP_PROD={hybrid:{hw:0.95,ops:0.95,_:1.02},remote:{soft:1,sup:1,hw:0.8,ops:0.85,_:0.95}};
const wPol=()=>G.wpol&&WPOL[G.wpol]?G.wpol:'office';
function wPref(e){if(!e.wp){const post=G.mac&&G.mac.shockDone,r=Math.random();e.wp=post?(r<0.15?'office':r<0.65?'hybrid':'remote'):(r<0.35?'office':r<0.8?'hybrid':'remote');}return e.wp;}
const wDist=(a,b)=>Math.abs(WP_ORDER.indexOf(a)-WP_ORDER.indexOf(b));
function wProd(e){const pol=wPol(),sh=macPh()==='shock';let m=1;
  if(pol!=='office'){const T=WP_PROD[pol];m=T[e.role]!=null?T[e.role]:T._;}else if(sh)m=0.75;
  return m*(0.95+0.1*(G.cult==null?80:G.cult)/100);}
const wCapM=()=>WPOL[wPol()].cap;
const wStipend=()=>WPOL[wPol()].stip*G.emps.length*infl();
const wHire=()=>WPOL[wPol()].hire;
function wMonthly(){
  const pol=wPol(),P0=WPOL[pol];G.cult=G.cult==null?80:G.cult;G.cult+=(P0.cult-G.cult)*0.08+(G.emps.length>60&&pol!=='office'?-0.5:0);G.cult=clamp(G.cult,0,100);
  for(const e of G.emps){if(e.founder&&!e.cof)continue;const d=wDist(wPref(e),pol);e.morale=clamp(e.morale+(d===0?1.2:d===1?-0.6:-1.8),0,100);}
  if(macPh()==='shock'&&pol==='office'){for(const e of G.emps)e.morale=clamp(e.morale-2,0,100);if(!G.wShockMsg){G.wShockMsg=true;news((LANG_EN?"Keeping everyone in the office during the pandemic is both risky and inefficient: employees are uneasy and productivity has dropped. Consider remote or hybrid work.":'Salgın sürerken herkesi ofiste tutmak hem riskli hem verimsiz: çalışanlar huzursuz, üretkenlik düştü. Uzaktan ya da hibrit çalışmayı düşün.'),'bad',true);}}
}
function vWork(){
  const pol=wPol(),es=G.emps.filter(e=>!(e.founder&&!e.cof)),cnt={office:0,hybrid:0,remote:0};for(const e of es)cnt[wPref(e)]++;
  const n=Math.max(1,es.length),match=es.filter(e=>wPref(e)===pol).length/n,cd=90-(G.day-(G.wpolAt||-999)),cult=G.cult==null?80:G.cult;
  const cards=WP_ORDER.map(k=>{const P0=WPOL[k],cur=k===pol,mm=es.filter(e=>wPref(e)===k).length,away=es.filter(e=>wDist(wPref(e),k)===2).length;
    return (LANG_EN?`<div class="proj col" style="gap:6px${cur?";border-color:var(--accent)":''}"><div class="row between"><b>${P0.ic} ${P0.n}</b>${cur?"<span class=\"chip st-ok\">Current</span>":''}</div><div class="small muted">${P0.d}</div>
      <div class="kv small"><span>Office capacity</span><b>${Math.round(OFFICES[G.office].cap*(G.floors||1)*P0.cap)} people</b><span>Rent</span><b>×${fx(P0.rent,1)}</b><span>Home office stipend</span><b>${P0.stip?money(P0.stip*infl())+"/person/mo":'—'}</b><span>Would be satisfied</span><b>${mm}/${es.length}${away?` <small class="neg">· ${away} very unhappy</small>`:''}</b></div>
      ${cur?'':`<button class="btn sm ${k==='remote'||k==='hybrid'?'primary':''}" data-act="wpol" data-k="${k}" ${cd>0?'disabled':''}>${cd>0?cd+" days until you can change":"Switch to this model"}</button>`}</div>`:`<div class="proj col" style="gap:6px${cur?';border-color:var(--accent)':''}"><div class="row between"><b>${P0.ic} ${P0.n}</b>${cur?'<span class="chip st-ok">Şu anki</span>':''}</div><div class="small muted">${P0.d}</div>
      <div class="kv small"><span>Ofis kapasitesi</span><b>${Math.round(OFFICES[G.office].cap*(G.floors||1)*P0.cap)} kişi</b><span>Kira</span><b>×${fx(P0.rent,1)}</b><span>Ev ofis desteği</span><b>${P0.stip?money(P0.stip*infl())+'/kişi/ay':'—'}</b><span>Memnun olacak</span><b>${mm}/${es.length}${away?` <small class="neg">· ${away} kişi çok mutsuz</small>`:''}</b></div>
      ${cur?'':`<button class="btn sm ${k==='remote'||k==='hybrid'?'primary':''}" data-act="wpol" data-k="${k}" ${cd>0?'disabled':''}>${cd>0?cd+' gün sonra değiştirilebilir':'Bu modele geç'}</button>`}</div>`);}).join('');
  const seg=(v,c)=>v?`<span style="flex:${v} 0 0;background:${c}"></span>`:'';
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Work model${helpBtn('remote')}</h2><span class="sub">${WPOL[pol].n}</span></div>
    <div class="kpis"><div class="kpi"><span>Preference match</span><b class="${match>=0.6?'pos':match<0.35?'neg':''}">${Math.round(match*100)}%</b></div><div class="kpi"><span>Team cohesion</span><b class="${cult>=60?'pos':cult<40?'neg':''}">${Math.round(cult)}</b></div>
      <div class="kpi"><span>Office capacity</span><b>${officeCap()} people</b></div><div class="kpi"><span>Home office stipend</span><b>${money(wStipend())}/mo</b></div></div>
    <div class="pb col" style="gap:8px"><div class="small"><b>Employee preferences</b></div>
      <div style="display:flex;height:12px;border-radius:2px;overflow:hidden;gap:1px" role="img" aria-label="Work preference breakdown">${seg(cnt.office,'var(--pt-hw)')}${seg(cnt.hybrid,'var(--ch1)')}${seg(cnt.remote,'var(--pt-res)')}</div>
      <div class="row small" style="gap:14px;flex-wrap:wrap"><span><b style="color:var(--pt-hw)">■</b> Office ${cnt.office}</span><span><b style="color:var(--ch1)">■</b> Hybrid ${cnt.hybrid}</span><span><b style="color:var(--pt-res)">■</b> Remote ${cnt.remote}</span></div>
      <p class="small muted">Employees whose preference is met gain morale every month; those who want otherwise lose it. Team cohesion grows in the office and weakens with remote work; it affects productivity by ±5%, and weak cohesion makes rivals' offers more tempting. You can change the model once every 90 days, and it has an immediate morale effect. Insisting on the office during a pandemic costs dearly.</p></div></section>
  <section class="panel"><div class="pb"><div class="grid3">${cards}</div></div></section>`:`<section class="panel"><div class="ph"><h2>Çalışma modeli${helpBtn('remote')}</h2><span class="sub">${WPOL[pol].n}</span></div>
    <div class="kpis"><div class="kpi"><span>Tercihine uyan</span><b class="${match>=0.6?'pos':match<0.35?'neg':''}">%${Math.round(match*100)}</b></div><div class="kpi"><span>Takım bağı</span><b class="${cult>=60?'pos':cult<40?'neg':''}">${Math.round(cult)}</b></div>
      <div class="kpi"><span>Ofis kapasitesi</span><b>${officeCap()} kişi</b></div><div class="kpi"><span>Ev ofis desteği</span><b>${money(wStipend())}/ay</b></div></div>
    <div class="pb col" style="gap:8px"><div class="small"><b>Çalışanların tercihi</b></div>
      <div style="display:flex;height:12px;border-radius:2px;overflow:hidden;gap:1px" role="img" aria-label="Çalışma tercihi dağılımı">${seg(cnt.office,'var(--pt-hw)')}${seg(cnt.hybrid,'var(--ch1)')}${seg(cnt.remote,'var(--pt-res)')}</div>
      <div class="row small" style="gap:14px;flex-wrap:wrap"><span><b style="color:var(--pt-hw)">■</b> Ofis ${cnt.office}</span><span><b style="color:var(--ch1)">■</b> Hibrit ${cnt.hybrid}</span><span><b style="color:var(--pt-res)">■</b> Uzaktan ${cnt.remote}</span></div>
      <p class="small muted">Tercihine uyan çalışanın morali her ay artar, tersini isteyenin düşer. Takım bağı ofiste güçlenir, uzaktan çalışmada zayıflar; üretkenliği ±%5 etkiler ve bağ zayıfsa rakiplerin teklifleri daha cazip gelir. Model değiştirmek 90 günde bir yapılabilir ve ani bir moral etkisi yaratır. Salgın dönemlerinde ofiste ısrar etmek pahalıya patlar.</p></div></section>
  <section class="panel"><div class="pb"><div class="grid3">${cards}</div></div></section>`);
}

