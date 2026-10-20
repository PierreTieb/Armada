/* Objets 3D : sac à dos qui s'ouvre, instruments tenus en main, cadran posé au sol */
const hS=new THREE.Scene(),hC=new THREE.PerspectiveCamera(40,1,.1,60);hC.position.z=6;
const VH=2*6*Math.tan(20*R);
hS.add(new THREE.HemisphereLight(0xfff4e0,0x3a2a1a,.7));
const keyL=new THREE.DirectionalLight(0xffffff,1.1),rimL=new THREE.DirectionalLight(0xffe2b0,.6);keyL.position.set(2,4,6);rimL.position.set(-4,2,-3);hS.add(keyL,rimL);
(()=>{const t=tex(512,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#fff8e8');g.addColorStop(.42,'#d8c49a');g.addColorStop(.55,'#6b5638');g.addColorStop(1,'#1a120a');
  x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='#fff';x.fillRect(w*.12,h*.1,w*.14,h*.2);x.fillRect(w*.6,h*.16,w*.07,h*.12);x.fillStyle='rgba(255,240,210,.7)';x.fillRect(w*.35,h*.05,w*.18,h*.08)});
  t.mapping=THREE.EquirectangularReflectionMapping;hS.environment=new THREE.PMREMGenerator(rd).fromEquirectangular(t).texture})();

const STD=(o)=>new THREE.MeshStandardMaterial(o);
const GOLD=STD({color:0xdcaa4a,metalness:1,roughness:.24}),GOLDD=STD({color:0xa9772c,metalness:1,roughness:.38}),
  SILV=STD({color:0xe9e6dc,metalness:.85,roughness:.3}),MIRR=STD({color:0xd6e6ff,metalness:1,roughness:.04}),
  GLASS=STD({color:0xffffff,metalness:0,roughness:.03,transparent:true,opacity:.16,depthWrite:false}),
  RED=STD({color:0xb3261e,roughness:.35,metalness:.2}),PALE=STD({color:0xf3efe6,roughness:.35,metalness:.2}),DARK=STD({color:0x14110e,roughness:.9}),
  WOODH=STD({color:0x5b351c,roughness:.55}),STONEH=STD({color:0x4a4d55,roughness:.85}),PAGE=STD({color:0xefe2c2,roughness:.9});
/* matériaux du monde (éclairés par le soleil de la scène) */
const GOLDW=new THREE.MeshPhongMaterial({color:0xc99a3c,specular:0xfff0b0,shininess:80}),STONE=new THREE.MeshLambertMaterial({color:0x5a5d66}),WOOD=new THREE.MeshLambertMaterial({color:0x6b4a2b});

const noisy=(base,spots,n=4000,rm=4,am=.08)=>(x,w,h)=>{x.fillStyle=base;x.fillRect(0,0,w,h);
  for(let i=0;i<n;i++){const s=spots[i%spots.length];x.fillStyle=s.replace('A',(Math.random()*am).toFixed(3));x.beginPath();x.arc(Math.random()*w,Math.random()*h,.6+Math.random()*rm,0,7);x.fill()}};
const leatherT=tex(512,512,(x,w,h)=>{noisy('#4a2412',['rgba(20,6,0,A)','rgba(200,120,70,A)','rgba(40,15,4,A)'],6000,6,.07)(x,w,h);
  x.strokeStyle='rgba(35,12,3,.35)';x.lineWidth=1;for(let i=0;i<60;i++){x.beginPath();const a=Math.random()*w,b=Math.random()*h;x.moveTo(a,b);x.lineTo(a+Math.random()*40-20,b+Math.random()*10-5);x.stroke()}},1);
const canvasT=tex(256,256,(x,w,h)=>{noisy('#4f5a2e',['rgba(15,20,4,A)','rgba(200,210,150,A)'],1500,2,.08)(x,w,h);
  for(let i=0;i<h;i+=2){x.fillStyle=`rgba(0,0,0,${.05+Math.random()*.05})`;x.fillRect(0,i,w,1)}for(let i=0;i<w;i+=2){x.fillStyle=`rgba(255,255,220,${.03+Math.random()*.03})`;x.fillRect(i,0,1,h)}},1);
canvasT.repeat.set(3,3);
const LEATH=STD({map:leatherT,bumpMap:leatherT,bumpScale:.01,roughness:.45,color:0xc49a80,envMapIntensity:.45}),LEATHD=STD({map:leatherT,bumpMap:leatherT,bumpScale:.01,roughness:.5,color:0x7a5a4a,envMapIntensity:.4}),
  CANV=STD({map:canvasT,bumpMap:canvasT,bumpScale:.015,roughness:1,envMapIntensity:.35});

