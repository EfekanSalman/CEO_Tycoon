/* ============================== PRODUCT DESIGN FOCUS ============================== */
/* Her ürün kategorisinin 4 niteliği var; tasarımda 8 odak puanı dağıtılır (her biri 0–4, varsayılan 2).
   Ortalamadan sapma kanallara yansır: puan (sc), basın (rv), birim maliyet (uc), geliştirme yükü (req), hata/arıza riski (risk), kesim çekiciliği (seg).
   Varsayılan dağılım (2-2-2-2) hiçbir şeyi değiştirmez; eski kayıtlar ve bot etkilenmez. */
const FA={
  perf:{n:(LANG_EN?"Performance":'Performans'),d:(LANG_EN?"Faster and more powerful; discerning buyers love it. Raises cost and development effort.":'Daha hızlı ve güçlü; seçici kitle sever. Maliyeti ve geliştirme yükünü artırır.'),seg:{eco:-0.2,main:0.3,pro:1},sc:0.03,uc:0.025,req:0.03},
  ux:{n:(LANG_EN?"Ease of use":'Kullanım kolaylığı'),d:(LANG_EN?"A product anyone can use; mainstream and budget buyers love it, and so does the press.":'Herkesin rahat kullanacağı bir ürün; ana akım ve fiyat odaklı kitle sever, basın beğenir.'),seg:{eco:0.5,main:0.8,pro:-0.2},rv:0.15,req:0.02},
  feat:{n:(LANG_EN?"Features":'Özellikler'),d:(LANG_EN?"More features; professionals love it. Takes longer to build and raises bug risk.":'Daha çok özellik; profesyoneller sever. Geliştirme uzar, hata riski artar.'),seg:{eco:-0.3,main:0.4,pro:0.7},sc:0.02,req:0.06,risk:0.08},
  sec:{n:(LANG_EN?"Privacy & security":'Gizlilik ve güvenlik'),d:(LANG_EN?"Data security first; discerning buyers love it, and bugs go down.":'Veri güvenliği öncelik; seçici kitle sever, hatalar azalır.'),seg:{eco:-0.4,main:0.2,pro:0.8},risk:-0.12,req:0.03},
  design:{n:(LANG_EN?"Design":'Tasarım'),d:(LANG_EN?"Eye-catching and sleek; mainstream buyers and the press love it. Raises unit cost.":'Göz alıcı ve şık; ana akım kitle sever, basın beğenir. Birim maliyet artar.'),seg:{eco:-0.3,main:0.8,pro:0.4},rv:0.15,uc:0.025},
  eff:{n:(LANG_EN?"Battery life":'Pil ömrü'),d:(LANG_EN?"Long battery life and efficiency; budget and mainstream buyers love it.":'Uzun pil ömrü ve verimlilik; fiyat odaklı ve ana akım kitle sever.'),seg:{eco:0.8,main:0.5,pro:0.1},uc:0.015},
  dur:{n:(LANG_EN?"Durability":'Dayanıklılık'),d:(LANG_EN?"Sturdy and long-lasting; lowers defect and recall risk.":'Sağlam ve uzun ömürlü; arıza ve geri çağırma riski düşer.'),seg:{eco:0.6,main:0.2,pro:0.2},risk:-0.15,uc:0.02},
  cost:{n:(LANG_EN?"Low cost":'Düşük maliyet'),d:(LANG_EN?"Cheap parts and a simple build; lowers unit cost, budget buyers love it, discerning buyers stay away.":'Ucuz parça ve sade yapı; birim maliyet düşer, fiyat odaklı kitle sever, seçici kitle uzak durur.'),seg:{eco:1,main:0.2,pro:-0.8},uc:-0.06,sc:-0.015},
  heat:{n:(LANG_EN?"Thermals & stability":'Isı ve kararlılık'),d:(LANG_EN?"Runs cool and stable; lowers defect risk.":'Serin çalışır, kararlıdır; arıza riski düşer.'),seg:{eco:0.2,main:0.3,pro:0.6},risk:-0.12,uc:0.015},
  rel:{n:(LANG_EN?"Reliability":'Güvenilirlik'),d:(LANG_EN?"Runs without outages or errors; professionals love it, and bugs go down.":'Kesintisiz ve hatasız çalışır; profesyoneller sever, hatalar azalır.'),seg:{eco:0.3,main:0.4,pro:0.8},risk:-0.15,req:0.04}};
