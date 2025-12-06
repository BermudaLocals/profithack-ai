import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-pink-400 mb-8" data-testid="link-back">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="text-muted-foreground space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">📜 PROFITHACK AI TERMS OF SERVICE</h2>
            <p className="text-sm mb-4">LAST UPDATED: November 4, 2024</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">1. ACCEPTANCE</h3>
            <p>By using PROFITHACK AI, you agree to these terms. If you don't agree, don't use our platform. You must be 18 years or older to use this platform.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">2. WHAT WE PROVIDE</h3>
            <p>We provide a comprehensive digital ecosystem platform combining TikTok-style social media, AI code workspace, content creation tools, and creator monetization. Creator earnings are subject to platform revenue share and payment processor fees.</p>
            
            <h4 className="text-lg font-semibold text-foreground mt-4 mb-2">Core Features:</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Social Platform:</strong> TikTok-style video feed, profiles, messaging, and video calls (FREE tier available)</li>
              <li><strong>AI Lab:</strong> Cloud IDE with Monaco editor, WebContainer, AI code assistance (PAID tiers)</li>
              <li><strong>Marketing Bots:</strong> 100 AI bots for automated content creation and cross-platform posting (PAID tiers)</li>
              <li><strong>Creator Monetization:</strong> Virtual gifts, premium subscriptions, live streaming, ad revenue</li>
            </ul>

            <h4 className="text-lg font-semibold text-foreground mt-4 mb-2">Video Calling Features:</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>DMs (WhatsApp-style):</strong> FREE 1-on-1 video calls available to all users</li>
              <li><strong>Live Streaming (TikTok-style):</strong> Unlocked after 500 followers - stream to your audience</li>
              <li><strong>Premium 1-on-1 (OnlyFans-style):</strong> Credit-based live video calls - users buy credits and pay per minute for private video sessions with creators. Creators set their own per-minute rates.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">3. PAYMENTS & SUBSCRIPTIONS</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subscriptions renew monthly unless cancelled</li>
              <li>Credit packs never expire</li>
              <li>All prices listed in USD (1 credit ≈ $0.024 USD)</li>
              <li>Prices may change with 30-day notice for existing users</li>
              <li>We support multiple payment providers: PayPal, Square, Crypto (Bitcoin, TON), Payoneer, Payeer, NOWPayments</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">4. CREATOR REVENUE SHARE</h3>
            <div className="bg-pink-900/20 border border-pink-600/30 rounded-lg p-4 mb-4">
              <p className="font-bold text-pink-400">📊 CREATOR REVENUE PROGRAM</p>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Sparks (Virtual Gifts):</strong> 50% creator / 50% platform revenue split</li>
              <li><strong>Premium Subscriptions:</strong> 50% creator / 50% platform revenue split</li>
              <li><strong>Premium Live Shows:</strong> 50% creator / 50% platform revenue split (up to 20 participants)</li>
              <li><strong>AI Tools & Workspace:</strong> 100% platform revenue (covers AI API costs)</li>
              <li>All platform fees are deducted before crediting your wallet</li>
              <li>Withdrawal processing fees may apply based on payment method</li>
            </ul>
            
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 mt-4">
              <p className="font-bold text-green-400 mb-2">💰 Simple 50/50 Split</p>
              <p className="text-sm">
                PROFITHACK AI uses a transparent <strong className="text-green-400">50% creator / 50% platform</strong> split on all creator earnings. 
                This matches industry standards while offering <strong className="text-green-400">weekly payouts</strong> instead of monthly, 
                <strong className="text-green-400">global payment options</strong> including cryptocurrency, and <strong className="text-green-400">multi-person premium live shows</strong> (up to 20 people) - 
                giving creators more ways to monetize and more control over their money.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">5. PAYOUT SCHEDULE & TERMS</h3>
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-4">
              <p className="font-bold text-blue-400">💰 WEEKLY PAYOUTS</p>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Payout Frequency:</strong> Weekly payouts every Monday</li>
              <li><strong>Minimum Balance:</strong> $10 USD required to request payout</li>
              <li><strong>Initial Hold Period:</strong> 14 days (2 weeks) for new earnings to protect against fraud</li>
              <li><strong>After First 2 Weeks:</strong> Weekly payouts for all earnings older than 14 days</li>
              <li><strong>Available Balance:</strong> Only earnings older than 14 days are eligible for withdrawal</li>
              <li><strong>Processing Time:</strong> 3-7 business days depending on payment method</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">6. CHARGEBACK & REFUND POLICY</h3>
            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-4">
              <p className="font-bold text-red-400">⚠️ NO REFUNDS - DIGITAL PRODUCTS</p>
            </div>
            <p className="mb-4">PROFITHACK AI is a digital product platform. All sales are final. <strong>No refunds</strong> for:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Unused subscription time (you can cancel to stop future billing)</li>
              <li>Unused credits (credits never expire)</li>
              <li>Change of mind or buyer's remorse</li>
              <li>Difficulty using features (we offer free support)</li>
            </ul>

            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mt-4 mb-4">
              <p className="font-bold text-red-400 mb-2">⚠️ CHARGEBACK PENALTIES</p>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Creator Responsibility:</strong> Chargebacks from your subscribers are deducted from your wallet balance</li>
              <li><strong>Chargeback Fee:</strong> $20 USD fee per chargeback (industry standard)</li>
              <li><strong>Negative Balance:</strong> If chargebacks exceed your balance, you owe the platform the difference</li>
              <li><strong>Suspension Risk:</strong> Excessive chargebacks ({'>'}5% of transactions) may result in account suspension</li>
              <li><strong>Fraud Protection:</strong> False/fraudulent chargebacks will be disputed on your behalf</li>
              <li><strong>Payment Blocks:</strong> Account must have positive balance before new payouts are processed</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">7. CONTENT MODERATION POLICY</h3>
            <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4 mb-4">
              <p className="font-bold text-purple-400">🔞 TWO-TIER MODERATION SYSTEM</p>
            </div>
            
            <h4 className="text-lg font-semibold text-green-400 mt-4 mb-2">Public Areas (Feed, Videos, DMs, AI Lab)</h4>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Active Moderation:</strong> AI + human moderation to keep public spaces safe for all users</li>
              <li><strong>Content Flags:</strong> Users can report inappropriate content for review</li>
              <li><strong>3-Strike Policy:</strong> Violations result in warnings, then suspension, then permanent ban</li>
              <li><strong>Protected Community:</strong> No harassment, hate speech, illegal content, or spam allowed</li>
            </ul>

            <h4 className="text-lg font-semibold text-purple-400 mt-4 mb-2">Premium Features (18+ OnlyFans-Style)</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>ID Verification Required:</strong> Both creators and subscribers must upload government-issued ID (driver's license, passport, or state ID) to verify they are 18+</li>
              <li><strong>Secure ID Storage:</strong> Your ID is encrypted and securely stored. We only use it for age verification purposes</li>
              <li><strong>Verification Process:</strong> ID verification typically takes 24-48 hours for manual review</li>
              <li><strong>Premium Subscriptions:</strong> Creators offer private content (videos, images) to paying subscribers</li>
              <li><strong>Live 1-on-1 Video Calls:</strong> Users buy credits to pay per minute for private live video sessions with creators</li>
              <li><strong>Creator Sets Rates:</strong> Creators control their own subscription prices and per-minute video call rates</li>
              <li><strong>Minimal Platform Moderation:</strong> Platform takes a hands-off approach to adult content in Premium features</li>
              <li><strong>Creator Control:</strong> YOU control who subscribes to your content and can block users at any time</li>
              <li><strong>Illegal Content Only:</strong> Platform only removes content that violates applicable laws (no other restrictions)</li>
              <li><strong>No Liability:</strong> Platform is not responsible for creator-uploaded content in Premium features</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">8. YOUR CONTENT & CODE</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>You retain intellectual property rights to what you create</li>
              <li>We get license to display/promote your public content on the platform</li>
              <li>Private projects and premium content remain private</li>
              <li>We never sell your data to third parties</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">9. PROHIBITED USES</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>No illegal activities</li>
              <li>No spam or harassment in public areas</li>
              <li>No copyright infringement</li>
              <li>No malicious code distribution</li>
              <li>No underage users (must be 18+)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">10. ACCOUNT SUSPENSION</h3>
            <p>We reserve the right to suspend accounts for violations. No refund will be issued for remaining subscription time as this is a digital product with a no-refund policy.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">11. LIABILITY</h3>
            <p>Our liability is limited to your subscription cost for the current billing period. Use the platform at your own risk. We are not responsible for creator-uploaded content in premium features.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">12. SUPPORT</h3>
            <p>Email <strong>support@profithackai.com</strong> for help with technical issues, billing questions, or general inquiries. We aim to respond within 24-48 hours.</p>
          </section>

          <div className="mt-8 p-4 bg-muted rounded-lg border">
            <p className="text-sm">Questions? Contact: <strong>support@profithackai.com</strong></p>
            <p className="text-sm text-muted-foreground mt-2">👆 Full Terms: profithackai.com/terms</p>
          </div>
        </div>
      </div>
    </div>
  );
}
