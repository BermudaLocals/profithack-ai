import { cached } from '../lib/cache.js';
import pg from 'pg'; const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
export function trendingRoutes(app){app.get('/api/trending',async(req,res)=>{const items=await cached('trending:top:5m',300,async()=>{const q=await pool.query(`select id, keyword, score, last_seen_at from trending_topics order by score desc nulls last, last_seen_at desc limit 50`);return q.rows;});res.json({items})});}