const FA_SET={app:['perf','ux','feat','sec'],saas:['rel','ux','feat','sec'],os:['perf','ux','feat','sec'],ai:['perf','ux','feat','sec'],car:['rel','ux','feat','sec'],
  cpu:['perf','eff','cost','heat'],phone:['perf','design','eff','dur'],pc:['perf','design','eff','dur'],wear:['perf','design','eff','dur'],xr:['perf','design','eff','dur'],
  console:['perf','design','cost','dur'],iot:['rel','ux','cost','sec'],robo:['perf','rel','feat','dur'],qc:['perf','rel','cost','heat']};
const FA_LBL={app:{perf:(LANG_EN?"Speed":'Hız')},saas:{perf:(LANG_EN?"Speed":'Hız')},os:{perf:(LANG_EN?"Speed":'Hız')},ai:{perf:(LANG_EN?"Answer quality":'Yanıt kalitesi')},cpu:{eff:(LANG_EN?"Power efficiency":'Güç verimliliği')},pc:{eff:(LANG_EN?"Efficiency":'Verimlilik')},console:{perf:(LANG_EN?"Graphics power":'Grafik gücü')},car:{feat:(LANG_EN?"Driving features":'Sürüş özellikleri')}};
const FA_PTS=8,FA_MAX=4;
const faSet=cat=>FA_SET[cat]||['perf','ux','feat','sec'];
const faName=(cat,a)=>(FA_LBL[cat]&&FA_LBL[cat][a])||FA[a].n;
const faDef=cat=>Object.fromEntries(faSet(cat).map(a=>[a,2]));
const faOf=p=>p&&p.focus?p.focus:faDef(p.cat);
const faSum=f=>Object.values(f||{}).reduce((a,b)=>a+b,0);
function faFx(cat,f){const o={sc:1,rv:0,uc:1,req:1,risk:1,seg:{eco:1,main:1,pro:1}};if(!f)return o;
  for(const a of faSet(cat)){const A=FA[a],dv=(f[a]==null?2:f[a])-2;if(!dv)continue;o.sc+=(A.sc||0)*dv;o.rv+=(A.rv||0)*dv;o.uc+=(A.uc||0)*dv;o.req+=(A.req||0)*dv;o.risk+=(A.risk||0)*dv;for(const s in o.seg)o.seg[s]+=0.06*A.seg[s]*dv;}
  const unused=FA_PTS-faSum(f);if(unused>0)o.sc-=0.02*unused;
  o.sc=clamp(o.sc,0.8,1.2);o.uc=clamp(o.uc,0.75,1.3);o.req=clamp(o.req,0.85,1.35);o.risk=clamp(o.risk,0.5,1.6);for(const s in o.seg)o.seg[s]=clamp(o.seg[s],0.8,1.25);return o;}
const FAW=new WeakMap();
function faSeg(p,s){if(!p.focus)return 1;let w=FAW.get(p);if(!w||w.d!==G.day||w.f!==p.focus||w.g!==G){w={d:G.day,f:p.focus,g:G,seg:faFx(p.cat,p.focus).seg};FAW.set(p,w);}return w.seg[s];}
function rivFocus(strat,cat){const S=faSet(cat),f=Object.fromEntries(S.map(a=>[a,2]));const pref={fiyat:['cost','eff','dur','ux'],premium:['perf','design','feat','sec','rel'],takip:['ux','design','perf'],denge:[]}[strat]||[];
  const up=S.filter(a=>pref.includes(a)),dn=S.filter(a=>!pref.includes(a));let moves=strat==='denge'?(Math.random()<0.5?1:0):1+Math.floor(Math.random()*2);
  while(moves-->0&&up.length&&dn.length){const u=pick(up),d=pick(dn);if(f[u]<FA_MAX&&f[d]>0){f[u]++;f[d]--;}}
  if(strat==='denge'&&moves>=0){const u=pick(S),d=pick(S.filter(x=>x!==u));if(f[u]<FA_MAX&&f[d]>0){f[u]++;f[d]--;}}return f;}
