/* ============================== DEALS ============================== */
const DEAL_T={cpuSell:(LANG_EN?"Processor supply":'İşlemci tedariki'),osLic:(LANG_EN?"Operating system license":'İşletim sistemi lisansı'),cpuBuy:(LANG_EN?"Processor purchase deal":'İşlemci alım anlaşması')};
const DEV_CATS=['phone','pc'],LIC_COV=0.5;
const dealsWith=(cid,t)=>(G.deals||[]).filter(d=>d.cid===cid&&(!t||d.type===t));
const hasDeal=cid=>(G.deals||[]).some(d=>d.cid===cid);
const relOf=c=>c&&c.rel||0;
const relChip=c=>{const r=relOf(c);return `<span class="chip ${r>=30?'st-ok':r<=-30?'st-bad':r<0?'st-warn':'st-mute'}">${r>=30?(LANG_EN?"Friendly":'Dost'):r<=-30?(LANG_EN?"Enemy":'Düşman'):r<0?(LANG_EN?"Cold":'Soğuk'):(LANG_EN?"Neutral":'Nötr')} ${r>0?'+':''}${Math.round(r)}</span>`;};
const devUnits=c=>G.products.filter(p=>p.active&&p.owner===c.id&&DEV_CATS.includes(p.cat)).reduce((a,p)=>a+p.units,0);
const myCPUs=()=>myActive('cpu').filter(p=>p.spec);
const rivalCPU=c=>G.products.filter(p=>p.active&&p.owner===c.id&&p.cat==='cpu').sort((a,b)=>b.score-a.score)[0];
const cpuUse=pid=>G.products.filter(q=>isHW(q)&&q.active&&q.cat!=='cpu'&&q.spec.cpu===pid).reduce((a,q)=>a+(q.sr||q.units||0),0);
const buyDisc=o=>{const d=(G.deals||[]).find(x=>x.type==='cpuBuy'&&x.cid===o);return d?d.price:0;};
const cpuFair=p=>CATS.cpu.ref*Math.pow(p.score/S('cpu'),1.2);
function dealElig(c){
  const out={},dev=c.focus.some(f=>DEV_CATS.includes(f));
  out.cpuSell=!myCPUs().length?(LANG_EN?"You don't have a processor of your own on the market.":'Piyasada kendi ürettiğin bir işlemci yok.'):!dev?(LANG_EN?"They don't make phones or computers.":'Telefon ya da bilgisayar yapmıyorlar.'):dealsWith(c.id,'cpuSell').length?(LANG_EN?"You already have a supply deal.":'Zaten tedarik anlaşmanız var.'):'';
  out.osLic=!myActive('os').length?(LANG_EN?"You don't have an operating system of your own on the market.":'Piyasada kendi işletim sistemin yok.'):!dev?(LANG_EN?"They don't make phones or computers.":'Telefon ya da bilgisayar yapmıyorlar.'):c.focus.includes('os')?(LANG_EN?"They use their own operating system.":'Kendi işletim sistemlerini kullanıyorlar.'):dealsWith(c.id,'osLic').length?(LANG_EN?"You already have a license deal.":'Zaten lisans anlaşmanız var.'):'';
  out.cpuBuy=!rivalCPU(c)?(LANG_EN?"They have no processors for sale.":'Satışta işlemcileri yok.'):!(catUnlocked('phone')||catUnlocked('pc'))?(LANG_EN?"You don't manufacture phones or computers.":'Telefon ya da bilgisayar üretmiyorsun.'):dealsWith(c.id,'cpuBuy').length?(LANG_EN?"You already have a purchase deal.":'Zaten alım anlaşmanız var.'):'';
  return out;
}
function dealDefaults(c,type){
  const d={cid:c.id,type,months:12};
  if(type==='cpuSell'){const p=myCPUs().sort((a,b)=>b.score-a.score)[0];d.pid=p.id;d.q=Math.max(1000,Math.round(devUnits(c)*0.3/500)*500);d.price=Math.round(cpuFair(p));}
  else if(type==='osLic'){const p=myActive('os').sort((a,b)=>b.score-a.score)[0];d.pid=p.id;d.q=0;d.price=Math.round(p.price*0.8*100)/100;}
  else{const p=rivalCPU(c);d.pid=p.id;const use=cpuUse(p.id);d.q=Math.max(1000,Math.round(use/500)*500);d.price=0.1;}
  return d;
}
function dealChance(d){
  const c=comp(d.cid),p=prod(d.pid);if(!c||!p)return 0;let ch;
  if(d.type==='cpuSell'){const f=cpuFair(p),v=p.score/S('cpu');ch=1.7-d.price/f-(v<0.85?0.3:0)-(c.focus.includes('cpu')?0.25:0)-Math.max(0,d.q/Math.max(1,devUnits(c))-0.6)*0.8;}
  else if(d.type==='osLic'){const v=p.score/S('os');ch=1.6-d.price/Math.max(0.5,p.price)-(v<0.85?0.3:0);}
  else{const own=Math.max(1,(rivalCPU(c)||{}).units||1);ch=1.15-d.price*3.2+Math.min(0.25,d.q/own);}
  ch+=relOf(c)/250-c.aggr*0.2+(c.profit<0&&d.type==='cpuBuy'?0.15:0)+(G.life&&G.life.own.jet?0.05:0);
  return clamp(ch,0.02,0.96);
}
function dealMonthly(d){const p=prod(d.pid),c=comp(d.cid);
  if(d.type==='cpuSell')return d.q*d.price;
  if(d.type==='osLic')return c?devUnits(c)*LIC_COV*d.price:0;
  return p?-d.q*p.price*(1-d.price):0;}
