/* ============================== WEEKLY CHALLENGE ============================== */
/* her takvim haftası herkese aynı başlangıç ve aynı tohumlu rastgelelik; 3 oyun yılı sonunda değerleme skor olur */
function isoWeek(d=new Date()){const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-day);const y=t.getUTCFullYear();const w=Math.ceil(((t-Date.UTC(y,0,1))/864e5+1)/7);return `${y}-H${String(w).padStart(2,'0')}`;}
function strHash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function mulberry(a){return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
const RNG0=Math.random;
const chalOn=()=>!!(G&&G.chal&&!G.chal.done);
function rngSeed(k){Math.random=mulberry(strHash(G.chal.id+'|'+k));}
function rngFree(){Math.random=RNG0;}
/* Ortak rastgele sayılar (yalnızca bot ölçümünde, window.SG_CRN bir tohumken; meydan okuma modunu etkilemez): her gün ve günün bağımsız
   bölümleri (rakipler, pazar, sistemler, çalışanlar, kariyer, ay sonu, rakip ayı, olaylar) kendi akışından tohumlanır. Böylece bir kolda
   fazladan bir hamle diğer bölümlerin rastgele sayılarını kaydırmaz; karşılaştırmalı ölçümde kollar yalnızca kararların etkisiyle ayrışır. */
const crnOn=()=>typeof window!=='undefined'&&window.SG_CRN!=null&&!chalOn();
function crnSeed(k){Math.random=mulberry(strHash('crn'+window.SG_CRN+'|'+G.day+'|'+k));}
const crn=k=>{if(crnOn())crnSeed(k);};
const CH_TW={
  chip:{n:(LANG_EN?"Chip shortage":'Çip kıtlığı'),d:(LANG_EN?"Silicon wafer and memory prices are 50% higher in the first year.":'İlk yıl silikon levha ve bellek fiyatları %50 yüksek.'),fx(){G.pxEvt.wafer={m:1.5,until:365};G.pxEvt.memory={m:1.5,until:365};}},
  rush:{n:(LANG_EN?"Gold rush":'Altına hücum'),d:(LANG_EN?"Demand is 15% higher in all markets.":'Bütün pazarlarda talep %15 fazla.'),fx(){G.mods.dem=(G.mods.dem||1)*1.15;}},
  shark:{n:(LANG_EN?"Sharks":'Köpekbalıkları'),d:(LANG_EN?"Rivals are much more aggressive.":'Rakipler çok daha saldırgan.'),fx(){for(const c of G.comps)c.aggr=Math.min(0.95,c.aggr+0.25);G.mods.aggr=(G.mods.aggr||0)+0.25;}},
  brand:{n:(LANG_EN?"Famous founder":'Tanınmış kurucu'),d:(LANG_EN?"Your brand starts at 15 points.":'Markan 15 puanla başlar.'),fx(){G.brand=15;}},
  cheap:{n:(LANG_EN?"Cheap parts":'Ucuz parça'),d:(LANG_EN?"Component prices are 15% lower.":'Parça fiyatları %15 düşük.'),fx(){for(const c in G.px)G.px[c]*=0.85;G.mods.px=(G.mods.px||1)*0.85;}},
  storm:{n:(LANG_EN?"Stormy years":'Fırtınalı yıllar'),d:(LANG_EN?"Crises and events are more frequent.":'Krizler ve olaylar daha sık.'),fx(){G.mods.ev=Math.min(0.9,(G.mods.ev||0.42)*1.5);}},
  lean:{n:(LANG_EN?"Scarce resources":'Kıt kaynak'),d:(LANG_EN?"Your starting cash is halved, but rivals are slower too.":'Başlangıç nakdin yarıya iner ama rakipler de daha yavaş.'),fx(){G.cash=Math.round(G.cash*0.5);G.mods.tech=(G.mods.tech||1)*0.95;}},
  privacy:{from:'2026-H44',n:(LANG_EN?"Privacy era":'Gizlilik çağı'),d:(LANG_EN?"User trust starts at 70, but the risk of a data scandal doubles.":'Kullanıcı güveni 70 ile başlar ama veri skandalı riski iki katına çıkar.'),fx(){G.dp.trust=70;G.mods.dpRisk=2;}},
  retail:{from:'2026-H44',n:(LANG_EN?"Retail boom":'Perakende patlaması'),d:(LANG_EN?"Store setup and rent are 40% cheaper.":'Mağaza kurulumu ve kirası %40 ucuz.'),fx(){G.mods.shop=0.6;}},
  expo:{from:'2026-H44',n:(LANG_EN?"Trade show year":'Fuar yılı'),d:(LANG_EN?"Trade show fees are half price, and award chances are 50% higher.":'Fuar katılım ücretleri yarı fiyatına, ödül şansı %50 fazla.'),fx(){G.mods.fair=0.5;G.mods.fairAw=1.5;}},
  agents:{from:'2026-H44',n:(LANG_EN?"AI era":'Yapay zekâ çağı'),d:(LANG_EN?"Machine learning is ready from the start, and AI agents are 40% cheaper.":'Makine öğrenmesi baştan hazır, yapay zekâ ajanları %40 ucuz.'),fx(){for(const r of resClosure(['ml']))G.res.done[r]=0;G.mods.aiw=0.6;}},
};
const CH_STARTS=[{n:(LANG_EN?"Garage":'Garaj'),cash:150000,office:0},{n:(LANG_EN?"Angel-backed garage":'Melek yatırımlı garaj'),cash:450000,office:0},{n:(LANG_EN?"Small office":'Küçük ofis'),cash:900000,office:1}];
const CH_HEAD=[null,'fw','mobile','cloud','chip'];
function chalDef(id){const r=mulberry(strHash(id+'|def')),pk=a=>a[Math.floor(r()*a.length)];
  const keys=Object.keys(CH_TW).filter(k=>!CH_TW[k].from||id>=CH_TW[k].from);for(let i=keys.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[keys[i],keys[j]]=[keys[j],keys[i]];}
  return {id,st:pk(CH_STARTS),head:pk(CH_HEAD),tw:keys.slice(0,2),days:3*365};}
const CH_KEY='silikon-garaj-wk';
function chalBest(){try{return JSON.parse(localStorage.getItem(CH_KEY)||'{}')||{};}catch(e){return {};}}
function chalLeft(){const n=new Date(),d=(8-(n.getDay()||7))%7||7,end=new Date(n.getFullYear(),n.getMonth(),n.getDate()+d);const h=Math.max(0,Math.round((end-n)/36e5));return h>=48?(LANG_EN?`${Math.floor(h/24)} days`:`${Math.floor(h/24)} gün`):(LANG_EN?`${h} hours`:`${h} saat`);}
function chalDesc(W){return (LANG_EN?`<b>Start:</b> ${W.st.n} (${money(W.st.cash)})${W.head?` · <b>Pre-completed research:</b> ${RESD[W.head].n}`:''}<br>${W.tw.map(k=>`<b>${CH_TW[k].n}:</b> ${CH_TW[k].d}`).join('<br>')}`:`<b>Başlangıç:</b> ${W.st.n} (${money(W.st.cash)})${W.head?` · <b>Hazır araştırma:</b> ${RESD[W.head].n}`:''}<br>${W.tw.map(k=>`<b>${CH_TW[k].n}:</b> ${CH_TW[k].d}`).join('<br>')}`);}
function chalStart(id){
  const W=chalDef(id||isoWeek()),duel=isDuel(W.id);Math.random=mulberry(strHash(W.id+'|setup'));
  try{newGame('free');applyDiff(DIFFS.normal);G.cash=W.st.cash;G.office=W.st.office;if(W.head)G.res.done[W.head]=0;for(const k of W.tw)CH_TW[k].fx();
    G.chal={id:W.id,end:W.days,done:false,score:null,tw:W.tw,st:W.st.n,head:W.head};G.tut={on:false,step:0,seen:{}};G.news=[];market();}
  finally{rngFree();}
  if(duel){news((LANG_EN?`Friend challenge (${W.id.slice(2)}) started! After 3 years your valuation will be your score, compared side by side with everyone playing the same code.`:`Arkadaş meydan okuması (${W.id.slice(2)}) başladı! 3 yıl sonunda değerlemen skorun olacak; aynı kodu oynayanlarla yan yana karşılaştırılır.`),'good',true);tl('star',(LANG_EN?`Friend challenge ${W.id.slice(2)} started`:`Arkadaş meydan okuması ${W.id.slice(2)} başladı`));}
  else{news((LANG_EN?`Weekly challenge (${W.id}) started! After 3 years your valuation will be your score.`:`Haftanın meydan okuması (${W.id}) başladı! 3 yıl sonunda değerlemen skorun olacak.`),'good',true);tl('star',(LANG_EN?`Weekly challenge ${W.id} started`:`Haftanın meydan okuması ${W.id} başladı`));}
}
function chalCheck(){
  if(!chalOn()||G.day<G.chal.end)return;const C=G.chal,v=valuation();C.done=true;C.score=v;C.s=dsSnap();
  const b=chalBest();if(!b[C.id]||v>b[C.id].v){b[C.id]={v,co:G.name,s:C.s};try{localStorage.setItem(CH_KEY,JSON.stringify(b));}catch(e){}}
  lbOffer('wk_'+C.id,{v,co:G.name.slice(0,28),day:G.day,diff:(LANG_EN?"Normal":'Normal'),s:C.s},(a,x)=>a.v>x.v);
  const dn=isDuel(C.id)?(LANG_EN?`Friend challenge ${C.id.slice(2)}`:`Arkadaş meydan okuması ${C.id.slice(2)}`):(LANG_EN?"Weekly challenge":'Haftanın meydan okuması');if(isDuel(C.id))(G.flags=G.flags||{}).duel=1;
  tl('star',(LANG_EN?`${dn} finished: ${money(v)}`:`${dn} bitti: ${money(v)}`));sfx('ach');news((LANG_EN?`${dn} finished! Your score: ${money(v)}. You can keep going in free play.`:`${dn} bitti! Skorun: ${money(v)}. Serbest oyunda devam edebilirsin.`),'good',true);
  G.prevSpeed=G.speed||1;G.speed=0;openModal('chalend');
}
const DUEL_A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const duelNew=()=>{let s='';for(let i=0;i<6;i++)s+=DUEL_A[Math.floor(RNG0()*DUEL_A.length)];return s;};
const duelOk=c=>/^[A-HJ-NP-Z2-9]{6}$/.test(c||'');
const isDuel=id=>String(id||'').startsWith('D-');
const duelInvite=c=>(LANG_EN?`I challenge you in Silicon Garage! Enter code ${c} under History → Leaderboard → "Challenge a friend". Same start, same events: who can build the more valuable company in 3 years?`:`Silikon Garaj'da sana meydan okuyorum! Tarihçe → Liderlik tablosu → "Arkadaşına meydan oku" bölümüne ${c} kodunu gir. Aynı başlangıç, aynı olaylar: 3 yılda kim daha değerli bir şirket kuracak?`);
function duelBoardHTML(c){const id='D-'+c,rows=chalBoard(id),loc=chalBest()[id],nm=r=>(LB.names[r.id]||(LANG_EN?"Gamer":'Oyuncu'))+(r.id===LB.uid?(LANG_EN?" (you)":' (sen)'):'');
  const L=rows.length?rows:(loc?[{id:LB.uid||'me',v:loc.v,co:loc.co,s:loc.s}]:[]);if(!L.length)return (LANG_EN?"<div class=\"empty\">No one has finished 3 years with this code yet.</div>":'<div class="empty">Bu kodla henüz kimse 3 yılı bitirmedi.</div>');
  const mx=Math.max(...L.map(r=>Math.max(0,r.v)),1);
  return `<div class="col" style="gap:6px">${L.slice(0,12).map((r,i)=>`<div class="hbar duel-r ${r.id===LB.uid||r.id==='me'?'me':''}" title="${esc(r.co||'')}: ${money(r.v)}"><span class="small duel-n"><b>${i+1}. ${r.id==='me'?(LANG_EN?"You":'Sen'):esc(nm(r))}</b><span class="muted">${esc(r.co||'')}</span></span><span class="tr"><i style="width:${Math.max(1,Math.max(0,r.v)/mx*100)}%;background:${r.id===LB.uid||r.id==='me'?'var(--ch1)':'var(--chn)'}"></i></span><b class="num small">${money(r.v)}</b></div>`).join('')}</div>${dsTable(L)}${LB.st!=='on'?(LANG_EN?"<p class=\"small muted\">Other players' scores are only visible while signed in to claude.ai.</p>":'<p class="small muted">Diğer oyuncuların skorları yalnızca claude.ai\'de oturum açıkken görünür.</p>'):''}`;}
function vDuelCard(){const c=UI.duelC||'',B=chalBest(),mine=Object.keys(B).filter(isDuel).slice(-6).reverse();
  return (LANG_EN?`<div class="scn duel"><div class="row between"><h3>Challenge a friend${helpBtn('duel')}</h3><span class="chip st-mute">3 years</span></div>
    <div class="small">Create a code and send it to a friend. Everyone playing the same code competes with the same start, the same world conditions and the same events; after 3 game years, valuations and company profiles (cities, stores, factories, mines, real estate) are shown side by side.</div>
    <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm" data-act="duelnew">New code</button><input type="text" id="duelIn" maxlength="6" placeholder="CODE" value="${esc(c)}" aria-label="Challenge code" autocomplete="off" spellcheck="false" class="duel-in"><button class="btn sm primary" data-act="duelgo">Play this code</button></div>
    ${duelOk(c)?`<div class="small muted">${chalDesc(chalDef('D-'+c))}</div><div class="row" style="gap:6px;flex-wrap:wrap"><span class="small">Invite code <b class="num duel-code">${c}</b></span><button class="btn sm ghost" data-act="duelcopy">Copy invite text</button><button class="btn sm ghost" data-act="duelview" data-k="${c}">Scores</button></div>`:''}
    ${mine.length?`<div class="small">You've played: ${mine.map(id=>`<button class="btn sm ghost" data-act="duelview" data-k="${id.slice(2)}">${id.slice(2)} · ${money(B[id].v)}</button>`).join(' ')}</div>`:''}</div>`:`<div class="scn duel"><div class="row between"><h3>Arkadaşına meydan oku${helpBtn('duel')}</h3><span class="chip st-mute">3 yıl</span></div>
    <div class="small">Bir kod oluştur ve arkadaşına gönder. Aynı kodu oynayan herkes aynı başlangıç, aynı dünya koşulları ve aynı olaylarla yarışır; 3 oyun yılı sonunda değerlemeler ve şirket profilleri (şehirler, mağazalar, fabrikalar, madenler, gayrimenkul) yan yana çıkar.</div>
    <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm" data-act="duelnew">Yeni kod</button><input type="text" id="duelIn" maxlength="6" placeholder="KOD" value="${esc(c)}" aria-label="Meydan okuma kodu" autocomplete="off" spellcheck="false" class="duel-in"><button class="btn sm primary" data-act="duelgo">Bu kodu oyna</button></div>
    ${duelOk(c)?`<div class="small muted">${chalDesc(chalDef('D-'+c))}</div><div class="row" style="gap:6px;flex-wrap:wrap"><span class="small">Davet kodu <b class="num duel-code">${c}</b></span><button class="btn sm ghost" data-act="duelcopy">Davet metnini kopyala</button><button class="btn sm ghost" data-act="duelview" data-k="${c}">Skorlar</button></div>`:''}
    ${mine.length?`<div class="small">Oynadıkların: ${mine.map(id=>`<button class="btn sm ghost" data-act="duelview" data-k="${id.slice(2)}">${id.slice(2)} · ${money(B[id].v)}</button>`).join(' ')}</div>`:''}</div>`);}
function chalBoard(id){return LB.rows.filter(r=>r.d.best&&r.d.best['wk_'+id]).map(r=>({id:r.id,...r.d.best['wk_'+id]})).sort((a,b)=>b.v-a.v);}
function vChalCard(){const W=chalDef(isoWeek()),b=chalBest()[W.id];
  return (LANG_EN?`<div class="scn" style="border-color:var(--accent);border-width:2px"><div class="row between"><h3>Weekly challenge</h3><span class="chip st-warn">${W.id}</span></div>
    <div class="small">This week everyone plays with the same start and the same events. After 3 game years your valuation becomes your score and goes on the weekly leaderboard.</div>
    <div class="small muted">${chalDesc(W)}</div>
    <div class="small">${b?`Your best this week: <b>${money(b.v)}</b> · `:''}Resets in ${chalLeft()}</div>
    <button class="btn sm primary" data-act="chalstart">Start challenge</button></div>`:`<div class="scn" style="border-color:var(--accent);border-width:2px"><div class="row between"><h3>Haftanın meydan okuması</h3><span class="chip st-warn">${W.id}</span></div>
    <div class="small">Bu hafta herkes aynı başlangıçla ve aynı olaylarla oynar. 3 oyun yılı sonunda değerlemen skorun olur ve haftalık tabloya girer.</div>
    <div class="small muted">${chalDesc(W)}</div>
    <div class="small">${b?`Bu haftaki en iyin: <b>${money(b.v)}</b> · `:''}Yenilenmesine ${chalLeft()}</div>
    <button class="btn sm primary" data-act="chalstart">Meydan okumaya başla</button></div>`);}

