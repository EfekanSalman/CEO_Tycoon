/* ============================== PRODUCT FEATURES ============================== */
/* Her kategoride somut özellikler. Seçilen özellik tarife kendi bileşenlerini ekler (iş yükü w), puanı (sc) ve kesim çekiciliğini (seg) artırır.
   std yılından sonra özellik "standart" olur: işi yarıya iner, katkısı azalır, olmaması puan kaybettirir. Yeni (standart olmayan) özellikler basına artı yazar.
   d.feats tanımsızsa (eski kayıt, yan proje) hiçbir etki yoktur. */
const FT={
  login:{n:(LANG_EN?"Accounts and login":'Hesap ve giriş'),d:(LANG_EN?"User accounts, password reset and sessions.":'Kullanıcı hesabı, şifre sıfırlama ve oturum.'),cats:['app','saas'],w:0.06,sc:0.04,c:{be:2,db:2,ui:1},seg:{main:0.02},std:2015},
  pay:{n:(LANG_EN?"In-app payments":'Uygulama içi ödeme'),d:(LANG_EN?"Subscriptions and purchases right inside the product.":'Abonelik ve satın alma doğrudan üründe.'),cats:['app','saas'],w:0.07,sc:0.04,c:{be:3,db:1,net:1},seg:{pro:0.02,eco:-0.01},std:2017},
  social:{n:(LANG_EN?"Sharing and social feed":'Paylaşım ve sosyal akış'),d:(LANG_EN?"Sharing, likes and comments with friends.":'Arkadaşlarla paylaşım, beğeni ve yorum.'),cats:['app'],w:0.09,sc:0.07,c:{ui:2,be:2,net:2},seg:{main:0.04,eco:0.02},std:2018},
  video:{n:(LANG_EN?"Video playback":'Video oynatma'),d:(LANG_EN?"High-resolution video and live streaming.":'Yüksek çözünürlüklü video ve canlı yayın.'),cats:['app','saas'],w:0.1,sc:0.08,c:{net:3,be:2,ui:1},seg:{main:0.04},std:2020},
  dark:{n:(LANG_EN?"Dark mode":'Karanlık tema'),d:(LANG_EN?"An easy-on-the-eyes interface for night use.":'Gece kullanımı için göz yormayan arayüz.'),cats:['app','os'],w:0.04,sc:0.03,c:{gfx:3,ui:1},seg:{main:0.02},rv:0.1,yr:2018,std:2020},
  offline:{n:(LANG_EN?"Offline mode":'Çevrimdışı mod'),d:(LANG_EN?"Works without internet and syncs later.":'İnternet yokken de çalışır, sonra eşitler.'),cats:['app'],w:0.05,sc:0.04,c:{db:2,ui:1},seg:{eco:0.04}},
  sync:{n:(LANG_EN?"Cloud sync":'Bulut eşitleme'),d:(LANG_EN?"Data stays up to date across all devices.":'Veriler tüm cihazlarda anında güncel.'),cats:['app','saas','os'],w:0.08,sc:0.06,c:{net:2,db:2},res:'cloud',seg:{pro:0.04,main:0.02},std:2021},
  e2e:{n:(LANG_EN?"End-to-end encryption":'Uçtan uca şifreleme'),d:(LANG_EN?"Messages and files are visible only to the user.":'Mesajlar ve dosyalar yalnızca kullanıcıya açık.'),cats:['app','saas','os'],w:0.06,sc:0.05,c:{net:2,db:1},res:'sec1',seg:{pro:0.06},std:2022},
  teams:{n:(LANG_EN?"Team workspaces":'Ekip çalışma alanları'),d:(LANG_EN?"Shared work, permissions and admin for companies.":'Şirketler için ortak çalışma, yetki ve yönetim.'),cats:['saas'],w:0.09,sc:0.07,c:{be:2,db:2,ui:1},seg:{pro:0.06},std:2019},
  api:{n:(LANG_EN?"Open API and integrations":'Açık API ve entegrasyonlar'),d:(LANG_EN?"Connects with other software; professionals love it.":'Başka yazılımlarla bağlanır; profesyoneller sever.'),cats:['saas','os'],w:0.07,sc:0.05,c:{be:3,net:1},seg:{pro:0.05}},
  assist:{n:(LANG_EN?"AI assistant":'Yapay zekâ asistanı'),d:(LANG_EN?"Suggestions, summaries and smart search.":'Öneri, özetleme ve akıllı arama.'),cats:['app','saas','os','phone','car','iot'],w:0.1,sc:0.09,c:{ml:3,ui:1},res:'ml',seg:{pro:0.04,main:0.03},std:2024},
  chat:{n:(LANG_EN?"Chat interface":'Sohbet arayüzü'),d:(LANG_EN?"Ask in natural language and the product answers.":'Doğal dille soru sorulur, ürün yanıtlar.'),cats:['ai','saas','app'],w:0.1,sc:0.1,c:{ml:4,ui:2},res:'llm',seg:{main:0.05,pro:0.03},std:2025},
  store:{n:(LANG_EN?"App store":'Uygulama mağazası'),d:(LANG_EN?"Developers sell apps, users install them easily.":'Geliştiriciler uygulama satar, kullanıcılar kolayca indirir.'),cats:['os'],w:0.07,sc:0.06,c:{be:2,net:2,ui:2},seg:{main:0.04},std:2015},
  multiw:{n:(LANG_EN?"Multi-window":'Çoklu pencere'),d:(LANG_EN?"Several apps side by side at once.":'Aynı anda birden çok uygulama yan yana.'),cats:['os'],w:0.05,sc:0.04,c:{krn:2,ui:2},seg:{pro:0.04},std:2019},
  ota:{n:(LANG_EN?"Over-the-air updates":'Uzaktan güncelleme'),d:(LANG_EN?"New versions arrive wirelessly and automatically.":'Yeni sürümler kablosuz ve otomatik gelir.'),cats:['os','car','iot','robo'],w:0.06,sc:0.05,c:{net:2,fw:2},seg:{main:0.02,pro:0.02},std:2020},
  fp:{n:(LANG_EN?"Fingerprint reader":'Parmak izi okuyucu'),d:(LANG_EN?"Secure unlocking with a single touch.":'Tek dokunuşla güvenli kilit açma.'),cats:['phone'],w:0.05,sc:0.05,uc:0.02,c:{sens:2,fw:1},seg:{main:0.03},std:2017},
  face:{n:(LANG_EN?"Face recognition":'Yüz tanıma'),d:(LANG_EN?"Secure identity verification with the camera.":'Kameradan güvenli kimlik doğrulama.'),cats:['phone','xr'],w:0.08,sc:0.07,uc:0.03,c:{sens:3,ml:1,fw:1},res:'cam',seg:{main:0.03,pro:0.03},std:2021},
  wless:{n:(LANG_EN?"Wireless charging":'Kablosuz şarj'),d:(LANG_EN?"Charging without plugging in a cable.":'Kablo takmadan şarj.'),cats:['phone','wear'],w:0.05,sc:0.05,uc:0.03,c:{pcb:2,mech:1},res:'batt',seg:{main:0.03},std:2020},
  water:{n:(LANG_EN?"Water resistance":'Suya dayanıklılık'),d:(LANG_EN?"No trouble in the rain or the pool.":'Yağmurda ve havuzda sorun çıkarmaz.'),cats:['phone','wear'],w:0.05,sc:0.04,uc:0.02,c:{mech:3,ind:1},seg:{eco:0.03,main:0.02},std:2019},
  g5:{n:(LANG_EN?"5G connectivity":'5G bağlantı'),d:(LANG_EN?"Much faster mobile internet.":'Çok daha hızlı mobil internet.'),cats:['phone','xr','iot'],w:0.07,sc:0.07,uc:0.04,c:{pcb:2,fw:2},seg:{pro:0.04,main:0.02},yr:2019,std:2022},
  health:{n:(LANG_EN?"Heart rate and health tracking":'Nabız ve sağlık takibi'),d:(LANG_EN?"Heart rate, sleep and exercise tracking.":'Nabız, uyku ve egzersiz ölçümü.'),cats:['wear','phone'],w:0.08,sc:0.08,uc:0.03,c:{sens:3,fw:1},res:'health',seg:{main:0.05},std:2020},
  gps:{n:(LANG_EN?"Built-in GPS":'Dahili GPS'),d:(LANG_EN?"Location and route tracking without a phone.":'Telefonsuz konum ve rota takibi.'),cats:['wear'],w:0.05,sc:0.05,uc:0.02,c:{pcb:1,sens:1,fw:1},seg:{pro:0.03},std:2019},
  hand:{n:(LANG_EN?"Hand tracking":'El takibi'),d:(LANG_EN?"Control with your hands, no controller.":'Kumandasız, ellerle kontrol.'),cats:['xr'],w:0.08,sc:0.08,c:{sens:2,ml:2},res:'eyetrack',seg:{pro:0.04,main:0.03}},
  ports:{n:(LANG_EN?"Fast I/O ports":'Hızlı bağlantı noktaları'),d:(LANG_EN?"High-speed data and display transfer.":'Yüksek hızlı veri ve görüntü aktarımı.'),cats:['pc'],w:0.04,sc:0.04,uc:0.01,c:{pcb:2},seg:{pro:0.04},std:2020},
  rgb:{n:(LANG_EN?"RGB lighting":'RGB aydınlatma'),d:(LANG_EN?"Colorful lights gamers love.":'Oyuncuların sevdiği renkli ışıklar.'),cats:['pc','console'],w:0.03,sc:0.02,uc:0.01,c:{ind:1,pcb:1},seg:{eco:0.02},rv:0.1},
  bc:{n:(LANG_EN?"Backward compatibility":'Geriye dönük uyumluluk'),d:(LANG_EN?"Older-generation games run too.":'Eski nesil oyunlar da çalışır.'),cats:['console'],w:0.07,sc:0.06,c:{fw:3,krn:1},seg:{main:0.05},std:2021},
  cloudg:{n:(LANG_EN?"Cloud gaming":'Bulut oyun'),d:(LANG_EN?"Games run on servers and stream to the device.":'Oyunlar sunucuda çalışır, cihaza yayınlanır.'),cats:['console','pc'],w:0.08,sc:0.06,c:{net:3,be:2},res:'cloud',seg:{eco:0.03,main:0.02}},
  rtx:{n:(LANG_EN?"Ray tracing support":'Işın izleme desteği'),d:(LANG_EN?"Realistic lighting and reflections.":'Gerçekçi ışık ve yansımalar.'),cats:['console','pc'],w:0.07,sc:0.07,uc:0.03,c:{pcb:2,fw:1},res:'rt',seg:{pro:0.05},std:2023},
  vec:{n:(LANG_EN?"Vector acceleration":'Vektör hızlandırma'),d:(LANG_EN?"Speed for media and scientific computing.":'Medya ve bilimsel hesaplamada hız.'),cats:['cpu'],w:0.06,sc:0.05,c:{die:2},seg:{pro:0.04},std:2018},
  npu:{n:(LANG_EN?"AI unit":'Yapay zekâ birimi'),d:(LANG_EN?"On-device AI computing.":'Cihaz üstünde yapay zekâ hesaplaması.'),cats:['cpu','phone','pc'],w:0.09,sc:0.08,uc:0.03,c:{die:3,fw:1},res:'ai',seg:{pro:0.05,main:0.02},std:2024},
  enclave:{n:(LANG_EN?"Secure enclave":'Güvenli bölge'),d:(LANG_EN?"Passwords and payment data kept in a separate, protected area.":'Şifre ve ödeme verisi ayrı, korumalı alanda.'),cats:['cpu','phone'],w:0.05,sc:0.04,c:{die:1,fw:2},res:'sec1',seg:{pro:0.04},std:2021},
  qec:{n:(LANG_EN?"Error-correction layer":'Hata düzeltme katmanı'),d:(LANG_EN?"Corrects qubit errors in software.":'Kübit hatalarını yazılımla düzeltir.'),cats:['qc'],w:0.1,sc:0.1,c:{die:2,krn:2},res:'qc3',seg:{pro:0.06}},
  park:{n:(LANG_EN?"Self-parking":'Otomatik park'),d:(LANG_EN?"The car parks itself.":'Araç kendini park eder.'),cats:['car'],w:0.07,sc:0.07,c:{ml:2,fw:1},res:'adas',seg:{main:0.04}},
  voice:{n:(LANG_EN?"Voice commands":'Sesli komut'),d:(LANG_EN?"Control and responses by voice.":'Sesle kontrol ve yanıt.'),cats:['car','iot','wear'],w:0.06,sc:0.05,c:{ml:2,ui:1},res:'ml',seg:{main:0.04},std:2021},
  matter:{n:(LANG_EN?"Common standard support":'Ortak standart desteği'),d:(LANG_EN?"Works with every smart home brand.":'Tüm akıllı ev markalarıyla çalışır.'),cats:['iot'],w:0.06,sc:0.06,c:{net:2,fw:1},res:'matter',seg:{main:0.04},std:2024},
  appc:{n:(LANG_EN?"App control":'Uygulamadan kontrol'),d:(LANG_EN?"Remote management from your phone.":'Telefondan uzaktan yönetim.'),cats:['iot','robo'],w:0.05,sc:0.05,c:{ui:2,net:1},seg:{main:0.03},std:2018},
  vision:{n:(LANG_EN?"Computer vision":'Görüntü işleme'),d:(LANG_EN?"Recognizes its surroundings with a camera.":'Kamerayla çevresini tanır.'),cats:['robo','car','iot'],w:0.09,sc:0.08,c:{ml:3,sens:1},res:'ml',seg:{pro:0.05}},
  grip:{n:(LANG_EN?"Precision grip":'Hassas tutuş'),d:(LANG_EN?"Grips even fragile objects safely.":'Kırılgan nesneleri bile güvenle kavrar.'),cats:['robo'],w:0.08,sc:0.07,c:{mech:2,sens:1},res:'actu',seg:{pro:0.05}}};
