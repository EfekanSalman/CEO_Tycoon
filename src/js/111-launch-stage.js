/* ============================== LAUNCH STAGE ============================== */
function stFacts(p){const v=p.score/S(p.cat),ref=CATS[p.cat].ref,free=p.cat==='app'&&pmOf(p)!=='paid',val=free?1.2:ref?ref*Math.pow(v,1.2)/Math.max(p.price,0.01):1,E=ecoLinks();
  const big=myActive().filter(x=>x.id!==p.id).reduce((a,x)=>a+(isHW(x)?x.sr*30:x.units),0);
  return {v,val,free,eco:E.n,bugs:Math.round(p.bugs||0),rv:p.review||6,big,brand:G.brand,next:G.projects.length>0,hw:HW.includes(p.cat)};}
function stFeat(p,F){const L=[
    {k:'perf',n:(LANG_EN?"Performance":'Performans'),t:(LANG_EN?`Freshness ${Math.round(F.v*100)}%: ${F.v>=1.08?"ahead of rivals":F.v>=0.97?"on par with the market":"behind the market"}`:`Güncellik %${Math.round(F.v*100)}: ${F.v>=1.08?'rakiplerin önünde':F.v>=0.97?'pazarla başa baş':'pazarın gerisinde'}`),s:(F.v-1)*4+0.3},
    {k:'price',n:F.free?(LANG_EN?"Free":'Ücretsiz'):(LANG_EN?"Price & value":'Fiyat ve değer'),t:F.free?(LANG_EN?"Anyone can use it for free":'Herkes ücretsiz kullanabilir'):(LANG_EN?`Price ${money(p.price)}: ${F.val>=1.1?"cheap for its quality":F.val>=0.92?"fairly priced":"pricey for its quality"}`:`Fiyat ${money(p.price)}: ${F.val>=1.1?'kalitesine göre ucuz':F.val>=0.92?'makul':'kalitesine göre pahalı'}`),s:(F.val-1)*3+0.2},
    {k:'design',n:(LANG_EN?"Design & usability":'Tasarım ve kullanım'),t:(LANG_EN?`Expected press score ${fx(F.rv,1)}/10`:`Basın beklentisi ${fx(F.rv,1)}/10`),s:(F.rv-6.8)/2.5},
    {k:'eco',n:(LANG_EN?"Ecosystem":'Ekosistem'),t:(LANG_EN?`${F.eco} active ecosystem links`:`${F.eco} aktif ekosistem bağlantısı`),s:F.eco>=3?0.9:F.eco>=2?0.5:F.eco>=1?0.05:-0.6}];
  if(p.cat==='phone'||p.cat==='xr')L.push({k:'cam',n:p.cat==='xr'?(LANG_EN?"Display":'Görüntü'):(LANG_EN?"Camera":'Kamera'),t:(LANG_EN?"Component quality":'Parça kalitesi'),s:p.spec&&p.spec[p.cat==='xr'?'optic':'camera']!=null?(p.spec[p.cat==='xr'?'optic':'camera']-1)*0.35:0});
  if(BI_BIZ.includes(p.cat))L.push({k:'sec',n:(LANG_EN?"Security & enterprise":'Güvenlik ve kurumsal'),t:(LANG_EN?`Security level ${Math.round(secScore())}/100`:`Güvenlik seviyesi ${Math.round(secScore())}/100`),s:(secScore()-50)/60});
  return L;}
