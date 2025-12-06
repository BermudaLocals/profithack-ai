# 🤖 Marketing Bots → Discord Auto-Posting Guide

## ✅ What's Been Added

Your marketing bots can now **automatically post to Discord channels** to advertise PROFITHACK AI!

Every 30 seconds, your bots will create new viral content and can automatically share it to Discord via webhooks.

---

## 🎯 How It Works

1. **Bot creates viral content** (title, description, hooks)
2. **Posts to PROFITHACK app** (tube/reels)
3. **Posts to social media** (TikTok, Instagram, etc.)
4. **Posts to Discord** (via webhooks) ← **NEW!**

---

## 🔧 Setup: Create Discord Webhook

### Step 1: Open Your Discord Server

1. Go to your Discord server
2. Right-click the channel where you want posts (e.g., #announcements, #promotions, #new-content)
3. Click **"Edit Channel"**

### Step 2: Create Webhook

1. Go to **"Integrations"** tab
2. Click **"Webhooks"** → **"New Webhook"**
3. Name it: `PROFITHACK AI Bot` (or any name)
4. Choose the channel (where posts will appear)
5. Click **"Copy Webhook URL"**

**Your webhook URL looks like:**
```
https://discord.com/api/webhooks/1234567890/AbCdEfGhIjKlMnOpQrStUvWxYz...
```

### Step 3: Add Webhook to Your Bot

**Option A: Update Bot Config Directly (Database)**

Run this SQL to enable Discord posting for your Content Creator Bot:

```sql
UPDATE marketing_bots 
SET config = jsonb_set(
  config::jsonb,
  '{postToDiscord}',
  'true'::jsonb
) || jsonb_set(
  config::jsonb,
  '{discordWebhooks}',
  '["https://discord.com/api/webhooks/YOUR_WEBHOOK_URL"]'::jsonb
)
WHERE name = 'Content Creator Bot';
```

**Option B: Use Bot Management UI (Coming Soon)**

We'll add a Discord settings page where you can paste webhook URLs directly.

---

## 📊 What Gets Posted to Discord

Your bots will post **rich embeds** with:

**Embed Example:**
```
🚀 If You're NOT Making Money With Your Smartphone in 2026...

If you're not making money with your smartphone in 2026, you're already behind.

PROFITHACK AI combines:
✅ AI Video Generator (Crayo-style)
✅ Code Workspace (No coding needed)
✅ Creator Monetization
✅ 8 Payment Gateways (Global)
✅ Auto Cross-posting to TikTok, Instagram, YouTube

💰 Start FREE: profithackai.com
🎁 Limited invite codes available!

📹 Video Type: ⚡ Short-form (Reel)
⏱️ Duration: 0:45
🎁 Join Beta: Get Invite Code

PROFITHACK AI • Content Creator Bot
```

---

## 🎨 Embed Customization

Embeds are automatically formatted with:
- **Pink/Purple brand colors** (`0xFF00FF`)
- **Rich formatting** with fields
- **Timestamps** for freshness
- **Bot attribution** in footer
- **Clickable links** to profithackai.com

---

## 🚀 Multiple Webhooks

You can add **multiple webhook URLs** to post to different servers/channels:

```sql
UPDATE marketing_bots 
SET config = jsonb_set(
  config::jsonb,
  '{discordWebhooks}',
  '[
    "https://discord.com/api/webhooks/SERVER1_WEBHOOK",
    "https://discord.com/api/webhooks/SERVER2_WEBHOOK",
    "https://discord.com/api/webhooks/SERVER3_WEBHOOK"
  ]'::jsonb
)
WHERE name = 'Content Creator Bot';
```

The bot will post to **all webhooks** simultaneously!

---

## 🔥 Posting Frequency

- **Content Creator Bot**: Posts every ~30 seconds
- **Viral Marketing Bot**: Posts every ~30 seconds
- **Both bots combined**: ~60 Discord posts per minute (if both enabled)

**Recommended Setup:**
- Use different webhooks for different bots
- Spread posts across multiple channels
- Adjust bot schedules to avoid spam

---

## 📝 Example Bot Configurations

### Configuration 1: Discord Only
Post exclusively to Discord (no app/social):

```json
{
  "postToApp": false,
  "postToSocials": false,
  "postToDiscord": true,
  "discordWebhooks": [
    "https://discord.com/api/webhooks/YOUR_WEBHOOK"
  ]
}
```

### Configuration 2: All Platforms
Post to app, social media, AND Discord:

```json
{
  "postToApp": true,
  "postToTube": true,
  "postToReels": true,
  "postToSocials": true,
  "postToDiscord": true,
  "platforms": ["tiktok", "youtube", "instagram"],
  "discordWebhooks": [
    "https://discord.com/api/webhooks/YOUR_WEBHOOK"
  ]
}
```

### Configuration 3: Multiple Discord Servers
Broadcast to many servers at once:

```json
{
  "postToApp": true,
  "postToDiscord": true,
  "discordWebhooks": [
    "https://discord.com/api/webhooks/SERVER1_ANNOUNCEMENTS",
    "https://discord.com/api/webhooks/SERVER2_PROMO",
    "https://discord.com/api/webhooks/SERVER3_MARKETING",
    "https://discord.com/api/webhooks/SERVER4_CONTENT"
  ]
}
```

---

## 🧪 Test Your Setup

### Quick Test SQL

Enable Discord posting for testing:

```sql
-- Enable Discord posting for Content Creator Bot
UPDATE marketing_bots 
SET config = config::jsonb || '{"postToDiscord": true, "discordWebhooks": ["YOUR_WEBHOOK_URL"]}'::jsonb
WHERE name = 'Content Creator Bot';

-- Check the bot will run
SELECT name, status, config FROM marketing_bots WHERE name = 'Content Creator Bot';
```

Within **30 seconds**, you should see a new post in your Discord channel!

---

## 📊 Monitor Discord Posting

Check server logs to see Discord activity:

```
💬 Posting to Discord: 1 webhook(s)
✅ Posted to Discord webhook: https://discord.com/api/webhooks/1234...
```

If you see errors:
```
❌ Discord webhook failed (404): Webhook not found
❌ Discord webhook failed (401): Invalid webhook
```

**Solutions:**
- Verify webhook URL is correct
- Ensure webhook wasn't deleted
- Check webhook channel still exists

---

## 🎯 Use Cases

### 1. **Multi-Server Promotion**
Post to 10+ Discord servers simultaneously to maximize reach

### 2. **Community Engagement**
Auto-post new content to keep your community active

### 3. **Viral Invite Distribution**
Share invite codes across Discord communities

### 4. **Content Announcements**
Notify followers when new videos/features drop

### 5. **Beta Marketing**
Spread awareness about invite-only beta

---

## 🔒 Webhook Security

**Best Practices:**
1. ✅ Don't share webhook URLs publicly (treat like passwords)
2. ✅ Use different webhooks for different bots
3. ✅ Regenerate webhooks if compromised
4. ✅ Monitor webhook activity in Discord audit logs

**To Delete a Webhook:**
1. Server Settings → Integrations → Webhooks
2. Find the webhook
3. Click **Delete**

---

## 🚀 Advanced: Customize Embed Content

Want to customize what gets posted? Edit `server/services/bot-runner.ts`:

```typescript
private async postToDiscord(bot, data) {
  const embed = {
    title: `🚀 ${title}`,           // Customize title
    description: description,        // Customize description
    color: 0xFF00FF,                 // Change color (hex)
    fields: [
      {
        name: 'Custom Field',        // Add your own fields
        value: 'Custom Value',
        inline: true,
      }
    ],
    footer: {
      text: `Your Custom Footer`,    // Change footer
    },
  };
}
```

---

## 📈 Expected Results

With Discord auto-posting enabled:

**Before:**
- Manual invite code distribution
- Limited server reach
- Time-consuming posting

**After:**
- ✅ Automated 24/7 posting
- ✅ Reach 1000s of Discord users
- ✅ Viral invite code distribution
- ✅ Zero manual effort

---

## 🎉 You're All Set!

Your marketing bots will now automatically promote PROFITHACK AI across Discord!

**Next Steps:**
1. Create webhook URLs for your Discord servers
2. Update bot config with webhook URLs
3. Watch automated posts appear every 30 seconds
4. Track growth from Discord referrals

**Questions?** Check the bot-runner logs or Discord webhook documentation.

---

**Last Updated:** November 6, 2025  
**Feature:** Discord Webhook Auto-Posting  
**Status:** 🟢 Live and Ready
