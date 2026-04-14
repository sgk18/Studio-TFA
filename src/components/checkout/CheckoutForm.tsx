"use client";

import Link from "next/link";
import { useActionState, useMemo, useState, useTransition } from "react";
import { Gift, ShieldCheck, TicketPercent, Truck } from "lucide-react";
import {
  confirmRazorpayPaymentAction,
  initialCheckoutActionState,
  prepareCheckoutAction,
} from "@/actions/checkout";
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
  const toggleGift = useCartStore((state) => state.toggleGift);
  const getDiscountAmount = useCartStore((state) => state.getDiscountAmount);
  const [state, formAction, isPending] = useActionState(
    prepareCheckoutAction,
    initialCheckoutActionState
  );
  const [callbackMessage, setCallbackMessage] = useState<string>("");
  const [callbackError, setCallbackError] = useState<string>("");
  const [isLaunchingPayment, startLaunchingPayment] = useTransition();

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
  const meetsWholesaleMinimum =
    !isWholesale || totalItems >= WHOLESALE_MIN_CART_ITEMS;
  const wholesaleItemsRemaining = Math.max(
    0,
    WHOLESALE_MIN_CART_ITEMS - totalItems
  );

  const shippingEstimate =
    subtotal >= FREE_SHIPPING_THRESHOLD_INR ? 0 : STANDARD_SHIPPING_FEE_INR;
  const giftingFee = isGift ? PREMIUM_GIFTING_FEE_INR : 0;
  const discountAmount = getDiscountAmount();
  const estimatedTotal = Math.max(0, subtotal - discountAmount + shippingEstimate + giftingFee);
  const isAuthenticated = Boolean(user);

  const canLaunchPayment =
    state.status === "success" &&
    Boolean(state.orderId) &&
    Boolean(state.razorpayPayload?.razorpayOrderId) &&
    Boolean(state.razorpayPayload?.keyId);

  const launchRazorpayCheckout = () => {
    const orderId = state.orderId;
    const razorpayPayload = state.razorpayPayload;

    if (!canLaunchPayment || !orderId || !razorpayPayload) {
      setCallbackError("Prepare checkout first to continue with payment.");
      return;
    }

    startLaunchingPayment(async () => {
      setCallbackError("");
      setCallbackMessage("");

      try {
        await loadRazorpayScript();

        if (!window.Razorpay) {
          setCallbackError("Razorpay SDK is unavailable. Please refresh and try again.");
          return;
        }

        const razorpay = new window.Razorpay({
          key: razorpayPayload.keyId,
          amount: razorpayPayload.amount,
          currency: razorpayPayload.currency,
          order_id: razorpayPayload.razorpayOrderId,
          name: "Studio TFA",
          description: "Secure checkout",
          notes: razorpayPayload.notes,
          prefill: {
            name: user?.fullName || undefined,
            email: user?.email || undefined,
          },
          theme: {
            color: "#8B263E",
          },
          modal: {
            ondismiss: () => {
              setCallbackMessage("Payment window closed. You can resume checkout anytime.");
            },
          },
          handler: async (response) => {
            const result = await confirmRazorpayPaymentAction({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (result.status === "success") {
              clearCart();
              setCallbackMessage(result.message);
              setCallbackError("");
              return;
            }

            setCallbackError(result.message);
          },
        });

        razorpay.open();
      } catch (error) {
        setCallbackError(
          error instanceof Error
            ? error.message
            : "Unable to launch Razorpay checkout."
        );
      }
    });
  };

  if (items.length === 0) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Checkout is waiting for items</CardTitle>
          <CardDescription>
            Your cart is empty right now. Add products to continue with shipping and payment.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link
            href="/collections"
            className="inline-flex h-10 items-center justify-center rounded-full border border-primary/35 bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse Collections
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <input type="hidden" name="checkout_mode" value={isAuthenticated ? "authenticated" : "guest"} />
      <input type="hidden" name="cart_payload" value={cartPayload} />
      <input type="hidden" name="premium_gifting" value={isGift ? "true" : "false"} />
      <input type="hidden" name="promo_code" value={coupon?.code || ""} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            Shipping and checkout
          </CardTitle>
          <CardDescription>
            {isAuthenticated
              ? "Authenticated checkout is active. Your account details are protected on the server."
              : "Guest checkout is active. You can continue without creating an account."}
          </CardDescription>

          {isWholesale ? (
            <p className="rounded-xl border border-primary/35 bg-primary/10 px-3 py-2 text-xs text-primary">
              Wholesale pricing active: all catalog prices are shown with a 30% discount and checkout requires at least {WHOLESALE_MIN_CART_ITEMS} items.
            </p>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" name="fullName" defaultValue={user?.fullName || ""} required />
                {fieldError(state.fieldErrors, "fullName") ? (
                  <p className="text-xs text-destructive">{fieldError(state.fieldErrors, "fullName")}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user?.email || ""}
                  required
                  readOnly={isAuthenticated}
                />
                {fieldError(state.fieldErrors, "email") ? (
                  <p className="text-xs text-destructive">{fieldError(state.fieldErrors, "email")}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" required />
                {fieldError(state.fieldErrors, "phone") ? (
                  <p className="text-xs text-destructive">{fieldError(state.fieldErrors, "phone")}</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Shipping details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="addressLine1">Address line 1</Label>
                <Input id="addressLine1" name="addressLine1" required />
                {fieldError(state.fieldErrors, "addressLine1") ? (
                  <p className="text-xs text-destructive">{fieldError(state.fieldErrors, "addressLine1")}</p>
                ) : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="addressLine2">Address line 2 (optional)</Label>
                <Input id="addressLine2" name="addressLine2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required />
                {fieldError(state.fieldErrors, "city") ? (
                  <p className="text-xs text-destructive">{fieldError(state.fieldErrors, "city")}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" required />
                {fieldError(state.fieldErrors, "state") ? (
                  <p className="text-xs text-destructive">{fieldError(state.fieldErrors, "state")}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal code</Label>
                <Input id="postalCode" name="postalCode" required />
                {fieldError(state.fieldErrors, "postalCode") ? (
                  <p className="text-xs text-destructive">{fieldError(state.fieldErrors, "postalCode")}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" defaultValue="India" required />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Order options</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 flex items-center justify-between rounded-2xl border border-border/70 bg-card/65 px-4 py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Gift className="h-4 w-4 text-primary" />
                    Premium gifting
                  </p>
                  <p className="text-xs text-foreground/65">
                    Add gift wrap and blessing card for {formatINR(PREMIUM_GIFTING_FEE_INR)}.
                  </p>
                </div>
                <Switch checked={isGift} onCheckedChange={toggleGift} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Delivery notes (optional)</Label>
                <Textarea id="notes" name="notes" placeholder="Landmark, preferred delivery time, or special instructions" />
              </div>
            </div>
          </section>

          {state.message ? (
            <p
              className={
                state.status === "success"
                  ? "rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary"
                  : state.status === "error"
                    ? "rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    : "text-sm text-foreground/70"
              }
            >
              {state.message}
            </p>
          ) : null}
        </CardContent>

        <CardFooter className="justify-end gap-3">
          {!isAuthenticated ? (
            <Button variant="outline" render={<Link href="/login" />}>
              Sign in instead
            </Button>
          ) : null}
          <Button type="submit" disabled={isPending || !meetsWholesaleMinimum}>
            {isPending
              ? "Preparing secure totals..."
              : !meetsWholesaleMinimum
                ? `Minimum ${WHOLESALE_MIN_CART_ITEMS} items required`
                : "Prepare Razorpay payload"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="h-max">
        <CardHeader>
          <CardTitle className="text-lg">Order summary</CardTitle>
          <CardDescription>
            Prices are validated again on the server before payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium leading-5">{item.title}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-foreground/55">
                    Qty {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatINR(
                    resolveDisplayPrice(item.price, isWholesale) * item.quantity
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/70 p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-green-600">
                <span className="flex items-center gap-2">
                  <TicketPercent className="h-4 w-4" />
                  Discount {coupon?.code ? `(${coupon.code})` : ""}
                </span>
                <span>−{formatINR(discountAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Shipping
              </span>
              <span>{shippingEstimate === 0 ? "Free" : formatINR(shippingEstimate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Premium gifting</span>
              <span>{giftingFee > 0 ? formatINR(giftingFee) : "-"}</span>
            </div>
            <div className="border-t border-border/60 pt-3 flex items-center justify-between font-semibold">
              <span>Estimated total</span>
              <span>{formatINR(estimatedTotal)}</span>
            </div>
          </div>

          {subtotal < FREE_SHIPPING_THRESHOLD_INR ? (
            <p className="text-xs text-foreground/65">
              Add {formatINR(FREE_SHIPPING_THRESHOLD_INR - subtotal)} more for free shipping.
            </p>
          ) : (
            <p className="text-xs text-primary font-semibold">Free shipping unlocked.</p>
          )}

          {isWholesale && !meetsWholesaleMinimum ? (
            <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Add {wholesaleItemsRemaining} more item{wholesaleItemsRemaining === 1 ? "" : "s"} to meet the wholesale minimum of {WHOLESALE_MIN_CART_ITEMS}.
            </p>
          ) : null}

          {state.status === "success" && state.summary && state.razorpayPayload ? (
            <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4 space-y-2 text-sm">
              <p className="font-semibold text-primary">Secure checkout payload ready</p>
              <p>Order: {state.orderId}</p>
              <p>Final total: {formatINR(state.summary.total)}</p>
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-primary/90">
                <ShieldCheck className="h-3.5 w-3.5" />
                Razorpay amount in paise: {state.razorpayPayload.amount}
              </p>
              <Button
                type="button"
                className="w-full"
                onClick={launchRazorpayCheckout}
                disabled={!canLaunchPayment || isLaunchingPayment}
              >
                {isLaunchingPayment ? "Opening Razorpay..." : "Pay securely with Razorpay"}
              </Button>
            </div>
          ) : null}

          {callbackMessage ? (
            <p className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary">
              {callbackMessage}
            </p>
          ) : null}

          {callbackError ? (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {callbackError}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </form>
  );
}