import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Compass, Feather, Sparkles, ShoppingBag, Terminal, User, Star } from "lucide-react";

import { CommissionStepperForm, type CommissionPrefill } from "@/components/artists-corner/CommissionStepperForm";
import { LivePersonalizationPanel } from "@/components/artists-corner/LivePersonalizationPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/currency";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Artists Corner | Studio TFA",
  description:
    "Personalize your commission live and submit a custom creative brief to the Studio TFA artists team.",
};

function ArtistsCornerSkeleton() {
  return (
    <div className="space-y-12">
      <Skeleton className="h-[400px] w-full rounded-[2rem]" />
      <div className="grid gap-7 xl:grid-cols-[1.08fr_1fr]">
        <Skeleton className="h-[500px] rounded-[2rem]" />
        <Skeleton className="h-[620px] rounded-[2rem]" />
      </div>
    </div>
  );
}

async function ArtistsCornerExperience() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch customisable products
  const { data: bespokeProducts } = await supabase
    .from("products")
    .select("*")
    .eq("is_customisable", true)
    .limit(4);

  const prefill: CommissionPrefill = {
    fullName:
      (typeof user?.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : "") || "",
    email: user?.email || "",
    isAuthenticated: Boolean(user),
  };

  return (
    <div className="space-y-24">
      {/* SECTION 2: THE BESPOKE SHOP */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
             <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">The Bespoke Selection</span>
             </div>
             <h2 className="font-heading text-4xl md:text-5xl tracking-tight">Ready for Personalisation</h2>
             <p className="text-foreground/60 max-w-xl text-sm leading-relaxed">
               Signature Studio TFA pieces that you can tailor with name plates, bible verses, and brand-coordinated accents.
             </p>
          </div>
          <Link href="/shop?category=Customisable" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
            View All Bespoke <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bespokeProducts?.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group glass-shell rounded-[1.8rem] p-4 border border-primary/10 hover:border-primary/30 transition-all">
               <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-card/40 mb-4">
                  {product.images?.[0] && (
                    <Image 
                      src={product.images[0]} 
                      alt={product.title} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full border border-primary/10 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Sparkles className="h-3 w-3 text-primary" />
                  </div>
               </div>
               <div className="space-y-1 px-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-primary/60">{product.category}</p>
                  <h3 className="font-heading text-lg tracking-tight group-hover:text-primary transition-colors">{product.title}</h3>
                  <p className="text-xs font-light text-foreground/50">{formatINR(product.price)}</p>
               </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 3 & 4: INTERACTIVE PREVIEW & COMMISSION FLOW */}
      <section className="space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
           <h2 className="font-heading text-4xl md:text-5xl tracking-tight">The Commission Briefing</h2>
           <p className="text-foreground/60 text-sm leading-relaxed italic">
             "A workspace where your heart meets our hand. Define the vision, we'll render the reality."
           </p>
        </div>
        <div className="grid gap-8 xl:grid-cols-[1.08fr_1fr] xl:items-start">
           <LivePersonalizationPanel />
           <div id="commission-stepper">
              <CommissionStepperForm prefill={prefill} />
           </div>
        </div>
      </section>

      {/* SECTION 5: GUEST ARTIST PROFILES */}
      <section className="glass-shell rounded-[2.5rem] p-10 lg:p-16 border border-primary/15 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <User className="h-64 w-64 text-primary" />
         </div>
         
         <div className="grid lg:grid-cols-2 gap-16 relative z-10">
            <div className="space-y-8">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                     <Star className="h-3 w-3 text-primary" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Resident Artists</span>
                  </div>
                  <h2 className="font-heading text-4xl md:text-6xl tracking-tight">Meet the Hands</h2>
                  <p className="text-foreground/70 leading-relaxed indent-8">
                    Studio TFA is a collective of visionary artists led by Sherlin. Each piece is curated by a hand that understands the weight of the scripture or memory being rendered.
                  </p>
               </div>
               
               <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 w-14 rounded-full border-4 border-white overflow-hidden bg-card/50">
                       <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary">
                          <User className="h-6 w-6" />
                       </div>
                    </div>
                  ))}
                  <div className="h-14 w-14 rounded-full border-4 border-white bg-primary flex items-center justify-center text-white text-[10px] font-bold">
                     +12
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="glass-subpanel p-6 rounded-3xl border border-primary/10 space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                     <Feather className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-heading text-xl">The Scribe Guild</h4>
                  <p className="text-xs text-foreground/60 leading-relaxed">
                    Specialists in botanical calligraphy and gold-leaf lettering.
                  </p>
               </div>
               <div className="glass-subpanel p-6 rounded-3xl border border-primary/10 space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#BFC9BA]/20 flex items-center justify-center">
                     <Compass className="h-6 w-6 text-[#786825]" />
                  </div>
                  <h4 className="font-heading text-xl">The Resin Lab</h4>
                  <p className="text-xs text-foreground/60 leading-relaxed">
                    Artists who master the pour, preserving floral fragments and light.
                  </p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}

export default function ArtistsCornerPage() {
  return (
    <main className="relative isolate overflow-hidden px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_5%,rgba(224,174,186,0.36),transparent_38%),radial-gradient(circle_at_85%_10%,rgba(120,104,37,0.28),transparent_32%),linear-gradient(180deg,rgba(253,248,244,1)_0%,rgba(248,239,234,0.78)_44%,rgba(253,248,244,1)_100%)]"
        aria-hidden="true"
      />

      <section className="mx-auto w-full max-w-7xl space-y-20">
        <header className="glass-shell rounded-[2rem] border border-primary/20 px-6 py-8 md:px-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                 <Terminal className="h-3 w-3 text-primary animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Artists Corner Workspace</span>
              </div>
              <h1 className="font-heading text-5xl leading-[1.1] tracking-tight md:text-7xl">
                Bespoke Creation with a <span className="text-primary italic">Live</span> Preview.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-foreground/72 md:text-base italic">
                Shape your vision, select your palette, and see your brief come to life in our studio environment before we even pick up the brush.
              </p>
              <div className="flex gap-4 pt-4">
                 <a href="#commission-stepper" className="bg-primary text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                    Start Commission
                 </a>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="glass-subpanel shadow-xl flex items-center gap-4 rounded-3xl border border-white/40 p-6 translate-x-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                   <Feather className="h-5 w-5 text-primary" />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Live Rendering</p>
                   <p className="text-xs text-foreground/60">See your personalised text on studio products instantly.</p>
                </div>
              </div>
              <div className="glass-subpanel shadow-xl flex items-center gap-4 rounded-3xl border border-white/40 p-6 -translate-x-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                   <Compass className="h-5 w-5 text-primary" />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">5-Step Briefing</p>
                   <p className="text-xs text-foreground/60">A structured editorial flow to capture every nuance.</p>
                </div>
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

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
