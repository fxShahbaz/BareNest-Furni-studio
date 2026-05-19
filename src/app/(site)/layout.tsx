import SmoothScroll from "@/components/smooth-scroll";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import MobileDock from "@/components/mobile-dock";
import LaunchPopup from "@/components/launch-popup";
import ChatWidget from "@/components/chat-widget";
import { getSettings } from "@/lib/queries/settings";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { online_ordering_enabled } = await getSettings();

  return (
    <>
      <SmoothScroll>
        <Navbar onlineOrderingEnabled={online_ordering_enabled} />
        <main className="relative">{children}</main>
        <Footer />
      </SmoothScroll>
      <MobileDock onlineOrderingEnabled={online_ordering_enabled} />
      <ChatWidget />
      <LaunchPopup />
    </>
  );
}
