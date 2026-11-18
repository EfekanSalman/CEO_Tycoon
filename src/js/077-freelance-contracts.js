/* ============================== FREELANCE CONTRACTS ============================== */
/* Müşteriler belli bileşenleri belli sürede ister; depodaki bileşenler sözleşmelere otomatik teslim edilir (projelerden önce).
   Zamanında biten iş para ve itibar getirir; itibar arttıkça işler büyür. Kurucu enerjisini harcayıp bileşeni anında yapabilir. */
const FL_CLIENTS=[(LANG_EN?"Kuzey Logistics":'Kuzey Lojistik'),(LANG_EN?"Mavi Insurance":'Mavi Sigorta'),(LANG_EN?"Atlas Market":'Atlas Market'),(LANG_EN?"Ege Tourism":'Ege Turizm'),(LANG_EN?"Pera Bank":'Pera Bankası'),(LANG_EN?"Toros Energy":'Toros Enerji'),(LANG_EN?"Anka Health":'Anka Sağlık'),(LANG_EN?"Lale Cosmetics":'Lale Kozmetik'),(LANG_EN?"Kartal Cargo":'Kartal Kargo'),(LANG_EN?"Yıldız Education":'Yıldız Eğitim'),(LANG_EN?"Marmara Foods":'Marmara Gıda'),(LANG_EN?"Bora Automotive":'Bora Otomotiv'),(LANG_EN?"Selin Fashion":'Selin Moda'),(LANG_EN?"Kapadokya Hotels":'Kapadokya Otelcilik'),(LANG_EN?"Defne Pharmacies":'Defne Eczaneleri'),(LANG_EN?"Okyanus Media":'Okyanus Medya'),(LANG_EN?"Zirve Sports":'Zirve Spor'),(LANG_EN?"Çınar Construction":'Çınar İnşaat')];
const FL_JOBS=[
  {n:(LANG_EN?"Promo website":'Tanıtım sitesi'),c:{ui:3,gfx:3}},{n:(LANG_EN?"Campaign app":'Kampanya uygulaması'),c:{ui:3,flow:2,be:2}},{n:(LANG_EN?"Admin panel":'Yönetim paneli'),c:{be:3,db:3,ui:2}},
  {n:(LANG_EN?"E-commerce platform":'E-ticaret altyapısı'),c:{be:4,db:3,net:2,ui:3}},{n:(LANG_EN?"Mobile app":'Mobil uygulama'),c:{ui:3,be:2,db:1}},{n:(LANG_EN?"Web service maintenance":'Web servisi bakımı'),c:{be:2,db:2}},
  {n:(LANG_EN?"Server integration":'Sunucu entegrasyonu'),c:{net:3,be:3}},{n:(LANG_EN?"Logo and brand identity":'Logo ve kurumsal kimlik'),c:{gfx:5}},{n:(LANG_EN?"User experience study":'Kullanıcı deneyimi çalışması'),c:{flow:4,gfx:1}},
  {n:(LANG_EN?"Smart device prototype":'Akıllı cihaz prototipi'),c:{pcb:3,mech:2,ind:1}},{n:(LANG_EN?"Firmware":'Gömülü yazılım'),c:{fw:4,pcb:1}},{n:(LANG_EN?"Sensor board":'Sensör kartı'),c:{sens:3,pcb:2}},
  {n:(LANG_EN?"Product enclosure design":'Ürün kasası tasarımı'),c:{ind:3,mech:2}},{n:(LANG_EN?"Recommendation engine":'Tavsiye motoru'),c:{ml:3,be:2},res:'ml'},{n:(LANG_EN?"Chip verification":'Çip doğrulama'),c:{die:2,fw:1},res:'chip'}];