function stBeats(p,F){const fs=stFeat(p,F).sort((a,b)=>b.s-a.s);const pickF=[fs[0],fs[fs.length-1],fs[1]].filter((x,i,a)=>x&&a.indexOf(x)===i).sort(()=>Math.random()-0.5);
  const failP=clamp(0.05+F.bugs/140+(p.debt||0)/400,0.05,0.6);
  return [
    {t:(LANG_EN?"Opening":'Açılış'),q:(LANG_EN?"The lights dim, the hall goes quiet. How do you open?":'Işıklar sönüyor, salon sessiz. Nasıl açıyorsun?'),o:[
      {n:(LANG_EN?"Tell the company's story":'Şirketin hikâyesini anlat'),d:F.brand<20?(LANG_EN?"A good intro for those who don't know you yet.":'Seni henüz tanımayanlar için iyi bir giriş.'):(LANG_EN?"A safe, warm start.":'Güvenli, sıcak bir başlangıç.'),fx:()=>F.brand<20?10:6},
      {n:(LANG_EN?"Open with numbers":'Rakamlarla başla'),d:(LANG_EN?"Show user and sales figures. Impressive if your numbers are big.":'Kullanıcı ve satış rakamlarını göster. Büyük rakamların varsa etkileyici.'),fx:()=>F.big>=2e5?13:F.big>=3e4?6:-5},
      {n:(LANG_EN?"Bring a surprise guest on stage":'Sahneye sürpriz bir konukla çık'),d:(LANG_EN?"Risky but memorable. Less impact if there was a leak.":'Riskli ama akılda kalıcı. Sızıntı varsa etkisi azalır.'),fx:()=>Math.random()<(p.waitLaunch&&p.waitLaunch.leaked?0.4:0.6)?15:-7}]},
    {t:(LANG_EN?"Headline feature":'Öne çıkan özellik'),q:(LANG_EN?`Which feature of ${p.name} will you highlight? Check the product card.`:`${p.name} için hangi özelliği öne çıkarıyorsun? Ürün kartına bak.`),card:fs.map(x=>`${x.n}: ${x.t}`),o:pickF.map(f=>({n:f.n,d:f.t,fx:()=>f===fs[0]?17:f.s>0.15?7:-9,fk:f.k}))},
    {id:'demo',t:(LANG_EN?"Live demo":'Canlı demo'),q:(LANG_EN?`The product has ${F.bugs} open bugs. How should the demo go?`:`Ürünün ${F.bugs} açık hatası var. Demo nasıl olsun?`),o:[
      {n:(LANG_EN?"Do a live demo":'Canlı demo yap'),d:(LANG_EN?`If it works, the crowd goes wild; roughly ${Math.round(failP*100)}% chance of a crash.`:`Başarılı olursa salon coşar; çökme ihtimali yaklaşık %${Math.round(failP*100)}.`),fx:S=>{if(Math.random()<failP){S.crash=1;return -22;}return 18;}},
      {n:(LANG_EN?"Show a pre-recorded video":'Önceden kaydedilmiş video göster'),d:(LANG_EN?"Safe but less exciting.":'Güvenli ama daha az heyecan verici.'),fx:()=>5},
      {n:(LANG_EN?"Skip the demo, go to pricing":'Demoyu atla, fiyata geç'),d:(LANG_EN?"You save time; the crowd cools off a bit.":'Zaman kazanırsın, salon biraz soğur.'),fx:()=>-2}]},
    {t:(LANG_EN?"Closing":'Kapanış'),q:(LANG_EN?"Final slide. How do you wrap up?":'Son slayt. Nasıl bitiriyorsun?'),o:[
      {n:(LANG_EN?"\"One more thing…\"":'"Bir şey daha…"'),d:F.next?(LANG_EN?"Give a quick peek at your next product in development.":'Gelişmekte olan bir sonraki ürününü kısaca göster.'):(LANG_EN?"You need something else to show, or it falls flat.":'Gösterecek başka bir şeyin olmalı; yoksa havada kalır.'),fx:S=>{if(F.next){S.omt=1;return 14;}return -8;}},
      {n:F.free?(LANG_EN?"Announce it's free, start downloads":'Ücretsiz olduğunu açıkla, indirmeyi başlat'):(LANG_EN?"Announce the price, open preorders":'Fiyatı açıkla, ön siparişi başlat'),d:F.free?(LANG_EN?"Always goes over well for free products.":'Ücretsiz ürünlerde her zaman iyi karşılanır.'):F.val>=1?(LANG_EN?"The price is good for the quality; the crowd loves that.":'Fiyatın kalitesine göre iyi; salon bunu sever.'):(LANG_EN?"The price is a bit high; applause may be limited.":'Fiyat biraz yüksek; alkış sınırlı kalabilir.'),fx:()=>F.val>=1.05?11:F.val>=0.92?5:-3},
      {n:(LANG_EN?"Surprise: 10% off the first month":'Sürpriz: ilk ay %10 indirim'),d:(LANG_EN?`Boosts excitement; you give up about ${money(stDiscCost(p))} in revenue.`:`Coşkuyu artırır; yaklaşık ${money(stDiscCost(p))} gelirden vazgeçersin.`),fx:S=>{S.disc=1;return 13;}}]}];}
