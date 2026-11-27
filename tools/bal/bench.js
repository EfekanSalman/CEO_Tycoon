// Karşılaştırmalı bot ölçümü (v166, yeniden yazıldı). Aynı senaryo × tohum çiftleri iki kolda (A, B) koşar; her tohum kendi eşiyle karşılaştırılır.
// Ortak rastgele sayılar botta varsayılan olarak açıktır (oyun her günü ve bölümlerini tohumdan yeniden tohumlar): kollar yalnızca kararlarla ayrışır.
// node tools/bal/bench.js --a A.html [--b B.html] [--stratA base] [--stratB base,pat] [--offA rtd,..] [--offB ..]
//   [--scen garage,chip,crisis]   (free varsayılan değil: garajla aynı başlangıç, hedefsiz; bot aynı oyunu oynar) [--seeds 1-10] [--yrs 10] [--par 4] [--out klasör] [--nocrn] [--det]
// --det: belirlenimcilik denetimi (A kolunu iki kez koşturup sonuçları karşılaştırır).
const {spawn}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const A=process.argv.slice(2),opt=k=>{const i=A.indexOf('--'+k);return i<0?null:(A[i+1]&&!A[i+1].startsWith('--')?A[i+1]:true);};
const R=path.join(__dirname,'../..'),FA=path.resolve(opt('a')||path.join(R,'index.html')),FB=path.resolve(opt('b')||FA);
const STRAT=opt('strat')||'base',STRA=opt('stratA')||STRAT,STRB=opt('stratB')||STRAT;
const SC=(opt('scen')||'garage,chip,crisis').split(','),YRS=+(opt('yrs')||10),PAR=+(opt('par')||4),DET=!!opt('det'),NOCRN=!!opt('nocrn');
const SR=String(opt('seeds')||'1-10').split('-').map(Number),SEEDS=[];for(let s=SR[0];s<=(SR[1]||SR[0]);s++)SEEDS.push(s);
const OFFA=typeof opt('offA')==='string'?opt('offA'):'',OFFB=typeof opt('offB')==='string'?opt('offB'):'';
const OUT=path.resolve(opt('out')||path.join(os.tmpdir(),'sg-bench-'+Date.now()));fs.mkdirSync(OUT,{recursive:true});
const BAL=path.join(__dirname,'bal.js');
const jobs=[];for(const sc of SC)for(const sd of SEEDS){jobs.push({arm:'A',sc,sd,file:FA,off:OFFA,st:STRA});jobs.push(DET?{arm:'A2',sc,sd,file:FA,off:OFFA,st:STRA}:{arm:'B',sc,sd,file:FB,off:OFFB,st:STRB});}
const run=j=>new Promise(res=>{const p=spawn(process.execPath,[BAL,j.sc,j.st,String(YRS),j.file,String(j.sd)],{env:{...process.env,OFF:j.off,...(NOCRN?{NOCRN:'1'}:{})}});let out='';
  p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>out+=d);p.on('close',()=>{fs.writeFileSync(path.join(OUT,`${j.arm}_${j.sc}_${j.sd}.json`),out);try{j.r=JSON.parse(out.split('\n').find(l=>l.startsWith('{')));}catch(e){j.r=null;}j.raw=out;res(j);});});
