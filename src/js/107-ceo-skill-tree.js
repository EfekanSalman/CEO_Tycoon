/* ============================== CEO SKILL TREE ============================== */
const newCs=()=>({xp:0,lvl:1,pts:1,own:{},log:[],tot:0});
const CS_BR=[
  {k:'v',n:(LANG_EN?"Visionary":'Vizyoner'),c:'var(--pt-res)',ic:'◆',d:(LANG_EN?"Product & research":'Ürün ve araştırma'),nodes:[
    {id:'v1',n:(LANG_EN?"Product instinct":'Ürün sezgisi'),d:(LANG_EN?"New products get +0.2 press score.":'Yeni ürünlerin basın puanı +0,2.')},
    {id:'v2',n:(LANG_EN?"Rapid prototyping":'Hızlı prototip'),d:(LANG_EN?"Development projects are 5% faster.":'Geliştirme projeleri %5 daha hızlı.')},
    {id:'v3',n:(LANG_EN?"Research passion":'Araştırma tutkusu'),d:(LANG_EN?"Research speed +10%.":'Araştırma hızı +%10.')},
    {id:'v4',n:(LANG_EN?"Seeing the future":'Geleceği görmek'),d:(LANG_EN?"Much lighter cost penalty for early research.":'Erken araştırmanın maliyet cezası çok daha hafif.')}]},
  {k:'l',n:(LANG_EN?"Leader":'Lider'),c:'var(--pt-soft)',ic:'☺',d:(LANG_EN?"Team & culture":'Ekip ve kültür'),nodes:[
    {id:'l1',n:(LANG_EN?"Inspiring":'İlham veren'),d:(LANG_EN?"Morale target +3 for all employees.":'Bütün çalışanların moral hedefi +3.')},
    {id:'l2',n:(LANG_EN?"Talent magnet":'Yetenek mıknatısı'),d:(LANG_EN?"Chance of rivals poaching your employees −30%.":'Rakiplerin çalışanlarını ayartma ihtimali −%30.')},
    {id:'l3',n:(LANG_EN?"Crisis manager":'Kriz yöneticisi'),d:(LANG_EN?"PR crises start with 15% less buzz.":'Halkla ilişkiler krizleri %15 daha düşük gündemle başlar.')},
    {id:'l4',n:(LANG_EN?"Culture architect":'Kültür mimarı'),d:(LANG_EN?"Salary costs −3%; people want to work for you.":'Maaş giderleri −%3; insanlar senin için çalışmak istiyor.')}]},
  {k:'m',n:(LANG_EN?"Marketer":'Pazarlamacı'),c:'var(--pt-mkt)',ic:'✦',d:(LANG_EN?"Brand & sales":'Marka ve satış'),nodes:[
    {id:'m1',n:(LANG_EN?"Stage charisma":'Sahne karizması'),d:(LANG_EN?"Crowd excitement starts +8 on the launch stage.":'Lansman sahnesinde salon coşkusu +8 başlar.')},
    {id:'m2',n:(LANG_EN?"Storyteller":'Hikâye anlatıcı'),d:(LANG_EN?"Ad campaigns are 8% more effective.":'Reklam kampanyaları %8 daha etkili.')},
    {id:'m3',n:(LANG_EN?"Social media pro":'Sosyal medya ustası'),d:(LANG_EN?"Witty replies are 10% more likely to go viral.":'Esprili cevapların viral olma şansı +%10.')},
    {id:'m4',n:(LANG_EN?"Global vision":'Küresel vizyon'),d:(LANG_EN?"Regional campaigns are 30% cheaper.":'Bölge kampanyaları %30 daha ucuz.')}]},
  {k:'f',n:(LANG_EN?"Financier":'Finansçı'),c:'var(--ok)',ic:'$',d:(LANG_EN?"Money & investors":'Para ve yatırımcılar'),nodes:[
    {id:'f1',n:(LANG_EN?"Budget discipline":'Bütçe disiplini'),d:(LANG_EN?"Loan interest 1 point lower per year.":'Kredi faizi yıllık 1 puan düşük.')},
    {id:'f2',n:(LANG_EN?"Investor relations":'Yatırımcı ilişkileri'),d:(LANG_EN?"Valuation +8% in funding rounds.":'Yatırım turlarında değerleme +%8.')},
    {id:'f3',n:(LANG_EN?"Master negotiator":'Pazarlık ustası'),d:(LANG_EN?"Supplier part prices −4%.":'Tedarikçi parça fiyatları −%4.')},
    {id:'f4',n:(LANG_EN?"Wall Street darling":'Borsanın gözdesi'),d:(LANG_EN?"Board confidence +0.3 every month; if public, share price sensitivity rises.":'Her ay yönetim kurulu güveni +0,3; halka açıksan hisse duyarlılığı artar.')}]},
  {k:'o',n:(LANG_EN?"Operator":'Operasyoncu'),c:'var(--pt-hw)',ic:'▣',d:(LANG_EN?"Manufacturing & quality":'Üretim ve kalite'),nodes:[
    {id:'o1',n:(LANG_EN?"Lean manufacturing":'Yalın üretim'),d:(LANG_EN?"Factory maintenance costs −10%.":'Fabrika bakım giderleri −%10.')},
    {id:'o2',n:(LANG_EN?"Quality obsession":'Kalite saplantısı'),d:(LANG_EN?"New products ship with 15% fewer bugs.":'Yeni ürünler %15 daha az hatayla çıkar.')},
    {id:'o3',n:(LANG_EN?"Trade diplomacy":'Ticaret diplomasisi'),d:(LANG_EN?"Customs duties are halved.":'Gümrük vergileri yarıya iner.')},
    {id:'o4',n:(LANG_EN?"Automation vision":'Otomasyon vizyonu'),d:(LANG_EN?"Factories are built 25% faster.":'Fabrikalar %25 daha hızlı kurulur.')}]}];
