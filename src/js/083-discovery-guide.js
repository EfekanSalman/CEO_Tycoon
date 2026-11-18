/* ============================== DISCOVERY GUIDE ============================== */
/* Temel öğreticiden sonra yeni sistemleri sırayla tanıtan keşif rehberi. Her adım ilgili an gelince (on) açılır,
   oyuncu o şeyi gerçekten yapınca (done) tamamlanır. CEO masasında tek kart sıradaki adımı gösterir; "Göster" ilgili sayfaya
   götürür ve orada üstte ne yapılacağını anlatan bir şerit çıkar. Basit modda gizli ya da henüz açılmamış bölümleri önermez. */
const GD=[
  {id:'comp',go:'dev',help:'comp',t:(LANG_EN?"Components and the depot":'Bileşenler ve depo'),d:(LANG_EN?"Projects now progress through components: interface code, backend, graphics sets and so on. The project card shows how many of each are done; in the depot below, components made by idle staff pile up and go straight into new projects.":'Projeler artık bileşenlerle ilerliyor: arayüz kodu, arka uç, grafik seti gibi. Proje kartında hangisinden kaç tane bittiğini gör; aşağıdaki depoda boştaki çalışanların ürettiği bileşenler birikir ve yeni projelere hemen geçer.'),
    on:()=>G.projects.length>0,done:()=>gdSaw('dev','comp')},
  {id:'fl',go:'dev',help:'fl',t:(LANG_EN?"Take your first freelance job":'İlk serbest işini al'),d:(LANG_EN?"Other companies want components from you. Accept an offer with a comfortable deadline in the Freelance work section; components in the depot are delivered automatically. If you're in a hurry, \"Do it yourself\" lets the founder make a component right away.":'Başka şirketler senden bileşen istiyor. Serbest işler bölümünden süresi rahat bir teklifi kabul et; depodaki bileşenler otomatik teslim edilir. Acele gerekirse "Kendin çalış" ile kurucu bir bileşeni hemen yapar.'),
    on:()=>!!(G.fl&&G.fl.offers.length),done:()=>!!(G.fl&&(G.fl.done>0||G.fl.act.length>0))},
  {id:'feat',go:'dev',help:'feat',t:(LANG_EN?"Add a feature to your product":'Ürününe özellik ekle'),d:(LANG_EN?"In step two of the development wizard, pick an \"Innovation\" feature next to the standard ones (e.g. sharing and social feed). Innovations lengthen the work a little but raise the score and the press reception. You can also add features to a product on the market through an update.":'Geliştirme sihirbazının ikinci adımında standartların yanına bir "Yenilik" özelliği seç (ör. paylaşım ve sosyal akış). Yenilikler işi biraz uzatır ama puanı ve basını yükseltir. Piyasadaki ürüne güncellemeyle de özellik eklenebilir.'),
    on:()=>myActive().length>0||G.projects.length>0,done:()=>[...G.products.filter(p=>p.owner==='P'),...G.projects.map(p=>p.d||{})].some(x=>Array.isArray(x.feats)&&x.feats.some(k=>FT[k]&&!ftStd(FT[k])))},
  {id:'career',go:'office',help:'teamd',t:(LANG_EN?"Develop an employee":'Bir çalışanı geliştir'),d:(LANG_EN?"Click an experienced employee in the office. In the Career section of their card, choose a specialization or assign them as a junior's mentor: specialists produce faster on the attributes you focus on, and mentored juniors grow quickly.":'Ofiste deneyimli bir çalışana tıkla. Kartın Kariyer bölümünden ona bir uzmanlık seç ya da bir gence mentor ata: uzmanlar odaklandığın nitelikte daha hızlı üretir, mentorlu gençler çabuk büyür.'),
    on:()=>G.emps.some(e=>specOk(e)&&!e.founder)||G.emps.some(e=>!e.founder&&mentorCands(e).length),done:()=>G.emps.some(e=>!e.founder&&(e.spec||e.mentor))},
  {id:'want',go:'office',help:'want',t:(LANG_EN?"Fulfill a request":'Bir isteği karşıla'),d:(LANG_EN?"An employee with a heart bubble over their head wants an item on their floor. Press \"Buy and place\" in the Employee requests section of the office: a fulfilled request lifts their morale, an ignored one lowers it.":'Başında kalp balonu olan çalışan katına bir eşya istiyor. Ofisteki Çalışan istekleri bölümünden "Satın al ve yerleştir"e bas: istek karşılanınca morali yükselir, görmezden gelinirse düşer.'),
    on:()=>G.emps.some(e=>e.want),done:()=>G.emps.some(e=>e.wOk!=null)},
  {id:'city',go:'market:sehir',help:'city',t:(LANG_EN?"Run a campaign in a city":'Bir şehirde kampanya yap'),d:(LANG_EN?"Every city has its own tastes and income profile. On the Cities page, see where your products are strong and launch a local campaign in one of the biggest cities: awareness rises there.":'Her şehrin zevki ve gelir profili farklı. Şehirler sayfasında ürünlerinin hangi şehirde güçlü olduğuna bak ve en büyük şehirlerden birinde yerel kampanya başlat: bilinirlik orada yükselir.'),
    on:()=>myActive().length>0&&years()>=0.5&&G.cash>200e3,done:()=>!!(G.ct&&G.ct.n>0)},
  {id:'stmt',go:'fin:tablo',help:'stmt',t:(LANG_EN?"Look at your financial statements":'Mali tablolarına bak'),d:(LANG_EN?"The income statement shows where you earn and spend, the balance sheet what you own, and cash flow where the money goes. Check your gross margin and cash runway; your rivals' financials are below too.":'Gelir tablosu nereden kazanıp nereye harcadığını, bilanço neye sahip olduğunu, nakit akışı paranın nereye gittiğini gösterir. Brüt marjına ve nakit ömrüne göz at; aşağıda rakiplerinin finansalları da var.'),
    on:()=>G.hist.length>=3,done:()=>gdSaw('fin:tablo','stmt')},
  {id:'fgrid',go:'mfg',help:'fgrid',t:(LANG_EN?"Add a support unit to your factory":'Fabrikana destek birimi kur'),d:(LANG_EN?"Click an empty cell on the factory card's grid. Lines take materials from purchasing and hand products to shipping; quality control lowers the defect rate, training lowers labor and maintenance lowers operating cost.":'Fabrika kartındaki ızgarada boş bir hücreye tıkla. Hatlar satın almadan malzeme alıp sevkiyata ürün verir; kalite kontrol hata oranını, eğitim işçiliği, bakım işletme giderini düşürür.'),
    on:()=>G.factories.some(f=>G.day>=f.ready&&f.lines>=2),done:()=>G.factories.some(f=>f.g&&f.g.some(x=>x==='qc'||x==='train'||x==='maint'))},
  {id:'raw',go:'supply:ham',help:'raw',t:(LANG_EN?"Hedge against raw materials":'Ham maddeye karşı korun'),d:(LANG_EN?"Part of your parts' price depends on raw material prices, and shocks happen. On the Raw materials page, lock a 12-month futures contract when prices are low, or build a mine for a raw material you use a lot.":'Parça fiyatlarının bir kısmı ham madde fiyatlarına bağlı ve şoklar yaşanır. Ham maddeler sayfasında fiyat düşükken 12 aylık vadeli anlaşma yap ya da çok kullandığın ham madde için maden kur.'),
    on:()=>myActive().some(p=>isHW(p))&&years()>=1,done:()=>!!(G.raw&&(Object.keys(G.raw.mine).length||Object.keys(G.raw.fut).length))}];
