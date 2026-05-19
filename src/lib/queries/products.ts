import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import type { Product } from "@/lib/products";
import { memo } from "@/lib/cache/memo";

// The DB is the source of truth. Deleted products must never reappear via a
// runtime fallback, so we never read from the TS catalogue here.

type Row = {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category: string;
  material: "Solid Wood" | "MDF";
  price: number;
  gst_rate: number | null;
  tax_inclusive: boolean | null;
  hsn_code: string | null;
  dimensions: string | null;
  features: string[] | null;
  images: string[] | null;
};

const SELECT_COLS =
  "slug,name,tagline,description,category,material,price,gst_rate,tax_inclusive,hsn_code,dimensions,features,images";

function fromRow(r: Row): Product {
  return {
    slug: r.slug,
    name: r.name,
    tagline: r.tagline ?? "",
    description: r.description ?? "",
    category: r.category as Product["category"],
    material: r.material,
    price: r.price,
    gst_rate: r.gst_rate ?? 18,
    tax_inclusive: r.tax_inclusive ?? true,
    hsn_code: r.hsn_code ?? "",
    dimensions: r.dimensions ?? "",
    features: r.features ?? [],
    images: r.images ?? [],
  };
}

export async function getAllProducts(): Promise<Product[]> {
  return memo(
    "products:all",
    async () => {
      const supabase = await supabaseServer();
      if (!supabase) return [];

      const { data, error } = await supabase
        .from("products")
        .select(SELECT_COLS)
        .order("created_at", { ascending: true });

      if (error || !data) return [];
      return (data as Row[]).map(fromRow);
    },
    { ttl: 60_000 }
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return memo(
    `products:slug:${slug}`,
    async () => {
      const supabase = await supabaseServer();
      if (!supabase) return null;

      const { data, error } = await supabase
        .from("products")
        .select(SELECT_COLS)
        .eq("slug", slug)
        .maybeSingle();

      if (error || !data) return null;
      return fromRow(data as Row);
    },
    { ttl: 60_000 }
  );
}

export async function getFeaturedProducts(n: number): Promise<Product[]> {
  const all = await getAllProducts();
  return all.slice(0, n);
}

export async function getRelatedProducts(
  category: string,
  excludeSlug: string,
  limit = 3
): Promise<Product[]> {
  const all = await getAllProducts();
  return all
    .filter((p) => p.category === category && p.slug !== excludeSlug)
    .slice(0, limit);
}
