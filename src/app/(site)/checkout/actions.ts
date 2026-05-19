"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatINR, SHOWROOM } from "@/lib/utils";
import { optimizeImage } from "@/lib/image-optimize";

type Item = {
  slug: string;
  name: string;
  price: number;
  qty: number;
  material: string;
  /** Snapshotted at order time so a later product edit can't mutate this order's invoice. */
  gst_rate: number;
  tax_inclusive: boolean;
  hsn_code: string | null;
};

export type CheckoutState =
  | {
      error?: string;
      whatsappUrl?: string;
      orderId?: string;
      redirectTo?: string;
      skippedAttachments?: number;
    }
  | undefined;

const MAX_ATTACHMENTS = 6;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_NOTES_LEN = 600;

// Indian mobile: 10 digits starting 6-9, optional +91 / 91 / 0 prefix.
const PHONE_RE = /^(?:\+?91[\s-]?|0)?[6-9]\d{9}$/;
// Indian pincode: 6 digits, first digit 1-9.
const PINCODE_RE = /^[1-9]\d{5}$/;
// Indian GSTIN: 15 chars — 2-digit state code, PAN, entity digit, Z, checksum.
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;

function normalizePhone(raw: string) {
  // Strip whitespace + dashes, then drop any 91/+91/0 country prefix so
  // we always store and dedupe on the canonical 10-digit form.
  const cleaned = raw.replace(/[\s-]/g, "");
  return cleaned
    .replace(/^\+?91/, "")
    .replace(/^0+/, "");
}

function isItemShape(x: unknown): x is Item {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.slug === "string" &&
    typeof o.name === "string" &&
    typeof o.price === "number" &&
    typeof o.qty === "number" &&
    Number.isInteger(o.qty) &&
    o.qty > 0 &&
    o.qty <= 99 &&
    typeof o.material === "string"
  );
}

