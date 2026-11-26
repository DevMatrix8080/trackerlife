// Service worker di AquaMacro: app shell offline + click sulle notifiche.
// Solo risorse della stessa origine; Supabase (cross-origin) e i dati personali NON vengono mai messi in cache.
const CACHE = 'aquamacro-v1';
const SCOPE = self.registration.scope;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([SCOPE, SCOPE + 'icon.svg', SCOPE + 'icon-192.png'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const r = e.request;
  const url = new URL(r.url);
  if (r.method !== 'GET' || url.origin !== location.origin || !url.href.startsWith(SCOPE)) return;

  if (r.mode === 'navigate') {
    // pagina: prima la rete (versione aggiornata), se offline l'ultima copia
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(SCOPE, c)); return res; }).catch(() => caches.match(SCOPE)));
    return;
  }
  // asset (JS/CSS/font/icone): subito dalla cache, aggiornati in background
  e.respondWith(caches.match(r).then(hit => {
    const net = fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const open = cs.find(c => c.url.startsWith(SCOPE));
    return open ? open.focus() : self.clients.openWindow(SCOPE);
  }));
});
