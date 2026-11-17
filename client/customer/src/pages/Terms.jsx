import { useLanguage } from "../useLanguage.js";
import { Page, Panel, Icon } from "../ui/index.js";

export default function Terms() {
  const { t } = useLanguage();

  return (
    <Page brand="Aether" variant="narrow">
      <Panel title="Terms & Conditions" description="2026" padded className="prose prose-invert max-w-none">
        <p className="mb-6">Welcome to our platform. We provide access to selected AI subscriptions, cloud computing services, developer resources and related digital products, including:</p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>Anthropic Claude accounts and subscriptions.</li>
          <li>OpenAI ChatGPT accounts and subscriptions.</li>
          <li>AWS (Amazon Web Services) accounts and resources.</li>
          <li>Microsoft Azure accounts and cloud resources.</li>
          <li>Google Cloud Vertex AI and Gemini resources.</li>
        </ul>
        <p className="mb-6">By accessing our website, purchasing any product, or proceeding with the account login process, you acknowledge that you have read, understood and agreed to the following Terms & Conditions.</p>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">1. Account Ownership & Access</h2>
          <ol className="list-decimal list-inside space-y-3">
            <li>All accounts and digital resources are provided according to the product description and access arrangement displayed at the time of purchase.</li>
            <li>Customers must carefully review the product specifications, subscription tier, usage limits and other applicable details before purchasing.</li>
            <li>Account access must only be used for legitimate purposes and in accordance with the applicable provider's terms and policies.</li>
            <li>Customers must not resell, redistribute or transfer account access without prior authorization.</li>
            <li>We do not represent ourselves as Anthropic, OpenAI, Amazon, Microsoft or Google, nor do we claim official affiliation with these companies unless expressly stated.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">2. Login & Security Requirements</h2>
          <p className="mb-4">To minimize avoidable login complications, customers are expected to:</p>
          <ol className="list-decimal list-inside space-y-2 mb-6">
            <li>Use a secure and reliable internet connection.</li>
            <li>Maintain a consistent login environment.</li>
            <li>Use updated and supported browsers.</li>
            <li>Keep login credentials and verification codes confidential.</li>
            <li>Avoid unauthorized access or account sharing.</li>
            <li>Follow the account-specific onboarding instructions provided after purchase.</li>
            <li>Contact customer support if authentication or access issues occur.</li>
          </ol>
          <p>Customers must not attempt to bypass security checks, authentication requirements or geographical restrictions imposed by the service provider.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">3. Subscription & Product Verification</h2>
          <p className="mb-4">Immediately after receiving account access, customers should:</p>
          <ul className="list-disc list-inside space-y-2 mb-6">
            <li>Verify that the correct subscription or service tier is active.</li>
            <li>Confirm that the displayed usage limits match the purchased product.</li>
            <li>Check the subscription status and renewal information.</li>
            <li>Report any discrepancies to customer support promptly.</li>
          </ul>
          <p>Any missing features, incorrect subscription details or access problems should be reported before substantial use of the account.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">4. 30-Day Replacement Warranty</h2>
          <p className="mb-4">All eligible account purchases come with a 30-day replacement warranty, beginning on the date of successful delivery.</p>
          <p className="mb-4">Our warranty policy is as follows:</p>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>If an eligible purchased account is suspended or becomes inaccessible within the first 30 days, the customer may contact our support team.</li>
            <li>Our team will investigate and verify the reported issue.</li>
            <li>Once the claim is approved, a replacement account will be issued at no additional cost.</li>
            <li>Customers must provide their order reference and relevant information to facilitate verification.</li>
            <li>The replacement account will be subject to the applicable product specifications and usage conditions.</li>
          </ol>
          <h3 className="font-semibold mb-2">Warranty exclusions:</h3>
          <p className="mb-2">The warranty does not cover:</p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Suspension or restrictions resulting from customer misuse or unauthorized activities.</li>
            <li>Violations of the relevant service provider's terms and policies by the customer.</li>
            <li>Unauthorized sharing, resale or transfer of account access.</li>
            <li>Issues caused by customer modifications or security changes.</li>
            <li>Problems caused by incorrect credentials entered by the customer.</li>
          </ul>
          <p>Any exclusions must be assessed fairly based on the circumstances of the reported issue.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">5. Usage Limits & Service Availability</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Each product may have different usage limits, quotas, model availability and subscription features.</li>
            <li>Usage limits are determined by the applicable service provider.</li>
            <li>We do not guarantee unlimited usage unless explicitly stated in the product description.</li>
            <li>Temporary service interruptions, maintenance, API downtime and provider-side changes may affect availability.</li>
            <li>Changes to third-party pricing, policies, models or service availability are outside our direct control.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">6. Payments & Refund Policy</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>All prices must be confirmed before completing a purchase.</li>
            <li>Customers are responsible for ensuring that their payment details are correct.</li>
            <li>Digital products are generally non-refundable once successfully delivered and accessed, except where required by applicable law or expressly provided under our refund policy.</li>
            <li>Duplicate payments and verified payment errors will be reviewed by our support team.</li>
            <li>Warranty-related replacement claims will be handled according to Section 4.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">7. Customer Responsibilities</h2>
          <p className="mb-2">Customers agree not to:</p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Use purchased resources for illegal activities.</li>
            <li>Engage in fraud, phishing or unauthorized access.</li>
            <li>Abuse API services or cloud computing resources.</li>
            <li>Use accounts for activities prohibited by the respective providers.</li>
            <li>Attempt to compromise account security.</li>
            <li>Misrepresent purchased products or services.</li>
            <li>Resell or distribute account credentials without authorization.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">8. Customer Support</h2>
          <p className="mb-2">Customers experiencing login difficulties, subscription discrepancies, account restrictions or other technical problems should contact our customer support team.</p>
          <p className="mb-2">When contacting support, please provide:</p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Your order reference.</li>
            <li>The product purchased.</li>
            <li>A brief description of the problem.</li>
            <li>Relevant screenshots, where appropriate.</li>
          </ul>
          <p className="text-danger font-medium">Never send your email password, OTP or private authentication codes to customer support.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">9. Changes to These Terms</h2>
          <p>We reserve the right to update these Terms & Conditions when necessary to reflect changes in our products, services, operational procedures or applicable legal requirements. Updated terms will be published on our website with a revised update date.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">10. Acceptance of Terms</h2>
          <p className="mb-2">By checking the acceptance box and proceeding to our website or purchasing process, you confirm that:</p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>You have read and understood these Terms & Conditions.</li>
            <li>You understand the 30-day replacement warranty and its conditions.</li>
            <li>You understand your responsibilities regarding account security and usage.</li>
            <li>You agree to comply with the applicable service policies.</li>
            <li>You understand that service providers may independently restrict or suspend accounts.</li>
          </ul>
        </section>

        <p className="text-center text-muted pt-4 border-t border-line">Thank you for choosing our services. We appreciate your trust and are committed to providing transparent products, reliable support and a professional customer experience.</p>
      </Panel>
    </Page>
  );
}