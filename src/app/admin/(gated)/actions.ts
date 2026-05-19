"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isCurrentUserOwner } from "@/lib/queries/admin";

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
    const notes = String(formData.get("notes") ?? "").trim() || null;

    if (!name || !phone || !address || !city || !pincode) {
      return {
        error: "Customer name, phone, address, city, and pincode are required.",
      };
    }

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
      .select("slug,name,material,price")
      .in("slug", slugs);
    if (catalogErr) return { error: catalogErr.message };

    const bySlug = new Map(
      (catalog ?? []).map((p) => [
        p.slug as string,
        p as { slug: string; name: string; material: string; price: number },
      ])
    );
    if (bySlug.size !== items.length) {
      return { error: "One or more items are no longer in the catalogue." };
    }

    const verifiedItems = items.map((i) => {
      const p = bySlug.get(i.slug)!;
      return {
        slug: p.slug,
        name: p.name,
        material: p.material,
        price: p.price,
        qty: i.qty,
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

export async function uploadProductImage(formData: FormData) {
  await requireOwner();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file.");
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}_${safeName}`;
  const admin = supabaseAdmin();
  const { error } = await admin.storage
    .from("product-images")
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (error) throw new Error(error.message);

  const { data: pub } = admin.storage.from("product-images").getPublicUrl(path);
  return { url: pub.publicUrl };
}
