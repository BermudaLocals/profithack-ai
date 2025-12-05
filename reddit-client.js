// Reddit API Client for PROFITHACK AI
import fetch from 'node-fetch';

const REDDIT_API_BASE = 'https://oauth.reddit.com';
const REDDIT_AUTH_URL = 'https://www.reddit.com/api/v1/access_token';

export class RedditClient {
  constructor(config = {}) {
    this.clientId = config.clientId || process.env.REDDIT_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.REDDIT_CLIENT_SECRET;
    this.username = config.username || process.env.REDDIT_USERNAME;
    this.password = config.password || process.env.REDDIT_PASSWORD;
    this.userAgent = config.userAgent || process.env.REDDIT_USER_AGENT || 'ProfitHackAI/1.0';
    
    this.accessToken = null;
    this.tokenExpiry = null;
    this.rateLimitRemaining = 60;
    this.rateLimitReset = null;
  }

  // Get or refresh access token
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    const response = await fetch(REDDIT_AUTH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.userAgent
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: this.username,
        password: this.password
      })
    });

    if (!response.ok) {
      throw new Error(`Reddit auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    return this.accessToken;
  }

  async request(endpoint, options = {}) {
    const token = await this.getAccessToken();
    const url = `${REDDIT_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': this.userAgent,
        ...options.headers
      }
    });

    // Track rate limits
    this.rateLimitRemaining = parseInt(response.headers.get('X-Ratelimit-Remaining') || '60');
    this.rateLimitReset = parseInt(response.headers.get('X-Ratelimit-Reset') || '0');

    if (response.status === 429) {
      const retryAfter = this.rateLimitReset - Math.floor(Date.now() / 1000);
      throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Reddit API error: ${error || response.statusText}`);
    }

    return await response.json();
  }

  // Submit a text post
  async submitPost(subreddit, title, text) {
    const response = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await this.getAccessToken()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.userAgent
      },
      body: new URLSearchParams({
        sr: subreddit,
        kind: 'self',
        title: title,
        text: text,
        api_type: 'json'
      })
    });

    const data = await response.json();
    
    if (data.json?.errors?.length > 0) {
      throw new Error(`Reddit post error: ${data.json.errors[0][1]}`);
    }

    return data.json.data;
  }

  // Submit a link post
  async submitLinkPost(subreddit, title, url) {
    const response = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await this.getAccessToken()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.userAgent
      },
      body: new URLSearchParams({
        sr: subreddit,
        kind: 'link',
        title: title,
        url: url,
        api_type: 'json'
      })
    });

    const data = await response.json();
    
    if (data.json?.errors?.length > 0) {
      throw new Error(`Reddit post error: ${data.json.errors[0][1]}`);
    }

    return data.json.data;
  }

  // Get hot posts from subreddit
  async getHotPosts(subreddit, limit = 25) {
    const data = await this.request(`/r/${subreddit}/hot?limit=${limit}`);
    return data.data.children.map(post => post.data);
  }

  // Get new posts from subreddit
  async getNewPosts(subreddit, limit = 25) {
    const data = await this.request(`/r/${subreddit}/new?limit=${limit}`);
    return data.data.children.map(post => post.data);
  }

  // Comment on a post
  async addComment(postId, text) {
    const response = await fetch('https://oauth.reddit.com/api/comment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await this.getAccessToken()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.userAgent
      },
      body: new URLSearchParams({
        thing_id: `t3_${postId}`,
        text: text,
        api_type: 'json'
      })
    });

    const data = await response.json();
    
    if (data.json?.errors?.length > 0) {
      throw new Error(`Reddit comment error: ${data.json.errors[0][1]}`);
    }

    return data.json.data;
  }

  // Get user info
  async getUserInfo() {
    return await this.request('/api/v1/me');
  }

  // Check if ready to make requests
  canMakeRequest() {
    if (this.rateLimitRemaining <= 5) {
      const now = Math.floor(Date.now() / 1000);
      if (now < this.rateLimitReset) {
        return false;
      }
    }
    return true;
  }
}

// Export singleton instance
export const reddit = new RedditClient();
