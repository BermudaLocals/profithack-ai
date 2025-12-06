# Database Migration Guide

## Overview

This guide documents the non-interactive database migration process for ProfitHack AI. The solution addresses the issue where `drizzle-kit push` gets stuck on interactive prompts during schema synchronization.

## Problem Statement

- `npm run db:push` (drizzle-kit push) requires interactive confirmation for enum creation/renaming
- Production deployments cannot handle interactive prompts
- Database schema needs to be synced automatically with `shared/schema.ts`

## Solution

We've created two custom scripts that handle database migrations non-interactively:

### 1. Enum Synchronization Script
**File:** `scripts/sync-database.ts`

This script creates all PostgreSQL enums required by the schema without prompts.

```bash
tsx scripts/sync-database.ts
```

**What it does:**
- Drops obsolete enums (e.g., `gift_type` → `spark_type`)
- Creates all 23 required enums if they don't exist
- Handles existing enums gracefully (no errors)
- Runs in a transaction for safety

### 2. Migration Application Script
**File:** `scripts/apply-migration.ts`

This script applies generated migrations while handling existing tables/columns.

```bash
tsx scripts/apply-migration.ts
```

**What it does:**
- Reads generated migration SQL from `migrations/` directory
- Executes SQL statements one by one
- Skips already existing tables/indexes (no errors)
- Reports progress and statistics

## Deployment Process

### For Development

Run these commands in sequence:

```bash
# Step 1: Ensure all enums exist
tsx scripts/sync-database.ts

# Step 2: Generate migration files (if schema changed)
npx drizzle-kit generate

# Step 3: Remove enum creation from migration file
sed '1,23d' migrations/0000_*.sql > migrations/0000_*_no_enums.sql

# Step 4: Apply migration
tsx scripts/apply-migration.ts
```

### For Production

**Option 1: Automated Pipeline (Recommended)**

Add this to your CI/CD deployment script:

```bash
#!/bin/bash
set -e

echo "🔄 Running database migrations..."

# Sync enums
tsx scripts/sync-database.ts

# Generate migrations (if needed)
# npx drizzle-kit generate

# Apply migrations
tsx scripts/apply-migration.ts

echo "✅ Database migration completed!"
```

**Option 2: Manual Deployment**

1. SSH into production server
2. Pull latest code
3. Run sync script: `tsx scripts/sync-database.ts`
4. Run migration script: `tsx scripts/apply-migration.ts`
5. Verify tables exist: `npm run db:verify` (if available)

## Database Schema

### Current Tables (42 total)

✅ All tables from `shared/schema.ts` are created:

- `users` - User accounts and authentication
- `sessions` - Session management (Replit Auth)
- `invite_codes` - Invite system
- `phone_verifications` - SMS OTP verification
- `subscriptions` - Platform subscriptions
- `creator_profiles` - Premium creator settings
- `premium_subscriptions` - User→Creator subscriptions
- `private_sessions` - Cam-style private shows
- `private_session_viewers` - Pay-per-minute viewers
- `toy_control_events` - Lovense integration
- `premium_usernames` - Username marketplace
- `videos` - Video content
- `video_likes`, `video_views`, `video_comments` - Video engagement
- `sparks` - Virtual gifts (50 types)
- `messages`, `conversations`, `conversation_members` - Messaging
- `call_sessions`, `call_participants` - Audio/video calls
- `twilio_video_rooms`, `twilio_room_participants` - Live streaming
- `ai_influencers`, `ai_influencer_videos`, `ai_influencer_subscriptions` - AI influencers
- `plugins`, `plugin_installs`, `plugin_reviews`, `plugin_transactions` - Plugin marketplace
- `projects` - User workspaces
- `user_storage` - File storage
- `transactions` - Financial transactions
- `withdrawal_requests` - Creator payouts
- `content_flags` - Content moderation
- `user_strikes` - Community guidelines enforcement
- `user_legal_agreements` - Terms acceptance
- `affiliate_codes`, `affiliate_referrals` - Referral system
- `username_purchases` - Premium username sales
- `follows` - Social connections
- `user_invites` - User invitations

### Current Enums (23 total)

✅ All enums are created with correct values:

