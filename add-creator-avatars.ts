/**
 * PROFITHACK AI - Add Avatar Images to OnlyFans Experts
 */

import { db } from "../db";
import { onlyfansExperts } from "@shared/schema";
import { eq } from "drizzle-orm";

// Map creator IDs to their generated avatar images
const CREATOR_AVATARS: Record<string, string> = {
  "expert_creator_1": "/attached_assets/generated_images/brinley_vyx_luxury_creator.png", // Brinley Vyx
  "expert_creator_2": "/attached_assets/generated_images/ayla_vibes_urban_creator.png", // Ayla Vibes
  "expert_creator_3": "/attached_assets/generated_images/kaia_flux_edgy_creator.png", // Kaia Flux
  "expert_creator_4": "/attached_assets/generated_images/zane_pulse_male_creator.png", // Zane Pulse
  "expert_creator_5": "/attached_assets/generated_images/ember_rise_authentic_creator.png", // Ember Rise
  "expert_creator_6": "/attached_assets/generated_images/luna_rose_elegant_creator.png", // Luna Rose
};

export async function addCreatorAvatars() {
  try {
    console.log("🎨 Adding avatar images to OnlyFans experts...");
    
    for (const [expertId, avatarUrl] of Object.entries(CREATOR_AVATARS)) {
      await db
        .update(onlyfansExperts)
        .set({ 
          beautyProfile: db.raw(`
            CASE 
              WHEN beauty_profile IS NOT NULL 
              THEN jsonb_set(
                beauty_profile::jsonb, 
                '{avatarUrl}', 
                to_jsonb('${avatarUrl}'::text)
              )
              ELSE '{}'::jsonb
            END
          `) as any,
        })
        .where(eq(onlyfansExperts.id, expertId));
      
      console.log(`✅ Added avatar for ${expertId}`);
    }
    
    console.log("✅ All avatars added successfully!");
    return { success: true, count: Object.keys(CREATOR_AVATARS).length };
  } catch (error) {
    console.error("❌ Error adding avatars:", error);
    return { success: false, error: String(error) };
  }
}
