/* ============================== MEDIA COMPANY ============================== */
/* Kendi teknoloji yayının. Aylık içerik bütçesi izleyiciyi büyütür; izleyici başına reklam geliri gelir.
   İzleyici arttıkça kendi ürünlerinin reklam kampanyaları ucuzlar (en çok %30).
   Tanıtım politikası: bağımsız yayın güvenilirlik kazanır; agresif tanıtım kendi ürünlerine çekicilik verir ama güvenilirliği,
   dolayısıyla izleyici büyümesini aşındırır. Yayın yıllık gelirinin 0,8 katına satılabilir. */
const MD_FOUND=500e3,MD_ARPU=0.09,MD_SRV=0.03,MD_BUD={low:{n:(LANG_EN?"Low":'Az'),v:60e3},mid:{n:(LANG_EN?"Medium":'Orta'),v:180e3},high:{n:(LANG_EN?"High":'Çok'),v:450e3}};
const MD_PROMO={0:{n:(LANG_EN?"Independent":'Bağımsız'),q:1.2,a:0},1:{n:(LANG_EN?"Balanced":'Dengeli'),q:-0.3,a:0.015},2:{n:(LANG_EN?"Aggressive":'Agresif'),q:-2.2,a:0.04}};
const mdOn=()=>!!(G.md&&G.md.on);
const mdAudF=()=>mdOn()?Math.min(1,G.md.aud/3e6):0;
const mdDisc=()=>1-0.3*mdAudF();
const mdApp=()=>mdOn()?1+MD_PROMO[G.md.promo||0].a*mdAudF():1;
const mdRev=()=>mdOn()?G.md.aud*MD_ARPU*infl():0;
/* gider: içerik bütçesi + izleyici başına dağıtım ve sunucu (büyük yayın daha pahalı) */
const mdCost=()=>mdOn()?(MD_BUD[G.md.bud||'mid'].v+G.md.aud*MD_SRV)*infl():0;
const mdValue=()=>mdOn()?Math.max(0,G.md.lastRev||0)*12*0.8:0;
function mdMonthly(){const M=G.md;if(!M||!M.on)return;
  const B=MD_BUD[M.bud||'mid'].v,tgt=B/1e3*14000*(0.4+M.q/100)*(1+years()*0.05)*(0.7+G.brand/170);
  M.aud=Math.max(0,M.aud+(tgt-M.aud)*0.12);M.q=clamp(M.q+MD_PROMO[M.promo||0].q,5,100);
  const rev=mdRev(),cost=mdCost();G.cash+=rev;G.month.rev+=rev;spend(cost,'other');addPas(rev-cost);M.lastRev=rev;M.lastCost=cost;
  (M.h=M.h||[]).push(Math.round(M.aud/1e3));if(M.h.length>36)M.h.shift();
  if(M.q<30&&!M.warnQ){M.warnQ=1;news((LANG_EN?`${M.name} readers think the publication praises your products too much; credibility has dropped.`:`${M.name} okurları yayının senin ürünlerini fazla övdüğünü düşünüyor; güvenilirlik düştü.`),'bad',true);}
  if(M.q>=45)M.warnQ=0;}
function mdAct(a,ds){const M=G.md;
  if(a==='mdfound'){if(mdOn())return;if(G.cash<MD_FOUND*infl()){showToast((LANG_EN?"Not enough cash to found the publication.":'Yayını kurmak için yeterli nakit yok.'),'bad');return;}spend(MD_FOUND*infl(),'capex');
    G.md={on:true,name:(LANG_EN?`${G.name.split(' ')[0]} Tech`:`${G.name.split(' ')[0]} Tekno`),aud:20e3,q:60,bud:'mid',promo:0,h:[],s:G.day};news((LANG_EN?`${G.md.name} has started publishing.`:`${G.md.name} yayın hayatına başladı.`),'good',true);return;}
  if(!M||!M.on)return;
  if(a==='mdbud'&&MD_BUD[ds.k])M.bud=ds.k;
  else if(a==='mdpromo'&&MD_PROMO[ds.k])M.promo=+ds.k;
  else if(a==='mdsell'){const v=mdValue();G.cash+=v;news((LANG_EN?`${M.name} sold for ${money(v)}.`:`${M.name} ${money(v)} karşılığında satıldı.`),'good',true);G.md={on:false,sold:G.day};}}
