import { db } from "./db";
import { sql } from "drizzle-orm";

export async function seedKushFAQs() {
  console.log("🐵 Seeding Kush's FAQ knowledge base...");
  
  try {
    // Check if FAQs already exist
    const existing = await db.execute(sql`SELECT COUNT(*) FROM faqs`);
    const count = Number(existing.rows[0]?.count || 0);
    
    if (count > 0) {
      console.log(`✅ Kush already has ${count} FAQs in knowledge base`);
      return;
    }

    // Seed comprehensive FAQs about PROFITHACK AI
    const faqs = [
      // GETTING STARTED
      {
        question: "How do I sign up for PROFITHACK AI?",
        answer: "PROFITHACK AI is invite-only during beta! You need a valid invite code to sign up. Once you have a code, go to the homepage and click 'Enter Code'. After verification, you'll create your account and get 5 invite codes to share with friends. Welcome to the family! 🎉",
        category: "getting_started",
        keywords: ["signup", "invite", "beta", "register", "join"],
      },
      {
        question: "Where can I get an invite code?",
        answer: "Invite codes are shared by existing members (each member gets 5 codes), or you can join our waitlist at /waitlist and we'll drop codes periodically. Follow us on social media for surprise code drops! 🎟️",
        category: "getting_started",
        keywords: ["invite", "waitlist", "codes", "access", "beta"],
      },
      {
        question: "What features are free vs paid?",
        answer: "FREE tier gives you: TikTok-style feed, messaging, video calls, profile customization. PAID tiers unlock: AI Code Workspace (cloud IDE), AI assistance, advanced creator tools, more credits, and premium features. Choose Explorer ($9.99), Creator ($24.99), or Innovator ($49.99)! 💎",
        category: "getting_started",
        keywords: ["free", "paid", "pricing", "tiers", "subscription"],
      },

      // CREDITS & SUBSCRIPTIONS
      {
        question: "What are credits and how do they work?",
        answer: "Credits are PROFITHACK's digital currency! 1 credit ≈ $0.024 USD. Use them for: AI code assistance, sending Sparks (virtual gifts), premium features, and more. Your subscription gives monthly credits: Explorer (416), Creator (1,041), Innovator (2,083). Buy more anytime! 💰",
        category: "credits",
        keywords: ["credits", "currency", "value", "money", "pricing"],
      },
      {
        question: "What subscription tiers are available?",
        answer: "We have 3 tiers:\n\n• Explorer ($9.99/mo): 416 credits, basic AI workspace\n• Creator ($24.99/mo): 1,041 credits, advanced tools, analytics\n• Innovator ($49.99/mo): 2,083 credits, unlimited AI, priority support\n\nAll tiers include the social platform features! Choose based on how much you create. 🚀",
        category: "credits",
        keywords: ["subscription", "pricing", "tiers", "plans", "monthly"],
      },
      {
        question: "Can I buy more credits without upgrading?",
        answer: "Yes mon! You can purchase credit packs anytime: 100 credits ($2.40), 500 credits ($12), 1,000 credits ($24). Credits never expire and roll over month-to-month! 🎯",
        category: "credits",
        keywords: ["credits", "purchase", "add-ons", "buy", "top-up"],
      },

      // FEATURES
      {
        question: "What's the difference between Reels and Tube?",
        answer: "Reels = short vertical videos (TikTok-style), max 3 minutes, optimized for mobile scrolling. Tube = longer horizontal videos (YouTube-style), up to 60 minutes, with chapters and playlists. Both support monetization! 📹",
        category: "features",
        keywords: ["reels", "tube", "videos", "content", "upload"],
      },
      {
        question: "How does the AI Code Workspace work?",
        answer: "It's a full cloud IDE powered by Monaco Editor + WebContainer! Write code in JavaScript, Python, HTML/CSS, and more. Features: live preview, integrated terminal, AI code assistance, file management. All in your browser, no downloads needed! Perfect for building while mobile. 💻",
        category: "features",
        keywords: ["ai", "workspace", "code", "ide", "programming", "editor"],
      },
      {
        question: "What AI features are included?",
        answer: "PROFITHACK AI supports multiple providers:\n\n• OpenAI (GPT-4, DALL-E)\n• Anthropic (Claude)\n• Google AI (Gemini)\n• Stability AI (images)\n• Whisper (audio)\n\nYou provide your own API keys for privacy & control! We don't charge markup on AI usage. 🤖",
        category: "features",
        keywords: ["ai", "providers", "api", "openai", "claude", "gpt"],
      },
      {
        question: "Can I make video calls on PROFITHACK?",
        answer: "Yes! Free 1-on-1 calls for everyone. Creators with 500+ followers unlock: live streaming, group calls, and credit-based premium 1-on-1 calls. Powered by Twilio Video for HD quality! 📞",
        category: "features",
        keywords: ["calls", "video", "streaming", "live", "chat"],
      },

      // CREATOR MONETIZATION
      {
        question: "How much do creators earn?",
        answer: "Creators earn 50/50 on all revenue! Simple, fair, transparent. Revenue split: Sparks/Gifts (coins): 50% creator / 50% platform, Premium subscriptions: 50% creator / 50% platform, Premium live shows: 50% creator / 50% platform. Weekly payouts with 14-day hold period. Minimum: $50. 💵",
        category: "monetization",
        keywords: ["earnings", "revenue", "creator", "money", "payout", "income"],
      },
      {
        question: "What are Sparks?",
        answer: "Sparks are virtual gifts viewers send to creators during videos! 50 types from Glow (50 coins) to Godmode (10,000 coins). Creators get 50% of Spark value. Purchase coins separately at 70 coins = $1 (TikTok pricing). It's how fans show love and support! ✨",
        category: "monetization",
        keywords: ["sparks", "gifts", "tips", "donations", "support"],
      },
      {
        question: "How do creator premium subscriptions work?",
        answer: "Creators can offer tiered subscriptions for exclusive content:\n\n• Basic: $4.99-$9.99\n• VIP: $9.99-$24.99\n• Inner Circle: $24.99-$99.99\n\nSubscribers get access to private content, DMs, and special perks. Creators earn 50% on premium subs! Perfect for adult content creators. 🔞",
        category: "monetization",
        keywords: ["subscriptions", "premium", "adult", "exclusive", "content"],
      },
      {
        question: "When do I get paid?",
        answer: "Weekly payouts every Monday via your chosen method (PayPal, Payoneer, Payeer, crypto). 14-day hold on new earnings for chargeback protection. Minimum: $50. Track everything in your Creator Wallet! 💳",
        category: "monetization",
        keywords: ["payouts", "payments", "wallet", "withdraw", "earnings"],
      },

      // BILLING
      {
        question: "What payment methods are supported?",
        answer: "We support global payments!\n\n• PayPal (most countries)\n• Payoneer (worldwide)\n• Payeer (crypto-friendly)\n• Square (card processing)\n• NOWPayments (crypto)\n• TON (Telegram blockchain)\n\nNo Stripe in your country? No problem! Everyone can participate. 🌍",
        category: "billing",
        keywords: ["payments", "methods", "global", "paypal", "crypto"],
      },
      {
        question: "Can I pay with cryptocurrency?",
        answer: "Absolutely! We support crypto via NOWPayments (50+ coins) and TON (Telegram blockchain). Fast, secure, anonymous. Perfect for creators in countries with limited banking. Payouts go to your Kraken wallet! ₿",
        category: "billing",
        keywords: ["crypto", "bitcoin", "ton", "cryptocurrency", "blockchain"],
      },
      {
        question: "What's the refund policy?",
        answer: "Digital products = no refunds on unused time or credits. Canceling stops future billing but doesn't refund current period. Chargebacks cost $20 fee + account suspension if excessive. This protects creators from fraud! ⚠️",
        category: "billing",
        keywords: ["refund", "policy", "chargeback", "cancel", "subscription"],
      },

      // TECHNICAL
      {
        question: "Can I use PROFITHACK on mobile?",
        answer: "Yes! PROFITHACK is a PWA (Progressive Web App). Install it on your phone for an app-like experience. Works on iOS and Android. The AI Workspace even works on mobile browsers! 📱",
        category: "technical",
        keywords: ["mobile", "pwa", "app", "install", "phone"],
      },
      {
        question: "What video formats are supported?",
        answer: "MP4 is best! We also accept: MOV, AVI, WebM. Max size: Reels (100MB), Tube (500MB). Recommended: 1080p quality, H.264 codec, AAC audio. We handle the rest! 🎬",
        category: "technical",
        keywords: ["video", "format", "upload", "mp4", "quality"],
      },
      {
        question: "How do I report content or users?",
        answer: "Click the 3-dot menu on any video/profile → 'Report'. Choose category (spam, harassment, adult content in wrong section, etc.). Our moderation team reviews within 24 hours. 3-strike system for violations. We take safety seriously! 🛡️",
        category: "technical",
        keywords: ["report", "moderation", "safety", "flag", "abuse"],
      },

      // ACCOUNT MANAGEMENT
      {
        question: "How do I change my username?",
        answer: "Go to Settings → Profile → Edit Username. Free once every 30 days. Premium usernames (short, catchy) are available in our marketplace with tiered pricing. Your @username is how people find you! 🏷️",
        category: "account",
        keywords: ["username", "profile", "settings", "change", "edit"],
      },
      {
        question: "Can I make my account private?",
        answer: "Yes! Settings → Privacy → Private Account. This requires people to send follow requests you must approve. Your content won't appear in public feeds. Perfect for exclusive creator content! 🔒",
        category: "account",
        keywords: ["privacy", "private", "settings", "followers", "account"],
      },
      {
        question: "How do I delete my account?",
        answer: "Settings → Account → Delete Account. Warning: This is permanent! All your videos, messages, and data will be deleted. Credits are non-refundable. Download your data first if you want to keep anything! ⚠️",
        category: "account",
        keywords: ["delete", "account", "data", "remove", "close"],
      },
    ];

    // Insert all FAQs
    for (const faq of faqs) {
      await db.execute(sql`
        INSERT INTO faqs (question, answer, category, keywords, is_published)
        VALUES (
          ${faq.question},
          ${faq.answer},
          ${faq.category},
          ${sql.raw(`ARRAY[${faq.keywords.map((k: string) => `'${k.replace(/'/g, "''")}'`).join(', ')}]`)},
          true
        )
      `);
    }

    console.log(`✅ Kush now knows ${faqs.length} FAQs about PROFITHACK AI! Ready to help! 🐵`);
  } catch (error) {
    console.error("⚠️  Failed to seed FAQs:", error);
  }
}
