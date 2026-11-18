/* ============================== STOCK MARKET ============================== */
function initIPO(){ceoXP(150,(LANG_EN?"IPO":'Halka arz'));const mc=valuation();G.pub={shares:1e8,price:mc/1e8,sent:1,hist:[mc/1e8],q:[],qProfit:0,qMonths:0,exp:null,miss:0,start:G.day};shInit(G.pub);}
const marketCap=()=>G.pub?G.pub.price*G.pub.shares:valuation();
function stockDaily(){const p=G.pub;if(!p)return;
  p.sent=clamp(p.sent*Math.exp(rnd(-0.012,0.012))+(1-p.sent)*0.008,0.35,2.5);
  p.price=Math.max(0.01,valuation()*p.sent/p.shares);
  if(G.day%7===0){p.hist.push(p.price);if(p.hist.length>156)p.hist.shift();}}
function stockMonthly(profit){
  const p=G.pub;if(!p)return;p.qProfit+=profit;p.qMonths++;if(p.qMonths<3)return;
  const act=p.qProfit,exp=p.exp,dt=dateOf(G.day-1),l=(LANG_EN?`Q${Math.floor(dt.getMonth()/3)+1} ${dt.getFullYear()}`:`${Math.floor(dt.getMonth()/3)+1}. çeyrek ${dt.getFullYear()}`);p.qProfit=0;p.qMonths=0;shQuarter(act,l);
  if(exp==null){p.exp=(act>0?act*1.06:act*0.85)*shGuideMult(act);p.q.push({l,exp:null,act,chg:0});news((LANG_EN?`First quarterly results are out: ${money(act)} profit. Analysts expect ${money(p.exp)} next quarter.`:`İlk çeyrek sonuçları açıklandı: ${money(act)} kâr. Analistler sonraki çeyrek için ${money(p.exp)} bekliyor.`),'',true);return;}
  const sur=(act-exp)/Math.max(Math.abs(exp),2e5),chg=clamp(sur*0.35,-0.15,0.12)+rnd(-0.02,0.02);
  p.sent=clamp(p.sent*(1+chg),0.35,2.5);p.q.push({l,exp,act,chg});if(p.q.length>12)p.q.shift();
  if(act>=exp){p.miss=0;news((LANG_EN?`Quarterly results beat expectations: ${money(act)} (expected ${money(exp)}). The stock ${chg>=0?"rose":"fell"} ${pct(Math.abs(chg),1)}.`:`Çeyrek sonuçları beklentiyi aştı: ${money(act)} (beklenti ${money(exp)}). Hisse ${pct(Math.abs(chg),1)} ${chg>=0?'yükseldi':'düştü'}.`),'good',true);}
  else{p.miss++;news((LANG_EN?`Quarterly results missed expectations: ${money(act)} (expected ${money(exp)}). The stock ${chg>=0?"rose":"fell"} ${pct(Math.abs(chg),1)}.`:`Çeyrek sonuçları beklentinin altında: ${money(act)} (beklenti ${money(exp)}). Hisse ${pct(Math.abs(chg),1)} ${chg>=0?'yükseldi':'düştü'}.`),'bad',true);
    if(p.miss>=2&&!G.pending)triggerChoice('board',{});}
  p.exp=(act>0?act*rnd(1.03,1.08):act*0.85)*shGuideMult(act);
}

