import { redirect } from "next/navigation";
import { getCurrentUser, isCurrentUserOwner } from "@/lib/queries/admin";
import AdminSidebar from "@/components/admin/sidebar";
import AdminPageHeader from "@/components/admin/page-header";

export const metadata = { title: "Admin — bare nest" };

export default async function AdminGatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SECURITY BOUNDARY ----------------------------------------------------
  // Every route under /admin/(gated)/* is rendered through this layout.
  // The two checks below must run on every request; do NOT cache them,
  // do NOT pass user/owner state to children via props in a way that
  // could let a stale render leak into a non-owner session.
  //
  // Server actions that write data also call requireOwner() / use the
  // same isCurrentUserOwner() — the layout gate alone is not enough,
  // because actions can be invoked over the wire even if no admin page
  // ever rendered.
  // ----------------------------------------------------------------------
  const user = await getCurrentUser();
  if (!user) redirect("/admin/sign-in");

  const owner = await isCurrentUserOwner();
  if (!owner) redirect("/admin/sign-in?error=not_owner");

  return (
    <div className="min-h-screen md:pl-[var(--admin-sidebar-w,260px)] transition-[padding] duration-200 print:!pl-0">
      <AdminSidebar userEmail={user.email ?? ""} />
      <main className="px-6 py-8 md:px-10 md:py-12 print:!p-0">
        <div className="mx-auto max-w-[1400px] print:max-w-none">
          <div className="print:hidden">
            <AdminPageHeader />
          </div>
          <div className="mt-10 print:mt-0">{children}</div>
        </div>
      </main>
    </div>
  );
}
