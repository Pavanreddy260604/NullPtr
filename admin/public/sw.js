const CACHE_NAME = 'nullptr-admin-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png'
];

// Install Event - Cache Static Assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event - Network First for API, Cache First for specific assets, Network First fallback for others
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 1. API Calls -> Network First (Critical for Admin Panel)
    if (url.pathname.startsWith('/api/') || url.hostname.includes('backend')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // Optional: Return custom offline JSON response if needed
                    return new Response(JSON.stringify({ error: 'Network Error' }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }

    // 2. Images/Fonts -> Cache First (Performance)
    if (
        event.request.destination === 'image' ||
        event.request.destination === 'font'
    ) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || fetch(event.request).then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }

    // 3. HTML/JS/CSS -> Network First with Cache Fallback (Ensure latest version for Admin)
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                return caches.match(event.request).then((cachedResponse) => {
                    // If offline and requesting navigation (HTML), can return a custom offline page
                    // For now, return cached index.html or whatever we have
                    if (cachedResponse) return cachedResponse;
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});
