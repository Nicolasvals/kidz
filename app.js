function kidzUUID(){
  try{
    if(globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function'){
      return globalThis.crypto.randomUUID();
    }
  }catch(e){}
  return 'kidz-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,10);
}

const STORAGE_KEY = 'kidzHubData_v12';

const MATERIAL_CATALOG = [
  'Muelles',
  'Tabla de metal',
  'Cuerda',
  'Gelatina',
  'Tela',
  'Perchas',
  'Cable de cobre',
  'Electrónica',
  'Acero',
  'Lata vacía',
  'Refresco',
  'Bateria',
  'Auriculares',
  'Tablet infantil',
  'Pieza de electronica rota'
];


const REAL_CRAFT_CATALOG = [{"id":"craft-empty-jar-1","name":"Empty Jar","category":"Procesamiento","description":"","materials":[{"name":"Lata vacía","qty":3},{"name":"Placa de metal","qty":1}],"image":"assets/crafts/empty-jar.png"},{"id":"craft-lean-1","name":"Lean","category":"Procesamiento","description":"","materials":[{"name":"Refresco","qty":1},{"name":"Jarabe para la tos","qty":1}],"image":"assets/crafts/lean.png"},{"id":"craft-battery-1","name":"Battery","category":"Electrónica","description":"","materials":[{"name":"Lingote de zinc","qty":2},{"name":"Carbono","qty":1}],"image":"assets/crafts/battery.png"},{"id":"craft-electronics-1","name":"Electronics","category":"Electrónica","description":"","materials":[{"name":"Lingote de cobre","qty":2},{"name":"Carbono","qty":1}],"image":"assets/crafts/electronics.png"},{"id":"craft-hacking-device-1","name":"Hacking Device","category":"Hackeo","description":"","materials":[{"name":"Disco duro estropeado","qty":1},{"name":"Memoria USB","qty":1}],"image":"assets/crafts/hard-drive.png"},{"id":"craft-hacking-device-2","name":"Hacking Device","category":"Hackeo","description":"","materials":[{"name":"Electrónica","qty":2},{"name":"Batería","qty":1},{"name":"Cable de cobre","qty":1}],"image":"assets/crafts/hard-drive.png"},{"id":"craft-keypad-hacking-device-1","name":"Keypad Hacking Device","category":"Hackeo","description":"","materials":[{"name":"Disco duro estropeado","qty":2},{"name":"Pieza electrónica rota","qty":1}],"image":"assets/crafts/atm-scanning-device.png"},{"id":"craft-smartwatch-1","name":"Smartwatch","category":"Electrónica","description":"","materials":[{"name":"Cámara rota","qty":1},{"name":"Auriculares","qty":1},{"name":"Pieza electrónica rota","qty":1},{"name":"Batería","qty":1}],"image":"assets/crafts/smartwatch.png"},{"id":"craft-copper-tubing-1","name":"Copper Tubing","category":"Material","description":"","materials":[{"name":"Lingote de cobre","qty":1}],"image":"assets/crafts/copper-tubing.png"},{"id":"craft-jack-stands-1","name":"Jack Stands","category":"Herramienta","description":"","materials":[{"name":"Muelles","qty":2},{"name":"Placas de metal","qty":2}],"image":"assets/crafts/jack-stands.png"},{"id":"craft-jewelry-box-1","name":"Jewelry Box","category":"Objeto","description":"","materials":[{"name":"Anillo","qty":1},{"name":"Reloj de lujo","qty":1},{"name":"Jarrón decorativo","qty":1},{"name":"Latón","qty":1}],"image":"assets/crafts/jewelry-box.png"},{"id":"craft-luxury-watch-1","name":"Luxury Watch","category":"Objeto","description":"","materials":[{"name":"Reloj de bolsillo","qty":1},{"name":"Mechero vintage","qty":1},{"name":"Pulsera","qty":1},{"name":"Latón","qty":1}],"image":"assets/crafts/luxury-watch.png"},{"id":"craft-metal-plate-1","name":"Metal Plate","category":"Material","description":"","materials":[{"name":"Microondas","qty":1},{"name":"Martillo","qty":1}],"image":"assets/crafts/metal-plate.png"},{"id":"craft-metal-plate-2","name":"Metal Plate","category":"Material","description":"","materials":[{"name":"Lingote de hierro","qty":1}],"image":"assets/crafts/metal-plate.png"},{"id":"craft-rubber-1","name":"Rubber","category":"Material","description":"","materials":[{"name":"Carbono","qty":3}],"image":"assets/crafts/rubber.png"},{"id":"craft-spring-1","name":"Spring","category":"Material","description":"","materials":[{"name":"Reloj de pared","qty":1},{"name":"Martillo","qty":1}],"image":"assets/crafts/spring.png"},{"id":"craft-spring-2","name":"Spring","category":"Material","description":"","materials":[{"name":"Acero","qty":1}],"image":"assets/crafts/spring.png"},{"id":"craft-sugar-1","name":"Sugar","category":"Material","description":"","materials":[{"name":"Caña de azúcar","qty":2}],"image":"assets/crafts/sugar.png"},{"id":"craft-yeast-1","name":"Yeast","category":"Material","description":"","materials":[{"name":"Azúcar","qty":2},{"name":"Garrafa de agua","qty":1}],"image":"assets/crafts/empty-jar.png"},{"id":"craft-gauze-1","name":"Gauze","category":"Material","description":"","materials":[{"name":"Papel de liar","qty":3}],"image":"assets/crafts/gauze.png"},{"id":"craft-drill-1","name":"Drill","category":"Herramienta","description":"","materials":[{"name":"Broca endurecida","qty":1},{"name":"Batería externa","qty":1},{"name":"Placa de metal","qty":1}],"image":"assets/crafts/drill.png"},{"id":"craft-drill-2","name":"Drill","category":"Herramienta","description":"","materials":[{"name":"Acero","qty":10},{"name":"Batería","qty":2},{"name":"Electrónica","qty":2},{"name":"Broca endurecida","qty":2}],"image":"assets/crafts/drill.png"},{"id":"craft-duffel-bag-1","name":"Duffel Bag","category":"Objeto","description":"","materials":[{"name":"Placa de metal","qty":2},{"name":"Muelle","qty":1},{"name":"Cuerda de remolque","qty":1},{"name":"Percha","qty":2}],"image":"assets/crafts/duffel-bag.png"},{"id":"craft-lockpick-1","name":"Lockpick","category":"Herramienta","description":"","materials":[{"name":"Percha","qty":2}],"image":"assets/crafts/lockpick.png"},{"id":"craft-stethoscope-1","name":"Stethoscope","category":"Herramienta","description":"","materials":[{"name":"Tubo de cobre","qty":2},{"name":"Diafragma recuperado","qty":1},{"name":"Pieza electrónica rota","qty":1}],"image":"assets/crafts/stethoscope.png"},{"id":"craft-tow-rope-1","name":"Tow Rope","category":"Material","description":"","materials":[{"name":"Cuerda","qty":2}],"image":"assets/crafts/tow-rope.png"},{"id":"craft-wire-cutters-1","name":"Wire Cutters","category":"Herramienta","description":"","materials":[{"name":"Acero","qty":5},{"name":"Goma","qty":3}],"image":"assets/crafts/wire-cutters.png"},{"id":"craft-atm-bomb-1","name":"ATM Bomb","category":"Robos","description":"","materials":[{"name":"Mecha","qty":1},{"name":"Pólvora","qty":2},{"name":"Placa de metal","qty":1},{"name":"Electrónica","qty":1}],"image":"assets/crafts/atm-bomb.png"},{"id":"craft-gunpowder-1","name":"Gunpowder","category":"Material","description":"","materials":[{"name":"Munición de rifle de caza","qty":1}],"image":"assets/crafts/gunpowder.png"},{"id":"craft-gunpowder-2","name":"Gunpowder","category":"Material","description":"","materials":[{"name":"Munición de pistola","qty":3}],"image":"assets/crafts/gunpowder.png"},{"id":"craft-homemade-bomb-1","name":"Homemade Bomb","category":"Robos","description":"","materials":[{"name":"Mecha","qty":1},{"name":"Pólvora","qty":2},{"name":"Placa de metal","qty":1},{"name":"Receta de TNT","qty":1}],"image":"assets/crafts/home-made-bomb.png"},{"id":"craft-cannabis-drying-rack-1","name":"Cannabis Drying Rack","category":"Procesamiento","description":"","materials":[{"name":"Percha","qty":3},{"name":"Cuerda","qty":2},{"name":"Placa de metal","qty":1}],"image":"assets/crafts/cannabis-drying-rack.png"},{"id":"craft-cannabis-oil-press-1","name":"Cannabis Oil Press","category":"Procesamiento","description":"","materials":[{"name":"Placa de metal","qty":4},{"name":"Muelle","qty":2},{"name":"Lata vacía","qty":2}],"image":"assets/crafts/cannabis-oil-press.png"},{"id":"craft-cap-machine-1","name":"Cap Machine","category":"Procesamiento","description":"","materials":[{"name":"Placa de metal","qty":6},{"name":"Muelle","qty":3},{"name":"Pieza electrónica rota","qty":2},{"name":"Batería externa","qty":1},{"name":"Tubo de cobre","qty":1},{"name":"Reloj de bolsillo","qty":1}],"image":"assets/crafts/cap-machine.png"},{"id":"craft-ca-machine-1","name":"CA Machine","category":"Procesamiento","description":"","materials":[{"name":"Acero","qty":4},{"name":"Pieza electrónica rota","qty":2},{"name":"Batería externa","qty":1},{"name":"Reloj de bolsillo","qty":1}],"image":"assets/crafts/ca-machine.png"},{"id":"craft-empty-capsule-1","name":"Empty Capsule","category":"Procesamiento","description":"","materials":[{"name":"Lámina de gelatina","qty":1}],"image":"assets/crafts/empty-capsule.png"},{"id":"craft-mushroom-tent-1","name":"Mushroom Tent","category":"Cultivo","description":"","materials":[{"name":"Placa de metal","qty":2},{"name":"Cuerda","qty":3},{"name":"Percha","qty":2}],"image":"assets/crafts/mushroom-tent.png"},{"id":"craft-spray-can-1","name":"Spray Can","category":"Objeto","description":"","materials":[{"name":"Lata vacía","qty":2},{"name":"Alcohol isopropílico","qty":1},{"name":"Tela","qty":1}],"image":"assets/crafts/spray-can.png"},{"id":"craft-advanced-lockpick-1","name":"Advanced Lockpick","category":"Herramienta","description":"","materials":[{"name":"Acero","qty":1},{"name":"Electrónica","qty":1},{"name":"Cable de cobre","qty":1}],"image":"assets/crafts/advanced-lockpick.png"},{"id":"craft-atm-scanning-device-1","name":"ATM Scanning Device","category":"Hackeo","description":"","materials":[{"name":"Disco duro estropeado","qty":1},{"name":"Pieza electrónica rota","qty":1}],"image":"assets/crafts/atm-scanning-device.png"},{"id":"craft-blowtorch-1","name":"Blowtorch","category":"Herramienta","description":"","materials":[{"name":"Acero","qty":10},{"name":"Batería","qty":2},{"name":"Electrónica","qty":2},{"name":"Bombona de gas","qty":1}],"image":"assets/crafts/blowtorch.png"},{"id":"craft-console-1","name":"Console","category":"Electrónica","description":"","materials":[{"name":"Disco duro estropeado","qty":1},{"name":"Cafetera","qty":1},{"name":"Pieza electrónica rota","qty":2},{"name":"Electrónica","qty":1}],"image":"assets/crafts/console-terminal.png"},{"id":"craft-reinforced-rake-1","name":"Reinforced Rake","category":"Herramienta","description":"","materials":[{"name":"Rastrillo","qty":1},{"name":"Placa de metal","qty":2}],"image":"assets/crafts/reinforced-rake.png"},{"id":"craft-loot-bundle-1","name":"Loot Bundle","category":"Objeto","description":"","materials":[{"name":"Calderilla","qty":1},{"name":"Reloj de bolsillo","qty":1},{"name":"Pulsera","qty":1}],"image":"assets/crafts/loot-bundle.png"},{"id":"craft-stethoscope-2","name":"Stethoscope","category":"Herramienta","description":"","materials":[{"name":"Goma","qty":2},{"name":"Electrónica","qty":2}],"image":"assets/crafts/stethoscope.png"},{"id":"craft-blowtorch-2","name":"Blowtorch","category":"Herramienta","description":"","materials":[{"name":"Bombona de gas","qty":1},{"name":"Tubo de cobre","qty":1},{"name":"Placa de metal","qty":2},{"name":"Muelle","qty":1}],"image":"assets/crafts/blowtorch.png"},{"id":"craft-pocket-console-1","name":"Pocket Console","category":"Electrónica","description":"","materials":[{"name":"Tablet infantil","qty":1},{"name":"Auricular","qty":1},{"name":"Pieza electrónica rota","qty":1},{"name":"Batería","qty":1}],"image":"assets/crafts/pocket-console.png"},{"id":"craft-drying-rack-module-1","name":"Drying Rack Module","category":"Procesamiento","description":"","materials":[{"name":"Placa de metal","qty":3},{"name":"Muelle","qty":2},{"name":"Percha","qty":2},{"name":"Cuerda","qty":1}],"image":"assets/crafts/drying-rack-module.png"},{"id":"craft-drug-test-kit-1","name":"Drug Test Kit","category":"Objeto","description":"","materials":[{"name":"Pieza electrónica rota","qty":1},{"name":"Papel de liar","qty":1},{"name":"Lata vacía","qty":1}],"image":"assets/crafts/drug-test-kit.png"},{"id":"craft-grinder-1","name":"Grinder","category":"Procesamiento","description":"","materials":[{"name":"Placa de metal","qty":4},{"name":"Muelle","qty":2},{"name":"Microondas","qty":1},{"name":"Broca endurecida","qty":2},{"name":"Tubo de cobre","qty":1}],"image":"assets/crafts/grinder.png"},{"id":"craft-vendas-1","name":"Vendas","category":"Objeto","description":"","materials":[{"name":"Tela","qty":2}],"image":"assets/crafts/vendas.png"}];

