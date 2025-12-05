# OAuth Platforms Setup Guide

## 🔐 How to Get OAuth Credentials for Social Import

This guide shows you how to create developer apps and get API credentials for each social platform.

---

## 📱 **1. Instagram OAuth Setup**

### **Step 1: Create Facebook App** (Instagram uses Facebook OAuth)

1. Go to https://developers.facebook.com/apps
2. Click **Create App**
3. Select **Consumer** as app type
4. Fill in:
   - **App Name**: PROFITHACK AI
   - **Contact Email**: Your email
5. Click **Create App**

### **Step 2: Add Instagram Basic Display**

1. In left sidebar, click **Add Product**
2. Find **Instagram Basic Display**
3. Click **Set Up**

### **Step 3: Get Credentials**

1. Go to **Instagram Basic Display** > **Basic Display**
2. Click **Create New App**
3. Fill in:
   - **Display Name**: PROFITHACK AI
   - **Valid OAuth Redirect URIs**: 
     ```
     https://your-app.replit.app/api/social/callback/instagram
     ```
   - **Deauthorize Callback URL**: 
     ```
     https://your-app.replit.app/api/social/deauthorize/instagram
     ```
   - **Data Deletion Request URL**:
     ```
     https://your-app.replit.app/api/social/delete/instagram
     ```
4. Save changes
5. Copy **Instagram App ID** and **Instagram App Secret**

### **Step 4: Add to Replit Secrets**

1. In Replit, go to **Secrets** (lock icon)
2. Add:
   - `INSTAGRAM_CLIENT_ID` = Your Instagram App ID
   - `INSTAGRAM_CLIENT_SECRET` = Your Instagram App Secret

---

## 🎵 **2. TikTok OAuth Setup**

### **Step 1: Create TikTok Developer Account**

1. Go to https://developers.tiktok.com/
2. Click **Login**
3. Log in with your TikTok account
4. Complete developer verification

### **Step 2: Create App**

1. Go to **Manage Apps**
2. Click **Create App**
3. Fill in:
   - **App Name**: PROFITHACK AI
   - **Website URL**: https://your-app.replit.app
   - **Category**: Social Networking
   - **Description**: Creator platform with social import

### **Step 3: Configure OAuth**

1. Go to **Login Kit** section
2. Add **Redirect URI**:
   ```
   https://your-app.replit.app/api/social/callback/tiktok
   ```
3. Select scopes:
   - `user.info.basic`
   - `user.info.profile`
   - `user.info.stats`

### **Step 4: Get Credentials**

1. Copy **Client Key** (this is your Client ID)
2. Copy **Client Secret**

### **Step 5: Add to Replit Secrets**

- `TIKTOK_CLIENT_ID` = Your Client Key
- `TIKTOK_CLIENT_SECRET` = Your Client Secret

---

## 🐦 **3. Twitter (X) OAuth Setup**

### **Step 1: Create Twitter Developer Account**

1. Go to https://developer.twitter.com/
2. Click **Sign Up** (or **Apply** if not registered)
3. Complete application form
4. Wait for approval (usually instant for basic tier)

### **Step 2: Create App**

1. Go to **Developer Portal** > **Projects & Apps**
2. Click **Create Project**
3. Fill in:
   - **Project Name**: PROFITHACK AI
   - **Use Case**: Building tools for other users
   - **Description**: Social creator platform

4. Click **Create App**
5. Fill in:
   - **App Name**: profithack-ai
   - **Environment**: Production

### **Step 3: Set Up OAuth 2.0**

1. Go to app **Settings**
2. Click **User authentication settings**
3. Click **Set up**
4. Configure:
   - **App permissions**: Read
   - **Type of App**: Web App
   - **Callback URI**: 
     ```
     https://your-app.replit.app/api/social/callback/twitter
     ```
   - **Website URL**: https://your-app.replit.app
5. Save

### **Step 4: Get Credentials**

1. Go to **Keys and Tokens** tab
2. Under **OAuth 2.0 Client ID and Client Secret**:
   - Copy **Client ID**
   - Copy **Client Secret**

