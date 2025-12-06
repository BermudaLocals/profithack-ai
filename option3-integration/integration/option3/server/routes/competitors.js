import pg from 'pg'; const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
export function competitorsRoutes(app){app.get('/api/competitors',async(req,res)=>{const q=await pool.query('select handle, last_viral_at, avg_engagement from competitor_accounts order by last_viral_at desc nulls last limit 100');res.json({items:q.rows})});}
