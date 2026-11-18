/* ============================== CITIES ============================== */
/* Her bölge şehirlere ayrılır: nüfus payı (pop), gelir profili (mix: kesim ağırlıkları), zevk (t: ürün nitelikleri, f: sevilen özellikler).
   Bölgenin toplam talebi değişmez; oyuncu ürününün bölgedeki çekiciliği, şehirlerdeki bilinirlik ve zevk uyumunun nüfusla ağırlıklı ortalamasıyla çarpılır.
   Varsayılan durumda (bilinirlik 0,5, nötr odak) çarpan 1'dir. */
const CITY=[
  {id:'ist',n:(LANG_EN?"Istanbul":'İstanbul'),r:'tr',pop:0.42,mix:{pro:1.3},t:{design:1,perf:0.5},f:['social','video']},
  {id:'ank',n:(LANG_EN?"Ankara":'Ankara'),r:'tr',pop:0.2,mix:{main:1.1,pro:0.9},t:{sec:1,rel:0.5},f:['e2e']},
  {id:'izm',n:(LANG_EN?"Izmir":'İzmir'),r:'tr',pop:0.16,mix:{eco:0.9,main:1.1},t:{ux:1,eff:0.5},f:['dark']},
  {id:'bur',n:(LANG_EN?"Bursa":'Bursa'),r:'tr',pop:0.12,mix:{eco:1.3,pro:0.7},t:{cost:1,dur:0.5},f:['water']},
  {id:'ant',n:(LANG_EN?"Antalya":'Antalya'),r:'tr',pop:0.1,mix:{eco:1.2,pro:0.8},t:{dur:1,eff:0.5},f:['g5']},
  {id:'ber',n:(LANG_EN?"Berlin":'Berlin'),r:'eu',pop:0.2,mix:{pro:1.1},t:{sec:1.2,rel:0.5},f:['e2e','sync']},
  {id:'par',n:(LANG_EN?"Paris":'Paris'),r:'eu',pop:0.22,mix:{eco:0.9,pro:1.3},t:{design:1.2,ux:0.5},f:['face']},
  {id:'lon',n:(LANG_EN?"London":'Londra'),r:'eu',pop:0.24,mix:{eco:0.9,pro:1.3},t:{feat:1,perf:0.5},f:['pay','api']},
  {id:'mil',n:(LANG_EN?"Milan":'Milano'),r:'eu',pop:0.12,mix:{pro:1.2},t:{design:1,dur:0.3},f:['wless']},
  {id:'ams',n:(LANG_EN?"Amsterdam":'Amsterdam'),r:'eu',pop:0.1,mix:{main:1.1},t:{eff:1,sec:0.5},f:['sync']},
  {id:'mad',n:(LANG_EN?"Madrid":'Madrid'),r:'eu',pop:0.12,mix:{eco:1.2,pro:0.8},t:{cost:0.8,ux:0.5},f:['social']},
  {id:'nyc',n:(LANG_EN?"New York":'New York'),r:'na',pop:0.28,mix:{eco:0.9,pro:1.3},t:{feat:1,design:0.5},f:['pay']},
  {id:'sfo',n:(LANG_EN?"San Francisco":'San Francisco'),r:'na',pop:0.16,mix:{eco:0.7,main:0.9,pro:1.6},t:{perf:1.2,feat:0.6},f:['assist','chat','api']},
  {id:'chi',n:(LANG_EN?"Chicago":'Chicago'),r:'na',pop:0.18,mix:{eco:1.1,pro:0.9},t:{rel:1,dur:0.5},f:['ota']},
  {id:'lax',n:(LANG_EN?"Los Angeles":'Los Angeles'),r:'na',pop:0.26,mix:{pro:1.1},t:{design:1,ux:0.5},f:['video','social']},
  {id:'tor',n:(LANG_EN?"Toronto":'Toronto'),r:'na',pop:0.12,mix:{main:1.1,pro:0.9},t:{sec:0.8,ux:0.5},f:['e2e']},
  {id:'tok',n:(LANG_EN?"Tokyo":'Tokyo'),r:'asia',pop:0.26,mix:{eco:0.8,pro:1.3},t:{design:1,dur:0.6},f:['water','rgb']},
  {id:'seo',n:(LANG_EN?"Seoul":'Seul'),r:'asia',pop:0.2,mix:{eco:0.9,pro:1.2},t:{perf:1,design:0.5},f:['g5','face']},
  {id:'sin',n:(LANG_EN?"Singapore":'Singapur'),r:'asia',pop:0.1,mix:{eco:0.7,pro:1.4},t:{rel:1,sec:0.5},f:['pay']},
  {id:'sha',n:(LANG_EN?"Shanghai":'Şanghay'),r:'asia',pop:0.3,mix:{eco:1.1},t:{feat:1,cost:0.5},f:['pay','assist']},
  {id:'bkk',n:(LANG_EN?"Bangkok":'Bangkok'),r:'asia',pop:0.14,mix:{eco:1.4,pro:0.6},t:{cost:1.2,eff:0.5},f:['social']},
  {id:'sao',n:(LANG_EN?"São Paulo":'São Paulo'),r:'latam',pop:0.38,mix:{eco:1.1,pro:0.9},t:{cost:1,feat:0.5},f:['social']},
  {id:'mex',n:(LANG_EN?"Mexico City":'Mexico City'),r:'latam',pop:0.32,mix:{eco:1.2,pro:0.8},t:{cost:1,dur:0.5},f:['video']},
  {id:'bue',n:(LANG_EN?"Buenos Aires":'Buenos Aires'),r:'latam',pop:0.16,mix:{eco:1.1,pro:0.9},t:{design:0.6,ux:0.6},f:['offline']},
  {id:'bog',n:(LANG_EN?"Bogota":'Bogota'),r:'latam',pop:0.14,mix:{eco:1.3,pro:0.7},t:{cost:1,eff:0.5},f:['offline']}];
