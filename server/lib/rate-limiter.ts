import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { logger } from './logger';

/**
 * Configuration for Redis client used for rate limiting
 */
let redisClient: ReturnType<typeof createClient> | null = null;

// Setup Redis client if REDIS_URL is provided
if (process.env.REDIS_URL) {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis client error', { error: err.message });
    });
    
    redisClient.connect().catch((err) => {
      logger.error('Redis connection error', { error: err.message });
      redisClient = null;
    });
  } catch (error: any) {
    logger.error('Redis client creation error', { error: error.message });
    redisClient = null;
  }
}

/**
 * Creates an adaptive rate limiter based on environment and available resources
 * Will use Redis if available, otherwise falls back to memory store
 * Provides more lenient limits in development
 */
export function adaptiveRateLimiter() {
  const isProd = process.env.NODE_ENV === 'production';
  const windowMs = isProd ? 15 * 60 * 1000 : 5 * 60 * 1000; // 15 minutes in prod, 5 minutes in dev
  const max = isProd ? 100 : 500; // 100 requests per window in prod, 500 in dev
  
  const options: any = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      message: 'Too many requests, please try again later.',
    },
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  };
  
  // Use Redis store if client is available
  if (redisClient) {
    logger.info('Using Redis store for rate limiting');
    options.store = new RedisStore({
      sendCommand: (...args: any[]) => redisClient!.sendCommand(args),
    });
  } else {
    logger.info('Using memory store for rate limiting');
  }
  
  return rateLimit(options);
} 