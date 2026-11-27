/* ============================== GAME FEEL ============================== */
const feelOn=()=>!PREF.feelOff&&document.visibilityState==='visible'&&G&&G.speed>0;
function cashDisp(){return UI.cashDisp==null?G.cash:UI.cashDisp;}
(function cashTick(){if(G){const t=G.cash,c=UI.cashDisp;if(c==null||reduceMotion()||PREF.feelOff||Math.abs(t-c)<Math.max(1,Math.abs(t)*0.002))UI.cashDisp=t;else{UI.cashDisp=c+(t-c)*0.16;const el=document.querySelector('#stats .stat b');if(el)el.textContent=money(UI.cashDisp);}}requestAnimationFrame(cashTick);})();
function feelMonth(rev,profit){try{msCheck();}catch(e){}try{feelPulse(profit);}catch(e){}if(!feelOn())return;const s=document.querySelector('#stats .stat');if(!s)return;const r=s.getBoundingClientRect(),el=document.createElement('div');el.className='fly '+(profit>=0?'pos':'neg');
  el.textContent=`${profit>=0?'+':'−'}${money(Math.abs(profit))}`;el.setAttribute('aria-hidden','true');el.style.left=Math.round(r.left+r.width/2)+'px';el.style.top=Math.round(r.bottom)+'px';document.body.appendChild(el);setTimeout(()=>el.remove(),1900);}
/* lansman anı (v177): kategori simgesi ve rengi, canlanan basın puanı halkası, iki kurgusal yayının alıntısı,
   rakiplere göre yerin, rakibin karşı kampanyası, fiyat ve marj. ~6 sn ekranda kalır (ilerleme çubuğu), tıklayınca kapanır. */
const LM_Q={hi:LANG_EN?['Best in class.','A must-have.','Sets a new standard.']:['Sınıfının en iyisi.','Kaçırılmayacak bir ürün.','Çıtayı yükseltiyor.'],
  mid:LANG_EN?['Solid, if unspectacular.','Good value for the money.','Does what it promises.']:['Sağlam ama sıradan.','Fiyatına göre iyi.','Vaat ettiğini yapıyor.'],
  lo:LANG_EN?['Rough around the edges.','Not quite there yet.','Hard to recommend.']:['Pürüzleri çok.','Henüz olgunlaşmamış.','Önermek zor.']};
function launchMoment(p){if(!p||p.owner!=='P')return;OV.cheer=performance.now()+3500;if(!feelOn()||UI.modal)return;const old=document.getElementById('lmom');if(old)old.remove();
  const rv=p.review||0,band=rv>=8?'hi':rv>=5.5?'mid':'lo',txt=rv>=8?(LANG_EN?"The press loved it!":'Basın bayıldı!'):rv>=6.5?(LANG_EN?"Well received":'Olumlu karşılandı'):rv>=5?(LANG_EN?"Mixed reactions":'Karışık tepkiler'):(LANG_EN?"The press was harsh":'Basın sert davrandı');
  const id=Math.abs(+p.id||0),q=[0,1].map(k=>{const o=OUTLETS[(id+k*2)%OUTLETS.length],sc=Math.max(1,Math.min(10,Math.round((rv+(k?-0.6:0.4))*2)/2));return {o,sc,t:LM_Q[band][(id+k)%3]};});
  const rivals=G.products.filter(x=>x.active&&x.owner!=='P'&&x.cat===p.cat).sort((a,b)=>b.score-a.score),best=rivals[0];
  const rank=1+rivals.filter(x=>x.score>p.score).length,counter=rivals.find(x=>x.camp===G.day+30),cc=comp(counter&&counter.owner);
  const hw=isHW(p),uc=hw?estUC(p.cat,p.spec,p.plan&&p.plan.site):p.unitCost,margin=p.price>0&&uc!=null?(p.price-uc)/p.price:null;
  const posTxt=!best?(LANG_EN?'No rival in this category yet: the market is yours.':'Bu kategoride henüz rakip yok: pazar senin.'):rank===1?(LANG_EN?`#1 in its class, ahead of ${esc(best.name)}.`:`Sınıfında 1 numara; ${esc(best.name)} geride.`):(LANG_EN?`#${rank} of ${rivals.length+1} in its class; leader: ${esc(best.name)}.`:`Sınıfında ${rivals.length+1} ürün arasında ${rank}. sırada; lider: ${esc(best.name)}.`);
  const el=document.createElement('div');el.id='lmom';el.className='lmom '+(rv>=6.5?'good':rv>=5?'mid':'bad');el.setAttribute('role','status');el.style.setProperty('--cc',typeof deskCC==='function'?deskCC(p.cat):'var(--accent)');
  const R=44,C=2*Math.PI*R;
  el.innerHTML=`<div class="lm-card lm2"><div class="lm-top"><span class="lm-ic" aria-hidden="true">${CAT_ICON[p.cat]||''}</span><div class="lm-id"><span class="eyebrow">${LANG_EN?'Launch':'Lansman'} · ${esc(CATS[p.cat].n)}</span><b class="lm-n">${esc(p.name)}</b></div></div>
    <div class="lm-mid"><div class="lm-gauge"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--soft)" stroke-width="8"/><circle class="lm-arc" cx="50" cy="50" r="${R}" fill="none" stroke-width="8" stroke-linecap="round" stroke-dasharray="${reduceMotion()?(C*rv/10).toFixed(1):0} ${C.toFixed(1)}" transform="rotate(-90 50 50)"/></svg><span class="lm-s"><span class="lm-v num">${reduceMotion()?fx(rv,1):'0,0'}</span><small>/10</small></span></div>
      <div class="lm-side"><span class="lm-t">${txt}</span>${q.map(x=>`<div class="lm-q"><b>${esc(x.o)}</b> <span class="num">${fx(x.sc,1)}</span><div>“${esc(x.t)}”</div></div>`).join('')}</div></div>
    <div class="lm-facts"><span>${posTxt}</span>${cc?`<span class="neg">${LANG_EN?`${esc(cc.name)} hit back with an ad campaign for ${esc(counter.name)}.`:`${esc(cc.name)}, ${esc(counter.name)} için karşı reklam kampanyası başlattı.`}</span>`:''}<span class="num">${LANG_EN?'Price':'Fiyat'} ${money(p.price)}${margin!=null&&hw?` · ${LANG_EN?'margin':'marj'} %${Math.round(margin*100)}`:''}</span></div>
    <div class="lm-bar"><i></i></div></div>${rv>=8&&!reduceMotion()?'<canvas class="lm-cf" aria-hidden="true"></canvas>':''}`;
  document.body.appendChild(el);el.addEventListener('click',()=>el.remove());try{sfx(rv>=6.5?'ach':'click');}catch(e){}
  if(!reduceMotion()){const v=el.querySelector('.lm-v'),arc=el.querySelector('.lm-arc'),t0=performance.now();const step=t=>{const k=Math.min(1,(t-t0)/1100),e=1-Math.pow(1-k,3);v.textContent=fx(rv*e,1);arc.setAttribute('stroke-dasharray',`${(C*rv/10*e).toFixed(1)} ${C.toFixed(1)}`);if(k<1&&el.isConnected)requestAnimationFrame(step);};requestAnimationFrame(step);}
  if(el.querySelector('.lm-cf'))feelConfetti(80);
  setTimeout(()=>{if(el.isConnected){el.classList.add('out');setTimeout(()=>el.remove(),300);}},6000);}
