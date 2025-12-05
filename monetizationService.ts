/**
 * PROFITHACK AI - Monetization Service (Node.js gRPC)
 * Virtual gifts & subscriptions with high-speed transactions
 * Port: 50054 | Sub-10ms transactions
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(process.cwd(), 'grpc_services/monetization_service/monetization.proto');

// Load the protobuf
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const monetizationProto = grpc.loadPackageDefinition(packageDefinition).monetization as any;

/**
 * SendGift RPC Implementation
 * Handles virtual gift transactions with coin deduction
 */
function sendGift(call: any, callback: any) {
  const { sender_user_id, recipient_user_id, gift_id, quantity } = call.request;
  
  console.log(`💝 Gift: ${sender_user_id} → ${recipient_user_id} | ${gift_id} x${quantity}`);
  
  const startTime = Date.now();
  
  // --- 1. Transaction Logic (Mock) ---
  // In production:
  // - Deduct coins from sender's account (ledger service)
  // - Credit recipient's account
  // - Record transaction in database
  // - Emit analytics event to Kafka
  
  const giftCost = 10; // 10 coins per gift
  const totalCost = quantity * giftCost;
  const remainingCoins = 1000 - totalCost; // Mock balance
  const transactionId = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Simulate high-speed transaction (sub-10ms)
  setTimeout(() => {
    const latency = Date.now() - startTime;
    console.log(`✅ Gift Sent: ${transactionId} | ${latency}ms | Remaining: ${remainingCoins} coins`);
    
    callback(null, {
      success: true,
      remaining_coins: remainingCoins,
      transaction_id: transactionId,
    });
  }, 2);
}

/**
 * Subscribe RPC Implementation
 * Handles creator subscription with payment processing
 */
function subscribe(call: any, callback: any) {
  const { subscriber_user_id, creator_user_id, subscription_tier_id } = call.request;
  
  console.log(`💎 Subscription: ${subscriber_user_id} → ${creator_user_id} | Tier: ${subscription_tier_id}`);
  
  const startTime = Date.now();
  
  // --- 2. Subscription Logic (Mock) ---
  // In production:
  // - Process payment via Stripe/PayPal
  // - Update subscription status in database
  // - Grant access to premium content
  // - Send confirmation email
  // - Emit analytics event
  
  const tiers: Record<string, string> = {
    'tier_1': 'Premium Access - $4.99/mo',
    'tier_2': 'VIP Access - $9.99/mo',
    'tier_3': 'Ultimate Access - $19.99/mo',
  };
  
  const tierName = tiers[subscription_tier_id] || 'Premium Access';
  const transactionId = `SUB-TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Simulate payment processing (sub-20ms)
  setTimeout(() => {
    const latency = Date.now() - startTime;
    console.log(`✅ Subscription Activated: ${transactionId} | ${latency}ms | ${tierName}`);
    
    callback(null, {
      success: true,
      transaction_id: transactionId,
      tier_name: tierName,
    });
  }, 10);
}

/**
 * Start the Monetization gRPC Server
 */
export function startMonetizationService(port: number = 50054) {
  const server = new grpc.Server();
  
  server.addService(monetizationProto.MonetizationService.service, {
    SendGift: sendGift,
    Subscribe: subscribe,
  });
  
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error('❌ Failed to start Monetization Service:', err);
        return;
      }
      
      console.log('💰 PROFITHACK AI - Monetization Service (gRPC)');
      console.log(`   Port: ${boundPort}`);
      console.log(`   Performance: Sub-10ms transactions`);
      console.log(`   Features: Virtual gifts, subscriptions, payments`);
    }
  );
  
  return server;
}

// Start if run directly (ES module check)
if (import.meta.url === `file://${process.argv[1]}`) {
  startMonetizationService();
}
