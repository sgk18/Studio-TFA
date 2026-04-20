import { LegalLayout } from "@/components/LegalLayout";

export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="April 20, 2026">
      <section className="space-y-8">
        <div>
          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing or using the Studio TFA website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
          </p>
        </div>

        <div>
          <h3>2. Intellectual Property</h3>
          <p>
            All content on this site, including but not limited to artwork, designs, product photography, logos, and text, is the property of Studio TFA and is protected by copyright and intellectual property laws.
          </p>
        </div>

        <div>
          <h3>3. Prohibited Use</h3>
          <p>
            You may not reproduce, distribute, or create derivative works from our content without express written permission from Studio TFA. Any unauthorized use of our intellectual property is strictly prohibited.
          </p>
        </div>

        <div>
          <h3>4. Limitation of Liability</h3>
          <p>
            Studio TFA shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our products or website.
          </p>
        </div>

        <div>
          <h3>5. Governing Law</h3>
          <p>
            These terms are governed by the laws of India. Any disputes arising from these terms will be subject to the exclusive jurisdiction of the courts in [Your City, India].
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}
