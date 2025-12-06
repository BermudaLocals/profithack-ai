import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  uniqueIndex,
  pgEnum,
  decimal,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "explorer",
  "starter",
  "creator",
  "innovator",
]);
export const ageRatingEnum = pgEnum("age_rating", ["u16", "16plus", "18plus"]);
export const moderationStatusEnum = pgEnum("moderation_status", [
  "pending",
  "approved",
  "rejected",
  "flagged",
]);
export const transactionTypeEnum = pgEnum("transaction_type", [
  "subscription",
  "spark_sent",
  "spark_received",
  "credit_purchase",
  "withdrawal",
  "wallet_deposit",
  "wallet_withdrawal",
  "transfer_sent",
  "transfer_received",
  "transfer_fee",
]);
export const paymentProviderEnum = pgEnum("payment_provider", [
  "payoneer",
  "payeer",
  "crypto_nowpayments",
  "stripe",
  "paypal",
  "mtn_momo",
  "square",
  "crypto",
  "worldremit",
  "ton",
  "other",
]);
// Sparks (Virtual Gifts) - 150 Total (TikTok-BEATING catalog!) 🔥
// Includes 3 PROFITHACK AI Custom Gifts: dailyHeart (1c), levelUp (99c), profithackP (15000c)
export const sparkTypeEnum = pgEnum("spark_type", [
  // Existing Sparks (9 total)
  "glow",        // 5 credits (TikTok Rose equivalent but animated)
  "blaze",       // 25 credits (Animated fire effect)
  "stardust",    // 50 credits (Particle explosion)
  "rocket",      // 100 credits (Rocket launch animation)
  "galaxy",      // 500 credits (Cosmic swirl effect)
  "supernova",   // 1000 credits (Massive explosion)
  "infinity",    // 2500 credits (Infinity symbol animation)
  "royalty",     // 5000 credits (Crown + confetti)
  "godmode",     // 10000 credits (Epic legendary effect)
  
  // Bermuda Gifts (9 total)
  "pinkSand",    // 5 credits - Pink Sand (Bermuda's famous pink beaches)
  "seaGlass",    // 25 credits - Sea Glass (treasures from the shore)
  "longtail",    // 50 credits - Longtail Bird (Bermuda's national bird)
  "coralReef",   // 100 credits - Coral Reef (underwater beauty)
  "lighthouse",  // 250 credits - Lighthouse Beacon (guiding light)
  "gombey",      // 500 credits - Gombey Dancer (traditional Bermuda culture)
  "moonGate",    // 1000 credits - Moon Gate (romantic arch tradition)
  "islandParadise", // 2500 credits - Island Paradise (ultimate luxury)
  "bermudaTriangle", // 5000 credits - Bermuda Triangle (mysterious premium)
  
  // Hearts & Love (8 total)
  "heart",       // 5 credits - Simple love
  "rose",        // 10 credits - Classic romance
  "loveWave",    // 50 credits - Spreading love
  "bouquet",     // 100 credits - Full of flowers
  "cupid",       // 250 credits - Arrow of love
  "loveStorm",   // 500 credits - Overwhelming affection
  "diamondRing", // 1000 credits - Ultimate commitment
  "loveBomb",    // 2000 credits - Explosive affection
  
  // Luxury & Status (8 total)
  "dollar",      // 15 credits - Money stack
  "gold",        // 75 credits - Gold bar
  "sportsCar",   // 200 credits - Speed and luxury
  "yacht",       // 600 credits - Sea luxury
  "jet",         // 1500 credits - Private jet
  "mansion",     // 3000 credits - Dream home
  "island",      // 6000 credits - Private island
  "empire",      // 10000 credits - Build a legacy
  
  // Nature & Animals (8 total)
  "butterfly",   // 8 credits - Graceful beauty
  "sunflower",   // 20 credits - Bright and happy
  "dolphin",     // 80 credits - Playful spirit
  "eagle",       // 150 credits - Soaring high
  "peacock",     // 300 credits - Showing off
  "phoenix",     // 750 credits - Rising from ashes
  "dragon",      // 1800 credits - Mythical power
  "unicorn",     // 4000 credits - Magical rarity
  
  // Effects & Celebrations (8 total)
  "confetti",    // 12 credits - Party time
  "fireworks",   // 60 credits - Celebration
  "spotlight",   // 120 credits - Shine bright
  "aura",        // 400 credits - Special energy
  "portal",      // 900 credits - Teleport to success
  "starfall",    // 2200 credits - Cosmic shower
  "aurora",      // 5000 credits - Northern lights
  "godRay",      // 8000 credits - Divine light
  
  // Gaming & Esports (10 total)
  "controller",  // 10 credits - Gaming controller
  "trophy",      // 30 credits - Victory trophy
  "headset",     // 70 credits - Gaming headset
  "arcade",      // 140 credits - Arcade machine
  "victory",     // 350 credits - Victory celebration
  "champion",    // 800 credits - Championship belt
  "legendary",   // 1900 credits - Legendary weapon
  "esports",     // 4500 credits - Esports trophy
  "gamerGod",    // 9000 credits - Ultimate gamer
  "worldChamp",  // 15000 credits - World champion
  
  // Music & Entertainment (10 total)
  "music",       // 6 credits - Music note
  "microphone",  // 18 credits - Microphone
  "guitar",      // 55 credits - Guitar
  "vinyl",       // 130 credits - Vinyl record
  "dj",          // 320 credits - DJ mixer
  "concert",     // 780 credits - Concert tickets
  "rockstar",    // 1850 credits - Rockstar
  "superstar",   // 4200 credits - Superstar
  "legend",      // 8500 credits - Music legend
  "hallOfFame",  // 14000 credits - Hall of fame
  
  // Food & Drinks (10 total)
  "coffee",      // 7 credits - Coffee cup
  "pizza",       // 22 credits - Pizza slice
  "burger",      // 65 credits - Burger
  "sushi",       // 135 credits - Sushi platter
  "champagne",   // 340 credits - Champagne bottle
  "cake",        // 820 credits - Birthday cake
  "feast",       // 1950 credits - Royal feast
  "caviar",      // 4400 credits - Premium caviar
  "truffle",     // 8800 credits - Black truffle
  "goldSteak",   // 16000 credits - Gold-plated steak
  
  // Sports & Fitness (10 total)
  "soccer",      // 9 credits - Soccer ball
  "basketball",  // 28 credits - Basketball
  "medal",       // 68 credits - Medal
  "podium",      // 145 credits - Podium finish
  "goldMedal",   // 360 credits - Gold medal
  "stadium",     // 850 credits - Stadium
  "mvp",         // 2000 credits - MVP award
  "goat",        // 4600 credits - GOAT status
  "olympian",    // 9200 credits - Olympic champion
  "worldRecord", // 17000 credits - World record
  
  // Legendary & Ultra Premium (10 total)
  "throne",      // 11 credits - Royal throne
  "castle",      // 35 credits - Castle
  "scepter",     // 90 credits - Royal scepter
  "jewels",      // 180 credits - Crown jewels
  "galaxyCrown", // 450 credits - Galaxy crown
  "immortal",    // 1100 credits - Immortal gift
  "titan",       // 2600 credits - Titan power
  "deity",       // 5500 credits - Divine deity
  "cosmos",      // 11000 credits - Cosmic ruler
  "universe",    // 20000 credits - Universe creator
  
  // 🔥 PROFITHACK AI CUSTOM GIFTS (3 total) - EXCLUSIVE BRANDING
  "dailyHeart",  // 1 credit - FREE daily heart (psychology mechanic, loss aversion, daily claim)
  "levelUp",     // 99 credits - Level Up (popular TikTok style, neon animation, progress bar)
  "profithackP", // 15000 credits - Luxury PROFITHACK AI "P" Logo (neon pink/cyan, premium brand flex)
  
  // Tech & Innovation (10 total)
  "code",        // 13 credits - Code snippet
  "ai",          // 40 credits - AI brain
  "robot",       // 95 credits - Robot assistant
  "chip",        // 190 credits - Microchip
  "quantum",     // 470 credits - Quantum computer
  "metaverse",   // 1150 credits - Metaverse portal
  "cyborg",      // 2700 credits - Cyborg upgrade
  "singularity", // 6000 credits - AI singularity
  "techGod",     // 12000 credits - Tech deity
  "matrix",      // 21000 credits - Control the matrix
  
  // Crypto & Web3 (10 total)
  "bitcoin",     // 14 credits - Bitcoin coin
  "ethereum",    // 42 credits - Ethereum logo
  "nft",         // 98 credits - NFT collectible
  "blockchain",  // 195 credits - Blockchain network
  "defi",        // 480 credits - DeFi protocol
  "dao",         // 1180 credits - DAO governance
  "web3",        // 2750 credits - Web3 revolution
  "metaToken",   // 6200 credits - Meta token
  "cryptoWhale", // 12500 credits - Crypto whale
  "satoshi",     // 22000 credits - Satoshi tribute
  
  // Travel & Adventure (10 total)
  "passport",    // 16 credits - Passport stamp
  "luggage",     // 45 credits - Travel luggage
  "beach",       // 105 credits - Beach paradise
  "mountain",    // 200 credits - Mountain peak
  "safari",      // 490 credits - Safari adventure
  "cruise",      // 1200 credits - Luxury cruise
  "worldTour",   // 2800 credits - World tour
  "spaceTrip",   // 6500 credits - Space tourism
  "timeMachine", // 13000 credits - Time travel
  "teleport",    // 23000 credits - Instant teleport
  
  // Fashion & Beauty (9 total)
  "lipstick",    // 17 credits - Lipstick kiss
  "perfume",     // 48 credits - Designer perfume
  "handbag",     // 110 credits - Luxury handbag
  "heels",       // 210 credits - Designer heels
  "designer",    // 500 credits - Designer outfit
  "runway",      // 1250 credits - Fashion runway
  "supermodel",  // 2900 credits - Supermodel status
  "vogue",       // 6800 credits - Vogue cover
  "fashionIcon", // 13500 credits - Fashion icon
  
  // Party & Nightlife (8 total)
  "vipTable",    // 19 credits - VIP table
  "bottle",      // 50 credits - Bottle service
  "limousine",   // 115 credits - Limousine ride
  "penthouse",   // 220 credits - Penthouse party
  "club",        // 510 credits - Exclusive club
  "afterParty",  // 1300 credits - After party
  "festival",    // 3000 credits - Music festival
  "ibiza",       // 7000 credits - Ibiza experience
]);
export const pluginTypeEnum = pgEnum("plugin_type", [
  "ai-agent",
  "content-tool",
  "workflow",
  "integration",
  "theme",
  "analytics",
]);
export const pluginStatusEnum = pgEnum("plugin_status", [
  "draft",
  "pending",
  "approved",
  "rejected",
  "suspended",
]);

export const influencerGenderEnum = pgEnum("influencer_gender", [
  "female",
  "male",
  "non-binary",
  "other",
]);

export const influencerContentTypeEnum = pgEnum("influencer_content_type", [
  "lifestyle",
  "fitness",
  "gaming",
  "education",
  "entertainment",
  "business",
  "tech",
  "fashion",
  "music",
  "other",
]);

export const videoTypeEnum = pgEnum("video_type", [
  "short",  // TikTok-style (60s max)
  "long",   // YouTube-style (unlimited)
]);

export const videoQualityEnum = pgEnum("video_quality", [
  "sd",     // 480p (free)
  "hd",     // 720p (free)
  "fhd",    // 1080p (premium)
  "4k",     // 2160p (premium)
]);

export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "image",
  "video",
  "voice",
  "file",
]);

export const callTypeEnum = pgEnum("call_type", [
  "video",
  "audio",
]);

export const callStatusEnum = pgEnum("call_status", [
  "ringing",
  "active",
  "ended",
  "missed",
  "declined",
  "failed",
]);

export const usernameTierEnum = pgEnum("username_tier", [
  "standard",      // Free usernames (8+ characters)
  "premium",       // Premium short usernames (4-7 chars) - $99-$999
  "elite",         // Elite ultra-short (2-3 chars) - $999-$9999
  "celebrity",     // Celebrity/brand names - $9999+
  "reserved",      // System reserved (admin, support, etc.)
]);

export const usernameStatusEnum = pgEnum("username_status", [
  "available",
  "purchased",
  "reserved",
  "auction",
]);

export const withdrawalStatusEnum = pgEnum("withdrawal_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
]);

export const premiumTierEnum = pgEnum("premium_tier", [
  "basic",        // $9.99/mo - Basic exclusive content
  "vip",          // $29.99/mo - VIP content + perks
  "innerCircle",  // $99.99/mo - Ultimate access + 1-on-1
]);

export const legalDocumentTypeEnum = pgEnum("legal_document_type", [
  "terms_of_service",
  "privacy_policy",
  "hold_harmless",
  "bermuda_jurisdiction",
]);

export const appealStatusEnum = pgEnum("appeal_status", [
  "pending",
  "approved",
  "rejected",
]);

export const brandVerificationStatusEnum = pgEnum("brand_verification_status", [
  "pending",
  "approved",
  "rejected",
  "flagged",
]);

// Session storage table (Required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table (Replit Auth compatible)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  passwordHash: varchar("password_hash"), // For username/password auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  displayName: varchar("display_name"), // TikTok-style account name
  bio: text("bio"),
  website: varchar("website"), // Primary website link
  links: text("links").array(), // Social media links (Instagram, X, YouTube, etc.)
  dateOfBirth: timestamp("date_of_birth"), // 18+ age verification
  phoneNumber: varchar("phone_number").unique(),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  subscriptionTier: subscriptionTierEnum("subscription_tier")
    .notNull()
    .default("explorer"),
  credits: integer("credits").notNull().default(0), // For AI tools (subscription-based, 1 credit = $0.0024) - TRANSFERABLE & CASHABLE
  bonusCredits: integer("bonus_credits").notNull().default(0), // Welcome bonus credits - NON-TRANSFERABLE & NON-CASHABLE (for platform use only)
  coins: integer("coins").notNull().default(0), // For gifts/tips (purchasable, TikTok pricing)
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  ageVerified: boolean("age_verified").notNull().default(false),
  ageRating: ageRatingEnum("age_rating").notNull().default("u16"),
  isAdmin: boolean("is_admin").notNull().default(false),
  isFounder: boolean("is_founder").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  strikeCount: integer("strike_count").notNull().default(0),
  followerCount: integer("follower_count").notNull().default(0),
  followingCount: integer("following_count").notNull().default(0),
  isPrivate: boolean("is_private").notNull().default(false),
  preferredLanguage: varchar("preferred_language").notNull().default("en"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  paypalCustomerId: varchar("paypal_customer_id"),
  paypalSubscriptionId: varchar("paypal_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // GDPR/CCPA Compliance Fields
  deletedAt: timestamp("deleted_at"), // Soft delete for GDPR right to erasure
  dataRetentionDate: timestamp("data_retention_date"), // When to permanently delete
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Phone Verifications table (SMS OTP verification)
export const phoneVerifications = pgTable("phone_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_phone_verifications_phone").on(table.phoneNumber),
  index("idx_phone_verifications_created").on(table.createdAt),
]);

export const insertPhoneVerificationSchema = createInsertSchema(phoneVerifications).omit({
  id: true,
  createdAt: true,
});
export type InsertPhoneVerification = z.infer<typeof insertPhoneVerificationSchema>;
export type PhoneVerification = typeof phoneVerifications.$inferSelect;

// Email Verifications table (for email verification tokens)
export const emailVerifications = pgTable("email_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  code: varchar("code").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_email_verifications_email").on(table.email),
  index("idx_email_verifications_created").on(table.createdAt),
]);

export const insertEmailVerificationSchema = createInsertSchema(emailVerifications).omit({
  id: true,
  createdAt: true,
});
export type InsertEmailVerification = z.infer<typeof insertEmailVerificationSchema>;
export type EmailVerification = typeof emailVerifications.$inferSelect;

// Follows table (social connections)
export const follows = pgTable(
  "follows",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    followerId: varchar("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: varchar("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("unique_follow").on(table.followerId, table.followingId),
    index("follower_idx").on(table.followerId),
    index("following_idx").on(table.followingId),
  ]
);

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof follows.$inferSelect;

// Follow Requests table (for private accounts)
export const followRequests = pgTable(
  "follow_requests",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    requesterId: varchar("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetId: varchar("target_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, accepted, rejected
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("unique_follow_request").on(table.requesterId, table.targetId),
    index("requester_idx").on(table.requesterId),
    index("target_idx").on(table.targetId),
  ]
);

