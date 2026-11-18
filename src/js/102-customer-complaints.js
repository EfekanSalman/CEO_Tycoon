/* ============================== CUSTOMER COMPLAINTS ============================== */
/* Müşteri sesi: her ürün için mevcut durumdan türetilen somut şikâyetler (hata, destek bekleme, fiyat, eskime, zayıf tasarım odağı,
   eksik standart özellik, stok sıkıntısı). Her şikâyetin payı, en çok hangi kitleden geldiği ve çözüm yolu gösterilir.
   Şikâyetler memnuniyeti zaten var olan sistemler üzerinden etkiler; bu katman onları görünür kılar.
   Müşteriyi dinlemek: bir ürünün en büyük şikâyeti (payı en az %25) ay sonunda belirgin biçimde azalırsa kullanıcılar fark eder:
   memnuniyet +6, marka +0,5 (ürün başına 180 günde bir). */
const CMP_SEGN={eco:(LANG_EN?"price-focused":'fiyat odaklı'),main:(LANG_EN?"mainstream":'ana akım'),pro:(LANG_EN?"discerning":'seçici')};
const CMP_EFF=['phone','wear','xr','robo'];
function cmpFaTxt(cat,a){return {perf:(LANG_EN?"Slow, laggy":'Yavaş, takılıyor'),ux:(LANG_EN?"Hard to use":'Kullanımı karmaşık'),feat:(LANG_EN?"Not enough features":'Özellikleri yetersiz'),sec:(LANG_EN?"Privacy and security worries":'Gizlilik ve güvenlik kaygısı'),design:(LANG_EN?"Bland design":'Tasarımı sıradan'),
  eff:CMP_EFF.includes(cat)?(LANG_EN?"Battery dies fast":'Pil çabuk bitiyor'):(LANG_EN?"Uses too much power":'Çok enerji harcıyor'),dur:(LANG_EN?"Breaks easily":'Çabuk bozuluyor'),heat:(LANG_EN?"Runs hot, unstable":'Isınıyor, kararsız çalışıyor'),rel:(LANG_EN?"Frequent outages":'Sık kesinti yaşanıyor')}[a]||null;}
