import { redis } from '../lib/redis.js';
import pg from 'pg'; const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
export function healthRoutes(app){app.get('/healthz',async(req,res)=>{try{await pool.query('select 1');await redis.ping();res.json({ok:true,time:new Date().toISOString()})}catch(e){res.status(500).json({ok:false,error:String(e)})}});app.get('/readyz',(req,res)=>res.send('ok'));}
