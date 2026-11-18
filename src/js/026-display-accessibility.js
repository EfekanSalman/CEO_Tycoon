/* ============================== DISPLAY & ACCESSIBILITY ============================== */
const A11Y_DEF={theme:'sys',fs:1,rm:'sys',hc:false,cb:false,font:'std',toast:1};
const A11Y_FS=[[0.9,(LANG_EN?"90%":'%90')],[1,(LANG_EN?"100%":'%100')],[1.15,(LANG_EN?"115%":'%115')],[1.3,(LANG_EN?"130%":'%130')]],A11Y_TOAST=[[0.6,(LANG_EN?"Short":'Kısa')],[1,(LANG_EN?"Normal":'Normal')],[2,(LANG_EN?"Long":'Uzun')]];
function a11y(){const A=Object.assign({},A11Y_DEF,PREF.a11y||{});if(!A11Y_FS.some(x=>x[0]===A.fs))A.fs=1;if(!A11Y_TOAST.some(x=>x[0]===A.toast))A.toast=1;return A;}
const reduceMotion=()=>{const A=a11y();return A.rm==='on'||(A.rm!=='off'&&!!window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);};
let A11Y_RT=null;window.addEventListener('resize',()=>{clearTimeout(A11Y_RT);A11Y_RT=setTimeout(()=>{try{if(a11y().fs!==1)a11yApply();}catch(e){}},200);});
function a11ySet(k,v){PREF.a11y=Object.assign({},PREF.a11y||{},{[k]:v});prefSave();a11yApply();}
function a11yApply(){const A=a11y(),r=document.documentElement;
  if(A.theme==='light'||A.theme==='dark'){r.setAttribute('data-theme',A.theme);r.dataset.sgTheme='1';}else if(r.dataset.sgTheme){r.removeAttribute('data-theme');delete r.dataset.sgTheme;}
  r.classList.toggle('a-rm',A.rm==='on');r.classList.toggle('a-hc',!!A.hc);r.classList.toggle('a-cb',!!A.cb);r.classList.toggle('a-fl',A.font==='leg');
  const fz=window.innerWidth<520?Math.min(A.fs,1.15):A.fs;if(document.body)document.body.style.zoom=fz!==1?String(fz):'';
  if(A.font==='leg'&&!document.getElementById('a11yFont')){const l=document.createElement('link');l.id='a11yFont';l.rel='stylesheet';l.href=(LANG_EN?"https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap":'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap');document.head.appendChild(l);}
  if(typeof OV!=='undefined'){OV.colT=0;OV.col=null;}try{if(G)biAccent();}catch(e){}}
