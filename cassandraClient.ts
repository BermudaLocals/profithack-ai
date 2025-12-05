/**
 * PROFITHACK AI - Cassandra NoSQL Database Client
 * 
 * High-performance NoSQL database for:
 * - User activity history (swipes, views, likes)
 * - Time-series analytics data
 * - Video engagement metrics
 * 
 * WHY CASSANDRA?
 * - Write-optimized (1M writes/sec vs PostgreSQL 10K writes/sec)
 * - Horizontal scaling (add nodes, get more capacity)
 * - No single point of failure
 * - Perfect for time-series data
 */

import cassandra from 'cassandra-driver';

let client: cassandra.Client | null = null;

/**
 * Initialize Cassandra connection
 */
export async function initCassandraClient() {
  try {
    const contactPoints = process.env.CASSANDRA_CONTACT_POINTS?.split(',') || ['127.0.0.1'];
    const datacenter = process.env.CASSANDRA_DATACENTER || 'datacenter1';
    const keyspace = process.env.CASSANDRA_KEYSPACE || 'profithack';

    client = new cassandra.Client({
      contactPoints,
      localDataCenter: datacenter,
      keyspace,
    });

    await client.connect();
    console.log('✅ Cassandra NoSQL connected:', contactPoints.join(', '));
    
    // Create keyspace if not exists (production: do this in migration)
    await createKeyspaceAndTables();
    
  } catch (error) {
    console.error('❌ Cassandra connection failed:', error);
    console.log('⚠️  Running without Cassandra - using PostgreSQL only');
    client = null;
  }
}

/**
 * Create keyspace and tables for user activity tracking
 */
async function createKeyspaceAndTables() {
  if (!client) return;

  try {
    // Create keyspace (production: use NetworkTopologyStrategy)
    await client.execute(`
      CREATE KEYSPACE IF NOT EXISTS profithack
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 3
      }
    `);

    // User swipe history table (time-series)
    await client.execute(`
      CREATE TABLE IF NOT EXISTS profithack.user_swipe_history (
        user_id uuid,
        timestamp timestamp,
        video_id uuid,
        action text,
        watch_duration_ms int,
        device_type text,
        PRIMARY KEY (user_id, timestamp)
      ) WITH CLUSTERING ORDER BY (timestamp DESC)
    `);

    // Video engagement metrics (aggregated)
    await client.execute(`
      CREATE TABLE IF NOT EXISTS profithack.video_engagement_metrics (
        video_id uuid,
        time_bucket timestamp,
        views counter,
        likes counter,
        shares counter,
        comments counter,
        total_watch_time_ms counter,
        PRIMARY KEY (video_id, time_bucket)
      )
    `);

    console.log('✅ Cassandra tables created/verified');
  } catch (error) {
    console.error('❌ Cassandra table creation failed:', error);
  }
}

/**
 * Store user swipe history in Cassandra
 * 
 * Performance: 1M writes/second (vs PostgreSQL: 10K/sec)
 */
export async function storeUserSwipeHistory(
  userId: string,
  videoId: string,
  action: 'swipe_up' | 'swipe_down' | 'view' | 'like' | 'share',
  watchDurationMs: number,
  deviceType: string = 'web'
): Promise<boolean> {
  if (!client) {
    console.log('⚠️  Cassandra not available - skipping swipe history');
    return false;
  }

  try {
    const query = `
      INSERT INTO profithack.user_swipe_history 
      (user_id, timestamp, video_id, action, watch_duration_ms, device_type)
      VALUES (?, toTimestamp(now()), ?, ?, ?, ?)
    `;

    await client.execute(query, [userId, videoId, action, watchDurationMs, deviceType], {
      prepare: true,
    });

    console.log(`✅ Cassandra: Stored swipe history for user ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Cassandra write failed:', error);
    return false;
  }
}

/**
 * Get user's recent swipe history
 * 
 * Use case: ML model training, personalization
 */
export async function getUserSwipeHistory(
  userId: string,
  limit: number = 100
): Promise<any[]> {
  if (!client) {
    return [];
  }

  try {
    const query = `
      SELECT video_id, timestamp, action, watch_duration_ms
      FROM profithack.user_swipe_history
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `;

    const result = await client.execute(query, [userId, limit], { prepare: true });
    return result.rows;
  } catch (error) {
    console.error('❌ Cassandra read failed:', error);
    return [];
  }
}

/**
 * Update video engagement metrics (counters)
 * 
 * Cassandra counters are atomic - perfect for high-concurrency
 */
export async function updateVideoEngagement(
  videoId: string,
  metricType: 'views' | 'likes' | 'shares' | 'comments',
  watchTimeMs: number = 0
): Promise<boolean> {
  if (!client) {
    return false;
  }

  try {
    // Round timestamp to 1-hour buckets for aggregation
    const timeBucket = new Date();
    timeBucket.setMinutes(0, 0, 0);

    const query = `
      UPDATE profithack.video_engagement_metrics
      SET ${metricType} = ${metricType} + 1,
          total_watch_time_ms = total_watch_time_ms + ?
      WHERE video_id = ? AND time_bucket = ?
    `;

    await client.execute(query, [watchTimeMs, videoId, timeBucket], { prepare: true });
    return true;
  } catch (error) {
    console.error('❌ Cassandra counter update failed:', error);
    return false;
  }
}

/**
 * Health check
 */
export function isCassandraHealthy(): boolean {
  return client !== null;
}

/**
 * Close connection
 */
export async function closeCassandraClient() {
  if (client) {
    await client.shutdown();
    console.log('✅ Cassandra connection closed');
  }
}
