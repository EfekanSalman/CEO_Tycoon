/* ============================== EVENTS (DOM) ============================== */
document.addEventListener('pointerdown',()=>{lastPointer=performance.now();},true);
document.addEventListener('click',e=>{
  if(e.target.id==='officeCanvas'){officeClick(e);return;}
  const sp=e.target.closest('[data-speed]');if(sp){sfx('click');if(!G.over&&!G.pending){G.speed=+sp.dataset.speed;UI.apRun=null;UI.apWhy=null;}UI.force=true;render();return;}
  const b=e.target.closest('[data-act]');if(b&&!b.disabled){sfx('click');if(/^err/.test(b.dataset.act)&&errAct(b.dataset.act))return;try{act(b.dataset.act,b.dataset);}catch(err){errCatch('eylem',err,false);}}
});
function setBind(path,el){
  let val=el.type==='checkbox'?el.checked:el.value;
  if(el.dataset.num)val=+val;
  if(path==='name'){G.name=String(val).trim().slice(0,28)||(LANG_EN?"Garage Labs":'Garaj Labs');return;}
  if(path==='fgDays'||path==='compDays'){G[path]=val;return;}
  if(path==='meetProj'){UI.meetProj=val;return;}
  if(path==='ofpick'){UI.branch=null;UI.rival=val||null;UI.edit=false;UI.placing=null;RV.key='';return;}
  if(path==='sbn.name'){(UI.sbn=UI.sbn||{pos:'eco',end:true}).name=String(val).slice(0,24);return;}
  if(path.startsWith('sbadd.')){const S=sbById(+path.slice(6)),p=prod(+val);if(S&&p&&p.owner==='P'){p.sb=S.id;news((LANG_EN?`${p.name} is now sold under the ${S.n} brand.`:`${p.name} artık ${S.n} markasıyla satılıyor.`));}return;}
  if(path==='bid.slo'){biD().slo=String(val).slice(0,48);return;}
  if(/^sed[tgp]?\./.test(path)){sedSet(path,val);return;}
  if(path==='nf.q'){UI.nf=UI.nf||{c:'all',tone:'all',q:''};UI.nf.q=String(val).slice(0,40);return;}
  if(path==='pref.vol'){PREF.vol=clamp(+val||0,0,1);prefSave();sndVol();return;}
  if(path.startsWith('mk.')){G.mkt.b[path.slice(3)]=Math.max(0,Math.round(val)||0);G.mkt.ver++;return;}
  if(path.startsWith('tr.')){UI.tr=UI.tr||{};UI.tr[path.slice(3)]=val;return;}
  if(path.startsWith('sue.')&&UI.sue){UI.sue[path.slice(4)]=val;return;}
  if(path.startsWith('lp.')&&UI.lpd){UI.lpd[path.slice(3)]=val;return;}
  if(path.startsWith('dd.')&&UI.dd){const k=path.slice(3);if(k==='cid'||k==='type'){const c=comp(k==='cid'?val:UI.dd.cid),t=k==='type'?val:UI.dd.type;const el=dealElig(c);const tt=!el[t]?t:(Object.keys(el).find(x=>!el[x])||t);UI.dd=!el[tt]?dealDefaults(c,tt):{cid:c.id,type:tt,months:12};}else UI.dd[k]=val;return;}
  const [obj,k]=path.split('.');
  if(obj==='draft'){UI.draft[k]=val;if(k==='node'){const n=nodeOf(val);UI.draft.cores=Math.min(UI.draft.cores,n.cores);UI.draft.clock=Math.min(UI.draft.clock,n.clk);}}
  if(obj==='fdraft')UI.fdraft[k]=val;
}
document.addEventListener('change',e=>{if(e.target&&e.target.id==='impFile'&&e.target.files&&e.target.files[0]){const r=new FileReader();r.onload=()=>{const t=document.getElementById('impText');if(t)t.value=r.result;};r.readAsText(e.target.files[0]);}});
$((LANG_EN?"#main":'#main')).addEventListener('input',e=>{
  const el=e.target;
  if(el.dataset.bind){setBind(el.dataset.bind,el);if(el.type!=='text'||hasMorph()){UI.force=true;render();}}
});
$((LANG_EN?"#main":'#main')).addEventListener('change',e=>{
  const el=e.target;
  if(el.dataset.bind){setBind(el.dataset.bind,el);UI.force=true;render();return;}
  if(el.dataset.movefl){moveFloor(+el.dataset.movefl,+el.value);}
  if(el.dataset.shopcity){(UI.shopCity=UI.shopCity||{})[el.dataset.shopcity]=el.value;}
  if(el.dataset.deppick){const D=depOf(),t=el.dataset.deppick;if(D.pick[t]!=null){D.pick[t]=el.value;D.w[t].c=null;}}
  if(el.dataset.assign){const e2=G.emps.find(x=>x.id===+el.dataset.assign);if(e2)e2.proj=el.value?(el.value[0]==='m'?el.value:+el.value):null;}
  if(el.dataset.price){const p=prod(+el.dataset.price);const v=+el.value;if(p&&v>=0){if(p.priceLock>G.day&&v>p.price){showToast((LANG_EN?`Competition Authority ruling: you can't raise prices until ${fmtDate(p.priceLock)}.`:`Rekabet Kurumu kararı: ${fmtDate(p.priceLock)}'e kadar zam yapamazsın.`),'bad');el.value=p.price;}else p.price=v;}}
  if(el.dataset.fairp){(UI.fairP=UI.fairP||{})[el.dataset.fairp]=el.value;}
  if(el.dataset.planSite){const p=prod(+el.dataset.planSite);if(p)p.plan.site=el.value;}
  if(el.dataset.planMode){const p=prod(+el.dataset.planMode);if(p){p.plan.mode=el.value;if(el.value==='manual')p.plan.rate=Math.round(p.planRate||p.units/30);}}
  if(el.dataset.planRate){const p=prod(+el.dataset.planRate);if(p)p.plan.rate=Math.max(0,+el.value||0);}
  UI.force=true;render();
});
$((LANG_EN?"#main":'#main')).addEventListener('focusout',()=>{setTimeout(()=>{UI.force=true;render();},0);});
$('#modal').addEventListener('input',e=>{if(e.target.id==='askQ'){UI.askQ=e.target.value;return;}if(e.target.id==='phCap'){if(UI.ph){UI.ph.cap=e.target.value.slice(0,60);phPaint();}return;}if(e.target.id==='galQ'){UI.galQ=e.target.value;UI.galN=9;const l=$('#galList');if(l)l.innerHTML=galListHTML();return;}if(e.target.id==='cmdQ'){UI.cmdQ=e.target.value;UI.cmdI=0;const l=$('#cmdList');if(l)l.innerHTML=cmdListHTML();return;}if(e.target.id==='encQ'){UI.encQ=e.target.value;const l=$('#encList');if(l)l.innerHTML=encListHTML();}});
document.addEventListener('keydown',e=>{
  if(e.target&&e.target.id==='askQ'&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();aiAsk(e.target.value);return;}
  {const ae=document.activeElement;if((e.key==='Enter'||e.key===' ')&&ae&&ae.tagName!=='BUTTON'&&ae.getAttribute&&ae.getAttribute('role')==='button'&&ae.dataset&&ae.dataset.act){e.preventDefault();act(ae.dataset.act,ae.dataset);return;}}
  if(UI.modal&&UI.modal.kind==='wrap'){if(e.key==='ArrowRight'){e.preventDefault();wrGo(1);return;}if(e.key==='ArrowLeft'){e.preventDefault();wrGo(-1);return;}if(e.key==='Escape'){act('wrclose',{});return;}if(e.code==='Space'&&document.activeElement.tagName!=='BUTTON'){e.preventDefault();act('wrpause',{});return;}}
  if((e.ctrlKey||e.metaKey)&&(e.key==='k'||e.key==='K')){e.preventDefault();if(UI.modal&&UI.modal.kind==='cmd')closeModal();else if(!UI.modal||UI.modal.kind==='help')act('cmd',{});return;}
  if(UI.modal&&UI.modal.kind==='cmd'){if(e.key==='Escape'){closeModal();return;}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();UI.cmdI=(UI.cmdI||0)+(e.key==='ArrowDown'?1:-1);const l=$('#cmdList');if(l){l.innerHTML=cmdListHTML();const on=l.querySelector('.on');if(on)on.scrollIntoView({block:'nearest'});}return;}
    if(e.key==='Enter'){e.preventDefault();cmdGo(UI.cmdI||0);return;}return;}
  if(e.key==='/'&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)&&!UI.modal){e.preventDefault();act('cmd',{});return;}
  if(e.key==='?'&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)){if(UI.modal&&UI.modal.kind==='help')closeModal();else if(!UI.modal)act('help',{});return;}
  if(e.key==='Escape'&&UI.modal&&UI.modal.kind==='photo'){phClose();return;}
  if(e.key==='Escape'&&UI.modal&&UI.modal.kind==='pitch'){pitchQuit();return;}
  if(e.key==='Escape'&&UI.modal&&(UI.modal.kind==='feed'||UI.modal.kind==='inbox')){closeModal();return;}
  if(e.key==='Escape'&&UI.modal&&UI.modal.kind==='help'){closeModal();return;}
  if(UI.edit&&UI.tab==='office'&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)){
    if(e.key==='r'||e.key==='R'){UI.rot=UI.rot?0:1;OV.ghostKey=null;UI.force=true;render();return;}
    if(e.key==='Escape'){if(UI.placing)UI.placing=null;else UI.edit=false;UI.selFurn=null;UI.force=true;render();return;}
  }
  if(/^Digit[1-9]$/.test(e.code)&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)&&!UI.modal){const h=HUBS[+e.code.slice(5)-1];if(h){act('hub',{h:h.id});}return;}
  if(e.code==='Space'&&!/INPUT|SELECT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)){e.preventDefault();if(!G.over&&!G.pending){G.speed=G.speed?0:1;UI.force=true;render();}}
});

