import { absoluteUrl } from "@/lib/utils";
import JsonLd from "./json-ld";

export type HowToStep = { name: string; text: string };

export type HowToData = {
  name: string;
  description: string;
  image?: string; // absolute or path
  totalTime?: string; // ISO 8601 duration, e.g. PT3M
  steps: HowToStep[];
};

// HowTo structured data. Eligible for Google's step-card carousel in
// search results when the steps are clear, numbered, and accurate.
export default function HowToJsonLd({ data }: { data: HowToData }) {
  const payload = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: data.name,
    description: data.description,
    image: data.image ? [absoluteUrl(data.image)] : undefined,
    totalTime: data.totalTime,
    step: data.steps.map((s, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: s.name,
      text: s.text,
    })),
  };

  return <JsonLd data={payload} />;
}
