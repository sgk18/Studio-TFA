"use server";

import { createElement } from "react";
import { Resend } from "resend";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";
import { ReactEmailOrderConfirmation } from "@/emails/ReactEmailOrderConfirmation";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

const resend = new Resend(process.env.RESEND_API_KEY);

function countOrderItems(value: Json): number {
  if (!Array.isArray(value)) {
    return 0;
  }

  return value.reduce((total, item) => {
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
