/* ============================== SUB TABS ============================== */
const SUBTABS={
  team:[['ekip',(LANG_EN?"Team & candidates":'Ekip ve adaylar')],['ortam',(LANG_EN?"Workplace":'Çalışma ortamı')],['kultur',(LANG_EN?"Company culture":'Şirket kültürü')],['yonetim',(LANG_EN?"Management":'Yönetim')],['egitim',(LANG_EN?"Training & internships":'Eğitim ve staj')],['sendika',(LANG_EN?"Surveys & union":'Anket ve sendika')],['yetenek',(LANG_EN?"Talent wars":'Yetenek savaşları')],['fikir',(LANG_EN?"Side projects":'Yan projeler')],['ust',(LANG_EN?"Executives":'Üst yönetim')],['devralma',(LANG_EN?"Acquired teams":'Devralınan ekipler')],['mezun',(LANG_EN?"Alumni":'Mezunlar')],['yz',(LANG_EN?"AI agents":'Yapay zekâ ajanları')]],
  res:[['arastirma',(LANG_EN?"Research":'Araştırma')],['sokum',(LANG_EN?"Teardown":'Ürün sökümü')],['yz',(LANG_EN?"AI race":'Yapay zekâ yarışı')],['lisans',(LANG_EN?"Chip licensing":'Çip lisansları')],['patent',(LANG_EN?"Patents & lawsuits":'Patentler ve davalar')],['acik',(LANG_EN?"Open source & community":'Açık kaynak ve topluluk')]],
  infra:[['ofis',(LANG_EN?"Offices & servers":'Ofis ve sunucular')],['veri',(LANG_EN?"Data centers":'Veri merkezleri')],['guvenlik',(LANG_EN?"Cybersecurity":'Siber güvenlik')]],
  supply:[['satin',(LANG_EN?"Purchasing":'Satın alma')],['dikey',(LANG_EN?"Vertical integration":'Dikey entegrasyon')],['ham',(LANG_EN?"Raw materials":'Ham maddeler')]],
  market:[['pay',(LANG_EN?"Market & rivals":'Pazar ve rakipler')],['pazarlama',(LANG_EN?"Marketing & segments":'Pazarlama ve segmentler')],['marka',(LANG_EN?"Brand identity":'Marka kimliği')],['altmarka',(LANG_EN?"Sub-brands":'Alt markalar')],['sosyal',(LANG_EN?"Social media":'Sosyal medya')],['bolge',(LANG_EN?"Regions":'Bölgeler')],['sehir',(LANG_EN?"Cities":'Şehirler')],['medya',(LANG_EN?"Media company":'Medya şirketi')],['toptan',(LANG_EN?"Wholesale trade":'Toptan ticaret')],['magaza',(LANG_EN?"Store chain":'Mağaza zinciri')],['fuar',(LANG_EN?"Trade shows & sponsorship":'Fuarlar ve sponsorluk')],['ortak',(LANG_EN?"Partnerships":'Ortaklıklar')],['ceo',(LANG_EN?"Rival CEOs":'Rakip CEO\'lar')],['ihale',(LANG_EN?"Tenders":'İhaleler')],['hi',(LANG_EN?"Public relations":'Halkla ilişkiler')],['sezon',(LANG_EN?"Seasons":'Mevsimler')]],
  stats:[['grafik',(LANG_EN?"Charts":'Grafikler')],['rakip',(LANG_EN?"Rival comparison":'Rakiplerle karşılaştırma')],['zaman',(LANG_EN?"Timeline":'Zaman çizelgesi')],['haber',(LANG_EN?"News archive":'Haber arşivi')],['odul',(LANG_EN?"Awards":'Ödüller')],['basarim',(LANG_EN?"Achievements":'Başarımlar')],['lider',(LANG_EN?"Leaderboard":'Liderlik tablosu')],['karne',(LANG_EN?"Report card":'Şirket karnesi')]],
  fin:[['genel',(LANG_EN?"Finance":'Finans')],['tablo',(LANG_EN?"Financial statements":'Mali tablolar')],['ekonomi',(LANG_EN?"Economy":'Ekonomi')],['kur',(LANG_EN?"Currency":'Döviz')],['hissedar',(LANG_EN?"Shareholders":'Hissedarlar')],['portfoy',(LANG_EN?"Share portfolio":'Hisse portföyü')],['rapor',(LANG_EN?"Annual report":'Faaliyet raporu')],['girisim',(LANG_EN?"Venture fund":'Girişim fonu')],['kurucu',(LANG_EN?"Founder":'Kurucu')],['kurul',(LANG_EN?"Board":'Yönetim kurulu')],['dusmanca',(LANG_EN?"Hostile takeover":'Düşmanca devralma')],['surdur',(LANG_EN?"Sustainability":'Sürdürülebilirlik')],['devlet',(LANG_EN?"Government & regulation":'Devlet ve regülasyon')],['kayit',(LANG_EN?"Save & settings":'Kayıt ve ayarlar')]],
};
const curSub=tab=>{const k=UI.sub&&UI.sub[tab];return SUBTABS[tab].some(x=>x[0]===k)?k:SUBTABS[tab][0][0];};
function subBadges(tab){const b={};
  if(tab==='team'){if(G.tw&&G.tw.offers.length)b.yetenek=G.tw.offers.length;if(strikeOn())b.sendika='!';if((G.acqs||[]).some(a=>a.mode===null||a.keys.length))b.devralma='!';if((G.internCands||[]).length)b.egitim=G.internCands.length;}
  if(tab==='res'&&(G.cases||[]).some(k=>k.role==='def'))b.patent='!';
  if(tab==='res'&&G.ipl&&G.ipl.req.length)b.lisans=G.ipl.req.length;
  if(tab==='infra'&&G.cyber&&cyberDown())b.guvenlik='!';
  if(tab==='market'&&(G.offers||[]).length)b.ortak=G.offers.length;
  if(tab==='market'&&G.soc){const n=G.soc.posts.filter(x=>x.q&&!x.r).length;if(n)b.sosyal=n;}
  if(tab==='market'&&G.prc&&prAct().length)b.hi=prAct().length;
  if(tab==='market'&&G.tnd&&G.tnd.open.some(o=>!o.bid&&tndProds(o).length))b.ihale=G.tnd.open.filter(o=>!o.bid&&tndProds(o).length).length;
  if(tab==='stats'&&G.aw&&G.aw.noms&&awMine().length&&!G.aw.camp)b.odul='!';
  if(tab==='fin'){if(G.bm&&G.bm.cur&&!G.bm.cur.res)b.kurul='!';if(G.hto&&G.hto.them)b.dusmanca='!';if(G.ar&&G.ar.draft)b.rapor='!';if(G.vc&&G.vc.port.some(h=>h.pend))b.girisim='!';if(G.gov&&(G.gov.at.length||banOn()))b.devlet='!';if(G.life&&boardOn()&&!founderSafe()&&G.life.conf<30)b.kurucu='!';}
  return b;}
function subBar(tab){return '';}
function subBarOld(tab){const cur=curSub(tab),b=subBadges(tab);
  return (LANG_EN?`<div class="subtabs" role="tablist" aria-label="${TABS.find(x=>x[0]===tab)[1]} sections">${SUBTABS[tab].filter(([k])=>!(k==='devralma'&&!(G.acqs||[]).length)).map(([k,n])=>`<button class="subtab" role="tab" aria-selected="${cur===k}" data-act="sub" data-tab="${tab}" data-k="${k}">${n}${b[k]!=null?`<span class="badge">${b[k]}</span>`:''}</button>`).join('')}</div>`:`<div class="subtabs" role="tablist" aria-label="${TABS.find(x=>x[0]===tab)[1]} bölümleri">${SUBTABS[tab].filter(([k])=>!(k==='devralma'&&!(G.acqs||[]).length)).map(([k,n])=>`<button class="subtab" role="tab" aria-selected="${cur===k}" data-act="sub" data-tab="${tab}" data-k="${k}">${n}${b[k]!=null?`<span class="badge">${b[k]}</span>`:''}</button>`).join('')}</div>`);}


