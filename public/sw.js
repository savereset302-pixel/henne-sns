// Honne. Minimal PWA Service Worker
const CACHE_NAME = "honne-cache-v1";
const STATIC_ASSETS = [
    "/",
    "/manifest.json",
    "/icons/icon-192.png",
    "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch(() => {});
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    // Only cache GET requests, bypass API and Firebase calls
    if (event.request.method !== "GET" || event.request.url.includes("/api/") || event.request.url.includes("firestore.googleapis.com")) {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request).then((res) => {
                return res || caches.match("/");
            });
        })
    );
});
