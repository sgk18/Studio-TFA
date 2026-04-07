"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/store/useCart";
import { useEffect, useState } from "react";

export function CartButton({ className = "" }: { className?: string }) {
  const { openCart, getCount } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? getCount() : 0;

  return (
    <button
      onClick={openCart}
      className={`flex items-center gap-2 text-xs tracking-[0.2em] font-bold uppercase hover:opacity-70 transition-opacity relative ${className}`}
      aria-label="Open cart"
    >
      <ShoppingBag className="w-5 h-5 flex-shrink-0" />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-2.5 bg-primary text-primary-foreground border border-primary/45 text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-[0_6px_16px_rgba(15,23,42,0.22)] mix-blend-normal">
          {count}
        </span>
      )}
    </button>
  );
}
