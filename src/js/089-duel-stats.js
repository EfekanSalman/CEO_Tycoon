/* ============================== DUEL STATS ============================== */
/* Meydan okuma bitince şirketin özet profili skorla birlikte kaydedilir; her oyun yılı sonunda değerleme ara noktası tutulur.
   Düello tablosu oyuncuları değerlemenin yanında gelir, şehirler, mağazalar, fabrikalar, madenler, gayrimenkul, portföy ve medya bakımından da karşılaştırır. */
const DS_ROWS=[
  ['v',(LANG_EN?"Valuation":'Değerleme'),x=>money(x)],['rev',(LANG_EN?"Revenue, last 12 months":'Son 12 ay gelir'),x=>money(x)],['cp1',(LANG_EN?"Valuation, year 1":'1. yıl değerleme'),x=>money(x)],['cp2',(LANG_EN?"Valuation, year 2":'2. yıl değerleme'),x=>money(x)],
  ['pr',(LANG_EN?"Active products":'Aktif ürün'),x=>num(x)],['br',(LANG_EN?"Brand":'Marka'),x=>String(Math.round(x))],['emp',(LANG_EN?"Employee":'Çalışan'),x=>num(x)],
  ['ct',(LANG_EN?"Strong cities":'Güçlü şehir'),x=>num(x)],['sh',(LANG_EN?"Store":'Mağaza'),x=>num(x)],['fac',(LANG_EN?"Factories":'Fabrika'),x=>num(x)],['ln',(LANG_EN?"Production line":'Üretim hattı'),x=>num(x)],['mine',(LANG_EN?"Mines":'Maden'),x=>num(x)],
  ['re',(LANG_EN?"Real estate":'Gayrimenkul'),x=>money(x)],['pf',(LANG_EN?"Share portfolio":'Hisse portföyü'),x=>money(x)],['md',(LANG_EN?"Media audience":'Medya izleyicisi'),x=>num(x)]];
const DS_CT=0.6;
function dsSnap(){const ys=G.hist.slice(-12),C=G.chal||{},cp=C.cp||[];
  return {v:Math.round(valuation()),rev:Math.round(ys.reduce((a,h)=>a+(h.rev||0),0)),cp1:cp[0]!=null?cp[0]:null,cp2:cp[1]!=null?cp[1]:null,
    pr:myActive().length,br:Math.round(G.brand),emp:G.emps.length,
    ct:CITY.filter(c=>G.regions[c.r]&&G.regions[c.r].in&&cityAw(c)>=DS_CT).length,sh:G.shops?G.shops.list.length:0,
    fac:G.factories.length,ln:G.factories.reduce((a,f)=>a+(f.lines||0),0),mine:G.raw?Object.keys(G.raw.mine||{}).length:0,
    re:Math.round(reValue()),pf:Math.round(pfValue()),md:mdOn()?Math.round(G.md.aud):0};}
function dsMonthly(){if(!chalOn())return;const C=G.chal;C.cp=C.cp||[];
  for(let k=1;k<=2;k++)if(C.cp[k-1]==null&&G.day>=365*k){C.cp[k-1]=Math.round(valuation());
    if(isDuel(C.id)){const o=dsRivals(C.id.slice(2)).find(r=>r.s&&r.s['cp'+k]!=null);if(o)news((LANG_EN?`Year ${k} is over: your valuation is ${money(C.cp[k-1])}; the leaderboard's leader was worth ${money(o.s['cp'+k])} at this point.`:`${k}. yıl bitti: değerlemen ${money(C.cp[k-1])}; tablonun lideri bu noktada ${money(o.s['cp'+k])} değerindeydi.`),C.cp[k-1]>=o.s['cp'+k]?'good':'',true);}}}
/* tablodaki diğer oyuncular (kendin hariç), değerlemeye göre */
function dsRivals(c){return chalBoard('D-'+c).filter(r=>r.id!==LB.uid);}
function dsTable(L){const P=L.filter(r=>r.s).slice(0,4);if(!P.length)return '';
  const nm=r=>r.id===LB.uid||r.id==='me'?(LANG_EN?"You":'Sen'):(LB.names[r.id]||(LANG_EN?"Gamer":'Oyuncu'));
  const rows=DS_ROWS.filter(([k])=>P.some(r=>r.s[k]!=null&&r.s[k]!==0)).map(([k,n,f])=>{const vals=P.map(r=>r.s[k]),best=Math.max(...vals.filter(x=>x!=null));
    return `<tr><td>${esc(n)}</td>${vals.map(x=>`<td class="r num${x!=null&&x===best&&P.length>1&&best>0?' pos ds-best':''}">${x==null?'—':f(x)}</td>`).join('')}</tr>`;}).join('');
  return (LANG_EN?`<div class="tw ds-w"><table class="ds-t"><thead><tr><th>Comparison</th>${P.map(r=>`<th class="r${r.id===LB.uid||r.id==='me'?' ds-me':''}">${esc(nm(r))}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
    <p class="small muted">Strong cities: cities in regions you have entered where your awareness is ${Math.round(DS_CT*100)}% or higher. The best value in each row is highlighted.</p>`:`<div class="tw ds-w"><table class="ds-t"><thead><tr><th>Karşılaştırma</th>${P.map(r=>`<th class="r${r.id===LB.uid||r.id==='me'?' ds-me':''}">${esc(nm(r))}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
    <p class="small muted">Güçlü şehir: bölgesine girdiğin ve bilinirliğin %${Math.round(DS_CT*100)} ya da üstünde olan şehirler. Her satırda en iyi değer vurgulanır.</p>`);}
/* oyun sırasında: son tamamlanan yılda tablonun lideriyle karşılaştırma */
function dsGhost(){if(!chalOn()||!isDuel(G.chal.id))return '';const C=G.chal,k=(C.cp||[]).length;if(!k)return '';
  const o=dsRivals(C.id.slice(2)).find(r=>r.s&&r.s['cp'+k]!=null);if(!o)return '';const me=C.cp[k-1],ot=o.s['cp'+k];
  return (LANG_EN?`<span class="small">Year ${k}: you <b class="num ${me>=ot?'pos':'neg'}">${money(me)}</b> · leader <b class="num">${money(ot)}</b></span>`:`<span class="small">${k}. yıl: sen <b class="num ${me>=ot?'pos':'neg'}">${money(me)}</b> · lider <b class="num">${money(ot)}</b></span>`);}
