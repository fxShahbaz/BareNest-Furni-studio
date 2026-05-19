import { supabaseAdmin } from "@/lib/supabase/admin";
import ManualOrderForm, {
  type PickerProduct,
} from "@/components/admin/manual-order-form";

export default async function NewManualOrderPage() {
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("products")
    .select("slug,name,material,price")
    .order("name", { ascending: true });

  if (error) return <p className="text-sm text-rust">{error.message}</p>;
  const products = (data ?? []) as PickerProduct[];

  return <ManualOrderForm products={products} />;
}
