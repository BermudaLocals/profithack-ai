# Stage 0: Dependencies
FROM node:20-alpine AS stage-0

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bzip2 \
    git

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev --legacy-peer-deps

# Copy application code
COPY . .

# Build your application
RUN npm run build

# Stage 1: Production image
FROM node:20-alpine

WORKDIR /app

# Copy from build stage
COPY --from=stage-0 /app .

# Start application
EXPOSE 3000

CMD ["npm", "start"]FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
