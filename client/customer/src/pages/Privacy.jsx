import { useLanguage } from "../useLanguage.js";
import { Page, Panel } from "../ui/index.js";

export default function Privacy() {
  const { t } = useLanguage();

  return (
    <Page brand="Aether" variant="narrow">
      <Panel title="Privacy Policy" description="2026" padded className="prose prose-invert max-w-none">
        <p className="mb-6">We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our platform.</p>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">1. Information We Collect</h2>
          <h3 className="font-semibold mb-2">Personal Information</h3>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Name and contact details (email, phone number)</li>
            <li>Account credentials (hashed passwords)</li>
            <li>Billing and payment information (processed securely by our payment providers)</li>
            <li>Order history and transaction records</li>
          </ul>
          <h3 className="font-semibold mb-2">Usage Data</h3>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>IP address, browser type, operating system</li>
            <li>Pages visited, time spent, referral sources</li>
            <li>Device identifiers and cookies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To create and manage your account</li>
            <li>To process orders and deliver digital products</li>
            <li>To provide customer support and respond to inquiries</li>
            <li>To send order confirmations, receipts, and service updates</li>
            <li>To detect and prevent fraud, abuse, and security threats</li>
            <li>To improve our platform and user experience</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">3. Information Sharing</h2>
          <p className="mb-4">We do not sell your personal information. We may share data with:</p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li><strong>Service Providers:</strong> Payment processors, email delivery, cloud hosting (under strict data processing agreements)</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
            <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets (with notice)</li>
            <li><strong>With Your Consent:</strong> For any other purpose you explicitly authorize</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">4. Data Security</h2>
          <p className="mb-4">We implement appropriate technical and organizational measures to protect your data:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Encryption in transit (TLS 1.2+) and at rest</li>
            <li>Password hashing with bcrypt (cost factor 12)</li>
            <li>JWT tokens with short expiry (7 days) for authentication</li>
            <li>Rate limiting and brute-force protection</li>
            <li>Regular security audits and dependency updates</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">5. Data Retention</h2>
          <p className="mb-4">We retain your information only as long as necessary:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Account data: While your account is active, plus 30 days after closure</li>
            <li>Order/transaction records: 7 years for legal/compliance purposes</li>
            <li>Analytics/usage data: 26 months (aggregated/anonymized where possible)</li>
            <li>Support communications: 2 years</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">6. Your Rights</h2>
          <p className="mb-4">Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Access and obtain a copy of your personal data</li>
            <li>Rectify inaccurate or incomplete information</li>
            <li>Request erasure ("right to be forgotten") where applicable</li>
            <li>Restrict or object to processing</li>
            <li>Data portability (receive your data in a structured format)</li>
            <li>Withdraw consent at any time (where processing is based on consent)</li>
            <li>Lodge a complaint with a supervisory authority</li>
          </ul>
          <p className="mt-4">To exercise these rights, contact our support team with your request.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">7. Cookies & Tracking</h2>
          <p className="mb-4">We use cookies and similar technologies:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Essential:</strong> Authentication, security, session management</li>
            <li><strong>Preferences:</strong> Language, theme, currency settings</li>
            <li><strong>Analytics:</strong> Anonymous usage statistics (no personal identifiers)</li>
          </ul>
          <p className="mt-4">You can control cookies through your browser settings. Disabling essential cookies may break core functionality.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">8. Third-Party Links</h2>
          <p>Our platform may contain links to third-party websites (payment providers, service providers' dashboards). We are not responsible for their privacy practices. Review their policies before providing any information.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">9. Children's Privacy</h2>
          <p>Our services are not directed to individuals under 18. We do not knowingly collect personal information from children. If you believe we have collected data from a minor, contact us immediately for deletion.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">10. International Transfers</h2>
          <p>Your data may be processed in countries other than your own. We ensure appropriate safeguards (Standard Contractual Clauses, adequacy decisions) for any cross-border transfers.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">11. Changes to This Policy</h2>
          <p>We may update this Privacy Policy to reflect changes in our practices or legal requirements. The "Last Updated" date will be revised. Continued use of our platform constitutes acceptance of the updated policy.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">12. Contact Us</h2>
          <p>For privacy questions, data requests, or concerns:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Email: <a href="mailto:support@aether.example" className="text-accent hover:underline">support@aether.example</a></li>
            <li>Include "Privacy Request" in the subject line</li>
          </ul>
        </section>
      </Panel>
    </Page>
  );
}