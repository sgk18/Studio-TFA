"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PRICE_RANGE_FILTERS } from "@/lib/catalogFilters";
import { cn } from "@/lib/utils";

type FacetOption = {
  slug: string;
  label: string;
  count: number;
};

interface FilterSidebarProps {
  categoryOptions: FacetOption[];
  materialOptions: FacetOption[];
  priceCounts: Map<string, number>;
  selectedCategories: string[];
  selectedPrices: string[];
  selectedMaterials: string[];
}

export const FilterSidebar = ({
  categoryOptions,
  materialOptions,
  priceCounts,
  selectedCategories,
  selectedPrices,
  selectedMaterials,
}: FilterSidebarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const updateFilters = (key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(",").filter(Boolean) || [];
    
    let next;
    if (checked) {
      next = [...current, value];
    } else {
      next = current.filter((v) => v !== value);
    }

    if (next.length > 0) {
      params.set(key, next.join(","));
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <aside className={cn("space-y-6 lg:sticky lg:top-28 transition-opacity", isPending && "opacity-60")}>
      <div className="glass-shell rounded-[1.4rem] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
            Filters
          </h2>
          <button 
            onClick={() => router.push(pathname)}
            className="text-[10px] uppercase font-bold tracking-widest text-primary hover:underline"
          >
            Clear All
          </button>
        </div>

        <Accordion multiple defaultValue={["category", "price", "material"]} className="w-full">
          {/* Category Filter */}
          <AccordionItem value="category" className="border-none">
            <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
              Category
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4 space-y-2">
              {categoryOptions.map((option) => (
                <div key={option.slug} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`cat-${option.slug}`} 
                      checked={selectedCategories.includes(option.slug)}
                      onCheckedChange={(checked) => updateFilters("category", option.slug, checked as boolean)}
                    />
                    <Label 
                      htmlFor={`cat-${option.slug}`}
                      className="text-sm font-medium leading-none cursor-pointer text-foreground/80 group-hover:text-foreground transition-colors"
                    >
                      {option.label}
                    </Label>
                  </div>
                  <span className="text-[10px] text-foreground/40">{option.count}</span>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Price Filter */}
          <AccordionItem value="price" className="border-none">
            <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
              Price
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4 space-y-2">
              {PRICE_RANGE_FILTERS.map((range) => (
                <div key={range.id} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`price-${range.id}`} 
                      checked={selectedPrices.includes(range.id)}
                      onCheckedChange={(checked) => updateFilters("price", range.id, checked as boolean)}
                    />
                    <Label 
                      htmlFor={`price-${range.id}`}
                      className="text-sm font-medium leading-none cursor-pointer text-foreground/80 group-hover:text-foreground transition-colors"
                    >
                      {range.label}
                    </Label>
                  </div>
                  <span className="text-[10px] text-foreground/40">{priceCounts.get(range.id) || 0}</span>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Material Filter */}
          <AccordionItem value="material" className="border-none">
            <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
              Material
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4 space-y-2">
              {materialOptions.map((option) => (
                <div key={option.slug} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`mat-${option.slug}`} 
                      checked={selectedMaterials.includes(option.slug)}
                      onCheckedChange={(checked) => updateFilters("material", option.slug, checked as boolean)}
                    />
                    <Label 
                      htmlFor={`mat-${option.slug}`}
                      className="text-sm font-medium leading-none cursor-pointer text-foreground/80 group-hover:text-foreground transition-colors"
                    >
                      {option.label}
                    </Label>
                  </div>
                  <span className="text-[10px] text-foreground/40">{option.count}</span>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </aside>
  );
};
