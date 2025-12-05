/**
 * PROFITHACK AI - OnlyFans Expert Creator Video Seeder
 * Generates TikTok-style videos from the 26 OnlyFans expert creators
 */

import { db } from "../db";
import { videos } from "@shared/schema";
import { sql } from "drizzle-orm";

// Sample video content templates for OnlyFans expert creators
const videoTemplates = [
  {
    titleTemplate: "🔥 How I Made ${revenue}/Month on OnlyFans - {name}'s Strategy",
    descriptionTemplate: "Hey babe! 💋 It's {name} ({handle}). I went from $0 to ${revenue}/mo in {years} years. Here's my SECRET strategy that works EVERY TIME:\n\n✅ {strategy1}\n✅ {strategy2}\n✅ {strategy3}\n\nReady to start YOUR empire? Follow for more! 🚀\n\n#onlyfans #makemoneyonline #contentcreator #sidehustle #millionaire",
    hashtags: ["onlyfans", "contentcreator", "makemoney", "sidehustle", "entrepreneur", "millionaire", "fyp", "viral"],
  },
  {
    titleTemplate: "💰 My ${revenue}/Month OnlyFans Blueprint - {name}",
    descriptionTemplate: "Listen up! 👑 {name} here with the REAL TRUTH about OnlyFans success.\n\n🎯 I have {subscribers} subscribers\n💵 Making ${revenue} every single month\n📈 {engagement}% engagement rate\n\nMy top 3 tips:\n1️⃣ {tip1}\n2️⃣ {tip2}\n3️⃣ {tip3}\n\nDrop a ❤️ if you want more!\n\n#fyp #onlyfanstips #makemoneyonline #contentcreation #businesstips",
    hashtags: ["fyp", "onlyfanstips", "makemoneyonline", "contentcreation", "businesstips", "viral"],
  },
  {
    titleTemplate: "✨ From Broke to ${revenue}/Month - {name}'s Journey",
    descriptionTemplate: "Real talk 💯 - {name} ({handle})\n\n{years} years ago I was BROKE. Now?\n\n💎 ${revenue}/month passive income\n💎 {subscribers} loyal fans\n💎 Living my BEST life\n\nWhat changed? I learned:\n🔥 {secret1}\n🔥 {secret2}\n🔥 {secret3}\n\nYour turn! Comment 'READY' 👇\n\n#success #transformation #onlyfans #millionaire #motivation #fyp",
    hashtags: ["success", "transformation", "onlyfans", "millionaire", "motivation", "fyp", "viral"],
  },
  {
    titleTemplate: "🚀 Behind My ${revenue}/Month OnlyFans Empire - {name}",
    descriptionTemplate: "Hey loves! 💕 {name} breaking it DOWN for you!\n\n📊 Current stats:\n✨ ${revenue}/month revenue\n✨ {subscribers} subscribers  \n✨ {engagement}% engagement\n\nMy secret sauce? 🤫\n→ {method1}\n→ {method2}\n→ {method3}\n\nSave this! You'll need it 📌\n\n#contentcreator #onlyfanstips #makemoney #businesswoman #fyp #viral",
    hashtags: ["contentcreator", "onlyfanstips", "makemoney", "businesswoman", "fyp", "viral"],
  },
  {
    titleTemplate: "💎 {subscribers} Subscribers & ${revenue}/Month - Here's How",
    descriptionTemplate: "{name} here! 👋 Let me share my EXACT strategy:\n\n🎯 Platform: OnlyFans\n💰 Monthly: ${revenue}\n👥 Fans: {subscribers}\n📈 Growth: {engagement}% engagement\n\nKey moves:\n🔑 {key1}\n🔑 {key2}\n🔑 {key3}\n\nThis is the WAY! 🚀\n\n#onlyfans #contentcreation #business #success #entrepreneur #fyp #viral",
    hashtags: ["onlyfans", "contentcreation", "business", "success", "entrepreneur", "fyp", "viral"],
  },
];

// Sample Google Storage public video URLs for content
const sampleVideoUrls = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
];

// Sample thumbnails
const sampleThumbnails = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
];

