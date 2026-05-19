"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const CARDS = [
  {
    id: "beds",
    title: "Storage & platform beds",
    sub: "MDF · Solid Wood",
    image:
      "https://images.unsplash.com/photo-1633944095397-878622ebc01c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "wardrobes",
    title: "Wardrobes",
    sub: "Cedar-lined",
    image:
      "https://images.unsplash.com/photo-1672137233327-37b0c1049e77?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sofas",
    title: "Sofas",
    sub: "Feather seats · Linen blend",
    image:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "dining",
    title: "Dining tables",
    sub: "Live-edge mango · Teak",
    image:
      "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "crockery",
    title: "Crockery units",
    sub: "Glass uppers · LED interior",
    image:
      "https://images.unsplash.com/photo-1765000884377-5134d3dc9d15?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "bookshelves",
    title: "Bookshelves",
    sub: "Solid ash · Open back",
    image:
      "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "office",
    title: "Office & conference",
    sub: "Cable troughs · Tapered legs",
    image:
      "https://images.unsplash.com/photo-1679309981674-cef0e23a7864?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function Categories() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [maxX, setMaxX] = useState(0);

  useEffect(() => {
    function recalc() {
      const track = trackRef.current;
      if (!track) return;
      const gutter = window.innerWidth < 768 ? 24 : 80;
      const distance = Math.max(0, track.scrollWidth - window.innerWidth + gutter);
      setMaxX(distance);
    }
    recalc();
    const onResize = () => recalc();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    // Re-measure once images load (their layout can shift scrollWidth slightly)
    const imgs = trackRef.current?.querySelectorAll("img") ?? [];
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", recalc, { once: true });
    });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -maxX]);

  // Trackpad horizontal swipe (2-finger pan on macOS / shift+wheel): browser
  // fires wheel events with deltaX. While the section is pinned, redirect
  // that horizontal intent into vertical page scroll so it drives the same
  // scrollYProgress → x mapping.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      const rect = section.getBoundingClientRect();
      const pinned = rect.top <= 0 && rect.bottom >= window.innerHeight;
      if (!pinned) return;
      e.preventDefault();
      const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o?: { immediate?: boolean }) => void } }).__lenis;
      const target = window.scrollY + e.deltaX;
      if (lenis) lenis.scrollTo(target, { immediate: true });
      else window.scrollTo({ top: target, behavior: "auto" });
    };
    section.addEventListener("wheel", onWheel, { passive: false });
    return () => section.removeEventListener("wheel", onWheel);
  }, []);

  // Pointer-driven swipe: translate horizontal drag on the track into page
  // scroll, so the existing scrollYProgress→x mapping handles the animation
  // for both mouse-wheel users and touch/swipe users.
  const dragState = useRef<{
    startX: number;
    startY: number;
    startScrollY: number;
    moved: number;
  } | null>(null);

  const setScroll = (y: number) => {
    const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o?: { immediate?: boolean }) => void } }).__lenis;
    if (lenis) lenis.scrollTo(y, { immediate: true });
    else window.scrollTo({ top: y, behavior: "auto" });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startScrollY: window.scrollY,
      moved: 0,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = dragState.current;
    if (!st) return;
    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;
    st.moved = Math.max(st.moved, Math.abs(dx) + Math.abs(dy));
    // Horizontal swipe advances the page; vertical drag still scrolls
    // naturally so the section can be exited by dragging up/down too.
    setScroll(st.startScrollY - dx - dy);
  };

  const endPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    // Defer clear so the synthetic click that follows pointerup can still
    // read `moved` and be suppressed in onClickCapture below.
    const moved = dragState.current.moved;
    dragState.current = { ...dragState.current, moved };
    requestAnimationFrame(() => {
      dragState.current = null;
    });
  };

  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragState.current && dragState.current.moved > 6) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-cream/40"
      style={{ height: `calc(100vh + ${maxX}px)` }}
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="mx-auto flex w-full max-w-[1400px] items-end justify-between gap-4 px-6 pt-24 md:px-10 md:pt-28">
          <div>
            <p className="eyebrow text-muted">The catalogue</p>
            <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-7xl">
              Designed for{" "}
              <span className="serif-italic">real rooms.</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-bone md:inline-flex"
          >
            See all
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <motion.div
          ref={trackRef}
          style={{ x, touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onClickCapture={onClickCapture}
          className="mt-auto flex cursor-grab select-none gap-4 px-6 pb-10 active:cursor-grabbing sm:gap-6 md:gap-8 md:px-10 md:pb-16"
        >
          {CARDS.map((c, i) => (
            <Link
              key={c.id}
              href={`/shop?cat=${c.id}`}
              draggable={false}
              className="group relative block h-[58vh] w-[78vw] flex-none overflow-hidden rounded-3xl sm:w-[52vw] md:h-[60vh] md:w-[42vw]"
            >
              <Image
                src={c.image}
                alt={c.title}
                fill
                draggable={false}
                sizes="(min-width: 768px) 42vw, (min-width: 640px) 52vw, 78vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between text-bone md:inset-x-6 md:bottom-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-bone/70">
                    {String(i + 1).padStart(2, "0")} · {c.sub}
                  </p>
                  <h3 className="mt-2 font-display text-2xl leading-tight sm:text-3xl md:text-4xl">
                    {c.title}
                  </h3>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-full bg-bone text-ink transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 md:h-12 md:w-12">
                  <ArrowUpRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
