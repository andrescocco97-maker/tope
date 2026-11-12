(function(){
/* dólar MEP: se actualiza solo al abrir la app (y al volver a ella), si pasaron más de 3 horas */
A.fetchFx=async function(force){const c=A.S.cfg;if(!force&&(c.fxAuto===false||Date.now()-(c.fxAt||0)<3*36e5))return false;
 try{const r=await fetch("https://dolarapi.com/v1/dolares/bolsa",{cache:"no-store"});const j=await r.json();const v=Math.round(j.venta||j.compra);if(!(v>0))return false;
  c.fx=v;c.fxAt=Date.now();c.fxAuto=true;A.persist();A.render();return v}catch(e){return false}};
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&A.S.setup)A.fetchFx(false)});
A.$("#fab").addEventListener("click",()=>A.openCarga());
A.render();
if(A.S.setup)A.fetchFx(false);
if(!A.S.setup)setTimeout(()=>A.wizard(),50);
else if(new URLSearchParams(location.search).get("nuevo"))setTimeout(()=>A.openCarga(),80);
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
})();