/**
 * Seed videos from OnlyFans expert creators to the FYP feed
 */
export async function seedOnlyFansExpertVideos(expertsToSeed?: number): Promise<{ success: boolean; count: number; message: string }> {
  try {
    console.log("🎥 Seeding OnlyFans expert creator videos...");

    // Fetch OnlyFans experts from database
    const expertsResponse = await fetch("http://localhost:5000/api/onlyfans/experts");
    const { experts } = await expertsResponse.json();

    if (!experts || experts.length === 0) {
      return {
        success: false,
        count: 0,
        message: "No OnlyFans experts found in database",
      };
    }

    const expertsToProcess = expertsToSeed ? experts.slice(0, expertsToSeed) : experts;
    const videosToInsert = [];

    // Generate 3 videos per expert
    for (const expert of expertsToProcess) {
      const revenue = expert.businessProfile.currentMonthlyRevenue;
      const subscribers = expert.businessProfile.subscriberCount;
      const engagement = expert.businessProfile.engagementRate;
      const years = expert.businessProfile.yearsInBusiness;

      // Generate 3 videos per expert using different templates
      for (let i = 0; i < 3; i++) {
        const template = videoTemplates[i % videoTemplates.length];
        const videoUrl = sampleVideoUrls[Math.floor(Math.random() * sampleVideoUrls.length)];
        const thumbnailUrl = sampleThumbnails[Math.floor(Math.random() * sampleThumbnails.length)];

        // Replace template variables
        const title = template.titleTemplate
          .replace(/{name}/g, expert.name)
          .replace(/{handle}/g, expert.handle)
          .replace(/\${revenue}/g, revenue.toLocaleString());

        const description = template.descriptionTemplate
          .replace(/{name}/g, expert.name)
          .replace(/{handle}/g, expert.handle)
          .replace(/\${revenue}/g, revenue.toLocaleString())
          .replace(/{subscribers}/g, subscribers.toLocaleString())
          .replace(/{engagement}/g, engagement.toString())
          .replace(/{years}/g, years.toString())
          .replace(/{strategy1}/g, "Post consistently (4x daily)")
          .replace(/{strategy2}/g, "Engage with every subscriber")
          .replace(/{strategy3}/g, "Offer exclusive content tiers")
          .replace(/{tip1}/g, "Quality over quantity ALWAYS")
          .replace(/{tip2}/g, "Know your audience intimately")
          .replace(/{tip3}/g, "Diversify income streams (PPV + tips)")
          .replace(/{secret1}/g, "Authenticity builds trust")
          .replace(/{secret2}/g, "Treat fans like VIPs")
          .replace(/{secret3}/g, "Stay consistent & persistent")
          .replace(/{method1}/g, "Daily posting schedule")
          .replace(/{method2}/g, "Premium tier exclusives")
          .replace(/{method3}/g, "Cross-platform promotion")
          .replace(/{key1}/g, "Build genuine connections")
          .replace(/{key2}/g, "Deliver premium value")
          .replace(/{key3}/g, "Scale with automation");

        videosToInsert.push({
          id: sql`gen_random_uuid()`,
          userId: sql`'00000000-0000-0000-0000-000000000000'`,
          title,
          description,
          videoUrl,
          thumbnailUrl,
          duration: Math.floor(Math.random() * 45) + 15, // 15-60 seconds
          videoType: "short" as const,
          quality: "hd" as const,
          hashtags: [...template.hashtags, expert.name.toLowerCase().replace(" ", "")],
          category: "onlyfans",
          isPublic: true,
          isPremium: false,
          moderationStatus: "approved" as const,
          ageRating: "18plus" as const,
        });
      }
    }

    // Insert all videos in batch
    await db.insert(videos).values(videosToInsert);

    console.log(`✅ Successfully seeded ${videosToInsert.length} OnlyFans expert videos!`);

    return {
      success: true,
      count: videosToInsert.length,
      message: `Successfully seeded ${videosToInsert.length} videos from ${expertsToProcess.length} OnlyFans experts`,
    };
  } catch (error) {
    console.error("❌ Error seeding OnlyFans expert videos:", error);
    return {
      success: false,
      count: 0,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