### **Step 5: Add to Replit Secrets**

- `TWITTER_CLIENT_ID` = Your OAuth 2.0 Client ID
- `TWITTER_CLIENT_SECRET` = Your OAuth 2.0 Client Secret

---

## 📘 **4. Facebook OAuth Setup**

### **Step 1: Create Facebook App**

1. Go to https://developers.facebook.com/apps
2. Click **Create App**
3. Select **Consumer** as app type
4. Fill in:
   - **App Name**: PROFITHACK AI
   - **Contact Email**: Your email
5. Click **Create App**

### **Step 2: Add Facebook Login**

1. In left sidebar, click **Add Product**
2. Find **Facebook Login**
3. Click **Set Up**
4. Select **Web** platform
5. Enter site URL: https://your-app.replit.app

### **Step 3: Configure OAuth Settings**

1. Go to **Facebook Login** > **Settings**
2. Add **Valid OAuth Redirect URIs**:
   ```
   https://your-app.replit.app/api/social/callback/facebook
   ```
3. Save changes

### **Step 4: Get Credentials**

1. Go to **Settings** > **Basic**
2. Copy **App ID**
3. Click **Show** next to **App Secret**
4. Copy **App Secret**

### **Step 5: Add to Replit Secrets**

- `FACEBOOK_APP_ID` = Your App ID
- `FACEBOOK_APP_SECRET` = Your App Secret

---

## 💼 **5. LinkedIn OAuth Setup**

### **Step 1: Create LinkedIn App**

1. Go to https://www.linkedin.com/developers/apps
2. Click **Create App**
3. Fill in:
   - **App Name**: PROFITHACK AI
   - **LinkedIn Page**: Your company page (or create one)
   - **Privacy Policy URL**: https://your-app.replit.app/privacy
   - **App Logo**: Upload a logo
   - **Legal Agreement**: Accept
4. Click **Create App**

### **Step 2: Request Products**

1. Go to **Products** tab
2. Request **Sign In with LinkedIn using OpenID Connect**
3. Wait for approval (usually instant)

### **Step 3: Configure OAuth**

1. Go to **Auth** tab
2. Under **OAuth 2.0 Settings**:
   - Add **Redirect URLs**:
     ```
     https://your-app.replit.app/api/social/callback/linkedin
     ```

### **Step 4: Get Credentials**

1. Go to **Auth** tab
2. Copy **Client ID**
3. Copy **Client Secret** (click **Show**)

### **Step 5: Add to Replit Secrets**

- `LINKEDIN_CLIENT_ID` = Your Client ID
- `LINKEDIN_CLIENT_SECRET` = Your Client Secret

---

## 👻 **6. Snapchat OAuth Setup** (Optional)

### **Step 1: Create Snapchat App**

1. Go to https://kit.snapchat.com/
2. Click **Get Started**
3. Create account or sign in
4. Click **Create App**
5. Fill in app details

### **Step 2: Configure OAuth**

1. Go to **OAuth Settings**
2. Add **Redirect URI**:
   ```
   https://your-app.replit.app/api/social/callback/snapchat
   ```

### **Step 3: Get Credentials**

- Copy **Client ID**
- Copy **Client Secret**

### **Step 4: Add to Replit Secrets**

- `SNAPCHAT_CLIENT_ID` = Your Client ID
- `SNAPCHAT_CLIENT_SECRET` = Your Client Secret

---

## 💬 **7. Discord OAuth Setup** (Optional)

### **Step 1: Create Discord App**

1. Go to https://discord.com/developers/applications
2. Click **New Application**
3. Enter name: **PROFITHACK AI**
4. Accept ToS and create

### **Step 2: Configure OAuth2**

1. Go to **OAuth2** > **General**
2. Add **Redirects**:
   ```
   https://your-app.replit.app/api/social/callback/discord
   ```
3. Save changes

### **Step 3: Get Credentials**

1. Go to **OAuth2** > **General**
2. Copy **Client ID**
3. Copy **Client Secret**

