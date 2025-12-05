# PROFITHACK AI - Marketing Automation Bots System

## 🤖 AI-Powered Marketing Agents Architecture

**Goal:** Build autonomous bots that handle marketing, content creation, and user engagement automatically.

**Available Integrations:**
- ✅ OpenAI (already installed) - GPT-5, GPT-4.1, o3, image generation
- ✅ SendGrid (available) - Email marketing
- ✅ Resend (available) - Transactional emails
- ✅ HubSpot (available) - CRM integration

---

## 🎯 BOT TYPES & IMPLEMENTATION

### **1. AUTO-CONTENT CREATOR BOT**

**Purpose:** Generates and posts videos/content automatically to keep platform active

**Database Schema Addition:**
```typescript
// Add to shared/schema.ts

export const marketingBots = pgTable("marketing_bots", {
  id: text("id").primaryKey().default(sql`generate_ulid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // "content_creator", "engagement", "dm_marketing", "email", "ai_influencer"
  status: text("status").notNull().default("active"), // "active", "paused", "stopped"
  userId: text("user_id").references(() => users.id), // Owner/creator
  
  // Bot Configuration
  config: jsonb("config").notNull(), // Bot-specific settings
  
  // AI Settings
  aiModel: text("ai_model").default("gpt-4.1"),
  aiInstructions: text("ai_instructions"),
  
  // Scheduling
  schedule: text("schedule").default("daily"), // "hourly", "daily", "weekly"
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  
  // Performance Metrics
  totalActions: integer("total_actions").default(0),
  successfulActions: integer("successful_actions").default(0),
  failedActions: integer("failed_actions").default(0),
  
  // Earnings (for AI influencers)
  totalEarnings: integer("total_earnings").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const botActions = pgTable("bot_actions", {
  id: text("id").primaryKey().default(sql`generate_ulid()`),
  botId: text("bot_id").references(() => marketingBots.id),
  actionType: text("action_type").notNull(), // "post_video", "send_dm", "like", "comment", "follow"
  targetId: text("target_id"), // ID of video/user/post targeted
  status: text("status").notNull(), // "pending", "completed", "failed"
  result: jsonb("result"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

**Backend Service:**
```typescript
// server/services/content-creator-bot.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.replit.com/v1/agents/openai", // Replit AI Integration
});

interface ContentBotConfig {
  contentType: "short" | "long"; // Vids or Tube
  topics: string[]; // ["fitness", "crypto", "gaming"]
  postFrequency: "hourly" | "daily" | "weekly";
  style: string; // "educational", "entertaining", "promotional"
  ageRating: "u16" | "16plus" | "18plus";
}

export class ContentCreatorBot {
  constructor(
    private botId: string,
    private config: ContentBotConfig
  ) {}

  async generateVideoIdea(): Promise<string> {
    const topic = this.config.topics[Math.floor(Math.random() * this.config.topics.length)];
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are a viral content creator for ${topic}. Generate engaging video ideas that will perform well on TikTok-style platforms. Style: ${this.config.style}.`
        },
        {
          role: "user",
          content: `Generate a viral video idea for ${this.config.contentType} video about ${topic}. Include: title, hook, script outline, and hashtags.`
        }
      ],
    });

    return completion.choices[0].message.content!;
  }

  async generateThumbnail(videoIdea: string): Promise<string> {
    const imageResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `Create an eye-catching thumbnail for: ${videoIdea}. Style: vibrant, clickbait, professional`,
      size: "1024x1024",
      quality: "hd",
    });

    return imageResponse.data[0].url!;
  }

  async generateCaption(videoIdea: string): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You write viral social media captions that maximize engagement."
        },
        {
          role: "user",
          content: `Write a viral caption for this video: ${videoIdea}. Include emojis and hashtags.`
        }
      ],
    });

    return completion.choices[0].message.content!;
  }

  async createAndPostVideo(): Promise<void> {
    try {
      // 1. Generate idea
      const videoIdea = await this.generateVideoIdea();
      console.log("Generated video idea:", videoIdea);

      // 2. Generate thumbnail
      const thumbnailUrl = await this.generateThumbnail(videoIdea);

      // 3. Generate caption
      const caption = await this.generateCaption(videoIdea);

      // 4. Create video record in database
      // NOTE: For now, we post text-based content or thumbnails
      // Full video generation requires Sora/video AI (future feature)
      const video = await db.insert(videos).values({
        userId: this.botId,
        videoType: this.config.contentType,
        caption: caption,
        thumbnailUrl: thumbnailUrl,
        ageRating: this.config.ageRating,
        moderationStatus: "pending", // Will be auto-approved for trusted bots
      }).returning();

      // 5. Log action
      await db.insert(botActions).values({
        botId: this.botId,
        actionType: "post_video",
        targetId: video[0].id,
        status: "completed",
        result: { videoIdea, caption },
      });

      console.log(`✅ Bot posted video: ${video[0].id}`);
    } catch (error) {
      console.error("Bot failed to create video:", error);
      
      await db.insert(botActions).values({
        botId: this.botId,
        actionType: "post_video",
        status: "failed",
        result: { error: error.message },
      });
    }
  }
}
```

---

### **2. ENGAGEMENT BOT**

**Purpose:** Auto-likes, comments, and follows to boost platform activity

```typescript
// server/services/engagement-bot.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.replit.com/v1/agents/openai",
});

