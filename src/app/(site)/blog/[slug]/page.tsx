import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  getAllPosts,
  getPostBySlug,
  renderMarkdown,
  formatPostDate,
} from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not found — BareNest" };
  return {
    title: `${post.title} — BareNest Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: [post.cover],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = renderMarkdown(post.body);

  // Next/prev post for foot navigation.
  const all = getAllPosts();
  const idx = all.findIndex((p) => p.slug === post.slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <article className="pt-28 pb-24 md:pt-36">
      <div className="mx-auto max-w-[760px] px-6 md:px-8">
        {/* Back chip */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs text-muted transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <ArrowLeft className="h-3 w-3" />
          All posts
        </Link>

        {/* Meta */}
        <p className="mt-8 eyebrow text-muted">
          {formatPostDate(post.date)} · {post.readingMinutes} min read · By{" "}
          {post.author}
        </p>

        {/* Title */}
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight md:text-6xl">
          {post.title}
        </h1>

        {/* Lede */}
        <p className="mt-5 max-w-prose text-lg text-muted md:text-xl">
          {post.excerpt}
        </p>

        {/* Cover */}
        <div className="relative mt-10 aspect-[16/10] overflow-hidden rounded-3xl">
          <Image
            src={post.cover}
            alt={post.title}
            fill
            priority
            sizes="(min-width: 768px) 760px, 100vw"
            className="object-cover"
          />
        </div>

        {/* Body */}
        <div
          className="prose-bn mt-12"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Author */}
        <div className="mt-16 flex items-center gap-4 rounded-3xl border border-ink/10 bg-cream/40 p-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-bone">
            <span className="font-display text-base">
              {post.author
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm">
              Written by <span className="font-medium">{post.author}</span>
            </p>
            <p className="text-xs text-muted">
              Founder, Bare Nest Furni Studio · Patna
            </p>
          </div>
        </div>

        {/* Prev / Next */}
        {(prev || next) && (
          <nav
            aria-label="More posts"
            className="mt-12 grid gap-4 border-t border-ink/10 pt-8 md:grid-cols-2"
          >
            {prev ? (
              <Link
                href={`/blog/${prev.slug}`}
                className="group block rounded-2xl border border-ink/10 p-5 hover:bg-cream/40"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                  ← Newer
                </p>
                <p className="mt-2 font-display text-lg leading-tight">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/blog/${next.slug}`}
                className="group block rounded-2xl border border-ink/10 p-5 text-right hover:bg-cream/40"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                  Older →
                </p>
                <p className="mt-2 font-display text-lg leading-tight">
                  {next.title}
                </p>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-3xl border border-ink/10 bg-cream/40 p-8 text-center md:p-12">
          <p className="eyebrow text-muted">Doors open 18 June 2026</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
            Visit the studio in <span className="serif-italic">Patna.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[44ch] text-sm text-muted">
            See the materials in person, sit on the sofas, slam the drawer
            slides. We&apos;ll show you the difference.
          </p>
          <Link
            href="/showroom"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-bone"
          >
            Reserve a preview
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