// FT_K: özelliklerin puan katkısı ölçeği (bot ölçümünde tam değer fazla güçlü çıktı)
const FT_K=0.55;
const ftYear=()=>dateOf(G.day).getFullYear();
const ftOpen=f=>(!f.res||has(f.res))&&(!f.yr||ftYear()>=f.yr);
const ftStd=(f,y)=>f.std!=null&&(y||ftYear())>=f.std;
const ftComps=(k,cat)=>{const R=REQ_ROLES[cat]||[];return Object.keys(FT[k].c).filter(c=>R.includes(COMP[c].r));};
const ftList=cat=>Object.keys(FT).filter(k=>FT[k].cats.includes(cat)&&ftComps(k,cat).length);
const ftDefault=cat=>ftList(cat).filter(k=>ftOpen(FT[k])&&ftStd(FT[k]));
function ftEff(cat,feats,y){y=y||ftYear();const o={w:0,sc:0,uc:0,rv:0,seg:{eco:0,main:0,pro:0},miss:[],per:{}};if(!Array.isArray(feats))return o;const S=new Set(feats);
  for(const k of ftList(cat)){const f=FT[k],std=ftStd(f,y);
    if(S.has(k)){const w=f.w*(std?0.5:1);o.w+=w;o.per[k]=w;o.sc+=FT_K*f.sc*(std?0.4:1);o.uc+=f.uc||0;if(!std)o.rv+=f.rv!=null?f.rv:0.1;for(const s in f.seg||{})o.seg[s]+=f.seg[s];}
    else if(std&&ftOpen(f)){o.sc-=FT_K*f.sc*0.6;o.miss.push(k);}}
  o.sc=clamp(o.sc,-0.2,0.25);o.rv=Math.min(0.3,o.rv);return o;}
