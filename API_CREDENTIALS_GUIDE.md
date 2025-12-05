# 🔑 Complete API Setup Guide for All Platforms
## Get Bot Posting Access to All Your Social Media Accounts

---

## 🎯 **PLATFORMS COVERED**

1. ✅ TikTok
2. ✅ Instagram (Meta)
3. ✅ YouTube
4. ✅ Facebook (Meta)
5. ✅ X (Twitter)
6. ✅ Snapchat
7. ✅ Pinterest
8. ✅ Reddit

**Goal**: Get API credentials so bots can post to **ALL** your accounts automatically!

---

## 📱 **1. TIKTOK API SETUP**

### **Step 1: Create Developer Account**
1. Go to: https://developers.tiktok.com/
2. Click "Register" or "Log In"
3. Use your @digitalkinglyt4lyfe account credentials
4. Complete developer registration

### **Step 2: Create an App**
1. Go to "My Apps" → "Create App"
2. App Name: "PROFITHACK AI Bot"
3. Description: "Automated content posting bot"
4. App Icon: Upload any logo
5. Click "Create"

### **Step 3: Get Content Posting API Access**
1. In your app dashboard, go to "Products"
2. Find "Content Posting API"
3. Click "Add Product"
4. Fill out application form:
   - Use case: "Automated content creation and posting"
   - Expected volume: "10-50 posts per day"
5. Submit for review (takes 1-2 weeks)

### **Step 4: Get Your Credentials**
Once approved:
1. Go to your app settings
2. Copy **Client Key**
3. Copy **Client Secret**
4. Save these - you'll enter them in PROFITHACK

### **Rate Limits**
- ✅ 5-10 posts per day per account
- ✅ Video duration: Up to 60 seconds
- ⚠️ No trending sounds via API
- ⚠️ Effects must be pre-rendered in video

---

## 📸 **2. INSTAGRAM API SETUP (Meta)**

### **Step 1: Create Meta Developer Account**
1. Go to: https://developers.facebook.com/
2. Log in with Facebook account
3. Click "Get Started"
4. Complete verification (may require phone/ID)

### **Step 2: Create an App**
1. Click "My Apps" → "Create App"
2. Select "Business" as app type
3. App Name: "PROFITHACK Content Bot"
4. Contact Email: Your email
5. Click "Create App"

### **Step 3: Add Instagram Basic Display**
1. In app dashboard, click "Add Product"
2. Find "Instagram Basic Display"
3. Click "Set Up"
4. Configure settings:
   - Valid OAuth Redirect URIs: `https://workspace.aiprofitamplifi.repl.co/auth/instagram/callback`
   - Deauthorize Callback URL: Same as above
   - Data Deletion Request URL: Same as above

### **Step 4: Add Instagram Content Publishing**
1. Go to "Products" → Add "Instagram Graph API"
2. Apply for "Content Publishing" permission
3. Use case: "Automated social media management"
4. Submit for review

### **Step 5: Get Your Credentials**
1. Go to Settings → Basic
2. Copy **App ID**
3. Copy **App Secret**
4. Under "Instagram Basic Display" → "User Token Generator"
5. Add your Instagram account (@digitalkinglyt4lyfe)
6. Generate **Access Token**

### **Step 6: Get Long-Lived Token**
```
https://graph.facebook.com/oauth/access_token?
  grant_type=fb_exchange_token&
  client_id={app-id}&
  client_secret={app-secret}&
  fb_exchange_token={short-lived-token}
```

### **Rate Limits**
- ✅ 25 posts per day per account
- ✅ Reels, Stories, Feed posts
- ✅ Hashtags, captions, locations
- ⚠️ Video must be under 90 seconds for Reels

---

## 🎥 **3. YOUTUBE API SETUP**

### **Step 1: Google Cloud Console**
1. Go to: https://console.cloud.google.com/
2. Create new project: "PROFITHACK Bots"
3. Enable billing (free tier available)

### **Step 2: Enable YouTube Data API**
1. Go to "APIs & Services" → "Library"
2. Search "YouTube Data API v3"
3. Click "Enable"

### **Step 3: Create Credentials**
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Configure consent screen:
   - App name: "PROFITHACK AI"
   - User support email: Your email
   - Developer contact: Your email
4. Create OAuth client:
   - Application type: "Web application"
   - Authorized redirect URIs: `https://workspace.aiprofitamplifi.repl.co/auth/youtube/callback`

