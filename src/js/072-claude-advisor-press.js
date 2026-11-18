/* ============================== CLAUDE: ADVISOR & PRESS ============================== */
/* Oyuncunun kendi Claude hesabıyla: şirket verisiyle sohbet eden danışman, ürün inceleme yazıları ve aylık gazete.
   Yetenek yoksa ya da izin verilmezse bu özellikler sessizce gizlenir; oyun aynen çalışır. */
const AI={fn:null,st:'init',busy:null,ctl:null,chat:[],live:'',err:null};
const aiOn=()=>!!AI.fn&&AI.st==='on';
function aiInit(){try{if(!window.claude||typeof window.claude.use!=='function'){AI.st='off';return;}Promise.resolve(window.claude.use('sample')).then(f=>{AI.fn=f||null;AI.st=f?'on':'off';UI.force=true;}).catch(()=>{AI.st='off';});}catch(e){AI.st='off';}}
const AI_ERR={not_granted:(LANG_EN?"Claude access wasn't granted; this feature is off for this session.":'Claude kullanımına izin verilmedi; bu özellik bu oturumda kapalı.'),sampling_disabled:(LANG_EN?"Claude isn't available on this account.":'Claude bu hesapta kullanılamıyor.'),not_declared:(LANG_EN?"Claude is turned off in this version.":'Bu sürümde Claude kapalı.'),capability_disabled:(LANG_EN?"Claude isn't available in this view.":'Claude bu görünümde kullanılamıyor.'),capability_removed:(LANG_EN?"Claude isn't available in this view.":'Claude bu görünümde kullanılamıyor.'),
  rate_limited:(LANG_EN?"Claude is very busy right now, or you've hit your usage limit. Try again in a bit.":'Claude şu an çok yoğun ya da kullanım sınırına ulaştın. Biraz sonra yeniden dene.'),session_expired:(LANG_EN?"Your session has expired; you need to sign in again.":'Oturumun sona ermiş; yeniden giriş yapman gerekiyor.'),refused:(LANG_EN?"Claude didn't answer this request; try asking differently.":'Claude bu isteği yanıtlamadı; soruyu farklı sor.'),empty_completion:(LANG_EN?"The response was empty; shorten your question and try again.":'Yanıt boş geldi; soruyu kısaltıp yeniden dene.'),
  invalid_json:(LANG_EN?"The response wasn't in the expected format; try again.":'Yanıt beklenen biçimde gelmedi; yeniden dene.'),prompt_too_large:(LANG_EN?"The request was too long.":'İstek çok uzun oldu.'),upstream_error:(LANG_EN?"There was a connection problem; try again.":'Bağlantı sorunu oldu; yeniden dene.')};