const cmpFair=p=>{const v=p.score/S(p.cat);if(p.cat==='app')return CATS.app.arpu||p.price;return Math.max((p.unitCost||0)*1.15,(CATS[p.cat].ref||p.price)*Math.pow(v,1.2));};
const CMPC=new WeakMap();
/* şikâyet listesi: {k,t,raw,w(pay),seg,fix,act} — büyükten küçüğe; günlük önbellek */
function cmpList(p){if(!p||p.owner!=='P')return [];const c=CMPC.get(p);if(c&&c.d===G.day&&c.g===G)return c.v;
  const L=[],add=(k,t,raw,seg,fix,act)=>{if(raw>=0.3)L.push({k,t,raw,seg,fix,act});};const v=p.score/S(p.cat),hw=isHW(p);
  if((p.bugs||0)>3)add('bugs',(LANG_EN?`${hw?"Freezes often":"Keeps crashing"} (${num(p.bugs)} open bugs)`:`${hw?'Sık donuyor':'Sürekli çöküyor'} (${num(p.bugs)} açık hata)`),Math.min(3,p.bugs/40*3),'main',(LANG_EN?"Assign a maintenance team or ship an update":'Bakım ekibi ata ya da güncelleme yap'),'upd');
  if((p.wait||0)>2.5)add('wait',(LANG_EN?`Support never answers (~${Math.round(p.wait)} days)`:`Destekten yanıt gelmiyor (~${Math.round(p.wait)} gün)`),Math.min(2,p.wait/10*2),'pro',(LANG_EN?"Hire support specialists":'Destek uzmanı işe al'),'sup');
  if(!(p.cat==='app'&&pmOf(p)!=='paid')){const r=p.price/Math.max(0.01,cmpFair(p));if(r>1.1)add('price',(LANG_EN?`Way too expensive (${Math.round((r-1)*100)}% pricier than similar products)`:`Fiyatı fazla yüksek (benzerlerinden %${Math.round((r-1)*100)} pahalı)`),Math.min(3,(r-1.1)*6),'eco',(LANG_EN?"Try lowering the price":'Fiyatı düşürmeyi dene'),'px');}
  if(v<0.9)add('old',(LANG_EN?`Outdated next to rivals (freshness ${Math.round(v*100)}%)`:`Rakiplerin yanında eski kaldı (güncellik %${Math.round(v*100)})`),Math.min(3,(0.9-v)*8),'pro',(LANG_EN?"Ship a major update":'Büyük güncelleme yap'),'upd');
  const f=faOf(p);for(const a of faSet(p.cat)){const x=f[a]==null?2:f[a],t=cmpFaTxt(p.cat,a);if(!t||x>=2)continue;const sg=Object.entries(FA[a].seg).sort((m,n)=>n[1]-m[1])[0][0];
    add('fa:'+a,t,x===0?1.5:0.8,sg,(LANG_EN?`Raise the ${faName(p.cat,a).toLocaleLowerCase(LOC)} focus in an update`:`Güncellemede ${faName(p.cat,a).toLocaleLowerCase(LOC)} odağını artır`),'upd');}
  if(Array.isArray(p.feats)){const E=ftEff(p.cat,p.feats);if(E.miss.length)add('feat',(LANG_EN?`No ${E.miss.map(k=>FT[k].n).slice(0,2).join(', ')} (now standard)`:`${E.miss.map(k=>FT[k].n).slice(0,2).join(', ')} yok (artık standart)`),Math.min(2,0.6*E.miss.length),'main',(LANG_EN?"Add the missing feature in an update":'Güncellemede eksik özelliği ekle'),'upd');}
  if(hw&&(p.capShort||(p.short&&p.short.length)))add('stock',(LANG_EN?"Out of stock":'Stokta bulunamıyor'),1.5,'main',(LANG_EN?"Increase production capacity or parts supply":'Üretim kapasitesini ya da parça tedarikini artır'),'mfg');
  const tot=L.reduce((a,x)=>a+x.raw,0);for(const x of L)x.w=x.raw/tot;L.sort((a,b)=>b.raw-a.raw);
  CMPC.set(p,{d:G.day,g:G,v:L});return L;}
function cmpMonthly(){if(sgOff('cmp'))return;for(const p of myActive()){const L=cmpList(p),top=L[0],prev=p.cmpT;
  if(prev){const now=L.find(x=>x.k===prev.k),nr=now?now.raw:0;
    if(nr<prev.raw*0.4&&G.day-(p.cmpR||-999)>=180){p.cmpR=G.day;if(p.sat!=null)p.sat=clamp(p.sat+6,0,95);G.brand=clamp(G.brand+0.5,0,100);
      news((LANG_EN?`${p.name}: users noticed the “${prev.t.replace(/ \(.*\)$/,'')}” complaint was fixed. Satisfaction +6, brand +0.5.`:`${p.name}: kullanıcılar “${prev.t.replace(/ \(.*\)$/,'')}” şikâyetinin çözüldüğünü fark etti. Memnuniyet +6, marka +0,5.`),'good',true);}}
  p.cmpT=top&&top.w>=0.25?{k:top.k,raw:Math.round(top.raw*100)/100,t:top.t}:null;}}
/* ---- görünüm ---- */
function cmpFixBtn(p,x){if(x.act==='upd')return (LANG_EN?`<button class="btn sm" data-act="updopen" data-id="${p.id}">Update</button>`:`<button class="btn sm" data-act="updopen" data-id="${p.id}">Güncelle</button>`);
  if(x.act==='px')return `<button class="btn sm" data-act="wiopen" data-k="px" data-id="${p.id}">Ne olur?</button>`;
  if(x.act==='sup')return (LANG_EN?`<button class="btn sm" data-act="tab" data-tab="team:ekip">Team</button>`:`<button class="btn sm" data-act="tab" data-tab="team:ekip">Ekip</button>`);
  if(x.act==='mfg')return (LANG_EN?`<button class="btn sm" data-act="tab" data-tab="mfg">Manufacturing</button>`:`<button class="btn sm" data-act="tab" data-tab="mfg">Üretim</button>`);return '';}
