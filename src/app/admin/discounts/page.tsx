import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAdminAccess } from "@/lib/security/adminRole";
import { AdminDiscountsClient } from "./DiscountsClient";

export const metadata: Metadata = {
  title: "Discounts & Gift Cards | Studio TFA Admin",
};

export const dynamic = "force-dynamic";

function DiscountSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-2xl border border-border/60 bg-card/40"
        />
      ))}
    </div>
  );
}

async function DiscountsContent() {
  const { supabase } = await requireAdminAccess({ from: "/admin/discounts" });

  const [{ data: codesRaw }, { data: cardsRaw }] = await Promise.all([
    supabase
      .from("discount_codes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("gift_cards")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const codes = (Array.isArray(codesRaw) ? codesRaw : []).map((c: any) => ({
    id: String(c.id),
    code: String(c.code),
    type: c.type as "percent" | "flat",
    value: Number(c.value),
    minOrder: Number(c.min_order ?? 0),
    maxUses: c.max_uses != null ? Number(c.max_uses) : null,
    usedCount: Number(c.used_count ?? 0),
    expiresAt: c.expires_at ? String(c.expires_at) : null,
    isActive: Boolean(c.is_active),
    createdAt: String(c.created_at),
  }));

  const giftCards = (Array.isArray(cardsRaw) ? cardsRaw : []).map((g: any) => ({
    id: String(g.id),
    code: String(g.code),
    initialValue: Number(g.initial_value),
    remainingValue: Number(g.remaining_value),
    recipientEmail: String(g.recipient_email),
    expiresAt: g.expires_at ? String(g.expires_at) : null,
    isRedeemed: Boolean(g.is_redeemed),
    createdAt: String(g.created_at),
  }));

  return <AdminDiscountsClient codes={codes} giftCards={giftCards} />;
}

export default async function AdminDiscountsPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
          Promotions
        </p>
        <h2 className="mt-2 font-heading text-5xl tracking-tight">
          Discounts &amp; Gift Cards
        </h2>
        <p className="mt-2 text-sm text-foreground/60 max-w-lg">
          Create and manage promo codes, automatic discounts, and gift cards.
          Coupon codes are validated at checkout and usage is tracked automatically.
        </p>
      </div>

      <Suspense fallback={<DiscountSkeleton />}>
        <DiscountsContent />
      </Suspense>
    </section>
  );
}
