/* ============================== SAVE / BOOT ============================== */
try{document.documentElement.lang=LANG_EN?'en':'tr';}catch(e){}
const KEY='silikon-garaj-save-v2';
function save(){if(G&&!(Number.isFinite(G.cash)&&Number.isFinite(G.day))){errCatch((LANG_EN?"save":'kayıt'),new Error((LANG_EN?"Corrupt state (cash or day is not a number); autosave was skipped to protect it.":'Bozuk durum (nakit ya da gün sayı değil); otomatik kayıt korunmak için yazılmadı.')));return;}let s='';try{s=saveJSON();}catch(e){return;}SAVE_SZ.n=s.length;
  try{localStorage.setItem(KEY,s);SAVE_SZ.fail=false;}catch(e){
    try{localStorage.removeItem(RESCUE_KEY);localStorage.setItem(KEY,s);SAVE_SZ.fail=false;return;}catch(e2){}
    if(!SAVE_SZ.fail){SAVE_SZ.fail=true;try{showToast((LANG_EN?"Autosave failed: browser storage is full. Delete a slot or save to a file under Settings → Save.":'Otomatik kayıt yapılamadı: tarayıcı depolama alanı dolu. Ayarlar → Kayıt bölümünden bir yuvayı sil ya da kaydı dosyaya al.'),'bad');}catch(x){}}}}
const SAVE_SZ={n:0,fail:false};
/* kayıtta ondalıklı sayılar 9 anlamlı basamağa yuvarlanır (göreli hata ≤5e-10); bellekteki oyun tam hassasiyetle sürer */
/* çalışanlar kayda sıkı yazılır: null/false alanlar ve süresi dolmuş tutma primi atlanır (kod bunları tanımsızla aynı okur),
   moral, enerji ve deneyim 2 ondalığa yuvarlanır. Bellekteki çalışan nesneleri değişmez. */
const EMP_R2={morale:1,energy:1,xp:1};
function empPack(e){const o={};for(const k in e){let v=e[k];if(v===null||v===false||v===undefined)continue;if(k==='ret'&&!(v&&v.until>G.day))continue;
  if(EMP_R2[k]&&typeof v==='number')v=Math.round(v*100)/100;o[k]=v;}return o;}
/* ayrıca tablo biçiminde yazılır: alan adları bir kez (k), her çalışan bir değer satırı (v); eksik alan null olur.
   Okurken migrate() başında empUncols ile nesne listesine geri çevrilir (null alanlar zaten yazılmadığı için kayıp yok). */
function empCols(L){const k=[],ix={};for(const o of L)for(const f in o)if(ix[f]==null){ix[f]=k.length;k.push(f);}
  return {_c:1,k,v:L.map(o=>{const r=new Array(k.length).fill(null);for(const f in o)r[ix[f]]=o[f];let n=r.length;while(n&&r[n-1]===null)n--;r.length=n;return r;})};}
function empUncols(x){if(!x||Array.isArray(x)||!x._c||!Array.isArray(x.k)||!Array.isArray(x.v))return x;
  return x.v.map(r=>{const o={};for(let i=0;i<x.k.length;i++){const v=r[i];if(v!==null&&v!==undefined)o[x.k[i]]=v;}return o;});}
const SAVE_RND=function(k,v){if(typeof v==='number')return v%1!==0&&isFinite(v)?+v.toPrecision(9):v;if(this===G&&(k==='emps'||k==='cands')&&Array.isArray(v))return empCols(v.map(empPack));return v;};
const saveJSON=()=>JSON.stringify(G,SAVE_RND);
function load(){try{const s=localStorage.getItem(KEY);if(s){const g=JSON.parse(s);if(g&&g.v===2)return g;}}catch(e){}return null;}
window.addEventListener('pagehide',()=>{if(G){SAVE_Q=0;save();}});
/* ay sonu otomatik kaydı oyun adımının içinde değil, tarayıcı boşta kalınca (en geç 1,5 sn) yazılır; sekme gizlenirken hemen yazılır */
let SAVE_Q=0;
function saveSoon(){if(SAVE_Q)return;SAVE_Q=1;const run=()=>{if(!SAVE_Q)return;SAVE_Q=0;save();};
  try{if(typeof requestIdleCallback==='function'){requestIdleCallback(run,{timeout:1500});return;}}catch(e){}setTimeout(run,0);}
const saveNow=()=>{SAVE_Q=0;if(G)save();};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&SAVE_Q)saveNow();});

