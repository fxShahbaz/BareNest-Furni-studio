import Script from "next/script";

// GA4 loader. Renders nothing unless NEXT_PUBLIC_GA_ID is set, so it's
// safe to leave mounted in the root layout — pre-launch builds emit no
// scripts and ship no third-party requests.
//
// Set NEXT_PUBLIC_GA_ID in Vercel (format: G-XXXXXXXXXX) and the loader
// activates on the next deploy. `strategy="afterInteractive"` keeps the
// gtag bootstrap off the critical path.
export default function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
