// Bare layout for the shareable invitation. Intentionally renders neither
// Navbar, Footer, MobileDock, ChatWidget nor the LaunchPopup — the invite
// is its own celebratory surface and any site chrome would distract.

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
