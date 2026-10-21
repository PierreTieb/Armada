/* Monde 3D à 360° (Three.js r128) : ciel, étoiles, constellations, biomes, caméra */
const cv=$('c'),rd=new THREE.WebGLRenderer({canvas:cv,antialias:true});rd.autoClear=false;
const wS=new THREE.Scene(),wC=new THREE.PerspectiveCamera(70,1,.05,9000);
let W,H,run=0,yaw=0,pit=15,tp=null,fov=70,fovT=70,tool=null,night=0,dc=[0,1.4],vy=innerHeight/2,hp=0,gY=0;
function rs(){W=innerWidth;H=innerHeight;rd.setPixelRatio(Math.min(2,devicePixelRatio));rd.setSize(W,H)}rs();addEventListener('resize',rs);
const RO=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const cl=t=>Math.max(0,Math.min(1,t)),sm=(a,b,x)=>{const t=cl((x-a)/(b-a));return t*t*(3-2*t)};
const V=(d,r=1)=>new THREE.Vector3(d[0]*r,d[2]*r,-d[1]*r);
const tex=(w,h,f,rep)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=8;if(rep)t.wrapS=t.wrapT=THREE.RepeatWrapping;return t};
let SEED=0;
const hsh=(x,y)=>{const s=Math.sin(x*127.1+y*311.7+SEED)*43758.5453;return s-Math.floor(s)};
function vn(x,y){const i=Math.floor(x),j=Math.floor(y),f=x-i,g=y-j,u=f*f*(3-2*f),v=g*g*(3-2*g);
  return(hsh(i,j)*(1-u)+hsh(i+1,j)*u)*(1-v)+(hsh(i,j+1)*(1-u)+hsh(i+1,j+1)*u)*v}
const fbm=(x,y,o=4)=>{let s=0,a=.5;for(let i=0;i<o;i++){s+=a*vn(x,y);x=x*2.03+17;y=y*2.03+9;a*=.5}return s};

/* ---------- ciel ---------- */
const skyU={uSun:{value:new THREE.Vector3(0,1,0)},uZen:{value:new THREE.Color()},uHor:{value:new THREE.Color()},uTw:{value:0},uK:{value:1}};
const sky=new THREE.Mesh(new THREE.SphereGeometry(8000,64,32),new THREE.ShaderMaterial({uniforms:skyU,side:THREE.BackSide,depthWrite:false,
  vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform vec3 uSun,uZen,uHor;uniform float uTw,uK;varying vec3 vD;
  void main(){vec3 d=normalize(vD);float h=d.y,s=max(dot(d,uSun),0.);
    vec3 c=mix(uZen,uHor,pow(1.-clamp(h,0.,1.),4.));
    c+=vec3(1.,.48,.18)*uTw*pow(1.-abs(h),10.)*(.2+.8*pow(s,3.));
    c+=vec3(1.,.92,.72)*(pow(s,6.)*.22+pow(s,90.)*.45)*uK;
    c=mix(c,uHor*.8,smoothstep(0.,-.1,h));gl_FragColor=vec4(c,1.);}`}));
sky.renderOrder=-10;wS.add(sky);
const glowTex=(spk)=>tex(256,256,(x)=>{const g=x.createRadialGradient(128,128,0,128,128,128);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(spk?.05:.06,'rgba(255,250,235,1)');g.addColorStop(spk?.12:.1,'rgba(255,235,190,.55)');g.addColorStop(.35,'rgba(255,220,160,.12)');g.addColorStop(1,'rgba(255,210,140,0)');
  x.fillStyle=g;x.fillRect(0,0,256,256);
  if(spk){x.globalCompositeOperation='lighter';[[0,1],[1,0]].forEach(([a,b])=>{const l=x.createLinearGradient(128-120*a,128-120*b,128+120*a,128+120*b);
    l.addColorStop(0,'rgba(200,225,255,0)');l.addColorStop(.5,'rgba(235,245,255,.95)');l.addColorStop(1,'rgba(200,225,255,0)');x.fillStyle=l;x.fillRect(a?8:126,a?126:8,a?240:4,a?4:240)})}});
const sunS=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false}));sunS.scale.setScalar(1500);wS.add(sunS);
const moonU={uL:{value:new THREE.Vector3()},uA:{value:1}};
const moon=new THREE.Mesh(new THREE.SphereGeometry(110,32,16),new THREE.ShaderMaterial({uniforms:moonU,transparent:true,depthWrite:false,
  vertexShader:'varying vec3 vN;void main(){vN=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform vec3 uL;uniform float uA;varying vec3 vN;
  void main(){float l=smoothstep(-.06,.2,dot(vN,uL)),m=.82+.18*sin(vN.x*9.+vN.y*4.)*sin(vN.y*11.-vN.z*6.);
    gl_FragColor=vec4(vec3(.96,.95,.9)*m*(l*.95+.05),uA);}`}));wS.add(moon);

