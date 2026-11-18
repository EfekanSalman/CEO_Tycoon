/* ============================== FACILITY GRID ============================== */
/* Capitalism 2 tarzı tesis ızgarası, gerçek malzeme akışıyla.
   Satın alma (girdi) → üretim hatları → sevkiyat (çıktı). Bitişik hatlar birbirine malzeme aktarır (bant): birbirine bitişik
   hatlar bir hat grubu oluşturur. Bir grup yalnızca bir satın alma ve bir sevkiyat birimine bitişikse çalışır; her satın alma
   ve her sevkiyat birimi en çok FG_FEED hatta hizmet eder. Bağlantısız ya da kapasitesi aşılan hatlar boşta kalır.
   Kalite kontrol: hatlara bitişikse hata oranı −0,6 puan. Eğitim: işçilik −%6. Bakım: işletme gideri −%8.
   f.lines hat sayısıdır (boştakiler dahil). Eski kayıtların fabrikaları bir kez akışa uygun yerleştirilir (f.fv=2). */
const FG_DIM={asm:[5,4],fab:[4,3]},FG_OLD={asm:[4,3],fab:[3,3]},FG_FEED=4;
const FU={line:{n:(LANG_EN?"Production line":'Üretim hattı'),s:(LANG_EN?"Line":'Hat'),d:(LANG_EN?"Makes the product. Adjacent lines pass materials to each other.":'Ürünü üretir. Bitişik hatlar malzemeyi birbirine aktarır.')},
  buy:{n:(LANG_EN?"Purchasing":'Satın alma'),s:LANG_EN?'PU':'SA',f:0.35,d:(LANG_EN?"Input: supplies materials to the adjacent line group (up to 4 lines); lines directly next to it produce 15% more.":'Girdi: bitişik hat grubuna malzeme sağlar (en çok 4 hat); doğrudan bitişik hatlar %15 daha çok üretir.')},
  ship:{n:(LANG_EN?"Shipping":'Sevkiyat'),s:LANG_EN?'SH':'SV',f:0.35,d:(LANG_EN?"Output: carries the adjacent line group's products to the warehouse (up to 4 lines).":'Çıktı: bitişik hat grubunun ürününü depoya taşır (en çok 4 hat).')},
  qc:{n:(LANG_EN?"Quality control":'Kalite kontrol'),s:LANG_EN?'QC':'KK',f:0.6,d:(LANG_EN?"Lowers the defect rate by 0.6 points when next to lines (at most 3 units).":'Hatlara bitişikse hata oranı 0,6 puan düşer (en çok 3 birim).')},
  train:{n:(LANG_EN?"Training center":'Eğitim merkezi'),s:(LANG_EN?"TR":'EĞ'),f:0.4,d:(LANG_EN?"Cuts labor cost by 6% (at most 2 units).":'İşçilik maliyeti %6 düşer (en çok 2 birim).')},
  maint:{n:(LANG_EN?"Maintenance shop":'Bakım atölyesi'),s:LANG_EN?'MT':'BK',f:0.35,d:(LANG_EN?"Cuts operating cost by 8% (at most 2 units).":'İşletme gideri %8 düşer (en çok 2 birim).')}};
