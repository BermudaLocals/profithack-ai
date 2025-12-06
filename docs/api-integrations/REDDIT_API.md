# Reddit API Integration Guide

## Overview
Reddit API allows you to programmatically post content, read posts, and engage with communities relevant to PROFITHACK AI.

## Setup Steps

### 1. Create Reddit App

1. Go to https://www.reddit.com/prefs/apps
2. Scroll to **"Developed Applications"**
3. Click **"create another app..."** or **"are you a developer? create an app..."**
4. Fill in details:
   - **Name**: ProfitHack AI Bot
   - **App type**: Select **"script"** (for backend bot) or **"web app"** (for OAuth)
   - **Description**: AI-powered creator platform automation
   - **About URL**: https://profithackai.com
   - **Redirect URI**: https://profithackai.com/api/auth/reddit/callback
5. Click **"create app"**

### 2. Get API Credentials

After creating the app:
- **client_id**: Listed under the app name (e.g., `dQw4w9WgXcQ`)
- **client_secret**: The "secret" field
- **user_agent**: `ProfitHackAI/1.0 by u/YOUR_USERNAME`

### 3. Generate Access Token

**For Script Apps (Backend Bot):**

```javascript
const getRedditToken = async () => {
  const auth = Buffer.from(
    `${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'ProfitHackAI/1.0 by u/YOUR_USERNAME'
    },
    body: new URLSearchParams({
      grant_type: 'password',
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD
    })
  });

  const { access_token } = await response.json();
  return access_token;
};
```

**For Web Apps (OAuth 2.0):**

```javascript
// Authorization URL
const authUrl = `https://www.reddit.com/api/v1/authorize?` +
  `client_id=${REDDIT_CLIENT_ID}` +
  `&response_type=code` +
  `&state=RANDOM_STRING` +
  `&redirect_uri=${encodeURIComponent('https://profithackai.com/api/auth/reddit/callback')}` +
  `&duration=permanent` +
  `&scope=submit,read,identity`;

// Exchange code for token
const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'ProfitHackAI/1.0 by u/YOUR_USERNAME'
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: 'https://profithackai.com/api/auth/reddit/callback'
  })
});
```

### 4. Add to Replit Secrets

```bash
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
REDDIT_USER_AGENT=ProfitHackAI/1.0 by u/YOUR_USERNAME
```

## API Usage Examples

### Submit a Post

```javascript
const submitPost = async (subreddit, title, text, accessToken) => {
  const response = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': process.env.REDDIT_USER_AGENT
    },
    body: new URLSearchParams({
      sr: subreddit,
      kind: 'self',
      title: title,
      text: text,
      api_type: 'json'
    })
  });

  return await response.json();
};

