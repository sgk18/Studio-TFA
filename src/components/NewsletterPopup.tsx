"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5000); // Trigger after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center glass-overlay p-6"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg glass-shell rounded-2xl p-10 shadow-2xl overflow-hidden text-foreground"
          >
            <button 
              onClick={() => setIsOpen(false)}
              aria-label="Close newsletter popup"
              title="Close"
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="font-heading text-4xl mb-4">A Quiet Corner</h3>
            <p className="text-foreground/78 leading-relaxed mb-8">
              Subscribe to receive occasional reflections on intentional living, early access to new collections, and a 10% welcome gift.
            </p>
            
            <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setIsOpen(false); }}>
              <input 
                type="email" 
                required
                placeholder="Enter your email" 
                className="glass-input rounded-xl px-4 py-3 focus:outline-none focus:border-primary/60 transition-colors"
              />
              <button 
                type="submit"
                className="rounded-lg border border-primary/80 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm py-4 hover:bg-primary/90 transition-colors"
              >
                Join the Journal
              </button>
            </form>
            <p className="text-xs text-muted-foreground mt-6 text-center">We respect your space. No spam, ever.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
