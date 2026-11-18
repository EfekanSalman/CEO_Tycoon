// Silikon Garaj test paketi: node test/suite.js [--build]
// test/tNN-*.js dosyalarını sırayla koşturur. Bir test, "ERRS 0" satırı yoksa, "FAIL" satırı basarsa ya da sıfırdan farklı kodla biterse kırmızıdır.
const {spawn,execFileSync}=require('child_process'),fs=require('fs'),path=require('path');
const DIR=__dirname,R=path.join(DIR,'..');
if(process.argv.includes('--build'))execFileSync(process.execPath,[path.join(R,'tools','build.js'),'--check'],{stdio:'inherit'});
const run=f=>new Promise(res=>{const t0=Date.now();const p=spawn(process.execPath,[path.join(DIR,f)],{cwd:R});let out='';p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>out+=d);
  const to=setTimeout(()=>p.kill('SIGKILL'),15*60*1000);p.on('close',code=>{clearTimeout(to);res({f,out,code,ms:Date.now()-t0});});});
(async()=>{const T=fs.readdirSync(DIR).filter(f=>/^t\d\d[a-z]?-.*\.js$/.test(f)).sort();const rows=[];
  for(const f of T){const r=await run(f);const m=r.out.match(/ERRS (\d+)/),fails=(r.out.match(/^FAIL .*/gm)||[]);
    const ok=m&&m[1]==='0'&&!fails.length&&r.code===0;rows.push({f,ok,ms:r.ms,note:ok?'':(fails.slice(0,2).join(' · ')||(m?'ERRS '+m[1]:'ERRS satırı yok')+' '+r.out.split('\n').slice(-3).join(' ').slice(0,200))});
    console.log(`${ok?'✅':'❌'}  ${f.padEnd(26)} ${String(Math.round(r.ms/1000)).padStart(4)} sn  ${ok?'':rows[rows.length-1].note}`);}
  const n=rows.filter(r=>r.ok).length;console.log(`\n${n}/${rows.length} geçti`);process.exit(n===rows.length?0:1);})();
