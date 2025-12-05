import { db } from "./db";
import { reservedUsernames } from "@shared/schema";

// PROFITHACKAI brand protection - Block all variations for promos/charity
const RESERVED_USERNAMES = [
  // Core brand names
  { username: "profithack", reservedFor: "brand", description: "Core brand name" },
  { username: "profithackai", reservedFor: "brand", description: "Core brand name with AI" },
  { username: "profit_hack", reservedFor: "brand", description: "Brand variation with underscore" },
  { username: "profit_hack_ai", reservedFor: "brand", description: "Brand variation with underscores" },
  { username: "profithack_ai", reservedFor: "brand", description: "Brand variation" },
  
  // Official accounts
  { username: "profithackofficial", reservedFor: "brand", description: "Official account" },
  { username: "profithackai_official", reservedFor: "brand", description: "Official AI account" },
  { username: "official_profithack", reservedFor: "brand", description: "Official account variation" },
  
  // Promo accounts
  { username: "profithack_promo", reservedFor: "promo", description: "Main promo account" },
  { username: "profithack_giveaway", reservedFor: "promo", description: "Giveaway account" },
  { username: "profithack_deals", reservedFor: "promo", description: "Deals and offers" },
  { username: "profithack_launch", reservedFor: "promo", description: "Launch promotions" },
  { username: "profithack_50off", reservedFor: "promo", description: "Launch discount promo" },
  { username: "profithack_launch50", reservedFor: "promo", description: "Launch discount variation" },
  
  // Charity accounts
  { username: "profithack_charity", reservedFor: "charity", description: "Main charity account" },
  { username: "profithack_foundation", reservedFor: "charity", description: "Foundation account" },
  { username: "profithack_gives", reservedFor: "charity", description: "Giving program" },
  { username: "profithack_impact", reservedFor: "charity", description: "Social impact" },
  { username: "profithack_kids", reservedFor: "charity", description: "Children's program" },
  { username: "profithack_education", reservedFor: "charity", description: "Education program" },
  { username: "profithack_poverty", reservedFor: "charity", description: "Poverty relief" },
  
  // Founder account
  { username: "profithack_founder", reservedFor: "founder", description: "Founder account" },
  { username: "profithack_ceo", reservedFor: "founder", description: "CEO account" },
  { username: "profithack_team", reservedFor: "founder", description: "Team account" },
  
  // Support & Service
  { username: "profithack_support", reservedFor: "brand", description: "Customer support" },
  { username: "profithack_help", reservedFor: "brand", description: "Help center" },
  { username: "profithack_admin", reservedFor: "brand", description: "Admin account" },
  { username: "profithack_moderator", reservedFor: "brand", description: "Moderation team" },
  { username: "profithack_security", reservedFor: "brand", description: "Security team" },
  
  // Premium variations
  { username: "profithackvip", reservedFor: "promo", description: "VIP program" },
  { username: "profithack_elite", reservedFor: "promo", description: "Elite tier" },
  { username: "profithack_pro", reservedFor: "promo", description: "Pro tier" },
  { username: "profithack_premium", reservedFor: "promo", description: "Premium tier" },
  
  // Geographic/Regional
  { username: "profithack_global", reservedFor: "brand", description: "Global operations" },
  { username: "profithack_us", reservedFor: "brand", description: "US region" },
  { username: "profithack_uk", reservedFor: "brand", description: "UK region" },
  { username: "profithack_eu", reservedFor: "brand", description: "EU region" },
  { username: "profithack_asia", reservedFor: "brand", description: "Asia region" },
  
  // Community
  { username: "profithack_community", reservedFor: "brand", description: "Community account" },
  { username: "profithack_creators", reservedFor: "brand", description: "Creator community" },
  { username: "profithack_news", reservedFor: "brand", description: "News and updates" },
  { username: "profithack_blog", reservedFor: "brand", description: "Blog content" },
  
  // Prevent impersonation
  { username: "the_profithack", reservedFor: "brand", description: "Prevent impersonation" },
  { username: "real_profithack", reservedFor: "brand", description: "Prevent impersonation" },
  { username: "profithackapp", reservedFor: "brand", description: "App name variant" },
  { username: "profithack_app", reservedFor: "brand", description: "App name variant" },
];

export async function seedReservedUsernames() {
  console.log("🔒 Seeding reserved usernames for PROFITHACKAI brand protection...");
  
  try {
    // Check how many already exist
    const existing = await db.select().from(reservedUsernames);
    
    if (existing.length >= RESERVED_USERNAMES.length) {
      console.log(`✅ Already have ${existing.length} reserved usernames`);
      return;
    }
    
    // Insert all reserved usernames
    let inserted = 0;
    for (const reserved of RESERVED_USERNAMES) {
      try {
        await db.insert(reservedUsernames).values(reserved);
        inserted++;
      } catch (error: any) {
        // Ignore duplicates
        if (!error.message?.includes('unique')) {
          console.error(`Failed to reserve @${reserved.username}:`, error.message);
        }
      }
    }
    
    console.log(`✅ Reserved ${inserted} new usernames for PROFITHACKAI brand`);
    console.log(`   Total reserved: ${RESERVED_USERNAMES.length} usernames`);
    console.log(`   
    Breakdown:
      - Brand protection: ${RESERVED_USERNAMES.filter(u => u.reservedFor === 'brand').length} usernames
      - Promo campaigns: ${RESERVED_USERNAMES.filter(u => u.reservedFor === 'promo').length} usernames
      - Charity programs: ${RESERVED_USERNAMES.filter(u => u.reservedFor === 'charity').length} usernames
      - Founder access: ${RESERVED_USERNAMES.filter(u => u.reservedFor === 'founder').length} usernames
    `);
  } catch (error) {
    console.error("❌ Failed to seed reserved usernames:", error);
    throw error;
  }
}

// Run if called directly
seedReservedUsernames().then(() => {
  console.log("✅ Reserved usernames seeding complete!");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
