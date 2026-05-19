"use client";

// Tiny dependency-free IndexedDB wrapper. Used for client-side state
// that should persist across sessions but doesn't fit localStorage's
// 5MB string limit or the synchronous API.
//
// Today we use it for "recently viewed products" — a small list of
// slugs + thumbnail metadata that the home page / shop can surface
// instantly without a server round-trip. Pattern is generic enough to
// reuse for other client-cached state.

const DB_NAME = "barenest";
const DB_VERSION = 1;
const STORE_RECENT = "recent-products";

type RecentProduct = {
  slug: string;
  name: string;
  price: number;
  image: string;
  material: string;
  viewedAt: number; // unix ms
};

const MAX_RECENT = 20;

function isBrowser() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDB(): Promise<IDBDatabase | null> {
  if (!isBrowser()) return Promise.resolve(null);
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_RECENT)) {
        const store = db.createObjectStore(STORE_RECENT, { keyPath: "slug" });
        store.createIndex("viewedAt", "viewedAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null); // fail soft — IDB is best-effort
  });
}

// IDBRequest's type parameter doesn't align cleanly across operations
// (store.clear is IDBRequest<undefined>, store.getAll is IDBRequest<T[]>).
// Relax the run callback to any-request; the caller still types T.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRequest = IDBRequest<any>;

function tx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => AnyRequest | Promise<T>
): Promise<T | null> {
  return new Promise(async (resolve) => {
    const db = await openDB();
    if (!db) return resolve(null);
    try {
      const t = db.transaction(storeName, mode);
      const store = t.objectStore(storeName);
      const result = run(store);
      if (result instanceof Promise) {
        result.then(resolve, () => resolve(null));
      } else {
        result.onsuccess = () => resolve(result.result as T);
        result.onerror = () => resolve(null);
      }
      t.oncomplete = () => db.close();
      t.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// ----- Recently viewed products ----------------------------------------

/** Stamp a product as just viewed. Idempotent — bumps `viewedAt`. */
export async function markRecent(product: Omit<RecentProduct, "viewedAt">) {
  await tx<unknown>(STORE_RECENT, "readwrite", (store) => {
    store.put({ ...product, viewedAt: Date.now() });
    return store.count() as unknown as IDBRequest<unknown>;
  });
  // Trim oldest entries past the cap.
  await trimRecent();
}

/** Returns the N most recently viewed products, newest first. */
export async function getRecent(limit = MAX_RECENT): Promise<RecentProduct[]> {
  const all = await tx<RecentProduct[]>(STORE_RECENT, "readonly", (store) => {
    return new Promise<RecentProduct[]>((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as RecentProduct[]) ?? []);
      req.onerror = () => resolve([]);
    }) as unknown as IDBRequest<RecentProduct[]>;
  });
  if (!all) return [];
  return all
    .sort((a, b) => b.viewedAt - a.viewedAt)
    .slice(0, limit);
}

/** Wipe all viewed-product entries. */
export async function clearRecent() {
  await tx<unknown>(STORE_RECENT, "readwrite", (store) => store.clear());
}

async function trimRecent() {
  const all = await getRecent(1000);
  if (all.length <= MAX_RECENT) return;
  const toDelete = all.slice(MAX_RECENT).map((p) => p.slug);
  await tx<unknown>(STORE_RECENT, "readwrite", (store) => {
    for (const slug of toDelete) store.delete(slug);
    return store.count() as unknown as IDBRequest<unknown>;
  });
}
