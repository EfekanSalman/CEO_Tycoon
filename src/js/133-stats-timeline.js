/* ============================== STATS & TIMELINE ============================== */
const TL_IC={prod:['◆','var(--ch1)'],star:['★','var(--warn)'],money:['$','var(--ok)'],ipo:['▲','var(--ok)'],office:['⌂','var(--ink)'],globe:['◎','var(--ch1)'],acq:['+','var(--ch2)'],factory:['▣','var(--ink)'],law:['§','var(--ink)'],ach:['✦','var(--warn)'],rival:['✕','var(--muted)'],bad:['!','var(--bad)'],val:['↑','var(--ok)'],emp:['☺','var(--ink)'],launch:['◉','var(--ch2)'],leaf:['❦','var(--ok)'],shop:['▤','var(--ch2)'],fair:['✧','var(--ch1)'],data:['◍','var(--ink)'],board:['§','var(--ch2)'],era:['◷','var(--ch1)']};
const TL_GROUP={prod:'urun',star:'urun',launch:'urun',money:'sirket',ipo:'sirket',office:'sirket',globe:'sirket',acq:'sirket',factory:'sirket',law:'sirket',ach:'sirket',val:'sirket',emp:'sirket',bad:'sirket',leaf:'sirket',shop:'sirket',fair:'urun',data:'sirket',board:'sirket',era:'sirket',rival:'rakip'};
function tl(k,t){if(!G)return;G.tl=G.tl||[];G.tl.push({d:G.day,k,t});if(G.tl.length>300)G.tl.shift();}
/* Kayıt boyutu için: rakip değerleri (cs) yalnızca son 13 kayıtta tutulur (12 ay önceki sıralama için);
   36 aydan eski kayıtlar çeyreklik (ocak, nisan, temmuz, ekim) seyreltilir; ilk kayıt ve zirve değerleme korunur. */
const ST_FULL=36,ST_CS=13;
function statsThin(){const S=G.stats;if(!S||S.length<2)return 0;const n=S.length;let c=0;
  for(let i=0;i<n-ST_CS;i++)if(S[i].cs){delete S[i].cs;c++;}
  if(n>ST_FULL){let pk=0;for(let i=1;i<n;i++)if(S[i].v>S[pk].v)pk=i;
    const keep=S.filter((s,i)=>i>=n-ST_FULL||i===0||i===pk||dateOf(s.d).getMonth()%3===0);if(keep.length<n){c+=n-keep.length;S.length=0;for(const s of keep)S.push(s);}}
  return c;}