const FL_RATE=70,HO_E=8,HO_MAX=3;
// teklifler oyunun ortak rastgele akışını tüketmesin diye kendi üretecini kullanır
function flR(){const F=flOf();let t=(F.seed=(F.seed==null?(G.day*7919+13)>>>0:F.seed)+0x6D2B79F5>>>0);t=Math.imul(t^t>>>15,1|t);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;}
const flPick=a=>a[Math.floor(flR()*a.length)],flRnd=(a,b)=>a+flR()*(b-a);
const newFl=()=>({offers:[],act:[],rep:10,done:0,fail:0,earned:0,next:20,log:[]});
const flOf=()=>G.fl||(G.fl=newFl());
const flSlots=()=>2+(flOf().rep>=50?1:0);
function flRoleOut(){const o={};for(const e of G.emps)if(DEV_ROLES.includes(e.role)&&!e.leave)o[e.role]=(o[e.role]||0)+e.skill*0.8;return o;}
function flMake(){const F=flOf(),out=flRoleOut(),k=compK();
  const ok=FL_JOBS.filter(j=>(!j.res||has(j.res))&&Object.keys(j.c).every(c=>out[COMP[c].r]));if(!ok.length)return null;
  const j=flPick(ok),s=(1+F.rep/40)*flRnd(0.8,1.4),need={};for(const c in j.c)need[c]=Math.max(1,Math.round(j.c[c]*s));
  const pr={};let pts=0;for(const c in need){const v=need[c]*COMP[c].b*k;pts+=v;pr[COMP[c].r]=(pr[COMP[c].r]||0)+v;}
  const est=Math.max(...Object.keys(pr).map(t=>pr[t]/out[t])),days=clamp(Math.ceil(est*1.6)+5,10,90);
  return {id:'f'+(F.n=(F.n||0)+1),cl:flPick(FL_CLIENTS),n:j.n,need,got:Object.fromEntries(Object.keys(need).map(c=>[c,0])),pay:Math.round(pts*FL_RATE*(0.9+F.rep/200)*flRnd(0.9,1.2)*infl()/100)*100,days,est:Math.ceil(est),exp:G.day+12};}
const flLeft=k=>Object.keys(k.need).reduce((a,c)=>a+k.need[c]-k.got[c],0);
const flTot=k=>Object.values(k.need).reduce((a,b)=>a+b,0);
function flPay(k,early){const F=flOf();G.cash+=k.pay;G.month.rev+=k.pay;F.earned+=k.pay;F.done++;F.rep=clamp(F.rep+6+(early?2:0),0,100);
  F.log.unshift({d:G.day,t:(LANG_EN?`${k.cl}: ${k.n} delivered (${money(k.pay)})`:`${k.cl}: ${k.n} teslim edildi (${money(k.pay)})`)});if(F.log.length>8)F.log.pop();
  news((LANG_EN?`Delivered ${k.n} for ${k.cl}: ${money(k.pay)} paid.${early?" Early delivery boosted your reputation.":''}`:`${k.cl} için ${k.n} teslim edildi: ${money(k.pay)} ödendi.${early?' Erken teslim itibarını artırdı.':''}`),'good');}
function flFail(k,why){const F=flOf();F.fail++;F.rep=clamp(F.rep-10,0,100);F.log.unshift({d:G.day,t:`${k.cl}: ${k.n} ${why}`});if(F.log.length>8)F.log.pop();
  news((LANG_EN?`The ${k.cl} contract ${why}. Your reputation dropped.`:`${k.cl} sözleşmesi ${why}. İtibarın düştü.`),'bad');}
function flDaily(){if(!G.emps.some(e=>DEV_ROLES.includes(e.role)))return;const F=flOf(),D=depOf();
  F.offers=F.offers.filter(o=>o.exp>G.day);
  if(F.offers.length<3&&G.day>=F.next){const o=flMake();if(o)F.offers.push(o);F.next=G.day+5+Math.floor(flR()*6);}
  for(const k of [...F.act]){
    for(const c in k.need){const h=D.inv[c]||0,m=Math.min(h,k.need[c]-k.got[c]);if(m>0){k.got[c]+=m;D.inv[c]=h-m;if(!D.inv[c])delete D.inv[c];}}
    if(!flLeft(k)){F.act=F.act.filter(x=>x!==k);flPay(k,G.day-k.start<k.days/2);}
    else if(G.day>=k.due){F.act=F.act.filter(x=>x!==k);flFail(k,(LANG_EN?"missed its deadline":'zamanında yetişmedi'));}}}
