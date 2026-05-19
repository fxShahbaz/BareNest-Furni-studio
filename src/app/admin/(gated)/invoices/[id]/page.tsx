import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateInvoice } from "@/app/admin/(gated)/actions";
import { formatINR, SHOWROOM } from "@/lib/utils";
import { ArrowLeft, FileText } from "lucide-react";
import InvoicePrintButton from "@/components/admin/invoice-print-button";

type RawItem = {
  slug?: string;
  name?: string;
  qty?: number;
  price?: number;
  material?: string;
  gst_rate?: number;
  tax_inclusive?: boolean;
  hsn_code?: string | null;
};

type OrderRow = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  customer_city: string | null;
  customer_pincode: string | null;
  customer_gstin: string | null;
  items: RawItem[] | null;
  total: number;
  status: string;
  invoice_number: string | null;
  invoice_generated_at: string | null;
  created_at: string;
};

type ProductTaxInfo = {
  slug: string;
  hsn_code: string | null;
  gst_rate: number | null;
  tax_inclusive: boolean | null;
};

type Params = Promise<{ id: string }>;

/** Bihar pincodes start with 8 (range 800-855). Used as a coarse signal
 *  for intra vs inter-state supply when the customer didn't give a GSTIN. */
function isIntraState(pincode: string | null): boolean {
  if (!pincode) return true; // assume local — most launch orders will be Patna
  return pincode.trim().startsWith("8");
}

type LineComputed = {
  slug: string;
  name: string;
  qty: number;
  hsn: string;
  unitListed: number;          // per-unit price as listed
  unitTaxable: number;         // per-unit taxable amount (pre-GST)
  unitGst: number;             // per-unit GST amount
  gstRate: number;
  taxInclusive: boolean;
  lineTaxable: number;
  lineGst: number;
  lineTotal: number;
};

function computeLine(item: RawItem, hint: ProductTaxInfo | undefined): LineComputed {
  const qty = item.qty ?? 1;
  const unitListed = item.price ?? 0;
  const gstRate = item.gst_rate ?? hint?.gst_rate ?? 18;
  const taxInclusive = item.tax_inclusive ?? hint?.tax_inclusive ?? true;

  let unitTaxable: number;
  let unitGst: number;
  if (taxInclusive) {
    // Reverse-calc taxable from inclusive listed price.
    unitTaxable = unitListed / (1 + gstRate / 100);
    unitGst = unitListed - unitTaxable;
  } else {
    unitTaxable = unitListed;
    unitGst = unitListed * (gstRate / 100);
  }

  const lineTaxable = unitTaxable * qty;
  const lineGst = unitGst * qty;
  // Line total: inclusive → listed*qty; exclusive → taxable+gst.
  const lineTotal = taxInclusive ? unitListed * qty : lineTaxable + lineGst;

  return {
    slug: item.slug ?? "",
    name: item.name ?? "—",
    qty,
    // Prefer the snapshot on the order line; fall back to the live product
    // hint only when the order pre-dates the snapshotting code path.
    hsn: item.hsn_code ?? hint?.hsn_code ?? "—",
    unitListed,
    unitTaxable,
    unitGst,
    gstRate,
    taxInclusive,
    lineTaxable,
    lineGst,
    lineTotal,
  };
}

const SMALL_RUPEE = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function r2(n: number): string {
  return SMALL_RUPEE.format(Math.round(n * 100) / 100);
}

