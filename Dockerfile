# Target your main app - MODIFY THIS PATH if needed
FROM node:20-alpine
WORKDIR /app

# Copy and install dependencies for the frontend
COPY apps/web/package*.json ./
RUN npm ci --omit=dev

# Copy frontend source code
COPY apps/web/ ./

# Build the frontend (if using Next.js/React)
RUN npm run build

# Expose port (Next.js defaults to 3000)
EXPOSE 3000

# Start command
CMD ["npm", "start"]
