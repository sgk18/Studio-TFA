"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const headlineLines = ["Objects of faith", "for homes that", "hold sacred stories."];

export function EditorialHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative isolate min-h-[95dvh] overflow-hidden px-6 pb-16 pt-40 md:px-10 md:pt-48">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-16%] h-[28rem] w-[28rem] rounded-full bg-primary/16 blur-[88px]" />
        <div className="absolute bottom-[-18%] right-[-7%] h-[30rem] w-[30rem] rounded-full bg-[#786825]/16 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.58),transparent_42%),radial-gradient(circle_at_88%_14%,rgba(224,174,186,0.22),transparent_34%)]" />
      </div>

      <div className="container mx-auto max-w-7xl">
        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.25 : 0.65, ease: "easeOut" }}
          className="mb-8 text-xs font-bold uppercase tracking-[0.3em] text-primary"
        >
          Studio TFA Editorial Collection
        </motion.p>

        <h1 className="max-w-6xl font-heading text-[clamp(2.7rem,7.9vw,7.2rem)] leading-[0.95] tracking-[-0.02em] text-foreground">
          {headlineLines.map((line, index) => (
            <motion.span
              key={line}
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 26,
                filter: shouldReduceMotion ? "blur(0px)" : "blur(8px)",
              }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: shouldReduceMotion ? 0.2 : 0.7,
                ease: "easeOut",
                delay: shouldReduceMotion ? 0 : 0.14 * index,
              }}
              className="block"
            >
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.6,
            ease: "easeOut",
            delay: shouldReduceMotion ? 0 : 0.44,
          }}
          className="mt-10 max-w-2xl text-lg leading-relaxed text-foreground/78 md:text-xl"
        >
          A curated storefront of Christ-centered design, crafted for women and families who want their spaces to whisper truth, beauty, and belonging.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.55,
            ease: "easeOut",
            delay: shouldReduceMotion ? 0 : 0.58,
          }}
          className="mt-12 flex flex-wrap items-center gap-3"
        >
          <Link href="/collections" className="action-pill-link">
            Explore Collections
          </Link>
          <Link href="/community" className="action-pill-link">
            View Community Gallery
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
