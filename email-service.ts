import nodemailer from "nodemailer";

// Available logos for random selection in emails
const AVAILABLE_LOGOS = [
  '/logo.png',
  '/logo-profithack.png',
  '/logo-masonic.png',
  '/logo2_1763894382460.png',
  '/logo3_1763894382462.png',
  '/logo4_1763894382463.png',
  '/logo5_1763894382465.png',
  '/logo6_1763870238610.png',
  '/logo6_1763894382467.png',
  '/logo 8_1763894382458.png',
];

// Get random logo for email
const getRandomLogo = (): string => {
  const randomIndex = Math.floor(Math.random() * AVAILABLE_LOGOS.length);
  return AVAILABLE_LOGOS[randomIndex];
};

// Master email template function - consistent layout for ALL emails
const createEmailTemplate = (content: string, title: string = ''): string => {
  const appUrl = process.env.APP_URL || 'https://profithackai.com';
  const logoUrl = `${appUrl}${getRandomLogo()}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background: #0a0a0a;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .email-wrapper {
          background: #0a0a0a;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #1a1a1a;
          border-radius: 0;
          overflow: hidden;
        }
        .header {
          background: #1a1a1a;
          padding: 30px 20px;
          text-align: center;
          border-bottom: 1px solid #2a2a2a;
        }
        .logo-img {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          margin-bottom: 15px;
        }
        .logo-text {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .content {
          padding: 30px 25px;
          color: #e0e0e0;
          background: #1a1a1a;
        }
        .footer {
          background: #1a1a1a;
          padding: 25px 20px;
          text-align: center;
          color: #666;
          font-size: 13px;
          border-top: 1px solid #2a2a2a;
        }
        .footer-link {
          color: #888;
          text-decoration: none;
          margin: 0 8px;
        }
        .footer-link:hover {
          color: #aaa;
        }
        ${title ? `
        .title {
          font-size: 18px;
          font-weight: bold;
          color: #ffffff;
          margin: 0 0 20px 0;
          text-align: left;
        }
        ` : ''}
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td>
              <div class="container">
                <div class="header">
                  <img src="${logoUrl}" alt="PROFITHACK AI" class="logo-img" />
                  <div class="logo-text">PROFITHACK AI</div>
                </div>
                
                <div class="content">
                  ${title ? `<h2 class="title">${title}</h2>` : ''}
                  ${content}
                </div>
                
                <div class="footer">
                  <p style="margin: 0 0 12px 0; font-weight: 600; color: #888;">
                    PROFITHACK AI
                  </p>
                  <p style="margin: 0 0 12px 0; color: #666; font-size: 12px;">
                    The Ultimate Creator Monetization Platform
                  </p>
                  <p style="margin: 12px 0 0 0;">
                    <a href="${appUrl}" class="footer-link">Website</a>
                    <a href="${appUrl}/help" class="footer-link">Help</a>
                    <a href="${appUrl}/privacy" class="footer-link">Privacy</a>
                  </p>
                  <p style="margin: 15px 0 0 0; font-size: 11px; color: #555;">
                    © ${new Date().getFullYear()} PROFITHACK AI. All rights reserved.
                  </p>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;
};

// Check if email is configured
export const isEmailConfigured = (): boolean => {
  return !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);
};

// Create transporter
const getTransporter = () => {
  if (!isEmailConfigured()) {
    console.warn("⚠️  Email not configured - using development mode (logs only)");
    // Return a test transporter that just logs
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Generate a 4-digit verification code
export const generateEmailVerificationCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send verification code email
export const sendVerificationEmail = async (
  email: string,
  code: string,
  name?: string
): Promise<boolean> => {
  try {
    const transporter = getTransporter();
    
    const emailContent = `
      <div style="text-align: left;">
        <p style="font-size: 24px; font-weight: bold; color: #ffffff; margin: 0 0 20px 0;">
          Hey ${name || 'there'}! 👋
        </p>
        
        <p style="font-size: 15px; line-height: 1.6; color: #b0b0b0; margin: 0 0 25px 0;">
          Here's your verification code to access PROFITHACK AI. Enter this code to continue:
        </p>
        
        <div style="background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
          <div style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: white; font-family: 'Courier New', monospace; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
            ${code}
          </div>
          <div style="font-size: 14px; color: rgba(255,255,255,0.8); margin-top: 10px;">
            Your Verification Code
          </div>
        </div>
        
        <div style="background: #2a2a2a; border-left: 3px solid #fbbf24; padding: 15px 18px; margin: 25px 0; border-radius: 6px;">
          <p style="margin: 0; font-size: 13px; color: #fbbf24;">
            ⏱️ This code expires in 10 minutes
          </p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; color: #b0b0b0; margin: 25px 0;">
          If you didn't request this code, you can safely ignore this email.
        </p>
        
        <div style="background: #2a2a2a; border-left: 3px solid #22d3ee; padding: 15px 18px; margin: 25px 0 0 0; border-radius: 6px;">
          <p style="margin: 0; font-size: 13px; color: #888;">
            <strong style="color: #22d3ee;">🔒 Security Tip:</strong> Never share this code with anyone. PROFITHACK AI will never ask for your verification code via phone, email, or social media.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"PROFITHACK AI" <${process.env.EMAIL_USER || "noreply@profithackai.com"}>`,
      to: email,
      subject: `${code} is your PROFITHACK AI verification code`,
      html: createEmailTemplate(emailContent, ''),
      text: `
Hey ${name || 'there'}!

Your PROFITHACK AI verification code is: ${code}

This code expires in 10 minutes.

If you didn't request this code, you can safely ignore this email.

Security Tip: Never share this code with anyone.

---
PROFITHACK AI - The Ultimate Creator Monetization Platform
© ${new Date().getFullYear()} PROFITHACK AI. All rights reserved.
      `.trim(),
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (!isEmailConfigured()) {
      console.log("📧 [DEV MODE] Verification email (would be sent):");
      console.log(`   To: ${email}`);
      console.log(`   Code: ${code}`);
      console.log(`   Expires: 10 minutes`);
    } else {
      console.log("✅ Verification email sent to:", email);
    }
    
    return true;
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    
    // In dev mode, still return true so testing can continue
    if (!isEmailConfigured()) {
      console.log("📧 [DEV MODE] Email sending simulated successfully");
      return true;
    }
    
    return false;
  }
};

// Send email verification link + credentials + invite codes to new user
export const sendVerificationWithInviteCodes = async (
  email: string,
  verificationToken: string,
  inviteCodes: string[],
  name?: string,
  password?: string // Plain password to include in welcome email (one-time only)
): Promise<boolean> => {
  try {
    const transporter = getTransporter();
    const verificationLink = `${process.env.APP_URL || 'https://profithackai.com'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: `"PROFITHACK AI" <${process.env.EMAIL_USER || "noreply@profithackai.com"}>`,
      to: email,
      subject: "✅ Verify Your Email + Your 5 Invite Codes! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%);
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: #1f1f2e;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            .header {
              background: linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #22d3ee 100%);
              padding: 40px 20px;
              text-align: center;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: white;
              margin: 0;
              text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }
            .content {
              padding: 40px 30px;
              color: #e0e0e0;
            }
            .greeting {
              font-size: 24px;
              margin-bottom: 20px;
              color: white;
              text-align: center;
            }
            .message {
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 30px;
              color: #b0b0b0;
              text-align: center;
            }
            .verify-button {
              display: inline-block;
              background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
              color: white;
              padding: 18px 50px;
              border-radius: 30px;
              text-decoration: none;
              font-weight: bold;
              font-size: 18px;
              margin: 20px 0;
              box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);
            }
            .codes-container {
              background: #2a2a3e;
              border-radius: 12px;
              padding: 30px;
              margin: 30px 0;
            }
            .codes-title {
              font-size: 18px;
              font-weight: bold;
              color: #22d3ee;
              margin-bottom: 20px;
              text-align: center;
            }
            .code-item {
              background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
              border-radius: 8px;
              padding: 15px 20px;
              margin: 10px 0;
              text-align: center;
              font-size: 20px;
              font-weight: bold;
              letter-spacing: 2px;
              color: white;
              font-family: 'Courier New', monospace;
              box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
            }
            .tip {
              background: #2a2a3e;
              border-left: 4px solid #22d3ee;
              padding: 15px 20px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 14px;
              color: #22d3ee;
            }
            .footer {
              background: #16161f;
              padding: 30px;
              text-align: center;
              color: #666;
              font-size: 14px;
              border-top: 1px solid #2a2a3e;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">PROFITHACK AI</h1>
            </div>
            
            <div class="content">
              <div class="greeting">
                🎉 Welcome to PROFITHACK AI, ${name || 'Creator'}!
              </div>
              
              <p class="message" style="font-size: 18px; color: #22d3ee; margin-bottom: 15px;">
                Thank you for joining us! 🙏
              </p>
              
              <div style="background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); border-radius: 12px; padding: 30px; margin: 25px 0; text-align: center;">
                <p style="font-size: 22px; font-weight: bold; color: white; margin: 0 0 15px 0; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                  🌟 YOUR WEALTH JOURNEY STARTS HERE! 🌟
                </p>
                <p style="font-size: 16px; color: white; margin: 0 0 10px 0; line-height: 1.6;">
                  You've just joined <strong>the ONLY super app in the world</strong> where creators turn content into cash! 💰
                </p>
                <p style="font-size: 15px; color: #fff; margin: 0; line-height: 1.5;">
                  We wish you <strong>tears of success</strong> on your creator journey! 🚀
                </p>
              </div>
              
              <div style="background: #2a2a3e; border-radius: 12px; padding: 25px; margin: 25px 0; border: 2px solid #22d3ee;">
                <p style="font-size: 18px; font-weight: bold; color: #22d3ee; margin: 0 0 15px 0; text-align: center;">
                  📦 YOUR PACKAGE
                </p>
                <p style="font-size: 15px; color: #e0e0e0; margin: 0; text-align: center; line-height: 1.8;">
                  ✅ FREE Social Platform Access<br>
                  ✅ TikTok-Style Video Feed<br>
                  ✅ AI Code Workspace<br>
                  ✅ 55% Creator Revenue Share<br>
                  ✅ 5 Invite Codes to Share<br>
                  ✅ Unlimited Earning Potential
                </p>
              </div>
              
              <div style="background: #2a2a3e; border-radius: 12px; padding: 25px; margin: 25px 0; border: 2px solid #22d3ee;">
                <p style="font-size: 18px; font-weight: bold; color: #22d3ee; margin: 0 0 20px 0; text-align: center;">
                  🔐 Your Login Credentials
                </p>
                ${name ? `
                <div style="background: #1f1f2e; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                  <p style="font-size: 12px; color: #888; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px;">
                    Username
                  </p>
                  <p style="font-size: 16px; font-weight: bold; color: white; margin: 0;">
                    @${name}
                  </p>
                </div>
                ` : ''}
                <div style="background: #1f1f2e; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                  <p style="font-size: 12px; color: #888; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px;">
                    Email
                  </p>
                  <p style="font-size: 16px; font-weight: bold; color: white; margin: 0; word-break: break-all;">
                    ${email}
                  </p>
                </div>
                ${password ? `
                <div style="background: #1f1f2e; border-radius: 8px; padding: 15px;">
                  <p style="font-size: 12px; color: #888; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px;">
                    Password
                  </p>
                  <p style="font-size: 16px; font-weight: bold; color: white; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 1px;">
                    ${password}
                  </p>
                </div>
                ` : ''}
                <p style="font-size: 12px; color: #22d3ee; margin: 20px 0 0 0; text-align: center;">
                  💡 Save these credentials! You'll need them to log in.
                </p>
              </div>

              <p class="message">
                Click below to verify your email and <strong>start watching videos</strong>:
              </p>
              
              <div style="text-align: center;">
                <a href="${verificationLink}" class="verify-button" style="margin-bottom: 15px;">
                  ✅ Verify & Start Watching
                </a>
              </div>
              
              <div class="tip" style="margin-top: 25px; background: linear-gradient(135deg, #22d3ee20 0%, #a855f720 100%); border-left: 4px solid #22d3ee;">
                🔥 <strong>One-Click Access!</strong> Clicking the button above will verify your email AND take you straight to your For You Page (FYP) where you can start watching viral videos immediately!
              </div>
              
              <div style="background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                <p style="font-size: 20px; font-weight: bold; color: white; margin: 0 0 15px 0;">
                  🎬 Ready to Watch?
                </p>
                <p style="font-size: 15px; color: white; margin: 0 0 20px 0;">
                  Your For You Page is loaded with viral content!
                </p>
                <a href="${process.env.APP_URL || 'https://profithackai.com'}/feed" style="display: inline-block; background: white; color: #a855f7; padding: 15px 40px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);">
                  🔥 Go to FYP (For You Page)
                </a>
                <p style="font-size: 13px; color: rgba(255,255,255,0.8); margin: 15px 0 0 0;">
                  Swipe through TikTok-style videos, like, comment, and share!
                </p>
              </div>
              
              <div class="codes-container">
                <div class="codes-title">🎟️ Your 5 Invite Codes</div>
                <p style="text-align: center; color: #22d3ee; font-size: 16px; font-weight: bold; margin-bottom: 20px;">
                  Share these with your 5 best friends! 🚀
                </p>
                ${inviteCodes.map(code => `
                  <div class="code-item">${code}</div>
                `).join('')}
              </div>
              
              <div class="tip">
                💡 <strong>Important:</strong> Make sure to share your 5 invite codes with your 5 best friends! Each code can only be used once. Help your crew join PROFITHACK AI and start earning together!
              </div>
              
              <p class="message" style="margin-top: 30px;">
                <strong>What's Next?</strong><br>
                After verification, you'll be taken directly to your dashboard where you can start uploading videos, building your audience, and earning money. You keep 55% of everything you earn!
              </p>
              
              <p class="message" style="margin-top: 20px; font-size: 18px; color: #a855f7;">
                💜 Thank you for being part of the PROFITHACK AI family!
              </p>
            </div>
            
            <div class="footer">
              <p>
                <strong>PROFITHACK AI</strong><br>
                The Ultimate Creator Monetization Platform
              </p>
              <p style="margin-top: 20px;">
                © ${new Date().getFullYear()} PROFITHACK AI. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to PROFITHACK AI, ${name || 'Creator'}!

🔐 YOUR LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email/Username: ${email}
${password ? `Password: ${password}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Save these credentials! You'll need them to log in.

You're almost there! Verify your email to activate your account:
${verificationLink}

Your 5 Invite Codes:
${inviteCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

Share these codes with friends, family, or fans to help them join PROFITHACK AI!

After verification, you'll be automatically logged in and taken to your dashboard where you can start uploading videos, building your audience, and earning money. You keep 55% of everything you earn!

---
PROFITHACK AI - The Ultimate Creator Monetization Platform
© ${new Date().getFullYear()} PROFITHACK AI. All rights reserved.
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    
    if (!isEmailConfigured()) {
      console.log("📧 [DEV MODE] Verification + invite codes email simulated");
      console.log(`   To: ${email}`);
      console.log(`   Verification Link: ${verificationLink}`);
      console.log(`   Codes: ${inviteCodes.join(', ')}`);
    } else {
      console.log("✅ Verification + invite codes email sent to:", email);
    }
    
    return true;
  } catch (error) {
    console.error("❌ Error sending verification + invite codes email:", error);
    return false;
  }
};

// Send invite codes email to new user
export const sendInviteCodesEmail = async (
  email: string,
  inviteCodes: string[],
  name?: string
): Promise<boolean> => {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: `"PROFITHACK AI" <${process.env.EMAIL_USER || "noreply@profithackai.com"}>`,
      to: email,
      subject: "Your PROFITHACK AI Invite Codes! 🎟️",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%);
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: #1f1f2e;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            .header {
              background: linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #22d3ee 100%);
              padding: 40px 20px;
              text-align: center;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: white;
              margin: 0;
              text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }
            .content {
              padding: 40px 30px;
              color: #e0e0e0;
            }
            .greeting {
              font-size: 24px;
              margin-bottom: 20px;
              color: white;
              text-align: center;
            }
            .message {
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 30px;
              color: #b0b0b0;
              text-align: center;
            }
            .codes-container {
              background: #2a2a3e;
              border-radius: 12px;
              padding: 30px;
              margin: 30px 0;
            }
            .codes-title {
              font-size: 18px;
              font-weight: bold;
              color: #22d3ee;
              margin-bottom: 20px;
              text-align: center;
            }
            .code-item {
              background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
              border-radius: 8px;
              padding: 15px 20px;
              margin: 10px 0;
              text-align: center;
              font-size: 20px;
              font-weight: bold;
              letter-spacing: 2px;
              color: white;
              font-family: 'Courier New', monospace;
              box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
            }
            .tip {
              background: #2a2a3e;
              border-left: 4px solid #22d3ee;
              padding: 15px 20px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 14px;
              color: #22d3ee;
            }
            .footer {
              background: #16161f;
              padding: 30px;
              text-align: center;
              color: #666;
              font-size: 14px;
              border-top: 1px solid #2a2a3e;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
              color: white;
              padding: 16px 40px;
              border-radius: 30px;
              text-decoration: none;
              font-weight: bold;
              font-size: 16px;
              margin: 20px 0;
              box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">PROFITHACK AI</h1>
            </div>
            
            <div class="content">
              <div class="greeting">
                🎉 Welcome, ${name || 'Creator'}!
              </div>
              
              <p class="message">
                Here are your <strong>5 exclusive invite codes</strong>. Share them with friends, family, or fans to help them join PROFITHACK AI!
              </p>
              
              <div class="codes-container">
                <div class="codes-title">🎟️ Your Invite Codes</div>
                ${inviteCodes.map(code => `
                  <div class="code-item">${code}</div>
                `).join('')}
              </div>
              
              <div class="tip">
                💡 <strong>Tip:</strong> Each code can be used once. Share them with people who want to create, earn, and grow on PROFITHACK AI!
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.APP_URL || 'https://profithackai.com'}" class="cta-button">
                  Start Creating Now →
                </a>
              </div>
              
              <p class="message" style="margin-top: 30px;">
                <strong>What's Next?</strong><br>
                Log in and start uploading videos, building your audience, and earning money. You keep 60% of everything you earn!
              </p>
            </div>
            
            <div class="footer">
              <p>
                <strong>PROFITHACK AI</strong><br>
                The Ultimate Creator Monetization Platform
              </p>
              <p style="margin-top: 20px;">
                © ${new Date().getFullYear()} PROFITHACK AI. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to PROFITHACK AI, ${name || 'Creator'}!

Here are your 4 exclusive invite codes:

${inviteCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

Share these codes with friends, family, or fans to help them join PROFITHACK AI!

Each code can be used once.

Get started now: ${process.env.APP_URL || 'https://profithackai.com'}

---
PROFITHACK AI - The Ultimate Creator Monetization Platform
© ${new Date().getFullYear()} PROFITHACK AI. All rights reserved.
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    
    if (!isEmailConfigured()) {
      console.log("📧 [DEV MODE] Invite codes email simulated");
      console.log(`   To: ${email}`);
      console.log(`   Codes: ${inviteCodes.join(', ')}`);
    } else {
      console.log("✅ Invite codes email sent to:", email);
    }
    
    return true;
  } catch (error) {
    console.error("❌ Error sending invite codes email:", error);
    return false;
  }
};

// Send welcome email after successful verification
export const sendWelcomeEmail = async (email: string, name?: string): Promise<boolean> => {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: `"PROFITHACK AI" <${process.env.EMAIL_USER || "noreply@profithackai.com"}>`,
      to: email,
      subject: "Welcome to PROFITHACK AI! 🚀",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%);
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: #1f1f2e;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            .header {
              background: linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #22d3ee 100%);
              padding: 60px 20px;
              text-align: center;
            }
            .logo {
              font-size: 36px;
              font-weight: bold;
              color: white;
              margin: 0 0 10px 0;
              text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }
            .tagline {
              color: rgba(255,255,255,0.9);
              font-size: 16px;
            }
            .content {
              padding: 40px 30px;
              color: #e0e0e0;
            }
            .greeting {
              font-size: 24px;
              margin-bottom: 20px;
              color: white;
            }
            .message {
              font-size: 16px;
              line-height: 1.8;
              margin-bottom: 20px;
              color: #b0b0b0;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
              color: white;
              padding: 16px 40px;
              border-radius: 30px;
              text-decoration: none;
              font-weight: bold;
              font-size: 16px;
              margin: 20px 0;
              box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);
            }
            .features {
              margin: 30px 0;
            }
            .feature {
              background: #2a2a3e;
              border-radius: 12px;
              padding: 20px;
              margin: 15px 0;
              border-left: 4px solid #22d3ee;
            }
            .feature-title {
              color: #22d3ee;
              font-weight: bold;
              font-size: 18px;
              margin-bottom: 8px;
            }
            .footer {
              background: #16161f;
              padding: 30px;
              text-align: center;
              color: #666;
              font-size: 14px;
              border-top: 1px solid #2a2a3e;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">PROFITHACK AI</h1>
              <p class="tagline">Create. Earn. Grow.</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                Welcome aboard, ${name || 'Creator'}! 🎉
              </div>
              
              <p class="message">
                You're now part of the most innovative creator platform on the planet. PROFITHACK AI combines TikTok-style content, OnlyFans monetization, and AI-powered tools to help you earn more.
              </p>
              
              <div style="text-align: center;">
                <a href="${process.env.APP_URL || 'https://profithackai.com'}" class="cta-button">
                  Start Creating →
                </a>
              </div>
              
              <div class="features">
                <div class="feature">
                  <div class="feature-title">💰 60% Revenue Share</div>
                  <p class="message">You keep 60% of everything you earn - one of the highest rates in the industry.</p>
                </div>
                
                <div class="feature">
                  <div class="feature-title">🎥 Content That Pays</div>
                  <p class="message">Upload videos, build your following, and monetize through views, subscriptions, and premium content.</p>
                </div>
                
                <div class="feature">
                  <div class="feature-title">🤖 AI Workspace</div>
                  <p class="message">Build apps, create marketing bots, and automate your content with our AI Lab.</p>
                </div>
                
                <div class="feature">
                  <div class="feature-title">🌍 Global Payments</div>
                  <p class="message">Accept payments from 7+ providers including crypto, PayPal, Square, and more.</p>
                </div>
              </div>
              
              <p class="message">
                Ready to start your creator journey? Log in now and upload your first video!
              </p>
            </div>
            
            <div class="footer">
              <p>
                <strong>PROFITHACK AI</strong><br>
                The Ultimate Creator Monetization Platform
              </p>
              <p style="margin-top: 20px;">
                © ${new Date().getFullYear()} PROFITHACK AI. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    if (!isEmailConfigured()) {
      console.log("📧 [DEV MODE] Welcome email simulated");
    } else {
      console.log("✅ Welcome email sent to:", email);
    }
    
    return true;
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    return false;
  }
};

// Send magic link email (one-click login)
export const sendMagicLinkEmail = async (
  email: string,
  token: string,
  name?: string
): Promise<boolean> => {
  try {
    const transporter = getTransporter();
    const appUrl = process.env.APP_URL || 'https://profithackai.com';
    const magicLink = `${appUrl}/api/auth/magic-link?token=${token}&email=${encodeURIComponent(email)}`;
    
    const emailContent = `
      <div style="text-align: left;">
        <p style="font-size: 24px; font-weight: bold; color: #ffffff; margin: 0 0 20px 0;">
          Hey${name ? ' ' + name : ''}! 👋
        </p>
        
        <p style="font-size: 15px; line-height: 1.6; color: #b0b0b0; margin: 0 0 25px 0;">
          Click the button below to instantly log in to your PROFITHACK AI account. No password needed!
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: white !important; padding: 16px 50px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 10px 30px rgba(236, 72, 153, 0.4);">
            🚀 Log In to PROFITHACK AI
          </a>
        </div>
        
        <div style="background: #2a2a2a; border-left: 3px solid #fbbf24; padding: 15px 18px; margin: 25px 0; border-radius: 6px;">
          <p style="margin: 0; font-size: 13px; color: #fbbf24;">
            ⏰ <strong>This link expires in 15 minutes</strong> for security reasons.
          </p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; color: #b0b0b0; margin: 25px 0 15px 0; font-weight: 600;">
          Once logged in, you'll have access to:
        </p>
        
        <div style="background: #2a2a2a; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; line-height: 2; color: #e0e0e0;">
            🎥 TikTok-style video feed<br/>
            💰 Creator monetization tools<br/>
            🤖 AI workspace & code editor<br/>
            💎 Dating app & premium features<br/>
            🌍 Global payment options
          </p>
        </div>
        
        <div style="background: #2a2a2a; border-left: 3px solid #22d3ee; padding: 15px 18px; margin: 25px 0 0 0; border-radius: 6px;">
          <p style="margin: 0; font-size: 13px; color: #888;">
            <strong style="color: #22d3ee;">🔒 Security Tip:</strong> This link is for you only. Never share it with anyone. If you didn't request this login link, you can safely ignore this email.
          </p>
        </div>
      </div>
    `;
    
    const mailOptions = {
      from: `"PROFITHACK AI" <${process.env.EMAIL_USER || "noreply@profithackai.com"}>`,
      to: email,
      subject: "🚀 Your PROFITHACK AI Magic Link - One-Click Login",
      html: createEmailTemplate(emailContent, ''),
      text: `
Hey${name ? ' ' + name : ''}!

Click this link to log in to PROFITHACK AI:
${magicLink}

This link expires in 15 minutes.

If you didn't request this login link, you can safely ignore this email.

---
PROFITHACK AI - The Ultimate Creator Monetization Platform
© ${new Date().getFullYear()} PROFITHACK AI. All rights reserved.
      `.trim(),
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (!isEmailConfigured()) {
      console.log("📧 [DEV MODE] Magic link email (would be sent):");
      console.log(`   To: ${email}`);
      console.log(`   Link: ${magicLink}`);
      console.log(`   Expires: 15 minutes`);
    } else {
      console.log("✅ Magic link email sent to:", email);
    }
    
    return true;
  } catch (error) {
    console.error("❌ Error sending magic link email:", error);
    
    if (!isEmailConfigured()) {
      console.log("📧 [DEV MODE] Email sending simulated successfully");
      return true;
    }
    
    return false;
  }
};
