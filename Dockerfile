# Builder stage with all build tools
FROM node:20-bullseye AS builder

# Install all required build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    make \
    g++ \
    git \
    curl \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build steps (skip if commands don't exist)
RUN if [ -f "vite.config.ts" ] || [ -f "vite.config.js" ]; then \
      npm run build:client 2>/dev/null || ./node_modules/.bin/vite build 2>/dev/null || true; \
    fi

RUN if [ -f "server/index.ts" ]; then \
      npm run build:server 2>/dev/null || ./node_modules/.bin/esbuild server/index.ts \
        --platform=node \
        --packages=external \
        --bundle \
        --format=esm \
        --outdir=dist 2>/dev/null || true; \
    fi

# Production stage
FROM node:20-bullseye-slim AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies (skip scripts to avoid mediasoup build)
RUN npm install --omit=dev --legacy-peer-deps --ignore-scripts

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public 2>/dev/null || true

# Copy mediasoup worker if it was built
COPY --from=builder /app/node_modules/mediasoup ./node_modules/mediasoup 2>/dev/null || true

# Copy other necessary files
COPY drizzle.config.ts ./

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/healthz || exit 1

# Start the application
CMD ["node", "dist/index.js"]