/* étoiles : points avec scintillement, extinction près de l'horizon */
const starU={uAl:{value:0},uT:{value:0},uPR:{value:1}};
const starMat=(add)=>new THREE.ShaderMaterial({uniforms:starU,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:`attribute float aS,aP;attribute vec3 aC;uniform float uAl,uT,uPR;varying vec3 vC;varying float vA;
  void main(){vec3 d=normalize(position);float e=smoothstep(-.01,.22,d.y);vA=uAl*e*(1.+${add?'0.':'.28'}*sin(uT*3.1+aP*40.));vC=aC;
    gl_PointSize=aS*uPR;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 vC;varying float vA;void main(){float r=length(gl_PointCoord-.5)*2.;
    float a=${add?'pow(1.-clamp(r,0.,1.),2.)':'smoothstep(1.,.15,r)*.55+smoothstep(.4,0.,r)*.45'};gl_FragColor=vec4(vC*vA*a,1.);}`});
const COLS={Bet:[1,.62,.4],Ant:[1,.55,.38],Alb2:[1,.72,.48],Arc:[1,.78,.55],Pox:[1,.85,.65],Rig:[.75,.85,1],Spi:[.72,.82,1],Veg:[.82,.88,1],Sir:[.85,.9,1],Ach:[.78,.86,1]};
function ptsGeo(n){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));
  g.setAttribute('aS',new THREE.BufferAttribute(new Float32Array(n),1));g.setAttribute('aP',new THREE.BufferAttribute(new Float32Array(n),1));g.setAttribute('aC',new THREE.BufferAttribute(new Float32Array(n*3),3));return g}
const SK=Object.keys(ST),nS=SK.length+FS.length,stars=new THREE.Points(ptsGeo(nS),starMat(0)),milky=new THREE.Points(ptsGeo(MW.length),starMat(1));
stars.frustumCulled=milky.frustumCulled=false;wS.add(milky,stars);
(()=>{const a=stars.geometry.attributes,b=milky.geometry.attributes;
  const put=(i,mag,c)=>{a.aS.array[i]=Math.max(2.4,Math.min(13,9-1.35*mag));const k=Math.max(.4,Math.min(1.5,1.7-.22*mag));a.aC.array.set(c.map(v=>v*k),i*3);a.aP.array[i]=Math.random()};
  SK.forEach((n,i)=>put(i,ST[n][2],COLS[n]||[1,.97,.92]));
  FS.forEach((q,i)=>{const t=Math.random();put(SK.length+i,q[2],t<.2?[.8,.87,1]:t>.85?[1,.85,.7]:[1,.98,.95])});
  MW.forEach((q,i)=>{b.aS.array[i]=14+Math.random()*22;b.aC.array.set([.075*q[2],.085*q[2],.12*q[2]],i*3)})})();