const mesh=(g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);return o};
const disc=(t,r)=>new THREE.Mesh(new THREE.CircleGeometry(r,72),STD({map:t,roughness:.55}));
const CY=(r,h,s=64)=>new THREE.CylinderGeometry(r,r,h,s).rotateX(Math.PI/2),TR=(r,t,a=Math.PI*2)=>new THREE.TorusGeometry(r,t,14,72,a);
const ease=t=>{t=cl(t);return 1+2.70158*Math.pow(t-1,3)+1.70158*Math.pow(t-1,2)},eio=t=>{t=cl(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
function rbox(w,h,d,r,m){const b=Math.min(r,d/2)*.7,W2=w/2-b,H2=h/2-b,q=Math.max(.001,Math.min(r,W2,H2)),s=new THREE.Shape();
  s.moveTo(-W2+q,-H2);s.lineTo(W2-q,-H2);s.quadraticCurveTo(W2,-H2,W2,-H2+q);s.lineTo(W2,H2-q);s.quadraticCurveTo(W2,H2,W2-q,H2);s.lineTo(-W2+q,H2);s.quadraticCurveTo(-W2,H2,-W2,H2-q);s.lineTo(-W2,-H2+q);s.quadraticCurveTo(-W2,-H2,-W2+q,-H2);
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.001,d-2*b),bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:3,curveSegments:6});g.translate(0,0,-(d-2*b)/2);
  const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)*.5,u.getY(i)*.5);return new THREE.Mesh(g,m)}
const faceMat=(t,side)=>[side,STD({map:t,roughness:.3,metalness:.6}),side];
function medal(r,d,t,side=GOLD){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d,48).rotateX(Math.PI/2),faceMat(t,side));return o}
function sq(s,t,m,x,y,z,ry=0){const o=mesh(new THREE.TorusGeometry(s,t,6,4),m,x,y,z);o.rotation.set(0,ry,Math.PI/4);return o}

/* ---------- textures des cadrans ---------- */
const paper=(x,w,h,c1='#f7efda',c2='#e6d6b0')=>{const g=x.createRadialGradient(w/2,h/2,w*.1,w/2,h/2,w*.55);g.addColorStop(0,c1);g.addColorStop(1,c2);x.fillStyle=g;x.fillRect(0,0,w,h)};
const roseTex=()=>tex(1024,1024,x=>{paper(x,1024,1024);x.translate(512,512);x.strokeStyle=x.fillStyle='#2a2118';x.textAlign='center';x.textBaseline='middle';
  x.lineWidth=3;x.beginPath();x.arc(0,0,496,0,7);x.stroke();x.beginPath();x.arc(0,0,440,0,7);x.stroke();
  for(let a=0;a<360;a+=2){x.save();x.rotate(a*R);x.lineWidth=a%10?1.5:3.5;x.beginPath();x.moveTo(0,-494);x.lineTo(0,a%10?-478:-458);x.stroke();
    x.restore()}
  const pt=(a,L,wd,c1,c2)=>{x.save();x.rotate(a*R);x.fillStyle=c1;x.beginPath();x.moveTo(0,-L);x.lineTo(wd,0);x.lineTo(0,0);x.fill();x.fillStyle=c2;x.beginPath();x.moveTo(0,-L);x.lineTo(-wd,0);x.lineTo(0,0);x.fill();x.restore()};
  for(let a=22.5;a<360;a+=45)pt(a,190,22,'#7a6a50','#b8a682');for(let a=45;a<360;a+=90)pt(a,250,34,'#3a3026','#8c7a5a');for(let a=0;a<360;a+=90)pt(a,300,48,a?'#2a2118':'#b3261e',a?'#6b5a42':'#e0574c');
  x.lineWidth=2;x.beginPath();x.arc(0,0,150,0,7);x.stroke();
  [['N',0],['E',90],['S',180],['O',270]].forEach(([t,a])=>{x.save();x.rotate(a*R);x.translate(0,-372);x.fillStyle=x.strokeStyle=t=='N'?'#b3261e':'#2a2118';x.font='900 118px Georgia';x.lineWidth=9;x.lineJoin='round';x.strokeText(t,0,6);x.fillText(t,0,6);x.restore()})});
const bezelTex=()=>tex(1024,1024,x=>{const g=x.createLinearGradient(0,0,1024,1024);g.addColorStop(0,'#fff1c4');g.addColorStop(1,'#c99a3c');x.fillStyle=g;x.fillRect(0,0,1024,1024);
  x.translate(512,512);x.fillStyle=x.strokeStyle='#5c3f0c';x.textAlign='center';x.textBaseline='middle';x.font='900 46px Georgia';x.lineWidth=3;
  for(let a=0;a<360;a+=5){x.save();x.rotate(a*R);x.lineWidth=a%30?3:6;x.beginPath();x.moveTo(0,-505);x.lineTo(0,a%30?-490:-476);x.stroke();if(a%30==0){x.lineWidth=2.5;x.strokeText(a,0,-450);x.fillText(a,0,-450)}x.restore()}});
