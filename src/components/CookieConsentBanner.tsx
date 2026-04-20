"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const CONSENT_KEY = "tfa_cookie_consent";
type ConsentChoice = "accepted" | "declined";

export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) {
      // Small delay for better entry feel
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!mounted) return null;

  const handleChoice = (choice: ConsentChoice) => {
    localStorage.setItem(CONSENT_KEY, choice);
    setIsVisible(false);
    // Reload if accepted to trigger GA script if needed, or we can handle it via custom component
    if (choice === "accepted") {
      window.dispatchEvent(new Event("cookie-consent-updated"));
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          key="cookie-banner"
          initial={{ opacity: 0, y: 40, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed bottom-6 left-1/2 z-[100] w-[calc(100vw-2.5rem)] max-w-2xl px-2"
          aria-label="Cookie consent banner"
        >
          <div className="glass-shell overflow-hidden rounded-[2rem] border border-primary/20 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-primary">
                  <div className="p-1.5 rounded-full bg-primary/10">
                    <Cookie className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Consent Policy</span>
                </div>
                <h2 className="font-heading text-2xl tracking-tight text-foreground">
                  Your privacy, <span className="italic">intentional</span>.
                </h2>
                <p className="max-w-md text-[13px] leading-relaxed text-foreground/60">
                  We use cookies to improve your experience and analytics. Essential cookies are always on, while optional ones help us understand your journey better. You control what we track.
                </p>
                <div className="flex items-center gap-4 pt-1">
                   <Link href="/privacy" className="text-[10px] font-bold uppercase tracking-widest text-primary/70 hover:text-primary underline underline-offset-4 decoration-primary/20">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-primary">
                    Terms
                  </Link>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:min-w-[200px]">
                <button
                  type="button"
                  onClick={() => handleChoice("accepted")}
                  className="group relative h-12 overflow-hidden rounded-full bg-primary px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Accept All
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChoice("declined")}
                  className="h-12 rounded-full border border-border/70 bg-background/50 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/60 transition-all hover:border-primary/30 hover:text-primary active:scale-[0.98]"
                >
                  Decline Non-Essential
                </button>
                <div className="flex items-center justify-center gap-2 pt-1 opacity-40">
                  <ShieldCheck className="h-3 w-3" />
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em]">DPDP + GDPR Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}