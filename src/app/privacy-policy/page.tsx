import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Studio TFA handles personal data, cookies, and platform activity.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Privacy</p>
        <h1 className="font-heading text-4xl tracking-[0.12em] sm:text-5xl">Privacy Policy</h1>
        <p className="max-w-2xl text-sm leading-7 text-foreground/75 sm:text-base">
          Studio TFA only collects data needed to run the store, support checkout, and improve the experience you choose to receive. Cookie choices are recorded through consent preferences.
        </p>
      </header>

      <div className="glass-shell space-y-5 rounded-[1.75rem] p-6 sm:p-8">
        <p className="text-sm leading-7 text-foreground/75">
          We keep personal data limited to order fulfillment, account access, support, analytics where enabled, and legal obligations. You can update consent by clearing site data and reloading the page.
        </p>
        <p className="text-sm leading-7 text-foreground/75">
          This foundation is structured to support GDPR and DPDP-aware consent flows, including an explicit cookie banner and clear legal links.
        </p>
      </div>
    </section>
  );
}