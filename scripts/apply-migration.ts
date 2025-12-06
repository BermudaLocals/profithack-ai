#!/usr/bin/env tsx
/**
 * Apply database migration without enum recreation
 * 
 * This script applies the migration file but skips enum creation since
 * they already exist in the database.
 */

import { db, pool } from "../server/db.js";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function applyMigration() {
  console.log("🔄 Applying database migration...\n");

  try {
    // Read the migration file without enums
    const migrationPath = path.join(process.cwd(), "migrations", "0000_talented_spencer_smythe_no_enums.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    console.log("✅ Step 1: Reading migration file...");
    console.log(`   Found migration file: ${migrationPath}`);

    // Split by statement breakpoint
    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`   Found ${statements.length} SQL statements to execute\n`);

    console.log("✅ Step 2: Executing migration statements...");
    
    let executed = 0;
    let skipped = 0;
    let failed = 0;

    for (const statement of statements) {
      try {
        await db.execute(sql.raw(statement));
        executed++;
        process.stdout.write(`\r   Progress: ${executed + skipped + failed}/${statements.length} (✓ ${executed}, ○ ${skipped}, ✗ ${failed})`);
      } catch (error: any) {
        // Skip if table/index already exists
        if (error.code === "42P07" || error.code === "42710" || error.message?.includes("already exists")) {
          skipped++;
          process.stdout.write(`\r   Progress: ${executed + skipped + failed}/${statements.length} (✓ ${executed}, ○ ${skipped}, ✗ ${failed})`);
        } else {
          failed++;
          console.error(`\n   ✗ Error executing statement:`, error.message);
          console.error(`   Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }

    console.log(`\n\n✅ Migration completed:`);
    console.log(`   ✓ Successfully executed: ${executed} statements`);
    console.log(`   ○ Skipped (already exists): ${skipped} statements`);
    console.log(`   ✗ Failed: ${failed} statements`);

    if (failed > 0) {
      console.warn("\n⚠️  Some statements failed. Check logs above for details.");
    }

  } catch (error: any) {
    console.error("\n❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }

  console.log("\n🎉 Database migration process completed!");
}

applyMigration().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
