import { supabaseAdmin } from "@/lib/supabase/admin";
import CustomersManager, {
  type CustomerRow,
  type CustomerOrderSummary,
} from "@/components/admin/customers-manager";

type CustomerDbRow = {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  first_seen_at: string;
  last_seen_at: string;
};

type OrderDbRow = {
  id: string;
  customer_phone: string;
  status: string;
  total: number;
  created_at: string;
  items: Array<unknown>;
};

export default async function AdminCustomersPage() {
  const admin = supabaseAdmin();

  const [{ data: customerData, error: customersError }, { data: orderData, error: ordersError }] =
    await Promise.all([
      admin
        .from("customers")
        .select(
          "id,phone,name,email,address,city,pincode,first_seen_at,last_seen_at"
        )
        .order("last_seen_at", { ascending: false })
        .limit(500),
      admin
        .from("orders")
        .select("id,customer_phone,status,total,created_at,items")
        .order("created_at", { ascending: false })
        .limit(2000),
    ]);

  if (customersError) {
    return <p className="text-sm text-rust">{customersError.message}</p>;
  }
  if (ordersError) {
    return <p className="text-sm text-rust">{ordersError.message}</p>;
  }

  const customers = (customerData ?? []) as CustomerDbRow[];
  const orders = (orderData ?? []) as OrderDbRow[];

  // Group orders by phone so we can attach them to the matching customer
  // and derive lifetime stats. Orders may exist without a customer row
  // (orders placed before the customers table existed) — we surface
  // those too by synthesizing a row for each unique phone.
  const ordersByPhone = new Map<string, OrderDbRow[]>();
  for (const o of orders) {
    const list = ordersByPhone.get(o.customer_phone) ?? [];
    list.push(o);
    ordersByPhone.set(o.customer_phone, list);
  }

  const knownPhones = new Set(customers.map((c) => c.phone));

  // Synthesize customer rows for orphan orders (e.g. pre-customers-table).
  // These are still useful in the admin view so nothing is hidden.
  const orphanRows: CustomerDbRow[] = [];
  for (const [phone, list] of ordersByPhone) {
    if (knownPhones.has(phone)) continue;
    const newest = list[0];
    const oldest = list[list.length - 1];
    // Pull a name from the most recent order if available — we re-query
    // a slim slice rather than enlarging the main query.
    orphanRows.push({
      id: `orphan-${phone}`,
      phone,
      name: "Unknown",
      email: null,
      address: null,
      city: null,
      pincode: null,
      first_seen_at: oldest.created_at,
      last_seen_at: newest.created_at,
    });
  }

  // Fetch names/addresses for orphans in one shot.
  if (orphanRows.length > 0) {
    const orphanPhones = orphanRows.map((o) => o.phone);
    const { data: orphanOrderDetails } = await admin
      .from("orders")
      .select(
        "customer_phone,customer_name,customer_email,customer_address,customer_city,customer_pincode,created_at"
      )
      .in("customer_phone", orphanPhones)
      .order("created_at", { ascending: false });

    if (orphanOrderDetails) {
      const latestByPhone = new Map<
        string,
        {
          name: string;
          email: string | null;
          address: string | null;
          city: string | null;
          pincode: string | null;
        }
      >();
      for (const row of orphanOrderDetails as Array<{
        customer_phone: string;
        customer_name: string;
        customer_email: string | null;
        customer_address: string | null;
        customer_city: string | null;
        customer_pincode: string | null;
      }>) {
        if (latestByPhone.has(row.customer_phone)) continue;
        latestByPhone.set(row.customer_phone, {
          name: row.customer_name,
          email: row.customer_email,
          address: row.customer_address,
          city: row.customer_city,
          pincode: row.customer_pincode,
        });
      }
      for (const o of orphanRows) {
        const fill = latestByPhone.get(o.phone);
        if (fill) {
          o.name = fill.name;
          o.email = fill.email;
          o.address = fill.address;
          o.city = fill.city;
          o.pincode = fill.pincode;
        }
      }
    }
  }

  const merged: CustomerDbRow[] = [...customers, ...orphanRows];

  const rows: CustomerRow[] = merged.map((c) => {
    const list = ordersByPhone.get(c.phone) ?? [];
    const orderSummaries: CustomerOrderSummary[] = list.map((o) => ({
      id: o.id,
      status: o.status,
      total: o.total,
      created_at: o.created_at,
      items_count: Array.isArray(o.items) ? o.items.length : 0,
    }));

    // Lifetime value excludes cancelled orders.
    const lifetimeValue = list.reduce(
      (sum, o) => sum + (o.status === "cancelled" ? 0 : o.total),
      0
    );

    return {
      id: c.id,
      phone: c.phone,
      name: c.name,
      email: c.email,
      address: c.address,
      city: c.city,
      pincode: c.pincode,
      first_seen_at: c.first_seen_at,
      last_seen_at: c.last_seen_at,
      orders_count: list.length,
      lifetime_value: lifetimeValue,
      last_order_status: list[0]?.status ?? null,
      orders: orderSummaries,
    };
  });

  return <CustomersManager customers={rows} />;
}
