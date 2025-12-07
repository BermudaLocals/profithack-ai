/**
 * PROFITHACK AI - AI Content Moderation Service (Node.js gRPC)
 * Automated video analysis for policy violations & quality scoring
 * Port: 50057 | AI/ML-powered
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(process.cwd(), 'grpc_services/moderation_service/moderation.proto');

// Load the protobuf
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const moderationProto = grpc.loadPackageDefinition(packageDefinition).moderation as any;

/**
 * AnalyzeVideo RPC Implementation
 * AI-powered content moderation with policy violation detection
 */
function analyzeVideo(call: any, callback: any) {
  const { video_id, video_url, caption, user_id } = call.request;
  
  console.log(`🔍 Analyzing: ${video_id} | User: ${user_id} | Caption: "${caption.substring(0, 30)}..."`);
  
  const startTime = Date.now();
  
  // --- 1. Quality Score Model (Simulated AI) ---
  // In production: Use TensorFlow/PyTorch model for resolution, lighting, composition
  const qualityScore = 0.7 + Math.random() * 0.29; // 0.7 to 0.99
  
  // --- 2. Policy Violation Detection (Simulated AI) ---
  const violations: any[] = [];
  let isSafe = true;
  
  // Check for adult content policy violation
  const adultKeywords = ['exclusive content', 'premium access', 'private show', 'vip members'];
  if (adultKeywords.some(keyword => caption.toLowerCase().includes(keyword)) && 
      caption.toLowerCase().includes('subscribe')) {
    violations.push({
      policy_name: 'Adult Content Policy',
      confidence_score: 0.95,
      severity: 'HIGH',
    });
    isSafe = false;
  }
  
  // Check for spam/low-quality content
  if (caption.length < 5 || qualityScore < 0.5) {
    violations.push({
      policy_name: 'Low Quality/Spam Policy',
      confidence_score: 0.80,
      severity: 'MEDIUM',
    });
  }
  
  // Check for violence/hate speech (simulated)
  const violentKeywords = ['kill', 'attack', 'hate', 'violence'];
  if (violentKeywords.some(word => caption.toLowerCase().includes(word))) {
    violations.push({
      policy_name: 'Violence/Hate Speech Policy',
      confidence_score: 0.88,
      severity: 'HIGH',
    });
    isSafe = false;
  }
  
  // Simulate AI model inference time (20ms)
  setTimeout(() => {
    const latency = Date.now() - startTime;
    
    if (isSafe) {
      console.log(`✅ Video SAFE: ${video_id} | Quality: ${(qualityScore * 100).toFixed(0)}% | ${latency}ms`);
    } else {
      console.log(`⚠️  Video FLAGGED: ${video_id} | ${violations.length} violations | ${latency}ms`);
    }
    
    callback(null, {
      is_safe: isSafe,
      quality_score: qualityScore,
      violations: violations,
    });
  }, 20);
}

/**
 * Start the Moderation gRPC Server
 */
export function startModerationService(port: number = 50057) {
  const server = new grpc.Server();
  
  server.addService(moderationProto.ModerationService.service, {
    AnalyzeVideo: analyzeVideo,
  });
  
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error('❌ Failed to start Moderation Service:', err);
        return;
      }
      
      console.log('🔍 PROFITHACK AI - AI Content Moderation Service (gRPC)');
      console.log(`   Port: ${boundPort}`);
      console.log(`   Features: Policy violation detection, quality scoring`);
      console.log(`   Models: Adult content, spam, violence, hate speech`);
    }
  );
  
  return server;
}

// Start if run directly (ES module check)
if (import.meta.url === `file://${process.argv[1]}`) {
  startModerationService();
}
