"use client";

import React from "react";
import { ScrollReveal } from "./ScrollReveal";

interface LegalLayoutProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <article className="min-h-screen px-6 pb-24 pt-32 md:px-12">
      <div className="container mx-auto max-w-4xl">
        <ScrollReveal>
          <div className="mb-16 space-y-4">
            <div className="flex items-center gap-3">
              <hr className="editorial-rule w-12" />
              <span className="overline opacity-60">Legal Documentation</span>
            </div>
            <h1 className="font-heading text-5xl tracking-tight lg:text-7xl">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Last Updated: {lastUpdated}
              </p>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="glass-shell rounded-[2.5rem] p-8 md:p-16 border-none bg-card/10">
            <div className="prose prose-studio max-w-none">
              {children}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </article>
  );
}