const CSN=Object.fromEntries(CS_BR.flatMap(b=>b.nodes.map((n,i)=>[n.id,{...n,b,i,cost:i===3?2:1}])));
const ceoSk=id=>!!(G&&G.cs&&G.cs.own[id]);
const csNeed=l=>Math.round(50*Math.pow(l,1.15));
function ceoXP(n,why){const S=G&&G.cs;if(!S||!(n>0))return;n=Math.round(n);S.xp+=n;S.tot+=n;if(S.log[0]&&S.log[0].why===why){S.log[0].n+=n;S.log[0].k=(S.log[0].k||1)+1;S.log[0].d=G.day;}else{S.log.unshift({d:G.day,n,why});if(S.log.length>14)S.log.pop();}
  let up=0;while(S.xp>=csNeed(S.lvl)){S.xp-=csNeed(S.lvl);S.lvl++;S.pts++;up++;}
  if(up){news((LANG_EN?`CEO level ${S.lvl}! You earned ${up>1?up+" new skill points":"a new skill point"}.`:`CEO seviyesi ${S.lvl}! ${up>1?up+' yeni yetenek puanı':'Yeni bir yetenek puanı'} kazandın.`),'good',true);tl('ach',(LANG_EN?`CEO level ${S.lvl}`:`CEO seviye ${S.lvl}`));}}
