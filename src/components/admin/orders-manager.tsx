"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle2,
  PackageCheck,
  XCircle,
  Undo2,
  Paperclip,
  Calendar,
  ArrowDownUp,
  Download,
  Plus,
  Globe,
  Store,
  Tag,
  FileText,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { updateOrderStatus } from "@/app/admin/(gated)/actions";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import AdminHeaderActions from "@/components/admin/admin-header-actions";
import Pagination from "@/components/admin/pagination";

export type OrderItem = {
  slug: string;
  name: string;
  qty: number;
  price: number;
  material?: string;
};

export type OrderRow = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  customer_gstin: string | null;
  notes: string | null;
  items: OrderItem[];
  total: number;
  status: string;
  source: string;
  attachment_urls: string[];
  invoice_number: string | null;
  created_at: string;
};

type SourceKey = "online" | "manual";
type SourceFilter = "all" | SourceKey;

const sourceMeta: Record<SourceKey, { label: string; icon: typeof Globe; chip: string }> = {
  online: { label: "ONLINE", icon: Globe, chip: "bg-leaf/15 text-leaf" },
  manual: { label: "WALK-IN", icon: Store, chip: "bg-walnut/15 text-walnut" },
};

type StatusKey = "new" | "confirmed" | "fulfilled" | "cancelled";
const STATUS_KEYS: StatusKey[] = ["new", "confirmed", "fulfilled", "cancelled"];

const statusStyles: Record<StatusKey, string> = {
  new: "bg-rust/15 text-rust",
  confirmed: "bg-leaf/15 text-leaf",
  fulfilled: "bg-ink/10 text-ink/70",
  cancelled: "bg-muted/15 text-muted line-through",
};

type Sort = "newest" | "oldest" | "total-desc" | "total-asc";

const sortLabels: Record<Sort, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "total-desc": "Total ↓",
  "total-asc": "Total ↑",
};

type Filter = "all" | StatusKey;

type DatePreset = "all" | "today" | "7d" | "30d" | "custom";

