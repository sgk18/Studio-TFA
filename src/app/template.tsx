"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ y: 8 }}
      animate={{ y: 0 }}
      exit={{ y: -8 }}
      transition={{ duration: 0.26, ease: [0.25, 1, 0.5, 1] }}
      className="flex-1"
    >
      {children}
    </motion.div>
  );
}
