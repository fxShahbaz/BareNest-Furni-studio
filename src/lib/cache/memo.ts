import "server-only";

// In-memory, TTL-bounded memoization for hot read paths.
//
// What it solves: Supabase queries for "settings", "all products",
// "categories" run on almost every page load. Even at ~80ms each, they
// stack up — three queries per request = 240ms before any rendering.
// This cache turns repeat reads inside the TTL into ~0ms map lookups.
//
// Caveats:
//   - Process-local. Survives within a single serverless function
//     instance, lost on cold start. That's fine because Next will warm
//     it on first request after a cold start.
//   - Must be invalidated on writes. Admin actions that mutate
//     products/settings/categories call invalidateMemo() with the
//     relevant key prefix.
//   - DO NOT use this for per-user data (orders, customer rows). The
//     cache is shared across all requests in the same process.

type Entry<T> = { value: T; expires: number };

const store = new Map<string, Entry<unknown>>();

export type MemoOptions = {
  /** Time-to-live in milliseconds. */
  ttl?: number;
};

const DEFAULT_TTL = 60_000; // 60s — long enough to deflate hot loops,
                            // short enough that an admin write is visible
                            // on the storefront within a minute even
                            // before manual invalidation.

/**
 * Wrap an async loader with TTL caching.
 *
 *   const getSettings = memo("settings", () => fetchSettings(), { ttl: 30_000 });
 *
 * Calls within the TTL return the cached value without invoking the
 * loader. Expired or missing entries trigger a fresh load.
 */
export async function memo<T>(
  key: string,
  loader: () => Promise<T>,
  opts: MemoOptions = {}
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expires > now) return hit.value;

  const value = await loader();
  store.set(key, { value, expires: now + (opts.ttl ?? DEFAULT_TTL) });
  return value;
}

/**
 * Drop one or more cache entries.
 *
 *   invalidateMemo("settings")                 // exact key
 *   invalidateMemo("products:")                // prefix match (trailing colon)
 *   invalidateMemo()                           // wipe everything
 */
export function invalidateMemo(prefixOrKey?: string): void {
  if (!prefixOrKey) {
    store.clear();
    return;
  }
  // If the caller passes a string ending in ":" we treat it as a
  // prefix; otherwise it's an exact key.
  if (prefixOrKey.endsWith(":")) {
    for (const k of store.keys()) {
      if (k.startsWith(prefixOrKey)) store.delete(k);
    }
    return;
  }
  store.delete(prefixOrKey);
}

/** Useful for tests / debug; not used in production code paths. */
export function memoStats() {
  return {
    size: store.size,
    keys: Array.from(store.keys()),
  };
}