const sunTex=()=>tex(512,512,x=>{x.translate(256,256);const g=x.createRadialGradient(-60,-60,10,0,0,256);g.addColorStop(0,'#fff3b0');g.addColorStop(.6,'#e2b13c');g.addColorStop(1,'#a8741c');x.fillStyle=g;x.fillRect(-256,-256,512,512);
  x.fillStyle='#f6c843';x.strokeStyle='#9c6a12';x.lineWidth=4;for(let i=0;i<16;i++){x.save();x.rotate(i*Math.PI/8);x.beginPath();x.moveTo(-22,-120);x.quadraticCurveTo(i%2?-6:10,-180,0,i%2?-200:-235);x.quadraticCurveTo(i%2?14:-4,-180,22,-120);x.fill();x.stroke();x.restore()}
  const f=x.createRadialGradient(-30,-40,10,0,0,130);f.addColorStop(0,'#fff6c8');f.addColorStop(1,'#e8a92a');x.fillStyle=f;x.beginPath();x.arc(0,0,125,0,7);x.fill();x.stroke();
  x.strokeStyle='#8a5a0a';x.lineWidth=7;x.lineCap='round';[[-45,-20],[45,-20]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,16,Math.PI*1.1,Math.PI*1.9);x.stroke();x.fillStyle='#6a420a';x.beginPath();x.arc(a,b+8,8,0,7);x.fill()});
  x.beginPath();x.arc(0,25,50,.2*Math.PI,.8*Math.PI);x.stroke();x.beginPath();x.moveTo(0,-5);x.quadraticCurveTo(-10,25,4,30);x.stroke();
  x.lineWidth=10;x.strokeStyle='#8a5a0a';x.beginPath();x.arc(0,0,250,0,7);x.stroke()});
const moonTex=()=>tex(256,256,x=>{x.fillStyle='#d9a441';x.fillRect(0,0,256,256);x.fillStyle='#1b2a5c';x.beginPath();x.arc(128,128,108,0,7);x.fill();
  x.fillStyle='#f3d27a';x.beginPath();x.arc(118,128,62,0,7);x.fill();x.fillStyle='#1b2a5c';x.beginPath();x.arc(146,112,58,0,7);x.fill();
  x.fillStyle='#f3d27a';x.font='bold 40px Georgia';x.fillText('✦',160,190)});