const CITYD=Object.fromEntries(CITY.map(c=>[c.id,c]));
const cityList=r=>CITY.filter(c=>c.r===r);
const newCt=()=>({aw:{},camp:{},v:0,n:0});
const ctOf=()=>G.ct||(G.ct=newCt());
const SHOP_AW={kiosk:0.03,store:0.08,flag:0.2};
const storeAw=c=>Math.min(0.4,G.shops?G.shops.list.filter(s=>shopCityId(s)===c.id&&G.day>=s.ready).reduce((a,s)=>a+(SHOP_AW[s.t]||0)+0.05*sCnt(s,'ad'),0):0);
const cityAw=c=>clamp(0.5+(ctOf().aw[c.id]||0)+storeAw(c),0,1);
const cityMix=(c,s)=>(c.mix&&c.mix[s])||1;
function cityTaste(c,p){let s=1;const f=p.focus;if(f)for(const a in c.t)if(f[a]!=null)s+=0.035*(f[a]-2)*c.t[a];
  if(p.feats)for(const k of c.f)if(p.feats.includes(k))s+=0.03;return clamp(s,0.85,1.2);}
const cityMult=(c,p)=>(0.7+0.6*cityAw(c))*cityTaste(c,p);
const CTM=new Map();
const CTW=new WeakMap();
/* ürün başına bölge çarpanları: imza (şehir sürümü, 10 günlük dilim, ürün sürümü, özellikler, odak) değişmedikçe günler arasında korunur */
function cityM(p,r,s){const T=ctOf();let w=CTW.get(p);if(!w||w.d!==G.day||w.v!==T.v||w.g!==G){const sg=T.v+'|'+Math.floor(G.day/10)+'|'+(p.ver||1)+'|'+(p.feats?p.feats.join(''):'')+'|'+(p.focus?Object.values(p.focus).join(''):'');
    if(!w||w.g!==G||w.sg!==sg)w={sg,g:G,r:{}};w.d=G.day;w.v=T.v;CTW.set(p,w);}let q=w.r[r];if(!q)q=w.r[r]=cityM0(p,r);return q[s]||1;}