export const insertFollowRequestSchema = createInsertSchema(followRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFollowRequest = z.infer<typeof insertFollowRequestSchema>;
export type FollowRequest = typeof followRequests.$inferSelect;

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tier: subscriptionTierEnum("tier").notNull(),
  status: varchar("status").notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Creator Premium Profiles (OnlyFans-style settings)
export const creatorProfiles = pgTable("creator_profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  isPremiumCreator: boolean("is_premium_creator").notNull().default(false),
  basicTierEnabled: boolean("basic_tier_enabled").notNull().default(true),
  basicTierPrice: integer("basic_tier_price").notNull().default(999), // In cents ($9.99)
  vipTierEnabled: boolean("vip_tier_enabled").notNull().default(false),
  vipTierPrice: integer("vip_tier_price").default(2999), // In cents ($29.99)
  innerCircleTierEnabled: boolean("inner_circle_tier_enabled").notNull().default(false),
  innerCircleTierPrice: integer("inner_circle_tier_price").default(9999), // In cents ($99.99)
  subscriberCount: integer("subscriber_count").notNull().default(0),
  monthlyEarnings: integer("monthly_earnings").notNull().default(0), // In cents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCreatorProfileSchema = createInsertSchema(creatorProfiles).omit({
  id: true,
  subscriberCount: true,
  monthlyEarnings: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCreatorProfile = z.infer<typeof insertCreatorProfileSchema>;
export type CreatorProfile = typeof creatorProfiles.$inferSelect;

// Premium Subscriptions (User subscribes to Creator's premium content)
export const premiumSubscriptions = pgTable("premium_subscriptions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  subscriberId: varchar("subscriber_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  creatorId: varchar("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tier: premiumTierEnum("tier").notNull().default("basic"),
  status: varchar("status").notNull().default("active"), // active, cancelled, expired
  amountCents: integer("amount_cents").notNull(), // Monthly price in cents
  nextBillingDate: timestamp("next_billing_date").notNull(),
  lastBillingDate: timestamp("last_billing_date"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  subscriberIdx: index("idx_premium_subs_subscriber").on(table.subscriberId),
  creatorIdx: index("idx_premium_subs_creator").on(table.creatorId),
  // One subscription per user per creator
  uniqueSub: uniqueIndex("idx_premium_subs_unique").on(table.subscriberId, table.creatorId),
}));

export const insertPremiumSubscriptionSchema = createInsertSchema(premiumSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPremiumSubscription = z.infer<typeof insertPremiumSubscriptionSchema>;
export type PremiumSubscription = typeof premiumSubscriptions.$inferSelect;

// Private Shows - Cam Site Model (Pay per minute, multiple viewers)
export const privateSessions = pgTable("private_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  modelId: varchar("model_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status").notNull().default("active"), // active, ended
  creditsPerMinute: integer("credits_per_minute").notNull(), // Model sets rate
  viewerCount: integer("viewer_count").notNull().default(0),
  totalEarningsCredits: integer("total_earnings_credits").notNull().default(0),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
}, (table) => ({
  modelIdx: index("idx_private_sessions_model").on(table.modelId),
  statusIdx: index("idx_private_sessions_status").on(table.status),
}));

export const insertPrivateSessionSchema = createInsertSchema(privateSessions).omit({
  id: true,
  viewerCount: true,
  totalEarningsCredits: true,
  startedAt: true,
  endedAt: true,
});
export type InsertPrivateSession = z.infer<typeof insertPrivateSessionSchema>;
export type PrivateSession = typeof privateSessions.$inferSelect;

// Private Session Viewers - Track who's paying to watch
export const privateSessionViewers = pgTable("private_session_viewers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => privateSessions.id, { onDelete: "cascade" }),
  viewerId: varchar("viewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  creditsSpent: integer("credits_spent").notNull().default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
}, (table) => ({
  sessionIdx: index("idx_private_viewers_session").on(table.sessionId),
  viewerIdx: index("idx_private_viewers_viewer").on(table.viewerId),
  uniqueViewer: uniqueIndex("idx_private_viewers_unique").on(table.sessionId, table.viewerId),
}));

export const insertPrivateSessionViewerSchema = createInsertSchema(privateSessionViewers).omit({
  id: true,
  creditsSpent: true,
  joinedAt: true,
  leftAt: true,
});
export type InsertPrivateSessionViewer = z.infer<typeof insertPrivateSessionViewerSchema>;
export type PrivateSessionViewer = typeof privateSessionViewers.$inferSelect;

// Toy Control Events - Lovense Integration
export const toyControlEvents = pgTable("toy_control_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  modelId: varchar("model_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  viewerId: varchar("viewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sparkType: sparkTypeEnum("spark_type").notNull(),
  intensity: integer("intensity").notNull().default(5), // 1-10
  durationSeconds: integer("duration_seconds").notNull().default(5),
  creditsSpent: integer("credits_spent").notNull(),
  triggeredAt: timestamp("triggered_at").defaultNow(),
}, (table) => ({
  modelIdx: index("idx_toy_events_model").on(table.modelId),
  viewerIdx: index("idx_toy_events_viewer").on(table.viewerId),
}));

export const insertToyControlEventSchema = createInsertSchema(toyControlEvents).omit({
  id: true,
  triggeredAt: true,
});
export type InsertToyControlEvent = z.infer<typeof insertToyControlEventSchema>;
export type ToyControlEvent = typeof toyControlEvents.$inferSelect;

// Premium Usernames Marketplace
export const premiumUsernames = pgTable("premium_usernames", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  tier: usernameTierEnum("tier").notNull(),
  status: usernameStatusEnum("status").notNull().default("available"),
  priceCredits: integer("price_credits").notNull().$default(() => 0), // Price in credits (1 credit = $0.01), minimum enforced by validation
  ownerId: varchar("owner_id").references(() => users.id, { onDelete: "set null" }),
  description: text("description"), // For celebrity/brand names
  tags: text("tags").array(), // e.g., ["brand", "celebrity", "tech"]
  purchasedAt: timestamp("purchased_at"),
  auctionEndDate: timestamp("auction_end_date"),
  currentBidCredits: integer("current_bid_credits"), // Must be >= priceCredits when status='auction'
  currentBidderId: varchar("current_bidder_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  usernameIdx: index("idx_premium_usernames_username").on(table.username),
  statusIdx: index("idx_premium_usernames_status").on(table.status),
  tierIdx: index("idx_premium_usernames_tier").on(table.tier),
  // CHECK constraint: priceCredits must be non-negative
  priceNonNegativeCheck: sql`CHECK (price_credits >= 0)`,
  // CHECK constraint: auction fields required when status='auction'
  auctionFieldsCheck: sql`CHECK (
    (status = 'auction' AND 
     auction_end_date IS NOT NULL AND 
     current_bid_credits IS NOT NULL AND 
     current_bidder_id IS NOT NULL AND 
     current_bid_credits >= price_credits) OR
    (status != 'auction')
  )`,
}));

// Minimum prices per tier (in credits: 1 credit = $0.01)
export const TIER_MIN_PRICES = {
  standard: 0,        // Free
  premium: 9900,      // $99
  elite: 99900,       // $999
  celebrity: 999900,  // $9999
  reserved: 0,        // System reserved
} as const;

export const insertPremiumUsernameSchema = createInsertSchema(premiumUsernames)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .refine(
    (data) => {
      // Enforce tier-based length requirements
      const usernameLength = data.username.length;
      
      if (data.tier === "standard") {
        return usernameLength >= 8;
      } else if (data.tier === "premium") {
        return usernameLength >= 4 && usernameLength <= 7;
      } else if (data.tier === "elite") {
        return usernameLength >= 2 && usernameLength <= 3;
      }
      // celebrity and reserved can be any length
      return true;
    },
    (data) => {
      const tierLengthRules = {
        standard: "8+ characters",
        premium: "4-7 characters",
        elite: "2-3 characters",
        celebrity: "any length",
        reserved: "any length",
      };
      return {
        message: `Username must be ${tierLengthRules[data.tier]} for tier ${data.tier}`,
        path: ["username"],
      };
    }
  )
  .refine(
    (data) => {
      // Enforce standard tier must be free (price = 0)
      if (data.tier === "standard" || data.tier === "reserved") {
        return data.priceCredits === 0;
      }
      return true;
    },
    {
      message: "Standard and reserved tier usernames must be free (0 credits)",
      path: ["priceCredits"],
    }
  )
  .refine(
    (data) => {
      // Enforce minimum pricing per tier
      const minPrice = TIER_MIN_PRICES[data.tier];
      return (data.priceCredits ?? 0) >= minPrice;
    },
    (data) => ({
      message: `Price must be at least ${TIER_MIN_PRICES[data.tier]} credits for tier ${data.tier}`,
      path: ["priceCredits"],
    })
  )
  .refine(
    (data) => {
      // Auction fields required when status='auction'
      if (data.status === "auction") {
        return (
          data.auctionEndDate != null &&
          data.currentBidCredits != null &&
          data.currentBidderId != null &&
          data.currentBidCredits >= (data.priceCredits ?? 0)
        );
      }
      return true;
    },
    {
      message: "Auction must have end date, current bid, bidder, and bid >= starting price",
      path: ["status"],
    }
  );

export type InsertPremiumUsername = z.infer<typeof insertPremiumUsernameSchema>;
export type PremiumUsername = typeof premiumUsernames.$inferSelect;

// Username Purchase History
export const usernamePurchases = pgTable("username_purchases", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  usernameId: varchar("username_id")
    .notNull()
    .references(() => premiumUsernames.id, { onDelete: "cascade" }),
  buyerId: varchar("buyer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sellerId: varchar("seller_id").references(() => users.id, { onDelete: "set null" }), // null if first purchase from platform
  priceCredits: integer("price_credits").notNull(),
  paymentProvider: paymentProviderEnum("payment_provider").notNull(),
  transactionId: varchar("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUsernamePurchaseSchema = createInsertSchema(usernamePurchases).omit({
  id: true,
  createdAt: true,
});
export type InsertUsernamePurchase = z.infer<typeof insertUsernamePurchaseSchema>;
export type UsernamePurchase = typeof usernamePurchases.$inferSelect;

// Projects table (code workspace)
export const projects = pgTable("projects", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  language: varchar("language").notNull(),
  files: jsonb("files").notNull().default(sql`'[]'::jsonb`),
  isPublic: boolean("is_public").notNull().default(true),
  deploymentUrl: varchar("deployment_url"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Videos table (TikTok + YouTube style content)
export const videos = pgTable("videos", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  videoUrl: varchar("video_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  duration: integer("duration"),  // in seconds
  videoType: videoTypeEnum("video_type").notNull().default("short"),
  quality: videoQualityEnum("quality").notNull().default("hd"),
  hashtags: text("hashtags")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  category: varchar("category"),  // e.g., "gaming", "education", "vlog"
  isPublic: boolean("is_public").notNull().default(true),
  isPremium: boolean("is_premium").notNull().default(false), // OnlyFans-style premium content
  requiredTier: premiumTierEnum("required_tier"), // Which premium tier is required
  ageRating: ageRatingEnum("age_rating").notNull().default("u16"),
  viewCount: integer("view_count").notNull().default(0),
  totalWatchTime: integer("total_watch_time").notNull().default(0), // Total seconds watched across all views
  likeCount: integer("like_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  sparkCount: integer("spark_count").notNull().default(0),
  moderationStatus: moderationStatusEnum("moderation_status")
    .notNull()
    .default("pending"),
  // VIRAL HOOK SYSTEM - Based on viral video marketing strategies
  hookText: text("hook_text"), // First 3 seconds text/context that stops the scroll
  hookType: varchar("hook_type"), // "challenge_belief" | "open_loop" | "curiosity_gap" | "pattern_interrupt"
  hasContext: boolean("has_context").notNull().default(false), // Did they add context in first frame?
  avgRetentionRate: decimal("avg_retention_rate", { precision: 5, scale: 2 }).default("0"), // Percentage of video watched
  hookScore: integer("hook_score").notNull().default(0), // AI-calculated hook quality score (0-100)
  swipeBackCount: integer("swipe_back_count").notNull().default(0), // Users who swiped back to rewatch
  shareCount: integer("share_count").notNull().default(0), // Social shares for viral tracking
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  viewCount: true,
  totalWatchTime: true,
  likeCount: true,
  commentCount: true,
  sparkCount: true,
  avgRetentionRate: true,
  hookScore: true,
  swipeBackCount: true,
  shareCount: true,
  createdAt: true,
});
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

// Spark Catalog table (Gift Definitions - 100+ types!)
export const sparkCatalog = pgTable("spark_catalog", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  emoji: varchar("emoji", { length: 10 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(),
  subcategory: varchar("subcategory", { length: 50 }),
  creditCost: integer("credit_cost").notNull(),
  usdValue: decimal("usd_value", { precision: 8, scale: 2 }),
  rarity: varchar("rarity", { length: 20 }).default("common"),
  animationType: varchar("animation_type", { length: 50 }).notNull().default("particle"),
  animationDuration: integer("animation_duration").notNull().default(800),
  particleCount: integer("particle_count").default(50),
  scale: integer("scale").default(100),
  primaryColor: varchar("primary_color", { length: 7 }).notNull().default("#FFD700"),
  secondaryColor: varchar("secondary_color", { length: 7 }),
  tertiaryColor: varchar("tertiary_color", { length: 7 }),
  soundVolume: integer("sound_volume").default(70),
  hasAudio: boolean("has_audio").default(false),
  isActive: boolean("is_active").default(true),
  isNew: boolean("is_new").default(false),
  isFeatured: boolean("is_featured").default(false),
  isLimited: boolean("is_limited").default(false),
  availableFrom: timestamp("available_from"),
  availableUntil: timestamp("available_until"),
  totalSent: integer("total_sent").default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0"),
  popularity: integer("popularity").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  metadata: jsonb("metadata"),
}, (table) => ({
  categoryIdx: index("spark_catalog_category_idx").on(table.category),
  isActiveIdx: index("spark_catalog_is_active_idx").on(table.isActive),
  rarityIdx: index("spark_catalog_rarity_idx").on(table.rarity),
}));

export type SparkCatalogItem = typeof sparkCatalog.$inferSelect;
export type InsertSparkCatalogItem = typeof sparkCatalog.$inferInsert;

// Virtual Gifts table (Transactions - who sent what to whom)
export const virtualGifts = pgTable("virtual_gifts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiverId: varchar("receiver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  videoId: varchar("video_id").references(() => videos.id, {
    onDelete: "cascade",
  }),
  sparkId: integer("spark_id").references(() => sparkCatalog.id),
  sparkType: sparkTypeEnum("spark_type").notNull(),
  creditCost: integer("credit_cost").notNull(),
  creatorEarnings: integer("creator_earnings").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  senderIdx: index("virtual_gifts_sender_idx").on(table.senderId),
  receiverIdx: index("virtual_gifts_receiver_idx").on(table.receiverId),
  videoIdx: index("virtual_gifts_video_idx").on(table.videoId),
}));

export const insertVirtualGiftSchema = createInsertSchema(virtualGifts).omit({
  id: true,
  createdAt: true,
});
export type InsertVirtualGift = z.infer<typeof insertVirtualGiftSchema>;
export type VirtualGift = typeof virtualGifts.$inferSelect;

// Conversations table (WhatsApp-style group chats/channels)
export const conversations = pgTable("conversations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name"),  // null for 1:1 chats
  imageUrl: varchar("image_url"),
  isGroup: boolean("is_group").notNull().default(false),
  creatorId: varchar("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Conversation Members table
export const conversationMembers = pgTable("conversation_members", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  isAdmin: boolean("is_admin").notNull().default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => ({
  convIdx: index("idx_conversation_members_conv").on(table.conversationId),
  userIdx: index("idx_conversation_members_user").on(table.userId),
  // Prevent duplicate memberships - one membership per user per conversation
  uniqueMember: uniqueIndex("idx_conversation_members_unique").on(table.conversationId, table.userId),
}));

export const insertConversationMemberSchema = createInsertSchema(conversationMembers).omit({
  id: true,
  joinedAt: true,
});
export type InsertConversationMember = z.infer<typeof insertConversationMemberSchema>;
export type ConversationMember = typeof conversationMembers.$inferSelect;

// Messages table (WhatsApp-style real-time chat)
export const messages = pgTable("messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiverId: varchar("receiver_id").references(() => users.id, { onDelete: "cascade" }),  // for 1:1 chats
  messageType: messageTypeEnum("message_type").notNull().default("text"),
  content: text("content").notNull(),
  mediaUrl: varchar("media_url"),  // for images/videos/files
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  isRead: true,
  createdAt: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Video Likes table (TikTok + YouTube style)
export const videoLikes = pgTable("video_likes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  videoId: varchar("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  videoIdx: index("idx_video_likes_video").on(table.videoId),
  userIdx: index("idx_video_likes_user").on(table.userId),
  // Prevent duplicate likes - one like per user per video
  uniqueLike: uniqueIndex("idx_video_likes_unique").on(table.videoId, table.userId),
}));

export const insertVideoLikeSchema = createInsertSchema(videoLikes).omit({
  id: true,
  createdAt: true,
});
export type InsertVideoLike = z.infer<typeof insertVideoLikeSchema>;
export type VideoLike = typeof videoLikes.$inferSelect;

// Video Comments table (TikTok + YouTube style)
export const videoComments = pgTable("video_comments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  videoId: varchar("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  parentCommentId: varchar("parent_comment_id"),  // self-reference added later
  likeCount: integer("like_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVideoCommentSchema = createInsertSchema(videoComments).omit({
  id: true,
  likeCount: true,
  createdAt: true,
});
export type InsertVideoComment = z.infer<typeof insertVideoCommentSchema>;
export type VideoComment = typeof videoComments.$inferSelect;

// Video Views table (for analytics)
// Note: userId is required (no anonymous views tracked) to enforce view deduplication
export const videoViews = pgTable("video_views", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  videoId: varchar("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()  // Required for uniqueness enforcement
    .references(() => users.id, { onDelete: "cascade" }),
  watchDuration: integer("watch_duration").notNull().default(0),  // in seconds
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  videoIdx: index("idx_video_views_video").on(table.videoId),
  userIdx: index("idx_video_views_user").on(table.userId),
  // Prevent view inflation - one view record per user per video
  uniqueView: uniqueIndex("idx_video_views_unique").on(table.videoId, table.userId),
}));

export const insertVideoViewSchema = createInsertSchema(videoViews).omit({
  id: true,
  createdAt: true,
});
export type InsertVideoView = z.infer<typeof insertVideoViewSchema>;
export type VideoView = typeof videoViews.$inferSelect;

// User Storage Usage table (track free vs premium limits)
export const userStorage = pgTable("user_storage", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  usedBytes: integer("used_bytes").notNull().default(0),
  videoCount: integer("video_count").notNull().default(0),
  messageMediaCount: integer("message_media_count").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserStorageSchema = createInsertSchema(userStorage).omit({
  id: true,
  updatedAt: true,
});
export type InsertUserStorage = z.infer<typeof insertUserStorageSchema>;
export type UserStorage = typeof userStorage.$inferSelect;

// Content flags/reports table
export const contentFlags = pgTable("content_flags", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  videoId: varchar("video_id").references(() => videos.id, {
    onDelete: "cascade",
  }),
  reason: text("reason").notNull(),
  status: moderationStatusEnum("status").notNull().default("pending"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContentFlagSchema = createInsertSchema(contentFlags).omit({
  id: true,
  status: true,
  createdAt: true,
});
export type InsertContentFlag = z.infer<typeof insertContentFlagSchema>;
export type ContentFlag = typeof contentFlags.$inferSelect;

// User strikes/bans table
export const userStrikes = pgTable("user_strikes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  strikeReason: text("strike_reason"), // Detailed AI-generated reason
  issuedBy: varchar("issued_by")
    .notNull()
    .references(() => users.id),
  autoModerated: boolean("auto_moderated").notNull().default(false), // AI auto-moderation flag
  contentType: varchar("content_type"), // "video", "comment", "message"
  contentId: varchar("content_id"), // Reference to the flagged content
  severity: varchar("severity"), // "low", "medium", "high"
  categories: text("categories").array(), // OpenAI moderation categories
  appealStatus: appealStatusEnum("appeal_status"), // Appeal status
  appealReason: text("appeal_reason"), // User's appeal explanation
  appealReviewedBy: varchar("appeal_reviewed_by").references(() => users.id),
  appealReviewedAt: timestamp("appeal_reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserStrikeSchema = createInsertSchema(userStrikes).omit({
  id: true,
  createdAt: true,
});
export type InsertUserStrike = z.infer<typeof insertUserStrikeSchema>;
export type UserStrike = typeof userStrikes.$inferSelect;

// Transactions/Wallet table
export const transactions = pgTable("transactions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  referenceId: varchar("reference_id"),
  paymentProvider: paymentProviderEnum("payment_provider"),
  providerTransactionId: varchar("provider_transaction_id"),
  providerMetadata: jsonb("provider_metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Peer-to-peer transfers table
export const userTransfers = pgTable("user_transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipientId: varchar("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // Amount sent (before fee)
  currency: varchar("currency").notNull(), // "credits" or "coins"
  fee: integer("fee").notNull(), // Platform fee deducted
  netAmount: integer("net_amount").notNull(), // Amount received after fee
  status: varchar("status").notNull().default("completed"), // completed, failed, pending
  message: text("message"), // Optional message with transfer
  senderTransactionId: varchar("sender_transaction_id").references(() => transactions.id),
  recipientTransactionId: varchar("recipient_transaction_id").references(() => transactions.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserTransferSchema = createInsertSchema(userTransfers).omit({
  id: true,
  createdAt: true,
});
export type InsertUserTransfer = z.infer<typeof insertUserTransferSchema>;
export type UserTransfer = typeof userTransfers.$inferSelect;

// Withdrawal Requests table
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  fee: decimal("fee", { precision: 10, scale: 2 }).notNull().default("0.00"),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  paymentProvider: paymentProviderEnum("payment_provider").notNull(),
  momoPhoneNumber: varchar("momo_phone_number"),
  status: withdrawalStatusEnum("status").notNull().default("pending"),
  providerTransactionId: varchar("provider_transaction_id"),
  providerResponse: jsonb("provider_response"),
  failureReason: text("failure_reason"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;

// ============================================
// LOVE CONNECTION - Premium Dating Feature
// Revenue Model: Both-sided payment unlock
// Better than Tinder/Bumble/Hinge combined!
// ============================================

export const loveGenderEnum = pgEnum("love_gender", [
  "male",
  "female",
  "non-binary",
  "other",
]);

export const lovePreferenceEnum = pgEnum("love_preference", [
  "men",
  "women",
  "everyone",
]);

export const loveSwipeActionEnum = pgEnum("love_swipe_action", [
  "pass",  // Swipe left
  "like",  // Swipe right
  "heart", // Super like
]);

export const loveMatchStatusEnum = pgEnum("love_match_status", [
  "pending",   // Matched but both need to unlock
  "unlocked",  // Both paid, chat is open
  "expired",   // Unlock period expired
]);

// Love Connection Profiles - Dating profile info
export const loveProfiles = pgTable("love_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Profile Info
  displayName: varchar("display_name").notNull(),
  age: integer("age").notNull(),
  gender: loveGenderEnum("gender").notNull(),
  lookingFor: lovePreferenceEnum("looking_for").notNull(),
  bio: text("bio"),
  photos: text("photos").array().notNull().default(sql`ARRAY[]::text[]`), // Up to 6 photos
  
  // Preferences
  ageMin: integer("age_min").notNull().default(18),
  ageMax: integer("age_max").notNull().default(99),
  maxDistance: integer("max_distance").notNull().default(50), // km
  
  // Location (for distance-based matching)
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  city: varchar("city"),
  country: varchar("country"),
  
  // Stats & Gamification
  totalSwipes: integer("total_swipes").notNull().default(0),
  totalMatches: integer("total_matches").notNull().default(0),
  profileViews: integer("profile_views").notNull().default(0),
  
  // Premium Features
  isPremium: boolean("is_premium").notNull().default(false),
  premiumUntil: timestamp("premium_until"),
  
  // Daily Limits
  dailySwipesRemaining: integer("daily_swipes_remaining").notNull().default(5),
  dailyHeartsRemaining: integer("daily_hearts_remaining").notNull().default(1),
  lastSwipeReset: timestamp("last_swipe_reset").defaultNow(),
  
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLoveProfileSchema = createInsertSchema(loveProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertLoveProfile = z.infer<typeof insertLoveProfileSchema>;
export type LoveProfile = typeof loveProfiles.$inferSelect;

// Love Swipes - Track all swipe actions
export const loveSwipes = pgTable("love_swipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  swiperId: varchar("swiper_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  swipedId: varchar("swiped_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: loveSwipeActionEnum("action").notNull(),
  
  // Revenue tracking
  coinsSpent: integer("coins_spent").notNull().default(0), // 10 coins for regular swipe, 50 for heart
  creditsSpent: integer("credits_spent").notNull().default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLoveSwipeSchema = createInsertSchema(loveSwipes).omit({
  id: true,
  createdAt: true,
});
export type InsertLoveSwipe = z.infer<typeof insertLoveSwipeSchema>;
export type LoveSwipe = typeof loveSwipes.$inferSelect;

// Love Matches - When both people like each other
export const loveMatches = pgTable("love_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  user2Id: varchar("user2_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  status: loveMatchStatusEnum("status").notNull().default("pending"),
  
  // Both-sided unlock system (REVOLUTIONARY REVENUE MODEL!)
  user1Unlocked: boolean("user1_unlocked").notNull().default(false),
  user2Unlocked: boolean("user2_unlocked").notNull().default(false),
  user1UnlockedAt: timestamp("user1_unlocked_at"),
  user2UnlockedAt: timestamp("user2_unlocked_at"),
  
  // Revenue from unlock payments
  user1CoinsSpent: integer("user1_coins_spent").default(0),
  user1CreditsSpent: integer("user1_credits_spent").default(0),
  user2CoinsSpent: integer("user2_coins_spent").default(0),
  user2CreditsSpent: integer("user2_credits_spent").default(0),
  
  // Expiration (24 hours to unlock or match expires)
  expiresAt: timestamp("expires_at"),
  
  // First message bonus
  firstMessageSent: boolean("first_message_sent").notNull().default(false),
  
  matchedAt: timestamp("matched_at").defaultNow(),
  unlockedAt: timestamp("unlocked_at"), // When both users unlocked
});

export const insertLoveMatchSchema = createInsertSchema(loveMatches).omit({
  id: true,
  matchedAt: true,
});
export type InsertLoveMatch = z.infer<typeof insertLoveMatchSchema>;
export type LoveMatch = typeof loveMatches.$inferSelect;

// Love Boosts - Visibility boosts
export const loveBoosts = pgTable("love_boosts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Boost details
  duration: integer("duration").notNull(), // minutes
  coinsSpent: integer("coins_spent").notNull(), // 200 coins for 30 min boost
  
  // Stats
  profileViews: integer("profile_views").notNull().default(0),
  likesReceived: integer("likes_received").notNull().default(0),
  
  active: boolean("active").notNull().default(true),
  startedAt: timestamp("started_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertLoveBoostSchema = createInsertSchema(loveBoosts).omit({
  id: true,
  startedAt: true,
});
export type InsertLoveBoost = z.infer<typeof insertLoveBoostSchema>;
export type LoveBoost = typeof loveBoosts.$inferSelect;

// Love Messages - Chat between matched users
export const loveMessages = pgTable("love_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id")
    .notNull()
    .references(() => loveMatches.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  content: text("content").notNull(),
  type: messageTypeEnum("type").notNull().default("text"),
  mediaUrl: varchar("media_url"),
  
  // AI-powered features
  aiGenerated: boolean("ai_generated").notNull().default(false), // AI conversation starter
  creditsUsed: integer("credits_used").default(0),
  
  read: boolean("read").notNull().default(false),
  readAt: timestamp("read_at"),
  
  sentAt: timestamp("sent_at").defaultNow(),
});

export const insertLoveMessageSchema = createInsertSchema(loveMessages).omit({
  id: true,
  sentAt: true,
});
export type InsertLoveMessage = z.infer<typeof insertLoveMessageSchema>;
export type LoveMessage = typeof loveMessages.$inferSelect;

// Love AI Features - Track AI usage for credits
export const loveAIFeatures = pgTable("love_ai_features", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  featureType: varchar("feature_type").notNull(), // profile_optimizer, conversation_starter, compatibility_score, date_ideas, video_profile
  creditsUsed: integer("credits_used").notNull(),
  
  // Result data
  resultData: jsonb("result_data"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLoveAIFeatureSchema = createInsertSchema(loveAIFeatures).omit({
  id: true,
  createdAt: true,
});
export type InsertLoveAIFeature = z.infer<typeof insertLoveAIFeatureSchema>;
export type LoveAIFeature = typeof loveAIFeatures.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  videos: many(videos),
  sentGifts: many(virtualGifts, { relationName: "sentGifts" }),
  receivedGifts: many(virtualGifts, { relationName: "receivedGifts" }),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  transactions: many(transactions),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  virtualGifts: many(virtualGifts),
}));

export const virtualGiftsRelations = relations(virtualGifts, ({ one }) => ({
  sender: one(users, {
    fields: [virtualGifts.senderId],
    references: [users.id],
    relationName: "sentGifts",
  }),
  receiver: one(users, {
    fields: [virtualGifts.receiverId],
    references: [users.id],
    relationName: "receivedGifts",
  }),
  video: one(videos, {
    fields: [virtualGifts.videoId],
    references: [videos.id],
  }),
  sparkCatalogItem: one(sparkCatalog, {
    fields: [virtualGifts.sparkId],
    references: [sparkCatalog.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// ==================== PLUGIN SYSTEM ====================

// Plugins table - Creator-built plugins and integrations
export const plugins = pgTable("plugins", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  authorId: varchar("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  version: varchar("version").notNull().default("1.0.0"),
  type: pluginTypeEnum("type").notNull(),
  manifest: jsonb("manifest").notNull(),
  status: pluginStatusEnum("status").notNull().default("draft"),
  downloads: integer("downloads").notNull().default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  price: integer("price").default(0),
  pricingModel: varchar("pricing_model").default("free"),
  iconUrl: varchar("icon_url"),
  screenshotUrls: jsonb("screenshot_urls").default([]),
  tags: jsonb("tags").default([]),
  permissions: jsonb("permissions").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPluginSchema = createInsertSchema(plugins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  downloads: true,
  rating: true,
  reviewCount: true,
});
export type InsertPlugin = z.infer<typeof insertPluginSchema>;
export type Plugin = typeof plugins.$inferSelect;

// Plugin installs - Track which users have installed which plugins
export const pluginInstalls = pgTable("plugin_installs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  pluginId: varchar("plugin_id")
    .notNull()
    .references(() => plugins.id, { onDelete: "cascade" }),
  version: varchar("version").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  settings: jsonb("settings").default({}),
  installedAt: timestamp("installed_at").defaultNow(),
});

export const insertPluginInstallSchema = createInsertSchema(pluginInstalls).omit({
  id: true,
  installedAt: true,
});
export type InsertPluginInstall = z.infer<typeof insertPluginInstallSchema>;
export type PluginInstall = typeof pluginInstalls.$inferSelect;

// Plugin reviews - User ratings and feedback
export const pluginReviews = pgTable("plugin_reviews", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  pluginId: varchar("plugin_id")
    .notNull()
    .references(() => plugins.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPluginReviewSchema = createInsertSchema(pluginReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPluginReview = z.infer<typeof insertPluginReviewSchema>;
export type PluginReview = typeof pluginReviews.$inferSelect;

// Plugin transactions - Track plugin purchases and revenue
export const pluginTransactions = pgTable("plugin_transactions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  pluginId: varchar("plugin_id")
    .notNull()
    .references(() => plugins.id, { onDelete: "cascade" }),
  authorId: varchar("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  authorShare: integer("author_share").notNull(),
  platformFee: integer("platform_fee").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPluginTransactionSchema = createInsertSchema(pluginTransactions).omit({
  id: true,
  createdAt: true,
});
export type InsertPluginTransaction = z.infer<typeof insertPluginTransactionSchema>;
export type PluginTransaction = typeof pluginTransactions.$inferSelect;

// Plugin relations
export const pluginsRelations = relations(plugins, ({ one, many }) => ({
  author: one(users, {
    fields: [plugins.authorId],
    references: [users.id],
  }),
  installs: many(pluginInstalls),
  reviews: many(pluginReviews),
  transactions: many(pluginTransactions),
}));

export const pluginInstallsRelations = relations(pluginInstalls, ({ one }) => ({
  user: one(users, {
    fields: [pluginInstalls.userId],
    references: [users.id],
  }),
  plugin: one(plugins, {
    fields: [pluginInstalls.pluginId],
    references: [plugins.id],
  }),
}));

export const pluginReviewsRelations = relations(pluginReviews, ({ one }) => ({
  user: one(users, {
    fields: [pluginReviews.userId],
    references: [users.id],
  }),
  plugin: one(plugins, {
    fields: [pluginReviews.pluginId],
    references: [plugins.id],
  }),
}));

export const pluginTransactionsRelations = relations(pluginTransactions, ({ one }) => ({
  user: one(users, {
    fields: [pluginTransactions.userId],
    references: [users.id],
  }),
  plugin: one(plugins, {
    fields: [pluginTransactions.pluginId],
    references: [plugins.id],
  }),
  author: one(users, {
    fields: [pluginTransactions.authorId],
    references: [users.id],
  }),
}));

// ==================== AI INFLUENCER SYSTEM ====================

// AI Influencers - Virtual personalities created by users
export const aiInfluencers = pgTable("ai_influencers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  bio: text("bio"),
  personality: text("personality").notNull(), // AI personality traits
  gender: influencerGenderEnum("gender").notNull(),
  contentType: influencerContentTypeEnum("content_type").notNull(),
  
  // Appearance settings
  avatarUrl: varchar("avatar_url"),
  appearancePrompt: text("appearance_prompt"), // Sora 2 character appearance
  voiceId: varchar("voice_id"), // ElevenLabs voice ID or similar
  voiceSettings: jsonb("voice_settings").default({}),
  
  // Monetization
  subscriptionPrice: integer("subscription_price").default(0), // Monthly price in credits
  isPublic: boolean("is_public").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  
  // Stats
  subscriberCount: integer("subscriber_count").notNull().default(0),
  videoCount: integer("video_count").notNull().default(0),
  totalEarnings: integer("total_earnings").notNull().default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAIInfluencerSchema = createInsertSchema(aiInfluencers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  subscriberCount: true,
  videoCount: true,
  totalEarnings: true,
});
export type InsertAIInfluencer = z.infer<typeof insertAIInfluencerSchema>;
export type AIInfluencer = typeof aiInfluencers.$inferSelect;

// AI Influencer Videos - Generated content by AI influencers
export const aiInfluencerVideos = pgTable("ai_influencer_videos", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  influencerId: varchar("influencer_id")
    .notNull()
    .references(() => aiInfluencers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(), // User's video generation prompt
  videoUrl: varchar("video_url"), // Generated by Sora 2
  thumbnailUrl: varchar("thumbnail_url"),
  duration: integer("duration"), // In seconds
  
  // Generation metadata
  soraJobId: varchar("sora_job_id"), // Track Sora 2 generation job
  generationCost: integer("generation_cost"), // Credits spent
  generationStatus: varchar("generation_status").default("pending"), // pending, processing, completed, failed
  
  // Engagement
  viewCount: integer("view_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  sparkCount: integer("spark_count").notNull().default(0),
  
  // Access control
  isExclusive: boolean("is_exclusive").notNull().default(false), // Subscribers only
  
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertAIInfluencerVideoSchema = createInsertSchema(aiInfluencerVideos).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  viewCount: true,
  likeCount: true,
  sparkCount: true,
});
export type InsertAIInfluencerVideo = z.infer<typeof insertAIInfluencerVideoSchema>;
export type AIInfluencerVideo = typeof aiInfluencerVideos.$inferSelect;

// AI Influencer Subscriptions - Users subscribing to AI influencers
export const aiInfluencerSubscriptions = pgTable("ai_influencer_subscriptions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  influencerId: varchar("influencer_id")
    .notNull()
    .references(() => aiInfluencers.id, { onDelete: "cascade" }),
  status: varchar("status").notNull().default("active"), // active, cancelled, expired
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  autoRenew: boolean("auto_renew").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAIInfluencerSubscriptionSchema = createInsertSchema(aiInfluencerSubscriptions).omit({
  id: true,
  createdAt: true,
});
export type InsertAIInfluencerSubscription = z.infer<typeof insertAIInfluencerSubscriptionSchema>;
export type AIInfluencerSubscription = typeof aiInfluencerSubscriptions.$inferSelect;

// AI Influencer relations
export const aiInfluencersRelations = relations(aiInfluencers, ({ one, many }) => ({
  creator: one(users, {
    fields: [aiInfluencers.creatorId],
    references: [users.id],
  }),
  videos: many(aiInfluencerVideos),
  subscriptions: many(aiInfluencerSubscriptions),
}));

export const aiInfluencerVideosRelations = relations(aiInfluencerVideos, ({ one }) => ({
  influencer: one(aiInfluencers, {
    fields: [aiInfluencerVideos.influencerId],
    references: [aiInfluencers.id],
  }),
}));

export const aiInfluencerSubscriptionsRelations = relations(aiInfluencerSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [aiInfluencerSubscriptions.userId],
    references: [users.id],
  }),
  influencer: one(aiInfluencers, {
    fields: [aiInfluencerSubscriptions.influencerId],
    references: [aiInfluencers.id],
  }),
}));

// Invite Codes Table
// Invite Codes - 12 character system with PDF-style structure
export const inviteCodes = pgTable("invite_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 12 }).notNull().unique(),  // Keep at 12 characters
  creatorId: varchar("creator_id").references(() => users.id, { onDelete: "cascade" }),
  usedBy: varchar("used_by").references(() => users.id, { onDelete: "set null" }),
  status: varchar("status", { length: 50 }).notNull().default("available"), // 'available', 'used', 'revoked'
  isUsed: boolean("is_used").notNull().default(false),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at"),  // Optional expiration
  maxUses: integer("max_uses").notNull().default(1),
  currentUses: integer("current_uses").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInviteCodeSchema = createInsertSchema(inviteCodes).omit({
  id: true,
  createdAt: true,
});
export type InsertInviteCode = z.infer<typeof insertInviteCodeSchema>;
export type InviteCode = typeof inviteCodes.$inferSelect;

// User Invites Tracking Table
export const userInvites = pgTable("user_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inviterId: varchar("inviter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  inviteeId: varchar("invitee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  inviteCodeId: varchar("invite_code_id").notNull().references(() => inviteCodes.id, { onDelete: "cascade" }),
  bonusCreditsAwarded: integer("bonus_credits_awarded").notNull().default(100),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserInviteSchema = createInsertSchema(userInvites).omit({
  id: true,
  createdAt: true,
});
export type InsertUserInvite = z.infer<typeof insertUserInviteSchema>;
export type UserInvite = typeof userInvites.$inferSelect;

// Affiliate Program Tables
// Affiliate Codes - Each user gets a unique affiliate code
export const affiliateCodes = pgTable("affiliate_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 12 }).notNull().unique(), // e.g., "JOHN2024HACK"
  totalReferrals: integer("total_referrals").notNull().default(0),
  totalEarnings: integer("total_earnings").notNull().default(0), // In credits (1 credit = $0.02)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAffiliateCodeSchema = createInsertSchema(affiliateCodes).omit({
  id: true,
  totalReferrals: true,
  totalEarnings: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAffiliateCode = z.infer<typeof insertAffiliateCodeSchema>;
export type AffiliateCode = typeof affiliateCodes.$inferSelect;

// Affiliate Referrals - Track when someone subscribes via affiliate link
export const affiliateReferrals = pgTable("affiliate_referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateCodeId: varchar("affiliate_code_id").notNull().references(() => affiliateCodes.id, { onDelete: "cascade" }),
  affiliateUserId: varchar("affiliate_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscriptionTier: subscriptionTierEnum("subscription_tier").notNull(), // Which tier they subscribed to
  commission: integer("commission").notNull().default(250), // $5 = 250 credits (1 credit = $0.02)
  isPaid: boolean("is_paid").notNull().default(false),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAffiliateReferralSchema = createInsertSchema(affiliateReferrals).omit({
  id: true,
  isPaid: true,
  paidAt: true,
  createdAt: true,
});
export type InsertAffiliateReferral = z.infer<typeof insertAffiliateReferralSchema>;
export type AffiliateReferral = typeof affiliateReferrals.$inferSelect;

// Invite relations
export const inviteCodesRelations = relations(inviteCodes, ({ one }) => ({
  creator: one(users, {
    fields: [inviteCodes.creatorId],
    references: [users.id],
    relationName: "createdCodes"
  }),
  usedByUser: one(users, {
    fields: [inviteCodes.usedBy],
    references: [users.id],
    relationName: "usedCodes"
  }),
}));

export const userInvitesRelations = relations(userInvites, ({ one }) => ({
  inviter: one(users, {
    fields: [userInvites.inviterId],
    references: [users.id],
    relationName: "sentInvites"
  }),
  invitee: one(users, {
    fields: [userInvites.inviteeId],
    references: [users.id],
    relationName: "receivedInvites"
  }),
  inviteCode: one(inviteCodes, {
    fields: [userInvites.inviteCodeId],
    references: [inviteCodes.id],
  }),
}));

// WebRTC Call Sessions
export const callSessions = pgTable("call_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  callType: callTypeEnum("call_type").notNull(),
  status: callStatusEnum("status").notNull().default("ringing"),
  initiatorId: varchar("initiator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  conversationId: varchar("conversation_id").references(() => conversations.id, { onDelete: "set null" }),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  duration: integer("duration").default(0), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCallSessionSchema = createInsertSchema(callSessions).omit({
  id: true,
  createdAt: true,
});
export type InsertCallSession = z.infer<typeof insertCallSessionSchema>;
export type CallSession = typeof callSessions.$inferSelect;

// Call Participants
export const callParticipants = pgTable("call_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  callId: varchar("call_id").notNull().references(() => callSessions.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at"),
  leftAt: timestamp("left_at"),
  wasAnswered: boolean("was_answered").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  callIdx: index("idx_call_participants_call").on(table.callId),
  userIdx: index("idx_call_participants_user").on(table.userId),
  // Prevent duplicate participant entries per call
  uniqueParticipant: uniqueIndex("idx_call_participants_unique").on(table.callId, table.userId),
}));

export const insertCallParticipantSchema = createInsertSchema(callParticipants).omit({
  id: true,
  createdAt: true,
});
export type InsertCallParticipant = z.infer<typeof insertCallParticipantSchema>;
export type CallParticipant = typeof callParticipants.$inferSelect;

// Call Relations
export const callSessionsRelations = relations(callSessions, ({ one, many }) => ({
  initiator: one(users, {
    fields: [callSessions.initiatorId],
    references: [users.id],
  }),
  conversation: one(conversations, {
    fields: [callSessions.conversationId],
    references: [conversations.id],
  }),
  participants: many(callParticipants),
}));

export const callParticipantsRelations = relations(callParticipants, ({ one }) => ({
  call: one(callSessions, {
    fields: [callParticipants.callId],
    references: [callSessions.id],
  }),
  user: one(users, {
    fields: [callParticipants.userId],
    references: [users.id],
  }),
}));

// Legal Agreements & 18+ Age Verification (Bermuda Jurisdiction)
export const userLegalAgreements = pgTable("user_legal_agreements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // User Info at Signup
  email: varchar("email").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  ageAtSignup: integer("age_at_signup").notNull(),
  
  // Agreement Versions
  tosVersion: varchar("tos_version").notNull().default("v1.0-BMU"),
  privacyPolicyVersion: varchar("privacy_policy_version").notNull().default("v1.0-BMU"),
  holdHarmlessVersion: varchar("hold_harmless_version").notNull().default("v1.0-BMU"),
  
  // Acceptance Proof
  timestampUtc: timestamp("timestamp_utc").notNull().defaultNow(),
  ipAddress: varchar("ip_address").notNull(),
  userAgent: text("user_agent").notNull(),
  geographicLocation: jsonb("geographic_location"), // {country, region, city}
  
  // Checkbox States (for audit trail)
  checkboxAgeConfirmed: boolean("checkbox_age_confirmed").notNull().default(true),
  checkboxTos: boolean("checkbox_tos").notNull().default(true),
  checkboxPrivacy: boolean("checkbox_privacy").notNull().default(true),
  checkboxHoldHarmless: boolean("checkbox_hold_harmless").notNull().default(true),
  checkboxLiabilityWaiver: boolean("checkbox_liability_waiver").notNull().default(true),
  checkboxBermudaJurisdiction: boolean("checkbox_bermuda_jurisdiction").notNull().default(true),
  checkboxElectronicSignature: boolean("checkbox_electronic_signature").notNull().default(true),
  
  // Legal Protection
  electronicSignatureHash: varchar("electronic_signature_hash", { length: 64 }).notNull(), // SHA-256
  bermudaJurisdictionAccepted: boolean("bermuda_jurisdiction_accepted").notNull().default(true),
  
  // Metadata
  signupCompleted: boolean("signup_completed").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("idx_legal_agreements_user").on(table.userId),
  timestampIdx: index("idx_legal_agreements_timestamp").on(table.timestampUtc),
}));

export const insertUserLegalAgreementSchema = createInsertSchema(userLegalAgreements).omit({
  id: true,
  createdAt: true,
});
export type InsertUserLegalAgreement = z.infer<typeof insertUserLegalAgreementSchema>;
export type UserLegalAgreement = typeof userLegalAgreements.$inferSelect;

// Twilio Video Room Types
export const twilioRoomTypeEnum = pgEnum("twilio_room_type", [
  "live_stream",    // TikTok-style live stream (1 host + up to 20 guests on camera, unlimited viewers)
  "battle",         // Flexible battles (1-20 solo OR any team combo: 2v2, 3v3v3, 7v7, 10v10, etc - unlimited viewers)
  "panel",          // Group discussion (up to 20 on camera, unlimited viewers)
  "premium_1on1",   // Credit-based private call (1 creator + 1 viewer)
  "premium_panel",  // OnlyFans-style live show (up to 20 on camera, unlimited viewers, 18+, credits/min)
]);

export const twilioRoomStatusEnum = pgEnum("twilio_room_status", [
  "active",
  "ended",
  "paused",
]);

// Twilio Video Rooms (Lives, Battles, Panels, Premium 1-on-1)
export const twilioVideoRooms = pgTable("twilio_video_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  twilioRoomSid: varchar("twilio_room_sid").notNull().unique(), // Twilio's unique room identifier
  
  // Room Info
  roomType: twilioRoomTypeEnum("room_type").notNull(),
  status: twilioRoomStatusEnum("status").notNull().default("active"),
  title: varchar("title", { length: 200 }),
  description: text("description"),
  
  // Host(s)
  hostId: varchar("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  coHostId: varchar("co_host_id").references(() => users.id, { onDelete: "set null" }), // For simple 1v1 battles
  
  // Battle/Team Settings (FLEXIBLE - User can create ANY combo up to 20 people)
  // Examples: 3-way solo, 5-way solo, 2v2v2, 3v3v3, 7v7, 10v10, 1v1v1v1, etc
  teamCount: integer("team_count").default(0), // 0=all solo, 2+=number of teams
  teamSize: integer("team_size").default(1), // Hint for equal teams, but participants can have different team sizes
  
  // Settings
  maxParticipants: integer("max_participants").notNull().default(20),
  viewerCount: integer("viewer_count").notNull().default(0),
  isAdultContent: boolean("is_adult_content").notNull().default(false), // 18+ only (OnlyFans-style)
  
  // Premium Pricing (credit-based for premium_1on1 and premium_panel)
  creditsPerMinute: integer("credits_per_minute"), // Per-minute credits for viewers
  minimumCredits: integer("minimum_credits").default(0), // Minimum credits to join
  
  // Timing
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  duration: integer("duration"), // In seconds
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  hostIdx: index("idx_twilio_rooms_host").on(table.hostId),
  statusIdx: index("idx_twilio_rooms_status").on(table.status),
  typeIdx: index("idx_twilio_rooms_type").on(table.roomType),
  twilioSidIdx: uniqueIndex("idx_twilio_rooms_sid").on(table.twilioRoomSid),
}));

export const insertTwilioVideoRoomSchema = createInsertSchema(twilioVideoRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTwilioVideoRoom = z.infer<typeof insertTwilioVideoRoomSchema>;
export type TwilioVideoRoom = typeof twilioVideoRooms.$inferSelect;

// Twilio Room Participants (who's in the room)
export const twilioRoomParticipants = pgTable("twilio_room_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => twilioVideoRooms.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  twilioParticipantSid: varchar("twilio_participant_sid").notNull(),
  
  // Role
  role: varchar("role", { length: 50 }).notNull().default("viewer"), // host, co_host, participant, viewer
  teamNumber: integer("team_number"), // For team battles: 1, 2, 3, etc (null for solo battles or non-participants)
  
  // Premium Credits
  creditsSpent: integer("credits_spent").notNull().default(0), // Total credits deducted
  
  // Timing
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  leftAt: timestamp("left_at"),
  totalDuration: integer("total_duration"), // In seconds
}, (table) => ({
  roomIdx: index("idx_twilio_participants_room").on(table.roomId),
  userIdx: index("idx_twilio_participants_user").on(table.userId),
  uniqueParticipant: uniqueIndex("idx_twilio_participants_unique").on(table.roomId, table.userId),
}));

export const insertTwilioRoomParticipantSchema = createInsertSchema(twilioRoomParticipants).omit({
  id: true,
  joinedAt: true,
});
export type InsertTwilioRoomParticipant = z.infer<typeof insertTwilioRoomParticipantSchema>;
export type TwilioRoomParticipant = typeof twilioRoomParticipants.$inferSelect;

// Battle Challenge Status
export const battleChallengeStatusEnum = pgEnum("battle_challenge_status", [
  "pending",
  "accepted",
  "declined",
  "expired",
  "cancelled",
]);

// Battle Challenges - Send direct battle invites to specific users
export const battleChallenges = pgTable("battle_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Challenger and challenged users
  challengerId: varchar("challenger_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengedId: varchar("challenged_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Challenge Details
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message"), // Optional message from challenger
  battleType: varchar("battle_type", { length: 50 }).notNull().default("solo"), // "solo" or "teams"
  teamCount: integer("team_count").default(2),
  teamSize: integer("team_size").default(1),
  
  // Challenge Status
  status: battleChallengeStatusEnum("status").notNull().default("pending"),
  
  // Created Battle (once accepted)
  roomId: varchar("room_id").references(() => twilioVideoRooms.id, { onDelete: "set null" }),
  
  // Timing
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  expiresAt: timestamp("expires_at").notNull(), // Auto-expires after 24 hours
}, (table) => ({
  challengerIdx: index("idx_battle_challenges_challenger").on(table.challengerId),
  challengedIdx: index("idx_battle_challenges_challenged").on(table.challengedId),
  statusIdx: index("idx_battle_challenges_status").on(table.status),
}));

export const insertBattleChallengeSchema = createInsertSchema(battleChallenges).omit({
  id: true,
  createdAt: true,
});
export type InsertBattleChallenge = z.infer<typeof insertBattleChallengeSchema>;
export type BattleChallenge = typeof battleChallenges.$inferSelect;

// ========================================
// TIKTOK LIVE BATTLE SYSTEM
// ========================================

// League Tiers (D → C → B → A → A1)
export const leagueTierEnum = pgEnum("league_tier", [
  "D3", "D2", "D1",  // D League
  "C3", "C2", "C1",  // C League
  "B3", "B2", "B1",  // B League
  "A3", "A2", "A1",  // A League (A1 is top tier)
]);

// Creator Leagues - Track user's position in competitive leagues
export const creatorLeagues = pgTable("creator_leagues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Current League Status
  currentTier: leagueTierEnum("current_tier").notNull().default("D3"),
  fragments: integer("fragments").notNull().default(0), // Currency to advance
  fragmentsNeeded: integer("fragments_needed").notNull().default(100), // To next tier
  
  // Daily Performance
  dailyRankPercent: integer("daily_rank_percent"), // 0-100, where 0-10% earns fragments
  totalDiamonds: integer("total_diamonds").notNull().default(0),
  weeklyDiamonds: integer("weekly_diamonds").notNull().default(0),
  
  // Streaks
  streakDays: integer("streak_days").notNull().default(0),
  lastStreamedAt: timestamp("last_streamed_at"),
  
  // Protection
  hasShield: boolean("has_shield").default(false), // Prevents fragment loss
  shieldExpiresAt: timestamp("shield_expires_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("idx_creator_leagues_user").on(table.userId),
  tierIdx: index("idx_creator_leagues_tier").on(table.currentTier),
}));

// Daily Rankings - Track daily performance
export const dailyRankings = pgTable("daily_rankings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Ranking Data
  rankDate: timestamp("rank_date").notNull().defaultNow(),
  diamondsEarned: integer("diamonds_earned").notNull().default(0),
  giftsReceived: integer("gifts_received").notNull().default(0),
  battlesWon: integer("battles_won").notNull().default(0),
  battlesLost: integer("battles_lost").notNull().default(0),
  
  // Position
  dailyRank: integer("daily_rank"), // 1-999+
  percentile: integer("percentile"), // 0-100
  fragmentsEarned: integer("fragments_earned").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userDateIdx: index("idx_daily_rankings_user_date").on(table.userId, table.rankDate),
  dateIdx: index("idx_daily_rankings_date").on(table.rankDate),
}));

// Gift Gallery - Visual trophy case of received gifts
export const giftGallery = pgTable("gift_gallery", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Gift Info
  giftType: sparkTypeEnum("gift_type").notNull(),
  quantity: integer("quantity").notNull().default(0),
  totalValue: integer("total_value").notNull().default(0), // In credits/diamonds
  
  // Gallery Progress
  isLitUp: boolean("is_lit_up").default(false), // Gift slot filled
  firstReceivedFrom: varchar("first_received_from").references(() => users.id),
  topGifterId: varchar("top_gifter_id").references(() => users.id), // User who sent most of this gift
  topGifterAmount: integer("top_gifter_amount").default(0),
  
  // Swap Cards (NEW 2024 feature)
  swapCardsEarned: integer("swap_cards_earned").default(0),
  
  lastReceivedAt: timestamp("last_received_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userGiftIdx: uniqueIndex("idx_gift_gallery_user_gift").on(table.userId, table.giftType),
}));

// Battle Power-Ups (NEW 2024)
export const battlePowerUpEnum = pgEnum("battle_power_up", [
  "boosting_glove",  // Increases point value
  "magic_mist",      // Special advantage  
  "stun_hammer",     // Affects opponent
  "time_maker",      // Time manipulation
]);

export const battlePowerUps = pgTable("battle_power_ups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  battleId: varchar("battle_id").notNull().references(() => twilioVideoRooms.id, { onDelete: "cascade" }),
  
  // Power-Up Details
  powerUpType: battlePowerUpEnum("power_up_type").notNull(),
  sentByUserId: varchar("sent_by_user_id").notNull().references(() => users.id),
  targetTeamId: varchar("target_team_id"), // Which team/creator it affects
  
  // Effects
  pointMultiplier: decimal("point_multiplier", { precision: 4, scale: 2 }), // 1.5x, 2.0x, etc
  durationSeconds: integer("duration_seconds"), // How long it lasts
  isActive: boolean("is_active").default(true),
  
  activatedAt: timestamp("activated_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
}, (table) => ({
  battleIdx: index("idx_battle_power_ups_battle").on(table.battleId),
}));

// Battle Speed Multipliers - Track speed bonuses during battles
export const battleSpeedMultipliers = pgTable("battle_speed_multipliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  battleId: varchar("battle_id").notNull().references(() => twilioVideoRooms.id, { onDelete: "cascade" }),
  
  // Speed Data
  currentSpeed: integer("current_speed").notNull().default(0), // 0-99+
  multiplier: decimal("multiplier", { precision: 3, scale: 1 }).default("1.0"), // 1.0x, 2.0x, 3.0x
  isActive: boolean("is_active").default(true),
  
  // Tracking
  startedAt: timestamp("started_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  battleIdx: index("idx_battle_speed_battle").on(table.battleId),
}));

// Gifter Levels - Viewer progression system (Level 1-46+)
export const gifterLevels = pgTable("gifter_levels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Level Data
  currentLevel: integer("current_level").notNull().default(1), // 1-46+
  totalGiftsSent: integer("total_gifts_sent").notNull().default(0),
  totalCreditsSpent: integer("total_credits_spent").notNull().default(0),
  
  // Progress to next level
  currentXP: integer("current_xp").notNull().default(0),
  xpNeeded: integer("xp_needed").notNull().default(100),
  
  // Unlocks
  unlockedGifts: text("unlocked_gifts").array().default(sql`ARRAY[]::text[]`), // Gift types unlocked at this level
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("idx_gifter_levels_user").on(table.userId),
  levelIdx: index("idx_gifter_levels_level").on(table.currentLevel),
}));

// Top Gifters - Track top supporters for each creator
export const topGifters = pgTable("top_gifters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  gifterId: varchar("gifter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Gift Stats
  totalGiftsSent: integer("total_gifts_sent").notNull().default(0),
  totalValue: integer("total_value").notNull().default(0), // In credits
  rank: integer("rank"), // 1 = top gifter
  
  // Time Period
  periodType: varchar("period_type", { length: 20 }).notNull().default("all_time"), // "daily", "weekly", "monthly", "all_time"
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  
  lastGiftAt: timestamp("last_gift_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  creatorGifterIdx: uniqueIndex("idx_top_gifters_creator_gifter_period").on(table.creatorId, table.gifterId, table.periodType),
  creatorIdx: index("idx_top_gifters_creator").on(table.creatorId),
}));

// Auto Battle Settings - Allow anyone to challenge when live
export const autoBattleSettings = pgTable("auto_battle_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Settings
  isEnabled: boolean("is_enabled").default(false), // Auto-accept battle requests when live
  minGifterLevel: integer("min_gifter_level").default(1), // Minimum level to challenge
  requireFollowers: boolean("require_followers").default(false), // Only followers can challenge
  
  // Preferences
  preferredBattleType: varchar("preferred_battle_type", { length: 20 }).default("solo"), // "solo" or "teams"
  maxBattlesPerStream: integer("max_battles_per_stream").default(10),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("idx_auto_battle_settings_user").on(table.userId),
}));

// Schema exports for TikTok Live Battle System
export const insertCreatorLeagueSchema = createInsertSchema(creatorLeagues).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDailyRankingSchema = createInsertSchema(dailyRankings).omit({ id: true, createdAt: true });
export const insertGiftGallerySchema = createInsertSchema(giftGallery).omit({ id: true, createdAt: true });
export const insertBattlePowerUpSchema = createInsertSchema(battlePowerUps).omit({ id: true, activatedAt: true });
export const insertBattleSpeedMultiplierSchema = createInsertSchema(battleSpeedMultipliers).omit({ id: true, startedAt: true, updatedAt: true });
export const insertGifterLevelSchema = createInsertSchema(gifterLevels).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTopGifterSchema = createInsertSchema(topGifters).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAutoBattleSettingSchema = createInsertSchema(autoBattleSettings).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertCreatorLeague = z.infer<typeof insertCreatorLeagueSchema>;
export type CreatorLeague = typeof creatorLeagues.$inferSelect;
export type InsertDailyRanking = z.infer<typeof insertDailyRankingSchema>;
export type DailyRanking = typeof dailyRankings.$inferSelect;
export type InsertGiftGallery = z.infer<typeof insertGiftGallerySchema>;
export type GiftGallery = typeof giftGallery.$inferSelect;
export type InsertBattlePowerUp = z.infer<typeof insertBattlePowerUpSchema>;
export type BattlePowerUp = typeof battlePowerUps.$inferSelect;
export type InsertBattleSpeedMultiplier = z.infer<typeof insertBattleSpeedMultiplierSchema>;
export type BattleSpeedMultiplier = typeof battleSpeedMultipliers.$inferSelect;
export type InsertGifterLevel = z.infer<typeof insertGifterLevelSchema>;
export type GifterLevel = typeof gifterLevels.$inferSelect;
export type InsertTopGifter = z.infer<typeof insertTopGifterSchema>;
export type TopGifter = typeof topGifters.$inferSelect;
export type InsertAutoBattleSetting = z.infer<typeof insertAutoBattleSettingSchema>;
export type AutoBattleSetting = typeof autoBattleSettings.$inferSelect;

// Marketing Bots - AI Automation System
export const marketingBots = pgTable("marketing_bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // "content_creator", "engagement", "dm_marketing", "email", "ai_influencer"
  status: text("status").notNull().default("active"), // "active", "paused", "stopped"
  userId: varchar("user_id").references(() => users.id),
  
  config: jsonb("config").notNull().$type<{
    contentType?: "short" | "long";
    topics?: string[];
    postFrequency?: "hourly" | "daily" | "weekly";
    style?: string;
    ageRating?: "u16" | "16plus" | "18plus";
    
    // CRM Integration (GoHighLevel Lead Connector)
    crmIntegration?: {
      enabled: boolean;
      provider: "gohighlevel" | "hubspot" | "salesforce";
      syncLeads?: boolean;        // Auto-sync new leads to CRM
      syncContacts?: boolean;     // Sync contact updates
      createOpportunities?: boolean; // Create pipeline opportunities
      tagContacts?: string[];     // Tags to apply to CRM contacts
      pipelineId?: string;        // GHL pipeline ID
      stageId?: string;           // Default pipeline stage
      customFields?: Record<string, string>; // Custom field mappings
    };
  }>(),
  
  aiModel: text("ai_model").default("gpt-4"),
  schedule: text("schedule").default("daily"),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  
  totalActions: integer("total_actions").notNull().default(0),
  successfulActions: integer("successful_actions").notNull().default(0),
  totalEarnings: integer("total_earnings").notNull().default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMarketingBotSchema = createInsertSchema(marketingBots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMarketingBot = z.infer<typeof insertMarketingBotSchema>;
export type MarketingBot = typeof marketingBots.$inferSelect;

// Marketing Campaigns - Multi-Platform Outreach System
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  botId: varchar("bot_id").references(() => marketingBots.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id),
  
  status: text("status").notNull().default("active"), // "active", "paused", "completed", "stopped"
  
  // Target Platforms - Multi-platform support
  platforms: text("platforms").array().notNull(), // ["whatsapp", "tiktok", "instagram", "snapchat", "onlyfans", "facebook", "pinterest", "reddit"]
  
  // Campaign Configuration
  config: jsonb("config").notNull().$type<{
    messageTemplate?: string;
    targeting?: {
      interests?: string[];
      ageRange?: { min: number; max: number };
      locations?: string[];
      minFollowers?: number;
      hasWhatsApp?: boolean;
      hasTikTok?: boolean;
      hasInstagram?: boolean;
      hasSnapchat?: boolean;
      hasOnlyFans?: boolean;
      hasFacebook?: boolean;
      hasPinterest?: boolean;
      hasReddit?: boolean;
    };
    schedule?: {
      startDate?: string;
      endDate?: string;
      dailyLimit?: number;
      hourlyLimit?: number;
    };
    automation?: {
      autoReply?: boolean;
      autoFollow?: boolean;
      autoLike?: boolean;
      autoComment?: boolean;
    };
  }>(),
  
  // Performance Metrics
  totalReached: integer("total_reached").notNull().default(0),
  totalClicks: integer("total_clicks").notNull().default(0),
  totalSignups: integer("total_signups").notNull().default(0),
  totalSpent: integer("total_spent").notNull().default(0), // Credits spent
  
  // Timing
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  botIdx: index("idx_campaigns_bot").on(table.botId),
  userIdx: index("idx_campaigns_user").on(table.userId),
  statusIdx: index("idx_campaigns_status").on(table.status),
}));

export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;

// Campaign Leads - Track everyone contacted
export const campaignLeads = pgTable("campaign_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => marketingCampaigns.id, { onDelete: "cascade" }),
  
  platform: text("platform").notNull(), // "whatsapp", "tiktok", "instagram", etc.
  platformUsername: text("platform_username").notNull(),
  platformUrl: text("platform_url"),
  
  // Lead Info
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  
  // Interaction Status
  contacted: boolean("contacted").default(false),
  responded: boolean("responded").default(false),
  clicked: boolean("clicked").default(false),
  signedUp: boolean("signed_up").default(false),
  
  // Message Tracking
  messagesSent: integer("messages_sent").default(0),
  lastContactedAt: timestamp("last_contacted_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  campaignIdx: index("idx_leads_campaign").on(table.campaignId),
  platformIdx: index("idx_leads_platform").on(table.platform),
  signedUpIdx: index("idx_leads_signup").on(table.signedUp),
}));

export const insertCampaignLeadSchema = createInsertSchema(campaignLeads).omit({
  id: true,
  createdAt: true,
});
export type InsertCampaignLead = z.infer<typeof insertCampaignLeadSchema>;
export type CampaignLead = typeof campaignLeads.$inferSelect;

// Social Media Credentials - Secure API Token Storage (NO PASSWORDS!)
export const socialMediaCredentials = pgTable("social_media_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  platform: text("platform").notNull(), // "facebook", "instagram", "tiktok", "twitter", "reddit", "whatsapp"
  accountUsername: text("account_username"),
  
  // Secure credential storage - API TOKENS ONLY (no passwords!)
  clientId: text("client_id"),
  clientSecret: text("client_secret"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("idx_social_creds_user").on(table.userId),
  platformIdx: index("idx_social_creds_platform").on(table.platform),
  userPlatformIdx: uniqueIndex("idx_social_creds_user_platform").on(table.userId, table.platform),
}));

export const insertSocialMediaCredentialSchema = createInsertSchema(socialMediaCredentials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSocialMediaCredential = z.infer<typeof insertSocialMediaCredentialSchema>;
export type SocialMediaCredential = typeof socialMediaCredentials.$inferSelect;

// Username Marketplace - Premium Username Auction & Sales
export const usernameListings = pgTable("username_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  sellerId: varchar("seller_id").references(() => users.id),
  
  tier: varchar("tier", { length: 20 }).notNull(), // "standard", "premium", "elite", "celebrity"
  listingType: varchar("listing_type", { length: 20 }).notNull(), // "fixed_price", "auction"
  
  price: integer("price").notNull(), // In credits
  minBid: integer("min_bid"), // For auctions
  currentBid: integer("current_bid").default(0),
  
  status: varchar("status", { length: 20 }).default("active"), // "active", "sold", "cancelled"
  auctionEndsAt: timestamp("auction_ends_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  soldAt: timestamp("sold_at"),
});

export const insertUsernameListingSchema = createInsertSchema(usernameListings).omit({
  id: true,
  createdAt: true,
});
export type InsertUsernameListing = z.infer<typeof insertUsernameListingSchema>;
export type UsernameListing = typeof usernameListings.$inferSelect;

export const usernameBids = pgTable("username_bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => usernameListings.id, { onDelete: "cascade" }),
  bidderId: varchar("bidder_id").references(() => users.id),
  
  bidAmount: integer("bid_amount").notNull(),
  status: varchar("status", { length: 20 }).default("active"), // "active", "outbid", "won", "lost"
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUsernameBidSchema = createInsertSchema(usernameBids).omit({
  id: true,
  createdAt: true,
});
export type InsertUsernameBid = z.infer<typeof insertUsernameBidSchema>;
export type UsernameBid = typeof usernameBids.$inferSelect;

// Ad Monetization - Video Ad System
export const adPlacements = pgTable("ad_placements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  placementName: varchar("placement_name", { length: 100 }).notNull(), // e.g., "Reels In-Feed #1", "Tube Pre-Roll #1"
  placementType: varchar("placement_type", { length: 50 }), // Type of placement
  width: integer("width"), // Ad width in pixels
  height: integer("height"), // Ad height in pixels
  location: varchar("location", { length: 100 }), // Location on page
  priority: integer("priority").default(1), // Display priority
  maxAdsPerDay: integer("max_ads_per_day").default(100), // Daily impression cap
  cpmRate: decimal("cpm_rate", { precision: 10, scale: 2 }), // Cost per thousand impressions
  active: boolean("active").default(true), // Legacy active field
  
  adType: varchar("ad_type", { length: 30 }).notNull(), // "pre_roll", "mid_roll", "post_roll", "in_feed", "rotating_sidebar", "banner", "hook_location"
  platform: varchar("platform", { length: 20 }).notNull(), // "vids", "tube", "global"
  
  advertiserName: varchar("advertiser_name", { length: 100 }),
  adTitle: text("ad_title"),
  adDescription: text("ad_description"), // For sidebar/hook ads
  adUrl: text("ad_url"),
  targetUrl: text("target_url"), // Where ad clicks go
  
  costPerView: integer("cost_per_view").default(1), // Credits per view
  costPerClick: integer("cost_per_click").default(10), // Credits per click
  
  frequency: integer("frequency").default(5), // Show every N videos (for in-feed ads)
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdPlacementSchema = createInsertSchema(adPlacements).omit({
  id: true,
  createdAt: true,
});
export type InsertAdPlacement = z.infer<typeof insertAdPlacementSchema>;
export type AdPlacement = typeof adPlacements.$inferSelect;

export const adViews = pgTable("ad_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adId: varchar("ad_id").references(() => adPlacements.id, { onDelete: "cascade" }),
  videoId: varchar("video_id").references(() => videos.id, { onDelete: "cascade" }),
  viewerId: varchar("viewer_id").references(() => users.id),
  creatorId: varchar("creator_id").references(() => users.id), // Video creator
  
  viewDuration: integer("view_duration").default(0), // Seconds watched
  clicked: boolean("clicked").default(false),
  
  creatorEarnings: integer("creator_earnings").default(0), // Credits earned by creator
  platformRevenue: integer("platform_revenue").default(0), // Credits earned by platform
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdViewSchema = createInsertSchema(adViews).omit({
  id: true,
  createdAt: true,
});
export type InsertAdView = z.infer<typeof insertAdViewSchema>;
export type AdView = typeof adViews.$inferSelect;

// Admin Actions - Advanced Admin Tools
export const adminActions = pgTable("admin_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").references(() => users.id),
  targetUserId: varchar("target_user_id").references(() => users.id),
  
  actionType: varchar("action_type", { length: 50 }).notNull(), // "ban", "unban", "strike", "remove_strike", "delete_content", "approve_content"
  reason: text("reason"),
  duration: integer("duration"), // For temporary bans (in days)
  
  metadata: jsonb("metadata").$type<{
    contentId?: string;
    strikeCount?: number;
    previousStatus?: string;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdminActionSchema = createInsertSchema(adminActions).omit({
  id: true,
  createdAt: true,
});
export type InsertAdminAction = z.infer<typeof insertAdminActionSchema>;
export type AdminAction = typeof adminActions.$inferSelect;

// Social Connections - One-Click Contact Import
export const socialConnections = pgTable("social_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  
  platform: varchar("platform", { length: 50 }).notNull(), // "facebook", "instagram", "twitter", "tiktok", "linkedin", "snapchat", "discord", "telegram"
  platformUserId: varchar("platform_user_id", { length: 255 }).notNull(),
  platformUsername: varchar("platform_username", { length: 255 }),
  
  accessToken: text("access_token"), // Encrypted OAuth token
  refreshToken: text("refresh_token"), // For long-term access
  tokenExpiresAt: timestamp("token_expires_at"),
  
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userPlatformIdx: uniqueIndex("idx_social_connections_user_platform").on(table.userId, table.platform),
}));

export const insertSocialConnectionSchema = createInsertSchema(socialConnections).omit({
  id: true,
  createdAt: true,
});
export type InsertSocialConnection = z.infer<typeof insertSocialConnectionSchema>;
export type SocialConnection = typeof socialConnections.$inferSelect;

// Imported Contacts - Store contacts from social platforms
export const importedContacts = pgTable("imported_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  
  platform: varchar("platform", { length: 50 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }),
  contactUsername: varchar("contact_username", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhoneNumber: varchar("contact_phone_number", { length: 50 }),
  
  platformContactId: varchar("platform_contact_id", { length: 255 }).notNull(),
  profileImageUrl: text("profile_image_url"),
  
  // Match with existing platform users
  matchedUserId: varchar("matched_user_id").references(() => users.id),
  invited: boolean("invited").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userContactIdx: uniqueIndex("idx_imported_contacts_user_platform_contact").on(table.userId, table.platform, table.platformContactId),
}));

export const insertImportedContactSchema = createInsertSchema(importedContacts).omit({
  id: true,
  createdAt: true,
});
export type InsertImportedContact = z.infer<typeof insertImportedContactSchema>;
export type ImportedContact = typeof importedContacts.$inferSelect;

// ==========================================
// MARKETPLACE SYSTEM - Templates, PLRs, Digital Products
// ==========================================

export const productTypeEnum = pgEnum("product_type", [
  "marketing_template",
  "psychology_template",
  "plr_ebook",
  "plr_course",
  "plr_video",
  "plr_software",
  "ai_agent",
  "theme",
  "plugin",
]);

export const productCategoryEnum = pgEnum("product_category", [
  "marketing",
  "psychology",
  "business",
  "agency",
  "ecommerce",
  "affiliate",
  "ai_tools",
  "content_creation",
  "themes",
  "plugins",
]);

export const marketplaceProducts = pgTable("marketplace_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Product Details
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description"), // Full sales copy
  
  productType: productTypeEnum("product_type").notNull(),
  category: productCategoryEnum("category").notNull(),
  
  // Pricing
  priceCredits: integer("price_credits").notNull(), // Cost in credits
  originalPriceCredits: integer("original_price_credits"), // For showing discounts
  
  // Creator/Owner
  creatorId: varchar("creator_id").references(() => users.id), // Platform owner for built-in products
  isOfficialProduct: boolean("is_official_product").default(true), // True for your templates
  
  // Content
  content: jsonb("content").$type<{
    templateData?: any; // Marketing template structure
    plrFiles?: string[]; // URLs to PLR files in object storage
    aiAgentConfig?: any; // AI agent configuration
    themeConfig?: any; // Theme settings
    metadata?: any; // Additional product-specific data
  }>(),
  
  // Preview & Media
  thumbnailUrl: text("thumbnail_url"),
  previewImages: text("preview_images").array(),
  demoVideoUrl: text("demo_video_url"),
  
  // Stats
  totalSales: integer("total_sales").default(0),
  totalRevenue: integer("total_revenue").default(0), // In credits
  averageRating: integer("average_rating").default(0), // Out of 5 stars * 100 (e.g., 450 = 4.5 stars)
  totalReviews: integer("total_reviews").default(0),
  
  // Features & Benefits
  features: text("features").array(), // Bullet points of features
  benefits: text("benefits").array(), // What user gets
  
  // Marketing Copy (Conversion Psychology)
  conversionRate: varchar("conversion_rate", { length: 20 }), // "35-50%" etc
  earningsPotential: varchar("earnings_potential", { length: 100 }), // "$625-$1,650 in 48 hours"
  testimonials: jsonb("testimonials").$type<Array<{
    name: string;
    quote: string;
    result: string;
  }>>(),
  
  // Status
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  isEvergreen: boolean("is_evergreen").default(true), // Can be sold over and over
  
  // PLR Rights
  plrRights: jsonb("plr_rights").$type<{
    canResell: boolean;
    canRebrand: boolean;
    canModify: boolean;
    canGiveAway: boolean;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  categoryIdx: index("idx_marketplace_products_category").on(table.category),
  creatorIdx: index("idx_marketplace_products_creator").on(table.creatorId),
  featuredIdx: index("idx_marketplace_products_featured").on(table.isFeatured),
}));

export const insertMarketplaceProductSchema = createInsertSchema(marketplaceProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMarketplaceProduct = z.infer<typeof insertMarketplaceProductSchema>;
export type MarketplaceProduct = typeof marketplaceProducts.$inferSelect;

// User Purchases - Track who bought what
export const userPurchases = pgTable("user_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  productId: varchar("product_id").references(() => marketplaceProducts.id, { onDelete: "cascade" }).notNull(),
  
  // Purchase Details
  pricePaid: integer("price_paid").notNull(), // Credits paid
  transactionId: varchar("transaction_id").references(() => transactions.id),
  
  // Revenue Split (for marketplace products from other creators)
  creatorEarnings: integer("creator_earnings").default(0), // 50% to creator
  platformRevenue: integer("platform_revenue").default(0), // 50% to platform
  
  // Download/Access Tracking
  downloadCount: integer("download_count").default(0),
  lastAccessedAt: timestamp("last_accessed_at"),
  
  purchasedAt: timestamp("purchased_at").defaultNow(),
}, (table) => ({
  userProductIdx: uniqueIndex("idx_user_purchases_user_product").on(table.userId, table.productId),
  userIdx: index("idx_user_purchases_user").on(table.userId),
  productIdx: index("idx_user_purchases_product").on(table.productId),
}));

export const insertUserPurchaseSchema = createInsertSchema(userPurchases).omit({
  id: true,
  purchasedAt: true,
});
export type InsertUserPurchase = z.infer<typeof insertUserPurchaseSchema>;
export type UserPurchase = typeof userPurchases.$inferSelect;

// Product Reviews
export const productReviews = pgTable("product_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  productId: varchar("product_id").references(() => marketplaceProducts.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  rating: integer("rating").notNull(), // 1-5 stars
  reviewText: text("review_text"),
  
  // Success Metrics (for social proof)
  earningsReported: integer("earnings_reported"), // How much they made using the product
  timeToResults: varchar("time_to_results", { length: 50 }), // "48 hours", "7 days", etc
  
  isVerifiedPurchase: boolean("is_verified_purchase").default(true),
  isApproved: boolean("is_approved").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  productUserIdx: uniqueIndex("idx_product_reviews_product_user").on(table.productId, table.userId),
  productIdx: index("idx_product_reviews_product").on(table.productId),
}));

export const insertProductReviewSchema = createInsertSchema(productReviews).omit({
  id: true,
  createdAt: true,
});
export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;
export type ProductReview = typeof productReviews.$inferSelect;

// ==========================================
// VIRAL MARKETING SYSTEM - Build in Public & Trending Topics
// ==========================================

// Trending Topics table - "Be First to Market" strategy
export const trendingTopics = pgTable("trending_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  topic: varchar("topic", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category"), // "ai", "crypto", "gaming", "tech", etc
  
  // Virality Metrics
  trendScore: integer("trend_score").notNull().default(0), // Algorithm calculated score
  growthRate: decimal("growth_rate", { precision: 5, scale: 2 }).default("0"), // Percentage growth
  peakWindow: integer("peak_window").default(48), // Hours until trend peaks
  
  // Social Proof
  totalMentions: integer("total_mentions").default(0),
  xTwitterMentions: integer("x_twitter_mentions").default(0),
  tiktokViews: integer("tiktok_views").default(0),
  
  // Creator Opportunity
  competitionLevel: varchar("competition_level").default("low"), // "low", "medium", "high"
  recommendedHashtags: text("recommended_hashtags").array(),
  suggestedHooks: text("suggested_hooks").array(), // AI-generated hook ideas
  
  // Metadata
  isActive: boolean("is_active").default(true),
  firstDetected: timestamp("first_detected").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  expiresAt: timestamp("expires_at"), // When trend will be too saturated
}, (table) => ({
  scoreIdx: index("idx_trending_topics_score").on(table.trendScore),
  categoryIdx: index("idx_trending_topics_category").on(table.category),
}));

export const insertTrendingTopicSchema = createInsertSchema(trendingTopics).omit({
  id: true,
  firstDetected: true,
  lastUpdated: true,
});
export type InsertTrendingTopic = z.infer<typeof insertTrendingTopicSchema>;
export type TrendingTopic = typeof trendingTopics.$inferSelect;

// Social Shares table - Building in Public tracking
export const socialShares = pgTable("social_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  videoId: varchar("video_id").references(() => videos.id, { onDelete: "cascade" }),
  
  // Share Details
  platform: varchar("platform").notNull(), // "twitter", "facebook", "linkedin", "reddit", etc
  shareType: varchar("share_type").notNull(), // "progress_update", "achievement", "video", "milestone"
  shareText: text("share_text"), // What they shared
  shareUrl: text("share_url"), // Link to the social post
  
  // Build in Public Metrics
  milestoneType: varchar("milestone_type"), // "first_video", "100_followers", "first_spark", "1k_views"
  earnedCredits: integer("earned_credits").default(0), // Bonus credits for sharing
  
  // Engagement Tracking
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  clickThroughs: integer("click_throughs").default(0), // People who clicked back to PROFITHACK
  
  // Viral Loop Tracking
  signupsGenerated: integer("signups_generated").default(0), // New users from this share
  viralCoefficient: decimal("viral_coefficient", { precision: 5, scale: 2 }).default("0"), // Signups per share
  
  sharedAt: timestamp("shared_at").defaultNow(),
}, (table) => ({
  userIdx: index("idx_social_shares_user").on(table.userId),
  platformIdx: index("idx_social_shares_platform").on(table.platform),
  videoIdx: index("idx_social_shares_video").on(table.videoId),
}));

export const insertSocialShareSchema = createInsertSchema(socialShares).omit({
  id: true,
  sharedAt: true,
});
export type InsertSocialShare = z.infer<typeof insertSocialShareSchema>;
export type SocialShare = typeof socialShares.$inferSelect;

// Hook Performance Analytics - Track what hooks work best
export const hookAnalytics = pgTable("hook_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  videoId: varchar("video_id").references(() => videos.id, { onDelete: "cascade" }).notNull(),
  
  // Hook Breakdown
  hookType: varchar("hook_type").notNull(), // Same as videos.hookType
  hookText: text("hook_text"),
  hasOpenLoop: boolean("has_open_loop").default(false),
  challengesBelief: boolean("challenges_belief").default(false),
  hasContext: boolean("has_context").default(false),
  
  // Performance Metrics (tracked every hour)
  first3SecRetention: decimal("first_3_sec_retention", { precision: 5, scale: 2 }).default("0"), // % who watched past 3s
  avgWatchTime: decimal("avg_watch_time", { precision: 5, scale: 2 }).default("0"), // Average seconds watched
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }).default("0"), // % who watched to end
  swipeBackRate: decimal("swipe_back_rate", { precision: 5, scale: 2 }).default("0"), // % who swiped back
  
  // Engagement Quality
  likeRate: decimal("like_rate", { precision: 5, scale: 2 }).default("0"), // Likes per view
  commentRate: decimal("comment_rate", { precision: 5, scale: 2 }).default("0"),
  shareRate: decimal("share_rate", { precision: 5, scale: 2 }).default("0"),
  sparkRate: decimal("spark_rate", { precision: 5, scale: 2 }).default("0"),
  
  // AI Hook Score Breakdown
  contextScore: integer("context_score").default(0), // 0-100
  curiosityScore: integer("curiosity_score").default(0), // 0-100
  emotionalScore: integer("emotional_score").default(0), // 0-100
  overallHookScore: integer("overall_hook_score").default(0), // 0-100
  
  // Learning & Recommendations
  recommendedImprovements: text("recommended_improvements").array(),
  topPerformingElements: text("top_performing_elements").array(),
  
  lastAnalyzed: timestamp("last_analyzed").defaultNow(),
}, (table) => ({
  videoIdx: uniqueIndex("idx_hook_analytics_video").on(table.videoId),
  hookTypeIdx: index("idx_hook_analytics_type").on(table.hookType),
}));

export const insertHookAnalyticsSchema = createInsertSchema(hookAnalytics).omit({
  id: true,
  lastAnalyzed: true,
});
export type InsertHookAnalytics = z.infer<typeof insertHookAnalyticsSchema>;
export type HookAnalytics = typeof hookAnalytics.$inferSelect;

// Viral Content Templates - Proven formats that go viral (like Crayo/Musa strategies)
export const viralTemplates = pgTable("viral_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Template Details
  name: varchar("name").notNull(), // "Simpsons Prediction", "Text Story Drama", "Reddit Story"
  category: varchar("category").notNull(), // "predictions", "text_stories", "reddit_stories", "debates"
  description: text("description"),
  
  // Template Structure
  hookFormat: text("hook_format").notNull(), // "[Show] predicted [Topic]! 🤯"
  storyStructure: jsonb("story_structure"), // Step-by-step story beats
  requiredElements: text("required_elements").array(), // ["shock", "curiosity", "emoji"]
  
  // SEO & Virality
  targetKeywords: text("target_keywords").array(), // Keywords to rank for
  hashtagSuggestions: text("hashtag_suggestions").array(),
  optimalLength: integer("optimal_length").default(15), // Seconds for max retention
  
  // Performance Tracking
  timesUsed: integer("times_used").default(0),
  avgViralScore: decimal("avg_viral_score", { precision: 5, scale: 2 }).default("0"),
  avgRetentionRate: decimal("avg_retention_rate", { precision: 5, scale: 2 }).default("0"),
  totalViews: integer("total_views").default(0),
  
  // Examples & Assets
  exampleVideos: text("example_videos").array(), // URLs of successful examples
  backgroundMusic: varchar("background_music"), // Recommended music
  visualStyle: varchar("visual_style"), // "text_on_screen", "gameplay", "stock_footage"
  
  // Metadata
  isActive: boolean("is_active").default(true),
  difficulty: varchar("difficulty").default("easy"), // "easy", "medium", "hard"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  categoryIdx: index("idx_viral_templates_category").on(table.category),
  viralScoreIdx: index("idx_viral_templates_score").on(table.avgViralScore),
}));

