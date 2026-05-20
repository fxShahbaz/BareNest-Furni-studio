import { SITE_URL, SHOWROOM, absoluteUrl } from "@/lib/utils";
import JsonLd from "./json-ld";

// Event structured data for the studio inauguration on 18 June 2026.
// Eligible for Google's events carousel for queries like
// "furniture studio launch Patna" or "events in Bihar June 2026".
//
// Render this on the home page and on /showroom — both pages where the
// launch is the primary CTA. Google de-duplicates by @id so multiple
// renders won't double-count.
export default function LaunchEventJsonLd() {
  const eventId = `${SITE_URL}/#launch-2026-06-18`;
  const orgId = `${SITE_URL}/#organization`;
  const venueId = `${SITE_URL}/#localbusiness`;

  // Inauguration is at 19:00 IST; we don't have an end time so default
  // to +3 hours which is a typical opening ceremony slot.
  const start = SHOWROOM.inaugurationISO; // "2026-06-18T19:00:00+05:30"
  const end = "2026-06-18T22:00:00+05:30";

  const data = {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": eventId,
    name: `${SHOWROOM.studio} — Inauguration`,
    description: `${SHOWROOM.studio} opens to the public. Solid wood and MDF furniture, honestly made, in Patna. Founded by ${SHOWROOM.founder}.`,
    startDate: start,
    endDate: end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@id": venueId,
      "@type": "Place",
      name: SHOWROOM.studio,
      address: {
        "@type": "PostalAddress",
        streetAddress: SHOWROOM.address.streetAddress,
        addressLocality: SHOWROOM.address.locality,
        addressRegion: SHOWROOM.address.region,
        postalCode: SHOWROOM.address.postalCode,
        addressCountry: SHOWROOM.address.country,
      },
    },
    image: [absoluteUrl("/logo.png")],
    organizer: { "@id": orgId },
    performer: {
      "@type": "Person",
      name: SHOWROOM.founder,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/showroom`,
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      validFrom: "2026-04-01T00:00:00+05:30",
    },
    isAccessibleForFree: true,
    inLanguage: "en-IN",
  };

  return <JsonLd data={data} />;
}