const lineU={uAl:starU.uAl};
const lines=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.ShaderMaterial({uniforms:lineU,transparent:true,depthWrite:false,
  vertexShader:'uniform float uAl;varying float vA;void main(){vA=uAl*smoothstep(0.,.12,normalize(position).y);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying float vA;void main(){gl_FragColor=vec4(.6,.75,1.,vA*.32);}'}));
lines.frustumCulled=false;wS.add(lines);
/* étoiles repères (Polaris au nord, σ Octantis au sud) : brillance exagérée */
const pole={Pol:new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(1),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false})),
  sOc:new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(1),color:0xcfe0ff,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false}))};
wS.add(pole.Pol,pole.sOc);
function placeStars(L){
  const p=stars.geometry.attributes.position.array,q=milky.geometry.attributes.position.array,ps={};
  SK.forEach((n,i)=>{const v=V(dir(ST[n][0]*15,ST[n][1],L,lat),7000);ps[n]=v;p.set([v.x,v.y,v.z],i*3)});
  FS.forEach((s,i)=>{const v=V(dir(s[0],s[1],L,lat),7000);p.set([v.x,v.y,v.z],(SK.length+i)*3)});
  MW.forEach((s,i)=>{const v=V(dir(s[0],s[1],L,lat),7200);q.set([v.x,v.y,v.z],i*3)});
  const seg=[];LN.forEach(l=>{for(let i=1;i<l.length;i++){const a=ps[l[i-1]].clone().multiplyScalar(.99),b=ps[l[i]].clone().multiplyScalar(.99);seg.push(a.x,a.y,a.z,b.x,b.y,b.z)}});
  lines.geometry.setAttribute('position',new THREE.Float32BufferAttribute(seg,3));
  stars.geometry.attributes.position.needsUpdate=milky.geometry.attributes.position.needsUpdate=true;
  pole.Pol.position.copy(ps.Pol);pole.sOc.position.copy(ps.sOc)}

/* ---------- lumières et brouillard ---------- */
const hemi=new THREE.HemisphereLight(0xbfdcff,0x6b5a40,.6),sunL=new THREE.DirectionalLight(0xfff2d8,1),moonL=new THREE.DirectionalLight(0x9db4ff,0);
wS.add(hemi,sunL,moonL);wS.fog=new THREE.Fog(0xaaccee,200,3500);

/* ---------- sol : maillage radial (dense près du joueur, large au loin) ---------- */
function radial(r0,f,rMax,segs,hf,cf){
  const P=[0,hf(0,0),0],C=[...cf(0,0,0)],U=[0,0],I=[];let r=r0,n=0;
  while(r<rMax){for(let j=0;j<segs;j++){const a=j/segs*2*Math.PI,x=Math.cos(a)*r,z=Math.sin(a)*r,y=hf(x,z);P.push(x,y,z);C.push(...cf(x,z,y));U.push(x/3,z/3)}r*=f;n++}
  for(let j=0;j<segs;j++)I.push(0,1+(j+1)%segs,1+j);
  for(let i=0;i<n-1;i++)for(let j=0;j<segs;j++){const a=1+i*segs+j,b=1+i*segs+(j+1)%segs,c=a+segs,d=b+segs;I.push(a,b,c,b,d,c)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();return g}
const sandTex=tex(512,512,(x,w,h)=>{x.fillStyle='#d9d9d9';x.fillRect(0,0,w,h);
  for(let i=0;i<9000;i++){const v=170+Math.random()*85|0;x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(Math.random()*w,Math.random()*h,1.5,1.5)}
  x.strokeStyle='rgba(120,120,120,.18)';x.lineWidth=3;for(let i=0;i<16;i++){x.beginPath();for(let s=0;s<=w;s+=8)x.lineTo(s,i*32+Math.sin(s*.03+i)*5);x.stroke()}},1);
const grassTex=tex(512,512,(x,w,h)=>{x.fillStyle='#c8c8c8';x.fillRect(0,0,w,h);
  for(let i=0;i<7000;i++){const v=130+Math.random()*125|0,px=Math.random()*w,py=Math.random()*h;x.strokeStyle=`rgb(${v},${v},${v})`;x.lineWidth=1.2;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.random()*4-2,py-4-Math.random()*6);x.stroke()}},1);
