/* Astronomie, catalogue d'étoiles et génération de la position aléatoire */
const R=Math.PI/180,$=i=>document.getElementById(i),mx=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),css=a=>`rgb(${a.map(Math.round)})`;
let lat,lon,sc={},biome='desert',eot=0;
const jdOf=d=>d/864e5+2440587.5;
function sun(j){const n=j-2451545,L=((280.46+.9856474*n)%360+360)%360,m=(357.528+.9856003*n)*R,l=(L+1.915*Math.sin(m)+.02*Math.sin(2*m))*R,e=23.439*R;
return{ra:(Math.atan2(Math.cos(e)*Math.sin(l),Math.cos(l))/R+360)%360,dec:Math.asin(Math.sin(e)*Math.sin(l))/R,l:l/R,L}}
const lst=(j,ln)=>(((280.46061837+360.98564736629*(j-2451545)+ln)%360)+360)%360;
/* direction locale [Est, Nord, Zénith] */
function dir(ra,dec,L,la){const h=(L-ra)*R,d=dec*R,p=la*R;return[-Math.cos(d)*Math.sin(h),Math.sin(d)*Math.cos(p)-Math.cos(d)*Math.sin(p)*Math.cos(h),Math.sin(p)*Math.sin(d)+Math.cos(p)*Math.cos(d)*Math.cos(h)]}
const solT=(j,ln)=>{const s=sun(j);return((lst(j,ln)-s.ra+540)%360-180)/15+12};
function moonDir(j,L){const s=sun(j),el=((j-2451550.1)/29.53059%1)*360,l=(s.l+el)*R,e=23.44*R;
  return dir(Math.atan2(Math.cos(e)*Math.sin(l),Math.cos(l))/R,Math.asin(Math.sin(e)*Math.sin(l))/R,L,lat)}

