"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight, MapPin } from "lucide-react";
import { SHOWROOM } from "@/lib/utils";

const STORAGE_KEY = "bn-launch-popup-dismissed-v1";
const APPEAR_AFTER_MS = 1400;

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  return {
    d: Math.floor(ms / 86_400_000),
    h: Math.floor((ms / 3_600_000) % 24),
    m: Math.floor((ms / 60_000) % 60),
    s: Math.floor((ms / 1000) % 60),
  };
}

type Piece = {
  id: number;
  left: number;
  size: number;
  rotate: number;
  delay: number;
  duration: number;
  drift: number;
  color: string;
  shape: "rect" | "circle" | "triangle";
};

function makeConfetti(n: number): Piece[] {
  const palette = ["#c2552b", "#5a3a22", "#5a6b3a", "#b08968", "#ede7da"];
  const shapes: Piece["shape"][] = ["rect", "circle", "triangle"];
  const out: Piece[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      id: i,
      left: Math.random() * 100,
      size: 5 + Math.random() * 9,
      rotate: Math.random() * 360,
      delay: Math.random() * 2.5,
      duration: 4 + Math.random() * 5,
      drift: (Math.random() - 0.5) * 60,
      color: palette[i % palette.length],
      shape: shapes[i % shapes.length],
    });
  }
  return out;
}

export default function LaunchPopup() {
  const [open, setOpen] = useState(false);
  const target = useMemo(() => new Date(SHOWROOM.inaugurationISO), []);
  const [t, setT] = useState(() => diff(target));
  const pieces = useMemo(() => makeConfetti(48), []);

  // First-visit + scheduled appearance
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      /* private mode — show anyway */
    }
    const id = window.setTimeout(() => setOpen(true), APPEAR_AFTER_MS);
    return () => window.clearTimeout(id);
  }, []);

  // Live countdown
  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setT(diff(target)), 1000);
    return () => window.clearInterval(id);
  }, [open, target]);

  // Escape to close + lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* private mode — fine */
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="bn-launch-popup"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bn-launch-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close announcement"
            onClick={dismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 cursor-default bg-bark/55 backdrop-blur-md"
          />

          {/* Confetti — sits between backdrop and card */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {pieces.map((p) => (
              <span
                key={p.id}
                className="bn-confetti absolute"
                style={
                  {
                    left: `${p.left}%`,
                    top: "-8%",
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor:
                      p.shape === "triangle" ? "transparent" : p.color,
                    color: p.color,
                    transform: `rotate(${p.rotate}deg)`,
                    animationDelay: `${p.delay}s`,
                    animationDuration: `${p.duration}s`,
                    "--bn-drift": `${p.drift}px`,
                    borderRadius:
                      p.shape === "circle" ? "9999px" : p.shape === "rect" ? "1px" : "0",
                    clipPath:
                      p.shape === "triangle"
                        ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                        : undefined,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-[2rem] border border-ink/10 bg-bone shadow-[0_40px_80px_-30px_rgba(20,17,14,0.5)]"
          >
            {/* close */}
            <button
              type="button"
              aria-label="Close"
              onClick={dismiss}
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-bone/90 backdrop-blur-sm transition-colors hover:bg-ink hover:text-bone"
            >
              <X className="h-4 w-4" />
            </button>

            {/* logo + watermark */}
            <div className="relative bg-gradient-to-b from-cream/80 to-bone px-6 pb-2 pt-7 text-center md:px-10 md:pt-9">
              <div className="pointer-events-none absolute -right-10 -top-10 select-none text-bark/[0.04]">
                <span className="font-display text-[12rem] leading-none">
                  &lsquo;26
                </span>
              </div>
              <div className="relative mx-auto grid h-32 w-32 place-items-center overflow-hidden rounded-[1.6rem] bg-leaf/15 ring-1 ring-walnut/20 shadow-[0_18px_36px_-14px_rgba(20,17,14,0.35)] md:h-36 md:w-36">
                {/* Inner box gives the logo breathing room so its bottom
                    (pot/base) doesn't sit flush against the container edge. */}
                <div className="relative h-[78%] w-[78%]">
                  <Image
                    src="/logo-mark.png"
                    alt="bare nest"
                    fill
                    sizes="(min-width: 768px) 144px, 128px"
                    className="object-contain mix-blend-multiply"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col items-center leading-none">
                <span className="font-wordmark text-3xl tracking-tight md:text-4xl">
                  <span className="text-walnut">bare</span>
                  <span className="ml-1 text-leaf">nest</span>
                </span>
                <span className="mt-2 text-[9px] uppercase tracking-[0.28em] text-muted">
                  Furni Studio · Patna
                </span>
              </div>

              <div className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-bone/80 px-3 py-1 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rust opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rust" />
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink/80">
                  Opening day
                </span>
              </div>

              <h2
                id="bn-launch-title"
                className="mt-5 font-display text-4xl leading-[1.05] tracking-tight md:text-5xl"
              >
                We&apos;re opening{" "}
                <span className="serif-italic text-walnut">in Patna.</span>
              </h2>
              <p className="mx-auto mt-3 max-w-[28rem] text-sm text-muted md:text-[15px]">
                {SHOWROOM.studio} inaugurates{" "}
                <span className="text-ink">18 June 2026</span>. Honest
                furniture, two materials we trust, one we refuse.
              </p>
            </div>

            {/* Countdown */}
            <div className="px-6 pb-4 md:px-10">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { v: t.d, l: "Days" },
                  { v: t.h, l: "Hrs" },
                  { v: t.m, l: "Min" },
                  { v: t.s, l: "Sec" },
                ].map((b, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-ink/10 bg-cream/60 px-3 py-3 text-center"
                  >
                    <div className="font-display text-3xl leading-none tabular-nums md:text-4xl">
                      {String(b.v).padStart(2, "0")}
                    </div>
                    <p className="mt-2 text-[9px] uppercase tracking-[0.22em] text-muted">
                      {b.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="px-6 pb-6 md:px-10 md:pb-8">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/showroom"
                  onClick={dismiss}
                  className="group inline-flex flex-1 items-center justify-between gap-2 rounded-full bg-ink px-5 py-3.5 text-sm text-bone transition-transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Reserve a preview
                  </span>
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-bone text-ink transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={dismiss}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-5 py-3.5 text-sm text-ink hover:bg-ink/5"
                >
                  Keep browsing
                </button>
              </div>
              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.22em] text-muted">
                You&apos;ll only see this once
              </p>
            </div>
          </motion.div>

          {/* Local keyframes for confetti */}
          <style jsx>{`
            @keyframes bn-confetti-fall {
              0% {
                transform: translate3d(0, -10vh, 0) rotate(0deg);
                opacity: 0;
              }
              8% {
                opacity: 1;
              }
              92% {
                opacity: 1;
              }
              100% {
                transform: translate3d(var(--bn-drift, 0), 120vh, 0)
                  rotate(720deg);
                opacity: 0;
              }
            }
            .bn-confetti {
              animation-name: bn-confetti-fall;
              animation-timing-function: cubic-bezier(0.22, 0.78, 0.4, 1);
              animation-iteration-count: infinite;
              animation-fill-mode: both;
              will-change: transform, opacity;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
