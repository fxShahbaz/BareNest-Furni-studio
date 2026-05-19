import Image from "next/image";
import Link from "next/link";
import { SHOWROOM } from "@/lib/utils";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Eight years of furniture-making in north India, a notebook of every failure, and the decision to start a studio in Patna that refuses to stock particle board.",
  alternates: { canonical: "/story" },
  openGraph: {
    title: "Our Story — BareNest",
    description:
      "How Gaurav Bahri's eight years on the shop floor became Bare Nest Furni Studio.",
    url: "/story",
    type: "article",
  },
};

type Milestone = {
  year: string;
  title: string;
  body: string;
  tag: "shop-floor" | "lesson" | "decision" | "build" | "launch";
};

const MILESTONES: Milestone[] = [
  {
    year: "2018",
    title: "Walks onto a shop floor in Patna",
    body: "Gaurav joins a local furniture showroom as a junior. First week, he watches a customer get sold an MDF bed but receive a particle-board frame. Nobody on the floor flags it.",
    tag: "shop-floor",
  },
  {
    year: "2019",
    title: "The 18-month tells start showing up",
    body: "Customers from his early sales begin returning. Same complaint, different families: drawers won't close, screws have stripped, a wardrobe back has bowed. He starts a notebook of every failure.",
    tag: "lesson",
  },
  {
    year: "2020",
    title: "Becomes the 'problem orders' person",
    body: "Word gets around the shop that Gaurav actually knows what goes inside the boards. He's quietly assigned the tricky enquiries — architects, repeat buyers, anyone who asks a second question.",
    tag: "shop-floor",
  },
  {
    year: "2021",
    title: "Manages a small showroom",
    body: "Promoted to manage a 1,200 sq ft showroom. He pushes to remove particle-board lines from the floor. Management says the margin is too good. He starts mentally sketching what he'd stock instead.",
    tag: "decision",
  },
  {
    year: "2022",
    title: "First commission, off the books",
    body: "A friend's family asks if he can 'just get a real wood bed made'. He works with a craftsman in Boring Road over weekends. The bed lands well. Three more orders follow in six weeks.",
    tag: "build",
  },
  {
    year: "2023",
    title: "Quiet workshop visits",
    body: "Most evenings, a tour of carpentry units in and around Patna. He builds a shortlist of seven craftspeople whose joints don't open up after a season — the ones BareNest will start with.",
    tag: "build",
  },
  {
    year: "2024",
    title: "Names the studio. Draws the brand.",
    body: "BareNest goes from notebook entries to a real plan. The materials shortlist gets ruthless: solid wood, dense MDF, and an explicit refusal of particle board. Even at the cheapest tier.",
    tag: "decision",
  },
  {
    year: "2025",
    title: "First catalogue takes shape",
    body: "Eleven launch pieces in sheesham, teak, mango, ash, and dense MDF. Hardwax oil finishes for the solid-wood line. Matte veneer for MDF. A showroom space secured in Patna for inauguration.",
    tag: "build",
  },
  {
    year: "2026",
    title: "Bare Nest Furni Studio opens — 18 June",
    body: "The catalogue you can browse here will be on the floor. Walk in, knock on the boards, slide a drawer, ask anything. Honest materials, eight years in the making.",
    tag: "launch",
  },
];

const PRINCIPLES = [
  {
    n: "01",
    title: "We refuse particle board.",
    body: "Not as a marketing line — as a sourcing rule. Even when a customer asks for the cheapest possible piece, we'll explain the trade-off and decline rather than stock something we know will fail.",
  },
  {
    n: "02",
    title: "Two materials, no third.",
    body: "Solid wood for the pieces that should outlast the family that bought them. Dense MDF where engineered makes more sense than solid. That's the whole shortlist.",
  },
  {
    n: "03",
    title: "Honest finishes, not hidden ones.",
    body: "Hardwax oil on solid wood instead of thick polyurethane that hides flaws. Matte veneers on MDF instead of high-gloss laminate. What you see is what's there.",
  },
  {
    n: "04",
    title: "The studio answers, not a bot.",
    body: "WhatsApp goes to the founder until it can't anymore. If we say a piece behaves a certain way, it's because we've watched one do it.",
  },
];

