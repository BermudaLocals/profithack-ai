import { Link } from 'wouter';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-pink-400 mb-8" data-testid="link-back">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-pink-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground">🔒 WE DON'T SELL YOUR DATA. PERIOD.</p>
          <p className="text-sm text-muted-foreground mt-2">Last Updated: November 4, 2024</p>
        </div>

        <div className="text-muted-foreground space-y-8">
          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">What we collect:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Email, username, display name, password (hashed)</li>
              <li><strong>Profile Data:</strong> Bio, profile photo, website link, social media links, age verification (18+ ID for premium features)</li>
              <li><strong>Payment Info:</strong> Processed by PayPal, Square, Stripe, crypto providers - we don't store credit card numbers</li>
              <li><strong>Content:</strong> Videos, messages, project files, code (for service delivery)</li>
              <li><strong>Usage Analytics:</strong> Page views, feature usage, video engagement (to improve the platform)</li>
              <li><strong>Device Information:</strong> Browser type, IP address, device type (for security and fraud prevention)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">What we DON'T collect:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Private browsing history outside our platform</li>
              <li>Personal data from other services without your permission</li>
              <li>Precise location data (unless you choose to share for live streaming)</li>
              <li>Microphone/camera access when not actively using video features</li>
              <li>Anything you don't explicitly provide or authorize</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">How we use your data:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Provide Services:</strong> Deliver platform features, host your content, process payments</li>
              <li><strong>Improve Platform:</strong> Analyze usage patterns to enhance user experience</li>
              <li><strong>Communication:</strong> Send important updates, security alerts, billing notifications</li>
              <li><strong>Prevent Fraud:</strong> Detect and prevent abuse, spam, illegal activity</li>
              <li><strong>Personalization:</strong> Recommend content, customize your feed (optional - you can opt out)</li>
              <li><strong>Legal Compliance:</strong> Comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Third parties we share with:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Payment Processors:</strong> PayPal, Square, Stripe, NOWPayments, Payoneer, Payeer (for transactions)</li>
              <li><strong>Cloud Infrastructure:</strong> Replit, Neon (PostgreSQL), Object Storage providers (for hosting)</li>
              <li><strong>AI Providers:</strong> OpenAI, Anthropic, Google AI (when you use AI features with your own API keys)</li>
              <li><strong>Analytics:</strong> Aggregated, anonymized data for performance metrics</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect safety</li>
            </ul>
            <p className="mt-4"><strong>We NEVER sell your personal data to advertisers or data brokers.</strong></p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Data security:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Encryption:</strong> 256-bit SSL/TLS encryption for data in transit</li>
              <li><strong>Password Security:</strong> Bcrypt hashing for passwords (we can't see your password)</li>
              <li><strong>ID Verification:</strong> Government IDs encrypted and stored securely (only for 18+ premium features)</li>
              <li><strong>Regular Audits:</strong> Security reviews and penetration testing</li>
              <li><strong>Team Training:</strong> Staff trained on privacy best practices and GDPR compliance</li>
              <li><strong>Breach Notification:</strong> We'll notify you within 72 hours of any data breach</li>
            </ul>
            <p className="mt-4 text-sm">We're not perfect, but we take security seriously and continuously improve our practices.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Your rights (GDPR & CCPA compliant):</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> View all data we have about you anytime in Settings</li>
              <li><strong>Delete:</strong> Request account deletion and data erasure (we'll comply within 30 days)</li>
              <li><strong>Export:</strong> Download your data in portable format (JSON/CSV)</li>
              <li><strong>Opt Out:</strong> Disable analytics tracking, personalized recommendations</li>
              <li><strong>Privacy Settings:</strong> Control who sees your profile, content, and activity</li>
              <li><strong>Data Portability:</strong> Take your content with you if you leave</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Cookies & tracking:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for login, security, and core functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use the platform (you can opt out)</li>
              <li><strong>No Ad Tracking:</strong> We don't use third-party advertising cookies</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Age requirements:</h3>
            <p>PROFITHACK AI is for users <strong>18 years and older</strong>. We do not knowingly collect data from minors. If we discover a user is under 18, we'll delete their account immediately.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">International users:</h3>
            <p>PROFITHACK AI is accessible globally. Your data may be transferred to and stored in the United States or other countries. By using our platform, you consent to this transfer. We comply with GDPR for EU users and CCPA for California residents.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Changes to this policy:</h3>
            <p>We may update this Privacy Policy from time to time. We'll notify you of significant changes via email and in-app notification. Continued use after changes means you accept the updated policy.</p>
          </section>

          <div className="mt-8 p-4 bg-muted rounded-lg border">
            <p className="text-sm"><strong>Privacy Questions?</strong> Contact: <strong>privacy@profithackai.com</strong> with "PRIVACY" in subject line.</p>
            <p className="text-sm text-muted-foreground mt-2">👆 Full Policy: profithackai.com/privacy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
