/* ============================== SIMPLE MODE ============================== */
/* Basit mod: ileri seviye bölümleri menüden gizler ve onların kararlarını varsayılanlarla otomatik verir. Ayarlardan her an Tam moda geçilebilir. */
const SIMPLE_HIDE=['market:medya','market:toptan','fin:portfoy','market:sehir','supply:ham','team:kultur','team:egitim','team:sendika','team:yetenek','team:fikir','team:yz','res:yz','res:lisans','res:patent','res:acik','infra:veri','infra:guvenlik','supply:dikey',
  'market:marka','market:altmarka','market:sosyal','market:ortak','market:ceo','market:ihale','market:hi','market:sezon','market:magaza','market:fuar',
  'fin:ekonomi','fin:kur','fin:hissedar','fin:girisim','fin:kurucu','fin:surdur','fin:devlet','dpol','refurb','bundle','space','skill','map','mega'];
const SIMPLE_EV=['rvcopy','rvcrisis','unionDrive','bargain','cofdis','cofeq','cofleave','ceofeud','ceopart','activist','patent','suitIn','settle','antitrust','cvev','leak','breach','crit','clash','raid'];
const simpleHid=k=>!!(G&&G.simple&&SIMPLE_HIDE.includes(k)&&!(G.story&&storyShown(k)));
const simpleN=()=>G&&G.simple?SIMPLE_HIDE.filter(simpleHid).length:0;
function simpleInit(){G.autoOrder=true;G.autoRes=true;}
function simpleAutoDecide(id,d){const E=EVD[id];if(!E)return false;let v=null;try{v=E.view(d);}catch(e){}const n=v?v.o.length:1,i=evDefI(id,d,n);
  try{E.pick(d,i);}catch(e){return false;}news((LANG_EN?`Auto decision (Simple mode): ${v?v.t:'karar'} → ${v&&v.o[i]?v.o[i].t:"default"}.`:`Otomatik karar (Basit mod): ${v?v.t:'karar'} → ${v&&v.o[i]?v.o[i].t:'varsayılan'}.`),'');return true;}
function simpleMonthly(){if(!G.simple||!G.cyber)return;const C=G.cyber;
  if(G.emps.length>=10&&!C.backup&&G.cash>CY_TOOLS.backup.cost()*6){C.backup=true;news((LANG_EN?"Simple mode: a backup system was set up for cybersecurity.":'Basit mod: siber güvenlik için yedekleme sistemi kuruldu.'),'');}
  if(G.emps.length>=25&&!C.ins&&G.cash>CY_TOOLS.ins.cost()*6){C.ins=true;news((LANG_EN?"Simple mode: cyber insurance was purchased.":'Basit mod: siber sigorta yaptırıldı.'),'');}}
function vSimpleToggle(){const on=!!G.simple,n=SIMPLE_HIDE.filter(k=>G.story&&G.story.on?!storyShown(k):true).length;
  return (LANG_EN?`<div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ${on?'primary':''}" data-act="simpletoggle" aria-pressed="${on}">Game mode: ${on?"Simple":"Full"}</button><span class="small muted">${on?`Simple mode: ${simpleN()} advanced sections hidden; decisions like union, lawsuits, and culture use defaults automatically, and parts orders and research queue are automatic.`:`Full mode: all sections unlocked and you make every decision. Switching to Simple mode hides ${n} sections.`}</span></div>`:`<div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ${on?'primary':''}" data-act="simpletoggle" aria-pressed="${on}">Oyun modu: ${on?'Basit':'Tam'}</button><span class="small muted">${on?`Basit mod: ${simpleN()} ileri seviye bölüm gizli; sendika, dava, kültür gibi kararlar varsayılanla otomatik verilir, parça siparişi ve araştırma sırası otomatik.`:`Tam mod: bütün bölümler açık ve her kararı sen verirsin. Basit moda geçersen ${n} bölüm gizlenir.`}</span></div>`);}

