/**
 * PROFITHACK AI - Dating/Matching Algorithm Service
 * 
 * Revolutionary dating feature ("Love Connection")
 * Integrated with video profiles and AI matching
 * 
 * Features:
 * - AI-powered compatibility scores
 * - Video-first profiles (Sora 2 integration ready)
 * - Both-sided payment unlock system
 * - Freemium model (5 free swipes/day)
 * - Advanced matching algorithm
 */

import { storeUserSwipeHistory } from './cassandraClient';
import { produceUserActivityEvent } from './kafkaProducer';
import { cacheVideoMetadata, getCachedVideoMetadata } from '../config/redis-cluster';

/**
 * User dating profile
 */
interface DatingProfile {
  userId: string;
  displayName: string;
  age: number;
  gender: string;
  lookingFor: string;
  location: {
    city: string;
    country: string;
    lat: number;
    lon: number;
  };
  bio: string;
  videoProfileUrl?: string; // Sora 2 AI-generated video
  interests: string[];
  photos: string[];
  preferences: {
    ageRange: [number, number];
    maxDistance: number; // km
    genderPreference: string;
  };
}

/**
 * Match compatibility result
 */
interface CompatibilityResult {
  userId1: string;
  userId2: string;
  compatibilityScore: number; // 0-100
  factors: {
    interestMatch: number;
    locationScore: number;
    ageCompatibility: number;
    activityPatternMatch: number;
    aiPersonalityMatch: number;
  };
  matchReasons: string[];
  confidence: number;
}

/**
 * Swipe action
 */
type SwipeAction = 'like' | 'pass' | 'super_like';

/**
 * Match result
 */
interface MatchResult {
  matched: boolean;
  matchId?: string;
  bothPaid: boolean;
  unlockRequired: boolean;
  unlockPrice: {
    credits: number;
    coins: number;
  };
}

/**
 * Get potential matches for user
 * 
 * Uses AI-powered matching algorithm
 */
export async function getPotentialMatches(
  userId: string,
  limit: number = 20
): Promise<DatingProfile[]> {
  console.log(`💘 Getting potential matches for user ${userId}`);
  
  try {
    // Step 1: Get user's profile and preferences
    const userProfile = await getDatingProfile(userId);
    
    if (!userProfile) {
      throw new Error('User profile not found');
    }
    
    // Step 2: Get candidate pool (within distance, age range, etc.)
    const candidates = await getCandidatePool(userProfile);
    
    // Step 3: Calculate compatibility for each candidate
    const scored = await Promise.all(
      candidates.map(async (candidate) => {
        const compatibility = await calculateCompatibility(userProfile, candidate);
        return { ...candidate, _score: compatibility.compatibilityScore };
      })
    );
    
    // Step 4: Sort by compatibility and return top matches
    const topMatches = scored
      .sort((a, b) => (b._score || 0) - (a._score || 0))
      .slice(0, limit);
    
    console.log(`✅ Found ${topMatches.length} potential matches`);
    
    return topMatches;
  } catch (error) {
    console.error('❌ Error getting potential matches:', error);
    return [];
  }
}

/**
 * Record swipe action
 */
export async function recordSwipe(
  userId: string,
  targetUserId: string,
  action: SwipeAction,
  deviceType: string = 'web'
): Promise<MatchResult> {
  console.log(`💘 User ${userId} ${action} user ${targetUserId}`);
  
  try {
    // Store in Cassandra for ML training
    await storeUserSwipeHistory(
      userId,
      targetUserId,
      action === 'like' ? 'swipe_up' : 'swipe_down',
      0,
      deviceType
    );
    
    // Stream to Kafka for real-time analytics
    await produceUserActivityEvent({
      userId,
      videoId: targetUserId, // Using videoId field for target user
      action: action === 'like' ? 'like' : 'swipe_down',
    });
    
    // Check for mutual match
    if (action === 'like' || action === 'super_like') {
      const matched = await checkMutualMatch(userId, targetUserId);
      
      if (matched) {
        return {
          matched: true,
          matchId: `${userId}_${targetUserId}`,
          bothPaid: false,
          unlockRequired: true,
          unlockPrice: {
            credits: 50, // Regular match unlock
            coins: 25,
          },
        };
      }
    }
    
    return {
      matched: false,
      bothPaid: false,
      unlockRequired: false,
      unlockPrice: { credits: 0, coins: 0 },
    };
  } catch (error) {
    console.error('❌ Error recording swipe:', error);
    throw error;
  }
}

