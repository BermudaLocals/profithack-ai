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
COPY .npmrc ./

# Install ALL dependencies (including dev for build)
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy all source code
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
COPY .npmrc ./

# Install production dependencies only
RUN npm ci --omit=dev --legacy-peer-deps || npm install --omit=dev --legacy-peer-deps

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Copy all necessary source folders (needed for runtime)
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/client ./client
COPY --from=builder /app/public ./public

# Copy config files needed at runtime
COPY --from=builder /app/vite.config.ts ./vite.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/tailwind.config.ts ./tailwind.config.ts
COPY --from=builder /app/postcss.config.js ./postcss.config.js
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/components.json ./components.json

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/healthz || exit 1

# Start the application
CMD ["node", "dist/index.js"]