// özelliklerin iş puanı, bileşen bazında: {rol:{bileşen:puan}}
function ftPts(cat,feats,base,y){const E=ftEff(cat,feats,y),out={};
  for(const k in E.per){const cs=ftComps(k,cat),sw=cs.reduce((a,c)=>a+FT[k].c[c],0);for(const c of cs){const t=COMP[c].r;(out[t]=out[t]||{})[c]=(out[t][c]||0)+base*E.per[k]*FT[k].c[c]/sw;}}
  return out;}
function ftSpec(r,d){const base=Object.values(r.req).reduce((a,b)=>a+b,0),E=ftEff(d.cat,d.feats),P=ftPts(d.cat,d.feats,base);
  for(const t in P)if(r.req[t]!=null)for(const c in P[t])r.req[t]+=P[t][c];
  r.score*=1+E.sc;if(r.uc)r.uc*=1+E.uc;r.ft=E;}
const FTS=new Map();
const FTW=new WeakMap();
function ftSeg(p,s){if(!p.feats||!p.feats.length)return 1;const w=FTW.get(p);if(w&&w.d===G.day&&w.g===G&&w.f===p.feats&&w.n===p.feats.length)return w.v[s]||1;
  const k=p.id+'|'+p.feats.join()+'|'+ftYear();let v=FTS.get(k);
  if(!v){if(FTS.size>400)FTS.clear();const E=ftEff(p.cat,p.feats);v={};for(const x in E.seg)v[x]=clamp(1+E.seg[x],0.85,1.25);FTS.set(k,v);}FTW.set(p,{d:G.day,g:G,f:p.feats,n:p.feats.length,v});return v[s]||1;}
