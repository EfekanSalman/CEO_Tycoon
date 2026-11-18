/* ============================== EXECUTIVES (AUTOPILOT) ============================== */
const EXECS={
  cpo:{n:(LANG_EN?"Head of Product":'Ürün Müdürü'),t:'CPO',base:22000,d:(LANG_EN?"Updates aging products, starts next-gen products when needed and pulls very old ones from the market.":'Eskiyen ürünleri günceller, gerektiğinde yeni nesil ürün başlatır, çok eskiyenleri piyasadan çeker.'),
    rules:{upd:(LANG_EN?"Update aging products":'Eskiyen ürünü güncelle'),gen:(LANG_EN?"Start next-gen when needed":'Gerektiğinde yeni nesil başlat'),ret:(LANG_EN?"Retire very old products":'Çok eskiyen ürünü çek')},def:{upd:true,gen:true,ret:true}},
  coo:{n:(LANG_EN?"Operations Manager":'Operasyon Müdürü'),t:'COO',base:22000,d:(LANG_EN?"Manages server capacity, switches from stalled suppliers to alternatives and adds lines at factory bottlenecks.":'Sunucu kapasitesini yönetir, duran tedarikçiden alternatife geçer, fabrika darboğazında hat ekler.'),
    rules:{rack:(LANG_EN?"Manage server capacity":'Sunucu kapasitesini yönet'),sup:(LANG_EN?"Replace stalled suppliers":'Duran tedarikçiyi değiştir'),line:(LANG_EN?"Add production lines at bottlenecks":'Darboğazda üretim hattı ekle')},def:{rack:true,sup:true,line:false}},
  cfo:{n:(LANG_EN?"Head of Finance":'Finans Müdürü'),t:'CFO',base:24000,d:(LANG_EN?"Raises below-market salaries, ties the marketing budget to revenue and cuts spending when cash is tight.":'Piyasanın altında kalan maaşlara zam yapar, pazarlama bütçesini ciroya göre ayarlar, nakit sıkışınca harcamaları kısar.'),
    rules:{raise:(LANG_EN?"Raise low salaries":'Düşük maaşlara zam yap'),mkt:(LANG_EN?"Set marketing budget to 6% of revenue":'Pazarlama bütçesini cironun %6\'sına bağla'),guard:(LANG_EN?"Pause marketing when cash is tight":'Nakit sıkışınca pazarlamayı durdur')},def:{raise:true,mkt:false,guard:true}},
  chro:{n:(LANG_EN?"Head of HR":'İnsan Kaynakları Müdürü'),t:'CHRO',base:20000,d:(LANG_EN?"Fills empty desks with the best candidates, sends tired staff on leave, promotes those who are ready and runs regular surveys.":'Boş masaları en uygun adaylarla doldurur, yorgunları izne yollar, hazır olanları terfi ettirir, düzenli anket yapar.'),
    rules:{hire:(LANG_EN?"Fill empty desks":'Boş masaları doldur'),vac:(LANG_EN?"Send tired staff on leave":'Yorgunları izne gönder'),prom:(LANG_EN?"Promote those who are ready":'Hazır olanları terfi ettir'),surv:(LANG_EN?"Run regular surveys":'Düzenli anket yap')},def:{hire:true,vac:true,prom:true,surv:true}},
  cmo:{n:(LANG_EN?"Marketing Manager":'Pazarlama Müdürü'),t:'CMO',base:21000,d:(LANG_EN?"Runs launch campaigns for new products, defends products losing share with ads, books booths at suitable trade shows and campaigns in low-awareness regions.":'Yeni ürünlere lansman kampanyası açar, pay kaybeden ürünü reklamla savunur, uygun fuarlara stant ayırır, bilinirliği düşük bölgelerde kampanya yapar.'),
    rules:{launch:(LANG_EN?"Launch campaign for new products":'Yeni ürüne lansman kampanyası'),camp:(LANG_EN?"Campaign for products losing share":'Pay kaybeden ürüne kampanya'),fair:(LANG_EN?"Book booths at suitable trade shows":'Uygun fuarlara stant ayır'),reg:(LANG_EN?"Campaign in low-awareness regions":'Bilinirliği düşük bölgede kampanya')},def:{launch:true,camp:true,fair:false,reg:false}},
};
const X_ORDER=['cpo','coo','cfo','chro','cmo'],X_MIN=8;
const xSal=(base,sk)=>Math.round(base*(0.6+sk*0.12)*infl()/100)*100;
function xCand(k){const sk=clamp(Math.round((rnd(4,7.5)+G.brand/40+prestige()/60)*10)/10,3,10);return {name:pick(FIRST)+' '+pick(LAST),skill:sk,salary:xSal(EXECS[k].base,sk)};}
function xPool(){G.xc=G.xc||{};for(const k of X_ORDER)if(!G.xc[k]||!G.xc[k].length)G.xc[k]=[xCand(k),xCand(k)];}
const xCost=()=>Object.values(G.execs||{}).reduce((a,x)=>a+x.salary,0);
function xlog(k,t){(G.xlog=G.xlog||[]).unshift({d:G.day,k,t});if(G.xlog.length>60)G.xlog.pop();}
function xDo(a,ds){UI.quiet=true;try{act(a,ds);}finally{UI.quiet=false;}}
function xReserve(){return (G.emps.reduce((a,e)=>a+e.salary,0)+officeRent()+xCost())*2;}
function execTick(){
  if(!G.execs)return;
  for(const k of X_ORDER){const x=G.execs[k];if(!x)continue;if(Math.random()>0.55+x.skill*0.045)continue;const R=x.rules,sk=x.skill;let acts=0;const max=1+Math.floor(sk/3);
    if(k==='cpo'){
      const devs=G.emps.filter(e=>DEV_ROLES.includes(e.role)&&!e.leave).length,capP=Math.max(2,Math.floor(devs/4));
      for(const p of myActive().sort((a,b)=>a.score/S(a.cat)-b.score/S(b.cat))){if(acts>=max)break;if(!p.spec&&HW.includes(p.cat))continue;
        const f=p.score/S(p.cat),busy=G.projects.some(q=>q.cat===p.cat);
        if(R.ret&&f<0.55&&myActive(p.cat).some(q=>q!==p&&q.score/S(q.cat)>0.7)){xDo('retire',{id:String(p.id)});xlog(k,(LANG_EN?`${p.name} was too old and has been pulled from the market.`:`${p.name} artık çok eski; piyasadan çekildi.`));acts++;continue;}
        if(busy||G.projects.length>=capP)continue;
        if(R.upd&&f<0.9&&f>=0.72&&!(p.cat==='cpu'&&nodeIdx(p.spec.node)>=NODES.filter(n=>has(n.r)).length-1&&(p.updN||0)>=2)){
          let kind=(p.updN||0)>=2||f<0.82?'major':'minor';if(sk<6&&Math.random()<0.25)kind=kind==='major'?'minor':'major';
          const pl=updPlan(p,kind);if(pl.err||G.cash<pl.tool*3+xReserve()||updBlock(p))continue;
          xDo('updstart',{id:String(p.id),k:kind});xlog(k,(LANG_EN?`Started ${UPD[kind].n.toLocaleLowerCase(LOC)} for ${p.name} (freshness ${pct(f,0)}).`:`${p.name} için ${UPD[kind].n.toLocaleLowerCase(LOC)} başlatıldı (güncellik ${pct(f,0)}).`));acts++;continue;}
        if(R.gen&&f<0.72&&catUnlocked(p.cat)){const prev=UI.draft;UI.draft=defaultDraft(p.cat);if(p.cat==='cpu'){const n=NODES.filter(n=>has(n.r)).pop();UI.draft.node=n.id;UI.draft.cores=Math.min(n.cores,Math.max(4,p.spec?p.spec.cores:4));UI.draft.clock=n.clk-0.2;}
          const r=spec(UI.draft,teamAvg(REQ_ROLES[p.cat])||3),tool=toolCost(UI.draft);
          if(!r.err&&G.cash>tool*3+xReserve()){const n0=G.projects.length;xDo('startproj',{});if(G.projects.length>n0){xlog(k,(LANG_EN?`${p.name} has aged; a next-gen ${CATS[p.cat].n.toLocaleLowerCase(LOC)} project was started.`:`${p.name} eskidi; yeni nesil ${CATS[p.cat].n.toLocaleLowerCase(LOC)} projesi başlatıldı.`));acts++;}}
          UI.draft=prev;}
      }}
    if(k==='coo'){
      if(R.rack&&(G.capLoad||0)>0){const cap=capacity(),load=G.capLoad;
        if(load>cap*0.92){const dc=(G.dcs||[]).find(d=>G.day>=d.ready&&d.racks<DC_LVL[d.lvl].max);
          if(dc&&G.cash>dcRackCost()*10*3){xDo('dcrack',{id:String(dc.id),n:'10'});xlog(k,(LANG_EN?`Added 10 racks to the ${REGS[dc.region].n} data center.`:`${REGS[dc.region].n} veri merkezine 10 raf eklendi.`));}
          else{const need=Math.min(20,Math.ceil((load*1.15-cap)/rackCap()));let n=0;while(n<need&&G.cash>rackCost()*4+xReserve()){xDo('rack',{});n++;}if(n)xlog(k,(LANG_EN?`Capacity was nearly full: added ${n} server racks.`:`Kapasite dolmak üzereydi: ${n} sunucu rafı eklendi.`));}}
        else if(load<cap*0.45&&G.racks>4){const n=Math.min(G.racks-4,Math.floor((cap*0.7-load)/rackCap()));if(n>0){for(let i=0;i<n;i++)xDo('unrack',{});xlog(k,(LANG_EN?`Idle capacity: shut down ${n} server racks.`:`Atıl kapasite: ${n} sunucu rafı kapatıldı.`));}}}
      if(R.sup){for(const c of Object.keys(CCATS)){const cur=SUPD[G.sup[c]];if(!cur||!supBlocked(cur)||!(catUse(c)>0))continue;
        const alt=[...SUPPLIERS.filter(x=>x.cat===c),...(plantReady(c)?[SUPD['own_'+c]]:[])].filter(x=>x!==cur&&!supBlocked(x)).sort((a,b)=>a.price-b.price)[0];
        if(alt){xDo('sup',{sid:alt.id});xlog(k,(LANG_EN?`${cur.n} can't deliver; switched to ${alt.n} for ${CCATS[c].n}.`:`${cur.n} teslimat yapamıyor; ${CCATS[c].n} için ${alt.n} tedarikçisine geçildi.`));}}}
      if(R.line){for(const f of G.factories){const u=G.siteUse&&G.siteUse[f.id];if(!u||u.load<=u.cap*1.05||f.lines>=FTYPES[f.type].maxLines)continue;
        const cost=FTYPES[f.type].lineCost*FREG[f.region].build*infl();if(G.cash<cost*3+xReserve())continue;xDo('line',{id:String(f.id)});xlog(k,(LANG_EN?`${f.name} was bottlenecked: added a new production line.`:`${f.name} darboğazdaydı: yeni üretim hattı eklendi.`));break;}}
    }
    if(k==='cfo'){
      const m=monthlyEst();
      if(R.guard&&G.cash<xReserve()&&m.profit<0&&mktBudget()>0){G.mkt.b={};G.mkt.ver++;xlog(k,(LANG_EN?"Cash is tight: marketing budgets paused.":'Nakit sıkıştı: pazarlama bütçeleri durduruldu.'));}
      else if(R.mkt&&G.day%28<7){const rev=mktRevBase(),cats=CAT_ORDER.filter(c=>myActive(c).length);
        if(cats.length&&rev>0){const target=rev*0.06,w={};let tw=0;for(const ch of CH_ORDER){w[ch]=cats.reduce((a,c)=>a+(CHANNELS[ch].cat[c]||0),0)/cats.length;w[ch]=w[ch]>=0.5?w[ch]*w[ch]:0;tw+=w[ch];}
          if(tw>0){const nb={};for(const ch of CH_ORDER)if(w[ch]>0)nb[ch]=Math.round(target*w[ch]/tw/1000)*1000;const old=mktBudget();G.mkt.b=nb;G.mkt.ver++;if(Math.abs(mktBudget()-old)>old*0.1+1000)xlog(k,(LANG_EN?`Marketing budget set to 6% of revenue: ${money(mktBudget())}/mo.`:`Pazarlama bütçesi cironun %6'sına göre ayarlandı: ${money(mktBudget())}/ay.`));}}}
      if(R.raise&&m.profit>0){const low=G.emps.filter(e=>!e.founder&&!e.intern&&e.salary<marketSal(e)*0.92).sort((a,b)=>a.salary/marketSal(a)-b.salary/marketSal(b)).slice(0,2+Math.floor(sk/2));
        for(const e of low)xDo('raise',{id:String(e.id)});if(low.length)xlog(k,(LANG_EN?`${low.length} employees got raises toward market level.`:`${low.length} çalışana piyasa seviyesine yaklaşan zam yapıldı.`));}
    }
    if(k==='chro'){
      if(R.vac){const tired=G.emps.filter(e=>!e.leave&&!e.founder&&e.energy<25).slice(0,3);for(const e of tired)xDo('vac',{id:String(e.id)});if(tired.length)xlog(k,(LANG_EN?`${tired.length} tired employees were sent on leave.`:`${tired.length} yorgun çalışan izne gönderildi.`));}
      if(R.prom){const rd=G.emps.filter(e=>canPromote(e).ok).slice(0,2);for(const e of rd){xDo('promote',{id:String(e.id)});}if(rd.length)xlog(k,(LANG_EN?`Promoted: ${rd.map(e=>e.name).join(', ')}.`:`${rd.map(e=>e.name).join(', ')} terfi etti.`));}
      if(R.surv&&G.emps.length>=X_MIN&&(!G.surv||G.day-G.surv.d>=120)&&G.cash>survCost()*5){xDo('survrun',{});if(G.surv&&G.surv.d===G.day&&!G.surv.plan){const r=G.surv.r,low=Object.keys(r).sort((a,b)=>r[a]-r[b])[0];xDo('survplan',{k:low});xlog(k,(LANG_EN?`Employee survey done; made a promise on the weakest area: ${SURV_D[low].toLocaleLowerCase(LOC)}.`:`Çalışan anketi yapıldı; en zayıf konu ${SURV_D[low].toLocaleLowerCase(LOC)} için söz verildi.`));}}
      if(R.hire&&G.emps.length<officeCap()){const m=monthlyEst();if(m.profit>salaryFor(5)*1.5||(m.profit>-salaryFor(5)&&G.cash>xReserve()*12)){
        const need={};const cats=CAT_ORDER.filter(c=>myActive(c).length||G.projects.some(p=>p.cat===c));for(const c of cats)for(const r of REQ_ROLES[c])need[r]=(need[r]||0)+2;
        need.res=(need.res||0)+1;need.mkt=(need.mkt||0)+(G.emps.length/12);need.sup=(need.sup||0)+myActive().length*0.4;if(G.factories.length)need.ops=(need.ops||0)+1.5;if(G.emps.length>20)need.sec=(need.sec||0)+0.8;
        const have={};for(const e of G.emps)have[e.role]=(have[e.role]||0)+1;
        const role=Object.keys(need).sort((a,b)=>(have[a]||0)/need[a]-(have[b]||0)/need[b])[0];
        const avgSk=G.emps.length?G.emps.reduce((t,e)=>t+e.skill,0)/G.emps.length:4,c=G.cands.filter(c=>c.role===role&&c.skill>=Math.max(3.5,avgSk-1.5)).sort((a,b)=>b.skill-a.skill)[0];
        if(c){xDo('hire',{id:String(c.id)});xlog(k,(LANG_EN?`Hired ${c.name} (${ROLES[role].n}, skill ${fx(c.skill,1)}).`:`${c.name} (${ROLES[role].n}, yetenek ${fx(c.skill,1)}) işe alındı.`));}
        else if(G.day-(G.xRef||-99)>=30){G.xRef=G.day;xDo('refresh',{});}}}
    }
    if(k==='cmo'){const res=xReserve();
      if(R.launch||R.camp){for(const p of myActive().sort((a,b)=>b.share-a.share)){if(acts>=max)break;if(p.camp>G.day)continue;const cost=CATS[p.cat].camp*infl();if(G.cash<cost*4+res)break;
        const young=p.launch!=null&&G.day-p.launch<45&&p.xl!==p.launch,drop=p.xs&&G.day-p.xs.d>=30&&p.xs.s>0.02&&p.share<p.xs.s*0.85;
        if(R.launch&&young){xDo('camp',{id:String(p.id)});p.xl=p.launch;xlog(k,(LANG_EN?`Launch campaign started for ${p.name} (${money(cost)}).`:`${p.name} için lansman kampanyası başlatıldı (${money(cost)}).`));acts++;continue;}
        if(R.camp&&drop){const s0=p.xs.s;xDo('camp',{id:String(p.id)});xlog(k,(LANG_EN?`${p.name} was losing share (${pct(s0,1)} → ${pct(p.share,1)}); ad campaign started.`:`${p.name} pay kaybediyordu (${pct(s0,1)} → ${pct(p.share,1)}); reklam kampanyası başlatıldı.`));p.xs={d:G.day,s:p.share};acts++;}}}
      for(const p of myActive())if(!p.xs||G.day-p.xs.d>=60)p.xs={d:G.day,s:p.share};
      if(R.fair&&acts<max&&G.fair){for(const {f,d} of fairCal()){const left=d-G.day;if(left<20||left>60||G.fair.reg[f.id])continue;const ps=fairProds(f),st=G.regions[f.r];if(!ps.length||(st&&!st.in))continue;
          const t=G.cash>fairCost(f,'pav')*10+res?'pav':'stand',c=fairCost(f,t);if(G.cash<c*6+res)continue;const best=ps.slice().sort((a,b)=>b.score/S(b.cat)-a.score/S(a.cat))[0];
          UI.fairP=UI.fairP||{};const old=UI.fairP[f.id];UI.fairP[f.id]=String(best.id);xDo('fairreg',{k:f.id,t});if(old==null)delete UI.fairP[f.id];else UI.fairP[f.id]=old;
          if(G.fair.reg[f.id]){xlog(k,(LANG_EN?`Booked a ${FAIR_T[t].n.toLocaleLowerCase(LOC)} at ${f.n}; showcasing ${best.name} (${money(c)}).`:`${f.n} için ${FAIR_T[t].n.toLocaleLowerCase(LOC)} ayrıldı; vitrinde ${best.name} (${money(c)}).`));acts++;break;}}}
      if(R.reg&&acts<max){const r=REG_ORDER.filter(r=>G.regions[r]&&G.regions[r].in&&G.regions[r].aw<0.55&&G.day-(G.regions[r].camp||-999)>=30).sort((a,b)=>G.regions[a].aw-G.regions[b].aw)[0];
        if(r){const c=regCampCost(r);if(G.cash>c*5+res){xDo('regcamp',{r});xlog(k,(LANG_EN?`Awareness was low in ${REGS[r].n}; regional campaign started (${money(c)}).`:`${REGS[r].n} bölgesinde bilinirlik düşüktü; bölgesel kampanya başlatıldı (${money(c)}).`));acts++;}}}
    }
  }
}
function xMonthly(){if(!G.execs)return;xPool();if(G.day%180<31){for(const k of X_ORDER)if(!G.execs[k])G.xc[k]=[xCand(k),xCand(k)];}}

