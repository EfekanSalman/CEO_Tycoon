/* ============================== CLOUD SAVE ============================== */
const CL={st:'idle',meta:null,busy:null,err:null,loaded:false},CL_SLOTS=['1','2','3','a'],CL_CH=200000;
const clOn=()=>LB.st==='on'&&!!LB.uid&&!!LB.db;
const clCol=()=>LB.db.collection('data/users/'+LB.uid);
const clDoc=(k,i)=>clCol().doc(`cloud_${k}${i?'~'+i:''}`);
async function gzB64(str){if(typeof CompressionStream==='undefined')return {enc:'b64',d:btoa(unescape(encodeURIComponent(str)))};
  const buf=await new Response(new Blob([str]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer(),u=new Uint8Array(buf);let b='';for(let i=0;i<u.length;i+=0x8000)b+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return {enc:'gz',d:btoa(b)};}
async function unGzB64(enc,d){if(enc==='b64')return decodeURIComponent(escape(atob(d)));const bin=atob(d),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  return await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text();}
function clMetaNow(){return {name:G.name,day:G.day,cash:G.cash,val:valuation(),scn:G.scn&&SCN[G.scn.id]?SCN[G.scn.id].n:'',diff:G.diff?G.diff.n:(LANG_EN?"Normal":'Normal'),t:Date.now()};}
function clRe(){UI.force=true;if(UI.modal&&(UI.modal.kind==='scenario'||UI.modal.kind==='settings'))renderModal();}
async function clLoadMeta(force){if(!clOn()||(CL.loaded&&!force)||CL.st==='meta')return;CL.st='meta';
  try{const sn=await clCol().doc('cloudmeta').get();const d=sn.exists?sn.data():null;CL.meta=Object.assign({},d&&d.slots||{});CL.loaded=true;CL.err=null;}catch(e){CL.err=(e&&e.code)||'err';}
  CL.st='idle';clRe();}
async function clSave(k,quiet){if(!clOn()||CL.busy||!CL_SLOTS.includes(k))return false;if(!CL.loaded)await clLoadMeta(true);CL.busy=k;clRe();
  try{const {enc,d}=await gzB64(JSON.stringify(G)),n=Math.ceil(d.length/CL_CH);if(n>4)throw {code:'too_big'};
    for(let i=0;i<n;i++)await clDoc(k,i).set({v:1,i,n,enc,d:d.slice(i*CL_CH,(i+1)*CL_CH)});
    const old=(CL.meta||{})[k];if(old&&old.n>n)for(let i=n;i<old.n;i++)try{await clDoc(k,i).delete();}catch(e){}
    const meta=Object.assign({},CL.meta||{},{[k]:Object.assign(clMetaNow(),{n,enc,kb:Math.max(1,Math.round(d.length*0.75/1024))})});await clCol().doc('cloudmeta').set({slots:meta});
    CL.meta=meta;CL.err=null;if(!quiet)showToast((LANG_EN?`Saved to cloud slot ${k}.`:`Bulut yuvası ${k}'e kaydedildi.`));return true;}
  catch(e){CL.err=(e&&e.code)||'err';if(!quiet)showToast(CL.err==='too_big'?(LANG_EN?"The save is too large for the cloud; use export instead.":'Kayıt buluta sığmayacak kadar büyük; dışa aktarmayı kullan.'):CL.err==='quota_exceeded'?(LANG_EN?"Cloud storage is full; delete an old cloud save.":'Bulut alanı dolu; eski bir bulut kaydını sil.'):(LANG_EN?"Couldn't save to the cloud: you may not have write permission on this page.":'Buluta kaydedilemedi: bu sayfada veri yazma iznin olmayabilir.'),'bad');return false;}
  finally{CL.busy=null;clRe();}}
async function clLoad(k){const m=CL.meta&&CL.meta[k];if(!clOn()||CL.busy||!m)return;CL.busy=k;clRe();
  try{let d='',enc=m.enc;for(let i=0;i<(m.n||1);i++){const sn=await clDoc(k,i).get();if(!sn.exists)throw {code:'missing'};const x=sn.data();d+=x.d;enc=x.enc||enc;}
    const g=JSON.parse(await unGzB64(enc,d));CL.busy=null;if(loadGameObj(g))showToast(k==='a'?(LANG_EN?"Cloud autosave loaded.":'Otomatik bulut kaydı yüklendi.'):(LANG_EN?`Cloud slot ${k} loaded.`:`Bulut yuvası ${k} yüklendi.`));}
  catch(e){showToast((LANG_EN?"Couldn't read the cloud save.":'Bulut kaydı okunamadı.'),'bad');}finally{CL.busy=null;clRe();}}
async function clDel(k){const m=CL.meta&&CL.meta[k];if(!clOn()||CL.busy||!m)return;CL.busy=k;clRe();
  try{for(let i=0;i<(m.n||1);i++)await clDoc(k,i).delete();const meta=Object.assign({},CL.meta);delete meta[k];await clCol().doc('cloudmeta').set({slots:meta});CL.meta=meta;showToast((LANG_EN?"Cloud save deleted.":'Bulut kaydı silindi.'));}
  catch(e){showToast((LANG_EN?"Couldn't delete the cloud save.":'Bulut kaydı silinemedi.'),'bad');}finally{CL.busy=null;clRe();}}
function clAuto(){if(!PREF.cloudAuto||!clOn()||G.over||G.day-(G.clAt||-999)<365)return;G.clAt=G.day;clSave('a',true);}
function vCloud(){
  if(!clOn())return (LANG_EN?`<section class="panel"><div class="ph"><h2>Cloud save${helpBtn('cloud')}</h2></div><div class="pb small muted">${LB.st==='init'?"Connecting…":"Cloud save isn't available in this view. When you open the game on claude.ai while signed in, your saves are stored in your account and you can continue from any device. Local slots and export always work."}</div></section>`:`<section class="panel"><div class="ph"><h2>Bulut kaydı${helpBtn('cloud')}</h2></div><div class="pb small muted">${LB.st==='init'?'Bağlanılıyor…':'Bulut kaydı bu görünümde kullanılamıyor. Oyunu claude.ai\'de oturum açıkken açtığında kayıtların hesabında saklanır ve her cihazdan devam edebilirsin. Yerel yuvalar ve dışa aktarma her zaman çalışır.'}</div></section>`);
  if(!CL.loaded&&CL.st!=='meta')setTimeout(()=>clLoadMeta(),0);
  const M=CL.meta||{},row=k=>{const m=M[k],busy=CL.busy===k,dis=CL.busy?'disabled':'';
    return (LANG_EN?`<div class="row between cl-row"><span><b>${k==='a'?"Auto":"Cloud "+k}</b> ${m?`<span class="small">${esc(m.name)} · ${fmtDate(m.day)} · valuation ${money(m.val)}${m.scn?' · '+esc(m.scn):''}</span><div class="small muted">${new Date(m.t).toLocaleString(LOC)} · ${m.kb} KB</div>`:`<span class="small muted">${CL.loaded?"Empty":"Loading…"}</span>`}</span>
    <span class="row">${k==='a'?'':`<button class="btn sm" data-act="clsave" data-k="${k}" ${dis}>${busy?'Kaydediliyor…':"Save"}</button>`}<button class="btn sm" data-act="clload" data-k="${k}" ${m&&!CL.busy?'':'disabled'}>Load</button><button class="btn sm ${UI.clDel===k?'danger':'ghost'}" data-act="cldel" data-k="${k}" ${m&&!CL.busy?'':'disabled'}>${UI.clDel===k?"Sure? Delete":"Delete"}</button></span></div>`:`<div class="row between cl-row"><span><b>${k==='a'?'Otomatik':'Bulut '+k}</b> ${m?`<span class="small">${esc(m.name)} · ${fmtDate(m.day)} · değerleme ${money(m.val)}${m.scn?' · '+esc(m.scn):''}</span><div class="small muted">${new Date(m.t).toLocaleString(LOC)} · ${m.kb} KB</div>`:`<span class="small muted">${CL.loaded?'Boş':'Yükleniyor…'}</span>`}</span>
    <span class="row">${k==='a'?'':`<button class="btn sm" data-act="clsave" data-k="${k}" ${dis}>${busy?'Kaydediliyor…':'Kaydet'}</button>`}<button class="btn sm" data-act="clload" data-k="${k}" ${m&&!CL.busy?'':'disabled'}>Yükle</button><button class="btn sm ${UI.clDel===k?'danger':'ghost'}" data-act="cldel" data-k="${k}" ${m&&!CL.busy?'':'disabled'}>${UI.clDel===k?'Emin misin? Sil':'Sil'}</button></span></div>`);};
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Cloud save${helpBtn('cloud')}</h2><span class="sub">Private to your account · only you can see it</span></div><div class="pb col">
    ${CL_SLOTS.map(row).join('')}
    <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ${PREF.cloudAuto?'primary':''}" data-act="pref" data-k="cloudAuto" aria-pressed="${!!PREF.cloudAuto}">Cloud autosave: ${PREF.cloudAuto?"On":"Off"}</button><button class="btn sm ghost" data-act="clrefresh" ${CL.busy?'disabled':''}>Refresh</button><span class="small muted">When on, writes to the "Auto" slot once per game year.</span></div>
    ${CL.err?`<div class="small neg">The last cloud operation failed. You may not have write permission on this page.</div>`:''}</div></section>`:`<section class="panel"><div class="ph"><h2>Bulut kaydı${helpBtn('cloud')}</h2><span class="sub">Hesabına özel · yalnızca sen görürsün</span></div><div class="pb col">
    ${CL_SLOTS.map(row).join('')}
    <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ${PREF.cloudAuto?'primary':''}" data-act="pref" data-k="cloudAuto" aria-pressed="${!!PREF.cloudAuto}">Otomatik bulut kaydı: ${PREF.cloudAuto?'Açık':'Kapalı'}</button><button class="btn sm ghost" data-act="clrefresh" ${CL.busy?'disabled':''}>Yenile</button><span class="small muted">Açıkken her oyun yılında bir kez "Otomatik" yuvasına yazar.</span></div>
    ${CL.err?`<div class="small neg">Son bulut işlemi başarısız oldu. Bu sayfada veri yazma iznin olmayabilir.</div>`:''}</div></section>`);}
function vCloudStart(){if(!clOn()||!CL.meta)return '';const L=CL_SLOTS.map(k=>[k,CL.meta[k]]).filter(x=>x[1]).sort((a,b)=>b[1].t-a[1].t);if(!L.length)return '';const [k,m]=L[0];
  return (LANG_EN?`<div class="cl-start"><span><b>Continue from cloud</b> <span class="small">${esc(m.name)} · ${fmtDate(m.day)} · ${money(m.val)}</span><span class="small muted"> · ${new Date(m.t).toLocaleString(LOC)}</span></span><button class="btn sm primary" data-act="clload" data-k="${k}">Load</button></div>`:`<div class="cl-start"><span><b>Buluttan devam et</b> <span class="small">${esc(m.name)} · ${fmtDate(m.day)} · ${money(m.val)}</span><span class="small muted"> · ${new Date(m.t).toLocaleString(LOC)}</span></span><button class="btn sm primary" data-act="clload" data-k="${k}">Yükle</button></div>`);}

