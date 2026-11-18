/* ============================== SEASONS ============================== */
const SEASON_OF=['kis','kis','ilk','ilk','ilk','yaz','yaz','yaz','son','son','son','kis'];
const SEASON_TR={kis:(LANG_EN?"Winter":'Kış'),ilk:(LANG_EN?"Spring":'İlkbahar'),yaz:(LANG_EN?"Summer":'Yaz'),son:(LANG_EN?"Fall":'Sonbahar')};
const curSeason=()=>SEASON_OF[dateOf(G.day).getMonth()];
const holidayLights=()=>{const d=dateOf(G.day),m=d.getMonth(),dd=d.getDate();return (m===11)||(m===0&&dd<=7);};
/* pencere camında mevsim: dışarıdaki ağaç tepeleri ve yağan kar, yaprak ya da çiçek */
function seasonPane(x0,x1,z0,z1,k,now){
  if(!PREF.season)return;const ctx=OV.ctx,s=OV.s,se=curSeason(),xa=x0+0.07,xb=x1-0.07,za=z0+3,zb=z1-3;
  ctx.save();ctx.beginPath();const q=[P(xa,0,za),P(xb,0,za),P(xb,0,zb),P(xa,0,zb)];ctx.moveTo(...q[0]);for(const p of q.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.clip();
  const dim=PREF.dn==='off'?1:0.45+0.55*DN.dl;
  const crown={ilk:['#8BC48A','#6FAF6E'],yaz:['#4F9D4A','#3E8A3B'],son:['#E08A2E','#C2571A'],kis:null}[se];
  if(crown){ctx.globalAlpha=dim;for(let i=0;i<3;i++){const u=hash(k*7+i)*0.9+0.05,[a,b]=P(xa+u*(xb-xa),0,za+4+hash(k*3+i)*6);ctx.fillStyle=crown[i%2];ctx.beginPath();ctx.ellipse(a,b,(10+hash(k+i*5)*8)*s,(7+hash(k*2+i)*5)*s,0,0,Math.PI*2);ctx.fill();
    if(se==='ilk'){ctx.fillStyle='#F7B6CF';for(let j=0;j<4;j++){ctx.fillRect(a+(hash(i*13+j+k)-0.5)*16*s,b+(hash(i*7+j*3+k)-0.5)*9*s,2*s,2*s);}}}
    ctx.globalAlpha=1;}
  if(se==='kis'){const [a1,b1]=P(xa,0,za),[a2,b2]=P(xb,0,za),[a3,b3]=P(xb,0,za+5),[a4,b4]=P(xa,0,za+5);ctx.fillStyle='rgba(245,248,255,.95)';ctx.beginPath();ctx.moveTo(a1,b1);ctx.lineTo(a2,b2);ctx.lineTo(a3,b3);ctx.lineTo(a4,b4);ctx.closePath();ctx.fill();}
  if(se==='yaz'&&k===1&&DN.dl>0.6){const [a,b]=P(xa+(xb-xa)*0.7,0,zb-8);const g=ctx.createRadialGradient(a,b,0,a,b,16*s);g.addColorStop(0,'rgba(255,236,150,.95)');g.addColorStop(1,'rgba(255,236,150,0)');ctx.fillStyle=g;ctx.fillRect(a-16*s,b-16*s,32*s,32*s);}
  const n=se==='kis'?14:se==='son'?7:se==='ilk'?5:0,t=now/1000;
  for(let i=0;i<n;i++){const sp=se==='kis'?0.09+hash(k*17+i)*0.06:0.07+hash(k*11+i)*0.05,v=(hash(k*23+i*7)+t*sp)%1;
    let u=hash(k*29+i*3)+Math.sin(t*1.3+i)*0.04+(se==='son'?v*0.35:0);u=((u%1)+1)%1;
    const [a,b]=P(xa+u*(xb-xa),0,zb-v*(zb-za));
    if(se==='kis'){ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.arc(a,b,(0.9+hash(i+k)*0.9)*s,0,Math.PI*2);ctx.fill();}
    else{ctx.save();ctx.translate(a,b);ctx.rotate(t*2+i);ctx.fillStyle=se==='son'?['#D9480F','#E8590C','#B5651D','#F2A03D'][i%4]:['#F7A8C4','#FFFFFF'][i%2];ctx.fillRect(-1.6*s,-1*s,3.2*s,2*s);ctx.restore();}}
  ctx.restore();
}
/* yılbaşı ışıkları: duvar üst kenarı boyunca yanıp sönen ampuller */
function drawHolidayLights(W,H,wallH,now){
  if(!PREF.season||!holidayLights())return;const ctx=OV.ctx,s=OV.s,cols=['#E03131','#2F9E44','#F59F00','#1C7ED6'];
  const pts=[];for(let y=H-0.3;y>=0;y-=0.45)pts.push([0,y]);for(let x=0.45;x<=W-0.2;x+=0.45)pts.push([x,0]);
  pts.forEach(([x,y],i)=>{const [a,b]=P(x,y,wallH-5-Math.abs(Math.sin(i*1.7))*3);const on=(Math.floor(now/500)+i)%3!==0;
    ctx.fillStyle=cols[i%4];ctx.globalAlpha=on?1:0.35;ctx.beginPath();ctx.arc(a,b,1.8*s,0,Math.PI*2);ctx.fill();
    if(on&&DN.dl<0.6){ctx.globalAlpha=0.25;ctx.beginPath();ctx.arc(a,b,4.5*s,0,Math.PI*2);ctx.fill();}});
  ctx.globalAlpha=1;
}
const dnClock=()=>{const h=Math.floor(DN.h)%24,m=Math.floor((DN.h%1)*60);return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');};

