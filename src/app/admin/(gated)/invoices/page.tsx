import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatINR } from "@/lib/utils";
import { ArrowUpRight, FileText } from "lucide-react";

type Row = {
  id: string;
  customer_name: string;
  customer_city: string | null;
  total: number;
  status: string;
  invoice_number: string | null;
  invoice_generated_at: string | null;
  created_at: string;
};

const statusStyle: Record<string, string> = {
  new: "bg-rust/15 text-rust",
  confirmed: "bg-leaf/15 text-leaf",
  fulfilled: "bg-ink/10 text-ink/70",
  cancelled: "bg-muted/15 text-muted line-through",
};

export default async function AdminInvoicesPage() {
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("orders")
    .select(
      "id,customer_name,customer_city,total,status,invoice_number,invoice_generated_at,created_at"
    )
    .order("invoice_generated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) return <p className="text-sm text-rust">{error.message}</p>;
  const rows = (data ?? []) as Row[];
  const generated = rows.filter((r) => r.invoice_number);
  const eligible = rows.filter(
    (r) => !r.invoice_number && (r.status === "confirmed" || r.status === "fulfilled")
  );

  return (
    <div>
      <h2 className="font-display text-3xl">Invoices</h2>
      <p className="mt-2 text-sm text-muted">
        GST tax invoices for confirmed and fulfilled orders. Sequential
        numbering is assigned the first time you click <strong>Generate</strong>.
      </p>

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h3 className="font-display text-xl">Generated</h3>
          <span className="text-xs text-muted">{generated.length} issued</span>
        </div>
        <div className="mt-4 divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-cream/30">
          {generated.length === 0 && (
            <div className="p-10 text-center text-sm text-muted">
              No invoices generated yet.
            </div>
          )}
          {generated.map((r) => (
            <Link
              key={r.id}
              href={`/admin/invoices/${r.id}`}
              className="flex items-center gap-4 p-4 hover:bg-cream/60"
            >
              <FileText className="h-4 w-4 shrink-0 text-ink/50" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base">
                  {r.invoice_number}
                </p>
                <p className="truncate text-xs text-muted">
                  {r.customer_name}
                  {r.customer_city ? ` · ${r.customer_city}` : ""}
                  {r.invoice_generated_at
                    ? ` · ${new Date(r.invoice_generated_at).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}`
                    : ""}
                </p>
              </div>
              <span
                className={`hidden rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] sm:inline-block ${
                  statusStyle[r.status] ?? "bg-ink/10 text-ink/70"
                }`}
              >
                {r.status}
              </span>
              <span className="w-24 shrink-0 text-right text-sm tabular-nums">
                {formatINR(r.total)}
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-ink/30" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h3 className="font-display text-xl">Awaiting generation</h3>
          <span className="text-xs text-muted">
            {eligible.length} order{eligible.length === 1 ? "" : "s"}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          Confirmed and fulfilled orders that don&apos;t have an invoice number yet.
        </p>
        <div className="mt-4 divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-cream/30">
          {eligible.length === 0 && (
            <div className="p-10 text-center text-sm text-muted">
              All confirmed orders have invoices.
            </div>
          )}
          {eligible.map((r) => (
            <Link
              key={r.id}
              href={`/admin/invoices/${r.id}`}
              className="flex items-center gap-4 p-4 hover:bg-cream/60"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base">
                  {r.customer_name}
                </p>
                <p className="truncate text-xs text-muted">
                  {r.customer_city ?? "—"} ·{" "}
                  {new Date(r.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`hidden rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] sm:inline-block ${
                  statusStyle[r.status] ?? "bg-ink/10 text-ink/70"
                }`}
              >
                {r.status}
              </span>
              <span className="w-24 shrink-0 text-right text-sm tabular-nums">
                {formatINR(r.total)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs text-bone">
                Generate
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
