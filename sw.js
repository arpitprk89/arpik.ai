const C='arpik-v8',F=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png','arpik-ai.png'],X=['cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const q=e.request,u=new URL(q.url),same=u.origin==location.origin;if(q.method!='GET'||(!same&&!X.includes(u.hostname)))return;
const net=fetch(q).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(q,c)).catch(()=>{})}return r});
const old=()=>caches.match(q).then(r=>r||(same&&q.mode=='navigate'?caches.match('index.html').then(h=>h||caches.match('./')):Response.error()));
e.respondWith(same?Promise.race([net.catch(old),new Promise(r=>setTimeout(()=>r(old()),4000))]).then(r=>r||net):net.catch(old))});
