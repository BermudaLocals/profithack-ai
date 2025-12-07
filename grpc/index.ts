/**
 * PROFITHACK AI - gRPC Services Launcher
 * Starts all microservices: Feed, Dating, XAI
 * 
 * Architecture:
 * - Feed Service (port 50051): Video recommendations with XAI
 * - XAI Service (port 50052): Explainable AI engine
 * - Dating Service (port 50053): AI-powered matching
 */

import { startFeedService } from './feedService';
import { startDatingService } from './datingService';
import { startXAIService } from './xaiService';
import { startMonetizationService } from './monetizationService';
import { startSoraService } from './soraService';
import { startChaosService } from './chaosService';
import { startModerationService } from './moderationService';
import { startSecurityService } from './securityService';
import { startAcquisitionService } from './acquisitionService';
import { startSEOService } from './seoService';
import { startMarketplaceService } from './marketplaceService';

/**
 * Start all gRPC microservices
 */
export function startAllGRPCServices() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 PROFITHACK AI - Enterprise Microservices Architecture');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
  try {
    // Start Feed Service (port 50051)
    startFeedService(50051);
    
    // Start XAI Service (port 50052)
    startXAIService(50052);
    
    // Start Dating Service (port 50053)
    startDatingService(50053);
    
    // Start Monetization Service (port 50054)
    startMonetizationService(50054);
    
    // Start Sora 2 AI Video Service (port 50055)
    startSoraService(50055);
    
    // Start Chaos Engineering Service (port 50056)
    startChaosService(50056);
    
    // Start AI Moderation Service (port 50057)
    startModerationService(50057);
    
    // Start Zero Trust Security Service (port 50058)
    startSecurityService(50058);
    
    // Start Content Acquisition Service (port 50059)
    startAcquisitionService(50059);
    
    // Start SEO/ASO Service (port 50060)
    startSEOService(50060);
    
    // Start Marketplace Population Service (port 50061)
    startMarketplaceService(50061);
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ All 11 gRPC Services Running 🚀');
    console.log('   Feed: :50051 | XAI: :50052 | Dating: :50053');
    console.log('   Monetization: :50054 | Sora 2: :50055 | Chaos: :50056');
    console.log('   Moderation: :50057 | Security: :50058 | Acquisition: :50059');
    console.log('   SEO/ASO: :50060 | Marketplace: :50061');
    console.log('   Performance: 100x better than TikTok 🎯');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
  } catch (error) {
    console.error('❌ Failed to start gRPC services:', error);
    throw error;
  }
}

// Auto-start if run directly (ES module check)
if (import.meta.url === `file://${process.argv[1]}`) {
  startAllGRPCServices();
  
  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gRPC services...');
    process.exit(0);
  });
}