- `subscription_tier` (4 values) - explorer, starter, creator, innovator
- `age_rating` (3 values) - u16, 16plus, 18plus
- `moderation_status` (4 values) - pending, approved, rejected, flagged
- `transaction_type` (7 values) - subscription, spark_sent, spark_received, etc.
- `payment_provider` (10 values) - payoneer, payeer, stripe, paypal, etc.
- `spark_type` (100 values) - 50 different virtual gifts
- `plugin_type` (6 values) - ai-agent, content-tool, workflow, etc.
- `plugin_status` (5 values) - draft, pending, approved, rejected, suspended
- `influencer_gender` (4 values) - female, male, non-binary, other
- `influencer_content_type` (10 values) - lifestyle, fitness, gaming, etc.
- `video_type` (2 values) - short, long
- `video_quality` (4 values) - sd, hd, fhd, 4k
- `message_type` (5 values) - text, image, video, voice, file
- `call_type` (2 values) - video, audio
- `call_status` (6 values) - ringing, active, ended, missed, etc.
- `username_tier` (5 values) - standard, premium, elite, celebrity, reserved
- `username_status` (4 values) - available, purchased, reserved, auction
- `withdrawal_status` (5 values) - pending, processing, completed, etc.
- `premium_tier` (3 values) - basic, vip, innerCircle
- `legal_document_type` (4 values) - terms_of_service, privacy_policy, etc.
- `appeal_status` (3 values) - pending, approved, rejected
- `twilio_room_status` (3 values) - active, ended, paused
- `twilio_room_type` (4 values) - live_stream, battle, panel, premium_1on1

## Troubleshooting

### Issue: Migration fails with "type already exists"

**Solution:** Run `tsx scripts/sync-database.ts` first to handle enum creation separately.

### Issue: Migration fails with "relation already exists"

**Solution:** This is expected. The `apply-migration.ts` script skips existing tables automatically.

### Issue: New columns not added to existing tables

**Solution:** 
1. Run `npx drizzle-kit generate` to create a new migration
2. Edit the migration file to remove enum creation lines
3. Run `tsx scripts/apply-migration.ts`

### Issue: Need to verify database state

**Solution:** Check tables and enums:

```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- List all enums
SELECT enumtypid::regtype AS enum_name, COUNT(*) as value_count
FROM pg_enum
GROUP BY enumtypid::regtype
ORDER BY enum_name;

-- Test invite_codes table
SELECT * FROM invite_codes LIMIT 1;
```

## Migration History

- **2025-10-26:** Initial migration setup
  - Created 42 tables
  - Created 23 enums
  - Migrated from `gift_type` → `spark_type` enum
  - Added Twilio video room tables

## Schema Updates

When updating `shared/schema.ts`:

1. **Adding a new table:**
   ```bash
   npx drizzle-kit generate
   sed '1,23d' migrations/XXXX_*.sql > migrations/XXXX_*_no_enums.sql
   tsx scripts/apply-migration.ts
   ```

2. **Adding a new enum:**
   - Update `scripts/sync-database.ts` to include the new enum
   - Run `tsx scripts/sync-database.ts`
   - Follow step 1 above for table creation

3. **Adding a new column to existing table:**
   - Same as adding a new table (drizzle-kit generate handles it)

4. **Renaming a column/table:**
   - Use drizzle-kit's interactive mode in development
   - For production, create a custom migration script

## Replit Database Environment

- Database: PostgreSQL (Neon-backed)
- Connection: Managed via `DATABASE_URL` environment variable
- ORM: Drizzle ORM
- Migration tool: Drizzle Kit + Custom scripts

## Safety Features

1. ✅ **Transaction support** - Enum sync runs in transaction
2. ✅ **Idempotent** - Scripts can be run multiple times safely
3. ✅ **Error handling** - Gracefully skips existing objects
4. ✅ **Progress reporting** - Shows real-time migration progress
5. ✅ **Non-interactive** - No prompts, suitable for CI/CD

## Quick Reference

```bash
# Full migration process (development)
tsx scripts/sync-database.ts && \
npx drizzle-kit generate && \
sed '1,23d' migrations/$(ls -t migrations/*.sql | head -1) > migrations/$(ls -t migrations/*.sql | head -1 | sed 's/.sql/_no_enums.sql/') && \
tsx scripts/apply-migration.ts

# Verify database
psql $DATABASE_URL -c "\dt"  # List tables
psql $DATABASE_URL -c "\dT+" # List enums

# Emergency: Reset and rebuild (CAUTION: Data loss!)
# DO NOT USE IN PRODUCTION
tsx scripts/sync-database.ts && tsx scripts/apply-migration.ts
```

## Support

For migration issues:
1. Check logs from migration scripts
2. Verify DATABASE_URL environment variable
3. Check PostgreSQL connection permissions
4. Review Drizzle Kit version compatibility

---

**Last Updated:** 2025-10-26  
**Version:** 1.0.0  
**Maintained by:** ProfitHack AI Development Team
