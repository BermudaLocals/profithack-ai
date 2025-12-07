# PROFITHACK AI - COMPLETE GITHUB DEPLOYMENT FILES

All files below are COMPLETE REPLACEMENTS ready to copy-paste to GitHub.

---

## FILE 1: package.json (FULL REPLACEMENT)

```json
{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.70.0",
    "@aws-sdk/client-s3": "^3.917.0",
    "@grpc/grpc-js": "^1.14.1",
    "@grpc/proto-loader": "^0.8.0",
    "@hookform/resolvers": "^3.10.0",
    "@jridgewell/trace-mapping": "^0.3.25",
    "@monaco-editor/react": "^4.7.0",
    "@neondatabase/serverless": "^0.10.4",
    "@paypal/paypal-server-sdk": "^1.1.0",
    "@paypal/react-paypal-js": "^8.9.2",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-aspect-ratio": "^1.1.3",
    "@radix-ui/react-avatar": "^1.1.4",
    "@radix-ui/react-checkbox": "^1.1.5",
    "@radix-ui/react-collapsible": "^1.1.4",
    "@radix-ui/react-context-menu": "^2.2.7",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-dropdown-menu": "^2.1.7",
    "@radix-ui/react-hover-card": "^1.1.7",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-menubar": "^1.1.7",
    "@radix-ui/react-navigation-menu": "^1.2.6",
    "@radix-ui/react-popover": "^1.1.7",
    "@radix-ui/react-progress": "^1.1.3",
    "@radix-ui/react-radio-group": "^1.2.4",
    "@radix-ui/react-scroll-area": "^1.2.4",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.3",
    "@radix-ui/react-slider": "^1.2.4",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.4",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.7",
    "@radix-ui/react-toggle": "^1.1.3",
    "@radix-ui/react-toggle-group": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.2.0",
    "@stripe/react-stripe-js": "^5.2.0",
    "@stripe/stripe-js": "^8.1.0",
    "@tanstack/react-query": "^5.60.5",
    "@types/archiver": "^7.0.0",
    "@types/bcrypt": "^6.0.0",
    "@types/compression": "^1.8.1",
    "@types/memoizee": "^0.4.12",
    "@types/multer": "^2.0.0",
    "@types/nodemailer": "^7.0.3",
    "@types/passport-facebook": "^3.0.4",
    "@types/twilio-video": "^2.7.3",
    "@upstash/redis": "^1.35.6",
    "@webcontainer/api": "^1.6.1",
    "@xterm/addon-fit": "^0.10.0",
    "@xterm/addon-web-links": "^0.11.0",
    "@xterm/xterm": "^5.5.0",
    "archiver": "^7.0.1",
    "axios": "^1.13.0",
    "bcrypt": "^6.0.0",
    "bullmq": "^5.63.0",
    "cassandra-driver": "^4.8.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "compression": "^1.8.1",
    "connect-pg-simple": "^10.0.0",
    "date-fns": "^3.6.0",
    "drizzle-orm": "^0.39.1",
    "drizzle-zod": "^0.7.0",
    "embla-carousel-react": "^8.6.0",
    "express": "^4.21.2",
    "express-session": "^1.18.1",
    "extract-zip": "^2.0.1",
    "framer-motion": "^11.13.1",
    "input-otp": "^1.4.2",
    "ioredis": "^5.8.2",
    "kafkajs": "^2.2.4",
    "lucide-react": "^0.453.0",
    "markdown-pdf": "^11.0.0",
    "mediasoup": "^3.19.3",
    "mediasoup-client": "^3.17.1",
    "memoizee": "^0.4.17",
    "memorystore": "^1.6.7",
    "multer": "^2.0.2",
    "next-themes": "^0.4.6",
    "nodemailer": "^7.0.10",
    "openai": "^6.6.0",
    "openid-client": "^6.8.1",
    "passport": "^0.7.0",
    "passport-facebook": "^3.0.0",
    "passport-local": "^1.0.0",
    "plyr-react": "^5.3.0",
    "prom-client": "^15.1.3",
    "rate-limiter-flexible": "^8.1.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.55.0",
    "react-icons": "^5.4.0",
    "react-resizable-panels": "^2.1.7",
    "recharts": "^2.15.2",
    "square": "^43.2.0",
    "stripe": "^19.1.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.2.5",
    "tweetnacl": "^1.0.3",
    "twilio": "^5.10.3",
    "twilio-video": "^2.32.0",
    "vaul": "^1.1.2",
    "wouter": "^3.3.5",
    "ws": "^8.18.0",
    "zod": "^3.24.2",
    "zod-validation-error": "^3.4.0"
  },
  "devDependencies": {
    "@replit/vite-plugin-cartographer": "^0.3.1",
    "@replit/vite-plugin-dev-banner": "^0.1.1",
    "@replit/vite-plugin-runtime-error-modal": "^0.0.3",
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "^4.1.3",
    "@types/connect-pg-simple": "^7.0.3",
    "@types/express": "4.17.21",
    "@types/express-session": "^1.18.0",
    "@types/node": "20.16.11",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@types/ws": "^8.5.13",
    "@vitejs/plugin-react": "^4.7.0",
    "autoprefixer": "^10.4.20",
    "drizzle-kit": "^0.31.4",
    "esbuild": "^0.25.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.20.5",
    "typescript": "5.6.3",
    "vite": "^5.4.20"
  },
  "optionalDependencies": {
    "bufferutil": "^4.0.8"
  }
}
```

