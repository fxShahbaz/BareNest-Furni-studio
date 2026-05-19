import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, X } from "lucide-react";
import WoodSwatch from "@/components/wood-swatch";
import MaterialsClient from "./materials-client";
import { cn } from "@/lib/utils";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Materials We Use",
  description:
    "Solid wood and MDF, used honestly. Why we trust sheesham, teak, and good MDF — and why we refuse to stock particle board.",
  alternates: { canonical: "/materials" },
  keywords: [
    "solid wood furniture",
    "MDF furniture",
    "no particle board",
    "sheesham wood",
    "teak wood",
    "mango wood",
    "furniture materials India",
  ],
  openGraph: {
    title: "Materials — bare nest",
    description:
      "Two materials we trust, one we refuse. The honest case for solid wood + MDF over particle board.",
    url: "/materials",
    type: "article",
  },
};

type Detail = {
  kind: "solid" | "mdf" | "particle";
  code: string;
  badge: string;
  badgeClass: string;
  name: string;
  pull: string;
  origin: string;
  paragraphs: string[];
  facts: { k: string; v: string }[];
  care: string[];
  usedIn: string[];
  priceTier: "₹₹₹" | "₹₹" | "—";
};

const DETAILS: Detail[] = [
  {
    kind: "solid",
    code: "01",
    badge: "Heirloom",
    badgeClass: "bg-walnut text-bone",
    name: "Solid Wood",
    pull: "A scratch is something you can deal with — on a laminate it's permanent.",
    origin: "Sheesham · Teak · Mango · Ash",
    priceTier: "₹₹₹",
    paragraphs: [
      "Solid wood is exactly what it sounds like — a piece cut and joined from natural timber, with no fibreboard or laminate hiding inside. The grain you see on the surface goes all the way through. That makes it more expensive, but it also means it can be planed, sanded, refinished, and repaired for decades.",
      "We work with Indian-grown sheesham, teak, and mango from suppliers we've vetted, plus seasoned ash for specific pieces. Each board is kiln-dried, allowed to acclimatise to ambient humidity, and finished with a hardwax oil rather than a thick polyurethane coat — so the wood can keep breathing through Patna's seasons.",
    ],
    facts: [
      { k: "Lifespan", v: "30+ yrs" },
      { k: "Refinishable", v: "Yes" },
      { k: "Source", v: "Indian-grown" },
      { k: "Finish", v: "Hardwax oil" },
    ],
    care: [
      "Wipe with a soft, damp cloth. Re-oil once every 12–18 months.",
      "Keep out of direct sun for long stretches to avoid colour shift.",
      "Place pads under heavy objects; small dents can be steamed out.",
    ],
    usedIn: [
      "Storage & platform beds",
      "Dining tables",
      "Conference tables",
      "Statement wardrobes",
    ],
  },
  {
    kind: "mdf",
    code: "02",
    badge: "Honest Mid-Tier",
    badgeClass: "bg-clay text-bark",
    name: "Dense MDF",
    pull: "Engineered to behave for years, not months — even after a monsoon.",
    origin: "Pre-laminated · Matte veneer top",
    priceTier: "₹₹",
    paragraphs: [
      "MDF — medium-density fibreboard — is wood broken down into fine fibres, pressed under heat with a binder, and cut into uniform boards. The good kind is dense, heavy, and finished with a real matte veneer or laminate. It doesn't warp the way cheaper boards do, and it doesn't sag under load for years.",
      "The catch is that MDF can't be refinished the way solid wood can. So we use it where it makes most sense: wardrobes, dressing tables, crockery units, office desks. Pieces that need a clean modern face and don't take the kind of beating that needs heirloom-grade timber.",
    ],
    facts: [
      { k: "Lifespan", v: "8–12 yrs" },
      { k: "Refinishable", v: "No" },
      { k: "Surface", v: "Matte veneer" },
      { k: "Density", v: "High-grade" },
    ],
    care: [
      "Wipe with a slightly damp cloth — never soak.",
      "Keep prolonged moisture away from edges and joints.",
      "Avoid placing very hot items directly on the surface.",
    ],
    usedIn: [
      "Wardrobes",
      "Dressing tables",
      "Crockery units",
      "Office desks",
      "Shoe racks",
    ],
  },
  {
    kind: "particle",
    code: "03",
    badge: "Refused",
    badgeClass: "bg-bark text-bone",
    name: "Particle Board",
    pull: "Not for the cheapest tier, not on special order, not at any price.",
    origin: "Sawdust + glue, pressed cheap",
    priceTier: "—",
    paragraphs: [
      "Particle board is the cheapest pressed-wood product on the market — coarse sawdust and shavings bound with adhesive, pressed into sheets, almost always hidden under a glossy laminate. About 90% of local furniture shops in India sell it. It's why an entire bedroom set can be advertised at a too-good-to-be-true price.",
      "We've watched particle-board furniture sag within 18 months, lose its laminate corners on the first move, and swell at the first drop of water. Refinishing isn't an option — there's no real wood under the surface. bare nest doesn't carry it.",
    ],
    facts: [
      { k: "Lifespan", v: "1–3 yrs" },
      { k: "Refinishable", v: "No" },
      { k: "Survives a move", v: "Rarely" },
      { k: "In our shop", v: "Never" },
    ],
    care: [],
    usedIn: [],
  },
];