const defaultData = {
  robberies: [
    {id:kidzUUID(),name:'Depósito del Puerto',type:'Industrial',description:'Ubicación ficticia para test.',mapImage:'',photos:[]},
    {id:kidzUUID(),name:'Callejón de Vespucci',type:'Punto de interés',description:'Ubicación ficticia para test.',mapImage:'',photos:[]},
    {id:kidzUUID(),name:'Taller del Desierto',type:'Taller',description:'Ubicación ficticia para test.',mapImage:'',photos:[]},
    {id:kidzUUID(),name:'Viejo Motel',type:'Interior',description:'Ubicación ficticia para test.',mapImage:'',photos:[]},
    {id:kidzUUID(),name:'Mirador Norte',type:'Encuentro',description:'Ubicación ficticia para test.',mapImage:'',photos:[]},
    {id:kidzUUID(),name:'Canal de La Mesa',type:'Exterior',description:'Ubicación ficticia para test.',mapImage:'',photos:[]},
    {id:kidzUUID(),name:'Almacén Rojo',type:'Almacén',description:'Ubicación ficticia para test.',mapImage:'',photos:[]},
    {id:kidzUUID(),name:'Estación Abandonada',type:'Punto de interés',description:'Ubicación ficticia para test.',mapImage:'',photos:[]},
    {id:kidzUUID(),name:'Cabaña del Lago',type:'Rural',description:'Ubicación ficticia para test.',mapImage:'',photos:[]},
    {id:kidzUUID(),name:'Azotea Downtown',type:'Encuentro',description:'Ubicación ficticia para test.',mapImage:'',photos:[]},
    {id:kidzUUID(),name:'Patio de Chatarra',type:'Industrial',description:'Ubicación ficticia para test.',mapImage:'',photos:[]},
    {id:kidzUUID(),name:'Galpón 24',type:'Almacén',description:'Ubicación ficticia para test.',mapImage:'',photos:[]}
  ],

  locations: [],  drugs: [
    {id:kidzUUID(),name:'Glowcap',status:'Test',description:'Entrada ficticia para probar la interfaz.',photos:[]},
    {id:kidzUUID(),name:'Moonshine',status:'Test',description:'Contenido ficticio de demostración.',photos:[]},
    {id:kidzUUID(),name:'Red Dust',status:'Test',description:'Entrada inventada para probar el diseño.',photos:[]},
    {id:kidzUUID(),name:'Blue Mist',status:'Test',description:'Entrada inventada para pruebas.',photos:[]},
    {id:kidzUUID(),name:'Night Bloom',status:'Test',description:'Entrada ficticia para comprobar listas extensas.',photos:[]},
    {id:kidzUUID(),name:'Crystal Sap',status:'Test',description:'Contenido de prueba únicamente.',photos:[]},
    {id:kidzUUID(),name:'Green Drop',status:'Test',description:'Registro inventado para testear categorías.',photos:[]},
    {id:kidzUUID(),name:'Black Resin',status:'Test',description:'Registro ficticio para pruebas de interfaz.',photos:[]}
  ],
  crafts: REAL_CRAFT_CATALOG.map(c=>({...c,materials:c.materials.map(m=>({...m}))}))
}

let data = loadData();
let currentView = 'home';

const KIDZ_LOGIN_URL = 'https://zlxcfpwmnksceagbcarl.supabase.co/functions/v1/kidz-login';
const ROLE_KEY = 'kidzSessionRole';
const ADMIN_SESSION_KEY = 'kidzAdminPassword';
let currentRole = null;

