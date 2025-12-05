import { redis } from '../lib/redis.js';
import pg from 'pg'; const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export function healthRoutes(app) {
  const healthCheck = async (req, res) => {
    try {
      await pool.query('SELECT 1');
      await redis.ping();
      res.json({
        status: 'healthy',
        ok: true,
        time: new Date().toISOString(),
        services: {
          database: 'healthy',
          redis: 'healthy'
        }
      });
    } catch (e) {
      res.status(500).json({
        status: 'unhealthy',
        ok: false,
        error: String(e)
      });
    }
  };

  app.get('/health', healthCheck);
  app.get('/healthz', healthCheck);
  app.get('/readyz', (req, res) => res.send('ok'));
}