const FU_SUP=['buy','ship','qc','train','maint'];
const fgDim=f=>FG_DIM[f.type]||[4,3];
const fgNbW=(W,H,i)=>{const x=i%W,y=Math.floor(i/W),o=[];if(x>0)o.push(i-1);if(x<W-1)o.push(i+1);if(y>0)o.push(i-W);if(y<H-1)o.push(i+W);return o;};
const fgNb=(f,i)=>{const [W,H]=fgDim(f);return fgNbW(W,H,i);};
/* boş bir ızgaraya akışa uygun yerleşim: hatlar ortada bitişik blok, satın alma solda, sevkiyat sağda, diğerleri kalan yerlerde */
function fgLayout(f,lines,extra){const [W,H]=fgDim(f),N=W*H,g=new Array(N).fill(null),dropped=[];
  const zone=[];for(let y=0;y<H;y++)for(let x=1;x<W-1;x++)zone.push(y*W+x);
  for(let k=0;k<lines&&k<zone.length;k++)g[zone[k]]='line';
  const nb=i=>fgNbW(W,H,i),adj=()=>[...new Set(g.flatMap((x,i)=>x==='line'?nb(i):[]))].filter(i=>!g[i]);
  const need=Math.ceil(Math.max(1,lines)/FG_FEED);
  for(const [t,dir] of [['buy',1],['ship',-1]])for(let k=0;k<need;k++){const c=adj().sort((a,b)=>dir*((a%W)-(b%W))||a-b)[0];if(c==null)break;g[c]=t;}
  for(const t of extra){const free=g.map((x,i)=>x?-1:i).filter(i=>i>=0);if(!free.length){dropped.push(t);continue;}
    const c=t==='qc'?(adj()[0]??free[0]):free[free.length-1];g[c]=t;}
  return {g,dropped};}
function fgMigrate(f){const extra=[];if(Array.isArray(f.g))for(const x of f.g)if(x==='qc'||x==='train'||x==='maint')extra.push(x);
  const {g,dropped}=fgLayout(f,f.lines||1,extra);f.g=g;f.fv=2;
  if(dropped.length&&typeof G!=='undefined'&&G&&G.factories&&G.factories.includes(f)){const back=dropped.reduce((a,t)=>a+fuCost(f,t)*0.4,0);G.cash+=back;
    news((LANG_EN?`${f.name}: ${dropped.length} support units were removed because there was no room in the new flow layout (+${money(back)}).`:`${f.name}: yeni akış düzeninde yer kalmadığı için ${dropped.length} destek birimi kaldırıldı (+${money(back)}).`),'');}}
function facGrid(f){if(f.fv!==2)fgMigrate(f);const [W,H]=fgDim(f),N=W*H;if(!f.g||f.g.length!==N){const g=new Array(N).fill(null);if(f.g)f.g.slice(0,N).forEach((x,i)=>g[i]=x);f.g=g;}
  let n=f.g.filter(x=>x==='line').length;
  while(n<f.lines){const p=fgPlanLine(f,true);if(!p)break;f.g[p.i]='line';n++;}
  for(let i=N-1;i>=0&&n>f.lines;i--)if(f.g[i]==='line'){f.g[i]=null;n--;}
  return f.g;}
const fgCnt=(f,t)=>facGrid(f).filter(x=>x===t).length;
const facFree=f=>facGrid(f).filter(x=>!x).length;
/* akış: hat grupları, satın alma/sevkiyat kapasitesinin gruplara paylaştırılması, çalışan hatlar */
const FGF=new WeakMap();
function fgFlow(f){const g=facGrid(f),sig=g.join(',');let c=FGF.get(f);if(c&&c.sig===sig)return c;c=fgFlowOf(f,g);c.sig=sig;FGF.set(f,c);return c;}
function fgFlowOf(f,g){const comps=[],seen=new Set();
  g.forEach((x,i)=>{if(x!=='line'||seen.has(i))return;const cells=[],q=[i];seen.add(i);while(q.length){const a=q.shift();cells.push(a);for(const b of fgNb(f,a))if(g[b]==='line'&&!seen.has(b)){seen.add(b);q.push(b);}}
    const near=t=>[...new Set(cells.flatMap(a=>fgNb(f,a)).filter(b=>g[b]===t))];comps.push({cells,buys:near('buy'),ships:near('ship'),fed:0,shipped:0});});
  comps.sort((a,b)=>b.cells.length-a.cells.length);
  for(const t of ['buy','ship']){const rem={};g.forEach((x,i)=>{if(x===t)rem[i]=FG_FEED;});
    for(const C of comps){let need=t==='buy'?C.cells.length:C.fed;let got=0;for(const u of (t==='buy'?C.buys:C.ships)){const k=Math.min(need-got,rem[u]);if(k>0){rem[u]-=k;got+=k;}if(got>=need)break;}if(t==='buy')C.fed=got;else C.shipped=got;}}
  const act=new Set();let n=0;
  for(const C of comps){const k=Math.min(C.fed,C.shipped);n+=k;
    // çalışan hatlar: satın almaya en yakın olanlardan başlayarak (görünüm için)
    const start=C.cells.filter(a=>fgNb(f,a).some(b=>g[b]==='buy')),order=[],vis=new Set(start),q=[...start];while(q.length){const a=q.shift();order.push(a);for(const b of fgNb(f,a))if(g[b]==='line'&&!vis.has(b)){vis.add(b);q.push(b);}}
    for(const a of order.slice(0,k))act.add(a);
    C.why=!C.buys.length?'nobuy':!C.ships.length?'noship':k<C.cells.length?(C.fed<C.cells.length?'buycap':'shipcap'):'';}
  let eff=0,near=0;for(const a of act){const b=fgNb(f,a).some(j=>g[j]==='buy');eff+=b?1.15:1;if(b)near++;}
  return {comps,act,n,eff,near,idle:g.filter(x=>x==='line').length-n};}
