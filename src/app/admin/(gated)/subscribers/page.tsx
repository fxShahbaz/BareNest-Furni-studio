import { supabaseAdmin } from "@/lib/supabase/admin";
import SubscribersManager, {
  type SubscriberRow,
} from "@/components/admin/subscribers-manager";

export default async function AdminSubscribersPage() {
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("subscribers")
    .select("email,created_at")
    .order("created_at", { ascending: false });

  if (error) return <p className="text-sm text-rust">{error.message}</p>;
  const subscribers = (data ?? []) as SubscriberRow[];

  return <SubscribersManager subscribers={subscribers} />;
}
