import type { Metadata } from "next";
import Image from "next/image";
import { Calendar, Clock, MapPin } from "lucide-react";
import InviteConfetti from "@/components/invite-confetti";
import InviteActions from "@/components/invite-actions";
import { SHOWROOM } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "You're invited — bare nest inauguration" },
  description:
    "Bare Nest Furni Studio inaugurates 18 June 2026 in Patna. Founded by Gaurav Bahri. Come celebrate with us.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "You're invited — bare nest inauguration",
    description: "18 June 2026 · 7:00 PM · Patna. Come celebrate with us.",
    type: "website",
  },
};

export default function InvitePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-cream/60">
      {/* Soft brand wash to give the cream depth. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,_rgba(194,85,43,0.18),_transparent_55%),radial-gradient(circle_at_85%_110%,_rgba(107,143,93,0.18),_transparent_55%)]"
      />

      {/* Confetti renders to a fixed canvas appended to body. */}
      <InviteConfetti />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-[860px] flex-col items-center justify-center px-6 py-16 text-center md:px-10 md:py-24">
        {/* Wordmark — mirrors the BrandLockup in the main header */}
        <div className="flex items-center gap-2.5">
          <span className="relative block aspect-square h-10 shrink-0 overflow-hidden rounded-xl bg-leaf/10 ring-1 ring-walnut/15 shadow-[0_2px_8px_-4px_rgba(20,17,14,0.15)]">
            <Image
              src="/logo-mark.png"
              alt="bare nest"
              fill
              priority
              sizes="40px"
              className="object-contain mix-blend-multiply"
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-wordmark text-[28px] leading-none tracking-tight">
              <span className="text-walnut">bare</span>
              <span className="ml-1 text-leaf">nest</span>
            </span>
            <span className="mt-1 text-[9px] uppercase tracking-[0.22em] text-muted">
              Furni Studio · Patna
            </span>
          </span>
        </div>

        {/* Eyebrow */}
        <p className="eyebrow mt-12 text-walnut/70">An invitation</p>

        {/* Headline */}
        <h1 className="mt-5 font-display text-6xl leading-[0.95] tracking-tight text-ink md:text-8xl">
          You&apos;re{" "}
          <span className="serif-italic text-rust">invited.</span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          to the inauguration of
        </p>
        <p className="mt-2 font-wordmark text-4xl text-walnut md:text-5xl">
          Bare Nest Furni Studio
        </p>

        {/* Ornament */}
        <div
          aria-hidden
          className="mt-10 flex items-center gap-4 text-walnut/40"
        >
          <span className="h-px w-12 bg-current md:w-20" />
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-rust">
            <path
              d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"
              fill="currentColor"
            />
          </svg>
          <span className="h-px w-12 bg-current md:w-20" />
        </div>

        {/* Event details */}
        <dl className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <DetailCard
            icon={<Calendar className="h-4 w-4" />}
            label="Date"
            primary="18 June"
            secondary="2026, Thursday"
          />
          <DetailCard
            icon={<Clock className="h-4 w-4" />}
            label="Time"
            primary="7:00 PM"
            secondary="Indian Standard Time"
          />
          <DetailCard
            icon={<MapPin className="h-4 w-4" />}
            label="Place"
            primary="Patna"
            secondary={SHOWROOM.address.lines.join(", ")}
          />
        </dl>

        {/* Founder note */}
        <blockquote className="mt-12 max-w-xl font-display text-xl italic leading-snug text-ink/80 md:text-2xl">
          &ldquo;Eight years on the shop floor brought us here. Come knock on
          the wood, slide a drawer, and stay for the chai.&rdquo;
        </blockquote>
        <p className="mt-4 text-sm uppercase tracking-[0.22em] text-walnut/70">
          — Gaurav Bahri, Founder
        </p>

        {/* Actions */}
        <InviteActions />

        {/* RSVP footnote */}
        <p className="mt-12 max-w-md text-xs leading-relaxed text-muted md:text-sm">
          A confirmation helps us plan tea, snacks, and seating.
          Forward this link to anyone you&apos;d like to bring along.
        </p>
      </section>
    </main>
  );
}

function DetailCard({
  icon,
  label,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  label: string;
  primary: string;
  secondary: string;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-bone/85 p-5 text-left shadow-[0_15px_45px_-25px_rgba(20,17,14,0.35)] backdrop-blur">
      <div className="flex items-center gap-2 text-walnut/80">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.22em]">{label}</span>
      </div>
      <p className="mt-3 font-display text-3xl leading-none tracking-tight text-ink">
        {primary}
      </p>
      <p className="mt-2 text-xs text-muted md:text-sm">{secondary}</p>
    </div>
  );
}
