/* ============================== TECH DEBT ============================== */
const TD_AP={fast:{n:(LANG_EN?"Fast":'Hızlı'),f:0.75,debt:40,d:(LANG_EN?"25% less workload; the product ships with high tech debt.":'İş yükü %25 az; ürün yüksek teknik borçla çıkar.')},bal:{n:(LANG_EN?"Balanced":'Dengeli'),f:1,debt:12,d:(LANG_EN?"Normal workload, moderate debt.":'Normal iş yükü, makul borç.')},solid:{n:(LANG_EN?"Robust":'Sağlam'),f:1.2,debt:0,d:(LANG_EN?"20% more workload; the product ships with clean code.":'İş yükü %20 fazla; ürün temiz kodla çıkar.')}};
const TD_POL=[0,0.1,0.2];
const tdOf=p=>p.debt||0;
const tdBug=p=>1+tdOf(p)/60;
const tdUpd=p=>1+tdOf(p)/150;
const tdLbl=d=>d>=70?[(LANG_EN?"Critical":'Kritik'),'neg']:d>=45?[(LANG_EN?"High":'Yüksek'),'warn']:d>=20?[(LANG_EN?"Medium":'Orta'),'']:[(LANG_EN?"Low":'Düşük'),'pos'];
function tdMonthly(){
  const pol=G.tdPol||0;let heavy=0;
  for(const p of myActive()){if(p.debt==null)p.debt=15;const sw=SW_CATS.includes(p.cat);
    p.debt=clamp(p.debt+(sw?0.7:0.25)*(hasTool('lint')?0.6:1)+(G.pace==='crunch'?1:0)-pol*8,0,100);
    if(p.debt>=60)heavy++;
    if(p.debt>=70&&Math.random()<0.05*(p.debt-60)/30){
      if(sw){p.units*=0.85;p.share*=0.85;if(p.sat!=null)p.sat=Math.max(0,p.sat-8);G.brand=clamp(G.brand-0.5,0,100);news((LANG_EN?`${p.name} was down for hours: its aging codebase couldn't handle the load. Some users left.`:`${p.name} saatlerce çöktü: eskiyen kod altyapısı yükü kaldıramadı. Kullanıcıların bir kısmı kaçtı.`),'bad',true);}
      else{if(p.sat!=null)p.sat=Math.max(0,p.sat-6);p.bugs=(p.bugs||0)+15;news((LANG_EN?`A serious bug surfaced in ${p.name}'s software; devices are freezing.`:`${p.name} yazılımında ciddi bir hata çıktı; cihazlar kilitleniyor.`),'bad',true);}}}
  if(heavy)for(const e of G.emps)if((e.role==='soft'||e.role==='hw')&&!e.founder)e.morale=clamp(e.morale-0.5*Math.min(2,heavy),0,100);
}
function vDebt(){
  const ps=myActive();if(!ps.length)return '';
  const avg=ps.reduce((a,p)=>a+tdOf(p),0)/ps.length,crit=ps.filter(p=>tdOf(p)>=70).length,[al,ac]=tdLbl(avg);
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Tech debt${helpBtn('debt')}</h2><span class="sub">Average <b class="${ac}">${Math.round(avg)} · ${al}</b>${crit?` · <span class="neg">${crit} products critical</span>`:''}</span></div>
    <div class="pb col" style="gap:10px">
      <div class="row" style="gap:6px;flex-wrap:wrap;align-items:center"><span class="small"><b>Debt paydown time:</b></span>${TD_POL.map(v=>`<button class="btn sm ${(G.tdPol||0)===v?'primary':'ghost'}" data-act="tdpol" data-v="${v}">${v?`${v*100}% of engineer time`:"No"}</button>`).join('')}</div>
      <p class="small muted">Rushed launches, patchy minor updates and overtime pile up tech debt; in software, debt also grows on its own every month. As debt rises, bugs multiply, updates take longer and engineers' morale drops; above 70 a product can crash. Debt paydown time cuts every product's debt each month, but new projects slow down by the same share. For a single product, start a debt cleanup or a rewrite from the <b>Update</b> button in the Products table.</p></div></section>`:`<section class="panel"><div class="ph"><h2>Teknik borç${helpBtn('debt')}</h2><span class="sub">Ortalama <b class="${ac}">${Math.round(avg)} · ${al}</b>${crit?` · <span class="neg">${crit} ürün kritik</span>`:''}</span></div>
    <div class="pb col" style="gap:10px">
      <div class="row" style="gap:6px;flex-wrap:wrap;align-items:center"><span class="small"><b>Borç ödeme zamanı:</b></span>${TD_POL.map(v=>`<button class="btn sm ${(G.tdPol||0)===v?'primary':'ghost'}" data-act="tdpol" data-v="${v}">${v?`Mühendislerin zamanının %${v*100}'u`:'Yok'}</button>`).join('')}</div>
      <p class="small muted">Aceleyle çıkan ürünler, yamalı küçük güncellemeler ve fazla mesai teknik borç biriktirir; yazılımda borç her ay kendiliğinden de büyür. Borç arttıkça hatalar çoğalır, güncellemeler uzar, mühendislerin morali düşer; 70'in üstünde ürün çökebilir. Borç ödeme zamanı bütün ürünlerin borcunu her ay azaltır ama yeni projeler o oranda yavaşlar. Tek bir ürün için Ürünler tablosundaki <b>Güncelle</b> düğmesinden borç temizliği ya da yeniden yazım başlatabilirsin.</p></div></section>`);
}