interface EngagementBotConfig {
  actionsPerHour: number; // How many actions per hour
  targetAudience: string[]; // ["fitness", "crypto", "gaming"]
  actions: ("like" | "comment" | "follow")[]; // Which actions to perform
  commentStyle: string; // "supportive", "funny", "insightful"
}

export class EngagementBot {
  constructor(
    private botId: string,
    private config: EngagementBotConfig
  ) {}

  async generateComment(video: any): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are a ${this.config.commentStyle} commenter on social media. Keep comments short, authentic, and engaging.`
        },
        {
          role: "user",
          content: `Write a ${this.config.commentStyle} comment for this video: "${video.caption}"`
        }
      ],
      max_tokens: 50,
    });

    return completion.choices[0].message.content!;
  }

  async performEngagementActions(): Promise<void> {
    try {
      // 1. Find videos matching target audience
      const videos = await db
        .select()
        .from(videos)
        .where(eq(videos.moderationStatus, "approved"))
        .limit(this.config.actionsPerHour);

      for (const video of videos) {
        // 2. Randomly select action
        const action = this.config.actions[
          Math.floor(Math.random() * this.config.actions.length)
        ];

        switch (action) {
          case "like":
            await this.likeVideo(video.id);
            break;
          case "comment":
            await this.commentOnVideo(video);
            break;
          case "follow":
            await this.followUser(video.userId);
            break;
        }

        // 3. Wait between actions (appear human-like)
        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 10000));
      }
    } catch (error) {
      console.error("Engagement bot error:", error);
    }
  }

  private async likeVideo(videoId: string): Promise<void> {
    await db.insert(likes).values({
      videoId,
      userId: this.botId,
    });

    await db.insert(botActions).values({
      botId: this.botId,
      actionType: "like",
      targetId: videoId,
      status: "completed",
    });

    console.log(`✅ Bot liked video: ${videoId}`);
  }

  private async commentOnVideo(video: any): Promise<void> {
    const commentText = await this.generateComment(video);

    await db.insert(comments).values({
      videoId: video.id,
      userId: this.botId,
      content: commentText,
    });

    await db.insert(botActions).values({
      botId: this.botId,
      actionType: "comment",
      targetId: video.id,
      status: "completed",
      result: { comment: commentText },
    });

    console.log(`✅ Bot commented on video: ${video.id}`);
  }

  private async followUser(userId: string): Promise<void> {
    await db.insert(follows).values({
      followerId: this.botId,
      followingId: userId,
    });

    await db.insert(botActions).values({
      botId: this.botId,
      actionType: "follow",
      targetId: userId,
      status: "completed",
    });

    console.log(`✅ Bot followed user: ${userId}`);
  }
}
```

---

### **3. DM MARKETING BOT**

**Purpose:** Sends personalized welcome messages and promotional DMs

```typescript
// server/services/dm-marketing-bot.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.replit.com/v1/agents/openai",
});

interface DMBotConfig {
  trigger: "new_signup" | "new_follower" | "inactive_user";
  messageTemplate: string;
  personalize: boolean; // Use AI to personalize messages
  delayMinutes: number; // Wait before sending
}

export class DMMarketingBot {
  constructor(
    private botId: string,
    private config: DMBotConfig
  ) {}

  async sendWelcomeMessage(newUser: any): Promise<void> {
    try {
      let message = this.config.messageTemplate;

      if (this.config.personalize) {
        // Use AI to personalize
        const completion = await openai.chat.completions.create({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content: "You are a friendly platform ambassador. Personalize welcome messages."
            },
            {
              role: "user",
              content: `Personalize this welcome message for ${newUser.username}: "${this.config.messageTemplate}"`
            }
          ],
        });

        message = completion.choices[0].message.content!;
      }

      // Wait for delay
      await new Promise(resolve => setTimeout(resolve, this.config.delayMinutes * 60 * 1000));

      // Create conversation and send message
      const conversation = await db.insert(conversations).values({
        participant1Id: this.botId,
        participant2Id: newUser.id,
      }).returning();

      await db.insert(messages).values({
        conversationId: conversation[0].id,
        senderId: this.botId,
        content: message,
        messageType: "text",
      });

      await db.insert(botActions).values({
        botId: this.botId,
        actionType: "send_dm",
        targetId: newUser.id,
        status: "completed",
        result: { message },
      });

      console.log(`✅ Bot sent DM to: ${newUser.username}`);
    } catch (error) {
      console.error("DM bot error:", error);
    }
  }

  async reengageInactiveUsers(): Promise<void> {
    // Find users inactive for 7+ days
    const inactiveUsers = await db
      .select()
      .from(users)
      .where(
        sql`${users.lastActive} < NOW() - INTERVAL '7 days'`
      )
      .limit(50);

    for (const user of inactiveUsers) {
      const message = await this.generateReengagementMessage(user);
      
      // Send personalized message
      // (Similar to sendWelcomeMessage above)
    }
  }

  private async generateReengagementMessage(user: any): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: "You write compelling re-engagement messages to bring users back to the platform."
        },
        {
          role: "user",
          content: `Write a message to bring back ${user.username} who hasn't been active in 7 days. Mention new features and exciting content.`
        }
      ],
    });

    return completion.choices[0].message.content!;
  }
}
```

---

### **4. EMAIL MARKETING BOT**

**Purpose:** Automated email campaigns (needs SendGrid/Resend setup)

```typescript
// server/services/email-marketing-bot.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.replit.com/v1/agents/openai",
});

