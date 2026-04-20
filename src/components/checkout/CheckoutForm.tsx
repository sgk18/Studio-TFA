"use client";

import Link from "next/link";
import { useActionState, useMemo, useState, useTransition, useEffect } from "react";
import { Gift, ShieldCheck, TicketPercent, Truck } from "lucide-react";
import {
  confirmRazorpayPaymentAction,
  initialCheckoutActionState,
  prepareCheckoutAction,
} from "@/actions/checkout";
import { validateCouponAction, validateGiftCardAction } from "@/actions/discounts";
import {
  FREE_SHIPPING_THRESHOLD_INR,
  PREMIUM_GIFTING_FEE_INR,
  resolveDisplayPrice,
  STANDARD_SHIPPING_FEE_INR,
  totalCartQuantity,
  WHOLESALE_MIN_CART_ITEMS,
} from "@/lib/commerce";
import { formatINR } from "@/lib/currency";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: "INR";
      order_id: string;
      name: string;
      description: string;
      notes?: Record<string, string>;
      prefill?: {
        name?: string;
        email?: string;
        contact?: string;
      };
      theme?: {
        color?: string;
      };
      modal?: {
        ondismiss?: () => void;
      };
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => void;
    }) => {
      open: () => void;
    };
  }
}

let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only load in the browser."));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script."));

    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

export type CheckoutSessionUser = {
  id: string;
  email: string;
  fullName: string;
};

function fieldError(
  errors: Record<string, string> | undefined,
  key: string
): string | null {
  return errors?.[key] || null;
}

import { Stepper } from "@/components/ui/stepper";
import { ShippingMethodSelector } from "./ShippingMethodSelector";

const CHECKOUT_STEPS = [
  { id: "cart", title: "Review", description: "Cart & Gifting" },
  { id: "shipping", title: "Shipping", description: "Where to send" },
  { id: "method", title: "Delivery", description: "How to ship" },
  { id: "payment", title: "Payment", description: "Secure checkout" },
] as const;

