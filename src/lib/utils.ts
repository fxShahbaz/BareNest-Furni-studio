import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Canonical site URL. Set NEXT_PUBLIC_SITE_URL in production (Vercel env
// var, etc). Used for sitemap, robots, og:url, JSON-LD canonicals. Falls
// back to a stable production guess so local dev doesn't break.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://barenest.in"
).replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SHOWROOM = {
  brand: "BareNest",
  studio: "Bare Nest Furni Studio",
  founder: "Gaurav Bahri",
  founderYears: 8,
  inaugurationISO: "2026-06-18T11:00:00+05:30",
  whatsappE164: "919031428728",
  email: "hello@barenest.in",
  city: "Patna",
  address: {
    streetAddress:
      "Ground Floor, House No 285, Lohiya Path, Garbhuchak, P.S. Rukanpura",
    locality: "Patna",
    region: "Bihar",
    postalCode: "800014",
    country: "IN",
    // Display-ready 3-line form for footers, invoices, contact card.
    lines: [
      "Ground Floor, House No 285, Lohiya Path",
      "Garbhuchak, P.S. Rukanpura",
      "Patna, Bihar 800014",
    ],
  },
  // Used on the printable tax invoice. Replace placeholders with the
  // studio's real legal details before going live.
  tax: {
    legalName: "Bare Nest Furni Studio",
    gstin: "10AAAAA0000A1Z5",      // 15-char placeholder — replace with real GSTIN
    pan: "AAAAA0000A",              // placeholder
    addressLines: [
      "Ground Floor, House No 285, Lohiya Path",
      "Garbhuchak, P.S. Rukanpura",
      "Patna, Bihar 800014",
    ],
    state: "Bihar",
    stateCode: "10",                // Bihar GST state code; used to decide intra vs inter-state supply
  },
  socials: {
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    x: "https://x.com",
  },
} as const;

export function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Renders the customer-facing tax disclosure next to a price.
 * Inclusive → "incl. 18% GST"; exclusive → "+ 18% GST".
 * Falls back to 18% / inclusive when fields are missing on legacy rows.
 */
export function formatTaxLabel(
  gstRate?: number | null,
  taxInclusive?: boolean | null
): string {
  const rate = gstRate ?? 18;
  const incl = taxInclusive ?? true;
  // Drop a trailing ".0" so 18.0 → "18", but keep 12.5.
  const rateStr = Number.isInteger(rate) ? String(rate) : String(rate);
  return incl ? `incl. ${rateStr}% GST` : `+ ${rateStr}% GST`;
}
