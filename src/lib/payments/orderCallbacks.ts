import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildOrderConfirmationSubject,
  buildOrderConfirmationText,
  OrderConfirmationEmail,
} from "@/emails/OrderConfirmationEmail";
import { resend } from "@/lib/resend";
import type { Database, Json } from "@/lib/supabase/types";

type AdminClient = SupabaseClient<Database>;
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

type LineItem = {
  title: string;
  quantity: number;
  price: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function toLineItems(value: Json): LineItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!isRecord(entry)) return null;

      const title = readString(entry, "title") || "Studio TFA Item";
      const quantity = Number(entry.quantity);
      const unitPriceRaw = entry.unit_price ?? entry.price;
      const price = Number(unitPriceRaw);

      if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price < 0) {
        return null;
      }

      return {
        title,
        quantity: Math.round(quantity),
        price,
      };
    })
    .filter((item): item is LineItem => item !== null);
}

function resolveRecipient(order: OrderRow): { email: string | null; customerName: string } {
  const shippingAddress = isRecord(order.shipping_address) ? order.shipping_address : null;
  const emailFromAddress = shippingAddress ? readString(shippingAddress, "email") : null;
  const nameFromAddress = shippingAddress ? readString(shippingAddress, "full_name") : null;

  return {
    email: emailFromAddress || order.guest_email,
    customerName: nameFromAddress || "Studio TFA Customer",
  };
}

async function sendOrderConfirmationEmail(order: OrderRow): Promise<{
  sent: boolean;
  message: string;
}> {
  if (!process.env.RESEND_API_KEY) {
    return {
      sent: false,
      message: "RESEND_API_KEY is missing.",
    };
  }

  const { email, customerName } = resolveRecipient(order);
  if (!email) {
    return {
      sent: false,
      message: "Order does not have a reachable recipient email.",
    };
  }

  const items = toLineItems(order.line_items);
  const total = Number(order.total_amount || 0);
  const subtotal = Number(order.subtotal || 0);
  const discount = Number(order.discount || 0);
  const shippingAmount = Number(order.shipping_amount || 0);
  const premiumGiftingFee = Number(order.premium_gifting_fee || 0);

  const templatePayload = {
    orderId: order.id,
    customerName,
    items,
    total,
    subtotal,
    discount,
    shippingAmount,
    premiumGiftingFee,
  };

  const response = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Studio TFA <orders@studiotfa.com>",
    to: [email],
    subject: buildOrderConfirmationSubject(order.id),
    react: OrderConfirmationEmail(templatePayload),
    text: buildOrderConfirmationText(templatePayload),
  });

  if (response.error) {
    return {
      sent: false,
      message: response.error.message || "Resend rejected the email request.",
    };
  }

  return {
    sent: true,
    message: "Order confirmation email sent.",
  };
}

export async function logPaymentEvent(input: {
  client: AdminClient;
  fingerprint: string;
  eventType: string;
  payload: Json;
  orderId?: string | null;
  paymentId?: string | null;
  providerOrderId?: string | null;
  processingStatus?: string;
}) {
  const { error } = await input.client.from("payment_events").insert({
    event_fingerprint: input.fingerprint,
    order_id: input.orderId || null,
    provider: "razorpay",
    event_type: input.eventType,
    payment_id: input.paymentId || null,
    provider_order_id: input.providerOrderId || null,
    payload: input.payload,
    processing_status: input.processingStatus || "processed",
  });

  if (error && error.code !== "23505") {
    console.error("[payments] Failed to log payment event", {
      fingerprint: input.fingerprint,
      error,
    });
  }
}

export async function resolveOrderIdFromProviderOrderId(input: {
  client: AdminClient;
  providerOrderId: string;
}): Promise<string | null> {
  const { data, error } = await input.client
    .from("orders")
    .select("id")
    .eq("payment_reference", input.providerOrderId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return String(data.id);
}

export async function markOrderPaymentCaptured(input: {
  client: AdminClient;
  orderId: string;
  providerOrderId: string;
  paymentId: string;
  signature: string;
}): Promise<{ ok: boolean; message: string; emailSent: boolean }> {
  const { data: order, error: orderError } = await input.client
    .from("orders")
    .select("*")
    .eq("id", input.orderId)
    .maybeSingle();

  if (orderError || !order) {
    return {
      ok: false,
      message: "Order not found for payment capture.",
      emailSent: false,
    };
  }

  if (order.payment_reference && order.payment_reference !== input.providerOrderId) {
    return {
      ok: false,
      message: "Razorpay order ID does not match this order record.",
      emailSent: false,
    };
  }

  const paidAt = order.paid_at || new Date().toISOString();

  const { error: updateError } = await input.client
    .from("orders")
    .update({
      status: "paid",
      payment_status: "captured",
      payment_reference: input.providerOrderId,
      razorpay_payment_id: input.paymentId,
      payment_signature: input.signature,
      paid_at: paidAt,
    })
    .eq("id", order.id);

  if (updateError) {
    return {
      ok: false,
      message: "Failed to update paid status for order.",
      emailSent: false,
    };
  }

  if (order.confirmation_email_sent_at) {
    return {
      ok: true,
      message: "Order marked paid. Confirmation email was already sent earlier.",
      emailSent: true,
    };
  }

  const refreshedOrder: OrderRow = {
    ...order,
    status: "paid",
    payment_status: "captured",
    payment_reference: input.providerOrderId,
    razorpay_payment_id: input.paymentId,
    payment_signature: input.signature,
    paid_at: paidAt,
  };

  const emailResult = await sendOrderConfirmationEmail(refreshedOrder);

  if (emailResult.sent) {
    await input.client
      .from("orders")
      .update({ confirmation_email_sent_at: new Date().toISOString() })
      .eq("id", order.id);
  }

  return {
    ok: true,
    message: emailResult.message,
    emailSent: emailResult.sent,
  };
}

export async function markOrderPaymentFailed(input: {
  client: AdminClient;
  orderId: string;
  providerOrderId: string;
  paymentId: string | null;
}): Promise<{ ok: boolean; message: string }> {
  const { error } = await input.client
    .from("orders")
    .update({
      status: "failed",
      payment_status: "failed",
      payment_reference: input.providerOrderId,
      razorpay_payment_id: input.paymentId,
    })
    .eq("id", input.orderId);

  if (error) {
    return {
      ok: false,
      message: "Failed to mark order payment as failed.",
    };
  }

  return {
    ok: true,
    message: "Order marked as payment failed.",
  };
}

export async function markOrderPaymentRefunded(input: {
  client: AdminClient;
  orderId: string;
  providerOrderId: string;
}): Promise<{ ok: boolean; message: string }> {
  const { error } = await input.client
    .from("orders")
    .update({
      status: "refunded",
      payment_status: "refunded",
      payment_reference: input.providerOrderId,
    })
    .eq("id", input.orderId);

  if (error) {
    return {
      ok: false,
      message: "Failed to mark order as refunded.",
    };
  }

  return {
    ok: true,
    message: "Order marked as refunded.",
  };
}