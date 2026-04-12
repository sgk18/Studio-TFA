"use client";

import { useActionState, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import {
  initialNewsletterSubscribeState,
  subscribeNewsletterAction,
} from "@/actions/newsletter";

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    subscribeNewsletterAction,
    initialNewsletterSubscribeState
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5000); // Trigger after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    const closeTimer = setTimeout(() => {
      setIsOpen(false);
    }, 1800);

    return () => clearTimeout(closeTimer);
  }, [state.status]);

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
            
            <form className="flex flex-col gap-4" action={formAction}>
              <input 
                type="email" 
                name="email"
                required
                placeholder="Enter your email" 
                className="glass-input rounded-xl px-4 py-3 focus:outline-none focus:border-primary/60 transition-colors"
              />
              <button 
                type="submit"
                disabled={isPending}
                className="rounded-lg border border-primary/80 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm py-4 hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isPending ? "Joining..." : "Join the Journal"}
              </button>
            </form>
            {state.message ? (
              <p
                className={`mt-4 text-center text-xs ${
                  state.status === "error" ? "text-destructive" : "text-foreground/70"
                }`}
              >
                {state.message}
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground mt-6 text-center">We respect your space. No spam, ever.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
