import { db } from "./db";
import { marketingBots } from "@shared/schema";

const KUSH_USER_ID = "11111111-1111-1111-1111-111111111111"; // @kush
const PROFITHACK_USER_ID = "6b158b5d-3078-42c0-819f-3f24cf3b7ee5"; // @profithackai

const defaultBots = [
  {
    userId: KUSH_USER_ID, // @kush
    name: "TikTok Viral Machine",
    type: "content_creator",
    status: "active",
    config: {
      contentType: "short",
      topics: ["entrepreneur", "money", "tech"],
      postFrequency: "daily",
      style: "trending",
    },
    schedule: "daily",
    aiModel: "gpt-4",
  },
  {
    userId: PROFITHACK_USER_ID, // @profithackai
    name: "Instagram Growth Engine",
    type: "content_creator",
    status: "active",
    config: {
      contentType: "short",
      topics: ["business", "lifestyle", "marketing"],
      postFrequency: "daily",
      style: "carousel",
    },
    schedule: "daily",
    aiModel: "gpt-4",
  },
  {
    userId: KUSH_USER_ID, // @kush
    name: "X/Twitter Thread Master",
    type: "content_creator",
    status: "active",
    config: {
      contentType: "short",
      topics: ["tech", "startup", "business"],
      postFrequency: "daily",
      style: "threads",
    },
    schedule: "daily",
    aiModel: "gpt-4",
  },
  {
    userId: PROFITHACK_USER_ID, // @profithackai
    name: "LinkedIn Authority Builder",
    type: "content_creator",
    status: "active",
    config: {
      contentType: "long",
      topics: ["business", "leadership", "professional"],
      postFrequency: "daily",
      style: "insights",
    },
    schedule: "daily",
    aiModel: "gpt-4",
  },
  {
    userId: KUSH_USER_ID, // @kush
    name: "Threads Engagement Bot",
    type: "engagement",
    status: "active",
    config: {
      contentType: "short",
      topics: ["social", "trending", "entertainment"],
      postFrequency: "daily",
      style: "conversation",
    },
    schedule: "daily",
    aiModel: "gpt-4",
  },
  {
    userId: PROFITHACK_USER_ID, // @profithackai
    name: "Google AI SEO Master",
    type: "seo_writer",
    status: "active",
    config: {
      contentType: "article",
      topics: ["AI", "technology", "business automation", "profithack"],
      postFrequency: "daily",
      style: "seo-optimized",
      targetKeywords: ["AI platform", "content creation", "profithack AI", "AI monetization"],
      searchEngines: ["google", "bing", "yahoo", "duckduckgo"],
    },
    schedule: "daily",
    aiModel: "gpt-4",
  },
  {
    userId: KUSH_USER_ID, // @kush
    name: "SEO Backlink Builder",
    type: "seo_writer",
    status: "active",
    config: {
      contentType: "article",
      topics: ["digital marketing", "AI tools", "content monetization"],
      postFrequency: "daily",
      style: "authority-building",
      targetKeywords: ["best AI platform", "make money with AI", "AI content creation"],
      searchEngines: ["google", "bing"],
    },
    schedule: "daily",
    aiModel: "gpt-4",
  },
  {
    userId: PROFITHACK_USER_ID, // @profithackai
    name: "Google AI Mode Optimizer",
    type: "seo_writer",
    status: "active",
    config: {
      contentType: "article",
      topics: ["AI search", "google AI", "search optimization"],
      postFrequency: "daily",
      style: "AI-optimized",
      targetKeywords: ["profithack AI review", "best AI platform 2026", "AI content platform"],
      searchEngines: ["google-ai-mode", "google", "perplexity"],
      googleAIMode: true,
    },
    schedule: "daily",
    aiModel: "gpt-4",
  },
];

export async function seedMarketingBots() {
  try {
    console.log("🤖 Seeding default marketing bots...");
    
    // Check if bots already exist
    const existingBots = await db.select().from(marketingBots);
    
    if (existingBots.length > 0) {
      console.log(`✅ Already have ${existingBots.length} marketing bots`);
      
      // Count active bots
      const activeBots = existingBots.filter(b => b.status === 'active').length;
      console.log(`✅ ${activeBots} bots are ACTIVE and running`);
      
      return;
    }
    
    // Insert default bots
    await db.insert(marketingBots).values(defaultBots as any);
    
    console.log(`✅ Seeded ${defaultBots.length} marketing bots (all ACTIVE)`);
    console.log(`🚀 Marketing automation is now running!`);
  } catch (error) {
    console.error("❌ Error seeding marketing bots:", error);
  }
}