/* ---------- boussole ---------- */
function mkCompass(){
  const G=new THREE.Group(),card=disc(roseTex(),1.0);card.position.z=.1;
  const half=(s,m)=>{const g=new THREE.ExtrudeGeometry(new THREE.Shape(s.map(p=>new THREE.Vector2(...p))),{depth:.03,bevelEnabled:true,bevelThickness:.01,bevelSize:.01,bevelSegments:1});return new THREE.Mesh(g,m)};
  const nd=new THREE.Group();nd.add(half([[0,.82],[.09,0],[-.09,0]],RED),half([[0,-.82],[-.09,0],[.09,0]],PALE),mesh(new THREE.SphereGeometry(.08,20,12),GOLD,0,0,.03));nd.position.z=.06;card.add(nd);
  const bz=new THREE.Mesh(new THREE.RingGeometry(1.0,1.2,96),STD({map:bezelTex(),metalness:.85,roughness:.3}));bz.position.z=.2;
  const dome=mesh(new THREE.SphereGeometry(1.05,48,12,0,Math.PI*2,0,.55),GLASS,0,0,.1);dome.rotation.x=Math.PI/2;dome.scale.y=.22;
  G.add(mesh(CY(1.26,.34),GOLD,0,0,-.09),mesh(TR(1.22,.07),GOLD,0,0,.18),mesh(TR(1.0,.035),GOLDD,0,0,.2),bz,card,dome,
    mesh(CY(.13,.22),GOLD,0,1.32,0).rotateX(Math.PI/2),mesh(TR(.26,.055),GOLD,0,1.62,0));
  G.userData.cr=yaw*R;G.userData.v=0;
  G.userData.upd=()=>{const d=G.userData,tg=yaw*R;let df=((tg-d.cr+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;d.v=d.v*.86+df*.06;d.cr+=d.v;card.rotation.z=d.cr};return G}

/* ---------- montre à gousset (heure de Greenwich) ---------- */
function watchTex(d){const m=d.getUTCMinutes(),h=d.getUTCHours()%12+m/60;
  return tex(1024,1024,x=>{paper(x,1024,1024,'#fbf6e8','#eadfc4');x.translate(512,512);x.strokeStyle=x.fillStyle='#1f1a14';x.textAlign='center';x.textBaseline='middle';
    x.lineWidth=2;x.beginPath();x.arc(0,0,480,0,7);x.stroke();x.beginPath();x.arc(0,0,446,0,7);x.stroke();
    for(let i=0;i<60;i++){x.save();x.rotate(i*6*R);x.lineWidth=i%5?2.5:7;x.beginPath();x.moveTo(0,-480);x.lineTo(0,i%5?-450:-430);x.stroke();x.restore()}
    x.font='900 80px Georgia';x.lineWidth=4;x.lineJoin='round';for(let i=1;i<=12;i++){const px=Math.sin(i*Math.PI/6)*355,py=-Math.cos(i*Math.PI/6)*355+4;x.strokeText(RO[i],px,py);x.fillText(RO[i],px,py)}
    x.font='italic 34px Georgia';x.fillText('Greenwich',0,-205);
    x.fillStyle='#fff';x.fillRect(-90,150,180,62);x.lineWidth=3;x.strokeRect(-90,150,180,62);x.fillStyle='#1f1a14';x.font='bold 40px Georgia';
    x.fillText(`${d.getUTCDate()}/${d.getUTCMonth()+1} ${d.getUTCHours()<12?'AM':'PM'}`,0,183);
    const hand=(a,L,wd,tip)=>{x.save();x.rotate(a);x.fillStyle='#1b2a5c';x.beginPath();x.moveTo(-wd,40);x.lineTo(-wd*.5,-L*.7);x.lineTo(0,-L);x.lineTo(wd*.5,-L*.7);x.lineTo(wd,40);x.fill();
      x.beginPath();x.arc(0,-L*tip,wd*2.2,0,7);x.fill();x.fillStyle='#fbf6e8';x.beginPath();x.arc(0,-L*tip,wd*1.1,0,7);x.fill();x.restore()};
    hand(h*30*R,250,22,.62);hand(m*6*R,400,15,.78);x.fillStyle='#1b2a5c';x.beginPath();x.arc(0,0,26,0,7);x.fill();x.fillStyle='#d9a441';x.beginPath();x.arc(0,0,10,0,7);x.fill()})}
function mkWatch(open=true){
  const d=new Date((sc[night?'night':'day']-2440587.5)*864e5),G=new THREE.Group(),face=disc(watchTex(d),1.08);face.position.z=.16;
  const piv=new THREE.Group();piv.position.set(0,1.27,.17);
  const lid=new THREE.Group();lid.position.y=-1.27;
  const inn=new THREE.Mesh(new THREE.CircleGeometry(1.12,64),STD({metalness:.15,roughness:.75,color:0xb89048,envMapIntensity:.25,map:tex(512,512,x=>{const g=x.createRadialGradient(200,180,20,256,256,300);g.addColorStop(0,'#fbe7a8');g.addColorStop(1,'#c99a3c');x.fillStyle=g;x.fillRect(0,0,512,512);
    x.fillStyle='#7a5200';x.textAlign='center';x.font='italic 44px Georgia';x.fillText('Greenwich',256,230);x.font='26px Georgia';x.fillText('heure du méridien 0°',256,290);x.strokeStyle='#7a5200';x.lineWidth=3;x.beginPath();x.arc(256,256,232,0,7);x.stroke()})}));
  inn.rotation.x=Math.PI;inn.position.z=-.065;
  lid.add(inn,mesh(CY(1.27,.12),GOLD),mesh(TR(1.2,.05),GOLD,0,0,-.07),medal(.62,.02,tex(512,512,x=>{x.fillStyle='#d9a441';x.fillRect(0,0,512,512);x.translate(256,256);x.strokeStyle='#7a5200';x.lineWidth=6;
    for(let i=0;i<8;i++){x.beginPath();x.moveTo(0,0);x.lineTo(0,i%2?-120:-230);x.lineTo(i%2?22:34,-60);x.closePath();x.stroke();x.rotate(Math.PI/4)}x.beginPath();x.arc(0,0,240,0,7);x.stroke()}),GOLD).translateZ(.07));
  piv.add(lid);
  const dome=mesh(new THREE.SphereGeometry(1.1,48,12,0,Math.PI*2,0,.5),GLASS,0,0,.16);dome.rotation.x=Math.PI/2;dome.scale.y=.2;
  G.add(mesh(CY(1.26,.3),GOLD),mesh(TR(1.2,.07),GOLD,0,0,.15),face,dome,piv,mesh(CY(.13,.24,24),GOLD,0,1.38,0).rotateX(Math.PI/2),mesh(new THREE.SphereGeometry(.17,20,12),GOLDD,0,1.52,0),mesh(TR(.3,.06),GOLD,0,1.82,0));
  for(let i=0;i<10;i++){const l=mesh(new THREE.TorusGeometry(.1,.026,8,16),GOLD,.32+i*.16,2.0+Math.sin(i*.5)*.22,0);l.rotation.y=i%2?Math.PI/2:0;G.add(l)}
  G.userData.t0=performance.now();G.userData.upd=()=>{piv.rotation.x=open?-2.6*ease((performance.now()-G.userData.t0-700)/800):0};return G}

/* ---------- sextant (modèle pour le sac) ---------- */
function mkSextModel(){
  const G=new THREE.Group(),sh=new THREE.Shape();sh.moveTo(0,0);sh.absarc(0,0,2.2,-120*R,-60*R,false);sh.lineTo(0,0);
  const ho=new THREE.Path();ho.absarc(0,0,1.72,-111*R,-69*R,false);ho.absarc(0,0,.75,-69*R,-111*R,true);sh.holes.push(ho);
  G.add(mesh(new THREE.ExtrudeGeometry(sh,{depth:.1,bevelEnabled:true,bevelSize:.02,bevelThickness:.02}),GOLD));
  const limb=mesh(new THREE.RingGeometry(1.84,2.16,64,1,-120*R,60*R),STD({metalness:.7,roughness:.35,map:tex(512,512,x=>{x.fillStyle='#ece7da';x.fillRect(0,0,512,512);x.strokeStyle='#222';
    for(let a=-120;a<=-60;a+=1){const c=Math.cos(a*R),s=Math.sin(a*R),r1=256,r2=a%5?246:236;x.lineWidth=a%5?1:2;x.beginPath();x.moveTo(256+c*r1,256-s*r1);x.lineTo(256+c*r2,256-s*r2);x.stroke()}})}),0,0,.13);
  const arm=new THREE.Group();arm.position.z=.16;arm.rotation.z=8*R;
  arm.add(mesh(new THREE.BoxGeometry(.13,2.15,.05).translate(0,-1.05,0),GOLD),mesh(new THREE.BoxGeometry(.4,.28,.05),GOLD,0,-2.05,0),mesh(CY(.12,.14,24),GOLDD,.28,-2.12,.02).rotateY(Math.PI/2),
    mesh(new THREE.BoxGeometry(.38,.5,.08),GOLD,0,.15,.04),mesh(new THREE.PlaneGeometry(.3,.42),MIRR,0,.15,.085));
  const hz=new THREE.Group();hz.position.set(-.85,-.62,.22);hz.add(mesh(new THREE.BoxGeometry(.3,.4,.06),GOLD),mesh(new THREE.PlaneGeometry(.12,.32),MIRR,-.06,0,.035));
  const tel=new THREE.Group();tel.position.set(.25,-.62,.38);
  tel.add(mesh(new THREE.CylinderGeometry(.13,.13,1.2,32).rotateZ(Math.PI/2),GOLD),mesh(new THREE.CylinderGeometry(.17,.17,.18,32).rotateZ(Math.PI/2),GOLDD,.62,0,0),mesh(new THREE.CylinderGeometry(.1,.1,.2,24).rotateZ(Math.PI/2),DARK,-.66,0,0));
  const flt=[0x3a5a8a,0x7a3a2a,0x2a6a4a].map((c,i)=>{const m=mesh(new THREE.BoxGeometry(.2,.26,.03),STD({color:c,transparent:true,opacity:.7,roughness:.1}),-.45+i*.0,-.22-i*.0,.2+i*.05);m.rotation.z=.3;return m});
  G.add(limb,arm,hz,tel,...flt,mesh(new THREE.CylinderGeometry(.11,.13,1.1,16),WOODH,.1,-1.0,-.32));
  return G}

/* ---------- cadran solaire à bâton vertical (lignes horaires calculées pour la date de la scène) ---------- */
const HS=1.4;
function dialTex(la,dec=0){return tex(1024,1024,x=>{
  paper(x,1024,1024,'#efe5c9','#d9c9a0');x.translate(512,512);x.strokeStyle=x.fillStyle='#2a2118';x.textAlign='center';x.textBaseline='middle';x.font='bold 27px Georgia';
  const u=512/1.3;let lastL=null;
  x.lineWidth=3;x.beginPath();x.arc(0,0,1.02*u,0,7);x.stroke();x.lineWidth=1.5;x.beginPath();x.arc(0,0,.9*u,0,7);x.stroke();
  for(let t=4;t<=20;t+=.25){const d=dir(0,dec,(t-12)*15,la),l=Math.hypot(d[0],d[1]);if(d[2]<.02||l<1e-4)continue;
    const sx=-d[0]/l,sy=-d[1]/l,hr=t%1==0,a=hr?.1:.9;x.lineWidth=hr?4:1.6;x.beginPath();x.moveTo(sx*a*u,-sy*a*u);x.lineTo(sx*1.02*u,-sy*1.02*u);x.stroke();
    if(hr){const px=sx*1.14*u,py=-sy*1.14*u;if(!lastL||Math.hypot(px-lastL[0],py-lastL[1])>60){x.fillText(RO[(t-1)%12+1],px,py);lastL=[px,py]}}}})}
const stick=m=>{const g=new THREE.Group();g.add(mesh(new THREE.CylinderGeometry(.016,.016,HS,12),m,0,HS/2,0),mesh(new THREE.SphereGeometry(.035,12,8),m,0,HS,0));return g};
function buildDial(){
  const G=new THREE.Group();G.add(mesh(new THREE.CylinderGeometry(1.5,1.6,.16,64),biome=='sea'?WOOD:STONE,0,.08,0));
  const f=new THREE.Mesh(new THREE.CircleGeometry(1.3,72),new THREE.MeshLambertMaterial({map:dialTex(lat,sun(sc.day).dec),color:0xd6cebd}));f.rotation.x=-Math.PI/2;f.position.y=.165;
  const st=stick(GOLDW);st.position.y=.165;G.add(f,st);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(12),3));g.setIndex([0,1,2,0,2,3]);O3.g2=g;
  G.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x0a0a19,transparent:true,opacity:.85,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,fog:false})));
  return G}
