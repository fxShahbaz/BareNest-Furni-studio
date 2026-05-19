"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowDownUp,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Undo2,
  ShoppingBag,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import {
  updateEnquiryStatus,
  convertEnquiryToOrder,
  deleteEnquiry,
} from "@/app/admin/(gated)/actions";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import Pagination from "@/components/admin/pagination";

export type EnquiryRow = {
  id: string;
  product_slug: string;
  product_name: string;
  product_material: string | null;
  product_price: number | null;
  qty: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  message: string | null;
  status: string;
  converted_order_id: string | null;
  created_at: string;
};

type StatusKey = "new" | "contacted" | "converted" | "closed" | "cancelled";
const STATUS_KEYS: StatusKey[] = [
  "new",
  "contacted",
  "converted",
  "closed",
  "cancelled",
];

const statusStyles: Record<StatusKey, string> = {
  new: "bg-rust/15 text-rust",
  contacted: "bg-walnut/15 text-walnut",
  converted: "bg-leaf/15 text-leaf",
  closed: "bg-ink/10 text-ink/70",
  cancelled: "bg-muted/15 text-muted line-through",
};

type Filter = "all" | StatusKey;
type Sort = "newest" | "oldest";

const sortLabels: Record<Sort, string> = {
  newest: "Newest",
  oldest: "Oldest",
};

function waNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

type PendingAction =
  | {
      kind: "status";
      id: string;
      next: StatusKey;
      title: string;
      description: string;
      tone: "default" | "danger";
      confirmText: string;
    }
  | {
      kind: "convert";
      id: string;
      productName: string;
      customerName: string;
    }
  | {
      kind: "delete";
      id: string;
      customerName: string;
    };

