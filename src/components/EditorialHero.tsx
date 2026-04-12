"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const headlineLines = [
  "Objects of faith",
  "for homes that",
  "hold sacred stories.",
];

const LUXURY_EASE = [0.25, 1, 0.5, 1] as const;

export function EditorialHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative isolate min-h-[100dvh] overflow-hidden px-6 pb-24 pt-44 md:px-14 md:pt-52 lg:pt-56">
      {/* Architectural background — pure cream with one soft bloom */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-[-8%] top-[-20%] h-[36rem] w-[36rem] rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, rgba(224,174,186,0.30) 0%, transparent 70%)", filter: "blur(72px)" }}
        />
        <div
          className="absolute bottom-[-14%] right-[-5%] h-[28rem] w-[28rem] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, rgba(120,104,37,0.18) 0%, transparent 70%)", filter: "blur(88px)" }}
        />
      </div>

      <div className="container mx-auto max-w-7xl">
        {/* Overline */}
        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.2 : 0.70, ease: LUXURY_EASE }}
          className="overline mb-10"
        >
          Studio TFA · Editorial Collection
        </motion.p>

        {/* Headline — massive Bodoni Moda editorial treatment */}
        <h1 className="max-w-6xl font-heading leading-[0.92] tracking-[-0.03em] text-foreground"
            style={{ fontSize: "var(--type-hero)" }}>
          {headlineLines.map((line, index) => (
            <motion.span
              key={line}
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 32,
                filter: shouldReduceMotion ? "blur(0px)" : "blur(12px)",
              }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: shouldReduceMotion ? 0.2 : 0.85,
                ease: LUXURY_EASE,
                delay: shouldReduceMotion ? 0 : 0.16 * index,
              }}
              className="block"
            >
              {/* Italicize last line for editorial contrast */}
              {index === headlineLines.length - 1
                ? <em className="not-italic" style={{ fontStyle: "italic" }}>{line}</em>
                : line}
            </motion.span>
          ))}
        </h1>

        {/* Body */}
        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.70,
            ease: LUXURY_EASE,
            delay: shouldReduceMotion ? 0 : 0.52,
          }}
          className="mt-12 max-w-xl text-foreground/70 leading-relaxed"
          style={{ fontSize: "var(--type-lg)" }}
        >
          A curated storefront of Christ-centered design — crafted for women and families who want their spaces to whisper truth, beauty, and belonging.
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.60,
            ease: LUXURY_EASE,
            delay: shouldReduceMotion ? 0 : 0.66,
          }}
          className="mt-14 flex flex-wrap items-center gap-4"
        >
          <Link href="/collections" className="action-pill-link">
            Explore Collections
          </Link>
          <Link href="/community" className="action-pill-link">
            View Gallery
          </Link>
        </motion.div>

        {/* Elegant editorial rule + scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: shouldReduceMotion ? 0 : 1.1 }}
          className="mt-24 flex items-center gap-6"
        >
          <hr className="editorial-rule flex-1" />
          <span className="overline opacity-50">Scroll to discover</span>
          <hr className="editorial-rule w-12" />
        </motion.div>
      </div>
    </section>
  );
}