---

## FILE 2: Dockerfile (FULL REPLACEMENT)

```dockerfile
# ============================================================================
# PROFITHACK AI - Production Docker Build
# Node 20 + Multi-stage build for optimal performance
# ============================================================================

# Stage 0: Build Stage
FROM node:20-alpine AS builder

# Install system dependencies required for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bzip2 \
    git \
    curl

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install ALL dependencies (including dev for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application (frontend + backend)
RUN npm run build

# ============================================================================
# Stage 1: Production Stage
# ============================================================================
FROM node:20-alpine AS production

# Install runtime dependencies only
RUN apk add --no-cache \
    bzip2 \
    curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --legacy-peer-deps

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/server ./server

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/healthz || exit 1

# Start the application
CMD ["npm", "start"]
```

---

## FILE 3: railway.json (FULL REPLACEMENT)

```json
{
  "$schema": "https://railway.app/schema.json",
  "build": {
    "builder": "dockerfile"
  },
  "deploy": {
    "numReplicas": 1,
    "startCommand": "npm start",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/healthz",
    "healthcheckTimeout": 10
  },
  "variables": {
    "NODE_ENV": "production",
    "PORT": "3000"
  }
}
```

---

## FILE 4: nixpacks.toml (FULL REPLACEMENT)

```toml
# ============================================================================
# PROFITHACK AI - Nixpacks Configuration
# This file is superseded by Dockerfile for Railway deployment
# ============================================================================

# Railway will use Dockerfile instead of Nixpacks
# This file exists only as fallback documentation
```

---

## FILE 5: .npmrc (FULL REPLACEMENT)

```ini
# ============================================================================
# PROFITHACK AI - NPM Configuration
# Optimized for production builds
# ============================================================================

legacy-peer-deps=true
ignore-scripts=true
optional=false
fund=false
audit=false
progress=false
```

---

## FILE 6: .nvmrc (FULL REPLACEMENT)

```
20
```

---

## FILE 7: .env.example (FULL REPLACEMENT)

