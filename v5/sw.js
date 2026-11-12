const V="tope-v5-5";const FILES=["./","index.html","manifest.webmanifest","icon.svg","icon-192.png","icon-512.png","css/app.css","js/core.js","js/ui.js","js/casa.js","js/screens.js","js/forms.js","js/main.js","fonts/oswald-latin-500-normal.woff2","fonts/oswald-latin-600-normal.woff2","fonts/oswald-latin-700-normal.woff2","fonts/barlow-latin-400-normal.woff2","fonts/barlow-latin-500-normal.woff2","fonts/barlow-latin-600-normal.woff2"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(ch=>ch.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
