# TikTok-Style Multi-Guest Live Streaming (Up to 20)

## 🎥 Overview
**Dynamic multi-guest live streaming** modeled after TikTok Live's multi-guest feature, but **expanded to 20 participants**! 

**How TikTok Does It (12 max):**
- Host goes live solo
- Can invite guests 1-by-1 during stream
- Viewers request to join, host accepts
- Grid layout shows all participants
- Host controls who's on screen

**PROFITHACK AI (20 max):**
- Same TikTok UX, but **20 participants instead of 12**
- Better for workshops, panels, larger collaborations
- All other mechanics identical to TikTok

**Perfect For:**
- 🎤 Live interviews with multiple guests
- 🎓 Teaching with student participation
- 🎮 Gaming with squad members
- 🎨 Collaborations with fellow creators
- 💬 Q&A sessions with audience on screen

## 📊 Tier Limits (TikTok-Inspired)

| Tier | Max Live Guests | Total on Screen | Viewer Limit | Guest Controls |
|------|----------------|-----------------|--------------|----------------|
| **Explorer** (Free) | 0 | 1 (solo only) | Unlimited | ❌ No guests |
| **Creator** ($29/mo) | **19 guests** | **20 total** | Unlimited | ✅ Invite + Accept requests |
| **Innovator** ($69/mo) | **49 guests** | **50 total** | Unlimited | ✅ + VIP auto-join |

**Key Features:**
- ✅ Start solo, add guests dynamically (like TikTok)
- ✅ Viewers can "request to join" (host approves)
- ✅ Host can directly invite specific users
- ✅ Remove guests anytime during live
- ✅ Grid layout auto-adjusts (1-20 participants)
- ✅ All viewers watch for free (unlimited audience)

---

## 🎬 Use Cases

### 1. **Live Podcast Recording**
**Example: "Tech Talk with Sarah"**
- Host: Sarah (main speaker)
- Co-host: Jake (moderator)
- 3 Guest experts
- 15 Audience members (can unmute to ask questions)
- **Total: 20 participants**

**Features:**
- Host controls who can speak
- Audience members muted by default
- "Raise hand" feature to request speaking
- Record entire panel for later upload

---

### 2. **Coding Bootcamp Workshop**
**Example: "Build Your First AI App"**
- Instructor: Lisa (shares screen)
- 2 Teaching assistants
- 17 Students (can ask questions)
- **Total: 20 participants**

**Features:**
- Screen sharing (instructor shows code)
- Breakout rooms (future)
- Chat sidebar for questions
- Recording for students who miss live session

---

### 3. **Creator Collaboration**
**Example: "5 Creators React to Viral Videos"**
- 5 Creators (all on screen)
- 15 VIP fans (watch + can tip/send gifts)
- **Total: 20 participants**

**Features:**
- Grid layout (all 5 creators visible)
- Fans can send virtual gifts during live panel
- Real-time reactions
- Recording auto-uploaded to Tube

---

## 🏗️ Technical Architecture

### WebRTC Architecture for 20 Participants

#### Option 1: **Mesh Network** (Up to 6 participants)
```
Every participant connects to every other participant
Pros: Low latency, no server needed
Cons: Bandwidth intensive (20 connections per person)
```
❌ **Not viable for 20 people** - Would require 380 connections total!

#### Option 2: **SFU (Selective Forwarding Unit)** ✅ RECOMMENDED
```
All participants connect to central media server
Server forwards streams to all participants
Pros: Scalable, efficient bandwidth
Cons: Requires media server (we'll use Janus or Mediasoup)
```
✅ **Perfect for 20 people** - Each person sends 1 stream, receives 19 streams

#### Option 3: **MCU (Multipoint Control Unit)**
```
Server mixes all streams into one composite stream
Each participant receives single stream
Pros: Lowest bandwidth for participants
Cons: High server CPU, less flexibility
```
⚠️ Good for 50+ participants (Innovator tier)

---

## 🔧 Implementation Plan

