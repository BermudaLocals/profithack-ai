/**
 * PROFITHACK AI - Payment Gateway Final Validation
 * Tests all 7+ payment processors with real $0.01 transactions
 */

import { PaymentGateway } from '../server/services/paymentGateway';

interface PaymentTestResult {
  processor: string;
  status: 'SUCCESS' | 'FAILURE' | 'SKIPPED';
  transactionId?: string;
  amount: number;
  currency: string;
  latency_ms: number;
  error?: string;
}

async function testPaymentProcessor(
  gateway: PaymentGateway,
  processor: string,
  amount: number = 0.01
): Promise<PaymentTestResult> {
  const startTime = Date.now();
  
  try {
    console.log(`\n🧪 Testing ${processor.toUpperCase()}...`);
    
    const result = await gateway.processPayment({
      processor,
      amount,
      currency: 'USD',
      userId: 'test-user',
      description: 'Production validation test charge',
      metadata: {
        test: true,
        environment: 'production-validation',
        timestamp: new Date().toISOString(),
      },
    });
    
    const latency = Date.now() - startTime;
    
    if (result.success) {
      console.log(`✅ ${processor.toUpperCase()}: SUCCESS (${latency}ms)`);
      console.log(`   Transaction ID: ${result.transactionId}`);
      console.log(`   Amount: $${amount} USD`);
      
      return {
        processor,
        status: 'SUCCESS',
        transactionId: result.transactionId,
        amount,
        currency: 'USD',
        latency_ms: latency,
      };
    } else {
      throw new Error(result.error || 'Payment failed');
    }
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.log(`❌ ${processor.toUpperCase()}: FAILURE (${latency}ms)`);
    console.log(`   Error: ${error.message}`);
    
    return {
      processor,
      status: 'FAILURE',
      amount,
      currency: 'USD',
      latency_ms: latency,
      error: error.message,
    };
  }
}

async function runPaymentGatewayTests() {
  console.log('=' .repeat(80));
  console.log('🚀 PROFITHACK AI - PAYMENT GATEWAY VALIDATION');
  console.log('='  .repeat(80));
  console.log('');
  console.log('Testing all payment processors with $0.01 test charges');
  console.log('Target: All 7+ processors functional before launch');
  console.log('');
  
  const gateway = new PaymentGateway();
  const testAmount = 0.01;
  const results: PaymentTestResult[] = [];
  
  // ============================================================================
  // Test All Payment Processors
  // ============================================================================
  
  const processors = [
    'stripe',
    'paypal',
    'square',
    'payoneer',
    'payeer',
    'nowpayments',  // Crypto
    'ton',          // Telegram Open Network
  ];
  
  for (const processor of processors) {
    const result = await testPaymentProcessor(gateway, processor, testAmount);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // ============================================================================
  // Results Summary
  // ============================================================================
  
  console.log('');
  console.log('=' .repeat(80));
  console.log('📊 PAYMENT GATEWAY TEST RESULTS');
  console.log('=' .repeat(80));
  console.log('');
  
  const successful = results.filter(r => r.status === 'SUCCESS');
  const failed = results.filter(r => r.status === 'FAILURE');
  const skipped = results.filter(r => r.status === 'SKIPPED');
  
  console.log('Summary:');
  console.log(`  ✅ Successful: ${successful.length}/${results.length}`);
  console.log(`  ❌ Failed: ${failed.length}/${results.length}`);
  console.log(`  ⏭️  Skipped: ${skipped.length}/${results.length}`);
  console.log('');
  
  // Detailed results table
  console.log('Detailed Results:');
  console.log('');
  console.log('| Processor      | Status    | Latency  | Transaction ID          |');
  console.log('|----------------|-----------|----------|-------------------------|');
  
  for (const result of results) {
    const status = result.status === 'SUCCESS' ? '✅ OK' : 
                   result.status === 'FAILURE' ? '❌ FAIL' : '⏭️  SKIP';
    const latency = `${result.latency_ms}ms`;
    const txId = result.transactionId || (result.error || 'N/A').substring(0, 20);
    
    console.log(`| ${result.processor.padEnd(14)} | ${status.padEnd(9)} | ${latency.padEnd(8)} | ${txId.padEnd(23)} |`);
  }
  
  console.log('');
  
  // ============================================================================
  // Performance Metrics
  // ============================================================================
  
  if (successful.length > 0) {
    const avgLatency = successful.reduce((sum, r) => sum + r.latency_ms, 0) / successful.length;
    const minLatency = Math.min(...successful.map(r => r.latency_ms));
    const maxLatency = Math.max(...successful.map(r => r.latency_ms));
    
    console.log('Performance Metrics:');
    console.log(`  Average Latency: ${avgLatency.toFixed(0)}ms`);
    console.log(`  Fastest: ${minLatency}ms`);
    console.log(`  Slowest: ${maxLatency}ms`);
    console.log('');
  }
  
  // ============================================================================
  // Failed Processors Details
  // ============================================================================
  
  if (failed.length > 0) {
    console.log('⚠️  Failed Processors:');
    console.log('');
    for (const result of failed) {
      console.log(`  ${result.processor}:`);
      console.log(`    Error: ${result.error}`);
      console.log('');
    }
  }
  
  // ============================================================================
  // Go/No-Go Decision
  // ============================================================================
  
  const successRate = (successful.length / results.length) * 100;
  
  console.log('=' .repeat(80));
  console.log('🎯 LAUNCH READINESS ASSESSMENT');
  console.log('=' .repeat(80));
  console.log('');
  
  if (successRate >= 85) {
    console.log('✅ GO FOR LAUNCH');
    console.log(`   Success Rate: ${successRate.toFixed(0)}% (Target: ≥85%)`);
    console.log('   Payment infrastructure is production-ready');
  } else if (successRate >= 70) {
    console.log('⚠️  CONDITIONAL GO');
    console.log(`   Success Rate: ${successRate.toFixed(0)}% (Target: ≥85%)`);
    console.log('   Payment infrastructure functional but has issues');
    console.log('   Recommendation: Fix failed processors before full launch');
  } else {
    console.log('❌ NO-GO');
    console.log(`   Success Rate: ${successRate.toFixed(0)}% (Target: ≥85%)`);
    console.log('   Payment infrastructure not ready for production');
    console.log('   CRITICAL: Fix payment processors before launch');
  }
  
  console.log('');
  console.log('=' .repeat(80));
  
  // ============================================================================
  // Return Results for Automated Processing
  // ============================================================================
  
  return {
    totalProcessors: results.length,
    successful: successful.length,
    failed: failed.length,
    skipped: skipped.length,
    successRate,
    goForLaunch: successRate >= 85,
    results,
  };
}

// Execute if run directly
if (require.main === module) {
  runPaymentGatewayTests()
    .then((summary) => {
      process.exit(summary.goForLaunch ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Payment gateway test failed:', error);
      process.exit(1);
    });
}

export { runPaymentGatewayTests, PaymentTestResult };
