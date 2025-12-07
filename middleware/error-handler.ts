import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * PROFITHACK AI - Production Error Handling
 * Centralized error management with proper logging and security
 */

interface AppError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
  isOperational?: boolean;
}

const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'api_key',
  'apiKey',
  'authorization',
  'cookie',
  'session',
  'credit_card',
  'creditCard',
  'ssn',
];

function sanitizeError(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeError(sanitized[key]);
    }
  }

  return sanitized;
}

function logError(error: AppError, req: Request) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown',
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
  };

  console.error('[ERROR]', JSON.stringify(sanitizeError(errorLog)));
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const error: AppError = new Error(`Route not found: ${req.method} ${req.path}`);
  error.status = 404;
  error.code = 'ROUTE_NOT_FOUND';
  error.isOperational = true;
  next(error);
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logError(err, req);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      code: 'VALIDATION_ERROR',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Handle known operational errors
  if (err.isOperational) {
    return res.status(err.status || 400).json({
      success: false,
      error: err.message,
      code: err.code || 'OPERATIONAL_ERROR',
    });
  }

  // Handle database errors
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'Resource already exists',
      code: 'DUPLICATE_ENTRY',
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: 'Referenced resource does not exist',
      code: 'FOREIGN_KEY_VIOLATION',
    });
  }

  // Default error response (hide details in production)
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message;

  res.status(status).json({
    success: false,
    error: message,
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details,
    }),
  });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export class HttpError extends Error {
  status: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, status: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = 'Bad Request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = 'Not Found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends HttpError {
  constructor(message: string = 'Conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(message: string = 'Too Many Requests') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
};
