/**
 * Telegram Bot API Client
 * Sends messages to Telegram channels/groups via bot token
 * 
 * Setup:
 * 1. Talk to @BotFather on Telegram
 * 2. Send /newbot command
 * 3. Get your HTTP API token (format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)
 * 4. Add bot to your channel as admin with "Post Messages" permission
 * 5. Store bot token in TELEGRAM_BOT_TOKEN secret
 * 
 * Get Channel ID:
 * - After adding bot, post a test message
 * - Visit: https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
 * - Look for "chat":{"id":-1001234567890} (channel IDs start with -100)
 */

class TelegramClient {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || null;
    this.baseUrl = 'https://api.telegram.org';
  }

  /**
   * Send a text message to a Telegram channel/group
   * @param {string} chatId - Channel ID (e.g., "-1001234567890") or @username
   * @param {string} text - Message text (up to 4096 characters)
   * @param {object} options - Optional parameters (parse_mode, disable_notification, etc.)
   * @returns {Promise<object>} Telegram API response
   */
  async sendMessage(chatId, text, options = {}) {
    if (!this.botToken) {
      console.warn('⚠️  TELEGRAM_BOT_TOKEN not set - Telegram posting disabled');
      return { success: false, error: 'Bot token not configured' };
    }

    try {
      const url = `${this.baseUrl}/bot${this.botToken}/sendMessage`;
      
      const payload = {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML', // Support HTML formatting by default
        ...options
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description || 'Unknown error'}`);
      }

      return { success: true, data: data.result };
    } catch (error) {
      console.error('Telegram posting error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a photo to a Telegram channel/group
   * @param {string} chatId - Channel ID or @username
   * @param {string} photoUrl - URL of the photo
   * @param {string} caption - Photo caption
   * @returns {Promise<object>} Telegram API response
   */
  async sendPhoto(chatId, photoUrl, caption = '') {
    if (!this.botToken) {
      console.warn('⚠️  TELEGRAM_BOT_TOKEN not set - Telegram posting disabled');
      return { success: false, error: 'Bot token not configured' };
    }

    try {
      const url = `${this.baseUrl}/bot${this.botToken}/sendPhoto`;
      
      const payload = {
        chat_id: chatId,
        photo: photoUrl,
        caption: caption,
        parse_mode: 'HTML'
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description || 'Unknown error'}`);
      }

      return { success: true, data: data.result };
    } catch (error) {
      console.error('Telegram photo posting error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create formatted marketing message for PROFITHACK AI
   * @param {string} inviteCode - Invite code to include
   * @returns {string} Formatted HTML message
   */
  createMarketingMessage(inviteCode) {
    return `
<b>🚀 PROFITHACK AI - Create. Automate. Earn.</b>

💰 <b>60% Creator Revenue Share</b> (beats TikTok's 50%)
🤖 <b>100 AI Marketing Bots</b> - automate everything
💎 <b>Global Payments</b> - PayPal, Crypto, Payoneer, Square

<b>🎁 LIMITED BETA ACCESS</b>
Use invite code: <code>${inviteCode}</code>

Join now at profithackai.com
`.trim();
  }

  /**
   * Format text with Telegram HTML
   * @param {string} text - Plain text
   * @param {string} style - bold, italic, code, or link
   * @returns {string} Formatted HTML
   */
  formatText(text, style = 'normal') {
    switch (style) {
      case 'bold':
        return `<b>${text}</b>`;
      case 'italic':
        return `<i>${text}</i>`;
      case 'code':
        return `<code>${text}</code>`;
      case 'underline':
        return `<u>${text}</u>`;
      default:
        return text;
    }
  }
}

// Export singleton instance
export const telegram = new TelegramClient();
