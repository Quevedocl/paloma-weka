// Service worker de Paloma Weka: recibe los avisos push y abre la app al tocarlos
const CACHE = 'paloma-v4';
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest']).catch(() => {}))); self.skipWaiting(); });
// Red primero para la app; si no hay conexión, se abre la última copia guardada
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./'))));
});
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
 
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data.json(); } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Paloma Weka', {
    body: d.body || 'Llegó una paloma con una carta',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [120, 60, 120],
    data: { url: d.url || './' }
  }));
});
 
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const lista = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of lista) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow((e.notification.data && e.notification.data.url) || './');
  })());
});
 
