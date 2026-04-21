"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  applyWholesaleDiscount,
  FREE_SHIPPING_THRESHOLD_INR,
  isWholesaleRole,
  MAX_CART_LINE_QUANTITY,
  PREMIUM_GIFTING_FEE_INR,
  STANDARD_SHIPPING_FEE_INR,
  totalCartQuantity,
  WHOLESALE_DISCOUNT_RATE,
  WHOLESALE_MIN_CART_ITEMS,
  AUTOMATIC_DISCOUNT_THRESHOLD_INR,
  AUTOMATIC_DISCOUNT_PERCENT,
} from "@/lib/commerce";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveRoleForUserId } from "@/lib/security/viewerRole";
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
  quantity: z.coerce.number().int().min(1).max(MAX_CART_LINE_QUANTITY),
  customisations: z.record(z.string(), z.string()).optional(),
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

  const viewerRole = user ? await resolveRoleForUserId(supabase, user.id) : null;
  const isWholesale = isWholesaleRole(viewerRole);

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

  const cartQuantity = totalCartQuantity(cartItems);
  if (isWholesale && cartQuantity < WHOLESALE_MIN_CART_ITEMS) {
    const message = `Wholesale checkout requires at least ${WHOLESALE_MIN_CART_ITEMS} items in cart.`;

    return {
      status: "error",
      message,
      fieldErrors: {
        cart: message,
      },
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
    customisations?: Record<string, string>;
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

      const baseUnitPrice = Number(product.price);
      const unitPrice = isWholesale
        ? applyWholesaleDiscount(baseUnitPrice)
        : baseUnitPrice;
      const lineTotal = toMoney(unitPrice * cartItem.quantity);
      subtotal = toMoney(subtotal + lineTotal);

      return {
        product_id: product.id,
        title: product.title,
        quantity: cartItem.quantity,
        base_unit_price: baseUnitPrice,
        unit_price: unitPrice,
        line_total: lineTotal,
        pricing_tier: isWholesale ? "wholesale" : "retail",
        wholesale_discount_rate: isWholesale ? WHOLESALE_DISCOUNT_RATE : 0,
        ...(cartItem.customisations ? { customisations: cartItem.customisations } : {}),
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
  let promoDiscount = 0;
  let normalizedPromoCode: string | null = null;
  let promoError: string | undefined = undefined;

  if (promoCode.trim()) {
    normalizedPromoCode = promoCode.trim().toUpperCase();
    const { data: dbPromo } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("code", normalizedPromoCode)
      .eq("is_active", true)
      .single();

    if (!dbPromo) {
      promoError = "Promo code is invalid or inactive.";
    } else {
      const dbPromoAny = dbPromo as any;
      if (dbPromoAny.expires_at && new Date(dbPromoAny.expires_at) < new Date()) {
        promoError = "This promo code has expired.";
      } else if (dbPromoAny.max_uses !== null && dbPromoAny.used_count >= dbPromoAny.max_uses) {
        promoError = "This promo code limit has been reached.";
      } else if (subtotal < dbPromoAny.min_order) {
        promoError = `Minimum order of ₹${dbPromoAny.min_order} required.`;
      } else {
        promoDiscount = dbPromoAny.type === "percent"
          ? Math.round((subtotal * dbPromoAny.value) / 100)
          : Math.min(dbPromoAny.value, subtotal);
      }
    }
  }

  if (promoError) {
    return {
      status: "error",
      message: promoError,
      fieldErrors: { promo_code: promoError },
    };
  }

  const premiumGiftingEnabled = getString(formData, "premium_gifting") === "true";
  const premiumGiftingFee = premiumGiftingEnabled ? PREMIUM_GIFTING_FEE_INR : 0;
  const shippingAmount =
    subtotal >= FREE_SHIPPING_THRESHOLD_INR ? 0 : STANDARD_SHIPPING_FEE_INR;

  // Automatic Discounts
  let automaticDiscount = 0;
  if (!isWholesale && subtotal >= AUTOMATIC_DISCOUNT_THRESHOLD_INR) {
    automaticDiscount = Math.round((subtotal * AUTOMATIC_DISCOUNT_PERCENT) / 100);
  }

  const total = toMoney(
    subtotal - promoDiscount - automaticDiscount + shippingAmount + premiumGiftingFee
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
        pricing_tier: isWholesale ? "wholesale" : "retail",
        premium_gifting: premiumGiftingEnabled ? "yes" : "no",
        promo_code: normalizedPromoCode || "none",
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
    discount: promoDiscount,
    shipping_amount: shippingAmount,
    premium_gifting_fee: premiumGiftingFee,
    total_amount: total,
    promo_code: normalizedPromoCode,
    payment_provider: "razorpay",
    payment_status: "created",
    payment_reference: razorpayOrder.id,
    shipping_address: shippingAddress,
    line_items: lineItems,
    notes: shippingResult.data.notes || null,
  };

  const { data: insertedOrder, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload as any)
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
      discount: promoDiscount,
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
        pricing_tier: isWholesale ? "wholesale" : "retail",
        premium_gifting: premiumGiftingEnabled ? "yes" : "no",
        promo_code: normalizedPromoCode || "none",
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