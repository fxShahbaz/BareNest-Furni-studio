"use client";

import { usePathname } from "next/navigation";

const titles: Array<{ match: RegExp; eyebrow: string; title: string }> = [
  { match: /^\/admin\/orders\/new$/, eyebrow: "Admin · Orders", title: "New order" },
  { match: /^\/admin\/orders/, eyebrow: "Admin", title: "Orders" },
  { match: /^\/admin\/customers/, eyebrow: "Admin", title: "Customers" },
  { match: /^\/admin\/subscribers/, eyebrow: "Admin", title: "Subscribers" },
  { match: /^\/admin\/enquiries/, eyebrow: "Admin", title: "Enquiries" },
  { match: /^\/admin\/messages/, eyebrow: "Admin", title: "Messages" },
  { match: /^\/admin\/settings/, eyebrow: "Admin", title: "Settings" },
  { match: /^\/admin\/products\/new$/, eyebrow: "Admin · Products", title: "New product" },
  { match: /^\/admin\/products\/[^/]+$/, eyebrow: "Admin · Products", title: "Edit product" },
  { match: /^\/admin\/products/, eyebrow: "Admin", title: "Products" },
  { match: /^\/admin$/, eyebrow: "Admin", title: "Studio backstage" },
];

export const ADMIN_HEADER_ACTIONS_ID = "admin-header-actions";

export default function AdminPageHeader() {
  const pathname = usePathname();
  const entry = titles.find((t) => t.match.test(pathname)) ?? titles[titles.length - 1];

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 pb-6">
      <div>
        <p className="eyebrow text-muted">{entry.eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl">{entry.title}</h1>
      </div>
      <div
        id={ADMIN_HEADER_ACTIONS_ID}
        className="flex flex-wrap items-center gap-2"
      />
    </div>
  );
}