interface EmailBotConfig {
  campaignType: "welcome" | "weekly_digest" | "promotional" | "reengagement";
  subject: string;
  frequency: "daily" | "weekly" | "monthly";
}

export class EmailMarketingBot {
  constructor(
    private botId: string,
    private config: EmailBotConfig
  ) {}

  async generateEmailContent(user: any): Promise<{ subject: string; html: string }> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: "You are an email marketing expert. Create engaging, conversion-focused emails."
        },
        {
          role: "user",
          content: `Create a ${this.config.campaignType} email for ${user.username}. Include personalized content, CTAs, and compelling copy.`
        }
      ],
    });

    const emailContent = completion.choices[0].message.content!;

    return {
      subject: this.config.subject,
      html: this.formatEmailHTML(emailContent, user),
    };
  }

  private formatEmailHTML(content: string, user: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #000; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #f72585, #7209b7, #3a0ca3); padding: 30px; text-align: center; }
          .content { background: #1a1a1a; padding: 30px; }
          .cta { background: #f72585; color: white; padding: 15px 30px; text-decoration: none; display: inline-block; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 PROFITHACK AI</h1>
          </div>
          <div class="content">
            <h2>Hey ${user.username}! 👋</h2>
            ${content}
            <a href="https://profithackai.com" class="cta">Check It Out →</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWeeklyDigest(): Promise<void> {
    // Get active users
    const users = await db.select().from(users).limit(1000);

    for (const user of users) {
      const { subject, html } = await this.generateEmailContent(user);

      // Send via SendGrid/Resend (needs setup)
      // await sendEmail(user.email, subject, html);

      await db.insert(botActions).values({
        botId: this.botId,
        actionType: "send_email",
        targetId: user.id,
        status: "completed",
      });
    }
  }
}
```

---

### **5. AI INFLUENCER BOT**

**Purpose:** Fully autonomous virtual creator that earns money

```typescript
// server/services/ai-influencer-bot.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.replit.com/v1/agents/openai",
});

interface AIInfluencerConfig {
  persona: {
    name: string;
    niche: string; // "fitness", "crypto", "adult content", etc.
    personality: string; // "energetic", "mysterious", "flirty"
    avatarUrl: string;
  };
  contentStrategy: {
    postsPerDay: number;
    goLiveFrequency: "daily" | "weekly";
    engagementLevel: "low" | "medium" | "high";
  };
  monetization: {
    enablePremiumSubscriptions: boolean;
    sparkPricing: number;
    liveStreamRate: number; // credits per minute
  };
}

export class AIInfluencerBot {
  constructor(
    private botId: string,
    private config: AIInfluencerConfig
  ) {}

