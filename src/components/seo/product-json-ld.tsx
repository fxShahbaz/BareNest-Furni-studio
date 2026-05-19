import { SITE_URL, SHOWROOM, absoluteUrl } from "@/lib/utils";
import type { Product } from "@/lib/products";
import JsonLd from "./json-ld";

// Product + Offer structured data. Uses InStock by default; surface
// availability per piece if you start tracking stock per slug.
export default function ProductJsonLd({ product }: { product: Product }) {
  const url = `${SITE_URL}/shop/${product.slug}`;
  const orgId = `${SITE_URL}/#organization`;

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url,
    name: product.name,
    description: product.description || product.tagline,
    sku: product.slug,
    mpn: product.slug,
    category: product.category,
    image: product.images.map((u) => absoluteUrl(u)),
    brand: { "@type": "Brand", name: SHOWROOM.brand },
    manufacturer: { "@id": orgId },
    material: product.material,
    additionalProperty: product.dimensions
      ? [
          {
            "@type": "PropertyValue",
            name: "Dimensions",
            value: product.dimensions,
          },
        ]
      : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": orgId },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 3,
            maxValue: 14,
            unitCode: "DAY",
          },
        },
      },
    },
  };

  return <JsonLd data={data} />;
}