function stDiscCost(p){return Math.round((p.preDem||estUnits(p.cat,p.score,p.price)/30)*30*p.price*0.1/1000)*1000;}
const stGrade=h=>h>=85?[(LANG_EN?"Legendary":'Efsanevi'),'pos']:h>=68?[(LANG_EN?"Excellent":'Çok iyi'),'pos']:h>=50?[(LANG_EN?"Good":'İyi'),'']:h>=32?[(LANG_EN?"Mediocre":'Vasat'),'warn']:[(LANG_EN?"Flop":'Fiyasko'),'neg'];
const stMood=h=>h>=85?'🤩':h>=68?'😃':h>=50?'🙂':h>=32?'😐':'😬';
const STR={up:[(LANG_EN?"The hall erupts in applause.":'Salon alkışlarla inliyor.'),(LANG_EN?"Whistles and cheers from the front rows.":'Ön sıralardan ıslıklar ve tezahürat geliyor.'),(LANG_EN?"The launch is the top trending topic on social media.":'Sosyal medyada lansman gündemin ilk sırasına çıktı.')],mid:[(LANG_EN?"Polite applause.":'Kibar bir alkış.'),(LANG_EN?"The audience is taking notes.":'Seyirciler not alıyor.'),(LANG_EN?"Journalists are nodding.":'Gazeteciler başını sallıyor.')],down:[(LANG_EN?"A few people are checking their phones.":'Birkaç kişi telefonuna bakıyor.'),(LANG_EN?"There's a murmur in the hall.":'Salonda bir uğultu var.'),(LANG_EN?"People are yawning in the back rows.":'Arka sıralarda esneyenler var.')]};
function stStart(p,ev){const F=stFacts(p),mk=G.emps.filter(e=>e.role==='mkt'&&!e.leave).reduce((a,e)=>a+e.skill,0);
  if(G.stage)stFinish(true);
  G.stage={pid:p.id,ev:{...ev},d:G.day,i:0,h:Math.round(clamp(40+Math.min(10,mk*0.5)+(ev.t==='keynote'?5:0)-(ev.leaked?10:0)+(ceoSk('m1')?8:0),20,70)),log:[],F};
  G.prevSpeed=G.speed||G.prevSpeed||1;G.speed=0;openModal('stage');}
function stBeatsOf(){const S=G.stage,p=prod(S.pid);if(!p)return null;if(!UI.stBeats||UI.stBeats.pid!==S.pid||UI.stBeats.d!==S.d){UI.stBeats={pid:S.pid,d:S.d,b:stBeats(p,S.F)};}return UI.stBeats.b;}
function stAnswer(j){const S=G.stage;if(!S)return;const B=stBeatsOf();if(!B||S.i>=B.length)return;const b=B[S.i],o=b.o[j];if(!o)return;
  const dh=Math.round(o.fx(S));S.h=clamp(S.h+dh,0,100);const pool=dh>=10?STR.up:dh>=0?STR.mid:STR.down;
  S.log.push({t:b.t,a:o.n,dh,r:S.crash&&b.id==='demo'?(LANG_EN?"The demo crashed! The screen froze and the hall went ice cold.":'Demo çöktü! Ekran dondu, salon buz kesti.'):pick(pool)});S.i++;sfx(dh>=0?'good':'bad');}