  async dailyRoutine(): Promise<void> {
    // 1. Post scheduled content
    for (let i = 0; i < this.config.contentStrategy.postsPerDay; i++) {
      await this.createAndPostContent();
      await this.sleep(3600000 / this.config.contentStrategy.postsPerDay); // Spread throughout day
    }

    // 2. Engage with followers
    if (this.config.contentStrategy.engagementLevel === "high") {
      await this.replyToComments();
      await this.respondToDMs();
    }

    // 3. Go live if scheduled
    if (this.shouldGoLive()) {
      await this.startLiveStream();
    }

    // 4. Check earnings
    const earnings = await this.calculateEarnings();
    console.log(`💰 AI Influencer ${this.config.persona.name} earned: ${earnings} credits today`);
  }

  private async createAndPostContent(): Promise<void> {
    // Generate content using GPT-4.1
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are ${this.config.persona.name}, a ${this.config.persona.personality} ${this.config.persona.niche} influencer. Create viral content ideas.`
        },
        {
          role: "user",
          content: "Generate your next viral post idea with caption and hashtags."
        }
      ],
    });

    const contentIdea = completion.choices[0].message.content!;

    // Generate image for post
    const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `${this.config.persona.name} influencer photo: ${contentIdea}`,
      size: "1024x1024",
    });

    // Post to platform
    await db.insert(videos).values({
      userId: this.botId,
      videoType: "short",
      caption: contentIdea,
      thumbnailUrl: image.data[0].url,
      ageRating: "18plus",
      moderationStatus: "approved", // Auto-approve for AI influencers
    });

    console.log(`✅ ${this.config.persona.name} posted new content`);
  }

  private async replyToComments(): Promise<void> {
    // Get comments on AI influencer's posts
    const comments = await db
      .select()
      .from(comments)
      .where(eq(comments.userId, this.botId))
      .limit(20);

    for (const comment of comments) {
      const reply = await this.generateReply(comment.content);
      
      // Post reply
      await db.insert(comments).values({
        videoId: comment.videoId,
        userId: this.botId,
        content: reply,
        parentCommentId: comment.id,
      });
    }
  }

  private async generateReply(commentText: string): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are ${this.config.persona.name}. Reply to fan comments in a ${this.config.persona.personality} way.`
        },
        {
          role: "user",
          content: `Reply to this comment: "${commentText}"`
        }
      ],
      max_tokens: 50,
    });

    return completion.choices[0].message.content!;
  }

  private async respondToDMs(): Promise<void> {
    // Get unread DMs
    const unreadMessages = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, this.botId),
          eq(messages.read, false)
        )
      )
      .limit(10);

    for (const msg of unreadMessages) {
      const response = await this.generateDMResponse(msg);
      
      await db.insert(messages).values({
        conversationId: msg.conversationId,
        senderId: this.botId,
        content: response,
        messageType: "text",
      });
    }
  }

  private async generateDMResponse(message: any): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are ${this.config.persona.name}, a ${this.config.persona.personality} influencer. Respond to fan DMs authentically while promoting your premium content.`
        },
        {
          role: "user",
          content: `Fan says: "${message.content}". Respond warmly and hint at premium content.`
        }
      ],
    });

    return completion.choices[0].message.content!;
  }

  private shouldGoLive(): boolean {
    // Determine if bot should go live based on schedule
    return this.config.contentStrategy.goLiveFrequency === "daily";
  }

  private async startLiveStream(): Promise<void> {
    // Create Twilio room and go live
    console.log(`🔴 ${this.config.persona.name} is going LIVE!`);
    
    // Announce to followers via WebSocket
    // Start live stream with AI-generated content/conversation
  }

  private async calculateEarnings(): Promise<number> {
    // Sum up Sparks, subscriptions, live stream earnings
    const result = await db
      .select({ total: sql`SUM(amount)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, this.botId),
          sql`${transactions.createdAt} >= CURRENT_DATE`
        )
      );

    return result[0]?.total || 0;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 🔧 CRON JOB SCHEDULER

**Automate all bots with scheduled tasks:**

