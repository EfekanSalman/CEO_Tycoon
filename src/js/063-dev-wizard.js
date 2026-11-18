/* ============================== DEV WIZARD ============================== */
function devEst(d){const avg=teamAvg(REQ_ROLES[d.cat]),r=spec(d,avg||3);if(r.err)return {err:r.err};const price=d.cat==='app'?CATS.app.arpu:(d.price>0?d.price:r.fair);
  const team={};for(const e of G.emps)if(REQ_ROLES[d.cat].includes(e.role))team[e.role]=(team[e.role]||0)+e.skill;let eta=0;for(const t in r.req)eta=Math.max(eta,team[t]?r.req[t]/team[t]:Infinity);
  const ref=CATS[d.cat].ref,fairP=ref?ref*Math.pow(r.v,1.2)/Math.max(price,0.01):1,c=5.5+(r.v-1)*10+(fairP-1)*3+(cofOn()&&G.cof.t==='design'?0.4:0)+biRev()+(ceoSk('v1')?0.2:0);
  return {r,price,eta,units:estUnits(d.cat,r.score,price),rev:[clamp(c-0.7,1,10),clamp(c+0.7,1,10)],miss:Object.keys(r.req).filter(t=>!team[t])};}
function devGauge(d){const E=devEst(d);if(E.err)return (LANG_EN?`<div class="dv-g"><div><span>Status</span><b class="warn">${esc(E.err)}</b></div></div>`:`<div class="dv-g"><div><span>Durum</span><b class="warn">${esc(E.err)}</b></div></div>`);
  const mid=(E.rev[0]+E.rev[1])/2,cl=mid>=7.5?'pos':mid>=6?'warn':'neg';
  return (LANG_EN?`<div class="dv-g" aria-live="polite"><div><span>Est. press</span><b class="${cl}">${fx(E.rev[0],1)}–${fx(E.rev[1],1)}</b><small>${mid>=8?"big buzz":mid>=6.5?"positive":mid>=5?"mixed":"harsh criticism"}</small></div>
    <div><span>Demand</span><b>${num(E.units)}</b><small>${CATS[d.cat].unit}/mo</small></div>
    <div><span>Time</span><b class="${E.miss.length?'neg':''}">${E.miss.length?'—':'~'+Math.ceil(E.eta)+' g'}</b><small>${E.miss.length?"missing: "+E.miss.map(t=>ROLES[t].n).join(', '):"full team"}</small></div>
    ${d.cat==='app'?'':`<div><span>Unit profit</span><b class="${E.price-E.r.uc>=0?'pos':'neg'}">${money(E.price-E.r.uc)}</b><small>price ${money(E.price)}</small></div>`}</div>`:`<div class="dv-g" aria-live="polite"><div><span>Tahmini basın</span><b class="${cl}">${fx(E.rev[0],1)}–${fx(E.rev[1],1)}</b><small>${mid>=8?'büyük ilgi':mid>=6.5?'olumlu':mid>=5?'karışık':'sert eleştiri'}</small></div>
    <div><span>Talep</span><b>${num(E.units)}</b><small>${CATS[d.cat].unit}/ay</small></div>
    <div><span>Süre</span><b class="${E.miss.length?'neg':''}">${E.miss.length?'—':'~'+Math.ceil(E.eta)+' g'}</b><small>${E.miss.length?'eksik: '+E.miss.map(t=>ROLES[t].n).join(', '):'tüm ekiple'}</small></div>
    ${d.cat==='app'?'':`<div><span>Birim kâr</span><b class="${E.price-E.r.uc>=0?'pos':'neg'}">${money(E.price-E.r.uc)}</b><small>fiyat ${money(E.price)}</small></div>`}</div>`);}
function devPrice(d){if(d.cat==='app')return '';const E=devEst(d);if(E.err)return '';const fair=E.r.fair,mn=Math.max(SUBP(d.cat)?0.5:5,fair*0.5),mx=fair*1.8,st=SUBP(d.cat)?0.5:fair>200?5:1,cur=d.price>0?d.price:fair,ratio=cur/fair;
  const pos=v=>clamp((v-mn)/(mx-mn)*100,0,100),a=pos(fair*0.9),b=pos(fair*1.1);
  return (LANG_EN?`<label class="f dv-price" for="d-pr"><span class="row" style="gap:8px;flex-wrap:wrap;align-items:baseline">Sale price <b class="num">${money(cur)}</b> <span class="small ${ratio>1.15||ratio<0.85?'warn':'pos'}">${ratio>1.15?"pricey: press and budget buyers turn away":ratio<0.85?"cheap: sales rise but unit profit falls":"close to the fair price"}</span></span>
    <input type="range" id="d-pr" min="${Math.round(mn*2)/2}" max="${Math.round(mx)}" step="${st}" value="${Math.round(cur/st)*st}" data-bind="draft.price" data-num="1" style="--a:${a}%;--b:${b}%" aria-describedby="d-pr-h">
    <span class="small muted" id="d-pr-h">The green zone is ±10% of the fair price (${money(fair)}). <button class="btn sm ghost" data-act="devfair">Reset to fair price</button></span></label>`:`<label class="f dv-price" for="d-pr"><span class="row" style="gap:8px;flex-wrap:wrap;align-items:baseline">Satış fiyatı <b class="num">${money(cur)}</b> <span class="small ${ratio>1.15||ratio<0.85?'warn':'pos'}">${ratio>1.15?'pahalı: basın ve fiyat odaklı alıcılar uzaklaşır':ratio<0.85?'ucuz: satış artar ama birim kâr düşer':'adil fiyata yakın'}</span></span>
    <input type="range" id="d-pr" min="${Math.round(mn*2)/2}" max="${Math.round(mx)}" step="${st}" value="${Math.round(cur/st)*st}" data-bind="draft.price" data-num="1" style="--a:${a}%;--b:${b}%" aria-describedby="d-pr-h">
    <span class="small muted" id="d-pr-h">Yeşil bölge adil fiyatın ±%10'u (${money(fair)}). <button class="btn sm ghost" data-act="devfair">Adil fiyata dön</button></span></label>`);}

