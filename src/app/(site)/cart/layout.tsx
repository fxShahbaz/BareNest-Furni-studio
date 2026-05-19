import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/queries/settings";

export const metadata: Metadata = {
  title: "Your Cart",
  description:
    "Review your BareNest order before checkout. Solid wood and MDF furniture, confirmed on WhatsApp, paid on delivery.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: true },
};

export default async function CartGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { online_ordering_enabled } = await getSettings();
  if (!online_ordering_enabled) redirect("/");
  return <>{children}</>;
}