function shadow(sd){
  const w=O3.g2.attributes.position.array,Y=.168;
  if(sd[2]<=.03)w.fill(0);else{
    let S=[-sd[0]/sd[2]*HS,-sd[1]/sd[2]*HS];const l=Math.hypot(...S);if(l>1.28)S=[S[0]*1.28/l,S[1]*1.28/l];
    const L=Math.hypot(...S)||1,nx=-S[1]/L*.012,ny=S[0]/L*.012;
    w.set([nx,Y,-ny,S[0]+nx,Y,-S[1]-ny,S[0]-nx,Y,-S[1]+ny,-nx,Y,ny])}
  O3.g2.attributes.position.needsUpdate=true}
function mkMiniDial(){const G=new THREE.Group();G.add(mesh(new THREE.CylinderGeometry(1.5,1.6,.35,48),STONEH,0,0,0));
  const f=new THREE.Mesh(new THREE.CircleGeometry(1.3,64),STD({map:dialTex(45,10),roughness:.8,color:0xd8cfbc,envMapIntensity:.35}));f.rotation.x=-Math.PI/2;f.position.y=.18;
  const st=stick(GOLD);st.position.y=.18;st.scale.set(2,1.2,2);G.add(f,st);return G}

/* ---------- carnet de bord ---------- */
function mkBook(){const G=new THREE.Group();
  G.add(rbox(1.4,1.85,.26,.1,LEATH),mesh(new THREE.BoxGeometry(1.3,1.74,.2),PAGE,.05,0,0));
  const cv=mesh(new THREE.PlaneGeometry(1.26,1.7),STD({roughness:.5,metalness:.1,transparent:true,map:tex(512,680,(x,w,h)=>{x.strokeStyle='rgba(232,190,100,.9)';x.lineWidth=5;x.strokeRect(24,24,w-48,h-48);x.lineWidth=2;x.strokeRect(38,38,w-76,h-76);
    x.translate(w/2,h/2-20);x.fillStyle='rgba(232,190,100,.9)';for(let i=0;i<8;i++){x.save();x.rotate(i*Math.PI/4);x.beginPath();x.moveTo(0,i%2?-60:-110);x.lineTo(14,0);x.lineTo(-14,0);x.fill();x.restore()}
    x.beginPath();x.arc(0,0,70,0,7);x.lineWidth=4;x.strokeStyle='rgba(232,190,100,.9)';x.stroke();x.font='italic bold 44px Georgia';x.textAlign='center';x.fillText('Carnet',0,190)})}),0,0,.135);
  G.add(cv,rbox(.42,.3,.32,.06,LEATHD).translateX(.62),medal(.13,.04,moonTex()).translateX(.72).translateZ(.17));
  const rib=mesh(new THREE.PlaneGeometry(.07,.55),STD({color:0x8a3a1c,side:THREE.DoubleSide,roughness:.7}),-.25,-1.1,.02);G.add(rib,medal(.07,.02,sunTex()).translateX(-.25).translateY(-1.38).translateZ(.02));
  return G}

