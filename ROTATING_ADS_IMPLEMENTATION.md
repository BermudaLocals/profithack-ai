# Rotating Ads - Implementation Guide

## ✅ What's Been Built

I've created a complete **Rotating Ads System** that automatically cycles through multiple ads with a beautiful carousel interface!

---

## 🎯 Features

### **Auto-Rotation**
- Ads automatically cycle every 5 seconds (configurable)
- Smooth transitions between ads
- Pause on hover
- Manual navigation with arrow buttons

### **Progress Indicators**
- Dots at the bottom show which ad is currently displayed
- Click any dot to jump to that ad
- Visual feedback for current ad

### **Analytics Tracking**
- Automatic view tracking when ad appears
- Click tracking when user interacts
- Revenue split: **60% creator / 40% platform**

### **Responsive Design**
- Works on all screen sizes
- Touch-friendly navigation
- Beautiful gradient backgrounds

---

## 📦 Component: `RotatingAds.tsx`

### Usage Example

```typescript
import { RotatingAds, useRotatingAds } from '@/components/RotatingAds';

export default function MyPage() {
  // Fetch 5 ads for "homepage" placement
  const { ads, loading } = useRotatingAds('homepage', 5);

  return (
    <div>
      {ads.length > 0 && (
        <RotatingAds 
          ads={ads}
          autoRotateInterval={5000}  // Rotate every 5 seconds
          showControls={true}         // Show arrow buttons
        />
      )}
    </div>
  );
}
```

---

## 🔧 Component Props

### `<RotatingAds />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ads` | `Ad[]` | required | Array of ads to display |
| `autoRotateInterval` | `number` | `5000` | Milliseconds between rotations |
| `showControls` | `boolean` | `true` | Show prev/next arrow buttons |

### `useRotatingAds()` Hook

| Parameter | Type | Description |
|-----------|------|-------------|
| `placement` | `string` | Where to show ads (e.g., "homepage", "video_feed", "sidebar") |
| `limit` | `number` | How many ads to fetch (default: 5) |

**Returns:**
- `ads`: Array of ad objects
- `loading`: Boolean indicating if ads are loading

---

## 💡 Where to Use Rotating Ads

### **1. Landing Page** (Homepage)
Display multiple sponsor ads between sections:
```typescript
const { ads } = useRotatingAds('landing_page', 3);
```

### **2. Video Feed** (For You / Vids / Tube)
Show ads between videos:
```typescript
const { ads } = useRotatingAds('video_feed', 5);
```

### **3. Sidebar** (Dashboard)
Persistent ads in sidebar:
```typescript
const { ads } = useRotatingAds('sidebar', 4);
```

### **4. Premium Section**
Ads for premium features:
```typescript
const { ads } = useRotatingAds('premium', 3);
```

---

## 🎨 Ad Object Structure

```typescript
interface Ad {
  id: string;              // Unique ad ID
  title: string;           // Ad headline
  description: string;     // Ad description
  imageUrl: string;        // Image/banner URL
  targetUrl: string;       // Click destination URL
  advertiser: string;      // Company/brand name
}
```

---

## 📊 Analytics & Revenue

### **Automatic Tracking**

1. **View Tracking**
   - Triggered when ad becomes visible (50% in viewport)
   - Tracked once per ad per session
   - Creator earns **60%** of view cost

2. **Click Tracking**
   - Triggered when user clicks ad
   - Opens in new tab
   - Creator earns **60%** of click cost

### **Revenue Formula**

```javascript
// Per View
creatorEarnings = costPerView * 0.60
platformRevenue = costPerView * 0.40

// Per Click
creatorEarnings = costPerClick * 0.60
platformRevenue = costPerClick * 0.40
```

---

## 🚀 Backend API Support

### **Get Rotating Ads**

```http
GET /api/ads/placements/:placement?limit=5
```

**Example:**
```http
GET /api/ads/placements/landing_page?limit=3
```

