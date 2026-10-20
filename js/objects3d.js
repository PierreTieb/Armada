/* Objets 3D (Three.js r128) : objets tenus devant le joueur + cadran posé au sol */
const rd=new THREE.WebGLRenderer({canvas:$('o3d'),alpha:true,antialias:true});rd.autoClear=false;
const wS=new THREE.Scene(),hS=new THREE.Scene(),wC=new THREE.PerspectiveCamera(75,1,.05,100),hC=new THREE.PerspectiveCamera(40,1,.1,50);hC.position.z=6;
const amb=new THREE.AmbientLight(0xffffff,.6),amb2=new THREE.AmbientLight(0xffffff,.6),sunL=new THREE.DirectionalLight(0xfff0d0,1),hL=new THREE.DirectionalLight(0xffffff,.9),pL=new THREE.PointLight(0xffe0a0,.7);
wS.add(amb,sunL);hS.add(amb2,hL,pL);hL.position.set(2,3,5);pL.position.set(-3,2,4);
function rz(){rd.setPixelRatio(Math.min(2,devicePixelRatio));rd.setSize(innerWidth,innerHeight);wC.aspect=hC.aspect=innerWidth/innerHeight;hC.updateProjectionMatrix()}rz();addEventListener('resize',rz);

const GOLD=new THREE.MeshPhongMaterial({color:0xd4a017,specular:0xfff0a8,shininess:90}),
 GOLD2=new THREE.MeshPhongMaterial({color:0x8a6a10,specular:0xfff0a8,shininess:60,side:THREE.DoubleSide}),
 STONE=new THREE.MeshPhongMaterial({color:0x3a3d46,shininess:15}),WOOD=new THREE.MeshPhongMaterial({color:0x6b4a2b,shininess:10}),
 RED=new THREE.MeshPhongMaterial({color:0xc0392b,shininess:60}),BLUE=new THREE.MeshPhongMaterial({color:0x3b6ea8,shininess:60});
const tex=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t};
const disc=(t,r)=>new THREE.Mesh(new THREE.CircleGeometry(r,64),new THREE.MeshPhongMaterial({map:t,shininess:40}));
const mesh=(g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);return o};
const CY=(r,h)=>new THREE.CylinderGeometry(r,r,h,48).rotateX(Math.PI/2),TR=(r,t)=>new THREE.TorusGeometry(r,t,12,64);
const cl=t=>Math.max(0,Math.min(1,t)),ease=t=>{t=cl(t);return 1+2.70158*Math.pow(t-1,3)+1.70158*Math.pow(t-1,2)};

/* ---------- boussole ---------- */
function mkCompass(){
  const G=new THREE.Group(),card=disc(tex(512,512,x=>{
    x.fillStyle='#f1e6c8';x.fillRect(0,0,512,512);x.translate(256,256);x.strokeStyle='#2a2118';x.textAlign='center';x.textBaseline='middle';
    for(let a=0;a<360;a+=5){x.lineWidth=a%30?1.5:4;x.beginPath();x.moveTo(0,-250);x.lineTo(0,a%10?-236:a%30?-224:-205);x.stroke();x.rotate(5*R)}
    [['N',0],['E',90],['S',180],['O',270]].forEach(([t,a])=>{x.save();x.rotate(a*R);x.translate(0,-165);x.fillStyle=t=='N'?'#b3261e':'#2a2118';x.font='bold 58px Georgia';x.fillText(t,0,0);x.restore()})}),1.1);
  card.position.z=.19;
  const nr=mesh(new THREE.ConeGeometry(.1,.85,16),RED,0,.42,.05),nb=mesh(new THREE.ConeGeometry(.1,.85,16).rotateZ(Math.PI),BLUE,0,-.42,.05);nr.scale.z=nb.scale.z=.35;
  card.add(nr,nb,mesh(new THREE.SphereGeometry(.09,16,16),GOLD,0,0,.08));
  G.add(mesh(CY(1.25,.35),GOLD),mesh(TR(1.2,.07),GOLD,0,0,.18),card,mesh(TR(.3,.07),GOLD,0,1.5,0),mesh(new THREE.CircleGeometry(1.15,48),new THREE.MeshPhongMaterial({color:0xffffff,transparent:true,opacity:.1,shininess:150}),0,0,.28),mesh(new THREE.ConeGeometry(.1,.22,3).rotateZ(Math.PI),RED,0,1.05,.25));
  G.position.set(0,-1.2,0);G.scale.setScalar(.85);G.rotation.x=.25;
  G.userData.upd=()=>{card.rotation.z=yaw*R};return G}

