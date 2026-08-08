const CACHE="english-qr-reader-v214-20260808162341";
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{if(e.request.mode==="navigate")e.respondWith(fetch(e.request,{cache:"no-store"}));});
