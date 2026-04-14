"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/security/adminRole";
import { createClient } from "@/lib/supabase/server";

// ─── Public: Validate a coupon code ──────────────────────────────────────────

const validateCouponSchema = z.object({
  code: z.string().trim().min(1).max(64).toUpperCase(),
  subtotal: z.number().min(0),
});

export type CouponValidationResult =
  | {
      valid: true;
      discountAmount: number;
      type: "percent" | "flat";
      value: number;
      code: string;
    }
  | { valid: false; error: string };

export async function validateCouponAction(payload: {
  code: string;
  subtotal: number;
}): Promise<CouponValidationResult> {
  const parsed = validateCouponSchema.safeParse(payload);
  if (!parsed.success) {
    return { valid: false, error: "Invalid coupon code." };
  }

  // Use anon client — RLS allows public SELECT on active codes
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", parsed.data.code)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return { valid: false, error: "Coupon code not found or inactive." };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: "This coupon has expired." };
  }

  if (data.max_uses !== null && data.used_count >= data.max_uses) {
    return { valid: false, error: "This coupon has reached its usage limit." };
  }

  if (parsed.data.subtotal < data.min_order) {
    return {
      valid: false,
      error: `Minimum order of ₹${data.min_order} required for this coupon.`,
    };
  }

  const discountAmount =
    data.type === "percent"
      ? Math.round((parsed.data.subtotal * data.value) / 100)
      : Math.min(data.value, parsed.data.subtotal);

  return {
    valid: true,
    discountAmount,
    type: data.type as "percent" | "flat",
    value: data.value,
    code: data.code,
  };
}

// ─── Admin: Create a discount code ───────────────────────────────────────────

const createCodeSchema = z.object({
  code: z.string().trim().min(2).max(64).toUpperCase(),
  type: z.enum(["percent", "flat"]),
  value: z.number().positive(),
  minOrder: z.number().min(0).default(0),
  maxUses: z.number().int().positive().nullable().default(null),
  expiresAt: z.string().nullable().default(null),
  isActive: z.boolean().default(true),
});

export async function createDiscountCodeAction(payload: unknown) {
  const parsed = createCodeSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid payload." };
  }

  const { supabase } = await requireAdminAccess({ from: "/admin/discounts" });

  const { error } = await supabase.from("discount_codes").insert({
    code: parsed.data.code,
    type: parsed.data.type,
    value: parsed.data.value,
    min_order: parsed.data.minOrder,
    max_uses: parsed.data.maxUses,
    expires_at: parsed.data.expiresAt,
    is_active: parsed.data.isActive,
  });

  if (error) {
    if (error.code === "23505") return { error: "That code already exists." };
    return { error: error.message };
  }

  revalidatePath("/admin/discounts");
  return { success: true };
}

// ─── Admin: Toggle a discount code active/inactive ────────────────────────────

export async function toggleDiscountCodeAction(id: string, isActive: boolean) {
  const { supabase } = await requireAdminAccess({ from: "/admin/discounts" });

  const { error } = await supabase
    .from("discount_codes")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/discounts");
  return { success: true };
}

// ─── Admin: Delete a discount code ───────────────────────────────────────────

export async function deleteDiscountCodeAction(id: string) {
  const { supabase } = await requireAdminAccess({ from: "/admin/discounts" });

  const { error } = await supabase.from("discount_codes").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/discounts");
  return { success: true };
}

// ─── Admin: Create a gift card ────────────────────────────────────────────────

const createGiftCardSchema = z.object({
  value: z.number().positive(),
  recipientEmail: z.string().email(),
  expiresAt: z.string().nullable().default(null),
});

function generateGiftCode(): string {
  const segments = Array.from({ length: 4 }, () =>
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
  return segments.join("-");
}

export async function createGiftCardAction(payload: unknown) {
  const parsed = createGiftCardSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid payload." };
  }

  const { supabase } = await requireAdminAccess({ from: "/admin/discounts" });

  const code = generateGiftCode();

  const { error } = await supabase.from("gift_cards").insert({
    code,
    initial_value: parsed.data.value,
    remaining_value: parsed.data.value,
    recipient_email: parsed.data.recipientEmail,
    expires_at: parsed.data.expiresAt,
    is_redeemed: false,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/discounts");
  return { success: true, code };
}
