# Live Streaming Integration Guide

## Overview
This document explains how to integrate the TikTok-style live streaming UI with the Mediasoup WebRTC backend.

## Architecture

```
LiveStream UI → useMediasoup Hook → API Routes → Mediasoup Service → WebRTC Media
```

## Integration Steps

### 1. Import the Hook in LiveStream Component

```typescript
import { useMediasoup } from "@/hooks/useMediasoup";
```

### 2. Replace Local State with Hook

**BEFORE (Current - Local State Only):**
```typescript
const [isLive, setIsLive] = useState(false);
const [participants, setParticipants] = useState<Participant[]>([]);
const [localStream, setLocalStream] = useState<MediaStream | null>(null);

const startStream = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({...});
  setLocalStream(stream);
  setIsLive(true);
  // ... local state manipulation only
};
```

**AFTER (Integrated with Mediasoup):**
```typescript
const {
  isConnected,
  participants,
  localStream,
  connect,
  publishLocalMedia,
  subscribeToParticipant,
  toggleMute,
  toggleVideo,
  muteParticipant,
  removeParticipant,
  disconnect,
} = useMediasoup({
  roomId: roomId || `room-${Date.now()}`,
  isHost,
  onParticipantJoined: (participant) => {
    toast({
      title: "Guest Joined",
      description: `${participant.displayName || "Guest"} joined the panel`,
    });
  },
  onParticipantLeft: (userId) => {
    toast({
      title: "Guest Left",
      description: "A guest left the panel",
    });
  },
  onError: (error) => {
    toast({
      variant: "destructive",
      title: "Stream Error",
      description: error.message,
    });
  },
});

const startStream = async () => {
  try {
    // Step 1: Get local media
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: true,
    });
    
    // Step 2: Connect to Mediasoup room
    await connect();
    
    // Step 3: Publish local media to room
    await publishLocalMedia(stream);
    
    toast({
      title: "Live Stream Started",
      description: "You're now broadcasting!",
    });
  } catch (error) {
    console.error("Failed to start stream:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to start stream",
    });
  }
};
```

### 3. Wire Host Controls to Backend

**Mute Participant:**
```typescript
const handleMuteGuest = async (userId: string) => {
  if (!isHost) return;
  
  const participant = participants.find(p => p.userId === userId);
  if (!participant) return;
  
  await muteParticipant(userId, !participant.isMuted);
};
```

**Remove Participant:**
```typescript
const handleRemoveGuest = async (userId: string) => {
  if (!isHost) return;
  await removeParticipant(userId);
};
```

**Pin Participant (Local UI Only):**
```typescript
// Pinning is UI-only, doesn't need backend
const [pinnedUserId, setPinnedUserId] = useState<string | null>(null);

const pinParticipant = (userId: string) => {
  setPinnedUserId(pinnedUserId === userId ? null : userId);
};
```

### 4. Update UI Components

**Replace startStream button:**
```tsx
<Button
  onClick={startStream}
  data-testid="button-start-live-stream"
  className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
>
  <Video className="w-5 h-5 mr-2" />
  Go Live Now
</Button>
```

**Update mute button to call backend:**
```tsx
<Button
  size="icon"
  variant="ghost"
  onClick={() => handleMuteGuest(participant.userId)}
  data-testid={`button-mute-${participant.userId}`}
>
  <MicOff className="w-4 h-4 text-white" />
</Button>
```

**Update remove button to call backend:**
```tsx
<Button
  size="icon"
  variant="ghost"
  onClick={() => handleRemoveGuest(participant.userId)}
  data-testid={`button-remove-${participant.userId}`}
>
  <UserMinus className="w-4 h-4 text-red-400" />
</Button>
```

## Backend API Endpoints (Already Implemented)

All endpoints are in `server/routes.ts`:

### Room Management
- `POST /api/webrtc/room/create` - Create new room (host only)
- `POST /api/webrtc/room/join` - Join existing room
- `POST /api/webrtc/room/leave` - Leave room
- `GET /api/webrtc/room/:roomId/participants` - Get participant list

### Transport Setup
- `POST /api/webrtc/transport/create` - Create WebRTC transport
- `POST /api/webrtc/transport/connect` - Connect transport

### Media Streaming
- `POST /api/webrtc/produce` - Publish media track (audio/video)
- `POST /api/webrtc/consume` - Subscribe to remote media track

### Host Controls (Authorization Required)
- `POST /api/webrtc/participant/mute` - Mute participant (host only)
- `POST /api/webrtc/participant/toggle-video` - Toggle video (host only)
- `POST /api/webrtc/participant/remove` - Remove participant (host only)

## Security

All endpoints verify:
1. ✅ User is authenticated (`isAuthenticated` middleware)
2. ✅ Host controls verify user is room host
3. ✅ Participants can only control their own media
4. ✅ Room access is controlled via Mediasoup service

## Testing Flow

### Host Flow:
1. Navigate to `/live`
2. Click "Go Live Now"
3. Grant camera/microphone permissions
4. Wait for "Live Stream Started" toast
5. See yourself in the grid
6. Invite guests via UI
7. Control guests (mute/remove/pin)

### Guest Flow:
1. Receive invite link (e.g., `/live?roomId=abc123`)
2. Click "Join Panel"
3. Grant camera/microphone permissions
4. See yourself and host in grid
5. Chat in sidebar

### Viewer Flow:
1. Visit live stream link
2. See host + guests without camera/mic
3. Chat in sidebar
4. Send virtual gifts

## Known Limitations

### Current State:
- ✅ Backend WebRTC infrastructure complete
- ✅ Mediasoup service running
- ✅ All API endpoints implemented
- ✅ useMediasoup hook fully functional
- ⚠️ LiveStream UI needs integration (currently uses local state)

### Next Steps:
1. Refactor `client/src/pages/live-stream.tsx` to use `useMediasoup` hook
2. Wire all UI buttons to hook methods
3. Add participant synchronization via WebSocket
4. Test end-to-end with multiple browsers
5. Add error recovery (reconnection, etc.)

## Troubleshooting

**Error: "Failed to connect to Mediasoup"**
- Check server logs for Mediasoup worker status
- Verify RTP capabilities match client device
- Ensure HTTPS for WebRTC (required by browsers)

**Error: "Only host can mute participants"**
- Verify user ID matches room host
- Check authentication token

**Error: "Room not found"**
- Ensure room was created before joining
- Check roomId parameter

**No media visible:**
- Check browser console for getUserMedia errors
- Verify camera/microphone permissions
- Ensure video element ref is connected

## Production Checklist

Before deploying live streaming:

- [ ] Integrate useMediasoup hook into LiveStream UI
- [ ] Test with 2+ participants in different browsers
- [ ] Test host controls (mute/remove/pin)
- [ ] Test join request flow
- [ ] Add WebSocket for real-time participant updates
- [ ] Add reconnection logic for network drops
- [ ] Test on mobile devices (iOS/Android)
- [ ] Verify HTTPS certificate (required for WebRTC)
- [ ] Load test with 20 simultaneous participants
- [ ] Monitor Mediasoup worker resource usage
- [ ] Set up error logging and alerting
- [ ] Document rate limits and quotas

## Resources

- Mediasoup Documentation: https://mediasoup.org/documentation/v3/
- WebRTC API: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- Mediasoup Client SDK: https://mediasoup.org/documentation/v3/mediasoup-client/api/
