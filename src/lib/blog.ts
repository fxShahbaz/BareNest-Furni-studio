import { marked } from "marked";
import { POSTS } from "@/content/blog/posts";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  date: string; // ISO yyyy-mm-dd
  readingMinutes: number;
  author: string;
  body: string; // markdown source
  // Optional HowTo schema payload — set on instructional posts so Google
  // can render step cards in search results.
  howTo?: {
    name: string;
    description: string;
    totalTime?: string; // ISO 8601 duration like "PT15M"
    steps: { name: string; text: string }[];
  };
};

// Configure marked to be predictable: GFM on, no header IDs (we own the
// layout), and breaks left at default since posts use blank-line paras.
marked.setOptions({
  gfm: true,
});

export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | null {
  return POSTS.find((p) => p.slug === slug) ?? null;
}

export function renderMarkdown(source: string): string {
  // Content is studio-authored, not user-submitted, so we trust the input.
  // If you ever accept untrusted markdown (comments, etc.), add DOMPurify
  // server-side before rendering.
  return marked.parse(source.trim(), { async: false }) as string;
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