/* kapasite: çalışan hatlar; satın almaya doğrudan bitişik olanlar %15 fazla (malzemeye yakın) */
function facLineEff(f){return fgFlow(f).eff;}
/* yeni hat için yer: mevcut hat grubuna bitişik boş hücre; grup yoksa ortadaki ilk boş hücre.
   onlyLine=false ise eksik satın alma/sevkiyat birimlerini de planlar (Hat ekle düğmesi) */
function fgPlanLine(f,onlyLine){const g=f.g,[W,H]=fgDim(f),N=W*H;if(!g)return null;
  const empty=[];for(let i=0;i<N;i++)if(!g[i])empty.push(i);if(!empty.length)return null;
  const mid=i=>{const x=i%W;return x>0&&x<W-1;};
  const touch=i=>fgNb(f,i).filter(j=>g[j]==='line').length;
  const i=empty.filter(mid).sort((a,b)=>touch(b)-touch(a)||a-b)[0]??empty.sort((a,b)=>touch(b)-touch(a)||a-b)[0];
  if(onlyLine)return {i,add:[]};
  const g2=g.slice();g2[i]='line';const add=[];
  for(let k=0;k<4;k++){const fl=fgFlowOf(f,g2),C=fl.comps.find(c=>c.cells.includes(i));if(!C||!C.why)break;
    const t=C.why==='nobuy'||C.why==='buycap'?'buy':'ship';const cand=[...new Set(C.cells.flatMap(a=>fgNb(f,a)))].filter(j=>!g2[j]).sort((a,b)=>t==='buy'?(a%W)-(b%W):(b%W)-(a%W))[0];
    if(cand==null)break;g2[cand]=t;add.push({i:cand,t});}
  return {i,add};}
