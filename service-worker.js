// service-worker.js

const CACHE_NAME = "mte-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/script_v2.js",
  "/styles.css",
  "/manifest.json",
  "/icons/frame1-192.png",
  "/icons/image2-512.png",
  "/screenshots/portrait.png",
  "/screenshots/landscape.png"
];

// Install: cache static assets
self.addEventListener("install", event => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener("activate", event => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if(key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  return self.clients.claim();
});

// Fetch: respond with cache first, fallback to network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if(cachedResponse) return cachedResponse;

      // Attempt network fetch
      return fetch(event.request).catch(err => {
        console.error("[Service Worker] Fetch failed:", event.request.url, err);
        return new Response("Service unavailable", { status: 503, statusText: "Offline" });
      });
    })
  );
});












