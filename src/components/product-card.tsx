"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Product } from "@/lib/products";
import { formatINR, formatTaxLabel } from "@/lib/utils";
import ProductImage from "@/components/product-image";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-bone/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]">
          {product.material}
        </span>
        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-bone/90 text-ink opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl leading-tight">{product.name}</h3>
        <div className="shrink-0 text-right">
          <span className="block text-sm text-muted">
            {formatINR(product.price)}
          </span>
          <span className="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-muted/70">
            {formatTaxLabel(product.gst_rate, product.tax_inclusive)}
          </span>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted">{product.tagline}</p>
    </Link>
  );
}
