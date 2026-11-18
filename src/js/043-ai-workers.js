/* ============================== AI WORKERS ============================== */
const newAiw=()=>({n:{},guard:false,up:false,log:[],inc:0,peak:0});
const AIW_R={soft:{n:(LANG_EN?"Coding agent":'Kod ajanı'),req:'ml',d:(LANG_EN?"Writes code on software projects":'Yazılım projelerinde kod yazar')},design:{n:(LANG_EN?"Design agent":'Tasarım ajanı'),req:'llm',d:(LANG_EN?"Produces UI and visual drafts":'Arayüz ve görsel taslak üretir')},res:{n:(LANG_EN?"Research agent":'Araştırma ajanı'),req:'ml',d:(LANG_EN?"Scans literature, runs experiments; produces research points":'Literatür tarar, deney kurar; araştırma puanı üretir')},mkt:{n:(LANG_EN?"Marketing agent":'Pazarlama ajanı'),req:'llm',d:(LANG_EN?"Creates content and campaigns; grows the brand":'İçerik ve kampanya üretir; markayı büyütür')}};
const AIW_PER=2,AIW_EFF=0.5;
const aiwOn=()=>has('ml');
function aiwSk(){return Math.min(4.8,1.2+years()*0.18+(has('llm')?0.6:0)+(G.lab&&G.lab.best?clamp(G.lab.best.c/labFrontier(),0,1)*0.6:0));}
function aiwCost1(){return 4000*Math.pow(0.8,years())*(has('llm')?0.8:1)*(has('ai')?0.85:1)*(G.aiw&&G.aiw.guard?1.25:1)*(G.mods&&G.mods.aiw||1)*infl();}
const aiwN=t=>G.aiw&&G.aiw.n[t]||0;
const aiwTot=()=>Object.keys(AIW_R).reduce((a,t)=>a+aiwN(t),0);
const aiwHum=t=>G.emps.filter(e=>e.role===t&&!e.leave);
function aiwEff(t){return Math.min(aiwN(t),aiwHum(t).length*AIW_PER);}
function aiwM(t){const A=G.aiw;if(!A||!aiwN(t))return 1;const c=A._c;if(c&&c.d===G.day&&c[t]!=null)return c[t];
  const H=aiwHum(t),sk=H.reduce((a,e)=>a+e.skill,0),m=sk>0?1+aiwEff(t)*aiwSk()*AIW_EFF/sk:1;if(!c||c.d!==G.day)A._c={d:G.day};A._c[t]=m;return m;}
const aiwBug=()=>G.aiw&&G.aiw.guard?1.06:1.25;
function aiwQ(pr,e,add,t){const m=aiwM(t);if(m<=1)return;const f=1-1/m;pr.sk+=f*add*(aiwSk()-e.skill)*0.4;pr.bq=(pr.bq||0)+f*add*(aiwBug()-1);}
const aiwRP=()=>aiwOn()?aiwEff('res')*aiwSk()*AIW_EFF:0;
const aiwMK=()=>aiwOn()?aiwEff('mkt')*aiwSk()*AIW_EFF:0;
const aiwBill=()=>aiwTot()*aiwCost1()+(G.aiw&&G.aiw.up?G.emps.length*300*infl():0);
function aiwLog(t,k=''){const A=G.aiw;A.log.unshift({d:G.day,t,k});if(A.log.length>12)A.log.pop();}
function aiwMonthly(){const A=G.aiw;if(!A||!aiwOn())return;const tot=aiwTot();if(!tot&&!A.up)return;
  spend(aiwBill(),'infra');A.peak=Math.max(A.peak,tot);
  /* insan ekip tepkisi */
  for(const t in AIW_R){const H=aiwHum(t);if(!H.length)continue;const r=aiwN(t)/H.length;
    if(A.up){for(const e of H){e.morale=clamp(e.morale+0.5,0,100);e.xp=(e.xp||0)+2;}}
    else if(r>1)for(const e of H)e.morale=clamp(e.morale-Math.min(4,(r-1)*1.5),0,100);}
  if(G.union&&!A.up&&tot>G.emps.length)G.union.press=Math.min(100,(G.union.press||0)+2);
  /* olaylar */
  if(tot&&Math.random()<Math.min(0.35,0.02*Math.sqrt(tot))*(A.guard?0.4:1)){A.inc++;let r=Math.random()*tot,t='soft';for(const k in AIW_R){r-=aiwN(k);if(r<0){t=k;break;}}
    if(t==='mkt'){G.brand=clamp(G.brand-1,0,100);if(G.soc)G.soc.s=clamp(G.soc.s-12,-100,100);aiwLog((LANG_EN?"The marketing agent shared a made-up statistic and became a laughingstock on social media. Brand −1.":'Pazarlama ajanı uydurma bir istatistik paylaştı; sosyal medyada alay konusu oldu. Marka −1.'),'bad');}
    else if(t==='soft'){const p=pick(myActive().filter(x=>SW_CATS.includes(x.cat)));if(p){p.bugs=(p.bugs||0)+3;aiwLog((LANG_EN?`A vulnerability written by the coding agent caused bugs in ${p.name}.`:`Kod ajanının yazdığı bir açık ${p.name} ürününde hataya yol açtı.`),'bad');}else aiwLog((LANG_EN?"The coding agent broke the test environment; a day of work lost.":'Kod ajanı test ortamını bozdu; bir günlük iş kaybı.'),'bad');}
    else if(t==='res'){if(G.res.active){G.res.active.p*=0.9;aiwLog((LANG_EN?"The research agent relied on papers that don't exist; research fell back 10%.":'Araştırma ajanı var olmayan makalelere dayandı; araştırma %10 geriledi.'),'bad');}}
    else aiwLog((LANG_EN?"The design agent produced a draft far too similar to another brand's logo; it had to be redone.":'Tasarım ajanı başka bir markanın logosuna fazlasıyla benzeyen bir taslak üretti; yeniden yapıldı.'),'bad');
    if(A.inc===1)news((LANG_EN?"First AI agent incident: consider enabling the oversight layer under Team → AI agents.":'İlk yapay zekâ ajanı kazası: Ekip → Yapay zekâ ajanları bölümünden denetim katmanını açmayı düşün.'),'bad',true);}}
