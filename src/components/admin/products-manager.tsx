"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ExternalLink,
  Copy,
  Trash2,
  Plus,
  Check,
  X,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import {
  createCategory,
  deleteCategory,
  deleteProduct,
  duplicateProduct,
} from "@/app/admin/(gated)/actions";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import type { Category } from "@/lib/queries/categories";

export type ProductRow = {
  slug: string;
  name: string;
  material: string;
  category: string;
  price: number;
  gst_rate: number | null;
  tax_inclusive: boolean | null;
  images: string[] | null;
  created_at: string;
};

type Material = "all" | "Solid Wood" | "MDF";
type Sort = "newest" | "name" | "price-asc" | "price-desc";

const sortLabels: Record<Sort, string> = {
  newest: "Newest",
  name: "Name A–Z",
  "price-asc": "Price ↑",
  "price-desc": "Price ↓",
};

const materialOptions: { value: Material; label: string }[] = [
  { value: "all", label: "All materials" },
  { value: "Solid Wood", label: "Solid Wood" },
  { value: "MDF", label: "MDF" },
];

type Pending =
  | { kind: "delete"; slug: string; name: string }
  | { kind: "duplicate"; slug: string; name: string }
  | { kind: "delete-category"; slug: string; label: string; count: number };

export default function ProductsManager({
  products,
  categories,
}: {
  products: ProductRow[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const [material, setMaterial] = useState<Material>("all");
  const [categorySlug, setCategorySlug] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [pending, setPending] = useState<Pending | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = products.filter((p) => {
      if (material !== "all" && p.material !== material) return false;
      if (categorySlug !== "all" && p.category !== categorySlug) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
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
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
    }
    return sorted;
  }, [products, query, material, categorySlug, sort]);

  // Build category chips from the registry, but also include any category
  // slugs present on products that aren't (yet) in the registry — so they're
  // still filterable. Sorted by label.
  const categoryChips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    const byCategorySlug = new Map<string, string>();
    for (const c of categories) byCategorySlug.set(c.slug, c.label);
    // Add any orphan slugs not in the registry.
    for (const slug of counts.keys()) {
      if (!byCategorySlug.has(slug)) byCategorySlug.set(slug, slug);
    }
    return Array.from(byCategorySlug.entries())
      .map(([slug, label]) => ({ slug, label, count: counts.get(slug) ?? 0 }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [products, categories]);

  // If the active filter chip disappears after revalidation (e.g. user
  // deleted an empty category that was selected), drop back to "All".
  useEffect(() => {
    if (categorySlug === "all") return;
    if (!categoryChips.some((c) => c.slug === categorySlug)) {
      setCategorySlug("all");
    }
  }, [categoryChips, categorySlug]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search by name, slug, or category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-ink/15 bg-bone py-2.5 pl-10 pr-4 text-sm placeholder:text-muted focus:border-ink/40 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value as Material)}
            className="rounded-full border border-ink/15 bg-bone px-3 py-2 text-sm focus:border-ink/40 focus:outline-none"
            aria-label="Material"
          >
            {materialOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border border-ink/15 bg-bone px-3 py-2 text-sm focus:border-ink/40 focus:outline-none"
            aria-label="Sort"
          >
            {(Object.keys(sortLabels) as Sort[]).map((k) => (
              <option key={k} value={k}>
                {sortLabels[k]}
              </option>
            ))}
          </select>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm text-bone hover:bg-bark"
          >
            <Plus className="h-4 w-4" />
            New product
          </Link>
        </div>
      </div>

      <CategoryChipBar
        chips={categoryChips}
        active={categorySlug}
        onSelect={setCategorySlug}
        onRequestDelete={(c) =>
          setPending({
            kind: "delete-category",
            slug: c.slug,
            label: c.label,
            count: c.count,
          })
        }
        totalProducts={products.length}
        visibleCount={visible.length}
      />

      <div className="mt-6 divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-cream/30">
        {visible.map((p) => (
          <div
            key={p.slug}
            className="group flex items-center gap-4 p-4 hover:bg-cream/60"
          >
            <Link
              href={`/admin/products/${p.slug}`}
              className="flex flex-1 items-center gap-4 min-w-0"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
                {p.images && p.images[0] && (
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg truncate">{p.name}</p>
                <p className="truncate text-xs text-muted">
                  {p.slug} · {p.material} · {p.category}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              <Link
                href={`/shop/${p.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                title="View on storefront"
                className="rounded-full p-2 text-ink/60 hover:bg-ink/5 hover:text-ink"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
              <button
                type="button"
                title="Duplicate"
                onClick={() =>
                  setPending({ kind: "duplicate", slug: p.slug, name: p.name })
                }
                className="rounded-full p-2 text-ink/60 hover:bg-ink/5 hover:text-ink"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Delete"
                onClick={() =>
                  setPending({ kind: "delete", slug: p.slug, name: p.name })
                }
                className="rounded-full p-2 text-ink/60 hover:bg-rust/10 hover:text-rust"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <span
              className="hidden w-16 shrink-0 text-right text-xs tabular-nums text-muted sm:inline-block"
              title="GST rate"
            >
              {(p.gst_rate ?? 18).toString()}%
            </span>
            <span
              className={`hidden w-20 shrink-0 text-center text-[10px] uppercase tracking-[0.16em] sm:inline-block ${
                (p.tax_inclusive ?? true)
                  ? "text-leaf"
                  : "text-rust"
              }`}
              title={
                (p.tax_inclusive ?? true)
                  ? "Listed price includes GST"
                  : "GST added on top of listed price"
              }
            >
              <span
                className={`inline-block rounded-full border px-2 py-0.5 ${
                  (p.tax_inclusive ?? true)
                    ? "border-leaf/30 bg-leaf/10"
                    : "border-rust/30 bg-rust/10"
                }`}
              >
                {(p.tax_inclusive ?? true) ? "Incl." : "Excl."}
              </span>
            </span>
            <span className="w-24 shrink-0 text-right text-sm">
              {formatINR(p.price)}
            </span>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="p-10 text-center text-sm text-muted">
            {products.length === 0
              ? "No products yet."
              : "No products match those filters."}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!pending}
        onCancel={() => setPending(null)}
        title={pendingTitle(pending)}
        description={pendingDescription(pending)}
        tone={
          pending?.kind === "delete" || pending?.kind === "delete-category"
            ? "danger"
            : "default"
        }
        confirmText={pendingConfirmText(pending)}
        action={
          pending?.kind === "delete"
            ? deleteProduct
            : pending?.kind === "duplicate"
            ? duplicateProduct
            : pending?.kind === "delete-category"
            ? deleteCategory
            : undefined
        }
        hiddenFields={pending ? { slug: pending.slug } : undefined}
      />
    </div>
  );
}

function pendingTitle(p: Pending | null): string {
  if (!p) return "";
  if (p.kind === "delete") return "Delete product";
  if (p.kind === "duplicate") return "Duplicate product";
  return "Remove category";
}

function pendingDescription(p: Pending | null): string {
  if (!p) return "";
  if (p.kind === "delete") {
    return `Delete "${p.name}"? This permanently removes it from the storefront and cannot be undone.`;
  }
  if (p.kind === "duplicate") {
    return `A live copy of "${p.name}" will be created as "${p.slug}-copy". You'll be taken to the new product's edit page.`;
  }
  // delete-category
  if (p.count > 0) {
    return `Remove "${p.label}" from the picker? ${p.count} product${
      p.count === 1 ? "" : "s"
    } will keep this category and appear as an unlisted chip until reassigned.`;
  }
  return `Remove "${p.label}" from the picker? It has no products attached.`;
}

function pendingConfirmText(p: Pending | null): string {
  if (!p) return "Confirm";
  if (p.kind === "delete") return "Delete";
  if (p.kind === "duplicate") return "Duplicate";
  return "Remove";
}

function CategoryChipBar({
  chips,
  active,
  onSelect,
  onRequestDelete,
  totalProducts,
  visibleCount,
}: {
  chips: { slug: string; label: string; count: number }[];
  active: string;
  onSelect: (slug: string) => void;
  onRequestDelete: (chip: { slug: string; label: string; count: number }) => void;
  totalProducts: number;
  visibleCount: number;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submitNew() {
    const label = draft.trim();
    if (label.length < 2) {
      setError("Too short.");
      return;
    }
    const fd = new FormData();
    fd.set("label", label);
    setError(null);
    startTransition(async () => {
      const res = await createCategory(undefined, fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setDraft("");
      setAdding(false);
    });
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <Chip active={active === "all"} onClick={() => onSelect("all")}>
        All
        <span className="ml-1.5 text-[10px] text-ink/50">{totalProducts}</span>
      </Chip>
      {chips.map((c) => {
        const isActive = active === c.slug;
        return (
          <span
            key={c.slug}
            className={`group inline-flex items-center overflow-hidden rounded-full border transition-colors ${
              isActive
                ? "border-ink bg-ink text-bone"
                : "border-ink/15 text-ink/80 hover:bg-ink/5"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(c.slug)}
              className="inline-flex items-center px-3 py-1.5 text-xs"
            >
              {c.label}
              <span className="ml-1.5 text-[10px] opacity-70">{c.count}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRequestDelete(c);
              }}
              aria-label={`Remove category ${c.label}`}
              title="Remove category"
              className={`grid h-6 w-6 place-items-center rounded-full opacity-0 transition-opacity hover:bg-rust/20 focus:opacity-100 focus:outline-none group-hover:opacity-100 ${
                isActive ? "mr-1 text-bone/80 hover:text-bone" : "mr-1 text-ink/50 hover:text-rust"
              }`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}

      {adding ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-ink/40 bg-bone py-0.5 pl-3 pr-0.5">
          <input
            autoFocus
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitNew();
              } else if (e.key === "Escape") {
                setAdding(false);
                setDraft("");
                setError(null);
              }
            }}
            placeholder="New category"
            className="w-32 bg-transparent text-xs focus:outline-none"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={submitNew}
            disabled={isPending}
            aria-label="Add"
            className="grid h-6 w-6 place-items-center rounded-full bg-ink text-bone disabled:opacity-60"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setDraft("");
              setError(null);
            }}
            aria-label="Cancel"
            className="grid h-6 w-6 place-items-center rounded-full text-ink/60 hover:bg-ink/5"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-ink/30 px-3 py-1.5 text-xs text-ink/70 transition-colors hover:border-ink hover:text-ink"
        >
          <Plus className="h-3 w-3" />
          New category
        </button>
      )}

      {error && (
        <span className="text-xs text-rust" role="alert">
          {error}
        </span>
      )}

      <span className="ml-auto text-xs text-muted">
        {visibleCount} of {totalProducts}
      </span>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs transition-colors ${
        active
          ? "border-ink bg-ink text-bone"
          : "border-ink/15 text-ink/80 hover:bg-ink/5"
      }`}
    >
      {children}
    </button>
  );
}
