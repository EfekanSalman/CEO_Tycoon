/* ============================== STORE ASSORTMENT & PRICES ============================== */
/* Her mağaza yalnızca rafındaki donanım ürünlerini satar ve onların çekiciliğini tam artırır; rafta olmayanlar marka hâlesiyle %30 alır.
   Raf: stant 4, mağaza 8, amiral 16 ürün; her satın alma birimi +2. Varsayılan otomatik: yeni çıkanlar, sonra bölgede en çok satanlar.
   Ürün başına mağaza fiyatı: liste, −%10, +%10, +%20. İndirim o ürünün mağazadaki ağırlığını artırır (esneklik 2,2)
   ama perakende payını azaltır; zam tersini yapar. Mağazanın genel fiyat politikası (SPP) üstüne uygulanır. */
const SHOP_SLOTS={kiosk:4,store:8,flag:16},SHOP_PXD=[-0.1,0,0.1,0.2],SHOP_EL=2.2,SHOP_HALO=0.3;
let SHV=0;
const shopSlots=s=>(SHOP_SLOTS[s.t]||3)+2*sCnt(s,'buy');
/* otomatik raf sırası: son 90 günde çıkan ürünler önce (lansmanı desteklensin), sonra bölgedeki satış cirosu */
const shopPri=(p,r)=>G.day-(p.launch||0)<90?1e15+(p.launch||0):((p.ru&&p.ru[r])||0)*p.price;
const shopHWList=r=>myActive().filter(p=>isHW(p)).sort((a,b)=>shopPri(b,r)-shopPri(a,r));
/* rafa giren ürünler: elle seçim (s.ass) ya da otomatik */
function shopAss(s){const L=shopHWList(s.r),n=shopSlots(s);if(!Array.isArray(s.ass))return L.slice(0,n).map(p=>p.id);
  const ok=new Set(L.map(p=>p.id));return s.ass.filter(id=>ok.has(id)).slice(0,n);}
const shopPxD=(s,pid)=>(s.px&&s.px[pid])||0;
const shopPxW=d=>Math.pow(1+d,-SHOP_EL);
/* bölge × ürün mağaza ağırlıkları; günlük ve düzenleme sayacıyla önbellekli.
   a: çekicilik ağırlığı (raftaki ürün tam, rafta olmayan ürün marka hâlesiyle %30); r: yalnızca raf (mağaza satışı bu ağırlıkla bölünür) */
const SPW={k:'',m:{}};
function shopWM(r){const S=G.shops;const k=G.day+'|'+S.list.length+'|'+SHV;if(SPW.k!==k||SPW.g!==G){SPW.k=k;SPW.g=G;SPW.m={};}
  let M=SPW.m[r];if(!M){M=SPW.m[r]={a:{},r:{}};const all=shopHWList(r).map(p=>p.id);
    for(const s of shopLive(r)){const w=shopEffW(s),on=new Set(shopAss(s));for(const id of all){if(on.has(id)){const x=w*shopPxW(shopPxD(s,id));M.a[id]=(M.a[id]||0)+x;M.r[id]=(M.r[id]||0)+x;}else M.a[id]=(M.a[id]||0)+w*SHOP_HALO;}}}
  return M;}
const shopWP=(r,pid)=>G.shops&&G.shops.list.length?shopWM(r).a[pid]||0:0;
const shopWS=(r,pid)=>G.shops&&G.shops.list.length?shopWM(r).r[pid]||0:0;
function sasAct(a,ds){const S=G.shops;if(!S)return;const s=S.list.find(x=>x.id===+ds.id);if(!s)return;const pid=+ds.p;
  if(a==='shopauto'){s.ass=Array.isArray(s.ass)?null:shopAss(s);}
  else if(a==='shopass'){const cur=shopAss(s);let L=Array.isArray(s.ass)?s.ass.slice():cur.slice();
    if(L.includes(pid))L=L.filter(x=>x!==pid);else{if(L.length>=shopSlots(s)){showToast((LANG_EN?`Shelf full: this store can hold at most ${shopSlots(s)} products. A purchasing unit enlarges the shelf.`:`Raf dolu: bu mağazada en fazla ${shopSlots(s)} ürün olabilir. Satın alma birimi rafı büyütür.`),'bad');return;}L.push(pid);}s.ass=L;}
  else if(a==='shoppx'){const d=+ds.k;if(!SHOP_PXD.includes(d))return;s.px=s.px||{};if(d)s.px[pid]=d;else delete s.px[pid];}
  SHV++;}
