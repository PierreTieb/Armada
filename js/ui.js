/* Interface : sac, objets, carnet, regard à 360°, globe de résultat */
const HINTS={comp:'Touche la boussole pour l’approcher.',watch:'Touche la montre pour l’approcher.',
dial:'L’ombre du bâton indique l’heure solaire. Molette ou pincement pour zoomer.'};
function setTool(k){
  tool=k;O3.hold(k=='comp'||k=='watch'?k:null);O3.dial(k=='dial');
  fovT=k=='sext'?22:k=='dial'?55:70;
  if(k=='dial'){dc=[1.4*Math.sin(yaw*R),1.4*Math.cos(yaw*R)];tp=-46}
  if(k=='sext'&&pit<8)tp=25;
  $('hint').textContent=HINTS[k]||'';$('hint').hidden=!HINTS[k]||tmode;$('put').hidden=!k;
  O3.bagClose();
}
function setNight(n){night=n;$('tg').checked=!!n;if(tool=='watch')setTool('watch')}
function bk(open){$('book').hidden=!open;$('shade').hidden=!open;if(open)O3.bagClose()}
function choose(k){if(k=='book'){bk(1);return}setTool(tool==k?null:k)}
$('bag').onclick=()=>{if(!$('book').hidden)bk(0);if(O3.bag&&O3.bDir>0)O3.bagClose();else if(!O3.stowT)O3.stow(O3.bagOpen)};
$('shade').onclick=$('bkx').onclick=()=>bk(0);

/* double page « Calcul » : les pages tournent pour l'atteindre */
function calcPage(on){if(on==!$('sp2').classList.contains('off'))return;const b=document.querySelector('.bk');
  for(let i=0;i<3;i++){const l=document.createElement('div');l.className='leaf '+(on?'fwd':'bwd');l.style.animationDelay=i*.11+'s';b.appendChild(l);setTimeout(()=>l.remove(),820+i*110)}
  setTimeout(()=>{[['sp1',on],['sp2',!on]].forEach(([i,off])=>{$(i).classList.toggle('off',off);$(i).setAttribute('aria-hidden',off)});$('tabc').hidden=on;$('tabb').hidden=!on},360)}
$('tabc').onclick=()=>calcPage(true);$('tabb').onclick=()=>calcPage(false);
const num=v=>parseFloat(String(v).replace(',','.').replace('−','-')),fr=x=>(Math.round(x*100)/100).toFixed(2).replace('.',',');
function calc(){const sg=$('cs').value=='+'?1:-1,h=num($('ch').value),m=num($('cm').value),d=num($('cd').value);
  $('cm2').textContent=isNaN(m)?'…':String(m).replace('.',',');$('cr1').textContent=isNaN(m)?'…':fr(m/60);
  $('cr2').textContent=isNaN(h)&&isNaN(m)?'…':(sg<0?'−':'')+fr((h||0)+(m||0)/60);$('cr3').textContent=isNaN(d)?'…':fr(d*15).replace('-','−')}
['cs','ch','cm','cd'].forEach(i=>$(i).oninput=calc);
$('put').onclick=()=>setTool(null);
$('tg').onchange=e=>setNight(e.target.checked?1:0);

/* regard à 360° : glisser, pincer, molette ; toucher l'objet tenu pour l'approcher */
const P=new Map(),pdist=()=>{const a=[...P.values()];return Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])},zoom=m=>{fovT=tool=='sext'?Math.max(4,Math.min(35,fovT*m)):Math.max(15,Math.min(90,fovT*m))};
let pd=0,dn=null;
cv.onpointerdown=e=>{
  if(O3.bag&&O3.bDir>0){const k=O3.pick(e.clientX,e.clientY);if(k)choose(k);else O3.bagClose();return}
  P.set(e.pointerId,[e.clientX,e.clientY]);cv.setPointerCapture(e.pointerId);if(P.size==2)pd=pdist();dn={x:e.clientX,y:e.clientY,m:0}};
