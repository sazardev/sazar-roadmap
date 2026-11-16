/* Service worker generated from scripts/sw-template.js. Do not edit build/client/sw.js. */
const VERSION = __SW_VERSION__;
const PRECACHE_URLS = __PRECACHE_URLS__;

const STATIC_CACHE = `sazar-static-${VERSION}`;
const PAGE_CACHE = `sazar-pages-${VERSION}`;
const IMAGE_CACHE = `sazar-images-${VERSION}`;
const OFFLINE_URL = "/offline";
const PAGE_LIMIT = 80;
const NAVIGATION_TIMEOUT = 3500;

const STATIC_PATHS = new Set(["/favicon.svg", "/apple-touch-icon.png", "/manifest.webmanifest"]);

function isCacheableResponse(response) {
  if (!response?.ok || response.status !== 200) return false;
  if (response.type !== "basic" && response.type !== "default") return false;
  try {
    if (new URL(response.url).origin !== self.location.origin) return false;
  } catch {
    return false;
  }
  const type = response.headers.get("content-type") || "";
  return type.includes("text/html");
}

function isNavigation(request) {
  if (request.method !== "GET") return false;
  if (request.mode !== "navigate") return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/internal/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname === "/logout"
  ) {
    return false;
  }
  return true;
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    STATIC_PATHS.has(url.pathname)
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function trimCache(name, limit) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  await Promise.all(keys.slice(0, keys.length - limit).map((key) => cache.delete(key)));
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("Offline", {
      status: 504,
      statusText: "Offline",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function handleNavigation(request) {
  const cache = await caches.open(PAGE_CACHE);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then(async (response) => {
      if (isCacheableResponse(response)) {
        await cache.put(request, response.clone());
        await trimCache(PAGE_CACHE, PAGE_LIMIT);
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    const fresh = await Promise.race([network, delay(NAVIGATION_TIMEOUT)]);
    if (fresh?.ok) return fresh;
    return cached;
  }

  const fresh = await network;
  if (fresh?.ok) return fresh;

  const offline = await caches.match(OFFLINE_URL);
  if (offline) return offline;

  return new Response("You are offline and this page is not saved.", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

async function cacheUrls(urls) {
  const cache = await caches.open(PAGE_CACHE);
  let saved = 0;
  for (const raw of urls.slice(0, PAGE_LIMIT)) {
    try {
      const url = new URL(raw, self.location.origin);
      if (url.origin !== self.location.origin) continue;
      if (
        url.pathname.startsWith("/api/") ||
        url.pathname.startsWith("/internal/") ||
        url.pathname.startsWith("/auth/") ||
        url.pathname === "/logout"
      ) {
        continue;
      }
      const request = new Request(url.toString(), {
        credentials: "same-origin",
        headers: { Accept: "text/html" },
      });
      const response = await fetch(request);
      if (isCacheableResponse(response)) {
        await cache.put(request, response.clone());
        saved += 1;
      }
    } catch {
      // A single failed page must not abort the rest of the download.
    }
  }
  await trimCache(PAGE_CACHE, PAGE_LIMIT);
  return saved;
}

async function cacheStatus() {
  const [page, images, staticCache] = await Promise.all([
    caches.open(PAGE_CACHE),
    caches.open(IMAGE_CACHE),
    caches.open(STATIC_CACHE),
  ]);
  const [pages, imagesCount, staticCount] = await Promise.all([
    page.keys(),
    images.keys(),
    staticCache.keys(),
  ]);
  return {
    pages: pages.length,
    images: imagesCount.length,
    static: staticCount.length,
    version: VERSION,
  };
}

async function clearOfflinePages() {
  await Promise.all([caches.delete(PAGE_CACHE), caches.delete(IMAGE_CACHE)]);
}

async function clearAllCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: "reload" }));
          } catch {
            // A missing optional asset must not block the service worker install.
          }
        }),
      );
      if (!self.registration.active) await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== PAGE_CACHE && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  const reply = (payload) => {
    if (event.ports?.[0]) event.ports[0].postMessage(payload);
    else if (event.source) event.source.postMessage(payload);
  };

  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }
  if (data.type === "CACHE_URLS") {
    event.waitUntil(
      cacheUrls(Array.isArray(data.urls) ? data.urls : []).then((saved) =>
        reply({ ok: true, saved }),
      ),
    );
    return;
  }
  if (data.type === "GET_CACHE_STATUS") {
    event.waitUntil(cacheStatus().then((status) => reply({ ok: true, ...status })));
    return;
  }
  if (data.type === "CLEAR_PAGES") {
    event.waitUntil(clearOfflinePages().then(() => reply({ ok: true })));
    return;
  }
  if (data.type === "CLEAR_ALL") {
    event.waitUntil(clearAllCaches().then(() => reply({ ok: true })));
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    if (!isNavigation(request)) return;
    event.respondWith(handleNavigation(request));
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  }
});
