import { Request, Response, NextFunction } from 'express';
import { verifyIdToken } from '../lib/firebase-admin';
import { logger } from '../lib/logger';
import { AppError } from '../lib/error-handling';

// Add user to request object
declare module 'express' {
  interface Request {
    user?: {
      uid: string;
      email?: string;
      emailVerified?: boolean;
      displayName?: string;
      photoURL?: string;
      phoneNumber?: string;
      disabled?: boolean;
      admin?: boolean;
    };
  }
}

/**
 * Middleware to check if a user is authenticated
 * Verifies the Firebase ID token in the Authorization header
 * If valid, attaches the user object to the request
 */
export async function checkAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized access attempt - no valid token', 'auth/no-token');
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      throw new AppError('Unauthorized access attempt - empty token', 'auth/empty-token');
    }
    
    try {
      const decodedToken = await verifyIdToken(idToken);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
        phoneNumber: decodedToken.phone_number,
      };
      
      // Check if user is an admin (based on custom claims)
      if (decodedToken.admin === true) {
        req.user.admin = true;
      }
      
      next();
    } catch (error: any) {
      logger.warn('Token verification failed', { 
        error: error.message,
        code: error.code
      });
      throw new AppError('Unauthorized access attempt - invalid token', 'auth/invalid-token');
    }
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(401).json({ 
        error: error.message,
        code: error.code
      });
    }
    
    return res.status(401).json({ 
      error: 'Unauthorized access attempt',
      code: 'auth/unauthorized'
    });
  }
}

/**
 * Middleware to check if a user is an admin
 * Must be used after checkAuthenticated
 */
export function checkAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'auth/no-user'
    });
  }
  
  if (!req.user.admin) {
    return res.status(403).json({ 
      error: 'Admin access required',
      code: 'auth/forbidden'
    });
  }
  
  next();
} 