function statsSnap(){
  G.stats=G.stats||[];const sh={};
  for(const c of CAT_ORDER){if(myActive(c).length)sh[c]=Math.round(myActive(c).reduce((a,p)=>a+p.share,0)*1000)/1000;}
  const cs={};for(const c of liveComps())cs[c.id]=[Math.round(compVal(c)),Math.round(c.profit),c.emp,Math.round(c.brand)];
  const v=valuation();G.stats.push({d:G.day,v:Math.round(v),e:G.emps.length,b:Math.round(G.brand*10)/10,sh,cs});if(G.stats.length>240)G.stats.shift();statsThin();
  G.ms=G.ms||{};for(const t of [1e6,1e7,1e8,1e9,1e10])if(v>=t&&!G.ms['v'+t]){G.ms['v'+t]=1;ceoXP(40+Math.log10(t)*10,(LANG_EN?`Valuation passed ${money(t)}`:`Değerleme ${money(t)} sınırını aştı`));tl('val',(LANG_EN?`Valuation passed ${money(t)}`:`Değerleme ${money(t)} sınırını aştı`));}
  for(const n of [10,25,50,100,200])if(G.emps.length>=n&&!G.ms['e'+n]){G.ms['e'+n]=1;tl('emp',(LANG_EN?`Team reached ${n} people`:`Ekip ${n} kişiye ulaştı`));}
}
const CHD={};
function lineChart(id,labels,series,opt={}){
  const n=labels.length;if(n<2)return `<div class="empty">${opt.empty||(LANG_EN?"The chart needs a few months of data.":'Grafik için birkaç ay veri gerekiyor.')}</div>`;
  const W=1000,H=opt.h||200;
  const all=series.flatMap(s=>s.v);let mn=Math.min(0,...all),mx=Math.max(...all,opt.minMax||1);if(mx===mn)mx=mn+1;
  const x=i=>W*i/(n-1),yp=v=>(1-(v-mn)/(mx-mn)),y=v=>H*yp(v);
  const fmt=opt.fmt||money,ticks=[mx,mn<0&&mx>0?0:null,mn].filter(v=>v!==null);
  CHD[id]={labels,series:series.map(s=>({n:s.n,c:s.c,v:s.v})),fmt,mn,mx,H};
  const lines=series.map(s=>{const pts=s.v.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    return (s.area?`<path d="M0,${y(Math.max(mn,0))} L${pts.join(' L')} L${W},${y(Math.max(mn,0))}Z" fill="${s.c}" opacity=".12"/>`:'')+`<polyline points="${pts.join(' ')}" fill="none" stroke="${s.c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;}).join('');
  const xl=[0,Math.floor((n-1)/2),n-1];
  return (LANG_EN?`<div class="chbox" data-ch="${id}" tabindex="0" aria-label="${esc(opt.label||"Graphics")}: use the arrow keys to move between months">
    <div class="chplot"><div class="chy" aria-hidden="true">${ticks.map(v=>`<span style="top:${(yp(v)*100).toFixed(2)}%">${fmt(v)}</span>`).join('')}</div>
    <div class="chp" style="height:${H}px"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="100%" height="${H}" role="img" aria-label="${esc(opt.label||"Graphics")}">
    ${ticks.map(v=>`<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" vector-effect="non-scaling-stroke" stroke-dasharray="${v===0?'0':'3 3'}"/>`).join('')}
    ${lines}</svg><div class="hov" aria-hidden="true"></div></div></div>
    <div class="chx" aria-hidden="true">${xl.map((i,k)=>`<span class="${k===0?'a':k===2?'z':''}" style="left:${(100*i/(n-1)).toFixed(2)}%">${esc(labels[i])}</span>`).join('')}</div>
  </div>
  ${series.length>1?`<div class="chleg">${series.map(s=>`<span><i style="background:${s.c}"></i>${esc(s.n)}</span>`).join('')}</div>`:''}`:`<div class="chbox" data-ch="${id}" tabindex="0" aria-label="${esc(opt.label||'Grafik')}: ok tuşlarıyla aylar arasında gezin">
    <div class="chplot"><div class="chy" aria-hidden="true">${ticks.map(v=>`<span style="top:${(yp(v)*100).toFixed(2)}%">${fmt(v)}</span>`).join('')}</div>
    <div class="chp" style="height:${H}px"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="100%" height="${H}" role="img" aria-label="${esc(opt.label||'Grafik')}">
    ${ticks.map(v=>`<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" vector-effect="non-scaling-stroke" stroke-dasharray="${v===0?'0':'3 3'}"/>`).join('')}
    ${lines}</svg><div class="hov" aria-hidden="true"></div></div></div>
    <div class="chx" aria-hidden="true">${xl.map((i,k)=>`<span class="${k===0?'a':k===2?'z':''}" style="left:${(100*i/(n-1)).toFixed(2)}%">${esc(labels[i])}</span>`).join('')}</div>
  </div>
  ${series.length>1?`<div class="chleg">${series.map(s=>`<span><i style="background:${s.c}"></i>${esc(s.n)}</span>`).join('')}</div>`:''}`);
}
function chHover(box,idx){
  const d=CHD[box.dataset.ch],p=box.querySelector('.chp'),hov=p&&p.querySelector('.hov');if(!d||!hov)return;
  const n=d.labels.length;idx=clamp(idx,0,n-1);box._idx=idx;
  const r=p.getBoundingClientRect(),X=(p.clientWidth||r.width)*idx/(n-1);
  hov.textContent='';
  const vl=document.createElement('div');vl.className='vl';vl.style.left=X+'px';vl.style.top='0';vl.style.height=d.H+'px';hov.appendChild(vl);
  for(const s of d.series){const v=s.v[idx],Y=d.H*(1-(v-d.mn)/(d.mx-d.mn));const dot=document.createElement('div');dot.className='dot';dot.style.left=X+'px';dot.style.top=Y+'px';dot.style.background=s.c;hov.appendChild(dot);}
  const tip=document.createElement('div');tip.className='tip';
  const h=document.createElement('div');h.textContent=d.labels[idx];h.style.color='var(--muted)';tip.appendChild(h);
  for(const s of d.series){const row=document.createElement('div');const k=document.createElement('span');k.className='k';k.style.background=s.c;const b=document.createElement('b');b.textContent=d.fmt(s.v[idx]);const nm=document.createElement('span');nm.textContent=' '+s.n;nm.style.color='var(--muted)';row.append(k,b,nm);tip.appendChild(row);}
  hov.appendChild(tip);const tw=tip.offsetWidth;tip.style.left=Math.max(0,X+12+tw>r.width?X-12-tw:X+12)+'px';tip.style.top='0';
}
function chHide(box){const hov=box&&box.querySelector('.hov');if(hov)hov.textContent='';}
let chLast=null;
document.addEventListener('pointermove',e=>{const box=e.target.closest&&e.target.closest('.chbox');if(chLast&&chLast!==box){chHide(chLast);chLast=null;}if(!box)return;const d=CHD[box.dataset.ch],p=box.querySelector('.chp');if(!d||!p)return;
  const r=p.getBoundingClientRect();chHover(box,Math.round((e.clientX-r.left)/r.width*(d.labels.length-1)));chLast=box;});
document.addEventListener('focusin',e=>{const box=e.target.closest&&e.target.closest('.chbox');if(box){const d=CHD[box.dataset.ch];if(d)chHover(box,box._idx!=null?box._idx:d.labels.length-1);}});
document.addEventListener('focusout',e=>{const box=e.target.closest&&e.target.closest('.chbox');if(box)chHide(box);});
document.addEventListener('keydown',e=>{const box=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('.chbox');if(!box)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();chHover(box,(box._idx||0)+(e.key==='ArrowRight'?1:-1));}},true);
function shareSpark(vals,c,max,lab){const n=vals.length;if(n<2)return (LANG_EN?"<div class=\"small muted\">Collecting data…</div>":'<div class="small muted">Veri birikiyor…</div>');const W=200,H=44,mx=Math.max(max||0,...vals,0.01);
  const pts=vals.map((v,i)=>`${(W*i/(n-1)).toFixed(1)},${(H-2-(H-4)*v/mx).toFixed(1)}`);
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="100%" height="44" style="display:block;overflow:visible" role="img" aria-label="${lab||(LANG_EN?"Market share trend":'Pazar payı eğilimi')}"><path d="M0,${H} L${pts.join(' L')} L${W},${H}Z" fill="${c}" opacity=".14"/><polyline points="${pts.join(' ')}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;}
function statsRange(){const st=G.stats||[],r=UI.statR||'all';return r==='1'?st.slice(-12):r==='3'?st.slice(-36):st;}
function vStatsCharts(){
  const st=statsRange(),r=UI.statR||'all',h=(G.hist||[]).filter(x=>!st.length||x.d>=st[0].d);
  const totRev=(G.hist||[]).reduce((a,x)=>a+x.rev,0),bestP=(G.hist||[]).reduce((a,x)=>Math.max(a,x.profit),0),peakV=(G.stats||[]).reduce((a,x)=>Math.max(a,x.v),0),launched=G.products.filter(p=>p.owner==='P'&&!p.acqId&&p.review!=null).length;
  const filt=(LANG_EN?`<div class="row" style="gap:6px;margin-bottom:12px" role="group" aria-label="Time range">${[['1',"Last 1 year"],['3',"Last 3 years"],['all',"All"]].map(([k,n])=>`<button class="btn sm ${r===k?'primary':''}" data-act="statr" data-k="${k}">${n}</button>`).join('')}</div>`:`<div class="row" style="gap:6px;margin-bottom:12px" role="group" aria-label="Zaman aralığı">${[['1','Son 1 yıl'],['3','Son 3 yıl'],['all','Tümü']].map(([k,n])=>`<button class="btn sm ${r===k?'primary':''}" data-act="statr" data-k="${k}">${n}</button>`).join('')}</div>`);
  const shareCats=CAT_ORDER.filter(c=>st.some(x=>x.sh&&x.sh[c]!=null));
  const sm=shareCats.map(c=>{const vals=st.map(x=>x.sh&&x.sh[c]||0),cur=vals[vals.length-1]||0,peak=Math.max(...vals);
    return (LANG_EN?`<div class="sm"><div class="row between small"><b>${CATS[c].n}</b><span><b class="num">${pct(cur,1)}</b> <span class="muted">peak ${pct(peak,0)}</span></span></div>${shareSpark(vals,'var(--ch1)',0.1)}</div>`:`<div class="sm"><div class="row between small"><b>${CATS[c].n}</b><span><b class="num">${pct(cur,1)}</b> <span class="muted">zirve ${pct(peak,0)}</span></span></div>${shareSpark(vals,'var(--ch1)',0.1)}</div>`);}).join('');
  const tbl=h.slice(-24).reverse().map(x=>`<tr><td>${fmtMonth(x.d)}</td><td class="r num">${money(x.rev)}</td><td class="r num ${x.profit>=0?'pos':'neg'}">${money(x.profit)}</td><td class="r num">${money(x.cash)}</td></tr>`).join('');
  return (LANG_EN?`${filt}<section class="panel"><div class="kpis" style="border-top:0">
      <div class="kpi"><span>Since founding</span><b>${Math.floor(G.day/365)} yr ${Math.floor(G.day%365/30)} mo</b></div>
      <div class="kpi"><span>Total revenue</span><b>${money(totRev)}</b></div>
      <div class="kpi"><span>Best month</span><b class="pos">${money(bestP)}</b></div>
      <div class="kpi"><span>Peak valuation</span><b>${money(peakV)}</b></div>
      <div class="kpi"><span>Products launched</span><b>${launched}</b></div></div></section>
    <section class="panel"><div class="ph"><h2>Monthly revenue and profit</h2><span class="sub">hover, or focus and use the arrow keys</span></div><div class="pb">
      ${lineChart('rev',h.map(x=>fmtMonth(x.d)),[{n:"Revenue",c:'var(--ch1)',v:h.map(x=>x.rev)},{n:'Kâr',c:'var(--ch2)',v:h.map(x=>x.profit)}],{label:"Monthly revenue and profit",empty:"Will be drawn once the first months close."})}
      ${tbl?`<details style="margin-top:10px"><summary class="small">Show as table</summary><div class="tw"><table><thead><tr><th>Month</th><th class="r">Revenue</th><th class="r">Profit</th><th class="r">Cash</th></tr></thead><tbody>${tbl}</tbody></table></div></details>`:''}</div></section>
    <div class="grid">
      <section class="panel"><div class="ph"><h2>Company valuation</h2></div><div class="pb">${lineChart('val',st.map(x=>fmtMonth(x.d)),[{n:"Valuation",c:'var(--ch1)',v:st.map(x=>x.v),area:true}],{label:"Valuation",h:180})}</div></section>
      <section class="panel"><div class="ph"><h2>Team size</h2></div><div class="pb">${lineChart('emp',st.map(x=>fmtMonth(x.d)),[{n:"Employee",c:'var(--ch1)',v:st.map(x=>x.e),area:true}],{label:"Headcount",h:180,fmt:v=>num(v)+" people"})}</div></section>
    </div>
    <section class="panel"><div class="ph"><h2>Cash</h2><span class="sub">month end</span></div><div class="pb">${lineChart('cash',h.map(x=>fmtMonth(x.d)),[{n:"Cash",c:'var(--ch1)',v:h.map(x=>x.cash),area:true}],{label:"Month-end cash",h:180})}</div></section>
    <div class="grid">
      <section class="panel"><div class="ph"><h2>Brand strength</h2></div><div class="pb">${lineChart('brand',st.map(x=>fmtMonth(x.d)),[{n:"Brand",c:'var(--ch1)',v:st.map(x=>x.b),area:true}],{label:"Brand",h:180,fmt:v=>fx(v,0),minMax:10})}</div></section>
      <section class="panel"><div class="ph"><h2>Your market share</h2><span class="sub">per category, selected period</span></div><div class="pb">${sm?`<div class="sm-grid">${sm}</div>`:"<div class=\"empty\">Your products will appear here once they launch.</div>"}</div></section>
    </div>`:`${filt}<section class="panel"><div class="kpis" style="border-top:0">
      <div class="kpi"><span>Kuruluştan bu yana</span><b>${Math.floor(G.day/365)} yıl ${Math.floor(G.day%365/30)} ay</b></div>
      <div class="kpi"><span>Toplam gelir</span><b>${money(totRev)}</b></div>
      <div class="kpi"><span>En iyi ay</span><b class="pos">${money(bestP)}</b></div>
      <div class="kpi"><span>Zirve değerleme</span><b>${money(peakV)}</b></div>
      <div class="kpi"><span>Çıkardığın ürün</span><b>${launched}</b></div></div></section>
    <section class="panel"><div class="ph"><h2>Aylık gelir ve kâr</h2><span class="sub">üzerine gel ya da odaklanıp ok tuşlarını kullan</span></div><div class="pb">
      ${lineChart('rev',h.map(x=>fmtMonth(x.d)),[{n:'Gelir',c:'var(--ch1)',v:h.map(x=>x.rev)},{n:'Kâr',c:'var(--ch2)',v:h.map(x=>x.profit)}],{label:'Aylık gelir ve kâr',empty:'İlk aylar kapanınca çizilecek.'})}
      ${tbl?`<details style="margin-top:10px"><summary class="small">Tablo olarak göster</summary><div class="tw"><table><thead><tr><th>Ay</th><th class="r">Gelir</th><th class="r">Kâr</th><th class="r">Nakit</th></tr></thead><tbody>${tbl}</tbody></table></div></details>`:''}</div></section>
    <div class="grid">
      <section class="panel"><div class="ph"><h2>Şirket değerlemesi</h2></div><div class="pb">${lineChart('val',st.map(x=>fmtMonth(x.d)),[{n:'Değerleme',c:'var(--ch1)',v:st.map(x=>x.v),area:true}],{label:'Değerleme',h:180})}</div></section>
      <section class="panel"><div class="ph"><h2>Ekip büyüklüğü</h2></div><div class="pb">${lineChart('emp',st.map(x=>fmtMonth(x.d)),[{n:'Çalışan',c:'var(--ch1)',v:st.map(x=>x.e),area:true}],{label:'Çalışan sayısı',h:180,fmt:v=>num(v)+' kişi'})}</div></section>
    </div>
    <section class="panel"><div class="ph"><h2>Nakit</h2><span class="sub">ay sonu</span></div><div class="pb">${lineChart('cash',h.map(x=>fmtMonth(x.d)),[{n:'Nakit',c:'var(--ch1)',v:h.map(x=>x.cash),area:true}],{label:'Ay sonu nakit',h:180})}</div></section>
    <div class="grid">
      <section class="panel"><div class="ph"><h2>Marka gücü</h2></div><div class="pb">${lineChart('brand',st.map(x=>fmtMonth(x.d)),[{n:'Marka',c:'var(--ch1)',v:st.map(x=>x.b),area:true}],{label:'Marka',h:180,fmt:v=>fx(v,0),minMax:10})}</div></section>
      <section class="panel"><div class="ph"><h2>Pazar payın</h2><span class="sub">kategori başına, seçili dönem</span></div><div class="pb">${sm?`<div class="sm-grid">${sm}</div>`:'<div class="empty">Ürünlerin piyasaya çıkınca burada görünecek.</div>'}</div></section>
    </div>`);
}
function vStatsCompare(){
  const live=liveComps(),me={id:'P',n:(LANG_EN?"You":'Sen'),v:valuation(),p:monthlyEst().profit,e:G.emps.length,b:G.brand};
  const rows=[me,...live.map(c=>({id:c.id,n:c.name,v:compVal(c),p:c.profit,e:c.emp,b:c.brand}))];
  const bars=(key,title,fmt,sub)=>{const list=rows.slice().sort((a,b)=>b[key]-a[key]).slice(0,10);if(!list.includes(me))list[list.length-1]=me;const mx=Math.max(...list.map(r=>Math.abs(r[key])),1);
    return `<section class="panel"><div class="ph"><h2>${title}</h2><span class="sub">${sub||''}</span></div><div class="pb">${list.map(r=>`<div class="hbar ${r.id==='P'?'me':''}" title="${esc(r.n)}: ${fmt(r[key])}"><span class="small" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.id==='P'?(LANG_EN?"<b>You</b>":'<b>Sen</b>'):esc(r.n)}</span><span class="tr"><i style="width:${Math.max(1,Math.abs(r[key])/mx*100)}%;background:${r.id==='P'?'var(--ch2)':'var(--chn)'}${r[key]<0?';opacity:.5':''}"></i></span><span class="r num small ${r[key]<0?'neg':''}">${fmt(r[key])}</span></div>`).join('')}</div></section>`;};
  const st=G.stats||[],ago=st.length>12?st[st.length-13]:null;
  const rankNow=rows.slice().sort((a,b)=>b.v-a.v).findIndex(r=>r.id==='P')+1;
  let rankAgo=null;if(ago){const arr=[ago.v,...Object.values(ago.cs||{}).map(x=>x[0])].sort((a,b)=>b-a);rankAgo=arr.indexOf(ago.v)+1;}
  return (LANG_EN?`<section class="panel"><div class="kpis" style="border-top:0"><div class="kpi"><span>Your valuation rank</span><b>#${rankNow} / ${rows.length}</b></div><div class="kpi"><span>A year ago</span><b>${rankAgo?rankAgo+'.':'—'}</b></div><div class="kpi"><span>Active rivals</span><b>${live.length}</b></div><div class="kpi"><span>Defunct</span><b>${G.comps.filter(c=>c.dead).length}</b></div></div></section>
    <div class="grid">${bars('v',"Valuation",money,"top 10, you're always listed")}${bars('p',"Monthly profit",money)}</div>
    <div class="grid">${bars('e',"Employee",v=>num(v))}${bars('b',"Brand",v=>fx(v,0))}</div>`:`<section class="panel"><div class="kpis" style="border-top:0"><div class="kpi"><span>Değerleme sıran</span><b>${rankNow}. / ${rows.length}</b></div><div class="kpi"><span>Bir yıl önce</span><b>${rankAgo?rankAgo+'.':'—'}</b></div><div class="kpi"><span>Yaşayan rakip</span><b>${live.length}</b></div><div class="kpi"><span>Tarihe karışan</span><b>${G.comps.filter(c=>c.dead).length}</b></div></div></section>
    <div class="grid">${bars('v','Değerleme',money,'ilk 10, sen her zaman listede')}${bars('p','Aylık kâr',money)}</div>
    <div class="grid">${bars('e','Çalışan',v=>num(v))}${bars('b','Marka',v=>fx(v,0))}</div>`);
}
function vTimeline(){
  const f=UI.tlF||'all',items=(G.tl||[]).filter(x=>f==='all'||TL_GROUP[x.k]===f).slice().reverse();
  let yr=null,html='';
  for(const x of items){const y=dateOf(x.d).getFullYear();if(y!==yr){yr=y;html+=`<li class="yr" style="display:block">${y}</li>`;}
    const [ic,col]=TL_IC[x.k]||['•','var(--ink)'];html+=`<li><span class="small muted num">${fmtDate(x.d)}</span><span class="ic" style="color:${col};border-color:${col}" aria-hidden="true">${ic}</span><span>${esc(x.t)}</span></li>`;}
  const filt=(LANG_EN?`<div class="row" style="gap:6px;margin-bottom:12px" role="group" aria-label="Event type">${[['all',"All"],['urun',"Products"],['sirket',"Company"],['rakip',"Rivals"]].map(([k,n])=>`<button class="btn sm ${f===k?'primary':''}" data-act="tlf" data-k="${k}">${n}</button>`).join('')}</div>`:`<div class="row" style="gap:6px;margin-bottom:12px" role="group" aria-label="Olay türü">${[['all','Tümü'],['urun','Ürünler'],['sirket','Şirket'],['rakip','Rakipler']].map(([k,n])=>`<button class="btn sm ${f===k?'primary':''}" data-act="tlf" data-k="${k}">${n}</button>`).join('')}</div>`);
  return (LANG_EN?`${filt}<section class="panel"><div class="ph"><h2>${esc(G.name)} history</h2><span class="sub">${(G.tl||[]).length} milestones</span></div><div class="pb">${html?`<ul class="tl">${html}</ul>`:"<div class=\"empty\">Your company's story will begin with your first product.</div>"}</div></section>`:`${filt}<section class="panel"><div class="ph"><h2>${esc(G.name)} tarihçesi</h2><span class="sub">${(G.tl||[]).length} önemli an</span></div><div class="pb">${html?`<ul class="tl">${html}</ul>`:'<div class="empty">Şirketinin hikâyesi ilk ürününle başlayacak.</div>'}</div></section>`);
}
function vHistory(){const sb=curSub('stats');return subBar('stats')+(sb==='rakip'?vStatsCompare():sb==='zaman'?vTimeline():sb==='lider'?vLeader():sb==='odul'?vAwards():sb==='haber'?vNews():sb==='basarim'?vAch():sb==='karne'?vRepCard():vStatsCharts());}
function vLeader(){
  if(LB.st==='init')return (LANG_EN?`<section class="panel"><div class="empty">Connecting to the leaderboard…</div></section>`:`<section class="panel"><div class="empty">Liderlik tablosuna bağlanılıyor…</div></section>`);
  if(LB.st==='off')return (LANG_EN?`<section class="panel"><div class="ph"><h2>Leaderboard${helpBtn('lb')}</h2></div><div class="empty">The leaderboard isn't available in this view. Open the game while signed in on claude.ai to compare with other players.</div></section><section class="panel"><div class="pb"><div class="scn-grid">${vChalCard()}${vDuelCard()}</div></div></section>`:`<section class="panel"><div class="ph"><h2>Liderlik tablosu${helpBtn('lb')}</h2></div><div class="empty">Liderlik tablosu bu görünümde kullanılamıyor. Oyunu claude.ai'de oturum açıkken açtığında diğer oyuncularla karşılaştırabilirsin.</div></section><section class="panel"><div class="pb"><div class="scn-grid">${vChalCard()}${vDuelCard()}</div></div></section>`);
  const nm=id=>(LB.names[id]||(LANG_EN?"Gamer":'Oyuncu'))+(id===LB.uid?(LANG_EN?" (you)":' (sen)'):'');
  const vals=LB.rows.filter(r=>r.d.best&&r.d.best.val).map(r=>({id:r.id,...r.d.best.val})).sort((a,b)=>b.v-a.v);
  const myRank=vals.findIndex(r=>r.id===LB.uid);
  const vRows=vals.slice(0,20).map((r,i)=>(LANG_EN?`<tr class="${r.id===LB.uid?'lbme':''}"><td class="num">${i+1}</td><td><b>${esc(nm(r.id))}</b><div class="small muted">${esc(r.co||'')}</div></td><td class="r num">${money(r.v)}</td><td class="r num" style="white-space:nowrap">${Math.floor((r.day||0)/365)} yr ${Math.floor(((r.day||0)%365)/30)} mo</td><td>${esc(r.diff||"Normal")}</td></tr>`:`<tr class="${r.id===LB.uid?'lbme':''}"><td class="num">${i+1}</td><td><b>${esc(nm(r.id))}</b><div class="small muted">${esc(r.co||'')}</div></td><td class="r num">${money(r.v)}</td><td class="r num" style="white-space:nowrap">${Math.floor((r.day||0)/365)} yıl ${Math.floor(((r.day||0)%365)/30)} ay</td><td>${esc(r.diff||'Normal')}</td></tr>`)).join('');
  const scns=Object.values(SCN).filter(x=>x.yrs).map(sc=>{const rs=LB.rows.filter(r=>r.d.best&&r.d.best['scn_'+scnKey(sc.id)]).map(r=>({id:r.id,...r.d.best['scn_'+scnKey(sc.id)]})).sort((a,b)=>b.stars-a.stars||a.days-b.days).slice(0,5);
    return `<div class="proj col" style="gap:6px"><b>${sc.n}</b>${rs.length?`<ol class="small" style="margin:0;padding-left:18px">${rs.map(r=>(LANG_EN?`<li${r.id===LB.uid?" style=\"font-weight:700\"":''}>${starHtml(r.stars)} ${esc(nm(r.id))} · ${Math.floor(r.days/365)} yr ${Math.floor((r.days%365)/30)} mo · ${esc(r.diff||"Normal")}</li>`:`<li${r.id===LB.uid?' style="font-weight:700"':''}>${starHtml(r.stars)} ${esc(nm(r.id))} · ${Math.floor(r.days/365)} yıl ${Math.floor((r.days%365)/30)} ay · ${esc(r.diff||'Normal')}</li>`)).join('')}</ol>`:(LANG_EN?"<div class=\"small muted\">No one has completed it yet.</div>":'<div class="small muted">Henüz tamamlayan yok.</div>')}</div>`;}).join('');
  const mine=lbMine(),pend=LB.pend||LB.writing;
  const W=chalDef(isoWeek()),wk=chalBoard(W.id),prev=isoWeek(new Date(Date.now()-7*864e5)),pw=chalBoard(prev)[0];
  const wRows=wk.slice(0,20).map((r,i)=>`<tr class="${r.id===LB.uid?'lbme':''}"><td class="num">${i+1}</td><td><b>${esc(nm(r.id))}</b><div class="small muted">${esc(r.co||'')}</div></td><td class="r num">${money(r.v)}</td></tr>`).join('');
  return (LANG_EN?`<section class="panel"><div class="pb"><div class="scn-grid">${vDuelCard()}</div></div></section>
  <section class="panel"><div class="ph"><h2>Weekly challenge · ${W.id}${helpBtn('weekly')}</h2><span class="sub">Resets in ${chalLeft()}</span></div>
    <div class="pb col"><div class="small muted">${chalDesc(W)}</div><div class="row"><button class="btn sm primary" data-act="chalask">Start the challenge</button>${pw?`<span class="small">Last week's winner: <b>${esc(nm(pw.id))}</b> · ${money(pw.v)}</span>`:''}</div></div>
    ${wRows?`<div class="tw"><table style="min-width:420px"><thead><tr><th>#</th><th>Player and company</th><th class="r">Year 3 valuation</th></tr></thead><tbody>${wRows}</tbody></table></div>`:"<div class=\"empty\">No one has finished this week yet. Be the first!</div>"}</section>
  <section class="panel"><div class="ph"><h2>Highest valuation${helpBtn('lb')}</h2><span class="sub">Free play · ${vals.length} players${myRank>=0?` · you're #${myRank+1}`:''}</span></div>
    ${vRows?`<div class="tw"><table style="min-width:560px"><thead><tr><th>#</th><th>Player and company</th><th class="r">Valuation</th><th class="r">Reached at</th><th>Difficulty</th></tr></thead><tbody>${vRows}</tbody></table></div>`:"<div class=\"empty\">No one has submitted a score yet. In free play, your valuation is submitted automatically after 6 months.</div>"}
    <div class="pb small muted" style="border-top:1px solid var(--line)">In free play, your highest valuation is submitted automatically at the end of each month; in scenarios, your best result is submitted the moment you complete it. Only each player's best result is listed.${pend?" <b>Submitting…</b>":''}${LB.werr?" <b class=\"neg\">Couldn't submit your score: you may not have permission to write data on this page.</b>":''}${!LB.uid?" <b class=\"warn\">You need to be signed in to submit scores.</b>":''}${mine&&mine.best&&mine.best.val?` Your record: <b>${money(mine.best.val.v)}</b>.`:''}</div></section>
  <section class="panel"><div class="ph"><h2>Scenarios</h2><span class="sub">By stars, then speed</span></div><div class="pb"><div class="grid3">${scns}</div></div></section>`:`<section class="panel"><div class="pb"><div class="scn-grid">${vDuelCard()}</div></div></section>
  <section class="panel"><div class="ph"><h2>Haftanın meydan okuması · ${W.id}${helpBtn('weekly')}</h2><span class="sub">Yenilenmesine ${chalLeft()}</span></div>
    <div class="pb col"><div class="small muted">${chalDesc(W)}</div><div class="row"><button class="btn sm primary" data-act="chalask">Meydan okumaya başla</button>${pw?`<span class="small">Geçen haftanın birincisi: <b>${esc(nm(pw.id))}</b> · ${money(pw.v)}</span>`:''}</div></div>
    ${wRows?`<div class="tw"><table style="min-width:420px"><thead><tr><th>#</th><th>Oyuncu ve şirket</th><th class="r">3. yıl değerlemesi</th></tr></thead><tbody>${wRows}</tbody></table></div>`:'<div class="empty">Bu hafta henüz kimse bitirmedi. İlk sen ol!</div>'}</section>
  <section class="panel"><div class="ph"><h2>En yüksek değerleme${helpBtn('lb')}</h2><span class="sub">Serbest oyun · ${vals.length} oyuncu${myRank>=0?` · sen ${myRank+1}. sıradasın`:''}</span></div>
    ${vRows?`<div class="tw"><table style="min-width:560px"><thead><tr><th>#</th><th>Oyuncu ve şirket</th><th class="r">Değerleme</th><th class="r">Ulaştığı an</th><th>Zorluk</th></tr></thead><tbody>${vRows}</tbody></table></div>`:'<div class="empty">Henüz kimse skor göndermedi. Serbest oyunda 6 ayı geçince değerlemen otomatik gönderilir.</div>'}
    <div class="pb small muted" style="border-top:1px solid var(--line)">Serbest oyunda en yüksek değerlemen her ay sonu, senaryolarda en iyi sonucun tamamlandığı an otomatik gönderilir. Her oyuncunun yalnızca en iyi sonucu listelenir.${pend?' <b>Gönderiliyor…</b>':''}${LB.werr?' <b class="neg">Skorun gönderilemedi: bu sayfada veri yazma iznin olmayabilir.</b>':''}${!LB.uid?' <b class="warn">Skor göndermek için oturum açık olmalı.</b>':''}${mine&&mine.best&&mine.best.val?` Senin rekorun: <b>${money(mine.best.val.v)}</b>.`:''}</div></section>
  <section class="panel"><div class="ph"><h2>Senaryolar</h2><span class="sub">Yıldıza, sonra hıza göre</span></div><div class="pb"><div class="grid3">${scns}</div></div></section>`);
}

