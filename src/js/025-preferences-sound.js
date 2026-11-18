/* ============================== PREFERENCES & SOUND ============================== */
const PREF_KEY='silikon-garaj-prefs';
const PREF=(()=>{let p={};try{p=JSON.parse(localStorage.getItem(PREF_KEY)||'{}')||{};}catch(e){}return Object.assign({sfx:true,music:false,vol:0.6,mute:false,dn:'game',season:true,brandUI:false,stageAuto:false,wrapOff:false,tipsOff:false,decide:'urgent',feelOff:false,cloudAuto:false,aiPress:false},p);})();
function prefSave(){try{localStorage.setItem(PREF_KEY,JSON.stringify(PREF));}catch(e){}}
