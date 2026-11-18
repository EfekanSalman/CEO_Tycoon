/* ============================== MOBILE LAYOUT ============================== */
const isMob=()=>window.matchMedia&&window.matchMedia('(max-width:700px)').matches;
function mctaSync(){const bar=document.getElementById('mcta');if(!bar)return;const el=isMob()&&!UI.modal?document.querySelector('#main [data-cta]'):null;
  if(!el){bar.hidden=true;return;}const r=el.getBoundingClientRect(),vh=window.innerHeight,bn=document.querySelector('.bnav'),bh=bn?bn.offsetHeight:0,on=r.bottom<=vh-bh&&r.top>=(document.getElementById('top')||{offsetHeight:0}).offsetHeight;
  if(on){bar.hidden=true;return;}const b=bar.firstElementChild;const t=(el.textContent||'').trim();if(b.textContent!==t)b.textContent=t;b.disabled=!!el.disabled;bar.hidden=false;}
window.addEventListener('scroll',()=>{if(G)mctaSync();},{passive:true});
window.addEventListener('resize',()=>{if(G)mctaSync();});
document.addEventListener('click',e=>{const b=e.target.closest('#mcta button');if(!b)return;const el=document.querySelector('#main [data-cta]');if(el&&!el.disabled){el.scrollIntoView({block:'center',behavior:reduceMotion()?'auto':'smooth'});el.click();}});
/* alttan açılan pencere: aşağı kaydırınca kapat */
const SHEET_CLOSE={feed:()=>closeModal(),inbox:()=>closeModal(),adv:()=>closeModal(),help:()=>closeModal(),cmd:()=>closeModal(),event:()=>{if(G.pending&&G.pending.ib)act('evlater',{});},pitch:()=>pitchQuit()};
(function(){let y0=null,el=null,dy=0;
  document.addEventListener('touchstart',e=>{const m=e.target.closest('#modal .modal');if(!m||!isMob()||!UI.modal||!SHEET_CLOSE[UI.modal.kind]||m.scrollTop>0){y0=null;return;}y0=e.touches[0].clientY;el=m;dy=0;},{passive:true});
  document.addEventListener('touchmove',e=>{if(y0==null||!el)return;dy=Math.max(0,e.touches[0].clientY-y0);el.style.transform=dy?`translateY(${dy}px)`:'';},{passive:true});
  document.addEventListener('touchend',()=>{if(y0==null||!el)return;const m=el;y0=null;el=null;m.style.transform='';if(dy>90&&UI.modal){const f=SHEET_CLOSE[UI.modal.kind];if(f)f();}dy=0;},{passive:true});})();
