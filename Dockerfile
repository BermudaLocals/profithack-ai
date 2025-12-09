# Stage 1: Builder (installs everything and builds)
FROM node:20-slim AS builder

# Install system build tools
RUN apt-get update && apt-get install -y \
    python3 python3-pip make g++ git curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency files and install ALL dependencies (including esbuild)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .

# === FINAL BUILD COMMAND FIX ===
# '--external:../vite.config' excludes the problematic local import.
RUN npx esbuild server/index.ts --platform=node --packages=external --external:../vite.config --bundle --format=esm --outdir=dist

# Stage 2: Production (lean, only runs the app)
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy dependency files for production
COPY package.json package-lock.json* ./

# Install ONLY production dependencies (express, etc.)
RUN npm install --omit=dev --legacy-peer-deps

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Copy other necessary runtime files
COPY --from=builder /app/server/shared ./server/shared
COPY --from=builder /app/drizzle.config.ts ./ 2>/dev/null || :

EXPOSE 5000
CMD ["node", "dist/index.js"]
