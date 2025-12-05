/**
 * PROFITHACK AI - Prometheus Metrics Collector
 * 
 * Production observability with Prometheus + Grafana
 * 
 * Metrics tracked:
 * - HTTP request rate & latency
 * - gRPC call performance
 * - Database query performance
 * - Kafka event throughput
 * - Business metrics (signups, videos uploaded, revenue)
 */

import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Enable default Node.js metrics (CPU, memory, event loop, etc.)
collectDefaultMetrics({ prefix: 'profithack_' });

/**
 * HTTP Request Metrics
 */
export const httpRequestCounter = new Counter({
  name: 'profithack_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDuration = new Histogram({
  name: 'profithack_http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000], // milliseconds
});

/**
 * gRPC Metrics
 */
export const grpcCallCounter = new Counter({
  name: 'profithack_grpc_calls_total',
  help: 'Total number of gRPC calls',
  labelNames: ['service', 'method', 'status'],
});

export const grpcCallDuration = new Histogram({
  name: 'profithack_grpc_call_duration_ms',
  help: 'gRPC call duration in milliseconds',
  labelNames: ['service', 'method'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500],
});

/**
 * Database Metrics
 */
export const dbQueryCounter = new Counter({
  name: 'profithack_db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['database', 'operation'], // postgresql, cassandra, redis
});

export const dbQueryDuration = new Histogram({
  name: 'profithack_db_query_duration_ms',
  help: 'Database query duration in milliseconds',
  labelNames: ['database', 'operation'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
});

/**
 * Kafka Metrics
 */
export const kafkaEventCounter = new Counter({
  name: 'profithack_kafka_events_total',
  help: 'Total number of Kafka events produced',
  labelNames: ['topic', 'status'], // success, error
});

/**
 * Business Metrics
 */
export const userSignupsCounter = new Counter({
  name: 'profithack_user_signups_total',
  help: 'Total number of user signups',
  labelNames: ['source'], // web, mobile, api
});

export const videoUploadsCounter = new Counter({
  name: 'profithack_video_uploads_total',
  help: 'Total number of videos uploaded',
  labelNames: ['category'], // tube, reels, battles, premium
});

export const revenueCounter = new Counter({
  name: 'profithack_revenue_total_usd',
  help: 'Total revenue in USD',
  labelNames: ['type'], // subscription, tips, marketplace, ads
});

export const activeUsersGauge = new Gauge({
  name: 'profithack_active_users',
  help: 'Number of currently active users',
  labelNames: ['type'], // total, creators, viewers
});

export const videoViewsCounter = new Counter({
  name: 'profithack_video_views_total',
  help: 'Total number of video views',
  labelNames: ['category'],
});

/**
 * WebSocket Metrics
 */
export const websocketConnectionsGauge = new Gauge({
  name: 'profithack_websocket_connections',
  help: 'Number of active WebSocket connections',
  labelNames: ['type'], // chat, battles, notifications
});

/**
 * Live Battle Metrics
 */
export const liveBattlesGauge = new Gauge({
  name: 'profithack_live_battles_active',
  help: 'Number of active live battles',
});

export const battleGiftsCounter = new Counter({
  name: 'profithack_battle_gifts_total',
  help: 'Total number of gifts sent in battles',
  labelNames: ['gift_type'],
});

/**
 * Middleware to track HTTP requests
 */
export function metricsMiddleware(req: any, res: any, next: any) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route?.path || req.path || 'unknown';
    const method = req.method;
    const statusCode = res.statusCode.toString();

    httpRequestCounter.inc({ method, route, status_code: statusCode });
    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
  });

  next();
}

/**
 * Get metrics in Prometheus format
 */
export async function getMetrics(): Promise<string> {
  return await register.metrics();
}

/**
 * Get metrics content type
 */
export function getMetricsContentType(): string {
  return register.contentType;
}

/**
 * Clear all metrics (for testing)
 */
export function clearMetrics() {
  register.clear();
}
