/* Tutoriel pas à pas : chaque étape montre l'objet et détaille le calcul avec les vraies valeurs de la scène */
let tmode=0,ts=0;
const hm=h=>{h=((h%24)+24)%24;const m=Math.round(h*60);return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
const sgnH=h=>(h<0?'−':'+')+hm(Math.abs(h)).replace(/^0/,'');
function vals(){
  const j=sc.day,d=new Date((j-2440587.5)*864e5),u=d.getUTCHours()+d.getUTCMinutes()/60,s=Math.round(solT(j,lon)*60)/60,ec=((s-u+36)%24)-12;
  return{u,s,ec,lon:15*(ec-eot/60),pole:Math.abs(lat)};
}
const STEPS=[
 {t:'Regarde autour de toi',d:()=>{setTool(null);setNight(0);bk(0)},
  f:()=>'Fais glisser l’écran (doigt ou souris) pour tourner sur 360° et lever les yeux. L’interrupteur en haut passe du jour à la nuit. Ta mission : trouver ta <b>longitude</b> (Est–Ouest) et ta <b>latitude</b> (Nord–Sud).'},
 {t:'La boussole : où est le nord ?',d:()=>{setNight(0);setTool('comp')},
  f:()=>'Ouvre le sac (en bas à droite) et touche un objet pour le prendre. La boussole indique le <b>Nord</b> (N rouge) : tourne-toi jusqu’à ce que N soit en haut. Repère aussi le Sud : il servira à choisir N ou S plus tard.'},
 {t:'La montre : l’heure de Greenwich',d:()=>{setNight(0);setTool('watch')},
  f:v=>`La montre est restée à l’heure de Greenwich (UTC). Touche-la pour l’approcher et lis-la, date et AM/PM compris : ici <b>${hm(v.u)}</b>. Note-la dans le carnet (« Heure Greenwich »).`},
 {t:'Le cadran : l’heure solaire',d:()=>{setNight(0);setTool('dial')},
  f:v=>`Le cadran est posé au sol, bien orienté. Lis l’heure sur la graduation où pointe l’ombre du bâton (chaque trait court = 15 min). Ici : <b>${hm(v.s)}</b>. C’est l’heure solaire locale.`},
 {t:'Calculer la longitude à l’aide du carnet',d:()=>{setTool(null);bk(1);calcPage(true)},
  f:v=>{const c=v.ec-eot/60;return`Ouvre le marque-page <b>« Calcul »</b> du carnet.<br><b>Écart</b> = ${hm(v.s)} − ${hm(v.u)} = <b>${sgnH(v.ec)}</b>. Écart corrigé = écart − éq. du temps (${eot>0?'+':''}${eot.toFixed(0)} min) = <b>${sgnH(c)}</b>.<br>Étape 1 : en heure décimale, <b>${(c<0?'−':'')+Math.abs(c).toFixed(2).replace('.',',')} h</b>. Étape 2 : × 15 = <b>${Math.abs(v.lon).toFixed(1).replace('.',',')}°</b>, à reporter dans « Longitude ».`}},
 {t:'Choisir E ou O',d:()=>{setTool(null);bk(1);calcPage(false)},
  f:v=>`Si l’heure solaire est <b>en avance</b> sur Greenwich (écart positif), le soleil est déjà passé plus tôt chez toi : tu es à l’<b>Est (E)</b>. Si elle est en retard (écart négatif) : <b>Ouest (O)</b>. Ici l’écart vaut ${sgnH(v.ec)} donc <b>${v.lon<0?'O':'E'}</b>.`},
 {t:'La latitude avec le sextant',d:()=>{bk(0);setNight(1);setTool('sext');yaw=lat>0?0:180;tp=Math.abs(lat)},
  f:v=>`De nuit, la hauteur du <b>pôle céleste</b> au-dessus de l’horizon égale ta latitude. Au nord, c’est l’<b>étoile Polaire</b> : prolonge 5 fois le bord de la « casserole ». Au sud, prolonge le grand axe de la <b>petite croix</b> : une étoile brille au pôle. Ces deux étoiles repères brillent plus fort que les autres. Centre-la dans le réticule en glissant (zoome pour être précis), puis lis l’angle sur le limbe, un petit trait valant 0,1° : ici <b>${v.pole.toFixed(1).replace('.',',')}°</b>.`},
 {t:'Choisir N ou S',d:()=>{setTool('comp');setNight(1)},
  f:v=>`Regarde la boussole : si l’étoile visée est du côté du <b>N</b>, tu es dans l’hémisphère <b>Nord</b>. Si elle est du côté du <b>S</b>, tu es dans l’hémisphère <b>Sud</b>. Ici : <b>${lat<0?'S':'N'}</b>.`},
 {t:'Vérifier',d:()=>{setTool(null);bk(1);calcPage(false)},
  f:()=>'Écris longitude et latitude dans le carnet (avec E/O et N/S) puis appuie sur <b>Vérifier</b> : le globe montre la vraie position, la tienne et l’écart en km.'}
];
function tshow(){
  const p=$('tuto');p.hidden=!tmode;if(!tmode)return;const S=STEPS[ts];
  p.innerHTML=`<div class="tu-head"><span class="tu-step">Étape ${ts+1} / ${STEPS.length}</span><button type="button" class="tu-min" aria-label="Réduire ou agrandir le tutoriel"></button></div><h2>${S.t}</h2><p>${S.f(vals())}</p><div class="tu-act"><button id="tp" class="btn-secondary" ${ts?'':'disabled'}>Précédent</button><button id="tn" class="btn-primary">${ts<STEPS.length-1?'Suivant':'À toi !'}</button></div>`;
  p.querySelector('.tu-min').onclick=p.querySelector('h2').onclick=()=>p.classList.toggle('min');
  $('tp').onclick=()=>go(ts-1);
  $('tn').onclick=()=>ts<STEPS.length-1?go(ts+1):($('tuto').hidden=true);
}
function go(i){ts=i;STEPS[ts].d();tshow()}
$('bt').onclick=()=>{tmode=1;launch();go(0)};