const aiErrTxt=e=>AI_ERR[e&&e.code]||AI_ERR.upstream_error;
function aiFail(e){if(e&&['not_granted','sampling_disabled','not_declared','capability_disabled','capability_removed'].includes(e.code)){AI.st='off';}return aiErrTxt(e);}
// ---- company snapshot (compact, plain text) ----
function aiSnap(){const m=monthlyEst(),run=m.profit<0?G.cash/-m.profit:Infinity,es=G.emps,mor=es.length?Math.round(es.reduce((a,e)=>a+e.morale,0)/es.length):0;
  const roles={};for(const e of es)roles[ROLES[e.role]?ROLES[e.role].n:e.role]=(roles[ROLES[e.role]?ROLES[e.role].n:e.role]||0)+1;
  const L=[(LANG_EN?`Date: ${fmtDate(G.day)} (${fmtLeft(G.day)} since founding). Company: ${G.name}.`:`Tarih: ${fmtDate(G.day)} (kuruluştan ${fmtLeft(G.day)} sonra). Şirket: ${G.name}.`),
    G.story&&G.story.on?(LANG_EN?`Story campaign chapter ${G.story.ch+1}: ${STORY[G.story.ch].t}. Goals: ${STORY[G.story.ch].goals().map(g=>g.n+(goalOk(g)?" (done)":'')).join('; ')}.`:`Hikâye kampanyası bölüm ${G.story.ch+1}: ${STORY[G.story.ch].t}. Hedefler: ${STORY[G.story.ch].goals().map(g=>g.n+(goalOk(g)?' (tamam)':'')).join('; ')}.`):G.scn&&SCN[G.scn.id]&&G.scn.id!=='free'?(LANG_EN?`Scenario: ${SCN[G.scn.id].n}.`:`Senaryo: ${SCN[G.scn.id].n}.`):(LANG_EN?"Free play.":'Serbest oyun.'),
    (LANG_EN?`Cash ${money(G.cash)}, debt ${money(G.debt)}, valuation ${money(valuation())}, brand ${Math.round(G.brand)}/100.`:`Nakit ${money(G.cash)}, borç ${money(G.debt)}, değerleme ${money(valuation())}, marka ${Math.round(G.brand)}/100.`),
    (LANG_EN?`This month's estimate: revenue ${money(m.rev)}, product cost ${money(m.cost)}, salaries ${money(m.salary)}, rent ${money(m.rent)}, infrastructure ${money(m.infra)}, factories ${money(m.fact)}, interest ${money(m.interest)}, marketing ${money(m.mkt)}, tax ${money(m.tax)}, profit ${money(m.profit)}. Runway: ${run===Infinity?"in profit":Math.floor(run)+" months"}.`:`Bu ay tahmini: gelir ${money(m.rev)}, ürün maliyeti ${money(m.cost)}, maaşlar ${money(m.salary)}, kira ${money(m.rent)}, altyapı ${money(m.infra)}, fabrika ${money(m.fact)}, faiz ${money(m.interest)}, pazarlama ${money(m.mkt)}, vergi ${money(m.tax)}, kâr ${money(m.profit)}. Nakit ömrü: ${run===Infinity?'kârda':Math.floor(run)+' ay'}.`),
    (LANG_EN?`Team of ${es.length} (office capacity ${officeCap()}), average morale ${mor}, idle ${es.filter(e=>!e.founder&&idle(e)).length}. Roles: ${Object.entries(roles).map(([k,v])=>k+' '+v).join(', ')}.`:`Ekip ${es.length} kişi (ofis kapasitesi ${officeCap()}), ortalama moral ${mor}, boşta ${es.filter(e=>!e.founder&&idle(e)).length}. Roller: ${Object.entries(roles).map(([k,v])=>k+' '+v).join(', ')}.`),
    (LANG_EN?"Products:":'Ürünler:'),...myActive().slice(0,10).map(p=>(LANG_EN?`- ${p.name} (${CATS[p.cat].n}): market share ${pct(p.share,1)}, price ${money(p.price)}, freshness ${pct(p.score/S(p.cat),0)}${p.review!=null?`, press score ${fx(p.review,1)}`:''}${p.sat!=null?`, satisfaction ${Math.round(p.sat)}`:''}${p.camp>G.day?', reklamda':''}`:`- ${p.name} (${CATS[p.cat].n}): pazar payı ${pct(p.share,1)}, fiyat ${money(p.price)}, güncellik ${pct(p.score/S(p.cat),0)}${p.review!=null?`, basın puanı ${fx(p.review,1)}`:''}${p.sat!=null?`, memnuniyet ${Math.round(p.sat)}`:''}${p.camp>G.day?', reklamda':''}`)),
    G.projects.length?(LANG_EN?`In development: ${G.projects.map(pr=>`${pr.name||CATS[pr.cat].n} ${Math.round(projFrac(pr)*100)}%`).join(', ')}.`:`Geliştirmede: ${G.projects.map(pr=>`${pr.name||CATS[pr.cat].n} %${Math.round(projFrac(pr)*100)}`).join(', ')}.`):(LANG_EN?"No projects in development.":'Geliştirmede proje yok.'),
    (LANG_EN?`Research: ${G.res.active?RESD[G.res.active.id].n+" in progress":'yok'}; ${Object.keys(G.res.done).length} completed.`:`Araştırma: ${G.res.active?RESD[G.res.active.id].n+' sürüyor':'yok'}; tamamlanan ${Object.keys(G.res.done).length}.`),
    (LANG_EN?`Regions: ${REG_ORDER.filter(r=>G.regions[r].in).map(r=>REGS[r].n).join(', ')}.`:`Bölgeler: ${REG_ORDER.filter(r=>G.regions[r].in).map(r=>REGS[r].n).join(', ')}.`)];
  const cats=[...new Set(myActive().map(p=>p.cat))];
  for(const c of cats){const by={};for(const p of G.products)if(p.active&&p.cat===c&&p.owner!=='P')by[p.owner]=(by[p.owner]||0)+p.share;const top=Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,3);
    if(top.length)L.push((LANG_EN?`Rivals in the ${CATS[c].n} market: ${top.map(([o,s])=>`${ownerName(o)} ${pct(s,0)}`).join(', ')}.`:`${CATS[c].n} pazarında rakipler: ${top.map(([o,s])=>`${ownerName(o)} ${pct(s,0)}`).join(', ')}.`));}
  if(G.nem&&G.nem.st==='on'&&nemC())L.push((LANG_EN?`Nemesis: ${nemC().name}.`:`Ezeli rakip: ${nemC().name}.`));
  try{const d=diagCompute().slice(0,3);if(d.length)L.push((LANG_EN?"Game's diagnosis: ":'Oyunun teşhisi: ')+d.map(x=>x.t).join('; ')+'.');}catch(e){}
  try{const t=advTips().slice(0,5);if(t.length)L.push((LANG_EN?"Game's suggestion list: ":'Oyunun öneri listesi: ')+t.map(x=>x.t).join('; ')+'.');}catch(e){}
  if(G.inbox&&G.inbox.length)L.push((LANG_EN?`Pending decisions: ${G.inbox.map(it=>{const v=ibView(it);return v?v.t:it.id;}).join('; ')}.`:`Bekleyen kararlar: ${G.inbox.map(it=>{const v=ibView(it);return v?v.t:it.id;}).join('; ')}.`));
  return L.join('\n');}
