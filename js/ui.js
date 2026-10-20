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
function calcPage(on){if(on==!$('sp2').hidden)return;const b=document.querySelector('.bk');
  for(let i=0;i<3;i++){const l=document.createElement('div');l.className='leaf '+(on?'fwd':'bwd');l.style.animationDelay=i*.11+'s';b.appendChild(l);setTimeout(()=>l.remove(),820+i*110)}
  setTimeout(()=>{$('sp1').hidden=on;$('sp2').hidden=!on;$('tabc').hidden=on;$('tabb').hidden=!on},360)}
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

/* démarrage */
function launch(){gen();$('start').hidden=true;$('ui').hidden=false;if(!run){run=1;frame()}}
$('be').onclick=()=>{tmode=0;$('tuto').hidden=true;launch()};
['lo','la'].forEach(i=>$(i).oninput=()=>$('vf').disabled=!($('lo').value.trim()&&$('la').value.trim()));

/* vérification et globe */
let T,E,gc=[0,0],gz=1;
const fmt=(a,b)=>`${Math.abs(a).toFixed(1)}° ${a<0?'S':'N'}, ${Math.abs(b).toFixed(1)}° ${b<0?'O':'E'}`,vec=(a,b)=>[Math.cos(a*R)*Math.cos(b*R),Math.cos(a*R)*Math.sin(b*R),Math.sin(a*R)];
$('vf').onclick=()=>{
  const n=i=>parseFloat($(i).value.replace(',','.')),ga=n('la')*($('ls').value=='S'?-1:1),go=n('lo')*($('lw').value=='O'?-1:1);if(isNaN(ga)||isNaN(go))return;
  T=[lat,lon];E=[ga,go];const A=vec(...T),B=vec(...E),d=Math.acos(Math.max(-1,Math.min(1,A[0]*B[0]+A[1]*B[1]+A[2]*B[2])))*6371,m=A.map((v,i)=>v+B[i]),l=Math.hypot(...m);
  gc=l>1e-6?[Math.asin(m[2]/l)/R,Math.atan2(m[1],m[0])/R]:T;
  $('rt').innerHTML=`<p><i class="dot g"></i>Position réelle : <b>${fmt(...T)}</b></p><p><i class="dot r"></i>Ton estimation : <b>${fmt(...E)}</b></p><p class="gap">Écart : ${Math.round(d).toLocaleString('fr-FR')} km</p>`;
  bk(0);gz=1;$('res').hidden=false;gdraw()};
