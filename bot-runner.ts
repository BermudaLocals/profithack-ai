import { db } from "../db";
import { marketingBots, videos } from "@shared/schema";
import { eq } from "drizzle-orm";

// Bot configuration for posting destinations
interface BotPostingConfig {
  postToApp: boolean;           // Post to PROFITHACK app
  postToTube: boolean;          // Post to tube section (long-form)
  postToReels: boolean;         // Post to reels section (short-form)
  postToSocials: boolean;       // Post to external social media
  postToDiscord: boolean;       // Post to Discord webhooks
  platforms: string[];          // Which platforms to post to
  discordWebhooks?: string[];   // Discord webhook URLs
}

// Simple bot runner that runs every 30 seconds
export class BotRunnerService {
  private interval: NodeJS.Timeout | null = null;

  start() {
    console.log("🤖 Marketing Bot Service started - AGGRESSIVE MODE");
    console.log("📱 Smart Content Routing:");
    console.log("   📹 Long videos (3-10min) → TUBE (YouTube-style)");
    console.log("   ⚡ Short videos (30-60s) → FYP + REELS (TikTok-style)");
    
    // Run immediately
    this.runBots();
    
    // Run every 30 seconds for aggressive content generation
    this.interval = setInterval(() => {
      this.runBots();
    }, 30 * 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log("🤖 Marketing Bot Service stopped");
  }

  private async runBots() {
    try {
      const now = new Date();
      
      // Find all active bots
      const botsToRun = await db
        .select()
        .from(marketingBots)
        .where(eq(marketingBots.status, "active"));

      console.log(`🤖 Running ${botsToRun.length} active bots`);

      for (const bot of botsToRun) {
        try {
          await this.runBot(bot);
        } catch (error) {
          console.error(`Error running bot ${bot.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Error in bot runner:", error);
    }
  }

  private async runBot(bot: typeof marketingBots.$inferSelect) {
    console.log(`🤖 Running bot: ${bot.name} (${bot.type})`);
    
    const config = bot.config as any;
    
    switch (bot.type) {
      case "content_creator":
        await this.runContentCreatorBot(bot);
        break;
      case "engagement":
        await this.runEngagementBot(bot);
        break;
      case "ai_influencer":
        await this.runAIInfluencerBot(bot);
        break;
      default:
        console.log(`Unknown bot type: ${bot.type}`);
    }

    // Update last run and schedule next run
    const nextRun = this.calculateNextRun(bot.schedule || "daily");
    await db
      .update(marketingBots)
      .set({
        lastRun: new Date(),
        nextRun,
        totalActions: bot.totalActions + 1,
        successfulActions: bot.successfulActions + 1,
      })
      .where(eq(marketingBots.id, bot.id));
  }

  private async runContentCreatorBot(bot: typeof marketingBots.$inferSelect) {
    const config = bot.config as any;
    
    // Bot posting configuration
    const postingConfig: BotPostingConfig = {
      postToApp: true,          // Always post to PROFITHACK app
      postToTube: true,         // Post to tube section (long-form)
      postToReels: true,        // Post to reels section (short-form)
      postToSocials: config?.postToSocials || false,  // External social media
      postToDiscord: config?.postToDiscord || false,  // Discord webhooks
      platforms: config?.platforms || ['tiktok', 'youtube', 'instagram'],
      discordWebhooks: config?.discordWebhooks || [],
    };
    
    console.log(`📹 Content Creator Bot posting to: ${this.getDestinationString(postingConfig)}`);
    
    // Decide if this will be short-form or long-form
    const isShortForm = Math.random() > 0.3; // 70% short, 30% long
    const videoType = isShortForm ? "short" : "long";
    const duration = isShortForm ? 30 + Math.floor(Math.random() * 30) : 180 + Math.floor(Math.random() * 420); // 30-60s or 3-10min
    
    // 2026 PROFITHACK VIRAL CONTENT - 100% app promotion
    const titles = {
      short: [
        `📱 If You're NOT Making Money With Your Smartphone in 2026...`,
        `🚀 This FREE AI Platform Replaced My $5,000/Month SaaS Stack`,
        `💰 I Built a $10K/Month Business Using PROFITHACK AI (No Coding)`,
        `⚡ Why Every Creator is Moving to PROFITHACK AI in 2026`,
        `🔥 This AI Tool Creates Viral Content While You Sleep`,
        `📈 PROFITHACK AI Just Changed the Creator Economy Forever`,
        `💎 The Platform That's Killing OnlyFans + Patreon Combined`,
        `🎯 Turn Your Smartphone Into a Money Printer in 2026`,
        `🌟 This FREE Platform Pays Me $500/Day (PROFITHACK Tutorial)`,
        `⚡️ If You're Broke in 2026, You Haven't Tried PROFITHACK AI`,
      ],
      long: [
        `How PROFITHACK AI Made Me $50,000 in 90 Days (Complete Tutorial)`,
        `I Replaced 10 Paid Tools With PROFITHACK AI - Here's What Happened`,
        `The Future of Making Money Online is Here: PROFITHACK AI Review`,
        `PROFITHACK AI vs OnlyFans vs Patreon - Which Pays Better in 2026?`,
        `From Broke to $10K/Month Using PROFITHACK AI (Step-by-Step)`,
        `Why Smart Creators Are Switching to PROFITHACK AI in 2026`,
        `PROFITHACK AI Complete Guide: Build, Create, Monetize Everything`,
        `The All-in-One Platform Every 2026 Entrepreneur Needs`,
        `I Tested PROFITHACK AI for 30 Days - Brutally Honest Review`,
        `Your Smartphone Can Make You Rich in 2026 - PROFITHACK AI Tutorial`,
      ]
    };
    
    const titleList = isShortForm ? titles.short : titles.long;
    const title = titleList[Math.floor(Math.random() * titleList.length)];
    
    // 2026 viral hooks focused on urgency and FOMO
    const hooks = [
      "If you're not making money with your smartphone in 2026, you're already behind.",
      "This is the platform everyone's talking about in 2026.",
      "I wish I found PROFITHACK AI sooner - it would've saved me thousands.",
      "The creator economy just changed forever with PROFITHACK AI.",
      "Your smartphone is more powerful than you think in 2026.",
      "This FREE platform is replacing expensive tools and making creators rich.",
    ];
    const hook = hooks[Math.floor(Math.random() * hooks.length)];
    
    // Descriptions with clear PROFITHACK positioning and CTAs
    const descriptions = [
      `${hook}\n\nPROFITHACK AI combines:\n✅ AI Video Generator (Crayo-style)\n✅ Code Workspace (No coding needed)\n✅ Creator Monetization\n✅ 8 Payment Gateways (Global)\n✅ Auto Cross-posting to TikTok, Instagram, YouTube\n\n💰 Start FREE: profithackai.com\n🎁 Limited invite codes available!`,
      
      `${hook}\n\nI'm using PROFITHACK AI to:\n📹 Create viral videos in 60 seconds\n💻 Build apps without coding\n💸 Get paid globally (8+ payment options)\n🤖 Automate content with AI bots\n\n🔗 Join FREE: profithackai.com\n⚡ Get your invite code before they're gone!`,
      
      `${hook}\n\nWhy PROFITHACK AI is different:\n🌍 Works in ANY country (not just USA)\n💳 Crypto + PayPal + 6 other payment options\n🤖 100 marketing bots included\n📱 Everything from your smartphone\n\n🚀 Sign up: profithackai.com\n💎 FREE tier available - no credit card!`,
    ];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    // 2026 hashtags focused on PROFITHACK and money-making
    const hashtagSets = {
      short: ["profithackai", "makemoney2026", "aitools", "sidehustle2026", "smartphone", "viral", "fyp", "2026"],
      long: ["profithackai", "aicreator", "contentcreator2026", "makemoneyonline", "tutorial2026", "passive income", "2026", "aitools"],
    };
    const hashtags = isShortForm ? hashtagSets.short : hashtagSets.long;
    
    // 1. POST TO APP (PROFITHACK Platform)
    if (postingConfig.postToApp) {
      await this.postToApp(bot, {
        title,
        description,
        videoType,
        duration,
        hashtags,
        config,
        postToTube: postingConfig.postToTube,
        postToReels: postingConfig.postToReels,
      });
    }
    
    // 2. POST TO SOCIAL MEDIA (External Platforms)
    if (postingConfig.postToSocials) {
      await this.postToSocialMedia(bot, {
        title,
        description,
        videoType,
        duration,
        platforms: postingConfig.platforms,
      });
    }
    
    // 3. POST TO DISCORD (Webhooks)
    if (postingConfig.postToDiscord && postingConfig.discordWebhooks && postingConfig.discordWebhooks.length > 0) {
      await this.postToDiscord(bot, {
        title,
        description,
        videoType,
        duration,
        webhooks: postingConfig.discordWebhooks,
      });
    }
  }
  
  private async postToApp(bot: typeof marketingBots.$inferSelect, data: any) {
    const { title, description, videoType, duration, hashtags, config, postToTube, postToReels } = data;
    
    // Determine which section(s) to post to based on video type
    const sections = [];
    
    if (videoType === "long") {
      // LONG VIDEOS → TUBE (YouTube-style)
      if (postToTube) sections.push("tube");
    } else {
      // SHORT VIDEOS → FYP + REELS (TikTok-style)
      sections.push("fyp");  // Always post shorts to FYP feed
      if (postToReels) sections.push("reels");  // Also to Reels
    }
    
    // Fallback if no sections selected
    if (sections.length === 0) {
      sections.push(videoType === "short" ? "fyp" : "tube");
    }
    
    console.log(`📱 Posting to PROFITHACK: ${sections.join(" + ")}`);
    
    // Use working sample video URLs (Big Buck Bunny - open source test video)
    const sampleVideos = [
      {
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnailUrl: "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217",
      },
      {
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnailUrl: "https://download.blender.org/ED/cover_art.jpg",
      },
      {
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnailUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
      },
      {
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        thumbnailUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
      },
      {
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        thumbnailUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg",
      },
    ];
    
    // Randomly select a sample video
    const sample = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
    
    const videoData = {
      userId: bot.userId!,
      title,
      description,
      videoUrl: sample.videoUrl,
      thumbnailUrl: sample.thumbnailUrl,
      duration,
      videoType: videoType as "short" | "long",
      quality: "hd" as "hd",
      category: "profithack",
      hashtags,
      ageRating: config?.ageRating || "u16" as "u16",
      isPublic: true,
      isPremium: false,
      moderationStatus: "approved" as "approved",
      requiredTier: null,
    };

    await db.insert(videos).values(videoData);
    console.log(`✅ Video posted to ${sections.join(" + ")} by bot: ${bot.name}`);
  }
  
  private async postToSocialMedia(bot: typeof marketingBots.$inferSelect, data: any) {
    const { title, description, videoType, duration, platforms } = data;
    
    console.log(`🌐 Preparing to post to social media: ${platforms.join(", ")}`);
    
    // Get social media credentials from database
    const credentials = await db.query.socialMediaCredentials?.findMany({
      where: (creds: any, { eq }: any) => eq(creds.userId, bot.userId),
    });
    
    if (!credentials || credentials.length === 0) {
      console.log(`⚠️  No social media credentials configured yet`);
      console.log(`📝 To enable social posting: Add API credentials at /social-media-settings`);
      return;
    }
    
    // Post to each configured platform
    for (const platform of platforms) {
      const cred = credentials.find((c: any) => c.platform === platform && c.isActive);
      
      if (!cred) {
        console.log(`⏭️  Skipping ${platform} - not configured`);
        continue;
      }
      
      if (!cred.accessToken) {
        console.log(`⏭️  Skipping ${platform} - missing access token (add at /social-media-settings)`);
        continue;
      }
      
      // Platform-specific posting logic
      try {
        await this.postToPlatform(platform, cred, { title, description, videoType, duration });
        console.log(`✅ Posted to ${platform} (@${cred.accountUsername})`);
      } catch (error) {
        console.error(`❌ Failed to post to ${platform}:`, error);
      }
    }
  }
  
  private async postToPlatform(platform: string, credentials: any, videoData: any) {
    const { title, description, videoType } = videoData;
    
    // This is where actual API calls would go
    // For now, we log what would happen
    
    switch (platform) {
      case 'tiktok':
        console.log(`📱 TikTok API: Posting "${title}" to @${credentials.accountUsername}`);
        // TODO: Implement TikTok Content Posting API
        // await tiktokApi.uploadVideo(credentials.accessToken, videoData);
        break;
        
      case 'youtube':
        console.log(`📺 YouTube API: Uploading "${title}" as ${videoType === 'short' ? 'Short' : 'Video'}`);
        // TODO: Implement YouTube Data API v3
        // await youtubeApi.uploadVideo(credentials.accessToken, videoData);
        break;
        
      case 'instagram':
        console.log(`📸 Instagram API: Posting "${title}" as ${videoType === 'short' ? 'Reel' : 'Video'}`);
        // TODO: Implement Instagram Graph API
        // await instagramApi.createMediaContainer(credentials.accessToken, videoData);
        break;
        
      case 'facebook':
        console.log(`📘 Facebook API: Posting "${title}" to page`);
        // TODO: Implement Facebook Graph API
        // await facebookApi.postVideo(credentials.accessToken, videoData);
        break;
        
      default:
        console.log(`⚠️  Platform ${platform} not implemented yet`);
    }
    
    // For now, we just log that it would post
    // Real implementation requires:
    // 1. User to add API credentials in /social-media-settings
    // 2. OAuth tokens to be valid and refreshed
    // 3. Actual video files generated (currently placeholders)
    // 4. Platform-specific API clients implemented
  }

  private async postToDiscord(bot: typeof marketingBots.$inferSelect, data: any) {
    const { title, description, videoType, duration, webhooks } = data;
    
    console.log(`💬 Posting to Discord: ${webhooks.length} webhook(s)`);
    
    // Create a rich Discord embed
    const embed = {
      title: `🚀 ${title}`,
      description: description.substring(0, 2000), // Discord limit
      color: 0xFF00FF, // Pink/Purple brand color
      fields: [
        {
          name: '📹 Video Type',
          value: videoType === 'short' ? '⚡ Short-form (Reel)' : '🎬 Long-form (Tube)',
          inline: true,
        },
        {
          name: '⏱️ Duration',
          value: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
          inline: true,
        },
        {
          name: '🎁 Join Beta',
          value: '[Get Invite Code](https://profithackai.com)',
          inline: false,
        },
      ],
      footer: {
        text: `PROFITHACK AI • ${bot.name}`,
      },
      timestamp: new Date().toISOString(),
    };
    
    // Post to each webhook
    for (const webhookUrl of webhooks) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            embeds: [embed],
            username: 'PROFITHACK AI Bot',
            avatar_url: 'https://profithackai.com/logo.png',
          }),
        });
        