const AI_GO=()=>{const out=[];for(const h of HUBS)for(const [k,n] of h.sec)if(leafOk(k)&&navOk(k)&&!k.startsWith('stats:'))out.push(`${k}=${n}`);return out.join(', ');};
const AI_RULES=()=>(LANG_EN?`You are Ayla, the player's advisor in "Silicon Garage", a tech company management game. The player is the CEO of a tech company. Below is the company's current data.
Rules: Write in English, friendly but clear. 150 words max. Be concrete: refer to the numbers and product names in the data, give at most 3 suggestions, ordered by importance. Don't invent features that aren't in the game; if you're unsure, say so.
If you want to send the player to a screen, write [[git:KEY]] at the end of the sentence; use only these keys: ${AI_GO()}.
You may use **text** for bold emphasis; don't use headings or tables.

COMPANY DATA
${aiSnap()}`:`Sen "Silikon Garaj" adlı teknoloji şirketi yönetim oyununda oyuncunun danışmanı Ayla'sın. Oyuncu bir teknoloji şirketinin CEO'su. Aşağıda şirketin şu anki verisi var.
Kurallar: Türkçe, samimi ama net yaz. En fazla 150 kelime. Somut ol: verideki rakamlara ve ürün adlarına atıf yap, en fazla 3 öneri ver, önem sırasına koy. Oyunda olmayan özellik uydurma; emin değilsen söyle.
Oyuncuyu bir ekrana yönlendirmek istersen cümlenin sonuna [[git:ANAHTAR]] yaz; yalnızca şu anahtarları kullan: ${AI_GO()}.
Kalın vurgu için **metin** kullanabilirsin; başlık ve tablo kullanma.

ŞİRKET VERİSİ
${aiSnap()}`);
function aiFmt(t){const keys=new Set();for(const h of HUBS)for(const [k] of h.sec)keys.add(k);
  return esc(t).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\[\[git:([a-z:]+)\]\]/g,(m,k)=>keys.has(k)?` <button class="btn sm ghost ai-go" data-act="askgo" data-tab="${k}">${esc(leafName(k))} →</button>`:'').replace(/\n/g,'<br>');}
const ASK_Q=[(LANG_EN?"What's my biggest problem right now?":'Şu an en önemli sorunum ne?'),(LANG_EN?"How do I extend my runway?":'Nakdimi nasıl uzatırım?'),(LANG_EN?"Which product should I invest in?":'Hangi ürüne yatırım yapmalıyım?'),(LANG_EN?"What should I do about my rivals?":'Rakiplerime karşı ne yapmalıyım?')];
async function aiAsk(q){q=String(q||'').trim().slice(0,600);if(!q||!aiOn()||AI.busy)return;AI.chat.push({role:'user',content:q});AI.busy='ask';AI.live='';AI.err=null;UI.askQ='';renderModal();
  const ctl=AI.ctl=new AbortController(),turns=AI.chat.slice(-8);const input=[{role:'user',content:AI_RULES()},...turns];
  try{const r=await AI.fn(input,{signal:ctl.signal,cache:false,onText:({text})=>{AI.live=text;const el=document.getElementById('askLive');if(el)el.innerHTML=aiFmt(text);}});
    AI.chat.push({role:'assistant',content:r.text+(r.truncated?(LANG_EN?"\n(Response cut short.)":'\n(Yanıt kısa kesildi.)'):'')});}
  catch(e){if(e&&e.code==='cancelled'){if(e.text)AI.chat.push({role:'assistant',content:e.text+(LANG_EN?"\n(Stopped.)":'\n(Durduruldu.)')});else AI.chat.pop();}else{if(e&&e.text)AI.chat.push({role:'assistant',content:e.text});AI.err=aiFail(e);}}
  finally{AI.busy=null;AI.live='';AI.ctl=null;if(UI.modal&&UI.modal.kind==='ask')renderModal();}}
