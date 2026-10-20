/* Rendu : ciel, biomes (désert, herbe, mer), cadran solaire */
const cv=$('c'),g=cv.getContext('2d');
let W,H,run=0,yaw=0,pit=15,tp=null,fov=75,fovT=75,tool=null,night=0,dc=[0,2.9];
function rs(){W=cv.width=innerWidth;H=cv.height=innerHeight}rs();addEventListener('resize',rs);
const imgD=new Image();imgD.src='img/desert.jpg';
const BC={desert:[[14,22,40],[214,160,80]],grass:[[8,22,16],[72,150,62]],sea:[[6,14,40],[28,112,172]]};
const RO=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

function proj(v){const sy=Math.sin(yaw*R),cy=Math.cos(yaw*R),sp=Math.sin(pit*R),cp=Math.cos(pit*R),z=v[0]*sy*cp+v[1]*cy*cp+v[2]*sp;if(z<.02)return null;
  const x=v[0]*cy-v[1]*sy,y=-v[0]*sy*sp-v[1]*cy*sp+v[2]*cp,F=H/2/Math.tan(fov/2*R);return[W/2+F*x/z,H/2-F*y/z,F/z]}
function poly(pts,fill,stroke,lw){g.beginPath();for(let i=0;i<pts.length;i++){const p=proj([pts[i][0]+dc[0],pts[i][1]+dc[1],(pts[i][2]||0)-1.6]);if(!p)return;i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])}
  if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw||1;g.stroke()}}

/* Cadran horizontal : graduations fixes (style parallèle à l'axe terrestre), ombre exagérée */
function dial(sd){
  const ph=lat*R,sg=Math.sign(lat),cp=Math.cos(ph),sp=Math.abs(Math.sin(ph)),Rr=1.3,Lg=.65,
  circ=r=>Array.from({length:49},(_,i)=>[r*Math.cos(i*Math.PI/24),r*Math.sin(i*Math.PI/24)]);
  poly(circ(1.45),biome=='sea'?'#6b4a2b':'#2b2d35');poly(circ(Rr),'#eadfc3','#8a5d00',3);poly(circ(.12),'#c9971c');
  const p=[0,sg*cp,sp];
  for(let t=6;t<=18;t+=.25){
    const h=(t-12)*15*R,s=[-Math.sin(h),-Math.sin(ph)*Math.cos(h),cp*Math.cos(h)],n=[p[1]*s[2]-p[2]*s[1],p[2]*s[0]-p[0]*s[2]];
    let d=[n[1],-n[0]],l=Math.hypot(d[0],d[1]);d=[d[0]/l,d[1]/l];if(d[0]*-s[0]+d[1]*-s[1]<0)d=[-d[0],-d[1]];
    const hr=t%1==0,a=hr?.14:.9,b=hr?1.02:1.02;
    poly([[d[0]*a,d[1]*a],[d[0]*b,d[1]*b]],0,'#2a2118',hr?3:1.2);
    if(hr){const q=proj([d[0]*1.15+dc[0],d[1]*1.15+dc[1],-1.6]);if(q){g.fillStyle='#2a2118';g.font=`bold ${Math.max(9,.14*q[2])}px Georgia`;g.textAlign='center';g.fillText(RO[(t-1)%12+1],q[0],q[1]+.05*q[2])}}}
  const A=[0,sg*Lg*cp,0],Tp=[0,sg*Lg*cp,Lg*sp];
  if(sd[2]>.03){const k=Tp[2]/sd[2];let S=[(Tp[0]-sd[0]*k)*1.5,(Tp[1]-sd[1]*k)*1.5,0];const l=Math.hypot(S[0],S[1]);if(l>3.2)S=[S[0]*3.2/l,S[1]*3.2/l,0];
    poly([[0,0,0],A,S],'rgba(10,10,25,.55)');poly([[0,0,0],S],0,'rgba(10,10,25,.8)',6)}
  poly([[0,0,0],A,Tp],'#d9a521','#8a5d00',2);
}