/* ---------- montre à gousset ---------- */
function mkWatch(){
  const d=new Date((sc[night?'night':'day']-2440587.5)*864e5),m=d.getUTCMinutes(),h=d.getUTCHours()%12+m/60,G=new THREE.Group();
  const face=disc(tex(512,512,x=>{
    x.fillStyle='#f6efdb';x.fillRect(0,0,512,512);x.translate(256,256);x.strokeStyle=x.fillStyle='#2a2118';x.textAlign='center';x.textBaseline='middle';x.font='bold 40px Georgia';
    for(let i=0;i<60;i++){x.lineWidth=i%5?2:5;x.beginPath();x.moveTo(0,-248);x.lineTo(0,i%5?-234:-222);x.stroke();x.rotate(6*R)}
    for(let i=1;i<=12;i++)x.fillText(RO[i],Math.sin(i*Math.PI/6)*185,-Math.cos(i*Math.PI/6)*185);
    x.lineWidth=2;x.strokeRect(-48,70,96,36);x.font='bold 24px Georgia';x.fillText(`${d.getUTCDate()}/${d.getUTCMonth()+1} ${d.getUTCHours()<12?'AM':'PM'}`,0,89);
    x.lineCap='round';x.save();x.rotate(h*30*R);x.lineWidth=16;x.beginPath();x.moveTo(0,10);x.lineTo(0,-120);x.stroke();x.restore();
    x.save();x.rotate(m*6*R);x.lineWidth=9;x.beginPath();x.moveTo(0,14);x.lineTo(0,-195);x.stroke();x.restore();x.beginPath();x.arc(0,0,14,0,7);x.fill()}),1.12);
  face.position.z=.17;
  const piv=new THREE.Group();piv.position.set(0,1.25,.2);
  const lid=mesh(CY(1.3,.14),GOLD,0,-1.25,.05);
  lid.add(mesh(TR(1.2,.04),GOLD,0,0,.08),mesh(new THREE.CircleGeometry(1.15,48),new THREE.MeshPhongMaterial({map:tex(512,512,x=>{x.fillStyle='#d4a017';x.fillRect(0,0,512,512);x.translate(256,256);x.strokeStyle='#7a5a00';x.lineWidth=5;
    for(let i=0;i<8;i++){x.beginPath();x.moveTo(0,0);x.lineTo(0,i%2?-110:-210);x.lineTo(i%2?20:30,-60);x.closePath();x.stroke();x.rotate(Math.PI/4)}x.beginPath();x.arc(0,0,225,0,7);x.stroke()}),shininess:80}),0,0,.077));
  piv.add(lid);
  G.add(mesh(CY(1.25,.3),GOLD),mesh(TR(1.2,.07),GOLD,0,0,.16),face,piv,mesh(TR(.3,.07),GOLD,0,1.65,0),mesh(CY(.12,.2),GOLD,0,1.45,0));
  for(let i=0;i<9;i++){const l=mesh(new THREE.TorusGeometry(.1,.028,8,16),GOLD,.35+i*.17,1.8+Math.sin(i*.55)*.25,0);l.rotation.y=i%2?Math.PI/2:0;G.add(l)}
  G.position.set(0,-1.1,0);G.scale.setScalar(.82);G.rotation.x=.22;
  G.userData.upd=()=>{piv.rotation.x=-2.7*ease((performance.now()-O3.t0-1000)/800)};return G}