/**
 * Calculate compatibility between two users
 * 
 * Multi-factor algorithm:
 * 1. Interest overlap (30%)
 * 2. Location proximity (20%)
 * 3. Age compatibility (15%)
 * 4. Activity pattern match (15%)
 * 5. AI personality analysis (20%)
 */
export async function calculateCompatibility(
  user1: DatingProfile,
  user2: DatingProfile
): Promise<CompatibilityResult> {
  // 1. Interest matching (Jaccard similarity)
  const interestMatch = calculateInterestMatch(user1.interests, user2.interests);
  
  // 2. Location proximity (distance penalty)
  const locationScore = calculateLocationScore(user1.location, user2.location);
  
  // 3. Age compatibility (preference overlap)
  const ageCompatibility = calculateAgeCompatibility(user1, user2);
  
  // 4. Activity pattern match (online times, engagement)
  const activityPatternMatch = await calculateActivityPatternMatch(user1.userId, user2.userId);
  
  // 5. AI personality match (ML model prediction)
  const aiPersonalityMatch = await calculateAIPersonalityMatch(user1.userId, user2.userId);
  
  // Weighted average
  const weights = {
    interest: 0.30,
    location: 0.20,
    age: 0.15,
    activity: 0.15,
    personality: 0.20,
  };
  
  const compatibilityScore = Math.round(
    interestMatch * weights.interest * 100 +
    locationScore * weights.location * 100 +
    ageCompatibility * weights.age * 100 +
    activityPatternMatch * weights.activity * 100 +
    aiPersonalityMatch * weights.personality * 100
  );
  
  // Generate match reasons
  const matchReasons: string[] = [];
  
  if (interestMatch > 0.7) {
    matchReasons.push(`🎯 ${Math.round(interestMatch * 100)}% shared interests`);
  }
  
  if (locationScore > 0.8) {
    const distance = calculateDistance(user1.location, user2.location);
    matchReasons.push(`📍 Only ${Math.round(distance)} km away`);
  }
  
  if (ageCompatibility > 0.9) {
    matchReasons.push(`🎂 Perfect age match`);
  }
  
  if (aiPersonalityMatch > 0.75) {
    matchReasons.push(`✨ AI predicts great chemistry`);
  }
  
  return {
    userId1: user1.userId,
    userId2: user2.userId,
    compatibilityScore,
    factors: {
      interestMatch,
      locationScore,
      ageCompatibility,
      activityPatternMatch,
      aiPersonalityMatch,
    },
    matchReasons,
    confidence: Math.min((matchReasons.length / 4) * 100, 100),
  };
}

/**
 * Get dating profile
 */
async function getDatingProfile(userId: string): Promise<DatingProfile | null> {
  // TODO: Fetch from PostgreSQL dating_profiles table
  // For now, return mock profile
  
  return {
    userId,
    displayName: 'Demo User',
    age: 25,
    gender: 'female',
    lookingFor: 'relationship',
    location: {
      city: 'San Francisco',
      country: 'USA',
      lat: 37.7749,
      lon: -122.4194,
    },
    bio: 'AI enthusiast, entrepreneur, love traveling',
    interests: ['tech', 'travel', 'fitness', 'startup', 'ai'],
    photos: ['photo1.jpg', 'photo2.jpg'],
    preferences: {
      ageRange: [22, 32],
      maxDistance: 50,
      genderPreference: 'male',
    },
  };
}

/**
 * Get candidate pool
 */
