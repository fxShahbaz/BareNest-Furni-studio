import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, Caveat } from "next/font/google";
import ReactDOM from "react-dom";
import "./globals.css";
import SiteJsonLd from "@/components/seo/site-json-ld";
import GoogleAnalytics from "@/components/seo/google-analytics";
import ServiceWorkerRegister from "@/components/service-worker-register";
import LandingAudio from "@/components/landing-audio";
import { SITE_URL, SHOWROOM } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
  style: ["normal", "italic"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
});

const DEFAULT_TITLE = `${SHOWROOM.brand} — ${SHOWROOM.studio}`;
const DEFAULT_DESCRIPTION =
  "Honest solid wood and MDF furniture, made in Patna. Founded by Gaurav Bahri. Showroom inaugurates 18 June 2026.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s — ${SHOWROOM.brand}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SHOWROOM.brand,
  authors: [{ name: SHOWROOM.founder }],
  creator: SHOWROOM.studio,
  publisher: SHOWROOM.studio,
  keywords: [
    "solid wood furniture",
    "MDF furniture",
    "furniture Patna",
    "Bihar furniture studio",
    "sheesham furniture",
    "teak furniture",
    "custom furniture India",
    "honest furniture",
    "no particle board",
    "Bare Nest Furni Studio",
    "bare nest",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: SHOWROOM.brand,
    locale: "en_IN",
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: `${SHOWROOM.brand} — ${SHOWROOM.studio}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  // Site-ownership verification tokens. Set the matching env vars in
  // Vercel (or .env.local for dev) to emit the corresponding meta tags
  // without redeploying for every search engine you add.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: {
      ...(process.env.BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
        : {}),
      ...(process.env.YANDEX_SITE_VERIFICATION
        ? { "yandex-verification": process.env.YANDEX_SITE_VERIFICATION }
        : {}),
    },
  },
  // icon.tsx + apple-icon.tsx + manifest.ts at the app root handle these
  // automatically via Next's file conventions.
  category: "Furniture",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#2c1a0e" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Warm the TLS connection to Unsplash so the first product image
  // paints faster. Next 16 prefers ReactDOM hints over <head> JSX.
  ReactDOM.preconnect("https://images.unsplash.com", { crossOrigin: "anonymous" });
  ReactDOM.prefetchDNS("https://images.unsplash.com");

  return (
    <html
      lang="en-IN"
      className={`${inter.variable} ${fraunces.variable} ${caveat.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bone text-ink overflow-x-hidden">
        {/* Preload + mount the background loop at the root so it survives
            every route-group switch (site ↔ invite ↔ booklet). The
            component itself opts out on /admin so admin work stays quiet. */}
        <link
          rel="preload"
          as="audio"
          href="/audio/landing.mp3"
          type="audio/mpeg"
        />
        <LandingAudio />
        <SiteJsonLd />
        <GoogleAnalytics />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
