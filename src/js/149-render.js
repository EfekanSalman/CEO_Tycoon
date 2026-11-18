/* ============================== RENDER ============================== */
let lastPointer=0,lastRender=0;
const hasMorph=()=>typeof window.morphdom==='function';
function patch(el,html,fx){
  if(el._h===html&&el._av===ACTV&&el.childNodes.length)return;
  el._av=ACTV;
  if(hasMorph()){
    const tmp=el.cloneNode(false);tmp.innerHTML=html;if(fx)try{fx(tmp);}catch(e){}
    window.morphdom(el,tmp,{childrenOnly:true,onBeforeElUpdated:(from,to)=>{
      if(from===document.activeElement&&/INPUT|SELECT|TEXTAREA/.test(from.tagName)&&from.type!=='checkbox')return false;
      if(from.tagName==='CANVAS')return false;
      if(from.classList&&from.classList.contains('hov'))return false;
      if(from.tagName==='DETAILS')to.open=from.open;
      return !from.isEqualNode(to);}});
  }else if(el._h!==html){el.innerHTML=html;if(fx)try{fx(el);}catch(e){}}
  el._h=html;
}
function renderTop(){sndBtnUpdate();
  $('#coName').textContent=G.name;biHeader();biAccent();$('#date').textContent=fmtDate(G.day);
  patch($('#stats'),vStats());
  document.querySelectorAll('#speed button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.speed===G.speed)));
  {const tb=vTabs();patch($('#tabs'),tb);const bn=$('#bnav');if(bn)patch(bn,tb);}
  {const af=$('#advfab');if(af)patch(af,'');}
  {const tr=$('#tkrow');if(tr)patch(tr,vTk());}
  document.documentElement.style.setProperty('--top-h',$('#top').offsetHeight+'px');
}
function render(){
  if(!G)return;
  if(UI.dragging)return;
  renderTop();
  const main=$((LANG_EN?"#main":'#main')),ae=document.activeElement;
  if(!hasMorph()){
    const typing=ae&&main.contains(ae)&&/INPUT|SELECT|TEXTAREA/.test(ae.tagName)&&ae.type!=='checkbox'&&ae.type!=='range';
    if(!UI.force&&(typing||performance.now()-lastPointer<400))return;
  }
  UI.force=false;
  if(UI.tab==='dev'&&!UI.draft)UI.draft=defaultDraft('app');
  tutTick();gdTick();
  {const c=curLeaf();if(c.leaf&&G.nav&&G.nav.init&&!G.nav.seen[c.leaf])G.nav.seen[c.leaf]=1;if(c.h)(UI.hubLast=UI.hubLast||{})[c.h]=c.leaf;const lk=UI.tab+':'+(SUBTABS[UI.tab]?curSub(UI.tab):'');if(UI._lk!==lk){if(UI._lk!=null){main.classList.remove('enter');void main.offsetWidth;main.classList.add('enter');clearTimeout(UI._et);UI._et=setTimeout(()=>main.classList.remove('enter'),600);}UI._lk=lk;UI._scrollSec=true;}}
  patch(main,hubBar()+scnStrip()+vGuideStrip()+tipCard()+pageSum()+VIEWS[UI.tab](),uiEnhance);
  {const w=main.querySelector('.mp-wrap');if(w&&!w._init&&w.scrollWidth>w.clientWidth){w._init=1;const [x]=mxy(25,40);w.scrollLeft=Math.max(0,x/MAP_W*w.scrollWidth-w.clientWidth/2);}}
  if(UI._scrollSec){UI._scrollSec=false;const on=main.querySelector('.secbar-in .sec.on');if(on){const bar=on.parentElement;bar.scrollLeft=Math.max(0,on.offsetLeft-bar.offsetLeft-bar.clientWidth/2+on.offsetWidth/2);}}
  {const co=$('#coach');if(co)patch(co,vCoach());}
  if(UI.modal&&UI.modal.kind==='event'&&!G.pending)closeModal();
  mctaSync();
}

