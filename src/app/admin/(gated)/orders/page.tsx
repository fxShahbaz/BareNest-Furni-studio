import { supabaseAdmin } from "@/lib/supabase/admin";
import OrdersManager, {
  type OrderRow,
  type OrderItem,
} from "@/components/admin/orders-manager";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

type Row = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  customer_gstin: string | null;
  notes: string | null;
  items: OrderItem[];
  total: number;
  status: string;
  source: string;
  attachments: string[] | null;
  invoice_number: string | null;
  created_at: string;
};

export default async function AdminOrdersPage() {
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("orders")
    .select(
      "id,customer_name,customer_phone,customer_email,customer_address,customer_gstin,notes,items,total,status,source,attachments,invoice_number,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return <p className="text-sm text-rust">{error.message}</p>;

  const rows = (data ?? []) as Row[];

  // Resolve signed URLs for every order's attachments up-front.
  const orders: OrderRow[] = await Promise.all(
    rows.map(async (r) => {
      const paths = r.attachments ?? [];
      if (paths.length === 0) return { ...r, attachment_urls: [] };
      const { data: signed } = await admin.storage
        .from("order-attachments")
        .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
      const attachment_urls = (signed ?? [])
        .map((s) => s.signedUrl)
        .filter((u): u is string => typeof u === "string");
      return { ...r, attachment_urls };
    })
  );

  return <OrdersManager orders={orders} />;
}
