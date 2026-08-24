// Kill-switch service worker.
//
// An earlier version of this site (jekyll-theme-chirpy) registered a PWA
// service worker at this URL that cached every page with a cache-first
// strategy. Browsers that visited back then still have it installed, so they
// keep serving the old site from Cache Storage forever unless hard-reloaded.
//
// Browsers periodically re-fetch the registered service-worker script; when
// they pick up this replacement it activates immediately, wipes all caches,
// unregisters itself, and reloads any open tabs so they load the live site.
//
// This file must stay deployed at the site root indefinitely (a 404 here does
// NOT remove the old worker — only a successfully installed replacement does).
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