function vAskModal(){const msgs=AI.chat.map(m=>`<div class="ai-msg ${m.role==='user'?'me':'ai'}">${m.role==='user'?esc(m.content):aiFmt(m.content)}</div>`).join('');
  return (LANG_EN?`<div class="eyebrow">Advisor · Claude</div><h2>Ask Ayla</h2><p class="small muted">Ayla sees your company's current data (cash, expenses, products, rivals, team) and tailors her advice to it. Answers count toward your Claude usage.</p>
    <div class="ai-log" id="askLog">${msgs||"<div class=\"small muted\">Pick a question or type your own.</div>"}${AI.busy==='ask'?`<div class="ai-msg ai" id="askLive">${AI.live?aiFmt(AI.live):"<span class=\"muted\">Thinking…</span>"}</div>`:''}</div>
    ${AI.err?`<div class="small neg">${esc(AI.err)}</div>`:''}
    ${!AI.chat.length?`<div class="row" style="gap:6px;flex-wrap:wrap">${ASK_Q.map(q=>`<button class="btn sm" data-act="askq" data-q="${esc(q)}" ${AI.busy?'disabled':''}>${esc(q)}</button>`).join('')}</div>`:''}
    <div class="ai-in"><textarea id="askQ" rows="2" maxlength="600" placeholder="Type your question… (Enter to send)" aria-label="Question for the advisor">${esc(UI.askQ||'')}</textarea>
    ${AI.busy==='ask'?"<button class=\"btn\" data-act=\"askstop\">Stop</button>":"<button class=\"btn primary\" data-act=\"asksend\">Send</button>"}</div>
    <div class="row">${AI.chat.length&&!AI.busy?"<button class=\"btn sm ghost\" data-act=\"askclear\">Clear chat</button>":''}<button class="btn sm" data-act="close">Close</button></div>`:`<div class="eyebrow">Danışman · Claude</div><h2>Ayla'ya sor</h2><p class="small muted">Ayla şirketinin şu anki verisini (nakit, giderler, ürünler, rakipler, ekip) görür ve önerilerini ona göre yapar. Yanıtlar senin Claude kullanımından harcar.</p>
    <div class="ai-log" id="askLog">${msgs||'<div class="small muted">Bir soru seç ya da yaz.</div>'}${AI.busy==='ask'?`<div class="ai-msg ai" id="askLive">${AI.live?aiFmt(AI.live):'<span class="muted">Düşünüyor…</span>'}</div>`:''}</div>
    ${AI.err?`<div class="small neg">${esc(AI.err)}</div>`:''}
    ${!AI.chat.length?`<div class="row" style="gap:6px;flex-wrap:wrap">${ASK_Q.map(q=>`<button class="btn sm" data-act="askq" data-q="${esc(q)}" ${AI.busy?'disabled':''}>${esc(q)}</button>`).join('')}</div>`:''}
    <div class="ai-in"><textarea id="askQ" rows="2" maxlength="600" placeholder="Sorunu yaz… (Enter ile gönder)" aria-label="Danışmana soru">${esc(UI.askQ||'')}</textarea>
    ${AI.busy==='ask'?'<button class="btn" data-act="askstop">Durdur</button>':'<button class="btn primary" data-act="asksend">Gönder</button>'}</div>
    <div class="row">${AI.chat.length&&!AI.busy?'<button class="btn sm ghost" data-act="askclear">Sohbeti temizle</button>':''}<button class="btn sm" data-act="close">Kapat</button></div>`);}
