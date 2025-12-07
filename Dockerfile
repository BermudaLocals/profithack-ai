FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++ git curl

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
COPY .npmrc ./

RUN npm install --legacy-peer-deps --ignore-scripts

COPY . .

RUN if [ -f "vite.config.production.ts" ]; then cp vite.config.production.ts vite.config.ts; fi

RUN npx vite build

RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

FROM node:20-alpine AS production

RUN apk add --no-cache curl

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json ./
COPY .npmrc ./

RUN npm install --omit=dev --legacy-peer-deps --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/healthz || exit 1

CMD ["node", "dist/index.js"]