const bladeTex=tex(128,128,(x,w,h)=>{for(let i=0;i<22;i++){const b=w/2+(Math.random()-.5)*w*.8,t=b+(Math.random()-.5)*40,g=x.createLinearGradient(0,h,0,0);
  g.addColorStop(0,'#3e6b26');g.addColorStop(1,i%3?'#9cc95a':'#c8d77a');x.fillStyle=g;x.beginPath();x.moveTo(b-3,h);x.quadraticCurveTo(b,h*.5,t,h*.08+Math.random()*30);x.quadraticCurveTo(b+1,h*.5,b+3,h);x.fill()}});
const plankTex=tex(512,512,(x,w,h)=>{for(let i=0;i<8;i++){const v=[150+Math.random()*30,105+Math.random()*20,62+Math.random()*12];x.fillStyle=css(v);x.fillRect(i*64,0,64,h);
  x.strokeStyle='rgba(60,35,15,.25)';x.lineWidth=1;for(let k=0;k<10;k++){x.beginPath();const o=i*64+6+Math.random()*52;x.moveTo(o,0);x.bezierCurveTo(o+5,h*.3,o-5,h*.7,o+2,h);x.stroke()}
  x.fillStyle='rgba(40,22,8,.8)';x.fillRect(i*64,0,3,h);x.fillRect(i*64,(i*137)%h,64,3);x.fillStyle='#3a2a1a';[[16,0],[48,0]].forEach(([a])=>{x.beginPath();x.arc(i*64+a,(i*137)%h+12,3,0,7);x.fill()})}},1);

const BIO={desert:{fog:[150,3400],mt:[.78,.6,.45]},grass:{fog:[120,3000],mt:[.35,.45,.38]},sea:{fog:[250,4200],mt:null}};
let land=null,extra=new THREE.Group(),mtn=null,sea=null,seaT={value:0},boat=null;wS.add(extra);
const WV=[[1,0,.16,.32,1.15],[.6,.8,.24,.2,1.45],[-.4,.9,.43,.09,1.95],[.9,-.45,.72,.045,2.6],[-.8,-.6,1.15,.022,3.4]];
const waveGL=WV.map(([a,b,k,A,s])=>{const l=Math.hypot(a,b);a=(a/l).toFixed(3);b=(b/l).toFixed(3);
  return `{float ph=dot(vec2(${a},${b}),p)*${k.toFixed(3)}+uT*${s.toFixed(2)};h+=${A.toFixed(3)}*sin(ph);g+=${(A*k).toFixed(4)}*cos(ph)*vec2(${a},${b});}`}).join('');
const waveH=(x,z,t)=>WV.reduce((h,[a,b,k,A,s])=>{const l=Math.hypot(a,b);return h+A*Math.sin((a*x+b*z)/l*k+t*s)},0);

function heightFn(){
  if(biome=='desert')return(x,z)=>{const d=Math.hypot(x,z),m=sm(4,45,d),n=fbm(x*.005,z*.005,4),u=(x*.8+z*.6)*.011+n*4,r=1-Math.abs(Math.sin(u)),rr=r*r*(3-2*r);
    return m*(rr*rr*(5+18*n)+n*16-8)+sm(3,6,d)*.15*Math.sin(x*1.3+z)};
  return(x,z)=>{const d=Math.hypot(x,z),m=sm(4,40,d);return m*(fbm(x*.003,z*.003,4)*55-24+fbm(x*.03,z*.03,2)*3)+sm(2,6,d)*.1*vn(x*.6,z*.6)}}

