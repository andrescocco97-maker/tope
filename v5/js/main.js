(function(){
A.$("#fab").addEventListener("click",()=>A.openCarga());
A.render();
if(!A.S.setup)setTimeout(()=>A.wizard(),50);
else if(new URLSearchParams(location.search).get("nuevo"))setTimeout(()=>A.openCarga(),80);
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
})();