function isAdmin(){ return currentRole === 'admin'; }
function isOG(){ return currentRole === 'og'; }

function syncAdminVisibility(){
  const admin = isAdmin();
  document.querySelectorAll('.admin-only').forEach(el=>{
    el.style.display = admin ? '' : 'none';
  });

  document.querySelectorAll(
    '#view-robberies [data-edit-robbery], #view-robberies [data-delete-robbery], ' +
    '#view-robberies [data-new-robbery], #newRobberyBtn, ' +
    '#view-members [data-edit-member], #view-members [data-photo-member], ' +
    '#view-members [data-delete-member], #addMemberBtn, #view-media [data-delete-media]'
  ).forEach(el=>{
    el.style.display = admin ? '' : 'none';
  });

  const canUpload = admin || isOG();
  document.querySelectorAll('#addMediaImageBtn, #addMediaVideoBtn').forEach(el=>{
    el.style.display = canUpload ? '' : 'none';
  });
}
window.syncAdminVisibility = syncAdminVisibility;

function getAdminSessionPassword(){
  try{ return sessionStorage.getItem(ADMIN_SESSION_KEY) || ''; }catch(e){ return ''; }
}
window.KidzAuth = {
  isAdmin: () => isAdmin(),
  isOG: () => isOG(),
  getRole: () => currentRole,
  getAdminPassword: () => getAdminSessionPassword()
};
function requireAdmin(){
  if(isAdmin()) return true;
  alert('Esta acción está disponible solo para Admin.');
  return false;
}
function applyRoleUI(){
  document.body.classList.toggle('role-admin', isAdmin());
  document.body.classList.toggle('role-og', currentRole === 'og');
  const roleLabel=document.querySelector('#roleLabel');
  if(roleLabel) roleLabel.textContent=isAdmin()?'ADMIN':'OG';
  document.querySelectorAll('.admin-only').forEach(el=>{
    el.style.display=isAdmin()?'':'none';
  });
  renderAll();
}
function enterApp(role){
  currentRole=role;
  try{ sessionStorage.setItem(ROLE_KEY,role); }catch(e){}
  applyRoleUI();
  setView('home',true);

  const auth=document.querySelector('#authScreen');
  auth?.classList.add('auth-exit');
  window.setTimeout(()=>{
    document.body.classList.add('authenticated','app-enter');
    auth?.classList.add('hidden');
    auth?.classList.remove('auth-exit');
    window.setTimeout(()=>document.body.classList.remove('app-enter'),850);
  },420);
}
function setRole(role){
  setTimeout(syncAdminVisibility,0);
  enterApp(role);
}
function logoutRole(){
  currentRole=null;
  try{ sessionStorage.removeItem(ROLE_KEY); sessionStorage.removeItem(ADMIN_SESSION_KEY); }catch(e){}
  document.body.classList.remove('authenticated','app-enter','role-admin','role-og');
  document.querySelector('#adminPassword').value='';
  document.querySelector('#adminLoginBox').classList.add('hidden');
  document.querySelector('#authError').textContent='';
  setView('home',true);
  const auth=document.querySelector('#authScreen');
  auth?.classList.remove('hidden','auth-exit');
  auth?.classList.add('auth-return');
  window.setTimeout(()=>auth?.classList.remove('auth-return'),550);
  applyRoleUI();
}

document.querySelector('#loginOgBtn')?.addEventListener('click',()=>setRole('og'));
document.querySelector('#showAdminLoginBtn')?.addEventListener('click',()=>{
  document.querySelector('#adminLoginBox').classList.remove('hidden');
  document.querySelector('#adminPassword').focus();
});
async function tryAdminLogin(){
  const input=document.querySelector('#adminPassword');
  const error=document.querySelector('#authError');
  const btn=document.querySelector('#loginAdminBtn');
  const password=input?.value?.trim() || '';
  if(!password){ error.textContent='Ingresá la contraseña.'; input?.focus(); return; }
  try{
    if(btn){ btn.disabled=true; btn.textContent='ENTRANDO...'; }
    error.textContent='';
    const response=await fetch(KIDZ_LOGIN_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({password})
    });
    let result={};
    try{ result=await response.json(); }catch(e){}
    if(response.ok && result.ok === true && result.role === 'admin'){
      try{ sessionStorage.setItem(ADMIN_SESSION_KEY,password); }catch(e){}
      input.value='';
      setRole('admin');
      return;
    }
    error.textContent='Contraseña incorrecta.';
    input.select();
  }catch(err){
    console.error('Kidz login error:',err);
    error.textContent='No se pudo conectar con el servidor.';
  }finally{
    if(btn){ btn.disabled=false; btn.textContent='ENTRAR'; }
  }
}
document.querySelector('#loginAdminBtn')?.addEventListener('click',tryAdminLogin);
document.querySelector('#adminPassword')?.addEventListener('keydown',e=>{ if(e.key==='Enter') tryAdminLogin(); });
document.querySelector('#logoutBtn')?.addEventListener('click',logoutRole);

document.body.classList.remove('authenticated');
document.querySelector('#authScreen')?.classList.remove('hidden');


function loadData(){
  try{
    const saved = localStorage.getItem(STORAGE_KEY);
    if(!saved) return structuredClone(defaultData);
    const parsed=JSON.parse(saved);
    // Migración 1.9: lo que antes se llamaba Ubicaciones era en realidad Robos.
    if(!Array.isArray(parsed.robberies)){
      parsed.robberies=Array.isArray(parsed.locations)?parsed.locations:[];
      parsed.locations=[];
    }
    if(!Array.isArray(parsed.locations)) parsed.locations=[];
    if(!Array.isArray(parsed.drugs)) parsed.drugs=[];
    if(!Array.isArray(parsed.crafts)) parsed.crafts=[];

    // Migración 6.1: catálogo real de crafteos.
    const demoNames=new Set(["ganzúa", "pizarra", "cortacables", "kit de reparación", "radio casera", "escáner portátil", "batería improvisada", "caja reforzada", "bolsa reforzada", "cableado reparado", "placa electrónica", "dispositivo portátil", "auriculares reparados", "lata preparada", "bebida preparada", "arnés improvisado", "soporte metálico", "mecanismo de resorte", "antena improvisada", "panel de control", "caja electrónica", "cierre reforzado", "funda acolchada", "módulo reciclado"]);
    const realNames=new Set(REAL_CRAFT_CATALOG.map(c=>c.name.toLocaleLowerCase('es')));
    parsed.crafts=(parsed.crafts||[]).filter(c=>{
      const n=String(c?.name||'').trim().toLocaleLowerCase('es');
      return !demoNames.has(n) && !realNames.has(n);
    });
    REAL_CRAFT_CATALOG.forEach(seed=>parsed.crafts.push({...seed,materials:seed.materials.map(m=>({...m}))}));
    return parsed;
  }catch(e){ return structuredClone(defaultData); }
}
function saveData(){
  if(!requireAdmin()) return;
  sanitizeAllCraftMaterials();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  renderAll();
}
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

function normalizeSearchText(value=''){
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLocaleLowerCase('es')
    .replace(/[^a-z0-9\s]/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function levenshtein(a,b){
  a=normalizeSearchText(a);
  b=normalizeSearchText(b);
  const m=a.length,n=b.length;
  if(!m)return n;
  if(!n)return m;
  const prev=Array.from({length:n+1},(_,i)=>i);
  const curr=new Array(n+1);
  for(let i=1;i<=m;i++){
    curr[0]=i;
    for(let j=1;j<=n;j++){
      const cost=a[i-1]===b[j-1]?0:1;
      curr[j]=Math.min(
        curr[j-1]+1,
        prev[j]+1,
        prev[j-1]+cost
      );
    }
    for(let j=0;j<=n;j++)prev[j]=curr[j];
  }
  return prev[n];
}

function tokenMatches(queryToken,targetToken){
  if(!queryToken)return true;
  if(targetToken.includes(queryToken) || queryToken.includes(targetToken))return true;

  const len=queryToken.length;
  // Tolerancia gradual a errores. Evita coincidencias excesivas en palabras muy cortas.
  const maxDistance =
    len <= 3 ? 0 :
    len <= 5 ? 1 :
    len <= 8 ? 2 : 3;

  return levenshtein(queryToken,targetToken) <= maxDistance;
}

function fuzzyIncludes(query,text){
  const q=normalizeSearchText(query);
  if(!q)return true;

  const t=normalizeSearchText(text);
  if(!t)return false;

  // Primero intenta coincidencia normal para mantener búsquedas rápidas y precisas.
  if(t.includes(q))return true;

  const queryTokens=q.split(' ').filter(Boolean);
  const targetTokens=t.split(' ').filter(Boolean);

  // Cada palabra escrita por el usuario debe poder encontrar una coincidencia razonable.
  return queryTokens.every(qt =>
    targetTokens.some(tt => tokenMatches(qt,tt))
  );
}
function emptyMarkup(text){ return `<div class="empty-state">${text}</div>`; }
function imgMarkup(src,label='Sin imagen'){
  return src ? `<img src="${src}" alt="">` : `<div class="placeholder">＋<br>${esc(label)}</div>`;
}
function setView(view,forceHome=false){
  if(view==='home' && currentView!=='home' && !forceHome) return;
  currentView=view;
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelector('#view-'+view).classList.add('active');

  const header=document.querySelector('#siteHeader');
  const isHome=view==='home';
  header.classList.toggle('hidden',isHome);
  document.body.classList.toggle('home-mode',isHome);

  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  if(view!=='crafts'){
    document.querySelector('#liveCraftSidebar')?.classList.remove('open');
    document.body.classList.remove('live-sidebar-open');
  }
}
document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.go,b.dataset.go==='home')));