const hashF=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return ((h>>>0)%1000)/1000;};
function rvOf(p){if(p.review!=null)return p.review;const v=p.score/S(p.cat),ref=CATS[p.cat].ref,fp=ref?ref*Math.pow(v,1.2)/Math.max(p.price,0.01):1;return clamp(Math.round((5.5+(v-1)*10+(fp-1)*3)*10)/10,1,10);}
function faSub(p){const R=rvOf(p);const f=faOf(p),S=faSet(p.cat);const raw=S.map(a=>(f[a]-2)*0.55+(hashF(p.id+'|'+a+'|'+Math.floor(p.ver||1))-0.5)*0.8);const m=raw.reduce((a,b)=>a+b,0)/raw.length,B=p.specB||{},bm=S.reduce((a,x)=>a+(B[x]||0),0)/S.length;
  return Object.fromEntries(S.map((a,i)=>[a,clamp(Math.round((R+raw[i]-m+(B[a]||0)-bm)*10)/10,1,10)]));}
function vlogAdd(p,notes){(p.vlog=p.vlog||[]).unshift({v:verStr(p),d:G.day,n:notes.filter(Boolean)});if(p.vlog.length>12)p.vlog.pop();}
function faDiffNotes(cat,a0,a1){const o=[];for(const a of faSet(cat)){const d=(a1[a]||0)-(a0[a]||0);if(d>0)o.push((LANG_EN?`${faName(cat,a)} improved`:`${faName(cat,a)} güçlendirildi`));else if(d<0)o.push((LANG_EN?`${faName(cat,a)} deprioritized`:`${faName(cat,a)} geri plana alındı`));}return o;}
// UI: odak düzenleyici. mode: 'd' (yeni ürün taslağı) ya da 'u' (güncelleme)
function faEditor(cat,f,mode,base){const S=faSet(cat),used=faSum(f),left=FA_PTS-used,fx0=faFx(cat,f);
  const moved=base?S.reduce((a,x)=>a+Math.max(0,(f[x]||0)-(base[x]||0)),0):0;
  const row=a=>{const v=f[a]||0,A=FA[a];return (LANG_EN?`<div class="fa-row"><div class="fa-n"><b>${esc(faName(cat,a))}</b><span class="small muted">${esc(A.d)}</span></div>
    <div class="fa-ctl"><button class="btn sm" data-act="${mode}focus" data-a="${a}" data-d="-1" ${v<=0?'disabled':''} aria-label="Decrease ${esc(faName(cat,a))}">−</button><span class="fa-dots" aria-label="${v} points">${'<i class="on"></i>'.repeat(v)}${'<i></i>'.repeat(FA_MAX-v)}</span><button class="btn sm" data-act="${mode}focus" data-a="${a}" data-d="1" ${v>=FA_MAX?'disabled':''} aria-label="Increase ${esc(faName(cat,a))}">+</button></div></div>`:`<div class="fa-row"><div class="fa-n"><b>${esc(faName(cat,a))}</b><span class="small muted">${esc(A.d)}</span></div>
    <div class="fa-ctl"><button class="btn sm" data-act="${mode}focus" data-a="${a}" data-d="-1" ${v<=0?'disabled':''} aria-label="${esc(faName(cat,a))} azalt">−</button><span class="fa-dots" aria-label="${v} puan">${'<i class="on"></i>'.repeat(v)}${'<i></i>'.repeat(FA_MAX-v)}</span><button class="btn sm" data-act="${mode}focus" data-a="${a}" data-d="1" ${v>=FA_MAX?'disabled':''} aria-label="${esc(faName(cat,a))} artır">+</button></div></div>`);};
  const pc=x=>`${x>=1?'+':'−'}${pctN(Math.abs(Math.round((x-1)*100)))}`;
  const chips=[[(LANG_EN?"Budget":'Fiyat odaklı'),fx0.seg.eco],[(LANG_EN?"Mainstream":'Ana akım'),fx0.seg.main],[(LANG_EN?"Discerning":'Seçici'),fx0.seg.pro]].map(([n,x])=>`<span class="chip ${x>1.005?'st-ok':x<0.995?'st-bad':'st-mute'}">${n} ${pc(x)}</span>`).join('');
  const eff=[fx0.sc!==1?(LANG_EN?`score ${pc(fx0.sc)}`:`puan ${pc(fx0.sc)}`):'',fx0.uc!==1?(LANG_EN?`unit cost ${pc(fx0.uc)}`:`birim maliyet ${pc(fx0.uc)}`):'',fx0.req!==1?(LANG_EN?`development effort ${pc(fx0.req)}`:`geliştirme yükü ${pc(fx0.req)}`):'',fx0.risk!==1?(LANG_EN?`${HW.includes(cat)?"defect":'hata'} risk ${pc(fx0.risk)}`:`${HW.includes(cat)?'arıza':'hata'} riski ${pc(fx0.risk)}`):'',fx0.rv?(LANG_EN?`press ${fx0.rv>0?'+':'−'}${fx(Math.abs(fx0.rv),1)}`:`basın ${fx0.rv>0?'+':'−'}${fx(Math.abs(fx0.rv),1)}`):''].filter(Boolean).join(' · ');
  return (LANG_EN?`<div class="fa"><div class="row between" style="gap:8px;flex-wrap:wrap"><b>Design focus</b><span class="small ${left>0?'warn':'muted'}">${left>0?`${left} points unspent (score drops)`:`All ${FA_PTS} points allocated`}${base?` · moved ${moved}`:''}</span></div>
    ${S.map(row).join('')}<div class="row" style="gap:6px;flex-wrap:wrap"><span class="small muted">Segment effect:</span>${chips}</div>${eff?`<div class="small muted">${eff}</div>`:''}</div>`:`<div class="fa"><div class="row between" style="gap:8px;flex-wrap:wrap"><b>Tasarım odağı</b><span class="small ${left>0?'warn':'muted'}">${left>0?`${left} puan harcanmadı (puan düşer)`:`${FA_PTS} puanın hepsi dağıtıldı`}${base?` · kaydırılan ${moved}`:''}</span></div>
    ${S.map(row).join('')}<div class="row" style="gap:6px;flex-wrap:wrap"><span class="small muted">Kesim etkisi:</span>${chips}</div>${eff?`<div class="small muted">${eff}</div>`:''}</div>`);}
