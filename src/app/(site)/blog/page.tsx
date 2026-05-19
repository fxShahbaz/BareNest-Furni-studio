import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllPosts, formatPostDate } from "@/lib/blog";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes from the workshop: materials, process, buying guides, and dispatches from Bare Nest Furni Studio in Patna.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — BareNest",
    description:
      "Editorial posts on solid wood, MDF, furniture buying, and life at the studio.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="pt-28 pb-24 md:pt-36">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        {/* Header */}
        <div className="max-w-[60ch]">
          <p className="eyebrow text-muted">Blog</p>
          <h1 className="mt-3 font-display text-5xl tracking-tight md:text-7xl">
            Notes from the <span className="serif-italic">workshop.</span>
          </h1>
          <p className="mt-5 text-muted md:text-lg">
            Materials, joinery, room-by-room thinking, and dispatches from
            the studio in Patna. Short reads, written by the maker.
          </p>
        </div>

        {/* Featured + rest */}
        {posts.length === 0 ? (
          <div className="mt-20 rounded-3xl border border-ink/10 bg-cream/40 p-12 text-center">
            <p className="text-muted">
              First posts drop in the lead-up to launch. Drop your email in
              the footer to get them as they go up.
            </p>
          </div>
        ) : (
          <>
            {featured && <FeaturedCard post={featured} />}

            {rest.length > 0 && (
              <ul className="mt-12 grid gap-8 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <li key={p.slug}>
                    <PostCard post={p} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FeaturedCard({ post }: { post: ReturnType<typeof getAllPosts>[number] }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group mt-14 block overflow-hidden rounded-3xl border border-ink/10 md:mt-20"
    >
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto">
          <Image
            src={post.cover}
            alt={post.title}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </div>
        <div className="flex flex-col justify-center bg-cream/40 p-8 md:p-12">
          <p className="eyebrow text-muted">
            Latest · {formatPostDate(post.date)} · {post.readingMinutes} min read
          </p>
          <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight md:text-5xl">
            {post.title}
          </h2>
          <p className="mt-5 max-w-prose text-sm text-muted md:text-base">
            {post.excerpt}
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm">
            Read post
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: ReturnType<typeof getAllPosts>[number] }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-2xl border border-ink/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={post.cover}
          alt={post.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div className="bg-bone p-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
          {formatPostDate(post.date)} · {post.readingMinutes} min
        </p>
        <h3 className="mt-2 font-display text-xl leading-snug tracking-tight">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted">{post.excerpt}</p>
      </div>
    </Link>
  );
}
