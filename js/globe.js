/* Globe 3D du résultat : texture des continents, glisser pour tourner, pincer ou molette pour zoomer */
const Globe=(()=>{
  let r3,sc3,cam3,G,mT,mE,line,ready=0,dist=3.2,la0=0,lo0=0,w=300,h=300,raf=0;
  const P=new Map();let pd=0;
  const vec3=(la,lo,r=1)=>{la*=R;lo*=R;return new THREE.Vector3(Math.cos(la)*Math.cos(lo)*r,Math.sin(la)*r,-Math.cos(la)*Math.sin(lo)*r)};
  /* texture équirectangulaire dessinée à partir des contours (ceux qui franchissent 180° sont dépliés) */
  function earth(){const c=document.createElement('canvas'),W2=2048,H2=1024;c.width=W2;c.height=H2;const x=c.getContext('2d'),X=lo=>(lo+180)/360*W2,Y=la=>(90-la)/180*H2;
    const o=x.createLinearGradient(0,0,0,H2);o.addColorStop(0,'#1d4f8f');o.addColorStop(.5,'#2f78c0');o.addColorStop(1,'#1d4f8f');x.fillStyle=o;x.fillRect(0,0,W2,H2);
    x.beginPath();LAND.forEach(r=>{const u=[];let off=0;for(let i=0;i<r.length;i+=2){if(i){const d=r[i]+off-u[u.length-2];if(d>180)off-=360;else if(d<-180)off+=360}u.push(r[i]+off,r[i+1])}
      [-360,0,360].forEach(of=>{for(let i=0;i<u.length;i+=2)i?x.lineTo(X(u[i]+of),Y(u[i+1])):x.moveTo(X(u[i]+of),Y(u[i+1]));x.closePath()})});
    x.fillStyle='#7fae5a';x.fill('evenodd');x.strokeStyle='rgba(40,70,25,.8)';x.lineWidth=1.5;x.stroke();
    x.fillStyle='rgba(240,248,255,.9)';x.fillRect(0,0,W2,Y(86));x.fillRect(0,Y(-70),W2,H2);
    const t=new THREE.CanvasTexture(c);t.anisotropy=8;return t}
  const dotTex=col=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle=col;x.strokeStyle='#fff';x.lineWidth=9;x.beginPath();x.arc(32,32,24,0,7);x.fill();x.stroke();return new THREE.CanvasTexture(c)};
  function init(){
    const cv=$('gl');r3=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});sc3=new THREE.Scene();cam3=new THREE.PerspectiveCamera(35,1,.0005,20);
    sc3.add(new THREE.HemisphereLight(0xffffff,0x40506a,.85));const dl=new THREE.DirectionalLight(0xffffff,.45);dl.position.set(-2,3,5);sc3.add(dl);
    G=new THREE.Group();G.rotation.order='XYZ';sc3.add(G);
    G.add(new THREE.Mesh(new THREE.SphereGeometry(1,128,96),new THREE.MeshLambertMaterial({map:earth()})));
    sc3.add(new THREE.Mesh(new THREE.SphereGeometry(1.035,64,48),new THREE.MeshBasicMaterial({color:0x9fd0ff,transparent:true,opacity:.22,side:THREE.BackSide})));
    const gp=[];for(let la=-75;la<=75;la+=15)for(let lo=-180;lo<180;lo+=2)gp.push(...vec3(la,lo,1.0015).toArray(),...vec3(la,lo+2,1.0015).toArray());
    for(let lo=-180;lo<180;lo+=15)for(let la=-88;la<88;la+=2)gp.push(...vec3(la,lo,1.0015).toArray(),...vec3(la+2,lo,1.0015).toArray());
    const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(gp,3));G.add(new THREE.LineSegments(gg,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.28})));
    const mk=col=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex(col),sizeAttenuation:false,depthTest:false}));s.scale.setScalar(.06);s.renderOrder=2;G.add(s);return s};
    mT=mk('#2F9E5E');mE=mk('#D9463B');
    line=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xffffff}));G.add(line);
    cv.onpointerdown=e=>{P.set(e.pointerId,[e.clientX,e.clientY]);try{cv.setPointerCapture(e.pointerId)}catch(_){}if(P.size==2){const a=[...P.values()];pd=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])}};
    cv.onpointermove=e=>{const o=P.get(e.pointerId);if(!o)return;P.set(e.pointerId,[e.clientX,e.clientY]);
      if(P.size==2){const a=[...P.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);if(pd&&d)zoom(pd/d);pd=d;return}
      const k=2*(dist-1)*Math.tan(17.5*R)/h/R;lo0-=(e.clientX-o[0])*k;la0=Math.max(-89,Math.min(89,la0+(e.clientY-o[1])*k));draw()};
    cv.onpointerup=cv.onpointercancel=e=>{P.delete(e.pointerId);pd=0};
    cv.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(Math.max(-.4,Math.min(.4,e.deltaY*.0015))))},{passive:false});
    ready=1}
  /* zoom : on rapproche la caméra de la surface (de 3,2 rayons à quelques kilomètres) */
  function zoom(f){dist=1+Math.max(.005,Math.min(3,(dist-1)*f));draw()}
  function size(){w=Math.max(220,Math.min(innerWidth-64,460));h=Math.max(220,Math.min(innerHeight-330,w));r3.setPixelRatio(Math.min(2,devicePixelRatio));r3.setSize(w,h);cam3.aspect=w/h;cam3.updateProjectionMatrix()}
  function draw(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;G.rotation.set(la0*R,-Math.PI/2-lo0*R,0);cam3.position.set(0,0,dist);cam3.lookAt(0,0,0);
    G.updateMatrixWorld();[mT,mE].forEach(m=>{const p=m.getWorldPosition(new THREE.Vector3());m.visible=p.z>.02});r3.render(sc3,cam3)})}
  return{show(T,E,c){if(!ready)init();mT.position.copy(vec3(...T,1.004));mE.position.copy(vec3(...E,1.004));
      const A=vec3(...T),B=vec3(...E),pts=[];for(let i=0;i<=64;i++)pts.push(A.clone().lerp(B,i/64).normalize().multiplyScalar(1.003));line.geometry.setFromPoints(pts);
      la0=c[0];lo0=c[1];dist=3.2;size();draw()},
    resize(){if(ready&&!$('res').hidden){size();draw()}}}})();
addEventListener('resize',Globe.resize);