function vAiw(){const A=G.aiw;
  if(!aiwOn())return (LANG_EN?`<section class="panel"><div class="ph"><h2>AI agents${helpBtn('aiw')}</h2></div><div class="pb"><p class="small muted">Once you complete Machine Learning research, you can add AI agents to your team. Agents draw no salary, but they run up a compute bill, need human supervision, and can make mistakes.</p><button class="btn sm" data-act="tab" data-tab="res:arastirma">Go to Research</button></div></section>`:`<section class="panel"><div class="ph"><h2>Yapay zekâ ajanları${helpBtn('aiw')}</h2></div><div class="pb"><p class="small muted">Makine Öğrenmesi araştırmasını tamamladığında ekibine yapay zekâ ajanları ekleyebilirsin. Ajanlar maaş almaz ama işlem gücü faturası çıkarır, insan gözetimine ihtiyaç duyar ve hata yapabilir.</p><button class="btn sm" data-act="tab" data-tab="res:arastirma">Araştırmaya git</button></div></section>`);
  const sk=aiwSk(),c1=aiwCost1();
  const cards=Object.entries(AIW_R).map(([t,R])=>{const H=aiwHum(t),n=aiwN(t),eff=aiwEff(t),lock=!has(R.req),m=aiwM(t),cap=H.length*AIW_PER;
    return (LANG_EN?`<div class="proj aiw-card"><div class="row between" style="gap:8px"><b>${R.n}</b><span class="chip ${lock?'st-mute':n?'st-ok':'st-mute'}">${lock?RESD[R.req].n+" required":n?n+" agents":"No"}</span></div><div class="small muted">${R.d}. Supervisors (${ROLES[t].n.toLocaleLowerCase(LOC)}): ${H.length}</div>
      <div class="row" style="gap:8px;align-items:center"><span class="small muted" style="min-width:64px">Working</span><div class="bar" style="flex:1"><i style="width:${cap?Math.min(100,eff/cap*100):0}%;background:var(--accent)"></i></div><span class="small num">${eff}/${cap}</span></div>
      ${n>eff?`<div class="small neg">${n-eff} agents are idle without a supervisor; you're paying for them but they produce nothing.</div>`:''}
      <div class="small">${t==='res'||t==='mkt'?`Output: <b>${fx(eff*sk*AIW_EFF,1)}</b> ${t==='res'?"research points":"marketing power"} per day`:`Team productivity <b>+${Math.round((m-1)*100)}%</b>`}</div>
      <div class="row" style="gap:6px"><button class="btn sm" data-act="aiwadd" data-k="${t}" data-n="1" ${lock?'disabled':''}>+1</button><button class="btn sm" data-act="aiwadd" data-k="${t}" data-n="5" ${lock?'disabled':''}>+5</button><button class="btn sm ghost" data-act="aiwadd" data-k="${t}" data-n="-1" ${n?'':'disabled'}>−1</button><button class="btn sm ghost" data-act="aiwadd" data-k="${t}" data-n="-99" ${n?'':'disabled'}>Shut all down</button></div></div>`:`<div class="proj aiw-card"><div class="row between" style="gap:8px"><b>${R.n}</b><span class="chip ${lock?'st-mute':n?'st-ok':'st-mute'}">${lock?RESD[R.req].n+' gerekli':n?n+' ajan':'Yok'}</span></div><div class="small muted">${R.d}. Gözetmen: ${H.length} ${ROLES[t].n.toLocaleLowerCase(LOC)}</div>
      <div class="row" style="gap:8px;align-items:center"><span class="small muted" style="min-width:64px">Çalışan</span><div class="bar" style="flex:1"><i style="width:${cap?Math.min(100,eff/cap*100):0}%;background:var(--accent)"></i></div><span class="small num">${eff}/${cap}</span></div>
      ${n>eff?`<div class="small neg">${n-eff} ajan gözetmensiz bekliyor; ücret ödüyorsun ama iş üretmiyor.</div>`:''}
      <div class="small">${t==='res'||t==='mkt'?`Katkı: günde <b>${fx(eff*sk*AIW_EFF,1)}</b> ${t==='res'?'araştırma puanı':'pazarlama gücü'}`:`Ekip verimi <b>+%${Math.round((m-1)*100)}</b>`}</div>
      <div class="row" style="gap:6px"><button class="btn sm" data-act="aiwadd" data-k="${t}" data-n="1" ${lock?'disabled':''}>+1</button><button class="btn sm" data-act="aiwadd" data-k="${t}" data-n="5" ${lock?'disabled':''}>+5</button><button class="btn sm ghost" data-act="aiwadd" data-k="${t}" data-n="-1" ${n?'':'disabled'}>−1</button><button class="btn sm ghost" data-act="aiwadd" data-k="${t}" data-n="-99" ${n?'':'disabled'}>Hepsini kapat</button></div></div>`);}).join('');
  const log=A.log.map(l=>`<li><span class="small muted num" style="min-width:86px">${fmtDate(l.d)}</span><span class="${l.k==='bad'?'neg':''}">${esc(l.t)}</span></li>`).join('');
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>AI agents${helpBtn('aiw')}</h2><span class="sub">Each human can supervise up to ${AIW_PER} agents</span></div>
    <div class="kpis" style="border-top:0"><div class="kpi"><span>Agents</span><b>${aiwTot()}</b></div><div class="kpi"><span>Agent skill</span><b>${fx(sk,1)}</b></div><div class="kpi"><span>Per agent</span><b>${money(c1)}/mo</b></div><div class="kpi"><span>Monthly bill</span><b>${money(aiwBill())}</b></div><div class="kpi"><span>Incidents</span><b class="${A.inc?'warn':''}">${A.inc}</b></div></div>
    <div class="pb col"><div class="grid">${cards}</div>
      <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm ${A.guard?'primary':''}" data-act="aiwguard" aria-pressed="${A.guard}">Oversight layer: ${A.guard?"On":"Off"}</button><span class="small muted">Cost +25%; incident risk drops 60%, and the agents' bug rate falls to nearly human level.</span></div>
      <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm ${A.up?'primary':''}" data-act="aiwup" aria-pressed="${A.up}">Reskilling program: ${A.up?"On":"Off"}</button><span class="small muted">${money(300*infl())}/mo per employee. People learn to work with agents: the fear of losing their jobs fades, and morale and experience rise.</span></div>
      <p class="small muted">Agent skill grows over the years, with Large Language Models research and with your own AI lab's model; its cost falls every year. If you have more agents than people, the team fears for its jobs: morale drops and union pressure rises.</p></div></section>
    ${log?`<section class="panel"><div class="ph"><h2>Agent log</h2></div><div class="pb"><ul class="alerts">${log}</ul></div></section>`:''}`:`<section class="panel"><div class="ph"><h2>Yapay zekâ ajanları${helpBtn('aiw')}</h2><span class="sub">Her insan en fazla ${AIW_PER} ajanı yönetebilir</span></div>
    <div class="kpis" style="border-top:0"><div class="kpi"><span>Ajan</span><b>${aiwTot()}</b></div><div class="kpi"><span>Ajan yeteneği</span><b>${fx(sk,1)}</b></div><div class="kpi"><span>Ajan başına</span><b>${money(c1)}/ay</b></div><div class="kpi"><span>Aylık fatura</span><b>${money(aiwBill())}</b></div><div class="kpi"><span>Kaza</span><b class="${A.inc?'warn':''}">${A.inc}</b></div></div>
    <div class="pb col"><div class="grid">${cards}</div>
      <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm ${A.guard?'primary':''}" data-act="aiwguard" aria-pressed="${A.guard}">Denetim katmanı: ${A.guard?'Açık':'Kapalı'}</button><span class="small muted">Ücret +%25; kaza riski %60 azalır, ajanların ürettiği hata oranı neredeyse insan seviyesine iner.</span></div>
      <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm ${A.up?'primary':''}" data-act="aiwup" aria-pressed="${A.up}">Yeniden beceri programı: ${A.up?'Açık':'Kapalı'}</button><span class="small muted">Çalışan başına ${money(300*infl())}/ay. İnsanlar ajanlarla çalışmayı öğrenir: işini kaybetme korkusu kalkar, moral ve deneyim artar.</span></div>
      <p class="small muted">Ajan yeteneği yıllar geçtikçe, Büyük Dil Modelleri araştırmasıyla ve kendi yapay zekâ laboratuvarının modeliyle artar; maliyeti her yıl düşer. Ajanı insan sayısından fazla tutarsan ekip işini kaybetmekten korkar: moral düşer, sendika baskısı artar.</p></div></section>
    ${log?`<section class="panel"><div class="ph"><h2>Ajan günlüğü</h2></div><div class="pb"><ul class="alerts">${log}</ul></div></section>`:''}`);}

