/* ============================== PATENTS & LAWSUITS ============================== */
const PAT_CAT={chip:['cpu'],n22:['cpu'],n14:['cpu'],n10:['cpu'],n7:['cpu'],n5:['cpu'],n3:['cpu'],fab:['cpu'],yield:['cpu'],ai:['cpu'],
  fw:['app','saas'],os:['os'],ml:['app','saas','os','ai'],cloud:['saas','ai'],srv:['saas','ai'],llm:['ai'],
  wear:['wear'],health:['wear'],console:['console'],gpu:['console'],rt:['console'],xr:['xr'],eyetrack:['xr'],microled:['xr'],ev:['car'],adas:['car'],robo1:['robo'],actu:['robo'],humanoid:['robo'],iot1:['iot'],matter:['iot'],qc1:['qc'],qc2:['qc'],qc3:['qc'],
  mobile:['phone'],oled:['phone'],cam:['phone'],batt:['phone'],fold:['phone'],cam2:['phone'],pc:['pc'],ram:['pc'],nvme:['pc'],ram2:['pc'],robot:['phone','pc']};
const LAW={std:{n:(LANG_EN?"Standard law firm":'Standart hukuk bürosu'),cost:40000,b:0},top:{n:(LANG_EN?"Prestigious law firm":'Prestijli hukuk bürosu'),cost:120000,b:0.12}};
const myPat=cat=>(G.pats||[]).filter(p=>p.exp>G.day&&p.cats.includes(cat)).reduce((a,p)=>a+p.w,0);
const theirPat=(c,cat)=>c&&c.pats?c.pats[cat]||0:0;
const crossWith=cid=>((G.cross||{})[cid]||0)>G.day;
function catRev(o,cat){return G.products.filter(p=>p.active&&p.owner===o&&p.cat===cat).reduce((a,p)=>a+(o==='P'&&isHW(p)?(p.sr||0):p.units)*p.price,0);}
const plainChance=(cat,c,firm)=>clamp(0.3+0.08*myPat(cat)-0.04*theirPat(c,cat)+LAW[firm].b,0.08,0.9);
/* savunma: taban kaybetme olasılığı ve kaybedince marka cezası. Eskiden 0,55 ve 2'ydi: tuzak taramasında (aynı başlangıçtan kopya simülasyon, 178 dava)
   savunma uzlaşmaya göre bir yılda ortalama 4–6M kaybettiriyordu; geç oyunda 1 marka puanı ~5M ettiği için kaybın bedeli çok ağırdı. */
const DEF_BASE=0.45,DEF_BRAND=1;
const defLose=(cat,c,firm)=>clamp(DEF_BASE+0.05*theirPat(c,cat)-0.07*myPat(cat)-LAW[firm].b,0.1,0.9);
const crossChance=(cat,c)=>clamp(0.1+0.09*myPat(cat)-0.02*theirPat(c,cat)+relOf(c)/200,0.03,0.85);
const dmgEst=(c,cat)=>Math.min(Math.max(0,c.cash)*0.2,catRev(c.id,cat)*2.2);
/* patent başvuru ücreti (v166): 30K, en çok 25 çalışanlı küçük şirkete yarı fiyat (15K). Eskiden her şirket için 60K'ydı;
   bot ölçümünde başvuru masrafı genç şirketlerde davadan kazanılan korumayı yiyordu. */
/* araştırma patentinin gücü (v169): 2, büyük araştırmada (4.000+ puan) 3; eskiden 1 ve 2'ydi. Rakipler kategoride 6–15 güçle geldiği için
   tek araştırma oyuncuyu dava sınırına yaklaştıramıyordu; koruyucu araştırma ölçümde başvurudan öteye bir şey katmıyordu. Tasarım patenti 1 kalır. */
