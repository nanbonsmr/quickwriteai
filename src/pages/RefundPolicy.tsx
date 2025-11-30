import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <RotateCcw className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Refund Policy</h1>
          </div>
          <p className="text-muted-foreground">Last updated: November 30, 2024</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
      </div>

      <Card className="p-6 space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            At QuickWrite AI, we strive to provide high-quality AI-powered content generation services. We want you to be completely satisfied with your purchase. This Refund Policy outlines the terms and conditions under which refunds may be granted for our subscription services.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            By subscribing to our services, you acknowledge that you have read, understood, and agree to be bound by this Refund Policy. Please read this policy carefully before making any purchase.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Subscription Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            QuickWrite AI offers subscription-based services that provide access to our AI content generation platform. Our subscriptions are billed on a recurring basis (monthly or annually) depending on the plan you choose.
          </p>
          
          <h3 className="text-lg font-medium mt-4">1.1 Free Trial Period</h3>
          <p className="text-muted-foreground leading-relaxed">
            We offer a free tier that allows you to explore our platform before committing to a paid subscription. We encourage you to take full advantage of this opportunity to ensure our service meets your needs before upgrading.
          </p>

          <h3 className="text-lg font-medium mt-4">1.2 Subscription Plans</h3>
          <p className="text-muted-foreground leading-relaxed">
            Our paid subscription plans include various features and usage limits. Please review the details of each plan carefully before subscribing to ensure it meets your requirements.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Refund Eligibility</h2>
          <p className="text-muted-foreground leading-relaxed">
            We understand that circumstances may change, and we aim to be fair in our refund considerations. The following guidelines apply to refund requests:
          </p>
          
          <h3 className="text-lg font-medium mt-4">2.1 Eligible for Refund</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Requests made within 7 days of initial subscription purchase</li>
            <li>Technical issues that prevent you from using the service and cannot be resolved by our support team</li>
            <li>Duplicate charges or billing errors</li>
            <li>Service unavailability for extended periods (more than 48 consecutive hours) not caused by scheduled maintenance</li>
            <li>Significant feature changes that materially affect your use of the service</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">2.2 Not Eligible for Refund</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Requests made after 7 days from the purchase date</li>
            <li>Change of mind after using the service</li>
            <li>Failure to cancel before automatic renewal</li>
            <li>Dissatisfaction with AI-generated content quality (as AI output can vary)</li>
            <li>Exceeding usage limits or account suspension due to policy violations</li>
            <li>Partial refunds for unused portions of a subscription period</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Refund Process</h2>
          <p className="text-muted-foreground leading-relaxed">
            To request a refund, please follow these steps:
          </p>
          
          <h3 className="text-lg font-medium mt-4">3.1 How to Request a Refund</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
            <li>Contact our support team through our Contact page or email us directly</li>
            <li>Provide your account email address and the reason for your refund request</li>
            <li>Include any relevant details or documentation supporting your request</li>
            <li>Allow up to 5 business days for our team to review your request</li>
          </ol>

          <h3 className="text-lg font-medium mt-4">3.2 Refund Timeline</h3>
          <p className="text-muted-foreground leading-relaxed">
            Once a refund is approved, the processing time depends on your payment method:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
            <li><strong>PayPal:</strong> 3-5 business days</li>
            <li><strong>Bank Transfer:</strong> 7-14 business days</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Please note that the actual time for the refund to appear in your account may vary depending on your financial institution.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Cancellation Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            You may cancel your subscription at any time. Here's what you need to know about cancellations:
          </p>
          
          <h3 className="text-lg font-medium mt-4">4.1 How to Cancel</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Log into your account and navigate to Settings</li>
            <li>Go to the Subscription or Billing section</li>
            <li>Click "Cancel Subscription" and follow the prompts</li>
            <li>You will receive a confirmation email once your cancellation is processed</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">4.2 Effect of Cancellation</h3>
          <p className="text-muted-foreground leading-relaxed">
            When you cancel your subscription:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>You will retain access to your subscription features until the end of your current billing period</li>
            <li>Your account will not be charged for subsequent billing periods</li>
            <li>Your generated content history will be preserved and accessible</li>
            <li>You can resubscribe at any time to regain access to premium features</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Annual Subscriptions</h2>
          <p className="text-muted-foreground leading-relaxed">
            Annual subscriptions are subject to the same refund policy with the following additional considerations:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>The 7-day refund window applies from the date of purchase or renewal</li>
            <li>Annual subscribers receive a discounted rate; partial refunds for unused months are not available</li>
            <li>If you cancel mid-term, you retain access until the end of your annual billing cycle</li>
            <li>We may offer pro-rated refunds at our discretion for exceptional circumstances</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Chargebacks</h2>
          <p className="text-muted-foreground leading-relaxed">
            We encourage you to contact us directly before initiating a chargeback with your bank or credit card company. Chargebacks can result in:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Immediate suspension of your account</li>
            <li>Loss of access to all generated content and account data</li>
            <li>Potential additional fees</li>
            <li>Difficulty opening new accounts with our service</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Most issues can be resolved quickly and amicably by contacting our support team directly.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Special Circumstances</h2>
          <p className="text-muted-foreground leading-relaxed">
            We understand that exceptional situations may arise. In cases not covered by this policy, we reserve the right to evaluate refund requests on a case-by-case basis. Such circumstances may include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Medical emergencies or unforeseen personal circumstances</li>
            <li>Significant service disruptions on our end</li>
            <li>Errors in our pricing or promotional offers</li>
            <li>Other situations deemed appropriate by our management team</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. Promotional Offers and Discounts</h2>
          <p className="text-muted-foreground leading-relaxed">
            Subscriptions purchased using promotional codes, discounts, or special offers are subject to the same refund policy. However:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Refund amounts will be based on the actual amount paid, not the original price</li>
            <li>Promotional credits or free months are non-refundable</li>
            <li>Discount codes are single-use and cannot be reapplied after a refund</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">9. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting to our website. We will notify subscribers of any material changes via email. Your continued use of our services after any changes indicates acceptance of the updated policy.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The refund policy in effect at the time of your purchase will apply to that transaction.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this Refund Policy or need to request a refund, please contact us through one of the following methods:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li><strong>Email:</strong> support@quickwriteai.com</li>
            <li><strong>Contact Page:</strong> Visit our Contact page on the website</li>
            <li><strong>Response Time:</strong> We aim to respond to all inquiries within 24-48 hours</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            When contacting us about a refund, please include your account email, purchase date, and a detailed explanation of your request to help us process it as quickly as possible.
          </p>
        </section>
      </Card>
    </div>
  );
}