function faStep(f,a,d,base,limit){const n=(f[a]||0)+d;if(n<0||n>FA_MAX)return f;const g={...f,[a]:n};
  if(d>0&&faSum(f)>=FA_PTS){const o=Object.keys(f).filter(x=>x!==a&&f[x]>0).sort((x,y)=>(f[y]-f[x])||((base?(base[x]||0)-f[x]:0)-(base?(base[y]||0)-f[y]:0)))[0];if(!o)return f;g[o]--;}
  if(base&&limit!=null){const mv=Object.keys(g).reduce((s,x)=>s+Math.max(0,g[x]-(base[x]||0)),0);if(mv>limit)return f;}return g;}
// Ürün detayı
function vPdet(p){if(!p)return (LANG_EN?`<p>Product not found.</p>`:`<p>Ürün bulunamadı.</p>`);const mine=p.owner===`P`,f=faOf(p),FS=faSet(p.cat),sub=faSub(p),fx0=faFx(p.cat,f);
  const bars=FS.map(a=>`<div class="pd-a"><span>${esc(faName(p.cat,a))}</span><span class="fa-dots small">${'<i class="on"></i>'.repeat(f[a]||0)}${'<i></i>'.repeat(FA_MAX-(f[a]||0))}</span><b class="num">${sub?fx(sub[a],1):'—'}</b></div>`).join('');
  const rivals=G.products.filter(q=>q.active&&q.cat===p.cat&&q!==p).sort((a,b)=>b.share-a.share).slice(0,4);
  const rivRows=rivals.map(q=>{const s=faSub(q);return `<tr><td><b>${esc(q.name)}</b><div class="small muted">${q.owner==='P'?(LANG_EN?"You":'Sen'):esc(ownerName(q.owner))}</div></td><td class="r num">${pct(q.share,0)}</td><td class="r num">${money(q.price)}</td>${FS.map(a=>`<td class="r num">${s?fx(s[a],1):'—'}</td>`).join('')}</tr>`;}).join('');
  const segs=[[(LANG_EN?"Budget":'Fiyat odaklı'),'eco'],[(LANG_EN?"Mainstream":'Ana akım'),'main'],[(LANG_EN?"Discerning":'Seçici'),'pro']].map(([n,s])=>{const x=fx0.seg[s];return `<span class="chip ${x>1.005?'st-ok':x<0.995?'st-bad':'st-mute'}">${n} ${x>=1?'+':'−'}${pctN(Math.abs(Math.round((x-1)*100)))}</span>`;}).join('');
  const vl=(p.vlog||[]).map(x=>`<li><span class="small muted num" style="min-width:110px">${esc(x.v)} · ${fmtDate(x.d)}</span><span>${x.n.map(esc).join(' · ')}</span></li>`).join('');
  return (LANG_EN?`<div class="eyebrow">${CATS[p.cat].n} · ${mine?"your product":esc(ownerName(p.owner))}</div><h2>${esc(p.name)} <small class="muted">${verStr(p)}</small></h2>
    <div class="kv"><span>Market share</span><b>${pct(p.share,1)}</b><span>Price</span><b>${money(p.price)}</b><span>Freshness</span><b>${pct(p.score/S(p.cat),0)}</b><span>Press</span><b>${fx(rvOf(p),1)}/10${p.review==null?" <span class=\"small muted\">(estimated)</span>":''}</b>${p.sat!=null&&mine?`<span>Satisfaction</span><b>${Math.round(p.sat)}</b>`:''}<span>On the market</span><b>since ${fmtDate(Math.max(0,p.launch||0))}</b></div>
    <div class="col" style="gap:6px"><b>Attributes and press sub-scores</b>${bars}<div class="row" style="gap:6px;flex-wrap:wrap"><span class="small muted">Segment effect:</span>${segs}</div></div>
    ${ftChips(p)}
    ${mine&&p.active?vCmpBlock(p):''}
    ${rivRows?`<div class="col" style="gap:6px"><b>Compared with rivals</b><div class="tw"><table class="rt"><thead><tr><th>Product</th><th class="r">Share</th><th class="r">Price</th>${FS.map(a=>`<th class="r">${esc(faName(p.cat,a))}</th>`).join('')}</tr></thead><tbody>${rivRows}</tbody></table></div></div>`:''}
    ${mine?`<div class="col" style="gap:6px"><b>Release notes</b>${vl?`<ul class="alerts">${vl}</ul>`:"<div class=\"small muted\">No release notes recorded for this product.</div>"}</div>`:''}
    <div class="row">${mine&&p.active?`<button class="btn primary" data-act="updopen" data-id="${p.id}">Update</button>`:''}${mine&&aiOn()&&p.review!=null?`<button class="btn" data-act="press" data-id="${p.id}">Press review</button>`:''}<button class="btn" data-act="close">Close</button></div>`:`<div class="eyebrow">${CATS[p.cat].n} · ${mine?'senin ürünün':esc(ownerName(p.owner))}</div><h2>${esc(p.name)} <small class="muted">${verStr(p)}</small></h2>
    <div class="kv"><span>Pazar payı</span><b>${pct(p.share,1)}</b><span>Fiyat</span><b>${money(p.price)}</b><span>Güncellik</span><b>${pct(p.score/S(p.cat),0)}</b><span>Basın</span><b>${fx(rvOf(p),1)}/10${p.review==null?' <span class="small muted">(tahmini)</span>':''}</b>${p.sat!=null&&mine?`<span>Memnuniyet</span><b>${Math.round(p.sat)}</b>`:''}<span>Piyasada</span><b>${fmtDate(Math.max(0,p.launch||0))} tarihinden beri</b></div>
    <div class="col" style="gap:6px"><b>Nitelikler ve basının alt puanları</b>${bars}<div class="row" style="gap:6px;flex-wrap:wrap"><span class="small muted">Kesim etkisi:</span>${segs}</div></div>
    ${ftChips(p)}
    ${mine&&p.active?vCmpBlock(p):''}
    ${rivRows?`<div class="col" style="gap:6px"><b>Rakiplerle karşılaştırma</b><div class="tw"><table class="rt"><thead><tr><th>Ürün</th><th class="r">Pay</th><th class="r">Fiyat</th>${FS.map(a=>`<th class="r">${esc(faName(p.cat,a))}</th>`).join('')}</tr></thead><tbody>${rivRows}</tbody></table></div></div>`:''}
    ${mine?`<div class="col" style="gap:6px"><b>Sürüm notları</b>${vl?`<ul class="alerts">${vl}</ul>`:'<div class="small muted">Bu ürün için kayıtlı sürüm notu yok.</div>'}</div>`:''}
    <div class="row">${mine&&p.active?`<button class="btn primary" data-act="updopen" data-id="${p.id}">Güncelle</button>`:''}${mine&&aiOn()&&p.review!=null?`<button class="btn" data-act="press" data-id="${p.id}">Basın yazısı</button>`:''}<button class="btn" data-act="close">Kapat</button></div>`);}

