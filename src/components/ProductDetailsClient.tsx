"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { formatINR } from "@/lib/currency";
import { CustomisationPanel, type CustomisationField } from "@/components/CustomisationPanel";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CommissionStepper } from "@/components/CommissionStepper";
import { ScrollReveal } from "@/components/ScrollReveal";
import { StarRating } from "@/components/StarRating";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ProductDetailsClientProps {
  product: {
    id: string;
    title: string;
    price: number;
    category: string;
    story: string;
    inspiration: string;
    is_customisable: boolean;
    customisable_fields: any;
    surcharge_amount: number;
    is_custom_order: boolean;
    images: string[];
    stock: number;
  };
  isWholesale: boolean;
  displayPrice: number;
  avgRating: number;
  reviewCount: number;
}

export function ProductDetailsClient({ 
  product, 
  isWholesale, 
  displayPrice,
  avgRating,
  reviewCount
}: ProductDetailsClientProps) {
  const [customisations, setCustomisations] = useState<Record<string, any>>({});
  const primaryImage = product.images[0];

  const customFields: CustomisationField[] = product.is_customisable && Array.isArray(product.customisable_fields)
    ? product.customisable_fields
    : [];

  const hasPersonalisation = Object.values(customisations).some(v => v && (typeof v !== 'string' || v.trim() !== ''));
  const currentSurcharge = hasPersonalisation ? product.surcharge_amount : 0;
  const totalPrice = displayPrice + currentSurcharge;

  return (
    <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
      <ScrollReveal direction="right">
        <div className="space-y-6">
          <div className="glass-shell relative rounded-[2rem] p-4 md:p-6 overflow-hidden">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border/70 bg-card/55">
              <Image
                src={primaryImage}
                alt={product.title}
                fill
                priority
                className="object-cover"
              />
              
              {/* Live Preview Overlays */}
              {product.is_customisable && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-12 overflow-hidden">
                  <AnimatePresence>
                    {(customisations.badge_text || customisations.inscription) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={cn(
                          "mt-auto mb-16 px-8 py-4 text-center transition-all duration-700 shadow-2xl backdrop-blur-md",
                          customisations.badge_style === "Floral" ? "font-serif italic text-primary bg-white/85 rounded-full border border-primary/20" :
                          customisations.badge_style === "Scripture" ? "font-heading uppercase tracking-[0.3em] text-[#4A4A4A] bg-[#F5F5F0]/95 border border-primary/30" :
                          customisations.badge_style === "Minimal" ? "font-sans text-xs tracking-widest text-[#262626] bg-white/60 border border-black/10" :
                          "font-sans font-bold text-white bg-primary/95 rounded-xl border border-white/20"
                        )}
                        style={{ 
                          color: customisations.colour_accent || undefined,
                        }}
                      >
                        <p className="max-w-[200px] break-words">
                          {customisations.badge_text || customisations.inscription}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Visual indication that this is a preview */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                    <Sparkles className="h-2.5 w-2.5 text-primary animate-pulse" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/70">Studio Preview ✦</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {product.images.slice(1).map((imageUrl, index) => (
                <div key={index} className="glass-shell rounded-[1.25rem] p-2.5">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border/70 bg-card/50">
                    <Image src={imageUrl} alt="Detail" fill className="object-cover" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollReveal>

      <ScrollReveal direction="left" delay={0.1}>
        <div className="space-y-8">
          <div className="glass-shell rounded-[2rem] p-8 md:p-10 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">{product.category}</p>
                {product.is_custom_order && (
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
                    Bespoke Series
                  </span>
                )}
              </div>
              <h1 className="font-heading text-5xl tracking-tight leading-tight lg:text-7xl">{product.title}</h1>
              
              {reviewCount > 0 && (
                <div className="mt-8 flex items-center gap-3 rounded-full border border-border/70 bg-card/45 px-4 py-2 w-fit">
                  <StarRating rating={Math.round(avgRating)} size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/50">
                    {avgRating.toFixed(1)} Studio Score · {reviewCount} Reviews
                  </span>
                </div>
              )}
            </div>

            <div className="border-l-[3px] border-primary/40 pl-6 py-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/45 mb-2">Inspiration</p>
              <p className="font-heading text-3xl leading-snug text-primary/90 md:text-4xl italic">“{product.inspiration}”</p>
            </div>

            <div className="space-y-4">
              <p className="text-base leading-relaxed text-foreground/75 italic">
                {product.story}
              </p>
            </div>

            {/* Customiser or Commission Flow */}
            <div className="pt-4">
              {product.is_custom_order ? (
                <CommissionStepper productId={product.id} productTitle={product.title} />
              ) : (
                <div className="space-y-8">
                  {product.is_customisable && (
                    <CustomisationPanel 
                      fields={customFields} 
                      onChange={setCustomisations} 
                    />
                  )}

                    <div className="flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-0.5">
                        <p className="text-4xl font-light tracking-tight">{formatINR(totalPrice)}</p>
                        {currentSurcharge > 0 && (
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3" />
                            Incl. Personalisation (+{formatINR(currentSurcharge)})
                          </p>
                        )}
                      </div>
                      
                      {product.stock > 0 ? (
                        <AddToCartButton
                          product={{
                            id: product.id,
                            title: product.title,
                            price: totalPrice,
                            image_url: primaryImage,
                            category: product.category,
                          }}
                          customisations={customisations}
                        />
                      ) : (
                        <div className="flex flex-col gap-3 w-full sm:w-auto">
                          <div className="flex gap-2">
                             <Input 
                               placeholder="Email for restock alert" 
                               className="h-11 rounded-xl text-xs bg-card/40 border-primary/20"
                             />
                             <Button disabled className="h-11 rounded-xl px-6 opacity-50 bg-foreground/10 text-foreground cursor-not-allowed">
                               Notify Me
                             </Button>
                          </div>
                          <p className="text-[10px] font-bold text-destructive uppercase tracking-widest text-center sm:text-right">
                             Sold Out ✦ 
                          </p>
                        </div>
                      )}
                    </div>
                </div>
              )}
            </div>

            <div className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="shipping" className="border-border/50">
                  <AccordionTrigger className="text-[10px] font-bold uppercase tracking-[0.2em] py-5">
                    Studio Logistics & Shipping
                  </AccordionTrigger>
                  <AccordionContent className="text-[13px] text-foreground/60 leading-relaxed px-1">
                    Every piece is packed with intentionality. Domestic shipping takes 5-7 business days. Custom orders may take up to 3 weeks for artist rendering and curing.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="guarantee" className="border-none">
                  <AccordionTrigger className="text-[10px] font-bold uppercase tracking-[0.2em] py-5">
                    The Studio Authenticity
                  </AccordionTrigger>
                  <AccordionContent className="text-[13px] text-foreground/60 leading-relaxed px-1">
                    <div className="flex items-start gap-3 bg-primary/[0.03] p-4 rounded-xl border border-primary/10">
                      <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                      <p>All works are hand-curated by Sherlin. Authenticity certificate included with every collector's edition.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
