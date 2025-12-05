/**
 * PROFITHACK AI - Redis Cluster Configuration
 * 
 * Production-ready Redis Cluster for:
 * - Session storage (100M+ concurrent users)
 * - Real-time caching (video metadata, user profiles)
 * - Rate limiting
 * - Leaderboards
 * - Real-time counters
 * 
 * WHY REDIS CLUSTER?
 * - Horizontal scaling (add nodes, get more capacity)
 * - High availability (automatic failover)
 * - 1M ops/second per node
 * - Data partitioning across multiple masters
 */

import Redis, { Cluster, type RedisOptions } from 'ioredis';
import { getUpstashRedis } from '../lib/upstash-redis';

let redisCluster: Cluster | null = null;
let redisSingle: Redis | null = null;
let upstashRedis: any = null;

/**
 * Initialize Redis Cluster connection
 * 
 * Production: 6-node cluster (3 masters + 3 replicas)
 * Development: Single Redis instance
 * 
 * CRITICAL FIX: Set DISABLE_REDIS_CACHE=true to bypass Redis when hitting free tier limits
 */
export async function initRedisCluster() {
  // CRITICAL FIX: Check for disable flag (for when free tier limit is exceeded)
  if (process.env.DISABLE_REDIS_CACHE === 'true') {
    console.log('⚠️  CRITICAL: Redis caching is temporarily disabled (DISABLE_REDIS_CACHE=true)');
    console.log('⚠️  Falling back to PostgreSQL-only mode. Set DISABLE_REDIS_CACHE=false to re-enable.');
    return;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const redisUrl = process.env.REDIS_URL;

  // Try Upstash Redis first (serverless, REST-based)
  if (process.env.UPSTASH_REDIS_REST_URL) {
    upstashRedis = getUpstashRedis();
    if (upstashRedis) {
      console.log('✅ Using Upstash Redis (HTTP/REST API)');
      return;
    }
  }

  try {
    if (isProduction && process.env.REDIS_CLUSTER_NODES) {
      // Production: Redis Cluster mode
      const clusterNodes = process.env.REDIS_CLUSTER_NODES.split(',').map(node => {
        const [host, port] = node.split(':');
        return { host, port: parseInt(port) };
      });

      redisCluster = new Redis.Cluster(clusterNodes, {
        redisOptions: {
          password: process.env.REDIS_PASSWORD,
          tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        },
        clusterRetryStrategy: (times) => {
          const delay = Math.min(100 + times * 2, 2000);
          return delay;
        },
        enableReadyCheck: true,
        maxRedirections: 16,
      });

      redisCluster.on('connect', () => {
        console.log('✅ Redis Cluster connected:', clusterNodes.length, 'nodes');
      });

      redisCluster.on('error', (err: Error) => {
        console.error('❌ Redis Cluster error:', err);
      });

    } else {
      // Development: Single Redis instance
      redisSingle = new Redis(redisUrl || 'redis://localhost:6379', {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      redisSingle.on('connect', () => {
        console.log('✅ Redis connected (single instance):', redisUrl || 'localhost:6379');
      });

      redisSingle.on('error', (err: Error) => {
        console.error('❌ Redis error:', err);
      });
    }

  } catch (error) {
    console.error('❌ Redis initialization failed:', error);
    console.log('⚠️  Running without Redis - sessions will use memory store');
  }
}

/**
 * Get Redis client (Upstash > cluster > single)
 */
export function getRedisClient(): any {
  return upstashRedis || redisCluster || redisSingle;
}

/**
 * Cache video metadata
 */
export async function cacheVideoMetadata(videoId: string, data: any, ttlSeconds: number = 3600) {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.setex(`video:${videoId}`, ttlSeconds, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('❌ Redis cache write failed:', error);
    return false;
  }
}

/**
 * Get cached video metadata
 */
export async function getCachedVideoMetadata(videoId: string): Promise<any | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const cached = await client.get(`video:${videoId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('❌ Redis cache read failed:', error);
    return null;
  }
}

/**
 * Increment video view counter (atomic)
 */
export async function incrementVideoViews(videoId: string): Promise<number> {
  const client = getRedisClient();
  if (!client) return 0;

  try {
    return await client.incr(`views:${videoId}`);
  } catch (error) {
    console.error('❌ Redis increment failed:', error);
    return 0;
  }
}

/**
 * Update leaderboard (sorted set)
 */
export async function updateLeaderboard(
  leaderboardId: string,
  userId: string,
  score: number
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.zadd(`leaderboard:${leaderboardId}`, score, userId);
    return true;
  } catch (error) {
    console.error('❌ Redis leaderboard update failed:', error);
    return false;
  }
}

/**
 * Get top N from leaderboard
 */
export async function getLeaderboardTop(
  leaderboardId: string,
  limit: number = 10
): Promise<Array<{ userId: string; score: number }>> {
  const client = getRedisClient();
  if (!client) return [];

  try {
    const results = await client.zrevrange(
      `leaderboard:${leaderboardId}`,
      0,
      limit - 1,
      'WITHSCORES'
    );

    const leaderboard: Array<{ userId: string; score: number }> = [];
    for (let i = 0; i < results.length; i += 2) {
      leaderboard.push({
        userId: results[i],
        score: parseFloat(results[i + 1]),
      });
    }

    return leaderboard;
  } catch (error) {
    console.error('❌ Redis leaderboard read failed:', error);
    return [];
  }
}

/**
 * Health check
 */
export async function isRedisHealthy(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.ping();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Close connection
 */
export async function closeRedisCluster() {
  if (redisCluster) {
    await redisCluster.quit();
    console.log('✅ Redis Cluster disconnected');
  }
  if (redisSingle) {
    await redisSingle.quit();
    console.log('✅ Redis disconnected');
  }
}
