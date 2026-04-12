"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  distance = 36,
  className,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  const directionOffset = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 }
  };

  const initial = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.985, filter: "blur(8px)", ...directionOffset[direction] };

  const whileInView = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" };

  const transition = shouldReduceMotion
    ? { duration: 0.32, delay, ease: [0, 0, 0.58, 1] as const }
    : { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <motion.div
      initial={initial}
      whileInView={whileInView}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={transition}
      className={className}
      style={{ willChange: shouldReduceMotion ? "opacity" : "opacity, transform, filter" }}
    >
      {children}
    </motion.div>
  );
}