const PROCESS = [
  {
    step: "Source",
    body: "Indian-grown sheesham, teak, mango, and ash from suppliers we've vetted in person. Dense, kiln-dried boards only — anything that fails the moisture meter goes back.",
  },
  {
    step: "Season",
    body: "Stock is acclimatised in our partner workshops for weeks before any joinery starts. Wood that's rushed splits later; we don't rush.",
  },
  {
    step: "Build",
    body: "Mortise-and-tenon, dovetails, dowels where they belong. Screws into solid blocks, never into board edges. The joints decide how a piece ages.",
  },
  {
    step: "Finish",
    body: "Hardwax oil rubbed in, dried, and buffed by hand on the solid-wood line. Matte veneer pressed and edge-banded on MDF. Sample swatches sent on request.",
  },
  {
    step: "Deliver",
    body: "Insured carriers across India. Two-person install for anything over 60 kg. We don't disappear after the invoice — re-oil visits and small fixes are on us in year one.",
  },
];

const NUMBERS = [
  { n: "8", l: "Years on the shop floor" },
  { n: "11", l: "Pieces in the launch catalogue" },
  { n: "7", l: "Workshop partners vetted" },
  { n: "0", l: "Particle-board SKUs, ever" },
];

const VOICES = [
  {
    quote:
      "Gaurav explained why our dining table kept splitting. Nobody else had bothered. Replaced it with a teak one from his shortlist three years later — still flat, still solid.",
    who: "Anjali R.",
    role: "early commission, 2022",
  },
  {
    quote:
      "He turned down a custom particle-board wardrobe order from us. Cheaper would have been an easy yes; he insisted on MDF instead and explained why.",
    who: "Rohit B.",
    role: "architect, Patna",
  },
  {
    quote:
      "Came in for one nightstand, walked out with a phone full of board cross-sections and the kind of pep-talk you don't get at most stores.",
    who: "Meera K.",
    role: "first-home buyer",
  },
];