### Phase 1: Database Schema (Already Done! ✅)
```typescript
// callSessions table
export const callSessions = pgTable("call_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: callTypeEnum("type").notNull(), // video or audio
  status: callStatusEnum("status").default("ringing"),
  initiatorId: varchar("initiator_id").references(() => users.id),
  roomId: varchar("room_id"), // For panel mode
  maxParticipants: integer("max_participants").default(2),
  createdAt: timestamp("created_at").defaultNow(),
});

// callParticipants table
export const callParticipants = pgTable("call_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  callId: varchar("call_id").references(() => callSessions.id),
  userId: varchar("user_id").references(() => users.id),
  role: varchar("role"), // "host", "speaker", "audience"
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  isMuted: boolean("is_muted").default(false),
  isVideoOff: boolean("is_video_off").default(false),
});
```

---

### Phase 2: Media Server Setup

#### Recommended: **Mediasoup** (Node.js SFU)
**Why Mediasoup:**
- ✅ Built for Node.js (same as your backend)
- ✅ Handles 20+ participants easily
- ✅ Low latency
- ✅ Open source + free
- ✅ Supports simulcast (send multiple qualities)

**Installation:**
```bash
npm install mediasoup
```

**Server Setup (server/media-server.ts):**
```typescript
import mediasoup from "mediasoup";

const worker = await mediasoup.createWorker({
  logLevel: "warn",
  rtcMinPort: 10000,
  rtcMaxPort: 10100,
});

const router = await worker.createRouter({
  mediaCodecs: [
    {
      kind: "audio",
      mimeType: "audio/opus",
      clockRate: 48000,
      channels: 2,
    },
    {
      kind: "video",
      mimeType: "video/VP8",
      clockRate: 90000,
    },
  ],
});
```

---

### Phase 3: WebSocket Signaling

**Extended WebSocket Messages:**
```typescript
// Client → Server
{
  type: "join-panel",
  roomId: "abc123",
  userId: "user_xyz",
  role: "speaker" // or "audience"
}

// Server → All Participants
{
  type: "participant-joined",
  userId: "user_xyz",
  role: "speaker",
  streamId: "stream_123"
}

// Client → Server (WebRTC offer)
{
  type: "offer",
  roomId: "abc123",
  sdp: "..."
}

// Server → Client (WebRTC answer)
{
  type: "answer",
  sdp: "..."
}

// Client → Server (ICE candidate)
{
  type: "ice-candidate",
  candidate: "..."
}
```

---

### Phase 4: Frontend Panel UI

**Panel Layouts:**

#### 1. **Grid View** (Default)
```
┌─────────┬─────────┬─────────┬─────────┐
│ User 1  │ User 2  │ User 3  │ User 4  │
├─────────┼─────────┼─────────┼─────────┤
│ User 5  │ User 6  │ User 7  │ User 8  │
├─────────┼─────────┼─────────┼─────────┤
│ User 9  │ User 10 │ User 11 │ User 12 │
├─────────┼─────────┼─────────┼─────────┤
│ User 13 │ User 14 │ User 15 │ User 16 │
├─────────┼─────────┼─────────┼─────────┤
│ User 17 │ User 18 │ User 19 │ User 20 │
└─────────┴─────────┴─────────┴─────────┘
```
- All participants equal size
- Scrollable if more than 20

#### 2. **Speaker View**
```
┌───────────────────────────────────────┐
│                                       │
│          ACTIVE SPEAKER               │
│          (Large Video)                │
│                                       │
└───────────────────────────────────────┘
┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │10 │
└───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
```
- Active speaker large
- Others in small thumbnails below

#### 3. **Gallery View**
```
┌──────────┬──────────┬──────────┐
│  Host    │ Speaker1 │ Speaker2 │
│ (pinned) │          │          │
├──────────┼──────────┼──────────┤
│ Aud1     │ Aud2     │ Aud3     │
└──────────┴──────────┴──────────┘
```
- Host always pinned top-left
- Main speakers prominent
- Audience smaller

---

## 🎮 Host Controls

