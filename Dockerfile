# Stage 1: Builder
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y \
    python3 python3-pip make g++ git curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install ALL dependencies (including devDeps for building)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy source and build
COPY . .

# Build frontend first
RUN npx vite build

# Build backend (exclude vite completely)
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Stage 2: Production
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install ONLY production dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --legacy-peer-deps --ignore-scripts

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/shared ./server/shared

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "dist/index.js"]
