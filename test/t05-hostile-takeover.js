// Düşmanca devralma (v172): saldırganın başarı şansı o günün değil, ihale süresince ortalama hisse fiyatıyla hesaplanır;
// teklif/fiyat farkının etkisi en çok +%75 (oran farkı 0,5'te tavan). Savunmalar şansı düşürür.
const {open,startScn}=require('../tools/page');
(async()=>{let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m);}};const {b,pg,errs}=await open({seed:5});
  await startScn(pg,'garage');
  const r=await pg.evaluate(()=>{const c=liveComps()[0];G.pub=G.pub||{price:10,shares:1e7,sent:1};G.pub.price=10;G.equity=0.4;if(G.life)G.life.conf=50;
    const T={cid:c.id,stake:0.1,st:'tender',px:15,prem:1.5,end:G.day+45,d:{},ps:10*20,pn:20};G.hto.them=T;
    const base=htoThemChance();                       // oran 1,5 → tavanda
    G.pub.price=5;const dayDrop=htoThemChance();        // tek gün düşüş: ortalama değişmedi → aynı şans
    G.pub.price=10;T.px=25;const capped=htoThemChance(); // oran 2,5 → yine tavanda
    T.px=15;T.d={pill:true,knight:true,pr:true};const def=htoThemChance();
    T.px=11;T.d={};const low=htoThemChance();           // oran 1,1
    G.hto.them=null;return {base,dayDrop,capped,def,low,cap:HTO_RATIO_CAP};});
  console.log('devralma şansı:',JSON.stringify(r));
  const near=(a,b)=>Math.abs(a-b)<1e-9;
  ok(near(r.base,r.dayDrop),'single-day drop ignored');ok(near(r.base,r.capped),'ratio cap');ok(r.def<r.base-0.4,'defenses lower chance');ok(r.low<r.base,'smaller premium lower chance');
  console.log('ERRS',errs.length,JSON.stringify(errs.slice(0,3)));if(fail||errs.length)process.exitCode=1;await b.close();})();
