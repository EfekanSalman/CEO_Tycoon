/* ============================== NEWS TICKER ============================== */
const TK_CAT={urun:(LANG_EN?"Product":'Ürün'),ekip:(LANG_EN?"Team":'Ekip'),uretim:(LANG_EN?"Manufacturing":'Üretim'),finans:(LANG_EN?"Finance":'Finans'),pazar:(LANG_EN?"Market":'Pazar'),diger:(LANG_EN?"News":'Haber')};
function tkState(){return UI.tk||(UI.tk={q:[],cur:null,until:0,unread:0});}
function tkPush(n){const T=tkState();T.q.push({t:n.t,k:n.k||'',c:n.c||'diger',go:n.go||null});if(T.q.length>12)T.q.splice(0,T.q.length-12);if(n.k!=='dec')T.unread++;}
function tkAdvance(){const T=tkState(),now=performance.now();if(T.cur&&now<T.until)return false;
  if(!T.q.length){if(T.cur&&!T.cur.old){T.cur.old=true;return true;}return false;}
  let x=T.q.shift();if(x.k!=='dec'&&T.q.length>=2){const same=T.q.filter(y=>y.c===x.c&&y.k!=='dec');if(same.length){T.q=T.q.filter(y=>!same.includes(y));x={...same[same.length-1],n:same.length+1};}}
  T.cur=x;const d=x.k==='bad'||x.k==='dec'?4200:2600;T.until=now+d*(T.q.length>3?0.5:1)*a11y().toast;return true;}
function vTk(){if(!G)return '';const T=tkState(),x=T.cur,ic=ibCount();const apn=vApNote();if(apn)return `<div class="tk-in">${apn}</div>`;
  const chip=!x?(LANG_EN?"<span class=\"tk-chip c-info\">News</span>":'<span class="tk-chip c-info">Haber</span>'):x.k==='dec'?(LANG_EN?"<span class=\"tk-chip c-dec\">Decision</span>":'<span class="tk-chip c-dec">Karar</span>'):x.k==='bad'?(LANG_EN?"<span class=\"tk-chip c-bad\">Alert</span>":'<span class="tk-chip c-bad">Dikkat</span>'):x.k==='good'?(LANG_EN?"<span class=\"tk-chip c-good\">Good news</span>":'<span class="tk-chip c-good">İyi haber</span>'):`<span class="tk-chip c-info">${TK_CAT[x.c]||(LANG_EN?"News":'Haber')}</span>`;
  const txt=!x?(G.news[0]?G.news[0].t:(LANG_EN?"No news yet":'Henüz haber yok')):x.n>1?(LANG_EN?`${x.t} · +${x.n-1} similar`:`${x.t} · +${x.n-1} benzer haber`):x.t;
  return (LANG_EN?`<div class="tk-in"><button class="tk" data-act="feed" aria-label="Open news">${chip}<span class="tk-t${!x||x.old?' old':''}">${esc(txt)}</span></button>
    ${cdBtn()}${ic?`<button class="tk-dec" data-act="ibbox" aria-label="${ic} decisions pending">${ic} decisions<span class="hide-m"> pending</span></button>`:''}
    <button class="tk-run" data-act="runmonth" title="Fast-forward to month end, then pause" aria-label="Play to month end"${G.runTo!=null?' aria-pressed="true"':''}>⏭<span class="hide-m"> Month end</span></button>
    <button class="tk-run" data-act="runev" title="Play at top speed, pause at the first important development" aria-label="Play until the next event" aria-pressed="${!!UI.apRun}">⏩<span class="hide-m"> Until next event</span></button>
    <button class="tk-bell" data-act="feed" aria-label="News${T.unread?`, ${T.unread} unread`:''}">News${T.unread?`<b>${T.unread>99?'99+':T.unread}</b>`:''}</button></div>`:`<div class="tk-in"><button class="tk" data-act="feed" aria-label="Haberleri aç">${chip}<span class="tk-t${!x||x.old?' old':''}">${esc(txt)}</span></button>
    ${cdBtn()}${ic?`<button class="tk-dec" data-act="ibbox" aria-label="${ic} karar bekliyor">${ic} karar<span class="hide-m"> bekliyor</span></button>`:''}
    <button class="tk-run" data-act="runmonth" title="Ay sonuna kadar hızlı oynat, sonra duraklat" aria-label="Ay sonuna kadar oynat"${G.runTo!=null?' aria-pressed="true"':''}>⏭<span class="hide-m"> Ay sonu</span></button>
    <button class="tk-run" data-act="runev" title="En yüksek hızda oynat, ilk önemli gelişmede duraklat" aria-label="Sıradaki olaya kadar oynat" aria-pressed="${!!UI.apRun}">⏩<span class="hide-m"> Olaya kadar</span></button>
    <button class="tk-bell" data-act="feed" aria-label="Haberler${T.unread?`, ${T.unread} okunmamış`:''}">Haberler${T.unread?`<b>${T.unread>99?'99+':T.unread}</b>`:''}</button></div>`);}
function vFeed(){const T=tkState(),L=G.news.slice(0,30),u=UI.feedU||0;
  return (LANG_EN?`<div class="eyebrow">News</div><h2>Latest updates</h2>
    <ul class="news feed">${L.map((n,i)=>{const g=n.go||navFind(n.t);return `<li class="${n.k}${i<u?' unread':''}"><time>${fmtDate(n.d)}</time><span><span class="tk-chip ${n.k==='bad'?'c-bad':n.k==='good'?'c-good':'c-info'}">${TK_CAT[newsCat(n)]||"News"}</span> ${n.imp?'<b>':''}${esc(n.t)}${n.imp?'</b>':''}${g?` <button class="btn sm ghost news-go" data-act="tab" data-tab="${g}">Go</button>`:''}</span></li>`;}).join('')||"<li>No news yet.</li>"}</ul>
    <div class="row" style="margin-top:10px"><button class="btn" data-act="tab" data-tab="stats:haber">News archive</button><button class="btn primary" data-act="close">Close</button></div>`:`<div class="eyebrow">Haberler</div><h2>Son gelişmeler</h2>
    <ul class="news feed">${L.map((n,i)=>{const g=n.go||navFind(n.t);return `<li class="${n.k}${i<u?' unread':''}"><time>${fmtDate(n.d)}</time><span><span class="tk-chip ${n.k==='bad'?'c-bad':n.k==='good'?'c-good':'c-info'}">${TK_CAT[newsCat(n)]||'Haber'}</span> ${n.imp?'<b>':''}${esc(n.t)}${n.imp?'</b>':''}${g?` <button class="btn sm ghost news-go" data-act="tab" data-tab="${g}">Git</button>`:''}</span></li>`;}).join('')||'<li>Henüz haber yok.</li>'}</ul>
    <div class="row" style="margin-top:10px"><button class="btn" data-act="tab" data-tab="stats:haber">Haber arşivi</button><button class="btn primary" data-act="close">Kapat</button></div>`);}
setInterval(()=>{if(G&&tkAdvance()){const tr=document.getElementById('tkrow');if(tr)patch(tr,vTk());}},400);

