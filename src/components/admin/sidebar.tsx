"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  LogOut,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Mail,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { href: "/admin/products", label: "Products", icon: Package },
];

const STORAGE_KEY = "bn-admin-sidebar-collapsed";
const EXPANDED_W = "260px";
const COLLAPSED_W = "76px";

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  // Mobile drawer state — collapsible state on desktop is independent.
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Read persisted collapse state after mount (avoids SSR/CSR mismatch).
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* private mode — ignore */
    }
  }, []);

  // Reflect the current width into a CSS variable on <html>. The gated
  // layout reads it for its left padding so main content slides with the
  // sidebar. We only set it once mounted so the server render stays at
  // the default and doesn't flash.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--admin-sidebar-w",
      collapsed ? COLLAPSED_W : EXPANDED_W
    );
    return () => {
      // Don't bother clearing — the property is page-scoped to /admin.
    };
  }, [collapsed]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* private mode — ignore */
      }
      return next;
    });
  }

  return (
    <>
      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-ink/10 bg-bone/90 px-5 py-3 backdrop-blur md:hidden print:hidden">
        <Link href="/admin" className="font-wordmark text-2xl leading-none text-ink">
          BareNest
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-full border border-ink/15 p-2 hover:bg-ink/5"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-ink/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-ink/10 bg-cream/50 transition-[width,transform] duration-200 md:translate-x-0 print:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "md:w-[76px]" : "md:w-[260px]"}`}
        data-collapsed={collapsed ? "true" : "false"}
      >
        <SidebarInner
          collapsed={collapsed}
          isActive={isActive}
          onNavigate={() => setMobileOpen(false)}
          userEmail={userEmail}
          toggleCollapsed={toggleCollapsed}
          closeMobile={() => setMobileOpen(false)}
        />
      </aside>
    </>
  );
}

function SidebarInner({
  collapsed,
  isActive,
  onNavigate,
  userEmail,
  toggleCollapsed,
  closeMobile,
}: {
  collapsed: boolean;
  isActive: (href: string, exact?: boolean) => boolean;
  onNavigate: () => void;
  userEmail: string;
  toggleCollapsed: () => void;
  closeMobile: () => void;
}) {
  // On mobile the drawer is always expanded — `collapsed` only takes
  // effect via the md: responsive classes below.
  return (
    <>
      <div
        className={`flex items-start gap-2 px-5 pt-6 ${
          collapsed ? "md:px-3 md:flex-col md:items-center" : ""
        }`}
      >
        <Link
          href="/admin"
          className="block flex-1"
          onClick={onNavigate}
          title="BareNest admin"
        >
          {/* Full wordmark — hidden when collapsed on desktop */}
          <div className={collapsed ? "md:hidden" : "block"}>
            <p className="font-wordmark text-3xl leading-none text-ink">
              BareNest
            </p>
            <p className="eyebrow mt-1 text-muted">admin</p>
          </div>
          {/* Compact monogram tile — only when collapsed on desktop */}
          <div
            className={`hidden ${
              collapsed ? "md:grid" : ""
            } h-10 w-10 place-items-center rounded-xl bg-ink text-bone`}
          >
            <span className="font-wordmark text-lg leading-none">B</span>
          </div>
        </Link>

        {/* Close button — mobile only */}
        <button
          type="button"
          onClick={closeMobile}
          aria-label="Close menu"
          className="rounded-full border border-ink/15 p-1.5 hover:bg-ink/5 md:hidden"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Collapse toggle — desktop only */}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
          className={`hidden h-7 w-7 place-items-center rounded-full border border-ink/15 text-ink/70 hover:bg-ink/5 md:grid ${
            collapsed ? "mt-3" : ""
          }`}
        >
          {collapsed ? (
            <ChevronsRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronsLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <nav
        className={`mt-8 flex flex-col gap-1 px-3 ${
          collapsed ? "md:items-center md:px-2" : ""
        }`}
      >
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active ? "bg-ink text-bone" : "text-ink/80 hover:bg-ink/5"
              } ${collapsed ? "md:w-11 md:justify-center md:px-0" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className={collapsed ? "md:hidden" : ""}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div
        className={`mt-auto border-t border-ink/10 px-5 py-5 ${
          collapsed ? "md:px-3" : ""
        }`}
      >
        {/* Expanded footer */}
        <div className={collapsed ? "md:hidden" : "block"}>
          <p className="eyebrow text-muted">signed in</p>
          <p className="mt-1 truncate text-xs text-ink/80" title={userEmail}>
            {userEmail || "—"}
          </p>
          <form action={signOut} className="mt-3">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/15 px-3 py-2 text-xs hover:bg-ink/5"
            >
              <LogOut className="h-3 w-3" />
              Sign out
            </button>
          </form>
        </div>

        {/* Collapsed footer: avatar + icon-only signout */}
        <div
          className={`hidden ${
            collapsed ? "md:flex" : ""
          } flex-col items-center gap-3`}
        >
          <div
            className="grid h-8 w-8 place-items-center rounded-full bg-ink/10 text-[11px] font-medium text-ink/80"
            title={userEmail || "Signed in"}
          >
            {(userEmail || "?").slice(0, 1).toUpperCase()}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sign out"
              title="Sign out"
              className="grid h-8 w-8 place-items-center rounded-full border border-ink/15 hover:bg-ink/5"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
