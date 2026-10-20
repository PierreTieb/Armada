/* Sextant : vue dans la lunette + limbe gradué (degrés) + tambour (dixièmes) */
const Sext=(()=>{
  const K=3.2,CX=180,CY=600,ns='http://www.w3.org/2000/svg';
  let arc='',drum='';
  for(let a=0;a<=90;a+=.5){const maj=a%1==0,five=a%5==0;
    arc+=`<g transform="rotate(${a*K} ${CX} ${CY})"><line x1="${CX}" y1="${CY-560}" x2="${CX}" y2="${CY-(five?528:maj?536:548)}" stroke-width="${five?2.4:maj?1.6:1}"/>${maj?`<text x="${CX}" y="${CY-512}" class="${five?'b':''}">${a}</text>`:''}</g>`}
  for(let i=-12;i<=22;i++){const x=CX+i*34;drum+=`<line x1="${x}" y1="8" x2="${x}" y2="24" stroke-width="2"/><line x1="${x+17}" y1="8" x2="${x+17}" y2="16" stroke-width="1"/><text x="${x}" y="50">${(i%10+10)%10}</text>`}
    $('sext').innerHTML=`<div id="eye"><svg viewBox="-100 -100 200 200" aria-hidden="true">
    <g class="ret"><line x1="-100" y1="0" x2="-12" y2="0"/><line x1="12" y1="0" x2="100" y2="0"/><line x1="0" y1="-100" x2="0" y2="-12"/><line x1="0" y1="12" x2="0" y2="100"/><circle r="6"/>
    ${[-80,-60,-40,-20,20,40,60,80].map(v=>`<line x1="${v}" y1="-2.5" x2="${v}" y2="2.5"/>`).join('')}</g></svg></div>
  <div id="sxp">
    <p class="sx-cap">Glisse pour placer l’étoile au centre, règle avec les boutons.<br>Lis les <b>degrés</b> sur le limbe, puis les <b>dixièmes</b> sur le tambour.</p>
    <svg id="sxa" viewBox="0 0 360 118" aria-label="Limbe gradué en degrés">
      <defs><clipPath id="sxc"><rect x="6" y="0" width="348" height="118" rx="14"/></clipPath>
      <linearGradient id="sxl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf8ef"/><stop offset="1" stop-color="#e2dac6"/></linearGradient></defs>
      <g clip-path="url(#sxc)"><circle cx="${CX}" cy="${CY}" r="568" fill="url(#sxl)"/><circle cx="${CX}" cy="${CY}" r="500" fill="#d9a441"/><circle cx="${CX}" cy="${CY}" r="500" fill="none" stroke="#8a5d12" stroke-width="2"/>
      <g id="sxag" class="ticks">${arc}</g></g>
      <path d="M${CX} 34 L${CX-9} 18 L${CX+9} 18Z" fill="#c0392b"/><line x1="${CX}" y1="30" x2="${CX}" y2="74" stroke="#c0392b" stroke-width="2.5"/>
    </svg>
    <svg id="sxd" viewBox="0 0 360 64" aria-label="Tambour gradué en dixièmes de degré">
      <defs><linearGradient id="sxg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfc6b0"/><stop offset=".3" stop-color="#fbf8ef"/><stop offset=".7" stop-color="#f1ead8"/><stop offset="1" stop-color="#bdb39b"/></linearGradient>
      <clipPath id="sxdc"><rect x="6" y="0" width="348" height="64" rx="12"/></clipPath></defs>
      <rect x="6" y="0" width="348" height="64" rx="12" fill="url(#sxg)"/><g clip-path="url(#sxdc)"><g id="sxdg" class="ticks">${drum}</g></g>
      <rect x="6" y="0" width="348" height="64" rx="12" fill="none" stroke="#8a5d12" stroke-width="2"/>
      <line x1="${CX}" y1="0" x2="${CX}" y2="28" stroke="#c0392b" stroke-width="2.5"/><path d="M${CX} 34 L${CX-7} 26 L${CX+7} 26Z" fill="#c0392b"/>
    </svg>
    <div class="sx-btns"><button data-d="-1">−1°</button><button data-d="-0.1">−0,1°</button><button data-d="0.1">+0,1°</button><button data-d="1">+1°</button></div>
  </div>`;
  const eye=$('eye'),ag=$('sxag'),dg=$('sxdg');let last='';
  $('sext').querySelector('.sx-btns').onclick=e=>{const b=e.target.closest('button');if(!b)return;pit=Math.max(0,Math.min(90,Math.round((pit+parseFloat(b.dataset.d))*10)/10));tp=null};
  return{upd(){
    const on=tool=='sext';$('sext').hidden=!on;if(!on)return;
    const r=Math.min(W*.42,H*.24),key=[W,H,vy|0,pit.toFixed(3)].join();if(key==last)return;last=key;
    Object.assign(eye.style,{width:2*r+'px',height:2*r+'px',left:W/2-r+'px',top:vy-r+'px'});
    ag.setAttribute('transform',`rotate(${-pit*K} ${CX} ${CY})`);
    dg.setAttribute('transform',`translate(${-((pit*10)%10)*34} 0)`)}}})();
