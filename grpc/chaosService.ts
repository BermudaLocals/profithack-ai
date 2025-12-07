/**
 * PROFITHACK AI - Chaos Engineering Service (Node.js gRPC)
 * Resilience testing with latency & failure injection
 * Port: 50056 | Production-ready chaos testing
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(process.cwd(), 'grpc_services/chaos_service/chaos.proto');

// Load the protobuf
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const chaosProto = grpc.loadPackageDefinition(packageDefinition).chaos as any;

/**
 * InjectLatency RPC Implementation
 * Simulates network latency in target services
 */
function injectLatency(call: any, callback: any) {
  const { service_name, duration_ms, probability } = call.request;
  
  console.log(`⏱️  Latency Injection: ${service_name} | ${duration_ms}ms | ${(probability * 100).toFixed(0)}% chance`);
  
  // --- 1. Probability Check ---
  const shouldInject = Math.random() < probability;
  
  if (shouldInject) {
    console.log(`🔴 CHAOS: Injecting ${duration_ms}ms latency into ${service_name}`);
    
    // In production, this would:
    // - Communicate with service mesh (Istio/Linkerd)
    // - Modify network traffic rules
    // - Add artificial delays to service responses
    
    callback(null, {
      success: true,
      message: `Simulated injection of ${duration_ms}ms latency into ${service_name} with ${(probability * 100).toFixed(0)}% probability.`,
    });
  } else {
    console.log(`⚪ Latency injection skipped for ${service_name} (below probability threshold)`);
    
    callback(null, {
      success: true,
      message: `Latency injection request received for ${service_name}, but not executed (below probability threshold).`,
    });
  }
}

/**
 * InjectFailure RPC Implementation
 * Simulates service failures and errors
 */
function injectFailure(call: any, callback: any) {
  const { service_name, error_message, probability } = call.request;
  
  console.log(`💥 Failure Injection: ${service_name} | "${error_message}" | ${(probability * 100).toFixed(0)}% chance`);
  
  // --- 1. Probability Check ---
  const shouldInject = Math.random() < probability;
  
  if (shouldInject) {
    console.log(`🔴 CHAOS: Injecting failure into ${service_name} - "${error_message}"`);
    
    // In production, this would:
    // - Force specific error responses
    // - Simulate database failures
    // - Trigger circuit breakers
    // - Test graceful degradation
    
    callback(null, {
      success: true,
      message: `Simulated injection of failure into ${service_name} with message: "${error_message}"`,
    });
  } else {
    console.log(`⚪ Failure injection skipped for ${service_name} (below probability threshold)`);
    
    callback(null, {
      success: true,
      message: `Failure injection request received for ${service_name}, but not executed (below probability threshold).`,
    });
  }
}

/**
 * Start the Chaos Engineering gRPC Server
 */
export function startChaosService(port: number = 50056) {
  const server = new grpc.Server();
  
  server.addService(chaosProto.ChaosService.service, {
    InjectLatency: injectLatency,
    InjectFailure: injectFailure,
  });
  
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error('❌ Failed to start Chaos Service:', err);
        return;
      }
      
      console.log('🔬 PROFITHACK AI - Chaos Engineering Service (gRPC)');
      console.log(`   Port: ${boundPort}`);
      console.log(`   Features: Latency injection, failure simulation`);
      console.log(`   Purpose: Resilience testing, production chaos`);
    }
  );
  
  return server;
}

// Start if run directly (ES module check)
if (import.meta.url === `file://${process.argv[1]}`) {
  startChaosService();
}