const patResW=r=>r.rp>=4000?3:2;
const PAT_FEE=30000,PAT_SMALL=25,patFee=()=>Math.round(PAT_FEE*(workers().length<=PAT_SMALL?0.5:1)*infl());
const SUIT_GRACE=540,SUIT_GAP=3,SUIT_CAP=0.2;
const SUIT_DETER=0.15,suitDeter=cat=>Math.min(0.8,SUIT_DETER*myPat(cat));
/* rakibin talebi: aylık kategori cirosunun 2–4 katı, ama nakdinin en çok %20'si (en az 150K) */
const suitClaim=cat=>Math.round(Math.min(Math.max(200000*infl(),catRev('P',cat)*rnd(2,4)),Math.max(150000*infl(),Math.max(0,G.cash)*SUIT_CAP)));
function initPats(c){if(c.pats)return;c.pats={};for(const f of c.focus)c.pats[f]=Math.round(c.emp/180*c.tech);}
/* dava riski (v168): sattığın (payı ≥%5) her kategoride sana dava açabilecek en önde rakip; gap = onların patent gücü − seninki (bekleyen başvurular sayılmaz).
   need: dava eşiğinin altına inmek için gereken patent gücü; res: o kategoriyi koruyan, önkoşulu hazır en ucuz araştırma. Patent panelinde ve botta kullanılır. */
function suitRisks(){const out=[];
  for(const cat of new Set(myActive().map(p=>p.cat))){if(myActive(cat).reduce((a,p)=>a+p.share,0)<0.05)continue;let w=null;
    for(const c of liveComps()){if(c.aggr<0.35||crossWith(c.id)||relOf(c)>=30||!c.focus.includes(cat))continue;initPats(c);const g=theirPat(c,cat)-myPat(cat);if(!w||g>w.gap)w={c,gap:g};}
    if(!w)continue;const pend=(G.patPend||[]).filter(x=>x.cats.includes(cat)).reduce((a,x)=>a+x.w,0);
    const res=RES.filter(r=>!has(r.id)&&(PAT_CAT[r.id]||[]).includes(cat)&&(r.pre||[]).every(has)).sort((a,b)=>resCostOf(a)-resCostOf(b))[0]||null;
    out.push({cat,cid:w.c.id,name:w.c.name,gap:w.gap,need:Math.max(0,w.gap-SUIT_GAP+1),pend,res:res&&res.id});}
  return out.sort((a,b)=>b.gap-a.gap);}
