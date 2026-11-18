// Gezinme: bütün bölüm ve alt bölümler (HUBS) Türkçe/İngilizce, masaüstü/mobil çizilir; sayfa hatası ve yatay taşma olmamalı.
// Varsa test/fixtures/late16.json (geç oyun kaydı) yüklenir; yoksa çip senaryosunda 2 yıl oynatılır.
const {open,startScn,R}=require('../tools/page');const fs=require('fs'),path=require('path');
const FX=path.join(R,'test','fixtures','late16.json');
(async()=>{let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m);}};let errsAll=[];
  for(const [lang,w,h,dark] of [['tr',1280,800,false],['tr',390,844,true],['en',1280,800,false]]){const {b,pg,errs}=await open({lang,w,h,dark,seed:5});
    if(fs.existsSync(FX))await pg.evaluate(s=>{UI.tutPref=false;closeModal();loadGameObj(JSON.parse(s));closeModal();PREF.tipsOff=true;PREF.decide='all';G.speed=0;},fs.readFileSync(FX,'utf8'));
    else{await startScn(pg,'chip');await pg.evaluate(()=>{for(let i=0;i<730;i++){step();G.pending=null;}});}
    const r=await pg.evaluate(()=>{UI.quiet=false;const leaves=[...new Set(HUBS.flatMap(h=>h.sec.map(s=>s[0])))],bad=[],ovf=[];const vw=document.documentElement.clientWidth;
      for(const l of leaves){try{closeModal();act('tab',{tab:l});UI.force=true;render();const m=document.querySelector('main');if(!m||!m.textContent.trim())bad.push(l+':boş');
        for(const el of document.querySelectorAll('main *')){const rc=el.getBoundingClientRect();if(rc.width&&rc.right>vw+2&&!el.closest('.tw,.chain,.mp-wrap,.subtabs,.secbar-in,.tabs-in,canvas')){ovf.push(l+':'+(el.className||el.tagName));break;}}}catch(e){bad.push(l+':'+e.message);}}
      return {leaves:leaves.length,bad,ovf:ovf.slice(0,6)};});
    console.log(lang,w,`leaves=${r.leaves} bad=${JSON.stringify(r.bad)} ovf=${JSON.stringify(r.ovf)}`);ok(!r.bad.length,`${lang} ${w} leaves`);
    errsAll=errsAll.concat(errs.map(e=>lang+w+' '+e));await b.close();}
  console.log('ERRS',errsAll.length,JSON.stringify(errsAll.slice(0,3)));if(fail||errsAll.length)process.exitCode=1;})();
