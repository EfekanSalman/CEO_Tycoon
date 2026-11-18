/* ============================== SIDE PROJECTS & HACKATHON ============================== */
const TOOLS={ci:{n:(LANG_EN?"Automated test pipeline":'Otomatik test hattı'),d:(LANG_EN?"New bugs drop by 15%.":'Yeni hatalar %15 azalır.')},devx:{n:(LANG_EN?"Developer tools":'Geliştirici araçları'),d:(LANG_EN?"Projects run 5% faster.":'Projeler %5 hızlanır.')},resx:{n:(LANG_EN?"Research automation":'Araştırma otomasyonu'),d:(LANG_EN?"Research runs 8% faster.":'Araştırma %8 hızlanır.')},
  lint:{n:(LANG_EN?"Code analysis bot":'Kod analiz botu'),d:(LANG_EN?"Tech debt builds up a bit more slowly each month.":'Teknik borç her ay biraz daha yavaş birikir.')},hire:{n:(LANG_EN?"Hiring platform":'İşe alım platformu'),d:(LANG_EN?"Candidates come in a bit more skilled.":'Adaylar biraz daha yetenekli gelir.')},sup:{n:(LANG_EN?"Support automation":'Destek otomasyonu'),d:(LANG_EN?"Incoming support tickets drop by 15%.":'Gelen destek talepleri %15 azalır.')}};
const IDEA_K={product:{n:(LANG_EN?"New products":'Yeni ürün'),c:'st-ok'},tool:{n:(LANG_EN?"Internal tool":'İç araç'),c:'st-mute'},feature:{n:(LANG_EN?"Feature":'Özellik'),c:'st-warn'}};
const IDEA_ADJ=[(LANG_EN?"Night":'Gece'),(LANG_EN?"Swallow":'Kırlangıç'),(LANG_EN?"Echo":'Yankı'),(LANG_EN?"Kıvılcım":'Kıvılcım'),(LANG_EN?"Pusula":'Pusula'),(LANG_EN?"Lens":'Mercek'),(LANG_EN?"Seed":'Tohum'),(LANG_EN?"Bridge":'Köprü'),(LANG_EN?"Mist":'Sis'),(LANG_EN?"Fener":'Fener'),(LANG_EN?"Dalga":'Dalga'),(LANG_EN?"Core":'Çekirdek')];
const hasTool=k=>!!(G.tools&&G.tools[k]);
const hackOn=()=>!!(G.hack&&G.day<G.hack.until);
const hackCost=pub=>(pub?60000:8000+600*G.emps.length)*infl();
const HACK_ROLES=['soft','design','hw','res'];
function ideaMake(by,src){
  const cats=CAT_ORDER.filter(c=>catUnlocked(c)&&c!=='cpu'),mine=myActive(),r=Math.random(),creative=by.some(e=>hasT(e,'creative'));
  let k=r<0.45?'product':r<0.75?'tool':'feature';if(k==='feature'&&!mine.length)k='product';const freeT=Object.keys(TOOLS).filter(t=>!hasTool(t)&&!(G.ideas||[]).some(o=>o.tool===t)&&!(ideaMake.pend||[]).includes(t));if(k==='tool'&&!freeT.length)k='product';if(!cats.length&&k==='product')k=mine.length?'feature':'tool';
  const avg=by.reduce((a,e)=>a+e.skill,0)/Math.max(1,by.length);
  let pot=clamp(0.9+(avg-5)*0.05+rnd(-0.14,0.2)+(creative?0.06:0),0.75,1.3);if(Math.random()<0.08){pot=rnd(1.45,1.6);}
  const est=clamp(Math.round((pot-0.78)/0.1+1+rnd(-1,1)),1,5);
  const o={id:nid(),k,pot,est,by:by.map(e=>e.id),byN:by.map(e=>e.name.split(' ')[0]).join(', '),d:G.day,exp:G.day+180,src};
  if(k==='product'){o.cat=pick(cats);o.n=`${pick(IDEA_ADJ)} ${({app:(LANG_EN?"App":'Uygulama'),saas:(LANG_EN?"Service":'Servis'),os:'OS',phone:(LANG_EN?"Phone":'Telefon'),pc:'PC',wear:(LANG_EN?"Watch":'Saat'),console:(LANG_EN?"Console":'Konsol'),ai:(LANG_EN?"Assistant":'Asistan'),xr:(LANG_EN?"Glasses":'Gözlük'),car:(LANG_EN?"Drive":'Sürüş'),robo:(LANG_EN?"Robot":'Robot'),iot:(LANG_EN?"Home":'Ev'),qc:(LANG_EN?"Quantum":'Kuantum')})[o.cat]}`;}
  else if(k==='tool'){o.tool=pick(freeT);(ideaMake.pend=ideaMake.pend||[]).push(o.tool);o.n=TOOLS[o.tool].n;}
  else{const p=pick(mine);o.pid=p.id;o.n=(LANG_EN?`${pick(["smart search","dark mode","offline mode","voice commands","sharing feature","speed improvements","new interface"])} for ${p.name}`:`${p.name} için ${pick(['akıllı arama','karanlık mod','çevrimdışı mod','sesli komut','paylaşım özelliği','hız iyileştirmesi','yeni arayüz'])}`);}
  return o;}
