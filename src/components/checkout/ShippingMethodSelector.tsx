"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/currency";
import { cn } from "@/lib/utils";

export type ShippingMethod = {
  id: string;
  name: string;
  price: number;
  deliveryTime: string;
};

const METHODS: ShippingMethod[] = [
  { id: "std", name: "Standard Delivery", price: 0, deliveryTime: "5-7 business days" },
  { id: "exp", name: "Express Studio Direct", price: 150, deliveryTime: "2-3 business days" },
];

interface ShippingMethodSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
  freeShippingActive: boolean;
}

export function ShippingMethodSelector({ selectedId, onSelect, freeShippingActive }: ShippingMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Shipping Method</h3>
      <div className="grid gap-4">
        {METHODS.map((method) => {
          const actualPrice = freeShippingActive && method.id === "std" ? 0 : method.price;
          const isSelected = selectedId === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={cn(
                "flex items-center justify-between rounded-2xl border p-4 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border/70 bg-card/45 hover:border-primary/40"
              )}
            >
              <div className="space-y-1">
                <p className="text-sm font-bold">{method.name}</p>
                <p className="text-xs text-foreground/60">{method.deliveryTime}</p>
              </div>
              <p className="text-sm font-bold">
                {actualPrice === 0 ? "FREE" : formatINR(actualPrice)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
