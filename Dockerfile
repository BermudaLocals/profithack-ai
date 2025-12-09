FROM node:20-slim

RUN apt-get update && apt-get install -y \
    python3 python3-pip make g++ git curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build:client || true
RUN npm run build:server || true
ENV NODE_ENV=production PORT=5000
EXPOSE 5000
CMD ["node", "dist/index.js"]
