import { SITE_URL, absoluteUrl } from "@/lib/utils";
import type { Product } from "@/lib/products";
import JsonLd from "./json-ld";

// CollectionPage + ItemList for the /shop catalogue. Helps Google
// understand that this page is the entry point to a structured product
// listing, and lets it associate the individual Product entries (rendered
// on each /shop/[slug]) with this collection.
export default function CatalogueJsonLd({
  products,
  url,
  name = "Shop",
  description = "Solid wood and MDF furniture, hand-made in Patna. The full bare nest catalogue.",
}: {
  products: Product[];
  url: string;
  name?: string;
  description?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": absoluteUrl(url),
    url: absoluteUrl(url),
    name,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/shop/${p.slug}`,
        name: p.name,
      })),
    },
  };

  return <JsonLd data={data} />;
}
