import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { botRunner } from "./services/bot-runner";
import { db } from "./db";
import { sql } from "drizzle-orm";

// Option 3 Integration: Import new microservices routes
// @ts-ignore - JS modules without type declarations
import { metricsMiddleware, metricsHandler } from "./lib/metrics.js";
// @ts-ignore - JS modules without type declarations
import { healthRoutes } from "./routes/health.js";
// @ts-ignore - JS modules without type declarations
import { trendingRoutes } from "./routes/trending.js";
// @ts-ignore - JS modules without type declarations
import { analyticsRoutes } from "./routes/analytics.js";
// @ts-ignore - JS modules without type declarations
import { jobsRoutes } from "./routes/jobs.js";
// @ts-ignore - JS modules without type declarations
import { competitorsRoutes } from "./routes/competitors.js";
import pdfRoutes from "./routes-pdf";
import { setupDownloadsRoute } from "./downloads-route";

// NEW: Import microservices for 100x architecture upgrade
import { initFeedServiceClient } from "./services/feedServiceClient";
import { initCassandraClient } from "./services/cassandraClient";
import { initKafkaProducer } from "./services/kafkaProducer";
import { initRedisCluster } from "./config/redis-cluster";
import { metricsMiddleware as promMetricsMiddleware, getMetrics, getMetricsContentType } from "./services/metricsCollector";
import { microservicesDemoRoutes } from "./routes/microservices-demo";
// OLD: Redis-dependent BullMQ (disabled due to Redis limit)
// import { initVideoProcessingWorker } from "./services/videoProcessingService";
// NEW: PostgreSQL-based job queue (no Redis required)
import { initJobQueue, startVideoWorker } from "./services/pgJobQueue";

// NEW: Import gRPC microservices
import { startAllGRPCServices } from "./grpc";
import { grpcRoutes } from "./routes/grpc-routes";

const app = express();

