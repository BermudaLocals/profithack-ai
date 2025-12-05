/**
 * PROFITHACK AI - Kafka Event Stream Producer
 * 
 * Real-time data pipeline for:
 * - User activity events (views, likes, swipes)
 * - Video upload events
 * - Payment transactions
 * - Live battle events
 * 
 * WHY KAFKA?
 * - 2M messages/second throughput
 * - Decouples services (microservices architecture)
 * - Event sourcing & replay
 * - Real-time analytics with Flink
 */

import { Kafka, Producer, logLevel } from 'kafkajs';

let producer: Producer | null = null;
let kafka: Kafka | null = null;

/**
 * Initialize Kafka producer
 */
export async function initKafkaProducer() {
  try {
    const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
    const clientId = process.env.KAFKA_CLIENT_ID || 'profithack-api';

    kafka = new Kafka({
      clientId,
      brokers,
      logLevel: logLevel.ERROR,
    });

    producer = kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000,
    });

    await producer.connect();
    console.log('✅ Kafka producer connected:', brokers.join(', '));
    
  } catch (error) {
    console.error('❌ Kafka connection failed:', error);
    console.log('⚠️  Running without Kafka - events will not be streamed');
    producer = null;
  }
}

/**
 * Produce user activity event to Kafka
 * 
 * Topic: user_activity
 * Consumers: Flink (real-time analytics), ML model training
 */
export async function produceUserActivityEvent(event: {
  userId: string;
  videoId: string;
  action: 'view' | 'like' | 'share' | 'comment' | 'swipe_up' | 'swipe_down';
  watchDurationMs?: number;
  deviceType?: string;
  timestamp?: Date;
}): Promise<boolean> {
  if (!producer) {
    console.log('⚠️  Kafka not available - event not streamed');
    return false;
  }

  try {
    const message = {
      key: event.userId, // Partition by userId for ordering
      value: JSON.stringify({
        ...event,
        timestamp: event.timestamp || new Date(),
        source: 'api-server',
      }),
      headers: {
        'event-type': 'user_activity',
        'version': '1.0',
      },
    };

    await producer.send({
      topic: 'user_activity',
      messages: [message],
    });

    console.log(`✅ Kafka: Streamed ${event.action} event for user ${event.userId}`);
    return true;
  } catch (error) {
    console.error('❌ Kafka produce failed:', error);
    return false;
  }
}

/**
 * Produce video upload event to Kafka
 */
export async function produceVideoUploadEvent(event: {
  videoId: string;
  userId: string;
  title: string;
  category: string;
  videoUrl: string;
  timestamp?: Date;
}): Promise<boolean> {
  if (!producer) return false;

  try {
    await producer.send({
      topic: 'video_uploads',
      messages: [{
        key: event.videoId,
        value: JSON.stringify({
          ...event,
          timestamp: event.timestamp || new Date(),
        }),
      }],
    });

    console.log(`✅ Kafka: Streamed video upload event for ${event.videoId}`);
    return true;
  } catch (error) {
    console.error('❌ Kafka video upload event failed:', error);
    return false;
  }
}

/**
 * Produce payment transaction event to Kafka
 */
export async function producePaymentEvent(event: {
  transactionId: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'purchase' | 'withdrawal' | 'tip' | 'subscription';
  status: 'pending' | 'completed' | 'failed';
  timestamp?: Date;
}): Promise<boolean> {
  if (!producer) return false;

  try {
    await producer.send({
      topic: 'payment_transactions',
      messages: [{
        key: event.transactionId,
        value: JSON.stringify({
          ...event,
          timestamp: event.timestamp || new Date(),
        }),
      }],
    });

    console.log(`✅ Kafka: Streamed payment event ${event.transactionId}`);
    return true;
  } catch (error) {
    console.error('❌ Kafka payment event failed:', error);
    return false;
  }
}

/**
 * Produce live battle event to Kafka
 */
export async function produceLiveBattleEvent(event: {
  battleId: string;
  eventType: 'start' | 'gift' | 'end';
  participants?: string[];
  giftData?: any;
  timestamp?: Date;
}): Promise<boolean> {
  if (!producer) return false;

  try {
    await producer.send({
      topic: 'live_battles',
      messages: [{
        key: event.battleId,
        value: JSON.stringify({
          ...event,
          timestamp: event.timestamp || new Date(),
        }),
      }],
    });

    console.log(`✅ Kafka: Streamed battle event for ${event.battleId}`);
    return true;
  } catch (error) {
    console.error('❌ Kafka battle event failed:', error);
    return false;
  }
}

/**
 * Batch produce multiple events (high throughput)
 */
export async function produceBatchEvents(
  topic: string,
  events: Array<{ key: string; value: any }>
): Promise<boolean> {
  if (!producer) return false;

  try {
    const messages = events.map(event => ({
      key: event.key,
      value: JSON.stringify(event.value),
    }));

    await producer.send({
      topic,
      messages,
    });

    console.log(`✅ Kafka: Streamed ${events.length} events to ${topic}`);
    return true;
  } catch (error) {
    console.error('❌ Kafka batch produce failed:', error);
    return false;
  }
}

/**
 * Health check
 */
export function isKafkaHealthy(): boolean {
  return producer !== null;
}

/**
 * Disconnect producer
 */
export async function disconnectKafkaProducer() {
  if (producer) {
    await producer.disconnect();
    console.log('✅ Kafka producer disconnected');
  }
}
