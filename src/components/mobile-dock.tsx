"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function MobileDock() {
  const pathname = usePathname();
  const count = useCart((s) => s.items.reduce((a, b) => a + b.qty, 0));

  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // tiny delay so the entrance feels intentional, not flashy
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Hide when scrolling down, reveal when scrolling up (Apple-style).
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const cur = window.scrollY;
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
        "transition-all duration-500 ease-out",
        !mounted || hidden
          ? "translate-y-[140%] opacity-0"
          : "translate-y-0 opacity-100"
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-sm items-stretch gap-1 rounded-full border border-ink/10 bg-bone/85 p-1.5 shadow-[0_18px_50px_-18px_rgba(20,17,14,0.45)] backdrop-blur-xl"
      >
        {ITEMS.map((it) => {
          const active = isActive(it.href);
          const showBadge = "badge" in it && it.badge && count > 0;
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-label={it.label}
              aria-current={active ? "page" : undefined}
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