// güncellemede eklenen özelliklerin puan katkısı
function ftGain(cat,f0,f1){return (1+ftEff(cat,f1||[]).sc)/(1+ftEff(cat,f0||[]).sc);}
const ftAddFor=(p,k)=>UI.uft&&UI.uft.pid===p.id&&(k==='minor'||k==='major')?UI.uft.add:[];
function ftToggle(list,k,cat){if(!FT[k]||!ftList(cat).includes(k)||!ftOpen(FT[k]))return list;return list.includes(k)?list.filter(x=>x!==k):[...list,k];}
function ftMonthly(){if(dateOf(G.day).getMonth()!==0)return;const y=ftYear(),cats=new Set([...myActive().map(p=>p.cat),...G.projects.map(p=>p.cat)]);
  const L=Object.keys(FT).filter(k=>FT[k].std===y&&FT[k].cats.some(c=>cats.has(c)));if(L.length)news((LANG_EN?`The market now considers these standard: ${L.map(k=>FT[k].n).join(', ')}. New products without them lose score.`:`Pazar artık şunları standart sayıyor: ${L.map(k=>FT[k].n).join(', ')}. Bu özellikleri olmayan yeni ürünler puan kaybeder.`),'mkt',true);}
// UI
const ftPc=x=>`${x>=0?'+':'−'}${pctN(Math.abs(Math.round(x*100)))}`;
function ftPicker(cat,sel,mode,base,lim){const L=ftList(cat);if(!L.length)return '';const y=ftYear(),E=ftEff(cat,mode==='u'?[...(base||[]),...sel]:sel),add=mode==='u'?sel.length:0;
  const rows=L.map(k=>{const f=FT[k],open=ftOpen(f),std=ftStd(f,y),had=mode==='u'&&(base||[]).includes(k),on=had||sel.includes(k);
    const st=!open?`<span class="chip st-mute">${f.res&&!has(f.res)?(LANG_EN?`Research: ${esc(RESD[f.res]?RESD[f.res].n:f.res)}`:`Araştırma: ${esc(RESD[f.res]?RESD[f.res].n:f.res)}`):(LANG_EN?`in ${f.yr}`:`${f.yr} yılında`)}</span>`:std?(LANG_EN?`<span class="chip ${on?'st-ok':'st-warn'}">Standard${on?'':" · missing"}</span>`:`<span class="chip ${on?'st-ok':'st-warn'}">Standart${on?'':' · eksik'}</span>`):(LANG_EN?`<span class="chip st-ok">Innovation</span>`:`<span class="chip st-ok">Yenilik</span>`);
    const segs=Object.entries(f.seg||{}).filter(([,v])=>v>0).map(([s])=>({eco:(LANG_EN?"price-focused":'fiyat odaklı'),main:(LANG_EN?"mainstream":'ana akım'),pro:(LANG_EN?"discerning":'seçici')})[s]).join(', ');
    const fx0=(LANG_EN?`score ${ftPc(FT_K*f.sc*(std?0.4:1))} · work ${ftPc(f.w*(std?0.5:1))}${f.uc?` · unit cost ${ftPc(f.uc)}`:''}${segs?` · appeals to ${segs} buyers`:''}${!std?" · wins press points":''}`:`puan ${ftPc(FT_K*f.sc*(std?0.4:1))} · iş ${ftPc(f.w*(std?0.5:1))}${f.uc?` · birim maliyet ${ftPc(f.uc)}`:''}${segs?` · ${segs} kitle sever`:''}${!std?' · basına artı yazar':''}`);
    const dis=!open||had||(mode==='u'&&!on&&lim!=null&&add>=lim);
    return `<div class="ft-row${on?' on':''}"><div class="fa-n"><b>${esc(f.n)}</b><span class="small muted">${esc(f.d)}</span><span class="small">${st} <span class="muted">${fx0}</span></span></div>
      <button class="btn sm ${on?'primary':''}" data-act="${mode}feat" data-k="${k}" ${dis?'disabled':''} aria-pressed="${on}">${had?(LANG_EN?"Already in":'Üründe var'):on?(LANG_EN?"Selected":'Seçildi'):(LANG_EN?"Add":'Ekle')}</button></div>`;}).join('');
  const miss=E.miss.length?(LANG_EN?` · <span class="neg">missing standard: ${E.miss.map(k=>esc(FT[k].n)).join(', ')}</span>`:` · <span class="neg">eksik standart: ${E.miss.map(k=>esc(FT[k].n)).join(', ')}</span>`):'';
  return (LANG_EN?`<div class="ft"><div class="ft-h"><b>Features</b> <span class="small muted">${mode==='u'?`${add}/${lim} new`:`${sel.length} selected`} · score ${ftPc(E.sc)} · work ${ftPc(E.w)}${miss}</span></div><div class="col" style="gap:6px">${rows}</div></div>`:`<div class="ft"><div class="ft-h"><b>Özellikler</b> <span class="small muted">${mode==='u'?`${add}/${lim} yeni`:`${sel.length} seçili`} · puan ${ftPc(E.sc)} · iş ${ftPc(E.w)}${miss}</span></div><div class="col" style="gap:6px">${rows}</div></div>`);}
function ftChips(p){if(!Array.isArray(p.feats))return '';const y=ftYear(),miss=ftEff(p.cat,p.feats).miss;
  return (LANG_EN?`<div class="col" style="gap:6px"><b>Features</b><div class="cmp-l">${p.feats.length?p.feats.map(k=>FT[k]?`<span class="chip ${ftStd(FT[k],y)?'st-mute':'st-ok'}">${esc(FT[k].n)}</span>`:'').join(' '):"<span class=\"small muted\">No features.</span>"}${miss.map(k=>`<span class="chip st-bad" title="The market expects this">No ${esc(FT[k].n)}</span>`).join(' ')}</div></div>`:`<div class="col" style="gap:6px"><b>Özellikler</b><div class="cmp-l">${p.feats.length?p.feats.map(k=>FT[k]?`<span class="chip ${ftStd(FT[k],y)?'st-mute':'st-ok'}">${esc(FT[k].n)}</span>`:'').join(' '):'<span class="small muted">Özellik yok.</span>'}${miss.map(k=>`<span class="chip st-bad" title="Pazar bunu bekliyor">${esc(FT[k].n)} yok</span>`).join(' ')}</div></div>`);}
