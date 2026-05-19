import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getMyProfile } from "@/lib/queries/profile";
import { formatINR } from "@/lib/utils";
import { formatPhoneForDisplay } from "@/lib/phone";
import {
  MessageCircle,
  Package,
  FileText,
  ShoppingBag,
  Calendar,
  IndianRupee,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import AccountProfileForm from "./profile-form";

export const metadata: Metadata = {
  title: "Your account",
  description: "Your profile, order history, and invoices.",
  robots: { index: false, follow: false },
};

type OrderItem = {
  slug?: string;
  name?: string;
  qty?: number;
  price?: number;
};

type OrderRow = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[] | null;
  invoice_number: string | null;
  customer_address: string;
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-rust/15 text-rust",
  confirmed: "bg-leaf/15 text-leaf",
  fulfilled: "bg-ink/10 text-ink/70",
  cancelled: "bg-muted/15 text-muted line-through",
};

function initialsFor(
  name: string | null | undefined,
  email: string | null | undefined
): string {
  const source = name?.trim() || email?.split("@")[0] || "";
  if (!source) return "•";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default async function AccountPage() {
  const supabase = await supabaseServer();
  if (!supabase) redirect("/sign-in?next=/account");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/account");

  // Profile may exist without a phone (typical for fresh Google sign-up).
  // We render the page either way and prompt for the phone inline.
  const profile = await getMyProfile();
  const phone = profile?.phone ?? "";
  const displayName =
    profile?.display_name ?? user.email?.split("@")[0] ?? "";

  // Orders are linked by phone. Without a phone we can't surface history yet.
  let orders: OrderRow[] = [];
  if (phone) {
    const admin = supabaseAdmin();
    const { data: orderData } = await admin
      .from("orders")
      .select(
        "id,status,total,created_at,items,invoice_number,customer_address"
      )
      .eq("customer_phone", phone)
      .order("created_at", { ascending: false })
      .limit(50);
    orders = (orderData ?? []) as OrderRow[];
  }

  const lifetimeValue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const activeOrders = orders.filter((o) =>
    ["new", "confirmed"].includes(o.status)
  ).length;
  const fulfilledOrders = orders.filter((o) => o.status === "fulfilled").length;

  const firstName = displayName.split(/\s+/)[0] || "there";

  return (
    <div className="pt-28 pb-24 md:pt-32">
      <div className="mx-auto max-w-[1100px] px-6 md:px-10">
        {/* Friendly header with avatar */}
        <section className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div
            aria-hidden
            className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-leaf/15 font-display text-3xl text-walnut ring-1 ring-walnut/15"
          >
            {initialsFor(displayName, user.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-muted">Your account</p>
            <h1 className="mt-1 font-display text-4xl tracking-tight md:text-5xl">
              Hello,{" "}
              <span className="serif-italic text-walnut">{firstName}.</span>
            </h1>
            <dl className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted">
              <div className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>{user.email}</span>
              </div>
              {phone ? (
                <div className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{formatPhoneForDisplay(phone)}</span>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rust/10 px-2 py-0.5 text-rust">
                  <AlertCircle className="h-3 w-3" /> Phone not added
                </span>
              )}
            </dl>
          </div>
        </section>

        {/* Missing-phone callout (only when not set) */}
        {!phone && (
          <div className="mt-8 rounded-3xl border border-rust/25 bg-rust/5 p-5 md:p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rust/15 text-rust">
                <AlertCircle className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg leading-tight">
                  One last thing — add your phone
                </p>
                <p className="mt-1 text-xs text-muted">
                  We confirm every order on WhatsApp and use your phone to
                  link past purchases to this account. Add it in the
                  Profile card below to unlock your order history.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stat tiles */}
        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          <Stat
            label="Active orders"
            value={String(activeOrders)}
            icon={<ShoppingBag className="h-4 w-4" />}
            hint={
              activeOrders > 0 ? "Awaiting fulfilment" : "Nothing on the way"
            }
          />
          <Stat
            label="Fulfilled"
            value={String(fulfilledOrders)}
            icon={<Package className="h-4 w-4" />}
            hint={fulfilledOrders > 0 ? "Delivered to you" : "—"}
          />
          <Stat
            label="Lifetime value"
            value={formatINR(lifetimeValue)}
            icon={<IndianRupee className="h-4 w-4" />}
            hint="All orders to date"
          />
        </section>

        <div className="mt-10 grid gap-8 md:grid-cols-12">
          {/* Order history (primary, wider) */}
          <section className="md:col-span-7">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl">Order history</h2>
              <span className="text-xs text-muted">
                {orders.length} total
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-dashed border-ink/15 bg-cream/30 p-8 text-center md:p-10">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-bone text-ink/40 ring-1 ring-ink/10">
                  <ShoppingBag className="h-5 w-5" />
                </span>
                <p className="mt-4 font-display text-xl">
                  {phone ? "No orders yet." : "Add a phone to see orders."}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {phone
                    ? "When you place an order, it'll show up here."
                    : "We match orders to your account by phone number."}
                </p>
                <Link
                  href="/shop"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-bone transition-transform hover:-translate-y-0.5"
                >
                  Browse the catalogue
                </Link>
              </div>
            ) : (
              <ul className="mt-5 space-y-3">
                {orders.map((o) => (
                  <li
                    key={o.id}
                    className="rounded-3xl border border-ink/10 bg-cream/30 p-5 md:p-6"
                  >
                    <header className="flex flex-wrap items-baseline justify-between gap-3">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <p className="font-display text-lg tracking-tight">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
                            STATUS_STYLES[o.status] ?? "bg-ink/10 text-ink/70"
                          }`}
                        >
                          {o.status}
                        </span>
                        {o.invoice_number && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-ink/70">
                            <FileText className="h-3 w-3" />
                            {o.invoice_number}
                          </span>
                        )}
                      </div>
                      <span className="font-display text-lg tabular-nums">
                        {formatINR(o.total)}
                      </span>
                    </header>

                    <p className="mt-1 text-xs text-muted">
                      <Calendar className="mr-1 inline h-3 w-3" />
                      {new Date(o.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {Array.isArray(o.items) && o.items.length > 0 && (
                      <ul className="mt-3 divide-y divide-ink/10 text-sm">
                        {o.items.map((i, idx) => (
                          <li
                            key={`${o.id}-${idx}`}
                            className="flex items-baseline justify-between py-1.5"
                          >
                            <span>
                              {i.name ?? "—"}{" "}
                              <span className="text-muted">× {i.qty ?? 1}</span>
                            </span>
                            <span className="tabular-nums">
                              {formatINR((i.price ?? 0) * (i.qty ?? 1))}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <p className="mt-3 inline-flex items-start gap-1.5 text-xs text-muted">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>{o.customer_address}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Profile editor (right rail) */}
          <aside className="md:col-span-5">
            <section className="rounded-3xl border border-ink/10 bg-cream/40 p-6 md:p-7">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl">Profile</h2>
                {!phone && (
                  <span className="rounded-full bg-rust/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-rust">
                    Incomplete
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted">
                Phone is how the studio reaches you and how we link past
                orders to your account.
              </p>
              <AccountProfileForm
                initialName={displayName}
                initialPhone={phone}
              />
            </section>
          </aside>
        </div>

        {/* Quick actions */}
        <div className="mt-14 grid gap-3 sm:grid-cols-3">
          <ActionCard
            title="Shop the catalogue"
            href="/shop"
            description="Browse the full bare nest range."
            icon={<ShoppingBag className="h-4 w-4" />}
          />
          <ActionCard
            title="Visit the showroom"
            href="/showroom"
            description="Patna · Doors open 18 June 2026."
            icon={<MapPin className="h-4 w-4" />}
          />
          <ActionCard
            title="Contact the studio"
            href="/contact"
            description="WhatsApp the team or book a preview."
            icon={<MessageCircle className="h-4 w-4" />}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-cream/30 p-4">
      <div className="flex items-center gap-2 text-muted">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-ink/5">
          {icon}
        </span>
        <p className="eyebrow">{label}</p>
      </div>
      <p className="mt-2 font-display text-2xl tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

function ActionCard({
  title,
  href,
  description,
  icon,
}: {
  title: string;
  href: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-ink/10 bg-bone p-5 transition-all hover:-translate-y-0.5 hover:bg-cream/40"
    >
      <div className="flex items-center gap-2">
        {icon && (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-ink/5 text-ink/70 transition-colors group-hover:bg-ink group-hover:text-bone">
            {icon}
          </span>
        )}
        <p className="font-display text-lg">{title}</p>
      </div>
      <p className="mt-2 text-xs text-muted">{description}</p>
    </Link>
  );
}
