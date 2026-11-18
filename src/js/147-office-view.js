/* ============================== OFFICE VIEW ============================== */
const OFF_LAYOUT=[{W:7,H:6,f:'concrete'},{W:10,H:10,f:'wood'},{W:13,H:13,f:'wood'},{W:16,H:14,f:'carpet'},{W:18,H:14,f:'tile'}];
const ROLE_ORDER=['soft','design','hw','res','mkt','ops','sup','sec'];
const SKINS=['#F1C7A5','#E0AC85','#C68B62','#9C6644','#6F4A33'];
const HAIRS=['#2B211C','#4A3226','#8A5A35','#C9A06A','#1C1C1C','#7A2E22','#9AA0A6','#5A3B2E'];
const FURN={
  plant:{n:(LANG_EN?"Potted plant":'Saksı bitkisi'),w:1,d:1,cost:600,mor:0.6,fx:(LANG_EN?"Morale +0.6":'Moral +0,6')},
  tree:{n:(LANG_EN?"Large plant":'Büyük bitki'),w:1,d:1,cost:1800,mor:1.2,fx:(LANG_EN?"Morale +1.2":'Moral +1,2')},
  water:{n:(LANG_EN?"Water cooler":'Su sebili'),w:1,d:1,cost:2000,en:0.06,mor:0.3,fx:(LANG_EN?"Energy +0.06/day, morale +0.3":'Enerji +0,06/gün, moral +0,3'),use:true,drink:true},
  espresso:{n:(LANG_EN?"Espresso machine":'Espresso makinesi'),w:1,d:1,cost:6000,en:0.12,mor:1,fx:(LANG_EN?"Energy +0.12/day, morale +1":'Enerji +0,12/gün, moral +1'),use:true,drink:true},
  shelf:{n:(LANG_EN?"Bookshelf":'Kitaplık'),w:1,d:1,cost:3500,skill:0.05,fx:(LANG_EN?"Skill growth +5%":'Yetenek gelişimi +%5')},
  board:{n:(LANG_EN?"Whiteboard":'Beyaz tahta'),w:1,d:1,cost:1500,proj:0.015,fx:(LANG_EN?"Project speed +1.5%":'Proje hızı +%1,5')},
  art:{n:(LANG_EN?"Sculpture":'Heykel'),w:1,d:1,cost:9000,mor:2,fx:(LANG_EN?"Morale +2":'Moral +2')},
  couch:{n:(LANG_EN?"Couch":'Kanepe'),w:2,d:1,cost:4500,en:0.1,mor:1,fx:(LANG_EN?"Energy +0.1/day, morale +1":'Enerji +0,1/gün, moral +1'),use:true},
  foos:{n:(LANG_EN?"Foosball table":'Langırt masası'),w:2,d:1,cost:8000,mor:2.5,en:0.05,fx:(LANG_EN?"Morale +2.5, energy +0.05/day":'Moral +2,5, enerji +0,05/gün'),use:true},
  tv:{n:(LANG_EN?"Game corner":'Oyun köşesi'),w:2,d:1,cost:12000,mor:3,fx:(LANG_EN?"Morale +3":'Moral +3'),use:true},
  aqua:{n:(LANG_EN?"Aquarium":'Akvaryum'),w:2,d:1,cost:16000,mor:3.5,fx:(LANG_EN?"Morale +3.5":'Moral +3,5')},
  pod:{n:(LANG_EN?"Sleep pod":'Uyku kapsülü'),w:1,d:2,cost:22000,en:0.3,fx:(LANG_EN?"Energy +0.3/day":'Enerji +0,3/gün'),use:true},
  meet:{n:(LANG_EN?"Meeting room":'Toplantı odası'),w:3,d:3,cost:45000,mor:2,fx:(LANG_EN?"Enables meetings, morale +2":'Toplantı yapılabilir, moral +2'),room:true,minOffice:1,max:1},
  r_soft:{n:(LANG_EN?"Focus room":'Odak odası'),w:3,d:3,cost:60000,mor:1,dept:'soft',room:true,minOffice:1,max:1,fx:(LANG_EN?"+10% output for developers on this floor, morale +2":'Bu kattaki yazılımcılara +%10 üretim, moral +2')},
  r_design:{n:(LANG_EN?"Design studio":'Tasarım stüdyosu'),w:3,d:3,cost:60000,mor:1,dept:'design',room:true,minOffice:1,max:1,fx:(LANG_EN?"+10% output for designers on this floor; product quality +2%":'Bu kattaki tasarımcılara +%10 üretim; ürün kalitesi +%2')},
  r_hw:{n:(LANG_EN?"Prototype workshop":'Prototip atölyesi'),w:3,d:3,cost:90000,mor:1,dept:'hw',room:true,minOffice:1,max:1,fx:(LANG_EN?"+10% output for hardware engineers on this floor; hardware quality +3%":'Bu kattaki donanımcılara +%10 üretim; donanım kalitesi +%3')},
  r_res:{n:(LANG_EN?"R&D lab":'Ar-Ge laboratuvarı'),w:3,d:3,cost:120000,mor:1,dept:'res',room:true,minOffice:1,max:1,fx:(LANG_EN?"+15% research points for researchers on this floor":'Bu kattaki araştırmacılara +%15 araştırma puanı')},
  r_mkt:{n:(LANG_EN?"Video studio":'Çekim stüdyosu'),w:3,d:3,cost:70000,mor:1,dept:'mkt',room:true,minOffice:1,max:1,fx:(LANG_EN?"+10% for marketers on this floor; ad campaigns more effective":'Bu kattaki pazarlamacılara +%10; reklam kampanyaları daha etkili')},
  r_sup:{n:(LANG_EN?"Call center":'Çağrı merkezi'),w:3,d:3,cost:50000,mor:1,dept:'sup',room:true,minOffice:1,max:1,fx:(LANG_EN?"+10% ticket resolution for support specialists on this floor":'Bu kattaki destek uzmanlarına +%10 talep çözme')},
  r_sec:{n:(LANG_EN?"Security operations center":'Güvenlik operasyon merkezi'),w:3,d:3,cost:90000,mor:1,dept:'sec',room:true,minOffice:1,max:1,fx:(LANG_EN?"+10% protection for security specialists on this floor":'Bu kattaki güvenlik uzmanlarına +%10 koruma')},
  r_ops:{n:(LANG_EN?"Control center":'Kontrol merkezi'),w:3,d:3,cost:80000,mor:1,dept:'ops',room:true,minOffice:1,max:1,fx:(LANG_EN?"+10% for operations staff on this floor; lead times −10%":'Bu kattaki operasyoncılara +%10; teslim süreleri −%10')},
};
const FX_CAP={mor:12,en:0.6,skill:0.25,proj:0.08};
const MEET={
  plan:{n:(LANG_EN?"Planning meeting":'Planlama toplantısı'),days:6,d:(LANG_EN?"The project team meets for 6 days; project speed +15% for the next 45 days.":'Proje ekibi 6 gün toplanır; sonraki 45 gün proje hızı +%15.')},
  brain:{n:(LANG_EN?"Brainstorm":'Beyin fırtınası'),days:8,d:(LANG_EN?"The project team generates ideas for 8 days; product quality +8%. Once per project.":'Proje ekibi 8 gün fikir üretir; ürünün kalitesi +%8. Proje başına bir kez.')},
  all:{n:(LANG_EN?"All-hands meeting":'Şirket toplantısı'),days:4,d:(LANG_EN?"Everyone meets for 4 days; morale +8 for the whole team. Once every 45 days.":'Herkes 4 gün toplanır; tüm ekibe moral +8. 45 günde bir.')},
  one:{n:(LANG_EN?"One-on-one":'Birebir görüşme'),days:3,d:(LANG_EN?"You spend 3 days with one employee; morale +12. Once every 30 days per person.":'Bir çalışanla 3 gün ilgilenirsin; moral +12. Kişi başına 30 günde bir.')},
};
const OF_PAL={
  day:{wallL:'#D3D9E3',wallR:'#E4E9F0',cap:'#AFB9C8',slabL:'#B4BDCB',slabR:'#A3ADBD',
    floor:{concrete:['#D3D2CC','#CBCAC4'],wood:['#E3CBA6','#DAC199'],carpet:['#CCD5E4','#C3CDDF'],tile:['#E9EDF0','#DFE4E8']},
    deskT:'#F7F4EF',deskL:'#CBBFAF',deskR:'#B6AA99',mon:'#2B303B',monR:'#3A404D',scrOff:'#4A5160',scrOn:'#E6F3FF',key:'#9AA3B2',
    chair:'#3B4252',chairT:'#4F586B',sky:'#BFE2FF',sky2:'#EAF6FF',frame:'#A8B3C3',door:'#9C7B5B',doorD:'#7E6248',board:'#FFFFFF',
    plant:'#3E9B5B',plant2:'#5DBB78',pot:'#C0703F',potT:'#D88A57',sofa:'#5B7DB1',sofaT:'#7193C6',rug:'#E7D5BF',
    coffee:'#3A3F4A',coffeeT:'#5A606C',rack:'#2A2F3A',rackT:'#3C4350',shadow:'rgba(20,32,58,.16)',pants:'#3A4256',stain:'rgba(60,60,55,.10)',stripe:'#C3C9D2',glow:null,tip:'#14203A',tipText:'#FFFFFF',
    woodT:'#C79A68',woodL:'#A57A4E',woodR:'#8E6741',felt:'#3F8F5A',glass:'rgba(170,205,240,.30)',glassF:'#8FA3BF',roomFloor:'#CBD7E8',water:'#8FD0F5',metal:'#7D8796',cushion:'#E28A5B',ok:'rgba(43,138,62,.38)',bad:'rgba(201,42,42,.38)'},
  night:{wallL:'#1A2D4B',wallR:'#203658',cap:'#2D4670',slabL:'#14243D',slabR:'#101E34',
    floor:{concrete:['#2B3445','#273040'],wood:['#3B3327','#352D22'],carpet:['#25334B','#212E45'],tile:['#2C3B53','#28364D']},
    deskT:'#46536E',deskL:'#2E3950',deskR:'#262F43',mon:'#0D121C',monR:'#1A2130',scrOff:'#1C2433',scrOn:'#163A63',key:'#3D475C',
    chair:'#121824',chairT:'#1E2636',sky:'#0B1730',sky2:'#13254A',frame:'#33507A',door:'#5E4A38',doorD:'#4A3A2C',board:'#C8D2E2',
    plant:'#2F7A48',plant2:'#3F9A5D',pot:'#8A4E2C',potT:'#A35F38',sofa:'#3D5A8A',sofaT:'#4E6EA3',rug:'#3A3346',
    coffee:'#151A24',coffeeT:'#262D3A',rack:'#0E131C',rackT:'#1D2431',shadow:'rgba(0,0,0,.35)',pants:'#1D2333',stain:'rgba(0,0,0,.18)',stripe:'#2B4167',glow:'rgba(120,180,255,.16)',tip:'#E3ECF8',tipText:'#0A1D35',
    woodT:'#7A5B3C',woodL:'#5E4530',woodR:'#4F3A28',felt:'#2E6B44',glass:'rgba(110,160,230,.17)',glassF:'#4B6A96',roomFloor:'#23324A',water:'#2F6E9C',metal:'#5A6478',cushion:'#9C5A3A',ok:'rgba(91,208,122,.32)',bad:'rgba(255,112,112,.34)'},
};
const OV={chars:new Map(),deskOf:new Map(),parts:[],hits:[],hover:null,layoutKey:'',desks:[],inited:false,last:0,prodCount:-1};
const RM=()=>reduceMotion();
function ofColors(){
  const now=performance.now();if(OV.col&&now-OV.colT<1000)return OV.col;
  const root=document.documentElement,th=root.getAttribute('data-theme');
  const dark=th==='dark'||(th!=='light'&&window.matchMedia&&matchMedia((LANG_EN?"(prefers-color-scheme: dark)":'(prefers-color-scheme: dark)')).matches);
  const cs=getComputedStyle(root),v=n=>cs.getPropertyValue(n).trim();
  OV.col={...OF_PAL[dark?'night':'day'],dark,accent:v('--accent'),
    role:{soft:v('--pt-soft'),design:v('--pt-design'),hw:v('--pt-hw'),res:v('--pt-res'),mkt:v('--pt-mkt'),ops:v('--pt-ops'),sup:v('--pt-sup'),sec:v('--pt-sec')}};
  OV.colT=now;return OV.col;
}
function officeLayout(){
  const L=OFF_LAYOUT[G.office],per=Math.min(OFFICES[G.office].cap,48),fls=G.floors||1,key=G.office+':'+per+':'+fls;
  if(OV.layoutKey===key)return;
  const desks=[];
  for(let fl=0;fl<fls;fl++){let k=0;for(let row=1;row<L.H-1&&k<per;row+=2)for(let x=1;x<=L.W-4&&k<per;x++,k++)desks.push({x:x+0.5,y:row+0.35,row,fl});}
  OV.desks=desks;OV.layoutKey=key;OV.L=L;OV.cap=desks.length;OV.chars.clear();OV.inited=false;OV.parts=[];OV.nav={};OV.idleC={};
  if(UI.floor==null||UI.floor>=fls)UI.floor=0;
}
const empSort=(a,b)=>(b.founder?1:0)-(a.founder?1:0)||ROLE_ORDER.indexOf(a.role)-ROLE_ORDER.indexOf(b.role)||a.id-b.id;
function deskAssign(){
  const emps=G.emps.slice().sort(empSort),used=new Set(),out=[];
  const was=new Map(emps.map(e=>[e,e.desk]));
  for(const e of emps){if(e.desk!=null&&e.desk<OV.cap&&!used.has(e.desk))used.add(e.desk);else e.desk=null;}
  for(const e of emps){
    if(e.desk==null){
      if(used.size>=OV.cap)continue;
      const same=emps.filter(o=>o!==e&&o.role===e.role&&o.desk!=null).map(o=>OV.desks[o.desk]);
      const n=same.length,cx=n?same.reduce((a,d)=>a+d.x,0)/n:0,cy=n?same.reduce((a,d)=>a+d.y,0)/n:0,cf=n?Math.round(same.reduce((a,d)=>a+d.fl,0)/n):0;
      let best=-1,bd=1e9;
      for(let i=0;i<OV.cap;i++){if(used.has(i))continue;const D=OV.desks[i],d=n?Math.hypot(D.x-cx,D.y-cy)+Math.abs(D.fl-cf)*100:i;if(d<bd){bd=d;best=i;}}
      e.desk=best;used.add(best);
    }
    out.push([e,e.desk]);
  }
  for(const [e,d] of was)if((e.desk==null?null:e.desk)!==(d==null?null:d)){DESKV++;break;}
  return out;
}
const perFloor=()=>Math.min(OFFICES[G.office].cap,48);
const empFloor=e=>e&&e.desk!=null?Math.floor(e.desk/perFloor()):0;
const hasElev=()=>(OFFICES[G.office].maxF||1)>1;
const elevTile=fl=>{const H=OFF_LAYOUT[G.office].H;return fl===0?[0,H-4]:[0,H-2];};
const floorName=fl=>fl===0?(LANG_EN?"Ground floor":'Zemin kat'):(LANG_EN?`Floor ${fl}`:`${fl}. kat`);
function moveFloor(id,fl){
  const e=G.emps.find(x=>x.id===id);if(!e)return;officeLayout();
  const per=perFloor(),used=new Set(G.emps.map(o=>o.desk));
  for(let i=fl*per;i<(fl+1)*per&&i<OV.cap;i++)if(!used.has(i)){e.desk=i;DESKV++;news((LANG_EN?`${e.name} moved to ${floorName(fl)}.`:`${e.name} ${floorName(fl)} katına taşındı.`));UI.force=true;render();return;}
  showToast((LANG_EN?`${floorName(fl)} is full.`:`${floorName(fl)} dolu.`),'bad');
}
function isWorking(e){if(e.leave)return false;if(['soft','design','hw'].includes(e.role))return !!e.proj||depActive(e);if(e.role==='res')return !!G.res.active;return true;}
const inMeeting=e=>!!(G.meeting&&G.meeting.att.includes(e.id));
function empTask(e){
  if(e.leave)return (LANG_EN?`${e.leave.type==='train'?COURSES[e.leave.k].n:LEAVE_N[e.leave.type]} · ${e.leave.until-G.day} days`:`${e.leave.type==='train'?COURSES[e.leave.k].n:LEAVE_N[e.leave.type]} · ${e.leave.until-G.day} gün`);
  if(inMeeting(e))return (LANG_EN?`${MEET[G.meeting.t].n} · ${G.meeting.until-G.day} days`:`${MEET[G.meeting.t].n} · ${G.meeting.until-G.day} gün`);
  if(typeof e.proj==='string'){const p=prod(+e.proj.slice(1));return p?(LANG_EN?"Upkeep: ":'Bakım: ')+p.name:(LANG_EN?"Idle":'Boşta');}
  if(['soft','design','hw'].includes(e.role)){const pr=G.projects.find(p=>p.id===e.proj);if(pr){const w=pr.cw&&pr.cw[e.role];return w&&w.c&&COMP[w.c]?`${pr.name} · ${COMP[w.c].n}`:pr.name;}if(depActive(e)){const c=depOf().w[e.role].c||depPick(e.role);return (LANG_EN?`Depot: ${COMP[c].n}`:`Depo: ${COMP[c].n}`);}return (LANG_EN?"Idle":'Boşta');}
  if(e.role==='res')return G.res.active?RESD[G.res.active.id].n:(LANG_EN?"Research pending":'Araştırma bekliyor');
  if(e.role==='sup')return (LANG_EN?"Customer support":'Müşteri desteği');
  if(e.role==='sec')return cyberDown()?(LANG_EN?"Responding to an attack":'Saldırıya müdahale ediyor'):(LANG_EN?"Threat monitoring":'Tehdit izleme');
  return e.role==='mkt'?(LANG_EN?"Brand awareness":'Marka bilinirliği'):(LANG_EN?"Supply and manufacturing":'Tedarik ve üretim');
}

