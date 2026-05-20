import { getAllProducts } from "@/lib/queries/products";
import { SITE_URL, SHOWROOM, absoluteUrl } from "@/lib/utils";

// Google Merchant Center product feed (RSS 2.0 with the `g:` namespace).
// Submit this URL in Merchant Center → Products → Feeds → Scheduled fetch.
// Listings then appear on the free Shopping tab and in regular search rich
// results. Spec: https://support.google.com/merchants/answer/7052112
//
// Revalidated every 10 minutes so admin edits show up in Merchant Center
// within one fetch cycle without hammering Supabase.
export const revalidate = 600;

const TEXT_XML = "application/xml; charset=utf-8";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Map our internal categories to Google's product taxonomy. Picking the
// closest leaf gives Google a cleaner signal than the text-path. Codes
// from https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
const GOOGLE_PRODUCT_CATEGORY: Record<string, string> = {
  beds: "451", // Furniture > Beds & Accessories > Beds
  wardrobes: "6356", // Furniture > Cabinets & Storage > Armoires & Wardrobes
  dressing: "6356",
  sofas: "460", // Furniture > Sofas
  dining: "6362", // Furniture > Tables > Kitchen & Dining Room Tables
  crockery: "4205", // Furniture > Cabinets & Storage > Buffets & Sideboards
  bookshelves: "2862", // Furniture > Shelving > Bookcases & Standing Shelves
  shoerack: "457", // Furniture > Cabinets & Storage > Storage Cabinets & Lockers
  office: "459", // Furniture > Office Furniture > Desks
  conference: "6360", // Furniture > Tables > Conference Room Tables
};

function priceTag(price: number, gstRate: number | undefined, inclusive: boolean | undefined): string {
  // Google expects the final, all-taxes-included price. If the row is
  // exclusive, gross it up so Merchant Center sees the same number the
  // shopper sees on the storefront.
  const rate = (gstRate ?? 18) / 100;
  const final = inclusive === false ? Math.round(price * (1 + rate)) : price;
  return `${final}.00 INR`;
}

export async function GET() {
  const products = await getAllProducts();
  const updated = new Date().toUTCString();
  const orgUrl = SITE_URL;

  const items = products
    .filter((p) => (p.images?.length ?? 0) > 0)
    .map((p) => {
      const url = `${SITE_URL}/shop/${p.slug}`;
      const imgs = p.images.map((u) => absoluteUrl(u));
      const description = (p.description || p.tagline || `${p.name} — ${p.material} furniture by bare nest, made in Patna.`).trim();
      const gpc = GOOGLE_PRODUCT_CATEGORY[p.category];
      const productType = `Furniture > ${p.category}`;
      return `
    <item>
      <g:id>${esc(p.slug)}</g:id>
      <g:title>${esc(p.name)}</g:title>
      <g:description>${esc(description)}</g:description>
      <g:link>${esc(url)}</g:link>
      <g:image_link>${esc(imgs[0])}</g:image_link>${imgs
        .slice(1, 10)
        .map((u) => `\n      <g:additional_image_link>${esc(u)}</g:additional_image_link>`)
        .join("")}
      <g:availability>in_stock</g:availability>
      <g:price>${priceTag(p.price, p.gst_rate, p.tax_inclusive)}</g:price>
      <g:brand>${esc(SHOWROOM.brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:mpn>${esc(p.slug)}</g:mpn>
      <g:material>${esc(p.material)}</g:material>
      <g:product_type>${esc(productType)}</g:product_type>${gpc ? `\n      <g:google_product_category>${gpc}</g:google_product_category>` : ""}
      <g:custom_label_0>${esc(p.material)}</g:custom_label_0>
      <g:custom_label_1>${esc(p.category)}</g:custom_label_1>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>0 INR</g:price>
      </g:shipping>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(`${SHOWROOM.brand} — ${SHOWROOM.studio}`)}</title>
    <link>${esc(orgUrl)}</link>
    <description>Honest solid wood and MDF furniture, made in Patna.</description>
    <lastBuildDate>${updated}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": TEXT_XML,
      // Edge-cache for an hour, allow stale-while-revalidate for a day.
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
