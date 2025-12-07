# Use Node.js 20 LTS
FROM node:20-alpine

# Install system dependencies (bzip2 for phantomjs, others for native modules)
RUN apk add --no-cache python3 make g++ bzip2

# Set working directory
WORKDIR /app

# 1. Copy root package files (if you have workspace/monorepo setup)
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY backend/package*.json ./backend/

# 2. Install dependencies
RUN apk add --no-cache bzip2 python3 make g++
ENV PHANTOMJS_SKIP_INSTALL=true
RUN npm ci --omit=dev

# 3. Copy ALL source code
COPY . .

# 4. Build both frontend and backend
RUN npm run build

# 5. Expose your application port (3000 for Express)
EXPOSE 3000

# 6. Health check (critical for Railway)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# 7. Start your production server
CMD ["npm", "start"]
