import { Suspense } from "react";
import type { Metadata } from "next";
import { Compass, Feather, Sparkles } from "lucide-react";

import { CommissionStepperForm, type CommissionPrefill } from "@/components/artists-corner/CommissionStepperForm";
import { LivePersonalizationPanel } from "@/components/artists-corner/LivePersonalizationPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Artists Corner | Studio TFA",
  description:
    "Personalize your commission live and submit a custom creative brief to the Studio TFA artists team.",
};

function ArtistsCornerSkeleton() {
  return (
    <div className="grid gap-7 xl:grid-cols-[1.08fr_1fr]">
      <Skeleton className="h-[500px] rounded-[2rem]" />
      <Skeleton className="h-[620px] rounded-[2rem]" />
    </div>
  );
}

async function ArtistsCornerExperience() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const prefill: CommissionPrefill = {
    fullName:
      (typeof user?.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : "") || "",
    email: user?.email || "",
    isAuthenticated: Boolean(user),
  };

  return (
    <div className="grid gap-7 xl:grid-cols-[1.08fr_1fr] xl:items-start">
      <LivePersonalizationPanel />
      <CommissionStepperForm prefill={prefill} />
    </div>
  );
}

export default function ArtistsCornerPage() {
  return (
    <main className="relative isolate overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_5%,rgba(224,174,186,0.36),transparent_38%),radial-gradient(circle_at_85%_10%,rgba(120,104,37,0.28),transparent_32%),linear-gradient(180deg,rgba(253,248,244,1)_0%,rgba(248,239,234,0.78)_44%,rgba(253,248,244,1)_100%)]"
        aria-hidden="true"
      />

      <section className="mx-auto w-full max-w-7xl space-y-8">
        <header className="glass-shell rounded-[2rem] border border-primary/20 px-6 py-8 md:px-10 md:py-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Artists Corner</p>
              <h1 className="font-heading text-4xl leading-tight tracking-tight md:text-6xl">
                Commission work with a living preview, not guesswork.
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-foreground/72 md:text-base">
                Write your vision, curate your palette, and upload references in one editorial workspace.
                Every commission brief enters our production Kanban with clear studio handoffs from To-Do to
                Shipped.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-foreground/74">
              <div className="glass-subpanel flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3">
                <Feather className="h-4 w-4 text-primary" />
                <span>Live cover personalization preview</span>
              </div>
              <div className="glass-subpanel flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3">
                <Compass className="h-4 w-4 text-primary" />
                <span>3-step custom commission workflow</span>
              </div>
              <div className="glass-subpanel flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Secure submission synced to admin Kanban</span>
              </div>
            </div>
          </div>
        </header>

        <Suspense fallback={<ArtistsCornerSkeleton />}>
          <ArtistsCornerExperience />
        </Suspense>
      </section>
    </main>
  );
}