function gdraw(){
  if($('res').hidden)return;const c=$('gl'),x=c.getContext('2d'),S=Math.max(200,Math.min(innerWidth-64,innerHeight-300,420)),dp=Math.min(2,devicePixelRatio),r0=S/2-6,r=r0*gz;
  c.width=c.height=S*dp;c.style.width=c.style.height=S+'px';x.scale(dp,dp);x.save();x.beginPath();x.arc(S/2,S/2,r0,0,7);x.clip();
  const o=(la,lo)=>{la*=R;lo*=R;const c0=gc[0]*R,l0=gc[1]*R;return[S/2+r*Math.cos(la)*Math.sin(lo-l0),S/2-r*(Math.cos(c0)*Math.sin(la)-Math.sin(c0)*Math.cos(la)*Math.cos(lo-l0)),Math.sin(c0)*Math.sin(la)+Math.cos(c0)*Math.cos(la)*Math.cos(lo-l0)]};
  const gg=x.createRadialGradient(S*.38,S*.32,r*.1,S/2,S/2,r);gg.addColorStop(0,'#5fb0e0');gg.addColorStop(1,'#1d4f8f');x.fillStyle=gg;x.beginPath();x.arc(S/2,S/2,r,0,7);x.fill();
  /* continents : les points cachés sont ramenés sur le bord du disque */
  x.beginPath();LAND.forEach(rg=>{let vis=0;const pts=[];for(let i=0;i<rg.length;i+=2){let p=o(rg[i+1],rg[i]);if(p[2]>0)vis=1;else{const dx=p[0]-S/2,dy=p[1]-S/2,d=Math.hypot(dx,dy)||1;p=[S/2+dx/d*r,S/2+dy/d*r]}pts.push(p)}
    if(vis){pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath()}});
  const lg=x.createRadialGradient(S*.38,S*.32,r*.1,S/2,S/2,r);lg.addColorStop(0,'#b5d48a');lg.addColorStop(1,'#5f8a3c');
  x.fillStyle=lg;x.fill('evenodd');x.strokeStyle='rgba(40,70,25,.7)';x.lineWidth=1;x.stroke();
  const sh=x.createRadialGradient(S*.38,S*.32,r*.2,S/2,S/2,r);sh.addColorStop(0,'rgba(255,255,255,.12)');sh.addColorStop(.7,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,10,40,.35)');x.fillStyle=sh;x.beginPath();x.arc(S/2,S/2,r,0,7);x.fill();
  const pl=pts=>{x.beginPath();let pen=0;pts.forEach(q=>{const p=o(q[0],q[1]);if(p[2]>0){pen?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]);pen=1}else pen=0});x.stroke()};
  x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1;
  const st=gz>8?2:gz>3?10:30;for(let lo=-180;lo<180;lo+=st)pl(Array.from({length:181},(_,i)=>[-90+i,lo]));for(let la=-90+st;la<90;la+=st)pl(Array.from({length:361},(_,i)=>[la,-180+i]));
  if(T){const A=vec(...T),B=vec(...E);x.strokeStyle='#fff';x.setLineDash([6,5]);x.lineWidth=2;
    pl(Array.from({length:65},(_,i)=>{const t=i/64,v=A.map((a,j)=>a*(1-t)+B[j]*t),l=Math.hypot(...v)||1;return[Math.asin(v[2]/l)/R,Math.atan2(v[1],v[0])/R]}));x.setLineDash([]);
    [[T,'#2F9E5E'],[E,'#D9463B']].forEach(([q,col])=>{const p=o(q[0],q[1]);if(p[2]>0){x.fillStyle=col;x.strokeStyle='#fff';x.lineWidth=3;x.beginPath();x.arc(p[0],p[1],8,0,7);x.fill();x.stroke()}})}
  x.restore();x.strokeStyle='rgba(20,50,90,.5)';x.lineWidth=2;x.beginPath();x.arc(S/2,S/2,r0,0,7);x.stroke();$('gzv').textContent='× '+String(gz<10?gz.toFixed(1):Math.round(gz)).replace('.',',')
}
addEventListener('resize',gdraw);
/* globe : glisser pour tourner, molette / pincement / boutons pour zoomer */
const GP=new Map(),gzoom=m=>{gz=Math.max(1,Math.min(60,gz*m));gdraw()};let gpd=0;
$('gl').onpointerdown=e=>{GP.set(e.pointerId,[e.clientX,e.clientY]);e.target.setPointerCapture(e.pointerId);if(GP.size==2){const a=[...GP.values()];gpd=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])}};
$('gl').onpointermove=e=>{const o=GP.get(e.pointerId);if(!o)return;GP.set(e.pointerId,[e.clientX,e.clientY]);
  if(GP.size==2){const a=[...GP.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);if(gpd)gzoom(d/gpd);gpd=d;return}
  gc[1]-=(e.clientX-o[0])*.4/gz;gc[0]=Math.max(-89,Math.min(89,gc[0]+(e.clientY-o[1])*.4/gz));gdraw()};
$('gl').onpointerup=$('gl').onpointercancel=e=>{GP.delete(e.pointerId);gpd=0};
$('gl').addEventListener('wheel',e=>{e.preventDefault();gzoom(Math.exp(-Math.max(-.4,Math.min(.4,e.deltaY*.0015))))},{passive:false});
$('gzi').onclick=()=>gzoom(1.6);$('gzo').onclick=()=>gzoom(1/1.6);
$('back').onclick=()=>$('res').hidden=true;
$('again').onclick=()=>{$('res').hidden=true;setTool(null);gen();if(tmode)go(0)};
