import { cached } from '../lib/cache.js';
import pg from 'pg'; const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export function trendingRoutes(app){app.get('/api/trending',async(req,res)=>{const items=await cached('trending:top:5m',300,async()=>{const q=await pool.query(`select id, topic, trend_score, growth_rate, last_updated, suggested_hooks, recommended_hashtags from trending_topics where is_active = true order by trend_score desc nulls last, last_updated desc limit 50`);return q.rows;});res.json({items})});}
