"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, ShieldCheck } from "lucide-react";

const CONSENT_COOKIE = "studiotfa_cookie_consent";
type ConsentChoice = "all" | "necessary";

function readConsentChoice(): ConsentChoice | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookieEntry = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE}=`));

  if (!cookieEntry) {
    return null;
  }

  const value = decodeURIComponent(cookieEntry.split("=").slice(1).join("="));

  return value === "all" || value === "necessary" ? value : null;
}

function writeConsentChoice(choice: ConsentChoice) {
  const secureAttribute = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${choice}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax${secureAttribute}`;
}

export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsVisible(readConsentChoice() === null);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleChoice = (choice: ConsentChoice) => {
    writeConsentChoice(choice);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.section
          key="cookie-banner"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="fixed bottom-4 left-1/2 z-[60] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2"
          aria-label="Cookie consent banner"
          role="dialog"
          aria-live="polite"
        >
          <div className="glass-shell overflow-hidden rounded-[1.75rem] border border-border/70 px-5 py-5 shadow-[0_20px_60px_rgba(139,38,62,0.16)] sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-xl space-y-3">
                <div className="flex items-center gap-3 text-primary">
                  <Cookie className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-[0.24em]">Cookie consent</span>
                </div>
                <h2 className="font-heading text-2xl tracking-[0.12em] text-foreground">
                  Your privacy, handled carefully.
                </h2>
                <p className="text-sm leading-6 text-foreground/72 sm:text-[0.96rem]">
                  Studio TFA uses essential cookies for cart, checkout, security, and session continuity. Optional cookies are only enabled after explicit consent, in line with GDPR and DPDP expectations.
                </p>
                <p className="text-xs uppercase tracking-[0.22em] text-foreground/55">
                  Read more in our <Link href="/privacy-policy" className="text-primary underline-offset-4 hover:underline">Privacy Policy</Link>.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:min-w-52">
                <button
                  type="button"
                  onClick={() => handleChoice("all")}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-primary/30 bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px"
                >
                  Accept all
                </button>
                <button
                  type="button"
                  onClick={() => handleChoice("necessary")}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-border/70 bg-background px-5 text-sm font-semibold text-foreground transition-transform hover:-translate-y-px"
                >
                  Essential only
                </button>
                <div className="flex items-center justify-center gap-2 text-[0.72rem] uppercase tracking-[0.22em] text-foreground/50">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  DPDP + GDPR ready
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}