function mkMountains(rad,amp,base){
  const P=[],I=[],N=360;for(let j=0;j<=N;j++){const a=j/N*2*Math.PI,h=base+amp*Math.pow(fbm(Math.cos(a)*3+40,Math.sin(a)*3+40,5),1.6)*2.2;
    P.push(Math.cos(a)*rad,-30,Math.sin(a)*rad,Math.cos(a)*rad,h,Math.sin(a)*rad)}
  for(let j=0;j<N;j++){const a=j*2;I.push(a,a+1,a+2,a+1,a+3,a+2)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);
  return new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x888888,fog:false,side:THREE.DoubleSide}))}

function mkBoat(){
  const G=new THREE.Group(),s=new THREE.Shape();s.moveTo(-2.1,-4);s.lineTo(2.1,-4);s.bezierCurveTo(2.4,0,2.2,3,0,6.5);s.bezierCurveTo(-2.2,3,-2.4,0,-2.1,-4);
  const deckG=new THREE.ExtrudeGeometry(s,{depth:.3,bevelEnabled:false}).rotateX(-Math.PI/2);
  const uvs=deckG.attributes.uv;for(let i=0;i<uvs.count;i++)uvs.setXY(i,uvs.getX(i)*.25,uvs.getY(i)*.25);
  const wood=new THREE.MeshLambertMaterial({map:plankTex}),dark=new THREE.MeshLambertMaterial({color:0x4a2e18});
  const deck=new THREE.Mesh(deckG,wood);deck.position.y=.3;
  const hull=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:1.6,bevelEnabled:true,bevelSize:.15,bevelThickness:.1}).rotateX(-Math.PI/2),dark);hull.position.y=-1.3;hull.scale.set(1.04,1,1.04);
  const pts=s.getSpacedPoints(80).map(p=>new THREE.Vector3(p.x*1.02,1.05,-p.y*1.02));
  const rail=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),160,.07,8,true),dark);
  const bul=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p.x,.75,p.z)),true),160,.12,6,true),wood);
  G.add(hull,deck,rail,bul);
  for(let i=0;i<pts.length;i+=5){const p=mesh(new THREE.CylinderGeometry(.04,.04,.45,6),dark,pts[i].x,.83,pts[i].z);G.add(p)}
  return G}

function scatter(n,rMin,rMax,hf,fn){for(let i=0;i<n;i++){const a=Math.random()*2*Math.PI,r=rMin+(rMax-rMin)*Math.pow(Math.random(),1.6),x=Math.cos(a)*r,z=Math.sin(a)*r;fn(i,x,hf(x,z),z,r)}}