export default function StoryPage() {
  return (
    <div className="relative pb-24 pt-32 md:pt-40">
      {/* ============================================================ */}
      {/* HERO                                                         */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="inline-block h-2 w-2 rounded-full bg-rust" />
          <p className="eyebrow text-muted">
            Our story · Eight years · One stricter shortlist
          </p>
        </div>

        <h1 className="mt-6 font-display text-[14vw] leading-[0.95] tracking-[-0.025em] md:text-[10rem]">
          <span className="block">Built by</span>
          <span className="block serif-italic text-walnut">the shop floor.</span>
        </h1>

        <div className="mt-12 grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="text-lg leading-relaxed text-ink/85 md:text-2xl">
              BareNest exists because {SHOWROOM.founder} spent eight years on
              the other side of the counter — watching customers buy furniture
              they didn&apos;t fully understand, and watching it fall apart
              eighteen months later.
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              This page is the version of the brand we wish someone had handed
              us when we first walked into a furniture showroom. Eight years
              of notes, one strict shortlist, and a showroom opening in Patna
              on 18 June 2026.
            </p>
          </div>

          <div className="md:col-span-5">
            <dl className="grid grid-cols-2 gap-3">
              {NUMBERS.map((s) => (
                <div
                  key={s.l}
                  className="rounded-2xl border border-ink/10 bg-cream/40 p-5"
                >
                  <dt className="font-display text-5xl leading-none text-ink md:text-6xl">
                    {s.n}
                  </dt>
                  <dd className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted md:text-[11px]">
                    {s.l}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOUNDER PANEL                                                */}
      {/* ============================================================ */}
      <section className="relative mt-32 md:mt-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem]">
                <Image
                  src="https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=900&q=80"
                  alt="Inside a Patna workshop where BareNest pieces are built"
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bark/40 via-transparent" />
                <div className="absolute inset-x-5 bottom-5 flex items-center justify-between text-bone">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-bone/70">
                      Partner workshop
                    </p>
                    <p className="mt-1 font-display text-lg">Boring Road, Patna</p>
                  </div>
                  <span className="rounded-full bg-bone px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ink">
                    Live
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 md:pl-6">
              <p className="eyebrow text-muted">The founder</p>
              <h2 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight md:text-6xl">
                {SHOWROOM.founder}
              </h2>
              <p className="mt-2 text-sm uppercase tracking-[0.18em] text-walnut/80">
                Eight years on the floor · Now running the studio
              </p>

              <blockquote className="mt-8 max-w-2xl border-l-2 border-walnut pl-5 font-display text-xl italic text-walnut md:text-2xl">
                &ldquo;The furniture business doesn&apos;t need more catalogues.
                It needs fewer compromises. BareNest is my answer to the one
                compromise everyone else makes — particle board — and the two
                materials I&apos;ll stand behind without flinching.&rdquo;
              </blockquote>

              <div className="mt-10 space-y-5 text-base leading-relaxed text-ink/85">
                <p>
                  Gaurav started selling furniture in 2018, learning the
                  catalogue from a senior who&apos;d been at it for thirty
                  years. The thing nobody put in print: most of what was on
                  the floor was particle board with a laminate on top, sold as
                  if it were anything else.
                </p>
                <p>
                  He spent the next seven years keeping a quiet notebook of
                  failures, customer complaints, joint-types, finishes, and
                  workshop partners. BareNest is that notebook, opened up and
                  built into a studio.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-bone"
                >
                  Write to Gaurav
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/materials"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-sm text-ink hover:bg-ink/5"
                >
                  Read the materials guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TIMELINE                                                     */}
      {/* ============================================================ */}
      <section className="mt-32 md:mt-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="eyebrow text-muted">The slow path</p>
              <h2 className="mt-3 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
                From shop floor to{" "}
                <span className="serif-italic text-walnut">studio.</span>
              </h2>
            </div>
            <p className="text-sm text-muted md:col-span-5 md:text-base">
              Nine moments between 2018 and the showroom inauguration on
              18 June 2026 — the lessons, the calls, and the quiet decisions
              that shaped BareNest&apos;s shortlist.
            </p>
          </div>

          <ol className="relative mt-16">
            {/* Vertical spine */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-walnut/30 via-walnut/15 to-transparent md:left-1/2"
            />

            {MILESTONES.map((m, i) => (
              <TimelineNode key={m.year} m={m} index={i} />
            ))}
          </ol>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PRINCIPLES                                                   */}
      {/* ============================================================ */}
      <section className="mt-32 bg-bark py-24 text-bone md:mt-40 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <p className="eyebrow text-bone/60">What we stand by</p>
          <h2 className="mt-3 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
            Four rules,{" "}
            <span className="serif-italic text-clay">non-negotiable.</span>
          </h2>

          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <article
                key={p.n}
                className="group rounded-[1.5rem] border border-bone/15 bg-bone/[0.04] p-7 transition-colors hover:bg-bone/[0.08] md:p-8"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/50">
                    Rule {p.n}
                  </span>
                  <span className="h-px flex-1 bg-bone/15" />
                </div>
                <h3 className="mt-4 font-display text-2xl leading-tight md:text-3xl">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm text-bone/75 md:text-[15px]">
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* HOW A PIECE IS MADE                                          */}
      {/* ============================================================ */}
      <section className="mt-32 md:mt-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <p className="eyebrow text-muted">From log to your living room</p>
              <h2 className="mt-3 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
                How a piece is{" "}
                <span className="serif-italic text-walnut">made.</span>
              </h2>
            </div>
            <p className="text-sm text-muted md:col-span-4 md:text-base">
              Five steps, in order. The whole thing takes 4–7 weeks for solid
              wood, 2–3 weeks for MDF. We don&apos;t skip any of them.
            </p>
          </div>

          <ol className="mt-14 grid gap-4 md:grid-cols-5 md:gap-5">
            {PROCESS.map((p, i) => (
              <li
                key={p.step}
                className="relative flex h-full flex-col rounded-3xl border border-ink/10 bg-cream/40 p-6"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-walnut text-bone">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
                <h3 className="mt-6 font-display text-2xl leading-tight">
                  {p.step}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/75">
                  {p.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================================================ */}
      {/* VOICES                                                       */}
      {/* ============================================================ */}
      <section className="mt-32 md:mt-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <p className="eyebrow text-muted">Quiet word-of-mouth</p>
          <h2 className="mt-3 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
            Before the showroom,{" "}
            <span className="serif-italic text-walnut">the conversation.</span>
          </h2>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {VOICES.map((v, i) => (
              <figure
                key={i}
                className="flex h-full flex-col rounded-3xl border border-ink/10 bg-cream/40 p-7"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-walnut/60"
                  aria-hidden
                >
                  <path
                    d="M7 7h3v3H7V7zm0 5h3v3H7v-3zM6 4h6c2 0 3 1 3 3v8c0 2-1 3-3 3H6V4z"
                    fill="currentColor"
                    opacity="0.18"
                  />
                  <path
                    d="M10 7H7v3h3V7zm0 5H7v3h3v-3z"
                    fill="currentColor"
                  />
                </svg>
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-ink/85">
                  {v.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-ink/10 pt-4">
                  <p className="font-display text-base">{v.who}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    {v.role}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* WHAT'S NEXT                                                  */}
      {/* ============================================================ */}
      <section className="mt-32 md:mt-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="eyebrow text-muted">What&apos;s next</p>
              <h2 className="mt-3 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
                After 18 June.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-6 text-base leading-relaxed text-ink/85 md:text-lg">
              <p>
                The showroom in Patna is the first physical home for the
                catalogue you can browse here. From day one, every piece on
                the floor is one we&apos;ll defend by material, joint, and
                finish.
              </p>
              <p>
                In year one, we&apos;ll widen the solid-wood line slowly, add
                a dedicated dining-room corner, and start sample-led
                consultations for architects and small hospitality clients.
              </p>
              <p>
                What we will <em className="serif-italic">not</em> do is
                expand the catalogue at the cost of the shortlist. No
                particle-board tier &mdash; not even &ldquo;just for the
                budget customers&rdquo;. The whole point of BareNest is the
                line we won&apos;t cross.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA                                                          */}
      {/* ============================================================ */}
      <section className="mx-auto mt-32 max-w-[1400px] px-6 md:mt-40 md:px-10">
        <div className="overflow-hidden rounded-[1.75rem] bg-ink p-10 text-bone md:p-16">
          <p className="eyebrow text-bone/60">Walk in on 18 June</p>
          <h2 className="mt-3 font-display text-4xl leading-[1.1] md:text-6xl">
            Solid wood. Honest MDF.{" "}
            <span className="serif-italic">Nothing else.</span>
          </h2>
          <p className="mt-5 max-w-xl text-sm text-bone/70 md:text-base">
            {SHOWROOM.studio} opens its physical doors on 18 June 2026 in
            Patna. Walk in, knock on the boards, slide a drawer, ask anything.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 rounded-full bg-bone px-6 py-3.5 text-sm text-ink"
            >
              See the catalogue
              <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-bone transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            <Link
              href="/showroom"
              className="inline-flex items-center gap-2 rounded-full border border-bone/30 px-6 py-3.5 text-sm text-bone hover:bg-bone/10"
            >
              Reserve a preview
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-bone/30 px-6 py-3.5 text-sm text-bone hover:bg-bone/10"
            >
              Write to the studio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------- */
function TimelineNode({ m, index }: { m: Milestone; index: number }) {
  const tagColor = {
    "shop-floor": "bg-muted/15 text-muted",
    lesson: "bg-rust/15 text-rust",
    decision: "bg-walnut/15 text-walnut",
    build: "bg-leaf/15 text-leaf",
    launch: "bg-ink text-bone",
  }[m.tag];

  const tagLabel = {
    "shop-floor": "Shop floor",
    lesson: "Lesson learned",
    decision: "Decision",
    build: "Build",
    launch: "Launch",
  }[m.tag];

  const left = index % 2 === 0;

  return (
    <li
      className={cn(
        "relative grid pb-12 last:pb-0 md:grid-cols-2 md:gap-10",
        // mobile: indent past the spine
        "pl-12 md:pl-0"
      )}
    >
      {/* Spine dot */}
      <span
        aria-hidden
        className={cn(
          "absolute h-4 w-4 rounded-full border-2 border-bone bg-walnut shadow-[0_0_0_4px_rgba(90,58,34,0.12)]",
          "left-[10px] top-1 md:left-1/2 md:-translate-x-1/2"
        )}
      />

      {/* Year side */}
      <div className={cn("md:text-right", left ? "md:order-1" : "md:order-2")}>
        <div
          className={cn(
            "inline-block",
            left ? "md:pr-8" : "md:pl-8"
          )}
        >
          <p className="font-display text-4xl leading-none tracking-tight text-walnut md:text-6xl">
            {m.year}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted">
            {tagLabel}
          </p>
        </div>
      </div>

      {/* Content side */}
      <div
        className={cn(
          left ? "md:order-2 md:pl-8" : "md:order-1 md:pr-8 md:text-right"
        )}
      >
        <div className="rounded-3xl border border-ink/10 bg-cream/40 p-6 md:p-7">
          <span
            className={cn(
              "inline-block rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]",
              tagColor
            )}
          >
            {tagLabel}
          </span>
          <h3 className="mt-3 font-display text-2xl leading-tight md:text-3xl">
            {m.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink/80 md:text-[15px]">
            {m.body}
          </p>
        </div>
      </div>
    </li>
  );
}
