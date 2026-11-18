/* ============================== PERSONALITY ============================== */
const TRAITS={
  perf:{n:(LANG_EN?"Perfectionist":'Mükemmeliyetçi'),d:(LANG_EN?"Product quality +8%, output −10%":'Ürün kalitesi +%8, üretim −%10'),k:'mix'},
  fast:{n:(LANG_EN?"Hard-working":'Çalışkan'),d:(LANG_EN?"Output +12%, fatigue +30%":'Üretim +%12, yorulma +%30'),k:'mix'},
  lazy:{n:(LANG_EN?"Lazy":'Tembel'),d:(LANG_EN?"Output −15%, fatigue −40%":'Üretim −%15, yorulma −%40'),k:'neg'},
  leader:{n:(LANG_EN?"Natural leader":'Lider ruhlu'),d:(LANG_EN?"Department peers get morale +3 and XP +25%; 1.5x effect as a manager":'Departman arkadaşlarına moral +3, deneyim +%25; yönetici olursa etkisi 1,5 kat'),k:'pos'},
  toxic:{n:(LANG_EN?"Combative":'Kavgacı'),d:(LANG_EN?"Department peers on the same floor get morale −5":'Aynı kattaki departman arkadaşlarına moral −5'),k:'neg'},
  helper:{n:(LANG_EN?"Helpful":'Yardımsever'),d:(LANG_EN?"Department peers on the same floor get output +3% and morale +2":'Aynı kattaki departman arkadaşlarına üretim +%3 ve moral +2'),k:'pos'},
  ambit:{n:(LANG_EN?"Ambitious":'Hırslı'),d:(LANG_EN?"XP +40%; morale drops fast if a promotion is delayed":'Deneyim +%40; terfi bekletilirse morali çabuk düşer'),k:'mix'},
  loyal:{n:(LANG_EN?"Loyal":'Sadık'),d:(LANG_EN?"Hard to lure with rival offers; rarely resigns":'Rakip tekliflerine zor kapılır, zor istifa eder'),k:'pos'},
  creative:{n:(LANG_EN?"Creative":'Yaratıcı'),d:(LANG_EN?"Product quality +5%; occasional bright ideas speed up the project":'Ürün kalitesi +%5, ara sıra parlak fikirlerle projeyi hızlandırır'),k:'pos'},
  careless:{n:(LANG_EN?"Sloppy":'Dağınık'),d:(LANG_EN?"Output +5% but product quality −8%":'Üretim +%5 ama ürün kalitesi −%8'),k:'neg'},
  learner:{n:(LANG_EN?"Fast learner":'Hızlı öğrenen'),d:(LANG_EN?"Skill growth +60%":'Yetenek gelişimi +%60'),k:'pos'},
  merc:{n:(LANG_EN?"Money-driven":'Para odaklı'),d:(LANG_EN?"Salary affects morale 1.6x; open to rival offers":'Maaş morali 1,6 kat etkiler; rakip tekliflerine açık'),k:'mix'},
  social:{n:(LANG_EN?"Social":'Sosyal'),d:(LANG_EN?"Gets 1.5x morale from furniture, takes frequent breaks, output −3%":'Mobilyalardan 1,5 kat moral alır, sık mola verir, üretim −%3'),k:'mix'},
  calm:{n:(LANG_EN?"Stress-resistant":'Stres dayanıklı'),d:(LANG_EN?"No morale penalty at a heavy pace, fatigue −30%":'Yoğun tempoda moral cezası yok, yorulma −%30'),k:'pos'},
};
const TRAIT_CONFLICT=[['fast','lazy'],['perf','careless'],['loyal','merc'],['toxic','helper']];
function pickTraits(){
  const keys=Object.keys(TRAITS),out=[pick(keys)];
  if(Math.random()<0.6)for(let i=0;i<12;i++){const t=pick(keys);if(t!==out[0]&&!TRAIT_CONFLICT.some(([a,b])=>(a===t&&b===out[0])||(b===t&&a===out[0]))){out.push(t);break;}}
  return out;
}
const hasT=(e,t)=>!!(e&&e.tr&&e.tr.includes(t));
const isToxic=e=>hasT(e,'toxic')&&!((e.calmed||0)>G.day);
const knownTraits=e=>(e.tr||[]).filter((t,i)=>i===0||e.rev);
const TT={key:'',m:{},d:-1,n:-1,c:-1,g:null};
function teamTraits(e){
  const c=ttCount(e);
  return {toxic:c.toxic-(isToxic(e)?1:0),leader:c.leader-(hasT(e,'leader')?1:0),helper:c.helper-(hasT(e,'helper')?1:0)};
}
function ttReset(){
  if(TT.key===''||TT.d!==G.day||TT.n!==G.emps.length||TT.c!==(G.careerVer||0)||TT.g!==G||TT.dv!==DESKV){TT.key='k';TT.d=G.day;TT.n=G.emps.length;TT.c=G.careerVer||0;TT.g=G;TT.dv=DESKV;TT.m={};}
}
/* rol+kat başına kişilik sayıları: tüm kadro tek geçişte sayılır (önceden her rol/kat için ayrı tarama yapılıyordu) */
const TT0={toxic:0,leader:0,helper:0};
function ttCount(e){ttReset();if(TT.m.__all!==true){const m={__all:true};for(const o of G.emps){if(o.leave||!o.tr)continue;const tx=isToxic(o),ld=hasT(o,'leader'),hp=hasT(o,'helper');if(!tx&&!ld&&!hp)continue;
    const kk=o.role+':'+empFloor(o),c=m[kk]||(m[kk]={toxic:0,leader:0,helper:0});if(tx)c.toxic++;if(ld)c.leader++;if(hp)c.helper++;}TT.m=m;}
  return TT.m[e.role+':'+empFloor(e)]||TT0;}
