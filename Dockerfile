FROM node:20-alpine

# Install system dependencies (MEDIASOUP NEEDS THESE)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bzip2 \
    ffmpeg \
    openssl

# CRITICAL: Prevent phantomjs from breaking build
ENV PHANTOMJS_SKIP_INSTALL=true
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false

WORKDIR /app

# 1. Copy package files
COPY package*.json ./

# 2. Install dependencies with legacy support
RUN npm ci --omit=dev --legacy-peer-deps

# 3. Copy ALL source code
COPY . .

# 4. Build both frontend and backend
RUN npm run build

# 5. Health check for Railway
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/healthz', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 3000

# 6. Start production server
CMD ["npm", "start"]
