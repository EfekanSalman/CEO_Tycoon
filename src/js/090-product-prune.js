/* ============================== PRODUCT PRUNE ============================== */
/* Kayıt boyutu için eski rakip ürünleri temizlenir. Silinebilecek ürün: rakibin, satışta değil, en az 2 yıl önce emekliye ayrılmış
   (emeklilik günü bilinmeyen eski kayıtlarda 6 yıldan önce çıkmış) ve kimliği kayıtta hiçbir yerde geçmeyen ürün.
   Kimlikler G.nextId sayacından gelir ve bütün varlıklar için tektir; bu yüzden kayıtta (ürün listesi dışı + kalan ürünler) aynı sayı
   kimlik taşıyabilen bir alanda (pid, os, cpu, id…), kimlik biçimli bir yazıda ya da nesne anahtarında geçiyorsa ürün tutulur.
   Tesadüfi sayı eşleşmeleri yalnızca fazladan ürün tutar. */
const PRUNE_AGE=730,PRUNE_OLD=6*365;
/* ürün kimliği taşıyabilen alanlar (kodda prod(...) ile okunanlar) ve kimlik biçimli yazılar ('m123', 'own:123') ile sayısal nesne anahtarları */
const PRUNE_KEY=/^(id|ids|pid|pids|cpu|os|own|mine|rp|proj)$|(Id|Ids|Pid|pid)$/,PRUNE_STR=/^(?:[a-z]+:)?m?(\d+)$/;
/* ürün kimliği taşımayan, kendi sayaçlarıyla kimlik ya da kategori adıyla sayaç tutan yapılar: rakip mağazaları, görevler, patent/sürüm/zayıflık sayaçları, üretim süreci */
const PRUNE_SKIP=new Set(['rvs','quest','pats','gen','weak','node']);
/* tarama hızı: yalnızca aday kimlikler kaydedilir (PRC), kimlik biçimli olamayacak yazılar (son karakteri rakam değil) düzenli ifadeye
   girmeden atlanır, anahtar sınaması anahtar adı başına bir kez yapılır. Sonuç eski taramayla aynıdır. */
let PRC=null;const PRK=new Map();
const prDig=s=>{const c=s.charCodeAt(s.length-1);return c>=48&&c<=57;};
const prKey=k=>{let v=PRK.get(k);if(v===undefined){v=PRUNE_KEY.test(k);PRK.set(k,v);}return v;};
function prAdd(refs,n){if(!PRC||PRC.has(n))refs.add(n);}
function pruneRefs(x,refs,seen,top,rk){
  if(x==null)return;const t=typeof x;
  if(t==='number'){if(rk&&Number.isInteger(x))prAdd(refs,x);return;}
  if(t==='string'){if(!x.length||!prDig(x))return;const m=PRUNE_STR.exec(x);if(m)prAdd(refs,+m[1]);return;}
  if(t!=='object'||seen.has(x)||x.nodeType)return;seen.add(x);
  if(Array.isArray(x)){for(let i=0;i<x.length;i++)pruneRefs(x[i],refs,seen,false,rk);return;}
  for(const k in x){if(top&&k==='id'||PRUNE_SKIP.has(k))continue;if(prDig(k)){const m=PRUNE_STR.exec(k);if(m)prAdd(refs,+m[1]);}pruneRefs(x[k],refs,seen,false,prKey(k));}
}
/* Yıllık temizlik yılbaşı adımında değil, tarayıcı boşta kalınca yapılır (yılbaşı gününün takılmasını önler). Boş an gelmezse
   (arka plan sekmesi, bot koşuları) 20 gün sonra oyun adımında yapılır; arkadaş meydan okumasında belirlenimcilik için hemen adımda. */
function pruneSoon(){if(!G)return;if(chalOn()){pruneProducts();return;}G.pruneDue=G.day;const g=G;
  try{if(typeof requestIdleCallback==='function')requestIdleCallback(()=>{if(G!==g||G.pruneDue==null)return;G.pruneDue=null;try{pruneProducts();}catch(e){}},{timeout:4000});}catch(e){}}
function pruneDaily(){if(G.pruneDue!=null&&G.day-G.pruneDue>=20){G.pruneDue=null;pruneProducts();}}
function pruneProducts(){const P=G.products;if(!P||!P.length)return 0;const cand=new Set();
  for(const p of P){if(p.owner==='P'||p.active||p.waitLaunch||p.acqId)continue;
    if(p.offD==null){if(p.launch!=null&&p.launch<=G.day-PRUNE_OLD)cand.add(p.id);else p.offD=G.day;continue;}
    if(G.day-p.offD>=PRUNE_AGE)cand.add(p.id);}
  if(!cand.size)return 0;
  const refs=new Set(),seen=new Set();PRC=cand;try{
  for(const k in G)if(k!=='products'&&!PRUNE_SKIP.has(k))pruneRefs(G[k],refs,seen,false,PRUNE_KEY.test(k));
  try{pruneRefs(UI,refs,seen,false);}catch(e){}
  // tutulan ürünlerin başvuruları da tutar; yeni tutulanlarınki de (sabit noktaya kadar)
  let keep=P.filter(p=>!cand.has(p.id));
  while(keep.length){for(const p of keep)pruneRefs(p,refs,seen,true);const nk=[];for(const id of [...cand])if(refs.has(id)){cand.delete(id);nk.push(P.find(p=>p.id===id));}keep=nk;}
  }finally{PRC=null;}
  if(!cand.size)return 0;
  let j=0;for(let i=0;i<P.length;i++)if(!cand.has(P[i].id))P[j++]=P[i];const n=P.length-j;P.length=j;
  G.prunedN=(G.prunedN||0)+n;return n;}
