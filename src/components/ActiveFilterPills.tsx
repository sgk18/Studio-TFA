"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { PRICE_RANGE_FILTERS, humanizeSlug } from "@/lib/catalogFilters";

export const ActiveFilterPills = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const removeFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(",").filter(Boolean) || [];
    const next = current.filter((v) => v !== value);

    if (next.length > 0) {
      params.set(key, next.join(","));
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const getLabel = (key: string, value: string) => {
    if (key === "price") {
      return PRICE_RANGE_FILTERS.find((r) => r.id === value)?.label || value;
    }
    return humanizeSlug(value);
  };

  const activeFilters: { key: string; value: string }[] = [];
  searchParams.forEach((value, key) => {
    if (["category", "material", "price"].includes(key)) {
      value.split(",").forEach((v) => {
        if (v) activeFilters.push({ key, value: v });
      });
    }
  });

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {activeFilters.map((filter) => (
        <button
          key={`${filter.key}-${filter.value}`}
          onClick={() => removeFilter(filter.key, filter.value)}
          className="group flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-white"
        >
          {getLabel(filter.key, filter.value)}
          <X className="h-3 w-3 transition-transform group-hover:scale-110" />
        </button>
      ))}
      <button
        onClick={() => router.push(pathname)}
        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground/40 hover:text-foreground transition-colors"
      >
        Clear All
      </button>
    </div>
  );
};
