"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type FAQ = { q: string; a: string };

type Intent = {
  id: string;
  label: string;
  blurb: string;
  message: string; // pre-filled WhatsApp body
};

const INTENTS: Intent[] = [
  {
    id: "buying",
    label: "I'm buying",
    blurb:
      "Help me pick the right piece for my room — sizing, finishes, lead time.",
    message:
      "Hi BareNest, I'm thinking about a piece from your catalogue. Could you help me with sizing and lead time?",
  },
  {
    id: "custom",
    label: "Custom or trade",
    blurb:
      "I'm an architect / designer / hotel — bulk pricing, custom dimensions, project quote.",
    message:
      "Hi BareNest, I'd like to discuss a project (custom dimensions / trade rates). Here's a quick brief:",
  },
  {
    id: "showroom",
    label: "Visit the showroom",
    blurb:
      "I want to walk in and see the catalogue, knock on the boards, ask anything.",
    message:
      "Hi BareNest, I'd like to plan a visit to the showroom. When's a good time to come by?",
  },
  {
    id: "press",
    label: "Press & partnerships",
    blurb:
      "Feature requests, interviews, collaborations with the studio.",
    message:
      "Hi BareNest, reaching out from [outlet/brand]. Could we set up a quick conversation?",
  },
];

// IST hours: studio is "open" (i.e. someone reads WhatsApp) 10:00–20:00 IST daily.
function useLiveStatus() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Convert to IST regardless of viewer's TZ.
  const ist = useMemo(() => {
    const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
    return new Date(utc + 5.5 * 60 * 60_000);
  }, [now]);

  const hour = ist.getHours();
  const minute = ist.getMinutes();
  const minutes = hour * 60 + minute;
  const OPEN = 10 * 60;
  const CLOSE = 20 * 60;
  const isOpen = minutes >= OPEN && minutes < CLOSE;
  const minsToNext = isOpen ? CLOSE - minutes : (OPEN - minutes + 24 * 60) % (24 * 60);
  return { isOpen, minsToNext, hour, minute };
}

