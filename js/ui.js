/* Interface : objets, sac, carnet, globe de résultat */
const ART={comp:[1010,30,335,335],watch:[410,375,475,350],sext:[40,20,435,375],dial:[930,385,430,350]};
const NAMES={comp:'Boussole',watch:'Montre',sext:'Sextant',dial:'Cadran solaire'};
function art(k,size,center){const[x,y,w,h]=ART[k],s=size/Math.max(w,h),cw=w*s,ch=h*s;
  return `width:${cw}px;height:${ch}px;background:url(img/objects.jpg) no-repeat -${x*s}px -${y*s}px/${1408*s}px ${768*s}px;`+(center?`margin:-${ch/2}px 0 0 -${cw/2}px;`:'')}

function setTool(k){
  tool=k;O3.hold(k=='comp'||k=='watch'||k=='sext'?k:null);O3.dial(k=='dial');
  fovT=k=='sext'?22:k=='dial'?60:75;
  if(k=='dial'){dc=[2.9*Math.sin(yaw*R),2.9*Math.cos(yaw*R)];tp=-32}
  if(k=='sext'&&pit<8)tp=25;
  $('tool').innerHTML=k=='dial'?'<small class="hint">Molette ou pincement pour zoomer. XII est tourné vers le pôle le plus proche.</small>':k=='sext'?'<small class="hint">Glissez pour viser. Molette de souris : réglage fin de l’angle.</small>':'';
  $('inv').hidden=true;
}
function setNight(n){night=n;$('tg').checked=!!n;if(tool=='watch')setTool('watch')}
function bk(open){$('book').hidden=!open;$('shade').hidden=!open;if(open)$('inv').hidden=true}

/* sac */
$('inv').innerHTML=Object.keys(NAMES).map(k=>`<button data-k="${k}"><span class="ic" style="${art(k,60)}"></span>${NAMES[k]}</button>`).join('')+'<button data-k="book"><span class="ic e">📓</span>Carnet</button>';
$('inv').onclick=e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.k;if(k=='book')bk(1);else setTool(tool==k?null:k)};
$('bag').onclick=()=>{if(!$('book').hidden){bk(0);$('inv').hidden=false}else $('inv').hidden=!$('inv').hidden};
$('shade').onclick=()=>bk(0);
$('tg').onchange=e=>setNight(e.target.checked?1:0);

/* regard à 360° */
const P=new Map(),pdist=()=>{const a=[...P.values()];return Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])},zoom=m=>{fovT=Math.max(20,Math.min(95,fovT*m))};
let pd=0;
cv.onpointerdown=e=>{P.set(e.pointerId,[e.clientX,e.clientY]);cv.setPointerCapture(e.pointerId);$('inv').hidden=true;if(P.size==2)pd=pdist()};
cv.onpointermove=e=>{const o=P.get(e.pointerId);if(!o)return;
  if(P.size==2){P.set(e.pointerId,[e.clientX,e.clientY]);const d=pdist();if(tool!='sext')zoom(pd/d);pd=d;return}
  const f=fov/75*.2;yaw=((yaw-(e.clientX-o[0])*f)%360+360)%360;pit=Math.max(tool=='sext'?0:-85,Math.min(90,pit+(e.clientY-o[1])*f));P.set(e.pointerId,[e.clientX,e.clientY]);tp=null};
cv.onpointerup=cv.onpointercancel=e=>P.delete(e.pointerId);
cv.addEventListener('wheel',e=>{e.preventDefault();if(tool=='sext'){pit=Math.max(0,Math.min(90,pit-Math.sign(e.deltaY)*.1));tp=null}else zoom(1+e.deltaY*.001)},{passive:false});

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
  $('rt').innerHTML=`🟢 Position réelle : ${fmt(...T)}<br>🔴 Votre estimation : ${fmt(...E)}<br><b>Écart : ${Math.round(d).toLocaleString('fr-FR')} km</b>`;
  bk(0);$('res').hidden=false;gdraw()};
function gdraw(){
  if($('res').hidden)return;const c=$('gl'),x=c.getContext('2d'),S=c.width=c.height=Math.max(200,Math.min(innerWidth-24,innerHeight-230,460)),r=S/2-6;
  const o=(la,lo)=>{la*=R;lo*=R;const c0=gc[0]*R,l0=gc[1]*R;return[S/2+r*Math.cos(la)*Math.sin(lo-l0),S/2-r*(Math.cos(c0)*Math.sin(la)-Math.sin(c0)*Math.cos(la)*Math.cos(lo-l0)),Math.sin(c0)*Math.sin(la)+Math.cos(c0)*Math.cos(la)*Math.cos(lo-l0)]};
  const gg=x.createRadialGradient(S*.4,S*.35,r*.1,S/2,S/2,r);gg.addColorStop(0,'#3a78c9');gg.addColorStop(1,'#0f2a5c');x.fillStyle=gg;x.beginPath();x.arc(S/2,S/2,r,0,7);x.fill();
  const pl=pts=>{x.beginPath();let pen=0;pts.forEach(q=>{const p=o(q[0],q[1]);if(p[2]>0){pen?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]);pen=1}else pen=0});x.stroke()};
  x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=1;
  for(let lo=-180;lo<180;lo+=30)pl(Array.from({length:37},(_,i)=>[-90+i*5,lo]));
  for(let la=-60;la<=60;la+=30)pl(Array.from({length:73},(_,i)=>[la,-180+i*5]));
  if(T){const A=vec(...T),B=vec(...E);x.strokeStyle='#fff';x.setLineDash([6,5]);x.lineWidth=2;
    pl(Array.from({length:65},(_,i)=>{const t=i/64,v=A.map((a,j)=>a*(1-t)+B[j]*t),l=Math.hypot(...v)||1;return[Math.asin(v[2]/l)/R,Math.atan2(v[1],v[0])/R]}));x.setLineDash([]);
    [[T,'#3ddc84'],[E,'#ff4d4d']].forEach(([q,col])=>{const p=o(q[0],q[1]);if(p[2]>0){x.fillStyle=col;x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.arc(p[0],p[1],8,0,7);x.fill();x.stroke()}})}
}
addEventListener('resize',gdraw);
let gd=null;
$('gl').onpointerdown=e=>{gd=[e.clientX,e.clientY];e.target.setPointerCapture(e.pointerId)};
$('gl').onpointermove=e=>{if(!gd)return;gc[1]-=(e.clientX-gd[0])*.4;gc[0]=Math.max(-89,Math.min(89,gc[0]+(e.clientY-gd[1])*.4));gd=[e.clientX,e.clientY];gdraw()};
$('gl').onpointerup=()=>gd=null;
$('back').onclick=()=>$('res').hidden=true;
$('again').onclick=()=>{$('res').hidden=true;setTool(null);gen();if(tmode)go(0)};
