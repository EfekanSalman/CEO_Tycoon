/* ============================== RAW MATERIALS ============================== */
/* Beş ham madde. Her parça kategorisinin fiyat hedefinin %40'ı ham madde karışımına bağlıdır (RAW_SH); karışım 1 iken eski davranış aynıdır.
   Fiyatlar ayda bir, kendi rastgele üreteciyle değişir (oyunun ortak akışını kaydırmaz); ara sıra şoklar yaşanır.
   Korunma: maden (üretimini piyasa fiyatından satar, gideri sabittir) ve 12 aylık vadeli anlaşma (fark nakit olarak ödenir). */
const RAW={si:{n:(LANG_EN?"Silicon":'Silisyum'),loc:(LANG_EN?"Norway":'Norveç'),vol:0.05},li:{n:(LANG_EN?"Lithium":'Lityum'),loc:(LANG_EN?"Chile":'Şili'),vol:0.09},ree:{n:(LANG_EN?"Rare earth elements":'Nadir toprak elementleri'),loc:(LANG_EN?"Beylikova, Eskişehir":'Eskişehir Beylikova'),vol:0.08},al:{n:(LANG_EN?"Aluminum":'Alüminyum'),loc:(LANG_EN?"Australia":'Avustralya'),vol:0.04},cu:{n:(LANG_EN?"Copper":'Bakır'),loc:(LANG_EN?"Zambia":'Zambiya'),vol:0.06}};
const RAW_K=Object.keys(RAW),RAW_SH=0.4;
const PART_RN={wafer:(LANG_EN?"Chips":'Yonga'),memory:(LANG_EN?"Memory":'Bellek'),screen:(LANG_EN?"Display":'Ekran'),camera:(LANG_EN?"Camera":'Kamera'),battery:(LANG_EN?"Battery":'Batarya'),gpu:(LANG_EN?"Graphics":'Grafik'),motor:(LANG_EN?"Motor":'Motor'),chassis:(LANG_EN?"Housing":'Kasa')};
const PART_RAW={wafer:{si:1},memory:{si:0.6,cu:0.4},screen:{ree:0.5,si:0.3,al:0.2},camera:{ree:0.6,si:0.4},battery:{li:0.8,al:0.2},gpu:{si:0.6,cu:0.4},motor:{ree:0.6,cu:0.4},chassis:{al:0.8,cu:0.2}};
const RAW_SHOCK=[{m:'ree',t:(LANG_EN?"Rare earth exports were restricted":'Nadir toprak ihracatına kısıtlama geldi'),x:1.8},{m:'li',t:(LANG_EN?"Electric vehicle demand sent lithium soaring":'Elektrikli araç talebi lityumu uçurdu'),x:2},{m:'si',t:(LANG_EN?"Energy crisis at silicon refineries":'Silisyum arıtma tesislerinde enerji krizi'),x:1.5},{m:'cu',t:(LANG_EN?"Strike at a major copper mine":'Büyük bakır madeninde grev'),x:1.4},{m:'al',t:(LANG_EN?"New tariff on aluminum":'Alüminyuma yeni gümrük vergisi'),x:1.35},{m:'li',t:(LANG_EN?"New lithium deposits found":'Yeni lityum yatakları bulundu'),x:0.65},{m:'ree',t:(LANG_EN?"Recycling boosted rare earth supply":'Geri dönüşümle nadir toprak arzı arttı'),x:0.75}];
const MINE={capV:0.8e6,upk:0.45e6,cost:12e6,build:120,max:3};
const newRaw=()=>{const o={p:{},h:{},sh:{},mine:{},fut:{},seed:null,rev:0,pl:0};for(const m of RAW_K){o.p[m]=1;o.h[m]=[];}return o;};
const rawOf=()=>G.raw||(G.raw=newRaw());
function rawR(){const R=rawOf();let t=(R.seed=(R.seed==null?(G.day*104729+7)>>>0:R.seed)+0x6D2B79F5>>>0);t=Math.imul(t^t>>>15,1|t);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;}
const rawN=()=>{let u=0;for(let i=0;i<6;i++)u+=rawR();return (u-3)/Math.sqrt(0.5);};
function rawBlend(c){const w=PART_RAW[c];if(!w||!G.raw)return 1;let s=0;for(const m in w)s+=w[m]*(G.raw.p[m]||1);return s;}
const rawFx=c=>1-RAW_SH+RAW_SH*rawBlend(c);
// oyuncunun aylık ham madde kullanımı (baz fiyatla, $): parça harcamasının ham madde payı
function rawUse(m){let s=0;for(const c in PART_RAW){const w=PART_RAW[c][m];if(!w)continue;s+=catMonthSpend(c,1)/Math.max(0.3,G.px[c]||1)*RAW_SH*w;}return s;}
const mineOf=m=>rawOf().mine[m];
// v126: maden çıktısı kendi üretimine verilirse, karşılanan kısım için ham madde iç maliyetle (RAW_OWN) gelir; fazlası piyasaya satılır
const RAW_OWN=0.6;
const RCV={};
function rawCover(m){const x=G.raw&&G.raw.mine[m];if(!x||x.route!=='own')return 0;const k=G.day+'|'+x.lvl+'|'+x.ready,c=RCV[m];if(c&&c.k===k)return c.v;const L=mineLvl(m),u=rawUse(m),v=L>0&&u>0?Math.min(1,MINE.capV*L/u):0;RCV[m]={k,v};return v;}
function rawOwnR(c){const w=PART_RAW[c];if(!w||!G.raw)return 1;let s=0,any=false;for(const m in w){const cv=rawCover(m),sc=b2bScCover(m),f=Math.min(1-cv,sc.f);if(cv>0||f>0)any=true;s+=w[m]*(cv*RAW_OWN+f*sc.p+(1-cv-f)*(G.raw.p[m]||1));}if(!any)return 1;return (1-RAW_SH+RAW_SH*s)/rawFx(c);}
const mineLvl=m=>{const x=mineOf(m);return x?x.lvl-(x.ready>G.day?1:0):0;};
const mineCost=()=>MINE.cost*infl();
function rawMonthly(){const R=rawOf();
  for(const m of RAW_K){const sh=R.sh[m],tgt=sh&&sh.until>G.day?sh.x:1;let p=R.p[m]*Math.exp(RAW[m].vol*rawN())+(tgt-R.p[m])*0.18;R.p[m]=clamp(p,0.4,3);
    R.h[m].push(R.p[m]);if(R.h[m].length>36)R.h[m].shift();if(sh&&sh.until<=G.day)delete R.sh[m];}
  if(rawR()<0.05){const s=RAW_SHOCK[Math.floor(rawR()*RAW_SHOCK.length)];if(!R.sh[s.m]){R.sh[s.m]={x:s.x,until:G.day+30*(4+Math.floor(rawR()*6))};news((LANG_EN?`Raw materials market: ${s.t}. ${RAW[s.m].n} prices ${s.x>1?"are rising":"are falling"}.`:`Ham madde piyasası: ${s.t}. ${RAW[s.m].n} fiyatları ${s.x>1?'yükseliyor':'düşüyor'}.`),s.x>1?'bad':'good',true);}}
  // madenler: üretim piyasa fiyatından satılır, gider sabit
  let rev=0,cost=0;for(const m in R.mine){const L=mineLvl(m),x=R.mine[m];cost+=MINE.upk*x.lvl*infl()*(x.ready>G.day?0.3:1);if(L>0){const own=x.route==='own'?Math.min(MINE.capV*L,rawUse(m)):0;x.used=own;const sur=MINE.capV*L-own,take=b2bRawTake(m,sur);rev+=(sur-take)*R.p[m]*infl();}}
  if(cost)spend(cost,'other');if(rev){G.cash+=rev;G.month.rev+=rev;}R.rev=rev-cost;
  // vadeli anlaşmalar: fark nakit ödenir
  let pl=0;for(const m in R.fut){const f=R.fut[m];const d=(R.p[m]-f.p0)*f.q;pl+=d;if(d>0){G.cash+=d;G.month.rev+=d;}else if(d<0)spend(-d,'other');if(G.day>=f.until){delete R.fut[m];news((LANG_EN?`The ${RAW[m].n} futures contract has expired.`:`${RAW[m].n} vadeli anlaşması sona erdi.`),'');}}
  R.pl=pl;}
