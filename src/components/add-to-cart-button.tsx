"use client";

import { useState } from "react";
import { Product } from "@/lib/products";
import { useCart } from "@/store/cart";
import { Check, ShoppingBag } from "lucide-react";

export default function AddToCartButton({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        add(
          {
            slug: product.slug,
            name: product.name,
            price: product.price,
            material: product.material,
            image: product.images[0],
            gst_rate: product.gst_rate,
            tax_inclusive: product.tax_inclusive,
          },
          1
        );
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }}
      className="mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-6 py-4 text-sm text-bone transition-transform hover:-translate-y-0.5"
    >
      {added ? (
        <>
          <Check className="h-4 w-4" />
          Added to cart
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          Add to cart
        </>
      )}
    </button>
  );
}
