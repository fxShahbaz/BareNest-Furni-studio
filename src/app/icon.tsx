import { ImageResponse } from "next/og";

// Dynamic favicon. Next renders this at /icon and uses it as the
// document's icon. 256x256 keeps it crisp at all tab sizes.

export const size = { width: 256, height: 256 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 168,
          fontWeight: 700,
          letterSpacing: -8,
          borderRadius: 56,
        }}
      >
        B
      </div>
    ),
    { ...size }
  );
}