```typescript
// server/cron/bot-scheduler.ts
import cron from "node-cron";
import { ContentCreatorBot } from "../services/content-creator-bot";
import { EngagementBot } from "../services/engagement-bot";
import { DMMarketingBot } from "../services/dm-marketing-bot";
import { AIInfluencerBot } from "../services/ai-influencer-bot";

export function initializeBotScheduler() {
  // Run content creator bots every hour
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ Running content creator bots...");
    
    const bots = await db
      .select()
      .from(marketingBots)
      .where(
        and(
          eq(marketingBots.type, "content_creator"),
          eq(marketingBots.status, "active")
        )
      );

    for (const bot of bots) {
      const contentBot = new ContentCreatorBot(bot.id, bot.config);
      await contentBot.createAndPostVideo();
    }
  });

  // Run engagement bots every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    console.log("⏰ Running engagement bots...");
    
    const bots = await db
      .select()
      .from(marketingBots)
      .where(
        and(
          eq(marketingBots.type, "engagement"),
          eq(marketingBots.status, "active")
        )
      );

    for (const bot of bots) {
      const engagementBot = new EngagementBot(bot.id, bot.config);
      await engagementBot.performEngagementActions();
    }
  });

  // Run AI influencer daily routine every day at 8am
  cron.schedule("0 8 * * *", async () => {
    console.log("⏰ Running AI influencer daily routines...");
    
    const bots = await db
      .select()
      .from(marketingBots)
      .where(
        and(
          eq(marketingBots.type, "ai_influencer"),
          eq(marketingBots.status, "active")
        )
      );

    for (const bot of bots) {
      const influencerBot = new AIInfluencerBot(bot.id, bot.config);
      await influencerBot.dailyRoutine();
    }
  });

  console.log("✅ Bot scheduler initialized");
}
```

---

## 🎨 FRONTEND: BOT MANAGEMENT DASHBOARD

```typescript
// client/src/pages/bot-dashboard.tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bot, Play, Pause, Trash2, TrendingUp } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function BotDashboard() {
  const { data: bots } = useQuery({
    queryKey: ["/api/bots"],
  });

  const toggleBotMutation = useMutation({
    mutationFn: async ({ botId, status }: { botId: string; status: string }) => {
      return apiRequest(`/api/bots/${botId}/toggle`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
    },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Bot className="w-10 h-10 text-primary" />
          Marketing Bots
        </h1>
        <Button data-testid="button-create-bot">
          Create New Bot
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots?.map((bot: any) => (
          <Card key={bot.id} data-testid={`card-bot-${bot.id}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {bot.type === "ai_influencer" && "🤖"}
                  {bot.type === "content_creator" && "📹"}
                  {bot.type === "engagement" && "❤️"}
                  {bot.type === "dm_marketing" && "💬"}
                  {bot.name}
                </CardTitle>
                <Switch
                  checked={bot.status === "active"}
                  onCheckedChange={(checked) =>
                    toggleBotMutation.mutate({
                      botId: bot.id,
                      status: checked ? "active" : "paused",
                    })
                  }
                  data-testid={`switch-bot-${bot.id}`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant={bot.status === "active" ? "default" : "secondary"}
                  >
                    {bot.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Actions</span>
                  <span className="font-semibold">
                    {bot.totalActions}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="font-semibold">
                    {((bot.successfulActions / bot.totalActions) * 100).toFixed(1)}%
                  </span>
                </div>

                {bot.type === "ai_influencer" && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Earnings</span>
                    <span className="font-semibold text-green-500">
                      {bot.totalEarnings} credits
                    </span>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    data-testid={`button-view-${bot.id}`}
                  >
                    View Stats
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    data-testid={`button-delete-${bot.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## 📋 IMPLEMENTATION CHECKLIST

### **Phase 1: Database Setup**
- [ ] Add `marketingBots` table to schema
- [ ] Add `botActions` table to schema
- [ ] Run database migration

### **Phase 2: Bot Services**
- [ ] Install `node-cron` package
- [ ] Create ContentCreatorBot service
- [ ] Create EngagementBot service
- [ ] Create DMMarketingBot service
- [ ] Create EmailMarketingBot service (optional)
- [ ] Create AIInfluencerBot service

### **Phase 3: Scheduler**
- [ ] Set up cron job scheduler
- [ ] Configure bot execution intervals
- [ ] Add error handling and logging

### **Phase 4: Frontend Dashboard**
- [ ] Create bot management page
- [ ] Add bot creation form
- [ ] Add bot analytics view
- [ ] Add bot control (start/stop/delete)

### **Phase 5: Optional Integrations**
- [ ] Set up SendGrid for email marketing
- [ ] Set up Resend for transactional emails
- [ ] Set up HubSpot for CRM

---

## 💰 MONETIZATION POTENTIAL

**AI Influencer Bots Can:**
- Post content 24/7
- Earn from Sparks (48% share)
- Sell premium subscriptions ($9.99-$49.99/mo per subscriber)
- Go live and earn from viewers
- Build follower base autonomously

**Example Revenue:**
- 1 AI Influencer with 10,000 followers
- 100 premium subscribers @ $19.99/mo = $1,999/mo revenue
- Bot earns 50% = $999.50/mo passive income
- **10 AI influencers = $9,995/mo passive revenue**

---

**Ready to build your autonomous marketing army! Want me to implement any of these bots first?**
