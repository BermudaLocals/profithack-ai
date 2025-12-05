/**
 * Script to register Discord slash commands
 * Run with: npx tsx server/register-discord-commands.ts
 */

import { registerCommands } from './services/discord-commands';

async function main() {
  console.log('🚀 Starting Discord command registration...\n');
  await registerCommands();
  console.log('\n✅ Done! Check Discord Developer Portal to verify commands.');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Failed to register commands:', error);
  process.exit(1);
});
