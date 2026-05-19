"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WoodSwatch from "@/components/wood-swatch";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

type Material = {
  code: string;
  kind: "solid" | "mdf" | "particle";
  name: string;
  badge: string;
  badgeClass: string;
  spec: string;
  priceTier: "₹₹₹" | "₹₹" | "—";
  intro: string;
  pros: string[];
  cons: string[];
  use: string;
};

const MATERIALS: Material[] = [
  {
    code: "01",
    kind: "solid",
    name: "Solid Wood",
    badge: "Heirloom",
    badgeClass: "bg-walnut text-bone",
    spec: "Sheesham · Teak · Mango · Ash",
    priceTier: "₹₹₹",
    intro:
      "Picked for grain, seasoned slowly, finished with hardwax oil. The pieces you'll pass on, not throw out.",
    pros: [
      "Outlives the family that bought it",
      "Repairs and refinishes beautifully",
      "Each board unique by grain",
    ],
    cons: ["Sits at the top of our price list", "Heavier to move and install"],
    use: "Beds, dining tables, conference tables, statement wardrobes.",
  },
  {
    code: "02",
    kind: "mdf",
    name: "Dense MDF",
    badge: "Honest Mid-Tier",
    badgeClass: "bg-clay text-bark",
    spec: "Pre-laminated · Matte veneer top",
    priceTier: "₹₹",
    intro:
      "Medium-density fibreboard, properly engineered. Behaves for years, not months — even after a monsoon.",
    pros: [
      "Strong enough for daily use",
      "Holds finish without warping",
      "Within most home-furnishing budgets",
    ],
    cons: ["Not as repairable as solid wood", "Heavier than it looks"],
    use: "Wardrobes, dressing tables, crockery units, office desks, shoe racks.",
  },
  {
    code: "03",
    kind: "particle",
    name: "Particle Board",
    badge: "Refused",
    badgeClass: "bg-bark text-bone",
    spec: "Sawdust + glue, pressed cheap",
    priceTier: "—",
    intro:
      "The cheapest engineered wood — what about 90% of local shops sell, often hidden under glossy laminate. We don't carry it. Not at any price.",
    pros: [],
    cons: [
      "Sags under load within two years",
      "Doesn't survive a single move",
      "Hides its weakness behind laminate",
    ],
    use: "You won't find a single particle-board SKU in our catalogue. Promise.",
  },
];

