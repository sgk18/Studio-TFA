"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { Gift, ShieldCheck, TicketPercent, Truck } from "lucide-react";
import { prepareCheckoutAction, initialCheckoutActionState } from "@/actions/checkout";
import {
  FREE_SHIPPING_THRESHOLD_INR,
  PREMIUM_GIFTING_FEE_INR,
  STANDARD_SHIPPING_FEE_INR,
} from "@/lib/commerce";
import { formatINR } from "@/lib/currency";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

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

export function CheckoutForm({ user }: { user: CheckoutSessionUser | null }) {
  const items = useCartStore((state) => state.items);
  const [premiumGifting, setPremiumGifting] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [state, formAction, isPending] = useActionState(
    prepareCheckoutAction,
    initialCheckoutActionState
  );

  const cartPayload = useMemo(
    () =>
      JSON.stringify(
        items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        }))
      ),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const shippingEstimate =
    subtotal >= FREE_SHIPPING_THRESHOLD_INR ? 0 : STANDARD_SHIPPING_FEE_INR;
  const giftingFee = premiumGifting ? PREMIUM_GIFTING_FEE_INR : 0;
  const estimatedTotal = Math.max(0, subtotal + shippingEstimate + giftingFee);
  const isAuthenticated = Boolean(user);

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
          <Button render={<Link href="/collections" />}>Browse Collections</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <input type="hidden" name="checkout_mode" value={isAuthenticated ? "authenticated" : "guest"} />
      <input type="hidden" name="cart_payload" value={cartPayload} />
      <input type="hidden" name="premium_gifting" value={premiumGifting ? "true" : "false"} />

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
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="promo_code" className="flex items-center gap-2">
                  <TicketPercent className="h-4 w-4" />
                  Promo code
                </Label>
                <Input
                  id="promo_code"
                  name="promo_code"
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value)}
                  placeholder="TFA10 or WELCOME150"
                />
                {fieldError(state.fieldErrors, "promo_code") ? (
                  <p className="text-xs text-destructive">{fieldError(state.fieldErrors, "promo_code")}</p>
                ) : null}
              </div>

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
                <Switch checked={premiumGifting} onCheckedChange={setPremiumGifting} />
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
          <Button type="submit" disabled={isPending}>
            {isPending ? "Preparing secure totals..." : "Prepare Razorpay payload"}
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
                <p className="font-semibold">{formatINR(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/70 p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
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

          {state.status === "success" && state.summary && state.razorpayPayload ? (
            <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4 space-y-2 text-sm">
              <p className="font-semibold text-primary">Secure checkout payload ready</p>
              <p>Order: {state.orderId}</p>
              <p>Final total: {formatINR(state.summary.total)}</p>
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-primary/90">
                <ShieldCheck className="h-3.5 w-3.5" />
                Razorpay amount in paise: {state.razorpayPayload.amount}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </form>
  );
}