**Panel Host Can:**
- ✅ Mute/unmute participants
- ✅ Kick participants
- ✅ Promote audience to speaker
- ✅ Demote speaker to audience
- ✅ Start/stop recording
- ✅ Enable/disable chat
- ✅ Lock panel (no new joins)
- ✅ Share screen
- ✅ End panel for everyone

**UI Example:**
```tsx
<PanelControls>
  <Button onClick={toggleRecording}>
    {isRecording ? "Stop Recording" : "Start Recording"}
  </Button>
  <Button onClick={shareScreen}>Share Screen</Button>
  <Button onClick={lockPanel}>Lock Panel</Button>
  
  <ParticipantList>
    {participants.map(p => (
      <ParticipantControl key={p.id}>
        <Avatar user={p} />
        <span>{p.name}</span>
        {p.role === "audience" && (
          <Button onClick={() => promoteToSpeaker(p.id)}>
            Promote to Speaker
          </Button>
        )}
        <Button onClick={() => muteUser(p.id)}>Mute</Button>
        <Button onClick={() => kickUser(p.id)}>Kick</Button>
      </ParticipantControl>
    ))}
  </ParticipantList>
</PanelControls>
```

---

## 💰 Monetization During Live Panels

### Virtual Gifts During Panel
- Audience can send gifts to speakers
- Appears as overlay notification
- "Sarah sent a Diamond 💎 to Jake!"
- Speaker earns 75%, platform 25%

### Paid Panel Access
```typescript
// Premium panels (paid entry)
const panel = {
  title: "Build AI Apps Masterclass",
  host: "Lisa",
  entryFee: 500 credits ($10),
  maxParticipants: 20,
};

// Free users can watch recording later
// Paid users join live
```

---

## 📈 Bandwidth Requirements

### Per Participant (Creator tier - 20 people)

**Sending:**
- Video (720p): 1.5 Mbps upload
- Audio: 50 Kbps upload
- **Total Upload: ~1.6 Mbps**

**Receiving:**
- 19 video streams (360p each): 5.7 Mbps download
- 19 audio streams: 950 Kbps download
- **Total Download: ~6.7 Mbps**

**Minimum Internet Speed:**
- **Upload: 2 Mbps**
- **Download: 8 Mbps**

**Optimizations:**
- Simulcast: Send 1 stream, server forwards multiple qualities
- Only show 9-12 videos at once (scroll for more)
- Audio-only mode for low bandwidth

---

## 🚀 Implementation Cost Estimate

**To build 20-person live panels:**

| Task | Tokens | Time |
|------|--------|------|
| Install Mediasoup | 5K | 30 min |
| Setup media server | 10K | 1 hour |
| WebSocket signaling | 15K | 1.5 hours |
| Panel UI (Grid view) | 12K | 1 hour |
| Host controls | 8K | 45 min |
| Testing & debug | 10K | 1 hour |
| **Total** | **~60K tokens** | **~5.5 hours** |

---

## ✅ What You Already Have

- ✅ Database schema (callSessions, callParticipants)
- ✅ API routes (POST /api/calls/initiate)
- ✅ WebSocket foundation
- ✅ Basic call UI (history page)

**What's Needed:**
- ⏳ Mediasoup media server
- ⏳ WebRTC peer connections
- ⏳ Panel UI layouts
- ⏳ Host control panel

---

## 🎯 Quick Start (When Ready)

1. **Install dependencies:**
   ```bash
   npm install mediasoup
   ```

2. **Setup media server:**
   ```typescript
   // server/media-server.ts
   ```

3. **Extend WebSocket:**
   ```typescript
   // server/websocket.ts - add panel signaling
   ```

4. **Build panel UI:**
   ```typescript
   // client/src/pages/panel/[id].tsx
   ```

5. **Test with 20 tabs:**
   - Open 20 browser tabs
   - Join same panel
   - Verify all streams work

---

**Want me to implement the 20-person live panel feature now?** 🎥🚀

Or would you prefer to:
1. Complete conversation UI + basic calling first
2. Add crypto payments
3. Test current features
