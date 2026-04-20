import { LegalLayout } from "@/components/LegalLayout";

export const metadata = {
  title: "Shipping Policy",
};

export default function ShippingPage() {
  return (
    <LegalLayout title="Shipping Policy" lastUpdated="April 20, 2026">
      <section className="space-y-8">
        <div>
          <h3>1. Processing Time</h3>
          <p>
            All standard orders are processed within 2–3 business days. Bespoke or custom-rendered commissions may take up to 2–3 weeks for production and curing before shipment.
          </p>
        </div>

        <div>
          <h3>2. Shipping Carriers</h3>
          <p>
            We partner with reliable carriers such as BlueDart, Delhivery, and Shiprocket to ensure your pieces reach you safely.
          </p>
        </div>

        <div>
          <h3>3. Estimated Delivery</h3>
          <p>
            Domestic shipping within India typically takes 5–7 business days after processing. You will receive a tracking number via email once your order has shipped.
          </p>
        </div>

        <div>
          <h3>4. International Shipping</h3>
          <p>
            We are currently expanding our international presence. Please contact us directly for international shipping inquiries and quotes.
          </p>
        </div>

        <div>
          <h3>5. Shipping Damages</h3>
          <p>
            While we take utmost care in packaging, if your item arrives damaged, please document the packaging and the product and contact us within 48 hours of delivery.
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}