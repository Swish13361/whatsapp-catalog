import { useLanguage } from "../useLanguage.js";
import { Page, Panel } from "../ui/index.js";

export default function RefundPolicy() {
  const { t } = useLanguage();

  return (
    <Page brand="Aether" variant="narrow">
      <Panel title="Payment, Delivery & Refund Policy" description="2026" padded className="prose prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">1. Payment Confirmation</h2>
          <ol className="list-decimal list-inside space-y-3">
            <li>All purchases must be paid in full before product delivery.</li>
            <li>Payments must be successfully received and confirmed by our payment verification system or support team.</li>
            <li>Customers must provide accurate payment details and transaction references where required.</li>
            <li>Orders will only be processed once payment has been successfully verified.</li>
            <li>We reserve the right to withhold delivery where a payment is pending, unsuccessful, reversed or cannot be verified.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">2. Product Delivery</h2>
          <ol className="list-decimal list-inside space-y-3">
            <li>Purchased digital products will be delivered only after successful payment confirmation.</li>
            <li>Account credentials, access instructions or relevant product details will be provided through the designated delivery channel.</li>
            <li>Customers are responsible for providing accurate contact and delivery information.</li>
            <li>Customers should verify their purchased product immediately after delivery.</li>
            <li>Any discrepancies between the purchased product and the delivered product should be reported to customer support promptly.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">3. Refund Policy</h2>
          <p className="mb-4">Refunds are subject to the following conditions:</p>
          <ol className="list-decimal list-inside space-y-4">
            <li>
              <strong>Suspension During Initial Login:</strong> If an account is already suspended or becomes inaccessible during the initial login process, the customer must contact customer support immediately. After verification, the customer may qualify for a refund if a replacement cannot be provided or agreed upon.
            </li>
            <li>
              <strong>Suspension After Successful Login:</strong> If an account becomes suspended or inaccessible within 30 days following successful login, the customer should contact customer support for assistance.
            </li>
            <li>
              <strong>Replacement Guarantee:</strong> After verification of an eligible suspension within the 30-day warranty period, another account of equivalent specifications will be issued at no additional cost.
            </li>
            <li>
              <strong>Verification Requirements:</strong> Customers must provide their order reference and reasonable evidence of the reported issue to allow our team to investigate.
            </li>
            <li>
              <strong>No Duplicate Compensation:</strong> Customers who have received a replacement account for the same issue will not qualify for an additional refund for that same claim, except where required by applicable law.
            </li>
            <li>
              <strong>Non-Qualifying Claims:</strong> Refunds and replacements will not apply to issues caused by customer misuse, unauthorized sharing, policy violations or other clearly established warranty exclusions.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">4. Important Warranty Conditions</h2>
          <ul className="list-disc list-inside space-y-3">
            <li>The 30-day warranty begins on the date of successful first login.</li>
            <li>Claims must be submitted within the applicable warranty period.</li>
            <li>All suspension and inaccessibility claims are subject to verification.</li>
            <li>Approved replacements will match the original purchased product as closely as reasonably possible.</li>
            <li>Temporary service interruptions or provider maintenance do not automatically qualify as account suspension.</li>
            <li>Nothing in this policy limits consumer rights that cannot legally be excluded.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">5. Customer Support</h2>
          <p className="mb-4">For payment verification, delivery inquiries, refund requests or warranty claims, customers should contact our official support team.</p>
          <p className="mb-2">Please include your order reference, purchased product and a brief explanation of the issue.</p>
          <p className="font-medium">Our Commitment: We are committed to transparent transactions, timely digital delivery and fair customer support. Every eligible purchase is backed by our 30-day account replacement warranty.</p>
        </section>
      </Panel>
    </Page>
  );
}