"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { formatINR } from "@/lib/currency";
import { CustomisationPanel } from "@/components/CustomisationPanel";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CommissionStepperForm } from "@/components/artists-corner/CommissionStepperForm";
import { ScrollReveal } from "@/components/ScrollReveal";
import { StarRating } from "@/components/StarRating";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, Info, ShieldCheck, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    product_type: string;
    customisation_surcharge: number;
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

  const hasPersonalisation = Object.values(customisations).some(v => v && (typeof v !== 'string' || v.trim() !== ''));
  const currentSurcharge = hasPersonalisation ? (product.customisation_surcharge || 0) : 0;
  const totalPrice = displayPrice + currentSurcharge;

  // Custom Preview Position Mapping
  const getPreviewStyles = () => {
    const base = "absolute transition-all duration-700 backdrop-blur-[2px] pointer-events-none flex items-center justify-center text-center";
    
    switch (product.product_type) {
      case "cap":
        return cn(base, "top-[40%] left-1/2 -translate-x-1/2 w-[30%] h-[20%] text-[0.6rem]");
      case "apparel":
        if (customisations.print_position === "Back") return cn(base, "top-[35%] left-1/2 -translate-x-1/2 w-[40%] h-[30%]");
        if (customisations.print_position === "Sleeve") return cn(base, "top-[45%] left-[25%] w-[15%] h-[15%] -rotate-12");
        return cn(base, "top-[40%] left-1/2 -translate-x-1/2 w-[25%] h-[20%]"); // Default/Chest
      case "bag":
        return cn(base, "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[40%]");
      case "badge":
        return cn(base, "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-[60%] h-[60%]");
      case "journal":
      case "frame":
      case "stationery":
        return cn(base, "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[60%]");
      default:
        return cn(base, "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[50%]");
    }
  };

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
              {product.is_customisable && product.product_type !== 'resin' && (
                <div className="absolute inset-0 pointer-events-none">
                  <AnimatePresence>
                    {(customisations.badge_text || customisations.name_text || customisations.monogram) && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={getPreviewStyles()}
                        style={{ 
                          color: customisations.colour_accent || '#262626',
                          fontFamily: customisations.badge_style === 'Scripture' ? 'var(--font-heading)' : 'inherit',
                          letterSpacing: customisations.badge_style === 'Scripture' ? '0.2em' : 'normal',
                          textTransform: (customisations.badge_style === 'Scripture' || customisations.monogram) ? 'uppercase' : 'none'
                        }}
                      >
                        <div className={cn(
                          "p-2 break-words max-w-full font-medium leading-tight",
                          customisations.badge_style === 'Classic' && "font-serif italic",
                          customisations.badge_style === 'Minimal' && "text-[0.8em] tracking-[0.3em] font-light"
                        )}>
                          {customisations.monogram || customisations.name_text || customisations.badge_text}
                        </div>
                      </motion.div>
                    )}

                    {customisations.photo_url && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.85 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-0 pointer-events-none"
                      >
                         <div className={cn(
                           "absolute mix-blend-multiply opacity-60 grayscale",
                           getPreviewStyles()
                         )}>
                            <Image 
                              src={customisations.photo_url} 
                              alt="Upload Preview" 
                              fill 
                              className="object-contain p-4"
                            />
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                    <Sparkles className="h-2.5 w-2.5 text-primary animate-pulse" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/70">Studio Preview ✦</span>
                  </div>
                </div>
              )}

              {product.product_type === 'resin' && hasPersonalisation && (
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px] flex items-center justify-center pointer-events-none p-8">
                   <div className="bg-white/90 p-4 rounded-xl shadow-xl border border-primary/20 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Custom Resin Direction</p>
                      <p className="text-xs italic text-foreground/70">Our artists will incorporate your selections into the pour.</p>
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
                {product.is_custom_order ? (
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
                    Bespoke Series
                  </span>
                ) : product.is_customisable && (
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" />
                    Customisable
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

            <div className="pt-4">
              {product.is_custom_order ? (
                <CommissionStepperForm prefill={{ fullName: "", email: "", isAuthenticated: false }} />
              ) : (
                <div className="space-y-8">
                  {product.is_customisable && (
                    <CustomisationPanel 
                      productType={product.product_type}
                      enabledFields={product.customisable_fields || {}}
                      surcharge={product.customisation_surcharge || 0}
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
              <Accordion className="w-full">
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
