import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { formatINR } from "@/lib/currency";
import { isValidPageIdParam } from "@/lib/pageValidation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type ProfileInvoiceRow = Pick<
  Database["public"]["Tables"]["orders"]["Row"],
  | "id"
  | "status"
  | "payment_status"
  | "total_amount"
  | "currency"
  | "created_at"
  | "shipping_address"
  | "line_items"
  | "user_id"
>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return {
    title: isValidPageIdParam(id)
      ? `Invoice ${id.slice(0, 8)} | Studio TFA`
      : "Invoice | Studio TFA",
  };
}

export default async function ProfileInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isValidPageIdParam(id)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/login?redirectedFrom=${encodeURIComponent(`/profile/orders/${id}`)}`);
  }

  const { data: orderRaw, error } = await supabase
    .from("orders")
    .select(
      "id, status, payment_status, total_amount, currency, created_at, shipping_address, line_items, user_id"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !orderRaw) {
    notFound();
  }

  const order = orderRaw as ProfileInvoiceRow;
  const shippingAddress = parseShippingAddress(order.shipping_address);
  const lineItems = parseInvoiceLineItems(order.line_items);

  return (
    <div className="min-h-screen bg-[#FDF8F4] px-6 pb-16 pt-28 md:px-10 lg:px-12">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <Link href="/profile#order-history" className="action-pill-link text-xs">
            Back to Account
          </Link>
        </div>

        <section className="rounded-[1.7rem] border border-[rgba(139,38,62,0.12)] bg-[#FDF8F4] px-6 py-7 shadow-[0_24px_64px_rgba(139,38,62,0.08)] md:px-8">
          <header className="mb-8 border-b border-border/70 pb-5">
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Studio TFA</p>
            <h1 className="mt-2 font-heading text-4xl tracking-tight md:text-5xl">Invoice</h1>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm text-foreground/72">
              <p>Order ID: {order.id}</p>
              <p>
                Date:{" "}
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </header>

          <div className="grid gap-6 font-sans text-sm md:grid-cols-2">
            <div>
              <p className="font-semibold text-foreground">Billing Contact</p>
              <p className="mt-2 leading-relaxed text-foreground/75">
                {shippingAddress.fullName || "-"}
                <br />
                {shippingAddress.email || "-"}
                <br />
                {shippingAddress.phone || "-"}
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground">Shipping Address</p>
              <p className="mt-2 leading-relaxed text-foreground/75">
                {shippingAddress.line1 || "-"}
                <br />
                {shippingAddress.line2 || "-"}
                <br />
                {shippingAddress.city || "-"}, {shippingAddress.state || "-"} {shippingAddress.postalCode || ""}
                <br />
                {shippingAddress.country || "-"}
              </p>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-border/70">
            <table className="w-full border-collapse font-sans text-sm">
              <thead className="bg-card/55 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Qty</th>
                  <th className="px-4 py-3 font-semibold">Unit</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-5 text-center text-foreground/60">
                      Line items unavailable.
                    </td>
                  </tr>
                ) : (
                  lineItems.map((item, index) => (
                    <tr key={`${item.title}-${index}`} className="border-t border-border/60">
                      <td className="px-4 py-3">{item.title}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">{formatINR(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-right">{formatINR(item.lineTotal)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs border-t border-border/70 pt-3 font-sans text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Grand Total</span>
                <span className="font-semibold">{formatINR(order.total_amount)}</span>
              </div>
              <p className="mt-2 text-foreground/70">Order Status: {readableStatus(order.status)}</p>
              <p className="text-foreground/70">Payment Status: {readableStatus(order.payment_status)}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

type InvoiceLineItem = {
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

function parseInvoiceLineItems(input: unknown): InvoiceLineItem[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const title =
        typeof record.title === "string" && record.title.trim().length > 0
          ? record.title.trim()
          : "Item";
      const quantity = numberFrom(record.quantity, 1);
      const unitPrice = numberFrom(record.unit_price ?? record.unitPrice, 0);
      const lineTotal = numberFrom(
        record.line_total ?? record.lineTotal,
        unitPrice * quantity
      );

      return {
        title,
        quantity,
        unitPrice,
        lineTotal,
      };
    })
    .filter((item): item is InvoiceLineItem => item !== null);
}

function parseShippingAddress(input: unknown) {
  if (typeof input !== "object" || input === null) {
    return {
      fullName: "",
      email: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    };
  }

  const address = input as Record<string, unknown>;

  return {
    fullName: stringFrom(address.full_name),
    email: stringFrom(address.email),
    phone: stringFrom(address.phone),
    line1: stringFrom(address.address_line_1),
    line2: stringFrom(address.address_line_2),
    city: stringFrom(address.city),
    state: stringFrom(address.state),
    postalCode: stringFrom(address.postal_code),
    country: stringFrom(address.country),
  };
}

function stringFrom(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberFrom(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function readableStatus(value: string): string {
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(" ");
}
