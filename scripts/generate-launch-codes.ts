import { db } from "../server/db";
import { inviteCodes } from "../shared/schema";

// Generate 100 invite codes for PROFITHACK AI launch
async function generateLaunchCodes() {
  const codes: string[] = [];
  const PLATFORM_ADMIN_ID = "00000000-0000-0000-0000-000000000000"; // System-generated codes
  
  function generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  console.log("🚀 Generating 100 invite codes for PROFITHACK AI launch...\n");
  
  for (let i = 0; i < 100; i++) {
    const code = generateCode();
    
    try {
      await db.insert(inviteCodes).values({
        code,
        creatorId: PLATFORM_ADMIN_ID,
        isUsed: false,
      });
      
      codes.push(code);
      console.log(`✅ ${i + 1}. ${code}`);
    } catch (error) {
      console.error(`❌ Failed to generate code ${i + 1}:`, error);
    }
  }

  console.log(`\n🎉 Successfully generated ${codes.length} invite codes!`);
  console.log("\n📋 Copy these codes to share with early users:");
  console.log("\n" + codes.join("\n"));
  
  process.exit(0);
}

generateLaunchCodes().catch(console.error);
