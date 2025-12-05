/**
 * PROFITHACK AI - Golang Feed Service gRPC Client
 * 
 * High-performance video feed service client
 * Connects to Golang microservice for ultra-fast recommendations
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// Load proto file
const PROTO_PATH = path.join(process.cwd(), 'feed-service/feed.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const feedProto = grpc.loadPackageDefinition(packageDefinition).feed as any;

// gRPC client instance
let client: any = null;

/**
 * Initialize gRPC client connection
 */
export function initFeedServiceClient() {
  const FEED_SERVICE_URL = process.env.FEED_SERVICE_URL || 'localhost:50051';
  
  try {
    client = new feedProto.FeedService(
      FEED_SERVICE_URL,
      grpc.credentials.createInsecure()
    );
    console.log('✅ gRPC Feed Service client connected:', FEED_SERVICE_URL);
  } catch (error) {
    console.error('❌ Failed to connect to Feed Service:', error);
    console.log('⚠️  Falling back to PostgreSQL-based feed (slower)');
  }
}

/**
 * Get personalized video feed from Golang service
 */
export async function getPersonalizedFeed(
  userId: string,
  limit: number = 20,
  offset: number = 0,
  category: string = 'reels'
): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!client) {
      console.log('⚠️  gRPC client not available, using fallback');
      resolve({ videos: [], has_more: false, next_cursor: '' });
      return;
    }

    const request = {
      user_id: userId,
      limit,
      offset,
      category,
    };

    console.log('🔄 Calling Golang Feed Service via gRPC:', request);

    client.GetFeed(request, (error: any, response: any) => {
      if (error) {
        console.error('❌ gRPC GetFeed error:', error);
        reject(error);
        return;
      }

      console.log(`✅ gRPC returned ${response.videos?.length || 0} videos`);
      resolve(response);
    });
  });
}

/**
 * Get trending videos from Golang service
 */
export async function getTrendingFeed(
  limit: number = 20,
  category: string = 'reels',
  timeRange: string = '24h'
): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!client) {
      resolve({ videos: [], has_more: false, next_cursor: '' });
      return;
    }

    const request = {
      limit,
      category,
      time_range: timeRange,
    };

    client.GetTrendingFeed(request, (error: any, response: any) => {
      if (error) {
        console.error('❌ gRPC GetTrendingFeed error:', error);
        reject(error);
        return;
      }

      console.log(`✅ gRPC returned ${response.videos?.length || 0} trending videos`);
      resolve(response);
    });
  });
}

/**
 * Record user interaction (like, view, swipe) to Golang service
 * This feeds the ML recommendation engine
 */
export async function recordInteraction(
  userId: string,
  videoId: string,
  interactionType: 'view' | 'like' | 'share' | 'comment' | 'swipe',
  watchDurationMs: number = 0
): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!client) {
      resolve({ success: false, message: 'gRPC client not available' });
      return;
    }

    const request = {
      user_id: userId,
      video_id: videoId,
      interaction_type: interactionType,
      watch_duration_ms: watchDurationMs,
    };

    client.RecordInteraction(request, (error: any, response: any) => {
      if (error) {
        console.error('❌ gRPC RecordInteraction error:', error);
        reject(error);
        return;
      }

      resolve(response);
    });
  });
}

/**
 * Health check for gRPC connection
 */
export function isFeedServiceHealthy(): boolean {
  return client !== null;
}
