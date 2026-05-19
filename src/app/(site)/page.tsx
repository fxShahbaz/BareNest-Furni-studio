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

export default function Home() {
  return (
    <>
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
