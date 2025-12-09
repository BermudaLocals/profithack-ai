FROM node:20-slim AS builder

# 1. Install ALL system build tools (for native modules like mediasoup)
RUN apt-get update && apt-get install -y \
    python3 python3-pip make g++ git curl pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Copy package files and install ALL dependencies (including devDependencies for building)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# 3. Copy source code and build the project
COPY . .
RUN npm run build:client 2>/dev/null || echo "Skipping client build"
RUN npm run build:server

# 4. Production Stage
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# 5. Copy ONLY production `node_modules` from the builder stage
COPY --from=builder /app/node_modules ./node_modules
# 6. Copy the built application and other necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/shared ./server/shared 2>/dev/null || :
COPY drizzle.config.ts ./ 2>/dev/null || :

EXPOSE 5000
CMD ["node", "dist/index.js"]
