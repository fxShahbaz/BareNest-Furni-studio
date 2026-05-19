import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/queries/settings";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Place your bare nest order. We confirm on WhatsApp and collect payment on delivery — no card or UPI details required upfront.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
};

export default async function CheckoutGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { online_ordering_enabled } = await getSettings();
  if (!online_ordering_enabled) redirect("/");
  return <>{children}</>;
}
