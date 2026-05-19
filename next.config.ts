import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
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
