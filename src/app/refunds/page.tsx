import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refunds",
  description: "Refund and exchange guidance for Studio TFA orders.",
};

export default function RefundsPage() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Support</p>
        <h1 className="font-heading text-4xl tracking-[0.12em] sm:text-5xl">Refunds</h1>
        <p className="max-w-2xl text-sm leading-7 text-foreground/75 sm:text-base">
          Refund and replacement requests are handled with the same care as the products themselves. Eligibility depends on item condition, timelines, and the nature of the order.
        </p>
      </header>

      <div className="glass-shell space-y-5 rounded-[1.75rem] p-6 sm:p-8">
        <p className="text-sm leading-7 text-foreground/75">
          Damaged or incorrect items should be reported promptly with clear order details and photos. Custom or made-to-order items may have different eligibility rules.
        </p>
        <p className="text-sm leading-7 text-foreground/75">
          If a refund is approved, the timeline depends on the payment provider and bank processing times.
        </p>
      </div>
    </section>
  );
}