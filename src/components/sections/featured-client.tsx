"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { formatINR } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedClient({ products }: { products: Product[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-feat]", {
        y: 60,
        opacity: 0,
        stagger: 0.1,
        ease: "expo.out",
        duration: 1,
        scrollTrigger: {
          trigger: root.current,
          start: "top 75%",
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="bg-cream/30 py-28 md:py-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow text-muted">In the spotlight</p>
            <h2 className="mt-4 font-display text-5xl tracking-tight md:text-7xl">
              First in the <span className="serif-italic">door.</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden text-sm underline-offset-4 hover:underline md:block"
          >
            See all 30+
          </Link>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-4">
          {products.map((p) => (
            <Link
              key={p.slug}
              href={`/shop/${p.slug}`}
              data-feat
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-bone/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]">
                  {p.material}
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="font-display text-xl">{p.name}</h3>
                <span className="text-sm text-muted">
                  {formatINR(p.price)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">{p.tagline}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