export const insertViralTemplateSchema = createInsertSchema(viralTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertViralTemplate = z.infer<typeof insertViralTemplateSchema>;
export type ViralTemplate = typeof viralTemplates.$inferSelect;

// Text Stories - Manufactured viral content (Musa's text story niche)
export const textStories = pgTable("text_stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  creatorId: varchar("creator_id").references(() => users.id, { onDelete: "cascade" }),
  templateId: varchar("template_id").references(() => viralTemplates.id),
  
  // Story Content
  title: varchar("title").notNull(), // "Caught my GF cheating"
  storyType: varchar("story_type").notNull(), // "imessage", "reddit", "confession", "drama"
  hookText: text("hook_text").notNull(), // First message/opening
  
  // Story Elements (for iMessage-style)
  messages: jsonb("messages"), // Array of {sender, text, timestamp}
  participants: text("participants").array(), // ["You", "GF", "Mom"]
  emojiUsed: text("emoji_used").array(), // Track emoji for authenticity
  
  // Narrative Structure
  setupPhase: text("setup_phase"), // Context/normal situation
  conflictPhase: text("conflict_phase"), // Drama/twist
  resolutionPhase: text("resolution_phase"), // Outcome/cliffhanger
  hasClifthanger: boolean("has_cliffhanger").default(false),
  
  // Visual Settings
  phoneTheme: varchar("phone_theme").default("dark"), // "dark", "light", "ios", "android"
  fontStyle: varchar("font_style").default("system"),
  backgroundStyle: varchar("background_style"), // "gameplay", "satisfying", "subway_surfers"
  
  // Performance
  generatedVideoId: varchar("generated_video_id").references(() => videos.id),
  views: integer("views").default(0),
  engagement: decimal("engagement", { precision: 5, scale: 2 }).default("0"),
  
  // Metadata
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  creatorIdx: index("idx_text_stories_creator").on(table.creatorId),
  typeIdx: index("idx_text_stories_type").on(table.storyType),
}));