function vMedia(){const M=G.md;
  if(!mdOn())return (LANG_EN?`<section class="panel"><div class="ph"><h2>Media company${helpBtn('media')}</h2></div><div class="pb col" style="gap:8px">
    <p class="small" style="margin:0">Found your own tech publication: news, reviews and videos. As the audience grows, ad revenue comes in and your own products' ad campaigns get cheaper. If you use the publication to praise your own products, its credibility drops.</p>
    ${M&&M.sold?`<div class="small muted">Your previous publication was sold on ${fmtDate(M.sold)}.</div>`:''}
    <div class="row"><button class="btn primary" data-act="mdfound" ${G.cash<MD_FOUND*infl()?'disabled':''}>Found publication · ${money(MD_FOUND*infl())}</button></div></div></section>`:`<section class="panel"><div class="ph"><h2>Medya şirketi${helpBtn('media')}</h2></div><div class="pb col" style="gap:8px">
    <p class="small" style="margin:0">Kendi teknoloji yayınını kur: haberler, incelemeler ve videolar. İzleyici büyüdükçe reklam geliri gelir ve kendi ürünlerinin reklam kampanyaları ucuzlar. Yayını kendi ürünlerini övmek için kullanırsan güvenilirliği düşer.</p>
    ${M&&M.sold?`<div class="small muted">Önceki yayının ${fmtDate(M.sold)} tarihinde satıldı.</div>`:''}
    <div class="row"><button class="btn primary" data-act="mdfound" ${G.cash<MD_FOUND*infl()?'disabled':''}>Yayını kur · ${money(MD_FOUND*infl())}</button></div></div></section>`);
  const rev=M.lastRev||0,cost=M.lastCost||mdCost(),net=rev-cost;
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>${esc(M.name)}${helpBtn('media')}</h2><span class="sub">since ${fmtDate(M.s)}</span></div>
    <div class="kpis" style="border-top:0"><div class="kpi"><span>Audience</span><b>${num(M.aud)}</b></div><div class="kpi"><span>Credibility</span><b class="${M.q<35?'neg':M.q>70?'pos':''}">${Math.round(M.q)}/100</b></div><div class="kpi"><span>Ad revenue/mo</span><b class="pos">${money(rev)}</b></div><div class="kpi"><span>Net/mo</span><b class="${net>=0?'pos':'neg'}">${money(net)}</b></div></div>
    <div class="pb col" style="gap:10px">${(M.h||[]).length>1?`<div><span class="small muted">Audience (thousands)</span>${spark(M.h,180,32)}</div>`:''}
      <div class="row" style="gap:6px;flex-wrap:wrap"><span class="small">Content budget:</span>${Object.entries(MD_BUD).map(([k,B])=>`<button class="btn sm ${M.bud===k?'primary':''}" data-act="mdbud" data-k="${k}" aria-pressed="${M.bud===k}">${esc(B.n)} · ${money(B.v*infl())}/mo</button>`).join('')}</div>
      <div class="row" style="gap:6px;flex-wrap:wrap"><span class="small">Promotion policy:</span>${Object.entries(MD_PROMO).map(([k,P])=>`<button class="btn sm ${String(M.promo||0)===k?'primary':''}" data-act="mdpromo" data-k="${k}" aria-pressed="${String(M.promo||0)===k}">${esc(P.n)}</button>`).join('')}</div>
      <div class="small muted">Distribution and server cost ${money(M.aud*MD_SRV*infl())}/mo · your own ad campaigns are ${Math.round((1-mdDisc())*100)}% cheaper${mdApp()>1?` · product appeal +${fx((mdApp()-1)*100,1)}%`:''} · credibility ${MD_PROMO[M.promo||0].q>0?"rising":"falling"}.</div>
      <div class="row"><button class="btn sm ghost" data-act="mdsell">Sell publication · ${money(mdValue())}</button></div></div></section>`:`<section class="panel"><div class="ph"><h2>${esc(M.name)}${helpBtn('media')}</h2><span class="sub">${fmtDate(M.s)} tarihinden beri</span></div>
    <div class="kpis" style="border-top:0"><div class="kpi"><span>İzleyici</span><b>${num(M.aud)}</b></div><div class="kpi"><span>Güvenilirlik</span><b class="${M.q<35?'neg':M.q>70?'pos':''}">${Math.round(M.q)}/100</b></div><div class="kpi"><span>Reklam geliri/ay</span><b class="pos">${money(rev)}</b></div><div class="kpi"><span>Net/ay</span><b class="${net>=0?'pos':'neg'}">${money(net)}</b></div></div>
    <div class="pb col" style="gap:10px">${(M.h||[]).length>1?`<div><span class="small muted">İzleyici (bin)</span>${spark(M.h,180,32)}</div>`:''}
      <div class="row" style="gap:6px;flex-wrap:wrap"><span class="small">İçerik bütçesi:</span>${Object.entries(MD_BUD).map(([k,B])=>`<button class="btn sm ${M.bud===k?'primary':''}" data-act="mdbud" data-k="${k}" aria-pressed="${M.bud===k}">${esc(B.n)} · ${money(B.v*infl())}/ay</button>`).join('')}</div>
      <div class="row" style="gap:6px;flex-wrap:wrap"><span class="small">Tanıtım politikası:</span>${Object.entries(MD_PROMO).map(([k,P])=>`<button class="btn sm ${String(M.promo||0)===k?'primary':''}" data-act="mdpromo" data-k="${k}" aria-pressed="${String(M.promo||0)===k}">${esc(P.n)}</button>`).join('')}</div>
      <div class="small muted">Dağıtım ve sunucu gideri ${money(M.aud*MD_SRV*infl())}/ay · kendi reklam kampanyaların %${Math.round((1-mdDisc())*100)} ucuz${mdApp()>1?` · ürünlerine çekicilik +%${fx((mdApp()-1)*100,1)}`:''} · güvenilirlik ${MD_PROMO[M.promo||0].q>0?'artıyor':'azalıyor'}.</div>
      <div class="row"><button class="btn sm ghost" data-act="mdsell">Yayını sat · ${money(mdValue())}</button></div></div></section>`);}
