/* ============================== SEASONS & LAUNCHES ============================== */
const SEASON={
  app:  [1.05,0.95,0.95,0.95,1.0,1.1,1.15,1.1,0.95,0.95,1.0,1.2],
  saas: [1.12,1.05,1.05,1.0,1.0,0.95,0.88,0.92,1.05,1.05,1.0,0.88],
  os:   [0.9,0.9,0.95,0.95,0.95,0.95,1.0,1.1,1.1,1.0,1.15,1.2],
  cpu:  [0.9,0.9,0.95,0.95,0.95,1.0,1.05,1.15,1.1,1.1,1.15,1.05],
  phone:[0.82,0.85,0.95,0.95,0.95,0.92,0.92,0.98,1.2,1.1,1.25,1.45],
  pc:   [0.85,0.85,0.95,0.92,0.9,0.9,0.95,1.25,1.25,1.0,1.3,1.3],
  wear: [0.85,0.85,0.95,0.95,1.0,1.0,0.95,0.95,1.1,1.0,1.25,1.45],
  console:[0.75,0.7,0.8,0.8,0.8,0.85,0.85,0.9,1.0,1.1,1.5,1.9],
  ai:   [1.05,1.0,1.0,1.0,0.95,0.92,0.9,0.95,1.08,1.05,1.05,1.05],
  xr:   [0.8,0.75,0.85,0.85,0.85,0.9,0.9,0.95,1.0,1.05,1.4,1.7],
  car:  [0.95,0.95,1.05,1.05,1.05,1.0,0.95,0.95,1.0,1.0,1.0,1.05],
  robo: [0.95,0.95,1.0,1.0,1.0,1.0,0.95,0.95,1.0,1.05,1.05,1.1],
  qc:   [1.0,1.0,1.0,1.0,1.0,1.0,0.9,0.9,1.0,1.05,1.0,1.15],
  iot:  [0.85,0.85,0.95,0.95,0.95,0.95,0.95,0.95,1.05,1.05,1.3,1.45],
};
const SEASON_N=[(LANG_EN?"Post-holiday slump":'Yılbaşı sonrası durgunluk'),(LANG_EN?"Post-holiday slump":'Yılbaşı sonrası durgunluk'),(LANG_EN?"Spring":'Bahar'),(LANG_EN?"Spring":'Bahar'),(LANG_EN?"Spring":'Bahar'),(LANG_EN?"Summer vacation":'Yaz tatili'),(LANG_EN?"Summer vacation":'Yaz tatili'),(LANG_EN?"Back to school":'Okula dönüş'),(LANG_EN?"Back to school":'Okula dönüş'),(LANG_EN?"Fall":'Sonbahar'),(LANG_EN?"Black Friday":'Black Friday'),(LANG_EN?"Holiday shopping":'Yılbaşı alışverişi')];
function seasonMult(cat,day=G.day){
  const d=dateOf(day),m=d.getMonth(),f=(d.getDate()-15)/30,a=SEASON[cat];
  return f<0?a[(m+11)%12]+(a[m]-a[(m+11)%12])*(1+f):a[m]+(a[(m+1)%12]-a[m])*f;
}
const dayOfDate=dt=>Math.round((dt-new Date(2015,0,1))/864e5);
const LTIER={
  press:{n:(LANG_EN?"Press conference":'Basın toplantısı'),cost:40000,m:1.15,brand:0.5,leak:0.0015,fail:0.02},
  stage:{n:(LANG_EN?"Stage event":'Sahne etkinliği'),cost:300000,m:1.35,brand:1.5,leak:0.003,fail:0.05},
  keynote:{n:(LANG_EN?"Mega keynote":'Dev keynote'),cost:1.5e6,m:1.6,brand:3,leak:0.004,fail:0.07},
};
function lpOptions(cat){const d=dateOf(G.day),out=[{v:-1,l:(LANG_EN?"When the project is done":'Proje tamamlanınca'),day:null}];
  for(let k=1;k<=9;k++){const dt=new Date(d.getFullYear(),d.getMonth()+k,15),day=dayOfDate(dt);out.push({v:k,l:`15 ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`,day,sm:seasonMult(cat,day)});}
  return out;}
function projEta(pr){const team=G.emps.filter(e=>e.proj===pr.id&&!e.leave),rate={};for(const e of team)rate[e.role]=(rate[e.role]||0)+e.skill*effMult(e)*aiwM(e.role);
  let eta=0;for(const t in pr.req){const left=pr.req[t]-pr.prog[t];if(left>0)eta=Math.max(eta,rate[t]?left/rate[t]:Infinity);}return eta;}