function cityM0(p,r){const k=(p.id||'x')+'|'+r+'|'+ctOf().v+'|'+Math.floor(G.day/10)+'|'+(p.ver||1)+'|'+(p.feats?p.feats.join(''):'')+'|'+(p.focus?Object.values(p.focus).join(''):'');let v=CTM.get(k);
  if(!v){if(CTM.size>3000)CTM.clear();v={};const L=cityList(r);for(const x of SEGS){let num=0,den=0;for(const c of L){const w=c.pop*cityMix(c,x);num+=w*cityMult(c,p);den+=w;}v[x]=den?num/den:1;}CTM.set(k,v);}
  return v;}
const ctCampCost=c=>Math.round(45000*REGS[c.r].px*(0.5+c.pop*2.5)*infl()/1000)*1000;
const ctCampOn=c=>(ctOf().camp[c.id]||0)>G.day;
function ctCamp(id){const c=CITYD[id];if(!c||!G.regions[c.r].in||ctCampOn(c))return;const cost=ctCampCost(c);if(G.cash<cost){showToast((LANG_EN?"Not enough cash for the campaign.":'Kampanya için yeterli nakit yok.'),'bad');return;}
  spend(cost,'other');const T=ctOf();T.aw[c.id]=Math.min(0.5,(T.aw[c.id]||0)+0.25);T.camp[c.id]=G.day+60;T.v++;T.n++;news((LANG_EN?`Local campaign launched in ${c.n}: awareness ${Math.round(cityAw(c)*100)}%.`:`${c.n} için yerel kampanya başladı: bilinirlik %${Math.round(cityAw(c)*100)}.`),'mkt');}
