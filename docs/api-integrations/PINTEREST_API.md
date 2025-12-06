# Pinterest API Integration Guide

## Overview
Pinterest API v5 allows you to programmatically create Pins, manage boards, and track analytics for PROFITHACK AI content.

## Setup Steps

### 1. Create Pinterest Developer App

1. Go to https://developers.pinterest.com/
2. Click **"Get started"** → **"Create app"**
3. Fill in app details:
   - **App name**: ProfitHack AI
   - **Description**: AI-powered digital creator platform
   - **App website**: https://profithackai.com
   - **Redirect URI**: https://profithackai.com/api/auth/pinterest/callback
4. Accept Pinterest Developer Agreement
5. Click **"Create"**

### 2. Get API Credentials

After creating the app:
1. Navigate to **"App settings"**
2. Copy **App ID** and **App secret**
3. Under **"Scopes"**, enable:
   - `pins:read` - Read user's Pins
   - `pins:write` - Create and update Pins
   - `boards:read` - Read user's boards
   - `boards:write` - Create and update boards
   - `user_accounts:read` - Read user profile

### 3. Generate Access Token

**Option A: OAuth 2.0 Flow (Recommended for production)**

```javascript
// Authorization URL
const authUrl = `https://www.pinterest.com/oauth/?` +
  `client_id=${PINTEREST_APP_ID}` +
  `&redirect_uri=${encodeURIComponent('https://profithackai.com/api/auth/pinterest/callback')}` +
  `&response_type=code` +
  `&scope=pins:read,pins:write,boards:read,boards:write,user_accounts:read`;

// Exchange code for access token
const tokenResponse = await fetch('https://api.pinterest.com/v5/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${Buffer.from(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`).toString('base64')}`
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: 'https://profithackai.com/api/auth/pinterest/callback'
  })
});

const { access_token, refresh_token } = await tokenResponse.json();
```

**Option B: Generate Access Token Manually (for testing)**

1. Visit: https://developers.pinterest.com/apps/YOUR_APP_ID/access-token
2. Select scopes
3. Click **"Generate token"**
4. Copy the access token

### 4. Add to Replit Secrets

```bash
PINTEREST_APP_ID=your_app_id_here
PINTEREST_APP_SECRET=your_app_secret_here
PINTEREST_ACCESS_TOKEN=your_access_token_here
```

## API Usage Examples

### Create a Pin

```javascript
const createPin = async (imageUrl, title, description, boardId) => {
  const response = await fetch('https://api.pinterest.com/v5/pins', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      board_id: boardId,
      title: title,
      description: description,
      link: 'https://profithackai.com',
      media_source: {
        source_type: 'image_url',
        url: imageUrl
      }
    })
  });

  return await response.json();
};

// Example usage
const pin = await createPin(
  'https://profithackai.com/images/ai-creator-tools.jpg',
  'AI Tools That Made Me $10K in 30 Days',
  'Discover the exact AI tools and strategies I used to generate passive income. Free course at profithackai.com #AITools #PassiveIncome #CreatorEconomy',
  'YOUR_BOARD_ID'
);
```

### Get User Boards

```javascript
const getBoards = async () => {
  const response = await fetch('https://api.pinterest.com/v5/boards', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}`
    }
  });

  return await response.json();
};
```

### Track Pin Analytics

```javascript
const getPinAnalytics = async (pinId) => {
  const response = await fetch(
    `https://api.pinterest.com/v5/pins/${pinId}/analytics?` +
    `start_date=2025-01-01&end_date=2025-01-31&metric_types=IMPRESSION,PIN_CLICK,SAVE`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}`
      }
    }
  );

  return await response.json();
};
```

## Rate Limits

- **Per day**: 1,000 API calls
- **Per hour**: 200 API calls
- **Per minute**: 10 API calls

Handle rate limits:
```javascript
if (response.status === 429) {
  const retryAfter = response.headers.get('X-RateLimit-Reset');
  console.log(`Rate limited. Retry after: ${retryAfter}`);
}
```

## Best Practices

1. **Optimize Images**: Pinterest recommends 1000x1500px (2:3 aspect ratio)
2. **Rich Pins**: Enable rich metadata for better engagement
3. **Hashtags**: Use 3-5 relevant hashtags
4. **Description**: 100-500 characters with strong CTA
5. **Post Timing**: Best times: 2-4 PM and 8-11 PM (user's local time)
6. **Link Back**: Always link to profithackai.com

## Error Handling

```javascript
try {
  const pin = await createPin(imageUrl, title, description, boardId);
  console.log('Pin created:', pin.id);
} catch (error) {
  if (error.code === 'INVALID_ACCESS_TOKEN') {
    // Refresh token
  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Wait and retry
  } else {
    console.error('Pinterest API error:', error);
  }
}
```

## Webhook Support

Pinterest supports webhooks for:
- Pin created
- Pin updated
- Pin deleted
- Board created

Configure at: https://developers.pinterest.com/apps/YOUR_APP_ID/webhooks

## Resources

- [Pinterest API Documentation](https://developers.pinterest.com/docs/api/v5/)
- [API Reference](https://developers.pinterest.com/docs/api/v5/#tag/pins)
- [Best Practices](https://developers.pinterest.com/docs/getting-started/best-practices/)
- [Rate Limits](https://developers.pinterest.com/docs/api/v5/#tag/Rate-limits)