/* ---------- sac à dos ---------- */
function mkBag(){
  const G=new THREE.Group(),Wd=2,Ht=2.3,D=1.1,top=Ht/2,fz=D/2;
  G.add(rbox(Wd,Ht,D,.38,CANV),rbox(Wd+.08,.38,D+.08,.14,LEATH).translateY(-top+.17));
  const hole=mesh(new THREE.CircleGeometry(1,40),STD({color:0x120b06,roughness:1}),0,top+.01,0);hole.rotation.x=-Math.PI/2;hole.scale.set(Wd*.34,D*.22,1);G.add(hole);
  /* rabat */
  const fl=new THREE.Group();fl.position.set(0,top+.02,-fz);
  const ft=rbox(Wd+.06,D+.1,.08,.12,LEATH);ft.rotation.x=-Math.PI/2;ft.position.set(0,.04,D/2+.02);fl.add(ft,rbox(Wd+.06,1.05,.08,.26,LEATH).translateY(-.5).translateZ(D+.06));
  fl.add(medal(.32,.06,sunTex()).translateY(-.42).translateZ(D+.12),mesh(TR(.33,.025),GOLDD,0,-.42,D+.15));
  [-.66,.66].forEach(x=>{fl.add(rbox(.2,.85,.04,.05,LEATHD).translateX(x).translateY(-.62).translateZ(D+.11));fl.add(mesh(new THREE.SphereGeometry(.035,12,8),GOLD,x,-.12,D+.14))});
  G.add(fl);G.userData.flap=fl;
  /* sangles et boucles fixes */
  [-.66,.66].forEach(x=>{G.add(rbox(.2,.62,.04,.05,LEATHD).translateX(x).translateY(-.05).translateZ(fz+.04),sq(.14,.025,GOLD,x,.1,fz+.08))});
  /* poche avant */
  G.add(rbox(1.5,.95,.36,.16,LEATH).translateY(-.58).translateZ(fz+.13),rbox(1.56,.46,.08,.14,LEATHD).translateY(-.24).translateZ(fz+.33));
  [-.44,.44].forEach(x=>{G.add(rbox(.16,.6,.04,.04,LEATHD).translateX(x).translateY(-.5).translateZ(fz+.36),sq(.1,.02,GOLD,x,-.55,fz+.39))});
  G.add(rbox(.28,.24,.05,.05,LEATHD).translateY(-.86).translateZ(fz+.33));
  [-.12,.12].forEach(x=>{G.add(mesh(new THREE.CylinderGeometry(.02,.02,.42,6),LEATHD,x,-.02,fz+.26),mesh(new THREE.SphereGeometry(.05,10,8),LEATHD,x,-.22,fz+.27))});
  /* poches latérales */
  [-1,1].forEach(s=>{G.add(rbox(.34,1.05,.66,.12,CANV).translateX(s*(Wd/2+.1)).translateY(-.32),rbox(.38,.38,.7,.1,LEATH).translateX(s*(Wd/2+.12)).translateY(.08),
    sq(.07,.016,GOLD,s*(Wd/2+.3),-.05,0,s*Math.PI/2))});
  /* poignée et bretelles */
  const hd=mesh(new THREE.TorusGeometry(.3,.06,10,24,Math.PI),LEATHD,0,top+.02,-fz+.15);G.add(hd);
  [-.6,.6].forEach(x=>{const b=mesh(new THREE.TorusGeometry(.55,.09,10,24,Math.PI*.7),LEATHD,x,top-.45,-fz-.12);b.rotation.set(0,Math.PI/2,Math.PI*.15);G.add(b)});
  return G}

