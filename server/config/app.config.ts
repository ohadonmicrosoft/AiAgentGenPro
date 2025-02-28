import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Application configuration object derived from environment variables
 */
export const appConfig = {
  /**
   * Node environment (development, production, test)
   */
  environment: process.env.NODE_ENV || 'development',
  
  /**
   * Server port
   */
  port: parseInt(process.env.PORT || process.env.SERVER_PORT || '5000', 10),
  
  /**
   * Whether to use mock storage instead of actual database
   */
  useMockStorage: process.env.USE_MOCK_STORAGE === 'true',
  
  /**
   * Database configuration
   */
  database: {
    url: process.env.DATABASE_URL || '',
    // For additional database options if needed
  },
  
  /**
   * Redis configuration
   */
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    // For additional Redis options if needed
  },
  
  /**
   * Firebase configuration
   */
  firebase: {
    databaseURL: process.env.FIREBASE_DATABASE_URL || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || undefined,
    // For additional Firebase options if needed
  },
  
  /**
   * Logging configuration
   */
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    // For additional logging options if needed
  },
  
  /**
   * CORS configuration
   */
  cors: {
    // In production, you might want to restrict this to specific origins
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.CLIENT_URL || '', 'https://ai-agent-gen-pro.firebaseapp.com'] 
      : true,
    credentials: true,
  },

  /**
   * API configuration
   */
  api: {
    basePath: '/api',
    version: '1',
  },

  /**
   * Whether the server is running in production mode
   */
  isProduction: process.env.NODE_ENV === 'production',
  
  /**
   * Whether the server is running in development mode
   */
  isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
  
  /**
   * Whether the server is running in test mode
   */
  isTest: process.env.NODE_ENV === 'test',
}; 