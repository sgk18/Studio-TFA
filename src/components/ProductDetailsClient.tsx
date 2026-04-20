"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatINR } from "@/lib/currency";
import { CustomisationPanel, type CustomisationField } from "@/components/CustomisationPanel";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ScrollReveal } from "@/components/ScrollReveal";
import { StarRating } from "@/components/StarRating";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

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
    images: string[];
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
  const [customisations, setCustomisations] = useState<Record<string, string>>({});
  const primaryImage = product.images[0];

  const customFields: CustomisationField[] = product.is_customisable && Array.isArray(product.customisable_fields)
    ? product.customisable_fields
    : [];

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.18fr_0.82fr] lg:gap-12">
      <ScrollReveal direction="right">
        <div className="space-y-4">
          <div className="glass-shell relative rounded-[1.6rem] p-4 md:p-5 overflow-hidden">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-border/70 bg-card/55">
              <Image
                src={primaryImage}
                alt={product.title}
                fill
                priority
                className="object-cover"
              />
              
              {/* Live Preview Overlays */}
              {product.is_customisable && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-12">
                  {/* Example badge overlay logic */}
                  {customisations.badge_text && (
                    <div 
                      className={cn(
                        "mt-auto mb-10 px-6 py-3 text-center transition-all duration-500",
                        customisations.badge_style === "floral" ? "font-serif italic text-primary bg-white/80 rounded-full" :
                        customisations.badge_style === "scripture" ? "font-heading uppercase tracking-widest text-[#4A4A4A] bg-[#F5F5F0]/90 border border-primary/20" :
                        "font-sans font-bold text-white bg-primary/90 rounded-md"
                      )}
                      style={{ 
                        color: customisations.colour_accent || undefined,
                        boxShadow: "0 10px 30px -5px rgba(0,0,0,0.15)"
                      }}
                    >
                      {customisations.badge_text}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {product.images.slice(1).map((imageUrl, index) => (
                <div key={index} className="glass-shell rounded-[1.15rem] p-2.5">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border/70 bg-card/50">
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
          <div className="glass-shell rounded-[1.6rem] p-7 md:p-9 space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">{product.category}</p>
              <h1 className="mt-4 font-heading text-5xl tracking-tight md:text-6xl">{product.title}</h1>
              
              {reviewCount > 0 && (
                <div className="mt-7 flex items-center gap-3 rounded-full border border-border/70 bg-card/45 px-4 py-2 w-fit">
                  <StarRating rating={Math.round(avgRating)} size={16} />
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-foreground/60">
                    {avgRating.toFixed(1)} / 5 · {reviewCount} reviews
                  </span>
                </div>
              )}
            </div>

            <div className="border-l-2 border-primary/45 pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/55">Inspiration</p>
              <p className="mt-3 font-heading text-3xl leading-tight text-primary md:text-4xl">“{product.inspiration}”</p>
            </div>

            <p className="text-base leading-relaxed text-foreground/75 italic">
              {product.story}
            </p>

            {product.is_customisable && (
              <CustomisationPanel 
                fields={customFields} 
                onChange={setCustomisations} 
              />
            )}

            <div className="mt-10 flex flex-col gap-5 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-3xl font-light">{formatINR(displayPrice)}</p>
              <AddToCartButton
                product={{
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  image_url: primaryImage,
                  category: product.category,
                }}
                customisations={customisations}
              />
            </div>
            
            {isWholesale && (
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Wholesale price applied (30% off list).
              </p>
            )}

            <div className="pt-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="shipping">
                  <AccordionTrigger className="text-xs font-bold uppercase tracking-[0.18em]">Shipping & Logistics</AccordionTrigger>
                  <AccordionContent className="text-sm text-foreground/70 leading-relaxed">
                    We ship pan-India with premium packaging. Standard delivery takes 5-7 business days.
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
