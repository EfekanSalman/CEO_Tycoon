/* ============================== DATA ============================== */
/* Dil: localStorage'daki seçim, yoksa tarayıcı dili. Metinler derlemede (LANG_EN?en:tr) biçimine çevrilir (tools/i18n). */
const LANG_KEY='silikon-garaj-lang';
const LANG_EN=(()=>{try{const v=localStorage.getItem(LANG_KEY);if(v)return v==='en';}catch(e){}try{return !/^tr/i.test(navigator.language||'tr');}catch(e){return false;}})();
const LOC=LANG_EN?(LANG_EN?"en-US":'en-US'):'tr-TR';
const MONTHS=[(LANG_EN?"Jan":'Oca'),(LANG_EN?"Feb":'Şub'),(LANG_EN?"Mar":'Mar'),(LANG_EN?"Apr":'Nis'),(LANG_EN?"May":'May'),(LANG_EN?"Jun":'Haz'),(LANG_EN?"Jul":'Tem'),(LANG_EN?"Aug":'Ağu'),(LANG_EN?"Sep":'Eyl'),(LANG_EN?"Oct":'Eki'),(LANG_EN?"Nov":'Kas'),(LANG_EN?"Dec":'Ara')];
const CATS={
  app:  {n:(LANG_EN?"Mobile App":'Mobil Uygulama'), S0:100,g:0.12,d0:3000000,dg:0.18,ref:0,  unit:(LANG_EN?"users":'kullanıcı'),arpu:0.18,camp:20000, d:(LANG_EN?"Ad-supported free app. The fastest start.":'Reklam gelirli ücretsiz uygulama. En hızlı başlangıç.')},
  saas: {n:(LANG_EN?"Web Service":'Web Servisi'),    S0:100,g:0.12,d0:150000,  dg:0.18,ref:14, unit:(LANG_EN?"subscribers":'abone'),camp:40000, d:(LANG_EN?"Monthly subscription. Requires server racks.":'Aylık abonelik. Sunucu rafı gerektirir.')},
  os:   {n:(LANG_EN?"Operating System":'İşletim Sistemi'),S0:100,g:0.10,d0:150000, dg:0.10,ref:15, unit:(LANG_EN?"licenses":'lisans'),camp:90000, d:(LANG_EN?"License it to other companies, use it free on your own devices.":'Diğer firmalara lisansla, kendi cihazlarında bedava kullan.')},
  cpu:  {n:(LANG_EN?"Processor":'İşlemci'),        S0:60, g:0.20,d0:90000, dg:0.10,ref:75, unit:(LANG_EN?"units":'adet'),camp:150000, d:(LANG_EN?"Your own chip. Make it at a foundry or in your own factory.":'Kendi çipin. Dökümhanede ya da kendi fabrikanda üret.')},
  phone:{n:(LANG_EN?"Phone":'Telefon'),        S0:100,g:0.16,d0:60000, dg:0.12,ref:300,unit:(LANG_EN?"units":'adet'),camp:200000, d:(LANG_EN?"Source the parts, assemble at a contract manufacturer or your own factory.":'Parçaları tedarik et, fason ya da kendi fabrikanda monte et.')},
  pc:   {n:(LANG_EN?"Computer":'Bilgisayar'),     S0:110,g:0.14,d0:32000,  dg:0.05,ref:500,unit:(LANG_EN?"units":'adet'),camp:120000, d:(LANG_EN?"Pick the processor, RAM, storage and OS, then assemble.":'İşlemci, RAM, depolama ve OS seç, montajını yap.')},
  wear: {n:(LANG_EN?"Wearable":'Giyilebilir'),    S0:50, g:0.12,d0:18000,  dg:0.22,ref:180,unit:(LANG_EN?"units":'adet'),camp:80000, d:(LANG_EN?"Smartwatches and wireless earbuds. Sells better alongside your own phone.":'Akıllı saat ve kablosuz kulaklık. Kendi telefonunla birlikte daha çok satar.')},
  console:{n:(LANG_EN?"Game Console":'Oyun Konsolu'), S0:75, g:0.14,d0:25000,  dg:0.05,ref:400,unit:(LANG_EN?"units":'adet'),camp:180000, d:(LANG_EN?"Sell at a thin margin, earn game licensing revenue from every console sold.":'Düşük kârla sat, satılan her konsoldan oyun lisans geliri al.')},
  ai:   {n:(LANG_EN?"AI Service":'Yapay Zekâ Hizmeti'),S0:100,g:0.25,d0:6000,dg:0.55,logi:{cap:3e6,mid:12,k:2.2},ref:20, unit:(LANG_EN?"subscribers":'abone'),camp:60000, d:(LANG_EN?"Subscription AI assistant. The market grows fast but needs lots of server power.":'Abonelikle yapay zekâ asistanı. Pazar hızla büyür ama çok sunucu gücü ister.')},
  xr:   {n:(LANG_EN?"VR/AR Headset":'VR/AR Gözlük'),   S0:80, g:0.16,d0:0,logi:{cap:150000,mid:9,k:2},dg:0,ref:450,unit:(LANG_EN?"units":'adet'),camp:150000, d:(LANG_EN?"Virtual and augmented reality headset. The market starts small and grows over the years.":'Sanal ve artırılmış gerçeklik gözlüğü. Pazar küçük başlar, yıllar içinde büyür.')},
  car:  {n:(LANG_EN?"Automotive Software":'Araç Yazılımı'),  S0:100,g:0.14,d0:0,logi:{cap:3e6,mid:8,k:2.2},dg:0,ref:25, unit:(LANG_EN?"vehicles":'araç'),camp:100000, d:(LANG_EN?"Monthly per-vehicle license for EV makers. Make mistakes and you face recalls.":'Elektrikli araç üreticilerine araç başına aylık lisans. Hata yaparsan geri çağırma gelir.')},
  robo: {n:(LANG_EN?"Robotics":'Robotik'),        S0:80, g:0.15,d0:0,logi:{cap:40000,mid:13,k:2},dg:0,ref:9000,unit:(LANG_EN?"units":'adet'),camp:300000, d:(LANG_EN?"Moonshot: costly research, long development, uncertain field tests. The market explodes years later.":'Ay projesi: pahalı araştırma, uzun geliştirme, belirsiz saha testi. Pazar yıllar sonra patlar.')},
  iot:  {n:(LANG_EN?"Smart Home":'Akıllı Ev'),      S0:50, g:0.12,d0:0,logi:{cap:600000,mid:7,k:2.5},dg:0,ref:60,unit:(LANG_EN?"units":'adet'),camp:100000, d:(LANG_EN?"Smart plugs, cameras, speakers and thermostats. Cheap and sells well; the installed base brings cloud subscriptions.":'Akıllı priz, kamera, hoparlör ve termostat. Ucuz ve çok satılır; kurulu taban bulut aboneliği getirir.')},
  qc:   {n:(LANG_EN?"Quantum Computer":'Kuantum Bilgisayar'),S0:46,g:0.05,d0:0,logi:{cap:40,mid:16,k:2.5},dg:0,ref:8e6,unit:(LANG_EN?"systems":'sistem'),camp:500000, d:(LANG_EN?"Moonshot: multimillion-dollar systems for national labs and cloud giants. The market opens in the 2030s.":'Ay projesi: ulusal laboratuvarlara ve bulut devlerine milyonlarca dolarlık sistemler. Pazar 2030\'larda açılır.')},
};
const CAT_ORDER=['app','saas','os','cpu','phone','pc','wear','console','ai','xr','car','robo','iot','qc'];
const HW=['cpu','phone','pc','wear','console','xr','robo','iot','qc'];
const CAT_RES={os:'os',cpu:'chip',phone:'mobile',pc:'pc',wear:'wear',console:'console',ai:'ml',xr:'xr',car:'ev',robo:'robo1',iot:'iot1',qc:'qc1'};
const DEVICE=['phone','pc','wear','console','xr','robo','iot','qc'];
const NO_OS=['console','robo','iot','qc'];
/* müşteri segmentleri: q = kaliteye duyarlılık, p = fiyata duyarlılık, px = ödemeye razı olduğu fiyat, bw = marka ağırlığı */
const SEGS=['eco','main','pro'];
const SEG={eco:{q:2,p:2.6,px:0.75,bw:0.5},main:{q:3,p:1.8,px:1,bw:1},pro:{q:4,p:1.0,px:1.35,bw:1.4}};
for(const k in SEG)SEG[k].n=1/Math.pow(SEG[k].px,SEG[k].p);
const SEG_W={app:[0.5,0.35,0.15],saas:[0.3,0.45,0.25],os:[0.3,0.5,0.2],cpu:[0.35,0.45,0.2],phone:[0.4,0.4,0.2],pc:[0.35,0.45,0.2],wear:[0.4,0.45,0.15],console:[0.3,0.5,0.2],ai:[0.35,0.4,0.25],xr:[0.3,0.45,0.25],car:[0.3,0.45,0.25],robo:[0.25,0.45,0.3],iot:[0.45,0.4,0.15],qc:[0.1,0.4,0.5]};
const segW=(cat,s)=>SEG_W[cat][SEGS.indexOf(s)];
const SEG_N={hw:[(LANG_EN?"Budget":'Fiyat odaklı'),(LANG_EN?"Mainstream":'Ana akım'),(LANG_EN?"Discerning":'Meraklı')],biz:[(LANG_EN?"Consumer":'Bireysel'),(LANG_EN?"Small business":'Küçük işletme'),(LANG_EN?"Enterprise":'Kurumsal')],app:[(LANG_EN?"Freeloader":'Ücretsizci'),(LANG_EN?"General user":'Genel kullanıcı'),(LANG_EN?"Power user":'Yoğun kullanıcı')],console:[(LANG_EN?"Casual gamer":'Gündelik oyuncu'),(LANG_EN?"Gamer":'Oyuncu'),(LANG_EN?"Hardcore gamer":'Hardcore oyuncu')],car:[(LANG_EN?"Budget brands":'Bütçe markalar'),(LANG_EN?"Mainstream makers":'Ana akım üreticiler'),(LANG_EN?"Premium brands":'Premium markalar')],robo:[(LANG_EN?"Home user":'Ev kullanıcısı'),(LANG_EN?"Business":'İşletme'),(LANG_EN?"Industry":'Sanayi')],qc:[(LANG_EN?"University":'Üniversite'),(LANG_EN?"Cloud provider":'Bulut sağlayıcı'),(LANG_EN?"National lab":'Ulusal laboratuvar')]};
const segKind=cat=>cat==='app'?'app':cat==='console'?'console':cat==='car'?'car':cat==='robo'?'robo':cat==='qc'?'qc':(cat==='saas'||cat==='os'||cat==='ai')?'biz':'hw';
const segN=(cat,s)=>SEG_N[segKind(cat)][SEGS.indexOf(s)];
const SEG_D={eco:(LANG_EN?"Very price-sensitive, cares little about quality or brand. Picks the cheap, good-enough product.":'Fiyata çok duyarlı, kaliteye az bakar, markayı pek önemsemez. Ucuz ve yeterli ürünü seçer.'),
  main:(LANG_EN?"Balances price and quality. Both your brand and product freshness matter.":'Fiyatla kaliteyi dengeler. Markan ve ürünün güncelliği ikisi de önemli.'),
  pro:(LANG_EN?"Cares a lot about quality and brand, accepts a 35% higher price. Enterprise looks at support satisfaction, enthusiasts at press score.":'Kaliteye ve markaya çok önem verir, %35 daha yüksek fiyatı kabul eder. Kurumsal müşteri destek memnuniyetine, meraklı basın puanına bakar.')};
