// Silikon Garaj derleme aracı: node tools/build.js [--check]
// src/head.html + <style>src/css/*.css</style> + src/body.html + <script>src/js/NNN-*.js</script> + src/tail.html → index.html
// --check: birleşik betiğin sözdizimini ve üst düzey tanım çakışmalarını denetler; hata varsa index.html yazılmaz.
// Not (v166): kaynak, 2026-11-18'de konteyner yenilenip proje kaybolunca yayınlanmış v165'ten geri çıkarıldı (tools/extract.py).
// Metinler kaynakta zaten iki dillidir: (LANG_EN?`İngilizce`:`Türkçe`). Yeni metin eklerken bu biçimi elle kullan.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const R=path.join(__dirname,'..'),S=path.join(R,'src');
const rd=f=>fs.readFileSync(f,'utf8');
const jsFiles=fs.readdirSync(path.join(S,'js')).filter(f=>/^\d{3}[a-z]?-.*\.js$/.test(f)).sort();
const cssFiles=fs.readdirSync(path.join(S,'css')).filter(f=>f.endsWith('.css')).sort();
const js=jsFiles.map(f=>rd(path.join(S,'js',f))).join('');
const css=cssFiles.map(f=>rd(path.join(S,'css',f))).join('');
const out=rd(path.join(S,'head.html'))+'<style>\n'+css+'</style>\n'+rd(path.join(S,'body.html'))+'<script>\n'+js+'</script>\n'+rd(path.join(S,'tail.html'));
let bad=0;
if(process.argv.includes('--check')){
  const tmp=path.join(require('os').tmpdir(),'sg-build-check.js');fs.writeFileSync(tmp,js);
  try{execFileSync(process.execPath,['--check',tmp],{stdio:'pipe'});}catch(e){bad++;console.log('SÖZDİZİMİ HATASI:\n'+String(e.stderr||e.message).slice(0,1500));}
  // üst düzey tanım çakışmaları (function/const/let/class aynı ad iki kez)
  const seen={};
  for(const f of jsFiles){const t=rd(path.join(S,'js',f));for(const m of t.matchAll(/^(?:async\s+)?(?:function\*?|const|let|class)\s+([A-Za-z_$][\w$]*)/gm)){const n=m[1];(seen[n]=seen[n]||[]).push(f);}}
  const dup=Object.entries(seen).filter(([,v])=>v.length>1);
  for(const [n,v] of dup){bad++;console.log(`ÇAKIŞMA: ${n} → ${v.join(', ')}`);}
  if(!bad)console.log(`denetim tamam · ${Object.keys(seen).length} üst düzey tanım · çakışma yok`);
}
if(bad){process.exitCode=1;console.log('index.html yazılmadı');}
else{fs.writeFileSync(path.join(R,'index.html'),out);console.log(`index.html yazıldı · ${(out.length/1048576).toFixed(2)} MB · ${jsFiles.length} js + ${cssFiles.length} css parçası`);}
