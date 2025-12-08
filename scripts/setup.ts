#!/usr/bin/env tsx
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

console.log(`
╔══════════════════════════════════════════════════════════════╗
║           ROFITHACK AI - Setup Script                        ║
║           Production-Ready Bootstrapper                      ║
╚══════════════════════════════════════════════════════════════╝
`);

interface SetupConfig {
  fullSourceUrl?: string;
  skipDbPush?: boolean;
  skipTsConvert?: boolean;
}

async function downloadAndExtract(url: string, destDir: string): Promise<void> {
  console.log(`📥 Downloading full source from: ${url}`);
  
  const tempZip = path.join(destDir, "temp_source.zip");
  
  try {
    execSync(`curl -L -o "${tempZip}" "${url}"`, { stdio: "inherit" });
    
    if (fs.existsSync(tempZip)) {
      console.log("📦 Extracting source code...");
      execSync(`unzip -o "${tempZip}" -d "${destDir}"`, { stdio: "inherit" });
      fs.unlinkSync(tempZip);
      console.log("✅ Source code extracted successfully");
    }
  } catch (error) {
    console.warn("⚠️ Could not download full source - using bootstrap files");
  }
}

async function runDatabaseMigrations(): Promise<void> {
  console.log("\n📊 Running database migrations...");
  
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL not set - skipping migrations");
    return;
  }
  
  try {
    execSync("npm run db:push", { cwd: ROOT, stdio: "inherit" });
    console.log("✅ Database migrations complete");
  } catch (error) {
    console.error("❌ Database migration failed:", error);
    console.log("   You can run 'npm run db:push' manually after fixing the issue");
  }
}

async function convertToTypeScript(): Promise<void> {
  console.log("\n🔄 Checking for JavaScript files to convert...");
  
  try {
    execSync("npm run convert-ts", { cwd: ROOT, stdio: "inherit" });
  } catch (error) {
    console.log("ℹ️ TypeScript conversion skipped or not needed");
  }
}

async function verifySetup(): Promise<void> {
  console.log("\n🔍 Verifying setup...");
  
  const requiredFiles = [
    "server/index.ts",
    "server/db.ts",
    "server/shared/schema.ts",
    "client/src/App.tsx",
    "package.json",
  ];
  
  let allPresent = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(ROOT, file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✓ ${file}`);
    } else {
      console.log(`   ✗ ${file} (missing)`);
      allPresent = false;
    }
  }
  
  if (allPresent) {
    console.log("\n✅ All required files present");
  } else {
    console.log("\n⚠️ Some files are missing - app may run in limited mode");
  }
}

async function createEnvIfMissing(): Promise<void> {
  const envPath = path.join(ROOT, ".env");
  const envExamplePath = path.join(ROOT, ".env.example");
  
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log("\n📝 Creating .env from .env.example...");
    fs.copyFileSync(envExamplePath, envPath);
    console.log("   Remember to update .env with your actual values!");
  }
}

async function main(): Promise<void> {
  const config: SetupConfig = {
    fullSourceUrl: process.env.FULL_SOURCE_URL,
    skipDbPush: process.env.SKIP_DB_PUSH === "true",
    skipTsConvert: process.env.SKIP_TS_CONVERT === "true",
  };
  
  console.log("🚀 Starting setup...\n");
  
  if (config.fullSourceUrl) {
    await downloadAndExtract(config.fullSourceUrl, ROOT);
  } else {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  ⚠️  IMPORTANT: FULL_SOURCE_URL NOT SET                      ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  This is a minimal bootstrapper. To deploy the full app:     ║
║                                                              ║
║  1. Host your complete ROFITHACK source ZIP somewhere        ║
║     (GitHub Releases, S3, etc.)                              ║
║                                                              ║
║  2. Set FULL_SOURCE_URL in your .env file:                   ║
║     FULL_SOURCE_URL=https://your-host.com/source.zip         ║
║                                                              ║
║  3. Run setup again: npm run setup                           ║
║                                                              ║
║  The app will run in DEMO MODE with limited functionality    ║
║  until the full source is loaded.                            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
  }
  
  await createEnvIfMissing();
  
  if (!config.skipDbPush) {
    await runDatabaseMigrations();
  }
  
  if (!config.skipTsConvert) {
    await convertToTypeScript();
  }
  
  await verifySetup();
  
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    ✅ SETUP COMPLETE!                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Next steps:                                                 ║
║                                                              ║
║  1. Configure your .env file with:                           ║
║     - DATABASE_URL (PostgreSQL)                              ║
║     - UPSTASH_REDIS_URL (Redis cache)                        ║
║     - Payment API keys (Stripe, PayPal, etc.)                ║
║                                                              ║
║  2. Start the application:                                   ║
║     npm start                                                ║
║                                                              ║
║  3. For development:                                         ║
║     npm run dev                                              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
}

main().catch((error) => {
  console.error("❌ Setup failed:", error);
  process.exit(1);
});
