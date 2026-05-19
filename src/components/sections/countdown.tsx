"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SHOWROOM } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

function diff(target: Date) {
  const ms = target.getTime() - Date.now();
  const clamp = Math.max(0, ms);
  const d = Math.floor(clamp / 86_400_000);
  const h = Math.floor((clamp / 3_600_000) % 24);
  const m = Math.floor((clamp / 60_000) % 60);
  const s = Math.floor((clamp / 1000) % 60);
  return { d, h, m, s };
}

export default function Countdown() {
  const target = new Date(SHOWROOM.inaugurationISO);
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-count-fig]", {
        yPercent: 60,
        opacity: 0,
        stagger: 0.1,
        ease: "expo.out",
        duration: 1.2,
        scrollTrigger: {
          trigger: root.current,
          start: "top 75%",
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-walnut py-28 text-bone md:py-40"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid items-end gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="eyebrow text-bone/60">Showroom inauguration</p>
            <h2 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
              18 June <span className="serif-italic">2026.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm text-bone/70 md:text-base">
              {SHOWROOM.studio} opens its doors. Walk through the catalogue,
              feel the materials, and see what eight years of furniture-floor
              experience built.
            </p>
            <Link
              href="/showroom"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-bone px-6 py-3.5 text-sm text-ink"
            >
              Reserve a preview
              <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-bone">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>

          <div className="md:col-span-6">
            <div className="grid grid-cols-4 gap-2 md:gap-4">
              {[
                { v: t.d, l: "Days" },
                { v: t.h, l: "Hours" },
                { v: t.m, l: "Minutes" },
                { v: t.s, l: "Seconds" },
              ].map((b, i) => (
                <div
                  key={i}
                  data-count-fig
                  className="rounded-3xl border border-bone/15 bg-bark p-4 text-center md:p-6"
                >
                  <div className="font-display text-4xl leading-none tabular-nums md:text-6xl">
                    {String(b.v).padStart(2, "0")}
                  </div>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-bone/60">
                    {b.l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