const World={jd:0,
  build(){
    SEED=Math.random()*1000;[land,mtn,sea,boat].forEach(o=>o&&wS.remove(o));land=mtn=sea=boat=null;
    extra.children.slice().forEach(c=>extra.remove(c));
    const B=BIO[biome];wS.fog.near=B.fog[0];wS.fog.far=B.fog[1];
    if(biome=='sea'){
      const g=radial(.5,1.05,5200,160,()=>0,()=>[1,1,1]),m=new THREE.MeshPhongMaterial({color:0x1d5a7e,specular:0xcfe6ff,shininess:70});
      m.onBeforeCompile=s=>{s.uniforms.uT=seaT;s.vertexShader='uniform float uT;\n'+s.vertexShader
        .replace('#include <beginnormal_vertex>',`vec2 p=position.xz;float fa=1.-smoothstep(250.,1100.,length(p));float h=0.;vec2 g=vec2(0.);${waveGL}h*=fa;g*=fa;vec3 objectNormal=normalize(vec3(-g.x,1.,-g.y));`)
        .replace('#include <begin_vertex>','vec3 transformed=vec3(position.x,h,position.z);')};
      sea=new THREE.Mesh(g,m);sea.frustumCulled=false;wS.add(sea);boat=mkBoat();boat.rotation.y=Math.random()*6.28;wS.add(boat);gY=1.05;
    }else{
      const hf=heightFn(),des=biome=='desert';gY=hf(0,0);
      const cf=des?(x,z,y)=>{const n=vn(x*.05,z*.05);return mx([.84,.62,.38],[.97,.8,.55],cl(y/25+.35+n*.25))}
        :(x,z,y)=>{const n=fbm(x*.02,z*.02,3),p=vn(x*.12,z*.12);return mx(mx([.2,.42,.14],[.42,.6,.2],n),[.62,.62,.3],cl(p-.7)*1.5)};
      land=new THREE.Mesh(radial(.4,1.04,4200,220,hf,cf),new THREE.MeshLambertMaterial({map:des?sandTex:grassTex,vertexColors:true}));wS.add(land);
      mtn=mkMountains(3600,des?90:260,des?10:30);mtn.userData.c=B.mt;wS.add(mtn);
      if(des){const rk=new THREE.MeshPhongMaterial({color:0xb08a62,flatShading:true,shininess:4});
        scatter(28,8,600,hf,(i,x,y,z,r)=>{const o=mesh(new THREE.DodecahedronGeometry(.2+Math.random()*.4*(1+r/80),0),rk,x,y,z);o.scale.y=.5+Math.random()*.4;o.rotation.set(Math.random(),Math.random()*6,0);extra.add(o)})}
      else{
        const tuft=new THREE.PlaneGeometry(.5,.45).translate(0,.22,0),tg=new THREE.BufferGeometry();
        const gm=[0,1,2].map(k=>tuft.clone().rotateY(k*Math.PI/3));const P=[],U=[],I=[];let o=0;
        gm.forEach(q=>{P.push(...q.attributes.position.array);U.push(...q.attributes.uv.array);I.push(...Array.from(q.index.array).map(v=>v+o));o+=q.attributes.position.count});
        tg.setAttribute('position',new THREE.Float32BufferAttribute(P,3));tg.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));tg.setIndex(I);tg.computeVertexNormals();
        const im=new THREE.InstancedMesh(tg,new THREE.MeshLambertMaterial({map:bladeTex,alphaTest:.45,side:THREE.DoubleSide}),2600),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),S=new THREE.Vector3();
        scatter(2600,2.6,70,hf,(i,x,y,z)=>{const s=.7+Math.random()*1.1;M.compose(new THREE.Vector3(x,y-.03,z),Q.setFromEuler(E.set(0,Math.random()*6,0)),S.set(s,s*(.8+Math.random()*.6),s));im.setMatrixAt(i,M)});
        const nT=160,tr=new THREE.InstancedMesh(new THREE.CylinderGeometry(.18,.28,2.4,6).translate(0,1.2,0),new THREE.MeshLambertMaterial({color:0x5a3d22}),nT),
          cn=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.6,1).translate(0,3.6,0),new THREE.MeshPhongMaterial({color:0x2f5a22,flatShading:true,shininess:4}),nT);
        scatter(nT,40,1400,hf,(i,x,y,z)=>{const s=1+Math.random()*1.4;M.compose(new THREE.Vector3(x,y-.2,z),Q.setFromEuler(E.set(0,Math.random()*6,0)),S.set(s,s*(.9+Math.random()*.5),s));tr.setMatrixAt(i,M);cn.setMatrixAt(i,M)});
        extra.add(im,tr,cn)}
    }
    World.jd=0},
  update(jd,sd,k,tw,al,L){
    if(jd!=World.jd){World.jd=jd;placeStars(L)}
    const now=performance.now()/1000,sv=V(sd),md=moonDir(jd,L),mv=V(md);
    skyU.uSun.value.copy(sv);skyU.uK.value=k;skyU.uTw.value=tw;
    const zen=mx([5,9,26],[28,108,196],k),hor=mx(mx([16,26,54],[172,212,236],k),[236,150,92],tw*.55);
    skyU.uZen.value.setRGB(...zen.map(v=>v/255));skyU.uHor.value.setRGB(...hor.map(v=>v/255));wS.fog.color.setRGB(...hor.map(v=>v/255*.92));
    sunS.position.copy(sv).multiplyScalar(7000);sunS.visible=sd[2]>-.08;sunS.material.opacity=cl(sd[2]*10+.8);
    moon.position.copy(mv).multiplyScalar(7000);moonU.uL.value.copy(sv);moonU.uA.value=1-k*.65;moon.visible=md[2]>-.05;
    starU.uAl.value=al;starU.uT.value=now;starU.uPR.value=rd.getPixelRatio();stars.visible=lines.visible=milky.visible=al>.01;
    const vf=wC.fov*R,pxW=px=>px/H*2*7000*Math.tan(vf/2);
    for(const n in pole){const s=pole[n],e=sm(-.01,.08,s.position.y/7000);s.visible=al>.01;s.material.opacity=Math.min(1,al*e*1.3*(.85+.15*Math.sin(now*2.2)));s.scale.setScalar(pxW(90))}
    sunL.position.copy(sv).multiplyScalar(100);sunL.intensity=1.05*cl(sd[2]*6);sunL.color.setRGB(1,.85+.12*k,.7+.25*k);
    moonL.position.copy(mv).multiplyScalar(100);moonL.intensity=md[2]>0?.45*(1-k):0;
    hemi.intensity=.5+.25*k;hemi.color.setRGB(...mx([.3,.4,.7],[.75,.85,1],k));hemi.groundColor.setRGB(...mx([.1,.12,.2],[.45,.38,.28],k));
    if(mtn){const c=mtn.userData.c,f=.18+.82*k;mtn.material.color.setRGB(...mx(c.map(v=>v*f),hor.map(v=>v/255),.55))}
    if(sea){seaT.value=now;sea.material.color.setRGB(...mx([.03,.07,.14],[.11,.36,.5],k));boat.position.y=.45+waveH(0,0,now)*.5;boat.rotation.z=.015*Math.sin(now*.9);gY=boat.position.y+.6}
  },
  eye(){return gY+1.6},
  roll(){return biome=='sea'?.012*Math.sin(performance.now()/1000*.8):0}};

