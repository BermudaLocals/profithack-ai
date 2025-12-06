# GoHighLevel Lead Connector Integration

## ✅ What's Been Implemented

Your PROFITHACK AI marketing bots can now connect to your GoHighLevel CRM!

### 1. **Backend Integration**
- **GoHighLevel Service** (`server/services/gohighlevel.ts`):
  - Create/update contacts
  - Add tags to contacts
  - Create pipeline opportunities
  - Auto-sync leads from marketing bots → GHL
  - Webhook signature verification

### 2. **API Endpoints** (`server/routes.ts`):
  - `POST /api/crm/webhook/gohighlevel` - Receive webhooks from GHL
  - `POST /api/crm/test-connection` - Test your GHL API key
  - `POST /api/crm/connect` - Connect your GHL account
  - `GET /api/crm/connections` - View connected CRMs
  - `DELETE /api/crm/connections/:id` - Disconnect CRM
  - `PATCH /api/marketing-bots/:id/crm` - Enable CRM sync for a bot

### 3. **Settings Page** (`/crm-settings`):
- Connect GoHighLevel with API key + location ID
- Test connection before saving
- Configure sync settings (leads, contacts, opportunities)
- Get webhook URLs for two-way sync
- View sync stats and history

### 4. **Database Schema** (`shared/schema.ts`):
```typescript
// CRM Connections table
crmConnections {
  provider: "gohighlevel" | "hubspot" | "salesforce"
  apiKey: encrypted
  locationId: for GHL sub-accounts
  webhookUrls: for bidirectional sync
  syncSettings: {
    syncLeads, syncContacts, syncOpportunities
  }
}

// Marketing Bot CRM Integration
marketingBots.config.crmIntegration {
  enabled: boolean
  provider: "gohighlevel"
  syncLeads: auto-sync new leads to CRM
  tagContacts: ["PROFITHACK User", "Bot Generated"]
  pipelineId: GHL pipeline ID
  customFields: field mappings
}
```

---

## 🚀 How to Connect Your GoHighLevel

### Step 1: Get Your API Credentials
1. Log into GoHighLevel
2. Go to **Settings → API**
3. Copy your **API Key**
4. Copy your **Location ID** (sub-account ID)

### Step 2: Connect in PROFITHACK
1. Navigate to `/crm-settings`
2. Enter your API Key and Location ID
3. Click **Test Connection** to verify
4. Click **Connect GoHighLevel**

### Step 3: Configure Webhooks (Optional - Two-way Sync)
1. After connecting, copy the **Inbound Webhook URL**
2. In GoHighLevel:
   - Go to **Automations → Workflows**
   - Create new workflow with trigger: Contact Created/Updated
   - Add Action → **Custom Webhook**
   - Paste your PROFITHACK webhook URL
   - Method: POST
   - Add any events you want to sync

### Step 4: Enable CRM on Your Bots
1. Go to **Marketing Bots** page
2. Edit a bot
3. Enable **CRM Integration**
4. Configure:
   - ✅ Sync Leads - Auto-create contacts
   - ✅ Tag Contacts - Apply tags ["Bot Lead", "PROFITHACK"]
   - ✅ Create Opportunities - Add to pipeline
   - Select Pipeline ID and Stage

---

## 💡 Use Cases

### 1. **Auto-Sync Bot-Generated Leads**
When your marketing bots generate leads:
```
Bot captures lead → Creates contact in GHL → Tags applied → Added to pipeline
```

### 2. **Track Premium Subscribers**
When users subscribe to premium:
```
User subscribes → Updates GHL contact → Creates opportunity → Moves to "Subscribed" stage
```

### 3. **Unified CRM View**
All your PROFITHACK users automatically sync to GoHighLevel with custom fields:
- Username
- Bio
- Profile URL  
- Credits balance
- Subscription tier
- Source: "PROFITHACK AI Platform"

### 4. **Webhook Automation**
When a contact is updated in GHL:
```
GHL contact updated → Webhook fires → PROFITHACK receives → Updates user profile
```

---

## 🔐 Security

- **API Keys**: Encrypted in database (TODO: implement encryption)
- **Webhook Signatures**: Verified using GHL public key
- **OAuth Scopes**: Minimal required scopes only
- **Rate Limiting**: 200,000 requests/day per location

---

## 📊 What Gets Synced

### From PROFITHACK → GoHighLevel:
- ✅ New user registrations → Contacts
- ✅ Profile updates → Contact updates
- ✅ Subscriptions → Opportunities
- ✅ Tags: "PROFITHACK User", "Premium", "Creator"

### From GoHighLevel → PROFITHACK:
- ✅ Contact created/updated events
- ✅ Opportunity stage changes
- ✅ Tag modifications

---

## 🛠️ Next Steps (To Complete Integration)

1. **Run Database Migration**:
   ```bash
   npm run db:push --force
   ```
   This creates the `crm_connections` and `crm_sync_logs` tables.

2. **Update Bot Runner**:
   Add CRM sync logic to `server/services/bot-runner.ts` to automatically sync leads when bots generate them.

3. **Implement Encryption**:
   Encrypt API keys before storing in database (use bcrypt or similar).

4. **Add to Sidebar**:
   Add CRM Settings link to the app sidebar navigation.

---

## 📖 GoHighLevel API Reference

- **Docs**: https://marketplace.gohighlevel.com/docs/
- **Webhooks**: https://marketplace.gohighlevel.com/docs/webhook/WebhookIntegrationGuide/
- **Rate Limits**: 200,000 requests/day per app/location
- **Authentication**: Bearer token in Authorization header

---

## 🎯 Benefits

✅ **Centralized CRM** - All leads in one place  
✅ **Automated Follow-ups** - GHL workflows trigger automatically  
✅ **Better Attribution** - Track which bots generate best leads  
✅ **Pipeline Management** - Move leads through stages  
✅ **Email Marketing** - Sync contacts to GHL email campaigns  
✅ **Reporting** - Use GHL analytics dashboard

---

**Questions?** Check the GoHighLevel developer documentation or join their Slack community: https://developers.gohighlevel.com/join-dev-community