export default function Materials() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-material-card]");
      cards.forEach((card) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.from("[data-materials-header] > *", {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        ease: "expo.out",
        duration: 1,
        scrollTrigger: {
          trigger: "[data-materials-header]",
          start: "top 80%",
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative bg-bone py-28 md:py-40"
      id="materials"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div
          data-materials-header
          className="grid gap-8 md:grid-cols-12 md:items-end"
        >
          <div className="md:col-span-7">
            <p className="eyebrow text-muted">Materials philosophy</p>
            <h2 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
              Two materials we trust.{" "}
              <span className="serif-italic text-walnut">
                One we&nbsp;refuse.
              </span>
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-sm text-muted md:text-base">
              Almost every furniture shop you&apos;ll walk into sells particle
              board. It&apos;s the cheapest engineered wood there is, and it
              shows within two years. bare nest is built on a stricter
              shortlist — honest MDF where it makes sense, and solid wood
              where it earns its price.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {MATERIALS.map((m) => (
            <MaterialCard key={m.code} m={m} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* Hand-drawn brush-stroke icons, matching the logo's aesthetic. */
function BrushCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M4.5 13.2 Q7.5 16.5 10.2 18 Q13.5 12 19.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10.2" cy="18" r="0.6" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function BrushCross({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M6 5.5 Q11 11 18.4 18.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M18.4 5.5 Q13 11 5.6 18.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProsConsGroup({
  label,
  tone,
  items,
}: {
  label: string;
  tone: "pros" | "cons";
  items: string[];
}) {
  const isPros = tone === "pros";
  return (
    <div>
      {/* Section label */}
      <div className="mb-4 flex items-center gap-2">
        <span
          className={cn(
            "relative flex h-2 w-2",
            isPros ? "text-leaf" : "text-rust"
          )}
        >
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-40",
              isPros ? "bg-leaf" : "bg-rust"
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              isPros ? "bg-leaf" : "bg-rust"
            )}
          />
        </span>
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.22em]",
            isPros ? "text-leaf/85" : "text-rust/90"
          )}
        >
          {label}
        </p>
        <span className="h-px flex-1 bg-gradient-to-r from-ink/15 via-ink/5 to-transparent" />
      </div>

      {/* Items — relative wrapper holds the connecting timeline rail */}
      <ul className="relative">
        {/* Vertical timeline rail behind the icon column */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-[13px] top-3 bottom-3 w-px",
            isPros
              ? "bg-gradient-to-b from-leaf/30 via-leaf/15 to-transparent"
              : "bg-gradient-to-b from-rust/30 via-rust/15 to-transparent"
          )}
        />

        {items.map((it, i) => (
          <li
            key={it}
            className={cn(
              "group/row relative flex items-start gap-3 rounded-xl py-2 pr-2 pl-0 text-sm transition-colors",
              isPros
                ? "hover:bg-leaf/[0.05]"
                : "hover:bg-rust/[0.05]",
              i !== items.length - 1 && "border-b border-ink/[0.06]"
            )}
          >
            {/* Stamp tile */}
            <span
              className={cn(
                "relative mt-0.5 grid h-[26px] w-[26px] shrink-0 place-items-center rounded-lg transition-all duration-300 group-hover/row:scale-110 group-hover/row:-rotate-3",
                isPros
                  ? "bg-gradient-to-br from-leaf/20 to-leaf/10 text-leaf shadow-[inset_0_-2px_4px_rgba(90,107,58,0.18),0_1px_2px_rgba(90,107,58,0.18)] ring-1 ring-leaf/25"
                  : "bg-gradient-to-br from-rust/20 to-rust/10 text-rust shadow-[inset_0_-2px_4px_rgba(194,85,43,0.2),0_1px_2px_rgba(194,85,43,0.2)] ring-1 ring-rust/30"
              )}
            >
              {/* tiny inner highlight to suggest a wax-seal stamp */}
              <span className="pointer-events-none absolute inset-x-1.5 top-1 h-1 rounded-full bg-bone/30 blur-[1px]" />
              {isPros ? (
                <BrushCheck className="h-3.5 w-3.5" />
              ) : (
                <BrushCross className="h-3.5 w-3.5" />
              )}
            </span>

            {/* Index */}
            <span
              className={cn(
                "mt-1 hidden font-mono text-[9px] uppercase tracking-wider md:inline-block",
                isPros ? "text-leaf/60" : "text-rust/60"
              )}
              aria-hidden
            >
              0{i + 1}
            </span>

            {/* Item text */}
            <span
              className={cn(
                "min-w-0 leading-snug",
                isPros ? "text-ink/85" : "text-ink/65"
              )}
            >
              {it}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MaterialCard({ m }: { m: Material }) {
  const refused = m.kind === "particle";
  return (
    <article
      data-material-card
      // contain:paint + will-change:transform isolates this card to its own
      // compositor layer so the expensive WoodSwatch SVG filters
      // (feTurbulence / feDisplacementMap) rasterize once and stay cached
      // while the page scrolls past — no per-frame re-paint.
      style={{ contain: "paint", willChange: "transform, opacity" }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-ink/10 bg-cream/40 transform-gpu",
        "shadow-[0_15px_40px_-30px_rgba(20,17,14,0.25)]"
      )}
    >
      {/* Swatch — promoted to its own layer too, so the SVG filter result
          is cached as a texture and the group-hover scale is GPU-only. */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div
          style={{ willChange: "transform", transform: "translateZ(0)" }}
          className="absolute inset-0 transform-gpu transition-transform duration-700 group-hover:scale-[1.04]"
        >
          <WoodSwatch kind={m.kind} />
        </div>

        {/* corner badge */}
        <span
          className={cn(
            "absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] shadow-sm",
            m.badgeClass
          )}
        >
          {m.badge}
        </span>

        {/* sample-tag overlay top-right */}
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-bone/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-ink backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-rust" />
          Sample · {m.code}
        </div>

        {/* refused overlay treatment */}
        {refused && (
          <>
            <div className="absolute inset-0 bg-bark/30" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="rotate-[-6deg] rounded-md border-2 border-bone/85 bg-bark/85 px-5 py-2 text-xs uppercase tracking-[0.3em] text-bone shadow-lg">
                Not stocked
              </div>
            </div>
          </>
        )}

        {/* hairline at bottom of swatch */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-ink/10" />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6 md:p-7">
        {/* header row */}
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl leading-tight md:text-3xl">
            {m.name}
          </h3>
          <span className="font-display text-xs text-muted">{m.code}</span>
        </div>

        {/* spec row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
            {m.spec}
          </p>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide",
              refused
                ? "bg-rust/10 text-rust"
                : "bg-leaf/10 text-leaf"
            )}
            aria-label={`Price tier ${m.priceTier}`}
          >
            {m.priceTier}
          </span>
        </div>

        <p className="mt-4 text-sm text-ink/80 md:text-[15px]">{m.intro}</p>

        <div className="mt-6 space-y-5">
          {m.pros.length > 0 && (
            <ProsConsGroup
              label="What you get"
              tone="pros"
              items={m.pros}
            />
          )}
          {m.cons.length > 0 && (
            <ProsConsGroup
              label={refused ? "Why we won't stock it" : "Trade-offs"}
              tone="cons"
              items={m.cons}
            />
          )}
        </div>

        {/* divider + use line */}
        <div className="mt-auto pt-6">
          <div className="h-px w-full bg-ink/10" />
          <p className="mt-4 text-xs italic text-muted">{m.use}</p>
        </div>
      </div>
    </article>
  );
}

