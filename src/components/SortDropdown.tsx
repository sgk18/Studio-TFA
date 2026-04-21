"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export const SortDropdown = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleSortChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const currentSort = searchParams.get("sort") || "featured";

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 hidden sm:inline">Sort By</span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="h-9 w-[140px] rounded-full border-primary/10 bg-card/50 text-[10px] font-bold uppercase tracking-widest">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-primary/10 bg-card/95 backdrop-blur-xl">
          <SelectItem value="featured" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">Featured</SelectItem>
          <SelectItem value="price-asc" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">Price: Low to High</SelectItem>
          <SelectItem value="price-desc" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">Price: High to Low</SelectItem>
          <SelectItem value="newest" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">Newest Arrivals</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
