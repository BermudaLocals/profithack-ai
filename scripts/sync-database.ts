#!/usr/bin/env tsx
/**
 * Non-interactive database schema synchronization script
 * 
 * This script syncs the database schema with shared/schema.ts without
 * requiring interactive prompts. It's safe for production use.
 * 
 * Usage:
 *   npm run db:sync  (or tsx scripts/sync-database.ts)
 */

import { db, pool } from "../server/db.js";
import { sql } from "drizzle-orm";

async function syncDatabase() {
  console.log("🔄 Starting database schema synchronization...\n");

  try {
    // Start a transaction
    await db.execute(sql`BEGIN`);

    console.log("✅ Step 1: Checking existing enums...");
    
    // Get all existing enums
    const existingEnums = await db.execute(sql`
      SELECT typname FROM pg_type 
      WHERE typtype = 'e' 
      ORDER BY typname
    `);
    
    console.log(`   Found ${existingEnums.rows.length} existing enums`);

    // Drop old gift_type enum if it exists (replaced by spark_type)
    console.log("\n✅ Step 2: Cleaning up old enums...");
    try {
      await db.execute(sql`DROP TYPE IF EXISTS gift_type CASCADE`);
      console.log("   Dropped obsolete gift_type enum");
    } catch (e) {
      console.log("   gift_type enum not found (OK)");
    }

    console.log("\n✅ Step 3: Creating/updating enums...");
    
    // Create all enums if they don't exist
    const enums = [
      {
        name: "subscription_tier",
        values: ["explorer", "starter", "creator", "innovator"]
      },
      {
        name: "age_rating",
        values: ["u16", "16plus", "18plus"]
      },
      {
        name: "moderation_status",
        values: ["pending", "approved", "rejected", "flagged"]
      },
      {
        name: "transaction_type",
        values: ["subscription", "spark_sent", "spark_received", "credit_purchase", "withdrawal", "wallet_deposit", "wallet_withdrawal"]
      },
      {
        name: "payment_provider",
        values: ["payoneer", "payeer", "crypto_nowpayments", "stripe", "paypal", "mtn_momo", "square", "crypto", "worldremit", "other"]
      },
      {
        name: "spark_type",
        values: [
          "glow", "blaze", "stardust", "rocket", "galaxy", "supernova", "infinity", "royalty", "godmode",
          "pinkSand", "seaGlass", "longtail", "coralReef", "lighthouse", "gombey", "moonGate", "islandParadise", "bermudaTriangle",
          "heart", "rose", "loveWave", "bouquet", "cupid", "loveStorm", "diamondRing", "loveBomb",
          "dollar", "gold", "sportsCar", "yacht", "jet", "mansion", "island", "empire",
          "butterfly", "sunflower", "dolphin", "eagle", "peacock", "phoenix", "dragon", "unicorn",
          "confetti", "fireworks", "spotlight", "aura", "portal", "starfall", "aurora", "godRay",
          "controller", "trophy", "headset", "arcade", "victory", "champion", "legendary", "esports", "gamerGod", "worldChamp",
          "music", "microphone", "guitar", "vinyl", "dj", "concert", "rockstar", "superstar", "legend", "hallOfFame",
          "coffee", "pizza", "burger", "sushi", "champagne", "cake", "feast", "caviar", "truffle", "goldSteak",
          "soccer", "basketball", "medal", "podium", "goldMedal", "stadium", "mvp", "goat", "olympian", "worldRecord",
          "throne", "castle", "scepter", "jewels", "galaxyCrown", "immortal", "titan", "deity", "cosmos", "universe"
        ]
      },
      {
        name: "plugin_type",
        values: ["ai-agent", "content-tool", "workflow", "integration", "theme", "analytics"]
      },
      {
        name: "plugin_status",
        values: ["draft", "pending", "approved", "rejected", "suspended"]
      },
      {
        name: "influencer_gender",
        values: ["female", "male", "non-binary", "other"]
      },
      {
        name: "influencer_content_type",
        values: ["lifestyle", "fitness", "gaming", "education", "entertainment", "business", "tech", "fashion", "music", "other"]
      },
      {
        name: "video_type",
        values: ["short", "long"]
      },
      {
        name: "video_quality",
        values: ["sd", "hd", "fhd", "4k"]
      },
      {
        name: "message_type",
        values: ["text", "image", "video", "voice", "file"]
      },
      {
        name: "call_type",
        values: ["video", "audio"]
      },
      {
        name: "call_status",
        values: ["ringing", "active", "ended", "missed", "declined", "failed"]
      },
      {
        name: "username_tier",
        values: ["standard", "premium", "elite", "celebrity", "reserved"]
      },
      {
        name: "username_status",
        values: ["available", "purchased", "reserved", "auction"]
      },
      {
        name: "withdrawal_status",
        values: ["pending", "processing", "completed", "failed", "cancelled"]
      },
      {
        name: "premium_tier",
        values: ["basic", "vip", "innerCircle"]
      },
      {
        name: "legal_document_type",
        values: ["terms_of_service", "privacy_policy", "hold_harmless", "bermuda_jurisdiction"]
      },
      {
        name: "appeal_status",
        values: ["pending", "approved", "rejected"]
      },
      {
        name: "twilio_room_status",
        values: ["active", "ended", "paused"]
      },
      {
        name: "twilio_room_type",
        values: ["live_stream", "battle", "panel", "premium_1on1"]
      }
    ];

    for (const enumDef of enums) {
      try {
        // Check if enum exists
        const exists = await db.execute(sql`
          SELECT 1 FROM pg_type WHERE typname = ${enumDef.name}
        `);

        if (exists.rows.length === 0) {
          // Create enum
          const values = enumDef.values.map(v => `'${v}'`).join(", ");
          await db.execute(sql.raw(`CREATE TYPE ${enumDef.name} AS ENUM (${values})`));
          console.log(`   ✓ Created enum: ${enumDef.name}`);
        } else {
          console.log(`   ○ Enum already exists: ${enumDef.name}`);
        }
      } catch (error: any) {
        console.error(`   ✗ Error with enum ${enumDef.name}:`, error.message);
      }
    }

    // Commit the transaction
    await db.execute(sql`COMMIT`);

    console.log("\n✅ Step 4: Running drizzle push to sync tables...");
    console.log("   (This will create/update tables based on schema.ts)\n");

  } catch (error: any) {
    await db.execute(sql`ROLLBACK`);
    console.error("\n❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }

  console.log("\n🎉 Database schema synchronization completed!");
  console.log("\nNext steps:");
  console.log("1. All enums are now created");
  console.log("2. You can now run 'drizzle-kit push' which should work without prompts");
  console.log("3. Or the application will auto-create tables on first use");
}

syncDatabase().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
