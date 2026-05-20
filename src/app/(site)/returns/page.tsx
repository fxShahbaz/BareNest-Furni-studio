import type { Metadata } from "next";
import Link from "next/link";
import { SHOWROOM } from "@/lib/utils";
import { CheckCircle2, ShieldCheck, Truck, MessageCircle, Mail, ArrowUpRight } from "lucide-react";
import FaqJsonLd from "@/components/seo/faq-json-ld";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description:
    "Bare Nest returns policy. Free exchange for damage in transit, wrong item, or manufacturing defects within 7 days of delivery. 12-month warranty on manufacturing defects. Custom-made pieces are non-returnable except for defects.",
  alternates: { canonical: "/returns" },
  openGraph: {
    title: "Returns & Exchanges — bare nest",
    description:
      "Damage in transit? We exchange. Manufacturing defect within 12 months? We repair or replace. Honest, simple, in writing.",
    url: "/returns",
    type: "article",
  },
};

const FAQ = [
  {
    q: "Can I return a piece because I changed my mind?",
    a: "No. Furniture is heavy, slow, and expensive to reverse-ship — we keep prices honest by not building those costs in. We'd rather you take your time before ordering: WhatsApp us for a video of the actual piece, finish samples, or detailed measurements first.",
  },
  {
    q: "What if my piece arrives damaged?",
    a: "We exchange it. Notify us on WhatsApp within 48 hours of delivery with photos and your order ID. We arrange pickup and dispatch a replacement at no cost to you.",
  },
  {
    q: "What counts as a manufacturing defect?",
    a: "Loose joinery, warped boards, finish lifting, hardware failing under normal use — anything that's our fault, not normal wear. Covered for 12 months from the delivery date. We repair on-site where possible, replace where it isn't.",
  },
  {
    q: "I ordered a custom size or finish — can I return it?",
    a: "Only for defects (damage in transit or manufacturing). Custom pieces are built for one room and one customer; we can't resell them. We confirm dimensions and finish in writing on WhatsApp before we start cutting, so there are no surprises.",
  },
  {
    q: "How do I raise a return or exchange?",
    a: `WhatsApp +91 9031 4287 28 with your order ID, a clear photo or short video, and a one-line description of the issue. We reply within a couple of hours during studio hours (09:30–19:00 IST, Mon–Sat).`,
  },
];

