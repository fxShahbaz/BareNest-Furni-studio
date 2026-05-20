"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

// Brand-tinted palette so the confetti doesn't clash with the cream
// background.
const COLORS = [
  "#c2552b", // rust
  "#dba65a", // clay/honey
  "#6b8f5d", // leaf
  "#7a5a3c", // walnut
  "#3a2b1f", // bark
  "#f6efe1", // bone (subtle)
];

export default function InviteConfetti() {
  const reducedRef = useRef(false);

  useEffect(() => {
    // Respect prefers-reduced-motion — fire a single tiny burst and stop.
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = mql.matches;

    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "0";
    document.body.appendChild(canvas);

    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    let cancelled = false;

    // Opening burst — two angled cannons from the bottom corners.
    const openingBurst = () => {
      myConfetti({
        particleCount: 80,
        spread: 70,
        angle: 60,
        origin: { x: 0, y: 1 },
        colors: COLORS,
        startVelocity: 55,
        scalar: 0.95,
      });
      myConfetti({
        particleCount: 80,
        spread: 70,
        angle: 120,
        origin: { x: 1, y: 1 },
        colors: COLORS,
        startVelocity: 55,
        scalar: 0.95,
      });
    };

    // Ambient drift — sparse pieces falling from the top, every ~1.4s.
    const drift = () => {
      if (cancelled) return;
      myConfetti({
        particleCount: 6,
        startVelocity: 12,
        spread: 360,
        ticks: 220,
        gravity: 0.55,
        scalar: 0.8,
        drift: (Math.random() - 0.5) * 1.2,
        origin: { x: Math.random(), y: -0.05 },
        colors: COLORS,
        shapes: ["circle", "square"],
      });
    };

    openingBurst();

    let interval: ReturnType<typeof setInterval> | null = null;
    if (!reducedRef.current) {
      interval = setInterval(drift, 1400);
      // A second, bigger celebratory burst a moment later.
      const second = setTimeout(() => {
        if (cancelled) return;
        myConfetti({
          particleCount: 140,
          spread: 100,
          startVelocity: 45,
          origin: { x: 0.5, y: 0.35 },
          colors: COLORS,
          scalar: 1.05,
        });
      }, 700);
      return () => {
        cancelled = true;
        clearTimeout(second);
        if (interval) clearInterval(interval);
        myConfetti.reset();
        canvas.remove();
      };
    }

    return () => {
      cancelled = true;
      myConfetti.reset();
      canvas.remove();
    };
  }, []);

  return null;
}
