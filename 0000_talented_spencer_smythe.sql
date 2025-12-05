CREATE TYPE "public"."age_rating" AS ENUM('u16', '16plus', '18plus');--> statement-breakpoint
CREATE TYPE "public"."appeal_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."call_status" AS ENUM('ringing', 'active', 'ended', 'missed', 'declined', 'failed');--> statement-breakpoint
CREATE TYPE "public"."call_type" AS ENUM('video', 'audio');--> statement-breakpoint
CREATE TYPE "public"."influencer_content_type" AS ENUM('lifestyle', 'fitness', 'gaming', 'education', 'entertainment', 'business', 'tech', 'fashion', 'music', 'other');--> statement-breakpoint
CREATE TYPE "public"."influencer_gender" AS ENUM('female', 'male', 'non-binary', 'other');--> statement-breakpoint
CREATE TYPE "public"."legal_document_type" AS ENUM('terms_of_service', 'privacy_policy', 'hold_harmless', 'bermuda_jurisdiction');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'image', 'video', 'voice', 'file');--> statement-breakpoint
CREATE TYPE "public"."moderation_status" AS ENUM('pending', 'approved', 'rejected', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('payoneer', 'payeer', 'crypto_nowpayments', 'stripe', 'paypal', 'mtn_momo', 'square', 'crypto', 'worldremit', 'other');--> statement-breakpoint
CREATE TYPE "public"."plugin_status" AS ENUM('draft', 'pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."plugin_type" AS ENUM('ai-agent', 'content-tool', 'workflow', 'integration', 'theme', 'analytics');--> statement-breakpoint
CREATE TYPE "public"."premium_tier" AS ENUM('basic', 'vip', 'innerCircle');--> statement-breakpoint
CREATE TYPE "public"."spark_type" AS ENUM('glow', 'blaze', 'stardust', 'rocket', 'galaxy', 'supernova', 'infinity', 'royalty', 'godmode', 'pinkSand', 'seaGlass', 'longtail', 'coralReef', 'lighthouse', 'gombey', 'moonGate', 'islandParadise', 'bermudaTriangle', 'heart', 'rose', 'loveWave', 'bouquet', 'cupid', 'loveStorm', 'diamondRing', 'loveBomb', 'dollar', 'gold', 'sportsCar', 'yacht', 'jet', 'mansion', 'island', 'empire', 'butterfly', 'sunflower', 'dolphin', 'eagle', 'peacock', 'phoenix', 'dragon', 'unicorn', 'confetti', 'fireworks', 'spotlight', 'aura', 'portal', 'starfall', 'aurora', 'godRay', 'controller', 'trophy', 'headset', 'arcade', 'victory', 'champion', 'legendary', 'esports', 'gamerGod', 'worldChamp', 'music', 'microphone', 'guitar', 'vinyl', 'dj', 'concert', 'rockstar', 'superstar', 'legend', 'hallOfFame', 'coffee', 'pizza', 'burger', 'sushi', 'champagne', 'cake', 'feast', 'caviar', 'truffle', 'goldSteak', 'soccer', 'basketball', 'medal', 'podium', 'goldMedal', 'stadium', 'mvp', 'goat', 'olympian', 'worldRecord', 'throne', 'castle', 'scepter', 'jewels', 'galaxyCrown', 'immortal', 'titan', 'deity', 'cosmos', 'universe');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('explorer', 'starter', 'creator', 'innovator');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('subscription', 'spark_sent', 'spark_received', 'credit_purchase', 'withdrawal', 'wallet_deposit', 'wallet_withdrawal');--> statement-breakpoint
CREATE TYPE "public"."twilio_room_status" AS ENUM('active', 'ended', 'paused');--> statement-breakpoint
CREATE TYPE "public"."twilio_room_type" AS ENUM('live_stream', 'battle', 'panel', 'premium_1on1');--> statement-breakpoint
CREATE TYPE "public"."username_status" AS ENUM('available', 'purchased', 'reserved', 'auction');--> statement-breakpoint
CREATE TYPE "public"."username_tier" AS ENUM('standard', 'premium', 'elite', 'celebrity', 'reserved');--> statement-breakpoint
CREATE TYPE "public"."video_quality" AS ENUM('sd', 'hd', 'fhd', '4k');--> statement-breakpoint
CREATE TYPE "public"."video_type" AS ENUM('short', 'long');--> statement-breakpoint
CREATE TYPE "public"."withdrawal_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "affiliate_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"code" varchar(12) NOT NULL,
	"total_referrals" integer DEFAULT 0 NOT NULL,
	"total_earnings" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "affiliate_codes_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "affiliate_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "affiliate_referrals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"affiliate_code_id" varchar NOT NULL,
	"affiliate_user_id" varchar NOT NULL,
	"referred_user_id" varchar NOT NULL,
	"subscription_tier" "subscription_tier" NOT NULL,
	"commission" integer DEFAULT 250 NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_influencer_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"influencer_id" varchar NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"auto_renew" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_influencer_videos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"influencer_id" varchar NOT NULL,
	"title" text NOT NULL,
	"prompt" text NOT NULL,
	"video_url" varchar,
	"thumbnail_url" varchar,
	"duration" integer,
	"sora_job_id" varchar,
	"generation_cost" integer,
	"generation_status" varchar DEFAULT 'pending',
	"view_count" integer DEFAULT 0 NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"spark_count" integer DEFAULT 0 NOT NULL,
	"is_exclusive" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ai_influencers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"name" text NOT NULL,
	"slug" varchar NOT NULL,
	"bio" text,
	"personality" text NOT NULL,
	"gender" "influencer_gender" NOT NULL,
	"content_type" "influencer_content_type" NOT NULL,
	"avatar_url" varchar,
	"appearance_prompt" text,
	"voice_id" varchar,
	"voice_settings" jsonb DEFAULT '{}'::jsonb,
	"subscription_price" integer DEFAULT 0,
	"is_public" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"subscriber_count" integer DEFAULT 0 NOT NULL,
	"video_count" integer DEFAULT 0 NOT NULL,
	"total_earnings" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ai_influencers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "call_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"call_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"joined_at" timestamp,
	"left_at" timestamp,
	"was_answered" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "call_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"call_type" "call_type" NOT NULL,
	"status" "call_status" DEFAULT 'ringing' NOT NULL,
	"initiator_id" varchar NOT NULL,
	"conversation_id" varchar,
	"started_at" timestamp,
	"ended_at" timestamp,
	"duration" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_flags" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" varchar NOT NULL,
	"video_id" varchar,
	"reason" text NOT NULL,
	"status" "moderation_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversation_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"image_url" varchar,
	"is_group" boolean DEFAULT false NOT NULL,
	"creator_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "creator_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"is_premium_creator" boolean DEFAULT false NOT NULL,
	"basic_tier_enabled" boolean DEFAULT true NOT NULL,
	"basic_tier_price" integer DEFAULT 999 NOT NULL,
	"vip_tier_enabled" boolean DEFAULT false NOT NULL,
	"vip_tier_price" integer DEFAULT 2999,
	"inner_circle_tier_enabled" boolean DEFAULT false NOT NULL,
	"inner_circle_tier_price" integer DEFAULT 9999,
	"subscriber_count" integer DEFAULT 0 NOT NULL,
	"monthly_earnings" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "creator_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" varchar NOT NULL,
	"following_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invite_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(12) NOT NULL,
	"creator_id" varchar NOT NULL,
	"used_by" varchar,
	"is_used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "invite_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" varchar NOT NULL,
	"sender_id" varchar NOT NULL,
	"receiver_id" varchar,
	"message_type" "message_type" DEFAULT 'text' NOT NULL,
	"content" text NOT NULL,
	"media_url" varchar,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "phone_verifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plugin_installs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"plugin_id" varchar NOT NULL,
	"version" varchar NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"installed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plugin_reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plugin_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plugin_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"plugin_id" varchar NOT NULL,
	"author_id" varchar NOT NULL,
	"amount" integer NOT NULL,
	"author_share" integer NOT NULL,
	"platform_fee" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plugins" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"author_id" varchar NOT NULL,
	"version" varchar DEFAULT '1.0.0' NOT NULL,
	"type" "plugin_type" NOT NULL,
	"manifest" jsonb NOT NULL,
	"status" "plugin_status" DEFAULT 'draft' NOT NULL,
	"downloads" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0 NOT NULL,
	"price" integer DEFAULT 0,
	"pricing_model" varchar DEFAULT 'free',
	"icon_url" varchar,
	"screenshot_urls" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "plugins_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "premium_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscriber_id" varchar NOT NULL,
	"creator_id" varchar NOT NULL,
	"tier" "premium_tier" DEFAULT 'basic' NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"amount_cents" integer NOT NULL,
	"next_billing_date" timestamp NOT NULL,
	"last_billing_date" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "premium_usernames" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar NOT NULL,
	"tier" "username_tier" NOT NULL,
	"status" "username_status" DEFAULT 'available' NOT NULL,
	"price_credits" integer NOT NULL,
	"owner_id" varchar,
	"description" text,
	"tags" text[],
	"purchased_at" timestamp,
	"auction_end_date" timestamp,
	"current_bid_credits" integer,
	"current_bidder_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "premium_usernames_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "private_session_viewers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"viewer_id" varchar NOT NULL,
	"credits_spent" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "private_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" varchar NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"credits_per_minute" integer NOT NULL,
	"viewer_count" integer DEFAULT 0 NOT NULL,
	"total_earnings_credits" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"language" varchar NOT NULL,
	"files" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"deployment_url" varchar,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sparks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" varchar NOT NULL,
	"receiver_id" varchar NOT NULL,
	"video_id" varchar,
	"spark_type" "spark_type" NOT NULL,
	"credit_cost" integer NOT NULL,
	"creator_earnings" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tier" "subscription_tier" NOT NULL,
	"status" varchar NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "toy_control_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" varchar NOT NULL,
	"viewer_id" varchar NOT NULL,
	"spark_type" "spark_type" NOT NULL,
	"intensity" integer DEFAULT 5 NOT NULL,
	"duration_seconds" integer DEFAULT 5 NOT NULL,
	"credits_spent" integer NOT NULL,
	"triggered_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"description" text,
	"reference_id" varchar,
	"payment_provider" "payment_provider",
	"provider_transaction_id" varchar,
	"provider_metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "twilio_room_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"twilio_participant_sid" varchar NOT NULL,
	"role" varchar(50) DEFAULT 'viewer' NOT NULL,
	"credits_spent" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp,
	"total_duration" integer
);
--> statement-breakpoint
CREATE TABLE "twilio_video_rooms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"twilio_room_sid" varchar NOT NULL,
	"room_type" "twilio_room_type" NOT NULL,
	"status" "twilio_room_status" DEFAULT 'active' NOT NULL,
	"title" varchar(200),
	"description" text,
	"host_id" varchar NOT NULL,
	"co_host_id" varchar,
	"max_participants" integer DEFAULT 20 NOT NULL,
	"viewer_count" integer DEFAULT 0 NOT NULL,
	"credits_per_minute" integer,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"duration" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "twilio_video_rooms_twilio_room_sid_unique" UNIQUE("twilio_room_sid")
);
--> statement-breakpoint
CREATE TABLE "user_invites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inviter_id" varchar NOT NULL,
	"invitee_id" varchar NOT NULL,
	"invite_code_id" varchar NOT NULL,
	"bonus_credits_awarded" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_legal_agreements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"email" varchar NOT NULL,
	"date_of_birth" timestamp NOT NULL,
	"age_at_signup" integer NOT NULL,
	"tos_version" varchar DEFAULT 'v1.0-BMU' NOT NULL,
	"privacy_policy_version" varchar DEFAULT 'v1.0-BMU' NOT NULL,
	"hold_harmless_version" varchar DEFAULT 'v1.0-BMU' NOT NULL,
	"timestamp_utc" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar NOT NULL,
	"user_agent" text NOT NULL,
	"geographic_location" jsonb,
	"checkbox_age_confirmed" boolean DEFAULT true NOT NULL,
	"checkbox_tos" boolean DEFAULT true NOT NULL,
	"checkbox_privacy" boolean DEFAULT true NOT NULL,
	"checkbox_hold_harmless" boolean DEFAULT true NOT NULL,
	"checkbox_liability_waiver" boolean DEFAULT true NOT NULL,
	"checkbox_bermuda_jurisdiction" boolean DEFAULT true NOT NULL,
	"checkbox_electronic_signature" boolean DEFAULT true NOT NULL,
	"electronic_signature_hash" varchar(64) NOT NULL,
	"bermuda_jurisdiction_accepted" boolean DEFAULT true NOT NULL,
	"signup_completed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_storage" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"used_bytes" integer DEFAULT 0 NOT NULL,
	"video_count" integer DEFAULT 0 NOT NULL,
	"message_media_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_storage_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_strikes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"reason" text NOT NULL,
	"strike_reason" text,
	"issued_by" varchar NOT NULL,
	"auto_moderated" boolean DEFAULT false NOT NULL,
	"content_type" varchar,
	"content_id" varchar,
	"severity" varchar,
	"categories" text[],
	"appeal_status" "appeal_status",
	"appeal_reason" text,
	"appeal_reviewed_by" varchar,
	"appeal_reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "username_purchases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username_id" varchar NOT NULL,
	"buyer_id" varchar NOT NULL,
	"seller_id" varchar,
	"price_credits" integer NOT NULL,
	"payment_provider" "payment_provider" NOT NULL,
	"transaction_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"username" varchar,
	"bio" text,
	"date_of_birth" timestamp,
	"phone_number" varchar,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"subscription_tier" "subscription_tier" DEFAULT 'explorer' NOT NULL,
	"credits" integer DEFAULT 0 NOT NULL,
	"wallet_balance" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"age_verified" boolean DEFAULT false NOT NULL,
	"age_rating" "age_rating" DEFAULT 'u16' NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"strike_count" integer DEFAULT 0 NOT NULL,
	"follower_count" integer DEFAULT 0 NOT NULL,
	"following_count" integer DEFAULT 0 NOT NULL,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"paypal_customer_id" varchar,
	"paypal_subscription_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "video_comments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"parent_comment_id" varchar,
	"like_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "video_likes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "video_views" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"watch_duration" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"video_url" varchar NOT NULL,
	"thumbnail_url" varchar,
	"duration" integer,
	"video_type" "video_type" DEFAULT 'short' NOT NULL,
	"quality" "video_quality" DEFAULT 'hd' NOT NULL,
	"hashtags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"category" varchar,
	"is_public" boolean DEFAULT true NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"required_tier" "premium_tier",
	"age_rating" "age_rating" DEFAULT 'u16' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"total_watch_time" integer DEFAULT 0 NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"spark_count" integer DEFAULT 0 NOT NULL,
	"moderation_status" "moderation_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "withdrawal_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"net_amount" numeric(10, 2) NOT NULL,
	"payment_provider" "payment_provider" NOT NULL,
	"momo_phone_number" varchar,
	"status" "withdrawal_status" DEFAULT 'pending' NOT NULL,
	"provider_transaction_id" varchar,
	"provider_response" jsonb,
	"failure_reason" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "affiliate_codes" ADD CONSTRAINT "affiliate_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_affiliate_code_id_affiliate_codes_id_fk" FOREIGN KEY ("affiliate_code_id") REFERENCES "public"."affiliate_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_affiliate_user_id_users_id_fk" FOREIGN KEY ("affiliate_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_referred_user_id_users_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_influencer_subscriptions" ADD CONSTRAINT "ai_influencer_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_influencer_subscriptions" ADD CONSTRAINT "ai_influencer_subscriptions_influencer_id_ai_influencers_id_fk" FOREIGN KEY ("influencer_id") REFERENCES "public"."ai_influencers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_influencer_videos" ADD CONSTRAINT "ai_influencer_videos_influencer_id_ai_influencers_id_fk" FOREIGN KEY ("influencer_id") REFERENCES "public"."ai_influencers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_influencers" ADD CONSTRAINT "ai_influencers_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_participants" ADD CONSTRAINT "call_participants_call_id_call_sessions_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."call_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_participants" ADD CONSTRAINT "call_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_initiator_id_users_id_fk" FOREIGN KEY ("initiator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_flags" ADD CONSTRAINT "content_flags_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_flags" ADD CONSTRAINT "content_flags_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_flags" ADD CONSTRAINT "content_flags_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_used_by_users_id_fk" FOREIGN KEY ("used_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plugin_installs" ADD CONSTRAINT "plugin_installs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plugin_installs" ADD CONSTRAINT "plugin_installs_plugin_id_plugins_id_fk" FOREIGN KEY ("plugin_id") REFERENCES "public"."plugins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plugin_reviews" ADD CONSTRAINT "plugin_reviews_plugin_id_plugins_id_fk" FOREIGN KEY ("plugin_id") REFERENCES "public"."plugins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plugin_reviews" ADD CONSTRAINT "plugin_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plugin_transactions" ADD CONSTRAINT "plugin_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plugin_transactions" ADD CONSTRAINT "plugin_transactions_plugin_id_plugins_id_fk" FOREIGN KEY ("plugin_id") REFERENCES "public"."plugins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plugin_transactions" ADD CONSTRAINT "plugin_transactions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plugins" ADD CONSTRAINT "plugins_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "premium_subscriptions" ADD CONSTRAINT "premium_subscriptions_subscriber_id_users_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "premium_subscriptions" ADD CONSTRAINT "premium_subscriptions_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "premium_usernames" ADD CONSTRAINT "premium_usernames_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "premium_usernames" ADD CONSTRAINT "premium_usernames_current_bidder_id_users_id_fk" FOREIGN KEY ("current_bidder_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "private_session_viewers" ADD CONSTRAINT "private_session_viewers_session_id_private_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."private_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "private_session_viewers" ADD CONSTRAINT "private_session_viewers_viewer_id_users_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "private_sessions" ADD CONSTRAINT "private_sessions_model_id_users_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sparks" ADD CONSTRAINT "sparks_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sparks" ADD CONSTRAINT "sparks_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sparks" ADD CONSTRAINT "sparks_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toy_control_events" ADD CONSTRAINT "toy_control_events_model_id_users_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toy_control_events" ADD CONSTRAINT "toy_control_events_viewer_id_users_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "twilio_room_participants" ADD CONSTRAINT "twilio_room_participants_room_id_twilio_video_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."twilio_video_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "twilio_room_participants" ADD CONSTRAINT "twilio_room_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "twilio_video_rooms" ADD CONSTRAINT "twilio_video_rooms_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "twilio_video_rooms" ADD CONSTRAINT "twilio_video_rooms_co_host_id_users_id_fk" FOREIGN KEY ("co_host_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_invitee_id_users_id_fk" FOREIGN KEY ("invitee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_invite_code_id_invite_codes_id_fk" FOREIGN KEY ("invite_code_id") REFERENCES "public"."invite_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_legal_agreements" ADD CONSTRAINT "user_legal_agreements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_storage" ADD CONSTRAINT "user_storage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_strikes" ADD CONSTRAINT "user_strikes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_strikes" ADD CONSTRAINT "user_strikes_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_strikes" ADD CONSTRAINT "user_strikes_appeal_reviewed_by_users_id_fk" FOREIGN KEY ("appeal_reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "username_purchases" ADD CONSTRAINT "username_purchases_username_id_premium_usernames_id_fk" FOREIGN KEY ("username_id") REFERENCES "public"."premium_usernames"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "username_purchases" ADD CONSTRAINT "username_purchases_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "username_purchases" ADD CONSTRAINT "username_purchases_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_comments" ADD CONSTRAINT "video_comments_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_comments" ADD CONSTRAINT "video_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_likes" ADD CONSTRAINT "video_likes_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_likes" ADD CONSTRAINT "video_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_views" ADD CONSTRAINT "video_views_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_views" ADD CONSTRAINT "video_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_call_participants_call" ON "call_participants" USING btree ("call_id");--> statement-breakpoint
CREATE INDEX "idx_call_participants_user" ON "call_participants" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_call_participants_unique" ON "call_participants" USING btree ("call_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_conversation_members_conv" ON "conversation_members" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_conversation_members_user" ON "conversation_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_conversation_members_unique" ON "conversation_members" USING btree ("conversation_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_follow" ON "follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX "follower_idx" ON "follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "following_idx" ON "follows" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "idx_phone_verifications_phone" ON "phone_verifications" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "idx_phone_verifications_created" ON "phone_verifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_premium_subs_subscriber" ON "premium_subscriptions" USING btree ("subscriber_id");--> statement-breakpoint
CREATE INDEX "idx_premium_subs_creator" ON "premium_subscriptions" USING btree ("creator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_premium_subs_unique" ON "premium_subscriptions" USING btree ("subscriber_id","creator_id");--> statement-breakpoint
CREATE INDEX "idx_premium_usernames_username" ON "premium_usernames" USING btree ("username");--> statement-breakpoint
CREATE INDEX "idx_premium_usernames_status" ON "premium_usernames" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_premium_usernames_tier" ON "premium_usernames" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "idx_private_viewers_session" ON "private_session_viewers" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_private_viewers_viewer" ON "private_session_viewers" USING btree ("viewer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_private_viewers_unique" ON "private_session_viewers" USING btree ("session_id","viewer_id");--> statement-breakpoint
CREATE INDEX "idx_private_sessions_model" ON "private_sessions" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_private_sessions_status" ON "private_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "idx_toy_events_model" ON "toy_control_events" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_toy_events_viewer" ON "toy_control_events" USING btree ("viewer_id");--> statement-breakpoint
CREATE INDEX "idx_twilio_participants_room" ON "twilio_room_participants" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "idx_twilio_participants_user" ON "twilio_room_participants" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_twilio_participants_unique" ON "twilio_room_participants" USING btree ("room_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_twilio_rooms_host" ON "twilio_video_rooms" USING btree ("host_id");--> statement-breakpoint
CREATE INDEX "idx_twilio_rooms_status" ON "twilio_video_rooms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_twilio_rooms_type" ON "twilio_video_rooms" USING btree ("room_type");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_twilio_rooms_sid" ON "twilio_video_rooms" USING btree ("twilio_room_sid");--> statement-breakpoint
CREATE INDEX "idx_legal_agreements_user" ON "user_legal_agreements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_legal_agreements_timestamp" ON "user_legal_agreements" USING btree ("timestamp_utc");--> statement-breakpoint
CREATE INDEX "idx_video_likes_video" ON "video_likes" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "idx_video_likes_user" ON "video_likes" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_video_likes_unique" ON "video_likes" USING btree ("video_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_video_views_video" ON "video_views" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "idx_video_views_user" ON "video_views" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_video_views_unique" ON "video_views" USING btree ("video_id","user_id");