/* ---------- furniture & navigation ---------- */
const fdimT=(t,r)=>{const F=FURN[t];return r?[F.d,F.w]:[F.w,F.d];};
const fdim=f=>fdimT(f.t,f.r);
const roomOf=fl=>G.furn.find(f=>f.t==='meet'&&(fl==null||(f.fl||0)===fl));
function furnFx(fl){
  const k=G.furnVer+':'+G.office+':'+fl;OV.fxc=OV.fxc||{};if(OV.fxc[k])return OV.fxc[k];
  if(Object.keys(OV.fxc).length>40)OV.fxc={};
  const s={mor:0,en:0,skill:0,proj:0};
  for(const f of G.furn){if(fl!=null&&(f.fl||0)!==fl)continue;const F=FURN[f.t];for(const q in s)s[q]+=F[q]||0;}
  return OV.fxc[k]={mor:Math.min(FX_CAP.mor,s.mor),en:Math.min(FX_CAP.en,s.en),skill:Math.min(FX_CAP.skill,s.skill),proj:Math.min(FX_CAP.proj,s.proj),raw:s};
}
function fixedTiles(){
  const L=OFF_LAYOUT[G.office],W=L.W,H=L.H,t=[[W-2,0],[W-1,0],[W-3,1],[W-2,1],[W-1,3],[0,0]];
  for(let x=W-2;x<W;x++)for(let y=H-3;y<H;y++)t.push([x,y]);
  if(G.office>=2)t.push([W-4,0],[0,H-1]);
  if(hasElev())t.push([0,1],[0,2]);
  if(G.office>=3)t.push([W-4,H-1]);
  return t;
}
function buildNav(list,fl){
  officeLayout();
  const L=OFF_LAYOUT[G.office],W=L.W,H=L.H,blk=new Uint8Array(W*H),room=new Uint8Array(W*H),rooms=[];let rm=null;
  const set=(x,y,v)=>{if(x>=0&&y>=0&&x<W&&y<H)blk[y*W+x]=v;};
  for(const d of OV.desks)if(d.fl===fl)set(Math.floor(d.x),d.row,1);
  for(const [x,y] of fixedTiles())set(x,y,2);
  for(const f of list){if((f.fl||0)!==fl)continue;const [w,d]=fdim(f);
    if(FURN[f.t].room){rooms.push(f);if(f.t==='meet')rm=f;const id=rooms.length;for(let i=0;i<3;i++)for(let j=0;j<3;j++){const X=f.x+i,Y=f.y+j;if(X<W&&Y<H)room[Y*W+X]=id;}set(f.x+1,f.y+1,3);}
    else for(let i=0;i<w;i++)for(let j=0;j<d;j++)set(f.x+i,f.y+j,3);}
  return {W,H,blk,room,rm,rooms,fl};
}
function navGrid(fl){
  officeLayout();if(fl==null)fl=UI.floor||0;
  const key=OV.layoutKey+'|'+G.furnVer+'|'+fl;
  OV.nav=OV.nav||{};
  if(OV.nav[fl]&&OV.nav[fl].key===key)return OV.nav[fl];
  const n=buildNav(G.furn,fl);n.key=key;OV.nav[fl]=n;return n;
}
function canStep(n,ax,ay,bx,by){
  if(bx<0||by<0||bx>=n.W||by>=n.H)return false;
  const ra=n.room[ay*n.W+ax],rb=n.room[by*n.W+bx];
  if(ra!==rb){if(ra&&rb)return false;const r=n.rooms[(ra||rb)-1];if(!r)return false;const dx=r.x+1,a=r.y+2,b=r.y+3;
    if(!(ax===dx&&bx===dx&&((ay===a&&by===b)||(ay===b&&by===a))))return false;}
  return true;
}
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
function bfs(n,sx,sy,gx,gy){
  const W=n.W,start=sy*W+sx,goal=gy*W+gx;if(start===goal)return [];
  const prev=new Int32Array(W*n.H).fill(-2),q=[start];prev[start]=-1;
  for(let qi=0;qi<q.length;qi++){
    const cur=q[qi];if(cur===goal)break;const cx=cur%W,cy=(cur-cx)/W;
    for(const [dx,dy] of DIRS){const nx=cx+dx,ny=cy+dy;if(!canStep(n,cx,cy,nx,ny))continue;const ni=ny*W+nx;
      if(prev[ni]!==-2)continue;if(n.blk[ni]&&ni!==goal)continue;prev[ni]=cur;q.push(ni);}
  }
  if(prev[goal]===-2)return null;
  const path=[];for(let c=goal;c!==start;c=prev[c])path.push([c%W,(c-c%W)/W]);
  return path.reverse();
}
function flood(n,sx,sy){
  const W=n.W,seen=new Uint8Array(W*n.H),q=[sy*W+sx];seen[q[0]]=1;
  for(let qi=0;qi<q.length;qi++){const cur=q[qi],cx=cur%W,cy=(cur-cx)/W;
    for(const [dx,dy] of DIRS){const nx=cx+dx,ny=cy+dy;if(!canStep(n,cx,cy,nx,ny))continue;const ni=ny*W+nx;if(seen[ni]||n.blk[ni])continue;seen[ni]=1;q.push(ni);}}
  return seen;
}
function requiredTiles(n){
  const r=[[n.W-2,2],[0,n.H-2]];
  if(n.fl===0&&hasElev())r.push(elevTile(0));
  if(hasElev())r.push([0,3]);
  for(const d of OV.desks)if(d.fl===n.fl&&d.row+1<n.H)r.push([Math.floor(d.x),d.row+1]);
  for(const rm of n.rooms||[])r.push([rm.x+1,rm.y+3],[rm.x+1,rm.y+2]);
  return r;
}
function placeCheck(t,x,y,r){
  const fl=UI.floor||0,F=FURN[t],n0=navGrid(fl),W=n0.W,H=n0.H,[w,d]=fdimT(t,r);
  if(F.minOffice&&G.office<F.minOffice)return {ok:false,why:(LANG_EN?`Requires ${OFFICES[F.minOffice].n} or higher`:`${OFFICES[F.minOffice].n} ve üstü gerekli`)};
  if(F.max&&G.furn.filter(f=>f.t===t&&(f.fl||0)===fl).length>=F.max)return {ok:false,why:(LANG_EN?"Already on this floor":'Bu katta zaten var')};
  if(x<0||y<0||x+w>W||y+d>H)return {ok:false,why:(LANG_EN?"Extends outside the office":'Ofisin dışına taşıyor')};
  if(F.room&&y+3>=H)return {ok:false,why:(LANG_EN?"Leave space in front of its door":'Kapısının önünde yer kalmalı')};
  const req=new Set(requiredTiles(n0).map(([a,b])=>b*W+a));
  for(let i=0;i<w;i++)for(let j=0;j<d;j++){const X=x+i,Y=y+j,k=Y*W+X;
    if(n0.blk[k])return {ok:false,why:(LANG_EN?"This spot is taken":'Bu alan dolu')};
    if(n0.room[k])return {ok:false,why:(LANG_EN?"Inside the meeting room":'Toplantı odasının içi')};
    if(X>=W-3&&Y<=3)return {ok:false,why:(LANG_EN?"Lounge area":'Dinlenme alanı')};
    if(req.has(k))return {ok:false,why:(LANG_EN?"Blocks the walkway":'Yürüme yolunu kapatıyor')};}
  const n=buildNav([...G.furn,{t,x,y,r,fl}],fl),reach=flood(n,0,H-2);
  for(const [X,Y] of requiredTiles(n)){const k=Y*W+X;if(n.blk[k]||!reach[k])return {ok:false,why:(LANG_EN?"Blocks the path to the desks":'Masalara giden yolu kesiyor')};}
  return {ok:true,why:(LANG_EN?"Click to place":'Yerleştirmek için tıkla')};
}
function furnAt(x,y){const fl=UI.floor||0;return G.furn.find(f=>{if((f.fl||0)!==fl)return false;const [w,d]=fdim(f);return x>=f.x&&x<f.x+w&&y>=f.y&&y<f.y+d;});}
function roomSeats(r){return [[r.x+1.1,r.y+0.72],[r.x+1.9,r.y+0.72],[r.x+0.5,r.y+1.5],[r.x+2.5,r.y+1.5],[r.x+1.1,r.y+2.3],[r.x+1.9,r.y+2.3]];}
function meetSpot(k){
  const n=navGrid(G.meeting?G.meeting.fl||0:0),r=n.rm;if(!r)return null;
  if(k<6){const s=roomSeats(r)[k];return {x:s[0],y:s[1],sit:true};}
  const key=n.key+'|'+(G.meeting?G.meeting.start:0);
  if(OV.mtKey!==key){
    const W=n.W,seen=new Uint8Array(W*n.H),q=[(r.y+3)*W+r.x+1];seen[q[0]]=1;
    for(let qi=0;qi<q.length&&q.length<120;qi++){const cur=q[qi],cx=cur%W,cy=(cur-cx)/W;
      for(const [dx,dy] of DIRS){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W||ny>=n.H)continue;const ni=ny*W+nx;if(seen[ni]||n.blk[ni]||n.room[ni])continue;seen[ni]=1;q.push(ni);}}
    OV.mtSpots=q.slice(1).map(i=>[i%W,(i-i%W)/W]);OV.mtKey=key;
  }
  const t=OV.mtSpots[(k-6)%Math.max(1,OV.mtSpots.length)]||[r.x+1,r.y+3];
  return {x:t[0]+0.5+hash(k)*0.3-0.15,y:t[1]+0.5,sit:false};
}
const IDLE_SPOTS=[[-1.75,1.05],[-0.95,1.2],[-2.55,0.8],[-2.35,2.5],[-1.55,2.6],[-0.75,2.25],[-2.9,3.1],[-1.2,3.3]];
function idleSpots(fl){
  const n=navGrid(fl);OV.idleC=OV.idleC||{};const ck=OV.idleC[fl];if(ck&&ck.key===n.key)return ck.list;
  const W=OV.L.W,H=OV.L.H,out=IDLE_SPOTS.map(s=>({x:W+s[0],y:Math.min(H-0.6,s[1]),drink:Math.hypot(s[0]+1.2,s[1]-1.1)<1}));
  for(const f of G.furn){const F=FURN[f.t];if(!F.use||(f.fl||0)!==fl)continue;const [w,d]=fdim(f);
    const cand=[[f.x+Math.floor(w/2),f.y+d],[f.x+w,f.y+Math.floor(d/2)],[f.x-1,f.y],[f.x,f.y-1]];
    for(const [X,Y] of cand){if(X<0||Y<0||X>=W||Y>=H)continue;const k=Y*W+X;if(n.blk[k]||n.room[k])continue;
      const sp={x:X+0.5,y:Y+0.4,drink:!!F.drink};out.push(sp,sp);break;}}
  OV.idleC[fl]={key:n.key,list:out};return out;
}
function route(x0,y0,x1,y1,fl){
  const n=navGrid(fl),cl=(v,m)=>clamp(Math.floor(v),0,m-1);
  const p=bfs(n,cl(x0,n.W),cl(y0+0.1,n.H),cl(x1,n.W),cl(y1+0.1,n.H));
  if(!p)return [{x:x1,y:y1}];
  const pts=p.slice(0,-1).map(([x,y])=>({x:x+0.5,y:y+0.5}));pts.push({x:x1,y:y1});return pts;
}

/* ---------- meetings (game side) ---------- */
function meetBlock(t,arg){
  if(!roomOf())return (LANG_EN?"Build a meeting room first":'Önce toplantı odası kur');
  if(G.meeting)return (LANG_EN?"Another meeting is in progress":'Şu an başka bir toplantı sürüyor');
  if(t==='plan'||t==='brain'){const pr=G.projects.find(p=>p.id===arg);if(!pr)return (LANG_EN?"Pick a project":'Bir proje seç');
    if(!G.emps.some(e=>e.proj===pr.id&&!e.leave))return (LANG_EN?"No one is working on the project":'Projede çalışan yok');
    if(t==='plan'&&pr.focus>G.day)return (LANG_EN?`Already focused (${pr.focus-G.day} days)`:`Zaten odaklı (${pr.focus-G.day} gün)`);
    if(t==='brain'&&pr.brain)return (LANG_EN?"Already done for this project":'Bu projede yapıldı');}
  if(t==='all'&&G.day-G.allAt<45)return (LANG_EN?`In ${45-(G.day-G.allAt)} days`:`${45-(G.day-G.allAt)} gün sonra`);
  if(t==='one'){const e=G.emps.find(x=>x.id===arg);if(!e||e.founder)return (LANG_EN?"Pick an employee":'Bir çalışan seç');if(e.leave)return (LANG_EN?"Employee is on leave":'Çalışan izinde');if(G.day-(e.oneAt||-999)<30)return (LANG_EN?`In ${30-(G.day-(e.oneAt||-999))} days`:`${30-(G.day-(e.oneAt||-999))} gün sonra`);}
  return null;
}
function startMeeting(t,arg){
  const why=meetBlock(t,arg);if(why){showToast(why,'bad');return;}
  let att;
  if(t==='plan'||t==='brain')att=G.emps.filter(e=>e.proj===arg&&!e.leave).map(e=>e.id);
  else if(t==='all'){att=G.emps.filter(e=>!e.leave).map(e=>e.id);G.allAt=G.day;}
  else{const f=G.emps.find(e=>e.founder);att=[f.id,arg];}
  const rooms=G.furn.filter(f=>f.t==='meet'),cnt={};let fl=rooms[0].fl||0,best=-1;
  for(const id of att){const f=empFloor(G.emps.find(x=>x.id===id));cnt[f]=(cnt[f]||0)+1;}
  for(const r of rooms){const c=cnt[r.fl||0]||0;if(c>best){best=c;fl=r.fl||0;}}
  G.meeting={t,att,arg,start:G.day,until:G.day+MEET[t].days,fl};
  news((LANG_EN?`${MEET[t].n} started (${att.length} people, ${MEET[t].days} days).`:`${MEET[t].n} başladı (${att.length} kişi, ${MEET[t].days} gün).`));
}
function endMeeting(){
  const m=G.meeting;G.meeting=null;if(!m)return;
  if(m.t==='plan'||m.t==='brain'){const pr=G.projects.find(p=>p.id===m.arg);
    if(!pr){news((LANG_EN?`${MEET[m.t].n} ended, but the project no longer exists.`:`${MEET[m.t].n} bitti ama proje artık yok.`));return;}
    if(m.t==='plan'){pr.focus=G.day+45;news((LANG_EN?`The ${pr.name} team finished planning: project speed +15% for 45 days.`:`${pr.name} ekibi planlamayı bitirdi: 45 gün boyunca proje hızı +%15.`),'good',true);}
    else{pr.brain=true;pr.qBonus=1.08;for(const e of G.emps)if(m.att.includes(e.id))e.morale=Math.min(100,e.morale+3);news((LANG_EN?`The brainstorm for ${pr.name} was productive: product quality +8%.`:`${pr.name} için beyin fırtınası verimli geçti: ürün kalitesi +%8.`),'good',true);}}
  else if(m.t==='all'){for(const e of G.emps)if(m.att.includes(e.id))e.morale=Math.min(100,e.morale+8);news((LANG_EN?"The all-hands is over. Everyone knows the goals and is motivated.":'Şirket toplantısı bitti. Herkes hedeflerden haberdar ve motive.'),'good',true);}
  else{const e=G.emps.find(x=>x.id===m.arg);if(e){e.morale=Math.min(100,e.morale+12);e.oneAt=G.day;news((LANG_EN?`Held a one-on-one with ${e.name}. They feel valued.`:`${e.name} ile birebir görüşme yapıldı. Kendini değerli hissediyor.`),'good');}}
}
const projMult=pr=>(pr.focus>G.day?1.15:1)*(1+furnFx().proj)*(ceoSk('v2')?1.05:1);
function removeFurn(f){G.furn=G.furn.filter(x=>x!==f);G.furnVer++;if(f.t==='meet'&&G.meeting&&(G.meeting.fl||0)===(f.fl||0)){G.meeting=null;news((LANG_EN?"Meeting room removed; meeting canceled.":'Toplantı odası kaldırıldı, toplantı iptal.'));}if(UI.selFurn===f.id)UI.selFurn=null;}

/* ---------- characters ---------- */
function updateChars(dt,now){
  const L=OV.L,rm=RM(),list=deskAssign(),ids=new Set(),boost=[1,1,2,4][G.speed]||1;OV.absent=new Map();
  const navKey=G.furnVer+'|'+OV.layoutKey;
  if(OV.charNav!==navKey){OV.charNav=navKey;for(const c of OV.chars.values()){c.tx=null;c.idle=null;}}
  const mt=G.meeting&&roomOf(G.meeting.fl||0)?G.meeting:null,FL=UI.floor||0;
  for(const [e,i] of list){
    ids.add(e.id);
    const d=OV.desks[i],seat={x:d.x,y:d.y+0.62},dfl=d.fl;
    if(e.leave){OV.chars.delete(e.id);OV.absent.set(i,e);continue;}
    let c=OV.chars.get(e.id);
    if(!c){c={id:e.id,ph:Math.random()*6,path:[],tx:null,ty:null,walk:0,coffee:0,idle:null,idleAt:0,pt:now+Math.random()*3000,mode:'stand',fl:0};
      if(OV.inited){c.x=0.7;c.y=L.H-1.3;c.fl=0;}else{c.x=seat.x;c.y=seat.y;c.fl=dfl;}
      OV.chars.set(e.id,c);}
    c.e=e;c.desk=i;c.seat=seat;c.dfl=dfl;
    const inMt=mt&&mt.att.includes(e.id),tf=inMt?(mt.fl||0):dfl;
    const work=isWorking(e),onBreak=!inMt&&work&&now<c.coffee;
    let tx,ty,sit=false,atDesk=false;
    if(e.mgr&&c.atDesk&&!c.visit&&Math.random()<dt/20){const mates=[...OV.chars.values()].filter(o=>o!==c&&o.e.role===e.role&&o.atDesk&&o.fl===c.fl);
      if(mates.length){const m=pick(mates);c.visit={x:m.seat.x+0.42,y:m.seat.y+0.2,until:now+5000};}}
    if(c.visit&&(now>c.visit.until||inMt||!work))c.visit=null;
    c.visiting=!!c.visit;
    if(inMt){const sp=meetSpot(mt.att.indexOf(e.id));tx=sp.x;ty=sp.y;sit=sp.sit;}
    else if(c.visit){tx=c.visit.x;ty=c.visit.y;}
    else if(c.inRoom&&now<c.inRoom.until&&work&&c.fl===dfl){tx=c.inRoom.x;ty=c.inRoom.y;sit=true;}
    else if(work&&!onBreak){tx=seat.x;ty=seat.y;sit=true;atDesk=true;}
    else{
      if(!c.idle||now>c.idleAt||(onBreak&&!c.idle.drink)||c.idle.fl!==tf){const sp=idleSpots(tf),pool=onBreak?sp.filter(s=>s.drink):sp,s=pick(pool.length?pool:sp);
        c.idle={x:s.x+rnd(-0.12,0.12),y:s.y+rnd(-0.1,0.1),drink:s.drink,fl:tf};c.idleAt=now+7000+Math.random()*10000;}
      tx=c.idle.x;ty=c.idle.y;
    }
    let crossing=false;
    if(c.fl!==tf){if(rm)c.fl=tf;else{
      if(!c.via){const ev=elevSpot(c.fl),st=STAIR_SPOT;c.via=Math.hypot(c.x-ev[0],c.y-ev[1])*rnd(0.8,1.2)<=Math.hypot(c.x-st[0],c.y-st[1])*rnd(0.8,1.2)?'e':'s';}
      [tx,ty]=c.via==='e'?elevSpot(c.fl):STAIR_SPOT;sit=false;atDesk=false;crossing=true;}}
    else c.via=null;
    if(c.inRoom&&(now>c.inRoom.until||!work||inMt))c.inRoom=null;
    if(!c.inRoom&&work&&c.atDesk&&now>(c.roomCool||0)&&Math.random()<dt/18){const rr=G.furn.find(f=>f.t==='r_'+e.role&&(f.fl||0)===dfl);
      if(rr){c.roomCool=now+25000;const occ=new Set([...OV.chars.values()].filter(o=>o.inRoom&&o.inRoom.rid===rr.id).map(o=>o.inRoom.k));const free=[0,1,2,3,4,5].filter(k=>!occ.has(k));
        if(free.length){const k=pick(free),st=roomSeats(rr)[k];c.inRoom={rid:rr.id,k,x:st[0],y:st[1],until:now+12000+Math.random()*10000};}}}
    if(work&&c.mode==='sit'&&c.atDesk&&now>c.coffee+(e.energy<40?30000:60000)&&Math.random()<dt/((e.energy<40?35:90)/(hasT(e,'social')?2:1)))c.coffee=now+7000+Math.random()*6000;
    if(c.tx==null||c.pfl!==c.fl||Math.abs(c.tx-tx)>0.01||Math.abs(c.ty-ty)>0.01){c.tx=tx;c.ty=ty;c.pfl=c.fl;if(rm){c.x=tx;c.y=ty;c.path=[];}else c.path=route(c.x,c.y,tx,ty,c.fl);}
    let sp=(inMt?4.5:e.energy<35?1.1:1.7)*dt*(G.speed>1?1.6:1);
    while(sp>0&&c.path.length){const p=c.path[0],dx=p.x-c.x,dy=p.y-c.y,dd=Math.hypot(dx,dy);
      if(dd<=sp){c.x=p.x;c.y=p.y;sp-=dd;c.path.shift();}else{c.x+=dx/dd*sp;c.y+=dy/dd*sp;sp=0;}}
    const moving=c.path.length>0;if(moving)c.walk+=dt*11;
    const near=Math.abs(c.x-tx)<0.05&&Math.abs(c.y-ty)<0.05;
    if(crossing&&!moving&&near){const [ax,ay]=c.via==='e'?elevSpot(tf):STAIR_SPOT;if(c.via==='e'){OV.elevAt=OV.elevAt||{};OV.elevAt[tf]=now;OV.elevAt[c.fl]=now;}c.fl=tf;c.x=ax;c.y=ay;c.tx=null;c.via=null;c.mode='stand';c.atDesk=false;c.inMt=false;continue;}
    c.mode=moving?'walk':(sit&&near?'sit':'stand');c.atDesk=atDesk&&c.mode==='sit';c.inMt=!!inMt;c.roomWork=!!(c.inRoom&&c.mode==='sit'&&!inMt);
    if(UI.cq&&UI.cq.length&&c.fl===FL&&!rm){const q=compPopTake(e.id);if(q&&COMP[q]){const [sx,sy]=P(c.x,c.y,0);OV.parts.push({x:sx,y:sy-46*OV.s,vy:-12,life:2.2,max:2.2,t:'+'+COMP[q].s,col:e.role,badge:true});}}
    if((c.atDesk||c.roomWork)&&c.fl===FL&&G.speed&&!rm&&now>c.pt){
      c.pt=now+(2400+Math.random()*2400)/boost;
      const r=e.role,o=e.skill*effMult(e),txt=r==='res'?(LANG_EN?`+${fx(o,0)} RP`:`+${fx(o,0)} AP`):r==='mkt'?(LANG_EN?"+brand":'+marka'):r==='ops'?'✓':`+${fx(o,0)}`;
      const [sx,sy]=P(c.x,c.y,0);OV.parts.push({x:sx,y:sy-40*OV.s,vy:-14,life:1.6,max:1.6,t:txt,col:r});
    }
  }
  for(const id of [...OV.chars.keys()])if(!ids.has(id))OV.chars.delete(id);
  OV.inited=true;
  const pc=G.products.filter(p=>p.owner==='P'&&!p.waitLaunch).length;
  if((OV.prodCount>=0||OV.prodCount===-2)&&pc>Math.max(0,OV.prodCount)&&!rm){const W=OV.cssW;for(let i=0;i<70;i++)OV.parts.push({x:rnd(W*0.2,W*0.8),y:rnd(-20,30),vx:rnd(-30,30),vy:rnd(10,60),life:rnd(1.5,2.6),max:2.6,conf:pick(['soft','design','hw','res','mkt','ops','acc'])});}
  OV.prodCount=pc;
}
const STAIR_SPOT=[0.55,3.5];
const elevSpot=fl=>{const [ex,ey]=elevTile(fl);return [ex+0.65,ey+0.5];};
function drawStairs(C){
  const top=(G.floors||1)-1===(UI.floor||0);
  for(let k=7;k>=0;k--){const y=3-0.25*(k+1),h=(k+1)*7;box(0.05,y,0.85,0.25,h,0,C.deskT,C.deskR,C.deskL);}
  const ctx=OV.ctx;ctx.strokeStyle=C.metal;ctx.lineWidth=Math.max(1,1.6*OV.s);ctx.beginPath();ctx.moveTo(...P(0.9,3,18));ctx.lineTo(...P(0.9,1,74));ctx.stroke();
  for(let k=0;k<=4;k++){const y=3-k*0.5,z=k*14;ctx.beginPath();ctx.moveTo(...P(0.9,y,z));ctx.lineTo(...P(0.9,y,z+18));ctx.stroke();}
  if(top){const [a,b]=P(0.45,1.6,62);ctx.fillStyle=C.tip;ctx.font=`600 ${8*OV.s}px ${OV.font}`;ctx.textAlign='center';ctx.fillText((LANG_EN?"ROOF":'ÇATI'),a,b);}
}
function drawElevator(fl,C,now){
  const [,ey]=elevTile(fl),ctx=OV.ctx,s=OV.s,open=OV.elevAt&&now-OV.elevAt[fl]<900?0.18:0;
  poly([P(0,ey+0.06,0),P(0,ey+0.94,0),P(0,ey+0.94,58),P(0,ey+0.06,58)],C.metal);
  poly([P(0,ey+0.12,0),P(0,ey+0.88,0),P(0,ey+0.88,52),P(0,ey+0.12,52)],C.mon);
  poly([P(0,ey+0.12,0),P(0,ey+0.5-open,0),P(0,ey+0.5-open,52),P(0,ey+0.12,52)],C.frame);
  poly([P(0,ey+0.5+open,0),P(0,ey+0.88,0),P(0,ey+0.88,52),P(0,ey+0.5+open,52)],C.frame);
  poly([P(0,ey+0.3,60),P(0,ey+0.7,60),P(0,ey+0.7,70),P(0,ey+0.3,70)],C.mon);
  const [a,b]=P(0,ey+0.5,63);ctx.fillStyle=C.accent;ctx.font=`700 ${8*s}px ${OV.font}`;ctx.textAlign='center';ctx.fillText(fl===0?'Z':String(fl),a,b+2*s);
}