function vA11y(){const A=a11y(),seg=(k,opts,lab)=>`<div class="row" style="gap:6px;flex-wrap:wrap;align-items:center" role="group" aria-label="${lab}"><span class="small" style="min-width:150px"><b>${lab}</b></span>${opts.map(([v,n])=>`<button class="btn sm ${A[k]===v?'primary':''}" data-act="a11y" data-k="${k}" data-v="${v}" aria-pressed="${A[k]===v}">${n}</button>`).join('')}</div>`;
  const tg=(k,lab,d)=>`<div class="row" style="gap:6px;flex-wrap:wrap;align-items:center"><span class="small" style="min-width:150px"><b>${lab}</b></span><button class="btn sm ${A[k]?'primary':''}" data-act="a11y" data-k="${k}" data-v="${A[k]?'0':'1'}" aria-pressed="${!!A[k]}">${A[k]?(LANG_EN?"On":'Açık'):(LANG_EN?"Off":'Kapalı')}</button><span class="small muted">${d}</span></div>`;
  return (LANG_EN?`<section class="panel" id="a11yPanel"><div class="ph"><h2>Display and accessibility</h2><span class="sub">Saved in this browser</span></div><div class="pb col" style="gap:12px">
    ${seg('theme',[['sys',"System"],['light',"Light"],['dark',"Dark"]],"Theme")}
    ${seg('fs',A11Y_FS,"Text and UI size")}${A.fs>1.15&&window.innerWidth<520?"<div class=\"small muted\">On narrow screens, at most 115% is applied.</div>":''}
    ${seg('rm',[['sys',"System"],['on',"Reduce"],['off',"Full"]],"Motion and animation")}
    ${tg('hc',"High contrast","Darker text, sharper lines and a thick focus outline.")}
    ${tg('cb',"Color-blind friendly colors","Blue–orange instead of green–red: increase, decrease and status colors become distinguishable.")}
    ${seg('font',[['std',"Standard"],['leg',"Legible (Atkinson Hyperlegible)"]],"Font")}
    ${seg('toast',A11Y_TOAST,"Notification duration")}
    <div class="row" style="gap:6px"><button class="btn sm ghost" data-act="a11yreset">Restore defaults</button></div>
    <p class="small muted">"Reduce" turns off sliding cards, confetti, stage lights and number animations. Keyboard: 1–6 switch between sections, Ctrl+K opens search, ? opens the encyclopedia, Esc closes windows.</p></div></section>`:`<section class="panel" id="a11yPanel"><div class="ph"><h2>Görüntü ve erişilebilirlik</h2><span class="sub">Bu tarayıcıda saklanır</span></div><div class="pb col" style="gap:12px">
    ${seg('theme',[['sys','Sistem'],['light','Aydınlık'],['dark','Koyu']],'Tema')}
    ${seg('fs',A11Y_FS,'Yazı ve arayüz boyutu')}${A.fs>1.15&&window.innerWidth<520?'<div class="small muted">Dar ekranda en fazla %115 uygulanır.</div>':''}
    ${seg('rm',[['sys','Sistem'],['on','Azalt'],['off','Tam']],'Hareket ve animasyon')}
    ${tg('hc','Yüksek kontrast','Daha koyu yazı, belirgin çizgiler ve kalın odak çerçevesi.')}
    ${tg('cb','Renk körlüğü dostu renkler','Yeşil–kırmızı yerine mavi–turuncu: artış, düşüş ve durum renkleri ayırt edilebilir olur.')}
    ${seg('font',[['std','Standart'],['leg','Okunaklı (Atkinson Hyperlegible)']],'Yazı tipi')}
    ${seg('toast',A11Y_TOAST,'Bildirim süresi')}
    <div class="row" style="gap:6px"><button class="btn sm ghost" data-act="a11yreset">Varsayılanlara dön</button></div>
    <p class="small muted">"Azalt" seçeneği kayan kartları, konfetiyi, sahne ışıklarını ve sayı animasyonlarını kapatır. Klavye: 1–6 bölümler arasında gezinir, Ctrl+K arama açar, ? ansiklopediyi açar, Esc pencereleri kapatır.</p></div></section>`);}

