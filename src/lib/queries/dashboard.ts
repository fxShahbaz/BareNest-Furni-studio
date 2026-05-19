import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SHOWROOM } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type RangeStat = { orders: number; revenue: number };

export type RevenueDay = {
  date: string;     // "2026-05-19"
  revenue: number;
  orders: number;
};

export type StatusBucket = {
  status: "new" | "confirmed" | "fulfilled" | "cancelled";
  count: number;
};

export type TopProduct = {
  slug: string;
  name: string;
  revenue: number;
  qty: number;
};

export type MaterialSlice = {
  material: string;
  revenue: number;
};

export type RecentOrder = {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  invoice_number: string | null;
  source: string;
  created_at: string;
};

export type DashboardData = {
  today: RangeStat;
  yesterday: RangeStat;
  thisMonth: RangeStat;
  lastMonth: RangeStat;
  newOrdersCount: number;
  awaitingInvoiceCount: number;
  aov: number;          // this month
  aovPrev: number;      // last month
  revenueByDay: RevenueDay[];   // last 30 days
  ordersByStatus: StatusBucket[];
  topProducts: TopProduct[];
  materialMix: MaterialSlice[];
  subscribersCount: number;
  subscribers7dDelta: number;
  customersCount: number;
  customers7dDelta: number;
  recentOrders: RecentOrder[];
  daysToLaunch: number;
  totalProducts: number;
  totalOrdersAllTime: number;
  totalRevenueAllTime: number;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

type RawOrderItem = {
  slug?: string;
  name?: string;
  price?: number;
  qty?: number;
  material?: string;
};

type RawOrder = {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  source: string;
  invoice_number: string | null;
  items: RawOrderItem[] | null;
  created_at: string;
};

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function sumIn(
  orders: RawOrder[],
  from: Date,
  to: Date,
  countCancelled = false
): RangeStat {
  let revenue = 0;
  let count = 0;
  for (const o of orders) {
    const t = new Date(o.created_at);
    if (t < from || t > to) continue;
    if (!countCancelled && o.status === "cancelled") continue;
    revenue += o.total;
    count += 1;
  }
  return { orders: count, revenue };
}

/* ------------------------------------------------------------------ */
/*  Main fetcher                                                       */
/* ------------------------------------------------------------------ */

export async function getDashboardData(): Promise<DashboardData> {
  const admin = supabaseAdmin();
  const now = new Date();

  // Pull *all* relevant orders up to ~year-back in one shot. The
  // pre-launch catalogue won't have many — and we'd rather do the
  // arithmetic in TS than juggle 8 SQL aggregations.
  const ordersFrom = addDays(startOfDay(now), -365);

  const [
    ordersRes,
    productsCountRes,
    productsListRes,
    subscribersAll,
    subscribers7d,
    customersAll,
    customers7d,
    awaitingInvoiceRes,
    allTimeAggRes,
  ] = await Promise.all([
    admin
      .from("orders")
      .select(
        "id,customer_name,total,status,source,invoice_number,items,created_at"
      )
      .gte("created_at", ordersFrom.toISOString())
      .order("created_at", { ascending: false })
      .limit(2000),
    admin.from("products").select("slug", { count: "exact", head: true }),
    admin.from("products").select("slug,name,material"),
    admin.from("subscribers").select("email", { count: "exact", head: true }),
    admin
      .from("subscribers")
      .select("email", { count: "exact", head: true })
      .gte("created_at", addDays(now, -7).toISOString()),
    admin.from("customers").select("id", { count: "exact", head: true }),
    admin
      .from("customers")
      .select("id", { count: "exact", head: true })
      .gte("first_seen_at", addDays(now, -7).toISOString()),
    admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["confirmed", "fulfilled"])
      .is("invoice_number", null),
    admin
      .from("orders")
      .select("total,status")
      .neq("status", "cancelled"),
  ]);

  const orders = (ordersRes.data ?? []) as RawOrder[];
  const products = (productsListRes.data ?? []) as Array<{
    slug: string;
    name: string;
    material: string;
  }>;
  const productsBySlug = new Map(products.map((p) => [p.slug, p]));

  /* --- Time-bucketed roll-ups --- */

  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(addDays(thisMonthStart, -1));
  const lastMonthEnd = endOfMonth(lastMonthStart);

  const todayStat = sumIn(orders, today, tomorrow);
  const yesterdayStat = sumIn(orders, yesterday, today);
  const thisMonthStat = sumIn(orders, thisMonthStart, tomorrow);
  const lastMonthStat = sumIn(orders, lastMonthStart, lastMonthEnd);

  /* --- 30-day revenue series --- */

  const revenueByDay: RevenueDay[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = addDays(today, -i);
    const next = addDays(d, 1);
    const stat = sumIn(orders, d, next);
    revenueByDay.push({
      date: isoDay(d),
      revenue: stat.revenue,
      orders: stat.orders,
    });
  }

  /* --- Orders by status (all time, last 365d) --- */

  const statusCounts: Record<StatusBucket["status"], number> = {
    new: 0,
    confirmed: 0,
    fulfilled: 0,
    cancelled: 0,
  };
  for (const o of orders) {
    if (o.status in statusCounts) {
      statusCounts[o.status as StatusBucket["status"]] += 1;
    }
  }
  const ordersByStatus: StatusBucket[] = (
    ["new", "confirmed", "fulfilled", "cancelled"] as const
  ).map((s) => ({ status: s, count: statusCounts[s] }));
  const newOrdersCount = statusCounts.new;

  /* --- Top products & material mix (revenue from items JSONB) --- */

  type Agg = { slug: string; name: string; revenue: number; qty: number };
  const productAgg = new Map<string, Agg>();
  const materialAgg = new Map<string, number>();

  for (const o of orders) {
    if (o.status === "cancelled") continue;
    for (const it of o.items ?? []) {
      const slug = it.slug ?? "";
      if (!slug) continue;
      const qty = it.qty ?? 0;
      const price = it.price ?? 0;
      const line = qty * price;
      const known = productsBySlug.get(slug);
      const name = it.name ?? known?.name ?? slug;
      const material = it.material ?? known?.material ?? "Unknown";

      const cur = productAgg.get(slug) ?? {
        slug,
        name,
        revenue: 0,
        qty: 0,
      };
      cur.revenue += line;
      cur.qty += qty;
      productAgg.set(slug, cur);

      materialAgg.set(material, (materialAgg.get(material) ?? 0) + line);
    }
  }
  const topProducts: TopProduct[] = Array.from(productAgg.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  const materialMix: MaterialSlice[] = Array.from(materialAgg.entries())
    .map(([material, revenue]) => ({ material, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  /* --- AOV --- */

  const aov =
    thisMonthStat.orders > 0
      ? thisMonthStat.revenue / thisMonthStat.orders
      : 0;
  const aovPrev =
    lastMonthStat.orders > 0
      ? lastMonthStat.revenue / lastMonthStat.orders
      : 0;

  /* --- All-time aggregate --- */

  const allTime = (allTimeAggRes.data ?? []) as Array<{
    total: number;
    status: string;
  }>;
  const totalRevenueAllTime = allTime.reduce((s, r) => s + r.total, 0);
  const totalOrdersAllTime = allTime.length;

  /* --- Recent orders for activity feed --- */

  const recentOrders: RecentOrder[] = orders.slice(0, 7).map((o) => ({
    id: o.id,
    customer_name: o.customer_name,
    total: o.total,
    status: o.status,
    source: o.source,
    invoice_number: o.invoice_number,
    created_at: o.created_at,
  }));

  /* --- Launch countdown --- */

  const launchMs = new Date(SHOWROOM.inaugurationISO).getTime() - now.getTime();
  const daysToLaunch = Math.max(0, Math.ceil(launchMs / 86_400_000));

  return {
    today: todayStat,
    yesterday: yesterdayStat,
    thisMonth: thisMonthStat,
    lastMonth: lastMonthStat,
    newOrdersCount,
    awaitingInvoiceCount: awaitingInvoiceRes.count ?? 0,
    aov,
    aovPrev,
    revenueByDay,
    ordersByStatus,
    topProducts,
    materialMix,
    subscribersCount: subscribersAll.count ?? 0,
    subscribers7dDelta: subscribers7d.count ?? 0,
    customersCount: customersAll.count ?? 0,
    customers7dDelta: customers7d.count ?? 0,
    recentOrders,
    daysToLaunch,
    totalProducts: productsCountRes.count ?? 0,
    totalOrdersAllTime,
    totalRevenueAllTime,
  };
}