const datePresetLabels: Record<DatePreset, string> = {
  all: "All time",
  today: "Today",
  "7d": "7 days",
  "30d": "30 days",
  custom: "Custom",
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function rangeFor(
  preset: DatePreset,
  customFrom: string,
  customTo: string
): { from: Date | null; to: Date | null } {
  const now = new Date();
  switch (preset) {
    case "all":
      return { from: null, to: null };
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "7d": {
      const from = startOfDay(now);
      from.setDate(from.getDate() - 6);
      return { from, to: endOfDay(now) };
    }
    case "30d": {
      const from = startOfDay(now);
      from.setDate(from.getDate() - 29);
      return { from, to: endOfDay(now) };
    }
    case "custom":
      return {
        from: customFrom ? startOfDay(new Date(customFrom)) : null,
        to: customTo ? endOfDay(new Date(customTo)) : null,
      };
  }
}

type Transition = {
  next: StatusKey;
  label: string;
  tone: "default" | "danger";
  icon: typeof CheckCircle2;
};

// Forward progression (primary action).
const forward: Partial<Record<StatusKey, Transition>> = {
  new: { next: "confirmed", label: "Confirm order", tone: "default", icon: CheckCircle2 },
  confirmed: { next: "fulfilled", label: "Mark fulfilled", tone: "default", icon: PackageCheck },
};

// Recovery / undo from terminal states.
const recovery: Partial<Record<StatusKey, Transition>> = {
  fulfilled: { next: "confirmed", label: "Revert to confirmed", tone: "default", icon: Undo2 },
  cancelled: { next: "new", label: "Reopen order", tone: "default", icon: Undo2 },
};

function waNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

type PendingAction = {
  orderId: string;
  customerName: string;
  next: StatusKey;
  title: string;
  description: string;
  tone: "default" | "danger";
  confirmText: string;
};

export default function OrdersManager({ orders }: { orders: OrderRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const stats = useMemo(() => {
    const counts: Record<StatusKey, number> = {
      new: 0,
      confirmed: 0,
      fulfilled: 0,
      cancelled: 0,
    };
    let revenue = 0;
    for (const o of orders) {
      if (STATUS_KEYS.includes(o.status as StatusKey)) {
        counts[o.status as StatusKey]++;
      }
      if (o.status !== "cancelled") revenue += o.total;
    }
    return { counts, revenue };
  }, [orders]);

  const dateRange = useMemo(
    () => rangeFor(datePreset, customFrom, customTo),
    [datePreset, customFrom, customTo]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (sourceFilter !== "all" && o.source !== sourceFilter) return false;
      if (dateRange.from || dateRange.to) {
        const created = new Date(o.created_at);
        if (dateRange.from && created < dateRange.from) return false;
        if (dateRange.to && created > dateRange.to) return false;
      }
      if (!q) return true;
      const ref = o.id.slice(0, 8).toLowerCase();
      return (
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
        ref.includes(q) ||
        (o.customer_email?.toLowerCase().includes(q) ?? false)
      );
    });
    const sorted = [...filtered];
    switch (sort) {
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "oldest":
        sorted.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "total-desc":
        sorted.sort((a, b) => b.total - a.total);
        break;
      case "total-asc":
        sorted.sort((a, b) => a.total - b.total);
        break;
    }
    return sorted;
  }, [orders, query, filter, sourceFilter, sort, dateRange]);

  // Reset to page 1 whenever the filtered set changes.
  useEffect(() => {
    setPage(1);
  }, [query, filter, sourceFilter, sort, dateRange]);

  const paged = useMemo(
    () => visible.slice((page - 1) * pageSize, page * pageSize),
    [visible, page, pageSize]
  );

  const pillFor = (key: Filter) => {
    const active = filter === key;
    const count =
      key === "all"
        ? orders.length
        : stats.counts[key as StatusKey] ?? 0;
    const label = key === "all" ? "All" : key.charAt(0).toUpperCase() + key.slice(1);
    return (
      <button
        key={key}
        type="button"
        onClick={() => setFilter(key)}
        className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
          active
            ? "border-ink bg-ink text-bone"
            : "border-ink/15 text-ink/80 hover:bg-ink/5"
        }`}
      >
        {label} <span className={active ? "text-bone/70" : "text-muted"}>· {count}</span>
      </button>
    );
  };

  function queueTransition(order: OrderRow, transition: Transition) {
    const tone = transition.tone;
    setPending({
      orderId: order.id,
      customerName: order.customer_name,
      next: transition.next,
      title: transition.label,
      description: `${transition.label} for ${order.customer_name} (${order.id
        .slice(0, 8)
        .toUpperCase()})?`,
      tone,
      confirmText: transition.label,
    });
  }

  async function exportXLSX() {
    if (visible.length === 0 || exporting) return;
    setExporting(true);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      wb.creator = "bare nest";
      wb.created = new Date();
      const sheet = wb.addWorksheet("Orders");
      sheet.columns = [
        { header: "Ref", key: "ref", width: 10 },
        { header: "Date", key: "date", width: 22 },
        { header: "Status", key: "status", width: 12 },
        { header: "Customer", key: "name", width: 24 },
        { header: "Phone", key: "phone", width: 16 },
        { header: "Email", key: "email", width: 28 },
        { header: "Address", key: "address", width: 36 },
        { header: "Notes", key: "notes", width: 30 },
        { header: "Items", key: "items", width: 40 },
        { header: "Total (INR)", key: "total", width: 14 },
      ];
      for (const o of visible) {
        sheet.addRow({
          ref: o.id.slice(0, 8).toUpperCase(),
          date: new Date(o.created_at),
          status: o.status,
          name: o.customer_name,
          phone: o.customer_phone,
          email: o.customer_email ?? "",
          address: o.customer_address,
          notes: o.notes ?? "",
          items: o.items
            .map(
              (i) =>
                `${i.name}${i.material ? ` (${i.material})` : ""} × ${i.qty}`
            )
            .join("; "),
          total: o.total,
        });
      }
      sheet.getRow(1).font = { bold: true };
      sheet.getColumn("date").numFmt = "yyyy-mm-dd hh:mm";
      sheet.getColumn("total").numFmt = "#,##0";
      sheet.views = [{ state: "frozen", ySplit: 1 }];

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const stamp = new Date().toISOString().slice(0, 10);
      const hint = filter === "all" ? "" : `-${filter}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = `barenest-orders${hint}-${stamp}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  function queueCancel(order: OrderRow) {
    setPending({
      orderId: order.id,
      customerName: order.customer_name,
      next: "cancelled",
      title: "Cancel order",
      description: `Cancel ${order.customer_name}'s order? They won't be notified automatically — you'll need to reach out separately.`,
      tone: "danger",
      confirmText: "Cancel order",
    });
  }

  return (
    <div>
      <AdminHeaderActions>
        <Link
          href="/admin/orders/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm text-bone transition-colors hover:bg-bark"
        >
          <Plus className="h-4 w-4" />
          New order
        </Link>
      </AdminHeaderActions>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {STATUS_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={`rounded-2xl border border-ink/10 bg-cream/40 p-4 text-left transition-colors hover:bg-cream/70 ${
              filter === k ? "ring-1 ring-ink/40" : ""
            }`}
          >
            <p className="eyebrow text-muted">{k}</p>
            <p className="mt-1 font-display text-3xl">{stats.counts[k]}</p>
          </button>
        ))}
        <div className="rounded-2xl border border-ink/10 bg-ink p-4 text-bone">
          <p className="eyebrow text-bone/70">revenue</p>
          <p className="mt-1 font-display text-3xl">{formatINR(stats.revenue)}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search by name, phone, email, or ref…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-ink/15 bg-bone py-2.5 pl-10 pr-4 text-sm placeholder:text-muted focus:border-ink/40 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-full border border-ink/15 bg-bone pl-3 pr-1 py-1 text-sm focus-within:border-ink/40">
            <Calendar className="h-4 w-4 text-muted" />
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as DatePreset)}
              className="bg-transparent py-1.5 pr-3 text-sm focus:outline-none"
              aria-label="Date range"
            >
              {(Object.keys(datePresetLabels) as DatePreset[]).map((k) => (
                <option key={k} value={k}>
                  {datePresetLabels[k]}
                </option>
              ))}
            </select>
          </label>
          {datePreset === "custom" && (
            <div className="flex items-center gap-2 rounded-full border border-ink/15 bg-bone px-3 py-1.5">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="bg-transparent text-xs focus:outline-none"
                aria-label="From date"
              />
              <span className="text-xs text-muted">→</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="bg-transparent text-xs focus:outline-none"
                aria-label="To date"
              />
            </div>
          )}
          <label className="flex items-center gap-2 rounded-full border border-ink/15 bg-bone pl-3 pr-1 py-1 text-sm focus-within:border-ink/40">
            <Tag className="h-4 w-4 text-muted" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
              className="bg-transparent py-1.5 pr-3 text-sm focus:outline-none"
              aria-label="Source"
            >
              <option value="all">All sources</option>
              <option value="online">Online only</option>
              <option value="manual">Walk-in only</option>
            </select>
          </label>
          <label className="flex items-center gap-2 rounded-full border border-ink/15 bg-bone pl-3 pr-1 py-1 text-sm focus-within:border-ink/40">
            <ArrowDownUp className="h-4 w-4 text-muted" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="bg-transparent py-1.5 pr-3 text-sm focus:outline-none"
              aria-label="Sort"
            >
              {(Object.keys(sortLabels) as Sort[]).map((k) => (
                <option key={k} value={k}>
                  {sortLabels[k]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={exportXLSX}
            disabled={visible.length === 0 || exporting}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-bone px-4 py-2 text-sm text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50"
            title="Export Excel"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Generating…" : "Export Excel"}
          </button>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {pillFor("all")}
        {STATUS_KEYS.map((k) => pillFor(k))}
        <span className="ml-auto text-xs text-muted">
          {visible.length} of {orders.length}
        </span>
      </div>

      {/* Cards */}
      <div className="mt-6 space-y-4">
        {paged.map((o) => {
          const ref = o.id.slice(0, 8).toUpperCase();
          const status = (STATUS_KEYS.includes(o.status as StatusKey)
            ? o.status
            : "new") as StatusKey;
          const fwd = forward[status];
          const rec = recovery[status];
          const source = (o.source === "manual" ? "manual" : "online") as SourceKey;
          const SourceIcon = sourceMeta[source].icon;

          return (
            <article
              key={o.id}
              className="rounded-3xl border border-ink/10 bg-cream/30 p-4 sm:p-6"
            >
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${statusStyles[status]}`}
                    >
                      {status}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${sourceMeta[source].chip}`}
                      title={`Order source: ${sourceMeta[source].label.toLowerCase()}`}
                    >
                      <SourceIcon className="h-2.5 w-2.5" />
                      {sourceMeta[source].label}
                    </span>
                    <p className="font-display text-xl">{o.customer_name}</p>
                    <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">
                      {ref}
                    </span>
                    {o.customer_gstin && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-walnut/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-walnut"
                        title={`Customer GSTIN: ${o.customer_gstin}`}
                      >
                        <Tag className="h-2.5 w-2.5" />
                        B2B
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(o.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${o.customer_phone}`}
                      title={`Call ${o.customer_phone}`}
                      className="rounded-full p-2 text-ink/60 hover:bg-ink/5 hover:text-ink"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    <a
                      href={`https://wa.me/${waNumber(o.customer_phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="WhatsApp"
                      className="rounded-full p-2 text-ink/60 hover:bg-leaf/15 hover:text-leaf"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                    {o.customer_email && (
                      <a
                        href={`mailto:${o.customer_email}`}
                        title={o.customer_email}
                        className="rounded-full p-2 text-ink/60 hover:bg-ink/5 hover:text-ink"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                    <Link
                      href={`/admin/invoices/${o.id}`}
                      title={
                        o.invoice_number
                          ? `View invoice ${o.invoice_number}`
                          : "Generate invoice"
                      }
                      className={`rounded-full p-2 transition-colors ${
                        o.invoice_number
                          ? "text-leaf hover:bg-leaf/15"
                          : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                    </Link>
                  </div>
                  <span className="font-display text-xl">{formatINR(o.total)}</span>
                </div>
              </header>

              <div className="mt-4 grid gap-1 text-sm">
                <p className="text-ink/80">{o.customer_address}</p>
                <p className="text-xs text-muted">
                  {o.customer_phone}
                  {o.customer_email ? ` · ${o.customer_email}` : ""}
                </p>
              </div>

              {o.notes && (
                <p className="mt-3 rounded-xl bg-bone/60 p-3 text-xs italic text-ink/70">
                  &ldquo;{o.notes}&rdquo;
                </p>
              )}

              <ul className="mt-4 divide-y divide-ink/10 text-sm">
                {o.items.map((i, idx) => (
                  <li
                    key={`${i.slug}-${idx}`}
                    className="flex items-baseline justify-between gap-3 py-2"
                  >
                    <span className="min-w-0 truncate">
                      {i.name}{" "}
                      <span className="text-muted">
                        {i.material ? `· ${i.material} ` : ""}× {i.qty}
                      </span>
                    </span>
                    <span className="shrink-0">{formatINR(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>

              {o.attachment_urls.length > 0 && (
                <div className="mt-5">
                  <p className="eyebrow flex items-center gap-1.5 text-muted">
                    <Paperclip className="h-3 w-3" />
                    Room photos · {o.attachment_urls.length}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {o.attachment_urls.map((u, idx) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <a
                        key={u}
                        href={u}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Photo ${idx + 1}`}
                        className="block h-20 w-20 overflow-hidden rounded-xl border border-ink/10 bg-bone transition-transform hover:scale-105"
                      >
                        <img
                          src={u}
                          alt={`Attachment ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <footer className="mt-5 flex flex-col gap-2 border-t border-ink/10 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
                {fwd && (
                  <button
                    type="button"
                    onClick={() => queueTransition(o, fwd)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-xs text-bone hover:bg-bark sm:w-auto sm:py-2"
                  >
                    <fwd.icon className="h-3.5 w-3.5" />
                    {fwd.label}
                  </button>
                )}
                {rec && (
                  <button
                    type="button"
                    onClick={() => queueTransition(o, rec)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-xs hover:bg-ink/5 sm:w-auto sm:py-2"
                  >
                    <rec.icon className="h-3.5 w-3.5" />
                    {rec.label}
                  </button>
                )}
                {(status === "new" || status === "confirmed") && (
                  <button
                    type="button"
                    onClick={() => queueCancel(o)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-xs text-rust hover:bg-rust/10 sm:ml-auto sm:w-auto sm:py-2"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel order
                  </button>
                )}
              </footer>
            </article>
          );
        })}

        {visible.length === 0 && (
          <div className="rounded-3xl border border-ink/10 bg-cream/40 p-10 text-center text-sm text-muted">
            {orders.length === 0
              ? "No orders yet."
              : "No orders match those filters."}
          </div>
        )}
      </div>

      <Pagination
        total={visible.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(n) => {
          setPageSize(n);
          setPage(1);
        }}
        label="orders"
      />

      <ConfirmDialog
        open={!!pending}
        onCancel={() => setPending(null)}
        title={pending?.title ?? ""}
        description={pending?.description ?? ""}
        tone={pending?.tone ?? "default"}
        confirmText={pending?.confirmText ?? "Confirm"}
        action={updateOrderStatus}
        hiddenFields={
          pending ? { id: pending.orderId, status: pending.next } : undefined
        }
      />
    </div>
  );
}
