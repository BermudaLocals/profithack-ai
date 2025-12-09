FROM node:20-slim

# 1. Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip make g++ git curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Copy dependency files and install ALL dependencies (including esbuild)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# 3. Copy source code
COPY . .

# 4. === THE FIXED BUILD LINE ===
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# 5. Start the application
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
CMD ["node", "dist/index.js"]
