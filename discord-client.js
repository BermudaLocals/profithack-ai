/**
 * Discord Bot API Client
 * Sends messages to Discord channels via bot token
 * 
 * Setup:
 * 1. Create bot at https://discord.com/developers/applications
 * 2. Add bot to server with "Send Messages" permission
 * 3. Get channel ID (Enable Developer Mode, right-click channel, Copy ID)
 * 4. Store bot token in DISCORD_BOT_TOKEN secret
 */

class DiscordClient {
  constructor() {
    this.botToken = process.env.DISCORD_BOT_TOKEN || null;
    this.baseUrl = 'https://discord.com/api';
  }

  /**
   * Send a message to a Discord channel
   * @param {string} channelId - Discord channel ID (e.g., "123456789012345678")
   * @param {string} content - Message text
   * @param {object} options - Optional embed, components, etc.
   * @returns {Promise<object>} Discord API response
   */
  async sendMessage(channelId, content, options = {}) {
    if (!this.botToken) {
      console.warn('⚠️  DISCORD_BOT_TOKEN not set - Discord posting disabled');
      return { success: false, error: 'Bot token not configured' };
    }

    try {
      const url = `${this.baseUrl}/channels/${channelId}/messages`;
      
      const payload = {
        content: content,
        ...options
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Discord API error: ${data.message || response.statusText}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Discord posting error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a rich embed message to Discord
   * @param {string} channelId - Discord channel ID
   * @param {object} embed - Embed object
   * @returns {Promise<object>} Discord API response
   */
  async sendEmbed(channelId, embed) {
    return this.sendMessage(channelId, '', {
      embeds: [embed]
    });
  }

  /**
   * Create a marketing embed for PROFITHACK AI
   * @param {string} title - Embed title
   * @param {string} description - Embed description
   * @param {string} inviteCode - Invite code to include
   * @returns {object} Formatted embed object
   */
  createMarketingEmbed(title, description, inviteCode) {
    return {
      title: title,
      description: description,
      color: 0xFF00FF, // Pink/purple
      fields: [
        {
          name: '🎁 Get Early Access',
          value: `Use invite code: **${inviteCode}**`,
          inline: false
        },
        {
          name: '💰 Creator Revenue',
          value: '60% creator / 40% platform',
          inline: true
        },
        {
          name: '🤖 AI Tools',
          value: '100 marketing bots',
          inline: true
        }
      ],
      footer: {
        text: 'PROFITHACK AI - Create. Automate. Earn.'
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const discord = new DiscordClient();
