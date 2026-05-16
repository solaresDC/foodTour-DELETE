const CACHE = 'ft-v4';
const ASSETS = [
  './index.html',
  './manifest.json',
  './data/tour.jsx',
  './components/UI.jsx',
  './components/Map.jsx',
  './components/Screens.jsx',
  './components/Home.jsx',
  './components/Wallet.jsx',
  './components/App.jsx',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