function draw(){
  const jd=sc[night?'night':'day'],s=sun(jd),L=lst(jd,lon),sd=dir(s.ra,s.dec,L,lat),sa=Math.asin(sd[2])/R,
  F=H/2/Math.tan(fov/2*R),yh=H/2+F*Math.tan(pit*R),k=Math.max(0,Math.min(1,(sa+8)/14)),tw=Math.max(0,1-Math.abs(sa+1)/6),al=Math.max(0,Math.min(1,(-sa-3)/9));
  let gr=g.createLinearGradient(0,0,0,Math.min(Math.max(yh,1),H*3));
  gr.addColorStop(0,css(mx([4,8,26],[28,130,200],k)));gr.addColorStop(1,css(mx(mx([22,34,70],[150,218,236],k),[245,140,70],tw*.7)));g.fillStyle=gr;g.fillRect(0,0,W,H);
  if(al>.02){const pp={};
    for(const n in ST){const q=ST[n],p=proj(dir(q[0]*15,q[1],L,lat));pp[n]=p;if(p){g.fillStyle=`rgba(255,255,255,${al})`;g.beginPath();g.arc(p[0],p[1],Math.max(.8,2.8-q[2]*.5),0,7);g.fill()}}
    for(const q of FS){const p=proj(dir(q[0],q[1],L,lat));if(p){g.fillStyle=`rgba(255,255,255,${al*q[2]})`;g.fillRect(p[0],p[1],1.4,1.4)}}
    g.strokeStyle=`rgba(140,190,255,${al*.45})`;g.lineWidth=1;
    LN.forEach(l=>{g.beginPath();let pen=0;l.forEach(n=>{const p=pp[n];if(p){pen?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);pen=1}else pen=0});g.stroke()});
    g.fillStyle=`rgba(190,215,255,${al*.8})`;g.font='12px system-ui';g.textAlign='left';LB.forEach(([t,n])=>{const p=pp[n];if(p)g.fillText(t,p[0]+8,p[1]-8)})}
  if(sa<2){const el=((jd-2451550.1)/29.53059%1)*360,l=(s.l+el)*R,e=23.44*R,p=proj(dir(Math.atan2(Math.cos(e)*Math.sin(l),Math.cos(l))/R,Math.asin(Math.sin(e)*Math.sin(l))/R,L,lat));
    if(p){const f=(1-Math.cos(el*R))/2,r=15;g.fillStyle='#e9eefc';g.beginPath();g.arc(p[0],p[1],r,0,7);g.fill();g.fillStyle=css(mx([4,8,26],[28,130,200],k));g.beginPath();g.arc(p[0]+(el<180?-1:1)*2*r*f,p[1],r+1,0,7);g.fill()}}
  if(sa>-4){const p=proj(sd);if(p){const r=g.createRadialGradient(p[0],p[1],2,p[0],p[1],80);r.addColorStop(0,'rgba(255,245,200,.95)');r.addColorStop(1,'rgba(255,220,120,0)');g.fillStyle=r;g.beginPath();g.arc(p[0],p[1],80,0,7);g.fill();g.fillStyle='#fff8dc';g.beginPath();g.arc(p[0],p[1],12,0,7);g.fill()}}
  /* sol selon le biome */
  const [bn,bd]=BC[biome],gc1=mx(bn,bd,k),useImg=biome=='desert'&&imgD.complete&&imgD.naturalWidth;
  if(yh<H){const y0=Math.max(yh,0),h=H-y0;
    if(useImg){const q=imgD.naturalWidth/1408;g.drawImage(imgD,708*q,385*q,700*q,383*q,0,y0,W,h);g.globalAlpha=k;g.drawImage(imgD,0,385*q,700*q,383*q,0,y0,W,h);g.globalAlpha=1}
    else{const gg=g.createLinearGradient(0,y0,0,H);gg.addColorStop(0,css(gc1));gg.addColorStop(1,css(mx(gc1,[0,0,0],.3)));g.fillStyle=gg;g.fillRect(0,y0,W,h)}
    if(biome=='sea'){const t=performance.now()/900;g.strokeStyle=`rgba(255,255,255,${.08+.12*k})`;g.lineWidth=1.5;
      for(let i=1;i<10;i++){const y=yh+(H-yh)*(i/10)**2;if(y<0||y>H)continue;g.beginPath();for(let x=0;x<=W;x+=12)g.lineTo(x,y+Math.sin(x*.02+i*2+t)*(2+i*.8));g.stroke()}}}
  if(!useImg&&biome!='sea'&&yh>-60&&yh<H+60){const hill=biome=='grass';g.beginPath();g.moveTo(0,yh+2);
    for(let x=0;x<=W;x+=8){const a=yaw*R+Math.atan((x-W/2)/F);g.lineTo(x,yh-F*Math.max(0,hill?.03+.02*Math.sin(a*3)+.012*Math.sin(a*7):.012+.012*Math.sin(a*5)+.006*Math.sin(a*11+1)))}
    g.lineTo(W,yh+2);g.fillStyle=css(mx(gc1,hill?[0,40,0]:[0,0,0],.2));g.fill()}
  if(tool=='dial')dial(sd);
  if(tool=='sext'){g.strokeStyle='#fff';g.lineWidth=1.5;g.beginPath();g.arc(W/2,H/2,38,0,7);
    [[-60,0,-38,0],[38,0,60,0],[0,-60,0,-38],[0,38,0,60]].forEach(a=>{g.moveTo(W/2+a[0],H/2+a[1]);g.lineTo(W/2+a[2],H/2+a[3])});g.stroke()}
  const cr=$('cr');cr&&cr.setAttribute('transform',`rotate(${-yaw})`);
  const ro=$('ro');if(ro){ro.textContent=pit.toFixed(1)+'°';$('sx').value=pit}
}
function frame(){if(!run)return;if(tp!=null){pit+=(tp-pit)*.08;if(Math.abs(tp-pit)<.2)tp=null}fov+=(fovT-fov)*.1;draw();requestAnimationFrame(frame)}
