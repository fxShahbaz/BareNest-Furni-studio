import { notFound } from "next/navigation";
import Image from "next/image";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/queries/products";
import { formatINR, formatTaxLabel } from "@/lib/utils";
import AddToCartButton from "@/components/add-to-cart-button";
import EnquiryButton from "@/components/enquiry-button";
import ProductImage from "@/components/product-image";
import { getSettings } from "@/lib/queries/settings";
import Link from "next/link";
import ProductJsonLd from "@/components/seo/product-json-ld";
import BreadcrumbsJsonLd from "@/components/seo/breadcrumbs-json-ld";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Not found" };
  const description =
    p.description || `${p.name} — ${p.material} furniture by BareNest, made in Patna.`;
  return {
    title: p.name,
    description,
    alternates: { canonical: `/shop/${p.slug}` },
    keywords: [
      p.name,
      p.material,
      p.category,
      "furniture Patna",
      "buy furniture India",
      "BareNest",
    ],
    openGraph: {
      title: p.name,
      description,
      url: `/shop/${p.slug}`,
      type: "website",
      images: p.images.slice(0, 1).map((img) => ({
        url: img,
        width: 1200,
        height: 1200,
        alt: p.name,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: p.name,
      description,
      images: p.images.slice(0, 1),
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const related = await getRelatedProducts(p.category, p.slug, 3);
  const { online_ordering_enabled } = await getSettings();

  return (
    <div className="pt-28 pb-24">
      <ProductJsonLd product={p} />
      <BreadcrumbsJsonLd
        crumbs={[
          { name: "Shop", path: "/shop" },
          { name: p.name, path: `/shop/${p.slug}` },
        ]}
      />
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Link
          href="/shop"
          className="text-xs uppercase tracking-[0.18em] text-muted hover:text-ink"
        >
          ← All catalogue
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-12">
          {/* Gallery */}
          <div className="md:col-span-7">
            <div className="relative aspect-[5/4] overflow-hidden rounded-3xl bg-cream">
              <ProductImage
                src={p.images[0]}
                alt={p.name}
                sizes="(min-width: 768px) 58vw, 100vw"
                className="object-cover"
                priority
                iconClassName="h-24 w-24"
              />
              <span className="absolute left-4 top-4 rounded-full bg-bone/90 px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
                {p.material}
              </span>
            </div>
            {p.images.length > 1 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {p.images.slice(1).map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream"
                  >
                    <Image
                      src={src}
                      alt={`${p.name} detail ${i + 2}`}
                      fill
                      sizes="20vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:col-span-5 md:pl-6">
            <p className="eyebrow text-muted">{p.category}</p>
            <h1 className="mt-3 font-display text-5xl leading-tight tracking-tight md:text-6xl">
              {p.name}
            </h1>
            <p className="mt-3 text-base text-muted md:text-lg">{p.tagline}</p>

            <div className="mt-8 flex items-end gap-4">
              <span className="font-display text-4xl">
                {formatINR(p.price)}
              </span>
              <span className="text-xs text-muted">
                {formatTaxLabel(p.gst_rate, p.tax_inclusive)}
              </span>
            </div>

            {online_ordering_enabled ? (
              <AddToCartButton product={p} />
            ) : (
              <EnquiryButton
                product={{
                  slug: p.slug,
                  name: p.name,
                  material: p.material,
                  price: p.price,
                  image: p.images[0],
                }}
              />
            )}

            <div className="mt-10 hairline" />

            <div className="mt-8 space-y-6 text-sm">
              <p className="text-ink/80">{p.description}</p>
              <div>
                <p className="eyebrow text-muted">Dimensions</p>
                <p className="mt-2">{p.dimensions}</p>
              </div>
              <div>
                <p className="eyebrow text-muted">Built in</p>
                <ul className="mt-2 space-y-1">
                  {p.features.map((f) => (
                    <li key={f} className="text-ink/80">
                      — {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-32">
            <h2 className="font-display text-3xl md:text-5xl">
              More from this room
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/shop/${r.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
                    <Image
                      src={r.images[0]}
                      alt={r.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <h3 className="font-display text-xl">{r.name}</h3>
                    <span className="text-sm text-muted">
                      {formatINR(r.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
