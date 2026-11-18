// Rakip patent davası dengesi (v166): ilk 18 ay dava yok, patent farkı en az 3, talep nakdin en çok %20'si (en az 150K);
// her patent gücü dava ihtimalini %15 düşürür (en çok %80); tahmin patent gücüne göre değişir (patentsizken uzlaşma, güçlü patentle savunma önerilir).
const {open,startScn}=require('../tools/page');const SUIT_GAP_T=3;
(async()=>{let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m);}};const {b,pg,errs}=await open({seed:7});
  await startScn(pg,'garage');
  const r=await pg.evaluate(()=>{for(let i=0;i<800;i++){step();G.pending=null;}
    const c=liveComps()[0];initPats(c);const cat=c.focus[0];
    // ürün ve pay: bu kategoride oyuncunun payı %10 olsun
    const p={id:nid(),owner:'P',cat,name:'T',score:S(cat),price:100,unitCost:40,launch:G.day,active:true,units:20000,share:0.1,total:0,camp:0,sr:20000};G.products.push(p);
    G.pats=[];G.cash=5e6;const R0=Math.random;const trig=(day,gap)=>{G.day=day;for(const x of liveComps()){initPats(x);x.pats[cat]=x===c?gap:0;x.tech=0;}c.aggr=0.9;c.rel=0;G.suitCool=0;G.pending=null;G.cases=[];G.cross={};let got=null;const T0=window.triggerChoice;window.triggerChoice=(id,d)=>{got={id,d};};
      Math.random=()=>0.01;try{patMonthly();}finally{Math.random=R0;window.triggerChoice=T0;}return got;};
    const d0=G.day,early=trig(400,9),gap2=trig(d0+10,2),gap3=trig(d0+20,3);
    G.pats=[{id:nid(),n:'T',cats:[cat],w:4,grant:G.day,exp:G.day+9999}];const det4=suitDeter(cat);G.pats[0].w=9;const det9=suitDeter(cat);G.pats=[];const cl=gap3&&gap3.d.claim;G.cash=200000;const smallCash=suitClaim(cat);
    return {early:!!early,gap2:!!gap2,gap3:!!(gap3&&gap3.id==='suitIn'),claimCap:cl<=5e6*0.2+1,claim:cl,smallCash,floor:smallCash>=150000*infl()-1,det4,det9,consts:[SUIT_GRACE,SUIT_GAP,SUIT_CAP]};});
  // sendika varken tüm çalışanlar çıkarılınca unionMonthly çökmemeli (v166 düzeltmesi; botun kriz koşusunda bulundu)
  const un=await pg.evaluate(()=>{G.union.st='union';G.emps=G.emps.filter(e=>e.founder||e.intern);try{unionMonthly();return 'ok';}catch(e){return String(e);}});
  console.log('sendika, çalışansız:',un);ok(un==='ok','union without workers');
  // başvuru ücreti (v167): en çok 25 çalışanda 15K, üstünde 30K (bugünkü fiyatlarla)
  const fee=await pg.evaluate(()=>{const I=infl(),small=patFee()/I;const e0=G.emps;G.emps=[...e0];while(workers().length<=PAT_SMALL)G.emps.push({...e0.find(e=>!e.founder&&!e.intern)||{id:-1},id:nid(),founder:false,intern:false});const big=patFee()/I;G.emps=e0;return [Math.round(small),Math.round(big)];});
  console.log('başvuru ücreti küçük/büyük:',fee);ok(fee[0]===15000&&fee[1]===30000,'patent fee');
  // dava riski (v168): rakip önde olunca suitRisks kategoriyi, farkı ve gereken patent gücünü verir; patent panelinde satır çıkar
  const rk=await pg.evaluate(()=>{const c=liveComps()[0],cat=c.focus[0];for(const x of liveComps()){initPats(x);x.pats[cat]=x===c?6:0;x.aggr=0.9;x.rel=0;}G.cases=[];G.cross={};G.pats=[];
    const R=suitRisks().find(r=>r.cat===cat);UI.tab='res';(UI.sub=UI.sub||{}).res='patent';render();const t=[...document.querySelectorAll('.small')].some(e=>/Dava riski|Lawsuit risk/.test(e.textContent));return {R,t};});
  console.log('dava riski:',JSON.stringify(rk));ok(rk.R&&rk.R.gap===6&&rk.R.need===6-SUIT_GAP_T+1&&rk.t,'suit risk');
  console.log('dava kuralları:',JSON.stringify(r));
  ok(!r.early&&!r.gap2&&r.gap3&&r.claimCap&&r.floor&&Math.abs(r.det4-0.6)<1e-9&&r.det9===0.8,'suit rules');
  console.log('ERRS',errs.length,JSON.stringify(errs.slice(0,3)));if(fail||errs.length)process.exitCode=1;await b.close();})();
