"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

const displayNameSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(80, "Display name must be 80 characters or less."),
});

const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(80, "Full name must be 80 characters or less."),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 digits.")
    .max(24, "Phone number must be 24 characters or less."),
  line1: z
    .string()
    .trim()
    .min(5, "Address line 1 must be at least 5 characters.")
    .max(140, "Address line 1 must be 140 characters or less."),
  line2: z
    .string()
    .trim()
    .max(140, "Address line 2 must be 140 characters or less.")
    .optional()
    .default(""),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters.")
    .max(80, "City must be 80 characters or less."),
  state: z
    .string()
    .trim()
    .min(2, "State must be at least 2 characters.")
    .max(80, "State must be 80 characters or less."),
  postalCode: z
    .string()
    .trim()
    .min(4, "Postal code must be at least 4 characters.")
    .max(12, "Postal code must be 12 characters or less."),
  country: z
    .string()
    .trim()
    .min(2, "Country must be at least 2 characters.")
    .max(56, "Country must be 56 characters or less."),
});

export type ProfileActionResult = {
  status: "success" | "error";
  message: string;
};

export type UpdateDisplayNameInput = z.infer<typeof displayNameSchema>;
export type UpdateShippingAddressInput = z.infer<typeof shippingAddressSchema>;

export async function updateDisplayNameAction(
  input: UpdateDisplayNameInput
): Promise<ProfileActionResult> {
  const parsed = displayNameSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid display name.",
    };
  }

  const context = await resolveAuthenticatedContext();
  if (!context) {
    return {
      status: "error",
      message: "Please sign in to update your account.",
    };
  }

  const { error } = await context.supabase
    .from("profiles")
    .update({ full_name: parsed.data.displayName })
    .eq("id", context.userId);

  if (error) {
    return {
      status: "error",
      message: error.message || "Unable to update your display name right now.",
    };
  }

  revalidatePath("/profile");

  return {
    status: "success",
    message: "Display name updated successfully.",
  };
}

export async function updateDefaultShippingAddressAction(
  input: UpdateShippingAddressInput
): Promise<ProfileActionResult> {
  const parsed = shippingAddressSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid shipping address.",
    };
  }

  const context = await resolveAuthenticatedContext();
  if (!context) {
    return {
      status: "error",
      message: "Please sign in to save your shipping address.",
    };
  }

  const normalizedAddress = {
    full_name: parsed.data.fullName,
    phone: parsed.data.phone,
    address_line_1: parsed.data.line1,
    address_line_2: parsed.data.line2 || "",
    city: parsed.data.city,
    state: parsed.data.state,
    postal_code: parsed.data.postalCode,
    country: parsed.data.country,
  };

  const { error } = await context.supabase
    .from("profiles")
    .update({ default_shipping_address: normalizedAddress as Json })
    .eq("id", context.userId);

  if (error) {
    if (error.code === "42703") {
      return {
        status: "error",
        message:
          "Default shipping address column is missing. Run supabase/ecommerce-profile-upgrade.sql first.",
      };
    }

    return {
      status: "error",
      message: error.message || "Unable to save your shipping address right now.",
    };
  }

  revalidatePath("/profile");
  revalidatePath("/checkout");

  return {
    status: "success",
    message: "Default shipping address saved.",
  };
}

async function resolveAuthenticatedContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    supabase,
    userId: user.id,
  };
}