/* ---------- état et rendu ---------- */
const BAGK=['comp','watch','sext','dial','book'],BAGN={comp:'Boussole',watch:'Montre',sext:'Sextant',dial:'Cadran solaire',book:'Carnet'};
const shadeP=mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshBasicMaterial({color:0x0a1020,transparent:true,opacity:0,depthWrite:false}),0,0,-12);hS.add(shadeP);
const O3={h:null,m:null,dG:null,t0:0,t0d:0,zoom:0,bag:null,bT:0,bDir:0,last:performance.now(),
  hold(k){if(O3.h)hS.remove(O3.h);O3.h=null;hp=0;O3.zoom=0;if(!k)return;const m={comp:mkCompass,watch:mkWatch}[k](),H=new THREE.Group();H.add(m);O3.h=H;O3.m=m;O3.t0=performance.now();hS.add(H)},
  dial(on){if(O3.dG)wS.remove(O3.dG);O3.dG=null;if(!on)return;O3.dG=buildDial();O3.t0d=performance.now();wS.add(O3.dG)},
  heldLayout(){const z=O3.zoom,w=tool=='watch',zf=Math.max(.75,70/fov),Dp=Math.min((z?Math.min(H*(w?.44:.6),W*.86):Math.min(H*.28,W*.44))*zf,H*(w?.55:.9),W*.95),s=Dp/H*VH/2.6,y=-VH/2+(Dp/2+(z||zf>1.3?H*(w?.06:.08):28))/H*VH;return{s,y}},
  stow(cb){if(O3.h&&tool){O3.stowT=performance.now();O3.stowCb=cb}else{if(tool)setTool(null);cb()}},
  reset(){O3.stowT=0;if(O3.bag){hS.remove(O3.bag.B);O3.bag=null}O3.bDir=0;O3.bT=0;shadeP.material.opacity=0;$('labels').hidden=true;document.body.classList.remove('bag-open')},
  bagOpen(){if(O3.bag&&O3.bDir>0)return;if(!O3.bag){const B=new THREE.Group(),bag=mkBag(),items={};B.add(bag);
      const mk={comp:()=>mkCompass(),watch:()=>mkWatch(true),sext:()=>mkSextModel(),dial:()=>mkMiniDial(),book:()=>mkBook()},sz={comp:.3,watch:.28,sext:.33,dial:.27,book:.42};
      BAGK.forEach((k,i)=>{const o=new THREE.Group(),m=mk[k]();m.scale.setScalar(sz[k]);if(k=='dial')m.rotation.x=.75;if(k=='sext')m.position.y=.32;o.add(m);o.userData={k,i};items[k]=o;B.add(o)});
      O3.bag={B,bag,items};hS.add(B)}
    O3.bDir=1;$('labels').hidden=false;document.body.classList.add('bag-open')},
  bagClose(){if(O3.bag)O3.bDir=-1;$('labels').hidden=true;document.body.classList.remove('bag-open')},
  bagLayout(){const asp=W/H,vw=VH*asp,s=Math.min(1,vw/5.5),b=$('bag').getBoundingClientRect();
    return{s,from:new THREE.Vector3(((b.left+b.width/2)/W-.5)*vw,-((b.top+b.height/2)/H-.5)*VH,0)}},
  itemPos(i,s){const a=(166-i*38)*R;return new THREE.Vector3(Math.cos(a)*2.05*s,(-.1+Math.sin(a)*1.25)*s,.6)},
  pick(cx,cy){if(!O3.bag||O3.bDir<0)return null;let best=null,bd=1e9;
    BAGK.forEach(k=>{const p=O3.bag.items[k].getWorldPosition(new THREE.Vector3()).project(hC),x=(p.x+1)/2*W,y=(1-p.y)/2*H,d=Math.hypot(x-cx,y-cy);if(d<bd){bd=d;best=k}});
    return bd<Math.max(46,Math.min(W,H)*.1)?best:null},
  hitHeld(cx,cy){if(!O3.h)return false;const p=O3.h.position.clone().project(hC),L=O3.heldLayout(),r=1.4*L.s/VH*H;return Math.hypot((p.x+1)/2*W-cx,(1-p.y)/2*H-cy)<r},
  renderBag(now,dt){const S=O3.bag;if(!S)return;
    O3.bT=Math.max(0,Math.min(2.4,O3.bT+dt*(O3.bDir>0?1:-3.2)));const T=O3.bT;
    if(T<=0&&O3.bDir<0){hS.remove(S.B);O3.bag=null;O3.bDir=0;shadeP.material.opacity=0;return}
    const {s,from}=O3.bagLayout(),e=ease(T/.55),B=S.B;
    shadeP.material.opacity=.5*cl(T/.5);
    B.position.copy(from).lerp(new THREE.Vector3(0,0,0),e);B.scale.setScalar(Math.max(.05,(.12+.88*e)*s));
    S.bag.position.set(0,-1.05,0);S.bag.scale.setScalar(.72);S.bag.rotation.set(.32,Math.sin(now/1600)*.12+(1-e)*1.5,0);
    S.bag.userData.flap.rotation.x=-1.8*eio((T-.45)/.55);
    const top=new THREE.Vector3(0,-1.05+1.15*.72,0),lab=[];
    BAGK.forEach((k,i)=>{const o=S.items[k],t=ease((T-.9-i*.1)/.6),tg=O3.itemPos(i,1);
      o.position.copy(top).lerp(tg,t);o.position.y+=Math.sin(t*Math.PI)*.4+Math.sin(now/700+i)*.04*t;o.scale.setScalar(Math.max(.01,t));
      o.rotation.set(k=='dial'?.1:0,(1-t)*5+Math.sin(now/1300+i)*.3,0);o.visible=t>.01;
      o.children[0].userData.upd&&o.children[0].userData.upd();
      const p=o.getWorldPosition(new THREE.Vector3());p.y-=.5*s;p.project(hC);lab.push([k,(p.x+1)/2*W,(1-p.y)/2*H,t])});
    $('labels').innerHTML=lab.map(([k,x,y,t])=>`<span style="left:${x}px;top:${y}px;opacity:${t>.95?1:0}">${BAGN[k]}${tool==k?' ✓':''}</span>`).join('')},
  render(sd,k){
    const now=performance.now(),dt=Math.min(.25,(now-O3.last)/1000);O3.last=now;rd.clear();
    if(O3.dG){const e=ease((now-O3.t0d)/1300),G=O3.dG;G.position.set(dc[0],gY+(1-e)*1.2,-dc[1]);G.scale.setScalar(.3*(.25+.75*e));G.rotation.y=(1-e)*5;shadow(sd)}
    rd.render(wS,wC);
    hC.aspect=W/H;hC.updateProjectionMatrix();
    if(O3.h){const e=ease((now-O3.t0)/1000),Hh=O3.h,L=O3.heldLayout();hp=cl(e);
      Hh.userData.s=(Hh.userData.s||L.s)+(L.s-(Hh.userData.s||L.s))*.15;Hh.userData.y=(Hh.userData.y==null?L.y:Hh.userData.y)+(L.y-(Hh.userData.y==null?L.y:Hh.userData.y))*.15;
      const vw=VH*W/H;Hh.position.set(vw*.42*(1-e),Hh.userData.y-(1-e)*2,0);Hh.scale.setScalar(Math.max(.02,Hh.userData.s*e));
      if(O3.stowT){const t=cl((now-O3.stowT)/260),f=O3.bagLayout().from;Hh.position.lerp(f,eio(t));Hh.scale.multiplyScalar(1-t*.95);
        if(t>=1){const c=O3.stowCb;O3.stowT=0;setTool(null);c();return O3.render2(now)}}
      Hh.rotation.set((tool=='comp'||tool=='watch'?(O3.zoom?-.5:-.82):.3)-pit*R*.1,(1-e)*6,Math.sin(now/900)*.02);O3.m.userData.upd&&O3.m.userData.upd()}
    O3.render2(now,dt)},
  render2(now,dt=0){if(O3.h||O3.bag){O3.renderBag(now,dt);rd.clearDepth();rd.render(hS,hC)}}};
