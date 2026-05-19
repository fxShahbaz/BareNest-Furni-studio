"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type Polaroid = {
  src: string;
  alt: string;
  caption: string;
  date: string;
  /** desktop placement */
  className: string;
  rotate: number;
  tape: "yellow" | "rust" | "leaf";
};

const POLAROIDS: Polaroid[] = [
  {
    src: "https://images.unsplash.com/photo-1589169011402-8b2cbd1ee593?auto=format&fit=crop&w=600&q=80",
    alt: "Mother and daughter laughing on a sofa",
    caption: "Sunday afternoon",
    date: "Patna · '25",
    className: "left-[2%] top-[4%] w-[44%] md:left-[4%] md:top-[6%] md:w-[42%]",
    rotate: -7,
    tape: "yellow",
  },
  {
    src: "https://images.unsplash.com/photo-1621176313593-89976c1f1bed?auto=format&fit=crop&w=600&q=80",
    alt: "Grandparents holding their grandchild",
    caption: "Three generations, one sofa",
    date: "Dec '25",
    className: "right-[3%] top-[0%] w-[40%] md:right-[6%] md:top-[2%] md:w-[36%]",
    rotate: 6,
    tape: "rust",
  },
  {
    src: "https://images.unsplash.com/photo-1633891119630-cb3665df5b7d?auto=format&fit=crop&w=600&q=80",
    alt: "Family embracing during Diwali celebration",
    caption: "Diwali '25",
    date: "the loud, good kind",
    className: "left-[8%] bottom-[2%] w-[42%] md:left-[14%] md:bottom-[4%] md:w-[38%]",
    rotate: 4,
    tape: "leaf",
  },
  {
    src: "https://images.unsplash.com/photo-1730130596425-197566414dc4?auto=format&fit=crop&w=600&q=80",
    alt: "Family at a housewarming puja",
    caption: "Griha pravesh",
    date: "house → home",
    className: "right-[4%] bottom-[6%] w-[44%] md:right-[8%] md:bottom-[10%] md:w-[40%]",
    rotate: -5,
    tape: "yellow",
  },
];

