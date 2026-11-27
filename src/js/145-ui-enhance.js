/* ============================== UI ENHANCE ============================== */
function uiEnhance(root){
  const base=UI.tab+':'+(SUBTABS[UI.tab]?curSub(UI.tab):''),pc=PREF.pcol||{};
  const mob=isMob()&&!['fin:rapor','fin:kayit'].includes(base.replace(/:$/,''));let pi=0;
  for(const sec of root.querySelectorAll('section.panel')){const ph=sec.firstElementChild;if(!ph||!ph.classList.contains('ph'))continue;const h=ph.querySelector('h2');if(!h)continue;
    const t=(h.textContent||'').replace(/\?\s*$/,'').trim();if(!t)continue;const k=base+':'+t,v=pc[k],col=v===1||v===true||(v==null&&mob&&pi>=2&&!sec.classList.contains('nm-panel'));pi++;
    const b=document.createElement('button');b.className='pcol-b';b.setAttribute('data-act','pcol');b.setAttribute('data-k',k);b.setAttribute('aria-expanded',String(!col));b.setAttribute('data-c',col?'1':'0');b.setAttribute('aria-label',(col?(LANG_EN?"Expand: ":'Aç: '):(LANG_EN?"Collapse: ":'Daralt: '))+t);b.innerHTML='<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3"/></svg>';
    ph.insertBefore(b,ph.firstChild);h.setAttribute('data-act','pcol');h.setAttribute('data-k',k);h.setAttribute('data-c',col?'1':'0');h.classList.add('pch');if(col)sec.classList.add('collapsed');}
  for(const el of [...root.querySelectorAll('.panel div.small.muted, .panel p.small.muted, .panel p.muted')]){
    if(el.closest('td,th,.kpi,.dkpi,.dcard,label,.tip,.opt,button,.ph,.proj,.bi-mk,.enc,.ar-letter'))continue;
    if(el.querySelector('button,input,select,a,details,table'))continue;
    const tx=(el.textContent||'').replace(/\s+/g,' ').trim();if(tx.length<170)continue;
    const m=tx.match(/^.{20,150}?[.!?](\s|$)/),first=m?m[0].trim():tx.slice(0,120).replace(/\s\S*$/,'')+'…';
    const d=document.createElement('details');d.className='tip'+(el.classList.contains('pb')?' pb':'');el.classList.remove('pb');if(el.getAttribute('style'))d.setAttribute('style',el.getAttribute('style'));el.removeAttribute('style');
    const su=document.createElement('summary'),sp=document.createElement('span');sp.className='tip-s';sp.textContent=first;const mo=document.createElement('b');mo.className='tip-m';mo.textContent=(LANG_EN?"More":'Devamı');su.append(sp,' ',mo);
    el.replaceWith(d);d.append(su,el);}
  let ti=0;for(const tb of root.querySelectorAll('table')){if(tb.classList.contains('pcards'))continue;/* kart görünümü kendi düzenini kurar (v175) */const ths=[...tb.querySelectorAll(':scope>thead>tr>th')];if(ths.length<5)continue;tb.classList.add('rt');ti++;
    const L=ths.map(x=>x.textContent.trim());let ri=0;const rows=[...tb.querySelectorAll(':scope>tbody>tr')],tk=base+':t'+ti,cut=mob&&rows.length>10&&!(UI.rtAll&&UI.rtAll[tk]);
    if(cut){rows.slice(8).forEach(r=>r.classList.add('rt-cut'));const tr=document.createElement('tr');tr.className='rt-full rt-showall';const td=document.createElement('td');td.colSpan=ths.length;const b=document.createElement('button');b.className='btn sm';b.setAttribute('data-act','rtall');b.setAttribute('data-k',tk);b.textContent=(LANG_EN?`Show ${rows.length-8} more rows`:`${rows.length-8} satır daha göster`);td.appendChild(b);tr.appendChild(td);tb.querySelector(':scope>tbody').appendChild(tr);}
    for(const tr of rows){const tds=[...tr.children];ri++;if(tds.some(td=>td.colSpan>1)){tr.classList.add('rt-full');continue;}let di=0,nx=0;
      tds.forEach((td,i)=>{if(i===0)td.classList.add('rt-h');else if(L[i]){td.setAttribute('data-l',L[i]);if(di++>=2&&!td.querySelector('button,select,input')){td.classList.add('rt-x');nx++;}}else td.classList.add('rt-a');});
      if(nx&&tds[0]){const key=base+':'+ti+':'+((tds[0].textContent||'').trim().slice(0,40)||ri),op=!!(UI.rtOpen&&UI.rtOpen[key]);if(op)tr.classList.add('rt-open');const b=document.createElement('button');b.className='rt-more';b.setAttribute('data-act','rtopen');b.setAttribute('data-k',key);b.setAttribute('aria-expanded',String(op));b.textContent=op?(LANG_EN?"Less":'Daha az'):(LANG_EN?`+${nx} details`:`+${nx} ayrıntı`);tds[0].appendChild(b);}}}
}