/* ---------- drawing primitives ---------- */
function P(x,y,z=0){return [OV.ox+(x-y)*OV.tw/2,OV.oy+(x+y)*OV.th/2-z*OV.s];}
function poly(pts,fill,stroke,lw){const c=OV.ctx;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw||1;c.stroke();}}
function box(x,y,w,d,h,z,t,l,r){
  poly([P(x,y+d,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x,y+d,z+h)],l);
  poly([P(x+w,y,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x+w,y,z+h)],r);
  poly([P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)],t);
}
function ellipse(x,y,rx,ry,fill){const c=OV.ctx;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function rrect(x,y,w,h,r,fill){const c=OV.ctx;c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();c.fillStyle=fill;c.fill();}
function hash(n){const x=Math.sin(n*127.1)*43758.5453;return x-Math.floor(x);}
function seg(a,b,col,lw){const c=OV.ctx;c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();}
function screen(f,role,on,now,seed,C){
  poly([f(.08,.1),f(.92,.1),f(.92,.9),f(.08,.9)],on?C.scrOn:C.scrOff);
  if(!on)return;
  const ctx=OV.ctx,col=C.role[role]||C.accent,tk=Math.floor(now/450);
  ctx.strokeStyle=col;ctx.lineWidth=Math.max(1,1.3*OV.s);ctx.lineCap='round';
  const line=(u0,v0,u1,v1)=>{const a=f(u0,v0),b=f(u1,v1);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();};
  if(role==='design'){for(let i=0;i<3;i++){const u=.15+i*.25;poly([f(u,.25),f(u+.18,.25),f(u+.18,.25+.2+.35*hash(seed+i+tk*.1)),f(u,.25+.2+.35*hash(seed+i+tk*.1))],[C.role.design,C.accent,C.role.soft][i]);}}
  else if(role==='sec'){const c=f(.5,.5);ctx.beginPath();ctx.arc(c[0],c[1],Math.max(2,7*OV.s),0,Math.PI*2);ctx.stroke();const a=now/600+seed,e2=[c[0]+Math.cos(a)*7*OV.s,c[1]+Math.sin(a)*4*OV.s];ctx.beginPath();ctx.moveTo(c[0],c[1]);ctx.lineTo(e2[0],e2[1]);ctx.stroke();}
  else if(role==='mkt'){for(let i=0;i<4;i++){const u=.16+i*.19,h=.15+.6*hash(seed*3+i+Math.floor(tk/3));poly([f(u,.2),f(u+.12,.2),f(u+.12,.2+h),f(u,.2+h)],col);}}
  else if(role==='res'){const pts=[];for(let i=0;i<=8;i++){const u=.12+i*.095;pts.push(f(u,.5+.28*Math.sin(i*.9+now/500+seed)));}ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();}
  else if(role==='hw'){line(.15,.3,.45,.3);line(.45,.3,.45,.7);line(.45,.7,.85,.7);line(.25,.55,.65,.55);poly([f(.6,.42),f(.75,.42),f(.75,.6),f(.6,.6)],col);}
  else{for(let i=0;i<4;i++){const v=.76-i*.17,ind=(i%2)*.08,len=.18+.5*hash(seed*7+i+tk);line(.14+ind,v,Math.min(.88,.14+ind+len),v);}}
}
function drawChar(c,C,now){
  const e=c.e,s=OV.s,ctx=OV.ctx,rm=RM();let [sx,sy]=P(c.x,c.y,0);if(OV.cheer&&now<OV.cheer&&!rm&&!PREF.feelOff)sy-=Math.abs(Math.sin(now/110+(c.ph||0)*3))*7*s;
  const shirt=C.role[e.role],skin=SKINS[e.id%SKINS.length],hair=HAIRS[(e.id*7)%HAIRS.length];
  ellipse(sx,sy,9*s,3.6*s,C.shadow);
  if(OV.hover===e.id||UI.selEmp===e.id){ctx.beginPath();ctx.ellipse(sx,sy,11*s,4.6*s,0,0,Math.PI*2);ctx.strokeStyle=C.accent;ctx.lineWidth=2;ctx.stroke();}
  let top;
  if(c.mode==='sit'){
    const typing=c.atDesk||c.roomWork,sp=0.5+energyF(e)*0.5,bob=rm?0:Math.sin(now/140+c.ph)*0.5*s,ty=rm||!typing?0:Math.sin(now/65*sp+c.ph)*1.1*s;
    rrect(sx-6*s,sy-21*s+bob,12*s,13*s,4*s,shirt);
    rrect(sx+3.5*s,sy-17*s+ty,4*s,3*s,1.2*s,skin);rrect(sx-7.5*s,sy-17*s-ty,4*s,3*s,1.2*s,skin);
    top=sy-27*s+bob;
  }else{
    const sw=c.mode==='walk'&&!rm?Math.sin(c.walk)*2.4*s:0;
    rrect(sx-4*s,sy-10*s,3*s,10*s+sw*0.3,1*s,C.pants);rrect(sx+1*s,sy-10*s,3*s,10*s-sw*0.3,1*s,C.pants);
    rrect(sx-6*s,sy-23*s,12*s,14*s,4*s,shirt);
    rrect(sx-8*s,sy-21*s+sw,3*s,8*s,1.4*s,shirt);rrect(sx+5*s,sy-21*s-sw,3*s,8*s,1.4*s,shirt);
    top=sy-29*s;
  }
  ctx.beginPath();ctx.arc(sx,top,5.4*s,0,Math.PI*2);ctx.fillStyle=skin;ctx.fill();
  ctx.beginPath();ctx.arc(sx,top-0.8*s,5.6*s,Math.PI*0.92,Math.PI*2.08);ctx.fillStyle=hair;ctx.fill();
  {const bt=top+6*s;
    if(e.mgr){poly([[sx,bt+0.5*s],[sx-1.8*s,bt+2.5*s],[sx,bt+10*s],[sx+1.8*s,bt+2.5*s]],C.mon);
      const cy=top-10*s,pts=[];for(let k=0;k<10;k++){const r=(k%2?1.6:3.6)*s,a=-Math.PI/2+k*Math.PI/5;pts.push([sx+Math.cos(a)*r,cy+Math.sin(a)*r]);}poly(pts,'#F5C04A');}
    else for(let k=0;k<(e.level||0);k++)rrect(sx-5.5*s,bt+1.5*s+k*2.4*s,4*s,1.3*s,0.5*s,'rgba(255,255,255,.8)');}
  if(c.visiting&&c.mode==='stand'){const bx=sx+7*s,by=top-12*s;rrect(bx,by,14*s,10*s,3*s,C.tip);ctx.fillStyle=C.tipText;ctx.font=`700 ${8*s}px ${OV.font}`;ctx.textAlign='center';ctx.fillText('!',bx+7*s,by+7.6*s);}
  if(e.founder){ctx.beginPath();ctx.arc(sx,top-1.5*s,5.8*s,Math.PI,Math.PI*2);ctx.fillStyle=C.accent;ctx.fill();rrect(sx-1*s,top-5*s,8*s,2*s,1*s,C.accent);}
  if(c.inMt){}
  else if(c.mode!=='walk'&&(e.energy<30||e.morale<35)){
    const bx=sx+7*s,by=top-12*s;rrect(bx,by,14*s,10*s,3*s,C.tip);
    if(e.energy<30){ctx.fillStyle=C.tipText;ctx.font=`700 ${7.5*s}px ${OV.font}`;ctx.textAlign='center';ctx.fillText('zZ',bx+7*s,by+7.4*s);}
    else{ctx.strokeStyle=C.tipText;ctx.lineWidth=Math.max(1,1*s);ctx.beginPath();ctx.arc(bx+7*s,by+5*s,3.4*s,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(bx+7*s,by+7.4*s,1.6*s,Math.PI*1.15,Math.PI*1.85);ctx.stroke();}
  }else if(isToxic(e)&&c.mode==='sit'&&Math.floor(now/2500+c.ph)%6===0){
    const bx=sx+7*s,by=top-12*s;rrect(bx,by,16*s,10*s,3*s,'#C92A2A');ctx.fillStyle='#fff';ctx.font=`700 ${7.5*s}px ${OV.font}`;ctx.textAlign='center';ctx.fillText('#!',bx+8*s,by+7.4*s);
  }else if(e.want&&Math.floor(now/2200+(c.ph||0))%3!==2){
    const bx=sx+7*s,by=top-12*s;rrect(bx,by,14*s,10*s,3*s,C.accent);ctx.fillStyle='#fff';ctx.font=`700 ${8*s}px ${OV.font}`;ctx.textAlign='center';ctx.fillText('♥',bx+7*s,by+7.6*s);
  }else if(c.mode==='stand'&&!isWorking(e)){
    const bx=sx+7*s,by=top-12*s;rrect(bx,by,14*s,10*s,3*s,C.tip);ctx.fillStyle=C.tipText;ctx.font=`600 ${8*s}px ${OV.font}`;ctx.textAlign='center';ctx.fillText(['soft','design','hw'].includes(e.role)?'?':'…',bx+7*s,by+7.6*s);
  }
  if(!UI.edit)OV.hits.push({id:e.id,x0:sx-9*s,y0:top-7*s,x1:sx+9*s,y1:sy+3*s});
}

/* ---------- furniture drawing ---------- */
function drawFurn(f,C,now){
  const [w,d]=fdim(f),x=f.x,y=f.y,s=OV.s,ctx=OV.ctx,long=w>=d;
  switch(f.t){
    case 'plant':box(x+.35,y+.35,.3,.3,12,0,C.potT,C.pot,C.pot);{const [a,b]=P(x+.5,y+.5,21);ellipse(a,b,8*s,7*s,C.plant);ellipse(a-3*s,b-4*s,5*s,4.5*s,C.plant2);}break;
    case 'tree':{box(x+.3,y+.3,.4,.4,15,0,C.potT,C.pot,C.pot);const [a,b]=P(x+.5,y+.5,15);ctx.fillStyle=C.woodL;ctx.fillRect(a-1.5*s,b-24*s,3*s,24*s);
      const [a2,b2]=P(x+.5,y+.5,46);ellipse(a2,b2+6*s,13*s,10*s,C.plant);ellipse(a2-5*s,b2-1*s,9*s,8*s,C.plant2);ellipse(a2+5*s,b2+2*s,7*s,6*s,C.plant2);break;}
    case 'water':{box(x+.32,y+.32,.36,.36,26,0,C.deskT,C.deskL,C.deskR);const [a,b]=P(x+.5,y+.5,34);ellipse(a,b,5*s,7*s,C.water);ellipse(a-1.5*s,b-2*s,1.6*s,3*s,'rgba(255,255,255,.5)');break;}
    case 'espresso':{box(x+.12,y+.2,.76,.6,18,0,C.woodT,C.woodL,C.woodR);box(x+.3,y+.3,.36,.32,14,18,C.coffeeT,C.coffee,C.coffee);
      const [a,b]=P(x+.48,y+.62,26);ellipse(a,b,1.5*s,1.5*s,(Math.floor(now/700)%2)?C.accent:C.coffeeT);break;}
    case 'shelf':box(x+.1,y+.3,.8,.4,50,0,C.woodT,C.woodL,C.woodR);
      for(let r=0;r<3;r++)for(let k=0;k<5;k++){const u=.14+k*.15,z=6+r*15;poly([P(x+.1+.8*u,y+.7,z),P(x+.1+.8*(u+.1),y+.7,z),P(x+.1+.8*(u+.1),y+.7,z+10),P(x+.1+.8*u,y+.7,z+10)],[C.role.soft,C.role.design,C.accent,C.role.ops,C.role.res][(k+r)%5]);}
      break;
    case 'board':{box(x+.15,y+.48,.04,.04,16,0,C.metal,C.metal,C.metal);box(x+.81,y+.48,.04,.04,16,0,C.metal,C.metal,C.metal);
      box(x+.1,y+.45,.8,.05,30,16,C.board,C.board,C.deskR);const ln=(u0,u1,v,col)=>seg(P(x+.1+.8*u0,y+.5,16+30*v),P(x+.1+.8*u1,y+.5,16+30*v),col,Math.max(1,1.2*s));
      ln(.1,.6,.75,C.role.soft);ln(.1,.45,.55,C.role.design);ln(.5,.85,.35,C.accent);break;}
    case 'art':{box(x+.3,y+.3,.4,.4,18,0,C.deskT,C.deskL,C.deskR);const [a,b]=P(x+.5,y+.5,30);const k=now/1500;
      ellipse(a,b,6*s,8*s,C.accent);ellipse(a+Math.cos(k)*2*s,b-3*s,2.4*s,2.4*s,C.board);break;}
    case 'couch':
      if(long){box(x+.1,y+.25,w-.2,.15,24,0,C.sofaT,C.sofa,C.sofa);box(x+.1,y+.4,w-.2,.5,11,0,C.sofaT,C.sofa,C.sofa);box(x+.1,y+.4,.12,.5,17,0,C.sofaT,C.sofa,C.sofa);box(x+w-.22,y+.4,.12,.5,17,0,C.sofaT,C.sofa,C.sofa);}
      else{box(x+.25,y+.1,.15,d-.2,24,0,C.sofaT,C.sofa,C.sofa);box(x+.4,y+.1,.5,d-.2,11,0,C.sofaT,C.sofa,C.sofa);box(x+.4,y+.1,.5,.12,17,0,C.sofaT,C.sofa,C.sofa);box(x+.4,y+d-.22,.5,.12,17,0,C.sofaT,C.sofa,C.sofa);}
      break;
    case 'foos':{box(x+.2,y+.25,w-.4,d-.5,18,0,C.felt,C.woodL,C.woodR);
      for(let k=0;k<6;k++){if(long){const X=x+.35+k*(w-.7)/5;seg(P(X,y+.15,21),P(X,y+d-.15,21),C.metal,Math.max(1,1.4*s));const [a,b]=P(X,y+.5,20);ctx.fillStyle=k%2?C.role.soft:C.accent;ctx.fillRect(a-1.5*s,b-4*s,3*s,4*s);}
        else{const Y=y+.35+k*(d-.7)/5;seg(P(x+.15,Y,21),P(x+w-.15,Y,21),C.metal,Math.max(1,1.4*s));const [a,b]=P(x+.5,Y,20);ctx.fillStyle=k%2?C.role.soft:C.accent;ctx.fillRect(a-1.5*s,b-4*s,3*s,4*s);}}
      break;}
    case 'tv':{const hue=(now/40)%360;
      if(long){box(x+.1,y+.12,w-.2,.3,12,0,C.woodT,C.woodL,C.woodR);box(x+.3,y+.2,w-.6,.06,26,12,C.mon,C.mon,C.monR);
        poly([P(x+.36,y+.26,15),P(x+w-.36,y+.26,15),P(x+w-.36,y+.26,35),P(x+.36,y+.26,35)],`hsl(${hue} 60% ${C.dark?38:62}%)`);
        for(const X of [x+.55,x+w-.55]){const [a,b]=P(X,y+.78,5);ellipse(a,b,9*s,6*s,C.cushion);}}
      else{box(x+.12,y+.1,.3,d-.2,12,0,C.woodT,C.woodL,C.woodR);box(x+.2,y+.3,.06,d-.6,26,12,C.mon,C.monR,C.mon);
        poly([P(x+.26,y+.36,15),P(x+.26,y+d-.36,15),P(x+.26,y+d-.36,35),P(x+.26,y+.36,35)],`hsl(${hue} 60% ${C.dark?38:62}%)`);
        for(const Y of [y+.55,y+d-.55]){const [a,b]=P(x+.78,Y,5);ellipse(a,b,9*s,6*s,C.cushion);}}
      break;}
    case 'aqua':{box(x+.1,y+.1,w-.2,d-.2,14,0,C.woodT,C.woodL,C.woodR);ctx.globalAlpha=.75;box(x+.12,y+.12,w-.24,d-.24,26,14,C.water,C.water,C.water);ctx.globalAlpha=1;
      for(let k=0;k<4;k++){const u=(now/(2200+k*500)+k*.3)%1,v=.3+k*.15;const pt=long?P(x+.15+(w-.3)*u,y+d-.12,14+26*v):P(x+w-.12,y+.15+(d-.3)*u,14+26*v);ctx.fillStyle=[C.accent,C.role.mkt,C.role.design,C.role.ops][k];ctx.fillRect(pt[0]-2*s,pt[1]-1*s,4*s,2*s);}
      break;}
    case 'pod':{box(x+.1,y+.1,w-.2,d-.2,30,0,C.deskT,C.deskL,C.deskR);
      const c0=long?P(x+w/2,y+d-.1,15):P(x+w-.1,y+d/2,15);ellipse(c0[0],c0[1],7*s,6*s,C.mon);ellipse(c0[0],c0[1],4*s,3.4*s,C.glow||'rgba(120,180,255,.35)');break;}
  }
}
function roomBack(r,C,now){
  const x=r.x,y=r.y,H=40,dp=FURN[r.t].dept,gf=dp?C.role[dp]:C.glassF;
  poly([P(x,y,0),P(x+3,y,0),P(x+3,y,H),P(x,y,H)],C.glass,gf);
  poly([P(x,y,0),P(x,y+3,0),P(x,y+3,H),P(x,y,H)],C.glass,gf);
  if(dp){deptBack(r,C,now);return;}
  poly([P(x+.8,y+.02,12),P(x+2.2,y+.02,12),P(x+2.2,y+.02,34),P(x+.8,y+.02,34)],C.mon);
  if(G.meeting&&(G.meeting.fl||0)===(r.fl||0)){const f=(u,v)=>P(x+.85+1.3*u,y+.03,13+20*v);const k=Math.floor(now/800);
    for(let i=0;i<5;i++){const h=.2+.6*hash(i+k*.2+G.meeting.start);poly([f(.1+i*.17,.1),f(.2+i*.17,.1),f(.2+i*.17,.1+h),f(.1+i*.17,.1+h)],[C.accent,C.role.soft,C.role.ops,C.role.design,C.role.mkt][i]);}}
  else poly([P(x+.85,y+.03,13),P(x+2.15,y+.03,13),P(x+2.15,y+.03,33),P(x+.85,y+.03,33)],C.scrOff);
}
function roomFront(r,C){
  const x=r.x,y=r.y+3,H=40,dp=FURN[r.t]&&FURN[r.t].dept;C=dp?{...C,glassF:C.role[dp]}:C;
  poly([P(x,y,0),P(x+1,y,0),P(x+1,y,H),P(x,y,H)],C.glass,C.glassF);
  poly([P(x+2,y,0),P(x+3,y,0),P(x+3,y,H),P(x+2,y,H)],C.glass,C.glassF);
  poly([P(x+1,y,32),P(x+2,y,32),P(x+2,y,H),P(x+1,y,H)],C.glass,C.glassF);
  poly([P(r.x+3,r.y,0),P(r.x+3,y,0),P(r.x+3,y,H),P(r.x+3,r.y,H)],C.glass,C.glassF);
  const ctx=OV.ctx;ctx.strokeStyle=C.glassF;ctx.lineWidth=2*OV.s;ctx.beginPath();ctx.moveTo(...P(r.x,y,H));ctx.lineTo(...P(r.x+3,y,H));ctx.lineTo(...P(r.x+3,r.y,H));ctx.stroke();
}

const DEPT_SHORT={soft:(LANG_EN?"FOCUS":'ODAK'),design:(LANG_EN?"STUDIO":'STÜDYO'),hw:(LANG_EN?"WORKSHOP":'ATÖLYE'),res:(LANG_EN?"R&D":'AR-GE'),mkt:(LANG_EN?"MEDIA":'ÇEKİM'),ops:(LANG_EN?"CONTROL":'KONTROL'),sup:(LANG_EN?"SUPPORT":'DESTEK'),sec:'SOC'};
function deptBack(r,C,now){
  const x=r.x,y=r.y,dp=FURN[r.t].dept,col=C.role[dp],ctx=OV.ctx,s=OV.s,tk=Math.floor(now/500);
  const f=(u,v)=>P(x+.6+1.8*u,y+.03,10+26*v);
  const panel=fill=>poly([f(0,0),f(1,0),f(1,1),f(0,1)],fill);
  const ln=(u0,v0,u1,v1,c,w)=>seg(f(u0,v0),f(u1,v1),c,Math.max(1,(w||1.2)*s));
  if(dp==='soft'){panel(C.mon);for(let i=0;i<5;i++)ln(.08+(i%2)*.06,.82-i*.15,.08+(i%2)*.06+.2+.6*hash(i+tk),.82-i*.15,col);}
  else if(dp==='design'){panel(C.board);for(let i=0;i<6;i++){const u=.06+(i%3)*.32,v=i<3?.55:.12;poly([f(u,v),f(u+.26,v),f(u+.26,v+.36),f(u,v+.36)],[C.role.design,C.accent,C.role.soft,C.role.mkt,C.role.ops,C.role.res][i]);}}
  else if(dp==='hw'){panel(C.metal);for(let i=0;i<7;i++){const u=.08+i*.13;ln(u,.25+hash(i)*.2,u,.8,C.mon,1.6);}ln(.1,.15,.9,.15,C.mon,1);}
  else if(dp==='res'){panel(C.board);ln(.08,.75,.6,.75,col);ln(.08,.55,.45,.55,col);const pts=[];for(let i=0;i<=8;i++)pts.push(f(.55+i*.05,.2+.5*Math.abs(Math.sin(i*.8+now/900))));ctx.strokeStyle=C.accent;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();}
  else if(dp==='mkt'){poly([f(0,-.35),f(1,-.35),f(1,1),f(0,1)],'#3DAA5C');}
  else{panel(C.mon);for(let i=0;i<14;i++){const u=.06+hash(i*3)*.88,v=.1+hash(i*7)*.8;const [a,b]=f(u,v);ctx.fillStyle=(i+tk)%5===0?C.accent:col;ctx.fillRect(a-1.2*s,b-1.2*s,2.4*s,2.4*s);}}
}
function deptCenter(r,C,now){
  const x=r.x,y=r.y,dp=FURN[r.t].dept,s=OV.s,ctx=OV.ctx;
  if(dp==='soft'){box(x+.8,y+1,1.4,1,15,0,C.deskT,C.deskL,C.deskR);for(const [mx,my] of [[x+1.1,y+1.1],[x+1.7,y+1.1]])box(mx,my,.3,.05,12,15,C.mon,C.mon,C.monR);}
  else if(dp==='design'){box(x+.8,y+1,1.4,1,15,0,C.board,C.deskL,C.deskR);for(let i=0;i<4;i++)poly([P(x+.9+i*.32,y+1.2,15.2),P(x+1.15+i*.32,y+1.2,15.2),P(x+1.15+i*.32,y+1.6,15.2),P(x+.9+i*.32,y+1.6,15.2)],[C.role.design,C.accent,C.role.soft,C.role.mkt][i]);}
  else if(dp==='hw'){box(x+.8,y+1,1.4,1,16,0,C.metal,C.rack,C.rack);box(x+1.1,y+1.3,.5,.35,1.5,16,C.felt,C.felt,C.felt);box(x+1.8,y+1.2,.08,.08,14,16,C.mon,C.mon,C.mon);const [a,b]=P(x+1.84,y+1.24,31);ellipse(a,b,2.5*s,1.6*s,'#F5C04A');}
  else if(dp==='res'){box(x+.8,y+1,1.4,1,15,0,C.board,C.deskL,C.deskR);for(let i=0;i<4;i++){const [a,b]=P(x+1+i*.3,y+1.5,20);ellipse(a,b,2.4*s,3.4*s,[C.role.res,C.role.ops,C.accent,C.role.soft][i]);}}
  else if(dp==='mkt'){box(x+1.2,y+1.2,.6,.6,10,0,C.woodT,C.woodL,C.woodR);const [a,b]=P(x+1.5,y+1.5,10);seg([a,b],[a,b-18*s],C.mon,2*s);rrect(a-5*s,b-25*s,10*s,7*s,2*s,C.mon);ellipse(a+5*s,b-21.5*s,2*s,2*s,C.accent);}
  else{box(x+.8,y+1,1.4,1,14,0,C.deskT,C.deskL,C.deskR);for(const mx of [x+.95,x+1.45,x+1.95])box(mx,y+1.15,.35,.05,12,14,C.mon,C.mon,C.monR);}
}
function drawRoomFull(f,C,now,add){
  const seats=roomSeats(f),dp=FURN[f.t].dept;
  add(f.x+f.y+0.4,()=>roomBack(f,C,now));
  add(f.x+f.y+3,()=>dp?deptCenter(f,C,now):box(f.x+.8,f.y+1.0,1.4,1.0,15,0,C.woodT,C.woodL,C.woodR));
  for(const [sx,sy] of seats)add(sx+sy-0.05,()=>box(sx-.14,sy-.12,.28,.24,8,0,C.chairT,C.chair,C.chair));
  add(f.x+f.y+4.5,()=>{roomFront(f,C);if(dp){const [a,b]=P(f.x+1.5,f.y+3,46);const t=DEPT_SHORT[dp];OV.ctx.font=`700 ${8.5*OV.s}px ${OV.font}`;const w=OV.ctx.measureText(t).width+10*OV.s;rrect(a-w/2,b-8*OV.s,w,11*OV.s,2*OV.s,C.role[dp]);OV.ctx.fillStyle='#fff';OV.ctx.textAlign='center';OV.ctx.fillText(t,a,b+0.5*OV.s);}});
}

/* ---------- main draw ---------- */

/* ---------- rival offices ---------- */
const RV={key:'',chars:[],desks:[],last:0};
const RTIER_N=['',(LANG_EN?"Small office":'Küçük ofis'),(LANG_EN?"Office floor":'Ofis katı'),(LANG_EN?"Office Tower":'Plaza'),(LANG_EN?"Tech campus":'Teknoloji kampüsü')];
const rivalTier=c=>c.emp<40?1:c.emp<200?2:c.emp<700?3:4;
const rivalPerFloor=c=>[0,12,24,40,48][rivalTier(c)];
const rivalFloors=c=>Math.max(1,Math.ceil(c.emp/rivalPerFloor(c)));
const rivalOcc=c=>c.neg>=1?0.42:c.profit<0?0.72:0.95;
const rivalHue=(c,l=50)=>`hsl(${c.hue} 58% ${l}%)`;
function rivalThreat(c){const share={};for(const p of myActive())share[p.cat]=(share[p.cat]||0)+p.share;return c.focus.reduce((a,f)=>a+(share[f]||0),0);}
function rivalRoleW(c){
  const w={soft:0,design:0,hw:0,res:0,mkt:1,ops:0,sup:0.4};
  for(const f of c.focus){if(f==='cpu'){w.hw+=3;w.soft+=1;w.res+=1.2;w.ops+=0.5;}else if(f==='phone'||f==='pc'){w.hw+=2;w.design+=1.2;w.soft+=1;w.ops+=0.6;}else{w.soft+=3;w.design+=1.2;}}
  return w;
}
function rivalRole(c,u){const w=rivalRoleW(c),t=Object.values(w).reduce((a,b)=>a+b,0);let x=u*t;for(const r of ROLE_ORDER){x-=w[r]||0;if(x<0)return r;}return 'soft';}
function rivalSetup(c){
  const tier=rivalTier(c),occ=rivalOcc(c),key=[c.id,tier,occ,c.focus.join()].join('|');
  if(RV.key===key)return;
  const L=OFF_LAYOUT[tier],per=tier>=3?999:rivalPerFloor(c),seed=(parseInt(String(c.id).replace(/\D/g,''))||1)*13.7+c.hue,desks=[];let k=0;
  for(let row=1;row<L.H-1&&k<per;row+=2)for(let x=1;x<=L.W-4&&k<per;x++,k++)desks.push({x:x+0.5,y:row+0.35,row});
  const chars=[];let id=900000+Math.round(seed*10);
  desks.forEach((d,i)=>{d.occ=hash(seed+i*1.31)<occ;d.box=!d.occ&&c.profit<0&&hash(seed+i*2.7)<0.6;d.role=rivalRole(c,hash(seed+i*0.77));
    if(d.occ){const sad=c.neg>=1&&hash(seed+i*5.1)<0.45;
      chars.push({e:{id:id++,role:d.role,level:Math.floor(hash(seed+i*3.3)*3),energy:sad?45:80+hash(i)*20,morale:sad?28:70,tr:[]},x:d.x,y:d.y+0.62,mode:'sit',atDesk:true,ph:hash(seed+i)*6});}});
  const rows=[...new Set(desks.map(d=>d.row))],nw=c.neg>=1?1:Math.min(4,1+Math.floor(c.emp/300));
  for(let w=0;w<nw&&rows.length;w++){const row=rows[w%rows.length],y=row+1.6;
    chars.push({e:{id:id++,role:rivalRole(c,hash(seed+w*9.1)),level:1,energy:90,morale:72,tr:[]},x:1+hash(seed+w)*(L.W-5),y,mode:'walk',walk:0,ph:w,dir:hash(seed+w*4)<0.5?1:-1,x0:0.7,x1:L.W-3.4});}
  Object.assign(RV,{key,L,desks,chars,seed,tier});
}
function drawRival(now){
  const cv=document.getElementById('rivalCanvas'),sp=spaceSpec();if(!cv||!sp)return;
  if(now-RV.last<30)return;
  const dt=Math.min(0.1,(now-(RV.last||now))/1000);RV.last=now;
  sp.setup();
  const L=RV.L,cssW=cv.parentElement.clientWidth;if(!cssW)return;
  const span=(L.W+L.H)/2,tw=Math.min(92,cssW/span*0.97),s=tw/64,th=tw/2,wallH=82;
  const cssH=Math.round(span*th+wallH*s+24*s),dpr=Math.min(2,window.devicePixelRatio||1);
  if(cv.width!==Math.round(cssW*dpr)||cv.height!==Math.round(cssH*dpr)){cv.width=Math.round(cssW*dpr);cv.height=Math.round(cssH*dpr);cv.style.height=cssH+'px';}
  const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cssW,cssH);
  Object.assign(OV,{ctx,tw,th,s,cssW,ox:(cssW-(L.W+L.H)*tw/2)/2+L.H*tw/2,oy:wallH*s+12*s});
  const C=ofColors(),W=L.W,H=L.H,font=OV.font||(OV.font=getComputedStyle(document.body).fontFamily),rm=RM();
  const brand=sp.col(C.dark?45:50),brandD=sp.col(C.dark?30:38),seed=RV.seed;
  for(const ch of RV.chars)if(ch.mode==='walk'&&!rm){ch.x+=ch.dir*dt*0.9;ch.walk+=dt*9;if(ch.x>ch.x1){ch.x=ch.x1;ch.dir=-1;}if(ch.x<ch.x0){ch.x=ch.x0;ch.dir=1;}}
  OV.hits=[];
  poly([P(0,H,0),P(W,H,0),P(W,H,-7),P(0,H,-7)],C.slabL);poly([P(W,0,0),P(W,H,0),P(W,H,-7),P(W,0,-7)],C.slabR);
  const fl=C.floor[L.f];
  for(let i=0;i<W;i++)for(let j=0;j<H;j++)poly([P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)],L.f==='wood'?fl[(i+(j>>1))%2]:fl[(i+j)%2]);
  poly([P(0,0,0),P(0,H,0),P(0,H,wallH),P(0,0,wallH)],C.wallL);poly([P(0,0,0),P(W,0,0),P(W,0,wallH),P(0,0,wallH)],C.wallR);
  poly([P(0,0,0),P(W,0,0),P(W,0,5),P(0,0,5)],brandD);poly([P(0,0,0),P(0,H,0),P(0,H,5),P(0,0,5)],brandD);
  ctx.strokeStyle=C.cap;ctx.lineWidth=3*s;ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(...P(0,H,wallH));ctx.lineTo(...P(0,0,wallH));ctx.lineTo(...P(W,0,wallH));ctx.stroke();
  {const n=Math.floor((W-1.5)/2.2),big=RV.tier>=3;
    for(let k=0;k<n;k++){const x0=0.8+k*2.2,x1=x0+(big?1.9:1.5),z0=big?14:24,z1=big?72:62;
      poly([P(x0,0,z0),P(x1,0,z0),P(x1,0,z1),P(x0,0,z1)],C.frame);
      const g=ctx.createLinearGradient(...P(x0,0,z1),...P(x0,0,z0));const SKc=skyCols(C);g.addColorStop(0,SKc[0]);g.addColorStop(1,SKc[1]);
      poly([P(x0+0.07,0,z0+3),P(x1-0.07,0,z0+3),P(x1-0.07,0,z1-3),P(x0+0.07,0,z1-3)],g);
      const mx=(x0+x1)/2;poly([P(mx-0.02,0,z0),P(mx+0.02,0,z0),P(mx+0.02,0,z1),P(mx-0.02,0,z1)],C.frame);}}
  /* logo wall */
  {const y0=0.8,y1=Math.min(H-3,3.6);poly([P(0,y0,22),P(0,y1,22),P(0,y1,66),P(0,y0,66)],brand);
    const cy=(y0+y1)/2;poly([P(0,cy-0.55,34),P(0,cy+0.55,34),P(0,cy+0.55,54),P(0,cy-0.55,54)],C.wallL);
    poly([P(0,cy-0.35,38),P(0,cy+0.35,38),P(0,cy+0.35,50),P(0,cy-0.35,50)],brand);}
  /* target board */
  const tgt=sp.tgt;
  if(H>7){const y0=Math.min(H-3,3.6)+0.6,y1=y0+1.8;poly([P(0,y0,26),P(0,y1,26),P(0,y1,56),P(0,y0,56)],C.frame);poly([P(0,y0+0.1,28),P(0,y1-0.1,28),P(0,y1-0.1,54),P(0,y0+0.1,54)],C.board);
    if(tgt){poly([P(0,y0+0.4,36),P(0,y0+1.1,36),P(0,y0+1.1,48),P(0,y0+0.4,48)],C.accent);ctx.strokeStyle='#C92A2A';ctx.lineWidth=2.4*s;
      ctx.beginPath();ctx.moveTo(...P(0,y0+0.3,33));ctx.lineTo(...P(0,y0+1.2,51));ctx.moveTo(...P(0,y0+1.2,33));ctx.lineTo(...P(0,y0+0.3,51));ctx.stroke();}
    else{ctx.lineWidth=Math.max(1,1.2*s);[[brand,.25],[C.role.soft,.5],[C.role.hw,.75]].forEach(([col,v],k)=>{ctx.strokeStyle=col;ctx.beginPath();ctx.moveTo(...P(0,y0+0.3,30+v*20));ctx.lineTo(...P(0,y0+0.6+hash(seed+k)*0.9,30+v*20));ctx.stroke();});}}
  poly([P(0,H-2.2,0),P(0,H-1.2,0),P(0,H-1.2,54),P(0,H-2.2,54)],C.doorD);poly([P(0,H-2.12,0),P(0,H-1.28,0),P(0,H-1.28,50),P(0,H-2.12,50)],brandD);
  poly([P(W-2.95,0.6),P(W-0.3,0.6),P(W-0.3,3.0),P(W-2.95,3.0)],brand+'');
  ctx.globalAlpha=0.55;poly([P(W-2.85,0.7),P(W-0.4,0.7),P(W-0.4,2.9),P(W-2.85,2.9)],C.rug);ctx.globalAlpha=1;
  const objs=[],add=(d,f)=>objs.push({d,f}),boxC=C.dark?'#7A5A36':'#C49A62',boxT=C.dark?'#8E6B43':'#D8B27C';
  RV.desks.forEach((d,i)=>{
    const on=d.occ;
    add(d.x+d.y,()=>{
      box(d.x-0.45,d.y-0.25,0.9,0.5,17,0,C.deskT,C.deskL,C.deskR);
      box(d.x-0.04,d.y-0.12,0.08,0.06,4,17,C.mon,C.mon,C.monR);box(d.x-0.24,d.y-0.17,0.48,0.05,16,20,C.mon,C.mon,C.monR);
      screen((u,v)=>P(d.x-0.24+0.48*u,d.y-0.12,20+16*v),d.role,on,now,i*3.7+seed,C);
      box(d.x-0.18,d.y+0.05,0.36,0.1,1.5,17,C.key,C.key,C.key);
      if(on&&d.role==='hw')box(d.x+0.24,d.y-0.05,0.16,0.14,2,17,C.role.hw,C.role.hw,C.role.hw);
      if(d.box){box(d.x-0.05,d.y-0.2,0.38,0.3,9,17,boxT,boxC,boxC);}
    });
    add(d.x+d.y+0.6,()=>{box(d.x-0.16,d.y+0.5,0.32,0.26,9,0,C.chairT,C.chair,C.chair);if(!on)box(d.x-0.16,d.y+0.72,0.32,0.06,22,0,C.chairT,C.chair,C.chair);});
  });
  for(const ch of RV.chars)add(ch.x+ch.y+(ch.mode==='sit'?0.05:0),()=>drawChar(ch,C,now));
  add(W-1.0+0.4,()=>{box(W-1.35,0.15,0.6,0.42,30,0,C.coffeeT,C.coffee,C.coffee);const [a,b]=P(W-1.0,0.57,22);ellipse(a,b,1.6*s,1.6*s,(Math.floor(now/600)%2)?brand:C.coffeeT);});
  add(W-2.6+1.6,()=>{box(W-2.65,1.35,1.3,0.16,24,0,brandD,brandD,brandD);box(W-2.65,1.5,1.3,0.5,11,0,brand,brandD,brandD);});
  /* showcase: their best product */
  add(W-2.2+2.4,()=>{box(W-2.4,2.2,0.5,0.5,20,0,C.deskT,C.deskL,C.deskR);const [a,b]=P(W-2.15,2.45,30);const g=0.5+0.5*Math.sin(now/500);
    ctx.globalAlpha=0.35+0.3*g;ellipse(a,b,10*s,6*s,brand);ctx.globalAlpha=1;
    if(sp.hw)rrect(a-3*s,b-12*s,6*s,11*s,1.5*s,C.mon);else{rrect(a-5*s,b-9*s,10*s,7*s,1*s,C.mon);}});
  const plant=(x,y,sz)=>add(x+y,()=>{box(x-0.15,y-0.15,0.3,0.3,12*sz,0,C.potT,C.pot,C.pot);const [a,b]=P(x,y,12*sz+9*sz);ellipse(a,b,8*s*sz,7*s*sz,sp.neg?C.potT:C.plant);ellipse(a-3*s*sz,b-4*s*sz,5*s*sz,4.5*s*sz,sp.neg?C.pot:C.plant2);});
  plant(W-0.45,3.2,1);plant(0.45,0.5,1.2);if(sp.prof){plant(W-3.6,0.45,1);if(RV.tier>=3){plant(0.5,H-0.6,1.1);plant(W-0.45,H-0.5,1.3);}}
  if(sp.racks){const rk=sp.racks;for(let i=0;i<rk;i++){const x=W-1.55+(i%2)*0.7,y=H-1.05-Math.floor(i/2)*0.75;
    add(x+y+0.5,()=>{box(x,y,0.5,0.4,44,0,C.rackT,C.rack,C.rack);for(let q=0;q<5;q++){const [a,b]=P(x+0.1+(q%2)*0.25,y+0.4,10+q*7);ctx.fillStyle=hash(i*11+q+Math.floor(now/(250+q*60)))>0.4?brand:C.rackT;ctx.fillRect(a-1.2,b-1.2,2.4,2.4);}});}}
  if(sp.neg)for(let k=0;k<5;k++){const x=0.5+(k%2)*0.42,y=H-3.2+Math.floor(k/2)*0.42;add(x+y+0.3,()=>box(x,y,0.36,0.36,10,(k>=4?10:0),boxT,boxC,boxC));}
  objs.sort((a,b)=>a.d-b.d).forEach(o=>o.f());
  {const tags=[[sp.name.toLocaleUpperCase(LOC),brand,'#fff'],[sp.sub.toLocaleUpperCase(LOC),C.tip,C.tipText]];if(tgt)tags.push([(LANG_EN?"TARGETING YOU":'SENİ HEDEF ALMIŞ'),'#C92A2A','#fff']);
    let tx=10;ctx.font=`600 11px ${font}`;ctx.textAlign='left';for(const [t,bg,fg] of tags){const w=ctx.measureText(t).width+18;rrect(tx,10,w,22,3,bg);ctx.fillStyle=fg;ctx.fillText(t,tx+9,25);tx+=w+6;}}
}

