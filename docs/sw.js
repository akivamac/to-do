const CACHE_NAME = 'peaceful-tasks-v1';
const urlsToCache = ['/', '/index.html', '/manifest.json'];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
    console.log('Cache opened');
    return cache.addAll(urlsToCache);
  }).catch((error) => {
    console.log('Cache failed:', error);
  }));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((cacheNames) => {
    return Promise.all(cacheNames.map((cacheName) => {
      if (cacheName !== CACHE_NAME) {
        console.log('Deleting old cache:', cacheName);
        return caches.delete(cacheName);
      }
    }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).then((response) => {
    if (!response || response.status !== 200) return response;
    const responseToCache = response.clone();
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(event.request, responseToCache);
    });
    return response;
  }).catch(() => {
    return caches.match(event.request).then((response) => {
      return response || new Response('Offline - resource not available', {status: 503, statusText: 'Service Unavailable'});
    });
  }));
});
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
