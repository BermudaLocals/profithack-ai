FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y python3 make g++ curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps && npm install vite @vitejs/plugin-react react react-dom --save-dev
COPY . .
RUN ./node_modules/.bin/vite build
RUN ./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --external:vite --external:@vitejs/plugin-react --bundle --format=esm --outdir=dist

FROM node:20-slim
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production PORT=5000
COPY package.json ./
RUN npm install --omit=dev --legacy-peer-deps --ignore-scripts
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD ["node", "dist/index.js"]