// ---- press review ----
const OUTLETS=['TeknoHaber',(LANG_EN?"The Silicon Post":'Silikon Postası'),(LANG_EN?"Chips & Beyond":'Çip ve Ötesi'),(LANG_EN?"Digital Agenda":'Dijital Gündem'),(LANG_EN?"Code Magazine":'Kod Dergisi')];
function aiPressPrompt(p){const v=p.score/S(p.cat),rv=G.products.filter(q=>q.active&&q.owner!=='P'&&q.cat===p.cat).sort((a,b)=>b.share-a.share).slice(0,3);
  return (LANG_EN?`A fictional product has launched in a tech management game. Write a short review in English for a tech magazine.
Magazine: ${OUTLETS[p.id%OUTLETS.length]}. Date: ${fmtDate(p.launch!=null?Math.max(0,p.launch):G.day)}.
Product: ${p.name}, category ${CATS[p.cat].n}, maker ${G.name}. Price ${money(p.price)}. Technical freshness vs. market standard: ${Math.round(v*100)}%.${p.bugs!=null?` Known bug count: ${Math.round(p.bugs)}.`:''}${p.spec&&p.spec.node?` Process node: ${p.spec.node}.`:''}
Rivals: ${rv.map(q=>`${q.name} (${ownerName(q.owner)}, ${money(q.price)})`).join(', ')||'yok'}.
The magazine's score is ${fx(p.review,1)}/10. Keep the tone consistent with this score (above 7 positive, below 5 critical).
Return only this JSON: {"headline": "max 10 words", "body": "90-140 words, 2 paragraphs, separated by \\n\\n", "pros": ["short", "short"], "cons": ["short", "short"]}`:`Bir teknoloji yönetim oyununda kurgusal bir ürün piyasaya çıktı. Bir teknoloji dergisi için kısa bir Türkçe inceleme yaz.
Dergi: ${OUTLETS[p.id%OUTLETS.length]}. Tarih: ${fmtDate(p.launch!=null?Math.max(0,p.launch):G.day)}.
Ürün: ${p.name}, kategori ${CATS[p.cat].n}, üretici ${G.name}. Fiyat ${money(p.price)}. Teknik güncellik piyasa standardına göre %${Math.round(v*100)}.${p.bugs!=null?` Bilinen hata sayısı ${Math.round(p.bugs)}.`:''}${p.spec&&p.spec.node?` Üretim süreci ${p.spec.node}.`:''}
Rakipler: ${rv.map(q=>`${q.name} (${ownerName(q.owner)}, ${money(q.price)})`).join(', ')||'yok'}.
Derginin verdiği puan ${fx(p.review,1)}/10. Yazının tonu bu puanla tutarlı olsun (7 üstü olumlu, 5 altı eleştirel).
Yalnızca şu JSON'u döndür: {"headline": "en fazla 10 kelime", "body": "90-140 kelime, 2 paragraf, \\n\\n ile ayrılmış", "pros": ["kısa", "kısa"], "cons": ["kısa", "kısa"]}`);}
async function aiPress(pid,auto){const p=prod(pid);if(!p||!aiOn()||AI.busy)return;G.press=G.press||{};if(G.press[pid]){if(!auto){UI.pressId=pid;openModal('press');}return;}
  AI.busy='press';AI.pressFor=pid;AI.err=null;if(!auto){UI.pressId=pid;openModal('press');}
  try{const j=await AI.fn.json(aiPressPrompt(p),{modelTier:'quick',cache:{gcTime:3600000}});if(!j||typeof j.body!=='string')throw {code:'invalid_json'};
    G.press[pid]={h:String(j.headline||p.name).slice(0,120),b:String(j.body).slice(0,1500),pros:(Array.isArray(j.pros)?j.pros:[]).slice(0,3).map(x=>String(x).slice(0,80)),cons:(Array.isArray(j.cons)?j.cons:[]).slice(0,3).map(x=>String(x).slice(0,80)),o:OUTLETS[p.id%OUTLETS.length],r:p.review,d:G.day};
    const ks=Object.keys(G.press);if(ks.length>30)delete G.press[ks[0]];
    if(auto)news(`${G.press[pid].o}: "${G.press[pid].h}"`,'',true);}
  catch(e){AI.err=aiFail(e);if(auto)PREF.aiPress=false;}
  finally{AI.busy=null;AI.pressFor=null;if(UI.modal&&UI.modal.kind==='press')renderModal();UI.force=true;}}
