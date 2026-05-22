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
//   4. HTML documents (GET to a same-origin route) — network-first.
//      Lets the network finish on slow connections (no aggressive race);
//      only falls back to cache if fetch genuinely errors. The cached
//      offline page is shown only when fetch fails AND no cache exists.
//
//   5. Everything else (server actions, /api/*, /admin/*) — bypass.
//
// To force-bust the entire cache across all clients, bump CACHE_VERSION.

const CACHE_VERSION = "v3";
const STATIC_CACHE = `bn-static-${CACHE_VERSION}`;
const IMAGES_CACHE = `bn-images-${CACHE_VERSION}`;
const FONTS_CACHE = `bn-fonts-${CACHE_VERSION}`;
const HTML_CACHE = `bn-html-${CACHE_VERSION}`;
const AUDIO_CACHE = `bn-audio-${CACHE_VERSION}`;

const ALL_CACHES = [STATIC_CACHE, IMAGES_CACHE, FONTS_CACHE, HTML_CACHE, AUDIO_CACHE];

// Pre-warmed at install time so the very first landing-page play() hits a
// cached copy. Add other audio paths here if more are introduced.
const PRECACHE_AUDIO = ["/audio/landing.mp3"];

// Hard safety net only — covers a hung connection that never errors.
// Not a "show offline page" trigger; falls back to cache, not to the
// offline shell, when this fires.
const NETWORK_HARD_TIMEOUT_MS = 15000;

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

  // Real abort so the fetch is actually cancelled if the hard timeout fires.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NETWORK_HARD_TIMEOUT_MS);

  try {
    const res = await fetch(req, { signal: controller.signal });
    clearTimeout(timer);
    if (res && res.ok && res.status === 200) {
      cache.put(req, res.clone()).catch(() => {});
    }
    return res;
  } catch {
    clearTimeout(timer);
    const hit = await cache.match(req);
    if (hit) return hit;
    // Only emit the offline shell when the browser itself reports offline.
    // A slow/cold response on a healthy connection must NOT trigger it —
    // re-throw so the browser shows its native network error instead of a
    // misleading "you appear to be offline" page.
    const isOffline =
      typeof self !== "undefined" &&
      self.navigator &&
      self.navigator.onLine === false;
    if (!isOffline) {
      // Surface the real failure to the browser; do not lie to the user.
      throw new Error("network-error");
    }
    return new Response(
      `<!doctype html><meta charset="utf-8"><title>Offline</title>` +
        `<meta name="viewport" content="width=device-width,initial-scale=1">` +
        `<style>body{font-family:system-ui,-apple-system,sans-serif;` +
        `display:flex;flex-direction:column;align-items:center;` +
        `justify-content:center;min-height:100vh;margin:0;padding:24px;` +
        `text-align:center;color:#1a1a1a;background:#faf7f2}` +
        `h1{font-size:24px;margin:0 0 12px}p{margin:0 0 20px;color:#555}` +
        `button{background:#1a1a1a;color:#fff;border:0;border-radius:8px;` +
        `padding:12px 20px;font-size:15px;cursor:pointer}</style>` +
        `<h1>You're offline</h1>` +
        `<p>Check your connection and try again.</p>` +
        `<button onclick="location.reload()">Retry</button>` +
        `<script>window.addEventListener("online",()=>location.reload())</script>`,
      {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}