function fmtMinsAway(m: number) {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h} hr` : `${h} hr ${r} min`;
}

export default function ContactClient({
  whatsappE164,
  email,
  studio,
  city,
  founder,
  faq,
}: {
  whatsappE164: string;
  email: string;
  studio: string;
  city: string;
  founder: string;
  faq: FAQ[];
}) {
  const [intent, setIntent] = useState<string>(INTENTS[0].id);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { isOpen, minsToNext } = useLiveStatus();

  const activeIntent = INTENTS.find((i) => i.id === intent) ?? INTENTS[0];

  // Editable compose state — initialised from the active intent's template,
  // re-initialised whenever the user picks a different intent.
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(activeIntent.message);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    // If the user hasn't edited the textarea, swap the message when they
    // change intent. If they have edited, don't clobber their writing.
    if (!touched) setMessage(activeIntent.message);
  }, [activeIntent, touched]);

  const composed = [
    message.trim(),
    "",
    name.trim() ? `— ${name.trim()}` : "",
    phone.trim() ? `Phone: ${phone.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const waUrl = `https://wa.me/${whatsappE164}?text=${encodeURIComponent(
    composed
  )}`;
  const mailUrl = `mailto:${email}?subject=${encodeURIComponent(
    `${activeIntent.label} — BareNest`
  )}&body=${encodeURIComponent(composed)}`;

  const charCount = message.length;
  const isValid = message.trim().length >= 8;

  return (
    <div className="relative pt-32 pb-24">
      {/* =================== HERO =================== */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          {/* Live availability pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-cream/60 py-1.5 pl-1.5 pr-4"
          >
            <span
              className={cn(
                "relative flex h-7 w-7 items-center justify-center rounded-full",
                isOpen ? "bg-leaf/15" : "bg-rust/10"
              )}
            >
              <span
                className={cn(
                  "absolute inline-flex h-2 w-2 rounded-full opacity-60",
                  isOpen ? "animate-ping bg-leaf" : "bg-rust"
                )}
              />
              <span
                className={cn(
                  "relative h-2 w-2 rounded-full",
                  isOpen ? "bg-leaf" : "bg-rust"
                )}
              />
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink/80">
              {isOpen ? "Studio reading messages" : "Studio is asleep"}
            </span>
            <span className="text-xs text-muted">
              {isOpen
                ? `Closes in ${fmtMinsAway(minsToNext)}`
                : `Opens in ${fmtMinsAway(minsToNext)}`}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-8 font-display text-[15vw] leading-[0.92] tracking-[-0.025em] md:text-[10rem]"
          >
            <span className="block">Talk to</span>
            <span className="relative inline-block">
              <span className="serif-italic text-walnut">the studio.</span>
              <svg
                aria-hidden
                viewBox="0 0 380 22"
                className="absolute -bottom-1.5 left-0 w-[88%]"
              >
                <path
                  d="M3 12 Q 90 2 180 10 T 376 8"
                  fill="none"
                  stroke="#c2552b"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-8 max-w-xl text-base text-muted md:text-lg"
          >
            Until the showroom opens on 18 June 2026, WhatsApp is the
            quickest line to us. For everything else, the email goes
            straight to {founder}.
          </motion.p>

          {/* Quick fact strip */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            <FactCard k="Reply time" v="~2 hrs" l="On WhatsApp during day" />
            <FactCard k="Studio hours" v="10–20 IST" l="Daily" />
            <FactCard k="Studio city" v={city} l="India" />
            <FactCard k="Inauguration" v="18 Jun 26" l="Showroom opens" />
          </motion.div>
        </div>
      </section>

      {/* =================== INTENT PICKER + WHATSAPP =================== */}
      <section className="mt-28 md:mt-36">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:gap-14">
            {/* Intent column */}
            <div className="md:col-span-5">
              <p className="eyebrow text-muted">Step one</p>
              <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
                What are you reaching out about?
              </h2>
              <p className="mt-3 text-sm text-muted md:text-base">
                Pick one — we&apos;ll pre-fill the right message so you
                don&apos;t have to introduce yourself twice.
              </p>

              <div className="mt-8 space-y-2.5">
                {INTENTS.map((it) => {
                  const isActive = intent === it.id;
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setIntent(it.id)}
                      className={cn(
                        "group relative w-full rounded-2xl border p-5 text-left transition-all",
                        isActive
                          ? "border-ink bg-ink text-bone shadow-[0_15px_40px_-20px_rgba(20,17,14,0.4)]"
                          : "border-ink/10 bg-cream/40 hover:border-ink/30"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={cn(
                            "font-display text-xl md:text-2xl",
                            !isActive && "text-ink"
                          )}
                        >
                          {it.label}
                        </span>
                        <span
                          className={cn(
                            "grid h-8 w-8 place-items-center rounded-full ring-1 transition-colors",
                            isActive
                              ? "bg-bone text-ink ring-bone/40"
                              : "bg-transparent text-ink/60 ring-ink/15 group-hover:bg-ink/5"
                          )}
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <p
                        className={cn(
                          "mt-2 text-sm",
                          isActive ? "text-bone/70" : "text-muted"
                        )}
                      >
                        {it.blurb}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compose column — real editable form, not a mock preview */}
            <div className="md:col-span-7">
              <p className="eyebrow text-muted">Step two</p>
              <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
                Write your{" "}
                <span className="serif-italic text-walnut">message.</span>
              </h2>
              <p className="mt-3 text-sm text-muted md:text-base">
                We&apos;ve drafted a starting line — edit it, add your
                details, then pick where to send it.
              </p>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-8 rounded-3xl border border-ink/10 bg-cream/40 p-5 md:p-7"
              >
                {/* Message textarea */}
                <label className="block">
                  <div className="flex items-baseline justify-between">
                    <span className="eyebrow text-muted">Your message</span>
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-[0.18em]",
                        charCount < 8 ? "text-rust/70" : "text-muted"
                      )}
                    >
                      {charCount} chars
                    </span>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => {
                      setTouched(true);
                      setMessage(e.target.value);
                    }}
                    rows={5}
                    placeholder="Tell us about your project, sizing, or whatever's on your mind."
                    className="mt-2 w-full resize-y rounded-2xl border border-ink/15 bg-bone px-4 py-3 text-sm leading-relaxed focus:border-ink focus:outline-none md:text-[15px]"
                  />
                </label>

                {/* Optional name + phone */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="eyebrow text-muted">Your name</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Optional"
                      className="mt-2 w-full rounded-full border border-ink/15 bg-bone px-4 py-2.5 text-sm focus:border-ink focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow text-muted">Phone</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Optional · for callback"
                      className="mt-2 w-full rounded-full border border-ink/15 bg-bone px-4 py-2.5 text-sm focus:border-ink focus:outline-none"
                    />
                  </label>
                </div>

                {/* Send buttons */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <a
                    href={isValid ? waUrl : undefined}
                    target={isValid ? "_blank" : undefined}
                    rel="noreferrer"
                    aria-disabled={!isValid}
                    onClick={(e) => {
                      if (!isValid) e.preventDefault();
                    }}
                    className={cn(
                      "group flex items-center justify-between gap-2 rounded-full px-5 py-3.5 text-sm font-medium transition-transform",
                      isValid
                        ? "bg-leaf text-bone hover:-translate-y-0.5"
                        : "cursor-not-allowed bg-leaf/30 text-bone/80"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <WhatsAppIcon className="h-4 w-4" />
                      Send on WhatsApp
                    </span>
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-bone text-leaf transition-transform group-hover:translate-x-0.5">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </a>

                  <a
                    href={isValid ? mailUrl : undefined}
                    aria-disabled={!isValid}
                    onClick={(e) => {
                      if (!isValid) e.preventDefault();
                    }}
                    className={cn(
                      "group flex items-center justify-between gap-2 rounded-full border px-5 py-3.5 text-sm font-medium transition-colors",
                      isValid
                        ? "border-ink text-ink hover:bg-ink hover:text-bone"
                        : "cursor-not-allowed border-ink/20 text-ink/40"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <MailIcon className="h-4 w-4" />
                      Email instead
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </div>

                {/* Helper line */}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isOpen ? "bg-leaf" : "bg-rust"
                      )}
                    />
                    {isOpen ? "Studio reads now" : "Replies tomorrow"}
                  </span>
                  <span>·</span>
                  <span>No account needed</span>
                  <span>·</span>
                  <span>Reaches the studio direct</span>
                </div>
              </form>

              {/* Quick-copy contact row */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a
                  href={`mailto:${email}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-cream/40 px-5 py-3 transition-shadow hover:shadow-[0_15px_40px_-25px_rgba(20,17,14,0.3)]"
                >
                  <span>
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-muted">
                      Email
                    </span>
                    <span className="font-display text-sm">{email}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-ink/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
                <Link
                  href="/showroom"
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-cream/40 px-5 py-3 transition-shadow hover:shadow-[0_15px_40px_-25px_rgba(20,17,14,0.3)]"
                >
                  <span>
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-muted">
                      Visit
                    </span>
                    <span className="font-display text-sm">
                      {studio}, {city}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-ink/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================== FOUNDER NOTE =================== */}
      <section className="mt-28 md:mt-36">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-bark px-8 py-12 text-bone md:px-16 md:py-20">
            <div className="pointer-events-none absolute -right-10 -top-10 select-none">
              <svg
                viewBox="0 0 200 200"
                aria-hidden
                className="h-64 w-64 opacity-[0.06] md:h-80 md:w-80"
              >
                <path
                  d="M30 80 Q50 30 100 30 Q150 30 170 80 L170 170 L30 170 Z"
                  fill="none"
                  stroke="#f6f3ec"
                  strokeWidth="2"
                />
                <path
                  d="M100 90 Q90 110 100 130 Q110 110 100 90"
                  fill="#f6f3ec"
                />
              </svg>
            </div>

            <div className="grid gap-10 md:grid-cols-12 md:items-center">
              <div className="md:col-span-3">
                <div className="relative aspect-square overflow-hidden rounded-[1.5rem]">
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-br from-walnut to-clay opacity-80"
                  />
                  <div className="absolute inset-0 grid place-items-center font-display text-7xl text-bone/90">
                    {founder
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                </div>
              </div>
              <div className="md:col-span-9 md:pl-6">
                <p className="eyebrow text-bone/60">A note from the founder</p>
                <p className="mt-4 font-display text-2xl leading-[1.25] md:text-3xl">
                  &ldquo;If you&apos;re unsure whether something will fit, or
                  whether MDF is right for your dining room, just write to me.
                  No salesperson, no script — you&apos;ll get an honest
                  answer, even if the honest answer is{" "}
                  <span className="serif-italic">don&apos;t buy it.</span>
                  &rdquo;
                </p>
                <p className="mt-5 text-sm text-bone/70">
                  — {founder}, founder
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================== FAQ =================== */}
      <section className="mt-28 md:mt-36">
        <div className="mx-auto max-w-[1100px] px-6 md:px-10">
          <p className="eyebrow text-muted">Common questions</p>
          <h2 className="mt-3 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
            Quick answers.
          </h2>

          <ul className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
            {faq.map((f, i) => {
              const open = openFaq === i;
              return (
                <li key={f.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-ink/70"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted md:inline">
                        0{i + 1}
                      </span>
                      <span className="font-display text-xl md:text-2xl">
                        {f.q}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/15 transition-transform",
                        open ? "bg-ink text-bone rotate-180" : "bg-bone"
                      )}
                    >
                      {open ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  <div
                    className={cn(
                      "grid overflow-hidden transition-all duration-500 ease-out",
                      open ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="min-h-0">
                      <p className="max-w-2xl pl-0 text-sm leading-relaxed text-ink/80 md:pl-14 md:text-base">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* =================== CTA RIBBON =================== */}
      <section className="mt-28 md:mt-36">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="flex flex-col items-start gap-6 rounded-[1.5rem] border border-ink/10 bg-cream/40 px-8 py-10 md:flex-row md:items-center md:justify-between md:px-12">
            <div>
              <p className="eyebrow text-muted">Still browsing?</p>
              <h3 className="mt-2 font-display text-3xl leading-tight md:text-4xl">
                Peek at the catalogue while you decide.
              </h3>
            </div>
            <div className="flex gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-bone"
              >
                Browse the shop
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/materials"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-sm text-ink hover:bg-ink/5"
              >
                Materials guide
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FactCard({ k, v, l }: { k: string; v: string; l: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-cream/30 p-4 md:p-5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{k}</p>
      <p className="mt-1.5 font-display text-2xl leading-tight md:text-3xl">
        {v}
      </p>
      <p className="mt-1 text-[11px] text-muted">{l}</p>
    </div>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1c-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5-.2 0-.4 0-.6 0s-.5.1-.8.4c-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 1.7.7 2.4.8 3.3.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2.5c-5.2 0-9.5 4.3-9.5 9.5 0 1.7.5 3.3 1.3 4.7L2 21.5l5-1.3c1.4.7 2.9 1.1 4.5 1.1h.5c5.2 0 9.5-4.3 9.5-9.5S17.2 2.5 12 2.5z" />
    </svg>
  );
}
