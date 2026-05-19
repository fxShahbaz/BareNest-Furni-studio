"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Eager background prefetch of the site's primary routes. Mounted on the
// landing page so that as soon as the home page is up and idle, the
// browser quietly downloads the RSC payload + JS chunks for the other
// pages. By the time the visitor clicks "Shop" or "Story", the route is
// already in Next's client cache and navigates instantly.
//
// We use Next's router.prefetch() rather than raw <link rel="prefetch">
// because it understands App Router segments and React Server Components.
//
// Defensive choices:
//   - Wait for the load event so we don't fight with the LCP image
//   - Use requestIdleCallback so each prefetch fires only when the
//     browser actually has spare time (no jank)
//   - Skip entirely on slow connections (2g, slow-2g) and when the user
//     has the OS-level data-saver toggle on
//   - Tiered priority: highest-intent pages first (shop, story)

const PREFETCH_ROUTES = [
  // Tier 1 — clickable from the navbar, high-intent
  "/shop",
  "/story",
  // Tier 2 — secondary CTAs
  "/materials",
  "/showroom",
  // Tier 3 — long-tail browsing
  "/blog",
  "/collections",
  "/contact",
] as const;

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
};

function shouldSkip(): boolean {
  if (typeof navigator === "undefined") return true;
  const conn = (navigator as Navigator & { connection?: NetworkInformation })
    .connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  if (conn.effectiveType === "2g" || conn.effectiveType === "slow-2g") {
    return true;
  }
  return false;
}

type IdleScheduler = (cb: () => void) => void;

const scheduleIdle: IdleScheduler =
  typeof window !== "undefined" && "requestIdleCallback" in window
    ? (cb) =>
        (window as Window & {
          requestIdleCallback: (
            cb: () => void,
            opts: { timeout: number }
          ) => number;
        }).requestIdleCallback(cb, { timeout: 2500 })
    : (cb) => setTimeout(cb, 600);

export default function PrefetchRoutes() {
  const router = useRouter();

  useEffect(() => {
    if (shouldSkip()) return;

    let cancelled = false;
    const ROUTE_GAP_MS = 150; // tiny stagger between prefetches

    function kickoff() {
      PREFETCH_ROUTES.forEach((route, idx) => {
        const fire = () => {
          if (cancelled) return;
          // router.prefetch is fire-and-forget; any errors are silent
          // by design (e.g. a route that doesn't exist).
          try {
            router.prefetch(route);
          } catch {
            /* fail-soft */
          }
        };
        // Each route runs inside its own idle slot AND a small stagger
        // so we don't burst-queue 7 requests onto the network at once.
        setTimeout(() => scheduleIdle(fire), idx * ROUTE_GAP_MS);
      });
    }

    if (document.readyState === "complete") {
      kickoff();
    } else {
      const onLoad = () => kickoff();
      window.addEventListener("load", onLoad, { once: true });
      return () => {
        cancelled = true;
        window.removeEventListener("load", onLoad);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
