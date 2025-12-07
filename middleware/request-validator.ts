import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';

/**
 * PROFITHACK AI - Production Request Validation
 * Type-safe request validation using Zod schemas
 */

type ValidationTarget = 'body' | 'query' | 'params';

interface ValidationOptions {
  stripUnknown?: boolean;
  abortEarly?: boolean;
}

export function validateRequest(
  schema: ZodSchema,
  target: ValidationTarget = 'body',
  options: ValidationOptions = {}
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[target];
      const validated = await schema.parseAsync(data);
      
      // Replace request data with validated data
      (req as any)[target] = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors,
        });
      }

      next(error);
    }
  };
}

export function validateBody(schema: ZodSchema) {
  return validateRequest(schema, 'body');
}

export function validateQuery(schema: ZodSchema) {
  return validateRequest(schema, 'query');
}

export function validateParams(schema: ZodSchema) {
  return validateRequest(schema, 'params');
}

// Common validation schemas
export const commonSchemas = {
  // Pagination schema
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),

  // ID parameter schema
  idParam: z.object({
    id: z.string().min(1, 'ID is required'),
  }),

  // UUID parameter schema
  uuidParam: z.object({
    id: z.string().uuid('Invalid UUID format'),
  }),

  // Email validation
  email: z.string().email('Invalid email address'),

  // Password validation (strong)
  strongPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  // Username validation
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

  // URL validation
  url: z.string().url('Invalid URL format'),

  // Date range validation
  dateRange: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  }).refine(data => data.startDate <= data.endDate, {
    message: 'Start date must be before or equal to end date',
  }),

  // File upload metadata
  fileUpload: z.object({
    filename: z.string().min(1),
    mimetype: z.string().min(1),
    size: z.number().positive().max(100 * 1024 * 1024, 'File size must be less than 100MB'),
  }),

  // Search query
  searchQuery: z.object({
    q: z.string().min(1, 'Search query is required').max(200, 'Search query too long'),
    filters: z.record(z.string()).optional(),
  }),

  // Geographic coordinates
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),

  // Price/amount validation
  amount: z.number().positive('Amount must be positive').multipleOf(0.01, 'Amount must have at most 2 decimal places'),

  // Credit card (basic validation - use Stripe for real validation)
  creditCardLast4: z.string().length(4).regex(/^\d{4}$/, 'Must be 4 digits'),
};

// Auth schemas
export const authSchemas = {
  register: z.object({
    email: commonSchemas.email,
    password: commonSchemas.strongPassword,
    username: commonSchemas.username,
    displayName: z.string().min(1).max(50).optional(),
  }),

  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional().default(false),
  }),

  forgotPassword: z.object({
    email: commonSchemas.email,
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Token is required'),
    password: commonSchemas.strongPassword,
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: commonSchemas.strongPassword,
  }),
};

// Video schemas
export const videoSchemas = {
  create: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    tags: z.array(z.string()).max(20).optional(),
    categoryId: z.string().optional(),
    isPrivate: z.boolean().optional().default(false),
    isPremium: z.boolean().optional().default(false),
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    tags: z.array(z.string()).max(20).optional(),
    categoryId: z.string().optional(),
    isPrivate: z.boolean().optional(),
    isPremium: z.boolean().optional(),
  }),
};

// Payment schemas
export const paymentSchemas = {
  createPayment: z.object({
    amount: commonSchemas.amount,
    currency: z.enum(['USD', 'EUR', 'GBP', 'BTC', 'ETH']).default('USD'),
    paymentMethod: z.enum(['stripe', 'paypal', 'crypto', 'square']),
    description: z.string().max(500).optional(),
  }),

  subscription: z.object({
    planId: z.string().min(1),
    paymentMethodId: z.string().min(1),
  }),
};

export default {
  validateRequest,
  validateBody,
  validateQuery,
  validateParams,
  commonSchemas,
  authSchemas,
  videoSchemas,
  paymentSchemas,
};
