import { absoluteUrl } from "@/lib/utils";
import JsonLd from "./json-ld";

export type Crumb = { name: string; path: string };

// Renders BreadcrumbList structured data. Pass an ordered list — Home is
// implicit at position 1 unless you pass it explicitly.
export default function BreadcrumbsJsonLd({ crumbs }: { crumbs: Crumb[] }) {
  const full =
    crumbs[0]?.path === "/"
      ? crumbs
      : [{ name: "Home", path: "/" } as Crumb, ...crumbs];

  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: full.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };

  return <JsonLd data={data} />;
}
