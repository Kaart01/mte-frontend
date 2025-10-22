const cacheName = "mte-calculator-v1";
const filesToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/icons/frame1-192.png",
  "/icons/image2-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});



