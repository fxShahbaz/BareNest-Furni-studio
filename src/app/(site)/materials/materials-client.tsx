"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type Detail = {
  kind: "solid" | "mdf" | "particle";
  code: string;
  name: string;
};

export default function MaterialsClient({
  details,
  children,
}: {
  details: Detail[];
  children: React.ReactNode;
}) {
  const [active, setActive] = useState<string>(details[0].kind);
  const [showRail, setShowRail] = useState(false);
  const { scrollYProgress } = useScroll();
  const progressX = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Track which detail panel is in view
  useEffect(() => {
    const sections = details
      .map((d) => document.querySelector(`[data-section="${d.kind}"]`))
      .filter((n): n is Element => Boolean(n));
    if (sections.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const kind = (visible.target as HTMLElement).dataset.section;
          if (kind) setActive(kind);
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((s) => obs.observe(s));

    const onScroll = () => setShowRail(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [details]);

  // Reveal entrance for [data-reveal] elements once on mount
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    els.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      el.style.transition =
        "opacity 0.9s cubic-bezier(.22,1,.36,1), transform 0.9s cubic-bezier(.22,1,.36,1)";
      el.style.transitionDelay = `${80 + i * 80}ms`;
      // next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        });
      });
    });
  }, []);

  return (
    <div className="relative">
      {/* Scroll progress bar at the very top */}
      <motion.div
        style={{ width: progressX }}
        className="fixed left-0 top-0 z-30 h-[2px] bg-rust"
        aria-hidden
      />

      {/* Sticky section indicator chip */}
      <div
        className={cn(
          "fixed left-1/2 top-20 z-30 -translate-x-1/2 transition-all duration-500 md:top-24",
          showRail
            ? "opacity-100 translate-y-0"
            : "pointer-events-none -translate-y-2 opacity-0"
        )}
      >
        <div className="flex items-center gap-1 rounded-full border border-ink/10 bg-bone/85 p-1 shadow-[0_15px_40px_-20px_rgba(20,17,14,0.35)] backdrop-blur-md">
          {details.map((d) => (
            <a
              key={d.code}
              href={`#${d.kind}`}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors",
                active === d.kind
                  ? "bg-ink text-bone"
                  : "text-ink/70 hover:bg-ink/5"
              )}
            >
              <span className="font-mono mr-1.5 text-[9px] opacity-60">
                {d.code}
              </span>
              {d.name.split(" ")[0]}
            </a>
          ))}
        </div>
      </div>

      {children}
    </div>
  );
}