const CHANNELS={
  social:{n:(LANG_EN?"Social media":'Sosyal medya'),scale:15000,rw:0.03,seg:{eco:1,main:0.8,pro:0.3},cat:{app:1,wear:1,phone:0.8,console:0.8,ai:0.7,pc:0.5,saas:0.4,os:0.3,cpu:0.2,xr:0.8,car:0.2,robo:0.3,iot:0.8,qc:0.1},d:(LANG_EN?"Cheap and fast. Reaches young and budget buyers, gives your brand a small boost.":'Ucuz ve hızlı. Gençlere ve fiyat odaklılara ulaşır, markaya biraz katkı verir.')},
  search:{n:(LANG_EN?"Search & digital ads":'Arama ve dijital reklam'),scale:25000,rw:0.04,seg:{eco:0.7,main:1,pro:0.7},cat:{saas:1,ai:1,app:0.9,pc:0.7,phone:0.6,wear:0.6,console:0.5,os:0.5,cpu:0.5,xr:0.6,car:0.5,robo:0.6,iot:0.7,qc:0.3},d:(LANG_EN?"Catches people ready to buy. The most efficient channel for software.":'Satın almaya hazır kişileri yakalar. Yazılımda en verimli kanal.')},
  influencer:{n:(LANG_EN?"Influencers":'Fenomenler'),scale:35000,rw:0.04,seg:{eco:0.8,main:0.7,pro:0.9},cat:{wear:1,console:1,phone:1,app:0.7,cpu:0.6,pc:0.5,ai:0.5,saas:0.2,os:0.2,xr:1,car:0.3,robo:0.6,iot:0.8,qc:0.1},d:(LANG_EN?"Strong for devices. Sometimes goes viral, sometimes turns into a scandal.":'Cihazlarda güçlü. Bazen viral olur, bazen skandala döner.')},
  tv:{n:(LANG_EN?"TV & outdoor":'TV ve açık hava'),scale:150000,rw:0.08,seg:{eco:0.8,main:1,pro:0.4},cat:{phone:1,console:0.9,pc:0.8,wear:0.8,ai:0.7,app:0.6,os:0.5,saas:0.4,cpu:0.3,xr:0.6,car:0.3,robo:0.5,iot:0.6,qc:0.2},d:(LANG_EN?"Expensive but reaches a wide audience, growing your brand every month.":'Pahalı ama geniş kitleye ulaşır, markanı her ay büyütür.')},
  events:{n:(LANG_EN?"Trade shows & conferences":'Fuar ve konferanslar'),scale:60000,rw:0.04,seg:{eco:0.1,main:0.5,pro:1},cat:{cpu:1,os:1,saas:1,ai:1,console:0.8,pc:0.7,phone:0.6,wear:0.5,app:0.3,xr:0.8,car:1,robo:1,iot:0.4,qc:1},d:(LANG_EN?"Reaches enterprise and enthusiast customers, raises awareness in regions you've entered.":'Kurumsal ve meraklı müşterilere ulaşır, girdiğin bölgelerde bilinirliği artırır.')},
  retail:{n:(LANG_EN?"Retail display":'Perakende vitrin'),scale:90000,rw:0.06,seg:{eco:1,main:1,pro:0.5},cat:{phone:1,pc:1,wear:1,console:1,cpu:0.6,os:0.2,app:0,saas:0,ai:0,xr:0.9,car:0,robo:0.5,iot:1,qc:0},d:(LANG_EN?"Stand out on store shelves. Only works for hardware.":'Mağaza raflarında öne çıkarsın. Yalnızca donanımda işe yarar.')},
};
const CH_ORDER=Object.keys(CHANNELS);
const CAT_ICON={
  app:'<svg viewBox="0 0 26 26"><rect x="7" y="2" width="12" height="22"/><path d="M11 20h4"/></svg>',
  saas:'<svg viewBox="0 0 26 26"><path d="M7 19a5 5 0 0 1 0-10 7 7 0 0 1 13 2 4 4 0 0 1 0 8z"/></svg>',
  os:'<svg viewBox="0 0 26 26"><rect x="3" y="4" width="20" height="16"/><path d="M3 8h20M8 14l3 2-3 2M13 18h5"/></svg>',
  cpu:'<svg viewBox="0 0 26 26"><rect x="6" y="6" width="14" height="14"/><rect x="10" y="10" width="6" height="6"/><path d="M10 2v4M16 2v4M10 20v4M16 20v4M2 10h4M2 16h4M20 10h4M20 16h4"/></svg>',
  phone:'<svg viewBox="0 0 26 26"><rect x="7" y="2" width="12" height="22" rx="2"/><circle cx="13" cy="20" r="1"/><path d="M11 5h4"/></svg>',
  pc:'<svg viewBox="0 0 26 26"><rect x="3" y="4" width="20" height="13"/><path d="M1 21h24M9 17v4M17 17v4"/></svg>',
  wear:'<svg viewBox="0 0 26 26"><rect x="7" y="7" width="12" height="12" rx="3"/><path d="M9 7l1-5h6l1 5M9 19l1 5h6l1-5M13 10v3l2 2"/></svg>',
  console:'<svg viewBox="0 0 26 26"><path d="M6 8h14a4 4 0 0 1 4 4l1 6a3 3 0 0 1-5 2l-2-3H8l-2 3a3 3 0 0 1-5-2l1-6a4 4 0 0 1 4-4z"/><path d="M7 11v4M5 13h4"/><circle cx="18" cy="12" r="1"/><circle cx="20" cy="14.5" r="1"/></svg>',
  xr:'<svg viewBox="0 0 26 26"><path d="M2 9h22v8a2 2 0 0 1-2 2h-5l-2-3h-4l-2 3H4a2 2 0 0 1-2-2z"/><circle cx="8" cy="13" r="2"/><circle cx="18" cy="13" r="2"/></svg>',
  car:'<svg viewBox="0 0 26 26"><path d="M3 17v-4l3-6h14l3 6v4z"/><circle cx="8" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M14 8l-2 4h3l-2 4"/></svg>',
  qc:'<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="2.5"/><ellipse cx="13" cy="13" rx="11" ry="4.5"/><ellipse cx="13" cy="13" rx="11" ry="4.5" transform="rotate(60 13 13)"/><ellipse cx="13" cy="13" rx="11" ry="4.5" transform="rotate(120 13 13)"/></svg>',
  iot:'<svg viewBox="0 0 26 26"><path d="M3 12L13 4l10 8M6 10v11h14V10"/><circle cx="13" cy="15" r="2"/><path d="M9.5 12.5a5 5 0 0 1 7 0M7.5 10.5a8 8 0 0 1 11 0"/></svg>',
  robo:'<svg viewBox="0 0 26 26"><rect x="6" y="7" width="14" height="11" rx="2"/><circle cx="10" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/><path d="M13 7V3M11 3h4M9 18v4M17 18v4M2 11v4M24 11v4"/></svg>',
  ai:'<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="4"/><path d="M13 2v5M13 19v5M2 13h5M19 13h5M5 5l4 4M17 17l4 4M21 5l-4 4M9 17l-4 4"/></svg>',
};
const ROLES={soft:{n:(LANG_EN?"Developer":'Yazılımcı')},design:{n:(LANG_EN?"Designer":'Tasarımcı')},hw:{n:(LANG_EN?"Hardware Eng.":'Donanım Müh.')},res:{n:(LANG_EN?"Researcher":'Araştırmacı')},mkt:{n:(LANG_EN?"Marketer":'Pazarlamacı')},ops:{n:(LANG_EN?"Operations Spec.":'Operasyon Uzm.')},sup:{n:(LANG_EN?"Support Specialist":'Destek Uzmanı')},sec:{n:(LANG_EN?"Security Specialist":'Güvenlik Uzmanı')}};
const PT_NAME={soft:(LANG_EN?"Software":'Yazılım'),design:(LANG_EN?"Design":'Tasarım'),hw:(LANG_EN?"Hardware":'Donanım')};
const NODES=[
  {id:'45',r:'chip',mult:1.00,clk:2.6,cores:4, cm:1.00},
  {id:'32',r:'chip',mult:1.25,clk:3.0,cores:4, cm:1.10},
  {id:'22',r:'n22', mult:1.55,clk:3.4,cores:6, cm:1.25},
  {id:'14',r:'n14', mult:1.95,clk:3.8,cores:8, cm:1.40},
  {id:'10',r:'n10', mult:2.40,clk:4.2,cores:12,cm:1.60},
  {id:'7', r:'n7',  mult:3.00,clk:4.6,cores:16,cm:1.80},
  {id:'5', r:'n5',  mult:3.70,clk:5.0,cores:24,cm:2.10},
  {id:'3', r:'n3',  mult:4.60,clk:5.4,cores:32,cm:2.50},
];
const NODE_ERA={'45':0,'32':0,'22':2.5,'14':5,'10':8,'7':10.5,'5':13,'3':15.5};
const RES_NODE={chip:'32',n22:'22',n14:'14',n10:'10',n7:'7',n5:'5',n3:'3'};
const WAFER={'45':1200,'32':1600,'22':2400,'14':3800,'10':5500,'7':7000,'5':11000,'3':16000};
const PARTS={
  screen:[{n:'LCD 720p',s:10,c:12},{n:'LCD 1080p',s:20,c:25},{n:(LANG_EN?"OLED":'OLED'),s:35,c:48,r:'oled'},{n:(LANG_EN?"Foldable OLED":'Katlanabilir OLED'),s:60,c:130,r:'fold'}],
  camera:[{n:'8 MP',s:8,c:5},{n:'12 MP',s:18,c:13},{n:'48 MP',s:30,c:28,r:'cam'},{n:'Periskop 200 MP',s:48,c:55,r:'cam2'}],
  battery:[{n:(LANG_EN?"2500 mAh":'2500 mAh'),s:8,c:4},{n:(LANG_EN?"3500 mAh":'3500 mAh'),s:16,c:9},{n:(LANG_EN?"5000 mAh fast charging":'5000 mAh hızlı şarj'),s:26,c:16,r:'batt'}],
  ram:[{n:'4 GB',s:10,c:18},{n:'8 GB',s:20,c:36},{n:'16 GB',s:34,c:70,r:'ram'},{n:'32 GB',s:50,c:130,r:'ram2'}],
  storage:[{n:'500 GB HDD',s:10,c:25},{n:'256 GB SSD',s:24,c:50},{n:'1 TB NVMe',s:40,c:90,r:'nvme'}],
  sensor:[{n:(LANG_EN?"Steps and heart rate":'Adım ve nabız'),s:6,c:4},{n:(LANG_EN?"SpO2 and sleep tracking":'SpO2 ve uyku takibi'),s:14,c:9},{n:(LANG_EN?"ECG health suite":'EKG sağlık paketi'),s:26,c:18,r:'health'}],
  wbat:[{n:(LANG_EN?"1-day battery":'1 gün pil'),s:4,c:2},{n:(LANG_EN?"3-day battery":'3 gün pil'),s:10,c:5},{n:(LANG_EN?"7-day battery, wireless charging":'7 gün pil, kablosuz şarj'),s:18,c:9,r:'batt'}],
  optic:[{n:(LANG_EN?"Fresnel lens, 3DoF":'Fresnel lens, 3DoF'),s:10,c:20},{n:(LANG_EN?"Fresnel lens, 6DoF tracking":'Fresnel lens, 6DoF takip'),s:24,c:40},{n:(LANG_EN?"Pancake lens and eye tracking":'Pankek lens ve göz takibi'),s:42,c:80,r:'eyetrack'},{n:(LANG_EN?"Micro OLED mixed reality":'Mikro OLED karma gerçeklik'),s:70,c:180,r:'microled'}],
  rsense:[{n:(LANG_EN?"Stereo camera":'Stereo kamera'),s:8,c:60},{n:(LANG_EN?"Lidar":'Lidar'),s:20,c:300},{n:(LANG_EN?"Lidar and touch skin":'Lidar ve dokunma derisi'),s:35,c:600,r:'actu'}],
  qubit:[{n:(LANG_EN?"Superconducting 50 qubits":'Süperiletken 50 kübit'),s:15,c:1.5e6},{n:(LANG_EN?"Superconducting 400 qubits":'Süperiletken 400 kübit'),s:35,c:2.5e6,r:'qc2'},{n:(LANG_EN?"Error-corrected logical qubits":'Hata düzeltmeli mantıksal kübitler'),s:70,c:4e6,r:'qc3'}],
  cryo:[{n:(LANG_EN?"Dilution refrigerator":'Seyreltme soğutucu'),s:10,c:600000},{n:(LANG_EN?"Advanced cryostat":'Gelişmiş kriyostat'),s:22,c:1e6,r:'qc2'}],
  radio:[{n:(LANG_EN?"Wi-Fi module":'Wi-Fi modülü'),s:6,c:3},{n:(LANG_EN?"Wi-Fi and Bluetooth":'Wi-Fi ve Bluetooth'),s:14,c:6},{n:(LANG_EN?"Common standard (Thread)":'Ortak standart (Thread)'),s:26,c:10,r:'matter'}],
  actuator:[{n:(LANG_EN?"Wheeled base":'Tekerlekli taban'),s:15,c:600},{n:(LANG_EN?"6-axis robot arm":'6 eksenli robot kol'),s:35,c:1500},{n:(LANG_EN?"Precision actuators":'Hassas eyleyiciler'),s:60,c:2600,r:'actu'},{n:(LANG_EN?"Humanoid body":'İnsansı gövde'),s:95,c:4200,r:'humanoid'}],
  gpu:[{n:(LANG_EN?"Integrated graphics":'Entegre grafik'),s:8,c:15},{n:(LANG_EN?"Mid-range GPU":'Orta sınıf GPU'),s:22,c:45},{n:(LANG_EN?"High-end GPU":'Üst sınıf GPU'),s:40,c:90,r:'gpu'},{n:(LANG_EN?"Ray-tracing GPU":'Işın izlemeli GPU'),s:62,c:150,r:'rt'}],
};
const PART_N={screen:(LANG_EN?"Display":'Ekran'),camera:(LANG_EN?"Camera":'Kamera'),battery:(LANG_EN?"Battery":'Batarya'),ram:'RAM',storage:(LANG_EN?"Storage":'Depolama'),sensor:(LANG_EN?"Sensor":'Sensör'),wbat:(LANG_EN?"Battery":'Pil'),gpu:(LANG_EN?"Graphics":'Grafik'),optic:(LANG_EN?"Optics":'Optik'),radio:(LANG_EN?"Connectivity":'Bağlantı'),qubit:(LANG_EN?"Qubits":'Kübit'),cryo:(LANG_EN?"Cooling":'Soğutma'),rsense:(LANG_EN?"Sensing":'Algılama'),actuator:(LANG_EN?"Motion":'Hareket')};
const PART_CC={ram:'memory',storage:'memory',sensor:'camera',wbat:'battery',gpu:'gpu',optic:'screen',rsense:'camera',actuator:'motor',radio:'camera',qubit:'wafer',cryo:'chassis'};
const CHASSIS={phone:[(LANG_EN?"Phone body":'Telefon gövdesi'),14],pc:[(LANG_EN?"PC case":'PC kasası'),35],wear:[(LANG_EN?"Watch and earbud housing":'Saat ve kulaklık gövdesi'),6],console:[(LANG_EN?"Console case":'Konsol kasası'),25],xr:[(LANG_EN?"Headset body":'Gözlük gövdesi'),18],robo:[(LANG_EN?"Robot body":'Robot gövdesi'),350],iot:[(LANG_EN?"Smart home device housing":'Akıllı ev cihaz gövdesi'),4],qc:[(LANG_EN?"Quantum system cabinet":'Kuantum sistem kabini'),200000]};
const CCATS={wafer:{n:(LANG_EN?"Silicon wafer":'Silikon levha')},screen:{n:(LANG_EN?"Display panel":'Ekran paneli')},camera:{n:(LANG_EN?"Camera, sensor and module":'Kamera, sensör ve modül')},battery:{n:(LANG_EN?"Battery cell":'Batarya hücresi')},memory:{n:(LANG_EN?"Memory and storage":'Bellek ve depolama')},gpu:{n:(LANG_EN?"Graphics chip":'Grafik çipi')},motor:{n:(LANG_EN?"Motor and actuator":'Motor ve eyleyici')},chassis:{n:(LANG_EN?"Body and casing":'Gövde ve kasa')}};
const REGIONS={turkiye:(LANG_EN?"Turkey":'Türkiye'),cin:(LANG_EN?"China":'Çin'),kore:(LANG_EN?"South Korea":'Güney Kore'),japonya:(LANG_EN?"Japan":'Japonya'),tayvan:(LANG_EN?"Taiwan":'Tayvan'),vietnam:(LANG_EN?"Vietnam":'Vietnam'),avrupa:(LANG_EN?"Europe":'Avrupa'),meksika:(LANG_EN?"Mexico":'Meksika')};
const SUPPLIERS=[
  {id:'s10',n:(LANG_EN?"Saxony Wafer":'Saxony Wafer'),cat:'wafer',region:'avrupa',price:1.12,lead:15,rel:0.97},
  {id:'s9', n:(LANG_EN?"Formosa Silicon":'Formosa Silikon'),cat:'wafer',region:'tayvan',price:1.0,lead:20,rel:0.92},
  {id:'s1', n:(LANG_EN?"Hanbit Panel":'Hanbit Panel'),cat:'screen',region:'kore',price:1.0,lead:14,rel:0.95},
  {id:'s2', n:(LANG_EN?"Shenlong Display":'Shenlong Display'),cat:'screen',region:'cin',price:0.82,lead:22,rel:0.84},
  {id:'s3', n:(LANG_EN?"Kyoto Optics":'Kyoto Optik'),cat:'camera',region:'japonya',price:1.1,lead:12,rel:0.97},
  {id:'s4', n:(LANG_EN?"Pearl River Optics":'Pearl River Optics'),cat:'camera',region:'cin',price:0.84,lead:20,rel:0.85},
  {id:'s5', n:(LANG_EN?"Volta Cell":'Volta Hücre'),cat:'battery',region:'kore',price:1.0,lead:14,rel:0.93},
  {id:'s6', n:(LANG_EN?"Lianhe Energy":'Lianhe Enerji'),cat:'battery',region:'cin',price:0.78,lead:22,rel:0.82},
  {id:'s7', n:(LANG_EN?"Mercan Memory":'Mercan Bellek'),cat:'memory',region:'kore',price:1.0,lead:12,rel:0.94},
  {id:'s8', n:(LANG_EN?"Formosa Memory":'Formosa Memory'),cat:'memory',region:'tayvan',price:0.92,lead:16,rel:0.9},
  {id:'s11',n:(LANG_EN?"Anadolu Metal":'Anadolu Metal'),cat:'chassis',region:'turkiye',price:1.05,lead:7,rel:0.97},
  {id:'s12',n:(LANG_EN?"Mekong Casing":'Mekong Kasa'),cat:'chassis',region:'vietnam',price:0.8,lead:18,rel:0.87},
  {id:'s13',n:(LANG_EN?"Formosa Graphics":'Formosa Grafik'),cat:'gpu',region:'tayvan',price:1.0,lead:14,rel:0.94},
  {id:'s14',n:(LANG_EN?"Shenzhen Graphics":'Shenzhen Graphics'),cat:'gpu',region:'cin',price:0.85,lead:20,rel:0.85},
  {id:'s15',n:(LANG_EN?"Kansai Servo":'Kansai Servo'),cat:'motor',region:'japonya',price:1.1,lead:16,rel:0.96},
  {id:'s16',n:(LANG_EN?"Ningbo Motor":'Ningbo Motor'),cat:'motor',region:'cin',price:0.82,lead:22,rel:0.84},
];
const SUPD=Object.fromEntries(SUPPLIERS.map(s=>[s.id,s]));
/* dikey entegrasyon: kendi bileşen tesislerin. cap = günlük parça, val = parçanın piyasa değeri */
const PLANTS={
  chassis:{n:(LANG_EN?"Body and Casing Workshop":'Gövde ve Kasa Atölyesi'),cost:2e6,upkeep:60000,cap:5000,val:15,req:null},
  battery:{n:(LANG_EN?"Battery Factory":'Batarya Fabrikası'),cost:8e6,upkeep:200000,cap:4000,val:8,req:'batt'},
  camera:{n:(LANG_EN?"Optics and Sensor Plant":'Optik ve Sensör Tesisi'),cost:6e6,upkeep:150000,cap:3000,val:12,req:'cam'},
  screen:{n:(LANG_EN?"Panel Factory":'Panel Fabrikası'),cost:12e6,upkeep:300000,cap:3000,val:30,req:'oled'},
  memory:{n:(LANG_EN?"Memory Factory":'Bellek Fabrikası'),cost:25e6,upkeep:600000,cap:3000,val:40,req:'ram'},
  gpu:{n:(LANG_EN?"Graphics Chip Plant":'Grafik Çipi Tesisi'),cost:15e6,upkeep:400000,cap:2000,val:50,req:'gpu'},
  motor:{n:(LANG_EN?"Motor and Actuator Plant":'Motor ve Eyleyici Tesisi'),cost:10e6,upkeep:250000,cap:600,val:1500,req:'actu'},
  wafer:{n:(LANG_EN?"Silicon Wafer Plant":'Silikon Levha Tesisi'),cost:30e6,upkeep:700000,cap:80,val:2500,req:'fab'},
};
const OWN_PX=0.55,SPOT_PX=1.15;
for(const c in PLANTS){const o={id:'own_'+c,n:(LANG_EN?"Your own facility":'Kendi tesisin'),cat:c,region:'turkiye',lead:4,rel:0.99,own:true};Object.defineProperty(o,'price',{get(){return ownPx(c);},enumerable:true});SUPD[o.id]=o;}
const DC_LVL=[null,{n:(LANG_EN?"Regional data center":'Bölgesel veri merkezi'),max:100,cost:8e6,up:60000,out:0.03},{n:(LANG_EN?"Large data center":'Büyük veri merkezi'),max:250,cost:10e6,up:120000,out:0.02},{n:(LANG_EN?"Hyperscale campus":'Hiper ölçek kampüsü'),max:500,cost:20e6,up:180000,out:0.01}];
const DC_REG={tr:1,eu:1.2,na:1.3,asia:0.9,latam:0.8};
const SITES={
  fason:{n:(LANG_EN?"Delta Contract Assembly":'Delta Fason Montaj'),region:'cin',cap:3000,makes:['phone','pc','wear','console','xr','robo','iot','qc']},
  foundry:{n:(LANG_EN?"Formosa Foundry":'Formosa Dökümhane'),region:'tayvan',cap:60,makes:['cpu']},
};
const FTYPES={
  asm:{n:(LANG_EN?"Assembly Factory":'Montaj Fabrikası'),short:(LANG_EN?"Assembly":'Montaj'),makes:['phone','pc','wear','console','xr','robo','iot','qc'],cost:2.5e6,build:90,upkeep:80000,line:300,lineCost:600000,maxLines:10,unit:(LANG_EN?"units/day":'adet/gün'),auto:[0,800000,2e6,5e6]},
  fab:{n:(LANG_EN?"Chip Factory":'Çip Fabrikası'),short:(LANG_EN?"Chip Fab":'Çip Fab'),makes:['cpu'],cost:40e6,build:240,upkeep:500000,line:20,lineCost:8e6,maxLines:6,unit:(LANG_EN?"wafers/day":'levha/gün'),auto:[0,6e6,15e6,35e6],req:'fab'},
};
const FREG={
  turkiye:{n:(LANG_EN?"Turkey":'Türkiye'),labor:1.0,build:1.0},
  vietnam:{n:(LANG_EN?"Vietnam":'Vietnam'),labor:0.55,build:0.8},
  meksika:{n:(LANG_EN?"Mexico":'Meksika'),labor:0.7,build:0.9},
  tayvan:{n:(LANG_EN?"Taiwan":'Tayvan'),labor:0.9,build:1.15},
};
const RES=[
  {id:'fw',   g:(LANG_EN?"Software":'Yazılım'),   n:(LANG_EN?"Modern Software Framework":'Modern Yazılım Çatısı'),  d:(LANG_EN?"App, web service and OS quality +10%":'Uygulama, web servisi ve OS kalitesi +%10'), cost:15000, rp:250},
  {id:'os',   g:(LANG_EN?"Software":'Yazılım'),   n:(LANG_EN?"Operating System Kernel":'İşletim Sistemi Çekirdeği'), d:(LANG_EN?"You can develop your own operating system":'Kendi işletim sistemini geliştirebilirsin'), cost:300000, rp:2000, pre:['fw']},
  {id:'gdpr', g:(LANG_EN?"Software":'Yazılım'),   n:(LANG_EN?"Data Protection Compliance":'Veri Koruma Uyumu'),     d:(LANG_EN?"Removes the software sales ban and fine risk in Europe":"Avrupa'da yazılım satış engeli ve ceza riski kalkar"), cost:200000, rp:1500, pre:['fw']},
  {id:'sec1', g:(LANG_EN?"Security":'Güvenlik'),  n:(LANG_EN?"Zero Trust Architecture":'Sıfır Güven Mimarisi'),  d:(LANG_EN?"Cybersecurity level +8":'Siber güvenlik seviyesi +8'), cost:120000, rp:1200, pre:['fw']},
  {id:'sec2', g:(LANG_EN?"Security":'Güvenlik'),  n:(LANG_EN?"AI Threat Detection":'Yapay Zeka Tehdit Tespiti'), d:(LANG_EN?"Cybersecurity level +10; better odds of blocking attacks":'Siber güvenlik seviyesi +10; saldırıları engelleme ihtimali artar'), cost:450000, rp:3500, pre:['sec1','ml']},
  {id:'ml',   g:(LANG_EN?"Software":'Yazılım'),   n:(LANG_EN?"Machine Learning":'Makine Öğrenmesi'),       d:(LANG_EN?"All software quality +10% more; you can develop an AI service":'Tüm yazılım kalitesi ayrıca +%10; yapay zekâ hizmeti geliştirebilirsin'), cost:600000, rp:5000, pre:['os']},
  {id:'chip', g:(LANG_EN?"Chips":'Çip'),       n:(LANG_EN?"Chip Design Lab":'Çip Tasarım Laboratuvarı'), d:(LANG_EN?"Design processors: 45nm and 32nm processes, made at a foundry":'İşlemci tasarla: 45nm ve 32nm süreç, dökümhanede üret'), cost:250000, rp:1500},
  {id:'n22',  g:(LANG_EN?"Chips":'Çip'),       n:(LANG_EN?"22nm Process":'22nm Üretim Süreci'),     d:(LANG_EN?"Up to 6 cores, 3.4 GHz":'6 çekirdeğe kadar, 3.4 GHz'), cost:150000, rp:1600, pre:['chip']},
  {id:'n14',  g:(LANG_EN?"Chips":'Çip'),       n:(LANG_EN?"14nm Process":'14nm Üretim Süreci'),     d:(LANG_EN?"Up to 8 cores, 3.8 GHz":'8 çekirdeğe kadar, 3.8 GHz'), cost:300000, rp:2600, pre:['n22']},
  {id:'n10',  g:(LANG_EN?"Chips":'Çip'),       n:(LANG_EN?"10nm Process":'10nm Üretim Süreci'),     d:(LANG_EN?"Up to 12 cores, 4.2 GHz":'12 çekirdeğe kadar, 4.2 GHz'), cost:600000, rp:4000, pre:['n14']},
  {id:'n7',   g:(LANG_EN?"Chips":'Çip'),       n:(LANG_EN?"7nm Process":'7nm Üretim Süreci'),      d:(LANG_EN?"Up to 16 cores, 4.6 GHz":'16 çekirdeğe kadar, 4.6 GHz'), cost:1200000, rp:6000, pre:['n10']},
  {id:'n5',   g:(LANG_EN?"Chips":'Çip'),       n:(LANG_EN?"5nm Process":'5nm Üretim Süreci'),      d:(LANG_EN?"Up to 24 cores, 5.0 GHz":'24 çekirdeğe kadar, 5.0 GHz'), cost:2500000, rp:9000, pre:['n7']},
  {id:'n3',   g:(LANG_EN?"Chips":'Çip'),       n:(LANG_EN?"3nm Process":'3nm Üretim Süreci'),      d:(LANG_EN?"Up to 32 cores, 5.4 GHz":'32 çekirdeğe kadar, 5.4 GHz'), cost:5000000, rp:14000, pre:['n5']},
  {id:'fab',  g:(LANG_EN?"Chips":'Çip'),       n:(LANG_EN?"Semiconductor Fab":'Yarıiletken Üretim Tesisi'), d:(LANG_EN?"You can build your own chip factory":'Kendi çip fabrikanı kurabilirsin'), cost:2000000, rp:6000, pre:['n22']},
  {id:'yield',g:(LANG_EN?"Chips":'Çip'),       n:(LANG_EN?"Yield Optimization":'Verim Optimizasyonu'),    d:(LANG_EN?"Chip yield +8 points on all processes":'Tüm süreçlerde çip verimi +8 puan'), cost:500000, rp:3500, pre:['n14']},
  {id:'ai',   g:(LANG_EN?"Chips":'Çip'),       n:(LANG_EN?"AI Accelerator":'Yapay Zeka Hızlandırıcı'),d:(LANG_EN?"Processor score +20%; if your own processor is on the market, AI server cost −40%":'İşlemci puanı +%20; kendi işlemcin piyasadaysa yapay zekâ sunucu maliyeti −%40'), cost:1800000, rp:9000, pre:['n7','ml']},
  {id:'mobile',g:(LANG_EN?"Mobile":'Mobil'),    n:(LANG_EN?"Mobile Hardware":'Mobil Donanım'),          d:(LANG_EN?"Start making phones":'Telefon üretimine başla'), cost:400000, rp:2000},
  {id:'oled', g:(LANG_EN?"Mobile":'Mobil'),     n:(LANG_EN?"OLED Display":'OLED Ekran'),             d:(LANG_EN?"OLED display for phones":'Telefon için OLED ekran'), cost:150000, rp:1800, pre:['mobile']},
  {id:'cam',  g:(LANG_EN?"Mobile":'Mobil'),     n:(LANG_EN?"Advanced Camera Sensor":'Gelişmiş Kamera Sensörü'),d:(LANG_EN?"48 MP camera":'48 MP kamera'), cost:120000, rp:1500, pre:['mobile']},
  {id:'batt', g:(LANG_EN?"Mobile":'Mobil'),     n:(LANG_EN?"Fast-Charge Battery":'Hızlı Şarj Batarya'),     d:(LANG_EN?"5000 mAh fast charging":'5000 mAh hızlı şarj'), cost:80000, rp:1000, pre:['mobile']},
  {id:'fold', g:(LANG_EN?"Mobile":'Mobil'),     n:(LANG_EN?"Foldable Display":'Katlanabilir Ekran'),     d:(LANG_EN?"Foldable OLED panel":'Katlanabilir OLED panel'), cost:900000, rp:6000, pre:['oled','n10']},
  {id:'cam2', g:(LANG_EN?"Mobile":'Mobil'),     n:(LANG_EN?"Periscope Camera":'Periskop Kamera'),        d:(LANG_EN?"200 MP periscope camera":'200 MP periskop kamera'), cost:500000, rp:4000, pre:['cam']},
  {id:'wear', g:(LANG_EN?"Mobile":'Mobil'),     n:(LANG_EN?"Wearable Tech":'Giyilebilir Teknoloji'),  d:(LANG_EN?"Make smartwatches and wireless earbuds":'Akıllı saat ve kablosuz kulaklık üret'), cost:300000, rp:2000, pre:['mobile']},
  {id:'health',g:(LANG_EN?"Mobile":'Mobil'),    n:(LANG_EN?"Health Sensors":'Sağlık Sensörleri'),      d:(LANG_EN?"ECG health suite for wearables":'Giyilebilir cihazlar için EKG sağlık paketi'), cost:250000, rp:2200, pre:['wear']},
  {id:'pc',   g:(LANG_EN?"Computer":'Bilgisayar'),n:(LANG_EN?"Computer Assembly":'Bilgisayar Montajı'),     d:(LANG_EN?"Start making desktops and laptops":'Masaüstü ve dizüstü üretimine başla'), cost:250000, rp:1500},
  {id:'ram',  g:(LANG_EN?"Computer":'Bilgisayar'),n:(LANG_EN?"High-Capacity RAM":'Yüksek Kapasiteli RAM'),  d:'16 GB RAM', cost:100000, rp:1200, pre:['pc']},
  {id:'nvme', g:(LANG_EN?"Computer":'Bilgisayar'),n:(LANG_EN?"NVMe Storage":'NVMe Depolama'),          d:'1 TB NVMe SSD', cost:150000, rp:1600, pre:['pc']},
  {id:'ram2', g:(LANG_EN?"Computer":'Bilgisayar'),n:(LANG_EN?"32 GB RAM Module":'32 GB RAM Modülü'),       d:'32 GB RAM', cost:400000, rp:3500, pre:['ram']},
  {id:'console',g:(LANG_EN?"Gaming":'Oyun'),    n:(LANG_EN?"Game Console Platform":'Oyun Konsolu Platformu'), d:(LANG_EN?"Make your own game console, earn licensing revenue from game studios":'Kendi oyun konsolunu üret, oyun stüdyolarından lisans geliri al'), cost:500000, rp:3000, pre:['pc']},
  {id:'gpu',  g:(LANG_EN?"Gaming":'Oyun'),      n:(LANG_EN?"High-End Graphics":'Üst Sınıf Grafik'),       d:(LANG_EN?"High-end GPU for consoles":'Konsollar için üst sınıf GPU'), cost:400000, rp:3000, pre:['console']},
  {id:'rt',   g:(LANG_EN?"Gaming":'Oyun'),      n:(LANG_EN?"Ray Tracing":'Işın İzleme'),            d:(LANG_EN?"Ray-tracing GPU; game licensing revenue +20%":'Işın izlemeli GPU; oyun lisans geliri +%20'), cost:1200000, rp:7000, pre:['gpu','n10']},
  {id:'llm',  g:(LANG_EN?"Software":'Yazılım'),   n:(LANG_EN?"Large Language Models":'Büyük Dil Modelleri'),    d:(LANG_EN?"AI service quality +15%":'Yapay zekâ hizmeti kalitesi +%15'), cost:1500000, rp:8000, pre:['ml']},
  {id:'xr',   g:(LANG_EN?"Gaming":'Oyun'),      n:(LANG_EN?"Virtual Reality":'Sanal Gerçeklik'),        d:(LANG_EN?"Make VR/AR headsets":'VR/AR gözlük üret'), cost:600000, rp:4000, pre:['mobile','oled']},
  {id:'eyetrack',g:(LANG_EN?"Gaming":'Oyun'),   n:(LANG_EN?"Eye Tracking and Pancake Lens":'Göz Takibi ve Pankek Lens'), d:(LANG_EN?"Thin lenses and eye tracking for headsets":'Gözlükler için ince lens ve göz takibi'), cost:700000, rp:4500, pre:['xr']},
  {id:'microled',g:(LANG_EN?"Gaming":'Oyun'),   n:(LANG_EN?"Micro OLED Mixed Reality":'Mikro OLED Karma Gerçeklik'), d:(LANG_EN?"High-resolution imagery blended with the real world":'Gerçek dünyayla karışan yüksek çözünürlüklü görüntü'), cost:1600000, rp:9000, pre:['eyetrack'], era:8},
  {id:'ev',   g:(LANG_EN?"Automotive":'Araç'),      n:(LANG_EN?"In-Vehicle Software":'Araç İçi Yazılım'),       d:(LANG_EN?"License software to EV makers":'Elektrikli araç üreticilerine yazılım lisansla'), cost:800000, rp:5000, pre:['os','ml']},
  {id:'adas', g:(LANG_EN?"Automotive":'Araç'),      n:(LANG_EN?"Driver Assistance Systems":'Sürüş Destek Sistemleri'),d:(LANG_EN?"Automotive software quality +15%, lower recall risk":'Araç yazılımı kalitesi +%15, geri çağırma riski azalır'), cost:2000000, rp:10000, pre:['ev'], era:6},
  {id:'iot1', g:(LANG_EN?"Smart home":'Akıllı ev'), n:(LANG_EN?"Internet of Things":'Nesnelerin İnterneti'),    d:(LANG_EN?"Make smart home devices: plugs, cameras, speakers, thermostats":'Akıllı ev cihazları üret: priz, kamera, hoparlör, termostat'), cost:250000, rp:2000, pre:['mobile']},
  {id:'matter',g:(LANG_EN?"Smart home":'Akıllı ev'), n:(LANG_EN?"Common Connectivity Standard":'Ortak Bağlantı Standardı'),d:(LANG_EN?"A connectivity module that talks to every brand; smart home devices 8% more appealing":'Her markayla konuşan bağlantı modülü; akıllı ev cihazları %8 daha çekici'), cost:600000, rp:4500, pre:['iot1','sec1'], era:6},
  {id:'isa',  g:(LANG_EN?"Chips":'Çip'),       n:(LANG_EN?"Licensable Architecture":'Lisanslanabilir Mimari'),  d:(LANG_EN?"License your processor design and instruction set architecture to other companies":'İşlemci tasarımını ve komut seti mimarini başka şirketlere lisansla'), cost:800000, rp:5000, pre:['chip','n22']},
  {id:'qc1',  g:(LANG_EN?"Quantum":'Kuantum'),   n:(LANG_EN?"Quantum Computing":'Kuantum Hesaplama'),       d:(LANG_EN?"Moonshot: develop your own quantum computer":'Ay projesi: kendi kuantum bilgisayarını geliştir'), cost:5000000, rp:25000, pre:['chip','ml'], era:7},
  {id:'qc2',  g:(LANG_EN?"Quantum":'Kuantum'),   n:(LANG_EN?"Scalable Qubits":'Ölçeklenebilir Kübitler'), d:(LANG_EN?"400-qubit processor and advanced cooling":'400 kübitlik işlemci ve gelişmiş soğutma'), cost:10000000, rp:40000, pre:['qc1'], era:11},
  {id:'qc3',  g:(LANG_EN?"Quantum":'Kuantum'),   n:(LANG_EN?"Quantum Error Correction":'Kuantum Hata Düzeltme'),   d:(LANG_EN?"Error-corrected logical qubits: true quantum advantage":'Hata düzeltmeli mantıksal kübitler: gerçek kuantum üstünlüğü'), cost:25000000, rp:60000, pre:['qc2'], era:14},
  {id:'pqc',  g:(LANG_EN?"Security":'Güvenlik'),  n:(LANG_EN?"Post-Quantum Cryptography":'Kuantum Sonrası Şifreleme'),d:(LANG_EN?"Encryption quantum computers can't break; removes the “Q-Day” threat":'Kuantum bilgisayarların kıramayacağı şifreleme; “Q Günü” tehdidini kaldırır'), cost:1500000, rp:8000, pre:['sec1'], era:9},
  {id:'robo1',g:(LANG_EN?"Robotics":'Robotik'),   n:(LANG_EN?"Robotics Platform":'Robotik Platform'),       d:(LANG_EN?"Moonshot: develop your own robot":'Ay projesi: kendi robotunu geliştir'), cost:3000000, rp:15000, pre:['robot','ml'], era:4},
  {id:'actu', g:(LANG_EN?"Robotics":'Robotik'),   n:(LANG_EN?"Precision Actuators":'Hassas Eyleyiciler'),     d:(LANG_EN?"More agile robots and touch skin; you can build a motor plant":'Daha çevik robotlar ve dokunma derisi; motor tesisi kurabilirsin'), cost:2500000, rp:12000, pre:['robo1']},
  {id:'humanoid',g:(LANG_EN?"Robotics":'Robotik'),n:(LANG_EN?"Humanoid Robot":'İnsansı Robot'),          d:(LANG_EN?"A robot body that walks like a human and carries things":'İnsan gibi yürüyen, eşya taşıyan robot gövdesi'), cost:8000000, rp:30000, pre:['actu','llm'], era:11},
  {id:'logi', g:(LANG_EN?"Operations":'Operasyon'), n:(LANG_EN?"Logistics Software":'Lojistik Yazılımı'),      d:(LANG_EN?"Supply lead times 25% shorter":'Tedarik teslim süreleri %25 kısalır'), cost:120000, rp:1200, pre:['fw']},
  {id:'qc',   g:(LANG_EN?"Operations":'Operasyon'), n:(LANG_EN?"Quality Control System":'Kalite Kontrol Sistemi'), d:(LANG_EN?"Assembly defect rate down 1.5 points":'Montaj hata oranı 1,5 puan düşer'), cost:150000, rp:1500},
  {id:'robot',g:(LANG_EN?"Operations":'Operasyon'), n:(LANG_EN?"Robotic Automation":'Robotik Otomasyon'),      d:(LANG_EN?"Factory automation levels 2 and 3":'Fabrikalarda otomasyon seviye 2 ve 3'), cost:600000, rp:4000, pre:['qc']},
  {id:'cloud',g:(LANG_EN?"Infrastructure":'Altyapı'),   n:(LANG_EN?"Cloud Infrastructure":'Bulut Altyapısı'),        d:(LANG_EN?"Doubles the capacity of every server rack":'Her sunucu rafının kapasitesi 2 katına çıkar'), cost:40000, rp:500},
  {id:'sat1', g:(LANG_EN?"Space":'Uzay'),      n:(LANG_EN?"Satellite Technology":'Uydu Teknolojisi'),       d:(LANG_EN?"Build low-orbit communication satellites; set up satellite internet":'Alçak yörünge iletişim uyduları üret; uydu interneti kur'), cost:4000000, rp:20000, pre:['mobile'], era:3},
  {id:'rocket',g:(LANG_EN?"Space":'Uzay'),      n:(LANG_EN?"Reusable Rocket":'Yeniden Kullanılabilir Roket'),d:(LANG_EN?"You can start your own rocket program; launch costs drop to a quarter":'Kendi roket programını başlatabilirsin; fırlatma maliyeti dörtte birine iner'), cost:8000000, rp:35000, pre:['sat1'], era:5},
  {id:'laser',g:(LANG_EN?"Space":'Uzay'),       n:(LANG_EN?"Laser Satellite Links":'Lazer Uydu Bağlantısı'),  d:(LANG_EN?"Satellites link to each other by laser: +60% capacity per satellite, resilience to solar storms":'Uydular birbirine lazerle bağlanır: uydu başına kapasite +%60, güneş fırtınalarına dayanıklılık'), cost:5000000, rp:25000, pre:['sat1','cloud'], era:6},
  {id:'crew', g:(LANG_EN?"Space":'Uzay'),       n:(LANG_EN?"Crewed Flight":'İnsanlı Uçuş'),           d:(LANG_EN?"You can develop a crewed capsule and start space tourism":'İnsanlı kapsül geliştirebilir, uzay turizmine başlayabilirsin'), cost:15000000, rp:60000, pre:['rocket'], era:9},
  {id:'srv',  g:(LANG_EN?"Infrastructure":'Altyapı'),   n:(LANG_EN?"Server Design":'Sunucu Tasarımı'),        d:(LANG_EN?"Servers with your own processor: cheaper racks, +50% capacity (requires your own processor on the market)":'Kendi işlemcinle sunucu: raf daha ucuz, kapasite +%50 (piyasada kendi işlemcin olmalı)'), cost:90000, rp:1200, pre:['chip','cloud']},
];
const RESD=Object.fromEntries(RES.map(r=>[r.id,r]));
const OFFICES=[
  {n:(LANG_EN?"Garage":'Garaj'),cap:4,rent:1000,cost:0,maxF:1,floorCost:0},
  {n:(LANG_EN?"Small Office":'Küçük Ofis'),cap:12,rent:6000,cost:30000,maxF:1,floorCost:0},
  {n:(LANG_EN?"Office Floor":'Ofis Katı'),cap:24,rent:16000,cost:150000,maxF:2,floorCost:120000},
  {n:(LANG_EN?"Office Tower":'Plaza'),cap:40,rent:30000,cost:600000,maxF:4,floorCost:400000},
  {n:(LANG_EN?"Tech Campus":'Teknoloji Kampüsü'),cap:48,rent:35000,cost:3000000,maxF:6,floorCost:1500000},
];
const officeCap=()=>Math.round(OFFICES[G.office].cap*(G.floors||1)*(typeof wCapM==='function'&&G?wCapM():1));
const officeRent=()=>OFFICES[G.office].rent*(G.floors||1)*(G&&G.wpol&&WPOL[G.wpol]?WPOL[G.wpol].rent:1);
const ROUNDS=[
  {id:'seed',n:(LANG_EN?"Angel Investor":'Melek Yatırımcı'),min:0,pct:0.15,fixed:300000},
  {id:'a',n:(LANG_EN?"Series A":'Seri A'),min:3e6,pct:0.15},
  {id:'b',n:(LANG_EN?"Series B":'Seri B'),min:25e6,pct:0.12},
  {id:'c',n:(LANG_EN?"Series C":'Seri C'),min:150e6,pct:0.10},
  {id:'ipo',n:(LANG_EN?"IPO":'Halka Arz'),min:5e8,pct:0.20},
];
const COMP_SEED=[
  {name:(LANG_EN?"Orion Mobile":'Orion Mobil'),reg:['tr','eu','na','asia','latam'],pfx:(LANG_EN?"Orion":'Orion'),focus:['phone','os'],cash:40e6,emp:900,brand:70,tech:1.08,hue:212},
  {name:(LANG_EN?"Silika Semiconductor":'Silika Yarıiletken'),reg:['tr','eu','na','asia','latam'],pfx:'SX',focus:['cpu'],cash:60e6,emp:1100,brand:62,tech:1.10,hue:275},
  {name:(LANG_EN?"Kestrel Computers":'Kestrel Bilgisayar'),reg:['tr','eu','na','asia'],pfx:(LANG_EN?"Kestrel":'Kestrel'),focus:['pc','cpu'],cash:25e6,emp:700,brand:55,tech:0.98,hue:28},
  {name:(LANG_EN?"Nimbus Cloud":'Nimbus Bulut'),reg:['tr','eu','na'],pfx:(LANG_EN?"Nimbus":'Nimbus'),focus:['saas'],cash:6e6,emp:120,brand:40,tech:1.02,hue:188},
  {name:(LANG_EN?"Pixelsoft":'Pikselsoft'),reg:['tr','eu'],pfx:(LANG_EN?"Pixel":'Piksel'),focus:['app'],cash:1.5e6,emp:35,brand:25,tech:0.96,hue:330},
  {name:(LANG_EN?"Anadolu Electronics":'Anadolu Elektronik'),reg:['tr','latam'],pfx:(LANG_EN?"Anadolu":'Anadolu'),focus:['phone','pc'],cash:8e6,emp:450,brand:35,tech:0.88,hue:0},
  {name:(LANG_EN?"Zenit Software":'Zenit Yazılım'),reg:['tr','eu','asia'],pfx:(LANG_EN?"Zenit":'Zenit'),focus:['os','app'],cash:10e6,emp:250,brand:45,tech:1.00,hue:140},
  {name:(LANG_EN?"Vertex Systems":'Vertex Sistem'),reg:['tr','na'],pfx:(LANG_EN?"Vertex":'Vertex'),focus:['saas','app'],cash:2.5e6,emp:50,brand:20,tech:0.95,hue:52},
  {name:(LANG_EN?"Lumo Labs":'Lumo Labs'),reg:['tr'],pfx:(LANG_EN?"Lumo":'Lumo'),focus:['app'],cash:0.6e6,emp:12,brand:10,tech:1.00,hue:255},
  {name:(LANG_EN?"Arkade Games":'Arkade Oyun'),reg:['tr','eu','na','asia'],pfx:(LANG_EN?"Arkade":'Arkade'),focus:['console'],cash:20e6,emp:500,brand:50,tech:1.02,hue:300},
  {name:(LANG_EN?"Tempo Wearables":'Tempo Giyilebilir'),reg:['tr','eu','asia'],pfx:(LANG_EN?"Tempo":'Tempo'),focus:['wear'],cash:4e6,emp:90,brand:22,tech:1.00,hue:100},
  {name:(LANG_EN?"Neuron AI":'Nöron Zekâ'),reg:['tr','eu','na'],pfx:(LANG_EN?"Neuron":'Nöron'),focus:['ai'],cash:4e6,emp:25,brand:15,tech:1.05,hue:165},
];
const NEW_CAT_SEEDS=[(LANG_EN?"Arkade Games":'Arkade Oyun'),(LANG_EN?"Tempo Wearables":'Tempo Giyilebilir'),(LANG_EN?"Neuron AI":'Nöron Zekâ')];
const REGS={
  tr:{n:(LANG_EN?"Turkey":'Türkiye'),w:0.10,px:0.8,g:0.04,entry:0,month:0,home:true,d:(LANG_EN?"Your home market. You're always present here.":'Ana pazarın. Burada her zaman varsın.')},
  eu:{n:(LANG_EN?"Europe":'Avrupa'),w:0.27,px:1.1,g:-0.01,entry:2e6,month:150000,d:(LANG_EN?"High price tolerance. Selling software requires data protection compliance.":'Yüksek fiyat toleransı. Yazılım satmak için veri koruma uyumu gerekir.')},
  na:{n:(LANG_EN?"North America":'Kuzey Amerika'),w:0.30,px:1.2,g:0,entry:5e6,month:300000,minBrand:20,d:(LANG_EN?"The largest and most expensive market. Retail partners require brand 20+.":'En büyük ve en pahalı pazar. Perakende ortakları için marka 20+ olmalı.')},
  asia:{n:(LANG_EN?"Asia":'Asya'),w:0.25,px:0.85,g:0.05,entry:3e6,month:200000,d:(LANG_EN?"Price-sensitive, growing fast. 15% tariff on hardware unless you have a factory in Vietnam or Taiwan.":'Fiyata duyarlı, hızlı büyüyor. Vietnam ya da Tayvan\'da fabrikan yoksa donanıma %15 gümrük.')},
  latam:{n:(LANG_EN?"Latin America":'Latin Amerika'),w:0.08,px:0.75,g:0.04,entry:1e6,month:80000,d:(LANG_EN?"Small but growing market. Exchange-rate swings move demand.":'Küçük ama büyüyen pazar. Kur dalgalanmaları talebi oynatır.')},
};
const REG_ORDER=['tr','eu','na','asia','latam'];
const REG_HUE={tr:'var(--accent)',eu:'var(--pt-soft)',na:'var(--pt-hw)',asia:'var(--pt-res)',latam:'var(--pt-mkt)'};
const newRegions=()=>Object.fromEntries(REG_ORDER.map(r=>[r,{in:r==='tr',aw:r==='tr'?1:0.05,camp:-999}]));
const STARTUPS=[[(LANG_EN?"Kuzgun Labs":'Kuzgun Labs'),(LANG_EN?"Kuzgun":'Kuzgun'),300],[(LANG_EN?"Mavi Chip":'Mavi Çip'),(LANG_EN?"Mavi":'Mavi'),200],[(LANG_EN?"Pusula Software":'Pusula Yazılım'),(LANG_EN?"Pusula":'Pusula'),100],[(LANG_EN?"Atlas Mobile":'Atlas Mobil'),(LANG_EN?"Atlas":'Atlas'),15],[(LANG_EN?"Felis Technology":'Felis Teknoloji'),(LANG_EN?"Felis":'Felis'),320],[(LANG_EN?"Ruzgar Cloud":'Rüzgar Bulut'),(LANG_EN?"Ruzgar":'Rüzgar'),175],[(LANG_EN?"Kıvılcım AI":'Kıvılcım AI'),(LANG_EN?"Kıvılcım":'Kıvılcım'),45],[(LANG_EN?"Nehir Data":'Nehir Data'),(LANG_EN?"Nehir":'Nehir'),195],[(LANG_EN?"Sirius Circuits":'Sirius Devre'),(LANG_EN?"Sirius":'Sirius'),240],[(LANG_EN?"Poyraz Mobile":'Poyraz Mobil'),(LANG_EN?"Poyraz":'Poyraz'),160],[(LANG_EN?"Lacivert Soft":'Lacivert Soft'),(LANG_EN?"Lacivert":'Lacivert'),225],[(LANG_EN?"Kartal Hardware":'Kartal Donanım'),(LANG_EN?"Kartal":'Kartal'),10],[(LANG_EN?"Dalga Net":'Dalga Net'),(LANG_EN?"Dalga":'Dalga'),180],[(LANG_EN?"Tepe Systems":'Tepe Sistem'),(LANG_EN?"Tepe":'Tepe'),90],[(LANG_EN?"Ada Informatics":'Ada Bilişim'),(LANG_EN?"Ada":'Ada'),120],[(LANG_EN?"Fener Technology":'Fener Teknoloji'),(LANG_EN?"Fener":'Fener'),60]];
const FIRST=[(LANG_EN?"Ahmet":'Ahmet'),(LANG_EN?"Mehmet":'Mehmet'),(LANG_EN?"Ayşe":'Ayşe'),(LANG_EN?"Elif":'Elif'),(LANG_EN?"Can":'Can'),(LANG_EN?"Zeynep":'Zeynep'),(LANG_EN?"Burak":'Burak'),(LANG_EN?"Deniz":'Deniz'),(LANG_EN?"Ece":'Ece'),(LANG_EN?"Emre":'Emre'),(LANG_EN?"Selin":'Selin'),(LANG_EN?"Kerem":'Kerem'),(LANG_EN?"Merve":'Merve'),(LANG_EN?"Onur":'Onur'),(LANG_EN?"Pınar":'Pınar'),(LANG_EN?"Mert":'Mert'),(LANG_EN?"Gizem":'Gizem'),(LANG_EN?"Barış":'Barış'),(LANG_EN?"Ceren":'Ceren'),(LANG_EN?"Tolga":'Tolga'),(LANG_EN?"İrem":'İrem'),(LANG_EN?"Kaan":'Kaan'),(LANG_EN?"Defne":'Defne'),(LANG_EN?"Cem":'Cem'),(LANG_EN?"Seda":'Seda'),(LANG_EN?"Arda":'Arda'),(LANG_EN?"Buse":'Buse'),(LANG_EN?"Oğuz":'Oğuz'),(LANG_EN?"Melis":'Melis'),(LANG_EN?"Umut":'Umut'),(LANG_EN?"Nil":'Nil'),(LANG_EN?"Serkan":'Serkan'),(LANG_EN?"Yasemin":'Yasemin'),(LANG_EN?"Efe":'Efe'),(LANG_EN?"Damla":'Damla'),(LANG_EN?"Levent":'Levent'),(LANG_EN?"Ezgi":'Ezgi'),(LANG_EN?"Alp":'Alp'),(LANG_EN?"Sinem":'Sinem'),(LANG_EN?"Berk":'Berk'),(LANG_EN?"Hande":'Hande'),(LANG_EN?"Volkan":'Volkan'),(LANG_EN?"Tuğba":'Tuğba'),(LANG_EN?"Sarp":'Sarp')];
const LAST=[(LANG_EN?"Yılmaz":'Yılmaz'),(LANG_EN?"Kaya":'Kaya'),(LANG_EN?"Demir":'Demir'),(LANG_EN?"Şahin":'Şahin'),(LANG_EN?"Çelik":'Çelik'),(LANG_EN?"Yıldız":'Yıldız'),(LANG_EN?"Aydın":'Aydın'),(LANG_EN?"Öztürk":'Öztürk'),(LANG_EN?"Arslan":'Arslan'),(LANG_EN?"Doğan":'Doğan'),(LANG_EN?"Kılıç":'Kılıç'),(LANG_EN?"Aslan":'Aslan'),(LANG_EN?"Çetin":'Çetin'),(LANG_EN?"Kara":'Kara'),(LANG_EN?"Koç":'Koç'),(LANG_EN?"Kurt":'Kurt'),(LANG_EN?"Özdemir":'Özdemir'),(LANG_EN?"Polat":'Polat'),(LANG_EN?"Erdem":'Erdem'),(LANG_EN?"Tekin":'Tekin'),(LANG_EN?"Güneş":'Güneş'),(LANG_EN?"Aksoy":'Aksoy'),(LANG_EN?"Bulut":'Bulut'),(LANG_EN?"Uçar":'Uçar'),(LANG_EN?"Ekinci":'Ekinci'),(LANG_EN?"Duman":'Duman')];
const SERIES={phone:[(LANG_EN?"Fone":'Fon'),(LANG_EN?"Nova":'Nova'),(LANG_EN?"Edge":'Edge'),(LANG_EN?"Pro":'Pro'),(LANG_EN?"Air":'Air')],pc:[(LANG_EN?"Book":'Book'),(LANG_EN?"Station":'Station'),(LANG_EN?"Pad":'Pad'),(LANG_EN?"Desk":'Desk')],app:[(LANG_EN?"Chat":'Chat'),(LANG_EN?"Photo":'Foto'),(LANG_EN?"Maps":'Harita'),(LANG_EN?"Music":'Müzik'),(LANG_EN?"Notes":'Not'),(LANG_EN?"Gaming":'Oyun'),(LANG_EN?"News":'Haber')],saas:[(LANG_EN?"Cloud":'Cloud'),(LANG_EN?"Drive":'Drive'),'CRM',(LANG_EN?"Mail":'Mail'),(LANG_EN?"Meet":'Meet')],wear:[(LANG_EN?"Watch":'Watch'),(LANG_EN?"Buds":'Buds'),(LANG_EN?"Fit":'Fit'),(LANG_EN?"Band":'Band')],xr:[(LANG_EN?"Vision":'Vision'),(LANG_EN?"Lens":'Lens'),(LANG_EN?"Halo":'Halo'),(LANG_EN?"Portal":'Portal')],iot:[(LANG_EN?"Home":'Home'),(LANG_EN?"Nest":'Nest'),(LANG_EN?"Haven":'Yuva'),(LANG_EN?"Hub":'Hub')],qc:['Q',(LANG_EN?"Qubits":'Kübit'),(LANG_EN?"Superposition":'Süperpozisyon'),(LANG_EN?"Entangle":'Dolanık')],car:[(LANG_EN?"Drive":'Drive'),(LANG_EN?"Pilot":'Pilot'),(LANG_EN?"Route":'Yol'),(LANG_EN?"Autonomous":'Otonom')],robo:[(LANG_EN?"Bot":'Bot'),(LANG_EN?"Mate":'Mate'),(LANG_EN?"Unit":'Ünite'),(LANG_EN?"Helper":'Yardımcı')],console:[(LANG_EN?"Play":'Play'),(LANG_EN?"Arena":'Arena'),(LANG_EN?"Box":'Box'),(LANG_EN?"Joy":'Oyna')],ai:[(LANG_EN?"Mind":'Mind'),(LANG_EN?"Assistant":'Asistan'),(LANG_EN?"Genius":'Zekâ'),(LANG_EN?"Copilot":'Copilot')]};

