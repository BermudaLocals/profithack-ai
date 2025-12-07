import { db } from "./db";
import { videos, users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Educational videos about making money online, digital products, ProfitHack features
const educationalVideos = [
  {
    title: "How I Made $2,500 in My First Month on ProfitHack AI 💰",
    description: "Real results from using ProfitHack AI's creator monetization. 55% payouts, instant withdrawals, global payments. #MakeMoneyOnline #CreatorEconomy",
    videoUrl: "https://example.com/videos/first-month-earnings.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800",
    videoType: "short",
    category: "Education",
    hashtags: ["#MakeMoneyOnline", "#CreatorEconomy", "#ProfitHackAI", "#PassiveIncome"],
    duration: 45,
    hookText: "I made $2,500 last month just posting videos...",
    hookType: "curiosity_gap",
  },
  {
    title: "5 Ways to Earn Money on ProfitHack AI (Beginner Friendly) 🚀",
    description: "Complete guide: Subscriptions, Virtual Gifts (Sparks), Ads, Code Marketplace, Premium Content. Start earning TODAY! #SideHustle",
    videoUrl: "https://example.com/videos/5-ways-to-earn.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1554224311-beee6651c7a0?w=800",
    videoType: "short",
    category: "Education",
    hashtags: ["#SideHustle", "#MakeMoneyOnline", "#PassiveIncome", "#CreatorTips"],
    duration: 60,
    hookText: "5 ways to make money you've never heard of...",
    hookType: "open_loop",
  },
  {
    title: "ProfitHack AI vs TikTok: Who Pays Creators MORE? 💸",
    description: "TikTok: 0-20% creator share. ProfitHack AI: 55% creator share. The difference is INSANE. #CreatorComparison #MoneyTalk",
    videoUrl: "https://example.com/videos/profithack-vs-tiktok.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800",
    videoType: "short",
    category: "Education",
    hashtags: ["#TikTok", "#CreatorEconomy", "#MoneyTips", "#Viral"],
    duration: 50,
    hookText: "TikTok is stealing your money. Here's proof...",
    hookType: "challenge_belief",
  },
  {
    title: "How to Sell Digital Products for $500-$3,000/Month 📈",
    description: "Use ProfitHack AI Marketplace to sell code templates, AI tools, courses. No inventory, pure profit. Step-by-step tutorial. #DigitalProducts",
    videoUrl: "https://example.com/videos/sell-digital-products.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
    videoType: "long",
    category: "Education",
    hashtags: ["#DigitalProducts", "#PassiveIncome", "#OnlineBusiness", "#Entrepreneur"],
    duration: 180,
    hookText: "This business model made me $12K last year...",
    hookType: "curiosity_gap",
  },
  {
    title: "FREE AI Tools to Create Viral Videos in 60 Seconds ⚡",
    description: "ProfitHack AI's built-in Crayo-style video generator. Choose caption style, AI voice, background video. Export and earn! #AITools #ContentCreator",
    videoUrl: "https://example.com/videos/ai-video-generator.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800",
    videoType: "short",
    category: "Tutorial",
    hashtags: ["#AITools", "#VideoEditing", "#ContentCreation", "#Viral"],
    duration: 55,
    hookText: "I create 10 viral videos in 10 minutes using this...",
    hookType: "pattern_interrupt",
  },
  {
    title: "Turn Your Smartphone Into a Money Printer 📱💰",
    description: "Record videos on your phone, upload to ProfitHack AI, earn from views, gifts, and subscriptions. Global payments accepted! #MobileBusiness",
    videoUrl: "https://example.com/videos/smartphone-money.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800",
    videoType: "short",
    category: "Motivation",
    hashtags: ["#SmartphoneBusiness", "#MakeMoneyOnline", "#MobileMoney", "#SideHustle"],
    duration: 40,
    hookText: "Your phone is worth $5,000/month. Here's how...",
    hookType: "curiosity_gap",
  },
  {
    title: "I Built an App in 2 Hours and Made $1,200 This Month 💻",
    description: "ProfitHack AI's cloud IDE with AI code assistant. No coding experience needed. Sell apps on the marketplace! #NoCode #AppDevelopment",
    videoUrl: "https://example.com/videos/build-app-2-hours.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
    videoType: "long",
    category: "Tutorial",
    hashtags: ["#NoCode", "#AppDevelopment", "#AI", "#MakeMoneyOnline"],
    duration: 240,
    hookText: "I can't code, but I made $1,200 selling apps...",
    hookType: "challenge_belief",
  },
  {
    title: "Virtual Gifts Explained: How Viewers Pay You in Real-Time 🎁",
    description: "Sparks = Virtual gifts viewers send during live streams. You keep 55%! Higher value gifts = more earnings. #LiveStreaming #Monetization",
    videoUrl: "https://example.com/videos/virtual-gifts-explained.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800",
    videoType: "short",
    category: "Education",
    hashtags: ["#LiveStreaming", "#VirtualGifts", "#Monetization", "#CreatorTips"],
    duration: 50,
    hookText: "Someone just sent me $500 during a 10-minute stream...",
    hookType: "curiosity_gap",
  },
  {
    title: "Global Payments: Accept Money from ANYWHERE in the World 🌍",
    description: "8 payment gateways: PayPal, Stripe, Crypto, Payoneer, Square, TON, Payeer, NOWPayments. No country restrictions! #GlobalPayments",
    videoUrl: "https://example.com/videos/global-payments.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800",
    videoType: "short",
    category: "Education",
    hashtags: ["#CryptoPayments", "#GlobalPayments", "#OnlineBusiness", "#Fintech"],
    duration: 45,
    hookText: "Finally, a platform that works in Bermuda, Nigeria, India...",
    hookType: "pattern_interrupt",
  },
  {
    title: "Marketing Automation: 8 Bots Working 24/7 for FREE 🤖",
    description: "SEO bot, social media bot, backlink builder, directory submitter. Automated viral growth without lifting a finger! #MarketingAutomation",
    videoUrl: "https://example.com/videos/marketing-bots.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
    videoType: "long",
    category: "Tutorial",
    hashtags: ["#MarketingAutomation", "#AIBots", "#GrowthHacking", "#Viral"],
    duration: 300,
    hookText: "I haven't posted manually in 3 months. Bots do everything...",
    hookType: "challenge_belief",
  },
  {
    title: "Premium Subscriptions: Earn $200-$2,000/Month Recurring 💎",
    description: "OnlyFans-style model for creators. 3 tiers: Basic ($19.99), VIP ($39.99), Elite ($99.99). You keep 50%! #SubscriptionIncome",
    videoUrl: "https://example.com/videos/premium-subscriptions.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800",
    videoType: "short",
    category: "Education",
    hashtags: ["#Subscriptions", "#RecurringIncome", "#CreatorEconomy", "#MoneyTips"],
    duration: 55,
    hookText: "32 subscribers = $1,000/month. Here's the math...",
    hookType: "open_loop",
  },
  {
    title: "How to Go Viral: Hook System with 90% Retention Rate 🔥",
    description: "Master the 3-6 second hook. Emotion + curiosity gap = viral. Examples from top creators. #ViralStrategy #ContentStrategy",
    videoUrl: "https://example.com/videos/viral-hook-system.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800",
    videoType: "long",
    category: "Education",
    hashtags: ["#ViralContent", "#ContentStrategy", "#CreatorTips", "#AlgorithmHack"],
    duration: 420,
    hookText: "90% of creators get this wrong. Here's what works...",
    hookType: "challenge_belief",
  },
];

export async function seedVideos() {
  try {
    console.log("🎬 Seeding educational videos...");
    
    // Check if videos already exist
    const existingVideos = await db.select().from(videos);
    
    if (existingVideos.length > 0) {
      console.log(`✅ Already have ${existingVideos.length} videos in database`);
      return;
    }
    
    // Get or create system/bot user for video ownership
    let systemUser = await db.select().from(users).where(eq(users.displayName, "ProfitHack AI")).limit(1);
    
    if (systemUser.length === 0) {
      // Create system user
      const newUser = await db.insert(users).values({
        displayName: "ProfitHack AI",
        firstName: "ProfitHack",
        lastName: "AI",
        bio: "Official ProfitHack AI account. Educational content about making money online, creator economy, and digital entrepreneurship.",
        isVerified: true,
        followerCount: 10000,
        profileImageUrl: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=400",
      }).returning();
      systemUser = newUser;
      console.log("✅ Created system user for video ownership");
    }
    
    const userId = systemUser[0].id;
    
    // Insert educational videos
    const videoRecords = educationalVideos.map(video => ({
      ...video,
      userId,
      videoType: video.videoType as "short" | "long",
      quality: "hd" as const,
      ageRating: "u16" as const,
      moderationStatus: "approved" as const,
      isPublic: true,
      isPremium: false,
      hasContext: true,
    }));
    
    await db.insert(videos).values(videoRecords);
    
    console.log(`✅ Seeded ${educationalVideos.length} educational videos to feed`);
    console.log(`📱 Videos now visible in /explore feed`);
  } catch (error) {
    console.error("❌ Error seeding videos:", error);
  }
}