function rawAct(a,m){const R=rawOf();if(!RAW[m])return;
  if(a==='minebuy'){const x=R.mine[m],c=mineCost();if(x&&(x.lvl>=MINE.max||x.ready>G.day))return;if(G.cash<c){showToast((LANG_EN?"Not enough cash for the mine.":'Maden için yeterli nakit yok.'),'bad');return;}spend(c,'capex');
    if(x){x.lvl++;x.ready=G.day+60;news((LANG_EN?`Expanding the ${RAW[m].n} mine (level ${x.lvl}).`:`${RAW[m].n} madeni genişletiliyor (seviye ${x.lvl}).`),'');}else{R.mine[m]={lvl:1,ready:G.day+MINE.build,route:'own'};news((LANG_EN?`Building a new ${RAW[m].n.toLocaleLowerCase(LOC)} mine: ${RAW[m].loc} (${MINE.build} days).`:`Yeni ${RAW[m].n.toLocaleLowerCase(LOC)} madeni kuruluyor: ${RAW[m].loc} (${MINE.build} gün).`),'good',true);}}
  else if(a==='mineroute'){const x=R.mine[m];if(!x)return;x.route=x.route==='own'?'sell':'own';news((LANG_EN?`The ${RAW[m].n} mine now ${x.route==='own'?"feeds your own production":"sells its output on the market"}.`:`${RAW[m].n} madeni artık ${x.route==='own'?'kendi üretimini besliyor':'üretimini piyasaya satıyor'}.`),'');}
  else if(a==='futlock'){if(R.fut[m])return;const q=rawUse(m)*infl();if(q<1000){showToast((LANG_EN?"You don't use this raw material yet.":'Bu ham maddeyi henüz kullanmıyorsun.'),'bad');return;}const fee=q*12*0.02;if(G.cash<fee){showToast((LANG_EN?"Not enough cash for the futures fee.":'Vadeli anlaşma ücreti için nakit yok.'),'bad');return;}
    spend(fee,'other');R.fut[m]={p0:R.p[m],q,until:G.day+365};news((LANG_EN?`12-month futures contract for ${RAW[m].n}: price locked at ${fx(R.p[m],2)}.`:`${RAW[m].n} için 12 aylık vadeli anlaşma: fiyat ${fx(R.p[m],2)} seviyesinde kilitlendi.`),'');}}