export const insertTextStorySchema = createInsertSchema(textStories).omit({
  id: true,
  createdAt: true,
});
export type InsertTextStory = z.infer<typeof insertTextStorySchema>;
export type TextStory = typeof textStories.$inferSelect;

// Viral Keywords - SEO tracking to rank for same terms as viral videos
export const viralKeywords = pgTable("viral_keywords", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Keyword Details
  keyword: varchar("keyword").notNull(), // "simpsons prediction 2025"
  category: varchar("category"), // "predictions", "drama", "tutorials"
  searchVolume: integer("search_volume").default(0), // Monthly searches
  competition: varchar("competition").default("low"), // "low", "medium", "high"
  
  // Ranking & Performance
  ourRanking: integer("our_ranking"), // Where we rank for this keyword
  targetRanking: integer("target_ranking").default(1), // Where we want to be
  videosTargeting: integer("videos_targeting").default(0), // How many of our videos use this
  
  // Competitor Analysis
  topCompetitors: jsonb("top_competitors"), // [{channel, views, strategy}]
  avgCompetitorViews: integer("avg_competitor_views").default(0),
  
  // Opportunity Score
  opportunityScore: integer("opportunity_score").default(0), // 0-100 (high volume + low competition)
  trendingStatus: varchar("trending_status").default("stable"), // "rising", "stable", "declining"
  
  // Tracking
  firstSeen: timestamp("first_seen").defaultNow(),
  lastChecked: timestamp("last_checked").defaultNow(),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  keywordIdx: uniqueIndex("idx_viral_keywords_keyword").on(table.keyword),
  opportunityIdx: index("idx_viral_keywords_opportunity").on(table.opportunityScore),
  competitionIdx: index("idx_viral_keywords_competition").on(table.competition),
}));

