/* ============================== QUANTUM ============================== */
const qDay=()=>!has('pqc')&&years()>=13&&G.products.some(p=>p.active&&p.cat==='qc'&&p.score/S('qc')>=1.1);
function qcMonthly(){
  if(!G.flags)G.flags={};
  if(!G.flags.qsup){const best=G.products.filter(p=>p.active&&p.cat==='qc').sort((a,b)=>b.score-a.score)[0];
    if(best&&best.score>=S('qc')*1.15&&(best.owner==='P'?has('qc3')||years()>=12:years()>=13)){G.flags.qsup=best.owner;if(best.owner==='P'){G.brand=clamp(G.brand+5,0,100);G.flags.qsupMe=true;tl('star',(LANG_EN?`Quantum supremacy: ${best.name}`:`Kuantum üstünlüğü: ${best.name}`));}
      news((LANG_EN?`Quantum supremacy achieved! ${best.owner==='P'?G.name:ownerName(best.owner)}'s ${best.name} system solved in minutes a calculation that would take the most powerful supercomputer years.`:`Kuantum üstünlüğü ilan edildi! ${best.owner==='P'?G.name:ownerName(best.owner)}'nin ${best.name} sistemi, en güçlü süper bilgisayarın yıllarca süreceği bir hesabı dakikalar içinde çözdü.`),best.owner==='P'?'good':'mkt',true);}}
  if(qDay()&&!G.flags.qday){G.flags.qday=true;news((LANG_EN?"\"Q-Day\" is approaching: powerful quantum computers are becoming able to break today's encryption. Cyberattacks will rise against companies without Post-Quantum Cryptography research.":'"Q Günü" yaklaşıyor: güçlü kuantum bilgisayarlar bugünkü şifrelemeyi kırabilir hâle geliyor. Kuantum Sonrası Şifreleme araştırması olmayan şirketlere siber saldırılar artacak.'),'bad',true);}
}

