import { SITE_URL, SHOWROOM, absoluteUrl } from "@/lib/utils";
import type { BlogPost } from "@/lib/blog";
import JsonLd from "./json-ld";

// BlogPosting structured data. The Organization reference uses the same
// @id as in site-json-ld so Google sees them as the same entity.
export default function BlogPostJsonLd({ post }: { post: BlogPost }) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const orgId = `${SITE_URL}/#organization`;

  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.title,
    description: post.excerpt,
    image: [absoluteUrl(post.cover)],
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author,
      url: `${SITE_URL}/story`,
    },
    publisher: { "@id": orgId },
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    wordCount: post.body.trim().split(/\s+/).length,
    keywords: [
      "furniture",
      "solid wood",
      "MDF",
      "Patna",
      SHOWROOM.brand,
    ],
  };

  return <JsonLd data={data} />;
}
