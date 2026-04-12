"use client";

import { useMemo, useState } from "react";
import { Printer } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/currency";

export type AdminOrderRow = {
  id: string;
  customerEmail: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  shippingAddress: unknown;
  lineItems: unknown;
};

export function OrdersDataTable({ orders }: { orders: AdminOrderRow[] }) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders[0]?.id ?? null
  );

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? orders[0] ?? null,
    [orders, selectedOrderId]
  );

  const printInvoice = (orderId: string) => {
    setSelectedOrderId(orderId);

    requestAnimationFrame(() => {
      window.print();
    });
  };

  return (
    <>
      <div className="print:hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead className="text-right">Invoice</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs text-foreground/70">{order.id}</TableCell>
                  <TableCell>{order.customerEmail}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{order.paymentStatus}</TableCell>
                  <TableCell>{formatINR(order.totalAmount)}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => printInvoice(order.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/45 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/72 transition-colors hover:border-primary hover:text-primary"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Print
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="hidden print:block">
        {selectedOrder ? <InvoiceTemplate order={selectedOrder} /> : null}
      </div>
    </>
  );
}

export function InvoiceTemplate({ order }: { order: AdminOrderRow }) {
  const lineItems = parseInvoiceLineItems(order.lineItems);
  const shippingAddress = parseShippingAddress(order.shippingAddress);

  return (
    <section className="mx-auto max-w-3xl px-8 py-10 text-black">
      <header className="mb-8 border-b border-black/25 pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em]">Studio TFA</p>
        <h2 className="mt-2 font-heading text-4xl tracking-tight">Invoice</h2>
        <p className="mt-2 text-sm">Order ID: {order.id}</p>
      </header>

      <div className="grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="font-semibold">Bill To</p>
          <p className="mt-2 leading-relaxed">
            {shippingAddress.fullName}
            <br />
            {shippingAddress.email}
            <br />
            {shippingAddress.phone}
          </p>
        </div>

        <div>
          <p className="font-semibold">Shipping Address</p>
          <p className="mt-2 leading-relaxed">
            {shippingAddress.line1}
            <br />
            {shippingAddress.line2}
            <br />
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
            <br />
            {shippingAddress.country}
          </p>
        </div>
      </div>

      <table className="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-black/35 text-left">
            <th className="px-2 py-2 font-semibold">Item</th>
            <th className="px-2 py-2 font-semibold">Qty</th>
            <th className="px-2 py-2 font-semibold">Unit</th>
            <th className="px-2 py-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-2 py-5 text-center text-black/60">
                Line items unavailable.
              </td>
            </tr>
          ) : (
            lineItems.map((item, index) => (
              <tr key={`${item.title}-${index}`} className="border-b border-black/10">
                <td className="px-2 py-2">{item.title}</td>
                <td className="px-2 py-2">{item.quantity}</td>
                <td className="px-2 py-2">{formatINR(item.unitPrice)}</td>
                <td className="px-2 py-2 text-right">{formatINR(item.lineTotal)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs border-t border-black/25 pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Grand Total</span>
            <span className="font-semibold">{formatINR(order.totalAmount)}</span>
          </div>
          <p className="mt-2 text-black/65">Status: {order.status}</p>
          <p className="text-black/65">Payment: {order.paymentStatus}</p>
        </div>
      </div>
    </section>
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
