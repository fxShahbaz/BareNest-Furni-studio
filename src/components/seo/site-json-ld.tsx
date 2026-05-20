import { SITE_URL, SHOWROOM, absoluteUrl } from "@/lib/utils";
import JsonLd from "./json-ld";

// Site-wide structured data. Three @graph entries:
//   - Organization (about the studio, including contact + sameAs)
//   - LocalBusiness (FurnitureStore, with Patna address + opening hours)
//   - WebSite (with a SearchAction so Google can render a sitelinks
//     search box if/when the studio earns sitelinks)
//
// Rendered once in the root layout — applies to every page.
export default function SiteJsonLd() {
  const orgId = `${SITE_URL}/#organization`;
  const businessId = `${SITE_URL}/#localbusiness`;
  const websiteId = `${SITE_URL}/#website`;
  const logoUrl = absoluteUrl("/logo.png");

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SHOWROOM.brand,
        legalName: SHOWROOM.studio,
        url: SITE_URL,
        logo: logoUrl,
        image: logoUrl,
        email: SHOWROOM.email,
        founder: {
          "@type": "Person",
          name: SHOWROOM.founder,
        },
        foundingDate: "2018",
        description:
          "Honest solid wood and MDF furniture, made in Patna. We do not stock particle board.",
        sameAs: [
          SHOWROOM.socials.instagram,
          SHOWROOM.socials.youtube,
          SHOWROOM.socials.x,
        ].filter(Boolean),
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: `+${SHOWROOM.whatsappE164}`,
            contactType: "customer service",
            areaServed: "IN",
            availableLanguage: ["en", "hi"],
          },
        ],
      },
      {
        "@type": ["LocalBusiness", "FurnitureStore"],
        "@id": businessId,
        name: SHOWROOM.studio,
        url: SITE_URL,
        image: logoUrl,
        logo: logoUrl,
        email: SHOWROOM.email,
        telephone: `+${SHOWROOM.whatsappE164}`,
        priceRange: "₹₹-₹₹₹",
        currenciesAccepted: "INR",
        paymentAccepted: ["Cash", "UPI", "Credit Card", "Debit Card"],
        address: {
          "@type": "PostalAddress",
          streetAddress: SHOWROOM.address.streetAddress,
          addressLocality: SHOWROOM.address.locality,
          addressRegion: SHOWROOM.address.region,
          postalCode: SHOWROOM.address.postalCode,
          addressCountry: SHOWROOM.address.country,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 25.5941,
          longitude: 85.1376,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
            opens: "09:30",
            closes: "19:00",
          },
        ],
        founder: { "@id": orgId },
        parentOrganization: { "@id": orgId },
        knowsAbout: [
          "Solid wood furniture",
          "MDF furniture",
          "Sheesham furniture",
          "Teak furniture",
          "Custom furniture",
          "Hand-finished furniture",
        ],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: SITE_URL,
        name: SHOWROOM.brand,
        description: `${SHOWROOM.studio} — honest furniture in Patna.`,
        publisher: { "@id": orgId },
        inLanguage: "en-IN",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return <JsonLd data={graph} />;
}
