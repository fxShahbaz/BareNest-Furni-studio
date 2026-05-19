"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ArrowDownUp,
  Phone,
  MessageCircle,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  updateChatMessageStatus,
  deleteChatMessage,
} from "@/app/admin/(gated)/actions";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import Pagination from "@/components/admin/pagination";

export type ChatTurnRow = {
  role: "bot" | "user";
  content: string;
  at: string;
};

export type ChatMessageRow = {
  id: string;
  name: string;
  phone: string;
  topic: string | null;
  message: string | null;
  transcript: ChatTurnRow[] | null;
  status: string;
  created_at: string;
};

type StatusKey = "new" | "read" | "replied" | "closed";
const STATUS_KEYS: StatusKey[] = ["new", "read", "replied", "closed"];

const statusStyles: Record<StatusKey, string> = {
  new: "bg-rust/15 text-rust",
  read: "bg-walnut/15 text-walnut",
  replied: "bg-leaf/15 text-leaf",
  closed: "bg-ink/10 text-ink/70",
};

type Filter = "all" | StatusKey;
type Sort = "newest" | "oldest";

function waNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN");
}

type PendingAction =
  | {
      kind: "status";
      id: string;
      next: StatusKey;
      title: string;
      description: string;
      confirmText: string;
    }
  | {
      kind: "delete";
      id: string;
      customerName: string;
    };

