FROM node:20-slim

# 1. Install system dependencies (required for native modules)
RUN apt-get update && apt-get install -y \
    python3 python3-pip make g++ git curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Copy dependency files and install
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# 3. Copy the rest of your application code
COPY . .

# 4. Start the application with tsx
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
CMD ["npx", "tsx", "server/index.ts"]
