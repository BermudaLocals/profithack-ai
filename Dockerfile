FROM node:20-slim

# 1. Install system dependencies (for modules like mediasoup)
RUN apt-get update && apt-get install -y \
    python3 python3-pip make g++ git curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Copy dependency files and install
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# 3. Copy the rest of the application code
COPY . .

# 4. ==== THE FIXED BUILD COMMAND ====
# Runs 'esbuild' directly with npx, exactly as your 'package.json' script intended.
# This will create the 'dist' folder.
RUN npx esbuild server/index.ts --platform=node --external:../vite.config --bundle --format=esm --outdir=dist

# 5. Start the application from the built 'dist' folder
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
CMD ["node", "dist/index.js"]
