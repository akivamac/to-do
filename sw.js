const CACHE_NAME = 'peaceful-tasks-v2';
const ASSETS = [
    '/to-do/',
    '/to-do/index.html',
    '/to-do/styles.css',
    '/to-do/app.js',
    '/to-do/tasks.js',
    '/to-do/alarms.js',
    '/to-do/projects.js',
    '/to-do/notes.js',
    '/to-do/backside.js',
    '/to-do/manifest.json',
    '/to-do/icon-192.png',
    '/to-do/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});
