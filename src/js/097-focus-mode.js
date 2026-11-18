/* ============================== FOCUS MODE ============================== */
/* Odak modu: son bir yılda açmadığın ve şu an kullanmadığın bölümleri menüden gizler. Sistemler arka planda çalışmaya devam eder;
   gizli bölümler aramadan ve "Daha fazla" altındaki "göster" düğmesinden açılabilir, açtığın bölüm bir yıl görünür kalır.
   Kırmızı uyarısı olan, yeni açılan ya da sabitlenen bölüm hiç gizlenmez. Ayarlardan bölüm bölüm elle göster/gizle seçilebilir. */
const FOCUS_AGE=365;
const FOCUS_KEEP=['dash','office','dev','prod','team:ekip','res:arastirma','market:pay','market:pazarlama','fin:genel','fin:kayit','quest'];
const FOCUS_USE={
  'mfg':()=>G.factories.length>0,'supply:satin':()=>myActive().some(p=>isHW(p)),'supply:ham':()=>!!G.raw&&Object.keys(G.raw.mine||{}).some(m=>mineLvl(m)>0),
  'market:medya':()=>mdOn(),'fin:portfoy':()=>!!G.pf&&Object.keys(G.pf.h).length>0,'market:magaza':()=>!!G.shops&&G.shops.list.length>0,
  'market:sehir':()=>!!G.cm&&G.cm.re.length>0,'infra:veri':()=>(G.dcs||[]).length>0,'space':()=>spAlive()>0,'bundle':()=>!!(G.bun&&G.bun.on),
  'mega':()=>!!G.mega&&G.mega.act.length>0,'market:altmarka':()=>!!G.sb&&G.sb.list.length>0,'fin:kurul':()=>boardOn(),
  'team:devralma':()=>(G.acqs||[]).length>0,'fin:dusmanca':()=>!!(G.hto&&G.hto.mine),'team:sendika':()=>!!G.union&&G.union.st!=='none',
  'market:toptan':()=>!!G.b2b&&!!G.b2b.tot,'fin:hissedar':()=>!!G.pub,'team:ust':()=>Object.keys(G.execs||{}).length>0,
  'market:bolge':()=>REG_ORDER.some(r=>r!=='tr'&&G.regions[r].in),'fin:kur':()=>REG_ORDER.some(r=>r!=='tr'&&G.regions[r].in),'team:yz':()=>!!G.aiw&&Object.values(G.aiw.n||{}).some(v=>v>0),'map':()=>G.factories.length>0||REG_ORDER.some(r=>r!=='tr'&&G.regions[r].in)};
const focusOf=()=>G.focus||(G.focus={on:false,ov:{}});
const focusOn=()=>!!(G&&G.focus&&G.focus.on);
/* otomatik karar (elle seçim hariç) */
const focusCore=k=>!FOCUS_USE[k]&&Object.values(NAV_CORE).some(L=>L.includes(k));
function focusAuto(k){if(FOCUS_KEEP.includes(k)||focusCore(k)||navPin(k))return true;const N=navState(),v=N.vis&&N.vis[k];if(v!=null&&G.day-v<=FOCUS_AGE)return true;
  const u=FOCUS_USE[k];if(u)try{if(u())return true;}catch(e){}return false;}
function focusShown(k){if(FOCUS_KEEP.includes(k))return true;const o=G.focus&&G.focus.ov&&G.focus.ov[k];if(o)return o>0;return focusAuto(k);}
/* menüden gizlenir mi: açık odak modu, gösterilmeyen bölüm; yeni açılan, şu anki ya da kırmızı uyarılı bölüm gizlenmez */
function focusHid(k,B){if(!focusOn()||focusShown(k)||navNew(k))return false;if(B&&B[k]&&B[k].bad)return false;return k!==curLeaf().leaf;}
function focusVisit(k){if(!G||!k)return;const N=navState();(N.vis||(N.vis={}))[k]=G.day;}
/* ayarlarda listelenen bölümler: açılmış ve gizlenebilir olanlar */
function focusLeaves(){const out=[];for(const h of HUBS)for(const s of h.sec){const k=s[0];if(FOCUS_KEEP.includes(k)||!leafOk(k)||!navOk(k))continue;out.push({h,k,n:s[1]});}return out;}
const focusHidN=()=>focusOn()?focusLeaves().filter(x=>!focusShown(x.k)).length:0;
function focusTip(){const F=focusOf();if(F.tip||F.on||years()<2)return;if(focusLeaves().length<30)return;F.tip=G.day;
  news((LANG_EN?`Tip: ${focusLeaves().length} sections are open. Focus mode in Settings hides the sections you haven't used in the last year.`:`İpucu: ${focusLeaves().length} bölüm açıldı. Ayarlardaki odak modu, son bir yılda kullanmadığın bölümleri menüden gizler.`),'',true);}
