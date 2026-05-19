import type { Metadata } from "next";
import { Inter, Fraunces, Caveat } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "BareNest — Bare Nest Furni Studio",
  description:
    "Solid wood and MDF furniture, thoughtfully made. Founded by Gaurav Bahri. Showroom inaugurates 18 June 2026.",
  openGraph: {
    title: "BareNest — Bare Nest Furni Studio",
    description:
      "Solid wood and MDF furniture, thoughtfully made. Showroom inaugurates 18 June 2026.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${caveat.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bone text-ink overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