const SPEEDS=[0,1000,350,90];
let acc=0,lastT=performance.now();
function loop(now){
  const dt=Math.min(1000,now-lastT);lastT=now;dnUpdate(dt);
  if(G&&G.speed&&!G.over&&!G.pending){
    acc+=dt;const per=SPEEDS[G.speed];let n=0;
    try{while(acc>=per&&n<20&&G.speed){acc-=per;step();n++;}}catch(e){acc=0;errCatch((LANG_EN?"day":'gün'),e);}
    if(n>=20)acc=0;
    if(n&&now-lastRender>200){lastRender=now;try{render();}catch(e){errCatch((LANG_EN?"render":'çizim'),e,false);}}
  }
  if(G&&UI.tab==='office'&&!ERR.draw){try{if(UI.rival||UI.branch)drawRival(now);else drawOffice(now);}catch(e){ERR.draw=1;errCatch('ofis',e,false);}}
  requestAnimationFrame(loop);
}
function shellLang(){if(!LANG_EN)return;const set=(sel,a,v)=>{const el=document.querySelector(sel);if(el)el.setAttribute(a,v);};
  try{document.title=(LANG_EN?"Silicon Garage":'Silikon Garaj');set('#speed','aria-label',(LANG_EN?"Game speed":'Oyun hızı'));set('[data-speed="0"]','aria-label',(LANG_EN?"Pause":'Duraklat'));set('[data-speed="1"]','aria-label',(LANG_EN?"Normal speed":'Normal hız'));set('[data-speed="2"]','aria-label',(LANG_EN?"Fast":'Hızlı'));set('[data-speed="3"]','aria-label',(LANG_EN?"Very fast":'Çok hızlı'));
    set('.sndbtn[data-act="cmd"]','aria-label',(LANG_EN?"Search and go (Ctrl+K)":'Ara ve git (Ctrl+K)'));set('.sndbtn[data-act="cmd"]','title',(LANG_EN?"Search and go (Ctrl+K)":'Ara ve git (Ctrl+K)'));set('.sndbtn[data-act="help"]','aria-label',(LANG_EN?"Encyclopedia":'Ansiklopedi'));set('.sndbtn[data-act="help"]','title','Ansiklopedi (?)');
    set('#sndBtn','aria-label',(LANG_EN?"Toggle sound":'Sesi aç ya da kapat'));set('#sndBtn','title',(LANG_EN?"Sound":'Ses'));set('nav.tabs','aria-label',(LANG_EN?"Sections":'Bölümler'));set('nav.bnav','aria-label',(LANG_EN?"Main sections":'Ana bölümler'));}catch(e){}}
function setLang(l){try{localStorage.setItem(LANG_KEY,l);}catch(e){}if(G)save();location.reload();}
function vLangPick(){return (LANG_EN?`<div class="row lang-pick" role="group" aria-label="Language"><button class="btn sm ${!LANG_EN?'primary':''}" data-act="lang" data-k="tr" aria-pressed="${!LANG_EN}">Türkçe</button><button class="btn sm ${LANG_EN?'primary':''}" data-act="lang" data-k="en" aria-pressed="${LANG_EN}">English</button></div>`:`<div class="row lang-pick" role="group" aria-label="Dil / Language"><button class="btn sm ${!LANG_EN?'primary':''}" data-act="lang" data-k="tr" aria-pressed="${!LANG_EN}">Türkçe</button><button class="btn sm ${LANG_EN?'primary':''}" data-act="lang" data-k="en" aria-pressed="${LANG_EN}">English</button></div>`);}
function start(data){
  shellLang();
  try{a11yApply();}catch(e){}
  G=(data&&data.G&&data.G.v===2&&data.G)||load();
  let first=false;if(!G){newGame();first=true;G.tut={on:true,step:0,seen:{}};}else migrate(G);
  lbInit();aiInit();
  G.speed=0;
  if(data&&data.UI){UI.tab=data.UI.tab||'office';UI.draft=data.UI.draft||null;}
  UI.force=true;render();setTimeout(()=>{try{slotRepack();}catch(e){}},4000);try{if(G&&!G.over){const a=pruneProducts(),b=G.ar?arArchive():0,c=statsThin();if(a||b||c)save();}}catch(e){}
  if(G.over)openModal(G.exited?'exit':'over');else if(G.pending)openModal('event');else if(first)openModal('scenario','first');
  requestAnimationFrame(loop);
}
window.claude?.hot?.snapshot?.(()=>({G,UI:{tab:UI.tab,draft:UI.draft}}));
window.claude?.hot?.ready?window.claude.hot.ready(start):start(window.claude?.hot?.data??{});
