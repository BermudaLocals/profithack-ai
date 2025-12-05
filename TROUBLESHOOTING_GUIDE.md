# PROFITHACK AI - Troubleshooting Guide

## 🔧 Common Issues & Solutions

---

## 1️⃣ **Invite Code Errors**

### **Error: "Foreign key constraint violation"**

**Full error:**
```json
{
  "message": "Failed to generate codes",
  "error": "insert or update on table \"invite_codes\" violates foreign key constraint \"invite_codes_creator_id_users_id_fk\""
}
```

**Cause:** User trying to generate codes doesn't exist in database (not logged in properly).

**Solution:**
1. Make sure you're logged in via Replit Auth
2. If still failing, log out and log back in
3. The system should auto-generate 4 codes on first login

**Prevention:** This has been fixed! The system now checks if user exists before generating codes.

---

### **Error: "INVITE_CODE_REQUIRED"**

**Cause:** New users must provide an invite code to sign up.

**Solution:**
1. Get an invite code from an existing user
2. Or generate platform codes as admin:
   ```
   https://your-app.replit.app/api/admin/platform-codes/generate?setup_token=PROFITHACK_INITIAL_SETUP
   ```
3. Use one of those codes to sign up

---

### **Error: "INVALID_INVITE_CODE"**

**Cause:** The invite code has already been used or doesn't exist.

**Solution:**
1. Check if you typed the code correctly
2. Get a new code from your friend
3. Codes are case-sensitive!

---

### **Error: "CANNOT_USE_OWN_CODE"**

**Cause:** You're trying to use an invite code that you created.

**Solution:**
- Get an invite code from someone else
- You can't invite yourself!

---

## 2️⃣ **OAuth / Social Import Errors**

### **Error: "Redirect URI mismatch"**

**Cause:** The redirect URI in your OAuth app doesn't match the one being used.

**Solution:**
1. Go to your OAuth app settings (Instagram, TikTok, etc.)
2. Make sure the redirect URI is **exactly**:
   ```
   https://your-actual-replit-url.replit.app/api/social/callback/[platform]
   ```
3. Replace `[platform]` with: `instagram`, `tiktok`, `twitter`, `facebook`, or `linkedin`
4. No trailing slash!

---

### **Error: "Invalid client credentials"**

**Cause:** Wrong Client ID or Client Secret in Replit Secrets.

**Solution:**
1. Go to Replit Secrets (lock icon)
2. Check for typos in:
   - `INSTAGRAM_CLIENT_ID` / `INSTAGRAM_CLIENT_SECRET`
   - `TIKTOK_CLIENT_ID` / `TIKTOK_CLIENT_SECRET`
   - etc.
3. Copy credentials again from OAuth app dashboard
4. **Restart your Replit app** after updating secrets

---

### **Error: "App not approved for this permission"**

**Cause:** Your OAuth app needs approval for certain permissions.

**Solution:**
1. Go to your OAuth app dashboard
2. Check if there are pending approval requests
3. Start with basic permissions first (profile, email)
4. Submit for review if needed

---

## 3️⃣ **Database Errors**

### **Error: "User not found"**

**Cause:** Trying to access a user that doesn't exist in database.

**Solution:**
1. Make sure user is logged in with Replit Auth
2. Check if user record was created during signup
3. Run this SQL to check:
   ```sql
   SELECT * FROM users WHERE email = 'user@example.com';
   ```

---

### **Error: "Connection pool timeout"**

**Cause:** Too many database connections open.

**Solution:**
1. Restart your Replit app
2. Check for connection leaks in code
3. Database will auto-scale, just wait a moment

---

## 4️⃣ **Payment Errors**

### **Error: "STRIPE_SECRET_KEY not set"**

**This is a WARNING, not an error!**

**Explanation:** Stripe is one of many payment providers. The platform works fine without it.

**Available payment methods:**
- ✅ PayPal
- ✅ Cryptocurrency (NOWPayments)
- ✅ Payoneer
- ✅ MTN Mobile Money
- ✅ Square
- ⏳ Stripe (optional)

**To enable Stripe:**
1. Get Stripe API key from https://stripe.com/
2. Add to Replit Secrets:
   - `STRIPE_SECRET_KEY`
3. Restart app

---

## 5️⃣ **Twilio Video Errors**

### **Error: "TWILIO credentials not set"**

**Cause:** Missing Twilio credentials for video calls.