const GDD=Object.fromEntries(GD.map(s=>[s.id,s]));
const newGd=()=>({on:true,done:{},seen:{},ann:{},snooze:{}});
const gdOf=()=>G.gd||(G.gd=newGd());
// adım açıldıktan sonra o sayfaya bakıldı mı
const gdSaw=(k,id)=>{const D=gdOf();return D.seen[k]!=null&&D.ann[id]!=null&&D.seen[k]>=D.ann[id];};
const gdLeafOk=k=>navOk(k)&&!simpleHid(k);
const gdBusy=()=>!!(G.tut&&G.tut.on)||!!G.over;
function gdOn(s){try{return gdLeafOk(s.go)&&s.on();}catch(e){return false;}}
function gdDone(s){try{return s.done();}catch(e){return false;}}
// sıradaki adım: açılmış, tamamlanmamış, ertelenmemiş ilk adım
function gdNext(){const D=gdOf();return GD.find(s=>D.done[s.id]==null&&gdOn(s)&&!((D.snooze[s.id]||0)>G.day))||null;}
function gdTick(){if(!G||gdBusy())return;const D=gdOf();if(!D.on)return;const c=curLeaf();if(c.leaf)D.seen[c.leaf]=G.day;if(UI.tab)D.seen[UI.tab]=G.day;
  for(const s of GD){if(D.done[s.id]!=null)continue;if(gdDone(s)){D.done[s.id]=G.day;showToast((LANG_EN?`Guide: ${s.t} done.`:`Rehber: ${s.t} tamamlandı.`),'good');}
    else if(D.ann[s.id]==null&&gdOn(s)){D.ann[s.id]=G.day;}}
  if(GD.every(s=>D.done[s.id]!=null)){D.on=false;news((LANG_EN?"Discovery guide complete: you've tried all of the game's new systems.":'Keşif rehberi tamamlandı: oyunun bütün yeni sistemlerini denedin.'),'good',true);}}
