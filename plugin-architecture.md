# CreatorVerse Plugin Architecture

## Vision
Transform CreatorVerse into a **creator platform** where users can build, share, and monetize plugins, AI agents, and content creation tools.

## Core Concepts

### 1. Plugin Types
- **AI Agents** - Bots that generate content (text, images, videos, code)
- **Content Tools** - Editors, filters, effects (CapCut, video editors, image processors)
- **Workflow Automation** - Chain multiple actions together
- **Integrations** - Connect to external services (social media, cloud storage, APIs)
- **Themes & Templates** - Custom UI themes and project templates
- **Analytics** - Custom dashboards and reporting tools

### 2. Plugin Manifest (plugin.json)
Every plugin has a manifest describing its capabilities:

```json
{
  "id": "capcut-video-editor",
  "name": "CapCut Video Editor",
  "version": "1.0.0",
  "author": "creator123",
  "description": "Professional video editing powered by CapCut API",
  "type": "content-tool",
  "permissions": [
    "videos.read",
    "videos.write",
    "storage.write"
  ],
  "pricing": {
    "model": "free|freemium|paid|subscription",
    "price": 500,
    "currency": "credits"
  },
  "capabilities": {
    "videoEdit": true,
    "aiGeneration": false,
    "exportFormats": ["mp4", "mov", "webm"]
  },
  "entrypoint": "https://plugin-cdn.creatorverse.app/capcut/main.js",
  "icon": "https://plugin-cdn.creatorverse.app/capcut/icon.png",
  "screenshots": [
    "https://plugin-cdn.creatorverse.app/capcut/screenshot1.png"
  ]
}
```

### 3. Plugin API
Plugins interact with CreatorVerse through a standardized API:

```typescript
// CreatorVerse Plugin SDK
interface CreatorVerseAPI {
  // User Context
  user: {
    getId(): string;
    getCredits(): number;
    consumeCredits(amount: number): Promise<void>;
  };
  
  // Content Management
  videos: {
    list(): Promise<Video[]>;
    get(id: string): Promise<Video>;
    create(data: CreateVideoData): Promise<Video>;
    update(id: string, data: UpdateVideoData): Promise<Video>;
    delete(id: string): Promise<void>;
  };
  
  // Storage
  storage: {
    upload(file: File, path: string): Promise<string>;
    download(path: string): Promise<Blob>;
    delete(path: string): Promise<void>;
  };
  
  // AI Services
  ai: {
    generate(prompt: string, model: AIModel): Promise<string>;
    createImage(prompt: string): Promise<string>;
    transcribe(audioUrl: string): Promise<string>;
  };
  
  // UI Hooks
  ui: {
    showModal(component: React.Component): Promise<any>;
    showToast(message: string, type: 'success'|'error'): void;
    registerMenuItem(location: string, item: MenuItem): void;
  };
  
  // Events
  events: {
    on(event: string, handler: Function): void;
    emit(event: string, data: any): void;
  };
}
```

### 4. Plugin Execution Models

#### A. Iframe Sandboxing (for UI plugins)
- Plugin UI runs in isolated iframe
- Communication via postMessage API
- Limited DOM access for security

#### B. WebAssembly (for compute-heavy plugins)
- Run native code safely in browser
- Used for video processing, AI inference
- Memory-safe, performance-optimized

#### C. Server-Side (for API integrations)
- Plugins run on CreatorVerse backend
- Used for sensitive operations (payments, external APIs)
- Node.js sandbox environment

### 5. Permission System
Plugins request specific permissions:

```typescript
enum PluginPermission {
  // Content
  'videos.read',
  'videos.write',
  'videos.delete',
  'projects.read',
  'projects.write',
  
  // Storage
  'storage.read',
  'storage.write',
  
  // User Data
  'user.profile',
  'user.credits',
  
  // AI Services
  'ai.generate',
  'ai.image',
  'ai.video',
  
  // Network
  'network.external',
  'network.webhook',
  
  // Monetization
  'payments.charge',
  'payments.refund',
}
```

## Database Schema

