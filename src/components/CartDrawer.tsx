"use client";

import { useCart } from "@/store/useCart";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  // Hydration guard — don't render cart content until client-mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const total = mounted ? getTotal() : 0;
  const count = mounted ? items.length : 0;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-background border-l border-border p-0">
        <SheetHeader className="px-6 pt-8 pb-4 border-b border-border">
          <SheetTitle className="font-heading text-2xl font-normal tracking-tight">
            Your Cart
            {mounted && count > 0 && (
              <span className="text-base font-sans font-light text-foreground/50 ml-3">({count} items)</span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Items */}
        {!mounted || items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <p className="font-heading text-3xl text-foreground/30 mb-4">Empty</p>
            <p className="text-foreground/50 text-sm leading-relaxed">
              Your cart is waiting to be filled with intentional objects.
            </p>
            <button
              onClick={closeCart}
              className="mt-8 text-xs tracking-widest uppercase font-bold text-primary hover:text-foreground transition-colors"
            >
              Browse the Gallery →
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 items-start">
                <div className="relative w-20 h-20 bg-muted flex-shrink-0 overflow-hidden">
                  <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading text-lg leading-tight mb-1 truncate">{item.title}</h4>
                  <p className="text-xs text-foreground/50 tracking-widest uppercase mb-3">{item.category}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center border border-border hover:bg-muted transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center border border-border hover:bg-muted transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-foreground/30 hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {mounted && items.length > 0 && (
          <div className="px-6 pb-8 pt-4 border-t border-border space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground/60 tracking-widest uppercase font-bold">Subtotal</span>
              <span className="font-heading text-2xl">${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-foreground/40 leading-relaxed">
              Shipping and taxes calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-foreground text-background text-center py-4 text-xs tracking-widest uppercase font-bold hover:bg-primary transition-colors duration-300"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={() => clearCart()}
              className="block w-full text-center text-xs text-foreground/40 hover:text-foreground/70 transition-colors py-1"
            >
              Clear cart
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
