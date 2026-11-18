/* ============================== HELPERS ============================== */
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const rnd=(a,b)=>a+Math.random()*(b-a);
const rint=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const fx=(n,d)=>LANG_EN?n.toFixed(d):n.toFixed(d).replace('.',',');
function money(n){const s=n<0?'-':'';n=Math.abs(n);
  if(n>=1e9)return s+'$'+fx(n/1e9,2)+'B';if(n>=1e6)return s+'$'+fx(n/1e6,2)+'M';if(n>=1e4)return s+'$'+fx(n/1e3,1)+'K';
  if(n<100&&n%1)return s+'$'+fx(n,2);
  return s+'$'+Math.round(n).toLocaleString(LOC);}
function num(n){n=Math.max(0,n);if(n>=1e6)return fx(n/1e6,2)+'M';if(n>=1e4)return fx(n/1e3,1)+'K';if(n<10&&n%1)return fx(n,1);return Math.round(n).toLocaleString(LOC);}
const pctN=n=>LANG_EN?n+'%':'%'+n;
const pct=(x,d=1)=>LANG_EN?fx(x*100,d)+'%':pctN(fx(x*100,d));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const trunc=(s,n)=>s.length>n?s.slice(0,n-1)+'…':s;
function dateOf(d){return new Date(2015,0,1+d);}
function fmtDate(d){const x=dateOf(d);return x.getDate()+' '+MONTHS[x.getMonth()]+' '+x.getFullYear();}
function fmtMonth(d){const x=dateOf(d-1);return MONTHS[x.getMonth()]+' '+x.getFullYear();}
const $=s=>document.querySelector(s);

let G=null;
const UI={tab:'office',selEmp:null,draft:null,fdraft:{type:'asm',region:'vietnam'},modal:null,force:false};
const nid=()=>G.nextId++;
const years=()=>G.day/365;
const infl=()=>Math.pow(1.03,years());
const has=r=>G.res.done[r]!=null;
/* kimliğe göre dizin: listeler yalnızca büyür (ekleme), dizi ya da uzunluk değişince yeniden kurulur; find gibi ilk eşleşmeyi döndürür */
function idIndex(I,a){if(I.a!==a||I.n!==a.length){I.a=a;I.n=a.length;I.m=new Map();for(const x of a)if(!I.m.has(x.id))I.m.set(x.id,x);}return I.m;}
const CMPI={a:null,n:-1,m:null},PRDI={a:null,n:-1,m:null};
const comp=id=>idIndex(CMPI,G.comps).get(id);
const alive=o=>o==='P'||(!!comp(o)&&!comp(o).dead);
const liveComps=()=>G.comps.filter(c=>!c.dead);
const prod=id=>idIndex(PRDI,G.products).get(id);
const fac=id=>G.factories.find(f=>f.id===id);
const S=(cat,day=G.day)=>CATS[cat].S0*Math.pow(1+CATS[cat].g,day/365);
const demand=cat=>{const C=CATS[cat];return (C.logi?C.logi.cap/(1+Math.exp(-(years()-C.logi.mid)/C.logi.k)):C.d0*Math.pow(1+C.dg,years()))*(G.mods&&G.mods.dem||1)*seasonMult(cat)*macDem(cat)*eraDem(cat);};
const ownerName=o=>o==='P'?G.name:(comp(o)?comp(o).name:'?');
const ownerColor=o=>o==='P'?'var(--accent)':`hsl(${comp(o).hue} 55% 52%)`;
const brandOf=o=>o==='P'?G.brand:comp(o).brand;
const catUnlocked=cat=>!CAT_RES[cat]||has(CAT_RES[cat]);
const isHW=p=>p.owner==='P'&&HW.includes(p.cat)&&!!p.spec;
const myActive=cat=>G.products.filter(p=>p.owner==='P'&&p.active&&(!cat||p.cat===cat));
const nodeOf=id=>NODES.find(n=>n.id===id);
const nodeIdx=id=>NODES.findIndex(n=>n.id===id);
const energyMult=()=>G.energy&&G.energy.until>G.day?G.energy.m:1;
const regionDown=r=>!!(G.disrupt[r]&&G.disrupt[r].until>G.day);
const supDown=id=>(G.supDown[id]||0)>G.day||(String(id).startsWith('own_')&&!plantReady(String(id).slice(4)));
const tariff=r=>G.tariffs[r]&&G.tariffs[r].until>G.day?G.tariffs[r].rate:0;
const ESK={d:-1,n:-1,c:-1,v:-1,g:null,m:{}};let EMPV=0;
/* masa (dolayısıyla kat) değişince artar; kata bağlı önbellekler (kişilik, oda bonusu) bununla yenilenir. Kayda girmez. */
let DESKV=0;
function empSkill(role){const K=ESK;if(K.d!==G.day||K.n!==G.emps.length||K.c!==(G.careerVer||0)||K.v!==EMPV||K.g!==G){K.d=G.day;K.n=G.emps.length;K.c=G.careerVer||0;K.v=EMPV;K.g=G;K.m={};}
  const c=K.m[role];if(c!=null)return c;return K.m[role]=G.emps.filter(e=>e.role===role&&!e.leave).reduce((a,e)=>a+e.skill*(e.morale!=null?effMult(e):1),0);}