function draw(){
  const jd=sc[night?'night':'day'],s=sun(jd),L=lst(jd,lon),sd=dir(s.ra,s.dec,L,lat),sa=Math.asin(sd[2])/R,
    k=cl((sa+5)/14),tw=Math.max(0,1-Math.abs(sa+1)/7),al=cl((-sa-4)/8);
  const asp=W/H,vf=Math.min(fov,2*Math.atan(Math.tan(47.5*R)/asp)/R);
  wC.fov=vf;wC.aspect=asp;wC.position.set(0,World.eye(),0);wC.rotation.set(pit*R,-yaw*R,World.roll(),'YXZ');
  wC.setViewOffset(W,H,0,H/2-vy,W,H);wC.updateProjectionMatrix();
  World.update(jd,sd,k,tw,al,L);
  O3.render(sd,k);
  Sext.upd();
}
/* si la carte graphique est réinitialisée (Windows le fait quand elle sature), on recharge textures et éclairage */
cv.addEventListener('webglcontextlost',e=>e.preventDefault());
cv.addEventListener('webglcontextrestored',()=>{const seen=new Set();[wS,hS].forEach(s=>s.traverse(o=>{if(!o.material)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.needsUpdate=true;
  ['map','bumpMap'].forEach(k=>{const t=m[k];if(t&&!seen.has(t)){seen.add(t);t.needsUpdate=true}})})}));makeEnv();World.jd=0});
/* pas de rendu 3D quand une page plein écran la recouvre (résultat) : la carte graphique se repose */
const covered=()=>!$('res').hidden;
function frame(){if(!run)return;if(covered()){requestAnimationFrame(frame);return}if(tp!=null){pit+=(tp-pit)*.08;if(Math.abs(tp-pit)<.05){pit=tp;tp=null}}fov+=(fovT-fov)*.1;vy+=((tool=='sext'?H*.42:H/2)-vy)*.12;draw();requestAnimationFrame(frame)}
