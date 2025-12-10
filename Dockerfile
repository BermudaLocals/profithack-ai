FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y python3 make g++ curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json ./
RUN npm init -y 2>/dev/null || true
RUN npm install vite@5.4.20 esbuild @vitejs/plugin-react@4.7.0 react@18.3.1 react-dom@18.3.1 @tanstack/react-query@5.60.5 wouter@3.3.5 drizzle-orm drizzle-zod zod express tailwindcss@3.4.17 postcss autoprefixer tailwindcss-animate lucide-react @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-popover @radix-ui/react-scroll-area @radix-ui/react-separator @radix-ui/react-switch @radix-ui/react-accordion @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-slider @radix-ui/react-toggle @radix-ui/react-toggle-group class-variance-authority clsx tailwind-merge react-hook-form @hookform/resolvers cmdk date-fns recharts framer-motion react-icons embla-carousel-react input-otp vaul react-day-picker react-resizable-panels --legacy-peer-deps
COPY . .
RUN rm -rf node_modules/.cache 2>/dev/null || true
RUN cp vite.config.production.mjs vite.config.mjs
RUN ./node_modules/.bin/vite build --config vite.config.mjs
RUN ./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

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
