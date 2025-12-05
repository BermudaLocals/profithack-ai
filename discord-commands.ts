/**
 * Discord Slash Commands Registration
 * Registers commands with Discord API for PROFITHACK AI bot
 */

const DISCORD_APP_ID = '1435828873479585906';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// Define slash commands
export const commands = [
  {
    name: 'profithack',
    description: '🚀 Learn about PROFITHACK AI platform',
    type: 1, // CHAT_INPUT
  },
  {
    name: 'invite',
    description: '🎫 Get a beta invite code for PROFITHACK AI',
    type: 1,
  },
  {
    name: 'help',
    description: '❓ Get help with PROFITHACK AI commands',
    type: 1,
  },
  {
    name: 'stats',
    description: '📊 View PROFITHACK AI platform statistics',
    type: 1,
  }
];

/**
 * Register all slash commands with Discord
 */
export async function registerCommands() {
  if (!DISCORD_BOT_TOKEN) {
    console.log('⚠️  DISCORD_BOT_TOKEN not set - skipping command registration');
    return;
  }

  try {
    const url = `https://discord.com/api/v10/applications/${DISCORD_APP_ID}/commands`;
    
    console.log('📝 Registering Discord slash commands...');
    
    for (const command of commands) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (response.ok) {
        console.log(`✅ Registered command: /${command.name}`);
      } else {
        const error = await response.text();
        console.error(`❌ Failed to register /${command.name}:`, error);
      }
    }
    
    console.log('✅ Discord commands registered successfully');
  } catch (error) {
    console.error('❌ Error registering Discord commands:', error);
  }
}

/**
 * Delete all slash commands (useful for cleanup)
 */
export async function deleteAllCommands() {
  if (!DISCORD_BOT_TOKEN) {
    console.log('⚠️  DISCORD_BOT_TOKEN not set');
    return;
  }

  try {
    const url = `https://discord.com/api/v10/applications/${DISCORD_APP_ID}/commands`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
      },
    });

    const existingCommands = await response.json();
    
    for (const command of existingCommands as any[]) {
      await fetch(`${url}/${command.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        },
      });
      console.log(`🗑️  Deleted command: /${command.name}`);
    }
  } catch (error) {
    console.error('❌ Error deleting commands:', error);
  }
}
