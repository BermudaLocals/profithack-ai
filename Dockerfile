# ============================================================================
# PROFITHACK AI - Railway Production Build
# TikTok-style app optimized for Railway deployment
# ============================================================================

FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++ git curl

WORKDIR /app

# Copy package files
COPY package.json ./
COPY .npmrc ./

# Install ALL dependencies (including devDependencies for building)
RUN npm install --legacy-peer-deps

# Copy all source code
COPY . .

# Replace vite config with production version (no Replit plugins)
RUN if [ -f "vite.config.production.ts" ]; then cp vite.config.production.ts vite.config.ts; fi

# Build frontend with installed vite
RUN ./node_modules/.bin/vite build

# Build backend with installed esbuild
RUN ./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# ============================================================================
# Production Stage - Minimal image
# ============================================================================
FROM node:20-alpine AS production

RUN apk add --no-cache curl

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files
COPY package.json ./
COPY .npmrc ./

# Install production dependencies only
RUN npm install --omit=dev --legacy-peer-deps --ignore-scripts

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/healthz || exit 1

CMD ["node", "dist/index.js"]
