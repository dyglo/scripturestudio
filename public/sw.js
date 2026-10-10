const CACHE = "scripture-studio-v1";
const ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/fonts/editorial.ttf",
  "/images/lake.jpg",
  "/images/mountain.jpg",
  "/images/forest.jpg",
  "/images/sunrise.jpg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(ASSETS);
      const page = await cache.match("/");
      const html = await page.text();
      const paths = [
        ...new Set(
          [...html.matchAll(/(?:src|href)="([^"\s]+)"/g)]
            .map((m) => m[1].replaceAll("&amp;", "&"))
            .filter((p) => p.startsWith("/_next/static/")),
        ),
      ];
      await cache.addAll(paths);
    })(),
  );
  self.skipWaiting();
});
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys())
        if (name.startsWith("scripture-studio-") && name !== CACHE)
          await caches.delete(name);
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin
  )
    return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      if (event.request.mode === "navigate") {
        try {
          const response = await fetch(event.request);
          if (response.ok) await cache.put("/", response.clone());
          return response;
        } catch {
          return (await cache.match("/")) || Response.error();
        }
      }
      const cached = await cache.match(event.request);
      if (cached) return cached;
      try {
        const response = await fetch(event.request);
        if (response.ok) await cache.put(event.request, response.clone());
        return response;
      } catch {
        return Response.error();
      }
    })(),
  );
});