function stFinish(auto){const S=G.stage;if(!S)return;G.stage=null;UI.stBeats=null;const p=prod(S.pid);if(!p)return;
  if(auto&&S.i===0){doLaunch(p,{...S.ev,auto:1});return;}
  (G.stH=G.stH||[]).push({d:G.day,H:S.h});if(G.stH.length>20)G.stH.shift();
  const H=S.h,sm=0.85+H/100*0.4,[g]=stGrade(H),k=S.ev.t==='keynote'?1:0.6;
  if(S.disc){const c=stDiscCost(p);G.cash-=c;G.month.rev-=c;}
  if(H>=75&&p.review!=null)p.review=Math.min(10,Math.round((p.review+0.3)*10)/10);else if(H<=30&&p.review!=null)p.review=Math.max(1,Math.round((p.review-0.3)*10)/10);
  brAdd(p,(H-50)/25*k);
  if(S.omt){G.flags=G.flags||{};G.flags.omt=true;}
  if(H>=85)(G.flags=G.flags||{}).stageLegend=true;
  doLaunch(p,{...S.ev,stage:{sm,crash:!!S.crash,H,g}});
}
function stDaily(){const S=G.stage;if(!S)return;if(G.day-S.d>=3){stFinish(true);if(UI.modal&&UI.modal.kind==='stage')closeModal();return;}if(!UI.modal&&!G.pending)openModal('stage');}
function vStageModal(){const S=G.stage;if(!S)return '';const p=prod(S.pid),B=stBeatsOf();if(!p||!B)return '';const T=LTIER[S.ev.t],done=S.i>=B.length,b=B[S.i],[g,gc]=stGrade(S.h);
  const dots=B.map((x,i)=>`<span class="st-dot${i<S.i?' on':''}${i===S.i&&!done?' cur':''}" title="${x.t}"></span>`).join('');
  const meter=(LANG_EN?`<div class="st-meter" role="meter" aria-label="Crowd excitement" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(S.h)}"><span class="st-mood" aria-hidden="true">${stMood(S.h)}</span><div class="st-bar"><i style="width:${S.h}%"></i></div><b class="num">${Math.round(S.h)}</b></div>`:`<div class="st-meter" role="meter" aria-label="Salonun coşkusu" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(S.h)}"><span class="st-mood" aria-hidden="true">${stMood(S.h)}</span><div class="st-bar"><i style="width:${S.h}%"></i></div><b class="num">${Math.round(S.h)}</b></div>`);
  const log=S.log.length?`<div class="st-log">${S.log.map(l=>`<div><span class="small muted">${l.t}: ${esc(l.a)}</span> <b class="${l.dh>=0?'pos':'neg'} num">${l.dh>=0?'+':''}${l.dh}</b><div class="small">${esc(l.r)}</div></div>`).join('')}</div>`:'';
  const head=`<div class="st-stage"><div class="st-spot" aria-hidden="true"></div><div class="eyebrow" style="color:#FFB27A">${T.n} · ${fmtDate(G.day)}</div><div class="st-title">${G.bi&&G.bi.lg?biSVG(G.bi.lg,G.name,34):''}<span>${esc(p.name)}</span></div><div class="st-sub">${esc(G.name)} sunar${S.ev.leaked?(LANG_EN?" · little surprise effect due to the leak":' · sızıntı yüzünden sürpriz etkisi az'):''}</div><div class="row" style="gap:6px;justify-content:center">${dots}</div></div>`;
  if(done){const sm=0.85+S.h/100*0.4;
    return (LANG_EN?`${head}<h2>${stMood(S.h)} Launch result: <span class="${gc}">${g}</span></h2>${meter}${log}
      <div class="kv"><span>Appeal effect</span><b>×${fx(sm,2)}</b><span>Brand</span><b class="${S.h>=50?'pos':'neg'}">${S.h>=50?'+':'−'}${fx(Math.abs((S.h-50)/25*(S.ev.t==='keynote'?1:0.6)),1)}</b>${S.h>=75?"<span>Press score</span><b class=\"pos\">+0.3</b>":S.h<=30?"<span>Press score</span><b class=\"neg\">−0.3</b>":''}${S.disc?`<span>First-month discount</span><b class="neg">−${money(stDiscCost(p))}</b>`:''}</div>
      <div class="row"><button class="btn primary" data-act="stend">Finish launch</button></div>`:`${head}<h2>${stMood(S.h)} <span class="${gc}">${g}</span> bir lansman</h2>${meter}${log}
      <div class="kv"><span>Çekicilik etkisi</span><b>×${fx(sm,2)}</b><span>Marka</span><b class="${S.h>=50?'pos':'neg'}">${S.h>=50?'+':'−'}${fx(Math.abs((S.h-50)/25*(S.ev.t==='keynote'?1:0.6)),1)}</b>${S.h>=75?'<span>Basın puanı</span><b class="pos">+0,3</b>':S.h<=30?'<span>Basın puanı</span><b class="neg">−0,3</b>':''}${S.disc?`<span>İlk ay indirimi</span><b class="neg">−${money(stDiscCost(p))}</b>`:''}</div>
      <div class="row"><button class="btn primary" data-act="stend">Lansmanı tamamla</button></div>`);}
  return (LANG_EN?`${head}${meter}<div class="st-slide"><div class="small muted">Step ${S.i+1}/${B.length} · ${b.t}</div><b>${esc(b.q)}</b>${b.card?`<ul class="st-card">${b.card.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`:''}</div>
    <div class="col">${b.o.map((o,j)=>`<button class="opt" data-act="stans" data-i="${j}"><b>${esc(o.n)}</b><span>${esc(o.d)}</span></button>`).join('')}</div>${log}
    <div class="row between"><span class="small muted">Game paused.</span><button class="btn sm ghost" data-act="stskip">Skip the stage (auto-present)</button></div>`:`${head}${meter}<div class="st-slide"><div class="small muted">Adım ${S.i+1}/${B.length} · ${b.t}</div><b>${esc(b.q)}</b>${b.card?`<ul class="st-card">${b.card.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`:''}</div>
    <div class="col">${b.o.map((o,j)=>`<button class="opt" data-act="stans" data-i="${j}"><b>${esc(o.n)}</b><span>${esc(o.d)}</span></button>`).join('')}</div>${log}
    <div class="row between"><span class="small muted">Oyun duraklatıldı.</span><button class="btn sm ghost" data-act="stskip">Sahneyi atla (otomatik sun)</button></div>`);}