export default function EnquiriesManager({
  enquiries,
}: {
  enquiries: EnquiryRow[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const stats = useMemo(() => {
    const counts: Record<StatusKey, number> = {
      new: 0,
      contacted: 0,
      converted: 0,
      closed: 0,
      cancelled: 0,
    };
    for (const e of enquiries) {
      if (STATUS_KEYS.includes(e.status as StatusKey)) {
        counts[e.status as StatusKey]++;
      }
    }
    return counts;
  }, [enquiries]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = enquiries.filter((e) => {
      if (filter !== "all" && e.status !== filter) return false;
      if (!q) return true;
      return (
        e.customer_name.toLowerCase().includes(q) ||
        e.customer_phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
        e.product_name.toLowerCase().includes(q) ||
        e.product_slug.toLowerCase().includes(q) ||
        (e.customer_email?.toLowerCase().includes(q) ?? false)
      );
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const at = new Date(a.created_at).getTime();
      const bt = new Date(b.created_at).getTime();
      return sort === "newest" ? bt - at : at - bt;
    });
    return sorted;
  }, [enquiries, query, filter, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, filter, sort]);

  const paged = useMemo(
    () => visible.slice((page - 1) * pageSize, page * pageSize),
    [visible, page, pageSize]
  );

  const pillFor = (key: Filter) => {
    const active = filter === key;
    const count =
      key === "all"
        ? enquiries.length
        : stats[key as StatusKey] ?? 0;
    const label =
      key === "all" ? "All" : key.charAt(0).toUpperCase() + key.slice(1);
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
        {label}{" "}
        <span className={active ? "text-bone/70" : "text-muted"}>· {count}</span>
      </button>
    );
  };

  function queueStatus(
    id: string,
    next: StatusKey,
    label: string,
    customerName: string,
    tone: "default" | "danger" = "default"
  ) {
    setPending({
      kind: "status",
      id,
      next,
      title: label,
      description: `${label} for ${customerName}?`,
      tone,
      confirmText: label,
    });
  }

  return (
    <div>
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
            <p className="mt-1 font-display text-3xl">{stats[k]}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search by customer, phone, product…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-ink/15 bg-bone py-2.5 pl-10 pr-4 text-sm placeholder:text-muted focus:border-ink/40 focus:outline-none"
          />
        </div>
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
      </div>

      {/* Filter pills */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {pillFor("all")}
        {STATUS_KEYS.map((k) => pillFor(k))}
        <span className="ml-auto text-xs text-muted">
          {visible.length} of {enquiries.length}
        </span>
      </div>

      {/* Cards */}
      <div className="mt-6 space-y-4">
        {paged.map((e) => {
          const status = (STATUS_KEYS.includes(e.status as StatusKey)
            ? e.status
            : "new") as StatusKey;
          const lineTotal =
            e.product_price !== null ? e.product_price * e.qty : null;

          return (
            <article
              key={e.id}
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
                    <p className="font-display text-xl">{e.customer_name}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(e.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${e.customer_phone}`}
                      title={`Call ${e.customer_phone}`}
                      className="rounded-full p-2 text-ink/60 hover:bg-ink/5 hover:text-ink"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    <a
                      href={`https://wa.me/${waNumber(e.customer_phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="WhatsApp"
                      className="rounded-full p-2 text-ink/60 hover:bg-leaf/15 hover:text-leaf"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                    {e.customer_email && (
                      <a
                        href={`mailto:${e.customer_email}`}
                        title={e.customer_email}
                        className="rounded-full p-2 text-ink/60 hover:bg-ink/5 hover:text-ink"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  {lineTotal !== null && (
                    <span className="font-display text-xl">
                      {formatINR(lineTotal)}
                    </span>
                  )}
                </div>
              </header>

              <div className="mt-4 grid gap-1 text-sm">
                <Link
                  href={`/shop/${e.product_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-ink/80 hover:text-ink"
                >
                  {e.product_name}{" "}
                  <span className="text-muted">
                    {e.product_material ? `· ${e.product_material} ` : ""}× {e.qty}
                  </span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </Link>
                <p className="text-xs text-muted">
                  {e.customer_phone}
                  {e.customer_email ? ` · ${e.customer_email}` : ""}
                </p>
              </div>

              {e.message && (
                <p className="mt-3 rounded-xl bg-bone/60 p-3 text-xs italic text-ink/70">
                  &ldquo;{e.message}&rdquo;
                </p>
              )}

              <footer className="mt-5 flex flex-col gap-2 border-t border-ink/10 pt-4 sm:flex-row sm:flex-wrap sm:items-center [&_button]:w-full [&_a]:w-full sm:[&_button]:w-auto sm:[&_a]:w-auto [&_button]:justify-center [&_a]:justify-center sm:[&_button]:justify-start sm:[&_a]:justify-start">
                {status === "new" && (
                  <button
                    type="button"
                    onClick={() =>
                      queueStatus(
                        e.id,
                        "contacted",
                        "Mark contacted",
                        e.customer_name
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-xs hover:bg-ink/5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark contacted
                  </button>
                )}
                {(status === "new" || status === "contacted") && (
                  <button
                    type="button"
                    onClick={() =>
                      setPending({
                        kind: "convert",
                        id: e.id,
                        productName: e.product_name,
                        customerName: e.customer_name,
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs text-bone hover:bg-bark"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Convert to order
                  </button>
                )}
                {(status === "new" || status === "contacted") && (
                  <button
                    type="button"
                    onClick={() =>
                      queueStatus(e.id, "closed", "Close enquiry", e.customer_name)
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-xs hover:bg-ink/5"
                  >
                    Mark closed
                  </button>
                )}
                {(status === "closed" || status === "cancelled") && (
                  <button
                    type="button"
                    onClick={() =>
                      queueStatus(
                        e.id,
                        "new",
                        "Reopen enquiry",
                        e.customer_name
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-xs hover:bg-ink/5"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    Reopen
                  </button>
                )}
                {status === "converted" && e.converted_order_id && (
                  <Link
                    href="/admin/orders"
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-xs hover:bg-ink/5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View order
                  </Link>
                )}

                <div className="ml-auto flex items-center gap-2">
                  {(status === "new" || status === "contacted") && (
                    <button
                      type="button"
                      onClick={() =>
                        queueStatus(
                          e.id,
                          "cancelled",
                          "Cancel enquiry",
                          e.customer_name,
                          "danger"
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-xs text-rust hover:bg-rust/10"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setPending({
                        kind: "delete",
                        id: e.id,
                        customerName: e.customer_name,
                      })
                    }
                    title="Delete enquiry"
                    className="rounded-full p-2 text-ink/60 hover:bg-rust/10 hover:text-rust"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </footer>
            </article>
          );
        })}

        {visible.length === 0 && (
          <div className="rounded-3xl border border-ink/10 bg-cream/40 p-10 text-center text-sm text-muted">
            {enquiries.length === 0
              ? "No enquiries yet. They'll appear here when customers submit the Enquire form on a product page."
              : "No enquiries match those filters."}
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
        label="enquiries"
      />

      <ConfirmDialog
        open={pending?.kind === "status"}
        onCancel={() => setPending(null)}
        title={pending?.kind === "status" ? pending.title : ""}
        description={pending?.kind === "status" ? pending.description : ""}
        tone={pending?.kind === "status" ? pending.tone : "default"}
        confirmText={pending?.kind === "status" ? pending.confirmText : "Confirm"}
        action={updateEnquiryStatus}
        hiddenFields={
          pending?.kind === "status"
            ? { id: pending.id, status: pending.next }
            : undefined
        }
      />

      <ConfirmDialog
        open={pending?.kind === "convert"}
        onCancel={() => setPending(null)}
        title="Convert to walk-in order"
        description={
          pending?.kind === "convert"
            ? `Create a confirmed walk-in order for ${pending.customerName} (${pending.productName})? The enquiry will be marked converted and you'll be redirected to /admin/orders.`
            : ""
        }
        tone="default"
        confirmText="Convert"
        action={convertEnquiryToOrder}
        hiddenFields={
          pending?.kind === "convert" ? { id: pending.id } : undefined
        }
      />

      <ConfirmDialog
        open={pending?.kind === "delete"}
        onCancel={() => setPending(null)}
        title="Delete enquiry"
        description={
          pending?.kind === "delete"
            ? `Permanently delete ${pending.customerName}'s enquiry? This cannot be undone.`
            : ""
        }
        tone="danger"
        confirmText="Delete"
        action={deleteEnquiry}
        hiddenFields={
          pending?.kind === "delete" ? { id: pending.id } : undefined
        }
      />
    </div>
  );
}
