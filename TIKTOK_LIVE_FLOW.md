# TikTok Multi-Guest Live Flow (Expanded to 20)

## 📱 Exact TikTok UX Flow (Applied to PROFITHACK AI)

### **TikTok's Implementation:**
- Max: **12 participants** (1 host + 11 guests)
- Host controls everything
- Grid layout auto-adjusts
- Viewers watch for free

### **PROFITHACK AI Implementation:**
- Max: **20 participants** (1 host + 19 guests) 🎉
- **Exact same UX as TikTok**, just more slots
- All TikTok mechanics preserved

---

## 🎬 Step-by-Step User Flow

### **Phase 1: Host Starts Solo**

**Host (Sarah) clicks "Go Live":**

```
┌─────────────────────────────┐
│  📹 Select Live Mode        │
├─────────────────────────────┤
│  ⭕ Solo Live (just me)     │
│  👥 Multi-Guest (up to 20)  │ ← Creator tier
│  🎓 Workshop (up to 50)     │ ← Innovator tier
└─────────────────────────────┘
```

**Sarah selects "Multi-Guest":**

```
┌─────────────────────────────┐
│   🎥 You're Live!           │
│                             │
│   [Sarah's Video Feed]      │
│                             │
│   👁️ 247 viewers           │
│   💬 15 comments/sec        │
│                             │
│   [Invite Guests] (0/19)    │ ← TikTok-style button
└─────────────────────────────┘
```

---

### **Phase 2: Host Invites First Guest**

**Sarah clicks "Invite Guests":**

```
┌─────────────────────────────┐
│  🎯 Invite to Live          │
├─────────────────────────────┤
│  📋 Join Requests (3)       │ ← Viewers requesting
│  ├─ Jake ⭐                 │   (approve/deny)
│  ├─ Lisa 💎                 │
│  └─ Mike ❤️                 │
│                             │
│  🔍 Search & Invite         │ ← Direct invite
│  ├─ @alex                   │
│  └─ @maria                  │
│                             │
│  Guests on screen: 0/19     │
└─────────────────────────────┘
```

**Sarah approves Jake's request:**

```
✅ Jake is joining your live...
```

**Now the grid adjusts to 2 people:**

```
┌─────────────────────────────┐
│ ┌───────────┬───────────┐   │
│ │  Sarah    │   Jake    │   │
│ │  (Host)   │  (Guest)  │   │
│ └───────────┴───────────┘   │
│                             │
│ 👁️ 312 viewers             │
│ 💬 "Jake joined! 🎉"        │
│                             │
│ [Invite More] (1/19)        │
└─────────────────────────────┘
```

---

### **Phase 3: Adding More Guests (Grid Auto-Adjusts)**

**Sarah invites Lisa and Mike:**

**3 Guests (2x2 Grid):**
```
┌─────────────────────────────┐
│ ┌───────┬───────┐           │
│ │ Sarah │ Jake  │           │
│ ├───────┼───────┤           │
│ │ Lisa  │ Mike  │           │
│ └───────┴───────┘           │
│ Guests: 3/19                │
└─────────────────────────────┘
```

**6 Guests (2x3 Grid):**
```
┌─────────────────────────────┐
│ ┌─────┬─────┬─────┐         │
│ │Sarah│Jake │Lisa │         │
│ ├─────┼─────┼─────┤         │
│ │Mike │Alex │Maria│         │
│ └─────┴─────┴─────┘         │
│ Guests: 6/19                │
└─────────────────────────────┘
```

**9 Guests (3x3 Grid - Like TikTok):**
```
┌─────────────────────────────┐
│ ┌────┬────┬────┐            │
│ │Sara│Jake│Lisa│            │
│ ├────┼────┼────┤            │
│ │Mike│Alex│Mari│            │
│ ├────┼────┼────┤            │
│ │Tom │Emma│Dave│            │
│ └────┴────┴────┘            │
│ Guests: 9/19                │
└─────────────────────────────┘
```

