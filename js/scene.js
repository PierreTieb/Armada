/* Rendu : ciel, biomes (désert, herbe, mer), cadran solaire */
const cv=$('c'),g=cv.getContext('2d');
let W,H,run=0,yaw=0,pit=15,tp=null,fov=75,fovT=75,tool=null,night=0,dc=[0,2.9],vy=innerHeight/2,hp=0;
function rs(){W=cv.width=innerWidth;H=cv.height=innerHeight}rs();addEventListener('resize',rs);
const imgD=new Image();imgD.src='img/desert.jpg';
const BC={desert:[[14,22,40],[214,160,80]],grass:[[8,22,16],[72,150,62]],sea:[[6,14,40],[28,112,172]]};
const RO=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

function proj(v){const sy=Math.sin(yaw*R),cy=Math.cos(yaw*R),sp=Math.sin(pit*R),cp=Math.cos(pit*R),z=v[0]*sy*cp+v[1]*cy*cp+v[2]*sp;if(z<.02)return null;
  const x=v[0]*cy-v[1]*sy,y=-v[0]*sy*sp-v[1]*cy*sp+v[2]*cp,F=H/2/Math.tan(fov/2*R);return[W/2+F*x/z,vy-F*y/z,F/z]}
function draw(){
  const jd=sc[night?'night':'day'],s=sun(jd),L=lst(jd,lon),sd=dir(s.ra,s.dec,L,lat),sa=Math.asin(sd[2])/R,
  F=H/2/Math.tan(fov/2*R),yh=vy+F*Math.tan(pit*R),k=Math.max(0,Math.min(1,(sa+8)/14)),tw=Math.max(0,1-Math.abs(sa+1)/6),al=Math.max(0,Math.min(1,(-sa-3)/9));
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
  if(tool=='sext'){const r=Math.min(W*.42,H*.27)*(.35+.65*hp);g.save();g.fillStyle=`rgba(8,8,10,${.4+.6*hp})`;g.beginPath();g.rect(0,0,W,H);g.arc(W/2,vy,r,0,7,true);g.fill('evenodd');g.restore();
    g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1;g.beginPath();g.moveTo(W/2-r,vy);g.lineTo(W/2+r,vy);g.moveTo(W/2,vy-r);g.lineTo(W/2,vy+r);g.stroke()}
  O3.render(sd,k);
  const cr=$('cr');cr&&cr.setAttribute('transform',`rotate(${-yaw})`);
}
function frame(){if(!run)return;if(tp!=null){pit+=(tp-pit)*.08;if(Math.abs(tp-pit)<.2)tp=null}fov+=(fovT-fov)*.1;vy+=((tool=='sext'?H*.36:H/2)-vy)*.12;draw();requestAnimationFrame(frame)}
