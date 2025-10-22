// service-worker.js

self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  self.skipWaiting(); // activate immediately
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  return self.clients.claim(); // take control immediately
});

// Fetch handler: bypass cache for index.html and script.js
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  if (url.endsWith("index.html") || url.endsWith("script.js")) {
    // Always fetch a fresh copy from the network
    event.respondWith(fetch(event.request));
  } else {
    // Normal network-first strategy
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});




