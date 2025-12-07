/**
 * Seed data for Video Generator
 * - Viral Templates
 * - Caption Styles  
 * - AI Voices
 */

import { db } from "./db";
import { viralTemplates, captionStyles, aiVoices } from "@shared/schema";

export async function seedVideoGenerator() {
  console.log("🎬 Seeding Video Generator data...");

  try {
    // VIRAL TEMPLATES
    const viralTemplatesData = [
      {
        name: "Simpsons Prediction",
        hookFormat: "[Show] predicted [Current Event] in [Year]",
        category: "nostalgia",
        avgViralScore: 95,
        optimalLength: 15,
        targetKeywords: ["simpsons prediction", "predicted future", "conspiracy"],
        hashtagSuggestions: ["#SimpsonsDidIt", "#Prediction", "#Conspiracy"],
        requiredElements: ["show_clip", "current_event_news", "side_by_side_comparison"],
        visualStyle: "split_screen_comparison",
        isActive: true,
      },
      {
        name: "Before You Go to Bed",
        hookFormat: "Before you go to bed tonight, [person] needs to tell you about [shocking thing]",
        category: "relationship",
        avgViralScore: 88,
        optimalLength: 12,
        targetKeywords: ["relationship advice", "before bed", "couples"],
        hashtagSuggestions: ["#RelationshipTips", "#CoupleGoals", "#BeforeYouSleep"],
        requiredElements: ["text_overlay", "dramatic_pause", "call_to_action"],
        visualStyle: "text_heavy_with_background",
        isActive: true,
      },
      {
        name: "This vs That",
        hookFormat: "[Thing 1] vs [Thing 2] - Which side are you on?",
        category: "debate",
        avgViralScore: 82,
        optimalLength: 10,
        targetKeywords: ["versus", "comparison", "debate"],
        hashtagSuggestions: ["#Versus", "#TeamA", "#TeamB"],
        requiredElements: ["split_screen", "voting_poll", "comment_bait"],
        visualStyle: "split_screen_comparison",
        isActive: true,
      },
      {
        name: "Cancel Culture",
        hookFormat: "They tried to cancel [person] for [controversial action], but here's what really happened",
        category: "controversy",
        avgViralScore: 90,
        optimalLength: 20,
        targetKeywords: ["cancel culture", "controversy", "exposed"],
        hashtagSuggestions: ["#CancelCulture", "#Truth", "#Exposed"],
        requiredElements: ["dramatic_reveal", "evidence", "plot_twist"],
        visualStyle: "documentary_style",
        isActive: true,
      },
      {
        name: "Dark Truth",
        hookFormat: "The dark truth about [innocent thing] that nobody talks about",
        category: "exposé",
        avgViralScore: 87,
        optimalLength: 18,
        targetKeywords: ["dark truth", "exposed", "conspiracy"],
        hashtagSuggestions: ["#DarkTruth", "#Exposed", "#WakeUp"],
        requiredElements: ["shocking_reveal", "receipts", "call_to_action"],
        visualStyle: "documentary_style",
        isActive: true,
      },
    ];

    await db.insert(viralTemplates).values(viralTemplatesData).onConflictDoNothing();
    console.log(`✅ Seeded ${viralTemplatesData.length} viral templates`);

    // CAPTION STYLES
    const captionStylesData = [
      {
        name: "Alex Hormozi",
        description: "Bold white text, black background, high contrast",
        fontFamily: "Impact",
        fontSize: 72,
        fontWeight: 900,
        textColor: "#FFFFFF",
        backgroundColor: "#000000",
        strokeWidth: 0,
        strokeColor: "#000000",
        animationType: "word_by_word",
        position: "center",
        isActive: true,
        isPremium: false,
        timesUsed: 1250,
      },
      {
        name: "MrBeast",
        description: "Yellow text with thick black outline, explosive style",
        fontFamily: "Impact",
        fontSize: 80,
        fontWeight: 900,
        textColor: "#FFD700",
        backgroundColor: "transparent",
        strokeWidth: 8,
        strokeColor: "#000000",
        animationType: "pop_in",
        position: "bottom",
        isActive: true,
        isPremium: false,
        timesUsed: 2100,
      },
      {
        name: "Subway Surfers",
        description: "Gaming style - white text with colorful glow",
        fontFamily: "Arial Black",
        fontSize: 64,
        fontWeight: 900,
        textColor: "#FFFFFF",
        backgroundColor: "transparent",
        strokeWidth: 4,
        strokeColor: "#00FF00",
        animationType: "slide_up",
        position: "bottom",
        isActive: true,
        isPremium: false,
        timesUsed: 3500,
      },
      {
        name: "Motivational",
        description: "Elegant serif font, gradient text",
        fontFamily: "Georgia",
        fontSize: 56,
        fontWeight: 700,
        textColor: "#FFD700",
        backgroundColor: "rgba(0,0,0,0.5)",
        strokeWidth: 2,
        strokeColor: "#FFFFFF",
        animationType: "fade_in",
        position: "center",
        isActive: true,
        isPremium: true,
        timesUsed: 890,
      },
      {
        name: "TikTok Dance",
        description: "Fun bouncy text with shadow",
        fontFamily: "Comic Sans MS",
        fontSize: 68,
        fontWeight: 700,
        textColor: "#FF69B4",
        backgroundColor: "transparent",
        strokeWidth: 6,
        strokeColor: "#000000",
        animationType: "bounce",
        position: "top",
        isActive: true,
        isPremium: false,
        timesUsed: 1650,
      },
      {
        name: "Podcast Clip",
        description: "Clean sans-serif, subtle background",
        fontFamily: "Helvetica",
        fontSize: 48,
        fontWeight: 600,
        textColor: "#FFFFFF",
        backgroundColor: "rgba(0,0,0,0.7)",
        strokeWidth: 0,
        strokeColor: "#000000",
        animationType: "type_writer",
        position: "bottom",
        isActive: true,
        isPremium: true,
        timesUsed: 450,
      },
    ];

    await db.insert(captionStyles).values(captionStylesData).onConflictDoNothing();
    console.log(`✅ Seeded ${captionStylesData.length} caption styles`);

    // AI VOICES
    const aiVoicesData = [
      {
        name: "David Attenborough",
        provider: "elevenlabs",
        voiceId: "attenborough-nature",
        gender: "male",
        accent: "British",
        ageGroup: "elderly",
        style: "documentary",
        emotionalRange: "calm",
        isActive: true,
        isPremium: true,
        timesUsed: 580,
      },
      {
        name: "Morgan Freeman",
        provider: "elevenlabs",
        voiceId: "morgan-freeman-narrator",
        gender: "male",
        accent: "American",
        ageGroup: "elderly",
        style: "narrator",
        emotionalRange: "wise",
        isActive: true,
        isPremium: true,
        timesUsed: 1200,
      },
      {
        name: "Young Energetic Male",
        provider: "elevenlabs",
        voiceId: "josh-young-male",
        gender: "male",
        accent: "American",
        ageGroup: "young_adult",
        style: "energetic",
        emotionalRange: "excited",
        isActive: true,
        isPremium: false,
        timesUsed: 3400,
      },
      {
        name: "Professional Female",
        provider: "elevenlabs",
        voiceId: "bella-professional",
        gender: "female",
        accent: "American",
        ageGroup: "adult",
        style: "professional",
        emotionalRange: "confident",
        isActive: true,
        isPremium: false,
        timesUsed: 2100,
      },
      {
        name: "British Girl",
        provider: "elevenlabs",
        voiceId: "emily-british",
        gender: "female",
        accent: "British",
        ageGroup: "young_adult",
        style: "casual",
        emotionalRange: "friendly",
        isActive: true,
        isPremium: false,
        timesUsed: 1850,
      },
      {
        name: "Deep Movie Trailer",
        provider: "elevenlabs",
        voiceId: "adam-deep-voice",
        gender: "male",
        accent: "American",
        ageGroup: "adult",
        style: "dramatic",
        emotionalRange: "intense",
        isActive: true,
        isPremium: true,
        timesUsed: 920,
      },
      {
        name: "Warm Storyteller",
        provider: "elevenlabs",
        voiceId: "rachel-storyteller",
        gender: "female",
        accent: "American",
        ageGroup: "adult",
        style: "storytelling",
        emotionalRange: "warm",
        isActive: true,
        isPremium: false,
        timesUsed: 1560,
      },
      {
        name: "Australian Surfer",
        provider: "elevenlabs",
        voiceId: "daniel-aussie",
        gender: "male",
        accent: "Australian",
        ageGroup: "young_adult",
        style: "casual",
        emotionalRange: "laid_back",
        isActive: true,
        isPremium: true,
        timesUsed: 340,
      },
    ];

    await db.insert(aiVoices).values(aiVoicesData).onConflictDoNothing();
    console.log(`✅ Seeded ${aiVoicesData.length} AI voices`);

    console.log("🎉 Video Generator data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding video generator data:", error);
    throw error;
  }
}

// Run if called directly
seedVideoGenerator().then(() => {
  console.log("✅ Seed completed successfully");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
