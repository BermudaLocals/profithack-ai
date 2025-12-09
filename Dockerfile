FROM node:20-slim
RUN apt-get update && apt-get install -y python3 python3-pip make g++ git curl
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY . .
ENV NODE_ENV=production PORT=5000
EXPOSE 5000
# THE CRITICAL CHANGE: This runs your source file directly, no 'dist' needed.
# Update 'server/index.ts' if your main file has a different path.
CMD ["npx", "tsx", "server/index.ts"]