/* kişiliğin sabit üretim çarpanı, tr dizisi başına bir kez (diziler yerinde değiştirilmez, yenisi atanır) */
const TOW=new WeakMap();
function traitOut(e){
  let m=1;if(e.tr){m=TOW.get(e.tr);if(m===undefined){m=1;if(hasT(e,'fast'))m*=1.12;if(hasT(e,'lazy'))m*=0.85;if(hasT(e,'perf'))m*=0.9;if(hasT(e,'careless'))m*=1.05;if(hasT(e,'social'))m*=0.97;TOW.set(e.tr,m);}}
  const h=ttCount(e).helper-(hasT(e,'helper')?1:0);return m*(1+Math.min(0.09,h*0.03));
}
const traitQ=e=>(hasT(e,'perf')?1.08:1)*(hasT(e,'creative')?1.05:1)*(hasT(e,'careless')?0.92:1);
const traitDrain=e=>(hasT(e,'fast')?1.3:1)*(hasT(e,'lazy')?0.6:1)*(hasT(e,'calm')?0.7:1);
const traitXP=e=>(hasT(e,'ambit')?1.4:1)*(hasT(e,'leader')?1.25:1)*(mentorOf(e)?1.5:1);
function traitChips(e,withHidden=true){
  const cls={pos:'st-ok',neg:'st-bad',mix:'st-warn'};
  let h=knownTraits(e).map(t=>`<span class="chip ${cls[TRAITS[t].k]}" title="${esc(TRAITS[t].d)}">${TRAITS[t].n}</span>`).join(' ');
  if(withHidden&&(e.tr||[]).length>1&&!e.rev)h+=(LANG_EN?` <span class="chip st-mute" title="Revealed as you work together">? hidden</span>`:` <span class="chip st-mute" title="Birlikte çalıştıkça ortaya çıkar">? gizli</span>`);
  return h;
}
const CLASH={id:'clash',w:2,choice:true,
  cond:()=>G.emps.some(e=>isToxic(e)&&!e.leave&&teamTraits(e).toxic+G.emps.filter(o=>o!==e&&o.role===e.role&&!o.leave&&empFloor(o)===empFloor(e)).length>0),
  make:()=>{const e=pick(G.emps.filter(e=>isToxic(e)&&!e.leave&&G.emps.some(o=>o!==e&&o.role===e.role&&!o.leave&&empFloor(o)===empFloor(e))));
    const o=pick(G.emps.filter(o=>o!==e&&o.role===e.role&&!o.leave&&empFloor(o)===empFloor(e)));return {a:e.id,b:o.id};},
  view:d=>{const a=G.emps.find(x=>x.id===d.a),b=G.emps.find(x=>x.id===d.b);
    return {t:(LANG_EN?"Team tension":'Ekipte gerginlik'),b:(LANG_EN?`The argument between ${a?a.name:"An employee"} and ${b?b.name:"a teammate"} is starting to affect the whole ${a?ROLES[a.role].n.toLocaleLowerCase(LOC):''} team.`:`${a?a.name:'Bir çalışan'} ile ${b?b.name:'ekip arkadaşı'} arasındaki tartışma bütün ${a?ROLES[a.role].n.toLocaleLowerCase(LOC):''} ekibini etkilemeye başladı.`),
      o:[{t:(LANG_EN?`Bring in a mediator (${money(15000)})`:`Arabulucu getir (${money(15000)})`),d:(LANG_EN?"Both get a morale boost; the troublemaker calms down for 4 months.":'İkisinin de morali yükselir; kavgacı çalışan 4 ay boyunca sakinleşir.')},
        {t:`${a?a.name:(LANG_EN?"the troublemaker":'Kavgacı çalışanı')} uyar`,d:(LANG_EN?"Morale drops by 10; 50% chance they stay calm for 3 months.":'Morali 10 düşer; %50 ihtimalle 3 ay sakin kalır.')},
        {t:(LANG_EN?"Ignore it":'Görmezden gel'),d:(LANG_EN?"Everyone on the team loses 4 morale.":'Ekipteki herkesin morali 4 düşer.')}]};},
  pick(d,i){const a=G.emps.find(x=>x.id===d.a),b=G.emps.find(x=>x.id===d.b);if(!a)return;
    if(i===0){spend(15000,'other');a.calmed=G.day+120;a.morale=Math.min(100,a.morale+6);if(b)b.morale=Math.min(100,b.morale+6);news((LANG_EN?`${a.name} and ${b?b.name:"a teammate"} settled things with the mediator.`:`${a.name} ve ${b?b.name:'ekip arkadaşı'} arabulucuyla anlaştı.`),'good');}
    else if(i===1){a.morale=Math.max(0,a.morale-10);if(Math.random()<0.5){a.calmed=G.day+90;news((LANG_EN?`${a.name} took the warning seriously.`:`${a.name} uyarıyı ciddiye aldı.`),'good');}else news((LANG_EN?`${a.name} didn't change despite the warning.`:`${a.name} uyarıya rağmen değişmedi.`),'bad');}
    else{for(const o of G.emps)if(o.role===a.role&&empFloor(o)===empFloor(a))o.morale=Math.max(0,o.morale-4);news((LANG_EN?"The tension on the team continues.":'Ekipteki gerginlik sürüyor.'),'bad');}
    G.careerVer=(G.careerVer||0)+1;}};
EVENTS.push(CLASH);EVD.clash=CLASH;

