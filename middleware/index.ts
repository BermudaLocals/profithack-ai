/**
 * PROFITHACK AI - Middleware Index
 * Central export for all production middleware
 */

export { corsMiddleware } from './cors';
export { 
  globalRateLimit, 
  authRateLimit, 
  uploadRateLimit, 
  paymentRateLimit 
} from './rate-limit';
export { 
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
} from './error-handler';
export { 
  validateRequest, 
  validateBody, 
  validateQuery, 
  validateParams,
  commonSchemas,
  authSchemas,
  videoSchemas,
  paymentSchemas,
} from './request-validator';
export { 
  securityLogger, 
  requestIdMiddleware 
} from './auth-logger';
