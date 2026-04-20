import { LegalLayout } from "@/components/LegalLayout";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="April 20, 2026">
      <section className="space-y-8">
        <div>
          <h3>1. Data Collection</h3>
          <p>
            We collect personal information that you provide to us, such as your name, email address, shipping address, and phone number when you place an order or create an account.
          </p>
        </div>

        <div>
          <h3>2. How We Use Your Information</h3>
          <p>
            We use your information to process orders, communicate with you about your purchases, and improve our services. We do not sell your personal information to third parties.
          </p>
        </div>

        <div>
          <h3>3. Data Processors</h3>
          <p>
            We use trusted third-party service providers (Data Processors) to perform functions on our behalf:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>Supabase</strong>: For authentication and database management.</li>
            <li><strong>Razorpay</strong>: For secure payment processing.</li>
            <li><strong>Google Analytics (GA4)</strong>: For understanding website usage and improving user experience (enabled only with consent).</li>
          </ul>
        </div>

        <div>
          <h3>4. Your Rights (DPDP & GDPR)</h3>
          <p>
            In accordance with India's DPDP Act and the GDPR, you have the right to access, correct, or delete your personal data. You may also withdraw your consent for optional cookies at any time.
          </p>
        </div>

        <div>
          <h3>5. Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, please contact us at [Your Email Address].
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}
