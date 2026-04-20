import { LegalLayout } from "@/components/LegalLayout";

export const metadata = {
  title: "Cancellation & Refund Policy",
};

export default function RefundsPage() {
  return (
    <LegalLayout title="Cancellation & Refund Policy" lastUpdated="April 20, 2026">
      <section className="space-y-8">
        <div>
          <h3>1. Return Window</h3>
          <p>
            We offer a 7-day return window for standard products from the date of delivery. If 7 days have passed since your delivery, we unfortunately cannot offer you a refund or exchange.
          </p>
        </div>

        <div>
          <h3>2. Conditions for Returns</h3>
          <p>
            To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging.
          </p>
        </div>

        <div>
          <h3>3. Custom & Bespoke Items</h3>
          <p>
            Please note that custom-rendered pieces, personalised products, and bespoke commissions are non-returnable and non-refundable due to the individualised nature of the artwork.
          </p>
        </div>

        <div>
          <h3>4. Refund Process</h3>
          <p>
            Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 7–10 business days.
          </p>
        </div>

        <div>
          <h3>5. Cancellations</h3>
          <p>
            Orders can only be cancelled within 12 hours of placement. Once processing has begun or a custom piece has been initiated, we cannot accept cancellations.
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}