/**
 * PROFITHACK AI - Content Acquisition Service (Node.js gRPC)
 * Automated content seeding pipeline: Scrape → Analyze → Generate → Seed
 * Port: 50059 | Cold start automation
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(process.cwd(), 'grpc_services/acquisition_service/acquisition.proto');

// Load the protobuf
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const acquisitionProto = grpc.loadPackageDefinition(packageDefinition).acquisition as any;

/**
 * ScrapeAndGenerate RPC Implementation
 * Full pipeline: Scrape trends → Analyze → Generate videos → Seed to FYP
 */
function scrapeAndGenerate(call: any, callback: any) {
  const { founder_user_id, count, trend_topic } = call.request;
  
  console.log(`🌐 Content Acquisition Request: ${count} videos`);
  console.log(`   Topic: "${trend_topic}" | Founder: ${founder_user_id}`);
  
  const startTime = Date.now();
  
  // --- 1. Scrape & Analyze (Mock) ---
  // In production:
  // - Scrape TikTok/Instagram trending hashtags
  // - NLP analysis for high-engagement prompts
  // - Keyword extraction for SEO
  
  const prompts = generatePrompts(trend_topic, count);
  
  // --- 2. Trigger Sora AI Generation (Mock) ---
  // In production:
  // - Call Sora Service (port 50055)
  // - Queue video generation jobs
  // - Wait for completion
  
  const videosSeeded = prompts.length;
  
  // --- 3. Seed to FYP (Mock) ---
  // In production:
  // - Insert videos into database
  // - Tag as "trending"
  // - Boost initial visibility
  
  setTimeout(() => {
    const latency = Date.now() - startTime;
    const jobId = `ACQ-JOB-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    console.log(`✅ Seeded ${videosSeeded} videos for topic: "${trend_topic}" | ${latency}ms`);
    console.log(`   Job ID: ${jobId} | Prompts: ${prompts.slice(0, 2).join(', ')}...`);
    
    callback(null, {
      job_id: jobId,
      status: 'SEEDED',
      videos_seeded: videosSeeded,
    });
  }, count * 20); // 20ms per video simulation
}

/**
 * Generate high-quality video prompts from trending topics
 */
function generatePrompts(topic: string, count: number): string[] {
  const basePrompts = [
    `A cinematic shot of ${topic} in a futuristic city`,
    `A hyper-realistic animation of ${topic} solving a complex problem`,
    `A short, viral clip about ${topic} going viral`,
    `${topic} explained in 60 seconds with stunning visuals`,
    `The ultimate ${topic} tutorial that everyone needs`,
  ];
  
  const prompts: string[] = [];
  for (let i = 0; i < count; i++) {
    const basePrompt = basePrompts[i % basePrompts.length];
    prompts.push(`${basePrompt} - variant ${i + 1}`);
  }
  
  return prompts;
}

/**
 * Start the Content Acquisition gRPC Server
 */
export function startAcquisitionService(port: number = 50059) {
  const server = new grpc.Server();
  
  server.addService(acquisitionProto.AcquisitionService.service, {
    ScrapeAndGenerate: scrapeAndGenerate,
  });
  
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error('❌ Failed to start Acquisition Service:', err);
        return;
      }
      
      console.log('🌐 PROFITHACK AI - Content Acquisition Service (gRPC)');
      console.log(`   Port: ${boundPort}`);
      console.log(`   Pipeline: Scrape → Analyze → Generate → Seed`);
      console.log(`   Features: Trend scraping, AI video gen, FYP seeding`);
    }
  );
  
  return server;
}

// Start if run directly (ES module check)
if (import.meta.url === `file://${process.argv[1]}`) {
  startAcquisitionService();
}