document.querySelector('#returnHomeBtn')?.addEventListener('click',()=>{
  document.querySelector('#liveCraftSidebar')?.classList.remove('open');
  document.body.classList.remove('live-sidebar-open');
  setView('home',true);
});

document.querySelector('#hacksBackBtn')?.addEventListener('click',()=>setView('robberies'));

const robberiesSearch=document.querySelector('#robberiesSearch');
const locationsSearch=document.querySelector('#locationsSearch');
const drugsSearch=document.querySelector('#drugsSearch');
const craftsSearch=document.querySelector('#craftsSearch');

robberiesSearch?.addEventListener('input',e=>renderRobberies(e.target.value));
locationsSearch?.addEventListener('input',e=>renderLocations(e.target.value));
drugsSearch?.addEventListener('input',e=>renderDrugs(e.target.value));
craftsSearch?.addEventListener('input',e=>renderCrafts(e.target.value));

function renderAll(){
  renderRobberies(document.querySelector('#robberiesSearch')?.value||'');
  renderLocations(document.querySelector('#locationsSearch')?.value||'');
  renderDrugs(document.querySelector('#drugsSearch')?.value||'');
  renderCrafts(document.querySelector('#craftsSearch')?.value||'');
  document.querySelector('#homeRobberiesCount') && (document.querySelector('#homeRobberiesCount').textContent=`${data.robberies.length} registro${data.robberies.length===1?'':'s'}`);
  document.querySelector('#homeLocationsCount') && (document.querySelector('#homeLocationsCount').textContent=`${data.locations.length} registro${data.locations.length===1?'':'s'}`);
  document.querySelector('#homeDrugsCount') && (document.querySelector('#homeDrugsCount').textContent=`${data.drugs.length} registro${data.drugs.length===1?'':'s'}`);
  document.querySelector('#homeCraftsCount') && (document.querySelector('#homeCraftsCount').textContent=`${data.crafts.length} registro${data.crafts.length===1?'':'s'}`);
}

function renderRobberies(filter=''){
  const grid=document.querySelector('#robberiesGrid');
  // La sección Robos 5.4 usa robberies.js y ya no tiene el grid legacy.
  if(!grid) return;
  const q=String(filter||'').trim();
  const list=data.robberies.filter(x=>!q || fuzzyIncludes(q,[x.name,x.type,x.description].join(' ')));
  if(!list.length){grid.innerHTML=emptyMarkup(q?'No se encontraron robos.':'Todavía no cargaste robos.');return;}
  grid.innerHTML=list.map(x=>`
    <article class="entry-card">
      <div class="entry-image">${imgMarkup(x.mapImage,'Mapa sin cargar')}</div>
      <div class="entry-body">
        <div class="entry-topline"><h3>${esc(x.name)}</h3><span class="tag">${esc(x.type||'ROBO')}</span></div>
        <p>${esc((x.description||'').slice(0,150))}${(x.description||'').length>150?'…':''} <span class="test-badge">TEST</span></p>
        <div class="entry-actions">
          <button class="mini-btn" onclick="openRobbery('${x.id}')">Ver robo</button>
          ${isAdmin()?`<button class="mini-btn" onclick="editRobbery('${x.id}')">Editar</button>
          <button class="mini-btn danger" onclick="removeEntry('robberies','${x.id}')">Eliminar</button>`:''}
        </div>
      </div>
    </article>`).join('');
}
function renderLocations(filter=''){
  const grid=document.querySelector('#locationsGrid');
  if(!grid) return;
  const q=String(filter||'').trim();
  const list=data.locations.filter(x=>!q || fuzzyIncludes(q,[x.name,x.description].join(' ')));
  if(!list.length){grid.innerHTML=emptyMarkup(q?'No se encontraron ubicaciones.':'Todavía no cargaste ubicaciones.');return;}
  grid.innerHTML=list.map(x=>`
    <article class="entry-card location-simple-card">
      <div class="entry-image">${imgMarkup(x.mapImage,'Mapa sin cargar')}</div>
      <div class="entry-body">
        <div class="entry-topline"><h3>${esc(x.name)}</h3></div>
        <p>${esc((x.description||'').slice(0,150))}${(x.description||'').length>150?'…':''}</p>
        <div class="entry-actions">
          <button class="mini-btn" onclick="openLocation('${x.id}')">Ver ubicación</button>
          ${isAdmin()?`<button class="mini-btn" onclick="editLocation('${x.id}')">Editar</button>
          <button class="mini-btn danger" onclick="removeEntry('locations','${x.id}')">Eliminar</button>`:''}
        </div>
      </div>
    </article>`).join('');
}
function renderDrugs(filter=''){
  const grid=document.querySelector('#drugsGrid');
  if(!grid) return;
  const q=String(filter||'').trim();
  const list=data.drugs.filter(x=>!q || fuzzyIncludes(q,[x.name,x.status,x.description].join(' ')));
  if(!list.length){grid.innerHTML=emptyMarkup(q?'No se encontraron entradas.':'No hay entradas todavía.');return;}
  grid.innerHTML=list.map(x=>`
    <article class="entry-card">
      <div class="entry-image">${imgMarkup((x.photos||[])[0],'Sin foto')}</div>
      <div class="entry-body">
        <div class="entry-topline"><h3>${esc(x.name)}</h3><span class="tag">${esc(x.status||'INFO')}</span></div>
        <p>${esc((x.description||'').slice(0,150))}${(x.description||'').length>150?'…':''} <span class="test-badge">TEST</span></p>
        <div class="entry-actions">
          <button class="mini-btn" onclick="openDrug('${x.id}')">Abrir</button>
          ${isAdmin()?`<button class="mini-btn" onclick="editDrug('${x.id}')">Editar</button>
          <button class="mini-btn danger" onclick="removeEntry('drugs','${x.id}')">Eliminar</button>`:''}
        </div>
      </div>
    </article>`).join('');
}
const CRAFT_SPANISH_NAMES = {"Empty Jar": "Frasco vacío", "Lean": "Lean", "Battery": "Batería", "Electronics": "Electrónica", "Hacking Device": "Dispositivo de hackeo", "Keypad Hacking Device": "Dispositivo de hackeo con teclado", "Smartwatch": "Reloj inteligente", "Copper Tubing": "Tubo de cobre", "Jack Stands": "Soportes para gato", "Jewelry Box": "Caja de joyas", "Luxury Watch": "Reloj de lujo", "Metal Plate": "Placa de metal", "Rubber": "Goma", "Spring": "Muelle", "Sugar": "Azúcar", "Yeast": "Levadura", "Gauze": "Gasa", "Drill": "Taladro", "Duffel Bag": "Bolso de lona", "Lockpick": "Ganzúa", "Stethoscope": "Estetoscopio", "Tow Rope": "Cuerda de remolque", "Wire Cutters": "Cortacables", "ATM Bomb": "Bomba para ATM", "Gunpowder": "Pólvora", "Homemade Bomb": "Bomba casera", "Cannabis Drying Rack": "Rack de secado de cannabis", "Cannabis Oil Press": "Prensa de aceite de cannabis", "Cap Machine": "Máquina de cápsulas", "CA Machine": "Máquina CA", "Empty Capsule": "Cápsula vacía", "Mushroom Tent": "Carpa de hongos", "Spray Can": "Lata de aerosol", "Advanced Lockpick": "Ganzúa avanzada", "ATM Scanning Device": "Dispositivo de escaneo ATM", "Blowtorch": "Soplete", "Console": "Consola", "Reinforced Rake": "Rastrillo reforzado", "Loot Bundle": "Paquete de botín", "Pocket Console": "Consola de bolsillo", "Drying Rack Module": "Módulo de rack de secado", "Drug Test Kit": "Test de drogas", "Grinder": "Grinder", "Vendas": "Vendas"};

