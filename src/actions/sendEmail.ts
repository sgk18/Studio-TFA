"use server";

import { createElement } from "react";
import { Resend } from "resend";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";
import { ReactEmailOrderConfirmation } from "@/emails/ReactEmailOrderConfirmation";
import ShippingNotificationEmail from "@/emails/ShippingNotificationEmail";
import { requireAdminAccess } from "@/lib/security/adminRole";
import { revalidatePath } from "next/cache";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

const resend = new Resend(process.env.RESEND_API_KEY);

function countOrderItems(value: Json): number {
  if (!Array.isArray(value)) {
    return 0;
  }

  return value.reduce<number>((total, item) => {
    if (typeof item === "object" && item !== null && !Array.isArray(item)) {
      const quantityValue = (item as Record<string, unknown>).quantity;
      const quantity = typeof quantityValue === "number" ? quantityValue : Number(quantityValue);

      if (Number.isFinite(quantity) && quantity > 0) {
        return total + Math.round(quantity);
      }
    }

    return total;
  }, 0);
}

export async function sendOrderConfirmation(customerEmail: string, orderId: string) {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: "RESEND_API_KEY is missing." };
  }

  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, total_amount, line_items")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return {
      success: false,
      error: error?.message || "Order not found.",
    };
  }

  const typedOrder = order as Pick<OrderRow, "id" | "total_amount" | "line_items">;
  const itemCount = countOrderItems(typedOrder.line_items);

  const response = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Studio TFA <onboarding@resend.dev>",
    to: customerEmail,
    subject: `Order Confirmed - Studio TFA #${orderId.slice(0, 8).toUpperCase()}`,
    react: createElement(ReactEmailOrderConfirmation, {
      customerEmail,
      orderId: typedOrder.id,
      itemCount,
      totalAmount: Number(typedOrder.total_amount || 0),
    }),
  });

  if (response.error) {
    return {
      success: false,
      error: response.error.message || "Resend rejected the email request.",
    };
  }

  return { success: true, data: response.data };
}

export async function sendShippingNotification(customerEmail: string, orderId: string, trackingNumber: string, customerName = "Valued Customer") {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: "RESEND_API_KEY is missing." };
  }

  const response = await resend.emails.send({
    from: "Studio TFA <orders@studiotfa.com>",
    to: customerEmail,
    subject: `Your order has shipped ✦ Studio TFA #${orderId.slice(0, 8).toUpperCase()}`,
    react: createElement(ShippingNotificationEmail, {
      customerName,
      orderId,
      trackingNumber,
    }),
  });

  if (response.error) {
    return { success: false, error: response.error.message };
  }

  return { success: true, data: response.data };
}

export async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
  const { supabase } = await requireAdminAccess({ from: "/admin/orders" });

  const updatePayload: Record<string, any> = { status };
  if (trackingNumber !== undefined) {
    updatePayload.tracking_number = trackingNumber;
  }

  // Fetch email/name before update to send notification
  const { data: order } = await supabase
    .from("orders")
    .select("guest_email, shipping_address")
    .eq("id", orderId)
    .single();

  const { error } = await supabase
    .from("orders")
    .update(updatePayload as any)
    .eq("id", orderId);

  if (error) return { error: error.message };

  if (status === "shipped" && trackingNumber && order) {
    const o = order as any;
    const address = o.shipping_address as Record<string, any> | null;
    const email = o.guest_email || address?.email;
    const name = address?.full_name || "Valued Customer";

    if (email) {
      await sendShippingNotification(email, orderId, trackingNumber, name);
    }
  }

  revalidatePath("/admin/orders");
  return { success: true };
}