function fgLineCost(f){const p=fgPlanLine(f,false);if(!p)return null;const ft=FTYPES[f.type];return {p,cost:ft.lineCost*FREG[f.region].build*infl()+p.add.reduce((a,x)=>a+fuCost(f,x.t),0)};}
function facQc(f){if(!f)return 0;const g=facGrid(f);let n=0;g.forEach((x,i)=>{if(x==='qc'&&fgNb(f,i).some(j=>g[j]==='line'))n++;});return 0.006*Math.min(3,n);}
const facTrain=f=>f&&f.g?1-0.06*Math.min(2,fgCnt(f,'train')):1;
const facUpk=f=>f&&f.g?(1+0.03*['qc','train','maint'].reduce((a,t)=>a+fgCnt(f,t),0)+0.01*(fgCnt(f,'buy')+fgCnt(f,'ship')))*(1-0.08*Math.min(2,fgCnt(f,'maint'))):1;
const fuCost=(f,t)=>(t==='line'?1:FU[t].f)*FTYPES[f.type].lineCost*FREG[f.region].build*infl();
function fgAct(a,ds){const f=fac(ds.id);if(!f)return;const g=facGrid(f),i=+ds.i;
  if(a==='fgcell'){UI.fgSel=UI.fgSel&&UI.fgSel.f===f.id&&UI.fgSel.i===i?null:{f:f.id,i};return;}
  if(a==='fgset'){const t=ds.t;if(!FU[t]||g[i])return;if(t==='line'&&f.lines>=FTYPES[f.type].maxLines)return;const c=fuCost(f,t);
    if(G.cash<c){showToast((LANG_EN?"Not enough cash for this unit.":'Bu birim için yeterli nakit yok.'),'bad');return;}spend(c,'capex');f.cost=(f.cost||0)+c;g[i]=t;if(t==='line')f.lines++;
    news((LANG_EN?`${f.name}: ${FU[t].n.toLocaleLowerCase(LOC)} built.`:`${f.name}: ${FU[t].n.toLocaleLowerCase(LOC)} kuruldu.`),'');UI.fgSel=null;return;}
  if(a==='fgdel'){const t=g[i];if(!t)return;if(t==='line'&&f.lines<=1){showToast((LANG_EN?"A factory must keep at least one line.":'Fabrikada en az bir hat kalmalı.'),'bad');return;}const back=fuCost(f,t)*0.4;
    g[i]=null;if(t==='line')f.lines--;G.cash+=back;news((LANG_EN?`${f.name}: ${FU[t].n.toLocaleLowerCase(LOC)} removed (+${money(back)}).`:`${f.name}: ${FU[t].n.toLocaleLowerCase(LOC)} kaldırıldı (+${money(back)}).`),'');UI.fgSel=null;}}
/* Hat ekle: hattı gruba bitişik koyar, gerekirse satın alma/sevkiyat birimini de ekler */
function fgAddLine(f){const ft=FTYPES[f.type];if(f.lines>=ft.maxLines)return false;facGrid(f);const L=fgLineCost(f);if(!L){showToast((LANG_EN?"No empty cell in the factory.":'Fabrikada boş hücre yok.'),'bad');return false;}
  if(G.cash<L.cost){showToast((LANG_EN?"Not enough cash for a new line.":'Yeni hat için yeterli nakit yok.'),'bad');return false;}spend(L.cost,'capex');f.cost=(f.cost||0)+L.cost;
  f.g[L.p.i]='line';for(const x of L.p.add)f.g[x.i]=x.t;f.lines++;
  news((LANG_EN?`${f.name}: production line ${f.lines} installed${L.p.add.length?` (${L.p.add.map(x=>FU[x.t].n.toLocaleLowerCase(LOC)).join(', ')} birimiyle)`:''}.`:`${f.name}: ${f.lines}. üretim hattı kuruldu${L.p.add.length?` (${L.p.add.map(x=>FU[x.t].n.toLocaleLowerCase(LOC)).join(', ')} birimiyle)`:''}.`));return true;}