export default async function InvoicePage({ params }: { params: Params }) {
  const { id } = await params;
  const admin = supabaseAdmin();

  const { data, error } = await admin
    .from("orders")
    .select(
      "id,customer_name,customer_phone,customer_email,customer_address,customer_city,customer_pincode,customer_gstin,items,total,status,invoice_number,invoice_generated_at,created_at"
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) notFound();
  const order = data as OrderRow;

  const items = order.items ?? [];
  const slugs = items.map((i) => i.slug).filter(Boolean) as string[];

  // Pull HSN + tax fields from products to fill anything missing on the
  // cart snapshot (especially relevant for orders placed before tax fields
  // existed on the cart).
  const hintsMap = new Map<string, ProductTaxInfo>();
  if (slugs.length > 0) {
    const { data: prods } = await admin
      .from("products")
      .select("slug,hsn_code,gst_rate,tax_inclusive")
      .in("slug", slugs);
    for (const p of (prods ?? []) as ProductTaxInfo[]) {
      hintsMap.set(p.slug, p);
    }
  }

  const lines = items.map((it) =>
    computeLine(it, it.slug ? hintsMap.get(it.slug) : undefined)
  );

  const subtotalTaxable = lines.reduce((s, l) => s + l.lineTaxable, 0);
  const totalGst = lines.reduce((s, l) => s + l.lineGst, 0);
  const grandTotalRaw = lines.reduce((s, l) => s + l.lineTotal, 0);
  const grandTotal = Math.round(grandTotalRaw);
  const roundOff = grandTotal - grandTotalRaw;

  const intra = isIntraState(order.customer_pincode);
  const cgst = intra ? totalGst / 2 : 0;
  const sgst = intra ? totalGst / 2 : 0;
  const igst = intra ? 0 : totalGst;

  const issueDate = order.invoice_generated_at ?? order.created_at;
  const invoiceNumber = order.invoice_number;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Toolbar — hidden when printing */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/admin/invoices"
          className="inline-flex items-center gap-2 text-sm text-ink/70 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          All invoices
        </Link>
        <div className="flex items-center gap-2">
          {!invoiceNumber && (
            <form action={generateInvoice}>
              <input type="hidden" name="id" value={order.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-bone hover:bg-bark"
              >
                <FileText className="h-4 w-4" />
                Generate invoice
              </button>
            </form>
          )}
          {invoiceNumber && <InvoicePrintButton />}
        </div>
      </div>

      {!invoiceNumber && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-rust/30 bg-rust/5 px-4 py-3 text-sm text-rust print:hidden"
        >
          This order doesn&apos;t have an invoice number yet. Click <strong>Generate
          invoice</strong> to allocate a sequential GST number — the document
          below isn&apos;t a valid tax invoice until then.
        </div>
      )}

      {/* The invoice sheet itself */}
      <article className="mt-6 rounded-3xl border border-ink/10 bg-bone p-8 text-ink shadow-sm print:mt-0 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b border-ink/15 pb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted">
              Tax Invoice
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight">
              {SHOWROOM.tax.legalName}
            </h1>
            <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-muted">
              {SHOWROOM.tax.addressLines.join("\n")}
            </p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px] text-ink/80">
              <dt className="text-muted">GSTIN</dt>
              <dd className="font-mono tracking-wider">{SHOWROOM.tax.gstin}</dd>
              <dt className="text-muted">PAN</dt>
              <dd className="font-mono tracking-wider">{SHOWROOM.tax.pan}</dd>
              <dt className="text-muted">State</dt>
              <dd>
                {SHOWROOM.tax.state} ({SHOWROOM.tax.stateCode})
              </dd>
            </dl>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted">
              Invoice no.
            </p>
            <p className="mt-1 font-display text-xl tabular-nums">
              {invoiceNumber ?? "— pending —"}
            </p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px] text-ink/80 text-left">
              <dt className="text-muted">Date</dt>
              <dd>
                {new Date(issueDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </dd>
              <dt className="text-muted">Place of supply</dt>
              <dd>{intra ? "Bihar (intra-state)" : "Inter-state"}</dd>
              <dt className="text-muted">Order id</dt>
              <dd className="font-mono text-[10px]">{order.id.slice(0, 8)}…</dd>
            </dl>
          </div>
        </header>

        {/* Bill to */}
        <section className="mt-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted">
            Bill to
          </p>
          <p className="mt-1 font-display text-lg">{order.customer_name}</p>
          <p className="text-xs text-ink/80">{order.customer_phone}</p>
          {order.customer_email && (
            <p className="text-xs text-ink/80">{order.customer_email}</p>
          )}
          <p className="mt-1 whitespace-pre-line text-xs text-ink/80">
            {order.customer_address}
            {order.customer_city ? `, ${order.customer_city}` : ""}
            {order.customer_pincode ? ` — ${order.customer_pincode}` : ""}
          </p>
          {order.customer_gstin && (
            <p className="mt-1 text-xs text-ink/80">
              <span className="text-muted">GSTIN:</span>{" "}
              <span className="font-mono">{order.customer_gstin}</span>
            </p>
          )}
        </section>

        {/* Items */}
        <table className="mt-6 w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-ink/20 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Item</th>
              <th className="py-2 pr-2">HSN</th>
              <th className="py-2 pr-2 text-right">Qty</th>
              <th className="py-2 pr-2 text-right">Rate</th>
              <th className="py-2 pr-2 text-right">Taxable</th>
              <th className="py-2 pr-2 text-right">GST %</th>
              <th className="py-2 pr-2 text-right">GST amt</th>
              <th className="py-2 pl-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={`${l.slug}-${i}`} className="border-b border-ink/5 align-top">
                <td className="py-2 pr-2 text-muted">{i + 1}</td>
                <td className="py-2 pr-2">
                  <p className="font-medium text-ink">{l.name}</p>
                  {!l.taxInclusive && (
                    <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-rust">
                      Tax exclusive
                    </p>
                  )}
                </td>
                <td className="py-2 pr-2 font-mono text-[10px] text-ink/70">{l.hsn}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{l.qty}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{r2(l.unitListed)}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{r2(l.lineTaxable)}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{l.gstRate}%</td>
                <td className="py-2 pr-2 text-right tabular-nums">{r2(l.lineGst)}</td>
                <td className="py-2 pl-2 text-right font-medium tabular-nums">
                  {r2(l.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <section className="mt-6 ml-auto w-full max-w-sm text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted">Subtotal (taxable)</span>
            <span className="tabular-nums">{r2(subtotalTaxable)}</span>
          </div>
          {intra ? (
            <>
              <div className="flex justify-between py-1">
                <span className="text-muted">CGST</span>
                <span className="tabular-nums">{r2(cgst)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted">SGST</span>
                <span className="tabular-nums">{r2(sgst)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between py-1">
              <span className="text-muted">IGST</span>
              <span className="tabular-nums">{r2(igst)}</span>
            </div>
          )}
          <div className="flex justify-between py-1 text-muted">
            <span>Round-off</span>
            <span className="tabular-nums">
              {roundOff >= 0 ? "+" : ""}
              {r2(roundOff)}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t border-ink/20 pt-2">
            <span className="font-display text-base">Grand total</span>
            <span className="font-display text-xl tabular-nums">
              {formatINR(grandTotal)}
            </span>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 grid gap-6 border-t border-ink/15 pt-5 text-[11px] text-muted md:grid-cols-2">
          <div>
            <p className="font-medium text-ink/80">Terms</p>
            <ul className="mt-2 space-y-1 leading-relaxed">
              <li>— Goods once delivered cannot be returned without prior approval.</li>
              <li>— Defects must be reported within 7 days of delivery.</li>
              <li>— Subject to {SHOWROOM.city} jurisdiction.</li>
            </ul>
          </div>
          <div className="md:text-right">
            <p className="font-medium text-ink/80">
              For {SHOWROOM.tax.legalName}
            </p>
            <p className="mt-12">Authorised signatory</p>
          </div>
        </footer>
      </article>
    </div>
  );
}