const SPOT_PARTICLE = [
  {
    sign: "Listen at the corner",
    tell: "Knock on the panel. Particle board sounds dull and hollow; solid wood and dense MDF feel solid and resonant.",
  },
  {
    sign: "Look under a shelf",
    tell: "The underside is rarely laminated. Particle board shows visible sawdust-and-chip texture; MDF is smooth and uniform.",
  },
  {
    sign: "Test a screw point",
    tell: "If you can wobble a screw out and back without resistance, the board has crumbled around the threads — a particle-board tell.",
  },
  {
    sign: "Watch the edges",
    tell: "Sharp factory edges with chunky grain visible inside the laminate seam usually mean particle board.",
  },
];

export default function MaterialsPage() {
  return (
    <MaterialsClient details={DETAILS}>
      {/* ============================================================ */}
      {/* HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="flex items-center gap-3" data-reveal>
            <span className="inline-block h-2 w-2 rounded-full bg-rust" />
            <p className="eyebrow text-muted">
              The shortlist · A 3-minute read
            </p>
          </div>

          <h1
            className="mt-6 font-display text-[14vw] leading-[0.95] tracking-[-0.025em] md:text-[10rem]"
            data-reveal
          >
            <span className="block">Two we trust.</span>
            <span className="block serif-italic text-walnut">
              One we refuse.
            </span>
          </h1>

          <div
            className="mt-10 grid gap-8 md:grid-cols-12 md:items-end"
            data-reveal
          >
            <p className="max-w-xl text-base text-muted md:col-span-7 md:text-lg">
              bare nest is built on a stricter shortlist than most furniture
              shops you&apos;ll walk into. Here&apos;s exactly what we use,
              where we use it, and the one material we&apos;ve chosen to
              refuse — and how to spot it before you buy.
            </p>

            {/* Stat strip */}
            <dl className="grid grid-cols-3 gap-4 md:col-span-5 md:gap-6">
              <Stat n="02" l="Materials we use" tint="leaf" />
              <Stat n="01" l="Refused on principle" tint="rust" />
              <Stat n="00" l="Particle-board SKUs" tint="walnut" />
            </dl>
          </div>

          {/* Floating swatch chips */}
          <div className="mt-12 flex flex-wrap gap-3" data-reveal>
            {DETAILS.map((d) => (
              <a
                key={d.code}
                href={`#${d.kind}`}
                className="group relative overflow-hidden rounded-2xl ring-1 ring-ink/10 transition-transform hover:-translate-y-1"
                style={{ width: 96, height: 96 }}
              >
                <div className="absolute inset-0">
                  <WoodSwatch kind={d.kind} />
                </div>
                <span
                  className={cn(
                    "absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] shadow-sm",
                    d.badgeClass
                  )}
                >
                  {d.code}
                </span>
                <span className="absolute inset-x-0 bottom-0 bg-bone/95 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink">
                  {d.name.split(" ")[0]}
                </span>
              </a>
            ))}
            <div className="hidden items-center gap-2 self-end pb-2 text-[10px] uppercase tracking-[0.22em] text-muted md:flex">
              <span className="h-px w-12 bg-ink/20" />
              Tap to jump
            </div>
          </div>
        </div>

        {/* Decorative pull marquee for visual rhythm */}
        <div className="mt-20 overflow-hidden border-y border-ink/10 bg-bone py-4">
          <div className="flex whitespace-nowrap will-change-transform animate-marquee gap-10">
            {[
              "Solid Wood",
              "·",
              "Dense MDF",
              "·",
              "No Particle Board",
              "·",
              "Refinishable",
              "·",
              "Honest Mid-Tier",
              "·",
              "Heirloom",
              "·",
              "Refused",
              "·",
            ]
              .concat([
                "Solid Wood",
                "·",
                "Dense MDF",
                "·",
                "No Particle Board",
                "·",
                "Refinishable",
                "·",
                "Honest Mid-Tier",
                "·",
                "Heirloom",
                "·",
                "Refused",
                "·",
              ])
              .map((w, i) => (
                <span
                  key={i}
                  className={cn(
                    "font-display text-3xl tracking-tight md:text-4xl",
                    w === "·" ? "text-rust" : ""
                  )}
                >
                  {w}
                </span>
              ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* DEEP-DIVE PANELS                                             */}
      {/* ============================================================ */}
      <div className="space-y-28 md:space-y-40">
        {DETAILS.map((d, i) => (
          <DetailPanel key={d.code} d={d} flipped={i % 2 === 1} />
        ))}
      </div>

      {/* ============================================================ */}
      {/* HOW TO SPOT PARTICLE BOARD                                   */}
      {/* ============================================================ */}
      <section className="relative mt-32 overflow-hidden bg-bark py-24 text-bone md:py-32">
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 select-none text-center">
          <h2 className="font-display text-[26vw] leading-none tracking-tight text-bone/[0.05] md:text-[16rem]">
            Refused
          </h2>
        </div>

        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid gap-12 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="eyebrow text-bone/60">A buyer&apos;s field guide</p>
              <h2 className="mt-3 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
                How to spot{" "}
                <span className="serif-italic text-clay">particle board.</span>
              </h2>
            </div>
            <p className="text-sm text-bone/70 md:col-span-5 md:text-base">
              Walk into any furniture showroom with this in your back pocket.
              If two of these four are true, you&apos;re probably looking at
              particle board — even if the laminate is glossy and the price
              tag isn&apos;t cheap.
            </p>
          </div>

          <ol className="mt-12 grid gap-5 md:grid-cols-2">
            {SPOT_PARTICLE.map((s, i) => (
              <li
                key={s.sign}
                className="relative rounded-3xl border border-bone/15 bg-bone/[0.04] p-6 backdrop-blur-sm md:p-8"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl leading-tight md:text-3xl">
                    {s.sign}
                  </h3>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-bone/40">
                    0{i + 1}
                  </span>
                </div>
                <p className="mt-3 text-sm text-bone/75 md:text-[15px]">
                  {s.tell}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-bone/15 bg-bark/60 px-6 py-5 md:px-8">
            <p className="font-display text-xl leading-tight md:text-2xl">
              Found particle board in your home?{" "}
              <span className="text-bone/60">
                Bring photos, we&apos;ll help you replace it.
              </span>
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-bone px-5 py-3 text-sm text-ink"
            >
              Get in touch
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* QUICK COMPARISON                                             */}
      {/* ============================================================ */}
      <section className="relative bg-bone py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <p className="eyebrow text-muted">The quick read</p>
          <h2 className="mt-3 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
            At a glance.
          </h2>

          <div className="mt-12 overflow-hidden rounded-3xl border border-ink/10 bg-cream/30">
            <ComparisonTable />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA                                                          */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-[1400px] px-6 pb-24 md:px-10">
        <div className="overflow-hidden rounded-[1.75rem] bg-ink p-10 text-bone md:p-16">
          <p className="eyebrow text-bone/60">Still deciding?</p>
          <h2 className="mt-3 font-display text-4xl leading-[1.1] md:text-6xl">
            Visit the showroom and{" "}
            <span className="serif-italic">touch&nbsp;the&nbsp;wood.</span>
          </h2>
          <p className="mt-5 max-w-xl text-sm text-bone/70 md:text-base">
            18 June 2026, Patna. Walk through the catalogue, knock on the
            boards, slide a drawer, and ask anything.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/showroom"
              className="group inline-flex items-center gap-3 rounded-full bg-bone px-6 py-3.5 text-sm text-ink"
            >
              Reserve a preview
              <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-bone transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-bone/30 px-6 py-3.5 text-sm text-bone hover:bg-bone/10"
            >
              Browse the catalogue
            </Link>
          </div>
        </div>
      </section>
    </MaterialsClient>
  );
}

/* ---------------------------------------------------------- */
function Stat({
  n,
  l,
  tint,
}: {
  n: string;
  l: string;
  tint: "leaf" | "rust" | "walnut";
}) {
  const tintCls = {
    leaf: "text-leaf",
    rust: "text-rust",
    walnut: "text-walnut",
  }[tint];
  return (
    <div className="rounded-2xl border border-ink/10 bg-cream/40 p-4 md:p-5">
      <div className={cn("font-display text-3xl leading-none md:text-5xl", tintCls)}>
        {n}
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted md:text-[11px]">
        {l}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------- */
function DetailPanel({ d, flipped }: { d: Detail; flipped: boolean }) {
  const refused = d.kind === "particle";
  return (
    <section
      id={d.kind}
      className="mx-auto max-w-[1400px] scroll-mt-32 px-6 md:px-10"
      data-section={d.kind}
    >
      <div
        className={cn(
          "grid gap-10 md:grid-cols-12 md:items-stretch md:gap-16",
          flipped && "md:[&>*:first-child]:order-2"
        )}
      >
        {/* SWATCH COLUMN */}
        <div className="md:col-span-5">
          <div className="sticky top-28 space-y-5">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-ink/10 shadow-[0_30px_60px_-30px_rgba(20,17,14,0.35)]">
              <div className="relative aspect-[4/5]">
                <WoodSwatch kind={d.kind} />
                <span
                  className={cn(
                    "absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] shadow-sm",
                    d.badgeClass
                  )}
                >
                  {d.badge}
                </span>
                <span className="absolute right-4 top-4 rounded-full bg-bone/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-ink backdrop-blur-sm">
                  Sample · {d.code}
                </span>
                {refused && (
                  <div className="absolute inset-0 grid place-items-center bg-bark/30">
                    <div className="rotate-[-6deg] rounded-md border-2 border-bone/85 bg-bark/85 px-6 py-2.5 text-xs uppercase tracking-[0.3em] text-bone shadow-lg">
                      Not stocked
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-ink/10 bg-cream/40 px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-muted">
                <span>{d.origin}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-medium",
                    refused
                      ? "bg-rust/10 text-rust"
                      : "bg-leaf/10 text-leaf"
                  )}
                >
                  {d.priceTier}
                </span>
              </div>
            </div>

            {/* Cross-section illustration */}
            <CrossSection kind={d.kind} />
          </div>
        </div>

        {/* COPY COLUMN */}
        <div className="md:col-span-7">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              {d.code} · Material
            </span>
            <span className="h-px flex-1 bg-ink/10" />
          </div>
          <h2 className="mt-4 font-display text-5xl leading-[1] tracking-tight md:text-7xl">
            {d.name}
          </h2>

          {/* Pull quote */}
          <blockquote className="mt-6 max-w-xl border-l-2 border-walnut pl-5 font-display text-xl italic text-walnut md:text-2xl">
            &ldquo;{d.pull}&rdquo;
          </blockquote>

          {/* Body */}
          <div className="mt-8 space-y-5 text-base leading-relaxed text-ink/85">
            {d.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Facts grid */}
          <dl className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {d.facts.map((f) => (
              <div
                key={f.k}
                className="rounded-2xl border border-ink/10 bg-cream/30 p-4"
              >
                <dt className="text-[10px] uppercase tracking-[0.18em] text-muted">
                  {f.k}
                </dt>
                <dd className="mt-1 font-display text-lg leading-tight">
                  {f.v}
                </dd>
              </div>
            ))}
          </dl>

          {/* Used in */}
          {d.usedIn.length > 0 && (
            <div className="mt-10">
              <p className="eyebrow text-muted">Used in</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {d.usedIn.map((u) => (
                  <span
                    key={u}
                    className="rounded-full border border-ink/15 bg-bone px-3 py-1.5 text-xs text-ink/85"
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Care */}
          {d.care.length > 0 && (
            <div className="mt-10">
              <p className="eyebrow text-muted">Care &amp; maintenance</p>
              <ul className="mt-4 space-y-2">
                {d.care.map((c, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span
                      aria-hidden
                      className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-walnut"
                    />
                    <span className="text-ink/80">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- */
function CrossSection({ kind }: { kind: "solid" | "mdf" | "particle" }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-cream/30 p-5">
      <p className="eyebrow text-muted">Cross-section</p>
      <div className="mt-3 overflow-hidden rounded-xl">
        <svg viewBox="0 0 400 100" className="h-20 w-full" aria-hidden>
          {kind === "solid" ? (
            <g>
              <rect width="400" height="100" fill="#5a3618" />
              {Array.from({ length: 14 }).map((_, i) => (
                <path
                  key={i}
                  d={`M-10 ${7 + i * 7} Q200 ${5 + i * 7} 410 ${8 + i * 7}`}
                  stroke="#1f1206"
                  strokeWidth="0.6"
                  opacity="0.55"
                  fill="none"
                />
              ))}
              <ellipse cx="120" cy="60" rx="14" ry="6" fill="#0f0803" opacity="0.7" />
            </g>
          ) : kind === "mdf" ? (
            <g>
              <rect width="400" height="100" fill="#b08c5d" />
              <rect width="400" height="8" fill="#5a3618" />
              <rect y="8" width="400" height="2" fill="#d8b387" />
              {Array.from({ length: 30 }).map((_, i) => (
                <line
                  key={i}
                  x1="0"
                  x2="400"
                  y1={12 + i * 3}
                  y2={12 + i * 3}
                  stroke="#5a3618"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              ))}
              <line x1="0" x2="400" y1="40" y2="40" stroke="#3a210f" strokeWidth="1" opacity="0.6" />
              <line x1="0" x2="400" y1="70" y2="70" stroke="#3a210f" strokeWidth="1" opacity="0.6" />
            </g>
          ) : (
            <g>
              <rect width="400" height="100" fill="#a07a4c" />
              {Array.from({ length: 40 }).map((_, i) => {
                const x = (i * 47) % 400;
                const y = ((i * 31) % 80) + 8;
                const s = ((i * 13) % 10) + 4;
                const colors = ["#6a4825", "#9c7849", "#7c5a32", "#b08c5d", "#5e3f1c"];
                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={s}
                    height={s * 0.7}
                    fill={colors[i % colors.length]}
                    transform={`rotate(${(i * 23) % 60} ${x + s / 2} ${y + s / 2})`}
                  />
                );
              })}
            </g>
          )}
        </svg>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        {kind === "solid" &&
          "Continuous grain through the full board. Visible knots and growth rings — every plank unique."}
        {kind === "mdf" &&
          "A dense, uniform fibre core with a thin matte veneer pressed onto the top face. Layers stay tight under load."}
        {kind === "particle" &&
          "Loose chips and shavings bound with adhesive. Voids show up at random; binding is weakest at the corners."}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------- */
function ComparisonTable() {
  const rows: { label: string; values: (string | "y" | "n")[] }[] = [
    { label: "Lifespan", values: ["30+ yrs", "8–12 yrs", "1–3 yrs"] },
    { label: "Repairable", values: ["y", "n", "n"] },
    { label: "Survives moves", values: ["y", "y", "n"] },
    { label: "Holds finish", values: ["y", "y", "n"] },
    { label: "Water-resistant edges", values: ["y", "y", "n"] },
    { label: "Stocked at bare nest", values: ["y", "y", "n"] },
  ];
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-ink/10 bg-cream/40">
          <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted">
            Property
          </th>
          {["Solid Wood", "Dense MDF", "Particle Board"].map((h, i) => (
            <th
              key={h}
              className={cn(
                "px-4 py-4 font-display text-base md:px-6 md:text-lg",
                i === 2 && "text-rust"
              )}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) => (
          <tr
            key={r.label}
            className={cn(
              "border-b border-ink/5 last:border-b-0",
              idx % 2 === 0 && "bg-bone/40"
            )}
          >
            <td className="px-6 py-4 text-sm text-ink/85">{r.label}</td>
            {r.values.map((v, j) => (
              <td key={j} className="px-4 py-4 md:px-6">
                {v === "y" ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-leaf/15 text-leaf ring-1 ring-leaf/20">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                ) : v === "n" ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-rust/15 text-rust ring-1 ring-rust/20">
                    <X className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                ) : (
                  <span className="text-sm">{v}</span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
