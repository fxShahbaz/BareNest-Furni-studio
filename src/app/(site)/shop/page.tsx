import type { Metadata } from "next";
import ProductCard from "@/components/product-card";
import { CATEGORIES } from "@/lib/products";
import { getAllProducts } from "@/lib/queries/products";
import Link from "next/link";
import CatalogueJsonLd from "@/components/seo/catalogue-json-ld";
import BreadcrumbsJsonLd from "@/components/seo/breadcrumbs-json-ld";

// Revalidate the rendered shop HTML every 60s. Admin mutations call
// revalidatePath("/shop") so changes go live immediately; this just
// caps how often anonymous traffic re-renders against Supabase.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse the bare nest catalogue: solid wood beds, wardrobes, dining tables, sofas, and more. Made in Patna. Delivered across India.",
  alternates: { canonical: "/shop" },
  keywords: [
    "buy furniture online India",
    "solid wood furniture",
    "MDF wardrobe",
    "sheesham bed",
    "dining table Patna",
    "sofa India",
    "furniture studio Patna",
  ],
  openGraph: {
    title: "Shop — bare nest",
    description:
      "Solid wood and MDF furniture, hand-made in Patna. The full catalogue.",
    url: "/shop",
    type: "website",
  },
};

type SP = Promise<{ cat?: string; material?: string }>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const { cat, material } = await searchParams;
  const all = await getAllProducts();
  const filtered = all.filter((p) => {
    if (cat && p.category !== cat) return false;
    if (material && p.material !== material) return false;
    return true;
  });

  const canonicalPath = cat
    ? `/shop?cat=${cat}`
    : material
    ? `/shop?material=${encodeURIComponent(material)}`
    : "/shop";
  const collectionName = cat
    ? `Shop · ${CATEGORIES.find((c) => c.id === cat)?.label ?? cat}`
    : material
    ? `Shop · ${material}`
    : "Shop";

  return (
    <div className="pt-32 pb-24">
      <CatalogueJsonLd
        products={filtered}
        url={canonicalPath}
        name={collectionName}
      />
      <BreadcrumbsJsonLd
        crumbs={[{ name: collectionName, path: canonicalPath }]}
      />
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <p className="eyebrow text-muted">Catalogue</p>
        <h1 className="mt-3 font-display text-5xl tracking-tight md:text-7xl">
          The <span className="serif-italic">shortlist.</span>
        </h1>
        <p className="mt-5 max-w-xl text-sm text-muted md:text-base">
          Every piece is built in either solid wood or dense MDF. We've never
          stocked particle board and never will.
        </p>

        {/* Filters */}
        <div className="mt-12 flex flex-wrap items-center gap-2">
          <FilterChip href="/shop" label="All" active={!cat && !material} />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              href={`/shop?cat=${c.id}`}
              label={c.label}
              active={cat === c.id}
            />
          ))}
          <span className="mx-2 h-5 w-px bg-ink/15" />
          <FilterChip
            href="/shop?material=Solid+Wood"
            label="Solid Wood"
            active={material === "Solid Wood"}
          />
          <FilterChip
            href="/shop?material=MDF"
            label="MDF"
            active={material === "MDF"}
          />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center text-sm text-muted">
            Nothing matches that filter yet — more pieces land before the
            inauguration.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        "rounded-full border px-4 py-2 text-xs transition-colors " +
        (active
          ? "border-ink bg-ink text-bone"
          : "border-ink/15 bg-transparent text-ink hover:bg-ink/5")
      }
    >
      {label}
    </Link>
  );
}