function gdAct(a,k){const D=gdOf(),s=GDD[k];
  if(a==='gdgo'&&s){UI.gdStep=s.id;act('tab',{tab:s.go});}
  else if(a==='gdlater'&&s){D.snooze[s.id]=G.day+30;if(UI.gdStep===s.id)UI.gdStep=null;}
  else if(a==='gdoff'){D.on=false;UI.gdStep=null;}
  else if(a==='gdon'){D.on=true;}
  else if(a==='gdlist'){UI.gdList=!UI.gdList;}
  else if(a==='gdclose'){UI.gdStep=null;}}
// CEO masasındaki kart
function vGuideCard(){if(!G||gdBusy())return '';const D=gdOf();if(!D.on)return '';const s=gdNext(),n=GD.filter(x=>D.done[x.id]!=null).length;
  if(!s&&!UI.gdList)return '';
  const list=UI.gdList?`<ul class="gd-l">${GD.map(x=>{const dn=D.done[x.id]!=null,on=gdOn(x);return `<li class="${dn?'ok':on?'':'off'}"><span class="chip ${dn?'st-ok':on?'st-warn':'st-mute'}">${dn?(LANG_EN?"Done":'Tamam'):on?(LANG_EN?"Ready":'Hazır'):(LANG_EN?"Not yet":'Henüz değil')}</span> ${esc(x.t)}</li>`;}).join('')}</ul>`:'';
  return (LANG_EN?`<section class="panel gd"><div class="ph"><h2>Discovery guide</h2><span class="sub">${n}/${GD.length}</span></div><div class="pb col" style="gap:8px">
    ${s?`<div><b>${esc(s.t)}</b><p class="small" style="margin:4px 0 0">${esc(s.d)}</p></div>
    <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm primary" data-act="gdgo" data-k="${s.id}">Show me</button><button class="btn sm" data-act="help" data-k="${s.help}">More info</button><button class="btn sm ghost" data-act="gdlater" data-k="${s.id}">Later</button>`:"<div class=\"small muted\">Nothing new to suggest right now; new steps open up as the game progresses.</div><div class=\"row\" style=\"gap:6px;flex-wrap:wrap\">"}
    <button class="btn sm ghost" data-act="gdlist" aria-pressed="${!!UI.gdList}">${UI.gdList?"Hide list":"All steps"}</button><button class="btn sm ghost" data-act="gdoff">Turn off guide</button></div>${list}</div></section>`:`<section class="panel gd"><div class="ph"><h2>Keşif rehberi</h2><span class="sub">${n}/${GD.length}</span></div><div class="pb col" style="gap:8px">
    ${s?`<div><b>${esc(s.t)}</b><p class="small" style="margin:4px 0 0">${esc(s.d)}</p></div>
    <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm primary" data-act="gdgo" data-k="${s.id}">Göster</button><button class="btn sm" data-act="help" data-k="${s.help}">Ayrıntılı bilgi</button><button class="btn sm ghost" data-act="gdlater" data-k="${s.id}">Daha sonra</button>`:'<div class="small muted">Şu an önerilecek yeni bir şey yok; yeni adımlar oyun ilerledikçe açılır.</div><div class="row" style="gap:6px;flex-wrap:wrap">'}
    <button class="btn sm ghost" data-act="gdlist" aria-pressed="${!!UI.gdList}">${UI.gdList?'Listeyi gizle':'Tüm adımlar'}</button><button class="btn sm ghost" data-act="gdoff">Rehberi kapat</button></div>${list}</div></section>`);}
// hedef sayfada üstte çıkan şerit
function vGuideStrip(){const k=UI.gdStep,s=k&&GDD[k];if(!s||gdBusy())return '';const c=curLeaf();if(c.leaf!==s.go&&UI.tab!==s.go)return '';
  const dn=gdOf().done[s.id]!=null,nx=dn?gdNext():null;
  return (LANG_EN?`<div class="gd-s" role="status"><div class="row between small"><span class="eyebrow" style="color:var(--accent);font-weight:700">Discovery guide · ${esc(s.t)}${dn?" · <span class=\"pos\">done</span>":''}</span><button class="btn sm ghost" data-act="gdclose" aria-label="Close guide banner">Close</button></div><p class="small" style="margin:4px 0 0">${esc(s.d)}</p>${nx?`<div class="row" style="margin-top:6px"><button class="btn sm" data-act="gdgo" data-k="${nx.id}">Next: ${esc(nx.t)}</button></div>`:''}</div>`:`<div class="gd-s" role="status"><div class="row between small"><span class="eyebrow" style="color:var(--accent);font-weight:700">Keşif rehberi · ${esc(s.t)}${dn?' · <span class="pos">tamamlandı</span>':''}</span><button class="btn sm ghost" data-act="gdclose" aria-label="Rehber şeridini kapat">Kapat</button></div><p class="small" style="margin:4px 0 0">${esc(s.d)}</p>${nx?`<div class="row" style="margin-top:6px"><button class="btn sm" data-act="gdgo" data-k="${nx.id}">Sıradaki: ${esc(nx.t)}</button></div>`:''}</div>`);}
