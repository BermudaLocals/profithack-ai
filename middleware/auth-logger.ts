import { Request, Response, NextFunction } from 'express';

/**
 * PROFITHACK AI - Production Security Logging
 * Secure logging with PII/secret masking for compliance
 */

const SENSITIVE_HEADERS = [
  'authorization',
  'x-api-key',
  'cookie',
  'set-cookie',
  'x-auth-token',
  'x-session-id',
];

const SENSITIVE_BODY_FIELDS = [
  'password',
  'newPassword',
  'currentPassword',
  'confirmPassword',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'accessToken',
  'refreshToken',
  'creditCard',
  'credit_card',
  'cardNumber',
  'card_number',
  'cvv',
  'cvc',
  'ssn',
  'socialSecurityNumber',
  'bankAccount',
  'routingNumber',
];

function maskValue(value: string): string {
  if (!value) return value;
  if (value.length <= 4) return '****';
  return value.substring(0, 2) + '*'.repeat(Math.min(value.length - 4, 8)) + value.substring(value.length - 2);
}

function maskObject(obj: any, sensitiveFields: string[]): any {
  if (!obj || typeof obj !== 'object') return obj;

  const masked = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key of Object.keys(masked)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
      if (typeof masked[key] === 'string') {
        masked[key] = maskValue(masked[key]);
      } else {
        masked[key] = '[REDACTED]';
      }
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskObject(masked[key], sensitiveFields);
    }
  }

  return masked;
}

function getClientInfo(req: Request) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : req.ip || req.socket.remoteAddress;

  return {
    ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    referer: req.headers['referer'] || 'direct',
    origin: req.headers['origin'] || 'unknown',
  };
}

export function securityLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Add request ID to headers for tracking
  req.headers['x-request-id'] = requestId as string;
  res.setHeader('X-Request-ID', requestId);

  // Log auth-related requests
  const isAuthRequest = 
    req.path.includes('/auth') ||
    req.path.includes('/login') ||
    req.path.includes('/register') ||
    req.path.includes('/password') ||
    req.path.includes('/session');

  const isPaymentRequest =
    req.path.includes('/payment') ||
    req.path.includes('/subscription') ||
    req.path.includes('/checkout') ||
    req.path.includes('/stripe') ||
    req.path.includes('/paypal');

  if (isAuthRequest || isPaymentRequest) {
    const clientInfo = getClientInfo(req);
    const maskedHeaders = maskObject(
      Object.fromEntries(
        Object.entries(req.headers).filter(([key]) => 
          SENSITIVE_HEADERS.some(h => key.toLowerCase().includes(h))
        )
      ),
      SENSITIVE_HEADERS
    );
    const maskedBody = maskObject(req.body, SENSITIVE_BODY_FIELDS);

    const logEntry = {
      type: isAuthRequest ? 'AUTH_REQUEST' : 'PAYMENT_REQUEST',
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.path,
      client: clientInfo,
      headers: maskedHeaders,
      body: maskedBody,
    };

    console.log(`[SECURITY] ${JSON.stringify(logEntry)}`);

    // Log response
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const responseLog = {
        type: isAuthRequest ? 'AUTH_RESPONSE' : 'PAYMENT_RESPONSE',
        timestamp: new Date().toISOString(),
        requestId,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        success: res.statusCode < 400,
      };

      // Log failed auth attempts with higher priority
      if (isAuthRequest && res.statusCode >= 400) {
        console.warn(`[SECURITY_ALERT] Failed auth attempt: ${JSON.stringify({ ...responseLog, client: clientInfo })}`);
      } else {
        console.log(`[SECURITY] ${JSON.stringify(responseLog)}`);
      }
    });
  }

  next();
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.headers['x-request-id'] = requestId as string;
  res.setHeader('X-Request-ID', requestId);
  next();
}

export default {
  securityLogger,
  requestIdMiddleware,
};
