// Denge botu (v166, kurtarmadan sonra yeniden yazıldı): node tools/bal/bal.js <senaryo> <strateji> <yıl> [html] [tohum]
// Ortam: OFF="rtd,rcd,..." sistemleri kapatır (window.SG_OFF), NOCRN=1 ortak rastgele sayıları kapatır.
// Strateji bayrakları (virgülle): base (her zaman), pat (patent başvurusu), suitscan (sana açılan patent davasında seçenekleri kopyada ölç),
//   patf (yalnızca yapılmış araştırmalara başvuru; araştırma sırasına dokunmaz), sue (rakibe patent davası),
//   optxall (bütün kararlarda seçenekleri kopyada ölç, türden koşu başına en çok 6).
// Çıktı: tek satır JSON {scnRes,val,cash,over,ns:{...}}. DUMP=dosya.json: bitişteki oyun durumunu kayıt olarak yazar (ekran görüntüsü / test kaydı için).
// Bot oyunun kararlarında oyunun kendi varsayılanını (evDefI: tahmin varsa en iyi tahmin, yoksa ayarlı varsayılan) seçer.
const {open,startScn}=require('../page');const path=require('path');
(async()=>{const [SID,STRAT,YRS,FILE]=[process.argv[2]||'garage',process.argv[3]||'base',+(process.argv[4]||10),process.argv[5]||path.join(__dirname,'../..','index.html')];
  const SEED=+(process.argv[6]||1);const {b,pg,errs}=await open({html:FILE,seed:SEED});
  const r=await pg.evaluate(([SID,STRAT,YRS,SEED,OFF,CRN])=>{
    let t=(SEED*7919)>>>0;Math.random=function(){t+=0x6D2B79F5;let r=Math.imul(t^t>>>15,1|t);r^=r+Math.imul(r^r>>>7,61|r);return ((r^r>>>14)>>>0)/4294967296;};
    window.SG_OFF={};for(const k of (OFF||'').split(',').filter(Boolean))window.SG_OFF[k]=1;window.SG_CRN=CRN?SEED:null;
    UI.tutPref=false;PREF.decide='all';PREF.tipsOff=true;closeModal();act('scnstart',{s:SID});closeModal();if(G.tut)G.tut.on=false;G.speed=0;UI.quiet=true;
    const TRACE=/trace/.test(STRAT);
    const ST={pat:/pat/.test(STRAT),patpri:/pat($|,)/.test(STRAT),sue:/sue/.test(STRAT),suitscan:/suitscan/.test(STRAT),optxall:/optxall/.test(STRAT)};
    const T=(a,ds)=>{try{act(a,ds||{});}catch(e){}};
    const NS={hire:0,proj:0,res:0,rack:0,office:0,round:0,loan:0,reg:0,camp:0,exec:0,patFiled:0,ev:{},suitIn:0,suitOut:0,suitWon:0,suitLost:0,yr:[]};
    const ROLEW={soft:0.32,design:0.18,hw:0.14,res:0.1,mkt:0.1,sup:0.07,ops:0.06,sec:0.03};
    // ---- karar seçenekleri muhasebesi: her seçenek aynı başlangıçtan, aynı rastgele sayılarla kopyada 365 gün ----
    const OX=[],OXN={};
    const evalOpts=H=>{const P=G.pending,E=EVD[P.id],n=E.view(P.d).o.length,seed=(G.day*2654435761+7)>>>0,out=[];
      for(let i=0;i<n;i++){const g=wiClone(G);const S=wiEnter(g);try{Math.random=wiSeeded(seed);const P2=G.pending;E.pick(P2.d,i);G.pending=null;for(let k=0;k<H&&!G.over;k++){step();G.pending=null;}out.push({cash:Math.round(G.cash),val:Math.round(valuation()),over:!!G.over});}catch(e){out.push(null);}finally{wiExit(S);}}return out;};
    // dava sonuçlarını say (rol: pl = sen açtın, def = sana açıldı)
    {const RC0=window.resolveCase;window.resolveCase=function(k){const c0=G.cash,b0=G.brand;const r=RC0.apply(this,arguments);const won=G.brand>b0;if(k.role==='pl'){NS.plN=(NS.plN||0)+1;if(won)NS.plWon=(NS.plWon||0)+1;NS.plCash=(NS.plCash||0)+Math.round(G.cash-c0);}else{NS.defN=(NS.defN||0)+1;if(won)NS.defWon=(NS.defWon||0)+1;NS.defCash=(NS.defCash||0)+Math.round(G.cash-c0);}return r;};}
    // düşmanca devralma kaydı: her girişim için başlangıç günü, prim, ihale sonundaki başarı şansı, oyuncu payı, savunmalar ve sonuç
    if(typeof window.htoDaily==='function'){const HD0=window.htoDaily;window.htoDaily=function(){const H=G.hto,T0=H&&H.them;let rec=null;
      if(T0&&T0.st==='tender'&&G.day>=T0.end)rec={d:G.day,t0:T0.t0,prem:T0.prem,stake:Math.round(T0.stake*100)/100,ch:Math.round(htoThemChance()*100)/100,eq:Math.round(G.equity*100)/100,ratio:Math.round(T0.px/Math.max(0.01,G.pub.price)*100)/100,def:Object.keys(T0.d).join('+')};
      const r=HD0.apply(this,arguments);if(H&&H.them&&!T0)H.them.t0=G.day;if(rec){rec.lost=!!G.over;(NS.hto=NS.hto||[]).push(rec);}return r;};}
    const burn=()=>{const m=monthlyEst();return Math.max(1,(m.rev||0)-(m.profit||0));};
    const nextRound=()=>ROUNDS.find((r,i)=>!G.rounds[r.id]&&(i===0||G.rounds[ROUNDS[i-1].id]));
    for(let d=1;d<365*YRS;d++){step();
      if(G.pending){const id=G.pending.id,E=EVD[id];NS.ev[id]=(NS.ev[id]||0)+1;if(id==='suitIn'){NS.suitIn++;if(TRACE){const P=G.pending.d,c=comp(P.cid);(NS.st=NS.st||[]).push({d:G.day,cat:P.cat,claim:Math.round(P.claim/1e3),cash:Math.round(G.cash/1e3),rev:Math.round(monthlyEst().rev/1e3),catRev:Math.round(catRev('P',P.cat)/1e3),pat:[myPat(P.cat),theirPat(c,P.cat)]});}}
        try{const v=E.view(G.pending.d),n=v.o.length;
          if((ST.suitscan&&id==='suitIn')||(ST.optxall&&id!=='htoatk'&&(OXN[id]=(OXN[id]||0)+1)<=6)){let est=null;try{est=optEst(id,G.pending.d);}catch(e){}
            const c=ibCfg(id),ref=evDefI(id,G.pending.d,n);OX.push({id,day:G.day,est:est&&est.map(x=>Math.round(x)),res:evalOpts(365),ref,names:v.o.map(o=>String(o.t).replace(/[\d.,]+[KMB]?/g,'#').slice(0,48)),pat:id==='suitIn'?[myPat(G.pending.d.cat),theirPat(comp(G.pending.d.cid),G.pending.d.cat)]:null});}
          E.pick(G.pending.d,id==='coup'?1:evDefI(id,G.pending.d,n));}catch(e){}G.pending=null;}   // darbe: varsayılan (istifa) oyunu bitirir; taviz ver
      // kurul toplantısı: üyelerin büyük olasılıkla vereceği karar yönünde oy (kazanılan oy güven +1,5; katılmamak −6)
      if(G.bm&&G.bm.cur&&!G.bm.cur.res){const C=G.bm.cur,M=G.bm.mem;for(const it of C.items){const p=M.reduce((a,m)=>a+bmProb(m,it,C),0)/Math.max(1,M.length);it.st=p>=0.5?1:-1;}try{bmVote(false);bmClose();}catch(e){}NS.bm=(NS.bm||0)+1;}
      // düşmanca devralma girişimine savunma
      if(G.hto&&G.hto.them){for(const k of ['pill','bb','pr','knight'])if(!G.hto.them.d[k]&&HTO_DEF[k].ok()&&(k!=='knight'||htoThemChance()>0.35))T('htodef',{k});}
      if(G.over)break;
      if(d%7)continue;
      // ---- haftalık yönetim ----
      const m=monthlyEst(),sal=G.emps.reduce((a,e)=>a+e.salary,0),fix=sal+officeRent();
      // araştırma: önkoşulu hazır en ucuz araştırma (oyunun otomatik araştırma kuralı), kategori açanlar önce
      // pat: tehdit altındaki kategorileri koruyan patentlenebilir araştırmalar önce
      // v168: koruyucu araştırma yalnızca tehdit altındaki kategorilerde (rakip, dava eşiğine 1 puan kala) ve senaryonun zorunlu araştırmasından sonra;
      //   eskiden sattığın her kategorinin patentlenebilir araştırmasını kategori açan araştırmalarla aynı önceliğe koyuyordu ve çipte 14nm/fab gecikiyordu.
      const gap0=typeof SUIT_GAP==='number'?SUIT_GAP:2,patWant=ST.patpri&&typeof suitRisks==='function'?suitRisks().filter(r=>r.gap>=gap0-1&&r.res&&r.gap-r.pend>=gap0-1).map(r=>r.res):[];
      if(!G.res.active){const must=new Set([...Object.values(CAT_RES),...(SID==='chip'?resClosure(['n14','fab']):[])]),prot=new Set(patWant),tier=x=>must.has(x.id)?2:prot.has(x.id)?1:0;
        const L=RES.filter(x=>!has(x.id)&&(x.pre||[]).every(has)).sort((a,b)=>tier(b)-tier(a)||resCostOf(a)-resCostOf(b));
        const rr=L[0];if(rr&&G.cash>resCostOf(rr)*3+fix*2){T('research',{rid:rr.id});if(G.res.active)NS.res++;}}
      // patent başvurusu (pat): yapılmış ve patentlenebilir araştırmalar
      if(ST.pat)for(const rr of RES){if(!has(rr.id)||!PAT_CAT[rr.id]||G.patFiled[rr.id]||(G.dev&&G.dev.oss.some(o=>o.rid===rr.id)))continue;if(G.cash<(typeof patFee==='function'?patFee():60000*infl())*2+fix)break;const n0=Object.keys(G.patFiled).length;T('patfile',{rid:rr.id});if(Object.keys(G.patFiled).length>n0)NS.patFiled++;}
      // rakibe patent davası (sue): kazanma ihtimali ≥ %50 ve beklenen tazminat altı aylık avukatlık masrafının 3 katından fazlaysa
      if(ST.sue&&!G.cases.some(k=>k.role==='pl')){let best=null;for(const c of liveComps()){if(crossWith(c.id)||G.cases.some(k=>k.cid===c.id))continue;initPats(c);
          for(const cat of c.focus){if(myPat(cat)<=0)continue;const p=plainChance(cat,c,'std'),dmg=dmgEst(c,cat),fee=LAW.std.cost*infl()*6;if(p<0.5||p*dmg<fee*3)continue;const ev=p*dmg-fee;if(!best||ev>best.ev)best={c,cat,ev};}}
        if(best&&G.cash>LAW.std.cost*infl()*12+fix*2){UI.sue={cid:best.c.id,cat:best.cat,firm:'std'};const n0=G.cases.length;T('suego');if(G.cases.length>n0)NS.suitOut++;}}
      // ofis: dolmak üzereyse ve nakit varsa taşın
      if(G.emps.length>=officeCap()-1&&OFFICES[G.office+1]&&G.cash>OFFICES[G.office+1].cost*infl()*3+fix*3){T('office');NS.office++;}
      // işe alım: nakit 8 aylık sabit giderden fazlaysa haftada bir, oran hedefine göre en eksik rol
      const loss=Math.max(0,-(m.profit||0));
      if(G.emps.length<officeCap()&&G.cash>fix*8+30000*infl()&&(loss===0||G.cash>loss*18)){const cnt={};for(const e of G.emps)cnt[e.role]=(cnt[e.role]||0)+1;const n=G.emps.length+1;
        const need=Object.keys(ROLEW).map(r=>[r,ROLEW[r]*n-(cnt[r]||0)]).sort((a,b)=>b[1]-a[1]);
        let hired=false;for(const [role] of need){const c=(G.cands||[]).filter(x=>x.role===role&&!x.intern).sort((a,b)=>b.skill/b.salary-a.skill/a.salary)[0];if(c){T('hire',{id:String(c.id)});hired=true;NS.hire++;break;}}
        if(!hired&&G.cash>fix*12)T('refresh');}
      // projeler: geliştirici başına sınır; açılmış, ürünü olmayan ya da eskiyen kategori
      const devs=G.emps.filter(e=>DEV_ROLES.includes(e.role)&&!e.leave).length,cap=Math.max(1,Math.floor(devs/3));
      if(G.projects.length<cap){const cats=CAT_ORDER.filter(c=>catUnlocked(c)&&!G.projects.some(p=>p.cat===c)&&(REQ_ROLES[c]||[]).every(rl=>G.emps.some(e=>e.role===rl)));
        const pick2=cats.find(c=>!myActive(c).length)||(!G.execs.cpo&&cats.find(c=>myActive(c).every(p=>p.score/S(c)<0.75)));
        if(pick2){UI.draft=defaultDraft(pick2);UI.draft.assign=true;const tool=toolCost(UI.draft);if(G.cash>tool*3+fix*3){const n0=G.projects.length;T('startproj');if(G.projects.length>n0)NS.proj++;}}}
      for(const pr of G.projects)T('assign',{id:String(pr.id)});
      // sunucu
      if(G.capFull&&!G.execs.coo&&G.cash>rackCost()*3+fix)T('rack'),NS.rack++;
      // yeni ürüne lansman kampanyası
      if(!G.execs.cmo)for(const p of myActive())if(G.day-(p.launch||0)<30&&!(p.camp>G.day)&&G.cash>CATS[p.cat].camp*infl()*6+fix*2){T('camp',{id:String(p.id)});NS.camp++;}
      // bölgeler: kârdayken
      if(m.profit>0)for(const rg of REG_ORDER){const R=REGS[rg];if(G.regions[rg].in||(R.minBrand&&G.brand<R.minBrand))continue;if(G.cash>R.entry*infl()*4+fix*4&&m.profit>(R.month||0)*infl()*2){T('regin',{r:rg});if(G.regions[rg].in)NS.reg++;}break;}
      // yöneticiler: X_MIN çalışandan sonra, nakit yetiyorsa
      if(G.emps.length>=X_MIN){xPool();for(const k of X_ORDER){if(G.execs[k])continue;const c=G.xc[k]&&G.xc[k][0];if(c&&G.cash>c.salary*18+fix*4){T('xhire',{x:k,i:'0'});if(G.execs[k])NS.exec++;}break;}}
      // hedef: değerleme eşiğe ulaşınca sıradaki tur (halka arz dahil; garaj senaryosu halka arz ister)
      {const rd=nextRound();if(rd&&rd.id!=='seed'&&valuation()>=rd.min&&(rd.id==='ipo'||G.cash<burn()*12)){const c0=G.cash;T('round',{rid:rd.id});if(G.cash>c0)NS.round++;}}
      // çip senaryosu: fab kur (Türkiye'de devlet yarısını öder), 14 nm'e kadar süreç araştırmalarını öne al
      if(SID==='chip'&&has('fab')&&!G.factories.some(f=>f.type==='fab')){const rg=Object.keys(FREG).sort((a,b)=>facBuildCost('fab',a)-facBuildCost('fab',b))[0];
        if(G.cash>facBuildCost('fab',rg)*1.2){UI.fdraft={type:'fab',region:rg};T('build');NS.fab=(NS.fab||0)+(G.factories.some(f=>f.type==='fab')?1:0);}}
      // finansman: nakit 4 aylık giderin altındaysa yatırım turu, olmazsa kredi
      if(G.cash<burn()*4){const rd=nextRound();if(rd&&valuation()>=rd.min){const c0=G.cash;T('round',{rid:rd.id});if(G.cash>c0)NS.round++;}
        if(G.cash<burn()*2){const lim=loanLimit()-G.debt;if(lim>50000){T('loan',{amt:String(Math.round(Math.min(lim,burn()*6)))});NS.loan++;}}}
      // acil tasarruf: nakit 2 aylık giderin altındaysa ve zarar ediliyorsa, haftada en çok 2 kişi (projede olmayan, en düşük yetenek/maaş)
      if(G.cash<burn()*2&&(m.profit||0)<0){const L=G.emps.filter(e=>!e.founder&&!e.cof).sort((a,b)=>(a.proj?1:0)-(b.proj?1:0)||a.skill/a.salary-b.skill/b.salary);for(const e of L.slice(0,2)){T('fire',{id:String(e.id)});NS.fire=(NS.fire||0)+1;}}
      if(TRACE&&d%28===0){const h=G.hist[G.hist.length-1]||{};const mm=h.m||{};NS.tr=NS.tr||[];NS.tr.push([G.day,Math.round(G.cash/1e3),Math.round((h.profit||0)/1e3),Math.round((mm.rev||0)/1e3),Math.round((mm.salary||0)/1e3),Math.round((mm.other||0)/1e3),Math.round((mm.capex||0)/1e3),Math.round((mm.supply||0)/1e3),G.emps.length,myActive().length,G.projects.length,Math.round(G.debt/1e3)]);}
      if(d%365<7)NS.yr.push({y:Math.round(G.day/365),v:Math.round(valuation()/1e6),cash:Math.round(G.cash/1e6),emps:G.emps.length,prods:myActive().length});
    }
    NS.pats=(G.pats||[]).length;NS.patPend=(G.patPend||[]).length;NS.optx=OX.length?OX:null;
    NS.dbg={unl:CAT_ORDER.filter(c=>catUnlocked(c)),act:myActive().map(p=>p.cat),proj:G.projects.map(p=>p.cat),roles:[...new Set(G.emps.map(e=>e.role))],res:Object.keys(G.res.done).length};
    return {scnRes:G.scn?{end:G.scn.end,won:G.scn.won,fail:G.scn.fail,stars:G.scn.stars||0,got:G.scn.got}:null,val:valuation()/1e6,cash:G.cash,over:G.over?(G.exited?'çıkış: '+(G.exited.hostile?'düşmanca devralma':G.exited.by):'iflas'):'',equity:+(G.equity||0).toFixed(3),conf:G.life?Math.round(G.life.conf):null,day:G.day,ns:NS};
  },[SID,STRAT,YRS,SEED,process.env.OFF||'',!process.env.NOCRN]);
  if(process.env.DUMP){const j=await pg.evaluate(()=>saveJSON());require('fs').writeFileSync(process.env.DUMP,j);}
  console.log(JSON.stringify(r));if(errs.length)console.log('ERRS',errs.slice(0,3));await b.close();})();