function vCmpBlock(p,n=4){const L=cmpList(p).slice(0,n);
  if(!L.length)return (LANG_EN?`<div class="col" style="gap:4px"><b>Customer voice</b><div class="small muted">No notable complaints; users are largely happy.</div></div>`:`<div class="col" style="gap:4px"><b>Müşteri sesi</b><div class="small muted">Kayda değer bir şikâyet yok; kullanıcılar büyük ölçüde memnun.</div></div>`);
  return (LANG_EN?`<div class="col" style="gap:6px"><b>Customer voice</b>${L.map(x=>`<div class="cmp-r"><span class="cmp-w num">${Math.round(x.w*100)}%</span><span class="cmp-t"><b>“${esc(x.t)}”</b><span class="small muted">mostly from ${CMP_SEGN[x.seg]} users · ${esc(x.fix)}</span></span>${cmpFixBtn(p,x)}</div>`).join('')}
    ${p.cmpT?`<div class="small muted">Clearly reduce the biggest complaint and users will notice: satisfaction +6, brand +0.5.</div>`:''}</div>`:`<div class="col" style="gap:6px"><b>Müşteri sesi</b>${L.map(x=>`<div class="cmp-r"><span class="cmp-w num">%${Math.round(x.w*100)}</span><span class="cmp-t"><b>“${esc(x.t)}”</b><span class="small muted">çoğu ${CMP_SEGN[x.seg]} kullanıcıdan · ${esc(x.fix)}</span></span>${cmpFixBtn(p,x)}</div>`).join('')}
    ${p.cmpT?`<div class="small muted">En büyük şikâyeti belirgin biçimde azaltırsan kullanıcılar fark eder: memnuniyet +6, marka +0,5.</div>`:''}</div>`);}
function vVoice(){const L=myActive().filter(p=>p.sat!=null).sort((a,b)=>(a.sat||0)-(b.sat||0)).slice(0,8);if(!L.length)return '';
  const rows=L.map(p=>{const C=cmpList(p).slice(0,2),ss=satState(p.sat);return `<div class="voice-r"><div><button class="linkb" data-act="pdet" data-id="${p.id}"><b>${esc(p.name)}</b></button><div class="small"><span class="chip ${ss[1]}">${ss[0]} · ${Math.round(p.sat)}</span></div></div>
    <div class="voice-c">${C.length?C.map(x=>(LANG_EN?`<span class="small"><b class="num">${Math.round(x.w*100)}%</b> “${esc(x.t)}”</span>`:`<span class="small"><b class="num">%${Math.round(x.w*100)}</b> “${esc(x.t)}”</span>`)).join(''):(LANG_EN?"<span class=\"small muted\">No notable complaints.</span>":'<span class="small muted">Kayda değer şikâyet yok.</span>')}</div>
    <div>${C[0]?cmpFixBtn(p,C[0]):''}</div></div>`;}).join('');
  return (LANG_EN?`<section class="panel voice"><div class="ph"><h2>Customer voice${helpBtn('voice')}</h2><span class="sub">lowest satisfaction first</span></div><div class="pb col" style="gap:8px">${rows}
    <div class="small muted">Complaints come from bugs, support waits, price, aging, weak design focus, missing standard features and stock shortages. Clearly reduce a product's biggest complaint and users will notice.</div></div></section>`:`<section class="panel voice"><div class="ph"><h2>Müşteri sesi${helpBtn('voice')}</h2><span class="sub">memnuniyeti en düşük ürünler önce</span></div><div class="pb col" style="gap:8px">${rows}
    <div class="small muted">Şikâyetler hatalardan, destek beklemesinden, fiyattan, eskimeden, zayıf tasarım odağından, eksik standart özelliklerden ve stok sıkıntısından gelir. Bir ürünün en büyük şikâyetini belirgin biçimde azaltırsan kullanıcılar fark eder.</div></div></section>`);}
