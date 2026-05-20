// Template re-mounts on every (site) route change, so the entrance
// animation plays for every navigation — not just the first page load.
// Layouts persist (Navbar, MobileDock, SmoothScroll), so only the page
// body fades. Opacity-only — no transform — to avoid fighting Lenis's
// scroll reset or shifting content visibly.
export default function SiteTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-fade-in">{children}</div>;
}
