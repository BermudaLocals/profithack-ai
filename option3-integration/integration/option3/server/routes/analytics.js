import { cached } from '../lib/cache.js';
import { redis } from '../lib/redis.js';
import pg from 'pg'; const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
export function analyticsRoutes(app, io){app.get('/api/analytics/live',async(req,res)=>{const data=await cached('analytics:live:15s',15,async()=>{const [{rows:users},{rows:posts}]=await Promise.all([pool.query('select count(*)::int as c from users'),pool.query('select count(*)::int as c from posts')]);const activeUsers=await redis.get('analytics:active_users')||0;const earnings=await redis.get('analytics:earnings_today')||0;return {active_users:Number(activeUsers),users_total:users[0].c,posts_total:posts[0].c,earnings_today:Number(earnings)}});res.json(data)});setInterval(async()=>{try{const r=await fetch((process.env.PUBLIC_URL_BASE||'http://localhost:'+ (process.env.PORT||3000)) + '/api/analytics/live');const payload=await r.json();io.emit('analytics',payload)}catch(e){}},5000)}
