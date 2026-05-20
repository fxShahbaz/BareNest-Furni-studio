// BareNest service worker. Production-only — the registration script
// skips this in development to avoid stale dev assets.
//
// Cache strategy by resource class:
//
//   1. Next static chunks (/_next/static/*) — cache-first, immutable.
//      These are fingerprinted so we cache them forever in our own
//      versioned bucket and they're cleaned up when CACHE_VERSION bumps.
//
//   2. Google Fonts CSS + font files — cache-first.
//
//   3. Images (Unsplash + Supabase product-images bucket + same-origin
//      /icon, /apple-icon, /opengraph-image) — stale-while-revalidate.
//      Returns cache instantly, refreshes in background.
//
//   4. HTML documents (GET to a same-origin route) — network-first
//      with a 2.5s timeout, falls back to cache for the offline /
//      flaky-network case.
//
//   5. Everything else (server actions, /api/*, /admin/*) — bypass.
//
// To force-bust the entire cache across all clients, bump CACHE_VERSION.

const CACHE_VERSION = "v2";
const STATIC_CACHE = `bn-static-${CACHE_VERSION}`;
const IMAGES_CACHE = `bn-images-${CACHE_VERSION}`;
const FONTS_CACHE = `bn-fonts-${CACHE_VERSION}`;
const HTML_CACHE = `bn-html-${CACHE_VERSION}`;
const AUDIO_CACHE = `bn-audio-${CACHE_VERSION}`;

const ALL_CACHES = [STATIC_CACHE, IMAGES_CACHE, FONTS_CACHE, HTML_CACHE, AUDIO_CACHE];

// Pre-warmed at install time so the very first landing-page play() hits a
// cached copy. Add other audio paths here if more are introduced.
const PRECACHE_AUDIO = ["/audio/landing.mp3"];

const NETWORK_TIMEOUT_MS = 2500;

const BYPASS_PATHS = ["/admin", "/api/", "/auth/", "/_next/data"];
const BYPASS_HOSTS = [/^.*\.supabase\.co$/]; // anything except product-images,
                                              // which is handled separately below

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(AUDIO_CACHE);
        // addAll is atomic — if one fetch fails the rest are rolled back.
        // Use individual adds with catch so a missing file doesn't kill
        // SW installation.
        await Promise.all(
          PRECACHE_AUDIO.map((href) =>
            cache.add(new Request(href, { cache: "reload" })).catch(() => {})
          )
        );
      } catch {
        // Cache API unavailable — fall back to runtime cache-first.
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n.startsWith("bn-") && !ALL_CACHES.includes(n))
          .map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Bypass anything we shouldn't cache.
  if (BYPASS_PATHS.some((p) => url.pathname.startsWith(p))) return;
  if (BYPASS_HOSTS.some((re) => re.test(url.hostname))) {
    // Exception: Supabase product-images bucket is public + safe to cache.
    if (!url.pathname.includes("/storage/v1/object/public/product-images/")) {
      return;
    }
  }
  if (req.headers.get("upgrade") === "websocket") return;

  // Image requests — stale-while-revalidate.
  if (
    req.destination === "image" ||
    url.hostname === "images.unsplash.com" ||
    url.pathname.includes("/storage/v1/object/public/product-images/") ||
    url.pathname.startsWith("/icon") ||
    url.pathname.startsWith("/apple-icon") ||
    url.pathname.includes("opengraph-image") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg")
  ) {
    event.respondWith(staleWhileRevalidate(req, IMAGES_CACHE));
    return;
  }

  // Next static chunks (immutable, fingerprinted) — cache-first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // Audio assets in /audio/* — cache-first, served immutable from /public.
  // Audio elements occasionally issue range requests; we skip those and
  // let them go to the network so seek/range semantics stay correct.
  if (
    (req.destination === "audio" ||
      url.pathname.startsWith("/audio/") ||
      url.pathname.endsWith(".mp3") ||
      url.pathname.endsWith(".m4a") ||
      url.pathname.endsWith(".ogg") ||
      url.pathname.endsWith(".wav")) &&
    !req.headers.has("range")
  ) {
    event.respondWith(cacheFirst(req, AUDIO_CACHE));
    return;
  }

  // Fonts — cache-first.
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com" ||
    req.destination === "font"
  ) {
    event.respondWith(cacheFirst(req, FONTS_CACHE));
    return;
  }

  // HTML documents — network-first with cache fallback.
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(networkFirst(req, HTML_CACHE));
    return;
  }
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok && res.status === 200 && res.type !== "opaque") {
      cache.put(req, res.clone());
    }
    return res;
  } catch (err) {
    return new Response("", { status: 504, statusText: "Gateway Timeout" });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((res) => {
      if (res.ok && res.status === 200) cache.put(req, res.clone());
      return res;
    })
    .catch(() => hit); // network down + nothing cached = let it fail upstream
  return hit || fetchPromise;
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await Promise.race([
      fetch(req),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), NETWORK_TIMEOUT_MS)
      ),
    ]);
    if (res && res.ok && res.status === 200) {
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    const hit = await cache.match(req);
    if (hit) return hit;
    return new Response(
      "<!doctype html><meta charset=utf-8><title>Offline</title><h1>You appear to be offline.</h1>",
      {
        status: 503,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}
