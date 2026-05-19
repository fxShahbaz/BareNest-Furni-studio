"use client";

import { useEffect } from "react";

// Registers /sw.js in production only. We skip it in development to
// avoid stale dev assets (Next emits new chunk filenames on every save).
//
// Mounted once in the root layout. The SW handles all caching logic
// (static-first for /_next/static, cache-first for fonts, stale-while-
// revalidate for images, network-first for HTML).
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      // Make sure dev sessions don't carry a stale SW from a prior prod
      // build on the same hostname (e.g. localhost previews).
      navigator.serviceWorker.getRegistrations?.().then((regs) => {
        regs.forEach((r) => {
          if (r.scope.startsWith(window.location.origin)) r.unregister();
        });
      });
      return;
    }

    // Wait for the load event so we don't compete with the initial paint.
    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => {
          // SW failure is non-fatal — page works without it.
          console.warn("[sw] registration failed:", err);
        });
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  return null;
}
