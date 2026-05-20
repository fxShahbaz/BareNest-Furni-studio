"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Home, LayoutGrid, ShoppingBag, MapPin } from "lucide-react";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/shop", label: "Shop", Icon: LayoutGrid },
  { href: "/cart", label: "Cart", Icon: ShoppingBag, badge: true },
  { href: "/showroom", label: "Visit", Icon: MapPin },
] as const;

export default function MobileDock({
  onlineOrderingEnabled = true,
}: {
  onlineOrderingEnabled?: boolean;
}) {
  const pathname = usePathname();
  const count = useCart((s) => s.items.reduce((a, b) => a + b.qty, 0));
  const items = onlineOrderingEnabled
    ? ITEMS
    : ITEMS.filter((i) => i.href !== "/cart");

  const [hidden, setHidden] = useState(false);
  // Route-change guard. SmoothScroll calls lenis.scrollTo(0) on every
  // navigation, which fires scroll events that would otherwise trip the
  // hide-on-scroll heuristic mid-transition. We freeze the hide logic and
  // force-reveal the dock for a short window after every pathname change.
  const navLockUntil = useRef(0);
  // Generous: covers click → async layout fetch → page-fade-in. Cart's
  // layout in particular awaits a settings lookup, so the window must
  // outlast the slowest route, not just the scroll reset.
  const NAV_LOCK_MS = 1400;

  useEffect(() => {
    setHidden(false);
    navLockUntil.current = performance.now() + NAV_LOCK_MS;
  }, [pathname]);

  // Lock synchronously the instant a dock link is tapped — before
  // pathname changes and before SmoothScroll's scroll-to-0 can fire a
  // scroll event the heuristic might misread. Without this the dock
  // briefly hides on slow routes (cart) where the pathname useEffect
  // runs later than the scroll event from the route transition.
  const onDockNav = () => {
    navLockUntil.current = performance.now() + NAV_LOCK_MS;
    setHidden(false);
  };

  // Hide when scrolling down, reveal when scrolling up (Apple-style).
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const cur = window.scrollY;
        if (performance.now() < navLockUntil.current) {
          // During a route transition, just track position without
          // toggling visibility.
          last = cur;
          ticking = false;
          return;
        }
        if (Math.abs(cur - last) > 6) {
          if (cur < 80) setHidden(false);
          else setHidden(cur > last);
          last = cur;
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div
      className={cn(
        "fixed inset-x-3 z-30 md:hidden",
        "bottom-[max(env(safe-area-inset-bottom),0.75rem)]",
        "transition-transform duration-500 ease-out",
        hidden ? "translate-y-[140%]" : "translate-y-0"
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-sm items-stretch gap-1 rounded-full border border-ink/10 bg-bone/85 p-1.5 shadow-[0_18px_50px_-18px_rgba(20,17,14,0.45)] backdrop-blur-xl"
      >
        {items.map((it) => {
          const active = isActive(it.href);
          const showBadge = "badge" in it && it.badge && count > 0;
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-label={it.label}
              aria-current={active ? "page" : undefined}
              onPointerDown={onDockNav}
              onClick={onDockNav}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-full px-2 py-2.5 transition-colors duration-300 active:scale-[0.96]",
                active ? "text-bone" : "text-ink/70"
              )}
            >
              {active && (
                <motion.span
                  aria-hidden
                  layoutId="dock-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-ink shadow-[0_8px_18px_-8px_rgba(20,17,14,0.6)]"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 32,
                    mass: 0.6,
                  }}
                />
              )}
              <motion.span
                className="relative"
                animate={{ scale: active ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
              >
                <it.Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                {showBadge && (
                  <span
                    aria-hidden
                    className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rust px-1 text-[9px] font-medium leading-none text-bone"
                  >
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </motion.span>
              <span className="text-[10px] uppercase tracking-[0.14em]">
                {it.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