### **Step 4: Get Your Credentials**
1. Download OAuth client JSON file
2. Copy **Client ID**
3. Copy **Client Secret**
4. You'll need to generate refresh token (I'll help)

### **Step 5: Request YouTube Upload Access**
1. Go to "OAuth consent screen"
2. Add scope: `https://www.googleapis.com/auth/youtube.upload`
3. Submit for verification
4. Add test users while in development

### **Rate Limits**
- ✅ 10,000 quota units per day (1 video upload = 1,600 units = ~6 uploads/day)
- ✅ Shorts, regular videos, live streams
- ✅ Full metadata (title, description, tags, category)

---

## 📘 **4. FACEBOOK API SETUP (Meta)**

### **Step 1: Use Same Meta App**
- Use the same app from Instagram setup
- No need to create new app

### **Step 2: Add Facebook Pages**
1. Go to app dashboard
2. Add product: "Facebook Login"
3. Add product: "Facebook Pages API"

### **Step 3: Get Page Access Token**
1. Go to Tools → Graph API Explorer
2. Select your PROFITHACK app
3. Select your Facebook Page
4. Request permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `publish_video`
5. Generate token

### **Step 4: Convert to Long-Lived Token**
Same process as Instagram above

### **Rate Limits**
- ✅ 50 posts per day per page
- ✅ Videos up to 10 minutes
- ✅ Link previews, images, polls

---

## 🐦 **5. X (TWITTER) API SETUP**

### **Step 1: Apply for Developer Account**
1. Go to: https://developer.twitter.com/
2. Sign up for developer account
3. Verify email and phone

### **Step 2: Create Project and App**
1. Create new project: "PROFITHACK Bots"
2. Create new app: "Content Automation"
3. Save your API keys immediately

### **Step 3: Elevate to Pro Access (Paid)**
⚠️ **Important**: Free tier is read-only!
1. Go to Products → API Plans
2. Subscribe to "Basic" ($100/month) or "Pro" ($5,000/month)
3. Basic allows: 3 posts per month (not useful)
4. **Alternative**: Use free tier for read-only, post manually

### **Step 4: Get Your Credentials**
1. Copy **API Key** (Consumer Key)
2. Copy **API Secret** (Consumer Secret)
3. Copy **Bearer Token**
4. Generate **Access Token** and **Access Token Secret**

### **OAuth Flow** (for posting)
1. Under app settings → "Keys and tokens"
2. Generate "Access Token and Secret"
3. Save both securely

### **Rate Limits**
- ⚠️ Free tier: NO posting ability
- ✅ Basic ($100/mo): 3 posts per month (!!)
- ✅ Pro ($5,000/mo): 100 posts per month
- 💡 **Recommendation**: Post manually or use scheduled tool

---

## 👻 **6. SNAPCHAT API SETUP**

### **Step 1: Create Business Account**
1. Go to: https://business.snapchat.com/
2. Create business account
3. Set up Business Manager

### **Step 2: Apply for Marketing API**
1. Go to: https://kit.snapchat.com/
2. Create new organization
3. Apply for Snap Kit access
4. Use case: "Content distribution and marketing"

### **Step 3: Create App**
1. Create OAuth app
2. Add "Creative Kit" component
3. Configure redirect URI: `https://workspace.aiprofitamplifi.repl.co/auth/snapchat/callback`

### **Step 4: Get Credentials**
1. Copy **OAuth Client ID**
2. Copy **OAuth Client Secret**
3. Generate access token

### **⚠️ Important Notes**
- Snapchat API is primarily for ads
- Organic posting is LIMITED via API
- Consider using Snap Kit for sharing only
- **Recommendation**: Manual posting may be easier

### **Rate Limits**
- Limited organic posting via API
- Primarily for ad management
- Spotlight submissions possible but restricted

---

## 📌 **7. PINTEREST API SETUP**

### **Step 1: Create Business Account**
1. Go to: https://www.pinterest.com/business/create/
2. Convert to business account (free)
3. Claim your website

### **Step 2: Create App**
1. Go to: https://developers.pinterest.com/
2. Click "My Apps" → "Create App"
3. App name: "PROFITHACK Automation"
4. Description: "Content automation bot"

### **Step 3: Get API Access**
1. Fill out app details
2. Request "Pins" permission
3. Request "Boards" permission
4. Submit for review