export default function ReturnsPage() {
  return (
    <>
      <FaqJsonLd items={FAQ} />
      <div className="pt-32 pb-24">
        <div className="mx-auto max-w-[920px] px-6 md:px-10">
          {/* HEADER */}
          <p className="eyebrow text-muted">Policy</p>
          <h1 className="mt-3 font-display text-5xl tracking-tight md:text-7xl">
            Returns &amp; <span className="serif-italic">exchanges.</span>
          </h1>
          <p className="mt-6 max-w-[60ch] text-base leading-relaxed text-muted md:text-lg">
            We exchange anything that arrives damaged, anything that&apos;s the
            wrong piece, and anything with a manufacturing defect. We don&apos;t
            accept change-of-mind returns on furniture — but we&apos;ll work
            harder than most to make sure you don&apos;t need one.
          </p>

          {/* COVERED — three pillars */}
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            <Card
              icon={<Truck className="h-4 w-4" />}
              title="Damage in transit"
              body="Notify us within 48 hours of delivery with photos. We arrange pickup and dispatch a replacement — no cost to you."
              tag="Exchange"
            />
            <Card
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Wrong item delivered"
              body="If what arrives doesn't match what you ordered, that's on us. We collect it and send the correct piece."
              tag="Exchange"
            />
            <Card
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Manufacturing defect"
              body="12 months from delivery. We repair on-site where we can, replace where we can't. Hardware, joinery, finish — all covered."
              tag="Repair or replace"
            />
          </div>

          {/* DETAILED POLICY */}
          <section className="mt-16">
            <h2 className="font-display text-3xl tracking-tight md:text-4xl">
              The whole policy, in plain words.
            </h2>

            <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-ink/85">
              <Section title="1 · What we exchange">
                <p>
                  Damage in transit, the wrong item, or a manufacturing defect
                  spotted on arrival — exchange or full refund. The choice is
                  yours.
                </p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5">
                  <li>Notify us within 48 hours of delivery.</li>
                  <li>
                    Share photos or a short video and your order ID over
                    WhatsApp.
                  </li>
                  <li>
                    We arrange pickup at our cost; the replacement ships in
                    parallel so you&apos;re not left waiting.
                  </li>
                </ul>
              </Section>

              <Section title="2 · The 12-month workmanship warranty">
                <p>
                  Every piece carries a 12-month warranty against manufacturing
                  defects from the date of delivery — loose joinery, warped
                  boards, finish lifting, hardware failing under normal use.
                </p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5">
                  <li>We repair on-site in Patna where possible.</li>
                  <li>Outside Patna, we either ship parts or arrange pickup.</li>
                  <li>
                    Where the defect can&apos;t be repaired, we replace the
                    piece.
                  </li>
                </ul>
              </Section>

              <Section title="3 · What we don't accept">
                <p>
                  We don&apos;t take returns or exchanges in these cases:
                </p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5">
                  <li>
                    <strong>Change of mind.</strong> The piece is fine, you
                    just don&apos;t want it any more — large-format furniture
                    is too costly to reverse-ship, and pricing it in would
                    raise everyone else&apos;s bill.
                  </li>
                  <li>
                    <strong>Fit issues you could have measured for.</strong>{" "}
                    Doorways, stairwells, lift dimensions — please measure
                    twice. We&apos;ll help you check before you order.
                  </li>
                  <li>
                    <strong>Custom-made pieces</strong> (custom dimensions,
                    finishes, materials) are non-returnable except for defects
                    above. We confirm specs in writing before cutting starts.
                  </li>
                  <li>
                    <strong>Damage caused after delivery</strong> by accidents,
                    misuse, or environmental factors (water, sunlight on
                    untreated surfaces, pet damage).
                  </li>
                </ul>
              </Section>

              <Section title="4 · How refunds work">
                <p>
                  Where you choose a refund instead of an exchange, we process
                  it within 7 working days of pickup confirmation, to the
                  original payment method. UPI and card refunds typically
                  settle in 2–4 days; bank transfers in 3–5.
                </p>
              </Section>

              <Section title="5 · How to raise a claim">
                <p>
                  WhatsApp is fastest:{" "}
                  <a
                    href={`https://wa.me/${SHOWROOM.whatsappE164}`}
                    className="font-medium underline underline-offset-4"
                  >
                    +91 9031 4287 28
                  </a>
                  . Send your order ID, a photo or short video, and a one-line
                  description. Or email{" "}
                  <a
                    href={`mailto:${SHOWROOM.email}`}
                    className="font-medium underline underline-offset-4"
                  >
                    {SHOWROOM.email}
                  </a>
                  . Studio hours 09:30–19:00 IST, Mon–Sat.
                </p>
              </Section>
            </div>
          </section>

          {/* CONTACT CTA */}
          <section className="mt-16 rounded-3xl border border-ink/10 bg-cream/40 p-8 md:p-10">
            <h2 className="font-display text-3xl tracking-tight md:text-4xl">
              Something arrived wrong?
            </h2>
            <p className="mt-3 max-w-[55ch] text-sm text-muted md:text-base">
              Don&apos;t live with it. Tell us within 48 hours and we&apos;ll
              make it right.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${SHOWROOM.whatsappE164}`}
                className="group inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-3 text-sm text-bone transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp the studio
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href={`mailto:${SHOWROOM.email}`}
                className="group inline-flex items-center gap-2 rounded-full border border-ink/15 bg-bone px-5 py-3 text-sm transition-colors hover:bg-ink/5"
              >
                <Mail className="h-4 w-4" />
                Email us
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 self-center text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                Other ways to reach us
              </Link>
            </div>
          </section>

          {/* FOOTER NOTE */}
          <p className="mt-10 text-xs leading-relaxed text-muted">
            This policy is in addition to your rights under the Consumer
            Protection Act, 2019. Nothing here limits a buyer&apos;s statutory
            remedies for defective goods. Last updated{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            .
          </p>
        </div>
      </div>
    </>
  );
}

function Card({
  icon,
  title,
  body,
  tag,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tag: string;
}) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-bone p-6">
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf/15 text-leaf">
          {icon}
        </span>
        <span className="rounded-full border border-ink/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">
          {tag}
        </span>
      </div>
      <h3 className="mt-5 font-display text-xl tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-display text-xl tracking-tight md:text-2xl">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