function ideaReq(o){const k=1+years()*0.08;return o.k==='tool'?{soft:Math.round(500*k)}:o.k==='feature'?{soft:Math.round(350*k),design:Math.round(150*k)}:null;}
function hackStart(pub){const devs=G.emps.filter(e=>HACK_ROLES.includes(e.role)&&!e.leave);const k=hackCost(pub);if(devs.length<3||G.cash<k||G.day-(G.hackLast||-999)<120)return;
  spend(k,'other');G.hackLast=G.day;G.hack={until:G.day+3,pub};for(const e of devs){e.morale=clamp(e.morale+6,0,100);}
  const n=clamp(Math.round(devs.length/6)+rint(1,2),2,5),ids=[];const pool=devs.slice();
  for(let i=0;i<n&&pool.length;i++){const team=[];for(let j=0;j<rint(1,3)&&pool.length;j++)team.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);ids.push(ideaMake(team,pub?(LANG_EN?"Open hackathon":'Açık hackathon'):(LANG_EN?"Hackathon":'Hackathon')));}
  ideaMake.pend=[];G.ideas=[...ids,...(G.ideas||[])].slice(0,8);
  if(pub){G.brand=clamp(G.brand+1.5,0,100);for(let i=0;i<2;i++){const c=genCand(1.5);G.cands.unshift(c);}G.cands=G.cands.slice(0,10);}
  news((LANG_EN?`${pub?"Open hackathon":"Hackathon"} started: ${devs.length} people will work on their own ideas for 3 days. ${n} ideas came out of it${pub?"; two talented candidates from the community also applied":''}.`:`${pub?'Açık hackathon':'Hackathon'} başladı: ${devs.length} kişi 3 gün boyunca kendi fikirleri üzerinde çalışacak. ${n} fikir çıktı${pub?'; topluluktan iki yetenekli aday da başvurdu':''}.`),'good',true);tl('emp',(LANG_EN?`${pub?"Open hackathon":"Hackathon"}: ${n} ideas`:`${pub?'Açık hackathon':'Hackathon'}: ${n} fikir`));
  UI.hackRes=ids.map(x=>x.id);openModal('hackres');}
function ideasMonthly(){
  G.ideas=(G.ideas||[]).filter(o=>o.exp>G.day);
  if(G.sideT){const devs=G.emps.filter(e=>HACK_ROLES.includes(e.role)&&!e.leave&&!e.founder);if(devs.length&&Math.random()<0.12+0.05*devs.filter(e=>hasT(e,'creative')).length+devs.length*0.004){const e=pick(devs);const o=ideaMake([e],(LANG_EN?"Side project":'Yan proje'));G.ideas.unshift(o);G.ideas=G.ideas.slice(0,8);news((LANG_EN?`${e.name} developed an idea during side project time: ${o.n} (${IDEA_K[o.k].n.toLocaleLowerCase(LOC)}).`:`${e.name} yan proje zamanında bir fikir geliştirdi: ${o.n} (${IDEA_K[o.k].n.toLocaleLowerCase(LOC)}).`),'good');}
    for(const e of G.emps)if(HACK_ROLES.includes(e.role)&&!e.founder)e.morale=clamp(e.morale+0.6,0,100);}
}
function finishIdea(pr){G.projects=G.projects.filter(x=>x!==pr);for(const e of G.emps)if(e.proj===pr.id){e.proj=null;e.xp=(e.xp||0)+15;}
  const I=pr.idea;
  if(I.k==='tool'){(G.tools=G.tools||{})[I.tool]=true;news((LANG_EN?`Internal tool ready: ${TOOLS[I.tool].n}. ${TOOLS[I.tool].d}`:`İç araç hazır: ${TOOLS[I.tool].n}. ${TOOLS[I.tool].d}`),'good',true);tl('prod',(LANG_EN?`Internal tool: ${TOOLS[I.tool].n}`:`İç araç: ${TOOLS[I.tool].n}`));}
  else{const p=prod(I.pid);if(!p||!p.active){news((LANG_EN?`${pr.name} is done, but the product is no longer on the market.`:`${pr.name} tamamlandı ama ürün artık piyasada değil.`),'bad');return;}const m=clamp(1+(I.pot-0.7)*0.15,1.03,1.14);p.score*=m;if(p.sat!=null)p.sat=clamp(p.sat+5,0,95);p.hype={m:Math.max(1.08,p.hype&&p.hype.until>G.day?p.hype.m:1),until:G.day+30};
    news((LANG_EN?`${pr.name} is live: ${p.name}'s score rose ${Math.round((m-1)*100)}%, and users love it.`:`${pr.name} yayında: ${p.name} puanı %${Math.round((m-1)*100)} arttı, kullanıcılar sevdi.`),'good',true);}
  (G.ideaLog=G.ideaLog||[]).unshift({d:G.day,t:pr.name,ok:true});if(G.ideaLog.length>10)G.ideaLog.pop();}
