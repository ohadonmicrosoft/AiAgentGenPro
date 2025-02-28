import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/firebase-admin';
import { UnauthorizedError } from '../lib/error-handling';
import { config } from '../config/app.config';
import { logger } from '../lib/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        email_verified?: boolean;
        admin?: boolean;
        [key: string]: any;
      };
    }
  }
}

/**
 * Middleware to verify Firebase auth token
 * Attaches user data to req.user if authentication successful
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip auth check in test environment with mock storage
    if (config.useMockStorage) {
      logger.debug('Using mock authentication in test environment');
      req.user = {
        uid: 'test-user-id',
        email: 'test@example.com',
        email_verified: true,
      };
      return next();
    }
    
    // Get the auth token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No authorization token provided');
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      throw new UnauthorizedError('Invalid authorization token format');
    }
    
    // Verify the token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Attach user data to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
      // Other custom claims (like admin status) would be available here
      ...(decodedToken.admin && { admin: true }),
    };
    
    next();
  } catch (error) {
    // Handle Firebase Auth specific errors
    if (error instanceof Error) {
      logger.error(`Authentication error: ${error.message}`, { stack: error.stack });
      
      if (error.message.includes('auth/id-token-expired')) {
        return next(new UnauthorizedError('Authentication token expired'));
      }
      
      if (error.message.includes('auth/')) {
        return next(new UnauthorizedError('Invalid authentication token'));
      }
    }
    
    next(error);
  }
};

/**
 * Middleware to check if a user has admin role
 * Must be used after authMiddleware
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }
  
  if (!req.user.admin) {
    return next(new UnauthorizedError('Admin access required'));
  }
  
  next();
}; 