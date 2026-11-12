(function(){
/* dólar MEP: se actualiza solo al abrir la app (y al volver a ella), si pasaron más de 3 horas */
A.fetchFx=async function(force){const c=A.S.cfg;if(!force&&(c.fxAuto===false||Date.now()-(c.fxAt||0)<3*36e5))return false;
 try{const r=await fetch("https://dolarapi.com/v1/dolares/bolsa",{cache:"no-store"});const j=await r.json();const v=Math.round(j.venta||j.compra);if(!(v>0))return false;
  c.fx=v;c.fxAt=Date.now();c.fxAuto=true;A.persist();A.render();return v}catch(e){return false}};
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&A.S.setup){A.render();A.fetchFx(false)}});
A.S.cats.forEach(c=>{if(c.id==="super"&&c.n==="Supermercado")c.n="Súper"});T.migrate(A.S);A.persist();
/* deslizar a los costados cambia de pestaña */
(function(){const ORD=["mov","hoy","metas","pat"];let x0=null,y0=0,go=false,done=false,t0=0;
 const skip=e=>{const t=e.touches&&e.touches[0],W=window.innerWidth;return !!(document.querySelector("#sheet.on")||(t&&(t.clientX<22||t.clientX>W-22))||(e.target.closest&&e.target.closest("input,select,textarea,.ruler,.chips,.tcs,.seg")))};
 function ir(dir){const i=ORD.indexOf(A.S.ui.tab),n=i+dir;if(n<0||n>=ORD.length)return;
  A.S.ui.tab=ORD[n];A.persist();A.render();window.scrollTo(0,0);
  const el=document.getElementById("s-"+ORD[n]);try{el&&el.animate([{transform:"translateX("+(dir>0?36:-36)+"px)",opacity:.2},{transform:"none",opacity:1}],{duration:matchMedia("(prefers-reduced-motion:reduce)").matches?1:200,easing:"ease-out"})}catch(_){}}
 document.addEventListener("touchstart",e=>{if(e.touches.length!==1||skip(e)){x0=null;return}const t=e.touches[0];x0=t.clientX;y0=t.clientY;t0=Date.now();done=false},{passive:true});
 /* se decide mientras el dedo se mueve: no depende de que el navegador mande el touchend */
 document.addEventListener("touchmove",e=>{if(x0==null||done)return;const t=e.touches[0],dx=t.clientX-x0,dy=t.clientY-y0;
  if(Math.abs(dy)>40&&Math.abs(dy)>Math.abs(dx)){x0=null;return}
  if(Math.abs(dx)>=44&&Math.abs(dx)>Math.abs(dy)*1.1){done=true;ir(dx<0?1:-1)}},{passive:true});
 const fin=()=>{x0=null};document.addEventListener("touchend",fin,{passive:true});document.addEventListener("touchcancel",fin,{passive:true});})();
A.$("#fab").addEventListener("click",()=>A.openCarga());
A.render();
if(A.S.setup)A.fetchFx(false);
if(!A.S.setup)setTimeout(()=>A.wizard(),50);
else if(new URLSearchParams(location.search).get("nuevo"))setTimeout(()=>A.openCarga(),80);
if("serviceWorker" in navigator&&location.protocol.startsWith("http")){const had=!!navigator.serviceWorker.controller;navigator.serviceWorker.register("sw.js",{updateViaCache:"none"}).then(r=>{r.update()}).catch(()=>{});
 navigator.serviceWorker.addEventListener("controllerchange",()=>{if(!had||window._rl)return;window._rl=1;const go=()=>{if(document.querySelector("#sheet.on")){setTimeout(go,2500);return}location.reload()};go()})}
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
})();
