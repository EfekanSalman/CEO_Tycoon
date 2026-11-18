/* ============================== SAVE SLOTS ============================== */
const SLOT_KEY=i=>`silikon-garaj-slot-${i}`,SLOT_META=i=>`silikon-garaj-slotmeta-${i}`;
function slotMeta(i){try{return JSON.parse(localStorage.getItem(SLOT_META(i))||'null');}catch(e){return null;}}
/* Yuvalar ve kurtarma kopyası sıkıştırılarak saklanır (gzip + base64, 'gz:' öneki); eski düz JSON yuvalar da okunur. */
/* gzip baytları karakter başına 15 bit olarak paketlenir (0x20–0x801F; vekil karakter aralığına girmez): base64'ten ~2,5 kat sıkı. */
function u8To15(u){const o=[];let buf=0,bits=0;for(let i=0;i<u.length;i++){buf=((buf<<8)|u[i])>>>0;bits+=8;if(bits>=15){bits-=15;o.push(((buf>>>bits)&0x7FFF)+0x20);buf&=(1<<bits)-1;}}
  if(bits>0)o.push(((buf<<(15-bits))&0x7FFF)+0x20);let s='';for(let i=0;i<o.length;i+=0x4000)s+=String.fromCharCode.apply(null,o.slice(i,i+0x4000));return u.length+':'+s;}
