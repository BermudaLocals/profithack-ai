# PROFITHACK AI - Complete Rork/Expo Build Prompt

## APP OVERVIEW
Build "PROFITHACK AI" - React Native Expo app combining TikTok + OnlyFans + Tinder + AI Creator tools. Target: $60M+/month. Adults 18+.

---

## NAVIGATION

### Bottom Tabs (5)
1. HOME - TikTok video feed
2. INBOX - WhatsApp DMs
3. CREATE (+) - Upload content (centered, pink gradient)
4. AI HUB - AI tools suite
5. PROFILE - User settings

### Top Tabs (Home screen only)
LIVE | Following | For You

---

## SCREEN 1: VIDEO FEED (HOME)

Full-screen vertical video player:
- Auto-play, loop, muted by default
- Swipe UP/DOWN to navigate
- Double-tap to LIKE (heart animation)

### Right Side Buttons (vertical stack):
1. **Avatar** (50px) - Follow button below
2. **Like** - Heart icon, pink when liked, count below
3. **Comment** - Opens comments sheet
4. **Sparks** - Yellow gradient, opens gifts modal
5. **Share** - Opens share sheet
6. **Bookmark** - Save video

### Bottom Overlay:
- Username + verified badge
- Caption (2 lines)
- Sound info

### Premium Content:
- Blurred preview + lock icon
- "Unlock for X credits" button

---

## SCREEN 2: COMMENTS SHEET

Bottom sheet (70% height):
- Header: "X Comments"
- Comment list: Avatar, username, text, timestamp, like, reply
- Input: Avatar + text field + send button

---

## SCREEN 3: GIFTS/SPARKS MODAL

Grid of 8 gifts:
| Gift | Icon | Price |
|------|------|-------|
| Heart | ❤️ | 1 |
| Rose | 🌹 | 5 |
| Fire | 🔥 | 10 |
| Star | ⭐ | 25 |
| Diamond | 💎 | 50 |
| Rocket | 🚀 | 100 |
| Crown | 👑 | 500 |
| Rainbow | 🌈 | 1000 |

Footer: Balance + "Get More Credits"

---

## SCREEN 4: SHARE SHEET

Options: Copy Link, WhatsApp, Twitter, Facebook, Instagram, Messages

---

## SCREEN 5: LIVE HOSTS

Grid of active streams:
- Thumbnail + LIVE badge
- Viewer count
- Host name/avatar
- Tap to join

---

## SCREEN 6: INBOX (WhatsApp Clone)

Message list:
- Avatar, username, last message, time
- Unread badge, online dot
- Tap opens chat

---

## SCREEN 7: CHAT

- Message bubbles (pink sent, gray received)
- Video/voice call buttons
- Text input + attachment + voice note
- Read receipts

---

## SCREEN 8: CREATE/UPLOAD

Options:
1. Record Video (camera)
2. Upload from Library

Edit: Trim, music, text, effects, filters

Post: Caption, hashtags, visibility, premium toggle, POST button

---

## SCREEN 9: AI HUB

Grid of AI tools:

### 1. AI CHAT
- ChatGPT interface
- Models: GPT-4, Claude 3.5, Gemini
- User provides API keys
- Free: 10 msgs/day, Pro: Unlimited

### 2. AI VIRAL VIDEO GENERATOR
**Tab 1 - Script:** Topic input → viral script output
**Tab 2 - Video:** Prompt → AI video (5s-60s, styles: Cinematic/Anime/Realistic)
**Tab 3 - Voice:** Script → voiceover (male/female, accents)
**Tab 4 - Captions:** Auto-generate subtitles (styles: Bold/Animated)

### 3. AI INFLUENCER CREATOR
**Step 1 - Avatar:** Gender, age, ethnicity, style, hair, eyes, outfit → Generate 4 variations
**Step 2 - Persona:** Name, bio, niche, personality, voice
**Step 3 - Manage:** List influencers, create content, schedule, analytics

### 4. VIRAL HOOK GENERATOR
Topic → 10 viral hooks

### 5. HASHTAG GENERATOR
Description → 30 trending hashtags

### 6. TRENDING ANALYZER
Current trends by niche + predictions

### 7. CAPTION WRITER
Video description → engaging captions

### 8. ENGAGEMENT PREDICTOR
Thumbnail → predict views, likes, best posting time

---

## SCREEN 10: DATING (Tinder Clone)

Swipe cards:
- Video profile (auto-play)
- Name, age, location
- AI compatibility % (e.g., "87% Match")
- Bio, interests

Actions:
- LEFT: Pass
- RIGHT: Like
- UP: Super Like

Match animation → "Send Message" or "Keep Swiping"

Premium: See likes, unlimited swipes, rewind, boost, passport

---

## SCREEN 11: PROFILE

- Avatar (100px), username, bio
- Stats: Following, Followers, Likes
- Wallet, Dating, Settings buttons
- Video grid (3 columns)
- Creator stats: Views, Earnings, Subscribers

---

## SCREEN 12: WALLET

Balance display + Add Credits + Withdraw

Packages:
- $4.99 = 500 + 50 bonus
- $9.99 = 1100 + 150
- $49.99 = 6000 + 1000
- $99.99 = 13000 + 3000

Payments: PayPal, Card, Apple/Google Pay, Crypto

Transaction history

---

## SUBSCRIPTIONS

| Tier | Price | Features |
|------|-------|----------|
| FREE | $0 | Ads, 5 AI/day, 5 swipes/day |
| PREMIUM | $9.99 | No ads, 500 credits, unlimited |
| VIP | $29.99 | 2000 credits, priority |
| DIAMOND | $99.99 | Everything + exclusive |

---

## DESIGN SYSTEM

**Colors:**
- Background: #000000
- Primary: #FF1493 (pink)
- Secondary: #8B5CF6 (purple)
- Accent: #00D4FF (cyan)
- Text: #FFFFFF / #9CA3AF

**Gradients:**
- Buttons: pink → purple
- Premium: amber → red
- AI: cyan → purple

**Typography:** Inter/Poppins, Bold headings

**Components:** 24px radius buttons, 16px cards, dark modals

**Animations:** 60fps reanimated, slide transitions, floating hearts

---

## PACKAGES

```
expo, expo-router, expo-av, expo-camera
expo-image-picker, expo-linear-gradient
react-native-reanimated, react-native-gesture-handler
@gorhom/bottom-sheet, react-native-deck-swiper
@tanstack/react-query, zustand
lucide-react-native, lottie-react-native
stripe-react-native, expo-notifications
```

---

## API ENDPOINTS

```
POST /api/auth/{register|login|logout}
GET /api/feed?tab=foryou&page=1
POST /api/videos/{id}/{like|comment|gift|share}
POST /api/videos/upload
GET/POST /api/messages/{id}
GET /api/dating/cards
POST /api/dating/swipe
POST /api/ai/{chat|generate-video|generate-avatar}
GET /api/wallet/balance
POST /api/wallet/purchase
```

---

## BUILD ORDER

1. Expo + expo-router setup
2. Bottom tab navigation
3. Video feed + FlatList
4. Action buttons + sheets
5. Inbox + Chat
6. Create/Upload
7. AI Hub tools
8. Dating swipe
9. Profile + Wallet
10. Auth + APIs
11. Notifications
12. Polish + Submit

---

**Complete TikTok + OnlyFans + Tinder + AI Creator platform!**
