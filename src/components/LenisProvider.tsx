"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function LenisProvider() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      autoToggle: true,
      anchors: {
        offset: 24,
        duration: isCoarsePointer ? 0.95 : 1.15,
        easing: (t) => 1 - Math.pow(1 - t, 4),
      },
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      smoothWheel: true,
      syncTouch: true,
      lerp: isCoarsePointer ? 0.13 : 0.09,
      syncTouchLerp: 0.065,
      wheelMultiplier: isCoarsePointer ? 0.95 : 0.82,
      touchMultiplier: 1,
      touchInertiaExponent: 1.65,
    });

    const handleVisibilityChange = () => {
      if (document.hidden) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      lenis.destroy();
    };
  }, []);

  return null;
}