FROM node:20-slim

# 1. Install system dependencies (for mediasoup and building)
RUN apt-get update && apt-get install -y \
    python3 python3-pip make g++ git curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Copy dependencies and install
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY . .

# 3. BUILD THE PROJECT (This command must succeed)
# It will fail the Docker build if your build script has errors.
RUN npm run build:server

# 4. Verify the build output (helpful for debugging)
RUN ls -la dist/ || echo "Build verification: Checking dist folder..."

# 5. Start the application from the built files
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
CMD ["node", "dist/index.js"]