**Response:**
```json
[
  {
    "id": "ad-123",
    "title": "Premium Hosting",
    "description": "Deploy your apps instantly",
    "imageUrl": "https://...",
    "targetUrl": "https://...",
    "advertiser": "CloudHost Pro"
  },
  {
    "id": "ad-456",
    "title": "Learn to Code",
    "description": "Free coding bootcamp",
    "imageUrl": "https://...",
    "targetUrl": "https://...",
    "advertiser": "CodeAcademy"
  }
]
```

### **Track Ad View**

```http
POST /api/ads/:id/view
```

### **Track Ad Click**

```http
POST /api/ads/:id/click
```

---

## 🎯 Implementation Examples

### Example 1: Homepage Banner

```typescript
// pages/landing-page.tsx
import { RotatingAds, useRotatingAds } from '@/components/RotatingAds';

export default function LandingPage() {
  const { ads } = useRotatingAds('landing_page', 3);

  return (
    <div>
      <section className="hero">...</section>
      
      {/* Rotating ads between sections */}
      {ads.length > 0 && (
        <section className="py-12">
          <div className="max-w-2xl mx-auto">
            <RotatingAds ads={ads} />
          </div>
        </section>
      )}
      
      <section className="features">...</section>
    </div>
  );
}
```

### Example 2: Video Feed Integration

```typescript
// pages/vids.tsx
export default function Vids() {
  const { ads } = useRotatingAds('video_feed', 5);
  const videos = useVideos();

  return (
    <div>
      {videos.map((video, index) => (
        <>
          <VideoCard key={video.id} video={video} />
          
          {/* Show rotating ad every 5 videos */}
          {index % 5 === 4 && ads.length > 0 && (
            <div className="my-4">
              <RotatingAds ads={ads} showControls={false} />
            </div>
          )}
        </>
      ))}
    </div>
  );
}
```

### Example 3: Sidebar Persistent Ads

```typescript
// components/Sidebar.tsx
export function Sidebar() {
  const { ads } = useRotatingAds('sidebar', 4);

  return (
    <aside className="w-80 p-4">
      <nav>...</nav>
      
      {/* Persistent rotating ads */}
      <div className="mt-8">
        <RotatingAds 
          ads={ads}
          autoRotateInterval={8000}  // Slower rotation in sidebar
        />
      </div>
    </aside>
  );
}
```

---

## 🎨 Customization

### Change Rotation Speed

```typescript
<RotatingAds 
  ads={ads}
  autoRotateInterval={3000}  // Rotate every 3 seconds
/>
```

### Hide Navigation Controls

```typescript
<RotatingAds 
  ads={ads}
  showControls={false}  // No arrow buttons
/>
```

### Pause on Hover

Automatically pauses when user hovers over ad - **built-in!**

---

## 💰 Monetization Strategy

### **For Platform**
- Create multiple ad placements
- Sell ad slots to sponsors
- Charge per impression (CPM) or per click (CPC)
- Platform keeps 40% of ad revenue

### **For Creators**
- Earn 60% from ads on their content
- More views = more ad impressions
- More engagement = more clicks
- Passive income stream

### **Ad Pricing Examples**

| Ad Type | Cost Per View | Cost Per Click | Creator Earnings (60%) |
|---------|---------------|----------------|------------------------|
| Banner Ad | 100 credits | 500 credits | 60 credits / 300 credits |
| Video Ad | 200 credits | 1000 credits | 120 credits / 600 credits |
| Premium Ad | 500 credits | 2500 credits | 300 credits / 1500 credits |

---

## ✅ Summary

**You now have:**
- ✅ Automatic ad rotation (carousel)
- ✅ Beautiful UI with progress indicators
- ✅ Manual navigation (prev/next buttons)
- ✅ Pause on hover
- ✅ Click tracking
- ✅ View tracking
- ✅ 60/40 revenue split
- ✅ Responsive design
- ✅ Easy integration

**Ready to monetize!** 💰

---

*Created: October 27, 2025*
