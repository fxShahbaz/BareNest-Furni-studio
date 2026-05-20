import type { Metadata } from "next";
import Hero from "@/components/sections/hero";
import Marquee from "@/components/sections/marquee";
import Materials from "@/components/sections/materials";
import Categories from "@/components/sections/categories";
import Featured from "@/components/sections/featured";
import Founder from "@/components/sections/founder";
import Furnishings from "@/components/sections/furnishings";
import Countdown from "@/components/sections/countdown";
import FounderNote from "@/components/sections/promise";
import Happiness from "@/components/sections/happiness";
import LaunchEventJsonLd from "@/components/seo/launch-event-json-ld";
import PrefetchRoutes from "@/components/prefetch-routes";
import LandingAudio from "@/components/landing-audio";

// Home revalidates every 5 minutes. Featured products / countdown
// don't need real-time freshness; admin product updates invalidate
// /shop and any direct revalidatePath calls flow here too.
export const revalidate = 300;

export const metadata: Metadata = {
  // Use `title.absolute` so the template doesn't append "— bare nest"
  // to a title that already starts with the brand.
  title: { absolute: "bare nest — Honest Wood Furniture, Made in Patna" },
  description:
    "Solid wood and MDF furniture, thoughtfully made. Bare Nest Furni Studio inaugurates 18 June 2026 in Patna. Founded by Gaurav Bahri. No particle board, ever.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "bare nest — Honest Wood Furniture, Made in Patna",
    description:
      "Solid wood and MDF furniture, thoughtfully made. Showroom inaugurates 18 June 2026 in Patna.",
    url: "/",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      {/* Kick off the audio download before JS hydrates so the loop is
          ready to play() the moment <LandingAudio /> mounts. React 19 hoists
          this <link> into <head> automatically. */}
      <link
        rel="preload"
        as="audio"
        href="/audio/landing.mp3"
        type="audio/mpeg"
      />
      <LaunchEventJsonLd />
      <PrefetchRoutes />
      <LandingAudio />
      <Hero />
      <Marquee />
      <Materials />
      <Categories />
      <Featured />
      <Founder />
      <Furnishings />
      <Happiness />
      <Countdown />
      <FounderNote />
    </>
  );
}
