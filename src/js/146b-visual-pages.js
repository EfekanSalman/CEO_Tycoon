/* ============================== VISUAL PAGES: AR-GE / PAZAR / FİNANS (v178) ============================== */
const RES_IC='<svg viewBox="0 0 26 26"><path d="M10 3h6M11 3v7l-6 10a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-6-10V3"/><path d="M8 16h10"/></svg>';
const resCat=r=>(PAT_CAT[r.id]||[])[0]||null;
const resCC=r=>{const c=resCat(r);return c?deskCC(c):'var(--pt-res)';};
const resIcon=r=>{const c=resCat(r);return `<span class="rc-ic" aria-hidden="true">${c&&CAT_ICON[c]?CAT_ICON[c]:RES_IC}</span>`;};
/* bu araştırmanın açtığı (önkoşulu olduğu) araştırmalar */
const resUnlocks=r=>RES.filter(x=>(x.pre||[]).includes(r.id));
function resMeta(r,rp,done,act){const u=resUnlocks(r),days=!done&&!act&&rp>0?Math.ceil(resRP(r)/rp):null;
  return (days!=null?`<div class="small rc-days">${LANG_EN?'≈':'≈'} ${num(days)} ${LANG_EN?'days with your team':'gün (mevcut ekiple)'}</div>`:'')+(u.length?`<div class="rc-un"><span class="small muted">${LANG_EN?'Unlocks':'Açar'}:</span>${u.slice(0,4).map(x=>`<span class="rc-chip">${esc(x.n)}</span>`).join('')}${u.length>4?`<span class="small muted">+${u.length-4}</span>`:''}</div>`:'');}
/* şu anki araştırma: büyük halka, kalan süre, ne açtığı */
function resHero(actR,a,rp){
  if(!actR)return rp?`<div class="res-now idle small">${LANG_EN?'<b>Research is idle.</b> Your researchers are generating points that go unused; start a technology below.':'<b>Araştırma boşta.</b> Araştırmacıların puan üretiyor ama kullanılmıyor; aşağıdan bir teknoloji başlat.'}</div>`:`<div class="res-now idle small">${LANG_EN?'Hire a researcher in the Team section to do research.':'Araştırma yapmak için Ekip bölümünden bir araştırmacı işe al.'}</div>`;
  const f=a.p/actRP(),left=rp?Math.ceil((actRP()-a.p)/rp):null,u=resUnlocks(actR),cc=resCC(actR);
  const long=left!=null&&left>720;
  return `<div class="rhero" style="--cc:${cc}">${deskRing(f,cc,96,Math.round(f*100)+'%')}<div class="rh-b"><span class="small muted">${LANG_EN?'Now researching':'Şu an araştırılıyor'}</span><b class="rh-n">${resIcon(actR)}${esc(actR.n)}</b><span class="small">${esc(actR.d)}</span>
    <div class="rh-f"><span class="chip ${long?'st-warn':'r-res'}">${left==null?(LANG_EN?'No researchers':'Araştırmacı yok'):'≈ '+num(left)+(LANG_EN?' days':' gün')}</span>${long?`<span class="small warn">${LANG_EN?'Very slow: hire more researchers or pick something cheaper.':'Çok yavaş: araştırmacı al ya da daha ucuz bir şey seç.'}</span>`:''}</div>
    ${u.length?`<div class="rc-un"><span class="small muted">${LANG_EN?'Then unlocks':'Bitince açılır'}:</span>${u.slice(0,5).map(x=>`<span class="rc-chip">${esc(x.n)}</span>`).join('')}</div>`:''}</div></div>`;}
/* ---- Pazar: değer ligi (sen + rakipler, yatay çubuklar) ---- */
function marketLeague(){const live=liveComps(),me={id:'P',name:G.name,v:valuation()};
  const L=[me,...live.map(c=>({id:c.id,name:c.name,v:compVal(c)}))].sort((a,b)=>b.v-a.v),mx=Math.max(1,L[0].v),myR=L.findIndex(x=>x.id==='P')+1;
  const show=L.slice(0,10);if(myR>10)show.push(me);
  return `<section class="panel"><div class="ph"><h2>${LANG_EN?'Value league':'Değer ligi'}</h2><span class="sub">${LANG_EN?`You are #${myR} of ${L.length}`:`${L.length} şirket içinde ${myR}. sıradasın`}</span></div><div class="pb"><div class="mleague">${show.map(x=>{const rank=L.indexOf(x)+1,me2=x.id==='P';
    return `<div class="ml-row${me2?' me':''}"><span class="ml-r num">${rank}</span><span class="ml-n">${me2?`<b>${esc(x.name)}</b> <span class="chip st-ok">${LANG_EN?'you':'sen'}</span>`:esc(x.name)}</span><span class="ml-bar"><i style="width:${Math.max(1.5,x.v/mx*100).toFixed(1)}%;background:${ownerColor(x.id)}"></i></span><span class="ml-v num">${money(x.v)}</span></div>`;}).join('')}</div></div></section>`;}
/* kategoride oyuncunun sırası */
function mkMyRank(cat){const by={};for(const p of G.products)if(p.active&&p.cat===cat)by[p.owner]=(by[p.owner]||0)+p.share;const L=Object.entries(by).sort((a,b)=>b[1]-a[1]);const i=L.findIndex(x=>x[0]==='P');return i<0?null:{r:i+1,n:L.length};}