function csCan(id){const N=CSN[id],S=G.cs;if(!N||S.own[id])return false;if(N.i>0&&!S.own[N.b.nodes[N.i-1].id])return false;return S.pts>=N.cost;}
const csResetCost=()=>Math.round(250e3*infl()/1000)*1000;
function vSkills(){const S=G.cs,need=csNeed(S.lvl),spent=Object.keys(S.own).reduce((a,k)=>a+CSN[k].cost,0);
  const col=B=>`<div class="cs-col" style="--c:${B.c}"><div class="cs-hd"><span class="cs-ic" aria-hidden="true">${B.ic}</span><div><b>${B.n}</b><div class="small muted">${B.d}</div></div><span class="small muted num">${B.nodes.filter(n=>S.own[n.id]).length}/4</span></div>
    ${B.nodes.map((n,i)=>{const own=!!S.own[n.id],can=csCan(n.id),prevOk=i===0||S.own[B.nodes[i-1].id],c=CSN[n.id].cost;
      return `${i?`<div class="cs-link${own?' on':''}" aria-hidden="true"></div>`:''}<div class="cs-node${own?' own':can?' can':prevOk?' wait':' lock'}"><div class="row between" style="gap:8px;align-items:flex-start"><b>${n.n}</b><span class="small muted num">${own?'✓':c+(LANG_EN?" pts":' puan')}</span></div><div class="small">${n.d}</div>
        ${own?'':can?(LANG_EN?`<button class="btn sm primary" data-act="cslearn" data-k="${n.id}">Learn</button>`:`<button class="btn sm primary" data-act="cslearn" data-k="${n.id}">Öğren</button>`):`<span class="small muted">${prevOk?(LANG_EN?"Not enough points":'Yeterli puan yok'):(LANG_EN?"Requires: ":'Önce: ')+B.nodes[i-1].n}</span>`}</div>`;}).join('')}</div>`;
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>CEO skills${helpBtn('ceoskill')}</h2><span class="sub">Founder of ${esc(G.name)}</span></div>
    <div class="dkpis"><div class="dkpi"><span class="dk-l">Level</span><b>${S.lvl}</b><span class="dk-s muted">${num(S.tot)} XP total</span></div>
      <div class="dkpi"><span class="dk-l">Next level</span><b class="num">${num(S.xp)}<small>/${num(need)}</small></b><div class="bar" style="margin-top:6px"><i style="width:${(S.xp/need*100).toFixed(1)}%"></i></div></div>
      <div class="dkpi"><span class="dk-l">Unspent points</span><b class="${S.pts?'pos':''}">${S.pts}</b><span class="dk-s muted">${spent} points used</span></div>
      <div class="dkpi"><span class="dk-l">Skills</span><b>${Object.keys(S.own).length}<small>/20</small></b><span class="dk-s muted">top tiers cost 2 points</span></div></div>
    <div class="pb small muted" style="border-top:1px solid var(--line)">Earn experience by launching products, finishing research, having profitable months, unlocking achievements, winning awards and growing your company. Each level grants a skill point; skills in each branch unlock in order.</div></section>
  <div class="cs-tree">${CS_BR.map(col).join('')}</div>
  <div class="grid"><section class="panel"><div class="ph"><h2>Recent experience</h2></div>${S.log.length?`<ul class="alerts">${S.log.map(l=>`<li><span class="chip st-ok num">+${l.n}</span><span>${esc(l.why)}${l.k>1?` <span class="muted">×${l.k}</span>`:''} <span class="muted small">· ${fmtDate(l.d)}</span></span></li>`).join('')}</ul>`:"<div class=\"empty\">You haven't earned any experience yet.</div>"}</section>
    <section class="panel"><div class="ph"><h2>Rethink</h2></div><div class="pb col" style="gap:8px"><div class="small muted">Work with an executive coach to reset all your skills and get your points back.</div><div><button class="btn sm" data-act="csreset" ${!spent||G.cash<csResetCost()?'disabled':''}>Reset skills · ${money(csResetCost())}</button></div></div></section></div>`:`<section class="panel"><div class="ph"><h2>CEO yetenekleri${helpBtn('ceoskill')}</h2><span class="sub">${esc(G.name)} kurucusu</span></div>
    <div class="dkpis"><div class="dkpi"><span class="dk-l">Seviye</span><b>${S.lvl}</b><span class="dk-s muted">toplam ${num(S.tot)} deneyim</span></div>
      <div class="dkpi"><span class="dk-l">Sonraki seviye</span><b class="num">${num(S.xp)}<small>/${num(need)}</small></b><div class="bar" style="margin-top:6px"><i style="width:${(S.xp/need*100).toFixed(1)}%"></i></div></div>
      <div class="dkpi"><span class="dk-l">Harcanmamış puan</span><b class="${S.pts?'pos':''}">${S.pts}</b><span class="dk-s muted">${spent} puan kullanıldı</span></div>
      <div class="dkpi"><span class="dk-l">Yetenek</span><b>${Object.keys(S.own).length}<small>/20</small></b><span class="dk-s muted">son kademeler 2 puan</span></div></div>
    <div class="pb small muted" style="border-top:1px solid var(--line)">Deneyim kazanmak için ürün çıkar, araştırma bitir, kârlı aylar geçir, başarım aç, ödül kazan ve şirketini büyüt. Her seviye bir yetenek puanı verir; her daldaki yetenekler sırayla açılır.</div></section>
  <div class="cs-tree">${CS_BR.map(col).join('')}</div>
  <div class="grid"><section class="panel"><div class="ph"><h2>Son deneyimler</h2></div>${S.log.length?`<ul class="alerts">${S.log.map(l=>`<li><span class="chip st-ok num">+${l.n}</span><span>${esc(l.why)}${l.k>1?` <span class="muted">×${l.k}</span>`:''} <span class="muted small">· ${fmtDate(l.d)}</span></span></li>`).join('')}</ul>`:'<div class="empty">Henüz deneyim kazanmadın.</div>'}</section>
    <section class="panel"><div class="ph"><h2>Yeniden düşün</h2></div><div class="pb col" style="gap:8px"><div class="small muted">Bir yönetim koçuyla çalışıp bütün yeteneklerini sıfırlayabilir, puanlarını geri alabilirsin.</div><div><button class="btn sm" data-act="csreset" ${!spent||G.cash<csResetCost()?'disabled':''}>Yetenekleri sıfırla · ${money(csResetCost())}</button></div></div></section></div>`);}