/* Étoiles brillantes : [ascension droite (h), déclinaison (°), magnitude] */
const ST={
 Pol:[2.530,89.26,2],Yil:[17.537,86.59,4.4],eUM:[16.766,82.04,4.2],zUM:[15.734,77.79,4.3],hUM:[16.292,75.76,5],Koc:[14.845,74.16,2.1],Phk:[15.345,71.83,3],
 Dub:[11.062,61.75,1.8],Mer:[11.031,56.38,2.4],Phe:[11.897,53.69,2.4],Meg:[12.257,57.03,3.3],Ali:[12.9,55.96,1.8],Miz:[13.399,54.93,2.2],Alk:[13.792,49.31,1.9],
 Cap:[.153,59.15,2.3],Sch:[.675,56.54,2.2],gCa:[.945,60.72,2.2],Ruc:[1.43,60.24,2.7],Seg:[1.907,63.67,3.4],
 Ald:[21.31,62.59,2.5],Alf:[21.478,70.56,3.2],Err:[23.656,77.63,3.2],iCe:[22.828,66.2,3.5],zCe:[22.181,58.2,3.4],
 Ras:[17.507,52.3,2.8],Elt:[17.943,51.49,2.2],Gru:[17.892,56.87,3.75],nDr:[17.536,55.18,4.9],Alt:[19.209,67.66,3.1],Adb:[17.146,65.71,3.2],hDr:[16.4,61.51,2.7],Eda:[15.415,58.97,3.3],Thu:[14.073,64.38,3.7],kDr:[12.558,69.79,3.9],lDr:[11.523,69.33,3.8],
 Den:[20.69,45.28,1.25],Sad:[20.37,40.26,2.2],eCy:[20.77,33.97,2.5],dCy:[19.75,45.13,2.9],Alb:[19.512,27.96,3.1],
 Veg:[18.616,38.78,0],zLy:[18.746,37.6,4.3],dLy:[18.908,36.9,4.3],gLy:[18.982,32.69,3.2],bLy:[18.835,33.36,3.5],
 Atr:[19.846,8.87,.8],Tar:[19.771,10.61,2.7],Als:[19.922,6.41,3.7],zAq:[19.09,13.86,3],dAq:[19.425,3.11,3.4],lAq:[19.104,-4.88,3.4],
 Bet:[5.919,7.41,.5],Rig:[5.242,-8.2,.1],Bel:[5.419,6.35,1.6],Min:[5.533,-.3,2.2],Anl:[5.603,-1.2,1.7],Ank:[5.679,-1.94,1.8],Sai:[5.796,-9.67,2.1],Mei:[5.585,9.93,3.4],
 Sir:[6.752,-16.72,-1.46],Mir:[6.378,-17.96,2],Adh:[6.977,-28.97,1.5],Wez:[7.14,-26.39,1.8],Alu:[7.402,-29.3,2.4],
 Cas:[7.577,31.89,1.6],Pox:[7.755,28.03,1.1],Alh:[6.629,16.4,1.9],Meb:[6.732,25.13,3],Tej:[6.383,22.51,2.9],Was:[7.335,21.98,3.5],
 Alb2:[4.599,16.51,.85],Eln:[5.438,28.61,1.65],zTa:[5.627,21.14,3],Ain:[4.477,19.18,3.5],gTa:[4.33,15.63,3.6],
 Cpl:[5.278,46,.1],Mnk:[5.992,44.95,1.9],tAu:[5.995,37.21,2.6],Has:[4.95,33.17,2.7],eAu:[5.032,43.82,3],
 Reg:[10.139,11.97,1.35],Dnb:[11.818,14.57,2.1],Alg:[10.333,19.84,2],Zos:[11.235,20.52,2.6],Che:[11.237,15.43,3.3],hLe:[10.122,16.76,3.5],Adf:[10.278,23.42,3.4],Rsl:[9.879,26.01,3.9],eLe:[9.764,23.77,3],
 Arc:[14.261,19.18,-.05],Iza:[14.75,27.07,2.4],Nek:[15.032,40.39,3.5],Sgn:[14.535,38.31,3],dBo:[15.258,33.31,3.5],Muf:[13.911,18.4,2.7],
 Spi:[13.42,-11.16,1],Por:[12.694,-1.45,2.7],Vin:[13.036,10.96,2.8],Zan:[12.332,-.67,3.9],dVi:[12.927,3.4,3.4],
 Ant:[16.49,-26.43,1],Gra:[16.091,-19.81,2.6],Dsc:[16.006,-22.62,2.3],pSc:[15.981,-26.11,2.9],sSc:[16.353,-25.59,2.9],tSc:[16.598,-28.22,2.8],eSc:[16.836,-34.29,2.3],mSc:[16.864,-38.05,3],zSc:[16.91,-42.36,3.6],hSc:[17.203,-43.24,3.3],Sar:[17.622,-43,1.9],iSc:[17.793,-40.13,3],kSc:[17.708,-39.03,2.4],Sha:[17.56,-37.1,1.6],Les:[17.513,-37.3,2.7],
 KAu:[18.403,-34.38,1.8],Nun:[18.921,-26.3,2],Asc:[19.043,-29.88,2.6],KMe:[18.35,-29.83,2.7],KBo:[18.466,-25.42,2.8],Aln:[18.097,-30.42,3],pSg:[18.761,-26.99,3.2],tSg:[19.116,-27.67,3.3],
 Acr:[12.443,-63.1,.8],Mim:[12.795,-59.69,1.25],Gac:[12.519,-57.11,1.6],Ima:[12.252,-58.75,2.8],
 aCe:[14.66,-60.84,-.27],Had:[14.064,-60.37,.6],eCe:[13.665,-53.47,2.3],zCe2:[13.926,-47.29,2.6],Mnt:[14.111,-36.37,2.1],gCe:[12.692,-48.96,2.2],dCe:[12.14,-50.72,2.6],
 sOc:[21.147,-88.96,5.4],nOc:[21.691,-77.39,3.8],bOc:[22.768,-81.38,4.1],dOc:[14.449,-83.67,4.3],
 Atri:[16.811,-69.03,1.9],bTr:[15.919,-63.43,2.8],gTr:[15.315,-68.68,2.9],
 Mrk:[23.079,15.21,2.5],Sht:[23.063,28.08,2.4],Agn:[.22,15.18,2.8],Alp:[.14,29.09,2.1],Mic:[1.162,35.62,2.1],Alm:[2.065,42.33,2.1],dAn:[.656,30.86,3.3],
 Mfk:[3.405,49.86,1.8],Alo:[3.136,40.96,2.1],Fom:[22.961,-29.62,1.2],Pro:[7.655,5.22,.34],Ach:[1.629,-57.24,.46],Can:[6.399,-52.7,-.74],Pea:[20.427,-56.74,1.9],Anr:[22.137,-46.96,1.7]};
/* tracés des constellations */
const LN=[['Pol','Yil','eUM','zUM','hUM','Phk','Koc','zUM'],['Dub','Mer','Phe','Meg','Dub'],['Meg','Ali','Miz','Alk'],['Cap','Sch','gCa','Ruc','Seg'],
 ['Ald','Alf','Err','iCe','zCe','Ald'],['Alf','iCe'],['Ras','Elt','Gru','nDr','Ras'],['Gru','Alt','Adb','hDr','Eda','Thu','kDr','lDr'],
 ['Den','Sad','Alb'],['dCy','Sad','eCy'],['Veg','zLy','bLy','gLy','dLy','zLy'],['zAq','Tar','Atr','Als'],['Atr','dAq','lAq'],
 ['Bet','Mei','Bel'],['Bet','Ank','Sai'],['Bel','Min','Anl','Ank'],['Min','Rig'],['Mir','Sir','Wez','Adh'],['Wez','Alu'],
 ['Cas','Meb','Tej'],['Pox','Was','Alh'],['Eln','Ain','gTa','Alb2','zTa'],['Cpl','Mnk','tAu','Eln','Has','eAu','Cpl'],
 ['Reg','hLe','Alg','Adf','Rsl','eLe'],['Alg','Zos','Dnb','Che','Reg'],['Arc','Iza','dBo','Nek','Sgn','Arc'],['Arc','Muf'],
 ['Spi','Por','Zan'],['Por','dVi','Vin'],['Gra','Dsc','pSc'],['Dsc','sSc','Ant','tSc','eSc','mSc','zSc','hSc','Sar','iSc','kSc','Sha','Les'],
 ['Aln','KMe','KBo','pSg','Nun','tSg','Asc','pSg'],['KMe','KAu','Aln'],['KAu','Asc'],['Gac','Acr'],['Mim','Ima'],
 ['aCe','Had','eCe','gCe','dCe'],['eCe','zCe2','Mnt'],['nOc','bOc','dOc','nOc'],['Atri','bTr','gTr','Atri'],
 ['Mrk','Sht','Alp','Agn','Mrk'],['Alp','dAn','Mic','Alm']];
