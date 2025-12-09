# Stage 1: Builder (installs tools and creates the build)
FROM node:20-slim AS builder

# 1. Install system build tools
RUN apt-get update && apt-get install -y \
    python3 python3-pip make g++ git curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Install all project dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# 3. Copy source code and build the server
COPY . .
RUN npx esbuild server/index.ts --platform=node --packages=external --external:../vite.config --bundle --format=esm --outdir=dist

# Stage 2: Production (clean runtime environment)
FROM node:20-slim

# 4. Set the working directory for the final image
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
RUN npm install --legacy-peer-deps # Removes '--omit=dev'
# 5. Copy only production dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --legacy-peer-deps

# 6. Copy the compiled application and required files from the builder
#    NOTE: No '|| :' shell operators are used here.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/shared ./server/shared
COPY --from=builder /app/drizzle.config.ts ./

EXPOSE 5000
CMD ["node", "dist/index.js"]