export const insertViralKeywordSchema = createInsertSchema(viralKeywords).omit({
  id: true,
  firstSeen: true,
  lastChecked: true,
});
export type InsertViralKeyword = z.infer<typeof insertViralKeywordSchema>;
export type ViralKeyword = typeof viralKeywords.$inferSelect;

// Caption Styles - 15+ viral subtitle styles (Crayo-style)
export const captionStyles = pgTable("caption_styles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Style Details
  name: varchar("name").notNull().unique(), // "MrBeast", "Ali Abdaal", "Hormozi"
  description: text("description"),
  category: varchar("category").default("viral"), // "viral", "educational", "cinematic"
  
  // Visual Properties
  fontFamily: varchar("font_family").default("Montserrat"),
  fontSize: integer("font_size").default(48),
  fontWeight: varchar("font_weight").default("800"), // "bold", "800", "900"
  textColor: varchar("text_color").default("#FFFFFF"),
  strokeColor: varchar("stroke_color"), // Outline color
  strokeWidth: integer("stroke_width").default(3),
  
  // Background & Effects
  backgroundColor: varchar("background_color"), // Box behind text
  backgroundOpacity: decimal("background_opacity", { precision: 3, scale: 2 }).default("0.8"),
  shadowEnabled: boolean("shadow_enabled").default(true),
  shadowColor: varchar("shadow_color").default("#000000"),
  glowEffect: boolean("glow_effect").default(false),
  
  // Animation
  animationType: varchar("animation_type").default("word_by_word"), // "word_by_word", "fade_in", "slide_up"
  highlightColor: varchar("highlight_color"), // Color for current word
  
  // Positioning
  verticalPosition: varchar("vertical_position").default("center"), // "top", "center", "bottom"
  maxWordsPerLine: integer("max_words_per_line").default(4),
  
  // Popularity
  timesUsed: integer("times_used").default(0),
  avgEngagement: decimal("avg_engagement", { precision: 5, scale: 2 }).default("0"),
  
  // Preview
  previewImageUrl: text("preview_image_url"),
  isActive: boolean("is_active").default(true),
  isPremium: boolean("is_premium").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  categoryIdx: index("idx_caption_styles_category").on(table.category),
  popularityIdx: index("idx_caption_styles_used").on(table.timesUsed),
}));

export const insertCaptionStyleSchema = createInsertSchema(captionStyles).omit({
  id: true,
  createdAt: true,
});
export type InsertCaptionStyle = z.infer<typeof insertCaptionStyleSchema>;
export type CaptionStyle = typeof captionStyles.$inferSelect;

// AI Voices - Voice options for narration (Crayo-style)
export const aiVoices = pgTable("ai_voices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Voice Details
  name: varchar("name").notNull().unique(), // "Adam", "Rachel", "Morgan Freeman"
  gender: varchar("gender").notNull(), // "male", "female", "neutral"
  accent: varchar("accent").default("american"), // "american", "british", "australian"
  ageRange: varchar("age_range").default("adult"), // "child", "teen", "adult", "senior"
  
  // Voice Characteristics
  tone: varchar("tone").default("neutral"), // "neutral", "energetic", "calm", "dramatic"
  pitch: varchar("pitch").default("medium"), // "low", "medium", "high"
  speed: decimal("speed", { precision: 3, scale: 2 }).default("1.0"), // 0.5 to 2.0
  
  // Provider Info
  provider: varchar("provider").default("elevenlabs"), // "elevenlabs", "openai", "google"
  providerVoiceId: varchar("provider_voice_id"), // Internal ID from provider
  
  // Audio Sample
  sampleAudioUrl: text("sample_audio_url"),
  
  // Popularity
  timesUsed: integer("times_used").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("4.5"),
  
  // Availability
  isActive: boolean("is_active").default(true),
  isPremium: boolean("is_premium").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  genderIdx: index("idx_ai_voices_gender").on(table.gender),
  providerIdx: index("idx_ai_voices_provider").on(table.provider),
  popularityIdx: index("idx_ai_voices_used").on(table.timesUsed),
}));

export const insertAiVoiceSchema = createInsertSchema(aiVoices).omit({
  id: true,
  createdAt: true,
});
export type InsertAiVoice = z.infer<typeof insertAiVoiceSchema>;
export type AiVoice = typeof aiVoices.$inferSelect;

// Video Projects - Crayo-style video generation projects
export const videoProjects = pgTable("video_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  creatorId: varchar("creator_id").references(() => users.id, { onDelete: "cascade" }),
  
  // Project Details
  title: varchar("title").notNull(),
  projectType: varchar("project_type").notNull(), // "clip_edit", "text_story", "reddit_story", "ai_generate"
  status: varchar("status").default("draft"), // "draft", "processing", "completed", "failed"
  
  // Source Content
  sourceType: varchar("source_type"), // "upload", "youtube", "tiktok", "text_prompt"
  sourceUrl: text("source_url"), // YouTube/TikTok URL
  sourceFileUrl: text("source_file_url"), // Uploaded file
  textPrompt: text("text_prompt"), // For AI generation
  
  // Selected Options
  captionStyleId: varchar("caption_style_id").references(() => captionStyles.id),
  aiVoiceId: varchar("ai_voice_id").references(() => aiVoices.id),
  templateId: varchar("template_id").references(() => viralTemplates.id),
  
  // Video Settings
  backgroundVideoType: varchar("background_video_type"), // "gameplay", "stock", "minecraft", "subway_surfers"
  musicTrack: varchar("music_track"),
  videoDuration: integer("video_duration"), // Seconds
  aspectRatio: varchar("aspect_ratio").default("9:16"), // "9:16", "16:9", "1:1"
  
  // Caption Settings
  autoCaptionsEnabled: boolean("auto_captions_enabled").default(true),
  captionText: text("caption_text"), // Full transcript/captions
  
  // Output
  generatedVideoUrl: text("generated_video_url"),
  generatedVideoId: varchar("generated_video_id").references(() => videos.id),
  thumbnailUrl: text("thumbnail_url"),
  
  // Processing
  processedAt: timestamp("processed_at"),
  processingTime: integer("processing_time"), // Seconds
  errorMessage: text("error_message"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  creatorIdx: index("idx_video_projects_creator").on(table.creatorId),
  statusIdx: index("idx_video_projects_status").on(table.status),
  typeIdx: index("idx_video_projects_type").on(table.projectType),
}));

export const insertVideoProjectSchema = createInsertSchema(videoProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVideoProject = z.infer<typeof insertVideoProjectSchema>;
export type VideoProject = typeof videoProjects.$inferSelect;

// Viral Strategies - 13 billion-view proven strategies
export const viralStrategies = pgTable("viral_strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Strategy Details
  name: varchar("name").notNull().unique(),
  category: varchar("category").notNull(), // "hook", "retention", "sharing", "testing"
  description: text("description").notNull(),
  
  // Implementation
  keyPrinciples: jsonb("key_principles").$type<string[]>(), // Array of principles
  implementation: text("implementation"),
  examples: jsonb("examples").$type<string[]>(),
  
  // Metrics
  avgRetentionBoost: decimal("avg_retention_boost", { precision: 5, scale: 2 }), // %
  avgShareBoost: decimal("avg_share_boost", { precision: 5, scale: 2 }), // %
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // %
  
  // Usage
  timesApplied: integer("times_applied").default(0),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(50), // 1-100 (higher = more important)
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertViralStrategySchema = createInsertSchema(viralStrategies).omit({
  id: true,
  createdAt: true,
});
export type InsertViralStrategy = z.infer<typeof insertViralStrategySchema>;
export type ViralStrategy = typeof viralStrategies.$inferSelect;

// Hook Templates - Proven hook formulas
export const hookTemplates = pgTable("hook_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Template Details
  name: varchar("name").notNull(),
  hookType: varchar("hook_type").notNull(), // "curiosity_gap", "pattern_interrupt", "challenge_belief", "open_loop"
  formula: text("formula").notNull(), // "{emotion_word} + {curiosity_element} + {visual_cue}"
  
  // Content
  example: text("example").notNull(),
  emotionScore: integer("emotion_score").notNull(), // 1-100
  curiosityScore: integer("curiosity_score").notNull(), // 1-100
  
  // Performance
  avgRetention6sec: decimal("avg_retention_6sec", { precision: 5, scale: 2 }), // % at 6 seconds
  avgRetention30sec: decimal("avg_retention_30sec", { precision: 5, scale: 2 }),
  avgShareRate: decimal("avg_share_rate", { precision: 5, scale: 2 }),
  
  // Usage
  timesUsed: integer("times_used").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  typeIdx: index("idx_hook_templates_type").on(table.hookType),
  performanceIdx: index("idx_hook_templates_retention").on(table.avgRetention6sec),
}));

export const insertHookTemplateSchema = createInsertSchema(hookTemplates).omit({
  id: true,
  createdAt: true,
});
export type InsertHookTemplate = z.infer<typeof insertHookTemplateSchema>;
export type HookTemplate = typeof hookTemplates.$inferSelect;

// Content Tests - $5 dark post A/B testing
export const contentTests = pgTable("content_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  videoId: varchar("video_id").references(() => videos.id, { onDelete: "cascade" }),
  creatorId: varchar("creator_id").references(() => users.id, { onDelete: "cascade" }),
  
  // Test Setup
  testType: varchar("test_type").notNull(), // "hook", "music", "length", "text_overlay", "opening_shot"
  variationNumber: integer("variation_number").notNull(), // 1-12
  totalVariations: integer("total_variations").default(7),
  
  // Content Details
  description: text("description"),
  hookText: text("hook_text"),
  duration: integer("duration"), // Seconds
  hasMusic: boolean("has_music").default(false),
  musicTrack: varchar("music_track"),
  textOverlay: text("text_overlay"),
  
  // Test Results
  adSpend: decimal("ad_spend", { precision: 10, scale: 2 }).default("5.00"), // $5 dark post
  impressions: integer("impressions").default(0),
  views: integer("views").default(0),
  
  // Retention Analysis
  retention3sec: decimal("retention_3sec", { precision: 5, scale: 2 }),
  retention6sec: decimal("retention_6sec", { precision: 5, scale: 2 }),
  retention12sec: decimal("retention_12sec", { precision: 5, scale: 2 }),
  retention20sec: decimal("retention_20sec", { precision: 5, scale: 2 }),
  retention30sec: decimal("retention_30sec", { precision: 5, scale: 2 }),
  retention60sec: decimal("retention_60sec", { precision: 5, scale: 2 }),
  avgWatchTime: decimal("avg_watch_time", { precision: 5, scale: 2 }),
  
  // Drop-off Points
  maxDropoffPoint: integer("max_dropoff_point"), // Timestamp in seconds where biggest drop occurred
  maxDropoffPercent: decimal("max_dropoff_percent", { precision: 5, scale: 2 }),
  
  // Engagement
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  
  // Winner?
  isWinner: boolean("is_winner").default(false),
  winnerScore: decimal("winner_score", { precision: 5, scale: 2 }), // Overall performance score
  
  // Metadata
  testStartedAt: timestamp("test_started_at").defaultNow(),
  testCompletedAt: timestamp("test_completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  videoIdx: index("idx_content_tests_video").on(table.videoId),
  creatorIdx: index("idx_content_tests_creator").on(table.creatorId),
  winnerIdx: index("idx_content_tests_winner").on(table.isWinner),
}));

export const insertContentTestSchema = createInsertSchema(contentTests).omit({
  id: true,
  createdAt: true,
});
export type InsertContentTest = z.infer<typeof insertContentTestSchema>;
export type ContentTest = typeof contentTests.$inferSelect;

// Viral Scores - AI-calculated virality scores
export const viralScores = pgTable("viral_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  videoId: varchar("video_id").references(() => videos.id, { onDelete: "cascade" }).unique(),
  
  // Hook Scores
  hookScore: integer("hook_score").notNull(), // 0-100
  emotionScore: integer("emotion_score").notNull(), // 0-100
  curiosityScore: integer("curiosity_score").notNull(), // 0-100
  clarityScore: integer("clarity_score").notNull(), // 0-100 (avoid sensory overload)
  
  // Content Scores
  watchTimeScore: integer("watch_time_score").notNull(), // 0-100
  sharebilityScore: integer("shareability_score").notNull(), // 0-100
  widthScore: integer("width_score").notNull(), // 0-100 (how wide is the appeal)
  
  // Reverse Engineering Score
  intentDesignScore: integer("intent_design_score").notNull(), // 0-100 (designed in reverse?)
  commentIntentMatch: decimal("comment_intent_match", { precision: 5, scale: 2 }), // % of comments matching intent
  
  // Overall Viral Potential
  overallViralScore: integer("overall_viral_score").notNull(), // 0-100
  viralPrediction: varchar("viral_prediction").notNull(), // "low", "medium", "high", "mega_viral"
  
  // AI Analysis
  aiRecommendations: jsonb("ai_recommendations").$type<string[]>(),
  weakPoints: jsonb("weak_points").$type<string[]>(),
  strengths: jsonb("strengths").$type<string[]>(),
  
  // Metadata
  analyzedAt: timestamp("analyzed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  videoIdx: index("idx_viral_scores_video").on(table.videoId),
  scoreIdx: index("idx_viral_scores_overall").on(table.overallViralScore),
  predictionIdx: index("idx_viral_scores_prediction").on(table.viralPrediction),
}));

export const insertViralScoreSchema = createInsertSchema(viralScores).omit({
  id: true,
  createdAt: true,
  analyzedAt: true,
});
export type InsertViralScore = z.infer<typeof insertViralScoreSchema>;
export type ViralScore = typeof viralScores.$inferSelect;

// Platform Accounts - Connected social media accounts
export const platformAccounts = pgTable("platform_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  
  // Platform Info
  platform: varchar("platform").notNull(), // "tiktok", "instagram", "youtube", "facebook", "x", "snapchat", "pinterest", "reddit"
  platformUsername: varchar("platform_username").notNull(),
  platformUserId: varchar("platform_user_id"),
  
  // Auth
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  
  // Stats
  followerCount: integer("follower_count").default(0),
  lastSyncedAt: timestamp("last_synced_at"),
  
  // Settings
  autoPost: boolean("auto_post").default(false),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("idx_platform_accounts_user").on(table.userId),
  platformIdx: index("idx_platform_accounts_platform").on(table.platform),
  uniqueAccount: uniqueIndex("unique_user_platform").on(table.userId, table.platform),
}));

