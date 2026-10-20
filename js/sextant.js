/* Sextant : vue dans la lunette + limbe gradué au dixième de degré */
const Sext=(()=>{
  const K=8,CX=180,CY=660;
  /* seules les graduations proches de l'angle visé sont dessinées (l'échelle grossie ferait plusieurs tours) */
  const ticks=p=>{let s='';for(let i=Math.max(0,Math.floor((p-3)*10));i<=Math.min(900,Math.ceil((p+3)*10));i++){const deg=i%10==0,half=i%5==0;
    s+=`<g transform="rotate(${((i/10-p)*K).toFixed(2)} ${CX} ${CY})"><line x1="${CX}" y1="${CY-634}" x2="${CX}" y2="${CY-(deg?600:half?612:622)}" stroke-width="${deg?2.6:half?1.7:1.1}"/>${deg?`<text x="${CX}" y="${CY-580}">${i/10}°</text>`:''}</g>`}return s};
  $('sext').innerHTML=`<div id="eye"><svg viewBox="-100 -100 200 200" aria-hidden="true">
    <g class="ret"><line x1="-100" y1="0" x2="-12" y2="0"/><line x1="12" y1="0" x2="100" y2="0"/><line x1="0" y1="-100" x2="0" y2="-12"/><line x1="0" y1="12" x2="0" y2="100"/><circle r="6"/></g></svg></div>
  <div id="sxp">
    <svg id="sxa" viewBox="0 0 360 96" aria-label="Limbe du sextant gradué en dixièmes de degré">
      <defs><clipPath id="sxc"><rect x="4" y="0" width="352" height="96" rx="14"/></clipPath>
      <linearGradient id="sxl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf8ef"/><stop offset="1" stop-color="#e6dfcc"/></linearGradient></defs>
      <g clip-path="url(#sxc)"><circle cx="${CX}" cy="${CY}" r="640" fill="url(#sxl)"/><circle cx="${CX}" cy="${CY}" r="566" fill="#d9a441"/><circle cx="${CX}" cy="${CY}" r="566" fill="none" stroke="#8a5d12" stroke-width="2"/>
      <g id="sxag" class="ticks"></g></g>
      <path d="M${CX} 22 L${CX-8} 8 L${CX+8} 8Z" fill="#c0392b"/><line x1="${CX}" y1="18" x2="${CX}" y2="62" stroke="#c0392b" stroke-width="2"/>
    </svg>
    <p class="sx-cap">Petit trait = 0,1° · glisse pour viser · molette ou pincement pour zoomer</p>
  </div>`;
  const eye=$('eye'),ag=$('sxag');let last='';
  return{upd(){
    const on=tool=='sext'&&!O3.bag;$('sext').hidden=!on;if(!on)return;
    const r=Math.min(W*.42,H*.28),key=[W,H,vy|0,pit.toFixed(3)].join();if(key==last)return;last=key;
    Object.assign(eye.style,{width:2*r+'px',height:2*r+'px',left:W/2-r+'px',top:vy-r+'px'});
    ag.innerHTML=ticks(pit)}}})();
