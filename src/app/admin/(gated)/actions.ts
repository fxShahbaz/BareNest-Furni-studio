"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isCurrentUserOwner } from "@/lib/queries/admin";
import { optimizeImage } from "@/lib/image-optimize";

async function requireOwner() {
  const ok = await isCurrentUserOwner();
  if (!ok) throw new Error("Not authorised.");
}

export async function updateOrderStatus(formData: FormData) {
  await requireOwner();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["new", "confirmed", "fulfilled", "cancelled"].includes(status)) {
    throw new Error("Invalid status.");
  }
  const admin = supabaseAdmin();
  const { error } = await admin
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  // A confirmed/fulfilled order should appear in the invoices
  // "Awaiting generation" list immediately.
  revalidatePath("/admin/invoices");
}

export type ProductFormState = { error?: string } | undefined;

function readProductForm(formData: FormData) {
  const features = String(formData.get("features") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const images = String(formData.get("images") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  // GST: clamp 0–50 to match the DB constraint; fall back to 18 on bad input.
  const rawGst = Number(formData.get("gst_rate"));
  const gst_rate =
    Number.isFinite(rawGst) && rawGst >= 0 && rawGst <= 50 ? rawGst : 18;

  // Tax: select returns "true"/"false"; default to inclusive.
  const tax_inclusive = String(formData.get("tax_inclusive") ?? "true") !== "false";

  return {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    material: String(formData.get("material") ?? "").trim(),
    price: Number(formData.get("price") ?? 0),
    gst_rate,
    tax_inclusive,
    hsn_code: String(formData.get("hsn_code") ?? "").trim() || null,
    dimensions: String(formData.get("dimensions") ?? "").trim(),
    features,
    images,
  };
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  try {
    await requireOwner();
    const row = readProductForm(formData);
    if (!row.slug || !row.name || !row.material || !row.category) {
      return { error: "Slug, name, category, and material are required." };
    }
    const admin = supabaseAdmin();
    const { error } = await admin.from("products").insert(row);
    if (error) return { error: error.message };
    revalidatePath("/admin/products");
    revalidatePath("/shop");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error." };
  }
  redirect("/admin/products");
}

export async function updateProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  try {
    await requireOwner();
    const row = readProductForm(formData);
    if (!row.slug) return { error: "Missing slug." };
    const admin = supabaseAdmin();
    const { error } = await admin
      .from("products")
      .update({
        name: row.name,
        tagline: row.tagline,
        description: row.description,
        category: row.category,
        material: row.material,
        price: row.price,
        gst_rate: row.gst_rate,
        tax_inclusive: row.tax_inclusive,
        hsn_code: row.hsn_code,
        dimensions: row.dimensions,
        features: row.features,
        images: row.images,
      })
      .eq("slug", row.slug);
    if (error) return { error: error.message };
    revalidatePath("/admin/products");
    revalidatePath(`/shop/${row.slug}`);
    revalidatePath("/shop");
    return undefined;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error." };
  }
}

export async function deleteProduct(formData: FormData) {
  await requireOwner();
  const slug = String(formData.get("slug"));
  const admin = supabaseAdmin();
  const { error } = await admin.from("products").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function duplicateProduct(formData: FormData) {
  await requireOwner();
  const slug = String(formData.get("slug"));
  if (!slug) throw new Error("Missing slug.");

  const admin = supabaseAdmin();
  const { data: src, error: readErr } = await admin
    .from("products")
    .select(
      "name,tagline,description,category,material,price,gst_rate,tax_inclusive,hsn_code,dimensions,features,images"
    )
    .eq("slug", slug)
    .single();
  if (readErr || !src) throw new Error(readErr?.message ?? "Product not found.");

  let newSlug = `${slug}-copy`;
  let n = 2;
  // Suffix until we find a free slug. Tiny table, so this is fine.
  while (true) {
    const { data: hit } = await admin
      .from("products")
      .select("slug")
      .eq("slug", newSlug)
      .maybeSingle();
    if (!hit) break;
    newSlug = `${slug}-copy-${n++}`;
  }

  const { error: insertErr } = await admin
    .from("products")
    .insert({ ...src, slug: newSlug, name: `${src.name} (Copy)` });
  if (insertErr) throw new Error(insertErr.message);

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect(`/admin/products/${newSlug}`);
}

export type CategoryFormState = { error?: string } | undefined;

function slugifyCategory(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/**
 * Assigns the next sequential invoice number to an order, but only if one
 * isn't already set (re-clicking the Generate button is a no-op). Returns
 * the resulting invoice number so the UI can navigate / display.
 */
export async function generateInvoice(formData: FormData): Promise<void> {
  await requireOwner();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Missing order id.");

  const admin = supabaseAdmin();

  const { data: order, error: readErr } = await admin
    .from("orders")
    .select("id,invoice_number")
    .eq("id", id)
    .maybeSingle();
  if (readErr || !order) throw new Error(readErr?.message ?? "Order not found.");

  // Already issued — nothing to do; the page will re-render with the same number.
  if (order.invoice_number) return;

  // Pull a fresh number from the sequence-backed function in Postgres.
  const { data: next, error: rpcErr } = await admin.rpc("next_invoice_number");
  if (rpcErr || typeof next !== "string") {
    throw new Error(rpcErr?.message ?? "Could not allocate invoice number.");
  }

  const { error: updErr } = await admin
    .from("orders")
    .update({
      invoice_number: next,
      invoice_generated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (updErr) throw new Error(updErr.message);

  revalidatePath("/admin/orders");
  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${id}`);
}

export async function deleteCategory(formData: FormData) {
  await requireOwner();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) throw new Error("Missing slug.");
  const admin = supabaseAdmin();
  // Note: products keep their category text — deleting the registry entry
  // only removes the chip from the picker. Any products still tagged with
  // this slug will surface as an unlisted chip until reassigned.
  const { error } = await admin.from("categories").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");
}

export async function createCategory(
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  try {
    await requireOwner();
    const label = String(formData.get("label") ?? "").trim();
    if (label.length < 2) {
      return { error: "Category name is too short." };
    }
    const slug = slugifyCategory(label);
    if (!slug) return { error: "Category name must contain letters or digits." };

    const admin = supabaseAdmin();
    const { error } = await admin
      .from("categories")
      .upsert({ slug, label }, { onConflict: "slug", ignoreDuplicates: true });
    if (error) return { error: error.message };
    revalidatePath("/admin/products");
    revalidatePath("/admin/products/new");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error." };
  }
  return undefined;
}

export type ManualOrderState = { error?: string } | undefined;

type ManualOrderItem = {
  slug: string;
  name: string;
  material: string;
  price: number;
  qty: number;
};

function isManualItem(x: unknown): x is ManualOrderItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.slug === "string" &&
    typeof o.name === "string" &&
    typeof o.material === "string" &&
    typeof o.price === "number" &&
    typeof o.qty === "number" &&
    Number.isInteger(o.qty) &&
    o.qty > 0 &&
    o.qty <= 99
  );
}

export async function createManualOrder(
  _prev: ManualOrderState,
  formData: FormData
): Promise<ManualOrderState> {
  try {
    await requireOwner();

    const name = String(formData.get("customer_name") ?? "").trim();
    const phone = String(formData.get("customer_phone") ?? "").trim();
    const email =
      String(formData.get("customer_email") ?? "").trim() || null;
    const address = String(formData.get("customer_address") ?? "").trim();
    const city = String(formData.get("customer_city") ?? "").trim();
    const pincode = String(formData.get("customer_pincode") ?? "").trim();
    const gstinRaw = String(formData.get("customer_gstin") ?? "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
    const notes = String(formData.get("notes") ?? "").trim() || null;

    if (!name || !phone || !address || !city || !pincode) {
      return {
        error: "Customer name, phone, address, city, and pincode are required.",
      };
    }
    if (
      gstinRaw &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/.test(gstinRaw)
    ) {
      return {
        error:
          "GSTIN looks invalid. Format should be 15 characters, e.g. 10ABCDE1234F1Z5. Leave blank to skip.",
      };
    }
    const customer_gstin = gstinRaw || null;

    let items: ManualOrderItem[];
    try {
      const parsed = JSON.parse(String(formData.get("items") ?? "[]"));
      if (!Array.isArray(parsed) || !parsed.every(isManualItem)) {
        return { error: "Items payload is invalid." };
      }
      items = parsed;
    } catch {
      return { error: "Items payload could not be parsed." };
    }

    if (items.length === 0) {
      return { error: "Add at least one item to the order." };
    }

    // Re-verify prices against the catalogue so a tampered client can't
    // discount items. The form posts a price snapshot — we trust the server.
    const admin = supabaseAdmin();
    const slugs = items.map((i) => i.slug);
    const { data: catalog, error: catalogErr } = await admin
      .from("products")
      .select("slug,name,material,price,gst_rate,tax_inclusive,hsn_code")
      .in("slug", slugs);
    if (catalogErr) return { error: catalogErr.message };

    type CatalogRow = {
      slug: string;
      name: string;
      material: string;
      price: number;
      gst_rate: number | null;
      tax_inclusive: boolean | null;
      hsn_code: string | null;
    };
    const bySlug = new Map(
      (catalog ?? []).map((p) => [p.slug as string, p as CatalogRow])
    );
    if (bySlug.size !== items.length) {
      return { error: "One or more items are no longer in the catalogue." };
    }

    // Snapshot tax fields onto each line so a later product edit can't
    // mutate the invoice this order eventually prints.
    const verifiedItems = items.map((i) => {
      const p = bySlug.get(i.slug)!;
      return {
        slug: p.slug,
        name: p.name,
        material: p.material,
        price: p.price,
        qty: i.qty,
        gst_rate: p.gst_rate ?? 18,
        tax_inclusive: p.tax_inclusive ?? true,
        hsn_code: p.hsn_code ?? null,
      };
    });
    const total = verifiedItems.reduce((acc, i) => acc + i.price * i.qty, 0);
    const customerAddress = `${address}, ${city} - ${pincode}`;

    const { error: insertErr } = await admin.from("orders").insert({
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      customer_address: customerAddress,
      customer_city: city,
      customer_pincode: pincode,
      customer_gstin,
      notes,
      items: verifiedItems,
      total,
      status: "confirmed",
      source: "manual",
    });
    if (insertErr) return { error: insertErr.message };

    revalidatePath("/admin/orders");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error." };
  }
  redirect("/admin/orders");
}

export async function deleteSubscriber(formData: FormData) {
  await requireOwner();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) throw new Error("Missing email.");
  const admin = supabaseAdmin();
  const { error } = await admin.from("subscribers").delete().eq("email", email);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/subscribers");
  revalidatePath("/admin");
}

const ENQUIRY_STATUSES = [
  "new",
  "contacted",
  "converted",
  "closed",
  "cancelled",
] as const;

export async function updateEnquiryStatus(formData: FormData) {
  await requireOwner();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!id) throw new Error("Missing enquiry id.");
  if (!ENQUIRY_STATUSES.includes(status as (typeof ENQUIRY_STATUSES)[number])) {
    throw new Error("Invalid status.");
  }

  const admin = supabaseAdmin();
  const { error } = await admin
    .from("enquiries")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/enquiries");
}

export async function convertEnquiryToOrder(formData: FormData) {
  await requireOwner();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Missing enquiry id.");

  const admin = supabaseAdmin();
  const { data: enquiry, error: readErr } = await admin
    .from("enquiries")
    .select(
      "id,product_slug,product_name,product_material,product_price,qty,customer_name,customer_phone,customer_email,message,status,converted_order_id"
    )
    .eq("id", id)
    .maybeSingle();
  if (readErr || !enquiry) {
    throw new Error(readErr?.message ?? "Enquiry not found.");
  }
  if (enquiry.converted_order_id) {
    // Already converted — just bounce to the existing order.
    redirect(`/admin/orders`);
  }

  // Re-verify the product still exists + use current price.
  const { data: product, error: productErr } = await admin
    .from("products")
    .select("slug,name,material,price")
    .eq("slug", enquiry.product_slug)
    .maybeSingle();
  if (productErr) throw new Error(productErr.message);
  if (!product) {
    throw new Error(
      "Product is no longer in the catalogue. Restore it or update the enquiry manually."
    );
  }

  const item = {
    slug: product.slug,
    name: product.name,
    material: product.material,
    price: product.price,
    qty: enquiry.qty as number,
  };
  const total = item.price * item.qty;

  const orderId = crypto.randomUUID();
  const { error: insertErr } = await admin.from("orders").insert({
    id: orderId,
    customer_name: enquiry.customer_name,
    customer_phone: enquiry.customer_phone,
    customer_email: enquiry.customer_email,
    customer_address: "—",
    notes: enquiry.message
      ? `Converted from enquiry. Notes: ${enquiry.message}`
      : "Converted from enquiry.",
    items: [item],
    total,
    status: "confirmed",
    source: "manual",
  });
  if (insertErr) throw new Error(insertErr.message);

  const { error: updateErr } = await admin
    .from("enquiries")
    .update({ status: "converted", converted_order_id: orderId })
    .eq("id", id);
  if (updateErr) throw new Error(updateErr.message);

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

export async function deleteEnquiry(formData: FormData) {
  await requireOwner();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Missing enquiry id.");
  const admin = supabaseAdmin();
  const { error } = await admin.from("enquiries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/enquiries");
}

export async function updateSettings(formData: FormData) {
  await requireOwner();
  // Checkboxes only POST when checked. Cast on presence, not value, so the
  // missing-key case (unchecked) flips the flag off rather than no-oping.
  const onlineOrderingEnabled =
    formData.get("online_ordering_enabled") !== null;

  const admin = supabaseAdmin();
  const { error } = await admin
    .from("settings")
    .update({
      online_ordering_enabled: onlineOrderingEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);

  // Refresh anywhere that branches on this flag.
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

export async function uploadProductImage(formData: FormData) {
  await requireOwner();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file.");
  }

  // Optimize before write. Product photos are rendered at large sizes
  // (hero, gallery), so we allow a generous max dimension. WebP gives
  // ~30–50% smaller files than JPEG at the same quality.
  const optimized = await optimizeImage(file, {
    maxDimension: 2400,
    quality: 84,
    format: "webp",
  });
  const baseName = file.name
    .replace(/\.[a-zA-Z0-9]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}_${baseName}${optimized.extension}`;

  const admin = supabaseAdmin();
  const { error } = await admin.storage
    .from("product-images")
    .upload(path, optimized.buffer, {
      contentType: optimized.contentType,
      upsert: false,
    });
  if (error) throw new Error(error.message);

  const { data: pub } = admin.storage.from("product-images").getPublicUrl(path);
  return { url: pub.publicUrl };
}
