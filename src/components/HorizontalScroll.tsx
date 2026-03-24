"use client";

import { motion, useTransform, useScroll } from "framer-motion";
import { useRef, ReactNode } from "react";

export function HorizontalScroll({ children, title }: { children: ReactNode, title?: string }) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-70%"]);

  return (
    <section ref={targetRef} className="relative h-[250vh] bg-foreground text-background">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {title && (
            <div className="absolute top-32 left-6 md:left-24 z-10">
                <h2 className="text-xs tracking-[0.2em] font-bold text-background/50 uppercase">{title}</h2>
            </div>
        )}
        <motion.div style={{ x }} className="flex gap-16 px-6 md:px-24">
          {children}
        </motion.div>
      </div>
    </section>
  );
}