/* ---------- sextant : on regarde dans la lunette, molette = fractions de degré ---------- */
function mkSext(){
  const G=new THREE.Group(),P=new THREE.Group(),s=Math.min(.75,1.3*innerWidth/innerHeight),sr=Math.min(innerWidth*.42,innerHeight*.27)/innerHeight*4.367;
  const sh=new THREE.Shape();sh.moveTo(0,0);sh.absarc(0,0,2.2,-135*R,-45*R,false);sh.lineTo(0,0);
  const ho=new THREE.Path();ho.absarc(0,0,1.55,-125*R,-55*R,false);ho.absarc(0,0,.6,-55*R,-125*R,true);ho.closePath();sh.holes.push(ho);
  P.add(mesh(new THREE.ExtrudeGeometry(sh,{depth:.12,bevelEnabled:false}),GOLD));
  const ring=new THREE.Mesh(new THREE.RingGeometry(1.72,2.12,64,1,-135*R,90*R),new THREE.MeshPhongMaterial({shininess:30,map:tex(1024,1024,x=>{
    x.fillStyle='#f3ead0';x.fillRect(0,0,1024,1024);x.strokeStyle=x.fillStyle='#2a2118';x.font='bold 34px Georgia';x.textAlign='center';x.textBaseline='middle';
    const Q=(r,a)=>[512+r/2.12*512*Math.cos(a*R),512-r/2.12*512*Math.sin(a*R)];
    for(let a=0;a<=90;a++){const th=-135+a,p=Q(2.12,th),q=Q(2.12-(a%10?.07:.16),th);x.lineWidth=a%10?1.5:4;x.beginPath();x.moveTo(...p);x.lineTo(...q);x.stroke();if(a%10==0)x.fillText(a,...Q(1.88,th))}})}));
  ring.position.z=.13;P.add(ring);
  const arm=new THREE.Group();arm.position.z=.22;
  arm.add(mesh(new THREE.BoxGeometry(.09,2.25,.05).translate(0,-1.1,0),GOLD),mesh(new THREE.BoxGeometry(.05,.2,.02),RED,0,-2.1,.04));
  const drum=mesh(new THREE.CylinderGeometry(.34,.34,.6,48).rotateZ(Math.PI/2),new THREE.MeshPhongMaterial({shininess:40,map:tex(1024,128,(x,w,h)=>{
    x.fillStyle='#f6efdb';x.fillRect(0,0,w,h);x.fillStyle='#2a2118';x.font='bold 74px Georgia';x.textAlign='center';x.textBaseline='middle';
    for(let i=0;i<=10;i++){x.fillText(i%10,i*w/10,h/2+4);x.fillRect(i*w/10-2,0,4,14);x.fillRect(i*w/10-2,h-14,4,14)}})}),0,-1.5,.12);
  arm.add(drum,mesh(new THREE.BoxGeometry(.7,.025,.02),RED,0,-1.5,.5));
  P.add(arm);P.position.y=-.55;P.scale.setScalar(s);
  G.add(P,mesh(TR(sr+.03,.05),GOLD,0,.611,.1),mesh(new THREE.CylinderGeometry(sr+.08,sr+.08,1,48,1,true).rotateX(Math.PI/2),GOLD2,0,.611,.6));
  G.userData.upd=()=>{arm.rotation.z=(pit-45)*R;drum.rotation.x=(pit%1)*2*Math.PI};return G}

/* ---------- cadran solaire posé au sol ---------- */
function dialTex(){return tex(1024,1024,x=>{
  x.fillStyle='#eadfc3';x.fillRect(0,0,1024,1024);x.translate(512,512);x.strokeStyle=x.fillStyle='#2a2118';x.textAlign='center';x.textBaseline='middle';x.font='bold 30px Georgia';
  const ph=lat*R,sg=Math.sign(lat),cp=Math.cos(ph),sp=Math.abs(Math.sin(ph)),p=[0,sg*cp,sp],u=512/1.3;
  x.lineWidth=3;x.beginPath();x.arc(0,0,1.02*u,0,7);x.stroke();
  for(let t=6;t<=18;t+=.25){
    const h=(t-12)*15*R,s=[-Math.sin(h),-Math.sin(ph)*Math.cos(h),cp*Math.cos(h)],n=[p[1]*s[2]-p[2]*s[1],p[2]*s[0]-p[0]*s[2]];
    let d=[n[1],-n[0]],l=Math.hypot(d[0],d[1]);d=[d[0]/l,d[1]/l];if(d[0]*-s[0]+d[1]*-s[1]<0)d=[-d[0],-d[1]];
    const hr=t%1==0,a=hr?.14:.9;x.lineWidth=hr?5:2;x.beginPath();x.moveTo(d[0]*a*u,-d[1]*a*u);x.lineTo(d[0]*1.02*u,-d[1]*1.02*u);x.stroke();
    if(hr)x.fillText(RO[(t-1)%12+1],d[0]*1.15*u,-d[1]*1.15*u)}})}