function aiAutoPress(p){if(PREF.aiPress&&aiOn()&&p&&p.owner==='P'&&p.review!=null)setTimeout(()=>aiPress(p.id,true),400);}
function vPressModal(){const p=prod(UI.pressId),R=G.press&&G.press[UI.pressId];if(!p)return (LANG_EN?"<p>Product not found.</p><div class=\"row\"><button class=\"btn\" data-act=\"close\">Close</button></div>":'<p>Ürün bulunamadı.</p><div class="row"><button class="btn" data-act="close">Kapat</button></div>');
  if(!R)return (LANG_EN?`<div class="eyebrow">${OUTLETS[p.id%OUTLETS.length]} · review</div><h2>${esc(p.name)}</h2>${AI.busy==='press'&&AI.pressFor===p.id?"<p class=\"muted\">The editor is writing…</p>":`<p class="small neg">${esc(AI.err||"Couldn't prepare the article.")}</p><button class="btn sm" data-act="press" data-id="${p.id}">Try again</button>`}<div class="row"><button class="btn" data-act="close">Close</button></div>`:`<div class="eyebrow">${OUTLETS[p.id%OUTLETS.length]} · inceleme</div><h2>${esc(p.name)}</h2>${AI.busy==='press'&&AI.pressFor===p.id?'<p class="muted">Editör yazıyor…</p>':`<p class="small neg">${esc(AI.err||'Yazı hazırlanamadı.')}</p><button class="btn sm" data-act="press" data-id="${p.id}">Yeniden dene</button>`}<div class="row"><button class="btn" data-act="close">Kapat</button></div>`);
  return (LANG_EN?`<article class="press"><div class="press-mast">${esc(R.o)}<span>${fmtDate(R.d)}</span></div><h2>${esc(R.h)}</h2><div class="press-score"><b>${fx(R.r,1)}</b><span>/10</span></div>
    ${R.b.split(/\n\n+/).map(x=>`<p>${esc(x)}</p>`).join('')}
    <div class="grid press-pc"><div><b class="pos">Pros</b><ul>${R.pros.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><b class="neg">Cons</b><ul>${R.cons.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div></article>
    <p class="small muted">Fictional review · written by Claude from the game's data.</p><div class="row"><button class="btn primary" data-act="close">Close</button></div>`:`<article class="press"><div class="press-mast">${esc(R.o)}<span>${fmtDate(R.d)}</span></div><h2>${esc(R.h)}</h2><div class="press-score"><b>${fx(R.r,1)}</b><span>/10</span></div>
    ${R.b.split(/\n\n+/).map(x=>`<p>${esc(x)}</p>`).join('')}
    <div class="grid press-pc"><div><b class="pos">Artılar</b><ul>${R.pros.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><b class="neg">Eksiler</b><ul>${R.cons.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div></article>
    <p class="small muted">Kurgusal inceleme · Claude tarafından oyunun verisine göre yazıldı.</p><div class="row"><button class="btn primary" data-act="close">Kapat</button></div>`);}
