"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";

export function HorizontalScroll({ children, title }: { children: ReactNode, title?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 26,
    mass: 0.35,
  });

  const x = useTransform(smoothProgress, [0, 1], ["0%", "-72%"]);

  return (
    <section ref={targetRef} className="relative h-[270vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="absolute inset-0 md:inset-6 glass-shell md:rounded-[2rem]" />
        {title && (
            <div className="absolute top-32 left-6 md:left-24 z-10">
                <h2 className="text-xs tracking-[0.2em] font-bold text-muted-foreground uppercase">{title}</h2>
            </div>
        )}
        <motion.div
          style={{ x: shouldReduceMotion ? 0 : x, willChange: "transform" }}
          className="relative z-10 flex gap-8 md:gap-12 px-6 md:px-24"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
