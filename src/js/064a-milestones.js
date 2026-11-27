/* ============================== MİLESTONES (v175) ==============================
   Oyunun büyük anlarını kutlar: şirket değeri, aylık gelir, ilk kârlı ay, ekip büyüklüğü, yeni ofis, halka arz, ürün sayısı,
   senaryo hedefleri. Her biri bir kez; ekranın ortasında kart + ses, büyüklerde konfeti. Ay sonunda kontrol edilir (feelMonth).
   Eski kayıt ilk kez açıldığında zaten ulaşılmış olanlar sessizce işaretlenir. Oyun duraklatılmışken ya da pencere açıkken
   kart kuyrukta bekler; hareket azaltma ve "oyun hissi kapalı" tercihlerine uyar. */
const MS_IC={
  val:'<path d="M3 20h18M6 16l4-5 3 3 5-7"/><path d="M15 7h3v3"/>',
  rev:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9v.01M18 15v.01"/>',
  profit:'<path d="M12 3v18M16.5 7.5c0-1.9-2-3-4.5-3s-4.5 1.2-4.5 3.2c0 4.6 9 2.3 9 6.9 0 2-2 3.4-4.5 3.4s-4.5-1.2-4.5-3"/>',
  team:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/>',
  office:'<path d="M4 21V6l8-3 8 3v15M2 21h20M9 21v-5h6v5M8 9h2M14 9h2M8 13h2M14 13h2"/>',
  ipo:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  prods:'<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
  goal:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>'};
const MS_VAL=[1e6,1e7,1e8,1e9,1e10,1e11],MS_REV=[1e5,1e6,1e7,1e8],MS_EMP=[10,50,100,500,1000],MS_PROD=[5,10,25];
/* id → {k: simge, t: başlık, s: alt metin, big: konfeti} ; şu an ulaşılmış olanların listesi */
function msReached(){const out=[],h=G.hist[G.hist.length-1]||{},I=infl(),v=valuation();
  for(const t of MS_VAL)if(v>=t*I)out.push({id:'val'+t,k:'val',big:t>=1e9,t:LANG_EN?`Company value passed ${money(t*I)}`:`Şirket değeri ${money(t*I)}'i aştı`,s:LANG_EN?`Valuation today: ${money(v)}`:`Bugünkü değerleme: ${money(v)}`});
  for(const t of MS_REV)if((h.rev||0)>=t*I)out.push({id:'rev'+t,k:'rev',big:t>=1e7,t:LANG_EN?`${money(t*I)} revenue in a month`:`Bir ayda ${money(t*I)} gelir`,s:LANG_EN?`This month: ${money(h.rev)}`:`Bu ay: ${money(h.rev)}`});
  if((h.profit||0)>0&&G.hist.length>1)out.push({id:'profit1',k:'profit',big:true,t:LANG_EN?'First profitable month!':'İlk kârlı ay!',s:LANG_EN?`Profit: ${money(h.profit)}. The company stands on its own feet.`:`Kâr: ${money(h.profit)}. Şirket artık kendi ayakları üstünde.`});
  for(const t of MS_EMP)if(G.emps.length>=t)out.push({id:'emp'+t,k:'team',big:t>=100,t:LANG_EN?`${t} people on the team`:`Ekip ${t} kişi oldu`,s:LANG_EN?`From a garage of one to ${G.emps.length} people.`:`Tek kişilik garajdan ${G.emps.length} kişiye.`});
  for(let i=1;i<=(G.office||0);i++)out.push({id:'off'+i,k:'office',big:i>=3,t:LANG_EN?`New office: ${OFFICES[i].n}`:`Yeni ofis: ${OFFICES[i].n}`,s:LANG_EN?`Room for ${OFFICES[i].cap} people per floor.`:`Katta ${OFFICES[i].cap} kişilik yer.`});
  if(G.pub)out.push({id:'ipo',k:'ipo',big:true,t:LANG_EN?'You went public!':'Halka arz oldun!',s:LANG_EN?`Share price $${fx(G.pub.price,2)} · market value ${money(marketCap())}`:`Hisse $${fx(G.pub.price,2)} · piyasa değeri ${money(marketCap())}`});
  const np=myActive().length;for(const t of MS_PROD)if(np>=t)out.push({id:'prod'+t,k:'prods',big:false,t:LANG_EN?`${t} products on the market`:`Piyasada ${t} ürün`,s:LANG_EN?'Your portfolio keeps growing.':'Portföyün büyüyor.'});
  const sc=G.scn;if(sc&&sc.got){const gs=scnGoals();for(const i in sc.got)if(sc.got[i]!=null&&gs[i])out.push({id:`goal${sc.id}_${i}`,k:'goal',big:true,t:LANG_EN?'Scenario goal reached':'Senaryo hedefi tamam',s:gs[i].n});}
  return out;}
function msCheck(){if(!G)return;const first=!G.ms;G.ms=G.ms||{};const nw=[];for(const m of msReached())if(!G.ms[m.id]){G.ms[m.id]=G.day;if(!first)nw.push(m);}
  if(!nw.length)return;UI.msQ=(UI.msQ||[]).concat(nw).slice(-4);msShow();}
function msShow(){if(!UI.msQ||!UI.msQ.length||document.getElementById('mscard'))return;
  if(!feelOn()||UI.modal){if(!UI.msWait){UI.msWait=setTimeout(()=>{UI.msWait=null;msShow();},1500);}return;}
  if(document.getElementById('lmom')){setTimeout(msShow,1200);return;}
  const m=UI.msQ.shift(),el=document.createElement('div');el.id='mscard';el.className='mscard'+(m.big?' big':'');el.setAttribute('role','status');
  el.innerHTML=`<div class="ms-in"><span class="ms-ic"><svg viewBox="0 0 24 24" aria-hidden="true">${MS_IC[m.k]||MS_IC.goal}</svg></span><span class="eyebrow">${LANG_EN?'Milestone':'Kilometre taşı'}</span><b class="ms-t">${esc(m.t)}</b><span class="ms-s">${esc(m.s)}</span></div>`;
  document.body.appendChild(el);el.addEventListener('click',()=>el.remove());try{sfx('ach');}catch(e){}
  if(m.big)feelConfetti(90);
  setTimeout(()=>{if(el.isConnected){el.classList.add('out');setTimeout(()=>{el.remove();msShow();},300);}else msShow();},m.big?3400:2600);}
/* tam ekran konfeti (lansman anındakiyle aynı his) */
function feelConfetti(n){if(reduceMotion()||PREF.feelOff)return;const cv=document.createElement('canvas');cv.className='fx-cf';cv.setAttribute('aria-hidden','true');document.body.appendChild(cv);
  const W=cv.width=window.innerWidth,H=cv.height=window.innerHeight,x=cv.getContext('2d'),cols=['#E2581B','#2B8A3E','#3B5BDB','#F2B705','#C2255C','#0B7285'];
  const P=Array.from({length:n},()=>({x:W/2+(Math.random()-0.5)*160,y:H*0.38,vx:(Math.random()-0.5)*12,vy:-Math.random()*11-4,r:Math.random()*Math.PI,c:cols[Math.floor(Math.random()*cols.length)],w:5+Math.random()*5}));const t0=performance.now();
  const fr=t=>{if(!cv.isConnected)return;x.clearRect(0,0,W,H);for(const q of P){q.vy+=0.3;q.vx*=0.995;q.x+=q.vx;q.y+=q.vy;q.r+=0.18;x.save();x.translate(q.x,q.y);x.rotate(q.r);x.fillStyle=q.c;x.fillRect(-q.w/2,-2,q.w,4);x.restore();}if(t-t0<2200)requestAnimationFrame(fr);else cv.remove();};requestAnimationFrame(fr);}
/* ay sonu: göstergeler kısa bir nabız atar */
function feelPulse(profit){if(!feelOn()||reduceMotion())return;for(const el of document.querySelectorAll('.dh-kpis .dkpi b,.dpcards .dpc')){el.classList.remove('pulse','pulse-neg');void el.offsetWidth;el.classList.add(profit<0&&el.tagName==='B'?'pulse-neg':'pulse');}}