### **Step 4: Get Credentials**
1. Copy **App ID**
2. Copy **App Secret**
3. Configure OAuth:
   - Redirect URI: `https://workspace.aiprofitamplifi.repl.co/auth/pinterest/callback`

### **Step 5: Generate Access Token**
1. Use OAuth flow to get user token
2. Exchange for long-lived token

### **Rate Limits**
- ✅ 200 pins per day per user
- ✅ Idea Pins (like Stories)
- ✅ Standard pins with images/videos
- ✅ Rich pins with metadata

---

## 🤖 **8. REDDIT API SETUP**

### **Step 1: Create Reddit App**
1. Go to: https://www.reddit.com/prefs/apps
2. Scroll to "developed applications"
3. Click "create another app"
4. Fill out:
   - Name: "PROFITHACK Bot"
   - Type: "script" (for personal use) or "web app"
   - Description: "Automated content posting"
   - Redirect URI: `https://workspace.aiprofitamplifi.repl.co/auth/reddit/callback`

### **Step 2: Get Credentials**
1. Copy **Client ID** (under app name)
2. Copy **Client Secret**
3. Note your Reddit username and password (needed for auth)

### **Step 3: Understand Restrictions**
⚠️ Reddit is VERY strict about automation:
- Must follow subreddit rules
- No spam/self-promotion in most subreddits
- Bots must be transparent (username should indicate bot)
- Rate limits are strict

### **Rate Limits**
- ✅ 1 post per 10 minutes per subreddit
- ✅ Max 100 API requests per minute
- ⚠️ Each subreddit has own posting rules
- ⚠️ New accounts have severe restrictions

### **Best Practice**
- Use "bot" in username (e.g., digitalking_bot)
- Disclose automation in profile
- Only post to subreddits that allow bots
- Quality over quantity

---

## 🔐 **SECURITY & STORAGE**

### **Where to Enter Credentials**
Once you have all API credentials, enter them in:
- **PROFITHACK Dashboard**: https://workspace.aiprofitamplifi.repl.co/social-media-settings

I'll create a secure form where you paste:
1. Platform name
2. API Key/Client ID
3. API Secret/Client Secret
4. Access Token (if required)
5. Account username to post to

### **How They're Stored**
- ✅ Encrypted in Replit Secrets
- ✅ Never visible in code
- ✅ Only used by authenticated bots
- ✅ Can be revoked anytime

---

## 📊 **SUMMARY: WHAT YOU NEED**

### **Easy to Get (Start Here)**
1. ✅ **Pinterest** - Easy approval, 200 posts/day
2. ✅ **YouTube** - Free tier, 6 uploads/day
3. ✅ **Instagram/Facebook** - Same app, good limits
4. ✅ **Reddit** - Instant, but requires careful use

### **Moderate Difficulty**
5. ⏳ **TikTok** - Approval takes 1-2 weeks, 5-10 posts/day

### **Difficult/Expensive**
6. ⚠️ **X/Twitter** - $100/month for Basic (3 posts/month!)
7. ⚠️ **Snapchat** - Limited organic posting via API

---

## 🚀 **RECOMMENDED PRIORITY**

### **Week 1: Quick Wins**
1. Set up **Pinterest** (easiest, 200/day)
2. Set up **Reddit** (instant, but strict rules)
3. Set up **YouTube** (free, 6/day)

### **Week 2: Meta Platforms**
4. Set up **Instagram** (25/day)
5. Set up **Facebook** (50/day)

### **Week 3: TikTok**
6. Apply for **TikTok** (wait for approval)

### **Optional: Skip These**
- ❌ **X/Twitter** - Too expensive for value
- ❌ **Snapchat** - Limited API access

---

## 🎯 **NEXT STEPS**

1. **Start with Pinterest** (easiest)
   - Takes 5 minutes to set up
   - 200 posts per day
   - Good for visual content

2. **Set up YouTube** (best reach)
   - Free tier
   - Shorts are like TikTok/Reels
   - 6 videos per day

3. **Apply for Instagram/Facebook** (most important)
   - Same app for both
   - Combined 75 posts/day
   - Best engagement

4. **Apply for TikTok** (your main account)
   - Will take 1-2 weeks
   - Meanwhile, test content on other platforms

**Tell me when you're ready, and I'll:**
1. Create the credential input form
2. Build the OAuth flows
3. Configure the bots
4. Start posting to all platforms!

---

*Updated: October 29, 2025*
*Platforms: 8 total*
*Recommended: Start with Pinterest, YouTube, Instagram*
