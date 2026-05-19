import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // We pre-optimize every uploaded image with sharp at write time (see
    // src/lib/image-optimize.ts). The bytes already in Supabase are the
    // final bytes we want to serve, so we DON'T want Vercel's on-demand
    // image-optimization service rewriting them at request time. This
    // makes us portable (no Vercel coupling) and avoids the per-image
    // transform billing on production.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "pclznjjlifrgjyencihe.supabase.co",
        pathname: "/storage/v1/object/public/product-images/**",
      },
    ],
  },
  experimental: {
    // Checkout uploads up to 6 room photos × 8MB each via a server action.
    // Default cap is 1MB and would reject the very first photo.
    serverActions: {
      bodySizeLimit: "60mb",
    },
  },
};

export default nextConfig;
