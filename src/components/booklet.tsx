"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  MapPin,
  X,
} from "lucide-react";
import type { Product } from "@/lib/products";
import { formatINR, formatTaxLabel, SHOWROOM } from "@/lib/utils";

type Props = { products: Product[] };

/**
 * A snap-scrolling, full-viewport "booklet" view of the catalogue.
 *
 * Layout: cover → contents → 1 page per product → back cover.
 * Each section is `h-svh` + `snap-start`. The booklet has its own
 * scroll container (window stays still), so Lenis/site smooth-scroll
 * doesn't fight CSS snap.
 */
export default function Booklet({ products }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Array<HTMLElement | null>>([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Cover (0) + Contents (1) + N products + Back cover.
  const totalPages = 2 + products.length + 1;
  const lastPage = totalPages - 1;

  const goTo = useCallback(
    (page: number) => {
      const clamped = Math.max(0, Math.min(lastPage, page));
      const el = pageRefs.current[clamped];
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [lastPage]
  );

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore when typing in an input.
      const t = e.target as HTMLElement | null;
      if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;

      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        goTo(currentPage + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goTo(currentPage - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(lastPage);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentPage, lastPage, goTo]);

  // Scroll-spy: track which page is currently in view.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = Number(
              (entry.target as HTMLElement).dataset.page ?? "0"
            );
            setCurrentPage(idx);
          }
        }
      },
      { root, threshold: [0.5] }
    );
    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [products.length]);

  const tocEntries = useMemo(
    () =>
      products.map((p, i) => ({
        slug: p.slug,
        name: p.name,
        category: p.category,
        // +2 because cover=0, contents=1, first product=2
        pageIndex: i + 2,
      })),
    [products]
  );

  const setPageRef = (idx: number) => (el: HTMLElement | null) => {
    pageRefs.current[idx] = el;
  };

  return (
    <div className="relative">
      {/* Persistent close — escape hatch to the site. Fixed above the
          booklet, safe-area aware on iOS. */}
      <Link
        href="/"
        aria-label="Close catalogue"
        title="Close catalogue"
        className="fixed right-3 top-[max(env(safe-area-inset-top),0.75rem)] z-40 grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-bone/90 text-ink/70 shadow-[0_8px_20px_-10px_rgba(20,17,14,0.4)] backdrop-blur transition-colors hover:bg-bone hover:text-ink md:right-6 md:top-6"
      >
        <X className="h-4 w-4" />
      </Link>

      {/* The booklet itself — its own scroll container. We use
          snap-proximity (not mandatory) so tall mobile pages can be
          scrolled within without the browser fighting the user. */}
      <div
        ref={containerRef}
        aria-label="BareNest catalogue, page by page"
        className="h-[100svh] snap-y snap-proximity overflow-y-auto bg-cream/50"
      >
        {/* COVER */}
        <BookletPage
          setRef={setPageRef(0)}
          pageIndex={0}
          className="bg-bone"
        >
          <div className="pointer-events-none absolute inset-0 grain opacity-40" />
          <div className="relative mx-auto flex min-h-[100svh] max-w-[1100px] flex-col justify-between gap-8 px-5 py-14 md:px-12 md:py-28">
            <header className="flex flex-wrap items-start justify-between gap-2 text-walnut/70">
              <p className="text-[9px] uppercase tracking-[0.3em] md:text-[10px] md:tracking-[0.32em]">
                Vol. 01 · MMXXVI
              </p>
              <p className="text-[9px] uppercase tracking-[0.3em] md:text-[10px] md:tracking-[0.32em]">
                {SHOWROOM.city}, India
              </p>
            </header>

            <div className="text-center">
              <p className="eyebrow text-walnut/70">{SHOWROOM.studio}</p>
              <h1 className="mt-5 font-display text-[20vw] leading-[0.85] tracking-tight md:mt-6 md:text-[10rem]">
                The
                <br />
                <span className="serif-italic text-walnut">Catalogue.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted md:mt-8 md:text-base">
                A printed catalogue, page by page. Solid wood and honest
                MDF — and a refusal to stock particle board.
              </p>
            </div>

            <footer className="flex flex-wrap items-end justify-between gap-4 text-walnut/70">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] md:text-[10px] md:tracking-[0.32em]">
                  {products.length} pieces
                </p>
                <p className="mt-1 font-wordmark text-xl text-walnut md:text-2xl">
                  bare nest
                </p>
              </div>
              <button
                type="button"
                onClick={() => goTo(1)}
                className="group inline-flex items-center gap-2 rounded-full border border-walnut/30 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-walnut transition-colors hover:bg-walnut hover:text-bone md:px-5 md:py-2.5 md:text-xs md:tracking-[0.22em]"
              >
                Open
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </footer>
          </div>
        </BookletPage>

        {/* CONTENTS */}
        <BookletPage
          setRef={setPageRef(1)}
          pageIndex={1}
        >
          <PageFolio side="left" pageNumber={1} total={totalPages} />
          <div className="mx-auto flex min-h-[100svh] max-w-[1100px] flex-col justify-center px-5 py-16 md:px-12 md:py-28">
            <p className="eyebrow text-walnut/70">Index</p>
            <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight md:text-7xl">
              Contents.
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted md:text-base">
              {products.length} pieces, one per page. Tap any title to flip there.
            </p>

            <ul className="mt-8 grid gap-1.5 text-sm md:mt-12 md:grid-cols-2 md:gap-2.5 md:gap-x-12">
              {tocEntries.map((t, i) => (
                <li key={t.slug}>
                  <button
                    type="button"
                    onClick={() => goTo(t.pageIndex)}
                    className="group flex w-full items-baseline gap-2.5 border-b border-walnut/15 py-2.5 text-left transition-colors hover:border-walnut/60 md:gap-3 md:py-3"
                  >
                    <span className="w-7 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted md:w-8">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 truncate font-display text-[15px] group-hover:text-walnut md:text-lg">
                      {t.name}
                    </span>
                    <span className="hidden text-[10px] uppercase tracking-[0.18em] text-muted sm:inline">
                      {t.category}
                    </span>
                    <span className="ml-2 shrink-0 font-mono text-[10px] tabular-nums text-muted">
                      p.{String(t.pageIndex + 1).padStart(2, "0")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </BookletPage>

        {/* PRODUCT PAGES */}
        {products.map((p, i) => {
          const pageIdx = i + 2;
          return (
            <BookletPage
              key={p.slug}
              setRef={setPageRef(pageIdx)}
              pageIndex={pageIdx}
            >
              <PageFolio
                side={i % 2 === 0 ? "right" : "left"}
                pageNumber={pageIdx}
                total={totalPages}
                chapter={p.category}
              />
              <div className="mx-auto grid min-h-[100svh] max-w-[1200px] grid-cols-1 items-center gap-6 px-5 pt-14 pb-24 md:grid-cols-12 md:gap-14 md:px-12 md:pt-28 md:pb-28">
                {/* Image — flipped per spread for visual rhythm.
                    On mobile we use a shorter landscape ratio so the
                    image + copy + dock all fit in one viewport. */}
                <figure
                  className={
                    "relative md:col-span-7 " +
                    (i % 2 === 0 ? "md:order-1" : "md:order-2")
                  }
                >
                  <div className="relative aspect-[5/4] overflow-hidden rounded-md bg-bone shadow-[0_30px_60px_-30px_rgba(20,17,14,0.35)] md:aspect-[4/5]">
                    {p.images[0] && (
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="(min-width: 768px) 55vw, 100vw"
                        className="object-cover"
                        priority={i < 2}
                      />
                    )}
                  </div>
                  <figcaption className="mt-2 hidden font-mono text-[10px] uppercase tracking-[0.22em] text-muted md:mt-3 md:block">
                    Fig. {String(i + 1).padStart(2, "0")} — {p.name}
                  </figcaption>
                </figure>

                {/* Copy */}
                <div
                  className={
                    "md:col-span-5 " +
                    (i % 2 === 0 ? "md:order-2" : "md:order-1")
                  }
                >
                  <span className="inline-flex items-center gap-2 rounded-full border border-walnut/30 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.22em] text-walnut">
                    {p.material}
                  </span>

                  <h2 className="mt-3 font-display text-[2rem] leading-[1.02] tracking-tight sm:text-4xl md:mt-5 md:text-6xl">
                    {p.name}
                  </h2>

                  {p.tagline && (
                    <p className="mt-2 serif-italic text-sm text-walnut md:mt-3 md:text-lg">
                      {p.tagline}
                    </p>
                  )}

                  <hr className="my-4 border-walnut/15 md:my-6" />

                  {p.description && (
                    <p className="line-clamp-3 text-[13px] leading-relaxed text-ink/80 md:line-clamp-none md:text-[15px]">
                      {p.description}
                    </p>
                  )}

                  <dl className="mt-4 hidden grid-cols-1 gap-3 text-xs sm:grid md:mt-6">
                    {p.dimensions && (
                      <div className="grid grid-cols-[88px_1fr] gap-3">
                        <dt className="uppercase tracking-[0.18em] text-muted">
                          Dimensions
                        </dt>
                        <dd className="text-ink/80">{p.dimensions}</dd>
                      </div>
                    )}
                    {p.features?.length > 0 && (
                      <div className="grid grid-cols-[88px_1fr] gap-3">
                        <dt className="uppercase tracking-[0.18em] text-muted">
                          Built in
                        </dt>
                        <dd className="text-ink/80">
                          {p.features.join(" · ")}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-5 flex items-end justify-between gap-3 md:mt-8 md:gap-4">
                    <div>
                      <p className="font-display text-2xl tabular-nums md:text-4xl">
                        {formatINR(p.price)}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">
                        {formatTaxLabel(p.gst_rate, p.tax_inclusive)}
                      </p>
                    </div>
                    <Link
                      href={`/shop/${p.slug}`}
                      className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-walnut px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] text-bone transition-colors hover:bg-bark md:px-5 md:py-3 md:text-xs"
                    >
                      View piece
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </BookletPage>
          );
        })}

        {/* BACK COVER */}
        <BookletPage
          setRef={setPageRef(lastPage)}
          pageIndex={lastPage}
          className="bg-bark text-bone"
        >
          <div className="mx-auto flex min-h-[100svh] max-w-[1100px] flex-col items-center justify-center gap-8 px-5 py-16 text-center md:gap-12 md:px-12 md:py-28">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-bone/10 text-bone/80 md:h-16 md:w-16">
              <BookOpen className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div>
              <p className="eyebrow text-bone/60">End of catalogue</p>
              <h2 className="mt-4 font-display text-4xl leading-tight md:mt-5 md:text-7xl">
                See it in person.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-bone/70 md:mt-5 md:text-base">
                The pieces above were photographed inside the studio. Doors
                open <span className="text-bone">18 June 2026</span> in{" "}
                {SHOWROOM.city}. Come feel the wood.
              </p>
            </div>
            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
              <Link
                href="/showroom"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-bone px-6 py-3.5 text-sm text-ink transition-colors hover:bg-cream"
              >
                <MapPin className="h-4 w-4" />
                Visit showroom
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-bone/30 px-6 py-3.5 text-sm text-bone transition-colors hover:bg-bone/10"
              >
                Browse the shop
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="font-wordmark text-2xl text-bone/80 md:mt-6 md:text-3xl">
              bare nest
            </p>
          </div>
        </BookletPage>
      </div>

      {/* Navigation dock — fixed over the booklet */}
      <BookletDock
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => goTo(currentPage - 1)}
        onNext={() => goTo(currentPage + 1)}
        onJump={goTo}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function BookletPage({
  setRef,
  pageIndex,
  children,
  className,
}: {
  setRef: (el: HTMLElement | null) => void;
  pageIndex: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      ref={setRef}
      data-page={pageIndex}
      aria-label={`Page ${pageIndex + 1}`}
      className={
        "relative min-h-[100svh] w-full snap-start snap-always " +
        (className ?? "")
      }
    >
      {children}
    </section>
  );
}

function PageFolio({
  pageNumber,
  total,
  side,
  chapter,
}: {
  pageNumber: number;
  total: number;
  side: "left" | "right";
  chapter?: string;
}) {
  return (
    <header
      className={
        "pointer-events-none absolute inset-x-0 top-6 z-10 flex items-center justify-between px-6 text-[10px] uppercase tracking-[0.22em] text-muted md:top-8 md:px-12 " +
        (side === "left" ? "" : "")
      }
    >
      <span className="font-mono tabular-nums">
        {String(pageNumber + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      {chapter && (
        <span className="font-mono truncate">{chapter}</span>
      )}
    </header>
  );
}

function BookletDock({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onJump,
}: {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (page: number) => void;
}) {
  const atStart = currentPage === 0;
  const atEnd = currentPage === totalPages - 1;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(env(safe-area-inset-bottom),1rem)] z-40 flex justify-center px-4">
      <nav
        aria-label="Booklet navigation"
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-ink/10 bg-bone/90 px-2 py-2 shadow-[0_18px_50px_-18px_rgba(20,17,14,0.45)] backdrop-blur-xl"
      >
        <button
          type="button"
          onClick={onPrev}
          disabled={atStart}
          aria-label="Previous page"
          className="grid h-9 w-9 place-items-center rounded-full text-ink/80 transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="mx-1 hidden items-center gap-1 sm:flex">
          {Array.from({ length: totalPages }).map((_, i) => {
            const active = i === currentPage;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onJump(i)}
                aria-label={`Go to page ${i + 1}`}
                aria-current={active ? "page" : undefined}
                className={
                  "rounded-full transition-all " +
                  (active
                    ? "h-2 w-6 bg-ink"
                    : "h-1.5 w-1.5 bg-ink/30 hover:bg-ink/60")
                }
              />
            );
          })}
        </div>

        <span className="px-2 font-mono text-[11px] tabular-nums text-muted sm:hidden">
          {String(currentPage + 1).padStart(2, "0")} ·{" "}
          {String(totalPages).padStart(2, "0")}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={atEnd}
          aria-label="Next page"
          className="grid h-9 w-9 place-items-center rounded-full text-ink/80 transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
