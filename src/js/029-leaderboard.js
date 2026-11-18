/* ============================== LEADERBOARD ============================== */
const LB={st:'init',db:null,user:null,uid:null,rows:[],names:{},pend:null,writing:false,lastW:0,tm:null,werr:null};
async function lbInit(){
  try{
    if(!window.claude||typeof window.claude.use!=='function'){LB.st='off';return;}
    const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);
    if(!db){LB.st='off';UI.force=true;return;}
    LB.db=db;LB.user=user;LB.uid=user?await user.id():null;LB.st='on';UI.force=true;if(LB.uid)setTimeout(()=>clLoadMeta(),1500);
    db.collection('scores').onSnapshot(sn=>{LB.rows=sn.docs.filter(d=>d.exists).map(d=>({id:d.id,d:d.data()||{}}));lbResolve();UI.force=true;if(UI.modal&&UI.modal.kind==='scenario'&&!(document.activeElement&&document.activeElement.id==='galQ'))renderModal();},e=>{LB.st='off';LB.err=e&&e.code;UI.force=true;});
  }catch(e){LB.st='off';UI.force=true;}
}
async function lbResolve(){if(!LB.user)return;try{const ps=await LB.user.profiles(LB.rows.map(r=>r.id));const n={};for(const id in ps)n[id]=ps[id].name||'';LB.names=n;UI.force=true;}catch(e){}}
const lbMine=()=>{const r=LB.rows.find(x=>x.id===LB.uid);return r?r.d:null;};
function lbOffer(key,entry,better){
  if(LB.st!=='on'||!LB.uid)return;
  const cur=(LB.pend&&LB.pend[key])||((lbMine()||{}).best||{})[key];
  if(cur&&!better(entry,cur))return;
  LB.pend=Object.assign(LB.pend||{},{[key]:entry});lbFlush();
}
async function lbFlush(){
  if(LB.writing||!LB.pend||!LB.db)return;const now=Date.now();
  if(now-LB.lastW<20000){if(!LB.tm)LB.tm=setTimeout(()=>{LB.tm=null;lbFlush();},20000-(now-LB.lastW)+50);return;}
  const pend=LB.pend;LB.pend=null;LB.writing=true;LB.lastW=now;
  const best=Object.assign({},(lbMine()||{}).best||{},pend);
  try{const m0=lbMine()||{},doc={best,ts:now};if(Array.isArray(m0.gal))doc.gal=m0.gal;if(Array.isArray(m0.likes))doc.likes=m0.likes;await LB.db.doc('scores/'+LB.uid).set(doc);LB.werr=null;}catch(e){LB.werr=(e&&e.code)||'err';}
  LB.writing=false;UI.force=true;if(LB.pend)lbFlush();
}
const lbDiff=()=>G.diff?G.diff.n:(LANG_EN?"Normal":'Normal');
function lbMonthly(){if(G.scn&&G.scn.id==='free'&&!G.chal&&G.day>=180){const v=valuation();lbOffer('val',{v,co:G.name.slice(0,28),day:G.day,diff:lbDiff()},(a,b)=>a.v>b.v*1.02);}}
function lbScn(sc){if(String(sc.id).startsWith('u_'))return;lbOffer('scn_'+scnKey(sc.id),{stars:sc.stars,days:sc.won,co:G.name.slice(0,28),diff:lbDiff()},(a,b)=>a.stars>b.stars||(a.stars===b.stars&&a.days<b.days));}

