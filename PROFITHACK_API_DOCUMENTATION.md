# PROFITHACK AI - API Documentation

## 🚀 Complete API Reference for Developers

This document provides **complete API documentation** for building apps on PROFITHACK AI platform.

---

## 🔐 **Authentication**

All API endpoints require authentication via **Replit Auth**.

### **Get Auth Token**

```typescript
// Frontend
const response = await fetch('/api/user', {
  credentials: 'include'  // Include session cookie
});
```

### **Protected Routes**

All routes use `isAuthenticated` middleware:

```typescript
app.get('/api/protected', isAuthenticated, async (req: any, res) => {
  const userId = req.user.claims.sub;
  // Your logic here
});
```

---

## 👤 **User API**

### **Get Current User**

```http
GET /api/user
```

**Response:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "username": "johndoe",
  "displayName": "John Doe",
  "profileImageUrl": "https://...",
  "bio": "Creator and developer",
  "followerCount": 1500,
  "followingCount": 300,
  "isVerified": true,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### **Update User Profile**

```http
PATCH /api/user
Content-Type: application/json

{
  "displayName": "New Name",
  "bio": "Updated bio",
  "profileImageUrl": "https://..."
}
```

### **Get User Balance**

```http
GET /api/wallet/balance
```

**Response:**
```json
{
  "balance": 50000,
  "balanceUSD": 1219.51
}
```

---

## 🎬 **Video API**

### **Upload Video**

```http
POST /api/videos
Content-Type: multipart/form-data

{
  "file": <video file>,
  "title": "My Video",
  "description": "Video description",
  "tags": ["coding", "tutorial"],
  "isAgeRestricted": false
}
```

**Response:**
```json
{
  "id": "video-123",
  "userId": "user-123",
  "title": "My Video",
  "videoUrl": "https://storage.../video.mp4",
  "thumbnailUrl": "https://storage.../thumb.jpg",
  "viewCount": 0,
  "likeCount": 0,
  "createdAt": "2025-10-27T00:00:00Z"
}
```

### **Get Videos (Feed)**

```http
GET /api/videos?limit=20&offset=0
```

**Response:**
```json
{
  "videos": [
    {
      "id": "video-123",
      "title": "My Video",
      "videoUrl": "https://...",
      "viewCount": 1500,
      "likeCount": 250,
      "user": {
        "id": "user-123",
        "username": "johndoe",
        "profileImageUrl": "https://..."
      }
    }
  ],
  "total": 1000,
  "hasMore": true
}
```

### **Like Video**

```http
POST /api/videos/:id/like
```

### **View Video**

```http
POST /api/videos/:id/view
```

---

## 💬 **Messaging API**

### **Get Conversations**

```http
GET /api/conversations
```

**Response:**
```json
[
  {
    "id": "conv-123",
    "name": "John Doe",
    "isGroup": false,
    "lastMessage": "Hey there!",
    "lastMessageAt": "2025-10-27T12:00:00Z",
    "unreadCount": 2
  }
]
```

### **Send Message**

```http
POST /api/conversations/:id/messages
Content-Type: application/json

{
  "content": "Hello!",
  "messageType": "text"
}
```

### **Get Messages**

```http
GET /api/conversations/:id/messages?limit=50
```

---

## ⚡ **Sparks (Virtual Gifts) API**

### **Send Spark**

```http
POST /api/sparks/send
Content-Type: application/json

{
  "recipientId": "user-456",
  "sparkType": "power_spark",
  "amount": 100,
  "videoId": "video-123"
}
```

**Spark Types:**
- `mini_spark` - 50 credits
- `power_spark` - 100 credits
- `fire_spark` - 250 credits
- `diamond_spark` - 500 credits
- `star_spark` - 1,000 credits
- `crown_spark` - 2,500 credits
- `rocket_spark` - 5,000 credits
- `rainbow_spark` - 10,000 credits
- `legendary_spark` - 25,000 credits

### **Get Received Sparks**

```http
GET /api/sparks/received?limit=20
```

---

## 💰 **Payment API**

### **Create PayPal Order**

```http
POST /api/payments/paypal/orders
Content-Type: application/json

{
  "amount": 10.00,
  "currency": "USD",
  "description": "Buy 410 credits"
}
```

### **Capture PayPal Payment**

```http
POST /api/payments/paypal/orders/:orderId/capture
```

### **Create Crypto Payment**

```http
POST /api/crypto/payment
Content-Type: application/json

{
  "amount": 10.00,
  "currency": "USD",
  "cryptoCurrency": "BTC"
}
```

### **Purchase Subscription**

```http
POST /api/subscriptions/purchase
Content-Type: application/json

{
  "tier": "creator",
  "billingPeriod": "monthly"
}
```

**Tiers:**
- `starter` - $20/mo (5,000 credits)
- `creator` - $40/mo (10,000 credits)
- `innovator` - $199/mo (50,000 credits)

---

## 📹 **Live Streaming API (Twilio Video)**

### **Create Live Room**

```http
POST /api/twilio/room/create
Content-Type: application/json

{
  "roomType": "live",
  "roomName": "My Live Stream",
  "maxParticipants": 50
}
```

**Room Types:**
- `live` - Live streaming (unlimited viewers)
- `battle` - Battle mode (unlimited participants)
- `group` - Group video (20 participants max)
- `premium` - Premium 1-on-1 call

### **Join Room**

