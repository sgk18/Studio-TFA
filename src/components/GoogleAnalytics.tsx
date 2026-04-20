"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const CONSENT_KEY = "tfa_cookie_consent";
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; // Placeholder

export function GoogleAnalytics() {
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    setConsent(saved);

    const handleUpdate = () => {
      setConsent(localStorage.getItem(CONSENT_KEY));
    };

    window.addEventListener("cookie-consent-updated", handleUpdate);
    return () => window.removeEventListener("cookie-consent-updated", handleUpdate);
  }, []);

  if (consent !== "accepted") return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
