/* ============================== RIVAL MOVES ============================== */
const roundP=(cat,v)=>SUBP(cat)?Math.round(v*100)/100:Math.max(1,Math.round(v));
/* fiyat savaşı indirimi 90 gün sonra geri alınır (fiyat bu arada elle değiştirilmediyse). Eskiden kalıcıydı: tuzak taramasında
   bu seçenek bir yılda ortalama 8M kaybettiriyordu (186 kararda en iyi seçenek yalnızca 27 kez). */
function pwRestore(){for(const p of myActive()){const b=p.pwBack;if(!b||G.day<b.until)continue;if(p.price===b.cut){p.price=b.p;news((LANG_EN?`${p.name}: the price-war discount has ended; the price is now ${money(p.price)}.`:`${p.name}: fiyat savaşı indirimi bitti, fiyat ${money(p.price)} oldu.`));}p.pwBack=null;}}
function rivalMoves(){pwRestore();
  if(G.pending||G.over||G.day<240||G.day<(G.rivalCool||0))return;
  const share={};for(const p of myActive())share[p.cat]=(share[p.cat]||0)+p.share;
  const live=liveComps();
  for(const c of live)c.threat=c.focus.reduce((a,f)=>a+(share[f]||0),0);
  const val=marketCap();
  if(val>3e7&&Math.random()<0.035){const b=live.filter(c=>c.cash>val*1.3&&c.profit>0).sort((a,b)=>b.cash-a.cash)[0];
    if(b){triggerChoice('buyout',{cid:b.id,offer:Math.round(val*rnd(1.3,1.7))});return;}}
  for(const c of live)c.threat*=(hasDeal(c.id)?0.3:1)*(1-clamp(relOf(c),-50,60)/150)*(ceoPact(c)?0:1);
  const cands=live.filter(c=>c.threat>0.04);if(!cands.length)return;
  const c=cands.sort((a,b)=>b.threat*b.aggr-a.threat*a.aggr)[0];
  if(Math.random()>Math.min(0.3,c.threat*c.aggr*1.2))return;
  G.rivalCool=G.day+75;
  const r=Math.random(),mine=myActive().filter(p=>c.focus.includes(p.cat));
  if(r<0.4){const m=mine.filter(p=>CATS[p.cat].ref>0).sort((a,b)=>b.share-a.share)[0];
    const rp=m&&G.products.filter(p=>p.active&&p.owner===c.id&&p.cat===m.cat).sort((a,b)=>b.score-a.score)[0];
    if(m&&rp){rp.price=roundP(rp.cat,rp.price*0.8);triggerChoice('pricewar',{cid:c.id,mine:m.id,rp:rp.id});return;}}
  if(r<0.7){const m=mine.sort((a,b)=>b.share-a.share)[0];
    if(m&&c.cash>devCost(m.cat,c)){aiLaunch(c,m.cat);const np=G.products[G.products.length-1];np.score=m.score*rnd(0.95,1.04);
      if(CATS[m.cat].ref)np.price=roundP(m.cat,m.price*rnd(0.85,0.95));
      news((LANG_EN?`${c.name} launched ${np.name}, a cheaper product very similar to ${m.name}.`:`${c.name}, ${m.name} ürününe çok benzeyen ${np.name} ürününü daha ucuza çıkardı.`),'bad',true);return;}}
  const targets=G.emps.filter(e=>!e.founder&&!e.leave).sort((a,b)=>b.skill-a.skill).slice(0,rint(1,3));
  if(targets.length&&G.emps.length>4&&G.tw){news((LANG_EN?`${c.name} is going after your team: it offered high salaries to ${targets.length} of your employees.`:`${c.name} ekibine saldırıyor: ${targets.length} çalışanına yüksek maaş teklif etti.`),'bad',true);for(const e of targets)twOffer(c,e,rnd(1.35,1.5));}
}
const aggrChip=c=>c.aggr>0.65?(LANG_EN?"<span class=\"chip st-bad\">Aggressive</span>":'<span class="chip st-bad">Saldırgan</span>'):c.aggr>0.4?(LANG_EN?"<span class=\"chip st-warn\">Balanced</span>":'<span class="chip st-warn">Dengeli</span>'):(LANG_EN?"<span class=\"chip st-mute\">Cautious</span>":'<span class="chip st-mute">Temkinli</span>');
const RIVAL_EVENTS=[
  {id:'pricewar',w:0,choice:true,cond:()=>false,
    view:d=>{const c=comp(d.cid),m=prod(d.mine),r=prod(d.rp);return {t:(LANG_EN?"Price war":'Fiyat savaşı'),b:(LANG_EN?`${c?c.name:"A rival"} cut the price of ${r?r.name:"its product"} by 20%${r?' ('+money(r.price)+')':''}, directly targeting ${m?m.name:"your product"}.`:`${c?c.name:'Bir rakip'}, ${r?r.name:'ürününün'} fiyatını %20 indirdi${r?' ('+money(r.price)+')':''} ve doğrudan ${m?m.name:'senin ürününü'} hedef aldı.`),
      o:[{t:(LANG_EN?"Cut your price by 15% for 90 days":'90 gün fiyatını %15 düşür'),d:(LANG_EN?`You keep your market share but your unit margin shrinks; the price returns to normal after 90 days.${m?" Discounted price "+money(roundP(m.cat,m.price*0.85))+'.':''}`:`Pazar payını korursun, birim kârın azalır; 90 gün sonra fiyat eskiye döner.${m?' İndirimli fiyat '+money(roundP(m.cat,m.price*0.85))+'.':''}`)},
        {t:(LANG_EN?`Launch a counter-campaign (${money(m?CATS[m.cat].camp*infl()*0.5:0)})`:`Karşı kampanya başlat (${money(m?CATS[m.cat].camp*infl()*0.5:0)})`),d:(LANG_EN?"You hit back with ads for 45 days.":'45 gün boyunca reklamla karşılık verirsin.')},
        {t:(LANG_EN?"Compete on quality, hold the price":'Kaliteyle yarış, fiyatı koru'),d:(LANG_EN?"Your brand image stays strong, but you may lose market share.":'Marka algın güçlü kalır ama pazar payı kaybedebilirsin.')}]};},
    pick(d,i){const m=prod(d.mine),c=comp(d.cid);if(!m)return;
      if(i===0){const p0=m.price;m.price=roundP(m.cat,m.price*0.85);m.pwBack={p:p0,cut:m.price,until:G.day+90};news((LANG_EN?`${m.name} is priced at ${money(m.price)} for 90 days. The price war is on.`:`${m.name} fiyatı 90 gün için ${money(m.price)} oldu. Fiyat savaşı başladı.`));}
      else if(i===1){spend(CATS[m.cat].camp*infl()*0.5,'other');m.camp=G.day+45;news((LANG_EN?`Counter-campaign launched for ${m.name}.`:`${m.name} için karşı kampanya başladı.`));}
      else{G.brand=clamp(G.brand+0.5,0,100);news((LANG_EN?`You didn't answer the discount from ${c?c.name:"your rival"} with a price cut.`:`${c?c.name:'Rakibin'} indirimine fiyat kırarak karşılık vermedin.`));}}},
  {id:'raid',w:0,choice:true,cond:()=>false,
    view:d=>{const c=comp(d.cid),es=d.ids.map(id=>G.emps.find(e=>e.id===id)).filter(Boolean);
      return {t:(LANG_EN?"Talent poaching":'Yetenek avı'),b:(LANG_EN?`${c?c.name:"A rival"} offered ${es.length} people on your team 40% higher pay: ${es.map(e=>`${e.name} (${levelTitle(e)}, morale ${Math.round(e.morale)})`).join(', ')}.`:`${c?c.name:'Bir rakip'} ekibinden ${es.length} kişiye %40 daha yüksek maaş teklif etti: ${es.map(e=>`${e.name} (${levelTitle(e)}, moral ${Math.round(e.morale)})`).join(', ')}.`),
        o:[{t:(LANG_EN?`Counter all of them (+25% salary, ${money(es.reduce((a,e)=>a+e.salary*0.25,0))}/mo total)`:`Hepsine karşı teklif ver (+%25 maaş, toplam ${money(es.reduce((a,e)=>a+e.salary*0.25,0))}/ay)`),d:(LANG_EN?"Most likely, all of them stay.":'Büyük ihtimalle hepsi kalır.')},
          {t:(LANG_EN?"Counter only for the most valuable one":'Sadece en değerlisine karşı teklif ver'),d:(LANG_EN?"The others stay or leave depending on their morale and salary.":'Diğerleri morallerine ve maaşlarına göre kalır ya da gider.')},
          {t:(LANG_EN?"Don't counter":'Karşı teklif verme'),d:(LANG_EN?"Happy, well-paid employees may stay; the rest leave.":'Mutlu ve iyi maaş alan çalışanlar kalabilir; diğerleri gider.')}]};},
    pick(d,i){const c=comp(d.cid),es=d.ids.map(id=>G.emps.find(e=>e.id===id)).filter(Boolean),best=es.slice().sort((a,b)=>b.skill-a.skill)[0],gone=[];
      for(const e of es){const ct=i===0||(i===1&&e===best);
        if(ct){e.salary=Math.round(e.salary*1.25/100)*100;e.morale=Math.min(100,e.morale+5);}
        const ch=clamp((ct?0.08:0.85-e.morale/120-(e.salary/marketSal(e)-1)*1.5)*(hasT(e,'loyal')?0.2:hasT(e,'merc')?1.5:1),0.02,0.95);
        if(Math.random()<ch){e.lw='poach';gone.push(e);G.emps=G.emps.filter(x=>x!==e);}}
      if(c&&gone.length)c.tech=clamp(c.tech+0.015*gone.length,0.7,1.45);
      if(gone.length)G.layoff+=2*gone.length;G.careerVer=(G.careerVer||0)+1;
      news(gone.length?(LANG_EN?`${gone.map(e=>e.name).join(', ')} joined ${c?c.name:'rakip'}.`:`${gone.map(e=>e.name).join(', ')} ${c?c.name:'rakip'} şirketine geçti.`):(LANG_EN?"Everyone they tried to poach stayed with the company.":'Avlanmak istenen herkes şirkette kaldı.'),gone.length?'bad':'good',true);}},
  {id:'buyout',w:0,choice:true,cond:()=>false,
    view:d=>{const c=comp(d.cid),o=[{t:(LANG_EN?"Accept and sell the company":'Kabul et ve şirketi sat'),d:(LANG_EN?`Your share comes to ${money(d.offer*G.equity)}. The game ends here.`:`Payına ${money(d.offer*G.equity)} düşer. Oyun burada biter.`)}];
      if(!d.nego)o.push({t:(LANG_EN?"Negotiate":'Pazarlık et'),d:(LANG_EN?"50% chance the offer rises by 20%; otherwise the buyer walks away.":'%50 ihtimalle teklif %20 artar, yoksa alıcı masadan kalkar.')});
      o.push({t:(LANG_EN?"Decline":'Reddet'),d:(LANG_EN?"You stay independent. This rival may stay aggressive for a while.":'Bağımsız kalırsın. Bu rakip bir süre daha saldırgan davranabilir.')});
      return {t:(LANG_EN?"Acquisition offer":'Satın alma teklifi'),b:(LANG_EN?`${c?c.name:"A giant rival"} is offering ${money(d.offer)} for all of ${G.name} (company value ${money(marketCap())}). Your stake: ${pct(G.equity)}.`:`${c?c.name:'Dev bir rakip'}, ${G.name} şirketinin tamamı için ${money(d.offer)} teklif ediyor (şirket değeri ${money(marketCap())}). Hisse payın ${pct(G.equity)}.`),o};},
    pick(d,i){const k=(d.nego?['acc','rej']:['acc','neg','rej'])[i],c=comp(d.cid);
      if(k==='acc'){G.exited={by:c?c.name:(LANG_EN?"A rival":'Bir rakip'),offer:d.offer,day:G.day};G.wealth=(G.wealth||0)+d.offer*G.equity;G.over=true;careerRecord('sold');news((LANG_EN?`${G.name} was acquired by ${G.exited.by} for ${money(d.offer)}.`:`${G.name}, ${G.exited.by} tarafından ${money(d.offer)} karşılığında satın alındı.`),'good');setTimeout(()=>{G.speed=0;openModal('exit');save();},0);}
      else if(k==='neg'){if(Math.random()<0.5){news((LANG_EN?"The buyer raised the offer by 20%.":'Alıcı teklifini %20 artırdı.'),'good');setTimeout(()=>triggerChoice('buyout',{cid:d.cid,offer:Math.round(d.offer*1.2),nego:true}),0);}
        else news((LANG_EN?`${c?c.name:"The buyer"} walked away from the negotiations.`:`${c?c.name:'Alıcı'} pazarlıktan çekildi.`),'bad');}
      else{if(c)c.aggr=Math.min(1,c.aggr+0.15);news((LANG_EN?"You rejected the acquisition offer. The rival won't forget it.":'Satın alma teklifini reddettin. Rakip bunu unutmayacak.'));}}},
  {id:'board',w:0,choice:true,cond:()=>false,
    view:()=>({t:(LANG_EN?"Board pressure":'Yönetim kurulu baskısı'),b:(LANG_EN?"You've missed expectations for two quarters. The board and investors want change.":'İki çeyrektir beklentilerin altında kaldın. Yönetim kurulu ve yatırımcılar değişiklik istiyor.'),
      o:[{t:(LANG_EN?"Cut costs":'Maliyetleri kıs'),d:(LANG_EN?"All perks are removed and the pace returns to normal. The stock recovers; team morale drops.":'Bütün yan haklar kalkar, tempo normale döner. Hisse toparlanır, ekibin morali düşer.')},
        {t:(LANG_EN?`Give an investor pitch (${money(250000)})`:`Yatırımcı sunumu yap (${money(250000)})`),d:(LANG_EN?"55% chance to win them over (stock +10%); otherwise stock −5%.":'%55 ihtimalle ikna edersin (hisse +%10), olmazsa hisse −%5.')},
        {t:(LANG_EN?"Ignore the pressure":'Baskıyı görmezden gel'),d:(LANG_EN?"The stock loses 10% of its value.":'Hisse %10 değer kaybeder.')}]}),
    pick(d,i){const p=G.pub;if(!p)return;
      if(i===0){for(const k in G.perks)if(k!=='stock')G.perks[k]=false;G.pace='normal';for(const e of G.emps)e.morale=Math.max(0,e.morale-6);p.sent*=1.08;p.miss=0;news((LANG_EN?"Costs were cut. Investors are happy; the team isn't.":'Maliyetler kısıldı. Yatırımcılar memnun, ekip değil.'));}
      else if(i===1){spend(250000,'other');if(Math.random()<0.55){p.sent*=1.1;p.miss=0;news((LANG_EN?"The investor pitch went well, and the stock rose.":'Yatırımcı sunumu başarılı geçti, hisse yükseldi.'),'good',true);}else{p.sent*=0.95;news((LANG_EN?"The investor pitch wasn't convincing.":'Yatırımcı sunumu ikna edici bulunmadı.'),'bad',true);}}
      else{p.sent*=0.9;news((LANG_EN?"The board's warning was ignored; the stock fell.":'Yönetim kurulunun uyarısı görmezden gelindi; hisse geriledi.'),'bad');}}},
];
for(const e of RIVAL_EVENTS)EVD[e.id]=e;

