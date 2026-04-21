import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UnboxingReveal } from "@/components/checkout/UnboxingReveal";
import { getRandomScripture } from "@/lib/scriptures";
import { formatINR } from "@/lib/currency";
import { ScrollReveal } from "@/components/ScrollReveal";

export const dynamic = "force-dynamic";

async function OrderDetails({ orderId }: { orderId: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !data) return notFound();
  const order = data as any;


  const scripture = getRandomScripture();

  return (
    <div className="container mx-auto max-w-4xl px-6 py-20">
      <UnboxingReveal orderNumber={order.id.slice(0, 8).toUpperCase()} />

      <ScrollReveal delay={2.5}>
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Scripture Block */}
          <div className="space-y-10">
            <div className="glass-shell rounded-[2.5rem] p-10 md:p-14 text-center space-y-8 border-primary/20 bg-primary/[0.03]">
              <div className="mx-auto w-12 h-0.5 bg-primary/30" />
              <p className="font-heading text-3xl md:text-4xl leading-relaxed text-primary/90 italic">
                “{scripture.verse}”
              </p>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-foreground/45">Daily Grace</p>
                <p className="text-sm font-bold text-primary/70">{scripture.reference}</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/50">Delivery details</h3>
              <div className="glass-shell rounded-3xl p-7 space-y-4">
                <p className="text-sm font-medium leading-relaxed">
                  A confirmation email has been sent to <span className="font-bold text-primary">{order.shipping_address.email}</span>.
                  We'll notify you once our artists have prepared your piece for transit.
                </p>
                <hr className="border-border/50" />
                <div className="grid grid-cols-2 gap-8 pt-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Status</p>
                    <p className="text-sm font-bold uppercase tracking-widest text-green-600">{order.status}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Expected By</p>
                    <p className="text-sm font-bold">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-8">
            <div className="glass-shell rounded-3xl p-8 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Order Total</p>
                <p className="text-3xl font-heading tracking-tight">{formatINR(order.total_amount)}</p>
              </div>
              <hr className="border-border" />
              <div className="space-y-4">
                <Link 
                  href="/account/orders" 
                  className="flex w-full items-center justify-center rounded-full bg-foreground py-4 text-xs font-bold uppercase tracking-widest text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  View Order Status
                </Link>
                <Link 
                  href="/collections" 
                  className="flex w-full items-center justify-center rounded-full border border-border/70 py-4 text-xs font-bold uppercase tracking-widest hover:bg-card/50 transition-colors"
                >
                  Return to Gallery
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-3">Community Choice</p>
              <p className="text-[11px] leading-relaxed text-foreground/60 italic">
                "Finding truth in the mundane is an art. Thank you for making our work part of your home."
                <br />— Sherlin & The Studio TFA Team
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const { orderId } = await searchParams;
  if (!orderId) return notFound();

  return (
    <main className="min-h-screen pt-20">
      <Suspense fallback={
        <div className="flex h-[80vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      }>
        <OrderDetails orderId={orderId} />
      </Suspense>
    </main>
  );
}
