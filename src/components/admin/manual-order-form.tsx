"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Search, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { formatINR } from "@/lib/utils";
import {
  createManualOrder,
  type ManualOrderState,
} from "@/app/admin/(gated)/actions";

export type PickerProduct = {
  slug: string;
  name: string;
  material: string;
  price: number;
};

type LineItem = PickerProduct & { qty: number };

export default function ManualOrderForm({
  products,
}: {
  products: PickerProduct[];
}) {
  const [state, formAction] = useActionState<ManualOrderState, FormData>(
    createManualOrder,
    undefined
  );
  const [items, setItems] = useState<LineItem[]>([]);
  const [pickerQuery, setPickerQuery] = useState("");

  const total = useMemo(
    () => items.reduce((acc, i) => acc + i.price * i.qty, 0),
    [items]
  );

  const pickerResults = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q)
      )
      .filter((p) => !items.some((i) => i.slug === p.slug))
      .slice(0, 8);
  }, [products, pickerQuery, items]);

  function addProduct(p: PickerProduct) {
    setItems((cur) => [...cur, { ...p, qty: 1 }]);
    setPickerQuery("");
  }

  function setQty(slug: string, qty: number) {
    setItems((cur) =>
      cur.map((i) =>
        i.slug === slug ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i
      )
    );
  }

  function removeItem(slug: string) {
    setItems((cur) => cur.filter((i) => i.slug !== slug));
  }

  return (
    <form action={formAction} className="grid gap-6 md:grid-cols-12">
      <div className="md:col-span-7 space-y-5">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to orders
        </Link>

        <div className="rounded-3xl border border-walnut/30 bg-walnut/5 px-5 py-3 text-xs text-walnut">
          Walk-in / manual order. Will be saved with status{" "}
          <strong>confirmed</strong> and source <strong>WALK-IN</strong>.
        </div>

        <Field name="customer_name" label="Customer name" required />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field name="customer_phone" label="Phone" required />
          <Field
            name="customer_email"
            label="Email (optional)"
            type="email"
          />
        </div>
        <Field name="customer_address" label="Address" textarea required />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            name="customer_city"
            label="City"
            required
            defaultValue="Patna"
          />
          <Field name="customer_pincode" label="Pincode" required />
        </div>
        <Field name="notes" label="Notes (optional)" textarea />
      </div>

      <aside className="md:col-span-5 space-y-4">
        <div>
          <p className="eyebrow text-muted">Items</p>

          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Search to add product…"
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              className="w-full rounded-full border border-ink/15 bg-bone py-2.5 pl-10 pr-4 text-sm placeholder:text-muted focus:border-ink focus:outline-none"
            />
            {pickerResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-72 overflow-auto rounded-2xl border border-ink/15 bg-bone shadow-xl">
                {pickerResults.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => addProduct(p)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-cream/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm">{p.name}</p>
                      <p className="text-xs text-muted">
                        {p.slug} · {p.material}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm text-ink/80">
                      {formatINR(p.price)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 space-y-2">
            {items.map((i) => (
              <div
                key={i.slug}
                className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-cream/40 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{i.name}</p>
                  <p className="text-xs text-muted">
                    {i.material} · {formatINR(i.price)} ea
                  </p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={i.qty}
                  onChange={(e) =>
                    setQty(i.slug, parseInt(e.target.value, 10) || 1)
                  }
                  className="w-14 rounded-full border border-ink/15 bg-bone px-3 py-1.5 text-center text-sm focus:border-ink focus:outline-none"
                  aria-label={`Quantity for ${i.name}`}
                />
                <button
                  type="button"
                  onClick={() => removeItem(i.slug)}
                  aria-label={`Remove ${i.name}`}
                  className="rounded-full p-1.5 text-ink/60 hover:bg-rust/10 hover:text-rust"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-ink/15 px-4 py-6 text-center text-xs text-muted">
                <ShoppingBag className="mx-auto mb-2 h-5 w-5 opacity-50" />
                No items yet. Use the search above to add products.
              </div>
            )}
          </div>
        </div>

        <div className="flex items-baseline justify-between border-t border-ink/10 pt-4">
          <span className="text-sm text-muted">Total</span>
          <span className="font-display text-3xl">{formatINR(total)}</span>
        </div>

        <input type="hidden" name="items" value={JSON.stringify(items)} />

        {state?.error && (
          <p
            className="rounded-xl border border-rust/30 bg-rust/10 px-3 py-2 text-xs text-rust"
            role="alert"
          >
            {state.error}
          </p>
        )}

        <SubmitButton disabled={items.length === 0} />
      </aside>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required,
  textarea,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          required={required}
          rows={3}
          className="mt-2 w-full rounded-2xl border border-ink/15 bg-bone px-4 py-3 text-sm focus:border-ink focus:outline-none"
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          className="mt-2 w-full rounded-full border border-ink/15 bg-bone px-5 py-3 text-sm focus:border-ink focus:outline-none"
        />
      )}
    </label>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-bone transition-colors hover:bg-bark disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Plus className="h-4 w-4" />
      {pending ? "Creating…" : "Create order"}
    </button>
  );
}
