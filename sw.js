// sw.js — Life Planner Service Worker
const CACHE_NAME = "life-planner-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/reminders.html",
  "/style.css",
  "/script.js",
  "/reminders.js",
  "/manifest.json"
];

// Install event — cache all important files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Service Worker: Caching app shell");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event — clean up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  console.log("Service Worker: Activated");
});

// Fetch event — serve cached content when offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
