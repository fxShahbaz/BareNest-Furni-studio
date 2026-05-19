import { supabaseAdmin } from "@/lib/supabase/admin";
import EnquiriesManager, {
  type EnquiryRow,
} from "@/components/admin/enquiries-manager";

export default async function AdminEnquiriesPage() {
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("enquiries")
    .select(
      "id,product_slug,product_name,product_material,product_price,qty,customer_name,customer_phone,customer_email,message,status,converted_order_id,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return <p className="text-sm text-rust">{error.message}</p>;
  const enquiries = (data ?? []) as EnquiryRow[];

  return <EnquiriesManager enquiries={enquiries} />;
}