function vIdeas(){
  const devs=G.emps.filter(e=>HACK_ROLES.includes(e.role)&&!e.leave),cd=120-(G.day-(G.hackLast||-999)),L=G.ideas||[],tools=Object.keys(TOOLS).filter(hasTool);
  const star=n=>'★'.repeat(n)+'<span class="muted">'+'★'.repeat(5-n)+'</span>';
  const cards=L.map(o=>{const K=IDEA_K[o.k],req=ideaReq(o),p=o.pid?prod(o.pid):null;
    return (LANG_EN?`<div class="proj col" style="gap:6px"><div class="row between"><b>${esc(o.n)}</b><span class="chip ${K.c}">${K.n}</span></div>
      <div class="small muted">${esc(o.src)} · ${esc(o.byN)} · ${fmtDate(o.d)}</div>
      <div class="small">${o.k==='product'?`${CATS[o.cat].n} · prototype ready, 30% less workload`:o.k==='tool'?TOOLS[o.tool].d:p?`for ${esc(p.name)}`:"Product no longer exists"}</div>
      <div class="small">Team's estimate: <span aria-label="${o.est} stars">${star(o.est)}</span></div>
      <div class="row" style="gap:4px;flex-wrap:wrap"><button class="btn sm primary" data-act="ideago" data-id="${o.id}" ${o.k==='feature'&&!(p&&p.active)?'disabled':''}>${o.k==='product'?"Turn into project":"Develop · "+Object.entries(req).map(([t,x])=>PT_NAME[t]+' '+num(x)).join(', ')}</button><button class="btn sm ghost" data-act="ideadrop" data-id="${o.id}">Shelve</button></div>
      <div class="small muted">Hot until ${fmtDate(o.exp)}</div></div>`:`<div class="proj col" style="gap:6px"><div class="row between"><b>${esc(o.n)}</b><span class="chip ${K.c}">${K.n}</span></div>
      <div class="small muted">${esc(o.src)} · ${esc(o.byN)} · ${fmtDate(o.d)}</div>
      <div class="small">${o.k==='product'?`${CATS[o.cat].n} · prototip hazır, iş yükü %30 az`:o.k==='tool'?TOOLS[o.tool].d:p?`${esc(p.name)} için`:'Ürün artık yok'}</div>
      <div class="small">Ekibin tahmini: <span aria-label="${o.est} yıldız">${star(o.est)}</span></div>
      <div class="row" style="gap:4px;flex-wrap:wrap"><button class="btn sm primary" data-act="ideago" data-id="${o.id}" ${o.k==='feature'&&!(p&&p.active)?'disabled':''}>${o.k==='product'?'Projeye dönüştür':'Geliştir · '+Object.entries(req).map(([t,x])=>PT_NAME[t]+' '+num(x)).join(', ')}</button><button class="btn sm ghost" data-act="ideadrop" data-id="${o.id}">Rafa kaldır</button></div>
      <div class="small muted">${fmtDate(o.exp)}'e kadar sıcak</div></div>`);}).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Side projects & hackathons${helpBtn('hack')}</h2><span class="sub">${L.length} ideas · ${tools.length} internal tools</span></div>
    <div class="pb"><div class="grid3">
      <div class="proj col" style="gap:6px"><b>Internal hackathon</b><div class="small muted">Engineers and researchers set their projects aside for 3 days to work on their own ideas. Morale +6; yields 2–5 ideas.</div>
        <button class="btn sm primary" data-act="hack" data-pub="0" ${cd>0||devs.length<3||G.cash<hackCost(false)?'disabled':''}>${cd>0?cd+" days":devs.length<3?"Requires at least 3 engineers":"Host · "+money(hackCost(false))}</button></div>
      <div class="proj col" style="gap:6px"><b>Open hackathon</b><div class="small muted">You invite the community too: the same ideas, plus brand +1.5 and two talented candidates.</div>
        <button class="btn sm" data-act="hack" data-pub="1" ${cd>0||devs.length<3||G.cash<hackCost(true)?'disabled':''}>${cd>0?cd+" days":"Host · "+money(hackCost(true))}</button></div>
      <div class="proj col" style="gap:6px"><b>Side project time</b><div class="small muted">Engineers spend 10% of their time on their own projects: projects slow by 10%, morale rises a bit every month and ideas pop up now and then (more often from creative employees).</div>
        <div class="row" style="gap:4px"><button class="btn sm ${G.sideT?'ghost':'primary'}" data-act="sidet" data-v="0">None</button><button class="btn sm ${G.sideT?'primary':'ghost'}" data-act="sidet" data-v="0.1">10%</button></div></div>
    </div></div></section>
  <section class="panel"><div class="ph"><h2>Ideas</h2><span class="sub">Estimates can miss; sometimes an ordinary-looking idea turns out to be a gem</span></div><div class="pb">${cards?`<div class="grid3">${cards}</div>`:"<div class=\"small muted\">No ideas yet. Hold a hackathon or allow side project time.</div>"}</div></section>
  ${tools.length?`<section class="panel"><div class="ph"><h2>Internal tools</h2></div><div class="pb col" style="gap:4px">${tools.map(t=>`<div class="small"><b>${TOOLS[t].n}</b> · ${TOOLS[t].d}</div>`).join('')}</div></section>`:''}`:`<section class="panel"><div class="ph"><h2>Yan projeler ve hackathon${helpBtn('hack')}</h2><span class="sub">${L.length} fikir · ${tools.length} iç araç</span></div>
    <div class="pb"><div class="grid3">
      <div class="proj col" style="gap:6px"><b>İç hackathon</b><div class="small muted">Mühendisler ve araştırmacılar 3 gün projelerini bırakıp kendi fikirleri üzerinde çalışır. Moral +6; 2–5 fikir çıkar.</div>
        <button class="btn sm primary" data-act="hack" data-pub="0" ${cd>0||devs.length<3||G.cash<hackCost(false)?'disabled':''}>${cd>0?cd+' gün sonra':devs.length<3?'En az 3 mühendis gerekli':'Düzenle · '+money(hackCost(false))}</button></div>
      <div class="proj col" style="gap:6px"><b>Açık hackathon</b><div class="small muted">Topluluğu da davet edersin: aynı fikirlere ek olarak marka +1,5 ve iki yetenekli aday.</div>
        <button class="btn sm" data-act="hack" data-pub="1" ${cd>0||devs.length<3||G.cash<hackCost(true)?'disabled':''}>${cd>0?cd+' gün sonra':'Düzenle · '+money(hackCost(true))}</button></div>
      <div class="proj col" style="gap:6px"><b>Yan proje zamanı</b><div class="small muted">Mühendisler zamanlarının %10'unu kendi projelerine ayırır: projeler %10 yavaşlar, moral her ay biraz artar ve ara sıra fikir çıkar (yaratıcı çalışanlarda daha sık).</div>
        <div class="row" style="gap:4px"><button class="btn sm ${G.sideT?'ghost':'primary'}" data-act="sidet" data-v="0">Yok</button><button class="btn sm ${G.sideT?'primary':'ghost'}" data-act="sidet" data-v="0.1">%10</button></div></div>
    </div></div></section>
  <section class="panel"><div class="ph"><h2>Fikirler</h2><span class="sub">Tahminler tutmayabilir; bazen sıradan görünen fikir cevher çıkar</span></div><div class="pb">${cards?`<div class="grid3">${cards}</div>`:'<div class="small muted">Henüz fikir yok. Bir hackathon düzenle ya da yan proje zamanı tanı.</div>'}</div></section>
  ${tools.length?`<section class="panel"><div class="ph"><h2>İç araçlar</h2></div><div class="pb col" style="gap:4px">${tools.map(t=>`<div class="small"><b>${TOOLS[t].n}</b> · ${TOOLS[t].d}</div>`).join('')}</div></section>`:''}`);
}