function renderCrafts(filter=''){
  data.crafts=(data.crafts||[]).map(c=>({...c,materials:mergeDuplicateMaterials(c.materials||[])}));
  const grid=document.querySelector('#craftsGrid');
  if(!grid)return;

  const q=String(filter||'').trim();
  const list=data.crafts.filter(x=>{
    const materialText=(x.materials||[]).map(m=>m.name).join(' ');
    const spanishName=CRAFT_SPANISH_NAMES?.[x.name]||'';
    return !q || fuzzyIncludes(
      q,
      [x.name,spanishName,x.category,x.description,materialText].join(' ')
    );
  });

  if(!list.length){
    grid.innerHTML=emptyMarkup(q?'No se encontraron crafteos.':'Todavía no hay crafteos cargados.');
    return;
  }

  grid.innerHTML=list.map((x,index)=>`
    <article class="craft-workbench" data-craft-id="${x.id}">
      <div class="craft-workbench-media">
        ${imgMarkup(x.image,'Sin imagen')}
        <span class="craft-workbench-number">${String(index+1).padStart(2,'0')}</span>
      </div>

      <div class="craft-workbench-main">
        <div class="craft-workbench-heading">
          <div>
            <span class="craft-workbench-category">${esc(x.category||'CRAFTEO')}</span>
            <h3>${esc(x.name)}</h3>
            ${CRAFT_SPANISH_NAMES[x.name] && CRAFT_SPANISH_NAMES[x.name]!==x.name
              ? `<div class="craft-name-es">${esc(CRAFT_SPANISH_NAMES[x.name])}</div>`
              : ''}
          </div>
          ${isAdmin()?`<div class="craft-admin-mini">
            <button type="button" data-craft-edit="${x.id}">EDITAR</button>
            <button type="button" data-craft-delete="${x.id}">BORRAR</button>
          </div>`:''}
        </div>

        <div class="craft-material-title">MATERIALES</div>
        <div class="craft-material-blueprint">
          ${(x.materials||[]).map(m=>`
            <div class="craft-blueprint-row">
              <span>${esc(m.name)}</span>
              <b>${esc(m.qty)}</b>
            </div>`).join('')}
        </div>

        <div class="craft-workbench-actions">
          <div class="craft-qty-wrap">
            <span>CANT.</span>
            <input id="quickQty-${x.id}" data-craft-qty="${x.id}" type="number" min="1" step="1" value="1" aria-label="Cantidad">
          </div>
          <button type="button" class="craft-add-action" data-craft-add="${x.id}" onclick="window.addLiveCraft && window.addLiveCraft('${x.id}')">
            <span>+</span> AÑADIR AL CÁLCULO
          </button>
        </div>
      </div>
    </article>`).join('');
}

const modal=document.querySelector('#modal');
function showModal(html,wide=false){
  const content=document.querySelector('#modalContent');
  const card=document.querySelector('.modal-card');
  const modalEl=document.querySelector('#modal');
  if(!content || !card || !modalEl){
    console.error('KIDZ: modal no disponible');
    return;
  }
  content.innerHTML=html;
  card.classList.toggle('wide',wide);
  modalEl.classList.add('open');
}
function closeModal(){ modal.classList.remove('open'); }
document.querySelectorAll('[data-close-modal]').forEach(x=>x.addEventListener('click',closeModal));

function imageToDataURL(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);
  });
}
function filePicker(callback,multiple=false){
  const input=document.querySelector('#hiddenImageInput');
  input.multiple=multiple;input.value='';
  input.onchange=async()=>{
    if(!input.files.length)return;
    const arr=[];for(const f of input.files)arr.push(await imageToDataURL(f));
    callback(multiple?arr:arr[0]);
  };
  input.click();
}

document.querySelector('#addRobberyBtn').onclick=()=>robberyForm();
function robberyForm(item=null){
  if(!requireAdmin()) return;
  const x=item||{id:kidzUUID(),name:'',type:'Punto de interés',description:'',mapImage:'',photos:[]};
  showModal(`<h2>${item?'Editar':'Nuevo'} robo</h2>
  <div class="form-grid">
    <div class="form-group"><label>Nombre</label><input id="fName" value="${esc(x.name)}"></div>
    <div class="form-group"><label>Tipo</label><input id="fType" value="${esc(x.type)}"></div>
    <div class="form-group full"><label>Explicación</label><textarea id="fDesc">${esc(x.description)}</textarea></div>
    <div class="form-group full"><label>Mapa</label><button class="ghost-btn" id="pickMap">Seleccionar imagen</button><span class="form-help" id="mapState">${x.mapImage?'Mapa cargado':'Sin mapa'}</span></div>
    <div class="form-group full"><label>Fotos</label><button class="ghost-btn" id="pickPhotos">Añadir fotos</button><span class="form-help" id="photoState">${(x.photos||[]).length} foto(s)</span></div>
  </div>
  <div class="form-actions"><button class="ghost-btn" onclick="closeModal()">Cancelar</button><button class="primary-btn" id="saveLocation">Guardar</button></div>`);
  let mapImage=x.mapImage||'',photos=[...(x.photos||[])];
  document.querySelector('#pickMap').onclick=()=>filePicker(src=>{mapImage=src;document.querySelector('#mapState').textContent='Mapa cargado';});
  document.querySelector('#pickPhotos').onclick=()=>filePicker(srcs=>{photos.push(...srcs);document.querySelector('#photoState').textContent=photos.length+' foto(s)';},true);
  document.querySelector('#saveLocation').onclick=()=>{
    upsert('robberies',{...x,name:document.querySelector('#fName').value.trim()||'Sin nombre',type:document.querySelector('#fType').value.trim(),description:document.querySelector('#fDesc').value,mapImage,photos});
    closeModal();
  };
}
window.editRobbery=id=>robberyForm(data.robberies.find(x=>x.id===id));
window.openRobbery=id=>{
  const x=data.robberies.find(x=>x.id===id);let zoom=1;
  showModal(`<span class="badge">${esc(x.type||'UBICACIÓN')}</span><h2>${esc(x.name)}</h2>
  <div class="map-stage">
    ${x.mapImage?`<img id="zoomMap" src="${x.mapImage}">`:`<div class="placeholder" style="height:100%;display:grid;place-items:center">Sin mapa</div>`}
    ${x.mapImage?`<div class="map-toolbar"><button id="zoomIn">＋</button><button id="zoomOut">−</button><button id="zoomReset">⌂</button></div>`:''}
  </div>
  <div class="detail-copy">${esc(x.description||'Sin explicación.')}</div>
  <div class="hack-practice-wrap"><button class="primary-btn hack-practice-btn" id="practiceHackBtn">Practicar hackeos</button></div>
  ${(x.photos||[]).length?`<div class="photos-row">${x.photos.map(p=>`<img src="${p}">`).join('')}</div>`:''}`);
  const practiceHackBtn=document.querySelector('#practiceHackBtn');
  if(practiceHackBtn) practiceHackBtn.onclick=()=>{ closeModal(); setView('hacks'); };
  const map=document.querySelector('#zoomMap');
  if(map){
    const apply=()=>map.style.transform=`scale(${zoom})`;
    zoomIn.onclick=()=>{zoom=Math.min(3,zoom+.25);apply()};
    zoomOut.onclick=()=>{zoom=Math.max(.5,zoom-.25);apply()};
    zoomReset.onclick=()=>{zoom=1;apply()};
  }
};

document.querySelector('#addLocationBtn').onclick=()=>locationForm();
function locationForm(item=null){
  if(!requireAdmin()) return;
  const x=item||{id:kidzUUID(),name:'',description:'',mapImage:''};
  showModal(`<h2>${item?'Editar':'Nueva'} ubicación</h2>
  <div class="form-grid">
    <div class="form-group full"><label>Nombre</label><input id="lName" value="${esc(x.name)}"></div>
    <div class="form-group full"><label>Descripción</label><textarea id="lDesc">${esc(x.description||'')}</textarea></div>
    <div class="form-group full"><label>Mapa</label><button class="ghost-btn" id="pickLocationMap">Seleccionar imagen</button><span class="form-help" id="locationMapState">${x.mapImage?'Mapa cargado':'Sin mapa'}</span></div>
  </div>
  <div class="form-actions"><button class="ghost-btn" onclick="closeModal()">Cancelar</button><button class="primary-btn" id="saveSimpleLocation">Guardar</button></div>`);
  let mapImage=x.mapImage||'';
  document.querySelector('#pickLocationMap').onclick=()=>filePicker(src=>{mapImage=src;document.querySelector('#locationMapState').textContent='Mapa cargado';});
  document.querySelector('#saveSimpleLocation').onclick=()=>{
    upsert('locations',{...x,name:document.querySelector('#lName').value.trim()||'Sin nombre',description:document.querySelector('#lDesc').value,mapImage});
    closeModal();
  };
}
window.editLocation=id=>locationForm(data.locations.find(x=>x.id===id));
window.openLocation=id=>{
  const x=data.locations.find(x=>x.id===id);let zoom=1;
  showModal(`<h2>${esc(x.name)}</h2>
  <div class="map-stage">
    ${x.mapImage?`<img id="zoomLocationMap" src="${x.mapImage}">`:`<div class="placeholder" style="height:100%;display:grid;place-items:center">Sin mapa</div>`}
    ${x.mapImage?`<div class="map-toolbar"><button id="locationZoomIn">＋</button><button id="locationZoomOut">−</button><button id="locationZoomReset">⌂</button></div>`:''}
  </div>
  <div class="detail-copy">${esc(x.description||'Sin descripción.')}</div>`);
  const map=document.querySelector('#zoomLocationMap');
  if(map){
    const apply=()=>map.style.transform=`scale(${zoom})`;
    document.querySelector('#locationZoomIn').onclick=()=>{zoom=Math.min(3,zoom+.25);apply()};
    document.querySelector('#locationZoomOut').onclick=()=>{zoom=Math.max(.5,zoom-.25);apply()};
    document.querySelector('#locationZoomReset').onclick=()=>{zoom=1;apply()};
  }
};