function vStoreAss(s){const L=shopHWList(s.r),ass=new Set(shopAss(s)),n=shopSlots(s),auto=!Array.isArray(s.ass),ps=s.ps||{};
  if(!L.length)return '';
  const rows=L.map(p=>{const on=ass.has(p.id),d=shopPxD(s,p.id);return `<div class="sas-r${on?'':' off'}"><label class="row sas-n"><input type="checkbox" data-act="shopass" data-id="${s.id}" data-p="${p.id}" ${on?'checked':''} ${auto?'disabled':''} aria-label="${esc(p.name)} ${LANG_EN?'on shelf':'rafta'}"> <b>${esc(p.name)}</b></label>
    <span class="small num">${money(p.price*(1+d))}</span><span class="small num muted">${on&&ps[p.id]?money(ps[p.id])+(LANG_EN?'/mo':'/ay'):'—'}</span>
    <span class="row sas-p">${SHOP_PXD.map(x=>`<button class="btn sm ${d===x?'primary':''}" data-act="shoppx" data-id="${s.id}" data-p="${p.id}" data-k="${x}" aria-pressed="${d===x}" ${on?'':'disabled'}>${x?(x>0?'+':'−')+(LANG_EN?Math.abs(x*100)+'%':'%'+Math.abs(x*100)):(LANG_EN?"List":'Liste')}</button>`).join('')}</span></div>`;}).join('');
  return (LANG_EN?`<div class="col sas" style="gap:6px"><div class="row between" style="gap:8px;flex-wrap:wrap"><b class="small">Shelf · ${ass.size}/${n} products</b><button class="btn sm ${auto?'primary':''}" data-act="shopauto" data-id="${s.id}" aria-pressed="${auto}">${auto?"Automatic: new and best sellers":"Chosen by hand · back to automatic"}</button></div>
    <div class="small muted sas-h"><span>Product</span><span>Store price</span><span>Sales last month</span></div><div class="col sas-l">${rows}</div>
    <div class="small muted">A store sells only the products on its shelf; it fully boosts the appeal of products on its shelf and boosts your other hardware products by 30% through the brand halo. A discount sells more of that product in the store but lowers the retail margin; a markup does the opposite. Each purchasing unit adds 2 products to the shelf.</div></div>`:`<div class="col sas" style="gap:6px"><div class="row between" style="gap:8px;flex-wrap:wrap"><b class="small">Raf · ${ass.size}/${n} ürün</b><button class="btn sm ${auto?'primary':''}" data-act="shopauto" data-id="${s.id}" aria-pressed="${auto}">${auto?'Otomatik: yeniler ve en çok satanlar':'Elle seçiliyor · otomatiğe dön'}</button></div>
    <div class="small muted sas-h"><span>Ürün</span><span>Mağaza fiyatı</span><span>Geçen ay satış</span></div><div class="col sas-l">${rows}</div>
    <div class="small muted">Mağaza yalnızca rafındaki ürünleri satar; rafındaki ürünlerin çekiciliğini tam, diğer donanım ürünlerinin çekiciliğini marka hâlesiyle %30 artırır. İndirim o ürünü mağazada daha çok sattırır ama perakende payını azaltır; zam tersini yapar. Her satın alma birimi rafa 2 ürün ekler.</div></div>`);}
