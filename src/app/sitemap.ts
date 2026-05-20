import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils";
import { getAllPosts } from "@/lib/blog";
import { getAllProducts } from "@/lib/queries/products";

// Static, indexable routes. Order influences nothing — the priority field
// is more meaningful to crawlers.
const STATIC_PAGES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/collections", changeFrequency: "weekly", priority: 0.7 },
  { path: "/story", changeFrequency: "monthly", priority: 0.8 },
  { path: "/showroom", changeFrequency: "monthly", priority: 0.8 },
  { path: "/materials", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/returns", changeFrequency: "yearly", priority: 0.4 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })
  );

  // Blog posts — lastModified set to the post's date so search engines
  // see fresh updates when we publish.
  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Product pages — pulled live from Supabase. Fail-soft: a DB hiccup
  // shouldn't blank out the entire sitemap.
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await getAllProducts();
    productEntries = products.map((p) => ({
      url: `${SITE_URL}/shop/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    console.error("[sitemap] product fetch failed:", err);
  }

  return [...staticEntries, ...blogEntries, ...productEntries];
}
