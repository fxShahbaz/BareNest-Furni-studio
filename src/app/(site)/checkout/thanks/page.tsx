import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatINR, SHOWROOM } from "@/lib/utils";
import { ArrowRight, MessageCircle, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your bare nest order is recorded. We'll confirm on WhatsApp shortly.",
  robots: { index: false, follow: false },
};

type OrderRow = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  notes: string | null;
  items: Array<{ slug: string; name: string; qty: number; price: number; material: string }>;
  total: number;
  status: string;
  created_at: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  if (!id || !UUID_RE.test(id)) {
    return <Fallback />;
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("orders")
    .select(
      "id,customer_name,customer_phone,customer_address,notes,items,total,status,created_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return <Fallback />;
  const order = data as OrderRow;

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_E164 ?? SHOWROOM.whatsappE164;
  const lines = [
    `*bare nest order ${order.id.slice(0, 8).toUpperCase()}*`,
    `Name: ${order.customer_name}`,
    `Phone: ${order.customer_phone}`,
    `Address: ${order.customer_address}`,
    ``,
    `*Items*`,
    ...order.items.map(
      (i) =>
        `• ${i.name} (${i.material}) × ${i.qty} — ${formatINR(
          i.price * i.qty
        )}`
    ),
    ``,
    `Total: ${formatINR(order.total)}`,
    order.notes ? `Notes: ${order.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    lines
  )}`;

  const ref = order.id.slice(0, 8).toUpperCase();

  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-[900px] px-6 md:px-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-leaf">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Order recorded
        </div>

        <h1 className="mt-4 font-display text-5xl tracking-tight md:text-6xl">
          Thank you,{" "}
          <span className="serif-italic">
            {order.customer_name.split(" ")[0]}.
          </span>
        </h1>

        <p className="mt-4 max-w-[55ch] text-muted md:text-lg">
          Your order is in our books. The studio will confirm on WhatsApp
          shortly — usually within a few hours during business time
          (Mon–Sat, 9:30am–7pm IST).
        </p>

        {/* ref card */}
        <div className="mt-10 grid gap-4 rounded-3xl border border-ink/10 bg-cream/40 p-6 md:grid-cols-3 md:items-center md:p-8">
          <div>
            <p className="eyebrow text-muted">Order reference</p>
            <p className="mt-2 font-display text-3xl tracking-tight">{ref}</p>
            <p className="mt-1 text-xs text-muted">
              Keep this for any follow-up.
            </p>
          </div>
          <div className="md:col-span-2 md:text-right">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-full bg-ink px-6 py-4 text-sm text-bone transition-transform hover:-translate-y-0.5"
            >
              <MessageCircle className="h-4 w-4" />
              Send order on WhatsApp
              <span className="grid h-7 w-7 place-items-center rounded-full bg-bone text-ink transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </a>
            <p className="mt-3 text-xs text-muted">
              We&apos;ve also recorded it. WhatsApp is the fastest way to
              confirm delivery slot + payment mode.
            </p>
          </div>
        </div>

        {/* order summary */}
        <div className="mt-10 rounded-3xl border border-ink/10 p-6 md:p-8">
          <h2 className="font-display text-2xl">Order summary</h2>
          <ul className="mt-5 divide-y divide-ink/10">
            {order.items.map((i, idx) => (
              <li
                key={`${i.slug}-${idx}`}
                className="flex items-baseline justify-between gap-3 py-3 text-sm"
              >
                <span>
                  {i.name}{" "}
                  <span className="text-muted">
                    · {i.material} × {i.qty}
                  </span>
                </span>
                <span>{formatINR(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-baseline justify-between border-t border-ink/10 pt-4">
            <span className="font-display text-base">Total</span>
            <span className="font-display text-2xl">
              {formatINR(order.total)}
            </span>
          </div>
          <p className="mt-4 text-xs text-muted">
            Delivery details: {order.customer_address}
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-sm hover:bg-ink/5"
          >
            Keep browsing
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-sm hover:bg-ink/5"
          >
            Contact the studio
          </Link>
        </div>
      </div>
    </div>
  );
}

function Fallback() {
  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-[700px] px-6 text-center">
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">
          We couldn&apos;t find that order.
        </h1>
        <p className="mt-4 text-muted">
          If you just placed it, please refresh in a few seconds. Otherwise
          message us on WhatsApp and we&apos;ll look it up by your phone
          number.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-bone"
          >
            Back to shop
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-sm hover:bg-ink/5"
          >
            Contact the studio
          </Link>
        </div>
      </div>
    </div>
  );
}
