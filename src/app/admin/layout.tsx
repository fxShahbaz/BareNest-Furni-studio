// Pass-through. The gate + chrome live in (gated)/layout.tsx so that
// /admin/sign-in stays publicly reachable.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
