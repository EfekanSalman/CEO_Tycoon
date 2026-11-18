/* ============================== DAY & NIGHT ============================== */
const DN={min:9*60,dl:1,h:9};
function dnUpdate(dt){
  if(PREF.dn==='game'&&G&&G.speed&&!G.pending&&!G.over)DN.min=(DN.min+dt/1000*12)%1440;
  const h=PREF.dn==='off'?13:PREF.dn==='real'?(()=>{const d=new Date();return d.getHours()+d.getMinutes()/60;})():DN.min/60;
  const ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
  DN.h=h;DN.dl=PREF.dn==='off'?1:ss(5.5,8,h)*(1-ss(18,20.5,h));
}
const hexRgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mixHex=(a,b,t)=>{const A=hexRgb(a),B=hexRgb(b);return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')})`;};
const SKY={night:['#0B1430','#1E2C52'],dawn:['#F3A27B','#A9C8EA'],day:['#7FB7F0','#CFE6FA'],dusk:['#EE8A62','#5A4A8C']};
function skyCols(C){if(PREF.dn==='off')return [C.sky,C.sky2];const h=DN.h;
  const seg=[[0,'night'],[5,'night'],[6.5,'dawn'],[8.5,'day'],[17,'day'],[19,'dusk'],[20.5,'night'],[24,'night']];
  for(let i=0;i<seg.length-1;i++){const [a,ka]=seg[i],[b,kb]=seg[i+1];if(h>=a&&h<=b){const t=b>a?(h-a)/(b-a):0;return [0,1].map(j=>mixHex(SKY[ka][j],SKY[kb][j],t));}}
  return SKY.day;}
