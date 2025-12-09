FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++ git curl
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps --ignore-scripts
COPY . .
RUN npm run build:client || ./node_modules/.bin/vite build
RUN npm run build:server || ./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

FROM node:20-alpine AS production
RUN apk add --no-cache curl
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
COPY package.json ./
RUN npm install --omit=dev --legacy-peer-deps --ignore-scripts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/shared ./server/shared
COPY drizzle.config.ts ./
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/healthz || exit 1
CMD ["node", "dist/index.js"]
