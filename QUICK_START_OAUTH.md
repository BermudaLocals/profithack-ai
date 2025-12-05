# Quick Start: OAuth Social Import Setup

## 🚨 **Fix for "Foreign Key Constraint" Error**

**The error you saw:**
```json
{
  "message": "Failed to generate codes",
  "error": "insert or update on table \"invite_codes\" violates foreign key constraint"
}
```

**Root cause:** User trying to generate codes wasn't logged in with Replit Auth yet.

**✅ FIXED!** I've added better error handling that checks if the user exists before generating codes.

---

## 🎯 **Next Steps to Enable Social Import**

To enable the social contact import feature, you need OAuth credentials from each platform.

### **Priority Order** (Do these first):

1. **Instagram** - Most popular for creators
2. **TikTok** - Essential for viral growth
3. **Twitter** - Good for tech audience
4. **Facebook** - Large user base
5. **LinkedIn** - Professional network

---

## ⚡ **Super Quick Setup** (15 minutes per platform)

### **Instagram** (via Facebook)

1. https://developers.facebook.com/apps → **Create App**
2. Add **Instagram Basic Display**
3. Redirect URI: `https://your-app.replit.app/api/social/callback/instagram`
4. Copy **Client ID** + **Client Secret**
5. Add to Replit Secrets:
   - `INSTAGRAM_CLIENT_ID`
   - `INSTAGRAM_CLIENT_SECRET`

### **TikTok**

1. https://developers.tiktok.com/ → **Create App**
2. Add **Login Kit**
3. Redirect URI: `https://your-app.replit.app/api/social/callback/tiktok`
4. Select scopes: `user.info.basic`, `user.info.profile`
5. Copy **Client Key** (=Client ID) + **Client Secret**
6. Add to Replit Secrets:
   - `TIKTOK_CLIENT_ID`
   - `TIKTOK_CLIENT_SECRET`

### **Twitter (X)**

1. https://developer.twitter.com/ → **Create Project**
2. **Create App** in project
3. **User authentication settings** → OAuth 2.0
4. Redirect URI: `https://your-app.replit.app/api/social/callback/twitter`
5. Copy **OAuth 2.0 Client ID** + **Client Secret**
6. Add to Replit Secrets:
   - `TWITTER_CLIENT_ID`
   - `TWITTER_CLIENT_SECRET`

### **Facebook**

1. https://developers.facebook.com/apps → **Create App**
2. Add **Facebook Login**
3. Redirect URI: `https://your-app.replit.app/api/social/callback/facebook`
4. Copy **App ID** + **App Secret**
5. Add to Replit Secrets:
   - `FACEBOOK_APP_ID`
   - `FACEBOOK_APP_SECRET`

### **LinkedIn**

1. https://www.linkedin.com/developers/apps → **Create App**
2. Request **Sign In with LinkedIn**
3. Redirect URI: `https://your-app.replit.app/api/social/callback/linkedin`
4. Copy **Client ID** + **Client Secret**
5. Add to Replit Secrets:
   - `LINKEDIN_CLIENT_ID`
   - `LINKEDIN_CLIENT_SECRET`

---

## 📋 **Checklist**

- [ ] Instagram OAuth setup
- [ ] TikTok OAuth setup
- [ ] Twitter OAuth setup
- [ ] Facebook OAuth setup
- [ ] LinkedIn OAuth setup
- [ ] **Restart Replit app** (IMPORTANT!)
- [ ] Test social import feature

---

## 🧪 **Testing**

After adding secrets and restarting:

1. Go to your app
2. Navigate to **Import Contacts** page
3. Click **Connect Instagram** (or any platform)
4. Authorize the app
5. View imported contacts!

---

## 🆘 **Common Issues**

### **"Redirect URI Mismatch"**
- Make sure the redirect URI in your OAuth app settings **exactly matches**:
  ```
  https://your-actual-replit-url.replit.app/api/social/callback/[platform]
  ```

### **Secrets Not Working**
- After adding secrets, you **MUST restart** your Replit app
- Click the **Stop** button, then **Run** again

### **"Invalid Client"**
- Double-check you copied Client ID and Secret correctly
- No extra spaces or characters

---

## ✅ **You're Done!**

Once you have at least **Instagram + TikTok** set up, your social import feature is ready to use!

For complete details, see **`OAUTH_SETUP_GUIDE.md`**

---

*Platform supports 8+ social platforms for maximum reach!*
