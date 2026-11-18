/* ============================== NEW MARKETS ============================== */
const CAT_ENTRANTS=[
  {d:540,seed:{name:(LANG_EN?"Prizma XR":'Prizma XR'),reg:['tr','eu','na','asia'],pfx:(LANG_EN?"Prizma":'Prizma'),focus:['xr'],cash:12e6,emp:200,brand:25,tech:1.02,hue:200},why:(LANG_EN?"VR headset":'sanal gerçeklik gözlüğü')},
  {d:900,seed:{name:(LANG_EN?"Simsek Autonomous":'Şimşek Otonom'),reg:['tr','eu','na','asia'],pfx:(LANG_EN?"Lightning":'Şimşek'),focus:['car'],cash:15e6,emp:150,brand:20,tech:1.04,hue:45},why:(LANG_EN?"EV software":'elektrikli araç yazılımı')},
  {d:420,seed:{name:(LANG_EN?"Yuva Smart Home":'Yuva Akıllı Ev'),reg:['tr','eu','na','asia'],pfx:(LANG_EN?"Haven":'Yuva'),focus:['iot'],cash:8e6,emp:120,brand:20,tech:1.02,hue:140},why:(LANG_EN?"smart home device":'akıllı ev cihazı')},
  {d:2700,seed:{name:(LANG_EN?"Kubit Dynamics":'Kübit Dinamik'),reg:['tr','eu','na','asia'],pfx:(LANG_EN?"Qubits":'Kübit'),focus:['qc'],cash:150e6,emp:300,brand:25,tech:1.05,hue:260},why:(LANG_EN?"quantum computer":'kuantum bilgisayar')},
  {d:1826,seed:{name:(LANG_EN?"Mekatron Robotics":'Mekatron Robotik'),reg:['tr','eu','na','asia'],pfx:(LANG_EN?"Mekatron":'Mekatron'),focus:['robo'],cash:60e6,emp:400,brand:30,tech:1.0,hue:15},why:(LANG_EN?"humanoid robot":'insansı robot')},
];
function newCatsMonthly(){
  for(const E of CAT_ENTRANTS){if(G.day<E.d||G.comps.some(c=>c.name===E.seed.name))continue;
    const c=makeComp({...E.seed,cash:E.seed.cash*infl()},'c'+nid());c.born=G.day;G.comps.push(c);for(const f of c.focus)aiLaunch(c,f,true);
    news((LANG_EN?`A new market is heating up: ${c.name} was founded and released its first ${E.why}.`:`Yeni pazar hareketleniyor: ${c.name} kuruldu ve ilk ${E.why} ürününü çıkardı.`),'mkt',true);}
  for(const p of myActive('car')){if(!(p.units>1000))continue;const b=p.bugs||0;if(b<4)continue;
    if(Math.random()<Math.min(0.15,0.02*b)*(has('adas')?0.6:1)){const cost=p.units*8*infl();spend(cost,'other');G.brand=clamp(G.brand-3,0,100);if(p.sat!=null)p.sat=Math.max(0,p.sat-10);
      news((LANG_EN?`Software recall for ${p.name}: ${num(p.units)} vehicles will be updated at a cost of ${money(cost)}. The risk remains until the bugs are fixed.`:`${p.name} için yazılım geri çağırması: ${num(p.units)} araç güncellenecek, maliyet ${money(cost)}. Hataları düzeltmeden risk sürer.`),'bad',true);tl('bad',(LANG_EN?`${p.name} recall`:`${p.name} geri çağırma`));}}
}
