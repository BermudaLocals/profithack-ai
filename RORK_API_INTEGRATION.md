# Rork to Replit Backend Integration Guide

## Overview
This guide shows how to connect your Rork React Native app to your PROFITHACK AI Replit backend.

## Your Replit Backend URL
After publishing, your backend will be at:
```
https://your-repl-name.your-username.replit.app
```

## Step 1: Create API Config in Rork App

Create `utils/api.ts` in your Rork project:

```typescript
// Rork App: utils/api.ts
const API_BASE_URL = 'https://your-replit-app.replit.app'; // Update after publishing

export const api = {
  baseUrl: API_BASE_URL,
  
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },
  
  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
```

## Step 2: Connect to Real Videos

Replace mock data in your Rork app:

```typescript
// Rork App: hooks/useVideos.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

export function useVideos() {
  return useQuery({
    queryKey: ['videos'],
    queryFn: () => api.get('/api/videos?limit=50')
  });
}
```

## Step 3: Available API Endpoints

Your Replit backend provides these endpoints:

### Videos
- `GET /api/videos` - Get video feed (supports ?limit=50&offset=0)
- `GET /api/videos/:id` - Get single video
- `POST /api/videos/:id/like` - Like/unlike video
- `POST /api/videos/:id/view` - Record view

### Authentication
- `GET /api/auth/user` - Get current user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Messages
- `GET /api/messages` - Get conversations
- `GET /api/messages/:id` - Get messages in conversation
- `POST /api/messages` - Send message

### Dating
- `GET /api/dating/profiles` - Get dating profiles
- `POST /api/dating/swipe` - Swipe on profile

### AI Hub
- `POST /api/ai/chat` - AI chat completion
- `POST /api/ai/viral-hooks` - Generate viral hooks
- `POST /api/ai/hashtags` - Generate hashtags

### Wallet
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/add-credits` - Add credits

## Step 4: Update Rork Store

```typescript
// Rork App: store/appStore.ts
import { create } from 'zustand';
import { api } from '@/utils/api';

export const useAppStore = create((set) => ({
  videos: [],
  isLoading: true,
  
  fetchVideos: async () => {
    set({ isLoading: true });
    const data = await api.get('/api/videos?limit=50');
    set({ videos: data, isLoading: false });
  },
  
  likeVideo: async (videoId: string) => {
    await api.post(`/api/videos/${videoId}/like`, {});
    // Update local state
    set((state) => ({
      videos: state.videos.map((v) =>
        v.id === videoId ? { ...v, isLiked: !v.isLiked } : v
      )
    }));
  }
}));
```

## Step 5: Enable CORS on Replit Backend

Your Replit backend already has CORS configured. If you need to add your Rork domain, update `server/index.ts`:

```typescript
// Already configured - just add your Rork app URL
const allowedOrigins = [
  'https://profithack-ai-platform.rork.app',
  // ... other origins
];
```

## Benefits of This Integration

1. **Real Data**: 22,649+ videos from your PostgreSQL database
2. **Real Users**: Actual user authentication and profiles
3. **Real Payments**: Connected to PayPal, Square, etc.
4. **Real AI**: Claude 3.5 Sonnet integration for AI features
5. **Real Messaging**: WebSocket-based real-time chat

## Next Steps

1. Publish your Replit app (click "Publish" button)
2. Copy the published URL
3. Update `API_BASE_URL` in your Rork app
4. Test the connection

## Need Help?

The Replit app is the **production backend** with:
- PostgreSQL database (22,649 videos)
- 11 gRPC microservices
- Multi-payment support
- AI integration
- WebSocket messaging
- Live streaming (Mediasoup)

The Rork app is a **native mobile frontend** that can consume this backend.
