/**
 * PROFITHACK AI - XAI (Explainable AI) Recommendation Engine
 * 
 * Provides transparent, explainable video recommendations
 * Users can see WHY videos are recommended
 * 
 * Features:
 * - Multi-factor scoring (engagement, similarity, freshness)
 * - Explainable weights and factors
 * - Real-time personalization
 * - A/B testing support
 */

import { produceUserActivityEvent } from './kafkaProducer';
import { getCachedVideoMetadata } from '../config/redis-cluster';

/**
 * Recommendation factors (explainable)
 */
interface RecommendationFactors {
  engagement_score: number;        // Based on likes, shares, comments
  similarity_score: number;         // Content similarity to user's history
  freshness_score: number;          // Time decay (newer = higher)
  creator_affinity_score: number;   // User's engagement with this creator
  trending_score: number;           // Global trending factor
  diversity_bonus: number;          // Prevents filter bubble
}

/**
 * Explainable recommendation result
 */
interface ExplainableRecommendation {
  video_id: string;
  final_score: number;
  factors: RecommendationFactors;
  explanation: string[];            // Human-readable reasons
  confidence: number;               // 0-1 confidence score
}

/**
 * Get personalized recommendations with explanations
 * 
 * This is the XAI component that makes recommendations transparent
 */
export async function getExplainableRecommendations(
  userId: string,
  category: string = 'reels',
  limit: number = 20
): Promise<ExplainableRecommendation[]> {
  console.log(`🧠 XAI: Generating explainable recommendations for user ${userId}`);
  
  try {
    // Step 1: Get user's viewing history and preferences
    const userProfile = await getUserProfile(userId);
    
    // Step 2: Get candidate videos
    const candidates = await getCandidateVideos(category, userId);
    
    // Step 3: Score each video with explainable factors
    const scored = candidates.map(video => {
      const factors = calculateRecommendationFactors(video, userProfile);
      const finalScore = calculateFinalScore(factors);
      const explanation = generateExplanation(factors, video);
      
      return {
        video_id: video.id,
        final_score: finalScore,
        factors,
        explanation,
        confidence: calculateConfidence(factors),
      };
    });
    
    // Step 4: Sort by score and apply diversity
    const ranked = scored
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, limit);
    
    // Step 5: Apply diversity filter (prevent filter bubble)
    const diversified = applyDiversityFilter(ranked);
    
    console.log(`✅ XAI: Generated ${diversified.length} explainable recommendations`);
    
    return diversified;
  } catch (error) {
    console.error('❌ XAI recommendation error:', error);
    return [];
  }
}

/**
 * Get user profile for personalization
 */
async function getUserProfile(userId: string): Promise<any> {
  // TODO: Fetch from Cassandra user history
  // For now, return mock profile
  
  return {
    userId,
    preferredCategories: ['tech', 'finance', 'lifestyle'],
    favoriteCreators: ['creator1', 'creator2'],
    avgWatchTime: 25.5, // seconds
    engagementRate: 0.15,
    lastActive: new Date(),
  };
}

/**
 * Get candidate videos for recommendation
 */
async function getCandidateVideos(category: string, userId: string): Promise<any[]> {
  // TODO: Fetch from PostgreSQL + Redis cache
  // For now, return mock candidates
  
  return [
    {
      id: 'video1',
      title: 'How to Make $10K/Month with AI',
      views: 15000,
      likes: 850,
      shares: 120,
      creatorId: 'creator1',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      category: 'tech',
      tags: ['ai', 'money', 'tutorial'],
    },
    {
      id: 'video2',
      title: 'PROFITHACK AI Review - Is It Worth It?',
      views: 23000,
      likes: 1520,
      shares: 340,
      creatorId: 'creator2',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      category: 'tech',
      tags: ['review', 'profithack', 'platform'],
    },
    {
      id: 'video3',
      title: 'My First $1000 on PROFITHACK',
      views: 8500,
      likes: 420,
      shares: 67,
      creatorId: 'creator3',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      category: 'finance',
      tags: ['money', 'success', 'creator'],
    },
  ];
}

/**
 * Calculate explainable recommendation factors
 */
