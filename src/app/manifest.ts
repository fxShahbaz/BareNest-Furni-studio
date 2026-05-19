import type { MetadataRoute } from "next";
import { SHOWROOM } from "@/lib/utils";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SHOWROOM.brand} — ${SHOWROOM.studio}`,
    short_name: SHOWROOM.brand,
    description:
      "Honest solid wood and MDF furniture, made in Patna. Bare Nest Furni Studio.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f3ec",
    theme_color: "#2c1a0e",
    lang: "en-IN",
    categories: ["shopping", "lifestyle", "furniture"],
    icons: [
      {
        src: "/icon",
        sizes: "256x256",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo-mark.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo-mark.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
