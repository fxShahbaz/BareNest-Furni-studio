import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/queries/products";
import { formatINR, SHOWROOM } from "@/lib/utils";

export const alt = "bare nest product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
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

  const cover = product.images?.[0];

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
        {/* Left — product image */}
        <div
          style={{
            flex: "1 1 55%",
            display: "flex",
            position: "relative",
            background: "#ede7da",
          }}
        >
          {cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={cover}
              alt=""
              width={660}
              height={630}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 64,
                color: "#7a6f5e",
              }}
            >
              {SHOWROOM.brand}
            </div>
          )}
        </div>

        {/* Right — text panel */}
        <div
          style={{
            flex: "1 1 45%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 56px",
          }}
        >
          {/* Brand */}
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
              · Shop
            </span>
          </div>

          {/* Product */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p
              style={{
                fontSize: 14,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#5a3a22",
                margin: 0,
              }}
            >
              {product.material} · {product.category}
            </p>
            <h1
              style={{
                fontSize: 56,
                lineHeight: 1.1,
                letterSpacing: -1.5,
                fontWeight: 700,
                margin: 0,
                maxWidth: 440,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
                overflow: "hidden",
              }}
            >
              {product.name}
            </h1>
            {product.tagline && (
              <p
                style={{
                  fontSize: 22,
                  color: "#7a6f5e",
                  margin: 0,
                  maxWidth: 440,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                }}
              >
                {product.tagline}
              </p>
            )}
          </div>

          {/* Price + URL */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(20,17,14,0.12)",
              paddingTop: 18,
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 700, color: "#14110e" }}>
              {formatINR(product.price)}
            </span>
            <span
              style={{
                fontSize: 18,
                color: "#5a3a22",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              barenest.in
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
