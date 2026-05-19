"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

const QUOTE =
  "Eight years on the shop floor taught me one thing: customers don't want the cheapest. They want to know what they're buying. So we built bare nest around two materials we'd put in our own home — and refused the one we wouldn't.";

const COLOR_DIM = "#7a6f5e";
const COLOR_LIT = "#f6f3ec";

export default function Founder() {
  const root = useRef<HTMLElement>(null);

  // Drive the word fill from the section's own scroll progress through the
  // viewport. No pin, no sticky — keeps the page in normal flow so there is
  // no layout discontinuity between this section and the one above.
  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start 0.8", "end 0.2"],
  });

  const words = QUOTE.split(" ");

  return (
    <section
      ref={root}
      id="story"
      className="relative bg-bark py-28 text-bone md:py-40"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=900&q=80"
                alt="Founder Gaurav Bahri"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
            </div>
            <p className="eyebrow mt-5 text-bone/60">Founder</p>
            <p className="mt-2 font-display text-3xl">Gaurav Bahri</p>
            <p className="text-sm text-bone/60">
              Eight years in the furniture industry
            </p>
          </div>

          <div className="md:col-span-8 md:pl-12">
            <p className="eyebrow text-bone/60">A word from the studio</p>
            <p className="mt-6 font-display text-3xl leading-[1.2] md:text-5xl">
              {words.map((w, i) => (
                <Word
                  key={i}
                  word={w}
                  index={i}
                  total={words.length}
                  progress={scrollYProgress}
                />
              ))}
            </p>
            <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-3">
              <Stat n="08" l="Years on shop floor" />
              <Stat n="00" l="Particle-board SKUs" />
              <Stat n="2026" l="Studio inauguration" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Word({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  // Each word fills over a window of ~6 words' worth of scroll, with the
  // windows overlapping so the colour flows like a wave instead of a stutter.
  const stride = 1 / Math.max(1, total - 1);
  const band = stride * 6;
  const center = index * stride;
  const start = Math.max(0, center - band / 2);
  const end = Math.min(1, center + band / 2);

  const color = useTransform(progress, [start, end], [COLOR_DIM, COLOR_LIT]);

  return (
    <motion.span className="inline-block" style={{ color }}>
      {word}&nbsp;
    </motion.span>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-5xl leading-none md:text-6xl">{n}</div>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-bone/60">
        {l}
      </p>
    </div>
  );
}
