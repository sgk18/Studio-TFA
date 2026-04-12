"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import type { ReactNode } from "react";

export function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        duration: 1.15,
        smoothWheel: true,
        syncTouch: true,
        wheelMultiplier: 0.92,
        touchMultiplier: 1,
      }}
    >
      {children}
    </ReactLenis>
  );
}