### **Step 4: Add to Replit Secrets**

- `DISCORD_CLIENT_ID` = Your Client ID
- `DISCORD_CLIENT_SECRET` = Your Client Secret

---

## 📨 **8. Telegram Bot Setup** (Optional)

### **Step 1: Create Bot with BotFather**

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` command
3. Follow prompts:
   - Bot name: **PROFITHACK AI Bot**
   - Username: **profithackai_bot**
4. Copy the **Bot Token**

### **Step 2: Add to Replit Secrets**

- `TELEGRAM_BOT_TOKEN` = Your Bot Token

---

## ✅ **Quick Setup Checklist**

Use this checklist to track your progress:

- [ ] Instagram OAuth configured
- [ ] TikTok OAuth configured
- [ ] Twitter OAuth configured
- [ ] Facebook OAuth configured
- [ ] LinkedIn OAuth configured
- [ ] Snapchat OAuth configured (optional)
- [ ] Discord OAuth configured (optional)
- [ ] Telegram Bot configured (optional)

---

## 🔧 **Testing OAuth Integration**

After adding all credentials to Replit Secrets:

1. **Restart your app** (important!)
2. Go to your app
3. Navigate to **Import Contacts** page
4. Click **Connect** for each platform
5. Authorize the app
6. View imported contacts

---

## 🚨 **Common Issues & Solutions**

### **"Redirect URI Mismatch" Error**

**Solution**: Make sure the redirect URI in your OAuth app settings exactly matches:
```
https://your-actual-replit-url.replit.app/api/social/callback/[platform]
```

### **"Invalid Client" Error**

**Solution**: Double-check that you copied the Client ID and Secret correctly to Replit Secrets.

### **"App Not Approved" Error**

**Solution**: Some platforms require app review for certain permissions. Start with basic read permissions first.

### **Secrets Not Loading**

**Solution**: After adding secrets, restart your Replit app for them to take effect.

---

## 📊 **OAuth Scopes Needed**

Here are the permissions (scopes) you need for each platform:

### **Instagram**
- `user_profile` - Basic profile info
- `user_media` - Access to user's media

### **TikTok**
- `user.info.basic` - Basic user info
- `user.info.profile` - Profile details
- `user.info.stats` - Follower counts

### **Twitter**
- `users.read` - Read user data
- `follows.read` - Read follow relationships

### **Facebook**
- `public_profile` - Basic profile
- `email` - User email
- `user_friends` - Friends list

### **LinkedIn**
- `openid` - OpenID Connect
- `profile` - Profile data
- `email` - Email address

---

## 💰 **Cost & Rate Limits**

| Platform | Cost | Rate Limits |
|----------|------|-------------|
| Instagram | Free | 200 calls/hour |
| TikTok | Free | 10,000 calls/day |
| Twitter | Free (Basic) | 500,000 tweets/month |
| Facebook | Free | 200 calls/hour |
| LinkedIn | Free | 100 calls/day |
| Snapchat | Free | Varies |
| Discord | Free | No limits |
| Telegram | Free | 30 msgs/second |

---

## 🎯 **Next Steps**

1. ✅ Create developer accounts for each platform
2. ✅ Generate OAuth credentials
3. ✅ Add credentials to Replit Secrets
4. ✅ Restart your Replit app
5. ✅ Test each connection
6. ✅ Launch social import feature!

---

## 📞 **Support Links**

- **Instagram**: https://developers.facebook.com/docs/instagram-basic-display-api
- **TikTok**: https://developers.tiktok.com/doc/login-kit-web
- **Twitter**: https://developer.twitter.com/en/docs/authentication/oauth-2-0
- **Facebook**: https://developers.facebook.com/docs/facebook-login
- **LinkedIn**: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2
- **Snapchat**: https://kit.snapchat.com/docs
- **Discord**: https://discord.com/developers/docs/topics/oauth2
- **Telegram**: https://core.telegram.org/bots/api

---

*Last updated: October 27, 2025*  
*For PROFITHACK AI Platform*
