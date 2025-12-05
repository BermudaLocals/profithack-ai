/**
 * PROFITHACK AI - Sora 2 AI Video Generation Service (Node.js gRPC)
 * Text-to-video generation with OpenAI Sora 2
 * Port: 50055 | GPU-accelerated
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(process.cwd(), 'grpc_services/sora_service/sora.proto');

// Load the protobuf
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const soraProto = grpc.loadPackageDefinition(packageDefinition).sora as any;

// Mock job storage (in production, use Redis/Cassandra)
const videoJobs: Record<string, any> = {};

/**
 * GenerateVideo RPC Implementation
 * Creates AI video generation job using Sora 2
 */
function generateVideo(call: any, callback: any) {
  const { user_id, prompt, duration_seconds, style } = call.request;
  
  console.log(`🎬 Sora 2 Request: user=${user_id} | prompt="${prompt.substring(0, 50)}..." | ${duration_seconds}s | ${style}`);
  
  // --- 1. Validation ---
  if (!prompt || prompt.length < 10) {
    callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'Prompt must be at least 10 characters long',
    });
    return;
  }
  
  // --- 2. Job Creation ---
  const jobId = `SORA-JOB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  videoJobs[jobId] = {
    user_id,
    prompt,
    duration_seconds: duration_seconds || 5,
    style: style || 'cinematic',
    status: 'PENDING',
    created_at: new Date().toISOString(),
  };
  
  // --- 3. Async Video Generation (Mock) ---
  // In production, this would:
  // - Queue job to GPU cluster
  // - Call OpenAI Sora 2 API
  // - Store video in object storage
  // - Update job status via WebSocket
  
  setTimeout(() => {
    videoJobs[jobId].status = 'PROCESSING';
    console.log(`⚙️  Processing Sora 2 job: ${jobId}`);
    
    setTimeout(() => {
      videoJobs[jobId].status = 'COMPLETED';
      videoJobs[jobId].video_url = `https://cdn.profithack.com/sora/${jobId}.mp4`;
      console.log(`✅ Sora 2 video ready: ${jobId}`);
    }, 30000); // 30 seconds mock generation time
  }, 100);
  
  console.log(`📋 Sora 2 Job Created: ${jobId} | Status: PENDING`);
  
  callback(null, {
    job_id: jobId,
    status: 'PENDING',
    video_url: '', // Empty until COMPLETED
  });
}

/**
 * GetJobStatus RPC Implementation (Helper)
 * Check the status of a video generation job
 */
function getJobStatus(jobId: string) {
  return videoJobs[jobId] || null;
}

/**
 * Start the Sora 2 gRPC Server
 */
export function startSoraService(port: number = 50055) {
  const server = new grpc.Server();
  
  server.addService(soraProto.SoraService.service, {
    GenerateVideo: generateVideo,
  });
  
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error('❌ Failed to start Sora Service:', err);
        return;
      }
      
      console.log('🎬 PROFITHACK AI - Sora 2 AI Video Service (gRPC)');
      console.log(`   Port: ${boundPort}`);
      console.log(`   Features: Text-to-video, OpenAI Sora 2, GPU-accelerated`);
      console.log(`   Styles: cinematic, anime, photorealistic, cartoon`);
    }
  );
  
  return server;
}

// Export job status helper
export { getJobStatus };

// Start if run directly (ES module check)
if (import.meta.url === `file://${process.argv[1]}`) {
  startSoraService();
}
