/* ============================== ACTIONS ============================== */
function idle(e){return ['soft','design','hw'].includes(e.role)&&!e.proj&&!e.leave;}
function defaultDraft(cat){
  const cpus=G.products.filter(p=>p.cat==='cpu'&&p.active&&alive(p.owner)).sort((a,b)=>b.score-a.score);
  const oss=G.products.filter(p=>p.cat==='os'&&p.active&&alive(p.owner)).sort((a,b)=>(b.owner==='P')-(a.owner==='P')||b.score-a.score);
  const nodes=NODES.filter(n=>has(n.r));const n=nodes[nodes.length-1]||NODES[0];
  const cnt=G.products.filter(p=>p.owner==='P'&&p.cat===cat).length+G.projects.filter(p=>p.cat===cat).length;
  const base={app:(LANG_EN?"App":'Uygulama'),saas:(LANG_EN?"Service":'Servis'),os:'OS',cpu:(LANG_EN?"Chips":'Çip'),phone:(LANG_EN?"Phone":'Telefon'),pc:'PC',wear:(LANG_EN?"Watch":'Saat'),console:(LANG_EN?"Console":'Konsol'),ai:(LANG_EN?"Assistant":'Asistan'),xr:(LANG_EN?"Glasses":'Gözlük'),car:(LANG_EN?"Drive":'Sürüş'),robo:(LANG_EN?"Robot":'Robot'),iot:(LANG_EN?"Home":'Ev'),qc:(LANG_EN?"Quantum":'Kuantum')}[cat];
  return {cat,name:`${G.name.split(' ')[0]} ${base} ${cnt+1}`,price:0,node:n.id,cores:Math.min(4,n.cores),clock:Math.min(2.8,n.clk),
    focus:faDef(cat),feats:ftDefault(cat),cpu:(cpus.find(p=>p.owner==='P')||cpus[0]||{}).id||null,os:(oss[0]||{}).id||null,screen:1,camera:1,battery:1,ram:1,storage:0,sensor:1,wbat:1,gpu:1,optic:1,rsense:1,actuator:1,radio:1,qubit:0,cryo:0,assign:true};
}
function facBuildCost(type,region){const inc=G.incentive&&G.incentive.until>G.day&&G.incentive.region===region?1-G.incentive.pct:1;const si=type==='fab'&&region==='turkiye'&&G.mods&&G.mods.fabInc?1-G.mods.fabInc:1;return FTYPES[type].cost*FREG[region].build*infl()*inc*si;}
/* ACTV: her oyuncu eyleminde artar; patch aynı HTML'i yalnızca eylemsiz yenilemelerde atlar (panel aç/kapa gibi görünüm durumları uygulansın) */
let ACTV=0;
function act(a,ds){ACTV++;if(!chalOn()||Math.random!==RNG0)return act0(a,ds);if(UI._ad!==G.day){UI._ad=G.day;UI._an=0;}rngSeed('a'+G.day+'|'+a+'|'+(UI._an++));try{return act0(a,ds);}finally{rngFree();}}
function act0(a,ds){
  const id=ds.id!=null&&ds.id!==''&&!isNaN(+ds.id)?+ds.id:ds.id;
  switch(a){
    case 'resf':{UI.resF=['avail','lock','done','all'].includes(ds.k)?ds.k:'avail';break;}
    case 'resgo':{UI.resF='all';return act('tab',{tab:'res:arastirma'});}
    case 'selemp':{UI.selEmp=+ds.id;break;}
    case 'wrgo':{wrGo(+ds.k||1);return;}
    case 'wrpause':{if(UI.wrap){UI.wrap.pause=!UI.wrap.pause;renderModal();}return;}
    case 'wrclose':{UI.wrap=null;clearInterval(WR_T);closeModal();if(G.prevSpeed&&!G.over&&!G.pending)G.speed=G.prevSpeed;break;}
    case 'wropen':{wrOpen(+ds.y);return;}
    case 'wrrep':{const y=UI.wrap&&UI.wrap.y;UI.wrap=null;clearInterval(WR_T);closeModal();UI.arY=y;return act('tab',{tab:'fin:rapor'});}
    case 'wrdl':{const W=UI.wrap,r=W&&G.ar.reps.find(x=>x.y===W.y);if(!r)return;const fn=`${(G.name||'sirket').replace(/[^\w\-]+/g,'-')}-${r.y}-ozet.svg`,svg=wrSVG(r);if(W)W.pause=true;
      if(DL){DL.save({filename:fn,data:svg}).then(()=>showToast((LANG_EN?"Summary card ready.":'Özet kartı hazırlandı.'))).catch(e=>{const c=e&&e.code;if(c==='declined')return;showToast((LANG_EN?"Couldn't download the summary card.":'Özet kartı indirilemedi.'),'bad');});}
      else{try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));a.download=fn;document.body.appendChild(a);a.click();a.remove();}catch(e){showToast((LANG_EN?"Couldn't download the summary card.":'Özet kartı indirilemedi.'),'bad');}}
      renderModal();return;}
    case 'betaset':{const pr=G.projects.find(x=>x.id===id);if(!pr||pr.upd||pr.idea||pr.betaUntil)break;const k=ds.k||null;if(k&&BETA[k]){const c=betaCost(k);if(G.cash<c)break;if(c)spend(c,'other');pr.beta=k;news((LANG_EN?`Planned for ${pr.name}: ${BETA[k].n.toLocaleLowerCase(LOC)}, running for 30 days once development ends.`:`${pr.name} için ${BETA[k].n.toLocaleLowerCase(LOC)} planlandı: geliştirme bitince 30 gün sürecek.`));}else pr.beta=null;break;}
    case 'focusgrp':{const pr=G.projects.find(x=>x.id===id);if(!pr||pr.focus2||pr.upd)break;const c=focusCost();if(G.cash<c)break;const F=focusReport(pr);if(!F)break;spend(c,'other');pr.focus2=F;pr.qBonus=(pr.qBonus||1)*1.02;news((LANG_EN?`${pr.name} focus group: estimated press score ${fx(F.lo,1)}–${fx(F.hi,1)}, price ${F.price}.`:`${pr.name} odak grubu: tahmini basın puanı ${fx(F.lo,1)}–${fx(F.hi,1)}, fiyat ${F.price}.`));break;}
    case 'qacc':{const Q=G.quest;if(Q&&Q.offer&&Q.act.length<2){Q.act.push({...Q.offer,s:G.day});news((LANG_EN?`Quest accepted: ${QTD[Q.offer.t].t(Q.offer)}.`:`Görev kabul edildi: ${QTD[Q.offer.t].t(Q.offer)}.`));Q.offer=null;}break;}
    case 'qrej':{const Q=G.quest;if(Q&&Q.offer){Q.offer=null;}break;}
    case 'htobuy':{const c=comp(id);if(!c||c.dead)break;const e=htoBuy(c);if(e)showToast(e,'bad');break;}
    case 'htotender':{const e=htoTender(clamp(+ds.k||1.25,1.05,1.6));if(e)showToast(e,'bad');break;}
    case 'htoraise':{const e=htoRaise();if(e)showToast(e,'bad');break;}
    case 'htosell':{if(G.hto.mine&&G.hto.mine.st==='build')htoEnd(true,(LANG_EN?"You backed out of the deal.":'Girişimden vazgeçtin.'),0.95);break;}
    case 'htodef':{if(!htoDefend(ds.k))showToast((LANG_EN?"This defense can't be used right now.":'Bu savunma şu an uygulanamaz.'),'bad');break;}
    case 'aiwadd':{const t=ds.k,R=AIW_R[t];if(!R||!aiwOn()||!has(R.req))break;const n=Math.round(+ds.n||0);if(!n)break;const A=G.aiw;const was=aiwTot();A.n[t]=clamp(aiwN(t)+n,0,500);if(!was&&aiwTot()){aiwLog((LANG_EN?`Your first ${R.n.toLocaleLowerCase(LOC)} has started work.`:`İlk ${R.n.toLocaleLowerCase(LOC)} işe başladı.`));if(!(G.flags&&G.flags.aiw))tl('emp',(LANG_EN?"First AI agent at work":'İlk yapay zekâ ajanı işe başladı'));(G.flags=G.flags||{}).aiw=true;}break;}
    case 'aiwguard':{G.aiw.guard=!G.aiw.guard;break;}
    case 'aiwup':{G.aiw.up=!G.aiw.up;break;}
    case 'dplvl':{const D=G.dp;if(!DP_L[ds.k]||D.lvl===ds.k)break;D.lvl=ds.k;dpLog((LANG_EN?`Data policy: ${DP_L[ds.k].n}.`:`Veri politikası: ${DP_L[ds.k].n}.`));if(ds.k==='max'&&G.soc)G.soc.s=clamp(G.soc.s-4,-100,100);break;}
    case 'dpconsent':{G.dp.consent=!G.dp.consent;dpLog(G.dp.consent?(LANG_EN?"Explicit consent screens enabled.":'Açık rıza ekranları devreye alındı.'):(LANG_EN?"Explicit consent screens removed.":'Açık rıza ekranları kaldırıldı.'));break;}
    case 'dpenc':{const D=G.dp,c=DP_ENC*infl();if(D.enc||G.cash<c)break;spend(c,'capex');D.enc=true;D.trust=clamp(D.trust+4,0,100);dpLog((LANG_EN?"End-to-end encryption is in place.":'Uçtan uca şifreleme kuruldu.'),'good');tl('data',(LANG_EN?"End-to-end encryption in place":'Uçtan uca şifreleme kuruldu'));news((LANG_EN?"End-to-end encryption is now live across all software products. Security experts praised the move.":'Uçtan uca şifreleme tüm yazılım ürünlerinde devrede. Güvenlik uzmanları övgüyle karşıladı.'),'good');break;}
    case 'dptr':{const D=G.dp,c=DP_TR*infl();if(G.day-D.tr<365||G.cash<c)break;spend(c,'other');D.tr=G.day;D.trust=clamp(D.trust+8,0,100);dpLog((LANG_EN?"Transparency report published. Trust +8.":'Şeffaflık raporu yayımlandı. Güven +8.'),'good');break;}
    case 'dpsell':{const D=G.dp,u=dpSwU();if(G.day-D.saleAt<365||u<10000)break;const v=Math.min(50e6,u*0.4*infl());G.cash+=v;G.month.rev+=v;D.saleAt=G.day;D.trust=clamp(D.trust-(D.lvl==='min'?25:10),0,100);D.sale={at:G.day+rint(60,180),leak:Math.random()<(D.enc?0.2:0.35)};(G.flags=G.flags||{}).dpsold=true;dpLog((LANG_EN?`Dataset sold for ${money(v)}.`:`Veri seti ${money(v)} karşılığında satıldı.`),'bad');break;}
    case 'shopopen':{const S=G.shops,t=ds.k,r=ds.r,T=SHOP_T[t];if(!T||!REGS[r]||!G.regions[r]||!G.regions[r].in||!shopOn())break;const L=S.list.filter(x=>x.r===r);if(shopFull(t,r))break;const c=shopCost(t,r);if(G.cash<c){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');break;}if(shopCashRisk(c))showToast((LANG_EN?"Warning: after this opening, your remaining cash may not cover upcoming launch parts and 3 months of fixed costs.":'Dikkat: bu açılıştan sonra kalan nakit, yaklaşan lansman parçalarına ve 3 aylık sabit gidere yetmeyebilir.'),'bad');
      spend(c,'capex');const pc=UI.shopCity&&CITYD[UI.shopCity[r]]&&CITYD[UI.shopCity[r]].r===r?CITYD[UI.shopCity[r]]:null,C=SHOP_CITY[r],n=L.length,base=C[n%C.length],city=pc?pc.n:base+(n>=C.length?' '+(Math.floor(n/C.length)+1):'');S.list.push({id:++S.nid,t,r,city,cid:pc?pc.id:(CITY.find(x=>x.r===r&&x.n===base)||{}).id,ready:G.day+T.days,s:G.day,sales:0});{const ns=S.list[S.list.length-1];if(UI.shopPlot&&pc&&UI.shopPlot.c===pc.id){const u=plotUse(pc.id,UI.shopPlot.i);if(!u||u.s===ns)ns.plot=UI.shopPlot.i;}}if(G.ct)G.ct.v++;S.open++;(G.flags=G.flags||{}).shops=Math.max(G.flags.shops||0,S.list.length);shopLog((LANG_EN?`Setup of the ${city} ${shopNl(t)} has begun (${money(c)}).`:`${city} ${shopNl(t)} kurulumu başladı (${money(c)}).`));break;}
    case 'shopclose':{const S=G.shops,x=S.list.find(q=>q.id===id);if(!x)break;const back=shopCost(x.t,x.r)*0.2;G.cash+=back;S.list=S.list.filter(q=>q!==x);shopLog((LANG_EN?`${x.city} ${shopNl(x.t)} closed; ${money(back)} recovered.`:`${x.city} ${shopNl(x.t)} kapatıldı; ${money(back)} geri döndü.`),'bad');break;}
    case 'bunpick':{const S=UI.bunSel;if(!S||!bunElig().some(p=>p.id===id))break;S.ids=S.ids.includes(id)?S.ids.filter(x=>x!==id):[...S.ids,id];break;}
    case 'bundisc':{const d=+ds.k;if(UI.bunSel&&BUN_D.includes(d))UI.bunSel.disc=d;break;}
    case 'bunfam':{if(UI.bunSel)UI.bunSel.fam=!UI.bunSel.fam;break;}
    case 'bungo':{const B=G.bun,S=UI.bunSel;if(!S)break;const ids=S.ids.filter(id=>bunElig().some(p=>p.id===id));if(ids.length<2)break;
      if(!B.on){B.on=true;B.start=G.day;B.ids=ids;B.disc=S.disc;B.fam=S.fam;B.sh=0.02;G.brand=clamp(G.brand+1,0,100);if(G.soc)G.soc.s=clamp(G.soc.s+5,-100,100);(G.flags=G.flags||{}).bun=true;news((LANG_EN?`${bunName()} is live: ${ids.length} products in one bundle, ${Math.round(S.disc*100)}% off.`:`${bunName()} yayında: ${ids.length} ürün tek pakette, %${Math.round(S.disc*100)} indirimle.`),'good',true);bunLog((LANG_EN?`Bundle launched: ${ids.length} products, ${Math.round(S.disc*100)}% off.`:`Paket başlatıldı: ${ids.length} ürün, %${Math.round(S.disc*100)} indirim.`),'good');tl('prod',(LANG_EN?`${bunName()} subscription bundle launched`:`${bunName()} abonelik paketi başladı`));}
      else{bunSet(ids,S.disc,S.fam);bunLog((LANG_EN?"Bundle updated.":'Paket güncellendi.'));}break;}
    case 'bunoff':{const B=G.bun;if(!B.on)break;for(const p of bunProds())if(p.sat!=null)p.sat=Math.max(0,p.sat-4);B.on=false;B.sh=0;B.subs=0;B.rev=0;if(G.soc)G.soc.s=clamp(G.soc.s-8,-100,100);bunLog((LANG_EN?"Bundle shut down; subscribers are upset.":'Paket kapatıldı; aboneler tepkili.'),'bad');news((LANG_EN?`${bunName()} bundle shut down. Subscribers are venting on social media.`:`${bunName()} paketi kapatıldı. Aboneler sosyal medyada tepkili.`),'bad',true);break;}
    case 'fairreg':{const F=G.fair,f=FAIRD[ds.k],T=FAIR_T[ds.t];if(!f||!T||F.reg[f.id])break;const d=fairNext(f);if(d-G.day<14)break;if(T.minBrand&&G.brand<T.minBrand)break;const c=fairCost(f,ds.t);if(G.cash<c){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');break;}
      const sel=(UI.fairP&&UI.fairP[f.id]!=null)?UI.fairP[f.id]:(fairProds(f)[0]?String(fairProds(f)[0].id):'');const p=sel?prod(+sel):null;spend(c,'other');F.reg[f.id]={t:ds.t,d,pid:p&&p.owner==='P'&&p.active&&f.cats.includes(p.cat)?p.id:null};fairLog((LANG_EN?`Booked for ${f.n}: ${T.n.toLocaleLowerCase(LOC)} (${money(c)}).`:`${f.n} için ${T.n.toLocaleLowerCase(LOC)} ayrıldı (${money(c)}).`));break;}
    case 'spoon':{const S=SPO[ds.k],F=G.fair;if(!S||F.spo[ds.k])break;if(S.minBrand&&G.brand<S.minBrand)break;if(G.cash<S.cost*infl()*3)break;F.spo[ds.k]={s:G.day};fairLog((LANG_EN?`${S.n} sponsorship started.`:`${S.n} sponsorluğu başladı.`),'good');tl('fair',(LANG_EN?`${S.n} sponsorship started`:`${S.n} sponsorluğu başladı`));news((LANG_EN?`${G.name} is now a sponsor: ${S.n.toLocaleLowerCase(LOC)}.`:`${G.name} artık ${S.n.toLocaleLowerCase(LOC)} sponsoru.`),'mkt',true);(G.flags=G.flags||{}).spo=Math.max(G.flags.spo||0,Object.keys(F.spo).length);break;}
    case 'spooff':{const S=SPO[ds.k],F=G.fair,c=F.spo[ds.k];if(!S||!c)break;if(G.day-c.s<365)spend(S.cost*infl()*3,'other');delete F.spo[ds.k];fairLog((LANG_EN?`${S.n} sponsorship ended.`:`${S.n} sponsorluğu sona erdi.`));break;}
    case 'galshare':{galShare(+ds.i);break;}
    case 'galunshare':{galUnshare(String(ds.k||''));break;}
    case 'gallike':{galLike(String(ds.k||''));break;}
    case 'galplay':{galPlay(String(ds.k||''));return;}
    case 'galsort':{UI.galSort=ds.k==='new'?'new':'top';UI.galN=9;if(UI.modal&&UI.modal.kind==='scenario')renderModal();break;}
    case 'galmore':{UI.galN=(UI.galN||9)+9;if(UI.modal&&UI.modal.kind==='scenario')renderModal();break;}
    case 'phopen':{phOpen();return;}
    case 'phclose':{phClose();break;}
    case 'phfr':{if(UI.ph&&PH_FR[ds.k]){UI.ph.fr=ds.k;renderModal();}return;}
    case 'phf':{if(UI.ph&&PH_F[ds.k]){UI.ph.f=ds.k;renderModal();}return;}
    case 'phsz':{if(UI.ph&&PH_SZ[ds.k]){UI.ph.sz=ds.k;renderModal();}return;}
    case 'phstats':{if(UI.ph){UI.ph.stats=!UI.ph.stats;renderModal();}return;}
    case 'phsnap':{const P=UI.ph;if(!P)return;closeModal();UI.force=true;render();setTimeout(()=>{if(UI.ph!==P)return;P.snap=phCapture()||P.snap;P.at=G.day;openModal('photo');},150);return;}
    case 'phdl':{if(UI.ph)phSave();return;}
    case 'a11y':{const k=ds.k;if(!(k in A11Y_DEF))break;let v=ds.v;if(k==='fs'||k==='toast'){v=+v;if(!(k==='fs'?A11Y_FS:A11Y_TOAST).some(x=>x[0]===v))break;}else if(k==='hc'||k==='cb')v=v==='1';else if(k==='theme'&&!['sys','light','dark'].includes(v))break;else if(k==='rm'&&!['sys','on','off'].includes(v))break;else if(k==='font'&&!['std','leg'].includes(v))break;a11ySet(k,v);break;}
    case 'a11yreset':{PREF.a11y={};prefSave();a11yApply();break;}
    case 'bmst':{const C=G.bm&&G.bm.cur;if(!C||C.res)break;const it=C.items[+ds.i];if(it)it.st=clamp(Math.round(+ds.k||0),-1,1);renderModal();break;}
    case 'bmlob':{const C=G.bm&&G.bm.cur;if(!C||C.res||C.lob)break;const c=25e3*infl();if(G.cash<c)break;const m=G.bm.mem.find(x=>x.id===id);if(!m)break;spend(c,'other');C.lob=m.id;m.rel=clamp(m.rel+4,0,100);renderModal();break;}
    case 'bmvote':{if(G.bm&&G.bm.cur&&!G.bm.cur.res){bmVote(false);renderModal();}break;}
    case 'bmabs':{if(G.bm&&G.bm.cur&&!G.bm.cur.res){bmVote(true);bmClose();}break;}
    case 'bmdone':{bmClose();break;}
    case 'bmgo':{bmClose();act('tab',{tab:'fin:kurul'});return;}
    case 'bmopen':{if(G.bm&&G.bm.cur&&!G.bm.cur.res){if(G.speed){G.prevSpeed=G.speed;G.speed=0;}openModal('bm');}break;}
    case 'advopen':{UI.advPop=null;openModal('adv');return;}
    case 'advpopx':{UI.advPop=null;break;}
    case 'advgo':{G.adv.done=(G.adv.done||0)+1;closeModal();UI._advT=null;return act('tab',{tab:ds.tab});}
    case 'advsnz':{G.adv.snooze[ds.k]=G.day+60;UI._advT=null;renderModal();break;}
    case 'advwho':{if(ADV[ds.k]){G.adv.who=ds.k;UI._advT=null;showToast(`${ADV[ds.k].n}: ${ADV[ds.k].hi}`);}renderModal();break;}
    case 'advpop':{G.adv.pop=!G.adv.pop;renderModal();break;}
    case 'advoff':{G.adv.off=true;closeModal();showToast((LANG_EN?"Advisor hidden. You can bring it back in Finance → Save & settings.":'Danışman gizlendi. Finans → Kayıt ve ayarlar bölümünden geri açabilirsin.'));break;}
    case 'advtoggle':{G.adv.off=!G.adv.off;break;}
    case 'splic':{const S=G.space,k=SP_LIC*infl();if(S&&!S.lic&&G.cash>=k){spend(k,'other');S.lic=true;news((LANG_EN?"International spectrum license obtained for satellite internet.":'Uydu interneti için uluslararası frekans lisansı alındı.'),'good');spLog((LANG_EN?"Spectrum license obtained.":'Frekans lisansı alındı.'),'good');}break;}
    case 'spbuild':{const S=G.space,n=+ds.k,k=Math.round(n*SP_SAT_COST*infl());if(S&&SP_BATCH.includes(n)&&G.cash>=k){spend(k,'capex');S.build.push({n,ready:G.day+SP_BUILD});spLog((LANG_EN?`${n} satellites entered production (${money(k)}).`:`${n} uydu üretime girdi (${money(k)}).`));}break;}
    case 'splaunch':{const S=G.space,L=spLaunchOpt(),k=L.cost*infl();let r=0,u=0;while(S&&(S.ready||0)>0&&G.cash>=k){const n=Math.min(S.ready,L.cap);spend(k,'capex');S.ready-=n;S.launch.push({n,day:G.day+L.wait+r*3,own:S.rk>=1});r++;u+=n;}if(r)spLog((LANG_EN?`${r} launches scheduled for ${u} satellites (${L.n}).`:`${u} uydu için ${r} fırlatma planlandı (${L.n}).`));break;}
    case 'spprice':{const v=+ds.k;if(G.space&&[50,65,80,95,110].includes(v))G.space.price=v;break;}
    case 'sprk':{const S=G.space,N=SP_RK[S.rk+1];if(S&&N&&!S.rkBusy&&has(S.rk===0?'rocket':'crew')&&G.cash>=N.cost*infl()){spend(N.cost*infl(),'capex');S.rkBusy=G.day+N.days;news((LANG_EN?`${N.n} program started: it will take ${N.days} days.`:`${N.n} programı başladı: ${N.days} gün sürecek.`));spLog((LANG_EN?`${N.n} program started.`:`${N.n} programı başladı.`));}break;}
    case 'sptour':{const S=G.space;if(S&&S.rk>=2){S.tour=S.tour?0:1;if(S.tour&&!S.tourNext)S.tourNext=G.day+60;}break;}
    case 'cslearn':{const N=CSN[ds.k];if(N&&csCan(ds.k)){G.cs.pts-=N.cost;G.cs.own[ds.k]=G.day;news((LANG_EN?`New CEO skill: ${N.n}. ${N.d}`:`Yeni CEO yeteneği: ${N.n}. ${N.d}`),'good');sfx('ach');}break;}
    case 'csreset':{const k=csResetCost(),sp=Object.keys(G.cs.own).reduce((a,x)=>a+CSN[x].cost,0);if(!sp||G.cash<k)break;spend(k,'other');G.cs.pts+=sp;G.cs.own={};news((LANG_EN?`You worked with an executive coach: ${sp} skill points refunded.`:`Yönetim koçuyla çalıştın: ${sp} yetenek puanı geri alındı.`));break;}
    case 'mapsel':{UI.mapSel=ds.k&&UI.mapSel!==ds.k?ds.k:null;break;}
    case 'mapl':{const L=UI.mapL||(UI.mapL={mkt:1,sup:1,inf:1,riv:0});if(ds.k in L)L[ds.k]=L[ds.k]?0:1;break;}
    case 'sbpos':{(UI.sbn=UI.sbn||{}).pos=SB_POS[ds.k]?ds.k:'eco';break;}
    case 'sbtype':{(UI.sbn=UI.sbn||{}).end=ds.k==='1';break;}
    case 'sbname':{const used=G.sb.list.map(x=>x.n);(UI.sbn=UI.sbn||{}).name=pick(SB_NAMES.filter(x=>!used.includes(x)))||(LANG_EN?"New":'Yeni');break;}
    case 'sbnew':{sbCreate();break;}
    case 'sbrm':{const p=prod(id);if(p&&p.owner==='P'){p.sb=null;news((LANG_EN?`${p.name} is sold under the ${G.name} brand again.`:`${p.name} yeniden ${G.name} markasıyla satılıyor.`));}break;}
    case 'sblogo':{const S=sbById(id),k=10e3*infl();if(S&&G.cash>=k){spend(k,'other');S.lg=sbLogo(S.pos,S.n);}break;}
    case 'sbend':{const S=sbById(id);if(S){S.end=!S.end;news(S.end?(LANG_EN?`${S.n} is now sold backed by ${G.name}.`:`${S.n} artık ${G.name} güvencesiyle satılıyor.`):(LANG_EN?`${S.n} became an independent brand.`:`${S.n} bağımsız bir marka oldu.`));}break;}
    case 'sbdel':{const S=sbById(id);if(S){for(const p of G.products)if(p.sb===S.id)p.sb=null;G.sb.list=G.sb.list.filter(x=>x!==S);news((LANG_EN?`${S.n} sub-brand closed; its products returned to the main brand.`:`${S.n} alt markası kapatıldı; ürünleri ana markaya döndü.`),'bad');}break;}
    case 'socre':{const P=G.soc&&G.soc.posts.find(x=>x.id===+ds.id);if(P&&!P.r&&G.day-P.d<6)socReply(P,ds.k);break;}
    case 'socmore':{UI.socN=(UI.socN||15)+15;break;}
    case 'socf':{UI.socN=15;UI.socF=['all','q','pos','neg','vir'].includes(ds.k)?ds.k:'all';break;}
    case 'socteam':{const i=clamp(+ds.i|0,0,2);if(G.soc)G.soc.team=i;break;}
    case 'stans':{stAnswer(+ds.i);renderModal();break;}
    case 'stend':{stFinish(false);closeModal();if(G.prevSpeed&&!G.over)G.speed=G.prevSpeed;break;}
    case 'stskip':{const S=G.stage;if(S){if(S.i===0)stFinish(true);else stFinish(false);}closeModal();if(G.prevSpeed&&!G.over)G.speed=G.prevSpeed;break;}
    case 'pcol':{PREF.pcol=PREF.pcol||{};PREF.pcol[ds.k]=ds.c==='1'?0:1;prefSave();break;}
    case 'hub':{const H=HUBS.find(h=>h.id===ds.h);if(!H)break;const l=(UI.hubLast||{})[H.id];return act('tab',{tab:l&&H.sec.some(x=>x[0]===l)&&leafOk(l)?l:H.sec[0][0]});}
    case 'cmd':{UI.cmdQ='';UI.cmdI=0;openModal('cmd');setTimeout(()=>{const q=document.getElementById('cmdQ');if(q)q.focus();},0);return;}
    case 'cmdgo':{cmdGo(+ds.i);return;}
    case 'evopen':{if(G.pending)openModal('event');return;}
    case 'rtall':{UI.rtAll=UI.rtAll||{};UI.rtAll[ds.k]=1;break;}
    case 'rtopen':{UI.rtOpen=UI.rtOpen||{};if(UI.rtOpen[ds.k])delete UI.rtOpen[ds.k];else UI.rtOpen[ds.k]=1;break;}
    case 'navmore':{UI.navMore=UI.navMore===ds.h?null:ds.h;break;}
    case 'navpin':{const P=PREF.pins||(PREF.pins=[]),i=P.indexOf(ds.k);if(i>=0)P.splice(i,1);else{P.push(ds.k);if(P.length>12)P.shift();}prefSave();break;}
    case 'tab':{UI.navMore=null;const [t,sb]=String(ds.tab).split(':');UI.tab=t;if(sb)(UI.sub=UI.sub||{})[t]=sb;window.scrollTo({top:0});break;}
    case 'statr':UI.statR=ds.k;break;
    case 'tlf':UI.tlF=ds.k;break;
    case 'sndtoggle':{sndInit();PREF.mute=!(PREF.mute||(!PREF.sfx&&!PREF.music));if(!PREF.mute&&!PREF.sfx&&!PREF.music)PREF.sfx=true;prefSave();sndVol();sndBtnUpdate();if(!PREF.mute)sfx('good');break;}
    case 'pitchopen':{pitchOpen(ds.rid);return;}
    case 'pitchfund':{pitchFund(+ds.i);renderModal();return;}
    case 'pitchans':{pitchAns(ds.k);renderModal();return;}
    case 'pitchcomp':{pitchComp();renderModal();return;}
    case 'pitchacc':{pitchAccept(+ds.i);renderModal();break;}
    case 'pitchquit':{pitchQuit();break;}
    case 'cvpick':{const S=UI.cvSel||(UI.cvSel=[...G.cv.vals]),k=ds.k;if(!CV[k])break;const i=S.indexOf(k);if(i>=0)S.splice(i,1);else if(S.length<CV_MAX)S.push(k);break;}
    case 'cvapply':{const r=cvSet(UI.cvSel||[]);if(r==='conf')showToast((LANG_EN?"Your chosen values clash with each other.":'Seçtiğin değerler birbiriyle çatışıyor.'),'bad');else if(r==='cool')showToast((LANG_EN?"You can't change values this often.":'Değerleri bu kadar sık değiştiremezsin.'),'bad');else UI.cvSel=null;break;}
    case 'tipok':{const S=PREF.tipSeen||(PREF.tipSeen=[]);if(ds.k&&!S.includes(ds.k)){S.push(ds.k);if(S.length>120)S.shift();}prefSave();break;}
    case 'tipsoff':{PREF.tipsOff=true;prefSave();showToast((LANG_EN?"Tips turned off. You can turn them back on in Finance → Save & settings.":'İpuçları kapatıldı. Finans → Kayıt ve ayarlar bölümünden yeniden açabilirsin.'));break;}
    case 'tipsreset':{PREF.tipSeen=[];PREF.tipsOff=false;prefSave();showToast((LANG_EN?"Tips reset; they'll appear again as you open sections.":'İpuçları sıfırlandı; bölümleri açtıkça yeniden görünecek.'));break;}
    case 'eratog':{if(G.era){G.era.on=!G.era.on;news(G.era.on?(LANG_EN?"Era events turned on.":'Dönem olayları açıldı.'):(LANG_EN?"Era events turned off; calendar events won't happen in this game.":'Dönem olayları kapatıldı; takvimdeki gelişmeler bu oyunda yaşanmayacak.'));}break;}
    case 'qcaudit':{const p=prod(+ds.id);if(p)qcAudit(p);break;}
    case 'rfon':{const R=G.rf,c=RF_SETUP*infl();if(!R||R.on||G.cash<c||!rfCats().length)break;spend(c,'capex');R.on=true;R.since=G.day;rfLog((LANG_EN?"Refurbishment center opened.":'Yenileme merkezi açıldı.'),'good');news((LANG_EN?`${G.name} launched a certified refurbished products program.`:`${G.name} sertifikalı yenilenmiş ürün programını başlattı.`),'good',true);tl('leaf',(LANG_EN?"Refurbished products program launched":'Yenilenmiş ürün programı başladı'));(G.flags=G.flags||{}).rf=true;break;}
    case 'rfoff':{const R=G.rf;if(!R||!R.on)break;R.on=false;R.trade=false;rfLog((LANG_EN?"Program closed; inventory sold for scrap.":'Program kapatıldı; stok hurdaya satıldı.'),'bad');R.stock=0;break;}
    case 'rftrade':{const R=G.rf;if(!R||!R.on)break;const k=+ds.k;if(!k){R.trade=false;rfLog((LANG_EN?"Trade-in program closed.":'Takas programı kapatıldı.'));}else if(RF_CR.includes(k)){R.trade=true;R.credit=k;rfLog((LANG_EN?`Trade-in discount: ${Math.round(k*100)}%.`:`Takas indirimi %${Math.round(k*100)}.`),'good');}break;}
    case 'mrgobj':{mrgPick(0);break;}
    case 'mrgbid':{mrgPick(1);break;}
    case 'pref':{const k=ds.k;if(k==='mute')PREF.mute=!PREF.mute;else if(k in PREF)PREF[k]=!PREF[k];prefSave();sndInit();sndVol();sndBtnUpdate();if(k==='music'&&PREF.music)SND.next=0;break;}
    case 'prefdn':{if(['game','real','off'].includes(ds.k)){PREF.dn=ds.k;prefSave();}break;}
    case 'nfc':{UI.nf=UI.nf||{c:'all',tone:'all',q:''};UI.nf.c=ds.k;break;}
    case 'nft':{UI.nf=UI.nf||{c:'all',tone:'all',q:''};UI.nf.tone=ds.k;break;}
    case 'mkfocus':{G.mkt.focus=ds.k;G.mkt.ver++;break;}
    case 'mkset':{G.mkt.b[ds.ch]=Math.max(0,+ds.v||0);G.mkt.ver++;break;}
    case 'sub':(UI.sub=UI.sub||{})[ds.tab]=ds.k;window.scrollTo({top:0});break;
    case 'start':G.speed=1;break;
    case 'hire':{
      const c=G.cands.find(x=>x.id===id);if(!c)break;
      if(G.emps.length>=officeCap()){showToast((LANG_EN?"The office is full. Move to a bigger one in Company → Offices & servers.":'Ofis dolu. Şirket → Taşınma ve sunucular bölümünden daha büyük ofise taşın.'),'bad');break;}
      G.cands=G.cands.filter(x=>x!==c);c.hiredAt=G.day;G.emps.push(c);news((LANG_EN?`${c.name} (${ROLES[c.role].n}) joined the team.`:`${c.name} (${ROLES[c.role].n}) ekibe katıldı.`));break;}
    case 'fire':{const e=G.emps.find(x=>x.id===id);if(e&&!e.founder){if(e.um&&G.union.st==='union'){const sev=e.salary*3;spend(sev,'other');G.union.press=Math.min(100,G.union.press+8);news((LANG_EN?`Paid ${money(sev)} in severance to union member ${e.name}. The union is upset.`:`Sendika üyesi ${e.name} için ${money(sev)} tazminat ödendi. Sendika tepkili.`),'bad');}e.lw='fire';G.emps=G.emps.filter(x=>x!==e);G.layoff+=5;news((LANG_EN?`Parted ways with ${e.name}. The team is uneasy.`:`${e.name} ile yollar ayrıldı. Ekip tedirgin.`));if(UI.selEmp===e.id)UI.selEmp=null;}break;}
    case 'promote':{const e=G.emps.find(x=>x.id===id);if(e)promote(e);break;}
    case 'demote':demote(G.emps.find(x=>x.id===id));break;
    case 'autores':G.autoRes=!G.autoRes;break;
    case 'raise':{const e=G.emps.find(x=>x.id===id);if(!e||e.founder)break;e.salary=Math.round(e.salary*1.1/100)*100;e.morale=Math.min(100,e.morale+8);news((LANG_EN?`${e.name} got a 10% raise (${money(e.salary)}/mo).`:`${e.name} %10 zam aldı (${money(e.salary)}/ay).`));break;}
    case 'vac':{const e=G.emps.find(x=>x.id===id);if(!e||e.leave)break;lifeVacNote(e);e.leave={type:'vac',until:G.day+7};e.morale=Math.min(100,e.morale+5);news((LANG_EN?`${e.name} went on a 7-day vacation.`:`${e.name} 7 günlük tatile çıktı.`));break;}
    case 'teamrole':{UI.teamRole=ds.k||'';UI.teamN=0;break;}
    case 'teammore':{UI.teamN=ds.k==='all'?1e6:Math.max(40,UI.teamN||40)+40;break;}
    case 'pace':if(PACE[ds.p]){G.pace=ds.p;news((LANG_EN?`Work pace: ${PACE[ds.p].n}.`:`Çalışma temposu: ${PACE[ds.p].n}.`));if(ds.p==='crunch'&&G.union.st==='union'){G.union.press=Math.min(100,G.union.press+5);news((LANG_EN?"The union objected to the intense pace.":'Sendika yoğun tempoya itiraz etti.'),'bad');}}break;
    case 'perk':{const k=ds.k,pk=PERKS[k];if(!pk)break;
      if(pk.once){if(G.perks[k])break;G.equity*=0.98;G.perks[k]=true;for(const e of G.emps)e.morale=Math.min(100,e.morale+6);news((LANG_EN?"Employees were granted stock options. The team is thrilled.":'Çalışanlara hisse opsiyonu verildi. Ekip çok mutlu.'),'good',true);break;}
      G.perks[k]=!G.perks[k];news(`${pk.n} ${G.perks[k]?(LANG_EN?"started":'başladı'):(LANG_EN?"removed":'kaldırıldı')}.`);if(!G.perks[k])for(const e of G.emps)e.morale=Math.max(0,e.morale-4);break;}
    case 'teamevent':{if(G.day-G.teamEventAt<60)break;const cost=400*G.emps.length*infl();if(G.cash<cost){showToast((LANG_EN?"Not enough cash for the event.":'Etkinlik için yeterli nakit yok.'),'bad');break;}
      spend(cost,'other');G.teamEventAt=G.day;G.teamEventUntil=G.day+30;for(const e of G.emps){e.morale=Math.min(100,e.morale+10);e.energy=Math.min(100,e.energy+10);}news((LANG_EN?"Team event held. Great vibe at the office.":'Takım etkinliği düzenlendi. Ofiste hava çok iyi.'),'good',true);break;}
    case 'refresh':spend(2000,'other');G.cands=G.cands.filter(c=>c.hh&&c.hhUntil>G.day);for(let i=0;i<6;i++)G.cands.push(genCand());break;
    case 'devstep':{UI.devStep=clamp(+ds.k||1,1,3);break;}
    case 'devfair':{if(UI.draft)UI.draft.price=0;break;}
    case 'pickcat':if(catUnlocked(ds.cat)){UI.draft=defaultDraft(ds.cat);UI.devStep=2;}else showToast((LANG_EN?`Research first: ${RESD[CAT_RES[ds.cat]].n}`:`Önce araştır: ${RESD[CAT_RES[ds.cat]].n}`),'bad');break;
    case 'startproj':{
      const d=UI.draft;const r=spec(d,teamAvg(REQ_ROLES[d.cat])||3);
      if(r.err){showToast(r.err,'bad');break;}
      const tool=toolCost(d);if(tool>0&&G.cash<tool){showToast((LANG_EN?`${d.cat==='cpu'?"Mask set":"Production tooling"} requires ${money(tool)}.`:`${d.cat==='cpu'?'Maske seti':'Üretim kalıpları'} için ${money(tool)} gerekli.`),'bad');break;}
      if(tool>0){spend(tool,'capex');news((LANG_EN?`${d.cat==='cpu'?"Mask set":"Production tooling"} ordered: ${money(tool)}.`:`${d.cat==='cpu'?'Maske seti':'Üretim kalıpları'} sipariş edildi: ${money(tool)}.`));}
      const apf=(TD_AP[d.ap]||TD_AP.bal).f,req0={};for(const t in r.req)req0[t]=Math.max(1,Math.round(r.req[t]*apf));
      const pr={id:nid(),cat:d.cat,name:(d.name||(LANG_EN?"Untitled":'İsimsiz')).slice(0,40),d:{...d},ap:d.ap||'bal',req:req0,prog:Object.fromEntries(Object.keys(req0).map(t=>[t,0])),sk:0,pts:0,start:G.day};
      G.projects.push(pr);if(d.assign)assignIdle(pr);
      news((LANG_EN?`Development started: ${pr.name} (${CATS[pr.cat].n}).`:`Geliştirme başladı: ${pr.name} (${CATS[pr.cat].n}).`));UI.draft=defaultDraft(d.cat);UI.devStep=1;break;}
    case 'ossopen':{const r=RESD[ds.rid];if(!r||!ossOk(r))break;G.dev.oss.push({rid:r.id,since:G.day,stars:0});
      const lost=G.pats.filter(p=>p.src===r.id||p.n===r.n);G.pats=G.pats.filter(p=>!lost.includes(p));G.patPend=G.patPend.filter(p=>p.src!==r.id);G.patFiled[r.id]=true;
      for(const c of liveComps())if((PAT_CAT[r.id]||[]).some(k=>c.focus.includes(k)))c.tech=Math.min(1.45,c.tech+0.01);
      G.brand=clamp(G.brand+1,0,100);tl('star',(LANG_EN?`${r.n} open-sourced`:`${r.n} açık kaynak yapıldı`));news((LANG_EN?`${r.n} open-sourced! Developers are flocking to the project.${lost.length?" Your related patents lapsed.":''}`:`${r.n} açık kaynak yapıldı! Geliştiriciler projeye akın ediyor.${lost.length?' İlgili patentlerin düştü.':''}`),'good',true);break;}
    case 'apibuild':{if(G.dev.api||!has('fw'))break;const c=1e6*infl();if(G.cash<c)break;spend(c,'capex');G.dev.api={ready:G.day+90};news((LANG_EN?"Building the API platform: it will take 90 days.":'API platformu kuruluyor: 90 gün sürecek.'));break;}
    case 'devconf':{const D=G.dev,c=confCost();if(G.day-D.conf<365||G.cash<c)break;spend(c,'other');D.conf=G.day;D.devs=D.devs*1.15+500;G.brand=clamp(G.brand+2,0,100);
      for(const p of myActive())if(SW_CATS.includes(p.cat))p.hype={m:Math.max(1.15,p.hype&&p.hype.until>G.day?p.hype.m:1),until:G.day+45};
      G.cands=G.cands.filter(c=>c.hh&&c.hhUntil>G.day);for(let i=0;i<6;i++){const c=genCand(1.2);if(Math.random()<0.6)c.role=pick(['soft','soft','design','res']);G.cands.push(c);}
      tl('launch',(LANG_EN?`${G.name} held a developer conference`:`${G.name} geliştirici konferansı düzenlendi`));news((LANG_EN?`Your developer conference drew huge interest! The community grew, and your candidate list filled up with talented developers.`:`Geliştirici konferansın büyük ilgi gördü! Topluluk büyüdü, aday listesi yetenekli geliştiricilerle doldu.`),'good',true);break;}
    case 'devrel':{const i=+ds.i;if(DEVREL[i]!=null)G.dev.rel=i;break;}
    case 'esgoff':{const v=+ds.v;if(!ESG_OFF.includes(v))break;G.esg.off=v;news(v?(LANG_EN?`Carbon credits will be bought for ${v*100}% of your emissions.`:`Emisyonunun %${v*100}'i için karbon kredisi alınacak.`):(LANG_EN?"Carbon offset purchases stopped.":'Karbon dengeleme alımları durduruldu.'));break;}
    case 'esgrec':{G.esg.rec=!G.esg.rec;news(G.esg.rec?(LANG_EN?"Device recycling program started.":'Cihaz geri dönüşüm programı başladı.'):(LANG_EN?"Device recycling program stopped.":'Cihaz geri dönüşüm programı durduruldu.'),G.esg.rec?'good':'');break;}
    case 'esgcert':{if(esgCertOk())break;const k=esgCertCost();if(G.cash<k){showToast((LANG_EN?"Not enough cash for the certification.":'Sertifika için yeterli nakit yok.'),'bad');break;}spend(k,'capex');G.esg.cert=G.office;news((LANG_EN?`Your office earned a green building certification (${money(k)}).`:`Ofisin yeşil bina sertifikası aldı (${money(k)}).`),'good');tl('leaf',(LANG_EN?"Green building certification":'Yeşil bina sertifikası'));break;}
    case 'esggreen':{let k=0,n='';if(ds.fid){const f=G.factories.find(x=>x.id===ds.fid);if(!f||f.green)break;k=esgGreenFac(f);if(G.cash<k){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');break;}f.green=true;n=f.name;}
      else if(ds.pc){const p=plantOf(ds.pc);if(!p||p.green)break;k=esgGreenPlant(ds.pc);if(G.cash<k){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');break;}p.green=true;n=PLANTS[ds.pc].n;}else break;
      spend(k,'capex');news((LANG_EN?`${n} switched to renewable energy (${money(k)}).`:`${n} yenilenebilir enerjiye geçti (${money(k)}).`),'good');break;}
    case 'vcdd':{const x=G.vc.pitch.find(z=>z.id===id);if(!x||x.dd)break;const fee=Math.max(20000,x.ask*0.01);if(G.cash<fee)break;spend(fee,'other');x.dd=true;x.team=vcSignal(x.q,0.5);break;}
    case 'vcpass':{G.vc.pitch=G.vc.pitch.filter(z=>z.id!==id);break;}
    case 'vcinv':{const x=G.vc.pitch.find(z=>z.id===id);if(!x||G.cash<x.ask*1.5)break;spend(x.ask,'capex');const post=x.pre+x.ask;
      G.vc.port.push({id:x.id,name:x.name,cat:x.cat,st:x.st,q:x.q,stake:x.ask/post,val:post,cost:x.ask,since:G.day,lastR:0,pend:null});G.vc.inv+=x.ask;G.vc.pitch=G.vc.pitch.filter(z=>z!==x);
      vcLog((LANG_EN?`You invested ${money(x.ask)} in ${x.name} (${fx(x.ask/post*100,1)}% stake).`:`${x.name} şirketine ${money(x.ask)} yatırdın (%${fx(x.ask/post*100,1)} pay).`));news((LANG_EN?`Venture fund: invested ${money(x.ask)} in ${x.name}.`:`Girişim fonu: ${x.name} şirketine ${money(x.ask)} yatırım yapıldı.`));break;}
    case 'vcfollow':{const h=G.vc.port.find(z=>z.id===id);if(!h||!h.pend||G.cash<h.pend.cost)break;spend(h.pend.cost,'capex');h.cost+=h.pend.cost;G.vc.inv+=h.pend.cost;h.pend=null;vcLog((LANG_EN?`You kept your stake in ${h.name} through its new round.`:`${h.name} turunda payını korudun.`),'good');break;}
    case 'vcsell':{const h=G.vc.port.find(z=>z.id===id);if(!h)break;const cash=h.val*h.stake*0.8;G.cash+=cash;G.vc.real+=cash-h.cost;G.vc.port=G.vc.port.filter(z=>z!==h);vcLog((LANG_EN?`You sold your ${h.name} stake on the secondary market for ${money(cash)}.`:`${h.name} payını ikincil piyasada ${money(cash)} karşılığında sattın.`));break;}
    case 'vcbuy':{const h=G.vc.port.find(z=>z.id===id);if(!h||h.stake<0.15)break;const price=vcAcqPrice(h);if(G.cash<price)break;spend(price,'capex');G.vc.port=G.vc.port.filter(z=>z!==h);
      const n=clamp(Math.round(3+h.q*3),3,10),roles=REQ_ROLES[h.cat];let added=0;
      for(let i=0;i<n&&G.emps.length<officeCap();i++){const e=genCand();e.role=roles[i%roles.length];e.skill=clamp(Math.round((4+h.q*2+rnd(-1,1))*10)/10,2,9.5);e.level=levelFor(e.skill);e.salary=Math.round(marketSal(e)/100)*100;e.hiredAt=G.day;G.emps.push(e);added++;}
      G.vc.tech[h.cat]=Math.max(G.vc.tech[h.cat]||1,1+Math.min(0.15,0.05+0.05*h.q));G.brand=clamp(G.brand+1,0,100);
      tl('acq',(LANG_EN?`${h.name} acquired (from the venture fund)`:`${h.name} satın alındı (girişim fonundan)`));vcLog((LANG_EN?`${h.name} fully acquired: ${added} people joined the team, plus a tech bonus for your next ${CATS[h.cat].n.toLocaleLowerCase(LOC)} product.`:`${h.name} tamamen satın alındı: ${added} kişi ekibe katıldı, sonraki ${CATS[h.cat].n.toLocaleLowerCase(LOC)} ürününe teknoloji bonusu.`),'good');
      news((LANG_EN?`${h.name} acquired! Its ${added}-person team joined you; your next ${CATS[h.cat].n.toLocaleLowerCase(LOC)} product will be ${Math.round((G.vc.tech[h.cat]-1)*100)}% stronger.${n>added?" Part of the team left because there was no room in the office.":''}`:`${h.name} satın alındı! ${added} kişilik ekibi sana katıldı; sonraki ${CATS[h.cat].n.toLocaleLowerCase(LOC)} ürünün %${Math.round((G.vc.tech[h.cat]-1)*100)} daha güçlü olacak.${n>added?' Ofiste yer olmadığı için ekibin bir kısmı ayrıldı.':''}`),'good',true);break;}
    case 'serinv':{UI.serInv=+ds.v||0;renderModal();return;}
    case 'seralum':{UI.serAlum=UI.serAlum===false;renderModal();return;}
    case 'serialstart':{serialStart();closeModal();save();UI.tab='office';break;}
    case 'exitask':{if(G.day<VOL_MIN_DAYS||valuation()<VOL_MIN_VAL)break;openModal('exitask');break;}
    case 'exitok':{if(G.over)break;const offer=volOffer();G.exited={by:(LANG_EN?"Private equity fund":'Özel sermaye fonu'),offer,day:G.day,voluntary:true};G.wealth=(G.wealth||0)+offer*G.equity;G.over=true;G.speed=0;careerRecord('voluntary');
      news((LANG_EN?`${G.name} was sold to a private equity fund for ${money(offer)}.`:`${G.name}, bir özel sermaye fonuna ${money(offer)} karşılığında satıldı.`),'good');closeModal();setTimeout(()=>{openModal('exit');save();},0);break;}
    case 'pmset':{const p=prod(id),k=pmKind(p||{}),m=ds.m;if(!p||!k||!PM[k][m]||pmOf(p)===m)break;if(G.day-(p.pmAt||-99)<30){showToast((LANG_EN?"The pricing model can be changed at most once a month.":'Fiyatlandırma modeli en fazla ayda bir değiştirilebilir.'),'bad');break;}
      const was=pmOf(p),freeBefore=was==='ads'||was==='freemium';p.pm=m;p.pmAt=G.day;p.net=0;
      if(p.cat==='app'){if(m==='ads')p.price=CATS.app.arpu;if(m==='paid')p.price=2.99;if(m==='freemium'&&!p.prem)p.prem=4.99;if(m==='freemium'&&was==='paid')p.price=CATS.app.arpu;}
      if(p.cat==='app'&&freeBefore&&m==='paid'||m==='flat'&&was==='freemium'){if(p.sat!=null)p.sat=Math.max(0,p.sat-10);p.hype={m:0.8,until:G.day+60};news((LANG_EN?`${p.name} switched to a paid model; free users are upset.`:`${p.name} ücretli modele geçti; ücretsiz kullananlar tepkili.`),'bad',true);}
      else news((LANG_EN?`${p.name} now uses the ${PM[k][m].n.toLocaleLowerCase(LOC)} model.`:`${p.name} artık ${PM[k][m].n.toLocaleLowerCase(LOC)} modelinde.`));break;}
    case 'pmprem':{const p=prod(id);if(p&&p.cat==='app')p.prem=clamp(+ds.v||4.99,0.99,19.99);break;}
    case 'chalstart':{chalStart();closeModal();save();UI.tab='office';break;}
    case 'chalask':{openModal('chalask');break;}
    case 'ask':{if(!aiOn()){showToast((LANG_EN?"Claude isn't available in this view.":'Claude bu görünümde kullanılamıyor.'),'bad');return;}openModal('ask');setTimeout(()=>{const t=document.getElementById('askQ');if(t&&!isMob())t.focus();},50);return;}
    case 'askq':{aiAsk(ds.q);return;}
    case 'asksend':{const t=document.getElementById('askQ');aiAsk(t?t.value:UI.askQ);return;}
    case 'askstop':{if(AI.ctl)AI.ctl.abort();return;}
    case 'askclear':{AI.chat=[];AI.err=null;renderModal();return;}
    case 'askgo':{closeModal();return act('tab',{tab:ds.tab});}
    case 'press':{aiPress(+ds.id,false);return;}
    case 'paper':{aiPaper();return;}
    case 'lang':{if((ds.k==='en')!==LANG_EN)setLang(ds.k);return;}
    case 'dfocus':{const d=UI.draft;if(!d)return;d.focus=faStep(d.focus||faDef(d.cat),ds.a,+ds.d);UI.force=true;render();return;}
    case 'ufocus':{if(!UI.uf)return;UI.uf.f=faStep(UI.uf.f,ds.a,+ds.d,UI.uf.b,2);renderModal();return;}
    case 'setspec':case 'setmentor':case 'retain':teamAct(a,id,ds);break;
    case 'dfeat':{const d=UI.draft;if(!d)return;d.feats=ftToggle(d.feats||[],ds.k,d.cat);UI.force=true;render();return;}
    case 'ufeat':{if(!UI.uft)return;const p=prod(UI.uft.pid);if(!p)return;const cur=UI.uft.add;if(!(p.feats||[]).includes(ds.k)&&(cur.includes(ds.k)||cur.length<2))UI.uft.add=ftToggle(cur,ds.k,p.cat);renderModal();return;}
    case 'pdet':{const p=prod(id);if(p)openModal('pdet',p.id);return;}
    case 'storystart':{storyStart();closeModal();save();UI.tab='dash';break;}
    case 'simplepick':{UI.simplePick=UI.simplePick===false;renderModal();return;}
    case 'apgo':case 'apx':case 'runev':case 'apoff':case 'aprule':apAct(a,ds);break;
    case 'tdnstart':case 'tdncat':tdnAct(a,ds);break;
    case 'spninv':case 'spnbuy':case 'spnback':spnAct(a,ds);break;
    case 'cdpick':case 'cdopen':case 'cdclose':cdAct(a,ds);break;
    case 'lobpay':case 'lobcamp':lobAct(a,ds);break;
    case 'focustoggle':case 'focusov':case 'focuspeek':case 'focusreset':focusAct(a,ds);break;
    case 'wiopen':case 'wih':case 'wiev':case 'wiapply':case 'wiclose':wiAct(a,ds);break;
    case 'simpletoggle':{G.simple=!G.simple;if(G.simple)simpleInit();showToast(G.simple?(LANG_EN?`Simple mode on: ${simpleN()} sections hidden.`:`Basit mod açık: ${simpleN()} bölüm gizlendi.`):(LANG_EN?"Full mode: all sections visible.":'Tam mod: bütün bölümler açık.'));break;}
    case 'duelnew':{UI.duelC=duelNew();UI.force=true;if(UI.modal)renderModal();return;}
    case 'duelgo':{const el=document.getElementById('duelIn'),c=String(el?el.value:UI.duelC||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(!duelOk(c)){showToast((LANG_EN?"The code must be 6 characters (letters and digits; I, O, 0 and 1 aren't used).":'Kod 6 karakter olmalı (harf ve rakam; I, O, 0 ve 1 kullanılmaz).'),'bad');return;}UI.duelC=c;openModal('duelask');break;}
    case 'duelask':{if(duelOk(UI.duelC))openModal('duelask');break;}
    case 'duelstart':{if(!duelOk(UI.duelC))break;chalStart('D-'+UI.duelC);closeModal();save();UI.tab='office';break;}
    case 'duelview':{if(duelOk(ds.k)){UI.duelC=ds.k;openModal('duelboard');}break;}
    case 'duelcopy':{const c=duelOk(ds.k)?ds.k:UI.duelC;if(!duelOk(c))return;const t=duelInvite(c);try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>showToast((LANG_EN?"Invite text copied.":'Davet metni kopyalandı.')),()=>showToast((LANG_EN?`Couldn't copy. Share the code manually: ${c}`:`Kopyalanamadı. Kodu elle paylaş: ${c}`)));else showToast((LANG_EN?`Share the code: ${c}`:`Kodu paylaş: ${c}`));}catch(e){showToast((LANG_EN?`Share the code: ${c}`:`Kodu paylaş: ${c}`));}return;}
    case 'clsave':{clSave(ds.k);return;}
    case 'clload':{if(CL.meta&&CL.meta[ds.k])openModal('clload',ds.k);return;}
    case 'clloadok':{closeModal();clLoad(ds.k);return;}
    case 'cldel':{if(UI.clDel!==ds.k){UI.clDel=ds.k;UI.force=true;if(UI.modal)renderModal();return;}UI.clDel=null;clDel(ds.k);return;}
    case 'clrefresh':{clLoadMeta(true);return;}
    case 'report':{if(UI.modal&&UI.modal.kind!=='report')closeModal();openModal('report');break;}
    case 'repcopy':{const t=repText();try{navigator.clipboard.writeText(t).then(()=>showToast((LANG_EN?"Report card summary copied.":'Karne özeti kopyalandı.')),()=>showToast((LANG_EN?"Couldn't copy.":'Kopyalanamadı.'),'bad'));}catch(e){showToast((LANG_EN?"Couldn't copy.":'Kopyalanamadı.'),'bad');}return;}
    case 'repfile':{if(!DL)return;DL.save({filename:(LANG_EN?`silicon-garage-report-card-${G.name.replace(/[^\w\-]+/g,'-')}.txt`:`silikon-garaj-karne-${G.name.replace(/[^\w\-]+/g,'-')}.txt`),data:repText()}).then(()=>showToast((LANG_EN?"Report card file ready.":'Karne dosyası hazırlandı.'))).catch(e=>{if(e&&e.code!=='declined')showToast((LANG_EN?"Couldn't save the file.":'Dosya kaydedilemedi.'),'bad');});return;}
    case 'help':{if(ds.k&&ENCD[ds.k])UI.encA=ds.k;else if(!UI.encA)UI.encA='goal';if(UI.modal&&UI.modal.kind==='help'){const l=$('#encList'),mm=$('#encMain');if(l&&mm){l.innerHTML=encListHTML();mm.innerHTML=encBody();mm.scrollTop=0;break;}}openModal('help');break;}
    case 'helpgo':{const a=ENCD[ds.k];closeModal();if(a&&a.go)act('tab',{tab:a.go});break;}
    case 'xhire':{const k=ds.x,i=+ds.i;xPool();const c=G.xc[k]&&G.xc[k][i];if(!c||G.execs[k])break;if(G.emps.length<X_MIN){showToast((LANG_EN?`You need at least ${X_MIN} employees to hire an executive.`:`Üst yönetici için en az ${X_MIN} çalışan gerekli.`),'bad');break;}
      const fee=c.salary*2;if(G.cash<fee){showToast((LANG_EN?"Not enough cash for the signing bonus.":'İmza primi için yeterli nakit yok.'),'bad');break;}spend(fee,'other');
      G.execs[k]={...c,hired:G.day,rules:{...EXECS[k].def}};G.xc[k]=[];tl('emp',(LANG_EN?`${c.name} is now ${EXECS[k].n}`:`${c.name} ${EXECS[k].n} oldu`));news((LANG_EN?`${c.name} took office as ${EXECS[k].n} (${EXECS[k].t}).`:`${c.name}, ${EXECS[k].n} (${EXECS[k].t}) olarak göreve başladı.`),'good',true);break;}
    case 'xfire':{const k=ds.x,x=G.execs[k];if(!x)break;const sev=x.salary*3;spend(sev,'other');delete G.execs[k];G.xc[k]=[xCand(k),xCand(k)];news((LANG_EN?`Parted ways with ${x.name} (${money(sev)} severance).`:`${x.name} ile yollar ayrıldı (${money(sev)} tazminat).`),'bad');break;}
    case 'megago':{const m=MEGAD[ds.k];if(!m||megaCan(m))break;const c=m.cost*infl();G.mega.act.push({id:m.id,cost:c,mo:m.mo,m:0,paid:0,s:G.day});megaLog((LANG_EN?`${m.n} started: ${money(c)}, ${m.mo} months.`:`${m.n} başladı: ${money(c)}, ${m.mo} ay.`));tl('star',(LANG_EN?`${m.n} project started`:`${m.n} projesi başladı`));news((LANG_EN?`${G.name} announced a ${money(c)} ${m.n.toLocaleLowerCase(LOC)} project.`:`${G.name}, ${money(c)} değerindeki ${m.n.toLocaleLowerCase(LOC)} projesini duyurdu.`),'good',true);break;}
    case 'megacancel':{const M=G.mega,a=M.act.find(x=>x.id===ds.k);if(!a)break;const back=a.paid*0.3;G.cash+=back;M.act=M.act.filter(x=>x!==a);megaLog((LANG_EN?`${MEGAD[a.id].n} canceled; ${money(back)} recovered.`:`${MEGAD[a.id].n} iptal edildi; ${money(back)} geri alındı.`),'bad');news((LANG_EN?`${MEGAD[a.id].n} project canceled.`:`${MEGAD[a.id].n} projesi iptal edildi.`),'bad');break;}
    case 'xrule':{const x=G.execs[ds.x];if(x&&ds.r in x.rules)x.rules[ds.r]=!x.rules[ds.r];break;}
    case 'survrun':{const c=survCost();if(G.cash<c){showToast((LANG_EN?"Not enough cash for the survey.":'Anket için yeterli nakit yok.'),'bad');break;}if(G.surv&&G.day-G.surv.d<60){showToast((LANG_EN?"60 days must pass since the last survey.":'Son anketin üzerinden 60 gün geçmeli.'),'bad');break;}
      const r=survCalc();if(!r){showToast((LANG_EN?"There are no employees to take the survey.":'Ankete katılacak çalışan yok.'),'bad');break;}spend(c,'other');
      G.surv={d:G.day,r,n:workers().length,prev:G.surv?{d:G.surv.d,r:G.surv.r}:null,press:G.union.press,plan:G.surv?G.surv.plan:null};news((LANG_EN?`Employee survey complete: overall satisfaction ${Math.round(survScore(r))}/100.`:`Çalışan anketi tamamlandı: genel memnuniyet ${Math.round(survScore(r))}/100.`));break;}
    case 'survplan':{if(!G.surv||G.surv.plan||!SURV_D[ds.k])break;G.surv.plan={k:ds.k,base:G.surv.r[ds.k],until:G.day+120};moodAdd((LANG_EN?"Survey results taken seriously":'Anket sonuçları ciddiye alındı'),2,120);news((LANG_EN?`You promised the team improvement in ${SURV_D[ds.k].toLocaleLowerCase(LOC)} within 4 months.`:`Ekibe söz verdin: 4 ay içinde ${SURV_D[ds.k].toLocaleLowerCase(LOC)} konusunda iyileşme olacak.`));break;}
    case 'strikeok':{const U=G.union;if(!U.strike)break;raiseAll(U.strike.raise/100);U.deals=0;news((LANG_EN?`You accepted the union's demand: a ${U.strike.raise}% raise. The strike is over.`:`Sendikanın talebini kabul ettin: %${U.strike.raise} zam. Grev sona erdi.`),'good',true);endStrike(true);break;}
    case 'strikemed':{const U=G.union,st=U.strike;if(!st||G.day<st.med)break;const c=100000*infl();if(G.cash<c){showToast((LANG_EN?"Not enough cash for a mediator.":'Arabulucu için yeterli nakit yok.'),'bad');break;}spend(c,'other');st.med=G.day+30;
      if(Math.random()<0.6){const r=Math.max(1,Math.round(st.raise*0.6));raiseAll(r/100);news((LANG_EN?`The mediator found a middle ground: a ${r}% raise. The strike is over.`:`Arabulucu orta yolu buldu: %${r} zam. Grev sona erdi.`),'good',true);endStrike(true);}else news((LANG_EN?"Mediation failed. You can try again in 30 days.":'Arabuluculuk sonuçsuz kaldı. 30 gün sonra yeniden denenebilir.'),'bad',true);break;}
    case 'updopen':{UI.uf=null;UI.uft=null;openModal('upd',id);break;}
    case 'updstart':{const p=prod(id),kind=ds.k;if(!p||!UPD[kind])break;const why=updBlock(p);if(why){showToast(why,'bad');break;}
      const fa=ftAddFor(p,kind);if(fa.length>(kind==='minor'?1:2)){showToast((LANG_EN?`A ${UPD[kind].n} can add at most ${kind==='minor'?1:2} new features.`:`${UPD[kind].n} ile en fazla ${kind==='minor'?1:2} yeni özellik eklenebilir.`),'bad');break;}
      const pl=updPlan(p,kind,fa);if(pl.err){showToast(pl.err,'bad');break;}
      if(UI.uf&&UI.uf.pid===p.id&&(kind==='minor'||kind==='major')){const mv=Object.keys(UI.uf.f).reduce((s,x)=>s+Math.max(0,UI.uf.f[x]-(UI.uf.b[x]||0)),0),lim=kind==='minor'?1:2;if(mv>lim){showToast((LANG_EN?`A ${UPD[kind].n} can move at most ${lim} focus points.`:`${UPD[kind].n} ile en fazla ${lim} odak puanı kaydırabilirsin.`),'bad');break;}if(mv)pl.d.focus={...UI.uf.f};}
      if(pl.tool>0){if(G.cash<pl.tool){showToast((LANG_EN?`A tooling update requires ${money(pl.tool)}.`:`Kalıp güncellemesi için ${money(pl.tool)} gerekli.`),'bad');break;}spend(pl.tool,'capex');}
      const nv=kind==='minor'?Math.round(((p.ver||1)+0.1)*10)/10:Math.floor(p.ver||1)+1;
      const pr={id:nid(),cat:p.cat,name:kind==='refac'?(LANG_EN?`${p.name} tech debt cleanup`:`${p.name} borç temizliği`):kind==='rewrite'?(LANG_EN?`${p.name} rewrite`:`${p.name} yeniden yazım`):`${p.name} ${kind==='minor'?verStr({ver:nv}):Math.floor(nv)+'.0'}`,d:{...pl.d},req:pl.req,prog:Object.fromEntries(Object.keys(pl.req).map(t=>[t,0])),sk:0,pts:0,start:G.day,upd:{pid:p.id,kind}};
      G.projects.push(pr);assignIdle(pr);closeModal();news((LANG_EN?`${UPD[kind].n} started: ${pr.name}.`:`${UPD[kind].n} başladı: ${pr.name}.`));break;}
    case 'assign':{const pr=G.projects.find(p=>p.id===id);if(pr)assignIdle(pr);break;}
    case 'cancelproj':{const pr=G.projects.find(p=>p.id===id);if(pr){const back=compRefund(pr);G.projects=G.projects.filter(x=>x!==pr);for(const e of G.emps)if(e.proj===pr.id)e.proj=null;news((LANG_EN?`The ${pr.name} project was cancelled.${back?` ${back} components went back to the depot.`:''}`:`${pr.name} projesi iptal edildi.${back?` ${back} bileşen depoya döndü.`:''}`));}break;}
    case 'wantbuy':{const e=G.emps.find(x=>x.id===id);if(e)wantPlace(e);break;}
    case 'ctreg':{UI.ctR=ds.k;UI.ctC=null;break;}
    case 'ctcity':{UI.ctC=ds.k;break;}
    case 'ctcamp':ctCamp(ds.k);break;
    case 'minebuy':case 'futlock':case 'mineroute':rawAct(a,ds.k);break;
    case 'gdgo':case 'gdlater':case 'gdoff':case 'gdon':case 'gdlist':case 'gdclose':gdAct(a,ds.k);if(a==='gdgo')return;break;
    case 'shopsel':case 'sgcell':case 'sgset':case 'shoppp':sgAct(a,ds);break;
    case 'pfbuy':case 'pfsell':case 'pfctrl':pfAct(a,id);break;
    case 'cmplot':case 'cmshop':case 'cmbuild':case 'cmsell':cmAct(a,ds);break;
    case 'mdfound':case 'mdbud':case 'mdpromo':case 'mdsell':mdAct(a,ds);break;
    case 'shopauto':case 'shopass':case 'shoppx':sasAct(a,ds);break;
    case 'bdgive':case 'bdsel':case 'bddrop':bdAct(a,ds);break;
    case 'b2bsell':case 'b2bmacc':case 'b2bsacc':case 'b2bmove':case 'b2bbuy':case 'b2bfacc':case 'b2bracc':case 'b2bcancel':b2bAct(a,ds);break;
    case 'depauto':{const D=depOf();D.auto=!D.auto;break;}
    case 'flacc':case 'flrej':case 'flquit':case 'handson':flAct(a,id);break;
    case 'research':{
      const r=RESD[ds.rid];if(!r||G.res.active)break;
      const cost=resCostOf(r);if(G.cash<cost){showToast((LANG_EN?"Not enough cash for this research.":'Bu araştırma için yeterli nakit yok.'),'bad');break;}
      spend(cost,'other');G.res.active={id:r.id,p:0,rp:resRP(r)};news((LANG_EN?`Research started: ${r.n}.`:`Araştırma başladı: ${r.n}.`));break;}
    case 'office':{
      const nx=OFFICES[G.office+1];if(!nx)break;const cost=nx.cost*infl();
      if(G.cash<cost){showToast((LANG_EN?"Not enough cash to move.":'Taşınmak için yeterli nakit yok.'),'bad');break;}
      spend(cost,'capex');G.office++;tl('office',(LANG_EN?`You moved to ${OFFICES[G.office].n}`:`${OFFICES[G.office].n} binasına taşındın`));G.floors=Math.min(OFFICES[G.office].maxF,Math.max(1,Math.ceil(G.emps.length/OFFICES[G.office].cap)));for(const e of G.emps)e.desk=null;DESKV++;UI.floor=0;if(G.furn.length){for(const f of G.furn)G.furnInv[f.t]=(G.furnInv[f.t]||0)+1;G.furn=[];G.furnVer++;news((LANG_EN?"Furniture moved to storage. Place it in the new office for free with Edit in Company → Office.":'Mobilyalar depoya taşındı. Şirket → Ofis bölümündeki Düzenle ile yeni ofise bedava yerleştirebilirsin.'));}G.meeting=null;for(const e of G.emps)e.morale=Math.min(100,e.morale+8);news((LANG_EN?`We moved to ${nx.n}. Capacity: ${nx.cap} people.`:`${nx.n} binasına taşındık. Kapasite ${nx.cap} kişi.`),'good',true);
      G.cands=[];for(let i=0;i<6;i++)G.cands.push(genCand());break;}
    case 'rack':{const cost=rackCost();if(G.cash<cost){showToast((LANG_EN?"Not enough cash for a rack.":'Raf için yeterli nakit yok.'),'bad');break;}spend(cost,'capex');G.racks++;break;}
    case 'unrack':if(G.racks>0)G.racks--;break;
    case 'camp':{
      const p=prod(id);if(!p)break;const cost=CATS[p.cat].camp*infl()*mdDisc();
      if(G.cash<cost){showToast((LANG_EN?"Not enough cash for the campaign.":'Kampanya için yeterli nakit yok.'),'bad');break;}
      spend(cost,'other');const ac=myActive().filter(q=>q.camp>G.day&&q!==p).length;p.camp=G.day+30;const bg=1.5*Math.min(1,1.6*(1-G.brand/100))/(1+ac*0.25*G.brand/100);G.brand=clamp(G.brand+bg,0,100);news((LANG_EN?`30-day ad campaign started for ${p.name}.${bg>=0.1?` Brand +${fx(bg,1)}.`:''}`:`${p.name} için 30 günlük reklam kampanyası başladı.${bg>=0.1?` Marka +${fx(bg,1)}.`:''}`));break;}
    case 'retire':{const p=prod(id);if(!p)break;
      if(p.cat==='cpu'&&G.products.some(q=>isHW(q)&&q.active&&q.spec.cpu===p.id)){showToast((LANG_EN?"An active product uses this processor. Pull that product from the market first.":'Bu işlemciyi kullanan aktif bir ürün var. Önce o ürünü piyasadan çek.'),'bad');break;}
      p.active=false;news((LANG_EN?`${p.name} pulled from the market.`:`${p.name} piyasadan çekildi.`));break;}
    case 'clear':{const p=prod(id);if(!p||!p.fg)break;const v=p.fg*p.price*0.35;G.cash+=v;G.month.rev+=v;news((LANG_EN?`${p.name} inventory (${num(p.fg)} units) sold to a wholesaler for ${money(v)}.`:`${p.name} stoğu (${num(p.fg)} adet) ${money(v)} karşılığında toptancıya satıldı.`));p.fg=0;p.fgv=0;break;}
    case 'round':{
      const i=ROUNDS.findIndex(r=>r.id===ds.rid),r=ROUNDS[i];
      if(!r||G.rounds[r.id]||(i>0&&!G.rounds[ROUNDS[i-1].id])||valuation()<r.min||(G.pitch&&(G.pitch.lock[r.id]||0)>G.day))break;
      roundExec(i,(r.fixed||valuation()*r.pct)*roundMult());break;}
    case 'loan':{const amt=+ds.amt;if(G.debt+amt>loanLimit()){showToast((LANG_EN?"The bank won't lend that much.":'Banka bu kadar kredi vermiyor.'),'bad');break;}G.debt+=amt;G.cash+=amt;news((LANG_EN?`Took out a ${money(amt)} bank loan. Monthly interest: ${fx(loanRate()*100,2)}%.`:`${money(amt)} banka kredisi çekildi. Aylık faiz %${fx(loanRate()*100,2)}.`));break;}
    case 'repay':{const amt=Math.min(G.debt,ds.amt==='all'?G.debt:+ds.amt);if(G.cash<amt){showToast((LANG_EN?"Not enough cash to repay.":'Geri ödeme için yeterli nakit yok.'),'bad');break;}G.cash-=amt;G.debt-=amt;break;}
    case 'buy':openModal('buy',id);return;
    case 'lifesal':{const i=+ds.i;if(G.life.lockSal>G.day&&i>0)break;G.life.sal=i;news(i?(LANG_EN?`You set your salary at ${money(FSAL[i]*infl())}/mo.`:`Kendine ${money(FSAL[i]*infl())}/ay maaş bağladın.`):(LANG_EN?"You decided not to take a salary.":'Maaş almamaya karar verdin.'));break;}
    case 'lifebuy':{const a=ASSETS[ds.k];if(!a||G.life.own[ds.k]||a.pre&&!G.life.own[a.pre])break;const c=a.cost*infl();if((G.wealth||0)<c){showToast((LANG_EN?"Your personal wealth isn't enough.":'Kişisel servetin yetmiyor.'),'bad');break;}
      G.wealth-=c;G.life.own[ds.k]=true;const mp=G.hist.length?G.hist[G.hist.length-1].profit:0;if(mp<0&&c>1e6&&boardOn()){G.life.conf=clamp(G.life.conf-8,0,100);news((LANG_EN?`You bought ${a.n}. Investors noticed the splurge while the company is losing money.`:`${a.n} aldın. Şirket zarar ederken bu lüks yatırımcıların gözünden kaçmadı.`),'bad',true);}else news((LANG_EN?`You bought ${a.n}. Prestige +${a.pr}.`:`${a.n} aldın. Prestij +${a.pr}.`),'good');break;}
    case 'lifesell':{const a=ASSETS[ds.k];if(!a||!G.life.own[ds.k])break;if(Object.keys(ASSETS).some(k=>ASSETS[k].pre===ds.k&&G.life.own[k])){showToast((LANG_EN?"Sell the higher-tier home first.":'Önce üst seviye evi sat.'),'bad');break;}G.wealth=(G.wealth||0)+a.cost*infl()*0.7;delete G.life.own[ds.k];news((LANG_EN?`${a.n} sold.`:`${a.n} satıldı.`));break;}
    case 'lifeart':{if(+ds.a>0){if((G.wealth||0)<1e6)break;G.wealth-=1e6;G.life.art+=1e6;news((LANG_EN?"You added a $1M piece to your collection.":'Koleksiyonuna $1M değerinde bir eser ekledin.'));}else{G.wealth=(G.wealth||0)+G.life.art;news((LANG_EN?`Art collection sold for ${money(G.life.art)}.`:`Sanat koleksiyonu ${money(G.life.art)} karşılığında satıldı.`));G.life.art=0;}break;}
    case 'lifeangel':{const a=+ds.a;if((G.wealth||0)<a)break;G.wealth-=a;const n=pick([(LANG_EN?"Kuzey AI":'Kuzey AI'),(LANG_EN?"Cinar Robotics":'Çınar Robotik'),(LANG_EN?"Lale Fintech":'Lale Fintek'),(LANG_EN?"Marti Games":'Martı Oyun'),(LANG_EN?"Pera Health":'Pera Sağlık'),(LANG_EN?"Ayaz Energy":'Ayaz Enerji'),(LANG_EN?"Yaprak Agritech":'Yaprak Tarım'),(LANG_EN?"Dalga Mobility":'Dalga Mobilite')]);G.life.angel.push({n,amt:a,until:G.day+rint(365,1095)});news((LANG_EN?`You made a ${money(a)} angel investment in ${n}.`:`${n} girişimine ${money(a)} melek yatırım yaptın.`));break;}
    case 'lifegive':{const a=+ds.a;if((G.wealth||0)<a)break;G.wealth-=a;const k=Math.log10(a/1e4);G.brand=clamp(G.brand+k*0.7,0,100);G.life.conf=clamp(G.life.conf+k*3,0,100);news((LANG_EN?`You donated ${money(a)} to your foundation. The public and investors welcomed it.`:`Vakfına ${money(a)} bağışladın. Kamuoyu ve yatırımcılar olumlu karşıladı.`),'good',true);break;}
    case 'acqkeep':{const a=(G.acqs||[]).find(x=>x.id===+ds.a);if(!a)break;const k=a.keys.find(x=>x.id===id);if(!k)break;if(G.emps.length>=officeCap()){showToast((LANG_EN?"The office is full.":'Ofis dolu.'),'bad');break;}
      const b=ds.b==='1';if(b){const bonus=k.salary*3;if(G.cash<bonus){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');break;}spend(bonus,'other');k.morale=Math.min(100,k.morale+15);if(!hasT(k,'loyal')&&Math.random()<0.5)k.tr=[...(k.tr||[]),'loyal'];}
      a.keys=a.keys.filter(x=>x!==k);k.hiredAt=G.day;k.acqFrom={id:a.id,name:a.name,c:a.culture,until:G.day+180,bonus:b};G.emps.push(k);G.careerVer=(G.careerVer||0)+1;
      news((LANG_EN?`${k.name} (formerly of ${a.name}) joined your team${b?" (with a retention bonus)":''}.`:`${k.name} (eski ${a.name}) ekibine katıldı${b?' (tutma primiyle)':''}.`),'good');break;}
    case 'acqdrop':{const a=(G.acqs||[]).find(x=>x.id===+ds.a);if(!a)break;a.keys=a.keys.filter(x=>x.id!==id);break;}
    case 'acqcut':{const a=(G.acqs||[]).find(x=>x.id===+ds.a);if(!a||a.mode!==null)break;const sev=acqSev(a);if(G.cash<sev){showToast((LANG_EN?"Not enough cash for severance.":'Tazminat için yeterli nakit yok.'),'bad');break;}
      spend(sev,'other');G.layoff+=Math.min(25,a.rem/40);G.brand=clamp(G.brand-Math.min(4,a.rem/300),0,100);news((LANG_EN?`${num(a.rem)} former ${a.name} employees were laid off (${money(sev)} severance). Your team is uneasy.`:`${a.name} çalışanlarından ${num(a.rem)} kişi işten çıkarıldı (${money(sev)} tazminat). Ekibin tedirgin.`),'bad',true);a.rem=0;a.mode='cut';break;}
    case 'acqdiv':{const a=(G.acqs||[]).find(x=>x.id===+ds.a);if(!a||a.mode!==null)break;a.mode='div';a.div=a.rem;a.rem=0;news((LANG_EN?`${a.name} continues as a separate division (${num(a.div)} people). They'll keep the acquired products up to date.`:`${a.name} ayrı bir bölüm olarak çalışmaya devam ediyor (${num(a.div)} kişi). Devralınan ürünleri güncel tutacaklar.`),'good',true);break;}
    case 'acqdivend':{const a=(G.acqs||[]).find(x=>x.id===+ds.a);if(!a||a.mode!=='div')break;const sev=a.div*6000*infl();spend(sev,'other');G.layoff+=Math.min(25,a.div/40);news((LANG_EN?`${a.name} division closed; ${money(sev)} in severance paid to ${num(a.div)} people.`:`${a.name} bölümü kapatıldı, ${num(a.div)} kişiye ${money(sev)} tazminat ödendi.`),'bad',true);a.div=0;a.mode='cut';break;}
    case 'trainsend':{const tr=UI.tr||{};const avail=G.emps.filter(e=>!e.leave&&!(e.train&&e.train.until>G.day)&&!e.intern);const e=G.emps.find(x=>x.id===+tr.eid)||avail[0];if(e&&avail.includes(e))sendTrain(e,tr.k||'cert');UI.tr={eid:'',k:tr.k||'cert'};break;}
    case 'unisign':{const u=UNID[ds.u];if(!u||G.unis[u.id])break;if(u.minBrand&&G.brand<u.minBrand)break;const cost=u.cost*infl();if(G.cash<cost){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');break;}
      spend(cost,'other');G.unis[u.id]={since:G.day};news((LANG_EN?`Internship partnership set up with ${u.n}. They'll send intern candidates in February and June.`:`${u.n} ile staj ortaklığı kuruldu. Şubat ve Haziran'da stajyer adayları gönderecekler.`),'good',true);break;}
    case 'uniend':if(G.unis[ds.u]){delete G.unis[ds.u];news((LANG_EN?`${UNID[ds.u].n} partnership ended.`:`${UNID[ds.u].n} ortaklığı sona erdi.`));}break;
    case 'internpick':{const c=(G.internCands||[]).find(x=>x.id===id);if(!c)break;if(G.emps.length>=officeCap()){showToast((LANG_EN?"The office is full.":'Ofis dolu.'),'bad');break;}
      G.internCands=G.internCands.filter(x=>x!==c);c.intern={uni:c.internC.uni,pot:c.internC.pot,until:G.day+90};delete c.internC;c.hiredAt=G.day;G.emps.push(c);news((LANG_EN?`${c.name} started as an intern (${ROLES[c.role].n}, ${c.intern.uni}).`:`${c.name} stajyer olarak başladı (${ROLES[c.role].n}, ${c.intern.uni}).`));break;}
    case 'internhire':{const e=G.emps.find(x=>x.id===id);if(!e||!e.intern)break;const lv=levelFor(e.skill);e.level=lv;e.salary=Math.round(salaryFor(e.skill)*(1+0.12*lv)/100)*100;
      delete e.intern;e.morale=Math.min(100,e.morale+10);if(!hasT(e,'loyal')&&Math.random()<0.35){e.tr=[...(e.tr||[]),'loyal'];}G.careerVer=(G.careerVer||0)+1;news((LANG_EN?`${e.name} hired full-time (${money(e.salary)}/mo). Grateful to the company.`:`${e.name} kadroya alındı (${money(e.salary)}/ay). Şirkete minnettar.`),'good',true);break;}
    case 'cytool':{const k=ds.k;if(!CY_TOOLS[k])break;G.cyber[k]=!G.cyber[k];news(`${CY_TOOLS[k].n} ${G.cyber[k]?(LANG_EN?"launched":'başlatıldı'):(LANG_EN?"shut down":'kapatıldı')}.`);break;}
    case 'pentest':{const cost=80000*infl()*(1+G.emps.length/40);if(G.cyber.pentest>G.day||G.cash<cost)break;spend(cost,'other');G.cyber.pentest=G.day+180;
      const n=rint(2,7);news((LANG_EN?`Penetration test complete: ${n} vulnerabilities found and fixed. Your security level is +12 for 6 months.`:`Sızma testi tamamlandı: ${n} güvenlik açığı bulundu ve kapatıldı. Güvenlik seviyen 6 ay boyunca +12.`),'good',true);cyLog((LANG_EN?`Penetration test: ${n} vulnerabilities fixed`:`Sızma testi: ${n} açık kapatıldı`),true);break;}
    case 'incapply':{const k=ds.k,x=INC[k];if(!x||G.gov.inc[k]||!x.req())break;G.gov.inc[k]={st:'pend',due:G.day+90};news((LANG_EN?`Applied for ${x.n}. Decision within 90 days.`:`${x.n} için başvuru yapıldı. Karar 90 gün içinde.`));break;}
    case 'banlic':{if(!banOn()||G.gov.banLic)break;const cost=250000*infl();if(G.cash<cost){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');break;}spend(cost,'other');G.gov.banLic={due:G.day+60,ok:false};news((LANG_EN?"Applied for an export license. Decision within 60 days.":'İhracat lisansı başvurusu yapıldı. Karar 60 gün içinde.'));break;}
    case 'patfile':{const r=RESD[ds.rid];if(!r||!PAT_CAT[r.id]||G.patFiled[r.id]||!has(r.id)||G.dev.oss.some(o=>o.rid===r.id)){if(r&&G.dev.oss.some(o=>o.rid===r.id))showToast((LANG_EN?"You can't patent technology you've open-sourced.":'Açık kaynak yaptığın teknolojinin patentini alamazsın.'),'bad');break;}const cost=patFee();if(G.cash<cost){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');break;}
      spend(cost,'other');filePatent(r.id,r.n,PAT_CAT[r.id],patResW(r));news((LANG_EN?`Patent application filed: ${r.n}. Decision in 4-8 months.`:`Patent başvurusu yapıldı: ${r.n}. Karar 4-8 ay içinde.`));break;}
    case 'suenew':{const c=comp(ds.id)||liveComps().slice().sort((a,b)=>b.emp-a.emp)[0];if(!c)break;UI.sue={cid:c.id,cat:null,firm:'std'};if(ds.id){UI.tab='res';(UI.sub=UI.sub||{}).res='patent';UI.rival=null;window.scrollTo({top:0});}break;}
    case 'sueclose':UI.sue=null;break;
    case 'teamview':PREF.teamView=ds.v==='table'?'table':'cards';prefSave();break;
    case 'prodview':PREF.prodView=ds.v==='table'?'table':'cards';prefSave();break;
    case 'suego':{const su=UI.sue,c=su&&comp(su.cid);if(!c||!su.cat||myPat(su.cat)<=0||crossWith(c.id)||G.cases.some(k=>k.cid===c.id))break;
      openCase(c.id,su.cat,'pl',su.firm);news((LANG_EN?`You filed a ${CATS[su.cat].n.toLocaleLowerCase(LOC)} patent lawsuit against ${c.name} (${LAW[su.firm].n}).`:`${c.name} aleyhine ${CATS[su.cat].n.toLocaleLowerCase(LOC)} patent davası açtın (${LAW[su.firm].n}).`),'mkt',true);UI.sue=null;break;}
    case 'casedrop':{const k=G.cases.find(x=>x.id===id);if(!k)break;G.cases=G.cases.filter(x=>x!==k);const c=comp(k.cid);if(c)c.rel=clamp(relOf(c)+5,-100,100);news((LANG_EN?"Patent lawsuit withdrawn.":'Patent davası geri çekildi.'));break;}
    case 'casesettle':{const k=G.cases.find(x=>x.id===id);if(!k)break;const amt=k.claim*0.5;spend(amt,'other');const c=comp(k.cid);if(c){c.cash+=amt;c.rel=clamp(relOf(c)+5,-100,100);}G.cases=G.cases.filter(x=>x!==k);news((LANG_EN?`Patent lawsuit settled (${money(amt)}).`:`Patent davasında uzlaşıldı (${money(amt)}).`));break;}
    case 'lpopen':UI.lp=id;UI.lpd={t:'stage',mo:-1};break;
    case 'lpclose':UI.lp=null;break;
    case 'lpbook':{const pr=G.projects.find(p=>p.id===id);if(!pr||pr.ev||!UI.lpd)break;const T=LTIER[UI.lpd.t],cost=T.cost*infl();
      if(G.cash<cost){showToast((LANG_EN?"Not enough cash for the event.":'Etkinlik için yeterli nakit yok.'),'bad');break;}
      const o=lpOptions(pr.cat).find(x=>x.v===UI.lpd.mo)||{day:null};spend(cost,'other');pr.ev={t:UI.lpd.t,day:o.day,cost};UI.lp=null;
      news((LANG_EN?`${T.n.toLocaleLowerCase(LOC)} scheduled for ${pr.name}${o.day!=null?': '+fmtDate(o.day):" (when the project ends)"}.`:`${pr.name} için ${T.n.toLocaleLowerCase(LOC)} ayarlandı${o.day!=null?': '+fmtDate(o.day):' (proje bitince)'}.`));break;}
    case 'lpcancel':{const pr=G.projects.find(p=>p.id===id);if(!pr||!pr.ev)break;const back=pr.ev.cost*0.5;G.cash+=back;news((LANG_EN?`${pr.name} launch event canceled, ${money(back)} refunded.`:`${pr.name} lansman etkinliği iptal edildi, ${money(back)} geri alındı.`));pr.ev=null;break;}
    case 'branch':if(brOf(ds.r)){UI.branch=ds.r;UI.rival=null;UI.edit=false;UI.placing=null;RV.key='';UI.tab='office';window.scrollTo({top:0});}break;
    case 'bropen':{const r=ds.r;if(!BR[r]||brOf(r)||!G.regions[r].in)break;const cost=brOpenCost(r);if(G.cash<cost){showToast((LANG_EN?"Not enough cash to open a branch.":'Şube açmak için yeterli nakit yok.'),'bad');break;}
      tl('globe',(LANG_EN?`${BR[r].city} branch opened`:`${BR[r].city} şubesi açıldı`));spend(cost,'capex');G.branches[r]={lvl:1,staff:{eng:0,mkt:2,sup:1},open:G.day};G.regions[r].aw=clamp(G.regions[r].aw+0.05,0,1);
      news((LANG_EN?`${BR[r].city} branch opened! It starts with 2 salespeople and 1 support specialist. See it in Company → Office.`:`${BR[r].city} şubesi açıldı! 2 satışçı ve 1 destek uzmanıyla başlıyor. Şirket → Ofis bölümünden şubeyi görebilirsin.`),'good',true);UI.branch=r;UI.rival=null;RV.key='';UI.tab='office';window.scrollTo({top:0});break;}
    case 'brhire':{const r=ds.r,b=brOf(r),k=ds.k;if(!b||!BR_ROLE[k])break;if(brStaff(b)>=BR_LVL[b.lvl].cap){showToast((LANG_EN?"The branch is full. Upgrade it to the next level.":'Şube dolu. Bir üst seviyeye büyüt.'),'bad');break;}
      const fee=brSal(r)*0.5;if(G.cash<fee){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');break;}spend(fee,'other');b.staff[k]++;break;}
    case 'brfire':{const r=ds.r,b=brOf(r),k=ds.k;if(!b||!b.staff[k])break;spend(brSal(r),'other');b.staff[k]--;break;}
    case 'brup':{const r=ds.r,b=brOf(r);if(!b||b.lvl>=3)break;const cost=brUpCost(r,b);if(G.cash<cost){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');break;}
      spend(cost,'capex');b.lvl++;news((LANG_EN?`${BR[r].city} branch expanded: ${BR_LVL[b.lvl].n} (${BR_LVL[b.lvl].cap} people).`:`${BR[r].city} şubesi büyüdü: ${BR_LVL[b.lvl].n} (${BR_LVL[b.lvl].cap} kişi).`),'good',true);break;}
    case 'brclose':closeBranch(ds.r);break;
    case 'dealnew':case 'dealwith':{const c=comp(ds.id)||liveComps().slice().sort((a,b)=>{const ea=Object.values(dealElig(a)).some(x=>!x),eb=Object.values(dealElig(b)).some(x=>!x);return eb-ea||b.emp-a.emp;})[0];if(!c)break;
      const el=dealElig(c),t=Object.keys(el).find(x=>!el[x])||'cpuSell';UI.dd=!el[t]?dealDefaults(c,t):{cid:c.id,type:t,months:12};if(a==='dealwith'){UI.tab='market';(UI.sub=UI.sub||{}).market='ortak';UI.rival=null;}break;}
    case 'ddclose':UI.dd=null;break;
    case 'dealprop':if(UI.dd&&!dealElig(comp(UI.dd.cid))[UI.dd.type])proposeDeal(UI.dd);break;
    case 'offerok':{const o=(G.offers||[]).find(x=>x.id===id);if(!o)break;G.offers=G.offers.filter(x=>x!==o);const c=comp(o.cid);
      if(!c||c.dead||dealElig(c)[o.type]){showToast((LANG_EN?"This offer is no longer valid.":'Bu teklif artık geçerli değil.'),'bad');break;}const {exp,inc,counter,id:_i,...d}=o;startDeal(d);break;}
    case 'offerno':{const o=(G.offers||[]).find(x=>x.id===id);if(!o)break;G.offers=G.offers.filter(x=>x!==o);const c=comp(o.cid);if(c)c.rel=clamp(relOf(c)-3,-100,100);break;}
    case 'dealend':{const d=(G.deals||[]).find(x=>x.id===id);if(!d)break;const c=comp(d.cid),left=Math.max(0,(d.end-G.day)/30);
      const pen=Math.abs(dealMonthly(d))*left*(d.type==='cpuBuy'?0.15:0.1);spend(pen,'other');if(c){c.cash+=pen;c.rel=clamp(relOf(c)-25,-100,100);}
      endDeal(d,(LANG_EN?`You terminated the deal with ${c?c.name:"Partner"}. Termination fee: ${money(pen)}; relations soured.`:`${c?c.name:'Ortak'} ile anlaşmayı feshettin. Fesih bedeli ${money(pen)}; ilişkiler bozuldu.`),'bad');break;}
    case 'rival':UI.branch=null;UI.rival=ds.id||null;UI.edit=false;UI.placing=null;RV.key='';UI.tab='office';window.scrollTo({top:0});break;
    case 'headhunt':{const c=comp(ds.id);if(!c||c.dead)break;const cost=hhCost(c);
      if(G.day<(c.hhAt||-999)+120)break;if(G.cash<cost){showToast((LANG_EN?"Not enough cash for a headhunter.":'Headhunter için yeterli nakit yok.'),'bad');break;}
      spend(cost,'other');c.hhAt=G.day;
      const role=rivalRole(c,Math.random());const pool=['soft','design','hw','res','mkt','sup','ops'];
      const cd=genCand();const sk=clamp(Math.round((4.2+(c.tech-1)*10+c.brand/30+rnd(0,2.5))*10)/10,3,9.6),lv=levelFor(sk);
      Object.assign(cd,{role:pool.includes(role)?role:'soft',skill:sk,level:lv,xp:XP_REQ[lv]+rint(20,80),salary:Math.round(salaryFor(sk)*(1+0.12*lv)*1.25/100)*100,hh:c.name,hhUntil:G.day+30});
      if(Math.random()<0.15){showToast((LANG_EN?"The headhunter couldn't persuade anyone.":'Headhunter kimseyi ikna edemedi.'),'bad');news((LANG_EN?`The headhunter couldn't persuade any ${c.name} employees. The fee is non-refundable.`:`Headhunter ${c.name} çalışanlarını ikna edemedi. Ücret geri alınamıyor.`),'bad');break;}
      G.cands.unshift(cd);c.emp=Math.max(5,c.emp-1);
      news((LANG_EN?`The headhunter met with ${cd.name} (${ROLES[cd.role].n}, skill ${fx(sk,1)}) from ${c.name}. They'll wait on your candidate list for 30 days.`:`Headhunter ${c.name} şirketinden ${cd.name} (${ROLES[cd.role].n}, yetenek ${fx(sk,1)}) ile görüştü. Aday listende 30 gün bekleyecek.`),'good',true);
      if(c.aggr>0.6&&Math.random()<0.35){c.aggr=Math.min(0.95,c.aggr+0.05);G.rivalCool=Math.min(G.rivalCool||0,G.day+10);news((LANG_EN?`${c.name} noticed the poaching. They'll be more aggressive toward you.`:`${c.name} yetenek avını fark etti. Sana karşı daha saldırgan olacaklar.`),'bad',true);}
      break;}
    case 'regin':{const r=ds.r,R=REGS[r],st=G.regions[r];if(!R||st.in)break;
      if(R.minBrand&&G.brand<R.minBrand){showToast((LANG_EN?`${R.n} requires a brand strength of at least ${R.minBrand}.`:`${R.n} için marka en az ${R.minBrand} olmalı.`),'bad');break;}
      const cost=R.entry*infl();if(G.cash<cost){showToast((LANG_EN?"Not enough cash to enter the market.":'Pazara girmek için yeterli nakit yok.'),'bad');break;}
      spend(cost,'capex');st.in=true;tl('globe',(LANG_EN?`You entered the ${R.n} market`:`${R.n} pazarına girdin`));st.aw=Math.max(st.aw,0.15)+(G.life&&G.life.own.jet?0.05:0);news((LANG_EN?`You entered the ${R.n} market! Distributors and a local team are ready. Monthly operating cost: ${money(R.month*infl())}.`:`${R.n} pazarına girdin! Distribütörler ve yerel ekip hazır. Aylık işletme gideri ${money(R.month*infl())}.`),'good',true);break;}
    case 'regout':{const r=ds.r,st=G.regions[r];if(!st||!st.in||REGS[r].home)break;if(brOf(r))closeBranch(r,(LANG_EN?"withdrew from the region":'bölgeden çekildin'));st.in=false;st.aw*=0.6;G.brand=clamp(G.brand-1,0,100);news((LANG_EN?`You withdrew from the ${REGS[r].n} market.`:`${REGS[r].n} pazarından çekildin.`),'bad');break;}
    case 'regcamp':{const r=ds.r,st=G.regions[r];if(!st||!st.in||G.day-st.camp<30)break;const cost=regCampCost(r);
      if(G.cash<cost){showToast((LANG_EN?"Not enough cash for the campaign.":'Kampanya için yeterli nakit yok.'),'bad');break;}
      spend(cost,'other');st.camp=G.day;st.aw=clamp(st.aw+0.15,0,1);news((LANG_EN?`Ad campaign started in ${REGS[r].n}. Awareness: ${Math.round(st.aw*100)}.`:`${REGS[r].n} bölgesinde reklam kampanyası başladı. Bilinirlik ${Math.round(st.aw*100)}.`));break;}
    case 'buyok':{
      const c=comp(id);if(!c||c.dead)break;const price=compVal(c)*1.2;
      {const w=acqBlock(c);if(w){showToast(acqBlockTxt(c,w),'bad');break;}}
      if(G.cash<price){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');break;}
      spend(price,'capex');if(G.hto&&G.hto.mine&&G.hto.mine.cid===c.id){G.cash+=G.hto.mine.paid;G.hto.mine=null;}acqComp(c,price,true);break;}
    case 'evpick':{const P=G.pending,ev=EVD[P&&P.id];if(P&&P.ib&&G.inbox)G.inbox=G.inbox.filter(x=>x.key!==P.ib);if(ev){ev.pick(P.d,+ds.i);}if(G.pending===P)G.pending=null;G.speed=G.prevSpeed||1;closeModal();break;}
    case 'evlater':{if(G.pending&&G.pending.ib){G.pending=null;G.speed=G.prevSpeed||0;closeModal();openModal('inbox');}return;}
    case 'ibopen':{closeModal();ibOpen(+ds.k);return;}
    case 'ibbox':{openModal('inbox');return;}
    case 'feed':{const T=tkState();UI.feedU=T.unread;T.unread=0;openModal('feed');{const tr=$('#tkrow');if(tr)patch(tr,vTk());}return;}
    case 'runmonth':{if(G.over)break;UI.apRun=null;UI.apWhy=null;if(G.runTo!=null){G.runTo=null;G.speed=G.prevSpeed||1;break;}const dt=dateOf(G.day);G.runTo=dayOfDate(new Date(dt.getFullYear(),dt.getMonth()+1,1));G.speed=3;break;}
    case 'decide':{PREF.decide=ibOn()?'all':'urgent';prefSave();if(UI.modal&&UI.modal.kind==='inbox')renderModal();break;}
    case 'nmassign':{for(const pr of G.projects)assignIdle(pr);news((LANG_EN?"Idle employees assigned to projects.":'Boştaki çalışanlar projelere atandı.'));break;}
    case 'nmpromo':{let n=0;for(const e of G.emps.slice())if(e.readySince!=null&&canPromote(e).ok){promote(e);n++;}if(n)news((LANG_EN?`${n} employees promoted.`:`${n} çalışan terfi etti.`),'good');break;}
    case 'nmrest':{let n=0;for(const e of G.emps)if(!e.leave&&!e.founder&&e.energy<30){e.leave={type:'vac',until:G.day+7};e.morale=Math.min(100,e.morale+5);n++;}if(n)news((LANG_EN?`${n} tired employees went on 7-day leave.`:`${n} yorgun çalışan 7 günlük izne çıktı.`));break;}
    /* supply & factories */
    case 'sup':{const s=SUPD[ds.sid];if(s){if(s.own&&!plantReady(s.cat)){showToast((LANG_EN?"Your facility isn't ready yet.":'Tesisin henüz hazır değil.'),'bad');break;}G.sup[s.cat]=s.id;news((LANG_EN?`New ${CCATS[s.cat].n} supplier: ${s.n}.`:`${CCATS[s.cat].n} tedarikçisi artık ${s.n}.`));}break;}
    case 'plantbuild':{const c=ds.c,P=PLANTS[c];if(!P||plantOf(c))break;if(P.req&&!has(P.req)){showToast((LANG_EN?"Complete the required research first.":'Önce gerekli araştırmayı tamamla.'),'bad');break;}const cost=P.cost*infl();
      if(G.cash<cost){showToast((LANG_EN?"Not enough cash for the facility.":'Tesis için yeterli nakit yok.'),'bad');break;}spend(cost,'capex');G.plants[c]={lvl:1,ready:G.day+120,sell:false,up:0};news((LANG_EN?`Construction of ${P.n} started: ${money(cost)}, taking 120 days.`:`${P.n} inşaatı başladı: ${money(cost)}, 120 gün sürecek.`));break;}
    case 'plantup':{const c=ds.c,p=plantOf(c);if(!p||p.lvl>=3||!plantReady(c)||p.up>G.day)break;const cost=PLANTS[c].cost*0.6*p.lvl*infl();if(G.cash<cost){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');break;}
      spend(cost,'capex');p.lvl++;p.up=G.day+60;news((LANG_EN?`${PLANTS[c].n} is expanding: new lines come online within 60 days.`:`${PLANTS[c].n} büyütülüyor: yeni hatlar 60 gün içinde devreye girecek.`));break;}
    case 'plantsell':{const p=plantOf(ds.c);if(p)p.sell=!p.sell;break;}
    case 'plantclose':{const c=ds.c;if(!plantOf(c))break;delete G.plants[c];if(G.sup[c]==='own_'+c)G.sup[c]=SUPPLIERS.find(s=>s.cat===c).id;news((LANG_EN?`${PLANTS[c].n} closed. Supply is back to outside suppliers.`:`${PLANTS[c].n} kapatıldı. Tedarik yeniden dış tedarikçiye döndü.`),'bad');break;}
    case 'dcbuild':{const r=ds.r;if(!REGS[r]||(G.dcs||[]).some(d=>d.region===r))break;if(!G.regions[r].in){showToast((LANG_EN?"Enter that region first.":'Önce o bölgeye gir.'),'bad');break;}const cost=dcBuildCost(r);
      if(G.cash<cost){showToast((LANG_EN?"Not enough cash for a data center.":'Veri merkezi için yeterli nakit yok.'),'bad');break;}spend(cost,'capex');G.dcs.push({id:nid(),region:r,lvl:1,ready:G.day+150,racks:0,green:false,rent:0,down:0});news((LANG_EN?`Construction of the ${REGS[r].n} data center started: ${money(cost)}, taking 150 days.`:`${REGS[r].n} veri merkezi inşaatı başladı: ${money(cost)}, 150 gün sürecek.`));break;}
    case 'dcup':{const d=(G.dcs||[]).find(x=>x.id===+ds.id);if(!d||d.lvl>=3||G.day<d.ready)break;const cost=dcBuildCost(d.region,d.lvl+1);if(G.cash<cost){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');break;}
      spend(cost,'capex');d.lvl++;news((LANG_EN?`${REGS[d.region].n} data center upgraded: ${DC_LVL[d.lvl].n}, ${DC_LVL[d.lvl].max} racks.`:`${REGS[d.region].n} veri merkezi büyütüldü: ${DC_LVL[d.lvl].n}, ${DC_LVL[d.lvl].max} raf.`));break;}
    case 'dcrack':{const d=(G.dcs||[]).find(x=>x.id===+ds.id);if(!d||G.day<d.ready)break;const n=Math.min(+ds.n||10,DC_LVL[d.lvl].max-d.racks);if(n<=0)break;const cost=n*dcRackCost();
      if(G.cash<cost){showToast((LANG_EN?"Not enough cash for racks.":'Raflar için yeterli nakit yok.'),'bad');break;}spend(cost,'capex');d.racks+=n;break;}
    case 'dcunrack':{const d=(G.dcs||[]).find(x=>x.id===+ds.id);if(d)d.racks=Math.max(0,d.racks-10);break;}
    case 'dcmove':{const d=(G.dcs||[]).find(x=>x.id===+ds.id);if(!d||G.day<d.ready)break;const n=Math.min(G.racks,DC_LVL[d.lvl].max-d.racks);if(n<=0)break;G.racks-=n;d.racks+=n;news((LANG_EN?`${n} server racks moved from the office to the ${REGS[d.region].n} data center.`:`${n} sunucu rafı ofisten ${REGS[d.region].n} veri merkezine taşındı.`));break;}
    case 'dcgreen':{const d=(G.dcs||[]).find(x=>x.id===+ds.id);if(!d||d.green)break;const cost=dcGreenCost(d);if(G.cash<cost){showToast((LANG_EN?"Not enough cash.":'Yeterli nakit yok.'),'bad');break;}
      spend(cost,'capex');d.green=true;G.brand=clamp(G.brand+2,0,100);news((LANG_EN?`The ${REGS[d.region].n} data center now runs on renewable energy. Energy costs fell and your brand got stronger.`:`${REGS[d.region].n} veri merkezi artık yenilenebilir enerjiyle çalışıyor. Enerji gideri düştü, markan güçlendi.`),'good');break;}
    case 'dcrent':{const d=(G.dcs||[]).find(x=>x.id===+ds.id);if(d)d.rent=clamp(+ds.v||0,0,1);break;}
    case 'dcpm':{G.dcPm=+ds.v||1;break;}
    case 'order':{const k=ds.k;const u=(G.use&&G.use[k])||0;const q=Math.ceil(u>0?u*30:(k.startsWith('wafer')?40:2000));if(placeOrder(k,q,true))showToast((LANG_EN?`Ordered ${num(q)} units of ${keyInfo(k).n}.`:`${num(q)} adet ${keyInfo(k).n} sipariş edildi.`),'good');break;}
    case 'autoorder':G.autoOrder=!G.autoOrder;break;
    case 'build':{
      const t=UI.fdraft.type,r=UI.fdraft.region,ft=FTYPES[t];
      if(ft.req&&!has(ft.req)){showToast((LANG_EN?`Research first: ${RESD[ft.req].n}`:`Önce araştır: ${RESD[ft.req].n}`),'bad');break;}
      const cost=facBuildCost(t,r);if(G.cash<cost){showToast((LANG_EN?"Not enough cash for a factory. Consider taking a loan.":'Fabrika için yeterli nakit yok. Kredi çekmeyi düşün.'),'bad');break;}
      spend(cost,'capex');
      const n=G.factories.filter(f=>f.type===t&&f.region===r).length+1;
      const ni=Math.max(...NODES.map((x,i)=>has(x.r)?i:0));
      G.factories.push({id:'f'+nid(),type:t,region:r,lines:1,auto:0,node:ni,ready:G.day+Math.round(ft.build*(1-Math.min(0.3,empSkill('ops')*0.01))*(ceoSk('o4')?0.75:1)),busy:0,cost,name:`${FREG[r].n} ${ft.short} ${n}`});
      tl('factory',(LANG_EN?`Building a ${ft.n.toLocaleLowerCase(LOC)} in ${FREG[r].n}`:`${FREG[r].n}'de ${ft.n.toLocaleLowerCase(LOC)} kuruluyor`));news((LANG_EN?`Construction of a ${ft.n.toLocaleLowerCase(LOC)} began in ${FREG[r].n} (${money(cost)}).`:`${FREG[r].n}'de ${ft.n.toLocaleLowerCase(LOC)} inşaatı başladı (${money(cost)}).`),'good',true);break;}
    case 'line':{const f=fac(id);if(!f)break;fgAddLine(f);break;}
    case 'fgcell':case 'fgset':case 'fgdel':fgAct(a,ds);break;
    case 'auto':{const f=fac(id);if(!f||f.auto>=3)break;if(f.auto>=1&&!has('robot')){showToast((LANG_EN?"Research first: Robotic Automation":'Önce araştır: Robotik Otomasyon'),'bad');break;}
      const cost=FTYPES[f.type].auto[f.auto+1]*infl();if(G.cash<cost){showToast((LANG_EN?"Not enough cash for automation.":'Otomasyon için yeterli nakit yok.'),'bad');break;}spend(cost,'capex');f.auto++;f.cost+=cost;news((LANG_EN?`${f.name} automation level is now ${f.auto}.`:`${f.name} otomasyon seviyesi ${f.auto} oldu.`));break;}
    case 'retool':{const f=fac(id);if(!f)break;const ni=Math.max(...NODES.map((x,i)=>has(x.r)?i:0));if(ni<=f.node)break;
      const cost=FTYPES.fab.cost*0.35*infl();if(G.cash<cost){showToast((LANG_EN?"Not enough cash for the process upgrade.":'Süreç yükseltmesi için yeterli nakit yok.'),'bad');break;}
      spend(cost,'capex');f.node=ni;f.busy=G.day+60;f.cost+=cost;news((LANG_EN?`${f.name} is moving to the ${NODES[ni].id}nm process: production stops for 60 days.`:`${f.name} ${NODES[ni].id}nm sürece geçiyor: 60 gün üretim duracak.`),'bad',true);break;}
    case 'sellfac':openModal('sellfac',id);return;
    case 'sellfacok':{const f=fac(id);if(!f)break;const v=f.cost*0.35;G.cash+=v;G.factories=G.factories.filter(x=>x!==f);
      for(const p of G.products)if(isHW(p)&&p.plan.site===f.id)p.plan.site=p.cat==='cpu'?'foundry':'fason';
      news((LANG_EN?`${f.name} sold for ${money(v)}.`:`${f.name} ${money(v)} karşılığında satıldı.`));closeModal();break;}
    case 'newgame':openModal('scenario');return;
    case 'scnstart':{if(String(ds.s).startsWith('u_')&&!SCN[ds.s]){const d=myScns().find(x=>'u_'+x.id===ds.s);if(!d)break;scnFromDef(d);}UI.sed=null;UI.sedCode=null;newGame(ds.s);if((['free','garage','crisis'].includes(ds.s)||String(ds.s).startsWith('u_'))&&G.equity>=0.999)UI.cofAsk=true;applyDiff(curDiff());G.tut={on:UI.tutPref!==false&&(ds.s==='free'||ds.s==='garage'),step:0,seen:{}};market();closeModal();save();if(UI.cofAsk){UI.cofAsk=false;UI.cofC=cofCands();openModal('cofpick');return;}break;}
    case 'diffset':UI.diffK=ds.k;if(ds.k==='custom'&&!UI.diffC)UI.diffC={...DIFFS.normal};renderModal();return;
    case 'diffopt':{UI.diffC=UI.diffC||{...DIFFS.normal};UI.diffC[ds.p]=DIFF_OPTS[ds.p].o[+ds.i][0];renderModal();return;}
    case 'tutpref':UI.tutPref=UI.tutPref===false;renderModal();return;
    case 'tutoff':if(G.tut)G.tut.on=false;break;
    case 'tutskip':if(G.tut){G.tut.step++;if(G.tut.step>=TUT.length)G.tut.on=false;}break;
    case 'tuton':G.tut={on:true,step:0,seen:{}};break;
    case 'slotsave':slotSave(+ds.i);break;
    case 'slotload':openModal('slotload',+ds.i);return;
    case 'slotloadok':slotLoad(+ds.id);return;
    case 'slotdel':try{localStorage.removeItem(SLOT_KEY(+ds.i));localStorage.removeItem(SLOT_META(+ds.i));}catch(e){}break;
    case 'exportsave':openModal('export');return;
    case 'importsave':openModal('import');return;
    case 'importok':{const t=document.getElementById('impText');const g=decSave(t&&t.value);if(!g){showToast((LANG_EN?"Couldn't read the save text.":'Kayıt metni okunamadı.'),'bad');return;}loadGameObj(g);showToast((LANG_EN?"Save imported.":'Kayıt içe aktarıldı.'));return;}
    case 'savefile':{if(!DL)return;DL.save({filename:(LANG_EN?`silicon-garage-${G.name.replace(/[^\w\-]+/g,'-')}-${G.day}.json`:`silikon-garaj-${G.name.replace(/[^\w\-]+/g,'-')}-${G.day}.json`),data:JSON.stringify(G)}).then(()=>showToast((LANG_EN?"Save file ready.":'Kayıt dosyası hazırlandı.'))).catch(e=>{if(e&&e.code!=='declined')showToast((LANG_EN?"Couldn't save the file.":'Dosya kaydedilemedi.'),'bad');});return;}
    case 'copysave':{const t=document.getElementById('expText');if(t){t.select();try{navigator.clipboard&&navigator.clipboard.writeText(t.value);showToast((LANG_EN?"Copied.":'Kopyalandı.'));}catch(e){}}return;}
    case 'sednew':{UI.sed=sedDefault();UI.sedCode=null;closeModal();G.speed=0;UI.tab='sced';window.scrollTo({top:0});break;}
    case 'sededit':{const d=myScns()[+ds.i];if(!d)break;UI.sed=JSON.parse(JSON.stringify(d));UI.sedCode=null;closeModal();G.speed=0;UI.tab='sced';window.scrollTo({top:0});break;}
    case 'sedback':{UI.sed=null;UI.sedCode=null;UI.tab='office';openModal('scenario');return;}
    case 'sedres':{const d=UI.sed;if(!d)break;d.res=d.res.includes(ds.rid)?d.res.filter(x=>x!==ds.rid):[...d.res,ds.rid];break;}
    case 'sedreg':{const d=UI.sed;if(!d)break;d.regs=d.regs.includes(ds.r)?d.regs.filter(x=>x!==ds.r):[...d.regs,ds.r];break;}
    case 'sedpadd':{const d=UI.sed;if(d&&d.prods.length<5)d.prods.push({cat:'app',v:1,name:''});break;}
    case 'sedpdel':{const d=UI.sed;if(d)d.prods.splice(+ds.i,1);break;}
    case 'sedgadd':{const d=UI.sed;if(d&&d.goals.length<6)d.goals.push({k:'rev',t:5});break;}
    case 'sedgdel':{const d=UI.sed;if(d)d.goals.splice(+ds.i,1);break;}
    case 'sedsave':case 'sedplay':case 'sedcode':{const d=UI.sed&&scnSan(UI.sed);if(!d||sedErrs(d).length)break;
      const L=myScns(),i=L.findIndex(x=>x.id===d.id);if(i>=0)L[i]=d;else L.unshift(d);if(!myScnsSet(L))showToast((LANG_EN?"Browser storage is unavailable; the scenario can only be played in this session.":'Tarayıcı depolaması kullanılamıyor; senaryo yalnızca bu oturumda oynanabilir.'),'bad');UI.sed=d;
      if(a==='sedcode'){UI.sedCode=scnCode(d);break;}
      if(a==='sedsave'){showToast((LANG_EN?"Scenario saved.":'Senaryo kaydedildi.'));break;}
      scnFromDef(d);UI.sed=null;UI.sedCode=null;newGame('u_'+d.id);applyDiff(curDiff());G.tut={on:false,step:0,seen:{}};market();save();break;}
    case 'scndel':{UI.scnDel=+ds.i;break;}
    case 'scndelok':{const L=myScns();L.splice(+ds.i,1);myScnsSet(L);UI.scnDel=null;break;}
    case 'scnimp':openModal('scnimp');return;
    case 'scnimpok':{const t=document.getElementById('scnImpText');const d=scnDecode(t&&t.value);if(!d){showToast((LANG_EN?"Couldn't read the code. Paste the whole code, starting with \"SG1.\"":'Kod okunamadı. "SG1." ile başlayan kodun tamamını yapıştır.'),'bad');break;}
      d.id=Date.now().toString(36);const L=myScns();L.unshift(d);myScnsSet(L);showToast((LANG_EN?`Added "${d.n}" to your scenarios.`:`"${d.n}" senaryolarına eklendi.`));openModal('scenario');return;}
    case 'scncancel':if(G.over)openModal(G.exited?'exit':'over');else closeModal();break;
    case 'scnok':closeModal();break;
    case 'newgameok':newGame();closeModal();save();break;
    case 'close':closeModal();break;
    case 'prinv':{const c=G.prc.cr.find(x=>x.id===+ds.id);if(!c||c.known||c.inv)break;const k=30000*infl();if(G.cash<k)break;spend(k,'other');c.inv=G.day+7;c.resp.inv=G.day;news((LANG_EN?`Internal investigation launched into ${c.n}.`:`${c.n} için iç soruşturma başladı.`));break;}
    case 'prst':{const c=G.prc.cr.find(x=>x.id===+ds.id);if(!c||c.resp.st)break;
      if(ds.k==='deny'){prCool(c,'st',c.fault?-10:-18);if(c.fault)prLie(c,1.5,(LANG_EN?"the claims were unfounded":'iddiaların asılsız olduğu'));news((LANG_EN?`${G.name} denied the allegations.`:`${G.name} iddiaları yalanladı.`));}
      else{prCool(c,'st',c.fault?-12:-6);if(!c.fault)G.brand=clamp(G.brand-0.5,0,100);news((LANG_EN?`${G.name} publicly apologized.`:`${G.name} kamuoyundan özür diledi.`));}
      if(UI.modal&&UI.modal.kind==='crisis'){closeModal();if(G.prevSpeed&&!G.over)G.speed=G.prevSpeed;}break;}
    case 'prconf':{const id=ds.id?+ds.id:null;const c=id?G.prc.cr.find(x=>x.id===id):null;if(id&&(!c||c.resp.conf))break;if(!id&&G.day-G.prc.lastConf<60)break;if(G.cash<prConfCost()){showToast((LANG_EN?"Not enough cash for a press conference.":'Basın toplantısı için yeterli nakit yok.'),'bad');break;}
      if(UI.modal)closeModal();prConfStart(id);return;}
    case 'psans':{prAnswer(+ds.i);break;}
    case 'psend':{const S2=UI.ps;UI.ps=null;closeModal();if(G.prevSpeed&&!G.over)G.speed=G.prevSpeed;if(S2)news(S2.cid?(LANG_EN?`Crisis press conference over: the story is ${S2.h<0?fx(-S2.h,0)+" pts cooler":"no cooler"}.`:`Kriz basın toplantısı bitti: gündem ${S2.h<0?fx(-S2.h,0)+' puan soğudu':'soğumadı'}.`):(LANG_EN?`Press conference over: brand ${S2.b>=0?'+':''}${fx(S2.b,1)}.`:`Basın toplantısı bitti: marka ${S2.b>=0?'+':''}${fx(S2.b,1)}.`),(S2.h<0||S2.b>0)?'good':'bad');break;}
    case 'prcomp':{const c=G.prc.cr.find(x=>x.id===+ds.id);if(!c||c.resp.comp)break;const T=PR_TYPES[c.t],k=T.comp.cost(c);if(G.cash<k){showToast((LANG_EN?"Not enough cash for compensation.":'Telafi için yeterli nakit yok.'),'bad');break;}spend(k,'other');prCool(c,'comp',-35);G.brand=clamp(G.brand+1,0,100);if(c.t==='labor')for(const e of G.emps)e.morale=clamp(e.morale+6,0,100);news((LANG_EN?`${T.comp.n} started (${money(k)}). The public reacted positively.`:`${T.comp.n} başladı (${money(k)}). Kamuoyu olumlu karşıladı.`),'good');break;}
    case 'prfire':{const c=G.prc.cr.find(x=>x.id===+ds.id);if(!c||c.resp.fire)break;const e=G.emps.filter(x=>!x.founder).sort((a,b)=>b.level-a.level||b.salary-a.salary)[0];if(!e)break;
      e.lw='fire';G.emps=G.emps.filter(x=>x!==e);G.layoff=(G.layoff||0)+1;for(const o of G.emps)o.morale=clamp(o.morale-5,0,100);prCool(c,'fire',c.fault?-20:-8);news((LANG_EN?`${e.name} was dismissed after the crisis.`:`${e.name} krizin ardından görevden alındı.`),'bad');break;}
    case 'prag':{const i=+ds.i;if(PR_AG[i])G.prc.ag=i;break;}
    case 'prlater':{closeModal();if(G.prevSpeed&&!G.over)G.speed=G.prevSpeed;break;}
    case 'awcamp':{const A=G.aw;if(!A||!A.noms||A.camp||!awMine().length)break;const k=awCampCost();if(G.cash<k){showToast((LANG_EN?"Not enough cash for the campaign.":'Kampanya için yeterli nakit yok.'),'bad');break;}spend(k,'other');A.camp=true;news((LANG_EN?`Awards campaign started (${money(k)}): outreach to jury members and a press tour.`:`Ödül kampanyası başladı (${money(k)}): jüri üyelerine tanıtım ve basın turu.`));break;}
    case 'awclose':{closeModal();if(G.prevSpeed&&!G.over)G.speed=G.prevSpeed;break;}
    case 'unsel':UI.selEmp=null;break;
    case 'maint':{const p=prod(id);if(!p)break;const r=maintRole(p);const e=G.emps.filter(x=>x.role===r&&!x.proj&&!x.leave&&!x.mgr).sort((a,b)=>b.skill-a.skill)[0];
      if(!e){showToast((LANG_EN?`No idle ${ROLES[r].n.toLocaleLowerCase(LOC)}. Assign one to maintenance in Team → Team & candidates, or hire a new one.`:`Boşta ${ROLES[r].n.toLocaleLowerCase(LOC)} yok. Ekip → Ekip ve adaylar bölümünden birini bakım görevine al ya da yenisini işe al.`),'bad');break;}
      e.proj='m'+p.id;news((LANG_EN?`${e.name} joined the ${p.name} maintenance team.`:`${e.name}, ${p.name} bakım ekibine katıldı.`));break;}
    case 'div':{if(!G.pub)break;const amt=G.cash*0.1;if(amt<1e5){showToast((LANG_EN?"Dividends require at least $1M in cash.":'Temettü için en az $1M nakit gerekli.'),'bad');break;}G.cash-=amt;G.wealth=(G.wealth||0)+amt*G.equity;G.pub.sent*=1.03;news((LANG_EN?`${money(amt)} paid out in dividends; your share: ${money(amt*G.equity)}.`:`${money(amt)} temettü dağıtıldı; payına ${money(amt*G.equity)} düştü.`),'good');break;}
    case 'fxh':{const c=ds.c,r=+ds.r,m=+ds.m;if(!CUR[c]||![0.5,1].includes(r)||![6,12].includes(m))break;const H=G.fx.h[c];if(H&&H.until>G.day)break;const k=fxPrem(c,r,m);if(G.cash<k||k<=0)break;spend(k,'other');G.fx.h[c]={r,lock:fxDev(c),until:G.day+m*30};news((LANG_EN?`${r*100}% of ${CUR[c].n} revenue hedged at today's rate for ${m} months (${money(k)}).`:`${CUR[c].n} gelirinin %${r*100}'i ${m} ay boyunca bugünkü kurdan korundu (${money(k)}).`));break;}
    case 'twmatch':{const T=G.tw,o=T.offers.find(x=>x.id===+ds.id);if(!o)break;const e=G.emps.find(x=>x.id===o.eid);T.offers=T.offers.filter(x=>x!==o);if(!e)break;const k=+ds.k===1.1?1.1:1;
      e.salary=Math.round(o.sal*k/100)*100;e.morale=clamp(e.morale+(k>1?8:4),0,100);if(Math.random()<(e.morale<35?0.35:k>1?0.02:0.1))twLeave(e,comp(o.cid),(LANG_EN?" despite the raise":' zamma rağmen'));else news((LANG_EN?`${e.name} accepted the counteroffer and stayed (${money(e.salary)}/mo).`:`${e.name} karşı teklifini kabul etti ve kaldı (${money(e.salary)}/ay).`),'good');break;}
    case 'twopt':{const T=G.tw,o=T.offers.find(x=>x.id===+ds.id);if(!o)break;const e=G.emps.find(x=>x.id===o.eid);T.offers=T.offers.filter(x=>x!==o);if(!e)break;twGrant(e,0.0025);
      if(Math.random()<0.15+Math.max(0,(o.sal/e.salary-1.4))*0.8)twLeave(e,comp(o.cid),(LANG_EN?" despite the options":' opsiyona rağmen'));else news((LANG_EN?`${e.name} stayed for 0.25% in stock options.`:`${e.name} %0,25 hisse opsiyonuyla kaldı.`),'good');break;}
    case 'twlet':{const T=G.tw,o=T.offers.find(x=>x.id===+ds.id);if(!o)break;const e=G.emps.find(x=>x.id===o.eid);T.offers=T.offers.filter(x=>x!==o);if(e)twLeave(e,comp(o.cid));break;}
    case 'twraise':{const e=G.emps.find(x=>x.id===+ds.eid);if(!e||e.founder)break;e.salary=Math.round(e.salary*1.15/100)*100;e.morale=clamp(e.morale+6,0,100);news((LANG_EN?`${e.name} got a 15% raise.`:`${e.name} %15 zam aldı.`));break;}
    case 'twgrant':{const e=G.emps.find(x=>x.id===+ds.eid);if(!e||e.founder)break;twGrant(e,0.001);news((LANG_EN?`${e.name} received stock options worth 0.1% of the company.`:`${e.name} şirketin %0,1'i kadar hisse opsiyonu aldı.`));break;}
    case 'twnc':{const e=G.emps.find(x=>x.id===+ds.eid);if(!e||e.founder||e.nc)break;const k=e.salary*2;if(G.cash<k)break;spend(k,'salary');e.nc=true;e.morale=clamp(e.morale-2,0,100);news((LANG_EN?`${e.name} signed a non-compete agreement (${money(k)} bonus).`:`${e.name} rekabet yasağı sözleşmesi imzaladı (${money(k)} ikramiye).`));break;}
    case 'twstar':{const T=G.tw,s2=T.stars.find(x=>x.id===+ds.id);if(!s2||G.emps.length>=officeCap())break;const m=+ds.m===1.2?1.2:1,o=ds.o==='1',c=comp(s2.cid);T.stars=T.stars.filter(x=>x!==s2);
      if(Math.random()<twStarP(s2,m,o)){const e=genCand();Object.assign(e,{name:s2.name,role:s2.role,skill:s2.skill,level:s2.level,xp:XP_REQ[s2.level]+rint(0,60),salary:Math.round(s2.ask*m/100)*100,hiredAt:G.day,morale:75});G.emps.push(e);if(o)twGrant(e,0.0025);T.won++;
        if(c){c.tech=clamp(c.tech-0.006*(s2.skill-5),0.7,1.45);c.rel=clamp(relOf(c)-12,-100,100);}twLog(`${s2.name} ← ${c?c.name:'rakip'}`);sfx('cash');
        news((LANG_EN?`Star transfer: ${s2.name} (${ROLES[s2.role].n}, skill ${fx(s2.skill,1)}) joined your team! ${c?`from ${c.name}`:''}`:`Yıldız transferi: ${s2.name} (${ROLES[s2.role].n}, yetenek ${fx(s2.skill,1)}) ${c?`${c.name} şirketinden`:''} ekibine katıldı!`),'good',true);tl('emp',(LANG_EN?`${s2.name} transferred`:`${s2.name} transfer edildi`));
        if(s2.nc&&c&&Math.random()<0.5){const fee=300000*infl();spend(fee,'other');news((LANG_EN?`${c.name} filed a non-compete lawsuit over ${s2.name}; settlement and legal fees: ${money(fee)}.`:`${c.name}, ${s2.name} için rekabet yasağı davası açtı; uzlaşma ve avukat masrafı ${money(fee)}.`),'bad',true);}}
      else news((LANG_EN?`${s2.name} turned down your offer${c?` and stayed at ${c.name}`:''}.`:`${s2.name} teklifini reddetti${c?` ve ${c.name}'da kaldı`:''}.`),'bad');break;}
    case 'iplrate':{const v=+ds.v;if(IPL_RATES.includes(v))G.ipl.rate=v;break;}
    case 'iploffer':{const c=comp(ds.id)||comp(+ds.id);const t=ds.t;if(!c||!IPL_T[t]||!has('isa')||!iplRef()||iplHas(c.id)||G.day-(c.iplAsk||-999)<90)break;c.iplAsk=G.day;
      if(Math.random()<iplP(c,t))iplSign(c,t,G.ipl.rate);else{news((LANG_EN?`${c.name} turned down the license offer.`:`${c.name} lisans teklifini geri çevirdi.`),'bad');}break;}
    case 'iplacc':{const q=G.ipl.req.find(x=>x.id===+ds.id);if(!q)break;G.ipl.req=G.ipl.req.filter(x=>x!==q);const c=comp(q.cid);if(c&&!iplHas(c.id)&&iplRef())iplSign(c,q.type,G.ipl.rate);break;}
    case 'iplrej':{const q=G.ipl.req.find(x=>x.id===+ds.id);if(!q)break;G.ipl.req=G.ipl.req.filter(x=>x!==q);const c=comp(q.cid);if(c)c.rel=clamp(relOf(c)-3,-100,100);break;}
    case 'bid':{const D=biD(),v=String(ds.v||''),ok={sh:BI_SH,sym:BI_SYM,font:BI_FONT,pers:BI_PERS,tier:BI_TIER}[ds.k];if(ok?ok[v]:(ds.k==='c1'||ds.k==='c2')?BI_COL.some(c=>c[0]===v):ds.k==='slo')D[ds.k]=ds.k==='slo'?v.slice(0,48):v;break;}
    case 'bidrand':{UI.bid=biRand(biD().pers);break;}
    case 'bidreset':{UI.bid=biDraftFrom();break;}
    case 'bigo':{biLaunch();break;}
    case 'ardes':{if(AR_DES[ds.k])G.ar.des=ds.k;break;}
    case 'arauto':{G.ar.auto=!G.ar.auto;break;}
    case 'artone':{G.ar.autoT=clamp(+ds.i|0,0,2);break;}
    case 'arsel':{UI.arY=ds.y==='live'?'live':+ds.y;break;}
    case 'arpub':{if(G.ar&&G.ar.draft&&!G.pending){if(G.inbox)G.inbox=G.inbox.filter(x=>x.id!=='annrep');triggerChoice('annrep',{},true);}break;}
    case 'ardl':{const r=G.ar&&G.ar.reps.find(x=>x.y===+ds.y);if(!r)return;const fn=(LANG_EN?`${(G.name||'sirket').replace(/[^\w\-]+/g,'-')}-${r.y}-annual-report.html`:`${(G.name||'sirket').replace(/[^\w\-]+/g,'-')}-${r.y}-faaliyet-raporu.html`),html=arHTML(r);
      if(DL){DL.save({filename:fn,data:html}).then(()=>showToast((LANG_EN?"Report file ready.":'Rapor dosyası hazırlandı.'))).catch(e=>{const c=e&&e.code;if(c==='declined')return;showToast(c==='extension_not_enabled'||c==='rejected_extension'?(LANG_EN?"HTML files can't be downloaded in this view.":'HTML dosyası bu görünümde indirilemiyor.'):(LANG_EN?"Couldn't download the report.":'Rapor indirilemedi.'),'bad');});}
      else{try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download=fn;document.body.appendChild(a);a.click();a.remove();}catch(e){showToast((LANG_EN?"Couldn't download the report.":'Rapor indirilemedi.'),'bad');}}
      return;}
    case 'labbuy':{const n=+ds.n;if(![10,50].includes(n))break;const k=labNodePx()*n;if(G.cash<k)break;spend(k,'capex');G.lab.nodes+=n;news((LANG_EN?`Acquired ${n} compute nodes (${money(k)}).`:`${n} hesaplama düğümü alındı (${money(k)}).`));break;}
    case 'labrent':{const n=+ds.n;if(n!==10&&n!==-10)break;G.lab.rent=Math.max(0,G.lab.rent+n);break;}
    case 'labsell':{if(G.lab.nodes<10||G.lab.run)break;G.lab.nodes-=10;const v=labNodePx()*10*0.4;G.cash+=v;news((LANG_EN?`10 nodes sold for ${money(v)}.`:`10 düğüm ${money(v)} karşılığında satıldı.`));break;}
    case 'labsafe':{const v=+ds.v;if(LAB_SAFE.includes(v))G.lab.safe=v;break;}
    case 'labds':{const k=2e6*infl();if(G.lab.ds>=3||G.cash<k)break;spend(k,'other');G.lab.ds++;news((LANG_EN?"Licensed a large dataset; your models will train on more data.":'Büyük bir veri seti lisanslandı; modellerin daha çok veriyle eğitilecek.'));break;}
    case 'labtrain':{const L=G.lab,k=ds.k;if(!LAB_SC[k]||L.run||!labNodes()||!has('ml'))break;L.run={k,start:G.day,done:0,target:labScPfd(k)};news((LANG_EN?`${LAB_SC[k].n} model training started (${num(L.run.target)} PF-days).`:`${LAB_SC[k].n} model eğitimi başladı (${num(L.run.target)} PF-gün).`));break;}
    case 'labapi':{if(!G.lab.best)break;G.lab.api=!G.lab.api;news(G.lab.api?(LANG_EN?`${G.lab.best.n} is now on sale as an API.`:`${G.lab.best.n} API olarak satışa açıldı.`):(LANG_EN?"Model API shut down.":'Model API\'si kapatıldı.'));break;}
    case 'labopen':{const B=G.lab.best;if(!B||B.open)break;B.open=true;G.brand=clamp(G.brand+2,0,100);if(G.dev)G.dev.devs+=Math.round(20000*B.c/100);for(const c of liveComps())if(c.focus.includes('ai'))c.tech=Math.min(1.45,c.tech+0.02);(G.flags=G.flags||{}).openw=true;news((LANG_EN?`${B.n} released with open weights. Developers are flocking to it.`:`${B.n} açık ağırlıklarla yayımlandı. Geliştiriciler akın ediyor.`),'good',true);tl('star',(LANG_EN?`${B.n} released with open weights`:`${B.n} açık ağırlıklarla yayımlandı`));break;}
    case 'tbset':{const o=G.tnd.open.find(x=>x.id===+ds.id);if(!o||o.bid)break;UI.tb=UI.tb||{};const b=UI.tb[o.id]||(UI.tb[o.id]={pid:(tndProds(o)[0]||{}).id||null,px:1,prep:false});
      if(ds.k==='pid')b.pid=+ds.v;else if(ds.k==='px'){const v=+ds.v;if([0.85,0.95,1,1.1].includes(v))b.px=v;}else if(ds.k==='prep')b.prep=ds.v==='1';break;}
    case 'tbid':{const o=G.tnd.open.find(x=>x.id===+ds.id);if(!o||o.bid)break;if(o.k==='gov'&&G.tnd.ban>G.day)break;const b=(UI.tb&&UI.tb[o.id])||{pid:(tndProds(o)[0]||{}).id||null,px:1,prep:false};if(!b.pid||!prod(b.pid))break;if(o.req&&!has(o.req)){showToast((LANG_EN?"You don't meet this tender's requirements.":'Bu ihalenin şartını karşılamıyorsun.'),'bad');break;}
      const k=5000*infl()+(b.prep?tndPrepC(o):0);if(G.cash<k)break;spend(k,'other');o.bid={...b};news((LANG_EN?`You bid on the "${o.t}" tender. Results will be announced on ${fmtDate(o.due)}.`:`"${o.t}" ihalesine teklif verdin. Sonuç ${fmtDate(o.due)}'de açıklanacak.`));break;}
    case 'wpol':{const k=ds.k;if(!WPOL[k]||k===wPol()||G.day-(G.wpolAt||-999)<90)break;const old=wPol();G.wpol=k;G.wpolAt=G.day;let up=0,dn=0;
      for(const e of G.emps){if(e.founder&&!e.cof)continue;const d0=wDist(wPref(e),old),d1=wDist(wPref(e),k);if(d1<d0){e.morale=clamp(e.morale+4,0,100);up++;}else if(d1>d0){e.morale=clamp(e.morale-6*(d1-d0),0,100);dn++;}}
      news((LANG_EN?`New work model: ${WPOL[k].n.toLocaleLowerCase(LOC)}. ${up} people are happy, ${dn} are unhappy.`:`Yeni çalışma modeli: ${WPOL[k].n.toLocaleLowerCase(LOC)}. ${up} kişi memnun, ${dn} kişi hoşnutsuz.`),dn>up?'bad':'good',true);tl('office',(LANG_EN?`Work model: ${WPOL[k].n}`:`Çalışma modeli: ${WPOL[k].n}`));
      if(old==='remote'&&k==='office')for(const e of G.emps.filter(x=>!x.founder&&wPref(x)==='remote'&&x.morale<40))if(Math.random()<0.3){e.lw='quit';G.emps=G.emps.filter(x=>x!==e);news((LANG_EN?`${e.name} resigned over the return-to-office decision.`:`${e.name} ofise dönüş kararı üzerine istifa etti.`),'bad');}break;}
    case 'hack':{hackStart(ds.pub==='1');return;}
    case 'sidet':{const v=+ds.v;if(v===0||v===0.1)G.sideT=v;break;}
    case 'ideadrop':{G.ideas=(G.ideas||[]).filter(o=>o.id!==+ds.id);break;}
    case 'ideago':{const o=(G.ideas||[]).find(x=>x.id===+ds.id);if(!o)break;
      if(o.k==='product'){if(!catUnlocked(o.cat)){showToast((LANG_EN?"This category is locked.":'Bu kategori kilitli.'),'bad');break;}const d=defaultDraft(o.cat);d.name=o.n;const r=spec(d,teamAvg(REQ_ROLES[o.cat])||3);if(r.err){showToast(r.err,'bad');break;}
        const tool0=toolCost(d);if(tool0>0&&G.cash<tool0){showToast((LANG_EN?`Production tooling requires ${money(tool0)}.`:`Üretim kalıpları için ${money(tool0)} gerekli.`),'bad');break;}if(tool0>0)spend(tool0,'capex');
        const req={};for(const t in r.req)req[t]=Math.max(1,Math.round(r.req[t]*0.7));
        const pr={id:nid(),cat:o.cat,name:o.n,d:{...d},ap:'bal',req,prog:Object.fromEntries(Object.keys(req).map(t=>[t,0])),sk:0,pts:0,start:G.day,qBonus:o.pot,fromIdea:o.src};
        G.projects.push(pr);assignIdle(pr);for(const e of G.emps)if(o.by.includes(e.id)&&!e.proj&&req[e.role])e.proj=pr.id;news((LANG_EN?`The ${o.n} idea became a project.`:`${o.n} fikri projeye dönüştü.`),'good');}
      else{if(o.k==='feature'&&!(prod(o.pid)&&prod(o.pid).active))break;const req=ideaReq(o);const pr={id:nid(),cat:'app',name:o.n,d:{cat:'app'},req,prog:Object.fromEntries(Object.keys(req).map(t=>[t,0])),sk:0,pts:0,start:G.day,idea:{k:o.k,tool:o.tool,pid:o.pid,pot:o.pot}};
        G.projects.push(pr);assignIdle(pr);news((LANG_EN?`Development of ${o.n} has begun.`:`${o.n} geliştirilmeye başlandı.`));}
      G.ideas=G.ideas.filter(x=>x!==o);break;}
    case 'tdpol':{const v=+ds.v;if(TD_POL.includes(v))G.tdPol=v;break;}
    case 'cofpick':{const c=(UI.cofC||[])[+ds.i];if(!c||cofOn())break;cofJoin(c);UI.cofC=null;closeModal();save();break;}
    case 'cofsolo':{UI.cofC=null;closeModal();break;}
    case 'cofopen':{if(G.cof||G.day>=365)break;UI.cofC=cofCands().map(c=>({...c,eq:Math.round(Math.min(0.4,c.eq+0.05)*100)/100}));openModal('cofpick');return;}
    case 'cofmeet':{const C=G.cof;if(!cofOn()||G.day-C.meet<60)break;C.meet=G.day;const d=rnd(3,9);C.mood=clamp(C.mood+d,0,100);news((LANG_EN?`You had a one-on-one with ${C.name}; ${d>6?"you haven't talked this well in a long time":"it eased the tension a little"}.`:`${C.name} ile bire bir görüştün; ${d>6?'uzun zamandır böyle iyi konuşmamıştınız':'havayı biraz yumuşattı'}.`),'good');break;}
    case 'cofgive':{const C=G.cof;if(!cofOn()||G.equity<0.1)break;G.equity-=0.02;C.eq+=0.02;C.mood=clamp(C.mood+20,0,100);cofLog((LANG_EN?"2% equity gifted":'%2 hisse hediye edildi'));news((LANG_EN?`You gave ${C.name} 2% equity.`:`${C.name}'a %2 hisse verdin.`),'good');break;}
    case 'cofend':{if(!cofOn()||G.pending)break;triggerChoice('cofleave',{forced:true});return;}
    case 'ceodin':{const c=comp(+ds.id||ds.id);if(!c||c.dead)break;const o=ceoOf(c),k=20000*infl();if(G.day-o.din<90||G.cash<k)break;spend(k,'other');o.din=G.day;const P0=PERS[o.p];let d=P0.dinner*rnd(0.6,1.4);if(o.p==='giz')d=rnd(-4,18);if(relOf(c)<-60&&o.p!=='dip')d*=0.4;ceoAdd(c,d);
      news((LANG_EN?`Dinner with ${o.name} (${c.name}): ${d>=12?"it went very well, a warm conversation":d>=5?"it was polite and positive":d>=0?"it was cold but courteous":"it was tense"}.`:`${o.name} (${c.name}) ile akşam yemeği: ${d>=12?'çok iyi geçti, sıcak bir sohbet oldu':d>=5?'nazik ve olumlu geçti':d>=0?'soğuk ama kibardı':'gergin geçti'}.`),d>=5?'good':'');break;}
    case 'ceojab':{const c=comp(+ds.id||ds.id);if(!c||c.dead)break;const o=ceoOf(c);if(G.day-o.jab<60)break;o.jab=G.day;ceoAdd(c,-15);
      if(G.brand>c.brand||Math.random()<0.5){G.brand=clamp(G.brand+1,0,100);c.brand=clamp(c.brand-1,3,90);news((LANG_EN?`You took a jab at ${c.name} in an interview; your words were widely shared.`:`Bir röportajda ${c.name}'ı iğneledin; sözlerin çok paylaşıldı.`),'good');}else{G.brand=clamp(G.brand-1,0,100);news((LANG_EN?`Your jab at ${c.name} backfired; you came across as smug.`:`${c.name}'ı iğnelemen ters tepti; ukala bulundun.`),'bad');}
      if(o.p==='kav'&&!G.pending&&Math.random()<0.6)setTimeout(()=>{if(!G.pending&&!G.over)triggerChoice('ceofeud',{cid:c.id,q:pick(PERS.kav.jab)});},0);break;}
    case 'ceopro':{UI.ceoPro=ds.id?(+ds.id||ds.id):null;break;}
    case 'ceopart':{const c=comp(+ds.id||ds.id),k=ds.k;if(!c||c.dead||!PART[k])break;const cost=PART[k].cost*infl();if(G.cash<cost)break;UI.ceoPro=null;
      if(Math.random()<ceoPartP(c,k)){spend(cost,'other');ceoStartPart(c,k);}else{ceoAdd(c,-2);news((LANG_EN?`${ceoOf(c).name} turned down your ${PART[k].n.toLocaleLowerCase(LOC)} offer.`:`${ceoOf(c).name} ${PART[k].n.toLocaleLowerCase(LOC)} teklifini geri çevirdi.`),'bad');}break;}
    case 'ceopeace':{const c=comp(+ds.id||ds.id);if(!c||c.dead||relOf(c)>-30)break;const k=100000*infl();if(G.cash<k)break;spend(k,'other');const o=ceoOf(c),p=clamp(0.55/PERS[o.p].grudge+(o.p==='dip'?0.2:0),0.1,0.9);
      if(Math.random()<p){c.rel=Math.max(relOf(c)+40,-10);o.feud=0;news((LANG_EN?`${o.name} accepted the peace offer; tension between the two companies eased.`:`${o.name} barış teklifini kabul etti; iki şirket arasındaki gerginlik azaldı.`),'good',true);}else{ceoAdd(c,-5);news((LANG_EN?`${o.name} rejected the peace offer.`:`${o.name} barış teklifini reddetti.`),'bad',true);}break;}
    case 'shpay':{const p=G.pub;if(!p)break;shInit(p);const v=+ds.v;if(!PAYOUT.some(x=>x[0]===v)||v===p.payout)break;if(v<p.payout){p.sent*=v===0?0.88:0.94;p.divStreak=0;news(v===0?(LANG_EN?"Dividend cut. Income investors are selling the stock.":'Temettü kesildi. Gelir yatırımcıları hisseyi satıyor.'):(LANG_EN?"Dividend rate lowered; the stock slipped.":'Temettü oranı düşürüldü; hisse geriledi.'),'bad',true);}else{p.sent*=1.02;news((LANG_EN?`New dividend policy: ${PAYOUT.find(x=>x[0]===v)[1]}.`:`Yeni temettü politikası: ${PAYOUT.find(x=>x[0]===v)[1]}.`),'good');}p.payout=v;break;}
    case 'shguide':{const p=G.pub;if(!p)break;shInit(p);const i=+ds.i;if(!GUIDE[i]||i===p.guide)break;p.sent*=i===2?1.04:i===0?0.97:1;p.guide=i;news((LANG_EN?`Gave analysts ${GUIDE[i][0].toLocaleLowerCase(LOC)} guidance.`:`Analistlere ${GUIDE[i][0].toLocaleLowerCase(LOC)} bir yönlendirme yapıldı.`));break;}
    case 'shbb':{const p=G.pub;if(!p)break;shInit(p);const f=+ds.f;if(f!==0.1&&f!==0.25)break;const amt=G.cash*f;if(amt<1e6)break;const n=amt/p.price,old=p.shares;p.shares-=n;p.floatSh=Math.max(0,p.floatSh-n*0.5);G.equity=Math.min(0.99,G.equity*old/p.shares);if(p.act&&p.act.st!=='done')p.act.stake=Math.min(0.2,p.act.stake*old/p.shares);G.cash-=amt;p.sent=Math.min(2.5,p.sent*(1.02+(p.sent<0.9?0.04:0)));news((LANG_EN?`Bought back ${num(n)} shares worth ${money(amt)}. Your stake is now ${pct(G.equity)}.`:`${money(amt)} değerinde ${num(n)} hisse geri alındı. Payın ${pct(G.equity)} oldu.`),'good');break;}
    case 'shsec':{const p=G.pub;if(!p)break;shInit(p);const f=+ds.f;if((f!==0.05&&f!==0.1)||G.day-p.lastSec<180)break;const n=p.shares*f,amt=n*p.price*0.95,old=p.shares;p.shares+=n;p.floatSh+=n;G.equity*=old/p.shares;if(p.act&&p.act.st!=='done')p.act.stake*=old/p.shares;G.cash+=amt;p.lastSec=G.day;p.sent*=(macPh()==='boom'||macPh()==='stim')?0.98:0.95;news((LANG_EN?`Secondary offering: raised ${money(amt)} with ${num(n)} new shares. Your stake is now ${pct(G.equity)}.`:`İkincil halka arz: ${num(n)} yeni hisse ile ${money(amt)} toplandı. Payın ${pct(G.equity)} oldu.`),'good',true);tl('money',(LANG_EN?`Secondary offering: ${money(amt)}`:`İkincil halka arz: ${money(amt)}`));break;}
    case 'shsplit':{const p=G.pub;if(!p)break;shInit(p);const n=+ds.n;if(![2,3,5].includes(n)||p.price<100||G.day-p.lastSplit<365||p.price/n<20)break;p.shares*=n;p.floatSh*=n;p.price/=n;p.hist=p.hist.map(x=>x/n);p.lastSplit=G.day;p.sent*=1.03;news((LANG_EN?`${n}-for-1 stock split: new price $${fx(p.price,2)}. Retail investors welcomed it.`:`Hisse ${n}'e 1 bölündü: yeni fiyat $${fx(p.price,2)}. Küçük yatırımcılar ilgiyle karşıladı.`),'good');break;}
    case 'buyback':{if(!G.pub)break;const amt=G.cash*0.15;if(amt<1e5){showToast((LANG_EN?"Not enough cash for a buyback.":'Geri alım için yeterli nakit yok.'),'bad');break;}const old=G.pub.shares;G.pub.shares-=amt/G.pub.price;G.equity=Math.min(0.99,G.equity*old/G.pub.shares);G.cash-=amt;G.pub.sent*=1.02;news((LANG_EN?`Bought back ${money(amt)} in stock. Your stake is now ${pct(G.equity)}.`:`${money(amt)} değerinde hisse geri alındı. Payın ${pct(G.equity)} oldu.`));break;}
    case 'sellshare':{if(!G.pub||G.equity<=0.06)break;const v=0.01*marketCap()*0.97;G.wealth=(G.wealth||0)+v;G.equity-=0.01;G.pub.sent*=0.98;news((LANG_EN?`Founder sold shares: 1% of the company, ${money(v)}. The market wasn't thrilled.`:`Kurucu hisse sattı: şirketin %1'i, ${money(v)}. Piyasa bunu pek sevmedi.`));break;}
    case 'floor':UI.floor=+ds.f;UI.selFurn=null;OV.ghostKey=null;break;
    case 'addfloor':{const off=OFFICES[G.office];if(G.floors>=off.maxF)break;const cost=off.floorCost*infl();if(G.cash<cost){showToast((LANG_EN?"Not enough cash for a new floor.":'Yeni kat için yeterli nakit yok.'),'bad');break;}
      spend(cost,'capex');G.floors++;UI.floor=G.floors-1;for(const e of G.emps)e.morale=Math.min(100,e.morale+2);news((LANG_EN?`New floor added to the building: ${floorName(G.floors-1)}. Capacity: ${officeCap()} people.`:`Binaya yeni kat eklendi: ${floorName(G.floors-1)}. Kapasite ${officeCap()} kişi.`),'good',true);break;}
    case 'edit':UI.edit=!UI.edit;UI.placing=null;UI.selFurn=null;break;
    case 'pickfurn':UI.placing=ds.t&&ds.t!==UI.placing?ds.t:null;UI.selFurn=null;OV.ghostKey=null;break;
    case 'rot':UI.rot=UI.rot?0:1;break;
    case 'place':placeFurn(ds.t,+ds.x,+ds.y);break;
    case 'fmove':case 'fstore':case 'fsell':{const f=G.furn.find(x=>x.id===UI.selFurn);if(!f)break;removeFurn(f);
      if(a==='fsell'){const v=FURN[f.t].cost*infl()*0.5;G.cash+=v;news((LANG_EN?`${FURN[f.t].n} sold for ${money(v)}.`:`${FURN[f.t].n} ${money(v)} karşılığında satıldı.`));}
      else{G.furnInv[f.t]=(G.furnInv[f.t]||0)+1;if(a==='fmove'){UI.placing=f.t;UI.rot=f.r||0;}}
      break;}
    case 'meet':startMeeting(ds.mt,ds.id===''||ds.id==null?null:+ds.id);break;
    case 'meetstop':if(G.meeting){news((LANG_EN?`${MEET[G.meeting.t].n} canceled.`:`${MEET[G.meeting.t].n} iptal edildi.`));G.meeting=null;}break;
  }
  UI.force=true;if(!UI.quiet)render();
}
function assignIdle(pr){
  let n=0;for(const e of G.emps)if(idle(e)&&pr.req[e.role]&&pr.prog[e.role]<pr.req[e.role]){e.proj=pr.id;n++;}
  if(!n)showToast((LANG_EN?"No idle employee fits this project.":'Bu projeye uygun boşta çalışan yok.'),'bad');
}

