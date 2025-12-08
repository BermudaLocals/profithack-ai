#!/usr/bin/env tsx
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

console.log("📦 Asset Download Script");
console.log("========================\n");

interface AssetConfig {
  url: string;
  destination: string;
  type: "zip" | "file" | "git";
}

const ASSET_SOURCES: AssetConfig[] = [
  {
    url: process.env.FULL_SOURCE_URL || "",
    destination: "./",
    type: "zip",
  },
];

async function downloadFile(url: string, destination: string): Promise<void> {
  console.log(`📥 Downloading: ${url}`);
  
  try {
    execSync(`curl -L -o "${destination}" "${url}"`, {
      stdio: "inherit",
      cwd: ROOT,
    });
    console.log(`   ✓ Downloaded to ${destination}`);
  } catch (error) {
    console.error(`   ✗ Failed to download: ${url}`);
    throw error;
  }
}

async function extractZip(zipPath: string, destination: string): Promise<void> {
  console.log(`📦 Extracting: ${zipPath}`);
  
  try {
    execSync(`unzip -o "${zipPath}" -d "${destination}"`, {
      stdio: "inherit",
      cwd: ROOT,
    });
    
    fs.unlinkSync(path.join(ROOT, zipPath));
    console.log(`   ✓ Extracted and cleaned up`);
  } catch (error) {
    console.error(`   ✗ Failed to extract: ${zipPath}`);
    throw error;
  }
}

async function cloneGit(url: string, destination: string): Promise<void> {
  console.log(`📥 Cloning: ${url}`);
  
  const destPath = path.join(ROOT, destination);
  
  if (fs.existsSync(destPath)) {
    console.log(`   ⚠️ Destination exists, pulling updates...`);
    execSync(`git -C "${destPath}" pull`, { stdio: "inherit" });
  } else {
    execSync(`git clone --depth 1 "${url}" "${destPath}"`, { stdio: "inherit" });
  }
  
  console.log(`   ✓ Cloned to ${destination}`);
}

async function downloadAssets(): Promise<void> {
  console.log("🔍 Checking for asset sources...\n");
  
  let downloaded = 0;
  
  for (const asset of ASSET_SOURCES) {
    if (!asset.url) {
      console.log(`   ⚠️ Skipping empty URL for ${asset.destination}`);
      continue;
    }
    
    try {
      switch (asset.type) {
        case "zip": {
          const tempZip = "temp_download.zip";
          await downloadFile(asset.url, tempZip);
          await extractZip(tempZip, asset.destination);
          break;
        }
        case "file": {
          await downloadFile(asset.url, asset.destination);
          break;
        }
        case "git": {
          await cloneGit(asset.url, asset.destination);
          break;
        }
      }
      downloaded++;
    } catch (error) {
      console.error(`   ✗ Failed to process: ${asset.url}`);
    }
  }
  
  console.log(`\n✅ Downloaded ${downloaded} asset(s)`);
}

async function listAssets(): Promise<void> {
  console.log("\n📁 Current asset inventory:\n");
  
  const assetDirs = ["client/src/pages", "server/services", "server/grpc"];
  
  for (const dir of assetDirs) {
    const fullPath = path.join(ROOT, dir);
    
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath);
      console.log(`   ${dir}/: ${files.length} files`);
    } else {
      console.log(`   ${dir}/: (not found)`);
    }
  }
}

async function main(): Promise<void> {
  const command = process.argv[2] || "download";
  
  switch (command) {
    case "download":
      await downloadAssets();
      break;
    case "list":
      await listAssets();
      break;
    default:
      console.log("Usage: tsx scripts/download-assets.ts [download|list]");
  }
}

main().catch((error) => {
  console.error("❌ Asset download failed:", error);
  process.exit(1);
});
