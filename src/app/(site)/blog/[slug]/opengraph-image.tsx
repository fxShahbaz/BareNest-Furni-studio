import { ImageResponse } from "next/og";
import { getPostBySlug, formatPostDate } from "@/lib/blog";
import { SHOWROOM } from "@/lib/utils";

export const alt = "bare nest blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    // Fallback so the route always returns a valid image.
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ede7da",
            color: "#14110e",
            fontSize: 48,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {SHOWROOM.brand}
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f6f3ec",
          color: "#14110e",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Left — text panel */}
        <div
          style={{
            flex: "1 1 60%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 56px",
          }}
        >
          {/* Brand chip */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#14110e",
                color: "#f6f3ec",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              B
            </div>
            <span style={{ fontSize: 22, fontWeight: 600 }}>
              {SHOWROOM.brand}
            </span>
            <span style={{ fontSize: 18, color: "#7a6f5e", marginLeft: 8 }}>
              · Blog
            </span>
          </div>

          {/* Headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p
              style={{
                fontSize: 14,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#5a3a22",
                margin: 0,
              }}
            >
              {formatPostDate(post.date)} · {post.readingMinutes} min read
            </p>
            <h1
              style={{
                fontSize: 56,
                lineHeight: 1.08,
                letterSpacing: -1.5,
                fontWeight: 700,
                margin: 0,
                maxWidth: 620,
                // 4-line clamp for very long titles
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 4,
                overflow: "hidden",
              }}
            >
              {post.title}
            </h1>
          </div>

          {/* Author + URL */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(20,17,14,0.12)",
              paddingTop: 18,
              fontSize: 18,
              color: "#5a3a22",
            }}
          >
            <span>By {post.author}</span>
            <span style={{ letterSpacing: 2, textTransform: "uppercase" }}>
              barenest.in
            </span>
          </div>
        </div>

        {/* Right — cover image */}
        <div
          style={{
            flex: "1 1 40%",
            display: "flex",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover}
            alt=""
            width={520}
            height={630}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
