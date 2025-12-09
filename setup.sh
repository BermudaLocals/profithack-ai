#!/bin/bash

# Download and setup PROFITHACK AI
echo "Downloading PROFITHACK AI..."
curl -o profithack.zip "https://1787e76f-1cbc-4635-9d1a-f5ee00cfec30-00-vcltxx3w54ct.picard.replit.dev/api/downloads/zip"
unzip profithack.zip -d profithack-ai
cd profithack-ai

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Create deployment files
echo "Creating deployment files..."

# Create Dockerfile
cat > Dockerfile << 'EOF'
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

# Build steps
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

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package.json package-lock.json* ./
RUN npm install --omit=dev --legacy-peer-deps --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public 2>/dev/null || true
COPY --from=builder /app/node_modules/mediasoup ./node_modules/mediasoup 2>/dev/null || true
COPY drizzle.config.ts ./

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/healthz || exit 1
CMD ["node", "dist/index.js"]
EOF

# Create .dockerignore
cat > .dockerignore << 'EOF'
node_modules
.git
.env
*.log
dist
build
.DS_Store
.env.local
npm-debug.log*
README.md
EOF

# Create railway.toml
cat > railway.toml << 'EOF'
[build]
builder = "dockerfile"

[deploy]
healthcheckPath = "/healthz"
healthcheckTimeout = 30
EOF

# Update package.json scripts if needed
if [ -f "package.json" ]; then
  echo "Updating package.json scripts..."
  npm pkg set scripts.start="node dist/index.js"
  npm pkg set scripts.build="npm run build:client && npm run build:server"
fi

echo "Setup complete! Files ready for Railway deployment."
echo ""
echo "To deploy to Railway:"
echo "1. Run: git add ."
echo "2. Run: git commit -m 'Ready for Railway'"
echo "3. Run: railway up"
echo ""
echo "Or push to GitHub and connect your Railway project."