const opsDefect=()=>Math.min(0.015,empSkill('ops')*0.0007);
const leadRed=()=>(has('logi')?0.25:0)+Math.min(0.2,empSkill('ops')*0.008)+(G.furn&&G.furn.some(f=>f.t==='r_ops')?0.1:0);
function spend(a,k){G.cash-=a;G.month[k]+=a;}

const NEWS_C=[['urun',(LANG_EN?"Products":'Ürünler')],['ekip',(LANG_EN?"Team":'Ekip')],['uretim',(LANG_EN?"Production & supply":'Üretim ve tedarik')],['finans',(LANG_EN?"Finance & legal":'Finans ve hukuk')],['pazar',(LANG_EN?"Market & rivals":'Pazar ve rakipler')],['diger',(LANG_EN?"Other":'Diğer')]];
const NEWS_RX=[['uretim',(LANG_EN?/liman|deprem|kasırga|tayfun|port|earthquake|hurricane|typhoon/i:/liman|deprem|kasırga|tayfun/i)],
  ['finans',(LANG_EN?/düzenleme|yasa|regülasyon|vergi|dava|patent|fidye|yatırım|kredi|halka arz|hisse|temettü|teşvik|borsa|çeyrek|ceza|tazminat|sigorta|servet|nakit|kurul|devral|zehir hapı|şövalye|rekabet kurumu|aktivist|faaliyet raporu|regulat|law\b|tax|lawsuit|sued|patent|ransom|invest|loan|ipo|share|dividend|incentive|stock exchange|quarter|fine\b|severance|insurance|wealth|cash|board|takeover|acqui|poison pill|white knight|competition authority|antitrust|activist|annual report/i:/düzenleme|yasa|regülasyon|vergi|dava|patent|fidye|yatırım|kredi|halka arz|hisse|temettü|teşvik|borsa|çeyrek|ceza|tazminat|sigorta|servet|nakit|kurul|devral|zehir hapı|şövalye|rekabet kurumu|aktivist|faaliyet raporu/i)],
  ['ekip',(LANG_EN?/sendika|grev|istifa|terfi|stajyer|tükenmiş|anket|ajan[ıi]? |ajanlar|ekibe|ekibin|işe döndü|şirket değer|kültür|teklifini reddetti|\/ay teklif|parlak bir fikir|ceo seviyesi|şirketine geçti|yeni bir şey öğrendin|union|strike|resign|promot|intern|burned out|survey|agents?\b|to the team|team's|back to work|company value|culture|turned down|\/mo offer|bright idea|ceo level|joined rival|moved to|learned something new/i:/sendika|grev|istifa|terfi|stajyer|tükenmiş|anket|ajan[ıi]? |ajanlar|ekibe|ekibin|işe döndü|şirket değer|kültür|teklifini reddetti|\/ay teklif|parlak bir fikir|ceo seviyesi|şirketine geçti|yeni bir şey öğrendin/i)],
  ['uretim',(LANG_EN?/tedarik|fabrika|üretim|sipariş|parça|tesis|gümrük|levha|panel|bellek|batarya|stok|veri merkez|kesinti|enerji|raf|ddos|siber|suppl|factory|production|order|parts?\b|plant|customs|wafer|panel|memory|battery|stock|inventory|data center|outage|energy|rack|ddos|cyber/i:/tedarik|fabrika|üretim|sipariş|parça|tesis|gümrük|levha|panel|bellek|batarya|stok|veri merkez|kesinti|enerji|raf|ddos|siber/i)],
  ['ekip',(LANG_EN?/işe al|moral|çalışan|maaş|zam\b|izne|tatil|hastalan|ekip|kurs|yönetici|hired|morale|employee|salary|raise|on leave|vacation|sick|team|course|executive/i:/işe al|moral|çalışan|maaş|zam\b|izne|tatil|hastalan|ekip|kurs|yönetici/i)],
  ['pazar',(LANG_EN?/birleş|mağaza|standı|fuar|sponsor|festival|hackathon|paket|abone|veri seti|gizlilik|şifreleme|şeffaflık|skandal|sosyal medya|marka|pazarına|bölge|rakip|ihale|segment|teknoloji ödülleri|fiyat savaşı|\bces\b|\bmwc\b|computex|gamescom|teknofest|web summit|merge|store|booth|trade show|sponsor|bundle|subscri|dataset|privacy|encryption|transparency|scandal|social media|brand|market\b|region|rival|tender|tech awards|price war/i:/birleş|mağaza|standı|fuar|sponsor|festival|hackathon|paket|abone|veri seti|gizlilik|şifreleme|şeffaflık|skandal|sosyal medya|marka|pazarına|bölge|rakip|ihale|segment|teknoloji ödülleri|fiyat savaşı|\bces\b|\bmwc\b|computex|gamescom|teknofest|web summit/i)],
  ['urun',(LANG_EN?/piyasaya|basın|ürün|lansman|güncelleme|sürüm|proje|geliştirme|araştırma|reklam|kampanya|viral|hata|destek|başarım|uydu|roket|fırlatma|uzay|çöktü|alev ald|saha test|geri çağır|onarım programı|kalite denetim|yenilenmiş|takas|launched|press|product|launch|update|version|project|development|research|ad\b|campaign|bug|support|achievement|satellite|rocket|space|crashed|caught fire|field test|recall|repair program|quality|refurbished|trade-in/i:/piyasaya|basın|ürün|lansman|güncelleme|sürüm|proje|geliştirme|araştırma|reklam|kampanya|viral|hata|destek|başarım|uydu|roket|fırlatma|uzay|çöktü|alev ald|saha test|geri çağır|onarım programı|kalite denetim|yenilenmiş|takas/i)]];
let NAV_MAP=null;
function navFind(t){if(typeof HUBS==='undefined'||!t)return null;if(!NAV_MAP){NAV_MAP=[];for(const h of HUBS)for(const s of h.sec)NAV_MAP.push([h.n+' → '+s[1],s[0]]);NAV_MAP.sort((a,b)=>b[0].length-a[0].length);}for(const [p,k] of NAV_MAP)if(t.includes(p))return k;return null;}
function newsCat(n){if(n.c)return n.c;if(n.k==='mkt')return 'pazar';for(const [c,rx] of NEWS_RX)if(rx.test(n.t))return c;return 'diger';}
/* ölçüm için sistem kapatma (yalnızca bot/karşılaştırma aracı kullanır): window.SG_OFF={spn:1,cd:1,...} */
const sgOff=k=>!!(typeof window!=='undefined'&&window.SG_OFF&&window.SG_OFF[k]);
function news(t,k='',toast=false,go){const n={d:G.day,t,k};if(toast)n.imp=1;const g=go||navFind(t);if(g)n.go=g;n.c=newsCat(n);G.news.unshift(n);if(G.news.length>200)G.news.pop();if(toast){tkPush(n);if(k==='good')sfx('good');else if(k==='bad')sfx('bad');if(typeof apNews==='function')apNews(n);}}
function showToast(t,k,go){const box=$('#toasts');if(!box)return;const el=document.createElement('div');el.className='toast '+(k||'');const sp=document.createElement('span');sp.textContent=t;el.appendChild(sp);if(go===undefined)go=navFind(t);if(go){const bt=document.createElement('button');bt.className='btn sm toast-go';bt.dataset.act='tab';bt.dataset.tab=go;bt.textContent=(LANG_EN?"Go":'Git');bt.setAttribute('aria-label',(LANG_EN?"Go to the related section":'İlgili bölüme git'));el.appendChild(bt);}box.appendChild(el);setTimeout(()=>el.remove(),5000*a11y().toast);while(box.children.length>1)box.firstChild.remove();}

function salaryFor(s){return Math.round((1500+Math.pow(s,1.6)*450)*infl()/100)*100;}
function genCand(bonus=0){
  const role=pick(['soft','soft','design','design','hw','hw','res','mkt','ops','sup','sec']);
  const base=2.2+G.office*0.8+G.brand/25+bonus+prestige()/40+(G.fame||0)/20+(G.dev?Math.min(1,G.dev.devs/20000):0)+esgHire()+awHire()+(macPh()==='rec'?0.4:0)+(G&&G.tools&&G.tools.hire?0.25:0)+(G&&G.wpol?wHire():0)+(G&&G.fair?spoCand():0)+(G&&G.cv&&G.cv.vals.length?Math.max(0,G.cv.s-60)/100:0)+megaCand()+(typeof spnCand==='function'?spnCand():0);
  const skill=clamp(Math.round((base+rnd(-1.5,3))*10)/10,1,10);
  const level=levelFor(skill);
  return {id:nid(),name:pick(FIRST)+' '+pick(LAST),role,skill,level,xp:XP_REQ[level]+rint(0,40),salary:Math.round(salaryFor(skill)*(1+0.12*level)*macWage()*(G&&G.era&&G.era.wage>G.day?0.9:1)*(G&&G.wpol==='remote'?0.93:1)/100)*100,proj:null,tr:pickTraits(),rev:false,...newWell()};
}
function resEarly(r){const n=RES_NODE[r.id],era=n?NODE_ERA[n]:r.era;if(era==null)return 1;const y=era-years();return y>0?Math.min(10,Math.pow(ceoSk('v4')?1.35:1.7,y)):1;}
const resRP=r=>Math.round(r.rp*resEarly(r)*(1-(typeof tdnResDisc==='function'?tdnResDisc(r.id):0)));
const resCostOf=r=>r.cost*infl()*resEarly(r)*(incOk('rnd')?0.75:1)*(typeof lobRes==='function'?lobRes():1);
const actRP=()=>G.res.active?(G.res.active.rp||RESD[G.res.active.id].rp):1;