function u15To8(t){const c=t.indexOf(':'),n=+t.slice(0,c),u=new Uint8Array(n);let buf=0,bits=0,j=0;for(let i=c+1;i<t.length&&j<n;i++){buf=((buf<<15)|(t.charCodeAt(i)-0x20))>>>0;bits+=15;while(bits>=8&&j<n){bits-=8;u[j++]=(buf>>>bits)&0xFF;}buf&=(1<<bits)-1;}return u;}
async function packSave(str){if(typeof CompressionStream==='undefined'){const {d}=await gzB64(str);return 'b6:'+d;}
  const u=new Uint8Array(await new Response(new Blob([str]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());return 'gu:'+u8To15(u);}
async function unpackSave(s){if(!s)return null;if(s[0]==='{')return JSON.parse(s);const p=s.slice(0,3);
  if(p==='gu:')return JSON.parse(await new Response(new Blob([u15To8(s.slice(3))]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
  if(p!=='gz:'&&p!=='b6:')return null;return JSON.parse(await unGzB64(p==='gz:'?'gz':'b64',s.slice(3)));}
function slotSave(i){const meta=JSON.stringify({name:G.name,day:G.day,cash:G.cash,val:valuation(),scn:G.scn?SCN[G.scn.id].n:'',diff:G.diff?G.diff.n:(LANG_EN?"Normal":'Normal'),t:Date.now()});
  packSave(saveJSON()).then(s=>{try{localStorage.setItem(SLOT_KEY(i),s);localStorage.setItem(SLOT_META(i),meta);LSU.t=0;showToast((LANG_EN?`Saved to slot ${i}.`:`Yuva ${i}'e kaydedildi.`));UI.force=true;render();}
    catch(e){showToast((LANG_EN?"Couldn't save: browser storage is full or disabled.":'Kayıt yapılamadı: tarayıcı depolama alanı dolu ya da kapalı.'),'bad');}}).catch(()=>showToast((LANG_EN?"Could not save.":'Kayıt yapılamadı.'),'bad'));}
/* eski düz JSON yuvaları bir kez sıkıştır */
function slotRepack(){for(const i of [1,2,3]){let s=null;try{s=localStorage.getItem(SLOT_KEY(i));}catch(e){}if(s&&s[0]==='{')packSave(s).then(p=>{try{localStorage.setItem(SLOT_KEY(i),p);LSU.t=0;}catch(e){}}).catch(()=>{});}
  try{const r=localStorage.getItem(RESCUE_KEY);if(r&&r[0]==='{')packSave(r).then(p=>{try{localStorage.setItem(RESCUE_KEY,p);}catch(e){}}).catch(()=>{});}catch(e){}}
/* tarayıcıda oyunun kullandığı alan (karakter), 5 sn önbellekli */
const LSU={t:0,v:0};
function lsUsage(){const now=Date.now();if(now-LSU.t<5000)return LSU.v;let n=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('silikon-garaj'))n+=k.length+(localStorage.getItem(k)||'').length;}}catch(e){}LSU.t=now;LSU.v=n;return n;}
const kb=n=>n>=1048576?`${fx(n/1048576,1)} MB`:`${Math.max(1,Math.round(n/1024))} KB`;
function loadGameObj(g){
  if(!g||g.v!==2||!g.emps){showToast((LANG_EN?"Invalid save.":'Geçersiz kayıt.'),'bad');return false;}
  G=migrate(g);G.speed=0;Object.assign(UI,{tab:'office',selEmp:null,rival:null,branch:null,draft:null,dd:null,sue:null,lp:null,edit:false,placing:null});
  OV.layoutKey='';RV.key='';ECO.key='';DEPT_CACHE.key='';closeModal();save();UI.force=true;render();return true;}
function slotLoad(i){let s=null;try{s=localStorage.getItem(SLOT_KEY(i));}catch(e){}unpackSave(s).then(g=>{if(loadGameObj(g))showToast((LANG_EN?`Slot ${i} loaded.`:`Yuva ${i} yüklendi.`));}).catch(()=>showToast((LANG_EN?"Couldn't read the save.":'Kayıt okunamadı.'),'bad'));}
function vPrefs(){
  return vA11y()+vPrefs0();}
function vPrefs0(){
  const tg=(k,on,lab)=>`<button class="btn sm ${on?'primary':''}" data-act="pref" data-k="${k}" aria-pressed="${on}">${lab}: ${on?(LANG_EN?"On":'Açık'):(LANG_EN?"Off":'Kapalı')}</button>`;
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Sound and display</h2><span class="sub">Stored in this browser</span></div><div class="pb col" style="gap:12px">
    <div class="row" style="gap:6px;flex-wrap:wrap">${tg('sfx',PREF.sfx,"Sound effects")}${tg('music',PREF.music,"Music")}${tg('mute',!PREF.mute,"All sounds")}</div>
    <label class="row small" for="pvol" style="gap:10px">Volume <input type="range" id="pvol" min="0" max="1" step="0.05" value="${PREF.vol}" data-bind="pref.vol" data-num="1" style="width:180px"> <b class="num">${Math.round(PREF.vol*100)}</b></label>
    <div class="row" style="gap:6px;flex-wrap:wrap">${tg('brandUI',PREF.brandUI,"Brand color in UI")}<span class="small muted">${G.bi&&G.bi.lg?(biAccentPick()?"Buttons and highlights use your logo's color.":"Your logo's colors aren't readable in this theme; the default color stays."):"First design a logo under Market → Brand identity."}</span></div>
    <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ${G.adv&&!G.adv.off?'primary':''}" data-act="advtoggle" aria-pressed="${!!(G.adv&&!G.adv.off)}">Advisor: ${G.adv&&!G.adv.off?"On":"Off"}</button><span class="small muted">The advisor suggests the most important tasks in the Next move panel on the CEO desk.</span></div>
    <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ${ibOn()?'primary':''}" data-act="decide" aria-pressed="${ibOn()}">Decision inbox: ${ibOn()?"On":"Off"}</button><span class="small muted">${ibOn()?"Decisions pile up in the inbox; the game only pauses for urgent events.":"Each decision opens as soon as it arrives and pauses the game."}</span></div>
    <div class="row" style="gap:6px;flex-wrap:wrap">${tg('feelOff',!PREF.feelOff,"Celebrations and animations")}<span class="small muted">Launch moments, confetti, month-end profit and applause in the office.</span></div>
    <div class="row" style="gap:6px;flex-wrap:wrap">${tg('tipsOff',!PREF.tipsOff,"First-time tips")}<button class="btn sm ghost" data-act="tipsreset" ${(PREF.tipSeen||[]).length?'':'disabled'}>Reset seen tips</button><span class="small muted">When you open a section for the first time, a short note explains what to do there.</span></div>
    <div class="row" style="gap:6px;flex-wrap:wrap">${tg('wrapOff',!PREF.wrapOff,"Year in review")}<span class="small muted">Every January, after the annual report, the year's highlights are shown as sliding cards.</span></div>
    <div class="row" style="gap:6px;flex-wrap:wrap">${tg('stageAuto',!PREF.stageAuto,"Play the launch stage")}<span class="small muted">When off, stage events and keynotes are presented automatically (with a random demo risk).</span></div>
    <div class="row" style="gap:6px;flex-wrap:wrap">${tg('season',PREF.season,"Seasonal visuals")}<span class="small muted">Snow, leaves and flowers in the windows; holiday lights in December.</span></div>
    <div class="row" style="gap:6px;flex-wrap:wrap" role="group" aria-label="Day and night"><span class="small"><b>Day and night in the office:</b></span>${[['game',"Game time"],['real',"Real time"],['off',"Off"]].map(([k,n])=>`<button class="btn sm ${PREF.dn===k?'primary':''}" data-act="prefdn" data-k="${k}" aria-pressed="${PREF.dn===k}">${n}</button>`).join('')}</div>
    <p class="small muted">Sounds and music are generated in the browser and start playing after your first click. Music plays softer at night. With "Game time", the office day cycles in about two minutes while the game runs and stops when it's paused; "Real time" uses your clock.</p></div></section>`:`<section class="panel"><div class="ph"><h2>Ses ve görüntü</h2><span class="sub">Bu tarayıcıda saklanır</span></div><div class="pb col" style="gap:12px">
    <div class="row" style="gap:6px;flex-wrap:wrap">${tg('sfx',PREF.sfx,'Ses efektleri')}${tg('music',PREF.music,'Müzik')}${tg('mute',!PREF.mute,'Tüm sesler')}</div>
    <label class="row small" for="pvol" style="gap:10px">Ses düzeyi <input type="range" id="pvol" min="0" max="1" step="0.05" value="${PREF.vol}" data-bind="pref.vol" data-num="1" style="width:180px"> <b class="num">${Math.round(PREF.vol*100)}</b></label>
    <div class="row" style="gap:6px;flex-wrap:wrap">${tg('brandUI',PREF.brandUI,'Arayüzde marka rengi')}<span class="small muted">${G.bi&&G.bi.lg?(biAccentPick()?'Düğmeler ve vurgular logonun rengini alır.':'Logonun renkleri bu temada okunur değil; varsayılan renk kalır.'):'Önce Pazar → Marka kimliği bölümünden bir logo tasarla.'}</span></div>
    <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ${G.adv&&!G.adv.off?'primary':''}" data-act="advtoggle" aria-pressed="${!!(G.adv&&!G.adv.off)}">Danışman: ${G.adv&&!G.adv.off?'Açık':'Kapalı'}</button><span class="small muted">Danışman CEO masasındaki Sıradaki hamle panelinde en önemli işleri önerir.</span></div>
    <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ${ibOn()?'primary':''}" data-act="decide" aria-pressed="${ibOn()}">Karar kutusu: ${ibOn()?'Açık':'Kapalı'}</button><span class="small muted">${ibOn()?'Kararlar kutuda birikir, oyun yalnızca acil olaylarda durur.':'Her karar geldiği anda açılır ve oyunu durdurur.'}</span></div>
    <div class="row" style="gap:6px;flex-wrap:wrap">${tg('feelOff',!PREF.feelOff,'Kutlamalar ve animasyonlar')}<span class="small muted">Lansman anı, konfeti, ay sonu kârı ve ofiste alkış.</span></div>
    <div class="row" style="gap:6px;flex-wrap:wrap">${tg('tipsOff',!PREF.tipsOff,'İlk kez ipuçları')}<button class="btn sm ghost" data-act="tipsreset" ${(PREF.tipSeen||[]).length?'':'disabled'}>Gördüklerimi sıfırla</button><span class="small muted">Bir bölümü ilk kez açtığında orada ne yapacağını anlatan kısa bir not çıkar.</span></div>
    <div class="row" style="gap:6px;flex-wrap:wrap">${tg('wrapOff',!PREF.wrapOff,'Yıl sonu özeti')}<span class="small muted">Her ocakta faaliyet raporundan sonra yılın özeti kayan kartlarla gösterilir.</span></div>
    <div class="row" style="gap:6px;flex-wrap:wrap">${tg('stageAuto',!PREF.stageAuto,'Lansman sahnesini oyna')}<span class="small muted">Kapalıysa sahne etkinliği ve keynote'lar otomatik sunulur (rastgele demo riskiyle).</span></div>
    <div class="row" style="gap:6px;flex-wrap:wrap">${tg('season',PREF.season,'Mevsim görselleri')}<span class="small muted">Pencerelerde kar, yaprak ve çiçek; aralık ayında yılbaşı ışıkları.</span></div>
    <div class="row" style="gap:6px;flex-wrap:wrap" role="group" aria-label="Gece ve gündüz"><span class="small"><b>Ofiste gece ve gündüz:</b></span>${[['game','Oyun saati'],['real','Gerçek saat'],['off','Kapalı']].map(([k,n])=>`<button class="btn sm ${PREF.dn===k?'primary':''}" data-act="prefdn" data-k="${k}" aria-pressed="${PREF.dn===k}">${n}</button>`).join('')}</div>
    <p class="small muted">Sesler ve müzik tarayıcıda üretilir; ilk tıklamadan sonra çalmaya başlar. Müzik gece daha sakin çalar. "Oyun saati"nde ofisteki gün, oyun akarken yaklaşık iki dakikada döner ve oyun duraklayınca durur; "Gerçek saat" senin saatini kullanır.</p></div></section>`);
}
function vSlots(){
  const rows=[1,2,3].map(i=>{const m=slotMeta(i);
    return (LANG_EN?`<div class="row between" style="border-bottom:1px solid var(--line);padding:6px 0"><span><b>Slot ${i}</b> ${m?`<span class="small">${esc(m.name)} · ${fmtDate(m.day)} · cash ${money(m.cash)} · valuation ${money(m.val)}${m.scn?' · '+esc(m.scn):''} · ${esc(m.diff)}</span><div class="small muted">${new Date(m.t).toLocaleString(LOC)}</div>`:"<span class=\"small muted\">Empty</span>"}</span>
      <span class="row"><button class="btn sm" data-act="slotsave" data-i="${i}">Save</button><button class="btn sm" data-act="slotload" data-i="${i}" ${m?'':'disabled'}>Load</button><button class="btn sm ghost" data-act="slotdel" data-i="${i}" ${m?'':'disabled'}>Delete</button></span></div>`:`<div class="row between" style="border-bottom:1px solid var(--line);padding:6px 0"><span><b>Yuva ${i}</b> ${m?`<span class="small">${esc(m.name)} · ${fmtDate(m.day)} · nakit ${money(m.cash)} · değerleme ${money(m.val)}${m.scn?' · '+esc(m.scn):''} · ${esc(m.diff)}</span><div class="small muted">${new Date(m.t).toLocaleString(LOC)}</div>`:'<span class="small muted">Boş</span>'}</span>
      <span class="row"><button class="btn sm" data-act="slotsave" data-i="${i}">Kaydet</button><button class="btn sm" data-act="slotload" data-i="${i}" ${m?'':'disabled'}>Yükle</button><button class="btn sm ghost" data-act="slotdel" data-i="${i}" ${m?'':'disabled'}>Sil</button></span></div>`);}).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Save</h2><span class="sub">Autosaves monthly · difficulty: ${G.diff?esc(G.diff.n):"Normal"} · version ${VER}</span></div>
    <div class="pb small muted" style="padding-bottom:0">Company save ${kb(SAVE_SZ.n||JSON.stringify(G).length)} · space used by the game in this browser ${kb(lsUsage())} (browsers usually allow about 5 MB). Slots are stored compressed.${SAVE_SZ.fail?" <b class=\"neg\">The last autosave failed: storage is full. Delete a slot or save to a file.</b>":''}</div><div class="pb col">
    <label class="f" for="coname" style="max-width:320px">Company name<input type="text" id="coname" data-bind="name" value="${esc(G.name)}" maxlength="28"></label>
    ${rows}
    <div class="row"><button class="btn sm" data-act="exportsave">Export</button><button class="btn sm" data-act="importsave">Import</button><span class="small muted">Move your save to another browser or device.</span></div>
    ${vLangPick()}
    ${vSimpleToggle()}
    ${vFocusToggle()}
    ${vApPrefs()}
    ${vAiPrefs()}
    <div class="row"><button class="btn sm" data-act="tuton">${G.tut&&G.tut.on?"Tutorial on":"Restart tutorial"}</button><button class="btn danger" data-act="newgame">Start a new game</button></div></div></section>`:`<section class="panel"><div class="ph"><h2>Kayıt</h2><span class="sub">Otomatik kayıt her ay · zorluk: ${G.diff?esc(G.diff.n):'Normal'} · sürüm ${VER}</span></div>
    <div class="pb small muted" style="padding-bottom:0">Şirketin kaydı ${kb(SAVE_SZ.n||JSON.stringify(G).length)} · bu tarayıcıda oyunun kullandığı alan ${kb(lsUsage())} (tarayıcılar genelde 5 MB kadarına izin verir). Yuvalar sıkıştırılarak saklanır.${SAVE_SZ.fail?' <b class="neg">Son otomatik kayıt yapılamadı: alan dolu. Bir yuvayı sil ya da dosyaya kaydet.</b>':''}</div><div class="pb col">
    <label class="f" for="coname" style="max-width:320px">Şirket adı<input type="text" id="coname" data-bind="name" value="${esc(G.name)}" maxlength="28"></label>
    ${rows}
    <div class="row"><button class="btn sm" data-act="exportsave">Dışa aktar</button><button class="btn sm" data-act="importsave">İçe aktar</button><span class="small muted">Kaydını başka bir tarayıcıya ya da cihaza taşı.</span></div>
    ${vLangPick()}
    ${vSimpleToggle()}
    ${vFocusToggle()}
    ${vApPrefs()}
    ${vAiPrefs()}
    <div class="row"><button class="btn sm" data-act="tuton">${G.tut&&G.tut.on?'Öğretici açık':'Öğreticiyi yeniden başlat'}</button><button class="btn danger" data-act="newgame">Yeni oyun başlat</button></div></div></section>`)+vCloud();
}
let DL=null;try{if(window.claude&&typeof window.claude.use==='function')Promise.resolve(window.claude.use('downloads')).then(d=>{DL=d||null;}).catch(()=>{});}catch(e){}
const encSave=()=>{try{return btoa(unescape(encodeURIComponent(JSON.stringify(G))));}catch(e){return '';}};
const decSave=t=>{t=(t||'').trim();if(!t)return null;try{return JSON.parse(t[0]==='{'?t:decodeURIComponent(escape(atob(t))));}catch(e){return null;}};