document.querySelector('#addDrugBtn')?.addEventListener('click',()=>drugForm());
function drugForm(item=null){
  if(!requireAdmin()) return;
  const x=item||{id:kidzUUID(),name:'',status:'Descubierto',description:'',photos:[]};
  showModal(`<h2>${item?'Editar':'Nueva'} entrada</h2>
  <div class="form-grid">
    <div class="form-group"><label>Nombre</label><input id="dName" value="${esc(x.name)}"></div>
    <div class="form-group"><label>Estado / categoría</label><input id="dStatus" value="${esc(x.status)}"></div>
    <div class="form-group full"><label>Información</label><textarea id="dDesc">${esc(x.description)}</textarea></div>
    <div class="form-group full"><label>Fotos</label><button class="ghost-btn" id="pickDrugPhotos">Añadir fotos</button><span class="form-help" id="drugPhotoState">${(x.photos||[]).length} foto(s)</span></div>
  </div>
  <div class="form-actions"><button class="ghost-btn" onclick="closeModal()">Cancelar</button><button class="primary-btn" id="saveDrug">Guardar</button></div>`);
  let photos=[...(x.photos||[])];
  pickDrugPhotos.onclick=()=>filePicker(srcs=>{photos.push(...srcs);drugPhotoState.textContent=photos.length+' foto(s)';},true);
  saveDrug.onclick=()=>{upsert('drugs',{...x,name:dName.value.trim()||'Sin nombre',status:dStatus.value.trim(),description:dDesc.value,photos});closeModal();};
}
window.editDrug=id=>drugForm(data.drugs.find(x=>x.id===id));
window.openDrug=id=>{
  const x=data.drugs.find(x=>x.id===id);
  showModal(`<span class="badge">${esc(x.status||'INFO')}</span><h2>${esc(x.name)}</h2>
  <div class="detail-copy" style="white-space:pre-wrap">${esc(x.description||'Sin información.')}</div>
  ${(x.photos||[]).length?`<div class="photos-row">${x.photos.map(p=>`<img src="${p}">`).join('')}</div>`:''}`);
};

document.querySelector('#addCraftBtn').onclick=()=>craftForm();
function normalizeMaterialName(value){
  const raw=String(value||'').trim();
  const match=MATERIAL_CATALOG.find(m=>m.toLocaleLowerCase('es')===raw.toLocaleLowerCase('es'));
  return match || raw;
}

function mergeDuplicateMaterials(materials=[]){
  const merged=new Map();

  for(const material of materials){
    const canonical=normalizeMaterialName(material?.name || '');
    if(!canonical) continue;

    const key=normalizeSearchText(canonical);
    const qtyText=String(material?.qty ?? '1').trim().replace(',','.');
    const qty=Number(qtyText);

    if(!Number.isFinite(qty) || qty<=0) continue;

    if(!merged.has(key)){
      merged.set(key,{name:canonical,qty:0});
    }
    merged.get(key).qty += qty;
  }

  return [...merged.values()].map(m=>({
    name:m.name,
    qty:Number.isInteger(m.qty) ? String(m.qty) : String(Number(m.qty.toFixed(2)))
  }));
}

function sanitizeAllCraftMaterials(){
  data.crafts=(data.crafts||[]).map(c=>({
    ...c,
    materials:mergeDuplicateMaterials(c.materials||[])
  }));
}

function craftForm(item=null){
  if(!requireAdmin()) return;
  const x=item||{id:kidzUUID(),name:'',category:'Herramienta',description:'',materials:[],image:''};
  const cleanMaterials=mergeDuplicateMaterials(x.materials||[]);

  showModal(`<h2>${item?'Editar':'Nuevo'} crafteo</h2>
  <div class="form-grid">
    <div class="form-group"><label>Objeto</label><input id="cName" value="${esc(x.name)}"></div>
    <div class="form-group"><label>Categoría</label><input id="cCategory" value="${esc(x.category)}"></div>
    <div class="form-group full"><label>Descripción</label><textarea id="cDesc">${esc(x.description)}</textarea></div>

    <div class="form-group full">
      <label>Materiales</label>
      <div id="materialRows" class="material-editor-rows"></div>
      <button type="button" class="ghost-btn material-add-row-btn" id="addMaterialRowBtn">+ Añadir material</button>
      <span class="form-help">Podés escribir para filtrar o abrir la lista y buscar entre todos los materiales disponibles.</span>
    </div>

    <div class="form-group full"><label>Imagen</label><button class="ghost-btn" id="pickCraftImage">Seleccionar imagen</button><span class="form-help" id="craftImageState">${x.image?'Imagen cargada':'Sin imagen'}</span></div>
  </div>

  <div class="form-actions">
    <button class="ghost-btn" onclick="closeModal()">Cancelar</button>
    <button class="primary-btn" id="saveCraft">Guardar</button>
  </div>`);

  let image=x.image||'';
  pickCraftImage.onclick=()=>filePicker(src=>{image=src;craftImageState.textContent='Imagen cargada';});

  const rowsWrap=document.querySelector('#materialRows');

  function getSelectedMaterialKeys(exceptRow=null){
    return new Set(
      [...rowsWrap.querySelectorAll('.material-editor-row')]
        .filter(row=>row!==exceptRow)
        .map(row=>normalizeSearchText(row.dataset.material||''))
        .filter(Boolean)
    );
  }

  function closeAllMaterialDropdowns(except=null){
    rowsWrap.querySelectorAll('.material-search-dropdown.open').forEach(drop=>{
      if(drop!==except) drop.classList.remove('open');
    });
  }

  function renderMaterialDropdown(row){
    const input=row.querySelector('.material-search-input');
    const dropdown=row.querySelector('.material-search-dropdown');
    const used=getSelectedMaterialKeys(row);
    const query=input.value.trim();

    const options=MATERIAL_CATALOG.filter(material=>{
      const key=normalizeSearchText(material);
      if(used.has(key)) return false;
      if(!query) return true;
      return fuzzyIncludes(query,material);
    });

    dropdown.innerHTML=options.length
      ? options.map(material=>`<button type="button" class="material-search-option" data-material="${esc(material)}">${esc(material)}</button>`).join('')
      : `<div class="material-search-empty">No hay materiales disponibles</div>`;

    dropdown.querySelectorAll('.material-search-option').forEach(btn=>{
      btn.onclick=()=>{
        row.dataset.material=btn.dataset.material;
        input.value=btn.dataset.material;
        dropdown.classList.remove('open');
        refreshAllMaterialRows();
      };
    });
  }

  function refreshAllMaterialRows(){
    [...rowsWrap.querySelectorAll('.material-editor-row')].forEach(row=>{
      const selected=row.dataset.material||'';
      const input=row.querySelector('.material-search-input');

      if(selected){
        const duplicate=[...rowsWrap.querySelectorAll('.material-editor-row')]
          .some(other=>other!==row && normalizeSearchText(other.dataset.material||'')===normalizeSearchText(selected));
        if(duplicate){
          row.dataset.material='';
          input.value='';
        }
      }

      if(row.querySelector('.material-search-dropdown').classList.contains('open')){
        renderMaterialDropdown(row);
      }
    });
  }

  function addMaterialRow(material='',qty=1){
    const row=document.createElement('div');
    row.className='material-editor-row';
    row.dataset.material=material||'';

    row.innerHTML=`
      <div class="material-search-control">
        <input
          class="material-search-input"
          type="text"
          value="${esc(material)}"
          placeholder="Buscar o elegir material..."
          autocomplete="off"
          aria-label="Material"
        >
        <button type="button" class="material-search-toggle" title="Mostrar materiales">⌄</button>
        <div class="material-search-dropdown"></div>
      </div>
      <input class="material-qty" type="number" min="1" step="1" value="${esc(qty)}" aria-label="Cantidad">
      <button type="button" class="material-remove-row" title="Quitar material">×</button>
    `;

    rowsWrap.appendChild(row);

    const input=row.querySelector('.material-search-input');
    const toggle=row.querySelector('.material-search-toggle');
    const dropdown=row.querySelector('.material-search-dropdown');
    const qtyInput=row.querySelector('.material-qty');
    const removeBtn=row.querySelector('.material-remove-row');

    function openDropdown(showAll=false){
      closeAllMaterialDropdowns(dropdown);
      if(showAll && !row.dataset.material){
        input.value='';
      }
      renderMaterialDropdown(row);
      dropdown.classList.add('open');
    }

    input.addEventListener('focus',()=>{
      if(row.dataset.material && input.value===row.dataset.material){
        input.select();
      }
      openDropdown(false);
    });

    input.addEventListener('input',()=>{
      row.dataset.material='';
      openDropdown(false);
    });

    toggle.onclick=()=>{
      if(dropdown.classList.contains('open')){
        dropdown.classList.remove('open');
      }else{
        if(!row.dataset.material) input.value='';
        openDropdown(true);
        input.focus();
      }
    };

    qtyInput.addEventListener('input',()=>{
      if(Number(qtyInput.value)<1) qtyInput.value=1;
    });

    removeBtn.onclick=()=>{
      row.remove();
      refreshAllMaterialRows();
    };

    renderMaterialDropdown(row);
  }

  cleanMaterials.forEach(m=>{
    const catalogMatch=MATERIAL_CATALOG.find(v=>normalizeSearchText(v)===normalizeSearchText(m.name));
    if(catalogMatch) addMaterialRow(catalogMatch,m.qty);
  });

  if(!rowsWrap.children.length){
    addMaterialRow('',1);
  }

  addMaterialRowBtn.onclick=()=>{
    const selected=getSelectedMaterialKeys();
    if(selected.size>=MATERIAL_CATALOG.length){
      alert('Ya agregaste todos los materiales disponibles.');
      return;
    }
    addMaterialRow('',1);
  };

  document.addEventListener('click',function materialOutsideClick(e){
    if(!rowsWrap.isConnected){
      document.removeEventListener('click',materialOutsideClick);
      return;
    }
    if(!e.target.closest('.material-search-control')){
      closeAllMaterialDropdowns();
    }
  });

  saveCraft.onclick=()=>{
    const rows=[...rowsWrap.querySelectorAll('.material-editor-row')];
    const materials=[];
    const seen=new Set();

    for(const row of rows){
      const material=row.dataset.material||'';
      const qty=Number(row.querySelector('.material-qty').value);

      if(!material){
        alert('Seleccioná un material válido de la lista en cada fila.');
        return;
      }

      if(!Number.isFinite(qty) || qty<=0){
        alert(`La cantidad de "${material}" debe ser mayor que 0.`);
        return;
      }

      const key=normalizeSearchText(material);
      if(seen.has(key)){
        alert(`El material "${material}" está repetido.`);
        return;
      }

      seen.add(key);
      materials.push({
        name:normalizeMaterialName(material),
        qty:Number.isInteger(qty)?String(qty):String(Number(qty.toFixed(2)))
      });
    }

    upsert('crafts',{
      ...x,
      name:cName.value.trim()||'Sin nombre',
      category:cCategory.value.trim(),
      description:cDesc.value,
      materials,
      image
    });

    closeModal();
  };
}
window.editCraft=id=>craftForm(data.crafts.find(x=>x.id===id));

