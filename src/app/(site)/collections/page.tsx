import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

// Collections are static curation — refresh hourly.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Curated bare nest furniture sets — first-home bedroom, dining for six, the WFH desk-and-chair pair. Pieces that work together by design.",
  alternates: { canonical: "/collections" },
  openGraph: {
    title: "Collections — bare nest",
    description:
      "Curated furniture sets. First-home, dining, WFH — pieces that work together.",
    url: "/collections",
    type: "website",
  },
};

const COLLECTIONS = [
  {
    slug: "first-home",
    title: "The First-Home Set",
    note: "Bed + wardrobe + dressing table",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80",
  },
  {
    slug: "dining-evening",
    title: "Dining Evening",
    note: "Live-edge table + crockery + chandelier",
    image:
      "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=1400&q=80",
  },
  {
    slug: "working-from-home",
    title: "Working From Home",
    note: "Desk + bookshelf + sofa",
    image:
      "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1400&q=80",
  },
];

export default function CollectionsPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <p className="eyebrow text-muted">Curated collections</p>
        <h1 className="mt-3 font-display text-5xl tracking-tight md:text-7xl">
          Rooms, <span className="serif-italic">already&nbsp;solved.</span>
        </h1>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              href="/shop"
              className="group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 text-bone">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-bone/70">
                    {c.note}
                  </p>
                  <h3 className="mt-2 font-display text-3xl">{c.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
