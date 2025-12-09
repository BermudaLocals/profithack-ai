FROM node:20-slim

# 1. Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip make g++ git curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Copy files and install ALL dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# 3. Copy source code
COPY . .

# 4. Build the server (this will fail if the build script is broken)
RUN npm run build:server

# 5. Start from the built file
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
CMD ["node", "dist/index.js"]