```typescript
// plugins table
export const plugins = pgTable("plugins", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  authorId: varchar("author_id").notNull().references(() => users.id),
  version: varchar("version").notNull().default("1.0.0"),
  type: varchar("type").notNull(), // 'ai-agent', 'content-tool', 'integration', etc.
  manifest: jsonb("manifest").notNull(), // Full plugin.json
  status: varchar("status").notNull().default("draft"), // draft, pending, approved, rejected
  downloads: integer("downloads").notNull().default(0),
  rating: numeric("rating").default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// plugin_installs table
export const pluginInstalls = pgTable("plugin_installs", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id").notNull().references(() => users.id),
  pluginId: varchar("plugin_id").notNull().references(() => plugins.id),
  version: varchar("version").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  settings: jsonb("settings").default({}),
  installedAt: timestamp("installed_at").notNull().defaultNow(),
});

// plugin_reviews table
export const pluginReviews = pgTable("plugin_reviews", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  pluginId: varchar("plugin_id").notNull().references(() => plugins.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// plugin_transactions table (for paid plugins)
export const pluginTransactions = pgTable("plugin_transactions", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id").notNull().references(() => users.id),
  pluginId: varchar("plugin_id").notNull().references(() => plugins.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // in credits
  authorShare: integer("author_share").notNull(), // 70% to author
  platformFee: integer("platform_fee").notNull(), // 30% to platform
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

## Plugin Marketplace

### Discovery
- **Search** - By name, category, tags
- **Categories** - AI Agents, Video Tools, Code Editors, etc.
- **Trending** - Most downloaded this week
- **Top Rated** - Highest user ratings
- **Featured** - Curated by CreatorVerse team

### Monetization Models
1. **Free** - No charge, open source
2. **Freemium** - Basic free, premium features cost credits
3. **Paid** - One-time purchase with credits
4. **Subscription** - Monthly credit charge
5. **Usage-Based** - Pay per use (AI generations, exports, etc.)

### Revenue Sharing
- **Creator**: 70% of plugin revenue
- **Platform**: 30% platform fee
- Paid in credits, convertible to cash via wallet

## AI Agent Integration

### Supported AI Providers
1. **OpenAI** - GPT-4, DALL-E, Whisper
2. **Anthropic** - Claude
3. **Google AI** - Gemini, Imagen
4. **Stability AI** - Stable Diffusion
5. **Replicate** - Community models
6. **Hugging Face** - Open source models

### API Key Management
- Users provide their own API keys (stored encrypted)
- Or use CreatorVerse's pooled API (costs credits)
- Key usage tracked and limited

### Agent Capabilities
```typescript
// Example: Content Generation Agent
{
  "id": "gpt4-writer",
  "name": "GPT-4 Content Writer",
  "type": "ai-agent",
  "capabilities": {
    "generate": {
      "text": true,
      "code": true,
      "maxTokens": 4000
    }
  },
  "pricing": {
    "model": "usage-based",
    "costPerGeneration": 10 // credits
  }
}
```

## CapCut Integration

### CapCut API Integration
```typescript
// CapCut Plugin Example
class CapCutPlugin {
  async editVideo(videoUrl: string, edits: CapCutEdits): Promise<string> {
    // 1. Upload video to CapCut
    const uploadedId = await capcut.upload(videoUrl);
    
    // 2. Apply edits (trim, effects, transitions)
    const editedId = await capcut.edit(uploadedId, edits);
    
    // 3. Export and return URL
    const exportUrl = await capcut.export(editedId);
    
    return exportUrl;
  }
}
```

### Video Editing Capabilities
- **Trimming & Splitting** - Cut video segments
- **Effects & Filters** - Apply visual effects
- **Transitions** - Scene transitions
- **Text Overlays** - Add captions, titles
- **Audio** - Background music, voiceovers
- **Export** - Multiple formats and resolutions

## Creator SDK

### Plugin Development Workflow
1. **Clone Template** - Start with plugin starter template
2. **Develop Locally** - Test in CreatorVerse sandbox
3. **Submit for Review** - Platform approval process
4. **Publish** - Goes live in marketplace
5. **Update** - Push new versions to users

### Example Plugin Template
```typescript
// my-plugin/src/index.ts
import { CreatorVersePlugin } from '@creatorverse/sdk';

export default class MyPlugin extends CreatorVersePlugin {
  name = 'My Awesome Plugin';
  version = '1.0.0';
  
  async onInstall() {
    // Setup code
    this.api.ui.showToast('Plugin installed!', 'success');
  }
  
  async execute(input: any) {
    // Main plugin logic
    const result = await this.api.ai.generate(input.prompt, 'gpt-4');
    return result;
  }
  
  async onUninstall() {
    // Cleanup
  }
}
```

## Security & Sandboxing

### Security Measures
1. **Code Review** - Manual review of all plugins before approval
2. **Permission System** - Granular permissions with user consent
3. **Rate Limiting** - Prevent abuse of API calls
4. **Sandboxing** - Isolated execution environment
5. **Content Scanning** - Malware and vulnerability scanning
6. **API Key Encryption** - User credentials stored securely

### Sandbox Restrictions
- No direct filesystem access
- Network requests only to approved domains
- Limited memory and CPU usage
- Cannot access other users' data
- Cannot modify platform code

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- ✅ Database schema
- ✅ Plugin registration and storage
- ✅ Basic plugin API
- ✅ Marketplace UI (list, search, install)

### Phase 2: Core Features (Week 3-4)
- ✅ AI agent integration (OpenAI, Anthropic)
- ✅ CapCut integration
- ✅ Plugin sandboxing
- ✅ Permission system

### Phase 3: Creator Tools (Week 5-6)
- ✅ Creator SDK documentation
- ✅ Plugin development templates
- ✅ Testing tools
- ✅ Publishing workflow

### Phase 4: Monetization (Week 7-8)
- ✅ Plugin pricing and payments
- ✅ Revenue sharing
- ✅ Analytics for creators
- ✅ Review and rating system

## Next Steps

1. **Implement database schema** - Add plugin tables
2. **Build Plugin API** - Backend routes for plugin management
3. **Create Marketplace UI** - Browse and install plugins
4. **Integrate first plugins** - CapCut and OpenAI as pilot plugins
5. **Launch Creator SDK** - Documentation and tools for plugin developers

---

**Goal**: Launch with 5-10 flagship plugins (CapCut, GPT-4 Writer, Image Generator, etc.) and enable creators to build their own within 2 months.