function parseQty(v){
  const n=Number(String(v).replace(',','.').trim());
  return Number.isFinite(n)?n:null;
}
function openCraftCalculator(prefillId=null){
  if(!data.crafts.length){alert('Primero cargá al menos un crafteo.');return;}

  showModal(`<h2>Calculadora de crafteos</h2>
    <div class="calculator-simple">
      <div class="calc-search-wrap">
        <input id="calcCraftSearch" class="section-search calc-search" type="search" placeholder="Escribí el nombre del crafteo...">
        <div id="calcCraftResults" class="calc-search-results"></div>
      </div>
      <div id="calcSelectedCrafts"></div>
      <div class="simple-total">
        <h3>Total de materiales</h3>
        <div id="calcTotals"><div class="calc-empty">Buscá y agregá un crafteo.</div></div>
      </div>
    </div>`);

  const selected=new Map();
  const search=document.querySelector('#calcCraftSearch');
  const results=document.querySelector('#calcCraftResults');
  const selectedWrap=document.querySelector('#calcSelectedCrafts');

  function renderSearch(){
    const q=search.value.trim();
    if(!q){results.classList.remove('open');results.innerHTML='';return;}
    const matches=data.crafts
      .filter(c=>fuzzyIncludes(q,[c.name,c.category,(c.materials||[]).map(m=>m.name).join(' ')].join(' ')))
      .slice(0,12);
    results.innerHTML=matches.length
      ? matches.map(c=>`<button class="calc-search-result" data-id="${c.id}">${esc(c.name)}</button>`).join('')
      : `<div class="calc-empty" style="padding:12px">Sin resultados.</div>`;
    results.classList.add('open');
    results.querySelectorAll('[data-id]').forEach(btn=>{
      btn.onclick=()=>{
        addSelected(btn.dataset.id,1);
        search.value='';
        results.classList.remove('open');
        search.focus();
      };
    });
  }

  function addSelected(id,qty=1){
    if(selected.has(id)) selected.set(id, selected.get(id)+qty);
    else selected.set(id,qty);
    renderSelected();
  }

  function renderSelected(){
    selectedWrap.innerHTML=[...selected.entries()].map(([id,qty])=>{
      const c=data.crafts.find(x=>x.id===id);
      if(!c)return '';
      return `<div class="calc-selected-row">
        <strong>${esc(c.name)}</strong>
        <input type="number" min="1" step="1" value="${qty}" data-qty-id="${id}">
        <button type="button" data-remove-id="${id}">×</button>
      </div>`;
    }).join('');

    selectedWrap.querySelectorAll('[data-qty-id]').forEach(inp=>{
      inp.oninput=()=>{
        selected.set(inp.dataset.qtyId, Math.max(1,Number(inp.value)||1));
        recalc();
      };
    });
    selectedWrap.querySelectorAll('[data-remove-id]').forEach(btn=>{
      btn.onclick=()=>{
        selected.delete(btn.dataset.removeId);
        renderSelected();
      };
    });
    recalc();
  }

  function recalc(){
    const totals=calculateTotalsFromSelection(selected);
    const target=document.querySelector('#calcTotals');
    const list=[...totals.values()].sort((a,b)=>a.name.localeCompare(b.name,'es'));
    target.innerHTML=list.length
      ? list.map(x=>`<div class="total-row"><span>${esc(x.name)}</span><b>${Number.isInteger(x.qty)?x.qty:x.qty.toFixed(2)}</b></div>`).join('')
      : `<div class="calc-empty">Buscá y agregá un crafteo.</div>`;
  }

  search.addEventListener('input',renderSearch);
  search.addEventListener('focus',renderSearch);

  if(prefillId) addSelected(prefillId,1);
  else search.focus();
}
window.openCraftCalculator=openCraftCalculator;
window.quickCraft=id=>window.openCraftCalculator(id);


function calculateTotalsFromSelection(selection){
  const totals=new Map();
  selection.forEach((count,id)=>{
    if(count<=0)return;
    const craft=data.crafts.find(c=>c.id===id);
    if(!craft)return;
    (craft.materials||[]).forEach(m=>{
      const q=parseQty(m.qty);
      if(q===null)return;
      const canonical=normalizeMaterialName(m.name);
      const key=canonical.toLocaleLowerCase('es');
      if(!totals.has(key)) totals.set(key,{name:canonical,qty:0});
      totals.get(key).qty += q*count;
    });
  });
  return totals;
}

const liveCraftSelection=new Map();

window.addLiveCraft=function(id){
  const qtyInput=document.getElementById(`quickQty-${id}`);
  const qty=Math.max(1,Number(qtyInput?.value)||1);

  liveCraftSelection.set(id,(liveCraftSelection.get(id)||0)+qty);
  renderLiveCraftSidebar();

  const sidebar=document.getElementById('liveCraftSidebar');
  if(sidebar){
    sidebar.classList.add('open');
    sidebar.setAttribute('aria-hidden','false');

    // Fallback visual directo contra reglas CSS antiguas.
    sidebar.style.setProperty('display','flex','important');
    sidebar.style.setProperty('visibility','visible','important');
    sidebar.style.setProperty('opacity','1','important');
    sidebar.style.setProperty('transform','translate3d(0,0,0)','important');
    sidebar.style.setProperty('pointer-events','auto','important');
    sidebar.style.setProperty('z-index','99999','important');
  }

  document.body.classList.add('live-sidebar-open');
};

