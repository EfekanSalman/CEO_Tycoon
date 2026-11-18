// Duman testi: garaj ve çip senaryolarında 3 oyun yılı (kararlar varsayılan seçenekle kapanır); sayfa hatası olmamalı, oyun ilerlemeli.
const {open,startScn}=require('../tools/page');
(async()=>{let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m);}};const {b,pg,errs}=await open({seed:3});
  for(const sid of ['garage','chip']){const s0=await startScn(pg,sid);
    const r=await pg.evaluate(()=>{const d0=G.day;let ev=0;for(let i=0;i<365*3;i++){step();if(G.pending){const P=G.pending,E=EVD[P.id];try{const v=E.view(P.d);E.pick(P.d,evDefI(P.id,P.d,v.o.length));}catch(e){}G.pending=null;ev++;}if(G.over)break;}
      UI.force=true;render();return {days:G.day-d0,ev,over:G.over,cash:Math.round(G.cash),prods:G.products.filter(p=>p.owner==='P').length,ver:VER};});
    console.log(sid,JSON.stringify(s0),JSON.stringify(r));ok(r.days>=365*3-5||r.over,sid+' advanced');}
  console.log('ERRS',errs.length,JSON.stringify(errs.slice(0,3)));if(fail||errs.length)process.exitCode=1;await b.close();})();