// UI
function vRaw(){const R=rawOf();
  const rows=RAW_K.map(m=>{const r=RAW[m],p=R.p[m],h=R.h[m],prev=h.length>1?h[h.length-2]:1,u=rawUse(m)*infl(),x=R.mine[m],L=mineLvl(m),cap=MINE.capV*L*infl(),f=R.fut[m],sh=R.sh[m];
    const parts=Object.keys(PART_RAW).filter(c=>PART_RAW[c][m]).map(c=>PART_RN[c]).join(', ');
    const cv=rawCover(m),mineTxt=x?(x.ready>G.day?(LANG_EN?`level ${x.lvl} · ${x.ready-G.day} days`:`seviye ${x.lvl} · ${x.ready-G.day} gün`):x.route==='own'?(LANG_EN?`level ${x.lvl} · ${Math.round(cv*100)}% of your usage at internal cost`:`seviye ${x.lvl} · kullanımının %${Math.round(cv*100)}'i iç maliyetle`):(LANG_EN?`level ${x.lvl} · ${money(cap*p)}/mo sales`:`seviye ${x.lvl} · ${money(cap*p)}/ay satış`)):'yok';
    return `<tr><td><b>${esc(r.n)}</b><div class="small muted">${esc(parts)}</div></td><td class="r num"><b class="${p>1.1?'neg':p<0.9?'pos':''}">${fx(p,2)}</b> <span class="small ${p>prev?'neg':'pos'}">${p>prev?'▲':'▼'}</span>${sh?(LANG_EN?` <span class="chip ${sh.x>1?'st-bad':'st-ok'}">shock</span>`:` <span class="chip ${sh.x>1?'st-bad':'st-ok'}">şok</span>`):''}</td>
      <td>${h.length>1?spark(h,80,22):''}</td><td class="r num">${u>0?money(u)+'/ay':'—'}</td>
      <td class="small">${mineTxt}${u>0&&L?` · korunma ${pctN(Math.min(999,Math.round(cap/u*100)))}`:''}<div><button class="btn sm" data-act="minebuy" data-k="${m}" ${(x&&(x.lvl>=MINE.max||x.ready>G.day))||G.cash<mineCost()?'disabled':''}>${x?(LANG_EN?"Expand":'Genişlet'):(LANG_EN?"Build mine":'Maden kur')} ${money(mineCost())}</button>${x?(LANG_EN?` <button class="btn sm ${x.route==='own'?'primary':''}" data-act="mineroute" data-k="${m}" aria-pressed="${x.route==='own'}" title="Send the output to your own production or sell it on the market">${x.route==='own'?"To my production":"To market"}</button>`:` <button class="btn sm ${x.route==='own'?'primary':''}" data-act="mineroute" data-k="${m}" aria-pressed="${x.route==='own'}" title="Çıktıyı kendi üretimine ver ya da piyasaya sat">${x.route==='own'?'Kendi üretimime':'Piyasaya'}</button>`):''}</div></td>
      <td class="small">${f?(LANG_EN?`lock ${fx(f.p0,2)} · ${Math.max(1,Math.round((f.until-G.day)/30))} mo · ${money((p-f.p0)*f.q)}/mo`:`kilit ${fx(f.p0,2)} · ${Math.max(1,Math.round((f.until-G.day)/30))} ay · ${money((p-f.p0)*f.q)}/ay`):(LANG_EN?`<button class="btn sm" data-act="futlock" data-k="${m}" ${u<1000?'disabled':''}>Lock for 12 months</button>`:`<button class="btn sm" data-act="futlock" data-k="${m}" ${u<1000?'disabled':''}>12 ay kilitle</button>`)}</td></tr>`;}).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Raw materials${helpBtn('raw')}</h2><span class="sub">${R.rev?`mines ${money(R.rev)}/mo`:''}${R.pl?` · futures ${money(R.pl)}/mo`:''}</span></div><div class="pb col" style="gap:10px">
    <p class="small muted" style="margin:0">40% of part prices depends on raw material prices: batteries on lithium, motors and cameras on rare earths, chips on silicon, housings on aluminum. A price of 1.00 is normal. If you build a mine you sell its output at the market price; when prices rise your parts cost more but the mine earns more too. A futures contract locks today's price for 12 months: if the price rises you get the difference, if it falls you pay it.</p>
    <div class="tw"><table class="rt"><thead><tr><th>Raw material · used by</th><th class="r">Price</th><th>36 mo</th><th class="r">Your usage</th><th>Mine</th><th>Futures</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div></section>`:`<section class="panel"><div class="ph"><h2>Ham maddeler${helpBtn('raw')}</h2><span class="sub">${R.rev?`madenler ${money(R.rev)}/ay`:''}${R.pl?` · vadeli ${money(R.pl)}/ay`:''}</span></div><div class="pb col" style="gap:10px">
    <p class="small muted" style="margin:0">Parça fiyatlarının %40'ı ham madde fiyatlarına bağlıdır: batarya lityuma, motor ve kamera nadir toprağa, yonga silisyuma, kasa alüminyuma. Fiyat 1,00 normal seviyedir. Maden kurarsan üretimini piyasa fiyatından satarsın; fiyatlar yükselince parçalar pahalanır ama maden de daha çok kazandırır. Vadeli anlaşma bugünkü fiyatı 12 ay kilitler: fiyat artarsa farkı sen alırsın, düşerse sen ödersin.</p>
    <div class="tw"><table class="rt"><thead><tr><th>Ham madde · kullanan parçalar</th><th class="r">Fiyat</th><th>36 ay</th><th class="r">Kullanımın</th><th>Maden</th><th>Vadeli</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div></section>`);}