const craftsGridEl=document.querySelector('#craftsGrid');
craftsGridEl?.addEventListener('click',event=>{
  const edit=event.target.closest('[data-craft-edit]');
  if(edit && isAdmin()){
    event.preventDefault();
    window.editCraft(edit.dataset.craftEdit);
    return;
  }

  const del=event.target.closest('[data-craft-delete]');
  if(del && isAdmin()){
    event.preventDefault();
    window.removeEntry('crafts',del.dataset.craftDelete);
  }
});


function renderLiveCraftSidebar(){
  const items=document.querySelector('#liveCraftItems');
  const totalsEl=document.querySelector('#liveCraftTotals');

  if(!liveCraftSelection.size){
    items.innerHTML=`<div class="live-empty">Todavía no añadiste ningún crafteo.</div>`;
    totalsEl.innerHTML=`<div class="live-empty">Sin materiales calculados.</div>`;
    return;
  }

  items.innerHTML=[...liveCraftSelection.entries()].map(([id,qty])=>{
    const c=data.crafts.find(x=>x.id===id);
    if(!c)return '';
    return `<div class="live-item">
      <strong>${esc(c.name)}</strong>
      <input type="number" min="1" step="1" value="${qty}" data-live-qty="${id}">
      <button type="button" data-live-remove="${id}">×</button>
    </div>`;
  }).join('');

  items.querySelectorAll('[data-live-qty]').forEach(inp=>{
    inp.oninput=()=>{
      liveCraftSelection.set(inp.dataset.liveQty,Math.max(1,Number(inp.value)||1));
      renderLiveCraftTotals();
    };
  });
  items.querySelectorAll('[data-live-remove]').forEach(btn=>{
    btn.onclick=()=>{
      liveCraftSelection.delete(btn.dataset.liveRemove);
      renderLiveCraftSidebar();
      if(!liveCraftSelection.size){
        document.querySelector('#liveCraftSidebar').classList.remove('open');
        document.body.classList.remove('live-sidebar-open');
      }
    };
  });

  renderLiveCraftTotals();
}

function renderLiveCraftTotals(){
  const totalsEl=document.querySelector('#liveCraftTotals');
  const totals=calculateTotalsFromSelection(liveCraftSelection);
  const list=[...totals.values()].sort((a,b)=>a.name.localeCompare(b.name,'es'));
  totalsEl.innerHTML=list.length
    ? list.map(x=>`<div class="total-row"><span>${esc(x.name)}</span><b>${Number.isInteger(x.qty)?x.qty:x.qty.toFixed(2)}</b></div>`).join('')
    : `<div class="live-empty">Sin materiales calculados.</div>`;
}

document.querySelector('#closeLiveSidebar').onclick=()=>{
  const sidebar=document.querySelector('#liveCraftSidebar');
  sidebar?.classList.remove('open');
  if(sidebar){
    sidebar.style.removeProperty('display');
    sidebar.style.removeProperty('visibility');
    sidebar.style.removeProperty('opacity');
    sidebar.style.removeProperty('transform');
    sidebar.style.removeProperty('pointer-events');
    sidebar.style.removeProperty('z-index');
  }
  document.body.classList.remove('live-sidebar-open');
};
document.querySelector('#clearLiveCrafts').onclick=()=>{
  liveCraftSelection.clear();
  renderLiveCraftSidebar();
  const sidebar=document.querySelector('#liveCraftSidebar');
  sidebar?.classList.remove('open');
  if(sidebar){
    sidebar.style.removeProperty('display');
    sidebar.style.removeProperty('visibility');
    sidebar.style.removeProperty('opacity');
    sidebar.style.removeProperty('transform');
    sidebar.style.removeProperty('pointer-events');
    sidebar.style.removeProperty('z-index');
  }
  document.body.classList.remove('live-sidebar-open');
};
function upsert(type,obj){
  if(!requireAdmin()) return;
  if(type==='crafts'){
    obj={...obj,materials:mergeDuplicateMaterials(obj.materials||[])};
  }
  const idx=data[type].findIndex(x=>x.id===obj.id);
  if(idx>=0)data[type][idx]=obj;else data[type].push(obj);
  saveData();
}
window.removeEntry=(type,id)=>{
  if(!requireAdmin())return;
  if(!confirm('¿Eliminar este registro?'))return;
  data[type]=data[type].filter(x=>x.id!==id);saveData();
};

document.querySelector('#exportBtn').onclick=()=>{
  if(!requireAdmin())return;
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='kidz-backup.json';a.click();URL.revokeObjectURL(a.href);
};
document.querySelector('#importInput').onchange=async e=>{
  if(!requireAdmin()){e.target.value='';return;}
  const file=e.target.files[0];if(!file)return;
  try{
    const incoming=JSON.parse(await file.text());
    if(!incoming.drugs||!incoming.crafts)throw new Error();
    if(!Array.isArray(incoming.robberies)){ incoming.robberies=Array.isArray(incoming.locations)?incoming.locations:[]; incoming.locations=[]; }
    if(!Array.isArray(incoming.locations)) incoming.locations=[];
    data=incoming;saveData();alert('Datos importados correctamente.');
  }catch{alert('El archivo no tiene un formato válido.');}
};

function normalizeImportRows(rows){
  const grouped=new Map();
  const rejected=[];

  rows.forEach((row,index)=>{
    const item=String(row.Objeto ?? row.objeto ?? row.Nombre ?? row.nombre ?? '').trim();
    const category=String(row.Categoria ?? row.categoria ?? row.Categoría ?? '').trim();
    const description=String(row.Descripcion ?? row.descripcion ?? row.Descripción ?? '').trim();
    const rawMaterial=String(row.Material ?? row.material ?? '').trim();
    const qty=row.Cantidad ?? row.cantidad ?? row.Qty ?? row.qty ?? '';

    if(!item || !rawMaterial)return;

    const material=MATERIAL_CATALOG.find(m=>normalizeSearchText(m)===normalizeSearchText(rawMaterial));
    if(!material){
      rejected.push({row:index+2,material:rawMaterial});
      return;
    }

    if(!grouped.has(normalizeSearchText(item))) grouped.set(normalizeSearchText(item),{
      id:kidzUUID(),name:item,category:category||'Crafteo',description,materials:[],image:''
    });

    const craft=grouped.get(normalizeSearchText(item));
    if(category)craft.category=category;
    if(description)craft.description=description;

    craft.materials.push({
      name:material,
      qty:String(qty).trim()||'1'
    });
  });

  return {
    crafts:[...grouped.values()].map(c=>({...c,materials:mergeDuplicateMaterials(c.materials)})),
    rejected
  };
}
document.querySelector('#craftImportInput').onchange=async e=>{
  if(!requireAdmin()){e.target.value='';return;}
  const file=e.target.files[0];if(!file)return;
  try{
    let rows=[];
    if(file.name.toLowerCase().endsWith('.csv')){
      const text=await file.text();
      const wb=XLSX.read(text,{type:'string'});
      rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''});
    }else{
      const buf=await file.arrayBuffer();
      const wb=XLSX.read(buf,{type:'array'});
      rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''});
    }
    const parsed=normalizeImportRows(rows);
    const crafts=parsed.crafts;
    if(!crafts.length)throw new Error('No valid rows');

    crafts.forEach(c=>{
      const existing=data.crafts.find(x=>normalizeSearchText(x.name)===normalizeSearchText(c.name));
      if(existing){
        existing.category=c.category;
        existing.description=c.description;
        existing.materials=mergeDuplicateMaterials(c.materials);
      }else{
        data.crafts.push(c);
      }
    });

    saveData();

    if(parsed.rejected.length){
      const sample=parsed.rejected.slice(0,5).map(x=>`fila ${x.row}: ${x.material}`).join('\n');
      alert(`Importados/actualizados ${crafts.length} crafteos.\n\nSe ignoraron ${parsed.rejected.length} materiales que no existen en la base permitida.\n${sample}`);
    }else{
      alert(`Importados/actualizados ${crafts.length} crafteos.`);
    }
  }catch(err){
    alert('No pude importar el archivo. Revisá que tenga columnas: Objeto, Categoria, Descripcion, Material y Cantidad.');
  } finally {e.target.value='';}
};

document.querySelector('#downloadTemplateBtn').onclick=()=>{
  if(!requireAdmin())return;
  const csv=`Objeto,Categoria,Descripcion,Material,Cantidad
Ganzúa,Herramienta,Ejemplo de receta,Metal,2
Ganzúa,Herramienta,Ejemplo de receta,Plástico,1
Pizarra,Objeto,Ejemplo de receta,Madera,3
Pizarra,Objeto,Ejemplo de receta,Metal,1`;
  const blob=new Blob(["\ufeff"+csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='plantilla_crafteos.csv';a.click();URL.revokeObjectURL(a.href);
};

renderAll();
applyRoleUI();

document.addEventListener('DOMContentLoaded', syncAdminVisibility);
