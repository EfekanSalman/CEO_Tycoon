/* ============================== ERROR GUARD ============================== */
/* Beklenmeyen bir hata oyunu sessizce dondurmasın: oyunu duraklat, durumu kurtarma anahtarına yaz, oyuncuya seçenek ve kopyalanabilir rapor sun. */
const VER='v167',RESCUE_KEY='silikon-garaj-rescue';
const ERR={list:[],open:false,lastRescue:0,quiet:false};
function errKey(e){const m=(e&&e.message)||String(e),f=((e&&e.stack)||'').split('\n').find(l=>/at /.test(l))||'';return m+'|'+f.trim();}
function errCatch(src,e,pause=true){
  if(e&&e.__sg)return;try{if(e&&typeof e==='object')e.__sg=1;}catch(x){}
  const msg=String((e&&e.message)||e||(LANG_EN?"Unknown error":'Bilinmeyen hata')).slice(0,300);if(/ResizeObserver loop|^Script error\.?$/.test(msg))return;
  const k=errKey(e),old=ERR.list.find(x=>x.k===k);
  if(old)old.n++;else{ERR.list.push({k,src,msg,stack:String((e&&e.stack)||'').split('\n').slice(0,8).join('\n'),day:G?G.day:null,tab:UI.tab,t:Date.now(),n:1});if(ERR.list.length>8)ERR.list.shift();}
  try{console.error((LANG_EN?"[Silicon Garage]":'[Silikon Garaj]'),src,e);}catch(x){}
  if(G&&pause&&G.speed){G.prevSpeed=G.speed;G.speed=0;}
  if(G&&Date.now()-ERR.lastRescue>30000){ERR.lastRescue=Date.now();try{packSave(JSON.stringify({t:Date.now(),ver:VER,src,msg,G})).then(p=>{try{localStorage.setItem(RESCUE_KEY,p);}catch(x){}}).catch(()=>{});}catch(x){}}
  ERR.open=true;errShow();
  if(e&&typeof e==='object')setTimeout(()=>{throw e;},0);
}
function errText(){const x=G||{};return [(LANG_EN?`Silicon Garage ${VER} error report`:`Silikon Garaj ${VER} hata raporu`),(LANG_EN?`Time: ${new Date().toISOString()}`:`Zaman: ${new Date().toISOString()}`),(LANG_EN?`Game day: ${x.day!=null?x.day+' ('+fmtDate(x.day)+')':'-'} · scenario: ${x.scn?x.scn.id:'-'} · tab: ${UI.tab}`:`Oyun günü: ${x.day!=null?x.day+' ('+fmtDate(x.day)+')':'-'} · senaryo: ${x.scn?x.scn.id:'-'} · sekme: ${UI.tab}`),(LANG_EN?`Browser: ${navigator.userAgent}`:`Tarayıcı: ${navigator.userAgent}`),'',
  ...ERR.list.map((r,i)=>`#${i+1} [${r.src}] ${r.msg}${r.n>1?` (×${r.n})`:''}\n${r.stack}`)].join('\n');}
function errShow(){let el=document.getElementById('errbar');if(!ERR.open){if(el)el.remove();return;}
  if(!el){el=document.createElement('div');el.id='errbar';el.className='errbar';el.setAttribute('role','alert');document.body.appendChild(el);}
  const r=ERR.list[ERR.list.length-1]||{msg:''},has=(()=>{try{return !!localStorage.getItem(KEY);}catch(x){return false;}})();
  el.innerHTML=(LANG_EN?`<div class="errbar-t"><b>Something went wrong.</b> The game is paused; your company's state was written to a recovery save.<div class="small muted">${esc(r.msg).slice(0,140)}${ERR.list.length>1?` · ${ERR.list.length} distinct errors`:''}</div></div>
    <div class="errbar-b"><button class="btn sm primary" data-act="errgo">Continue</button>${has?"<button class=\"btn sm\" data-act=\"errback\">Revert to last autosave</button>":''}<button class="btn sm" data-act="errcopy">Copy report</button><button class="btn sm ghost" data-act="errclose" aria-label="Close">✕</button></div>`:`<div class="errbar-t"><b>Bir şeyler ters gitti.</b> Oyun duraklatıldı; şirketinin durumu kurtarma kaydına yazıldı.<div class="small muted">${esc(r.msg).slice(0,140)}${ERR.list.length>1?` · ${ERR.list.length} farklı hata`:''}</div></div>
    <div class="errbar-b"><button class="btn sm primary" data-act="errgo">Devam et</button>${has?'<button class="btn sm" data-act="errback">Son otomatik kayda dön</button>':''}<button class="btn sm" data-act="errcopy">Raporu kopyala</button><button class="btn sm ghost" data-act="errclose" aria-label="Kapat">✕</button></div>`);}
function errAct(a){
  if(a==='errgo'){ERR.open=false;errShow();if(G&&G.prevSpeed&&!G.over)G.speed=G.prevSpeed;UI.force=true;return true;}
  if(a==='errclose'){ERR.open=false;errShow();return true;}
  if(a==='errback'){const g=load();if(g&&loadGameObj(g)){ERR.open=false;errShow();showToast((LANG_EN?"Last autosave loaded.":'Son otomatik kayıt yüklendi.'));}else showToast((LANG_EN?"Couldn't read the autosave.":'Otomatik kayıt okunamadı.'),'bad');return true;}
  if(a==='errcopy'){const t=errText();try{navigator.clipboard.writeText(t).then(()=>showToast((LANG_EN?"Error report copied.":'Hata raporu kopyalandı.')),()=>errDl(t));}catch(x){errDl(t);}return true;}
  return false;}
function errDl(t){if(typeof DL!=='undefined'&&DL)DL.save({filename:(LANG_EN?"silicon-garage-error.txt":'silikon-garaj-hata.txt'),data:t}).catch(()=>{});else showToast((LANG_EN?"Couldn't copy.":'Kopyalanamadı.'),'bad');}
window.addEventListener('error',ev=>{if(ev&&ev.error&&ev.error.__sg)return;errCatch('pencere',ev&&(ev.error||ev.message),true);});
window.addEventListener('unhandledrejection',ev=>{const r=ev&&ev.reason;if(r&&r.__sg)return;if(r&&typeof r==='object'&&'code' in r&&!(r instanceof Error))return;errCatch((LANG_EN?"promise":'söz'),r instanceof Error?r:new Error(String(r&&r.message||r)),false);});

