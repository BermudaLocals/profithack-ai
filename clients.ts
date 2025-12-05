/**
 * PROFITHACK AI - gRPC Clients
 * Connects Express backend to gRPC microservices
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// --- Feed Service Client ---
const FEED_PROTO_PATH = path.join(process.cwd(), 'grpc_services/feed_service/feed.proto');
const feedPackageDef = protoLoader.loadSync(FEED_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const feedProto = grpc.loadPackageDefinition(feedPackageDef).feed as any;

export const feedClient = new feedProto.FeedService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// --- XAI Service Client ---
const XAI_PROTO_PATH = path.join(process.cwd(), 'grpc_services/xai_service/xai.proto');
const xaiPackageDef = protoLoader.loadSync(XAI_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const xaiProto = grpc.loadPackageDefinition(xaiPackageDef).xai as any;

export const xaiClient = new xaiProto.XAIService(
  'localhost:50052',
  grpc.credentials.createInsecure()
);

// --- Dating Service Client ---
const DATING_PROTO_PATH = path.join(process.cwd(), 'grpc_services/dating_service/dating.proto');
const datingPackageDef = protoLoader.loadSync(DATING_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const datingProto = grpc.loadPackageDefinition(datingPackageDef).dating as any;

export const datingClient = new datingProto.DatingService(
  'localhost:50053',
  grpc.credentials.createInsecure()
);

/**
 * Helper: Call Feed Service
 */
