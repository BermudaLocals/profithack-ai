// server/config.ts - Conceptual Code for Redis Configuration

// Read the environment variable once
const disableRedisCache = process.env.DISABLE_REDIS_CACHE === 'true';

export const config = {
    // ... other settings like database, ports, etc.

    redis: {
        host: process.env.REDIS_HOST || 'redis://localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        
        // CRITICAL FIX: Conditionally enable Redis based on the environment variable
        enabled: !disableRedisCache, 
        
        // Keep maxRequests for tracking, even if disabled
        maxRequests: 500000, 
    },

    // ...
};
