import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  FileText,
  Mail,
  Minus,
  Package,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { formatINR, SHOWROOM } from "@/lib/utils";
import { getDashboardData } from "@/lib/queries/dashboard";
import {
  MaterialMixDonut,
  OrdersStatusDonut,
  RevenueAreaChart,
  TopProductsBars,
} from "@/components/admin/dashboard-charts";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const d = await getDashboardData();

  const todayDelta = pctDelta(d.today.revenue, d.yesterday.revenue);
  const monthDelta = pctDelta(d.thisMonth.revenue, d.lastMonth.revenue);
  const aovDelta = pctDelta(d.aov, d.aovPrev);
  const pendingAction = d.newOrdersCount + d.awaitingInvoiceCount;

  return (
    <div className="space-y-8">
      {/* COUNTDOWN BANNER */}
      <CountdownBanner days={d.daysToLaunch} />

      {/* KPI TILES */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          eyebrow="Today"
          value={formatINR(d.today.revenue)}
          subtitle={`${d.today.orders} order${d.today.orders === 1 ? "" : "s"}`}
          delta={todayDelta}
          deltaLabel="vs yesterday"
        />
        <KpiTile
          eyebrow="This month"
          value={formatINR(d.thisMonth.revenue)}
          subtitle={`${d.thisMonth.orders} order${d.thisMonth.orders === 1 ? "" : "s"}`}
          delta={monthDelta}
          deltaLabel="vs last month"
        />
        <KpiTile
          eyebrow="Pending action"
          value={String(pendingAction)}
          subtitle={
            pendingAction === 0
              ? "Nothing waiting — all caught up"
              : `${d.newOrdersCount} new · ${d.awaitingInvoiceCount} invoices`
          }
          tone={pendingAction > 0 ? "alert" : "default"}
        />
        <KpiTile
          eyebrow="Avg. order"
          value={d.aov > 0 ? formatINR(d.aov) : "—"}
          subtitle="this month"
          delta={aovDelta}
          deltaLabel="vs last month"
        />
      </section>

      {/* ACTION QUEUE */}
      {pendingAction > 0 && (
        <section className="rounded-3xl border border-ink/10 bg-cream/40 p-5 md:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-rust" />
              <h2 className="font-display text-xl">What needs you, right now</h2>
            </div>
            <span className="text-xs text-muted">
              {pendingAction} action{pendingAction === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {d.newOrdersCount > 0 && (
              <ActionCard
                href="/admin/orders"
                tone="rust"
                title={`${d.newOrdersCount} new order${d.newOrdersCount === 1 ? "" : "s"}`}
                description="Confirm with the customer over WhatsApp, then mark confirmed."
                cta="Open orders"
                icon={<ShoppingBag className="h-4 w-4" />}
              />
            )}
            {d.awaitingInvoiceCount > 0 && (
              <ActionCard
                href="/admin/invoices"
                tone="walnut"
                title={`${d.awaitingInvoiceCount} invoice${d.awaitingInvoiceCount === 1 ? "" : "s"} to generate`}
                description="Confirmed/fulfilled orders without an invoice number yet."
                cta="Generate"
                icon={<FileText className="h-4 w-4" />}
              />
            )}
          </div>
        </section>
      )}

      {/* CHARTS */}
      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Revenue, last 30 days"
          caption="Cancelled orders excluded."
        >
          <RevenueAreaChart data={d.revenueByDay} />
        </ChartCard>

        <ChartCard title="Orders by status" caption="Last 12 months.">
          <OrdersStatusDonut data={d.ordersByStatus} />
        </ChartCard>

        <ChartCard
          title="Top pieces by revenue"
          caption="Top five sellers, all time."
        >
          <TopProductsBars data={d.topProducts} />
        </ChartCard>

        <ChartCard
          title="Material mix"
          caption="Where revenue is coming from — solid wood vs MDF."
        >
          <MaterialMixDonut data={d.materialMix} />
        </ChartCard>
      </section>

      {/* RECENT ACTIVITY + AT-A-GLANCE */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-muted hover:text-ink"
            >
              See all →
            </Link>
          </div>
          <div className="mt-4 divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-cream/30">
            {d.recentOrders.length === 0 && (
              <div className="p-8 text-center text-sm text-muted">
                No orders yet. When one lands, it&apos;ll show here first.
              </div>
            )}
            {d.recentOrders.map((o) => (
              <Link
                key={o.id}
                href="/admin/orders"
                className="flex items-center gap-4 p-4 hover:bg-cream/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {o.customer_name}
                    {o.invoice_number && (
                      <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-leaf">
                        {o.invoice_number}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted">
                    {relativeTime(o.created_at)} ·{" "}
                    {o.source === "manual" ? "Walk-in" : "Online"}
                  </p>
                </div>
                <span
                  className={`hidden rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] sm:inline-block ${statusChip(o.status)}`}
                >
                  {o.status}
                </span>
                <span className="w-24 shrink-0 text-right text-sm tabular-nums">
                  {formatINR(o.total)}
                </span>
                <ArrowUpRight className="h-4 w-4 text-ink/30" />
              </Link>
            ))}
          </div>
        </div>

        <aside className="space-y-3">
          <h2 className="font-display text-xl">Audience &amp; catalogue</h2>
          <MiniStat
            href="/admin/customers"
            icon={<Users className="h-4 w-4" />}
            label="Customers"
            value={d.customersCount}
            delta={d.customers7dDelta}
            deltaLabel="new in last 7d"
          />
          <MiniStat
            href="/admin/subscribers"
            icon={<Mail className="h-4 w-4" />}
            label="Mailing list"
            value={d.subscribersCount}
            delta={d.subscribers7dDelta}
            deltaLabel="new in last 7d"
          />
          <MiniStat
            href="/admin/products"
            icon={<Package className="h-4 w-4" />}
            label="Products"
            value={d.totalProducts}
          />
          <div className="rounded-3xl border border-walnut/15 bg-walnut/5 p-4 text-xs text-walnut/90">
            <p className="flex items-center gap-2 font-medium text-walnut">
              <Sparkles className="h-3.5 w-3.5" />
              All time
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-walnut/60">
                  Orders
                </dt>
                <dd className="mt-1 font-display text-lg text-ink">
                  {d.totalOrdersAllTime}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-walnut/60">
                  Revenue
                </dt>
                <dd className="mt-1 font-display text-lg text-ink">
                  {formatINR(d.totalRevenueAllTime)}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */

function CountdownBanner({ days }: { days: number }) {
  if (days <= 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-leaf/10 px-5 py-4 text-leaf md:px-6">
        <div className="flex items-center gap-3">
          <CalendarClock className="h-4 w-4" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em]">Live</p>
            <p className="font-display text-lg leading-tight">
              {SHOWROOM.studio} is open.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-walnut px-5 py-4 text-bone md:px-6">
      <div className="flex items-center gap-3">
        <CalendarClock className="h-4 w-4 text-bone/70" />
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-bone/60">
            Pre-launch
          </p>
          <p className="font-display text-lg leading-tight">
            <span className="tabular-nums">{days}</span> day
            {days === 1 ? "" : "s"} until doors open
          </p>
        </div>
      </div>
      <p className="text-xs text-bone/70">
        Inauguration · 18 June 2026 · {SHOWROOM.city}
      </p>
    </div>
  );
}

function KpiTile({
  eyebrow,
  value,
  subtitle,
  delta,
  deltaLabel,
  tone = "default",
}: {
  eyebrow: string;
  value: string;
  subtitle: string;
  delta?: number | null;
  deltaLabel?: string;
  tone?: "default" | "alert";
}) {
  return (
    <div
      className={`rounded-3xl border p-5 ${
        tone === "alert"
          ? "border-rust/30 bg-rust/5"
          : "border-ink/10 bg-cream/40"
      }`}
    >
      <p className="eyebrow text-muted">{eyebrow}</p>
      <p className="mt-3 font-display text-3xl tabular-nums md:text-4xl">
        {value}
      </p>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>{subtitle}</span>
        {delta != null && <DeltaBadge value={delta} label={deltaLabel} />}
      </div>
    </div>
  );
}

function DeltaBadge({ value, label }: { value: number; label?: string }) {
  const flat = value === 0 || !Number.isFinite(value);
  const up = value > 0;
  const Icon = flat ? Minus : up ? ChevronUp : ChevronDown;
  const cls = flat
    ? "text-muted bg-ink/5"
    : up
      ? "text-leaf bg-leaf/10"
      : "text-rust bg-rust/10";
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${cls}`}
      title={label}
    >
      <Icon className="h-3 w-3" />
      {flat ? "—" : `${Math.abs(value).toFixed(0)}%`}
    </span>
  );
}

function ActionCard({
  href,
  title,
  description,
  cta,
  icon,
  tone,
}: {
  href: string;
  title: string;
  description: string;
  cta: string;
  icon: React.ReactNode;
  tone: "rust" | "walnut";
}) {
  const toneCls =
    tone === "rust"
      ? "border-rust/20 bg-rust/5 hover:bg-rust/10"
      : "border-walnut/20 bg-walnut/5 hover:bg-walnut/10";
  return (
    <Link
      href={href}
      className={`group flex items-start gap-3 rounded-2xl border p-4 transition-colors ${toneCls}`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
          tone === "rust" ? "bg-rust text-bone" : "bg-walnut text-bone"
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-xs text-ink/70">{description}</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-ink/70 group-hover:text-ink">
        {cta}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function ChartCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-cream/40 p-5 md:p-6">
      <header>
        <h3 className="font-display text-lg">{title}</h3>
        {caption && <p className="mt-0.5 text-[11px] text-muted">{caption}</p>}
      </header>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function MiniStat({
  href,
  icon,
  label,
  value,
  delta,
  deltaLabel,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  delta?: number;
  deltaLabel?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-cream/40 p-4 hover:bg-cream/70"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/5 text-ink/70">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
          {label}
        </p>
        <p className="font-display text-xl leading-none tabular-nums">
          {value}
        </p>
      </div>
      {delta != null && delta > 0 && (
        <span
          className="inline-flex items-center gap-0.5 rounded-full bg-leaf/10 px-2 py-0.5 text-[10px] font-medium text-leaf"
          title={deltaLabel}
        >
          <ChevronUp className="h-3 w-3" />
          {delta}
        </span>
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Pure helpers                                                       */
/* ------------------------------------------------------------------ */

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return 0;
    return null;
  }
  return ((current - previous) / previous) * 100;
}

function statusChip(status: string): string {
  switch (status) {
    case "new":
      return "bg-rust/15 text-rust";
    case "confirmed":
      return "bg-leaf/15 text-leaf";
    case "fulfilled":
      return "bg-ink/10 text-ink/70";
    case "cancelled":
      return "bg-muted/15 text-muted line-through";
    default:
      return "bg-ink/10 text-ink/70";
  }
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.round((now - then) / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
