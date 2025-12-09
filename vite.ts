import express from 'express';
import type { Express } from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

export async function createViteServer(app: Express) {
  if (!isProduction) {
    // ✅ DEVELOPMENT: Use Vite dev server with HMR
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa', // or 'custom'
    });
    app.use(vite.middlewares);
    console.log('Vite dev server attached.');
  } else {
    // ✅ PRODUCTION: Serve static files from the pre-built client
    const clientDistPath = path.join(__dirname, '../dist/client');
    app.use(express.static(clientDistPath));
    
    // Fallback to index.html for SPA routing (e.g., React Router)
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
    console.log('Serving static files from:', clientDistPath);
  }
}