export const insertPlatformAccountSchema = createInsertSchema(platformAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPlatformAccount = z.infer<typeof insertPlatformAccountSchema>;
export type PlatformAccount = typeof platformAccounts.$inferSelect;

// Platform Content - Content deployed to external platforms
export const platformContent = pgTable("platform_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: varchar("platform").notNull(), // "onlyfans", "patreon", "fansly", etc.
  contentId: varchar("content_id").notNull(), // ID on the platform
  
  // Content Info
  title: varchar("title", { length: 500 }),
  contentType: varchar("content_type"), // "video", "image", "text"
  url: text("url"),
  
  // Analytics
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0.00"),
  
  // Metadata
  postedAt: timestamp("posted_at").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  creatorIdx: index("idx_platform_content_creator").on(table.creatorId),
  platformIdx: index("idx_platform_content_platform").on(table.platform),
}));

export const insertPlatformContentSchema = createInsertSchema(platformContent).omit({
  id: true,
  createdAt: true,
});
export type InsertPlatformContent = z.infer<typeof insertPlatformContentSchema>;
export type PlatformContent = typeof platformContent.$inferSelect;

// Deployment Jobs - Track multi-platform deployments
export const deploymentJobs = pgTable("deployment_jobs", {
  id: varchar("id").primaryKey(),
  
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contentId: varchar("content_id").notNull(), // Internal content ID
  
  // Deployment Info
  platforms: jsonb("platforms").$type<string[]>(), // Platforms to deploy to
  status: varchar("status").notNull().default("pending"), // "pending", "processing", "completed", "failed"
  
  // Results
  successCount: integer("success_count").default(0),
  failureCount: integer("failure_count").default(0),
  results: jsonb("results"), // Platform-specific results
  
  // Metadata
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  creatorIdx: index("idx_deployment_jobs_creator").on(table.creatorId),
  statusIdx: index("idx_deployment_jobs_status").on(table.status),
}));

export const insertDeploymentJobSchema = createInsertSchema(deploymentJobs).omit({
  createdAt: true,
});
export type InsertDeploymentJob = z.infer<typeof insertDeploymentJobSchema>;
export type DeploymentJob = typeof deploymentJobs.$inferSelect;

// Multi-Platform Posts - Track cross-platform posting
export const multiPlatformPosts = pgTable("multi_platform_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  videoId: varchar("video_id").references(() => videos.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  platformAccountId: varchar("platform_account_id").references(() => platformAccounts.id, { onDelete: "cascade" }),
  
  // Post Details
  platform: varchar("platform").notNull(),
  platformPostId: varchar("platform_post_id"),
  platformPostUrl: text("platform_post_url"),
  
  // Status
  status: varchar("status").default("pending"), // "pending", "posted", "failed", "deleted"
  errorMessage: text("error_message"),
  
  // Performance
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  
  // Timing
  scheduledFor: timestamp("scheduled_for"),
  postedAt: timestamp("posted_at"),
  lastSyncedAt: timestamp("last_synced_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  videoIdx: index("idx_multi_platform_posts_video").on(table.videoId),
  userIdx: index("idx_multi_platform_posts_user").on(table.userId),
  platformIdx: index("idx_multi_platform_posts_platform").on(table.platform),
  statusIdx: index("idx_multi_platform_posts_status").on(table.status),
}));

export const insertMultiPlatformPostSchema = createInsertSchema(multiPlatformPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMultiPlatformPost = z.infer<typeof insertMultiPlatformPostSchema>;
export type MultiPlatformPost = typeof multiPlatformPosts.$inferSelect;

// ============================================================================
// AI SUPPORT BOT & FAQ SYSTEM
// ============================================================================

// Enums for support system
export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "waiting_user",
  "resolved",
  "closed",
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const faqCategoryEnum = pgEnum("faq_category", [
  "getting_started",
  "account",
  "billing",
  "credits",
  "features",
  "technical",
  "creator_tools",
  "monetization",
  "safety",
  "other",
]);

// FAQs - Knowledge base for AI support bot
export const faqs = pgTable("faqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Content
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: faqCategoryEnum("category").notNull().default("other"),
  
  // Search & Discovery
  keywords: text("keywords").array(), // For better AI matching
  searchCount: integer("search_count").default(0), // Track popularity
  helpfulCount: integer("helpful_count").default(0), // User feedback
  
  // Admin
  isPublished: boolean("is_published").default(true),
  displayOrder: integer("display_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  categoryIdx: index("idx_faqs_category").on(table.category),
  publishedIdx: index("idx_faqs_published").on(table.isPublished),
}));

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type Faq = typeof faqs.$inferSelect;

// Support Tickets - Human escalation from bot
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  
  // Ticket Info
  subject: varchar("subject", { length: 255 }).notNull(),
  category: faqCategoryEnum("category").notNull(),
  priority: ticketPriorityEnum("priority").default("medium"),
  status: ticketStatusEnum("status").default("open"),
  
  // Bot Context
  botConversation: jsonb("bot_conversation").$type<{ role: string; content: string; timestamp: string }[]>(),
  botEscalationReason: text("bot_escalation_reason"), // Why bot couldn't help
  
  // Assignment
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  
  // Tracking
  firstResponseAt: timestamp("first_response_at"),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  
  // User Satisfaction
  rating: integer("rating"), // 1-5 stars
  feedback: text("feedback"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("idx_support_tickets_user").on(table.userId),
  statusIdx: index("idx_support_tickets_status").on(table.status),
  priorityIdx: index("idx_support_tickets_priority").on(table.priority),
  assignedIdx: index("idx_support_tickets_assigned").on(table.assignedToId),
}));

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

// Support Messages - Conversation thread
export const supportMessages = pgTable("support_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  ticketId: varchar("ticket_id").references(() => supportTickets.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").references(() => users.id, { onDelete: "cascade" }),
  
  // Message
  message: text("message").notNull(),
  isInternal: boolean("is_internal").default(false), // Staff notes
  
  // Attachments
  attachments: jsonb("attachments").$type<{ url: string; filename: string; size: number }[]>(),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  ticketIdx: index("idx_support_messages_ticket").on(table.ticketId),
  createdIdx: index("idx_support_messages_created").on(table.createdAt),
}));

export const insertSupportMessageSchema = createInsertSchema(supportMessages).omit({
  id: true,
  createdAt: true,
});
export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;
export type SupportMessage = typeof supportMessages.$inferSelect;

// Bot Chat Sessions - Track all AI conversations
export const botChatSessions = pgTable("bot_chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  
  // Conversation
  messages: jsonb("messages").$type<{ role: "user" | "assistant"; content: string; timestamp: string }[]>().notNull(),
  
  // Analytics
  resolved: boolean("resolved").default(false),
  escalatedToTicket: boolean("escalated_to_ticket").default(false),
  ticketId: varchar("ticket_id").references(() => supportTickets.id),
  
  // Tracking
  sessionDuration: integer("session_duration"), // seconds
  messageCount: integer("message_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("idx_bot_sessions_user").on(table.userId),
  resolvedIdx: index("idx_bot_sessions_resolved").on(table.resolved),
  escalatedIdx: index("idx_bot_sessions_escalated").on(table.escalatedToTicket),
}));

export const insertBotChatSessionSchema = createInsertSchema(botChatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBotChatSession = z.infer<typeof insertBotChatSessionSchema>;
export type BotChatSession = typeof botChatSessions.$inferSelect;

// ============================================================================
// AI CREATOR TOOLS - Market-Leading Features
// ============================================================================

// AI Thumbnail Engineer - Generate high-CTR thumbnails in seconds
export const aiThumbnails = pgTable("ai_thumbnails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  videoId: varchar("video_id").references(() => videos.id, { onDelete: "cascade" }),
  
  // Input
  videoTitle: text("video_title").notNull(),
  niche: varchar("niche"), // "tech", "gaming", "lifestyle", etc.
  style: varchar("style").default("dramatic"), // "dramatic", "minimalist", "colorful", "professional"
  
  // Generated Thumbnails (10 variations)
  thumbnails: jsonb("thumbnails").$type<{
    url: string;
    prompt: string;
    ctrScore: number; // 0-100 predicted click-through rate
    style: string;
    selected: boolean;
  }[]>().notNull(),
  
  // A/B Testing Results
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  ctr: decimal("ctr").default("0"), // Actual CTR percentage
  
  // Generation Cost
  creditsUsed: integer("credits_used").default(10), // 10 credits = 10 thumbnails
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("idx_ai_thumbnails_user").on(table.userId),
  videoIdx: index("idx_ai_thumbnails_video").on(table.videoId),
  createdIdx: index("idx_ai_thumbnails_created").on(table.createdAt),
}));

export const insertAiThumbnailSchema = createInsertSchema(aiThumbnails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAiThumbnail = z.infer<typeof insertAiThumbnailSchema>;
export type AiThumbnail = typeof aiThumbnails.$inferSelect;

// AI Script Factory - Generate viral scripts in 60 seconds
export const aiScripts = pgTable("ai_scripts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  videoId: varchar("video_id").references(() => videos.id, { onDelete: "cascade" }),
  
  // Input
  topic: text("topic").notNull(),
  format: varchar("format").default("short"), // "short" (60s), "medium" (5-10min), "long" (20+ min)
  platform: varchar("platform").default("tiktok"), // "tiktok", "youtube", "instagram"
  tone: varchar("tone").default("engaging"), // "engaging", "professional", "humorous", "educational"
  
  // Generated Script
  hook: text("hook").notNull(), // First 3 seconds
  script: text("script").notNull(), // Full script
  cta: text("cta").notNull(), // Call to action
  keywords: text("keywords").array(), // SEO keywords
  
  // Predictions
  viralScore: integer("viral_score").default(0), // 0-100
  estimatedViews: integer("estimated_views").default(0),
  
  // Performance (if used)
  actualViews: integer("actual_views").default(0),
  retentionRate: decimal("retention_rate").default("0"), // % who watched till end
  
  // Generation Cost
  creditsUsed: integer("credits_used").default(5),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("idx_ai_scripts_user").on(table.userId),
  videoIdx: index("idx_ai_scripts_video").on(table.videoId),
  formatIdx: index("idx_ai_scripts_format").on(table.format),
  createdIdx: index("idx_ai_scripts_created").on(table.createdAt),
}));

export const insertAiScriptSchema = createInsertSchema(aiScripts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAiScript = z.infer<typeof insertAiScriptSchema>;
export type AiScript = typeof aiScripts.$inferSelect;

// AI Courses (TikTok Series) - Paid episodic content
export const aiCourses = pgTable("ai_courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  creatorId: varchar("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Course Info
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail"),
  price: decimal("price").notNull(), // $0.99 to $299.99
  
  // Content
  episodeCount: integer("episode_count").default(0),
  totalDuration: integer("total_duration").default(0), // seconds
  
  // Categories
  category: varchar("category").notNull(), // "coding", "design", "business", "fitness", etc.
  skillLevel: varchar("skill_level").default("beginner"), // "beginner", "intermediate", "advanced"
  
  // Sales & Performance
  enrollments: integer("enrollments").default(0),
  revenue: decimal("revenue").default("0"), // Total revenue
  rating: decimal("rating").default("0"), // 0-5 stars
  reviewCount: integer("review_count").default(0),
  
  // Status
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  publishedAt: timestamp("published_at"),
}, (table) => ({
  creatorIdx: index("idx_ai_courses_creator").on(table.creatorId),
  categoryIdx: index("idx_ai_courses_category").on(table.category),
  publishedIdx: index("idx_ai_courses_published").on(table.isPublished),
  featuredIdx: index("idx_ai_courses_featured").on(table.isFeatured),
}));

export const insertAiCourseSchema = createInsertSchema(aiCourses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAiCourse = z.infer<typeof insertAiCourseSchema>;
export type AiCourse = typeof aiCourses.$inferSelect;

// AI Course Episodes - Individual lessons
export const aiCourseEpisodes = pgTable("ai_course_episodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  courseId: varchar("course_id").references(() => aiCourses.id, { onDelete: "cascade" }).notNull(),
  videoId: varchar("video_id").references(() => videos.id, { onDelete: "cascade" }),
  
  // Episode Info
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  episodeNumber: integer("episode_number").notNull(),
  duration: integer("duration").default(0), // seconds
  
  // Content
  videoUrl: text("video_url"),
  resources: jsonb("resources").$type<{ title: string; url: string; type: string }[]>(),
  
  // Tracking
  viewCount: integer("view_count").default(0),
  completionCount: integer("completion_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  courseIdx: index("idx_ai_course_episodes_course").on(table.courseId),
  episodeIdx: index("idx_ai_course_episodes_number").on(table.episodeNumber),
}));

export const insertAiCourseEpisodeSchema = createInsertSchema(aiCourseEpisodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAiCourseEpisode = z.infer<typeof insertAiCourseEpisodeSchema>;
export type AiCourseEpisode = typeof aiCourseEpisodes.$inferSelect;

// AI Course Enrollments - Track who bought what
export const aiCourseEnrollments = pgTable("ai_course_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  courseId: varchar("course_id").references(() => aiCourses.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Purchase Info
  pricePaid: decimal("price_paid").notNull(),
  paymentProvider: paymentProviderEnum("payment_provider").notNull(),
  
  // Progress Tracking
  lastEpisodeWatched: integer("last_episode_watched").default(0),
  progress: decimal("progress").default("0"), // 0-100%
  completedAt: timestamp("completed_at"),
  
  // Review
  rating: integer("rating"), // 1-5 stars
  review: text("review"),
  reviewedAt: timestamp("reviewed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  courseIdx: index("idx_ai_enrollments_course").on(table.courseId),
  userIdx: index("idx_ai_enrollments_user").on(table.userId),
  uniqueEnrollment: uniqueIndex("unique_course_user").on(table.courseId, table.userId),
}));

export const insertAiCourseEnrollmentSchema = createInsertSchema(aiCourseEnrollments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAiCourseEnrollment = z.infer<typeof insertAiCourseEnrollmentSchema>;
export type AiCourseEnrollment = typeof aiCourseEnrollments.$inferSelect;

// AI Ad Generator - Profitable ad variations in seconds
export const aiAds = pgTable("ai_ads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Input
  productName: text("product_name").notNull(),
  productDescription: text("product_description").notNull(),
  targetAudience: varchar("target_audience"), // "18-24 female gamers", etc.
  adGoal: varchar("ad_goal").default("sales"), // "sales", "leads", "awareness", "traffic"
  
  // Generated Ads (10 variations)
  ads: jsonb("ads").$type<{
    headline: string;
    body: string;
    cta: string;
    imageUrl: string;
    platform: string; // "facebook", "instagram", "google", "tiktok"
    style: string; // "pain-point", "benefit-focused", "social-proof", "scarcity"
    predictedCtr: number; // 0-100
  }[]>().notNull(),
  
  // Performance (if used)
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  spend: decimal("spend").default("0"),
  revenue: decimal("revenue").default("0"),
  roas: decimal("roas").default("0"), // Return on ad spend
  
  // Generation Cost
  creditsUsed: integer("credits_used").default(15), // 15 credits for 10 ad variations
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("idx_ai_ads_user").on(table.userId),
  goalIdx: index("idx_ai_ads_goal").on(table.adGoal),
  createdIdx: index("idx_ai_ads_created").on(table.createdAt),
}));

export const insertAiAdSchema = createInsertSchema(aiAds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAiAd = z.infer<typeof insertAiAdSchema>;
export type AiAd = typeof aiAds.$inferSelect;

// AI Content Planner - 30-day content calendar in 30 minutes
export const aiContentPlans = pgTable("ai_content_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Input
  niche: varchar("niche").notNull(),
  goals: text("goals").notNull(), // "grow to 10k followers, monetize, etc."
  platforms: text("platforms").array().notNull(), // ["tiktok", "youtube", "instagram"]
  postsPerWeek: integer("posts_per_week").default(7),
  
  // Generated Plan (30 days)
  contentCalendar: jsonb("content_calendar").$type<{
    date: string;
    platform: string;
    type: string; // "tutorial", "behind-scenes", "trending", "product-review"
    topic: string;
    hook: string;
    hashtags: string[];
    estimatedViews: number;
  }[]>().notNull(),
  
  // Competitor Analysis
  competitorInsights: jsonb("competitor_insights").$type<{
    competitor: string;
    topPerforming: string[];
    avgViews: number;
    postingFrequency: string;
  }[]>(),
  
  // Tracking
  completedPosts: integer("completed_posts").default(0),
  totalPosts: integer("total_posts").default(30),
  
  // Generation Cost
  creditsUsed: integer("credits_used").default(20), // 20 credits for 30-day plan
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("idx_ai_content_plans_user").on(table.userId),
  nicheIdx: index("idx_ai_content_plans_niche").on(table.niche),
  createdIdx: index("idx_ai_content_plans_created").on(table.createdAt),
}));