// ---- monthly paper ----
function aiPaperPrompt(){const from=G.day-31,N=G.news.filter(n=>n.d>=from).slice(0,40).map(n=>`- ${fmtDate(n.d)}: ${n.t}`).join('\n');
  return (LANG_EN?`In the fictional world of a tech management game, there's a monthly tech newspaper: "The Silicon Gazette". Write the paper's front page in English from the past month's news below.
Player's company: ${G.name} (valuation ${money(valuation())}, brand ${Math.round(G.brand)}). Date: ${fmtDate(G.day)}.
News:
${N||"- A quiet month went by."}
Don't add made-up companies or products; use only the names in the news. Use newspaper style, no exaggeration.
Return only this JSON: {"headline": "headline, max 10 words", "lead": "40-70 word lead", "items": [{"h": "short title", "t": "20-40 words"}, ... 3 or 4 of them]}`:`Bir teknoloji yönetim oyununun kurgusal dünyasında aylık bir teknoloji gazetesi çıkıyor: "Silikon Gazetesi". Aşağıdaki son bir ayın haberlerinden gazetenin ön sayfasını Türkçe yaz.
Oyuncunun şirketi: ${G.name} (değerleme ${money(valuation())}, marka ${Math.round(G.brand)}). Tarih: ${fmtDate(G.day)}.
Haberler:
${N||'- Sakin bir ay geçti.'}
Uydurma şirket ve ürün ekleme; yalnızca haberlerdeki adları kullan. Gazete dili kullan, abartma.
Yalnızca şu JSON'u döndür: {"headline": "manşet, en fazla 10 kelime", "lead": "40-70 kelimelik giriş", "items": [{"h": "kısa başlık", "t": "20-40 kelime"}, ... 3 ya da 4 tane]}`);}
async function aiPaper(){if(!aiOn()||AI.busy)return;const key=fmtMonth(G.day);G.paper=G.paper||{};UI.paperK=key;openModal('paper');if(G.paper[key])return;AI.busy='paper';AI.err=null;renderModal();
  try{const j=await AI.fn.json(aiPaperPrompt(),{modelTier:'quick'});if(!j||typeof j.headline!=='string')throw {code:'invalid_json'};
    G.paper[key]={h:String(j.headline).slice(0,140),l:String(j.lead||'').slice(0,600),it:(Array.isArray(j.items)?j.items:[]).slice(0,4).map(x=>({h:String(x&&x.h||'').slice(0,100),t:String(x&&x.t||'').slice(0,400)})),d:G.day};
    const ks=Object.keys(G.paper);if(ks.length>12)delete G.paper[ks[0]];}
  catch(e){AI.err=aiFail(e);}finally{AI.busy=null;if(UI.modal&&UI.modal.kind==='paper')renderModal();}}
function vPaperModal(){const P=G.paper&&G.paper[UI.paperK];
  if(!P)return (LANG_EN?`<div class="eyebrow">The Silicon Gazette · ${esc(UI.paperK||'')}</div><h2>Front page</h2>${AI.busy==='paper'?"<p class=\"muted\">The paper is going to print…</p>":`<p class="small neg">${esc(AI.err||"Couldn't prepare the paper.")}</p><button class="btn sm" data-act="paper">Try again</button>`}<div class="row"><button class="btn" data-act="close">Close</button></div>`:`<div class="eyebrow">Silikon Gazetesi · ${esc(UI.paperK||'')}</div><h2>Ön sayfa</h2>${AI.busy==='paper'?'<p class="muted">Gazete baskıda…</p>':`<p class="small neg">${esc(AI.err||'Gazete hazırlanamadı.')}</p><button class="btn sm" data-act="paper">Yeniden dene</button>`}<div class="row"><button class="btn" data-act="close">Kapat</button></div>`);
  return (LANG_EN?`<article class="paper"><div class="paper-mast">The Silicon Gazette<span>${fmtDate(P.d)}</span></div><h2>${esc(P.h)}</h2><p class="paper-lead">${esc(P.l)}</p>
    <div class="paper-cols">${P.it.map(x=>`<div><b>${esc(x.h)}</b><p>${esc(x.t)}</p></div>`).join('')}</div></article>
    <p class="small muted">Fictional newspaper · written by Claude from this month's game news.</p><div class="row"><button class="btn primary" data-act="close">Close</button></div>`:`<article class="paper"><div class="paper-mast">Silikon Gazetesi<span>${fmtDate(P.d)}</span></div><h2>${esc(P.h)}</h2><p class="paper-lead">${esc(P.l)}</p>
    <div class="paper-cols">${P.it.map(x=>`<div><b>${esc(x.h)}</b><p>${esc(x.t)}</p></div>`).join('')}</div></article>
    <p class="small muted">Kurgusal gazete · Claude tarafından bu ayın oyun haberlerinden yazıldı.</p><div class="row"><button class="btn primary" data-act="close">Kapat</button></div>`);}
function vAiPrefs(){if(!aiOn())return '';return (LANG_EN?`<div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ${PREF.aiPress?'primary':''}" data-act="pref" data-k="aiPress" aria-pressed="${!!PREF.aiPress}">Press reviews at launch: ${PREF.aiPress?"On":"Off"}</button><span class="small muted">When on, Claude writes a short review for every product launch (counts toward your Claude usage).</span></div>`:`<div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ${PREF.aiPress?'primary':''}" data-act="pref" data-k="aiPress" aria-pressed="${!!PREF.aiPress}">Lansmanlarda basın yazısı: ${PREF.aiPress?'Açık':'Kapalı'}</button><span class="small muted">Açıkken her ürün lansmanında Claude kısa bir inceleme yazısı yazar (senin Claude kullanımından harcar).</span></div>`);}

