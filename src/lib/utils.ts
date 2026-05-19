import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SHOWROOM = {
  brand: "BareNest",
  studio: "Bare Nest Furni Studio",
  founder: "Gaurav Bahri",
  founderYears: 8,
  inaugurationISO: "2026-06-18T11:00:00+05:30",
  whatsappE164: "919999999999",
  email: "hello@barenest.studio",
  city: "Patna",
  // Used on the printable tax invoice. Replace placeholders with the
  // studio's real legal details before going live.
  tax: {
    legalName: "Bare Nest Furni Studio",
    gstin: "10AAAAA0000A1Z5",      // 15-char placeholder — replace with real GSTIN
    pan: "AAAAA0000A",              // placeholder
    addressLines: [
      "Address coming soon",
      "Patna, Bihar 800001",
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
