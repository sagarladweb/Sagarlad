"use client";

import Script from "next/script";

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// GA4 via Google Tag Manager's gtag.js. Rendered only on the public site
// (SiteFrame skips it under /admin) and only when the env var is configured.
export function GoogleAnalytics() {
  if (!MEASUREMENT_ID) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${MEASUREMENT_ID}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
