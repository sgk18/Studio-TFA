import crypto from "node:crypto";

type RazorpayOrderNotes = Record<string, string>;

export type CreateRazorpayOrderInput = {
  amountInPaise: number;
  receipt: string;
  currency?: "INR";
  notes?: RazorpayOrderNotes;
};

export type RazorpayOrderResponse = {
  id: string;
  entity: "order";
  amount: number;
  amount_due: number;
  amount_paid: number;
  attempts: number;
  currency: string;
  receipt: string;
  status: "created" | "attempted" | "paid";
  notes: RazorpayOrderNotes;
  created_at: number;
};

function getRazorpayCredentials() {
  const keyId =
    process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Missing Razorpay credentials. Set RAZORPAY_KEY_ID (or NEXT_PUBLIC_RAZORPAY_KEY_ID) and RAZORPAY_KEY_SECRET."
    );
  }

  return { keyId, keySecret };
}

function safeTimingCompare(expected: string, received: string): boolean {
  try {
    const expectedBuffer = Buffer.from(expected, "utf8");
    const receivedBuffer = Buffer.from(received, "utf8");

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch {
    return false;
  }
}

export async function createRazorpayOrder(
  input: CreateRazorpayOrderInput
): Promise<RazorpayOrderResponse> {
  const { keyId, keySecret } = getRazorpayCredentials();

  if (!Number.isFinite(input.amountInPaise) || input.amountInPaise <= 0) {
    throw new Error("Razorpay amount must be a positive integer in paise.");
  }

  const authToken = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(input.amountInPaise),
      currency: input.currency || "INR",
      receipt: input.receipt,
      notes: input.notes || {},
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(
      `Razorpay order creation failed (${response.status}): ${errorPayload}`
    );
  }

  return (await response.json()) as RazorpayOrderResponse;
}

export function verifyRazorpayCheckoutSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const { keySecret } = getRazorpayCredentials();

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");

  return safeTimingCompare(expectedSignature, input.razorpaySignature);
}

export function verifyRazorpayWebhookSignature(input: {
  rawBody: string;
  razorpaySignature: string;
}): boolean {
  const { keySecret } = getRazorpayCredentials();
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(input.rawBody)
    .digest("hex");

  return safeTimingCompare(expectedSignature, input.razorpaySignature);
}

export function getRazorpayPublicKey(): string {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
}