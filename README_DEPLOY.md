# ROFITHACK AI - Deployment Guide

## Quick Start (3 Commands)

```bash
npm install
npm run setup
npm start
```

## Pre-Deployment Checklist

### 1. Create Your Full Source ZIP

Before deploying, create a complete source code archive:

```bash
# From your original Replit project, download everything except node_modules
# Host it on GitHub Releases, S3, or any CDN
```

### 2. Set Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection string (Neon recommended)
- `UPSTASH_REDIS_URL` - Redis URL (Upstash recommended)
- `SESSION_SECRET` - Random 32+ character string
- `FULL_SOURCE_URL` - URL to your complete source ZIP

### 3. Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### 4. Deploy to Render

1. Push code to GitHub
2. Connect repository in Render dashboard
3. Set environment variables
4. Deploy

## Architecture

```
rofithack_ai/
├── client/          # React frontend (Vite)
├── server/          # Express backend
│   ├── routes/      # 409 API endpoints
│   ├── services/    # 50+ business services
│   ├── grpc/        # 11 microservices
│   └── shared/      # 153 database tables
└── scripts/         # Setup & maintenance
```

## Features

- **TikTok-Style Feed**: 22K+ videos, infinite scroll
- **Messaging**: WhatsApp-style real-time DMs
- **Creator Wallet**: Virtual gifts, withdrawals
- **Dating**: AI-powered matching
- **Code IDE**: Monaco editor integration
- **8 Payment Gateways**: Stripe, PayPal, Crypto, etc.
- **11 gRPC Microservices**: Feed, AI, Moderation

## Database Setup

The setup script automatically runs migrations:

```bash
npm run db:push
```

To generate new migrations:

```bash
npm run db:generate
```

## Health Checks

```bash
npm run health
```

Endpoints:
- `GET /health` - Detailed status
- `GET /healthz` - Simple alive check
- `GET /readyz` - Kubernetes readiness

## Troubleshooting

### Port Already In Use
```bash
lsof -i :5000
kill -9 <PID>
```

### Database Connection Failed
- Check `DATABASE_URL` format
- Ensure SSL mode is enabled for Neon

### Redis Connection Failed
- Verify Upstash URL and token
- App works without Redis (degraded caching)

## Support

Built with Node.js 20 + React 18 + PostgreSQL + Redis

Licensed under MIT