/* ---------- branches ---------- */
const BR={eu:{city:(LANG_EN?"Berlin":'Berlin'),sal:1.35,sk:6.2},na:{city:(LANG_EN?"San Francisco":'San Francisco'),sal:1.7,sk:6.8},asia:{city:(LANG_EN?"Singapore":'Singapur'),sal:0.75,sk:5.6},latam:{city:(LANG_EN?"São Paulo":'São Paulo'),sal:0.55,sk:4.8}};
const BR_LVL=[null,{n:(LANG_EN?"Sales office":'Satış ofisi'),cap:8,rent:20000,cost:500000},{n:(LANG_EN?"Regional HQ":'Bölge merkezi'),cap:20,rent:55000,cost:2e6},{n:(LANG_EN?"Regional campus":'Bölge kampüsü'),cap:40,rent:120000,cost:6e6}];
const BR_ROLE={eng:{n:(LANG_EN?"R&D engineer":'Ar-Ge mühendisi'),role:'res',d:(LANG_EN?"Generates research points":'Araştırma puanı üretir')},mkt:{n:(LANG_EN?"Sales & marketing":'Satış ve pazarlama'),role:'mkt',d:(LANG_EN?"Regional appeal and awareness":'Bölgede çekicilik ve bilinirlik')},sup:{n:(LANG_EN?"Customer support":'Müşteri desteği'),role:'sup',d:(LANG_EN?"Resolves support tickets":'Destek talebi çözer')}};
const brOf=r=>G.branches&&G.branches[r];
const brStaff=b=>b.staff.eng+b.staff.mkt+b.staff.sup;
const brSal=r=>salaryFor(BR[r].sk)*BR[r].sal;
const brRent=(r,b)=>BR_LVL[b.lvl].rent*BR[r].sal*infl();
const brMonthly=(r,b)=>brRent(r,b)+brStaff(b)*brSal(r);
const brCostAll=()=>Object.entries(G.branches||{}).reduce((a,[r,b])=>a+brMonthly(r,b),0);
const brAppeal=r=>{const b=brOf(r);return b?1+Math.min(0.3,0.03*b.staff.mkt):1;};
const brRP=()=>Object.entries(G.branches||{}).reduce((a,[r,b])=>a+b.staff.eng*BR[r].sk*0.8,0);
const brSupCap=()=>Object.entries(G.branches||{}).reduce((a,[r,b])=>a+b.staff.sup*BR[r].sk*25,0);
const brOpenCost=r=>BR_LVL[1].cost*BR[r].sal*infl();
const brUpCost=(r,b)=>b.lvl<3?BR_LVL[b.lvl+1].cost*BR[r].sal*infl():0;
function closeBranch(r,why){const b=brOf(r);if(!b)return;const sev=brStaff(b)*brSal(r);if(sev)spend(sev,'other');delete G.branches[r];news((LANG_EN?`The ${BR[r].city} branch closed${why?' ('+why+')':''}. ${money(sev)} in severance paid to ${brStaff(b)} people.`:`${BR[r].city} şubesi kapandı${why?' ('+why+')':''}. ${brStaff(b)} kişiye ${money(sev)} tazminat ödendi.`),'bad',true);if(UI.branch===r)UI.branch=null;}
function spaceSpec(){
  if(UI.branch){const r=UI.branch,b=brOf(r);if(!b)return null;
    return {name:(LANG_EN?`${BR[r].city} branch`:`${BR[r].city} şubesi`),sub:`${REGS[r].n} · ${BR_LVL[b.lvl].n}`,col:l=>`hsl(19 82% ${l}%)`,tgt:false,hw:G.products.some(p=>p.owner==='P'&&p.active&&HW.includes(p.cat)),neg:false,prof:true,racks:b.staff.sup>3?2:0,
      setup:()=>branchSetup(r,b)};}
  const c=UI.rival&&comp(UI.rival);if(!c||c.dead)return null;
  return {name:c.name,sub:RTIER_N[rivalTier(c)],col:l=>rivalHue(c,l),tgt:c.aggr>0.6&&rivalThreat(c)>0.04,hw:c.focus.some(f=>HW.includes(f)),neg:c.neg>=1,prof:c.profit>0,
    racks:c.focus.includes('saas')||c.emp>300?Math.min(6,2+Math.floor(c.emp/250)):0,setup:()=>rivalSetup(c)};
}
function branchSetup(r,b){
  const key=['br',r,b.lvl,b.staff.eng,b.staff.mkt,b.staff.sup].join('|');if(RV.key===key)return;
  const tier=b.lvl,L=OFF_LAYOUT[tier],cap=BR_LVL[b.lvl].cap,desks=[],seed=r.length*31.7+b.lvl;let k=0;
  for(let row=1;row<L.H-1&&k<cap;row+=2)for(let x=1;x<=L.W-4&&k<cap;x++,k++)desks.push({x:x+0.5,y:row+0.35,row});
  const roles=[...Array(b.staff.eng).fill('res'),...Array(b.staff.mkt).fill('mkt'),...Array(b.staff.sup).fill('sup')];
  const chars=[];let id=800000+Math.round(seed*100);
  desks.forEach((d,i)=>{d.occ=i<roles.length;d.box=false;d.role=roles[i]||'soft';
    if(d.occ)chars.push({e:{id:id++,role:d.role,level:Math.floor(hash(seed+i)*3),energy:85,morale:75,tr:[]},x:d.x,y:d.y+0.62,mode:'sit',atDesk:true,ph:hash(seed+i)*6});});
  if(roles.length>4){const row=desks[0].row;chars.push({e:{id:id++,role:'mkt',level:1,energy:90,morale:80,tr:[]},x:2,y:row+1.6,mode:'walk',walk:0,ph:1,dir:1,x0:0.7,x1:L.W-3.4});}
  Object.assign(RV,{key,L,desks,chars,seed,tier});
}
function vBranch(r){
  const b=brOf(r),R=BR[r],lv=BR_LVL[b.lvl],n=brStaff(b),sal=brSal(r),full=n>=lv.cap;
  const rows=Object.entries(BR_ROLE).map(([k,x])=>{const q=b.staff[k];
    const eff=k==='eng'?(LANG_EN?`+${fx2(q*R.sk*0.8)} RP/day`:`+${fx2(q*R.sk*0.8)} AP/gün`):k==='mkt'?(LANG_EN?`appeal +${Math.round(Math.min(0.3,0.03*q)*100)}%, awareness +${Math.round(Math.min(0.08,0.012*q)*100)}/mo`:`çekicilik +%${Math.round(Math.min(0.3,0.03*q)*100)}, bilinirlik +${Math.round(Math.min(0.08,0.012*q)*100)}/ay`):(LANG_EN?`+${num(q*R.sk*25)} tickets/day`:`+${num(q*R.sk*25)} talep/gün`);
    return (LANG_EN?`<tr><td><span class="chip r-${x.role}">${x.n}</span><div class="small muted">${x.d}</div></td><td class="r num">${q}</td><td class="small">${eff}</td>
      <td class="r"><span class="row" style="flex-wrap:nowrap;justify-content:flex-end"><button class="btn sm ghost" data-act="brfire" data-r="${r}" data-k="${k}" ${q?'':'disabled'} title="Severance: 1 month's salary">−</button><button class="btn sm" data-act="brhire" data-r="${r}" data-k="${k}" ${full?'disabled':''} title="Hiring fee: half a month's salary">+ Hire</button></span></td></tr>`:`<tr><td><span class="chip r-${x.role}">${x.n}</span><div class="small muted">${x.d}</div></td><td class="r num">${q}</td><td class="small">${eff}</td>
      <td class="r"><span class="row" style="flex-wrap:nowrap;justify-content:flex-end"><button class="btn sm ghost" data-act="brfire" data-r="${r}" data-k="${k}" ${q?'':'disabled'} title="1 aylık maaş tazminat">−</button><button class="btn sm" data-act="brhire" data-r="${r}" data-k="${k}" ${full?'disabled':''} title="İşe alım ücreti yarım maaş">+ İşe al</button></span></td></tr>`);}).join('');
  const nx=b.lvl<3?BR_LVL[b.lvl+1]:null,up=brUpCost(r,b);
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>${R.city} branch</h2><span class="sub">${REGS[r].n} · ${lv.n} · ${n}/${lv.cap} people · opened ${fmtDate(b.open)}</span></div>
    <div class="ofwrap"><canvas id="rivalCanvas" role="img" aria-label="${R.city} branch"></canvas></div>
    <div class="legend pb" style="border-top:1px solid var(--line);margin:0">${Object.values(BR_ROLE).map(x=>`<span><i class="dot" style="background:var(--pt-${x.role})"></i>${x.n}</span>`).join('')}<span class="muted">Branch staff are local and managed separately from your headquarters team.</span></div></section>
  <div class="grid">
    <section class="panel"><div class="ph"><h2>Local team</h2><span class="sub">${money(sal)}/mo per person · skill ~${fx2(R.sk)}</span></div>
      <div class="tw"><table><thead><tr><th>Team</th><th class="r">People</th><th>Effect</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></section>
    <section class="panel"><div class="ph"><h2>Branch</h2></div><div class="pb col">
      <div class="kv"><span>Rent</span><b>${money(brRent(r,b))}/mo</b><span>Salaries</span><b>${money(n*sal)}/mo</b><span>Total cost</span><b class="neg">${money(brMonthly(r,b))}/mo</b><span>Regional revenue last month</span><b>${money(lastRegRev(r))}</b></div>
      <p class="small muted">${r==='asia'?"Singapore is ideal for an affordable, skilled R&D staff.":r==='na'?"San Francisco is expensive, but the most talented engineers are here.":r==='eu'?"Berlin is balanced: good engineers, reasonable salaries.":"São Paulo is very cheap; well suited to support and sales teams."}</p>
      <div class="row">${nx?`<button class="btn sm primary" data-act="brup" data-r="${r}" ${G.cash<up?'disabled':''}>${nx.n} (${nx.cap} people) ${money(up)}</button>`:"<span class=\"chip st-ok\">Max level</span>"}<button class="btn sm ghost" data-act="brclose" data-r="${r}">Close branch</button></div></div></section>
  </div>`:`<section class="panel"><div class="ph"><h2>${R.city} şubesi</h2><span class="sub">${REGS[r].n} · ${lv.n} · ${n}/${lv.cap} kişi · açılış ${fmtDate(b.open)}</span></div>
    <div class="ofwrap"><canvas id="rivalCanvas" role="img" aria-label="${R.city} şubesi"></canvas></div>
    <div class="legend pb" style="border-top:1px solid var(--line);margin:0">${Object.values(BR_ROLE).map(x=>`<span><i class="dot" style="background:var(--pt-${x.role})"></i>${x.n}</span>`).join('')}<span class="muted">Şube kadrosu yerel; ofis tabanındaki ekibinden ayrı yönetilir.</span></div></section>
  <div class="grid">
    <section class="panel"><div class="ph"><h2>Yerel ekip</h2><span class="sub">kişi başı ${money(sal)}/ay · yetenek ~${fx2(R.sk)}</span></div>
      <div class="tw"><table><thead><tr><th>Ekip</th><th class="r">Kişi</th><th>Etki</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></section>
    <section class="panel"><div class="ph"><h2>Şube</h2></div><div class="pb col">
      <div class="kv"><span>Kira</span><b>${money(brRent(r,b))}/ay</b><span>Maaşlar</span><b>${money(n*sal)}/ay</b><span>Toplam gider</span><b class="neg">${money(brMonthly(r,b))}/ay</b><span>Bölgeden geçen ay gelir</span><b>${money(lastRegRev(r))}</b></div>
      <p class="small muted">${r==='asia'?'Singapur ucuz ve yetenekli Ar-Ge kadrosu için ideal.':r==='na'?'San Francisco pahalı ama en yetenekli mühendisler burada.':r==='eu'?'Berlin dengeli: iyi mühendisler, makul maaşlar.':'São Paulo çok ucuz; destek ve satış ekipleri için uygun.'}</p>
      <div class="row">${nx?`<button class="btn sm primary" data-act="brup" data-r="${r}" ${G.cash<up?'disabled':''}>${nx.n} (${nx.cap} kişi) ${money(up)}</button>`:'<span class="chip st-ok">En üst seviye</span>'}<button class="btn sm ghost" data-act="brclose" data-r="${r}">Şubeyi kapat</button></div></div></section>
  </div>`);
}
const fx2=v=>fx(v,1);
const hhCost=c=>15000*infl()*(1+c.brand/40);
function rivalNotes(c){
  const n=[],occ=rivalOcc(c);
  if(c.neg>=1)n.push(['bad',(LANG_EN?`Most desks are empty, with boxes by the door. Those left look demoralized; bankruptcy or a sale seems near.`:`Masaların çoğu boş, kapının yanında koliler var. Kalanlar moralsiz; iflas ya da satış yakın görünüyor.`)]);
  else if(c.profit<0)n.push(['warn',(LANG_EN?`About ${Math.round((1-occ)*100)}% of the desks are empty, some with boxes on them: they're downsizing.`:`Masaların yaklaşık %${Math.round((1-occ)*100)}'i boş ve bazılarında koliler var: küçülüyorlar.`)]);
  else n.push(['ok',(LANG_EN?"The office is buzzing and the desks are full. They keep growing.":'Ofiste hareketli bir hava var, masalar dolu. Büyümeye devam ediyorlar.')]);
  if(c.aggr>0.6&&rivalThreat(c)>0.04)n.push(['bad',(LANG_EN?"Your company's name is crossed out on the whiteboard: they're targeting you directly. Expect a price war or copycat products.":'Beyaz tahtada senin şirketinin adı üstü çizili duruyor: seni doğrudan hedef alıyorlar. Fiyat savaşı ya da kopya ürün bekle.')]);
  else if(c.aggr<0.4)n.push(['mute',(LANG_EN?"Management is cautious; they're unlikely to move against you.":'Yönetim temkinli; sana karşı hamle yapma ihtimalleri düşük.')]);
  if(hasDeal(c.id))n.push(['ok',(LANG_EN?`Your partner (${dealsWith(c.id).map(d=>DEAL_T[d.type].toLocaleLowerCase(LOC)).join(', ')}). They're unlikely to move against you.`:`Ortağın: ${dealsWith(c.id).map(d=>DEAL_T[d.type].toLocaleLowerCase(LOC)).join(', ')}. Sana karşı hamle yapma ihtimalleri düşük.`)]);
  if(c.profit<0&&c.cash>0)n.push(['warn',(LANG_EN?`At this rate, their cash will last about ${Math.max(1,Math.floor(c.cash/-c.profit))} months.`:`Bu gidişle nakitleri yaklaşık ${Math.max(1,Math.floor(c.cash/-c.profit))} ay yeter.`)]);
  const last=G.products.filter(p=>p.owner===c.id).sort((a,b)=>b.launch-a.launch)[0];
  if(last)n.push(['mute',(LANG_EN?`Their latest product: ${last.name} (${Math.max(0,G.day-last.launch)} days ago).`:`Son çıkardıkları ürün: ${last.name} (${Math.max(0,G.day-last.launch)} gün önce).`)]);
  if(c.shops)n.push(['mute',(LANG_EN?`They run a retail chain of ${c.shops} stores; hardware products are more appealing in stores.`:`${c.shops} mağazalık bir perakende zincirleri var; donanım ürünleri mağazalarda daha çekici.`)]);
  if(c.bun)n.push(['mute',(LANG_EN?"They sell their subscription products in a discounted bundle; their users rarely churn.":'Abonelik ürünlerini indirimli bir pakette satıyorlar; kullanıcıları zor kopuyor.')]);
  if(c.aiw)n.push(['mute',(LANG_EN?"AI agents work alongside their engineers; their tech advances a bit faster each month.":'Mühendislerin yanında yapay zekâ ajanları çalışıyor; teknolojileri her ay biraz daha hızlı ilerliyor.')]);
  n.push(['mute',(LANG_EN?`Their engineering level is ${Math.round(c.tech*100)}% of the market standard.`:`Mühendislik seviyeleri pazar standardının %${Math.round(c.tech*100)}'i.`)]);
  return n;
}
function vRivalOffice(c){
  const [st,cl]=compStatus(c),ps=G.products.filter(p=>p.active&&p.owner===c.id).sort((a,b)=>b.share-a.share);
  const cool=(c.hhAt||-999)+120-G.day,cost=hhCost(c),price=compVal(c)*1.2;
  const notes=rivalNotes(c).map(([k,t])=>`<li><span class="chip ${k==='bad'?'st-bad':k==='warn'?'st-warn':k==='ok'?'st-ok':'st-mute'}">${k==='bad'?(LANG_EN?"Warning":'Dikkat'):k==='warn'?(LANG_EN?"Weak":'Zayıf'):k==='ok'?(LANG_EN?"Strong":'Güçlü'):(LANG_EN?"Info":'Bilgi')}</span><span>${esc(t)}</span></li>`).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>${esc(c.name)}</h2><span class="row"><span class="chip ${cl}">${st}</span>${aggrChip(c)}<span class="sub">${RTIER_N[rivalTier(c)]} · ${num(c.emp)} employees · ~${rivalFloors(c)} floors</span></span></div>
    <div class="ofwrap"><canvas id="rivalCanvas" role="img" aria-label="${esc(c.name)} office"></canvas></div>
    <div class="legend pb" style="border-top:1px solid var(--line);margin:0">${ROLE_ORDER.filter(r=>rivalRoleW(c)[r]>0).map(r=>`<span><i class="dot" style="background:var(--pt-${r})"></i>${ROLES[r].n}</span>`).join('')}<span class="muted">One floor of the office is shown. Empty desks and boxes mean downsizing; sad faces mean low morale.</span></div></section>
  <div class="grid">
    <section class="panel"><div class="ph"><h2>Office observations</h2></div><ul class="alerts">${notes}</ul></section>
    <section class="panel"><div class="ph"><h2>Company card</h2><span class="sub">founded ${c.born>0?fmtDate(c.born):"Before 2015"}</span></div><div class="pb col">
      <div class="kv"><span>Cash</span><b class="${c.cash<0?'neg':''}">${money(c.cash)}</b><span>Monthly profit</span><b class="${c.profit>=0?'pos':'neg'}">${money(c.profit)}</b><span>Brand</span><b>${fx(c.brand,0)}</b><span>Value</span><b>${money(compVal(c))}</b><span>Focus</span><b class="small">${c.focus.map(f=>CATS[f].n).join(', ')}</b><span>Regions</span><b class="small">${(c.reg||['tr']).map(r=>REGS[r].n).join(', ')}</b></div>
      <div class="row"><span>CEO <b>${esc(ceoOf(c).name)}</b> <span class="chip ${PERS[ceoOf(c).p].c}">${PERS[ceoOf(c).p].n}</span></span></div>
      <div class="row"><span>Relationship ${relChip(c)}${dealsWith(c.id).length?` · ${dealsWith(c.id).length} active deals`:''}</span></div>
      <div class="small">Patents: ${initPats(c),Object.entries(c.pats).filter(([k,v])=>v>0).map(([k,v])=>`${CATS[k].n} ${v}`).join(', ')||'yok'}${crossWith(c.id)?" · <span class=\"pos\">cross-license</span>":''}${G.cases.some(k=>k.cid===c.id)?" · <span class=\"warn\">ongoing lawsuit</span>":''}</div>
      <div class="row"><button class="btn sm primary" data-act="dealwith" data-id="${c.id}">Propose deal</button><button class="btn sm" data-act="suenew" data-id="${c.id}">Sue</button><button class="btn sm" data-act="buy" data-id="${c.id}" ${G.cash<price?'disabled':''}>Buy ${money(price)}</button></div></div></section>
  </div>
  <div class="grid">
    <section class="panel"><div class="ph"><h2>Their products</h2></div>${ps.length?`<div class="tw"><table><thead><tr><th>Product</th><th>Category</th><th class="r">Freshness</th><th class="r">Price</th><th class="r">Share</th></tr></thead><tbody>${ps.map(p=>`<tr><td><b>${esc(p.name)}</b></td><td>${CATS[p.cat].n}</td><td class="r num ${p.score/S(p.cat)<0.8?'warn':''}">${pct(p.score/S(p.cat),0)}</td><td class="r num">${CATS[p.cat].ref?money(p.price):"Free"}</td><td class="r num">${pct(p.share,1)}</td></tr>`).join('')}</tbody></table></div>`:"<div class=\"empty\">They have no products on the market.</div>"}</section>
    <section class="panel"><div class="ph"><h2>Talent poaching</h2><span class="sub">hire a headhunter</span></div><div class="pb col">
      <p class="small">A headhunter tries to win over one of ${esc(c.name)} employees for you. The candidate's skill reflects the rival's engineering level, but they ask for 25% more salary and wait on your candidate list for 30 days.${c.aggr>0.6?" <span class=\"neg\">An aggressive company may notice and retaliate.</span>":''}</p>
      <div class="row"><button class="btn sm primary" data-act="headhunt" data-id="${c.id}" ${cool>0||G.cash<cost||G.emps.length>=officeCap()?'disabled':''}>${cool>0?`Again in ${cool} days`:`Hire a headhunter ${money(cost)}`}</button>${G.emps.length>=officeCap()?"<span class=\"small muted\">Office full</span>":''}</div></div></section>
  </div>`:`<section class="panel"><div class="ph"><h2>${esc(c.name)}</h2><span class="row"><span class="chip ${cl}">${st}</span>${aggrChip(c)}<span class="sub">${RTIER_N[rivalTier(c)]} · ${num(c.emp)} çalışan · ~${rivalFloors(c)} kat</span></span></div>
    <div class="ofwrap"><canvas id="rivalCanvas" role="img" aria-label="${esc(c.name)} ofisi"></canvas></div>
    <div class="legend pb" style="border-top:1px solid var(--line);margin:0">${ROLE_ORDER.filter(r=>rivalRoleW(c)[r]>0).map(r=>`<span><i class="dot" style="background:var(--pt-${r})"></i>${ROLES[r].n}</span>`).join('')}<span class="muted">Ofisin bir katı gösteriliyor. Boş masa ve koliler küçülmeyi, üzgün yüzler düşük morali gösterir.</span></div></section>
  <div class="grid">
    <section class="panel"><div class="ph"><h2>Ofis gözlemleri</h2></div><ul class="alerts">${notes}</ul></section>
    <section class="panel"><div class="ph"><h2>Şirket kartı</h2><span class="sub">kuruluş ${c.born>0?fmtDate(c.born):'2015 öncesi'}</span></div><div class="pb col">
      <div class="kv"><span>Nakit</span><b class="${c.cash<0?'neg':''}">${money(c.cash)}</b><span>Aylık kâr</span><b class="${c.profit>=0?'pos':'neg'}">${money(c.profit)}</b><span>Marka</span><b>${fx(c.brand,0)}</b><span>Değer</span><b>${money(compVal(c))}</b><span>Alanlar</span><b class="small">${c.focus.map(f=>CATS[f].n).join(', ')}</b><span>Bölgeler</span><b class="small">${(c.reg||['tr']).map(r=>REGS[r].n).join(', ')}</b></div>
      <div class="row"><span>CEO <b>${esc(ceoOf(c).name)}</b> <span class="chip ${PERS[ceoOf(c).p].c}">${PERS[ceoOf(c).p].n}</span></span></div>
      <div class="row"><span>İlişki ${relChip(c)}${dealsWith(c.id).length?` · ${dealsWith(c.id).length} aktif anlaşma`:''}</span></div>
      <div class="small">Patentler: ${(initPats(c),Object.entries(c.pats).filter(([k,v])=>v>0).map(([k,v])=>`${CATS[k].n} ${v}`).join(', ')||'yok')}${crossWith(c.id)?' · <span class="pos">çapraz lisans</span>':''}${G.cases.some(k=>k.cid===c.id)?' · <span class="warn">süren dava</span>':''}</div>
      <div class="row"><button class="btn sm primary" data-act="dealwith" data-id="${c.id}">Anlaşma öner</button><button class="btn sm" data-act="suenew" data-id="${c.id}">Dava aç</button><button class="btn sm" data-act="buy" data-id="${c.id}" ${G.cash<price?'disabled':''}>Satın al ${money(price)}</button></div></div></section>
  </div>
  <div class="grid">
    <section class="panel"><div class="ph"><h2>Ürünleri</h2></div>${ps.length?`<div class="tw"><table><thead><tr><th>Ürün</th><th>Kategori</th><th class="r">Güncellik</th><th class="r">Fiyat</th><th class="r">Pay</th></tr></thead><tbody>${ps.map(p=>`<tr><td><b>${esc(p.name)}</b></td><td>${CATS[p.cat].n}</td><td class="r num ${p.score/S(p.cat)<0.8?'warn':''}">${pct(p.score/S(p.cat),0)}</td><td class="r num">${CATS[p.cat].ref?money(p.price):'Ücretsiz'}</td><td class="r num">${pct(p.share,1)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Piyasada ürünleri yok.</div>'}</section>
    <section class="panel"><div class="ph"><h2>Yetenek avı</h2><span class="sub">bir headhunter tut</span></div><div class="pb col">
      <p class="small">Bir headhunter ${esc(c.name)} çalışanlarından birini senin için ikna etmeye çalışır. Gelen aday rakibin mühendislik seviyesine göre yetenekli olur, ama %25 fazla maaş ister ve 30 gün aday listende bekler.${c.aggr>0.6?' <span class="neg">Saldırgan bir şirket bunu fark edip misilleme yapabilir.</span>':''}</p>
      <div class="row"><button class="btn sm primary" data-act="headhunt" data-id="${c.id}" ${cool>0||G.cash<cost||G.emps.length>=officeCap()?'disabled':''}>${cool>0?`${cool} gün sonra tekrar`:`Headhunter tut ${money(cost)}`}</button>${G.emps.length>=officeCap()?'<span class="small muted">Ofis dolu</span>':''}</div></div></section>
  </div>`);
}
function vOfficePick(){
  const live=liveComps().sort((a,b)=>b.emp-a.emp),own=!UI.rival&&!UI.branch;
  return (LANG_EN?`<div class="of-pick" role="group" aria-label="Offices"><button class="btn sm ${own?'primary':''}" data-act="rival" data-id="">Our office</button>${Object.keys(G.branches||{}).map(r=>`<button class="btn sm ${UI.branch===r?'primary':''}" data-act="branch" data-r="${r}">${BR[r].city} branch</button>`).join('')}
    <label class="of-rsel" for="ofpick"><span class="small muted">Rival office</span><select id="ofpick" data-bind="ofpick"><option value="">Select…</option>${live.map(c=>`<option value="${c.id}" ${UI.rival===c.id?'selected':''}>${esc(c.name)} · ${num(c.emp)} people</option>`).join('')}</select></label></div>`:`<div class="of-pick" role="group" aria-label="Ofisler"><button class="btn sm ${own?'primary':''}" data-act="rival" data-id="">Ofisimiz</button>${Object.keys(G.branches||{}).map(r=>`<button class="btn sm ${UI.branch===r?'primary':''}" data-act="branch" data-r="${r}">${BR[r].city} şubesi</button>`).join('')}
    <label class="of-rsel" for="ofpick"><span class="small muted">Rakip ofisi</span><select id="ofpick" data-bind="ofpick"><option value="">Seç…</option>${live.map(c=>`<option value="${c.id}" ${UI.rival===c.id?'selected':''}>${esc(c.name)} · ${num(c.emp)} kişi</option>`).join('')}</select></label></div>`);
}
function drawOffice(now){
  const cv=document.getElementById('officeCanvas');if(!cv||!G)return;
  if(now-OV.last<(G.speed||(OV.cheer&&now<OV.cheer)?30:66)*(OV.mob?1.5:1))return;OV.mob=isMob();
  const dt=Math.min(0.1,(now-(OV.last||now))/1000);OV.last=now;
  officeLayout();
  const L=OV.L,cssW=cv.parentElement.clientWidth;if(!cssW)return;
  const span=(L.W+L.H)/2,tw=Math.min(92,cssW/span*0.97),s=tw/64,th=tw/2,wallH=82;
  const cssH=Math.round(span*th+wallH*s+24*s);
  const dpr=Math.min(2,window.devicePixelRatio||1);
  if(cv.width!==Math.round(cssW*dpr)||cv.height!==Math.round(cssH*dpr)){cv.width=Math.round(cssW*dpr);cv.height=Math.round(cssH*dpr);cv.style.height=cssH+'px';}
  const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cssW,cssH);
  Object.assign(OV,{ctx,tw,th,s,cssW,ox:(cssW-(L.W+L.H)*tw/2)/2+L.H*tw/2,oy:wallH*s+12*s});
  const C=ofColors(),W=L.W,H=L.H,font=OV.font||(OV.font=getComputedStyle(document.body).fontFamily);
  updateChars(dt,now);
  OV.hits=[];
  const FL=UI.floor||0,nav=navGrid(FL),room=nav.rm;
  /* floor slab + tiles */
  poly([P(0,H,0),P(W,H,0),P(W,H,-7),P(0,H,-7)],C.slabL);
  poly([P(W,0,0),P(W,H,0),P(W,H,-7),P(W,0,-7)],C.slabR);
  const fl=C.floor[L.f];
  for(let i=0;i<W;i++)for(let j=0;j<H;j++){
    if(L.f==='wood')poly([P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)],fl[(i+(j>>1))%2]);
    else poly([P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)],fl[(i+j)%2]);
  }
  if(L.f==='concrete'){const [a,b]=P(2.6,3.4);ellipse(a,b,tw*0.5,th*0.35,C.stain);}
  for(const rf of nav.rooms||[])poly([P(rf.x,rf.y),P(rf.x+3,rf.y),P(rf.x+3,rf.y+3),P(rf.x,rf.y+3)],C.roomFloor);
  /* walls */
  poly([P(0,0,0),P(0,H,0),P(0,H,wallH),P(0,0,wallH)],C.wallL);
  poly([P(0,0,0),P(W,0,0),P(W,0,wallH),P(0,0,wallH)],C.wallR);
  ctx.strokeStyle=C.cap;ctx.lineWidth=3*s;ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(...P(0,H,wallH));ctx.lineTo(...P(0,0,wallH));ctx.lineTo(...P(W,0,wallH));ctx.stroke();
  ctx.lineWidth=1.5*s;ctx.beginPath();ctx.moveTo(...P(0,0,0));ctx.lineTo(...P(0,0,wallH));ctx.stroke();
  drawHolidayLights(W,H,wallH,now);
  if(G.office===0){
    const gx0=1,gx1=W-2.2;poly([P(gx0,0,0),P(gx1,0,0),P(gx1,0,58),P(gx0,0,58)],C.frame);
    for(let z=4;z<58;z+=7)poly([P(gx0+0.08,0,z),P(gx1-0.08,0,z),P(gx1-0.08,0,z+4.5),P(gx0+0.08,0,z+4.5)],C.stripe);
    box(W-1.9,0.05,1.5,0.35,40,0,C.deskT,C.deskL,C.deskR);
    for(let k=0;k<3;k++)box(W-1.8+k*0.45,0.08,0.3,0.25,9,40,[C.role.hw,C.accent,C.role.soft][k],C.monR,C.mon);
  }else{
    const n=Math.floor((W-1.5)/2.2),big=G.office>=3;
    for(let k=0;k<n;k++){const x0=0.8+k*2.2,x1=x0+(big?1.9:1.5),z0=big?14:24,z1=big?72:62;
      poly([P(x0,0,z0),P(x1,0,z0),P(x1,0,z1),P(x0,0,z1)],C.frame);
      const g=ctx.createLinearGradient(...P(x0,0,z1),...P(x0,0,z0));const SKc=skyCols(C);g.addColorStop(0,SKc[0]);g.addColorStop(1,SKc[1]);
      poly([P(x0+0.07,0,z0+3),P(x1-0.07,0,z0+3),P(x1-0.07,0,z1-3),P(x0+0.07,0,z1-3)],g);
      if(PREF.dn==='off'?C.dark:DN.dl<0.35)for(let q=0;q<4;q++){const [a,b]=P(x0+0.2+hash(k*9+q)*(x1-x0-0.4),0,z0+8+hash(k*5+q*3)*(z1-z0-16));ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(a,b,1.4,1.4);}
      seasonPane(x0,x1,z0,z1,k,now);
      const mx=(x0+x1)/2;poly([P(mx-0.02,0,z0),P(mx+0.02,0,z0),P(mx+0.02,0,z1),P(mx-0.02,0,z1)],C.frame);
    }
  }
  /* left wall: whiteboard, logo, door */
  const wb=hasElev()?3.3:0;
  poly([P(0,0.9+wb,26),P(0,2.9+wb,26),P(0,2.9+wb,56),P(0,0.9+wb,56)],C.frame);
  poly([P(0,1.0+wb,28),P(0,2.8+wb,28),P(0,2.8+wb,54),P(0,1.0+wb,54)],C.board);
  ctx.lineWidth=Math.max(1,1.2*s);
  [[C.role.soft,.2],[C.role.design,.45],[C.accent,.7]].forEach(([col,v],k)=>{ctx.strokeStyle=col;ctx.beginPath();const a=P(0,1.2+wb,30+v*20),b=P(0,1.2+wb+0.6+hash(k+G.office)*0.8,30+v*20);ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();});
  if(H>6){const ly=3.5+wb,im=biImg();if(im){const O=P(0,ly+0.95,66),U=P(0,ly-0.05,66),V=P(0,ly+0.95,32);ctx.save();ctx.transform((U[0]-O[0])/100,(U[1]-O[1])/100,(V[0]-O[0])/100,(V[1]-O[1])/100,O[0],O[1]);ctx.drawImage(im,0,0,100,100);ctx.restore();}else{poly([P(0,ly,40),P(0,ly+0.9,40),P(0,ly+0.9,60),P(0,ly,60)],C.accent);poly([P(0,ly+0.2,45),P(0,ly+0.7,45),P(0,ly+0.7,55),P(0,ly+0.2,55)],C.wallL);}}
  if(FL===0){poly([P(0,H-2.2,0),P(0,H-1.2,0),P(0,H-1.2,54),P(0,H-2.2,54)],C.doorD);
    poly([P(0,H-2.12,0),P(0,H-1.28,0),P(0,H-1.28,50),P(0,H-2.12,50)],C.door);
    {const [a,b]=P(0,H-1.45,25);ellipse(a,b,1.6*s,1.6*s,C.cap);}}
  if(hasElev())drawElevator(FL,C,now);
  /* break area rug */
  poly([P(W-2.95,0.6),P(W-0.3,0.6),P(W-0.3,3.0),P(W-2.95,3.0)],C.rug);
  /* edit overlay: free tiles */
  if(UI.edit){
    const req=new Set(requiredTiles(nav).map(([a,b])=>b*W+a));
    for(let i=0;i<W;i++)for(let j=0;j<H;j++){const k=j*W+i;
      if(nav.blk[k]||nav.room[k]||req.has(k)||(i>=W-3&&j<=3))continue;
      ctx.globalAlpha=.4;poly([P(i+.06,j+.06),P(i+.94,j+.06),P(i+.94,j+.94),P(i+.06,j+.94)],null,C.accent,0.8);ctx.globalAlpha=1;}
  }
  /* collect objects */
  const objs=[];const add=(d,f)=>objs.push({d,f});
  const occ=new Map();for(const c of OV.chars.values())if((!c.inMt||c.mode==='walk')&&c.fl===c.dfl)occ.set(c.desk,c);
  const aiA=new Map();if(G.aiw&&aiwOn())for(const t of Object.keys(AIW_R)){let n=aiwEff(t);for(const e of aiwHum(t)){if(n<=0)break;const k=Math.min(AIW_PER,n);aiA.set(e.id,k);n-=k;}}
  OV.desks.forEach((d,i)=>{
    if(d.fl!==FL)return;
    const c=occ.get(i),on=!!(c&&c.atDesk),role=c?c.e.role:'soft';
    add(d.x+d.y,()=>{
      box(d.x-0.45,d.y-0.25,0.9,0.5,17,0,C.deskT,C.deskL,C.deskR);
      box(d.x-0.04,d.y-0.12,0.08,0.06,4,17,C.mon,C.mon,C.monR);
      box(d.x-0.24,d.y-0.17,0.48,0.05,16,20,C.mon,C.mon,C.monR);
      screen((u,v)=>P(d.x-0.24+0.48*u,d.y-0.12,20+16*v),role,on,now,i*3.7,C);
      if(on&&C.glow){const [a,b]=P(d.x,d.y+0.1,24);const g=ctx.createRadialGradient(a,b,0,a,b,26*s);g.addColorStop(0,C.glow);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(a-26*s,b-26*s,52*s,52*s);}
      box(d.x-0.18,d.y+0.05,0.36,0.1,1.5,17,C.key,C.key,C.key);
      const ak=c?aiA.get(c.e.id)||0:0;for(let q=0;q<ak;q++){const bob=reduceMotion()?0:Math.sin(now/520+i*1.7+q*2)*2.2,[a,b]=P(d.x+(q?0.36:-0.36),d.y-0.22,42+bob),r=5.4*s;
        ctx.fillStyle='rgba(21,170,191,.22)';ctx.beginPath();ctx.arc(a,b,r*1.9,0,Math.PI*2);ctx.fill();ellipse(a,b,r,r*0.86,'#15AABF');ctx.fillStyle='#fff';ctx.fillRect(a-r*0.5,b-r*0.2,r*0.32,r*0.36);ctx.fillRect(a+r*0.18,b-r*0.2,r*0.32,r*0.36);
        ctx.strokeStyle='#15AABF';ctx.lineWidth=Math.max(1,s);ctx.beginPath();ctx.moveTo(a,b-r*0.86);ctx.lineTo(a,b-r*1.45);ctx.stroke();}
      if(c&&c.e.role==='hw')box(d.x+0.24,d.y-0.05,0.16,0.14,2,17,C.role.hw,C.role.hw,C.role.hw);
      if(c&&c.e.role==='res'){const [a,b]=P(d.x+0.32,d.y,23);ellipse(a,b,3*s,3.4*s,C.role.res);}
      if(!c&&!UI.edit){const ab=OV.absent&&OV.absent.get(i);if(ab){const [a,b]=P(d.x,d.y,44);ctx.font=`600 ${9*s}px ${OV.font}`;ctx.textAlign='center';ctx.fillStyle=C.tip;ctx.fillText(ab.leave.type==='vac'?(LANG_EN?"ON VACATION":'TATİLDE'):(LANG_EN?"ON LEAVE":'İZİNDE'),a,b);}
        OV.hits.push({desk:i,emp:ab?ab.id:null,x0:P(d.x-0.45,d.y+0.25,0)[0],x1:P(d.x+0.45,d.y-0.25,0)[0],y0:P(d.x-0.45,d.y-0.25,20)[1],y1:P(d.x+0.45,d.y+0.25,0)[1]});}
    });
    add(d.x+d.y+0.6,()=>{box(d.x-0.16,d.y+0.5,0.32,0.26,9,0,C.chairT,C.chair,C.chair);if(!(c&&c.atDesk))box(d.x-0.16,d.y+0.72,0.32,0.06,22,0,C.chairT,C.chair,C.chair);});
  });
  for(const c of OV.chars.values())if(c.fl===FL)add(c.x+c.y+(c.mode==='sit'?0.05:0),()=>drawChar(c,C,now));
  add(W-1.0+0.4,()=>{box(W-1.35,0.15,0.6,0.42,30,0,C.coffeeT,C.coffee,C.coffee);const [a,b]=P(W-1.0,0.57,22);ellipse(a,b,1.6*s,1.6*s,(Math.floor(now/600)%2)?C.accent:C.coffeeT);});
  add(W-2.6+1.6,()=>{box(W-2.65,1.35,1.3,0.16,24,0,C.sofaT,C.sofa,C.sofa);box(W-2.65,1.5,1.3,0.5,11,0,C.sofaT,C.sofa,C.sofa);});
  const plant=(x,y,sz)=>add(x+y,()=>{box(x-0.15,y-0.15,0.3,0.3,12*sz,0,C.potT,C.pot,C.pot);const [a,b]=P(x,y,12*sz+9*sz);ellipse(a,b,8*s*sz,7*s*sz,C.plant);ellipse(a-3*s*sz,b-4*s*sz,5*s*sz,4.5*s*sz,C.plant2);});
  plant(W-0.45,3.2,1);plant(0.45,0.5,1.2);
  if(hasElev())add(0.45+2.2,()=>drawStairs(C));
  if(G.office>=2){plant(W-3.6,0.45,1);plant(0.5,H-0.6,1.1);}
  if(G.office>=3){plant(W-0.45,H-0.5,1.3);plant(W-3.6,H-0.5,1);}
  const rk=Math.min(G.racks,6);
  for(let i=0;i<rk;i++){const x=W-1.55+(i%2)*0.7,y=H-1.05-Math.floor(i/2)*0.75;
    add(x+y+0.5,()=>{box(x,y,0.5,0.4,44,0,C.rackT,C.rack,C.rack);for(let q=0;q<5;q++){const [a,b]=P(x+0.1+(q%2)*0.25,y+0.4,10+q*7);ctx.fillStyle=hash(i*11+q+Math.floor(now/(250+q*60)))>0.4?C.role.ops:C.accent;ctx.fillRect(a,b,2*s,1.6*s);}});}
  /* placed furniture */
  for(const f of G.furn){
    if((f.fl||0)!==FL)continue;
    const [w,d]=fdim(f);
    if(FURN[f.t].room){
      drawRoomFull(f,C,now,add);
      if(FURN[f.t].dept)poly([P(f.x,f.y),P(f.x+3,f.y),P(f.x+3,f.y+3),P(f.x,f.y+3)],null,C.role[FURN[f.t].dept],1);
    }else add(f.x+w/2+f.y+d/2,()=>drawFurn(f,C,now));
  }
  objs.sort((a,b)=>a.d-b.d).forEach(o=>o.f());
  if(room&&G.meeting&&(G.meeting.fl||0)===FL){const [a,b]=P(room.x+1.5,room.y+1.5,62);ctx.font=`600 ${11}px ${font}`;const t=MEET[G.meeting.t].n.toLocaleUpperCase(LOC),w=ctx.measureText(t).width+16;rrect(a-w/2,b-11,w,20,3,C.tip);ctx.fillStyle=C.tipText;ctx.textAlign='center';ctx.fillText(t,a,b+3);}
  /* edit: selection + ghost */
  if(UI.edit){
    const sf=G.furn.find(f=>f.id===UI.selFurn);
    if(sf){const [w,d]=fdim(sf);poly([P(sf.x,sf.y),P(sf.x+w,sf.y),P(sf.x+w,sf.y+d),P(sf.x,sf.y+d)],null,C.accent,2.5);}
    const ht=OV.hoverTile;
    if(UI.placing&&ht){
      const [w,d]=fdimT(UI.placing,UI.rot),x=ht[0]-Math.floor((w-1)/2),y=ht[1]-Math.floor((d-1)/2);
      const key=[UI.placing,x,y,UI.rot,G.furnVer,G.office].join(',');
      if(OV.ghostKey!==key){OV.ghostKey=key;OV.ghost=placeCheck(UI.placing,x,y,UI.rot);}
      const ok=OV.ghost.ok;
      poly([P(x,y),P(x+w,y),P(x+w,y+d),P(x,y+d)],ok?C.ok:C.bad,ok?C.role.ops:'#C92A2A',2);
      ctx.globalAlpha=.65;
      if(FURN[UI.placing].room){const g={t:UI.placing,x,y,r:0},tmp=[];drawRoomFull(g,C,now,(d,fn)=>tmp.push({d,fn}));tmp.sort((a,b)=>a.d-b.d).forEach(o=>o.fn());}
      else drawFurn({t:UI.placing,x,y,r:UI.rot},C,now);
      ctx.globalAlpha=1;
      const [a,b]=P(x+w/2,y+d/2,FURN[UI.placing].room?64:56);ctx.font=`600 11px ${font}`;const t=OV.ghost.why,tw2=ctx.measureText(t).width+16;
      rrect(a-tw2/2,b-12,tw2,20,3,C.tip);ctx.fillStyle=C.tipText;ctx.textAlign='center';ctx.fillText(t,a,b+2);
    }else if(ht){const f=furnAt(ht[0],ht[1]);if(f&&f.id!==UI.selFurn){const [w,d]=fdim(f);poly([P(f.x,f.y),P(f.x+w,f.y),P(f.x+w,f.y+d),P(f.x,f.y+d)],null,C.accent,1.5);}}
  }
  /* gece: karartma, monitör ışıkları */
  if(PREF.dn!=='off'&&DN.dl<0.995){
    ctx.globalCompositeOperation='source-atop';ctx.fillStyle=`rgba(8,14,40,${((1-DN.dl)*(C.dark?0.3:0.42)).toFixed(3)})`;ctx.fillRect(0,0,cssW,cssH);ctx.globalCompositeOperation='source-over';
    if(DN.dl<0.7){const k=(0.7-DN.dl)/0.7;ctx.globalCompositeOperation='lighter';
      (OV.desks||[]).forEach((d,i)=>{if((d.fl||0)!==FL||!G.emps.some(e=>e.desk===i&&!e.leave))return;const [a,b]=P(d.x+0.5,d.y+0.35,34),r=30*s;
        const gr=ctx.createRadialGradient(a,b,0,a,b,r);gr.addColorStop(0,`rgba(150,195,255,${(0.32*k).toFixed(3)})`);gr.addColorStop(1,'rgba(150,195,255,0)');ctx.fillStyle=gr;ctx.fillRect(a-r,b-r,r*2,r*2);});
      ctx.globalCompositeOperation='source-over';}
  }
  /* particles */
  OV.parts=OV.parts.filter(p=>(p.life-=dt)>0);
  ctx.textAlign='center';
  for(const p of OV.parts){
    ctx.globalAlpha=Math.min(1,p.life/p.max*1.6);
    if(p.conf){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=40*dt;ctx.fillStyle=p.conf==='acc'?C.accent:C.role[p.conf];ctx.fillRect(p.x,p.y,4*s,2.5*s);}
    else if(p.badge){p.y+=p.vy*dt;ctx.font=`700 ${8.5*s}px ${font}`;const w=ctx.measureText(p.t).width+8*s;rrect(p.x-w/2,p.y-8.5*s,w,11.5*s,3*s,C.role[p.col]||C.accent);ctx.fillStyle='#fff';ctx.fillText(p.t,p.x,p.y);}
    else{p.y+=p.vy*dt;ctx.fillStyle=C.role[p.col]||C.accent;ctx.font=`600 ${10*s}px ${font}`;ctx.fillText(p.t,p.x,p.y);}
  }
  ctx.globalAlpha=1;
  /* hover tooltip */
  const hc=!UI.edit&&OV.hover!=null?OV.chars.get(OV.hover):null;
  if(hc){
    const e=hc.e,[sx,sy]=P(hc.x,hc.y,0),l1=e.name,l2=(LANG_EN?`${e.mgr||e.founder?levelTitle(e):LEVELS[e.level||0]+' '+ROLES[e.role].n} · skill ${fx(e.skill,1)}`:`${e.mgr||e.founder?levelTitle(e):LEVELS[e.level||0]+' '+ROLES[e.role].n} · yetenek ${fx(e.skill,1)}`),l3=empTask(e),l4=(LANG_EN?`Morale ${Math.round(e.morale)} · Energy ${Math.round(e.energy)}`:`Moral ${Math.round(e.morale)} · Enerji ${Math.round(e.energy)}`),l5=knownTraits(e).map(t=>TRAITS[t].n).join(', ')+((e.tr||[]).length>1&&!e.rev?' · ?':'');
    ctx.font=`600 12px ${font}`;const w=Math.max(ctx.measureText(l1).width,ctx.measureText(l2).width,ctx.measureText(l3).width,ctx.measureText(l5).width)+20;
    let bx=Math.min(cssW-w-4,Math.max(4,sx-w/2)),by=Math.max(4,sy-48*s-86);
    rrect(bx,by,w,82,4,C.tip);ctx.textAlign='left';ctx.fillStyle=C.tipText;ctx.fillText(l1,bx+10,by+18);ctx.font=`400 11px ${font}`;ctx.fillText(l2,bx+10,by+33);ctx.fillText(l4,bx+10,by+61);ctx.fillText(l5,bx+10,by+75);ctx.fillStyle=C.role[e.role];ctx.fillText(l3,bx+10,by+47);
  }else if(!UI.edit&&OV.hoverDesk!=null){const d=OV.desks[OV.hoverDesk];if(d){const [sx,sy]=P(d.x,d.y,30);ctx.font=`600 12px ${font}`;const ab=OV.absent&&OV.absent.get(OV.hoverDesk),t=ab?(LANG_EN?`${ab.name} · ${LEAVE_N[ab.leave.type]} · ${ab.leave.until-G.day} days`:`${ab.name} · ${LEAVE_N[ab.leave.type]} · ${ab.leave.until-G.day} gün`):(LANG_EN?"Empty desk · click to hire":'Boş masa · işe alım için tıkla'),w=ctx.measureText(t).width+20;rrect(Math.min(cssW-w-4,Math.max(4,sx-w/2)),sy-34,w,24,4,C.tip);ctx.fillStyle=C.tipText;ctx.textAlign='center';ctx.fillText(t,Math.min(cssW-w/2-4,Math.max(4+w/2,sx)),sy-18);}}
  if(!OV.clean){const tags=[];if(hasElev())tags.push(floorName(FL).toLocaleUpperCase(LOC));if(UI.edit)tags.push((LANG_EN?"EDIT MODE":'DÜZENLEME MODU'));if(!G.speed&&!G.over)tags.push(G.pending?(LANG_EN?"DECISION PENDING":'KARAR BEKLENİYOR'):'DURAKLATILDI');if(cyberDown())tags.push(OV.cyT=(LANG_EN?`CYBERATTACK · ${G.cyber.down-G.day}-DAY OUTAGE`:`SİBER SALDIRI · ${G.cyber.down-G.day} GÜN KESİNTİ`));
    let tx=10;ctx.font=`600 11px ${font}`;ctx.textAlign='left';for(const t of tags){const w=ctx.measureText(t).width+18;rrect(tx,10,w,22,3,t===OV.cyT?'#C92A2A':t===(LANG_EN?"EDIT MODE":'DÜZENLEME MODU')?C.accent:C.tip);ctx.fillStyle=t===(LANG_EN?"EDIT MODE":'DÜZENLEME MODU')||t===OV.cyT?'#fff':C.tipText;ctx.fillText(t,tx+9,25);tx+=w+6;}}
  if(!OV.clean&&(PREF.dn!=='off'||PREF.season)){ctx.font=`600 11px ${font}`;const t=[PREF.dn!=='off'?(DN.dl>0.5?'☀ ':'☾ ')+dnClock():'',PREF.season?SEASON_TR[curSeason()]:''].filter(Boolean).join(' · '),w=ctx.measureText(t).width+18;rrect(cssW-w-10,10,w,22,3,C.tip);ctx.fillStyle=C.tipText;ctx.textAlign='left';ctx.fillText(t,cssW-w-1,25);}
}
function officeHit(e){
  const cv=e.target,r=cv.getBoundingClientRect(),zk=r.width?cv.clientWidth/r.width:1,x=(e.clientX-r.left)*zk,y=(e.clientY-r.top)*zk;
  for(let i=OV.hits.length-1;i>=0;i--){const h=OV.hits[i];if(x>=h.x0&&x<=h.x1&&y>=h.y0&&y<=h.y1)return h;}
  return null;
}
function hoverTileOf(e){
  const r=e.target.getBoundingClientRect(),zk=r.width?e.target.clientWidth/r.width:1,mx=(e.clientX-r.left)*zk,my=(e.clientY-r.top)*zk;
  const a=(mx-OV.ox)/(OV.tw/2),b=(my-OV.oy)/(OV.th/2);
  return [Math.floor((a+b)/2),Math.floor((b-a)/2)];
}
document.addEventListener('mousemove',e=>{
  if(e.target.id!=='officeCanvas'){if(OV.hover!=null||OV.hoverDesk!=null||OV.hoverTile){OV.hover=null;OV.hoverDesk=null;OV.hoverTile=null;}return;}
  OV.hoverTile=hoverTileOf(e);
  if(UI.edit){OV.hover=null;OV.hoverDesk=null;const t=OV.hoverTile;e.target.style.cursor=UI.placing||furnAt(t[0],t[1])?'pointer':'default';return;}
  const h=officeHit(e);OV.hover=h&&h.id!=null?h.id:null;OV.hoverDesk=h&&h.desk!=null?h.desk:null;
  e.target.style.cursor=h?'pointer':'default';
});
function officeClick(e){
  if(UI.edit){
    const t=hoverTileOf(e);OV.hoverTile=t;
    if(UI.placing){const [w,d]=fdimT(UI.placing,UI.rot);act('place',{t:UI.placing,x:t[0]-Math.floor((w-1)/2),y:t[1]-Math.floor((d-1)/2)});return;}
    const f=furnAt(t[0],t[1]);UI.selFurn=f?f.id:null;UI.force=true;render();return;
  }
  const h=officeHit(e);
  if(h&&(h.id!=null||h.emp!=null)){UI.selEmp=h.id!=null?h.id:h.emp;UI.force=true;render();}
  else if(h&&h.desk!=null)act('tab',{tab:'team'});
}
function placeFurn(t,x,y){
  const F=FURN[t];if(!F)return;
  const chk=placeCheck(t,x,y,UI.rot);if(!chk.ok){showToast(chk.why,'bad');return;}
  const inv=G.furnInv[t]||0;
  if(inv>0)G.furnInv[t]=inv-1;
  else{const cost=F.cost*infl();if(G.cash<cost){showToast((LANG_EN?"Not enough cash for this item.":'Bu eşya için yeterli nakit yok.'),'bad');return;}spend(cost,'capex');}
  G.furn.push({id:nid(),t,x,y,r:F.w===F.d?0:(UI.rot||0),fl:UI.floor||0});G.furnVer++;
  if(F.room){UI.placing=null;news(F.dept?(LANG_EN?`${F.n} installed: ${ROLES[F.dept].n.toLocaleLowerCase(LOC)}s on this floor (${floorName(UI.floor||0)}) are more productive.`:`${F.n} kuruldu: ${floorName(UI.floor||0)} katındaki ${ROLES[F.dept].n.toLocaleLowerCase(LOC)}lar daha verimli.`):(LANG_EN?"Meeting room set up. You can start meetings from Company → Office.":'Toplantı odası kuruldu. Şirket → Ofis bölümünden toplantı başlatabilirsin.'),'good',true);}
  else if(F.max&&G.furn.filter(f=>f.t===t&&(f.fl||0)===(UI.floor||0)).length>=F.max)UI.placing=null;
}
function vFurnCatalog(){
  const FL=UI.floor||0,fxv=furnFx(FL),sel=G.furn.find(f=>f.id===UI.selFurn);
  const card=([k,F])=>{
    const inv=G.furnInv[k]||0,cnt=G.furn.filter(f=>f.t===k&&(f.fl||0)===FL).length,lock=F.minOffice&&G.office<F.minOffice,maxed=F.max&&cnt>=F.max;
    return `<button class="cat" aria-pressed="${UI.placing===k}" data-act="pickfurn" data-t="${k}" ${lock||maxed?'disabled':''}><span class="row between" style="flex-wrap:nowrap"><b style="font-size:16px">${F.n}</b><span class="chip st-mute">${F.w}×${F.d}</span></span><small>${F.fx}</small><small class="num">${inv?(LANG_EN?`${inv} in storage · free`:`Depoda ${inv} · bedava`):lock?OFFICES[F.minOffice].n+(LANG_EN?" required":' gerekli'):maxed?(LANG_EN?"Placed":'Yerleştirildi'):money(F.cost*infl())}${cnt&&!maxed?(LANG_EN?` · ${cnt} in office`:` · ofiste ${cnt}`):''}</small></button>`;};
  const ents=Object.entries(FURN),cards=ents.filter(([,F])=>!F.room).map(card).join(''),roomCards=ents.filter(([,F])=>F.room).map(card).join('');
  const bar=(lbl,v,cap,fmt)=>`<div><div class="row between small"><span>${lbl}</span><b class="num">${fmt(v)} / ${fmt(cap)}</b></div><div class="bar"><i style="width:${v/cap*100}%"></i></div></div>`;
  return (LANG_EN?`<div class="pb col" style="border-top:1px solid var(--line);gap:12px">
    <div class="row between"><b>Furniture catalog${hasElev()?' · '+floorName(FL):''}</b><span class="row"><span class="small muted">${UI.placing?"Click a green tile · R: rotate · Esc: cancel":"Pick an item or click one in the office"}</span>
      ${UI.placing&&FURN[UI.placing].w!==FURN[UI.placing].d?"<button class=\"btn sm\" data-act=\"rot\">Rotate</button>":''}${UI.placing?"<button class=\"btn sm ghost\" data-act=\"pickfurn\" data-t=\"\">Cancel</button>":''}<button class="btn sm primary" data-act="edit">Done</button></span></div>
    ${sel?`<div class="proj"><div class="row between"><b>${FURN[sel.t].n}</b><span class="row"><button class="btn sm" data-act="fmove">Move</button><button class="btn sm" data-act="fstore">Put in storage</button><button class="btn sm danger" data-act="fsell">Sell (+${money(FURN[sel.t].cost*infl()*0.5)})</button></span></div><span class="small muted">${FURN[sel.t].fx}</span></div>`:''}
    <div class="cats">${cards}</div>
    <div class="col" style="gap:6px"><b>Rooms <span class="small muted" style="font-weight:400">· 3×3, one of each type per floor · a department room gives the full bonus only to 8 people on that floor</span></b><div class="cats">${roomCards}</div></div>
    <div class="form">${bar("Furniture morale",fxv.mor,FX_CAP.mor,v=>'+'+fx(v,1))}${bar("Energy recovery",fxv.en,FX_CAP.en,v=>'+'+fx(v,2))}${bar("Skill growth",fxv.skill,FX_CAP.skill,v=>'+'+pctN(Math.round(v*100)))}${bar("Project speed",fxv.proj,FX_CAP.proj,v=>'+'+pctN(fx(v*100,1)))}</div>
    <p class="small muted">Bars show this floor's effect; furniture only helps employees on the same floor. Items can't block the path to desks, the door, the elevator or the break area. When you move to a bigger office, furniture goes to storage and you can place it in the new one for free.</p></div>`:`<div class="pb col" style="border-top:1px solid var(--line);gap:12px">
    <div class="row between"><b>Mobilya kataloğu${hasElev()?' · '+floorName(FL):''}</b><span class="row"><span class="small muted">${UI.placing?'Yeşil kareye tıkla · R: döndür · Esc: bırak':'Bir eşya seç ya da ofisteki bir eşyaya tıkla'}</span>
      ${UI.placing&&FURN[UI.placing].w!==FURN[UI.placing].d?'<button class="btn sm" data-act="rot">Döndür</button>':''}${UI.placing?'<button class="btn sm ghost" data-act="pickfurn" data-t="">Bırak</button>':''}<button class="btn sm primary" data-act="edit">Bitti</button></span></div>
    ${sel?`<div class="proj"><div class="row between"><b>${FURN[sel.t].n}</b><span class="row"><button class="btn sm" data-act="fmove">Taşı</button><button class="btn sm" data-act="fstore">Depoya kaldır</button><button class="btn sm danger" data-act="fsell">Sat (+${money(FURN[sel.t].cost*infl()*0.5)})</button></span></div><span class="small muted">${FURN[sel.t].fx}</span></div>`:''}
    <div class="cats">${cards}</div>
    <div class="col" style="gap:6px"><b>Odalar <span class="small muted" style="font-weight:400">· 3×3, her katta her türden bir tane · departman odası sadece o kattaki 8 kişiye tam bonus verir</span></b><div class="cats">${roomCards}</div></div>
    <div class="form">${bar('Mobilya morali',fxv.mor,FX_CAP.mor,v=>'+'+fx(v,1))}${bar('Enerji yenilenmesi',fxv.en,FX_CAP.en,v=>'+'+fx(v,2))}${bar('Yetenek gelişimi',fxv.skill,FX_CAP.skill,v=>'+'+pctN(Math.round(v*100)))}${bar('Proje hızı',fxv.proj,FX_CAP.proj,v=>'+'+pctN(fx(v*100,1)))}</div>
    <p class="small muted">Çubuklar bu katın etkisini gösterir; mobilya sadece aynı kattaki çalışanlara yarar. Eşyalar masalara, kapıya, asansöre ve dinlenme alanına giden yolu kapatamaz. Daha büyük ofise taşınınca mobilyalar depoya gider, yenisine bedava yerleştirirsin.</p></div>`);
}
function vMeeting(){
  const room=roomOf();
  if(!room)return (LANG_EN?`<div class="col"><p class="muted">You don't have a meeting room yet. ${G.office<1?"Requires Small Office or larger. ":''}In edit mode, pick "Meeting room" and place it in the office. Meetings boost project speed, product quality and morale.</p><div class="row"><button class="btn sm" data-act="edit" ${G.office<1?'disabled':''}>Edit</button></div></div>`:`<div class="col"><p class="muted">Henüz toplantı odan yok. ${G.office<1?'Küçük Ofis ve üstünde ':''}Düzenle modunda "Toplantı odası" seçip ofise yerleştir. Toplantılar proje hızını, ürün kalitesini ve morali artırır.</p><div class="row"><button class="btn sm" data-act="edit" ${G.office<1?'disabled':''}>Düzenle</button></div></div>`);
  if(G.meeting){const m=G.meeting,pr=G.projects.find(p=>p.id===m.arg),e=G.emps.find(x=>x.id===m.arg);
    return (LANG_EN?`<div class="col"><div class="row between"><b>${MEET[m.t].n}</b><span class="chip st-ok">In progress</span></div>
      <div class="kv"><span>Attendees</span><b>${m.att.length} people</b><span>Time left</span><b>${m.until-G.day} days</b>${hasElev()?`<span>Floor</span><b>${floorName(m.fl||0)}</b>`:''}${(m.t==='plan'||m.t==='brain')&&pr?`<span>Project</span><b>${esc(pr.name)}</b>`:''}${m.t==='one'&&e?`<span>Meeting with</span><b>${esc(e.name)}</b>`:''}</div>
      <p class="small muted">${MEET[m.t].d} Attendees produce no work during the meeting.</p><div class="row"><button class="btn sm ghost" data-act="meetstop">Cancel meeting</button></div></div>`:`<div class="col"><div class="row between"><b>${MEET[m.t].n}</b><span class="chip st-ok">Sürüyor</span></div>
      <div class="kv"><span>Katılımcı</span><b>${m.att.length} kişi</b><span>Kalan süre</span><b>${m.until-G.day} gün</b>${hasElev()?`<span>Kat</span><b>${floorName(m.fl||0)}</b>`:''}${(m.t==='plan'||m.t==='brain')&&pr?`<span>Proje</span><b>${esc(pr.name)}</b>`:''}${m.t==='one'&&e?`<span>Görüşülen</span><b>${esc(e.name)}</b>`:''}</div>
      <p class="small muted">${MEET[m.t].d} Katılımcılar toplantı süresince iş üretmez.</p><div class="row"><button class="btn sm ghost" data-act="meetstop">Toplantıyı iptal et</button></div></div>`);}
  if(UI.meetProj==null||!G.projects.some(p=>p.id===UI.meetProj))UI.meetProj=G.projects[0]?G.projects[0].id:null;
  const opt=G.projects.map(p=>`<option value="${p.id}" ${p.id===UI.meetProj?'selected':''}>${esc(p.name)}${p.focus>G.day?(LANG_EN?" · focused":' · odaklı'):''}${p.brain?' · fikirli':''}</option>`).join('');
  const btn=(t,arg,lbl)=>{const why=meetBlock(t,arg);return `<div class="proj"><div class="row between"><b>${MEET[t].n}</b><button class="btn sm ${why?'':'primary'}" data-act="meet" data-mt="${t}" data-id="${arg??''}" ${why?'disabled':''}>${why||lbl}</button></div><span class="small muted">${MEET[t].d}</span></div>`;};
  return (LANG_EN?`<div class="col">
    ${G.projects.length?`<label class="f" for="mt-proj">Project<select id="mt-proj" data-bind="meetProj" data-num="1">${opt}</select></label>`:"<p class=\"small muted\">Planning and brainstorming require an ongoing project.</p>"}
    ${btn('plan',UI.meetProj,"Start")}${btn('brain',UI.meetProj,"Start")}${btn('all',null,"Gather")}
    <p class="small muted">Click an employee in the office for a one-on-one.</p></div>`:`<div class="col">
    ${G.projects.length?`<label class="f" for="mt-proj">Proje<select id="mt-proj" data-bind="meetProj" data-num="1">${opt}</select></label>`:'<p class="small muted">Planlama ve beyin fırtınası için devam eden bir proje gerekir.</p>'}
    ${btn('plan',UI.meetProj,'Başlat')}${btn('brain',UI.meetProj,'Başlat')}${btn('all',null,'Topla')}
    <p class="small muted">Birebir görüşme için ofiste bir çalışana tıkla.</p></div>`);
}
function vOffice(){
  if(UI.branch){if(brOf(UI.branch))return vOfficePick()+vBranch(UI.branch);UI.branch=null;}
  if(UI.rival){const rc=comp(UI.rival);if(rc&&!rc.dead)return vOfficePick()+vRivalOffice(rc);UI.rival=null;}
  return vOfficePick()+vOwnOffice();
}
function vOwnOffice(){
  officeLayout();
  const off=OFFICES[G.office],emps=G.emps;
  const working=emps.filter(isWorking).length,idleN=emps.length-working,extra=Math.max(0,emps.length-OV.cap);
  const sel=G.emps.find(e=>e.id===UI.selEmp);
  const projOpts=e=>(LANG_EN?`<option value="">Idle</option>`:`<option value="">Boşta</option>`)+G.projects.filter(p=>p.req[e.role]).map(p=>`<option value="${p.id}" ${e.proj===p.id?'selected':''}>${esc(p.name)}</option>`).join('')+myActive().filter(p=>maintRole(p)===e.role).map(p=>(LANG_EN?`<option value="m${p.id}" ${e.proj==='m'+p.id?'selected':''}>Maintenance: ${esc(p.name)}</option>`:`<option value="m${p.id}" ${e.proj==='m'+p.id?'selected':''}>Bakım: ${esc(p.name)}</option>`)).join('');
  const oneWhy=sel?meetBlock('one',sel.id):null;
  const selCard=sel?(LANG_EN?`<div class="col">
      <div class="row between"><h3 class="emp-n">${esc(sel.name)}</h3><span class="row" style="gap:4px">${keyP(sel)?"<span class=\"chip st-warn\">Key</span>":''}${sel.spec?`<span class="chip st-mute">${esc(FA[sel.spec].n)}</span>`:''}<span class="chip r-${sel.role}">${ROLES[sel.role].n}</span></span></div>
      <div class="col" style="gap:4px">${knownTraits(sel).map(t=>`<div class="small"><span class="chip ${{pos:'st-ok',neg:'st-bad',mix:'st-warn'}[TRAITS[t].k]}">${TRAITS[t].n}</span> <span class="muted">${TRAITS[t].d}</span></div>`).join('')}${(sel.tr||[]).length>1&&!sel.rev?`<div class="small"><span class="chip st-mute">? hidden</span> <span class="muted">revealed in ${Math.max(0,45-(G.day-(sel.hiredAt||0)))} days</span></div>`:''}</div>
      <div class="kv"><span>Level</span><b>${levelTitle(sel)}</b>${sel.founder||sel.mgr?'':`<span>Next level</span><b>${esc(canPromote(sel).why)}</b>`}<span>Skill</span><b>${fx(sel.skill,1)} / 10</b><span>Salary</span><b>${sel.founder?'—':money(sel.salary)+'/ay'}${sel.founder?'':` <small class="muted">(market ${money(marketSal(sel))})</small>`}</b><span>Status</span><b>${sel.leave?LEAVE_N[sel.leave.type]:inMeeting(sel)?"In a meeting":isWorking(sel)?"Running":"Idle"}</b><span>Task</span><b>${esc(empTask(sel))}</b>${hasElev()?`<span>Floor</span><b>${floorName(empFloor(sel))}</b>`:''}<span>Productivity</span><b>${pct(sel.leave?0:effMult(sel),0)}</b></div>
      <div class="form" style="gap:10px"><div><div class="row between small"><span>Morale · <span class="${moraleState(sel.morale)[1]}">${moraleState(sel.morale)[0]}</span></span><span class="muted">target ${Math.round(moraleTarget(sel))}</span></div>${meter(sel.morale,moraleState(sel.morale))}</div>
        <div><div class="row between small"><span>Energy · <span class="${energyState(sel.energy)[1]}">${energyState(sel.energy)[0]}</span></span></div>${meter(sel.energy,energyState(sel.energy))}</div></div>
      <details class="small drv" open><summary><b>What affects their morale</b></summary><ul class="drivers">${moraleDrivers(sel).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).map(([t,v])=>`<li><span>${esc(t)}</span><b class="num ${v>0?'pos':'neg'}">${v>0?'+':''}${v}</b></li>`).join('')}</ul></details>
      ${xpBar(sel)}${vWantLine(sel)}${vEmpCareer(sel)}
      <div class="row">${canPromote(sel).ok?`<button class="btn sm primary" data-act="promote" data-id="${sel.id}">Promote</button>`:''}${sel.mgr?`<button class="btn sm ghost" data-act="demote" data-id="${sel.id}">Remove as manager</button>`:''}${sel.founder?'':`<button class="btn sm" data-act="raise" data-id="${sel.id}">10% raise (+${money(sel.salary*0.1)}/mo)</button>`}<button class="btn sm" data-act="vac" data-id="${sel.id}" ${sel.leave?'disabled':''}>Give 7 days off</button>
        ${sel.founder?'':`<button class="btn sm" data-act="meet" data-mt="one" data-id="${sel.id}" ${oneWhy?'disabled':''} title="${esc(oneWhy||MEET.one.d)}">One-on-one${oneWhy&&roomOf()?' · '+esc(oneWhy):''}</button>`}</div>
      <div class="row">${(G.floors||1)>1?`<label class="f" for="sel-fl">Move to floor<select id="sel-fl" data-movefl="${sel.id}">${Array.from({length:G.floors},(_,f)=>`<option value="${f}" ${empFloor(sel)===f?'selected':''}>${floorName(f)}</option>`).join('')}</select></label>`:''}${['soft','design','hw'].includes(sel.role)?`<label class="f" for="sel-proj">Assign to project<select id="sel-proj" data-assign="${sel.id}">${projOpts(sel)}</select></label>`:''}
      ${sel.founder?'':`<button class="btn sm ghost" data-act="fire" data-id="${sel.id}" style="align-self:flex-end">Fire</button>`}</div></div>`:`<div class="col">
      <div class="row between"><h3 class="emp-n">${esc(sel.name)}</h3><span class="row" style="gap:4px">${keyP(sel)?'<span class="chip st-warn">Kilit</span>':''}${sel.spec?`<span class="chip st-mute">${esc(FA[sel.spec].n)}</span>`:''}<span class="chip r-${sel.role}">${ROLES[sel.role].n}</span></span></div>
      <div class="col" style="gap:4px">${knownTraits(sel).map(t=>`<div class="small"><span class="chip ${{pos:'st-ok',neg:'st-bad',mix:'st-warn'}[TRAITS[t].k]}">${TRAITS[t].n}</span> <span class="muted">${TRAITS[t].d}</span></div>`).join('')}${(sel.tr||[]).length>1&&!sel.rev?`<div class="small"><span class="chip st-mute">? gizli</span> <span class="muted">${Math.max(0,45-(G.day-(sel.hiredAt||0)))} gün içinde ortaya çıkacak</span></div>`:''}</div>
      <div class="kv"><span>Kademe</span><b>${levelTitle(sel)}</b>${sel.founder||sel.mgr?'':`<span>Sonraki kademe</span><b>${esc(canPromote(sel).why)}</b>`}<span>Yetenek</span><b>${fx(sel.skill,1)} / 10</b><span>Maaş</span><b>${sel.founder?'—':money(sel.salary)+'/ay'}${sel.founder?'':` <small class="muted">(piyasa ${money(marketSal(sel))})</small>`}</b><span>Durum</span><b>${sel.leave?LEAVE_N[sel.leave.type]:inMeeting(sel)?'Toplantıda':isWorking(sel)?'Çalışıyor':'Boşta'}</b><span>Görev</span><b>${esc(empTask(sel))}</b>${hasElev()?`<span>Kat</span><b>${floorName(empFloor(sel))}</b>`:''}<span>Üretkenlik</span><b>${pct(sel.leave?0:effMult(sel),0)}</b></div>
      <div class="form" style="gap:10px"><div><div class="row between small"><span>Moral · <span class="${moraleState(sel.morale)[1]}">${moraleState(sel.morale)[0]}</span></span><span class="muted">hedef ${Math.round(moraleTarget(sel))}</span></div>${meter(sel.morale,moraleState(sel.morale))}</div>
        <div><div class="row between small"><span>Enerji · <span class="${energyState(sel.energy)[1]}">${energyState(sel.energy)[0]}</span></span></div>${meter(sel.energy,energyState(sel.energy))}</div></div>
      <details class="small drv" open><summary><b>Moralini etkileyenler</b></summary><ul class="drivers">${moraleDrivers(sel).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).map(([t,v])=>`<li><span>${esc(t)}</span><b class="num ${v>0?'pos':'neg'}">${v>0?'+':''}${v}</b></li>`).join('')}</ul></details>
      ${xpBar(sel)}${vWantLine(sel)}${vEmpCareer(sel)}
      <div class="row">${canPromote(sel).ok?`<button class="btn sm primary" data-act="promote" data-id="${sel.id}">Terfi et</button>`:''}${sel.mgr?`<button class="btn sm ghost" data-act="demote" data-id="${sel.id}">Yöneticilikten al</button>`:''}${sel.founder?'':`<button class="btn sm" data-act="raise" data-id="${sel.id}">%10 zam (+${money(sel.salary*0.1)}/ay)</button>`}<button class="btn sm" data-act="vac" data-id="${sel.id}" ${sel.leave?'disabled':''}>7 gün izin ver</button>
        ${sel.founder?'':`<button class="btn sm" data-act="meet" data-mt="one" data-id="${sel.id}" ${oneWhy?'disabled':''} title="${esc(oneWhy||MEET.one.d)}">Birebir görüşme${oneWhy&&roomOf()?' · '+esc(oneWhy):''}</button>`}</div>
      <div class="row">${(G.floors||1)>1?`<label class="f" for="sel-fl">Kata taşı<select id="sel-fl" data-movefl="${sel.id}">${Array.from({length:G.floors},(_,f)=>`<option value="${f}" ${empFloor(sel)===f?'selected':''}>${floorName(f)}</option>`).join('')}</select></label>`:''}${['soft','design','hw'].includes(sel.role)?`<label class="f" for="sel-proj">Projeye ata<select id="sel-proj" data-assign="${sel.id}">${projOpts(sel)}</select></label>`:''}
      ${sel.founder?'':`<button class="btn sm ghost" data-act="fire" data-id="${sel.id}" style="align-self:flex-end">Çıkar</button>`}</div></div>`)
    :(LANG_EN?`<p class="small muted" style="margin:0 0 10px">Click an employee in the office or pick one below to see who they are and what they're working on, and to change their task. Click an empty desk to go to the candidate list.</p>${(()=>{const L=G.emps.filter(e=>!e.founder&&idle(e)),N=L.length;return N?`<div class="small" style="margin-bottom:6px"><b>Idle (${N})</b></div><div class="col" style="gap:4px">${L.slice(0,8).map(e=>`<button class="emp-q" data-act="selemp" data-id="${e.id}"><span class="chip r-${e.role}">${ROLES[e.role].n}</span><span>${esc(e.name)}</span><span class="muted num">${fx(e.skill,1)}</span></button>`).join('')}${N>8?`<span class="small muted">and ${N-8} more</span>`:''}</div>`:"<div class=\"small pos\">Everyone is working on something.</div>";})()}`:`<p class="small muted" style="margin:0 0 10px">Ofisteki bir çalışana tıkla ya da aşağıdan seç: kim olduğunu, ne üzerinde çalıştığını gör, görevini değiştir. Boş bir masaya tıklarsan aday listesine gidersin.</p>${(()=>{const L=G.emps.filter(e=>!e.founder&&idle(e)),N=L.length;return N?`<div class="small" style="margin-bottom:6px"><b>Boşta (${N})</b></div><div class="col" style="gap:4px">${L.slice(0,8).map(e=>`<button class="emp-q" data-act="selemp" data-id="${e.id}"><span class="chip r-${e.role}">${ROLES[e.role].n}</span><span>${esc(e.name)}</span><span class="muted num">${fx(e.skill,1)}</span></button>`).join('')}${N>8?`<span class="small muted">ve ${N-8} kişi daha</span>`:''}</div>`:'<div class="small pos">Herkes bir işte çalışıyor.</div>';})()}`);
  const out={soft:0,design:0,hw:0,res:0};for(const e of emps)if(isWorking(e)&&!inMeeting(e)&&out[e.role]!=null)out[e.role]+=e.skill*effMult(e);
  const avgOf=(es,k)=>es.reduce((a,e)=>a+e[k],0)/es.length;
  const deps=ROLE_ORDER.map(r=>{const es=emps.filter(e=>e.role===r);if(!es.length)return '';const w=es.filter(isWorking).length,am=avgOf(es,'morale'),ae=avgOf(es,'energy');
    const o=r==='res'?(LANG_EN?`${fx(out.res,1)} RP/day`:`${fx(out.res,1)} AP/gün`):r==='mkt'?(LANG_EN?"growing the brand":'markayı büyütüyor'):r==='ops'?(LANG_EN?`lead time −${pct(leadRed(),0)}`:`teslim −${pct(leadRed(),0)}`):r==='sup'?(LANG_EN?`${num((G.supStat||{}).cap||0)} tickets/day`:`${num((G.supStat||{}).cap||0)} talep/gün`):r==='sec'?(LANG_EN?`security ${Math.round(secScore())}/100`:`güvenlik ${Math.round(secScore())}/100`):(LANG_EN?`${fx(out[r],1)} pts/day`:`${fx(out[r],1)} puan/gün`);
    return `<tr><td><span class="chip r-${r}">${ROLES[r].n}</span></td><td class="r num">${es.length}</td><td class="r num">${w}</td><td class="r num ${es.length-w?'warn':''}">${es.length-w}</td><td>${meter(am,moraleState(am))}</td><td>${meter(ae,energyState(ae))}</td><td class="small">${(()=>{const di=deptInfo(r);return di.m?(LANG_EN?`${esc(di.m.name)} <span class="pos">+${Math.round(di.bonus*100)}%</span>`:`${esc(di.m.name)} <span class="pos">+%${Math.round(di.bonus*100)}</span>`):di.pen?(LANG_EN?`<span class="neg">none · −${Math.round(di.pen*100)}%</span>`:`<span class="neg">yok · −%${Math.round(di.pen*100)}</span>`):(LANG_EN?"<span class=\"muted\">none</span>":'<span class="muted">yok</span>');})()}</td><td class="small muted">${o}${G.furn.some(f=>f.t==='r_'+r)?` · <span class="r-${r}">${FURN['r_'+r].n}</span>`:''}</td></tr>`;}).join('');
  const al=alerts().slice(0,3);
  return (LANG_EN?`<div class="of-layout"><section class="panel"><div class="ph"><h2>${off.n}</h2><span class="row"><span class="sub">${Math.min(emps.length,OV.cap)}/${OV.cap} desks filled · ${working} working · ${idleN} idle${extra?` · ${extra} people ${G.wpol&&G.wpol!=='office'?"working from home":"on other floors"}`:''}</span>
      ${!G.speed&&!G.over&&!G.pending?"<button class=\"btn sm primary\" data-act=\"start\">Start the game</button>":''}
      <button class="btn sm" data-act="phopen" title="Create a shareable photo card of your office">Photo mode</button>
      <button class="btn sm ${UI.edit?'primary':''}" data-act="edit" aria-pressed="${!!UI.edit}">${UI.edit?"Finish editing":"Edit"}</button>
      ${G.office<OFFICES.length-1?`<button class="btn sm" data-act="tab" data-tab="infra">Move to a bigger office</button>`:''}</span></div>
    ${hasElev()?`<div class="pb row" style="border-bottom:1px solid var(--line);padding-block:8px" role="tablist" aria-label="Floors">${Array.from({length:G.floors||1},(_,f)=>{const per=perFloor(),n=G.emps.filter(e=>e.desk!=null&&Math.floor(e.desk/per)===f).length;return `<button class="btn sm ${(UI.floor||0)===f?'primary':'ghost'}" role="tab" aria-selected="${(UI.floor||0)===f}" data-act="floor" data-f="${f}">${floorName(f)} · ${n}/${per}</button>`;}).join('')}${(G.floors||1)<off.maxF?`<button class="btn sm" data-act="addfloor">+ Add floor ${money(off.floorCost*infl())}</button>`:`<span class="small muted">Building max: ${off.maxF} floors</span>`}</div>`:''}
    <div class="ofwrap"><canvas id="officeCanvas" role="img" aria-label="Office view: employees working at their desks"></canvas></div>
    ${UI.edit?vFurnCatalog():`<div class="legend pb" style="border-top:1px solid var(--line);margin:0">${ROLE_ORDER.map(r=>`<span><i class="dot" style="background:var(--pt-${r})"></i>${ROLES[r].n}</span>`).join('')}<span class="muted">Orange beanie: you · "?" idle · "zZ" tired · sad face: low morale</span>${G.aiw&&aiwTot()?"<span><i class=\"dot\" style=\"background:#15AABF\"></i>AI agent (supervised by the employee at the desk)</span>":''}</div>`}</section>
  <aside class="of-side">
    <section class="panel"><div class="ph"><h2>${sel?"Employee":"Selected employee"}</h2>${sel?"<button class=\"btn sm ghost\" data-act=\"unsel\">Close</button>":''}</div><div class="pb">${selCard}</div></section>
    ${vWants()}<section class="panel"><div class="ph"><h2>Meeting room</h2>${roomOf()?"<span class=\"sub\">6-seat table</span>":''}</div><div class="pb">${vMeeting()}</div></section>
  </aside></div>
  <section class="panel"><div class="ph"><h2>Departments</h2><button class="btn sm" data-act="tab" data-tab="team">Hire</button></div>
    ${deps?`<div class="tw"><table><thead><tr><th>Role</th><th class="r">People</th><th class="r">Working</th><th class="r">Idle</th><th>Morale</th><th>Energy</th><th>Manager</th><th>Output</th></tr></thead><tbody>${deps}${G.aiw&&aiwTot()?(()=>{const tot=aiwTot(),eff=Object.keys(AIW_R).reduce((a,t)=>a+aiwEff(t),0);return `<tr><td><span class="chip" style="background:rgba(21,170,191,.15);color:#0C8599">AI agents</span></td><td class="r num">${tot}</td><td class="r num">${eff}</td><td class="r num ${tot-eff?'warn':''}">${tot-eff}</td><td class="muted">—</td><td class="muted">—</td><td class="small muted">max ${AIW_PER} per employee</td><td class="small"><button class="btn sm ghost" data-act="tab" data-tab="team:yz">Agents</button></td></tr>`;})():''}</tbody></table></div>`:''}</section>`:`<div class="of-layout"><section class="panel"><div class="ph"><h2>${off.n}</h2><span class="row"><span class="sub">${Math.min(emps.length,OV.cap)}/${OV.cap} masa dolu · ${working} çalışıyor · ${idleN} boşta${extra?` · ${extra} kişi ${G.wpol&&G.wpol!=='office'?'evden çalışıyor':'diğer katlarda'}`:''}</span>
      ${!G.speed&&!G.over&&!G.pending?'<button class="btn sm primary" data-act="start">Oyunu başlat</button>':''}
      <button class="btn sm" data-act="phopen" title="Ofisinden paylaşılabilir bir fotoğraf kartı hazırla">Fotoğraf modu</button>
      <button class="btn sm ${UI.edit?'primary':''}" data-act="edit" aria-pressed="${!!UI.edit}">${UI.edit?'Düzenlemeyi bitir':'Düzenle'}</button>
      ${G.office<OFFICES.length-1?`<button class="btn sm" data-act="tab" data-tab="infra">Büyük ofise taşın</button>`:''}</span></div>
    ${hasElev()?`<div class="pb row" style="border-bottom:1px solid var(--line);padding-block:8px" role="tablist" aria-label="Katlar">${Array.from({length:G.floors||1},(_,f)=>{const per=perFloor(),n=G.emps.filter(e=>e.desk!=null&&Math.floor(e.desk/per)===f).length;return `<button class="btn sm ${(UI.floor||0)===f?'primary':'ghost'}" role="tab" aria-selected="${(UI.floor||0)===f}" data-act="floor" data-f="${f}">${floorName(f)} · ${n}/${per}</button>`;}).join('')}${(G.floors||1)<off.maxF?`<button class="btn sm" data-act="addfloor">+ Kat ekle ${money(off.floorCost*infl())}</button>`:`<span class="small muted">Bina en fazla ${off.maxF} kat</span>`}</div>`:''}
    <div class="ofwrap"><canvas id="officeCanvas" role="img" aria-label="Ofis görünümü: çalışanlar masalarında çalışıyor"></canvas></div>
    ${UI.edit?vFurnCatalog():`<div class="legend pb" style="border-top:1px solid var(--line);margin:0">${ROLE_ORDER.map(r=>`<span><i class="dot" style="background:var(--pt-${r})"></i>${ROLES[r].n}</span>`).join('')}<span class="muted">Turuncu bere: sen · "?" boşta · "zZ" yorgun · üzgün yüz: morali düşük</span>${G.aiw&&aiwTot()?'<span><i class="dot" style="background:#15AABF"></i>Yapay zekâ ajanı (masadaki çalışanın denetiminde)</span>':''}</div>`}</section>
  <aside class="of-side">
    <section class="panel"><div class="ph"><h2>${sel?'Çalışan':'Seçili çalışan'}</h2>${sel?'<button class="btn sm ghost" data-act="unsel">Kapat</button>':''}</div><div class="pb">${selCard}</div></section>
    ${vWants()}<section class="panel"><div class="ph"><h2>Toplantı odası</h2>${roomOf()?'<span class="sub">6 kişilik masa</span>':''}</div><div class="pb">${vMeeting()}</div></section>
  </aside></div>
  <section class="panel"><div class="ph"><h2>Departmanlar</h2><button class="btn sm" data-act="tab" data-tab="team">İşe al</button></div>
    ${deps?`<div class="tw"><table><thead><tr><th>Rol</th><th class="r">Kişi</th><th class="r">Çalışan</th><th class="r">Boşta</th><th>Moral</th><th>Enerji</th><th>Yönetici</th><th>Çıktı</th></tr></thead><tbody>${deps}${G.aiw&&aiwTot()?(()=>{const tot=aiwTot(),eff=Object.keys(AIW_R).reduce((a,t)=>a+aiwEff(t),0);return `<tr><td><span class="chip" style="background:rgba(21,170,191,.15);color:#0C8599">YZ ajanları</span></td><td class="r num">${tot}</td><td class="r num">${eff}</td><td class="r num ${tot-eff?'warn':''}">${tot-eff}</td><td class="muted">—</td><td class="muted">—</td><td class="small muted">çalışan başına en fazla ${AIW_PER}</td><td class="small"><button class="btn sm ghost" data-act="tab" data-tab="team:yz">Ajanlar</button></td></tr>`;})():''}</tbody></table></div>`:''}</section>`);
}

