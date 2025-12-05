import Redis from 'ioredis';
const url = process.env.REDIS_URL || 'redis://localhost:6379/0';
export const redis = new Redis(url);
redis.on('error', (e) => console.error('[redis]', e.message));
export default redis;
