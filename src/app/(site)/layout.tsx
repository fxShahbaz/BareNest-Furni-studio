import SmoothScroll from "@/components/smooth-scroll";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import MobileDock from "@/components/mobile-dock";
import LaunchPopup from "@/components/launch-popup";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SmoothScroll>
        <Navbar />
        <main className="relative">{children}</main>
        <Footer />
      </SmoothScroll>
      <MobileDock />
      <LaunchPopup />
    </>
  );
}
