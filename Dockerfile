# Use a Node.js image that includes Python and build tools for native dependencies (like gRPC, Mediasoup)
FROM node:20-bullseye-slim

# Install system dependencies: Python, build tools, FFmpeg (for video processing), PostgreSQL client
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    ffmpeg \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy dependency definitions FIRST (for better Docker layer caching)
COPY package*.json ./
COPY client/package*.json ./client/

# Install ALL dependencies (root and client)
RUN npm ci --only=production --ignore-scripts
RUN cd client && npm ci --only=production

# Copy the rest of your application code
COPY . .

# Build the React frontend
RUN cd client && npm run build

# Set environment variable to serve frontend from backend
ENV NODE_ENV=production
ENV CLIENT_PATH=/usr/src/app/client/build

# Expose the port your server uses
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r)=>{process.exit(r.statusCode===200?0:1)})"

# Start the server. This single command should start your main API and gRPC services.
CMD ["npm", "start"]
