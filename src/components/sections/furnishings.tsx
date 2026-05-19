"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  {
    title: "Decorative pots",
    image:
      "https://images.unsplash.com/photo-1771627278991-8922851b9435?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Chandeliers",
    image:
      "https://images.unsplash.com/photo-1588436199489-ac376a0b3884?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Curtains",
    image:
      "https://images.unsplash.com/photo-1574197635162-68e4b468e4e9?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Showpieces",
    image:
      "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "God's idols",
    image:
      "https://images.unsplash.com/photo-1760857067352-5fb8d6e9245f?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Bedsheets",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Dining mats",
    image:
      "https://images.unsplash.com/photo-1761501597515-252646db6b41?auto=format&fit=crop&w=900&q=80",
  },
];

export default function Furnishings() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-furn]", {
        opacity: 0,
        y: 60,
        stagger: 0.08,
        ease: "expo.out",
        duration: 1,
        scrollTrigger: {
          trigger: root.current,
          start: "top 70%",
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="bg-bone py-28 md:py-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="eyebrow text-muted">Home furnishings</p>
            <h2 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
              For the rooms{" "}
              <span className="serif-italic text-walnut">
                in&nbsp;between.
              </span>
            </h2>
          </div>
          <div className="md:col-span-4">
            <p className="text-sm text-muted md:text-base">
              Curated home accents to dress the furniture — sourced from
              craftspeople we'd send our own family to.
            </p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {ITEMS.map((it, i) => (
            <Link
              key={it.title}
              href="/shop"
              data-furn
              className={
                "group relative block overflow-hidden rounded-2xl " +
                (i === 1 || i === 4
                  ? "aspect-[3/4]"
                  : i === 2
                    ? "aspect-square md:row-span-2 md:aspect-[3/4]"
                    : "aspect-[4/3]")
              }
            >
              <Image
                src={it.image}
                alt={it.title}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent" />
              <div className="absolute inset-x-3 bottom-3 flex items-end justify-between text-bone">
                <span className="font-display text-lg md:text-xl">
                  {it.title}
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-bone text-ink">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
