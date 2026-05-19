import { ImageResponse } from "next/og";

// Apple touch icon (iOS home-screen, Safari pinned tabs). Apple prefers
// a non-transparent square with brand colours; rounding is applied by
// the OS at install time.

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2c1a0e",
          color: "#f6f3ec",
          fontFamily: "system-ui, sans-serif",
          fontSize: 120,
          fontWeight: 700,
          letterSpacing: -6,
        }}
      >
        B
      </div>
    ),
    { ...size }
  );
}
