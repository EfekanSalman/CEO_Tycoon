/* ============================== STORE GRID & CITY RETAIL ============================== */
/* Her mağaza bir ızgaradır (kiosk 2×1, mağaza 3×2, amiral 3×3). Varsayılan: bütün hücreler satış tezgâhı → eski davranış.
   Satın alma: bitişik tezgâhlar +%35. Vitrin ve reklam: o şehrin bilinirliğine +5. Eğitim ve servis: donanım ürünlerinin memnuniyetine katkı.
   Fiyat politikası mağaza başına: satış ağırlığı ve perakende payı (marj) değişir. */
const SG_DIM={kiosk:[2,1],store:[3,2],flag:[3,3]};
const SU={sale:{n:(LANG_EN?"Sales counter":'Satış tezgâhı'),s:'ST',d:(LANG_EN?"Makes sales; forms the store's weight.":'Satış yapar; mağazanın ağırlığını oluşturur.')},buy:{n:(LANG_EN?"Purchasing":'Satın alma'),s:LANG_EN?'PU':'SA',d:(LANG_EN?"Adjacent sales counters sell 35% more (product range and stock).":'Bitişik satış tezgâhları %35 daha çok satar (ürün çeşidi ve stok).')},
  ad:{n:(LANG_EN?"Display and advertising":'Vitrin ve reklam'),s:LANG_EN?(LANG_EN?"AD":'AD'):(LANG_EN?"VR":'VR'),d:(LANG_EN?"+5 awareness in the store's city.":'Mağazanın şehrinde bilinirlik +5.')},train:{n:(LANG_EN?"Training and service":'Eğitim ve servis'),s:LANG_EN?'SV':(LANG_EN?"TR":'EĞ'),d:(LANG_EN?"After-sales service: satisfaction for hardware products rises a little each month.":'Satış sonrası servis: donanım ürünlerinin memnuniyeti her ay biraz artar.')}};
const SPP={low:{n:(LANG_EN?"Discount":'İndirimli'),w:1.25,cut:0.1,d:(LANG_EN?"More customers, lower margin":'Daha çok müşteri, daha az marj')},mid:{n:(LANG_EN?"Normal":'Normal'),w:1,cut:0.2,d:(LANG_EN?"Balanced":'Dengeli')},high:{n:(LANG_EN?"Premium":'Premium'),w:0.85,cut:0.3,d:(LANG_EN?"Fewer customers, higher margin":'Daha az müşteri, daha yüksek marj')}};
const sgDim=s=>SG_DIM[s.t]||[2,1];
function sGrid(s){const [W,H]=sgDim(s),N=W*H;if(!s.g||s.g.length!==N)s.g=new Array(N).fill('sale');return s.g;}
const sNb=(s,i)=>{const [W,H]=sgDim(s),x=i%W,y=Math.floor(i/W),o=[];if(x>0)o.push(i-1);if(x<W-1)o.push(i+1);if(y>0)o.push(i-W);if(y<H-1)o.push(i+W);return o;};
const sCnt=(s,t)=>sGrid(s).filter(x=>x===t).length;
function sGridF(s){const g=sGrid(s);let e=0;g.forEach((x,i)=>{if(x==='sale')e+=sNb(s,i).some(j=>g[j]==='buy')?1.35:1;});return e/g.length;}
const shopPP=s=>SPP[s.pp]||SPP.mid;
const shopEffW=s=>SHOP_T[s.t].w*sGridF(s)*shopPP(s).w*shopTrF(s);
const suCost=s=>Math.round(SHOP_T[s.t].cost*0.12*REGS[s.r].px*infl()/1000)*1000;
const shopCityId=s=>s.cid||(CITY.find(c=>c.r===s.r&&String(s.city).startsWith(c.n))||{}).id;
const shopTrain=()=>G.shops?Math.min(6,G.shops.list.filter(s=>G.day>=s.ready).reduce((a,s)=>a+sCnt(s,'train'),0)):0;
function sgAct(a,ds){const S=G.shops;if(!S)return;const s=S.list.find(x=>x.id===+ds.id);if(!s)return;
  if(a==='shopsel'){UI.shopSel=UI.shopSel===s.id?null:s.id;UI.sgCell=null;return;}
  if(a==='sgcell'){UI.sgCell=UI.sgCell&&UI.sgCell.s===s.id&&UI.sgCell.i===+ds.i?null:{s:s.id,i:+ds.i};return;}
  if(a==='sgset'){const g=sGrid(s),i=+ds.i,t=ds.t;if(!SU[t]||g[i]===t)return;
    if(t==='sale'){g[i]='sale';const back=suCost(s)*0.4;G.cash+=back;shopLog((LANG_EN?`${s.city}: ${SU[t].n.toLocaleLowerCase(LOC)} restored (+${money(back)}).`:`${s.city}: ${SU[t].n.toLocaleLowerCase(LOC)} geri kuruldu (+${money(back)}).`));}
    else{const c=suCost(s);if(G.cash<c){showToast((LANG_EN?"Not enough cash for this unit.":'Bu birim için yeterli nakit yok.'),'bad');return;}spend(c,'capex');g[i]=t;shopLog((LANG_EN?`${s.city}: ${SU[t].n.toLocaleLowerCase(LOC)} built (${money(c)}).`:`${s.city}: ${SU[t].n.toLocaleLowerCase(LOC)} kuruldu (${money(c)}).`));}
    if(G.ct)G.ct.v++;SHV++;UI.sgCell=null;return;}
  if(a==='shoppp'){if(!SPP[ds.k])return;s.pp=ds.k;SHV++;shopLog((LANG_EN?`${s.city}: pricing policy ${SPP[ds.k].n.toLocaleLowerCase(LOC)}.`:`${s.city}: fiyat politikası ${SPP[ds.k].n.toLocaleLowerCase(LOC)}.`));}}