function focusAct(a,ds){const F=focusOf();
  if(a==='focustoggle'){F.on=!F.on;UI.focusPeek=false;showToast(F.on?(LANG_EN?`Focus mode on: ${focusHidN()} sections hidden from the menu.`:`Odak modu açık: ${focusHidN()} bölüm menüden gizlendi.`):(LANG_EN?"Focus mode off: every section is in the menu.":'Odak modu kapalı: bütün bölümler menüde.'));return;}
  if(a==='focuspeek'){UI.focusPeek=!UI.focusPeek;return;}
  if(a==='focusreset'){F.ov={};return;}
  if(a==='focusov'){const k=ds.k;if(!k||FOCUS_KEEP.includes(k))return;F.ov=F.ov||{};const want=focusShown(k)?-1:1;if((want>0)===focusAuto(k))delete F.ov[k];else F.ov[k]=want;}}
function vFocusToggle(){const F=focusOf(),on=!!F.on,L=focusLeaves(),hid=L.filter(x=>!focusShown(x.k)).length,ov=Object.keys(F.ov||{}).length;
  let grid='';if(on){let h=null;for(const x of L){if(x.h!==h){h=x.h;grid+=`<b class="small fo-h">${x.h.n}</b>`;}const s=focusShown(x.k),m=F.ov&&F.ov[x.k];
    grid+=`<button class="btn sm fo-c${s?'':' off'}" data-act="focusov" data-k="${x.k}" aria-pressed="${s}" title="${s?(LANG_EN?"Hide from menu":'Menüden gizle'):(LANG_EN?"Show in menu":'Menüde göster')}">${s?'✓':'–'} ${x.n}${m?(LANG_EN?" <small>(manual)</small>":' <small>(elle)</small>'):''}</button>`;}}
  return (LANG_EN?`<div class="col" style="gap:6px"><div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ${on?'primary':''}" data-act="focustoggle" aria-pressed="${on}">Focus mode: ${LANG_EN?(on?'on':'off'):on?"open":"off"}</button>
    <span class="small muted">${on?`${hid} sections hidden from the menu. Hidden sections keep running in the background; you can open them from search or under “More”.`:"Hides the sections you haven't opened in the last year and aren't using. Systems keep running; a section with a red alert is never hidden."}</span></div>
    ${on?`<div class="fo-g" role="group" aria-label="Sections shown in the menu">${grid}</div>${ov?`<div><button class="btn sm ghost" data-act="focusreset">Reset manual choices (${ov})</button></div>`:''}`:''}</div>`:`<div class="col" style="gap:6px"><div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ${on?'primary':''}" data-act="focustoggle" aria-pressed="${on}">Odak modu: ${LANG_EN?(on?'on':'off'):on?'açık':'kapalı'}</button>
    <span class="small muted">${on?`${hid} bölüm menüden gizli. Gizli bölümler arka planda çalışmaya devam eder; aramadan ya da “Daha fazla” altından açabilirsin.`:'Son bir yılda açmadığın ve kullanmadığın bölümleri menüden gizler. Sistemler çalışmaya devam eder; kırmızı uyarısı olan bölüm hiç gizlenmez.'}</span></div>
    ${on?`<div class="fo-g" role="group" aria-label="Menüde görünen bölümler">${grid}</div>${ov?`<div><button class="btn sm ghost" data-act="focusreset">Elle seçimleri sıfırla (${ov})</button></div>`:''}`:''}</div>`);}