export default function MessagesManager({
  messages,
}: {
  messages: ChatMessageRow[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  const stats = useMemo(() => {
    const counts: Record<StatusKey, number> = {
      new: 0,
      read: 0,
      replied: 0,
      closed: 0,
    };
    for (const m of messages) {
      if (STATUS_KEYS.includes(m.status as StatusKey)) {
        counts[m.status as StatusKey]++;
      }
    }
    return counts;
  }, [messages]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = messages.filter((m) => {
      if (filter !== "all" && m.status !== filter) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
        (m.topic?.toLowerCase().includes(q) ?? false) ||
        (m.message?.toLowerCase().includes(q) ?? false)
      );
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const at = new Date(a.created_at).getTime();
      const bt = new Date(b.created_at).getTime();
      return sort === "newest" ? bt - at : at - bt;
    });
    return sorted;
  }, [messages, query, filter, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, filter, sort]);

  const paged = useMemo(
    () => visible.slice((page - 1) * pageSize, page * pageSize),
    [visible, page, pageSize]
  );

  const pillFor = (key: Filter) => {
    const active = filter === key;
    const count = key === "all" ? messages.length : stats[key as StatusKey];
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

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Total" value={messages.length} />
        <StatCard label="New" value={stats.new} tone="rust" />
        <StatCard label="Read" value={stats.read} tone="walnut" />
        <StatCard label="Replied" value={stats.replied} tone="leaf" />
        <StatCard label="Closed" value={stats.closed} tone="ink" />
      </div>

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="relative block w-full md:max-w-md">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, topic, or message"
            className="h-10 w-full rounded-full border border-ink/15 bg-bone pl-9 pr-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-leaf/40"
          />
        </label>
        <button
          type="button"
          onClick={() => setSort((s) => (s === "newest" ? "oldest" : "newest"))}
          className="inline-flex h-10 items-center gap-2 self-start rounded-full border border-ink/15 px-4 text-xs text-ink/80 hover:bg-ink/5 md:self-auto"
        >
          <ArrowDownUp className="h-3.5 w-3.5" />
          {sort === "newest" ? "Newest" : "Oldest"} first
        </button>
      </div>

      {/* Pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", ...STATUS_KEYS] as Filter[]).map((k) => pillFor(k))}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted">
          No messages match.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {paged.map((m) => {
            const isOpen = expanded.has(m.id);
            const status = (
              STATUS_KEYS.includes(m.status as StatusKey)
                ? (m.status as StatusKey)
                : "new"
            ) as StatusKey;
            return (
              <li
                key={m.id}
                className="rounded-3xl border border-ink/10 bg-cream/30 p-5 md:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] ${statusStyles[status]}`}
                      >
                        {status}
                      </span>
                      <span className="font-display text-lg leading-none">
                        {m.name}
                      </span>
                      <span className="text-xs text-muted">
                        · {relativeTime(m.created_at)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                      <a
                        href={`tel:+${waNumber(m.phone)}`}
                        className="inline-flex items-center gap-1 hover:text-ink"
                      >
                        <Phone className="h-3 w-3" /> +91 {m.phone}
                      </a>
                      <a
                        href={`https://wa.me/${waNumber(m.phone)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-leaf"
                      >
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </a>
                    </div>
                    {m.topic && (
                      <p className="mt-3 inline-block rounded-full bg-bone px-3 py-1 text-[11px] text-ink/80 ring-1 ring-ink/10">
                        Topic · {m.topic}
                      </p>
                    )}
                    {m.message && (
                      <p className="mt-3 max-w-2xl text-sm text-ink/85">
                        “{m.message}”
                      </p>
                    )}
                  </div>
                </div>

                {/* Transcript toggle */}
                {m.transcript && m.transcript.length > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(m.id)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink/70 hover:text-ink"
                  >
                    {isOpen ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    {isOpen ? "Hide" : "View"} transcript ({m.transcript.length})
                  </button>
                )}
                {isOpen && m.transcript && (
                  <ul className="mt-3 space-y-2 rounded-2xl bg-bone p-3">
                    {m.transcript.map((t, i) => (
                      <li
                        key={i}
                        className={
                          t.role === "user"
                            ? "flex justify-end"
                            : "flex justify-start"
                        }
                      >
                        <span
                          className={
                            t.role === "user"
                              ? "max-w-[80%] rounded-2xl rounded-br-md bg-ink px-3 py-1.5 text-xs text-bone"
                              : "max-w-[80%] rounded-2xl rounded-bl-md bg-cream px-3 py-1.5 text-xs text-ink"
                          }
                        >
                          {t.content}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Actions */}
                <div className="mt-5 flex flex-wrap gap-2 border-t border-ink/10 pt-4">
                  {status === "new" && (
                    <button
                      type="button"
                      onClick={() =>
                        setPending({
                          kind: "status",
                          id: m.id,
                          next: "read",
                          title: "Mark as read?",
                          description:
                            "Use this to clear it from the New queue.",
                          confirmText: "Mark read",
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink/80 hover:bg-ink/5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark read
                    </button>
                  )}
                  {status !== "replied" && status !== "closed" && (
                    <button
                      type="button"
                      onClick={() =>
                        setPending({
                          kind: "status",
                          id: m.id,
                          next: "replied",
                          title: "Mark as replied?",
                          description: `Confirm you've contacted ${m.name}.`,
                          confirmText: "Mark replied",
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-leaf/30 bg-leaf/10 px-3 py-1.5 text-xs text-leaf hover:bg-leaf/15"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark replied
                    </button>
                  )}
                  {status !== "closed" && (
                    <button
                      type="button"
                      onClick={() =>
                        setPending({
                          kind: "status",
                          id: m.id,
                          next: "closed",
                          title: "Close this conversation?",
                          description:
                            "Closed messages stay in the archive but no longer surface as active.",
                          confirmText: "Close",
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink/70 hover:bg-ink/5"
                    >
                      Close
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setPending({
                        kind: "delete",
                        id: m.id,
                        customerName: m.name,
                      })
                    }
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-rust/30 px-3 py-1.5 text-xs text-rust hover:bg-rust/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        total={visible.length}
        onPageChange={setPage}
      />

      {/* Confirm dialog */}
      <ConfirmDialog
        open={pending?.kind === "status"}
        title={pending?.kind === "status" ? pending.title : ""}
        description={pending?.kind === "status" ? pending.description : ""}
        confirmText={pending?.kind === "status" ? pending.confirmText : "Confirm"}
        tone="default"
        onCancel={() => setPending(null)}
        action={pending?.kind === "status" ? updateChatMessageStatus : undefined}
        hiddenFields={
          pending?.kind === "status"
            ? { id: pending.id, status: pending.next }
            : undefined
        }
      />
      <ConfirmDialog
        open={pending?.kind === "delete"}
        title="Delete this message?"
        description={
          pending?.kind === "delete"
            ? `This permanently removes ${pending.customerName}'s message and transcript.`
            : ""
        }
        confirmText="Delete"
        tone="danger"
        onCancel={() => setPending(null)}
        action={pending?.kind === "delete" ? deleteChatMessage : undefined}
        hiddenFields={
          pending?.kind === "delete" ? { id: pending.id } : undefined
        }
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: number;
  tone?: "ink" | "rust" | "walnut" | "leaf";
}) {
  const toneStyles: Record<string, string> = {
    ink: "border-ink/10",
    rust: "border-rust/20 text-rust",
    walnut: "border-walnut/20 text-walnut",
    leaf: "border-leaf/20 text-leaf",
  };
  return (
    <div className={`rounded-2xl border bg-bone p-4 ${toneStyles[tone]}`}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}
