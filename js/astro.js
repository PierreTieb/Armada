/* Astronomie, étoiles et génération de la position aléatoire */
const R=Math.PI/180,$=i=>document.getElementById(i),mx=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),css=a=>`rgb(${a.map(Math.round)})`;
let lat,lon,sc={},biome='desert',eot=0;
const jdOf=d=>d/864e5+2440587.5;
function sun(j){const n=j-2451545,L=((280.46+.9856474*n)%360+360)%360,m=(357.528+.9856003*n)*R,l=(L+1.915*Math.sin(m)+.02*Math.sin(2*m))*R,e=23.439*R;
return{ra:(Math.atan2(Math.cos(e)*Math.sin(l),Math.cos(l))/R+360)%360,dec:Math.asin(Math.sin(e)*Math.sin(l))/R,l:l/R,L}}
const lst=(j,ln)=>(((280.46061837+360.98564736629*(j-2451545)+ln)%360)+360)%360;
function dir(ra,dec,L,la){const h=(L-ra)*R,d=dec*R,p=la*R;return[-Math.cos(d)*Math.sin(h),Math.sin(d)*Math.cos(p)-Math.cos(d)*Math.sin(p)*Math.cos(h),Math.sin(p)*Math.sin(d)+Math.cos(p)*Math.cos(d)*Math.cos(h)]}
const solT=(j,ln)=>{const s=sun(j);return((lst(j,ln)-s.ra+540)%360-180)/15+12};
/* [ascension droite (h), déclinaison (°), magnitude] */
const ST={Pol:[2.53,89.26,2],Du:[11.06,61.75,2],Me:[11.03,56.38,2.4],Ph:[11.9,53.69,2.4],Mg:[12.26,57.03,3.3],Al:[12.9,55.96,1.8],Mi:[13.4,54.93,2.2],Ak:[13.79,49.31,1.9],Ca:[.15,59.15,2.3],Sc:[.68,56.54,2.2],Ga:[.95,60.72,2.5],Ru:[1.43,60.24,2.7],Se:[1.91,63.67,3.4],Ax:[12.44,-63.1,.8],Mm:[12.8,-59.69,1.3],Gc:[12.52,-57.11,1.6],De:[12.25,-58.75,2.8],Ao:[14.66,-60.83,0],Bc:[14.06,-60.37,.6],So:[21.15,-88.96,4.2],Si:[6.75,-16.72,-1.4],Cn:[6.4,-52.7,-.7],Ve:[18.62,38.78,0],Ar:[14.26,19.18,0],Be:[5.92,7.41,.5],Ri:[5.24,-8.2,.1],Cp:[5.28,46,.1]};
const LN=[['Du','Me','Ph','Mg','Du'],['Mg','Al','Mi','Ak'],['Ca','Sc','Ga','Ru','Se'],['Ax','Gc'],['Mm','De'],['Ao','Bc']];
const LB=[['Grande Ourse','Mg'],['Cassiopée','Ga'],['Croix du Sud','Mm'],['Polaris','Pol'],['σ Octantis (pôle sud)','So']];
const FS=Array.from({length:380},()=>[Math.random()*360,Math.asin(Math.random()*2-1)/R,.25+Math.random()*.6]);
function gen(){
  const sg=Math.random()<.5?-1:1;lat=sg*(10+Math.random()*45);lon=Math.random()*360-180;
  biome=['desert','grass','sea'][Math.floor(Math.random()*3)];
  const d0=Date.UTC(2026,0,1,12)+Math.floor(Math.random()*365)*864e5;
  const mk=t=>{let j=jdOf(d0);for(let i=0;i<4;i++)j+=(((t-solT(j,lon))%24+36)%24-12)/24;return j};
  const sa=j=>{const s=sun(j);return Math.asin(dir(s.ra,s.dec,lst(j,lon),lat)[2])/R};
  let j=mk(12);for(let i=0;i<40;i++){const c=mk(12+Math.random()*6-3);if(sa(c)>12){j=c;break}}sc.day=j;
  j=mk(0);for(let i=0;i<40;i++){const c=mk(24+Math.random()*5-2.5);if(sa(c)<-12){j=c;break}}sc.night=j;
  const s=sun(sc.day),d=new Date((sc.day-2440587.5)*864e5);eot=((s.L-s.ra+540)%360-180)*4;
  $('bi').textContent=`Date : ${d.getUTCDate()}/${d.getUTCMonth()+1} · équation du temps : ${eot>0?'+':''}${eot.toFixed(0)} min. Longitude = 15° × (écart − éq. du temps).`;
  yaw=Math.random()*360;pit=15;night=0;$('tg').checked=false;
  ['f1','f2','f3','f4','lo','la'].forEach(i=>$(i).value='');$('vf').disabled=true;
}
