FROM node:20-alpine

# Install all required build dependencies
RUN apk add --no-cache python3 py3-pip make g++ git curl linux-headers bash

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies (mediasoup needs pip during installation)
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Check what files we have
RUN ls -la && echo "Current directory contents:" && find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" | head -20

# Run the setup script if it exists
RUN if [ -f "scripts/setup.ts" ]; then \
      npx tsx scripts/setup.ts || true; \
    fi

# Build steps based on your project structure
RUN if [ -f "vite.config.ts" ] || [ -f "vite.config.js" ]; then \
      npm run build:client || ./node_modules/.bin/vite build; \
    else \
      echo "No Vite config found, skipping client build"; \
    fi

# Build server if needed
RUN if [ -f "server/index.ts" ]; then \
      npm run build:server || npx esbuild server/index.ts \
        --platform=node \
        --packages=external \
        --bundle \
        --format=esm \
        --outdir=dist; \
    fi

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/healthz || exit 1

# Start command - adjust based on your actual entry point
CMD if [ -f "dist/index.js" ]; then \
      node dist/index.js; \
    elif [ -f "server/index.ts" ]; then \
      npx tsx server/index.ts; \
    else \
      npm run dev; \
    fi
