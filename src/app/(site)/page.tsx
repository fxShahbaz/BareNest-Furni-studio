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

export const metadata: Metadata = {
  // Use `title.absolute` so the template doesn't append "— BareNest"
  // to a title that already starts with the brand.
  title: { absolute: "BareNest — Honest Wood Furniture, Made in Patna" },
  description:
    "Solid wood and MDF furniture, thoughtfully made. Bare Nest Furni Studio inaugurates 18 June 2026 in Patna. Founded by Gaurav Bahri. No particle board, ever.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "BareNest — Honest Wood Furniture, Made in Patna",
    description:
      "Solid wood and MDF furniture, thoughtfully made. Showroom inaugurates 18 June 2026 in Patna.",
    url: "/",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <LaunchEventJsonLd />
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
