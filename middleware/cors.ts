import { Request, Response, NextFunction } from 'express';

const ALLOWED_ORIGINS = [
  'https://profithack-ai.railway.app',
  'https://www.profithack.com',
  'http://localhost:5000',
  'http://localhost:3000',
  process.env.FRONTEND_URL || '',
].filter(Boolean);

/**
 * CORS Middleware - Handle cross-origin requests safely
 * Prevents CSRF attacks and restricts API access to trusted origins
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin || '';
  const isPreflight = req.method === 'OPTIONS';

  // Allow whitelisted origins
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-API-Key');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '3600');
  }

  // Security headers - Prevent common attacks
  res.setHeader('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
  res.setHeader('X-Frame-Options', 'DENY'); // Prevent clickjacking
  res.setHeader('X-XSS-Protection', '1; mode=block'); // Enable XSS protection
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'); // HSTS
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Handle preflight requests
  if (isPreflight) {
    return res.sendStatus(200);
  }

  next();
}

export default corsMiddleware;
