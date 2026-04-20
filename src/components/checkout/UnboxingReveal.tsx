"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Package, Sparkles } from "lucide-react";

interface UnboxingRevealProps {
  orderNumber: string;
}

export function UnboxingReveal({ orderNumber }: UnboxingRevealProps) {
  const [phase, setPhase] = useState<"boxed" | "opening" | "revealed">("boxed");

  useEffect(() => {
    const timer = setTimeout(() => setPhase("opening"), 800);
    const timer2 = setTimeout(() => setPhase("revealed"), 2200);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center py-20 min-h-[500px]">
      <AnimatePresence mode="wait">
        {phase !== "revealed" ? (
          <motion.div
            key="box"
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ 
              scale: phase === "opening" ? 1.1 : 1, 
              y: 0, 
              opacity: 1,
              rotate: phase === "opening" ? [0, -2, 2, -2, 2, 0] : 0
            }}
            exit={{ scale: 1.5, opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative h-48 w-48 bg-primary rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white/20">
              <Package className="h-20 w-20 text-white/40" />
              <motion.div 
                className="absolute inset-0 bg-white/10"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-white/20" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-white/20" />
            </div>
            
            {phase === "opening" && (
              <motion.div 
                className="absolute inset-0 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-2 w-2 rounded-full bg-primary"
                    animate={{ 
                      x: [0, (Math.random() - 0.5) * 300],
                      y: [0, (Math.random() - 0.5) * 300],
                      scale: [0, 1, 0],
                      opacity: [1, 0]
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ left: "50%", top: "50%" }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto h-24 w-24 rounded-full bg-green-50 flex items-center justify-center border border-green-100 shadow-[0_0_40px_rgba(34,197,94,0.15)] relative">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-green-400"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
            
            <div className="space-y-4">
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-heading text-5xl tracking-tight text-foreground md:text-6xl"
              >
                Order Secured ✦
              </motion.h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-1"
              >
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-foreground/45">Reference Number</p>
                <p className="font-mono text-xl text-primary font-bold">{orderNumber}</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