/* fond d'étoiles faibles, concentré le long de la Voie lactée */
const GAL=[[-.0548755604,.4941094279,-.867666149],[-.8734370902,-.44482963,-.1980763734],[-.4838350155,.7469822445,.4559837762]];
const FS=(()=>{const a=[],g=()=>{let s=0;for(let i=0;i<6;i++)s+=Math.random();return s-3},
  m=()=>Math.log10(Math.pow(10,1.75)+Math.random()*(Math.pow(10,3.25)-Math.pow(10,1.75)))/.5;
  for(let i=0;i<2600;i++){let ra,de;
    if(i%5<2){const l=Math.random()*2*Math.PI,b=g()*7*R,v=[Math.cos(b)*Math.cos(l),Math.cos(b)*Math.sin(l),Math.sin(b)],e=GAL.map(r=>r[0]*v[0]+r[1]*v[1]+r[2]*v[2]);
      ra=Math.atan2(e[1],e[0])/R;de=Math.asin(e[2])/R}
    else{ra=Math.random()*360;de=Math.asin(Math.random()*2-1)/R}
    a.push([ra,de,m()])}return a})();
/* nuée diffuse de la Voie lactée : [ra°, dec°, intensité] */
const MW=(()=>{const a=[],g=()=>{let s=0;for(let i=0;i<4;i++)s+=Math.random();return(s-2)/1.15};
  for(let i=0;i<9000;i++){const l=Math.random()*2*Math.PI,core=Math.pow(Math.cos((l-0)/2),2),b=g()*(4+5*core)*R,v=[Math.cos(b)*Math.cos(l),Math.cos(b)*Math.sin(l),Math.sin(b)],e=GAL.map(r=>r[0]*v[0]+r[1]*v[1]+r[2]*v[2]);
    a.push([Math.atan2(e[1],e[0])/R,Math.asin(e[2])/R,(.35+.65*core)*(.5+Math.random()*.5)])}return a})();

/* biome cohérent avec les coordonnées : mer hors des terres, désert en Afrique (et Arabie), herbe ailleurs */
function onLand(la,lo){let c=0;for(const r of LAND)for(let i=0,j=r.length-2;i<r.length;j=i,i+=2){const xi=r[i],yi=r[i+1],xj=r[j],yj=r[j+1];if((yi>la)!=(yj>la)&&lo<(xj-xi)*(la-yi)/(yj-yi)+xi)c^=1}return!!c}
const bioAt=(la,lo)=>!onLand(la,lo)?'sea':lo>-18&&lo<56&&la>-36&&la<37&&!(la>31&&lo>26)?'desert':'grass';
function gen(){
  const want=['desert','grass','sea'][Math.floor(Math.random()*3)];
  for(let k=0;k<5000;k++){const sg=Math.random()<.5?-1:1;lat=sg*(10+Math.random()*45);lon=Math.random()*360-180;if(bioAt(lat,lon)==want)break}
  biome=bioAt(lat,lon);
  const d0=Date.UTC(2026,0,1,12)+Math.floor(Math.random()*365)*864e5;
  const mk=t=>{let j=jdOf(d0);for(let i=0;i<4;i++)j+=(((t-solT(j,lon))%24+36)%24-12)/24;return j};
  const sa=j=>{const s=sun(j);return Math.asin(dir(s.ra,s.dec,lst(j,lon),lat)[2])/R};
  let j=mk(12);for(let i=0;i<40;i++){const c=mk(12+Math.random()*6-3);if(sa(c)>12){j=c;break}}sc.day=j;
  j=mk(0);for(let i=0;i<40;i++){const c=mk(24+Math.random()*5-2.5);if(sa(c)<-12){j=c;break}}sc.night=j;
  const s=sun(sc.day),d=new Date((sc.day-2440587.5)*864e5);eot=((s.L-s.ra+540)%360-180)*4;
  $('bi').innerHTML=`Date : <b>${d.getUTCDate()}/${d.getUTCMonth()+1}</b><br>Équation du temps : <b>${eot>0?'+':''}${eot.toFixed(0)} min</b>`;
  yaw=Math.random()*360;pit=15;night=0;$('tg').checked=false;
  ['f1','f2','f3','f4','lo','la'].forEach(i=>$(i).value='');$('vf').disabled=true;
  World.build();
}
