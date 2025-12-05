#!/usr/bin/env tsx
import { db, pool } from "../server/db.js";
import { inviteCodes } from "../shared/schema.js";
import * as fs from "fs";

async function loadCodes() {
  try {
    const codesContent = fs.readFileSync("INVITE_CODES.txt", "utf-8");
    const codes = codesContent.trim().split("\n").filter(c => c.length === 12);
    
    console.log(`📥 Loading ${codes.length} invite codes into database...`);
    
    let inserted = 0;
    for (const code of codes) {
      try {
        await db.insert(inviteCodes).values({
          code: code,
          creatorId: "system-platform",
          isUsed: false,
        }).onConflictDoNothing();
        inserted++;
        if (inserted % 100 === 0) {
          console.log(`   Inserted ${inserted}/${codes.length}...`);
        }
      } catch (error) {
        // Skip duplicates
      }
    }
    
    console.log(`\n✅ Successfully loaded ${inserted} invite codes!`);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error loading codes:", error);
    await pool.end();
    process.exit(1);
  }
}

loadCodes();
