// Pinterest API v5 Client for PROFITHACK AI
import fetch from 'node-fetch';

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';

export class PinterestClient {
  constructor(accessToken) {
    this.accessToken = accessToken || process.env.PINTEREST_ACCESS_TOKEN;
    this.rateLimitRemaining = 1000;
    this.rateLimitReset = null;
  }

  async request(endpoint, options = {}) {
    const url = `${PINTEREST_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    // Track rate limits
    this.rateLimitRemaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0');
    this.rateLimitReset = parseInt(response.headers.get('X-RateLimit-Reset') || '0');

    if (response.status === 429) {
      const retryAfter = this.rateLimitReset - Math.floor(Date.now() / 1000);
      throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Pinterest API error: ${error.message || response.statusText}`);
    }

    return await response.json();
  }

  // Create a Pin
  async createPin({ boardId, title, description, imageUrl, link }) {
    return await this.request('/pins', {
      method: 'POST',
      body: JSON.stringify({
        board_id: boardId,
        title: title,
        description: description,
        link: link || 'https://profithackai.com',
        media_source: {
          source_type: 'image_url',
          url: imageUrl
        }
      })
    });
  }

  // Get user's boards
  async getBoards() {
    return await this.request('/boards');
  }

  // Get Pin analytics
  async getPinAnalytics(pinId, startDate, endDate) {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      metric_types: 'IMPRESSION,PIN_CLICK,SAVE,CLOSEUP'
    });
    
    return await this.request(`/pins/${pinId}/analytics?${params}`);
  }

  // Get user info
  async getUserInfo() {
    return await this.request('/user_account');
  }

  // Check if ready to make requests
  canMakeRequest() {
    if (this.rateLimitRemaining <= 0) {
      const now = Math.floor(Date.now() / 1000);
      if (now < this.rateLimitReset) {
        return false;
      }
    }
    return true;
  }
}

// Export singleton instance
export const pinterest = new PinterestClient();
