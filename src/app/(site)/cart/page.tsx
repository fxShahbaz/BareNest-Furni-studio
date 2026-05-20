"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { formatINR, formatTaxLabel } from "@/lib/utils";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Skeleton } from "@/components/skeleton";

// Zustand-persist hydration signal. We can't trust `items` until the
// store has read from localStorage, otherwise we'd flash "empty cart"
// for one frame before the real items appear. useSyncExternalStore is
// the idiomatic way to subscribe to an out-of-React store and stays
// stable across SSR (server snapshot is always false → matches the
// initial client render, so React hydration aligns).
function subscribeHydration(cb: () => void) {
  return useCart.persist.onFinishHydration(cb);
}
function getHydratedSnapshot() {
  return useCart.persist.hasHydrated();
}
function getHydratedServerSnapshot() {
  return false;
}
function useCartHydrated() {
  return useSyncExternalStore(
    subscribeHydration,
    getHydratedSnapshot,
    getHydratedServerSnapshot
  );
}

export default function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const total = useCart((s) => s.total());
  const hydrated = useCartHydrated();
  const taxSummary = (() => {
    if (items.length === 0) return "Included";
    const inclCount = items.filter((i) => (i.tax_inclusive ?? true)).length;
    if (inclCount === items.length) return "Included";
    if (inclCount === 0) return "Listed per item";
    return "See each item";
  })();

  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <p className="eyebrow text-muted">Your cart</p>
        <h1 className="mt-3 font-display text-5xl tracking-tight md:text-7xl">
          Almost <span className="serif-italic">yours.</span>
        </h1>

        {!hydrated ? (
          <CartItemsSkeleton />
        ) : items.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-ink/10 bg-cream/40 p-12 text-center">
            <p className="text-muted">Your cart is empty.</p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-bone"
            >
              Browse the catalogue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-10 md:grid-cols-12">
            <ul className="md:col-span-8 divide-y divide-ink/10 border-y border-ink/10">
              {items.map((i) => (
                <li
                  key={i.slug}
                  className="flex gap-4 py-6 md:items-center md:gap-6"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-cream md:h-28 md:w-28">
                    <Image
                      src={i.image}
                      alt={i.name}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <Link
                        href={`/shop/${i.slug}`}
                        className="font-display text-xl"
                      >
                        {i.name}
                      </Link>
                      <div className="text-right">
                        <span className="block font-display text-lg">
                          {formatINR(i.price * i.qty)}
                        </span>
                        <span className="block text-[10px] uppercase tracking-[0.16em] text-muted/70">
                          {formatTaxLabel(i.gst_rate, i.tax_inclusive)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      {i.material}
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="inline-flex items-center rounded-full border border-ink/15">
                        <button
                          type="button"
                          onClick={() => setQty(i.slug, i.qty - 1)}
                          className="grid h-9 w-9 place-items-center"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">
                          {i.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(i.slug, i.qty + 1)}
                          className="grid h-9 w-9 place-items-center"
                          aria-label="Increase"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(i.slug)}
                        className="inline-flex items-center gap-1 text-xs text-muted hover:text-rust"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="md:col-span-4">
              <div className="sticky top-28 rounded-3xl border border-ink/10 bg-cream/40 p-6">
                <h2 className="font-display text-2xl">Order summary</h2>
                <dl className="mt-6 space-y-3 text-sm">
                  <Row label="Subtotal" value={formatINR(total)} />
                  <Row label="Delivery" value="Confirmed on WhatsApp" />
                  <Row label="GST" value={taxSummary} />
                </dl>
                <div className="mt-6 border-t border-ink/10 pt-4">
                  <Row
                    label="Total"
                    value={formatINR(total)}
                    big
                  />
                </div>
                <Link
                  href="/checkout"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm text-bone"
                >
                  Place order
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-center text-xs text-muted">
                  Pre-launch · order via WhatsApp, pay on delivery
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  big,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <dt className={big ? "font-display text-base" : "text-muted"}>{label}</dt>
      <dd className={big ? "font-display text-xl" : ""}>{value}</dd>
    </div>
  );
}

// Inner-only skeleton — the page chrome (heading, padding, max-width)
// renders unconditionally above this, so swapping skeleton -> real items
// doesn't shift the rest of the layout.
function CartItemsSkeleton() {
  return (
    <div className="mt-12 grid gap-10 md:grid-cols-12">
      <div className="md:col-span-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-3xl border border-ink/10 bg-cream/30 p-4"
          >
            <Skeleton
              className="h-24 w-24 shrink-0"
              rounded="rounded-2xl"
            />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-28" rounded="rounded-full" />
            </div>
            <Skeleton className="h-8 w-20" rounded="rounded-full" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
      <aside className="md:col-span-4 space-y-3 rounded-3xl border border-ink/10 bg-cream/30 p-6">
        <Skeleton className="h-3 w-16" rounded="rounded-full" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full" rounded="rounded-full" />
          <Skeleton className="h-4 w-5/6" rounded="rounded-full" />
        </div>
        <div className="hairline my-4" />
        <div className="flex items-baseline justify-between">
          <Skeleton className="h-4 w-16" rounded="rounded-full" />
          <Skeleton className="h-8 w-28" />
        </div>
        <Skeleton className="mt-4 h-12 w-full" rounded="rounded-full" />
      </aside>
    </div>
  );
}
