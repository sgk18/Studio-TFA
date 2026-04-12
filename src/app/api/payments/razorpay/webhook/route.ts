import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  logPaymentEvent,
  markOrderPaymentCaptured,
  markOrderPaymentFailed,
  markOrderPaymentRefunded,
  resolveOrderIdFromProviderOrderId,
} from "@/lib/payments/orderCallbacks";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";
import type { Json } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaymentEntity = {
  id?: string;
  order_id?: string;
  status?: string;
  notes?: Record<string, string>;
};

type OrderEntity = {
  id?: string;
  receipt?: string;
  notes?: Record<string, string>;
};

type WebhookBody = {
  event?: string;
  payload?: {
    payment?: { entity?: PaymentEntity };
    order?: { entity?: OrderEntity };
  };
};

function parseWebhookBody(rawBody: string): WebhookBody | null {
  try {
    return JSON.parse(rawBody) as WebhookBody;
  } catch {
    return null;
  }
}

function buildFingerprint(eventName: string, paymentId: string, providerOrderId: string): string {
  return `${eventName}:${paymentId || "na"}:${providerOrderId || "na"}`;
}

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ ok: false, error: "Missing Razorpay signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  if (!verifyRazorpayWebhookSignature({ rawBody, razorpaySignature: signature })) {
    return NextResponse.json({ ok: false, error: "Invalid webhook signature." }, { status: 401 });
  }

  const body = parseWebhookBody(rawBody);
  if (!body?.event) {
    return NextResponse.json({ ok: false, error: "Malformed webhook payload." }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const eventName = body.event;
  const paymentEntity = body.payload?.payment?.entity;
  const orderEntity = body.payload?.order?.entity;

  const providerOrderId = paymentEntity?.order_id || orderEntity?.id || "";
  const paymentId = paymentEntity?.id || "";
  const explicitOrderId =
    paymentEntity?.notes?.order_id ||
    orderEntity?.notes?.order_id ||
    orderEntity?.receipt ||
    null;

  const orderId =
    explicitOrderId ||
    (providerOrderId
      ? await resolveOrderIdFromProviderOrderId({
          client: adminClient,
          providerOrderId,
        })
      : null);

  await logPaymentEvent({
    client: adminClient,
    fingerprint: buildFingerprint(eventName, paymentId, providerOrderId),
    eventType: eventName,
    payload: (body as unknown as Json) || {},
    orderId,
    paymentId,
    providerOrderId,
    processingStatus: orderId ? "processed" : "order_not_found",
  });

  if (!orderId) {
    return NextResponse.json({ ok: true, ignored: true, reason: "Order could not be resolved." });
  }

  if (!providerOrderId && (eventName === "payment.captured" || eventName === "payment.failed" || eventName === "refund.processed")) {
    return NextResponse.json({ ok: false, error: "Provider order ID missing in webhook payload." }, { status: 400 });
  }

  if (eventName === "payment.captured") {
    const result = await markOrderPaymentCaptured({
      client: adminClient,
      orderId,
      providerOrderId,
      paymentId,
      signature,
    });

    return NextResponse.json({ ok: result.ok, message: result.message });
  }

  if (eventName === "payment.failed") {
    const result = await markOrderPaymentFailed({
      client: adminClient,
      orderId,
      providerOrderId,
      paymentId: paymentId || null,
    });

    return NextResponse.json({ ok: result.ok, message: result.message });
  }

  if (eventName === "refund.processed") {
    const result = await markOrderPaymentRefunded({
      client: adminClient,
      orderId,
      providerOrderId,
    });

    return NextResponse.json({ ok: result.ok, message: result.message });
  }

  return NextResponse.json({ ok: true, ignored: true, event: eventName });
}