export function getFeedFromGRPC(userId: string, pageSize: number = 10, lastVideoId?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    feedClient.GetFeed(
      { user_id: userId, page_size: pageSize, last_video_id: lastVideoId || '' },
      (err: any, response: any) => {
        if (err) {
          console.error('❌ Feed gRPC Error:', err);
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Helper: Call XAI Service
 */
export function getXAIRecommendations(userId: string, count: number = 10, excludeIds: string[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    xaiClient.GetRecommendation(
      { user_id: userId, count, exclude_video_ids: excludeIds },
      (err: any, response: any) => {
        if (err) {
          console.error('❌ XAI gRPC Error:', err);
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Helper: Call Dating Service - Get Matches
 */
export function getDatingMatches(userId: string, count: number = 10): Promise<any> {
  return new Promise((resolve, reject) => {
    datingClient.GetMatches(
      { user_id: userId, count },
      (err: any, response: any) => {
        if (err) {
          console.error('❌ Dating gRPC Error:', err);
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Helper: Call Dating Service - Record Swipe
 */
export function recordDatingSwipe(userId: string, targetUserId: string, direction: 'left' | 'right'): Promise<any> {
  return new Promise((resolve, reject) => {
    datingClient.RecordSwipe(
      { 
        user_id: userId, 
        target_user_id: targetUserId,
        direction: direction === 'right' ? 1 : 0
      },
      (err: any, response: any) => {
        if (err) {
          console.error('❌ Dating Swipe gRPC Error:', err);
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });
}

// --- Monetization Service Client ---
const MONETIZATION_PROTO_PATH = path.join(process.cwd(), 'grpc_services/monetization_service/monetization.proto');
const monetizationPackageDef = protoLoader.loadSync(MONETIZATION_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const monetizationProto = grpc.loadPackageDefinition(monetizationPackageDef).monetization as any;

export const monetizationClient = new monetizationProto.MonetizationService(
  'localhost:50054',
  grpc.credentials.createInsecure()
);

// --- Sora 2 Service Client ---
const SORA_PROTO_PATH = path.join(process.cwd(), 'grpc_services/sora_service/sora.proto');
const soraPackageDef = protoLoader.loadSync(SORA_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const soraProto = grpc.loadPackageDefinition(soraPackageDef).sora as any;

export const soraClient = new soraProto.SoraService(
  'localhost:50055',
  grpc.credentials.createInsecure()
);

// --- Chaos Service Client ---
const CHAOS_PROTO_PATH = path.join(process.cwd(), 'grpc_services/chaos_service/chaos.proto');
const chaosPackageDef = protoLoader.loadSync(CHAOS_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const chaosProto = grpc.loadPackageDefinition(chaosPackageDef).chaos as any;

export const chaosClient = new chaosProto.ChaosService(
  'localhost:50056',
  grpc.credentials.createInsecure()
);

/**
 * Helper: Send Virtual Gift
 */
export function sendGiftGRPC(senderUserId: string, recipientUserId: string, giftId: string, quantity: number = 1): Promise<any> {
  return new Promise((resolve, reject) => {
    monetizationClient.SendGift(
      { sender_user_id: senderUserId, recipient_user_id: recipientUserId, gift_id: giftId, quantity },
      (err: any, response: any) => {
        if (err) {
          console.error('❌ Monetization gRPC Error:', err);
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Helper: Subscribe to Creator
 */
export function subscribeToCreatorGRPC(subscriberUserId: string, creatorUserId: string, tierId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    monetizationClient.Subscribe(
      { subscriber_user_id: subscriberUserId, creator_user_id: creatorUserId, subscription_tier_id: tierId },
      (err: any, response: any) => {
        if (err) {
          console.error('❌ Monetization gRPC Error:', err);
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Helper: Generate AI Video with Sora 2
 */
export function generateVideoGRPC(userId: string, prompt: string, durationSeconds: number = 5, style: string = 'cinematic'): Promise<any> {
  return new Promise((resolve, reject) => {
    soraClient.GenerateVideo(
      { user_id: userId, prompt, duration_seconds: durationSeconds, style },
      (err: any, response: any) => {
        if (err) {
          console.error('❌ Sora gRPC Error:', err);
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Helper: Inject Latency (Chaos Engineering)
 */
export function injectLatencyGRPC(serviceName: string, durationMs: number, probability: number = 0.5): Promise<any> {
  return new Promise((resolve, reject) => {
    chaosClient.InjectLatency(
      { service_name: serviceName, duration_ms: durationMs, probability },
      (err: any, response: any) => {
        if (err) {
          console.error('❌ Chaos gRPC Error:', err);
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Helper: Inject Failure (Chaos Engineering)
 */
export function injectFailureGRPC(serviceName: string, errorMessage: string, probability: number = 0.5): Promise<any> {
  return new Promise((resolve, reject) => {
    chaosClient.InjectFailure(
      { service_name: serviceName, error_message: errorMessage, probability },
      (err: any, response: any) => {
        if (err) {
          console.error('❌ Chaos gRPC Error:', err);
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });
}

// --- Moderation Service Client ---
const MODERATION_PROTO_PATH = path.join(process.cwd(), 'grpc_services/moderation_service/moderation.proto');
const moderationPackageDef = protoLoader.loadSync(MODERATION_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const moderationProto = grpc.loadPackageDefinition(moderationPackageDef).moderation as any;

export const moderationClient = new moderationProto.ModerationService(
  'localhost:50057',
  grpc.credentials.createInsecure()
);

// --- Security Service Client ---
const SECURITY_PROTO_PATH = path.join(process.cwd(), 'grpc_services/security_service/security.proto');
const securityPackageDef = protoLoader.loadSync(SECURITY_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const securityProto = grpc.loadPackageDefinition(securityPackageDef).security as any;

export const securityClient = new securityProto.SecurityService(
  'localhost:50058',
  grpc.credentials.createInsecure()
);

/**
 * Helper: Analyze Video (AI Moderation)
 */
export function analyzeVideoGRPC(videoId: string, videoUrl: string, caption: string, userId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    moderationClient.AnalyzeVideo(
      { video_id: videoId, video_url: videoUrl, caption, user_id: userId },
      (err: any, response: any) => {
        if (err) {
          console.error('❌ Moderation gRPC Error:', err);
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Helper: Issue mTLS Certificate
 */
export function issueCertificateGRPC(serviceName: string, commonName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    securityClient.IssueMTLSCertificate(
      { service_name: serviceName, common_name: commonName },
      (err: any, response: any) => {
        if (err) {
          console.error('❌ Security gRPC Error:', err);
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Helper: Revoke mTLS Certificate
 */
export function revokeCertificateGRPC(serviceName: string, commonName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    securityClient.RevokeMTLSCertificate(
      { service_name: serviceName, common_name: commonName },
      (err: any, response: any) => {
        if (err) {
          console.error('❌ Security gRPC Error:', err);
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });
}

console.log('✅ gRPC Clients initialized');
console.log('   Feed: localhost:50051');
console.log('   XAI: localhost:50052');
console.log('   Dating: localhost:50053');
console.log('   Monetization: localhost:50054');
console.log('   Sora 2: localhost:50055');
console.log('   Chaos: localhost:50056');
console.log('   Moderation: localhost:50057');
console.log('   Security: localhost:50058');
