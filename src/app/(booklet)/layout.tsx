// Bare layout for the booklet/catalogue surfaces. Intentionally renders
// neither Navbar, Footer, nor MobileDock — the booklet has its own
// cover, back cover and bottom dock, and the site chrome would clash
// with the full-bleed reading experience.

export default function BookletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