function dealText(d){const p=prod(d.pid);const n=p?p.name:'?';
  return d.type==='cpuSell'?(LANG_EN?`${num(d.q)} units/month of your ${n} processor at ${money(d.price)} each`:`${n} işlemcinden ayda ${num(d.q)} adet, adedi ${money(d.price)}`)
    :d.type==='osLic'?(LANG_EN?`${n} on half their devices; ${money(d.price)} per device`:`${n}, cihazlarının yarısında; cihaz başı ${money(d.price)}`)
    :(LANG_EN?`${Math.round(d.price*100)}% off ${n} processors, min. ${num(d.q)} units/month`:`${n} işlemcisinde %${Math.round(d.price*100)} indirim, ayda en az ${num(d.q)} adet alım`);}
function startDeal(d,why){
  const c=comp(d.cid);const nd={...d,id:nid(),start:G.day,end:G.day+d.months*30,mDel:0,mShort:0,strikes:0,total:0};
  G.deals.push(nd);(G.flags=G.flags||{}).deal=true;c.rel=clamp(relOf(c)+8,-100,100);
  news((LANG_EN?`Deal signed with ${c.name}: ${DEAL_T[d.type]} (${dealText(d)}, ${d.months} months).${why||''}`:`${c.name} ile anlaşma imzalandı: ${DEAL_T[d.type]} (${dealText(d)}, ${d.months} ay).${why||''}`),'good',true);
}
function endDeal(d,msg,k){G.deals=G.deals.filter(x=>x!==d);if(msg)news(msg,k||'mkt',true);}
function dealsDaily(){
  if(!G.deals||!G.deals.length)return;
  for(const d of [...G.deals]){
    const c=comp(d.cid),p=prod(d.pid);
    if(!c||c.dead){endDeal(d,(LANG_EN?`${c?c.name:"Your partner"} no longer exists; the ${DEAL_T[d.type].toLocaleLowerCase(LOC)} deal has ended.`:`${c?c.name:'Ortağın'} artık yok; ${DEAL_T[d.type].toLocaleLowerCase(LOC)} sona erdi.`));continue;}
    if(d.type==='cpuSell'){
      if(!p||!p.active){c.rel=clamp(relOf(c)-15,-100,100);endDeal(d,(LANG_EN?`${p?p.name:"Your processor"} was pulled from the market, so the supply deal with ${c.name} fell through. Relations suffered.`:`${p?p.name:'İşlemcin'} piyasadan çekildiği için ${c.name} ile tedarik anlaşması bozuldu. İlişkiler zarar gördü.`),'bad');continue;}
      const need=d.q/30,del=Math.min(p.fg,need);
      if(del>0){const avg=p.fgv/p.fg;p.fg-=del;p.fgv-=avg*del;if(p.fg<1e-6){p.fg=0;p.fgv=0;}}
      const rev=del*d.price;G.cash+=rev;G.month.rev+=rev;c.cash-=rev;c.mRev-=rev;d.mDel+=del;d.mShort+=need-del;d.total+=rev;p.total+=del;
    }else if(d.type==='osLic'){
      if(!p||!p.active){c.rel=clamp(relOf(c)-15,-100,100);endDeal(d,(LANG_EN?`Your operating system was pulled from the market; the license deal with ${c.name} ended and your partner was left in a bind.`:`İşletim sistemin piyasadan çekildi; ${c.name} lisans anlaşması bitti ve ortağın zor durumda kaldı.`),'bad');continue;}
      const u=devUnits(c)*LIC_COV/30,fee=u*d.price;G.cash+=fee;G.month.rev+=fee;c.cash-=fee;c.mRev-=fee;d.mDel+=u;d.total+=fee;G.base=(G.base||0)+u;
    }
  }
}
function dealsMonthly(){
  G.deals=G.deals||[];G.offers=G.offers||[];
  for(const d of [...G.deals]){
    const c=comp(d.cid);if(!c)continue;const p=prod(d.pid);
    if(d.type==='cpuSell'){
      if(d.mShort>d.q*0.1){const pen=d.mShort*d.price*0.3;spend(pen,'other');c.cash+=pen;d.strikes++;c.rel=clamp(relOf(c)-8,-100,100);
        news((LANG_EN?`Delivery to ${c.name} came up ${num(d.mShort)} processors short. Contract penalty: ${money(pen)}.${d.strikes>=2?" If it happens again, they'll terminate the deal.":''}`:`${c.name}'a ${num(d.mShort)} işlemci eksik teslim edildi. Sözleşme cezası: ${money(pen)}.${d.strikes>=2?' Bir daha olursa anlaşmayı feshedecekler.':''}`),'bad',true);
        if(d.strikes>=3){c.rel=clamp(relOf(c)-25,-100,100);G.brand=clamp(G.brand-2,0,100);endDeal(d,(LANG_EN?`${c.name} terminated the processor deal over delivery problems. Your reputation in the industry took a hit.`:`${c.name} teslimat sorunları yüzünden işlemci anlaşmasını feshetti. Sektörde güvenilirliğin zedelendi.`),'bad');continue;}}
      else c.rel=clamp(relOf(c)+2,-100,100);
    }else if(d.type==='cpuBuy'){
      if(d.mDel<d.q&&p){const pen=(d.q-d.mDel)*p.price*0.3;spend(pen,'other');c.cash+=pen;c.mRev+=pen;c.rel=clamp(relOf(c)-4,-100,100);
        news((LANG_EN?`You fell short of your purchase commitment with ${c.name} (${num(d.mDel)}/${num(d.q)}). Commitment penalty: ${money(pen)}.`:`${c.name} ile alım taahhüdünün altında kaldın (${num(d.mDel)}/${num(d.q)}). Taahhüt cezası: ${money(pen)}.`),'bad');}
      else c.rel=clamp(relOf(c)+2,-100,100);
    }else c.rel=clamp(relOf(c)+1.5,-100,100);
    d.mLast={del:d.mDel,short:d.mShort};d.mDel=0;d.mShort=0;
    if(G.day>=d.end){c.rel=clamp(relOf(c)+6,-100,100);endDeal(d,(LANG_EN?`The ${DEAL_T[d.type].toLocaleLowerCase(LOC)} deal with ${c.name} was completed successfully. Total ${d.type==='cpuBuy'?"savings ":''}${money(d.total)}. You can propose a new deal.`:`${c.name} ile ${DEAL_T[d.type].toLocaleLowerCase(LOC)} başarıyla tamamlandı. Toplam ${d.type==='cpuBuy'?'tasarruf ':''}${money(d.total)}. Yeni anlaşma önerebilirsin.`),'good');}
  }
  G.offers=G.offers.filter(o=>o.exp>G.day&&comp(o.cid)&&!comp(o.cid).dead);
  for(const c of liveComps())c.rel=relOf(c)*0.98;
  if(G.offers.length<3&&Math.random()<0.3){
    const pool=[];for(const c of liveComps()){if(relOf(c)<-30||G.offers.some(o=>o.cid===c.id))continue;const el=dealElig(c);for(const t in el)if(!el[t]&&(t!=='cpuBuy'||cpuUse(rivalCPU(c).id)>500))pool.push([c,t]);}
    if(pool.length){const [c,t]=pick(pool);const o=dealDefaults(c,t);
      if(t==='cpuSell'){o.price=Math.round(o.price*rnd(0.82,0.97));}
      else if(t==='osLic'){o.price=Math.round(o.price*rnd(0.8,1.0)*100)/100;}
      else{o.price=Math.round(rnd(0.06,0.14)*100)/100;o.q=Math.round(o.q*rnd(1.0,1.4)/500)*500;}
      o.exp=G.day+30;o.inc=true;o.id=nid();G.offers.push(o);
      news((LANG_EN?`${c.name} offered you a deal: ${DEAL_T[t]}. Review it under Market → Partnerships.`:`${c.name} sana anlaşma teklif etti: ${DEAL_T[t]}. Pazar → Ortaklıklar bölümünde incele.`),'mkt',true);}
  }
}
function proposeDeal(d){
  const c=comp(d.cid);if(!c)return;
  if((c.dealCool||0)>G.day){showToast((LANG_EN?`${c.name} will wait ${c.dealCool-G.day} days before hearing a new offer.`:`${c.name} yeni bir teklif dinlemek için ${c.dealCool-G.day} gün bekliyor.`),'bad');return;}
  const ch=dealChance(d);
  if(Math.random()<ch){startDeal(d);UI.dd=null;return;}
  c.dealCool=G.day+15;c.rel=clamp(relOf(c)-2,-100,100);
  if(Math.random()<0.5){const o={...d,id:nid(),exp:G.day+20,inc:true,counter:true};
    if(d.type==='cpuSell')o.price=Math.max(d.price*0.85,Math.round(cpuFair(prod(d.pid))*0.92));
    else if(d.type==='osLic')o.price=Math.round(prod(d.pid).price*0.7*100)/100;
    else{o.price=Math.max(0.05,Math.round((d.price-0.06)*100)/100);o.q=Math.round(d.q*1.2/500)*500;}
    G.offers.push(o);news((LANG_EN?`${c.name} rejected your offer but made a counteroffer: ${dealText(o)}.`:`${c.name} teklifini reddetti ama karşı teklif verdi: ${dealText(o)}.`),'mkt',true);}
  else news((LANG_EN?`${c.name} rejected the deal offer.`:`${c.name} anlaşma teklifini reddetti.`),'bad');
  UI.dd=null;
}
function vDeals(){
  const live=liveComps();G.deals=G.deals||[];G.offers=G.offers||[];
  const mrev=G.deals.reduce((a,d)=>a+dealMonthly(d),0);
  const offers=G.offers.map(o=>{const c=comp(o.cid);return (LANG_EN?`<div class="proj"><div class="row between"><b>${esc(c.name)}</b><span class="chip st-warn">${o.counter?"Counteroffer":"Incoming offer"}</span></div>
    <div class="small"><b>${DEAL_T[o.type]}</b>: ${esc(dealText(o))} · ${o.months} months</div>
    <div class="small muted">Monthly impact ~${money(dealMonthly(o))} · reply expected within ${o.exp-G.day} days</div>
    <div class="row"><button class="btn sm primary" data-act="offerok" data-id="${o.id}">Accept</button><button class="btn sm ghost" data-act="offerno" data-id="${o.id}">Decline</button></div></div>`:`<div class="proj"><div class="row between"><b>${esc(c.name)}</b><span class="chip st-warn">${o.counter?'Karşı teklif':'Gelen teklif'}</span></div>
    <div class="small"><b>${DEAL_T[o.type]}</b>: ${esc(dealText(o))} · ${o.months} ay</div>
    <div class="small muted">Aylık etki ~${money(dealMonthly(o))} · ${o.exp-G.day} gün içinde cevap bekleniyor</div>
    <div class="row"><button class="btn sm primary" data-act="offerok" data-id="${o.id}">Kabul et</button><button class="btn sm ghost" data-act="offerno" data-id="${o.id}">Reddet</button></div></div>`);}).join('');
  const rows=G.deals.map(d=>{const c=comp(d.cid),ml=d.mLast||{},left=Math.max(0,Math.ceil((d.end-G.day)/30));
    const st=d.type==='cpuSell'?(LANG_EN?`${num(d.mDel)} delivered${d.mShort>1?` · <span class="neg">${num(d.mShort)} short</span>`:''}${d.strikes?` · <span class="neg">${d.strikes} ihtar</span>`:''}`:`${num(d.mDel)} teslim${d.mShort>1?` · <span class="neg">${num(d.mShort)} eksik</span>`:''}${d.strikes?` · <span class="neg">${d.strikes} ihtar</span>`:''}`):d.type==='osLic'?(LANG_EN?`${num(d.mDel)} devices`:`${num(d.mDel)} cihaz`):(LANG_EN?`${num(d.mDel)}/${num(d.q)} received`:`${num(d.mDel)}/${num(d.q)} alındı`);
    return (LANG_EN?`<tr><td><b>${esc(c?c.name:'?')}</b><div class="small muted">${DEAL_T[d.type]}</div></td><td class="small">${esc(dealText(d))}</td><td class="small">${st}</td><td class="r num ${dealMonthly(d)>=0?'pos':'neg'}">${money(dealMonthly(d))}</td><td class="r num">${left} mo</td><td>${relChip(c)}</td><td class="r"><button class="btn sm ghost" data-act="dealend" data-id="${d.id}">Terminate</button></td></tr>`:`<tr><td><b>${esc(c?c.name:'?')}</b><div class="small muted">${DEAL_T[d.type]}</div></td><td class="small">${esc(dealText(d))}</td><td class="small">${st}</td><td class="r num ${dealMonthly(d)>=0?'pos':'neg'}">${money(dealMonthly(d))}</td><td class="r num">${left} ay</td><td>${relChip(c)}</td><td class="r"><button class="btn sm ghost" data-act="dealend" data-id="${d.id}">Feshet</button></td></tr>`);}).join('');
  let form='';
  const dd=UI.dd;
  if(dd&&comp(dd.cid)&&!comp(dd.cid).dead){
    const c=comp(dd.cid),el=dealElig(c),ok=!el[dd.type]&&prod(dd.pid),ch=ok?dealChance(dd):0;
    const types=Object.keys(DEAL_T).map(t=>`<option value="${t}" ${dd.type===t?'selected':''} ${el[t]?'disabled':''}>${DEAL_T[t]}${el[t]?' · '+el[t]:''}</option>`).join('');
    let fields='',fx2='';
    if(ok&&dd.type==='cpuSell'){const p=prod(dd.pid),f=cpuFair(p),mx=Math.max(2000,Math.round(devUnits(c)/500)*500);
      fields=(LANG_EN?`<label class="f" for="dd-p">Processor<select id="dd-p" data-bind="dd.pid" data-num="1">${myCPUs().map(q=>`<option value="${q.id}" ${q.id===dd.pid?'selected':''}>${esc(q.name)}</option>`).join('')}</select></label>
        <label class="f" for="dd-q">Units per month: <b>${num(dd.q)}</b><input type="range" id="dd-q" min="500" max="${mx}" step="500" value="${dd.q}" data-bind="dd.q" data-num="1"></label>
        <label class="f" for="dd-pr">Unit price ($)<input type="number" id="dd-pr" min="1" value="${dd.price}" data-bind="dd.price" data-num="1"></label>`:`<label class="f" for="dd-p">İşlemci<select id="dd-p" data-bind="dd.pid" data-num="1">${myCPUs().map(q=>`<option value="${q.id}" ${q.id===dd.pid?'selected':''}>${esc(q.name)}</option>`).join('')}</select></label>
        <label class="f" for="dd-q">Aylık adet: <b>${num(dd.q)}</b><input type="range" id="dd-q" min="500" max="${mx}" step="500" value="${dd.q}" data-bind="dd.q" data-num="1"></label>
        <label class="f" for="dd-pr">Adet fiyatı ($)<input type="number" id="dd-pr" min="1" value="${dd.price}" data-bind="dd.price" data-num="1"></label>`);
      fx2=(LANG_EN?`Fair price ~${money(f)} · your unit cost ~${money(estUC('cpu',p.spec,p.plan.site))} · rival's monthly device sales ${num(devUnits(c))}. If your production can't cover these volumes, you pay a penalty. Your partner's devices become 8% more appealing with your chip.`:`Adil fiyat ~${money(f)} · birim maliyetin ~${money(estUC('cpu',p.spec,p.plan.site))} · rakibin aylık cihaz satışı ${num(devUnits(c))}. Üretimin bu adetleri karşılamazsa ceza ödersin. Ortağının cihazları senin çipinle %8 daha çekici olur.`);}
    else if(ok&&dd.type==='osLic'){const p=prod(dd.pid);
      fields=(LANG_EN?`<label class="f" for="dd-pr">License per device ($)<input type="number" id="dd-pr" min="0.5" step="0.5" value="${dd.price}" data-bind="dd.price" data-num="1"></label>`:`<label class="f" for="dd-pr">Cihaz başı lisans ($)<input type="number" id="dd-pr" min="0.5" step="0.5" value="${dd.price}" data-bind="dd.price" data-num="1"></label>`);
      fx2=(LANG_EN?`${esc(p.name)} license price: ${money(p.price)}. The deal covers half of your partner's devices; they're added to your installed base (app store revenue). Rival's monthly device sales: ${num(devUnits(c))}.`:`${esc(p.name)} lisans fiyatı ${money(p.price)}. Anlaşma ortağın cihazlarının yarısını kapsar; bu cihazlar kurulu tabanına eklenir (uygulama mağazası geliri). Rakibin aylık cihaz satışı ${num(devUnits(c))}.`);}
    else if(ok&&dd.type==='cpuBuy'){const p=prod(dd.pid);
      fields=(LANG_EN?`<label class="f" for="dd-q">Minimum per month: <b>${num(dd.q)}</b><input type="range" id="dd-q" min="500" max="${Math.max(5000,dd.q*2)}" step="500" value="${dd.q}" data-bind="dd.q" data-num="1"></label>
        <label class="f" for="dd-d">Discount: <b>${Math.round(dd.price*100)}%</b><input type="range" id="dd-d" min="0.03" max="0.3" step="0.01" value="${dd.price}" data-bind="dd.price" data-num="1"></label>`:`<label class="f" for="dd-q">Aylık en az: <b>${num(dd.q)}</b><input type="range" id="dd-q" min="500" max="${Math.max(5000,dd.q*2)}" step="500" value="${dd.q}" data-bind="dd.q" data-num="1"></label>
        <label class="f" for="dd-d">İndirim: <b>%${Math.round(dd.price*100)}</b><input type="range" id="dd-d" min="0.03" max="0.3" step="0.01" value="${dd.price}" data-bind="dd.price" data-num="1"></label>`);
      fx2=(LANG_EN?`${esc(p.name)} list price is ${money(p.price)}; ${money(p.price*(1-dd.price))} for you. You currently use ~${num(cpuUse(p.id))} units a month. If you fall short of your commitment at month end, you pay a penalty per missing unit.`:`${esc(p.name)} liste fiyatı ${money(p.price)}, sana ${money(p.price*(1-dd.price))}. Şu an ayda ~${num(cpuUse(p.id))} adet kullanıyorsun. Ay sonunda taahhüdün altında kalırsan eksik adet başına ceza ödersin.`);}
    form=(LANG_EN?`<div class="proj"><div class="row between"><b>New deal proposal</b><button class="btn sm ghost" data-act="ddclose">Close</button></div>
      <div class="form">
        <label class="f" for="dd-c">Company<select id="dd-c" data-bind="dd.cid">${live.map(x=>`<option value="${x.id}" ${x.id===dd.cid?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label>
        <label class="f" for="dd-t">Type<select id="dd-t" data-bind="dd.type">${types}</select></label>
        ${fields}
        <label class="f" for="dd-m">Duration<select id="dd-m" data-bind="dd.months" data-num="1">${[6,12,24].map(m=>`<option value="${m}" ${dd.months===m?'selected':''}>${m} months</option>`).join('')}</select></label>
      </div>
      ${ok?`<div class="small muted">${fx2}</div><div class="row between"><span>Monthly impact <b class="${dealMonthly(dd)>=0?'pos':'neg'}">${money(dealMonthly(dd))}</b> · Acceptance chance <b class="${ch>=0.6?'pos':ch>=0.3?'warn':'neg'}">${Math.round(ch*100)}%</b> · Relationship ${relChip(c)}</span><button class="btn sm primary" data-act="dealprop" ${(c.dealCool||0)>G.day?'disabled':''}>${(c.dealCool||0)>G.day?`Wait ${c.dealCool-G.day} days`:"Propose"}</button></div>`:`<div class="small neg">${esc(el[dd.type]||"This deal isn't possible right now.")}</div>`}
    </div>`:`<div class="proj"><div class="row between"><b>Yeni anlaşma önerisi</b><button class="btn sm ghost" data-act="ddclose">Kapat</button></div>
      <div class="form">
        <label class="f" for="dd-c">Şirket<select id="dd-c" data-bind="dd.cid">${live.map(x=>`<option value="${x.id}" ${x.id===dd.cid?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label>
        <label class="f" for="dd-t">Tür<select id="dd-t" data-bind="dd.type">${types}</select></label>
        ${fields}
        <label class="f" for="dd-m">Süre<select id="dd-m" data-bind="dd.months" data-num="1">${[6,12,24].map(m=>`<option value="${m}" ${dd.months===m?'selected':''}>${m} ay</option>`).join('')}</select></label>
      </div>
      ${ok?`<div class="small muted">${fx2}</div><div class="row between"><span>Aylık etki <b class="${dealMonthly(dd)>=0?'pos':'neg'}">${money(dealMonthly(dd))}</b> · Kabul ihtimali <b class="${ch>=0.6?'pos':ch>=0.3?'warn':'neg'}">%${Math.round(ch*100)}</b> · İlişki ${relChip(c)}</span><button class="btn sm primary" data-act="dealprop" ${(c.dealCool||0)>G.day?'disabled':''}>${(c.dealCool||0)>G.day?`${c.dealCool-G.day} gün bekle`:'Teklif et'}</button></div>`:`<div class="small neg">${esc(el[dd.type]||'Bu anlaşma şu an mümkün değil.')}</div>`}
    </div>`);
  }
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Partnerships</h2><span class="sub">${G.deals.length} active deals · net monthly ${money(mrev)}</span></div><div class="pb col">
    <p class="small muted">Rivals can also be your customers or suppliers. Sell your processor for their devices, license your operating system, or buy their chips at a discount. Keep your word and the relationship improves and they're less likely to move against you; break it and you pay a penalty.</p>
    ${offers?`<div class="grid3">${offers}</div>`:''}
    ${rows?`<div class="tw"><table><thead><tr><th>Partner</th><th>Terms</th><th>This month</th><th class="r">Monthly</th><th class="r">Remaining</th><th>Relationship</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:''}
    ${form||`<div class="row"><button class="btn sm primary" data-act="dealnew">Propose a deal</button></div>`}
  </div></section>`:`<section class="panel"><div class="ph"><h2>Ortaklıklar</h2><span class="sub">${G.deals.length} aktif anlaşma · aylık net ${money(mrev)}</span></div><div class="pb col">
    <p class="small muted">Rakipler aynı zamanda müşterin ya da tedarikçin olabilir. İşlemcini onların cihazlarına sat, işletim sistemini lisansla ya da onların çipini indirimli al. Sözüne uyarsan ilişki iyileşir ve sana karşı hamle yapma ihtimalleri azalır; uymazsan ceza ödersin.</p>
    ${offers?`<div class="grid3">${offers}</div>`:''}
    ${rows?`<div class="tw"><table><thead><tr><th>Ortak</th><th>Şartlar</th><th>Bu ay</th><th class="r">Aylık</th><th class="r">Kalan</th><th>İlişki</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:''}
    ${form||`<div class="row"><button class="btn sm primary" data-act="dealnew">Anlaşma öner</button></div>`}
  </div></section>`);
}

