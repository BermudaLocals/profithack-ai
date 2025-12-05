import nodemailer from 'nodemailer';

// Email transporter configuration
// In production, replace with real SMTP credentials
const transporter = nodemailer.default?.createTransporter ? nodemailer.default.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}) : {
  sendMail: async () => console.log('Email service not configured')
} as any;

interface WelcomeEmailData {
  email: string;
  username?: string;
  inviteCodes: string[];
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
  const { email, username, inviteCodes } = data;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to PROFITHACK AI</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          font-size: 32px;
          font-weight: 900;
          color: white;
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
          margin: 0;
          letter-spacing: 1px;
        }
        .badge {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          padding: 5px 15px;
          color: white;
          font-size: 12px;
          font-weight: 700;
          margin-top: 10px;
        }
        .content {
          padding: 40px 30px;
          color: #1f2937;
        }
        h1 {
          color: #1f2937;
          font-size: 28px;
          margin: 0 0 20px 0;
        }
        p {
          color: #4b5563;
          line-height: 1.6;
          margin: 0 0 16px 0;
        }
        .section {
          background: #f9fafb;
          border-left: 4px solid #8b5cf6;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .section h2 {
          color: #8b5cf6;
          font-size: 18px;
          margin: 0 0 12px 0;
        }
        .section ul {
          margin: 0;
          padding-left: 20px;
        }
        .section li {
          color: #4b5563;
          margin-bottom: 8px;
        }
        .invite-codes {
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          padding: 25px;
          border-radius: 12px;
          margin: 30px 0;
          text-align: center;
        }
        .invite-codes h3 {
          color: white;
          margin: 0 0 20px 0;
          font-size: 20px;
        }
        .code-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 15px;
        }
        .code {
          background: rgba(255,255,255,0.95);
          padding: 15px;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 18px;
          font-weight: 700;
          color: #8b5cf6;
          letter-spacing: 2px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          color: white;
          text-decoration: none;
          padding: 16px 40px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 16px;
          margin: 20px 0;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          transition: transform 0.2s;
        }
        .cta-button:hover {
          transform: translateY(-2px);
        }
        .tips {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .tips h3 {
          color: #d97706;
          margin: 0 0 12px 0;
          font-size: 16px;
        }
        .tips p {
          color: #78350f;
          margin: 0;
          font-size: 14px;
        }
        .footer {
          background: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 5px 0;
          font-size: 13px;
          color: #6b7280;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #8b5cf6;
          text-decoration: none;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1 class="logo">PROFITHACK AI</h1>
          <div class="badge">🔐 INVITE-ONLY PLATFORM</div>
        </div>

        <!-- Main Content -->
        <div class="content">
          <h1>🎉 Welcome${username ? `, ${username}` : ''}!</h1>
          <p>You've just joined the most exclusive creator platform on the internet. PROFITHACK AI combines TikTok-style content creation, OnlyFans-style premium subscriptions, and AI-powered code development all in one place.</p>

          <!-- What's Next Section -->
          <div class="section">
            <h2>🚀 Here's What to Do Next:</h2>
            <ul>
              <li><strong>Complete Your Profile:</strong> Add a username, bio, and profile picture to stand out</li>
              <li><strong>Upload Your First Video:</strong> Share a short clip (60s max) and start earning from day one</li>
              <li><strong>Explore the Workspace:</strong> Build AI-powered apps with our cloud IDE</li>
              <li><strong>Go Premium:</strong> Unlock exclusive content features and premium subscriptions</li>
              <li><strong>Invite Friends:</strong> Use your codes below to grow the community and earn rewards</li>
            </ul>
          </div>

          <!-- Invite Codes -->
          <div class="invite-codes">
            <h3>🎟️ Your 5 Friend Invite Codes</h3>
            <p style="color: rgba(255,255,255,0.9); margin: 0 0 15px 0;">Share these codes with friends to invite them to the platform!</p>
            <div class="code-grid">
              ${inviteCodes.map(code => `<div class="code">${code}</div>`).join('')}
            </div>
          </div>

          <!-- Pro Tips -->
          <div class="tips">
            <h3>💡 Pro Tips to Start Earning Fast:</h3>
            <p><strong>• Post Consistently:</strong> Upload 2-3 short videos per week to grow your following<br>
            <strong>• Engage with Comments:</strong> Reply to fans to build loyalty and boost engagement<br>
            <strong>• Use Sparks:</strong> Virtual gifts from fans go directly to your wallet (60% revenue share)<br>
            <strong>• Try Premium Content:</strong> Offer exclusive videos for subscribers at $9.99-$49.99/month</p>
          </div>

          <!-- CTA -->
          <center>
            <a href="https://profithackai.com" class="cta-button">🚀 Start Creating Now</a>
          </center>

          <!-- Payment Methods -->
          <div class="section">
            <h2>💰 Global Payment Support</h2>
            <p>We support payments from anywhere in the world:</p>
            <ul>
              <li><strong>PayPal:</strong> Available globally</li>
              <li><strong>Cryptocurrency:</strong> Bitcoin, Ethereum, USDT, USDC</li>
              <li><strong>TON:</strong> Fast Telegram blockchain payments</li>
              <li><strong>Mobile Money:</strong> MTN MoMo (Africa)</li>
              <li><strong>Payoneer & Square:</strong> For creators worldwide</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>PROFITHACK AI</strong></p>
          <p>The world's most powerful creator platform</p>
          <p style="margin-top: 15px;">Based in Bermuda 🇧🇲 | Serving creators worldwide 🌍</p>
          
          <div class="social-links">
            <a href="#">Twitter</a>
            <a href="#">Instagram</a>
            <a href="#">TikTok</a>
            <a href="#">Discord</a>
          </div>
          
          <p style="margin-top: 20px; font-size: 11px;">
            You received this email because you signed up for PROFITHACK AI.<br>
            Have questions? Reply to this email and we'll help you out.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailText = `
Welcome to PROFITHACK AI!

You've just joined the most exclusive creator platform on the internet.

WHAT'S NEXT:
1. Complete your profile with a username and bio
2. Upload your first video and start earning
3. Explore the AI-powered workspace
4. Go premium to unlock exclusive features
5. Invite friends using your codes below

YOUR 5 FRIEND INVITE CODES:
${inviteCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

PRO TIPS TO START EARNING:
• Post 2-3 videos per week
• Engage with your fans in comments
• Use Sparks (virtual gifts) - 60% goes to you
• Try premium content subscriptions ($9.99-$49.99/month)

GLOBAL PAYMENT SUPPORT:
We accept PayPal, Crypto (BTC, ETH, USDT, USDC), TON, MTN MoMo, Payoneer, and Square.

Ready to start? Visit: https://profithackai.com

Questions? Just reply to this email.

- The PROFITHACK AI Team
Based in Bermuda 🇧🇲 | Serving creators worldwide 🌍
  `;

  try {
    // Only send if SMTP is configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"PROFITHACK AI" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🎉 Welcome to PROFITHACK AI - Your Invite Codes Inside!',
        text: emailText,
        html: emailHtml,
      });
      console.log(`✅ Welcome email sent to: ${email}`);
    } else {
      console.log(`📧 Email not configured - would have sent welcome email to: ${email}`);
      console.log(`Invite codes: ${inviteCodes.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw - email failure shouldn't block signup
  }
}

export const emailService = {
  sendWelcomeEmail,
};