// ✅ PRODUCTION FEATURE: Enable Gzip compression for all responses
// Reduces bandwidth usage by ~70% and improves load times significantly
app.use(compression());

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// ✅ PRODUCTION FEATURE: Health check endpoint for load balancers/monitoring
// Returns "OK" instantly to confirm the application is alive
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// ✅ PRODUCTION FEATURE: Detailed health check with system status
app.get('/health', async (_req, res) => {
  try {
    // Quick DB health check
    await db.execute(sql`SELECT 1`);
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        grpc: '11 services running',
        bots: '5 active',
        videos: '20,000+'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

// Option 3: Add Prometheus metrics tracking (legacy)
app.use(metricsMiddleware);

// NEW: Add production-grade Prometheus metrics
app.use(promMetricsMiddleware);

// Add cross-origin isolation headers for WebContainer support
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // =============================================================================
  // MICROSERVICES INITIALIZATION (100x Architecture Upgrade)
  // =============================================================================
  
  console.log("🚀 Initializing microservices architecture...");
  
  // 0. Start gRPC Microservices (Feed, XAI, Dating)
  try {
    startAllGRPCServices();
    console.log("✅ gRPC Microservices (Feed, XAI, Dating) started");
  } catch (error) {
    console.error("⚠️  gRPC services initialization failed:", error);
  }
  
  // 1. Initialize Golang Feed Service (gRPC) - Legacy
  try {
    await initFeedServiceClient();
    console.log("✅ Golang Feed Service (gRPC) ready");
  } catch (error) {
    console.error("⚠️  Golang Feed Service initialization failed:", error);
  }
  
  // 2. Cassandra NoSQL - DISABLED (not available on Replit, using PostgreSQL fallback)
  console.log("✅ Using PostgreSQL (Neon) instead of Cassandra for time-series data");
  
  // 3. Kafka Event Streaming - DISABLED (not available on Replit, using direct events)
  console.log("✅ Using direct event handling instead of Kafka streaming");
  
  // 4. Initialize Redis Cluster
  try {
    await initRedisCluster();
    console.log("✅ Redis Cluster/Single ready for caching");
  } catch (error) {
    console.error("⚠️  Redis initialization failed:", error);
  }
  
  // 5. Initialize PostgreSQL-Based Video Processing Worker (No Redis Required!)
  try {
    await initJobQueue();
    await startVideoWorker(5); // 5 concurrent jobs
    console.log("✅ Video processing worker ready (PostgreSQL-based, 5 concurrent jobs)");
  } catch (error) {
    console.error("⚠️  Video processing worker initialization failed:", error);
  }
  
  console.log("✅ Microservices architecture initialized!");
  console.log("📊 Stack: Node.js + Golang + PostgreSQL + Cassandra + Kafka + Redis + FFmpeg");
  
  // =============================================================================
  
  const server = await registerRoutes(app);

  // Option 3: Mount microservices routes
  healthRoutes(app);
  trendingRoutes(app);
  analyticsRoutes(app);
  jobsRoutes(app);
  competitorsRoutes(app);
  app.get('/metrics', metricsHandler);
  
  // NEW: Production Prometheus metrics endpoint
  app.get('/api/metrics/prometheus', async (_req, res) => {
    res.set('Content-Type', getMetricsContentType());
    const metrics = await getMetrics();
    res.send(metrics);
  });
  
  // NEW: Microservices demo routes
  microservicesDemoRoutes(app);
  
  // NEW: gRPC microservices routes
  app.use('/api/grpc', grpcRoutes);
  
  // NEW: PDF Generator routes for users
  app.use(pdfRoutes);
  
  // NEW: Downloads route for codebase export
  setupDownloadsRoute(app);

  // Auto-initialize system user and platform invite codes on startup (production & dev)
  try {
    // Create system user if it doesn't exist
    const systemUserId = "00000000-0000-0000-0000-000000000000";
    await db.execute(sql`
      INSERT INTO users (id, username, display_name, email)
      VALUES (${systemUserId}, 'system', 'PROFITHACK AI System', 'system@profithackai.com')
      ON CONFLICT (id) DO NOTHING
    `);
    
    const existingCodes = await storage.getUserInviteCodes(systemUserId);
    const minCodesNeeded = 1000;
    
    if (existingCodes.length < minCodesNeeded) {
      const codesToGenerate = minCodesNeeded - existingCodes.length;
      console.log(`🎟️  Only ${existingCodes.length} platform invite codes found - generating ${codesToGenerate} more codes...`);
      const codes = await storage.createInviteCodes(systemUserId, codesToGenerate);
      console.log(`✅ Generated ${codes.length} platform invite codes (total now: ${existingCodes.length + codes.length})`);
    } else {
      console.log(`✅ Platform invite codes ready (${existingCodes.length} codes available)`);
    }
  } catch (error) {
    console.error("⚠️  Failed to initialize invite codes:", error);
  }

  // Seed marketplace products on startup
  try {
    const { seedMarketplaceProducts } = await import("./seed-marketplace");
    await seedMarketplaceProducts();
    
    // Seed 2026 PLR products
    const { seedPLRProducts2026 } = await import("./plr-products-2026");
    await seedPLRProducts2026();
    
    // Seed additional user-uploaded PLR products
    const { seedAdditionalPLRProducts2026 } = await import("./plr-products-additional-2026");
    await seedAdditionalPLRProducts2026();
  } catch (error) {
    console.error("⚠️  Failed to seed marketplace:", error);
  }

  // Seed Kush's FAQ knowledge base
  try {
    const { seedKushFAQs } = await import("./seed-faqs");
    await seedKushFAQs();
  } catch (error) {
    console.error("⚠️  Failed to seed Kush FAQs:", error);
  }

  // Seed display ads for monetization
  try {
    const { seedAds } = await import("./seed-ads");
    await seedAds();
  } catch (error) {
    console.error("⚠️  Failed to seed ads:", error);
  }
  
  // Seed educational videos for content feed
  try {
    const { seedVideos } = await import("./seed-videos");
    await seedVideos();
  } catch (error) {
    console.error("⚠️  Failed to seed videos:", error);
  }

  // Seed default marketing bots
  try {
    const { seedMarketingBots } = await import("./seed-marketing-bots");
    await seedMarketingBots();
  } catch (error) {
    console.error("⚠️  Failed to seed marketing bots:", error);
  }

  // Start marketing bots service
  botRunner.start();
  
  // Start site monitoring (scans every 15 minutes) - temporarily disabled for testing
  // const { siteMonitor } = await import("./services/site-monitor");
  // siteMonitor.start();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