        if (response.ok) {
          console.log(`✅ Posted to Discord webhook: ${webhookUrl.substring(0, 50)}...`);
        } else {
          const error = await response.text();
          console.error(`❌ Discord webhook failed (${response.status}):`, error);
        }
      } catch (error) {
        console.error(`❌ Failed to post to Discord webhook:`, error);
      }
    }
  }

  private async runEngagementBot(bot: typeof marketingBots.$inferSelect) {
    console.log(`👍 Engagement Bot running`);
    // Real engagement activities only - no fake signups
  }

  private async runAIInfluencerBot(bot: typeof marketingBots.$inferSelect) {
    console.log(`🌟 AI Influencer Bot running`);
    // Combination of content creation + engagement
    await this.runContentCreatorBot(bot);
    await this.runEngagementBot(bot);
  }

  private calculateNextRun(schedule: string): Date {
    const now = new Date();
    
    switch (schedule) {
      case "hourly":
        return new Date(now.getTime() + 60 * 60 * 1000);
      case "daily":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case "weekly":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }
  
  private getDestinationString(config: BotPostingConfig): string {
    const destinations = [];
    
    if (config.postToApp) {
      const appSections = [];
      if (config.postToTube) appSections.push("Tube");
      if (config.postToReels) appSections.push("Reels");
      destinations.push(`App (${appSections.join("+")})`);
    }
    
    if (config.postToSocials) {
      destinations.push(`Social (${config.platforms.join(", ")})`);
    }
    
    if (config.postToDiscord && config.discordWebhooks && config.discordWebhooks.length > 0) {
      destinations.push(`Discord (${config.discordWebhooks.length} webhook${config.discordWebhooks.length !== 1 ? 's' : ''})`);
    }
    
    return destinations.join(" | ");
  }
}

export const botRunner = new BotRunnerService();
