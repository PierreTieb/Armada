/* Tutoriel pas à pas : chaque étape montre l'objet et détaille le calcul avec les vraies valeurs de la scène */
let tmode=0,ts=0;
const hm=h=>{h=((h%24)+24)%24;const m=Math.round(h*60);return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
const sgnH=h=>(h<0?'−':'+')+hm(Math.abs(h)).replace(/^0/,'');
function vals(){
  const j=sc.day,d=new Date((j-2440587.5)*864e5),u=d.getUTCHours()+d.getUTCMinutes()/60,s=Math.round(solT(j,lon)*60)/60,ec=((s-u+36)%24)-12;
  return{u,s,ec,lon:15*(ec-eot/60),pole:Math.abs(lat)};
}
const STEPS=[
 {t:'Regarder autour de vous',d:()=>{setTool(null);setNight(0);bk(0)},
  f:()=>'Faites glisser l’écran (doigt ou souris) pour tourner sur 360° et lever les yeux. L’interrupteur en haut passe du jour à la nuit. Votre mission : trouver <b>longitude</b> (Est–Ouest) et <b>latitude</b> (Nord–Sud).'},
 {t:'La boussole : où est le nord ?',d:()=>{setNight(0);setTool('comp')},
  f:()=>'Ouvrez le sac 🎒 pour prendre un objet. La boussole indique le <b>Nord</b> (N rouge) : tournez-vous jusqu’à ce que N soit en haut. Retenez aussi où est le Sud : il servira à choisir N ou S plus tard.'},
 {t:'La montre : l’heure de Greenwich',d:()=>{setTool('watch')},
  f:v=>`La montre est restée à l’heure de Greenwich (UTC). Lisez-la, date et AM/PM compris : ici <b>${hm(v.u)}</b>. Notez-la dans le carnet (« Heure Greenwich »).`},
 {t:'Le cadran : l’heure solaire',d:()=>{setTool('dial')},
  f:v=>`Le cadran est posé au sol, <b>XII</b> vers le pôle le plus proche. Lisez l’heure à l’endroit où le bord de l’ombre croise les graduations (chaque trait court = 15 min). Ici : <b>${hm(v.s)}</b>. C’est l’heure solaire locale.`},
 {t:'Calculer la longitude',d:()=>{setTool(null);bk(1)},
  f:v=>`<b>Écart</b> = heure solaire − heure Greenwich = ${hm(v.s)} − ${hm(v.u)} = <b>${sgnH(v.ec)}</b>.<br>Le soleil fait 15° par heure, donc <b>longitude = 15° × (écart − équation du temps)</b>.<br>Ici : 15 × (${v.ec.toFixed(2)} − (${(eot/60).toFixed(2)})) = <b>${Math.abs(v.lon).toFixed(1)}°</b>.`},
 {t:'Choisir E ou O',d:()=>{setTool(null);bk(1)},
  f:v=>`Si l’heure solaire est <b>en avance</b> sur Greenwich (écart positif), le soleil est déjà passé plus tôt chez vous : vous êtes à l’<b>Est (E)</b>. Si elle est en retard (écart négatif) : <b>Ouest (O)</b>. Ici l’écart vaut ${sgnH(v.ec)} donc <b>${v.lon<0?'O':'E'}</b>.`},
 {t:'La latitude avec le sextant',d:()=>{bk(0);setNight(1);setTool('sext');yaw=lat>0?0:180;tp=Math.abs(lat)},
  f:v=>`De nuit, l’angle entre l’horizon et le <b>pôle céleste</b> égale votre latitude. Au nord, visez <b>Polaris</b> (au bout de la Grande Ourse). Au sud, prolongez la Croix du Sud vers <b>σ Octantis</b>. Centrez l’astre dans le réticule : le sextant lit ici <b>${v.pole.toFixed(0)}°</b>, donc latitude ≈ <b>${v.pole.toFixed(0)}°</b>.`},
 {t:'Choisir N ou S',d:()=>{setTool('comp');setNight(1)},
  f:v=>`Regardez la boussole : si le pôle que vous avez visé est du côté du <b>N</b> (Polaris), vous êtes dans l’hémisphère <b>Nord</b>. S’il est du côté du <b>S</b> (Croix du Sud, σ Octantis), vous êtes dans l’hémisphère <b>Sud</b>. Ici : <b>${lat<0?'S':'N'}</b>.`},
 {t:'Vérifier',d:()=>{setTool(null);bk(1)},
  f:()=>'Entrez longitude et latitude dans le carnet (avec E/O et N/S) puis appuyez sur <b>Vérifier</b> : le globe montre la vraie position, la vôtre et l’écart en km.'}
];
function tshow(){
  const p=$('tuto');p.hidden=!tmode;if(!tmode)return;const S=STEPS[ts];
  p.innerHTML=`<b>${ts+1}/${STEPS.length} · ${S.t}</b><p>${S.f(vals())}</p><button id="tp" ${ts?'':'disabled'}>◀ Retour</button> <button id="tn">${ts<STEPS.length-1?'Suivant ▶':'À vous !'}</button>`;
  $('tp').onclick=()=>go(ts-1);
  $('tn').onclick=()=>ts<STEPS.length-1?go(ts+1):($('tuto').hidden=true);
}
function go(i){ts=i;STEPS[ts].d();tshow()}
$('bt').onclick=()=>{tmode=1;launch();go(0)};
