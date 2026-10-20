/* Interface : objets, sac, carnet, globe de résultat */
const ART={comp:[1010,30,335,335],watch:[410,375,475,350],sext:[40,20,435,375],dial:[930,385,430,350]};
const NAMES={comp:'Boussole',watch:'Montre',sext:'Sextant',dial:'Cadran solaire'};
function art(k,size,center){const[x,y,w,h]=ART[k],s=size/Math.max(w,h),cw=w*s,ch=h*s;
  return `width:${cw}px;height:${ch}px;background:url(img/objects.jpg) no-repeat -${x*s}px -${y*s}px/${1408*s}px ${768*s}px;`+(center?`margin:-${ch/2}px 0 0 -${cw/2}px;`:'')}

function mkC(){let s='<svg viewBox="-112 -112 224 224"><circle r="97" fill="#c9971c"/><circle r="86" fill="#f1e6c8"/><g id="cr">';
  for(let a=0;a<360;a+=10)s+=`<line y1="-86" y2="${a%90?-78:-72}" stroke="#2a2118" stroke-width="${a%30?1:2}" transform="rotate(${a})"/>`;
  [['N',0],['E',90],['S',180],['O',270]].forEach(([t,a])=>s+=`<text y="-56" text-anchor="middle" font-size="18" font-family="serif" font-weight="700" fill="${t=='N'?'#b3261e':'#2a2118'}" transform="rotate(${a})">${t}</text>`);
  return s+'<path d="M0-48L7 0L-7 0Z" fill="#c0392b"/><path d="M0 48L7 0L-7 0Z" fill="#3b6ea8"/></g><circle r="5" fill="#c9971c"/><path d="M0-99l-7-12h14z" fill="#c0392b"/></svg>'}
function mkW(){const d=new Date((sc[night?'night':'day']-2440587.5)*864e5),m=d.getUTCMinutes(),h=d.getUTCHours()%12+m/60;
  let s='<div class="lid"></div><svg viewBox="-112 -112 224 224"><circle r="97" fill="#c9971c"/><circle r="86" fill="#f6efdb"/>';
  for(let i=1;i<=12;i++)s+=`<text x="${Math.sin(i*Math.PI/6)*66}" y="${-Math.cos(i*Math.PI/6)*66+5}" text-anchor="middle" font-size="14" font-family="serif" fill="#2a2118">${RO[i]}</text>`;
  for(let i=0;i<60;i++)s+=`<line y1="-84" y2="${i%5?-80:-76}" stroke="#2a2118" transform="rotate(${i*6})"/>`;
  return s+`<rect x="-26" y="24" width="52" height="16" rx="3" fill="#fff" stroke="#2a2118"/><text y="36" text-anchor="middle" font-size="11" fill="#2a2118">${d.getUTCDate()}/${d.getUTCMonth()+1} ${d.getUTCHours()<12?'AM':'PM'}</text><line y2="-42" stroke="#2a2118" stroke-width="5" stroke-linecap="round" transform="rotate(${h*30})"/><line y2="-68" stroke="#2a2118" stroke-width="3" stroke-linecap="round" transform="rotate(${m*6})"/><circle r="5" fill="#c9971c"/></svg>`}
const mkS=()=>'<div class="sx"><div id="ro">0.0°</div><input type="range" id="sx" min="0" max="90" step="0.1" value="0"><small>Faites glisser le curseur ou l’écran : centrez l’astre dans le réticule et lisez l’angle.</small></div>';

function setTool(k){
  tool=k;const t=$('tool');
  t.innerHTML=k?`<div class="art" style="${art(k,k=='sext'?230:200,1)}"></div><div class="real">${k=='comp'?mkC():k=='watch'?mkW():k=='sext'?mkS():'<small class="hint">Cadran posé au sol, orienté vers le pôle le plus proche.</small>'}</div>`:'';
  fovT=k=='sext'?45:k=='dial'?85:75;
  if(k=='dial'){dc=[2.9*Math.sin(yaw*R),2.9*Math.cos(yaw*R)];tp=-32}
  if(k=='sext'&&pit<8)tp=25;
  $('inv').hidden=true;
  const sx=$('sx');if(sx)sx.oninput=()=>{pit=+sx.value;tp=null};
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
let dr=null;
cv.onpointerdown=e=>{dr=[e.clientX,e.clientY];cv.setPointerCapture(e.pointerId);$('inv').hidden=true};
cv.onpointermove=e=>{if(!dr)return;const f=fov/75*.2;yaw=((yaw-(e.clientX-dr[0])*f)%360+360)%360;pit=Math.max(tool=='sext'?0:-85,Math.min(90,pit+(e.clientY-dr[1])*f));dr=[e.clientX,e.clientY];tp=null};
cv.onpointerup=()=>dr=null;

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
