import OpenAI from "openai";
import { storage } from "./storage";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

export type ContentType = 'video' | 'comment' | 'message';
export type SeverityLevel = 'low' | 'medium' | 'high';

export interface ModerationResult {
  flagged: boolean;
  categories: string[];
  severity: SeverityLevel;
  reason: string;
}

export interface StrikeResult {
  strikes: number;
  banned: boolean;
  strikeId?: string;
}

// Category severity mapping
const CATEGORY_SEVERITY: Record<string, SeverityLevel> = {
  // High severity - 2 strikes + immediate removal
  'hate': 'high',
  'hate/threatening': 'high',
  'violence': 'high',
  'violence/graphic': 'high',
  'self-harm': 'high',
  'self-harm/intent': 'high',
  'self-harm/instructions': 'high',
  'sexual/minors': 'high',
  
  // Medium severity - 1 strike
  'harassment': 'medium',
  'harassment/threatening': 'medium',
  'sexual': 'medium',
  
  // Low severity - Warning only
  'spam': 'low',
};

/**
 * Moderate content using OpenAI Moderation API
 * @param content Text content to moderate
 * @param contentType Type of content (video, comment, message)
 * @param userAgeRating User's age rating (for sexual content filtering)
 * @returns Moderation result with flagged status, categories, and severity
 */
export async function moderateContent(
  content: string,
  contentType: ContentType,
  userAgeRating?: 'u16' | '16plus' | '18plus'
): Promise<ModerationResult> {
  try {
    // Call OpenAI Moderation API
    const moderation = await openai.moderations.create({
      input: content,
    });

    const result = moderation.results[0];
    
    if (!result.flagged) {
      return {
        flagged: false,
        categories: [],
        severity: 'low',
        reason: 'Content passed moderation',
      };
    }

    // Extract flagged categories
    const flaggedCategories: string[] = [];
    let highestSeverity: SeverityLevel = 'low';

    for (const [category, isFlagged] of Object.entries(result.categories)) {
      if (isFlagged) {
        flaggedCategories.push(category);
        
        const severity = CATEGORY_SEVERITY[category] || 'low';
        if (severity === 'high') {
          highestSeverity = 'high';
        } else if (severity === 'medium' && highestSeverity !== 'high') {
          highestSeverity = 'medium';
        }
      }
    }

    // Special handling for sexual content based on age rating
    if (flaggedCategories.some(cat => cat.startsWith('sexual')) && userAgeRating !== '18plus') {
      // Sexual content only allowed for 18+ users
      highestSeverity = 'high';
    }

    // Generate human-readable reason
    const reason = generateModerationReason(flaggedCategories, highestSeverity);

    return {
      flagged: true,
      categories: flaggedCategories,
      severity: highestSeverity,
      reason,
    };
  } catch (error) {
    console.error('Moderation API error:', error);
    // Fail-safe: Don't block content on API errors
    return {
      flagged: false,
      categories: [],
      severity: 'low',
      reason: 'Moderation check failed - content allowed',
    };
  }
}

/**
 * Apply auto-strike to user based on violation
 * @param userId User ID to apply strike to
 * @param violation Violation details
 * @param contentId ID of the flagged content
 * @param contentType Type of content
 * @returns Strike result with total strikes and ban status
 */
export async function applyAutoStrike(
  userId: string,
  violation: {
    categories: string[];
    severity: SeverityLevel;
    reason: string;
  },
  contentId: string,
  contentType: ContentType
): Promise<StrikeResult> {
  // Determine number of strikes to apply based on severity
  const strikesToApply = violation.severity === 'high' ? 2 : violation.severity === 'medium' ? 1 : 0;

  if (strikesToApply === 0) {
    // Low severity - just log warning, no strike
    console.log(`Warning issued to user ${userId}: ${violation.reason}`);
    const user = await storage.getUser(userId);
    return {
      strikes: user?.strikeCount || 0,
      banned: false,
    };
  }

  // Create strike record
  const systemUserId = 'system'; // Auto-moderation system user
  
  const strike = await storage.addUserStrike({
    userId,
    reason: `Auto-moderation: ${violation.reason}`,
    strikeReason: violation.reason,
    issuedBy: systemUserId,
    autoModerated: true,
    contentType,
    contentId,
    severity: violation.severity,
    categories: violation.categories,
  });

  // Update user's strike count
  const user = await storage.getUser(userId);
  const currentStrikes = (user?.strikeCount || 0) + strikesToApply;
  
  await storage.updateUser(userId, {
    strikeCount: currentStrikes,
  });

  // Check if user should be banned (5+ strikes)
  const shouldBan = currentStrikes >= 5;
  
  if (shouldBan && !user?.isBanned) {
    await storage.updateUser(userId, {
      isBanned: true,
    });
    console.log(`User ${userId} has been banned after ${currentStrikes} strikes`);
  }

  return {
    strikes: currentStrikes,
    banned: shouldBan,
    strikeId: strike.id,
  };
}

/**
 * Generate human-readable moderation reason
 */
function generateModerationReason(categories: string[], severity: SeverityLevel): string {
  const categoryNames = categories.map(cat => {
    const normalized = cat.replace('/', ' - ');
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  });

  if (severity === 'high') {
    return `Content removed for violating community guidelines: ${categoryNames.join(', ')}. This is a serious violation.`;
  } else if (severity === 'medium') {
    return `Content flagged for: ${categoryNames.join(', ')}. Please review our community guidelines.`;
  } else {
    return `Content may contain: ${categoryNames.join(', ')}. Consider revising.`;
  }
}

/**
 * Moderate video content (title, description, tags)
 */
export async function moderateVideo(
  title: string,
  description: string,
  tags: string[],
  userAgeRating?: 'u16' | '16plus' | '18plus'
): Promise<ModerationResult> {
  const combinedContent = `
Title: ${title}
Description: ${description}
Tags: ${tags.join(', ')}
  `.trim();

  return moderateContent(combinedContent, 'video', userAgeRating);
}

/**
 * Check if user has pending appeals
 */
export async function hasPendingAppeal(userId: string): Promise<boolean> {
  const strikes = await storage.getUserStrikes(userId);
  return strikes.some(strike => strike.appealStatus === 'pending');
}

/**
 * Submit appeal for a strike
 */
export async function submitAppeal(
  strikeId: string,
  userId: string,
  appealReason: string
): Promise<void> {
  await storage.updateStrikeAppeal(strikeId, {
    appealStatus: 'pending',
    appealReason,
  });
}

/**
 * Review appeal (admin function)
 */
export async function reviewAppeal(
  strikeId: string,
  reviewerId: string,
  approved: boolean
): Promise<void> {
  await storage.updateStrikeAppeal(strikeId, {
    appealStatus: approved ? 'approved' : 'rejected',
    appealReviewedBy: reviewerId,
    appealReviewedAt: new Date(),
  });

  if (approved) {
    // Reduce user's strike count by 1 or 2 based on severity
    const strike = await storage.getStrikeById(strikeId);
    if (strike) {
      const user = await storage.getUser(strike.userId);
      if (user) {
        const strikesToRemove = strike.severity === 'high' ? 2 : 1;
        const newStrikeCount = Math.max(0, user.strikeCount - strikesToRemove);
        
        await storage.updateUser(strike.userId, {
          strikeCount: newStrikeCount,
          // Unban if strikes drop below 5
          isBanned: newStrikeCount < 5 ? false : user.isBanned,
        });
      }
    }
  }
}
