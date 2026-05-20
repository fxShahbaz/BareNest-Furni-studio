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
  // Google's logo-pickup expects a roughly-square image with the mark on
  // a solid background. /logo-square.png is generated from logo-mark.png
  // at build time with a bone backdrop. The wide /logo.png stays as the
  // social `image` for unfurl previews that prefer landscape.
  const logoUrl = absoluteUrl("/logo-square.png");
  const socialImageUrl = absoluteUrl("/logo.png");

  // Top-level navigation, surfaced to Google as candidates for sitelinks.
  const navLinks: { name: string; url: string }[] = [
    { name: "Shop", url: absoluteUrl("/shop") },
    { name: "Collections", url: absoluteUrl("/collections") },
    { name: "Materials", url: absoluteUrl("/materials") },
    { name: "Showroom", url: absoluteUrl("/showroom") },
    { name: "Our Story", url: absoluteUrl("/story") },
    { name: "Blog", url: absoluteUrl("/blog") },
    { name: "Contact", url: absoluteUrl("/contact") },
  ];

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SHOWROOM.brand,
        alternateName: ["Bare Nest", "barenest"],
        legalName: SHOWROOM.studio,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
          width: 512,
          height: 512,
        },
        image: socialImageUrl,
        email: SHOWROOM.email,
        slogan: "Honest wood furniture. No particle board, ever.",
        founder: {
          "@type": "Person",
          name: SHOWROOM.founder,
        },
        foundingDate: "2018",
        description:
          "Honest solid wood and MDF furniture, hand-finished in Patna. We do not stock particle board.",
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
        alternateName: SHOWROOM.studio,
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
      // Explicit nav candidates for Google's sitelinks algorithm. It picks
      // sitelinks heuristically from internal anchors anyway, but giving
      // it a curated list reduces the chance of it surfacing low-value
      // pages (auth screens, etc).
      ...navLinks.map((link) => ({
        "@type": "SiteNavigationElement",
        name: link.name,
        url: link.url,
        isPartOf: { "@id": websiteId },
      })),
    ],
  };

  return <JsonLd data={graph} />;
}
