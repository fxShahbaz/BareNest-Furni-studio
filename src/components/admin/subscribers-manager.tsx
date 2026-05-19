"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ArrowDownUp,
  Download,
  Trash2,
  Mail,
  Copy,
  Check,
} from "lucide-react";
import { deleteSubscriber } from "@/app/admin/(gated)/actions";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import AdminHeaderActions from "@/components/admin/admin-header-actions";
import Pagination from "@/components/admin/pagination";

export type SubscriberRow = {
  email: string;
  created_at: string;
};

type Sort = "newest" | "oldest" | "email-asc";

const sortLabels: Record<Sort, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "email-asc": "Email A–Z",
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.round((now - then) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SubscribersManager({
  subscribers,
}: {
  subscribers: SubscriberRow[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [pending, setPending] = useState<SubscriberRow | null>(null);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? subscribers.filter((s) => s.email.toLowerCase().includes(q))
      : subscribers;
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
      case "email-asc":
        sorted.sort((a, b) => a.email.localeCompare(b.email));
        break;
    }
    return sorted;
  }, [subscribers, query, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, sort]);

  const paged = useMemo(
    () => visible.slice((page - 1) * pageSize, page * pageSize),
    [visible, page, pageSize]
  );

  async function copyAll() {
    const text = visible.map((s) => s.email).join(", ");
    try {
      await navigator.clipboard.writeText(text);
      setCopied("all");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  }

  async function copyOne(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(email);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      // ignore
    }
  }

  async function exportXLSX() {
    if (visible.length === 0 || exporting) return;
    setExporting(true);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      wb.creator = "BareNest";
      wb.created = new Date();
      const sheet = wb.addWorksheet("Subscribers");
      sheet.columns = [
        { header: "Email", key: "email", width: 36 },
        { header: "Signed up", key: "created_at", width: 22 },
      ];
      for (const s of visible) {
        sheet.addRow({ email: s.email, created_at: new Date(s.created_at) });
      }
      sheet.getRow(1).font = { bold: true };
      sheet.getColumn("created_at").numFmt = "yyyy-mm-dd hh:mm";
      sheet.views = [{ state: "frozen", ySplit: 1 }];

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const stamp = new Date().toISOString().slice(0, 10);
      const a = document.createElement("a");
      a.href = url;
      a.download = `barenest-subscribers-${stamp}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <AdminHeaderActions>
        <button
          type="button"
          onClick={copyAll}
          disabled={visible.length === 0}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-bone px-4 py-2 text-sm text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50"
          title="Copy all visible emails (comma-separated)"
        >
          {copied === "all" ? (
            <Check className="h-4 w-4 text-leaf" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied === "all" ? "Copied!" : "Copy emails"}
        </button>
      </AdminHeaderActions>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-ink/10 bg-cream/40 p-4">
          <p className="eyebrow text-muted">total</p>
          <p className="mt-1 font-display text-3xl">{subscribers.length}</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-cream/40 p-4">
          <p className="eyebrow text-muted">last 7 days</p>
          <p className="mt-1 font-display text-3xl">
            {
              subscribers.filter(
                (s) =>
                  Date.now() - new Date(s.created_at).getTime() <
                  7 * 24 * 60 * 60 * 1000
              ).length
            }
          </p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-cream/40 p-4">
          <p className="eyebrow text-muted">last 30 days</p>
          <p className="mt-1 font-display text-3xl">
            {
              subscribers.filter(
                (s) =>
                  Date.now() - new Date(s.created_at).getTime() <
                  30 * 24 * 60 * 60 * 1000
              ).length
            }
          </p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-ink p-4 text-bone">
          <p className="eyebrow text-bone/70">latest</p>
          <p className="mt-1 truncate font-display text-lg" title={subscribers[0]?.email ?? ""}>
            {subscribers[0]?.email ?? "—"}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search by email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-ink/15 bg-bone py-2.5 pl-10 pr-4 text-sm placeholder:text-muted focus:border-ink/40 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

      <p className="mt-3 text-xs text-muted">
        {visible.length} of {subscribers.length}
      </p>

      <div className="mt-3 divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-cream/30">
        {paged.map((s) => (
          <div
            key={s.email}
            className="flex items-center gap-3 p-4 hover:bg-cream/60"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bone text-ink/60">
              <Mail className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{s.email}</p>
              <p className="text-xs text-muted">
                Signed up {relativeTime(s.created_at)} ·{" "}
                {new Date(s.created_at).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => copyOne(s.email)}
                title="Copy email"
                className="rounded-full p-2 text-ink/60 hover:bg-ink/5 hover:text-ink"
              >
                {copied === s.email ? (
                  <Check className="h-4 w-4 text-leaf" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <a
                href={`mailto:${s.email}`}
                title="Send email"
                className="rounded-full p-2 text-ink/60 hover:bg-ink/5 hover:text-ink"
              >
                <Mail className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => setPending(s)}
                title="Delete subscriber"
                className="rounded-full p-2 text-ink/60 hover:bg-rust/10 hover:text-rust"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="p-10 text-center text-sm text-muted">
            {subscribers.length === 0
              ? "No subscribers yet. The newsletter form on the homepage feeds this list."
              : "No subscribers match that search."}
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
        label="subscribers"
      />

      <ConfirmDialog
        open={!!pending}
        onCancel={() => setPending(null)}
        title="Remove subscriber"
        description={
          pending
            ? `Permanently remove "${pending.email}" from the subscriber list? They'll need to sign up again to receive future updates.`
            : ""
        }
        tone="danger"
        confirmText="Remove"
        action={deleteSubscriber}
        hiddenFields={pending ? { email: pending.email } : undefined}
      />
    </div>
  );
}
