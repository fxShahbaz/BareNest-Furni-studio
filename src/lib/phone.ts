// Indian mobile phone validation + normalization. One source of truth so
// the checkout, signup, onboarding, and account pages all agree on what
// a "valid" number looks like and what we store in the DB.
//
// We accept:  +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX
// We store:   XXXXXXXXXX  (canonical 10-digit, prefix stripped)

export const PHONE_RE = /^(?:\+?91[\s-]?|0)?[6-9]\d{9}$/;

export function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/[\s-]/g, "");
  return cleaned.replace(/^\+?91/, "").replace(/^0+/, "");
}

export function isValidIndianMobile(raw: string): boolean {
  return PHONE_RE.test(raw.replace(/[\s-]/g, ""));
}

export function formatPhoneForDisplay(canonical: string): string {
  // 9876543210 -> "+91 98765 43210"
  if (canonical.length !== 10) return `+91 ${canonical}`;
  return `+91 ${canonical.slice(0, 5)} ${canonical.slice(5)}`;
}
