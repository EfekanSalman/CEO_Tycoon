/* ============================== DIFFICULTY ============================== */
const DIFF_OPTS={
  cash:{n:(LANG_EN?"Starting money":'Başlangıç parası'),o:[[0.5,(LANG_EN?"Low":'Az')],[1,(LANG_EN?"Normal":'Normal')],[2,(LANG_EN?"High":'Bol')],[4,(LANG_EN?"Very high":'Çok bol')]]},
  tech:{n:(LANG_EN?"Rival strength":'Rakip gücü'),o:[[0.92,(LANG_EN?"Weak":'Zayıf')],[1,(LANG_EN?"Normal":'Normal')],[1.07,(LANG_EN?"Strong":'Güçlü')],[1.14,(LANG_EN?"Very strong":'Çok güçlü')]]},
  aggr:{n:(LANG_EN?"Rival aggression":'Rakip saldırganlığı'),o:[[-0.2,(LANG_EN?"Peaceful":'Barışçıl')],[0,(LANG_EN?"Normal":'Normal')],[0.2,(LANG_EN?"Aggressive":'Saldırgan')]]},
  ev:{n:(LANG_EN?"Crisis and event frequency":'Kriz ve olay sıklığı'),o:[[0.25,(LANG_EN?"Low":'Az')],[0.42,(LANG_EN?"Normal":'Normal')],[0.6,(LANG_EN?"Frequent":'Sık')]]},
  dem:{n:(LANG_EN?"Market demand":'Pazar talebi'),o:[[1.2,(LANG_EN?"High":'Yüksek')],[1,(LANG_EN?"Normal":'Normal')],[0.85,(LANG_EN?"Low":'Düşük')]]},
  px:{n:(LANG_EN?"Part costs":'Parça maliyetleri'),o:[[0.85,(LANG_EN?"Cheap":'Ucuz')],[1,(LANG_EN?"Normal":'Normal')],[1.2,(LANG_EN?"Expensive":'Pahalı')]]},
};
const DIFFS={easy:{n:(LANG_EN?"Easy":'Kolay'),cash:2,tech:0.92,aggr:-0.2,ev:0.25,dem:1.2,px:0.85},normal:{n:(LANG_EN?"Normal":'Normal'),cash:1,tech:1,aggr:0,ev:0.42,dem:1,px:1},hard:{n:(LANG_EN?"Hard":'Zor'),cash:0.5,tech:1.07,aggr:0.2,ev:0.6,dem:0.85,px:1.2}};
function curDiff(){return UI.diffK==='custom'?{...(UI.diffC||DIFFS.normal),n:(LANG_EN?"Custom":'Özel ayar')}:DIFFS[UI.diffK||'normal'];}
function applyDiff(d){
  G.diff={...d};G.mods=G.mods||{};G.cash=Math.round(G.cash*d.cash);
  G.mods.px=(G.mods.px||1)*d.px;for(const c in G.px)G.px[c]*=d.px;G.mods.dem=(G.mods.dem||1)*d.dem;
  G.mods.ev=clamp((G.mods.ev||0.42)*d.ev/0.42,0.1,0.9);G.mods.aggr=(G.mods.aggr||0)+d.aggr;G.mods.tech=d.tech;
  for(const c of G.comps){c.tech=clamp(c.tech*d.tech,0.7,1.45);c.aggr=clamp(c.aggr+d.aggr,0.05,0.95);}
}
function vDiffPick(){
  const k=UI.diffK||'normal',d=curDiff();
  const pres=[['easy',(LANG_EN?"Easy":'Kolay')],['normal',(LANG_EN?"Normal":'Normal')],['hard',(LANG_EN?"Hard":'Zor')],['custom',(LANG_EN?"Custom":'Özel ayar')]].map(([id,n])=>`<button class="btn sm ${k===id?'primary':''}" data-act="diffset" data-k="${id}">${n}</button>`).join('');
  const custom=k==='custom'?`<div class="col" style="gap:6px">${Object.entries(DIFF_OPTS).map(([p,x])=>`<div class="row between small"><span>${x.n}</span><span class="row" style="gap:4px">${x.o.map(([v,l],i)=>`<button class="btn sm ${d[p]===v?'primary':''}" data-act="diffopt" data-p="${p}" data-i="${i}">${l}</button>`).join('')}</span></div>`).join('')}</div>`
    :`<div class="small muted">${k==='easy'?(LANG_EN?"2x starting money, weak and peaceful rivals, few crises, high demand, cheap parts.":'2 kat başlangıç parası, zayıf ve barışçıl rakipler, az kriz, yüksek talep, ucuz parçalar.'):k==='hard'?(LANG_EN?"Half the starting money, strong and aggressive rivals, frequent crises, low demand, expensive parts.":'Yarı başlangıç parası, güçlü ve saldırgan rakipler, sık kriz, düşük talep, pahalı parçalar.'):(LANG_EN?"The balance the game was designed for.":'Oyunun tasarlandığı denge.')}</div>`;
  return (LANG_EN?`<div class="col" style="gap:8px;border:1.5px solid var(--line);padding:10px 12px"><div class="row between"><b>Difficulty</b><span class="row" style="gap:4px">${pres}</span></div>${custom}
    <div class="row between small"><span>Tutorial <span class="muted">(step-by-step guide for new players)</span></span><button class="btn sm ${UI.tutPref!==false?'primary':''}" data-act="tutpref">${UI.tutPref!==false?"On":"Off"}</button></div></div>`:`<div class="col" style="gap:8px;border:1.5px solid var(--line);padding:10px 12px"><div class="row between"><b>Zorluk</b><span class="row" style="gap:4px">${pres}</span></div>${custom}
    <div class="row between small"><span>Öğretici <span class="muted">(yeni oyuncular için adım adım rehber)</span></span><button class="btn sm ${UI.tutPref!==false?'primary':''}" data-act="tutpref">${UI.tutPref!==false?'Açık':'Kapalı'}</button></div></div>`);
}


