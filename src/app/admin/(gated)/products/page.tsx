import { supabaseAdmin } from "@/lib/supabase/admin";
import ProductsManager, {
  type ProductRow,
} from "@/components/admin/products-manager";
import { getAllCategories } from "@/lib/queries/categories";

export default async function AdminProductsPage() {
  const admin = supabaseAdmin();
  const [{ data, error }, categories] = await Promise.all([
    admin
      .from("products")
      .select(
        "slug,name,material,category,price,gst_rate,tax_inclusive,images,created_at"
      )
      .order("created_at", { ascending: true }),
    getAllCategories(),
  ]);

  if (error) return <p className="text-sm text-rust">{error.message}</p>;
  const products = (data ?? []) as ProductRow[];

  return <ProductsManager products={products} categories={categories} />;
}