cv.onpointermove=e=>{const o=P.get(e.pointerId);if(!o)return;
  if(dn&&Math.hypot(e.clientX-dn.x,e.clientY-dn.y)>6)dn.m=1;
  if(P.size==2){P.set(e.pointerId,[e.clientX,e.clientY]);const d=pdist();zoom(pd/d);pd=d;return}
  const f=wC.fov/70*.2;yaw=((yaw-(e.clientX-o[0])*f)%360+360)%360;pit=Math.max(tool=='sext'?0:-85,Math.min(90,pit+(e.clientY-o[1])*f));P.set(e.pointerId,[e.clientX,e.clientY]);tp=null};
cv.onpointerup=cv.onpointercancel=e=>{P.delete(e.pointerId);if(dn&&!dn.m&&e.type=='pointerup'&&O3.hitHeld(e.clientX,e.clientY))O3.zoom^=1;dn=null};
cv.addEventListener('wheel',e=>{e.preventDefault();zoom(1+Math.max(-.3,Math.min(.3,e.deltaY*.001)))},{passive:false});

/* quitter vers le menu principal */
$('quit').onclick=()=>{$('qm').hidden=false;$('qno').focus()};
$('qno').onclick=()=>$('qm').hidden=true;
$('qyes').onclick=()=>{$('qm').hidden=true;setTool(null);bk(0);O3.reset();tmode=0;$('tuto').hidden=true;$('res').hidden=true;$('ui').hidden=true;$('start').hidden=false;run=0};

/* conseil au lancement : jouer en mode paysage (smartphone tenu en portrait uniquement) */
const portrait=()=>innerHeight>innerWidth,phone=matchMedia('(pointer: coarse)').matches&&Math.min(screen.width,screen.height)<600;
if(phone&&portrait())$('land').hidden=false;
$('landok').onclick=$('land').onclick=e=>{if(e.target==$('land')||e.target==$('landok'))$('land').hidden=true};
addEventListener('resize',()=>{if(!portrait())$('land').hidden=true});

/* démarrage */
function launch(){gen();$('start').hidden=true;$('ui').hidden=false;if(!run){run=1;frame()}}
$('be').onclick=()=>{tmode=0;$('tuto').hidden=true;launch()};
['lo','la'].forEach(i=>$(i).oninput=()=>$('vf').disabled=!($('lo').value.trim()&&$('la').value.trim()));

/* vérification et globe */
let T,E,gc=[0,0];
const fmt=(a,b)=>`${Math.abs(a).toFixed(1)}° ${a<0?'S':'N'}, ${Math.abs(b).toFixed(1)}° ${b<0?'O':'E'}`,vec=(a,b)=>[Math.cos(a*R)*Math.cos(b*R),Math.cos(a*R)*Math.sin(b*R),Math.sin(a*R)];
$('vf').onclick=()=>{
  const n=i=>parseFloat($(i).value.replace(',','.')),ga=n('la')*($('ls').value=='S'?-1:1),go=n('lo')*($('lw').value=='O'?-1:1);if(isNaN(ga)||isNaN(go))return;
  T=[lat,lon];E=[ga,go];const A=vec(...T),B=vec(...E),d=Math.acos(Math.max(-1,Math.min(1,A[0]*B[0]+A[1]*B[1]+A[2]*B[2])))*6371,m=A.map((v,i)=>v+B[i]),l=Math.hypot(...m);
  gc=l>1e-6?[Math.asin(m[2]/l)/R,Math.atan2(m[1],m[0])/R]:T;
  $('rt').innerHTML=`<p><i class="dot g"></i>Position réelle : <b>${fmt(...T)}</b></p><p><i class="dot r"></i>Ton estimation : <b>${fmt(...E)}</b></p><p class="gap">Écart : ${Math.round(d).toLocaleString('fr-FR')} km</p>`;
  bk(0);$('res').hidden=false;Globe.show(T,E,gc)};

$('back').onclick=()=>$('res').hidden=true;
$('again').onclick=()=>{$('res').hidden=true;setTool(null);gen();if(tmode)go(0)};
