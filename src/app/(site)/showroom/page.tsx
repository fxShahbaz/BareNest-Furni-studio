import type { Metadata } from "next";
import Link from "next/link";
import { SHOWROOM } from "@/lib/utils";
import LaunchEventJsonLd from "@/components/seo/launch-event-json-ld";

export const metadata: Metadata = {
  title: "Showroom · Patna",
  description:
    "Reserve a preview slot for Bare Nest Furni Studio. Honest furniture in Patna, Bihar — opening 18 June 2026.",
  alternates: { canonical: "/showroom" },
  openGraph: {
    title: "Visit the Showroom — bare nest, Patna",
    description:
      "Bare Nest Furni Studio opens 18 June 2026 in Patna. Reserve a preview slot.",
    url: "/showroom",
    type: "website",
  },
};

export default function ShowroomPage() {
  return (
    <div className="pt-32 pb-24">
      <LaunchEventJsonLd />
      <div className="mx-auto max-w-[1100px] px-6 md:px-10">
        <p className="eyebrow text-muted">Showroom</p>
        <h1 className="mt-3 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
          {SHOWROOM.studio}{" "}
          <span className="serif-italic">opens 18 June 2026.</span>
        </h1>

        <p className="mt-6 max-w-xl text-base text-muted">
          Reserve a preview slot in the weeks before inauguration, or drop us a
          line for trade access and large orders.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <Card title="Reserve a preview">
            Limited preview slots in early June for design partners and
            architects.{" "}
            <a className="underline-offset-4 hover:underline" href={`mailto:${SHOWROOM.email}`}>
              {SHOWROOM.email}
            </a>
          </Card>
          <Card title="Visit at launch">
            Inauguration: 18 June 2026, 10:00 AM IST.
            <span className="mt-3 block whitespace-pre-line text-muted">
              {`${SHOWROOM.studio}\n${SHOWROOM.address.lines.join("\n")}`}
            </span>
          </Card>
          <Card title="Architects & designers">
            We work with practices on custom dimensions, finishes, and bulk
            orders. Trade pricing on request.
          </Card>
          <Card title="WhatsApp the studio">
            <Link
              href={`https://wa.me/${SHOWROOM.whatsappE164}`}
              className="underline-offset-4 hover:underline"
            >
              Open chat
            </Link>{" "}
            — quickest way to reach us before launch.
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-cream/40 p-8">
      <p className="eyebrow text-muted">{title}</p>
      <p className="mt-3 text-base text-ink/85">{children}</p>
    </div>
  );
}
