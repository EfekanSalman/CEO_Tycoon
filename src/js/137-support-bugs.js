/* ============================== SUPPORT & BUGS ============================== */
const SW_CATS=['app','saas','os','ai','car'];
const maintRole=p=>SW_CATS.includes(p.cat)?'soft':'hw';
const traitBug=e=>(hasT(e,'careless')?1.4:1)*(hasT(e,'perf')?0.7:1)*(hasT(e,'fast')?1.15:1);
const satState=v=>v>=70?[(LANG_EN?"Happy":'Memnun'),'st-ok','var(--ok)']:v>=45?[(LANG_EN?"Normal":'Normal'),'st-mute','var(--pt-soft)']:[(LANG_EN?"Unhappy":'Şikayetçi'),'st-bad','var(--bad)'];
function supportDaily(){
  const mine=myActive();
  for(const p of mine){
    if(p.bugs==null){p.bugs=0;p.tix=0;p.sat=75;p.bugAcc=0;}
    const sw=SW_CATS.includes(p.cat),use=sw?p.units:(p.sr!=null?p.sr:p.units),v=p.score/S(p.cat,p.launch),age=G.day-p.launch;
    const lam=Math.sqrt(Math.max(0,use)/1e5)*clamp(1.6-v,0.2,1.5)*0.15*(0.3+2.5*Math.exp(-age/50))*(p.bugMult||1)*(sw?devBug():1)*tdBug(p)*(hasTool('ci')?0.85:1);
    p.bugs=Math.min(250,p.bugs+Math.floor(lam)+(Math.random()<lam%1?1:0));
    p.tin=use/30*((sw?0.002:0.01)+(sw?0.0004:0.001)*p.bugs)*(hasTool('sup')?0.85:1);p.tix+=p.tin;
  }
  for(const e of G.emps){
    if(typeof e.proj!=='string')continue;
    const p=prod(+e.proj.slice(1));if(!p||!p.active||p.owner!=='P'){e.proj=null;continue;}
    if(e.leave||inMeeting(e))continue;
    p.bugAcc=(p.bugAcc||0)+e.skill*effMult(e)*0.12;const f=Math.floor(p.bugAcc);if(f>0){p.bugAcc-=f;p.bugs=Math.max(0,p.bugs-f);}
  }
  let cap=brSupCap();for(const e of G.emps)if(e.role==='sup'&&!e.leave&&!inMeeting(e))cap+=e.skill*effMult(e)*25;
  const tot=mine.reduce((a,p)=>a+p.tix,0),res=Math.min(tot,cap);
  if(tot>0)for(const p of mine)p.tix=Math.max(0,p.tix-res*p.tix/tot);
  for(const p of mine)p.tix*=0.75;
  G.supStat={in:mine.reduce((a,p)=>a+(p.tin||0),0),cap,res,back:mine.reduce((a,p)=>a+p.tix,0)};
  for(const p of mine){
    const wait=p.tin>0.01?p.tix/p.tin:0;p.wait=wait;
    const tgt=clamp(88-p.bugs*0.8-Math.min(40,wait*4)-(p.score/S(p.cat)<0.8?8:0),0,100);
    p.sat+=(tgt-p.sat)*0.03;
    if(p.sat<30&&(p.angryAt??-999)<G.day-120){p.angryAt=G.day;G.brand=clamp(G.brand-2,0,100);news((LANG_EN?`${p.name} users are flooding social media with complaints (satisfaction ${Math.round(p.sat)}). Fix the bugs and grow your support team.`:`${p.name} kullanıcıları sosyal medyada şikayet yağdırıyor (memnuniyet ${Math.round(p.sat)}). Hataları düzelt, destek ekibini büyüt.`),'bad',true);}
  }
}
function vSupportPanel(){
  const mine=myActive();if(!mine.length)return '';
  const st=G.supStat||{in:0,cap:0,res:0,back:0},sups=G.emps.filter(e=>e.role==='sup');
  const avg=mine.reduce((a,p)=>a+(p.sat??75),0)/mine.length;
  const rows=mine.map(p=>{const team=G.emps.filter(e=>e.proj==='m'+p.id),fix=team.reduce((a,e)=>a+e.skill*effMult(e)*0.12,0);
    return (LANG_EN?`<tr><td><b>${esc(p.name)}</b><div class="small muted">${CATS[p.cat].n}</div></td>
      <td class="r num ${(p.bugs||0)>20?'neg':(p.bugs||0)>8?'warn':''}">${Math.round(p.bugs||0)}</td>
      <td class="r num">${fx(fix,1)}/day</td>
      <td class="small">${team.length?team.map(e=>esc(e.name.split(' ')[0])).join(', '):"<span class=\"muted\">none</span>"}</td>
      <td class="r num">${num(p.tin||0)}/day<div class="small muted">${fx(p.wait||0,1)}-day wait</div></td>
      <td>${meter(p.sat??75,satState(p.sat??75))}</td>
      <td class="r"><button class="btn sm" data-act="maint" data-id="${p.id}">Assign ${maintRole(p)==='soft'?"Developer":"Hardware Eng."}</button></td></tr>`:`<tr><td><b>${esc(p.name)}</b><div class="small muted">${CATS[p.cat].n}</div></td>
      <td class="r num ${(p.bugs||0)>20?'neg':(p.bugs||0)>8?'warn':''}">${Math.round(p.bugs||0)}</td>
      <td class="r num">${fx(fix,1)}/gün</td>
      <td class="small">${team.length?team.map(e=>esc(e.name.split(' ')[0])).join(', '):'<span class="muted">yok</span>'}</td>
      <td class="r num">${num(p.tin||0)}/gün<div class="small muted">${fx(p.wait||0,1)} gün bekleme</div></td>
      <td>${meter(p.sat??75,satState(p.sat??75))}</td>
      <td class="r"><button class="btn sm" data-act="maint" data-id="${p.id}">${maintRole(p)==='soft'?'Yazılımcı':'Donanımcı'} ata</button></td></tr>`);}).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Customer support and bugs</h2><span class="sub">${sups.length} support specialists</span></div>
    <div class="kpis" style="border-top:0">
      <div class="kpi"><span>Incoming tickets</span><b>${num(st.in)}<small class="muted" style="font-size:14px">/day</small></b></div>
      <div class="kpi"><span>Resolution capacity</span><b class="${st.cap<st.in?'neg':'pos'}">${num(st.cap)}<small class="muted" style="font-size:14px">/day</small></b></div>
      <div class="kpi"><span>Pending tickets</span><b>${num(Math.round(st.back))}</b></div>
      <div class="kpi"><span>Average satisfaction</span><b class="${satState(avg)[1]}">${Math.round(avg)}</b></div>
    </div>
    <div class="tw"><table><thead><tr><th>Product</th><th class="r">Open bugs</th><th class="r">Fixes</th><th>Maintenance team</th><th class="r">Tickets</th><th>Satisfaction</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="pb small muted" style="border-top:1px solid var(--line)">Products develop bugs as they're used: more in new, low-quality and heavily used products. Products built by sloppy employees have more bugs; those built by perfectionists are cleaner. Assign a developer or hardware engineer to a product for maintenance and they'll fix bugs. Bugs and long support waits lower satisfaction; satisfaction can raise or cut sales by up to 25% and affects your brand. Each support specialist resolves about skill × 25 tickets a day.</p></section>`:`<section class="panel"><div class="ph"><h2>Müşteri desteği ve hatalar</h2><span class="sub">${sups.length} destek uzmanı</span></div>
    <div class="kpis" style="border-top:0">
      <div class="kpi"><span>Gelen talep</span><b>${num(st.in)}<small class="muted" style="font-size:14px">/gün</small></b></div>
      <div class="kpi"><span>Çözme kapasitesi</span><b class="${st.cap<st.in?'neg':'pos'}">${num(st.cap)}<small class="muted" style="font-size:14px">/gün</small></b></div>
      <div class="kpi"><span>Bekleyen talep</span><b>${num(Math.round(st.back))}</b></div>
      <div class="kpi"><span>Ortalama memnuniyet</span><b class="${satState(avg)[1]}">${Math.round(avg)}</b></div>
    </div>
    <div class="tw"><table><thead><tr><th>Ürün</th><th class="r">Açık hata</th><th class="r">Düzeltme</th><th>Bakım ekibi</th><th class="r">Talep</th><th>Memnuniyet</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="pb small muted" style="border-top:1px solid var(--line)">Ürünler kullanıldıkça hata çıkar: yeni çıkan, düşük kaliteli ve çok kullanılan ürünlerde daha fazla. Dağınık çalışanların yaptığı ürünler daha hatalı, mükemmeliyetçilerinki daha temiz olur. Bir yazılımcıyı ya da donanımcıyı ürüne bakım için atarsan hataları düzeltir. Hatalar ve uzun destek beklemesi memnuniyeti düşürür; memnuniyet satışları %25'e kadar artırır ya da düşürür ve markanı etkiler. Destek uzmanlarının her biri günde yaklaşık yetenek × 25 talep çözer.</p></section>`);
}
const CRIT={id:'crit',w:2,choice:true,cond:()=>myActive().some(p=>(p.bugs||0)>15),
  make:()=>{const p=myActive().filter(p=>(p.bugs||0)>15).sort((a,b)=>b.bugs-a.bugs)[0];return {pid:p.id,cost:Math.round(50000*infl())};},
  view:d=>{const p=prod(d.pid);return {t:(LANG_EN?"Critical bug":'Kritik hata'),b:(LANG_EN?`${p?p.name:"A product"} is crashing for some users. ${p?Math.round(p.bugs):''} open bugs, and complaints are piling up fast.`:`${p?p.name:'Bir ürünün'} kullanıcılarının bir kısmında ürün çöküyor. ${p?Math.round(p.bugs):''} açık hata var ve şikayetler hızla artıyor.`),
    o:[{t:(LANG_EN?`Emergency patch, overtime (${money(d.cost)})`:`Acil yama, fazla mesai (${money(d.cost)})`),d:(LANG_EN?"60% of bugs get fixed right away.":'Hataların %60\'ı hemen kapanır.')},
      {t:(LANG_EN?"Briefly pull the product":'Ürünü kısa süreliğine geri çek'),d:(LANG_EN?"Sales halve for 30 days, 40% of bugs get fixed.":'30 gün satışlar yarıya iner, hataların %40\'ı kapanır.')},
      {t:(LANG_EN?"Wait for the next update":'Sonraki güncellemeyi bekle'),d:(LANG_EN?"Satisfaction −20 points, brand −3.":'Memnuniyet 20 puan düşer, marka −3.')}]};},
  pick(d,i){const p=prod(d.pid);if(!p)return;
    if(i===0){spend(d.cost,'other');p.bugs=Math.round(p.bugs*0.4);news((LANG_EN?`Emergency patch released for ${p.name}.`:`${p.name} için acil yama yayınlandı.`),'good');}
    else if(i===1){p.hype={m:0.5,until:G.day+30};p.bugs=Math.round(p.bugs*0.6);news((LANG_EN?`${p.name} has been briefly pulled while the team fixes bugs.`:`${p.name} kısa süreliğine geri çekildi, ekip hataları düzeltiyor.`));}
    else{p.sat=Math.max(0,p.sat-20);G.brand=clamp(G.brand-3,0,100);news((LANG_EN?`${p.name} users are tired of waiting for an update.`:`${p.name} kullanıcıları güncellemeyi beklemekten bıktı.`),'bad');}}};
EVENTS.push(CRIT);EVD.crit=CRIT;



