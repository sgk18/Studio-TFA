"use client";

import { useCartStore } from "@/store/cartStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import { Gift, Minus, Plus, Tag, X, LoaderCircle, Check } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { formatINR } from "@/lib/currency";
import {
  FREE_SHIPPING_THRESHOLD_INR,
  resolveDisplayPrice,
  WHOLESALE_MIN_CART_ITEMS,
} from "@/lib/commerce";
import { validateCouponAction } from "@/actions/discounts";
import { cn } from "@/lib/utils";

export function CartDrawer({ isWholesale = false }: { isWholesale?: boolean }) {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getCount,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    isGift,
    giftMessage,
    toggleGift,
    setGiftMessage,
    getDiscountAmount,
  } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isPendingCoupon, startCouponTransition] = useTransition();

  useEffect(() => setMounted(true), []);

  const subtotal = mounted
    ? items.reduce(
        (sum, item) => sum + resolveDisplayPrice(item.price, isWholesale) * item.quantity,
        0
      )
    : 0;
  const discountAmount = mounted ? getDiscountAmount() : 0;
  const total = Math.max(0, subtotal - discountAmount);
  const totalItems = mounted ? getCount() : 0;
  const meetsWholesaleMinimum =
    !isWholesale || totalItems >= WHOLESALE_MIN_CART_ITEMS;
  const wholesaleItemsRemaining = Math.max(
    0,
    WHOLESALE_MIN_CART_ITEMS - totalItems
  );
  const freeShippingRemaining = mounted
    ? Math.max(0, FREE_SHIPPING_THRESHOLD_INR - subtotal)
    : FREE_SHIPPING_THRESHOLD_INR;
  const shippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD_INR) * 100));

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    setCouponError("");
    startCouponTransition(async () => {
      const result = await validateCouponAction({ code: couponInput.trim(), subtotal });
      if (result.valid) {
        applyCoupon(result);
        setCouponInput("");
      } else {
        setCouponError(result.error);
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col glass-shell border-l border-border/70 p-0">
        <SheetHeader className="px-6 pt-8 pb-4 border-b border-border/60">
          <SheetTitle className="font-heading text-2xl font-normal tracking-tight">
            Your Cart
            {mounted && totalItems > 0 && (
              <span className="text-base font-sans font-light text-foreground/50 ml-3">
                ({totalItems} items)
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {!mounted || items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <p className="font-heading text-3xl text-muted-foreground mb-4">Empty</p>
            <p className="text-foreground/70 text-sm leading-relaxed">
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
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {isWholesale ? (
              <div className="rounded-xl border border-primary/35 bg-primary/10 px-4 py-3 text-xs text-primary">
                Wholesale pricing active. All item prices include a 30% discount.
              </div>
            ) : null}

            <div className="glass-subpanel rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-foreground/62">
                <span>Free shipping</span>
                <span>{shippingProgress}%</span>
              </div>
              <progress
                className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-background/75 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary"
                value={Math.min(subtotal, FREE_SHIPPING_THRESHOLD_INR)}
                max={FREE_SHIPPING_THRESHOLD_INR}
                aria-label="Free shipping progress"
              />
              {freeShippingRemaining > 0 ? (
                <p className="text-xs text-foreground/68 leading-relaxed">
                  Add {formatINR(freeShippingRemaining)} more to unlock free shipping at {formatINR(FREE_SHIPPING_THRESHOLD_INR)}.
                </p>
              ) : (
                <p className="text-xs font-semibold text-primary">
                  Free shipping unlocked for this order.
                </p>
              )}
            </div>

            {items.map((item) => (
              <div key={item.id} className="glass-subpanel rounded-xl p-3 flex gap-4 items-start">
                <div className="relative w-20 h-20 bg-card/50 rounded-md flex-shrink-0 overflow-hidden">
                  <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading text-lg leading-tight mb-1 truncate">{item.title}</h4>
                  <p className="text-xs text-foreground/50 tracking-widest uppercase mb-3">{item.category}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label={`Decrease quantity for ${item.title}`}
                      title="Decrease quantity"
                      className="w-6 h-6 flex items-center justify-center rounded-sm border border-border/70 bg-card/50 hover:bg-card/80 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label={`Increase quantity for ${item.title}`}
                      title="Increase quantity"
                      className="w-6 h-6 flex items-center justify-center rounded-sm border border-border/70 bg-card/50 hover:bg-card/80 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-medium">
                    {formatINR(
                      resolveDisplayPrice(item.price, isWholesale) * item.quantity
                    )}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.title} from cart`}
                    title="Remove item"
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
          <div className="px-6 pb-8 pt-4 border-t border-border/60 space-y-4">
            {/* Coupon input */}
            {!coupon ? (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    placeholder="Promo code"
                    className="flex-1 rounded-lg border border-border/70 bg-card/50 px-3 py-2 text-xs uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-primary/60"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isPendingCoupon || !couponInput.trim()}
                    className="rounded-lg border border-border/70 bg-card/50 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors hover:border-primary/60 hover:text-primary disabled:opacity-50"
                  >
                    {isPendingCoupon ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Tag className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-red-600">{couponError}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-green-600/25 bg-green-50/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-green-700">{coupon.code}</span>
                  <span className="text-xs text-green-600">−{formatINR(coupon.discountAmount)}</span>
                </div>
                <button onClick={removeCoupon} className="text-foreground/40 hover:text-foreground transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Gift toggle */}
            <button
              onClick={toggleGift}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-xs transition-colors",
                isGift
                  ? "border-primary/30 bg-primary/5 text-primary"
                  : "border-border/70 bg-card/40 text-foreground/60 hover:text-foreground"
              )}
            >
              <Gift className="h-3.5 w-3.5" />
              <span className="font-semibold uppercase tracking-[0.14em]">This is a gift</span>
            </button>

            {isGift && (
              <textarea
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder="Add a gift message (optional)…"
                rows={2}
                className="w-full resize-none rounded-lg border border-border/70 bg-card/50 px-3 py-2 text-xs placeholder:text-foreground/40 focus:outline-none focus:border-primary/60"
              />
            )}

            {/* Totals */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-foreground/55 uppercase tracking-[0.14em]">Subtotal</span>
                <span className="text-sm">{formatINR(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-green-600 uppercase tracking-[0.14em]">Discount</span>
                  <span className="text-sm text-green-600">−{formatINR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase tracking-[0.14em]">Total</span>
                <span className="font-heading text-2xl">{formatINR(total)}</span>
              </div>
            </div>

            {freeShippingRemaining > 0 ? (
              <p className="text-xs text-foreground/52 leading-relaxed">
                Shipping applies below {formatINR(FREE_SHIPPING_THRESHOLD_INR)}.
              </p>
            ) : (
              <p className="text-xs text-primary leading-relaxed font-semibold">
                Shipping fee waived.
              </p>
            )}
            {isWholesale && !meetsWholesaleMinimum ? (
              <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Add {wholesaleItemsRemaining} more item{wholesaleItemsRemaining === 1 ? "" : "s"} to reach the wholesale minimum of {WHOLESALE_MIN_CART_ITEMS}.
              </p>
            ) : null}

            <Link
              href="/checkout"
              onClick={closeCart}
              aria-disabled={!meetsWholesaleMinimum}
              className={`block w-full rounded-lg border border-primary/80 bg-primary text-primary-foreground text-center py-4 text-xs tracking-widest uppercase font-bold transition-colors duration-300 ${
                meetsWholesaleMinimum
                  ? "hover:bg-primary/90"
                  : "pointer-events-none opacity-60"
              }`}
            >
              {meetsWholesaleMinimum
                ? "Proceed to Checkout"
                : `Minimum ${WHOLESALE_MIN_CART_ITEMS} items required`}
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
