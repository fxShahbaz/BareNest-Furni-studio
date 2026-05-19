"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FounderNote() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-promise-line]", {
        opacity: 0,
        y: 28,
        stagger: 0.12,
        ease: "expo.out",
        duration: 1.1,
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      gsap.from("[data-promise-sig]", {
        opacity: 0,
        x: -20,
        scale: 0.96,
        delay: 0.4,
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-bone py-24 md:py-32"
    >
      {/* Faint paper grain */}
      <div className="pointer-events-none absolute inset-0 grain opacity-40" />

      {/* Decorative giant initial — sits behind the letter */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[40vw] leading-none text-walnut/[0.04] md:text-[24vw]"
      >
        N
      </span>

      <div className="relative mx-auto max-w-3xl px-6 md:px-10">
        {/* Top tag row */}
        <div
          className="mb-10 flex items-center justify-between text-walnut/70"
          data-promise-line
        >
          <span className="eyebrow">A note from the founder</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em]">
            Letter №&nbsp;01
          </span>
        </div>

        {/* Pull quote */}
        <p
          className="font-display text-3xl leading-[1.2] text-ink md:text-[2.6rem] md:leading-[1.18]"
          data-promise-line
        >
          <span className="serif-italic text-walnut">"</span>
          I won&apos;t sell you anything I wouldn&apos;t put in my{" "}
          <span className="serif-italic">own home.</span>
          <span className="serif-italic text-walnut">"</span>
        </p>

        {/* Body */}
        <p
          className="mt-8 max-w-2xl text-base leading-relaxed text-muted md:text-lg"
          data-promise-line
        >
          Eight years on a furniture floor taught me what fails — and what
          doesn&apos;t. So Bare Nest stocks two things: MDF you can trust, and
          solid wood that earns its price. Particle board doesn&apos;t make it
          through our doors. It never will.
        </p>

        {/* Hand-drawn divider */}
        <svg
          aria-hidden
          viewBox="0 0 240 14"
          className="mt-12 h-3 w-40 text-walnut/40"
          data-promise-line
        >
          <path
            d="M2 8 C 40 2, 80 12, 120 6 S 200 10, 238 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>

        {/* Signature block */}
        <div className="mt-6 flex items-end justify-between gap-6">
          <div>
            <p
              className="font-wordmark text-5xl leading-none text-walnut md:text-6xl"
              data-promise-sig
            >
              Gaurav Bahri
            </p>
            <p
              className="mt-3 text-[10px] uppercase tracking-[0.28em] text-muted"
              data-promise-line
            >
              Founder · Patna · May 2026
            </p>
          </div>

          {/* Faux wax seal */}
          <div
            className="relative hidden h-20 w-20 shrink-0 place-items-center rounded-full bg-rust/90 text-bone shadow-[0_8px_20px_-12px_rgba(194,85,43,0.6)] sm:grid"
            data-promise-sig
            aria-hidden
          >
            <div className="absolute inset-1 rounded-full border border-bone/40" />
            <div className="text-center font-display leading-tight">
              <div className="text-[8px] uppercase tracking-[0.2em] opacity-80">
                Est.
              </div>
              <div className="text-base">2026</div>
            </div>
          </div>
        </div>

        {/* P.S. */}
        <p
          className="mt-12 max-w-xl text-sm text-muted"
          data-promise-line
        >
          <span className="font-display italic text-walnut">P.S.</span>{" "}
          If you ever spot particle board on our floor, the piece is free.
          We&apos;re that sure.
        </p>
      </div>
    </section>
  );
}
