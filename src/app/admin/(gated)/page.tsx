import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminDashboard() {
  const admin = supabaseAdmin();
  const [ordersRes, productsRes, subscribersRes] = await Promise.all([
    admin.from("orders").select("id", { count: "exact", head: true }),
    admin.from("products").select("slug", { count: "exact", head: true }),
    admin.from("subscribers").select("email", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Orders", value: ordersRes.count ?? 0, href: "/admin/orders" },
    { label: "Products", value: productsRes.count ?? 0, href: "/admin/products" },
    { label: "Subscribers", value: subscribersRes.count ?? 0, href: "/admin" },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {stats.map((s) => (
        <Link
          key={s.label}
          href={s.href}
          className="rounded-3xl border border-ink/10 bg-cream/40 p-6 hover:bg-cream/70"
        >
          <p className="eyebrow text-muted">{s.label}</p>
          <p className="mt-3 font-display text-5xl">{s.value}</p>
        </Link>
      ))}
    </div>
  );
}