```http
POST /api/twilio/room/join
Content-Type: application/json

{
  "roomId": "room-123",
  "participantName": "John Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbG...",
  "roomName": "room-abc123",
  "identity": "user-123"
}
```

### **End Room**

```http
POST /api/twilio/room/end
Content-Type: application/json

{
  "roomId": "room-123"
}
```

---

## 🎨 **Ad API**

### **Get Ads**

```http
GET /api/ads/placements/:placement?limit=5
```

**Placements:**
- `landing_page`
- `video_feed`
- `sidebar`
- `premium`

**Response:**
```json
[
  {
    "id": "ad-123",
    "title": "Premium Hosting",
    "description": "Deploy instantly",
    "imageUrl": "https://...",
    "targetUrl": "https://...",
    "advertiser": "CloudHost Pro"
  }
]
```

### **Track Ad View**

```http
POST /api/ads/:id/view
Content-Type: application/json

{
  "videoId": "video-123",
  "viewDuration": 5000
}
```

### **Track Ad Click**

```http
POST /api/ads/:id/click
Content-Type: application/json

{
  "viewId": "view-123"
}
```

---

## 🔗 **Social Import API**

### **Connect Social Platform**

```http
GET /api/social/connect/:platform
```

**Platforms:**
- `instagram`
- `tiktok`
- `twitter`
- `facebook`
- `linkedin`

### **Import Contacts**

```http
POST /api/social/import-contacts/:platform
```

### **Get Connected Platforms**

```http
GET /api/social/connections
```

### **Get Imported Contacts**

```http
GET /api/social/imported-contacts
```

---

## 💎 **Premium Subscriptions API**

### **Subscribe to Creator**

```http
POST /api/premium/subscribe
Content-Type: application/json

{
  "creatorId": "user-456",
  "tier": "vip"
}
```

**Tiers:**
- `basic` - $19.99/mo
- `vip` - $39.99/mo
- `elite` - $99.99/mo

### **Get Subscriptions**

```http
GET /api/premium/subscriptions
```

### **Cancel Subscription**

```http
DELETE /api/premium/subscriptions/:id
```

---

## 🤖 **AI Features API**

### **Generate AI Content**

```http
POST /api/ai/generate
Content-Type: application/json

{
  "type": "text" | "image" | "video",
  "prompt": "Create a coding tutorial video",
  "settings": {}
}
```

### **Create AI Influencer**

```http
POST /api/ai-influencers
Content-Type: application/json

{
  "name": "AI Sarah",
  "appearance": {
    "gender": "female",
    "ethnicity": "asian",
    "style": "professional"
  },
  "voice": "elevenlabs_voice_id"
}
```

---

## 📊 **Analytics API**

### **Get Video Analytics**

```http
GET /api/analytics/videos/:id
```

**Response:**
```json
{
  "views": 15000,
  "likes": 2500,
  "comments": 300,
  "shares": 150,
  "watchTime": 45000000,
  "adRevenue": 12000,
  "sparkRevenue": 8500
}
```

### **Get Creator Stats**

```http
GET /api/analytics/creator
```

**Response:**
```json
{
  "totalViews": 500000,
  "totalEarnings": 250000,
  "followerGrowth": [100, 150, 200, 250],
  "topVideos": [...]
}
```

---

## 🔔 **WebSocket API**

### **Connect to WebSocket**

```javascript
const ws = new WebSocket('wss://your-domain.replit.app/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    userId: 'user-123'
  }));
};
```

### **Message Types**

**1. New Message**
```json
{
  "type": "new_message",
  "conversationId": "conv-123",
  "message": {...},
  "sender": {...}
}
```

**2. Typing Indicator**
```json
{
  "type": "user_typing",
  "conversationId": "conv-123",
  "userId": "user-456",
  "isTyping": true
}
```

**3. Live Stream Update**
```json
{
  "type": "live_update",
  "roomId": "room-123",
  "viewerCount": 500,
  "sparkCount": 1200
}
```

---

## 🛡️ **Rate Limits**

| Endpoint | Rate Limit |
|----------|------------|
| GET requests | 1000/hour |
| POST requests | 500/hour |
| Video uploads | 50/day |
| Payments | 100/hour |
| WebSocket | 1 connection/user |

---

## 🚨 **Error Codes**

| Code | Meaning |
|------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

---

## 📚 **SDK Examples**

### **JavaScript/TypeScript**

```typescript
class ProfitHackAPI {
  baseUrl = 'https://your-app.replit.app';
  
  async getUser() {
    const res = await fetch(`${this.baseUrl}/api/user`, {
      credentials: 'include'
    });
    return res.json();
  }
  
  async uploadVideo(file: File, metadata: any) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title);
    
    const res = await fetch(`${this.baseUrl}/api/videos`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    return res.json();
  }
  
  async sendSpark(recipientId: string, amount: number) {
    const res = await fetch(`${this.baseUrl}/api/sparks/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId, amount }),
      credentials: 'include'
    });
    return res.json();
  }
}
```

---

## ✅ **Best Practices**

1. **Always handle errors**: Wrap API calls in try-catch
2. **Use TypeScript**: Get type safety
3. **Cache responses**: Don't fetch same data repeatedly
4. **Optimize uploads**: Compress videos before upload
5. **Handle rate limits**: Implement exponential backoff
6. **Secure tokens**: Never expose tokens in client-side code

---

*Complete API documentation for PROFITHACK AI Platform*  
*Last updated: October 27, 2025*
