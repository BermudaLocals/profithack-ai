// import { cached } from '../lib/cache.js';
// import { redis } from '../lib/redis.js';
import pg from 'pg'; const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export function analyticsRoutes(app, io){app.get('/api/analytics/live',async(req,res)=>{try{const [{rows:users},{rows:videos}]=await Promise.all([pool.query('select count(*)::int as c from users'),pool.query('select count(*)::int as c from videos')]);const data={active_users:0,users_total:users[0].c,videos_total:videos[0].c,earnings_today:0};res.json(data)}catch(e){res.status(500).json({error:'Analytics error'})}})}
