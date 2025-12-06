import { Link } from 'wouter';
import { ArrowLeft, XCircle } from 'lucide-react';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-pink-400 mb-8" data-testid="link-back">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <XCircle className="w-16 h-16 text-pink-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
          <p className="text-xl text-muted-foreground">🚫 NO REFUNDS - DIGITAL PRODUCTS</p>
          <p className="text-sm text-muted-foreground mt-2">Last Updated: November 21, 2025</p>
        </div>

        <div className="text-muted-foreground space-y-8">
          <section>
            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-red-400 mb-4">⚠️ Important: All Sales Are Final</h3>
              <p className="text-foreground">
                PROFITHACK AI is a <strong>digital product platform</strong>. Once you gain access to features, content, or credits, 
                you cannot return or exchange them. Therefore, <strong>we do not offer refunds</strong> under any circumstances.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">What this means:</h3>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong>Subscriptions:</strong> No refunds for unused subscription time. You can cancel at any time to stop future billing, 
                but you won't receive a refund for the current billing period.
              </li>
              <li>
                <strong>Credit Packs:</strong> No refunds for unused credits. Credits never expire, so you can use them anytime.
              </li>
              <li>
                <strong>Premium Features:</strong> No refunds once you've accessed AI tools, workspace features, or marketing bots.
              </li>
              <li>
                <strong>Change of Mind:</strong> We cannot process refunds due to buyer's remorse or change of mind.
              </li>
              <li>
                <strong>Difficulty Using Features:</strong> We offer free support to help you use the platform. Contact support@profithackai.com for assistance.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">How to cancel your subscription:</h3>
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-4">
              <p className="text-foreground">
                You can cancel your subscription at any time from <strong>Settings → Billing</strong>. 
                Your subscription will remain active until the end of your current billing period, then it will not renew.
              </p>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li>Go to Settings → Billing</li>
              <li>Click "Cancel Subscription"</li>
              <li>Confirm cancellation</li>
              <li>You'll keep access until the end of your billing period</li>
              <li>Your account will automatically downgrade to the FREE tier when the period ends</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Exceptions (Very Limited):</h3>
            <p className="mb-4">We may issue refunds only in these extremely rare cases:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Duplicate Charges:</strong> If you were accidentally charged twice for the same transaction</li>
              <li><strong>Unauthorized Charges:</strong> If someone made a purchase on your account without your permission (requires verification)</li>
              <li><strong>Technical Error:</strong> If a billing error on our end caused an incorrect charge</li>
            </ul>
            <p className="mt-4 text-sm">
              These exceptions require proof and verification. Email <strong>support@profithackai.com</strong> with "BILLING ERROR" in the subject line 
              and provide transaction details.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Chargebacks:</h3>
            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-4">
              <p className="font-semibold text-red-400 mb-2">⚠️ WARNING: Do Not File Chargebacks</p>
              <p className="text-foreground text-sm">
                Filing a chargeback for a legitimate purchase is considered fraud and will result in immediate account termination.
              </p>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>$20 Chargeback Fee:</strong> Industry-standard fee applied to all chargebacks</li>
              <li><strong>Account Suspension:</strong> Your account will be suspended pending investigation</li>
              <li><strong>Permanent Ban:</strong> Fraudulent chargebacks result in permanent account termination</li>
              <li><strong>No Access:</strong> You'll lose all content, projects, credits, and data</li>
            </ul>
            <p className="mt-4">
              If you have a billing issue, <strong>contact us first</strong> at support@profithackai.com. We're here to help resolve legitimate problems.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Why no refunds?</h3>
            <p className="mb-4">
              PROFITHACK AI provides <strong>instant access to digital products</strong> including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>AI-powered tools and automation</li>
              <li>Cloud infrastructure and storage</li>
              <li>Marketing bots and content generation</li>
              <li>Video streaming and hosting</li>
              <li>Code workspace and execution environment</li>
            </ul>
            <p>
              Once you access these features, we've already incurred costs (AI API usage, cloud hosting, bandwidth). 
              Unlike physical products, digital services cannot be "returned" after use.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Free tier available:</h3>
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
              <p className="text-foreground mb-2">
                <strong>Try before you buy:</strong> PROFITHACK AI offers a FREE tier so you can test the platform before subscribing.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>TikTok-style video feed</li>
                <li>Social profile and messaging</li>
                <li>Basic video uploads</li>
                <li>Free 1-on-1 video calls</li>
              </ul>
              <p className="text-sm mt-3">
                Upgrade to PAID tiers only when you're ready for AI Lab, marketing bots, and advanced features.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Need help?</h3>
            <p className="mb-4">
              Before cancelling or filing a dispute, please reach out to us. We're committed to helping you succeed on the platform:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Technical Support:</strong> support@profithackai.com</li>
              <li><strong>Billing Questions:</strong> billing@profithackai.com</li>
              <li><strong>Response Time:</strong> 24-48 hours</li>
            </ul>
          </section>

          <div className="mt-8 p-4 bg-muted rounded-lg border">
            <p className="text-sm font-semibold mb-2">Summary:</p>
            <p className="text-sm mb-2">
              ✅ <strong>You CAN:</strong> Cancel subscription anytime (stops future billing)
            </p>
            <p className="text-sm mb-2">
              ❌ <strong>You CANNOT:</strong> Get refunds for current subscription or unused credits
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Questions? Contact: <strong>support@profithackai.com</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-1">👆 Full Policy: profithackai.com/refund</p>
          </div>
        </div>
      </div>
    </div>
  );
}