const FG_WHY={nobuy:(LANG_EN?"not connected to purchasing":'satın almaya bağlı değil'),noship:(LANG_EN?"not connected to shipping":'sevkiyata bağlı değil'),buycap:(LANG_EN?"not enough purchasing capacity":'satın alma kapasitesi yetmiyor'),shipcap:(LANG_EN?"not enough shipping capacity":'sevkiyat kapasitesi yetmiyor')};
function vFacGrid(f){const g=facGrid(f),[W]=fgDim(f),sel=UI.fgSel&&UI.fgSel.f===f.id?UI.fgSel.i:-1,ft=FTYPES[f.type],fl=fgFlow(f);
  const cells=g.map((x,i)=>{const st=x==='line'?(fl.act.has(i)?' fg-act':' fg-idle'):'';
    return `<button class="fg-c ${x?'fg-'+x:'fg-e'}${st}${i===sel?' on':''}" data-act="fgcell" data-id="${f.id}" data-i="${i}" aria-pressed="${i===sel}" aria-label="${esc(x?FU[x].n:(LANG_EN?"Empty cell":'Boş hücre'))}${x==='line'?(fl.act.has(i)?(LANG_EN?", running":', çalışıyor'):(LANG_EN?", idle":', boşta')):''}"><b>${x?FU[x].s:'+'}</b>${x==='line'&&!fl.act.has(i)?(LANG_EN?"<small>idle</small>":'<small>boşta</small>'):''}</button>`;}).join('');
  let menu='';if(sel>=0){const x=g[sel];
    menu=x?(LANG_EN?`<div class="fg-m"><span class="small"><b>${esc(FU[x].n)}</b> · ${esc(FU[x].d)}</span><button class="btn sm ghost" data-act="fgdel" data-id="${f.id}" data-i="${sel}">Remove (+${money(fuCost(f,x)*0.4)})</button></div>`:`<div class="fg-m"><span class="small"><b>${esc(FU[x].n)}</b> · ${esc(FU[x].d)}</span><button class="btn sm ghost" data-act="fgdel" data-id="${f.id}" data-i="${sel}">Kaldır (+${money(fuCost(f,x)*0.4)})</button></div>`)
      :`<div class="fg-m">${['line',...FU_SUP].map(t=>{const dis=(t==='line'&&f.lines>=ft.maxLines)||G.cash<fuCost(f,t);return `<button class="btn sm" data-act="fgset" data-id="${f.id}" data-i="${sel}" data-t="${t}" ${dis?'disabled':''} title="${esc(FU[t].d)}">${esc(FU[t].n)} · ${money(fuCost(f,t))}</button>`;}).join('')}</div>`;}
  const nl=f.lines,qc=facQc(f),tr=fgCnt(f,'train'),mt=fgCnt(f,'maint'),why=[...new Set(fl.comps.filter(c=>c.why).map(c=>FG_WHY[c.why]))];
  const sum=[(LANG_EN?`lines running <b>${fl.n}/${nl}</b>`:`çalışan hat <b>${fl.n}/${nl}</b>`),fl.near?(LANG_EN?`${fl.near} lines next to purchasing +15%`:`satın almaya bitişik ${fl.near} hat +%15`):'',fl.idle?(LANG_EN?`<span class="neg">${fl.idle} idle: ${why.join(', ')}</span>`:`<span class="neg">${fl.idle} hat boşta: ${why.join(', ')}</span>`):'',qc?(LANG_EN?`defects −${fx(qc*100,1)} points`:`hata −${fx(qc*100,1)} puan`):'',tr?(LANG_EN?`labor −${pctN(Math.min(2,tr)*6)}`:`işçilik −${pctN(Math.min(2,tr)*6)}`):'',mt?(LANG_EN?`maintenance −${pctN(Math.min(2,mt)*8)} costs`:`bakım −${pctN(Math.min(2,mt)*8)} gider`):''].filter(Boolean).join(' · ');
  return (LANG_EN?`<div class="fg-w"><div class="fg" style="grid-template-columns:repeat(${W},minmax(0,1fr))">${cells}</div>${menu}<div class="small muted">${sum}</div><div class="small muted fg-lg"><span><i class="fg-k fg-buy"></i>Purchasing (input)</span><span><i class="fg-k fg-line fg-act"></i>Running line</span><span><i class="fg-k fg-ship"></i>Shipping (output)</span><span>Materials flow between adjacent lines; each purchasing and shipping unit serves at most ${FG_FEED} lines.</span></div></div>`:`<div class="fg-w"><div class="fg" style="grid-template-columns:repeat(${W},minmax(0,1fr))">${cells}</div>${menu}<div class="small muted">${sum}</div><div class="small muted fg-lg"><span><i class="fg-k fg-buy"></i>Satın alma (girdi)</span><span><i class="fg-k fg-line fg-act"></i>Çalışan hat</span><span><i class="fg-k fg-ship"></i>Sevkiyat (çıktı)</span><span>Malzeme bitişik hatlar arasında akar; her satın alma ve sevkiyat birimi en çok ${FG_FEED} hatta hizmet eder.</span></div></div>`);}