function ctMonthly(){const T=ctOf();for(const k in T.aw){T.aw[k]*=0.88;if(T.aw[k]<0.005)delete T.aw[k];}T.v++;}
// şehir başına tahmini aylık gelir: geçen ayın bölge gelirini nüfus × çarpanla paylaştır
function cityRev(r){const L=cityList(r),ps=myActive(),R=(G.rl&&G.rl[r])||0,w=L.map(c=>c.pop*(ps.length?ps.reduce((a,p)=>a+cityMult(c,p),0)/ps.length:1)),tw=w.reduce((a,b)=>a+b,0)||1;return L.map((c,i)=>R*w[i]/tw);}
// UI
const mixLbl=c=>{const e=cityMix(c,'eco'),p=cityMix(c,'pro');return p>=1.25?[(LANG_EN?"Affluent":'Varlıklı'),'st-ok']:e>=1.2?[(LANG_EN?"Budget":'Fiyat odaklı'),'st-warn']:[(LANG_EN?"Balanced":'Dengeli'),'st-mute'];};
const tasteLbl=c=>Object.entries(c.t).sort((a,b)=>b[1]-a[1]).map(([a])=>FA[a].n);
function vCities(){const rs=REG_ORDER.filter(r=>G.regions[r].in);let r=UI.ctR&&rs.includes(UI.ctR)?UI.ctR:rs[0];const L=cityList(r),rev=cityRev(r),sel=CITYD[UI.ctC]&&CITYD[UI.ctC].r===r?CITYD[UI.ctC]:L[0];
  const chips=REG_ORDER.map(x=>`<button class="btn sm ${x===r?'primary':''}" data-act="ctreg" data-k="${x}" ${G.regions[x].in?'':'disabled'} aria-pressed="${x===r}">${REGS[x].n}</button>`).join('');
  const rows=L.map((c,i)=>{const [ml,mc]=mixLbl(c),aw=cityAw(c),st=G.shops?G.shops.list.filter(s=>s.city===c.n).length:0,on=ctCampOn(c);
    return `<tr class="${c===sel?'sel':''}"><td><button class="linkb" data-act="ctcity" data-k="${c.id}"><b>${esc(c.n)}</b></button><div class="small muted">${tasteLbl(c).map(esc).join(', ')}</div></td><td class="r num">${pctN(Math.round(c.pop*100))}</td><td><span class="chip ${mc}">${ml}</span></td>
      <td><div class="skill"><div class="bar"><i style="width:${aw*100}%"></i></div><span class="num small">${Math.round(aw*100)}</span></div></td><td class="r num">${st||'—'}</td><td class="r num">${money(rev[i])}</td>
      <td class="r"><button class="btn sm" data-act="ctcamp" data-k="${c.id}" ${on||G.cash<ctCampCost(c)?'disabled':''}>${on?(LANG_EN?`Campaign · ${ctOf().camp[c.id]-G.day} d`:`Kampanya · ${ctOf().camp[c.id]-G.day} g`):(LANG_EN?`Campaign ${money(ctCampCost(c))}`:`Kampanya ${money(ctCampCost(c))}`)}</button></td></tr>`;}).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Cities${helpBtn('city')}</h2><span class="sub">${REGS[r].n} · ${L.length} cities</span></div><div class="pb col" style="gap:10px">
    <p class="small muted" style="margin:0">Every city has its own population, income profile and tastes. How much your product sells in a city depends on awareness there (local campaigns, stores) and taste fit (design focus, features). The region's total demand stays the same; whoever invests in the right cities takes the share.</p>
    <div class="row" style="gap:6px;flex-wrap:wrap">${chips}</div>
    <div class="tw"><table class="rt ct"><thead><tr><th>City · what it loves</th><th class="r">Population</th><th>Income</th><th>Awareness</th><th class="r">Stores</th><th class="r">Est. revenue/mo</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
  </div></section>${sel?vCityDetail(sel):''}${vRealEstate()}`:`<section class="panel"><div class="ph"><h2>Şehirler${helpBtn('city')}</h2><span class="sub">${REGS[r].n} · ${L.length} şehir</span></div><div class="pb col" style="gap:10px">
    <p class="small muted" style="margin:0">Her şehrin nüfusu, gelir profili ve zevki farklıdır. Ürünün bir şehirde ne kadar sattığı oradaki bilinirliğe (yerel kampanya, mağaza) ve zevk uyumuna (tasarım odağı, özellikler) bağlıdır. Bölgenin toplam talebi değişmez; doğru şehirlere yatırım yapan payı alır.</p>
    <div class="row" style="gap:6px;flex-wrap:wrap">${chips}</div>
    <div class="tw"><table class="rt ct"><thead><tr><th>Şehir · sevdiği nitelikler</th><th class="r">Nüfus</th><th>Gelir</th><th>Bilinirlik</th><th class="r">Mağaza</th><th class="r">Tahmini gelir/ay</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
  </div></section>${sel?vCityDetail(sel):''}${vRealEstate()}`);}
function vCityDetail(c){const ps=myActive().filter(p=>p.ru&&p.ru[c.r]>0),r=c.r;
  const fit=ps.map(p=>{const t=cityTaste(c,p),m=cityMult(c,p),likes=c.f.filter(k=>FT[k]&&FT[k].cats.includes(p.cat));
    return `<tr><td><button class="linkb" data-act="pdet" data-id="${p.id}"><b>${esc(p.name)}</b></button><div class="small muted">${CATS[p.cat].n}</div></td><td class="r num ${t>1.01?'pos':t<0.99?'neg':''}">${t>=1?'+':'−'}${pctN(Math.abs(Math.round((t-1)*100)))}</td><td class="r num">×${fx(m,2)}</td>
      <td>${likes.map(k=>`<span class="chip ${(p.feats||[]).includes(k)?'st-ok':'st-mute'}">${esc(FT[k].n)}</span>`).join(' ')||'<span class="small muted">—</span>'}</td></tr>`;}).join('');
  const cats=[...new Set(ps.map(p=>p.cat))].slice(0,3);
  const cmpH=cats.map(cat=>{const L=G.products.filter(p=>p.active&&p.cat===cat&&p.ru&&p.ru[r]>0).map(p=>({p,u:p.ru[r]*(p.owner==='P'?cityMult(c,p)/Math.max(0.01,cityM(p,r,'main')):1)}));const tot=L.reduce((a,x)=>a+x.u,0)||1;
    return `<div class="col" style="gap:4px"><b class="small">${CATS[cat].n}</b>${L.sort((a,b)=>b.u-a.u).slice(0,4).map(x=>`<div class="ct-sh"><span>${esc(x.p.name)} <span class="small muted">${x.p.owner==='P'?'senin':esc((comp(x.p.owner)||{}).name||'')}</span></span><div class="bar"><i style="width:${x.u/tot*100}%;background:${x.p.owner==='P'?'var(--accent)':'var(--muted)'}"></i></div><span class="num small">${pctN(Math.round(x.u/tot*100))}</span></div>`).join('')}</div>`;}).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>${esc(c.n)}</h2><span class="sub">${REGS[c.r].n} · population share ${pctN(Math.round(c.pop*100))}</span></div><div class="pb col" style="gap:10px">
    <div class="small">Loves these attributes: ${tasteLbl(c).map(n=>`<span class="chip st-ok">${esc(n)}</span>`).join(' ')} · Loves these features: ${c.f.map(k=>`<span class="chip st-mute">${esc(FT[k].n)}</span>`).join(' ')}</div>
    <div class="small muted">Awareness ${Math.round(cityAw(c)*100)}/100${storeAw(c)?` (+${Math.round(storeAw(c)*100)} from stores)`:''}${ctCampOn(c)?` · campaign runs ${ctOf().camp[c.id]-G.day} more days`:''}. Local campaigns and stores lift awareness above 50; a campaign's effect fades a little each month.</div>
    ${vCityMap(c)}
    ${ps.length?`<div class="tw"><table class="rt"><thead><tr><th>Your product</th><th class="r">Taste fit</th><th class="r">City multiplier</th><th>Features loved here</th></tr></thead><tbody>${fit}</tbody></table></div>`:"<div class=\"small muted\">You have no products selling in this region.</div>"}
    ${cmpH?`<div class="col" style="gap:8px"><b>Local competition <span class="small muted">(estimated share)</span></b>${cmpH}</div>`:''}
  </div></section>`:`<section class="panel"><div class="ph"><h2>${esc(c.n)}</h2><span class="sub">${REGS[c.r].n} · nüfus payı ${pctN(Math.round(c.pop*100))}</span></div><div class="pb col" style="gap:10px">
    <div class="small">Sevdiği nitelikler: ${tasteLbl(c).map(n=>`<span class="chip st-ok">${esc(n)}</span>`).join(' ')} · Sevdiği özellikler: ${c.f.map(k=>`<span class="chip st-mute">${esc(FT[k].n)}</span>`).join(' ')}</div>
    <div class="small muted">Bilinirlik ${Math.round(cityAw(c)*100)}/100${storeAw(c)?` (mağazalardan +${Math.round(storeAw(c)*100)})`:''}${ctCampOn(c)?` · kampanya ${ctOf().camp[c.id]-G.day} gün daha sürüyor`:''}. Bilinirlik 50'nin üstüne yerel kampanya ve mağazalarla çıkar; kampanya etkisi her ay biraz söner.</div>
    ${vCityMap(c)}
    ${ps.length?`<div class="tw"><table class="rt"><thead><tr><th>Ürünün</th><th class="r">Zevk uyumu</th><th class="r">Şehir çarpanı</th><th>Burada sevilen özellikler</th></tr></thead><tbody>${fit}</tbody></table></div>`:'<div class="small muted">Bu bölgede satan ürünün yok.</div>'}
    ${cmpH?`<div class="col" style="gap:8px"><b>Yerel rekabet <span class="small muted">(tahmini pay)</span></b>${cmpH}</div>`:''}
  </div></section>`);}
