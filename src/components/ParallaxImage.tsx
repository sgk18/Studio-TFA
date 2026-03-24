"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

export function ParallaxImage({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <div ref={ref} className="relative w-full h-full overflow-hidden bg-muted group">
      <motion.div style={{ y }} className="absolute inset-0 w-full h-[130%] -top-[15%]">
        <Image 
          src={src} 
          alt={alt} 
          fill 
          priority={priority} 
          className="object-cover transition-transform duration-700 md:group-hover:scale-105" 
        />
      </motion.div>
    </div>
  );
}
