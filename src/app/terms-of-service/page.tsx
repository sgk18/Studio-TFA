import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing the use of Studio TFA and its commerce platform.",
};

export default function TermsOfServicePage() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Legal</p>
        <h1 className="font-heading text-4xl tracking-[0.12em] sm:text-5xl">Terms of Service</h1>
        <p className="max-w-2xl text-sm leading-7 text-foreground/75 sm:text-base">
          These terms describe how Studio TFA may be used, purchased from, and engaged with. By browsing or ordering, you agree to follow these conditions and the policies referenced here.
        </p>
      </header>

      <div className="glass-shell space-y-5 rounded-[1.75rem] p-6 sm:p-8">
        <p className="text-sm leading-7 text-foreground/75">
          Content, pricing, and availability may change without notice. Orders are subject to verification, stock, and payment confirmation. We may refuse or cancel an order when fraud, abuse, or an operational issue is identified.
        </p>
        <p className="text-sm leading-7 text-foreground/75">
          For the complete shopping experience, please review Shipping, Refunds, and Privacy Policy pages before placing an order.
        </p>
      </div>
    </section>
  );
}