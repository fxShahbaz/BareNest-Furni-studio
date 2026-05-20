"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowDown, ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const SWATCHES = [
  {
    label: "Walnut",
    src: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "Oak",
    src: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=400&q=80",
  },
];

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-line] span", {
        yPercent: 110,
        rotate: 2,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.08,
        delay: 0.2,
      });
      gsap.from("[data-hero-meta]", {
        opacity: 0,
        y: 16,
        duration: 1,
        ease: "expo.out",
        delay: 0.7,
        stagger: 0.1,
      });
      gsap.from("[data-hero-canvas]", {
        opacity: 0,
        scale: 1.04,
        duration: 1.4,
        ease: "expo.out",
        delay: 0.1,
        clearProps: "scale",
      });
      gsap.from("[data-hero-card]", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        delay: 0.6,
      });
      gsap.from("[data-hero-badge]", {
        scale: 0.6,
        opacity: 0,
        duration: 0.9,
        ease: "back.out(1.6)",
        delay: 1,
      });
      gsap.from("[data-hero-swatch]", {
        y: 18,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.08,
        delay: 0.85,
      });

      // Parallax: translate only — no scale, to avoid conflicting with the
      // entry scale animation (which would cause a visible jump on first scroll).
      gsap.fromTo(
        "[data-hero-canvas]",
        { yPercent: 0 },
        {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative min-h-screen overflow-hidden pt-28 md:pt-32"
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-x-6 px-6 md:px-10">
        <div className="col-span-12 md:col-span-7">
          <div className="flex items-center gap-3" data-hero-meta>
            <span className="inline-block h-2 w-2 rounded-full bg-rust" />
            <p className="eyebrow text-muted">
              Inaugurating 18 June 2026 · Furni Studio
            </p>
          </div>

          <h1 className="mt-6 font-display text-[12vw] leading-[0.95] tracking-[-0.02em] md:text-[8.5rem]">
            <span className="block overflow-hidden">
              <span data-hero-line className="block">
                <span className="inline-block">Furniture</span>
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-hero-line className="block">
                <span className="inline-block serif-italic">honestly</span>
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-hero-line className="block">
                <span className="inline-block">made.</span>
              </span>
            </span>
          </h1>

          <p
            className="mt-8 max-w-md text-sm text-muted md:text-base"
            data-hero-meta
          >
            bare nest is a furniture studio that refuses to play the
            particle-board game. Just solid wood for the heirlooms and dense
            MDF for the everyday — never the cheap stuff in between.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4" data-hero-meta>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3.5 text-sm text-bone"
            >
              Browse the catalogue
              <span className="grid h-7 w-7 place-items-center rounded-full bg-bone text-ink transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            <Link
              href="/story"
              className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
            >
              Read our story
            </Link>
          </div>
        </div>

        {/* Right: single hero canvas with floating composite card */}
        <div className="relative col-span-12 mt-12 h-[68vh] md:col-span-5 md:mt-0 md:h-[80vh]">
          {/* The main image — single, full canvas, no border */}
          <div
            data-hero-canvas
            className="absolute inset-0 overflow-hidden rounded-[2rem] shadow-[0_30px_80px_-30px_rgba(20,17,14,0.35)] md:rounded-[2.25rem]"
          >
            <Image
              src="https://images.unsplash.com/photo-1487015307662-6ce6210680f1?auto=format&fit=crop&w=1400&q=85"
              alt="An elegant interior — warm wood, soft daylight"
              fill
              priority
              sizes="(min-width: 768px) 42vw, 100vw"
              className="object-cover"
            />
            {/* very soft top wash so the white card has contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-ink/15 via-transparent to-ink/10" />
          </div>

          {/* Composite floating card — CTA chip + swatches + caption */}
          <div
            data-hero-card
            className="absolute left-4 right-4 top-5 rounded-[1.5rem] bg-bone/95 p-4 shadow-[0_20px_50px_-15px_rgba(20,17,14,0.25)] backdrop-blur-sm md:left-5 md:right-5 md:top-6 md:rounded-[1.75rem] md:p-5"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <Link
                href="/shop"
                aria-label="Browse catalogue"
                className="group relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink text-bone transition-transform hover:-translate-y-0.5 md:h-16 md:w-16"
              >
                <span className="absolute inset-0 rounded-full ring-1 ring-bone/30" />
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:rotate-12 md:h-6 md:w-6" />
              </Link>

              {SWATCHES.map((s) => (
                <div
                  key={s.label}
                  data-hero-swatch
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[1.1rem] shadow-md ring-1 ring-ink/5 md:h-16 md:w-16 md:rounded-[1.25rem]"
                  title={s.label}
                >
                  <Image
                    src={s.src}
                    alt={s.label}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                  <span className="absolute bottom-1 left-1 rounded-full bg-bone/85 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-ink">
                    {s.label}
                  </span>
                </div>
              ))}

              <div className="ml-auto hidden text-right md:block">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                  01 · Materials
                </p>
                <p className="mt-1 font-display text-sm leading-tight">
                  Two woods we&nbsp;trust
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-ink/10 pt-3 md:mt-5 md:pt-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted md:text-xs">
                The first catalogue
              </p>
              <p className="mt-2 text-sm leading-snug text-ink/85 md:text-base">
                A curated launch collection in solid sheesham, teak, and dense
                MDF — designed for real Indian homes.
              </p>
            </div>
          </div>

          {/* Bottom-right circular sticker badge */}
          <div
            data-hero-badge
            className="absolute -bottom-2 right-3 grid h-24 w-24 place-items-center rounded-full bg-rust text-bone shadow-[0_15px_40px_-10px_rgba(194,85,43,0.55)] md:-bottom-4 md:right-4 md:h-28 md:w-28"
          >
            <div className="text-center leading-tight">
              <div className="font-display text-2xl md:text-[1.7rem]">06.26</div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-bone/85 md:text-[10px]">
                Studio opens
              </div>
              <div className="mt-1 text-[9px] font-medium tracking-[0.14em] text-bone md:text-[10px]">
                9:30 AM
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-bone/30" />
          </div>

          {/* Tiny floating "live" tag on bottom-left of the canvas */}
          <div
            data-hero-badge
            className="absolute bottom-5 left-4 flex items-center gap-2 rounded-full bg-bone/95 px-3 py-1.5 shadow-md backdrop-blur md:left-5 md:bottom-6 md:px-3.5 md:py-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-ink/80 md:text-[11px]">
              In the workshop
            </span>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted">
          <span>Scroll</span>
          <ArrowDown className="h-3 w-3" />
        </div>
      </div>
    </section>
  );
}
