import { Request } from "express";

// Known bot user agents
const BOT_USER_AGENTS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
  'axios', 'go-http-client', 'java', 'okhttp', 'apache-httpclient',
  'headless', 'phantom', 'selenium', 'puppeteer', 'playwright',
  'postman', 'insomnia', 'httpie', 'perl', 'ruby',
];

// Suspicious patterns
const SUSPICIOUS_PATTERNS = [
  'undefined', 'null', 'test', 'admin', 'root', 'api', 'script',
];

interface BotDetectionResult {
  isBot: boolean;
  reason?: string;
  score: number; // 0-100, higher = more likely a bot
}

/**
 * Detect if a request is from a bot
 * Returns a score from 0-100 where higher scores indicate bot-like behavior
 */
export function detectBot(req: Request): BotDetectionResult {
  let score = 0;
  const reasons: string[] = [];

  // Check User-Agent
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  
  if (!userAgent || userAgent.length < 10) {
    score += 40;
    reasons.push('Missing or suspiciously short user agent');
  }

  // Check for bot signatures in user agent
  for (const botPattern of BOT_USER_AGENTS) {
    if (userAgent.includes(botPattern.toLowerCase())) {
      score += 50;
      reasons.push(`Bot signature detected: ${botPattern}`);
      break;
    }
  }

  // Check for headless browser indicators
  if (userAgent.includes('headless') || userAgent.includes('phantom')) {
    score += 60;
    reasons.push('Headless browser detected');
  }

  // Check for missing common headers
  if (!req.headers['accept-language']) {
    score += 15;
    reasons.push('Missing accept-language header');
  }

  if (!req.headers['accept-encoding']) {
    score += 10;
    reasons.push('Missing accept-encoding header');
  }

  if (!req.headers['accept']) {
    score += 10;
    reasons.push('Missing accept header');
  }

  // Check for suspicious referer
  const referer = req.headers['referer'] || req.headers['origin'] || '';
  if (referer && (referer.includes('localhost') && !req.headers.host?.includes('localhost'))) {
    score += 20;
    reasons.push('Suspicious referer');
  }

  // Check request method (bots often use non-browser methods)
  if (req.method !== 'GET' && req.method !== 'POST') {
    score += 25;
    reasons.push(`Unusual HTTP method: ${req.method}`);
  }

  // Determine if this is a bot (threshold: 50)
  const isBot = score >= 50;

  return {
    isBot,
    reason: reasons.join('; '),
    score,
  };
}

/**
 * Check if an email looks like a disposable/temporary email
 */
export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com',
    '10minutemail.com', 'temp-mail.org', 'trashmail.com', 'yopmail.com',
    'maildrop.cc', 'getnada.com', 'fakeinbox.com', 'sharklasers.com',
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.some(disposable => domain?.includes(disposable));
}

/**
 * Check for suspicious patterns in input
 */
export function hasSuspiciousPattern(input: string): boolean {
  const lower = input.toLowerCase();
  
  // Check for SQL injection attempts
  if (lower.includes('select ') || lower.includes('union ') || lower.includes('drop ')) {
    return true;
  }

  // Check for XSS attempts
  if (lower.includes('<script') || lower.includes('javascript:')) {
    return true;
  }

  // Check for excessive special characters
  const specialCharCount = (input.match(/[^a-zA-Z0-9@.\-_\s]/g) || []).length;
  if (specialCharCount > input.length * 0.3) {
    return true;
  }

  return false;
}

/**
 * Middleware to block bots
 */
export function blockBots(req: Request, res: any, next: any) {
  const detection = detectBot(req);
  
  if (detection.isBot) {
    console.log(`🚫 Bot blocked: ${detection.reason} (score: ${detection.score})`);
    return res.status(403).json({ 
      error: 'Automated traffic detected. Please use a real browser.',
      code: 'BOT_DETECTED'
    });
  }
  
  next();
}