// Example usage
const post = await submitPost(
  'SideHustle',
  'I Built an AI Tool That Made Me $10K in 30 Days (Here\'s How)',
  `I recently discovered PROFITHACK AI and used their tools to automate my content creation...\n\n` +
  `Results after 30 days:\n- 50K+ views\n- $10,247 in revenue\n- 90% less time spent\n\n` +
  `Check it out: https://profithackai.com`,
  accessToken
);
```

### Submit a Link Post

```javascript
const submitLinkPost = async (subreddit, title, url, accessToken) => {
  const response = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': process.env.REDDIT_USER_AGENT
    },
    body: new URLSearchParams({
      sr: subreddit,
      kind: 'link',
      title: title,
      url: url,
      api_type: 'json'
    })
  });

  return await response.json();
};
```

### Get Subreddit Posts

```javascript
const getSubredditPosts = async (subreddit, accessToken, limit = 25) => {
  const response = await fetch(
    `https://oauth.reddit.com/r/${subreddit}/hot?limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': process.env.REDDIT_USER_AGENT
      }
    }
  );

  const data = await response.json();
  return data.data.children.map(post => post.data);
};
```

### Comment on a Post

```javascript
const addComment = async (postId, text, accessToken) => {
  const response = await fetch('https://oauth.reddit.com/api/comment', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': process.env.REDDIT_USER_AGENT
    },
    body: new URLSearchParams({
      thing_id: `t3_${postId}`,
      text: text,
      api_type: 'json'
    })
  });

  return await response.json();
};
```

## Rate Limits

- **60 requests per minute** per OAuth client
- **600 requests per 10 minutes** per OAuth client
- Follow Reddit's rate limits in response headers:
  - `X-Ratelimit-Remaining`: Requests remaining
  - `X-Ratelimit-Reset`: UTC timestamp when limit resets

```javascript
const checkRateLimit = (response) => {
  const remaining = response.headers.get('X-Ratelimit-Remaining');
  const reset = response.headers.get('X-Ratelimit-Reset');
  
  if (remaining && parseInt(remaining) < 10) {
    console.warn(`Only ${remaining} requests remaining. Reset at ${new Date(reset * 1000)}`);
  }
};
```

## Best Subreddits for PROFITHACK AI

### Creator Economy
- r/SideHustle (1.5M members)
- r/Entrepreneur (3.5M members)
- r/passive_income (200K members)
- r/Hustle (50K members)

### AI & Tech
- r/OpenAI (1M members)
- r/ChatGPT (3M members)
- r/artificial (500K members)
- r/MachineLearning (3M members)

### Content Creation
- r/NewTubers (500K members)
- r/youtube (2M members)
- r/Twitch (2M members)
- r/ContentCreation (50K members)

## Reddit Posting Rules

### DO:
✅ Be authentic and transparent
✅ Provide value first, promote second
✅ Engage with comments
✅ Follow subreddit rules
✅ Use proper formatting (markdown)
✅ Post at peak times (8-11 AM ET)

### DON'T:
❌ Spam or cross-post excessively
❌ Use clickbait titles
❌ Ignore subreddit rules
❌ Post only promotional content
❌ Use URL shorteners
❌ Delete and repost

## Content Templates

### Success Story Format
```
Title: [Achievement] + (How I Did It)
Body:
- Quick background
- The problem I faced
- What I tried (list 2-3 failed attempts)
- What finally worked
- Results (specific numbers)
- Tool/resource used (mention PROFITHACK AI naturally)
- Call to action
```

### Question Format
```
Title: Has anyone tried [X] for [Y]?
Body:
- Current situation
- What you're considering
- Your concerns
- Ask for experiences
- Mention you found PROFITHACK AI as an option
```

## Error Handling

```javascript
const safeRedditPost = async (subreddit, title, text, accessToken) => {
  try {
    const result = await submitPost(subreddit, title, text, accessToken);
    
    if (result.json?.errors?.length > 0) {
      const error = result.json.errors[0];
      
      if (error[0] === 'RATELIMIT') {
        console.log('Rate limited, waiting...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        return await safeRedditPost(subreddit, title, text, accessToken);
      }
      
      throw new Error(`Reddit API error: ${error[1]}`);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to post to Reddit:', error);
    throw error;
  }
};
```

## Best Practices

1. **Build Karma First**: Don't immediately promote. Build reputation by helping others
2. **9:1 Ratio**: For every 1 promotional post, make 9 value-adding posts/comments
3. **Subreddit Rules**: Always read and follow each subreddit's rules
4. **Timing**: Post during peak hours (8-11 AM ET weekdays)
5. **Engage**: Reply to comments within the first hour
6. **Flair**: Use appropriate post flair if required
7. **No Self-Promotion in Title**: Lead with value, not your product

## Webhook Support

Reddit doesn't support webhooks, but you can:
- Use **Pushshift API** for historical data
- Poll Reddit API periodically
- Use third-party services like **IFTTT** or **Zapier**

## Resources

- [Reddit API Documentation](https://www.reddit.com/dev/api/)
- [PRAW (Python)](https://praw.readthedocs.io/)
- [Snoowrap (Node.js)](https://github.com/not-an-aardvark/snoowrap)
- [Reddit Marketing Guide](https://www.reddit.com/r/marketing/wiki/index)
- [Rate Limits](https://github.com/reddit-archive/reddit/wiki/API)