export async function submitOrder(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    const phoneRaw = String(formData.get("phone") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const pincode = String(formData.get("pincode") ?? "").trim();
    const notes = String(formData.get("notes") ?? "")
      .trim()
      .slice(0, MAX_NOTES_LEN);
    const gstinRaw = String(formData.get("gstin") ?? "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
    const itemsRaw = String(formData.get("items") ?? "[]");

    if (!name || name.length < 2) {
      return { error: "Please enter your full name." };
    }
    if (!PHONE_RE.test(phoneRaw.replace(/[\s-]/g, ""))) {
      return { error: "Enter a valid 10-digit Indian mobile number." };
    }
    const phone = normalizePhone(phoneRaw);
    if (!address || address.length < 6) {
      return { error: "Please enter your delivery address." };
    }
    if (!city) {
      return { error: "Please enter your city." };
    }
    if (!PINCODE_RE.test(pincode)) {
      return { error: "Pincode must be 6 digits." };
    }
    if (gstinRaw && !GSTIN_RE.test(gstinRaw)) {
      return {
        error:
          "GSTIN looks invalid. Format should be 15 characters, e.g. 10ABCDE1234F1Z5. Leave blank to skip.",
      };
    }
    const gstin = gstinRaw || null;

    // -- Parse cart. Never trust totals or prices from the client.
    let rawItems: unknown;
    try {
      rawItems = JSON.parse(itemsRaw);
    } catch {
      return { error: "Cart was malformed." };
    }
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return { error: "Your cart is empty." };
    }
    const clientItems = rawItems.filter(isItemShape);
    if (clientItems.length === 0) {
      return { error: "Cart items look malformed." };
    }

    // -- Refetch authoritative prices + tax fields from products by slug.
    // We snapshot tax fields onto the order so a later product edit
    // (rate change, HSN correction, etc.) doesn't mutate this order's
    // invoice on reprint.
    const admin = supabaseAdmin();
    const slugs = Array.from(new Set(clientItems.map((i) => i.slug)));
    const { data: priceRows, error: priceError } = await admin
      .from("products")
      .select("slug,name,price,material,gst_rate,tax_inclusive,hsn_code")
      .in("slug", slugs);

    if (priceError) {
      return { error: `Could not verify prices: ${priceError.message}` };
    }

    const priceMap = new Map(
      (priceRows ?? []).map((r) => [
        r.slug as string,
        {
          name: r.name as string,
          price: r.price as number,
          material: r.material as string,
          gst_rate: (r.gst_rate as number | null) ?? 18,
          tax_inclusive: (r.tax_inclusive as boolean | null) ?? true,
          hsn_code: (r.hsn_code as string | null) ?? null,
        },
      ])
    );

    const items: Item[] = [];
    for (const ci of clientItems) {
      const truth = priceMap.get(ci.slug);
      if (!truth) {
        return {
          error: `"${ci.name}" is no longer available. Please refresh your cart.`,
        };
      }
      items.push({
        slug: ci.slug,
        name: truth.name,
        price: truth.price,
        qty: ci.qty,
        material: truth.material,
        gst_rate: truth.gst_rate,
        tax_inclusive: truth.tax_inclusive,
        hsn_code: truth.hsn_code,
      });
    }
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    if (total <= 0) {
      return { error: "Cart total looks wrong." };
    }

    const orderId = crypto.randomUUID();
    const customerAddress = `${address}, ${city} - ${pincode}`;

    // -- Upload attachments. Skipped files are reported back.
    const incomingFiles = formData
      .getAll("attachments")
      .filter((f): f is File => f instanceof File && f.size > 0);

    let skippedAttachments = Math.max(
      0,
      incomingFiles.length - MAX_ATTACHMENTS
    );
    const files = incomingFiles.slice(0, MAX_ATTACHMENTS);
    const uploadedPaths: string[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        skippedAttachments += 1;
        continue;
      }

      // Server-side optimization: resize + strip EXIF + re-encode to
      // WebP. The buffer + content type + extension all come from the
      // optimizer so the file we write to Supabase reflects the final
      // bytes, not the upload.
      const optimized = await optimizeImage(file, {
        maxDimension: 2000,
        quality: 80,
        format: "webp",
      });
      const baseName = file.name
        .replace(/\.[a-zA-Z0-9]+$/, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${orderId}/${Date.now()}_${baseName}${optimized.extension}`;
      const { error: uploadError } = await admin.storage
        .from("order-attachments")
        .upload(path, optimized.buffer, {
          contentType: optimized.contentType,
          upsert: false,
        });
      if (uploadError) {
        skippedAttachments += 1;
      } else {
        uploadedPaths.push(path);
      }
    }

    // -- Link order to user if they're signed in.
    const userClient = await supabaseServer();
    const { data: userData } = userClient
      ? await userClient.auth.getUser()
      : { data: { user: null } };

    const { error: insertError } = await admin.from("orders").insert({
      id: orderId,
      customer_name: name,
      customer_phone: phone,
      customer_email: userData.user?.email ?? null,
      customer_address: customerAddress,
      customer_city: city,
      customer_pincode: pincode,
      customer_gstin: gstin,
      notes: notes || null,
      items,
      total,
      attachments: uploadedPaths,
      user_id: userData.user?.id ?? null,
      source: "online",
    });

    if (insertError) {
      if (
        insertError.message?.includes("customer_city") ||
        insertError.message?.includes("customer_pincode")
      ) {
        return {
          error:
            "Database is missing the city/pincode columns. Run supabase/04_orders_address.sql.",
        };
      }
      return { error: insertError.message };
    }

    // -- Upsert the customer (deduped by normalized phone). Fail-soft:
    //    the order is already in the books; a bookkeeping miss here
    //    must never block the customer from finishing checkout.
    const now = new Date().toISOString();
    const { error: customerError } = await admin
      .from("customers")
      .upsert(
        {
          phone,
          name,
          email: userData.user?.email ?? null,
          address: customerAddress,
          city,
          pincode,
          user_id: userData.user?.id ?? null,
          last_seen_at: now,
        },
        { onConflict: "phone" }
      );
    if (customerError) {
      console.error(
        "[checkout] customer upsert failed:",
        customerError.message
      );
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin/customers");

    const whatsappNumber =
      process.env.NEXT_PUBLIC_WHATSAPP_E164 ?? SHOWROOM.whatsappE164;
    const lines = [
      `*New BareNest order*`,
      `Order: ${orderId.slice(0, 8).toUpperCase()}`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Address: ${customerAddress}`,
      ``,
      `*Items*`,
      ...items.map(
        (i) =>
          `• ${i.name} (${i.material}) × ${i.qty} — ${formatINR(
            i.price * i.qty
          )}`
      ),
      ``,
      `Total: ${formatINR(total)}`,
      notes ? `Notes: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      lines
    )}`;

    return {
      orderId,
      whatsappUrl,
      redirectTo: `/checkout/thanks?id=${orderId}`,
      skippedAttachments:
        skippedAttachments > 0 ? skippedAttachments : undefined,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}