export function CheckoutForm({
  user,
  isWholesale,
}: {
  user: CheckoutSessionUser | null;
  isWholesale: boolean;
}) {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const coupon = useCartStore((state) => state.coupon);
  const isGift = useCartStore((state) => state.isGift);
  const giftCard = useCartStore((state) => state.giftCard);
  const toggleGift = useCartStore((state) => state.toggleGift);
  const getDiscountAmount = useCartStore((state) => state.getDiscountAmount);
  const getGiftCardAmount = useCartStore((state) => state.getGiftCardAmount);
  const applyGiftCard = useCartStore((state) => state.applyGiftCard);
  const removeGiftCard = useCartStore((state) => state.removeGiftCard);

  const [currentStep, setCurrentStep] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("std");

  const [state, formAction, isPending] = useActionState(
    prepareCheckoutAction,
    initialCheckoutActionState
  );

  const [callbackError, setCallbackError] = useState<string>("");
  const [isLaunchingPayment, startLaunchingPayment] = useTransition();

  const [giftCardCode, setGiftCardCode] = useState("");
  const [isValidatingGC, setIsValidatingGC] = useState(false);
  const [gcError, setGcError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + resolveDisplayPrice(item.price, isWholesale) * item.quantity,
        0
      ),
    [isWholesale, items]
  );

  const totalItems = useMemo(() => totalCartQuantity(items), [items]);
  const meetsWholesaleMinimum = !isWholesale || totalItems >= WHOLESALE_MIN_CART_ITEMS;
  
  const discountAmount = getDiscountAmount();
  const giftCardAmount = getGiftCardAmount();
  const freeShippingActive = subtotal >= FREE_SHIPPING_THRESHOLD_INR;
  const shippingCharge = shippingMethod === "exp" ? 150 : (freeShippingActive ? 0 : STANDARD_SHIPPING_FEE_INR);
  const giftingFee = isGift ? PREMIUM_GIFTING_FEE_INR : 0;
  
  // Automatic Discount Label (Client Side)
  const automaticDiscount = (!isWholesale && subtotal >= 5000) ? Math.round(subtotal * 0.1) : 0;
  
  const estimatedTotal = Math.max(0, subtotal - discountAmount - giftCardAmount - automaticDiscount + shippingCharge + giftingFee);
  const isAuthenticated = Boolean(user);

  const cartPayload = useMemo(
    () =>
      JSON.stringify(
        items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          ...(item.customisations ? { customisations: item.customisations } : {}),
        }))
      ),
    [items]
  );

  const canLaunchPayment =
    state.status === "success" &&
    Boolean(state.orderId) &&
    Boolean(state.razorpayPayload?.razorpayOrderId);

  const handleApplyGiftCard = async () => {
    if (!giftCardCode.trim()) return;
    setIsValidatingGC(true);
    setGcError("");
    try {
      const result = await validateGiftCardAction({ code: giftCardCode });
      if (result.valid) {
        applyGiftCard({ code: result.code, remainingValue: result.remainingValue });
        setGiftCardCode("");
      } else {
        setGcError(result.error);
      }
    } finally {
      setIsValidatingGC(false);
    }
  };

  const launchRazorpayCheckout = () => {
    if (!canLaunchPayment) return;
    
    startLaunchingPayment(async () => {
      setCallbackError("");
      setCallbackMessage("");

      try {
        await loadRazorpayScript();
        if (!window.Razorpay) throw new Error("Razorpay SDK unavailable.");

        const { razorpayPayload, orderId } = state;
        if (!razorpayPayload || !orderId) return;

        const rzp = new window.Razorpay({
          key: razorpayPayload.keyId,
          amount: razorpayPayload.amount,
          currency: razorpayPayload.currency,
          order_id: razorpayPayload.razorpayOrderId,
          name: "Studio TFA",
          description: "Secure Payment",
          notes: razorpayPayload.notes,
          prefill: {
            name: user?.fullName || undefined,
            email: user?.email || undefined,
          },
          theme: { color: "#8B263E" },
          handler: async (response) => {
            const result = await confirmRazorpayPaymentAction({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (result.status === "success") {
              clearCart();
              window.location.href = `/checkout/success?orderId=${orderId}`;
            } else {
              setCallbackError(result.message);
            }
          },
        });
        rzp.open();
      } catch (err) {
        setCallbackError(err instanceof Error ? err.message : "Payment error occurred.");
      }
    });
  };

  if (!mounted) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="glass-shell h-[640px] animate-pulse rounded-2xl" />
        <div className="glass-shell h-[500px] animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Checkout is waiting for items</CardTitle>
          <CardDescription>Add products to continue with shipping and payment.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/collections" className="action-pill-link">Browse Gallery</Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      <Stepper 
        steps={CHECKOUT_STEPS} 
        activeStep={currentStep} 
        onStepChange={setCurrentStep}
        className="max-w-4xl mx-auto"
      />

      <form action={formAction} className="grid gap-8 lg:grid-cols-[1.6fr_1fr] items-start">
        <input type="hidden" name="checkout_mode" value={isAuthenticated ? "authenticated" : "guest"} />
        <input type="hidden" name="cart_payload" value={cartPayload} />
        <input type="hidden" name="premium_gifting" value={isGift ? "true" : "false"} />
        <input type="hidden" name="promo_code" value={coupon?.code || ""} />
        <input type="hidden" name="gift_card_code" value={giftCard?.code || ""} />
        <input type="hidden" name="shipping_method" value={shippingMethod} />

        <div className="space-y-6">
          {currentStep === 0 && (
            <Card className="glass-shell border-none shadow-[0_16px_50px_-12px_rgba(139,38,62,0.12)]">
              <CardHeader>
                <CardTitle className="text-xl">Review Cart & Options</CardTitle>
                <CardDescription>Gifting and premium wrapping options.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/65 px-5 py-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold flex items-center gap-2">
                      <Gift className="h-4 w-4 text-primary" />
                      Premium Gifting
                    </p>
                    <p className="text-xs text-foreground/60 leading-relaxed">
                      Hand-written blessing card & sustainable wrap for {formatINR(PREMIUM_GIFTING_FEE_INR)}.
                    </p>
                  </div>
                  <Switch checked={isGift} onCheckedChange={toggleGift} />
                </div>
                
                {isGift && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Gift Message</Label>
                    <Textarea 
                      name="gift_message" 
                      placeholder="Write your heart here..." 
                      className="bg-card/40 border-primary/10 rounded-xl"
                    />
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <Button type="button" onClick={() => setCurrentStep(1)} className="px-10 h-12 rounded-full">
                    Enter Shipping Details →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 1 && (
            <Card className="glass-shell border-none shadow-[0_16px_50px_-12px_rgba(139,38,62,0.12)]">
              <CardHeader>
                <CardTitle className="text-xl">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">Full Name</Label>
                    <Input name="fullName" defaultValue={user?.fullName} required className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">Email</Label>
                    <Input name="email" type="email" defaultValue={user?.email} required readOnly={isAuthenticated} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">Phone</Label>
                    <Input name="phone" type="tel" required className="h-11 rounded-xl" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">Address Line 1</Label>
                    <Input name="addressLine1" required className="h-11 rounded-xl" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">Address Line 2 (Optional)</Label>
                    <Input name="addressLine2" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">City</Label>
                    <Input name="city" required className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">State</Label>
                    <Input name="state" required className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">Postal Code</Label>
                    <Input name="postalCode" required className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">Country</Label>
                    <Input name="country" defaultValue="India" required className="h-11 rounded-xl" />
                  </div>
                </div>

                <div className="pt-6 flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setCurrentStep(0)}>Back</Button>
                  <Button type="button" onClick={() => setCurrentStep(2)} className="px-10 h-12 rounded-full">
                    Select Delivery Method →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="glass-shell border-none shadow-[0_16px_50px_-12px_rgba(139,38,62,0.12)]">
              <CardHeader>
                <CardTitle className="text-xl">Delivery Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <ShippingMethodSelector 
                  selectedId={shippingMethod} 
                  onSelect={setShippingMethod}
                  freeShippingActive={freeShippingActive}
                />

                <div className="pt-6 flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setCurrentStep(1)}>Back</Button>
                  <Button type="button" onClick={() => setCurrentStep(3)} className="px-10 h-12 rounded-full">
                    Review and Pay →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="glass-shell border-none shadow-[0_16px_50px_-12px_rgba(139,38,62,0.12)]">
              <CardHeader>
                <CardTitle className="text-xl">Submit Order</CardTitle>
                <CardDescription>Finalise your totals and pay securely with Razorpay.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <ShieldCheck className="h-6 w-6" />
                    <p className="text-sm font-bold uppercase tracking-widest">PCI Compliant Secure Checkout</p>
                  </div>
                  <p className="text-xs text-foreground/60 leading-relaxed">
                    By clicking "Prepare Payment", we will verify your stock and final totals on our secure server. Your card details are never stored on our servers.
                  </p>
                </div>

                {state.message && (
                  <div className={cn(
                    "p-4 rounded-xl text-sm border",
                    state.status === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
                  )}>
                    {state.message}
                  </div>
                )}

                <div className="pt-6 flex justify-between gap-4">
                  <Button type="button" variant="ghost" onClick={() => setCurrentStep(2)} disabled={isPending}>Back</Button>
                  
                  {state.status === "success" && state.razorpayPayload ? (
                    <Button 
                      type="button" 
                      onClick={launchRazorpayCheckout}
                      disabled={isLaunchingPayment}
                      className="flex-1 h-12 rounded-full bg-primary hover:bg-primary/90"
                    >
                      {isLaunchingPayment ? "Opening Razorpay..." : "Pay with Razorpay →"}
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={isPending}
                      className="flex-1 h-12 rounded-full"
                    >
                      {isPending ? "Validating Cart..." : "Prepare Payment →"}
                    </Button>
                  )}
                </div>

                {callbackError && <p className="text-xs text-destructive text-center">{callbackError}</p>}
                {callbackMessage && <p className="text-xs text-primary text-center">{callbackMessage}</p>}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sticky Order Summary */}
        <aside className="lg:sticky lg:top-28 space-y-6">
          <Card className="glass-shell border-none shadow-[0_16px_40px_-12px_rgba(0,0,0,0.06)]">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-card/50">
                      <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-center gap-1">
                      <p className="text-sm font-bold leading-tight">{item.title}</p>
                      <p className="text-[10px] uppercase tracking-widest text-foreground/50">Qty {item.quantity}</p>
                      {item.customisations && (
                        <div className="text-[9px] uppercase tracking-widest font-bold text-primary/70">
                          Personalised ✦
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-bold pt-1">{formatINR(resolveDisplayPrice(item.price, isWholesale) * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/60 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1.5"><TicketPercent className="h-4 w-4" /> Promo Discount</span>
                    <span>−{formatINR(discountAmount)}</span>
                  </div>
                )}

                {automaticDiscount > 0 && (
                  <div className="flex justify-between text-sm text-primary font-bold">
                    <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Editorial Value Discount</span>
                    <span>−{formatINR(automaticDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Shipping</span>
                  <span>{shippingCharge === 0 ? "FREE" : formatINR(shippingCharge)}</span>
                </div>

                {giftCard && (
                  <div className="flex justify-between text-sm text-primary font-bold">
                    <span className="flex items-center gap-1.5"><Gift className="h-4 w-4" /> Gift Card ({giftCard.code})</span>
                    <div className="flex items-center gap-2">
                       <span>−{formatINR(giftCardAmount)}</span>
                       <button type="button" onClick={removeGiftCard} className="text-[10px] underline">Remove</button>
                    </div>
                  </div>
                )}

                {giftingFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5"><Gift className="h-4 w-4" /> Gift Wrapping</span>
                    <span>{formatINR(giftingFee)}</span>
                  </div>
                )}

                <div className="border-t border-border/80 pt-4 flex justify-between items-end">
                  <span className="text-sm font-bold uppercase tracking-widest">Estimated Total</span>
                  <span className="font-heading text-3xl tracking-tight">{formatINR(estimatedTotal)}</span>
                </div>
              </div>

              {!freeShippingActive && (
                <div className="rounded-xl bg-primary/5 p-3 text-[11px] text-primary/80 leading-relaxed text-center">
                  Add {formatINR(FREE_SHIPPING_THRESHOLD_INR - subtotal)} more for **Free Standard Delivery**.
                </div>
              )}

              {currentStep === 0 && !giftCard && (
                <div className="pt-4 space-y-2">
                   <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Redeem Gift Card</Label>
                   <div className="flex gap-2">
                      <Input 
                        value={giftCardCode}
                        onChange={(e) => setGiftCardCode(e.target.value)}
                        placeholder="XXXX-XXXX-XXXX"
                        className="h-10 text-xs bg-card/40 border-primary/10"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        disabled={isValidatingGC}
                        onClick={handleApplyGiftCard}
                        className="h-10 text-xs px-4"
                      >
                        {isValidatingGC ? "..." : "Redeem"}
                      </Button>
                   </div>
                   {gcError && <p className="text-[10px] text-destructive">{gcError}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </form>
    </div>
  );
}