// kurucu el atar: enerjisini harcayıp sözleşmenin bir bileşenini anında yapar
const founder=()=>G.emps.find(e=>e.founder&&!e.cof);
function hoWhy(){const f=founder();if(!f)return (LANG_EN?"No founder":'Kurucu yok');if(f.leave)return (LANG_EN?"Founder on leave":'Kurucu izinde');if(f.energy<HO_E+12)return (LANG_EN?"Founder too tired":'Kurucu çok yorgun');if((UI._hoD===G.day?UI._hoN:0)>=HO_MAX)return (LANG_EN?`At most ${HO_MAX} times a day`:`Bugün en fazla ${HO_MAX} kez`);return '';}
function handsOn(k){if(hoWhy())return false;const f=founder(),D=depOf();
  const c=Object.keys(k.need).filter(x=>k.got[x]<k.need[x]).sort((a,b)=>(COMP[a].r===f.role?0:1)-(COMP[b].r===f.role?0:1)||(k.need[b]-k.got[b])-(k.need[a]-k.got[a]))[0];if(!c)return false;
  if(UI._hoD!==G.day){UI._hoD=G.day;UI._hoN=0;}UI._hoN++;
  f.energy=clamp(f.energy-HO_E*(COMP[c].r===f.role?1:1.5),0,100);k.got[c]++;f.xp=(f.xp||0)+2;compPop(f,c);
  if(!flLeft(k)){const F=flOf();F.act=F.act.filter(x=>x!==k);flPay(k,G.day-k.start<k.days/2);}return true;}
function flAct(a,id){const F=flOf();
  if(a==='flacc'){const o=F.offers.find(x=>x.id===id);if(!o||F.act.length>=flSlots())return;F.offers=F.offers.filter(x=>x!==o);o.start=G.day;o.due=G.day+o.days;F.act.push(o);news((LANG_EN?`Deal with ${o.cl}: ${o.n} within ${o.days} days.`:`${o.cl} ile anlaşıldı: ${o.n}, ${o.days} gün içinde.`),'');}
  else if(a==='flrej'){F.offers=F.offers.filter(x=>x.id!==id);}
  else if(a==='flquit'){const k=F.act.find(x=>x.id===id);if(k){F.act=F.act.filter(x=>x!==k);F.rep=clamp(F.rep-5,0,100);news((LANG_EN?`You backed out of the ${k.cl} contract. Your reputation dropped a little.`:`${k.cl} sözleşmesinden çekildin. İtibarın biraz düştü.`),'bad');}}
  else if(a==='handson'){const k=F.act.find(x=>x.id===id);if(k)handsOn(k);}}