async function getCandidatePool(userProfile: DatingProfile): Promise<DatingProfile[]> {
  // TODO: Query PostgreSQL with geospatial index
  // For now, return mock candidates
  
  return [
    {
      userId: 'user2',
      displayName: 'Alex',
      age: 28,
      gender: 'male',
      lookingFor: 'relationship',
      location: { city: 'San Francisco', country: 'USA', lat: 37.7849, lon: -122.4094 },
      bio: 'Tech founder, fitness buff',
      interests: ['tech', 'fitness', 'startup', 'music'],
      photos: ['alex1.jpg', 'alex2.jpg'],
      preferences: { ageRange: [23, 30], maxDistance: 50, genderPreference: 'female' },
    },
    {
      userId: 'user3',
      displayName: 'Jordan',
      age: 26,
      gender: 'male',
      lookingFor: 'relationship',
      location: { city: 'San Francisco', country: 'USA', lat: 37.7649, lon: -122.4294 },
      bio: 'Designer, love art and travel',
      interests: ['design', 'travel', 'art', 'photography'],
      photos: ['jordan1.jpg', 'jordan2.jpg'],
      preferences: { ageRange: [24, 29], maxDistance: 30, genderPreference: 'female' },
    },
  ];
}

/**
 * Calculate interest match (Jaccard similarity)
 */
function calculateInterestMatch(interests1: string[], interests2: string[]): number {
  const set1 = new Set(interests1);
  const set2 = new Set(interests2);
  
  const intersection = [...set1].filter(x => set2.has(x)).length;
  const union = new Set([...set1, ...set2]).size;
  
  return union > 0 ? intersection / union : 0;
}

/**
 * Calculate location score
 */
function calculateLocationScore(loc1: any, loc2: any): number {
  const distance = calculateDistance(loc1, loc2);
  
  // Exponential decay: closer = higher score
  return Math.exp(-distance / 50); // 50 km decay constant
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(loc1: any, loc2: any): number {
  const R = 6371; // Earth radius in km
  const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
  const dLon = (loc2.lon - loc1.lon) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * (Math.PI / 180)) *
    Math.cos(loc2.lat * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate age compatibility
 */
function calculateAgeCompatibility(user1: DatingProfile, user2: DatingProfile): number {
  const inRange1 = user2.age >= user1.preferences.ageRange[0] && user2.age <= user1.preferences.ageRange[1];
  const inRange2 = user1.age >= user2.preferences.ageRange[0] && user1.age <= user2.preferences.ageRange[1];
  
  if (inRange1 && inRange2) return 1.0;
  if (inRange1 || inRange2) return 0.5;
  return 0.0;
}

/**
 * Calculate activity pattern match
 */
async function calculateActivityPatternMatch(userId1: string, userId2: string): Promise<number> {
  // TODO: Fetch from Cassandra user activity history
  // Analyze online times, engagement patterns
  
  return 0.75; // Mock value
}

/**
 * Calculate AI personality match
 */
async function calculateAIPersonalityMatch(userId1: string, userId2: string): Promise<number> {
  // TODO: Use ML model (TensorFlow Serving)
  // Analyze chat patterns, video preferences, engagement style
  
  return 0.82; // Mock value
}

/**
 * Check for mutual match
 */
async function checkMutualMatch(userId: string, targetUserId: string): Promise<boolean> {
  // TODO: Query database for reciprocal like
  // For now, return random
  
  return Math.random() > 0.7; // 30% match rate
}

/**
 * Unlock match (payment)
 */
export async function unlockMatch(
  userId: string,
  matchId: string,
  paymentType: 'regular' | 'instant'
): Promise<{ success: boolean; chatEnabled: boolean }> {
  console.log(`💳 User ${userId} unlocking match ${matchId} (${paymentType})`);
  
  // Regular: Both users pay 50 credits + 25 coins each
  // Instant: One user pays 150 credits + 100 coins to unlock for both
  
  const prices = {
    regular: { credits: 50, coins: 25 },
    instant: { credits: 150, coins: 100 },
  };
  
  // TODO: Deduct credits/coins from user wallet
  // TODO: Enable chat between users
  
  return {
    success: true,
    chatEnabled: true,
  };
}