function doLaunch(p,ev){
  if(ev.t!=='press'&&!ev.stage&&!ev.auto&&!PREF.stageAuto){stStart(p,ev);return;}
  ceoXP(10+(ev.stage?ev.stage.H/5:0),`${LTIER[ev.t].n}: ${p.name}`);
  sfx('launch');
  const T=LTIER[ev.t],mk=G.emps.filter(e=>e.role==='mkt'&&!e.leave).reduce((a,e)=>a+e.skill,0);if(ev.t==='keynote')(G.flags=G.flags||{}).keynote=true;
  const q=clamp(((p.review||6)-4.5)/3.5,0.2,1.4);
  let m=1+(T.m-1)*q*(1+Math.min(0.4,mk*0.01));
  const sm=seasonMult(p.cat),inS=sm>=1.15;if(inS)m*=1.08;
  if(ev.leaked)m=1+(m-1)*0.6;
  const stg=ev.stage,fail=stg?stg.crash:Math.random()<T.fail;
  if(stg)m*=stg.sm;
  if(fail){m=Math.max(0.95,1+(m-1)*0.4);brAdd(p,-1);}else brAdd(p,T.brand*q);
  const rh=p.revHype||p.hype,rm=rh&&rh.until>G.day?rh.m:1;
  p.hype={m:rm*m,until:G.day+60};delete p.revHype;
  G.momentum+=fail?0:Math.round(T.brand*2);if(ev.t!=='press')tl('launch',(LANG_EN?`${p.name} was unveiled at a ${T.n.toLocaleLowerCase(LOC)}${stg?` · ${stg.g.toLocaleLowerCase(LOC)} launch`:''}${fail?" (demo crashed)":''}`:`${p.name}, ${T.n.toLocaleLowerCase(LOC)} ile tanıtıldı${stg?` · ${stg.g.toLocaleLowerCase(LOC)} lansman`:''}${fail?' (demo çöktü)':''}`));
  OV.prodCount=-2;
  if(stg)news((LANG_EN?`${p.name} launch: ${stg.g.toLocaleLowerCase(LOC)} (crowd excitement ${Math.round(stg.H)}/100)${fail?"; live demo crashed":''}. Appeal ×${fx(p.hype.m,2)} for 60 days.`:`${p.name} lansmanı: ${stg.g.toLocaleLowerCase(LOC)} (salon coşkusu ${Math.round(stg.H)}/100)${fail?'; canlı demo çöktü':''}. 60 gün çekicilik ×${fx(p.hype.m,2)}.`),stg.H>=50&&!fail?'good':'bad',true);else
  news(fail?(LANG_EN?`The live demo crashed at the ${p.name} launch! The hall went silent; the impact was limited (appeal ×${fx(m,2)}).`:`${p.name} lansmanında canlı demo çöktü! Salon sessizliğe gömüldü; etki sınırlı kaldı (çekicilik ×${fx(m,2)}).`)
    :(LANG_EN?`${p.name} was unveiled at a ${T.n.toLocaleLowerCase(LOC)}${ev.leaked?" (the leak dulled the surprise)":''}${inS?"; it landed in peak season":''}. Appeal ×${fx(p.hype.m,2)} for 60 days.`:`${p.name}, ${T.n.toLocaleLowerCase(LOC)} ile tanıtıldı${ev.leaked?' (sızıntı yüzünden sürpriz etkisi azaldı)':''}${inS?'; yoğun sezona denk geldi':''}. 60 gün çekicilik ×${fx(p.hype.m,2)}.`),fail?'bad':'good',true);
}
function launchDaily(){
  for(const pr of G.projects){const ev=pr.ev;if(!ev||pr.betaUntil)continue;
    if(ev.day!=null&&G.day>=ev.day){const extra=LTIER[ev.t].cost*infl()*0.25;spend(extra,'other');ev.day+=30;ev.post=(ev.post||0)+1;G.brand=clamp(G.brand-1,0,100);
      news((LANG_EN?`${pr.name} wasn't ready; the launch event was postponed 30 days (${money(extra)} extra cost). The press noticed the delay.`:`${pr.name} yetişmedi; lansman etkinliği 30 gün ertelendi (${money(extra)} ek masraf). Basın ertelemeyi fark etti.`),'bad',true);}
    else if(!ev.leaked&&Math.random()<LTIER[ev.t].leak*0.5){ev.leaked=true;news((LANG_EN?`Details about ${pr.name} leaked online. The launch will be less of a surprise.`:`${pr.name} hakkında bilgiler internete sızdı. Lansmanın sürpriz etkisi azalacak.`),'bad',true);}
  }
  for(const p of G.products){const ev=p.waitLaunch;if(!ev)continue;
    if(!ev.leaked&&Math.random()<LTIER[ev.t].leak){ev.leaked=true;news((LANG_EN?`Footage of ${p.name} leaked online before launch!`:`${p.name} görüntüleri lansmandan önce internete sızdı!`),'bad',true);}
    if(G.day>=ev.day){delete p.waitLaunch;p.active=true;p.launch=G.day;doLaunch(p,ev);rivalReact(p);try{launchMoment(p);}catch(e){}}
  }
}
function lpBlock(pr){
  const ev=pr.ev;
  if(ev)return (LANG_EN?`<div class="row between small" style="border-top:1px solid var(--line);padding-top:6px"><span>Launch: <b>${LTIER[ev.t].n}</b> · ${ev.day==null?"on completion":fmtDate(ev.day)}${ev.day!=null?` · demand ×${fx(seasonMult(pr.cat,ev.day),2)}`:''}${ev.leaked?" · <span class=\"neg\">leaked</span>":''}${ev.post?` · <span class="warn">postponed ${ev.post} times</span>`:''}</span><button class="btn sm ghost" data-act="lpcancel" data-id="${pr.id}">Cancel (50% refund)</button></div>`:`<div class="row between small" style="border-top:1px solid var(--line);padding-top:6px"><span>Lansman: <b>${LTIER[ev.t].n}</b> · ${ev.day==null?'tamamlanınca':fmtDate(ev.day)}${ev.day!=null?` · talep ×${fx(seasonMult(pr.cat,ev.day),2)}`:''}${ev.leaked?' · <span class="neg">sızdı</span>':''}${ev.post?` · <span class="warn">${ev.post} kez ertelendi</span>`:''}</span><button class="btn sm ghost" data-act="lpcancel" data-id="${pr.id}">İptal (%50 iade)</button></div>`);
  if(UI.lp!==pr.id)return (LANG_EN?`<div class="row small" style="border-top:1px solid var(--line);padding-top:6px"><button class="btn sm" data-act="lpopen" data-id="${pr.id}">Plan a launch event</button><span class="muted">The product waits until the event day; hardware inventory is built in advance.</span></div>`:`<div class="row small" style="border-top:1px solid var(--line);padding-top:6px"><button class="btn sm" data-act="lpopen" data-id="${pr.id}">Lansman etkinliği planla</button><span class="muted">Ürün etkinlik gününe kadar bekler, donanım stoğu önceden üretilir.</span></div>`);
  const d=UI.lpd,eta=projEta(pr),opts=lpOptions(pr.cat),sel=opts.find(o=>o.v===d.mo)||opts[0],T=LTIER[d.t];
  const late=sel.day!=null&&(eta===Infinity||G.day+eta>sel.day);
  return (LANG_EN?`<div class="col" style="border-top:1px solid var(--line);padding-top:8px;gap:8px"><div class="form">
    <label class="f" for="lp-t-${pr.id}">Event<select id="lp-t-${pr.id}" data-bind="lp.t">${Object.entries(LTIER).map(([k,x])=>`<option value="${k}" ${d.t===k?'selected':''}>${x.n} · ${money(x.cost*infl())}</option>`).join('')}</select></label>
    <label class="f" for="lp-m-${pr.id}">Date<select id="lp-m-${pr.id}" data-bind="lp.mo" data-num="1">${opts.map(o=>`<option value="${o.v}" ${o.v===sel.v?'selected':''}>${o.l}${o.sm?` · demand ×${fx(o.sm,2)}${o.sm>=1.15?' (sezon)':''}`:''}</option>`).join('')}</select></label></div>
    <div class="small muted">Appeal up to ×${fx(T.m,2)} (depends on press score and marketing team), brand +${T.brand}. Risk of leaks and demo mishaps.${late?" <span class=\"neg\">The project may not be ready by this date; if not, the event is postponed at extra cost.</span>":''}</div>
    <div class="row"><button class="btn sm primary" data-act="lpbook" data-id="${pr.id}" ${G.cash<T.cost*infl()?'disabled':''}>Book ${money(T.cost*infl())}</button><button class="btn sm ghost" data-act="lpclose">Cancel</button></div></div>`:`<div class="col" style="border-top:1px solid var(--line);padding-top:8px;gap:8px"><div class="form">
    <label class="f" for="lp-t-${pr.id}">Etkinlik<select id="lp-t-${pr.id}" data-bind="lp.t">${Object.entries(LTIER).map(([k,x])=>`<option value="${k}" ${d.t===k?'selected':''}>${x.n} · ${money(x.cost*infl())}</option>`).join('')}</select></label>
    <label class="f" for="lp-m-${pr.id}">Tarih<select id="lp-m-${pr.id}" data-bind="lp.mo" data-num="1">${opts.map(o=>`<option value="${o.v}" ${o.v===sel.v?'selected':''}>${o.l}${o.sm?` · talep ×${fx(o.sm,2)}${o.sm>=1.15?' (sezon)':''}`:''}</option>`).join('')}</select></label></div>
    <div class="small muted">Çekicilik en fazla ×${fx(T.m,2)} (basın puanı ve pazarlama ekibine bağlı), marka +${T.brand}. Sızıntı ve demo aksaklığı riski var.${late?' <span class="neg">Proje bu tarihe yetişmeyebilir; yetişmezse etkinlik ertelenir ve ek masraf çıkar.</span>':''}</div>
    <div class="row"><button class="btn sm primary" data-act="lpbook" data-id="${pr.id}" ${G.cash<T.cost*infl()?'disabled':''}>Rezervasyon yap ${money(T.cost*infl())}</button><button class="btn sm ghost" data-act="lpclose">Vazgeç</button></div></div>`);
}
function vSeason(){
  const cm=dateOf(G.day).getMonth();
  const cell=(v,i)=>{const pctv=Math.round((v-1)*100),bg=v>=1?`color-mix(in srgb, var(--ok) ${Math.min(70,(v-1)*160)}%, transparent)`:`color-mix(in srgb, var(--bad) ${Math.min(70,(1-v)*200)}%, transparent)`;
    return (LANG_EN?`<td class="r num small" style="background:${bg};${i===cm?"outline:2px solid var(--ink);outline-offset:-2px;font-weight:700":''}" title="${MONTHS[i]}: demand ${pctv>=0?'+':''}${pctv}%">${pctv>0?'+':''}${pctv}</td>`:`<td class="r num small" style="background:${bg};${i===cm?'outline:2px solid var(--ink);outline-offset:-2px;font-weight:700':''}" title="${MONTHS[i]}: talep ${pctv>=0?'+':''}${pctv}%">${pctv>0?'+':''}${pctv}</td>`);};
  const nxt=CAT_ORDER.map(c=>[c,seasonMult(c,G.day+30)-seasonMult(c)]).sort((a,b)=>b[1]-a[1])[0];
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Seasonal demand</h2><span class="sub">Now: <b>${SEASON_N[cm]}</b>${nxt[1]>0.08?` · next month ${CATS[nxt[0]].n.toLocaleLowerCase(LOC)} demand rises`:''}</span></div>
    <div class="tw"><table><thead><tr><th>Category (demand %)</th>${MONTHS.map((m,i)=>`<th class="r" ${i===cm?"style=\"color:var(--ink)\"":''}>${m}</th>`).join('')}<th class="r">Now</th></tr></thead>
    <tbody>${CAT_ORDER.map(c=>`<tr><td><b>${CATS[c].n}</b></td>${SEASON[c].map(cell).join('')}<td class="r num"><b class="${seasonMult(c)>=1?'pos':'neg'}">×${fx(seasonMult(c),2)}</b></td></tr>`).join('')}</tbody></table></div>
    <p class="pb small muted" style="margin:0">Phone and computer sales boom over the holidays and Black Friday, computers rise at back-to-school, and device demand drops after New Year. Build up hardware inventory before the season; time big launches to hit it.</p></section>`:`<section class="panel"><div class="ph"><h2>Mevsimsel talep</h2><span class="sub">Şu an: <b>${SEASON_N[cm]}</b>${nxt[1]>0.08?` · gelecek ay ${CATS[nxt[0]].n.toLocaleLowerCase(LOC)} talebi yükseliyor`:''}</span></div>
    <div class="tw"><table><thead><tr><th>Kategori (talep %)</th>${MONTHS.map((m,i)=>`<th class="r" ${i===cm?'style="color:var(--ink)"':''}>${m}</th>`).join('')}<th class="r">Şimdi</th></tr></thead>
    <tbody>${CAT_ORDER.map(c=>`<tr><td><b>${CATS[c].n}</b></td>${SEASON[c].map(cell).join('')}<td class="r num"><b class="${seasonMult(c)>=1?'pos':'neg'}">×${fx(seasonMult(c),2)}</b></td></tr>`).join('')}</tbody></table></div>
    <p class="pb small muted" style="margin:0">Yılbaşı ve Black Friday'de telefon ve bilgisayar satışları patlar, okula dönüşte bilgisayar yükselir, yılbaşından sonra cihaz talebi düşer. Donanım için stoğu sezondan önce biriktir; büyük lansmanları sezona denk getir.</p></section>`);
}