function filePatent(id,n,cats,w,free){
  G.patPend.push({id:nid(),src:id,n,cats,w,due:G.day+rint(120,240),ch:free?0.9:0.8});if(id)G.patFiled[id]=true;
}
function patMonthly(){
  for(const c of liveComps()){initPats(c);for(const f of c.focus)if(Math.random()<0.08*c.tech*(c.profit>0?1:0.4))c.pats[f]=(c.pats[f]||0)+1;}
  for(const pp of [...G.patPend])if(G.day>=pp.due){G.patPend=G.patPend.filter(x=>x!==pp);
    if(Math.random()<pp.ch){G.pats.push({id:nid(),n:pp.n,cats:pp.cats,w:pp.w,grant:G.day,exp:G.day+12*365,src:pp.src});news((LANG_EN?`Patent granted: ${pp.n} (${pp.cats.map(c=>CATS[c].n).join(', ')}).`:`Patent onaylandı: ${pp.n} (${pp.cats.map(c=>CATS[c].n).join(', ')}).`),'good',true);}
    else{news((LANG_EN?`Patent application rejected: ${pp.n}. The patent office didn't find it original enough.`:`Patent başvurusu reddedildi: ${pp.n}. Patent ofisi yeterince özgün bulmadı.`),'bad');if(pp.src)delete G.patFiled[pp.src];}}
  for(const k of [...G.cases]){const c=comp(k.cid);
    if(!c||c.dead){G.cases=G.cases.filter(x=>x!==k);news((LANG_EN?`The lawsuit was dropped because ${c?c.name:"The other party"} no longer exists.`:`${c?c.name:'Karşı taraf'} ortadan kalktığı için dava düştü.`));continue;}
    spend(LAW[k.firm].cost*infl(),'other');
    if(G.day>=k.end){resolveCase(k);continue;}
    if(k.role==='pl'&&!k.offered&&!G.pending&&caseWinP(k,c)>=0.5&&Math.random()<0.25){k.offered=true;triggerChoice('settle',{kid:k.id,amt:Math.round(dmgEst(c,k.cat)*rnd(0.45,0.7))});}
  }
  /* Rakip patent davası (v166 dengesi): ilk 18 ay koruma; patent farkı en az 3 olmalı; her patentin %15 caydırıcılığı var (eskiden 2: sende 0, onlarda 2 patent varken dava gelirdi);
     talep nakdinin en çok %20'si (en az 150K). Eskiden talep aylık kategori cirosunun 2–4 katıydı ve 5–15 ayda bir gelen uzlaşmalar genç şirketlerin
     kasasının yarısını götürüyordu: bot ölçümünde garajdan başlayan koşulardaki iflasların ana nedeni buydu. */
  if(!G.pending&&G.day>=(G.suitCool||0)&&G.day>SUIT_GRACE){
    const opts=[];for(const c of liveComps()){if(c.aggr<0.35||crossWith(c.id)||relOf(c)>=30||G.cases.some(k=>k.cid===c.id))continue;initPats(c);
      for(const cat of c.focus){const sh=myActive(cat).reduce((a,p)=>a+p.share,0);if(sh>=0.05&&theirPat(c,cat)-myPat(cat)>=SUIT_GAP)opts.push([c,cat]);}}
    /* caydırıcılık: o kategorideki her patentin dava ihtimalini %15 düşürür (en çok %80) — karşı dava riski */
    const [c,cat]=opts.length?pick(opts):[];
    if(c&&Math.random()<0.06*(1-suitDeter(cat))){G.suitCool=G.day+150;
      triggerChoice('suitIn',{cid:c.id,cat,claim:suitClaim(cat)});}
  }
}
/* davacı olarak kazanma ihtimali; rakibin doğrudan kopya sökümüne açılan davada (k.cp) kopya kanıtı +25 puan */
const caseWinP=(k,c)=>k.cp?rvnCaseP(k.cat,c,k.firm):plainChance(k.cat,c,k.firm);
function openCase(cid,cat,role,firm,claim){
  const c=comp(cid);G.cases.push({id:nid(),cid,cat,role,firm,claim:claim||0,start:G.day,end:G.day+rint(120,240)});
  if(c)c.rel=clamp(relOf(c)-(role==='pl'?30:20),-100,100);
}
function resolveCase(k){
  G.cases=G.cases.filter(x=>x!==k);const c=comp(k.cid);if(!c)return;
  if(k.role==='pl'){
    if(Math.random()<caseWinP(k,c)){if(k.cp&&c.tdk)delete c.tdk[k.cat];let dmg=Math.round(Math.min(Math.max(0,c.cash)*0.2,catRev(c.id,k.cat)*rnd(1.5,3)));if(k.cp)dmg=Math.max(dmg,Math.round(Math.min(Math.max(0,c.cash)*0.2,5e5*infl())));
      G.cash+=dmg;G.month.rev+=dmg;c.cash-=dmg;c.mRev-=dmg;for(const p of G.products)if(p.active&&p.owner===c.id&&p.cat===k.cat)p.inj=G.day+90;G.brand=clamp(G.brand+1,0,100);
      (G.flags=G.flags||{}).suitWin=true;tl('law',(LANG_EN?`You won the patent suit against ${c.name} (${money(dmg)})`:`${c.name} aleyhine patent davasını kazandın (${money(dmg)})`));news((LANG_EN?`You won the case! ${c.name} will pay ${money(dmg)} in damages, and its ${CATS[k.cat].n.toLocaleLowerCase(LOC)} products face a 90-day sales restriction.`:`Davayı kazandın! ${c.name} ${money(dmg)} tazminat ödeyecek ve ${CATS[k.cat].n.toLocaleLowerCase(LOC)} ürünlerine 90 günlük satış kısıtlaması geldi.`),'good',true);}
    else{const fee=LAW[k.firm].cost*infl()*3;spend(fee,'other');c.cash+=fee;G.brand=clamp(G.brand-1,0,100);
      tl('law',(LANG_EN?`You lost the patent suit you filed against ${c.name}`:`${c.name} aleyhine açtığın patent davasını kaybettin`));news((LANG_EN?`You lost the patent suit you filed against ${c.name}. You're stuck with the other side's ${money(fee)} legal fees.`:`${c.name} aleyhine açtığın patent davasını kaybettin. Karşı tarafın avukatlık masrafı ${money(fee)} sana kaldı.`),'bad',true);}
  }else{
    if(Math.random()<defLose(k.cat,c,k.firm)){spend(k.claim,'other');c.cash+=k.claim;c.mRev+=k.claim;for(const p of G.products)if(p.active&&p.owner==='P'&&p.cat===k.cat)p.inj=G.day+60;G.brand=clamp(G.brand-DEF_BRAND,0,100);
      news((LANG_EN?`${c.name} won the patent suit. You paid ${money(k.claim)} in damages, and your ${CATS[k.cat].n.toLocaleLowerCase(LOC)} products face a 60-day sales restriction.`:`${c.name} patent davasını kazandı. ${money(k.claim)} tazminat ödedin ve ${CATS[k.cat].n.toLocaleLowerCase(LOC)} ürünlerine 60 günlük satış kısıtlaması geldi.`),'bad',true);}
    else{const back=LAW.std.cost*infl()*2;G.cash+=back;c.cash-=back;G.brand=clamp(G.brand+1,0,100);
      news((LANG_EN?`You won the patent suit filed by ${c.name}! They're stuck with the court costs.`:`${c.name}'ın açtığı patent davasını kazandın! Mahkeme masrafları onlara kaldı.`),'good',true);}
  }
  c.rel=clamp(relOf(c)-10,-100,100);
}
const SUIT_IN={id:'suitIn',w:0,choice:true,cond:()=>false,
  view:d=>{const c=comp(d.cid),m=myPat(d.cat),t=theirPat(c,d.cat);return {t:(LANG_EN?"Patent lawsuit":'Patent davası'),b:(LANG_EN?`${c?c.name:"A rival"} sued, claiming your ${CATS[d.cat].n.toLocaleLowerCase(LOC)} products infringe its patents. Claim: ${money(d.claim)}. Your patent strength in this area is ${m}, theirs is ${t}.`:`${c?c.name:'Bir rakip'}, ${CATS[d.cat].n.toLocaleLowerCase(LOC)} ürünlerinin patentlerini ihlal ettiğini iddia ederek dava açtı. Talep ${money(d.claim)}. Bu alanda patent gücün ${m}, onlarınki ${t}.`),
    o:[{t:(LANG_EN?`Settle (${money(d.claim*0.5)})`:`Uzlaş (${money(d.claim*0.5)})`),d:(LANG_EN?"Pay half the claim and close the case.":'Talebin yarısını öde, dava kapansın.')},
      {t:(LANG_EN?`Defend with a standard firm (${money(LAW.std.cost*infl())}/mo)`:`Standart büroyla savun (${money(LAW.std.cost*infl())}/ay)`),d:(LANG_EN?`~${Math.round(defLose(d.cat,c,'std')*100)}% chance of losing. If you lose: full damages and a 60-day sales restriction.`:`Kaybetme ihtimali ~%${Math.round(defLose(d.cat,c,'std')*100)}. Kaybedersen tam tazminat ve 60 gün satış kısıtlaması.`)},
      {t:(LANG_EN?`Defend with a prestigious firm (${money(LAW.top.cost*infl())}/mo)`:`Prestijli büroyla savun (${money(LAW.top.cost*infl())}/ay)`),d:(LANG_EN?`~${Math.round(defLose(d.cat,c,'top')*100)}% chance of losing.`:`Kaybetme ihtimali ~%${Math.round(defLose(d.cat,c,'top')*100)}.`)},
      {t:(LANG_EN?"Offer a cross-license":'Çapraz lisans teklif et'),d:(LANG_EN?`~${Math.round(crossChance(d.cat,c)*100)}% chance they accept. If they do, the case is dropped and neither of you can sue the other for 3 years. If they refuse, you defend with a standard firm.`:`Kabul ihtimali ~%${Math.round(crossChance(d.cat,c)*100)}. Kabul ederlerse dava düşer ve 3 yıl birbirinize dava açamazsınız. Reddederlerse standart büroyla savunursun.`)}]};},
  pick(d,i){const c=comp(d.cid);if(!c)return;
    if(i===0){spend(d.claim*0.5,'other');c.cash+=d.claim*0.5;c.rel=clamp(relOf(c)-5,-100,100);news((LANG_EN?`Patent suit with ${c.name} settled (${money(d.claim*0.5)}).`:`${c.name} ile patent davasında uzlaşıldı (${money(d.claim*0.5)}).`));}
    else if(i===3){if(Math.random()<crossChance(d.cat,c)){G.cross[c.id]=G.day+3*365;c.rel=clamp(relOf(c)+10,-100,100);news((LANG_EN?`${c.name} accepted the cross-license. The case was dropped; neither of you will file patent suits against the other for 3 years.`:`${c.name} çapraz lisansı kabul etti. Dava düştü; 3 yıl boyunca birbirinize patent davası açmayacaksınız.`),'good',true);}
      else{openCase(c.id,d.cat,'def','std',d.claim);news((LANG_EN?`${c.name} rejected the cross-license. The case is going to court.`:`${c.name} çapraz lisansı reddetti. Dava mahkemeye gidiyor.`),'bad',true);}}
    else{openCase(c.id,d.cat,'def',i===2?'top':'std',d.claim);news((LANG_EN?`You're defending the ${c.name} case (${LAW[i===2?'top':'std'].n}).`:`${c.name} davasında savunmaya geçtin (${LAW[i===2?'top':'std'].n}).`));}}};