export default function Happiness() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Lock the polaroids into their hidden state *synchronously* before
      // the browser paints, so there's no flash of them at the final
      // position before the animation kicks in. Inline style on each
      // figure provides the matching SSR/initial-paint state.
      gsap.set("[data-hap-poly]", {
        opacity: 0,
        y: 28,
        scale: 0.96,
        rotation: (i, el) =>
          Number((el as HTMLElement).dataset.rotate ?? "0"),
      });

      gsap.to("[data-hap-poly]", {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.95,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: root.current,
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
        onComplete: () => {
          // Release the GPU promotion once the entrance is done so the
          // browser can reclaim the layers.
          gsap.set("[data-hap-poly]", { clearProps: "will-change" });
        },
      });

      gsap.from("[data-hap-word]", {
        yPercent: 110,
        opacity: 0,
        stagger: 0.08,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 78%" },
      });
      gsap.from("[data-hap-copy]", {
        opacity: 0,
        y: 20,
        delay: 0.25,
        stagger: 0.1,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 78%" },
      });
      gsap.from("[data-hap-scribble]", {
        opacity: 0,
        scale: 0.6,
        delay: 0.9,
        duration: 0.9,
        ease: "back.out(1.8)",
        stagger: 0.15,
        scrollTrigger: { trigger: root.current, start: "top 78%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-cream/70 py-24 md:py-32"
    >
      {/* paper grain */}
      <div className="pointer-events-none absolute inset-0 grain opacity-50" />

      {/* faint corner doodle */}
      <svg
        aria-hidden
        viewBox="0 0 120 120"
        className="pointer-events-none absolute left-6 top-10 h-16 w-16 text-walnut/25 md:left-10 md:top-14 md:h-20 md:w-20"
        data-hap-scribble
      >
        <path
          d="M10 60 C 30 20, 70 20, 90 60 S 110 100, 70 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M70 100 l 10 -8 M70 100 l -2 -12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid items-center gap-14 md:grid-cols-12 md:gap-10">
          {/* Text column */}
          <div className="relative md:col-span-5">
            <p
              className="eyebrow text-walnut/70"
              data-hap-copy
            >
              Home, lately.
            </p>

            <h2 className="mt-5 font-display text-[3.2rem] leading-[0.95] tracking-tight text-ink sm:text-6xl md:text-[5.5rem]">
              <span className="inline-block overflow-hidden">
                <span className="inline-block" data-hap-word>
                  Bring
                </span>
              </span>{" "}
              <span className="relative inline-block overflow-hidden align-baseline">
                <span
                  className="font-wordmark inline-block text-rust md:-mb-2"
                  data-hap-word
                >
                  happiness
                </span>
                {/* underline scribble */}
                <svg
                  aria-hidden
                  viewBox="0 0 280 16"
                  className="absolute -bottom-1 left-0 h-3 w-full text-rust/60"
                  data-hap-scribble
                >
                  <path
                    d="M3 11 C 60 4, 110 14, 160 7 S 250 12, 277 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <br />
              <span className="inline-block overflow-hidden">
                <span className="serif-italic inline-block" data-hap-word>
                  home.
                </span>
              </span>
            </h2>

            <p
              className="mt-8 max-w-md text-base leading-relaxed text-muted md:text-lg"
              data-hap-copy
            >
              We&apos;re not really in the furniture business. We&apos;re in the
              <em className="serif-italic"> Sunday-afternoon</em> business, the
              <em className="serif-italic"> Diwali-evening</em> business, the
              <em className="serif-italic"> chai-on-a-new-sofa</em> business.
              Furniture just happens to be how we show up.
            </p>

            <div className="mt-10 flex items-center gap-5" data-hap-copy>
              <Link
                href="/story"
                className="group inline-flex items-center gap-3 rounded-full bg-walnut px-6 py-3.5 text-sm text-bone transition-colors hover:bg-bark"
              >
                Read our story
                <span className="grid h-7 w-7 place-items-center rounded-full bg-bone text-walnut transition-transform group-hover:rotate-45">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
              <p className="font-wordmark text-xl text-walnut/70">
                — from our family to yours.
              </p>
            </div>
          </div>

          {/* Polaroid cluster column */}
          <div className="md:col-span-7">
            <div className="relative mx-auto aspect-[5/4] w-full max-w-[640px] md:aspect-[6/5]">
              {POLAROIDS.map((p, i) => (
                <PolaroidCard key={p.src} polaroid={p} index={i} />
              ))}

              {/* connecting heart scribble */}
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-[46%] top-[44%] h-8 w-8 text-rust"
                data-hap-scribble
              >
                <path
                  d="M12 21s-7-4.5-9.5-9C0.5 8 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 6 4 4 8-2.5 4.5-9.5 9-9.5 9z"
                  fill="currentColor"
                  fillOpacity="0.9"
                />
              </svg>

              {/* hand-drawn arrow */}
              <svg
                aria-hidden
                viewBox="0 0 120 60"
                className="pointer-events-none absolute -bottom-2 left-[34%] hidden h-10 w-24 text-walnut/55 md:block"
                data-hap-scribble
              >
                <path
                  d="M5 50 C 30 10, 70 10, 110 28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeDasharray="0"
                />
                <path
                  d="M110 28 l -10 -2 M110 28 l -6 -8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PolaroidCard({
  polaroid,
  index,
}: {
  polaroid: Polaroid;
  index: number;
}) {
  const [loaded, setLoaded] = useState(false);
  const tapeColor =
    polaroid.tape === "yellow"
      ? "bg-[#f2d27a]/85"
      : polaroid.tape === "rust"
      ? "bg-rust/55"
      : "bg-leaf/55";

  return (
    <figure
      data-hap-poly
      data-rotate={polaroid.rotate}
      style={{
        // SSR/initial-paint state matches the gsap.set() in useLayoutEffect
        // so the polaroid never flashes at its final position before
        // entering. Promoted to its own compositor layer for a clean
        // GPU-driven entrance.
        opacity: 0,
        transform: `translateY(28px) scale(0.96) rotate(${polaroid.rotate}deg)`,
        zIndex: 10 + index,
        willChange: "transform, opacity",
      }}
      className={
        "group absolute origin-center transform-gpu transition-transform duration-500 hover:!rotate-0 hover:scale-[1.04] hover:!z-50 " +
        polaroid.className
      }
    >
      <div className="relative rounded-[6px] bg-bone p-2.5 shadow-[0_18px_40px_-22px_rgba(20,17,14,0.5),0_3px_8px_-3px_rgba(20,17,14,0.25)] md:p-3">
        {/* washi tape */}
        <span
          aria-hidden
          className={
            "absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 -rotate-3 rounded-[2px] " +
            tapeColor
          }
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 6px, transparent 6px 12px)",
          }}
        />

        <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-cream">
          <Image
            src={polaroid.src}
            alt={polaroid.alt}
            fill
            priority={index < 2}
            sizes="(min-width: 768px) 22vw, 44vw"
            onLoad={() => setLoaded(true)}
            className={
              "object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-105 " +
              (loaded ? "opacity-100" : "opacity-0")
            }
          />
        </div>

        <figcaption className="px-1.5 pb-1 pt-2.5 text-center md:pt-3">
          <p className="font-wordmark text-lg leading-none text-walnut md:text-xl">
            {polaroid.caption}
          </p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-muted">
            {polaroid.date}
          </p>
        </figcaption>
      </div>
    </figure>
  );
}
