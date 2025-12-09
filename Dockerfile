# Use a more complete Node.js base image with build tools
FROM node:20-bookworm-slim AS builder

# Install Python, pip, and build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    make \
    g++ \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code and build
COPY . .
RUN npm run build:client || npm run build || ./node_modules/.bin/vite build

# Production stage
FROM node:20-alpine

# Install runtime dependencies
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev --legacy-peer-deps --ignore-scripts

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose port (Railway automatically assigns a port)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
