import { ImageResponse } from "next/og";
import { SHOWROOM } from "@/lib/utils";

// Default OG card for the home page + any (site) route that doesn't ship
// its own opengraph-image.tsx. 1200x630 — Twitter/LinkedIn/WhatsApp/Slack
// all expect this exact ratio.

export const alt = "BareNest — Bare Nest Furni Studio, Patna";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #f6f3ec 0%, #ede7da 60%, #d8cdb6 100%)",
          color: "#14110e",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top row — brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#14110e",
              color: "#f6f3ec",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          >
            B
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>
              {SHOWROOM.brand}
            </span>
            <span style={{ fontSize: 18, color: "#7a6f5e" }}>
              {SHOWROOM.studio} · {SHOWROOM.city}
            </span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p
            style={{
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#5a3a22",
              margin: 0,
            }}
          >
            Honest furniture · Patna
          </p>
          <h1
            style={{
              fontSize: 84,
              lineHeight: 1.05,
              letterSpacing: -2,
              fontWeight: 700,
              margin: 0,
              maxWidth: 900,
            }}
          >
            Solid wood &amp; MDF.{"\n"}No particle board, ever.
          </h1>
        </div>

        {/* Footer — opening date + accent line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(20,17,14,0.15)",
            paddingTop: 24,
          }}
        >
          <span style={{ fontSize: 22, color: "#5a3a22" }}>
            Opening 18 June 2026
          </span>
          <span
            style={{
              fontSize: 22,
              color: "#7a6f5e",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            barenest.in
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