```bash
# ============================================================================
# DATABASE & CACHE
# ============================================================================
DATABASE_URL=postgresql://user:password@neon.tech/profithack_db
REDIS_URL=redis://localhost:6379

# ============================================================================
# NODE ENVIRONMENT
# ============================================================================
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# ============================================================================
# SECURITY & AUTHENTICATION
# ============================================================================
JWT_SECRET=your-jwt-secret-here-min-32-chars
SESSION_SECRET=your-session-secret-here-min-32-chars
REPLIT_AUTH_ENABLED=true

# ============================================================================
# PAYMENT GATEWAYS
# ============================================================================
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx

PAYONEER_API_KEY=xxx
PAYONEER_API_SECRET=xxx

PAYEER_MERCHANT_ID=xxx
PAYEER_SECRET_KEY=xxx

SQUARE_ACCESS_TOKEN=xxx
SQUARE_WEBHOOK_KEY=xxx

# ============================================================================
# SOCIAL MEDIA & MESSAGING APIS
# ============================================================================
DISCORD_BOT_TOKEN=xxx
DISCORD_PUBLIC_KEY=xxx

THREADS_APP_ID=xxx
THREADS_APP_SECRET=xxx

REDDIT_CLIENT_ID=xxx
REDDIT_CLIENT_SECRET=xxx
REDDIT_USERNAME=xxx
REDDIT_PASSWORD=xxx

X_BEARER_TOKEN=xxx
X_API_KEY=xxx

FACEBOOK_APP_ID=xxx
FACEBOOK_APP_SECRET=xxx

# ============================================================================
# AI & LLM SERVICES
# ============================================================================
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
GOOGLE_TRANSLATE_API_KEY=xxx

# ============================================================================
# EMAIL SERVICE
# ============================================================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=support@profithack.com
EMAIL_PASS=xxx
EMAIL_FROM=support@profithack.com

# ============================================================================
# MEDIA & CLOUD STORAGE
# ============================================================================
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
AWS_BUCKET=profithack-videos

CLOUDINARY_URL=cloudinary://key:secret@cloud

# ============================================================================
# VIDEO & MEDIA PROCESSING
# ============================================================================
FFMPEG_PATH=/usr/bin/ffmpeg
SORA_API_KEY=xxx

# ============================================================================
# COMMUNICATION & NOTIFICATIONS
# ============================================================================
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# ============================================================================
# FEATURE FLAGS
# ============================================================================
ENABLE_LIVESTREAM=true
ENABLE_AI_LAB=true
ENABLE_VIDEO_PROCESSING=true
ENABLE_DATING=true
ENABLE_MONETIZATION=true

# ============================================================================
# APPLICATION SETTINGS
# ============================================================================
APP_NAME=PROFITHACK AI
APP_URL=https://profithack-ai.railway.app
FRONTEND_URL=https://profithack-ai.railway.app
API_URL=https://profithack-ai.railway.app/api

# ============================================================================
# MONITORING & OBSERVABILITY
# ============================================================================
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
LOG_LEVEL=info
```

---

## MIDDLEWARE FILES (Already in server/middleware/)

These files are already created in your Replit:

1. **server/middleware/cors.ts** - CORS and security headers
2. **server/middleware/rate-limit.ts** - API rate limiting
3. **server/middleware/error-handler.ts** - Centralized error handling
4. **server/middleware/request-validator.ts** - Zod request validation
5. **server/middleware/auth-logger.ts** - Security logging with PII masking
6. **server/middleware/index.ts** - Central exports

---

## DEPLOYMENT CHECKLIST

1. ✅ Copy **package.json** to GitHub (replace entire file)
2. ✅ Copy **Dockerfile** to GitHub (replace entire file)
3. ✅ Copy **railway.json** to GitHub (replace entire file)
4. ✅ Copy **nixpacks.toml** to GitHub (replace entire file)
5. ✅ Copy **.npmrc** to GitHub (replace entire file)
6. ✅ Copy **.nvmrc** to GitHub (replace entire file)
7. ✅ Copy **.env.example** to GitHub (replace entire file)
8. ✅ Copy **server/middleware/** folder to GitHub
9. ✅ Set environment variables in Railway dashboard
10. ✅ Deploy!

---

## RAILWAY ENVIRONMENT VARIABLES

Set these in Railway dashboard (Settings → Variables):

**Required:**
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `NODE_ENV` - Set to `production`
- `PORT` - Set to `3000`

**Recommended:**
- `ANTHROPIC_API_KEY` - For AI features
- `STRIPE_SECRET_KEY` - For payments
- `REDIS_URL` - For caching (optional)

---

## EXPECTED RESULT

After deployment:
- ✅ `https://profithack-ai.railway.app` - Main app
- ✅ `https://profithack-ai.railway.app/healthz` - Returns "OK"
- ✅ `https://profithack-ai.railway.app/health` - Returns JSON status
- ✅ `https://profithack-ai.railway.app/api/metrics/prometheus` - Metrics

---

Generated: December 7, 2025
Platform: PROFITHACK AI
Target: Railway (via GitHub)