**12 Guests (3x4 Grid - TikTok's Max):**
```
┌─────────────────────────────┐
│ ┌───┬───┬───┬───┐           │
│ │Sar│Jak│Lis│Mik│           │
│ ├───┼───┼───┼───┤           │
│ │Ale│Mar│Tom│Emm│           │
│ ├───┼───┼───┼───┤           │
│ │Dav│Sam│Kat│Ben│           │
│ └───┴───┴───┴───┘           │
│ 🎉 At TikTok's limit!       │
│ Guests: 12/19               │
└─────────────────────────────┘
```

**20 Guests (4x5 Grid - PROFITHACK MAX!):**
```
┌─────────────────────────────┐
│ ┌──┬──┬──┬──┬──┐            │
│ │Sa│Ja│Li│Mi│Al│            │
│ ├──┼──┼──┼──┼──┤            │
│ │Ma│To│Em│Da│Sa│            │
│ ├──┼──┼──┼──┼──┤            │
│ │Ka│Be│Zo│Lu│Ni│            │
│ ├──┼──┼──┼──┼──┤            │
│ │Ol│Pa│Qu│Ra│St│            │
│ └──┴──┴──┴──┴──┘            │
│ 🚀 FULL CAPACITY!           │
│ Guests: 20/19 ❌ Max!       │
└─────────────────────────────┘
```

---

### **Phase 4: Host Controls (During Live)**

**Sarah's control panel (bottom of screen):**

```
┌─────────────────────────────────────────────┐
│  [🎤 Mute All] [📹 Guest Cam] [👋 End Live] │
├─────────────────────────────────────────────┤
│  Active Guests (12):                        │
│  ├─ Jake ⭐    [Mute] [Remove] [Pin]        │
│  ├─ Lisa 💎    [Mute] [Remove] [Pin]        │
│  └─ Mike ❤️    [Mute] [Remove] [Pin]        │
│                                             │
│  Join Requests (5):                         │
│  ├─ @anna      [✅ Accept] [❌ Deny]        │
│  └─ @chris     [✅ Accept] [❌ Deny]        │
└─────────────────────────────────────────────┘
```

**Host Actions (Exactly Like TikTok):**
- ✅ **Accept/Deny** join requests
- ✅ **Invite** specific users
- ✅ **Remove** guests from live
- ✅ **Mute** individual guests
- ✅ **Pin** specific guest (make them larger)
- ✅ **End Live** (disconnects everyone)

---

### **Phase 5: Viewer Perspective**

**Regular Viewer (watching, not on screen):**

```
┌─────────────────────────────┐
│ [Multi-Guest Live Stream]   │
│ ┌───┬───┬───┬───┐           │
│ │Sar│Jak│Lis│Mik│           │
│ ├───┼───┼───┼───┤           │
│ │12 people on screen...│     │
│ └───┴───┴───┴───┘           │
│                             │
│ 👁️ 1,247 watching          │
│ 💬 Chat scrolling...        │
│                             │
│ [❤️ Like] [💎 Gift] [📤]   │
│ [🙋 Request to Join]        │ ← TikTok feature!
└─────────────────────────────┘
```

**When viewer clicks "Request to Join":**

```
✋ Request sent to Sarah!
⏳ Waiting for host to accept...

(Host sees in their queue)
```

---

### **Phase 6: Guest Experience**

**Jake gets invited notification:**

```
┌─────────────────────────────┐
│  🎉 You're Invited!         │
│                             │
│  Sarah wants you to join    │
│  her live stream!           │
│                             │
│  Current guests: 5/19       │
│  Viewers: 1,247             │
│                             │
│  [✅ Join] [❌ Decline]     │
└─────────────────────────────┘
```

**Jake joins - sees this:**

```
┌─────────────────────────────┐
│ You're LIVE with Sarah!     │
│ ┌───────────┬───────────┐   │
│ │  Sarah    │   You     │   │
│ │  (Host)   │  (Guest)  │   │
│ └───────────┴───────────┘   │
│                             │
│ 👁️ 1,247 viewers           │
│ 💬 "Welcome Jake!"          │
│                             │
│ [🎤] [📹] [👋 Leave]        │ ← Guest controls
└─────────────────────────────┘
```

**Guest can:**
- ✅ Mute themselves
- ✅ Turn camera off
- ✅ Leave anytime
- ❌ Cannot remove others (only host)
- ❌ Cannot invite others (only host)

---

## 🎨 Grid Layouts (Auto-Adjust Like TikTok)

| Participants | Grid Layout | Layout Style |
|--------------|-------------|--------------|
| 1 (solo) | Full screen | 1x1 |
| 2 | Side-by-side | 1x2 |
| 3-4 | 2x2 | Square grid |
| 5-6 | 2x3 | Rectangle |
| 7-9 | 3x3 | Square grid (TikTok default) |
| 10-12 | 3x4 | Rectangle (TikTok max) |
| 13-16 | 4x4 | Square grid |
| 17-20 | 4x5 or 5x4 | Rectangle (PROFITHACK max) |

**TikTok uses 3x3 (9 visible) and scrolls for 10-12. We can do the same!**

---

## 💡 Key TikTok Features We're Copying

### 1. **Join Requests (Viewer → Host)**
```typescript
// Viewer clicks "Request to Join"
{
  type: "join-request",
  viewerId: "user_123",
  livestreamId: "live_abc"
}

// Host sees notification
"Jake wants to join your live!"
[Accept] [Deny]

// If accepted
{
  type: "join-approved",
  viewerId: "user_123",
  position: 5 // Grid position
}
```

### 2. **Direct Invites (Host → Viewer)**
```typescript
// Host searches and invites
{
  type: "invite-to-live",
  hostId: "sarah",
  invitedUserId: "lisa",
  livestreamId: "live_abc"
}

// Lisa gets notification
"Sarah invited you to join her live!"
[Join] [Decline]
```

### 3. **Dynamic Add/Remove**
```typescript
// Host adds guest during live
currentGuests: 5 → 6 (grid adjusts)

// Host removes guest
{
  type: "remove-guest",
  guestId: "mike",
  reason: "Host removed"
}

// Mike gets disconnected
"You were removed from the live stream"
```

### 4. **Pinning (Host Feature)**
```typescript
// Host pins Jake's video
{
  type: "pin-guest",
  guestId: "jake"
}

// Jake's video becomes larger
Layout changes:
┌─────────────────┬─────┐
│                 │ Sar │
│      Jake       ├─────┤
│    (Pinned)     │ Lisa│
│                 ├─────┤
│                 │ Mike│
└─────────────────┴─────┘
```

---

## 🚀 Technical Implementation (TikTok-Style)

### Database Schema (Already Have! ✅)
```typescript
export const callSessions = pgTable("call_sessions", {
  id: varchar("id").primaryKey(),
  type: callTypeEnum("type"), // "multi-guest"
  maxParticipants: integer("max_participants").default(20),
  hostId: varchar("host_id"),
  status: callStatusEnum("status"),
});

export const callParticipants = pgTable("call_participants", {
  callId: varchar("call_id"),
  userId: varchar("user_id"),
  role: varchar("role"), // "host", "guest", "viewer"
  status: varchar("status"), // "active", "removed", "left"
  position: integer("position"), // Grid position 0-19
});
```

### WebSocket Messages
```typescript
// Viewer requests to join
ws.send({
  type: "request-join-live",
  livestreamId: "abc123"
});

// Host approves
ws.send({
  type: "approve-join-request",
  userId: "jake_id",
  position: 5
});

// Add to grid
ws.send({
  type: "guest-joined",
  userId: "jake_id",
  position: 5,
  totalGuests: 6
});

// Remove guest
ws.send({
  type: "remove-guest",
  userId: "mike_id"
});
```

---

## 📊 Comparison: TikTok vs PROFITHACK AI

| Feature | TikTok Live | PROFITHACK AI |
|---------|-------------|---------------|
| **Max Guests** | 12 | **20** 🎉 |
| **Solo Live** | ✅ Free | ✅ Free |
| **Multi-Guest** | ✅ Free | ✅ Creator tier |
| **Join Requests** | ✅ | ✅ |
| **Direct Invites** | ✅ | ✅ |
| **Host Remove** | ✅ | ✅ |
| **Pinning** | ✅ | ✅ |
| **Gifts During Live** | ✅ | ✅ (75% to creator) |
| **Recording** | ❌ | ✅ Creator tier |
| **Monetization** | Minimal | **Multiple streams** |

**Our Advantage:**
- ✅ 67% more guests (20 vs 12)
- ✅ Recording & download
- ✅ Better creator revenue (75% vs TikTok's 50%)
- ✅ Works globally (crypto payments)

---

## 💰 Monetization During Live (Better Than TikTok)

### Virtual Gifts (Like TikTok)
```
Viewer sends Diamond 💎 ($20)
→ Creator gets $15 (75%)
→ Platform gets $5 (25%)
→ Shows as overlay: "Jake sent Diamond to Sarah!"
```

### Paid Entry (Unlike TikTok)
```
Host can set entry fee:
- Free viewers: Watch only
- Paid viewers ($10): Can request to join

Example:
Sarah's Workshop: 500 credits ($10 entry)
→ 100 paid viewers = $1,000 revenue
→ Sarah gets $750 (75%)
```

---

**Want me to implement this TikTok-style multi-guest feature?** 🎥

This would give you a **huge competitive advantage** - all of TikTok's live features, but with:
- 67% more guests (20 vs 12)
- Better monetization
- Recording capabilities
- Global accessibility

**Ready to build?** 🚀