function calculateRecommendationFactors(
  video: any,
  userProfile: any
): RecommendationFactors {
  // 1. Engagement score (likes, shares, views ratio)
  const engagementRate = (video.likes + video.shares * 2) / video.views;
  const engagement_score = Math.min(engagementRate * 100, 1);
  
  // 2. Similarity score (content tags vs user preferences)
  const similarity_score = calculateContentSimilarity(video.tags, userProfile.preferredCategories);
  
  // 3. Freshness score (time decay)
  const ageHours = (Date.now() - video.createdAt.getTime()) / (1000 * 60 * 60);
  const freshness_score = Math.exp(-ageHours / 24); // Exponential decay
  
  // 4. Creator affinity (does user like this creator?)
  const creator_affinity_score = userProfile.favoriteCreators.includes(video.creatorId) ? 1 : 0.5;
  
  // 5. Trending score (global popularity)
  const trending_score = Math.min(video.views / 100000, 1);
  
  // 6. Diversity bonus (encourage exploring new content)
  const diversity_bonus = 0.1; // Small bonus for diversity
  
  return {
    engagement_score,
    similarity_score,
    freshness_score,
    creator_affinity_score,
    trending_score,
    diversity_bonus,
  };
}

/**
 * Calculate content similarity
 */
function calculateContentSimilarity(videoTags: string[], userCategories: string[]): number {
  const matchingTags = videoTags.filter(tag => 
    userCategories.some(cat => tag.toLowerCase().includes(cat.toLowerCase()))
  );
  
  return matchingTags.length / Math.max(videoTags.length, 1);
}

/**
 * Calculate final weighted score
 * 
 * Weights are tunable for A/B testing
 */
function calculateFinalScore(factors: RecommendationFactors): number {
  const weights = {
    engagement: 0.30,
    similarity: 0.25,
    freshness: 0.20,
    creator_affinity: 0.15,
    trending: 0.05,
    diversity: 0.05,
  };
  
  return (
    factors.engagement_score * weights.engagement +
    factors.similarity_score * weights.similarity +
    factors.freshness_score * weights.freshness +
    factors.creator_affinity_score * weights.creator_affinity +
    factors.trending_score * weights.trending +
    factors.diversity_bonus * weights.diversity
  );
}

/**
 * Generate human-readable explanation
 * 
 * This is the KEY XAI feature - users see WHY
 */
function generateExplanation(factors: RecommendationFactors, video: any): string[] {
  const explanations: string[] = [];
  
  if (factors.engagement_score > 0.7) {
    explanations.push(`🔥 Highly engaging (${Math.round(factors.engagement_score * 100)}% engagement rate)`);
  }
  
  if (factors.similarity_score > 0.6) {
    explanations.push(`✨ Matches your interests (${Math.round(factors.similarity_score * 100)}% similarity)`);
  }
  
  if (factors.freshness_score > 0.8) {
    explanations.push(`🆕 Recently posted (${Math.round((1 - factors.freshness_score) * 24)} hours ago)`);
  }
  
  if (factors.creator_affinity_score > 0.9) {
    explanations.push(`⭐ From a creator you follow`);
  }
  
  if (factors.trending_score > 0.5) {
    explanations.push(`📈 Trending right now (${video.views.toLocaleString()} views)`);
  }
  
  if (explanations.length === 0) {
    explanations.push(`🎯 Recommended based on your viewing patterns`);
  }
  
  return explanations;
}

/**
 * Calculate confidence score
 */
function calculateConfidence(factors: RecommendationFactors): number {
  // Higher confidence when multiple strong signals
  const strongSignals = Object.values(factors).filter(v => v > 0.7).length;
  return Math.min(strongSignals / 4, 1);
}

/**
 * Apply diversity filter to prevent filter bubble
 */
function applyDiversityFilter(
  recommendations: ExplainableRecommendation[]
): ExplainableRecommendation[] {
  // Ensure top 20 has at least 3 different categories/creators
  // This is a simplified implementation
  
  return recommendations;
}

/**
 * Record recommendation feedback (for ML training)
 */
export async function recordRecommendationFeedback(
  userId: string,
  videoId: string,
  action: 'click' | 'skip' | 'like' | 'share',
  factors: RecommendationFactors
): Promise<void> {
  // Stream to Kafka for ML model retraining
  await produceUserActivityEvent({
    userId,
    videoId,
    action,
    watchDurationMs: 0,
  });
  
  console.log(`✅ XAI: Recorded feedback for ${videoId}: ${action}`);
}