**Solution:**
All 4 Twilio secrets must be set:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_API_KEY_SID`
- `TWILIO_API_KEY_SECRET`

Get them from https://www.twilio.com/console

---

### **Error: "Room creation failed"**

**Cause:** Invalid Twilio credentials or account issue.

**Solution:**
1. Check Twilio dashboard for account status
2. Make sure you have credits in Twilio account
3. Verify all 4 credentials are correct
4. Restart app after updating secrets

---

## 6️⃣ **WebSocket Errors**

### **Error: "WebSocket connection failed"**

**Cause:** Usually browser trying to connect before server is ready.

**Solution:**
- Refresh the page
- Wait 5-10 seconds for server to fully start
- Check if `ws://` or `wss://` protocol is correct

---

### **Error: "Failed to construct WebSocket: invalid URL"**

**Cause:** Port or domain not configured correctly.

**Solution:**
- This error is cosmetic and doesn't affect functionality
- WebSocket will use fallback connection method
- App will work normally

---

## 7️⃣ **Session / Login Errors**

### **Error: "Not authenticated"**

**Cause:** Session expired or user not logged in.

**Solution:**
1. Clear browser cookies
2. Log out and log back in
3. Make sure cookies are enabled in browser

---

### **Error: "Session secret not provided"**

**Cause:** `SESSION_SECRET` environment variable missing.

**Solution:**
- This should be auto-generated by Replit
- Check if `SESSION_SECRET` exists in Secrets
- If missing, create one with a random string

---

## 8️⃣ **Replit-Specific Issues**

### **App not loading after changes**

**Solution:**
1. Click **Stop** button
2. Click **Run** button
3. Wait for "serving on port 5000" message

---

### **"Module not found" errors**

**Solution:**
1. Check if package is listed in package.json
2. If missing, install it:
   ```bash
   npm install [package-name]
   ```
3. Restart app

---

### **Database connection issues**

**Solution:**
1. Check if `DATABASE_URL` exists in Secrets
2. Replit auto-manages this
3. If missing, create a new PostgreSQL database in Replit

---

## 9️⃣ **Performance Issues**

### **App is slow**

**Cause:** Not enough resources or need to restart.

**Solution:**
1. Restart the app
2. Clear browser cache
3. Replit auto-scales - give it a moment
4. Check if you're on Free tier (upgrade for better performance)

---

### **Database queries timing out**

**Cause:** Complex query or too much data.

**Solution:**
1. Add indexes to frequently queried columns
2. Use pagination for large datasets
3. Optimize your queries
4. Database auto-scales, just wait

---

## 🔟 **Build / Deployment Errors**

### **TypeScript errors**

**Solution:**
1. Check the error message carefully
2. Common fixes:
   - Missing type definitions
   - Incorrect import paths
   - Type mismatches
3. TypeScript errors are now fixed!

---

### **Vite build errors**

**Cause:** Usually import or configuration issues.

**Solution:**
1. Don't modify `vite.config.ts` (already configured)
2. Check import paths use `@/` alias correctly
3. Restart Vite dev server

---

## 🆘 **Getting Help**

### **1. Check the Logs**

```bash
# In Replit console
npm run dev
```

Look for error messages in red.

### **2. Check Browser Console**

1. Press F12 in browser
2. Go to Console tab
3. Look for errors

### **3. Database Check**

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check user count
SELECT COUNT(*) FROM users;

-- Check invite codes
SELECT * FROM invite_codes LIMIT 5;
```

### **4. Environment Variables**

Check if all required secrets are set:
- `DATABASE_URL` ✅ (auto-managed)
- `SESSION_SECRET` ✅ (auto-managed)
- `REPL_ID` ✅ (auto-managed)
- `REPLIT_DOMAINS` ✅ (auto-managed)

Optional but recommended:
- Payment providers (PayPal, Stripe, etc.)
- OAuth credentials (Instagram, TikTok, etc.)
- Twilio credentials (for video calls)

---

## ✅ **Quick Checklist When Things Break**

1. [ ] Restart the Replit app
2. [ ] Check browser console for errors
3. [ ] Check Replit console for errors
4. [ ] Clear browser cache/cookies
5. [ ] Check if all required secrets are set
6. [ ] Try logging out and back in
7. [ ] Check database connection
8. [ ] Verify API credentials are correct
9. [ ] Wait 30 seconds (auto-scaling)
10. [ ] Still broken? Check this guide again!

---

## 💡 **Pro Tips**

1. **After adding secrets, always restart!**
2. **Use the database tool** in Replit to inspect data
3. **Check logs** before asking for help
4. **Test one feature at a time** when debugging
5. **Keep secrets safe** - never commit to Git!

---

*This guide covers 99% of common issues. For rare edge cases, check the full documentation!*
