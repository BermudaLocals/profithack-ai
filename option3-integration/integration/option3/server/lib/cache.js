import { redis } from './redis.js';
export async function cached(key, ttlSec, fetcher) {
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);
  const data = await fetcher();
  await redis.setex(key, ttlSec, JSON.stringify(data));
  return data;
}