const tq=n=>[0,12.71,4.30,3.18,2.78,2.57,2.45,2.36,2.31,2.26,2.23,2.20,2.18,2.16,2.14,2.13,2.12,2.11,2.10,2.09,2.09][Math.min(20,n)]||2.0;
const stat=xs=>{const n=xs.length,m=xs.reduce((a,b)=>a+b,0)/Math.max(1,n),sd=n>1?Math.sqrt(xs.reduce((a,b)=>a+(b-m)**2,0)/(n-1)):0,h=n>1?tq(n-1)*sd/Math.sqrt(n):0;return {n,m,lo:m-h,hi:m+h};};
const key=r=>r?{stars:(r.scnRes&&r.scnRes.stars)||0,val:Math.max(0.1,r.val||0),bk:r.over?1:0}:null;
(async()=>{console.log(`kollar: A=${path.basename(FA)} [${STRA}]${OFFA?` kapalı:${OFFA}`:''}  B=${DET?'A tekrar':path.basename(FB)+` [${STRB}]`+(OFFB?` kapalı:${OFFB}`:'')} · ${SC.join(',')} × tohum ${SEEDS[0]}-${SEEDS[SEEDS.length-1]} · ${YRS} yıl${NOCRN?' · ortak rastgele sayılar kapalı':''}`);
  let i=0,done=0;const t0=Date.now();await Promise.all(Array.from({length:PAR},async()=>{while(i<jobs.length){const j=jobs[i++];await run(j);done++;process.stderr.write(`\r${done}/${jobs.length} koşu · ${Math.round((Date.now()-t0)/1000)} sn`);}}));process.stderr.write('\n');
  if(DET){let same=0,bad=[];for(const sc of SC)for(const sd of SEEDS){const a=jobs.find(j=>j.arm==='A'&&j.sc===sc&&j.sd===sd),b=jobs.find(j=>j.arm==='A2'&&j.sc===sc&&j.sd===sd);
      const ra=(a.raw.split('\n').find(l=>l.startsWith('{'))||'x'),rb=(b.raw.split('\n').find(l=>l.startsWith('{'))||'y');if(ra===rb)same++;else bad.push(sc+'/'+sd);}
    const msg=`belirlenimcilik: ${same}/${SC.length*SEEDS.length} iş iki koşuda birebir aynı${bad.length?' · farklı: '+bad.join(', '):''}`;console.log(msg);process.exitCode=bad.length?1:0;return;}
  const rows=[],all={ds:[],dv:[],aw:0,bw:0,ab:0,bb:0};
  for(const sc of SC){const ds=[],dv=[],sa=[],sb=[];let aw=0,bw=0,ab=0,bb=0;
    for(const sd of SEEDS){const a=key(jobs.find(j=>j.arm==='A'&&j.sc===sc&&j.sd===sd).r),b=key(jobs.find(j=>j.arm==='B'&&j.sc===sc&&j.sd===sd).r);if(!a||!b)continue;
      sa.push(a.stars);sb.push(b.stars);ds.push(b.stars-a.stars);dv.push(Math.log(b.val/a.val));if(b.val>a.val)bw++;else if(a.val>b.val)aw++;ab+=a.bk;bb+=b.bk;}
    rows.push({sc,S:stat(ds),V:stat(dv),sa:stat(sa).m,sb:stat(sb).m,aw,bw,ab,bb});all.ds.push(...ds);all.dv.push(...dv);all.aw+=aw;all.bw+=bw;all.ab+=ab;all.bb+=bb;}
  rows.push({sc:'TOPLAM',S:stat(all.ds),V:stat(all.dv),sa:null,sb:null,aw:all.aw,bw:all.bw,ab:all.ab,bb:all.bb});
  const pc=x=>`${x>=0?'+':''}${(Math.expm1(x)*100).toFixed(0)}%`,f=x=>x==null?'—':x.toFixed(2),sig=(lo,hi)=>lo>0?'B daha iyi':hi<0?'A daha iyi':'fark yok';
  const md='| senaryo | n | yıldız A | yıldız B | yıldız farkı (95% GA) | değerleme B/A (95% GA) | değerlemede önde (A/B) | erken bitiş A/B | sonuç (yıldız · değerleme) |\n|---|---|---|---|---|---|---|---|---|\n'+
    rows.map(r=>`| ${r.sc} | ${r.S.n} | ${f(r.sa)} | ${f(r.sb)} | ${r.S.m>=0?'+':''}${r.S.m.toFixed(2)} (${r.S.lo.toFixed(2)}…${r.S.hi.toFixed(2)}) | ${pc(r.V.m)} (${pc(r.V.lo)}…${pc(r.V.hi)}) | ${r.aw}/${r.bw} | ${r.ab}/${r.bb} | ${sig(r.S.lo,r.S.hi)} · ${sig(r.V.lo,r.V.hi)} |`).join('\n');
  fs.writeFileSync(path.join(OUT,'rapor.md'),md+'\n');console.log(md);console.log('çıktılar: '+OUT);})();
