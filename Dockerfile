FROM node:20-slim

# 1. Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip make g++ git curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Copy dependency files and install
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY . .

# 3. Use a runtime to execute TypeScript directly
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
CMD ["npx", "tsx", "server/index.ts"]
