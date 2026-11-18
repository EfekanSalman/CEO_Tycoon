// Bot: aynı tohum iki kez birebir aynı sonucu verir (ortak rastgele sayılar); garaj senaryosunu hatasız oynar ve şirket büyür; patent başvurusu çalışır.
const {execFileSync}=require('child_process'),path=require('path');
const BAL=path.join(__dirname,'..','tools','bal','bal.js');
const run=(sc,st,y,sd)=>{const o=execFileSync(process.execPath,[BAL,sc,st,String(y),path.join(__dirname,'..','index.html'),String(sd)],{encoding:'utf8',maxBuffer:64e6});return {o,r:JSON.parse(o.split('\n').find(l=>l.startsWith('{')))};};
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m);}};
const a=run('garage','base',6,3),b=run('garage','base',6,3),c=run('garage','base,pat',6,3);
const sa=a.o.split('\n').find(l=>l.startsWith('{')),sb=b.o.split('\n').find(l=>l.startsWith('{'));
console.log('garaj 6 yıl:',JSON.stringify({val:Math.round(a.r.val),emps:a.r.ns.yr.slice(-1)[0],over:a.r.over,pat:c.r.ns.patFiled,pats:c.r.ns.pats}));
ok(sa===sb,'deterministic');ok(a.r.val>50&&!a.r.over,'company grows');ok(c.r.ns.patFiled>0,'patent filing');
const errs=[a,b,c].filter(x=>/ERRS/.test(x.o)).map(x=>x.o.split('ERRS')[1].slice(0,200));
console.log('ERRS',errs.length,JSON.stringify(errs));if(fail||errs.length)process.exitCode=1;