// UI
function flNeed(k,live){return `<div class="cmp-l">${Object.keys(k.need).map(c=>`<span class="cmp${live&&k.got[c]>=k.need[c]?' done':''}"><b class="r-${COMP[c].r}">${COMP[c].s}</b>${esc(COMP[c].n)} <span class="num">${live?`${k.got[c]}/`:''}${k.need[c]}</span></span>`).join('')}</div>`;}
function vFreelance(){if(!G.emps.some(e=>DEV_ROLES.includes(e.role)))return '';const F=flOf(),why=hoWhy(),full=F.act.length>=flSlots();
  const act=F.act.map(k=>{const left=k.due-G.day;return (LANG_EN?`<div class="proj fl"><div class="row between"><h3>${esc(k.n)}</h3><span class="chip st-ok">${money(k.pay)}</span></div><div class="small muted">${esc(k.cl)} · <span class="${left<=5?'neg':''}">${left} days left</span> · ${flTot(k)-flLeft(k)}/${flTot(k)} components</div>${flNeed(k,true)}
    <div class="row"><button class="btn sm primary" data-act="handson" data-id="${k.id}" ${why?'disabled':''} title="${esc(why||`The founder makes one component right away; energy −${HO_E}`)}">Do it yourself${why?` · ${esc(why)}`:` (energy −${HO_E})`}</button><button class="btn sm ghost" data-act="flquit" data-id="${k.id}">Back out</button></div></div>`:`<div class="proj fl"><div class="row between"><h3>${esc(k.n)}</h3><span class="chip st-ok">${money(k.pay)}</span></div><div class="small muted">${esc(k.cl)} · <span class="${left<=5?'neg':''}">${left} gün kaldı</span> · ${flTot(k)-flLeft(k)}/${flTot(k)} bileşen</div>${flNeed(k,true)}
    <div class="row"><button class="btn sm primary" data-act="handson" data-id="${k.id}" ${why?'disabled':''} title="${esc(why||`Kurucu bir bileşeni hemen yapar; enerji −${HO_E}`)}">Kendin çalış${why?` · ${esc(why)}`:` (enerji −${HO_E})`}</button><button class="btn sm ghost" data-act="flquit" data-id="${k.id}">Vazgeç</button></div></div>`);}).join('');
  const off=F.offers.map(o=>(LANG_EN?`<div class="proj fl"><div class="row between"><h3>${esc(o.n)}</h3><span class="chip st-mute">${money(o.pay)}</span></div><div class="small muted">${esc(o.cl)} · deadline ${o.days} days · ~${o.est} days of work for your team · offer open ${Math.max(0,o.exp-G.day)} days</div>${flNeed(o,false)}
    <div class="row"><button class="btn sm primary" data-act="flacc" data-id="${o.id}" ${full?'disabled':''}>Accept</button><button class="btn sm ghost" data-act="flrej" data-id="${o.id}">Decline</button></div></div>`:`<div class="proj fl"><div class="row between"><h3>${esc(o.n)}</h3><span class="chip st-mute">${money(o.pay)}</span></div><div class="small muted">${esc(o.cl)} · süre ${o.days} gün · ekibinle ~${o.est} gün iş · teklif ${Math.max(0,o.exp-G.day)} gün geçerli</div>${flNeed(o,false)}
    <div class="row"><button class="btn sm primary" data-act="flacc" data-id="${o.id}" ${full?'disabled':''}>Kabul et</button><button class="btn sm ghost" data-act="flrej" data-id="${o.id}">Reddet</button></div></div>`)).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Freelance work</h2><span class="sub">reputation ${Math.round(F.rep)}/100 · ${F.done} jobs delivered${F.earned?` · ${money(F.earned)} earned`:''}</span></div><div class="pb col" style="gap:10px">
    <p class="small muted" style="margin:0">Other companies ask you for components. Depot components go to jobs you've accepted automatically, before projects. Jobs finished on time bring money and reputation; the higher your reputation, the bigger the jobs and payments. Missed jobs hurt your reputation. You can take ${flSlots()} jobs at once.</p>
    ${act?`<div class="grid">${act}</div>`:''}
    <b>Offers</b>${off?`<div class="grid">${off}</div>`:"<div class=\"small muted\">No offers right now; new ones arrive within a few days.</div>"}
  </div></section>`:`<section class="panel"><div class="ph"><h2>Serbest işler</h2><span class="sub">itibar ${Math.round(F.rep)}/100 · ${F.done} iş teslim edildi${F.earned?` · ${money(F.earned)} kazanıldı`:''}</span></div><div class="pb col" style="gap:10px">
    <p class="small muted" style="margin:0">Başka şirketler senden bileşen ister. Depodaki bileşenler kabul ettiğin işlere projelerden önce, otomatik teslim edilir. Zamanında biten iş para ve itibar getirir; itibar arttıkça işler ve ödemeler büyür. Yetişmeyen iş itibarı düşürür. Aynı anda ${flSlots()} iş alabilirsin.</p>
    ${act?`<div class="grid">${act}</div>`:''}
    <b>Teklifler</b>${off?`<div class="grid">${off}</div>`:'<div class="small muted">Şu an teklif yok; birkaç gün içinde yenileri gelir.</div>'}
  </div></section>`);}