const SETTLE={id:'settle',w:0,choice:true,cond:()=>false,
  view:d=>{const k=G.cases.find(x=>x.id===d.kid),c=k&&comp(k.cid);return {t:(LANG_EN?"Settlement offer":'Uzlaşma teklifi'),b:(LANG_EN?`${c?c.name:"The other party"} is offering ${money(d.amt)} to settle the patent suit you filed. Your current chance of winning is ~${k&&c?Math.round(plainChance(k.cat,c,k.firm)*100):50}%.`:`${c?c.name:'Karşı taraf'}, açtığın patent davasını kapatmak için ${money(d.amt)} teklif ediyor. Davayı kazanma ihtimalin şu an ~%${k&&c?Math.round(plainChance(k.cat,c,k.firm)*100):50}.`),
    o:[{t:(LANG_EN?`Accept (${money(d.amt)})`:`Kabul et (${money(d.amt)})`),d:(LANG_EN?"The money comes in now and the case closes.":'Para hemen gelir, dava kapanır.')},{t:(LANG_EN?"Refuse and go to trial":'Reddet, mahkemeye devam'),d:(LANG_EN?"Win and you get bigger damages and a sales restriction; lose and the costs are yours.":'Kazanırsan daha büyük tazminat ve satış kısıtlaması; kaybedersen masraflar sana.')}]};},
  pick(d,i){const k=G.cases.find(x=>x.id===d.kid);if(!k)return;const c=comp(k.cid);
    if(i===0&&c){G.cases=G.cases.filter(x=>x!==k);G.cash+=d.amt;G.month.rev+=d.amt;c.cash-=d.amt;c.rel=clamp(relOf(c)+5,-100,100);news((LANG_EN?`Settled with ${c.name}: ${money(d.amt)} collected.`:`${c.name} ile uzlaşıldı: ${money(d.amt)} tahsil edildi.`),'good',true);}
    else news((LANG_EN?"Settlement offer refused; the case continues.":'Uzlaşma teklifi reddedildi; dava sürüyor.'));}};
