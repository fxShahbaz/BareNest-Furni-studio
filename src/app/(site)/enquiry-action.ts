"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SHOWROOM, formatINR } from "@/lib/utils";

export type EnquiryState =
  | {
      error?: string;
      ok?: boolean;
      whatsappUrl?: string;
    }
  | undefined;

const PHONE_RE = /^(?:\+?91[\s-]?|0)?[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LEN = 600;

export async function createEnquiry(
  _prev: EnquiryState,
  formData: FormData
): Promise<EnquiryState> {
  const productSlug = String(formData.get("product_slug") ?? "").trim();
  const qtyRaw = Number(formData.get("qty") ?? 1);
  const name = String(formData.get("customer_name") ?? "").trim();
  const phoneRaw = String(formData.get("customer_phone") ?? "").trim();
  const emailRaw = String(formData.get("customer_email") ?? "")
    .trim()
    .toLowerCase();
  const message = String(formData.get("message") ?? "")
    .trim()
    .slice(0, MAX_MESSAGE_LEN);

  if (!productSlug) return { error: "Missing product reference." };
  if (!name || name.length < 2) return { error: "Please enter your name." };
  if (!PHONE_RE.test(phoneRaw.replace(/[\s-]/g, ""))) {
    return { error: "Enter a valid 10-digit Indian mobile number." };
  }
  if (emailRaw && !EMAIL_RE.test(emailRaw)) {
    return { error: "That email looks off. Leave it blank to skip." };
  }
  const qty = Number.isInteger(qtyRaw) ? Math.min(99, Math.max(1, qtyRaw)) : 1;

  // Re-fetch product snapshot from the catalogue so a tampered client can't
  // forge a price for the admin to react to.
  const admin = supabaseAdmin();
  const { data: product, error: productErr } = await admin
    .from("products")
    .select("slug,name,material,price")
    .eq("slug", productSlug)
    .maybeSingle();
  if (productErr) return { error: productErr.message };
  if (!product) return { error: "That product is no longer in the catalogue." };

  const { error: insertErr } = await admin.from("enquiries").insert({
    product_slug: product.slug,
    product_name: product.name,
    product_material: product.material,
    product_price: product.price,
    qty,
    customer_name: name,
    customer_phone: phoneRaw.replace(/[\s-]/g, ""),
    customer_email: emailRaw || null,
    message: message || null,
  });
  if (insertErr) return { error: insertErr.message };

  revalidatePath("/admin/enquiries");

  // Build a WhatsApp deep-link so the customer can fast-follow the studio.
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_E164 ?? SHOWROOM.whatsappE164;
  const lines = [
    `Hi bare nest, I'd like to enquire about:`,
    `*${product.name}* (${product.material}) × ${qty}`,
    `Estimated: ${formatINR(product.price * qty)}`,
    "",
    message ? message : null,
  ].filter(Boolean);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    lines.join("\n")
  )}`;

  return { ok: true, whatsappUrl };
}
