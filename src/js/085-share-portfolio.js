/* ============================== SHARE PORTFOLIO ============================== */
/* Rakip hisselerine pasif yatırım. %1'lik dilimlerle alınır (pay büyüdükçe fiyat yükselir), %1 makasla satılır.
   Rakibin aylık kârının %25'i payına göre temettü olarak gelir. %5 üstü kamuya duyurulur. %50'yi geçince kalan hisseler
   değerin %105'iyle alınıp şirket birleştirilebilir (rekabet kurumu sınırı geçerli). Düşmanca devralma (hto) ayrı bir yoldur;
   aynı şirkette ikisi birlikte yürütülemez. */
const PF_STEP=0.01,PF_DIV=0.25,PF_DISC=0.05,PF_CTRL=0.5;
const newPf=()=>({h:{},cost:{},lv:{},vh:{},divM:0,divT:0,log:[]});
const pfOf=()=>G.pf||(G.pf=newPf());
const pfStake=cid=>(G.pf&&G.pf.h[cid])||0;
const pfBuyPx=c=>compVal(c)*PF_STEP*(1+pfStake(c.id)*0.6);
const pfSellPx=c=>compVal(c)*PF_STEP*0.99;
const pfValue=()=>{const P=G.pf;if(!P)return 0;let v=0;for(const id in P.h){const c=comp(id);if(c&&!c.dead)v+=P.h[id]*compVal(c);}return v;};
const pfCost=()=>G.pf?Object.values(G.pf.cost).reduce((a,b)=>a+b,0):0;
function pfLog(t,k=''){const P=pfOf();P.log.unshift({d:G.day,t,k});if(P.log.length>12)P.log.pop();}
function pfBlock(c){if(!c||c.dead)return (LANG_EN?"This company no longer exists.":'Bu şirket artık yok.');if(G.hto&&G.hto.mine&&G.hto.mine.cid===c.id)return (LANG_EN?"You're running a hostile takeover on this company.":'Bu şirkette düşmanca devralma yürütüyorsun.');return '';}
function pfAct(a,id){const P=pfOf(),c=comp(id);const w=pfBlock(c);if(w&&a!=='pfsell'){showToast(w,'bad');return;}if(!c)return;
  if(a==='pfbuy'){const st=pfStake(c.id);if(st>=0.99)return;const px=pfBuyPx(c);if(G.cash<px){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');return;}
    spend(px,'capex');P.h[c.id]=Math.round((st+PF_STEP)*100)/100;P.cost[c.id]=(P.cost[c.id]||0)+px;
    if(st<PF_DISC&&P.h[c.id]>=PF_DISC){c.rel=(c.rel||0)-5;news((LANG_EN?`Disclosure: ${G.name} owns ${Math.round(P.h[c.id]*100)}% of ${c.name}.`:`Bildirim: ${G.name}, ${c.name} şirketinin %${Math.round(P.h[c.id]*100)} hissesine sahip.`),'mkt',true);pfLog((LANG_EN?`${c.name}: 5% threshold crossed, made public.`:`${c.name}: %5 eşiği aşıldı, kamuya duyuruldu.`),'warn');}
    if(st<PF_CTRL&&P.h[c.id]>=PF_CTRL){news((LANG_EN?`You now hold a majority stake in ${c.name}. You can take control and merge.`:`${c.name} şirketinin çoğunluk hissesi artık sende. Kontrolü alıp birleşebilirsin.`),'good',true);pfLog((LANG_EN?`${c.name}: majority stake (50%).`:`${c.name}: çoğunluk payı (%50).`),'good');}}
  else if(a==='pfsell'){const st=pfStake(id);if(!st)return;const px=c&&!c.dead?pfSellPx(c):0;G.cash+=px;const avg=(P.cost[id]||0)/st;P.cost[id]=Math.max(0,(P.cost[id]||0)-avg*PF_STEP);P.h[id]=Math.round((st-PF_STEP)*100)/100;
    if(P.h[id]<=1e-9){delete P.h[id];delete P.cost[id];}pfLog((LANG_EN?`${c?c.name:id}: sold 1% (${money(px)}).`:`${c?c.name:id}: %1 satıldı (${money(px)}).`));}
  else if(a==='pfctrl'){const st=pfStake(c.id);if(st<PF_CTRL)return;const blk=acqBlock(c);if(blk){showToast(acqBlockTxt(c,blk),'bad');return;}const price=(1-st)*compVal(c)*1.05;if(G.cash<price){showToast((LANG_EN?"Not enough cash for the remaining shares.":'Kalan hisseler için yeterli nakit yok.'),'bad');return;}
    spend(price,'capex');delete P.h[c.id];delete P.cost[c.id];pfLog((LANG_EN?`Merged with ${c.name} (${money(price)}).`:`${c.name} ile birleşildi (${money(price)}).`),'good');acqComp(c,price,true);}}
function pfMonthly(){const P=G.pf;if(!P)return;let div=0;
  for(const c of liveComps()){const v=compVal(c),a=P.vh[c.id]||(P.vh[c.id]=[]);a.push(Math.round(v/1e5)/10);if(a.length>24)a.shift();P.lv[c.id]=v;}
  for(const id of Object.keys(P.h)){const c=comp(id),st=P.h[id];
    if(!c||c.dead){const lv=P.lv[id]||0,acq=c&&c.by&&c.by!=='P',pay=st*lv*(acq?1.1:0.05);G.cash+=pay;G.month.rev+=pay;addPas(pay);
      news(c&&acq?(LANG_EN?`${c.name} was acquired: you were paid ${money(pay)} for your stake.`:`${c.name} satın alındı: payın için ${money(pay)} ödendi.`):(LANG_EN?`${c?c.name:"A company"} went bankrupt: only ${money(pay)} of your stake could be recovered.`:`${c?c.name:'Bir şirket'} battı: payından yalnızca ${money(pay)} kurtarılabildi.`),acq?'good':'bad',true);pfLog((LANG_EN?`${c?c.name:id}: stake closed (${money(pay)}).`:`${c?c.name:id}: pay kapandı (${money(pay)}).`),acq?'good':'bad');
      delete P.h[id];delete P.cost[id];continue;}
    const d=Math.max(0,c.profit||0)*PF_DIV*st;if(d>0){G.cash+=d;G.month.rev+=d;addPas(d);div+=d;}}
  P.divM=div;P.divT+=div;}
function vPortfolio(){const P=pfOf(),L=liveComps().slice().sort((a,b)=>compVal(b)-compVal(a)),val=pfValue(),cost=pfCost();
  const rows=L.map(c=>{const v=compVal(c),st=pfStake(c.id),h=P.vh[c.id]||[],ch=h.length>=13?(h[h.length-1]-h[h.length-13])/Math.max(0.1,h[h.length-13]):null,yld=v>0?Math.max(0,c.profit||0)*PF_DIV*12/v:0,blk=pfBlock(c);
    return (LANG_EN?`<tr><td><b>${esc(c.name)}</b>${st?` <span class="chip ${st>=PF_CTRL?'st-ok':'st-mute'}">${Math.round(st*100)}%</span>`:''}<div class="small muted">value ${money(v)}</div></td><td>${h.length>1?spark(h,70,20):''}</td>
      <td class="r num ${ch==null?'':ch>=0?'pos':'neg'}">${ch==null?'—':(ch>=0?'+':'−')+pctN(Math.abs(Math.round(ch*100)))}</td><td class="r num">${pct(yld,1)}</td><td class="r num">${money(pfBuyPx(c))}</td>
      <td class="r"><span class="row" style="gap:4px;justify-content:flex-end;flex-wrap:wrap"><button class="btn sm" data-act="pfbuy" data-id="${c.id}" ${blk||G.cash<pfBuyPx(c)?'disabled':''} title="${esc(blk||'')}">Buy 1%</button><button class="btn sm ghost" data-act="pfsell" data-id="${c.id}" ${st?'':'disabled'}>Sell 1%</button>${st>=PF_CTRL?`<button class="btn sm primary" data-act="pfctrl" data-id="${c.id}" title="Buy the remaining shares at 105% of value and merge">Take control · ${money((1-st)*v*1.05)}</button>`:''}</span></td></tr>`:`<tr><td><b>${esc(c.name)}</b>${st?` <span class="chip ${st>=PF_CTRL?'st-ok':'st-mute'}">%${Math.round(st*100)}</span>`:''}<div class="small muted">değer ${money(v)}</div></td><td>${h.length>1?spark(h,70,20):''}</td>
      <td class="r num ${ch==null?'':ch>=0?'pos':'neg'}">${ch==null?'—':(ch>=0?'+':'−')+pctN(Math.abs(Math.round(ch*100)))}</td><td class="r num">${pct(yld,1)}</td><td class="r num">${money(pfBuyPx(c))}</td>
      <td class="r"><span class="row" style="gap:4px;justify-content:flex-end;flex-wrap:wrap"><button class="btn sm" data-act="pfbuy" data-id="${c.id}" ${blk||G.cash<pfBuyPx(c)?'disabled':''} title="${esc(blk||'')}">%1 al</button><button class="btn sm ghost" data-act="pfsell" data-id="${c.id}" ${st?'':'disabled'}>%1 sat</button>${st>=PF_CTRL?`<button class="btn sm primary" data-act="pfctrl" data-id="${c.id}" title="Kalan hisseleri değerin %105'iyle al ve birleş">Kontrolü al · ${money((1-st)*v*1.05)}</button>`:''}</span></td></tr>`);}).join('');
  const log=P.log.map(l=>`<li><span class="small muted num" style="min-width:86px">${fmtDate(l.d)}</span><span class="${l.k==='good'?'pos':l.k==='bad'?'neg':l.k==='warn'?'warn':''}">${esc(l.t)}</span></li>`).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Share portfolio${helpBtn('pf')}</h2><span class="sub">${Object.keys(P.h).length} companies</span></div>
    <div class="kpis" style="border-top:0"><div class="kpi"><span>Portfolio value</span><b>${money(val)}</b></div><div class="kpi"><span>Cost</span><b>${money(cost)}</b></div><div class="kpi"><span>Gain / loss</span><b class="${val-cost>=0?'pos':'neg'}">${money(val-cost)}</b></div><div class="kpi"><span>Dividends (last month)</span><b class="pos">${money(P.divM)}</b></div></div>
    <div class="pb col" style="gap:8px"><p class="small muted" style="margin:0">Buy rivals' shares in 1% slices: the price rises as your stake grows, and selling has a 1% spread. 25% of a rival's monthly profit comes to you as dividends in proportion to your stake. A stake above 5% is made public; above 50% you can buy the remaining shares at 105% of value and merge. If the rival is acquired your stake is paid with a premium; if it goes bankrupt almost everything is lost.</p>
    <div class="tw"><table class="rt"><thead><tr><th>Company</th><th>24 mo</th><th class="r">12 mo</th><th class="r">Dividend yield</th><th class="r">Price of 1%</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div></section>
    ${log?`<section class="panel"><div class="ph"><h2>Portfolio log</h2></div><div class="pb"><ul class="alerts">${log}</ul></div></section>`:''}`:`<section class="panel"><div class="ph"><h2>Hisse portföyü${helpBtn('pf')}</h2><span class="sub">${Object.keys(P.h).length} şirket</span></div>
    <div class="kpis" style="border-top:0"><div class="kpi"><span>Portföy değeri</span><b>${money(val)}</b></div><div class="kpi"><span>Maliyet</span><b>${money(cost)}</b></div><div class="kpi"><span>Kâr / zarar</span><b class="${val-cost>=0?'pos':'neg'}">${money(val-cost)}</b></div><div class="kpi"><span>Temettü (geçen ay)</span><b class="pos">${money(P.divM)}</b></div></div>
    <div class="pb col" style="gap:8px"><p class="small muted" style="margin:0">Rakiplerin hissesini %1'lik dilimlerle al: payın büyüdükçe fiyat yükselir, satışta %1 makas vardır. Rakibin aylık kârının %25'i payına göre temettü olarak gelir. %5'i geçen pay kamuya duyurulur; %50'yi geçince kalan hisseleri değerin %105'iyle alıp birleşebilirsin. Rakip satın alınırsa payın primle ödenir, batarsa neredeyse hepsi kaybolur.</p>
    <div class="tw"><table class="rt"><thead><tr><th>Şirket</th><th>24 ay</th><th class="r">12 ay</th><th class="r">Temettü verimi</th><th class="r">%1 fiyatı</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div></section>
    ${log?`<section class="panel"><div class="ph"><h2>Portföy günlüğü</h2></div><div class="pb"><ul class="alerts">${log}</ul></div></section>`:''}`);}
