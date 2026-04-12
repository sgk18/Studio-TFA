import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping",
  description: "Shipping coverage, fulfilment, and dispatch expectations for Studio TFA.",
};

export default function ShippingPage() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Fulfilment</p>
        <h1 className="font-heading text-4xl tracking-[0.12em] sm:text-5xl">Shipping</h1>
        <p className="max-w-2xl text-sm leading-7 text-foreground/75 sm:text-base">
          Orders are packed and shipped with care once payment and stock are confirmed. Delivery times depend on destination, product type, and carrier performance.
        </p>
      </header>

      <div className="glass-shell space-y-5 rounded-[1.75rem] p-6 sm:p-8">
        <p className="text-sm leading-7 text-foreground/75">
          Tracking details are shared when available. If an order contains multiple items, items may ship together or separately depending on fulfilment timing.
        </p>
        <p className="text-sm leading-7 text-foreground/75">
          For time-sensitive or custom orders, Studio TFA may contact you to confirm the dispatch window before shipment.
        </p>
      </div>
    </section>
  );
}