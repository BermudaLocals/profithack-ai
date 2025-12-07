import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

/**
 * PROFITHACK AI - Production Rate Limiting
 * Prevents API abuse, brute force attacks, and DDoS protection
 */

// Global rate limiter: 100 requests per minute per IP
const globalRateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60,
  blockDuration: 60,
});

// Strict rate limiter: 10 attempts per 5 minutes (for auth endpoints)
const authRateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 300,
  blockDuration: 600,
});

// API key rate limiter: 1000 requests per minute (for authenticated APIs)
const apiKeyRateLimiter = new RateLimiterMemory({
  points: 1000,
  duration: 60,
  blockDuration: 60,
});

// Upload rate limiter: 10 uploads per hour
const uploadRateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 3600,
  blockDuration: 3600,
});

// Payment rate limiter: 5 attempts per 10 minutes
const paymentRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 600,
  blockDuration: 1800,
});

function getClientIdentifier(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0].trim() 
    : req.ip || req.socket.remoteAddress || 'unknown';
  return ip;
}

function setRateLimitHeaders(res: Response, rateLimiterRes: RateLimiterRes, points: number) {
  res.setHeader('X-RateLimit-Limit', points);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimiterRes.remainingPoints));
  res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
  res.setHeader('Retry-After', Math.ceil(rateLimiterRes.msBeforeNext / 1000));
}

export async function globalRateLimit(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = getClientIdentifier(req);
    const rateLimiterRes = await globalRateLimiter.consume(clientId);
    setRateLimitHeaders(res, rateLimiterRes, 100);
    next();
  } catch (error) {
    const rateLimiterRes = error as RateLimiterRes;
    setRateLimitHeaders(res, rateLimiterRes, 100);
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please slow down and try again later.',
      retryAfter: Math.ceil(rateLimiterRes.msBeforeNext / 1000),
    });
  }
}

export async function authRateLimit(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = getClientIdentifier(req);
    const key = `auth:${clientId}`;
    const rateLimiterRes = await authRateLimiter.consume(key);
    setRateLimitHeaders(res, rateLimiterRes, 10);
    next();
  } catch (error) {
    const rateLimiterRes = error as RateLimiterRes;
    setRateLimitHeaders(res, rateLimiterRes, 10);
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Account temporarily locked. Please try again later.',
      retryAfter: Math.ceil(rateLimiterRes.msBeforeNext / 1000),
    });
  }
}

export async function uploadRateLimit(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = getClientIdentifier(req);
    const key = `upload:${clientId}`;
    const rateLimiterRes = await uploadRateLimiter.consume(key);
    setRateLimitHeaders(res, rateLimiterRes, 10);
    next();
  } catch (error) {
    const rateLimiterRes = error as RateLimiterRes;
    setRateLimitHeaders(res, rateLimiterRes, 10);
    res.status(429).json({
      error: 'Upload limit reached',
      message: 'You can only upload 10 files per hour. Please try again later.',
      retryAfter: Math.ceil(rateLimiterRes.msBeforeNext / 1000),
    });
  }
}

export async function paymentRateLimit(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = getClientIdentifier(req);
    const key = `payment:${clientId}`;
    const rateLimiterRes = await paymentRateLimiter.consume(key);
    setRateLimitHeaders(res, rateLimiterRes, 5);
    next();
  } catch (error) {
    const rateLimiterRes = error as RateLimiterRes;
    setRateLimitHeaders(res, rateLimiterRes, 5);
    res.status(429).json({
      error: 'Payment rate limit exceeded',
      message: 'Too many payment attempts. Please wait before trying again.',
      retryAfter: Math.ceil(rateLimiterRes.msBeforeNext / 1000),
    });
  }
}

export default {
  globalRateLimit,
  authRateLimit,
  uploadRateLimit,
  paymentRateLimit,
};