function buildDial(){
  const G=new THREE.Group(),sg=Math.sign(lat),ph=lat*R,cp=Math.cos(ph),sp=Math.abs(Math.sin(ph)),Lg=.65;
  G.add(mesh(new THREE.CylinderGeometry(1.5,1.55,.16,64),biome=='sea'?WOOD:STONE,0,.08,0));
  const f=disc(dialTex(),1.3);f.rotation.x=-Math.PI/2;f.position.y=.165;G.add(f);
  const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(Lg*cp,0);sh.lineTo(Lg*cp,Lg*sp);sh.lineTo(0,0);
  const gn=mesh(new THREE.ExtrudeGeometry(sh,{depth:.04,bevelEnabled:false}).translate(0,0,-.02),GOLD,0,.17,0);gn.rotation.y=sg*Math.PI/2;G.add(gn);
  const bm=n=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));g.setIndex(n==3?[0,1,2]:[0,1,2,0,2,3]);return g};
  O3.g1=bm(3);O3.g2=bm(4);
  [[O3.g1,.5],[O3.g2,.85]].forEach(([g,o])=>G.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x0a0a19,transparent:true,opacity:o,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2}))));
  return G}
function shadow(sd){
  const sg=Math.sign(lat),ph=lat*R,cp=Math.cos(ph),sp=Math.abs(Math.sin(ph)),Lg=.65,v=O3.g1.attributes.position.array,w=O3.g2.attributes.position.array,Y=.18;
  if(sd[2]<=.03){v.fill(0);w.fill(0)}else{
    const k=Lg*sp/sd[2];let S=[-sd[0]*k*1.5,(Lg*cp*sg-sd[1]*k)*1.5];const l=Math.hypot(...S);if(l>3.2)S=[S[0]*3.2/l,S[1]*3.2/l];
    const A=[0,Lg*cp*sg],L=Math.hypot(...S)||1,nx=-S[1]/L*.035,ny=S[0]/L*.035;
    v.set([0,Y,0,A[0],Y,-A[1],S[0],Y,-S[1]]);
    w.set([nx,Y+.002,-ny,S[0]+nx,Y+.002,-S[1]-ny,S[0]-nx,Y+.002,-S[1]+ny,-nx,Y+.002,ny])}
  O3.g1.attributes.position.needsUpdate=O3.g2.attributes.position.needsUpdate=true}

const O3={h:null,dG:null,t0:0,t0d:0,
  hold(k){if(O3.h)hS.remove(O3.h);O3.h=null;hp=0;if(!k)return;const m={comp:mkCompass,watch:mkWatch,sext:mkSext}[k](),H=new THREE.Group();H.add(m);O3.h=H;O3.m=m;O3.t0=performance.now();hS.add(H)},
  dial(on){if(O3.dG)wS.remove(O3.dG);O3.dG=null;if(!on)return;O3.dG=buildDial();O3.t0d=performance.now();O3.ds=[Math.sin(yaw*R)*.9,-Math.cos(yaw*R)*.9];wS.add(O3.dG)},
  render(sd,k){
    const now=performance.now();rd.clear();
    if(O3.dG){
      wC.fov=fov;wC.updateProjectionMatrix();wC.position.set(0,1.6,0);wC.rotation.set(pit*R,-yaw*R,0,'YXZ');
      sunL.position.set(sd[0]*10,Math.max(sd[2],.1)*10,-sd[1]*10);sunL.intensity=.2+1.1*k;amb.intensity=.25+.5*k;
      const e=ease((now-O3.t0d)/1300),G=O3.dG;G.position.set(O3.ds[0]+(dc[0]-O3.ds[0])*e,(1-e)*1.4,O3.ds[1]+(-dc[1]-O3.ds[1])*e);G.scale.setScalar(.2+.8*e);G.rotation.y=(1-e)*5;
      shadow(sd);rd.render(wS,wC)}
    if(O3.h){
      const e=ease((now-O3.t0)/1100),H=O3.h;hp=cl(e);
      H.position.set(3.2*(1-e),-3.2*(1-e),-2*(1-e));H.scale.setScalar(Math.max(.05,e));H.rotation.set(0,(1-e)*6,Math.sin(now/900)*.02);
      O3.m.userData.upd&&O3.m.userData.upd();rd.clearDepth();rd.render(hS,hC)}}};