EVENTS.push(SUIT_IN,SETTLE);EVD.suitIn=SUIT_IN;EVD.settle=SETTLE;
function vPatents(){
  const live=liveComps();for(const c of live)initPats(c);
  const strength=CAT_ORDER.map(cat=>{const m=myPat(cat),top=live.filter(c=>c.focus.includes(cat)).sort((a,b)=>theirPat(b,cat)-theirPat(a,cat))[0],t=top?theirPat(top,cat):0,mx=Math.max(1,m,t);
    return (LANG_EN?`<div class="col" style="gap:4px"><div class="row between small"><b>${CATS[cat].n}</b><span class="muted">you ${m} · ${top?esc(top.name.split(' ')[0])+' '+t:"no rivals"}</span></div>
      <div class="row" style="gap:4px;flex-wrap:nowrap"><div class="bar" style="flex:1"><i style="width:${m/mx*100}%;background:var(--accent)"></i></div><div class="bar" style="flex:1"><i style="width:${t/mx*100}%;background:${top?ownerColor(top.id):'var(--line)'}"></i></div></div></div>`:`<div class="col" style="gap:4px"><div class="row between small"><b>${CATS[cat].n}</b><span class="muted">sen ${m} · ${top?esc(top.name.split(' ')[0])+' '+t:'rakip yok'}</span></div>
      <div class="row" style="gap:4px;flex-wrap:nowrap"><div class="bar" style="flex:1"><i style="width:${m/mx*100}%;background:var(--accent)"></i></div><div class="bar" style="flex:1"><i style="width:${t/mx*100}%;background:${top?ownerColor(top.id):'var(--line)'}"></i></div></div></div>`);}).join('');
  const can=RES.filter(r=>PAT_CAT[r.id]&&has(r.id)&&!G.patFiled[r.id]);
  const risks=suitRisks().filter(r=>r.gap>=SUIT_GAP-1);
  const riskHtml=risks.length?`<div class="small"><b>${LANG_EN?"Lawsuit risk":'Dava riski'}:</b> ${risks.slice(0,4).map(r=>{const rr=r.res&&RESD[r.res];
    return LANG_EN?`${CATS[r.cat].n}: ${esc(r.name)} is ${r.gap} ahead (suits start at ${SUIT_GAP}) · ${r.need?`${r.need} more patent strength needed${r.pend?`, ${r.pend} pending`:''}`:'just below the line'}${rr?` · protective research: ${esc(rr.n)} (${money(resCostOf(rr))})`:''}`
      :`${CATS[r.cat].n}: ${esc(r.name)} ${r.gap} önde (dava ${SUIT_GAP} farkta başlar) · ${r.need?`${r.need} patent gücü daha gerek${r.pend?`, ${r.pend} bekliyor`:''}`:'sınırın hemen altındasın'}${rr?` · koruyucu araştırma: ${esc(rr.n)} (${money(resCostOf(rr))})`:''}`;}).join(' · ')}</div>`:'';
  const fileCost=patFee();
  const owned=(G.pats||[]).filter(p=>p.exp>G.day).sort((a,b)=>b.grant-a.grant);
  const cases=G.cases.map(k=>{const c=comp(k.cid);if(!c)return '';const pl=k.role==='pl',ch=pl?plainChance(k.cat,c,k.firm):1-defLose(k.cat,c,k.firm);
    return (LANG_EN?`<tr><td><b>${esc(c.name)}</b><div class="small muted">${CATS[k.cat].n}</div></td><td><span class="chip ${pl?'st-ok':'st-bad'}">${pl?"Plaintiff":"Defendant"}</span></td><td class="small">${LAW[k.firm].n}<div class="muted">${money(LAW[k.firm].cost*infl())}/mo</div></td>
      <td class="r num ${ch>=0.5?'pos':'neg'}">${Math.round(ch*100)}%</td><td class="r num">${fmtDate(k.end)}</td>
      <td class="r">${pl?`<button class="btn sm ghost" data-act="casedrop" data-id="${k.id}">Withdraw</button>`:`<button class="btn sm" data-act="casesettle" data-id="${k.id}">Settle ${money(k.claim*0.5)}</button>`}</td></tr>`:`<tr><td><b>${esc(c.name)}</b><div class="small muted">${CATS[k.cat].n}</div></td><td><span class="chip ${pl?'st-ok':'st-bad'}">${pl?'Davacısın':'Davalısın'}</span></td><td class="small">${LAW[k.firm].n}<div class="muted">${money(LAW[k.firm].cost*infl())}/ay</div></td>
      <td class="r num ${ch>=0.5?'pos':'neg'}">%${Math.round(ch*100)}</td><td class="r num">${fmtDate(k.end)}</td>
      <td class="r">${pl?`<button class="btn sm ghost" data-act="casedrop" data-id="${k.id}">Geri çek</button>`:`<button class="btn sm" data-act="casesettle" data-id="${k.id}">Uzlaş ${money(k.claim*0.5)}</button>`}</td></tr>`);}).join('');
  let form='';const su=UI.sue;
  if(su){const c=comp(su.cid);
    const cats=c?c.focus.filter(cat=>G.products.some(p=>p.active&&p.owner===c.id&&p.cat===cat)):[];
    if(c&&!cats.includes(su.cat))su.cat=cats[0];
    const ok=c&&su.cat&&myPat(su.cat)>0&&!crossWith(c.id)&&!G.cases.some(k=>k.cid===c.id);
    form=(LANG_EN?`<div class="proj"><div class="row between"><b>File a patent suit</b><button class="btn sm ghost" data-act="sueclose">Close</button></div><div class="form">
      <label class="f" for="su-c">Rival<select id="su-c" data-bind="sue.cid">${live.map(x=>`<option value="${x.id}" ${x.id===su.cid?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label>
      <label class="f" for="su-k">Area<select id="su-k" data-bind="sue.cat">${cats.map(k=>`<option value="${k}" ${k===su.cat?'selected':''}>${CATS[k].n} · you ${myPat(k)}, them ${theirPat(c,k)}</option>`).join('')||"<option>No products</option>"}</select></label>
      <label class="f" for="su-f">Law firm<select id="su-f" data-bind="sue.firm">${Object.entries(LAW).map(([k,x])=>`<option value="${k}" ${su.firm===k?'selected':''}>${x.n} · ${money(x.cost*infl())}/mo</option>`).join('')}</select></label></div>
      ${ok?`<div class="row between"><span class="small">Chance to win <b class="${plainChance(su.cat,c,su.firm)>=0.5?'pos':'neg'}">${Math.round(plainChance(su.cat,c,su.firm)*100)}%</b> · est. damages ${money(dmgEst(c,su.cat))} · takes 4–8 months · relationship −30</span><button class="btn sm primary" data-act="suego">File suit</button></div>`
        :`<div class="small neg">${!c?'':crossWith(c.id)?"You have a cross-license deal with this company.":G.cases.some(k=>k.cid===c.id)?"You already have an ongoing case with this company.":!su.cat?"This company has no products on the market.":"You have no patents in this area."}</div>`}</div>`:`<div class="proj"><div class="row between"><b>Patent davası aç</b><button class="btn sm ghost" data-act="sueclose">Kapat</button></div><div class="form">
      <label class="f" for="su-c">Rakip<select id="su-c" data-bind="sue.cid">${live.map(x=>`<option value="${x.id}" ${x.id===su.cid?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label>
      <label class="f" for="su-k">Alan<select id="su-k" data-bind="sue.cat">${cats.map(k=>`<option value="${k}" ${k===su.cat?'selected':''}>${CATS[k].n} · sen ${myPat(k)}, onlar ${theirPat(c,k)}</option>`).join('')||'<option>Ürünleri yok</option>'}</select></label>
      <label class="f" for="su-f">Hukuk bürosu<select id="su-f" data-bind="sue.firm">${Object.entries(LAW).map(([k,x])=>`<option value="${k}" ${su.firm===k?'selected':''}>${x.n} · ${money(x.cost*infl())}/ay</option>`).join('')}</select></label></div>
      ${ok?`<div class="row between"><span class="small">Kazanma ihtimali <b class="${plainChance(su.cat,c,su.firm)>=0.5?'pos':'neg'}">%${Math.round(plainChance(su.cat,c,su.firm)*100)}</b> · tahmini tazminat ${money(dmgEst(c,su.cat))} · 4–8 ay sürer · ilişki −30</span><button class="btn sm primary" data-act="suego">Dava aç</button></div>`
        :`<div class="small neg">${!c?'':crossWith(c.id)?'Bu şirketle çapraz lisans anlaşman var.':G.cases.some(k=>k.cid===c.id)?'Bu şirketle zaten süren bir davan var.':!su.cat?'Bu şirketin piyasada ürünü yok.':'Bu alanda hiç patentin yok.'}</div>`}</div>`);}
  return (LANG_EN?`<section class="panel"><div class="ph"><h2>Patents</h2><span class="sub">${owned.reduce((a,p)=>a+p.w,0)} patent strength · ${G.patPend.length} applications pending</span></div><div class="pb col">
    <div class="grid3">${strength}</div>
    ${riskHtml}
    <p class="small muted">Completed research can be patented; products with a press score of 8 or higher automatically file for a design patent. If your patent portfolio in an area is stronger than a rival's, you can sue to win damages and sales restrictions. If you're weak, aggressive rivals will sue you.</p>
    ${can.length?`<div class="row" style="gap:6px">${can.map(r=>`<button class="btn sm" data-act="patfile" data-rid="${r.id}" ${G.cash<fileCost?'disabled':''} title="${PAT_CAT[r.id].map(c=>CATS[c].n).join(', ')}">Patent: ${esc(r.n)} · ${money(fileCost)}</button>`).join('')}</div>`:''}
    ${G.patPend.length?`<div class="small"><b>Pending applications:</b> ${G.patPend.map(p=>`${esc(p.n)} (${fmtDate(p.due)})`).join(' · ')}</div>`:''}
    ${owned.length?`<div class="small"><b>Your patents:</b> ${owned.slice(0,12).map(p=>`${esc(p.n)}${p.w>1?' ×'+p.w:''}`).join(' · ')}${owned.length>12?` and ${owned.length-12} more`:''}</div>`:''}
  </div></section>
  <section class="panel"><div class="ph"><h2>Lawsuits</h2><span class="sub">${G.cases.length} active cases${Object.values(G.cross||{}).filter(x=>x>G.day).length?` · ${Object.values(G.cross).filter(x=>x>G.day).length} cross-licenses`:''}</span></div><div class="pb col">
    ${cases?`<div class="tw"><table><thead><tr><th>Other party</th><th>Role</th><th>Firm</th><th class="r">Win</th><th class="r">Verdict</th><th></th></tr></thead><tbody>${cases}</tbody></table></div>`:"<div class=\"small muted\">No active cases.</div>"}
    ${form||`<div class="row"><button class="btn sm primary" data-act="suenew">File suit</button></div>`}</div></section>`:`<section class="panel"><div class="ph"><h2>Patentler</h2><span class="sub">${owned.reduce((a,p)=>a+p.w,0)} patent gücü · ${G.patPend.length} başvuru bekliyor</span></div><div class="pb col">
    <div class="grid3">${strength}</div>
    ${riskHtml}
    <p class="small muted">Tamamlanan araştırmalar patentlenebilir; basın puanı 8 ve üzeri ürünler otomatik tasarım patenti başvurusu yapar. Bir alanda rakibinden güçlü patent portföyün varsa dava açıp tazminat ve satış kısıtlaması kazanabilirsin. Zayıfsan saldırgan rakipler sana dava açar.</p>
    ${can.length?`<div class="row" style="gap:6px">${can.map(r=>`<button class="btn sm" data-act="patfile" data-rid="${r.id}" ${G.cash<fileCost?'disabled':''} title="${PAT_CAT[r.id].map(c=>CATS[c].n).join(', ')}">Patentle: ${esc(r.n)} · ${money(fileCost)}</button>`).join('')}</div>`:''}
    ${G.patPend.length?`<div class="small"><b>Bekleyen başvurular:</b> ${G.patPend.map(p=>`${esc(p.n)} (${fmtDate(p.due)})`).join(' · ')}</div>`:''}
    ${owned.length?`<div class="small"><b>Patentlerin:</b> ${owned.slice(0,12).map(p=>`${esc(p.n)}${p.w>1?' ×'+p.w:''}`).join(' · ')}${owned.length>12?` ve ${owned.length-12} tane daha`:''}</div>`:''}
  </div></section>
  <section class="panel"><div class="ph"><h2>Davalar</h2><span class="sub">${G.cases.length} süren dava${Object.values(G.cross||{}).filter(x=>x>G.day).length?` · ${Object.values(G.cross).filter(x=>x>G.day).length} çapraz lisans`:''}</span></div><div class="pb col">
    ${cases?`<div class="tw"><table><thead><tr><th>Karşı taraf</th><th>Rol</th><th>Büro</th><th class="r">Kazanma</th><th class="r">Karar</th><th></th></tr></thead><tbody>${cases}</tbody></table></div>`:'<div class="small muted">Süren dava yok.</div>'}
    ${form||`<div class="row"><button class="btn sm primary" data-act="suenew">Dava aç</button></div>`}</div></section>`);
}


