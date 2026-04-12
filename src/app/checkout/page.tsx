import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutForm, type CheckoutSessionUser } from "@/components/checkout/CheckoutForm";
import { isWholesaleRole } from "@/lib/commerce";
import { resolveRoleForUserId } from "@/lib/security/viewerRole";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout for Studio TFA orders.",
};

function CheckoutSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="glass-shell h-[640px] animate-pulse rounded-2xl" />
      <div className="glass-shell h-[500px] animate-pulse rounded-2xl" />
    </div>
  );
}

async function CheckoutContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = user ? await resolveRoleForUserId(supabase, user.id) : null;
  const isWholesale = isWholesaleRole(role);

  const checkoutUser: CheckoutSessionUser | null = user
    ? {
        id: user.id,
        email: user.email || "",
        fullName:
          (typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : "") || "",
      }
    : null;

  return <CheckoutForm user={checkoutUser} isWholesale={isWholesale} />;
}

export default function CheckoutPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Checkout</p>
        <h1 className="font-heading text-4xl tracking-[0.12em] sm:text-5xl">Complete your order</h1>
        <p className="max-w-3xl text-sm leading-7 text-foreground/70 sm:text-base">
          Shipping and totals are verified on the server before payment. Guest and authenticated checkout are both supported.
        </p>
      </div>

      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutContent />
      </Suspense>
    </section>
  );
}