export const insertAiContentPlanSchema = createInsertSchema(aiContentPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAiContentPlan = z.infer<typeof insertAiContentPlanSchema>;
export type AiContentPlan = typeof aiContentPlans.$inferSelect;

// ============================================================================
// VIDEO ADS SYSTEM (8 Tables) - 25% Creator Share Revenue Model
// ============================================================================

// TABLE 1: video_ad_campaigns
export const videoAdCampaigns = pgTable("video_ad_campaigns", {
  id: integer("id").primaryKey(),
  advertiserId: varchar("advertiser_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  campaignName: varchar("campaign_name", { length: 255 }).notNull(),
  campaignDescription: text("campaign_description"),
  productName: varchar("product_name", { length: 255 }).notNull(),
  productUrl: varchar("product_url", { length: 500 }).notNull(),
  productCategory: varchar("product_category", { length: 100 }),
  targetAudience: jsonb("target_audience").$type<{
    ageRange?: string[];
    gender?: string[];
    interests?: string[];
    locations?: string[];
  }>().default(sql`'{}'`),
  budget: decimal("budget", { precision: 12, scale: 2 }).notNull(),
  dailyBudget: decimal("daily_budget", { precision: 10, scale: 2 }).notNull(),
  spent: decimal("spent", { precision: 12, scale: 2 }).default("0.00"),
  creatorShare: decimal("creator_share", { precision: 5, scale: 2 }).default("25.00"),
  status: varchar("status", { length: 20 }).default("draft"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  advertiserIdIdx: index("idx_video_ad_campaigns_advertiser_id").on(table.advertiserId),
  statusIdx: index("idx_video_ad_campaigns_status").on(table.status),
  startDateIdx: index("idx_video_ad_campaigns_start_date").on(table.startDate),
  endDateIdx: index("idx_video_ad_campaigns_end_date").on(table.endDate),
  createdAtIdx: index("idx_video_ad_campaigns_created_at").on(table.createdAt),
}));

export const insertVideoAdCampaignSchema = createInsertSchema(videoAdCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVideoAdCampaign = z.infer<typeof insertVideoAdCampaignSchema>;
export type VideoAdCampaign = typeof videoAdCampaigns.$inferSelect;

// TABLE 2: ai_clones
export const aiClones = pgTable("ai_clones", {
  id: integer("id").primaryKey(),
  creatorId: varchar("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  cloneName: varchar("clone_name", { length: 255 }).notNull(),
  cloneDescription: text("clone_description"),
  voiceUrl: varchar("voice_url", { length: 500 }),
  voiceSampleDuration: integer("voice_sample_duration"),
  faceModelUrl: varchar("face_model_url", { length: 500 }),
  bodyModelUrl: varchar("body_model_url", { length: 500 }),
  personalityTraits: jsonb("personality_traits").$type<{
    traits?: string[];
    style?: string;
    tone?: string;
  }>().default(sql`'{}'`),
  videoSamples: jsonb("video_samples").$type<string[]>().default(sql`'[]'`),
  trainingDataUrl: varchar("training_data_url", { length: 500 }),
  trainingDataSize: integer("training_data_size"),
  cloneQuality: varchar("clone_quality", { length: 20 }).default("standard"),
  isPublic: boolean("is_public").default(false),
  usageCount: integer("usage_count").default(0),
  earnings: decimal("earnings", { precision: 12, scale: 2 }).default("0.00"),
  status: varchar("status", { length: 20 }).default("training"),
  accuracyScore: decimal("accuracy_score", { precision: 5, scale: 2 }).default("0.00"),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  creatorIdIdx: index("idx_ai_clones_creator_id").on(table.creatorId),
  statusIdx: index("idx_ai_clones_status").on(table.status),
  isPublicIdx: index("idx_ai_clones_is_public").on(table.isPublic),
  cloneQualityIdx: index("idx_ai_clones_clone_quality").on(table.cloneQuality),
  accuracyScoreIdx: index("idx_ai_clones_accuracy_score").on(table.accuracyScore),
}));

export const insertAiCloneSchema = createInsertSchema(aiClones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAiClone = z.infer<typeof insertAiCloneSchema>;
export type AIClone = typeof aiClones.$inferSelect;

// TABLE 3: video_ad_creatives
export const videoAdCreatives = pgTable("video_ad_creatives", {
  id: integer("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => videoAdCampaigns.id, { onDelete: "cascade" }).notNull(),
  videoUrl: varchar("video_url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  duration: integer("duration").notNull(),
  generatedBy: varchar("generated_by", { length: 50 }).notNull(),
  aiCloneId: integer("ai_clone_id").references(() => aiClones.id, { onDelete: "set null" }),
  scriptUsed: text("script_used"),
  viralScore: decimal("viral_score", { precision: 5, scale: 2 }).default("0.00"),
  views: integer("views").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }).default("0.00"),
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  campaignIdIdx: index("idx_video_ad_creatives_campaign_id").on(table.campaignId),
  aiCloneIdIdx: index("idx_video_ad_creatives_ai_clone_id").on(table.aiCloneId),
  viralScoreIdx: index("idx_video_ad_creatives_viral_score").on(table.viralScore),
  engagementRateIdx: index("idx_video_ad_creatives_engagement_rate").on(table.engagementRate),
  isActiveIdx: index("idx_video_ad_creatives_is_active").on(table.isActive),
}));

export const insertVideoAdCreativeSchema = createInsertSchema(videoAdCreatives).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVideoAdCreative = z.infer<typeof insertVideoAdCreativeSchema>;
export type VideoAdCreative = typeof videoAdCreatives.$inferSelect;

// TABLE 4: video_ad_placements
export const videoAdPlacements = pgTable("video_ad_placements", {
  id: integer("id").primaryKey(),
  videoId: varchar("video_id").references(() => videos.id, { onDelete: "cascade" }).notNull(),
  creatorId: varchar("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  campaignId: integer("campaign_id").references(() => videoAdCampaigns.id, { onDelete: "cascade" }).notNull(),
  creativeId: integer("creative_id").references(() => videoAdCreatives.id, { onDelete: "cascade" }).notNull(),
  placementType: varchar("placement_type", { length: 50 }).notNull(),
  placementPosition: integer("placement_position").notNull(),
  placementDuration: integer("placement_duration").notNull(),
  placementSize: varchar("placement_size", { length: 50 }),
  creatorEarnings: decimal("creator_earnings", { precision: 10, scale: 2 }).default("0.00"),
  platformEarnings: decimal("platform_earnings", { precision: 10, scale: 2 }).default("0.00"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00"),
  views: integer("views").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  ctr: decimal("ctr", { precision: 5, scale: 2 }).default("0.00"),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  videoIdIdx: index("idx_video_ad_placements_video_id").on(table.videoId),
  creatorIdIdx: index("idx_video_ad_placements_creator_id").on(table.creatorId),
  campaignIdIdx: index("idx_video_ad_placements_campaign_id").on(table.campaignId),
  creativeIdIdx: index("idx_video_ad_placements_creative_id").on(table.creativeId),
  placementTypeIdx: index("idx_video_ad_placements_placement_type").on(table.placementType),
  statusIdx: index("idx_video_ad_placements_status").on(table.status),
  creatorEarningsIdx: index("idx_video_ad_placements_creator_earnings").on(table.creatorEarnings),
}));

export const insertVideoAdPlacementSchema = createInsertSchema(videoAdPlacements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVideoAdPlacement = z.infer<typeof insertVideoAdPlacementSchema>;
export type VideoAdPlacement = typeof videoAdPlacements.$inferSelect;

// TABLE 5: video_ad_metrics
export const videoAdMetrics = pgTable("video_ad_metrics", {
  id: integer("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => videoAdCampaigns.id, { onDelete: "cascade" }).notNull(),
  creativeId: integer("creative_id").references(() => videoAdCreatives.id, { onDelete: "cascade" }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  impressions: integer("impressions").notNull().default(0),
  views: integer("views").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  spend: decimal("spend", { precision: 10, scale: 2 }).notNull().default("0.00"),
  creatorEarnings: decimal("creator_earnings", { precision: 10, scale: 2 }).notNull().default("0.00"),
  platformEarnings: decimal("platform_earnings", { precision: 10, scale: 2 }).notNull().default("0.00"),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull().default("0.00"),
  ctr: decimal("ctr", { precision: 5, scale: 2 }).notNull().default("0.00"),
  cpc: decimal("cpc", { precision: 8, scale: 2 }).notNull().default("0.00"),
  cpa: decimal("cpa", { precision: 8, scale: 2 }).notNull().default("0.00"),
  roi: decimal("roi", { precision: 5, scale: 2 }).notNull().default("0.00"),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  campaignIdIdx: index("idx_video_ad_metrics_campaign_id").on(table.campaignId),
  creativeIdIdx: index("idx_video_ad_metrics_creative_id").on(table.creativeId),
  dateIdx: index("idx_video_ad_metrics_date").on(table.date),
  campaignDateIdx: index("idx_video_ad_metrics_campaign_date").on(table.campaignId, table.date),
  roiIdx: index("idx_video_ad_metrics_roi").on(table.roi),
  uniqueConstraint: uniqueIndex("uq_video_ad_metrics_campaign_creative_date").on(
    table.campaignId,
    table.creativeId,
    table.date
  ),
}));

export const insertVideoAdMetricSchema = createInsertSchema(videoAdMetrics).omit({
  id: true,
  createdAt: true,
});
export type InsertVideoAdMetric = z.infer<typeof insertVideoAdMetricSchema>;
export type VideoAdMetric = typeof videoAdMetrics.$inferSelect;

// TABLE 6: advertiser_discovery_records
export const advertiserDiscoveryRecords = pgTable("advertiser_discovery_records", {
  id: integer("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  companyWebsite: varchar("company_website", { length: 500 }).notNull(),
  companyEmail: varchar("company_email", { length: 255 }),
  companyPhone: varchar("company_phone", { length: 20 }),
  companyLogoUrl: varchar("company_logo_url", { length: 500 }),
  industry: varchar("industry", { length: 100 }).notNull(),
  companySize: varchar("company_size", { length: 50 }),
  estimatedBudget: decimal("estimated_budget", { precision: 12, scale: 2 }),
  estimatedAnnualRevenue: decimal("estimated_annual_revenue", { precision: 12, scale: 2 }),
  marketingChannels: jsonb("marketing_channels").$type<string[]>().default(sql`'[]'`),
  socialMediaPresence: jsonb("social_media_presence").$type<Record<string, any>>().default(sql`'{}'`),
  discoverySources: jsonb("discovery_sources").$type<string[]>().default(sql`'[]'`),
  contactPersonName: varchar("contact_person_name", { length: 255 }),
  contactPersonTitle: varchar("contact_person_title", { length: 255 }),
  contactPersonEmail: varchar("contact_person_email", { length: 255 }),
  contactPersonPhone: varchar("contact_person_phone", { length: 20 }),
  contactStatus: varchar("contact_status", { length: 20 }).default("discovered"),
  outreachAttempts: integer("outreach_attempts").default(0),
  lastContactDate: timestamp("last_contact_date"),
  lastContactMethod: varchar("last_contact_method", { length: 50 }),
  outreachEmailTemplate: text("outreach_email_template"),
  responseReceived: boolean("response_received").default(false),
  responseContent: text("response_content"),
  notes: text("notes"),
  aiFitScore: decimal("ai_fit_score", { precision: 5, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  companyNameIdx: index("idx_advertiser_discovery_records_company_name").on(table.companyName),
  companyWebsiteIdx: index("idx_advertiser_discovery_records_company_website").on(table.companyWebsite),
  industryIdx: index("idx_advertiser_discovery_records_industry").on(table.industry),
  contactStatusIdx: index("idx_advertiser_discovery_records_contact_status").on(table.contactStatus),
  aiFitScoreIdx: index("idx_advertiser_discovery_records_ai_fit_score").on(table.aiFitScore),
  createdAtIdx: index("idx_advertiser_discovery_records_created_at").on(table.createdAt),
}));

export const insertAdvertiserDiscoveryRecordSchema = createInsertSchema(advertiserDiscoveryRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAdvertiserDiscoveryRecord = z.infer<typeof insertAdvertiserDiscoveryRecordSchema>;
export type AdvertiserDiscoveryRecord = typeof advertiserDiscoveryRecords.$inferSelect;

// TABLE 7: creator_video_ad_earnings
export const creatorVideoAdEarnings = pgTable("creator_video_ad_earnings", {
  id: integer("id").primaryKey(),
  creatorId: varchar("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  campaignId: integer("campaign_id").references(() => videoAdCampaigns.id, { onDelete: "cascade" }).notNull(),
  videoId: varchar("video_id").references(() => videos.id, { onDelete: "cascade" }).notNull(),
  placementId: integer("placement_id").references(() => videoAdPlacements.id, { onDelete: "cascade" }).notNull(),
  creativeId: integer("creative_id").references(() => videoAdCreatives.id, { onDelete: "cascade" }).notNull(),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).notNull().default("0.00"),
  views: integer("views").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  conversionValue: decimal("conversion_value", { precision: 10, scale: 2 }).default("0.00"),
  ctr: decimal("ctr", { precision: 5, scale: 2 }).default("0.00"),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }).default("0.00"),
  payoutStatus: varchar("payout_status", { length: 20 }).default("pending"),
  payoutDate: timestamp("payout_date"),
  payoutMethod: varchar("payout_method", { length: 50 }),
  payoutAmount: decimal("payout_amount", { precision: 10, scale: 2 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  creatorIdIdx: index("idx_creator_video_ad_earnings_creator_id").on(table.creatorId),
  campaignIdIdx: index("idx_creator_video_ad_earnings_campaign_id").on(table.campaignId),
  videoIdIdx: index("idx_creator_video_ad_earnings_video_id").on(table.videoId),
  placementIdIdx: index("idx_creator_video_ad_earnings_placement_id").on(table.placementId),
  payoutStatusIdx: index("idx_creator_video_ad_earnings_payout_status").on(table.payoutStatus),
  totalEarningsIdx: index("idx_creator_video_ad_earnings_total_earnings").on(table.totalEarnings),
  createdAtIdx: index("idx_creator_video_ad_earnings_created_at").on(table.createdAt),
}));

export const insertCreatorVideoAdEarningSchema = createInsertSchema(creatorVideoAdEarnings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCreatorVideoAdEarning = z.infer<typeof insertCreatorVideoAdEarningSchema>;
export type CreatorVideoAdEarning = typeof creatorVideoAdEarnings.$inferSelect;

// TABLE 8: ad_generation_jobs
export const adGenerationJobs = pgTable("ad_generation_jobs", {
  id: integer("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => videoAdCampaigns.id, { onDelete: "cascade" }).notNull(),
  jobType: varchar("job_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("queued"),
  priority: integer("priority").default(5),
  inputData: jsonb("input_data").$type<Record<string, any>>().notNull().default(sql`'{}'`),
  outputData: jsonb("output_data").$type<Record<string, any>>().default(sql`'{}'`),
  generatedVideoUrl: varchar("generated_video_url", { length: 500 }),
  generatedScriptUrl: varchar("generated_script_url", { length: 500 }),
  generatedThumbnailUrl: varchar("generated_thumbnail_url", { length: 500 }),
  processingTime: integer("processing_time"),
  quality: varchar("quality", { length: 20 }).default("standard"),
  aiModel: varchar("ai_model", { length: 100 }).default("claude-3.5-sonnet"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  campaignIdIdx: index("idx_ad_generation_jobs_campaign_id").on(table.campaignId),
  statusIdx: index("idx_ad_generation_jobs_status").on(table.status),
  jobTypeIdx: index("idx_ad_generation_jobs_job_type").on(table.jobType),
  priorityIdx: index("idx_ad_generation_jobs_priority").on(table.priority),
  createdAtIdx: index("idx_ad_generation_jobs_created_at").on(table.createdAt),
  statusPriorityIdx: index("idx_ad_generation_jobs_status_priority").on(table.status, table.priority),
}));

export const insertAdGenerationJobSchema = createInsertSchema(adGenerationJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAdGenerationJob = z.infer<typeof insertAdGenerationJobSchema>;
export type AdGenerationJob = typeof adGenerationJobs.$inferSelect;

// ============================================================================
// TASK 1: ADVANCED ANALYTICS & MONETIZATION DASHBOARD (7 Tables)
// ============================================================================

// Daily analytics snapshot
export const dailyAnalytics = pgTable("daily_analytics", {
  id: integer("id").primaryKey(),
  date: timestamp("date").notNull().unique(),
  totalUsers: integer("total_users").notNull(),
  activeUsers: integer("active_users").notNull(),
  newUsers: integer("new_users").notNull(),
  totalGiftsSent: integer("total_gifts_sent").notNull(),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).notNull(),
  creatorEarnings: decimal("creator_earnings", { precision: 12, scale: 2 }).notNull(),
  platformEarnings: decimal("platform_earnings", { precision: 12, scale: 2 }).notNull(),
  averageGiftValue: decimal("average_gift_value", { precision: 8, scale: 2 }).notNull(),
  topSparkId: integer("top_spark_id"),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  dateIdx: index("daily_analytics_date_idx").on(table.date),
}));

export const insertDailyAnalyticsSchema = createInsertSchema(dailyAnalytics).omit({
  id: true,
  createdAt: true,
});
export type InsertDailyAnalytics = z.infer<typeof insertDailyAnalyticsSchema>;
export type DailyAnalytics = typeof dailyAnalytics.$inferSelect;

// Creator performance metrics
export const creatorMetrics = pgTable("creator_metrics", {
  id: integer("id").primaryKey(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  videoViews: integer("video_views").notNull().default(0),
  videoLikes: integer("video_likes").notNull().default(0),
  videoComments: integer("video_comments").notNull().default(0),
  videoShares: integer("video_shares").notNull().default(0),
  giftsReceived: integer("gifts_received").notNull().default(0),
  giftRevenue: decimal("gift_revenue", { precision: 10, scale: 2 }).notNull().default("0"),
  followers: integer("followers").notNull().default(0),
  followersGained: integer("followers_gained").notNull().default(0),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  creatorIdIdx: index("creator_metrics_creator_id_idx").on(table.creatorId),
  dateIdx: index("creator_metrics_date_idx").on(table.date),
}));

export const insertCreatorMetricsSchema = createInsertSchema(creatorMetrics).omit({
  id: true,
  createdAt: true,
});
export type InsertCreatorMetrics = z.infer<typeof insertCreatorMetricsSchema>;
export type CreatorMetrics = typeof creatorMetrics.$inferSelect;

// Gift analytics
export const giftAnalytics = pgTable("gift_analytics", {
  id: integer("id").primaryKey(),
  date: timestamp("date").notNull(),
  giftId: integer("gift_id").notNull(),
  giftName: varchar("gift_name", { length: 255 }).notNull(),
  sentCount: integer("sent_count").notNull().default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull().default("0"),
  creatorEarnings: decimal("creator_earnings", { precision: 10, scale: 2 }).notNull().default("0"),
  popularity: decimal("popularity", { precision: 5, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  dateIdx: index("gift_analytics_date_idx").on(table.date),
  giftIdIdx: index("gift_analytics_gift_id_idx").on(table.giftId),
}));

export const insertGiftAnalyticsSchema = createInsertSchema(giftAnalytics).omit({
  id: true,
  createdAt: true,
});
export type InsertGiftAnalytics = z.infer<typeof insertGiftAnalyticsSchema>;
export type GiftAnalytics = typeof giftAnalytics.$inferSelect;

// User engagement tracking
export const userEngagement = pgTable("user_engagement", {
  id: integer("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  sessionCount: integer("session_count").notNull().default(0),
  sessionDuration: integer("session_duration").notNull().default(0),
  videosWatched: integer("videos_watched").notNull().default(0),
  videosCreated: integer("videos_created").notNull().default(0),
  giftsReceived: integer("gifts_received").notNull().default(0),
  giftsSent: integer("gifts_sent").notNull().default(0),
  commentsPosted: integer("comments_posted").notNull().default(0),
  sharesCreated: integer("shares_created").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_engagement_user_id_idx").on(table.userId),
  dateIdx: index("user_engagement_date_idx").on(table.date),
}));

export const insertUserEngagementSchema = createInsertSchema(userEngagement).omit({
  id: true,
  createdAt: true,
});
export type InsertUserEngagement = z.infer<typeof insertUserEngagementSchema>;
export type UserEngagement = typeof userEngagement.$inferSelect;

// Revenue breakdown
export const revenueBreakdown = pgTable("revenue_breakdown", {
  id: integer("id").primaryKey(),
  date: timestamp("date").notNull(),
  subscriptionRevenue: decimal("subscription_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  giftRevenue: decimal("gift_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  adRevenue: decimal("ad_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  creatorPayouts: decimal("creator_payouts", { precision: 12, scale: 2 }).notNull().default("0"),
  platformEarnings: decimal("platform_earnings", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  dateIdx: index("revenue_breakdown_date_idx").on(table.date),
}));

export const insertRevenueBreakdownSchema = createInsertSchema(revenueBreakdown).omit({
  id: true,
  createdAt: true,
});
export type InsertRevenueBreakdown = z.infer<typeof insertRevenueBreakdownSchema>;
export type RevenueBreakdown = typeof revenueBreakdown.$inferSelect;

// Retention cohorts
export const retentionCohorts = pgTable("retention_cohorts", {
  id: integer("id").primaryKey(),
  cohortDate: timestamp("cohort_date").notNull(),
  cohortSize: integer("cohort_size").notNull(),
  day0: decimal("day_0", { precision: 5, scale: 2 }).notNull(),
  day7: decimal("day_7", { precision: 5, scale: 2 }).notNull().default("0"),
  day14: decimal("day_14", { precision: 5, scale: 2 }).notNull().default("0"),
  day30: decimal("day_30", { precision: 5, scale: 2 }).notNull().default("0"),
  day60: decimal("day_60", { precision: 5, scale: 2 }).notNull().default("0"),
  day90: decimal("day_90", { precision: 5, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  cohortDateIdx: index("retention_cohorts_cohort_date_idx").on(table.cohortDate),
}));

export const insertRetentionCohortsSchema = createInsertSchema(retentionCohorts).omit({
  id: true,
  createdAt: true,
});
export type InsertRetentionCohorts = z.infer<typeof insertRetentionCohortsSchema>;
export type RetentionCohorts = typeof retentionCohorts.$inferSelect;

// Revenue forecasting
export const revenueForecasts = pgTable("revenue_forecasts", {
  id: integer("id").primaryKey(),
  forecastDate: timestamp("forecast_date").notNull(),
  projectedRevenue: decimal("projected_revenue", { precision: 12, scale: 2 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  method: varchar("method", { length: 50 }).notNull(),
  actualRevenue: decimal("actual_revenue", { precision: 12, scale: 2 }),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  forecastDateIdx: index("revenue_forecasts_forecast_date_idx").on(table.forecastDate),
}));

export const insertRevenueForecastsSchema = createInsertSchema(revenueForecasts).omit({
  id: true,
  createdAt: true,
});
export type InsertRevenueForecasts = z.infer<typeof insertRevenueForecastsSchema>;
export type RevenueForecasts = typeof revenueForecasts.$inferSelect;

// ============================================================================
// TASK 2: AI-POWERED CONTENT MODERATION & SAFETY (5 New Tables)
// Note: contentFlags table already exists in schema
// ============================================================================

// Deepfake detection results
export const deepfakeDetection = pgTable("deepfake_detection", {
  id: integer("id").primaryKey(),
  videoId: varchar("video_id").notNull().references(() => videos.id),
  isDeepfake: boolean("is_deepfake").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  detectionMethod: varchar("detection_method", { length: 100 }).notNull(),
  flaggedRegions: jsonb("flagged_regions").default(sql`'[]'`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  videoIdIdx: index("deepfake_detection_video_id_idx").on(table.videoId),
  isDeepfakeIdx: index("deepfake_detection_is_deepfake_idx").on(table.isDeepfake),
}));

export const insertDeepfakeDetectionSchema = createInsertSchema(deepfakeDetection).omit({
  id: true,
  createdAt: true,
});
export type InsertDeepfakeDetection = z.infer<typeof insertDeepfakeDetectionSchema>;
export type DeepfakeDetection = typeof deepfakeDetection.$inferSelect;

// Consent verification
export const consentRecords = pgTable("consent_records", {
  id: integer("id").primaryKey(),
  videoId: varchar("video_id").notNull().references(() => videos.id),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  consentType: varchar("consent_type", { length: 50 }).notNull(),
  consentGiven: boolean("consent_given").notNull(),
  consentDate: timestamp("consent_date").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  videoIdIdx: index("consent_records_video_id_idx").on(table.videoId),
  creatorIdIdx: index("consent_records_creator_id_idx").on(table.creatorId),
}));

export const insertConsentRecordsSchema = createInsertSchema(consentRecords).omit({
  id: true,
  createdAt: true,
});
export type InsertConsentRecords = z.infer<typeof insertConsentRecordsSchema>;
export type ConsentRecords = typeof consentRecords.$inferSelect;

// Content watermarks
export const contentWatermarks = pgTable("content_watermarks", {
  id: integer("id").primaryKey(),
  videoId: varchar("video_id").notNull().references(() => videos.id),
  watermarkType: varchar("watermark_type", { length: 50 }).notNull(),
  watermarkData: jsonb("watermark_data").notNull(),
  watermarkUrl: varchar("watermark_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  videoIdIdx: index("content_watermarks_video_id_idx").on(table.videoId),
}));

export const insertContentWatermarksSchema = createInsertSchema(contentWatermarks).omit({
  id: true,
  createdAt: true,
});
export type InsertContentWatermarks = z.infer<typeof insertContentWatermarksSchema>;
export type ContentWatermarks = typeof contentWatermarks.$inferSelect;

// Safety reports
export const safetyReports = pgTable("safety_reports", {
  id: integer("id").primaryKey(),
  reportDate: timestamp("report_date").notNull(),
  totalVideosScanned: integer("total_videos_scanned").notNull(),
  flaggedVideos: integer("flagged_videos").notNull(),
  deepfakesDetected: integer("deepfakes_detected").notNull(),
  consentViolations: integer("consent_violations").notNull(),
  actionsTaken: integer("actions_taken").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  reportDateIdx: index("safety_reports_report_date_idx").on(table.reportDate),
}));

export const insertSafetyReportsSchema = createInsertSchema(safetyReports).omit({
  id: true,
  createdAt: true,
});
export type InsertSafetyReports = z.infer<typeof insertSafetyReportsSchema>;
export type SafetyReports = typeof safetyReports.$inferSelect;

// Moderation queue
export const moderationQueue = pgTable("moderation_queue", {
  id: integer("id").primaryKey(),
  videoId: varchar("video_id").notNull().references(() => videos.id),
  priority: integer("priority").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  assignedTo: varchar("assigned_to").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  videoIdIdx: index("moderation_queue_video_id_idx").on(table.videoId),
  statusIdx: index("moderation_queue_status_idx").on(table.status),
}));

export const insertModerationQueueSchema = createInsertSchema(moderationQueue).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertModerationQueue = z.infer<typeof insertModerationQueueSchema>;
export type ModerationQueue = typeof moderationQueue.$inferSelect;

// Blocked content
export const blockedContent = pgTable("blocked_content", {
  id: integer("id").primaryKey(),
  videoId: varchar("video_id").notNull().references(() => videos.id),
  blockReason: varchar("block_reason", { length: 255 }).notNull(),
  blockDate: timestamp("block_date").defaultNow().notNull(),
  appealable: boolean("appealable").default(true),
  appealDeadline: timestamp("appeal_deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  videoIdIdx: index("blocked_content_video_id_idx").on(table.videoId),
}));

export const insertBlockedContentSchema = createInsertSchema(blockedContent).omit({
  id: true,
  createdAt: true,
});
export type InsertBlockedContent = z.infer<typeof insertBlockedContentSchema>;
export type BlockedContent = typeof blockedContent.$inferSelect;

// User blocking (Instagram/TikTok-style)
export const blockedUsers = pgTable("blocked_users", {
  id: serial("id").primaryKey(),
  blockerId: varchar("blocker_id").notNull().references(() => users.id),
  blockedId: varchar("blocked_id").notNull().references(() => users.id),
  reason: varchar("reason", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  blockerIdIdx: index("blocked_users_blocker_id_idx").on(table.blockerId),
  blockedIdIdx: index("blocked_users_blocked_id_idx").on(table.blockedId),
  uniqueBlock: index("blocked_users_unique_idx").on(table.blockerId, table.blockedId),
}));

export const insertBlockedUserSchema = createInsertSchema(blockedUsers).omit({
  id: true,
  createdAt: true,
});
export type InsertBlockedUser = z.infer<typeof insertBlockedUserSchema>;
export type BlockedUser = typeof blockedUsers.$inferSelect;

// ============================================================================
// TASK 3: CREATOR MONETIZATION ACCELERATION PROGRAM (7 New Tables)
// Note: creatorProfiles table already exists in schema
// ============================================================================

// Creator tiers
export const creatorTiers = pgTable("creator_tiers", {
  id: integer("id").primaryKey(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  tier: varchar("tier", { length: 20 }).notNull(),
  monthlyViewsRequired: integer("monthly_views_required").notNull(),
  monthlyFollowersRequired: integer("monthly_followers_required").notNull(),
  monthlyEarningsRequired: decimal("monthly_earnings_required", { precision: 10, scale: 2 }).notNull(),
  benefits: jsonb("benefits").default(sql`'[]'`),
  earnedAt: timestamp("earned_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  creatorIdIdx: index("creator_tiers_creator_id_idx").on(table.creatorId),
}));

export const insertCreatorTiersSchema = createInsertSchema(creatorTiers).omit({
  id: true,
  createdAt: true,
});
export type InsertCreatorTiers = z.infer<typeof insertCreatorTiersSchema>;
export type CreatorTiers = typeof creatorTiers.$inferSelect;

// Creator AI credits
export const creatorAiCredits = pgTable("creator_ai_credits", {
  id: integer("id").primaryKey(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  monthlyAllowance: integer("monthly_allowance").notNull(),
  usedCredits: integer("used_credits").notNull().default(0),
  remainingCredits: integer("remaining_credits").notNull(),
  resetDate: timestamp("reset_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  creatorIdIdx: index("creator_ai_credits_creator_id_idx").on(table.creatorId),
}));

export const insertCreatorAiCreditsSchema = createInsertSchema(creatorAiCredits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCreatorAiCredits = z.infer<typeof insertCreatorAiCreditsSchema>;
export type CreatorAiCredits = typeof creatorAiCredits.$inferSelect;

// Trend predictions
export const trendPredictions = pgTable("trend_predictions", {
  id: integer("id").primaryKey(),
  trend: varchar("trend", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  growthPotential: decimal("growth_potential", { precision: 5, scale: 2 }).notNull(),
  predictedPeak: timestamp("predicted_peak").notNull(),
  relevantCreators: jsonb("relevant_creators").default(sql`'[]'`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  trendIdx: index("trend_predictions_trend_idx").on(table.trend),
  categoryIdx: index("trend_predictions_category_idx").on(table.category),
}));

export const insertTrendPredictionsSchema = createInsertSchema(trendPredictions).omit({
  id: true,
  createdAt: true,
});
export type InsertTrendPredictions = z.infer<typeof insertTrendPredictionsSchema>;
export type TrendPredictions = typeof trendPredictions.$inferSelect;

// Creator collaborations
export const creatorCollaborations = pgTable("creator_collaborations", {
  id: integer("id").primaryKey(),
  creatorId1: varchar("creator_id_1").notNull().references(() => users.id),
  creatorId2: varchar("creator_id_2").notNull().references(() => users.id),
  videoId: varchar("video_id").notNull().references(() => videos.id),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull(),
  split: jsonb("split").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  creatorId1Idx: index("creator_collaborations_creator_id_1_idx").on(table.creatorId1),
  creatorId2Idx: index("creator_collaborations_creator_id_2_idx").on(table.creatorId2),
}));

export const insertCreatorCollaborationsSchema = createInsertSchema(creatorCollaborations).omit({
  id: true,
  createdAt: true,
});
export type InsertCreatorCollaborations = z.infer<typeof insertCreatorCollaborationsSchema>;
export type CreatorCollaborations = typeof creatorCollaborations.$inferSelect;

// Creator achievements
export const creatorAchievements = pgTable("creator_achievements", {
  id: integer("id").primaryKey(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  achievement: varchar("achievement", { length: 255 }).notNull(),
  milestone: varchar("milestone", { length: 100 }).notNull(),
  unlockedAt: timestamp("unlocked_at").notNull(),
  reward: jsonb("reward").default(sql`'{}'`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  creatorIdIdx: index("creator_achievements_creator_id_idx").on(table.creatorId),
}));

export const insertCreatorAchievementsSchema = createInsertSchema(creatorAchievements).omit({
  id: true,
  createdAt: true,
});
export type InsertCreatorAchievements = z.infer<typeof insertCreatorAchievementsSchema>;
export type CreatorAchievements = typeof creatorAchievements.$inferSelect;

// Creator payouts
export const creatorPayouts = pgTable("creator_payouts", {
  id: integer("id").primaryKey(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  payoutMethod: varchar("payout_method", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  transactionId: varchar("transaction_id", { length: 255 }),
  payoutDate: timestamp("payout_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  creatorIdIdx: index("creator_payouts_creator_id_idx").on(table.creatorId),
  statusIdx: index("creator_payouts_status_idx").on(table.status),
}));

export const insertCreatorPayoutsSchema = createInsertSchema(creatorPayouts).omit({
  id: true,
  createdAt: true,
});
export type InsertCreatorPayouts = z.infer<typeof insertCreatorPayoutsSchema>;
export type CreatorPayouts = typeof creatorPayouts.$inferSelect;

// Content generation jobs
export const contentGenerationJobs = pgTable("content_generation_jobs", {
  id: integer("id").primaryKey(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  jobType: varchar("job_type", { length: 50 }).notNull(),
  prompt: text("prompt").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  generatedContent: text("generated_content"),
  creditsUsed: integer("credits_used").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  creatorIdIdx: index("content_generation_jobs_creator_id_idx").on(table.creatorId),
  statusIdx: index("content_generation_jobs_status_idx").on(table.status),
}));

export const insertContentGenerationJobsSchema = createInsertSchema(contentGenerationJobs).omit({
  id: true,
  createdAt: true,
});
export type InsertContentGenerationJobs = z.infer<typeof insertContentGenerationJobsSchema>;
export type ContentGenerationJobs = typeof contentGenerationJobs.$inferSelect;

// ==========================================
// MARKETING AUTOMATION TABLES
// ==========================================

// SEO Articles - Generated content for search rankings
export const seoArticles = pgTable("seo_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  keyword: varchar("keyword", { length: 100 }).notNull(),
  metaDescription: varchar("meta_description", { length: 160 }),
  status: varchar("status", { length: 20 }).default("draft"), // draft, published, scheduled
  publishedAt: timestamp("published_at"),
  views: integer("views").default(0),
  organicTraffic: integer("organic_traffic").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex("seo_articles_slug_idx").on(table.slug),
  keywordIdx: index("seo_articles_keyword_idx").on(table.keyword),
}));

export const insertSeoArticleSchema = createInsertSchema(seoArticles).omit({
  id: true,
  createdAt: true,
});
export type InsertSeoArticle = z.infer<typeof insertSeoArticleSchema>;
export type SeoArticle = typeof seoArticles.$inferSelect;

// Directory Submissions - Track where we've submitted
export const directorySubmissions = pgTable("directory_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  directoryName: varchar("directory_name", { length: 100 }).notNull(),
  directoryUrl: text("directory_url").notNull(),
  category: varchar("category", { length: 50 }),
  status: varchar("status", { length: 20 }).default("pending"), // pending, submitted, approved, rejected
  priority: integer("priority").default(5), // 1-10 priority
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  listingUrl: text("listing_url"), // URL of our listing once approved
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  statusIdx: index("directory_submissions_status_idx").on(table.status),
  priorityIdx: index("directory_submissions_priority_idx").on(table.priority),
}));

export const insertDirectorySubmissionSchema = createInsertSchema(directorySubmissions).omit({
  id: true,
  createdAt: true,
});
export type InsertDirectorySubmission = z.infer<typeof insertDirectorySubmissionSchema>;
export type DirectorySubmission = typeof directorySubmissions.$inferSelect;

// Backlinks - Track our backlink profile
export const backlinks = pgTable("backlinks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceDomain: varchar("source_domain", { length: 255 }).notNull(),
  sourceUrl: text("source_url").notNull(),
  targetUrl: text("target_url").notNull(),
  anchorText: varchar("anchor_text", { length: 255 }),
  backlinkType: varchar("backlink_type", { length: 50 }), // guest_post, directory, article, community, etc.
  domainAuthority: integer("domain_authority").default(0),
  status: varchar("status", { length: 20 }).default("pending"), // pending, active, lost
  discoveredAt: timestamp("discovered_at").defaultNow(),
  lostAt: timestamp("lost_at"),
}, (table) => ({
  domainIdx: index("backlinks_domain_idx").on(table.sourceDomain),
  statusIdx: index("backlinks_status_idx").on(table.status),
  daIdx: index("backlinks_da_idx").on(table.domainAuthority),
}));

export const insertBacklinkSchema = createInsertSchema(backlinks).omit({
  id: true,
  discoveredAt: true,
});
export type InsertBacklink = z.infer<typeof insertBacklinkSchema>;
export type Backlink = typeof backlinks.$inferSelect;

// Keyword Rankings - Track our search rankings
export const keywordRankings = pgTable("keyword_rankings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyword: varchar("keyword", { length: 255 }).notNull(),
  searchEngine: varchar("search_engine", { length: 20 }).notNull(), // google, bing, duckduckgo
  position: integer("position").notNull(),
  url: text("url").notNull(), // Which page is ranking
  previousPosition: integer("previous_position"),
  searchVolume: integer("search_volume").default(0),
  difficulty: integer("difficulty").default(0), // 0-100
  trackedAt: timestamp("tracked_at").defaultNow(),
}, (table) => ({
  keywordIdx: index("keyword_rankings_keyword_idx").on(table.keyword),
  engineIdx: index("keyword_rankings_engine_idx").on(table.searchEngine),
  positionIdx: index("keyword_rankings_position_idx").on(table.position),
}));

export const insertKeywordRankingSchema = createInsertSchema(keywordRankings).omit({
  id: true,
  trackedAt: true,
});
export type InsertKeywordRanking = z.infer<typeof insertKeywordRankingSchema>;
export type KeywordRanking = typeof keywordRankings.$inferSelect;

// CRM Integrations - GoHighLevel, HubSpot, Salesforce
export const crmConnections = pgTable("crm_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  provider: text("provider").notNull(), // "gohighlevel", "hubspot", "salesforce"
  status: text("status").notNull().default("active"), // "active", "disconnected", "error"
  
  // API Credentials
  apiKey: text("api_key"), // Encrypted API key
  apiSecret: text("api_secret"), // Encrypted API secret
  locationId: text("location_id"), // GHL sub-account/location ID
  
  // Webhook Configuration
  inboundWebhookUrl: text("inbound_webhook_url"), // GHL → PROFITHACK webhook URL
  outboundWebhookUrl: text("outbound_webhook_url"), // PROFITHACK → GHL webhook URL
  webhookSecret: text("webhook_secret"), // For signature verification
  
  // Sync Settings
  config: jsonb("config").$type<{
    syncLeads?: boolean;
    syncContacts?: boolean;
    syncOpportunities?: boolean;
    syncTags?: boolean;
    autoCreateContacts?: boolean;
    defaultTags?: string[];
    pipelineId?: string;
    customFieldMappings?: Record<string, string>;
  }>(),
  
  // Stats
  totalSynced: integer("total_synced").notNull().default(0),
  lastSyncedAt: timestamp("last_synced_at"),
  lastError: text("last_error"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCrmConnectionSchema = createInsertSchema(crmConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCrmConnection = z.infer<typeof insertCrmConnectionSchema>;
export type CrmConnection = typeof crmConnections.$inferSelect;

// CRM Sync Log - Track every sync operation
export const crmSyncLogs = pgTable("crm_sync_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  connectionId: varchar("connection_id").references(() => crmConnections.id, { onDelete: "cascade" }).notNull(),
  
  direction: text("direction").notNull(), // "inbound" (GHL → PROFITHACK) or "outbound" (PROFITHACK → GHL)
  eventType: text("event_type").notNull(), // "contact.created", "lead.updated", "opportunity.created", etc.
  
  status: text("status").notNull(), // "success", "failed", "pending"
  errorMessage: text("error_message"),
  
  // Data payload
  payload: jsonb("payload"),
  response: jsonb("response"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCrmSyncLogSchema = createInsertSchema(crmSyncLogs).omit({
  id: true,
  createdAt: true,
});
export type InsertCrmSyncLog = z.infer<typeof insertCrmSyncLogSchema>;
export type CrmSyncLog = typeof crmSyncLogs.$inferSelect;

// Signup Verifications - Email confirmation before account creation (PDF spec)
export const signupVerifications = pgTable("signup_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  dateOfBirth: timestamp("date_of_birth"), // Age verification (18+)
  inviteCode: varchar("invite_code", { length: 12 }).notNull(),  // 12 characters for PROFITHACK
  verificationToken: varchar("verification_token", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'verified', 'expired'
  createdAt: timestamp("created_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertSignupVerificationSchema = createInsertSchema(signupVerifications).omit({
  id: true,
  createdAt: true,
});
export type InsertSignupVerification = z.infer<typeof insertSignupVerificationSchema>;
export type SignupVerification = typeof signupVerifications.$inferSelect;

// ==========================================
// DAILY ENGAGEMENT SYSTEM (TikTok-Beating)
// Psychology-Driven Retention Mechanics
// 8 Tables | 40%+ Higher Retention vs TikTok
// ==========================================

// 1. Daily Nexus - Main engagement tracking
export const dailyNexus = pgTable("daily_nexus", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  streak: integer("streak").notNull().default(0),
  totalRewards: integer("total_rewards").notNull().default(0),
  todayRewards: integer("today_rewards").notNull().default(0),
  nextClaimTime: integer("next_claim_time"), // Unix timestamp in milliseconds
  multiplier: decimal("multiplier", { precision: 3, scale: 1 }).notNull().default("1.0"), // 1.0x to 5.0x
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  lastClaimedAt: timestamp("last_claimed_at"),
  streakBrokenAt: timestamp("streak_broken_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("daily_nexus_user_id_idx").on(table.userId),
  streakIdx: index("daily_nexus_streak_idx").on(table.streak),
  nextClaimIdx: index("daily_nexus_next_claim_idx").on(table.nextClaimTime),
  totalRewardsIdx: index("daily_nexus_total_rewards_idx").on(table.totalRewards),
  levelIdx: index("daily_nexus_level_idx").on(table.level),
  updatedAtIdx: index("daily_nexus_updated_at_idx").on(table.updatedAt),
}));

export const insertDailyNexusSchema = createInsertSchema(dailyNexus).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDailyNexus = z.infer<typeof insertDailyNexusSchema>;
export type DailyNexus = typeof dailyNexus.$inferSelect;

// 2. Daily Challenges - Track user progress on daily challenges
export const dailyChallenges = pgTable("daily_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeId: varchar("challenge_id", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 10 }),
  progress: integer("progress").notNull().default(0),
  maxProgress: integer("max_progress").notNull(),
  reward: integer("reward").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("daily_challenges_user_id_idx").on(table.userId),
  expiresAtIdx: index("daily_challenges_expires_at_idx").on(table.expiresAt),
  completedIdx: index("daily_challenges_completed_idx").on(table.completed),
  userExpiresIdx: index("daily_challenges_user_expires_idx").on(table.userId, table.expiresAt),
  uniqueUserChallenge: uniqueIndex("unique_user_challenge").on(table.userId, table.challengeId),
}));

export const insertDailyChallengesSchema = createInsertSchema(dailyChallenges).omit({
  id: true,
  createdAt: true,
});
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengesSchema>;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;

// 3. Daily Bonuses - Track active bonuses (time-based, social, etc)
export const dailyBonuses = pgTable("daily_bonuses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bonusType: varchar("bonus_type", { length: 50 }).notNull(), // morning, evening, social, challenge
  multiplier: decimal("multiplier", { precision: 3, scale: 1 }).notNull(),
  reason: varchar("reason", { length: 255 }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("daily_bonuses_user_id_idx").on(table.userId),
  expiresAtIdx: index("daily_bonuses_expires_at_idx").on(table.expiresAt),
  userExpiresIdx: index("daily_bonuses_user_expires_idx").on(table.userId, table.expiresAt),
  bonusTypeIdx: index("daily_bonuses_bonus_type_idx").on(table.bonusType),
}));

export const insertDailyBonusesSchema = createInsertSchema(dailyBonuses).omit({
  id: true,
  createdAt: true,
});
export type InsertDailyBonus = z.infer<typeof insertDailyBonusesSchema>;
export type DailyBonus = typeof dailyBonuses.$inferSelect;

// 4. Reward History - Complete history of all rewards claimed
export const rewardHistory = pgTable("reward_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rewardType: varchar("reward_type", { length: 50 }).notNull(), // daily, challenge, bonus
  amount: integer("amount").notNull(),
  multiplier: decimal("multiplier", { precision: 3, scale: 1 }).notNull().default("1.0"),
  streakAtClaim: integer("streak_at_claim").notNull().default(0),
  rarity: varchar("rarity", { length: 50 }), // common, rare, epic, legendary, mythic
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("reward_history_user_id_idx").on(table.userId),
  claimedAtIdx: index("reward_history_claimed_at_idx").on(table.claimedAt),
  userClaimedIdx: index("reward_history_user_claimed_idx").on(table.userId, table.claimedAt),
  rewardTypeIdx: index("reward_history_reward_type_idx").on(table.rewardType),
  rarityIdx: index("reward_history_rarity_idx").on(table.rarity),
}));

export const insertRewardHistorySchema = createInsertSchema(rewardHistory).omit({
  id: true,
  claimedAt: true,
});
export type InsertRewardHistory = z.infer<typeof insertRewardHistorySchema>;
export type RewardHistory = typeof rewardHistory.$inferSelect;

// 5. Engagement Predictions - ML predictions for rewards
export const engagementPredictions = pgTable("engagement_predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  predictedReward: integer("predicted_reward").notNull(),
  predictedRarity: varchar("predicted_rarity", { length: 50 }),
  predictionConfidence: decimal("prediction_confidence", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("engagement_predictions_user_id_idx").on(table.userId),
  createdAtIdx: index("engagement_predictions_created_at_idx").on(table.createdAt),
  confidenceIdx: index("engagement_predictions_confidence_idx").on(table.predictionConfidence),
}));

export const insertEngagementPredictionsSchema = createInsertSchema(engagementPredictions).omit({
  id: true,
  createdAt: true,
});
export type InsertEngagementPrediction = z.infer<typeof insertEngagementPredictionsSchema>;
export type EngagementPrediction = typeof engagementPredictions.$inferSelect;

// 6. User Daily Engagement - Daily aggregated statistics per user
export const userDailyEngagement = pgTable("user_daily_engagement", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  claimsCount: integer("claims_count").notNull().default(0),
  totalEarned: integer("total_earned").notNull().default(0),
  challengesCompleted: integer("challenges_completed").notNull().default(0),
  streakMaintained: boolean("streak_maintained").notNull().default(false),
  engagementScore: integer("engagement_score").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_daily_engagement_user_id_idx").on(table.userId),
  dateIdx: index("user_daily_engagement_date_idx").on(table.date),
  userDateIdx: index("user_daily_engagement_user_date_idx").on(table.userId, table.date),
  engagementScoreIdx: index("user_daily_engagement_score_idx").on(table.engagementScore),
  uniqueUserDate: uniqueIndex("unique_user_daily_date").on(table.userId, table.date),
}));

export const insertUserDailyEngagementSchema = createInsertSchema(userDailyEngagement).omit({
  id: true,
  createdAt: true,
});
export type InsertUserDailyEngagement = z.infer<typeof insertUserDailyEngagementSchema>;
export type UserDailyEngagement = typeof userDailyEngagement.$inferSelect;

// 7. Leaderboard Cache - Materialized leaderboard for fast queries
export const leaderboardCache = pgTable("leaderboard_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 255 }),
  avatarUrl: text("avatar_url"),
  currentStreak: integer("current_streak"),
  totalRewards: integer("total_rewards"),
  leaderboardPoints: integer("leaderboard_points"),
  period: varchar("period", { length: 50 }), // daily, weekly, monthly
  rank: integer("rank"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("leaderboard_cache_user_id_idx").on(table.userId),
  periodRankIdx: index("leaderboard_cache_period_rank_idx").on(table.period, table.rank),
  pointsIdx: index("leaderboard_cache_points_idx").on(table.leaderboardPoints),
  streakIdx: index("leaderboard_cache_streak_idx").on(table.currentStreak),
  updatedAtIdx: index("leaderboard_cache_updated_at_idx").on(table.updatedAt),
}));

export const insertLeaderboardCacheSchema = createInsertSchema(leaderboardCache).omit({
  id: true,
  updatedAt: true,
});
export type InsertLeaderboardCache = z.infer<typeof insertLeaderboardCacheSchema>;
export type LeaderboardCache = typeof leaderboardCache.$inferSelect;

// 8. Daily Monetization - Track premium purchases for daily system
export const dailyMonetization = pgTable("daily_monetization", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(), // streak_protection, multiplier_boost, bonus_coins, premium_pass
  productName: varchar("product_name", { length: 255 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, completed, failed, refunded
  stripeTransactionId: varchar("stripe_transaction_id", { length: 255 }),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("daily_monetization_user_id_idx").on(table.userId),
  purchasedAtIdx: index("daily_monetization_purchased_at_idx").on(table.purchasedAt),
  statusIdx: index("daily_monetization_status_idx").on(table.status),
  transactionTypeIdx: index("daily_monetization_transaction_type_idx").on(table.transactionType),
  stripeIdIdx: index("daily_monetization_stripe_id_idx").on(table.stripeTransactionId),
}));

export const insertDailyMonetizationSchema = createInsertSchema(dailyMonetization).omit({
  id: true,
  createdAt: true,
  purchasedAt: true,
});
export type InsertDailyMonetization = z.infer<typeof insertDailyMonetizationSchema>;
export type DailyMonetization = typeof dailyMonetization.$inferSelect;

// ============================================
// CRM SYSTEM TABLES
// ============================================

export const crmPosts = pgTable("crm_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  platforms: jsonb("platforms").notNull().default(sql`'[]'::jsonb`),
  content: jsonb("content").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("crm_posts_user_id_idx").on(table.userId),
  statusIdx: index("crm_posts_status_idx").on(table.status),
  scheduledAtIdx: index("crm_posts_scheduled_at_idx").on(table.scheduledAt),
}));

export const insertCrmPostsSchema = createInsertSchema(crmPosts).omit({
  id: true,
  createdAt: true,
});
export type InsertCrmPost = z.infer<typeof insertCrmPostsSchema>;
export type CrmPost = typeof crmPosts.$inferSelect;

export const crmAnalytics = pgTable("crm_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 100 }).notNull(),
  postId: varchar("post_id"),
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull().default("0"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("crm_analytics_user_id_idx").on(table.userId),
  platformIdx: index("crm_analytics_platform_idx").on(table.platform),
  dateIdx: index("crm_analytics_date_idx").on(table.date),
}));

export const insertCrmAnalyticsSchema = createInsertSchema(crmAnalytics).omit({
  id: true,
  createdAt: true,
});
export type InsertCrmAnalytics = z.infer<typeof insertCrmAnalyticsSchema>;
export type CrmAnalytics = typeof crmAnalytics.$inferSelect;

// ============================================
// ONLYFANS EXPERT CREATORS
// ============================================

// ============================================
// RESERVED USERNAMES & BRAND PROTECTION
// ============================================

// Reserved Usernames - Block PROFITHACKAI and variations for promos/charity
export const reservedUsernames = pgTable("reserved_usernames", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 100 }).notNull().unique(),
  reservedFor: varchar("reserved_for", { length: 255 }).notNull(), // "promo", "charity", "founder", "brand"
  description: text("description"), // Why it's reserved
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("reserved_usernames_username_idx").on(table.username),
  index("reserved_usernames_reserved_for_idx").on(table.reservedFor),
]);

export const insertReservedUsernameSchema = createInsertSchema(reservedUsernames).omit({
  id: true,
  createdAt: true,
});
export type InsertReservedUsername = z.infer<typeof insertReservedUsernameSchema>;
export type ReservedUsername = typeof reservedUsernames.$inferSelect;

// Brand Verifications - Verify brands/personalities with official ID
export const brandVerifications = pgTable("brand_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  brandName: varchar("brand_name", { length: 255 }).notNull(),
  officialId: varchar("official_id", { length: 255 }), // Government ID, Business Registration, etc.
  idDocumentUrl: varchar("id_document_url"), // Uploaded ID document
  websiteUrl: varchar("website_url"),
  socialProofUrls: text("social_proof_urls").array(), // Official social media links
  status: brandVerificationStatusEnum("status").notNull().default("pending"),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("brand_verifications_user_idx").on(table.userId),
  index("brand_verifications_status_idx").on(table.status),
]);

export const insertBrandVerificationSchema = createInsertSchema(brandVerifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBrandVerification = z.infer<typeof insertBrandVerificationSchema>;
export type BrandVerification = typeof brandVerifications.$inferSelect;

// Charity Donations - Collect donations from all options + premium usernames
export const charityDonations = pgTable("charity_donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }), // Null if anonymous
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  donationType: varchar("donation_type", { length: 100 }).notNull(), // "direct", "username_purchase", "battle_entry", "gift_roundup"
  sourceTransaction: varchar("source_transaction"), // Link to username purchase, battle, etc.
  donorName: varchar("donor_name", { length: 255 }), // For public recognition (optional)
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  message: text("message"), // Optional message with donation
  paymentProvider: paymentProviderEnum("payment_provider"),
  transactionId: varchar("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("charity_donations_user_idx").on(table.userId),
  index("charity_donations_type_idx").on(table.donationType),
  index("charity_donations_created_idx").on(table.createdAt),
]);

export const insertCharityDonationSchema = createInsertSchema(charityDonations).omit({
  id: true,
  createdAt: true,
});
export type InsertCharityDonation = z.infer<typeof insertCharityDonationSchema>;
export type CharityDonation = typeof charityDonations.$inferSelect;

// ============================================
// ONLYFANS EXPERT CREATORS
// ============================================

export const onlyfansExperts = pgTable("onlyfans_experts", {
  id: varchar("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  handle: varchar("handle", { length: 255 }).notNull().unique(),
  ethnicity: varchar("ethnicity", { length: 100 }),
  beautyProfile: jsonb("beauty_profile").notNull(),
  businessProfile: jsonb("business_profile").notNull(),
  onlyfansExpertise: jsonb("onlyfans_expertise").notNull(),
  contentStrategy: jsonb("content_strategy").notNull(),
  marketingStrategy: jsonb("marketing_strategy").notNull(),
  advancedKnowledge: jsonb("advanced_knowledge").notNull(),
  performanceMetrics: jsonb("performance_metrics").notNull(),
  bio: text("bio").notNull(),
  personality: text("personality").notNull(),
  uniqueValueProposition: text("unique_value_proposition").notNull(),
  targetAudience: text("target_audience").notNull(),
  brandStory: text("brand_story").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  handleIdx: index("onlyfans_experts_handle_idx").on(table.handle),
  activeIdx: index("onlyfans_experts_active_idx").on(table.isActive),
}));

export const insertOnlyfansExpertsSchema = createInsertSchema(onlyfansExperts).omit({
  createdAt: true,
});
export type InsertOnlyfansExpert = z.infer<typeof insertOnlyfansExpertsSchema>;
export type OnlyfansExpert = typeof onlyfansExperts.$inferSelect;
