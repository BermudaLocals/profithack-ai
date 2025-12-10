FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y python3 make g++ curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json ./
RUN npm cache clean --force
RUN npm install --legacy-peer-deps --force
COPY . .
RUN cp vite.config.production.ts vite.config.ts
RUN ls -la node_modules/.bin/ || echo "No binaries found"
RUN node node_modules/vite/bin/vite.js build
RUN node node_modules/esbuild/bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

FROM node:20-slim
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
COPY package.json ./
RUN npm install --omit=dev --legacy-peer-deps --ignore-scripts
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD ["node", "dist/index.js"]