const SND={ctx:null,master:null,sfxG:null,musG:null,bar:0,next:0};
function sndInit(){if(SND.ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  try{const c=new AC();SND.ctx=c;SND.master=c.createGain();SND.master.connect(c.destination);SND.sfxG=c.createGain();SND.sfxG.connect(SND.master);SND.musG=c.createGain();SND.musG.connect(SND.master);sndVol();return true;}catch(e){return false;}}
function sndVol(){if(!SND.ctx)return;const t=SND.ctx.currentTime;SND.master.gain.setTargetAtTime(PREF.mute?0:PREF.vol,t,0.05);SND.sfxG.gain.setTargetAtTime(PREF.sfx?0.9:0,t,0.05);SND.musG.gain.setTargetAtTime(PREF.music?0.4:0,t,0.4);}
function tone(f,d,o={}){const c=SND.ctx;if(!c)return;const t=c.currentTime+(o.at||0),osc=c.createOscillator(),g=c.createGain();
  osc.type=o.type||'sine';osc.frequency.setValueAtTime(f,t);if(o.to)osc.frequency.exponentialRampToValueAtTime(o.to,t+d);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(o.v||0.12,t+(o.att||0.01));g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  osc.connect(g);g.connect(o.dest||SND.sfxG);osc.start(t);osc.stop(t+d+0.05);}
const SFX={
  click:()=>tone(1500,0.035,{type:'triangle',v:0.035}),
  good:()=>{tone(660,0.18,{type:'triangle',v:0.1});tone(880,0.3,{type:'triangle',v:0.09,at:0.09});},
  bad:()=>{tone(330,0.25,{type:'sawtooth',v:0.04,to:220});tone(247,0.35,{type:'triangle',v:0.08,at:0.12,to:196});},
  cash:()=>{tone(1318,0.1,{type:'square',v:0.035});tone(1760,0.35,{type:'triangle',v:0.08,at:0.07});tone(2637,0.25,{type:'sine',v:0.04,at:0.14});},
  launch:()=>{[523,659,784,1047].forEach((f,i)=>tone(f,0.32,{type:'triangle',v:0.09,at:i*0.08}));},
  ach:()=>{[784,988,1175,1568].forEach((f,i)=>tone(f,0.35,{type:'triangle',v:0.08,at:i*0.1}));tone(392,0.7,{type:'sine',v:0.07,at:0.3});},
  alarm:()=>{for(let i=0;i<3;i++){tone(880,0.12,{type:'square',v:0.035,at:i*0.26});tone(660,0.12,{type:'square',v:0.035,at:i*0.26+0.13});}},
  res:()=>{[1047,1319,1568,2093].forEach((f,i)=>tone(f,0.2,{type:'sine',v:0.055,at:i*0.05}));},
};
const sfxLast={};
function sfx(k){if(!SND.ctx||PREF.mute||!PREF.sfx||!SFX[k])return;const now=performance.now();if(now-(sfxLast[k]||0)<(k==='click'?40:350))return;sfxLast[k]=now;
  if(k!=='click'&&k!=='good'&&k!=='bad')sfxLast.good=sfxLast.bad=now;
  try{if(SND.ctx.state==='suspended')SND.ctx.resume();SFX[k]();}catch(e){}}
/* müzik: tarayıcıda üretilen yumuşak akorlar; gece daha alçak ve seyrek */
const MUS_DAY=[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,65]],MUS_NIGHT=[[45,48,52,55],[50,53,57,60],[45,48,52,55],[52,55,59,62]];
const mtof=m=>440*Math.pow(2,(m-69)/12);
function pad(f,d){const c=SND.ctx,t=c.currentTime,g=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.03,t+d*0.4);g.gain.linearRampToValueAtTime(0.0001,t+d*1.05);
  for(const det of [-7,7]){const o=c.createOscillator();o.type='triangle';o.frequency.value=f;o.detune.value=det;o.connect(lp);o.start(t);o.stop(t+d*1.1);}lp.connect(g);g.connect(SND.musG);}
function musicBar(){const night=DN.dl<0.4,ch=(night?MUS_NIGHT:MUS_DAY)[SND.bar%4],bar=night?5:4;SND.bar++;
  for(const m of ch.slice(0,3))pad(mtof(m-12),bar);
  tone(mtof(ch[0]-24),bar*0.9,{type:'triangle',v:0.06,dest:SND.musG,att:0.3});
  for(let i=0;i<8;i++)if(Math.random()<(night?0.25:0.45)){const m=ch[Math.floor(Math.random()*4)]+(Math.random()<0.4?12:0);tone(mtof(m),0.7,{type:'sine',v:0.04,at:i*bar/8,dest:SND.musG,att:0.02});}
  return bar*1000;}
setInterval(()=>{if(!SND.ctx||!PREF.music||PREF.mute||document.visibilityState!=='visible'||SND.ctx.state!=='running')return;const now=performance.now();if(now>=SND.next)SND.next=now+musicBar()-60;},250);
['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,()=>{if(sndInit()&&SND.ctx.state==='suspended')SND.ctx.resume();},true));
const SND_ICON={on:'<svg viewBox="0 0 20 18" aria-hidden="true"><path d="M3 7h3l4-4v12l-4-4H3z"/><path d="M13 6a4 4 0 0 1 0 6M15.5 3.5a7.5 7.5 0 0 1 0 11"/></svg>',off:'<svg viewBox="0 0 20 18" aria-hidden="true"><path d="M3 7h3l4-4v12l-4-4H3z"/><path d="M13 6.5l5 5M18 6.5l-5 5"/></svg>'};
function sndBtnUpdate(){const b=$('#sndBtn');if(!b)return;const on=!PREF.mute&&(PREF.sfx||PREF.music),k=on?'on':'off';if(b.dataset.k!==k){b.dataset.k=k;b.innerHTML=SND_ICON[k];b.setAttribute('aria-pressed',String(on));b.title=on?(LANG_EN?"Mute":'Sesi kapat'):(LANG_EN?"Unmute":'Sesi aç');}}

