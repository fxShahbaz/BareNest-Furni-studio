import JsonLd from "./json-ld";

export type FaqItem = { q: string; a: string };

// FAQPage structured data. Google may render the Q&A as an expandable
// rich result. Only include questions whose answers are accurate and
// helpful — irrelevant Q&A here can suppress all rich-result eligibility.
export default function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  };
  return <JsonLd data={data} />;
}
