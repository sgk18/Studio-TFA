"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";

export function StaggeredText({ text, className = "" }: { text: string; className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(" ");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0.02 : 0.06,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const child: Variants = {
    visible: shouldReduceMotion
      ? {
          opacity: 1,
          y: 0,
          transition: { duration: 0.2, ease: "easeOut" },
        }
      : {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: {
            type: "spring",
            stiffness: 240,
            damping: 24,
            mass: 0.45,
          },
        },
    hidden: shouldReduceMotion
      ? { opacity: 0, y: 4 }
      : { opacity: 0, y: 26, filter: "blur(7px)" },
  };

  return (
    <motion.div
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", justifyContent: "inherit" }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-12% 0px" }}
      className={className}
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          style={{ marginRight: "0.25em", willChange: shouldReduceMotion ? "opacity" : "opacity, transform, filter" }}
          key={`${word}-${index}`}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
