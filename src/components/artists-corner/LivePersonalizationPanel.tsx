"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_PERSONALIZATION_LENGTH = 42;

export function LivePersonalizationPanel() {
  const [text, setText] = useState("Fearlessly Authentic");

  const remainingCharacters = useMemo(
    () => Math.max(0, MAX_PERSONALIZATION_LENGTH - text.length),
    [text]
  );

  return (
    <section className="glass-shell relative overflow-hidden rounded-[2rem] border border-primary/20 p-6 md:p-8">
      <div className="absolute -left-14 top-8 h-40 w-40 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-24 right-0 h-48 w-48 rounded-full bg-accent/25 blur-3xl" aria-hidden="true" />

      <header className="relative z-10 space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Live Personalization</p>
        <h2 className="font-heading text-3xl tracking-tight md:text-4xl">Preview your cover in real time</h2>
        <p className="max-w-xl text-sm leading-7 text-foreground/70">
          Type your dedication and watch it instantly settle on a minimal journal cover before submitting your commission brief.
        </p>
      </header>

      <div className="relative z-10 mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="space-y-3">
          <Label htmlFor="personalization-text">Cover text</Label>
          <Input
            id="personalization-text"
            value={text}
            onChange={(event) =>
              setText(event.target.value.slice(0, MAX_PERSONALIZATION_LENGTH))
            }
            placeholder="Enter your custom title"
            className="h-11"
          />
          <p className="text-xs uppercase tracking-[0.14em] text-foreground/60">
            {remainingCharacters} characters remaining
          </p>
        </div>

        <div className="mx-auto w-full max-w-sm rounded-[2rem] border border-border/70 bg-gradient-to-b from-[#faf3ef] via-[#f4e8e2] to-[#ebdbd4] p-5 shadow-[0_28px_58px_rgba(41,40,0,0.16)]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] border border-[#d8c3b8]/60 bg-[radial-gradient(circle_at_20%_10%,#fff8f3_0%,#f6e7df_48%,#ead7cf_100%)]">
            <div
              className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.46)_0%,rgba(255,255,255,0)_38%),linear-gradient(180deg,rgba(171,118,94,0.1),transparent_35%)]"
              aria-hidden="true"
            />
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 text-center">
              <p className="font-heading text-[1.55rem] leading-tight tracking-[0.08em] text-[#5f3f34] md:text-[1.8rem]">
                {text.trim().length > 0 ? text : "Your Journal Title"}
              </p>
            </div>
            <div className="absolute inset-x-14 bottom-7 h-px bg-[#b88a75]/40" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
