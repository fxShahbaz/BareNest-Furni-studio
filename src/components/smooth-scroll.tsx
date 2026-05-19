"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const isFirstNav = useRef(true);

  useEffect(() => {
    const lenis = new Lenis({
      // Frame-rate-independent smoothing. Lower = snappier, higher = floatier.
      // 0.1 is the production sweet spot — responsive without rubbery overshoot.
      lerp: 0.1,
      smoothWheel: true,
      // Let mobile use native momentum/overscroll — syncing it with smooth
      // wheel scroll is what creates the "vibration" feel on trackpads + touch.
      syncTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      // We drive RAF via gsap.ticker below — turn off Lenis's internal loop
      // so we don't double-tick.
      autoRaf: false,
    });
    lenisRef.current = lenis;
    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tickerCb = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      lenisRef.current = null;
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, []);

  // Reset scroll to top on every client-side navigation.
  //
  // Next.js's built-in scroll restoration calls window.scrollTo(0, 0) on
  // route change, but Lenis owns the scroll position — it would snap back
  // to its previous targetScroll on the next frame. So we sync Lenis itself
  // (immediate: true sets both targetScroll and animatedScroll), then
  // refresh ScrollTrigger so any pinned/triggered sections on the new page
  // recompute against the fresh layout.
  useEffect(() => {
    if (isFirstNav.current) {
      isFirstNav.current = false;
      return;
    }
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }
    // next frame, after the new page has committed
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [pathname]);

  return <>{children}</>;
}
