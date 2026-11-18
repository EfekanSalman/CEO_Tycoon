/* ============================== RIVAL STORES ============================== */
/* Donanım satan, markası ve nakdi yeten rakipler girdikleri bölgelerin şehirlerine mağaza açar (tercihen merkez ve iş bölgesi).
   Rakip mağazası olan arsa doludur. Bir rakibin bölgedeki mağaza ağı, onun donanım ürünlerinin o bölgedeki çekiciliğini en çok %6 artırır.
   Kendi rastgele üretecini kullanır; oyunun ortak rastgele akışını kaydırmaz. */
const RVS_W={store:4,flag:12};
const newRvs=()=>({st:[],nid:0,seed:null});
const rvsOf=()=>G.rvs||(G.rvs=newRvs());
function rvsR(){const F=rvsOf();let t=(F.seed=(F.seed==null?(G.day*15485863+11)>>>0:F.seed)+0x6D2B79F5>>>0);t=Math.imul(t^t>>>15,1|t);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;}
const rvsHW=c=>G.products.some(p=>p.active&&p.owner===c.id&&HW.includes(p.cat));
const rvsAt=(cid,i)=>G.rvs?G.rvs.st.find(x=>x.cid===cid&&x.i===i):null;
const RVSC={k:'',w:{}};
function rvsShopW(owner,r){const R=G.rvs,nd=R?R.nid:-1,nl=R?R.st.length:-1;if(RVSC.k===''||RVSC.d!==G.day||RVSC.nd!==nd||RVSC.nl!==nl||RVSC.g!==G){RVSC.g=G;RVSC.k='k';RVSC.d=G.day;RVSC.nd=nd;RVSC.nl=nl;RVSC.w={};if(G.rvs)for(const x of G.rvs.st){const kk=x.o+'|'+CITYD[x.cid].r;RVSC.w[kk]=(RVSC.w[kk]||0)+RVS_W[x.t];}}return RVSC.w[owner+'|'+r]||0;}
const rvsApp=(owner,r)=>1+Math.min(0.06,0.004*rvsShopW(owner,r));
function rvsMonthly(){const F=rvsOf();
  F.st=F.st.filter(x=>{const c=comp(x.o);return c&&!c.dead&&c.cash>-5e6;});
  for(const c of liveComps()){if(!rvsHW(c)||c.brand<25||c.cash<20e6*infl())continue;const mine=F.st.filter(x=>x.o===c.id),tgt=Math.min(12,Math.floor(c.brand/8)+Math.floor(c.cash/(1e8*infl())));
    if(mine.length>=tgt||rvsR()>=0.25)continue;
    const regs=(c.reg||['tr']).filter(r=>REGS[r]);if(!regs.length)continue;const r=regs[Math.floor(rvsR()*regs.length)];
    const L=cityList(r);let tot=L.reduce((a,x)=>a+x.pop,0),u=rvsR()*tot,city=L[0];for(const x of L){u-=x.pop;if(u<=0){city=x;break;}}
    const free=[...Array(CM_W*CM_H).keys()].filter(i=>!plotUse(city.id,i)).sort((a,b)=>plotInfo(city.id,b).tr-plotInfo(city.id,a).tr);if(!free.length)continue;
    const i=free[Math.min(free.length-1,Math.floor(rvsR()*3))],t=c.brand>60&&c.cash>2e8*infl()&&mine.filter(x=>x.t==='flag').length<2?'flag':'store';
    F.st.push({id:++F.nid,o:c.id,cid:city.id,i,t,s:G.day});c.cash-=SHOP_T[t].cost*REGS[r].px*infl();
    if(myActive().some(p=>isHW(p))&&G.regions[r].in&&(t==='flag'||rvsR()<0.3))news((LANG_EN?`${c.name} opened a ${SHOP_T[t].n.toLocaleLowerCase(LOC)} in ${city.n}.`:`${c.name}, ${city.n} şehrinde ${SHOP_T[t].n.toLocaleLowerCase(LOC)} açtı.`),'mkt');}}
function rvsCityList(cid){return G.rvs?G.rvs.st.filter(x=>x.cid===cid):[];}
