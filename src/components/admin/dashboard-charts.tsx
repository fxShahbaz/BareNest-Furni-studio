"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR } from "@/lib/utils";
import type {
  MaterialSlice,
  RevenueDay,
  StatusBucket,
  TopProduct,
} from "@/lib/queries/dashboard";

// Brand palette (resolved to hex so recharts can use them — Tailwind
// CSS variables aren't visible to canvas/svg in recharts).
const BRAND = {
  walnut: "#5a3a22",
  bark: "#2c1a0e",
  rust: "#c2552b",
  leaf: "#5a6b3a",
  clay: "#b08968",
  sand: "#d8cdb6",
  ink: "#14110e",
  muted: "#7a6f5e",
};

const STATUS_COLORS: Record<string, string> = {
  new: BRAND.rust,
  confirmed: BRAND.leaf,
  fulfilled: BRAND.walnut,
  cancelled: BRAND.muted,
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  confirmed: "Confirmed",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

const MATERIAL_COLORS: Record<string, string> = {
  "Solid Wood": BRAND.walnut,
  MDF: BRAND.clay,
  Unknown: BRAND.muted,
};

/* ------------------------------------------------------------------ */
/*  Tooltip — shared, minimal, brand-friendly                          */
/* ------------------------------------------------------------------ */

type TooltipEntry = { name: string; value: number; color?: string };

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  formatter?: (value: number, name: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-ink/10 bg-bone px-3 py-2 text-xs shadow-lg">
      {label && (
        <p className="mb-1 font-medium text-ink/80">{label}</p>
      )}
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2 text-ink/80">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color ?? BRAND.ink }}
          />
          <span>{entry.name}:</span>
          <span className="font-medium text-ink">
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Revenue — 30-day area chart                                        */
/* ------------------------------------------------------------------ */

export function RevenueAreaChart({ data }: { data: RevenueDay[] }) {
  const allZero = data.every((d) => d.revenue === 0);
  if (allZero) {
    return (
      <EmptyChart message="No revenue in the last 30 days. The chart will start drawing once your first order lands." />
    );
  }
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="bn-rev-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND.walnut} stopOpacity={0.35} />
              <stop offset="100%" stopColor={BRAND.walnut} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(d) => {
              const dt = new Date(d);
              return `${dt.getDate()}/${dt.getMonth() + 1}`;
            }}
            tick={{ fill: BRAND.muted, fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: BRAND.muted, strokeOpacity: 0.15 }}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis
            tick={{ fill: BRAND.muted, fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) =>
              v >= 100000 ? `${(v / 100000).toFixed(1)}L` : `${v / 1000}k`
            }
            width={42}
          />
          <Tooltip
            cursor={{ stroke: BRAND.walnut, strokeOpacity: 0.2 }}
            content={({ active, payload, label }) => (
              <ChartTooltip
                active={active}
                payload={
                  payload as unknown as TooltipEntry[] | undefined
                }
                label={label ? formatLongDate(String(label)) : undefined}
                formatter={(v) => formatINR(v)}
              />
            )}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke={BRAND.walnut}
            strokeWidth={2}
            fill="url(#bn-rev-fill)"
            dot={false}
            activeDot={{ r: 4, fill: BRAND.walnut }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Orders by status — donut                                           */
/* ------------------------------------------------------------------ */

export function OrdersStatusDonut({ data }: { data: StatusBucket[] }) {
  const total = data.reduce((s, b) => s + b.count, 0);
  if (total === 0) {
    return <EmptyChart message="No orders to break down yet." />;
  }
  const chartData = data
    .filter((b) => b.count > 0)
    .map((b) => ({
      name: STATUS_LABELS[b.status] ?? b.status,
      value: b.count,
      color: STATUS_COLORS[b.status] ?? BRAND.ink,
      status: b.status,
    }));

  return (
    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
      <div className="relative h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
            >
              {chartData.map((d) => (
                <Cell key={d.status} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => (
                <ChartTooltip
                  active={active}
                  payload={
                    payload as unknown as TooltipEntry[] | undefined
                  }
                />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl leading-none">{total}</span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">
            Orders
          </span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {chartData.map((d) => {
          const pct = ((d.value / total) * 100).toFixed(0);
          return (
            <li key={d.status} className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="flex-1 text-ink/80">{d.name}</span>
              <span className="tabular-nums text-ink">{d.value}</span>
              <span className="w-10 text-right text-xs text-muted tabular-nums">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Top products — horizontal bar chart                                */
/* ------------------------------------------------------------------ */

export function TopProductsBars({ data }: { data: TopProduct[] }) {
  if (data.length === 0) {
    return (
      <EmptyChart message="No product revenue yet — the leaderboard fills in as orders come in." />
    );
  }
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: BRAND.ink, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={120}
          />
          <Tooltip
            cursor={{ fill: "#ede7da", opacity: 0.3 }}
            content={({ active, payload }) => (
              <ChartTooltip
                active={active}
                payload={
                  payload as unknown as TooltipEntry[] | undefined
                }
                formatter={(v) => formatINR(v)}
              />
            )}
          />
          <Bar
            dataKey="revenue"
            name="Revenue"
            fill={BRAND.walnut}
            radius={[0, 6, 6, 0]}
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Material mix — donut                                               */
/* ------------------------------------------------------------------ */

export function MaterialMixDonut({ data }: { data: MaterialSlice[] }) {
  const total = data.reduce((s, m) => s + m.revenue, 0);
  if (total === 0) {
    return <EmptyChart message="No material breakdown yet." />;
  }
  const chartData = data.map((m) => ({
    name: m.material,
    value: m.revenue,
    color: MATERIAL_COLORS[m.material] ?? BRAND.ink,
  }));

  return (
    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
      <div className="relative h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
            >
              {chartData.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => (
                <ChartTooltip
                  active={active}
                  payload={
                    payload as unknown as TooltipEntry[] | undefined
                  }
                  formatter={(v) => formatINR(v)}
                />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl leading-none">
            {formatShortINR(total)}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">
            Revenue
          </span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {chartData.map((d) => {
          const pct = ((d.value / total) * 100).toFixed(0);
          return (
            <li key={d.name} className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="flex-1 text-ink/80">{d.name}</span>
              <span className="text-xs tabular-nums text-muted">
                {formatINR(d.value)}
              </span>
              <span className="w-10 text-right text-xs text-muted tabular-nums">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty chart placeholder                                            */
/* ------------------------------------------------------------------ */

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[200px] items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-cream/30 px-6 text-center text-xs text-muted">
      {message}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Format helpers                                                     */
/* ------------------------------------------------------------------ */

function formatLongDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatShortINR(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return formatINR(n);
}
