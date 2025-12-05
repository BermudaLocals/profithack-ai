/**
 * Upstash Redis HTTP Client
 * Ultra-fast serverless Redis with REST API
 */
import { Redis } from '@upstash/redis';

let upstashClient: Redis | null = null;

export function getUpstashRedis(): Redis | null {
  if (upstashClient) return upstashClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.log('⚠️  Upstash Redis not configured - set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
    return null;
  }

  try {
    upstashClient = new Redis({
      url,
      token,
    });
    console.log('✅ Upstash Redis initialized:', url);
    return upstashClient;
  } catch (error) {
    console.error('❌ Upstash Redis initialization failed:', error);
    return null;
  }
}

export const upstashRedis = getUpstashRedis();