function vStoreGrid(s){const g=sGrid(s),[W]=sgDim(s),sel=UI.sgCell&&UI.sgCell.s===s.id?UI.sgCell.i:-1,pp=s.pp||'mid';
  const cells=g.map((x,i)=>{const bon=x==='sale'&&sNb(s,i).some(j=>g[j]==='buy');return `<button class="fg-c sg-${x}${i===sel?' on':''}" data-act="sgcell" data-id="${s.id}" data-i="${i}" aria-pressed="${i===sel}" aria-label="${esc(SU[x].n)}"><b>${SU[x].s}</b>${bon?'<small>+%35</small>':''}</button>`;}).join('');
  const menu=sel>=0?`<div class="fg-m">${Object.keys(SU).filter(t=>t!==g[sel]).map(t=>`<button class="btn sm" data-act="sgset" data-id="${s.id}" data-i="${sel}" data-t="${t}" title="${esc(SU[t].d)}" ${t!=='sale'&&G.cash<suCost(s)?'disabled':''}>${esc(SU[t].n)}${t==='sale'?` (+${money(suCost(s)*0.4)})`:` · ${money(suCost(s))}`}</button>`).join('')}</div>`:'';
  const ad=sCnt(s,'ad'),tr=sCnt(s,'train');
  return (LANG_EN?`<div class="fg-w sg-w"><div class="fg" style="grid-template-columns:repeat(${W},minmax(0,1fr));max-width:${W*90}px">${cells}</div>${menu}
    <div class="small muted">sales power ×${fx(sGridF(s)*shopPP(s).w,2)}${ad?` · city awareness +${ad*5}`:''}${tr?` · service units ${tr}`:''}</div>
    <div class="row" style="gap:6px;flex-wrap:wrap"><span class="small">Pricing policy:</span>${Object.entries(SPP).map(([k,P])=>`<button class="btn sm ${pp===k?'primary':''}" data-act="shoppp" data-id="${s.id}" data-k="${k}" aria-pressed="${pp===k}" title="${esc(P.d)}">${esc(P.n)}</button>`).join('')}<span class="small muted">${esc(shopPP(s).d)} · retail margin ${Math.round(shopPP(s).cut*100)}%</span></div>${vStoreAss(s)}</div>`:`<div class="fg-w sg-w"><div class="fg" style="grid-template-columns:repeat(${W},minmax(0,1fr));max-width:${W*90}px">${cells}</div>${menu}
    <div class="small muted">satış gücü ×${fx(sGridF(s)*shopPP(s).w,2)}${ad?` · şehir bilinirliği +${ad*5}`:''}${tr?` · servis birimi ${tr}`:''}</div>
    <div class="row" style="gap:6px;flex-wrap:wrap"><span class="small">Fiyat politikası:</span>${Object.entries(SPP).map(([k,P])=>`<button class="btn sm ${pp===k?'primary':''}" data-act="shoppp" data-id="${s.id}" data-k="${k}" aria-pressed="${pp===k}" title="${esc(P.d)}">${esc(P.n)}</button>`).join('')}<span class="small muted">${esc(shopPP(s).d)} · perakende payı %${Math.round(shopPP(s).cut*100)}</span></div>${vStoreAss(s)}</div>`);}
