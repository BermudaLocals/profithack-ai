FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y python3 make g++ curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY . .
RUN cp vite.config.production.ts vite.config.ts
RUN ./node_modules/.bin/vite build || npx vite build
RUN ./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist || npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

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
