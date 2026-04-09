"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import Image from "next/image";

export function ParallaxImage({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-56, 56]);
  const y = useSpring(rawY, { stiffness: 96, damping: 24, mass: 0.38 });

  const rawScale = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [1, 1] : [1.08, 1.03]);
  const scale = useSpring(rawScale, { stiffness: 110, damping: 30, mass: 0.32 });

  const rawOpacity = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [1, 1] : [0.93, 1]);
  const opacity = useSpring(rawOpacity, { stiffness: 120, damping: 28, mass: 0.35 });

  return (
    <div ref={ref} className="relative w-full h-full overflow-hidden bg-muted group">
      <motion.div
        style={{ y, scale, opacity }}
        className="absolute inset-x-0 -top-[12%] w-full h-[124%] will-change-transform"
      >
        <Image 
          src={src} 
          alt={alt} 
          fill 
          priority={priority} 
          className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:scale-[1.03]" 
        />
      </motion.div>
    </div>
  );
}
