"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  FREE_SHIPPING_THRESHOLD_INR,
  PREMIUM_GIFTING_FEE_INR,
  STANDARD_SHIPPING_FEE_INR,
} from "@/lib/commerce";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  logPaymentEvent,
  markOrderPaymentCaptured,
} from "@/lib/payments/orderCallbacks";
import {
  createRazorpayOrder,
  getRazorpayPublicKey,
  verifyRazorpayCheckoutSignature,
} from "@/lib/payments/razorpay";
import type { Database } from "@/lib/supabase/types";

const cartItemSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
});

const shippingSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(8).max(20),
  addressLine1: z.string().trim().min(5).max(180),
  addressLine2: z.string().trim().max(180).optional(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(3).max(12),
  country: z.string().trim().min(2).max(56),
  notes: z.string().trim().max(320).optional(),
});

type CheckoutCartItem = z.infer<typeof cartItemSchema>;

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type OrdersInsert = Database["public"]["Tables"]["orders"]["Insert"];

const callbackPayloadSchema = z.object({
  orderId: z.string().trim().min(1),
  razorpayOrderId: z.string().trim().min(1),
  razorpayPaymentId: z.string().trim().min(1),
  razorpaySignature: z.string().trim().min(1),
});

export type RazorpayCallbackActionResult = {
  status: "success" | "error";
  message: string;
  orderId?: string;
  emailSent?: boolean;
};

export type CheckoutActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  orderId?: string;
  summary?: {
    subtotal: number;
    discount: number;
    shipping: number;
    premiumGiftingFee: number;
    total: number;
  };
  razorpayPayload?: {
    amount: number;
    currency: "INR";
    razorpayOrderId: string;
    receipt: string;
    notes: Record<string, string>;
    keyId: string;
  };
};

export const initialCheckoutActionState: CheckoutActionState = {
  status: "idle",
};

function toMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseCartItems(payload: string): CheckoutCartItem[] | null {
  try {
    const parsed = JSON.parse(payload);
    const result = z.array(cartItemSchema).min(1).max(100).safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function mapFieldErrors(
  issues: Record<string, string[] | undefined>
): Record<string, string> {
  const mapped: Record<string, string> = {};

  for (const [key, messages] of Object.entries(issues)) {
    if (messages && messages.length > 0) {
      mapped[key] = messages[0];
    }
  }

  return mapped;
}

function computePromoDiscount(
  promoCode: string,
  subtotal: number
): { discount: number; normalizedPromoCode: string | null; error?: string } {
  const normalized = promoCode.trim().toUpperCase();

  if (!normalized) {
    return { discount: 0, normalizedPromoCode: null };
  }

  if (normalized === "TFA10") {
    return {
      discount: toMoney(Math.min(subtotal * 0.1, 300)),
      normalizedPromoCode: normalized,
    };
  }

  if (normalized === "WELCOME150") {
    if (subtotal < 1500) {
      return {
        discount: 0,
        normalizedPromoCode: normalized,
        error: "WELCOME150 requires a minimum subtotal of Rs. 1500.",
      };
    }

    return { discount: 150, normalizedPromoCode: normalized };
  }

  return {
    discount: 0,
    normalizedPromoCode: normalized,
    error: "Promo code is invalid or unsupported.",
  };
}

export async function prepareCheckoutAction(
  _previousState: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  const supabase = await createClient();
  const checkoutMode = getString(formData, "checkout_mode") || "guest";

  if (checkoutMode !== "guest" && checkoutMode !== "authenticated") {
    return {
      status: "error",
      message: "Checkout mode is invalid.",
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return {
      status: "error",
      message: "Unable to verify your session. Please try again.",
    };
  }

  const isAuthenticated = Boolean(user);

  if (checkoutMode === "authenticated" && !isAuthenticated) {
    return {
      status: "error",
      message: "Please sign in to continue with authenticated checkout.",
    };
  }

  const cartPayloadRaw = getString(formData, "cart_payload");
  const cartItems = parseCartItems(cartPayloadRaw);

  if (!cartItems) {
    return {
      status: "error",
      message: "Cart payload is invalid. Refresh the page and try again.",
    };
  }

  const submittedEmail = getString(formData, "email").toLowerCase();
  const resolvedEmail = user?.email?.toLowerCase() || submittedEmail;

  const shippingResult = shippingSchema.safeParse({
    fullName: getString(formData, "fullName"),
    email: resolvedEmail,
    phone: getString(formData, "phone"),
    addressLine1: getString(formData, "addressLine1"),
    addressLine2: getString(formData, "addressLine2"),
    city: getString(formData, "city"),
    state: getString(formData, "state"),
    postalCode: getString(formData, "postalCode"),
    country: getString(formData, "country") || "India",
    notes: getString(formData, "notes"),
  });

  if (!shippingResult.success) {
    return {
      status: "error",
      message: "Please correct the highlighted shipping fields.",
      fieldErrors: mapFieldErrors(shippingResult.error.flatten().fieldErrors),
    };
  }

  const productIds = [...new Set(cartItems.map((item) => item.productId))];

  const { data: productRows, error: productsError } = await supabase
    .from("products")
    .select("id,title,price,stock,is_active")
    .in("id", productIds);

  if (productsError || !productRows) {
    return {
      status: "error",
      message: "Unable to validate cart items right now. Please try again.",
    };
  }

  const products = productRows as ProductRow[];
  const productById = new Map(products.map((product) => [product.id, product]));

  let subtotal = 0;
  let lineItems: Array<{
    product_id: string;
    title: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }> = [];

  try {
    lineItems = cartItems.map((cartItem) => {
      const product = productById.get(cartItem.productId);

      if (!product || !product.is_active) {
        throw new Error("One or more products are unavailable.");
      }

      if (product.stock < cartItem.quantity) {
        throw new Error(`Insufficient stock for ${product.title}.`);
      }

      const unitPrice = Number(product.price);
      const lineTotal = toMoney(unitPrice * cartItem.quantity);
      subtotal = toMoney(subtotal + lineTotal);

      return {
        product_id: product.id,
        title: product.title,
        quantity: cartItem.quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
      };
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to validate cart inventory.",
    };
  }

  const promoCode = getString(formData, "promo_code");
  const promo = computePromoDiscount(promoCode, subtotal);

  if (promo.error) {
    return {
      status: "error",
      message: promo.error,
      fieldErrors: { promo_code: promo.error },
    };
  }

  const premiumGiftingEnabled = getString(formData, "premium_gifting") === "true";
  const premiumGiftingFee = premiumGiftingEnabled ? PREMIUM_GIFTING_FEE_INR : 0;
  const shippingAmount =
    subtotal >= FREE_SHIPPING_THRESHOLD_INR ? 0 : STANDARD_SHIPPING_FEE_INR;

  const total = toMoney(
    subtotal - promo.discount + shippingAmount + premiumGiftingFee
  );

  if (total <= 0) {
    return {
      status: "error",
      message: "Calculated total is invalid. Please review your cart.",
    };
  }

  const shippingAddress = {
    full_name: shippingResult.data.fullName,
    email: shippingResult.data.email,
    phone: shippingResult.data.phone,
    address_line_1: shippingResult.data.addressLine1,
    address_line_2: shippingResult.data.addressLine2 || null,
    city: shippingResult.data.city,
    state: shippingResult.data.state,
    postal_code: shippingResult.data.postalCode,
    country: shippingResult.data.country,
    notes: shippingResult.data.notes || null,
  };

  const orderId = randomUUID();

  let razorpayOrder;
  try {
    razorpayOrder = await createRazorpayOrder({
      amountInPaise: Math.round(total * 100),
      receipt: orderId,
      currency: "INR",
      notes: {
        order_id: orderId,
        checkout_mode: isAuthenticated ? "authenticated" : "guest",
        premium_gifting: premiumGiftingEnabled ? "yes" : "no",
        promo_code: promo.normalizedPromoCode || "none",
      },
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to create Razorpay order.",
    };
  }

  const orderPayload: OrdersInsert = {
    id: orderId,
    user_id: user?.id ?? null,
    guest_email: user ? null : shippingResult.data.email,
    status: "pending",
    currency: "INR",
    subtotal,
    discount: promo.discount,
    shipping_amount: shippingAmount,
    premium_gifting_fee: premiumGiftingFee,
    total_amount: total,
    promo_code: promo.normalizedPromoCode,
    payment_provider: "razorpay",
    payment_status: "created",
    payment_reference: razorpayOrder.id,
    shipping_address: shippingAddress,
    line_items: lineItems,
    notes: shippingResult.data.notes || null,
  };

  const { data: insertedOrder, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select("id")
    .single();

  if (orderError || !insertedOrder) {
    return {
      status: "error",
      message: "Unable to create order draft. Please try again.",
    };
  }

  const insertedOrderId = String((insertedOrder as { id: string }).id);

  return {
    status: "success",
    message: "Checkout has been prepared securely. Continue with Razorpay.",
    orderId: insertedOrderId,
    summary: {
      subtotal,
      discount: promo.discount,
      shipping: shippingAmount,
      premiumGiftingFee: premiumGiftingFee,
      total,
    },
    razorpayPayload: {
      amount: razorpayOrder.amount,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      receipt: razorpayOrder.receipt,
      notes: {
        order_id: insertedOrderId,
        checkout_mode: isAuthenticated ? "authenticated" : "guest",
        premium_gifting: premiumGiftingEnabled ? "yes" : "no",
        promo_code: promo.normalizedPromoCode || "none",
      },
      keyId: getRazorpayPublicKey(),
    },
  };
}

export async function confirmRazorpayPaymentAction(
  payload: unknown
): Promise<RazorpayCallbackActionResult> {
  const parsed = callbackPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid payment callback payload.",
    };
  }

  const callback = parsed.data;

  if (
    !verifyRazorpayCheckoutSignature({
      razorpayOrderId: callback.razorpayOrderId,
      razorpayPaymentId: callback.razorpayPaymentId,
      razorpaySignature: callback.razorpaySignature,
    })
  ) {
    return {
      status: "error",
      message: "Razorpay signature verification failed.",
    };
  }

  const adminClient = createAdminClient();

  await logPaymentEvent({
    client: adminClient,
    fingerprint: `checkout.callback:${callback.razorpayPaymentId}`,
    eventType: "checkout.callback.captured",
    payload: {
      order_id: callback.orderId,
      provider_order_id: callback.razorpayOrderId,
      payment_id: callback.razorpayPaymentId,
    },
    orderId: callback.orderId,
    paymentId: callback.razorpayPaymentId,
    providerOrderId: callback.razorpayOrderId,
  });

  const result = await markOrderPaymentCaptured({
    client: adminClient,
    orderId: callback.orderId,
    providerOrderId: callback.razorpayOrderId,
    paymentId: callback.razorpayPaymentId,
    signature: callback.razorpaySignature,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
    };
  }

  return {
    status: "success",
    message: result.message,
    orderId: callback.orderId,
    emailSent: result.emailSent,
  };
}