"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Calendar,
  ChevronDown,
  ChevronUp,
  Users,
  Download,
  Loader2,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export type CustomerOrderSummary = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items_count: number;
};

export type CustomerRow = {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  first_seen_at: string;
  last_seen_at: string;
  orders_count: number;
  lifetime_value: number;
  last_order_status: string | null;
  orders: CustomerOrderSummary[];
};

type Sort =
  | "recent"
  | "value-desc"
  | "orders-desc"
  | "name-asc"
  | "first-seen";

const sortLabels: Record<Sort, string> = {
  recent: "Most recent",
  "value-desc": "Highest value",
  "orders-desc": "Most orders",
  "name-asc": "Name A→Z",
  "first-seen": "First seen",
};

function waNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Compute column widths from the longest value in each column. Capped so
// a stray-long Address column doesn't blow the layout to 200ch.
function autoWidths(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]);
  return keys.map((k) => {
    let max = k.length;
    for (const r of rows) {
      const v = r[k];
      const len = v == null ? 0 : String(v).length;
      if (len > max) max = len;
    }
    return { wch: Math.min(Math.max(max + 2, 10), 60) };
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusStyles: Record<string, string> = {
  new: "bg-rust/15 text-rust",
  confirmed: "bg-leaf/15 text-leaf",
  fulfilled: "bg-ink/10 text-ink/70",
  cancelled: "bg-muted/15 text-muted line-through",
};

export default function CustomersManager({
  customers,
}: {
  customers: CustomerRow[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = customers;
    if (q) {
      list = list.filter((c) => {
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.email?.toLowerCase().includes(q) ?? false) ||
          (c.city?.toLowerCase().includes(q) ?? false) ||
          (c.pincode?.includes(q) ?? false)
        );
      });
    }
    const sorted = [...list];
    switch (sort) {
      case "recent":
        sorted.sort(
          (a, b) =>
            new Date(b.last_seen_at).getTime() -
            new Date(a.last_seen_at).getTime()
        );
        break;
      case "value-desc":
        sorted.sort((a, b) => b.lifetime_value - a.lifetime_value);
        break;
      case "orders-desc":
        sorted.sort((a, b) => b.orders_count - a.orders_count);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "first-seen":
        sorted.sort(
          (a, b) =>
            new Date(a.first_seen_at).getTime() -
            new Date(b.first_seen_at).getTime()
        );
        break;
    }
    return sorted;
  }, [customers, query, sort]);

  const stats = useMemo(() => {
    let total = 0;
    let repeat = 0;
    for (const c of customers) {
      total += c.lifetime_value;
      if (c.orders_count > 1) repeat += 1;
    }
    return { total, repeat };
  }, [customers]);

  if (customers.length === 0) {
    return (
      <div className="rounded-3xl border border-ink/10 bg-cream/40 p-10 text-center text-sm text-muted">
        No customers yet. Once people place orders, they&apos;ll show up
        here — deduped by phone number.
      </div>
    );
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function exportToExcel() {
    if (exporting || filtered.length === 0) return;
    setExporting(true);
    try {
      const XLSX = await import("xlsx");

      // ---- Sheet 1: Customers (one row per customer)
      const customersRows = filtered.map((c) => ({
        Name: c.name,
        Phone: `+91 ${c.phone}`,
        Email: c.email ?? "",
        City: c.city ?? "",
        Pincode: c.pincode ?? "",
        Address: c.address ?? "",
        Orders: c.orders_count,
        "Lifetime (₹)": c.lifetime_value,
        "First seen": formatDate(c.first_seen_at),
        "Last seen": formatDate(c.last_seen_at),
      }));
      const wsCustomers = XLSX.utils.json_to_sheet(customersRows);
      wsCustomers["!cols"] = autoWidths(customersRows);
      wsCustomers["!freeze"] = { xSplit: 0, ySplit: 1 };

      // ---- Sheet 2: Orders (denormalized — one row per order)
      const orderRows: Array<Record<string, string | number>> = [];
      for (const c of filtered) {
        for (const o of c.orders) {
          orderRows.push({
            Customer: c.name,
            Phone: `+91 ${c.phone}`,
            "Order #": o.id.slice(0, 8).toUpperCase(),
            Status: o.status,
            Items: o.items_count,
            "Total (₹)": o.total,
            "Placed at": formatDateTime(o.created_at),
          });
        }
      }
      const wsOrders = XLSX.utils.json_to_sheet(orderRows);
      wsOrders["!cols"] = autoWidths(orderRows);
      wsOrders["!freeze"] = { xSplit: 0, ySplit: 1 };

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsCustomers, "Customers");
      XLSX.utils.book_append_sheet(wb, wsOrders, "Orders");

      const today = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `barenest-customers-${today}.xlsx`);
    } catch (err) {
      console.error("[export] failed:", err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stat tiles */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Total customers"
          value={String(customers.length)}
          icon={<Users className="h-4 w-4" />}
        />
        <Stat
          label="Repeat customers"
          value={String(stats.repeat)}
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <Stat
          label="Lifetime revenue"
          value={formatINR(stats.total)}
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search name, phone, email, city…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-ink/15 bg-bone py-2.5 pl-10 pr-4 text-sm focus:border-ink focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="eyebrow text-muted">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border border-ink/15 bg-bone px-3 py-2 text-xs focus:border-ink focus:outline-none"
          >
            {(Object.keys(sortLabels) as Sort[]).map((k) => (
              <option key={k} value={k}>
                {sortLabels[k]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={exportToExcel}
            disabled={exporting || filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs text-bone disabled:opacity-50"
            title={
              filtered.length === 0
                ? "Nothing to export"
                : `Export ${filtered.length} customer${filtered.length === 1 ? "" : "s"} to .xlsx`
            }
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {exporting ? "Building…" : "Export Excel"}
          </button>
        </div>
      </div>

      <p className="text-xs text-muted">
        Showing {filtered.length} of {customers.length}
      </p>

      {/* Customer cards */}
      <ul className="space-y-3">
        {filtered.map((c) => {
          const isOpen = expanded.has(c.id);
          const isRepeat = c.orders_count > 1;
          return (
            <li
              key={c.id}
              className="rounded-3xl border border-ink/10 bg-cream/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 p-5 md:p-6">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-display text-xl">{c.name}</h3>
                    {isRepeat && (
                      <span className="rounded-full bg-leaf/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-leaf">
                        Repeat
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      <a
                        href={`tel:+91${c.phone}`}
                        className="hover:text-ink"
                      >
                        +91 {c.phone}
                      </a>
                    </span>
                    {c.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3 w-3" />
                        <a
                          href={`mailto:${c.email}`}
                          className="hover:text-ink"
                        >
                          {c.email}
                        </a>
                      </span>
                    )}
                    {(c.city || c.pincode) && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {c.city}
                        {c.pincode ? ` · ${c.pincode}` : ""}
                      </span>
                    )}
                  </div>
                  {c.address && (
                    <p className="mt-2 text-xs text-ink/70">{c.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-right md:gap-6">
                  <Meta label="Orders" value={String(c.orders_count)} />
                  <Meta
                    label="Lifetime"
                    value={formatINR(c.lifetime_value)}
                  />
                  <Meta
                    label="Last seen"
                    value={formatDate(c.last_seen_at)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-ink/10 px-5 py-3 md:px-6">
                <a
                  href={`https://wa.me/${waNumber(c.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-leaf/15 px-3 py-1.5 text-xs text-leaf hover:bg-leaf/25"
                >
                  <MessageCircle className="h-3 w-3" />
                  WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => toggle(c.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs hover:bg-ink/5"
                >
                  {isOpen ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      Hide orders
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      Show {c.orders_count} order{c.orders_count === 1 ? "" : "s"}
                    </>
                  )}
                </button>
                <span className="ml-auto text-[11px] text-muted">
                  First seen {formatDate(c.first_seen_at)}
                </span>
              </div>

              {isOpen && c.orders.length > 0 && (
                <ul className="divide-y divide-ink/10 border-t border-ink/10 bg-bone/40">
                  {c.orders.map((o) => (
                    <li
                      key={o.id}
                      className="flex flex-wrap items-center gap-3 px-5 py-3 md:px-6"
                    >
                      <Link
                        href={`/admin/orders#${o.id}`}
                        className="font-display text-sm tracking-tight hover:underline"
                      >
                        #{o.id.slice(0, 8).toUpperCase()}
                      </Link>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
                          statusStyles[o.status] ?? "bg-ink/10 text-ink/70"
                        }`}
                      >
                        {o.status}
                      </span>
                      <span className="text-xs text-muted">
                        {o.items_count} item{o.items_count === 1 ? "" : "s"}
                      </span>
                      <span className="ml-auto text-xs text-muted">
                        {formatDateTime(o.created_at)}
                      </span>
                      <span className="font-display text-sm tabular-nums">
                        {formatINR(o.total)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="rounded-2xl border border-ink/10 bg-bone p-6 text-center text-sm text-muted">
          No customers match your search.
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
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
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-0.5 font-display text-sm tabular-nums">{value}</p>
    </div>
  );
}
